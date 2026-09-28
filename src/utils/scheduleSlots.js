/**
 * Utilitários de cálculo e geração dinâmica de slots de atendimento baseados na grade médica.
 */

export const WEEKDAY_NAMES = [
  'Domingo',
  'Segunda',
  'Terça',
  'Quarta',
  'Quinta',
  'Sexta',
  'Sábado'
];

/**
 * Converte data (objeto Date ou string YYYY-MM-DD) para dia da semana (0-6)
 */
export function getDayOfWeekFromDate(dateInput) {
  if (!dateInput) return 0;
  if (dateInput instanceof Date) {
    return dateInput.getDay();
  }
  const parts = String(dateInput).split('-');
  if (parts.length === 3) {
    const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    return d.getDay();
  }
  return new Date(dateInput).getDay();
}

/**
 * Verifica se o médico atende na data informada
 */
export function isDoctorAttendingOnDate(schedule, dateInput) {
  if (!schedule) return false;
  const dayOfWeek = getDayOfWeekFromDate(dateInput);

  const dayConfig = schedule.dayConfig?.[String(dayOfWeek)];
  if (dayConfig && typeof dayConfig.active === 'boolean') {
    return dayConfig.active;
  }

  const availableDays = schedule.availableDays || [];
  return availableDays.includes(dayOfWeek);
}

/**
 * Normaliza horário inicial e final evitando frestas de 1 minuto
 * (Ex: 12:01 após 12:00 vira 12:00 para alinhamento exato de slots)
 */
function normalizeShiftTime(timeStr, prevEndTime) {
  if (!timeStr) return '';
  if (!prevEndTime) return timeStr;

  const [h1, m1] = prevEndTime.split(':').map(Number);
  const [h2, m2] = timeStr.split(':').map(Number);
  if (isNaN(h1) || isNaN(m1) || isNaN(h2) || isNaN(m2)) return timeStr;

  const prevMins = h1 * 60 + m1;
  const currMins = h2 * 60 + m2;

  // Se a diferença for de 1 ou 2 minutos entre o fim da manhã e o início da tarde
  if (currMins > prevMins && currMins - prevMins <= 2) {
    return prevEndTime;
  }
  return timeStr;
}

/**
 * Retorna o resumo dos turnos do médico no dia
 */
export function getDoctorDayShiftSummary(schedule, dateInput) {
  if (!schedule || !isDoctorAttendingOnDate(schedule, dateInput)) {
    return { isAttending: false, text: '', room: schedule?.defaultRoom || 'Consultório 1' };
  }

  const dayOfWeek = getDayOfWeekFromDate(dateInput);
  const dayCfg = schedule.dayConfig?.[String(dayOfWeek)];
  const room = schedule.defaultRoom || 'Consultório 1';

  if (!dayCfg) {
    return { isAttending: true, text: 'Horário comercial', room };
  }

  const parts = [];
  if (dayCfg.morningStart && dayCfg.morningEnd) {
    parts.push(`${dayCfg.morningStart} às ${dayCfg.morningEnd}`);
  }
  if (dayCfg.afternoonStart && dayCfg.afternoonEnd) {
    const normAfternoonStart = normalizeShiftTime(dayCfg.afternoonStart, dayCfg.morningEnd);
    // Se o fim da manhã for igual ao início da tarde, unifica a exibição (ex: 11:00 às 13:20)
    if (parts.length > 0 && normAfternoonStart === dayCfg.morningEnd) {
      parts[0] = `${dayCfg.morningStart} às ${dayCfg.afternoonEnd}`;
    } else {
      parts.push(`${dayCfg.afternoonStart} às ${dayCfg.afternoonEnd}`);
    }
  }

  return {
    isAttending: true,
    text: parts.join(' | ') || 'Atendimento configurado',
    morning: dayCfg.morningStart && dayCfg.morningEnd ? `${dayCfg.morningStart} às ${dayCfg.morningEnd}` : '',
    afternoon: dayCfg.afternoonStart && dayCfg.afternoonEnd ? `${dayCfg.afternoonStart} às ${dayCfg.afternoonEnd}` : '',
    room
  };
}

/**
 * Gera todos os slots de tempo da grade do médico para uma determinada data
 */
export function generateDoctorTimeSlots(schedule, dateStr) {
  if (!schedule || !dateStr) return [];
  if (!isDoctorAttendingOnDate(schedule, dateStr)) return [];

  const dayOfWeek = getDayOfWeekFromDate(dateStr);
  const dayCfg = schedule.dayConfig?.[String(dayOfWeek)];
  if (!dayCfg) return [];

  const duration = parseInt(schedule.slotDuration, 10) || 30;
  if (duration <= 0) return [];

  const slots = [];

  const buildRange = (startStr, endStr) => {
    if (!startStr || !endStr) return;
    const [startH, startM] = startStr.split(':').map(Number);
    const [endH, endM] = endStr.split(':').map(Number);
    if (isNaN(startH) || isNaN(startM) || isNaN(endH) || isNaN(endM)) return;

    let currentMins = startH * 60 + startM;
    const endMins = endH * 60 + endM;

    while (currentMins < endMins) {
      const h = Math.floor(currentMins / 60);
      const m = currentMins % 60;
      const timeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;

      const nextMins = currentMins + duration;
      const nextH = Math.floor(nextMins / 60);
      const nextM = nextMins % 60;
      const endTimeStr = `${String(nextH).padStart(2, '0')}:${String(nextM).padStart(2, '0')}`;

      slots.push({
        time: timeStr,
        endTime: endTimeStr,
        duration,
        room: schedule.defaultRoom || 'Consultório 1'
      });

      currentMins += duration;
    }
  };

  let morningEnd = '';
  if (dayCfg.morningStart && dayCfg.morningEnd) {
    buildRange(dayCfg.morningStart, dayCfg.morningEnd);
    morningEnd = dayCfg.morningEnd;
  }

  if (dayCfg.afternoonStart && dayCfg.afternoonEnd) {
    const effectiveStart = normalizeShiftTime(dayCfg.afternoonStart, morningEnd);
    buildRange(effectiveStart, dayCfg.afternoonEnd);
  }

  return slots;
}

/**
 * Localiza a próxima data em que o médico atende a partir de uma data de referência
 */
export function findNextAttendingDate(schedule, fromDateInput) {
  if (!schedule) return null;

  let baseDate;
  if (fromDateInput instanceof Date) {
    baseDate = new Date(fromDateInput.getTime());
  } else if (typeof fromDateInput === 'string' && fromDateInput.includes('-')) {
    const [y, m, d] = fromDateInput.split('-').map(Number);
    baseDate = new Date(y, m - 1, d);
  } else {
    baseDate = new Date();
  }

  // Busca nos próximos 30 dias
  for (let i = 1; i <= 30; i++) {
    const candidate = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate() + i);
    if (isDoctorAttendingOnDate(schedule, candidate)) {
      const year = candidate.getFullYear();
      const month = String(candidate.getMonth() + 1).padStart(2, '0');
      const day = String(candidate.getDate()).padStart(2, '0');
      return {
        dateObj: candidate,
        dateStr: `${year}-${month}-${day}`,
        dayName: WEEKDAY_NAMES[candidate.getDay()]
      };
    }
  }

  return null;
}
