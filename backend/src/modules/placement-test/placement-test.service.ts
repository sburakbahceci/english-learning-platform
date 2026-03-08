import prisma from '../../config/database';

export class PlacementTestService {
  // Kullanıcı placement test yaptı mı?
  async hasUserCompletedTest(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { placementTestCompleted: true },
    });

    return user?.placementTestCompleted || false;
  }

  // Placement test başlat
  async startPlacementTest(userId: string) {
    // Daha önce yapmış mı kontrol et
    const existingTest = await prisma.placementTest.findUnique({
      where: { userId },
    });

    if (existingTest) {
      // ✅ Eğer tamamlanmışsa hata ver
      if (existingTest.completedAt) {
        throw new Error('PLACEMENT_TEST_ALREADY_COMPLETED');
      }

      // ✅ Tamamlanmamışsa devam ettir
      const questions = await prisma.placementTestQuestion.findMany({
        orderBy: [{ levelCode: 'asc' }, { difficulty: 'asc' }],
      });

      // Hangi soruları cevaplamış?
      const answeredQuestions = await prisma.placementTestAnswer.findMany({
        where: { placementTestId: existingTest.id },
        select: { questionId: true },
      });

      const answeredQuestionIds = new Set(
        answeredQuestions.map((a) => a.questionId)
      );

      return {
        testId: existingTest.id,
        questions: questions.map((q) => ({
          id: q.id,
          questionText: q.questionText,
          options: q.options,
          levelCode: q.levelCode,
          difficulty: q.difficulty,
          isAnswered: answeredQuestionIds.has(q.id), // ✅ Hangi sorular cevaplanmış
        })),
        currentQuestionIndex: answeredQuestions.length, // ✅ Kaldığı yerden devam
      };
    }

    // Yeni test oluştur
    const placementTest = await prisma.placementTest.create({
      data: {
        userId,
        totalQuestions: 30,
        correctAnswers: 0,
      },
    });

    // Her seviyeden 5 soru al (toplam 30)
    const questions = await prisma.placementTestQuestion.findMany({
      orderBy: [{ levelCode: 'asc' }, { difficulty: 'asc' }],
    });

    return {
      testId: placementTest.id,
      questions: questions.map((q) => ({
        id: q.id,
        questionText: q.questionText,
        options: q.options,
        levelCode: q.levelCode,
        difficulty: q.difficulty,
        isAnswered: false,
      })),
      currentQuestionIndex: 0,
    };
  }

  // Cevap kaydet
  async submitAnswer(userId: string, questionId: string, userAnswer: string) {
    // Placement test bul
    const placementTest = await prisma.placementTest.findUnique({
      where: { userId },
    });

    if (!placementTest) {
      throw new Error('PLACEMENT_TEST_NOT_FOUND');
    }

    if (placementTest.completedAt) {
      throw new Error('PLACEMENT_TEST_ALREADY_COMPLETED');
    }

    // Soruyu bul
    const question = await prisma.placementTestQuestion.findUnique({
      where: { id: questionId },
    });

    if (!question) {
      throw new Error('QUESTION_NOT_FOUND');
    }

    // Doğru mu kontrol et
    const isCorrect = userAnswer === question.correctAnswer;

    // Cevabı kaydet
    await prisma.placementTestAnswer.create({
      data: {
        placementTestId: placementTest.id,
        questionId,
        userId,
        userAnswer,
        isCorrect,
      },
    });

    // Doğruysa correct_answers'ı artır
    if (isCorrect) {
      await prisma.placementTest.update({
        where: { id: placementTest.id },
        data: {
          correctAnswers: { increment: 1 },
        },
      });
    }

    return { isCorrect };
  }

  // Test'i tamamla ve seviye belirle
  async completePlacementTest(userId: string) {
    const placementTest = await prisma.placementTest.findUnique({
      where: { userId },
      include: {
        answers: {
          include: {
            question: true,
          },
        },
      },
    });

    if (!placementTest) {
      throw new Error('PLACEMENT_TEST_NOT_FOUND');
    }

    if (placementTest.completedAt) {
      throw new Error('PLACEMENT_TEST_ALREADY_COMPLETED');
    }

    // Seviye belirleme algoritması
    const level = this.determineLevelFromAnswers(placementTest.answers);

    // Test'i tamamla
    await prisma.placementTest.update({
      where: { id: placementTest.id },
      data: {
        completedAt: new Date(),
        determinedLevel: level,
      },
    });

    // User'ı güncelle
    await prisma.user.update({
      where: { id: userId },
      data: {
        placementTestCompleted: true,
        startingLevel: level,
        placementTestDate: new Date(),
      },
    });

    // Belirlenen seviyeye kadar unlock yap
    await this.unlockLevelsUpTo(userId, level);

    return {
      determinedLevel: level,
      correctAnswers: placementTest.correctAnswers,
      totalQuestions: placementTest.totalQuestions,
      percentage: Math.round(
        (placementTest.correctAnswers / placementTest.totalQuestions) * 100
      ),
    };
  }

  // Seviye belirleme algoritması
  private determineLevelFromAnswers(answers: any[]): string {
    // Her seviyeden doğru cevap sayısını hesapla
    const levelScores: Record<string, { correct: number; total: number }> = {
      A1: { correct: 0, total: 0 },
      A2: { correct: 0, total: 0 },
      B1: { correct: 0, total: 0 },
      B2: { correct: 0, total: 0 },
      C1: { correct: 0, total: 0 },
      C2: { correct: 0, total: 0 },
    };

    answers.forEach((answer) => {
      const level = answer.question.levelCode;
      levelScores[level].total++;
      if (answer.isCorrect) {
        levelScores[level].correct++;
      }
    });

    // Seviye belirleme
    // %80+ doğru = o seviye
    // %60-79 doğru = bir alt seviye
    // <%60 = iki alt seviye

    const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

    // Geriye doğru git, en yüksek geçilen seviyeyi bul
    for (let i = levels.length - 1; i >= 0; i--) {
      const level = levels[i];
      const score = levelScores[level];

      if (score.total === 0) continue;

      const percentage = (score.correct / score.total) * 100;

      if (percentage >= 80) {
        // Bu seviyeyi geçmiş, bir sonraki seviyeye yerleştir
        return levels[Math.min(i + 1, levels.length - 1)];
      } else if (percentage >= 60) {
        // Bu seviyeye yerleştir
        return level;
      }
    }

    // Hiçbir seviyeyi geçememiş, A1'e yerleştir
    return 'A1';
  }

  // Belirlenen seviyeye kadar unlock yap
  private async unlockLevelsUpTo(userId: string, targetLevel: string) {
    const levels = await prisma.level.findMany({
      orderBy: { unlockOrder: 'asc' },
    });

    const targetLevelObj = levels.find((l) => l.code === targetLevel);
    if (!targetLevelObj) return;

    // Target seviyeye kadar olan seviyeler için progress oluştur
    const levelsToUnlock = levels.filter(
      (l) => l.unlockOrder && l.unlockOrder <= (targetLevelObj.unlockOrder || 0)
    );

    for (const level of levelsToUnlock) {
      // Progress var mı kontrol et
      const existingProgress = await prisma.userProgress.findUnique({
        where: {
          userId_levelId: {
            userId,
            levelId: level.id,
          },
        },
      });

      if (!existingProgress) {
        const totalLessons = await prisma.lesson.count({
          where: { levelId: level.id },
        });

        await prisma.userProgress.create({
          data: {
            userId,
            levelId: level.id,
            totalLessons,
            lessonsCompleted: 0,
            isExamUnlocked: false,
            examsPassed: 0,
            examsFailed: 0,
          },
        });
      }
    }
  }

  // Test sonuçlarını getir
  async getTestResults(userId: string) {
    const placementTest = await prisma.placementTest.findUnique({
      where: { userId },
      include: {
        answers: {
          include: {
            question: true,
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    if (!placementTest) {
      throw new Error('PLACEMENT_TEST_NOT_FOUND');
    }

    return placementTest;
  }
}
