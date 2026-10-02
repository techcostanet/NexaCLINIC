const express = require('express');
const c = require('../controllers/sessoesController');
const { autenticar } = require('../middleware/auth');
const { capturar } = require('../middleware/erros');

const router = express.Router();
router.use(autenticar);

router.get('/hoje', capturar(c.pacientesDoDia));
router.get('/dia', capturar(c.lancamentosDoDia));
router.post('/:pacienteId/realizar', capturar(c.registrarPresenca));
router.post('/:pacienteId/falta', capturar(c.registrarFalta));
router.delete('/:sessaoId', capturar(c.excluir));

module.exports = router;
