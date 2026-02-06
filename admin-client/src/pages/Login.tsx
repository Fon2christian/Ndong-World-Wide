import { useState, useEffect, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { LoginCredentials } from '../types';

export default function Login() {
  const { login, inactivityLogout, clearInactivityFlag } = useAuth();
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showInactivityMessage, setShowInactivityMessage] = useState(false);

  useEffect(() => {
    if (inactivityLogout) {
      setShowInactivityMessage(true);
      clearInactivityFlag();
      // Auto-hide message after 5 seconds
      const timer = setTimeout(() => {
        setShowInactivityMessage(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [inactivityLogout, clearInactivityFlag]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(credentials);
    } catch (err: any) {
      // Check for rate limiting error
      if (err.response?.status === 429) {
        setError('Too many requests. Please wait a few minutes before trying again.');
      } else {
        setError(err.response?.data?.message || 'Login failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Ndong World Wide</h1>
          <p>Admin Dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {showInactivityMessage && (
            <div style={{
              padding: '0.75rem 1rem',
              marginBottom: '1rem',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '8px',
              color: '#3b82f6',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}>
              You've been logged out due to inactivity. Please login again.
            </div>
          )}

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={credentials.email}
              onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
              required
              autoComplete="email"
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={credentials.password}
              onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              required
              autoComplete="current-password"
              disabled={isLoading}
            />
          </div>

          <div style={{ textAlign: 'right', marginTop: '-0.5rem', marginBottom: '1rem' }}>
            <Link
              to="/forgot-password"
              style={{ fontSize: '0.875rem', color: 'var(--color-primary)', textDecoration: 'none' }}
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>

          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              Don't have an account?{' '}
            </span>
            <Link
              to="/register"
              style={{
                color: 'var(--color-primary)',
                textDecoration: 'none',
                fontSize: '0.875rem',
                fontWeight: '600'
              }}
            >
              Create Account
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
