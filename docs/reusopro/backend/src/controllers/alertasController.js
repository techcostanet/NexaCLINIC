const alertaLimiteService = require('../services/alertaLimiteService');
const { hojeISO } = require('../utils/datas');

// POST /api/whatsapp/testar (admin) — sends today's WhatsApp alert now
async function testarWhatsapp(req, res) {
  res.json({ dataISO: hojeISO(), ...(await alertaLimiteService.enviarAlertaWhatsapp(hojeISO())) });
}

// GET /api/whatsapp/mensagem-limite-hoje — text for the Dashboard wa.me button
async function mensagemLimiteHoje(req, res) {
  res.json(await alertaLimiteService.montarMensagemManual(hojeISO()));
}

// POST /api/email/testar (admin) — sends today's e-mail alert now
async function testarEmail(req, res) {
  res.json({ dataISO: hojeISO(), ...(await alertaLimiteService.enviarAlertaEmail(hojeISO())) });
}

module.exports = { testarWhatsapp, mensagemLimiteHoje, testarEmail };
