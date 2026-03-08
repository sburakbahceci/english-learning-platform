import api from './api';

export const podcastsService = {
  // Level'a göre podcast'leri getir
  async getPodcastsByLevel(levelCode: string) {
    const response = await api.get(`/podcasts/level/${levelCode}`);
    return response.data;
  },

  // Podcast detayını getir
  async getPodcastById(id: string) {
    const response = await api.get(`/podcasts/${id}`);
    return response.data;
  },

  // Podcast'i tamamla
  async completePodcast(podcastId: string, score: number, timeSpent: number) {
    const response = await api.post(`/podcasts/${podcastId}/complete`, {
      score,
      timeSpent,
    });
    return response.data;
  },

  // Kullanıcının tamamladığı podcast'leri getir
  async getUserCompletions() {
    const response = await api.get('/podcasts/user/completions');
    return response.data;
  },
};
