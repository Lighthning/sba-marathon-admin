import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

class ApiService {
  private client: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value: any) => void;
    reject: (reason?: any) => void;
  }> = [];

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });

    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('adminToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor with token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError<any>) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // If 401 and not already retrying, try to refresh token
        if (error.response?.status === 401 && !originalRequest._retry) {
          const refreshToken = localStorage.getItem('adminRefreshToken');

          // If we have a refresh token and not already refreshing, try to refresh
          if (refreshToken && !this.isRefreshing) {
            originalRequest._retry = true;
            this.isRefreshing = true;

            try {
              const response = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {
                refreshToken,
              });

              const { accessToken } = response.data;
              localStorage.setItem('adminToken', accessToken);

              // Retry all failed requests
              this.failedQueue.forEach(({ resolve }) => resolve(accessToken));
              this.failedQueue = [];

              // Retry the original request
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
              }
              return this.client(originalRequest);
            } catch (refreshError) {
              // Refresh failed, logout user
              this.failedQueue.forEach(({ reject }) => reject(refreshError));
              this.failedQueue = [];

              localStorage.removeItem('adminToken');
              localStorage.removeItem('adminRefreshToken');
              window.location.href = '/login';
              toast.error('Session expired. Please login again.');
              return Promise.reject(refreshError);
            } finally {
              this.isRefreshing = false;
            }
          }

          // If refreshing in progress, queue this request
          if (this.isRefreshing) {
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            }).then((token) => {
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${token}`;
              }
              return this.client(originalRequest);
            });
          }

          // No refresh token, logout
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminRefreshToken');
          window.location.href = '/login';
          toast.error('Session expired. Please login again.');
        } else if (error.response?.status === 403) {
          toast.error('You do not have permission to perform this action.');
        } else if (error.response?.data?.message) {
          toast.error(error.response.data.message);
        } else {
          toast.error('An unexpected error occurred.');
        }
        return Promise.reject(error);
      }
    );
  }

  public getClient(): AxiosInstance {
    return this.client;
  }

  public setAuthToken(token: string, refreshToken?: string): void {
    localStorage.setItem('adminToken', token);
    if (refreshToken) {
      localStorage.setItem('adminRefreshToken', refreshToken);
    }
  }

  public clearAuthToken(): void {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminRefreshToken');
  }
}

export const apiService = new ApiService();
export const apiClient = apiService.getClient();
