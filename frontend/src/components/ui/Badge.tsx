import type { UserRole } from '../../types';

const labels: Record<UserRole, string> = {
  professor: 'Professor',
  aluno: 'Aluno',
  sysadmin: 'Admin',
};

const variants: Record<UserRole, string> = {
  professor: 'badge-primary',
  aluno: 'badge-secondary',
  sysadmin: 'badge-admin',
};

export function Badge({ role }: { role: UserRole }) {
  return <span className={`badge ${variants[role]}`}>{labels[role]}</span>;
}
