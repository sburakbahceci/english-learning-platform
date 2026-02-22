import { Router } from 'express';
import { AiController } from './ai.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();
const aiController = new AiController();

// All routes require authentication
router.use(authenticate);

// POST /api/v1/ai/chat
router.post('/chat', aiController.sendMessage.bind(aiController));

// POST /api/v1/ai/explain-answer
router.post('/explain-answer', aiController.explainAnswer.bind(aiController));

// GET /api/v1/ai/sessions
router.get('/sessions', aiController.getUserSessions.bind(aiController));

// GET /api/v1/ai/sessions/:sessionId/history
router.get(
  '/sessions/:sessionId/history',
  aiController.getChatHistory.bind(aiController)
);

// DELETE /api/v1/ai/sessions/:sessionId
router.delete(
  '/sessions/:sessionId',
  aiController.deleteSession.bind(aiController)
);

// POST /api/v1/ai/sessions/new
router.post('/sessions/new', aiController.createNewSession.bind(aiController));

export default router;
