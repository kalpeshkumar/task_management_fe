// ============================================================================
// DELETE PROJECT MODAL
// Portaled dialog allowing Admin users to safely confirm and delete a project via DELETE /project/:projectId.
// Displays warnings about cascading task deletion and provides clear cancel/confirm options.
// ============================================================================

import React, { useState, useEffect, useCallback } from 'react';
import {
  XMarkIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  FolderIcon,
} from '@heroicons/react/24/outline';
import { useProjects } from '../context/ProjectContext';

export const DeleteProjectModal = ({ isOpen, onClose, project, onProjectDeleted }) => {
  const { deleteProject } = useProjects();
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

  if (!isOpen || !project) return null;

  const handleDelete = async () => {
    try {
      setLoading(true);
      setError('');
      await deleteProject(project.id);
      if (onProjectDeleted) {
        onProjectDeleted(project);
      }
      onClose();
    } catch (err) {
      console.error('Failed to delete project:', err);
      setError(
        err.response?.data?.message ||
        err.message ||
        'Failed to delete project. Please try again.'
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

  const taskCount = project.taskCount ?? project.task_count ?? 0;

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
                Delete Project
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

          <div
            style={{
              padding: '1rem',
              backgroundColor: '#F5F5F4',
              borderRadius: '4px',
              border: '1px solid var(--card-border)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem' }}>
              <FolderIcon style={{ width: 16, height: 16, color: 'var(--brand-primary)' }} />
              <strong style={{ fontSize: '0.9375rem', color: 'var(--slate-900)' }}>
                {project.name}
              </strong>
            </div>
            {project.description && (
              <p style={{ fontSize: '0.8125rem', color: 'var(--slate-600)', margin: '0.25rem 0 0.5rem 1.5rem' }}>
                {project.description}
              </p>
            )}
            <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', marginLeft: '1.5rem', fontFamily: 'var(--font-mono)' }}>
              Associated tasks: <strong>{taskCount}</strong>
            </div>
          </div>

          <p style={{ fontSize: '0.875rem', color: 'var(--slate-600)', lineHeight: 1.5 }}>
            Are you sure you want to permanently delete this project?
            {taskCount > 0 && (
              <span style={{ display: 'block', marginTop: '0.5rem', color: '#DC2626', fontWeight: 500 }}>
                Warning: All {taskCount} task{taskCount === 1 ? '' : 's'} assigned under this project will also be deleted immediately.
              </span>
            )}
          </p>

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
              disabled={loading}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.375rem',
                backgroundColor: '#DC2626',
                color: '#ffffff',
                padding: '0.5rem 1.125rem',
                borderRadius: '4px',
                fontWeight: 500,
                fontSize: '0.875rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
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
                  <span>Delete Project</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
