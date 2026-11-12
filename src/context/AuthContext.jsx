import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/authApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('task_auth_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('task_auth_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyExistingAuth = async () => {
      const savedToken = localStorage.getItem('task_auth_token');
      if (savedToken) {
        try {
          const data = await authApi.getMe();
          if (data?.user) {
            setUser(data.user);
            localStorage.setItem('task_auth_user', JSON.stringify(data.user));
          } else {
            logout();
          }
        } catch (err) {
          console.error('Session expired or invalid:', err);
          logout();
        }
      }
      setLoading(false);
    };

    verifyExistingAuth();
  }, []);

  const login = async (email, password) => {
    const data = await authApi.login(email, password);
    if (data.token) {
      setToken(data.token);
      localStorage.setItem('task_auth_token', data.token);
    }
    if (data.user) {
      setUser(data.user);
      localStorage.setItem('task_auth_user', JSON.stringify(data.user));
    }
    return data;
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (e) {
      // ignore
    }
    setToken(null);
    setUser(null);
    localStorage.removeItem('task_auth_token');
    localStorage.removeItem('task_auth_user');
  };

  const userRole = user?.role?.toLowerCase();
  const isAdmin = userRole === 'admin';
  const isEmployee = userRole === 'employee' || userRole === 'user';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        isAdmin,
        isEmployee,
        isAuthenticated: !!token && !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
