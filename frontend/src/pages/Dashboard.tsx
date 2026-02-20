import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { turmasApi, type TurmaListItem } from '../api/endpoints';
import { useAuth } from '../contexts/AuthContext';
import { Button, Card } from '../components/ui';
import type { Turma, TurmaWithOwner } from '../types';

function isTurmaWithOwner(t: TurmaListItem): t is TurmaWithOwner {
  return 'ownerName' in t && t.ownerName !== undefined;
}

export function Dashboard() {
  const { user } = useAuth();
  const [turmas, setTurmas] = useState<TurmaListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadTurmas = () => {
    turmasApi
      .list()
      .then(setTurmas)
      .catch((err) => setError(err instanceof Error ? err.message : 'Erro ao carregar'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadTurmas();
  }, []);

  const role = user?.role ?? 'professor';
  const canRemoveTurma = (t: TurmaListItem) =>
    role === 'sysadmin' || (role === 'professor' && (t as Turma).user_id === user?.id);

  const handleRemoverTurma = async (t: TurmaListItem) => {
    if (!confirm(`Remover a turma "${t.name}"? Todos os blocos, materiais e matrículas serão excluídos.`)) return;
    try {
      await turmasApi.delete(t.id);
      setTurmas((prev) => prev.filter((x) => x.id !== t.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao remover turma');
    }
  };

  if (loading) {
    return (
      <div className="page-header">
        <h1 className="page-title">Carregando...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <p style={{ color: 'var(--color-danger)' }}>{error}</p>
      </Card>
    );
  }

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">
          {role === 'sysadmin' ? 'Todas as turmas' : role === 'aluno' ? 'Minhas turmas' : 'Minhas turmas'}
        </h1>
        {(role === 'professor' || role === 'sysadmin') && (
          <Link to="/turmas/nova">
            <Button>Nova turma</Button>
          </Link>
        )}
      </div>

      {turmas.length === 0 ? (
        <Card>
          <p style={{ color: 'var(--color-text-muted)' }}>
            {(role === 'professor' || role === 'sysadmin')
              ? 'Nenhuma turma ainda. Crie a primeira.'
              : 'Você ainda não está matriculado em nenhuma turma.'}
          </p>
          {(role === 'professor' || role === 'sysadmin') && (
            <Link to="/turmas/nova">
              <Button className="mt-2">Criar turma</Button>
            </Link>
          )}
        </Card>
      ) : (
        <ul className="turma-list">
          {turmas.map((t) => (
            <li key={t.id}>
              <Card className="turma-card">
                <div className="turma-card-inner">
                  <div>
                    <strong>{t.name}</strong>
                    <span className="turma-subject">{t.subject}</span>
                    {isTurmaWithOwner(t) && t.ownerName && (
                      <span className="turma-owner"> — {t.ownerName}</span>
                    )}
                  </div>
                  <div className="turma-actions">
                    <a
                      href={`${window.location.origin}/t/${(t as Turma).link_token}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="link-sm"
                    >
                      Ver link
                    </a>
                    <Link to={`/turmas/${t.id}`}>
                      <Button variant="secondary" size="sm">
                        Abrir
                      </Button>
                    </Link>
                    {canRemoveTurma(t) && (
                      <Button variant="danger" size="sm" onClick={() => handleRemoverTurma(t)}>
                        Remover
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
