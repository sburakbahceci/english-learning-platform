import api from './api';

export const speakingService = {
  // Get speaking tasks by level code
  async getTasksByLevel(levelCode: string) {
    const response = await api.get(`/speaking/level/${levelCode}`);
    return response.data;
  },

  // Get single speaking task
  async getTaskById(taskId: string) {
    const response = await api.get(`/speaking/${taskId}`);
    return response.data;
  },

  // Submit speaking attempt
  async submitAttempt(
    taskId: string,
    transcription: string,
    durationSeconds: number
  ) {
    const response = await api.post('/speaking/submit', {
      taskId,
      transcription,
      durationSeconds,
    });
    return response.data;
  },

  // Get user's attempts
  async getUserAttempts() {
    const response = await api.get('/speaking/user/attempts');
    return response.data;
  },

  // Get specific attempt
  async getAttemptById(attemptId: string) {
    const response = await api.get(`/speaking/attempt/${attemptId}`);
    return response.data;
  },

  // Get user progress for level
  async getUserProgress(levelCode: string) {
    const response = await api.get(`/speaking/progress/${levelCode}`);
    return response.data;
  },
};
