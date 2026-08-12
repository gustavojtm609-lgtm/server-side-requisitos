import { Outlet } from 'react-router-dom';
import { Header } from './Header.jsx';

export function AppShell() {
  return (
    <div className="app-shell">
      <Header />
      <main className="main-content">
        <Outlet />
      </main>
      <footer className="site-footer">
        <span>Quiz de Requisitos</span>
        <span>Aprenda praticando, um requisito de cada vez.</span>
      </footer>
    </div>
  );
}

