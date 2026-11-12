// ============================================================================
// TASK DETAILS MODAL
// Portaled dialog displaying complete task details via GET /task/:taskId.
// ============================================================================

import React, { useEffect, useCallback } from 'react';
import { X, CheckSquare, Calendar, User, Folder, Clock, Edit3, Tag } from 'lucide-react';

export const TaskDetailsModal = ({ isOpen, onClose, task, onOpenEdit }) => {
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

  if (!isOpen || !task) return null;

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Not set';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const statusColors = {
    Todo: { bg: 'var(--amber-50)', color: 'var(--amber-700)', border: 'var(--amber-200)' },
    'In Progress': { bg: 'var(--sky-50)', color: 'var(--sky-700)', border: 'var(--sky-200)' },
    Completed: { bg: 'var(--teal-50)', color: 'var(--teal-700)', border: 'var(--teal-200)' },
  };

  const currentStatusStyle = statusColors[task.status] || statusColors.Todo;

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
              <CheckSquare style={{ width: 20, height: 20 }} />
            </div>
            <div>
              <h3 className="modal-title-text">Task Details</h3>
              <p className="modal-subtitle-text">View full task specifications</p>
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

        {/* Content Body */}
        <div className="modal-form-content" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '1.5rem' }}>
          {/* Status & Project pills */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.375rem',
                padding: '0.25rem 0.75rem',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: 600,
                backgroundColor: currentStatusStyle.bg,
                color: currentStatusStyle.color,
                border: `1px solid ${currentStatusStyle.border}`,
              }}
            >
              <Tag style={{ width: 12, height: 12 }} />
              {task.status}
            </span>

            <span className="task-project-pill">
              <Folder style={{ width: 12, height: 12, color: 'var(--slate-500)' }} />
              <span>{task.projectName || task.project_name || 'General Project'}</span>
            </span>
          </div>

          {/* Title */}
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--slate-900)', lineHeight: 1.4 }}>
              {task.title}
            </h2>
          </div>

          {/* Description */}
          {task.description ? (
            <div style={{ padding: '0.875rem', background: 'var(--slate-50)', borderRadius: '0.5rem', border: '1px solid var(--slate-200)' }}>
              <p style={{ fontSize: '0.875rem', color: 'var(--slate-700)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                {task.description}
              </p>
            </div>
          ) : (
            <p style={{ fontSize: '0.875rem', color: 'var(--slate-400)', fontStyle: 'italic' }}>
              No description provided.
            </p>
          )}

          {/* Metadata Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', borderTop: '1px solid var(--slate-200)', paddingTop: '1rem' }}>
            {/* Assignee */}
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--slate-400)', textTransform: 'uppercase' }}>
                Assigned Employee
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                <div className="task-assignee-avatar">
                  {(task.assignedToName || task.assigned_to_name || '?').charAt(0).toUpperCase()}
                </div>
                <div>
                  <p style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--slate-800)' }}>
                    {task.assignedToName || task.assigned_to_name || 'Unassigned'}
                  </p>
                  {task.assignedToEmail && (
                    <p style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                      {task.assignedToEmail}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Due Date */}
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--slate-400)', textTransform: 'uppercase' }}>
                Due Date
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginTop: '0.25rem', fontSize: '0.875rem', color: 'var(--slate-700)' }}>
                <Calendar style={{ width: 14, height: 14, color: 'var(--slate-400)' }} />
                <span>{formatDate(task.dueDate || task.due_date)}</span>
              </div>
            </div>

            {/* Created By */}
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--slate-400)', textTransform: 'uppercase' }}>
                Created By
              </span>
              <p style={{ fontSize: '0.875rem', color: 'var(--slate-700)', marginTop: '0.25rem' }}>
                {task.createdByName || task.created_by_name || 'System Admin'}
              </p>
            </div>

            {/* Created At */}
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--slate-400)', textTransform: 'uppercase' }}>
                Created On
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginTop: '0.25rem', fontSize: '0.875rem', color: 'var(--slate-700)' }}>
                <Clock style={{ width: 14, height: 14, color: 'var(--slate-400)' }} />
                <span>{formatDate(task.createdAt || task.created_at)}</span>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid var(--slate-200)', paddingTop: '1rem' }}>
            <button
              type="button"
              onClick={onClose}
              className="modal-close-icon-btn"
              style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', border: '1px solid var(--slate-300)' }}
            >
              Close
            </button>
            {onOpenEdit && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenEdit(task);
                }}
                className="btn-primary-action"
              >
                <Edit3 style={{ width: 14, height: 14 }} />
                <span>Edit Task</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
