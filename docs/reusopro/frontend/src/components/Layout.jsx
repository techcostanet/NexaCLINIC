import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTema } from '../hooks/useTema';
import ModalTrocarSenha from './ModalTrocarSenha';

const itens = [
  { rota: '/', label: 'Dashboard', icone: 'grid' },
  { rota: '/pacientes', label: 'Pacientes', icone: 'users' },
  { rota: '/etiquetas', label: 'Etiquetas', icone: 'tag' },
  { rota: '/trocas', label: 'Trocas de Capilar', icone: 'swap' },
  { rota: '/escalas', label: 'Escalas', icone: 'escalas' },
  { rota: '/relatorios', label: 'Relatórios', icone: 'file' },
];

const icones = {
  grid: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  ),
  users: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="9" cy="7" r="3.2" />
      <path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6" />
      <circle cx="17.5" cy="8.5" r="2.5" />
      <path d="M15.5 14c2.8.3 5 2.4 5 6" />
    </svg>
  ),
  swap: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 7h13l-3-3" />
      <path d="M20 17H7l3 3" />
    </svg>
  ),
  file: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M6 2.5h8l4 4V21a.5.5 0 0 1-.5.5H6.5a.5.5 0 0 1-.5-.5V3a.5.5 0 0 1 .5-.5Z" />
      <path d="M14 2.5V6a1 1 0 0 0 1 1h3.5" />
      <path d="M8.5 12.5h7M8.5 16h7" />
    </svg>
  ),
  tag: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12.5 3.5H6A1.5 1.5 0 0 0 4.5 5v6.5a1.5 1.5 0 0 0 .44 1.06l8 8a1.5 1.5 0 0 0 2.12 0l6.5-6.5a1.5 1.5 0 0 0 0-2.12l-8-8a1.5 1.5 0 0 0-1.06-.44Z" />
      <circle cx="9" cy="9" r="1.5" />
    </svg>
  ),
  escalas: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="2.5" y="4" width="19" height="16" rx="1.5" />
      <path d="M2.5 9.5h19" />
      <path d="M8.5 4v-1.5M15.5 4v-1.5" />
    </svg>
  ),
};

function IconeSol() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="4.2" />
      <path d="M12 2.5v2.4M12 19.1v2.4M4.2 4.2l1.7 1.7M18.1 18.1l1.7 1.7M2.5 12h2.4M19.1 12h2.4M4.2 19.8l1.7-1.7M18.1 5.9l1.7-1.7" />
    </svg>
  );
}

function IconeLua() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a6.8 6.8 0 0 0 10.5 10.5Z" />
    </svg>
  );
}

function IconeMenu() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M3.5 6.5h17M3.5 12h17M3.5 17.5h17" />
    </svg>
  );
}

export default function Layout({ children }) {
  const { usuario, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { tema, alternarTema } = useTema();
  const [menuAberto, setMenuAberto] = useState(false);
  const [modalSenhaAberto, setModalSenhaAberto] = useState(false);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="min-h-screen flex bg-[var(--cor-fundo)]">
      {menuAberto && (
        <div className="fixed inset-0 bg-black/60 z-40 md:hidden" onClick={() => setMenuAberto(false)} />
      )}

      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 border-r border-[var(--cor-borda)] bg-[var(--cor-fundo-elevado)] flex flex-col shrink-0 transition-transform duration-200 md:translate-x-0 ${
          menuAberto ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="px-6 py-6 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[var(--cor-verde-agua-suave)] border border-[var(--cor-verde-agua)]/30 flex items-center justify-center shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2C12 2 5 10 5 15.5C5 19.0899 8.13401 22 12 22C15.866 22 19 19.0899 19 15.5C19 10 12 2 12 2Z"
                stroke="#2dd4bf"
                strokeWidth="1.8"
              />
            </svg>
          </div>
          <span className="font-bold text-[var(--cor-texto-primario)] tracking-tight">ReusoPro</span>
          <button
            onClick={() => setMenuAberto(false)}
            className="ml-auto p-1 rounded-md text-[var(--cor-texto-secundario)] hover:text-[var(--cor-texto-primario)] md:hidden"
          >
            ✕
          </button>
        </div>

        <nav className="flex-1 px-3 py-2 space-y-1" onClick={() => setMenuAberto(false)}>
          {itens.map((item) => (
            <NavLink
              key={item.rota}
              to={item.rota}
              end={item.rota === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[var(--cor-verde-agua-suave)] text-[var(--cor-verde-agua-claro)]'
                    : 'text-[var(--cor-texto-secundario)] hover:text-[var(--cor-texto-primario)] hover:bg-[var(--cor-superficie)]'
                }`
              }
            >
              {icones[item.icone]}
              {item.label}
            </NavLink>
          ))}

          {isAdmin && (
            <NavLink
              to="/usuarios"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[var(--cor-verde-agua-suave)] text-[var(--cor-verde-agua-claro)]'
                    : 'text-[var(--cor-texto-secundario)] hover:text-[var(--cor-texto-primario)] hover:bg-[var(--cor-superficie)]'
                }`
              }
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="12" cy="8" r="3.2" />
                <path d="M5 20c0-3.6 3.1-6 7-6s7 2.4 7 6" />
              </svg>
              Usuários
            </NavLink>
          )}
        </nav>

        <div className="px-4 py-4 border-t border-[var(--cor-borda)] space-y-3">
          <button
            onClick={alternarTema}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-[var(--cor-texto-secundario)] hover:text-[var(--cor-texto-primario)] hover:bg-[var(--cor-superficie)] transition-colors"
          >
            {tema === 'dark' ? <IconeSol /> : <IconeLua />}
            {tema === 'dark' ? 'Tema claro' : 'Tema escuro'}
          </button>

          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm font-medium text-[var(--cor-texto-primario)] truncate">{usuario?.nome}</p>
              <p className="text-xs text-[var(--cor-texto-terciario)] capitalize">{usuario?.role}</p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => setModalSenhaAberto(true)}
                title="Trocar senha"
                className="p-2 rounded-lg text-[var(--cor-texto-secundario)] hover:text-[var(--cor-texto-primario)] hover:bg-[var(--cor-superficie)] transition-colors"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <rect x="5" y="11" width="14" height="9" rx="1.5" />
                  <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                </svg>
              </button>
              <button
                onClick={handleLogout}
                title="Sair"
                className="p-2 rounded-lg text-[var(--cor-texto-secundario)] hover:text-red-400 hover:bg-[var(--cor-vermelho-suave)] transition-colors"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M9 21H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h4" />
                  <path d="M16 17l5-5-5-5" />
                  <path d="M21 12H9" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {modalSenhaAberto && <ModalTrocarSenha onFechar={() => setModalSenhaAberto(false)} />}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-[var(--cor-borda)] bg-[var(--cor-fundo-elevado)] sticky top-0 z-30">
          <button
            onClick={() => setMenuAberto(true)}
            className="p-1.5 -ml-1.5 rounded-md text-[var(--cor-texto-secundario)] hover:text-[var(--cor-texto-primario)]"
          >
            <IconeMenu />
          </button>
          <span className="font-bold text-[var(--cor-texto-primario)] tracking-tight">ReusoPro</span>
          <button
            onClick={alternarTema}
            className="p-1.5 -mr-1.5 rounded-md text-[var(--cor-texto-secundario)] hover:text-[var(--cor-texto-primario)]"
          >
            {tema === 'dark' ? <IconeSol /> : <IconeLua />}
          </button>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
