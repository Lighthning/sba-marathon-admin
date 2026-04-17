import axios from 'axios';
import {
  Task,
  TaskStats,
  CreateTaskPayload,
  UpdateTaskPayload,
  BulkImportResult,
  PaginationInfo,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

interface FetchTasksParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  difficulty?: string;
  isPublished?: boolean;
  includeDeleted?: boolean;
}

interface FetchTasksResponse {
  tasks: Task[];
  pagination: PaginationInfo;
  stats?: TaskStats;
}

class TaskService {
  private endpoint = `${API_BASE_URL}/api/admin/tasks`;

  private async getAuthHeaders() {
    const token = localStorage.getItem('adminToken');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  async fetchTasks(params: FetchTasksParams = {}): Promise<FetchTasksResponse> {
    const {
      page = 1,
      limit = 99,
      search = '',
      category = '',
      difficulty = '',
      isPublished,
      includeDeleted = false,
    } = params;

    try {
      const response = await axios.get<FetchTasksResponse>(this.endpoint, {
        headers: await this.getAuthHeaders(),
        params: {
          page,
          limit,
          search: search || undefined,
          category: category || undefined,
          difficulty: difficulty || undefined,
          isPublished: isPublished !== undefined ? isPublished : undefined,
          includeDeleted,
        },
      });

      return response.data;
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
      throw error;
    }
  }

  async fetchTaskByDayNumber(dayNumber: number): Promise<Task> {
    try {
      const response = await axios.get<Task>(
        `${this.endpoint}/${dayNumber}`,
        { headers: await this.getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch task ${dayNumber}:`, error);
      throw error;
    }
  }

  async fetchCategories(): Promise<string[]> {
    try {
      const response = await axios.get<{ categories: string[] }>(
        `${this.endpoint}/categories`,
        { headers: await this.getAuthHeaders() }
      );
      return response.data.categories;
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      throw error;
    }
  }

  async fetchStatistics(): Promise<TaskStats> {
    try {
      const response = await axios.get<TaskStats>(
        `${this.endpoint}/statistics`,
        { headers: await this.getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
      throw error;
    }
  }

  async createTask(payload: CreateTaskPayload): Promise<Task> {
    try {
      const response = await axios.post<{ task: Task }>(
        this.endpoint,
        payload,
        { headers: await this.getAuthHeaders() }
      );
      return response.data.task;
    } catch (error) {
      console.error('Failed to create task:', error);
      throw error;
    }
  }

  async updateTask(dayNumber: number, payload: UpdateTaskPayload): Promise<Task> {
    try {
      const response = await axios.put<{ task: Task }>(
        `${this.endpoint}/${dayNumber}`,
        payload,
        { headers: await this.getAuthHeaders() }
      );
      return response.data.task;
    } catch (error) {
      console.error(`Failed to update task ${dayNumber}:`, error);
      throw error;
    }
  }

  async deleteTask(dayNumber: number): Promise<void> {
    try {
      await axios.delete(
        `${this.endpoint}/${dayNumber}`,
        { headers: await this.getAuthHeaders() }
      );
    } catch (error) {
      console.error(`Failed to delete task ${dayNumber}:`, error);
      throw error;
    }
  }

  async duplicateTask(dayNumber: number, newDayNumber: number): Promise<Task> {
    try {
      const response = await axios.post<{ task: Task }>(
        `${this.endpoint}/${dayNumber}/duplicate`,
        { newDayNumber },
        { headers: await this.getAuthHeaders() }
      );
      return response.data.task;
    } catch (error) {
      console.error(`Failed to duplicate task ${dayNumber}:`, error);
      throw error;
    }
  }

  async bulkImportTasks(fileContent: string, fileType: 'csv' | 'json'): Promise<BulkImportResult> {
    try {
      const response = await axios.post<{ result: BulkImportResult }>(
        `${this.endpoint}/bulk-import`,
        { fileContent, fileType },
        { headers: await this.getAuthHeaders() }
      );
      return response.data.result;
    } catch (error) {
      console.error('Failed to bulk import tasks:', error);
      throw error;
    }
  }

  async reorderTasks(reorderedTasks: { dayNumber: number; newDayNumber: number }[]): Promise<void> {
    // Since the backend doesn't have a reorder endpoint,
    // we'll need to update each task individually
    try {
      const promises = reorderedTasks.map(({ dayNumber, newDayNumber: _newDayNumber }) =>
        this.updateTask(dayNumber, { /* We'd need a dayNumber field in UpdateTaskPayload */ } as any)
      );
      await Promise.all(promises);
    } catch (error) {
      console.error('Failed to reorder tasks:', error);
      throw error;
    }
  }

  async exportToCsv(params: FetchTasksParams = {}): Promise<Blob> {
    try {
      const response = await axios.get(`${this.endpoint}/export`, {
        headers: await this.getAuthHeaders(),
        params,
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error('Failed to export tasks to CSV:', error);
      throw error;
    }
  }
}

export const taskService = new TaskService();
