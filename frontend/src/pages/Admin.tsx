import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../api/endpoints';
import { Card } from '../components/ui';
import type { TurmaWithOwner } from '../types';

export function Admin() {
  const [turmas, setTurmas] = useState<TurmaWithOwner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    adminApi
      .listTurmas()
      .then(setTurmas)
      .catch((err) => setError(err instanceof Error ? err.message : 'Erro'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Carregando...</p>;
  if (error) return <Card><p style={{ color: 'var(--color-danger)' }}>{error}</p></Card>;

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Todas as turmas (admin)</h1>
      </div>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-4)' }}>
        Visão de todas as turmas e respectivos professores.
      </p>
      <ul className="turma-list">
        {turmas.map((t) => (
          <li key={t.id}>
            <Card className="turma-card">
              <div className="turma-card-inner">
                <div>
                  <strong>{t.name}</strong>
                  <span className="turma-subject">{t.subject}</span>
                  {t.ownerName && (
                    <span className="turma-owner"> — {t.ownerName} ({t.ownerEmail})</span>
                  )}
                </div>
                <Link to={`/turmas/${t.id}`}>
                  <span className="link-sm">Abrir</span>
                </Link>
              </div>
            </Card>
          </li>
        ))}
      </ul>
    </>
  );
}
