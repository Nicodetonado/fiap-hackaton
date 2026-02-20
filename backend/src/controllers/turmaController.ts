import { Response } from 'express';
import { body, param } from 'express-validator';
import { AuthRequest } from '../middlewares/authMiddleware';
import { turmaService } from '../services/turmaService';

const materialTypes = ['video', 'reading', 'exercise', 'test', 'other'];

export const createTurmaValidations = [
  body('name').trim().notEmpty().isLength({ max: 255 }).withMessage('Nome da turma é obrigatório'),
  body('subject').trim().notEmpty().isLength({ max: 255 }).withMessage('Disciplina é obrigatória'),
  body('slug').optional().trim().isLength({ max: 255 }),
  body('description').optional().trim().isLength({ max: 2000 }),
];

export const updateTurmaValidations = [
  param('id').isInt({ min: 1 }).toInt(),
  body('name').optional().trim().notEmpty().isLength({ max: 255 }),
  body('subject').optional().trim().notEmpty().isLength({ max: 255 }),
  body('description').optional().trim().isLength({ max: 2000 }),
];

export const idParamValidation = [param('id').isInt({ min: 1 }).toInt()];

export const turmaIdParamValidation = [param('turmaId').isInt({ min: 1 }).toInt()];

export const createBlocoValidations = [
  param('turmaId').isInt({ min: 1 }).toInt(),
  body('name').trim().notEmpty().isLength({ max: 255 }).withMessage('Nome do bloco é obrigatório'),
  body('order').optional().isInt({ min: 0 }).toInt(),
];

export const updateBlocoValidations = [
  param('id').isInt({ min: 1 }).toInt(),
  body('name').optional().trim().notEmpty().isLength({ max: 255 }),
  body('order').optional().isInt({ min: 0 }).toInt(),
];

export const blocoIdParamValidation = [param('blocoId').isInt({ min: 1 }).toInt()];

export const createMaterialValidations = [
  param('blocoId').isInt({ min: 1 }).toInt(),
  body('title').trim().notEmpty().isLength({ max: 500 }).withMessage('Título é obrigatório'),
  body('type').isIn(materialTypes).withMessage('Tipo deve ser: video, reading, exercise, test, other'),
  body('url').isURL().withMessage('URL inválida'),
  body('instruction').optional().trim().isLength({ max: 1000 }),
  body('order').optional().isInt({ min: 0 }).toInt(),
];

export const updateMaterialValidations = [
  param('id').isInt({ min: 1 }).toInt(),
  body('title').optional().trim().notEmpty().isLength({ max: 500 }),
  body('type').optional().isIn(materialTypes),
  body('url').optional().isURL(),
  body('instruction').optional().trim().isLength({ max: 1000 }),
  body('order').optional().isInt({ min: 0 }).toInt(),
];

export const materialIdParamValidation = [param('id').isInt({ min: 1 }).toInt()];

export const slugParamValidation = [param('slug').trim().notEmpty()];
export const linkTokenParamValidation = [param('linkToken').trim().notEmpty()];

export const turmaController = {
  async list(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.userId!;
    const role = req.userRole ?? 'professor';
    const turmas = await turmaService.listForUser(userId, role);
    res.json(turmas);
  },

  async getById(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.userId!;
    const role = req.userRole ?? 'professor';
    const id = Number(req.params.id);
    const turma = await turmaService.getById(id, userId, role);
    if (!turma) {
      res.status(404).json({ error: 'Turma não encontrada' });
      return;
    }
    res.json(turma);
  },

  async create(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.userId!;
    const role = req.userRole ?? 'professor';
    if (role !== 'professor' && role !== 'sysadmin') {
      res.status(403).json({ error: 'Apenas professores podem criar turmas' });
      return;
    }
    const { name, subject, slug, description } = req.body;
    const turma = await turmaService.create(userId, { name, subject, slug, description });
    res.status(201).json(turma);
  },

  async update(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.userId!;
    const role = req.userRole ?? 'professor';
    const id = Number(req.params.id);
    const { name, subject, description } = req.body;
    const turma = await turmaService.update(id, userId, role, { name, subject, description });
    if (!turma) {
      res.status(404).json({ error: 'Turma não encontrada' });
      return;
    }
    res.json(turma);
  },

  async delete(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.userId!;
    const role = req.userRole ?? 'professor';
    const id = Number(req.params.id);
    const ok = await turmaService.delete(id, userId, role);
    if (!ok) {
      res.status(404).json({ error: 'Turma não encontrada' });
      return;
    }
    res.status(204).send();
  },

  async getPublicByLinkToken(req: AuthRequest, res: Response): Promise<void> {
    const linkToken = String(req.params.linkToken);
    const turma = await turmaService.getPublicByLinkToken(linkToken);
    if (!turma) {
      res.status(404).json({ error: 'Turma não encontrada' });
      return;
    }
    res.json(turma);
  },
};
