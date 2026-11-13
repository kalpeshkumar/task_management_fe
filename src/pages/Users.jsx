// ============================================================================
// USERS MANAGEMENT PAGE (ADMIN ONLY)
// Paginated table, search, role filters, user creation with setup token generation,
// user profile editing, and deletion via Swagger APIs:
// POST /user/filter/paginated, POST /user/add, PUT /user/:id, DELETE /user/:id.
// ============================================================================

import React, { useState, useEffect, useCallback } from 'react';
import {
  UserPlusIcon,
  MagnifyingGlassIcon,
  UserIcon,
  ShieldCheckIcon,
  CheckBadgeIcon,
  CheckCircleIcon,
  ClockIcon,
  PencilSquareIcon,
  TrashIcon,
  ExclamationCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import { userApi } from '../api/userApi';
import { CreateUserModal } from '../components/CreateUserModal';
import { EditUserModal } from '../components/EditUserModal';
import { DeleteUserModal } from '../components/DeleteUserModal';

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
  const [userToDelete, setUserToDelete] = useState(null);
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
            <MagnifyingGlassIcon className="search-box-icon" />
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
            <ArrowPathIcon style={{ width: 14, height: 14 }} className={loading ? 'animate-spin' : ''} />
          </button>

          {/* Add User Button */}
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary-action"
          >
            <UserPlusIcon style={{ width: 16, height: 16 }} />
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
            <ExclamationCircleIcon style={{ width: 16, height: 16, flexShrink: 0 }} />
          ) : (
            <CheckCircleIcon style={{ width: 16, height: 16, flexShrink: 0 }} />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Data Table */}
      <div className="dashboard-panel-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ background: '#F5F5F4', borderBottom: '1px solid var(--card-border)', color: 'var(--slate-600)' }}>
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
                      <UserIcon style={{ width: 24, height: 24 }} />
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
                        borderBottom: '1px solid #E7E5E4',
                        transition: 'background-color 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#FBF9F5')}
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
                              {u.name} {isSelf && <span style={{ fontSize: '0.75rem', color: 'var(--brand-primary)', fontWeight: 500 }}>(You)</span>}
                            </p>
                            <p style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>{u.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td style={{ padding: '0.875rem 1.25rem' }}>
                        {isAdminRole ? (
                          <span className="user-role-tag user-role-admin" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                            <ShieldCheckIcon style={{ width: 12, height: 12 }} /> Admin
                          </span>
                        ) : (
                          <span className="user-role-tag user-role-employee" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                            <CheckBadgeIcon style={{ width: 12, height: 12 }} /> Employee
                          </span>
                        )}
                      </td>

                      {/* Password Status */}
                      <td style={{ padding: '0.875rem 1.25rem' }}>
                        {u.isPasswordSet ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: '#166534', fontWeight: 500, background: '#DCFCE7', padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1px solid #BBF7D0', fontFamily: 'var(--font-mono)' }}>
                            <CheckCircleIcon style={{ width: 12, height: 12 }} />
                            <span>Active</span>
                          </span>
                        ) : (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: '#C2410C', fontWeight: 500, background: '#FFEDD5', padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1px solid #FED7AA', fontFamily: 'var(--font-mono)' }}>
                            <ClockIcon style={{ width: 12, height: 12 }} />
                            <span>Pending Setup</span>
                          </span>
                        )}
                      </td>

                      {/* Account Status */}
                      <td style={{ padding: '0.875rem 1.25rem' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', color: u.isActive !== false ? '#166534' : '#991B1B' }}>
                          <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: u.isActive !== false ? '#16A34A' : '#DC2626' }}></span>
                          <span>{u.isActive !== false ? 'Active' : 'Inactive'}</span>
                        </span>
                      </td>

                      {/* Created Date */}
                      <td style={{ padding: '0.875rem 1.25rem', color: 'var(--slate-500)', fontSize: '0.8125rem', fontFamily: 'var(--font-mono)' }}>
                        {formatDate(u.createdAt)}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '0.875rem 1.25rem', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          <button
                            type="button"
                            onClick={() => setUserToEdit(u)}
                            title="Edit user profile"
                            className="table-action-btn"
                          >
                            <PencilSquareIcon style={{ width: 14, height: 14 }} />
                            <span>Edit</span>
                          </button>
                          {!isSelf ? (
                            <button
                              type="button"
                              onClick={() => setUserToDelete(u)}
                              title="Delete user"
                              className="table-action-btn table-action-delete"
                            >
                              <TrashIcon style={{ width: 14, height: 14 }} />
                              <span>Delete</span>
                            </button>
                          ) : (
                            <span style={{ fontSize: '0.75rem', color: 'var(--slate-400)', fontStyle: 'italic', padding: '0.25rem 0.5rem' }}>
                              Current Account
                            </span>
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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.875rem 1.25rem', borderTop: '1px solid #E7E5E4', background: '#F5F5F4' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--slate-600)', fontFamily: 'var(--font-mono)' }}>
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
                <ChevronLeftIcon style={{ width: 16, height: 16 }} />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={page >= pagination.totalPages}
                className="icon-action-btn"
                style={{ width: 32, height: 32, opacity: page >= pagination.totalPages ? 0.4 : 1 }}
                title="Next page"
              >
                <ChevronRightIcon style={{ width: 16, height: 16 }} />
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
          showFeedback('User account created successfully! The employee can set their password on first login.', 'success');
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
        onUserDeleted={(u) => {
          showFeedback(`User "${u.name}" deleted successfully.`, 'success');
          loadUsers();
        }}
      />

      {/* Delete User Confirmation Modal */}
      <DeleteUserModal
        isOpen={!!userToDelete}
        onClose={() => setUserToDelete(null)}
        user={userToDelete}
        onUserDeleted={(u) => {
          showFeedback(`User "${u.name}" deleted successfully.`, 'success');
          loadUsers();
        }}
      />
    </div>
  );
};
