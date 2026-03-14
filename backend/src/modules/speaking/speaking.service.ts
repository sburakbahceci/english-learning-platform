import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class SpeakingService {
  // Get speaking tasks by level code
  async getTasksByLevel(levelCode: string) {
    const level = await prisma.level.findUnique({
      where: { code: levelCode },
    });

    if (!level) {
      throw new Error('Level not found');
    }

    const tasks = await prisma.speaking_tasks.findMany({
      where: { level_id: level.id },
      orderBy: { difficulty: 'asc' },
    });

    return tasks;
  }

  // Get single speaking task by ID
  async getTaskById(taskId: string) {
    const task = await prisma.speaking_tasks.findUnique({
      where: { id: taskId },
      include: {
        levels: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
      },
    });

    if (!task) {
      throw new Error('Speaking task not found');
    }

    return task;
  }

  // Submit speaking attempt (with transcription and AI feedback)
  async submitAttempt(
    userId: string,
    taskId: string,
    transcription: string,
    durationSeconds: number
  ) {
    // Check if task exists
    const task = await prisma.speaking_tasks.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      throw new Error('Speaking task not found');
    }

    // TODO: Generate AI feedback using Groq or another AI service
    // For now, we'll create a simple mock feedback
    const aiFeedback = {
      pronunciation_score: 75,
      fluency_score: 70,
      grammar_score: 80,
      vocabulary_score: 75,
      overall_score: 75,
      feedback_text: 'Good job! Keep practicing to improve your fluency.',
      strengths: ['Clear pronunciation', 'Good grammar'],
      improvements: ['Speak more naturally', 'Expand vocabulary'],
    };

    // Upsert attempt (update if exists, create if not)
    const attempt = await prisma.speaking_attempts.upsert({
      where: {
        user_id_task_id: {
          user_id: userId,
          task_id: taskId,
        },
      },
      update: {
        transcription,
        ai_feedback: aiFeedback as any,
        duration_seconds: durationSeconds,
        attempted_at: new Date(),
      },
      create: {
        user_id: userId,
        task_id: taskId,
        transcription,
        ai_feedback: aiFeedback as any,
        duration_seconds: durationSeconds,
      },
    });

    return {
      attempt,
      feedback: aiFeedback,
    };
  }

  // Get user's speaking attempts
  async getUserAttempts(userId: string) {
    const attempts = await prisma.speaking_attempts.findMany({
      where: { user_id: userId },
      include: {
        speaking_tasks: {
          select: {
            id: true,
            title: true,
            task_type: true,
            level_id: true,
          },
        },
      },
      orderBy: { attempted_at: 'desc' },
    });

    return attempts;
  }

  // Get specific attempt by ID
  async getAttemptById(attemptId: string, userId: string) {
    const attempt = await prisma.speaking_attempts.findUnique({
      where: { id: attemptId },
      include: {
        speaking_tasks: {
          include: {
            levels: {
              select: {
                code: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!attempt) {
      throw new Error('Speaking attempt not found');
    }

    if (attempt.user_id !== userId) {
      throw new Error('Unauthorized');
    }

    return attempt;
  }

  // Get user's progress for a specific level
  async getUserProgress(userId: string, levelCode: string) {
    const level = await prisma.level.findUnique({
      where: { code: levelCode },
    });

    if (!level) {
      throw new Error('Level not found');
    }

    // Get all tasks for this level
    const taskIds = await prisma.speaking_tasks.findMany({
      where: { level_id: level.id },
      select: { id: true },
    });

    const taskIdList = taskIds.map((t) => t.id);

    // Get user's attempts for these tasks
    const attempts = await prisma.speaking_attempts.findMany({
      where: {
        user_id: userId,
        task_id: { in: taskIdList },
      },
    });

    return {
      total_tasks: taskIdList.length,
      completed_tasks: attempts.length,
      attempts: attempts,
    };
  }
}
