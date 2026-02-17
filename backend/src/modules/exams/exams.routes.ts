import { Router } from 'express';
import { ExamsController } from './exams.controller';
import { authenticate } from '../../shared/middleware/auth.middleware';

const router = Router();
const examsController = new ExamsController();

// All routes require authentication
router.use(authenticate);

// POST /api/v1/exams/levels/:levelId/start
router.post('/levels/:levelId/start', (req, res) =>
  examsController.startExam(req, res)
);

// POST /api/v1/exams/:examId/submit
router.post('/:examId/submit', (req, res) =>
  examsController.submitExam(req, res)
);

// GET /api/v1/exams/:examId/results
router.get('/:examId/results', (req, res) =>
  examsController.getResults(req, res)
);

// GET /api/v1/exams/levels/:levelId/attempts
router.get('/levels/:levelId/attempts', (req, res) =>
  examsController.getAttempts(req, res)
);

export default router;
