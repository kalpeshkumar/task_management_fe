import api from './axios';
import { normalizeTask } from './normalizers';
import { getCurrentAuthUser, isCurrentUserAdmin } from './authHelper';

export const taskApi = {
  // List tasks, optionally filtered by projectId.
  // For employees (non-admin), exclusively returns tasks assigned to the logged-in user.
  getTasks: async (projectId = null) => {
    const params = projectId ? { projectId } : {};
    const response = await api.get('/task', { params });
    const rawList =
      response.data?.data?.tasks ||
      response.data?.tasks ||
      response.data?.data ||
      [];
    let tasks = Array.isArray(rawList) ? rawList.map(normalizeTask) : [];

    const currentUser = getCurrentAuthUser();
    if (currentUser && !isCurrentUserAdmin()) {
      const currentUserId = Number(currentUser.id);
      tasks = tasks.filter((t) => {
        const assignedId = Number(t.assignedTo ?? t.assigned_to);
        return assignedId === currentUserId;
      });
    }

    return { tasks };
  },

  // Task status counts summary.
  // Computes statistics directly from scoped tasks to ensure complete role authorization
  // and prevent route collision issues with /task/:taskId.
  getStats: async (projectId = null) => {
    try {
      const { tasks } = await taskApi.getTasks(projectId);
      const total = tasks.length;
      const todo = tasks.filter((t) => t.status === 'Todo').length;
      const in_progress = tasks.filter((t) => t.status === 'In Progress').length;
      const completed = tasks.filter((t) => t.status === 'Completed').length;
      return {
        stats: {
          total,
          todo,
          in_progress,
          completed,
        },
      };
    } catch (err) {
      console.error('Failed to compute stats:', err);
      return {
        stats: {
          total: 0,
          todo: 0,
          in_progress: 0,
          completed: 0,
        },
      };
    }
  },

  // Create a new task (Available to Admin and Employee)
  // Payload: { title, description, projectId, assignedTo, status, dueDate }
  createTask: async (taskData) => {
    const currentUser = getCurrentAuthUser();
    const isAdmin = isCurrentUserAdmin();

    let targetAssignedTo = taskData.assignedTo || taskData.assigned_to;
    if (!isAdmin && currentUser) {
      // Employees can only create tasks assigned to themselves
      targetAssignedTo = currentUser.id;
    }

    const payload = {
      title: taskData.title?.trim(),
      description: taskData.description ? taskData.description.trim() : null,
      projectId: Number(taskData.projectId ?? taskData.project_id),
      assignedTo: targetAssignedTo ? Number(targetAssignedTo) : null,
      status: taskData.status || 'Todo',
      dueDate: taskData.dueDate || taskData.due_date || null,
    };
    const response = await api.post('/task', payload);
    const rawTask =
      response.data?.data?.task ||
      response.data?.task ||
      response.data?.data;
    return { task: normalizeTask(rawTask) };
  },

  // Get task details by ID.
  // Enforces authorization: Employees can only view their own assigned task details.
  getTaskById: async (taskId) => {
    const response = await api.get(`/task/${taskId}`);
    const rawTask = response.data?.data || response.data;
    const task = normalizeTask(rawTask);

    const currentUser = getCurrentAuthUser();
    if (currentUser && !isCurrentUserAdmin()) {
      const currentUserId = Number(currentUser.id);
      const assignedId = Number(task.assignedTo ?? task.assigned_to);
      if (assignedId !== currentUserId) {
        throw new Error('Unauthorized: You can only view tasks assigned to you.');
      }
    }

    return { task };
  },

  // Update task details (Requires ADMIN role in Swagger)
  // Payload: { title, description, projectId, assignedTo, status, dueDate }
  updateTask: async (taskId, updateData) => {
    const payload = {};
    if (updateData.title !== undefined) payload.title = updateData.title.trim();
    if (updateData.description !== undefined) payload.description = updateData.description ? updateData.description.trim() : null;
    if (updateData.projectId !== undefined || updateData.project_id !== undefined) {
      payload.projectId = Number(updateData.projectId ?? updateData.project_id);
    }
    if (updateData.assignedTo !== undefined || updateData.assigned_to !== undefined) {
      const val = updateData.assignedTo ?? updateData.assigned_to;
      payload.assignedTo = val ? Number(val) : null;
    }
    if (updateData.status !== undefined) payload.status = updateData.status;
    if (updateData.dueDate !== undefined || updateData.due_date !== undefined) {
      payload.dueDate = updateData.dueDate || updateData.due_date || null;
    }

    const response = await api.put(`/task/${taskId}`, payload);
    const rawTask = response.data?.data || response.data;
    return { task: normalizeTask(rawTask) };
  },

  // Update task status (Admin or Assigned Employee)
  updateTaskStatus: async (taskId, status) => {
    const response = await api.patch(`/task/${taskId}/status`, { status });
    const rawTask =
      response.data?.data?.task ||
      response.data?.task ||
      response.data?.data;
    return { task: normalizeTask(rawTask) };
  },

  // Delete task by ID (Requires ADMIN role)
  deleteTask: async (taskId) => {
    const response = await api.delete(`/task/${taskId}`);
    return response.data?.data || response.data;
  },

  // Unpaginated task filter (Requires ADMIN role)
  filterTasks: async ({ filter = {}, sort = { sort: 'createdAt', sortBy: 'DESC' } } = {}) => {
    const response = await api.post('/task/filter', { filter, sort });
    const rawList = response.data?.data || [];
    let tasks = Array.isArray(rawList) ? rawList.map(normalizeTask) : [];

    const currentUser = getCurrentAuthUser();
    if (currentUser && !isCurrentUserAdmin()) {
      const currentUserId = Number(currentUser.id);
      tasks = tasks.filter((t) => Number(t.assignedTo ?? t.assigned_to) === currentUserId);
    }

    return { tasks };
  },

  // Paginated task filter (Requires ADMIN role)
  filterTasksPaginated: async ({ filter = {}, page = { page: 1, limit: 10 }, sort = { sort: 'createdAt', sortBy: 'DESC' } } = {}) => {
    const response = await api.post('/task/filter/paginated', { filter, page, sort });
    const resData = response.data || {};
    const rawList = resData.data || [];
    let tasks = Array.isArray(rawList) ? rawList.map(normalizeTask) : [];

    const currentUser = getCurrentAuthUser();
    if (currentUser && !isCurrentUserAdmin()) {
      const currentUserId = Number(currentUser.id);
      tasks = tasks.filter((t) => Number(t.assignedTo ?? t.assigned_to) === currentUserId);
    }

    const pagination = resData.pagination || {
      page: page.page || 1,
      limit: page.limit || 10,
      totalRecords: tasks.length,
      totalPages: 1,
      hasNext: false,
      hasPrevious: false,
    };
    return { tasks, pagination, sort: resData.sort || sort };
  },
};
