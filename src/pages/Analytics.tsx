import React, { useState, useEffect } from 'react';
import {
  Users,
  Activity,
  TrendingUp,
  CheckCircle,
  BarChart3,
  Target,
  Calendar,
  RefreshCw,
  Download,
} from 'lucide-react';
import {
  getAnalyticsOverview,
  getUserMetrics,
  getTaskMetrics,
  getEngagementMetrics,
  getTrendMetrics,
} from '../api/analytics';
import {
  OverviewMetrics,
  UserMetrics,
  TaskMetrics,
  EngagementMetrics,
  TrendMetrics,
  TimeRange,
} from '../types';
import toast from 'react-hot-toast';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const AnalyticsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [overviewData, setOverviewData] = useState<OverviewMetrics | null>(null);
  const [userMetrics, setUserMetrics] = useState<UserMetrics | null>(null);
  const [taskMetrics, setTaskMetrics] = useState<TaskMetrics | null>(null);
  const [engagementData, setEngagementData] = useState<EngagementMetrics | null>(null);
  const [trendData, setTrendData] = useState<TrendMetrics | null>(null);

  const fetchAllData = async (showRefreshToast = false) => {
    try {
      if (showRefreshToast) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const [overview, users, tasks, engagement, trends] = await Promise.all([
        getAnalyticsOverview(timeRange),
        getUserMetrics(timeRange),
        getTaskMetrics(),
        getEngagementMetrics(timeRange),
        getTrendMetrics(timeRange),
      ]);

      setOverviewData(overview);
      setUserMetrics(users);
      setTaskMetrics(tasks);
      setEngagementData(engagement);
      setTrendData(trends);

      if (showRefreshToast) {
        toast.success('Analytics data refreshed');
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [timeRange]);

  const handleRefresh = () => {
    fetchAllData(true);
  };

  const handleExport = () => {
    toast('Export functionality coming soon', { icon: '📊' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center animate-in">
          <RefreshCw className="animate-spin mx-auto mb-4 text-blue-500" size={48} strokeWidth={2} />
          <p className="text-slate-50 font-semibold text-lg">Loading Analytics...</p>
          <div className="mt-4 w-48 h-2 bg-slate-700 rounded-full mx-auto overflow-hidden">
            <div className="h-full bg-blue-500 animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="page-header">
          <div>
            <h1 className="page-title">Analytics Dashboard</h1>
            <p className="page-subtitle">Real-time insights into your Marathon platform</p>
          </div>
          <div className="page-actions">
            <button
              onClick={handleRefresh}
              className="btn-secondary"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
              Refresh
            </button>
            <button
              onClick={handleExport}
              className="btn-primary"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Download size={16} />
              Export
            </button>
          </div>
        </div>

        {/* Time Range Selector */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '32px',
          animation: 'fadeInUp 0.3s ease-out 0.1s both',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}>
            <Calendar size={18} style={{ color: 'var(--text-tertiary)' }} />
            <span style={{
              fontSize: '13px',
              fontWeight: 500,
              color: 'var(--text-secondary)',
            }}>Time Range</span>
          </div>
          <div style={{
            display: 'inline-flex',
            gap: '4px',
            padding: '4px',
            background: 'var(--bg-elevated)',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--border)',
          }}>
            {(['7d', '30d', '90d', 'all'] as TimeRange[]).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                style={{
                  padding: '6px 16px',
                  borderRadius: 'var(--radius-full)',
                  border: 'none',
                  background: timeRange === range ? 'var(--teal)' : 'transparent',
                  color: timeRange === range ? 'white' : 'var(--text-secondary)',
                  fontSize: '12px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.12s',
                }}
              >
                {range === '7d' && '7 Days'}
                {range === '30d' && '30 Days'}
                {range === '90d' && '90 Days'}
                {range === 'all' && 'All Time'}
              </button>
            ))}
          </div>
        </div>

        {/* Overview KPIs */}
        {overviewData && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px',
            marginBottom: '40px',
          }}>
            {[
              {
                title: "Total Users",
                value: overviewData.totalUsers.toLocaleString(),
                icon: <Users size={20} strokeWidth={2} />,
                index: 0,
              },
              {
                title: "Active Users",
                value: overviewData.activeUsers.toLocaleString(),
                icon: <Activity size={20} strokeWidth={2} />,
                suffix: "(7d)",
                index: 1,
              },
              {
                title: "New Users",
                value: overviewData.newUsers.toLocaleString(),
                icon: <TrendingUp size={20} strokeWidth={2} />,
                suffix: "(30d)",
                index: 2,
              },
              {
                title: "Completion Rate",
                value: overviewData.completionRate.toFixed(1),
                suffix: "%",
                icon: <CheckCircle size={20} strokeWidth={2} />,
                index: 3,
              },
              {
                title: "Avg Tasks/User",
                value: overviewData.avgTasksPerUser.toFixed(1),
                icon: <Target size={20} strokeWidth={2} />,
                index: 4,
              },
              {
                title: "Total Submissions",
                value: overviewData.totalSubmissions.toLocaleString(),
                icon: <BarChart3 size={20} strokeWidth={2} />,
                index: 5,
              },
            ].map((stat) => (
              <div
                key={stat.title}
                className="stat-card"
                style={{
                  animation: `fadeInUp 0.3s ease-out ${stat.index * 0.05}s both`,
                }}
              >
                <div className="stat-icon" style={{ color: 'var(--teal)' }}>
                  {stat.icon}
                </div>
                <div className="stat-content">
                  <div className="stat-label">{stat.title}</div>
                  <div className="stat-value">
                    {stat.value}
                    {stat.suffix && <span className="stat-suffix">{stat.suffix}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Charts Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
          gap: '24px',
          marginBottom: '24px',
        }}>
          {/* User Signups Over Time */}
          {userMetrics && (
            <div className="chart-card">
              <div className="chart-card-header">
                <div>
                  <h3 className="chart-title">User Signups Over Time</h3>
                  <p className="chart-subtitle">Daily new user registrations</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={userMetrics.signupsOverTime}>
                  <defs>
                    <linearGradient id="tealGradient1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--teal)" stopOpacity={0.15} />
                      <stop offset="100%" stopColor="var(--teal)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: 'var(--text-tertiary)', fontSize: 11, fontFamily: 'var(--font-mono)' }}
                    axisLine={{ stroke: 'var(--border)' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: 'var(--text-tertiary)', fontSize: 11, fontFamily: 'var(--font-mono)' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border-medium)',
                      borderRadius: 'var(--radius-md)',
                      boxShadow: 'var(--shadow-lg)',
                      fontFamily: 'var(--font-body)',
                      fontSize: '13px',
                      color: 'var(--text-primary)',
                    }}
                    cursor={{ fill: 'var(--teal-dim)' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    name="Signups"
                    stroke="var(--teal)"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, fill: 'var(--teal)' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Completion Rate by Day */}
          {userMetrics && (
            <div className="chart-card">
              <div className="chart-card-header">
                <div>
                  <h3 className="chart-title">Completion Rate by Day</h3>
                  <p className="chart-subtitle">Daily completion percentage trends</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={userMetrics.completionRateByDay}>
                  <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="dayNumber"
                    tick={{ fill: 'var(--text-tertiary)', fontSize: 11, fontFamily: 'var(--font-mono)' }}
                    axisLine={{ stroke: 'var(--border)' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: 'var(--text-tertiary)', fontSize: 11, fontFamily: 'var(--font-mono)' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border-medium)',
                      borderRadius: 'var(--radius-md)',
                      boxShadow: 'var(--shadow-lg)',
                      fontFamily: 'var(--font-body)',
                      fontSize: '13px',
                      color: 'var(--text-primary)',
                    }}
                    cursor={{ fill: 'var(--teal-dim)' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="completionRate"
                    name="Completion Rate (%)"
                    stroke="var(--teal)"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, fill: 'var(--teal)' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Top & Bottom Performing Tasks */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
          gap: '24px',
          marginBottom: '24px',
        }}>
          {/* Top 5 Tasks */}
          {overviewData && overviewData.topPerformingTasks.length > 0 && (
            <div className="chart-card">
              <div className="chart-card-header">
                <div>
                  <h3 className="chart-title">Top Performing Tasks</h3>
                  <p className="chart-subtitle">Highest completion rates</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={overviewData.topPerformingTasks.slice(0, 5)}
                  layout="vertical"
                >
                  <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" horizontal={false} />
                  <XAxis
                    type="number"
                    tick={{ fill: 'var(--text-tertiary)', fontSize: 11, fontFamily: 'var(--font-mono)' }}
                    axisLine={{ stroke: 'var(--border)' }}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="taskTitle"
                    tick={{ fill: 'var(--text-secondary)', fontSize: 10, fontFamily: 'var(--font-body)' }}
                    axisLine={false}
                    tickLine={false}
                    width={150}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border-medium)',
                      borderRadius: 'var(--radius-md)',
                      boxShadow: 'var(--shadow-lg)',
                      fontFamily: 'var(--font-body)',
                      fontSize: '13px',
                      color: 'var(--text-primary)',
                    }}
                    cursor={{ fill: 'var(--teal-dim)' }}
                  />
                  <Bar
                    dataKey="completionRate"
                    name="Completion Rate (%)"
                    fill="var(--teal)"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Bottom 5 Tasks */}
          {overviewData && overviewData.strugglingTasks.length > 0 && (
            <div className="chart-card">
              <div className="chart-card-header">
                <div>
                  <h3 className="chart-title">Struggling Tasks</h3>
                  <p className="chart-subtitle">Needs improvement</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={overviewData.strugglingTasks.slice(0, 5)}
                  layout="vertical"
                >
                  <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" horizontal={false} />
                  <XAxis
                    type="number"
                    tick={{ fill: 'var(--text-tertiary)', fontSize: 11, fontFamily: 'var(--font-mono)' }}
                    axisLine={{ stroke: 'var(--border)' }}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="taskTitle"
                    tick={{ fill: 'var(--text-secondary)', fontSize: 10, fontFamily: 'var(--font-body)' }}
                    axisLine={false}
                    tickLine={false}
                    width={150}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border-medium)',
                      borderRadius: 'var(--radius-md)',
                      boxShadow: 'var(--shadow-lg)',
                      fontFamily: 'var(--font-body)',
                      fontSize: '13px',
                      color: 'var(--text-primary)',
                    }}
                    cursor={{ fill: 'var(--teal-dim)' }}
                  />
                  <Bar
                    dataKey="completionRate"
                    name="Completion Rate (%)"
                    fill="var(--orange)"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Engagement & Streak Distribution */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
          gap: '24px',
          marginBottom: '24px',
        }}>
          {/* DAU/WAU/MAU Trend */}
          {engagementData && (
            <div className="chart-card">
              <div className="chart-card-header">
                <div>
                  <h3 className="chart-title">Active Users Trend</h3>
                  <p className="chart-subtitle">Daily active user patterns</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={engagementData.dailyActiveUsers}>
                  <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: 'var(--text-tertiary)', fontSize: 11, fontFamily: 'var(--font-mono)' }}
                    axisLine={{ stroke: 'var(--border)' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: 'var(--text-tertiary)', fontSize: 11, fontFamily: 'var(--font-mono)' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border-medium)',
                      borderRadius: 'var(--radius-md)',
                      boxShadow: 'var(--shadow-lg)',
                      fontFamily: 'var(--font-body)',
                      fontSize: '13px',
                      color: 'var(--text-primary)',
                    }}
                    cursor={{ fill: 'var(--teal-dim)' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    name="Daily Active Users"
                    stroke="var(--teal)"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, fill: 'var(--teal)' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Streak Distribution */}
          {userMetrics && (
            <div className="chart-card">
              <div className="chart-card-header">
                <div>
                  <h3 className="chart-title">Streak Distribution</h3>
                  <p className="chart-subtitle">User consistency patterns</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={userMetrics.streakDistribution}>
                  <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="streakRange"
                    tick={{ fill: 'var(--text-tertiary)', fontSize: 11, fontFamily: 'var(--font-mono)' }}
                    axisLine={{ stroke: 'var(--border)' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: 'var(--text-tertiary)', fontSize: 11, fontFamily: 'var(--font-mono)' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border-medium)',
                      borderRadius: 'var(--radius-md)',
                      boxShadow: 'var(--shadow-lg)',
                      fontFamily: 'var(--font-body)',
                      fontSize: '13px',
                      color: 'var(--text-primary)',
                    }}
                    cursor={{ fill: 'var(--teal-dim)' }}
                  />
                  <Bar
                    dataKey="count"
                    name="Users"
                    fill="var(--cyan)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Geographic Distribution & Category Performance */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
          gap: '24px',
          marginBottom: '24px',
        }}>
          {/* Geographic Distribution */}
          {overviewData && overviewData.geographicDistribution.length > 0 && (
            <div className="chart-card">
              <div className="chart-card-header">
                <div>
                  <h3 className="chart-title">Geographic Distribution</h3>
                  <p className="chart-subtitle">Users by country</p>
                </div>
              </div>
              <div style={{ padding: '16px 0' }}>
                {overviewData.geographicDistribution.slice(0, 10).map((geo, index) => (
                  <div
                    key={index}
                    style={{
                      marginBottom: '16px',
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '8px',
                    }}>
                      <span style={{
                        fontSize: '13px',
                        fontWeight: 500,
                        color: 'var(--text-primary)',
                      }}>
                        {geo.country}
                      </span>
                      <span style={{
                        fontSize: '12px',
                        fontWeight: 500,
                        color: 'var(--text-secondary)',
                        fontFamily: 'var(--font-mono)',
                      }}>
                        {geo.userCount} ({geo.percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${geo.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Category Performance */}
          {taskMetrics && taskMetrics.categoryStats.length > 0 && (
            <div className="chart-card">
              <div className="chart-card-header">
                <div>
                  <h3 className="chart-title">Category Performance</h3>
                  <p className="chart-subtitle">Completion rates by category</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={taskMetrics.categoryStats}
                    dataKey="avgCompletionRate"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    label={(entry: any) => `${entry.category}: ${entry.avgCompletionRate.toFixed(1)}%`}
                    labelLine={false}
                    style={{ fontSize: 11, fontWeight: 500, fill: 'var(--text-primary)' }}
                  >
                    {taskMetrics.categoryStats.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={index === 0 ? 'var(--teal)' : index === 1 ? 'var(--cyan)' : index === 2 ? 'var(--orange)' : 'var(--text-tertiary)'}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border-medium)',
                      borderRadius: 'var(--radius-md)',
                      boxShadow: 'var(--shadow-lg)',
                      fontFamily: 'var(--font-body)',
                      fontSize: '13px',
                      color: 'var(--text-primary)',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Engagement Metrics */}
        {engagementData && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
            gap: '24px',
            marginBottom: '24px',
          }}>
            <div className="chart-card">
              <div className="chart-card-header">
                <div>
                  <h3 className="chart-title">Retention & Churn</h3>
                  <p className="chart-subtitle">User lifecycle metrics</p>
                </div>
              </div>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                padding: '16px 0',
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '24px',
                  background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.08) 0%, rgba(20, 184, 166, 0.02) 100%)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-lg)',
                }}>
                  <div>
                    <div style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      color: 'var(--text-tertiary)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      marginBottom: '8px',
                    }}>
                      Retention Rate
                    </div>
                    <div style={{
                      fontSize: '40px',
                      fontWeight: 700,
                      color: 'var(--teal)',
                      lineHeight: 1,
                      fontFamily: 'var(--font-mono)',
                    }}>
                      {engagementData.retentionRate.toFixed(1)}%
                    </div>
                  </div>
                  <CheckCircle size={48} style={{ color: 'var(--teal)', opacity: 0.4 }} strokeWidth={1.5} />
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '24px',
                  background: 'linear-gradient(135deg, rgba(251, 146, 60, 0.08) 0%, rgba(251, 146, 60, 0.02) 100%)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-lg)',
                }}>
                  <div>
                    <div style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      color: 'var(--text-tertiary)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      marginBottom: '8px',
                    }}>
                      Churn Rate
                    </div>
                    <div style={{
                      fontSize: '40px',
                      fontWeight: 700,
                      color: 'var(--orange)',
                      lineHeight: 1,
                      fontFamily: 'var(--font-mono)',
                    }}>
                      {engagementData.churnRate.toFixed(1)}%
                    </div>
                  </div>
                  <Activity size={48} style={{ color: 'var(--orange)', opacity: 0.4 }} strokeWidth={1.5} />
                </div>
              </div>
            </div>

            {/* User Growth Trend */}
            {trendData && trendData.userGrowthTrend.length > 0 && (
              <div className="chart-card">
                <div className="chart-card-header">
                  <div>
                    <h3 className="chart-title">Growth Rate Trend</h3>
                    <p className="chart-subtitle">User acquisition velocity</p>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={trendData.userGrowthTrend}>
                    <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="date"
                      tick={{ fill: 'var(--text-tertiary)', fontSize: 11, fontFamily: 'var(--font-mono)' }}
                      axisLine={{ stroke: 'var(--border)' }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: 'var(--text-tertiary)', fontSize: 11, fontFamily: 'var(--font-mono)' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        background: 'var(--bg-elevated)',
                        border: '1px solid var(--border-medium)',
                        borderRadius: 'var(--radius-md)',
                        boxShadow: 'var(--shadow-lg)',
                        fontFamily: 'var(--font-body)',
                        fontSize: '13px',
                        color: 'var(--text-primary)',
                      }}
                      cursor={{ fill: 'var(--teal-dim)' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="growthRate"
                      name="Growth Rate (%)"
                      stroke="var(--cyan)"
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 4, fill: 'var(--cyan)' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsPage;
