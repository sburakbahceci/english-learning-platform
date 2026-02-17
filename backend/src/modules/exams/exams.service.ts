import prisma from '../../config/database';

export class ExamsService {
  async startExam(userId: string, levelId: string) {
    try {
      // Check active exam
      const activeExam = await prisma.exam.findFirst({
        where: { userId, levelId, status: 'in_progress' },
      });

      if (activeExam) {
        const questions = await this.fetchQuestions(levelId);
        return { exam: activeExam, questions };
      }

      // Check recent failures (last 24h)
      const recentFailures = await prisma.examAttempt.count({
        where: {
          userId,
          levelId,
          passed: false,
          attemptedAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
        },
      });

      if (recentFailures >= 3) {
        throw new Error('MAX_ATTEMPTS_REACHED');
      }

      // Get questions
      const grammarQuestions = await prisma.question.findMany({
        where: { levelId, category: 'grammar', isActive: true },
        take: 12,
      });

      const vocabQuestions = await prisma.question.findMany({
        where: { levelId, category: 'vocabulary', isActive: true },
        take: 8,
      });

      const allQuestions = [...grammarQuestions, ...vocabQuestions].sort(
        () => Math.random() - 0.5
      );

      if (allQuestions.length < 20) {
        throw new Error('NOT_ENOUGH_QUESTIONS');
      }

      // Store question IDs in exam
      const questionIds = allQuestions.map((q) => q.id);

      // Create exam - expires in 20 minutes
      const expiresAt = new Date(Date.now() + 20 * 60 * 1000);

      const exam = await prisma.exam.create({
        data: {
          userId,
          levelId,
          status: 'in_progress',
          questions: questionIds,
          answers: {},
          expiresAt,
        },
      });

      return { exam, questions: allQuestions };
    } catch (error) {
      throw error;
    }
  }

  async submitExam(
    userId: string,
    examId: string,
    answers: Record<string, string>
  ) {
    try {
      // Get exam
      const exam = await prisma.exam.findUnique({
        where: { id: examId },
      });

      if (!exam) throw new Error('Exam not found');
      if (exam.userId !== userId) throw new Error('Unauthorized');
      if (exam.status !== 'in_progress')
        throw new Error('Exam already completed');

      // Check if expired
      if (exam.expiresAt && new Date() > exam.expiresAt) {
        await prisma.exam.update({
          where: { id: examId },
          data: { status: 'expired' },
        });
        throw new Error('Exam expired');
      }

      // Get question IDs from exam
      const questionIds = exam.questions as string[];

      // Fetch questions
      const questions = await prisma.question.findMany({
        where: { id: { in: questionIds } },
      });

      // Calculate score
      let correctAnswers = 0;
      const results = questions.map((q) => {
        const userAnswer = answers[q.id] ?? '';
        const isCorrect = userAnswer === q.correctAnswer;
        if (isCorrect) correctAnswers++;

        return {
          questionId: q.id,
          questionText: q.questionText,
          userAnswer,
          correctAnswer: q.correctAnswer ?? '',
          isCorrect,
          explanation: q.explanation,
        };
      });

      const score = Math.round((correctAnswers / questions.length) * 100);
      const passed = score >= 80;

      const timeTakenSeconds = exam.startedAt
        ? Math.round((Date.now() - new Date(exam.startedAt).getTime()) / 1000)
        : 0;

      // Update exam
      const updatedExam = await prisma.exam.update({
        where: { id: examId },
        data: {
          status: 'completed',
          answers,
          score,
          passed,
          completedAt: new Date(),
          timeTakenSeconds,
        },
      });

      // Get last attempt number
      const lastAttempt = await prisma.examAttempt.findFirst({
        where: { userId, levelId: exam.levelId ?? '' },
        orderBy: { attemptedAt: 'desc' },
      });

      const attemptNumber = (lastAttempt?.attemptNumber ?? 0) + 1;

      // Create attempt record
      await prisma.examAttempt.create({
        data: {
          userId,
          examId,
          levelId: exam.levelId ?? '',
          score,
          passed,
          attemptNumber,
        },
      });

      // Handle pass/fail
      if (passed) {
        await this.handleExamPass(userId, exam.levelId ?? '');
      } else {
        await this.handleExamFail(userId, exam.levelId ?? '');
      }

      return {
        exam: updatedExam,
        score,
        passed,
        correctAnswers,
        totalQuestions: questions.length,
        results,
      };
    } catch (error) {
      throw error;
    }
  }

  private async handleExamPass(userId: string, levelId: string) {
    // Update current level progress
    await prisma.userProgress.updateMany({
      where: { userId, levelId },
      data: {
        examPassed: true,
        status: 'completed',
      },
    });

    // Find next level
    const currentLevel = await prisma.level.findUnique({
      where: { id: levelId },
    });

    if (!currentLevel) return;

    const nextLevel = await prisma.level.findFirst({
      where: { orderIndex: (currentLevel.orderIndex ?? 0) + 1 },
    });

    if (nextLevel) {
      const existingProgress = await prisma.userProgress.findUnique({
        where: { userId_levelId: { userId, levelId: nextLevel.id } },
      });

      if (!existingProgress) {
        const totalLessons = await prisma.lesson.count({
          where: { levelId: nextLevel.id },
        });

        await prisma.userProgress.create({
          data: {
            userId,
            levelId: nextLevel.id,
            status: 'in_progress',
            totalLessons,
          },
        });
      }
    }

    // +100 XP for passing
    await prisma.user.update({
      where: { id: userId },
      data: { totalXp: { increment: 100 } },
    });
  }

  private async handleExamFail(userId: string, levelId: string) {
    const recentFailures = await prisma.examAttempt.count({
      where: {
        userId,
        levelId,
        passed: false,
        attemptedAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
    });

    // Reset after 3 failures
    if (recentFailures >= 3) {
      await prisma.userProgress.updateMany({
        where: { userId, levelId },
        data: {
          lessonsCompleted: 0,
          isExamUnlocked: false,
          status: 'in_progress',
          examPassed: false,
        },
      });

      await prisma.levelReset.create({
        data: { userId, levelId, reason: 'exam_failure' },
      });
    }
  }

  private async fetchQuestions(levelId: string) {
    const grammarQuestions = await prisma.question.findMany({
      where: { levelId, category: 'grammar', isActive: true },
      take: 12,
    });

    const vocabQuestions = await prisma.question.findMany({
      where: { levelId, category: 'vocabulary', isActive: true },
      take: 8,
    });

    return [...grammarQuestions, ...vocabQuestions];
  }

  async getExamResults(userId: string, examId: string) {
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: { level: true },
    });

    if (!exam) throw new Error('Exam not found');
    if (exam.userId !== userId) throw new Error('Unauthorized');

    return exam;
  }

  async getExamAttempts(userId: string, levelId: string) {
    return await prisma.examAttempt.findMany({
      where: { userId, levelId },
      orderBy: { attemptedAt: 'desc' },
      select: {
        id: true,
        score: true,
        passed: true,
        attemptNumber: true,
        attemptedAt: true,
      },
      take: 5,
    });
  }
}
