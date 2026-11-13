// ============================================================================
// AUTHENTICATION MESSAGES & FLOW CONSTANTS
// Centralized constants for all authentication-related error and success messages,
// step identifiers, and helper mapping functions.
// ============================================================================

export const AUTH_STEPS = Object.freeze({
  EMAIL: 1,
  PASSWORD: 2,
  SET_PASSWORD: 3,
  SUCCESS: 4,
});

export const AUTH_MESSAGES = Object.freeze({
  // Validation Messages
  EMAIL_REQUIRED: 'Please enter your email address to continue.',
  EMAIL_INVALID: 'Please provide a valid email format (e.g. name@company.com).',
  PASSWORD_REQUIRED: 'Please enter your password.',

  // API Authentication Errors
  USER_NOT_FOUND: 'User not found.',
  INVALID_CREDENTIALS: 'Invalid email or password.',
  ACCOUNT_INACTIVE: 'Account is inactive. Please contact your administrator.',
  PASSWORD_NOT_SET: 'Password is not set. Please use your setup link to set your password.',

  // API Success Messages
  LOGIN_SUCCESS: 'Login successful',
  PASSWORD_SET_SUCCESS: 'Password set successfully',

  // Network & System Errors
  NETWORK_ERROR: 'Unable to connect to the server. Please check your network connection.',
  SOMETHING_WENT_WRONG: 'Something went wrong. Please try again.',
  SESSION_EXPIRED: 'Session expired. Please login again.',

  // Password Setup (Step 3) Validation Messages
  EMAIL_MISSING_STEP1: 'Email address is missing. Please start from Step 1.',
  PASSWORD_TOO_SHORT: 'Password must be at least 8 characters long.',
  PASSWORD_UPPERCASE_REQUIRED: 'Password must contain at least one uppercase letter (A-Z).',
  PASSWORD_LOWERCASE_REQUIRED: 'Password must contain at least one lowercase letter (a-z).',
  PASSWORD_NUMBER_REQUIRED: 'Password must contain at least one number (0-9).',
  PASSWORD_SYMBOL_REQUIRED: 'Password must contain at least one special character (@, $, !, %, *, ?, &, #).',
  PASSWORDS_DO_NOT_MATCH: 'Passwords do not match. Please verify both fields.',
  PASSWORD_SETUP_FAILED: 'Failed to set password. Please ensure password rules are satisfied.',
});

/**
 * Maps an API error or response to a standardized message constant from AUTH_MESSAGES.
 * Ensures that all error strings displayed to users come strictly from this constants file.
 *
 * @param {Error|Object|string} err - The error object, Axios error, or error string
 * @param {string} defaultMessage - Fallback constant message if error cannot be matched
 * @returns {string} Standardized message from AUTH_MESSAGES
 */
export const getAuthErrorMessage = (err, defaultMessage = AUTH_MESSAGES.SOMETHING_WENT_WRONG) => {
  if (!err) return defaultMessage;

  // If already a string matching an existing constant
  if (typeof err === 'string') {
    const directMatch = Object.values(AUTH_MESSAGES).find((m) => m === err);
    if (directMatch) return directMatch;
    // Check case-insensitive match
    const caseMatch = Object.values(AUTH_MESSAGES).find(
      (m) => m.toLowerCase() === err.trim().toLowerCase()
    );
    if (caseMatch) return caseMatch;
  }

  const status = err.response?.status;
  const backendMsg =
    err.response?.data?.status?.message ||
    err.response?.data?.message ||
    (typeof err.message === 'string' ? err.message : '');

  // 404 Not Found -> USER_NOT_FOUND
  if (status === 404 || /user not found/i.test(backendMsg)) {
    return AUTH_MESSAGES.USER_NOT_FOUND;
  }

  // 401 Unauthorized -> INVALID_CREDENTIALS
  if (status === 401 || /invalid.*(?:credential|password|email)|unauthorized/i.test(backendMsg)) {
    return AUTH_MESSAGES.INVALID_CREDENTIALS;
  }

  // 403 Forbidden -> ACCOUNT_INACTIVE
  if (status === 403 || /inactive/i.test(backendMsg)) {
    return AUTH_MESSAGES.ACCOUNT_INACTIVE;
  }

  // Network / Connection Failure
  if (err.code === 'ERR_NETWORK' || !err.response) {
    return AUTH_MESSAGES.NETWORK_ERROR;
  }

  // Check if backend message matches any defined constant
  if (backendMsg) {
    const matchedConstant = Object.values(AUTH_MESSAGES).find(
      (m) => m.toLowerCase() === backendMsg.toLowerCase()
    );
    if (matchedConstant) return matchedConstant;
  }

  return defaultMessage;
};
