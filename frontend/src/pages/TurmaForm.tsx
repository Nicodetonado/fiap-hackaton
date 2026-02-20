import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { turmasApi } from '../api/endpoints';
import { Button, Card, Input } from '../components/ui';

export function TurmaForm() {
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const turma = await turmasApi.create({
        name,
        subject,
        slug: slug.trim() || undefined,
        description: description.trim() || null,
      });
      navigate(`/turmas/${turma.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar turma');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 480 }}>
      <h1 className="page-title" style={{ marginBottom: 'var(--space-5)' }}>Nova turma</h1>
      <Card>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {error && (
            <div style={{ padding: 'var(--space-3)', background: '#fef2f2', color: 'var(--color-danger)', borderRadius: 'var(--radius-sm)' }}>
              {error}
            </div>
          )}
          <Input label="Nome da turma" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: 9º A" required />
          <Input label="Disciplina" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Ex: Matemática" required />
          <Input label="Slug (opcional)" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="Ex: matematica-9a" />
          <div className="input-wrap">
            <label className="input-label">Descrição da turma (opcional)</label>
            <textarea className="input" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Ex: Turma de Matemática 9º ano - 2025" style={{ resize: 'vertical' }} />
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <Button type="submit" disabled={loading}>{loading ? 'Criando...' : 'Criar turma'}</Button>
            <Button type="button" variant="secondary" onClick={() => navigate(-1)}>Cancelar</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
