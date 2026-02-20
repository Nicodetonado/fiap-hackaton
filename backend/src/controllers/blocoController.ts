import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { blocoService } from '../services/blocoService';

export const blocoController = {
  async list(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.userId!;
    const turmaId = Number(req.params.turmaId);
    const blocos = await blocoService.listByTurma(turmaId, userId);
    res.json(blocos);
  },

  async create(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.userId!;
    const turmaId = Number(req.params.turmaId);
    const { name, order } = req.body;
    const bloco = await blocoService.create(turmaId, userId, { name, order });
    if (!bloco) {
      res.status(404).json({ error: 'Turma não encontrada' });
      return;
    }
    res.status(201).json(bloco);
  },

  async update(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.userId!;
    const id = Number(req.params.id);
    const { name, order } = req.body;
    const bloco = await blocoService.update(id, userId, { name, order });
    if (!bloco) {
      res.status(404).json({ error: 'Bloco não encontrado' });
      return;
    }
    res.json(bloco);
  },

  async delete(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.userId!;
    const id = Number(req.params.id);
    const ok = await blocoService.delete(id, userId);
    if (!ok) {
      res.status(404).json({ error: 'Bloco não encontrado' });
      return;
    }
    res.status(204).send();
  },
};
