import React, { useState } from 'react';
import { MAX_REUSO } from '../utils/regras';

const MAX_RESULTADOS = 8;

/**
 * Search-by-name panel used by the Dashboard for manual entries
 * (retroactive attendance/absence, extra session). Clicking a result calls
 * `onEscolher(paciente)`; when `data` is provided a date picker is shown.
 */
export default function PainelBuscaPaciente({ descricao, pacientes, onEscolher, data, onData, mensagem, destaque = 'verde' }) {
  const [busca, setBusca] = useState('');
  const termo = busca.trim().toLowerCase();
  const candidatos = termo ? pacientes.filter((p) => p.nome.toLowerCase().includes(termo)).slice(0, MAX_RESULTADOS) : [];
  const classeHover = destaque === 'vermelho' ? 'hover:border-red-400' : 'hover:border-[var(--cor-verde-agua)]';

  async function escolher(paciente) {
    if ((await onEscolher(paciente)) !== false) setBusca('');
  }

  return (
    <div className="mb-6 p-4 rounded-xl bg-[var(--cor-fundo-elevado)] border border-[var(--cor-borda)]">
      <p className="text-xs text-[var(--cor-texto-secundario)] mb-3">{descricao}</p>
      <div className="flex flex-col sm:flex-row gap-2">
        {onData && (
          <input
            type="date"
            value={data}
            onChange={(e) => onData(e.target.value)}
            className="bg-[var(--cor-superficie)] border border-[var(--cor-borda)] rounded-lg px-3 py-2 text-sm text-[var(--cor-texto-primario)] outline-none focus:border-[var(--cor-verde-agua)] fonte-mono"
          />
        )}
        <input
          type="text"
          autoFocus
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar paciente por nome..."
          className="flex-1 bg-[var(--cor-superficie)] border border-[var(--cor-borda)] rounded-lg px-3 py-2 text-sm text-[var(--cor-texto-primario)] outline-none focus:border-[var(--cor-verde-agua)]"
        />
      </div>
      {mensagem && <p className="mt-2 text-xs font-medium text-[var(--cor-verde-agua-claro)]">{mensagem}</p>}
      {termo && (
        <div className="mt-2 space-y-1">
          {candidatos.length === 0 ? (
            <p className="text-xs text-[var(--cor-texto-terciario)] px-1 py-2">Nenhum paciente encontrado.</p>
          ) : (
            candidatos.map((p) => (
              <button
                key={p.id}
                onClick={() => escolher(p)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg bg-[var(--cor-superficie)] border border-[var(--cor-borda)] text-sm text-left transition-colors ${classeHover}`}
              >
                <span className="text-[var(--cor-texto-primario)]">{p.nome}</span>
                <span className="fonte-mono text-xs text-[var(--cor-texto-secundario)]">
                  {p.reuso_atual}/{MAX_REUSO} · {p.capilar} · Salão {p.salao || '—'}
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
