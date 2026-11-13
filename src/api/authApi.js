import api from './axios';
import { AUTH_MESSAGES } from '../constants/authMessages';

export const authApi = {
  // Standard login with email and password
  login: async (email, password) => {
    const cleanEmail = email?.trim().toLowerCase();
    const response = await api.post('/auth/login', { email: cleanEmail, password });
    const resData = response.data?.data || response.data;
    return {
      token: resData?.token || resData?.accessToken,
      accessToken: resData?.accessToken || resData?.token,
      refreshToken: resData?.refreshToken,
      user: resData?.user,
      message: resData?.message || response.data?.status?.message || AUTH_MESSAGES.LOGIN_SUCCESS,
      isPasswordSet: resData?.isPasswordSet,
    };
  },

  // Step 1: Check whether an email is registered by reusing the existing POST /auth/login endpoint
  // without changing any backend code or adding new endpoints.
  checkEmail: async (email) => {
    const cleanEmail = email?.trim().toLowerCase();
    try {
      const response = await api.post('/auth/login', {
        email: cleanEmail,
        password: '__identify_check__',
      });
      const resData = response.data?.data || response.data;
      return {
        exists: true,
        isPasswordSet: resData?.isPasswordSet !== false,
      };
    } catch (err) {
      const status = err.response?.status;
      const backendMsg =
        err.response?.data?.status?.message ||
        err.response?.data?.message ||
        '';

      // 404 Not Found: User does not exist in the database
      if (status === 404 || /user not found/i.test(backendMsg)) {
        return {
          exists: false,
          error: AUTH_MESSAGES.USER_NOT_FOUND,
        };
      }

      // 401 Unauthorized: User exists in database and has a password set
      if (status === 401) {
        return {
          exists: true,
          isPasswordSet: true,
        };
      }

      // 403 Forbidden: User exists but is inactive
      if (status === 403) {
        return {
          exists: false,
          inactive: true,
          error: AUTH_MESSAGES.ACCOUNT_INACTIVE,
        };
      }

      // 500: In case the endpoint was invoked without password or internal issue
      if (status === 500 && !/user not found/i.test(backendMsg)) {
        // Backend only reaches password comparison (and potential 500) if the user exists
        return {
          exists: true,
          isPasswordSet: true,
        };
      }

      // Re-throw any connection/network error so caller can display NETWORK_ERROR
      throw err;
    }
  },

  // Step 1 legacy alias: determines if user exists and if logging in for the first time
  identifyUser: async (email) => {
    const res = await authApi.checkEmail(email);
    return {
      exists: res.exists,
      isFirstTime: res.isPasswordSet === false,
      error: res.error,
    };
  },

  // First-time employee email verification
  verifyEmployeeEmail: async (email) => {
    const cleanEmail = email?.trim().toLowerCase();
    try {
      const response = await api.post('/auth/login', {
        email: cleanEmail,
        password: '__first_time_setup_check__',
      });
      const resData = response.data?.data || response.data;
      if (resData?.isPasswordSet === false) {
        return {
          verified: true,
          isFirstTime: true,
          message: 'Account verified! Please set your password.',
        };
      }
      return {
        verified: true,
        isFirstTime: false,
        message: 'A password has already been set for this account. Please sign in.',
      };
    } catch (err) {
      const status = err.response?.status;
      if (status === 404) {
        return {
          verified: false,
          isFirstTime: false,
          message: AUTH_MESSAGES.USER_NOT_FOUND,
        };
      }
      if (status === 401) {
        return {
          verified: true,
          isFirstTime: false,
          message: 'A password has already been set for this account. Please sign in.',
        };
      }
      throw err;
    }
  },

  getMe: async () => {
    const response = await api.get('/auth/me');
    const user = response.data?.data || response.data?.user || response.data;
    return { user };
  },

  logout: async () => {
    try {
      const response = await api.post('/auth/logout');
      return response.data?.data || response.data;
    } catch (err) {
      return null;
    }
  },

  // First-login password activation (public endpoint)
  // Request payload: { email, newPassword, confirmPassword }
  setPassword: async ({ email, newPassword, confirmPassword }) => {
    const response = await api.post('/auth/set-password', {
      email: email?.trim().toLowerCase(),
      newPassword,
      confirmPassword,
    });
    const resData = response.data?.data || response.data;
    return {
      token: resData?.token || resData?.accessToken,
      accessToken: resData?.accessToken || resData?.token,
      refreshToken: resData?.refreshToken,
      user: resData?.user,
      message: resData?.message || response.data?.status?.message || AUTH_MESSAGES.PASSWORD_SET_SUCCESS,
    };
  },

  // Change password for logged-in user (requires Bearer token)
  // Request payload: { currentPassword, newPassword, confirmPassword }
  changePassword: async ({ currentPassword, newPassword, confirmPassword }) => {
    const response = await api.post('/auth/change-password', {
      currentPassword,
      newPassword,
      confirmPassword,
    });
    return response.data?.data || response.data;
  },
};
