import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { turmasApi, blocosApi, materiaisApi } from '../api/endpoints';
import { useAuth } from '../contexts/AuthContext';
import { Button, Card, Input } from '../components/ui';
import type { TurmaWithBlocos, MaterialType, AlunoInTurma } from '../types';

const MATERIAL_TYPES: { value: MaterialType; label: string }[] = [
  { value: 'video', label: 'Vídeo' },
  { value: 'reading', label: 'Leitura' },
  { value: 'exercise', label: 'Exercício' },
  { value: 'test', label: 'Prova/Simulado' },
  { value: 'other', label: 'Outro' },
];

export function TurmaDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const role = user?.role ?? 'professor';
  const canEdit = role === 'professor' || role === 'sysadmin';

  const [turma, setTurma] = useState<TurmaWithBlocos | null>(null);
  const [alunos, setAlunos] = useState<AlunoInTurma[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newBlocoName, setNewBlocoName] = useState('');
  const [alunoEmail, setAlunoEmail] = useState('');
  const [alunoName, setAlunoName] = useState('');
  const [newMaterial, setNewMaterial] = useState<{
    blocoId: number;
    title: string;
    type: MaterialType;
    url: string;
    instruction: string;
  } | null>(null);

  const turmaId = id ? parseInt(id, 10) : 0;

  const load = () => {
    if (!turmaId) return;
    setLoading(true);
    turmasApi
      .getById(turmaId)
      .then(setTurma)
      .catch((err) => setError(err instanceof Error ? err.message : 'Erro'))
      .finally(() => setLoading(false));
  };

  const loadAlunos = () => {
    if (!turmaId || !canEdit) return;
    turmasApi.alunos.list(turmaId).then(setAlunos).catch(() => setAlunos([]));
  };

  useEffect(() => {
    load();
  }, [turmaId]);

  useEffect(() => {
    if (turma && canEdit) loadAlunos();
  }, [turma?.id, canEdit]);

  const handleAddBloco = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBlocoName.trim() || !turmaId) return;
    try {
      await blocosApi.create(turmaId, {
        name: newBlocoName.trim(),
        order: turma?.blocos?.length ?? 0,
      });
      setNewBlocoName('');
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar bloco');
    }
  };

  const handleDeleteBloco = async (blocoId: number) => {
    if (!confirm('Remover este bloco e todos os materiais?')) return;
    try {
      await blocosApi.delete(blocoId);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro');
    }
  };

  const handleAddMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMaterial || !newMaterial.title.trim() || !newMaterial.url.trim()) return;
    try {
      await materiaisApi.create(newMaterial.blocoId, {
        title: newMaterial.title.trim(),
        type: newMaterial.type,
        url: newMaterial.url.trim(),
        instruction: newMaterial.instruction.trim() || null,
      });
      setNewMaterial(null);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar material');
    }
  };

  const handleDeleteMaterial = async (blocoId: number, materialId: number) => {
    if (!confirm('Remover este material?')) return;
    try {
      await materiaisApi.delete(blocoId, materialId);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro');
    }
  };

  const handleAddAluno = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!alunoEmail.trim() || !turmaId) return;
    try {
      await turmasApi.alunos.add(turmaId, alunoEmail.trim(), alunoName.trim() || undefined);
      setAlunoEmail('');
      setAlunoName('');
      loadAlunos();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao adicionar aluno');
    }
  };

  const handleRemoveAluno = async (userId: number) => {
    if (!confirm('Remover este aluno da turma?')) return;
    try {
      await turmasApi.alunos.remove(turmaId, userId);
      loadAlunos();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro');
    }
  };

  const handleRemoverTurma = async () => {
    if (!confirm('Remover esta turma? Todos os blocos, materiais e matrículas serão excluídos. Esta ação não pode ser desfeita.')) return;
    try {
      await turmasApi.delete(turmaId);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao remover turma');
    }
  };

  if (loading && !turma) return <p>Carregando...</p>;
  if (error && !turma) return <p style={{ color: '#b91c1c' }}>{error}</p>;
  if (!turma) return <p>Turma não encontrada.</p>;

  const publicUrl = `${window.location.origin}/t/${turma.link_token}`;

  return (
    <div>
      <div style={{ marginBottom: 'var(--space-4)' }}>
        <Link to="/" className="link-sm" style={{ color: 'var(--color-text-muted)' }}>
          ← Voltar
        </Link>
      </div>
      {error && (
        <Card padding="sm" style={{ marginBottom: 'var(--space-4)', background: '#fef2f2', borderColor: 'var(--color-danger)' }}>
          {error}
        </Card>
      )}
      <div className="page-header" style={{ marginBottom: 'var(--space-5)' }}>
        <div>
          <h1 className="page-title" style={{ margin: 0 }}>{turma.name}</h1>
          <p style={{ margin: 'var(--space-1) 0 0', color: 'var(--color-text-muted)' }}>{turma.subject}</p>
          {turma.description && (
            <p style={{ margin: 'var(--space-2) 0 0', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>{turma.description}</p>
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', alignItems: 'flex-end' }}>
          <a href={publicUrl} target="_blank" rel="noopener noreferrer">
            <Button>Abrir link da turma</Button>
          </a>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{publicUrl}</span>
          {canEdit && (
            <Button variant="danger" size="sm" onClick={handleRemoverTurma} style={{ marginTop: 'var(--space-2)' }}>
              Remover turma
            </Button>
          )}
        </div>
      </div>

      <section style={{ marginBottom: 'var(--space-6)' }}>
        <h2 style={{ fontSize: '1.125rem', marginBottom: 'var(--space-3)' }}>Materiais por bloco</h2>
        {canEdit && (
          <form onSubmit={handleAddBloco} style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
            <input
              type="text"
              className="input"
              value={newBlocoName}
              onChange={(e) => setNewBlocoName(e.target.value)}
              placeholder="Ex: Semana 1 - Números reais"
              style={{ flex: 1 }}
            />
            <Button type="submit" variant="secondary">Adicionar bloco</Button>
          </form>
        )}
        {turma.blocos?.length === 0 ? (
          <p style={{ color: 'var(--color-text-muted)' }}>{canEdit ? 'Nenhum bloco. Adicione um acima.' : 'Nenhum material publicado.'}</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {turma.blocos?.map((bloco) => (
              <Card key={bloco.id} padding="none">
                <div style={{ padding: 'var(--space-3) var(--space-4)', background: 'var(--color-bg)', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong>{bloco.name}</strong>
                  {canEdit && (
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteBloco(bloco.id)}>
                      Remover bloco
                    </Button>
                  )}
                </div>
                <div style={{ padding: 'var(--space-4)' }}>
                  {bloco.materiais?.map((m) => (
                    <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-2) 0', borderBottom: '1px solid var(--color-border)' }}>
                      <div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginRight: 'var(--space-2)' }}>
                          {MATERIAL_TYPES.find((x) => x.value === m.type)?.label ?? m.type}
                        </span>
                        <a href={m.url} target="_blank" rel="noopener noreferrer">{m.title}</a>
                        {m.instruction && <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}> — {m.instruction}</span>}
                      </div>
                      {canEdit && (
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteMaterial(bloco.id, m.id)}>Remover</Button>
                      )}
                    </div>
                  ))}
                  {canEdit && (
                    newMaterial?.blocoId === bloco.id ? (
                      <form onSubmit={handleAddMaterial} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', marginTop: 'var(--space-3)' }}>
                        <Input label="Título" value={newMaterial.title} onChange={(e) => setNewMaterial((prev) => prev ? { ...prev, title: e.target.value } : null)} required />
                        <select className="input" value={newMaterial.type} onChange={(e) => setNewMaterial((prev) => prev ? { ...prev, type: e.target.value as MaterialType } : null)}>
                          {MATERIAL_TYPES.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                        <Input label="URL" type="url" value={newMaterial.url} onChange={(e) => setNewMaterial((prev) => prev ? { ...prev, url: e.target.value } : null)} required />
                        <Input label="Instrução (opcional)" value={newMaterial.instruction} onChange={(e) => setNewMaterial((prev) => prev ? { ...prev, instruction: e.target.value } : null)} />
                        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                          <Button type="submit">Salvar</Button>
                          <Button type="button" variant="secondary" onClick={() => setNewMaterial(null)}>Cancelar</Button>
                        </div>
                      </form>
                    ) : (
                      <Button variant="ghost" size="sm" style={{ marginTop: 'var(--space-3)' }} onClick={() => setNewMaterial({ blocoId: bloco.id, title: '', type: 'video', url: '', instruction: '' })}>
                        + Adicionar material
                      </Button>
                    )
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      {canEdit && (
        <section>
          <h2 style={{ fontSize: '1.125rem', marginBottom: 'var(--space-3)' }}>Alunos da turma</h2>
          <form onSubmit={handleAddAluno} style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
            <Input
              label="Email do aluno"
              type="email"
              value={alunoEmail}
              onChange={(e) => setAlunoEmail(e.target.value)}
              placeholder="aluno@email.com"
              required
            />
            <Input
              label="Nome (opcional)"
              value={alunoName}
              onChange={(e) => setAlunoName(e.target.value)}
              placeholder="Nome do aluno"
            />
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <Button type="submit">Cadastrar aluno</Button>
            </div>
          </form>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: 'var(--space-2)' }}>
            Se o email não existir, um usuário será criado com senha de primeiro acesso: <code>AlunoPrimeiroAcesso</code> (aluno cadastrado pela escola, sem cadastro prévio).
          </p>
          {alunos.length === 0 ? (
            <p style={{ color: 'var(--color-text-muted)' }}>Nenhum aluno cadastrado nesta turma.</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {alunos.map((a) => (
                <li key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-2) 0', borderBottom: '1px solid var(--color-border)' }}>
                  <span>{a.name} — {a.email}</span>
                  <Button variant="ghost" size="sm" onClick={() => handleRemoveAluno(a.user_id)}>Remover</Button>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}
