import { BarChart3, BookOpenCheck, ListChecks, LogOut, UserRound } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { initials } from '../utils/format.js';

export function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/login', { replace: true });
  }

  return (
    <header className="site-header">
      <div className="header-inner">
        <NavLink to="/" className="brand" aria-label="Quiz de Requisitos — início">
          <span className="brand-mark" aria-hidden="true">RF</span>
          <span className="brand-copy">
            <strong>Quiz de Requisitos</strong>
            <small>Funcional ou não funcional?</small>
          </span>
        </NavLink>

        <nav className="main-nav" aria-label="Navegação principal">
          <NavLink to="/" end>
            <BookOpenCheck size={18} aria-hidden="true" />
            <span>Jogar</span>
          </NavLink>
          <NavLink to="/ranking">
            <BarChart3 size={18} aria-hidden="true" />
            <span>Ranking</span>
          </NavLink>
          <NavLink to="/perfil">
            <UserRound size={18} aria-hidden="true" />
            <span>Perfil</span>
          </NavLink>
          {user?.role === 'ADMIN' && (
            <NavLink to="/admin/perguntas">
              <ListChecks size={18} aria-hidden="true" />
              <span>Perguntas</span>
            </NavLink>
          )}
        </nav>

        <div className="user-menu">
          <div className="avatar" aria-hidden="true">{initials(user?.name)}</div>
          <span className="user-name">{user?.name?.split(' ')[0]}</span>
          <button className="icon-button" type="button" onClick={handleLogout} aria-label="Sair">
            <LogOut size={18} aria-hidden="true" />
          </button>
        </div>
      </div>
    </header>
  );
}

