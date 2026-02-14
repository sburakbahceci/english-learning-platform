import api from './api';
import type { User } from '../types';
import type { UserProgress, Achievement } from '../types';

interface UserProfileResponse {
  success: boolean;
  data: User & {
    progress: UserProgress[];
    achievements: Achievement[];
  };
}

export const userService = {
  // Get current user profile
  async getProfile(): Promise<UserProfileResponse> {
    const response = await api.get<UserProfileResponse>('/users/me');
    return response.data;
  },

  // Update profile
  async updateProfile(data: {
    name: string;
  }): Promise<{ success: boolean; data: User }> {
    const response = await api.patch<{ success: boolean; data: User }>(
      '/users/me',
      data
    );
    return response.data;
  },
};
