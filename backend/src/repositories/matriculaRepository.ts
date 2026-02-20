import { query, queryOne } from '../config/database';
import type { Matricula } from '../models/entities';

export const matriculaRepository = {
  async findByTurmaId(turmaId: number): Promise<Matricula[]> {
    return query<Matricula>(
      'SELECT id, user_id, turma_id, created_at FROM matriculas WHERE turma_id = $1 ORDER BY created_at',
      [turmaId]
    );
  },

  async findByUserId(userId: number): Promise<Matricula[]> {
    return query<Matricula>(
      'SELECT id, user_id, turma_id, created_at FROM matriculas WHERE user_id = $1',
      [userId]
    );
  },

  async findOne(userId: number, turmaId: number): Promise<Matricula | null> {
    return queryOne<Matricula>(
      'SELECT id, user_id, turma_id, created_at FROM matriculas WHERE user_id = $1 AND turma_id = $2',
      [userId, turmaId]
    );
  },

  async create(userId: number, turmaId: number): Promise<Matricula> {
    const rows = await query<Matricula>(
      `INSERT INTO matriculas (user_id, turma_id)
       VALUES ($1, $2)
       RETURNING id, user_id, turma_id, created_at`,
      [userId, turmaId]
    );
    if (!rows[0]) throw new Error('Failed to create matricula');
    return rows[0];
  },

  async delete(userId: number, turmaId: number): Promise<boolean> {
    const result = await query(
      'DELETE FROM matriculas WHERE user_id = $1 AND turma_id = $2 RETURNING id',
      [userId, turmaId]
    );
    return result.length > 0;
  },
};
