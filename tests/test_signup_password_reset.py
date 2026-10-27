from datetime import datetime, timedelta
from urllib.parse import parse_qs, urlparse

import pytest

import app as app_module


@pytest.fixture()
def client(tmp_path, monkeypatch):
    monkeypatch.setattr(app_module, "DATABASE", str(tmp_path / "test-mess.db"))
    monkeypatch.setenv("SKAI_ENV", "development")
    monkeypatch.delenv("SMTP_HOST", raising=False)
    app_module.app.config.update(TESTING=True, SECRET_KEY="test-only-secret")
    with app_module.app.app_context():
        app_module.init_db()
    with app_module.app.test_client() as test_client:
        yield test_client


def registration_payload(**overrides):
    payload = {
        "full_name": "Test Student",
        "student_id": "23CS9001",
        "email": "test.student@example.edu",
        "hostel_block": "Block C",
        "room_no": "C-101",
        "year": "3rd Year",
        "department": "Computer Science",
        "password": "TestPass123",
    }
    payload.update(overrides)
    return payload


def register(client, **overrides):
    return client.post("/api/auth/register", json=registration_payload(**overrides))


def test_student_registration_creates_profile_and_session(client):
    response = register(client)
    assert response.status_code == 201
    user = response.get_json()["data"]["user"]
    assert user["role"] == "student"
    assert user["student_id"] == "23CS9001"
    assert user["hostel_block"] == "Block C"
    assert user["room_no"] == "C-101"
    assert user["year"] == "3rd Year"
    assert user["department"] == "Computer Science"

    profile = client.get("/api/auth/me")
    assert profile.status_code == 200
    profile_user = profile.get_json()["data"]["user"]
    assert profile_user["email"] == "test.student@example.edu"
    assert profile_user["student_id"] == "23CS9001"


def test_public_registration_cannot_create_manager(client):
    response = register(client, role="manager")
    assert response.status_code == 201
    assert response.get_json()["data"]["user"]["role"] == "student"


def test_duplicate_email_or_student_id_is_rejected(client):
    assert register(client).status_code == 201
    duplicate_email = register(client, student_id="23CS9002")
    assert duplicate_email.status_code == 409
    duplicate_student_id = register(client, email="another@example.edu")
    assert duplicate_student_id.status_code == 409


def test_registration_rejects_invalid_password(client):
    response = register(client, password="short")
    assert response.status_code == 400


def test_unknown_email_gets_generic_password_reset_response(client):
    response = client.post(
        "/api/auth/forgot-password",
        json={"email": "unknown@example.edu"},
    )
    assert response.status_code == 200
    result = response.get_json()["data"]
    assert "If an active account matches" in result["message"]
    assert "development_reset_url" not in result


def test_password_reset_changes_password_and_token_is_one_time(client):
    assert register(client).status_code == 201
    forgot = client.post(
        "/api/auth/forgot-password",
        json={"email": "test.student@example.edu"},
    )
    assert forgot.status_code == 200
    reset_url = forgot.get_json()["data"]["development_reset_url"]
    token = parse_qs(urlparse(reset_url).query)["reset_token"][0]

    reset = client.post(
        "/api/auth/reset-password",
        json={"token": token, "password": "ChangedPass456"},
    )
    assert reset.status_code == 200

    old_login = client.post(
        "/api/auth/login",
        json={"identifier": "test.student@example.edu", "password": "TestPass123", "role": "student"},
    )
    assert old_login.status_code == 401
    new_login = client.post(
        "/api/auth/login",
        json={"identifier": "test.student@example.edu", "password": "ChangedPass456", "role": "student"},
    )
    assert new_login.status_code == 200

    reused = client.post(
        "/api/auth/reset-password",
        json={"token": token, "password": "AnotherPass789"},
    )
    assert reused.status_code == 400


def test_invalid_reset_token_is_rejected(client):
    response = client.post(
        "/api/auth/reset-password",
        json={"token": "not-a-valid-token", "password": "ChangedPass456"},
    )
    assert response.status_code == 400


def test_expired_reset_token_is_rejected(client, monkeypatch):
    assert register(client).status_code == 201
    forgot = client.post(
        "/api/auth/forgot-password",
        json={"email": "test.student@example.edu"},
    )
    reset_url = forgot.get_json()["data"]["development_reset_url"]
    token = parse_qs(urlparse(reset_url).query)["reset_token"][0]

    db = app_module.connect_db()
    try:
        expired_at = (datetime.now() - timedelta(minutes=1)).isoformat(timespec="seconds")
        token_hash = __import__("hashlib").sha256(token.encode("utf-8")).hexdigest()
        db.execute(
            "UPDATE password_reset_tokens SET expires_at = ? WHERE token_hash = ?",
            (expired_at, token_hash),
        )
        db.commit()
    finally:
        db.close()

    response = client.post(
        "/api/auth/reset-password",
        json={"token": token, "password": "ChangedPass456"},
    )
    assert response.status_code == 400
