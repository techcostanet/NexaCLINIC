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

  stock: {
    id: 'stock',
    name: 'Estoque & Farmácia',
    subtitle: 'NexaSTOCK — Farmácia Clínica & Insumos',
    color: '#f59e0b',
    recursos: [
      {
        title: 'Modelo dos 4 Saldos de Estoque',
        desc: 'Visão fidedigna do estoque: Físico (na prateleira), Reservado (solicitado pelos salões), Disponível (livre para novas demandas) e Trânsito (pedidos de compras abertos).'
      },
      {
        title: 'Expiração Automática por TTL',
        desc: 'Requisições pendentes ou parciais não atendidas no prazo configurado (padrão 1h) expiram automaticamente, liberando o saldo reservado de volta para o disponível.'
      },
      {
        title: 'Semáforo de Urgência no Atendimento',
        desc: 'Indicador visual por tempo de vida das requisições: 🟢 Recente (>30m), 🟡 Atenção (15 a 30m), 🔴 Quase Expirando (<15m) e ⏱️ Expirada (TTL esgotado).'
      },
      {
        title: 'Múltiplos Modos de Visualização do Catálogo',
        desc: '3 visualizações operacionais: Compacta (padrão de alta densidade), Normal (detalhada com nível e valor estocado) e Cards (grade visual de suprimentos).'
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
        title: 'Como Atender Requisições com Controle de Urgência',
        steps: [
          'Acesse a aba "Requisições" no painel de Estoque.',
          'Observe o semáforo de tempo restante ao lado do status (🟢 Recente, 🟡 Atenção, 🔴 Quase Expirando).',
          'Atenda as requisições prioritárias antes do término do tempo limite de TTL.',
          'Clique em "Atender Requisição", selecione os lotes físicos (sugestão FEFO) e confirme a entrega.',
          'Caso uma requisição expire pelo TTL, seu status muda para "Expirada" e a reserva de saldo é desfeita automaticamente.'
        ]
      },
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
        title: 'Como Realizar uma Transferência de Estoque',
        steps: [
          'Acesse a aba "Transferências".',
          'Clique no botão "+ Nova Transferência" no cabeçalho da tabela.',
          'Selecione a origem, o destino, o insumo, a quantidade e o lote correspondente.',
          'Confirme o lançamento para movimentar o saldo entre os locais instantaneamente.'
        ]
      }
    ],
    duvidas: [
      {
        pergunta: 'O que é o Estoque Reservado e como ele afeta o Almoxarifado?',
        resposta: 'O Estoque Reservado é a soma de todos os insumos solicitados pela enfermagem que ainda estão pendentes de entrega. O saldo Disponível (Físico - Reservado) reflete o que realmente pode ser usado ou prometido.'
      },
      {
        pergunta: 'O que acontece quando uma requisição atinge o tempo limite (TTL)?',
        resposta: 'Ela muda automaticamente para o status "Expirada" e os materiais reservados voltam a ficar disponíveis para o estoque geral, evitando que pedidos esquecidos travem falsamente os insumos da clínica.'
      },
      {
        pergunta: 'Por que o saldo em estoque não aparece para a equipe de enfermagem ao requisitar?',
        resposta: 'Para garantir que as solicitações de materiais sejam estritamente pautadas pela necessidade clínica do paciente em diálise, sem interferência ou viés pelo nível de estoque da farmácia central.'
      },
      {
        pergunta: 'Como funciona a sinalização visual de medicamentos controlados?',
        resposta: 'Todos os medicamentos sujeitos a controle especial pela Portaria 344/ANVISA recebem badges em vermelho de alto contraste (🔒 Controlado / Portaria 344) em todas as telas, alertas e relatórios.'
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
        title: 'Controle de Tempo de Vida (TTL) & Expiração',
        desc: 'Controle inteligente de tempo limite (inicial de 1h) para atendimento na farmácia com contagem regressiva em tempo real.'
      },
      {
        title: 'Renovação de Requisições em 1 Clique',
        desc: 'Botão de renovação instantânea para requisições que expiraram sem necessidade de preenchimento manual de todos os insumos novamente.'
      },
      {
        title: 'Múltiplos Modos de Visualização',
        desc: '3 opções visuais completas: Compacta (padrão de alta velocidade), Normal (detalhada) e Cards (painel visual de solicitações com filtros rápidos).'
      },
      {
        title: 'Inclusão Rápida de Kits de Produtos',
        desc: 'Adição instantânea de todos os insumos padronizados de procedimentos dialíticos com apenas 1 clique.'
      },
      {
        title: 'Sinalização de Medicamentos Controlados',
        desc: 'Identificação visual e rastreabilidade rigorosa para medicamentos sujeitos à Portaria 344/ANVISA.'
      },
      {
        title: 'Vinculação Obrigatória de Salão para Kits',
        desc: 'Direcionamento logístico seguro para entrega direta no Salão 1, Salão 2, Salão 3 ou Consultório.'
      }
    ],
    tutorial: [
      {
        title: 'Como Fazer uma Requisição para o Salão',
        steps: [
          'No painel de requisições, clique no botão "+ Nova Requisição".',
          'Selecione o Salão e informe se o Destino é de Uso Geral ou Paciente específico.',
          'Utilize os botões de "Kits" para carregar pacotes pré-montados ou selecione insumos individuais na busca.',
          'Informe a quantidade desejada e clique em "Adicionar".',
          'Insira observações clínicas se necessário e clique em "Enviar".'
        ]
      },
      {
        title: 'Como Renovar uma Requisição Expirada',
        steps: [
          'Caso o atendimento não ocorra dentro do TTL estabelecido (ex: 1h), a requisição receberá a tarja vermelha "Expirada (TTL)".',
          'Na coluna de Ações (ou no rodapé do Card), clique no botão de renovar (ícone de repetição).',
          'Confirme o envio: uma nova requisição com código atualizado será gerada imediatamente para a farmácia.'
        ]
      },
      {
        title: 'Como Acompanhar o Tempo Restante',
        steps: [
          'Em qualquer uma das visualizações (Compacta, Normal ou Cards), observe o contador ao lado do status (ex: "42m restantes").',
          'Quando faltarem menos de 15 minutos, o alerta ficará em vermelho indicando urgência.'
        ]
      }
    ],
    duvidas: [
      {
        pergunta: 'O que significa o status "Expirada (TTL)" na minha requisição?',
        resposta: 'Significa que o prazo configurado para retirada na farmácia (ex: 1 hora) expirou antes que a farmácia realizasse a baixa. A reserva do medicamento foi liberada e você pode clicar no botão "Renovar" para reenviar a solicitação.'
      },
      {
        pergunta: 'Por que o saldo do estoque central não é exibido durante a requisição?',
        resposta: 'Para garantir que a equipe de enfermagem solicite exatamente o que o procedimento e o paciente necessitam, sem influências ou restrições pelo nível atual do almoxarifado.'
      },
      {
        pergunta: 'É obrigatório selecionar o Salão de Destino?',
        resposta: 'Para requisições contendo Kits de produtos o campo Salão é obrigatório, pois a logística de entrega precisa saber em qual bancada física o kit deve ser depositado.'
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
      { title: 'Gestão de Usuários & RBAC', desc: 'Controle de permissões, papéis de acesso e customização de tema.' },
      { title: 'Tempo de Vida das Requisições (TTL)', desc: 'Parametrização do tempo limite (1h padrão, 2h, 4h, 8h/turno, 12h, 24h) para atendimento de materiais antes da liberação automática de saldo reservado.' }
    ],
    tutorial: [
      {
        title: 'Como Configurar o TTL de Requisições',
        steps: [
          'Acesse o módulo de Configurações.',
          'Na seção "Parâmetros do Sistema / Farmácia", localize o campo "Tempo Limite de Requisições (TTL)".',
          'Selecione um dos presets rápidos (1h, 2h, 4h, 8h/Turno, 12h, 24h) ou digite o valor em horas.',
          'Clique em "Salvar Configurações". A regra será aplicada a todas as novas requisições de salão.'
        ]
      }
    ],
    duvidas: [
      { pergunta: 'O que acontece ao alterar o TTL?', resposta: 'O novo limite temporal passa a valer para a verificação contínua de requisições pendentes, recalculando o prazo para que requisições não atendidas expirem.' }
    ]
  },

  assist: {
    id: 'assist',
    name: 'Assistência Clínica',
    subtitle: 'NexaASSIST — Feed Assistencial & Comunicados Rápidos',
    color: '#ec4899',
    recursos: [
      {
        title: 'Mural Assistencial Centralizado',
        desc: 'Feed ágil de comunicados clínicos rápidos para passagem de plantão e alinhamento direto entre enfermagem, médicos, nutrição, psicologia e serviço social.'
      },
      {
        title: '3 Modos de Visualização',
        desc: 'Alternância instantânea entre modo Normal (Cards detalhados), Compacta (Lista ágil e densa em tabela) e Grade (Cards em múltiplas colunas para monitores).'
      },
      {
        title: 'Grade de Categorias sem Cortes',
        desc: 'Cards responsivos de categorias com contagens em tempo real para Total, Internação, Alta, Intercorrência, Transferência, Nutrição, Psicologia, Serviço Social, Óbito e Geral com nomes 100% visíveis.'
      },
      {
        title: 'Controle de Autoria e Segurança',
        desc: 'Proteção onde apenas o profissional autor do comunicado ou administradores podem editar ou excluir seus respectivos avisos.'
      },
      {
        title: 'Filtro Dinâmico por Período de Data',
        desc: 'Seletor de intervalo temporal (Hoje, Ontem, 7 Dias, 30 Dias, Este Mês ou Personalizado com início e fim) que recalcula automaticamente métricas e comunicados.'
      }
    ],
    tutorial: [
      {
        title: 'Como Alternar entre os Modos de Visualização',
        steps: [
          'Na barra de ferramentas, localize o seletor com os botões "Compacta", "Normal" e "Grade".',
          'Clique em "Compacta" para ver uma tabela de alta densidade com uma linha por ocorrência (ideal para passagens de plantão rápidas).',
          'Clique em "Normal" para a visualização padrão em cards detalhados.',
          'Clique em "Grade" para organizar os comunicados em múltiplas colunas simultâneas.'
        ]
      },
      {
        title: 'Como Publicar um Comunicado Rápido',
        steps: [
          'No topo do mural, clique no botão "+ Novo Comunicado".',
          'Selecione a Categoria clínica desejada (Internação, Alta, Intercorrência, etc.).',
          'Busque e selecione o paciente para vincular o aviso diretamente ao prontuário.',
          'Defina o Salão, Turno e nível de Urgência.',
          'Digite a mensagem clínica e clique em "Publicar".'
        ]
      },
      {
        title: 'Como Filtrar Comunicados por Categoria',
        steps: [
          'Dê um clique direto no card da categoria desejada na grade superior (ex: "🔴 Internação" ou "🟢 Alta").',
          'O card ficará realçado e o feed exibirá imediatamente apenas os comunicados correspondentes.',
          'Para voltar a ver todos os avisos, clique novamente no mesmo card ou clique no card "Todos".'
        ]
      }
    ],
    duvidas: [
      {
        pergunta: 'Quem pode editar ou excluir um comunicado?',
        resposta: 'Por segurança e rastreabilidade clínica, apenas o profissional que redigiu o comunicado (autor) ou usuários com perfil de Administrador têm permissão para editar ou excluir a postagem.'
      },
      {
        pergunta: 'Como funciona a filtragem rápida na grade superior?',
        resposta: 'Basta clicar no card de qualquer categoria na grade superior para filtrar o mural. Um segundo clique no mesmo card desativa o filtro e volta a exibir todos os comunicados.'
      }
    ]
  },

  purchasing: {
    id: 'purchasing',
    name: 'Compras & Suprimentos',
    subtitle: 'NexaPROCURE — Cotações & Reposição de Estoque',
    color: '#0891b2',
    recursos: [
      {
        title: 'Reposição Inteligente com 4 Saldos',
        desc: 'Matriz visual de decisão de compra com colunas Físico, Reservado, Disponível, Trânsito, Mínimo e Sugestão. O gatilho de compra dispara quando Disponível <= Mínimo, evitando compras desnecessárias ou faltas surpresa.'
      },
      {
        title: 'Detalhamento de Requisições por Salão',
        desc: 'Clique direto no saldo Reservado para inspecionar todas as requisições de enfermagem em aberto (Salão, Solicitante, Paciente, Quantidade e Horário).'
      },
      {
        title: 'Solicitação em Lote com 1 Clique',
        desc: 'Botão para gerar automaticamente solicitações de compra unificadas para todos os insumos em nível crítico sem digitação manual.'
      },
      {
        title: 'Esteira de Solicitações & Alçadas',
        desc: 'Fluxo completo de aprovação em etapas (Solicitado, Gestor de Setor, Diretor Clínico, Cotação e Finalizado).'
      },
      {
        title: 'Sala de Cotações Triplas com IA',
        desc: 'Comparativo lado a lado de 3 orçamentos destacando automaticamente Menor Preço e Entrega Mais Rápida com entrada automatizada no Estoque e no Financeiro.'
      },
      {
        title: 'Catálogo de Fornecedores com Ordenação',
        desc: 'Gestão de empresas distribuidoras com ordenação clicável em todas as colunas (Razão, CNPJ, Contato, Email, Prazo).'
      }
    ],
    tutorial: [
      {
        title: 'Como Tomar Decisões de Compra pela Reposição',
        steps: [
          'Acesse a aba "Reposição" no módulo de Compras.',
          'Analise a tabela com os 4 saldos: Físico, Reservado, Disponível e Trânsito.',
          'Se o saldo Disponível estiver zerado ou abaixo do mínimo, o item é sinalizado em vermelho ou amarelo.',
          'Dê um clique no badge de "Reservado" para abrir o modal com o detalhamento das requisições e salões demandantes.',
          'Clique em "Solicitar" ou utilize "Solicitação em Lote" para iniciar o processo de cotação com a quantidade sugerida calculada.'
        ]
      },
      {
        title: 'Como Comparar Orçamentos e Finalizar a Compra',
        steps: [
          'Acesse a aba "Cotações" e selecione o item aprovado na lista à esquerda.',
          'Preencha os valores e prazos dos Fornecedores A, B e C.',
          'O sistema indicará os vencedores de Melhor Preço e Entrega Mais Rápida.',
          'Clique em "Comprar do A", "B" ou "C" para finalizar. O sistema criará a entrada no Estoque e a despesa no Contas a Pagar.'
        ]
      },
      {
        title: 'Como Ordenar e Filtrar Fornecedores',
        steps: [
          'Acesse a aba "Fornecedores".',
          'Dê um clique no cabeçalho de qualquer coluna (Razão, CNPJ, Contato, Email ou Prazo) para ordenar de forma crescente (A-Z) ou decrescente (Z-A).',
          'Utilize a barra de pesquisa para filtrar rapidamente por nome, CNPJ ou representante.'
        ]
      }
    ],
    duvidas: [
      {
        pergunta: 'Por que o sistema considera o Estoque Disponível e não apenas o Estoque Físico?',
        resposta: 'Porque quando as técnicas de enfermagem requisitam materiais para os salões nos 3 turnos, os insumos ainda podem estar fisicamente na prateleira. Se o comprador olhar apenas o físico, ele não compraria e o estoque zeraria horas depois. O saldo Disponível (Físico - Reservado) resolve esse problema.'
      },
      {
        pergunta: 'Como o sistema calcula a sugestão de compra?',
        resposta: 'A sugestão é calculada como Max(0, Estoque Ideal - (Estoque Disponível + Em Trânsito)), evitando comprar itens que já possuem pedidos de compra em andamento.'
      },
      {
        pergunta: 'A finalização de uma compra gera movimentações automáticas em outros módulos?',
        resposta: 'Sim! Ao finalizar a compra na sala de cotações, o NexaPROCURE gera automaticamente a entrada do lote no módulo de Estoque (NexaSTOCK) e lança a duplicata a pagar no módulo Financeiro (NexaFINANCE).'
      }
    ]
  }
};
