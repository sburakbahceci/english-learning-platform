import prisma from '../../config/database';

export class LevelsService {
  async getAllLevels() {
    try {
      const levels = await prisma.level.findMany({
        orderBy: { orderIndex: 'asc' },
        select: {
          id: true,
          code: true,
          name: true,
          description: true,
          orderIndex: true,
          requiredXp: true,
          badgeIconUrl: true,
        },
      });

      return levels;
    } catch (error) {
      console.error('Error fetching levels:', error);
      throw new Error('Failed to fetch levels');
    }
  }

  async getLevelByCode(code: string) {
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
