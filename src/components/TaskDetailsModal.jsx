// ============================================================================
// TASK DETAILS MODAL
// Portaled dialog displaying complete task details via GET /task/:taskId.
// ============================================================================

import React, { useEffect, useCallback } from 'react';
import {
  XMarkIcon,
  ClipboardDocumentCheckIcon,
  CalendarDaysIcon,
  UserIcon,
  FolderIcon,
  ClockIcon,
  PencilSquareIcon,
  TagIcon,
} from '@heroicons/react/24/outline';

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
    Todo: { bg: '#FFEDD5', color: '#C2410C', border: '#FED7AA' },
    'In Progress': { bg: '#F1F5F9', color: '#334155', border: '#CBD5E1' },
    Completed: { bg: '#DCFCE7', color: '#166534', border: '#BBF7D0' },
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
              <ClipboardDocumentCheckIcon style={{ width: 20, height: 20 }} />
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
            <XMarkIcon style={{ width: 20, height: 20 }} />
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
                borderRadius: '4px',
                fontSize: '0.75rem',
                fontWeight: 600,
                backgroundColor: currentStatusStyle.bg,
                color: currentStatusStyle.color,
                border: `1px solid ${currentStatusStyle.border}`,
                fontFamily: 'var(--font-mono)',
              }}
            >
              <TagIcon style={{ width: 12, height: 12 }} />
              [ {task.status} ]
            </span>

            <span className="task-project-pill" style={{ fontFamily: 'var(--font-mono)' }}>
              <FolderIcon style={{ width: 12, height: 12, color: 'var(--slate-500)' }} />
              <span>{task.projectName || task.project_name || 'General Project'}</span>
            </span>
          </div>

          {/* Title */}
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--slate-900)', lineHeight: 1.4, fontFamily: 'var(--font-display)' }}>
              {task.title}
            </h2>
          </div>

          {/* Description */}
          {task.description ? (
            <div style={{ padding: '0.875rem', background: '#F5F5F4', borderRadius: '4px', border: '1px solid var(--card-border)' }}>
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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', borderTop: '1px solid var(--card-border)', paddingTop: '1rem' }}>
            {/* Assignee */}
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--slate-400)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
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
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--slate-400)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                Due Date
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginTop: '0.25rem', fontSize: '0.875rem', color: 'var(--slate-700)', fontFamily: 'var(--font-mono)' }}>
                <CalendarDaysIcon style={{ width: 14, height: 14, color: 'var(--slate-400)' }} />
                <span>{formatDate(task.dueDate || task.due_date)}</span>
              </div>
            </div>

            {/* Created By */}
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--slate-400)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                Created By
              </span>
              <p style={{ fontSize: '0.875rem', color: 'var(--slate-700)', marginTop: '0.25rem' }}>
                {task.createdByName || task.created_by_name || 'System Admin'}
              </p>
            </div>

            {/* Created At */}
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--slate-400)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                Created On
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginTop: '0.25rem', fontSize: '0.875rem', color: 'var(--slate-700)', fontFamily: 'var(--font-mono)' }}>
                <ClockIcon style={{ width: 14, height: 14, color: 'var(--slate-400)' }} />
                <span>{formatDate(task.createdAt || task.created_at)}</span>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid var(--card-border)', paddingTop: '1rem' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary-action"
              style={{ padding: '0.5rem 1rem', borderRadius: '4px' }}
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
                <PencilSquareIcon style={{ width: 14, height: 14 }} />
                <span>Edit Task</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
