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
      },
      {
        title: 'Gestão Multi-Unidade (Betim & Taguatinga)',
        desc: 'Visão consolidada de receitas, despesas, fluxo de caixa e DRE para a diretoria, com possibilidade de isolar cada filial (Betim/MG ou Taguatinga/DF) com 1 clique no seletor do cabeçalho.'
      },
      {
        title: 'Catálogo de Fornecedores',
        desc: 'Autocompletar inteligente com mais de 480 parceiros e credores cadastrados e segmentados por filial (Betim e Taguatinga) para agilizar o preenchimento de lançamentos de despesas.'
      },
      {
        title: 'Gestão de Boletos & Cópia em 1 Clique',
        desc: 'Visualização direta do PDF/imagem do boleto e botão de cópia instantânea da linha digitável para agendamento no Internet Banking sem risco de erros de digitação.'
      },
      {
        title: 'Remessa Bancária CNAB 240 (Banco Sicoob 756)',
        desc: 'Geração de arquivo de remessa Febraban CNAB 240 v3.3 (Segmentos J e J-52) para pagamento em lote de títulos e boletos de fornecedores via Sicoob Internet Banking.'
      }
    ],
    tutorial: [
      {
        title: 'Como Lançar uma Conta a Pagar',
        steps: [
          'Acesse a aba "Contas a Pagar" e clique no botão "+ Nova Despesa".',
          'Preencha o Fornecedor, CNPJ, Categoria (ex: MatMed, Medicamentos), Centro de Custo, Valor e a Filial (Betim ou Taguatinga).',
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
        title: 'Como Gerar Arquivo de Remessa CNAB 240 Sicoob',
        steps: [
          'No módulo Financeiro, acesse a aba "Contas a Pagar".',
          'Clique no botão "Remessa" na barra superior de ações.',
          'Na primeira utilização, informe os parâmetros bancários do Sicoob (Convênio, Agência, Conta e DV) e clique em "Salvar".',
          'Selecione os títulos pendentes que deseja pagar em lote. É possível editar ou incluir a linha digitável diretamente na tabela se algum boleto não possuir código.',
          'Clique em "Exportar". O arquivo .REM será baixado automaticamente com os registros Febraban prontos para importação no Sicoob Internet Banking.'
        ]
      },
      {
        title: 'Como Visualizar e Pagar Boletos Bancários',
        steps: [
          'Acesse a aba "Contas a Pagar" e localize a despesa na tabela.',
          'Na coluna "Boleto", clique no botão "Copiar" para transferir a Linha Digitável de 47 dígitos diretamente para sua área de transferência.',
          'Acesse o Internet Banking ou aplicativo bancário e cole o código para efetuar o pagamento ou agendamento.',
          'Para visualizar ou imprimir o documento original, clique no botão "Boleto" para abrir o visualizador interativo em modal sem sair da página.'
        ]
      },
      {
        title: 'Como Filtrar e Alternar Entre Filiais',
        steps: [
          'No topo do painel ou na barra superior, utilize o Seletor de Unidades.',
          'Escolha "🌐 Todas as Unidades" para visualizar o demonstrativo financeiro e saldo consolidado do grupo econômico.',
          'Ou selecione especificamente "🏢 Betim - MG" ou "🏢 Taguatinga - DF" para auditar as contas e lançamentos individuais da filial selecionada.',
          'Ao lançar uma nova conta a pagar ou receber, certifique-se de selecionar a Filial correta no formulário.'
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
        pergunta: 'Como funciona o acesso de operadoras de filiais remotas (ex: Taguatinga)?',
        resposta: 'Colaboradores com acesso restrito a Taguatinga só visualizam e lançam despesas e notas da sua respectiva unidade. Já a Gestora Financeira e Administradores possuem visão de Todas as Unidades simultaneamente.'
      },
      {
        pergunta: 'Qual o formato do arquivo de remessa gerado para o Sicoob?',
        resposta: 'O arquivo é gerado estritamente no padrão CNAB 240 v3.3 do Sicoob (Banco 756), com 240 caracteres por linha, contendo Header de Arquivo, Header de Lote (Serviço 20 Fornecedores), Segmentos J (código de barras e valores) e J-52 (sacado e cedente obrigatório), além dos trailers de fechamento.'
      },
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
      },
      {
        pergunta: 'Como o boleto bancário é vinculado à conta a pagar?',
        resposta: 'Ele pode ser anexado automaticamente na entrada da Nota Fiscal no módulo de Estoque (com leitura inteligente do código de barras) ou anexado manualmente no formulário de Nova Despesa.'
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
        title: 'Gestão de Exames Ocupacionais (ASO) & Nuvem',
        desc: 'Controle completo de exames ocupacionais para colaboradores CLT e prestadores PJ com upload de comprovantes (PDF/Imagens) diretamente no Firebase Cloud Storage, permitindo visualização e download em alta resolução de qualquer dispositivo.'
      },
      {
        title: 'Alertas Preditivos de Vencimento (30d, 14d, 7d)',
        desc: 'Monitoramento em tempo real com contagem regressiva e alertas no painel de controle para exames vencidos, em até 7 dias (crítico), 14 dias (atenção) e 30 dias (alerta).'
      },
      {
        title: 'Cargos e Setores Padronizados (1 Palavra A-Z)',
        desc: 'Catálogo de cargos e 25 setores hospitalares padronizados estritamente com termo único, primeira letra maiúscula e ordenação alfabética (A-Z), com normalização automática de cadastros legados.'
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
        title: 'Como Lançar e Renovar Exames Ocupacionais (ASO)',
        steps: [
          'Acesse a aba "Exames" no painel NexaHR.',
          'Clique no botão "+ Lançar ASO" ou localize o colaborador e clique em "Renovar".',
          'Selecione o Colaborador (CLT ou PJ), Tipo de Exame (Admissional, Periódico, etc.) e a Data do Exame.',
          'O sistema calculará automaticamente o próximo vencimento para +1 ano (para Admissionais e Periódicos).',
          'Informe o Resultado (Apto / Inapto), Médico/CRM, Clínica/Local, anexe o arquivo comprobatório se houver e clique em "Salvar ASO".'
        ]
      },
      {
        title: 'Como Monitorar Alertas de Exames na Dashboard',
        steps: [
          'Acesse o "Painel de Controle" do NexaHR.',
          'Consulte o card "Alertas de Exames Periódicos (ASO)" para conferir o resumo de exames vencidos, em 7d, 14d e 30d.',
          'Clique no botão "Lançar" diretamente na lista de alertas para realizar a renovação imediata do colaborador prestes a vencer.'
        ]
      },
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
        pergunta: 'Os exames periódicos aplicam-se a profissionais PJ além de CLT?',
        resposta: 'Sim. O sistema monitora o ciclo ocupacional tanto de colaboradores CLT quanto de prestadores e profissionais PJ, garantindo total conformidade operacional na clínica.'
      },
      {
        pergunta: 'Onde ficam armazenados os arquivos e laudos de ASO anexados?',
        resposta: 'Os documentos são enviados diretamente para o Firebase Cloud Storage em servidores seguros na nuvem. Você pode visualizá-los e baixá-los de qualquer dispositivo clicando no ícone do olho na tabela de exames.'
      },
      {
        pergunta: 'Como é calculada a periodicidade do exame anual?',
        resposta: 'Ao registrar um exame Admissional ou Periódico, o sistema agenda automaticamente o próximo vencimento para 1 ano (12 meses) após a realização do exame. Para funcionários recém-admitidos sem ASO lançado, o sistema calcula a data com base na data de admissão.'
      },
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

  stock: {
    id: 'stock',
    name: 'Estoque & Farmácia',
    subtitle: 'NexaSTOCK — Farmácia Clínica & Insumos',
    color: '#f59e0b',
    recursos: [
      {
        title: 'Entrada de Notas de Mercadorias (NF-e) e Serviços Prestados (NFS-e)',
        desc: 'Suporte completo a notas de produtos (com abastecimento físico de estoque, controle de lotes e validades) e notas de serviços prestados/tomados (sem incremento físico de estoque, com registro fiscal e geração automática no Contas a Pagar do Financeiro).'
      },
      {
        title: 'Leitor Inteligente de Arquivos (XML & PDF DANFE / NFS-e)',
        desc: 'Importação com auto-reconhecimento de formato: XML SEFAZ para NF-e, XML ABRASF/nacional para NFS-e e PDFs oficiais (DANFE ou espelhos de prefeitura), com extração de número, código, prestador, valores, parcelas e descrição dos serviços.'
      },
      {
        title: 'Lançamento e Digitação Manual de Notas',
        desc: 'Opção de entrada rápida por digitação direta na tela para notas de serviços ou compras que não disponham de arquivo digital (XML ou PDF).'
      },
      {
        title: 'Filtro e Auditoria Unificada de Entradas',
        desc: 'Consulta organizada com filtro por tipo (Todas as Entradas, Produtos NF-e ou Serviços NFS-e), busca por número/fornecedor/serviço e modal de visualização completa com conferência de parcelas financeiras.'
      },
      {
        title: 'Leitura e Anexo de Boletos na Entrada de Notas',
        desc: 'Anexo de boletos bancários em PDF ou imagem com extração automática da linha digitável (47 ou 48 dígitos) e sincronização direta com o Contas a Pagar do financeiro.'
      },
      {
        title: 'Entrada Parcelada & Divisão Rápida de Duplicatas',
        desc: 'Detecção inteligente de múltiplas parcelas em XML e PDF (DANFE e NFS-e), com botões de divisão rápida (1x, 2x, 3x, 4x, 6x), ajuste automático de centavos (Equilibrar) e lançamento individual no Contas a Pagar.'
      },
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
        title: 'Como Dar Entrada em Notas de Serviços Prestados (NFS-e)',
        steps: [
          'Acesse a aba "Entradas" no painel de Estoque.',
          'Clique no botão "+ Lançar Serviço" para preenchimento direto ou em "Importar (XML ou PDF)" se possuir o arquivo digital emitido pela prefeitura ou prestador.',
          'Selecione a modalidade (Arquivo ou Digitação) e confirme o tipo "🛠️ Serviço (NFS-e)".',
          'No passo "Documento" e "Fornecedor", confirme os dados cadastrais do prestador e da nota.',
          'No passo "Financeiro & Serviço", configure as parcelas do Contas a Pagar e informe a descrição e categoria do serviço.',
          'Para notas de serviços, a etapa de produtos é pulada automaticamente, direcionando diretamente para a revisão.',
          'Clique em "Confirmar Entrada de Serviço". A nota será arquivada e as duplicatas serão criadas no Financeiro sem alterar o estoque físico de insumos.'
        ]
      },
      {
        title: 'Como Dar Entrada em Notas de Mercadorias (NF-e)',
        steps: [
          'Acesse a aba "Entradas" e clique em "Importar (XML ou PDF)".',
          'Arraste ou selecione o arquivo XML da NF-e (padrão SEFAZ) ou o arquivo PDF da DANFE.',
          'O sistema extrairá o fornecedor, CNPJ, itens, quantidades, valores e faturas.',
          'Confirme os dados do fornecedor e as parcelas no passo Financeiro.',
          'No passo "Mapear Itens", vincule os itens da nota aos produtos do catálogo da clínica, informando número de lote e validade para os insumos rastreáveis.',
          'Revise o resumo geral e confirme a operação. Os saldos físicos de estoque serão incrementados imediatamente e o Contas a Pagar será abastecido.'
        ]
      },
      {
        title: 'Como Filtrar e Visualizar Detalhes das Notas de Entrada',
        steps: [
          'Na aba "Entradas", utilize o menu suspenso de filtro para alternar entre "Todas as Entradas", "Produtos (NF-e)" ou "Serviços (NFS-e)".',
          'Use o campo de busca para encontrar notas por número, nome do fornecedor ou palavras da descrição do serviço.',
          'Na tabela, localize a nota desejada e clique no botão "Ver" na coluna Ações para abrir o detalhamento completo do documento, emitente e parcelas.'
        ]
      },
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
      },
      {
        title: 'Como Cadastrar um Empréstimo com Parceiro',
        steps: [
          'Acesse a aba "Empréstimos".',
          'Clique em "+ Novo Empréstimo".',
          'No campo "Parceiro", selecione uma clínica da lista de sugestões ou digite um novo nome.',
          'O novo parceiro digitado passará a ser sugerido automaticamente nos próximos empréstimos.'
        ]
      },
      {
        title: 'Como Anexar e Ler o Boleto na Entrada da NF-e',
        steps: [
          'Abra o assistente de importação de NF-e na aba "Entradas" do Estoque.',
          'Carregue o arquivo XML ou DANFE em PDF da nota.',
          'Na Etapa 3 (Financeiro), na seção "Boleto", selecione o arquivo PDF ou imagem do boleto.',
          'O sistema lerá e preencherá automaticamente a Linha Digitável. Se desejar, faça ajustes manuais.',
          'Conclua o assistente. O boleto e a linha digitável serão vinculados às contas a pagar geradas no Financeiro.'
        ]
      },
      {
        title: 'Como Gerenciar Parcelas na Entrada de Notas',
        steps: [
          'No assistente de importação de notas (XML ou PDF), avance até o passo "Financeiro".',
          'O sistema identifica automaticamente as parcelas da nota (duplicatas ou termos descritivos como "30/60/90 dias").',
          'Utilize os botões de atalho "1x", "2x", "3x", "4x" ou "6x" caso deseje recalcular as parcelas a cada 30 dias.',
          'Se houver diferença de centavos, clique em "Equilibrar" para ajustar o total na última parcela.',
          'Informe ou confira a linha digitável de cada parcela antes de confirmar a entrada.'
        ]
      }
    ],
    duvidas: [
      {
        pergunta: 'O que fazer se a nota fiscal tiver pagamento parcelado?',
        resposta: 'O sistema detecta automaticamente as parcelas no XML ou PDF. Você pode conferir os vencimentos e valores na tabela, usar os botões de divisão rápida (ex: 3x), adicionar parcelas com o botão "+ Parcela" ou clicar em "Equilibrar" para acertar os centavos.'
      },
      {
        pergunta: 'É obrigatório anexar o boleto para importar uma nota fiscal?',
        resposta: 'Não, o anexo do boleto é opcional. Se a nota já foi paga ou for paga via PIX/depósito, o assistente pode ser concluído sem anexar o boleto.'
      },
      {
        pergunta: 'Quais formatos de boleto o leitor suporta?',
        resposta: 'O leitor suporta boletos bancários em PDF ou imagem (PNG, JPG), decodificando automaticamente o código de barras ou a linha digitável de 47 dígitos (bancário) e 48 dígitos (concessionárias).'
      },
      {
        pergunta: 'Por que a etapa de produtos é pulada nas notas fiscais de serviço?',
        resposta: 'Como serviços prestados (manutenções, locações, consultorias) não geram movimentação de insumos físicos nem controle de lotes, o assistente omite automaticamente a etapa de mapeamento de catálogo, tornando a entrada mais rápida em 4 passos diretos.'
      },
      {
        pergunta: 'Como corrigir uma nota fiscal que foi importada com tipo ou valor divergente?',
        resposta: 'Na aba "Entradas", você pode clicar diretamente em cima do valor da nota (ícone de lápis) para digitar a quantia correta e salvar instantaneamente. Além disso, ao clicar em "Ver", o modal de detalhes disponibiliza campo de edição de valor e o botão "Salvar como Serviço" para sincronizar o tipo e o total correto no banco de dados.'
      },
      {
        pergunta: 'A entrada de uma Nota de Serviços (NFS-e) afeta a quantidade de produtos ou insumos no estoque?',
        resposta: 'Não. Notas fiscais de serviços prestados (NFS-e) registram contratações como calibração de equipamentos, manutenção, TI, consultoria ou terceirização. Elas não interferem no saldo físico de insumos clínicos, garantindo a integridade dos inventários e abastecendo automaticamente o Contas a Pagar no Financeiro.'
      },
      {
        pergunta: 'Quais formatos de arquivo são aceitos na importação de notas fiscais?',
        resposta: 'O sistema aceita tanto arquivos XML (padrão SEFAZ para NF-e e padrão ABRASF/nacional para NFS-e) quanto documentos em formato PDF (DANFE para mercadorias e espelhos de NFS-e municipais de prefeituras). Também é possível realizar o lançamento por digitação manual caso você possua apenas os dados da nota.'
      },
      {
        pergunta: 'Como as parcelas da nota fiscal chegam ao setor financeiro?',
        resposta: 'Ao concluir a importação ou lançamento manual da nota, cada parcela configurada no assistente é gravada no Contas a Pagar com fornecedor, CNPJ, número do documento, vencimento e valor especificados, integrando compras e financeiro.'
      },
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
    name: 'Enfermagem & Salão',
    subtitle: 'NexaCARE — Operação & Assistência de Salão',
    color: '#14b8a6',
    recursos: [
      {
        title: 'Digitação & Acompanhamento de Sessões de HD',
        desc: 'Registro completo pré-diálise, acompanhamento horário das pressões/taxa UF/fluxo de sangue, intercorrências intradialíticas em 1 toque e fechamento pós-diálise com cálculo de perda efetiva.'
      },
      {
        title: 'Consulta da Escala de Salão em Tempo Real',
        desc: 'Acesso imediato à distribuição de pacientes por Salão 1, 2 e 3, turnos e cadeiras em modo leitura para conferência ágil de pontos de diálise.'
      },
      {
        title: 'Requisição Rápida de Kits & Insumos',
        desc: 'Solicitação instantânea de kits padronizados (Kit Diálise, Kit Curativo, Kit Punção) e medicamentos para uso geral do salão ou vinculado a paciente.'
      },
      {
        title: 'Abertura Direta de Chamados de Máquinas',
        desc: 'Comunicação imediata de alarmes e falhas em máquinas de hemodiálise e poltronas diretamente para a equipe de Engenharia Clínica no NexaSERVICE.'
      },
      {
        title: 'Controle de Alertas & Intercorrências',
        desc: 'Sinalização visual destacada de pacientes com intercorrências intradialíticas registradas durante o turno.'
      }
    ],
    tutorial: [
      {
        title: 'Como Digitar uma Sessão de Hemodiálise',
        steps: [
          'Na aba "Sessão", localize o paciente na grade do turno do dia.',
          'Clique em "Digitar Sessão" para abrir a folha eletrônica de diálise.',
          'Preencha o Peso Inicial, PA Inicial, temperatura e avaliação do acesso vascular.',
          'Registre os parâmetros horários (PA, FC, pressões de linha, Qb real e taxa UF) da 1ªh à 4ªh.',
          'Caso ocorra hipotensão ou cãibras, selecione o botão correspondente nas intercorrências.',
          'No término do tratamento, informe o Peso Final, PA Final e clique em "Salvar Sessão de Diálise".'
        ]
      },
      {
        title: 'Como Consultar a Escala de Pacientes do Salão',
        steps: [
          'Clique na aba "Escala".',
          'Alterne entre Salão 01, Salão 02 ou Salão 03 e selecione o turno de interesse.',
          'Consulte a disposição dos pacientes por número de cadeira e tipo de acesso vascular.'
        ]
      },
      {
        title: 'Como Fazer uma Requisição de Insumos',
        steps: [
          'Na aba "Requisição", clique no botão "+ Nova Requisição".',
          'Selecione o Salão de destino e indique se é para Uso Geral ou vinculado a um Paciente.',
          'Clique em um dos botões de Kits ou busque o material desejado na barra de pesquisa.',
          'Informe a quantidade e clique em "Transmitir Requisição" para envio à Farmácia.'
        ]
      },
      {
        title: 'Como Abrir Chamado para Máquina de Hemodiálise',
        steps: [
          'Na aba "Chamados", clique no botão "+ Abrir Chamado".',
          'Selecione a máquina pelo número e salão (ex: Máquina 04 - Salão 01).',
          'Escolha a prioridade e selecione o defeito comum (ex: Alarme de Condutividade, Vazamento) ou digite a descrição.',
          'Clique em "Transmitir para Manutenção". O chamado será recebido imediatamente pelos técnicos no NexaSERVICE.'
        ]
      }
    ],
    duvidas: [
      {
        pergunta: 'As sessões salvas no NexaCARE ficam registradas no prontuário do paciente?',
        resposta: 'Sim. Todo o acompanhamento horário, peso pré/pós e intercorrências registradas no NexaCARE são sincronizados em tempo real com o prontuário eletrônico do paciente e com os indicadores de qualidade.'
      },
      {
        pergunta: 'Como sei se a máquina que apresentou defeito já foi consertada?',
        resposta: 'Na aba "Chamados", você pode acompanhar o status da ordem de serviço em tempo real (Aberta, Em Diagnóstico, Concluída). Quando a manutenção concluir o reparo, o badge mudará para "Concluída".'
      },
      {
        pergunta: 'Posso solicitar insumos para mais de um paciente na mesma requisição?',
        resposta: 'Para materiais de uso individual rastreáveis (como capilares ou ampolas específicas), recomenda-se vincular a requisição diretamente ao paciente. Para insumos de salão (gaze, luvas, soros), utilize a opção "Uso Geral do Salão".'
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
    name: 'Assistência Clínica & Escalas',
    subtitle: 'NexaASSIST — Gestão de Enfermagem & Mural',
    color: '#ec4899',
    recursos: [
      {
        title: 'Escala de Hemodiálise por Salões & Turnos',
        desc: 'Mapa visual interativo dos leitos/cadeiras por Salão (01, 02, 03) e Turno (1º, 2º, 3º), organizado por Boxes (01 a 08 e Sala Amarela) substituindo integralmente as planilhas manuais.'
      },
      {
        title: 'Rastreabilidade de Máquinas & Manutenção',
        desc: 'Vínculo direto de cada ponto ao número de série da máquina de hemodiálise com status de manutenção clínica (Operacional, Preventiva ou Corretiva) em tempo real.'
      },
      {
        title: 'Detalhamento de Acesso Vascular & Calibre de Agulhas',
        desc: 'Identificação visual instantânea do tipo de acesso (FAV com calibre de agulha 15, 16 ou 17, Cateter Duplo Lúmen e Permcath) e alertas de Isolamento (HIV / Uso Único e Hepatite).'
      },
      {
        title: 'Localizador Global de Paciente & Máquina',
        desc: 'Busca rápida que localiza instantaneamente qualquer paciente ou número de série em todos os salões, turnos e boxes da clínica.'
      },
      {
        title: 'Remanejamento & Alocação Dinâmica de Vagas',
        desc: 'Ferramenta ágil para alocar novos pacientes em vagas livres ou realizar troca/remanejamento de leito com validação de conflito.'
      },
      {
        title: 'Mural de Comunicados Clínicos',
        desc: 'Feed ágil categorizado com 14 tipos clínicos (Internação, Alta, Intercorrência, Evento Adverso, Hemotransfusão, Infecção, Acesso Vascular, Precaução de Contato, Transferência, Nutrição, Psicologia, Serviço Social, Óbito e Geral) com 3 modos de visualização (Compacta, Normal e Grade).'
      },
      {
        title: 'Impressão A4 da Escala Operacional',
        desc: 'Geração de espelho formatado em A4 da escala diária/semanal para afixação nas pranchetas dos postos de enfermagem dos salões.'
      },
      {
        title: 'Isolamento de Filiais (Betim / MG vs Taguatinga / DF)',
        desc: 'Escalas de hemodiálise, pontos de diálise e comunicados do mural 100% segregados pela filial ativa, com visualização zerada para novas unidades em fase de implantação.'
      }
    ],
    tutorial: [
      {
        title: 'Como Navegar no Mapa de Salões da Hemodiálise',
        steps: [
          'No topo do módulo NexaASSIST, clique na aba "Escala".',
          'Selecione o Salão desejado (Salão 01, Salão 02 ou Salão 03).',
          'Selecione o Turno (1º Turno, 2º Turno ou 3º Turno).',
          'Alterne entre as cadências "Segunda • Quarta • Sexta" e "Terça • Quinta • Sábado".',
          'O grid exibirá os boxes e as máquinas com seus respectivos pacientes e status.'
        ]
      },
      {
        title: 'Como Localizar um Paciente em Qualquer Salão',
        steps: [
          'Clique no botão "Localizar" na barra superior da Escala.',
          'Digite o nome do paciente ou o número de série da máquina.',
          'Clique no resultado para abrir diretamente o salão, turno e ponto correspondentes.'
        ]
      },
      {
        title: 'Como Remanejar um Paciente ou Ocupar Vaga Livre',
        steps: [
          'Localize o ponto desejado no mapa de leitos.',
          'Em vagas livres, clique em "+ Alocar" e selecione o paciente cadastrado.',
          'Em pontos já ocupados, clique em "Remanejar" para trocar de leito ou liberar a vaga.',
          'Confirme a operação para atualizar a escala imediatamente.'
        ]
      },
      {
        title: 'Como Publicar um Comunicado a Partir do Mapa de Leitos',
        steps: [
          'No card do paciente na escala, clique no botão "Comunicado".',
          'O modal abrirá já pré-preenchido com o nome do paciente, salão e turno.',
          'Selecione a categoria clínica, digite o aviso e clique em "Publicar".'
        ]
      }
    ],
    duvidas: [
      {
        pergunta: 'Por que ao trocar para Taguatinga a escala de diálise aparece vazia/zerada?',
        resposta: 'Porque a filial Taguatinga / DF é uma nova unidade sem pacientes legados de Betim. Os novos pacientes e leitos de Taguatinga passarão a aparecer conforme forem admitidos no sistema.'
      },
      {
        pergunta: 'Como saber o status de manutenção de uma máquina de hemodiálise?',
        resposta: 'Ao lado do número de série no cabeçalho de cada ponto, há uma badge indicando se o equipamento está "Operacional" ou em "Preventiva/Corretiva". Clicando no número de série, abre-se a ficha técnica completa da máquina.'
      },
      {
        pergunta: 'O que indicam as cores das badges de acesso vascular?',
        resposta: 'Verde (🟢) representa FAV (Fístula Arteriovenosa com calibre de agulha 15, 16 ou 17), Amarelo (🟡) representa CDL (Cateter Duplo Lúmen), Roxo (🟣) representa Permcath e Vermelho (🔴) indica protocolo de Uso Único / Isolamento (HIV/Hepatite).'
      },
      {
        pergunta: 'As alterações na escala são salvas em tempo real?',
        resposta: 'Sim. Qualquer remanejamento, alocação de vaga ou troca é sincronizado instantaneamente na base de dados para toda a equipe assistencial.'
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
    subtitle: 'NexaSERVICE — Ativos, T.I. & SLA',
    color: '#0891b2',
    recursos: [
      {
        title: 'Etiqueta Patrimonial & QR Code Inteligente',
        desc: 'Geração de QR Code em alta definição (220px) para cada equipamento clínico ou de infraestrutura, permitindo abertura instantânea de chamados via smartphone por qualquer colaborador.'
      },
      {
        title: 'Portal Público de Chamados por Escaneamento',
        desc: 'Página mobile-first acessível sem login no salão. Ao apontar a câmera do celular para a etiqueta da máquina, o colaborador visualiza os dados do ativo e abre o chamado em segundos.'
      },
      {
        title: 'Central de Chamados de T.I. (Helpdesk)',
        desc: 'Abertura, acompanhamento e triagem de solicitações técnicas para computadores, sistemas, conectividade de rede, impressoras e acessos.'
      },
      {
        title: 'Painel Executivo de SLA em Tempo Real',
        desc: 'Controle dinâmico de prazos limites por prioridade (Crítico 2h, Alta 8h, Média 24h e Baixa 48h) com semáforo visual de conformidade e contagem regressiva.'
      },
      {
        title: 'Prontuário de Ativos & Equipamentos Biomédicos',
        desc: 'Cadastro completo de máquinas de hemodiálise, osmose reversa, geradores e bombas, com marca, modelo, série, setor físico e status operacional em tempo real.'
      },
      {
        title: 'Cronograma Preventivo Automatizado',
        desc: 'Monitoramento contínuo de vencimentos de preventivas e calibrações por periodicidade em dias, com alertas visuais de atraso e agendamento de OS em 1 clique.'
      },
      {
        title: 'Histórico & Interações na Linha do Tempo',
        desc: 'Registro cronológico rastreável de todas as mensagens, diagnósticos técnicos, trocas de status, custos de mão de obra e réplicas entre solicitante e técnico.'
      },
      {
        title: 'Impressão de Etiquetas & Prontuário Técnico em PDF',
        desc: 'Emissão de etiquetas patrimoniais prontas para impressão física e espelho técnico formatado em A4 com laudos e campos de assinatura.'
      }
    ],
    tutorial: [
      {
        title: 'Como Imprimir a Etiqueta com QR Code para o Equipamento',
        steps: [
          'Acesse a aba "Equipamentos" no módulo de Manutenção.',
          'Localize a máquina desejada (ex: Máquina de Hemodiálise Fresenius 4008S).',
          'Clique no botão "QR" no card ou na linha do equipamento.',
          'No modal que se abrir, clique em "Imprimir Etiqueta" para enviar à impressora térmica ou padrão.',
          'Cole a etiqueta impressa em local visível na carcaça do equipamento.'
        ]
      },
      {
        title: 'Como Abrir um Chamado Escaneando o QR Code pelo Smartphone',
        steps: [
          'Aponte a câmera do celular para o QR Code colado na máquina.',
          'Toque na notificação do navegador para abrir o Portal do NexaCLINIC (não exige login).',
          'Confira os dados do ativo (Patrimônio, Modelo e Setor) exibidos na tela.',
          'Preencha seu Nome, Contato (WhatsApp/E-mail), Prioridade e Descreva o defeito apresentado.',
          'Toque em "Enviar Chamado". O protocolo será gerado na hora e a O.S. entrará imediatamente na lista da manutenção.'
        ]
      },
      {
        title: 'Como Abrir um Chamado de T.I. no Painel',
        steps: [
          'Acesse o módulo "Manutenção" e clique na aba "Chamados T.I." (ou "Meus Chamados T.I.").',
          'Clique no botão "+ Novo Chamado".',
          'Selecione a Categoria (ex: Hardware, Rede, Impressoras), a Subcategoria e o Setor onde o problema está ocorrendo.',
          'Escolha o nível de Prioridade (verifique a descrição do prazo SLA correspondente).',
          'Informe o Título e descreva detalhadamente a falha ou mensagem de erro observada.',
          'Clique em "Abrir Chamado". O sistema gerará o código sequencial e iniciará a contagem do SLA.'
        ]
      },
      {
        title: 'Como Executar o Atendimento Técnico e Lançar Laudo',
        steps: [
          'Na aba "Ordens de Serviço" ou "Chamados T.I.", localize o chamado e clique em "Atender".',
          'Altere o Status para "Em Diagnóstico" ou "Em Execução" e preencha o Técnico Responsável.',
          'Caso haja custos, informe o valor de mão de obra e peças.',
          'Insira o Laudo Técnico detalhando a intervenção realizada.',
          'Marque o envio de notificação por e-mail para manter o solicitante atualizado e altere o status para "Concluída".'
        ]
      },
      {
        title: 'Como Monitorar o Cronograma Preventivo',
        steps: [
          'Acesse a aba "Cronograma" no painel de Manutenção.',
          'Analise os equipamentos com status vermelho "ATRASADA!" para priorizar a revisão.',
          'Clique no botão "Agendar" na linha do equipamento para abrir a Ordem de Serviço Preventiva pré-preenchida.'
        ]
      }
    ],
    duvidas: [
      {
        pergunta: 'É necessário fazer login para abrir um chamado pelo QR Code?',
        resposta: 'Não. O portal de chamado por QR Code foi projetado com acesso público e responsivo para permitir que médicos, enfermeiros e técnicos de enfermagem relatem falhas instantaneamente pelo celular sem barreiras de autenticação.'
      },
      {
        pergunta: 'O chamado aberto pelo QR Code atualiza o status da máquina no salão?',
        resposta: 'Sim. Se o chamado for aberto com prioridade Alta ou Crítica, o sistema altera de imediato a situação do equipamento para "Em Manutenção", sinalizando visualmente a toda a clínica que o ativo está indisponível.'
      },
      {
        pergunta: 'Como testar a página de chamado sem um smartphone em mãos?',
        resposta: 'Basta abrir a Tag QR no módulo de Equipamentos e clicar no botão "Testar Chamado" ou "Copiar Link". A página pública do ativo se abrirá em uma nova aba para conferência.'
      },
      {
        pergunta: 'Quais são as metas de tempo de cada nível de SLA?',
        resposta: 'Crítico: meta de 2 horas (parada de salão/servidor/PEP). Alta: meta de 8 horas (impacto setorial ou impressoras de prescrição). Média: meta de 24 horas (solicitações e problemas rotineiros). Baixa: meta de 48 horas (dúvidas, melhorias e novos acessos).'
      },
      {
        pergunta: 'Como gerar o prontuário técnico completo de uma máquina em PDF?',
        resposta: 'Na aba "Equipamentos", clique no botão "Histórico" da máquina e, em seguida, clique em "Gerar PDF" no topo do modal para imprimir o prontuário rastreável com todas as manutenções já executadas.'
      }
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
  },

  clinical: {
    id: 'clinical',
    name: 'Módulo Clínico & Assistencial',
    subtitle: 'NexaCLINIC — Prontuário Renal & Prescrições',
    color: '#8b5cf6',
    recursos: [
      {
        title: 'Cockpit 360 do Paciente Renal',
        desc: 'Visão unificada com identificação do paciente, tipo e sítio do acesso vascular, peso seco alvo, alertas de segurança (alergias em destaque e sorologias) e atalhos rápidos.'
      },
      {
        title: 'Prescrição Dialítica e Medicamentosa',
        desc: 'Prescrição completa de parâmetros de máquina (dialisador, fluxo, tempo, heparina, bicarbonato) e fármacos intradialíticos (Eritropoetina, Noripurum) e contínuos com envio para farmácia e salão.'
      },
      {
        title: 'Painel Laboratorial com Semáforo SBN',
        desc: 'Histórico mensal de biomarcadores (Hemoglobina, Ferritina, Saturação de Transferrina, Fósforo, Cálcio, PTH, Potássio, Kt/V e URR) com semáforo de metas da Sociedade Brasileira de Nefrologia.'
      },
      {
        title: 'Acompanhamento Horário de Sessões e Alerta Hemodinâmico',
        desc: 'Registro horário de PA, FC, PV, PA art, fluxo real e taxa de ultrafiltração, com cálculo de perda ponderal e alerta de ultrafiltração excessiva (> 13 mL/kg/h).'
      },
      {
        title: 'Central de Laudos e Regulação APAC (SUS)',
        desc: 'Controle de validade de autorizações de diálise SUS com alerta preventivo de 30 dias e gerador oficial de Laudo de Solicitação (LME) para impressão e assinatura médica.'
      },
      {
        title: 'Evoluções Multiprofissionais Estruturadas',
        desc: 'Notas clínicas separadas por especialidade (Medicina, Enfermagem, Nutrição, Psicologia e Serviço Social) com templates de roteiro rápido em 1 clique.'
      },
      {
        title: 'Copiloto Clínico IA & Calculadoras Nefrológicas',
        desc: 'Síntese instantânea do histórico do paciente gerada por Inteligência Artificial e calculadoras integradas de Kt/V Daugirdas, Ganzoni (déficit de ferro), Recirculação de Acesso e Taxa de UF.'
      },
      {
        title: 'Exportação de Sumário e Ficha de Trânsito',
        desc: 'Emissão formatada em PDF padrão CFM/SBN para transferências hospitalares e pacientes dialisando em trânsito.'
      }
    ],
    tutorial: [
      {
        title: 'Como Prescrever Medicamentos Intradialíticos',
        steps: [
          'Selecione o paciente na lista lateral e clique na aba "Medicamentos".',
          'Clique em "+ Prescrever" ou escolha uma sugestão rápida (ex: Alfaepoetina 4.000 UI ou Noripurum 100mg).',
          'Defina a via de administração, dosagem e frequência por sessão.',
          'Clique em "Salvar Prescrição". O medicamento ficará disponível para requisição direta no salão (NexaREQ).'
        ]
      },
      {
        title: 'Como Registrar o Acompanhamento de Sessão de Hemodiálise',
        steps: [
          'Acesse a aba "Sessões" e selecione o paciente na grade do turno do dia.',
          'Informe a máquina utilizada e os pesos pré e pós-diálise.',
          'Preencha as medições horárias de pressão arterial, pressão venosa e ultrafiltração.',
          'Marque intercorrências clínicas se houver (ex: hipotensão, câimbras) e clique em "Gravar Acompanhamento".'
        ]
      },
      {
        title: 'Como Emitir o Laudo de APAC para Renovação SUS',
        steps: [
          'Acesse a aba "Laudos" do paciente.',
          'Verifique o prazo de validade e o alerta de renovação.',
          'Clique em "Imprimir" para gerar o formulário oficial LME/APAC já preenchido com dados clínicos, CID-10 e exames para assinatura do médico nefrologista.'
        ]
      },
      {
        title: 'Como Utilizar o Copiloto Clínico IA',
        steps: [
          'No cabeçalho do cockpit do paciente, clique no botão "Copiloto" (com ícone de brilho).',
          'A IA analisará os últimos exames, medicamentos, prescrição e intercorrências dos últimos 30 dias.',
          'Revise as recomendações nefrológicas e clique em "Inserir como Evolução" para salvar diretamente no prontuário.'
        ]
      }
    ],
    duvidas: [
      {
        pergunta: 'Como funciona o cálculo de adequação dialítica (Kt/V)?',
        resposta: 'O sistema utiliza a fórmula de Daugirdas de 2ª geração single-pool (-ln(R - 0.008*t) + (4 - 3.5*R) * (UF/W)), considerando as dosagens de ureia pré e pós, tempo e ultrafiltração. Resultados ≥ 1.20 são classificados como adequados.'
      },
      {
        pergunta: 'O que significa o alerta de taxa de ultrafiltração (> 13 mL/kg/h)?',
        resposta: 'Diretrizes internacionais de segurança em diálise indicam que taxas de remoção hídrica superiores a 13 mL por kg por hora aumentam significativamente o risco de hipotensão intradialítica e atordoamento miocárdico. O sistema emite um alerta preventivo para ajuste do tempo de sessão.'
      },
      {
        pergunta: 'Como emitir a ficha de trânsito quando o paciente viajar?',
        resposta: 'Basta clicar no botão "Exportar" no cockpit do paciente. O sistema compila automaticamente o sumário com dados de acesso vascular, prescrição de diálise, medicamentos ativos, sorologias recentes e últimas evoluções em formato padrão para impressão.'
      }
    ]
  },
  medical: {
    id: 'medical',
    name: 'Gestão Médica & Escalas',
    subtitle: 'NexaMED — Corpo Clínico & Produção',
    color: '#6366f1',
    recursos: [
      {
        title: 'Escala Mensal de Plantões',
        desc: 'Distribuição dos médicos nefrologistas nos Salões 1, 2, 3 e Diálise Peritoneal (DP) nos 3 turnos diários com Trava Anti-Buraco para evitar turnos descobertos.'
      },
      {
        title: 'Portal do Médico ("Meus Plantões")',
        desc: 'Visão individual onde o profissional confere sua agenda assistencial sem valores financeiros e solicita trocas com colegas.'
      },
      {
        title: 'Matriz Semanal por Salão e Turno (Modo Planilha)',
        desc: 'Visualização completa em grade das 5 semanas do mês com divisão por Salões 1, 2, 3 e DP em cada um dos 3 turnos diários.'
      },
      {
        title: 'Mapa de Cores de Status (Trocas e Vagas)',
        desc: 'Identificação visual imediata: Verde Claro para trocas/substituições, Vermelho Alerta para vagas/buracos de escala e Branco para plantões regulares.'
      },
      {
        title: 'Impressão A4 Paisagem (Mural dos Salões)',
        desc: 'Layout diagramado para impressão em folha A4 Paisagem com cabeçalho oficial da clínica, legenda e campo de assinatura da Coordenação Médica.'
      },
      {
        title: 'Bolsa de Trocas com E-mail',
        desc: 'Fluxo em 3 etapas (solicitação, aceite do colega e homologação da coordenação) com disparo automático de notificações por e-mail em cada fase.'
      },
      {
        title: 'Lançamento de Procedimentos',
        desc: 'Registro de procedimentos nefrológicos executados (CDL, Permcath, biópsias, mapeamentos de FAV) vinculando paciente e data.'
      },
      {
        title: 'Integração com Agenda (NexaCAL)',
        desc: 'Captura automática de atendimentos e consultas concluídas na agenda para a apuração da produção médica.'
      },
      {
        title: 'Ronda Presencial na Recepção',
        desc: 'Auditoria diária de presença física nos salões com 1 toque no tablet/computador da recepção (Presente, Atraso, Substituição, Ausente).'
      },
      {
        title: 'Fechamento de Honorários & Repasse Automático',
        desc: 'Homologação da produção pela coordenação com geração automática do título no Contas a Pagar do NexaFINANCE sem expor dados financeiros sigilosos.'
      },
      {
        title: 'Extrato / Holerite Médico em PDF',
        desc: 'Emissão em 1 clique do demonstrativo detalhado de honorários discriminando plantões, consultas e procedimentos para assinatura.'
      },
      {
        title: 'Cadastro Completo de Médicos & Integração T.I.',
        desc: 'Fluxo centralizado onde o T.I. cria o login com perfil RBAC "Médico" e a Coordenação Médica completa os dados cadastrais (CPF, Cartão SUS, Celular, CRM/UF, Especialidade, Vínculo, Chave PIX e Dados Bancários) na aba Honorários.'
      }
    ],
    tutorial: [
      {
        title: 'Como Cadastrar e Completar a Ficha do Médico',
        steps: [
          'O Administrador de T.I. cria o usuário no módulo NexaCONFIG com o perfil "Médico / Corpo Clínico".',
          'A Coordenação Médica acessa o módulo NexaMED e entra na aba "Honorários".',
          'Na tabela "Profissionais", localiza o médico recém-criado (sinalizado com a etiqueta amarela "Completar") e clica no botão "Completar" ou "Editar".',
          'Preenche o CPF, Cartão SUS (CNS), Celular, CRM/UF, Especialidade, Vínculo Contratual (PJ, CLT, Autônomo, Cooperado), Chave PIX e Dados Bancários.',
          'Clica em "Salvar". Os dados são sincronizados em nuvem e integrados aos módulos de Escala, Agenda e Fechamento Financeiro.'
        ]
      },
      {
        title: 'Como Montar e Ajustar a Escala Mensal de Plantões',
        steps: [
          'Acesse a aba "Escala" e selecione o mês de competência no topo da página.',
          'Utilize os filtros por Salão (Salão 1, 2, 3 ou DP) e Turno para verificar a cobertura.',
          'Clique em "+ Escalar" para adicionar um plantão ou no ícone de lápis para alterar o médico responsável.',
          'Verifique a faixa de alerta: se houver turnos sem médico, a Trava Anti-Buraco sinalizará em vermelho.'
        ]
      },
      {
        title: 'Como Solicitar e Homologar uma Troca de Plantão',
        steps: [
          'No Portal do Médico (aba "Plantões"), localize o plantão que deseja transferir e clique em "Trocar".',
          'Selecione o médico substituto, descreva o motivo e confirme o envio. O sistema disparará um e-mail de notificação ao colega.',
          'O médico substituto acessa a aba "Trocas" e clica em "Aceitar".',
          'A Coordenação Médica revisa na aba "Trocas" e clica em "Homologar". A escala é atualizada e um e-mail de confirmação é enviado a ambos.'
        ]
      },
      {
        title: 'Como Lançar um Procedimento Executado',
        steps: [
          'Acesse a aba "Plantões" (ou "Procedimentos") e clique no botão "+ Lançar Procedimento".',
          'Selecione o paciente atendido, a data do procedimento e o tipo de procedimento (ex: Cateter CDL, Implante de Permcath).',
          'Adicione observações técnicas se necessário e clique em "Gravar Procedimento".'
        ]
      },
      {
        title: 'Como a Recepção Realiza a Ronda Médica Diária',
        steps: [
          'A equipe da recepção acessa o módulo Recepção e entra na aba "Ronda Médica".',
          'Na lista de salões e turnos de hoje, localiza o médico escalado.',
          'Clica no botão correspondente: "✓ Presente", "⚠ Atraso", "🔄 Troca" ou "✕ Falta".',
          'O horário é gravado automaticamente e serve como base para a homologação do pagamento.'
        ]
      },
      {
        title: 'Como Homologar a Produção Médica e Enviar ao Financeiro',
        steps: [
          'A Coordenação Médica acessa a aba "Produção" do NexaMED.',
          'Confere o espelho de cada médico (soma de plantões auditados + consultas concluídas na agenda + procedimentos).',
          'Clica no botão "Homologar". O sistema cria instantaneamente a duplicata a pagar no Contas a Pagar do NexaFINANCE.',
          'Clique em "Extrato" para gerar e imprimir o holerite detalhado do médico em PDF.'
        ]
      }
    ],
    duvidas: [
      {
        pergunta: 'Por que o cadastro médico é feito em 2 etapas (T.I. e NexaMED)?',
        resposta: 'Para garantir máxima segurança: a criação da conta e concessão do perfil RBAC "Médico" fica centralizada no T.I., enquanto a complementação de dados sensíveis da prática médica (CRM, SUS, CPF, PIX e banco) fica sob gestão da Coordenação Médica.'
      },
      {
        pergunta: 'A Coordenação Médica precisa ter acesso ao Módulo Financeiro para pagar os médicos?',
        resposta: 'Não! O NexaMED foi desenhado com total segregação de acessos (RBAC). A coordenação audita e clica em "Homologar" diretamente no NexaMED. Em segundo plano, o sistema lança automaticamente a conta a pagar no NexaFINANCE para o setor financeiro quitar.'
      },
      {
        pergunta: 'Como as consultas da agenda médica entram na produção do profissional?',
        resposta: 'Quando o médico atende um paciente no consultório e marca o agendamento como "Finalizado" ou "Concluído" no módulo Agenda (NexaCAL), a consulta é contabilizada instantaneamente na produção mensal daquele médico.'
      },
      {
        pergunta: 'O que acontece se um médico faltar ao plantão e não avisar?',
        resposta: 'A recepção marca "Ausente" na Ronda Médica. Esse plantão não é contabilizado na apuração mensal daquele médico no momento do fechamento de produção.'
      }
    ]
  },
  calendar: {
    id: 'calendar',
    name: 'Agenda & Consultórios',
    subtitle: 'NexaCAL — Gestão de Agendamentos & Cotas',
    color: '#0891b2',
    recursos: [
      {
        title: 'Central de 15 Relatórios Executivos & Operacionais',
        desc: 'Relatórios completos de extrato geral, absenteísmo (no-show), produtividade por médico, ocupação de consultórios, confirmações WhatsApp, cotas anuais, tempo de espera, busca ativa de pacientes crônicos e auditoria de alterações.'
      },
      {
        title: 'Exportação Profissional em PDF & Excel (XLSX)',
        desc: 'Emissão instantânea de relatórios com cabeçalho institucional timbrado em PDF (A4) e planilhas dinâmicas em Excel prontas para auditorias e BI.'
      },
      {
        title: 'Configuração Anual de Grade e Cotas',
        desc: 'Parametrização de cotas anuais e mensais de primeiras consultas, retornos e procedimentos por médico, com botão de replicação para os 12 meses do ano em 1 clique e painel de capacidade anual consolidada.'
      },
      {
        title: 'Pesquisa Global Multianual',
        desc: 'Busca universal e profunda em todo o banco de agendamentos em todos os dias, meses e anos por nome, CPF, telefone, médico, sala ou data, com botão de navegação direta "Ver Dia".'
      },
      {
        title: 'Gestão Multissalas e 4 Visualizações',
        desc: 'Alternância instantânea entre modos Horários (Timeline do dia), Salas (Visão por consultório), Semanal e Mensal.'
      },
      {
        title: 'Bloqueio de Dias e Ausências',
        desc: 'Registro de congressos, férias e solicitações com detecção em tempo real de pacientes afetados para remanejamento preventivo.'
      },
      {
        title: 'Feriados Nacionais Automáticos',
        desc: 'Identificação e sinalização de feriados nacionais do Brasil no calendário com avisos preventivos em agendamentos.'
      },
      {
        title: 'Notificações via WhatsApp',
        desc: 'Envio de lembretes e confirmações com 1 clique direto para o WhatsApp do paciente com informações de local e horário.'
      }
    ],
    tutorial: [
      {
        title: 'Como Acessar e Exportar Relatórios da Agenda',
        steps: [
          'No topo do módulo de Agenda, clique no botão "Relatórios".',
          'Selecione na barra lateral o relatório desejado (ex: "Extrato Geral", "Produtividade por Médico", "Taxa de Faltas No-Show" ou "Busca Ativa").',
          'Defina os filtros de Período (Início e Fim), Médico, Consultório/Sala e Status.',
          'Clique em "Exportar PDF" para gerar o documento timbrado A4 ou "Exportar Excel" para obter a planilha XLSX.'
        ]
      },
      {
        title: 'Como Configurar a Grade Anual do Médico',
        steps: [
          'No cabeçalho da Agenda, clique no botão "Grade".',
          'Selecione o profissional de saúde na barra lateral.',
          'Utilize o seletor de ano para definir o exercício desejado (ex: 2026 ou 2027).',
          'Ajuste as cotas mensais de Primeira Consulta, Retorno e Procedimentos.',
          'Clique em "Replicar para o Ano Inteiro" para aplicar os valores aos 12 meses simultaneamente.',
          'Defina os dias e horários de atendimento da semana e clique em "Salvar".'
        ]
      },
      {
        title: 'Como Realizar Busca Global em Todos os Anos',
        steps: [
          'No campo de pesquisa na barra superior, digite qualquer termo: nome do paciente, CPF, telefone, médico ou data (ex: "24/08/2026", "2026" ou "Agosto").',
          'O sistema abrirá a visualização de Busca Global listando todos os agendamentos encontrados em qualquer data.',
          'Clique no botão "Ver Dia" para ir diretamente para a visualização detalhada da data encontrada.'
        ]
      },
      {
        title: 'Como Bloquear Dias ou Períodos para Ausências',
        steps: [
          'Clique no botão "Bloquear" no topo da Agenda.',
          'Selecione o Médico (ou Todos os Médicos), o Período e o Motivo (Férias, Congresso, etc.).',
          'Confira os agendamentos conflitantes no quadro de aviso e clique em "Bloquear".'
        ]
      }
    ],
    duvidas: [
      {
        pergunta: 'Quais relatórios estão disponíveis na Agenda?',
        resposta: 'São 15 relatórios: 1. Extrato Geral, 2. Produtividade por Médico, 3. Taxa de Faltas (No-Show), 4. Confirmações WhatsApp, 5. Ocupação de Consultórios, 6. Consultas por Modalidade, 7. Encaixes & Urgências, 8. Cancelamentos, 9. Cotas Anuais & Metas, 10. Bloqueios & Afastamentos, 11. Tempo de Espera & Pontualidade, 12. Distribuição por Convênio, 13. Busca Ativa de Crônicos Sem Retorno, 14. Escala em Feriados e 15. Auditoria de Modificações.'
      },
      {
        pergunta: 'Como a busca global localiza consultas de anos anteriores ou futuros?',
        resposta: 'A barra de pesquisa faz uma varredura completa em toda a base de dados de agendamentos em tempo real, sem restrição de data ou mês atual.'
      },
      {
        pergunta: 'O que acontece ao atingir o limite de cotas do mês configurado?',
        resposta: 'O sistema emite um alerta visual ao atendente no momento de marcar uma nova primeira consulta ou retorno, permitindo remanejar ou registrar como encaixe justificado.'
      },
      {
        pergunta: 'Como o médico visualiza as consultas finalizadas na sua produção?',
        resposta: 'Todas as consultas concluídas e finalizadas no módulo Agenda entram automaticamente na apuração de honorários do módulo NexaMED.'
      }
    ]
  },
  config: {
    id: 'config',
    name: 'Configurações & T.I.',
    subtitle: 'NexaCONFIG — Administração & Segurança',
    color: '#8b5cf6',
    recursos: [
      {
        title: 'Servidor de E-mail Universal (SMTP)',
        desc: 'Centralização de remetente e conexão SMTP com suporte a Google Workspace, Microsoft 365, Amazon SES, Resend e servidores dedicados para disparos de todos os módulos.'
      },
      {
        title: 'Disparo de E-mail de Teste em Tempo Real',
        desc: 'Validação instantânea da conexão SMTP com feedback de resposta, diagnóstico e registro em auditoria.'
      },
      {
        title: 'Controle de Gatilhos por Módulo',
        desc: 'Permissões granulares para definir quais módulos (NexaMED, NexaSERVICE, NexaHR, NexaPROCURE, NexaCAL, NexaASSIST) podem disparar notificações eletrônicas.'
      },
      {
        title: 'Histórico de Disparos de E-mail',
        desc: 'Log detalhado de todos os e-mails emitidos com data/hora, destinatário, assunto e status.'
      },
      {
        title: 'Personalização & Branding (SaaS)',
        desc: 'Customização de nome fantasia da clínica, CNPJ, logomarca institucional e cor primária do sistema.'
      },
      {
        title: 'Matriz de Perfis & Permissões RBAC Completa',
        desc: 'Controle granular de acessos (Bloqueado, Leitura, Escrita) por perfil em todos os módulos, incluindo Feed Assistencial (NexaASSIST) e Gestão Médica (NexaMED).'
      },
      {
        title: 'Gestão Ágil de Usuários & Vínculo com RH',
        desc: 'Criação e edição de acessos em 1 clique único atômico, ordenação alfabética de funcionários físicos para vínculo, e geração de senhas temporárias.'
      },
      {
        title: 'Backups & Logs de Auditoria',
        desc: 'Exportação completa do banco de dados em formato JSON e registro de logs de segurança com rastreabilidade de operadores.'
      }
    ],
    tutorial: [
      {
        title: 'Como Liberar ou Bloquear o Feed Assistencial e Médico na Matriz RBAC',
        steps: [
          'Acesse o módulo "Configurações & TI" e clique na aba "Perfis de Acesso".',
          'Localize a linha correspondente ao perfil de usuário desejado (ex: Enfermagem, Recepção, Operador).',
          'Na coluna "Assistencial" ou "Médico", selecione o nível de permissão: "Bloqueado", "Leitura" ou "Escrita".',
          'As permissões são atualizadas em tempo real no banco cloud e aplicadas instantaneamente no menu principal de módulos.'
        ]
      },
      {
        title: 'Como Criar Usuário com Vínculo a Funcionário',
        steps: [
          'Acesse a aba "Usuários" no módulo "Configurações & TI" e clique no botão "+ Criar Conta de Usuário".',
          'Informe o Nome Completo e o E-mail de Login do colaborador.',
          'No campo "Funcionário", selecione o colaborador na lista ordenada alfabeticamente (A-Z).',
          'Selecione o Perfil de Permissão e a Filial de Atuação.',
          'Clique em "Gravar Acesso". O registro é salvo imediatamente em 1 clique e o modal fecha com confirmação na tela.'
        ]
      },
      {
        title: 'Como Configurar o Servidor de E-mail do Sistema',
        steps: [
          'Acesse o módulo "Configurações & TI" e clique na aba "E-mail".',
          'Selecione o provedor pré-configurado desejado (Google/Gmail, Microsoft 365, Amazon SES, Resend ou SMTP Personalizado).',
          'Preencha o Nome do Remetente (ex: "NexaCLINIC — Notificações") e o E-mail de Envio.',
          'Informe o Usuário e a Senha de Aplicativo (ou API Key) do seu provedor de e-mail.',
          'Personalize a assinatura padrão que aparecerá no rodapé das notificações.',
          'Clique no botão "Salvar" para gravar os parâmetros.'
        ]
      },
      {
        title: 'Como Validar e Testar o Envio de E-mails',
        steps: [
          'Na aba "E-mail", localize o card "Testar Disparo" no lado direito.',
          'Digite seu endereço de e-mail no campo "Destinatário" e clique em "Testar".',
          'Aguarde a confirmação na tela: se o servidor estiver correto, uma caixa verde sinalizará o sucesso do disparo.',
          'Consulte a tabela "Histórico de Disparos" no rodapé para visualizar o registro do envio.'
        ]
      },
      {
        title: 'Como Habilitar ou Desabilitar Disparos por Módulo',
        steps: [
          'Na aba "E-mail", localize o quadro "Módulos Conectados".',
          'Ative ou desative os switches de acordo com a política da clínica (ex: desativar notificações do NexaCAL e manter ativas as do NexaMED e NexaSERVICE).',
          'Clique em "Salvar" para aplicar a regra imediatamente.'
        ]
      }
    ],
    duvidas: [
      {
        pergunta: 'Como faço para que determinado perfil veja o Feed Assistencial?',
        resposta: 'Na aba "Perfis de Acesso", altere a coluna "Assistencial" do perfil desejado para "Leitura" ou "Escrita". Ao logar com esse perfil, o módulo NexaASSIST aparecerá disponível na tela inicial.'
      },
      {
        pergunta: 'Como obtenho a senha para usar o Gmail ou Google Workspace?',
        resposta: 'O Google exige o uso de uma "Senha de Aplicativo" de 16 dígitos gerada em Gerenciar Conta Google > Segurança > Verificação em duas etapas > Senhas de app. Nunca utilize sua senha pessoal de login comum.'
      },
      {
        pergunta: 'Onde vejo os e-mails que os módulos dispararam?',
        resposta: 'No rodapé da aba "E-mail" do módulo de T.I., na tabela "Histórico de Disparos". Ela lista em tempo real todos os e-mails emitidos com o módulo de origem, destinatário e status.'
      },
      {
        pergunta: 'Se eu desativar o servidor de e-mail, os módulos param de funcionar?',
        resposta: 'Não. Os módulos continuam operando normalmente em tela. Apenas o disparo de mensagens para caixas postais externas é pausado com segurança.'
      }
    ]
  },
  purchasing: {
    id: 'purchasing',
    name: 'Módulo de Compras',
    subtitle: 'NexaPROCURE — Gestão de Suprimentos & E-Procurement',
    color: '#0891b2',
    recursos: [
      {
        title: 'Pedidos Multi-Itens',
        desc: 'Criação de pedidos consolidados contendo múltiplos insumos em uma única solicitação (#SOL-YYYY-XXX), mesclando produtos do estoque e novos itens livres.'
      },
      {
        title: '3 Modos de Visualização da Esteira',
        desc: 'Alternância ágil entre modo Compacto (tabela densa, padrão), Normal (cards médios) e Estendido (cards completos com esteira de 5 fases e tabela interna de itens).'
      },
      {
        title: 'Gestão & Autonomia do Solicitante',
        desc: 'Possibilidade de editar ou excluir solicitações enquanto estiverem em análise inicial (Aguardando Gestor) ou em caso de recusa.'
      },
      {
        title: 'Cotações Web com Fornecedores',
        desc: 'Criação de rodadas de cotação digital com geração de links exclusivos e tokens criptografados para preenchimento direto pelos fornecedores via celular ou computador.'
      },
      {
        title: 'Portal B2B do Fornecedor',
        desc: 'Ambiente público sem atrito para distribuidores digitarem preços unitários, marcas ofertadas, tipo de frete (CIF/FOB), prazos de entrega e anexarem propostas em PDF.'
      },
      {
        title: 'Mapa Comparativo Inteligente & Saving',
        desc: 'Matriz lado a lado com destaque visual do menor preço por insumo, comparativo histórico com a última compra, cálculo de Saving (Economia em R$ e %) e condições comerciais.'
      },
      {
        title: 'Emissão de Ordem de Compra Oficial (PO)',
        desc: 'Geração instantânea da Ordem de Compra (PO) timbrada e padronizada em PDF/A4 para impressão ou envio por WhatsApp com 1 clique ao fornecedor vencedor.'
      },
      {
        title: 'Integração Automática com o Financeiro',
        desc: 'Lançamento automático de provisão financeira no Contas a Pagar ao homologar cotações, com data de vencimento baseada no prazo comercial acordado e rastreabilidade da OC.'
      },
      {
        title: 'Curva ABC & Histórico de Preços',
        desc: 'Classificação automática de insumos em Classe A (80% do valor), Classe B (15%) e Classe C (5%) com modal de auditoria de preços e oscilação de inflação por insumo.'
      },
      {
        title: 'Reposição Inteligente dos 4 Saldos',
        desc: 'Cálculo dinâmico de saldo Físico, Reservado, Disponível e em Trânsito para sugestão automática de compras baseada no estoque mínimo.'
      },
      {
        title: 'Controle de Perfis & Alçadas (RBAC)',
        desc: 'Segregação inteligente de visualização: Comprador/Admin visualiza todas as rotinas; Gestor/Diretor visualiza solicitações e aprovações; Colaboradores/Solicitantes operam a esteira de pedidos.'
      }
    ],
    tutorial: [
      {
        title: 'Como Criar um Pedido Multi-Itens',
        steps: [
          'Acesse o NexaPROCURE e clique no botão "+ Nova Solicitação".',
          'Selecione o Setor demandante e informe a Prioridade (Normal ou Urgente) e a Justificativa.',
          'No quadro de insumos, escolha entre "Estoque" ou "Novo", informe a Quantidade, Unidade e Especificação e clique em "+ Adicionar".',
          'Repita o passo anterior para quantos insumos desejar incluir no mesmo pedido.',
          'Confira a tabela de itens e clique em "Enviar Solicitação".'
        ]
      },
      {
        title: 'Como Alternar os Modos de Visualização e Editar',
        steps: [
          'No topo da Esteira de Solicitações, utilize os botões "Compacta", "Normal" e "Estendida" para escolher a densidade de visualização.',
          'Para inspecionar todos os itens e a linha do tempo, clique no ícone de visualização (👁️) da linha ou card.',
          'Para corrigir itens ou justificativas, clique no botão de edição (✏️) disponível enquanto o status for "Aguardando Gestor".'
        ]
      },
      {
        title: 'Como Criar uma Cotação Web e Homologar',
        steps: [
          'Acesse a aba "Cotações" no NexaPROCURE e clique no botão "+ Nova Cotação".',
          'Informe o Título, o Prazo Limite e adicione os insumos digitando no campo de busca com autocomplete (ordenado alfabeticamente) ou importando o estoque crítico.',
          'Filtre e selecione os distribuidores desejados (com apoio dos botões "Selecionar Todos" / "Desmarcar Todos") na grade com rolagem independente.',
          'Clique em "Publicar Cotação e Gerar Links" no rodapé fixo do modal.',
          'Dispare os links via WhatsApp para os representantes comerciais.',
          'No "Mapa Comparativo", analise as propostas, confira o Saving (Economia) e clique em "Homologar e Fechar Cotação".'
        ]
      },
      {
        title: 'Como Emitir e Compartilhar a Ordem de Compra Oficial (PO)',
        steps: [
          'Ao homologar a cotação, a Ordem de Compra Oficial é aberta automaticamente na tela.',
          'Você também pode acessá-la a qualquer momento clicando no botão "Pedido (OC)" na tabela de cotações homologadas.',
          'Clique em "Imprimir (A4)" para gerar o PDF timbrado formal ou em "Enviar WhatsApp" para disparar o pedido diretamente ao representante comercial.'
        ]
      },
      {
        title: 'Como Auditar o Histórico de Preços e a Curva ABC',
        steps: [
          'Na aba "Reposição", utilize o filtro "Curva ABC" para visualizar apenas insumos Classe A (alto impacto financeiro), B ou C.',
          'Clique sobre o nome de qualquer insumo crítico ou em qualquer item do Mapa Comparativo para abrir o modal de "Histórico de Preços".',
          'Analise as últimas compras realizadas, o menor preço histórico e a variação percentual de inflação do item.'
        ]
      }
    ],
    duvidas: [
      {
        pergunta: 'Como a Ordem de Compra é integrada ao Financeiro?',
        resposta: 'No momento exato em que a cotação é homologada, o sistema cria automaticamente um lançamento de despesa provisória no módulo Financeiro (Contas a Pagar), vinculado à filial correspondente e com a data de vencimento projetada pelo prazo de entrega e pagamento acordado com o fornecedor.'
      },
      {
        pergunta: 'Como funciona o cálculo de Saving (Economia)?',
        resposta: 'O Saving é apurado item a item comparando o último preço histórico pago pelo insumo com o melhor preço unitário obtido na cotação atual. O sistema exibe o total economizado em R$ e o percentual de desconto obtido pelo setor de compras.'
      },
      {
        pergunta: 'O que significa a classificação da Curva ABC no estoque?',
        resposta: 'A Curva ABC classifica os insumos pelo impacto financeiro total: Classe A representa 80% do valor financeiro do estoque (itens de alto custo/volume); Classe B representa 15%; e Classe C representa 5% (itens de baixo impacto financeiro).'
      },
      {
        pergunta: 'Posso incluir produtos do estoque e itens novos no mesmo pedido?',
        resposta: 'Sim. O novo formulário multi-itens permite mesclar insumos já cadastrados no almoxarifado/farmácia e novos produtos de texto livre em uma única solicitação.'
      },
      {
        pergunta: 'Até quando posso editar ou excluir minha solicitação?',
        resposta: 'Você pode editar ou excluir sua solicitação enquanto ela estiver com status "Aguardando Gestor" ou caso tenha sido recusada. Após aprovada pelo gestor/diretoria ou em cotação, a edição é bloqueada para garantir a rastreabilidade.'
      }
    ]
  },
  calendar: {
    id: 'calendar',
    name: 'Agenda & Consultórios',
    subtitle: 'NexaCAL — Gestão de Agendamentos, Grade & Cotas',
    color: '#0891b2',
    recursos: [
      {
        title: 'Central de 15 Relatórios Clínicos & Executivos',
        desc: 'Relatórios completos de extrato geral, absenteísmo (faltas/no-show), produtividade médica, ocupação de salas, confirmações WhatsApp, cotas anuais, tempo de espera, busca ativa de pacientes crônicos e auditoria de alterações.'
      },
      {
        title: 'Exportação em PDF Timbrado & Excel (XLSX)',
        desc: 'Emissão instantânea de relatórios com cabeçalho institucional timbrado em PDF (A4) e planilhas dinâmicas em Excel prontas para auditorias e BI.'
      },
      {
        title: 'Configuração Anual de Grade & Cotas Médicas',
        desc: 'Parametrização de cotas anuais e mensais de primeiras consultas, retornos e procedimentos por médico, com botão de replicação para os 12 meses do ano em 1 clique e painel de capacidade anual consolidada.'
      },
      {
        title: 'Pesquisa Global Multianual',
        desc: 'Busca universal e profunda em todo o banco de agendamentos em todos os dias, meses e anos por nome, CPF, telefone, médico, sala ou data, com botão de navegação direta "Ver Dia".'
      },
      {
        title: 'Gestão Multissalas e 4 Visualizações',
        desc: 'Alternância instantânea entre modos Horários (Timeline do dia), Salas (Visão por consultório), Semanal e Mensal.'
      },
      {
        title: 'Registro Rápido de Falta (No-Show)',
        desc: 'Botão de 1 clique para registro de faltas na recepção, alimentando automaticamente os indicadores de absenteísmo.'
      },
      {
        title: 'Bloqueio de Agenda & Ausências',
        desc: 'Registro de congressos, férias e solicitações com detecção em tempo real de pacientes afetados para remanejamento preventivo e isolamento por filial.'
      },
      {
        title: 'Feriados Nacionais Automáticos',
        desc: 'Identificação e sinalização de feriados nacionais do Brasil no calendário com avisos preventivos em agendamentos.'
      },
      {
        title: 'Notificações WhatsApp com Nome da Clínica',
        desc: 'Envio de lembretes e confirmações com 1 clique direto para o WhatsApp do paciente com informações de local, horário e nome da clínica configurado no branding.'
      },
      {
        title: 'Painel TV de Chamadas em Tempo Real',
        desc: 'Painel profissional em tela cheia para Smart TV na sala de espera com logomarca da clínica, relógio digital, aviso sonoro duplo (chime) e sintetizador de voz natural anunciando o nome do paciente e o consultório.'
      },
      {
        title: 'Chamada e Rechamada em 1 Clique',
        desc: 'Botões diretos na grade diária e na visão multissalas para disparar ou repetir a chamada de pacientes na TV com sincronização instantânea em nuvem.'
      },
      {
        title: 'Carrossel Educativo com 70 Dicas Clínicas',
        desc: 'Transmissão contínua durante o tempo de espera com 70 orientações em 7 categorias: Nutrição, Hemodiálise, Líquidos, Saúde Mental, Serviço Social, Mitos & Verdades e Cuidados com o Acesso, cada uma com sua cor padrão e micro-animações.'
      },
      {
        title: 'Gerenciador de Dicas da TV',
        desc: 'Painel administrativo integrado para adicionar, editar, inativar, excluir e restaurar dicas de saúde com sincronização imediata em todas as Smart TVs.'
      }
    ],
    tutorial: [
      {
        title: 'Como Operar o Painel de Chamadas na Smart TV',
        steps: [
          'No cabeçalho da Agenda, clique no botão "Painel".',
          'Copie o link direto gerado para a unidade correspondente (ex: com ?painel_tv=1&unidade=betim).',
          'No controle remoto da Smart TV, abra o aplicativo de Navegador (Internet) e acesse o link copiado.',
          'Toque no botão "Tela" para colocar o painel em tela cheia (Fullscreen).',
          'Toque no botão "Ativar" uma única vez na TV para liberar a reprodução de áudio e voz.',
          'Na tela do médico ou atendente, clique no botão "Chamar" ao lado do paciente para que a TV anuncie o nome e o consultório.'
        ]
      },
      {
        title: 'Como Gerenciar e Criar Dicas Educativas para a TV',
        steps: [
          'No cabeçalho da Agenda, clique no botão "Painel" e depois no botão "Dicas".',
          'Utilize as pílulas de categorias para filtrar (Nutrição, Hemodiálise, Líquidos, Saúde Mental, Serviço Social, Mitos ou Cuidados).',
          'Para editar uma dica existente, clique no botão do lápis no card correspondente.',
          'Para criar uma nova recomendação da sua clínica, clique no botão "Novo", preencha o Título, Categoria, Texto e Duração em segundos.',
          'Clique em "Salvar". A nova dica passará a circular automaticamente no carrossel da TV.'
        ]
      },
      {
        title: 'Como Acessar e Exportar Relatórios da Agenda',
        steps: [
          'No topo do módulo de Agenda, clique no botão "Relatórios".',
          'Selecione na barra lateral o relatório desejado (ex: "Extrato Geral", "Produtividade", "Faltas" ou "Busca Ativa").',
          'Defina os filtros de Período (Início e Fim), Médico, Consultório/Sala e Status.',
          'Clique em "Exportar PDF" para gerar o documento timbrado A4 ou "Exportar Excel" para obter a planilha XLSX.'
        ]
      },
      {
        title: 'Como Configurar a Grade Anual do Médico',
        steps: [
          'No cabeçalho da Agenda, clique no botão "Grade".',
          'Selecione o profissional de saúde na barra lateral.',
          'Utilize o seletor de ano para definir o exercício desejado (ex: 2026 ou 2027).',
          'Ajuste as cotas mensais de Primeira Consulta, Retorno e Procedimentos.',
          'Clique em "Replicar para o Ano Inteiro" para aplicar os valores aos 12 meses simultaneamente.',
          'Defina os dias e horários de atendimento da semana e clique em "Salvar".'
        ]
      },
      {
        title: 'Como Realizar Busca Global em Todos os Anos',
        steps: [
          'No campo de pesquisa na barra superior, digite qualquer termo: nome do paciente, CPF, telefone, médico ou data (ex: "24/08/2026", "2026" ou "Agosto").',
          'O sistema abrirá a visualização de Busca Global listando todos os agendamentos encontrados em qualquer data.',
          'Clique no botão "Ver Dia" para ir diretamente para a visualização detalhada da data encontrada.'
        ]
      },
      {
        title: 'Como Registrar Presença, Atendimento ou Falta (No-Show)',
        steps: [
          'Na visualização de Horários do dia, localize o paciente.',
          'Quando o paciente chegar à clínica, clique em "Chegou" (status mudará para Aguardando).',
          'Quando o médico chamar o paciente para a sala, clique em "Iniciar" (status mudará para Em Consulta).',
          'Ao concluir a consulta, clique em "Finalizar".',
          'Se o paciente não comparecer, clique em "Faltou" para alimentar a taxa de absenteísmo.'
        ]
      },
      {
        title: 'Como Bloquear Dias ou Períodos para Ausências',
        steps: [
          'Clique no botão "Bloquear" no topo da Agenda.',
          'Selecione o Médico (ou Todos os Médicos), o Período e o Motivo (Férias, Congresso, etc.).',
          'Confira os agendamentos conflitantes no quadro de aviso e clique em "Bloquear".'
        ]
      }
    ],
    duvidas: [
      {
        pergunta: 'Como o carrossel de dicas se comporta quando o médico chama um paciente?',
        resposta: 'A chamada do paciente tem prioridade absoluta na tela. O carrossel de dicas é interrompido imediatamente para dar lugar ao aviso sonoro e ao nome do paciente em letras garrafais. Após 22 segundos, o carrossel é retomado suavemente.'
      },
      {
        pergunta: 'Posso personalizar ou criar novas dicas para a TV?',
        resposta: 'Sim. Pelo botão "Dicas" dentro do modal do Painel, você pode editar qualquer uma das 70 dicas clínicas, desativar itens ou criar novas orientações personalizadas para a sua clínica.'
      },
      {
        pergunta: 'É necessário algum aparelho ou computador exclusivo para a TV da sala de espera?',
        resposta: 'Não. Qualquer Smart TV com navegador de internet (Samsung, LG, TCL, Android TV) consegue abrir o link direto do painel sem necessidade de hardware adicional.'
      },
      {
        pergunta: 'O que fazer se a TV não emitir o som ou a voz da chamada?',
        resposta: 'As Smart TVs bloqueiam áudio automático por segurança até que haja uma interação. Basta clicar no botão "Ativar" na barra superior da TV uma única vez para liberar o sino e a voz.'
      },
      {
        pergunta: 'O que acontece se eu clicar em "Rechamar" o paciente?',
        resposta: 'A TV tocará novamente o sino de atenção e repetirá a voz com o nome e consultório, exibindo o selo de rechamada (ex: "2ª Chamada") para destacar a repetição.'
      },
      {
        pergunta: 'Quais relatórios estão disponíveis na Agenda?',
        resposta: 'São 15 relatórios: 1. Extrato Geral, 2. Produtividade, 3. Faltas (No-Show), 4. Confirmações WhatsApp, 5. Ocupação, 6. Modalidades, 7. Encaixes, 8. Cancelamentos, 9. Cotas, 10. Bloqueios, 11. Pontualidade, 12. Convênios, 13. Busca Ativa de Crônicos Sem Retorno, 14. Feriados e 15. Auditoria.'
      },
      {
        pergunta: 'De onde vem o nome da clínica na mensagem do WhatsApp e nos relatórios em PDF?',
        resposta: 'O sistema busca automaticamente a Razão Social ou Nome Fantasia configurado no módulo de Configurações > Customização SaaS / Branding.'
      },
      {
        pergunta: 'Como a busca global localiza consultas de anos anteriores ou futuros?',
        resposta: 'A barra de pesquisa faz uma varredura completa em toda a base de dados de agendamentos em tempo real, sem restrição de data ou mês atual.'
      },
      {
        pergunta: 'O que acontece ao atingir o limite de cotas do mês configurado?',
        resposta: 'O sistema emite um alerta visual ao atendente no momento de marcar uma nova primeira consulta ou retorno, permitindo remanejar ou registrar como encaixe justificado.'
      },
      {
        pergunta: 'Como o médico visualiza as consultas finalizadas na sua produção?',
        resposta: 'Todas as consultas concluídas e finalizadas no módulo Agenda entram automaticamente na apuração de honorários do módulo NexaMED.'
      }
    ]
  },
  reception: {
    id: 'reception',
    name: 'Recepção & Admissão',
    subtitle: 'NexaCLINIC — Front-Office & Base Mestre de Pacientes',
    color: '#0d9488',
    recursos: [
      {
        title: 'Base Central e Unificada de Pacientes (Master Record)',
        desc: 'Cadastro único e centralizado de pacientes integrado em tempo real a todos os módulos do sistema (Prontuário Clínico, Enfermagem/Sessões, Alertas Assistenciais, Procedimentos Médicos, Agenda e Faturamento APAC).'
      },
      {
        title: 'Admissão Nefrológica Completa em 6 Abas',
        desc: 'Cadastro estruturado com Identificação (CPF/CNS e desambiguação de homônimos), Contatos com Busca de CEP, Convênio/APAC, Logística de Salão, Nefrologia (Histórico da 1ª diálise, Etiologia DRC, Alergias e Comorbidades) e Regulação de Transplante Renal (RBT).'
      },
      {
        title: 'Autocompletar Instantâneo de CEP (ViaCEP)',
        desc: 'Preenchimento automático e imediato de Logradouro, Bairro, Cidade e Estado ao digitar o CEP e clicar em Buscar.'
      },
      {
        title: 'Check-in de Presença & Ganho de Peso Interdialítico',
        desc: 'Confirmação rápida de chegada com registro de PA, temperatura e cálculo automático do ganho de peso (Peso Pré - Peso Seco) com alerta visual para ganhos críticos (> 4.0 kg).'
      },
      {
        title: 'Comunicação Direta via WhatsApp em 1 Clique',
        desc: 'Atalhos integrados em cada linha de paciente e contato de emergência para abertura instantânea do WhatsApp com mensagem de suporte pré-formatada.'
      },
      {
        title: 'Monitoramento Preditivo de Validade de APACs',
        desc: 'Sinalização automática com badges coloridos para APACs regulares (verde), a vencer em menos de 30 dias (âmbar) ou vencidas (vermelho).'
      },
      {
        title: 'Mapa Interativo de Poltronas & Salas',
        desc: 'Visualização da distribuição de poltronas em tempo real por salão e turno com identificação de presença dos pacientes em diálise.'
      },
      {
        title: 'Ronda Médica Presencial Integrada',
        desc: 'Auditoria de presença dos nefrologistas plantonistas por turno e setor com registro de presença, atraso, trocas ou faltas.'
      }
    ],
    tutorial: [
      {
        title: 'Como Realizar a Admissão de um Paciente',
        steps: [
          'Acesse o módulo de Recepção e clique na aba "Pacientes".',
          'Clique no botão "+ Admissão" no canto superior direito.',
          'Preencha os dados de "Identificação" (Nome, CPF, CNS, Nascimento, Mãe, Sexo e Status).',
          'Na aba "Contatos", digite o CEP e clique em "Buscar" para preencher o endereço automaticamente; informe o telefone e os contatos de emergência/recado.',
          'Na aba "Convênio", cadastre o Pagante (SUS/Convênio Privado), número e validade da APAC.',
          'Na aba "Logística", defina a Unidade, Modalidade (HD/DP), Frequência, Turno, Salão e Poltrona.',
          'Na aba "Nefrologia", registre a Origem, Data da 1ª diálise, Etiologia da DRC, Tipo Sanguíneo/RH, Alergias e Comorbidades.',
          'Na aba "Transplante", informe a indicação, situação na fila RBT, centro transplantador e histórico obstétrico/transfusional.',
          'Clique em "Salvar Ficha do Paciente". Os dados ficam imediatamente disponíveis em todo o sistema.'
        ]
      },
      {
        title: 'Como Realizar o Check-in Diário de Presença',
        steps: [
          'Na aba "Presença", localize o paciente agendado para o turno atual.',
          'Clique no botão verde "Registrar".',
          'Informe o Peso de Entrada (kg), a Pressão Arterial (Sistólica/Diastólica) e a Temperatura (°C).',
          'O sistema calculará automaticamente o ganho de peso interdialítico.',
          'Clique em "Confirmar Presença". O status mudará para "Presente" e os dados ficarão disponíveis para a enfermagem.'
        ]
      },
      {
        title: 'Como Monitorar APACs e Falar com Familiares',
        steps: [
          'Consulte o card de KPI "APACs" no topo do painel para verificar pendências.',
          'Na tabela de pacientes ou presença, clique no ícone do WhatsApp para disparar uma mensagem direta ao paciente ou familiar de recado.'
        ]
      },
      {
        title: 'Como Auditar a Ronda Médica',
        steps: [
          'Acesse a aba "Ronda".',
          'Confira a lista de médicos escalados para o dia.',
          'Conforme o nefrologista chegar ao salão, clique em "✓ Presente". Em caso de atraso ou substituição, clique no respectivo botão para auditar.'
        ]
      }
    ],
    duvidas: [
      {
        pergunta: 'Como as alterações feitas no cadastro de pacientes se refletem nos outros módulos?',
        resposta: 'O sistema utiliza uma Base Central Unificada (Master Patient Record). Ao salvar qualquer alteração (endereço, telefone, peso seco, alergias ou APAC), os novos dados são propagados instantaneamente para o Prontuário Clínico, Enfermagem, Faturamento APAC, Feed Assistencial e Agenda de Consultas.'
      },
      {
        pergunta: 'Por que o formulário de admissão possui dados de nefrologia e transplante?',
        resposta: 'Para garantir que o paciente admitido pela recepção já entre no sistema com dados cruciais para a segurança clínica (alergias em destaque, tipo sanguíneo, acesso vascular e histórico de diálise) e faturamento APAC (CNS, CID-10 e número da APAC).'
      },
      {
        pergunta: 'O que acontece quando o ganho de peso interdialítico for excessivo?',
        resposta: 'Ao registrar um peso de entrada que supere em mais de 4.0 kg o peso seco prescrito, o sistema emite um destaque visual em vermelho na linha do paciente para alertar a equipe de enfermagem sobre hipervolemia.'
      },
      {
        pergunta: 'Como funciona a busca de CEP?',
        resposta: 'Basta digitar os 8 números do CEP na aba de contatos e clicar em "Buscar". O sistema consulta a API oficial do ViaCEP e preenche imediatamente o logradouro, bairro, cidade e estado.'
      },
      {
        pergunta: 'Onde o médico visualiza as alergias cadastradas pela recepção?',
        resposta: 'As alergias informadas na admissão aparecem automaticamente com badge de alerta de segurança no topo do Cockpit Clínico do Prontuário Médico (NexaCLINIC).'
      }
    ]
  }
};


