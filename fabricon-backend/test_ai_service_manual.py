# test_ai_service_manual.py
#
# Manual smoke test for app/services/ai_service.py — run this directly to
# confirm your ROBOFLOW_API_KEY / ROBOFLOW_MODEL_ID / ROBOFLOW_API_URL are
# correctly configured and Roboflow is reachable, BEFORE relying on the
# full POST /api/detection/analyze endpoint.
#
# Usage:
#   python test_ai_service_manual.py
#
# Requires sample_fabric.jpg to exist in this directory (or edit the path
# below to point at any test image you have).

from app.services.ai_service import get_ai_service, AIServiceError

IMAGE_PATH = "sample_fabric.jpg"

try:
    ai_service = get_ai_service()
    result = ai_service.detect_defect(IMAGE_PATH)
    print("Prediction:", result)
except AIServiceError as e:
    print("AI service failed:", e)