"""
Infrastructure test — confirms the app boots and /health responds.
This is the one "real" test in this foundation pass; the rest are
placeholders for logic that doesn't exist yet.
"""

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health_check_returns_ok():
    response = client.get("/health")
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "ok"
    assert body["app"] == "Fabricon"
