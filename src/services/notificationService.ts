import { notificationApi, SendNotificationPayload, ScheduleNotificationPayload } from '../api/notifications';

/**
 * Notification Service
 * Business logic layer for notification management
 */

export interface NotificationFormData {
  title: string;
  body: string;
  target: 'all' | 'active' | 'inactive' | 'specific';
  userIds?: string[];
  priority: 'low' | 'normal' | 'high';
  data?: Record<string, any>;
  scheduleType: 'now' | 'scheduled';
  scheduledTime?: Date;
}

export class NotificationService {
  /**
   * Validate notification form data
   */
  validateForm(data: NotificationFormData): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Title validation
    if (!data.title || data.title.trim().length === 0) {
      errors.push('Title is required');
    } else if (data.title.length < 3) {
      errors.push('Title must be at least 3 characters');
    } else if (data.title.length > 100) {
      errors.push('Title must be less than 100 characters');
    }

    // Body validation
    if (!data.body || data.body.trim().length === 0) {
      errors.push('Body is required');
    } else if (data.body.length < 10) {
      errors.push('Body must be at least 10 characters');
    } else if (data.body.length > 500) {
      errors.push('Body must be less than 500 characters');
    }

    // Target validation
    if (data.target === 'specific' && (!data.userIds || data.userIds.length === 0)) {
      errors.push('At least one user must be selected for specific targeting');
    }

    // Schedule validation
    if (data.scheduleType === 'scheduled') {
      if (!data.scheduledTime) {
        errors.push('Scheduled time is required');
      } else if (data.scheduledTime <= new Date()) {
        errors.push('Scheduled time must be in the future');
      }
    }

    // Data payload validation
    if (data.data) {
      try {
        JSON.stringify(data.data);
      } catch (error) {
        errors.push('Data payload must be valid JSON');
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Send notification immediately
   */
  async sendNotification(data: NotificationFormData) {
    const validation = this.validateForm(data);
    if (!validation.valid) {
      throw new Error(validation.errors.join(', '));
    }

    const payload: SendNotificationPayload = {
      title: data.title.trim(),
      body: data.body.trim(),
      target: data.target,
      userIds: data.target === 'specific' ? data.userIds : undefined,
      priority: data.priority,
      data: data.data,
    };

    return await notificationApi.send(payload);
  }

  /**
   * Schedule notification for later
   */
  async scheduleNotification(data: NotificationFormData) {
    const validation = this.validateForm(data);
    if (!validation.valid) {
      throw new Error(validation.errors.join(', '));
    }

    if (!data.scheduledTime) {
      throw new Error('Scheduled time is required');
    }

    const payload: ScheduleNotificationPayload = {
      title: data.title.trim(),
      body: data.body.trim(),
      target: data.target,
      userIds: data.target === 'specific' ? data.userIds : undefined,
      priority: data.priority,
      data: data.data,
      scheduledFor: data.scheduledTime.toISOString(),
    };

    return await notificationApi.schedule(payload);
  }

  /**
   * Send test notification
   */
  async sendTestNotification(title: string, body: string) {
    if (!title || !body) {
      throw new Error('Title and body are required for test notification');
    }

    return await notificationApi.sendTest({ title, body });
  }

  /**
   * Get notification history with filters
   */
  async getHistory(filters?: {
    page?: number;
    limit?: number;
    type?: string;
    status?: 'sent' | 'delivered' | 'failed';
  }) {
    return await notificationApi.getHistory(filters);
  }

  /**
   * Get scheduled notifications
   */
  async getScheduled(status?: 'pending' | 'sent' | 'cancelled' | 'failed') {
    return await notificationApi.getScheduled({ status });
  }

  /**
   * Cancel scheduled notification
   */
  async cancelScheduled(id: string) {
    if (!id) {
      throw new Error('Notification ID is required');
    }
    return await notificationApi.cancelScheduled(id);
  }

  /**
   * Get all available templates
   */
  async getTemplates() {
    return await notificationApi.getTemplates();
  }

  /**
   * Apply template with variable substitution
   */
  async applyTemplate(templateName: string, variables: Record<string, any>) {
    if (!templateName) {
      throw new Error('Template name is required');
    }
    return await notificationApi.applyTemplate(templateName, variables);
  }

  /**
   * Calculate estimated reach based on target
   */
  estimateReach(target: 'all' | 'active' | 'inactive' | 'specific', userCount?: number): string {
    switch (target) {
      case 'all':
        return 'All users';
      case 'active':
        return 'Active users (last 7 days)';
      case 'inactive':
        return 'Inactive users (7+ days)';
      case 'specific':
        return userCount ? `${userCount} selected user${userCount !== 1 ? 's' : ''}` : '0 users';
      default:
        return 'Unknown';
    }
  }

  /**
   * Format notification preview
   */
  formatPreview(title: string, body: string, priority: 'low' | 'normal' | 'high') {
    return {
      title: title || 'Notification Title',
      body: body || 'Notification body will appear here...',
      priority,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Validate JSON data payload
   */
  validateDataPayload(dataString: string): { valid: boolean; data?: Record<string, any>; error?: string } {
    if (!dataString || dataString.trim() === '' || dataString.trim() === '{}') {
      return { valid: true, data: undefined };
    }

    try {
      const data = JSON.parse(dataString);
      if (typeof data !== 'object' || Array.isArray(data)) {
        return { valid: false, error: 'Data must be a JSON object' };
      }
      return { valid: true, data };
    } catch (error) {
      return { valid: false, error: 'Invalid JSON format' };
    }
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
