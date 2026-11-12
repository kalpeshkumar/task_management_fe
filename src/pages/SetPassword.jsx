// ============================================================================
// FIRST-LOGIN SET PASSWORD PAGE
// Allows newly created users (students/employees) to set their initial password via POST /auth/set-password.
// ============================================================================

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, Lock, Mail, Loader2, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { authApi } from '../api/authApi';
import { useAuth } from '../context/AuthContext';

export const SetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please provide your account email.');
      return;
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const res = await authApi.setPassword({
        email: email.trim(),
        newPassword,
        confirmPassword,
      });

      setSuccess(true);

      // If backend returned session tokens, store them and redirect to dashboard
      if (res?.token) {
        localStorage.setItem('task_auth_token', res.token);
        if (res.user) {
          localStorage.setItem('task_auth_user', JSON.stringify(res.user));
        }
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1500);
      } else {
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
        err.message ||
        'Failed to set password. Please ensure password meets complexity rules.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-bg">
      <div className="login-card-container">
        {/* Brand Card Header */}
        <div className="login-brand-header">
          <div className="login-brand-logo">
            <CheckCircle2 style={{ width: 32, height: 32 }} />
          </div>
          <h1 className="login-brand-title">Student Task Management</h1>
          <p className="login-brand-desc">Activate your account to start managing tasks</p>
        </div>

        {/* Set Password Box */}
        <div className="login-box">
          <h2 className="login-box-heading">Set Your Password</h2>
          <p className="login-box-sub">Complete your first-time account setup</p>

          {error && (
            <div className="login-error-alert">
              <span>{error}</span>
            </div>
          )}

          {success ? (
            <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: '50%',
                  background: 'var(--teal-100)',
                  color: 'var(--teal-700)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem',
                }}
              >
                <Sparkles style={{ width: 28, height: 28 }} />
              </div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--slate-800)', marginBottom: '0.5rem' }}>
                Password Set Successfully!
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--slate-600)' }}>
                Redirecting you to your dashboard...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="login-form">
              <div className="login-input-group">
                <label className="form-field-label">Account Email</label>
                <div className="login-input-wrapper">
                  <Mail className="login-input-icon" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. jane@studenttasks.com"
                    required
                    className="login-field-input"
                  />
                </div>
              </div>

              <div className="login-input-group">
                <label className="form-field-label">New Password</label>
                <div className="login-input-wrapper">
                  <Lock className="login-input-icon" />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 8 chars, 1 uppercase, 1 number, 1 symbol"
                    required
                    className="login-field-input"
                  />
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--slate-500)', marginTop: '0.25rem' }}>
                  Must contain at least 8 characters with uppercase, lowercase, digit, and symbol (@$!%*?&).
                </p>
              </div>

              <div className="login-input-group">
                <label className="form-field-label">Confirm Password</label>
                <div className="login-input-wrapper">
                  <Lock className="login-input-icon" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    required
                    className="login-field-input"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="login-submit-btn"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" style={{ width: 16, height: 16 }} />
                    <span>Activating Account...</span>
                  </>
                ) : (
                  <>
                    <span>Activate Account</span>
                    <ArrowRight style={{ width: 16, height: 16 }} />
                  </>
                )}
              </button>

              <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                <Link
                  to="/login"
                  style={{ fontSize: '0.8125rem', color: 'var(--teal-600)', fontWeight: 500 }}
                >
                  Already have an active password? Sign In
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
