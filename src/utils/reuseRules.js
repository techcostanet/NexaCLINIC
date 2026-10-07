// ============================================================
// Regras de Negócio Puras — Módulo .REUSE (Reuso de Dialisadores)
// ============================================================

/** Limite máximo regulamentar de utilizações de um dialisador/capilar */
export const MAX_REUSO = 20;

/** Limiar de atenção para aviso prévio de troca */
export const LIMIAR_ATENCAO = 18;

/** Opções oficiais de modelos de capilares de alta eficiência */
export const OPCOES_CAPILAR = ['B16H', 'B18H', 'B20H', 'B21H', 'B22H'];

/**
 * Dimensionamento de capilar por faixa de peso do paciente:
 *   > 100 kg -> B22H
 *   > 90 kg  -> B21H
 *   > 80 kg  -> B20H
 *   > 60 kg  -> B18H
 *   <= 60 kg -> B16H
 */
export function calcularCapilarPorPeso(peso) {
  const p = Number(peso);
  if (!p || p <= 0) return 'B16H';
  if (p > 100) return 'B22H';
  if (p > 90) return 'B21H';
  if (p > 80) return 'B20H';
  if (p > 60) return 'B18H';
  return 'B16H';
}

/** Escalas de diálise e dias correspondentes (0 = Dom ... 6 = Sáb) */
export const DIAS_POR_ESCALA = {
  SEG_QUA_SEX: [1, 3, 5],
  TER_QUI_SAB: [2, 4, 6],
};

export const ESCALAS = [
  { valor: 'SEG_QUA_SEX', label: 'Segunda / Quarta / Sexta', curto: 'Seg/Qua/Sex' },
  { valor: 'TER_QUI_SAB', label: 'Terça / Quinta / Sábado', curto: 'Ter/Qui/Sáb' },
];

export const NOMES_ESCALA = Object.fromEntries(ESCALAS.map((e) => [e.valor, e.label]));
export const NOMES_ESCALA_CURTO = Object.fromEntries(ESCALAS.map((e) => [e.valor, e.curto]));

export const SALOES = [1, 2, 3];
export const TURNOS = [1, 2, 3];
export const TOTAL_BOXES = 8;
export const BOXES = [1, 2, 3, 4, 5, 6, 7, 8];
export const POSICOES_BOX = [1, 2, 3, 4];
export const TOTAL_POSICOES_POR_BOX = 4;

export const NOMES_DIA_SEMANA = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

/** Status visual do contador de reuso: NORMAL | ATENCAO | CRITICO */
export function statusReuso(reusoAtual) {
  const r = Number(reusoAtual) || 0;
  if (r >= MAX_REUSO) return 'CRITICO';
  if (r >= LIMIAR_ATENCAO) return 'ATENCAO';
  return 'NORMAL';
}

/** Retorna a escala ativa de acordo com o dia da semana (ou null aos domingos) */
export function escalaDoDiaSemana(diaSemana) {
  return Object.keys(DIAS_POR_ESCALA).find((e) => DIAS_POR_ESCALA[e].includes(diaSemana)) || null;
}

/** Verifica se um dia específico faz parte da escala regular do paciente */
export function ehDiaDaEscala(escala, diaSemana) {
  return (DIAS_POR_ESCALA[escala] || []).includes(diaSemana);
}

/** Incremento de presença com trava no limite máximo */
export function incrementarReuso(reusoAtual) {
  const r = Number(reusoAtual) || 0;
  return Math.min(MAX_REUSO, r + 1);
}

/** Decremento de falta com piso zero */
export function decrementarReuso(reusoAtual) {
  const r = Number(reusoAtual) || 0;
  return Math.max(0, r - 1);
}

/** Motivos padronizados de troca de dialisador */
export const MOTIVOS_TROCA = ['LIMITE_20_USOS', 'DESPREZADO_MANUAL'];

export const MOTIVO_LABEL = {
  LIMITE_20_USOS: 'Limite 20 Usos',
  DESPREZADO_MANUAL: 'Descarte Precoce',
};

/** Motivos clínicos de descarte precoce de capilar */
export const MOTIVOS_DESCARTE = [
  'Baixa Prime / BP',
  'Coagulação de Fibras',
  'Ruptura Externa',
  'Ruptura Interna',
  'Fuga de Sangue',
  'Reação Pirogênica',
  'Vazamento',
  'Outro'
];

/** Montagem do payload de motivo de troca */
export function montarMotivoTroca({ noLimite, motivoDescarte, detalheOutro }) {
  if (noLimite) return { motivo: 'LIMITE_20_USOS', motivo_detalhe: null };
  return {
    motivo: 'DESPREZADO_MANUAL',
    motivo_detalhe: motivoDescarte === 'Outro' ? (detalheOutro || '').trim() : motivoDescarte,
  };
}

/** Volume de Prime em mL impresso na etiqueta */
export const PRIME_MIN = 100;
export const PRIME_MAX = 140;

/** Cálculo do Prime Final (Volume Residual): PF = PI * 0.8 (perda aceitável de até 20%) */
export function calcularPrimeFinal(primeInicial) {
  const valor = Number(primeInicial);
  return valor && valor > 0 ? String(Math.round(valor * 0.8)) : '';
}

/** Determina o modelo de capilar após troca */
export function capilarAposTroca(paciente) {
  if (paciente?.capilar_manual && paciente?.capilar) {
    return paciente.capilar;
  }
  return calcularCapilarPorPeso(paciente?.peso_kg || paciente?.weight);
}
