"""
AI Service — Roboflow Hosted Inference integration.

Wraps the Roboflow `inference_sdk` client in a reusable AIService class so
the rest of the app can request a defect-detection prediction for a fabric
frame without knowing anything about Roboflow's API shape.

This module is a pure external-service wrapper: it does not touch the
database, ESP32, or any router. It will be consumed later by
services/detection_service.py, which is responsible for orchestrating
detect -> persist -> (maybe) trigger ESP32.
"""

import logging
from pathlib import Path

from inference_sdk import InferenceHTTPClient

from app.core.config import settings

logger = logging.getLogger("fabricon")


class AIServiceError(Exception):
    """Raised when the Roboflow hosted inference call fails or is misconfigured.

    Callers should catch this specifically (rather than a bare Exception)
    so a Roboflow outage or bad config can be handled distinctly from a
    programming error elsewhere in the request.
    """


class AIService:
    """Reusable wrapper around the Roboflow hosted inference API.

    The underlying `InferenceHTTPClient` is created once in `__init__` and
    reused for every `detect_defect()` call made on that instance. A single
    shared instance (see `ai_service` at the bottom of this module) is what
    the rest of the app should import and use.
    """

    def __init__(self) -> None:
        if not settings.ROBOFLOW_API_KEY:
            raise AIServiceError(
                "ROBOFLOW_API_KEY is not set. Add it to .env before using AIService."
            )
        if not settings.ROBOFLOW_MODEL_ID:
            raise AIServiceError(
                "ROBOFLOW_MODEL_ID is not set. Add it to .env before using AIService."
            )

        self.model_id = settings.ROBOFLOW_MODEL_ID

        logger.info(
            "Initializing Roboflow inference client (api_url=%s, model_id=%s)",
            settings.ROBOFLOW_API_URL,
            self.model_id,
        )
        self.client = InferenceHTTPClient(
            api_url=settings.ROBOFLOW_API_URL,
            api_key=settings.ROBOFLOW_API_KEY,
        )

    def detect_defect(self, image_path: str) -> dict:
        """Sends a single fabric frame to the Roboflow hosted model.

        Args:
            image_path: Filesystem path to the image to run inference on.

        Returns:
            The complete, unmodified prediction response dict from Roboflow
            (shape is whatever the hosted model returns -- typically
            includes "predictions", image dimensions, and timing info).
            Intentionally not normalized/reshaped here so no information is
            lost before it reaches the detection orchestrator.

        Raises:
            AIServiceError: if `image_path` doesn't exist or the Roboflow
                API call fails for any reason. The underlying exception is
                always logged first, so the root cause is visible in the
                server logs even though the backend itself keeps running.
        """
        if not Path(image_path).is_file():
            raise AIServiceError(f"Image path does not exist: {image_path}")

        try:
            result = self.client.infer(image_path, model_id=self.model_id)
        except Exception as exc:  # noqa: BLE001 - any Roboflow/network failure must not crash the backend
            logger.error(
                "Roboflow inference call failed (model_id=%s, image_path=%s): %s",
                self.model_id,
                image_path,
                exc,
                exc_info=True,
            )
            raise AIServiceError(f"Roboflow inference failed: {exc}") from exc

        logger.info(
            "Roboflow inference succeeded (model_id=%s, image_path=%s)",
            self.model_id,
            image_path,
        )
        return result


# Shared singleton instance. Created lazily (only when this attribute is
# first accessed) rather than at import time, so importing this module
# never fails just because ROBOFLOW_API_KEY/ROBOFLOW_MODEL_ID aren't set
# yet -- the config error only surfaces when the AI service is actually used.
_ai_service_instance: "AIService | None" = None


def get_ai_service() -> AIService:
    """Returns the shared AIService instance, creating it on first call only.

    Other modules (e.g. the future detection_service.py) should call this
    instead of instantiating AIService() directly, so the Roboflow client
    stays a true singleton across the app.
    """
    global _ai_service_instance
    if _ai_service_instance is None:
        _ai_service_instance = AIService()
    return _ai_service_instance