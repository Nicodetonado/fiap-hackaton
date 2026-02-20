import crypto from 'node:crypto';
import {
  turmaRepository,
  blocoRepository,
  materialRepository,
} from '../repositories/turmaRepository';
import { userRepository } from '../repositories/userRepository';
import { matriculaRepository } from '../repositories/matriculaRepository';
import type {
  Turma,
  TurmaWithOwner,
  TurmaWithBlocosAndMateriais,
  TurmaPublic,
  MaterialType,
  UserRole,
} from '../models/entities';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function ensureUniqueSlug(base: string, excludeTurmaId?: number): Promise<string> {
  let slug = slugify(base) || 'turma';
  let counter = 0;
  const original = slug;
  const check = async (): Promise<boolean> =>
    turmaRepository.slugExists(slug, excludeTurmaId);
  const next = async (): Promise<string> => {
    const exists = await check();
    if (!exists) return slug;
    counter += 1;
    slug = `${original}-${counter}`;
    return next();
  };
  return next();
}

export const turmaService = {
  async listForUser(userId: number, role: UserRole): Promise<Turma[] | TurmaWithOwner[]> {
    if (role === 'sysadmin') {
      return turmaRepository.findAllWithOwner();
    }
    if (role === 'aluno') {
      return turmaRepository.findByEnrolledUserId(userId);
    }
    return turmaRepository.findByUserId(userId);
  },

  async listByUser(userId: number): Promise<Turma[]> {
    return turmaRepository.findByUserId(userId);
  },

  async getById(id: number, userId: number, role: UserRole): Promise<TurmaWithBlocosAndMateriais | null> {
    const turma = await turmaRepository.findById(id);
    if (!turma) return null;
    if (role === 'sysadmin') {
    } else if (role === 'professor' && turma.user_id !== userId) {
      return null;
    } else if (role === 'aluno') {
      const mat = await matriculaRepository.findOne(userId, id);
      if (!mat) return null;
    }
    const blocos = await blocoRepository.findByTurmaId(id);
    const blocosWithMateriais = await Promise.all(
      blocos.map(async (b) => {
        const materiais = await materialRepository.findByBlocoId(b.id);
        return { ...b, materiais };
      })
    );
    return { ...turma, blocos: blocosWithMateriais };
  },

  async create(
    userId: number,
    data: { name: string; subject: string; slug?: string; description?: string | null }
  ): Promise<Turma> {
    const baseSlug =
      (data.slug && slugify(data.slug)) || slugify(data.name) || 'turma';
    const slug = await ensureUniqueSlug(baseSlug);
    const linkToken = crypto.randomUUID().replace(/-/g, '');
    return turmaRepository.create(userId, data.name, data.subject, slug, linkToken, data.description);
  },

  async update(
    id: number,
    userId: number,
    role: UserRole,
    data: { name?: string; subject?: string; description?: string | null }
  ): Promise<Turma | null> {
    const turma = await turmaRepository.findById(id);
    if (!turma) return null;
    if (role === 'professor' && turma.user_id !== userId) return null;
    if (role === 'aluno') return null;
    return turmaRepository.update(id, data);
  },

  async delete(id: number, userId: number, role: UserRole): Promise<boolean> {
    const turma = await turmaRepository.findById(id);
    if (!turma) return false;
    if (role === 'professor' && turma.user_id !== userId) return false;
    if (role === 'aluno') return false;
    return turmaRepository.delete(id);
  },

  async getPublicByLinkToken(linkToken: string): Promise<TurmaPublic | null> {
    const turma = await turmaRepository.findByLinkToken(linkToken);
    if (!turma) return null;
    const user = await userRepository.findById(turma.user_id);
    const blocos = await blocoRepository.findByTurmaId(turma.id);
    const blocosWithMateriais = await Promise.all(
      blocos.map(async (b) => {
        const materiais = await materialRepository.findByBlocoId(b.id);
        return {
          id: b.id,
          name: b.name,
          order: b.order,
          materiais: materiais.map((m) => ({
            id: m.id,
            title: m.title,
            type: m.type as MaterialType,
            url: m.url,
            instruction: m.instruction,
            order: m.order,
          })),
        };
      })
    );
    return {
      id: turma.id,
      name: turma.name,
      subject: turma.subject,
      slug: turma.slug,
      description: turma.description ?? null,
      teacherName: user?.name ?? 'Professor',
      blocos: blocosWithMateriais,
    };
  },
};
