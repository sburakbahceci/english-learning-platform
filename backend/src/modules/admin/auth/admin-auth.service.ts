import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'admin-secret-key';
const SALT_ROUNDS = 10;

export class AdminAuthService {
  // Register first admin (one-time setup)
  async createFirstAdmin(email: string, password: string, name: string) {
    // Check if any admin exists
    const adminCount = await prisma.admin_users.count();

    if (adminCount > 0) {
      throw new Error('Admin users already exist. Use login instead.');
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const admin = await prisma.admin_users.create({
      data: {
        email,
        password_hash: passwordHash,
        name,
        role: 'super_admin',
      },
    });

    return {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
    };
  }

  // Admin login
  async login(email: string, password: string, ipAddress?: string) {
    const admin = await prisma.admin_users.findUnique({
      where: { email },
    });

    if (!admin) {
      throw new Error('Invalid credentials');
    }

    if (!admin.is_active) {
      throw new Error('Admin account is disabled');
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password_hash);

    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // Update last login
    await prisma.admin_users.update({
      where: { id: admin.id },
      data: { last_login: new Date() },
    });

    // Create audit log
    await prisma.admin_audit_logs.create({
      data: {
        admin_id: admin.id,
        action: 'login',
        entity_type: 'admin',
        entity_id: admin.id,
        ip_address: ipAddress,
      },
    });

    // Generate JWT token
    const token = jwt.sign(
      {
        adminId: admin.id,
        email: admin.email,
        role: admin.role,
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return {
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
    };
  }

  // Verify admin token
  async verifyToken(token: string) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as {
        adminId: string;
        email: string;
        role: string;
      };

      const admin = await prisma.admin_users.findUnique({
        where: { id: decoded.adminId },
      });

      if (!admin || !admin.is_active) {
        throw new Error('Invalid token');
      }

      return {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      };
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  // Get admin profile
  async getProfile(adminId: string) {
    const admin = await prisma.admin_users.findUnique({
      where: { id: adminId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        last_login: true,
        created_at: true,
      },
    });

    if (!admin) {
      throw new Error('Admin not found');
    }

    return admin;
  }
}
