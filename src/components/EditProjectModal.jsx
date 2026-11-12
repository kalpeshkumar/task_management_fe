// ============================================================================
// EDIT PROJECT MODAL
// Portaled dialog allowing Admin users to update project details via PUT /project/:projectId,
// or trigger deletion via DELETE /project/:projectId.
// ============================================================================

import React, { useState, useEffect, useCallback } from 'react';
import {
  XMarkIcon,
  PencilSquareIcon,
  ArrowPathIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { useProjects } from '../context/ProjectContext';
import { DeleteProjectModal } from './DeleteProjectModal';

export const EditProjectModal = ({ isOpen, onClose, project, onProjectUpdated, onProjectDeleted }) => {
  const { updateProject } = useProjects();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (project) {
      setName(project.name || '');
      setDescription(project.description || '');
      setError('');
    }
  }, [project]);

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

  if (!isOpen || !project) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Project name is required');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const updated = await updateProject(project.id, {
        name: name.trim(),
        description: description ? description.trim() : null,
      });

      if (onProjectUpdated) {
        onProjectUpdated(updated);
      }
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message || 'Failed to update project');
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
    <>
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
                <PencilSquareIcon style={{ width: 20, height: 20 }} />
              </div>
              <div>
                <h3 className="modal-title-text">Edit Project</h3>
                <p className="modal-subtitle-text">Update project title and description</p>
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

          {/* Form Body */}
          <form onSubmit={handleSubmit} className="modal-form-content">
            {error && <div className="form-error-alert">{error}</div>}

            {/* Project Name */}
            <div className="form-field-group">
              <label className="form-field-label">
                Project Name <span className="form-required-star">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Final Year Capstone"
                required
                className="form-text-input"
              />
            </div>

            {/* Project Description */}
            <div className="form-field-group">
              <label className="form-field-label">
                Description <span className="form-optional-tag">(Optional)</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief details about the project goals and deliverables..."
                rows={3}
                className="form-textarea-input"
              />
            </div>

            {/* Footer Buttons */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '1rem',
                borderTop: '1px solid var(--slate-100)',
                paddingTop: '1rem',
              }}
            >
              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  color: '#DC2626',
                  background: 'transparent',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '4px',
                  fontSize: '0.8125rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  border: '1px solid transparent',
                  transition: 'background-color 0.15s ease',
                }}
              >
                <TrashIcon style={{ width: 14, height: 14 }} />
                <span>Delete Project</span>
              </button>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={onClose}
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
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Delete Project Confirmation Dialog */}
      <DeleteProjectModal
        isOpen={showDeleteModal}
        project={project}
        onClose={() => setShowDeleteModal(false)}
        onProjectDeleted={(p) => {
          setShowDeleteModal(false);
          if (onProjectDeleted) onProjectDeleted(p);
          onClose();
        }}
      />
    </>
  );
};
