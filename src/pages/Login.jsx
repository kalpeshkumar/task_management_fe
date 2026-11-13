// ============================================================================
// 4-STEP LOGIN & USER ONBOARDING AUTHENTICATION FLOW
// Step 1: Enter Email & Identify User (Existing vs First-Time)
// Step 2: Existing User Login (Password, Show/Hide, Remember Me, Forgot Password)
// Step 3: First-Time User Password Setup (New Password, Confirm, Validation Rules)
// Step 4: Password Setup Success (Success Icon, Message, Go to Dashboard)
// ============================================================================

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  CheckCircleIcon,
  LockClosedIcon,
  EnvelopeIcon,
  ArrowPathIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  Square3Stack3DIcon,
  EyeIcon,
  EyeSlashIcon,
  ShieldCheckIcon,
  SparklesIcon,
  ExclamationCircleIcon,
  CheckIcon,
  PencilSquareIcon,
  QuestionMarkCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/authApi';

export const Login = ({ initialStep = 1 }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login, setSession } = useAuth();

  // Retrieve remembered email from localStorage if available
  const savedEmail = localStorage.getItem('task_remember_email') || '';

  // Determine starting step based on URL query parameter or props
  const paramEmail = searchParams.get('email') || '';
  const paramStep = searchParams.get('step')
    ? Number(searchParams.get('step'))
    : paramEmail
    ? 3
    : initialStep;

  // Flow State
  const [step, setStep] = useState(paramStep); // 1 | 2 | 3 | 4
  const [email, setEmail] = useState(paramEmail || savedEmail);
  const [rememberMe, setRememberMe] = useState(Boolean(savedEmail));

  // Step 2 State
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Step 3 State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Status & Feedback
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);

  // Step 3 password validation checks
  const hasMinLength = newPassword.length >= 8;
  const hasUpperCase = /[A-Z]/.test(newPassword);
  const hasLowerCase = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSymbol = /[@$!%*?&#]/.test(newPassword);
  const passwordsMatch = confirmPassword.length > 0 && newPassword === confirmPassword;

  const isStep3Valid =
    hasMinLength &&
    hasUpperCase &&
    hasLowerCase &&
    hasNumber &&
    hasSymbol &&
    passwordsMatch;

  // --------------------------------------------------------------------------
  // STEP 1: SUBMIT EMAIL & IDENTIFY USER
  // --------------------------------------------------------------------------
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const trimmed = email.trim().toLowerCase();
    if (!trimmed) {
      setError('Please enter your email address to continue.');
      return;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(trimmed)) {
      setError('Please provide a valid email format (e.g. name@company.com).');
      return;
    }

    try {
      setLoading(true);
      // Query backend to detect whether user is logging in for the first time
      const res = await authApi.identifyUser(trimmed);

      if (res.isFirstTime) {
        // User has no password set -> First-Time Password Setup
        setStep(3);
      } else {
        // User exists with password -> Existing User Login
        setStep(2);
      }
    } catch (err) {
      console.error('Email check error:', err);
      // On error, proceed to standard password step so login is never blocked
      setStep(2);
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------------------------------
  // STEP 2: EXISTING USER LOGIN
  // --------------------------------------------------------------------------
  const handleExistingUserLogin = async (e) => {
    e.preventDefault();
    setError('');

    const trimmedEmail = email.trim().toLowerCase();
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    try {
      setLoading(true);
      const res = await login(trimmedEmail, password);

      // Handle edge-case where user reached Step 2 but password is not yet set
      if (res?.isPasswordSet === false) {
        setStep(3);
        return;
      }

      // Remember me preference
      if (rememberMe) {
        localStorage.setItem('task_remember_email', trimmedEmail);
      } else {
        localStorage.removeItem('task_remember_email');
      }

      // Redirect to appropriate dashboard
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      const msg =
        err.response?.data?.status?.message ||
        err.response?.data?.message ||
        'Invalid email or password. Please verify and try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------------------------------
  // STEP 3: FIRST-TIME USER PASSWORD SETUP
  // --------------------------------------------------------------------------
  const handleSetPasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      setError('Email address is missing. Please start from Step 1.');
      setStep(1);
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
      const res = await authApi.setPassword({
        email: trimmedEmail,
        newPassword,
        confirmPassword,
      });

      // Update session in AuthContext and localStorage
      if (res?.token) {
        if (setSession) {
          setSession(res.token, res.user);
        } else {
          localStorage.setItem('task_auth_token', res.token);
          if (res.user) {
            localStorage.setItem('task_auth_user', JSON.stringify(res.user));
          }
        }
      }

      if (rememberMe) {
        localStorage.setItem('task_remember_email', trimmedEmail);
      }

      // Transition to Step 4 Success Screen
      setStep(4);
    } catch (err) {
      console.error('Password setup error:', err);
      const msg =
        err.response?.data?.status?.message ||
        err.response?.data?.message ||
        err.message ||
        'Failed to set password. Please ensure password rules are satisfied.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------------------------------
  // STEP 4: GO TO DASHBOARD
  // --------------------------------------------------------------------------
  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <div className="login-page-bg">
      <div className="login-card-container" style={{ maxWidth: '28rem' }}>
        {/* Brand Card Header */}
        <div className="login-brand-header">
          <div className="login-brand-logo">
            <Square3Stack3DIcon style={{ width: 32, height: 32 }} />
          </div>
          <h1 className="login-brand-title">Student Task Management</h1>
          <p className="login-brand-desc">
            Sign in to organize, track, and manage student tasks
          </p>
        </div>

        {/* Step Progress Dots */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            marginBottom: '1rem',
          }}
        >
          <span
            style={{
              width: step === 1 ? '1.5rem' : '0.5rem',
              height: '0.5rem',
              borderRadius: '9999px',
              backgroundColor: step === 1 ? 'var(--brand-primary)' : 'rgba(255,255,255,0.25)',
              transition: 'all 0.25s ease',
            }}
          />
          <span
            style={{
              width: step === 2 || step === 3 ? '1.5rem' : '0.5rem',
              height: '0.5rem',
              borderRadius: '9999px',
              backgroundColor: step === 2 || step === 3 ? 'var(--brand-primary)' : 'rgba(255,255,255,0.25)',
              transition: 'all 0.25s ease',
            }}
          />
          <span
            style={{
              width: step === 4 ? '1.5rem' : '0.5rem',
              height: '0.5rem',
              borderRadius: '9999px',
              backgroundColor: step === 4 ? '#16A34A' : 'rgba(255,255,255,0.25)',
              transition: 'all 0.25s ease',
            }}
          />
        </div>

        {/* Main Authentication Card Box */}
        <div className="login-box">
          {error && (
            <div className="login-error-alert">
              <ExclamationCircleIcon style={{ width: 16, height: 16, flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {/* ================================================================
              STEP 1: ENTER EMAIL
              ================================================================ */}
          {step === 1 && (
            <div>
              <h2 className="login-box-heading">Sign In</h2>
              <p className="login-box-sub">Enter your email address to continue to your account</p>

              <form onSubmit={handleEmailSubmit} className="login-form">
                <div className="login-input-group">
                  <label className="form-field-label">Email Address</label>
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
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="login-submit-btn"
                >
                  {loading ? (
                    <>
                      <ArrowPathIcon className="animate-spin" style={{ width: 16, height: 16 }} />
                      <span>Checking account...</span>
                    </>
                  ) : (
                    <>
                      <span>Continue</span>
                      <ArrowRightIcon style={{ width: 16, height: 16 }} />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* ================================================================
              STEP 2: EXISTING USER LOGIN (ENTER PASSWORD)
              ================================================================ */}
          {step === 2 && (
            <div>
              <h2 className="login-box-heading">Welcome Back</h2>
              <p className="login-box-sub">Enter your password to sign in</p>

              {/* Email Summary Pill with Change Button */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.5rem 0.75rem',
                  backgroundColor: '#F8FAFC',
                  borderRadius: '0.375rem',
                  border: '1px solid var(--card-border)',
                  marginBottom: '1.25rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflow: 'hidden' }}>
                  <EnvelopeIcon style={{ width: 15, height: 15, color: 'var(--slate-400)', flexShrink: 0 }} />
                  <span style={{ fontSize: '0.8125rem', color: 'var(--slate-700)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {email}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setError('');
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--brand-primary)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    padding: '0.15rem 0.35rem',
                    borderRadius: '4px',
                  }}
                  title="Change email"
                >
                  Change
                </button>
              </div>

              <form onSubmit={handleExistingUserLogin} className="login-form">
                <div className="login-input-group">
                  <label className="form-field-label">Password</label>
                  <div className="login-input-wrapper">
                    <LockClosedIcon className="login-input-icon" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      autoFocus
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

                {/* Remember Me & Forgot Password Row */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.8125rem',
                    marginTop: '0.15rem',
                  }}
                >
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.375rem',
                      color: 'var(--slate-700)',
                      cursor: 'pointer',
                      userSelect: 'none',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      style={{ accentColor: 'var(--brand-primary)', cursor: 'pointer' }}
                    />
                    <span>Remember Me</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => setShowForgotModal(true)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--brand-primary)',
                      fontWeight: 600,
                      cursor: 'pointer',
                      padding: 0,
                      fontSize: '0.8125rem',
                    }}
                  >
                    Forgot Password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="login-submit-btn"
                  style={{ marginTop: '0.75rem' }}
                >
                  {loading ? (
                    <>
                      <ArrowPathIcon className="animate-spin" style={{ width: 16, height: 16 }} />
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRightIcon style={{ width: 16, height: 16 }} />
                    </>
                  )}
                </button>
              </form>

              <div style={{ textAlign: 'center', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--card-border)' }}>
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setError('');
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--slate-500)',
                    fontSize: '0.8125rem',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                  }}
                >
                  <ArrowLeftIcon style={{ width: 13, height: 13 }} />
                  <span>Use a different email</span>
                </button>
              </div>
            </div>
          )}

          {/* ================================================================
              STEP 3: FIRST-TIME USER PASSWORD SETUP
              ================================================================ */}
          {step === 3 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    fontSize: '0.6875rem',
                    color: 'var(--brand-primary)',
                    backgroundColor: '#FFEDD5',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '9999px',
                    fontWeight: 600,
                  }}
                >
                  <SparklesIcon style={{ width: 12, height: 12 }} /> First-Time Setup
                </span>
              </div>

              <h2 className="login-box-heading">Set Your Password</h2>
              <p className="login-box-sub">Create and confirm your account password</p>

              {/* Verified Email Summary Pill */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.5rem 0.75rem',
                  backgroundColor: '#F0FDF4',
                  borderRadius: '0.375rem',
                  border: '1px solid #BBF7D0',
                  marginBottom: '1.25rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflow: 'hidden' }}>
                  <EnvelopeIcon style={{ width: 15, height: 15, color: '#16A34A', flexShrink: 0 }} />
                  <span style={{ fontSize: '0.8125rem', color: '#166534', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {email}
                  </span>
                </div>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.2rem',
                    fontSize: '0.6875rem',
                    color: '#166534',
                    fontWeight: 600,
                  }}
                >
                  <CheckIcon style={{ width: 11, height: 11 }} />
                  Verified
                </span>
              </div>

              <form onSubmit={handleSetPasswordSubmit} className="login-form">
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
                      autoFocus
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

                {/* Real-time Password Requirements Checklist */}
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

                <button
                  type="submit"
                  disabled={loading || !isStep3Valid}
                  className="login-submit-btn"
                  style={{
                    opacity: loading || !isStep3Valid ? 0.7 : 1,
                    cursor: loading || !isStep3Valid ? 'not-allowed' : 'pointer',
                    marginTop: '0.75rem',
                  }}
                >
                  {loading ? (
                    <>
                      <ArrowPathIcon className="animate-spin" style={{ width: 16, height: 16 }} />
                      <span>Setting Password...</span>
                    </>
                  ) : (
                    <>
                      <span>Set Password</span>
                      <ArrowRightIcon style={{ width: 16, height: 16 }} />
                    </>
                  )}
                </button>
              </form>

              <div style={{ textAlign: 'center', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--card-border)' }}>
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setError('');
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--slate-500)',
                    fontSize: '0.8125rem',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                  }}
                >
                  <ArrowLeftIcon style={{ width: 13, height: 13 }} />
                  <span>Start over with different email</span>
                </button>
              </div>
            </div>
          )}

          {/* ================================================================
              STEP 4: PASSWORD SETUP SUCCESS
              ================================================================ */}
          {step === 4 && (
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  background: '#DCFCE7',
                  color: '#166534',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.25rem',
                  border: '1px solid #BBF7D0',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                }}
              >
                <CheckCircleIcon style={{ width: 36, height: 36 }} />
              </div>

              <h2 className="login-box-heading" style={{ fontSize: '1.375rem', marginBottom: '0.5rem' }}>
                Password Set Successfully!
              </h2>

              <p style={{ fontSize: '0.875rem', color: 'var(--slate-600)', lineHeight: 1.5, marginBottom: '1.5rem' }}>
                Your account has been activated and your password is now active. You can now access your dashboard and manage your assigned tasks.
              </p>

              <div
                style={{
                  padding: '0.75rem 1rem',
                  backgroundColor: '#F8FAFC',
                  borderRadius: '0.375rem',
                  border: '1px solid var(--card-border)',
                  marginBottom: '1.5rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.8125rem',
                  color: 'var(--slate-700)',
                  fontWeight: 500,
                }}
              >
                <EnvelopeIcon style={{ width: 15, height: 15, color: 'var(--slate-400)' }} />
                <span>{email}</span>
                <span style={{ fontSize: '0.6875rem', backgroundColor: '#DCFCE7', color: '#166534', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 600 }}>
                  Active
                </span>
              </div>

              <button
                type="button"
                onClick={handleGoToDashboard}
                className="login-submit-btn"
                style={{ width: '100%', margin: '0 auto' }}
              >
                <span>Go to Dashboard</span>
                <ArrowRightIcon style={{ width: 16, height: 16 }} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Forgot Password Information Modal */}
      {showForgotModal && (
        <div
          onClick={() => setShowForgotModal(false)}
          className="modal-overlay"
          role="dialog"
          aria-modal="true"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="modal-dialog-box modal-dialog-md"
            style={{ maxWidth: 440 }}
          >
            <div className="modal-header-bar">
              <div className="modal-header-title-wrap">
                <div className="modal-header-icon-box">
                  <QuestionMarkCircleIcon style={{ width: 20, height: 20 }} />
                </div>
                <div>
                  <h3 className="modal-title-text">Reset Password</h3>
                  <p className="modal-subtitle-text">Account recovery instructions</p>
                </div>
              </div>
              <button
                onClick={() => setShowForgotModal(false)}
                className="modal-close-icon-btn"
                title="Close"
              >
                <XMarkIcon style={{ width: 20, height: 20 }} />
              </button>
            </div>

            <div className="modal-form-content" style={{ padding: '1.5rem' }}>
              <p style={{ fontSize: '0.875rem', color: 'var(--slate-700)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                For organizational security, employee password resets are managed directly by your system administrator.
              </p>
              <div style={{ backgroundColor: '#F8FAFC', border: '1px solid var(--card-border)', borderRadius: '0.375rem', padding: '0.875rem', fontSize: '0.8125rem', color: 'var(--slate-600)' }}>
                Please reach out to your administrator at <strong>admin@example.com</strong> to request a password reset or account verification link.
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="btn-primary-action"
                  style={{ padding: '0.5rem 1.25rem' }}
                >
                  Understood
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
