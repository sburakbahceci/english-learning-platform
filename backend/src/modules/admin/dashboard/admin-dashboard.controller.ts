import { Request, Response } from 'express';
import { AdminDashboardService } from './admin-dashboard.service';

const dashboardService = new AdminDashboardService();

export class AdminDashboardController {
  // GET /api/v1/admin/dashboard/stats
  async getOverviewStats(req: Request, res: Response) {
    try {
      const stats = await dashboardService.getOverviewStats();

      res.json({
        success: true,
        data: stats,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // GET /api/v1/admin/dashboard/levels
  async getLevelStats(req: Request, res: Response) {
    try {
      const stats = await dashboardService.getLevelStats();

      res.json({
        success: true,
        data: stats,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // GET /api/v1/admin/dashboard/activities
  async getRecentActivities(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const activities = await dashboardService.getRecentActivities(limit);

      res.json({
        success: true,
        data: activities,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // GET /api/v1/admin/dashboard/growth
  async getUserGrowth(req: Request, res: Response) {
    try {
      const data = await dashboardService.getUserGrowthData();

      res.json({
        success: true,
        data,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // GET /api/v1/admin/dashboard/top-users
  async getTopUsers(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const users = await dashboardService.getTopUsersByXP(limit);

      res.json({
        success: true,
        data: users,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}
