const { criarHandlerCron } = require('./_handlerCron');
const { rodarVerificacaoDiaria } = require('../../src/jobs/tarefasCron');

module.exports = criarHandlerCron('diario', rodarVerificacaoDiaria);
