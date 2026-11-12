// ============================================================================
// CREATE USER MODAL
// Portaled dialog allowing Admin to create users via POST /user/add.
// Displays the generated setup token / activation link so the admin can copy it.
// ============================================================================

import React, { useState, useEffect, useCallback } from 'react';
import {
  XMarkIcon,
  UserPlusIcon,
  ArrowPathIcon,
  DocumentDuplicateIcon,
  CheckIcon,
  UserIcon,
  EnvelopeIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { userApi } from '../api/userApi';

export const CreateUserModal = ({ isOpen, onClose, onUserCreated }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('USER');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdResult, setCreatedResult] = useState(null);
  const [copied, setCopied] = useState(false);

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
    setError('');
    setCreatedResult(null);
    setCopied(false);
    onClose();
  };

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Full name is required (letters only, min 2 chars)');
      return;
    }
    if (!email.trim()) {
      setError('Email address is required');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const res = await userApi.addUser({
        name: name.trim(),
        email: email.trim(),
        role,
      });

      setCreatedResult(res);
      if (onUserCreated) {
        onUserCreated(res);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  const getSetupLink = () => {
    if (!createdResult) return '';
    const origin = window.location.origin;
    return `${origin}/set-password?email=${encodeURIComponent(createdResult.email || '')}`;
  };

  const handleCopyLink = () => {
    const link = getSetupLink();
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
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
      <div className="modal-dialog-box modal-dialog-md">
        {/* Header */}
        <div className="modal-header-bar">
          <div className="modal-header-title-wrap">
            <div className="modal-header-icon-box">
              <UserPlusIcon style={{ width: 20, height: 20 }} />
            </div>
            <div>
              <h3 className="modal-title-text">
                {createdResult ? 'User Created Successfully' : 'Add New User'}
              </h3>
              <p className="modal-subtitle-text">
                {createdResult
                  ? 'First-login activation link generated'
                  : 'Create a student or administrator profile'}
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

        {/* Content Body */}
        {createdResult ? (
          <div className="modal-form-content" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ padding: '1rem', background: '#FFEDD5', border: '1px solid #FED7AA', borderRadius: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#9A3412', fontWeight: 600, marginBottom: '0.25rem' }}>
                <SparklesIcon style={{ width: 16, height: 16, color: 'var(--brand-primary)' }} />
                <span>Account Created: {createdResult.name}</span>
              </div>
              <p style={{ fontSize: '0.8125rem', color: '#C2410C' }}>
                Per security policy, the password is not set upfront. Send the activation link below to <strong>{createdResult.email}</strong> to complete first-login password setup.
              </p>
            </div>

            <div className="form-field-group">
              <label className="form-field-label">Activation / Setup Link</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  readOnly
                  value={getSetupLink()}
                  className="form-text-input"
                  style={{ background: '#F5F5F4', fontSize: '0.8125rem', color: 'var(--slate-700)', fontFamily: 'var(--font-mono)' }}
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="btn-primary-action"
                  style={{ flexShrink: 0, padding: '0.5rem 1rem' }}
                >
                  {copied ? (
                    <>
                      <CheckIcon style={{ width: 16, height: 16 }} />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <DocumentDuplicateIcon style={{ width: 16, height: 16 }} />
                      <span>Copy Link</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {createdResult.setupToken && (
              <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', wordBreak: 'break-all', fontFamily: 'var(--font-mono)' }}>
                <strong>Raw Setup Token:</strong> <code>{createdResult.setupToken}</code>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button
                type="button"
                onClick={handleClose}
                className="btn-primary-action"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
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

            {/* Note about password */}
            <div style={{ padding: '0.75rem', background: '#F5F5F4', border: '1px solid var(--card-border)', borderRadius: '4px', fontSize: '0.75rem', color: 'var(--slate-600)' }}>
              Initial password is not required. A 48-hour activation setup link will be generated automatically.
            </div>

            {/* Footer Buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
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
        )}
      </div>
    </div>
  );
};
