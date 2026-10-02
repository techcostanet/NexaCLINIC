import React, { useEffect, useState, useCallback, useMemo } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { PERIODOS, calcularIntervalo } from '../utils/periodo';
import { formatarMomento as formatarData } from '../utils/datas';
import PainelAproveitamento from '../components/PainelAproveitamento';

function TrocaCard({ t, isAdmin, onExcluir }) {
  return (
    <div className="bg-[var(--cor-fundo-elevado)] border border-[var(--cor-borda)] rounded-xl p-4 flex items-start justify-between gap-4">
      <div>
        <p className="font-medium text-[var(--cor-texto-primario)]">{t.paciente_nome}</p>
        <div className="flex items-center gap-2 mt-1.5">
          {t.paciente_turno && (
            <span className="fonte-mono text-xs px-1.5 py-0.5 rounded bg-[var(--cor-superficie)] border border-[var(--cor-borda)] text-[var(--cor-texto-secundario)]">
              {t.paciente_turno}º turno
            </span>
          )}
          <span className="fonte-mono text-xs px-1.5 py-0.5 rounded bg-[var(--cor-superficie)] border border-[var(--cor-borda)] text-[var(--cor-texto-terciario)]">
            {t.capilar_anterior || '—'}
          </span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--cor-texto-terciario)]">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
          <span className="fonte-mono text-xs px-1.5 py-0.5 rounded bg-[var(--cor-verde-agua-suave)] border border-[var(--cor-verde-agua)]/30 text-[var(--cor-verde-agua-claro)]">
            {t.capilar_novo}
          </span>
        </div>
        {t.motivo_detalhe && (
          <p className="text-xs text-[var(--cor-texto-terciario)] mt-2 italic">"{t.motivo_detalhe}"</p>
        )}
      </div>
      <div className="text-right shrink-0">
        <span
          className={`text-xs font-medium px-2 py-1 rounded-full ${
            t.motivo === 'LIMITE_20_USOS'
              ? 'bg-[var(--cor-verde-agua-suave)] text-[var(--cor-verde-agua-claro)]'
              : 'bg-yellow-500/10 text-yellow-400'
          }`}
        >
          {t.motivo === 'LIMITE_20_USOS' ? 'Limite 20 usos' : 'Desprezo manual'}
        </span>
        <p className="text-xs text-[var(--cor-texto-terciario)] mt-1.5">{formatarData(t.criado_em)}</p>
        <p className="fonte-mono text-xs text-[var(--cor-texto-secundario)] mt-0.5">{t.reuso_no_momento} usos</p>
        {isAdmin && (
          <button
            onClick={() => onExcluir(t)}
            title="Excluir esse registro de troca (somente admin)"
            className="text-xs text-red-400/80 hover:text-red-400 hover:underline mt-2"
          >
            Excluir
          </button>
        )}
      </div>
    </div>
  );
}

export default function Trocas() {
  const { isAdmin } = useAuth();
  const [trocas, setTrocas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [periodo, setPeriodo] = useState('TUDO');
  const [gruposFechados, setGruposFechados] = useState(() => new Set());
  const [turnoFiltroPorSalao, setTurnoFiltroPorSalao] = useState({});

  const carregar = useCallback(() => {
    setCarregando(true);
    api.get('/trocas', { params: calcularIntervalo(periodo) }).then(({ data }) => {
      setTrocas(data);
      setCarregando(false);
    });
  }, [periodo]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function excluirTroca(troca) {
    if (!window.confirm(`Excluir o registro de troca de ${troca.paciente_nome}? Essa ação não pode ser desfeita.`)) return;
    await api.delete(`/trocas/${troca.id}`);
    carregar();
  }

  function turnoDoSalao(salao) {
    return turnoFiltroPorSalao[salao] || 'TODOS';
  }

  function setTurnoDoSalao(salao, turno) {
    setTurnoFiltroPorSalao((prev) => ({ ...prev, [salao]: turno }));
  }

  function alternarGrupo(chave) {
    setGruposFechados((prev) => {
      const proximo = new Set(prev);
      if (proximo.has(chave)) proximo.delete(chave);
      else proximo.add(chave);
      return proximo;
    });
  }

  const totalLimite = trocas.filter((t) => t.motivo === 'LIMITE_20_USOS').length;
  const totalDesprezo = trocas.length - totalLimite;

  const gruposPorSalao = useMemo(() => {
    const porSalao = new Map();
    for (const t of trocas) {
      const salao = t.paciente_salao || 0;
      if (!porSalao.has(salao)) porSalao.set(salao, []);
      porSalao.get(salao).push(t);
    }
    return [...porSalao.entries()].sort((a, b) => a[0] - b[0]);
  }, [trocas]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--cor-texto-primario)]">Trocas de Capilar</h1>
        <p className="text-sm text-[var(--cor-texto-secundario)] mt-1">Histórico completo de todas as trocas registradas</p>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        {PERIODOS.map((p) => (
          <button
            key={p.valor}
            onClick={() => setPeriodo(p.valor)}
            className={`text-sm font-medium px-3.5 py-1.5 rounded-full transition-colors ${
              periodo === p.valor
                ? 'bg-[var(--cor-verde-agua)] text-black'
                : 'bg-[var(--cor-fundo-elevado)] text-[var(--cor-texto-secundario)] border border-[var(--cor-borda)]'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {!carregando && trocas.length > 0 && (
        <div className="flex gap-3 mb-6 flex-wrap">
          <div className="px-4 py-2.5 rounded-xl bg-[var(--cor-fundo-elevado)] border border-[var(--cor-borda)] flex items-center gap-2">
            <span className="fonte-mono text-lg font-semibold text-[var(--cor-texto-primario)]">{trocas.length}</span>
            <span className="text-xs text-[var(--cor-texto-secundario)]">troca(s) no período</span>
          </div>
          <div className="px-4 py-2.5 rounded-xl bg-[var(--cor-verde-agua-suave)] border border-[var(--cor-verde-agua)]/25 flex items-center gap-2">
            <span className="fonte-mono text-lg font-semibold text-[var(--cor-verde-agua-claro)]">{totalLimite}</span>
            <span className="text-xs text-[var(--cor-verde-agua-claro)]/80">por limite de 20 usos</span>
          </div>
          <div className="px-4 py-2.5 rounded-xl bg-yellow-500/10 border border-yellow-500/25 flex items-center gap-2">
            <span className="fonte-mono text-lg font-semibold text-yellow-400">{totalDesprezo}</span>
            <span className="text-xs text-yellow-400/80">descarte antecipado</span>
          </div>
        </div>
      )}

      {carregando ? (
        <div className="text-center py-16 text-[var(--cor-texto-terciario)] text-sm">Carregando...</div>
      ) : trocas.length === 0 ? (
        <div className="text-center py-16 text-[var(--cor-texto-terciario)] text-sm">
          Nenhuma troca registrada {periodo === 'TUDO' ? 'ainda' : 'nesse período'}.
        </div>
      ) : (
        <div className="space-y-4">
          {gruposPorSalao.map(([salao, itens]) => {
            const chave = `salao-${salao}`;
            const fechado = gruposFechados.has(chave);
            const turnoSelecionado = turnoDoSalao(salao);
            const contagemPorTurno = { 1: 0, 2: 0, 3: 0 };
            for (const t of itens) {
              if (t.paciente_turno) contagemPorTurno[t.paciente_turno] = (contagemPorTurno[t.paciente_turno] || 0) + 1;
            }
            const itensFiltrados =
              turnoSelecionado === 'TODOS' ? itens : itens.filter((t) => String(t.paciente_turno) === turnoSelecionado);
            return (
              <div key={salao} className="bg-[var(--cor-fundo-elevado)] border border-[var(--cor-borda)] rounded-xl overflow-hidden">
                <button
                  onClick={() => alternarGrupo(chave)}
                  className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-[var(--cor-superficie)] transition-colors"
                >
                  <span className="text-sm font-semibold text-[var(--cor-texto-primario)]">
                    {salao === 0 ? 'Sem salão definido' : `Salão ${salao}`}
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="text-xs text-[var(--cor-texto-terciario)]">{itens.length} troca(s)</span>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className={`text-[var(--cor-texto-secundario)] transition-transform ${fechado ? '' : 'rotate-180'}`}
                    >
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </span>
                </button>
                {!fechado && (
                  <div className="p-3 space-y-3 border-t border-[var(--cor-borda)]">
                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => setTurnoDoSalao(salao, 'TODOS')}
                        className={`text-xs font-medium px-3 py-1 rounded-full transition-colors ${
                          turnoSelecionado === 'TODOS'
                            ? 'bg-[var(--cor-verde-agua)] text-black'
                            : 'bg-[var(--cor-superficie)] text-[var(--cor-texto-secundario)] border border-[var(--cor-borda)]'
                        }`}
                      >
                        Todos os turnos
                      </button>
                      {[1, 2, 3].map((turno) => (
                        <button
                          key={turno}
                          onClick={() => setTurnoDoSalao(salao, String(turno))}
                          className={`text-xs font-medium px-3 py-1 rounded-full transition-colors ${
                            turnoSelecionado === String(turno)
                              ? 'bg-[var(--cor-verde-agua)] text-black'
                              : 'bg-[var(--cor-superficie)] text-[var(--cor-texto-secundario)] border border-[var(--cor-borda)]'
                          }`}
                        >
                          {turno}º turno ({contagemPorTurno[turno]})
                        </button>
                      ))}
                    </div>
                    {itensFiltrados.length === 0 ? (
                      <div className="text-center py-6 text-[var(--cor-texto-terciario)] text-xs">
                        Nenhuma troca desse turno nesse salão.
                      </div>
                    ) : (
                      itensFiltrados.map((t) => <TrocaCard key={t.id} t={t} isAdmin={isAdmin} onExcluir={excluirTroca} />)
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {!carregando && trocas.length > 0 && (
        <div className="mt-8">
          <PainelAproveitamento trocas={trocas} />
        </div>
      )}
    </div>
  );
}
