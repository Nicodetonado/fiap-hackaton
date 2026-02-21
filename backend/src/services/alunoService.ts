import bcrypt from 'bcryptjs';
import { userRepository } from '../repositories/userRepository';
import { turmaRepository } from '../repositories/turmaRepository';
import { matriculaRepository } from '../repositories/matriculaRepository';
import type { AlunoInTurma } from '../models/entities';

const SALT_ROUNDS = 10;
// quando o prof cadastra aluno que não tem conta ainda
const DEFAULT_ALUNO_PASSWORD = 'aluno123';

export const alunoService = {
  async listByTurma(turmaId: number, professorUserId: number): Promise<AlunoInTurma[] | null> {
    const turma = await turmaRepository.findById(turmaId);
    if (!turma || turma.user_id !== professorUserId) return null;
    const matriculas = await matriculaRepository.findByTurmaId(turmaId);
    const alunos: AlunoInTurma[] = [];
    for (const m of matriculas) {
      const user = await userRepository.findById(m.user_id);
      if (user) {
        alunos.push({
          id: m.id,
          user_id: user.id,
          email: user.email,
          name: user.name,
          created_at: (m.created_at as Date).toISOString(),
        });
      }
    }
    return alunos;
  },

  async addToTurma(
    turmaId: number,
    professorUserId: number,
    email: string,
    name?: string
  ): Promise<AlunoInTurma | null> {
    const turma = await turmaRepository.findById(turmaId);
    if (!turma || turma.user_id !== professorUserId) return null;
    let user = await userRepository.findByEmail(email.trim().toLowerCase());
    if (!user) {
      const passwordHash = await bcrypt.hash(DEFAULT_ALUNO_PASSWORD, SALT_ROUNDS);
      user = await userRepository.create(
        email.trim().toLowerCase(),
        passwordHash,
        name?.trim() || email.split('@')[0],
        'aluno'
      );
    }
    const existing = await matriculaRepository.findOne(user.id, turmaId);
    if (existing) {
      const u = await userRepository.findById(user.id);
      return u ? { id: existing.id, user_id: u.id, email: u.email, name: u.name, created_at: (existing.created_at as Date).toISOString() } : null;
    }
    const mat = await matriculaRepository.create(user.id, turmaId);
    const u = await userRepository.findById(user.id);
    return u ? { id: mat.id, user_id: u.id, email: u.email, name: u.name, created_at: (mat.created_at as Date).toISOString() } : null;
  },

  async removeFromTurma(
    turmaId: number,
    professorUserId: number,
    userId: number
  ): Promise<boolean> {
    const turma = await turmaRepository.findById(turmaId);
    if (!turma || turma.user_id !== professorUserId) return false;
    return matriculaRepository.delete(userId, turmaId);
  },
};
