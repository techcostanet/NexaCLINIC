const { criarHandlerCron } = require('./_handlerCron');
const { rodarAlertaLimiteEmail } = require('../../src/jobs/tarefasCron');

module.exports = criarHandlerCron('alerta-limite-email', rodarAlertaLimiteEmail);
