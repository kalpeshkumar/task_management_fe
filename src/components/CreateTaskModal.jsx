// ============================================================================
// CREATE TASK MODAL
// Portaled modal dialog allowing Admin and Employee users to create and assign tasks.
// Mounts directly to document.body to ensure complete viewport backdrop coverage
// and prevent layout/stacking context clipping.
// ============================================================================

import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  XMarkIcon,
  ClipboardDocumentCheckIcon,
  ArrowPathIcon,
  CalendarDaysIcon,
  UserIcon,
  FolderIcon,
} from '@heroicons/react/24/outline';
import { useProjects } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';
import { userApi } from '../api/userApi';
import { taskApi } from '../api/taskApi';

export const CreateTaskModal = ({ isOpen, onClose, onTaskCreated }) => {
  const { projects, selectedProjectId } = useProjects();
  const { user, isAdmin } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    project_id: '',
    assigned_to: '',
    status: 'Todo',
    due_date: new Date().toISOString().split('T')[0],
  });

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

  useEffect(() => {
    if (isOpen) {
      const defaultProjectId = selectedProjectId
        ? String(selectedProjectId)
        : projects[0]?.id
        ? String(projects[0].id)
        : '';
      const defaultAssignedTo = !isAdmin && user?.id ? String(user.id) : '';

      setFormData((prev) => ({
        ...prev,
        project_id: defaultProjectId,
        title: '',
        description: '',
        assigned_to: defaultAssignedTo,
        status: 'Todo',
        due_date: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      }));
      setError('');

      if (isAdmin) {
        loadEmployees();
      }
    }
  }, [isOpen, selectedProjectId, projects, isAdmin, user]);

  const loadEmployees = async () => {
    try {
      setLoadingEmployees(true);
      const res = await userApi.getEmployees();
      setEmployees(res.employees || []);
      if (res.employees?.length > 0 && !formData.assigned_to) {
        setFormData((prev) => ({ ...prev, assigned_to: String(res.employees[0].id) }));
      }
    } catch (err) {
      console.error('Failed to load employees:', err);
    } finally {
      setLoadingEmployees(false); 
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('Task title is required');
      return;
    }
    if (!formData.project_id) {
      setError('Please select a project');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      const res = await taskApi.createTask(formData);
      if (onTaskCreated) {
        onTaskCreated(res.task);
      }
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to create task');
    } finally {
      setSubmitting(false);
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
      <div className="modal-dialog-box modal-dialog-lg">
        {/* Header */}
        <div className="modal-header-bar">
          <div className="modal-header-title-wrap">
            <div className="modal-header-icon-box">
              <ClipboardDocumentCheckIcon style={{ width: 20, height: 20 }} />
            </div>
            <div>
              <h3 className="modal-title-text">Create New Task</h3>
              <p className="modal-subtitle-text">Assign task to a student / employee</p>
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

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="modal-form-content modal-scrollable-body">
          {error && (
            <div className="form-error-alert">
              {error}
            </div>
          )}

          {/* Title */}
          <div className="form-field-group">
            <label className="form-field-label">
              Task Title <span className="form-required-star">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Build JWT Authentication Flow"
              required
              className="form-text-input"
            />
          </div>

          {/* Project & Assignee row */}
          <div className="form-two-cols">
            <div className="form-field-group">
              <label className="form-field-label">
                <FolderIcon style={{ width: 14, height: 14, color: 'var(--slate-400)' }} /> Project <span className="form-required-star">*</span>
              </label>
              <select
                value={formData.project_id}
                onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                required
                className="form-select-input"
              >
                <option value="" disabled>
                  {projects.length === 0 ? 'No assigned projects available' : 'Select a project'}
                </option>
                {projects.map((proj) => (
                  <option key={proj.id} value={proj.id}>
                    {proj.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-field-group">
              <label className="form-field-label">
                <UserIcon style={{ width: 14, height: 14, color: 'var(--slate-400)' }} /> Assign To <span className="form-required-star">*</span>
              </label>
              {!isAdmin ? (
                <select
                  value={formData.assigned_to}
                  disabled
                  className="form-select-input"
                  style={{ backgroundColor: '#F8FAFC', cursor: 'not-allowed', color: 'var(--slate-700)' }}
                >
                  <option value={user?.id}>
                    {user?.name || user?.email} (You)
                  </option>
                </select>
              ) : (
                <select
                  value={formData.assigned_to}
                  onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                  required
                  disabled={loadingEmployees}
                  className="form-select-input"
                >
                  <option value="" disabled>
                    {loadingEmployees ? 'Loading employees...' : 'Select an employee'}
                  </option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.email})
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Status & Due Date row */}
          <div className="form-two-cols">
            <div className="form-field-group">
              <label className="form-field-label">
                Initial Status
              </label>
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

            <div className="form-field-group">
              <label className="form-field-label">
                <CalendarDaysIcon style={{ width: 14, height: 14, color: 'var(--slate-400)' }} /> Due Date
              </label>
              <input
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                className="form-text-input"
              />
            </div>
          </div>

          {/* Description */}
          <div className="form-field-group">
            <label className="form-field-label">
              Task Details / Instructions
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Outline steps, requirements, or links..."
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
              disabled={submitting}
              className="btn-modal-submit"
            >
              {submitting && <ArrowPathIcon className="animate-spin" style={{ width: 16, height: 16 }} />}
              <span>Create & Assign Task</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
