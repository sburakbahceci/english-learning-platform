import { Router } from 'express';
import { ReadingController } from './reading.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();
const readingController = new ReadingController();

// GET /api/v1/reading/level/:levelCode
router.get(
  '/level/:levelCode',
  readingController.getPassagesByLevel.bind(readingController)
);

// GET /api/v1/reading/user/completions
router.get(
  '/user/completions',
  authenticate,
  readingController.getUserCompletions.bind(readingController)
);

// GET /api/v1/reading/:id
router.get('/:id', readingController.getPassageById.bind(readingController));

// POST /api/v1/reading/:id/complete
router.post(
  '/:id/complete',
  authenticate,
  readingController.completeReading.bind(readingController)
);

export default router;
