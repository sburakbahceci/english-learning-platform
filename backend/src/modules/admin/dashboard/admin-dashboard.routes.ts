import { Router } from 'express';
import { AdminDashboardController } from './admin-dashboard.controller';
import { adminAuthenticate } from '../middleware/admin-authenticate';

const router = Router();
const dashboardController = new AdminDashboardController();

// All routes require admin authentication
router.use(adminAuthenticate);

router.get('/stats', dashboardController.getOverviewStats.bind(dashboardController));
router.get('/levels', dashboardController.getLevelStats.bind(dashboardController));
router.get('/activities', dashboardController.getRecentActivities.bind(dashboardController));
router.get('/growth', dashboardController.getUserGrowth.bind(dashboardController));
router.get('/top-users', dashboardController.getTopUsers.bind(dashboardController));

export default router;