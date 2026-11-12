// ============================================================================
// EDIT USER MODAL
// Portaled dialog allowing Admin to update user details via PUT /user/:userId.
// ============================================================================

import React, { useState, useEffect, useCallback } from 'react';
import { X, UserCheck, Loader2, User, Mail } from 'lucide-react';
import { userApi } from '../api/userApi';

export const EditUserModal = ({ isOpen, onClose, user, onUserUpdated }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('USER');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setRole(user.role ? String(user.role).toUpperCase() : 'USER');
      setError('');
    }
  }, [user]);

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

  // Handle ESC key press
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    },
    [isOpen, onClose]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!isOpen || !user) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Full name is required');
      return;
    }
    if (!email.trim()) {
      setError('Email address is required');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const updated = await userApi.updateUser(user.id, {
        name: name.trim(),
        email: email.trim(),
        role,
      });

      if (onUserUpdated) {
        onUserUpdated(updated);
      }
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message || 'Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      onClick={handleBackdropClick}
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
    >
      <div className="modal-dialog-box modal-dialog-md">
        {/* Header */}
        <div className="modal-header-bar">
          <div className="modal-header-title-wrap">
            <div className="modal-header-icon-box">
              <UserCheck style={{ width: 20, height: 20 }} />
            </div>
            <div>
              <h3 className="modal-title-text">Edit User</h3>
              <p className="modal-subtitle-text">Update user profile and permissions</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="modal-close-icon-btn"
            title="Close"
          >
            <X style={{ width: 20, height: 20 }} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="modal-form-content">
          {error && <div className="form-error-alert">{error}</div>}

          {/* Full Name */}
          <div className="form-field-group">
            <label className="form-field-label">
              Full Name <span className="form-required-star">*</span>
            </label>
            <div className="login-input-wrapper">
              <User className="login-input-icon" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
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
              <Mail className="login-input-icon" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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

          {/* Footer Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <button
              type="button"
              onClick={onClose}
              className="modal-close-icon-btn"
              style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', border: '1px solid var(--slate-300)' }}
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
                  <Loader2 className="animate-spin" style={{ width: 16, height: 16 }} />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
