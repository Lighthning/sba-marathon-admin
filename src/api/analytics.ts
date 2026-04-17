import apiClient from './client';
import {
  OverviewMetrics,
  UserMetrics,
  TaskMetrics,
  EngagementMetrics,
  TrendMetrics,
  TimeRange,
  ApiResponse
} from '../types';

export const getAnalyticsOverview = async (timeRange: TimeRange = 'all'): Promise<OverviewMetrics> => {
  const response = await apiClient.get<ApiResponse<OverviewMetrics>>(
    `/api/admin/analytics/overview?timeRange=${timeRange}`
  );
  return response.data.data;
};

export const getUserMetrics = async (timeRange: TimeRange = '30d'): Promise<UserMetrics> => {
  const response = await apiClient.get<ApiResponse<UserMetrics>>(
    `/api/admin/analytics/users?timeRange=${timeRange}`
  );
  return response.data.data;
};

export const getTaskMetrics = async (): Promise<TaskMetrics> => {
  const response = await apiClient.get<ApiResponse<TaskMetrics>>('/api/admin/analytics/tasks');
  return response.data.data;
};

export const getEngagementMetrics = async (timeRange: TimeRange = '30d'): Promise<EngagementMetrics> => {
  const response = await apiClient.get<ApiResponse<EngagementMetrics>>(
    `/api/admin/analytics/engagement?timeRange=${timeRange}`
  );
  return response.data.data;
};

export const getTrendMetrics = async (timeRange: TimeRange = '90d'): Promise<TrendMetrics> => {
  const response = await apiClient.get<ApiResponse<TrendMetrics>>(
    `/api/admin/analytics/trends?timeRange=${timeRange}`
  );
  return response.data.data;
};

export const sendNotification = async (data: {
  title: string;
  body: string;
  url?: string;
  segment?: string;
}) => {
  const response = await apiClient.post('/api/admin/push', data);
  return response.data;
};
