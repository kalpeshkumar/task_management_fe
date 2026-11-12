// ============================================================================
// SIDEBAR COMPONENT (TEAL & SLATE THEME)
// Navigation sidebar with dashboard, tasks board, projects directory, users management (admin),
// projects directory list, and user profile footer with Change Password & Logout.
// ============================================================================

import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Kanban,
  FolderPlus,
  LogOut,
  Folder,
  Layers,
  Shield,
  UserCheck,
  CheckCircle2,
  X,
  Users as UsersIcon,
  KeyRound,
  Trash2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useProjects } from '../context/ProjectContext';
import { CreateProjectModal } from './CreateProjectModal';
import { ChangePasswordModal } from './ChangePasswordModal';
import { DeleteProjectModal } from './DeleteProjectModal';

export const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout, isAdmin } = useAuth();
  const { projects, selectedProjectId, setSelectedProjectId, loading } = useProjects();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const handleProjectClick = (projectId) => {
    setSelectedProjectId(projectId);
    if (location.pathname !== '/tasks' && location.pathname !== '/dashboard') {
      navigate('/tasks');
    }
    if (onClose) onClose();
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="sidebar-backdrop"
        />
      )}

      <aside className={`sidebar-aside ${isOpen ? 'sidebar-open' : ''}`}>
        {/* Logo & Header */}
        <div className="sidebar-header">
          <div className="brand-wrapper">
            <div className="brand-icon-box">
              <CheckCircle2 style={{ width: 20, height: 20 }} />
            </div>
            <div>
              <h1 className="brand-title">
                Task<span className="brand-title-accent">Flow</span>
              </h1>
            </div>
          </div>

          <button
            onClick={onClose}
            className="sidebar-close-btn"
            title="Close navigation"
          >
            <X style={{ width: 20, height: 20 }} />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="sidebar-menu-section">
          <p className="section-label">
            Menu
          </p>
          <NavLink
            to="/dashboard"
            onClick={onClose}
            className={({ isActive }) =>
              `sidebar-nav-link ${isActive ? 'active' : ''}`
            }
          >
            <LayoutDashboard className="sidebar-nav-icon" />
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/tasks"
            onClick={onClose}
            className={({ isActive }) =>
              `sidebar-nav-link ${isActive ? 'active' : ''}`
            }
          >
            <Kanban className="sidebar-nav-icon" />
            <span>Tasks Board</span>
          </NavLink>

          <NavLink
            to="/projects"
            onClick={onClose}
            className={({ isActive }) =>
              `sidebar-nav-link ${isActive ? 'active' : ''}`
            }
          >
            <Folder className="sidebar-nav-icon" />
            <span>Projects</span>
          </NavLink>

          {isAdmin && (
            <NavLink
              to="/users"
              onClick={onClose}
              className={({ isActive }) =>
                `sidebar-nav-link ${isActive ? 'active' : ''}`
              }
            >
              <UsersIcon className="sidebar-nav-icon" />
              <span>User Management</span>
            </NavLink>
          )}
        </div>

        {/* Projects Section */}
        <div className="sidebar-projects-section">
          <div className="projects-header-row">
            <span className="section-label" style={{ padding: 0, margin: 0 }}>
              Projects Scope
            </span>
            {isAdmin && (
              <button
                onClick={() => setShowCreateModal(true)}
                title="Create Project"
                className="create-project-btn"
              >
                <FolderPlus style={{ width: 14, height: 14 }} />
                <span>New</span>
              </button>
            )}
          </div>

          <div className="projects-scroll-list">
            {/* All Projects option */}
            <button
              onClick={() => handleProjectClick(null)}
              className={`project-nav-item ${selectedProjectId === null ? 'active' : ''}`}
            >
              <div className="project-item-left">
                <Layers style={{ width: 16, height: 16, flexShrink: 0 }} />
                <span>All Projects</span>
              </div>
              <span className="project-badge-count">
                {projects.reduce((sum, p) => sum + (p.task_count ?? p.taskCount ?? 0), 0)}
              </span>
            </button>

            {loading && projects.length === 0 ? (
              <p style={{ fontSize: '0.75rem', color: 'var(--slate-400)', padding: '0.5rem 0.75rem' }}>
                Loading projects...
              </p>
            ) : projects.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '1rem 0.5rem', color: 'var(--slate-400)', fontSize: '0.75rem' }}>
                No projects yet.
              </div>
            ) : (
              projects.map((proj) => {
                const isSelected = selectedProjectId === proj.id;
                return (
                  <div
                    key={proj.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      width: '100%',
                    }}
                  >
                    <button
                      onClick={() => handleProjectClick(proj.id)}
                      className={`project-nav-item ${isSelected ? 'active' : ''}`}
                      style={{ flex: 1, minWidth: 0 }}
                    >
                      <div className="project-item-left" style={{ minWidth: 0, overflow: 'hidden' }}>
                        <Folder style={{ width: 16, height: 16, flexShrink: 0 }} />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {proj.name}
                        </span>
                      </div>
                      {(proj.task_count !== undefined || proj.taskCount !== undefined) && (
                        <span className="project-badge-count" style={{ flexShrink: 0 }}>
                          {proj.task_count ?? proj.taskCount}
                        </span>
                      )}
                    </button>
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setProjectToDelete(proj);
                        }}
                        title={`Delete project "${proj.name}"`}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--slate-400)',
                          padding: '0.375rem',
                          borderRadius: '0.375rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          transition: 'color 0.15s, background-color 0.15s',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = 'var(--rose-600)';
                          e.currentTarget.style.backgroundColor = 'var(--rose-50)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = 'var(--slate-400)';
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        <Trash2 style={{ width: 13, height: 13 }} />
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* User Profile and Role Footer */}
        <div className="sidebar-user-footer">
          <div className="user-footer-content">
            <div className="user-profile-left">
              <div className="user-avatar-circle">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="user-meta-info">
                <p className="user-name">
                  {user?.name}
                </p>
                <div>
                  {isAdmin ? (
                    <span className="user-role-tag user-role-admin">
                      <Shield style={{ width: 10, height: 10 }} /> Admin
                    </span>
                  ) : (
                    <span className="user-role-tag user-role-employee">
                      <UserCheck style={{ width: 10, height: 10 }} /> Employee
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <button
                onClick={() => setShowChangePasswordModal(true)}
                title="Change Password"
                className="logout-btn"
                style={{ color: 'var(--slate-500)' }}
              >
                <KeyRound style={{ width: 16, height: 16 }} />
              </button>
              <button
                onClick={handleLogout}
                title="Logout"
                className="logout-btn"
              >
                <LogOut style={{ width: 16, height: 16 }} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Modals */}
      <CreateProjectModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />

      <ChangePasswordModal
        isOpen={showChangePasswordModal}
        onClose={() => setShowChangePasswordModal(false)}
      />

      <DeleteProjectModal
        isOpen={!!projectToDelete}
        project={projectToDelete}
        onClose={() => setProjectToDelete(null)}
        onProjectDeleted={(p) => {
          if (selectedProjectId === p.id) {
            handleProjectClick(null);
          }
        }}
      />
    </>
  );
};
