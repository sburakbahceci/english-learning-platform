import prisma from '../../config/database';

export class ReadingService {
  // Level'a göre reading passage'ları getir
  async getPassagesByLevel(levelCode: string) {
    try {
      const level = await prisma.level.findUnique({
        where: { code: levelCode },
      });

      if (!level) {
        throw new Error('Level not found');
      }

      const passages = await prisma.reading_passages.findMany({
        where: { level_id: level.id },
        include: {
          reading_questions: {
            orderBy: { question_order: 'asc' },
          },
        },
        orderBy: { created_at: 'desc' },
      });

      return passages;
    } catch (error) {
      console.error('Get passages by level error:', error);
      throw error;
    }
  }

  // Passage'ı ID'ye göre getir
  async getPassageById(passageId: string) {
    try {
      const passage = await prisma.reading_passages.findUnique({
        where: { id: passageId },
        include: {
          reading_questions: {
            orderBy: { question_order: 'asc' },
          },
          levels: {
            select: {
              code: true,
              name: true,
            },
          },
        },
      });

      if (!passage) {
        throw new Error('Passage not found');
      }

      return passage;
    } catch (error) {
      console.error('Get passage by id error:', error);
      throw error;
    }
  }

  // Reading completion kaydet
  async completeReading(
    userId: string,
    passageId: string,
    score: number,
    timeSpent: number
  ) {
    try {
      // Daha önce tamamlanmış mı?
      const existing = await prisma.reading_completions.findFirst({
        where: {
          user_id: userId,
          passage_id: passageId,
        },
      });

      if (existing) {
        // Varsa güncelle
        return await prisma.reading_completions.update({
          where: { id: existing.id },
          data: {
            score,
            time_spent: timeSpent,
            completed_at: new Date(),
          },
        });
      }

      // Yoksa yeni kayıt
      return await prisma.reading_completions.create({
        data: {
          user_id: userId,
          passage_id: passageId,
          score,
          time_spent: timeSpent,
        },
      });
    } catch (error) {
      console.error('Complete reading error:', error);
      throw error;
    }
  }

  // Kullanıcının reading completion'larını getir
  async getUserReadingCompletions(userId: string) {
    try {
      return await prisma.reading_completions.findMany({
        where: { user_id: userId },
        include: {
          reading_passages: {
            select: {
              id: true,
              title: true,
              level_id: true,
            },
          },
        },
        orderBy: { completed_at: 'desc' },
      });
    } catch (error) {
      console.error('Get user reading completions error:', error);
      throw error;
    }
  }
}
