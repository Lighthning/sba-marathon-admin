import React, { useState, useEffect } from 'react';
import {
  Settings,
  Download,
  CheckCircle,
  AlertCircle,
  X,
  AlertTriangle,
} from 'lucide-react';
import {
  getTaskPhases,
  getTaskByDayNumber,
  updateTask,
  getProgramSettings,
  updateProgramSettings,
  Phase,
  Task,
  ProgramSettings,
} from '../api/taskApi';
import toast from 'react-hot-toast';

// Short phase labels for tabs
const SHORT_LABELS = [
  'Yourself',
  'Idea Shape',
  'First Version',
  'Strategy',
  'Momentum',
  'Clarity',
  'Risks',
  'Differentiation',
  'Public Shape',
  'Readiness',
  'Final Prep',
];

// StatCard component
const StatCard: React.FC<{
  label: string;
  value: string | number;
  color?: 'default' | 'success' | 'warning';
  action?: { label: string; onClick: () => void };
}> = ({ label, value, color = 'default', action }) => {
  const colorMap = {
    default: 'var(--accent)',
    success: 'var(--success)',
    warning: 'var(--warning)',
  };

  return (
    <div
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        padding: '16px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}
    >
      <div
        style={{
          fontSize: '11px',
          fontFamily: 'var(--font-mono)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          color: 'var(--text-secondary)',
          fontWeight: 600,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: '28px',
          fontWeight: 700,
          color: colorMap[color],
          lineHeight: '1',
        }}
      >
        {value}
      </div>
      {action && (
        <button
          onClick={action.onClick}
          style={{
            fontSize: '12px',
            color: 'var(--accent)',
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            fontWeight: 600,
            textAlign: 'left',
          }}
        >
          {action.label} →
        </button>
      )}
    </div>
  );
};

// GlassModal component
const GlassModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  maxWidth?: string;
  children: React.ReactNode;
}> = ({ visible, onClose, title, subtitle, maxWidth = '680px', children }) => {
  if (!visible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--bg-surface)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          maxWidth,
          width: '100%',
          maxHeight: '88vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '24px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>
              {title}
            </h2>
            {subtitle && (
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                {subtitle}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              color: 'var(--text-tertiary)',
            }}
          >
            <X size={20} />
          </button>
        </div>
        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>{children}</div>
      </div>
    </div>
  );
};

// ProgramSettingsModal component
const ProgramSettingsModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  settings: ProgramSettings | null;
  onSave: (settings: Partial<ProgramSettings>) => Promise<void>;
}> = ({ visible, onClose, settings, onSave }) => {
  const [formData, setFormData] = useState<ProgramSettings | null>(settings);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (settings) setFormData(settings);
  }, [settings]);

  if (!formData) return null;

  const computeEndDate = (startDate: string) => {
    const end = new Date(startDate);
    end.setDate(end.getDate() + 98);
    return end.toLocaleDateString('en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatScheduledDate = (startDate: string, dayNumber: number) => {
    const date = new Date(startDate);
    date.setDate(date.getDate() + dayNumber - 1);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <GlassModal
      visible={visible}
      onClose={onClose}
      title="Program Settings"
      subtitle="Changes to start date affect all 99 task scheduled dates"
      maxWidth="640px"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        {/* SECTION 1 — Program Schedule */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
            Program Schedule
          </h3>

          <div>
            <label
              style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--text-primary)',
                marginBottom: '6px',
              }}
            >
              Program Start Date *
            </label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className="input"
              style={{ width: '100%' }}
            />
          </div>

          {/* Warning banner */}
          <div
            style={{
              background: 'var(--warning-dim)',
              border: '1px solid var(--warning)',
              borderRadius: 'var(--radius-md)',
              padding: '12px',
              display: 'flex',
              gap: '8px',
            }}
          >
            <AlertTriangle size={16} style={{ color: 'var(--warning)', flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontSize: '12px', color: 'var(--text-primary)', lineHeight: '1.5' }}>
              Changing the start date will reschedule all 99 tasks.
              <br />
              <strong>Day 1 = {formatScheduledDate(formData.startDate, 1)}, Day 99 = {computeEndDate(formData.startDate)}.</strong>
              <br />
              Participants will see new dates immediately.
            </div>
          </div>

          {/* Live preview table */}
          <div
            style={{
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
            }}
          >
            <table style={{ width: '100%', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
              <thead>
                <tr style={{ background: 'var(--bg-elevated)' }}>
                  <th style={{ padding: '8px 12px', textAlign: 'left', color: 'var(--text-tertiary)' }}>Phase</th>
                  <th style={{ padding: '8px 12px', textAlign: 'left', color: 'var(--text-tertiary)' }}>First Day</th>
                  <th style={{ padding: '8px 12px', textAlign: 'left', color: 'var(--text-tertiary)' }}>Scheduled Date</th>
                </tr>
              </thead>
              <tbody>
                {[1, 10, 19, 28, 37, 46, 55, 64, 73, 82, 91].map((dayStart, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? 'var(--bg-surface)' : 'var(--bg-elevated)' }}>
                    <td style={{ padding: '6px 12px', color: 'var(--text-secondary)' }}>
                      {i + 1} · {SHORT_LABELS[i]}
                    </td>
                    <td style={{ padding: '6px 12px', color: 'var(--text-tertiary)' }}>Day {dayStart}</td>
                    <td style={{ padding: '6px 12px', color: 'var(--accent)' }}>
                      {formatScheduledDate(formData.startDate, dayStart)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* SECTION 2 — Program Identity */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
            Program Identity
          </h3>

          <div>
            <label
              style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--text-primary)',
                marginBottom: '6px',
              }}
            >
              Program Name
            </label>
            <input
              type="text"
              value={formData.programName}
              onChange={(e) => setFormData({ ...formData, programName: e.target.value })}
              className="input"
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label
              style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--text-primary)',
                marginBottom: '6px',
              }}
            >
              Program Subtitle
            </label>
            <input
              type="text"
              value={formData.programSubtitle}
              onChange={(e) => setFormData({ ...formData, programSubtitle: e.target.value })}
              className="input"
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label
              style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--text-primary)',
                marginBottom: '6px',
              }}
            >
              Organization
            </label>
            <input
              type="text"
              value={formData.organizationName}
              onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
              className="input"
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label
              style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--text-primary)',
                marginBottom: '6px',
              }}
            >
              Organization (Arabic)
            </label>
            <input
              type="text"
              dir="rtl"
              value={formData.organizationNameAr}
              onChange={(e) => setFormData({ ...formData, organizationNameAr: e.target.value })}
              className="input"
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label
              style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--text-primary)',
                marginBottom: '6px',
              }}
            >
              Website URL
            </label>
            <input
              type="text"
              value={formData.websiteUrl}
              onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
              className="input"
              style={{ width: '100%' }}
            />
          </div>
        </div>

        {/* SECTION 3 — Weekly Zoom Session */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
            Weekly Zoom Session
          </h3>

          <div>
            <label
              style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--text-primary)',
                marginBottom: '6px',
              }}
            >
              Zoom Link
            </label>
            <input
              type="text"
              value={formData.zoomLink}
              onChange={(e) => setFormData({ ...formData, zoomLink: e.target.value })}
              className="input"
              placeholder="https://us05web.zoom.us/j/..."
              style={{ width: '100%' }}
            />
            <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '4px' }}>
              This link appears in the Support screen for all participants
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  marginBottom: '6px',
                }}
              >
                Day
              </label>
              <select
                value={formData.zoomDay}
                onChange={(e) => setFormData({ ...formData, zoomDay: e.target.value })}
                className="input"
                style={{ width: '100%' }}
              >
                <option value="Monday">Monday</option>
                <option value="Tuesday">Tuesday</option>
                <option value="Wednesday">Wednesday</option>
                <option value="Thursday">Thursday</option>
                <option value="Friday">Friday</option>
                <option value="Saturday">Saturday</option>
                <option value="Sunday">Sunday</option>
              </select>
            </div>
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  marginBottom: '6px',
                }}
              >
                Time
              </label>
              <input
                type="time"
                value={formData.zoomTime}
                onChange={(e) => setFormData({ ...formData, zoomTime: e.target.value })}
                className="input"
                style={{ width: '100%' }}
              />
            </div>
          </div>

          <div>
            <label
              style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--text-primary)',
                marginBottom: '6px',
              }}
            >
              Timezone
            </label>
            <input
              type="text"
              value={formData.zoomTimezone}
              onChange={(e) => setFormData({ ...formData, zoomTimezone: e.target.value })}
              className="input"
              style={{ width: '100%' }}
            />
          </div>

          {/* Live preview */}
          <div
            style={{
              background: 'var(--bg-elevated)',
              borderRadius: 'var(--radius-md)',
              padding: '12px',
              fontSize: '13px',
              color: 'var(--text-secondary)',
            }}
          >
            Participants will see: <strong>Every {formData.zoomDay} at {formData.zoomTime} {formData.zoomTimezone}</strong>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          justifyContent: 'flex-end',
          marginTop: '24px',
          paddingTop: '16px',
          borderTop: '1px solid var(--border)',
        }}
      >
        <button className="btn-secondary" onClick={onClose}>
          Cancel
        </button>
        <button className="btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save All Settings'}
        </button>
      </div>
    </GlassModal>
  );
};

// EditTaskModal component
const EditTaskModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  task: Task | null;
  programStartDate: string;
  onSave: (dayNumber: number, updates: Partial<Task>) => Promise<void>;
  onOpenProgramSettings: () => void;
}> = ({ visible, onClose, task, programStartDate, onSave, onOpenProgramSettings }) => {
  const [activeTab, setActiveTab] = useState<'content' | 'settings' | 'schedule'>('content');
  const [formData, setFormData] = useState<Partial<Task> | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (task) {
      setFormData({
        taskName: task.taskName,
        whyItMatters: task.whyItMatters,
        task: task.task,
        goDeeper: task.goDeeper,
        progressSignal: task.progressSignal,
        isPublished: task.isPublished,
        isComplete: task.isComplete,
      });
    }
  }, [task]);

  if (!task || !formData) return null;

  const isProgressSignalValid = () => {
    const signal = formData.progressSignal?.trim() || '';
    return signal.startsWith('I can') || signal.startsWith('I have');
  };

  const canSave = () => {
    return (formData.taskName?.trim() || '').length > 0 && isProgressSignalValid();
  };

  const computeScheduledDate = (dayNumber: number) => {
    const date = new Date(programStartDate);
    date.setDate(date.getDate() + dayNumber - 1);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const computeEndDate = () => {
    const date = new Date(programStartDate);
    date.setDate(date.getDate() + 98);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const handleSave = async () => {
    if (!canSave()) return;

    setSaving(true);
    try {
      // Auto-set isComplete if task prompt is filled
      const updates = {
        ...formData,
        isComplete: (formData.task?.trim() || '').length > 0,
      };
      await onSave(task.dayNumber, updates);
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const isIncomplete = !(formData.task?.trim() || '').length;

  return (
    <GlassModal
      visible={visible}
      onClose={onClose}
      title={`Edit Task — Day ${task.dayNumber}`}
      subtitle={task.taskName}
    >
      {/* Tab Bar */}
      <div
        style={{
          display: 'flex',
          gap: '24px',
          borderBottom: '1px solid var(--border)',
          marginBottom: '24px',
        }}
      >
        {(['content', 'settings', 'schedule'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              background: 'none',
              border: 'none',
              padding: '12px 0',
              fontSize: '14px',
              fontWeight: 600,
              color: activeTab === tab ? 'var(--text-primary)' : 'var(--text-tertiary)',
              borderBottom: activeTab === tab ? '2px solid var(--accent)' : '2px solid transparent',
              cursor: 'pointer',
              textTransform: 'capitalize',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {activeTab === 'content' && (
          <>
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  marginBottom: '6px',
                }}
              >
                Task Name *
              </label>
              <input
                type="text"
                value={formData.taskName || ''}
                onChange={(e) => setFormData({ ...formData, taskName: e.target.value })}
                className="input"
                style={{
                  width: '100%',
                  borderColor: !(formData.taskName?.trim() || '').length ? 'var(--danger)' : undefined,
                }}
              />
              <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '4px', textAlign: 'right' }}>
                {(formData.taskName || '').length}/200
              </div>
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  marginBottom: '6px',
                }}
              >
                Why It Matters
              </label>
              <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginBottom: '6px' }}>
                Shown to participants as context/motivation before the task
              </div>
              <textarea
                value={formData.whyItMatters || ''}
                onChange={(e) => setFormData({ ...formData, whyItMatters: e.target.value })}
                className="input"
                style={{ width: '100%', minHeight: '120px', resize: 'vertical' }}
              />
              <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '4px', textAlign: 'right' }}>
                {(formData.whyItMatters || '').length}/3000
              </div>
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  marginBottom: '6px',
                }}
              >
                Main Task Prompt *
              </label>
              <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginBottom: '6px' }}>
                The primary reflection prompt participants respond to
              </div>
              <textarea
                value={formData.task || ''}
                onChange={(e) => setFormData({ ...formData, task: e.target.value })}
                className="input"
                style={{
                  width: '100%',
                  minHeight: '120px',
                  resize: 'vertical',
                  borderColor: !(formData.task?.trim() || '').length ? 'var(--warning)' : undefined,
                  borderWidth: !(formData.task?.trim() || '').length ? '1.5px' : undefined,
                }}
              />
              {!(formData.task?.trim() || '').length && (
                <div
                  style={{
                    background: 'var(--warning-dim)',
                    border: '1px solid var(--warning)',
                    borderRadius: 'var(--radius-md)',
                    padding: '8px 12px',
                    fontSize: '12px',
                    color: 'var(--warning)',
                    marginTop: '8px',
                    display: 'flex',
                    gap: '6px',
                    alignItems: 'center',
                  }}
                >
                  <AlertTriangle size={14} />
                  Required — participants cannot complete this task without a prompt
                </div>
              )}
              <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '4px', textAlign: 'right' }}>
                {(formData.task || '').length}/2000
              </div>
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  marginBottom: '6px',
                }}
              >
                Go Deeper (Optional Bonus)
              </label>
              <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginBottom: '6px' }}>
                Extra challenge shown to participants who want to go beyond the basics
              </div>
              <textarea
                value={formData.goDeeper || ''}
                onChange={(e) => setFormData({ ...formData, goDeeper: e.target.value })}
                className="input"
                style={{ width: '100%', minHeight: '80px', resize: 'vertical' }}
              />
              <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '4px', textAlign: 'right' }}>
                {(formData.goDeeper || '').length}/1500
              </div>
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  marginBottom: '6px',
                }}
              >
                Progress Signal *
              </label>
              <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginBottom: '6px' }}>
                The skill statement shown upon completion. Must start with "I can" or "I have"
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  value={formData.progressSignal || ''}
                  onChange={(e) => setFormData({ ...formData, progressSignal: e.target.value })}
                  className="input"
                  style={{
                    width: '100%',
                    borderColor: !isProgressSignalValid() ? 'var(--danger)' : 'var(--success)',
                    paddingRight: '36px',
                  }}
                />
                {isProgressSignalValid() && (
                  <CheckCircle
                    size={18}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--success)',
                    }}
                  />
                )}
              </div>
              {!isProgressSignalValid() && (
                <div style={{ fontSize: '11px', color: 'var(--danger)', marginTop: '4px' }}>
                  Must start with "I can" or "I have"
                </div>
              )}
              <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '4px', textAlign: 'right' }}>
                {(formData.progressSignal || '').length}/300
              </div>

              {/* Preview */}
              {formData.progressSignal && (
                <div
                  style={{
                    marginTop: '12px',
                    background: 'rgba(0, 151, 178, 0.08)',
                    border: '1px solid var(--accent)',
                    borderRadius: '10px',
                    padding: '10px 14px',
                  }}
                >
                  <div
                    style={{
                      fontSize: '10px',
                      fontFamily: 'var(--font-mono)',
                      textTransform: 'uppercase',
                      color: 'var(--accent)',
                      fontWeight: 700,
                      marginBottom: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    ⚡ SKILL UNLOCKED
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {formData.progressSignal}
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'settings' && (
          <>
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  marginBottom: '6px',
                }}
              >
                Visible to Participants
              </label>
              <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginBottom: '8px' }}>
                When off, task is hidden even if its date has arrived
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formData.isPublished || false}
                  onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                />
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  {formData.isPublished ? 'Published' : 'Draft'}
                </span>
              </label>
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  marginBottom: '6px',
                }}
              >
                Mark as Content Complete
              </label>
              <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginBottom: '8px' }}>
                Indicates this task has all required content. Auto-set when task prompt is filled.
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formData.isComplete || false}
                  onChange={(e) => setFormData({ ...formData, isComplete: e.target.checked })}
                />
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  {formData.isComplete ? 'Complete' : 'Incomplete'}
                </span>
              </label>
              <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                Auto-set to complete when task prompt is saved
              </div>
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  marginBottom: '6px',
                }}
              >
                Phase
              </label>
              <div
                style={{
                  display: 'inline-block',
                  padding: '6px 12px',
                  background: 'var(--bg-elevated)',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '13px',
                  color: 'var(--text-primary)',
                }}
              >
                {task.taskGroupIndex}. {task.taskGroup}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '6px' }}>
                Phase assignment is fixed by day number
              </div>
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  marginBottom: '6px',
                }}
              >
                Day Number
              </label>
              <div
                style={{
                  fontSize: '14px',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--text-primary)',
                }}
              >
                {task.dayNumber}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '6px' }}>
                Day number is fixed and cannot be changed
              </div>
            </div>
          </>
        )}

        {activeTab === 'schedule' && (
          <>
            <div
              style={{
                background: 'rgba(0, 151, 178, 0.08)',
                border: '1px solid var(--accent)',
                borderRadius: '10px',
                padding: '12px',
                fontSize: '13px',
                color: 'var(--text-secondary)',
              }}
            >
              Task dates are derived from the Program Start Date.
              <br />
              <strong>Day {task.dayNumber} is scheduled for {computeScheduledDate(task.dayNumber)}.</strong>
              <br />
              To change this task's date, update the Program Start Date in Program Settings.
              <br />
              <button
                onClick={() => {
                  onClose();
                  onOpenProgramSettings();
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--accent)',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 600,
                  marginTop: '8px',
                  padding: 0,
                }}
              >
                Open Program Settings →
              </button>
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  marginBottom: '6px',
                }}
              >
                Scheduled Date
              </label>
              <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
                {computeScheduledDate(task.dayNumber)}
              </div>
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  marginBottom: '6px',
                }}
              >
                Day of Week
              </label>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                {task.weekday || new Date(computeScheduledDate(task.dayNumber)).toLocaleDateString('en-US', { weekday: 'long' })}
              </div>
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  marginBottom: '6px',
                }}
              >
                Program Timeline
              </label>
              <div
                style={{
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                }}
              >
                <table style={{ width: '100%', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
                  <tbody>
                    <tr style={{ background: 'var(--bg-surface)' }}>
                      <td style={{ padding: '6px 10px', color: 'var(--text-tertiary)' }}>Program Start</td>
                      <td style={{ padding: '6px 10px', color: 'var(--text-secondary)' }}>
                        {new Date(programStartDate).toLocaleDateString('en-US', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </td>
                    </tr>
                    <tr style={{ background: 'var(--bg-elevated)' }}>
                      <td style={{ padding: '6px 10px', color: 'var(--text-tertiary)' }}>
                        This Task (Day {task.dayNumber})
                      </td>
                      <td style={{ padding: '6px 10px', color: 'var(--accent)', fontWeight: 600 }}>
                        {computeScheduledDate(task.dayNumber)}
                      </td>
                    </tr>
                    <tr style={{ background: 'var(--bg-surface)' }}>
                      <td style={{ padding: '6px 10px', color: 'var(--text-tertiary)' }}>Program End (Day 99)</td>
                      <td style={{ padding: '6px 10px', color: 'var(--text-secondary)' }}>
                        {computeEndDate()}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: '24px',
          paddingTop: '16px',
          borderTop: '1px solid var(--border)',
        }}
      >
        <div>
          {isIncomplete && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--warning)' }}>
              <div
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: 'var(--warning)',
                }}
              />
              Task has missing required content
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-primary" onClick={handleSave} disabled={!canSave() || saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </GlassModal>
  );
};

// Main Tasks Page
const TasksPage: React.FC = () => {
  const [phases, setPhases] = useState<Phase[]>([]);
  const [selectedPhase, setSelectedPhase] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showProgramSettings, setShowProgramSettings] = useState(false);
  const [programSettings, setProgramSettings] = useState<ProgramSettings | null>(null);
  const [selectedTaskForEdit, setSelectedTaskForEdit] = useState<Task | null>(null);

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [phasesData, settingsData] = await Promise.all([
        getTaskPhases(),
        getProgramSettings(),
      ]);
      setPhases(phasesData);
      setProgramSettings(settingsData);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load task data');
    } finally {
      setLoading(false);
    }
  };

  const handleEditTask = async (dayNumber: number) => {
    try {
      const fullTask = await getTaskByDayNumber(dayNumber);
      setSelectedTaskForEdit(fullTask);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load task data');
    }
  };

  const handleTaskSaved = async (dayNumber: number, updates: Partial<Task>) => {
    try {
      await updateTask(dayNumber, updates);
      toast.success(`✓ Day ${dayNumber} updated`);
      await loadData();
      setSelectedTaskForEdit(null);
    } catch (error) {
      console.error(error);
      toast.error('Failed to save — try again');
    }
  };

  const handleSettingsSaved = async (settings: Partial<ProgramSettings>) => {
    try {
      const updated = await updateProgramSettings(settings);
      setProgramSettings(updated);
      toast.success('Program settings saved. All task dates have been updated.');
      await loadData();
    } catch (error) {
      console.error(error);
      toast.error('Failed to save settings');
    }
  };

  const handleExportCSV = () => {
    const allTasks = phases.flatMap((p) =>
      p.tasks.map((t) => ({
        day: t.dayNumber,
        phase: p.phaseName,
        taskName: t.taskName,
        status: t.isComplete ? 'completed' : (t.isPublished ? 'published' : 'draft'),
      }))
    );

    const csv = [
      ['Day', 'Phase', 'Task Name', 'Status'].join(','),
      ...allTasks.map((t) => [t.day, `"${t.phase}"`, `"${t.taskName}"`, t.status].join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sba-tasks-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const currentPhase = phases[selectedPhase];
  const completeCount = phases.reduce((sum, p) => sum + p.completedTasks, 0);
  const incompleteCount = 99 - completeCount;

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-page)', padding: '32px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', textAlign: 'center', paddingTop: '100px' }}>
          <div style={{ fontSize: '16px', color: 'var(--text-secondary)' }}>Loading tasks...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)', padding: '32px' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Page Header */}
        <div className="page-header">
          <div>
            <h1 className="page-title">Task Management</h1>
            <p className="page-subtitle">SBA Incubator Program · 11 phases · 99 tasks</p>
          </div>
          <div className="page-actions">
            <button className="btn-secondary" onClick={() => setShowProgramSettings(true)}>
              <Settings size={18} />
              Program Settings
            </button>
            <button className="btn-secondary" onClick={handleExportCSV}>
              <Download size={18} />
              Export CSV
            </button>
          </div>
        </div>

        {/* Stats Bar */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '12px',
            marginBottom: '24px',
          }}
        >
          <StatCard label="Total Tasks" value="99" />
          <StatCard label="Complete" value={completeCount} color="success" />
          <StatCard label="Incomplete" value={incompleteCount} color="warning" />
          <StatCard
            label="Program Start"
            value={
              programSettings
                ? new Date(programSettings.startDate).toLocaleDateString('en-US', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })
                : '--'
            }
            action={{ label: 'Edit', onClick: () => setShowProgramSettings(true) }}
          />
        </div>

        {/* Phase Tabs */}
        <div
          style={{
            overflowX: 'auto',
            scrollbarWidth: 'none',
            marginBottom: '20px',
          }}
        >
          <div style={{ display: 'flex', gap: '8px', padding: '0 2px', width: 'max-content' }}>
            {phases.map((phase, i) => {
              const isActive = selectedPhase === i;
              const completionColor =
                phase.completedTasks === 9
                  ? 'var(--success)'
                  : phase.completedTasks > 0
                  ? 'var(--teal)'
                  : 'var(--warning)';

              return (
                <button
                  key={i}
                  onClick={() => setSelectedPhase(i)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 'var(--radius-full)',
                    border: isActive ? 'none' : '1px solid var(--border)',
                    background: isActive ? 'var(--teal)' : 'var(--bg-elevated)',
                    color: isActive ? 'white' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '3px',
                    transition: 'all 150ms',
                    minWidth: '80px',
                  }}
                >
                  <span style={{ fontSize: '13px', fontWeight: 600 }}>{SHORT_LABELS[i]}</span>
                  <span
                    style={{
                      fontSize: '10px',
                      fontFamily: 'var(--font-mono)',
                      color: isActive ? 'rgba(255,255,255,0.75)' : completionColor,
                    }}
                  >
                    {phase.completedTasks}/9
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Phase Detail */}
        {currentPhase && (
          <div>
            {/* Phase Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '20px',
              }}
            >
              <div>
                <div style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {currentPhase.phaseName}
                </div>
                <div
                  style={{
                    fontSize: '12px',
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--text-tertiary)',
                    marginTop: '4px',
                  }}
                >
                  Phase {currentPhase.phaseNumber} · Days {currentPhase.days} · 9 tasks
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  {currentPhase.completedTasks} of 9 tasks have full content
                </div>
                <div
                  style={{
                    width: '180px',
                    height: '6px',
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--bg-elevated)',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${(currentPhase.completedTasks / 9) * 100}%`,
                      height: '100%',
                      background:
                        currentPhase.completedTasks === 9
                          ? 'var(--success)'
                          : currentPhase.completedTasks > 0
                          ? 'var(--teal)'
                          : 'var(--warning-dim)',
                      borderRadius: 'var(--radius-full)',
                      transition: 'width 300ms',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Task Table */}
            <div
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
              }}
            >
              {/* Table Header */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '60px 1fr 140px 200px 90px 80px',
                  padding: '10px 16px',
                  background: 'var(--bg-elevated)',
                  borderBottom: '1px solid var(--border)',
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: 'var(--text-tertiary)',
                }}
              >
                <div>Day</div>
                <div>Task Name</div>
                <div>Content Status</div>
                <div>Progress Signal</div>
                <div>Status</div>
                <div>Actions</div>
              </div>

              {/* Task Rows */}
              {currentPhase.tasks.map((task, i) => {
                // Check isComplete field, not status
                const isComplete = task.isComplete;
                const isLastRow = i === currentPhase.tasks.length - 1;

                return (
                  <div
                    key={task.dayNumber}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '60px 1fr 140px 200px 90px 80px',
                      padding: '14px 16px',
                      borderBottom: !isLastRow ? '1px solid var(--border)' : 'none',
                      borderLeft: !isComplete ? '2px solid var(--warning)' : 'none',
                      background: !isComplete ? 'var(--warning-dim)' : 'var(--bg-surface)',
                      transition: 'background 120ms',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--teal-dim)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = !isComplete
                        ? 'var(--warning-dim)'
                        : 'var(--bg-surface)';
                    }}
                  >
                    <div style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--text-tertiary)' }}>
                      Day {task.dayNumber}
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: '14px',
                          fontWeight: 600,
                          color: 'var(--text-primary)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {task.taskName}
                      </div>
                      <div
                        style={{
                          fontSize: '11px',
                          color: 'var(--text-tertiary)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {currentPhase.phaseName}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {isComplete ? (
                        <>
                          <CheckCircle size={16} style={{ color: 'var(--success)' }} />
                          <span style={{ fontSize: '12px', color: 'var(--success)' }}>Complete</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle size={16} style={{ color: 'var(--warning)' }} />
                          <span style={{ fontSize: '12px', color: 'var(--warning)' }}>Missing prompt</span>
                        </>
                      )}
                    </div>
                    <div
                      style={{
                        fontSize: '13px',
                        fontStyle: 'italic',
                        color: 'var(--text-secondary)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                      title={task.progressSignal || 'No progress signal'}
                    >
                      {task.progressSignal || '—'}
                    </div>
                    <div>
                      <div
                        style={{
                          display: 'inline-block',
                          padding: '3px 10px',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '11px',
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 600,
                          background: isComplete ? 'var(--teal)' : 'var(--warning)',
                          color: '#fff',
                        }}
                      >
                        {isComplete ? 'Live' : 'Incomplete'}
                      </div>
                    </div>
                    <div>
                      <button
                        className={isComplete ? 'btn-secondary' : 'btn-primary'}
                        style={{ padding: '6px 12px', fontSize: '12px' }}
                        onClick={() => handleEditTask(task.dayNumber)}
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <ProgramSettingsModal
        visible={showProgramSettings}
        onClose={() => setShowProgramSettings(false)}
        settings={programSettings}
        onSave={handleSettingsSaved}
      />

      {selectedTaskForEdit && programSettings && (
        <EditTaskModal
          visible={!!selectedTaskForEdit}
          onClose={() => setSelectedTaskForEdit(null)}
          task={selectedTaskForEdit}
          programStartDate={programSettings.startDate}
          onSave={handleTaskSaved}
          onOpenProgramSettings={() => {
            setSelectedTaskForEdit(null);
            setShowProgramSettings(true);
          }}
        />
      )}
    </div>
  );
};

export default TasksPage;
