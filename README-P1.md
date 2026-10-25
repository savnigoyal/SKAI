# Person 1 — Authentication & Student Portal (Flask prototype)

This is a quick, runnable Python prototype for the Person 1 module. It includes role-specific login, logout, an eight-hour signed Flask session, basic account lockout after five failed attempts, an authentication audit table, a student dashboard, a profile page, and a read-only sample weekly menu.

**Integration note:** the supplied team documents specify MySQL and a published-menu API owned by Person 2. This starter uses SQLite and illustrative menu data solely to make a local demo runnable quickly. Before final integration, agree on the shared database and connect `/weekly-menu` to Person 2's published-menu API. Do not silently merge a second independent production backend into the team architecture.

## Requirements

- Python 3.10+ (use the version agreed by your team)
- Windows PowerShell, macOS Terminal, or Linux shell

## Windows PowerShell setup

Open a terminal in the folder containing `app.py`:

```powershell
py -3 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
flask --app app seed-demo
flask --app app run --debug
```

If PowerShell blocks activation, you can run the environment's Python directly instead:

```powershell
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe -m flask --app app seed-demo
.\.venv\Scripts\python.exe -m flask --app app run --debug
```

Open the local URL printed in the terminal, normally `http://127.0.0.1:5000`.

## Demo-only credentials

- Student: `student@example.com` / `Student@123`
- Mess Manager: `manager@example.com` / `Manager@123`

These accounts and passwords are for a local classroom demo only. Do not deploy the app with these credentials or the fallback development secret key. Set a strong `FLASK_SECRET_KEY` environment variable before any shared deployment.

## Screens

- `/login` — student or manager login
- `/dashboard` — student dashboard
- `/weekly-menu` — read-only sample menu
- `/profile` — current user's account summary
- `/manager` — manager landing page
- `POST /logout` — logout

The backend enforces roles for `/dashboard` and `/manager`; the UI alone is not relied on for authorization. Five failed login attempts cause a 15-minute lockout for an existing active account. Authentication attempts and logout events are stored in `login_audit`.
