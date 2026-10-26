import { useState } from "react";
import { login } from "../services/authService";

export default function Login({ onLoginSuccess }) {
  const [role, setRole] = useState("student");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const user = await login({
        identifier: identifier.trim(),
        password,
        role,
      });

      onLoginSuccess(user);
    } catch (err) {
      setError(err.message || "Unable to log in. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-brand">
          <div className="auth-logo">S</div>
          <div>
            <h1>SKAI</h1>
            <p>MESS MANAGEMENT</p>
          </div>
        </div>

        <header className="auth-heading">
          <p className="auth-eyebrow">WELCOME BACK</p>
          <h2>Sign in to your account</h2>
          <p>Access your hostel mess portal.</p>
        </header>

        <div className="auth-role-toggle" aria-label="Account type">
          <button
            type="button"
            className={role === "student" ? "selected" : ""}
            aria-pressed={role === "student"}
            onClick={() => {
              setRole("student");
              setError("");
            }}
          >
            Student
          </button>

          <button
            type="button"
            className={role === "manager" ? "selected" : ""}
            aria-pressed={role === "manager"}
            onClick={() => {
              setRole("manager");
              setError("");
            }}
          >
            Mess Manager
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <label htmlFor="login-identifier">
            Email or Student ID
          </label>
          <input
            id="login-identifier"
            type="text"
            autoComplete="username"
            value={identifier}
            onChange={(event) => setIdentifier(event.target.value)}
            placeholder="Enter your email or student ID"
            required
          />

          <label htmlFor="login-password">Password</label>
          <input
            id="login-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter your password"
            required
          />

          {error && (
            <p className="auth-error" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="auth-submit"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="auth-footer">
          Need help accessing your account? Contact your mess administrator.
        </p>
      </section>
    </main>
  );
}