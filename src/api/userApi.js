import api from './axios';

// Helper to derive a clean, valid alphabetic name from an email address
// Ensures POST /user/add satisfies the backend's strict nameField schema (min 2 alphabets)
export const deriveNameFromEmail = (rawEmail) => {
  if (!rawEmail) return 'Employee User';
  const prefix = String(rawEmail).split('@')[0] || '';
  const cleaned = prefix.replace(/[^A-Za-z]/g, ' ').trim().replace(/\s+/g, ' ');
  if (cleaned.length >= 2) {
    return cleaned
      .split(' ')
      .filter((w) => w.length > 0)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');
  }
  return 'Employee User';
};

export const userApi = {
  // Add a new user (Requires ADMIN role)
  // Request payload: { email, name, role }
  // Admin only needs to provide email. Password is NOT assigned by Admin.
  addUser: async ({ email, name, role = 'USER' }) => {
    const cleanEmail = email?.trim().toLowerCase();
    const cleanName = (name && name.trim()) || deriveNameFromEmail(cleanEmail);
    const cleanRole = role ? String(role).toUpperCase() : 'USER';

    // Send strict CreateUserInput schema: { name, email, role }
    // Created in DB with password: null and isPasswordSet: false
    const response = await api.post('/user/add', {
      name: cleanName,
      email: cleanEmail,
      role: cleanRole,
    });
    return response.data?.data || response.data;
  },

  // Paginated user filter (Requires ADMIN role)
  // Payload: { filter: { search, roles, ids, emails }, page: { page, limit }, sort: { sort, sortBy } }
  getUsersPaginated: async ({ filter = {}, page = { page: 1, limit: 10 }, sort = { sort: 'createdAt', sortBy: 'DESC' } } = {}) => {
    try {
      // Backend POST /user/filter returns all records without the page*limit offset bug on /user/filter/paginated
      const response = await api.post('/user/filter', { filter: {}, sort });
      const rawList = response.data?.data || [];
      const allUsers = Array.isArray(rawList)
        ? rawList.map((u) => ({
            id: u.id,
            name: u.name,
            email: u.email,
            role: u.role,
            isPasswordSet: Boolean(u.isPasswordSet ?? u.is_password_set),
            isActive: u.isActive !== undefined ? u.isActive : (u.is_active !== undefined ? u.is_active : true),
            createdAt: u.createdAt || u.created_at,
            updatedAt: u.updatedAt || u.updated_at,
          }))
        : [];

      // Filter by search query across both name and email (case-insensitive)
      let filtered = allUsers;
      if (filter.search && String(filter.search).trim()) {
        const q = String(filter.search).trim().toLowerCase();
        filtered = filtered.filter(
          (u) =>
            (u.name && u.name.toLowerCase().includes(q)) ||
            (u.email && u.email.toLowerCase().includes(q))
        );
      }

      // Filter by role(s)
      if (filter.roles && Array.isArray(filter.roles) && filter.roles.length > 0) {
        const allowedRoles = filter.roles.map((r) => String(r).toUpperCase());
        filtered = filtered.filter((u) => allowedRoles.includes(String(u.role).toUpperCase()));
      }

      // Filter by emails if provided
      if (filter.emails && Array.isArray(filter.emails) && filter.emails.length > 0) {
        const allowedEmails = filter.emails.map((e) => String(e).toLowerCase());
        filtered = filtered.filter((u) => allowedEmails.includes(String(u.email).toLowerCase()));
      }

      // Filter by IDs if provided
      if (filter.ids && Array.isArray(filter.ids) && filter.ids.length > 0) {
        filtered = filtered.filter((u) => filter.ids.includes(u.id));
      }

      // Slicing pagination
      const currentPage = Math.max(1, Number(page?.page) || 1);
      const currentLimit = Math.max(1, Number(page?.limit) || 10);
      const totalRecords = filtered.length;
      const totalPages = Math.max(1, Math.ceil(totalRecords / currentLimit));
      const safePage = Math.min(currentPage, totalPages);
      const offset = (safePage - 1) * currentLimit;
      const pagedUsers = filtered.slice(offset, offset + currentLimit);

      return {
        users: pagedUsers,
        pagination: {
          page: safePage,
          limit: currentLimit,
          totalRecords,
          totalPages,
          hasNext: safePage < totalPages,
          hasPrevious: safePage > 1,
        },
        sort,
      };
    } catch (err) {
      console.warn('POST /user/filter failed, falling back to /user/filter/paginated', err);
      const response = await api.post('/user/filter/paginated', { filter, page, sort });
      const resData = response.data || {};
      const rawList = resData.data || [];
      const users = Array.isArray(rawList)
        ? rawList.map((u) => ({
            id: u.id,
            name: u.name,
            email: u.email,
            role: u.role,
            isPasswordSet: Boolean(u.isPasswordSet ?? u.is_password_set),
            isActive: u.isActive !== undefined ? u.isActive : (u.is_active !== undefined ? u.is_active : true),
            createdAt: u.createdAt || u.created_at,
            updatedAt: u.updatedAt || u.updated_at,
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
    }
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
          isPasswordSet: Boolean(u.isPasswordSet ?? u.is_password_set),
          isActive: u.isActive !== undefined ? u.isActive : (u.is_active !== undefined ? u.is_active : true),
          createdAt: u.createdAt || u.created_at,
          updatedAt: u.updatedAt || u.updated_at,
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
            isPasswordSet: Boolean(u.isPasswordSet ?? u.is_password_set),
            isActive: u.isActive !== undefined ? u.isActive : (u.is_active !== undefined ? u.is_active : true),
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
