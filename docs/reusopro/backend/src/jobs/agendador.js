// node-cron scheduler, used only when running as a long-lived process
// (src/server.js). On Vercel the same schedule lives in vercel.json (UTC).
const cron = require('node-cron');
const { TIMEZONE } = require('../utils/datas');
const tarefas = require('./tarefasCron');

const AGENDA = [
  { expressao: '0 7 * * *', nome: 'daily attendance + WhatsApp', tarefa: tarefas.rodarVerificacaoDiaria },
  { expressao: '10 7 * * *', nome: 'e-mail limit alert', tarefa: tarefas.rodarAlertaLimiteEmail },
  { expressao: '59 23 * * 6', nome: 'weekly report (Sat)', tarefa: tarefas.rodarRelatorioSemanal },
  { expressao: '59 23 30 * *', nome: 'monthly report (day 30)', tarefa: tarefas.rodarRelatorioMensal },
];

function iniciarAgendador() {
  for (const { expressao, nome, tarefa } of AGENDA) {
    cron.schedule(expressao, () => tarefa().catch((err) => console.error(`[CRON ${nome}] Error:`, err)), {
      timezone: TIMEZONE,
    });
    console.log(`Scheduled: ${nome} (${expressao} ${TIMEZONE})`);
  }
}

module.exports = { iniciarAgendador };
