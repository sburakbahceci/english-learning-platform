import { Router } from 'express';
import { PodcastsController } from './podcasts.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();
const podcastsController = new PodcastsController();

// GET /api/v1/podcasts/level/:levelId
router.get(
  '/level/:levelId',
  podcastsController.getLevelPodcast.bind(podcastsController)
);

// POST /api/v1/podcasts/level/:levelId/complete (Protected)
router.post(
  '/level/:levelId/complete',
  authenticate,
  podcastsController.completePodcastExercises.bind(podcastsController)
);

// GET /api/v1/podcasts/level/:levelId/completion (Protected)
router.get(
  '/level/:levelId/completion',
  authenticate,
  podcastsController.getUserPodcastCompletion.bind(podcastsController)
);

export default router;
