import { Request, Response } from 'express';
import { AuthService } from './auth.service';

const authService = new AuthService();

export class AuthController {
  // GET /api/v1/auth/google - Get Google OAuth URL
  getGoogleAuthUrl(_req: Request, res: Response) {
    try {
      const url = authService.getAuthUrl();
      res.json({ success: true, url });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to generate auth URL',
      });
    }
  }

  // GET /api/v1/auth/google/callback - Handle OAuth callback
  async handleGoogleCallback(req: Request, res: Response) {
    try {
      const { code } = req.query;

      if (!code || typeof code !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'Authorization code is required',
        });
      }

      const { user, token } = await authService.handleGoogleCallback(code);

      // Redirect to frontend with token
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
    } catch (error) {
      console.error('OAuth callback error:', error);
      res.status(500).json({
        success: false,
        error: 'Authentication failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // GET /api/v1/auth/verify - Verify JWT token
  async verifyToken(req: Request, res: Response) {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          success: false,
          error: 'No token provided',
        });
      }

      const token = authHeader.substring(7);
      const payload = authService.verifyToken(token);

      if (!payload) {
        return res.status(401).json({
          success: false,
          error: 'Invalid or expired token',
        });
      }

      res.json({
        success: true,
        userId: payload.userId,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Token verification failed',
      });
    }
  }
}
