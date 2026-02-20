import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { publicApi } from '../api/endpoints';
import type { TurmaPublic } from '../types';

const TYPE_LABELS: Record<string, string> = {
  video: 'Vídeo',
  reading: 'Leitura',
  exercise: 'Exercício',
  test: 'Prova/Simulado',
  other: 'Outro',
};

export function PublicTurma() {
  const { linkToken } = useParams<{ linkToken: string }>();
  const [turma, setTurma] = useState<TurmaPublic | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!linkToken) return;
    publicApi
      .getTurmaByLinkToken(linkToken)
      .then(setTurma)
      .catch((err) => setError(err instanceof Error ? err.message : 'Turma não encontrada'))
      .finally(() => setLoading(false));
  }, [linkToken]);

  if (loading) return <p style={{ padding: '2rem', textAlign: 'center' }}>Carregando...</p>;
  if (error) return <p style={{ padding: '2rem', textAlign: 'center', color: '#b91c1c' }}>{error}</p>;
  if (!turma) return null;

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '1.5rem', fontFamily: 'system-ui, sans-serif' }}>
      <header style={{ marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #e5e7eb' }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem' }}>{turma.name}</h1>
        <p style={{ margin: '0.25rem 0 0', color: '#6b7280' }}>{turma.subject}</p>
        <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem', color: '#6b7280' }}>
          {turma.teacherName}
        </p>
        {turma.description && (
          <p style={{ margin: '0.5rem 0 0', fontSize: '0.875rem', color: '#4b5563' }}>{turma.description}</p>
        )}
      </header>
      <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>
        Materiais organizados por bloco. Clique nos links para acessar.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {turma.blocos.map((bloco) => (
          <section key={bloco.id}>
            <h2 style={{ fontSize: '1.125rem', marginBottom: '0.75rem', color: '#374151' }}>
              {bloco.name}
            </h2>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {bloco.materiais.map((m) => (
                <li
                  key={m.id}
                  style={{
                    padding: '0.75rem 1rem',
                    marginBottom: '0.5rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: 8,
                    background: '#fff',
                  }}
                >
                  <span style={{ fontSize: '0.75rem', color: '#6b7280', display: 'block', marginBottom: '0.25rem' }}>
                    {TYPE_LABELS[m.type] ?? m.type}
                  </span>
                  <a
                    href={m.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontWeight: 500, color: '#2563eb', textDecoration: 'none' }}
                  >
                    {m.title}
                  </a>
                  {m.instruction && (
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem', color: '#6b7280' }}>
                      {m.instruction}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
      <footer style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid #e5e7eb', fontSize: '0.75rem', color: '#9ca3af' }}>
        Link da Turma — Hackaton FIAP 5FSDT
      </footer>
    </div>
  );
}
