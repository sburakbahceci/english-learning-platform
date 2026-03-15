import { Request, Response } from 'express';
import { AdminAuthService } from './admin-auth.service';

const adminAuthService = new AdminAuthService();

export class AdminAuthController {
  // POST /api/v1/admin/auth/setup (One-time admin creation)
  async setup(req: Request, res: Response) {
    try {
      const { email, password, name } = req.body;

      if (!email || !password || !name) {
        return res.status(400).json({
          success: false,
          message: 'Email, password, and name are required',
        });
      }

      const admin = await adminAuthService.createFirstAdmin(
        email,
        password,
        name
      );

      res.status(201).json({
        success: true,
        message: 'Admin created successfully',
        data: admin,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // POST /api/v1/admin/auth/login
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email and password are required',
        });
      }

      const ipAddress = req.ip || req.socket.remoteAddress;
      const result = await adminAuthService.login(email, password, ipAddress);

      res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      res.status(401).json({
        success: false,
        message: error.message,
      });
    }
  }

  // GET /api/v1/admin/auth/me
  async getProfile(req: Request, res: Response) {
    try {
      const adminId = req.adminId;

      if (!adminId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
      }

      const profile = await adminAuthService.getProfile(adminId);

      res.json({
        success: true,
        data: profile,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
}
