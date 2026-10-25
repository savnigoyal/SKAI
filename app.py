from __future__ import annotations

import os
import sqlite3
from datetime import date, datetime, timedelta
from functools import wraps
from pathlib import Path

from flask import Flask, abort, flash, g, redirect, render_template, request, session, url_for
from werkzeug.security import check_password_hash, generate_password_hash

BASE_DIR = Path(__file__).resolve().parent

app = Flask(__name__, instance_relative_config=True)
app.config.update(
    SECRET_KEY=os.environ.get("FLASK_SECRET_KEY", "dev-only-change-this-before-deployment"),
    PERMANENT_SESSION_LIFETIME=timedelta(hours=8),
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SAMESITE="Lax",
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
        """
    )
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
        "SELECT id, full_name, email, student_id, room_no, hostel_block, role, is_active FROM users WHERE id = ?",
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
