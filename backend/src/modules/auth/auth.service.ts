import { google } from 'googleapis';
import jwt from 'jsonwebtoken';
import prisma from '../../config/database';

export class AuthService {
  private oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  // Generate Google OAuth URL
  getAuthUrl(): string {
    const scopes = [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
    ];

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent',
    });
  }

  // Handle Google OAuth Callback
  async handleGoogleCallback(code: string) {
    try {
      // Exchange code for tokens
      const { tokens } = await this.oauth2Client.getToken(code);
      this.oauth2Client.setCredentials(tokens);

      // Get user info
      const oauth2 = google.oauth2({ version: 'v2', auth: this.oauth2Client });
      const { data } = await oauth2.userinfo.get();

      if (!data.email || !data.id) {
        throw new Error('Failed to retrieve user information from Google');
      }

      // Find or create user
      let user = await prisma.user.findUnique({
        where: { googleId: data.id },
      });

      if (!user) {
        // Create new user
        user = await prisma.user.create({
          data: {
            googleId: data.id,
            email: data.email,
            name: data.name || 'User',
            avatarUrl: data.picture,
          },
        });

        // Initialize A1 level progress for new user
        const a1Level = await prisma.level.findFirst({
          where: { code: 'A1' },
        });

        if (a1Level) {
          const totalLessons = await prisma.lesson.count({
            where: { levelId: a1Level.id },
          });

          await prisma.userProgress.create({
            data: {
              userId: user.id,
              levelId: a1Level.id,
              status: 'in_progress',
              totalLessons,
            },
          });
        }
      }

      // Generate JWT token
      const token = this.generateToken(user.id);

      return { user, token };
    } catch (error) {
      console.error('Google OAuth error:', error);
      throw new Error('Failed to authenticate with Google');
    }
  }

  // Generate JWT Token
  private generateToken(userId: string): string {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined');
    }

    return jwt.sign({ userId, type: 'access' }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });
  }

  // Verify JWT Token
  verifyToken(token: string): { userId: string } | null {
    try {
      if (!process.env.JWT_SECRET) {
        return null;
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET) as any;
      return { userId: decoded.userId };
    } catch (error) {
      return null;
    }
  }
}
