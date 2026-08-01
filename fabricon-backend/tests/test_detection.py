"""
Detection tests.

Kept deliberately narrow: there's no test-database or Roboflow-mocking
fixture in this project yet, so these tests verify what's safely testable
against the real app via TestClient alone -- that POST /api/detection/analyze
is actually protected. Full happy-path coverage (real upload -> real
Roboflow call -> real DB row) belongs in an integration test suite once a
test DB/mock AI service fixture exists.
"""

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_analyze_requires_authentication():
    """No Authorization header at all -> 401, not 422 or 500."""
    files = {"file": ("test.jpg", b"fake-image-bytes", "image/jpeg")}
    response = client.post("/api/detection/analyze", files=files)
    assert response.status_code == 401


def test_analyze_rejects_invalid_token():
    """A syntactically-present but garbage token -> 401, same as no token."""
    files = {"file": ("test.jpg", b"fake-image-bytes", "image/jpeg")}
    headers = {"Authorization": "Bearer not-a-real-token"}
    response = client.post("/api/detection/analyze", files=files, headers=headers)
    assert response.status_code == 401


def test_analyze_requires_a_file_when_authenticated_path_is_reached():
    """Auth is resolved before FastAPI's own file-required validation on
    this route (verified empirically), so an unauthenticated request with
    no file still returns 401 -- confirming auth guards the endpoint even
    before request-shape validation would otherwise kick in."""
    response = client.post("/api/detection/analyze")
    assert response.status_code == 401