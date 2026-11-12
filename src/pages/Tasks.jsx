// ============================================================================
// TASKS PAGE (KANBAN BOARD)
// Displays a shared 3-column Kanban board: Todo, In Progress, Completed.
// Supports task creation, status updates, editing, details view, and deletion.
// ============================================================================

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  PlusIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  FolderIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  PencilSquareIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { taskApi } from '../api/taskApi';
import { useAuth } from '../context/AuthContext';
import { useProjects } from '../context/ProjectContext';
import { TaskColumn } from '../components/TaskColumn';
import { CreateTaskModal } from '../components/CreateTaskModal';
import { EditTaskModal } from '../components/EditTaskModal';
import { TaskDetailsModal } from '../components/TaskDetailsModal';
import { EditProjectModal } from '../components/EditProjectModal';
import { DeleteProjectModal } from '../components/DeleteProjectModal';

export const Tasks = () => {
  const { isAdmin } = useAuth();
  const { selectedProjectId, selectedProject, setSelectedProjectId, fetchProjects } = useProjects();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [taskForDetails, setTaskForDetails] = useState(null);
  const [projectToEdit, setProjectToEdit] = useState(null);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [feedback, setFeedback] = useState({ message: '', type: '' });

  // Load all tasks for the board (optionally filtered by selected project)
  const loadTasks = useCallback(async () => {
    try {
      setLoading(true);
      const res = await taskApi.getTasks(selectedProjectId);
      setTasks(res.tasks || []);
    } catch (err) {
      console.error('Failed to load tasks:', err);
      showFeedback('Failed to load tasks.', 'error');
    } finally {
      setLoading(false);
    }
  }, [selectedProjectId]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  // Display a temporary feedback toast (success or error)
  const showFeedback = (message, type = 'success') => {
    setFeedback({ message, type });
    setTimeout(() => {
      setFeedback({ message: '', type: '' });
    }, 3500);
  };

  // Immediate status change without page reload!
  const handleStatusChange = async (taskId, newStatus) => {
    const previousTasks = [...tasks];

    // Optimistic local state update
    setTasks((current) =>
      current.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );

    try {
      const res = await taskApi.updateTaskStatus(taskId, newStatus);
      // Synchronize with server returned task object
      setTasks((current) =>
        current.map((t) => (t.id === taskId ? { ...t, ...res.task } : t))
      );
      showFeedback(`Task moved to ${newStatus}`, 'success');
      fetchProjects();
    } catch (err) {
      console.error(err);
      // Rollback on unauthorized error
      setTasks(previousTasks);
      showFeedback(
        err.response?.data?.message || 'Failed to update task status.',
        'error'
      );
    }
  };

  // Delete task (Admin only)
  const handleDeleteTask = async (taskId) => {
    try {
      await taskApi.deleteTask(taskId);
      setTasks((current) => current.filter((t) => t.id !== taskId));
      showFeedback('Task deleted successfully', 'success');
      fetchProjects();
    } catch (err) {
      console.error(err);
      showFeedback(err.response?.data?.message || 'Failed to delete task', 'error');
    }
  };

  // When a new task is created, append it to the board
  const handleTaskCreated = (newTask) => {
    setTasks((prev) => [newTask, ...prev]);
    showFeedback('Task created and added to the board!', 'success');
    fetchProjects();
  };

  // When a task is updated in EditTaskModal
  const handleTaskUpdated = (updatedTask) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === updatedTask.id ? { ...t, ...updatedTask } : t))
    );
    showFeedback('Task updated successfully!', 'success');
    fetchProjects();
  };

  // Filter tasks based on search input
  const filteredTasks = useMemo(() => {
    if (!searchQuery.trim()) return tasks;
    const q = searchQuery.toLowerCase();
    return tasks.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        (t.description && t.description.toLowerCase().includes(q)) ||
        (t.assigned_to_name && t.assigned_to_name.toLowerCase().includes(q)) ||
        (t.project_name && t.project_name.toLowerCase().includes(q))
    );
  }, [tasks, searchQuery]);

  // Group tasks into the 3 columns: Todo, In Progress, Completed
  const todoTasks = useMemo(
    () => filteredTasks.filter((t) => t.status === 'Todo'),
    [filteredTasks]
  );
  const inProgressTasks = useMemo(
    () => filteredTasks.filter((t) => t.status === 'In Progress'),
    [filteredTasks]
  );
  const completedTasks = useMemo(
    () => filteredTasks.filter((t) => t.status === 'Completed'),
    [filteredTasks]
  );

  return (
    <div className="tasks-page-container">
      {/* Page Header */}
      <div className="tasks-page-header">
        <div>
          <div className="tasks-title-group">
            <h2 className="tasks-heading">
              Tasks Board
            </h2>
            <span className="tasks-count-pill">
              {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'}
            </span>
          </div>
          <p className="tasks-subheading">
            {selectedProjectId ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.625rem', flexWrap: 'wrap', fontWeight: 500, color: 'var(--teal-700)' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}>
                  <FolderIcon style={{ width: 14, height: 14, color: 'var(--brand-primary)' }} /> Filtered by project: <strong>{selectedProject?.name}</strong>
                </span>
                {isAdmin && selectedProject && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', marginLeft: '0.25rem' }}>
                    <button
                      onClick={() => setProjectToEdit(selectedProject)}
                      title="Edit this project"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        fontSize: '0.75rem',
                        padding: '0.15rem 0.5rem',
                        borderRadius: '0.375rem',
                        border: '1px solid var(--slate-300)',
                        backgroundColor: '#ffffff',
                        color: 'var(--slate-700)',
                        cursor: 'pointer',
                        fontWeight: 500,
                      }}
                    >
                      <PencilSquareIcon style={{ width: 13, height: 13 }} />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => setProjectToDelete(selectedProject)}
                      title="Delete this project"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        fontSize: '0.75rem',
                        padding: '0.15rem 0.5rem',
                        borderRadius: '0.375rem',
                        border: '1px solid var(--rose-200)',
                        backgroundColor: 'var(--rose-50)',
                        color: 'var(--rose-700)',
                        cursor: 'pointer',
                        fontWeight: 500,
                      }}
                    >
                      <TrashIcon style={{ width: 13, height: 13 }} />
                      <span>Delete</span>
                    </button>
                  </span>
                )}
              </span>
            ) : (
              <span>
                {isAdmin
                  ? 'Showing all tasks across all employees and projects'
                  : 'Showing tasks assigned to you'}
              </span>
            )}
          </p>
        </div>

        {/* Action Controls */}
        <div className="tasks-controls-row">
          {/* Search box */}
          <div className="search-box-wrapper">
            <MagnifyingGlassIcon className="search-box-icon" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-box-input"
            />
          </div>

          <button
            onClick={() => loadTasks()}
            title="Refresh tasks"
            className="icon-action-btn"
          >
            <ArrowPathIcon style={{ width: 14, height: 14 }} className={loading ? 'animate-spin' : ''} />
          </button>

          {/* Add Task Button */}
          <button
            onClick={() => setShowCreateTaskModal(true)}
            className="btn-primary-action"
          >
            <PlusIcon style={{ width: 16, height: 16 }} />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* Floating status feedback */}
      {feedback.message && (
        <div
          className={`feedback-alert ${
            feedback.type === 'error'
              ? 'feedback-error'
              : 'feedback-success'
          }`}
        >
          {feedback.type === 'error' ? (
            <ExclamationCircleIcon style={{ width: 16, height: 16, flexShrink: 0 }} />
          ) : (
            <CheckCircleIcon style={{ width: 16, height: 16, flexShrink: 0 }} />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* 3-Column Kanban Board */}
      <div className="kanban-board-grid">
        <TaskColumn
          title="Todo"
          tasks={todoTasks}
          onStatusChange={handleStatusChange}
          onDeleteTask={handleDeleteTask}
          onEditTask={(task) => setTaskToEdit(task)}
          onViewDetails={(task) => setTaskForDetails(task)}
        />

        <TaskColumn
          title="In Progress"
          tasks={inProgressTasks}
          onStatusChange={handleStatusChange}
          onDeleteTask={handleDeleteTask}
          onEditTask={(task) => setTaskToEdit(task)}
          onViewDetails={(task) => setTaskForDetails(task)}
        />

        <TaskColumn
          title="Completed"
          tasks={completedTasks}
          onStatusChange={handleStatusChange}
          onDeleteTask={handleDeleteTask}
          onEditTask={(task) => setTaskToEdit(task)}
          onViewDetails={(task) => setTaskForDetails(task)}
        />
      </div>

      {/* Task Creation Modal */}
      <CreateTaskModal
        isOpen={showCreateTaskModal}
        onClose={() => setShowCreateTaskModal(false)}
        onTaskCreated={handleTaskCreated}
      />

      {/* Task Editing Modal */}
      <EditTaskModal
        isOpen={!!taskToEdit}
        onClose={() => setTaskToEdit(null)}
        task={taskToEdit}
        onTaskUpdated={handleTaskUpdated}
      />

      {/* Task Details Modal */}
      <TaskDetailsModal
        isOpen={!!taskForDetails}
        onClose={() => setTaskForDetails(null)}
        task={taskForDetails}
        onOpenEdit={(task) => setTaskToEdit(task)}
      />

      {/* Edit Project Modal */}
      <EditProjectModal
        isOpen={!!projectToEdit}
        onClose={() => setProjectToEdit(null)}
        project={projectToEdit}
        onProjectUpdated={(p) => {
          showFeedback(`Project "${p.name}" updated successfully.`, 'success');
          fetchProjects();
        }}
        onProjectDeleted={(p) => {
          setSelectedProjectId(null);
          showFeedback(`Project "${p.name}" deleted successfully.`, 'success');
        }}
      />

      {/* Delete Project Modal */}
      <DeleteProjectModal
        isOpen={!!projectToDelete}
        onClose={() => setProjectToDelete(null)}
        project={projectToDelete}
        onProjectDeleted={(p) => {
          setSelectedProjectId(null);
          showFeedback(`Project "${p.name}" deleted successfully.`, 'success');
        }}
      />
    </div>
  );
};
