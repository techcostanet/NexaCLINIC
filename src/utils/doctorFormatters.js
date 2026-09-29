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

/**
 * Localiza médico na lista por ID exato ou por aproximação do nome
 */
export function matchDoctorByNameOrId(doctors = [], idOrName = '') {
  if (!idOrName) return null;
  const cleanSearch = formatDoctorDisplayName(String(idOrName)).toLowerCase().trim();
  if (!cleanSearch) return null;

  return doctors.find(d => {
    if (d.id === idOrName || d.uid === idOrName) return true;
    const dClean = formatDoctorDisplayName(d.name || '').toLowerCase().trim();
    if (dClean === cleanSearch) return true;
    if (cleanSearch.length > 3 && (dClean.includes(cleanSearch) || cleanSearch.includes(dClean))) return true;
    return false;
  }) || null;
}

/**
 * Verifica se um procedimento pertence a um determinado médico por ID ou nome
 */
export function isProcedureForDoctor(procedure, doctor) {
  if (!procedure || !doctor) return false;
  const docId = doctor.id || doctor.uid || doctor.doctorId;
  if (procedure.doctorId && docId && (procedure.doctorId === docId || procedure.doctorId === doctor.id || procedure.doctorId === doctor.uid)) {
    return true;
  }
  const docClean = formatDoctorDisplayName(doctor.name || doctor.doctorName || '').toLowerCase().trim();
  const procDocClean = formatDoctorDisplayName(procedure.doctorName || '').toLowerCase().trim();
  if (docClean && procDocClean) {
    if (docClean === procDocClean) return true;
    if (docClean.length > 3 && (procDocClean.includes(docClean) || docClean.includes(procDocClean))) return true;
  }
  return false;
}

