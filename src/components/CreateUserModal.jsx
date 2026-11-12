// ============================================================================
// CREATE USER MODAL
// Portaled dialog allowing Admin to create users via POST /user/add with upfront password setup.
// Includes Full Name, Email, Role, and Password with show/hide toggle.
// ============================================================================

import React, { useState, useEffect, useCallback } from 'react';
import {
  XMarkIcon,
  UserPlusIcon,
  ArrowPathIcon,
  UserIcon,
  EnvelopeIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
} from '@heroicons/react/24/outline';
import { userApi } from '../api/userApi';

export const CreateUserModal = ({ isOpen, onClose, onUserCreated }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('USER');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Lock background scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Handle ESC key press to close modal
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    },
    [isOpen]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleClose = () => {
    setName('');
    setEmail('');
    setRole('USER');
    setPassword('');
    setShowPassword(false);
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) {
      setError('Full name is required (letters only, min 2 chars)');
      return;
    }
    if (!/^[A-Za-z\s]{2,}$/.test(trimmedName)) {
      setError('Name must contain only alphabets and be at least 2 characters');
      return;
    }
    if (!trimmedEmail) {
      setError('Email address is required');
      return;
    }
    if (!password) {
      setError('Password is required');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    if (!/[A-Z]/.test(password)) {
      setError('Password must contain at least one uppercase letter');
      return;
    }
    if (!/[a-z]/.test(password)) {
      setError('Password must contain at least one lowercase letter');
      return;
    }
    if (!/[0-9]/.test(password)) {
      setError('Password must contain at least one number');
      return;
    }
    if (!/[@$!%*?&#]/.test(password)) {
      setError('Password must contain at least one special character (@, $, !, %, *, ?, &, #)');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const res = await userApi.addUser({
        name: trimmedName,
        email: trimmedEmail,
        role,
        password,
      });

      if (onUserCreated) {
        onUserCreated(res);
      }
      handleClose();
    } catch (err) {
      console.error('Failed to create user:', err);
      setError(err.response?.data?.message || err.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  return (
    <div
      onClick={handleBackdropClick}
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
    >
      <div className="modal-dialog-box modal-dialog-md" style={{ maxWidth: 460 }}>
        {/* Header */}
        <div className="modal-header-bar">
          <div className="modal-header-title-wrap">
            <div className="modal-header-icon-box">
              <UserPlusIcon style={{ width: 20, height: 20 }} />
            </div>
            <div>
              <h3 className="modal-title-text">Add New User</h3>
              <p className="modal-subtitle-text">
                Create a student or administrator profile with login credentials
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="modal-close-icon-btn"
            title="Close"
          >
            <XMarkIcon style={{ width: 20, height: 20 }} />
          </button>
        </div>

        {/* Content Form Body */}
        <form onSubmit={handleSubmit} className="modal-form-content">
          {error && <div className="form-error-alert">{error}</div>}

          {/* Full Name */}
          <div className="form-field-group">
            <label className="form-field-label">
              Full Name <span className="form-required-star">*</span>
            </label>
            <div className="login-input-wrapper">
              <UserIcon className="login-input-icon" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Jane Doe (letters only)"
                required
                className="login-field-input"
                style={{ paddingLeft: '2.5rem' }}
              />
            </div>
          </div>

          {/* Email Address */}
          <div className="form-field-group">
            <label className="form-field-label">
              Email Address <span className="form-required-star">*</span>
            </label>
            <div className="login-input-wrapper">
              <EnvelopeIcon className="login-input-icon" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. jane@studenttasks.com"
                required
                className="login-field-input"
                style={{ paddingLeft: '2.5rem' }}
              />
            </div>
          </div>

          {/* Role Selection */}
          <div className="form-field-group">
            <label className="form-field-label">
              User Role <span className="form-required-star">*</span>
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="form-select-input"
            >
              <option value="USER">User / Employee (Standard Access)</option>
              <option value="ADMIN">Administrator (Full Access)</option>
            </select>
          </div>

          {/* Password */}
          <div className="form-field-group">
            <label className="form-field-label">
              Password <span className="form-required-star">*</span>
            </label>
            <div className="login-input-wrapper">
              <LockClosedIcon className="login-input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 8 chars, uppercase, lowercase, number, symbol"
                required
                className="login-field-input"
                style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
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
            <p style={{ fontSize: '0.75rem', color: 'var(--slate-500)', marginTop: '0.25rem' }}>
              Must be at least 8 characters with uppercase, lowercase, number, and special character.
            </p>
          </div>

          {/* Footer Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
            <button
              type="button"
              onClick={handleClose}
              className="btn-secondary-action"
              style={{ padding: '0.5rem 1rem', borderRadius: '4px' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary-action"
            >
              {loading ? (
                <>
                  <ArrowPathIcon className="animate-spin" style={{ width: 16, height: 16 }} />
                  <span>Creating User...</span>
                </>
              ) : (
                <>
                  <UserPlusIcon style={{ width: 16, height: 16 }} />
                  <span>Create User</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
