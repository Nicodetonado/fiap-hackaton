import { query, queryOne } from '../config/database';
import type { Turma, TurmaWithOwner, Bloco, Material } from '../models/entities';

export const turmaRepository = {
  async findById(id: number): Promise<Turma | null> {
    return queryOne<Turma>(
      'SELECT id, user_id, name, subject, slug, link_token, description, created_at FROM turmas WHERE id = $1',
      [id]
    );
  },

  async findBySlug(slug: string): Promise<Turma | null> {
    return queryOne<Turma>(
      'SELECT id, user_id, name, subject, slug, link_token, description, created_at FROM turmas WHERE slug = $1',
      [slug]
    );
  },

  async findByLinkToken(linkToken: string): Promise<Turma | null> {
    return queryOne<Turma>(
      'SELECT id, user_id, name, subject, slug, link_token, description, created_at FROM turmas WHERE link_token = $1',
      [linkToken]
    );
  },

  async findByUserId(userId: number): Promise<Turma[]> {
    return query<Turma>(
      'SELECT id, user_id, name, subject, slug, link_token, description, created_at FROM turmas WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
  },

  async findAllWithOwner(): Promise<TurmaWithOwner[]> {
    return query<TurmaWithOwner>(
      `SELECT t.id, t.user_id, t.name, t.subject, t.slug, t.link_token, t.description, t.created_at,
              u.name AS "ownerName", u.email AS "ownerEmail"
       FROM turmas t
       JOIN users u ON u.id = t.user_id
       ORDER BY u.name, t.created_at DESC`
    );
  },

  async findByEnrolledUserId(userId: number): Promise<Turma[]> {
    return query<Turma>(
      `SELECT t.id, t.user_id, t.name, t.subject, t.slug, t.link_token, t.description, t.created_at
       FROM turmas t
       JOIN matriculas m ON m.turma_id = t.id
       WHERE m.user_id = $1
       ORDER BY t.created_at DESC`,
      [userId]
    );
  },

  async slugExists(slug: string, excludeTurmaId?: number): Promise<boolean> {
    const rows = excludeTurmaId
      ? await query<{ id: number }>(
          'SELECT id FROM turmas WHERE slug = $1 AND id != $2',
          [slug, excludeTurmaId]
        )
      : await query<{ id: number }>('SELECT id FROM turmas WHERE slug = $1', [
          slug,
        ]);
    return rows.length > 0;
  },

  async create(
    userId: number,
    name: string,
    subject: string,
    slug: string,
    linkToken: string,
    description?: string | null
  ): Promise<Turma> {
    const desc = description ?? null;
    const rows = await query<Turma>(
      `INSERT INTO turmas (user_id, name, subject, slug, link_token, description)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, user_id, name, subject, slug, link_token, description, created_at`,
      [userId, name, subject, slug, linkToken, desc]
    );
    if (!rows[0]) throw new Error('Failed to create turma');
    return rows[0];
  },

  async update(
    id: number,
    data: { name?: string; subject?: string; description?: string | null }
  ): Promise<Turma | null> {
    const updates: string[] = [];
    const values: unknown[] = [];
    let i = 1;
    if (data.name !== undefined) {
      updates.push(`name = $${i++}`);
      values.push(data.name);
    }
    if (data.subject !== undefined) {
      updates.push(`subject = $${i++}`);
      values.push(data.subject);
    }
    if (data.description !== undefined) {
      updates.push(`description = $${i++}`);
      values.push(data.description);
    }
    if (updates.length === 0) return turmaRepository.findById(id);
    values.push(id);
    const rows = await query<Turma>(
      `UPDATE turmas SET ${updates.join(', ')} WHERE id = $${i} RETURNING id, user_id, name, subject, slug, link_token, description, created_at`,
      values
    );
    return rows[0] ?? null;
  },

  async delete(id: number): Promise<boolean> {
    const result = await query(
      'DELETE FROM turmas WHERE id = $1 RETURNING id',
      [id]
    );
    return result.length > 0;
  },
};

export const blocoRepository = {
  async findById(id: number): Promise<Bloco | null> {
    return queryOne<Bloco>(
      'SELECT id, turma_id, name, "order", created_at FROM blocos WHERE id = $1',
      [id]
    );
  },

  async findByTurmaId(turmaId: number): Promise<Bloco[]> {
    return query<Bloco>(
      'SELECT id, turma_id, name, "order", created_at FROM blocos WHERE turma_id = $1 ORDER BY "order", id',
      [turmaId]
    );
  },

  async create(turmaId: number, name: string, order: number): Promise<Bloco> {
    const rows = await query<Bloco>(
      `INSERT INTO blocos (turma_id, name, "order")
       VALUES ($1, $2, $3)
       RETURNING id, turma_id, name, "order", created_at`,
      [turmaId, name, order]
    );
    if (!rows[0]) throw new Error('Failed to create bloco');
    return rows[0];
  },

  async update(id: number, data: { name?: string; order?: number }): Promise<Bloco | null> {
    const updates: string[] = [];
    const values: unknown[] = [];
    let i = 1;
    if (data.name !== undefined) {
      updates.push(`name = $${i++}`);
      values.push(data.name);
    }
    if (data.order !== undefined) {
      updates.push(`"order" = $${i++}`);
      values.push(data.order);
    }
    if (updates.length === 0) return blocoRepository.findById(id);
    values.push(id);
    const rows = await query<Bloco>(
      `UPDATE blocos SET ${updates.join(', ')} WHERE id = $${i} RETURNING id, turma_id, name, "order", created_at`,
      values
    );
    return rows[0] ?? null;
  },

  async delete(id: number): Promise<boolean> {
    const result = await query(
      'DELETE FROM blocos WHERE id = $1 RETURNING id',
      [id]
    );
    return result.length > 0;
  },
};

export const materialRepository = {
  async findById(id: number): Promise<Material | null> {
    return queryOne<Material>(
      'SELECT id, bloco_id, title, type, url, instruction, "order", created_at FROM materiais WHERE id = $1',
      [id]
    );
  },

  async findByBlocoId(blocoId: number): Promise<Material[]> {
    return query<Material>(
      'SELECT id, bloco_id, title, type, url, instruction, "order", created_at FROM materiais WHERE bloco_id = $1 ORDER BY "order", id',
      [blocoId]
    );
  },

  async create(
    blocoId: number,
    data: {
      title: string;
      type: Material['type'];
      url: string;
      instruction?: string | null;
      order?: number;
    }
  ): Promise<Material> {
    const order = data.order ?? 0;
    const instruction = data.instruction ?? null;
    const rows = await query<Material>(
      `INSERT INTO materiais (bloco_id, title, type, url, instruction, "order")
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, bloco_id, title, type, url, instruction, "order", created_at`,
      [blocoId, data.title, data.type, data.url, instruction, order]
    );
    if (!rows[0]) throw new Error('Failed to create material');
    return rows[0];
  },

  async update(
    id: number,
    data: {
      title?: string;
      type?: Material['type'];
      url?: string;
      instruction?: string | null;
      order?: number;
    }
  ): Promise<Material | null> {
    const updates: string[] = [];
    const values: unknown[] = [];
    let i = 1;
    if (data.title !== undefined) {
      updates.push(`title = $${i++}`);
      values.push(data.title);
    }
    if (data.type !== undefined) {
      updates.push(`type = $${i++}`);
      values.push(data.type);
    }
    if (data.url !== undefined) {
      updates.push(`url = $${i++}`);
      values.push(data.url);
    }
    if (data.instruction !== undefined) {
      updates.push(`instruction = $${i++}`);
      values.push(data.instruction);
    }
    if (data.order !== undefined) {
      updates.push(`"order" = $${i++}`);
      values.push(data.order);
    }
    if (updates.length === 0) return materialRepository.findById(id);
    values.push(id);
    const rows = await query<Material>(
      `UPDATE materiais SET ${updates.join(', ')} WHERE id = $${i} RETURNING id, bloco_id, title, type, url, instruction, "order", created_at`,
      values
    );
    return rows[0] ?? null;
  },

  async delete(id: number): Promise<boolean> {
    const result = await query(
      'DELETE FROM materiais WHERE id = $1 RETURNING id',
      [id]
    );
    return result.length > 0;
  },
};
