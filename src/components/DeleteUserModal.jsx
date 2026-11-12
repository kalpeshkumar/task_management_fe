// ============================================================================
// DELETE USER MODAL
// Portaled dialog allowing Admin users to safely confirm and delete a user via DELETE /user/:userId.
// Provides warnings about unassigning tasks and prevents deleting the currently logged-in account.
// ============================================================================

import React, { useState, useEffect, useCallback } from 'react';
import {
  XMarkIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  ShieldCheckIcon,
  CheckBadgeIcon,
} from '@heroicons/react/24/outline';
import { userApi } from '../api/userApi';
import { useAuth } from '../context/AuthContext';

export const DeleteUserModal = ({ isOpen, onClose, user, onUserDeleted }) => {
  const { user: currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Lock background scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      setError('');
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

  const isSelf = currentUser?.id === user.id;

  const handleDelete = async () => {
    if (isSelf) {
      setError('You cannot delete your own logged-in administrator account.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await userApi.deleteUser(user.id);
      if (onUserDeleted) {
        onUserDeleted(user);
      }
      onClose();
    } catch (err) {
      console.error('Failed to delete user:', err);
      setError(
        err.response?.data?.message ||
        err.message ||
        'Failed to delete user. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const isAdminRole = String(user.role).toUpperCase() === 'ADMIN';

  return (
    <div
      onClick={handleBackdropClick}
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
    >
      <div className="modal-dialog-box modal-dialog-md" style={{ maxWidth: 440 }}>
        {/* Header */}
        <div className="modal-header-bar" style={{ borderBottomColor: '#FEE2E2' }}>
          <div className="modal-header-title-wrap">
            <div
              className="modal-header-icon-box"
              style={{
                backgroundColor: '#FEF2F2',
                color: '#DC2626',
                borderColor: '#FECACA',
              }}
            >
              <ExclamationTriangleIcon style={{ width: 20, height: 20 }} />
            </div>
            <div>
              <h3 className="modal-title-text" style={{ color: '#B91C1C' }}>
                Delete User Account
              </h3>
              <p className="modal-subtitle-text">This action cannot be undone</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="modal-close-icon-btn"
            title="Close"
          >
            <XMarkIcon style={{ width: 20, height: 20 }} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-form-content" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.5rem' }}>
          {error && <div className="form-error-alert">{error}</div>}

          {/* User Preview Card */}
          <div
            style={{
              padding: '1rem',
              backgroundColor: '#F5F5F4',
              borderRadius: '4px',
              border: '1px solid var(--card-border)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <div className="task-assignee-avatar" style={{ width: 38, height: 38, fontSize: '0.9375rem' }}>
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 600, color: 'var(--slate-900)', fontSize: '0.9375rem', margin: 0 }}>
                  {user.name} {isSelf && <span style={{ fontSize: '0.75rem', color: '#DC2626', fontWeight: 600 }}>(You)</span>}
                </p>
                <p style={{ fontSize: '0.8125rem', color: 'var(--slate-500)', margin: '0.125rem 0 0' }}>
                  {user.email}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px dashed #E7E5E4' }}>
              {isAdminRole ? (
                <span className="user-role-tag user-role-admin" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.6875rem' }}>
                  <ShieldCheckIcon style={{ width: 12, height: 12 }} /> Admin
                </span>
              ) : (
                <span className="user-role-tag user-role-employee" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.6875rem' }}>
                  <CheckBadgeIcon style={{ width: 12, height: 12 }} /> Employee
                </span>
              )}
              <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)', fontFamily: 'var(--font-mono)' }}>
                User ID: #{user.id}
              </span>
            </div>
          </div>

          {isSelf ? (
            <p style={{ fontSize: '0.875rem', color: '#DC2626', lineHeight: 1.5, margin: 0, fontWeight: 500 }}>
              You cannot delete your own account while logged in as administrator.
            </p>
          ) : (
            <p style={{ fontSize: '0.875rem', color: 'var(--slate-600)', lineHeight: 1.5, margin: 0 }}>
              Are you sure you want to permanently delete this user? Any active tasks assigned to this user will become unassigned.
            </p>
          )}

          {/* Action Footer */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '0.75rem',
              marginTop: '0.75rem',
              borderTop: '1px solid var(--slate-100)',
              paddingTop: '1rem',
            }}
          >
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="btn-secondary-action"
              style={{
                padding: '0.5rem 1.125rem',
                borderRadius: '4px',
                fontWeight: 500,
                fontSize: '0.875rem',
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={loading || isSelf}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.375rem',
                backgroundColor: isSelf ? '#9CA3AF' : '#DC2626',
                color: '#ffffff',
                padding: '0.5rem 1.125rem',
                borderRadius: '4px',
                fontWeight: 500,
                fontSize: '0.875rem',
                cursor: loading || isSelf ? 'not-allowed' : 'pointer',
                opacity: loading || isSelf ? 0.7 : 1,
                border: 'none',
                transition: 'background-color 0.15s ease',
              }}
            >
              {loading ? (
                <>
                  <ArrowPathIcon className="animate-spin" style={{ width: 14, height: 14 }} />
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <TrashIcon style={{ width: 14, height: 14 }} />
                  <span>Delete User</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
