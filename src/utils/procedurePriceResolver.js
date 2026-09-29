/**
 * Utilitário de Resolução Automática de Valores de Procedimentos e Cirurgias
 * Conecta o catálogo unificado, configurações do Nex-Ai.MED e regras de precificação clínica.
 */

export function resolveProcedurePrice(procedureName = '', catalogList = [], settingsFees = {}) {
  if (!procedureName || typeof procedureName !== 'string') return 350.0;

  const clean = procedureName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .trim();

  // 1. Verificar catálogo unificado fornecido
  if (Array.isArray(catalogList) && catalogList.length > 0) {
    const exact = catalogList.find(c => {
      const cName = (c.name || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().trim();
      return cName === clean;
    });
    if (exact && typeof exact.value === 'number' && exact.value > 0) {
      return exact.value;
    }
  }

  // 2. Verificar configurações de honorários do Nex-Ai.MED
  if (settingsFees && typeof settingsFees === 'object') {
    for (const [key, val] of Object.entries(settingsFees)) {
      const kClean = key.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().trim();
      if (kClean === clean && typeof val === 'number' && val > 0) {
        return val;
      }
    }
  }

  // 3. Mapeamentos inteligentes baseados na Tabela Padrão Nexa
  if (clean.includes('PTFE') || clean.includes('PROTESE')) return 891.0;
  if (clean.includes('BASILICA') || clean.includes('SUPERFI') || clean.includes('TRANSPOSICAO')) return 770.0;
  if (clean.includes('RETIRADA') && (clean.includes('PERMCATH') || clean.includes('CATETER'))) return 400.0;
  if (clean.includes('PERMCATH') || clean.includes('CATETER DE LONGA') || clean.includes('PERMANENTE')) return 800.0;
  if (clean.includes('CDL') || clean.includes('DUPLO LUMEN')) return 385.0;
  if (clean.includes('DUPLEX') || clean.includes('DOPPLER') || clean.includes('DSV') || clean.includes('DAS')) return 119.79;
  if (clean.includes('LIGADURA') || clean.includes('LIGACAO') || clean.includes('EMBOLIZACAO')) return 550.0;
  if (clean.includes('REVISAO') || clean.includes('REPARO')) return 440.0;
  if (clean.includes('TROMBECTOMIA')) return 605.0;
  if (clean.includes('FAV SIMPLES') || clean.includes('CONFECCAO DE FAV') || clean.includes('FISTULA')) return 668.25;
  if (clean.includes('AVALIACAO') || clean.includes('CONSULTA')) return 55.0;

  // 4. Busca parcial no catálogo unificado
  if (Array.isArray(catalogList) && catalogList.length > 0) {
    const partial = catalogList.find(c => {
      const cName = (c.name || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().trim();
      return clean.includes(cName) || cName.includes(clean);
    });
    if (partial && typeof partial.value === 'number' && partial.value > 0) {
      return partial.value;
    }
  }

  // 5. Fallback padrão caso nenhum valor específico seja identificado
  return 350.0;
}
