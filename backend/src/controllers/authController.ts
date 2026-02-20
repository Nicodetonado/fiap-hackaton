import { Request, Response } from 'express';
import { body } from 'express-validator';
import { authService } from '../services/authService';
import { loginLogRepository } from '../repositories/loginLogRepository';
import type { AuthRequest } from '../middlewares/authMiddleware';

export const registerValidations = [
  body('email').isEmail().normalizeEmail().withMessage('Email inválido'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Senha deve ter no mínimo 6 caracteres'),
  body('name')
    .trim()
    .notEmpty()
    .isLength({ max: 255 })
    .withMessage('Nome é obrigatório (máx. 255 caracteres)'),
];

export const loginValidations = [
  body('email').isEmail().normalizeEmail().withMessage('Email inválido'),
  body('password').notEmpty().withMessage('Senha é obrigatória'),
];

export const changePasswordValidations = [
  body('currentPassword').notEmpty().withMessage('Senha atual é obrigatória'),
  body('newPassword').isLength({ min: 6 }).withMessage('Nova senha deve ter no mínimo 6 caracteres'),
];

function getClientIp(req: Request): string | null {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') return forwarded.split(',')[0]?.trim() ?? null;
  return (req.socket?.remoteAddress as string) ?? null;
}

export const authController = {
  async register(req: Request, res: Response): Promise<void> {
    const { email, password, name } = req.body;
    const result = await authService.register(email, password, name);
    res.status(201).json(result);
  },

  async login(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    const ip = getClientIp(req);
    try {
      await loginLogRepository.insert(
        result.user.id,
        result.user.email,
        result.user.role,
        ip
      );
    } catch (err) {
      console.error('Falha ao registrar log de login:', err);
    }
    console.log(
      `[LOG ENTRADA] user_id=${result.user.id} email=${result.user.email} role=${result.user.role} ip=${ip ?? '-'}`
    );
    res.json(result);
  },

  async changePassword(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.userId!;
    const { currentPassword, newPassword } = req.body;
    await authService.changePassword(userId, currentPassword, newPassword);
    res.status(204).send();
  },
};
