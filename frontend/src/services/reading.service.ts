import api from './api';

export const readingService = {
  // Level'a göre reading passage'ları getir
  async getPassagesByLevel(levelCode: string) {
    const response = await api.get(`/reading/level/${levelCode}`);
    return response.data;
  },

  // Passage detayını getir
  async getPassageById(id: string) {
    const response = await api.get(`/reading/${id}`);
    return response.data;
  },

  // Reading'i tamamla
  async completeReading(passageId: string, score: number, timeSpent: number) {
    const response = await api.post(`/reading/${passageId}/complete`, {
      score,
      timeSpent,
    });
    return response.data;
  },

  // Kullanıcının tamamladığı reading'leri getir
  async getUserCompletions() {
    const response = await api.get('/reading/user/completions');
    return response.data;
  },
};
