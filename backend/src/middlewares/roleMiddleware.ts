import { Response, NextFunction } from 'express';
import type { AuthRequest } from './authMiddleware';
import type { UserRole } from '../models/entities';

export function requireRole(...allowed: UserRole[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    const role = req.userRole;
    if (!role || !allowed.includes(role)) {
      res.status(403).json({ error: 'Acesso negado' });
      return;
    }
    next();
  };
}
