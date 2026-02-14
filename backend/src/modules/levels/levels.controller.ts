import { Request, Response } from 'express';
import { LevelsService } from './levels.service';

const levelsService = new LevelsService();

export class LevelsController {
  async getAllLevels(_req: Request, res: Response) {
    try {
      const levels = await levelsService.getAllLevels();

      res.json({
        success: true,
        data: levels,
        count: levels.length,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch levels',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getLevelByCode(req: Request, res: Response) {
    try {
      const { code } = req.params;

      if (!code) {
        return res.status(400).json({
          success: false,
          error: 'Level code is required',
        });
      }

      const level = await levelsService.getLevelByCode(code);

      res.json({
        success: true,
        data: level,
      });
    } catch (error) {
      const statusCode =
        error instanceof Error && error.message === 'Level not found'
          ? 404
          : 500;

      res.status(statusCode).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch level',
      });
    }
  }
}
