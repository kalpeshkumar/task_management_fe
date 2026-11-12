// ============================================================================
// TASK CARD COMPONENT
// Represents an individual task card on the Kanban board.
// Shows task title, description, assigned employee, project, due date, and status.
// ============================================================================

import React, { useState } from 'react';
import {
  CalendarDaysIcon,
  FolderIcon,
  TrashIcon,
  ArrowPathIcon,
  LockClosedIcon,
  PencilSquareIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';

export const TaskCard = ({ task, onStatusChange, onDeleteTask, onEditTask, onViewDetails }) => {
  const { isAdmin, user } = useAuth();
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Permission check: Admin can change status of any task.
  // Employee can ONLY change status of tasks assigned to them.
  const isAssignedToMe =
    (task.assigned_to !== undefined && task.assigned_to !== null && Number(task.assigned_to) === Number(user?.id)) ||
    (task.assignedTo !== undefined && task.assignedTo !== null && Number(task.assignedTo) === Number(user?.id));
  const canChangeStatus = isAdmin || isAssignedToMe;

  // Status visual badge styling
  const statusConfig = {
    Todo: {
      selectClass: 'status-todo',
      dotColor: 'var(--amber-500)',
    },
    'In Progress': {
      selectClass: 'status-progress',
      dotColor: 'var(--sky-500)',
    },
    Completed: {
      selectClass: 'status-completed',
      dotColor: 'var(--teal-600)',
    },
  };

  const currentStatusConfig = statusConfig[task.status] || statusConfig.Todo;

  // When user selects a new status in the dropdown:
  // immediately updates local UI state, then triggers backend PATCH
  const handleStatusSelect = async (e) => {
    const newStatus = e.target.value;
    if (newStatus === task.status) return;

    try {
      setUpdating(true);
      await onStatusChange(task.id, newStatus);
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  // Admin only: Delete task
  const handleDelete = async () => {
    if (window.confirm(`Delete task "${task.title}"?`)) {
      try {
        setDeleting(true);
        await onDeleteTask(task.id);
      } catch (err) {
        console.error(err);
        setDeleting(false);
      }
    }
  };

  // Format date helper
  const formatDate = (dateStr) => {
    if (!dateStr) return 'No due date';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Check if due date is passed
  const isOverdue =
    task.due_date &&
    task.status !== 'Completed' &&
    new Date(task.due_date) < new Date(new Date().toDateString());

  return (
    <div className="task-card-box">
      {/* Top Tag & Actions */}
      <div className="task-card-top-row">
        <span className="task-project-pill">
          <FolderIcon style={{ width: 13, height: 13, color: 'var(--slate-500)', flexShrink: 0 }} />
          <span>{task.project_name || 'General'}</span>
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          {onViewDetails && (
            <button
              onClick={() => onViewDetails(task)}
              title="View task details"
              className="task-delete-btn"
              style={{ color: 'var(--slate-500)' }}
            >
              <EyeIcon style={{ width: 14, height: 14 }} />
            </button>
          )}

          {isAdmin && onEditTask && (
            <button
              onClick={() => onEditTask(task)}
              title="Edit task"
              className="task-delete-btn"
              style={{ color: 'var(--slate-500)' }}
            >
              <PencilSquareIcon style={{ width: 14, height: 14 }} />
            </button>
          )}

          {isAdmin && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              title="Delete task"
              className="task-delete-btn"
            >
              {deleting ? (
                <ArrowPathIcon className="animate-spin" style={{ width: 14, height: 14 }} />
              ) : (
                <TrashIcon style={{ width: 14, height: 14 }} />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Task Title & Description */}
      <div>
        <h4
          className="task-card-title"
          onClick={() => onViewDetails && onViewDetails(task)}
          style={{ cursor: onViewDetails ? 'pointer' : 'default' }}
          title={onViewDetails ? 'Click to view details' : undefined}
        >
          {task.title}
        </h4>
        {task.description && (
          <p className="task-card-desc">
            {task.description}
          </p>
        )}
      </div>

      {/* Info Row: Assigned Employee & Due Date */}
      <div className="task-card-info-section">
        {/* Assigned employee */}
        <div className="task-assignee-row">
          <div className="task-assignee-avatar">
            {task.assigned_to_name ? task.assigned_to_name.charAt(0).toUpperCase() : '?'}
          </div>
          <span className="task-assignee-name">
            {task.assigned_to_name || 'Unassigned'}
          </span>
          {isAssignedToMe && (
            <span className="task-assigned-to-me-tag">
              Assigned to you
            </span>
          )}
        </div>

        {/* Due date */}
        <div className={`task-duedate-row ${isOverdue ? 'is-overdue' : ''}`}>
          <CalendarDaysIcon style={{ width: 14, height: 14, flexShrink: 0 }} />
          <span>{formatDate(task.due_date)}</span>
          {isOverdue && (
            <span className="overdue-pill">
              Overdue
            </span>
          )}
        </div>
      </div>

      {/* Status Selector Dropdown */}
      <div className="task-status-control-section">
        <div className="task-status-label-row">
          <label className="task-status-small-label">
            Status
          </label>
          {!canChangeStatus && (
            <span className="task-readonly-indicator">
              <LockClosedIcon style={{ width: 11, height: 11 }} /> Read-only
            </span>
          )}
        </div>

        <div className="task-status-select-wrap">
          <select
            value={task.status}
            onChange={handleStatusSelect}
            disabled={!canChangeStatus || updating}
            title={canChangeStatus ? 'Change task status' : 'Only the assigned employee or Admin can change this status'}
            className={`task-status-select ${canChangeStatus ? currentStatusConfig.selectClass : ''}`}
          >
            <option value="Todo">Todo</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>

          {updating ? (
            <ArrowPathIcon className="task-select-spinner animate-spin" style={{ width: 14, height: 14 }} />
          ) : (
            <span
              className="task-select-dot-icon"
              style={{
                backgroundColor: canChangeStatus ? currentStatusConfig.dotColor : 'var(--slate-400)',
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};
