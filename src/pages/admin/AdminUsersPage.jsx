import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { SkeletonTable } from '../../components/shared/SkeletonCard';
import {
  Users,
  Search,
  CheckCircle2,
  XCircle,
  Shield,
  Filter
} from 'lucide-react';

export const AdminUsersPage = () => {
  const { addToast } = useToast();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUserIds, setSelectedUserIds] = useState([]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.getUsers({
        search,
        role: roleFilter,
        status: statusFilter
      });
      setUsers(res.users);
    } catch (err) {
      addToast({ type: 'error', message: 'Failed to load user directory.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      await api.updateUserStatus(userId, newStatus);
      setUsers((prev) =>
        prev.map((u) => (u.user_id === userId ? { ...u, status: newStatus } : u))
      );
      addToast({ type: 'success', message: `User status changed to ${newStatus}.` });
    } catch (e) {
      addToast({ type: 'error', message: 'Failed to update user status.' });
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedUserIds(users.map((u) => u.user_id));
    } else {
      setSelectedUserIds([]);
    }
  };

  const handleSelectOne = (id) => {
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBulkDeactivate = async () => {
    try {
      for (const id of selectedUserIds) {
        await api.updateUserStatus(id, 'inactive');
      }
      setUsers((prev) =>
        prev.map((u) => (selectedUserIds.includes(u.user_id) ? { ...u, status: 'inactive' } : u))
      );
      setSelectedUserIds([]);
      addToast({ type: 'info', message: 'Selected users have been deactivated.' });
    } catch (e) {
      addToast({ type: 'error', message: 'Bulk deactivation failed.' });
    }
  };

  return (
    <div className="page-entrance" style={{ padding: '36px 0 100px 0', backgroundColor: '#F1F5F9', minHeight: '90vh' }}>
      <div className="container-main">
        {/* Header */}
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '26px', fontWeight: 700, color: 'var(--ink)' }}>
            User Account Management
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--slate)' }}>
            Search, filter, and moderate buyer, seller, and administrator accounts
          </p>
        </div>

        {/* ── TOOLBAR: SEARCH & FILTERS ───────────────────────── */}
        <div
          className="smartnest-card"
          style={{
            padding: '16px 20px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}
        >
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '8px', flex: 1, minWidth: '240px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <input
                type="text"
                className="smartnest-input"
                placeholder="Search user by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingLeft: '36px' }}
              />
              <Search size={16} color="var(--slate)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
            </div>
            <button type="submit" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '13px' }}>
              Search
            </button>
          </form>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            {/* Role Filter */}
            <select
              className="smartnest-input"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              style={{ width: '130px', fontSize: '13px' }}
            >
              <option value="all">All Roles</option>
              <option value="buyer">Buyers</option>
              <option value="seller">Sellers</option>
              <option value="admin">Admins</option>
            </select>

            {/* Status Filter */}
            <select
              className="smartnest-input"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ width: '130px', fontSize: '13px' }}
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Bulk Action Strip */}
        {selectedUserIds.length > 0 && (
          <div
            style={{
              padding: '10px 16px',
              backgroundColor: 'var(--ink)',
              color: '#FFFFFF',
              borderRadius: 'var(--radius-md)',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <span style={{ fontSize: '13px', fontWeight: 600 }}>
              {selectedUserIds.length} users selected
            </span>
            <button
              onClick={handleBulkDeactivate}
              className="btn btn-destructive"
              style={{ padding: '4px 12px', fontSize: '12px' }}
            >
              Deactivate Selected
            </button>
          </div>
        )}

        {/* ── USERS TABLE (20 PER PAGE MOCK) ──────────────────── */}
        {loading ? (
          <SkeletonTable rows={6} />
        ) : (
          <div className="smartnest-card" style={{ padding: '20px', overflowX: 'auto' }}>
            <table style={{ width: '100%', minWidth: '780px', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                  <th style={{ padding: '12px 14px', width: '40px' }}>
                    <input
                      type="checkbox"
                      checked={selectedUserIds.length > 0 && selectedUserIds.length === users.length}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th style={{ padding: '12px 14px', fontSize: '13px', fontWeight: 600, color: 'var(--slate)' }}>User ID</th>
                  <th style={{ padding: '12px 14px', fontSize: '13px', fontWeight: 600, color: 'var(--slate)' }}>Name & Email</th>
                  <th style={{ padding: '12px 14px', fontSize: '13px', fontWeight: 600, color: 'var(--slate)' }}>Role</th>
                  <th style={{ padding: '12px 14px', fontSize: '13px', fontWeight: 600, color: 'var(--slate)' }}>Status</th>
                  <th style={{ padding: '12px 14px', fontSize: '13px', fontWeight: 600, color: 'var(--slate)' }}>Registered</th>
                  <th style={{ padding: '12px 14px', fontSize: '13px', fontWeight: 600, color: 'var(--slate)', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.user_id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '14px' }}>
                      <input
                        type="checkbox"
                        checked={selectedUserIds.includes(u.user_id)}
                        onChange={() => handleSelectOne(u.user_id)}
                      />
                    </td>
                    <td style={{ padding: '14px', fontSize: '12px', color: 'var(--slate)', fontFamily: 'monospace' }}>
                      {u.user_id}
                    </td>
                    <td style={{ padding: '14px' }}>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ink)' }}>{u.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--slate)' }}>{u.email}</div>
                    </td>
                    <td style={{ padding: '14px' }}>
                      <span
                        className={`badge-pill ${
                          u.role === 'admin'
                            ? 'badge-rose'
                            : u.role === 'seller'
                            ? 'badge-amber'
                            : 'badge-teal'
                        }`}
                        style={{ textTransform: 'capitalize' }}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td style={{ padding: '14px' }}>
                      <span
                        className={`badge-pill ${u.status === 'active' ? 'badge-teal' : 'badge-slate'}`}
                        style={{ textTransform: 'capitalize' }}
                      >
                        {u.status}
                      </span>
                    </td>
                    <td style={{ padding: '14px', fontSize: '12px', color: 'var(--slate)' }}>
                      {new Date(u.registered_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td style={{ padding: '14px', textAlign: 'right' }}>
                      <button
                        onClick={() => handleToggleStatus(u.user_id, u.status)}
                        className={`btn ${u.status === 'active' ? 'btn-ghost' : 'btn-secondary'}`}
                        style={{ padding: '4px 10px', fontSize: '12px', border: '1px solid var(--border)' }}
                      >
                        {u.status === 'active' ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination Footer */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', fontSize: '12px', color: 'var(--slate)' }}>
              <span>Showing 1–{users.length} of {users.length} accounts (Page 1 of 1)</span>
              <span>20 per page</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
