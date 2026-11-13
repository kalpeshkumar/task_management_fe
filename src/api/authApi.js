import api from './axios';

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
      message: resData?.message || response.data?.status?.message,
      isPasswordSet: resData?.isPasswordSet,
    };
  },

  // Step 1 identification: determines if a user is logging in for the first time
  // using the existing backend POST /auth/login response without changing any backend code.
  identifyUser: async (email) => {
    const cleanEmail = email?.trim().toLowerCase();
    try {
      const response = await api.post('/auth/login', {
        email: cleanEmail,
        password: '__identify_check__',
      });
      const resData = response.data?.data || response.data;
      if (resData?.isPasswordSet === false) {
        return { isFirstTime: true };
      }
      return { isFirstTime: false };
    } catch (err) {
      // 401 Unauthorized indicates user has a password or credentials were required
      return { isFirstTime: false };
    }
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
      if (status === 401) {
        return {
          verified: false,
          isFirstTime: false,
          message: 'This email is not registered. Please check the spelling or ask your administrator to invite you.',
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
      message: resData?.message || response.data?.status?.message,
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
