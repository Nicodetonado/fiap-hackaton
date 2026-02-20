export type MaterialType = 'video' | 'reading' | 'exercise' | 'test' | 'other';

export type UserRole = 'professor' | 'aluno' | 'sysadmin';

export interface User {
  id: number;
  email: string;
  password_hash: string;
  name: string;
  role: UserRole;
  created_at: Date;
}

export interface UserPublic {
  id: number;
  email: string;
  name: string;
  role: UserRole;
}

export interface Turma {
  id: number;
  user_id: number;
  name: string;
  subject: string;
  slug: string;
  link_token: string;
  description: string | null;
  created_at: Date;
}

export interface TurmaWithOwner extends Turma {
  ownerName?: string;
  ownerEmail?: string;
}

export interface Matricula {
  id: number;
  user_id: number;
  turma_id: number;
  created_at: Date;
}

export interface Bloco {
  id: number;
  turma_id: number;
  name: string;
  order: number;
  created_at: Date;
}

export interface Material {
  id: number;
  bloco_id: number;
  title: string;
  type: MaterialType;
  url: string;
  instruction: string | null;
  order: number;
  created_at: Date;
}

export interface TurmaWithBlocosAndMateriais extends Turma {
  blocos: (Bloco & { materiais: Material[] })[];
}

export interface TurmaPublic {
  id: number;
  name: string;
  subject: string;
  slug: string;
  description: string | null;
  teacherName: string;
  blocos: Array<{
    id: number;
    name: string;
    order: number;
    materiais: Array<{
      id: number;
      title: string;
      type: MaterialType;
      url: string;
      instruction: string | null;
      order: number;
    }>;
  }>;
}

export interface AlunoInTurma {
  id: number;
  user_id: number;
  email: string;
  name: string;
  created_at: string;
}
