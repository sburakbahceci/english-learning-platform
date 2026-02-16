import { Router } from 'express';
import { LessonsController } from './lessons.controller';
import { authenticate } from '../../shared/middleware/auth.middleware';

const router = Router();
const lessonsController = new LessonsController();

// GET /api/v1/lessons/level/:levelId - Get lessons for a level
router.get('/level/:levelId', (req, res) =>
  lessonsController.getLessonsByLevel(req, res)
);

// GET /api/v1/lessons/:lessonId - Get single lesson
router.get('/:lessonId', (req, res) =>
  lessonsController.getLessonById(req, res)
);

// POST /api/v1/lessons/:lessonId/complete - Complete lesson (protected)
router.post('/:lessonId/complete', authenticate, (req, res) =>
  lessonsController.completeLesson(req, res)
);

// GET /api/v1/lessons/level/:levelId/completions - Get user's completions (protected)
router.get('/level/:levelId/completions', authenticate, (req, res) =>
  lessonsController.getUserCompletions(req, res)
);

export default router;
