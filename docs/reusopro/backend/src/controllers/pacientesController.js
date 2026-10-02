const pacientesService = require('../services/pacientesService');

// GET /api/pacientes?escala=&turno=&salao=
async function listar(req, res) {
  res.json(await pacientesService.listar(req.query));
}

// GET /api/pacientes/:id
async function buscar(req, res) {
  res.json(await pacientesService.buscarPorId(req.params.id));
}

// GET /api/pacientes/:id/historico
async function historico(req, res) {
  res.json(await pacientesService.historico(req.params.id));
}

// POST /api/pacientes
async function criar(req, res) {
  res.status(201).json(await pacientesService.criar(req.body));
}

// PUT /api/pacientes/:id
async function atualizar(req, res) {
  res.json(await pacientesService.atualizar(req.params.id, req.body));
}

// PUT /api/pacientes/:id/box  body: { box, posicao_box } (nulls = release slot)
async function alocarBox(req, res) {
  res.json(await pacientesService.alocarBox(req.params.id, req.body));
}

// DELETE /api/pacientes/:id (soft delete)
async function remover(req, res) {
  await pacientesService.desativar(req.params.id);
  res.json({ mensagem: 'Paciente removido com sucesso.' });
}

module.exports = { listar, buscar, historico, criar, atualizar, alocarBox, remover };
