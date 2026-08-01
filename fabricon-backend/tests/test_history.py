"""
History tests.

Same scope note as test_detection.py: no test-database fixture exists yet,
so these verify auth-guarding against the real app via TestClient. Full
filtering/pagination coverage against real data belongs in an integration
test suite once a test DB fixture exists.
"""

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_list_history_requires_authentication():
    response = client.get("/api/history")
    assert response.status_code == 401


def test_get_history_item_requires_authentication():
    response = client.get("/api/history/1")
    assert response.status_code == 401