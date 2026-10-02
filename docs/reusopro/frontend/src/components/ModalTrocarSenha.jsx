import React, { useState } from 'react';
import api from '../services/api';

export default function ModalTrocarSenha({ onFechar }) {
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(false);

  async function salvar() {
    if (!senhaAtual || !novaSenha) {
      setErro('Preencha a senha atual e a nova senha.');
      return;
    }
    if (novaSenha.length < 8) {
      setErro('A nova senha deve ter ao menos 8 caracteres.');
      return;
    }
    if (novaSenha !== confirmarSenha) {
      setErro('A confirmação não bate com a nova senha.');
      return;
    }
    setSalvando(true);
    setErro('');
    try {
      await api.patch('/auth/senha', { senhaAtual, novaSenha });
      setSucesso(true);
    } catch (err) {
      setErro(err.response?.data?.erro || 'Erro ao trocar senha.');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4" onClick={onFechar}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[var(--cor-fundo-elevado)] border border-[var(--cor-borda)] rounded-2xl p-6 w-full max-w-sm"
      >
        <h3 className="text-lg font-bold text-[var(--cor-texto-primario)] mb-5">Trocar senha</h3>

        {sucesso ? (
          <>
            <p className="text-sm text-[var(--cor-verde-agua-claro)] mb-5">Senha alterada com sucesso.</p>
            <button
              onClick={onFechar}
              className="w-full px-4 py-2.5 rounded-lg bg-[var(--cor-verde-agua)] text-black font-medium text-sm hover:bg-[var(--cor-verde-agua-claro)] transition-colors"
            >
              Fechar
            </button>
          </>
        ) : (
          <>
            <div className="space-y-3 mb-5">
              <div>
                <label className="block text-xs font-medium text-[var(--cor-texto-secundario)] mb-1.5 uppercase tracking-wide">
                  Senha atual
                </label>
                <input
                  type="password"
                  autoFocus
                  value={senhaAtual}
                  onChange={(e) => setSenhaAtual(e.target.value)}
                  className="w-full bg-[var(--cor-superficie)] border border-[var(--cor-borda)] rounded-lg px-3 py-2 text-sm text-[var(--cor-texto-primario)] outline-none focus:border-[var(--cor-verde-agua)]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--cor-texto-secundario)] mb-1.5 uppercase tracking-wide">
                  Nova senha
                </label>
                <input
                  type="password"
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  className="w-full bg-[var(--cor-superficie)] border border-[var(--cor-borda)] rounded-lg px-3 py-2 text-sm text-[var(--cor-texto-primario)] outline-none focus:border-[var(--cor-verde-agua)]"
                />
                <p className="text-xs text-[var(--cor-texto-terciario)] mt-1">Mínimo 8 caracteres.</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--cor-texto-secundario)] mb-1.5 uppercase tracking-wide">
                  Confirmar nova senha
                </label>
                <input
                  type="password"
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  className="w-full bg-[var(--cor-superficie)] border border-[var(--cor-borda)] rounded-lg px-3 py-2 text-sm text-[var(--cor-texto-primario)] outline-none focus:border-[var(--cor-verde-agua)]"
                />
              </div>
            </div>

            {erro && (
              <div className="mb-4 px-3 py-2 rounded-lg bg-[var(--cor-vermelho-suave)] border border-[var(--cor-vermelho)]/30 text-sm text-red-400">
                {erro}
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={onFechar}
                className="flex-1 px-4 py-2.5 rounded-lg border border-[var(--cor-borda)] text-sm text-[var(--cor-texto-secundario)] hover:text-[var(--cor-texto-primario)] transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={salvar}
                disabled={salvando}
                className="flex-1 px-4 py-2.5 rounded-lg bg-[var(--cor-verde-agua)] text-black font-medium text-sm hover:bg-[var(--cor-verde-agua-claro)] transition-colors disabled:opacity-60"
              >
                {salvando ? 'Salvando...' : 'Trocar senha'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
