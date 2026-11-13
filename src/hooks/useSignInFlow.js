import { useState, useCallback } from 'react';
import { authApi } from '../api/authApi';
import { AUTH_STEPS, AUTH_MESSAGES, getAuthErrorMessage } from '../constants/authMessages';

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

/**
 * Custom hook to manage the two-step email/password authentication flow.
 *
 * Encapsulates:
 * - Step state (Step 1: Email, Step 2: Password, Step 3: Set Password, Step 4: Success)
 * - Input values (email, password, rememberMe, showPassword)
 * - Form validation using centralized message constants
 * - Email verification check via existing API without advancing if unregistered
 * - Sign in execution and error handling restricted to password screen on wrong password
 *
 * @param {Object} options
 * @param {number} [options.initialStep=1] - Starting step
 * @param {string} [options.initialEmail=''] - Pre-filled email if available
 * @param {Function} [options.login] - Login method from AuthContext
 * @param {Function} [options.setSession] - Session updater from AuthContext
 * @param {Function} [options.onSuccess] - Navigation or callback on successful login
 */
export const useSignInFlow = ({
  initialStep = AUTH_STEPS.EMAIL,
  initialEmail = '',
  login,
  setSession,
  onSuccess,
} = {}) => {
  // Step & Form State
  const [step, setStep] = useState(initialStep);
  const [email, setEmail] = useState(initialEmail);
  const [rememberMe, setRememberMe] = useState(Boolean(initialEmail));

  // Step 2 State
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Step 3 State (First-time password setup)
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Status & Feedback
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);

  // Password validation rules for Step 3
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

  // Clear current error
  const clearError = useCallback(() => {
    setError('');
  }, []);

  /**
   * Navigate back to Step 1 (Email screen).
   * - Sets step to Email (1)
   * - Clears the password field
   * - Clears any existing error
   * - Leaves the email field populated with the user's input
   */
  const goToEmailStep = useCallback(() => {
    setStep(AUTH_STEPS.EMAIL);
    setPassword('');
    setError('');
  }, []);

  /**
   * Step 1: Submit email to verify whether user is registered.
   * - If email is not registered: stay on Step 1, show inline error.
   * - If email is registered: advance to Step 2 pre-filled with email.
   */
  const handleEmailSubmit = useCallback(async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setError('');

    const trimmed = email.trim().toLowerCase();
    if (!trimmed) {
      setError(AUTH_MESSAGES.EMAIL_REQUIRED);
      return;
    }

    if (!EMAIL_REGEX.test(trimmed)) {
      setError(AUTH_MESSAGES.EMAIL_INVALID);
      return;
    }

    try {
      setLoading(true);
      const res = await authApi.checkEmail(trimmed);

      if (res.exists) {
        if (res.isPasswordSet === false) {
          // User exists but has not set password yet -> Setup Password
          setStep(AUTH_STEPS.SET_PASSWORD);
        } else {
          // User exists with password -> Advance to Password screen (Step 2)
          setPassword('');
          setError('');
          setStep(AUTH_STEPS.PASSWORD);
        }
      } else {
        // Email does not exist -> Stay on Step 1 and show inline error
        setError(res.error || AUTH_MESSAGES.USER_NOT_FOUND);
      }
    } catch (err) {
      console.error('Email check error:', err);
      const errorMsg = getAuthErrorMessage(err, AUTH_MESSAGES.USER_NOT_FOUND);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [email]);

  /**
   * Step 2: Submit password to sign in.
   * - On success: store rememberMe preference and trigger onSuccess callback.
   * - On failure: stay on Step 2 (Password screen), show inline error only.
   */
  const handlePasswordSubmit = useCallback(async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setError('');

    const trimmedEmail = email.trim().toLowerCase();
    if (!password) {
      setError(AUTH_MESSAGES.PASSWORD_REQUIRED);
      return;
    }

    try {
      setLoading(true);
      const res = login ? await login(trimmedEmail, password) : await authApi.login(trimmedEmail, password);

      // Handle edge-case where password is not set
      if (res?.isPasswordSet === false) {
        setStep(AUTH_STEPS.SET_PASSWORD);
        return;
      }

      // Remember me preference
      if (rememberMe) {
        localStorage.setItem('task_remember_email', trimmedEmail);
      } else {
        localStorage.removeItem('task_remember_email');
      }

      if (onSuccess) {
        onSuccess(res);
      }
    } catch (err) {
      console.error('Login error:', err);
      // Stay on Step 2 (Password screen) and show inline error
      const errorMsg = getAuthErrorMessage(err, AUTH_MESSAGES.INVALID_CREDENTIALS);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [email, password, rememberMe, login, onSuccess]);

  /**
   * Step 3: First-time user password setup submit handler.
   */
  const handleSetPasswordSubmit = useCallback(async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setError('');

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      setError(AUTH_MESSAGES.EMAIL_MISSING_STEP1);
      setStep(AUTH_STEPS.EMAIL);
      return;
    }

    if (!hasMinLength) {
      setError(AUTH_MESSAGES.PASSWORD_TOO_SHORT);
      return;
    }
    if (!hasUpperCase) {
      setError(AUTH_MESSAGES.PASSWORD_UPPERCASE_REQUIRED);
      return;
    }
    if (!hasLowerCase) {
      setError(AUTH_MESSAGES.PASSWORD_LOWERCASE_REQUIRED);
      return;
    }
    if (!hasNumber) {
      setError(AUTH_MESSAGES.PASSWORD_NUMBER_REQUIRED);
      return;
    }
    if (!hasSymbol) {
      setError(AUTH_MESSAGES.PASSWORD_SYMBOL_REQUIRED);
      return;
    }
    if (newPassword !== confirmPassword) {
      setError(AUTH_MESSAGES.PASSWORDS_DO_NOT_MATCH);
      return;
    }

    try {
      setLoading(true);
      const res = await authApi.setPassword({
        email: trimmedEmail,
        newPassword,
        confirmPassword,
      });

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

      setStep(AUTH_STEPS.SUCCESS);
    } catch (err) {
      console.error('Password setup error:', err);
      const errorMsg = getAuthErrorMessage(err, AUTH_MESSAGES.PASSWORD_SETUP_FAILED);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [
    email,
    newPassword,
    confirmPassword,
    hasMinLength,
    hasUpperCase,
    hasLowerCase,
    hasNumber,
    hasSymbol,
    rememberMe,
    setSession,
  ]);

  return {
    // Current step & data
    step,
    setStep,
    email,
    setEmail,
    password,
    setPassword,
    rememberMe,
    setRememberMe,
    showPassword,
    setShowPassword,

    // Step 3 (Set Password) state
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

    // Status & modals
    loading,
    error,
    setError,
    clearError,
    showForgotModal,
    setShowForgotModal,

    // Step navigation and submission handlers
    goToEmailStep,
    handleEmailSubmit,
    handlePasswordSubmit,
    handleSetPasswordSubmit,
  };
};
