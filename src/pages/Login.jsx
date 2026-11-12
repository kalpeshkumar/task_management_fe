import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircleIcon,
  LockClosedIcon,
  EnvelopeIcon,
  ArrowPathIcon,
  ArrowRightIcon,
  Square3Stack3DIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await login(email, password);
      // After successful login redirect to Dashboard page
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
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
          <h2 className="login-box-heading">Welcome back</h2>
          <p className="login-box-sub">Enter your credentials to access your dashboard</p>

          {error && (
            <div className="login-error-alert">
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="login-form">
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
                  placeholder="e.g. admin@studenttasks.com"
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
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
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
        </div>
      </div>
    </div>
  );
};
