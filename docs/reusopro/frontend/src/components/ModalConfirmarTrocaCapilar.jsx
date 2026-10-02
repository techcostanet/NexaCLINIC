import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MAX_REUSO, MOTIVOS_DESCARTE, montarMotivoTroca } from '../utils/regras';
import { formatarData } from '../utils/datas';
import SeletorMotivoDescarte from './SeletorMotivoDescarte';

// Asked before printing labels: is this print also a dialyzer swap? If so,
// every selected patient gets a swap whose new dialyzer starts on the label's
// first-use date. "Skip" just prints.
export default function ModalConfirmarTrocaCapilar({ pacientes, dataPrimeiroUso, onPular, onConfirmarTroca }) {
  const [todosNoLimite, setTodosNoLimite] = useState(false);
  const [motivoDescarte, setMotivoDescarte] = useState(MOTIVOS_DESCARTE[0]);
  const [detalheOutro, setDetalheOutro] = useState('');
  const [processando, setProcessando] = useState(false);
  const [erro, setErro] = useState('');

  async function confirmar() {
    if (!todosNoLimite && motivoDescarte === 'Outro' && !detalheOutro.trim()) {
      setErro('Descreva o motivo da troca.');
      return;
    }
    setErro('');
    setProcessando(true);
    try {
      await onConfirmarTroca(montarMotivoTroca({ noLimite: todosNoLimite, motivoDescarte, detalheOutro }));
    } catch (err) {
      setErro(err.message || 'Não foi possível trocar o capilar de todos os pacientes selecionados.');
      setProcessando(false);
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-[var(--cor-fundo-elevado)] border border-[var(--cor-borda)] rounded-2xl p-6 w-full max-w-md"
        >
          <h3 className="text-lg font-bold text-[var(--cor-texto-primario)] mb-1">Troca de capilar?</h3>
          <p className="text-sm text-[var(--cor-texto-secundario)] mb-4">
            Esse(s) {pacientes.length} paciente(s) está(ão) tendo o capilar trocado agora?
          </p>

          <div className="mb-4 px-3.5 py-3 rounded-lg bg-[var(--cor-verde-agua-suave)] border border-[var(--cor-verde-agua)]/25 text-sm text-[var(--cor-verde-agua-claro)]">
            Se confirmar, o sistema fecha o capilar atual de cada paciente hoje (registrando no histórico) e já abre
            o novo com início em <strong>{formatarData(dataPrimeiroUso)}</strong> — a data do primeiro uso da
            etiqueta — zerando o reuso.
          </div>

          <ul className="mb-4 max-h-28 overflow-y-auto space-y-1 text-xs text-[var(--cor-texto-secundario)]">
            {pacientes.map((p) => (
              <li key={p.id} className="flex items-center justify-between px-2 py-1 rounded bg-[var(--cor-superficie)]">
                <span>{p.nome}</span>
                <span className="fonte-mono">{p.capilar}</span>
              </li>
            ))}
          </ul>

          <label className="flex items-start gap-2.5 px-3 py-2.5 rounded-lg bg-[var(--cor-superficie)] border border-[var(--cor-borda)] cursor-pointer mb-4">
            <input
              type="checkbox"
              checked={todosNoLimite}
              onChange={(e) => setTodosNoLimite(e.target.checked)}
              className="mt-0.5 accent-[var(--cor-verde-agua)]"
            />
            <span className="text-sm text-[var(--cor-texto-primario)] leading-relaxed">
              Todos são {MAX_REUSO} usos = limite
              <span className="block text-xs text-[var(--cor-texto-terciario)] mt-0.5">
                Marque se essa troca é porque o capilar bateu o limite de {MAX_REUSO} usos. Se desmarcado, é preciso
                informar o motivo pra ficar organizado no histórico do paciente.
              </span>
            </span>
          </label>

          {!todosNoLimite && (
            <SeletorMotivoDescarte
              titulo="Motivo da troca"
              motivo={motivoDescarte}
              onMotivo={setMotivoDescarte}
              detalhe={detalheOutro}
              onDetalhe={setDetalheOutro}
            />
          )}

          {erro && (
            <div className="mb-4 px-3 py-2 rounded-lg bg-[var(--cor-vermelho-suave)] border border-[var(--cor-vermelho)]/30 text-sm text-red-400">
              {erro}
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={onPular}
              disabled={processando}
              className="flex-1 px-4 py-2.5 rounded-lg border border-[var(--cor-borda)] text-sm text-[var(--cor-texto-secundario)] hover:text-[var(--cor-texto-primario)] transition-colors disabled:opacity-60"
            >
              Pular e só imprimir
            </button>
            <button
              onClick={confirmar}
              disabled={processando}
              className="flex-1 px-4 py-2.5 rounded-lg bg-[var(--cor-verde-agua)] text-black font-medium text-sm hover:bg-[var(--cor-verde-agua-claro)] transition-colors disabled:opacity-60"
            >
              {processando ? 'Trocando...' : 'Confirmar e imprimir'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
