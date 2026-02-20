import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../api/endpoints';
import { useAuth } from '../contexts/AuthContext';
import { Button, Card, Input } from '../components/ui';

export function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { user, token } = await authApi.register(email, password, name);
      login(token, user);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao cadastrar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <Card className="auth-card">
        <h1 className="page-title" style={{ marginBottom: 'var(--space-5)' }}>Cadastro</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginBottom: 'var(--space-4)' }}>
          Cadastro cria conta de aluno. Professores são cadastrados pela coordenação (admin).
        </p>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {error && (
            <div style={{ padding: 'var(--space-3)', background: '#fef2f2', color: 'var(--color-danger)', borderRadius: 'var(--radius-sm)' }}>
              {error}
            </div>
          )}
          <Input label="Nome" type="text" value={name} onChange={(e) => setName(e.target.value)} required autoComplete="name" />
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
          <Input label="Senha (mín. 6 caracteres)" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} autoComplete="new-password" />
          <Button type="submit" disabled={loading}>{loading ? 'Cadastrando...' : 'Cadastrar'}</Button>
        </form>
        <p style={{ marginTop: 'var(--space-4)', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
          Já tem conta? <Link to="/login">Entrar</Link>
        </p>
      </Card>
    </div>
  );
}
