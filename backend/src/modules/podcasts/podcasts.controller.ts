import { Request, Response } from 'express';
import { PodcastsService } from './podcasts.service';

const podcastsService = new PodcastsService();

export class PodcastsController {
  // GET /api/v1/podcasts/level/:levelId
  async getLevelPodcast(req: Request, res: Response) {
    try {
      const { levelId } = req.params;

      const podcast = await podcastsService.getLevelPodcast(levelId);

      res.json({
        success: true,
        data: podcast,
      });
    } catch (error) {
      const statusCode =
        error instanceof Error && error.message.includes('not found')
          ? 404
          : 500;

      res.status(statusCode).json({
        success: false,
        message:
          error instanceof Error ? error.message : 'Failed to fetch podcast',
      });
    }
  }

  // POST /api/v1/podcasts/level/:levelId/complete
  async completePodcastExercises(req: Request, res: Response) {
    try {
      const { levelId } = req.params;
      const { score, totalQuestions } = req.body;
      const userId = req.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
      }

      const completion = await podcastsService.completePodcastExercises(
        userId,
        levelId,
        { score, totalQuestions }
      );

      res.json({
        success: true,
        data: completion,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          error instanceof Error ? error.message : 'Failed to complete podcast',
      });
    }
  }

  // GET /api/v1/podcasts/level/:levelId/completion
  async getUserPodcastCompletion(req: Request, res: Response) {
    try {
      const { levelId } = req.params;
      const userId = req.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
      }

      const completion = await podcastsService.getUserPodcastCompletion(
        userId,
        levelId
      );

      res.json({
        success: true,
        data: completion,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          error instanceof Error ? error.message : 'Failed to fetch completion',
      });
    }
  }
}
