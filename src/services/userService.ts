import axios from 'axios';
import {
  User,
  UserStats,
  ApiResponse,
  UpdateUserPayload,
  SuspendUserPayload,
  PaginationInfo,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

interface FetchUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface FetchUsersResponse {
  users: User[];
  pagination: PaginationInfo;
  stats: UserStats;
}

class UserService {
  private endpoint = `${API_BASE_URL}/api/admin/users`;

  private async getAuthHeaders() {
    const token = localStorage.getItem('adminToken');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  async fetchUsers(params: FetchUsersParams = {}): Promise<FetchUsersResponse> {
    const {
      page = 1,
      limit = 50,
      search = '',
      role = 'all',
      status = 'all',
      sortBy = 'name',
      sortOrder = 'asc',
    } = params;

    try {
      const response = await axios.get<ApiResponse<FetchUsersResponse>>(this.endpoint, {
        headers: await this.getAuthHeaders(),
        params: {
          page,
          limit,
          search,
          role: role !== 'all' ? role : undefined,
          status: status !== 'all' ? status : undefined,
          sortBy,
          sortOrder,
        },
      });

      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch users:', error);
      throw error;
    }
  }

  async fetchUserById(userId: string): Promise<User> {
    try {
      const response = await axios.get<ApiResponse<User>>(
        `${this.endpoint}/${userId}`,
        { headers: await this.getAuthHeaders() }
      );
      return response.data.data;
    } catch (error) {
      console.error(`Failed to fetch user ${userId}:`, error);
      throw error;
    }
  }

  async updateUser(userId: string, payload: UpdateUserPayload): Promise<User> {
    try {
      const response = await axios.patch<ApiResponse<User>>(
        `${this.endpoint}/${userId}`,
        payload,
        { headers: await this.getAuthHeaders() }
      );
      return response.data.data;
    } catch (error) {
      console.error(`Failed to update user ${userId}:`, error);
      throw error;
    }
  }

  async suspendUser(userId: string, payload: SuspendUserPayload): Promise<User> {
    try {
      const response = await axios.post<ApiResponse<User>>(
        `${this.endpoint}/${userId}/suspend`,
        payload,
        { headers: await this.getAuthHeaders() }
      );
      return response.data.data;
    } catch (error) {
      console.error(`Failed to suspend user ${userId}:`, error);
      throw error;
    }
  }

  async unsuspendUser(userId: string): Promise<User> {
    try {
      const response = await axios.post<ApiResponse<User>>(
        `${this.endpoint}/${userId}/unsuspend`,
        {},
        { headers: await this.getAuthHeaders() }
      );
      return response.data.data;
    } catch (error) {
      console.error(`Failed to unsuspend user ${userId}:`, error);
      throw error;
    }
  }

  async deleteUser(userId: string): Promise<void> {
    try {
      await axios.delete(
        `${this.endpoint}/${userId}`,
        { headers: await this.getAuthHeaders() }
      );
    } catch (error) {
      console.error(`Failed to delete user ${userId}:`, error);
      throw error;
    }
  }

  async exportToCsv(params: FetchUsersParams = {}): Promise<Blob> {
    try {
      const response = await axios.get(`${this.endpoint}/export`, {
        headers: await this.getAuthHeaders(),
        params,
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error('Failed to export users to CSV:', error);
      throw error;
    }
  }

  async fetchUserActivity(userId: string): Promise<any[]> {
    try {
      const response = await axios.get<ApiResponse<any[]>>(
        `${this.endpoint}/${userId}/activity`,
        { headers: await this.getAuthHeaders() }
      );
      return response.data.data;
    } catch (error) {
      console.error(`Failed to fetch activity for user ${userId}:`, error);
      throw error;
    }
  }
}

export const userService = new UserService();
