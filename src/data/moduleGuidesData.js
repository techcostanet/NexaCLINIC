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
    name: 'Recursos Humanos & Gestão de Pessoas',
    subtitle: 'NexaHR — Gestão Estratégica & Benefícios',
    color: '#ec4899',
    recursos: [
      {
        title: 'Central de 15 Relatórios Estratégicos',
        desc: 'Relatórios completos em PDF e Excel (Cadastro Geral, VT, Presença Premiada, Aniversariantes, Advertências, Absenteísmo, Turnover, Experiência, Vacinas, Dependentes, Folha Sintética, Dados Bancários/PIX, Documentos/CNH, Efetivo e Auditoria LGPD).'
      },
      {
        title: 'Múltiplas Visualizações de Funcionários',
        desc: '3 modos de visualização rápida: Compacta (padrão de alta densidade), Normal (detalhada com salário/admissão) e Cards (grade de crachás visuais com avatar e atalho WhatsApp).'
      },
      {
        title: 'Gestão de Vale-Transporte & Saldo',
        desc: 'Controle de linhas/rotas urbanas, tarifas diárias (ida/volta), cálculo de recargas e identificação de rotas especiais ou saldo excedente.'
      },
      {
        title: 'Presença Premiada & Assiduidade',
        desc: 'Apuração automatizada de bonificação financeira para colaboradores 100% assíduos (>90d CLT sem faltas ou advertências).'
      },
      {
        title: 'Saúde Ocupacional & Imunização',
        desc: 'Acompanhamento de doses vacinais (Hepatite B, dT, Gripe), validades de reforço e alertas preventivos.'
      }
    ],
    tutorial: [
      {
        title: 'Como Alternar a Visualização de Funcionários',
        steps: [
          'Acesse a aba "Funcionários".',
          'Na barra de filtros, selecione a visualização desejada: "Compacta" (padrão rápida), "Normal" (tabela detalhada) ou "Cards" (grade visual de crachás).',
          'Os dados de busca e setor são sincronizados instantaneamente em qualquer uma das visões.'
        ]
      },
      {
        title: 'Como Acessar e Exportar os 15 Relatórios',
        steps: [
          'Clique no botão verde "Relatórios" no topo superior da tela.',
          'Navegue pela lista dos 15 relatórios no menu lateral esquerdo.',
          'Filtre por Período de Datas, Setor, Status do Colaborador, Mês de Aniversário ou Competência de VT.',
          'Clique em "Exportar PDF" para download do documento formatado ou "Exportar Excel" para planilha com dados numéricos para cálculos.'
        ]
      },
      {
        title: 'Como Cadastrar um Novo Colaborador',
        steps: [
          'No topo do módulo NexaHR, clique em "Novo Funcionário".',
          'Preencha a ficha com Dados Pessoais, Contato, Contrato, Dados Bancários, Dependentes e Vacinas.',
          'Clique em "Salvar Funcionário" para registrar na base operacional.'
        ]
      },
      {
        title: 'Como Fechar a Recarga de Vale-Transporte',
        steps: [
          'Acesse a aba "Gestão de Vale-Transporte".',
          'Selecione a competência mensal no seletor de período.',
          'Verifique as tarifas diárias e os saldos remanescentes informados.',
          'Utilize a Central de Relatórios (Relatório 2) para emitir o demonstrativo de recargas para o financeiro.'
        ]
      }
    ],
    duvidas: [
      {
        pergunta: 'Qual o modo padrão de visualização da lista de colaboradores?',
        resposta: 'O modo padrão é a "Visualização Compacta", focada em velocidade e alta densidade de registros na tela.'
      },
      {
        pergunta: 'Onde encontro a lista de aniversariantes e advertências?',
        resposta: 'Todos os relatórios operacionais e analíticos agora estão centralizados no botão "Relatórios" no topo da navbar, com opções completas de PDF e Excel.'
      },
      {
        pergunta: 'Como funciona a elegibilidade da Presença Premiada?',
        resposta: 'O sistema avalia automaticamente o período de competência: colaboradores ativos (>90 dias CLT) com 0 faltas injustificadas e 0 advertências são classificados como elegíveis.'
      },
      {
        pergunta: 'Como funciona a exportação para Excel dos relatórios?',
        resposta: 'As planilhas são geradas com cabeçalhos limpos e campos monetários gravados como números decimais puros para permitir uso de fórmulas e somatórias no Excel.'
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
        title: 'Múltiplos Modos de Visualização do Catálogo',
        desc: '3 visualizações operacionais: Compacta (padrão de alta densidade), Normal (detalhada com nível e valor estocado) e Cards (grade visual de suprimentos com barras de nível e valor).'
      },
      {
        title: 'Gestão de Kits de Insumos & Procedimentos',
        desc: 'Cadastro e manutenção de kits clínicos padronizados (ex: Kit Conexão de Fístula, Kit Punção, Kit Curativo) com cálculo automático de custo e vinculação ao salão físico.'
      },
      {
        title: 'Sinalização Visual de Medicamentos Controlados',
        desc: 'Identificação visual imediata (Portaria 344/ANVISA) em vermelho de alerta em todo o catálogo, kits, requisições do salão e atendimento da farmácia.'
      },
      {
        title: 'Logística de Salões de Diálise Integrada',
        desc: 'Roteamento físico obrigatório de pedidos de kits para Salão 1, Salão 2 ou Salão 3, permitindo separação e entrega no posto correto.'
      },
      {
        title: 'Central de Relatórios (15 Tipos)',
        desc: 'Suíte completa com 15 relatórios analíticos: Curva ABC, Posição Geral, Itens Críticos, Validades FEFO, Recall e Kardex.'
      },
      {
        title: 'Gestão de Inventários Físicos & Auditoria',
        desc: 'Criação e execução de contagens de estoque por local com apuração imediata de divergências e ajuste automático de saldo.'
      },
      {
        title: 'Transferências Entre Locais de Armazenamento',
        desc: 'Transferência rápida e rastreável de insumos e medicamentos entre estoques e almoxarifados setoriais.'
      },
      {
        title: 'Empréstimos Inter-Hospitalares Inteligentes',
        desc: 'Controle de insumos concedidos e recebidos de clínicas parceiras com auto-sugestão dinâmica de instituições cadastradas.'
      },
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
      }
    ],
    tutorial: [
      {
        title: 'Como Cadastrar um Kit de Insumos',
        steps: [
          'Acesse a aba "Kits" no painel de Estoque.',
          'Clique no botão "+ Novo Kit".',
          'Preencha o Código (ex: KIT-HEMO-01), Nome do Kit, Categoria e Salão Padrão sugerido.',
          'No seletor de composição, escolha os insumos e ajuste as quantidades necessárias.',
          'Confira o custo estimado total do pacote e clique em "Salvar Kit".'
        ]
      },
      {
        title: 'Como Identificar e Cadastrar Medicamentos Controlados',
        steps: [
          'No cadastro de insumos ou edição de produto, marque a opção "🔒 Medicamento Controlado (Portaria 344)".',
          'O sistema passará a exibir a tarja e o badge de segurança vermelho no catálogo, na lista de kits e nas requisições da enfermagem.',
          'Itens controlados exigem atenção redobrada na dispensação e guarda em armário trancado.'
        ]
      },
      {
        title: 'Como Alternar as Visualizações do Catálogo de Produtos',
        steps: [
          'Acesse a aba "Catálogo".',
          'Na barra de ferramentas, clique em "Compacta" (padrão rápida), "Normal" (tabela detalhada com saldo financeiro) ou "Cards" (grade visual com status e nível de estoque).',
          'Os filtros de busca e categoria permanecem ativos em qualquer modo de exibição selecionado.'
        ]
      },
      {
        title: 'Como Atender Requisições Vindas dos Salões',
        steps: [
          'Acesse a aba "Requisições".',
          'Verifique na coluna "Destino" o Salão de destino (Salão 1, Salão 2, Salão 3) e o paciente.',
          'Observe os alertas de "📦 Kit" e "🔒 CONTROLADO" nos itens solicitados.',
          'Clique em "Atender Requisição", selecione os lotes físicos (sugestão FEFO) e confirme a entrega.'
        ]
      },
      {
        title: 'Como Realizar uma Transferência de Estoque',
        steps: [
          'Acesse a aba "Transferências".',
          'Clique no botão "+ Nova Transferência" no cabeçalho da tabela.',
          'Selecione a origem, o destino, o insumo, a quantidade e o lote correspondente.',
          'Confirme o lançamento para movimentar o saldo entre os locais instantaneamente.'
        ]
      },
      {
        title: 'Como Cadastrar um Empréstimo com Parceiro',
        steps: [
          'Acesse a aba "Empréstimos".',
          'Clique em "+ Novo Empréstimo".',
          'No campo "Parceiro", selecione uma clínica da lista de sugestões ou digite um novo nome.',
          'O novo parceiro digitado passará a ser sugerido automaticamente nos próximos empréstimos.'
        ]
      }
    ],
    duvidas: [
      {
        pergunta: 'Por que o saldo em estoque não aparece para a equipe de enfermagem ao requisitar?',
        resposta: 'Para garantir que as solicitações de materiais sejam estritamente pautadas pela necessidade clínica do paciente em diálise, sem interferência ou viés pelo nível de estoque da farmácia central.'
      },
      {
        pergunta: 'Por que o campo Salão é obrigatório ao requisitar um Kit?',
        resposta: 'Porque os kits de procedimentos são entregues fisicamente nas bancadas de cada salão de diálise. Informar o salão correto evita erros e atrasos na entrega.'
      },
      {
        pergunta: 'Qual o modo padrão de visualização do Catálogo de Insumos?',
        resposta: 'O modo padrão é a "Visualização Compacta", configurada para agilidade operacional e máxima densidade de itens na tela.'
      },
      {
        pergunta: 'Como funciona a sinalização visual de medicamentos controlados?',
        resposta: 'Todos os medicamentos sujeitos a controle especial pela Portaria 344/ANVISA recebem badges em vermelho de alto contraste (🔒 Controlado / Portaria 344) em todas as telas, alertas e relatórios.'
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
