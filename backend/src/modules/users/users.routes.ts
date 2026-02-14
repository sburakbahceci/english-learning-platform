import { Router } from 'express';
import { UsersController } from './users.controller';
import { authenticate } from '../../shared/middleware/auth.middleware';

const router = Router();
const usersController = new UsersController();

// All routes require authentication
router.use(authenticate);

// GET /api/v1/users/me - Get current user profile
router.get('/me', (req, res) => usersController.getProfile(req, res));

// PATCH /api/v1/users/me - Update current user profile
router.patch('/me', (req, res) => usersController.updateProfile(req, res));

export default router;
