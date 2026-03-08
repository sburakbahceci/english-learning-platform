import prisma from '../../config/database';
import { generateWritingFeedback } from '../../services/groq.service';

export class WritingService {
  // ========================================
  // WRITING PROMPTS (Free Writing)
  // ========================================

  // Level'a göre writing prompt'ları getir
  async getPromptsByLevel(levelCode: string) {
    try {
      const level = await prisma.level.findUnique({
        where: { code: levelCode },
      });

      if (!level) {
        throw new Error('Level not found');
      }

      const prompts = await prisma.writing_prompts.findMany({
        where: { level_id: level.id },
        orderBy: { created_at: 'desc' },
      });

      return prompts;
    } catch (error) {
      console.error('Get prompts by level error:', error);
      throw error;
    }
  }

  // Prompt'u ID'ye göre getir
  async getPromptById(promptId: string) {
    try {
      const prompt = await prisma.writing_prompts.findUnique({
        where: { id: promptId },
        include: {
          levels: {
            select: {
              code: true,
              name: true,
            },
          },
        },
      });

      if (!prompt) {
        throw new Error('Prompt not found');
      }

      return prompt;
    } catch (error) {
      console.error('Get prompt by id error:', error);
      throw error;
    }
  }

  // Writing submission kaydet ve AI feedback al
  async submitWriting(userId: string, promptId: string, content: string) {
    try {
      const wordCount = content.trim().split(/\s+/).length;

      // Prompt'u getir
      const prompt = await prisma.writing_prompts.findUnique({
        where: { id: promptId },
        include: {
          levels: {
            select: {
              code: true,
              name: true,
            },
          },
        },
      });

      if (!prompt) {
        throw new Error('Prompt not found');
      }

      // AI'dan feedback al
      const aiFeedback = await generateWritingFeedback(
        content,
        prompt.prompt_text,
        prompt.levels.code
      );

      // Submission kaydet
      const submission = await prisma.writing_submissions.create({
        data: {
          user_id: userId,
          prompt_id: promptId,
          content,
          word_count: wordCount,
          ai_feedback: aiFeedback,
          overall_score: aiFeedback.overall_score,
        },
      });

      return submission;
    } catch (error) {
      console.error('Submit writing error:', error);
      throw error;
    }
  }

  // Kullanıcının submission'larını getir
  async getUserSubmissions(userId: string) {
    try {
      return await prisma.writing_submissions.findMany({
        where: { user_id: userId },
        include: {
          writing_prompts: {
            select: {
              id: true,
              title: true,
              level_id: true,
            },
          },
        },
        orderBy: { submitted_at: 'desc' },
      });
    } catch (error) {
      console.error('Get user submissions error:', error);
      throw error;
    }
  }

  // Submission'u ID'ye göre getir
  async getSubmissionById(submissionId: string, userId: string) {
    try {
      const submission = await prisma.writing_submissions.findFirst({
        where: {
          id: submissionId,
          user_id: userId,
        },
        include: {
          writing_prompts: true,
        },
      });

      if (!submission) {
        throw new Error('Submission not found');
      }

      return submission;
    } catch (error) {
      console.error('Get submission by id error:', error);
      throw error;
    }
  }

  // ========================================
  // WRITING EXERCISES (Fill-in-blank)
  // ========================================

  // Level'a göre writing exercises getir
  async getExercisesByLevel(levelCode: string) {
    try {
      const level = await prisma.level.findUnique({
        where: { code: levelCode },
      });

      if (!level) {
        throw new Error('Level not found');
      }

      const exercises = await prisma.writing_exercises.findMany({
        where: { level_id: level.id },
        orderBy: [{ difficulty: 'asc' }, { created_at: 'asc' }],
      });

      // Cevabı gizle (frontend'e gönderme)
      return exercises.map((ex) => ({
        id: ex.id,
        exercise_type: ex.exercise_type,
        sentence: ex.sentence,
        hint: ex.hint,
        options: ex.options,
        difficulty: ex.difficulty,
        // blank_word gönderme!
        // explanation gönderme!
      }));
    } catch (error) {
      console.error('Get exercises by level error:', error);
      throw error;
    }
  }

  // Exercise cevabını kontrol et
  async checkExerciseAnswer(
    userId: string,
    exerciseId: string,
    userAnswer: string
  ) {
    try {
      const exercise = await prisma.writing_exercises.findUnique({
        where: { id: exerciseId },
      });

      if (!exercise) {
        throw new Error('Exercise not found');
      }

      // Cevabı normalize et (küçük harf, trim)
      const normalizedUserAnswer = userAnswer.trim().toLowerCase();
      const normalizedCorrectAnswer = exercise.blank_word.trim().toLowerCase();

      const isCorrect = normalizedUserAnswer === normalizedCorrectAnswer;

      // Attempt kaydet
      await prisma.writing_exercise_attempts.upsert({
        where: {
          user_id_exercise_id: {
            user_id: userId,
            exercise_id: exerciseId,
          },
        },
        update: {
          user_answer: userAnswer,
          is_correct: isCorrect,
          attempted_at: new Date(),
        },
        create: {
          user_id: userId,
          exercise_id: exerciseId,
          user_answer: userAnswer,
          is_correct: isCorrect,
        },
      });

      return {
        is_correct: isCorrect,
        correct_answer: exercise.blank_word,
        explanation: exercise.explanation,
      };
    } catch (error) {
      console.error('Check exercise answer error:', error);
      throw error;
    }
  }

  // Kullanıcının exercise progress'ini getir
  async getUserExerciseProgress(userId: string, levelCode: string) {
    try {
      const level = await prisma.level.findUnique({
        where: { code: levelCode },
      });

      if (!level) {
        throw new Error('Level not found');
      }

      const attempts = await prisma.writing_exercise_attempts.findMany({
        where: { user_id: userId },
        include: {
          writing_exercises: true,
        },
      });

      const totalExercises = await prisma.writing_exercises.count({
        where: { level_id: level.id },
      });

      const correctCount = attempts.filter((a) => a.is_correct).length;

      return {
        total: totalExercises,
        completed: attempts.length,
        correct: correctCount,
        percentage:
          totalExercises > 0
            ? Math.round((correctCount / totalExercises) * 100)
            : 0,
      };
    } catch (error) {
      console.error('Get user exercise progress error:', error);
      throw error;
    }
  }
}
