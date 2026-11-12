// ============================================================================
// PROJECTS DIRECTORY PAGE
// Displays all projects with task counts, search, and full CRUD operations (POST /project/add, PUT /project/:id, DELETE /project/:id).
// ============================================================================

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderPlusIcon,
  MagnifyingGlassIcon,
  FolderIcon,
  CalendarDaysIcon,
  UserIcon,
  QueueListIcon,
  ArrowRightIcon,
  PencilSquareIcon,
  TrashIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  Square3Stack3DIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import { useProjects } from '../context/ProjectContext';
import { CreateProjectModal } from '../components/CreateProjectModal';
import { EditProjectModal } from '../components/EditProjectModal';
import { DeleteProjectModal } from '../components/DeleteProjectModal';

export const Projects = () => {
  const { isAdmin } = useAuth();
  const { projects, loading, setSelectedProjectId, deleteProject } = useProjects();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState(null);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [feedback, setFeedback] = useState({ message: '', type: '' });

  const showFeedback = (message, type = 'success') => {
    setFeedback({ message, type });
    setTimeout(() => {
      setFeedback({ message: '', type: '' });
    }, 3500);
  };

  const filteredProjects = useMemo(() => {
    if (!searchQuery.trim()) return projects;
    const q = searchQuery.toLowerCase();
    return projects.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q)) ||
        (p.creatorName && p.creatorName.toLowerCase().includes(q))
    );
  }, [projects, searchQuery]);

  const handleViewTasks = (projectId) => {
    setSelectedProjectId(projectId);
    navigate('/tasks');
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Recently';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="tasks-page-container">
      {/* Page Header */}
      <div className="tasks-page-header">
        <div>
          <div className="tasks-title-group">
            <h2 className="tasks-heading">
              Projects Directory
            </h2>
            <span className="tasks-count-pill">
              {filteredProjects.length} {filteredProjects.length === 1 ? 'project' : 'projects'}
            </span>
          </div>
          <p className="tasks-subheading">
            Manage student workspaces, task allocations, and project scopes
          </p>
        </div>

        {/* Controls */}
        <div className="tasks-controls-row">
          <div className="search-box-wrapper">
            <MagnifyingGlassIcon className="search-box-icon" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-box-input"
            />
          </div>

          {isAdmin && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary-action"
            >
              <FolderPlusIcon style={{ width: 16, height: 16 }} />
              <span>Add Project</span>
            </button>
          )}
        </div>
      </div>

      {/* Floating feedback alert */}
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

      {/* Projects Grid */}
      {loading && projects.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--slate-500)' }}>
          Loading projects...
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="empty-state-box" style={{ background: 'var(--card-bg)', borderRadius: 'var(--card-radius)', border: '1px solid var(--card-border)' }}>
          <div className="empty-state-icon-circle">
            <FolderIcon style={{ width: 28, height: 28 }} />
          </div>
          <h4 className="empty-state-heading">No projects found</h4>
          <p className="empty-state-text">
            {searchQuery
              ? 'Try adjusting your search criteria.'
              : isAdmin
              ? 'Create a new project to start organizing student tasks.'
              : 'You do not have any projects assigned to you yet.'}
          </p>
          {isAdmin && !searchQuery && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary-action"
              style={{ marginTop: '1rem' }}
            >
              <FolderPlusIcon style={{ width: 16, height: 16 }} />
              <span>Create First Project</span>
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {filteredProjects.map((proj) => (
            <div
              key={proj.id}
              className="dashboard-panel-card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease',
              }}
            >
              <div>
                {/* Project Header Row */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: 40, height: 40, borderRadius: '0.375rem', background: '#F5F5F4', border: '1px solid var(--card-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-primary)', flexShrink: 0 }}>
                      <FolderIcon style={{ width: 20, height: 20 }} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--slate-800)', fontFamily: 'var(--font-display)' }}>
                        {proj.name}
                      </h3>
                      <p style={{ fontSize: '0.75rem', color: 'var(--slate-500)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <UserIcon style={{ width: 12, height: 12 }} />
                        <span>By {proj.creatorName || proj.creator_name || 'System Admin'}</span>
                      </p>
                    </div>
                  </div>

                  {isAdmin && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <button
                        onClick={() => setProjectToEdit(proj)}
                        title="Edit project"
                        className="task-delete-btn"
                        style={{ color: 'var(--slate-500)' }}
                      >
                        <PencilSquareIcon style={{ width: 14, height: 14 }} />
                      </button>
                      <button
                        onClick={() => setProjectToDelete(proj)}
                        title="Delete project"
                        className="task-delete-btn"
                      >
                        <TrashIcon style={{ width: 14, height: 14 }} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Description */}
                <p style={{ fontSize: '0.875rem', color: 'var(--slate-600)', lineHeight: 1.5, marginBottom: '1rem', minHeight: '2.5rem' }}>
                  {proj.description || 'No description provided for this project workspace.'}
                </p>
              </div>

              {/* Card Footer */}
              <div style={{ borderTop: '1px solid var(--slate-100)', paddingTop: '0.875rem', marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--brand-primary)', background: '#F5F5F4', padding: '0.25rem 0.625rem', borderRadius: '4px', border: '1px solid var(--card-border)', fontFamily: 'var(--font-mono)' }}>
                    <QueueListIcon style={{ width: 12, height: 12 }} />
                    <span>[ {proj.taskCount ?? proj.task_count ?? 0} tasks ]</span>
                  </span>

                  <span style={{ fontSize: '0.75rem', color: 'var(--slate-400)', display: 'flex', alignItems: 'center', gap: '0.25rem', fontFamily: 'var(--font-mono)' }}>
                    <CalendarDaysIcon style={{ width: 12, height: 12 }} />
                    <span>{formatDate(proj.createdAt || proj.created_at)}</span>
                  </span>
                </div>

                <button
                  onClick={() => handleViewTasks(proj.id)}
                  className="btn-secondary-action"
                  style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem', gap: '0.375rem', borderRadius: '4px' }}
                  title="Filter board by this project"
                >
                  <span>Board</span>
                  <ArrowRightIcon style={{ width: 12, height: 12 }} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />

      {/* Edit Project Modal */}
      <EditProjectModal
        isOpen={!!projectToEdit}
        onClose={() => setProjectToEdit(null)}
        project={projectToEdit}
        onProjectUpdated={(p) => {
          showFeedback(`Project "${p.name}" updated successfully.`, 'success');
        }}
        onProjectDeleted={(p) => {
          showFeedback(`Project "${p.name}" deleted successfully.`, 'success');
        }}
      />

      {/* Delete Project Confirmation Dialog */}
      <DeleteProjectModal
        isOpen={!!projectToDelete}
        project={projectToDelete}
        onClose={() => setProjectToDelete(null)}
        onProjectDeleted={(p) => {
          showFeedback(`Project "${p.name}" deleted successfully.`, 'success');
        }}
      />
    </div>
  );
};
