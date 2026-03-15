import { useState, useEffect } from 'react';
import { adminApiService } from '../services/admin-api.service';
import StatCard from '../components/StatCard';
import type { DashboardStats, Activity, TopUser } from '../types/admin.types';
import axios from 'axios';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [topUsers, setTopUsers] = useState<TopUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      console.log('📊 Fetching dashboard data...'); // Debug log

      const [statsData, activitiesData, topUsersData] = await Promise.all([
        adminApiService.getDashboardStats(),
        adminApiService.getRecentActivities(10),
        adminApiService.getTopUsers(5),
      ]);

      console.log('✅ Stats:', statsData); // Debug log
      console.log('✅ Activities:', activitiesData); // Debug log
      console.log('✅ Top Users:', topUsersData); // Debug log

      setStats(statsData.data);
      setActivities(activitiesData.data);
      setTopUsers(topUsersData.data);
    } catch (error) {
      console.error('❌ Failed to fetch dashboard data:', error); // Debug log

      if (axios.isAxiosError(error)) {
        console.error('Response:', error.response?.data);
        console.error('Status:', error.response?.status);
      }
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'lesson_completion':
        return '📚';
      case 'placement_test':
        return '🎯';
      case 'speaking':
        return '🎤';
      case 'reading':
        return '📖';
      case 'writing':
        return '✍️';
      default:
        return '📝';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const then = new Date(timestamp);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 text-lg mb-4">
          Failed to load dashboard data
        </p>
        <button
          onClick={fetchDashboardData}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }
  return (
    <div className="space-y-6 max-w-7xl">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Users"
          value={stats.users.total}
          icon="👥"
          bgColor="bg-blue-50"
          textColor="text-blue-600"
        />
        <StatCard
          title="Active Users (7d)"
          value={stats.users.active}
          icon="✨"
          bgColor="bg-green-50"
          textColor="text-green-600"
        />
        <StatCard
          title="Lessons Completed"
          value={stats.lessons.completions}
          icon="📚"
          bgColor="bg-purple-50"
          textColor="text-purple-600"
        />
        <StatCard
          title="Total XP Earned"
          value={stats.xp.total.toLocaleString()}
          icon="⭐"
          bgColor="bg-yellow-50"
          textColor="text-yellow-600"
        />
      </div>

      {/* Content Stats */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Content Overview
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-3xl mb-2">🎙️</p>
            <p className="text-2xl font-bold text-gray-900">
              {stats.content.podcasts}
            </p>
            <p className="text-sm text-gray-600">Podcasts</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-3xl mb-2">📖</p>
            <p className="text-2xl font-bold text-gray-900">
              {stats.content.readingPassages}
            </p>
            <p className="text-sm text-gray-600">Reading</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-3xl mb-2">✍️</p>
            <p className="text-2xl font-bold text-gray-900">
              {stats.content.writingPrompts}
            </p>
            <p className="text-sm text-gray-600">Writing</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-3xl mb-2">🎤</p>
            <p className="text-2xl font-bold text-gray-900">
              {stats.content.speakingTasks}
            </p>
            <p className="text-sm text-gray-600">Speaking</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              Recent Activities
            </h2>
            <span className="text-sm text-gray-500">
              {activities.length} activities
            </span>
          </div>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {activities.map((activity, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <span className="text-2xl">
                  {getActivityIcon(activity.type)}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {activity.user}
                  </p>
                  <p className="text-sm text-gray-600">{activity.action}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatTimeAgo(activity.timestamp)}
                  </p>
                </div>
                {activity.level && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
                    {activity.level}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Top Users */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Top Users by XP</h2>
            <span className="text-sm text-gray-500">🏆 Leaderboard</span>
          </div>
          <div className="space-y-3">
            {topUsers.map((user, index) => (
              <div
                key={user.id}
                className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold text-sm">
                  #{index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {user.name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-blue-600">
                    {user.total_xp} XP
                  </p>
                  <p className="text-xs text-gray-500">
                    {user.current_streak}🔥 streak
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
