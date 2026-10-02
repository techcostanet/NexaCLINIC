import React, { useEffect, useState } from 'react';
import api from '../services/api';

const USUARIO_VAZIO = { nome: '', username: '', senha: '', role: 'operador' };

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [form, setForm] = useState(USUARIO_VAZIO);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');

  async function carregar() {
    setCarregando(true);
    const { data } = await api.get('/auth/usuarios');
    setUsuarios(data);
    setCarregando(false);
  }

  useEffect(() => {
    carregar();
  }, []);

  async function salvar() {
    if (!form.nome.trim() || !form.username.trim() || !form.senha) {
      setErro('Preencha nome, usuário e senha.');
      return;
    }
    setSalvando(true);
    setErro('');
    try {
      await api.post('/auth/usuarios', form);
      setModalAberto(false);
      setForm(USUARIO_VAZIO);
      carregar();
    } catch (err) {
      setErro(err.response?.data?.erro || 'Erro ao criar usuário.');
    } finally {
      setSalvando(false);
    }
  }

  async function alternarAtivo(usuario) {
    await api.patch(`/auth/usuarios/${usuario.id}/ativo`);
    carregar();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[var(--cor-texto-primario)]">Usuários</h1>
          <p className="text-sm text-[var(--cor-texto-secundario)] mt-1">Quem pode acessar o ReusoPro</p>
        </div>
        <button
          onClick={() => {
            setForm(USUARIO_VAZIO);
            setErro('');
            setModalAberto(true);
          }}
          className="px-4 py-2.5 rounded-lg bg-[var(--cor-verde-agua)] text-black font-medium text-sm hover:bg-[var(--cor-verde-agua-claro)] transition-colors"
        >
          + Novo usuário
        </button>
      </div>

      {carregando ? (
        <div className="text-center py-16 text-[var(--cor-texto-terciario)] text-sm">Carregando...</div>
      ) : (
        <div className="bg-[var(--cor-fundo-elevado)] border border-[var(--cor-borda)] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[520px]">
            <thead>
              <tr className="border-b border-[var(--cor-borda)] text-left text-[var(--cor-texto-terciario)]">
                <th className="px-4 py-3 font-medium">Nome</th>
                <th className="px-4 py-3 font-medium">Usuário</th>
                <th className="px-4 py-3 font-medium">Função</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u) => (
                <tr key={u.id} className="border-b border-[var(--cor-borda)] last:border-0">
                  <td className="px-4 py-3 text-[var(--cor-texto-primario)] font-medium">{u.nome}</td>
                  <td className="px-4 py-3 fonte-mono text-[var(--cor-texto-secundario)]">{u.username}</td>
                  <td className="px-4 py-3 text-[var(--cor-texto-secundario)] capitalize">{u.role}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        u.ativo ? 'bg-[var(--cor-verde-agua-suave)] text-[var(--cor-verde-agua-claro)]' : 'bg-[var(--cor-vermelho-suave)] text-red-400'
                      }`}
                    >
                      {u.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => alternarAtivo(u)} className="text-xs text-[var(--cor-verde-agua-claro)] hover:underline">
                      {u.ativo ? 'Desativar' : 'Ativar'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}

      {modalAberto && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4"
          onClick={() => setModalAberto(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[var(--cor-fundo-elevado)] border border-[var(--cor-borda)] rounded-2xl p-6 w-full max-w-sm"
          >
            <h3 className="text-lg font-bold text-[var(--cor-texto-primario)] mb-5">Novo usuário</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[var(--cor-texto-secundario)] mb-1.5 uppercase tracking-wide">
                  Nome completo
                </label>
                <input
                  type="text"
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  className="w-full bg-[var(--cor-superficie)] border border-[var(--cor-borda)] rounded-lg px-3 py-2 text-sm text-[var(--cor-texto-primario)] outline-none focus:border-[var(--cor-verde-agua)]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--cor-texto-secundario)] mb-1.5 uppercase tracking-wide">
                  Usuário (login)
                </label>
                <input
                  type="text"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  className="w-full bg-[var(--cor-superficie)] border border-[var(--cor-borda)] rounded-lg px-3 py-2 text-sm text-[var(--cor-texto-primario)] outline-none focus:border-[var(--cor-verde-agua)]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--cor-texto-secundario)] mb-1.5 uppercase tracking-wide">
                  Senha
                </label>
                <input
                  type="password"
                  value={form.senha}
                  onChange={(e) => setForm({ ...form, senha: e.target.value })}
                  className="w-full bg-[var(--cor-superficie)] border border-[var(--cor-borda)] rounded-lg px-3 py-2 text-sm text-[var(--cor-texto-primario)] outline-none focus:border-[var(--cor-verde-agua)]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--cor-texto-secundario)] mb-1.5 uppercase tracking-wide">
                  Função
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setForm({ ...form, role: 'operador' })}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                      form.role === 'operador'
                        ? 'bg-[var(--cor-verde-agua)] text-black'
                        : 'bg-[var(--cor-superficie)] text-[var(--cor-texto-secundario)] border border-[var(--cor-borda)]'
                    }`}
                  >
                    Operador
                  </button>
                  <button
                    onClick={() => setForm({ ...form, role: 'admin' })}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                      form.role === 'admin'
                        ? 'bg-[var(--cor-verde-agua)] text-black'
                        : 'bg-[var(--cor-superficie)] text-[var(--cor-texto-secundario)] border border-[var(--cor-borda)]'
                    }`}
                  >
                    Admin
                  </button>
                </div>
              </div>
            </div>

            {erro && (
              <div className="mt-4 px-3 py-2 rounded-lg bg-[var(--cor-vermelho-suave)] border border-[var(--cor-vermelho)]/30 text-sm text-red-400">
                {erro}
              </div>
            )}

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setModalAberto(false)}
                className="flex-1 px-4 py-2.5 rounded-lg border border-[var(--cor-borda)] text-sm text-[var(--cor-texto-secundario)] hover:text-[var(--cor-texto-primario)] transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={salvar}
                disabled={salvando}
                className="flex-1 px-4 py-2.5 rounded-lg bg-[var(--cor-verde-agua)] text-black font-medium text-sm hover:bg-[var(--cor-verde-agua-claro)] transition-colors disabled:opacity-60"
              >
                {salvando ? 'Salvando...' : 'Criar usuário'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
