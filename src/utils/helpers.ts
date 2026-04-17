import { formatDistanceToNow, format } from 'date-fns';
import { User } from '../types';

export function getInitials(fullName: string): string {
  const parts = fullName.trim().split(' ');
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function formatRelativeTime(dateString: string | null): string {
  if (!dateString) return 'Never';
  try {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  } catch {
    return 'Unknown';
  }
}

export function formatDate(dateString: string | null): string {
  if (!dateString) return 'N/A';
  try {
    return format(new Date(dateString), 'MMM d, yyyy');
  } catch {
    return 'Invalid date';
  }
}

export function getRoleBadgeColor(role: string): string {
  switch (role) {
    case 'admin':
      return 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-700 border-purple-300';
    case 'participant':
      return 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-700 border-cyan-300';
    default:
      return 'bg-gradient-to-r from-gray-500/20 to-slate-500/20 text-gray-700 border-gray-300';
  }
}

export function getStatusBadgeColor(status: string): string {
  switch (status) {
    case 'active':
      return 'bg-gradient-to-r from-emerald-500/20 to-green-500/20 text-emerald-700 border-emerald-300';
    case 'suspended':
      return 'bg-gradient-to-r from-red-500/20 to-rose-500/20 text-red-700 border-red-300';
    default:
      return 'bg-gradient-to-r from-gray-500/20 to-slate-500/20 text-gray-700 border-gray-300';
  }
}

export function downloadCsv(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

export function exportUsersToCsv(users: User[]): string {
  const headers = [
    'Full Name',
    'Email',
    'Role',
    'Status',
    'Country',
    'Current Day',
    'Completed Tasks',
    'Streak',
    'Last Activity',
    'Created At',
  ];

  const rows = users.map((user) => [
    user.fullName,
    user.email,
    user.role,
    user.status,
    user.country,
    (user.currentDay || user.stats?.totalDays || 0).toString(),
    (user.completedTasks || user.stats?.completedTasks || 0).toString(),
    (user.streak || user.stats?.currentStreak || 0).toString(),
    user.lastActivityAt || 'N/A',
    user.createdAt,
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ),
  ].join('\n');

  return csvContent;
}
