import api from './api';
import type { Level } from '../types';

export const levelsService = {
  // Get all levels
  async getAllLevels(): Promise<{
    success: boolean;
    data: Level[];
    count: number;
  }> {
    const response = await api.get<{
      success: boolean;
      data: Level[];
      count: number;
    }>('/levels');
    return response.data;
  },

  // Get level by code
  async getLevelByCode(
    code: string
  ): Promise<{ success: boolean; data: Level }> {
    const response = await api.get<{ success: boolean; data: Level }>(
      `/levels/${code}`
    );
    return response.data;
  },
};
