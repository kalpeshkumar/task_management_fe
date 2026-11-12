// ============================================================================
// DASHBOARD PAGE (TEAL & SLATE THEME)
// Displays task statistics (Total, Todo, In Progress, Completed),
// a 'Recently Completed' activity feed card with rich empty-state illustration,
// a donut status breakdown chart with friendly empty-state treatment,
// and a project-wise stacked bar chart showing task distribution by project.
// Styled with a calm, professional Teal (#0D9488) & Slate (#334155) palette.
// ============================================================================

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  RectangleStackIcon,
  ClockIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ArrowTrendingUpIcon,
  ChartPieIcon,
  ChartBarSquareIcon,
  FolderIcon,
  CheckIcon,
  UserIcon,
  SparklesIcon,
  ClipboardDocumentCheckIcon,
  Square3Stack3DIcon,
} from '@heroicons/react/24/outline';
import { taskApi } from '../api/taskApi';
import { useAuth } from '../context/AuthContext';
import { useProjects } from '../context/ProjectContext';

// Helper to format timestamps into human-readable relative intervals (e.g. "2 hours ago", "1 day ago")
const formatRelativeTime = (dateString) => {
  if (!dateString) return 'recently';
  const now = new Date();
  const past = new Date(dateString);
  const diffInSeconds = Math.max(0, Math.floor((now - past) / 1000));

  if (diffInSeconds < 60) return 'Just now';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
  const diffInMonths = Math.floor(diffInDays / 30);
  return `${diffInMonths} month${diffInMonths === 1 ? '' : 's'} ago`;
};

export const Dashboard = () => {
  const { isAdmin } = useAuth();
  const { projects, selectedProjectId } = useProjects();
  const [stats, setStats] = useState({
    total: 0,
    todo: 0,
    in_progress: 0,
    completed: 0,
  });
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load dashboard statistics and tasks based on project filter
  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const [statsRes, tasksRes] = await Promise.all([
        taskApi.getStats(selectedProjectId),
        taskApi.getTasks(selectedProjectId),
      ]);
      setStats(statsRes.stats || { total: 0, todo: 0, in_progress: 0, completed: 0 });
      setTasks(tasksRes.tasks || []);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedProjectId]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const total = stats.total || 0;
  const todo = stats.todo || 0;
  const inProgress = stats.in_progress || 0;
  const completed = stats.completed || 0;

  // Percentage calculations
  const todoPercent = total > 0 ? Math.round((todo / total) * 100) : 0;
  const inProgressPercent = total > 0 ? Math.round((inProgress / total) * 100) : 0;
  const completedPercent = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Most recently completed tasks feed (limited to last 5, ordered newest first)
  const recentlyCompletedTasks = useMemo(() => {
    return tasks
      .filter((t) => t.status === 'Completed')
      .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
      .slice(0, 5);
  }, [tasks]);

  // SVG Donut Chart parameters
  const radius = 54;
  const circumference = 2 * Math.PI * radius; // ~339.292
  const todoStroke = total > 0 ? (todo / total) * circumference : 0;
  const inProgressStroke = total > 0 ? (inProgress / total) * circumference : 0;
  const completedStroke = total > 0 ? (completed / total) * circumference : 0;

  const todoOffset = 0;
  const inProgressOffset = -todoStroke;
  const completedOffset = -(todoStroke + inProgressStroke);

  // Group tasks by project for the project-wise bar chart
  const projectTaskDistribution = useMemo(() => {
    if (!projects || projects.length === 0) return [];

    const targetProjects = selectedProjectId
      ? projects.filter((p) => Number(p.id) === Number(selectedProjectId))
      : projects;

    const projectMap = new Map();

    // Seed map with authorized project list
    targetProjects.forEach((p) => {
      projectMap.set(Number(p.id), {
        id: p.id,
        name: p.name,
        total: 0,
        todo: 0,
        in_progress: 0,
        completed: 0,
      });
    });

    // Aggregate tasks into their respective projects
    tasks.forEach((t) => {
      const pid = Number(t.project_id ?? t.projectId);
      const entry = projectMap.get(pid);
      if (entry) {
        entry.total += 1;
        if (t.status === 'Todo') entry.todo += 1;
        else if (t.status === 'In Progress') entry.in_progress += 1;
        else if (t.status === 'Completed') entry.completed += 1;
      }
    });

    return Array.from(projectMap.values());
  }, [projects, tasks, selectedProjectId]);

  // Maximum tasks count in any single project to calculate proportional bar lengths
  const maxProjectTasks = useMemo(() => {
    const counts = projectTaskDistribution.map((p) => p.total);
    return Math.max(...counts, 1);
  }, [projectTaskDistribution]);

  return (
    <div className="dashboard-page-container">
      {/* 4 Task-wise Summary Cards at Top */}
      <div className="stats-grid">
        {/* Total Tasks (Terracotta Accent) */}
        <div className="stat-card stat-card-total">
          <div className="stat-card-header">
            <span className="stat-label stat-label-total">
              Total Tasks
            </span>
            <div className="stat-icon-box stat-icon-total">
              <RectangleStackIcon style={{ width: 20, height: 20 }} />
            </div>
          </div>
          <p className="stat-number">
            {loading ? '...' : total}
          </p>
          <div className="stat-meta">
            <ArrowTrendingUpIcon style={{ width: 14, height: 14, color: 'var(--brand-primary)' }} />
            <span>{isAdmin ? 'All projects combined' : 'Assigned to your profile'}</span>
          </div>
        </div>

        {/* Todo Tasks (Amber Accent) */}
        <div className="stat-card stat-card-todo">
          <div className="stat-card-header">
            <span className="stat-label stat-label-todo">
              Todo
            </span>
            <div className="stat-icon-box stat-icon-todo">
              <ClockIcon style={{ width: 20, height: 20 }} />
            </div>
          </div>
          <p className="stat-number">
            {loading ? '...' : todo}
          </p>
          <div className="stat-meta">
            <span className="stat-dot stat-dot-amber"></span>
            <span>{todo === 0 ? 'Queue is clear' : `${todo} awaiting start`}</span>
          </div>
        </div>

        {/* In Progress Tasks (Slate Accent) */}
        <div className="stat-card stat-card-progress">
          <div className="stat-card-header">
            <span className="stat-label stat-label-progress">
              In Progress
            </span>
            <div className="stat-icon-box stat-icon-progress">
              <ArrowPathIcon style={{ width: 20, height: 20 }} />
            </div>
          </div>
          <p className="stat-number">
            {loading ? '...' : inProgress}
          </p>
          <div className="stat-meta">
            <span className="stat-dot stat-dot-sky"></span>
            <span>{inProgress === 0 ? 'None in development' : `${inProgress} active now`}</span>
          </div>
        </div>

        {/* Completed Tasks (Emerald Accent) */}
        <div className="stat-card stat-card-completed">
          <div className="stat-card-header">
            <span className="stat-label stat-label-completed">
              Completed
            </span>
            <div className="stat-icon-box stat-icon-completed">
              <CheckCircleIcon style={{ width: 20, height: 20 }} />
            </div>
          </div>
          <p className="stat-number">
            {loading ? '...' : completed}
          </p>
          <div className="stat-meta">
            <span className="stat-dot stat-dot-teal"></span>
            <span>{completed === 0 ? 'No completions yet' : `${completed} finished`}</span>
          </div>
        </div>
      </div>

      {/* Two Main Sections Below Summary Cards: Recently Completed (Left) & Status Chart (Right) */}
      <div className="dashboard-mid-grid">
        {/* Section 1: Recently Completed Feed Card */}
        <div className="dashboard-panel-card">
          <div>
            <div className="panel-header">
              <div>
                <h3 className="panel-title">Recently Completed</h3>
                <p className="panel-subtitle">Latest finished tasks across projects</p>
              </div>
              <div className="panel-header-icon">
                <CheckCircleIcon style={{ width: 16, height: 16 }} />
              </div>
            </div>

            {/* List of up to 5 recently completed tasks or Proper Empty State */}
            {recentlyCompletedTasks.length === 0 ? (
              <div className="empty-state-box">
                <div className="empty-state-icon-circle">
                  <SparklesIcon style={{ width: 24, height: 24 }} />
                </div>
                <h4 className="empty-state-heading">No completed tasks yet</h4>
                <p className="empty-state-text">
                  Tasks marked as Completed will appear in this feed with project names and completion timestamps.
                </p>
                <div className="empty-state-tag">
                  <ClockIcon style={{ width: 12, height: 12, color: 'var(--slate-400)' }} />
                  <span>Awaiting task activity</span>
                </div>
              </div>
            ) : (
              <div className="recent-tasks-feed">
                {recentlyCompletedTasks.map((task) => (
                  <div key={task.id} className="recent-task-item">
                    {/* Visual cue: checkmark icon with terracotta accent */}
                    <div className="recent-task-check">
                      <CheckIcon style={{ width: 14, height: 14 }} />
                    </div>

                    <div className="recent-task-body">
                      <p className="recent-task-name">
                        {task.title}
                      </p>
                      <div className="recent-task-meta-row">
                        <span className="recent-task-meta-span">
                          <FolderIcon style={{ width: 12, height: 12, color: 'var(--slate-400)', flexShrink: 0 }} />
                          <span className="recent-task-project">{task.project_name || 'General'}</span>
                        </span>
                        <span>•</span>
                        <span className="recent-task-meta-span">
                          <UserIcon style={{ width: 12, height: 12, color: 'var(--slate-400)', flexShrink: 0 }} />
                          <span>{task.assigned_to_name || 'Unassigned'}</span>
                        </span>
                      </div>
                    </div>

                    {/* How long ago it was completed */}
                    <div className="recent-task-timestamp">
                      <ClockIcon style={{ width: 12, height: 12 }} />
                      <span>{formatRelativeTime(task.created_at)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="panel-footer">
            <span style={{ fontWeight: 500, color: 'var(--slate-600)' }}>Completed Total</span>
            <span className="panel-footer-pill">
              {completed} tasks finished
            </span>
          </div>
        </div>

        {/* Section 2: Task Status Breakdown Donut Chart */}
        <div className="dashboard-panel-card">
          <div>
            <div className="panel-header">
              <div>
                <h3 className="panel-title">Task Status Breakdown</h3>
                <p className="panel-subtitle">Distribution across workflow stages</p>
              </div>
              <div className="panel-header-icon">
                <ChartPieIcon style={{ width: 16, height: 16 }} />
              </div>
            </div>

            {total === 0 ? (
              /* Proper Empty State for Donut Chart */
              <div className="donut-empty-wrapper">
                <div className="donut-svg-box">
                  <svg className="donut-svg-chart" viewBox="0 0 140 140">
                    <circle
                      cx="70"
                      cy="70"
                      r={radius}
                      fill="none"
                      stroke="#f1f5f9"
                      strokeWidth="14"
                    />
                    <circle
                      cx="70"
                      cy="70"
                      r={radius}
                      fill="none"
                      stroke="#cbd5e1"
                      strokeWidth="14"
                      strokeDasharray="6 8"
                      style={{ opacity: 0.7 }}
                    />
                  </svg>
                  <div className="donut-center-info">
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: '4px',
                        backgroundColor: 'var(--slate-50)',
                        border: '1px solid var(--slate-200)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--brand-primary)',
                        marginBottom: 2,
                      }}
                    >
                      <ClipboardDocumentCheckIcon style={{ width: 18, height: 18 }} />
                    </div>
                    <span className="donut-center-label">
                      0 Tasks
                    </span>
                  </div>
                </div>

                <div className="donut-empty-card-box">
                  <div className="donut-empty-banner">
                    <p className="donut-empty-banner-title">No Task Distribution Yet</p>
                    <p className="donut-empty-banner-desc">
                      Create tasks to view breakdown percentages across Todo, In Progress, and Completed.
                    </p>
                  </div>

                  <div className="donut-empty-pills-row">
                    <div className="donut-empty-pill donut-empty-pill-todo">
                      <span className="donut-empty-pill-title" style={{ color: 'var(--amber-700)' }}>Todo</span>
                      <span className="donut-empty-pill-val">0%</span>
                    </div>
                    <div className="donut-empty-pill donut-empty-pill-progress">
                      <span className="donut-empty-pill-title" style={{ color: 'var(--sky-700)' }}>In Prog</span>
                      <span className="donut-empty-pill-val">0%</span>
                    </div>
                    <div className="donut-empty-pill donut-empty-pill-completed">
                      <span className="donut-empty-pill-title" style={{ color: 'var(--emerald-700)' }}>Done</span>
                      <span className="donut-empty-pill-val">0%</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Active Donut Chart when tasks exist */
              <div className="donut-chart-wrapper">
                {/* Donut Chart SVG */}
                <div className="donut-svg-box">
                  <svg className="donut-svg-chart" viewBox="0 0 140 140">
                    {/* Background Track */}
                    <circle
                      cx="70"
                      cy="70"
                      r={radius}
                      fill="none"
                      stroke="#f1f5f9"
                      strokeWidth="16"
                    />

                    {/* Todo Segment (Amber) */}
                    {todo > 0 && (
                      <circle
                        cx="70"
                        cy="70"
                        r={radius}
                        fill="none"
                        stroke="#f59e0b"
                        strokeWidth="16"
                        strokeDasharray={`${todoStroke} ${circumference}`}
                        strokeDashoffset={todoOffset}
                        strokeLinecap="round"
                        style={{ transition: 'all 0.5s ease' }}
                      />
                    )}

                    {/* In Progress Segment (Sky/Blue) */}
                    {inProgress > 0 && (
                      <circle
                        cx="70"
                        cy="70"
                        r={radius}
                        fill="none"
                        stroke="#0ea5e9"
                        strokeWidth="16"
                        strokeDasharray={`${inProgressStroke} ${circumference}`}
                        strokeDashoffset={inProgressOffset}
                        strokeLinecap="round"
                        style={{ transition: 'all 0.5s ease' }}
                      />
                    )}

                    {/* Completed Segment (Emerald) */}
                    {completed > 0 && (
                      <circle
                        cx="70"
                        cy="70"
                        r={radius}
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="16"
                        strokeDasharray={`${completedStroke} ${circumference}`}
                        strokeDashoffset={completedOffset}
                        strokeLinecap="round"
                        style={{ transition: 'all 0.5s ease' }}
                      />
                    )}
                  </svg>

                  {/* Center Donut Label */}
                  <div className="donut-center-info">
                    <span className="donut-center-total">
                      {total}
                    </span>
                    <span className="donut-center-label">
                      Total
                    </span>
                  </div>
                </div>

                {/* Chart Legend with Detailed Stats */}
                <div className="donut-legend-stack">
                  {/* Todo Legend Item */}
                  <div className="legend-row legend-row-todo">
                    <div className="legend-left">
                      <span className="legend-dot-circle" style={{ backgroundColor: 'var(--amber-500)' }}></span>
                      <span className="legend-label-text">Todo</span>
                    </div>
                    <div className="legend-right">
                      <span className="legend-count">{todo}</span>
                      <span className="legend-pct-badge legend-pct-todo">
                        {todoPercent}%
                      </span>
                    </div>
                  </div>

                  {/* In Progress Legend Item */}
                  <div className="legend-row legend-row-progress">
                    <div className="legend-left">
                      <span className="legend-dot-circle" style={{ backgroundColor: 'var(--sky-500)' }}></span>
                      <span className="legend-label-text">In Progress</span>
                    </div>
                    <div className="legend-right">
                      <span className="legend-count">{inProgress}</span>
                      <span className="legend-pct-badge legend-pct-progress">
                        {inProgressPercent}%
                      </span>
                    </div>
                  </div>

                  {/* Completed Legend Item (Emerald) */}
                  <div className="legend-row legend-row-completed">
                    <div className="legend-left">
                      <span className="legend-dot-circle" style={{ backgroundColor: 'var(--emerald-500)' }}></span>
                      <span className="legend-label-text">Completed</span>
                    </div>
                    <div className="legend-right">
                      <span className="legend-count">{completed}</span>
                      <span className="legend-pct-badge legend-pct-completed">
                        {completedPercent}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="panel-footer">
            <span style={{ fontWeight: 500, color: 'var(--slate-600)' }}>Workflow Balance</span>
            <span style={{ color: 'var(--slate-700)', fontWeight: 600 }}>
              {total > 0 ? `${completed} of ${total} finished` : 'Ready for tasks'}
            </span>
          </div>
        </div>
      </div>

      {/* Section 3: Project-wise Task Distribution Chart (Stacked Bar Chart) */}
      <div className="project-dist-card">
        {/* Section Header & Status Legend */}
        <div className="project-dist-header">
          <div>
            <div className="project-dist-title-group">
              <div className="panel-header-icon">
                <ChartBarSquareIcon style={{ width: 16, height: 16 }} />
              </div>
              <h3 className="panel-title">Project-wise Task Distribution</h3>
            </div>
            <p className="panel-subtitle" style={{ marginTop: '0.25rem' }}>
              Task volumes and status breakdown across active projects
            </p>
          </div>

          {/* Status Color Legend */}
          <div className="project-dist-legend">
            <div className="legend-chip">
              <span className="legend-dot-circle" style={{ backgroundColor: 'var(--amber-600)' }}></span>
              <span className="legend-chip-label">Todo</span>
            </div>
            <div className="legend-chip">
              <span className="legend-dot-circle" style={{ backgroundColor: 'var(--slate-700)' }}></span>
              <span className="legend-chip-label">In Progress</span>
            </div>
            <div className="legend-chip">
              <span className="legend-dot-circle" style={{ backgroundColor: 'var(--emerald-600)' }}></span>
              <span className="legend-chip-label">Completed</span>
            </div>
          </div>
        </div>

        {/* Project Bars List or Proper Empty State */}
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', fontSize: '0.75rem', color: 'var(--slate-400)' }}>
            Loading project data...
          </div>
        ) : projectTaskDistribution.length === 0 ? (
          <div className="empty-state-box" style={{ padding: '3rem 1rem' }}>
            <div className="empty-state-icon-circle">
              <Square3Stack3DIcon style={{ width: 24, height: 24 }} />
            </div>
            <h4 className="empty-state-heading">No Projects Found</h4>
            <p className="empty-state-text">
              {isAdmin
                ? 'Create a project using the "+ New" button in the sidebar to start organizing tasks.'
                : 'No projects have been assigned yet. Projects created by administrators will appear here.'}
            </p>
          </div>
        ) : (
          <div className="project-bars-container">
            {projectTaskDistribution.map((proj) => {
              // Calculate proportion relative to the project with the most tasks
              const barWidthPercentage =
                proj.total > 0
                  ? Math.max(Math.round((proj.total / maxProjectTasks) * 100), 12)
                  : 0;

              return (
                <div key={proj.id} className="project-bar-unit">
                  {/* Project Info Header: Name & Total Count */}
                  <div className="project-bar-meta">
                    <div className="project-bar-name-wrap">
                      <FolderIcon style={{ width: 14, height: 14, color: 'var(--brand-primary)', flexShrink: 0 }} />
                      <span>{proj.name}</span>
                    </div>

                    <div className="project-bar-counts-wrap">
                      <span className="project-bar-total">
                        {proj.total} {proj.total === 1 ? 'task' : 'tasks'}
                      </span>
                      {proj.total > 0 && (
                        <span className="project-bar-breakdown-text">
                          ({proj.todo} Todo • {proj.in_progress} In Progress • {proj.completed} Done)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Horizontal Stacked Bar */}
                  {proj.total === 0 ? (
                    <div className="project-bar-empty-track">
                      <span className="project-bar-empty-text">
                        No tasks assigned to this project yet
                      </span>
                      <span className="project-bar-empty-pill">
                        Empty
                      </span>
                    </div>
                  ) : (
                    <div className="project-bar-track">
                      <div
                        className="stacked-bar-wrapper"
                        style={{ width: `${barWidthPercentage}%` }}
                      >
                        {/* Todo Segment (Amber) */}
                        {proj.todo > 0 && (
                          <div
                            style={{ width: `${(proj.todo / proj.total) * 100}%` }}
                            className="bar-segment-todo"
                            title={`${proj.name} — Todo: ${proj.todo} (${Math.round((proj.todo / proj.total) * 100)}%)`}
                          >
                            <span style={{ padding: '0 0.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {proj.todo}
                            </span>
                          </div>
                        )}

                        {/* In Progress Segment (Sky/Blue) */}
                        {proj.in_progress > 0 && (
                          <div
                            style={{ width: `${(proj.in_progress / proj.total) * 100}%` }}
                            className="bar-segment-progress"
                            title={`${proj.name} — In Progress: ${proj.in_progress} (${Math.round((proj.in_progress / proj.total) * 100)}%)`}
                          >
                            <span style={{ padding: '0 0.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {proj.in_progress}
                            </span>
                          </div>
                        )}

                        {/* Completed Segment (Teal) */}
                        {proj.completed > 0 && (
                          <div
                            style={{ width: `${(proj.completed / proj.total) * 100}%` }}
                            className="bar-segment-completed"
                            title={`${proj.name} — Completed: ${proj.completed} (${Math.round((proj.completed / proj.total) * 100)}%)`}
                          >
                            <span style={{ padding: '0 0.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {proj.completed}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
