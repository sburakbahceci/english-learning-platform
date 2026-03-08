import api from './api';

export interface PlacementTestQuestion {
  id: string;
  questionText: string;
  options: string[];
  levelCode: string;
  difficulty: number;
}

export interface PlacementTestResult {
  determinedLevel: string;
  correctAnswers: number;
  totalQuestions: number;
  percentage: number;
}

export const placementTestService = {
  // Test yapılmış mı kontrol et
  async getStatus() {
    const response = await api.get('/placement-test/status');
    return response.data;
  },

  // Test başlat
  async startTest() {
    const response = await api.post('/placement-test/start');
    return response.data;
  },

  // Cevap gönder
  async submitAnswer(questionId: string, userAnswer: string) {
    const response = await api.post('/placement-test/answer', {
      questionId,
      userAnswer,
    });
    return response.data;
  },

  // Test'i tamamla
  async completeTest() {
    const response = await api.post('/placement-test/complete');
    return response.data;
  },

  // Sonuçları getir
  async getResults() {
    const response = await api.get('/placement-test/results');
    return response.data;
  },
};
