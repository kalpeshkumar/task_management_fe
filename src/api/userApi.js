import api from './axios';

export const userApi = {
  // Add a new user (Requires ADMIN role)
  // Request payload: { name, email, role } (Strict: no password)
  // Response returns data with setupToken and setupExpires
  addUser: async ({ name, email, role = 'USER' }) => {
    const payload = {
      name: name?.trim(),
      email: email?.trim().toLowerCase(),
      role: role ? String(role).toUpperCase() : 'USER',
    };
    const response = await api.post('/user/add', payload);
    return response.data?.data || response.data;
  },

  // Paginated user filter (Requires ADMIN role)
  // Payload: { filter: { search, roles, ids, emails }, page: { page, limit }, sort: { sort, sortBy } }
  getUsersPaginated: async ({ filter = {}, page = { page: 1, limit: 10 }, sort = { sort: 'createdAt', sortBy: 'DESC' } } = {}) => {
    const response = await api.post('/user/filter/paginated', { filter, page, sort });
    const resData = response.data || {};
    const rawList = resData.data || [];
    const users = Array.isArray(rawList)
      ? rawList.map((u) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role,
          isPasswordSet: u.isPasswordSet,
          isActive: u.isActive,
          createdAt: u.createdAt,
          updatedAt: u.updatedAt,
        }))
      : [];
    const pagination = resData.pagination || {
      page: page.page || 1,
      limit: page.limit || 10,
      totalRecords: users.length,
      totalPages: 1,
      hasNext: false,
      hasPrevious: false,
    };
    return { users, pagination, sort: resData.sort || sort };
  },

  // Unpaginated user filter (Requires ADMIN role)
  getUsersFilter: async ({ filter = {}, sort = { sort: 'name', sortBy: 'ASC' } } = {}) => {
    const response = await api.post('/user/filter', { filter, sort });
    const rawList = response.data?.data || [];
    const users = Array.isArray(rawList)
      ? rawList.map((u) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role,
          isPasswordSet: u.isPasswordSet,
          isActive: u.isActive,
          createdAt: u.createdAt,
          updatedAt: u.updatedAt,
        }))
      : [];
    return { users };
  },

  // Fetch employees list for task assignment dropdown
  getEmployees: async () => {
    try {
      const response = await api.post('/user/filter', { filter: {} });
      const rawList = response.data?.data || [];
      const employees = Array.isArray(rawList)
        ? rawList.map((u) => ({
            id: u.id,
            name: u.name,
            email: u.email,
            role: u.role,
            isPasswordSet: u.isPasswordSet,
            isActive: u.isActive,
          }))
        : [];
      return { employees };
    } catch (err) {
      try {
        const saved = localStorage.getItem('task_auth_user');
        if (saved) {
          const currentUser = JSON.parse(saved);
          return { employees: [currentUser] };
        }
      } catch (e) {
        // ignore
      }
      return { employees: [] };
    }
  },

  // Retrieve user by ID (Requires ADMIN role)
  getUserById: async (userId) => {
    const response = await api.get(`/user/${userId}`);
    return response.data?.data || response.data;
  },

  // Update user by ID (Requires ADMIN role)
  // Payload: { name, email, role }
  updateUser: async (userId, data) => {
    const payload = {};
    if (data.name) payload.name = data.name.trim();
    if (data.email) payload.email = data.email.trim().toLowerCase();
    if (data.role) payload.role = String(data.role).toUpperCase();
    const response = await api.put(`/user/${userId}`, payload);
    return response.data?.data || response.data;
  },

  // Delete user by ID (Requires ADMIN role)
  deleteUser: async (userId) => {
    const response = await api.delete(`/user/${userId}`);
    return response.data?.data || response.data;
  },
};
