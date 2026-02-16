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
      if (!req.userId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
        });
      }

      const { lessonId } = req.params;
      const { score, timeSpentSeconds } = req.body;

      const result = await lessonsService.completeLesson(req.userId, lessonId, {
        score,
        timeSpentSeconds,
      });

      res.json({
        success: true,
        data: result,
        message: `Lesson completed! +${result.xpEarned} XP`,
      });
    } catch (error) {
      const statusCode =
        error instanceof Error && error.message === 'Lesson already completed'
          ? 409
          : 500;

      res.status(statusCode).json({
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to complete lesson',
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
