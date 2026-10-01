/**
 * Utilitários de Data padronizados para o fuso horário local brasileiro (evita deslocamentos de UTC)
 */

/**
 * Retorna a data local atual no formato 'YYYY-MM-DD'
 * Evita o bug de new Date().toISOString() que vira o dia adiantado em horários noturnos
 * @returns {string} 'YYYY-MM-DD'
 */
export const getLocalDateString = (dateObj = new Date()) => {
  const d = dateObj instanceof Date && !isNaN(dateObj.getTime()) ? dateObj : new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Formata qualquer valor de data ('YYYY-MM-DD', 'YYYY/MM/DD', ISO ou Date) para 'DD/MM/YYYY'
 * Sem aplicar conversão para UTC à meia-noite (que causava o bug da data retroceder 1 dia)
 * @param {string|Date|null|undefined} val 
 * @returns {string} 'DD/MM/YYYY' ou '-'
 */
export const formatDateBR = (val) => {
  if (!val) return '-';
  if (typeof val === 'string') {
    const clean = val.trim();
    if (!clean) return '-';

    // Se já estiver em DD/MM/YYYY
    if (/^\d{2}[\/\-]\d{2}[\/\-]\d{4}/.test(clean)) {
      return clean.substring(0, 10).replace(/-/g, '/');
    }

    // Se estiver em YYYY-MM-DD ou YYYY/MM/DD (sem 'T' de horário)
    if (/^\d{4}[\/\-]\d{2}[\/\-]\d{2}$/.test(clean)) {
      const parts = clean.split(/[\/\-]/);
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }

    // Se tiver 'T' (ex: 2026-10-01T14:30:00Z)
    if (clean.includes('T')) {
      const d = new Date(clean);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString('pt-BR');
      }
    }
  }

  const d = new Date(val);
  if (isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('pt-BR');
};
