import { Request, Response } from 'express';
import { SpeakingService } from './speaking.service';

const speakingService = new SpeakingService();

export class SpeakingController {
  // GET /api/v1/speaking/level/:levelCode
  async getTasksByLevel(req: Request, res: Response) {
    try {
      const { levelCode } = req.params;
      const tasks = await speakingService.getTasksByLevel(levelCode);

      res.json({
        success: true,
        data: tasks,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // GET /api/v1/speaking/:taskId
  async getTaskById(req: Request, res: Response) {
    try {
      const { taskId } = req.params;
      const task = await speakingService.getTaskById(taskId);

      res.json({
        success: true,
        data: task,
      });
    } catch (error: any) {
      res.status(404).json({
        success: false,
        message: error.message,
      });
    }
  }

  // POST /api/v1/speaking/submit
  async submitAttempt(req: Request, res: Response) {
    try {
      // ✅ req.userId kullan (middleware'den geliyor)
      const userId = req.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized - Please login',
        });
      }

      const { taskId, transcription, durationSeconds } = req.body;

      if (!taskId || !transcription) {
        return res.status(400).json({
          success: false,
          message: 'taskId and transcription are required',
        });
      }

      const result = await speakingService.submitAttempt(
        userId,
        taskId,
        transcription,
        durationSeconds || 0
      );

      res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // GET /api/v1/speaking/user/attempts
  async getUserAttempts(req: Request, res: Response) {
    try {
      const userId = req.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized - Please login',
        });
      }

      const attempts = await speakingService.getUserAttempts(userId);

      res.json({
        success: true,
        data: attempts,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // GET /api/v1/speaking/attempt/:attemptId
  async getAttemptById(req: Request, res: Response) {
    try {
      const userId = req.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized - Please login',
        });
      }

      const { attemptId } = req.params;

      const attempt = await speakingService.getAttemptById(attemptId, userId);

      res.json({
        success: true,
        data: attempt,
      });
    } catch (error: any) {
      res.status(404).json({
        success: false,
        message: error.message,
      });
    }
  }

  // GET /api/v1/speaking/progress/:levelCode
  async getUserProgress(req: Request, res: Response) {
    try {
      const userId = req.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized - Please login',
        });
      }

      const { levelCode } = req.params;

      const progress = await speakingService.getUserProgress(userId, levelCode);

      res.json({
        success: true,
        data: progress,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
}
