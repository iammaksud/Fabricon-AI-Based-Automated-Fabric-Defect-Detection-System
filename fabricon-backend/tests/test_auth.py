"""
Auth tests.

Note: this file was previously an empty placeholder despite auth being
fully implemented -- corrected here.

Same scope note as the other test modules: no test-database fixture
exists yet, so these verify what's safely testable against the real app
via TestClient alone -- request validation on /login (which happens
before any DB query, verified empirically) and that /me is protected.
A real login-success test (seeded admin -> real password check -> real
token) belongs in an integration test suite once a test DB fixture exists.
"""

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_login_requires_email_and_password():
    response = client.post("/api/auth/login", json={})
    assert response.status_code == 422


def test_login_rejects_malformed_email():
    response = client.post(
        "/api/auth/login", json={"email": "not-an-email", "password": "x"}
    )
    assert response.status_code == 422


def test_me_requires_authentication():
    response = client.get("/api/auth/me")
    assert response.status_code == 401


def test_me_rejects_invalid_token():
    headers = {"Authorization": "Bearer not-a-real-token"}
    response = client.get("/api/auth/me", headers=headers)
    assert response.status_code == 401