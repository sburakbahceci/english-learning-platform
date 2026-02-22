import prisma from '../../config/database';

export class PodcastsService {
  async getLevelPodcast(levelId: string) {
    const level = await prisma.level.findUnique({
      where: { id: levelId },
      select: {
        id: true,
        code: true,
        name: true,
        podcastYoutubeId: true,
        podcastTitle: true,
        podcastDescription: true,
        podcastDurationMinutes: true,
      },
    });

    if (!level || !level.podcastYoutubeId) {
      throw new Error('Podcast not found for this level');
    }

    // Vocabulary al
    const vocabularies = await prisma.podcastVocabulary.findMany({
      where: { levelId },
      orderBy: { orderIndex: 'asc' },
    });

    // Exercises al
    const exercises = await prisma.podcastExercise.findMany({
      where: { levelId },
      orderBy: { orderIndex: 'asc' },
    });

    return {
      level,
      vocabularies,
      exercises,
    };
  }

  async completePodcastExercises(
    userId: string,
    levelId: string,
    data: { score: number; totalQuestions: number }
  ) {
    // Mevcut completion var mı kontrol et
    const existing = await prisma.podcastCompletion.findUnique({
      where: {
        userId_levelId: {
          userId,
          levelId,
        },
      },
    });

    if (existing) {
      // Update existing
      return await prisma.podcastCompletion.update({
        where: { id: existing.id },
        data: {
          score: data.score,
          totalQuestions: data.totalQuestions,
          completedAt: new Date(),
        },
      });
    } else {
      // Create new
      return await prisma.podcastCompletion.create({
        data: {
          userId,
          levelId,
          score: data.score,
          totalQuestions: data.totalQuestions,
        },
      });
    }
  }

  async getUserPodcastCompletion(userId: string, levelId: string) {
    return await prisma.podcastCompletion.findUnique({
      where: {
        userId_levelId: {
          userId,
          levelId,
        },
      },
    });
  }
}
