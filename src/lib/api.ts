import axios from 'axios';
import type { Task, TaskFormData } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const taskApi = {
  // Fetch all tasks
  getAll: async (): Promise<Task[]> => {
    const response = await api.get('/admin/tasks');
    return response.data;
  },

  // Get single task by day number
  getByDayNumber: async (dayNumber: number): Promise<Task> => {
    const response = await api.get(`/admin/tasks/${dayNumber}`);
    return response.data;
  },

  // Create new task
  create: async (data: TaskFormData): Promise<Task> => {
    const response = await api.post('/admin/tasks', data);
    return response.data;
  },

  // Update task
  update: async (dayNumber: number, data: Partial<TaskFormData>): Promise<Task> => {
    const response = await api.put(`/admin/tasks/${dayNumber}`, data);
    return response.data;
  },

  // Delete task
  delete: async (dayNumber: number): Promise<void> => {
    await api.delete(`/admin/tasks/${dayNumber}`);
  },

  // Bulk publish/unpublish
  bulkPublish: async (dayNumbers: number[], isPublished: boolean): Promise<void> => {
    await api.post('/admin/tasks/bulk/publish', { dayNumbers, isPublished });
  },

  // Bulk delete
  bulkDelete: async (dayNumbers: number[]): Promise<void> => {
    await api.post('/admin/tasks/bulk/delete', { dayNumbers });
  },

  // Bulk update category
  bulkUpdateCategory: async (dayNumbers: number[], category: string): Promise<void> => {
    await api.post('/admin/tasks/bulk/category', { dayNumbers, category });
  },

  // Reorder tasks (update day numbers)
  reorder: async (updates: { oldDayNumber: number; newDayNumber: number }[]): Promise<void> => {
    await api.post('/admin/tasks/reorder', { updates });
  },

  // Import tasks from JSON/CSV
  import: async (tasks: TaskFormData[], mode: 'overwrite' | 'skip'): Promise<{ imported: number; skipped: number }> => {
    const response = await api.post('/admin/tasks/import', { tasks, mode });
    return response.data;
  },
};

export default api;
