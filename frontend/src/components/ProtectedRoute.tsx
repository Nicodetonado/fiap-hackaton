import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token, isReady } = useAuth();
  const location = useLocation();

  if (!isReady) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        Carregando...
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
