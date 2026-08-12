import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/AppShell.jsx';
import { PageLoader } from './components/PageLoader.jsx';
import { ProtectedRoute } from './components/ProtectedRoute.jsx';
import { useAuth } from './hooks/useAuth.js';
import { GamePage } from './pages/GamePage.jsx';
import { HomePage } from './pages/HomePage.jsx';
import { LoginPage } from './pages/LoginPage.jsx';
import { NotFoundPage } from './pages/NotFoundPage.jsx';
import { ProfilePage } from './pages/ProfilePage.jsx';
import { RankingPage } from './pages/RankingPage.jsx';
import { RegisterPage } from './pages/RegisterPage.jsx';
import { ResultPage } from './pages/ResultPage.jsx';

function PublicOnly({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <PageLoader label="Restaurando sua sessão..." fullScreen />;
  if (!loading && isAuthenticated) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route
        path="/login"
        element={<PublicOnly><LoginPage /></PublicOnly>}
      />
      <Route
        path="/cadastro"
        element={<PublicOnly><RegisterPage /></PublicOnly>}
      />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route index element={<HomePage />} />
          <Route path="jogo" element={<GamePage />} />
          <Route path="resultado/:sessionId" element={<ResultPage />} />
          <Route path="ranking" element={<RankingPage />} />
          <Route path="perfil" element={<ProfilePage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
