// ============================================================================
// TWO-STEP EMAIL / PASSWORD SIGN-IN FLOW
// Step 1: Enter Email & Check Account Registration (Inline error if not found)
// Step 2: Enter Password (Email read-only summary with "Change" & "Use different email",
//         Inline error on password screen on wrong password)
// Step 3 & 4: Seamless support for First-Time Setup & Password Success (for /set-password)
// ============================================================================

import React from 'react';
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
  SparklesIcon,
  ExclamationCircleIcon,
  CheckIcon,
  QuestionMarkCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import { AUTH_STEPS } from '../constants/authMessages';
import { useSignInFlow } from '../hooks/useSignInFlow';

export const Login = ({ initialStep = AUTH_STEPS.EMAIL }) => {
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
    ? AUTH_STEPS.SET_PASSWORD
    : initialStep;

  // Single hook managing all state and transitions for the authentication flow
  const {
    step,
    email,
    setEmail,
    password,
    setPassword,
    rememberMe,
    setRememberMe,
    showPassword,
    setShowPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    showNewPassword,
    setShowNewPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    isStep3Valid,
    hasMinLength,
    hasUpperCase,
    hasLowerCase,
    hasNumber,
    hasSymbol,
    passwordsMatch,
    loading,
    error,
    showForgotModal,
    setShowForgotModal,
    goToEmailStep,
    handleEmailSubmit,
    handlePasswordSubmit,
    handleSetPasswordSubmit,
  } = useSignInFlow({
    initialStep: paramStep,
    initialEmail: paramEmail || savedEmail,
    login,
    setSession,
    onSuccess: () => navigate('/dashboard'),
  });

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
          aria-label="Sign-in step progress"
        >
          <span
            style={{
              width: step === AUTH_STEPS.EMAIL ? '1.5rem' : '0.5rem',
              height: '0.5rem',
              borderRadius: '9999px',
              backgroundColor:
                step === AUTH_STEPS.EMAIL ? 'var(--brand-primary)' : 'rgba(255,255,255,0.25)',
              transition: 'all 0.25s ease',
            }}
          />
          <span
            style={{
              width: step === AUTH_STEPS.PASSWORD ? '1.5rem' : '0.5rem',
              height: '0.5rem',
              borderRadius: '9999px',
              backgroundColor:
                step === AUTH_STEPS.PASSWORD ? 'var(--brand-primary)' : 'rgba(255,255,255,0.25)',
              transition: 'all 0.25s ease',
            }}
          />
          {(step === AUTH_STEPS.SET_PASSWORD || step === AUTH_STEPS.SUCCESS) && (
            <span
              style={{
                width: '1.5rem',
                height: '0.5rem',
                borderRadius: '9999px',
                backgroundColor:
                  step === AUTH_STEPS.SUCCESS ? '#16A34A' : 'var(--brand-primary)',
                transition: 'all 0.25s ease',
              }}
            />
          )}
        </div>

        {/* Main Authentication Card Box */}
        <div className="login-box">
          {error && (
            <div className="login-error-alert" role="alert">
              <ExclamationCircleIcon style={{ width: 16, height: 16, flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {/* ================================================================
              STEP 1: ENTER EMAIL (Check registered status)
              ================================================================ */}
          {step === AUTH_STEPS.EMAIL && (
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
              STEP 2: ENTER PASSWORD (Read-only email summary with Change link)
              ================================================================ */}
          {step === AUTH_STEPS.PASSWORD && (
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
                  <span
                    style={{
                      fontSize: '0.8125rem',
                      color: 'var(--slate-700)',
                      fontWeight: 500,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {email}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={goToEmailStep}
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

              <form onSubmit={handlePasswordSubmit} className="login-form">
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

              {/* Use a different email link */}
              <div
                style={{
                  textAlign: 'center',
                  marginTop: '1.25rem',
                  paddingTop: '1rem',
                  borderTop: '1px solid var(--card-border)',
                }}
              >
                <button
                  type="button"
                  onClick={goToEmailStep}
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
          {step === AUTH_STEPS.SET_PASSWORD && (
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
                  onClick={goToEmailStep}
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
          {step === AUTH_STEPS.SUCCESS && (
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

export default Login;
