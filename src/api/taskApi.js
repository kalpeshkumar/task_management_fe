import api from './axios';
import { normalizeTask } from './normalizers';

export const taskApi = {
  // List all tasks, optionally filtered by projectId
  getTasks: async (projectId = null) => {
    const params = projectId ? { projectId } : {};
    const response = await api.get('/task', { params });
    const rawList =
      response.data?.data?.tasks ||
      response.data?.tasks ||
      response.data?.data ||
      [];
    const tasks = Array.isArray(rawList) ? rawList.map(normalizeTask) : [];
    return { tasks };
  },

  // Task status counts summary
  getStats: async (projectId = null) => {
    const params = projectId ? { projectId } : {};
    const response = await api.get('/task/stats', { params });
    const rawStats =
      response.data?.data?.stats ||
      response.data?.stats ||
      response.data?.data || {
        total: 0,
        todo: 0,
        in_progress: 0,
        completed: 0,
      };
    return { stats: rawStats };
  },

  // Create a new task (Available to Admin and Employee)
  // Payload: { title, description, projectId, assignedTo, status, dueDate }
  createTask: async (taskData) => {
    const payload = {
      title: taskData.title?.trim(),
      description: taskData.description ? taskData.description.trim() : null,
      projectId: Number(taskData.projectId ?? taskData.project_id),
      assignedTo:
        taskData.assignedTo || taskData.assigned_to
          ? Number(taskData.assignedTo || taskData.assigned_to)
          : null,
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

  // Get task details by ID
  getTaskById: async (taskId) => {
    const response = await api.get(`/task/${taskId}`);
    const rawTask = response.data?.data || response.data;
    return { task: normalizeTask(rawTask) };
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
    const tasks = Array.isArray(rawList) ? rawList.map(normalizeTask) : [];
    return { tasks };
  },

  // Paginated task filter (Requires ADMIN role)
  filterTasksPaginated: async ({ filter = {}, page = { page: 1, limit: 10 }, sort = { sort: 'createdAt', sortBy: 'DESC' } } = {}) => {
    const response = await api.post('/task/filter/paginated', { filter, page, sort });
    const resData = response.data || {};
    const rawList = resData.data || [];
    const tasks = Array.isArray(rawList) ? rawList.map(normalizeTask) : [];
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
