/**
 * Utilitário de Feriados Nacionais do Brasil
 * Calcula feriados fixos e feriados móveis baseados no algoritmo de Gauss / Butcher para a Páscoa.
 */

// Algoritmo para calcular a data do Domingo de Páscoa para qualquer ano
export function getEasterDate(year) {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;

  return new Date(year, month - 1, day);
}

// Adiciona ou subtrai dias de uma data
function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

// Formata para YYYY-MM-DD
function formatDateISO(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Retorna todos os feriados nacionais do ano informado
 * @param {number} year
 * @returns {Array<{ date: string, name: string, type: 'Nacional' | 'Facultativo', isMobile: boolean }>}
 */
export function getBrazilianHolidays(year = new Date().getFullYear()) {
  const easter = getEasterDate(year);
  
  // Feriados Móveis baseados na Páscoa
  const carnavalSeg = addDays(easter, -48);
  const carnavalTer = addDays(easter, -47);
  const cinzas = addDays(easter, -46);
  const paixaoCristo = addDays(easter, -2);
  const corpusChristi = addDays(easter, 60);

  const holidays = [
    // Fixos
    { date: `${year}-01-01`, name: 'Confraternização Universal', type: 'Nacional', isMobile: false },
    { date: formatDateISO(carnavalSeg), name: 'Carnaval (Segunda)', type: 'Facultativo', isMobile: true },
    { date: formatDateISO(carnavalTer), name: 'Carnaval', type: 'Facultativo', isMobile: true },
    { date: formatDateISO(cinzas), name: 'Quarta-feira de Cinzas', type: 'Facultativo', isMobile: true },
    { date: formatDateISO(paixaoCristo), name: 'Sexta-feira Santa', type: 'Nacional', isMobile: true },
    { date: formatDateISO(easter), name: 'Páscoa', type: 'Comemorativo', isMobile: true },
    { date: `${year}-04-21`, name: 'Tiradentes', type: 'Nacional', isMobile: false },
    { date: `${year}-05-01`, name: 'Dia do Trabalhador', type: 'Nacional', isMobile: false },
    { date: formatDateISO(corpusChristi), name: 'Corpus Christi', type: 'Facultativo', isMobile: true },
    { date: `${year}-09-07`, name: 'Independência do Brasil', type: 'Nacional', isMobile: false },
    { date: `${year}-10-12`, name: 'Nossa Senhora Aparecida', type: 'Nacional', isMobile: false },
    { date: `${year}-11-02`, name: 'Finados', type: 'Nacional', isMobile: false },
    { date: `${year}-11-15`, name: 'Proclamação da República', type: 'Nacional', isMobile: false },
    { date: `${year}-11-20`, name: 'Dia da Consciência Negra', type: 'Nacional', isMobile: false }, // Lei nº 14.759/2023
    { date: `${year}-12-25`, name: 'Natal', type: 'Nacional', isMobile: false }
  ];

  return holidays.sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Verifica se uma data específica (YYYY-MM-DD) é feriado nacional no Brasil
 * @param {string} dateStr Formato YYYY-MM-DD
 * @returns {{ isHoliday: boolean, name?: string, type?: string }}
 */
export function isBrazilianHoliday(dateStr) {
  if (!dateStr || typeof dateStr !== 'string' || dateStr.length < 10) {
    return { isHoliday: false };
  }
  const year = parseInt(dateStr.substring(0, 4), 10);
  if (isNaN(year)) return { isHoliday: false };

  const holidays = getBrazilianHolidays(year);
  const found = holidays.find(h => h.date === dateStr);

  if (found) {
    return {
      isHoliday: true,
      name: found.name,
      type: found.type
    };
  }

  return { isHoliday: false };
}
