import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

// Get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('adminToken');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

// Phase type - matches backend response
export interface Phase {
  phaseNumber: number;
  phaseName: string;
  days: string;
  totalTasks: number;
  completedTasks: number;
  percentage: number;
  tasks: Task[];
}

export interface Task {
  id: string;
  dayNumber: number;
  taskGroup: string;
  taskGroupIndex: number;
  dayWithinGroup: number;
  weekday: string;
  taskName: string;
  whyItMatters: string;
  task: string;           // main prompt
  goDeeper: string | null;
  progressSignal: string;
  isPublished: boolean;
  isComplete: boolean;
  scheduledDate?: string;
}

export interface ProgramSettings {
  startDate: string;
  programName: string;
  programSubtitle: string;
  organizationName: string;
  organizationNameAr: string;
  websiteUrl: string;
  zoomLink: string;
  zoomDay: string;
  zoomTime: string;
  zoomTimezone: string;
}

// Get all 11 phases with their tasks
export const getTaskPhases = async (): Promise<Phase[]> => {
  const response = await axios.get(`${API_BASE_URL}/api/tasks/phases`, {
    headers: getAuthHeaders(),
  });
  return response.data.data;
};

// Get a single task by day number (for editing)
export const getTaskByDayNumber = async (dayNumber: number): Promise<Task> => {
  const response = await axios.get(
    `${API_BASE_URL}/api/admin/tasks/${dayNumber}`,
    { headers: getAuthHeaders() }
  );
  return response.data;
};

// Update a single task by day number — any subset of fields
export const updateTask = async (
  dayNumber: number,
  updates: Partial<Task>
): Promise<Task> => {
  const response = await axios.put(
    `${API_BASE_URL}/api/admin/tasks/${dayNumber}`,
    updates,
    { headers: getAuthHeaders() }
  );
  return response.data.task;
};

// Get program-wide settings
export const getProgramSettings = async (): Promise<ProgramSettings> => {
  const response = await axios.get(`${API_BASE_URL}/api/admin/tasks/program/settings`, {
    headers: getAuthHeaders(),
  });
  return response.data.data;
};

// Update program-wide settings (affects all task scheduled dates)
export const updateProgramSettings = async (
  settings: Partial<ProgramSettings>
): Promise<ProgramSettings> => {
  const response = await axios.put(
    `${API_BASE_URL}/api/admin/tasks/program/settings`,
    settings,
    { headers: getAuthHeaders() }
  );
  return response.data.data;
};
