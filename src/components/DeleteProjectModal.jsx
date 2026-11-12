// ============================================================================
// DELETE PROJECT MODAL
// Portaled dialog allowing Admin users to safely confirm and delete a project via DELETE /project/:projectId.
// Displays warnings about cascading task deletion and provides clear cancel/confirm options.
// ============================================================================

import React, { useState, useEffect, useCallback } from 'react';
import { X, Trash2, AlertTriangle, Loader2, Folder } from 'lucide-react';
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
        <div className="modal-header-bar" style={{ borderBottomColor: 'var(--rose-100)' }}>
          <div className="modal-header-title-wrap">
            <div
              className="modal-header-icon-box"
              style={{
                backgroundColor: 'var(--rose-50)',
                color: 'var(--rose-600)',
                borderColor: 'var(--rose-200)',
              }}
            >
              <AlertTriangle style={{ width: 20, height: 20 }} />
            </div>
            <div>
              <h3 className="modal-title-text" style={{ color: 'var(--rose-700)' }}>
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
            <X style={{ width: 20, height: 20 }} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-form-content" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.5rem' }}>
          {error && <div className="form-error-alert">{error}</div>}

          <div
            style={{
              padding: '1rem',
              backgroundColor: 'var(--slate-50)',
              borderRadius: '0.625rem',
              border: '1px solid var(--slate-200)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem' }}>
              <Folder style={{ width: 16, height: 16, color: 'var(--teal-600)' }} />
              <strong style={{ fontSize: '0.9375rem', color: 'var(--slate-900)' }}>
                {project.name}
              </strong>
            </div>
            {project.description && (
              <p style={{ fontSize: '0.8125rem', color: 'var(--slate-600)', margin: '0.25rem 0 0.5rem 1.5rem' }}>
                {project.description}
              </p>
            )}
            <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', marginLeft: '1.5rem' }}>
              Associated tasks: <strong>{taskCount}</strong>
            </div>
          </div>

          <p style={{ fontSize: '0.875rem', color: 'var(--slate-600)', lineHeight: 1.5 }}>
            Are you sure you want to permanently delete this project?
            {taskCount > 0 && (
              <span style={{ display: 'block', marginTop: '0.5rem', color: 'var(--rose-600)', fontWeight: 500 }}>
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
              className="modal-close-icon-btn"
              style={{
                padding: '0.5rem 1.125rem',
                borderRadius: '0.5rem',
                border: '1px solid var(--slate-300)',
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
                backgroundColor: 'var(--rose-600)',
                color: '#ffffff',
                padding: '0.5rem 1.125rem',
                borderRadius: '0.5rem',
                fontWeight: 500,
                fontSize: '0.875rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                border: 'none',
                transition: 'background-color 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--rose-700)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--rose-600)')}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" style={{ width: 14, height: 14 }} />
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <Trash2 style={{ width: 14, height: 14 }} />
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
