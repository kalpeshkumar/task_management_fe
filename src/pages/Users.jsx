// ============================================================================
// USERS MANAGEMENT PAGE (ADMIN ONLY)
// Paginated table, search, role filters, user creation with setup token generation,
// user profile editing, and deletion via Swagger APIs:
// POST /user/filter/paginated, POST /user/add, PUT /user/:id, DELETE /user/:id.
// ============================================================================

import React, { useState, useEffect, useCallback } from 'react';
import {
  UserPlus,
  Search,
  User,
  Shield,
  UserCheck,
  CheckCircle2,
  Clock,
  Edit3,
  Trash2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { userApi } from '../api/userApi';
import { CreateUserModal } from '../components/CreateUserModal';
import { EditUserModal } from '../components/EditUserModal';

export const Users = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalRecords: 0,
    totalPages: 1,
    hasNext: false,
    hasPrevious: false,
  });

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [feedback, setFeedback] = useState({ message: '', type: '' });

  const showFeedback = (message, type = 'success') => {
    setFeedback({ message, type });
    setTimeout(() => {
      setFeedback({ message: '', type: '' });
    }, 3500);
  };

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const filter = {};
      if (searchQuery.trim()) {
        filter.search = searchQuery.trim();
      }
      if (roleFilter) {
        filter.roles = [roleFilter];
      }

      const res = await userApi.getUsersPaginated({
        filter,
        page: { page, limit },
        sort: { sort: 'createdAt', sortBy: 'DESC' },
      });

      setUsers(res.users || []);
      setPagination(
        res.pagination || {
          page,
          limit,
          totalRecords: res.users?.length || 0,
          totalPages: 1,
          hasNext: false,
          hasPrevious: false,
        }
      );
    } catch (err) {
      console.error('Failed to load users:', err);
      showFeedback(err.response?.data?.message || 'Failed to load users list', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, limit, searchQuery, roleFilter]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleDelete = async (user) => {
    if (user.id === currentUser?.id) {
      showFeedback('You cannot delete your own logged-in administrator account.', 'error');
      return;
    }

    if (window.confirm(`Are you sure you want to delete user "${user.name}" (${user.email})?`)) {
      try {
        setDeletingId(user.id);
        await userApi.deleteUser(user.id);
        showFeedback(`User "${user.name}" deleted successfully.`, 'success');
        loadUsers();
      } catch (err) {
        console.error(err);
        showFeedback(err.response?.data?.message || 'Failed to delete user', 'error');
      } finally {
        setDeletingId(null);
      }
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Recently';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="tasks-page-container">
      {/* Header */}
      <div className="tasks-page-header">
        <div>
          <div className="tasks-title-group">
            <h2 className="tasks-heading">User Management</h2>
            <span className="tasks-count-pill">
              {pagination.totalRecords} {pagination.totalRecords === 1 ? 'user' : 'users'}
            </span>
          </div>
          <p className="tasks-subheading">
            Manage student and admin accounts, generate activation tokens, and manage role permissions
          </p>
        </div>

        {/* Action Controls */}
        <div className="tasks-controls-row">
          {/* Search box */}
          <div className="search-box-wrapper">
            <Search className="search-box-icon" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="search-box-input"
            />
          </div>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            className="form-select-input"
            style={{ width: 'auto', padding: '0.5rem 0.75rem', fontSize: '0.875rem' }}
          >
            <option value="">All Roles</option>
            <option value="ADMIN">Administrators</option>
            <option value="USER">Students / Employees</option>
          </select>

          <button
            onClick={() => loadUsers()}
            title="Refresh users"
            className="icon-action-btn"
          >
            <RefreshCw style={{ width: 14, height: 14 }} className={loading ? 'animate-spin' : ''} />
          </button>

          {/* Add User Button */}
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary-action"
          >
            <UserPlus style={{ width: 16, height: 16 }} />
            <span>Add User</span>
          </button>
        </div>
      </div>

      {/* Floating feedback alert */}
      {feedback.message && (
        <div
          className={`feedback-alert ${
            feedback.type === 'error' ? 'feedback-error' : 'feedback-success'
          }`}
        >
          {feedback.type === 'error' ? (
            <AlertCircle style={{ width: 16, height: 16, flexShrink: 0 }} />
          ) : (
            <CheckCircle2 style={{ width: 16, height: 16, flexShrink: 0 }} />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Data Table */}
      <div className="dashboard-panel-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ background: 'var(--slate-50)', borderBottom: '1px solid var(--slate-200)', color: 'var(--slate-600)' }}>
                <th style={{ padding: '0.875rem 1.25rem', fontWeight: 600 }}>User</th>
                <th style={{ padding: '0.875rem 1.25rem', fontWeight: 600 }}>Role</th>
                <th style={{ padding: '0.875rem 1.25rem', fontWeight: 600 }}>Password Status</th>
                <th style={{ padding: '0.875rem 1.25rem', fontWeight: 600 }}>Account Status</th>
                <th style={{ padding: '0.875rem 1.25rem', fontWeight: 600 }}>Joined</th>
                <th style={{ padding: '0.875rem 1.25rem', fontWeight: 600, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && users.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'var(--slate-500)' }}>
                    Loading users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '3rem', textAlign: 'center' }}>
                    <div className="empty-state-icon-circle" style={{ margin: '0 auto 1rem' }}>
                      <User style={{ width: 24, height: 24 }} />
                    </div>
                    <p style={{ fontWeight: 600, color: 'var(--slate-800)', marginBottom: '0.25rem' }}>No users found</p>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--slate-500)' }}>
                      {searchQuery || roleFilter ? 'Try clearing the search or filters.' : 'Click "Add User" to create the first profile.'}
                    </p>
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const isSelf = u.id === currentUser?.id;
                  const isAdminRole = String(u.role).toUpperCase() === 'ADMIN';

                  return (
                    <tr
                      key={u.id}
                      style={{
                        borderBottom: '1px solid var(--slate-100)',
                        transition: 'background-color 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--slate-50)')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      {/* User Info */}
                      <td style={{ padding: '0.875rem 1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div className="task-assignee-avatar" style={{ width: 36, height: 36, fontSize: '0.875rem' }}>
                            {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div>
                            <p style={{ fontWeight: 600, color: 'var(--slate-900)' }}>
                              {u.name} {isSelf && <span style={{ fontSize: '0.75rem', color: 'var(--teal-600)', fontWeight: 500 }}>(You)</span>}
                            </p>
                            <p style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>{u.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td style={{ padding: '0.875rem 1.25rem' }}>
                        {isAdminRole ? (
                          <span className="user-role-tag user-role-admin" style={{ display: 'inline-flex' }}>
                            <Shield style={{ width: 10, height: 10 }} /> Admin
                          </span>
                        ) : (
                          <span className="user-role-tag user-role-employee" style={{ display: 'inline-flex' }}>
                            <UserCheck style={{ width: 10, height: 10 }} /> Employee
                          </span>
                        )}
                      </td>

                      {/* Password Status */}
                      <td style={{ padding: '0.875rem 1.25rem' }}>
                        {u.isPasswordSet ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: 'var(--teal-700)', fontWeight: 500, background: 'var(--teal-50)', padding: '0.2rem 0.5rem', borderRadius: '0.375rem', border: '1px solid var(--teal-200)' }}>
                            <CheckCircle2 style={{ width: 12, height: 12 }} />
                            <span>Password Active</span>
                          </span>
                        ) : (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: 'var(--amber-700)', fontWeight: 500, background: 'var(--amber-50)', padding: '0.2rem 0.5rem', borderRadius: '0.375rem', border: '1px solid var(--amber-200)' }}>
                            <Clock style={{ width: 12, height: 12 }} />
                            <span>Setup Pending</span>
                          </span>
                        )}
                      </td>

                      {/* Account Status */}
                      <td style={{ padding: '0.875rem 1.25rem' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', color: u.isActive !== false ? 'var(--emerald-700)' : 'var(--rose-700)' }}>
                          <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: u.isActive !== false ? 'var(--emerald-500, #10b981)' : 'var(--rose-500)' }}></span>
                          <span>{u.isActive !== false ? 'Active' : 'Inactive'}</span>
                        </span>
                      </td>

                      {/* Created Date */}
                      <td style={{ padding: '0.875rem 1.25rem', color: 'var(--slate-500)', fontSize: '0.8125rem' }}>
                        {formatDate(u.createdAt)}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '0.875rem 1.25rem', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}>
                          <button
                            onClick={() => setUserToEdit(u)}
                            title="Edit user profile"
                            className="task-delete-btn"
                            style={{ color: 'var(--slate-500)' }}
                          >
                            <Edit3 style={{ width: 14, height: 14 }} />
                          </button>
                          {!isSelf && (
                            <button
                              onClick={() => handleDelete(u)}
                              disabled={deletingId === u.id}
                              title="Delete user"
                              className="task-delete-btn"
                            >
                              <Trash2 style={{ width: 14, height: 14 }} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {pagination.totalPages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.875rem 1.25rem', borderTop: '1px solid var(--slate-200)', background: 'var(--slate-50)' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--slate-600)' }}>
              Page <strong>{page}</strong> of <strong>{pagination.totalPages}</strong> ({pagination.totalRecords} total users)
            </span>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="icon-action-btn"
                style={{ width: 32, height: 32, opacity: page <= 1 ? 0.4 : 1 }}
                title="Previous page"
              >
                <ChevronLeft style={{ width: 16, height: 16 }} />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={page >= pagination.totalPages}
                className="icon-action-btn"
                style={{ width: 32, height: 32, opacity: page >= pagination.totalPages ? 0.4 : 1 }}
                title="Next page"
              >
                <ChevronRight style={{ width: 16, height: 16 }} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create User Modal */}
      <CreateUserModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onUserCreated={() => {
          showFeedback('User account created with activation link!', 'success');
          loadUsers();
        }}
      />

      {/* Edit User Modal */}
      <EditUserModal
        isOpen={!!userToEdit}
        onClose={() => setUserToEdit(null)}
        user={userToEdit}
        onUserUpdated={(u) => {
          showFeedback(`User "${u.name}" updated successfully.`, 'success');
          loadUsers();
        }}
      />
    </div>
  );
};
