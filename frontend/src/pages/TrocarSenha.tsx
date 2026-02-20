import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../api/endpoints';
import { Button, Card, Input } from '../components/ui';

export function TrocarSenha() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authApi.changePassword(currentPassword, newPassword);
      setSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao alterar senha');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="auth-page">
        <Card className="auth-card">
          <h1 className="page-title" style={{ marginBottom: 'var(--space-4)' }}>Senha alterada</h1>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-4)' }}>
            Sua senha foi alterada. Use a nova senha no próximo login.
          </p>
          <Link to="/"><Button>Voltar ao início</Button></Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <Card className="auth-card">
        <h1 className="page-title" style={{ marginBottom: 'var(--space-5)' }}>Trocar senha</h1>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {error && (
            <div style={{ padding: 'var(--space-3)', background: '#fef2f2', color: 'var(--color-danger)', borderRadius: 'var(--radius-sm)' }}>
              {error}
            </div>
          )}
          <Input
            label="Senha atual"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
          <Input
            label="Nova senha"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={6}
            autoComplete="new-password"
          />
          <Button type="submit" disabled={loading}>{loading ? 'Alterando...' : 'Alterar senha'}</Button>
        </form>
        <p style={{ marginTop: 'var(--space-4)', fontSize: '0.875rem' }}>
          <Link to="/">← Voltar</Link>
        </p>
      </Card>
    </div>
  );
}
