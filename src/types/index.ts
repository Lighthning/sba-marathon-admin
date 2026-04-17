export interface DashboardStats {
  totalUsers: number;
  totalUsersChange: number;
  activeUsers: number;
  activeUsersTrend: 'up' | 'down' | 'stable';
  completionRate: number;
  completionRateChange: number;
  avgStreak: number;
  streakDistribution: number[];
}

export interface UserGrowthData {
  date: string;
  users: number;
}

export interface TaskCompletionData {
  day: number;
  completions: number;
}

export interface EngagementHeatmapData {
  day: number;
  hour: number;
  value: number;
}

export interface AdminAction {
  id: string;
  adminName: string;
  adminAvatar?: string;
  action: string;
  timestamp: string;
  details?: string;
}

export interface DashboardData {
  stats: DashboardStats;
  userGrowth: UserGrowthData[];
  taskCompletion: TaskCompletionData[];
  engagementHeatmap: EngagementHeatmapData[];
  recentActivity: AdminAction[];
}

// Notification Types
export type NotificationPriority = 'low' | 'normal' | 'high';
export type NotificationTarget = 'all' | 'active' | 'inactive' | 'specific';
export type NotificationStatus = 'scheduled' | 'sent' | 'cancelled' | 'failed';
export type ScheduleType = 'now' | 'scheduled';

export interface NotificationTemplate {
  id: string;
  name: string;
  title: string;
  body: string;
  priority: NotificationPriority;
  dataPayload?: Record<string, any>;
}

export interface NotificationComposer {
  title: string;
  body: string;
  target: NotificationTarget;
  specificUserIds?: string[];
  priority: NotificationPriority;
  dataPayload?: Record<string, any>;
  scheduleType: ScheduleType;
  scheduledTime?: Date;
}

export interface ScheduledNotification {
  id: string;
  title: string;
  body: string;
  target: NotificationTarget;
  targetCount: number;
  scheduledTime: Date;
  status: NotificationStatus;
  priority: NotificationPriority;
  createdBy: string;
  createdAt: Date;
}

export interface NotificationHistory {
  id: string;
  title: string;
  body: string;
  target: NotificationTarget;
  targetCount: number;
  sentTime: Date;
  delivered: number;
  opened: number;
  ctr: number; // Click-through rate
  priority: NotificationPriority;
  sentBy: string;
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: 'ADMIN' | 'USER';
  status: 'active' | 'suspended' | 'deleted';
  country?: string;
  lastActivityAt: string | null;
  createdAt: string;
  professionalBg?: string;
  currentStage?: string;
  suspensionReason?: string;
  stats: {
    completedTasks: number;
    currentStreak: number;
    totalDays: number;
  };
  currentDay: number;
  completedTasks: number;
  streak: number;
}

export interface NotificationPreview {
  platform: 'ios' | 'android';
  title: string;
  body: string;
  priority: NotificationPriority;
}

// User Management Types
export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  averageCompletionRate: number;
}

export interface UsersFilter {
  search: string;
  role: 'all' | 'ADMIN' | 'USER';
  status: 'all' | 'active' | 'suspended';
  sortBy: 'name' | 'email' | 'streak' | 'completedTasks' | 'lastActivity';
  sortOrder: 'asc' | 'desc';
}

export interface UpdateUserPayload {
  fullName?: string;
  email?: string;
  role?: 'ADMIN' | 'USER';
}

export interface SuspendUserPayload {
  reason: string;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// Task Management Types
export interface Task {
  id: string;
  dayNumber: number;
  taskTitle: string;
  taskCategory: string;
  whyThisMatters: string;
  mainAction: string;
  optionalDeeper: string;
  description: string | null;
  difficulty: string;
  estimatedMinutes: number | null;
  resources: any[];
  tags: string[];
  isPublished: boolean;
  isDeleted: boolean;
  reportPrompt1: string;
  reportPrompt2: string;
  reportPrompt3: string;
  attachmentEnabled: boolean;
  openDatetime: string;
  createdAt: string;
  updatedAt: string;
  completionCount?: number;
  status?: 'active' | 'inactive' | 'draft';
}

export interface SupportMaterial {
  id: string;
  type: 'pdf' | 'link' | 'video' | 'document';
  title: string;
  url: string;
  description?: string;
}

export interface TaskStats {
  total: number;
  published: number;
  draft: number;
  deleted: number;
  byCategory: { category: string; count: number }[];
  byDifficulty: { difficulty: string; count: number }[];
}

export interface TaskFilter {
  search: string;
  category: string;
  difficulty: string;
  isPublished?: boolean;
  includeDeleted: boolean;
}

export interface CreateTaskPayload {
  dayNumber: number;
  title: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedMinutes: number;
  isPublished?: boolean;
  videoUrl?: string;
  supportMaterials?: SupportMaterial[];
}

// Alias for backwards compatibility
export type TaskFormData = CreateTaskPayload;

export interface UpdateTaskPayload {
  title?: string;
  description?: string;
  category?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  estimatedMinutes?: number;
  isPublished?: boolean;
  videoUrl?: string;
  supportMaterials?: SupportMaterial[];
}

export interface BulkImportResult {
  success: number;
  failed: number;
  errors: string[];
}

// Analytics Types
export type TimeRange = '7d' | '30d' | '90d' | 'all';

export interface OverviewMetrics {
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  totalSubmissions: number;
  completionRate: number;
  avgTasksPerUser: number;
  topPerformingTasks: TaskPerformance[];
  strugglingTasks: TaskPerformance[];
  geographicDistribution: GeographicData[];
}

export interface TaskPerformance {
  dayNumber: number;
  taskTitle: string;
  completionCount: number;
  completionRate: number;
}

export interface GeographicData {
  country: string;
  userCount: number;
  percentage: number;
}

export interface UserMetrics {
  signupsOverTime: SignupData[];
  retentionCohorts: RetentionCohort[];
  streakDistribution: StreakData[];
  completionRateByDay: CompletionRateData[];
}

export interface SignupData {
  date: string;
  count: number;
}

export interface RetentionCohort {
  cohortMonth: string;
  month0: number;
  month1: number;
  month2: number;
  month3: number;
}

export interface StreakData {
  streakRange: string;
  count: number;
}

export interface CompletionRateData {
  dayNumber: number;
  completionRate: number;
}

export interface TaskMetrics {
  taskCompletionRates: TaskCompletionRate[];
  skipRates: SkipRate[];
  categoryStats: CategoryStat[];
}

export interface TaskCompletionRate {
  dayNumber: number;
  taskTitle: string;
  completionCount: number;
  completionRate: number;
}

export interface SkipRate {
  dayNumber: number;
  taskTitle: string;
  skipRate: number;
}

export interface CategoryStat {
  category: string;
  taskCount: number;
  avgCompletionRate: number;
}

export interface EngagementMetrics {
  dailyActiveUsers: ActiveUserData[];
  weeklyActiveUsers: ActiveUserData[];
  monthlyActiveUsers: ActiveUserData[];
  retentionRate: number;
  churnRate: number;
}

export interface ActiveUserData {
  date?: string;
  weekStart?: string;
  month?: string;
  count: number;
}

export interface TrendMetrics {
  userGrowthTrend: UserGrowthTrend[];
  engagementTrend: EngagementTrendData[];
  churnRate: number;
  projectedUsers: ProjectedUserData[];
}

export interface UserGrowthTrend {
  date: string;
  newUsers: number;
  totalUsers: number;
  growthRate: number;
}

export interface EngagementTrendData {
  date: string;
  avgSubmissionsPerUser: number;
  avgStreak: number;
}

export interface ProjectedUserData {
  date: string;
  projected: number;
}
