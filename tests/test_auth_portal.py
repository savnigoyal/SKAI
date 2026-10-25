import pytest
import app as app_module


@pytest.fixture
def client(tmp_path, monkeypatch):
    # Use a separate temporary database for tests.
    test_db = tmp_path / "test_mess.db"
    monkeypatch.setattr(app_module, "DATABASE", str(test_db))

    app_module.app.config.update(
        TESTING=True,
        SECRET_KEY="test-secret-key",
    )

    app_module.init_db()
    app_module.seed_demo_users()

    with app_module.app.test_client() as test_client:
        yield test_client


def login_as(client, email, password, role):
    return client.post(
        "/login",
        data={
            "identifier": email,
            "password": password,
            "role": role,
        },
    )


def test_login_page_loads(client):
    response = client.get("/login")
    assert response.status_code == 200


def test_student_login(client):
    response = login_as(
        client, "student@example.com", "Student@123", "student"
    )
    assert response.status_code == 302
    assert response.headers["Location"].endswith("/dashboard")


def test_manager_login(client):
    response = login_as(
        client, "manager@example.com", "Manager@123", "manager"
    )
    assert response.status_code == 302
    assert response.headers["Location"].endswith("/manager")


def test_invalid_password_is_rejected(client):
    response = login_as(
        client, "student@example.com", "wrong-password", "student"
    )
    assert b"Unable to log in" in response.data


def test_dashboard_requires_login(client):
    response = client.get("/dashboard")
    assert response.status_code == 302
    assert response.headers["Location"].endswith("/login")


def test_student_cannot_access_manager_page(client):
    login_as(client, "student@example.com", "Student@123", "student")

    response = client.get("/manager")
    assert response.status_code == 403


def test_manager_cannot_access_student_dashboard(client):
    login_as(client, "manager@example.com", "Manager@123", "manager")

    response = client.get("/dashboard")
    assert response.status_code == 403


def test_student_can_view_profile_and_menu(client):
    login_as(client, "student@example.com", "Student@123", "student")

    assert client.get("/profile").status_code == 200
    assert client.get("/weekly-menu").status_code == 200


def test_logout_ends_session(client):
    login_as(client, "student@example.com", "Student@123", "student")

    response = client.post("/logout")
    assert response.status_code == 302

    response = client.get("/dashboard")
    assert response.status_code == 302
    assert response.headers["Location"].endswith("/login")