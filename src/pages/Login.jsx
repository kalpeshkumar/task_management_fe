// ============================================================================
// LOGIN PAGE
// Supports both:
// 1. Standard Sign In (Email + Password) for Admin and returning Employees.
// 2. First-Time Employee Login: Employees verify their registered email address
//    and are redirected to the Set Password screen to create their credentials.
// ============================================================================

import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/authApi';

export const Login = () => {
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get('mode') === 'first-time' ? 'first-time' : 'signin';

  const [mode, setMode] = useState(initialMode); // 'signin' | 'first-time'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  // Handle Standard Sign-in
  const handleStandardLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      setError('Please provide your registered email address.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    try {
      setLoading(true);
      const res = await login(trimmedEmail, password);

      // If user exists but has not set password yet, seamlessly transition to password setup
      if (res?.isPasswordSet === false) {
        setSuccess('First-time login detected! Redirecting to password setup...');
        setTimeout(() => {
          navigate(`/set-password?email=${encodeURIComponent(trimmedEmail)}`);
        }, 1200);
        return;
      }

      // Successful login
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      const msg =
        err.response?.data?.status?.message ||
        err.response?.data?.message ||
        'Invalid email or password. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Handle First-Time Employee Email Verification
  const handleFirstTimeVerification = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      setError('Please enter your registered email address.');
      return;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(trimmedEmail)) {
      setError('Please provide a valid email address.');
      return;
    }

    try {
      setLoading(true);
      const res = await authApi.verifyEmployeeEmail(trimmedEmail);

      if (res.verified && res.isFirstTime) {
        setSuccess('Email address verified! Redirecting to set your password...');
        setTimeout(() => {
          navigate(`/set-password?email=${encodeURIComponent(trimmedEmail)}`);
        }, 1200);
      } else if (res.verified && !res.isFirstTime) {
        setError('A password has already been set for this account. Please sign in below.');
        setMode('signin');
      } else {
        setError('No pending employee account found with this email. Please contact your administrator.');
      }
    } catch (err) {
      console.error('Verification error:', err);
      setError(
        err.response?.data?.status?.message ||
        err.response?.data?.message ||
        'Unable to verify email address. Please contact your administrator.'
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
            <Square3Stack3DIcon style={{ width: 32, height: 32 }} />
          </div>
          <h1 className="login-brand-title">
            Student Task Management
          </h1>
          <p className="login-brand-desc">
            Sign in to organize, track, and manage student tasks
          </p>
        </div>

        {/* Login Box */}
        <div className="login-box">
          {/* Mode Tabs */}
          <div
            style={{
              display: 'flex',
              backgroundColor: '#F1F5F9',
              borderRadius: '0.5rem',
              padding: '0.25rem',
              marginBottom: '1.5rem',
            }}
          >
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setError('');
                setSuccess('');
              }}
              style={{
                flex: 1,
                padding: '0.5rem 0.75rem',
                fontSize: '0.875rem',
                fontWeight: 600,
                border: 'none',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                backgroundColor: mode === 'signin' ? '#FFFFFF' : 'transparent',
                color: mode === 'signin' ? 'var(--slate-900)' : 'var(--slate-500)',
                boxShadow: mode === 'signin' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('first-time');
                setError('');
                setSuccess('');
              }}
              style={{
                flex: 1,
                padding: '0.5rem 0.75rem',
                fontSize: '0.875rem',
                fontWeight: 600,
                border: 'none',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                backgroundColor: mode === 'first-time' ? '#FFFFFF' : 'transparent',
                color: mode === 'first-time' ? 'var(--brand-primary)' : 'var(--slate-500)',
                boxShadow: mode === 'first-time' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              First-Time Login
            </button>
          </div>

          {mode === 'signin' ? (
            <>
              <h2 className="login-box-heading">Welcome back</h2>
              <p className="login-box-sub">Enter your email and password to access your dashboard</p>

              {error && (
                <div className="login-error-alert">
                  <ExclamationCircleIcon style={{ width: 16, height: 16, flexShrink: 0 }} />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', background: '#DCFCE7', border: '1px solid #BBF7D0', borderRadius: '0.375rem', color: '#166534', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
                  <CheckCircleIcon style={{ width: 18, height: 18, flexShrink: 0 }} />
                  <span>{success}</span>
                </div>
              )}

              <form onSubmit={handleStandardLogin} className="login-form">
                <div className="login-input-group">
                  <label className="form-field-label">
                    Email Address
                  </label>
                  <div className="login-input-wrapper">
                    <EnvelopeIcon className="login-input-icon" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. employee@company.com"
                      required
                      className="login-field-input"
                    />
                  </div>
                </div>

                <div className="login-input-group">
                  <label className="form-field-label">
                    Password
                  </label>
                  <div className="login-input-wrapper">
                    <LockClosedIcon className="login-input-icon" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="login-field-input"
                      style={{ paddingRight: '2.5rem' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
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
                      title={showPassword ? 'Hide password' : 'Show password'}
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeSlashIcon style={{ width: 18, height: 18 }} />
                      ) : (
                        <EyeIcon style={{ width: 18, height: 18 }} />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="login-submit-btn"
                >
                  {loading ? (
                    <>
                      <ArrowPathIcon className="animate-spin" style={{ width: 16, height: 16 }} />
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In to TaskFlow</span>
                      <ArrowRightIcon style={{ width: 16, height: 16 }} />
                    </>
                  )}
                </button>
              </form>

              <div style={{ textAlign: 'center', marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid var(--card-border)' }}>
                <p style={{ fontSize: '0.8125rem', color: 'var(--slate-500)' }}>
                  First time here?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('first-time');
                      setError('');
                      setSuccess('');
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--brand-primary)',
                      fontWeight: 600,
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    Activate employee account →
                  </button>
                </p>
              </div>
            </>
          ) : (
            <>
              <h2 className="login-box-heading">Employee First-Time Login</h2>
              <p className="login-box-sub">
                Enter your registered email address to verify your account and set up your password
              </p>

              {error && (
                <div className="login-error-alert">
                  <ExclamationCircleIcon style={{ width: 16, height: 16, flexShrink: 0 }} />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', background: '#DCFCE7', border: '1px solid #BBF7D0', borderRadius: '0.375rem', color: '#166534', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
                  <CheckCircleIcon style={{ width: 18, height: 18, flexShrink: 0 }} />
                  <span>{success}</span>
                </div>
              )}

              <form onSubmit={handleFirstTimeVerification} className="login-form">
                <div className="login-input-group">
                  <label className="form-field-label">
                    Registered Email Address <span className="form-required-star">*</span>
                  </label>
                  <div className="login-input-wrapper">
                    <EnvelopeIcon className="login-input-icon" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. employee@company.com"
                      required
                      autoFocus
                      className="login-field-input"
                    />
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--slate-500)', marginTop: '0.35rem' }}>
                    Enter the email address your administrator registered for your account.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="login-submit-btn"
                >
                  {loading ? (
                    <>
                      <ArrowPathIcon className="animate-spin" style={{ width: 16, height: 16 }} />
                      <span>Verifying Email...</span>
                    </>
                  ) : (
                    <>
                      <span>Verify Email & Continue</span>
                      <ArrowRightIcon style={{ width: 16, height: 16 }} />
                    </>
                  )}
                </button>
              </form>

              <div style={{ textAlign: 'center', marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid var(--card-border)' }}>
                <p style={{ fontSize: '0.8125rem', color: 'var(--slate-500)' }}>
                  Already set your password?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signin');
                      setError('');
                      setSuccess('');
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--brand-primary)',
                      fontWeight: 600,
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    Return to Sign In
                  </button>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
