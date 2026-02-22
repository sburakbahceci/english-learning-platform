import api from './api';
import type { LevelPodcast, PodcastCompletion } from '../types';

export const podcastsService = {
  async getLevelPodcast(
    levelId: string
  ): Promise<{ success: boolean; data: LevelPodcast }> {
    const response = await api.get<{ success: boolean; data: LevelPodcast }>(
      `/podcasts/level/${levelId}`
    );
    return response.data;
  },

  async completePodcastExercises(
    levelId: string,
    data: { score: number; totalQuestions: number }
  ): Promise<{ success: boolean; data: PodcastCompletion }> {
    const response = await api.post<{
      success: boolean;
      data: PodcastCompletion;
    }>(`/podcasts/level/${levelId}/complete`, data);
    return response.data;
  },

  async getUserPodcastCompletion(
    levelId: string
  ): Promise<{ success: boolean; data: PodcastCompletion | null }> {
    const response = await api.get<{
      success: boolean;
      data: PodcastCompletion | null;
    }>(`/podcasts/level/${levelId}/completion`);
    return response.data;
  },
};
