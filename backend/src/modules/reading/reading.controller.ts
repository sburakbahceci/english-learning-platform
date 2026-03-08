import { Request, Response } from 'express';
import { ReadingService } from './reading.service';

const readingService = new ReadingService();

export class ReadingController {
  // GET /api/v1/reading/level/:levelCode
  async getPassagesByLevel(req: Request, res: Response) {
    try {
      const { levelCode } = req.params;
      const passages = await readingService.getPassagesByLevel(levelCode);

      res.json({
        success: true,
        data: passages,
      });
    } catch (error) {
      console.error('Get passages by level error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get reading passages',
      });
    }
  }

  // GET /api/v1/reading/:id
  async getPassageById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const passage = await readingService.getPassageById(id);

      res.json({
        success: true,
        data: passage,
      });
    } catch (error) {
      console.error('Get passage by id error:', error);
      res.status(404).json({
        success: false,
        message: 'Passage not found',
      });
    }
  }

  // POST /api/v1/reading/:id/complete
  async completeReading(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { score, timeSpent } = req.body;
      const userId = req.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
      }

      const completion = await readingService.completeReading(
        userId,
        id,
        score,
        timeSpent
      );

      res.json({
        success: true,
        data: completion,
      });
    } catch (error) {
      console.error('Complete reading error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to complete reading',
      });
    }
  }

  // GET /api/v1/reading/user/completions
  async getUserCompletions(req: Request, res: Response) {
    try {
      const userId = req.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
      }

      const completions =
        await readingService.getUserReadingCompletions(userId);

      res.json({
        success: true,
        data: completions,
      });
    } catch (error) {
      console.error('Get user completions error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get completions',
      });
    }
  }
}
