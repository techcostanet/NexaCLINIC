// Business constants and rules mirrored from the backend
// (backend/src/domain/regrasNegocio.js). Keep both in sync.

export const MAX_REUSO = 20;

export const OPCOES_CAPILAR = ['B16H', 'B18H', 'B20H', 'B21H', 'B22H'];

/** Dialyzer model by weight: >100 B22H | >90 B21H | >80 B20H | >60 B18H | else B16H. */
export function calcularCapilarPorPeso(peso) {
  const p = Number(peso);
  if (!p) return '—';
  if (p > 100) return 'B22H';
  if (p > 90) return 'B21H';
  if (p > 80) return 'B20H';
  if (p > 60) return 'B18H';
  return 'B16H';
}

export const ESCALAS = [
  { valor: 'SEG_QUA_SEX', label: 'Segunda / Quarta / Sexta', curto: 'Seg/Qua/Sex' },
  { valor: 'TER_QUI_SAB', label: 'Terça / Quinta / Sábado', curto: 'Ter/Qui/Sáb' },
];
export const NOMES_ESCALA = Object.fromEntries(ESCALAS.map((e) => [e.valor, e.label]));
export const NOMES_ESCALA_CURTO = Object.fromEntries(ESCALAS.map((e) => [e.valor, e.curto]));

export const SALOES = [1, 2, 3];
export const TURNOS = [1, 2, 3];
export const BOXES = [1, 2, 3, 4, 5, 6, 7, 8];
export const POSICOES_BOX = [1, 2, 3, 4];

export const NOMES_DIA_SEMANA = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

export const MOTIVO_LABEL = {
  LIMITE_20_USOS: 'Limite de 20 usos',
  DESPREZADO_MANUAL: 'Descarte antecipado',
};

/** Reasons for discarding a dialyzer before the limit (stored in motivo_detalhe). */
export const MOTIVOS_DESCARTE = ['Baixa Prime / BP', 'Coagulação', 'Ruptura externa', 'Ruptura interna', 'Fuga de sangue', 'Outro'];

/**
 * Builds the swap payload from the shared "reason" UI state.
 * At the limit -> LIMITE_20_USOS; otherwise DESPREZADO_MANUAL with the
 * chosen reason (or the free text when "Outro").
 */
export function montarMotivoTroca({ noLimite, motivoDescarte, detalheOutro }) {
  if (noLimite) return { motivo: 'LIMITE_20_USOS', motivo_detalhe: null };
  return {
    motivo: 'DESPREZADO_MANUAL',
    motivo_detalhe: motivoDescarte === 'Outro' ? detalheOutro.trim() : motivoDescarte,
  };
}

// Priming volume printed on the label. Initial is typed in; final = initial - 20%.
export const PRIME_MIN = 100;
export const PRIME_MAX = 140;

export function calcularPrimeFinal(primeInicial) {
  const valor = Number(primeInicial);
  return valor ? String(Math.round(valor * 0.8)) : '';
}
