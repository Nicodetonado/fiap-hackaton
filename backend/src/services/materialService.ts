import {
  turmaRepository,
  blocoRepository,
  materialRepository,
} from '../repositories/turmaRepository';
import type { Material, MaterialType } from '../models/entities';

export const materialService = {
  async listByBloco(blocoId: number, userId: number): Promise<Material[]> {
    const bloco = await blocoRepository.findById(blocoId);
    if (!bloco) return [];
    const turma = await turmaRepository.findById(bloco.turma_id);
    if (!turma || turma.user_id !== userId) return [];
    return materialRepository.findByBlocoId(blocoId);
  },

  async create(
    blocoId: number,
    userId: number,
    data: {
      title: string;
      type: MaterialType;
      url: string;
      instruction?: string | null;
      order?: number;
    }
  ): Promise<Material | null> {
    const bloco = await blocoRepository.findById(blocoId);
    if (!bloco) return null;
    const turma = await turmaRepository.findById(bloco.turma_id);
    if (!turma || turma.user_id !== userId) return null;
    return materialRepository.create(blocoId, data);
  },

  async update(
    id: number,
    userId: number,
    data: {
      title?: string;
      type?: MaterialType;
      url?: string;
      instruction?: string | null;
      order?: number;
    }
  ): Promise<Material | null> {
    const material = await materialRepository.findById(id);
    if (!material) return null;
    const bloco = await blocoRepository.findById(material.bloco_id);
    if (!bloco) return null;
    const turma = await turmaRepository.findById(bloco.turma_id);
    if (!turma || turma.user_id !== userId) return null;
    return materialRepository.update(id, data);
  },

  async delete(id: number, userId: number): Promise<boolean> {
    const material = await materialRepository.findById(id);
    if (!material) return false;
    const bloco = await blocoRepository.findById(material.bloco_id);
    if (!bloco) return false;
    const turma = await turmaRepository.findById(bloco.turma_id);
    if (!turma || turma.user_id !== userId) return false;
    return materialRepository.delete(id);
  },
};
