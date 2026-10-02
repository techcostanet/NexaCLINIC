const sessoesService = require('../services/sessoesService');
const { HttpErro } = require('../middleware/erros');
const { hojeISO, ehDataISO } = require('../utils/datas');

/** Reads an optional 'YYYY-MM-DD' date (query or body), defaulting to today. */
function dataDaRequisicao(valor) {
  if (!valor) return hojeISO();
  if (!ehDataISO(valor)) throw new HttpErro(400, 'Data deve estar no formato AAAA-MM-DD.');
  return valor;
}

// GET /api/sessoes/hoje?data=YYYY-MM-DD — patients expected on the date
async function pacientesDoDia(req, res) {
  res.json(await sessoesService.pacientesDoDia(dataDaRequisicao(req.query.data)));
}

// GET /api/sessoes/dia?data=YYYY-MM-DD — absences and extra sessions on the date
async function lancamentosDoDia(req, res) {
  res.json(await sessoesService.lancamentosDoDia(dataDaRequisicao(req.query.data)));
}

// POST /api/sessoes/:pacienteId/realizar  body: { data? }
async function registrarPresenca(req, res) {
  const resultado = await sessoesService.registrarSessao({
    pacienteId: req.params.pacienteId,
    dataISO: dataDaRequisicao(req.body.data),
    status: 'REALIZADA',
    usuarioId: req.usuario.id,
  });
  res.json({ mensagem: 'Sessão registrada com sucesso.', ...resultado });
}

// POST /api/sessoes/:pacienteId/falta  body: { data? }
async function registrarFalta(req, res) {
  const resultado = await sessoesService.registrarSessao({
    pacienteId: req.params.pacienteId,
    dataISO: dataDaRequisicao(req.body.data),
    status: 'FALTA',
    usuarioId: req.usuario.id,
  });
  res.json({ mensagem: 'Falta registrada com sucesso.', ...resultado });
}

// DELETE /api/sessoes/:sessaoId
async function excluir(req, res) {
  const resultado = await sessoesService.excluirSessao(req.params.sessaoId);
  res.json({ mensagem: 'Lançamento removido com sucesso.', ...resultado });
}

module.exports = { pacientesDoDia, lancamentosDoDia, registrarPresenca, registrarFalta, excluir };
