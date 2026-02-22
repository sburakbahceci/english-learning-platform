import { google } from 'googleapis';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import prisma from '../../config/database';
import { EmailService } from '../../services/email.service';

const emailService = new EmailService();

export class AuthService {
  private oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  // ========== GOOGLE AUTH (MEVCUT) ==========

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

  async handleGoogleCallback(code: string) {
    try {
      const { tokens } = await this.oauth2Client.getToken(code);
      this.oauth2Client.setCredentials(tokens);

      const oauth2 = google.oauth2({ version: 'v2', auth: this.oauth2Client });
      const { data } = await oauth2.userinfo.get();

      if (!data.email || !data.id) {
        throw new Error('Failed to retrieve user information from Google');
      }

      console.log('👤 Google user data:', {
        email: data.email,
        id: data.id,
        name: data.name,
      });

      let user = await prisma.user.findUnique({
        where: { googleId: data.id },
      });

      if (!user) {
        console.log('➕ Creating new user...');

        user = await prisma.user.create({
          data: {
            googleId: data.id,
            email: data.email,
            name: data.name || 'User',
            avatarUrl: data.picture,
            emailVerified: true, // Google email zaten verified
          },
        });

        console.log('✅ User created:', user.id);

        // A1 level progress
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
              totalLessons,
              lessonsCompleted: 0,
              isExamUnlocked: false,
              examsPassed: 0,
              examsFailed: 0,
            },
          });
        }
      } else {
        console.log('👤 Existing user found:', user.id);
      }

      const token = this.generateToken(user.id);

      return { user, token };
    } catch (error) {
      console.error('Google OAuth error:', error);
      throw new Error('Failed to authenticate with Google');
    }
  }

  // ========== EMAIL/PASSWORD AUTH (YENİ) ==========

  // Email ile kayıt
  async registerWithEmail(email: string, password: string, name: string) {
    try {
      // Email zaten var mı?
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        throw new Error('EMAIL_ALREADY_EXISTS');
      }

      // Password hash
      const passwordHash = await bcrypt.hash(password, 10);

      // Verification code oluştur (6 haneli)
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      const verificationCodeExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 dakika

      // User oluştur
      const user = await prisma.user.create({
        data: {
          email,
          name,
          passwordHash,
          emailVerified: false,
          verificationCode,
          verificationCodeExpires,
        },
      });

      console.log('✅ User registered:', user.id);

      // Verification email gönder
      await emailService.sendVerificationCode(email, verificationCode, name);

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          emailVerified: user.emailVerified,
        },
        message: 'Verification code sent to your email',
      };
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  }

  // Email verify
  async verifyEmail(email: string, code: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        throw new Error('USER_NOT_FOUND');
      }

      if (user.emailVerified) {
        throw new Error('EMAIL_ALREADY_VERIFIED');
      }

      if (!user.verificationCode || !user.verificationCodeExpires) {
        throw new Error('NO_VERIFICATION_CODE');
      }

      if (new Date() > user.verificationCodeExpires) {
        throw new Error('VERIFICATION_CODE_EXPIRED');
      }

      if (user.verificationCode !== code) {
        throw new Error('INVALID_VERIFICATION_CODE');
      }

      // Verify user
      await prisma.user.update({
        where: { id: user.id },
        data: {
          emailVerified: true,
          verificationCode: null,
          verificationCodeExpires: null,
        },
      });

      // A1 level progress oluştur
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
            totalLessons,
            lessonsCompleted: 0,
            isExamUnlocked: false,
            examsPassed: 0,
            examsFailed: 0,
          },
        });
      }

      const token = this.generateToken(user.id);

      return { user, token };
    } catch (error) {
      console.error('Verify email error:', error);
      throw error;
    }
  }

  // Verification code yeniden gönder
  async resendVerificationCode(email: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        throw new Error('USER_NOT_FOUND');
      }

      if (user.emailVerified) {
        throw new Error('EMAIL_ALREADY_VERIFIED');
      }

      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      const verificationCodeExpires = new Date(Date.now() + 15 * 60 * 1000);

      await prisma.user.update({
        where: { id: user.id },
        data: {
          verificationCode,
          verificationCodeExpires,
        },
      });

      await emailService.sendVerificationCode(email, verificationCode, user.name);

      return { message: 'Verification code sent' };
    } catch (error) {
      console.error('Resend code error:', error);
      throw error;
    }
  }

  // Email/Password ile login
  async loginWithEmail(email: string, password: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user || !user.passwordHash) {
        throw new Error('INVALID_CREDENTIALS');
      }

      const isValidPassword = await bcrypt.compare(password, user.passwordHash);

      if (!isValidPassword) {
        throw new Error('INVALID_CREDENTIALS');
      }

      if (!user.emailVerified) {
        throw new Error('EMAIL_NOT_VERIFIED');
      }

      const token = this.generateToken(user.id);

      return { user, token };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  // Forgot password
  async forgotPassword(email: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        // Güvenlik için her zaman başarılı mesaj dön
        return { message: 'If the email exists, a reset link has been sent' };
      }

      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 saat

      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetToken,
          resetTokenExpires,
        },
      });

      await emailService.sendPasswordResetEmail(email, resetToken, user.name);

      return { message: 'If the email exists, a reset link has been sent' };
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    }
  }

  // Reset password
  async resetPassword(token: string, newPassword: string) {
    try {
      const user = await prisma.user.findFirst({
        where: {
          resetToken: token,
          resetTokenExpires: {
            gt: new Date(),
          },
        },
      });

      if (!user) {
        throw new Error('INVALID_OR_EXPIRED_TOKEN');
      }

      const passwordHash = await bcrypt.hash(newPassword, 10);

      await prisma.user.update({
        where: { id: user.id },
        data: {
          passwordHash,
          resetToken: null,
          resetTokenExpires: null,
        },
      });

      return { message: 'Password reset successful' };
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  }

  // ========== HELPERS ==========

  private generateToken(userId: string): string {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined');
    }

    return jwt.sign({ userId, type: 'access' }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });
  }

  verifyToken(token: string): { userId: string } | null {
    try {
      if (!process.env.JWT_SECRET) {
        return null;
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET) as {
        userId: string;
        type: string;
      };

      return { userId: decoded.userId };
    } catch (error) {
      return null;
    }
  }
}