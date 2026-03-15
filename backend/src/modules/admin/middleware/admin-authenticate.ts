import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'admin-secret-key';

interface AdminJwtPayload {
  adminId: string;
  email: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      adminId?: string;
      adminEmail?: string;
      adminRole?: string;
    }
  }
}

export const adminAuthenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No admin token provided',
      });
    }

    const token = authHeader.substring(7);

    const decoded = jwt.verify(token, ADMIN_JWT_SECRET) as AdminJwtPayload;

    req.adminId = decoded.adminId;
    req.adminEmail = decoded.email;
    req.adminRole = decoded.role;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired admin token',
    });
  }
};

// Role-based access control
export const requireRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const adminRole = req.adminRole;

    if (!adminRole || !allowedRoles.includes(adminRole)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
      });
    }

    next();
  };
};