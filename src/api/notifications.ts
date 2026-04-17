import apiClient from './client';

/**
 * Notification API - Aligned with backend endpoints
 * Backend routes: /api/admin/notifications/*
 */

export interface SendNotificationPayload {
  title: string;
  body: string;
  target: 'all' | 'active' | 'inactive' | 'specific';
  userIds?: string[];
  data?: Record<string, any>;
  priority?: 'low' | 'normal' | 'high';
}

export interface ScheduleNotificationPayload extends SendNotificationPayload {
  scheduledFor: string; // ISO8601 datetime
}

export interface SendNotificationResponse {
  message: string;
  notificationId: string;
  sentCount: number;
  failedCount: number;
  success: boolean;
}

export interface ScheduleNotificationResponse {
  message: string;
  scheduledId: string;
  scheduledFor: string;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  title: string;
  body: string;
  priority: 'low' | 'normal' | 'high';
  data?: Record<string, any>;
}

export interface GetTemplatesResponse {
  templates: NotificationTemplate[];
  count: number;
}

export interface ApplyTemplateResponse {
  title: string;
  body: string;
  data?: Record<string, any>;
}

export const notificationApi = {
  /**
   * POST /api/admin/notifications/send
   * Send immediate notification to targeted users
   */
  send: async (payload: SendNotificationPayload): Promise<SendNotificationResponse> => {
    const response = await apiClient.post('/admin/notifications/send', payload);
    return response.data;
  },

  /**
   * POST /api/admin/notifications/schedule
   * Schedule a notification for future delivery
   */
  schedule: async (payload: ScheduleNotificationPayload): Promise<ScheduleNotificationResponse> => {
    const response = await apiClient.post('/admin/notifications/schedule', payload);
    return response.data;
  },

  /**
   * POST /api/admin/notifications/test
   * Send a test notification to the admin user
   */
  sendTest: async (payload: { title?: string; body?: string }) => {
    const response = await apiClient.post('/admin/notifications/test', payload);
    return response.data;
  },

  /**
   * GET /api/admin/notifications/history
   * List sent notifications with pagination and filters
   */
  getHistory: async (params?: {
    page?: number;
    limit?: number;
    type?: string;
    status?: 'sent' | 'delivered' | 'failed';
  }) => {
    const response = await apiClient.get('/admin/notifications/history', { params });
    return response.data;
  },

  /**
   * GET /api/admin/notifications/scheduled
   * List scheduled notifications
   */
  getScheduled: async (params?: {
    status?: 'pending' | 'sent' | 'cancelled' | 'failed';
    page?: number;
    limit?: number;
  }) => {
    const response = await apiClient.get('/admin/notifications/scheduled', { params });
    return response.data;
  },

  /**
   * DELETE /api/admin/notifications/scheduled/:id
   * Cancel a scheduled notification
   */
  cancelScheduled: async (id: string) => {
    const response = await apiClient.delete(`/admin/notifications/scheduled/${id}`);
    return response.data;
  },

  /**
   * GET /api/admin/notifications/templates
   * Get all notification templates
   */
  getTemplates: async (): Promise<GetTemplatesResponse> => {
    const response = await apiClient.get('/admin/notifications/templates');
    return response.data;
  },

  /**
   * POST /api/admin/notifications/templates/apply
   * Apply a template with variables
   */
  applyTemplate: async (
    templateName: string,
    variables: Record<string, any>
  ): Promise<ApplyTemplateResponse> => {
    const response = await apiClient.post('/admin/notifications/templates/apply', {
      templateName,
      variables,
    });
    return response.data;
  },
};
