import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MAX_REUSO, MOTIVOS_DESCARTE, montarMotivoTroca } from '../utils/regras';
import SeletorMotivoDescarte from './SeletorMotivoDescarte';

// Single-patient dialyzer swap (Dashboard and Patients screens).
export default function ModalTrocaCapilar({ paciente, onConfirmar, onFechar }) {
  const [noLimite, setNoLimite] = useState(paciente.reuso_atual >= MAX_REUSO);
  const [motivoDescarte, setMotivoDescarte] = useState(MOTIVOS_DESCARTE[0]);
  const [detalheOutro, setDetalheOutro] = useState('');
  const [loteNovo, setLoteNovo] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');

  async function handleConfirmar() {
    if (!noLimite && motivoDescarte === 'Outro' && !detalheOutro.trim()) {
      setErro('Descreva o motivo do desprezo.');
      return;
    }
    setErro('');
    setEnviando(true);
    try {
      await onConfirmar({
        ...montarMotivoTroca({ noLimite, motivoDescarte, detalheOutro }),
        novo_capilar_lote: loteNovo.trim() || null,
      });
    } catch (err) {
      setErro(err.response?.data?.erro || 'Não foi possível trocar o capilar.');
    } finally {
      setEnviando(false);
    }
  }

  const classeOpcao = (ativa) =>
    `w-full text-left px-3 py-2.5 rounded-lg border text-sm transition-colors ${
      ativa
        ? 'border-[var(--cor-verde-agua)] bg-[var(--cor-verde-agua-suave)] text-[var(--cor-verde-agua-claro)]'
        : 'border-[var(--cor-borda)] text-[var(--cor-texto-secundario)] hover:border-[var(--cor-texto-terciario)]'
    }`;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4"
        onClick={onFechar}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-[var(--cor-fundo-elevado)] border border-[var(--cor-borda)] rounded-2xl p-6 w-full max-w-md"
        >
          <h3 className="text-lg font-bold text-[var(--cor-texto-primario)] mb-1">Trocar capilar</h3>
          <p className="text-sm text-[var(--cor-texto-secundario)] mb-5">
            {paciente.nome} — {paciente.reuso_atual}/{MAX_REUSO} usos no capilar atual ({paciente.capilar})
          </p>

          <div className="mb-4">
            <label className="block text-xs font-medium text-[var(--cor-texto-secundario)] mb-2 uppercase tracking-wide">
              Motivo da troca
            </label>
            <div className="space-y-2">
              <button onClick={() => setNoLimite(true)} className={classeOpcao(noLimite)}>
                Limite de {MAX_REUSO} usos atingido
              </button>
              <button onClick={() => setNoLimite(false)} className={classeOpcao(!noLimite)}>
                Desprezar antes do limite (defeito / má qualidade)
              </button>
            </div>
          </div>

          {!noLimite && (
            <SeletorMotivoDescarte
              titulo="Motivo do descarte"
              motivo={motivoDescarte}
              onMotivo={setMotivoDescarte}
              detalhe={detalheOutro}
              onDetalhe={setDetalheOutro}
            />
          )}

          <div className="mb-5">
            <label className="block text-xs font-medium text-[var(--cor-texto-secundario)] mb-2 uppercase tracking-wide">
              Lote do novo capilar (opcional)
            </label>
            <input
              type="text"
              value={loteNovo}
              onChange={(e) => setLoteNovo(e.target.value)}
              placeholder="Ex: LT-0001"
              className="w-full bg-[var(--cor-superficie)] border border-[var(--cor-borda)] rounded-lg px-3 py-2 text-sm text-[var(--cor-texto-primario)] outline-none focus:border-[var(--cor-verde-agua)]"
            />
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
              onClick={handleConfirmar}
              disabled={enviando}
              className="flex-1 px-4 py-2.5 rounded-lg bg-[var(--cor-verde-agua)] text-black font-medium text-sm hover:bg-[var(--cor-verde-agua-claro)] transition-colors disabled:opacity-60"
            >
              {enviando ? 'Salvando...' : 'Confirmar troca'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
