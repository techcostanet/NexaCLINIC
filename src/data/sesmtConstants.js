/**
 * Constantes e Mapeamentos do Módulo SESMT (Segurança e Medicina do Trabalho)
 * Nex-Ai CLINIC
 */

export const SESMT_SECTORS = [
  'D.P',
  'Salão 1',
  'Salão 2',
  'Salão 3',
  'Hemodiálise Externa',
  'Bloco Cirúrgico',
  'Reuso',
  'Sala Amarela',
  'Recepção',
  'Recepção 2',
  'Copa',
  'Lavatório',
  'Consultórios',
  'Ambulatório',
  'Corredor Central'
];

export const DEFAULT_SECTOR_EMAILS = {
  'lavatório': { email1: 'higienizacao@dialize.com.br', email2: 'sesmt@dialize.com.br' },
  'lavatorio': { email1: 'higienizacao@dialize.com.br', email2: 'sesmt@dialize.com.br' },
  'recepção 2': { email1: 'atendimento@dialize.com.br', email2: 'sesmt@dialize.com.br' },
  'recepcao 2': { email1: 'atendimento@dialize.com.br', email2: 'sesmt@dialize.com.br' },
  'consultórios': { email1: 'medicos@dialize.com.br', email2: 'sesmt@dialize.com.br' },
  'consultorios': { email1: 'medicos@dialize.com.br', email2: 'sesmt@dialize.com.br' },
  'salão 1': { email1: 'enfermagem@dialize.com.br', email2: 'sesmt@dialize.com.br' },
  'salao 1': { email1: 'enfermagem@dialize.com.br', email2: 'sesmt@dialize.com.br' },
  'salão 2': { email1: 'enfermagem@dialize.com.br', email2: 'sesmt@dialize.com.br' },
  'salao 2': { email1: 'enfermagem@dialize.com.br', email2: 'sesmt@dialize.com.br' },
  'salão 3': { email1: 'enfermagem@dialize.com.br', email2: 'sesmt@dialize.com.br' },
  'salao 3': { email1: 'enfermagem@dialize.com.br', email2: 'sesmt@dialize.com.br' },
  'd.p': { email1: 'dp@dialize.com.br', email2: 'sesmt@dialize.com.br' },
  'diálise peritoneal': { email1: 'dp@dialize.com.br', email2: 'sesmt@dialize.com.br' },
  'dialise peritoneal': { email1: 'dp@dialize.com.br', email2: 'sesmt@dialize.com.br' },
  'hemodiálise externa': { email1: 'enfermagem@dialize.com.br', email2: 'sesmt@dialize.com.br' },
  'hemodialise externa': { email1: 'enfermagem@dialize.com.br', email2: 'sesmt@dialize.com.br' },
  'bloco cirúrgico': { email1: 'bloco@dialize.com.br', email2: 'sesmt@dialize.com.br' },
  'bloco cirurgico': { email1: 'bloco@dialize.com.br', email2: 'sesmt@dialize.com.br' },
  'reuso': { email1: 'reuso@dialize.com.br', email2: 'sesmt@dialize.com.br' },
  'sala amarela': { email1: 'enfermagem@dialize.com.br', email2: 'sesmt@dialize.com.br' },
  'recepção': { email1: 'recepcao@dialize.com.br', email2: 'sesmt@dialize.com.br' },
  'recepcao': { email1: 'recepcao@dialize.com.br', email2: 'sesmt@dialize.com.br' },
  'copa': { email1: 'nutricao@dialize.com.br', email2: 'sesmt@dialize.com.br' },
  'ambulatório': { email1: 'ambulatorio@dialize.com.br', email2: 'sesmt@dialize.com.br' },
  'ambulatorio': { email1: 'ambulatorio@dialize.com.br', email2: 'sesmt@dialize.com.br' },
  'corredor central': { email1: 'higienizacao@dialize.com.br', email2: 'sesmt@dialize.com.br' }
};

export const getSectorDefaultEmails = (sectorName) => {
  if (!sectorName) return { email1: 'gestao@dialize.com.br', email2: 'sesmt@dialize.com.br' };
  const clean = sectorName.trim().toLowerCase();
  return DEFAULT_SECTOR_EMAILS[clean] || { email1: 'gestao@dialize.com.br', email2: 'sesmt@dialize.com.br' };
};

