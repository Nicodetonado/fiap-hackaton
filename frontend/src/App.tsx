import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Layout } from './components/layout/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { TurmaForm } from './pages/TurmaForm';
import { TurmaDetail } from './pages/TurmaDetail';
import { PublicTurma } from './pages/PublicTurma';
import { Admin } from './pages/Admin';
import { TrocarSenha } from './pages/TrocarSenha';

function AppRoutes() {
  const { token, isReady } = useAuth();

  if (!isReady) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        Carregando...
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/t/:linkToken" element={<PublicTurma />} />
      <Route path="/login" element={token ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/register" element={token ? <Navigate to="/" replace /> : <Register />} />
      <Route
        path="/trocar-senha"
        element={
          token ? (
            <ProtectedRoute>
              <Layout><TrocarSenha /></Layout>
            </ProtectedRoute>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout><Dashboard /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminOnly><Layout><Admin /></Layout></AdminOnly>
          </ProtectedRoute>
        }
      />
      <Route
        path="/turmas/nova"
        element={
          <ProtectedRoute>
            <Layout><TurmaForm /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/turmas/:id"
        element={
          <ProtectedRoute>
            <Layout><TurmaDetail /></Layout>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function AdminOnly({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (user?.role !== 'sysadmin') {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
