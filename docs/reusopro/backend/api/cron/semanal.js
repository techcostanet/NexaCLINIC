const { criarHandlerCron } = require('./_handlerCron');
const { rodarRelatorioSemanal } = require('../../src/jobs/tarefasCron');

module.exports = criarHandlerCron('semanal', rodarRelatorioSemanal);
