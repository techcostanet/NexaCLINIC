const express = require('express');
const c = require('../controllers/pacientesController');
const { autenticar } = require('../middleware/auth');
const { capturar } = require('../middleware/erros');

const router = express.Router();
router.use(autenticar);

router.get('/', capturar(c.listar));
router.get('/:id/historico', capturar(c.historico));
router.get('/:id', capturar(c.buscar));
router.post('/', capturar(c.criar));
router.put('/:id', capturar(c.atualizar));
router.put('/:id/box', capturar(c.alocarBox));
router.delete('/:id', capturar(c.remover));

module.exports = router;
