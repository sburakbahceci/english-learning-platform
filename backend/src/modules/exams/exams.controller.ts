import { Request, Response } from 'express';
import { ExamsService } from './exams.service';

const examsService = new ExamsService();

export class ExamsController {
  // POST /api/v1/exams/levels/:levelId/start
  async startExam(req: Request, res: Response) {
    try {
      if (!req.userId) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const { levelId } = req.params;
      const result = await examsService.startExam(req.userId, levelId);

      res.json({ success: true, data: result });
    } catch (error) {
      if (error instanceof Error && error.message === 'MAX_ATTEMPTS_REACHED') {
        return res.status(429).json({
          success: false,
          error: 'Maximum attempts reached',
          message: 'You have failed 3 times. Your level has been reset.',
        });
      }

      if (error instanceof Error && error.message === 'NOT_ENOUGH_QUESTIONS') {
        return res.status(400).json({
          success: false,
          error: 'Not enough questions',
          message: 'This level does not have enough questions for an exam.',
        });
      }

      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to start exam',
      });
    }
  }

  // POST /api/v1/exams/:examId/submit
  async submitExam(req: Request, res: Response) {
    try {
      if (!req.userId) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const { examId } = req.params;
      const { answers } = req.body;

      if (!answers || typeof answers !== 'object') {
        return res.status(400).json({
          success: false,
          error: 'Answers are required',
        });
      }

      const result = await examsService.submitExam(req.userId, examId, answers);

      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to submit exam',
      });
    }
  }

  // GET /api/v1/exams/:examId/results
  async getResults(req: Request, res: Response) {
    try {
      if (!req.userId) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const { examId } = req.params;
      const result = await examsService.getExamResults(req.userId, examId);

      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get results',
      });
    }
  }

  // GET /api/v1/exams/levels/:levelId/attempts
  async getAttempts(req: Request, res: Response) {
    try {
      if (!req.userId) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const { levelId } = req.params;
      const attempts = await examsService.getExamAttempts(req.userId, levelId);

      res.json({ success: true, data: attempts });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to get attempts',
      });
    }
  }
}
