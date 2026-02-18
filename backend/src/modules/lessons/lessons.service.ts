import prisma from '../../config/database';

export class LessonsService {
  // Get lessons for a specific level
  async getLessonsByLevel(levelId: string) {
    try {
      const lessons = await prisma.lesson.findMany({
        where: { levelId },
        orderBy: { orderIndex: 'asc' },
        select: {
          id: true,
          title: true,
          description: true,
          type: true,
          orderIndex: true,
          xpReward: true,
          estimatedMinutes: true,
        },
      });

      return lessons;
    } catch (error) {
      console.error('Error fetching lessons:', error);
      throw new Error('Failed to fetch lessons');
    }
  }

  // Get single lesson by ID
  async getLessonById(lessonId: string) {
    try {
      const lesson = await prisma.lesson.findUnique({
        where: { id: lessonId },
        include: {
          level: {
            select: {
              code: true,
              name: true,
            },
          },
        },
      });

      if (!lesson) {
        throw new Error('Lesson not found');
      }

      return lesson;
    } catch (error) {
      throw error;
    }
  }

  // Complete a lesson
  async completeLesson(
    userId: string,
    lessonId: string,
    data: { score?: number; timeSpentSeconds?: number }
  ) {
    try {
      console.log('🔄 Processing lesson completion:', {
        userId,
        lessonId,
        data,
      });

      // Lesson var mı kontrol et
      const lesson = await prisma.lesson.findUnique({
        where: { id: lessonId },
        include: { level: true },
      });

      if (!lesson || !lesson.levelId) {
        throw new Error('Lesson not found');
      }

      console.log('✅ Lesson found:', lesson.title);

      // Daha önce tamamlanmış mı kontrol et
      const existingCompletion = await prisma.lessonCompletion.findUnique({
        where: {
          userId_lessonId: {
            userId,
            lessonId,
          },
        },
      });

      if (existingCompletion) {
        console.log('⚠️ Lesson already completed, returning existing data...');
        return {
          lessonCompletion: existingCompletion,
          xpEarned: 0, // ← XP verilmez
          message: 'Lesson already completed',
          alreadyCompleted: true, // ← Frontend için flag
        };
      }

      // Yeni completion oluştur
      const lessonCompletion = await prisma.lessonCompletion.create({
        data: {
          userId,
          lessonId,
          score: data.score ?? null,
          timeSpentSeconds: data.timeSpentSeconds ?? null,
        },
      });

      console.log('✅ Completion created:', lessonCompletion.id);

      // XP ekle
      await prisma.user.update({
        where: { id: userId },
        data: {
          totalXp: {
            increment: lesson.xpReward ?? 0,
          },
        },
      });

      console.log('✅ XP updated:', lesson.xpReward);

      // User progress güncelle
      const userProgress = await prisma.userProgress.findUnique({
        where: {
          userId_levelId: {
            userId,
            levelId: lesson.levelId,
          },
        },
      });

      if (userProgress) {
        const totalLessons = await prisma.lesson.count({
          where: { levelId: lesson.levelId },
        });

        const completedCount = await prisma.lessonCompletion.count({
          where: {
            userId,
            lesson: { levelId: lesson.levelId },
          },
        });

        const allCompleted = completedCount >= totalLessons;

        await prisma.userProgress.update({
          where: { id: userProgress.id },
          data: {
            lessonsCompleted: completedCount,
            isExamUnlocked: allCompleted,
          },
        });

        console.log('✅ Progress updated:', {
          completed: completedCount,
          total: totalLessons,
          examUnlocked: allCompleted,
        });
      }

      return {
        lessonCompletion,
        xpEarned: lesson.xpReward ?? 0,
        message: 'Lesson completed successfully',
        alreadyCompleted: false,
      };
    } catch (error) {
      console.error('❌ Service error:', error);
      throw error;
    }
  }

  // Get user's lesson completions for a level
  async getUserLessonCompletions(userId: string, levelId: string) {
    try {
      const completions = await prisma.lessonCompletion.findMany({
        where: {
          userId,
          lesson: {
            levelId,
          },
        },
        select: {
          lessonId: true,
          score: true,
          xpEarned: true,
          completedAt: true,
        },
      });

      return completions;
    } catch (error) {
      throw new Error('Failed to fetch lesson completions');
    }
  }
}
