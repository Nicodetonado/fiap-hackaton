import { query, queryOne } from '../config/database';
import type { User, UserRole } from '../models/entities';

const USER_COLS = 'id, email, password_hash, name, role, created_at';

export const userRepository = {
  async findByEmail(email: string): Promise<User | null> {
    return queryOne<User>(
      `SELECT ${USER_COLS} FROM users WHERE email = $1`,
      [email]
    );
  },

  async findById(id: number): Promise<User | null> {
    return queryOne<User>(
      `SELECT ${USER_COLS} FROM users WHERE id = $1`,
      [id]
    );
  },

  async findAll(): Promise<User[]> {
    return query<User>(
      `SELECT ${USER_COLS} FROM users ORDER BY name`
    );
  },

  async create(
    email: string,
    passwordHash: string,
    name: string,
    role: UserRole = 'professor'
  ): Promise<User> {
    const rows = await query<User>(
      `INSERT INTO users (email, password_hash, name, role)
       VALUES ($1, $2, $3, $4)
       RETURNING ${USER_COLS}`,
      [email, passwordHash, name, role]
    );
    if (!rows[0]) throw new Error('Failed to create user');
    return rows[0];
  },

  async updateRole(id: number, role: UserRole): Promise<User | null> {
    const rows = await query<User>(
      `UPDATE users SET role = $1 WHERE id = $2 RETURNING ${USER_COLS}`,
      [role, id]
    );
    return rows[0] ?? null;
  },

  async updatePassword(id: number, passwordHash: string): Promise<boolean> {
    const result = await query(
      'UPDATE users SET password_hash = $1 WHERE id = $2 RETURNING id',
      [passwordHash, id]
    );
    return result.length > 0;
  },
};
