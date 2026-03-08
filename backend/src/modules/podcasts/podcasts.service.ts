import prisma from '../../config/database';

export class PodcastsService {
  // Level'a göre podcast'leri getir
  async getPodcastsByLevel(levelCode: string) {
    try {
      // Level'ı bul
      const level = await prisma.level.findUnique({
        where: { code: levelCode },
      });

      if (!level) {
        throw new Error('Level not found');
      }

      // O level'ın podcast'lerini getir
      const podcasts = await prisma.podcast.findMany({
        where: { levelId: level.id },
        orderBy: { episodeNumber: 'asc' },
        include: {
          vocabularies: {
            orderBy: { createdAt: 'asc' },
          },
          exercises: {
            orderBy: { questionOrder: 'asc' },
          },
        },
      });

      return podcasts;
    } catch (error) {
      console.error('Get podcasts by level error:', error);
      throw error;
    }
  }

  // Podcast ID'ye göre detay getir
  async getPodcastById(podcastId: string) {
    try {
      const podcast = await prisma.podcast.findUnique({
        where: { id: podcastId },
        include: {
          vocabularies: {
            orderBy: { createdAt: 'asc' },
          },
          exercises: {
            orderBy: { questionOrder: 'asc' },
          },
          level: {
            select: {
              code: true,
              name: true,
            },
          },
        },
      });

      if (!podcast) {
        throw new Error('Podcast not found');
      }

      return podcast;
    } catch (error) {
      console.error('Get podcast by id error:', error);
      throw error;
    }
  }

  // Podcast'i tamamla
  async completePodcast(
    userId: string,
    podcastId: string,
    score: number,
    timeSpent: number
  ) {
    try {
      // Daha önce tamamlanmış mı kontrol et
      const existing = await prisma.podcastCompletion.findUnique({
        where: {
          userId_podcastId: {
            userId,
            podcastId,
          },
        },
      });

      if (existing) {
        // Varsa güncelle
        return await prisma.podcastCompletion.update({
          where: { id: existing.id },
          data: {
            score,
            timeSpent,
            completedAt: new Date(),
          },
        });
      }

      // Yoksa yeni kayıt
      return await prisma.podcastCompletion.create({
        data: {
          userId,
          podcastId,
          score,
          timeSpent,
        },
      });
    } catch (error) {
      console.error('Complete podcast error:', error);
      throw error;
    }
  }

  // Kullanıcının podcast completion'larını getir
  async getUserPodcastCompletions(userId: string) {
    try {
      return await prisma.podcastCompletion.findMany({
        where: { userId },
        include: {
          podcast: {
            select: {
              id: true,
              title: true,
              levelId: true,
            },
          },
        },
        orderBy: { completedAt: 'desc' },
      });
    } catch (error) {
      console.error('Get user podcast completions error:', error);
      throw error;
    }
  }
}
