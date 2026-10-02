import React, { useMemo, useState } from 'react';
import { PERIODOS, momentoDentroDoPeriodo } from '../utils/periodo';
import { MAX_REUSO, SALOES, TURNOS } from '../utils/regras';

function corPorPercentual(pct) {
  if (pct >= 90) return '#2dd4bf';
  if (pct >= 60) return '#facc15';
  return '#ef4444';
}

const percentualMedio = (trocas) =>
  trocas.length === 0 ? 0 : trocas.reduce((acc, t) => acc + (t.reuso_no_momento / MAX_REUSO) * 100, 0) / trocas.length;

function BarraHorizontal({ label, pct, total }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-[var(--cor-texto-secundario)] w-28 shrink-0 truncate">{label}</span>
      <div className="flex-1 h-3 rounded-full bg-[var(--cor-superficie)] border border-[var(--cor-borda)] overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${Math.min(100, pct)}%`, background: corPorPercentual(pct) }}
        />
      </div>
      <span className="fonte-mono text-xs text-[var(--cor-texto-primario)] w-24 shrink-0 text-right">
        {pct.toFixed(0)}% · {total} troca(s)
      </span>
    </div>
  );
}

/**
 * Utilization = uses reached by each discarded dialyzer (reuso_no_momento of
 * the swap) relative to the limit. Measures how much of each dialyzer was
 * actually used before leaving service, not the live counter of current ones.
 */
export default function PainelAproveitamento({ trocas }) {
  const [salaoFiltro, setSalaoFiltro] = useState('TODOS');
  const [turnoFiltro, setTurnoFiltro] = useState('TODOS');
  const [periodo, setPeriodo] = useState('TUDO');

  const trocasFiltradas = useMemo(
    () =>
      trocas.filter(
        (t) =>
          momentoDentroDoPeriodo(t.criado_em, periodo) &&
          (salaoFiltro === 'TODOS' || String(t.paciente_salao) === salaoFiltro) &&
          (turnoFiltro === 'TODOS' || String(t.paciente_turno) === turnoFiltro)
      ),
    [trocas, salaoFiltro, turnoFiltro, periodo]
  );

  const mediaGeral = percentualMedio(trocasFiltradas);
  const totalLimite = trocasFiltradas.filter((t) => t.motivo === 'LIMITE_20_USOS').length;
  const totalDesprezo = trocasFiltradas.length - totalLimite;

  // All rooms -> one bar per room. A single room -> one bar per shift inside it.
  const barras = useMemo(() => {
    const [chave, rotulo] = salaoFiltro === 'TODOS' ? ['paciente_salao', 'Salão'] : ['paciente_turno', 'Turno'];
    const grupos = new Map();
    for (const t of trocasFiltradas) {
      const k = t[chave] ?? 0;
      if (!grupos.has(k)) grupos.set(k, []);
      grupos.get(k).push(t);
    }
    return [...grupos.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([valor, itens]) => ({
        label: valor === 0 ? `Sem ${rotulo.toLowerCase()}` : `${rotulo} ${valor}`,
        pct: percentualMedio(itens),
        total: itens.length,
      }));
  }, [trocasFiltradas, salaoFiltro]);

  const classeSelect =
    'bg-[var(--cor-superficie)] border border-[var(--cor-borda)] rounded-lg px-3 py-1.5 text-xs text-[var(--cor-texto-primario)] outline-none focus:border-[var(--cor-verde-agua)]';

  return (
    <div className="bg-[var(--cor-fundo-elevado)] border border-[var(--cor-borda)] rounded-xl p-5">
      <div className="flex items-start justify-between flex-wrap gap-3 mb-5">
        <div>
          <h2 className="text-lg font-bold text-[var(--cor-texto-primario)]">Painel de aproveitamento</h2>
          <p className="text-xs text-[var(--cor-texto-secundario)] mt-0.5">
            % de uso alcançado pelos capilares já trocados, em relação ao limite de {MAX_REUSO} usos
          </p>
        </div>

        <div className="flex gap-2 flex-wrap">
          <select value={periodo} onChange={(e) => setPeriodo(e.target.value)} className={classeSelect}>
            {PERIODOS.map((p) => (
              <option key={p.valor} value={p.valor}>
                {p.label}
              </option>
            ))}
          </select>
          <select value={salaoFiltro} onChange={(e) => setSalaoFiltro(e.target.value)} className={classeSelect}>
            <option value="TODOS">Todos os salões</option>
            {SALOES.map((s) => (
              <option key={s} value={String(s)}>
                Salão {s}
              </option>
            ))}
          </select>
          <select value={turnoFiltro} onChange={(e) => setTurnoFiltro(e.target.value)} className={classeSelect}>
            <option value="TODOS">Todos os turnos</option>
            {TURNOS.map((t) => (
              <option key={t} value={String(t)}>
                {t}º turno
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <div className="px-4 py-3 rounded-lg bg-[var(--cor-superficie)] border border-[var(--cor-borda)]">
          <p className="fonte-mono text-xl font-semibold" style={{ color: corPorPercentual(mediaGeral) }}>
            {mediaGeral.toFixed(0)}%
          </p>
          <p className="text-xs text-[var(--cor-texto-secundario)] mt-0.5">Aproveitamento médio</p>
        </div>
        <div className="px-4 py-3 rounded-lg bg-[var(--cor-superficie)] border border-[var(--cor-borda)]">
          <p className="fonte-mono text-xl font-semibold text-[var(--cor-texto-primario)]">{trocasFiltradas.length}</p>
          <p className="text-xs text-[var(--cor-texto-secundario)] mt-0.5">Trocas no filtro</p>
        </div>
        <div className="px-4 py-3 rounded-lg bg-[var(--cor-superficie)] border border-[var(--cor-borda)]">
          <p className="fonte-mono text-xl font-semibold text-[var(--cor-verde-agua-claro)]">{totalLimite}</p>
          <p className="text-xs text-[var(--cor-texto-secundario)] mt-0.5">Por limite de {MAX_REUSO} usos</p>
        </div>
        <div className="px-4 py-3 rounded-lg bg-[var(--cor-superficie)] border border-[var(--cor-borda)]">
          <p className="fonte-mono text-xl font-semibold text-yellow-400">{totalDesprezo}</p>
          <p className="text-xs text-[var(--cor-texto-secundario)] mt-0.5">Descarte antecipado</p>
        </div>
      </div>

      {barras.length === 0 ? (
        <p className="text-xs text-[var(--cor-texto-terciario)] text-center py-6">Nenhuma troca de capilar encontrada para esse filtro.</p>
      ) : (
        <div className="space-y-2.5">
          {barras.map((b) => (
            <BarraHorizontal key={b.label} label={b.label} pct={b.pct} total={b.total} />
          ))}
        </div>
      )}
    </div>
  );
}
