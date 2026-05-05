import { Request, Response, NextFunction } from 'express';
import jwt, { Secret } from 'jsonwebtoken';

const JWT_SECRET: Secret = process.env.JWT_SECRET || 'change_me_in_production';

export interface AuthRequest extends Request {
  user?: {
    sub: string;
    email: string;
    role: string;
  };
}

/**
 * Middleware to verify JWT token and attach user info to request
 */
export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authorization token is required' });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    const decoded = jwt.verify(token, JWT_SECRET) as {
      sub: string;
      email: string;
      role: string;
    };

    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: 'Token has expired' });
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Middleware to check if user has required role
 */
export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: 'Forbidden: You do not have permission to access this resource'
      });
    }

    next();
  };
};

/**
 * Middleware to check resource ownership
 * User can only access their own resources, unless they're admin
 */
export const checkOwnership = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Admin can access everything
    if (req.user.role === 'admin') {
      return next();
    }

    // Extract userId from request body or query
    const requestedUserId = req.body?.userId || req.query?.userId;

    // If no userId specified, allow (pagination or filtering)
    if (!requestedUserId) {
      return next();
    }

    // User can only access their own resources
    if (requestedUserId !== req.user.sub) {
      return res.status(403).json({
        message: 'Forbidden: You can only access your own resources'
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};
