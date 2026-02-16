import api from './api';
import type {
  Lesson,
  LessonDetail,
  LessonCompletion,
  CompleteLessonResult,
  ApiResponse,
} from '../types';

export const lessonsService = {
  // Get lessons for a level
  async getLessonsByLevel(levelId: string): Promise<ApiResponse<Lesson[]>> {
    const response = await api.get<ApiResponse<Lesson[]>>(
      `/lessons/level/${levelId}`
    );
    return response.data;
  },

  // Get single lesson
  async getLessonById(lessonId: string): Promise<ApiResponse<LessonDetail>> {
    const response = await api.get<ApiResponse<LessonDetail>>(
      `/lessons/${lessonId}`
    );
    return response.data;
  },

  // Complete lesson
  async completeLesson(
    lessonId: string,
    data: { score?: number; timeSpentSeconds?: number }
  ): Promise<ApiResponse<CompleteLessonResult>> {
    const response = await api.post<ApiResponse<CompleteLessonResult>>(
      `/lessons/${lessonId}/complete`,
      data
    );
    return response.data;
  },

  // Get user's completions for a level
  async getUserCompletions(
    levelId: string
  ): Promise<ApiResponse<LessonCompletion[]>> {
    const response = await api.get<ApiResponse<LessonCompletion[]>>(
      `/lessons/level/${levelId}/completions`
    );
    return response.data;
  },
};
