const trocasService = require('../services/trocasService');

// POST /api/trocas/:pacienteId/trocar
// body: { motivo, motivo_detalhe?, novo_capilar_lote?, data_inicio? }
async function trocar(req, res) {
  const resultado = await trocasService.trocarCapilar(req.params.pacienteId, req.body, req.usuario.id);
  res.json({ mensagem: 'Capilar trocado com sucesso. Reuso zerado.', ...resultado });
}

// GET /api/trocas?inicio=YYYY-MM-DD&fim=YYYY-MM-DD
async function listar(req, res) {
  res.json(await trocasService.listar(req.query));
}

// DELETE /api/trocas/:id (admin) — history only, patient state untouched
async function excluir(req, res) {
  await trocasService.excluir(req.params.id);
  res.json({ mensagem: 'Troca excluída com sucesso.' });
}

module.exports = { trocar, listar, excluir };
