import { useState } from "react";
import {
  login,
  registerStudent,
  requestPasswordReset,
  resetPassword,
} from "../services/authService";

const initialResetToken = () => new URLSearchParams(window.location.search).get("reset_token") || "";

export default function Login({ onLoginSuccess }) {
  const [role, setRole] = useState("student");
  const [view, setView] = useState(() => (initialResetToken() ? "reset" : "login"));
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [hostelBlock, setHostelBlock] = useState("");
  const [roomNo, setRoomNo] = useState("");
  const [year, setYear] = useState("2nd Year");
  const [department, setDepartment] = useState("");
  const [resetToken, setResetToken] = useState(initialResetToken);
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);

  function changeView(nextView) {
    setView(nextView);
    setError("");
    setNotice("");
    setPassword("");
    setConfirmPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
  }

  async function handleLogin(event) {
    event.preventDefault();
    setError("");
    setNotice("");
    setLoading(true);
    try {
      const user = await login({ identifier: identifier.trim(), password, role });
      onLoginSuccess(user);
    } catch (err) {
      setError(err.message || "Unable to log in. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(event) {
    event.preventDefault();
    setError("");
    setNotice("");
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const user = await registerStudent({
        full_name: fullName.trim(),
        student_id: studentId.trim(),
        email: email.trim().toLowerCase(),
        hostel_block: hostelBlock.trim(),
        room_no: roomNo.trim(),
        year,
        department: department.trim(),
        password,
      });
      // Registration creates a student-only account and starts the session.
      onLoginSuccess(user);
    } catch (err) {
      setError(err.message || "Unable to create your account. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword(event) {
    event.preventDefault();
    setError("");
    setNotice("");
    setLoading(true);
    try {
      const result = await requestPasswordReset(email.trim().toLowerCase());
      if (result.development_reset_url) {
        const token = new URL(result.development_reset_url).searchParams.get("reset_token");
        if (token) {
          setResetToken(token);
          setNotice("Local development mode: a reset token was generated for this account. Choose a new password below.");
          setView("reset");
          return;
        }
      }
      setNotice(result.message || "If an active account matches that email, reset instructions have been prepared.");
    } catch (err) {
      setError(err.message || "Unable to request a password reset.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword(event) {
    event.preventDefault();
    setError("");
    setNotice("");
    if (!resetToken) {
      setError("This reset link is missing its token. Request a new password reset link.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const result = await resetPassword({ token: resetToken, password: newPassword });
      window.history.replaceState({}, document.title, window.location.pathname);
      setResetToken("");
      setIdentifier(email.trim());
      setView("login");
      setNotice(result.message || "Password reset successfully. Sign in with your new password.");
    } catch (err) {
      setError(err.message || "Unable to reset your password. The link may have expired.");
    } finally {
      setLoading(false);
    }
  }

  const isLogin = view === "login";
  const isSignup = view === "signup";
  const isForgot = view === "forgot";
  const isReset = view === "reset";

  const heading = isLogin
    ? { eyebrow: "WELCOME BACK", title: "Sign in to your account", subtitle: "Access your hostel mess portal." }
    : isSignup
      ? { eyebrow: "STUDENT REGISTRATION", title: "Create your student account", subtitle: "Enter your student and hostel details to get started." }
      : isForgot
        ? { eyebrow: "ACCOUNT RECOVERY", title: "Forgot your password?", subtitle: "Enter the email address associated with your account." }
        : { eyebrow: "ACCOUNT RECOVERY", title: "Set a new password", subtitle: "Choose a new password for your SKAI account." };

  return (
    <main className={`auth-page ${!isLogin ? "auth-page--form" : ""}`}>
      <section className={`auth-card ${!isLogin ? "auth-card--form" : ""}`}>
        <div className="auth-brand">
          <div className="auth-logo">S</div>
          <div><h1>SKAI</h1><p>MESS MANAGEMENT</p></div>
        </div>

        <header className="auth-heading">
          <p className="auth-eyebrow">{heading.eyebrow}</p>
          <h2>{heading.title}</h2>
          <p>{heading.subtitle}</p>
        </header>

        {isLogin && (
          <div className="auth-role-toggle" aria-label="Account type">
            <button type="button" className={role === "student" ? "selected" : ""} aria-pressed={role === "student"} onClick={() => { setRole("student"); setError(""); }}>
              Student
            </button>
            <button type="button" className={role === "manager" ? "selected" : ""} aria-pressed={role === "manager"} onClick={() => { setRole("manager"); setError(""); }}>
              Mess Manager
            </button>
          </div>
        )}

        {isLogin && (
          <form onSubmit={handleLogin} className="auth-form">
            <label htmlFor="login-identifier">Email or Student ID</label>
            <input id="login-identifier" type="text" autoComplete="username" value={identifier} onChange={(event) => setIdentifier(event.target.value)} placeholder="Enter your email or student ID" required />
            <label htmlFor="login-password">Password</label>
            <input id="login-password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" required />
            {error && <p className="auth-error" role="alert">{error}</p>}
            {notice && <p className="auth-message" role="status">{notice}</p>}
            <button type="submit" className="auth-submit" disabled={loading}>{loading ? "Signing in..." : "Sign in"}</button>
          </form>
        )}

        {isSignup && (
          <form onSubmit={handleRegister} className="auth-form">
            <label htmlFor="signup-name">Full name</label>
            <input id="signup-name" autoComplete="name" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Enter your full name" required maxLength={100} />
            <label htmlFor="signup-student-id">Student ID / Roll number</label>
            <input id="signup-student-id" value={studentId} onChange={(e) => setStudentId(e.target.value)} placeholder="e.g. 23CS123" required maxLength={50} />
            <label htmlFor="signup-email">College email</label>
            <input id="signup-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@college.edu" required maxLength={254} />
            <label htmlFor="signup-block">Hostel block</label>
            <input id="signup-block" value={hostelBlock} onChange={(e) => setHostelBlock(e.target.value)} placeholder="e.g. Block B" required maxLength={50} />
            <label htmlFor="signup-room">Room number</label>
            <input id="signup-room" value={roomNo} onChange={(e) => setRoomNo(e.target.value)} placeholder="e.g. B-206" required maxLength={30} />
            <label htmlFor="signup-year">Year of study</label>
            <select id="signup-year" value={year} onChange={(e) => setYear(e.target.value)} required>
              <option>1st Year</option>
              <option>2nd Year</option>
              <option>3rd Year</option>
              <option>4th Year</option>
              <option>Other</option>
            </select>
            <label htmlFor="signup-department">Department / programme</label>
            <input id="signup-department" value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="e.g. Computer Science" required maxLength={100} />
            <label htmlFor="signup-password">Password (at least 8 characters, including a number)</label>
            <input id="signup-password" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
            <label htmlFor="signup-confirm">Confirm password</label>
            <input id="signup-confirm" type="password" autoComplete="new-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={8} />
            {error && <p className="auth-error" role="alert">{error}</p>}
            <button type="submit" className="auth-submit" disabled={loading}>{loading ? "Creating account..." : "Create student account"}</button>
          </form>
        )}

        {isForgot && (
          <form onSubmit={handleForgotPassword} className="auth-form">
            <label htmlFor="forgot-email">Email address</label>
            <input id="forgot-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your account email" required />
            {error && <p className="auth-error" role="alert">{error}</p>}
            {notice && <p className="auth-message" role="status">{notice}</p>}
            <button type="submit" className="auth-submit" disabled={loading}>{loading ? "Preparing reset..." : "Request password reset"}</button>
          </form>
        )}

        {isReset && (
          <form onSubmit={handleResetPassword} className="auth-form">
            <label htmlFor="reset-password">New password</label>
            <input id="reset-password" type="password" autoComplete="new-password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={8} />
            <label htmlFor="reset-confirm">Confirm new password</label>
            <input id="reset-confirm" type="password" autoComplete="new-password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} required minLength={8} />
            {error && <p className="auth-error" role="alert">{error}</p>}
            {notice && <p className="auth-message" role="status">{notice}</p>}
            <button type="submit" className="auth-submit" disabled={loading}>{loading ? "Updating password..." : "Set new password"}</button>
          </form>
        )}

        <div className="auth-links">
          {isLogin && <>
            <button type="button" className="auth-link" onClick={() => { setEmail(""); changeView("forgot"); }}>Forgot password?</button>
            <p>Don't have a student account? <button type="button" className="auth-link" onClick={() => changeView("signup")}>Sign up</button></p>
          </>}
          {!isLogin && <button type="button" className="auth-link" onClick={() => { changeView("login"); setResetToken(""); window.history.replaceState({}, document.title, window.location.pathname); }}>Back to sign in</button>}
        </div>

        <p className="auth-footer">Need help accessing your account? Contact your mess administrator.</p>
      </section>
    </main>
  );
}
