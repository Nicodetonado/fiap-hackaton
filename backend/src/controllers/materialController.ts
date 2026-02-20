import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { materialService } from '../services/materialService';

export const materialController = {
  async list(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.userId!;
    const blocoId = Number(req.params.blocoId);
    const materiais = await materialService.listByBloco(blocoId, userId);
    res.json(materiais);
  },

  async create(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.userId!;
    const blocoId = Number(req.params.blocoId);
    const { title, type, url, instruction, order } = req.body;
    const material = await materialService.create(blocoId, userId, {
      title,
      type,
      url,
      instruction,
      order,
    });
    if (!material) {
      res.status(404).json({ error: 'Bloco não encontrado' });
      return;
    }
    res.status(201).json(material);
  },

  async update(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.userId!;
    const id = Number(req.params.id);
    const { title, type, url, instruction, order } = req.body;
    const material = await materialService.update(id, userId, {
      title,
      type,
      url,
      instruction,
      order,
    });
    if (!material) {
      res.status(404).json({ error: 'Material não encontrado' });
      return;
    }
    res.json(material);
  },

  async delete(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.userId!;
    const id = Number(req.params.id);
    const ok = await materialService.delete(id, userId);
    if (!ok) {
      res.status(404).json({ error: 'Material não encontrado' });
      return;
    }
    res.status(204).send();
  },
};
