import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('task_auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token expiry and extract backend error messages
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If backend returns a standardized error envelope { data: null, status: { message: "..." } },
    // normalize it into error.response.data.message so all error handlers display the clear message.
    if (error.response?.data?.status?.message && !error.response.data.message) {
      error.response.data.message = error.response.data.status.message;
    }

    if (error.response && error.response.status === 401) {
      // If unauthorized, clear stored session if token is invalid
      if (localStorage.getItem('task_auth_token')) {
        localStorage.removeItem('task_auth_token');
        localStorage.removeItem('task_auth_user');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
