// ============================================================================
// CREATE PROJECT MODAL
// Portaled modal dialog allowing Admin users to create projects.
// Mounts directly to document.body to ensure complete viewport backdrop coverage
// and prevent layout/stacking context clipping.
// ============================================================================

import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, FolderPlus, Loader2 } from 'lucide-react';
import { useProjects } from '../context/ProjectContext';

export const CreateProjectModal = ({ isOpen, onClose }) => {
  const { addProject } = useProjects();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
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
        onClose();
      }
    },
    [isOpen, onClose]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Project name is required');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await addProject({ name: name.trim(), description: description.trim() });
      setName('');
      setDescription('');
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const modalContent = (
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
              <FolderPlus style={{ width: 20, height: 20 }} />
            </div>
            <div>
              <h3 className="modal-title-text">Create New Project</h3>
              <p className="modal-subtitle-text">Group related student tasks</p>
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="modal-form-content">
          {error && (
            <div className="form-error-alert">
              {error}
            </div>
          )}

          <div className="form-field-group">
            <label className="form-field-label">
              Project Name <span className="form-required-star">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. AI Course Portal"
              required
              className="form-text-input"
            />
          </div>

          <div className="form-field-group">
            <label className="form-field-label">
              Description <span className="form-optional-tag">(Optional)</span>
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the project scope and goals..."
              className="form-textarea-input"
            />
          </div>

          <div className="modal-actions-bar">
            <button
              type="button"
              onClick={onClose}
              className="btn-modal-cancel"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-modal-submit"
            >
              {loading && <Loader2 className="animate-spin" style={{ width: 16, height: 16 }} />}
              <span>Create Project</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
