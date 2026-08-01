"""
Detection Service (orchestrator).

Router -> DetectionService -> AIService -> Database

Turns a single uploaded image into a saved Detection record:
  1. Validates the upload actually looks like an image.
  2. Runs inference via AIService (using a short-lived temp file).
  3. On success: parses the raw Roboflow prediction into defect_type /
     confidence / bounding_boxes / inference_time_ms, persists the image to
     disk, and saves a Detection row via the given DB session.
  4. Returns both the raw Roboflow prediction and the saved Detection row.

Does NOT touch ESP32 yet -- hardware triggers are added in a later pass
once this module is proven out.
"""

import logging
import tempfile
import uuid
from pathlib import Path
from typing import Optional, Tuple

from fastapi import UploadFile
from sqlalchemy.orm import Session

from app.database.models import Detection
from app.services.ai_service import AIServiceError, get_ai_service

logger = logging.getLogger("fabricon")

# Content types accepted as "an image" for POST /api/detection/analyze.
ALLOWED_IMAGE_CONTENT_TYPES = {
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/bmp",
}

# Where analyzed images are permanently stored once a Detection row is saved
# for them (fabricon-backend/uploads/detections/). Kept local to this module
# since it fully owns upload persistence for now; can be promoted to a
# core.config setting later if it needs to be configurable per environment.
UPLOAD_DIR = Path(__file__).resolve().parent.parent.parent / "uploads" / "detections"


class DetectionValidationError(Exception):
    """Raised when the uploaded file fails basic image validation.

    Kept distinct from AIServiceError so the router can tell "bad request
    from the client" (400) apart from "the AI provider failed" (502).
    """


class DetectionPersistenceError(Exception):
    """Raised when a successful prediction could not be saved to the database.

    Kept distinct from the other two exceptions so the router can map it to
    its own status code (500-ish "we analyzed it but couldn't save it")
    rather than being confused with a bad upload or an AI provider failure.
    """


def _validate_image_upload(file: UploadFile) -> None:
    """Validates that `file` looks like a real image before it's processed.

    Checks the client-supplied filename and content type only (cheap, no
    image decoding) -- enough to reject obviously wrong uploads (PDFs,
    text files, missing files) without adding a heavy image-parsing
    dependency to this layer.
    """
    if file is None:
        raise DetectionValidationError("No image file was provided.")

    if not file.filename:
        raise DetectionValidationError("Uploaded file is missing a filename.")

    content_type = (file.content_type or "").lower()
    if content_type not in ALLOWED_IMAGE_CONTENT_TYPES:
        raise DetectionValidationError(
            f"Unsupported file type '{file.content_type}'. "
            "Please upload a JPEG, PNG, WEBP, or BMP image."
        )


def _save_permanent_image(contents: bytes, original_filename: str) -> str:
    """Persists the analyzed image to disk and returns a stable relative path.

    Only called after a successful AI service call, so disk is never
    littered with images for uploads that failed validation or inference.
    A random filename is used to avoid collisions between uploads that
    share the same original filename.
    """
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

    suffix = Path(original_filename).suffix or ".jpg"
    unique_name = f"{uuid.uuid4().hex}{suffix}"
    dest_path = UPLOAD_DIR / unique_name
    dest_path.write_bytes(contents)

    # Store a path relative to the backend project root so it isn't tied to
    # one machine's absolute filesystem layout.
    backend_root = Path(__file__).resolve().parent.parent.parent
    return str(dest_path.relative_to(backend_root))


def _extract_detection_summary(prediction: dict) -> dict:
    """Derives defect_type / confidence / bounding_boxes / inference_time_ms
    from a raw Roboflow object-detection prediction.

    Typical Roboflow shape:
        {
          "time": 0.123,
          "image": {"width": 640, "height": 480},
          "predictions": [
            {"class": "Hole", "confidence": 0.87, "x": .., "y": .., "width": .., "height": ..},
            ...
          ]
        }

    - No predictions at all => clean fabric. Per the Detection model's own
      convention (see database/models.py), defect_type stays NULL. confidence
      is NOT NULL in the schema, so a clean frame is recorded with
      confidence=1.0 ("fully confident nothing was flagged").
    - One or more predictions => defect_type/confidence come from the
      single highest-confidence prediction; bounding_boxes stores the full
      predictions list so no detection is lost even if only one is
      summarized into defect_type.
    """
    predictions = prediction.get("predictions") or []

    inference_time_ms: Optional[float] = None
    raw_time = prediction.get("time")
    if isinstance(raw_time, (int, float)):
        inference_time_ms = round(raw_time * 1000, 3)

    if not predictions:
        return {
            "defect_type": None,
            "confidence": 1.0,
            "bounding_boxes": None,
            "inference_time_ms": inference_time_ms,
        }

    top_prediction = max(predictions, key=lambda p: p.get("confidence", 0) or 0)

    return {
        "defect_type": top_prediction.get("class"),
        "confidence": float(top_prediction.get("confidence", 0.0)),
        "bounding_boxes": predictions,
        "inference_time_ms": inference_time_ms,
    }


async def analyze_frame(file: UploadFile, db: Session) -> Tuple[dict, Detection]:
    """Runs a single uploaded frame through the AI service and persists the result.

    Args:
        file: The uploaded image from the FastAPI request.
        db: Request-scoped SQLAlchemy session (injected by the router via
            the existing `get_db` dependency).

    Returns:
        A tuple of (raw_prediction_dict, saved_detection_orm_row).

    Raises:
        DetectionValidationError: bad/missing/empty upload.
        AIServiceError: the Roboflow call itself failed -- nothing is
            written to the database or disk in this case.
        DetectionPersistenceError: inference succeeded but the DB write
            failed (e.g. MySQL unreachable) -- the session is rolled back.
    """
    _validate_image_upload(file)

    contents = await file.read()
    if not contents:
        raise DetectionValidationError("Uploaded image file is empty.")

    suffix = Path(file.filename).suffix or ".jpg"
    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
        tmp.write(contents)
        tmp_path = tmp.name

    try:
        ai_service = get_ai_service()
        prediction = ai_service.detect_defect(tmp_path)
    finally:
        Path(tmp_path).unlink(missing_ok=True)

    # From here on, inference succeeded -- persist the image and the record.
    image_path = _save_permanent_image(contents, file.filename)
    summary = _extract_detection_summary(prediction)

    detection = Detection(
        defect_type=summary["defect_type"],
        confidence=summary["confidence"],
        bounding_boxes=summary["bounding_boxes"],
        inference_time_ms=summary["inference_time_ms"],
        image_path=image_path,
        detection_status="pending",
        device_id=None,  # No live camera/ESP32 device yet -- nullable per requirements.
    )

    try:
        db.add(detection)
        db.commit()
        db.refresh(detection)
    except Exception as exc:  # noqa: BLE001 - any DB failure must not crash the backend
        db.rollback()
        logger.error(
            "Failed to save detection to database (filename=%s): %s",
            file.filename,
            exc,
            exc_info=True,
        )
        raise DetectionPersistenceError(f"Could not save detection result: {exc}") from exc

    logger.info(
        "Detection saved (id=%s, defect_type=%s, confidence=%.4f, filename=%s)",
        detection.id,
        detection.defect_type,
        detection.confidence,
        file.filename,
    )
    return prediction, detection