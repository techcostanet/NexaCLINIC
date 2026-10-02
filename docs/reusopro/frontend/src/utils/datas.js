// Dates are exchanged with the API as 'YYYY-MM-DD' in the user's local
// calendar (toISOString() would use UTC and flip the day after 21:00 BRT).

export function paraISO(data) {
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');
  return `${data.getFullYear()}-${mes}-${dia}`;
}

export function hojeISO() {
  return paraISO(new Date());
}

export function somarDias(dataISO, dias) {
  const d = new Date(`${dataISO}T12:00:00`);
  d.setDate(d.getDate() + dias);
  return paraISO(d);
}

/** 'YYYY-MM-DD' (or a full ISO timestamp's date part) -> 'DD/MM/YYYY'. */
export function formatarData(dataISO) {
  if (!dataISO) return '—';
  const [ano, mes, dia] = dataISO.split('T')[0].split('-');
  return `${dia}/${mes}/${ano}`;
}

/** Timestamp (e.g. criado_em) -> local 'DD/MM/YYYY'. */
export function formatarMomento(timestamp) {
  return new Date(timestamp).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

/** Local calendar date of a timestamp, as 'YYYY-MM-DD'. */
export function dataDoMomento(timestamp) {
  return paraISO(new Date(timestamp));
}
