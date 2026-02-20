import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { userRepository } from '../repositories/userRepository';
import { env } from '../config/env';
import type { UserPublic, UserRole } from '../models/entities';

const SALT_ROUNDS = 10;

export interface LoginResult {
  user: UserPublic;
  token: string;
}

export const authService = {
  async register(
    email: string,
    password: string,
    name: string,
    role: UserRole = 'aluno'
  ): Promise<LoginResult> {
    const existing = await userRepository.findByEmail(email);
    if (existing) {
      const err = new Error('Email já cadastrado');
      (err as Error & { statusCode: number }).statusCode = 409;
      throw err;
    }
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await userRepository.create(email, passwordHash, name, role);
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      env.jwt.secret,
      { expiresIn: env.jwt.expiresIn }
    );
    return {
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      token,
    };
  },

  async login(email: string, password: string): Promise<LoginResult> {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      const err = new Error('Email ou senha inválidos');
      (err as Error & { statusCode: number }).statusCode = 401;
      throw err;
    }
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      const err = new Error('Email ou senha inválidos');
      (err as Error & { statusCode: number }).statusCode = 401;
      throw err;
    }
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      env.jwt.secret,
      { expiresIn: env.jwt.expiresIn }
    );
    return {
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      token,
    };
  },

  async changePassword(userId: number, currentPassword: string, newPassword: string): Promise<void> {
    const user = await userRepository.findById(userId);
    if (!user) {
      const err = new Error('Usuário não encontrado');
      (err as Error & { statusCode: number }).statusCode = 404;
      throw err;
    }
    const valid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!valid) {
      const err = new Error('Senha atual incorreta');
      (err as Error & { statusCode: number }).statusCode = 401;
      throw err;
    }
    const newHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await userRepository.updatePassword(userId, newHash);
  },
};
