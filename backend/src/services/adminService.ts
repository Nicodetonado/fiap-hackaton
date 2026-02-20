import bcrypt from 'bcryptjs';
import { userRepository } from '../repositories/userRepository';
import type { User, UserRole } from '../models/entities';

const SALT_ROUNDS = 10;

export const adminService = {
  async createUser(
    email: string,
    password: string,
    name: string,
    role: 'professor' | 'aluno'
  ): Promise<User> {
    const existing = await userRepository.findByEmail(email);
    if (existing) {
      const err = new Error('Email já cadastrado');
      (err as Error & { statusCode: number }).statusCode = 409;
      throw err;
    }
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    return userRepository.create(email, passwordHash, name, role as UserRole);
  },
};
