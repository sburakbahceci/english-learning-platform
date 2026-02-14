import { Router } from 'express';
import { AuthController } from './auth.controller';

const router = Router();
const authController = new AuthController();

// GET /api/v1/auth/google - Get Google OAuth URL
router.get('/google', (req, res) => authController.getGoogleAuthUrl(req, res));

// GET /api/v1/auth/google/callback - OAuth callback
router.get('/google/callback', (req, res) =>
  authController.handleGoogleCallback(req, res)
);

// GET /api/v1/auth/verify - Verify token
router.get('/verify', (req, res) => authController.verifyToken(req, res));

export default router;
