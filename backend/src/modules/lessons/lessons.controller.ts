import { Request, Response } from 'express';
import { LessonsService } from './lessons.service';

const lessonsService = new LessonsService();

export class LessonsController {
  // GET /api/v1/lessons/level/:levelId
  async getLessonsByLevel(req: Request, res: Response) {
    try {
      const { levelId } = req.params;

      const lessons = await lessonsService.getLessonsByLevel(levelId);

      res.json({
        success: true,
        data: lessons,
        count: lessons.length,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch lessons',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // GET /api/v1/lessons/:lessonId
  async getLessonById(req: Request, res: Response) {
    try {
      const { lessonId } = req.params;

      const lesson = await lessonsService.getLessonById(lessonId);

      res.json({
        success: true,
        data: lesson,
      });
    } catch (error) {
      const statusCode =
        error instanceof Error && error.message === 'Lesson not found'
          ? 404
          : 500;

      res.status(statusCode).json({
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to fetch lesson',
      });
    }
  }

  // POST /api/v1/lessons/:lessonId/complete
  async completeLesson(req: Request, res: Response) {
    try {
      const { lessonId } = req.params;
      const { score, timeSpentSeconds } = req.body;
      const userId = req.userId; // ← req.user yerine req.userId

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
      }

      console.log('📥 Complete lesson request:', {
        userId,
        lessonId,
        score,
        timeSpentSeconds,
      });

      const result = await lessonsService.completeLesson( // ← this.lessonsService yerine lessonsService
        userId,
        lessonId,
        { score, timeSpentSeconds }
      );

      console.log('✅ Lesson completed successfully:', result);

      return res.json({
        success: true,
        data: result,
      });
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      console.error('❌ Complete lesson error:', error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // GET /api/v1/lessons/level/:levelId/completions
  async getUserCompletions(req: Request, res: Response) {
    try {
      if (!req.userId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
        });
      }

      const { levelId } = req.params;

      const completions = await lessonsService.getUserLessonCompletions(
        req.userId,
        levelId
      );

      res.json({
        success: true,
        data: completions,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch completions',
      });
    }
  }
}