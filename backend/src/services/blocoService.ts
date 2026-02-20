import {
  turmaRepository,
  blocoRepository,
} from '../repositories/turmaRepository';
import type { Bloco } from '../models/entities';

export const blocoService = {
  async listByTurma(turmaId: number, userId: number): Promise<Bloco[]> {
    const turma = await turmaRepository.findById(turmaId);
    if (!turma || turma.user_id !== userId) return [];
    return blocoRepository.findByTurmaId(turmaId);
  },

  async create(
    turmaId: number,
    userId: number,
    data: { name: string; order?: number }
  ): Promise<Bloco | null> {
    const turma = await turmaRepository.findById(turmaId);
    if (!turma || turma.user_id !== userId) return null;
    const order = data.order ?? 0;
    return blocoRepository.create(turmaId, data.name, order);
  },

  async update(
    id: number,
    userId: number,
    data: { name?: string; order?: number }
  ): Promise<Bloco | null> {
    const bloco = await blocoRepository.findById(id);
    if (!bloco) return null;
    const turma = await turmaRepository.findById(bloco.turma_id);
    if (!turma || turma.user_id !== userId) return null;
    return blocoRepository.update(id, data);
  },

  async delete(id: number, userId: number): Promise<boolean> {
    const bloco = await blocoRepository.findById(id);
    if (!bloco) return false;
    const turma = await turmaRepository.findById(bloco.turma_id);
    if (!turma || turma.user_id !== userId) return false;
    return blocoRepository.delete(id);
  },
};
