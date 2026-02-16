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
    data: {
      score?: number;
      timeSpentSeconds?: number;
    }
  ) {
    try {
      // Get lesson info
      const lesson = await prisma.lesson.findUnique({
        where: { id: lessonId },
        select: {
          id: true,
          levelId: true,
          xpReward: true,
        },
      });

      if (!lesson || !lesson.levelId) {
        throw new Error('Lesson not found');
      }

      // Check if already completed
      const existing = await prisma.lessonCompletion.findUnique({
        where: {
          userId_lessonId: {
            userId,
            lessonId,
          },
        },
      });

      if (existing) {
        throw new Error('Lesson already completed');
      }

      // Create completion record
      const completion = await prisma.lessonCompletion.create({
        data: {
          userId,
          lessonId,
          score: data.score ?? null, // ← DEĞİŞTİ
          xpEarned: lesson.xpReward ?? 0, // ← DEĞİŞTİ
          timeSpentSeconds: data.timeSpentSeconds ?? null, // ← DEĞİŞTİ
        },
      });

      // Update user's total XP
      const xpToAdd = lesson.xpReward ?? 0; // ← YENİ

      await prisma.user.update({
        where: { id: userId },
        data: {
          totalXp: {
            increment: xpToAdd, // ← DEĞİŞTİ
          },
        },
      });

      // Update user progress
      const userProgress = await prisma.userProgress.findUnique({
        where: {
          userId_levelId: {
            userId,
            levelId: lesson.levelId,
          },
        },
      });

      if (userProgress) {
        // Null check ve default değerler
        const currentCompleted = userProgress.lessonsCompleted ?? 0; // ← YENİ
        const totalLessons = userProgress.totalLessons ?? 0; // ← YENİ

        const newCompletedCount = currentCompleted + 1; // ← DEĞİŞTİ
        const allLessonsCompleted = newCompletedCount >= totalLessons; // ← DEĞİŞTİ

        await prisma.userProgress.update({
          where: { id: userProgress.id },
          data: {
            lessonsCompleted: newCompletedCount,
            isExamUnlocked: allLessonsCompleted,
            status: allLessonsCompleted ? 'completed' : 'in_progress',
          },
        });
      }

      return {
        completion,
        xpEarned: xpToAdd, // ← DEĞİŞTİ
      };
    } catch (error) {
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
