// Daily "patients at the reuse limit" alert, delivered through three
// independent channels: WhatsApp template (+PDF), e-mail and a manual wa.me
// link from the Dashboard. A failure in one never affects the others.

const pool = require('../db/pool');
const { MAX_REUSO, escalaDoDiaSemana } = require('../domain/regrasNegocio');
const { diaDaSemana } = require('../utils/datas');
const { montarResumoLimite, montarMensagemDetalhada, montarEmailLimite } = require('../reports/mensagensLimite');
const { gerarPdfAlertaLimite } = require('../reports/pdfAlertaLimite');
const { enviarTemplateComDocumento } = require('../integrations/whatsappClient');
const { enviarEmail } = require('../integrations/emailClient');

/** Patients expected on the date (regular schedule or fixed extra day) whose dialyzer is at the limit. */
async function buscarPacientesNoLimite(dataISO) {
  const diaSemana = diaDaSemana(dataISO);
  const { rows } = await pool.query(
    `SELECT nome, capilar, salao, turno, TO_CHAR(data_nascimento, 'DD/MM/YYYY') AS dn_formatada
     FROM pacientes
     WHERE ativo = TRUE AND reuso_atual >= $3 AND (escala = $1 OR dia_extra_fixo = $2)
     ORDER BY salao ASC, turno ASC, nome ASC`,
    [escalaDoDiaSemana(diaSemana), diaSemana, MAX_REUSO]
  );
  return rows;
}

async function enviarAlertaWhatsapp(dataISO) {
  const pacientes = await buscarPacientesNoLimite(dataISO);
  const mensagem = montarResumoLimite(pacientes, dataISO);
  const { nomeArquivo, buffer } = await gerarPdfAlertaLimite({ pacientes, dataISO });
  const enviado = await enviarTemplateComDocumento({ textoCorpo: mensagem, pdfBuffer: buffer, nomeArquivo });
  return { enviado, mensagem, totalNoLimite: pacientes.length };
}

async function enviarAlertaEmail(dataISO) {
  const pacientes = await buscarPacientesNoLimite(dataISO);
  const enviado = await enviarEmail(montarEmailLimite(pacientes, dataISO));
  return { enviado, totalNoLimite: pacientes.length };
}

/** Pre-formatted text for the Dashboard's manual "send limit report" button. */
async function montarMensagemManual(dataISO) {
  const pacientes = await buscarPacientesNoLimite(dataISO);
  return {
    texto: montarMensagemDetalhada(pacientes, dataISO),
    numeroDestino: process.env.WHATSAPP_DASHBOARD_NUMBER || '',
    total: pacientes.length,
  };
}

module.exports = { buscarPacientesNoLimite, enviarAlertaWhatsapp, enviarAlertaEmail, montarMensagemManual };
