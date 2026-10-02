import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTema } from '../hooks/useTema';

export default function Login() {
  const [username, setUsername] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { tema, alternarTema } = useTema();

  async function handleSubmit(e) {
    e.preventDefault();
    setErro('');
    setCarregando(true);
    try {
      await login(username, senha);
      navigate('/');
    } catch (err) {
      setErro(err.response?.data?.erro || 'Não foi possível entrar. Verifique usuário e senha.');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--cor-fundo)] relative overflow-hidden px-4">
      <button
        onClick={alternarTema}
        title={tema === 'dark' ? 'Tema claro' : 'Tema escuro'}
        className="absolute top-4 right-4 z-20 p-2.5 rounded-lg text-[var(--cor-texto-secundario)] hover:text-[var(--cor-texto-primario)] hover:bg-[var(--cor-superficie)] transition-colors"
      >
        {tema === 'dark' ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="12" cy="12" r="4.2" />
            <path d="M12 2.5v2.4M12 19.1v2.4M4.2 4.2l1.7 1.7M18.1 18.1l1.7 1.7M2.5 12h2.4M19.1 12h2.4M4.2 19.8l1.7-1.7M18.1 5.9l1.7-1.7" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a6.8 6.8 0 0 0 10.5 10.5Z" />
          </svg>
        )}
      </button>

      {/* Decorative rings echoing the reuse progress ring */}
      <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full border border-[var(--cor-verde-agua)] opacity-[0.07]" />
      <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full border border-[var(--cor-verde-agua)] opacity-[0.1]" />
      <div className="absolute -bottom-40 -left-20 w-80 h-80 rounded-full border border-[var(--cor-verde-agua)] opacity-[0.06]" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-sm"
      >
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[var(--cor-verde-agua-suave)] border border-[var(--cor-verde-agua)]/30 mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2C12 2 5 10 5 15.5C5 19.0899 8.13401 22 12 22C15.866 22 19 19.0899 19 15.5C19 10 12 2 12 2Z"
                stroke="#2dd4bf"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[var(--cor-texto-primario)] tracking-tight">ReusoPro</h1>
          <p className="text-sm text-[var(--cor-texto-secundario)] mt-1">Gestão de reuso de capilares</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-[var(--cor-fundo-elevado)] border border-[var(--cor-borda)] rounded-2xl p-7 shadow-2xl"
        >
          <div className="mb-4">
            <label className="block text-xs font-medium text-[var(--cor-texto-secundario)] mb-2 uppercase tracking-wide">
              Usuário
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
              className="w-full bg-[var(--cor-superficie)] border border-[var(--cor-borda)] rounded-lg px-4 py-2.5 text-[var(--cor-texto-primario)] outline-none focus:border-[var(--cor-verde-agua)] transition-colors"
              placeholder="seu.usuario"
              required
            />
          </div>

          <div className="mb-5">
            <label className="block text-xs font-medium text-[var(--cor-texto-secundario)] mb-2 uppercase tracking-wide">
              Senha
            </label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full bg-[var(--cor-superficie)] border border-[var(--cor-borda)] rounded-lg px-4 py-2.5 text-[var(--cor-texto-primario)] outline-none focus:border-[var(--cor-verde-agua)] transition-colors"
              placeholder="••••••••"
              required
            />
          </div>

          {erro && (
            <div className="mb-4 px-3 py-2 rounded-lg bg-[var(--cor-vermelho-suave)] border border-[var(--cor-vermelho)]/30 text-sm text-red-400">
              {erro}
            </div>
          )}

          <button
            type="submit"
            disabled={carregando}
            className="w-full bg-[var(--cor-verde-agua)] text-[#0a0a0a] font-semibold rounded-lg py-2.5 hover:bg-[var(--cor-verde-agua-claro)] transition-colors disabled:opacity-60"
          >
            {carregando ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="text-center text-xs text-[var(--cor-texto-terciario)] mt-6">
          Acesso restrito à equipe da unidade
        </p>
      </motion.div>
    </div>
  );
}
