import api from './axios';

export const authApi = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
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
      email,
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
