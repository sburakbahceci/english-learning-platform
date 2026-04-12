import prisma from '../../config/database';

export class LevelsService {
  // ✅ userId parametresi eklendi
  async getAllLevels(userId?: string) {
    console.log('🔑 getAllLevels called with userId:', userId); // ✅ Debug

    try {
      const levels = await prisma.level.findMany({
        orderBy: { order_index: 'asc' },
        select: {
          id: true,
          code: true,
          name: true,
          description: true,
          order_index: true,
          colorCode: true,
          isUnlockedByDefault: true,
          unlockOrder: true,
          userProgress: userId
            ? {
                where: { userId },
                select: {
                  id: true,
                  userId: true,
                  levelId: true,
                  totalLessons: true,
                  lessonsCompleted: true,
                  isExamUnlocked: true,
                  examsPassed: true,
                  examsFailed: true,
                },
              }
            : false,
        },
      });

      console.log('📊 Fetched levels:', levels.length);
      console.log(
        '🔍 A2 level:',
        levels.find((l) => l.code === 'A2')
      ); // ✅ Debug

      const levelsWithProgress = levels.map((level) => ({
        ...level,
        order: level.order_index,
        userProgress:
          level.userProgress && level.userProgress.length > 0
            ? level.userProgress[0]
            : undefined,
      }));

      console.log('✅ Returning levels with progress'); // ✅ Debug

      return levelsWithProgress;
    } catch (error) {
      console.error('Error fetching levels:', error);
      throw new Error('Failed to fetch levels');
    }
  }

  async getLevelByCode(code: string) {
    console.log('🔑 getLevelByCode called with code:', code); // ✅ Debug

    try {
      const level = await prisma.level.findUnique({
        where: { code: code.toUpperCase() },
      });

      if (!level) {
        throw new Error('Level not found');
      }

      return level;
    } catch (error) {
      throw error;
    }
  }
}
