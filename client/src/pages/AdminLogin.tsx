import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login, isAdmin } = useAuth();
  const navigate = useNavigate();

  // Read actual demo credentials from environment
  const demoUsername = import.meta.env.VITE_DEMO_ADMIN_USERNAME || "admin";
  const demoPassword = import.meta.env.VITE_DEMO_ADMIN_PASSWORD || "admin123";

  // Redirect if already logged in (use Navigate component to avoid render side-effects)
  if (isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const success = login(username, password);
    if (success) {
      navigate("/admin");
    } else {
      setError("Invalid username or password");
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        {/* Demo Warning Banner - Only show in development mode */}
        {import.meta.env.DEV && (
          <div style={{
            backgroundColor: '#FEF3C7',
            border: '2px solid #F59E0B',
            borderRadius: '8px',
            padding: '12px 16px',
            marginBottom: '24px',
            color: '#92400E'
          }}>
            <strong>⚠️ DEMO ONLY:</strong> This is a demonstration authentication system.
            Default credentials: <code>{demoUsername}</code> / <code>{demoPassword}</code>
          </div>
        )}

        <div className="login-header">
          <div className="login-icon">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <h1>Admin Login</h1>
          <p>Sign in to access the admin dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="login-error">{error}</div>}

          <div className="form__group">
            <label className="form__label" htmlFor="username">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="form__input"
              placeholder="Enter username"
              required
            />
          </div>

          <div className="form__group">
            <label className="form__label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form__input"
              placeholder="Enter password"
              required
            />
          </div>

          <button type="submit" className="btn btn--primary login-btn">
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
