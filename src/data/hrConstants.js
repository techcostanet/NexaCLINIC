// Cargos e Setores Padronizados para o NexaHR (Ambiente Clínico e Hospitalar)

export const STANDARD_ROLES = [
  // Assistencial & Enfermagem
  'Auxiliar de Enfermagem',
  'Técnico(a) de Enfermagem',
  'Enfermeiro(a) Assistencial',
  'Enfermeiro(a) de Diálise Peritoneal',
  'Enfermeiro(a) Chefe / RT',
  'Supervisor(a) de Enfermagem',

  // Corpo Clínico & Multidisciplinar
  'Médico Nefrologista',
  'Médico Plantonista',
  'Médico Clínico',
  'Médico RT (Responsável Técnico)',
  'Nutricionista Clínico(a)',
  'Psicólogo(a) Clínico(a)',
  'Assistente Social',
  'Farmacêutico(a) Responsável',
  'Auxiliar de Farmácia',

  // Manutenção & Engenharia Clínica
  'Engenheiro(a) Clínico',
  'Técnico(a) em Manutenção Biomédica',
  'Técnico(a) em Tratamento de Água (ETA)',
  'Auxiliar de Manutenção Predial',

  // Recepção, Administrativo & Operações
  'Recepcionista / Atendente',
  'Assistente de Recepção',
  'Faturista Hospitalar',
  'Assistente Administrativo',
  'Analista Administrativo',
  'Auxiliar de Higienização e Limpeza',
  'Líder de Higienização',

  // Recursos Humanos & Gestão de Pessoas
  'Assistente de Recursos Humanos',
  'Analista de Recursos Humanos',
  'Supervisor(a) de Recursos Humanos',

  // Financeiro & Compras
  'Assistente Financeiro',
  'Analista Financeiro',
  'Comprador(a) / Suprimentos',
  'Almoxarife / Estoquista',

  // Qualidade, Segurança & TI
  'Analista de Qualidade & BI',
  'Técnico(a) em Segurança do Trabalho (SESMT)',
  'Analista de TI / Sistemas',
  'Suporte de TI',

  // Diretoria & Gestão Executiva
  'Gerente Administrativo',
  'Gerente de Operações',
  'Diretor(a) Clínico',
  'Diretor(a) Geral',

  // Outros / Compatibilidade
  'Colaborador CLT',
  'Prestador de Serviços (PJ)',
  'Estagiário(a)',
  'Menor Aprendiz'
];

export const STANDARD_SECTORS = [
  { id: 'hemodialise', name: 'Hemodiálise (Salões)', description: 'Salões de Hemodiálise e Assistência Dialítica' },
  { id: 'dialise_peritoneal', name: 'Diálise Peritoneal (DP)', description: 'Atendimento e Treinamento de DP Domiciliar' },
  { id: 'medica', name: 'Corpo Clínico & Médicos', description: 'Nefrologistas, Plantonistas e Consultórios' },
  { id: 'enfermagem', name: 'Enfermagem', description: 'Equipe de Enfermagem Geral e Supervisão' },
  { id: 'farmacia', name: 'Farmácia & Almoxarifado', description: 'Dispensação Farmacêutica, Medicamentos e Insumos' },
  { id: 'recepcao', name: 'Recepção & Atendimento', description: 'Portaria, Atendimento e Admissão de Pacientes' },
  { id: 'faturamento', name: 'Faturamento & APACs', description: 'Auditoria de Guias SUS, APACs e Convênios' },
  { id: 'manutencao', name: 'Manutenção & Engenharia Clínica', description: 'Manutenção Predial, Equipamentos e Sistema de Água (ETA)' },
  { id: 'qualidade', name: 'Qualidade & BI', description: 'Auditorias, Indicadores Assistenciais e Segurança do Paciente' },
  { id: 'psicologia', name: 'Psicologia Clínica', description: 'Suporte Emocional e Acompanhamento Psicológico Renal' },
  { id: 'nutricao', name: 'Nutrição Clínica', description: 'Dietoterapia Renal e Avaliações Antropométricas' },
  { id: 'servico_social', name: 'Serviço Social', description: 'Acolhimento Social, Direitos e Apoio à Família' },
  { id: 'rh', name: 'Recursos Humanos (RH)', description: 'Gestão de Pessoas, Benefícios VT, DP e Folha' },
  { id: 'financeiro', name: 'Financeiro & Controladoria', description: 'Contas a Pagar/Receber, Tesouraria e Fluxo de Caixa' },
  { id: 'compras', name: 'Compras & Suprimentos', description: 'Cotações de 3 Orçamentos, Compras e Fornecedores' },
  { id: 'sesmt', name: 'SESMT & Segurança do Trabalho', description: 'Checklists de EPIs, Prevenção de Acidentes e Brigada' },
  { id: 'ti', name: 'Tecnologia da Informação (TI)', description: 'Infraestrutura de Rede, Suporte, Servidores e Software' },
  { id: 'higienizacao', name: 'Higienização & Limpeza', description: 'Controle de Resíduos de Saúde, Limpeza e Desinfecção Hospitalar' },
  { id: 'diretoria', name: 'Diretoria & Administração', description: 'Alta Gestão, Compliance e Governança Clínica' }
];
