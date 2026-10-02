const usuariosService = require('../services/usuariosService');

// POST /api/auth/login
async function login(req, res) {
  res.json(await usuariosService.login(req.body.username, req.body.senha));
}

// PATCH /api/auth/senha — any logged-in user changes their own password
async function trocarSenha(req, res) {
  await usuariosService.trocarSenha(req.usuario.id, req.body);
  res.json({ mensagem: 'Senha alterada com sucesso.' });
}

// GET /api/auth/usuarios (admin)
async function listarUsuarios(req, res) {
  res.json(await usuariosService.listar());
}

// POST /api/auth/usuarios (admin)
async function criarUsuario(req, res) {
  res.status(201).json(await usuariosService.criar(req.body));
}

// PATCH /api/auth/usuarios/:id/ativo (admin)
async function alternarAtivoUsuario(req, res) {
  res.json(await usuariosService.alternarAtivo(req.params.id));
}

module.exports = { login, trocarSenha, listarUsuarios, criarUsuario, alternarAtivoUsuario };
