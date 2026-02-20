import { Response } from 'express';
import { body } from 'express-validator';
import { AuthRequest } from '../middlewares/authMiddleware';
import { turmaRepository } from '../repositories/turmaRepository';
import { adminService } from '../services/adminService';
import { validate } from '../middlewares/validate';

export const createUserValidations = [
  body('email').isEmail().normalizeEmail().withMessage('Email inválido'),
  body('password').isLength({ min: 6 }).withMessage('Senha mín. 6 caracteres'),
  body('name').trim().notEmpty().isLength({ max: 255 }).withMessage('Nome obrigatório'),
  body('role').isIn(['professor', 'aluno']).withMessage('Role deve ser professor ou aluno'),
];

export const adminController = {
  async listTurmas(_req: AuthRequest, res: Response): Promise<void> {
    const turmas = await turmaRepository.findAllWithOwner();
    res.json(turmas);
  },

  async createUser(req: AuthRequest, res: Response): Promise<void> {
    const { email, password, name, role } = req.body;
    const user = await adminService.createUser(email, password, name, role);
    res.status(201).json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });
  },
};
