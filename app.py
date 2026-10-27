from __future__ import annotations

import hashlib
import os
import re
import secrets
import smtplib
import sqlite3
from datetime import date, datetime, timedelta
from email.message import EmailMessage
from functools import wraps
from pathlib import Path
from urllib.parse import urlencode

from flask import (
    Flask, abort, flash, g, jsonify, redirect,
    render_template, request, session, url_for
)
from flask_cors import CORS
from werkzeug.security import check_password_hash, generate_password_hash

BASE_DIR = Path(__file__).resolve().parent

app = Flask(__name__, instance_relative_config=True)
app.config.update(
    SECRET_KEY=os.environ.get("FLASK_SECRET_KEY", "dev-only-change-this-before-deployment"),
    PERMANENT_SESSION_LIFETIME=timedelta(hours=8),
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SAMESITE="Lax",
)
CORS(
    app,
    origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    supports_credentials=True
)
Path(app.instance_path).mkdir(parents=True, exist_ok=True)
DATABASE = os.environ.get("MESS_DATABASE_PATH", str(Path(app.instance_path) / "mess.db"))

# DEMONSTRATION MENU ONLY. Replace this with Person 2's published-menu API at integration.
SAMPLE_MENU = {
    "Monday": ("Poha and chai", "Dal, rice and seasonal sabzi", "Roti, paneer and salad"),
    "Tuesday": ("Idli and sambar", "Rajma and rice", "Vegetable pulao and raita"),
    "Wednesday": ("Aloo paratha and curd", "Chole, rice and salad", "Dal, roti and bhindi"),
    "Thursday": ("Upma and fruit", "Kadhi and rice", "Paneer, roti and salad"),
    "Friday": ("Sandwich and milk", "Dal, rice and seasonal sabzi", "Veg pulao and raita"),
    "Saturday": ("Dosa and sambar", "Chole and rice", "Roti, mixed vegetables and dal"),
    "Sunday": ("Puri and aloo sabzi", "Biryani and raita", "Khichdi and curd"),
}
MEALS = ("Breakfast", "Lunch", "Dinner")


def connect_db() -> sqlite3.Connection:
    db = sqlite3.connect(DATABASE)
    db.row_factory = sqlite3.Row
    db.execute("PRAGMA foreign_keys = ON")
    return db


def init_db() -> None:
    db = connect_db()
    db.executescript(
        """
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            full_name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE COLLATE NOCASE,
            student_id TEXT UNIQUE COLLATE NOCASE,
            room_no TEXT,
            hostel_block TEXT,
            year TEXT,
            department TEXT,
            role TEXT NOT NULL CHECK(role IN ('student', 'manager')),
            password_hash TEXT NOT NULL,
            is_active INTEGER NOT NULL DEFAULT 1,
            failed_attempts INTEGER NOT NULL DEFAULT 0,
            locked_until TEXT,
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS login_audit (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            identifier TEXT NOT NULL,
            event_type TEXT NOT NULL CHECK(event_type IN ('login', 'logout')),
            success INTEGER NOT NULL,
            ip_address TEXT,
            occurred_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE SET NULL
        );
        CREATE TABLE IF NOT EXISTS password_reset_tokens (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            token_hash TEXT NOT NULL UNIQUE,
            expires_at TEXT NOT NULL,
            used_at TEXT,
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
        );
        """
    )
    # Additive migrations preserve existing databases and user records.
    existing_user_columns = {row["name"] for row in db.execute("PRAGMA table_info(users)").fetchall()}
    if "year" not in existing_user_columns:
        db.execute("ALTER TABLE users ADD COLUMN year TEXT")
    if "department" not in existing_user_columns:
        db.execute("ALTER TABLE users ADD COLUMN department TEXT")
    db.commit()
    db.close()


def seed_demo_users() -> None:
    """Create demo logins if they do not already exist. These are for local demo only."""
    init_db()
    db = connect_db()
    demo_users = [
        ("Demo Student", "student@example.com", "STU1001", "B-204", "Block B", "student", "Student@123"),
        ("Demo Mess Manager", "manager@example.com", None, None, None, "manager", "Manager@123"),
    ]
    for name, email, student_id, room_no, hostel_block, role, password in demo_users:
        db.execute(
            """INSERT OR IGNORE INTO users
               (full_name, email, student_id, room_no, hostel_block, role, password_hash)
               VALUES (?, ?, ?, ?, ?, ?, ?)""",
            (name, email, student_id, room_no, hostel_block, role, generate_password_hash(password)),
        )
    db.commit()
    db.close()


def get_db() -> sqlite3.Connection:
    if "db" not in g:
        g.db = connect_db()
    return g.db


@app.teardown_appcontext
def close_db(_error=None) -> None:
    db = g.pop("db", None)
    if db is not None:
        db.close()


def current_user():
    user_id = session.get("user_id")
    if not user_id:
        return None
    return get_db().execute(
        "SELECT id, full_name, email, student_id, room_no, hostel_block, year, department, role, is_active FROM users WHERE id = ?",
        (user_id,),
    ).fetchone()


def login_required(view):
    @wraps(view)
    def wrapped(*args, **kwargs):
        user = current_user()
        if user is None or not user["is_active"]:
            session.clear()
            flash("Please log in to continue.", "error")
            return redirect(url_for("login"))
        return view(*args, **kwargs)
    return wrapped


def role_required(role):
    def decorator(view):
        @wraps(view)
        @login_required
        def wrapped(*args, **kwargs):
            user = current_user()
            if user["role"] != role:
                abort(403)
            return view(*args, **kwargs)
        return wrapped
    return decorator


def log_auth_event(user_id, identifier: str, event_type: str, success: bool) -> None:
    get_db().execute(
        "INSERT INTO login_audit (user_id, identifier, event_type, success, ip_address) VALUES (?, ?, ?, ?, ?)",
        (user_id, identifier[:254], event_type, int(success), request.remote_addr),
    )
    get_db().commit()


def menu_for_current_week():
    today = date.today()
    monday = today - timedelta(days=today.weekday())
    rows = []
    for offset in range(7):
        current_date = monday + timedelta(days=offset)
        day_name = current_date.strftime("%A")
        dishes = SAMPLE_MENU[day_name]
        rows.append({
            "day": day_name,
            "date": current_date.strftime("%d %b"),
            "iso_date": current_date.isoformat(),
            "meals": dict(zip(MEALS, dishes)),
            "is_today": current_date == today,
        })
    return monday, monday + timedelta(days=6), rows


@app.route("/")
def index():
    user = current_user()
    if user:
        return redirect(url_for("manager_dashboard" if user["role"] == "manager" else "dashboard"))
    return redirect(url_for("login"))


@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        identifier = request.form.get("identifier", "").strip()
        password = request.form.get("password", "")
        selected_role = request.form.get("role", "student")
        if selected_role not in ("student", "manager"):
            selected_role = "student"

        if not identifier or not password:
            flash("Enter your email or student ID and password.", "error")
            return render_template("login.html", selected_role=selected_role)

        db = get_db()
        user = db.execute(
            "SELECT * FROM users WHERE email = ? OR student_id = ?",
            (identifier, identifier),
        ).fetchone()
        now = datetime.now()
        valid_user = user is not None and user["is_active"]
        if valid_user and user["locked_until"]:
            try:
                locked_until = datetime.fromisoformat(user["locked_until"])
                if locked_until > now:
                    log_auth_event(user["id"], identifier, "login", False)
                    flash("Unable to log in. Check your credentials or try again later.", "error")
                    return render_template("login.html", selected_role=selected_role)
            except ValueError:
                pass

        password_ok = bool(valid_user and check_password_hash(user["password_hash"], password))
        authenticated = bool(password_ok and user["role"] == selected_role)

        if authenticated:
            db.execute(
                "UPDATE users SET failed_attempts = 0, locked_until = NULL WHERE id = ?",
                (user["id"],),
            )
            log_auth_event(user["id"], identifier, "login", True)
            session.clear()
            session["user_id"] = user["id"]
            session.permanent = True
            destination = "manager_dashboard" if user["role"] == "manager" else "dashboard"
            return redirect(url_for(destination))

        user_id = user["id"] if user else None
        if valid_user:
            failed_attempts = user["failed_attempts"] + 1
            locked_until = (now + timedelta(minutes=15)).isoformat(timespec="seconds") if failed_attempts >= 5 else None
            db.execute(
                "UPDATE users SET failed_attempts = ?, locked_until = ? WHERE id = ?",
                (failed_attempts, locked_until, user["id"]),
            )
        log_auth_event(user_id, identifier, "login", False)
        flash("Unable to log in. Check your credentials and selected account type.", "error")

    selected_role = request.form.get("role", "student") if request.method == "POST" else "student"
    return render_template("login.html", selected_role=selected_role)
@app.get("/api/auth/me")
def api_me():
    user = current_user()

    if not user:
        return jsonify({
            "error": {
                "message": "Authentication required."
            }
        }), 401

    return jsonify({
        "data": {
            "user": {
                "id": user["id"],
                "name": user["full_name"],
                "email": user["email"],
                "role": user["role"],
                "student_id": user["student_id"],
                "hostel_block": user["hostel_block"],
                "room_no": user["room_no"],
                "year": user["year"],
                "department": user["department"]
            }
        }
    }), 200
def _valid_auth_email(email: str) -> bool:
    return bool(re.fullmatch(r"[^@\s]+@[^@\s]+\.[^@\s]+", email or ""))


def _password_policy_error(password: str) -> str | None:
    if not isinstance(password, str) or len(password) < 8:
        return "Password must be at least 8 characters long."
    if not any(character.isalpha() for character in password) or not any(character.isdigit() for character in password):
        return "Password must include at least one letter and one number."
    return None


def _auth_user_payload(user) -> dict:
    return {
        "id": user["id"],
        "name": user["full_name"],
        "email": user["email"],
        "role": user["role"],
        "student_id": user["student_id"],
        "hostel_block": user["hostel_block"],
        "room_no": user["room_no"],
        "year": user["year"],
        "department": user["department"],
    }


def _make_password_reset_url(token: str) -> str:
    frontend_url = os.environ.get("SKAI_FRONTEND_URL", "http://localhost:5173").rstrip("/")
    return f"{frontend_url}/?{urlencode({'reset_token': token})}"


def _send_password_reset_email(to_email: str, full_name: str, reset_url: str) -> bool:
    """Send reset email when SMTP settings exist. Returns False if SMTP is not configured."""
    host = os.environ.get("SMTP_HOST")
    if not host:
        return False

    port = int(os.environ.get("SMTP_PORT", "587"))
    username = os.environ.get("SMTP_USERNAME", "")
    password = os.environ.get("SMTP_PASSWORD", "")
    sender = os.environ.get("SMTP_FROM", username)
    if not sender:
        raise RuntimeError("SMTP_FROM or SMTP_USERNAME must be configured for password-reset email.")

    message = EmailMessage()
    message["Subject"] = "Reset your SKAI password"
    message["From"] = sender
    message["To"] = to_email
    message.set_content(
        f"Hello {full_name},\n\n"
        "We received a request to reset your SKAI Mess Management password. "
        "Use the link below within 30 minutes to set a new password:\n\n"
        f"{reset_url}\n\n"
        "If you did not request this, you can ignore this email.\n"
    )

    use_tls = os.environ.get("SMTP_USE_TLS", "true").lower() in ("1", "true", "yes")
    with smtplib.SMTP(host, port, timeout=10) as server:
        if use_tls:
            server.starttls()
        if username:
            server.login(username, password)
        server.send_message(message)
    return True


@app.post("/api/auth/register")
def api_register_student():
    """Create a student account. Public registration can never create a manager."""
    data = request.get_json(silent=True) or {}
    full_name = str(data.get("full_name") or "").strip()
    student_id = str(data.get("student_id") or "").strip()
    email = str(data.get("email") or "").strip().lower()
    hostel_block = str(data.get("hostel_block") or "").strip()
    room_no = str(data.get("room_no") or "").strip()
    year = str(data.get("year") or "").strip()
    department = str(data.get("department") or "").strip()
    password = data.get("password", "")

    if not all((full_name, student_id, email, hostel_block, room_no, year, department, password)):
        return jsonify({"error": {"message": "Complete all required registration fields."}}), 400
    if len(full_name) > 100 or len(student_id) > 50 or len(email) > 254 or len(hostel_block) > 50 or len(room_no) > 30 or len(year) > 30 or len(department) > 100:
        return jsonify({"error": {"message": "One or more fields are too long."}}), 400
    if not _valid_auth_email(email):
        return jsonify({"error": {"message": "Enter a valid email address."}}), 400
    password_error = _password_policy_error(password)
    if password_error:
        return jsonify({"error": {"message": password_error}}), 400

    db = connect_db()
    try:
        cursor = db.execute(
            """INSERT INTO users
               (full_name, email, student_id, room_no, hostel_block, year, department, role, password_hash)
               VALUES (?, ?, ?, ?, ?, ?, ?, 'student', ?)""",
            (full_name, email, student_id, room_no, hostel_block, year, department, generate_password_hash(password)),
        )
        db.commit()
        new_user = db.execute(
            "SELECT id, full_name, email, student_id, room_no, hostel_block, year, department, role FROM users WHERE id = ?",
            (cursor.lastrowid,),
        ).fetchone()
        user_payload = _auth_user_payload(new_user)
    except sqlite3.IntegrityError:
        db.rollback()
        return jsonify({"error": {"message": "An account with that email or student ID already exists."}}), 409
    finally:
        db.close()

    # Log the newly registered student in immediately.
    session.clear()
    session["user_id"] = user_payload["id"]
    session["role"] = "student"
    session.permanent = True
    return jsonify({"data": {"user": user_payload}}), 201


@app.post("/api/auth/forgot-password")
def api_forgot_password():
    data = request.get_json(silent=True) or {}
    email = str(data.get("email", "")).strip().lower()
    if not _valid_auth_email(email):
        return jsonify({"error": {"message": "Enter a valid email address."}}), 400

    production = os.environ.get("SKAI_ENV", "development").lower() == "production"
    smtp_configured = bool(os.environ.get("SMTP_HOST"))
    if production and not smtp_configured:
        return jsonify({"error": {"message": "Password recovery is not configured. Contact the system administrator."}}), 503

    generic_message = "If an active account matches that email, password-reset instructions have been prepared."
    response_data = {"message": generic_message}
    db = connect_db()
    try:
        user = db.execute(
            "SELECT id, email, full_name FROM users WHERE email = ? COLLATE NOCASE AND is_active = 1",
            (email,),
        ).fetchone()
        if user:
            token = secrets.token_urlsafe(32)
            token_hash = hashlib.sha256(token.encode("utf-8")).hexdigest()
            now = datetime.now()
            expires_at = (now + timedelta(minutes=30)).isoformat(timespec="seconds")
            now_text = now.isoformat(timespec="seconds")
            db.execute(
                "UPDATE password_reset_tokens SET used_at = ? WHERE user_id = ? AND used_at IS NULL",
                (now_text, user["id"]),
            )
            db.execute(
                "INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)",
                (user["id"], token_hash, expires_at),
            )
            db.commit()
            reset_url = _make_password_reset_url(token)
        else:
            reset_url = None
    finally:
        db.close()

    if user:
        email_sent = False
        if smtp_configured:
            try:
                email_sent = _send_password_reset_email(user["email"], user["full_name"], reset_url)
            except Exception:
                app.logger.exception("Unable to send SKAI password-reset email")
        # Local demo only: this link is exposed to make the flow testable without SMTP.
        # Set SKAI_ENV=production and configure SMTP before any public deployment.
        if not email_sent and not production:
            response_data["development_reset_url"] = reset_url

    return jsonify({"data": response_data}), 200


@app.post("/api/auth/reset-password")
def api_reset_password():
    data = request.get_json(silent=True) or {}
    token = str(data.get("token") or "").strip()
    password = data.get("password", "")
    if not token:
        return jsonify({"error": {"message": "A password-reset token is required."}}), 400
    password_error = _password_policy_error(password)
    if password_error:
        return jsonify({"error": {"message": password_error}}), 400

    token_hash = hashlib.sha256(token.encode("utf-8")).hexdigest()
    db = connect_db()
    try:
        reset_row = db.execute(
            """SELECT prt.id, prt.user_id, prt.expires_at, prt.used_at, u.is_active
               FROM password_reset_tokens prt JOIN users u ON u.id = prt.user_id
               WHERE prt.token_hash = ?""",
            (token_hash,),
        ).fetchone()
        if not reset_row or reset_row["used_at"] or not reset_row["is_active"]:
            return jsonify({"error": {"message": "This reset link is invalid or has already been used. Request a new one."}}), 400
        try:
            expired = datetime.fromisoformat(reset_row["expires_at"]) <= datetime.now()
        except (TypeError, ValueError):
            expired = True
        if expired:
            return jsonify({"error": {"message": "This reset link has expired. Request a new one."}}), 400

        now_text = datetime.now().isoformat(timespec="seconds")
        db.execute(
            "UPDATE users SET password_hash = ?, failed_attempts = 0, locked_until = NULL WHERE id = ?",
            (generate_password_hash(password), reset_row["user_id"]),
        )
        # Mark this and any older outstanding reset tokens as used (one-time semantics).
        db.execute(
            "UPDATE password_reset_tokens SET used_at = ? WHERE user_id = ? AND used_at IS NULL",
            (now_text, reset_row["user_id"]),
        )
        db.commit()
    finally:
        db.close()

    return jsonify({"data": {"message": "Password reset successfully. Sign in with your new password."}}), 200


@app.post("/api/auth/login")
def api_login():
    data = request.get_json(silent=True) or {}

    identifier = str(data.get("identifier", "")).strip()
    password = data.get("password", "")
    selected_role = str(data.get("role", "student")).lower()

    if not identifier or not password:
        return jsonify({
            "error": {"message": "Identifier and password are required."}
        }), 400

    if selected_role not in ("student", "manager"):
        return jsonify({
            "error": {"message": "Invalid account type."}
        }), 400

    db = connect_db()
    try:
        user = db.execute(
            "SELECT * FROM users WHERE email = ? OR student_id = ?",
            (identifier, identifier)
        ).fetchone()
    finally:
        db.close()

    if (
        not user
        or not user["is_active"]
        or not check_password_hash(user["password_hash"], password)
        or user["role"] != selected_role
    ):
        log_auth_event(
            user["id"] if user else None,
            identifier,
            "login",
            False
        )
        return jsonify({
            "error": {"message": "Unable to log in. Check your credentials."}
        }), 401

    log_auth_event(user["id"], identifier, "login", True)

    session.clear()
    session["user_id"] = user["id"]
    session["role"] = user["role"]
    session.permanent = True

    return jsonify({
        "data": {
            "user": {
                "id": user["id"],
                "name": user["full_name"],
                "email": user["email"],
                "role": user["role"],
                "student_id": user["student_id"],
                "hostel_block": user["hostel_block"],
                "room_no": user["room_no"],
                "year": user["year"],
                "department": user["department"]
            }
        }
    }), 200
@app.post("/logout")
@login_required
def logout():
    user = current_user()
    log_auth_event(user["id"], user["email"], "logout", True)
    session.clear()
    flash("You have logged out.", "success")
    return redirect(url_for("login"))


@app.route("/dashboard")
@role_required("student")
def dashboard():
    user = current_user()
    week_start, week_end, menu_rows = menu_for_current_week()
    today = date.today().strftime("%A")
    today_row = next((row for row in menu_rows if row["day"] == today), menu_rows[0])
    return render_template(
        "dashboard.html", user=user, today_row=today_row, week_start=week_start,
        week_end=week_end, menu_rows=menu_rows,
    )


@app.route("/manager")
@role_required("manager")
def manager_dashboard():
    return render_template("manager_dashboard.html", user=current_user())


@app.route("/weekly-menu")
@login_required
def weekly_menu():
    user = current_user()
    week_start, week_end, menu_rows = menu_for_current_week()
    return render_template(
        "weekly_menu.html", user=user, week_start=week_start, week_end=week_end,
        menu_rows=menu_rows,
    )


@app.route("/profile")
@login_required
def profile():
    return render_template("profile.html", user=current_user())


@app.errorhandler(403)
def forbidden(_error):
    return render_template("403.html"), 403


@app.cli.command("init-db")
def init_db_command():
    init_db()
    print(f"Database initialized at {DATABASE}")


@app.cli.command("seed-demo")
def seed_demo_command():
    seed_demo_users()
    print("Demo accounts ready (local use only): student@example.com / Student@123; manager@example.com / Manager@123")


# Initialise the schema when running locally. Seed accounts separately with `flask --app app seed-demo`.
with app.app_context():
    init_db()

if __name__ == "__main__":
    app.run(debug=True)
