import { Request, Response } from 'express';
import { PodcastsService } from './podcasts.service';

const podcastsService = new PodcastsService();

export class PodcastsController {
  // GET /api/v1/podcasts/level/:levelCode
  async getPodcastsByLevel(req: Request, res: Response) {
    try {
      const { levelCode } = req.params;

      const podcasts = await podcastsService.getPodcastsByLevel(levelCode);

      res.json({
        success: true,
        data: podcasts,
      });
    } catch (error) {
      console.error('Get podcasts by level error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get podcasts',
      });
    }
  }

  // GET /api/v1/podcasts/:id
  async getPodcastById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const podcast = await podcastsService.getPodcastById(id);

      res.json({
        success: true,
        data: podcast,
      });
    } catch (error) {
      console.error('Get podcast by id error:', error);
      res.status(404).json({
        success: false,
        message: 'Podcast not found',
      });
    }
  }

  // POST /api/v1/podcasts/:id/complete
  async completePodcast(req: Request, res: Response) {
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

      const completion = await podcastsService.completePodcast(
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
      console.error('Complete podcast error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to complete podcast',
      });
    }
  }

  // GET /api/v1/podcasts/user/completions
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
        await podcastsService.getUserPodcastCompletions(userId);

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
