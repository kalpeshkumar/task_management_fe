import React from 'react';
import { TaskCard } from './TaskCard';
import {
  ClockIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ClipboardDocumentListIcon,
} from '@heroicons/react/24/outline';

export const TaskColumn = ({ title, tasks, onStatusChange, onDeleteTask, onEditTask, onViewDetails }) => {
  const columnConfigs = {
    Todo: {
      badgeClass: 'column-badge-todo',
      icon: ClockIcon,
      iconColor: 'var(--amber-700)',
      emptyDesc: 'No pending tasks scheduled for this phase',
    },
    'In Progress': {
      badgeClass: 'column-badge-progress',
      icon: ArrowPathIcon,
      iconColor: 'var(--slate-700)',
      emptyDesc: 'Active work currently under development',
    },
    Completed: {
      badgeClass: 'column-badge-completed',
      icon: CheckCircleIcon,
      iconColor: 'var(--emerald-700)',
      emptyDesc: 'Verified tasks completed and signed off',
    },
  };

  const config = columnConfigs[title] || columnConfigs.Todo;
  const Icon = config.icon;

  return (
    <div className="task-column-container">
      {/* Column Header */}
      <div className="column-header-card">
        <div className="column-title-left">
          <Icon style={{ width: 16, height: 16, color: config.iconColor, strokeWidth: 2 }} />
          <h3 className="column-title-text">{title}</h3>
        </div>
        <span className={`column-count-tag ${config.badgeClass}`}>
          {String(tasks.length).padStart(2, '0')}
        </span>
      </div>

      {/* Cards List */}
      <div className="column-cards-scroll">
        {tasks.length === 0 ? (
          <div className="column-empty-placeholder">
            <div
              className="column-empty-icon-wrap"
              style={{
                backgroundColor: `${config.iconColor}15`,
                color: config.iconColor,
              }}
            >
              <ClipboardDocumentListIcon style={{ width: 22, height: 22, strokeWidth: 1.75 }} />
            </div>
            <p className="column-empty-title">[ No tasks in {title} ]</p>
            <p className="column-empty-desc">{config.emptyDesc}</p>
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onStatusChange={onStatusChange}
              onDeleteTask={onDeleteTask}
              onEditTask={onEditTask}
              onViewDetails={onViewDetails}
            />
          ))
        )}
      </div>
    </div>
  );
};
