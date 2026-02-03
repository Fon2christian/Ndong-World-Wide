import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate email
    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      await axios.post(`${API_URL}/api/admin/forgot-password`, { email });
      setIsSubmitted(true);
    } catch (err: any) {
      // Check for rate limiting error
      if (err.response?.status === 429) {
        setError('Too many requests. Please try again later.');
      } else {
        setError('Something went wrong. Please try again later.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <h1>Check Your Email</h1>
          </div>

          <div style={{ padding: '20px 0' }}>
            <div style={{
              backgroundColor: '#dbeafe',
              color: '#1e40af',
              padding: '16px',
              borderRadius: '8px',
              marginBottom: '20px'
            }}>
              <p style={{ margin: 0, lineHeight: 1.6 }}>
                If an account exists with this email, a password reset link has been sent.
                Please check your email inbox and spam folder.
              </p>
            </div>

            <p style={{ color: '#6b7280', fontSize: '14px', margin: '16px 0' }}>
              The reset link will expire in 1 hour for security reasons.
            </p>

            <Link to="/login" className="btn btn-primary btn-block">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Forgot Password</h1>
          <p>Enter your email to receive a password reset link</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              disabled={isLoading}
              placeholder="admin@example.com"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={isLoading}
          >
            {isLoading ? 'Sending...' : 'Send Reset Link'}
          </button>

          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <Link
              to="/login"
              style={{
                color: 'var(--color-primary)',
                textDecoration: 'none',
                fontSize: '14px'
              }}
            >
              Back to Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
