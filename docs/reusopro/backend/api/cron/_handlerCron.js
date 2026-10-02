// Shared wrapper for Vercel Cron endpoints (files prefixed with "_" are not
// deployed as functions). Fails closed: without CRON_SECRET every call is
// rejected, so the jobs can never be triggered publicly by misconfiguration.
require('dotenv').config();

function autorizado(req) {
  const segredo = process.env.CRON_SECRET;
  return Boolean(segredo) && req.headers.authorization === `Bearer ${segredo}`;
}

function criarHandlerCron(nome, tarefa) {
  return async (req, res) => {
    if (!autorizado(req)) return res.status(401).json({ erro: 'Não autorizado.' });
    try {
      return res.status(200).json({ ok: true, ...(await tarefa()) });
    } catch (err) {
      console.error(`[Vercel Cron ${nome}] Error:`, err);
      return res.status(500).json({ erro: `Falha ao executar ${nome}.` });
    }
  };
}

module.exports = { criarHandlerCron };
