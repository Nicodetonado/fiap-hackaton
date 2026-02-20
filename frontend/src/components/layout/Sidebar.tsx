import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Badge } from '../ui/Badge';
import type { UserRole } from '../../types';

interface NavItem {
  to: string;
  label: string;
  roles?: UserRole[];
}

const navItems: NavItem[] = [
  { to: '/admin', label: 'Todas as turmas', roles: ['sysadmin'] },
  { to: '/', label: 'Minhas turmas', roles: ['professor', 'aluno', 'sysadmin'] },
];

export function Sidebar() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const role = user?.role ?? 'professor';
  const filtered = navItems.filter((n) => !n.roles || n.roles.includes(role));

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <Link to="/" className="sidebar-logo">
          Link da Turma
        </Link>
        {user && <Badge role={user.role} />}
      </div>
      <nav className="sidebar-nav">
        {filtered.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={`sidebar-link ${location.pathname === item.to ? 'active' : ''}`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="sidebar-footer">
        {user && (
          <>
            <span className="sidebar-user">{user.name}</span>
            <Link to="/trocar-senha" className="btn btn-ghost btn-sm">Trocar senha</Link>
            <button type="button" className="btn btn-ghost btn-sm" onClick={logout}>
              Sair
            </button>
          </>
        )}
      </div>
    </aside>
  );
}
