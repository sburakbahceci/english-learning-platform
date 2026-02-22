import prisma from '../../config/database';

export class UsersService {
  async getUserProfile(userId: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          avatarUrl: true,
          totalXp: true,
          currentStreak: true,
          longestStreak: true,
          lastActivityDate: true,
          createdAt: true,
        },
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Get user's progress
      const progress = await prisma.userProgress.findMany({
        where: { userId },
        include: {
          level: {
            select: {
              code: true,
              name: true,
            },
          },
        },
      });

      // Achievements kaldırıldı (tablo yok)

      return {
        ...user,
        progress,
      };
    } catch (error) {
      console.error('Get user profile error:', error);
      throw error;
    }
  }

  async updateUserProfile(userId: string, data: { name?: string }) {
    try {
      const user = await prisma.user.update({
        where: { id: userId },
        data,
        select: {
          id: true,
          email: true,
          name: true,
          avatarUrl: true,
          totalXp: true,
          currentStreak: true,
        },
      });

      return user;
    } catch (error) {
      console.error('Update user profile error:', error);
      throw new Error('Failed to update user profile');
    }
  }
}
