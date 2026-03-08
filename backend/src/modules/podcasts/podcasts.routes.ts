import { Router } from 'express';
import { PodcastsController } from './podcasts.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();
const podcastsController = new PodcastsController();

// GET /api/v1/podcasts/level/:levelCode
router.get(
  '/level/:levelCode',
  podcastsController.getPodcastsByLevel.bind(podcastsController)
);

// GET /api/v1/podcasts/user/completions (önce bu olmalı, yoksa :id ile çakışır)
router.get(
  '/user/completions',
  authenticate,
  podcastsController.getUserCompletions.bind(podcastsController)
);

// GET /api/v1/podcasts/:id
router.get('/:id', podcastsController.getPodcastById.bind(podcastsController));

// POST /api/v1/podcasts/:id/complete
router.post(
  '/:id/complete',
  authenticate,
  podcastsController.completePodcast.bind(podcastsController)
);

export default router;
