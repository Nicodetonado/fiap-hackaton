import { Response } from 'express';
import { body, param } from 'express-validator';
import { AuthRequest } from '../middlewares/authMiddleware';
import { alunoService } from '../services/alunoService';
import { validate } from '../middlewares/validate';

export const addAlunoValidations = [
  param('id').isInt({ min: 1 }).toInt(),
  body('email').isEmail().normalizeEmail().withMessage('Email inválido'),
  body('name').optional().trim().isLength({ max: 255 }),
];

export const removeAlunoValidations = [
  param('id').isInt({ min: 1 }).toInt(),
  param('userId').isInt({ min: 1 }).toInt(),
];

export const alunoController = {
  async list(req: AuthRequest, res: Response): Promise<void> {
    const professorUserId = req.userId!;
    const role = req.userRole ?? 'professor';
    if (role !== 'professor' && role !== 'sysadmin') {
      res.status(403).json({ error: 'Acesso negado' });
      return;
    }
    const turmaId = Number(req.params.id);
    const alunos = await alunoService.listByTurma(turmaId, professorUserId);
    if (alunos === null) {
      res.status(404).json({ error: 'Turma não encontrada' });
      return;
    }
    res.json(alunos);
  },

  async add(req: AuthRequest, res: Response): Promise<void> {
    const professorUserId = req.userId!;
    const role = req.userRole ?? 'professor';
    if (role !== 'professor' && role !== 'sysadmin') {
      res.status(403).json({ error: 'Acesso negado' });
      return;
    }
    const turmaId = Number(req.params.id);
    const { email, name } = req.body;
    const aluno = await alunoService.addToTurma(turmaId, professorUserId, email, name);
    if (!aluno) {
      res.status(404).json({ error: 'Turma não encontrada' });
      return;
    }
    res.status(201).json(aluno);
  },

  async remove(req: AuthRequest, res: Response): Promise<void> {
    const professorUserId = req.userId!;
    const role = req.userRole ?? 'professor';
    if (role !== 'professor' && role !== 'sysadmin') {
      res.status(403).json({ error: 'Acesso negado' });
      return;
    }
    const turmaId = Number(req.params.id);
    const userId = Number(req.params.userId);
    const ok = await alunoService.removeFromTurma(turmaId, professorUserId, userId);
    if (!ok) {
      res.status(404).json({ error: 'Turma ou aluno não encontrado' });
      return;
    }
    res.status(204).send();
  },
};
