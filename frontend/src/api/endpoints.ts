import { api } from './client';
import type {
  LoginResult,
  Turma,
  TurmaWithOwner,
  TurmaWithBlocos,
  TurmaPublic,
  Bloco,
  Material,
  MaterialType,
  AlunoInTurma,
} from '../types';

export const authApi = {
  register: (email: string, password: string, name: string) =>
    api.post<LoginResult>('/auth/register', { email, password, name }),
  login: (email: string, password: string) =>
    api.post<LoginResult>('/auth/login', { email, password }),
  changePassword: (currentPassword: string, newPassword: string) =>
    api.post('/auth/change-password', { currentPassword, newPassword }),
};

export type TurmaListItem = Turma | TurmaWithOwner;

export const turmasApi = {
  list: () => api.get<TurmaListItem[]>('/turmas'),
  getById: (id: number) => api.get<TurmaWithBlocos>(`/turmas/${id}`),
  create: (data: { name: string; subject: string; slug?: string; description?: string | null }) =>
    api.post<Turma>('/turmas', data),
  update: (id: number, data: { name?: string; subject?: string; description?: string | null }) =>
    api.put<Turma>(`/turmas/${id}`, data),
  delete: (id: number) => api.delete(`/turmas/${id}`),
  alunos: {
    list: (turmaId: number) => api.get<AlunoInTurma[]>(`/turmas/${turmaId}/alunos`),
    add: (turmaId: number, email: string, name?: string) =>
      api.post<AlunoInTurma>(`/turmas/${turmaId}/alunos`, { email, name }),
    remove: (turmaId: number, userId: number) =>
      api.delete(`/turmas/${turmaId}/alunos/${userId}`),
  },
};

export const publicApi = {
  getTurmaByLinkToken: (linkToken: string) =>
    api.get<TurmaPublic>(`/public/turmas/link/${linkToken}`),
};

export const adminApi = {
  listTurmas: () => api.get<TurmaWithOwner[]>('/admin/turmas'),
};

export const blocosApi = {
  list: (turmaId: number) => api.get<Bloco[]>(`/turmas/${turmaId}/blocos`),
  create: (turmaId: number, data: { name: string; order?: number }) =>
    api.post<Bloco>(`/turmas/${turmaId}/blocos`, data),
  update: (id: number, data: { name?: string; order?: number }) =>
    api.put<Bloco>(`/blocos/${id}`, data),
  delete: (id: number) => api.delete(`/blocos/${id}`),
};

export const materiaisApi = {
  list: (blocoId: number) => api.get<Material[]>(`/blocos/${blocoId}/materiais`),
  create: (
    blocoId: number,
    data: {
      title: string;
      type: MaterialType;
      url: string;
      instruction?: string | null;
      order?: number;
    }
  ) => api.post<Material>(`/blocos/${blocoId}/materiais`, data),
  update: (
    blocoId: number,
    id: number,
    data: {
      title?: string;
      type?: MaterialType;
      url?: string;
      instruction?: string | null;
      order?: number;
    }
  ) => api.put<Material>(`/blocos/${blocoId}/materiais/${id}`, data),
  delete: (blocoId: number, id: number) =>
    api.delete(`/blocos/${blocoId}/materiais/${id}`),
};
