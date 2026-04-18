// /Users/khalid/Desktop/Marathon/src/admin/src/pages/Settings.tsx
import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Bell,
  User,
  Info,
  Clock,
  Check,
  X as XIcon,
  Database,
  Eye,
  EyeOff,
  Save,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { settingsApi } from '../lib/api';

type TabType = 'program' | 'notifications' | 'account' | 'system';

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('program');
  const [isLoading, setIsLoading] = useState(false);
  const [databaseStatus, setDatabaseStatus] = useState<'connected' | 'disconnected' | 'loading'>('loading');

  // Program settings state
  const [programSettings, setProgramSettings] = useState<any>(null);
  const [startDate, setStartDate] = useState('');
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Notification Settings State
  const [defaultNotificationTime, setDefaultNotificationTime] = useState(
    localStorage.getItem('defaultNotificationTime') || '09:00'
  );
  const [dailyReminderEnabled, setDailyReminderEnabled] = useState(
    localStorage.getItem('dailyReminderEnabled') === 'true'
  );

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Fetch database status and program settings on mount
  useEffect(() => {
    fetchDatabaseStatus();
    fetchProgramSettings();
  }, []);

  const fetchProgramSettings = async () => {
    try {
      const settings = await settingsApi.get();
      setProgramSettings(settings);
      setStartDate(settings.startDate || '');
    } catch (error) {
      console.error('Failed to fetch program settings:', error);
      toast.error('Failed to load program settings');
    }
  };

  const fetchDatabaseStatus = async () => {
    try {
      setDatabaseStatus('loading');
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
      const response = await fetch(`${baseUrl}/health`);
      const data = await response.json();
      setDatabaseStatus(data.database === 'connected' ? 'connected' : 'disconnected');
    } catch (error) {
      setDatabaseStatus('disconnected');
    }
  };

  const handleSaveNotificationSettings = () => {
    localStorage.setItem('defaultNotificationTime', defaultNotificationTime);
    localStorage.setItem('dailyReminderEnabled', String(dailyReminderEnabled));
    toast.success('Notification settings saved');
  };

  const handleChangePassword = async () => {
    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Please fill in all password fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    try {
      setIsLoading(true);
      const token = localStorage.getItem('adminToken');
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

      const response = await fetch(`${baseUrl}/api/auth/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to change password');
      }

      toast.success('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProgramSettings = async () => {
    // Validate date format
    if (!startDate) {
      toast.error('Start date is required');
      return;
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(startDate)) {
      toast.error('Invalid date format. Use YYYY-MM-DD');
      return;
    }

    try {
      setIsSavingSettings(true);
      await settingsApi.update({ startDate });
      toast.success('Program settings updated successfully');
      // Refresh settings to show updated values
      await fetchProgramSettings();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update settings');
    } finally {
      setIsSavingSettings(false);
    }
  };

  const tabs = [
    { id: 'program' as TabType, label: 'Program Configuration', icon: Calendar },
    { id: 'notifications' as TabType, label: 'Notifications', icon: Bell },
    { id: 'account' as TabType, label: 'Admin Account', icon: User },
    { id: 'system' as TabType, label: 'System Info', icon: Info },
  ];

  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-canvas)', padding: '32px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div className="page-header" style={{ marginBottom: '32px' }}>
          <div>
            <h1 className="page-title">Settings</h1>
            <p className="page-subtitle">Manage system configuration and preferences</p>
          </div>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '24px',
          borderBottom: '1px solid var(--border)',
          flexWrap: 'wrap',
        }}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 20px',
                  background: isActive ? 'var(--bg-elevated)' : 'transparent',
                  border: 'none',
                  borderBottom: isActive ? '2px solid var(--teal)' : '2px solid transparent',
                  color: isActive ? 'var(--teal)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: isActive ? 600 : 500,
                  transition: 'all 0.2s ease',
                }}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-sm)',
        }}>
          {/* Program Configuration Tab */}
          {activeTab === 'program' && (
            <div style={{ padding: '32px' }}>
              <h2 style={{
                fontSize: '18px',
                fontWeight: 600,
                marginBottom: '24px',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-display)',
              }}>
                Program Configuration
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: 'var(--text-tertiary)',
                    marginBottom: '8px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}>
                    Program Name
                  </label>
                  <p style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: 500 }}>
                    {programSettings?.programName || 'Loading...'}
                  </p>
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: 'var(--text-tertiary)',
                    marginBottom: '8px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}>
                    Start Date
                  </label>
                  <input
                    type="date"
                    className="input"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    style={{ width: '100%', maxWidth: '220px' }}
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: 'var(--text-tertiary)',
                    marginBottom: '8px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}>
                    Total Days
                  </label>
                  <p style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: 500 }}>
                    99
                  </p>
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: 'var(--text-tertiary)',
                    marginBottom: '8px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}>
                    Total Phases
                  </label>
                  <p style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: 500 }}>
                    11
                  </p>
                </div>
              </div>

              <div style={{ marginTop: '24px' }}>
                <button
                  className="btn-primary"
                  onClick={handleSaveProgramSettings}
                  disabled={isSavingSettings}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    opacity: isSavingSettings ? 0.6 : 1,
                    cursor: isSavingSettings ? 'not-allowed' : 'pointer',
                  }}
                >
                  {isSavingSettings ? (
                    <>
                      <Clock className="animate-spin" size={16} />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      Save Settings
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div style={{ padding: '32px' }}>
              <h2 style={{
                fontSize: '18px',
                fontWeight: 600,
                marginBottom: '24px',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-display)',
              }}>
                Notification Settings
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '500px' }}>
                {/* Default Notification Time */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    marginBottom: '8px',
                  }}>
                    Default Notification Time
                  </label>
                  <input
                    type="time"
                    className="input"
                    value={defaultNotificationTime}
                    onChange={(e) => setDefaultNotificationTime(e.target.value)}
                    style={{ width: '100%' }}
                  />
                  <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '6px' }}>
                    Default time for sending daily reminders to participants
                  </p>
                </div>

                {/* Daily Reminder Toggle */}
                <div>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    padding: '16px',
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                  }}>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                        Daily Reminders
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                        Send automatic daily reminders to participants
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={dailyReminderEnabled}
                      onChange={(e) => setDailyReminderEnabled(e.target.checked)}
                      style={{
                        width: '44px',
                        height: '24px',
                        accentColor: 'var(--teal)',
                        cursor: 'pointer',
                      }}
                    />
                  </label>
                </div>

                {/* Save Button */}
                <button
                  className="btn-primary"
                  onClick={handleSaveNotificationSettings}
                  style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <Check size={16} />
                  Save Settings
                </button>
              </div>
            </div>
          )}

          {/* Admin Account Tab */}
          {activeTab === 'account' && (
            <div style={{ padding: '32px' }}>
              <h2 style={{
                fontSize: '18px',
                fontWeight: 600,
                marginBottom: '24px',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-display)',
              }}>
                Admin Account
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '500px' }}>
                {/* Current Admin Email */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: 'var(--text-tertiary)',
                    marginBottom: '8px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}>
                    Email Address
                  </label>
                  <p style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: 500 }}>
                    admin@marathon.com
                  </p>
                </div>

                {/* Change Password Section */}
                <div style={{
                  borderTop: '1px solid var(--border)',
                  paddingTop: '24px',
                }}>
                  <h3 style={{
                    fontSize: '15px',
                    fontWeight: 600,
                    marginBottom: '16px',
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-display)',
                  }}>
                    Change Password
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {/* Current Password */}
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '13px',
                        fontWeight: 600,
                        color: 'var(--text-primary)',
                        marginBottom: '8px',
                      }}>
                        Current Password
                      </label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type={showCurrentPassword ? 'text' : 'password'}
                          className="input"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="Enter current password"
                          style={{ width: '100%', paddingRight: '40px' }}
                        />
                        <button
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          style={{
                            position: 'absolute',
                            right: '12px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: 'var(--text-tertiary)',
                            padding: '4px',
                            display: 'flex',
                            alignItems: 'center',
                          }}
                        >
                          {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    {/* New Password */}
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '13px',
                        fontWeight: 600,
                        color: 'var(--text-primary)',
                        marginBottom: '8px',
                      }}>
                        New Password
                      </label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          className="input"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Enter new password (min 8 characters)"
                          style={{ width: '100%', paddingRight: '40px' }}
                        />
                        <button
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          style={{
                            position: 'absolute',
                            right: '12px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: 'var(--text-tertiary)',
                            padding: '4px',
                            display: 'flex',
                            alignItems: 'center',
                          }}
                        >
                          {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '13px',
                        fontWeight: 600,
                        color: 'var(--text-primary)',
                        marginBottom: '8px',
                      }}>
                        Confirm New Password
                      </label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          className="input"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Confirm new password"
                          style={{ width: '100%', paddingRight: '40px' }}
                        />
                        <button
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          style={{
                            position: 'absolute',
                            right: '12px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: 'var(--text-tertiary)',
                            padding: '4px',
                            display: 'flex',
                            alignItems: 'center',
                          }}
                        >
                          {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button
                      className="btn-primary"
                      onClick={handleChangePassword}
                      disabled={isLoading}
                      style={{
                        alignSelf: 'flex-start',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        opacity: isLoading ? 0.6 : 1,
                        cursor: isLoading ? 'not-allowed' : 'pointer',
                      }}
                    >
                      {isLoading ? (
                        <>
                          <Clock className="animate-spin" size={16} />
                          Changing Password...
                        </>
                      ) : (
                        <>
                          <Check size={16} />
                          Change Password
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* System Info Tab */}
          {activeTab === 'system' && (
            <div style={{ padding: '32px' }}>
              <h2 style={{
                fontSize: '18px',
                fontWeight: 600,
                marginBottom: '24px',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-display)',
              }}>
                System Information
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: 'var(--text-tertiary)',
                    marginBottom: '8px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}>
                    App Version
                  </label>
                  <p style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: 500, fontFamily: 'var(--font-mono)' }}>
                    1.0.0
                  </p>
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: 'var(--text-tertiary)',
                    marginBottom: '8px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}>
                    Backend URL
                  </label>
                  <p style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: 500, fontFamily: 'var(--font-mono)' }}>
                    {baseUrl}
                  </p>
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: 'var(--text-tertiary)',
                    marginBottom: '8px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}>
                    Database Status
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {databaseStatus === 'loading' ? (
                      <>
                        <Clock className="animate-spin" size={16} style={{ color: 'var(--text-tertiary)' }} />
                        <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Checking...</span>
                      </>
                    ) : databaseStatus === 'connected' ? (
                      <>
                        <Database size={16} style={{ color: 'var(--success)' }} />
                        <span style={{ fontSize: '14px', color: 'var(--success)', fontWeight: 500 }}>Connected</span>
                      </>
                    ) : (
                      <>
                        <XIcon size={16} style={{ color: 'var(--danger)' }} />
                        <span style={{ fontSize: '14px', color: 'var(--danger)', fontWeight: 500 }}>Disconnected</span>
                      </>
                    )}
                  </div>
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: 'var(--text-tertiary)',
                    marginBottom: '8px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}>
                    Last Deployment
                  </label>
                  <p style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: 500 }}>
                    April 16, 2026
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Settings;
