// Cargos e Setores Padronizados para o NexaHR
// Regras: 1 palavra apenas, primeira letra maiúscula, ordem alfabética estrita

export const STANDARD_ROLES = [
  'Administrador',
  'Administrativo',
  'Almoxarife',
  'Analista',
  'Assistente',
  'Atendente',
  'Auxiliar',
  'Biomédico',
  'Comprador',
  'Coordenador',
  'Diretor',
  'Enfermeiro',
  'Engenheiro',
  'Estagiário',
  'Estoquista',
  'Farmacêutico',
  'Faturista',
  'Gerente',
  'Higienista',
  'Líder',
  'Manutenção',
  'Médico',
  'Motorista',
  'Nefrologista',
  'Nutricionista',
  'Plantonista',
  'Psicólogo',
  'Recepcionista',
  'Supervisor',
  'Técnico'
].sort((a, b) => a.localeCompare(b, 'pt-BR'));

export const STANDARD_SECTORS = [
  { id: 'administracao', name: 'Administração', description: 'Diretoria e Gestão' },
  { id: 'almoxarifado', name: 'Almoxarifado', description: 'Almoxarifado' },
  { id: 'ambulatorio', name: 'Ambulatório', description: 'Ambulatório e Consultórios' },
  { id: 'atendimento', name: 'Atendimento', description: 'Atendimento ao Paciente' },
  { id: 'clinica', name: 'Clínica', description: 'Área Clínica Geral' },
  { id: 'compras', name: 'Compras', description: 'Compras e Suprimentos' },
  { id: 'diretoria', name: 'Diretoria', description: 'Diretoria Geral' },
  { id: 'enfermagem', name: 'Enfermagem', description: 'Equipe de Enfermagem' },
  { id: 'estoque', name: 'Estoque', description: 'Controle de Estoque' },
  { id: 'farmacia', name: 'Farmácia', description: 'Farmácia Hospitalar' },
  { id: 'faturamento', name: 'Faturamento', description: 'Faturamento e APACs' },
  { id: 'financeiro', name: 'Financeiro', description: 'Financeiro e Controladoria' },
  { id: 'hemodialise', name: 'Hemodiálise', description: 'Salões de Hemodiálise' },
  { id: 'higienizacao', name: 'Higienização', description: 'Higienização e Limpeza' },
  { id: 'manutencao', name: 'Manutenção', description: 'Manutenção e Engenharia Clínica' },
  { id: 'medica', name: 'Médico', description: 'Corpo Clínico' },
  { id: 'nutricao', name: 'Nutrição', description: 'Nutrição Clínica' },
  { id: 'peritoneal', name: 'Peritoneal', description: 'Diálise Peritoneal' },
  { id: 'psicologia', name: 'Psicologia', description: 'Psicologia Clínica' },
  { id: 'qualidade', name: 'Qualidade', description: 'Qualidade e Auditoria' },
  { id: 'recepcao', name: 'Recepção', description: 'Recepção e Portaria' },
  { id: 'rh', name: 'RH', description: 'Recursos Humanos' },
  { id: 'sesmt', name: 'SESMT', description: 'Segurança do Trabalho' },
  { id: 'social', name: 'Social', description: 'Serviço Social' },
  { id: 'ti', name: 'TI', description: 'Tecnologia da Informação' }
].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));

export const normalizeSingleWord = (val) => {
  if (!val) return '';
  const trimmed = String(val).trim();
  const upper = trimmed.toUpperCase();
  if (upper === 'RH' || upper === 'SESMT' || upper === 'TI' || upper === 'DP') {
    return upper;
  }
  const lower = trimmed.toLowerCase();
  if (lower.includes('enferm')) return 'Enfermeiro';
  if (lower.includes('médic') || lower.includes('medic')) return 'Médico';
  if (lower.includes('técnic') || lower.includes('tecnic')) return 'Técnico';
  if (lower.includes('recep')) return 'Recepcionista';
  if (lower.includes('admin') || lower.includes('auxiliar admin')) return 'Administrativo';
  if (lower.includes('nutri')) return 'Nutricionista';
  if (lower.includes('psico')) return 'Psicólogo';
  if (lower.includes('farma')) return 'Farmacêutico';
  if (lower.includes('fatur')) return 'Faturista';
  if (lower.includes('manuten')) return 'Manutenção';
  if (lower.includes('limpez') || lower.includes('higien')) return 'Higienista';
  if (lower.includes('almox')) return 'Almoxarife';
  if (lower.includes('compr')) return 'Comprador';
  if (lower.includes('social')) return 'Social';
  if (lower.includes('geren')) return 'Gerente';
  if (lower.includes('diret')) return 'Diretor';
  if (lower.includes('superv')) return 'Supervisor';
  if (lower.includes('auxiliar')) return 'Auxiliar';
  if (lower.includes('atendente')) return 'Atendente';
  if (lower.includes('analista')) return 'Analista';
  if (lower.includes('assistente')) return 'Assistente';

  const firstWord = trimmed.split(/[\s/_\-()]+/)[0];
  if (!firstWord) return '';
  return firstWord.charAt(0).toUpperCase() + firstWord.slice(1).toLowerCase();
};

export const normalizeSectorName = (val) => {
  if (!val) return '';
  const trimmed = String(val).trim();
  const upper = trimmed.toUpperCase();
  if (upper === 'RH' || upper === 'SESMT' || upper === 'TI' || upper === 'DP') {
    return upper;
  }
  const lower = trimmed.toLowerCase();
  if (lower.includes('hemod')) return 'Hemodiálise';
  if (lower.includes('periton') || lower.includes('dp')) return 'Peritoneal';
  if (lower.includes('médic') || lower.includes('medic') || lower.includes('corpo')) return 'Médico';
  if (lower.includes('enferm')) return 'Enfermagem';
  if (lower.includes('farmac') || lower.includes('almox')) return 'Farmácia';
  if (lower.includes('recep') || lower.includes('atend')) return 'Recepção';
  if (lower.includes('fatur') || lower.includes('apac')) return 'Faturamento';
  if (lower.includes('manut') || lower.includes('engenharia')) return 'Manutenção';
  if (lower.includes('qualid') || lower.includes('bi')) return 'Qualidade';
  if (lower.includes('psico')) return 'Psicologia';
  if (lower.includes('nutri')) return 'Nutrição';
  if (lower.includes('social')) return 'Social';
  if (lower.includes('rh') || lower.includes('humano')) return 'RH';
  if (lower.includes('financ') || lower.includes('control')) return 'Financeiro';
  if (lower.includes('compr') || lower.includes('suprim')) return 'Compras';
  if (lower.includes('sesmt') || lower.includes('seguran')) return 'SESMT';
  if (lower.includes('ti') || lower.includes('informát')) return 'TI';
  if (lower.includes('higien') || lower.includes('limpez')) return 'Higienização';
  if (lower.includes('diret') || lower.includes('admin')) return 'Administração';

  const firstWord = trimmed.split(/[\s/_\-()]+/)[0];
  if (!firstWord) return '';
  return firstWord.charAt(0).toUpperCase() + firstWord.slice(1).toLowerCase();
};
