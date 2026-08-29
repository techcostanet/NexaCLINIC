/**
 * Utilitário de formatação para exibição de médicos e profissionais
 * Remove prefixos (Dr., Dra., Doutor, etc.), CRM e anotações de especialidade entre parênteses.
 */

export function formatDoctorDisplayName(rawName) {
  if (!rawName || typeof rawName !== 'string') return '';
  let clean = rawName;
  
  // 1. Remove qualquer conteúdo entre parênteses, ex: (CRM 83939), (CRM...), (Nefrologia), etc.
  clean = clean.replace(/\s*\([^)]*\)/g, '');
  
  // 2. Remove menções explícitas a CRM no final ou meio, ex: " - CRM 83939", " CRM 83939/MG"
  clean = clean.replace(/\s*-\s*CRM\s*[\d./A-Z-]+/gi, '');
  clean = clean.replace(/\s+CRM\s*[\d./A-Z-]+/gi, '');
  
  // 3. Remove prefixos de títulos e cargos iniciais
  clean = clean.replace(/^(dr[a]?\.?|doutor[a]?|nutricionista|psic[oó]log[oa](\(a\))?|enfermeir[oa]|administrador)\s+/i, '');
  
  // 4. Limpa múltiplos espaços em branco e apara as pontas
  clean = clean.replace(/\s{2,}/g, ' ').trim();
  
  return clean || rawName;
}

/**
 * Ordena lista de médicos alfabeticamente pelo nome limpo
 */
export function sortDoctorsByName(doctors = []) {
  if (!Array.isArray(doctors)) return [];
  return [...doctors].sort((a, b) => {
    const nameA = formatDoctorDisplayName(a?.name || '');
    const nameB = formatDoctorDisplayName(b?.name || '');
    return nameA.localeCompare(nameB, 'pt-BR', { sensitivity: 'base' });
  });
}
