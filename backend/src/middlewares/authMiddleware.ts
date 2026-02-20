import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { userRepository } from '../repositories/userRepository';
import type { UserRole } from '../models/entities';

export interface JwtPayload {
  userId: number;
  role?: UserRole;
}

export interface AuthRequest extends Request {
  userId?: number;
  userRole?: UserRole;
}

export async function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Token não informado' });
    return;
  }
  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, env.jwt.secret) as JwtPayload;
    req.userId = payload.userId;
    req.userRole = payload.role;
    if (!payload.role) {
      const user = await userRepository.findById(payload.userId);
      if (user) req.userRole = user.role;
    }
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido ou expirado' });
  }
}
