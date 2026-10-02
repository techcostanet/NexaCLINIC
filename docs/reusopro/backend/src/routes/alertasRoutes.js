const express = require('express');
const c = require('../controllers/alertasController');
const { autenticar, somenteAdmin } = require('../middleware/auth');
const { capturar } = require('../middleware/erros');

// Mounted under /api/whatsapp
const whatsapp = express.Router();
whatsapp.use(autenticar);
whatsapp.post('/testar', somenteAdmin, capturar(c.testarWhatsapp));
whatsapp.get('/mensagem-limite-hoje', capturar(c.mensagemLimiteHoje));

// Mounted under /api/email
const email = express.Router();
email.use(autenticar);
email.post('/testar', somenteAdmin, capturar(c.testarEmail));

module.exports = { whatsapp, email };
