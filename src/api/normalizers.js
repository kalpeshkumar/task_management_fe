// Normalizers to reconcile backend API responses with frontend expectations
// Ensures both snake_case and camelCase properties are present

export const normalizeTask = (task) => {
  if (!task) return task;
  const projectId = task.projectId ?? task.project_id;
  const assignedTo = task.assignedTo ?? task.assigned_to ?? null;
  const projectName = task.projectName || task.project_name || '';
  const assignedToName = task.assignedToName || task.assigned_to_name || '';
  const assignedToEmail = task.assignedToEmail || task.assigned_to_email || '';
  const dueDate = task.dueDate || task.due_date || null;
  const createdAt = task.createdAt || task.created_at || null;
  const updatedAt = task.updatedAt || task.updated_at || null;
  const createdBy = task.createdBy ?? task.created_by ?? null;
  const createdByName = task.createdByName || task.created_by_name || '';

  // Normalize status value (handle "TODO", "IN_PROGRESS", "COMPLETED" vs "Todo", "In Progress", "Completed")
  let status = task.status || 'Todo';
  if (status === 'TODO') status = 'Todo';
  else if (status === 'IN_PROGRESS') status = 'In Progress';
  else if (status === 'COMPLETED') status = 'Completed';

  return {
    ...task,
    id: task.id,
    title: task.title,
    description: task.description || '',
    status,
    projectId,
    project_id: projectId,
    projectName,
    project_name: projectName,
    assignedTo,
    assigned_to: assignedTo,
    assignedToName,
    assigned_to_name: assignedToName,
    assignedToEmail,
    assigned_to_email: assignedToEmail,
    dueDate,
    due_date: dueDate,
    createdBy,
    created_by: createdBy,
    createdByName,
    created_by_name: createdByName,
    createdAt,
    created_at: createdAt,
    updatedAt,
    updated_at: updatedAt,
  };
};

export const normalizeProject = (project) => {
  if (!project) return project;
  const createdBy = project.createdBy ?? project.created_by ?? null;
  const creatorName = project.creatorName || project.creator_name || '';
  const taskCount = Number(project.taskCount ?? project.task_count ?? 0);
  const createdAt = project.createdAt || project.created_at || null;
  const updatedAt = project.updatedAt || project.updated_at || null;

  return {
    ...project,
    id: project.id,
    name: project.name,
    description: project.description || '',
    createdBy,
    created_by: createdBy,
    creatorName,
    creator_name: creatorName,
    taskCount,
    task_count: taskCount,
    createdAt,
    created_at: createdAt,
    updatedAt,
    updated_at: updatedAt,
  };
};
