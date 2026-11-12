import api from './axios';
import { normalizeProject, normalizeTask } from './normalizers';
import { getCurrentAuthUser, isCurrentUserAdmin } from './authHelper';

export const projectApi = {
  // List projects with joined task counts and creator details.
  // For employees (non-admin), exclusively returns projects assigned to them (via assigned tasks or created by them),
  // with task counts reflecting their assigned tasks.
  getProjects: async () => {
    const response = await api.get('/project');
    const rawList =
      response.data?.data?.projects ||
      response.data?.projects ||
      response.data?.data ||
      [];
    let projects = Array.isArray(rawList) ? rawList.map(normalizeProject) : [];

    const currentUser = getCurrentAuthUser();
    if (currentUser && !isCurrentUserAdmin()) {
      const currentUserId = Number(currentUser.id);

      // Fetch all tasks from backend to determine project allocations for this employee
      const taskRes = await api.get('/task');
      const rawTasks =
        taskRes.data?.data?.tasks ||
        taskRes.data?.tasks ||
        taskRes.data?.data ||
        [];
      const userTasks = Array.isArray(rawTasks)
        ? rawTasks.map(normalizeTask).filter((t) => {
            const assignedId = Number(t.assignedTo ?? t.assigned_to);
            return assignedId === currentUserId;
          })
        : [];

      // Calculate task count per project for this employee
      const projectTaskCounts = new Map();
      userTasks.forEach((t) => {
        const pid = Number(t.projectId ?? t.project_id);
        if (pid) {
          projectTaskCounts.set(pid, (projectTaskCounts.get(pid) || 0) + 1);
        }
      });

      // An employee sees a project if:
      // 1. Employee has tasks assigned to them within that project, OR
      // 2. Project was created by the employee
      projects = projects
        .filter((p) => {
          const isCreator = Number(p.createdBy ?? p.created_by) === currentUserId;
          const hasAssignedTasks = projectTaskCounts.has(Number(p.id));
          return isCreator || hasAssignedTasks;
        })
        .map((p) => {
          const myCount = projectTaskCounts.get(Number(p.id)) || 0;
          return {
            ...p,
            taskCount: myCount,
            task_count: myCount,
          };
        });
    }

    return { projects };
  },

  // Paginated project filter (Requires ADMIN role)
  // Payload: { filter: { search, names, createdBys }, page: { page, limit }, sort: { sort, sortBy } }
  getProjectsPaginated: async ({ filter = {}, page = { page: 1, limit: 10 }, sort = { sort: 'createdAt', sortBy: 'DESC' } } = {}) => {
    const response = await api.post('/project/filter/paginated', { filter, page, sort });
    const resData = response.data || {};
    const rawList = resData.data || [];
    let projects = Array.isArray(rawList) ? rawList.map(normalizeProject) : [];

    const currentUser = getCurrentAuthUser();
    if (currentUser && !isCurrentUserAdmin()) {
      const currentUserId = Number(currentUser.id);
      projects = projects.filter((p) => Number(p.createdBy ?? p.created_by) === currentUserId);
    }

    const pagination = resData.pagination || {
      page: page.page || 1,
      limit: page.limit || 10,
      totalRecords: projects.length,
      totalPages: 1,
      hasNext: false,
      hasPrevious: false,
    };
    return { projects, pagination, sort: resData.sort || sort };
  },

  // Unpaginated project filter (Requires ADMIN role)
  filterProjects: async ({ filter = {}, sort = { sort: 'createdAt', sortBy: 'DESC' } } = {}) => {
    const response = await api.post('/project/filter', { filter, sort });
    const rawList = response.data?.data || [];
    let projects = Array.isArray(rawList) ? rawList.map(normalizeProject) : [];

    const currentUser = getCurrentAuthUser();
    if (currentUser && !isCurrentUserAdmin()) {
      const currentUserId = Number(currentUser.id);
      projects = projects.filter((p) => Number(p.createdBy ?? p.created_by) === currentUserId);
    }

    return { projects };
  },

  // Create a new project (Requires ADMIN role)
  // Strict schema: { name, description }
  createProject: async (data) => {
    const payload = {
      name: data.name?.trim(),
      description: data.description ? data.description.trim() : null,
    };
    const response = await api.post('/project/add', payload);
    const rawProject = response.data?.data?.project || response.data?.data || response.data;
    const project = normalizeProject(rawProject);
    return { project };
  },

  // Get project by ID.
  // Enforces authorization: Employees can only view projects assigned to them.
  getProjectById: async (projectId) => {
    const response = await api.get(`/project/${projectId}`);
    const rawProject = response.data?.data || response.data;
    const project = normalizeProject(rawProject);

    const currentUser = getCurrentAuthUser();
    if (currentUser && !isCurrentUserAdmin()) {
      const currentUserId = Number(currentUser.id);
      const isCreator = Number(project.createdBy ?? project.created_by) === currentUserId;
      if (!isCreator) {
        // Verify if user has assigned tasks in this project
        const taskRes = await api.get('/task', { params: { projectId } });
        const rawTasks =
          taskRes.data?.data?.tasks ||
          taskRes.data?.tasks ||
          taskRes.data?.data ||
          [];
        const hasAssignedTask = Array.isArray(rawTasks) && rawTasks.some(
          (t) => Number(t.assignedTo ?? t.assigned_to) === currentUserId
        );
        if (!hasAssignedTask) {
          throw new Error('Unauthorized: You do not have access to this project.');
        }
      }
    }

    return { project };
  },

  // Update project by ID (Requires ADMIN role)
  // Strict schema: { name, description }
  updateProject: async (projectId, data) => {
    const payload = {};
    if (data.name !== undefined) payload.name = data.name.trim();
    if (data.description !== undefined) payload.description = data.description ? data.description.trim() : null;
    const response = await api.put(`/project/${projectId}`, payload);
    const rawProject = response.data?.data || response.data;
    return { project: normalizeProject(rawProject) };
  },

  // Delete project by ID (Requires ADMIN role)
  deleteProject: async (projectId) => {
    const response = await api.delete(`/project/${projectId}`);
    return response.data?.data || response.data;
  },
};
