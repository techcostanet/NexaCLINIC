// Date helpers. All business dates are plain 'YYYY-MM-DD' strings in the
// clinic's timezone, so results don't depend on the server timezone
// (serverless hosts run in UTC, which would flip the day after 21:00 BRT).

const TIMEZONE = process.env.APP_TIMEZONE || 'America/Sao_Paulo';
const DATA_ISO = /^\d{4}-\d{2}-\d{2}$/;

/** Calendar date (clinic timezone) of a timestamp. */
function dataISODoMomento(momento = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TIMEZONE }).format(new Date(momento));
}

/** Today's date in the clinic timezone. */
function hojeISO() {
  return dataISODoMomento(new Date());
}

/** Weekday (0 = Sunday) of a 'YYYY-MM-DD' date. */
function diaDaSemana(dataISO) {
  return new Date(`${dataISO}T12:00:00Z`).getUTCDay();
}

/** Adds (or subtracts) days to a 'YYYY-MM-DD' date. */
function somarDias(dataISO, dias) {
  const d = new Date(`${dataISO}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + dias);
  return d.toISOString().slice(0, 10);
}

/** 'YYYY-MM-DD' -> 'DD/MM/YYYY'. */
function formatarDataBR(dataISO) {
  if (!dataISO) return '-';
  const [ano, mes, dia] = dataISO.slice(0, 10).split('-');
  return `${dia}/${mes}/${ano}`;
}

function ehDataISO(valor) {
  return typeof valor === 'string' && DATA_ISO.test(valor);
}

module.exports = { TIMEZONE, hojeISO, dataISODoMomento, diaDaSemana, somarDias, formatarDataBR, ehDataISO };
