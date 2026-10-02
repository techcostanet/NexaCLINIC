// ============================================================
// Scheduled task bodies, decoupled from the scheduler so they can run from
// node-cron (long-running server) or Vercel Cron (serverless, api/cron/*).
// ============================================================

const sessoesService = require('../services/sessoesService');
const alertaLimiteService = require('../services/alertaLimiteService');
const relatoriosService = require('../services/relatoriosService');
const { hojeISO, somarDias } = require('../utils/datas');

/** 07:00 — automatic attendance for today's patients, then the WhatsApp limit alert. */
async function rodarVerificacaoDiaria() {
  const dataISO = hojeISO();
  const { escala, totalLancados } = await sessoesService.lancarPresencaAutomatica(dataISO);
  console.log(`[CRON daily] ${dataISO} (schedule ${escala || 'none'}): ${totalLancados} attendance(s) recorded.`);

  const { totalNoLimite } = await alertaLimiteService.enviarAlertaWhatsapp(dataISO);
  console.log(`[CRON daily] WhatsApp alert processed: ${totalNoLimite} patient(s) at the limit.`);

  return { dataISO, escala, totalLancados, totalNoLimite };
}

/** 07:10 — e-mail limit alert (10 min after attendance, so today's counts are final). */
async function rodarAlertaLimiteEmail() {
  const dataISO = hojeISO();
  const resultado = await alertaLimiteService.enviarAlertaEmail(dataISO);
  console.log(`[CRON e-mail] ${resultado.totalNoLimite} patient(s) at the limit.`);
  return { dataISO, ...resultado };
}

/** Saturday — swaps from the last 7 days (Sunday..Saturday). */
async function rodarRelatorioSemanal() {
  const fim = hojeISO();
  const inicio = somarDias(fim, -6);
  const arquivo = await relatoriosService.gerarESalvar('SEMANAL', inicio, fim);
  console.log(`[CRON weekly] Report generated: ${arquivo}`);
  return { arquivo, inicio, fim };
}

/**
 * Day 30 — swaps from day 1 to day 30 of the current month.
 * Known limitation: months without a day 30 (February) get no automatic report.
 */
async function rodarRelatorioMensal() {
  const [ano, mes] = hojeISO().split('-');
  const inicio = `${ano}-${mes}-01`;
  const fim = `${ano}-${mes}-30`;
  const arquivo = await relatoriosService.gerarESalvar('MENSAL', inicio, fim);
  console.log(`[CRON monthly] Report generated: ${arquivo}`);
  return { arquivo, inicio, fim };
}

module.exports = { rodarVerificacaoDiaria, rodarAlertaLimiteEmail, rodarRelatorioSemanal, rodarRelatorioMensal };
