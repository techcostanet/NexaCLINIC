import React from 'react';
import { MOTIVOS_DESCARTE } from '../utils/regras';

// Reason picker for early dialyzer discard, shared by both swap modals so the
// patient history always uses the same categories.
export default function SeletorMotivoDescarte({ titulo, motivo, onMotivo, detalhe, onDetalhe }) {
  return (
    <div className="mb-4">
      <label className="block text-xs font-medium text-[var(--cor-texto-secundario)] mb-1.5 uppercase tracking-wide">
        {titulo}
      </label>
      <select
        value={motivo}
        onChange={(e) => onMotivo(e.target.value)}
        className="w-full bg-[var(--cor-superficie)] border border-[var(--cor-borda)] rounded-lg px-3 py-2 text-sm text-[var(--cor-texto-primario)] outline-none focus:border-[var(--cor-verde-agua)]"
      >
        {MOTIVOS_DESCARTE.map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </select>
      {motivo === 'Outro' && (
        <textarea
          value={detalhe}
          onChange={(e) => onDetalhe(e.target.value)}
          rows={2}
          placeholder="Descreva o motivo..."
          className="w-full mt-2 bg-[var(--cor-superficie)] border border-[var(--cor-borda)] rounded-lg px-3 py-2 text-sm text-[var(--cor-texto-primario)] outline-none focus:border-[var(--cor-verde-agua)] resize-none"
        />
      )}
    </div>
  );
}
