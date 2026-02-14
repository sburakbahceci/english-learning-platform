import { Request, Response } from 'express';
import { UsersService } from './users.service';

const usersService = new UsersService();

export class UsersController {
  async getProfile(req: Request, res: Response) {
    try {
      if (!req.userId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
        });
      }

      const profile = await usersService.getUserProfile(req.userId);

      res.json({
        success: true,
        data: profile,
      });
    } catch (error) {
      const statusCode =
        error instanceof Error && error.message === 'User not found'
          ? 404
          : 500;

      res.status(statusCode).json({
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to get user profile',
      });
    }
  }

  async updateProfile(req: Request, res: Response) {
    try {
      if (!req.userId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
        });
      }

      const { name } = req.body;

      if (!name || typeof name !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'Name is required',
        });
      }

      const user = await usersService.updateUserProfile(req.userId, { name });

      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to update profile',
      });
    }
  }
}
