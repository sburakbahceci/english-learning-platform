import { Router } from 'express';
import { AdminAuthController } from './admin-auth.controller';
import { adminAuthenticate } from '../middleware/admin-authenticate';

const router = Router();
const adminAuthController = new AdminAuthController();

// Public routes
router.post('/setup', adminAuthController.setup.bind(adminAuthController));
router.post('/login', adminAuthController.login.bind(adminAuthController));

// Protected routes
router.get(
  '/me',
  adminAuthenticate,
  adminAuthController.getProfile.bind(adminAuthController)
);

export default router;
