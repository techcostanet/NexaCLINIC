const { criarHandlerCron } = require('./_handlerCron');
const { rodarRelatorioMensal } = require('../../src/jobs/tarefasCron');

module.exports = criarHandlerCron('mensal', rodarRelatorioMensal);
