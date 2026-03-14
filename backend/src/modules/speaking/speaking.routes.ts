import { Router } from 'express';
import { SpeakingController } from './speaking.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();
const speakingController = new SpeakingController();

// Public routes
router.get(
  '/level/:levelCode',
  speakingController.getTasksByLevel.bind(speakingController)
);
router.get('/:taskId', speakingController.getTaskById.bind(speakingController));

// Protected routes
router.post(
  '/submit',
  authenticate,
  speakingController.submitAttempt.bind(speakingController)
);
router.get(
  '/user/attempts',
  authenticate,
  speakingController.getUserAttempts.bind(speakingController)
);
router.get(
  '/attempt/:attemptId',
  authenticate,
  speakingController.getAttemptById.bind(speakingController)
);
router.get(
  '/progress/:levelCode',
  authenticate,
  speakingController.getUserProgress.bind(speakingController)
);

export default router;
