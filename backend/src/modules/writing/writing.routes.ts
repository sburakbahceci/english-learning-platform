import { Router } from 'express';
import { WritingController } from './writing.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();
const writingController = new WritingController();

// GET /api/v1/writing/level/:levelCode
router.get(
  '/level/:levelCode',
  writingController.getPromptsByLevel.bind(writingController)
);

// GET /api/v1/writing/prompt/:id
router.get(
  '/prompt/:id',
  writingController.getPromptById.bind(writingController)
);

// GET /api/v1/writing/user/submissions
router.get(
  '/user/submissions',
  authenticate,
  writingController.getUserSubmissions.bind(writingController)
);

// GET /api/v1/writing/submission/:id
router.get(
  '/submission/:id',
  authenticate,
  writingController.getSubmissionById.bind(writingController)
);

// POST /api/v1/writing/submit
router.post(
  '/submit',
  authenticate,
  writingController.submitWriting.bind(writingController)
);

export default router;
