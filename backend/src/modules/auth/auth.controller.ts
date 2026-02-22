import { Request, Response } from 'express';
import { AuthService } from './auth.service';

const authService = new AuthService();

export class AuthController {
  // ========== GOOGLE AUTH (MEVCUT) ==========

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

  // ========== EMAIL/PASSWORD AUTH (YENİ) ==========

  // POST /api/v1/auth/register
  async register(req: Request, res: Response) {
    try {
      const { email, password, name } = req.body;

      if (!email || !password || !name) {
        return res.status(400).json({
          success: false,
          error: 'Email, password, and name are required',
        });
      }

      if (password.length < 8) {
        return res.status(400).json({
          success: false,
          error: 'Password must be at least 8 characters',
        });
      }

      const result = await authService.registerWithEmail(email, password, name);

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'EMAIL_ALREADY_EXISTS') {
        return res.status(409).json({
          success: false,
          error: 'Email already exists',
        });
      }

      console.error('Register error:', error);
      res.status(500).json({
        success: false,
        error: 'Registration failed',
      });
    }
  }

  // POST /api/v1/auth/verify-email
  async verifyEmail(req: Request, res: Response) {
    try {
      const { email, code } = req.body;

      if (!email || !code) {
        return res.status(400).json({
          success: false,
          error: 'Email and verification code are required',
        });
      }

      const { user, token } = await authService.verifyEmail(email, code);

      res.json({
        success: true,
        data: { user, token },
      });
    } catch (error) {
      if (error instanceof Error) {
        const errorMessages: Record<string, string> = {
          USER_NOT_FOUND: 'User not found',
          EMAIL_ALREADY_VERIFIED: 'Email already verified',
          NO_VERIFICATION_CODE: 'No verification code found',
          VERIFICATION_CODE_EXPIRED: 'Verification code expired',
          INVALID_VERIFICATION_CODE: 'Invalid verification code',
        };

        const message = errorMessages[error.message] || 'Verification failed';

        return res.status(400).json({
          success: false,
          error: message,
        });
      }

      res.status(500).json({
        success: false,
        error: 'Verification failed',
      });
    }
  }

  // POST /api/v1/auth/resend-code
  async resendVerificationCode(req: Request, res: Response) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          error: 'Email is required',
        });
      }

      const result = await authService.resendVerificationCode(email);

      res.json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to resend code',
      });
    }
  }

  // POST /api/v1/auth/login
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: 'Email and password are required',
        });
      }

      const { user, token } = await authService.loginWithEmail(email, password);

      res.json({
        success: true,
        data: { user, token },
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'INVALID_CREDENTIALS') {
          return res.status(401).json({
            success: false,
            error: 'Invalid email or password',
          });
        }

        if (error.message === 'EMAIL_NOT_VERIFIED') {
          return res.status(403).json({
            success: false,
            error: 'Please verify your email first',
          });
        }
      }

      res.status(500).json({
        success: false,
        error: 'Login failed',
      });
    }
  }

  // POST /api/v1/auth/forgot-password
  async forgotPassword(req: Request, res: Response) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          error: 'Email is required',
        });
      }

      const result = await authService.forgotPassword(email);

      res.json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to process request',
      });
    }
  }

  // POST /api/v1/auth/reset-password
  async resetPassword(req: Request, res: Response) {
    try {
      const { token, password } = req.body;

      if (!token || !password) {
        return res.status(400).json({
          success: false,
          error: 'Token and password are required',
        });
      }

      if (password.length < 8) {
        return res.status(400).json({
          success: false,
          error: 'Password must be at least 8 characters',
        });
      }

      const result = await authService.resetPassword(token, password);

      res.json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === 'INVALID_OR_EXPIRED_TOKEN'
      ) {
        return res.status(400).json({
          success: false,
          error: 'Invalid or expired reset token',
        });
      }

      res.status(500).json({
        success: false,
        error: 'Failed to reset password',
      });
    }
  }

  // ========== HELPERS ==========

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
