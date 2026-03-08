import api from './api';

export const writingService = {
  // Level'a göre writing prompt'ları getir
  async getPromptsByLevel(levelCode: string) {
    const response = await api.get(`/writing/level/${levelCode}`);
    return response.data;
  },

  // Prompt detayını getir
  async getPromptById(id: string) {
    const response = await api.get(`/writing/prompt/${id}`);
    return response.data;
  },

  // Writing'i submit et
  async submitWriting(promptId: string, content: string) {
    const response = await api.post('/writing/submit', {
      promptId,
      content,
    });
    return response.data;
  },

  // Kullanıcının submission'larını getir
  async getUserSubmissions() {
    const response = await api.get('/writing/user/submissions');
    return response.data;
  },

  // Submission detayını getir
  async getSubmissionById(id: string) {
    const response = await api.get(`/writing/submission/${id}`);
    return response.data;
  },

  // Exercise'ları getir
  async getExercisesByLevel(levelCode: string) {
    const response = await api.get(`/writing/exercises/level/${levelCode}`);
    return response.data;
  },

  // Cevabı kontrol et
  async checkExerciseAnswer(exerciseId: string, userAnswer: string) {
    const response = await api.post('/writing/exercises/check', {
      exerciseId,
      userAnswer,
    });
    return response.data;
  },

  // Progress'i getir
  async getUserExerciseProgress(levelCode: string) {
    const response = await api.get(`/writing/exercises/progress/${levelCode}`);
    return response.data;
  },
};
