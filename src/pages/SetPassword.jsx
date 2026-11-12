// ============================================================================
// EMPLOYEE FIRST-TIME LOGIN – SET PASSWORD SCREEN
// Allows newly invited employees to create and confirm their account password
// via POST /auth/set-password. Enforces complexity validation and matching checks,
// and automatically authenticates and redirects to the Dashboard upon success.
// ============================================================================

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  CheckCircleIcon,
  LockClosedIcon,
  EnvelopeIcon,
  ArrowPathIcon,
  ArrowRightIcon,
  Square3Stack3DIcon,
  EyeIcon,
  EyeSlashIcon,
  SparklesIcon,
  ShieldCheckIcon,
  ExclamationCircleIcon,
  CheckIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { authApi } from '../api/authApi';
import { useAuth } from '../context/AuthContext';

export const SetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setSession } = useAuth();

  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam.trim().toLowerCase());
    }
  }, [searchParams]);

  // Real-time password requirement evaluations
  const hasMinLength = newPassword.length >= 8;
  const hasUpperCase = /[A-Z]/.test(newPassword);
  const hasLowerCase = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSymbol = /[@$!%*?&#]/.test(newPassword);
  const passwordsMatch = confirmPassword.length > 0 && newPassword === confirmPassword;

  const isFormValid =
    hasMinLength &&
    hasUpperCase &&
    hasLowerCase &&
    hasNumber &&
    hasSymbol &&
    passwordsMatch;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setError('Please provide your registered account email.');
      return;
    }

    if (!hasMinLength) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (!hasUpperCase) {
      setError('Password must contain at least one uppercase letter (A-Z).');
      return;
    }
    if (!hasLowerCase) {
      setError('Password must contain at least one lowercase letter (a-z).');
      return;
    }
    if (!hasNumber) {
      setError('Password must contain at least one number (0-9).');
      return;
    }
    if (!hasSymbol) {
      setError('Password must contain at least one special character (@, $, !, %, *, ?, &, #).');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please verify both fields.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const res = await authApi.setPassword({
        email: cleanEmail,
        newPassword,
        confirmPassword,
      });

      setSuccess(true);

      // Authenticate session and redirect to dashboard
      if (res?.token) {
        if (setSession) {
          setSession(res.token, res.user);
        } else {
          localStorage.setItem('task_auth_token', res.token);
          if (res.user) {
            localStorage.setItem('task_auth_user', JSON.stringify(res.user));
          }
        }

        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      } else {
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (err) {
      console.error('Failed to set password:', err);
      const msg =
        err.response?.data?.status?.message ||
        err.response?.data?.message ||
        err.message ||
        'Failed to set password. Please ensure all requirements are met.';
      setError(msg);
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
            <Square3Stack3DIcon style={{ width: 32, height: 32 }} />
          </div>
          <h1 className="login-brand-title">Student Task Management</h1>
          <p className="login-brand-desc">First-time account activation and password setup</p>
        </div>

        {/* Set Password Card Box */}
        <div className="login-box">
          <h2 className="login-box-heading">Create Your Password</h2>
          <p className="login-box-sub">
            Set and confirm your initial account credentials to access your dashboard
          </p>

          {error && (
            <div className="login-error-alert">
              <ExclamationCircleIcon style={{ width: 16, height: 16, flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {success ? (
            <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  background: '#DCFCE7',
                  color: '#166534',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem',
                  border: '1px solid #BBF7D0',
                }}
              >
                <CheckCircleIcon style={{ width: 32, height: 32 }} />
              </div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--slate-800)', marginBottom: '0.5rem', fontFamily: 'var(--font-display)' }}>
                Password Set Successfully!
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--slate-600)' }}>
                Your account is activated. Redirecting you to your dashboard...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="login-form">
              {/* Account Email (Verified) */}
              <div className="login-input-group">
                <label className="form-field-label">
                  Registered Email Address
                </label>
                <div className="login-input-wrapper">
                  <EnvelopeIcon className="login-input-icon" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. employee@company.com"
                    required
                    readOnly={Boolean(searchParams.get('email'))}
                    className="login-field-input"
                    style={
                      searchParams.get('email')
                        ? { backgroundColor: '#F8FAFC', color: 'var(--slate-700)', cursor: 'default' }
                        : {}
                    }
                  />
                  {searchParams.get('email') && (
                    <span
                      style={{
                        position: 'absolute',
                        right: '0.75rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        fontSize: '0.6875rem',
                        color: '#166534',
                        backgroundColor: '#DCFCE7',
                        padding: '0.15rem 0.5rem',
                        borderRadius: '9999px',
                        border: '1px solid #BBF7D0',
                        fontWeight: 600,
                      }}
                    >
                      <CheckIcon style={{ width: 11, height: 11 }} />
                      Verified
                    </span>
                  )}
                </div>
              </div>

              {/* New Password */}
              <div className="login-input-group">
                <label className="form-field-label">
                  New Password <span className="form-required-star">*</span>
                </label>
                <div className="login-input-wrapper">
                  <LockClosedIcon className="login-input-icon" />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    required
                    autoFocus={Boolean(searchParams.get('email'))}
                    className="login-field-input"
                    style={{ paddingRight: '2.5rem' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword((prev) => !prev)}
                    style={{
                      position: 'absolute',
                      right: '0.75rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--slate-400)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '0.25rem',
                    }}
                    title={showNewPassword ? 'Hide password' : 'Show password'}
                    tabIndex={-1}
                  >
                    {showNewPassword ? (
                      <EyeSlashIcon style={{ width: 18, height: 18 }} />
                    ) : (
                      <EyeIcon style={{ width: 18, height: 18 }} />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="login-input-group">
                <label className="form-field-label">
                  Confirm Password <span className="form-required-star">*</span>
                </label>
                <div className="login-input-wrapper">
                  <LockClosedIcon className="login-input-icon" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    required
                    className="login-field-input"
                    style={{ paddingRight: '2.5rem' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    style={{
                      position: 'absolute',
                      right: '0.75rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--slate-400)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '0.25rem',
                    }}
                    title={showConfirmPassword ? 'Hide password' : 'Show password'}
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? (
                      <EyeSlashIcon style={{ width: 18, height: 18 }} />
                    ) : (
                      <EyeIcon style={{ width: 18, height: 18 }} />
                    )}
                  </button>
                </div>
              </div>

              {/* Live Password Requirements & Matching Checklist */}
              <div
                style={{
                  padding: '0.75rem',
                  borderRadius: '0.375rem',
                  backgroundColor: '#F8FAFC',
                  border: '1px solid var(--card-border)',
                  fontSize: '0.75rem',
                  color: 'var(--slate-600)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.35rem',
                }}
              >
                <span style={{ fontWeight: 600, color: 'var(--slate-700)', marginBottom: '0.15rem' }}>
                  Password Requirements:
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.35rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: hasMinLength ? '#166534' : 'var(--slate-500)' }}>
                    {hasMinLength ? <CheckIcon style={{ width: 13, height: 13, color: '#16a34a', strokeWidth: 2.5 }} /> : <span style={{ width: 13, height: 13, borderRadius: '50%', border: '1px solid var(--slate-300)', display: 'inline-block' }} />}
                    8+ Characters
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: hasUpperCase ? '#166534' : 'var(--slate-500)' }}>
                    {hasUpperCase ? <CheckIcon style={{ width: 13, height: 13, color: '#16a34a', strokeWidth: 2.5 }} /> : <span style={{ width: 13, height: 13, borderRadius: '50%', border: '1px solid var(--slate-300)', display: 'inline-block' }} />}
                    Uppercase (A-Z)
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: hasLowerCase ? '#166534' : 'var(--slate-500)' }}>
                    {hasLowerCase ? <CheckIcon style={{ width: 13, height: 13, color: '#16a34a', strokeWidth: 2.5 }} /> : <span style={{ width: 13, height: 13, borderRadius: '50%', border: '1px solid var(--slate-300)', display: 'inline-block' }} />}
                    Lowercase (a-z)
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: hasNumber ? '#166534' : 'var(--slate-500)' }}>
                    {hasNumber ? <CheckIcon style={{ width: 13, height: 13, color: '#16a34a', strokeWidth: 2.5 }} /> : <span style={{ width: 13, height: 13, borderRadius: '50%', border: '1px solid var(--slate-300)', display: 'inline-block' }} />}
                    Number (0-9)
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: hasSymbol ? '#166534' : 'var(--slate-500)' }}>
                    {hasSymbol ? <CheckIcon style={{ width: 13, height: 13, color: '#16a34a', strokeWidth: 2.5 }} /> : <span style={{ width: 13, height: 13, borderRadius: '50%', border: '1px solid var(--slate-300)', display: 'inline-block' }} />}
                    Symbol (@$!%*?&#)
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: passwordsMatch ? '#166534' : (confirmPassword ? '#DC2626' : 'var(--slate-500)') }}>
                    {passwordsMatch ? <CheckIcon style={{ width: 13, height: 13, color: '#16a34a', strokeWidth: 2.5 }} /> : <span style={{ width: 13, height: 13, borderRadius: '50%', border: '1px solid var(--slate-300)', display: 'inline-block' }} />}
                    Passwords match
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !isFormValid}
                className="login-submit-btn"
                style={{
                  opacity: loading || !isFormValid ? 0.7 : 1,
                  cursor: loading || !isFormValid ? 'not-allowed' : 'pointer',
                }}
              >
                {loading ? (
                  <>
                    <ArrowPathIcon className="animate-spin" style={{ width: 16, height: 16 }} />
                    <span>Activating Account...</span>
                  </>
                ) : (
                  <>
                    <span>Set Password & Access Dashboard</span>
                    <ArrowRightIcon style={{ width: 16, height: 16 }} />
                  </>
                )}
              </button>

              <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                <Link
                  to="/login"
                  style={{ fontSize: '0.8125rem', color: 'var(--brand-primary)', fontWeight: 500 }}
                >
                  Already have an active password? Return to Sign In
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
