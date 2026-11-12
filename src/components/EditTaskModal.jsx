// ============================================================================
// EDIT TASK MODAL
// Portaled dialog allowing users to update task details via PUT /task/:taskId.
// ============================================================================

import React, { useState, useEffect, useCallback } from 'react';
import {
  XMarkIcon,
  PencilSquareIcon,
  ArrowPathIcon,
  CalendarDaysIcon,
  UserIcon,
  FolderIcon,
} from '@heroicons/react/24/outline';
import { useProjects } from '../context/ProjectContext';
import { userApi } from '../api/userApi';
import { taskApi } from '../api/taskApi';

export const EditTaskModal = ({ isOpen, onClose, task, onTaskUpdated }) => {
  const { projects } = useProjects();
  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    projectId: '',
    assignedTo: '',
    status: 'Todo',
    dueDate: '',
  });

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        projectId: task.projectId ?? task.project_id ? String(task.projectId ?? task.project_id) : '',
        assignedTo: task.assignedTo ?? task.assigned_to ? String(task.assignedTo ?? task.assigned_to) : '',
        status: task.status || 'Todo',
        dueDate: task.dueDate || task.due_date ? String(task.dueDate || task.due_date).split('T')[0] : '',
      });
      setError('');
    }
  }, [task]);

  // Lock background scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      loadEmployees();
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

  const loadEmployees = async () => {
    try {
      setLoadingEmployees(true);
      const res = await userApi.getEmployees();
      setEmployees(res.employees || []);
    } catch (err) {
      console.error('Failed to load employees:', err);
    } finally {
      setLoadingEmployees(false);
    }
  };

  if (!isOpen || !task) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('Task title is required');
      return;
    }
    if (!formData.projectId) {
      setError('Please select a project');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      const payload = {
        title: formData.title.trim(),
        description: formData.description ? formData.description.trim() : null,
        projectId: Number(formData.projectId),
        assignedTo: formData.assignedTo ? Number(formData.assignedTo) : null,
        status: formData.status,
        dueDate: formData.dueDate || null,
      };

      const res = await taskApi.updateTask(task.id, payload);
      if (onTaskUpdated && res.task) {
        onTaskUpdated(res.task);
      }
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message || 'Failed to update task');
    } finally {
      setSubmitting(false);
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
      <div className="modal-dialog-box modal-dialog-lg">
        {/* Header */}
        <div className="modal-header-bar">
          <div className="modal-header-title-wrap">
            <div className="modal-header-icon-box">
              <PencilSquareIcon style={{ width: 20, height: 20 }} />
            </div>
            <div>
              <h3 className="modal-title-text">Edit Task</h3>
              <p className="modal-subtitle-text">Update task details and assignment</p>
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
        <form onSubmit={handleSubmit} className="modal-form-content modal-scrollable-body">
          {error && <div className="form-error-alert">{error}</div>}

          {/* Title */}
          <div className="form-field-group">
            <label className="form-field-label">
              Task Title <span className="form-required-star">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Implement authentication middleware"
              required
              className="form-text-input"
            />
          </div>

          {/* Description */}
          <div className="form-field-group">
            <label className="form-field-label">
              Description <span className="form-optional-tag">(Optional)</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe requirements, acceptance criteria, or links..."
              rows={3}
              className="form-textarea-input"
            />
          </div>

          {/* Project & Assignee row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            {/* Project Selection */}
            <div className="form-field-group">
              <label className="form-field-label">
                <FolderIcon style={{ width: 14, height: 14, display: 'inline', marginRight: 4 }} />
                Project <span className="form-required-star">*</span>
              </label>
              <select
                value={formData.projectId}
                onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                required
                className="form-select-input"
              >
                <option value="">Select a project...</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Assignee Selection */}
            <div className="form-field-group">
              <label className="form-field-label">
                <UserIcon style={{ width: 14, height: 14, display: 'inline', marginRight: 4 }} />
                Assignee
              </label>
              <select
                value={formData.assignedTo}
                onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                className="form-select-input"
                disabled={loadingEmployees}
              >
                <option value="">Unassigned</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({emp.email})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Status & Due Date row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            {/* Status Selection */}
            <div className="form-field-group">
              <label className="form-field-label">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="form-select-input"
              >
                <option value="Todo">Todo</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            {/* Due Date */}
            <div className="form-field-group">
              <label className="form-field-label">
                <CalendarDaysIcon style={{ width: 14, height: 14, display: 'inline', marginRight: 4 }} />
                Due Date
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="form-text-input"
              />
            </div>
          </div>

          {/* Footer Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
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
              disabled={submitting}
              className="btn-primary-action"
            >
              {submitting ? (
                <>
                  <ArrowPathIcon className="animate-spin" style={{ width: 16, height: 16 }} />
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
