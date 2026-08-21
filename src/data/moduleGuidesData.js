// Base de Conhecimento e Manuais dos Módulos do NexaCLINIC
// ATENÇÃO: Regra do Projeto - Toda nova funcionalidade deve ser refletida aqui nas seções recursos, tutorial e duvidas.

export const MODULE_GUIDES = {
  finance: {
    id: 'finance',
    name: 'Módulo Financeiro',
    subtitle: 'NexaFINANCE — Controladoria & Caixa',
    color: '#10b981',
    recursos: [
      {
        title: 'Contas a Pagar',
        desc: 'Lançamento e controle de despesas hospitalares, fixação de centros de custo, anexos de notas fiscais e alertas de vencimento.'
      },
      {
        title: 'Contas a Receber',
        desc: 'Acompanhamento de repasses SUS/APAC, convênios de saúde e atendimentos particulares com gestão de inadimplência.'
      },
      {
        title: 'Orçamento & Centros de Custo',
        desc: 'Definição de metas orçamentárias mensais por unidade e análise comparativa em tempo real (Realizado vs. Planejado).'
      },
      {
        title: 'Saldo Fluxo & Projeção Diária',
        desc: 'Simulação preditiva de saldo bancário futuro em 30, 60 e 90 dias para antecipação de necessidades de caixa.'
      },
      {
        title: 'Acordos & Parcelamentos',
        desc: 'Controle de renegociações e contratos com fornecedores, gerando parcelas automáticas vinculadas ao contas a pagar.'
      },
      {
        title: 'Conciliação Bancária',
        desc: 'Importação e conferência de extratos bancários com batimento de lançamentos em 1 clique.'
      },
      {
        title: 'DRE Gerencial',
        desc: 'Demonstrativo de Resultado do Exercício apurado por Regime de Caixa (Receita Bruta, Despesas e Margem Líquida).'
      }
    ],
    tutorial: [
      {
        title: 'Como Lançar uma Conta a Pagar',
        steps: [
          'Acesse a aba "Contas a Pagar" e clique no botão "+ Nova Despesa".',
          'Preencha o Fornecedor, CNPJ, Categoria (ex: MatMed, Medicamentos), Centro de Custo e Valor.',
          'Defina a Data de Vencimento e anexe o comprovante ou Nota Fiscal se houver.',
          'Clique em "Salvar Lançamento". O título entrará automaticamente nas projeções de fluxo de caixa.'
        ]
      },
      {
        title: 'Como Dar Baixa em um Título',
        steps: [
          'Localize a conta na tabela de "Contas a Pagar" ou pelo Card de Vencidos no Dashboard.',
          'Clique no botão "Baixar" na coluna de Ações.',
          'Confirme a Data do Pagamento, Meio Utilizado (PIX, Boleto, Débito) e Conta Bancária.',
          'O status mudará para "Pago" e o valor será lançado automaticamente no DRE.'
        ]
      },
      {
        title: 'Como Exportar Relatórios para Excel',
        steps: [
          'Clique no botão "Relatórios" no topo superior direito.',
          'Selecione um dos 15 relatórios disponíveis na barra lateral (ex: Extrato Geral, Despesas por Centro de Custo).',
          'Ajuste o período inicial/final e a filial desejada.',
          'Clique em "Exportar Excel". A planilha será baixada com valores numéricos prontos para fórmulas e somas.'
        ]
      },
      {
        title: 'Como Cadastrar Metas Orçamentárias',
        steps: [
          'Acesse a aba "🎯 Orçamento X Realizado".',
          'Clique no botão "+ Nova Meta".',
          'Selecione o Centro de Custo, Mês/Ano de referência e o Valor Teto Planejado.',
          'O sistema calculará automaticamente a % de execução e o status visual (🟢 Saudável, 🟡 Atenção, 🔴 Estourado).'
        ]
      }
    ],
    duvidas: [
      {
        pergunta: 'Os relatórios exportam com o "R$" na frente do valor?',
        resposta: 'Não. Os valores são exportados como números puros decimais para facilitar o uso de fórmulas como =SOMA() e filtros no Excel.'
      },
      {
        pergunta: 'Como sei se uma conta está em atraso?',
        resposta: 'Títulos com data de vencimento anterior ao dia de hoje recebem status e destaque em vermelho "Atrasado" e aparecem no card de alerta do dashboard.'
      },
      {
        pergunta: 'O DRE considera contas pendentes?',
        resposta: 'O DRE opera pelo Regime de Caixa e contabiliza exclusivamente as receitas recebidas e as despesas que já foram baixadas como "Pago".'
      }
    ]
  },

  hr: {
    id: 'hr',
    name: 'Recursos Humanos & Benefícios',
    subtitle: 'NexaHR — Gestão de Pessoal & Plantões',
    color: '#ec4899',
    recursos: [
      {
        title: 'Quadro de Colaboradores',
        desc: 'Cadastro completo de funcionários, setor, cargo, modalidade de contrato (CLT/PJ), salário e status de atividade.'
      },
      {
        title: 'Controle de Passagens & Vale Transporte',
        desc: 'Gestão de linhas de ônibus, quantidade de vales diários e apuração de custos mensais por colaborador e unidade.'
      },
      {
        title: 'Gestão de Ausências & Atestados',
        desc: 'Registro de faltas justificadas, atestados médicos e licenças com cálculo de impacto na folha.'
      },
      {
        title: 'Prêmio Assiduidade',
        desc: 'Apuração automatizada de elegibilidade a bonificações baseada na ausência de faltas e atrasos no mês.'
      },
      {
        title: 'Escalas de Plantão & Setores',
        desc: 'Visualização da distribuição da equipe por setor (Enfermagem, Médica, Administrativo, Recepção e Higiene).'
      }
    ],
    tutorial: [
      {
        title: 'Como Cadastrar um Novo Colaborador',
        steps: [
          'No painel de RH, clique no botão "+ Novo Funcionário".',
          'Preencha Nome Completo, CPF, Cargo, Setor, Unidade de Lotação e Data de Admissão.',
          'Informe os dados de transporte (linhas de ônibus e valor diário de VT) se aplicável.',
          'Clique em "Salvar". O colaborador já estará disponível nas escalas e controles de presença.'
        ]
      },
      {
        title: 'Como Registrar Atestado ou Falta',
        steps: [
          'Acesse a aba "Ausências & Faltas".',
          'Selecione o colaborador, o tipo de ocorrência (Atestado Médico, Falta Justificada, Falta Não Justificada) e as datas.',
          'Anexe o documento ou CID se necessário e confirme.',
          'O sistema recalcula a elegibilidade ao prêmio assiduidade automaticamente.'
        ]
      },
      {
        title: 'Como Gerar o Fechamento de Vales-Transporte',
        steps: [
          'Acesse a aba "Vale Transporte".',
          'Selecione o mês de competência e a unidade.',
          'O sistema calcula a quantidade de dias úteis x valor da passagem de cada linha cadastrada.',
          'Clique em "Exportar Relatório de Recarga" para envio à operadora de transporte.'
        ]
      }
    ],
    duvidas: [
      {
        pergunta: 'Como inativar um colaborador desligado?',
        resposta: 'Basta editar o cadastro do funcionário e alterar o status para "Inativo" ou "Desligado", informando a data de rescisão.'
      },
      {
        pergunta: 'O cálculo de VT desconta faltas do colaborador?',
        resposta: 'Sim. Se houver faltas registradas no módulo de ausências, o sistema deduz os dias correspondentes na recarga seguinte.'
      }
    ]
  },

  calendar: {
    id: 'calendar',
    name: 'Agenda & Consultas',
    subtitle: 'NexaCAL — Agendamentos & Salas',
    color: '#06b6d4',
    recursos: [
      {
        title: 'Múltiplas Visões da Grade',
        desc: 'Visualização por Dia, Semana, Mês ou por Salas/Consultórios físicos em tempo real.'
      },
      {
        title: 'Disparo de WhatsApp com 1 Clique',
        desc: 'Envio de mensagem pré-formatada no WhatsApp do paciente solicitando confirmação de presença.'
      },
      {
        title: 'Gestão Inteligente de Encaixes',
        desc: 'Permite agendamentos extras com sinalização visual destacada sem sobrepor horários fixos.'
      },
      {
        title: 'Cotas e Limites por Especialista',
        desc: 'Controle de vagas máximas por mês para Primeira Consulta e Retornos para cada profissional médico.'
      },
      {
        title: 'Bloqueios e Feriados Nacionais',
        desc: 'Calendário de feriados brasileiros integrado e registro de bloqueios de agenda por férias ou congressos.'
      }
    ],
    tutorial: [
      {
        title: 'Como Agendar um Paciente',
        steps: [
          'Clique no botão "+ Novo Agendamento" ou dê um clique direto no horário vago da grade.',
          'Busque o paciente por Nome ou CPF (ou digite os dados para paciente avulso).',
          'Selecione o Profissional Médico, o Consultório/Sala e o Tipo de Atendimento (Primeira Consulta, Retorno, Procedimento).',
          'Clique em "Salvar Agendamento". O horário será bloqueado na grade instantaneamente.'
        ]
      },
      {
        title: 'Como Confirmar Presença via WhatsApp',
        steps: [
          'No card do agendamento, clique no ícone verde do WhatsApp.',
          'O sistema abrirá o WhatsApp Web com o texto personalizado contendo data, horário, médico e consultório.',
          'Após o envio, marque o status do WhatsApp como "Enviado" ou "Confirmado".'
        ]
      },
      {
        title: 'Como Registrar Entrada na Recepção',
        steps: [
          'Quando o paciente chegar à clínica, clique com o botão direito no card (ou botão rápido de status) e marque "Aguardando".',
          'O médico responsável verá a notificação no painel clínico de que o paciente já está na sala de espera.'
        ]
      }
    ],
    duvidas: [
      {
        pergunta: 'O que acontece quando marco um horário conflitante?',
        resposta: 'O sistema emite um alerta de sobreposição de horário e pergunta se você deseja registrar o atendimento como "Encaixe".'
      },
      {
        pergunta: 'Como bloquear a agenda de um médico que sairá de férias?',
        resposta: 'Clique no botão "Bloqueios" no topo da agenda, selecione o médico, o intervalo de datas e o motivo do bloqueio.'
      }
    ]
  },

  stock: {
    id: 'stock',
    name: 'Estoque & Farmácia',
    subtitle: 'NexaSTOCK — Farmácia Clínica & Insumos',
    color: '#f59e0b',
    recursos: [
      {
        title: 'Controle de Lotes & Rastreabilidade',
        desc: 'Gestão atômica de múltiplos lotes com saldos individuais, validade, fornecedor e nota fiscal de origem.'
      },
      {
        title: 'Dispensação com Sugestão FEFO',
        desc: 'Atendimento de requisições com seleção de lote físico e recomendação automática do lote mais próximo do vencimento.'
      },
      {
        title: 'Painel de Busca Reversa (Recall)',
        desc: 'Rastreabilidade completa de ponta a ponta: fornecedor, nota fiscal de compra e todos os pacientes que receberam o lote.'
      },
      {
        title: 'Entrada por XML / PDF (DANFE) & Manual',
        desc: 'Abastecimento automático de lotes diretamente na importação de notas fiscais ou em movimentações avulsas.'
      },
      {
        title: 'Prontuário Integrado',
        desc: 'Cada medicamento ou material dispensado é gravado imediatamente no histórico clínico do paciente.'
      }
    ],
    tutorial: [
      {
        title: 'Como Atender Requisições com Lote (FEFO)',
        steps: [
          'Na aba "Atendimento de Requisições", clique no botão "Atender Requisição" do pedido pendente.',
          'Para cada item, o sistema selecionará automaticamente o lote com vencimento mais próximo (⭐ FEFO).',
          'Altere o lote pelo dropdown se desejar ou informe a quantidade entregue.',
          'Clique em "Confirmar & Baixar". O sistema abaterá o saldo do lote e registrará no prontuário do paciente.'
        ]
      },
      {
        title: 'Como Fazer Busca Reversa de Lote (Recall)',
        steps: [
          'Acesse a aba "Rastreabilidade & Recall".',
          'Digite o número do Lote, nome do medicamento ou selecione um dos lotes recentes.',
          'Clique em "Rastrear Lote" para ver a nota de compra, fornecedor e a lista de pacientes que receberam as doses.',
          'Utilize o botão "Imprimir Relatório de Recall" para auditoria sanitária ou ANVISA.'
        ]
      },
      {
        title: 'Como Dar Entrada de Lotes por Nota Fiscal',
        steps: [
          'Na aba "Entrada de Notas", clique em "Importar NF-e (XML / PDF)".',
          'Envie o arquivo XML da SEFAZ ou o PDF da DANFE.',
          'Na etapa de Mapeamento, confira o número do Lote e a Data de Validade de cada produto.',
          'Na etapa Finalizar, confirme a entrada. O saldo geral e o lote específico serão abastecidos simultaneamente.'
        ]
      }
    ],
    duvidas: [
      {
        pergunta: 'Como sei quais pacientes tomaram determinado medicamento de um lote específico?',
        resposta: 'Basta acessar a aba "Rastreabilidade & Recall", digitar o número do lote e o sistema listará instantaneamente todos os pacientes, datas, horários e responsáveis.'
      },
      {
        pergunta: 'Onde vejo no prontuário os remédios que o paciente já tomou?',
        resposta: 'No módulo Clínico (NexaCLINIC), selecione o paciente e acesse a aba "Medicamentos & Insumos" para ver o histórico detalhado com lote e validade.'
      }
    ]
  },

  purchasing: {
    id: 'purchasing',
    name: 'Compras & Cotações',
    subtitle: 'NexaPROCURE — Suprimentos & Orçamentos',
    color: '#f59e0b',
    recursos: [
      {
        title: 'Solicitações de Compra',
        desc: 'Abertura de pedidos de compra pelos setores da clínica com justificativa técnica e grau de urgência.'
      },
      {
        title: 'Mapa Comparativo de 3 Cotações',
        desc: 'Inserção de propostas de até 3 fornecedores com destaque automático para o menor preço e melhor condição de pagamento.'
      },
      {
        title: 'Alçada de Aprovação de Diretoria',
        desc: 'Fluxo de autorização de verba com aprovação ou rejeição formal pelo gestor financeiro.'
      },
      {
        title: 'Conversão Automática em Ordem de Compra (OC)',
        desc: 'Geração de PDF da Ordem de Compra para envio formal ao fornecedor vencedor.'
      }
    ],
    tutorial: [
      {
        title: 'Como Criar uma Solicitação de Compra',
        steps: [
          'Clique no botão "+ Nova Solicitação".',
          'Descreva os itens solicitados, quantidades, setor requisitante e justificativa.',
          'Defina a prioridade (Baixa, Média, Alta ou Urgente) e clique em "Salvar".',
          'O setor de compras receberá a notificação para iniciar as cotações.'
        ]
      },
      {
        title: 'Como Preencher o Mapa de Cotações',
        steps: [
          'Abra a solicitação pendente e acesse a aba "Cotações".',
          'Insira os dados do Fornecedor A, Fornecedor B e Fornecedor C (Preço Unitário, Frete e Prazo de Entrega).',
          'O sistema calcula o menor custo global e recomenda a melhor proposta.',
          'Envie para a "Alçada de Aprovação da Diretoria".'
        ]
      },
      {
        title: 'Como Emitir a Ordem de Compra',
        steps: [
          'Após a aprovação da diretoria, clique em "Gerar Ordem de Compra".',
          'Baixe o documento em PDF ou envie diretamente por e-mail ao fornecedor.',
          'Quando a mercadoria for entregue, a OC alimentará a entrada no estoque com 1 clique.'
        ]
      }
    ],
    duvidas: [
      {
        pergunta: 'É obrigatório ter 3 cotações para aprovar uma compra?',
        resposta: 'Para itens de valor relevante a política do sistema recomenda 3 orçamentos, mas para compras exclusivas ou tabeladas é possível justificar fornecedor único.'
      },
      {
        pergunta: 'Como o financeiro sabe o que foi aprovado em compras?',
        resposta: 'As ordens de compra aprovadas alimentam a previsão de desembolso no módulo financeiro, auxiliando no planejamento de caixa.'
      }
    ]
  },

  requisitions: {
    id: 'requisitions',
    name: 'Requisições de Insumos',
    subtitle: 'NexaREQ — Enfermagem & Salões de Diálise',
    color: '#14b8a6',
    recursos: [
      {
        title: 'Pedidos Ágeis para os Salões',
        desc: 'Solicitação rápida de kits dialíticos, dialisadores, linhas e heparina diretamente pelos técnicos de enfermagem.'
      },
      {
        title: 'Vinculação Direta ao Turno e Paciente',
        desc: 'Registro de insumos consumidos por turno (1º, 2º, 3º ou 4º turno) e salão físico (Salão 1 ou Salão 2).'
      },
      {
        title: 'Atendimento Rápido pela Farmácia',
        desc: 'Fila visual de separação de materiais na farmácia para entrega imediata ao salão.'
      }
    ],
    tutorial: [
      {
        title: 'Como Fazer uma Requisição para o Salão',
        steps: [
          'No painel de requisições, clique em "+ Nova Requisição".',
          'Selecione o Salão de Destino, o Turno e a Enfermagem Responsável.',
          'Adicione os itens e quantidades necessárias (ex: 20 Kits de Diálise, 5 Frascos de Heparina).',
          'Clique em "Enviar para Farmácia".'
        ]
      },
      {
        title: 'Como a Farmácia Atende a Requisição',
        steps: [
          'A farmácia visualiza o pedido com status "Pendente".',
          'Ao separar os insumos, clica em "Atender / Separar Itens".',
          'Os saldos são baixados automaticamente no estoque central.'
        ]
      }
    ],
    duvidas: [
      {
        pergunta: 'Posso solicitar itens urgentes durante a sessão de diálise?',
        resposta: 'Sim. Ao marcar o pedido com a tag "Urgência de Sessão", o pedido sobe para o topo da fila da farmácia com aviso sonoro/visual.'
      }
    ]
  },

  sesmt: {
    id: 'sesmt',
    name: 'SESMT & Segurança do Trabalho',
    subtitle: 'NexaSAFE — Prevenção & Normas Regulamentadoras',
    color: '#10b981',
    recursos: [
      {
        title: 'Checklist Diário de EPIs',
        desc: 'Fiscalização diária do uso de equipamentos de proteção individual (luvas, aventais impermeáveis, óculos, máscaras N95).'
      },
      {
        title: 'Inspeção Semanal de Extintores & Hidrantes',
        desc: 'Acompanhamento do estado físico, pressão do manômetro, lacres e datas de recarga/teste hidrostático.'
      },
      {
        title: 'Registro e Gestão de Equipamentos de Segurança',
        desc: 'Inventário de extintores, mangueiras de hidrante, kits de derramamento químico e lava-olhos da clínica.'
      },
      {
        title: 'Histórico & Auditoria de Não Conformidades',
        desc: 'Registro de ocorrências de risco com planos de ação corretiva e prazos de resolução.'
      }
    ],
    tutorial: [
      {
        title: 'Como Realizar a Inspeção de Extintores',
        steps: [
          'Acesse a aba "Extintores" no painel do SESMT.',
          'Selecione o extintor pelo número de identificação ou localização (ex: Recepção, Salão de Diálise, Sala de Máquinas).',
          'Preencha o checklist: Manômetro na faixa verde, Lacre intacto, Bocal desobstruído e Validade da Carga.',
          'Clique em "Salvar Inspeção". O histórico ficará registrado para auditorias sanitárias.'
        ]
      },
      {
        title: 'Como Realizar a Inspeção de Hidrantes',
        steps: [
          'Acesse a aba "Hidrantes".',
          'Selecione o ponto de hidrante e inspecione: Caixa fechada, Mangueira enrolada corretamente, Esguicho acoplado e Registro estanque.',
          'Se houver alguma avaria, marque "Não Conforme" e descreva o reparo necessário.',
          'Clique em "Gravar Inspeção".'
        ]
      },
      {
        title: 'Como Lançar o Checklist de EPI',
        steps: [
          'Acesse "Checklist de EPI".',
          'Selecione o setor (ex: Hemodiálise, Higienização, Manutenção) e o turno de trabalho.',
          'Marque a conformidade do uso dos equipamentos pela equipe e salve.'
        ]
      }
    ],
    duvidas: [
      {
        pergunta: 'Com que frequência os extintores devem ser inspecionados no sistema?',
        resposta: 'A fiscalização visual e de lacre é recomendada semanalmente ou quinzenalmente, enquanto a recarga anual deve ser atualizada no cadastro do equipamento.'
      },
      {
        pergunta: 'Os registros do SESMT servem para auditorias da Vigilância Sanitária e CBMG?',
        resposta: 'Sim. Os relatórios gerados pelo módulo contêm data, hora, responsável técnico e status detalhado de conformidade exigidos pelas normas NR-06, NR-23 e NR-32.'
      }
    ]
  },

  assist: {
    id: 'assist',
    name: 'Feed Assistencial & Alertas',
    subtitle: 'NexaASSIST — Comunicação Integrada & IA',
    color: '#ec4899',
    recursos: [
      {
        title: 'Mural de Comunicados Clínicos',
        desc: 'Feed em tempo real de avisos assistenciais, comunicados da diretoria médica e recados de plantão.'
      },
      {
        title: 'Alertas de Altas e Internações',
        desc: 'Notificação imediata de pacientes internados em hospitais parceiros ou que receberam alta para retorno à diálise.'
      },
      {
        title: 'Classificação por Salão & Turno',
        desc: 'Filtros rápidos para visualização de alertas específicos do 1º, 2º, 3º ou 4º turno de atendimento.'
      },
      {
        title: 'Leitor de E-mails e Documentos com IA',
        desc: 'Assistente inteligente que resume laudos médicos externos, e-mails de secretarias de saúde e relatórios longos.'
      }
    ],
    tutorial: [
      {
        title: 'Como Publicar um Comunicado no Feed',
        steps: [
          'No painel do Feed Assistencial, clique em "+ Novo Comunicado".',
          'Selecione o público-alvo (Geral, Enfermagem, Médicos, Recepção) e a urgência.',
          'Digite a mensagem ou instruções de plantão e anexe fotos/documentos se necessário.',
          'Clique em "Publicar". O card aparecerá imediatamente no topo do feed para toda a equipe.'
        ]
      },
      {
        title: 'Como Usar o Leitor Inteligente de E-mails com IA',
        steps: [
          'Clique no botão "Analisar com IA".',
          'Cole o texto do e-mail, laudo ou aviso recebido da Secretaria de Saúde/Hospital.',
          'A IA processará o documento e extrairá os pontos de ação, prazos e impactos clínicos de forma resumida.'
        ]
      }
    ],
    duvidas: [
      {
        pergunta: 'Quem pode publicar comunicados no feed?',
        resposta: 'Profissionais clínicos, enfermeiros líderes, coordenadores de setor e administradores do sistema.'
      },
      {
        pergunta: 'Como fixar um comunicado importante no topo?',
        resposta: 'Ao criar ou editar o comunicado, marque a opção "Fixar no Topo do Mural" para mantê-lo em destaque.'
      }
    ]
  },

  // Placeholders para módulos com manual em finalização
  reception: {
    id: 'reception',
    name: 'Recepção & Cadastro',
    subtitle: 'NexaCLINIC — Admissão & Acolhimento',
    color: '#0ea5e9',
    recursos: [
      { title: 'Admissão de Pacientes', desc: 'Cadastro de dados pessoais, convênios, contatos de emergência e documentos digitalizados.' },
      { title: 'Controle de Presença Diária', desc: 'Check-in dos pacientes de hemodiálise por turno e salão.' }
    ],
    tutorial: [
      { title: 'Operação da Recepção', steps: ['Consulte a documentação completa no treinamento presencial ou contate o administrador.'] }
    ],
    duvidas: [
      { pergunta: 'Manual em finalização', resposta: 'As instruções detalhadas deste módulo serão liberadas nas próximas atualizações.' }
    ]
  },

  clinical: {
    id: 'clinical',
    name: 'Módulo Clínico & Prescrição',
    subtitle: 'NexaCLINIC — Prontuário Eletrônico & Evoluções',
    color: '#8b5cf6',
    recursos: [
      { title: 'Prontuário Médico & Diálise', desc: 'Prescrição de hemodiálise, parâmetros de fluxo, heparina e dialisador.' },
      { title: 'Evoluções Multidisciplinares', desc: 'Registros de Enfermagem, Nutrição, Psicologia e Serviço Social.' }
    ],
    tutorial: [
      { title: 'Operação Clínica', steps: ['Consulte a documentação clínica disponível no protocolo institucional.'] }
    ],
    duvidas: [
      { pergunta: 'Manual em finalização', resposta: 'As instruções detalhadas deste módulo serão liberadas nas próximas atualizações.' }
    ]
  },

  maintenance: {
    id: 'maintenance',
    name: 'Manutenção & Engenharia Clínica',
    subtitle: 'NexaSERVICE — Ordem de Serviço & Ativos',
    color: '#0891b2',
    recursos: [
      { title: 'Chamados de Ordem de Serviço', desc: 'Abertura e atendimento de chamados para máquinas de diálise, osmose e predial.' }
    ],
    tutorial: [
      { title: 'Abertura de Chamados', steps: ['Consulte a engenharia clínica para protocolos de manutenção preventiva.'] }
    ],
    duvidas: [
      { pergunta: 'Manual em finalização', resposta: 'Instruções técnicas em consolidação.' }
    ]
  },

  apac: {
    id: 'apac',
    name: 'APACs & Faturamento',
    subtitle: 'NexaAPAC — Regulação SUS & Faturamento',
    color: '#ef4444',
    recursos: [
      { title: 'Gestão de Guias APAC', desc: 'Controle de validade de laudos de diálise, autorizações SUS e auditoria de glosas.' }
    ],
    tutorial: [
      { title: 'Faturamento de Guias', steps: ['Consulte os manuais de faturamento SUS/BPA da unidade.'] }
    ],
    duvidas: [
      { pergunta: 'Manual em finalização', resposta: 'Rotinas de faturamento em processo de documentação.' }
    ]
  },

  quality: {
    id: 'quality',
    name: 'Gestão da Qualidade & BI',
    subtitle: 'NexaINDEX — Indicadores & Governança',
    color: '#3b82f6',
    recursos: [
      { title: 'Indicadores Hospitalares', desc: 'Métricas assistenciais, Kt/V, taxas de infecção e metas de qualidade.' }
    ],
    tutorial: [
      { title: 'Consulta de Indicadores', steps: ['Selecione o mês de referência no dashboard para visualizar as metas.'] }
    ],
    duvidas: [
      { pergunta: 'Manual em finalização', resposta: 'Guias de BI em elaboração.' }
    ]
  },

  config: {
    id: 'config',
    name: 'Configurações & TI',
    subtitle: 'NexaCONFIG — Administração & Acessos',
    color: '#8b5cf6',
    recursos: [
      { title: 'Gestão de Usuários & RBAC', desc: 'Controle de permissões, papéis de acesso e customização de tema.' }
    ],
    tutorial: [
      { title: 'Administração do Sistema', steps: ['Acesso restrito a administradores de TI do sistema.'] }
    ],
    duvidas: [
      { pergunta: 'Manual em finalização', resposta: 'Consulte o suporte técnico de TI para parametrizações.' }
    ]
  }
};
