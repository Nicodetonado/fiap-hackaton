import { query } from '../config/database';

export const loginLogRepository = {
  async insert(
    userId: number,
    email: string,
    role: string,
    ip?: string | null
  ): Promise<void> {
    await query(
      `INSERT INTO login_logs (user_id, email, role, ip)
       VALUES ($1, $2, $3, $4)`,
      [userId, email, role, ip ?? null]
    );
  },
};
