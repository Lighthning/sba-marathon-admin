import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Bell, CheckCircle, X } from 'lucide-react';
import { notificationApi, NotificationTemplate as BackendTemplate } from '../api/notifications';
import { notificationService, NotificationFormData } from '../services/notificationService';

type NotificationTarget = 'all' | 'active' | 'inactive' | 'specific';
type NotificationPriority = 'low' | 'normal' | 'high';
type ScheduleType = 'now' | 'scheduled';
type TabType = 'compose' | 'scheduled' | 'history';

interface User {
  id: string;
  fullName: string;
  email: string;
}

interface ScheduledNotification {
  id: string;
  title: string;
  body: string;
  target: NotificationTarget;
  targetCount?: number;
  scheduledTime: string;
  status: string;
  priority: NotificationPriority;
}

interface NotificationHistory {
  id: string;
  title: string;
  body: string;
  target: NotificationTarget;
  targetCount?: number;
  sentTime: string;
  delivered?: number;
  opened?: number;
  ctr?: number;
}

const Notifications: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('compose');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Compose Form State
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [target, setTarget] = useState<NotificationTarget>('all');
  const [specificUsers, setSpecificUsers] = useState<string[]>([]);
  const [priority, setPriority] = useState<NotificationPriority>('normal');
  const [dataPayload, setDataPayload] = useState('{}');
  const [scheduleType, setScheduleType] = useState<ScheduleType>('now');
  const [scheduledTime, setScheduledTime] = useState('');

  // Data State
  const [templates, setTemplates] = useState<BackendTemplate[]>([]);
  const [_users, _setUsers] = useState<User[]>([]);
  const [scheduledNotifications, setScheduledNotifications] = useState<ScheduledNotification[]>([]);
  const [historyNotifications, setHistoryNotifications] = useState<NotificationHistory[]>([]);
  const [historyPage, _setHistoryPage] = useState(1);
  const [scheduledPage, _setScheduledPage] = useState(1);
  const [scheduledFilter, setScheduledFilter] = useState<'pending' | 'sent' | 'cancelled' | 'failed' | undefined>('pending');

  // Load templates on mount
  useEffect(() => {
    loadTemplates();
  }, []);

  // Load data on tab change
  useEffect(() => {
    if (activeTab === 'scheduled') {
      loadScheduled();
    } else if (activeTab === 'history') {
      loadHistory();
    }
  }, [activeTab, scheduledFilter, scheduledPage, historyPage]);

  const loadTemplates = async () => {
    try {
      const response = await notificationApi.getTemplates();
      setTemplates(response.templates);
    } catch (error) {
      console.error('Failed to load templates:', error);
    }
  };

  const loadScheduled = async () => {
    try {
      setIsLoading(true);
      const response = await notificationService.getScheduled(scheduledFilter);
      setScheduledNotifications(response.notifications || []);
    } catch (error) {
      showToast('Failed to load scheduled notifications', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const loadHistory = async () => {
    try {
      setIsLoading(true);
      const response = await notificationService.getHistory({
        page: historyPage,
        limit: 50,
      });
      setHistoryNotifications(response.notifications || []);
    } catch (error) {
      showToast('Failed to load notification history', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  const applyTemplate = (template: BackendTemplate) => {
    setTitle(template.title);
    setBody(template.body);
    setPriority(template.priority);
    if (template.data) {
      setDataPayload(JSON.stringify(template.data, null, 2));
    }
  };

  const isFormValid = (): boolean => {
    const validation = notificationService.validateDataPayload(dataPayload);
    if (!validation.valid) return false;

    if (!title.trim() || !body.trim()) return false;
    if (title.length < 3 || title.length > 100) return false;
    if (body.length < 10 || body.length > 500) return false;
    if (target === 'specific' && specificUsers.length === 0) return false;
    if (scheduleType === 'scheduled' && !scheduledTime) return false;

    return true;
  };

  const handleSend = async () => {
    if (!isFormValid()) {
      showToast('Please fill in all required fields correctly', 'error');
      return;
    }

    setShowConfirmModal(true);
  };

  const confirmSend = async () => {
    setShowConfirmModal(false);
    setIsLoading(true);

    const validation = notificationService.validateDataPayload(dataPayload);
    const formData: NotificationFormData = {
      title,
      body,
      target,
      userIds: target === 'specific' ? specificUsers : undefined,
      priority,
      data: validation.data,
      scheduleType,
      scheduledTime: scheduledTime ? new Date(scheduledTime) : undefined,
    };

    try {
      if (scheduleType === 'now') {
        const result = await notificationService.sendNotification(formData);
        showToast(
          `Notification sent! ${result.sentCount} sent, ${result.failedCount} failed.`,
          'success'
        );
      } else {
        await notificationService.scheduleNotification(formData);
        showToast('Notification scheduled successfully!', 'success');
      }
      resetForm();
    } catch (error: any) {
      showToast(error.message || 'Failed to send notification', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendTest = async () => {
    if (!title.trim() || !body.trim()) {
      showToast('Please enter a title and body first', 'error');
      return;
    }

    try {
      setIsLoading(true);
      await notificationService.sendTestNotification(title, body);
      showToast('Test notification sent to your device!', 'success');
    } catch (error: any) {
      showToast(error.message || 'Failed to send test notification', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setBody('');
    setTarget('all');
    setSpecificUsers([]);
    setPriority('normal');
    setDataPayload('{}');
    setScheduleType('now');
    setScheduledTime('');
  };

  const handleCancelScheduled = async (id: string) => {
    if (!window.confirm('Are you sure you want to cancel this scheduled notification?')) {
      return;
    }

    try {
      setIsLoading(true);
      await notificationService.cancelScheduled(id);
      showToast('Notification cancelled successfully', 'success');
      loadScheduled();
    } catch (error: any) {
      showToast(error.message || 'Failed to cancel notification', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDuplicateScheduled = (notification: ScheduledNotification) => {
    setActiveTab('compose');
    setTitle(notification.title);
    setBody(notification.body);
    setTarget(notification.target);
    setPriority(notification.priority);
    setScheduleType('now');
  };

  const styles: Record<string, React.CSSProperties> = {
    modal: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.75)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    },
    modalContent: {
      background: '#1e293b',
      border: '1px solid #334155',
      borderRadius: '8px',
      padding: '32px',
      maxWidth: '500px',
      width: '90%',
    },
    toast: {
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      padding: '14px 20px',
      borderRadius: '6px',
      color: '#f8fafc',
      fontFamily: 'DM Sans, sans-serif',
      fontWeight: '600',
      zIndex: 2000,
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    },
    toastSuccess: {
      background: '#10b981',
    },
    toastError: {
      background: '#ef4444',
    },
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Notifications</h1>
          <p className="page-subtitle">Send push notifications to iOS and Android users</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="tab-bar">
        <button
          className={`tab-item ${activeTab === 'compose' ? 'active' : ''}`}
          onClick={() => setActiveTab('compose')}
        >
          Compose
        </button>
        <button
          className={`tab-item ${activeTab === 'scheduled' ? 'active' : ''}`}
          onClick={() => setActiveTab('scheduled')}
        >
          Scheduled
        </button>
        <button
          className={`tab-item ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          History
        </button>
      </div>

      {/* Compose Tab */}
      {activeTab === 'compose' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 400px',
          gap: '32px',
        }}>
          {/* Form Column */}
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px',
            boxShadow: 'var(--shadow-sm)',
          }}>
            <h3 style={{
              fontSize: '16px',
              fontWeight: 600,
              color: 'var(--text-primary)',
              marginBottom: '20px',
            }}>
              Notification Details
            </h3>

            {/* Template Selector */}
            {templates.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 500,
                  color: 'var(--text-secondary)',
                  marginBottom: '6px',
                }}>
                  Load Template
                </label>
                <select
                  onChange={(e) => {
                    const template = templates.find(t => t.id === e.target.value);
                    if (template) applyTemplate(template);
                  }}
                  value=""
                  className="input"
                >
                  <option value="">Select a template...</option>
                  {templates.map(template => (
                    <option key={template.id} value={template.id}>{template.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Title */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 500,
                  color: 'var(--text-secondary)',
                  marginBottom: '6px',
                }}>
                  Title *
                </label>
                <input
                  type="text"
                  className="input"
                  placeholder="Enter notification title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value.slice(0, 100))}
                  maxLength={100}
                />
                <div style={{
                  fontSize: '11px',
                  color: 'var(--text-tertiary)',
                  marginTop: '4px',
                  fontFamily: 'var(--font-mono)',
                }}>
                  {title.length}/100 characters
                </div>
              </div>

              {/* Body */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 500,
                  color: 'var(--text-secondary)',
                  marginBottom: '6px',
                }}>
                  Message *
                </label>
                <textarea
                  className="input"
                  style={{
                    height: '120px',
                    resize: 'vertical',
                    padding: '12px',
                  }}
                  placeholder="Enter notification message..."
                  value={body}
                  onChange={(e) => setBody(e.target.value.slice(0, 500))}
                  maxLength={500}
                />
                <div style={{
                  fontSize: '11px',
                  color: 'var(--text-tertiary)',
                  marginTop: '4px',
                  fontFamily: 'var(--font-mono)',
                }}>
                  {body.length}/500 characters
                </div>
              </div>

              {/* Target Audience */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 500,
                  color: 'var(--text-secondary)',
                  marginBottom: '6px',
                }}>
                  Target Audience
                </label>
                <select
                  className="input"
                  value={target}
                  onChange={(e) => setTarget(e.target.value as NotificationTarget)}
                >
                  <option value="all">All Users</option>
                  <option value="active">Active Users (last 7 days)</option>
                  <option value="inactive">Inactive Users</option>
                  <option value="specific">Specific Users</option>
                </select>
              </div>

              {/* Priority */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 500,
                  color: 'var(--text-secondary)',
                  marginBottom: '6px',
                }}>
                  Priority
                </label>
                <select
                  className="input"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as NotificationPriority)}
                >
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                </select>
              </div>

              {/* Scheduling */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 500,
                  color: 'var(--text-secondary)',
                  marginBottom: '6px',
                }}>
                  Schedule
                </label>
                <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      checked={scheduleType === 'now'}
                      onChange={() => setScheduleType('now')}
                      style={{ accentColor: 'var(--blue)' }}
                    />
                    Send Now
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      checked={scheduleType === 'scheduled'}
                      onChange={() => setScheduleType('scheduled')}
                      style={{ accentColor: 'var(--blue)' }}
                    />
                    Schedule for Later
                  </label>
                </div>
                {scheduleType === 'scheduled' && (
                  <input
                    type="datetime-local"
                    className="input"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    min={new Date().toISOString().slice(0, 16)}
                  />
                )}
              </div>

              {/* Action Buttons */}
              <div style={{
                display: 'flex',
                gap: '12px',
                marginTop: '8px',
                paddingTop: '16px',
                borderTop: '1px solid var(--border)',
              }}>
                <button
                  className="btn-secondary"
                  onClick={handleSendTest}
                  disabled={!title.trim() || !body.trim() || isLoading}
                  style={{ flex: 1 }}
                >
                  {isLoading ? 'Sending...' : 'Test'}
                </button>
                <button
                  className="btn-primary"
                  onClick={handleSend}
                  disabled={!isFormValid() || isLoading}
                  style={{ flex: 2 }}
                >
                  {isLoading ? 'Processing...' : scheduleType === 'now' ? 'Send Now' : 'Schedule Notification'}
                </button>
              </div>
            </div>
          </div>

          {/* Preview Column */}
          <div>
            <h3 style={{
              fontSize: '14px',
              fontWeight: 600,
              color: 'var(--text-secondary)',
              marginBottom: '16px',
              fontFamily: 'var(--font-mono)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>
              Preview
            </h3>

            {/* iOS Preview */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{
                fontSize: '12px',
                fontWeight: 500,
                color: 'var(--text-tertiary)',
                marginBottom: '8px',
              }}>
                iOS
              </div>
              <div style={{
                background: '#1a1a2e',
                borderRadius: '20px',
                padding: '20px',
                border: '8px solid var(--dark-blue)',
                boxShadow: 'var(--shadow-lg)',
              }}>
                <div style={{
                  background: 'rgba(255, 255, 255, 0.95)',
                  borderRadius: '12px',
                  padding: '14px',
                  color: '#000',
                }}>
                  <div style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    marginBottom: '4px',
                  }}>
                    {title || 'Notification Title'}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: '#666',
                    lineHeight: '1.4',
                  }}>
                    {body || 'Your notification message will appear here...'}
                  </div>
                </div>
              </div>
            </div>

            {/* Android Preview */}
            <div>
              <div style={{
                fontSize: '12px',
                fontWeight: 500,
                color: 'var(--text-tertiary)',
                marginBottom: '8px',
              }}>
                Android
              </div>
              <div style={{
                background: '#1a1a2e',
                borderRadius: '20px',
                padding: '20px',
                border: '8px solid var(--dark-blue)',
                boxShadow: 'var(--shadow-lg)',
              }}>
                <div style={{
                  background: 'rgba(255, 255, 255, 0.95)',
                  borderRadius: '8px',
                  padding: '12px 14px',
                  color: '#000',
                }}>
                  <div style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    marginBottom: '4px',
                  }}>
                    {title || 'Notification Title'}
                  </div>
                  <div style={{
                    fontSize: '11px',
                    color: '#666',
                    lineHeight: '1.4',
                  }}>
                    {body || 'Your notification message will appear here...'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Scheduled Tab */}
      {activeTab === 'scheduled' && (
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-sm)',
        }}>
          {/* Header with Filter */}
          <div style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <h2 style={{
              fontSize: '16px',
              fontWeight: 600,
              color: 'var(--text-primary)',
            }}>
              Scheduled Notifications
            </h2>
            <select
              value={scheduledFilter || 'pending'}
              onChange={(e) => setScheduledFilter(e.target.value as any)}
              className="input"
              style={{ width: 'auto', minWidth: '150px' }}
            >
              <option value="pending">Pending</option>
              <option value="sent">Sent</option>
              <option value="cancelled">Cancelled</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          {isLoading ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <Bell size={20} />
              </div>
              <h3 className="empty-state-title">Loading...</h3>
              <p className="empty-state-desc">Fetching scheduled notifications</p>
            </div>
          ) : scheduledNotifications.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <Bell size={20} />
              </div>
              <h3 className="empty-state-title">No scheduled notifications</h3>
              <p className="empty-state-desc">Schedule notifications from the Compose tab</p>
            </div>
          ) : (
            <div>
              {scheduledNotifications.map((notification) => (
                <div
                  key={notification.id}
                  style={{
                    padding: '16px 20px',
                    borderBottom: '1px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                  }}
                >
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--teal-dim)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--teal)',
                  }}>
                    <Bell size={18} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: 500,
                      color: 'var(--text-primary)',
                      marginBottom: '4px',
                    }}>
                      {notification.title}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: 'var(--text-tertiary)',
                      fontFamily: 'var(--font-mono)',
                    }}>
                      {format(new Date(notification.scheduledTime), 'PPp')} • {notification.target}
                      {notification.targetCount ? ` • ${notification.targetCount} users` : ''}
                    </div>
                  </div>
                  <span className={`badge ${notification.status === 'pending' ? 'badge-warning' : 'badge-active'}`}>
                    {notification.status}
                  </span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      className="btn-icon"
                      onClick={() => handleDuplicateScheduled(notification)}
                      disabled={isLoading}
                      title="Duplicate"
                    >
                      📋
                    </button>
                    {notification.status === 'pending' && (
                      <button
                        className="btn-icon"
                        onClick={() => handleCancelScheduled(notification.id)}
                        disabled={isLoading}
                        title="Cancel"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-sm)',
        }}>
          {isLoading ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <Bell size={20} />
              </div>
              <h3 className="empty-state-title">Loading...</h3>
              <p className="empty-state-desc">Fetching notification history</p>
            </div>
          ) : historyNotifications.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <Bell size={20} />
              </div>
              <h3 className="empty-state-title">No notification history</h3>
              <p className="empty-state-desc">Sent notifications will appear here</p>
            </div>
          ) : (
            <div>
              {historyNotifications.map((notification) => (
                <div
                  key={notification.id}
                  style={{
                    padding: '16px 20px',
                    borderBottom: '1px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                  }}
                >
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--success-dim)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--success)',
                  }}>
                    <CheckCircle size={18} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: 500,
                      color: 'var(--text-primary)',
                      marginBottom: '4px',
                    }}>
                      {notification.title}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: 'var(--text-tertiary)',
                      fontFamily: 'var(--font-mono)',
                    }}>
                      Sent {format(new Date(notification.sentTime), 'PPp')} • {notification.target}
                      {notification.targetCount ? ` • ${notification.targetCount} recipients` : ''}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    {notification.delivered !== undefined && (
                      <div style={{ textAlign: 'center' }}>
                        <div style={{
                          fontSize: '16px',
                          fontWeight: 600,
                          color: 'var(--text-primary)',
                        }}>
                          {notification.delivered}
                        </div>
                        <div style={{
                          fontSize: '11px',
                          color: 'var(--text-tertiary)',
                        }}>
                          Delivered
                        </div>
                      </div>
                    )}
                    {notification.opened !== undefined && (
                      <div style={{ textAlign: 'center' }}>
                        <div style={{
                          fontSize: '16px',
                          fontWeight: 600,
                          color: 'var(--text-primary)',
                        }}>
                          {notification.opened}
                        </div>
                        <div style={{
                          fontSize: '11px',
                          color: 'var(--text-tertiary)',
                        }}>
                          Opened
                        </div>
                      </div>
                    )}
                    {notification.ctr !== undefined && (
                      <div style={{ textAlign: 'center' }}>
                        <div style={{
                          fontSize: '16px',
                          fontWeight: 600,
                          color: 'var(--text-primary)',
                        }}>
                          {(notification.ctr * 100).toFixed(1)}%
                        </div>
                        <div style={{
                          fontSize: '11px',
                          color: 'var(--text-tertiary)',
                        }}>
                          CTR
                        </div>
                      </div>
                    )}
                    <span className="badge badge-active">Delivered</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div style={styles.modal} onClick={() => setShowConfirmModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2 style={{fontSize: '24px', fontWeight: '700', color: '#fff', fontFamily: 'Outfit, sans-serif', marginBottom: '16px'}}>
              Confirm Send
            </h2>
            <p style={{color: 'rgba(255, 255, 255, 0.8)', fontFamily: 'DM Sans, sans-serif', marginBottom: '24px'}}>
              Are you sure you want to {scheduleType === 'now' ? 'send' : 'schedule'} this notification?
            </p>
            <div style={{marginBottom: '24px', padding: '16px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px', fontSize: '14px', fontFamily: 'DM Sans, sans-serif', color: 'rgba(255, 255, 255, 0.9)'}}>
              <p style={{marginBottom: '8px'}}><strong>Title:</strong> {title}</p>
              <p style={{marginBottom: '8px'}}><strong>Body:</strong> {body}</p>
              <p style={{marginBottom: '8px'}}><strong>Target:</strong> {target}</p>
              {scheduleType === 'scheduled' && (
                <p><strong>Scheduled Time:</strong> {format(new Date(scheduledTime), 'PPp')}</p>
              )}
            </div>
            <div style={{display: 'flex', gap: '12px', justifyContent: 'flex-end'}}>
              <button style={styles.btnSecondary} onClick={() => setShowConfirmModal(false)}>
                Cancel
              </button>
              <button style={styles.btnPrimary} onClick={confirmSend}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div style={{...styles.toast, ...(toast.type === 'success' ? styles.toastSuccess : styles.toastError)}}>
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default Notifications;
