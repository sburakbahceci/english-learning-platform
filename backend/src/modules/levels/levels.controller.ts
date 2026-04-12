import { Request, Response } from 'express';
import { LevelsService } from './levels.service';

const levelsService = new LevelsService();

export class LevelsController {
  // GET /api/v1/levels
  async getAllLevels(req: Request, res: Response) {
    try {
      const userId = req.userId; // ✅ Auth middleware'den gelen userId

      console.log('📍 Controller - userId from req:', userId); // ✅ Debug

      const levels = await levelsService.getAllLevels(userId);

      res.json({
        success: true,
        data: levels,
        count: levels.length,
      });
    } catch (error) {
      console.error('Get levels error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch levels',
      });
    }
  }

  // GET /api/v1/levels/:code
  async getLevelByCode(req: Request, res: Response) {
    try {
      const { code } = req.params;
      const level = await levelsService.getLevelByCode(code);

      res.json({
        success: true,
        data: level,
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        error: 'Level not found',
      });
    }
  }
}
