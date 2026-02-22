import nodemailer from 'nodemailer';

// Email transporter (development için console, production için gerçek SMTP)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export class EmailService {
  // Verification code gönder
  async sendVerificationCode(email: string, code: string, name: string) {
    try {
      // Development'ta console'a yaz
      if (process.env.NODE_ENV === 'development') {
        console.log('📧 Email Verification Code:', code);
        console.log('To:', email);
        return { success: true };
      }

      // Production'da gerçek email gönder
      await transporter.sendMail({
        from: `"Lingoria" <${process.env.SMTP_USER}>`,
        to: email,
        subject: 'Verify Your Lingoria Account',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Welcome to Lingoria, ${name}! 🎉</h2>
            <p>Thank you for signing up. Please verify your email address with this code:</p>
            <div style="background: #f0f0f0; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
              ${code}
            </div>
            <p>This code will expire in 15 minutes.</p>
            <p>If you didn't create an account, please ignore this email.</p>
            <hr>
            <p style="color: #666; font-size: 12px;">Lingoria - AI-Powered English Learning Platform</p>
          </div>
        `,
      });

      return { success: true };
    } catch (error) {
      console.error('Email send error:', error);
      return { success: false };
    }
  }

  // Password reset email
  async sendPasswordResetEmail(
    email: string,
    resetToken: string,
    name: string
  ) {
    try {
      const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

      // Development
      if (process.env.NODE_ENV === 'development') {
        console.log('🔐 Password Reset Link:', resetUrl);
        console.log('To:', email);
        return { success: true };
      }

      // Production
      await transporter.sendMail({
        from: `"Lingoria" <${process.env.SMTP_USER}>`,
        to: email,
        subject: 'Reset Your Lingoria Password',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Password Reset Request</h2>
            <p>Hi ${name},</p>
            <p>We received a request to reset your password. Click the button below to reset it:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background: #6366f1; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Reset Password
              </a>
            </div>
            <p>Or copy and paste this link:</p>
            <p style="color: #666; word-break: break-all;">${resetUrl}</p>
            <p>This link will expire in 1 hour.</p>
            <p>If you didn't request a password reset, please ignore this email.</p>
            <hr>
            <p style="color: #666; font-size: 12px;">Lingoria - AI-Powered English Learning Platform</p>
          </div>
        `,
      });

      return { success: true };
    } catch (error) {
      console.error('Email send error:', error);
      return { success: false };
    }
  }
}
