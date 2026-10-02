const express = require('express');
const c = require('../controllers/relatoriosController');
const { autenticar, somenteAdmin } = require('../middleware/auth');
const { capturar } = require('../middleware/erros');

const router = express.Router();
router.use(autenticar);

router.get('/', capturar(c.listar));
router.get('/:id/download', capturar(c.baixar));
router.post('/gerar', somenteAdmin, capturar(c.gerarManual));

module.exports = router;
