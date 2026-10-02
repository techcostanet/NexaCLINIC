const express = require('express');
const c = require('../controllers/trocasController');
const { autenticar, somenteAdmin } = require('../middleware/auth');
const { capturar } = require('../middleware/erros');

const router = express.Router();
router.use(autenticar);

router.get('/', capturar(c.listar));
router.post('/:pacienteId/trocar', capturar(c.trocar));
router.delete('/:id', somenteAdmin, capturar(c.excluir));

module.exports = router;
