import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Search,
  Download,
  Eye,
  Edit2,
  Ban,
  Trash2,
  CheckCircle,
  XCircle,
  Users as UsersIcon,
  Award,
  Clock,
  X,
  FileText,
} from 'lucide-react';
import { formatRelativeTime, getInitials, getRoleBadgeColor, getStatusBadgeColor, exportUsersToCsv, downloadCsv } from '../utils/helpers';
import { User, UsersFilter } from '../types';
import { userService } from '../services/userService';
import toast from 'react-hot-toast';
import StatCard from '../components/StatCard';

// User Row Component with Actions
const UserRow: React.FC<{
  user: User;
  onView: (user: User) => void;
  onEdit: (user: User) => void;
  onSuspend: (user: User) => void;
  onDelete: (user: User) => void;
  onViewSubmissions: (user: User) => void;
}> = ({ user, onView, onEdit, onSuspend, onDelete, onViewSubmissions }) => {
  return (
    <tr>
      <td>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="user-avatar">
            {getInitials(user.fullName)}
          </div>
          <div>
            <div style={{ fontWeight: 500, fontSize: '13px' }}>{user.fullName}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{user.email}</div>
          </div>
        </div>
      </td>
      <td>
        <span className={`badge ${getRoleBadgeColor(user.role)}`}>
          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
        </span>
      </td>
      <td>
        <span className={`badge ${getStatusBadgeColor(user.status)}`}>
          {user.status === 'active' ? (
            <>
              <CheckCircle size={12} />
              Active
            </>
          ) : (
            <>
              <XCircle size={12} />
              Suspended
            </>
          )}
        </span>
      </td>
      <td>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-primary)' }}>
          <Award size={14} style={{ color: 'var(--warning)' }} />
          {user.stats.currentStreak}
        </span>
      </td>
      <td>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            flex: 1,
            height: '6px',
            background: 'var(--bg-elevated)',
            borderRadius: '3px',
            overflow: 'hidden',
            minWidth: '80px',
          }}>
            <div style={{
              width: `${(user.stats.completedTasks / 99) * 100}%`,
              height: '100%',
              background: 'var(--teal)',
              transition: 'width 0.3s ease',
            }} />
          </div>
          <span style={{
            fontSize: '12px',
            color: 'var(--text-tertiary)',
            fontFamily: 'var(--font-mono)',
            minWidth: '45px',
          }}>
            {user.stats.completedTasks}/99
          </span>
        </div>
      </td>
      <td style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
        {formatRelativeTime(user.lastActivityAt)}
      </td>
      <td>
        <div style={{ display: 'flex', gap: '4px' }}>
          <button
            className="btn-icon"
            onClick={() => onView(user)}
            title="View"
          >
            <Eye size={16} />
          </button>
          <button
            className="btn-icon"
            onClick={() => onViewSubmissions(user)}
            title="View Submissions"
          >
            <FileText size={16} />
          </button>
          <button
            className="btn-icon"
            onClick={() => onEdit(user)}
            title="Edit"
          >
            <Edit2 size={16} />
          </button>
          <button
            className="btn-icon"
            onClick={() => onSuspend(user)}
            title={user.status === 'active' ? 'Suspend' : 'Unsuspend'}
          >
            {user.status === 'active' ? <Ban size={16} /> : <CheckCircle size={16} />}
          </button>
          <button
            className="btn-icon"
            onClick={() => onDelete(user)}
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </td>
    </tr>
  );
};

// User Detail Modal
const UserDetailModal: React.FC<{
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
}> = ({ user, isOpen, onClose, onEdit }) => {
  if (!isOpen || !user) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="user-avatar" style={{ width: '48px', height: '48px', fontSize: '16px' }}>
              {getInitials(user.fullName)}
            </div>
            <div>
              <h2 className="modal-title" style={{ fontSize: '20px' }}>{user.fullName}</h2>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>{user.email}</p>
            </div>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '20px' }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '11px',
                fontWeight: 500,
                color: 'var(--text-tertiary)',
                marginBottom: '6px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                fontFamily: 'var(--font-mono)',
              }}>
                Role
              </label>
              <span className={`badge ${getRoleBadgeColor(user.role)}`}>
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </span>
            </div>
            <div>
              <label style={{
                display: 'block',
                fontSize: '11px',
                fontWeight: 500,
                color: 'var(--text-tertiary)',
                marginBottom: '6px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                fontFamily: 'var(--font-mono)',
              }}>
                Status
              </label>
              <span className={`badge ${getStatusBadgeColor(user.status)}`}>
                {user.status === 'active' ? (
                  <>
                    <CheckCircle size={12} />
                    Active
                  </>
                ) : (
                  <>
                    <XCircle size={12} />
                    Suspended
                  </>
                )}
              </span>
            </div>
            <div>
              <label style={{
                display: 'block',
                fontSize: '11px',
                fontWeight: 500,
                color: 'var(--text-tertiary)',
                marginBottom: '6px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                fontFamily: 'var(--font-mono)',
              }}>
                Country
              </label>
              <p style={{ fontSize: '13px', fontWeight: 500 }}>{user.country}</p>
            </div>
            <div>
              <label style={{
                display: 'block',
                fontSize: '11px',
                fontWeight: 500,
                color: 'var(--text-tertiary)',
                marginBottom: '6px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                fontFamily: 'var(--font-mono)',
              }}>
                Current Day
              </label>
              <p style={{ fontSize: '13px', fontWeight: 600, fontFamily: 'var(--font-display)' }}>{user.currentDay}/99</p>
            </div>
            <div>
              <label style={{
                display: 'block',
                fontSize: '11px',
                fontWeight: 500,
                color: 'var(--text-tertiary)',
                marginBottom: '6px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                fontFamily: 'var(--font-mono)',
              }}>
                Completed Tasks
              </label>
              <p style={{ fontSize: '13px', fontWeight: 600, fontFamily: 'var(--font-display)' }}>{user.stats.completedTasks}</p>
            </div>
            <div>
              <label style={{
                display: 'block',
                fontSize: '11px',
                fontWeight: 500,
                color: 'var(--text-tertiary)',
                marginBottom: '6px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                fontFamily: 'var(--font-mono)',
              }}>
                Streak
              </label>
              <p style={{ fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'var(--font-display)' }}>
                <Award size={16} style={{ color: 'var(--warning)' }} />
                {user.stats.currentStreak} days
              </p>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px', fontFamily: 'var(--font-display)' }}>Professional Background</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>{user.professionalBg}</p>
          </div>

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px', fontFamily: 'var(--font-display)' }}>Current Stage</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>{user.currentStage}</p>
          </div>

          {user.status === 'suspended' && user.suspensionReason && (
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
              <h3 style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: 'var(--danger)', fontFamily: 'var(--font-display)' }}>Suspension Reason</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>{user.suspensionReason}</p>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Close
          </button>
          <button className="btn-primary" onClick={onEdit} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Edit2 size={16} />
            Edit User
          </button>
        </div>
      </div>
    </div>
  );
};

// Submissions Modal Component
const SubmissionsModal: React.FC<{
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
}> = ({ user, isOpen, onClose }) => {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      fetchSubmissions();
    }
  }, [isOpen, user]);

  const fetchSubmissions = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
      const response = await fetch(`${baseUrl}/api/admin/users/${user.id}/submissions`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Failed to fetch submissions');
      const data = await response.json();
      // Handle both { success, data: [...] } and plain array
      setSubmissions(Array.isArray(data) ? data : (data.data || []));
    } catch (error) {
      console.error('Failed to fetch submissions:', error);
      toast.error('Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !user) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '900px', maxHeight: '90vh', overflow: 'auto' }}>
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Submissions — {user.fullName}</h2>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              {submissions.length} submissions
            </p>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-secondary)' }}>
              <Clock className="animate-spin" size={24} style={{ color: 'var(--teal)', margin: '0 auto 12px' }} />
              Loading submissions...
            </div>
          ) : submissions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px' }}>
              <FileText size={32} style={{ color: 'var(--text-tertiary)', margin: '0 auto 16px' }} />
              <p style={{ color: 'var(--text-secondary)' }}>No submissions yet</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {submissions.map((submission) => (
                <div
                  key={submission.id}
                  style={{
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    padding: '16px',
                  }}
                >
                  {/* Header */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        background: 'var(--teal)',
                        color: 'white',
                        padding: '4px 10px',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: 600,
                      }}>
                        Day {submission.dayNumber}
                      </span>
                      <span style={{ fontSize: '14px', fontWeight: 600 }}>{submission.task.taskName}</span>
                    </div>
                    <span style={{ fontSize: '12px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                      {new Date(submission.submittedAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Reflections */}
                  {/* Report 1 — use actual task question */}
                  {submission.report1 && (
                    <div style={{ marginBottom: '12px' }}>
                      <div style={{
                        fontSize: '11px', fontWeight: 600,
                        color: 'var(--text-tertiary)', marginBottom: '4px',
                        textTransform: 'uppercase', letterSpacing: '0.5px',
                      }}>
                        {submission.task?.task ? submission.task.task.substring(0, 80) + (submission.task.task.length > 80 ? '...' : '') : 'Reflection'}
                      </div>
                      <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                        {submission.report1}
                      </div>
                    </div>
                  )}
                  {/* Report 2 */}
                  {submission.report2 && (
                    <div style={{ marginBottom: '12px' }}>
                      <div style={{
                        fontSize: '11px', fontWeight: 600,
                        color: 'var(--text-tertiary)', marginBottom: '4px',
                        textTransform: 'uppercase', letterSpacing: '0.5px',
                      }}>What I learned or realized</div>
                      <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                        {submission.report2}
                      </div>
                    </div>
                  )}
                  {/* Report 3 */}
                  {submission.report3 && (
                    <div style={{ marginBottom: '12px' }}>
                      <div style={{
                        fontSize: '11px', fontWeight: 600,
                        color: 'var(--text-tertiary)', marginBottom: '4px',
                        textTransform: 'uppercase', letterSpacing: '0.5px',
                      }}>Note to keep</div>
                      <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                        {submission.report3}
                      </div>
                    </div>
                  )}
                  {submission.goDeeperAnswer && (
                    <div style={{ marginBottom: '12px' }}>
                      <p style={{ fontSize: '12px', fontWeight: 600, color: '#58EDEC', marginBottom: '4px' }}>✨ Go Deeper</p>
                      <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }} dangerouslySetInnerHTML={{ __html: submission.goDeeperAnswer }} />
                    </div>
                  )}

                  {/* Attachments */}
                  {submission.attachments && submission.attachments.length > 0 && (
                    <div style={{ marginTop: '12px', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
                      <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-tertiary)', marginBottom: '8px' }}>
                        Attachments ({submission.attachments.length})
                      </p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {submission.attachments.map((att: any) => (
                          <a
                            key={att.id}
                            href={att.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '6px 12px',
                              background: 'var(--bg-canvas)',
                              border: '1px solid var(--border)',
                              borderRadius: '8px',
                              fontSize: '12px',
                              color: 'var(--teal)',
                              textDecoration: 'none',
                            }}
                          >
                            <FileText size={14} />
                            {att.fileName}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Users Page Component
const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showSubmissionsModal, setShowSubmissionsModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 50;

  const [filters, setFilters] = useState<UsersFilter>({
    search: '',
    role: 'all',
    status: 'all',
    sortBy: 'name',
    sortOrder: 'asc',
  });

  // Fetch users
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await userService.fetchUsers({
        page: currentPage,
        limit: pageSize,
        ...filters,
      });
      setUsers(response.users);
      setStats(response.stats);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [currentPage, filters]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Filtered and sorted users
  const displayedUsers = useMemo(() => {
    let result = [...users];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        (user) =>
          user.fullName.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower)
      );
    }

    // Role filter
    if (filters.role !== 'all') {
      result = result.filter((user) => user.role === filters.role);
    }

    // Status filter
    if (filters.status !== 'all') {
      result = result.filter((user) => user.status === filters.status);
    }

    // Sort
    result.sort((a, b) => {
      let aVal: any, bVal: any;

      switch (filters.sortBy) {
        case 'name':
          aVal = a.fullName.toLowerCase();
          bVal = b.fullName.toLowerCase();
          break;
        case 'email':
          aVal = a.email.toLowerCase();
          bVal = b.email.toLowerCase();
          break;
        case 'streak':
          aVal = a.stats.currentStreak;
          bVal = b.stats.currentStreak;
          break;
        case 'completedTasks':
          aVal = a.stats.completedTasks;
          bVal = b.stats.completedTasks;
          break;
        case 'lastActivity':
          aVal = a.lastActivityAt ? new Date(a.lastActivityAt).getTime() : 0;
          bVal = b.lastActivityAt ? new Date(b.lastActivityAt).getTime() : 0;
          break;
        default:
          return 0;
      }

      if (filters.sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    return result;
  }, [users, filters]);

  // Handlers
  const handleView = (user: User) => {
    setSelectedUser(user);
    setShowDetailModal(true);
  };

  const handleViewSubmissions = (user: User) => {
    setSelectedUser(user);
    setShowSubmissionsModal(true);
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    // TODO: Show edit modal
    toast('Edit modal coming soon', { icon: '🚧' });
  };

  const handleSuspend = async (user: User) => {
    if (user.status === 'suspended') {
      // Unsuspend
      if (!confirm(`Are you sure you want to unsuspend ${user.fullName}?`)) return;
      try {
        await userService.unsuspendUser(user.id);
        toast.success('User unsuspended successfully');
        fetchUsers();
      } catch (error) {
        toast.error('Failed to unsuspend user');
      }
    } else {
      // Suspend
      const reason = prompt('Enter suspension reason:');
      if (!reason) return;
      try {
        await userService.suspendUser(user.id, { reason });
        toast.success('User suspended successfully');
        fetchUsers();
      } catch (error) {
        toast.error('Failed to suspend user');
      }
    }
  };

  const handleDelete = async (user: User) => {
    const confirmText = 'DELETE';
    const input = prompt(
      `⚠️ This action cannot be undone!\n\nType "${confirmText}" to confirm deletion of ${user.fullName}:`
    );
    if (input !== confirmText) {
      if (input) toast.error('Deletion cancelled: confirmation text did not match');
      return;
    }

    try {
      await userService.deleteUser(user.id);
      toast.success('User deleted successfully');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  const handleExportCsv = () => {
    try {
      const csvData = exportUsersToCsv(displayedUsers);
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
      const timestamp = new Date().toISOString().split('T')[0];
      downloadCsv(blob, `marathon-users-${timestamp}.csv`);
      toast.success('CSV exported successfully');
    } catch (error) {
      toast.error('Failed to export CSV');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-canvas)', padding: '32px' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div className="page-header">
          <div>
            <h1 className="page-title">User Management</h1>
            <p className="page-subtitle">Manage participants and administrators</p>
          </div>
          <div className="page-actions">
            <button className="btn-secondary" onClick={handleExportCsv} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Download size={16} />
              Export CSV
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '16px',
            marginBottom: '24px',
          }}>
            <StatCard
              title="Total Users"
              value={stats.totalUsers}
              index={0}
            />
            <StatCard
              title="Active Users"
              value={stats.activeUsers}
              trend="up"
              index={1}
            />
            <StatCard
              title="Suspended"
              value={stats.suspendedUsers}
              index={2}
            />
            <StatCard
              title="Avg Completion"
              value={stats.averageCompletionRate}
              suffix="%"
              trend="up"
              index={3}
            />
          </div>
        )}

        {/* Filters and Search */}
        <div style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '24px',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}>
          {/* Search Input */}
          <div className="input-with-icon" style={{ flex: '1 1 300px', minWidth: '300px' }}>
            <Search size={16} className="input-icon" />
            <input
              type="text"
              className="input"
              placeholder="Search by name or email..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>

          {/* Role Filter */}
          <select
            className="input"
            style={{ flex: '0 0 140px' }}
            value={filters.role}
            onChange={(e) => setFilters({ ...filters, role: e.target.value as any })}
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="participant">Participant</option>
          </select>

          {/* Status Filter */}
          <select
            className="input"
            style={{ flex: '0 0 140px' }}
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value as any })}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>

        {/* Users Table */}
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Streak</th>
                  <th>Progress</th>
                  <th>Last Active</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '48px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                        <Clock className="animate-spin" size={18} style={{ color: 'var(--teal)' }} />
                        Loading users...
                      </div>
                    </td>
                  </tr>
                ) : displayedUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7}>
                      <div className="empty-state">
                        <div className="empty-state-icon">
                          <UsersIcon size={20} />
                        </div>
                        <h3 className="empty-state-title">No users found</h3>
                        <p className="empty-state-desc">No users match your current filters. Try adjusting your search.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  displayedUsers.map((user) => (
                    <UserRow
                      key={user.id}
                      user={user}
                      onView={handleView}
                      onEdit={handleEdit}
                      onSuspend={handleSuspend}
                      onDelete={handleDelete}
                      onViewSubmissions={handleViewSubmissions}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!loading && displayedUsers.length > 0 && (
            <div style={{
              borderTop: '1px solid var(--border)',
              padding: '16px 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                Showing {displayedUsers.length} of {stats?.totalUsers || 0} users
              </p>
              <div className="pagination">
                <button
                  className="page-btn"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  ←
                </button>
                <button className="page-btn active">
                  {currentPage}
                </button>
                <button
                  className="page-btn"
                  onClick={() => setCurrentPage((p) => p + 1)}
                  disabled={displayedUsers.length < pageSize}
                >
                  →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* User Detail Modal */}
      <UserDetailModal
        user={selectedUser}
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        onEdit={() => handleEdit(selectedUser!)}
      />

      {/* Submissions Modal */}
      <SubmissionsModal
        user={selectedUser}
        isOpen={showSubmissionsModal}
        onClose={() => setShowSubmissionsModal(false)}
      />
    </div>
  );
};

export default UsersPage;
