// ============================================================================
// AUTH HELPER UTILITIES
// Inspects active session credentials stored in localStorage to enforce
// client-side role scoping and access control without modifying the backend.
// ============================================================================

export const getCurrentAuthUser = () => {
  try {
    const raw = localStorage.getItem('task_auth_user');
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
};

export const isCurrentUserAdmin = () => {
  const user = getCurrentAuthUser();
  if (!user || !user.role) return false;
  return String(user.role).trim().toLowerCase() === 'admin';
};
