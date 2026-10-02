// ============================================================
// Core business rules. Pure functions only (no I/O) so they can be
// reused or unit-tested anywhere.
// ============================================================

/** Maximum number of uses for one dialyzer before it must be replaced. */
const MAX_REUSO = 20;

/** From this count on, the patient is flagged as "near the limit". */
const LIMIAR_ATENCAO = 18;

/** Weekly schedules and their weekdays (0 = Sunday ... 6 = Saturday). */
const DIAS_POR_ESCALA = {
  SEG_QUA_SEX: [1, 3, 5],
  TER_QUI_SAB: [2, 4, 6],
};
const ESCALAS = Object.keys(DIAS_POR_ESCALA);

const SALOES = [1, 2, 3];
const TURNOS = [1, 2, 3];
const TOTAL_BOXES = 8;
const POSICOES_POR_BOX = 4;

/** Why a dialyzer was swapped. */
const MOTIVOS_TROCA = ['LIMITE_20_USOS', 'DESPREZADO_MANUAL'];

/**
 * Dialyzer model by patient weight:
 *   > 100kg -> B22H | > 90kg -> B21H | > 80kg -> B20H | > 60kg -> B18H | else B16H
 */
function calcularCapilarPorPeso(pesoKg) {
  const peso = Number(pesoKg);
  if (peso > 100) return 'B22H';
  if (peso > 90) return 'B21H';
  if (peso > 80) return 'B20H';
  if (peso > 60) return 'B18H';
  return 'B16H';
}

/** Visual status used by the dashboard: NORMAL | ATENCAO (yellow) | CRITICO (red). */
function statusReuso(reusoAtual) {
  if (reusoAtual >= MAX_REUSO) return 'CRITICO';
  if (reusoAtual >= LIMIAR_ATENCAO) return 'ATENCAO';
  return 'NORMAL';
}

/** Schedule that runs on a given weekday, or null on Sunday. */
function escalaDoDiaSemana(diaSemana) {
  return ESCALAS.find((e) => DIAS_POR_ESCALA[e].includes(diaSemana)) || null;
}

/** A session is "extra" when it happens outside the patient's regular schedule. */
function ehDiaDaEscala(escala, diaSemana) {
  return (DIAS_POR_ESCALA[escala] || []).includes(diaSemana);
}

/** Attended session: +1, capped at MAX_REUSO. */
function incrementarReuso(reusoAtual) {
  return Math.min(MAX_REUSO, reusoAtual + 1);
}

/** Absence: -1 (undoes the automatic +1), never below zero. */
function decrementarReuso(reusoAtual) {
  return Math.max(0, reusoAtual - 1);
}

/**
 * Dialyzer to use after a swap. Clinical exceptions keep their model;
 * otherwise it is recalculated from the current weight.
 */
function capilarAposTroca(paciente) {
  return paciente.capilar_manual ? paciente.capilar : calcularCapilarPorPeso(paciente.peso_kg);
}

module.exports = {
  MAX_REUSO,
  LIMIAR_ATENCAO,
  DIAS_POR_ESCALA,
  ESCALAS,
  SALOES,
  TURNOS,
  TOTAL_BOXES,
  POSICOES_POR_BOX,
  MOTIVOS_TROCA,
  calcularCapilarPorPeso,
  statusReuso,
  escalaDoDiaSemana,
  ehDiaDaEscala,
  incrementarReuso,
  decrementarReuso,
  capilarAposTroca,
};
