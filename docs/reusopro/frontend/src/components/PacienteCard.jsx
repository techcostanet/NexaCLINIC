import React, { useState } from 'react';
import { motion } from 'framer-motion';

const CORES_STATUS = {
  NORMAL: { anel: '#2dd4bf', texto: '#5eead4', bg: 'rgba(45, 212, 191, 0.08)', borda: 'rgba(45, 212, 191, 0.25)' },
  ATENCAO: { anel: '#facc15', texto: '#fde047', bg: 'rgba(250, 204, 21, 0.1)', borda: 'rgba(250, 204, 21, 0.35)' },
  CRITICO: { anel: '#ef4444', texto: '#f87171', bg: 'rgba(239, 68, 68, 0.12)', borda: 'rgba(239, 68, 68, 0.4)' },
};

function AnelProgresso({ valor, max = 20, cor }) {
  const raio = 22;
  const circunferencia = 2 * Math.PI * raio;
  const progresso = Math.min(valor / max, 1);
  const offset = circunferencia * (1 - progresso);

  return (
    <div className="relative w-14 h-14 shrink-0">
      <svg width="56" height="56" viewBox="0 0 56 56" className="-rotate-90">
        <circle cx="28" cy="28" r={raio} fill="none" stroke="#2a2a2a" strokeWidth="4" />
        <circle
          cx="28"
          cy="28"
          r={raio}
          fill="none"
          stroke={cor}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circunferencia}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.4s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="fonte-mono text-sm font-semibold" style={{ color: cor }}>
          {valor}
        </span>
      </div>
    </div>
  );
}

export default function PacienteCard({ paciente, onRealizarSessao, onRegistrarFalta, onTrocarCapilar, onVerHistorico, somenteLeitura }) {
  const [acaoCarregando, setAcaoCarregando] = useState(false);
  const cores = CORES_STATUS[paciente.status_visual] || CORES_STATUS.NORMAL;

  async function executar(fn) {
    setAcaoCarregando(true);
    try {
      await fn();
    } finally {
      setAcaoCarregando(false);
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-xl border p-4 flex flex-col gap-3"
      style={{ background: cores.bg, borderColor: cores.borda }}
    >
      <div className="flex items-center gap-3">
        <AnelProgresso valor={paciente.reuso_atual} cor={cores.anel} />
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-[var(--cor-texto-primario)] truncate">{paciente.nome}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="fonte-mono text-xs px-1.5 py-0.5 rounded bg-[var(--cor-superficie)] text-[var(--cor-texto-secundario)] border border-[var(--cor-borda)]">
              {paciente.capilar}
            </span>
            <span className="text-xs text-[var(--cor-texto-terciario)]">{Number(paciente.peso_kg)} kg</span>
            {paciente.extra_fixa && (
              <span
                title="Sessão extra fixa nesse dia da semana, além da escala normal"
                className="text-xs px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/25"
              >
                extra fixa
              </span>
            )}
          </div>
        </div>
        {onVerHistorico && (
          <button
            onClick={() => onVerHistorico(paciente)}
            title="Ver histórico de sessões, faltas e trocas"
            className="shrink-0 text-xs font-medium px-3 py-2 rounded-lg bg-[var(--cor-superficie)] text-[var(--cor-texto-secundario)] hover:text-[var(--cor-verde-agua-claro)] border border-[var(--cor-borda)] transition-colors"
          >
            Ver histórico
          </button>
        )}
      </div>

      {paciente.status_visual === 'CRITICO' && (
        <div className="text-xs font-medium px-2.5 py-1.5 rounded-lg bg-red-500/15 text-red-400 border border-red-500/30">
          Limite de 20 usos atingido — lance o novo capilar
        </div>
      )}
      {paciente.status_visual === 'ATENCAO' && (
        <div className="text-xs font-medium px-2.5 py-1.5 rounded-lg bg-yellow-500/10 text-yellow-400 border border-yellow-500/25">
          Perto do limite ({paciente.reuso_atual}/20)
        </div>
      )}

      {/* Attendance is automatic, so the main action depends on the day's status:
          REALIZADA -> record absence | FALTA -> undo | PENDENTE (job not run yet) -> both. */}
      {!somenteLeitura && (
        <div className="flex flex-wrap gap-2">
          {paciente.status_sessao === 'REALIZADA' ? (
            <button
              disabled={acaoCarregando}
              onClick={() => executar(() => onRegistrarFalta(paciente.id))}
              title="Presença automática — clique se o paciente não compareceu"
              className="flex-1 text-xs font-medium px-3 py-2 rounded-lg bg-[var(--cor-verde-agua-suave)] text-[var(--cor-verde-agua-claro)] hover:text-red-400 transition-colors disabled:opacity-50"
            >
              Presença automática · Lançar falta
            </button>
          ) : paciente.status_sessao === 'FALTA' ? (
            <button
              disabled={acaoCarregando}
              onClick={() => executar(() => onRealizarSessao(paciente.id))}
              title="Reverter — marca presença de novo"
              className="flex-1 text-xs font-medium px-3 py-2 rounded-lg bg-[var(--cor-vermelho-suave)] text-red-400 hover:text-[var(--cor-verde-agua-claro)] transition-colors disabled:opacity-50"
            >
              Falta registrada hoje · Desfazer
            </button>
          ) : (
            <>
              <button
                disabled={acaoCarregando}
                onClick={() => executar(() => onRealizarSessao(paciente.id))}
                className="flex-1 text-xs font-medium px-3 py-2 rounded-lg bg-[var(--cor-verde-agua)] text-black hover:bg-[var(--cor-verde-agua-claro)] transition-colors disabled:opacity-50"
              >
                Confirmar sessão
              </button>
              <button
                disabled={acaoCarregando}
                onClick={() => executar(() => onRegistrarFalta(paciente.id))}
                className="text-xs font-medium px-3 py-2 rounded-lg bg-[var(--cor-superficie)] text-[var(--cor-texto-secundario)] hover:text-red-400 border border-[var(--cor-borda)] transition-colors disabled:opacity-50"
              >
                Lançar falta
              </button>
            </>
          )}

          <button
            disabled={acaoCarregando}
            onClick={() => onTrocarCapilar(paciente)}
            title="Trocar ou desprezar capilar"
            className="text-xs font-medium px-3 py-2 rounded-lg bg-[var(--cor-superficie)] text-[var(--cor-texto-secundario)] hover:text-[var(--cor-verde-agua-claro)] border border-[var(--cor-borda)] transition-colors disabled:opacity-50"
          >
            Trocar capilar
          </button>
        </div>
      )}
    </motion.div>
  );
}
