import React from 'react';
import { TaskCard } from './TaskCard';
import { CircleDot, Clock, CheckCircle2, Inbox } from 'lucide-react';

export const TaskColumn = ({ title, tasks, onStatusChange, onDeleteTask, onEditTask, onViewDetails }) => {
  const columnConfigs = {
    Todo: {
      badgeClass: 'column-badge-todo',
      icon: CircleDot,
      iconColor: 'var(--amber-500)',
    },
    'In Progress': {
      badgeClass: 'column-badge-progress',
      icon: Clock,
      iconColor: 'var(--sky-500)',
    },
    Completed: {
      badgeClass: 'column-badge-completed',
      icon: CheckCircle2,
      iconColor: 'var(--teal-600)',
    },
  };

  const config = columnConfigs[title] || columnConfigs.Todo;
  const Icon = config.icon;

  return (
    <div className="task-column-container">
      {/* Column Header */}
      <div className="column-header-card">
        <div className="column-title-left">
          <Icon style={{ width: 16, height: 16, color: config.iconColor }} />
          <h3 className="column-title-text">{title}</h3>
        </div>
        <span className={`column-count-tag ${config.badgeClass}`}>
          {tasks.length}
        </span>
      </div>

      {/* Cards List */}
      <div className="column-cards-scroll">
        {tasks.length === 0 ? (
          <div className="column-empty-placeholder">
            <Inbox style={{ width: 32, height: 32, marginBottom: 6, opacity: 0.4 }} />
            <p className="column-empty-text">No tasks in {title}</p>
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
