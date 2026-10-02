const express = require('express');
const rateLimit = require('express-rate-limit');
const c = require('../controllers/authController');
const { autenticar, somenteAdmin } = require('../middleware/auth');
const { capturar } = require('../middleware/erros');

const router = express.Router();

// Brute-force protection. In-memory: global on a long-running server, but
// per warm instance on serverless (use a shared store for strict limits there).
const limitadorLogin = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { erro: 'Muitas tentativas de login. Aguarde alguns minutos e tente de novo.' },
});

router.post('/login', limitadorLogin, capturar(c.login));
router.patch('/senha', autenticar, capturar(c.trocarSenha));

router.get('/usuarios', autenticar, somenteAdmin, capturar(c.listarUsuarios));
router.post('/usuarios', autenticar, somenteAdmin, capturar(c.criarUsuario));
router.patch('/usuarios/:id/ativo', autenticar, somenteAdmin, capturar(c.alternarAtivoUsuario));

module.exports = router;
