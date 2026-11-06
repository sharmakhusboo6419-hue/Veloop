import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'veloop_secure_jwt_secret_key_2026';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role?: string;
    isAdmin?: boolean;
  };
}

export function verifyUserToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1] || req.cookies?.token;

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch (ex) {
    res.status(403).json({ error: 'Invalid or expired token.' });
  }
}

export function verifyAdminToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1] || req.cookies?.adminToken;

  if (!token) {
    return res.status(401).json({ error: 'Admin access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (!decoded.isAdmin && decoded.role !== 'super_admin' && decoded.role !== 'moderator') {
      return res.status(403).json({ error: 'Insufficient admin privileges.' });
    }
    req.user = decoded;
    next();
  } catch (ex) {
    res.status(403).json({ error: 'Invalid or expired admin token.' });
  }
}
