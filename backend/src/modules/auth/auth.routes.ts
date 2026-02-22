import { Router } from 'express';
import { AuthController } from './auth.controller';

const router = Router();
const authController = new AuthController();

// ========== GOOGLE AUTH ==========
router.get('/google', authController.getGoogleAuthUrl.bind(authController));
router.get(
  '/google/callback',
  authController.handleGoogleCallback.bind(authController)
);

// ========== EMAIL/PASSWORD AUTH ==========
router.post('/register', authController.register.bind(authController));
router.post('/verify-email', authController.verifyEmail.bind(authController));
router.post(
  '/resend-code',
  authController.resendVerificationCode.bind(authController)
);
router.post('/login', authController.login.bind(authController));
router.post(
  '/forgot-password',
  authController.forgotPassword.bind(authController)
);
router.post(
  '/reset-password',
  authController.resetPassword.bind(authController)
);

// ========== HELPERS ==========
router.get('/verify', authController.verifyToken.bind(authController));

export default router;
