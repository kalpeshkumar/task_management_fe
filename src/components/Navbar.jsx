// ============================================================================
// NAVBAR COMPONENT (TEAL & SLATE THEME)
// Top application bar displaying active project filter and workspace status.
// Single admin identity is cleanly maintained in the sidebar; header shows
// current workspace date and live status indicators in teal accents.
// ============================================================================

import React from 'react';
import { Menu, Folder, X, Calendar, Layers } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useProjects } from '../context/ProjectContext';

export const Navbar = ({ onOpenSidebar }) => {
  const { user } = useAuth();
  const { selectedProject, selectedProjectId, setSelectedProjectId } = useProjects();

  // Format today's date for header display (e.g. "Fri, Nov 6")
  const todayFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(new Date());

  return (
    <header className="navbar-header">
      {/* Left: Mobile hamburger & current active project pill */}
      <div className="navbar-left">
        <button
          onClick={onOpenSidebar}
          className="navbar-menu-btn"
          title="Toggle Navigation Menu"
        >
          <Menu style={{ width: 20, height: 20 }} />
        </button>

        {/* Project context tag */}
        <div className="scope-container">
          <span className="scope-label">
            Scope:
          </span>
          {selectedProjectId ? (
            <div className="scope-badge-project">
              <Folder style={{ width: 14, height: 14, color: 'var(--teal-600)' }} />
              <span className="scope-text">{selectedProject?.name || 'Selected Project'}</span>
              <button
                onClick={() => setSelectedProjectId(null)}
                title="Clear project filter"
                className="scope-clear-btn"
              >
                <X style={{ width: 12, height: 12 }} />
              </button>
            </div>
          ) : (
            <span className="scope-badge-all">
              <Layers style={{ width: 14, height: 14, color: 'var(--slate-500)' }} />
              <span>All Projects</span>
            </span>
          )}
        </div>
      </div>

      {/* Right: Workspace Status & Date Indicator */}
      <div className="navbar-right">
        {/* Date badge */}
        <div className="date-badge">
          <Calendar style={{ width: 14, height: 14, color: 'var(--slate-500)' }} />
          <span>{todayFormatted}</span>
        </div>

        {/* Live system status indicator in Teal */}
        {/* <div className="live-status-badge">
          <span className="ping-container">
            <span className="ping-pulse"></span>
            <span className="ping-dot"></span>
          </span>
          <span className="status-label">Workspace Active</span>
        </div> */}

        {/* Mobile-only avatar button to toggle sidebar on small screens */}
        <button
          onClick={onOpenSidebar}
          className="mobile-avatar-btn"
          title="Open menu"
        >
          {user?.name?.charAt(0)?.toUpperCase() || 'U'}
        </button>
      </div>
    </header>
  );
};
