"""
Detection router.

POST /api/detection/analyze accepts a single image upload, runs it through
DetectionService -> AIService -> Database, and returns both the raw
Roboflow prediction and the Detection row that was saved for it.
"""

import logging

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.database.models import Admin
from app.schemas.detection_schema import DetectionAnalyzeResponse
from app.services.ai_service import AIServiceError
from app.services.auth_service import get_current_admin
from app.services.detection_service import (
    DetectionPersistenceError,
    DetectionValidationError,
    analyze_frame,
)

logger = logging.getLogger("fabricon")

router = APIRouter(prefix="/api/detection", tags=["Detection"])


@router.post(
    "/analyze",
    response_model=DetectionAnalyzeResponse,
    summary="Analyze a Single Fabric Frame",
    description=(
        "Accepts one image upload, sends it to the Roboflow hosted model via "
        "AIService, saves the resulting detection to the database, and returns "
        "both the raw prediction and the saved record."
    ),
)
async def analyze(
    file: UploadFile = File(..., description="Image of the fabric frame to analyze."),
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
):
    """Protected endpoint: runs one uploaded frame through the AI service and persists it.

    Error mapping:
      - DetectionValidationError (missing/empty/non-image upload) -> 400
      - AIServiceError (bad AI config, Roboflow unreachable/failed)  -> 502
      - DetectionPersistenceError (inference succeeded, DB save failed) -> 500
      - Anything else unexpected is left to propagate to the app's global
        exception handler (app/middleware/error_handler.py), which logs it
        and returns a generic 500 without leaking a traceback.
    """
    try:
        prediction, detection = await analyze_frame(file, db)
    except DetectionValidationError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)
        ) from exc
    except AIServiceError as exc:
        logger.error("Detection analyze failed due to AI service error: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"AI service failed: {exc}",
        ) from exc
    except DetectionPersistenceError as exc:
        logger.error("Detection analyze failed to persist: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(exc),
        ) from exc

    return DetectionAnalyzeResponse(
        success=True,
        filename=file.filename,
        prediction=prediction,
        detection=detection,
    )