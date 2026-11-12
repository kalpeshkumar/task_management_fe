import api from './axios';
import { normalizeProject } from './normalizers';

export const projectApi = {
  // List all projects with joined task counts and creator details
  getProjects: async () => {
    const response = await api.get('/project');
    const rawList =
      response.data?.data?.projects ||
      response.data?.projects ||
      response.data?.data ||
      [];
    const projects = Array.isArray(rawList) ? rawList.map(normalizeProject) : [];
    return { projects };
  },

  // Paginated project filter (Requires ADMIN role)
  // Payload: { filter: { search, names, createdBys }, page: { page, limit }, sort: { sort, sortBy } }
  getProjectsPaginated: async ({ filter = {}, page = { page: 1, limit: 10 }, sort = { sort: 'createdAt', sortBy: 'DESC' } } = {}) => {
    const response = await api.post('/project/filter/paginated', { filter, page, sort });
    const resData = response.data || {};
    const rawList = resData.data || [];
    const projects = Array.isArray(rawList) ? rawList.map(normalizeProject) : [];
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
    const projects = Array.isArray(rawList) ? rawList.map(normalizeProject) : [];
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

  // Get project by ID (Requires ADMIN role)
  getProjectById: async (projectId) => {
    const response = await api.get(`/project/${projectId}`);
    const rawProject = response.data?.data || response.data;
    return { project: normalizeProject(rawProject) };
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
