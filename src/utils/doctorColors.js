/**
 * Paleta refinada e discreta de cores médicas/executivas para profissionais de saúde.
 * Evita saturações estridentes ("efeito carnaval") e garante alto contraste e legibilidade.
 */

export const DOCTOR_COLOR_PALETTES = [
  { id: 'cyan', name: 'Ciano', primary: '#0284c7', bg: '#f0f9ff', border: '#bae6fd', text: '#0369a1', badgeBg: '#e0f2fe' },
  { id: 'emerald', name: 'Esmeralda', primary: '#059669', bg: '#ecfdf5', border: '#a7f3d0', text: '#047857', badgeBg: '#d1fae5' },
  { id: 'indigo', name: 'Índigo', primary: '#4f46e5', bg: '#eef2ff', border: '#c7d2fe', text: '#3730a3', badgeBg: '#e0e7ff' },
  { id: 'amber', name: 'Âmbar', primary: '#d97706', bg: '#fffbeb', border: '#fde68a', text: '#b45309', badgeBg: '#fef3c7' },
  { id: 'teal', name: 'Teal', primary: '#0d9488', bg: '#f0fdfa', border: '#99f6e4', text: '#0f766e', badgeBg: '#ccfbf1' },
  { id: 'purple', name: 'Roxo', primary: '#7c3aed', bg: '#faf5ff', border: '#e9d5ff', text: '#6d28d9', badgeBg: '#f3e8ff' },
  { id: 'rose', name: 'Rose', primary: '#e11d48', bg: '#fff1f2', border: '#fecdd3', text: '#be123c', badgeBg: '#ffe4e6' },
  { id: 'blue', name: 'Azul', primary: '#2563eb', bg: '#eff6ff', border: '#bfdbfe', text: '#1d4ed8', badgeBg: '#dbeafe' },
  { id: 'slate', name: 'Grafite', primary: '#475569', bg: '#f8fafc', border: '#cbd5e1', text: '#334155', badgeBg: '#f1f5f9' },
  { id: 'lime', name: 'Oliva', primary: '#65a30d', bg: '#f7fee7', border: '#d9f99d', text: '#4d7c0f', badgeBg: '#ecfccb' }
];

export function getDoctorColor(doctorIdOrName) {
  if (!doctorIdOrName) return DOCTOR_COLOR_PALETTES[0];
  let hash = 0;
  const str = String(doctorIdOrName).trim();
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % DOCTOR_COLOR_PALETTES.length;
  return DOCTOR_COLOR_PALETTES[index];
}
