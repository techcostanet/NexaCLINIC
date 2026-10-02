import { hojeISO, somarDias, dataDoMomento } from './datas';

export const PERIODOS = [
  { valor: 'TUDO', label: 'Tudo' },
  { valor: 'SEMANA', label: 'Última semana' },
  { valor: 'QUINZENA', label: 'Última quinzena' },
  { valor: 'MES', label: 'Último mês' },
];

const DIAS_POR_PERIODO = { SEMANA: 7, QUINZENA: 15, MES: 30 };

/** { inicio, fim } for the API (inclusive, ending today), or {} for "all". */
export function calcularIntervalo(periodo) {
  if (periodo === 'TUDO') return {};
  const fim = hojeISO();
  return { inicio: somarDias(fim, -(DIAS_POR_PERIODO[periodo] - 1)), fim };
}

export function momentoDentroDoPeriodo(timestamp, periodo) {
  if (periodo === 'TUDO') return true;
  return dataDoMomento(timestamp) >= calcularIntervalo(periodo).inicio;
}
