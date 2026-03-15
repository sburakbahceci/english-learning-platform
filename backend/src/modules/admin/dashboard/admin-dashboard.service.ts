import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class AdminDashboardService {
  // Get overview statistics
  async getOverviewStats() {
    const [
      totalUsers,
      activeUsers,
      totalLessonsCompleted,
      totalXpEarned,
      placementTestsCompleted,
      totalPodcasts,
      totalReadingPassages,
      totalWritingPrompts,
      totalSpeakingTasks,
    ] = await Promise.all([
      // Total users
      prisma.user.count(),

      // Active users (last 7 days)
      prisma.user.count({
        where: {
          lastActivityDate: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),

      // Total lessons completed
      prisma.lessonCompletion.count(),

      // Total XP earned (sum of all users' XP)
      prisma.user.aggregate({
        _sum: {
          totalXp: true,
        },
      }),

      // Placement tests completed
      prisma.placementTest.count({
        where: {
          completedAt: {
            not: null,
          },
        },
      }),

      // Total podcasts
      prisma.podcast.count(),

      // Total reading passages
      prisma.reading_passages.count(),

      // Total writing prompts
      prisma.writing_prompts.count(),

      // Total speaking tasks
      prisma.speaking_tasks.count(),
    ]);

    return {
      users: {
        total: totalUsers,
        active: activeUsers,
      },
      lessons: {
        completions: totalLessonsCompleted,
      },
      xp: {
        total: totalXpEarned._sum.totalXp || 0,
      },
      placementTests: {
        completed: placementTestsCompleted,
      },
      content: {
        podcasts: totalPodcasts,
        readingPassages: totalReadingPassages,
        writingPrompts: totalWritingPrompts,
        speakingTasks: totalSpeakingTasks,
      },
    };
  }

  // Get level statistics
  async getLevelStats() {
    const levels = await prisma.level.findMany({
      select: {
        id: true,
        code: true,
        name: true,
        _count: {
          select: {
            lessons: true,
            podcasts: true,
            reading_passages: true,
            writing_prompts: true,
            speaking_tasks: true,
          },
        },
      },
      orderBy: {
        order_index: 'asc',
      },
    });

    return levels.map((level) => ({
      code: level.code,
      name: level.name,
      content: {
        lessons: level._count.lessons,
        podcasts: level._count.podcasts,
        readingPassages: level._count.reading_passages,
        writingPrompts: level._count.writing_prompts,
        speakingTasks: level._count.speaking_tasks,
      },
    }));
  }

  // Get recent activities
  async getRecentActivities(limit: number = 10) {
    const [
      recentLessons,
      recentPlacements,
      recentSpeaking,
      recentReading,
      recentWriting,
    ] = await Promise.all([
      // Recent lesson completions
      prisma.lessonCompletion.findMany({
        take: limit,
        orderBy: { completedAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          lesson: {
            select: {
              title: true,
              level: {
                select: {
                  code: true,
                },
              },
            },
          },
        },
      }),

      // Recent placement tests
      prisma.placementTest.findMany({
        take: limit,
        where: {
          completedAt: {
            not: null,
          },
        },
        orderBy: { completedAt: 'desc' },
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      }),

      // Recent speaking attempts
      prisma.speaking_attempts.findMany({
        take: limit,
        orderBy: { attempted_at: 'desc' },
        include: {
          users: {
            select: {
              name: true,
              email: true,
            },
          },
          speaking_tasks: {
            select: {
              title: true,
            },
          },
        },
      }),

      // Recent reading completions
      prisma.reading_completions.findMany({
        take: limit,
        orderBy: { completed_at: 'desc' },
        include: {
          users: {
            select: {
              name: true,
              email: true,
            },
          },
          reading_passages: {
            select: {
              title: true,
            },
          },
        },
      }),

      // Recent writing submissions
      prisma.writing_submissions.findMany({
        take: limit,
        orderBy: { submitted_at: 'desc' },
        include: {
          users: {
            select: {
              name: true,
              email: true,
            },
          },
          writing_prompts: {
            select: {
              title: true,
            },
          },
        },
      }),
    ]);

    // Combine and sort all activities
    const activities = [
      ...recentLessons.map((item) => ({
        type: 'lesson_completion',
        user: item.user.name,
        action: `Completed lesson: ${item.lesson.title}`,
        level: item.lesson.level.code,
        timestamp: item.completedAt,
      })),
      ...recentPlacements.map((item) => ({
        type: 'placement_test',
        user: item.user.name,
        action: `Completed placement test - Level: ${item.determinedLevel || 'N/A'}`,
        level: item.determinedLevel || undefined,
        timestamp: item.completedAt,
      })),
      ...recentSpeaking.map((item) => ({
        type: 'speaking',
        user: item.users.name,
        action: `Speaking: ${item.speaking_tasks.title}`,
        timestamp: item.attempted_at,
      })),
      ...recentReading.map((item) => ({
        type: 'reading',
        user: item.users.name,
        action: `Reading: ${item.reading_passages.title}`,
        timestamp: item.completed_at,
      })),
      ...recentWriting.map((item) => ({
        type: 'writing',
        user: item.users.name,
        action: `Writing: ${item.writing_prompts.title}`,
        timestamp: item.submitted_at,
      })),
    ]
      .filter((item) => item.timestamp)
      .sort((a, b) => {
        const dateA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
        const dateB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
        return dateB - dateA;
      })
      .slice(0, limit);

    return activities;
  }

  // Get user growth data (last 30 days)
  async getUserGrowthData() {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const usersByDay = await prisma.user.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
      _count: true,
    });

    // Group by day
    const dailyData: Record<string, number> = {};

    usersByDay.forEach((item) => {
      const date = new Date(item.createdAt).toISOString().split('T')[0];
      dailyData[date] = (dailyData[date] || 0) + item._count;
    });

    return Object.entries(dailyData)
      .map(([date, count]) => ({
        date,
        users: count,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  // Get top users by XP
  async getTopUsersByXP(limit: number = 10) {
    const users = await prisma.user.findMany({
      take: limit,
      orderBy: {
        totalXp: 'desc',
      },
      select: {
        id: true,
        name: true,
        email: true,
        totalXp: true,
        currentStreak: true,
        startingLevel: true,
      },
    });

    return users;
  }
}