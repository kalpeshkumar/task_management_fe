// ============================================================================
// CREATE USER MODAL (ADMIN ONLY)
// Allows administrators to add an employee by entering their email address.
// Password is NOT created or assigned by Admin; the employee sets their own password
// during their first-time login onboarding flow.
// ============================================================================

import React, { useState, useEffect, useCallback } from 'react';
import {
  XMarkIcon,
  UserPlusIcon,
  ArrowPathIcon,
  UserIcon,
  EnvelopeIcon,
  InformationCircleIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import { userApi, deriveNameFromEmail } from '../api/userApi';

export const CreateUserModal = ({ isOpen, onClose, onUserCreated }) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('USER');
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
    setEmail('');
    setName('');
    setRole('USER');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError('Employee email address is required');
      return;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(trimmedEmail)) {
      setError('Please provide a valid email address (e.g. employee@company.com)');
      return;
    }

    const trimmedName = name.trim();
    if (trimmedName && !/^[A-Za-z\s]{2,}$/.test(trimmedName)) {
      setError('Name must contain only alphabetic letters (min 2 characters)');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const res = await userApi.addUser({
        email: trimmedEmail,
        name: trimmedName || undefined,
        role,
      });

      if (onUserCreated) {
        onUserCreated(res);
      }
      handleClose();
    } catch (err) {
      console.error('Failed to create user:', err);
      setError(err.response?.data?.status?.message || err.response?.data?.message || err.message || 'Failed to create user');
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
              <h3 className="modal-title-text">Add New Employee</h3>
              <p className="modal-subtitle-text">
                Invite a new employee using their registered email address
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

          {/* Email Address - Primary required field */}
          <div className="form-field-group">
            <label className="form-field-label">
              Employee Email Address <span className="form-required-star">*</span>
            </label>
            <div className="login-input-wrapper">
              <EnvelopeIcon className="login-input-icon" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. employee@company.com"
                required
                autoFocus
                className="login-field-input"
                style={{ paddingLeft: '2.5rem' }}
              />
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--slate-500)', marginTop: '0.25rem' }}>
              The employee will verify this email address during their first-time login to set their password.
            </p>
          </div>

          {/* Full Name (Optional - auto-derived if omitted) */}
          <div className="form-field-group">
            <label className="form-field-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Full Name</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--slate-400)', fontWeight: 400 }}>Optional</span>
            </label>
            <div className="login-input-wrapper">
              <UserIcon className="login-input-icon" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={email ? `Auto: ${deriveNameFromEmail(email)}` : 'e.g. Jane Doe (auto-derived if empty)'}
                className="login-field-input"
                style={{ paddingLeft: '2.5rem' }}
              />
            </div>
          </div>

          {/* Role Selection */}
          <div className="form-field-group">
            <label className="form-field-label">
              Account Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="form-select-input"
            >
              <option value="USER">Employee (Standard Access)</option>
              <option value="ADMIN">Administrator (Full Access)</option>
            </select>
          </div>

          {/* Information Notice */}
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.625rem',
              padding: '0.75rem',
              borderRadius: '0.375rem',
              backgroundColor: '#F8FAFC',
              border: '1px solid var(--card-border)',
              fontSize: '0.75rem',
              color: 'var(--slate-600)',
              lineHeight: 1.45,
            }}
          >
            <InformationCircleIcon style={{ width: 16, height: 16, color: 'var(--teal-600)', flexShrink: 0, marginTop: '0.1rem' }} />
            <span>
              <strong>Employee Self-Setup:</strong> Administrators do not assign passwords. The employee will set and confirm their own password upon their first login.
            </span>
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
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <UserPlusIcon style={{ width: 16, height: 16 }} />
                  <span>Add Employee</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
