import axios from 'axios';
import type {
  AdminLoginResponse,
  AdminUser,
  DashboardStats,
  LevelStats,
  Activity,
  UserGrowth,
  TopUser,
} from '../types/admin.types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

const adminApi = axios.create({
  baseURL: `${API_URL}/admin`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add admin token
adminApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
adminApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

export const adminApiService = {
  // ========================================
  // AUTH
  // ========================================
  async login(email: string, password: string) {
    const response = await adminApi.post<{
      success: boolean;
      data: AdminLoginResponse;
    }>('/auth/login', { email, password });
    return response.data;
  },

  async getProfile() {
    const response = await adminApi.get<{ success: boolean; data: AdminUser }>(
      '/auth/me'
    );
    return response.data;
  },

  // ========================================
  // DASHBOARD
  // ========================================
  async getDashboardStats() {
    const response = await adminApi.get<{
      success: boolean;
      data: DashboardStats;
    }>('/dashboard/stats');
    return response.data;
  },

  async getLevelStats() {
    const response = await adminApi.get<{
      success: boolean;
      data: LevelStats[];
    }>('/dashboard/levels');
    return response.data;
  },

  async getRecentActivities(limit: number = 10) {
    const response = await adminApi.get<{ success: boolean; data: Activity[] }>(
      `/dashboard/activities?limit=${limit}`
    );
    return response.data;
  },

  async getUserGrowth() {
    const response = await adminApi.get<{
      success: boolean;
      data: UserGrowth[];
    }>('/dashboard/growth');
    return response.data;
  },

  async getTopUsers(limit: number = 10) {
    const response = await adminApi.get<{ success: boolean; data: TopUser[] }>(
      `/dashboard/top-users?limit=${limit}`
    );
    return response.data;
  },
};
