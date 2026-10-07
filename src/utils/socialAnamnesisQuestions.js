// ============================================================
// Catálogo Oficial de Perguntas e Opções da Anamnese Social
// Extraído e padronizado a partir do Google Forms oficial:
// "Anamnese Social – Paciente Renal"
// ============================================================

export const CIDADES_ATENDIDAS = [
  'Betim',
  'Brumadinho',
  'Esmeraldas',
  'Florestal',
  'Igarapé',
  'Juatuba',
  'Mário Campos',
  'Mateus Leme',
  'Piedade dos Gerais',
  'Rio Manso',
  'São Joaquim de Bicas',
  'Outra'
];

export const TIPOS_TRATAMENTO = [
  'Hemodiálise – HD',
  'Diálise Peritoneal – DP',
  'Diálise Peritoneal Intermitente – DPI'
];

export const ESCALAS_TURNO = [
  '1º turno – Segunda / Quarta / Sexta',
  '2º turno – Segunda / Quarta / Sexta',
  '3º turno – Segunda / Quarta / Sexta',
  '1º turno – Terça / Quinta / Sábado',
  '2º turno – Terça / Quinta / Sábado',
  '3º turno – Terça / Quinta / Sábado'
];

export const SALAS_TRATAMENTO = [
  'Sala 01',
  'Sala 02',
  'Sala 03'
];

export const ESTADOS_CIVIS = [
  'Solteiro(a)',
  'Casado(a)',
  'União estável',
  'Separado(a)',
  'Divorciado(a)',
  'Viúvo(a)',
  'Outro'
];

export const NIVEIS_ESCOLARIDADE = [
  'Não possui escolaridade',
  'Ensino Fundamental incompleto',
  'Ensino Fundamental completo',
  'Ensino Médio incompleto',
  'Ensino Médio completo',
  'Ensino Superior incompleto',
  'Ensino Superior completo',
  'Pós-graduação'
];

export const PESSOAS_APOIO = [
  'Cônjuge',
  'Filho(a)',
  'Pai ou mãe',
  'Irmão(ã)',
  'Outro familiar',
  'Amigo(a)',
  'Não possui'
];

export const QUANTIDADE_MORADORES = [
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7 ou mais'
];

export const FAIXAS_RENDA_FAMILIAR = [
  'A família não possui renda',
  'Até R$ 405,25',
  'De R$ 405,26 a R$ 810,50',
  'De R$ 810,51 a R$ 1.621,00',
  'De R$ 1.621,01 a R$ 3.242,00',
  'De R$ 3.242,01 a R$ 4.863,00',
  'De R$ 4.863,01 a R$ 6.484,00',
  'De R$ 6.484,01 a R$ 8.105,00',
  'Acima de R$ 8.105,00',
  'Não sabe informar'
];

export const SITUACOES_MORADIA = [
  'Própria quitada',
  'Própria financiada',
  'Alugada',
  'Cedida',
  'Ocupação',
  'Outra'
];

export const CONDICOES_ESGOTAMENTO = [
  'Rede geral de esgoto',
  'Fossa',
  'Não possui',
  'Não sabe informar'
];

export const BENEFICIOS_SOCIAIS = [
  'Não recebe benefício',
  'BPC / LOAS',
  'Benefício por incapacidade',
  'Aposentadoria',
  'Pensão',
  'Bolsa Família ou outro programa de transferência de renda',
  'Outro'
];

export const MEIOS_TRANSPORTE = [
  'Transporte da Prefeitura',
  'Transporte fora do domicílio',
  'Carro particular',
  'Transporte de familiar ou amigo',
  'Aplicativo',
  'Ônibus',
  'Ambulância',
  'Outro'
];

export const OPCOES_SIM_NAO = ['Sim', 'Não'];
export const OPCOES_SIM_NAO_PARCIAL = ['Sim', 'Não', 'Parcialmente'];
export const OPCOES_NAO_SIM_AS_VEZES = ['Não', 'Sim', 'Às vezes'];
export const OPCOES_DIFICULDADE_TRATAMENTO = [
  'Não',
  'Sim',
  'Prefiro conversar pessoalmente com o Serviço Social'
];
export const OPCOES_GOSTARIA_CONVERSAR = [
  'Não',
  'Sim',
  'Já sou acompanhado(a)'
];

export const OPCOES_STATUS_ACOMPANHAMENTO = [
  'Em Acompanhamento',
  'Triagem',
  'Prioritário',
  'Concluído'
];

export const INITIAL_SOCIAL_ANAMNESE = {
  // Identificação e Motor de Paciente
  patientId: '',
  unitId: '',
  nomeCompleto: '',
  dataNascimento: '',
  telefonePrincipal: '',
  telefoneSecundario: '',
  endereco: '',
  bairro: '',
  cidade: '',
  ubsReferencia: '',

  // Tratamento
  tipoTratamento: '',
  escalaTurno: '',
  salaTratamento: '',

  // Perfil Social e Família
  estadoCivil: '',
  escolaridade: '',
  trabalhaAtualmente: '',
  ajudaAtividades: '',
  possuiCuidador: '',
  pessoaApoio: '',
  pessoasResidencia: '',

  // Situação Socioeconômica e Moradia
  rendaFamiliar: '',
  situacaoMoradia: '',
  aguaEncanada: '',
  esgotamentoSanitario: '',
  recebeBeneficio: '',
  contribuiuInss: '',

  // Acesso, Alimentação e Vulnerabilidade
  transporteTratamento: '',
  dificuldadeTransporte: '',
  rendaSuficiente: '',
  dificuldadeAlimentos: '',
  dificuldadeTratamento: '',
  gostariaConversar: '',
  situacaoImportante: '',

  // Campos Exclusivos da Gestão do Serviço Social (Modo Editável)
  parecerTecnico: '',
  responsavelTecnico: '',
  cressResponsavel: '',
  statusAcompanhamento: 'Triagem',
  origemPreenchimento: 'social', // 'social' (clínica) ou 'paciente' (link externo)
  createdAt: '',
  updatedAt: ''
};

// Avaliação rápida de vulnerabilidade social
export function calcularAlertasVulnerabilidade(a = {}) {
  const alertas = [];

  if (a.rendaFamiliar === 'A família não possui renda' || a.rendaFamiliar === 'Até R$ 405,25') {
    alertas.push({ tipo: 'renda', rotulo: 'Sem Renda', gravidade: 'alta' });
  }

  if (a.dificuldadeAlimentos === 'Sim' || a.dificuldadeAlimentos === 'Às vezes') {
    alertas.push({ tipo: 'alimento', rotulo: 'Insegurança Alimentar', gravidade: 'alta' });
  }

  if (a.dificuldadeTransporte === 'Sim' || a.dificuldadeTransporte === 'Às vezes') {
    alertas.push({ tipo: 'transporte', rotulo: 'Dificuldade de Transporte', gravidade: 'media' });
  }

  if (a.aguaEncanada === 'Não' || a.esgotamentoSanitario === 'Não possui') {
    alertas.push({ tipo: 'saneamento', rotulo: 'Sem Saneamento', gravidade: 'alta' });
  }

  if (a.dificuldadeTratamento === 'Sim' || a.dificuldadeTratamento === 'Prefiro conversar pessoalmente com o Serviço Social') {
    alertas.push({ tipo: 'adesao', rotulo: 'Risco de Continuidade', gravidade: 'critica' });
  }

  if (a.gostariaConversar === 'Sim') {
    alertas.push({ tipo: 'contato', rotulo: 'Solicita Contato', gravidade: 'media' });
  }

  if (a.pessoaApoio === 'Não possui' || a.possuiCuidador === 'Não') {
    alertas.push({ tipo: 'apoio', rotulo: 'Sem Rede de Apoio', gravidade: 'media' });
  }

  return alertas;
}
