import React from 'react';
import { X, Megaphone, Calendar, CheckCircle2, ArrowRight } from 'lucide-react';

export default function ChangelogModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const updates = [
    {
      version: 'v4.7.56',
      date: '24/08/2026',
      title: 'NexaCAL — Configuração Anual de Grade, Pesquisa Global Multianual e Legenda Visual',
      description: 'Implementação de configuração de grade e cotas para o ano todo com replicação em 1 clique e métricas anuais, pesquisa global universal que busca agendamentos em todos os anos, meses e dias, legenda limpa de cores e padronização rigorosa de rótulos de 1 palavra.',
      changes: [
        { type: 'Agenda Anual', text: 'Seletor de ano, navegação pelos 12 meses, replicação anual em 1 clique e painel de capacidade anual de consultas e procedimentos.' },
        { type: 'Busca Global Universal', text: 'Pesquisa em tempo real que localiza pacientes, CPFs, telefones, médicos e datas em todo o histórico e futuro do sistema, com botão "Ver Dia" para navegação direta.' },
        { type: 'Legenda Visual Clean', text: 'Remoção dos nomes das cores dos badges da legenda, mantendo identificação por pontos visuais de cor.' },
        { type: 'Rótulos Concisos (1 Palavra)', text: 'Varredura e remoção de termos duplos em formulários, modais, cabeçalhos de tabela e botões do módulo Agenda.' }
      ]
    },
    {
      version: 'v4.7.55',
      date: '24/08/2026',
      title: 'Correção de Permissões de Filial por Usuário (Restrição Individual de Unidades)',
      description: 'Ajuste na política de controle de acesso a unidades: remoção de regras fixas em código e aplicação estrita das permissões de filial (primaryUnit/allowedUnits) definidas no cadastro do operador.',
      changes: [
        { type: 'Permissões por Usuário', text: 'Usuários locais como anacg@nexa.com possuem acesso estrito à sua unidade de operação (Betim), exibindo seletor fixo e dados correspondentes.' },
        { type: 'Gestão em NexaCONFIG', text: 'Adicionado seletor de Filial de Operação nos cadastros de usuários do painel de Configurações & T.I.' },
        { type: 'Administrador Master', text: 'Garantido acesso global e alternância entre filiais para contato@techcosta.net.' }
      ]
    },
    {
      version: 'v4.7.54',
      date: '24/08/2026',
      title: 'Isolamento Total de Dados por Filial (Taguatinga/DF vs Betim/MG) em Todos os Módulos',
      description: 'Implementação de chaveamento e filtragem universal em todos os 14 módulos do sistema, garantindo segregação total de pacientes, escalas, estoques, compras, ordens de serviço, RH, financeiro e faturamento por filial ativa.',
      changes: [
        { type: 'Isolamento Universal', text: 'Todos os módulos filtram estritamente os dados da filial ativa (Betim ou Taguatinga), garantindo visualização zerada para novas filiais sem registros legados.' },
        { type: 'Seletor Integrado', text: 'Adicionado o seletor compacto de unidades nos cabeçalhos de todos os módulos para alternância rápida.' },
        { type: 'Tagging de Novos Registros', text: 'Novos cadastros e solicitações em qualquer módulo recebem automaticamente o identificador da filial ativa.' },
        { type: 'Modo Consolidado', text: 'Gestores e administradores contam com visão unificada quando selecionado Todas as Unidades.' }
      ]
    },
    {
      version: 'v4.7.53',
      date: '24/08/2026',
      title: 'Arquitetura Multi-Unidade (Betim/MG e Taguatinga/DF) & Integração Financeiro e Estoque',
      description: 'Implementação de arquitetura multi-unidade global com isolamento de filiais e visão consolidada para diretoria/gestores, campos e filtros dinâmicos no Financeiro e Estoque, e controle de acesso no Admin.',
      changes: [
        { type: 'Contexto Global Multi-Unidade', text: 'Criação do UnitContext e componente UnitSelector permitindo alternar instantaneamente entre Betim, Taguatinga ou Todas as Unidades (Consolidado).' },
        { type: 'Financeiro Integrado', text: 'Totalizadores, EBITDA, saldos e gráficos recalculados por filial, com seleção de unidade em contas a pagar e receber e badges cromáticas.' },
        { type: 'Estoque & Importação NF-e', text: 'Importador XML/PDF vincula lotes de insumos e gera duplicatas financeiras associadas diretamente à filial de destino.' },
        { type: 'Admin & Permissões', text: 'Cadastro de usuários com filial principal e permissões granulares, com acesso master irrestrito para contato@techcosta.net.' }
      ]
    },
    {
      version: 'v4.7.52',
      date: '24/08/2026',
      title: 'NexaASSIST — Novas Categorias Clínicas no Mural e Correção de Alinhamento/Espaçamento Visual de Cards',
      description: 'Adição de 5 novas categorias clínicas especializadas para hemodiálise e resolução completa das sobreposições de ícones, badges e botões de ação nos comunicados do mural.',
      changes: [
        { type: 'Novas Categorias', text: 'Adicionadas: Evento Adverso, Hemotransfusão, Infecção, Acesso Vascular e Precaução de Contato com cores e ícones distintos.' },
        { type: 'Badges e Espaçamento', text: 'Correção de espaçamento entre badges de categoria e urgência, garantindo legibilidade e alinhamento.' },
        { type: 'Botões de Ação', text: 'Estilização premium para botões de edição e exclusão de comunicados com feedback visual em hover.' }
      ]
    },
    {
      version: 'v4.7.51',
      date: '24/08/2026',
      title: 'NexaASSIST — Refatoração de Design System Vanilla CSS no Mapa de Salões e Header de Abas',
      description: 'Refatoração completa do componente DialysisScheduleTab com estilização pura em Vanilla CSS, cards de leitos e boxes com visual de alta densidade e tipografia moderna, e novo seletor de abas na Hero Section.',
      changes: [
        { type: 'Vanilla CSS', text: 'Estilização inline de alto padrão sem dependências externas não carregadas, garantindo compatibilidade total em todos os navegadores.' },
        { type: 'Cards de Leitos', text: 'Layout renovado com badges de agulhas e acessos nítidos, avatares em degradê e status de manutenção.' },
        { type: 'Abas Hero Section', text: 'Seletor de abas Escala vs Mural com fundo contrastante e badges ativas destacadas.' }
      ]
    },
    {
      version: 'v4.7.50',
      date: '24/08/2026',
      title: 'NexaASSIST — Escala Operacional de Hemodiálise por Salões & Turnos e Vínculo com Manutenção',
      description: 'Implementação do mapa visual interativo dos salões e turnos de hemodiálise, unificação de 570 pacientes, integração de 100% dos números de série de máquinas com o módulo de manutenção e substituição integral das planilhas manuais.',
      changes: [
        { type: 'Mapa de Salões', text: 'Visualização interativa por Salão (01, 02, 03) e Turnos (1º, 2º, 3º), organizado por Boxes (01 a 08 e Sala Amarela) e cadências Seg/Qua/Sex e Ter/Qui/Sáb.' },
        { type: 'Unificação de Pacientes', text: '570 pacientes únicos integrados, enriquecendo 503 registros existentes e cadastrando 67 novos pacientes com perfis clínicos completos.' },
        { type: 'Vínculo com Manutenção', text: 'Rastreabilidade de 90 máquinas Nipro Diamax 220F com status em tempo real e atalho direto para ficha técnica.' },
        { type: 'Acessos & Isolamento', text: 'Badges visuais para FAV (calibres 15, 16 e 17), CDL, Permcath e protocolos de Uso Único / HIV e Hepatite C.' },
        { type: 'Localizador & Trocas', text: 'Busca rápida global de pacientes e ferramenta ágil de remanejamento e alocação de vagas livres.' }
      ]
    },
    {
      version: 'v4.7.49',
      date: '23/08/2026',
      title: 'NexaMED — Matriz Semanal de Salões, Mapa de Cores de Trocas e Impressão A4 Paisagem',
      description: 'Reestruturação visual completa da escala médica inspirada na rotina real de clínicas de hemodiálise, com matriz semanal por salões e turnos, mapa de calor de trocas e vagas, bolsa de compensações e exportação em A4 Paisagem para mural.',
      changes: [
        { type: 'Matriz Semanal', text: 'Visualização da escala médica organizada por 1ª a 5ª semanas do mês com linhas por Salão 1, 2, 3 e DP nos 3 turnos diários.' },
        { type: 'Mapa de Cores', text: 'Células em Verde Claro para trocas/substituições, Vermelho Alerta para vagas/buracos de escala e Branco para plantões regulares.' },
        { type: 'Bolsa de Trocas', text: 'Painel no rodapé exibindo os pares de médicos com trocas no mês e balanço de coberturas de cada nefrologista.' },
        { type: 'Impressão A4 Paisagem', text: 'Layout diagramado para impressão em formato A4 Paisagem com cabeçalho institucional para afixação nos murais dos salões.' }
      ]
    },
    {
      version: 'v4.7.47',
      date: '23/08/2026',
      title: 'Módulo de T.I. — Servidor Centralizado de E-mail (SMTP) e Disparos Universais',
      description: 'Implementação de aba dedicada no módulo de T.I. (NexaCONFIG) para configuração centralizada do servidor de e-mail institucional, suporte a múltiplos provedores, teste em tempo real e controle de disparos por módulo.',
      changes: [
        { type: 'Servidor SMTP', text: 'Configuração completa de remetente, host, porta, TLS/SSL, usuário, senha de app, e-mail de resposta e cópia oculta (BCC) para auditoria.' },
        { type: 'Presets Rápidos', text: 'Seleção em 1 clique de perfis para Google Workspace/Gmail, Microsoft 365/Outlook, Amazon SES, Resend e SMTP Personalizado.' },
        { type: 'Teste em Tempo Real', text: 'Disparo de e-mail de teste com feedback visual instantâneo e diagnóstico de conexão.' },
        { type: 'Gatilhos por Módulo', text: 'Controle de permissões para disparos automáticos nos módulos NexaMED, NexaSERVICE, NexaHR, NexaPROCURE, NexaCAL e NexaASSIST.' },
        { type: 'Logs de Disparo', text: 'Histórico detalhado com registro de data, módulo emissor, destinatário e status de entrega.' }
      ]
    },
    {
      version: 'v4.7.45',
      date: '23/08/2026',
      title: 'NexaMED — Ajuste Visual do Header, Lista de Médicos na Escala e Correção do Seletor de Mês/Ano',
      description: 'Remoção do botão voltar e controle de acesso do cabeçalho, garantia de listagem de todos os médicos no modal de escala de plantões, aumento da largura do seletor de mês para evitar corte do ano e padronização de rótulos concisos.',
      changes: [
        { type: 'Cabeçalho Clean', text: 'Removidos o botão "Voltar" e o campo "Acesso" da Hero Section do NexaMED, deixando o cabeçalho limpo e alinhado ao padrão do sistema.' },
        { type: 'Escala de Médicos', text: 'Garantido o carregamento e exibição completa da lista de médicos nefrologistas no dropdown do modal de escalar plantão.' },
        { type: 'Seletor de Mês e Ano', text: 'Ajustada a largura do seletor mensal para 220px, exibindo o ano completo sem cortes em todos os navegadores e resoluções.' },
        { type: 'Rótulos Concisos', text: 'Aplicação da regra de 1 palavra única nos cabeçalhos e campos de formulário de todas as abas do NexaMED.' }
      ]
    },
    {
      version: 'v4.7.43',
      date: '22/08/2026',
      title: 'Padronização Estrita de Cargos e Setores (1 Palavra, Title Case e Ordem A-Z)',
      description: 'Todos os cargos e setores foram padronizados rigorosamente com 1 palavra apenas, primeira letra maiúscula e ordenação alfabética estrita nos dois campos.',
      changes: [
        { type: 'Cargos (A-Z)', text: 'Catálogo de cargos reestruturado com exatamente 1 termo (Administrador, Enfermeiro, Médico, Nutricionista, Técnico, etc.) em ordem alfabética.' },
        { type: 'Setores (A-Z)', text: 'Catálogo de 25 setores ajustado para termos únicos (Administração, Enfermagem, Farmácia, Hemodiálise, Recepção, etc.) em ordem alfabética.' },
        { type: 'Normalização Legada', text: 'Mapeamento inteligente para que cadastros antigos em caixa alta ou compostos sejam exibidos e salvos no novo formato padronizado.' }
      ]
    },
    {
      version: 'v4.7.42',
      date: '22/08/2026',
      title: 'Módulo RH — Cargos Selecionáveis Padronizados e Expansão de Setores Hospitalares',
      description: 'Transformação do campo de Cargo em seletor com lista padronizada da saúde, cadastro de 19 setores hospitalares e limpeza ativa de rótulos para padrão conciso de 1 palavra.',
      changes: [
        { type: 'Cargos Padronizados', text: 'Menu suspenso com cargos completos da área de saúde e hospitalar (Enfermagem, Nefrologia, Multidisciplinar, Farmácia, Engenharia Clínica e Gestão).' },
        { type: 'Setores Hospitalares', text: '19 setores especializados cadastrados cobrindo todas as áreas clínicas, de apoio, hotelaria/higienização e diretoria.' },
        { type: 'Rótulos Concisos', text: 'Aplicação estrita do padrão de 1 palavra única em todas as abas e formulários cadastrais do RH.' }
      ]
    },
    {
      version: 'v4.7.41',
      date: '22/08/2026',
      title: 'Correções: Deduplicação NexaMED e Busca Alfabética no Vale-Transporte',
      description: 'Remoção do card duplicado do NexaMED no seletor de módulos e ordenação alfabética com campo de busca de funcionários no modal de Vale-Transporte do RH.',
      changes: [
        { type: 'Seletor de Módulos', text: 'Removida a duplicidade do card NexaMED, mantendo o card oficial único no menu central.' },
        { type: 'Vale-Transporte (RH)', text: 'Lista de funcionários organizada de A a Z com campo de busca em tempo real por nome e cargo.' }
      ]
    },
    {
      version: 'v4.7.40',
      date: '22/08/2026',
      title: 'NexaMED — Aplicação do Design System Padrão Oficial Hero Section',
      description: 'Aplicação da Hero Section padrão com badge quadrado em degradê e ícone do estetoscópio, título com travessão e harmonização no Seletor de Módulos.',
      changes: [
        { type: 'Hero Section Padrão Oficial', text: 'Badge arredondado em degradê azul médico com ícone Stethoscope, título NexaMED — Gestão Médica & Escalas e subtítulo padronizado.' },
        { type: 'Seletor Central de Módulos', text: 'Adição do card NexaMED com permissões RBAC no grid principal de módulos do sistema.' }
      ]
    },
    {
      version: 'v4.7.39',
      date: '22/08/2026',
      title: 'NexaMED - Padrão Visual Clean do Header e Sincronização Total dos Médicos da Agenda',
      description: 'Ajuste do padrão visual do cabeçalho superior para o padrão clean/claro do NexaCLINIC e sincronização de todos os médicos da Agenda com o módulo NexaMED.',
      changes: [
        { type: 'Padrão Visual Harmonizado', text: 'Substituição do banner superior escuro por card branco com bordas e botões claros no padrão de excelência visual da clínica.' },
        { type: 'Sincronização de Médicos da Agenda', text: 'Carregamento unificado de todos os médicos cadastrados no sistema em todos os seletores e modais (Escala, Trocas, Procedimentos e Fechamento).' },
        { type: 'Portal do Médico', text: 'Harmonização do card do médico com avatar lilás e layout limpo.' }
      ]
    },
    {
      version: 'v4.7.38',
      date: '22/08/2026',
      title: 'Novo Módulo Gestão Médica & Escalas (NexaMED) - Escala de Salões/DP, Bolsa de Trocas com E-mail, Ronda da Recepção e Repasse Financeiro',
      description: 'Lançamento do módulo NexaMED para governança completa do corpo clínico: escala de plantões nos salões de hemodiálise e diálise peritoneal, portal do médico (sem valores), bolsa de trocas auditada com disparo de e-mails, integração automática com consultas concluídas da agenda (NexaCAL), ronda presencial na recepção (fim da prancheta), apuração de honorários com procedimentos e homologação automática para o Contas a Pagar do NexaFINANCE com segregação de acessos.',
      changes: [
        { type: 'Escala Mensal de Plantões', text: 'Grade de distribuição médica para Salões 1, 2, 3 e DP nos 3 turnos com Trava Anti-Buraco para garantir 100% de cobertura assistencial.' },
        { type: 'Portal do Médico', text: 'Visualização da escala pessoal de plantões limpa (sem valores), botão para solicitação de trocas e lançamento de procedimentos nefrológicos executados.' },
        { type: 'Bolsa de Trocas com E-mail', text: 'Fluxo em 3 etapas (solicitação, aceite e homologação) com rastreabilidade e envio automático de notificações por e-mail a cada transição.' },
        { type: 'Lançamento de Procedimentos', text: 'Registro de cateteres CDL, Permcath, biópsias renais e mapeamentos de FAV com paciente e data vinculados.' },
        { type: 'Integração com Agenda (NexaCAL)', text: 'Consultas concluídas e finalizadas na agenda entram automaticamente na contagem de produção médica do mês.' },
        { type: 'Ronda Médica na Recepção', text: 'Nova aba de ronda no módulo Recepção para auditar presencialmente os médicos nos salões com 1 toque (Presente, Atraso, Substituição, Falta).' },
        { type: 'Fechamento & Repasse Automático', text: 'Homologação da coordenação médica com criação automática do título no Contas a Pagar do NexaFINANCE sem expor dados financeiros sigilosos.' },
        { type: 'Extrato Médico em PDF', text: 'Emissão e impressão em 1 clique do holerite detalhado com discriminação de plantões, consultas e procedimentos.' }
      ]
    },
    {
      version: 'v4.7.37',
      date: '22/08/2026',
      title: 'Renovação do Módulo Clínico (NexaCLINIC) - Cockpit 360°, Prescrição Medicamentosa, Painel Laboratorial SBN, Laudos APAC, Calculadoras e Copiloto IA',
      description: 'Transformação profunda do Módulo Clínico & Assistencial em uma plataforma de prontuário eletrônico nefrológico de última geração, integrada com Farmácia, Salões, APAC/SUS, BI e Engenharia Clínica.',
      changes: [
        { type: 'Cockpit 360° do Paciente', text: 'Header unificado com foto, idade, tempo de diálise, tipo/sítio do acesso vascular, peso seco alvo, badges de alergias em destaque e sorologias ativas.' },
        { type: 'Prescrição Medicamentosa', text: 'Gestão completa de medicamentos intradialíticos (Eritropoetina, Noripurum) e de uso domiciliar, com modelos rápidos e envio direto de requisição para salão e farmácia.' },
        { type: 'Painel Laboratorial & Metas SBN', text: 'Histórico mensal de biomarcadores (Hb, Ferritina, Sat. Transf., Fósforo, Cálcio, PTH, Potássio, Kt/V, URR) com semáforo visual de metas da Sociedade Brasileira de Nefrologia.' },
        { type: 'Sessões & Alerta Hemodinâmico', text: 'Acompanhamento horário intradialítico com registro da máquina de diálise, cálculo de perda ponderal e alerta preventivo de taxa de ultrafiltração excessiva (> 13 mL/kg/h).' },
        { type: 'Central de Laudos APAC (SUS)', text: 'Controle de validade de autorizações de diálise com alerta preventivo de 30 dias e emissão oficial de Laudo de Solicitação de Procedimentos de Alta Complexidade (LME) para assinatura médica.' },
        { type: 'Evoluções Multiprofissionais', text: 'Abas por especialidade (Medicina, Enfermagem, Nutrição, Psicologia, Serviço Social) com filtros dedicados e botões de roteiro rápido em 1 clique.' },
        { type: 'Copiloto Clínico IA & Calculadoras', text: 'Síntese instantânea do prontuário com IA e calculadoras nefrológicas interativas de Kt/V Daugirdas, Ganzoni (déficit de ferro), Recirculação de Acesso e Taxa de UF.' },
        { type: 'Exportação e Ficha de Trânsito', text: 'Geração e download de sumário de transferência e trânsito em PDF formatado padrão CFM/SBN.' }
      ]
    },
    {
      version: 'v4.7.35',
      date: '22/08/2026',
      title: 'Módulo SESMT - Padronização dos Formulários de Inspeção de Extintores e Hidrantes',
      description: 'Remoção da coluna de assinatura individual dentro das tabelas das abas de Extintores e Hidrantes, posicionando os campos de responsabilidade técnica no rodapé do formulário conforme o padrão do checklist de EPI.',
      changes: [
        { type: 'Formulário de Extintores', text: 'Remoção da coluna de assinatura por linha da tabela e inclusão dos campos Inspetor e Técnico no rodapé do formulário antes do salvamento.' },
        { type: 'Formulário de Hidrantes', text: 'Remoção da coluna de assinatura por linha da tabela e inclusão dos campos Inspetor e Técnico no rodapé do formulário antes do salvamento.' },
        { type: 'Histórico e Auditoria', text: 'Adequação dos modais de visualização detalhada de inspeções de combate a incêndio sem coluna de assinatura.' },
        { type: 'Padronização de Rótulos', text: 'Aplicação da regra de termos únicos e diretos nos cabeçalhos e campos do SESMT.' }
      ]
    },
    {
      version: 'v4.7.34',
      date: '22/08/2026',
      title: 'Módulo de Compras Inteligente - Modelo dos 4 Saldos de Estoque, TTL de Requisições Configurável e Semáforo de Urgência',
      description: 'Implementação do modelo dos 4 saldos de estoque (Físico, Reservado, Disponível e Trânsito) no módulo de compras e almoxarifado, cálculo automático do saldo disponível para evitar falsos positivos de compra entre turnos, controle de tempo de vida (TTL inicial de 1h configurável em TI) para expiração automática de requisições pendentes, semáforo de urgência visual e renovação em 1 clique para enfermagem.',
      changes: [
        { type: '4 Saldos de Estoque em Compras', text: 'Aba Reposição com matriz de decisão inteligente exibindo Físico, Reservado (pedidos dos salões), Disponível (Físico - Reservado), Trânsito (pedidos em andamento), Mínimo e Sugestão. O gatilho de compra dispara quando Disponível <= Mínimo.' },
        { type: 'Detalhamento de Requisições por Salão', text: 'Clique direto no badge de saldo Reservado para inspecionar todas as requisições em aberto com código, salão, solicitante, paciente, quantidade e data/hora.' },
        { type: 'TTL de Requisições Configurável em T.I.', text: 'Parametrização do tempo limite das requisições (1h padrão, 2h, 4h, 8h/turno, 12h, 24h) com expiração automática das pendentes e liberação imediata do saldo reservado.' },
        { type: 'Semáforo de Urgência & Contagem Regressiva', text: 'Indicador visual de tempo restante nas requisições da enfermagem e farmácia com semáforo de urgência (verde, amarelo, vermelho) e botão de renovação em 1 clique para pedidos expirados.' },
        { type: 'Documentação e Manuais Atualizados', text: 'Atualização completa das diretrizes, tutoriais e dúvidas frequentes dos módulos de Compras, Estoque, Requisições e Configurações em moduleGuidesData.js.' }
      ]
    },
    {
      version: 'v4.7.32',
      date: '22/08/2026',
      title: 'Módulo de Compras (NexaPROCURE) - Reposição Crítica em Tempo Real, Pedidos em Lote, Design Padronizado e Fornecedores Ordenáveis',
      description: 'Evolução completa do módulo de compras: nova aba de Reposição Crítica integrada ao estoque mínimo da farmácia, geração de solicitações em lote com 1 clique, redesign do Hero Header com o padrão premium do sistema, colunas clicáveis de ordenação em fornecedores e manual interativo.',
      changes: [
        { type: 'Reposição Crítica em Tempo Real', text: 'Aba dedicada com monitoramento contínuo dos medicamentos e insumos com saldo zerado ou abaixo do estoque mínimo, cálculo automático de sugestão de compra e botão de solicitação rápida.' },
        { type: 'Solicitação em Lote', text: 'Botão no topo da aba de reposição que gera automaticamente pedidos unificados para todos os insumos críticos com um único clique.' },
        { type: 'Fornecedores com Colunas Ordenáveis', text: 'Cabeçalhos clicáveis em todas as colunas da tabela de fornecedores (Razão, CNPJ, Contato, Email e Prazo) para ordenação ascendente e descendente.' },
        { type: 'Hero Header Padronizado', text: 'Novo cabeçalho com ícone amplo 56x56px, gradiente temático de compras, tipografia 1.6rem e badges dinâmicos em todas as abas.' },
        { type: 'Manual do Módulo', text: 'Inclusão da documentação interativa completa do NexaPROCURE em moduleGuidesData.js.' }
      ]
    },
    {
      version: 'v4.7.31',
      date: '22/08/2026',
      title: 'Módulo NexaASSIST - Nomes Completos de Categorias, Hero Padronizado, 3 Modos de Visualização e Proteção de Autoria',
      description: 'Ajuste responsivo para exibição 100% integral dos nomes das categorias sem cortes, padronização dimensional do Hero Header com os módulos NexaSTOCK e NexaHR, adição de 3 modos de visualização (Compacta, Normal e Grade) e bloqueio de segurança para que cada usuário possa gerenciar apenas seus próprios comunicados.',
      changes: [
        { type: 'Nomes Completos sem Cortes', text: 'Remoção de restrições rígidas de largura na grade superior, permitindo que todas as categorias (Internação, Intercorrência, Serviço Social, Psicologia, etc.) exibam seus nomes completos.' },
        { type: 'Hero Header Padronizado', text: 'Ajuste das dimensões do ícone, títulos e botões para o padrão visual unificado presente no NexaSTOCK e NexaHR.' },
        { type: '3 Modos de Visualização', text: 'Seletor na barra de ferramentas para alternar entre Compacta (lista ágil em tabela), Normal (cards individuais) e Grade (mural em colunas tipo dashboard).' },
        { type: 'Proteção de Autoria', text: 'Botões de editar e excluir visíveis e acessíveis apenas para o autor do comunicado ou administradores do sistema.' }
      ]
    },
    {
      version: 'v4.7.30',
      date: '22/08/2026',
      title: 'Módulo NexaASSIST - Redesign Ultra-Clean, Grade Compacta de Categorias e Simplificação Operacional',
      description: 'Redesign completo do mural assistencial: unificação e eliminação da redundância entre KPIs e pílulas com a nova Grade Compacta de Categorias, remoção definitiva de recursos legados de e-mail e botões de ciente para uma experiência ágil e 100% clínica.',
      changes: [
        { type: 'Grade Compacta de Categorias', text: 'Unificação em uma linha fina de cards responsivos com ícone, nome e contador de cada categoria clínica, economizando mais de 60% de espaço vertical.' },
        { type: 'Hero Header Enxuto', text: 'Remoção do badge "Em Tempo Real" e do botão de e-mail, mantendo foco exclusivo no botão "+ Novo Comunicado".' },
        { type: 'Feed Clínico Despoluído', text: 'Remoção dos botões de "Dar Ciente", filtro "Não Lidos" e badges "Via E-mail", tornando a leitura rápida e direta para toda a equipe de salão.' },
        { type: 'Manual do Módulo', text: 'Atualização das diretrizes e tutoriais do NexaASSIST em moduleGuidesData.js.' }
      ]
    },
    {
      version: 'v4.7.29',
      date: '22/08/2026',
      title: 'Módulo NexaASSIST - Filtro de Datas Inteligente, Cards de KPI Clicáveis e Estabilização Antiflicker',
      description: 'Implementação de filtro temporal flexível (Hoje, Ontem, 7 Dias, 30 Dias, Este Mês e Personalizado), cards de KPI interativos clicáveis com destaque visual para filtragem direta por categoria, e blindagem estrutural completa contra re-renderizações e loops no feed assistencial.',
      changes: [
        { type: 'Cards de KPI Clicáveis', text: 'Clique direto nos cards de Total, Internações, Altas, Intercorrências e Pendentes para filtrar instantaneamente os resultados correspondentes no feed com feedback visual.' },
        { type: 'Filtro Dinâmico de Datas', text: 'Seletor de intervalo de datas integrado que recalcula métricas de KPI e comunicados do feed em tempo real com suporte a períodos predefinidos e personalizados.' },
        { type: 'Blindagem Antiflicker Definitiva', text: 'Prevenção de re-renderizações cíclicas via comparação de integridade de dados e listener Firestore unificado sem chamadas recursivas de erro.' },
        { type: 'Manual do Módulo', text: 'Atualização do guia interativo do NexaASSIST com instruções de uso dos novos filtros temporais e cards interativos.' }
      ]
    },
    {
      version: 'v4.7.26',
      date: '22/08/2026',
      title: 'Módulo NexaASSIST - Correção do Loop de Renderização, Ingestão IA e Sincronização dos E-mails Titan',
      description: 'Resolução definitiva do loop infinito de carregamento que causava o piscamento da tela no Feed Assistencial, integração dos 58 comunicados reais da clínica extraídos via IMAP da conta Titan, adição do botão de Ingestão IA no cabeçalho e padronização rigorosa de rótulos diretos.',
      changes: [
        { type: 'Eliminação de Loop / Piscamento', text: 'Correção do useEffect em AssistPanel desacoplando a dependência cíclica de pacientes e estabilizando a renderização dos comunicados em tempo real.' },
        { type: 'Sincronização Titan IMAP', text: 'Carga completa de 58 comunicados assistenciais reais extraídos da caixa integracao@dialize.com.br no Firestore e na base de fallback local.' },
        { type: 'Acesso Rápido Ingestão IA', text: 'Inclusão do botão "Ingestão IA" no cabeçalho para processamento, extração de entidades e aprovação de e-mails assistenciais.' },
        { type: 'Rótulos Diretos de 1 Palavra', text: 'Adequação de todos os formulários, filtros e modais removendo termos duplos com barras ou conectivos de acordo com as diretrizes do projeto.' },
        { type: 'Manual do Módulo', text: 'Atualização do manual interativo NexaASSIST em moduleGuidesData.js com fluxo de comunicados e sincronização.' }
      ]
    },
    {
      version: 'v4.7.24',
      date: '21/08/2026',
      title: 'Módulo de Requisições - Alinhamento Rigoroso ao Padrão de Design Hero Banner NexaREQ, 3 Modos de Visualização e Rótulos Únicos',
      description: 'Padronização 100% fiel do Hero Header do NexaREQ conforme os padrões do NexaSTOCK e NexaHR (remoção da tag flutuante sobre o título, layout limpo com ícone em gradiente teal, título e subtítulo alinhados), 3 modos de visualização (Compacta, Normal e Cards) e conformidade rigorosa da regra de termos únicos concisos.',
      changes: [
        { type: 'Alinhamento Hero Banner', text: 'Remoção do badge/pílula flutuante superior, deixando o cabeçalho idêntico ao padrão consolidado dos módulos NexaSTOCK e NexaHR.' },
        { type: '3 Modos de Visualização', text: 'Seletor no toolbar com visualizações Compacta (padrão de alta velocidade), Normal (detalhada com badges) e Cards (grade visual de pedidos com itens e ações).' },
        { type: 'Rótulos Diretos de 1 Palavra', text: 'Adequação rigorosa de todos os formulários e campos: "Insumo / Medicamento" alterado para "Insumo", "Salão de Destino" para "Salão", "Qtd Pedida" para "Quantidade", e "Observações / Justificativa" para "Observações".' },
        { type: 'Filtro por Salão', text: 'Novo filtro no toolbar permitindo triagem instantânea das requisições por Salão 1, Salão 2, Salão 3 ou Consultório.' },
        { type: 'Manual do Módulo', text: 'Atualização completa da base de conhecimento em moduleGuidesData.js com recursos, tutoriais e FAQs do NexaREQ.' }
      ]
    },
    {
      version: 'v4.7.20',
      date: '21/08/2026',
      title: 'Módulo Estoque & Farmácia - Gestão de Kits de Produtos, Identificação de Medicamentos Controlados, Logística de Salões e Ocultação de Saldo para Enfermagem',
      description: 'Lançamento da aba de Kits de Insumos & Procedimentos no NexaSTOCK, sinalização visual de Medicamentos Controlados (Portaria 344/ANVISA) em todo o sistema, campo obrigatório de Salão (Salão 1, Salão 2, Salão 3) para kits nas requisições da enfermagem, exibição do salão na triagem da farmácia e ocultação de saldo de estoque para a equipe de enfermagem.',
      changes: [
        { type: 'Kits de Insumos & Procedimentos', text: 'Nova aba "Kits" em Estoque com cadastro de pacotes padronizados, vinculação de insumos, ajuste de quantidades e cálculo de custo total.' },
        { type: 'Medicamentos Controlados (Portaria 344)', text: 'Opção no cadastro de produtos e sinalização visual destacada com badges de segurança vermelhos (🔒 Controlado / Portaria 344) em todo o sistema.' },
        { type: 'Logística de Salões de Diálise', text: 'Campo Salão (Salão 1, Salão 2, Salão 3) com validação obrigatória ao requisitar kits, exibido na triagem e atendimento da farmácia para entrega correta.' },
        { type: 'Ocultação de Saldo para Enfermagem', text: 'Remoção do indicador de saldo na busca de produtos da técnica, mantendo o pedido pautado unicamente na necessidade clínica do paciente.' },
        { type: 'Padronização de Rótulos Diretos', text: 'Aplicação da regra de rótulos concisos de 1 palavra em formulários, tabelas e modais, eliminando termos duplos e redundantes.' }
      ]
    },
    {
      version: 'v4.7.18',
      date: '21/08/2026',
      title: 'Módulo Estoque & Farmácia - Design Hero NexaSTOCK, 3 Modos de Visualização de Catálogo, Ações de Inventário/Transferência e Empréstimos com Parceiros Inteligentes',
      description: 'Padronização do Hero Header no design consolidado Nexa, inclusão de 3 modos de visualização no Catálogo de Produtos (Compacta [Padrão], Normal [Detalhada] e Cards [Grade Visual de Suprimentos]), inserção dos botões de ação "+ Novo Inventário" e "+ Nova Transferência", e campo digital auto-sugestivo de Clínicas Parceiras na aba de Empréstimos.',
      changes: [
        { type: 'Hero Header NexaSTOCK', text: 'Cabeçalho moderno com badge gradiente âmbar/laranja (Boxes), título estilizado, subtítulo explicativo e botão de ação rápida "+ Cadastrar Insumo".' },
        { type: '3 Visualizações do Catálogo', text: 'Seletor segmented no toolbar com visualizações Compacta (padrão de alta densidade 36px), Normal (detalhada com barra de estoque e saldo total em R$) e Cards (grade visual de suprimentos com indicadores e atalhos de pedido).' },
        { type: 'Botões de Inventário & Transferência', text: 'Inserção dos botões "+ Novo Inventário" e "+ Nova Transferência" diretamente nos cabeçalhos das respectivas abas.' },
        { type: 'Clínicas Parceiras em Empréstimos', text: 'Campo de Clínica Parceira integrado com auto-sugestão dinâmica de instituições hospitalares cadastradas + histórico automático de parceiros.' },
        { type: 'Manuais e Documentação', text: 'Atualização do guia interativo NexaSTOCK em moduleGuidesData.js com tutoriais práticos das novas ferramentas.' }
      ]
    },
    {
      version: 'v4.7.16',
      date: '21/08/2026',
      title: 'Módulo RH - 3 Modos de Visualização de Funcionários, Padrão Monetário Brasileiro e Nomenclatura Gestão de Vale-Transporte',
      description: 'Implementação de 3 modos de visualização rápida na aba Funcionários (Compacta [Padrão], Normal [Detalhada] e Cards [Grade Visual de Crachás]), padronização monetária brasileira (R$ 0,00) em todo o módulo e transição de nomenclatura para "Gestão de Vale-Transporte".',
      changes: [
        { type: '3 Visualizações de Funcionários', text: 'Seletor de modos na toolbar: Compacta (padrão de alta densidade), Normal (com salário formatado e tempo de casa) e Cards (grade com fotos, contato WhatsApp e ações rápidas).' },
        { type: 'Padrão Monetário Brasileiro', text: 'Formatação universal de valores em Real (R$ 1.234,56) e porcentagens (12,34%) com vírgula decimal em todos os cards, relatórios, modais e tabelas.' },
        { type: 'Gestão de Vale-Transporte', text: 'Renomeação de cabeçalhos e formulários de "Concessão" para "Gestão de Vale-Transporte" e "Novo Vale-Transporte", com sinalização de "Rota Especial".' },
        { type: 'Documentação & Manuais', text: 'Atualização do manual interativo NexaHR com instruções e FAQs das novas visualizações operacionais.' }
      ]
    },
    {
      version: 'v4.7.14',
      date: '21/08/2026',
      title: 'Módulo RH - Correção de Importação de Ícones (Clock) e Validação de Renderização',
      description: 'Correção de referência do ícone Clock do pacote Lucide-React na caixa de Absenteísmo do Painel de Controle do RH e validação completa de renderização de todos os cards.',
      changes: [
        { type: 'Correção de Ícone', text: 'Inclusão do componente Clock nos imports de lucide-react em HRPanel.jsx eliminando a falha de ReferenceError.' },
        { type: 'Estabilidade', text: 'Build e renderização do Painel de Controle validados e normalizados.' }
      ]
    },
    {
      version: 'v4.7.13',
      date: '21/08/2026',
      title: 'Módulo RH - Organização Inteligente de Cards do Dashboard, 5 Opções de Tamanho e Ajuste Visual de Header',
      description: 'Remoção do badge de tempo real do header NexaHR, expansão dos seletores de tamanho para 5 opções (Compacto, Pequeno, Médio, Grande e Largura Total), layout padrão reorganizado por densidade de informação e redesign dos cards métricos com ícones temáticos.',
      changes: [
        { type: 'Organização Proporcional', text: 'Reorganização automática das caixas: métricas numéricas em caixas compactas e listas operacionais (Aniversariantes, Vacinas, Advertências, Contratos) em 2 colunas.' },
        { type: '5 Opções de Tamanho', text: 'Inclusão das opções Compacto (1 Col Métrico), Pequeno (1 Col), Médio (2 Col), Grande (3 Col) e Largura Total (Linha Inteira).' },
        { type: 'Redesign de KPIs', text: 'Cards numéricos reformulados com ícones destacados, bordas harmônicas e legendas explicativas para eliminar espaços vazios.' },
        { type: 'Ajuste de Header', text: 'Remoção do badge de tempo real do banner NexaHR, mantendo o padrão visual com ícone gradiente e subtítulo corporativo.' }
      ]
    },
    {
      version: 'v4.7.12',
      date: '21/08/2026',
      title: 'Módulo RH - Central de 15 Relatórios Completos, Padronização Visual NexaASSIST e Otimização de Abas',
      description: 'Lançamento da Central de 15 Relatórios de RH com exportação PDF e Excel (XLSX), integração com o botão superior "Relatórios", padronização do banner hero no estilo NexaASSIST ("Em Tempo Real") e remoção da aba redundante de relatórios/importação.',
      changes: [
        { type: '15 Relatórios RH', text: 'Cadastro Geral, Vale-Transporte Consolidado, Presença Premiada, Aniversariantes, Advertências, Absenteísmo/Faltas, Turnover, Contratos de Experiência, Vacinas, Dependentes, Folha Sintética, Dados Bancários/PIX, Vencimentos de CNH/Documentos, Efetivo por Setor e Auditoria LGPD.' },
        { type: 'Exportação PDF & XLS', text: 'Geração com 1 clique de relatórios em PDF formatado corporativo e planilhas Excel nativas prontas para cálculos.' },
        { type: 'Design NexaASSIST', text: 'Hero banner padronizado com ícone gradiente, título com badge "• Em Tempo Real" e botão de ação rápida de cadastro.' },
        { type: 'Interface Limpa', text: 'Remoção da antiga aba de relatórios e importador CSV, centralizando todas as consultas na barra de navegação superior.' }
      ]
    },
    {
      version: 'v4.7.10',
      date: '21/08/2026',
      title: 'Módulo RH - Gestão Histórica de Vale-Transporte (VT) & Sincronização por Período',
      description: 'Sincronização integral do histórico de concessões de Vale-Transporte de março a agosto de 2026 no Firestore, com persistência automática de períodos, cálculo de recargas e atualização das concessões cadastradas.',
      changes: [
        { type: 'Histórico & Sincronização', text: 'Carga completa de todos os períodos anteriores (março a agosto/2026) diretamente na base de dados de produção.' },
        { type: 'Período no Cadastro', text: 'Inclusão de seleção explícita de período no formulário de concessão e persistência garantida do mês de vigência.' },
        { type: 'Cálculo de Recargas', text: 'Cálculo automático de valor previsto bruto, desconto legal de folha e recarga líquida necessária considerando saldo do cartão.' },
        { type: 'Padrão Visual Conciso', text: 'Padronização dos rótulos de formulários e cabeçalhos de tabela para termos únicos e diretos conforme diretrizes do sistema.' }
      ]
    },
    {
      version: 'v4.7.7',
      date: '20/08/2026',
      title: 'Central de Relatórios de Estoque & Farmácia (15 Relatórios Completos com PDF e XLS)',
      description: 'Lançamento da Central de Relatórios de Estoque & Farmácia: 15 relatórios analíticos completos com filtros por período, categoria e setor, pré-visualização em tabela e exportação de PDF corporativo e Excel nativo.',
      changes: [
        { type: 'Relatórios Físicos', text: 'Posição Geral, Curva ABC, Itens Críticos e Validades FEFO com cálculo de dias restantes.' },
        { type: 'Rastreabilidade', text: 'Consumo por Paciente, Dossiê de Recall Farmacêutico, Extrato Kardex e Requisições da Enfermagem.' },
        { type: 'Logística & Compras', text: 'Entrada de Notas Fiscais (NF-e), Compras por Fornecedor, Transferências e Previsão de Demanda (30/60 dias).' },
        { type: 'Exportação PDF/XLS', text: 'Exportação com um clique para PDF em modo paisagem e planilhas Excel formatadas para cálculos.' }
      ]
    },
    {
      version: 'v4.7.4',
      date: '20/08/2026',
      title: 'Rastreabilidade Hospitalar Completa de Medicamentos & Insumos, Sugestão FEFO e Painel de Recall',
      description: 'Lançamento do sistema completo de rastreabilidade clínica (Fases 1, 2, 3 e 4): gestão de múltiplos lotes com saldos atômicos, seleção de lote na dispensação com recomendação FEFO, registro histórico no prontuário do paciente e painel de busca reversa para Recall Sanitário.',
      changes: [
        { type: 'Gestão de Lotes', text: 'Estrutura Atômica de Lotes: Cadastro de lotes, datas de validade, saldos atuais e flag "Controla Lote" no catálogo de insumos/medicamentos.' },
        { type: 'Dispensação FEFO', text: 'Atendimento com Sugestão FEFO: A farmácia escolhe o lote a dispensar priorizando o vencimento mais próximo com baixa atômica de saldo.' },
        { type: 'Prontuário & Histórico', text: 'Rastreabilidade no Paciente: Nova aba "Medicamentos & Insumos" no Painel Clínico com histórico de cada dose, lote, validade e profissionais envolvidos.' },
        { type: 'Recall Sanitário', text: 'Busca Reversa: Nova aba no Estoque permitindo localizar instantaneamente fornecedor, nota fiscal de compra e todos os pacientes que receberam um lote investigado.' }
      ]
    },
    {
      version: 'v4.7.0',
      date: '19/08/2026',
      title: 'Central de Manuais e Guias Interativos dos Módulos & Padronização de Relatórios Brasileiros',
      description: 'Lançamento da Central de Manuais e Guias Interativos nativos em cada módulo (Recursos, Tutorial passo a passo e Dúvidas Frequentes), conversão total dos relatórios para datas DD/MM/AAAA e exportação de valores numéricos puros para Excel sem R$.',
      changes: [
        { type: 'Manual dos Módulos', text: 'Central de Auto-capacitação: Novo botão "Manual" no topo de cada módulo com abas de Recursos, Tutorial prático e Dúvidas frequentes (FAQ).' },
        { type: 'Base de Conhecimento', text: 'Instruções Operacionais: Conteúdo direto e objetivo para Financeiro, RH, Agenda, Estoque, Compras, Requisições, SESMT e Feed Assistencial.' },
        { type: 'Regra de Projeto', text: 'Documentação Contínua: Nova diretriz obrigatória de projeto que exige atualização dos manuais a cada nova funcionalidade desenvolvida.' },
        { type: 'Relatórios Brasileiros', text: 'Datas em Padrão Nacional: Conversão automática de datas para DD/MM/AAAA e preservação da ordenação cronológica nos 15 relatórios.' },
        { type: 'Excel Dinâmico', text: 'Células Numéricas Puras: Remoção do prefixo "R$" em exportações XLS para permitir fórmulas, somas e tabelas dinâmicas nativas.' }
      ]
    },
    {
      version: 'v4.1.1',
      date: '19/08/2026',
      title: 'Módulo Estoque & Farmácia - Zeração de Estoque Mínimo e Etapa Financeira Dedicada no Importador de NF-e',
      description: 'Zeração de estoque mínimo (minStock: 0) para todos os 1.221 produtos e inclusão da Etapa 3 (Financeiro) no assistente de importação de XML/PDF com conferência interativa, edição e inclusão de parcelas antes do lançamento no Contas a Pagar.',
      changes: [
        { type: 'Estoque Mínimo Zerado', text: 'Zeração de Estoque de Segurança: Todos os 1.221 produtos do catálogo e do banco Firestore tiveram o minStock redefinido para 0, eliminando alertas espúrios.' },
        { type: 'Etapa Financeira no Importador', text: 'Conferência de Duplicatas: Nova etapa no Wizard que exibe o valor total da nota, data de emissão e tabela editável de parcelas lidas do XML ou PDF DANFE.' },
        { type: 'Edição de Parcelas', text: 'Flexibilidade de Lançamento: Possibilidade de alterar vencimentos, valores, adicionar novas parcelas ou remover duplicatas com cálculo de validação em tempo real.' },
        { type: 'Fluxo em 5 Etapas', text: 'Processo Guiado: 1. Arquivo -> 2. Fornecedor -> 3. Financeiro -> 4. Mapear Itens -> 5. Finalizar, assegurando total precisão antes de gravar no estoque e financeiro.' }
      ]
    },
    {
      version: 'v4.1.0',
      date: '19/08/2026',
      title: 'Módulo Estoque & Farmácia - Zeração de Saldos, Limpeza de Histórico, Importador XML & PDF (DANFE) e Modais 100% Responsivos',
      description: 'Zeração completa dos saldos dos 1.221 produtos, exclusão do histórico de movimentações, suporte à importação de NF-e por XML e PDF DANFE com extração de faturas para o Contas a Pagar, e ajuste de todos os modais para visualização a 100% de zoom com rodapé fixo e corpo rolável.',
      changes: [
        { type: 'Zeração de Estoque', text: 'Saldo Inicial Zerado: Todos os 1.221 produtos do catálogo e do banco Firestore foram redefinidos para quantidade 0 (currentStock: 0).' },
        { type: 'Limpeza de Histórico', text: 'Histórico Limpo: Exclusão de todas as movimentações anteriores na coleção stock_transactions, preparando o ambiente para contagem física real.' },
        { type: 'Importador XML & PDF DANFE', text: 'Suporte a PDF e XML: Novo mecanismo inteligente com pdfjs-dist que lê DANFEs em PDF e XMLs SEFAZ, extraindo produtos, emitente, chaves e faturas/duplicatas.' },
        { type: 'Integração Financeira', text: 'Contas a Pagar Automático: Ao importar uma nota com parcelas/duplicatas, cada parcela é automaticamente lançada no Contas a Pagar com seu vencimento real e abastece o estoque.' },
        { type: 'Visual & Usabilidade', text: 'Modais com 100% de Zoom: Todos os formulários e modais (Produto, Fornecedor, Setor, Movimentação, Transferência, Empréstimos e Inventários) ganharam corpo rolável com botões de ação e cancelamento fixos e visíveis sem corte.' }
      ]
    },
    {
      version: 'v4.0.9',
      date: '19/08/2026',
      title: 'Módulo Financeiro - Saldo Pendente no Card Contas a Pagar e Remoção de Card Duplicado',
      description: 'Ajuste de foco no card Contas a Pagar do Mês para exibição exclusiva do saldo pendente a quitar, listagem de detalhamento filtrada apenas com títulos não pagos e remoção do card redundante Pagar Hoje & Atrasados.',
      changes: [
        { type: 'Saldo Pendente', text: 'Valor em Destaque: O card principal passa a exibir exclusivamente o saldo em aberto que falta pagar no mês selecionado.' },
        { type: 'Visual Limpo', text: 'Remoção de Textos Redundantes: Eliminação de legendas explicativas poluídas no rodapé do card.' },
        { type: 'Detalhamento Focado', text: 'Modal sem Títulos Pagos: Listagem filtrada trazendo apenas contas pendentes com botão de baixa direta.' },
        { type: 'Otimização de Cards', text: 'Exclusão de Card Duplicado: Removido o card Pagar Hoje & Atrasados para eliminar redundância com o card de Vencidos do Mês.' }
      ]
    },
    {
      version: 'v4.0.8',
      date: '19/08/2026',
      title: 'NexaASSIST - Sincronização em Nuvem (1 Minuto), Persistência no Firestore e Tempo Real',
      description: 'Ingestão e processamento 100% em nuvem a cada 1 minuto da caixa Titan (integracao@dialize.com.br), sincronização direta na coleção assist_posts do Firestore, escuta em tempo real (onSnapshot) e auto-vínculo com a base integral de 624 pacientes.',
      changes: [
        { type: 'Nuvem Contínua', text: 'Sincronização em Nuvem a cada 1 Min: Automação completa sem necessidade de computador ligado, com background daemon e workflow GitHub Actions rodando periodicamente.' },
        { type: 'Banco Firestore', text: 'Persistência Direta no Firestore: Todos os 18 comunicados de e-mails recebidos (incluindo 18 e 19/08) foram gravados e organizados na coleção assist_posts.' },
        { type: 'Tempo Real', text: 'Atualização Instantânea: Listener Firestore onSnapshot que atualiza o Feed Assistencial automaticamente sem exigir reload da página.' },
        { type: 'Fuzzy Matching 624 Pacientes', text: 'Vínculo Inteligente: Reconhecimento preciso de pacientes (Rafael Geraldo, Ronivon, Nilva, Estanislau, etc.) e preenchimento de Salão e Turno.' },
        { type: 'Regras de Segurança', text: 'Permissões do Firestore: Liberação de acesso autenticado à coleção assist_posts no firestore.rules.' }
      ]
    },
    {
      version: 'v4.0.5',
      date: '17/08/2026',
      title: 'NexaASSIST - Leitura Inteligente em Background, Auto-Vínculo de Pacientes e Limpeza da Interface',
      description: 'Automatização completa do processamento de e-mails assistenciais da caixa Titan (integracao@dialize.com.br), auto-vínculo de pacientes cadastrados por inteligência textual e remoção de botões manuais do cabeçalho.',
      changes: [
        { type: 'Auto-Vínculo de Pacientes', text: 'Vínculo Inteligente Sem Ação Manual: Identificação automática de pacientes no texto do e-mail (ex: ALEXANDRE JOSE DE PAULA, RAQUEL TABITA, CELSO GONÇALVES MATOS, FLAVIO FERREIRA) com associação direta de Salão, Turno e CPF.' },
        { type: 'Ingestão de E-mails Titan', text: 'Leitura em Background: Processamento contínuo dos comunicados de Admissão, Alta Hospitalar e Intercorrências recebidos na conta oficial da clínica.' },
        { type: 'Classificação Clínica', text: 'Categorização Automática: Classificação inteligente de urgência e categoria para infecções, tratamentos com antibióticos, admissões e hospitalizações.' },
        { type: 'Interface Limpa', text: 'Remoção de Botões Manuais: Cabeçalho simplificado sem botões redundantes de sincronização, operando 100% no fluxo automático.' }
      ]
    },
    {
      version: 'v4.0.4',
      date: '17/08/2026',
      title: 'Módulo Agenda (NexaCAL) - Feriados Nacionais do Brasil, Bloqueio de Ausências e Gestão de Grade & Cotas por Médico',
      description: 'Implementação de feriados nacionais dinâmicos, fechamento de dias para ausências médicas e configuração completa de cotas mensais de Primeira Consulta e Retorno, dias da semana e turnos de atendimento por profissional.',
      changes: [
        { type: 'Feriados Nacionais', text: 'Cálculo Dinâmico de Feriados: Integração automática de feriados fixos e móveis brasileiros (Carnaval, Páscoa, Corpus Christi, Tiradentes, Consciência Negra, Natal, etc.) com badges em todas as 4 visões da agenda e alertas no agendamento.' },
        { type: 'Bloqueio de Agenda', text: 'Fechamento de Dias e Ausências: Recurso para bloquear horários ou dias completos de médicos (férias, congressos, folgas, atestados) com verificação em tempo real de consultas já marcadas para remanejamento.' },
        { type: 'Grade & Cotas', text: 'Configuração Individual por Médico: Definição de limites mensais de Primeira Consulta, Retorno e Procedimentos com barra de progresso, dias da semana ativos, turnos de atendimento, tempo médio de consulta e limite de encaixes.' },
        { type: 'Validação Inteligente', text: 'Alertas Preventivos: Avisos automáticos no agendamento ao ultrapassar cotas mensais, agendar em feriados ou selecionar horários fora da grade do médico.' }
      ]
    },
    {
      version: 'v4.0.2',
      date: '17/08/2026',
      title: 'Módulo Financeiro - Padrão de Rótulos Concisos (1 Palavra) e Vinculação Direta de Centro de Custo',
      description: 'Padronização de todas as tabelas e formulários com rótulos de 1 palavra/termo direto e inclusão do seletor de Centro de Custo (31 centros) no formulário de inclusão/edição de despesas.',
      changes: [
        { type: 'Padrão UI/UX', text: 'Rótulos Concisos de 1 Palavra: Simplificação de todos os cabeçalhos de tabelas e labels de formulários (Fornecedor, Nota Fiscal, Parcela, Centro de Custo, Devido, Pago, Ações, Macroárea, Orçado, Realizado, etc.), eliminando conectivos redundantes e prevenindo truncamento visual.' },
        { type: 'Módulo Financeiro', text: 'Centro de Custo no Contas a Pagar: Inclusão do dropdown de seleção dos 31 Centros de Custo Hospitalares no formulário de Nova/Edição de Despesa, vinculando os lançamentos diretamente à matriz de Orçamento x Realizado.' },
        { type: 'Diretriz de Desenvolvimento', text: 'Regra Fixada no AGENTS.md: Estabelecido o padrão obrigatório de 1 palavra/termo direto para todas as novas interfaces e formulários do sistema.' }
      ]
    },
    {
      version: 'v4.0.1',
      date: '17/08/2026',
      title: 'Módulo Financeiro v4 - Coluna de Ações Sticky, Ocultação de Baixa em Títulos Pagos, Categorias Médicas e Centros de Custo Hospitalares',
      description: 'Grande reformulação de usabilidade e infraestrutura financeira para clínicas especializadas e hospitais: fixação de coluna de ações, categorias médicas especializadas e 31 centros de custo hospitalares estruturados.',
      changes: [
        { type: 'Usabilidade & UX', text: 'Coluna de Ações Fixa (Sticky Right): A coluna "Ações & Baixa" permanece permanentemente visível e fixada à direita da tabela com sombra suave, sem exigir rolagem horizontal até o fim.' },
        { type: 'Usabilidade & UX', text: 'Cabeçalho e Scroll Otimizados: Cabeçalho com fixação superior (Sticky Header) e container com rolagem interna suave e barra visível no campo de visão.' },
        { type: 'Regra de Negócio', text: 'Baixa Inteligente: O botão "Baixar" é automaticamente ocultado para títulos 100% quitados, exibindo "Baixar Saldo" apenas quando houver saldo pendente remanescente.' },
        { type: 'Categorias Médicas', text: 'Catálogo Especializado: Cadastro de 17 novas categorias médicas e hospitalares (MatMed, Medicamentos Clínicos, Concentrados, Dialisadores, Osmose Reversa, Gases Medicinais, Engenharia Clínica, RSS, etc.).' },
        { type: 'Centros de Custo', text: 'Estruturação Hospitalar Completa: 31 centros de custo cadastrados e distribuídos hierarquicamente nas 5 macro áreas (Clínico/Assistencial, Infraestrutura/Hotelaria, RH, Governança/TI e Fiscal/Logística).' }
      ]
    },
    {
      version: 'v3.3.84',
      date: '17/08/2026',
      title: 'Módulo Financeiro - Correção de Escopo em Acumuladores e Blindagem Case-Insensitive',
      description: 'Correção de ReferenceError em acumuladores de totais pagos e blindagem completa da leitura de status de pagamentos.',
      changes: [
        { type: 'Correção Crítica', text: 'Correção de escopo de variável nos acumuladores de redução do FinancePanel (paidAmount e totalPaidRealized).' },
        { type: 'Financeiro', text: 'Normalização no Firestore: 124 lançamentos de débitos atualizados para o status padronizado "Pago".' },
        { type: 'Financeiro', text: 'Blindagem de Cálculos: Implementada função helper isItemPaid insensível a maiúsculas/minúsculas para todos os quadros e relatórios.' },
        { type: 'Painel Operacional', text: 'Correção de Títulos em Atraso e Próximos 7 Dias: Contas e débitos quitados não são mais classificados indevidamente como pendências.' },
        { type: 'Relatórios Contábeis', text: 'DRE, Fluxo Diário e Previsão de Caixa alinhados com o extrato bancário realizado.' }
      ]
    },
    {
      version: 'v3.3.81',
      date: '17/08/2026',
      title: 'Módulo Financeiro - Limpeza Integral da Base de Dados na Nuvem (Reset Geral)',
      description: 'Executada a exclusão em lote de todos os registros legados e fictícios do módulo financeiro no Firestore para início de operação oficial do zero.',
      changes: [
        { type: 'Financeiro', text: 'Limpeza em Nuvem: Exclusão de 985 documentos legados das coleções accounts_payable, accounts_receivable, debts, bank_statements, budget_plans e agreements.' },
        { type: 'Financeiro', text: 'Permissões do Firestore: Atualizadas regras de segurança do Firestore (firestore.rules) para todas as coleções financeiras.' },
        { type: 'Financeiro', text: 'Eliminação de Auto-seeding: Removidos dados fictícios de fallback do mockFirebase para garantir abertura limpa com zero registros.' },
        { type: 'Financeiro', text: 'Saldo Inicial de Caixa: Redefinido padrão de saldo inicial para R$ 0,00 na projeção de fluxo de caixa.' },
        { type: 'Financeiro', text: 'Otimização de Bundle: Removido import de dados estáticos legados, reduzindo o tamanho do pacote em mais de 200 kB.' }
      ]
    },
    {
      version: 'v3.3.79',
      date: '17/08/2026',
      title: 'Módulo NexaHR - Regras Estritas de Presença Premiada & Relatório de Ganhadores com Impressão',
      description: 'Implementação das novas regras de elegibilidade (apenas CLT > 90 dias de contrato e sem advertências/ausências) e emissão de relatório oficial com recibo de assinatura.',
      changes: [
        { type: 'Recursos Humanos', text: 'Regra de Vínculo CLT: Apenas colaboradores contratados sob regime CLT são considerados elegíveis para o bônus.' },
        { type: 'Recursos Humanos', text: 'Carência Contratual (>90 dias): Exclusão automática de colaboradores em período de experiência (até 90 dias de admissão).' },
        { type: 'Recursos Humanos', text: 'Desclassificação por Advertências: Qualquer advertência disciplinar registrada no mês de competência desclassifica o colaborador.' },
        { type: 'Recursos Humanos', text: 'Desclassificação por Faltas: Ausências ou faltas não justificadas no período eliminam a elegibilidade ao prêmio.' },
        { type: 'Recursos Humanos', text: 'Novo Relatório Oficial de Ganhadores: Modal completo com resumo executivo, valor total do investimento e listagem detalhada de contemplados.' },
        { type: 'Recursos Humanos', text: 'Folha de Impressão A4 com Assinaturas: Formatação padronizada para impressão com campo de assinatura para recibo do colaborador e aprovação da gestão.' },
        { type: 'Recursos Humanos', text: 'Exportação em PDF e CSV: Download estruturado via jsPDF e arquivo CSV para integração contábil e de folha de pagamento.' },
        { type: 'Recursos Humanos', text: 'Auditoria de Excluídos: Painel com detalhamento e justificativas transparentes de todas as desclassificações apuradas no mês.' }
      ]
    },
    {
      version: 'v3.3.77',
      date: '17/08/2026',
      title: 'NexaASSIST - Conector Oficial Titan IMAP & Sincronização em Tempo Real',
      description: 'Integração oficial com a caixa de e-mails da Titan para sincronização automática de comunicados assistenciais com IA.',
      changes: [
        { type: 'NexaASSIST & E-mail', text: 'Conexão direta ao servidor IMAP imap.titan.email:993 (SSL) na conta integracao@dialize.com.br.' },
        { type: 'NexaASSIST & E-mail', text: 'Script Python autônomo com sanitização de corpo de e-mail e classificação NLP contínua.' },
        { type: 'NexaASSIST & E-mail', text: 'Botão "Sincronizar Caixa Titan" integrado ao topo do painel assistencial.' },
        { type: 'NexaASSIST & E-mail', text: 'Ingestão e tratamento validado do primeiro comunicado real da equipe assistencial.' }
      ]
    },
    {
      version: 'v3.3.75',
      date: '17/08/2026',
      title: 'Módulo NexaASSIST - Central & Feed Assistencial Inteligente',
      description: 'Lançamento do hub de comunicação rápida com mural de salões, ingestão de e-mails via IA e linha do tempo no prontuário.',
      changes: [
        { type: 'NexaASSIST', text: 'Novo módulo centralizado para comunicados rápidos, internações, altas e intercorrências.' },
        { type: 'NexaASSIST', text: 'Mural de notícias em linha do tempo com filtros inteligentes por Salão (1, 2, 3, DP), Turno e Categoria.' },
        { type: 'NexaASSIST', text: 'Motor de Inteligência Artificial para leitura e estruturação automática da conta espelho de e-mails.' },
        { type: 'NexaASSIST', text: 'Controle de leitura interativo ("Dar Ciente") com histórico de visualizações por profissional.' },
        { type: 'NexaASSIST', text: 'Integração direta com o Prontuário Médico exibindo a Linha do Tempo Assistencial do paciente.' },
        { type: 'NexaASSIST', text: 'Substituição gradual da lista de e-mail assistencia@... para eliminação de sobrecarga nas caixas de 10GB.' }
      ]
    },
    {
      version: 'v3.3.73',
      date: '14/08/2026',
      title: 'Módulo Agenda (NexaCAL) - Encaixes, Horários Flexíveis, Idade Automática e Legenda',
      description: 'Aprimoramentos de agendamento clínico com suporte a múltiplos pacientes no mesmo horário, alerta de encaixe e cálculo de idade.',
      changes: [
        { type: 'Agenda & Recepção', text: 'Consultório padrão definido como "Nenhum" ao criar novos agendamentos.' },
        { type: 'Agenda & Recepção', text: 'Campos de Horário Inicial e Final livres (tipo time) para agendamento em qualquer horário.' },
        { type: 'Agenda & Recepção', text: 'Suporte a múltiplos pacientes no mesmo horário para acomodar encaixes clínicos.' },
        { type: 'Agenda & Recepção', text: 'Alerta inteligente de conflito de horário no modal com opção de confirmar como Encaixe ⚡.' },
        { type: 'Agenda & Recepção', text: 'Data de nascimento no formulário com cálculo automático e dinâmico da idade do paciente.' },
        { type: 'Agenda & Recepção', text: 'Destaque visual exclusivo para atendimentos de Encaixe com badge e cor âmbar.' },
        { type: 'Agenda & Recepção', text: 'Barra de Legenda Explicativa de Cores & Status no topo do painel da agenda.' }
      ]
    },
    {
      version: 'v3.3.71',
      date: '14/08/2026',
      title: 'Módulo NexaCAL (Agenda) - Ativação e Novas Experiências',
      description: 'Upgrade completo da agenda clínica para operação simultânea de múltiplos atendentes com persistência rápida na nuvem.',
      changes: [
        { type: 'Agenda & Recepção', text: 'Cards de KPIs do dia (Total, Confirmados, Aguardando Recepção, Em Consulta e Concluídos).' },
        { type: 'Agenda & Recepção', text: 'Disparo real de confirmações por WhatsApp Web em 1 clique.' },
        { type: 'Agenda & Recepção', text: 'Busca inteligente de pacientes por Nome, CPF e Telefone com auto-complete no modal.' },
        { type: 'Agenda & Recepção', text: 'Modal completo de edição e reagendamento com bloqueio inteligente de conflitos.' },
        { type: 'Agenda & Recepção', text: 'Visualização por salas/consultórios lado a lado e atalho rápido para o dia de Hoje.' }
      ]
    },
    {
      version: 'v3.3.70',
      date: '14/08/2026',
      title: 'Módulo de TI - Gestão Flexível de Perfis de Usuários',
      description: 'Remoção de regras fixas de perfis, permitindo que o Administrador altere e mantenha qualquer perfil livremente.',
      changes: [
        { type: 'Módulo de TI', text: 'Removidas sobreposições fixas em código para perfis de usuários (anacg@nexa.com, jsoares@nexa.com, etc.).' },
        { type: 'Módulo de TI', text: 'Alterações de perfil salvas pelo Administrador agora persistem de forma 100% dinâmica no banco Firestore.' },
        { type: 'Módulo de TI', text: 'Usuárias anacg e jsoares definidas no perfil de Recursos Humanos com liberdade para alteração a qualquer momento.' }
      ]
    },
    {
      version: 'v3.3.69',
      date: '14/08/2026',
      title: 'Módulo SESMT - Correção de Estilização no Dashboard',
      description: 'Correção do erro ReferenceError: styles is not defined ao acessar o painel do SESMT.',
      changes: [
        { type: 'Módulo SESMT', text: 'Restaurados os estilos e seletores de setor no Dashboard do SESMT, normalizando o acesso a todas as abas.' }
      ]
    },
    {
      version: 'v3.3.68',
      date: '14/08/2026',
      title: 'Módulo SESMT - Cadastro Dinâmico de Equipamentos & Monitoramento de Validades',
      description: 'Gestão patrimonial completa de extintores e hidrantes com automação de validades.',
      changes: [
        { type: 'Módulo SESMT', text: 'Criada aba "Cadastro de Equipamentos" para adicionar, editar, inativar e excluir extintores e hidrantes com controle de setor, tipo, capacidade e validades.' },
        { type: 'Módulo SESMT', text: 'Formulários semanais dinâmicos: equipamentos ativos carregam automaticamente com tipo e localização, sem necessidade de digitar validade toda semana.' },
        { type: 'Módulo SESMT', text: 'Monitoramento inteligente de validades no Dashboard cruzando dados cadastrais com alertas de recarga e vencimento.' }
      ]
    },
    {
      version: 'v3.3.67',
      date: '14/08/2026',
      title: 'Módulo SESMT - Histórico de Registros & Seletor de Período no Dashboard',
      description: 'Nova aba de Histórico de Auditorias com visualização detalhada e filtros de período no Dashboard.',
      changes: [
        { type: 'Módulo SESMT', text: 'Desenvolvida a aba "Histórico de Registros" com listagem de checklists de EPI, Extintores e Hidrantes, busca, filtros e modal com a inspeção completa.' },
        { type: 'Módulo SESMT', text: 'Adicionado seletor de períodos no Dashboard (Hoje, 7 dias, Mês Atual, Mês Anterior, Ano e Personalizado) com filtros de setor e turno.' }
      ]
    },
    {
      version: 'v3.3.66',
      date: '14/08/2026',
      title: 'Módulo SESMT - Permissões Cloud Firestore',
      description: 'Liberação de regras de gravação para as inspeções do SESMT.',
      changes: [
        { type: 'Módulo SESMT', text: 'Configuração e deploy das regras de segurança no Firestore para permitir salvar e consultar inspeções de EPI, Extintores e Hidrantes.' }
      ]
    },
    {
      version: 'v3.3.65',
      date: '14/08/2026',
      title: 'Módulo SESMT - Seleção de Turno de Trabalho no Checklist de EPI',
      description: 'Opção para selecionar o turno de trabalho (Manhã / Tarde / Noite) nas inspeções diárias.',
      changes: [
        { type: 'Módulo SESMT', text: 'Inclusão do seletor de Turno de Trabalho (1º Turno - Manhã, 2º Turno - Tarde, 3º Turno - Noite) no cabeçalho do formulário diário de EPI.' }
      ]
    },
    {
      version: 'v3.3.64',
      date: '14/08/2026',
      title: 'Módulo SESMT - Correção de Exibição dos Cabeçalhos',
      description: 'Correção de estilo para visualização nítida dos nomes das colunas.',
      changes: [
        { type: 'Módulo SESMT', text: 'Correção da sobreposição do CSS global nos cabeçalhos das tabelas de extintores e hidrantes, garantindo texto branco nítido sobre fundo navy blue.' }
      ]
    },
    {
      version: 'v3.3.63',
      date: '14/08/2026',
      title: 'Módulo SESMT - Ajuste de Colunas de Extintores',
      description: 'Padronização de todas as colunas da tabela de extintores e inclusão do campo de assinatura.',
      changes: [
        { type: 'Módulo SESMT', text: 'Adicionados e corrigidos os nomes das colunas: N° Extintor, Tipo, Acesso e Visib., Sinalização, Pino, Lacre / anel, Pressurização, Mangueira, Bico, Estado Físico, Validade e Assinatura.' },
        { type: 'Módulo SESMT', text: 'Inclusão do campo de Assinatura individual por extintor e novo visual com alto contraste nos cabeçalhos.' }
      ]
    },
    {
      version: 'v3.3.61',
      date: '12/08/2026',
      title: 'Desmembramento dos Setores de Hemodiálise no SESMT (Salão-1, Salão-2 e Salão-3)',
      description: 'Ajuste na seleção de setores do formulário de Verificação Diária de EPI (NexaSAFE), dividindo o Salão de Hemodiálise em Salão-1, Salão-2 e Salão-3 para maior precisão na auditoria.',
      changes: [
        { type: 'Setores SESMT', text: 'Substituição do setor "Salão Hemodiálise" pelas opções específicas "Salão-1", "Salão-2" e "Salão-3" no formulário de verificação diária de EPI.' },
        { type: 'BI & Indicadores', text: 'Sincronização dos gráficos e relatórios de conformidade por setor no Dashboard do SESMT.' }
      ]
    },
    {
      version: 'v3.3.58',
      date: '12/08/2026',
      title: 'Expansão da Matriz RBAC & Perfis de Permissão (SESMT, Almoxarifado, Manutenção e mais)',
      description: 'Atualização e sincronização da matriz RBAC e seletor de perfis de usuário para incluir SESMT & Segurança do Trabalho, Almoxarifado & Farmácia, Manutenção & Engenharia Clínica, Faturamento & APACs e Compras & Suprimentos.',
      changes: [
        { type: 'Matriz RBAC', text: 'Inclusão do módulo SESMT & Segurança (NexaSAFE) na matriz de permissões por perfil.' },
        { type: 'Perfis de Permissão', text: 'Expansão do seletor de perfis de usuário para cobrir os 10 perfis do sistema (Administrador, Recepção, Clínico, Financeiro, RH, SESMT, Almoxarifado, Manutenção, APACs e Compras).' },
        { type: 'Sincronização Cloud', text: 'Auto-seeding inteligente garantindo a gravação de todos os perfis e suas respectivas permissões na coleção user_profiles no Firestore.' }
      ]
    },
    {
      version: 'v3.3.56',
      date: '12/08/2026',
      title: '4 Modos de Visualização & Busca no Portal de Módulos',
      description: 'Implementação de 4 modos de exibição (Grid Padrão, Lista Detalhada, Lista Compacta e Cards Expandidos) com busca por texto em tempo real no Portal de Módulos.',
      changes: [
        { type: 'Visualizações', text: 'Inclusão dos 4 modos de exibição no seletor de módulos (Grid, Detalhada, Compacta e Expandida), mantendo o Grid como visão padrão.' },
        { type: 'Busca em Tempo Real', text: 'Adicionada barra de pesquisa para filtrar módulos instantaneamente por nome, subtítulo ou descrição.' },
        { type: 'Usabilidade', text: 'Barra de ferramentas superior intuitiva para alteração de layout com 1 clique e resposta responsiva.' }
      ]
    },
    {
      version: 'v3.3.54',
      date: '12/08/2026',
      title: 'Módulo SESMT & Perfil de Acesso para roseannefa',
      description: 'Criação do módulo SESMT & Segurança do Trabalho, perfil RBAC próprio e vinculação da usuária roseannefa.',
      changes: [
        { type: 'Módulo SESMT', text: 'Desenvolvimento do novo portal NexaSAFE (Checklist Diário EPI, Extintores, Hidrantes e BI Dashboard).' },
        { type: 'RBAC / Governança', text: 'Criação do Perfil de Acesso SESMT & Segurança do Trabalho no controle de acessos.' },
        { type: 'Gestão de Usuários', text: 'Cadastro e vinculação da usuária Roseanne Faria (roseannefa@nexa.com) ao perfil SESMT.' }
      ]
    },
    {
      version: 'v3.3.50',
      date: '12/08/2026',
      title: 'Correção de Autenticação e Fallback de Login',
      description: 'Resolução do bloqueio auth/too-many-requests no login.',
      changes: [
        { type: 'Módulo TI', text: 'Implementado fallback de sessão automática prevenindo travamentos por excesso de tentativas.' }
      ]
    },
    {
      version: 'v3.3.48',
      date: '12/08/2026',
      title: 'Restauração de Acesso Financeiro (daliam@nexa.com)',
      description: 'Ajuste de permissões e perfis de usuário no sistema.',
      changes: [
        { type: 'Módulo TI', text: 'Restaurado acesso da usuária Dália Moraes (daliam@nexa.com) ao Módulo Financeiro com perfil de Gestão Financeira.' }
      ]
    },
    {
      version: 'v3.3.46',
      date: '12/08/2026',
      title: 'Atualizações no Módulo Financeiro',
      description: 'Adição de filtro por Mês/Ano no Contas a Pagar e exclusão de notas duplicadas.',
      changes: [
        { type: 'Módulo Financeiro', text: 'Adicionado filtro de Mês/Ano para a visualização padrão de Contas a Pagar.' },
        { type: 'Módulo Financeiro', text: 'Removido botão Limpar Duplicatas, exclusão realizada via script.' }
      ]
    },
    {
      version: 'v3.3.44',
      date: '12/08/2026',
      title: 'Atualizações no Módulo Financeiro',
      description: 'Limpeza de duplicatas, remoção da importação da planilha, troca de coluna para "Número da Nota" e campo de data no registro de baixa.',
      changes: [
        { type: 'Módulo Financeiro', text: 'Adicionado botão para remover registros duplicados importados.' },
        { type: 'Módulo Financeiro', text: 'Botão de importação da planilha de Betim removido.' },
        { type: 'Módulo Financeiro', text: 'Coluna "Filial & Competência" substituída por "Número da Nota".' },
        { type: 'Módulo Financeiro', text: 'Inserido campo "Data do Pagamento" no momento de baixar um título.' }
      ]
    },
    {
      version: 'v3.3.42',
      date: '11/08/2026',
      title: 'Importação Contas a Pagar Betim 2026 (Módulo Financeiro)',
      description: 'Implementada rotina automatizada e anti-duplicidade para importação dos 1.191 registros da planilha de Contas a Pagar (Betim) referente a 2026.',
      changes: [
        { type: 'Módulo Financeiro', text: 'Adicionada importação inteligente JSON via painel financeiro.' }
      ]
    },
    {
      version: 'v3.3.40',
      date: '11/08/2026',
      title: 'Novos Motivos de Advertência no RH (Desídia e Indisciplina)',
      description: 'Inclusão das opções "Desídia" e "Indisciplina" no menu de motivos ao registrar advertências na ficha do colaborador.',
      changes: [
        { type: 'Recursos Humanos', text: 'Adicionados os motivos "Desídia" e "Indisciplina" na seleção de advertências do colaborador.' }
      ]
    },
    {
      version: 'v3.3.39',
      date: '11/08/2026',
      title: 'Ausências de Colaboradores por Dias (Módulo RH)',
      description: 'Atualização na aba de Ausências da ficha do colaborador para contagem e registro de faltas/ausências em Dias Perdidos (em vez de Horas).',
      changes: [
        { type: 'Recursos Humanos', text: 'Alterado o campo "Horas Perdidas" para "Dias Perdidos" na ficha de Ausências do colaborador.' },
        { type: 'Tabela & Widgets', text: 'Coluna da tabela e lista de ausências recentes atualizadas para contabilizar e exibir quantidade de Dias.' }
      ]
    },
    {
      version: 'v3.3.38',
      date: '11/08/2026',
      title: 'Restrição de Perfil Administrador Exclusivo e Ajuste de Usuárias RH',
      description: 'Restrição do perfil de Administrador exclusivamente ao e-mail contato@techcosta.net e fixação do perfil de Recursos Humanos (RH) para as usuárias anacg@nexa.com e jsoares@nexa.com.',
      changes: [
        { type: 'Segurança & RBAC', text: 'Perfil Administrador atribuído e mantido exclusivamente para contato@techcosta.net.' },
        { type: 'Controle de Acesso', text: 'Reconfiguração automática e permanente do perfil das usuárias anacg@nexa.com e jsoares@nexa.com para Recursos Humanos (RH).' },
        { type: 'Módulo TI', text: 'Disponibilização da opção explícita de perfil Recursos Humanos (RH) no gerenciamento de usuários do painel de administração/TI.' }
      ]
    },
    {
      version: 'v3.3.35',
      date: '2026-08-10',
      title: 'Importação Final e Preparo de Futuro',
      description: 'Conclusão da importação de Janeiro e Fevereiro e otimização do módulo HR para projeções futuras.',
      changes: [
        { type: 'Importação', text: 'Importação concluída do histórico completo de Janeiro e Fevereiro de 2026.' },
        { type: 'Otimização', text: 'Otimização do componente HRPanel.jsx para tornar o cálculo do mês de projeção do VT totalmente dinâmico, suportando recargas e cálculos sem limitação de datas hardcoded.' },
        { type: 'Interface', text: 'O seletor de meses de VT agora exibe 24 meses consecutivos a partir de 2026 de forma dinâmica.' }
      ]
    },
    {
      version: '3.3.34',
      date: '10/08/2026',
      title: 'Importação do Histórico de Março/2026 e Abril/2026 de Vale-Transporte',
      description: 'Leitura e cadastramento completo dos relatórios de VT de Março/2026 e Abril/2026, cobrindo o histórico semestral completo no RH.',
      changes: [
        { type: 'Base Histórica', text: 'Cadastramento de todos os colaboradores e recargas dos períodos de Março/2026 e Abril/2026.' },
        { type: 'Navegação Temporal', text: 'Inclusão de Março/2026 e Abril/2026 no seletor de períodos do painel de Vale-Transporte.' }
      ]
    },
    {
      version: '3.3.33',
      date: '10/08/2026',
      title: 'Importação de Vale-Transporte dos Meses Anteriores (Junho/2026 e Maio/2026)',
      description: 'Processamento e importação dos relatórios oficiais de VT de Junho/2026 e Maio/2026 com mais de 80 colaboradores por período.',
      changes: [
        { type: 'Histórico Completo', text: 'Importação integral das planilhas de Junho/2026 e Maio/2026 com tarifas de ida/volta, saldos em cartão e recargas.' },
        { type: 'Seletor de Períodos', text: 'Opções de consulta estendidas no Mês/Ano incluindo Maio/2026, Junho/2026, Julho/2026 e Agosto/2026.' }
      ]
    },
    {
      version: '3.3.31',
      date: '10/08/2026',
      title: 'Importação Oficial de Vale-Transporte (Agosto/2026 - 67 Colaboradores) & Projeção Futura',
      description: 'Leitura e importação completa da planilha de Agosto/2026 com 67 colaboradores, destaques visuais de saldo e ferramenta de projeção para meses futuros.',
      changes: [
        { type: 'Importação', text: 'Importação rigorosa de 67 colaboradores com valores de Ida, Volta, Total Dia, Escala (2ªa6ª, Seg-Sáb, 12x36), Previsto, Saldo 01/08 e Recarga Necessária.' },
        { type: 'Sincronização RH', text: 'Vinculação automática de todos os colaboradores com o cadastro central de funcionários do módulo RH.' },
        { type: 'Visualização & Cores', text: 'Destaque em Laranja para Concessões Especiais, Amarelo para Saldo Excedente e Vermelho para Saldo Negativo/Ajustar.' },
        { type: 'Projeção & Exportação', text: 'Ferramenta de projeção automatizada para meses seguintes e exportação do relatório de recarga em formato CSV.' }
      ]
    },
    {
      version: '3.3.28',
      date: '10/08/2026',
      title: 'Atualização e Importação de Vale-Transporte (Módulo RH)',
      description: 'Adicionados novos campos no painel de Vale-Transporte e realizada a importação da planilha de Julho de 2026.',
      changes: [
        { type: 'Novos Campos', text: 'Adicionados os campos Custo Ida, Custo Volta, Escala, Saldo Atual e Recarga Necessária no formulário e listagem.' },
        { type: 'Importação', text: 'Criação de script para processar e importar os dados da planilha de Vale-Transporte para o banco de dados.' }
      ]
    },
    {
      version: '3.3.26',
      date: '08/08/2026',
      title: 'Modos de Visualização (Compacto, Normal, Card) e Limpeza de Setores',
      description: 'Adicionado seletor de modo de exibição nas abas e padronização da lista de setores.',
      changes: [
        { type: 'Visualização', text: 'Opções de visualização em modo Compacto (Padrão), Normal e Card para Ordens de Serviço, Equipamentos e Cronograma.' },
        { type: 'Setores', text: 'Remoção de Salão A/B/C da lista padrão de setores para uso dos Salões 1, 2 e 3.' }
      ]
    },
    {
      version: '3.3.25',
      date: '08/08/2026',
      title: 'Seletor de Setor e Localização de Equipamentos',
      description: 'Opções padronizadas de localização (Salão-1, Salão-2, Salão-3, etc) com suporte a setores personalizados.',
      changes: [
        { type: 'Formulário', text: 'Adicionado menu suspenso de setores contendo Salão-1, Salão-2, Salão-3, Salão A/B/C, Tratamento de Água, Reúso, CME, Enfermagem e opção de setor personalizado.' },
        { type: 'Praticidade', text: 'Integração dinâmica dos setores existentes no sistema às opções selecionáveis.' }
      ]
    },
    {
      version: '3.3.24',
      date: '08/08/2026',
      title: 'Expurgo Automático de Ativos de TI Legados',
      description: 'Limpeza automática e sanitização de cache local (localStorage) e banco contra equipamentos de TI antigos.',
      changes: [
        { type: 'Sanitização de Dados', text: 'Filtragem automática em tempo de execução para eliminar de forma definitiva Servidores Dell, Impressoras Zebra e itens de TI remanescentes em navegadores.' }
      ]
    },
    {
      version: '3.3.23',
      date: '08/08/2026',
      title: 'Varredura Completa de T.I. no Módulo de Manutenção',
      description: 'Remoção minuciosa de todas as menções, opções, exemplos e textos referentes a Tecnologia da Informação.',
      changes: [
        { type: 'Limpeza Geral', text: 'Remoção de opções de formulário (Hardware/Software/Computador/Monitor), exemplos (Servidor Dell, Data Center) e textos da Navbar, Seletor de Módulos e Painel.' },
        { type: 'Engenharia Clínica', text: 'Módulo 100% focado na gestão de equipamentos biomédicos e prediais da clínica.' }
      ]
    },
    {
      version: '3.3.21',
      date: '08/08/2026',
      title: 'Remoção de T.I. do Módulo de Manutenção',
      description: 'Limpeza de escopo e remoção de todos os recursos de TI para focar exclusivamente na Manutenção Clínica/Predial.',
      changes: [
        { type: 'Limpeza de Escopo', text: 'Remoção completa de referências, KPIs e categorias de Tecnologia da Informação (TI) da tela de Manutenção.' },
        { type: 'Base de Dados', text: 'Exclusão de equipamentos simulados de hardware/software de TI e suas respectivas Ordens de Serviço do banco inicial.' },
        { type: 'Permissões', text: 'Ajuste no controle de acesso, centralizando o módulo apenas para cargos de administração e engenharia/manutenção.' }
      ]
    },
    {
      version: '3.3.20',
      date: '08/08/2026',
      title: 'Módulo de Manutenção - Carga de Máquinas de Hemodiálise e Osmose',
      description: 'Análise, desduplicação e cadastro completo de 112 máquinas de hemodiálise Nipro Diamax 220F e unidades de Osmose Portátil no Módulo de Manutenção.',
      changes: [
        { type: 'Equipamentos', text: 'Carga completa de 105 Máquinas de Hemodiálise Nipro Diamax 220F com número de série, salão, ponto de atendimento e histórico unificado de coleta de dialisato (2025 e 2026).' },
        { type: 'Tratamento de Água', text: 'Cadastro de 7 unidades de Osmose Portátil para diálise externa (Deltamed, Ipabras e Vexer).' },
        { type: 'Desduplicação', text: 'Cruzamento e consolidação de dados dos cronogramas 2025 e 2026 com remoção automática de registros duplicados por número de série.' }
      ]
    },
    {
      version: '3.3.16',
      date: '08/08/2026',
      title: 'Desbloqueio de Lançamento BI',
      description: 'Ajuste nas permissões de acesso ao módulo de BI.',
      changes: [
        { type: 'Acessibilidade', text: 'Liberação de acesso: A página de Upload/Lançamento de Dados no módulo de BI foi liberada novamente para todos os perfis, permitindo que todos os setores insiram os dados de seus indicadores.' }
      ]
    },
    {
      version: '3.3.15',
      date: '08/08/2026',
      title: 'Restrição de Acesso e Impressão BI',
      description: 'Aprimoramentos de segurança e usabilidade no módulo de BI.',
      changes: [
        { type: 'Segurança', text: 'Restrição de acesso: Apenas administradores podem lançar dados e acessar a página de Upload no módulo de BI.' },
        { type: 'Recursos', text: 'Nova funcionalidade: Opção de impressão de gráficos de indicadores em formatos retrato e paisagem.' }
      ]
    },
    {
      version: '3.3.14',
      date: '08/08/2026',
      title: 'Ajuste de Prioridade RBAC',
      description: 'Correção na hierarquia de exibição de módulos baseada em permissões.',
      changes: [
        { type: 'RBAC', text: 'A configuração do RBAC (Perfis & Permissões) agora sobrepõe o limite antigo de setores do usuário, resolvendo a exibição correta dos módulos para a equipe multiprofissional e novos usuários.' }
      ]
    },
    {
      version: 'v3.3.13',
      date: '08 de Agosto, 2026',
      title: 'Ajuste Crítico de Autenticação e Perfil',
      description: 'Correções focadas na estabilidade do acesso e sincronização do perfil do usuário.',
      changes: [
        { type: 'Autenticação', text: 'Redefinição forçada de senha para usuário específico diretamente no Firebase Auth e Firestore.' },
        { type: 'Sincronização', text: 'Correção no retorno do objeto de usuário no Login para garantir carregamento imediato do perfil (módulos e nome).' }
      ]
    },
    {
      version: 'v3.3.9',
      date: '08 de Agosto, 2026',
      title: 'Sincronização e Fallback de Senhas de Login Multi-Dispositivo',
      description: 'Implementação de persistência local para garantir o acesso quando o cache do Firebase não sincroniza a nova senha de imediato em outros computadores.',
      changes: [
        { type: 'Fallback Inteligente', text: 'Persistência local da sessão (localStorage) quando a autenticação nativa do Firebase falha por dessincronização de senha (ex: senhas temporárias ou atualizações manuais no painel T.I).' },
        { type: 'Auto-Healing', text: 'O sistema tenta ativamente reconectar com senhas padrões antigas e, se bem-sucedido, sincroniza e atualiza automaticamente a conta no Firebase Auth com a nova senha gravada na nuvem.' }
      ]
    },
    {
      version: 'v3.3.7',
      date: '08 de Agosto, 2026',
      title: 'Correção Definitiva: Busca por E-mail ou UID na Gravação de Senha Cloud',
      description: 'Gravador de senha no Firestore ajustado para localizar e atualizar o documento por e-mail ou UID, garantindo atualização em 100% dos usuários.',
      changes: [
        { type: 'Persistência Cloud', text: 'Gravação resiliente de senhas no Firestore com `merge: true` vinculando por e-mail e UID do usuário.' },
        { type: 'Autenticação Universal', text: 'Liberada a autenticação universal entre múltiplos navegadores para senhas editadas ou temporárias.' }
      ]
    },
    {
      version: 'v3.0.14',
      date: '06 de Agosto, 2026',
      title: 'Resiliência de Login do Operador Daliam',
      description: 'Rotina com verificação inteligente de senhas para o login daliam@nexa.com.',
      changes: [
        { type: 'Autenticação', text: 'Permite login com dalia123, Daliam1234! ou daliam123.' }
      ]
    },
    {
      version: 'v3.0.13',
      date: '06 de Agosto, 2026',
      title: 'Ajuste de Senha do Usuário Daliam',
      description: 'Configuração da credencial daliam@nexa.com para a senha dalia123.',
      changes: [
        { type: 'Autenticação', text: 'Definição da senha dalia123 para o operador daliam@nexa.com.' }
      ]
    },
    {
      version: 'v3.0.12',
      date: '06 de Agosto, 2026',
      title: 'Resiliência no Cadastro de Usuários (E-mail Existente)',
      description: 'Sincronização automática e tratamento amigável caso o login já esteja registrado na autenticação.',
      changes: [
        { type: 'Autenticação', text: 'Captura graciosa de auth/email-already-in-use com atualização do perfil no Firestore.' }
      ]
    },
    {
      version: 'v3.0.11',
      date: '06 de Agosto, 2026',
      title: 'Correção no Cadastro de Usuários (Firebase Config)',
      description: 'Correção da importação das configurações do Firebase que impedia a criação de novos acessos de usuários.',
      changes: [
        { type: 'Autenticação', text: 'Exportação e vinculação do objeto firebaseConfig no serviço de criação de contas.' }
      ]
    },
    {
      version: 'v3.0.10',
      date: '06 de Agosto, 2026',
      title: 'Módulo de T.I. - Matriz RBAC Completa com 11 Módulos',
      description: 'Expansão da matriz de permissões de acesso por perfil no painel NexaCONFIG para cobrir 100% dos módulos do sistema.',
      changes: [
        { type: 'Matriz RBAC', text: 'Adicionadas as colunas de Agenda & Consultas, Compras & Cotações e APACs & Faturamento.' },
        { type: 'Segurança T.I.', text: 'Controle de Leitura, Escrita e Bloqueado dinâmico para todos os 11 portais do NexaCLINIC.' }
      ]
    },
    {
      version: 'v3.0.9',
      date: '06 de Agosto, 2026',
      title: 'Correção de Exibição na Aba DRE Gerencial',
      description: 'Correção de importação do ícone de atividade que causava exceção de runtime ao clicar no DRE.',
      changes: [
        { type: 'Correção DRE', text: 'Inclusão do ícone Activity do lucide-react em FinancePanel.jsx.' }
      ]
    },
    {
      version: 'v3.0.8',
      date: '06 de Agosto, 2026',
      title: 'Módulo Financeiro (Parte 3) - Ampliação Cadastral e DRE Gerencial',
      description: 'Criação da aba DRE Gerencial (Demonstração do Resultado do Exercício) e expansão cadastral com Meio de Pagamento, Banco/Conta e Natureza de Custos.',
      changes: [
        { type: 'DRE Gerencial', text: 'Estrutura completa com Receita Bruta, Impostos, Margem de Contribuição, Custos Fixos, EBITDA e Lucro Líquido.' },
        { type: 'Ampliação Cadastral', text: 'Novos campos para Meio de Pagamento (PIX, Boleto, Cartões, TED), Banco/Conta e Custo Fixo vs Variável.' },
        { type: 'Badges em Tabela', text: 'Exibição visual do meio de pagamento e número do documento nos lançamentos de Pagar e Receber.' }
      ]
    },
    {
      version: 'v3.0.7',
      date: '06 de Agosto, 2026',
      title: 'Módulo Financeiro (Parte 2) - Auto-ordenação Dinâmica por Colunas',
      description: 'Implementação do recurso de auto-ordenação interativa ao clicar no cabeçalho (▲/▼) de todas as tabelas e visões do módulo financeiro.',
      changes: [
        { type: 'Orçamento X Realizado', text: 'Ordenação por Centro de Custos, Orçado, Pago, Devido, Desvio R$, Execução % e Status.' },
        { type: 'Acordos & Renegociações', text: 'Ordenação por Fornecedor, Filial, Total Renegociado, Parcelamento e Status.' },
        { type: 'Conciliação Bancária', text: 'Ordenação por Data Extrato, Banco, Descrição, Tipo, Valor e Status.' },
        { type: 'Projeção Saldo Fluxo', text: 'Ordenação por Mês Competência, Total Devido, Pago e Saldo Fluxo Acumulado.' }
      ]
    },
    {
      version: 'v3.0.6',
      date: '06 de Agosto, 2026',
      title: 'Módulo Financeiro (Parte 1) - Botões de Ação e Gestão Completa',
      description: 'Implementação das funcionalidades de Criar, Editar, Excluir e Ajustar Saldo Inicial de Caixa nas abas de Orçamento, Acordos, Projeção de Caixa e Conciliação Bancária.',
      changes: [
        { type: 'Orçamento X Realizado', text: 'Opções de edição e exclusão de metas orçamentárias na matriz por centro de custos.' },
        { type: 'Acordos & Renegociações', text: 'Adicionados botões de edição e exclusão de acordos faturados com fornecedores.' },
        { type: 'Projeção Saldo Fluxo', text: 'Modal de ajuste de Saldo Inicial de Caixa para cálculo de liquidez acumulada.' },
        { type: 'Conciliação Bancária', text: 'Formulário de Novo Lançamento Manual no extrato, remoção de itens e desfazer conciliação.' }
      ]
    },
    {
      version: 'v3.0.5',
      date: '06 de Agosto, 2026',
      title: 'Correção de Fuso Horário nas Datas de Nascimento dos Dependentes',
      description: 'Correção da formatação de data no módulo de Recursos Humanos para tratar strings YYYY-MM-DD sem distorção por fuso horário UTC (GMT-3), resolvendo a exibição incorreta do dia de nascimento dos dependentes.',
      changes: [
        { type: 'Recursos Humanos', text: 'Implementada formatação segura de datas (formatDateBR), garantindo a exibição exata de nascimentos de dependentes e histórico do RH.' },
        { type: 'Banco de Dados', text: 'Integridade confirmada de todas as datas gravadas no Cloud Firestore.' }
      ]
    },
    {
      version: 'v3.0.2',
      date: '05 de Agosto, 2026',
      title: 'Ajuste de Interface & Simplificação de UX',
      description: 'Remoção da barra superior de seleção de filial e botão de importação, preparando o módulo para o modelo de tenants e deixando a interface mais limpa.',
      changes: [
        { type: 'Interface & UX', text: 'Removida a barra superior de filiais/importação e reorganizado o cabeçalho de abas financeiras.' }
      ]
    },
    {
      version: 'v3.0.1',
      date: '05 de Agosto, 2026',
      title: '🚀 Lançamento Major: Módulos NexaBUDGET, Centro de Custos & Integração Betim',
      description: 'Salto de versão para v3.0.1 simbolizando os novos módulos de Orçamento X Realizado, Centro de Custos, Projeção de Liquidez do Saldo Fluxo e Gestão de Acordos.',
      changes: [
        { type: 'Orçamento X Realizado', text: 'Matriz comparativa de metas vs gastos executados por centro de custos com badges visuais de variância (🟢/🟡/🔴).' },
        { type: 'Preenchimento Betim', text: 'Povoamento automático dos 32 lançamentos de Contas a Pagar de Betim em todas as tabelas e relatórios.' },
        { type: 'Saldo Fluxo', text: 'Tabela e curva de liquidez acumulada (Jun/25 a Ago/26) com diagnóstico do rombo financeiro e botão de simulação de baixas.' },
        { type: 'Acordos & Renegociações', text: 'Gestão de passivos em parcelas de longo prazo (ex: Lacerda Alimentação, Farmarin).' },
        { type: 'Sistema Integrado', text: 'Automatização do vínculo do Centro de Custos 1.1 Insumos Dialíticos e Filial Betim nas aprovações de ordens de compra.' }
      ]
    },

    {
      version: 'v2.1.39',
      date: '03 de Agosto, 2026',

      title: 'Solução Definitiva para Tela Branca no Estoque',
      description: 'Implementação de salvaguardas no processamento de dados do módulo de Estoque para impedir crashes quando houver falha de sincronização ou dados nulos vindos do servidor.',
      changes: [
        { type: 'Módulo Estoque', text: 'Adição de verificações seguras (Optional Chaining) em todas as abas, garantindo que mesmo itens corrompidos no banco não causem a "Tela Branca".' },
        { type: 'Sistema Base', text: 'Refatoração da rotina de ordenação das tabelas de listagens do painel de almoxarifado.' }
      ]
    },
    {
      version: 'v2.1.37',
      date: '03 de Agosto, 2026',
      title: 'Arquitetura de Lazy Loading no Estoque & Reorganização de Abas',
      description: 'Transferência das abas de Setores para T.I e Fornecedores para Compras, além do carregamento de dados sob demanda para eliminar telas brancas.',
      changes: [
        { type: 'Módulo T.I', text: 'Gestão completa de Setores de Estoque e Almoxarifados integrada ao ConfigPanel.' },
        { type: 'Módulo Compras', text: 'Aba dedicada ao Cadastro e Edição de Fornecedores integrada ao fluxo de compras.' },
        { type: 'Módulo Estoque', text: 'Carregamento Lazy Loading por aba e limitação de memória no Histórico para eliminar crashes de tela branca.' }
      ]
    },
    {
      version: 'v2.1.35',
      date: '02 de Agosto, 2026',
      title: 'Proteção Defensiva Completa no Módulo de Estoque',
      description: 'Adicionada blindagem contra retornos assíncronos em segundo plano e opcional chaining em todas as abas e métricas do estoque.',
      changes: [
        { type: 'Módulo Estoque', text: 'Proteção contra exceções em dados de requisições, transferências e itens do estoque.' }
      ]
    },
    {
      version: 'v2.1.33',
      date: '02 de Agosto, 2026',
      title: 'Resolução Definitiva de Importação de Ícones (FileText)',
      description: 'Adicionada importação explícita do ícone FileText no ModuleSelector prevenindo ReferenceError.',
      changes: [
        { type: 'Seletor de Módulos', text: 'Importado FileText do pacote lucide-react eliminando travamento no carregamento do portal.' }
      ]
    },
    {
      version: 'v2.1.31',
      date: '02 de Agosto, 2026',
      title: 'Correção de Segurança e Renderização no Seletor de Módulos',
      description: 'Adicionada trava de segurança contra ausência de ícones ou permissões RBAC no portal de seleção de módulos.',
      changes: [
        { type: 'Portal de Módulos', text: 'Prevenção de exceção e tela branca ao listar o novo módulo APACs & Faturamento para perfis de acesso restrito.' }
      ]
    },
    {
      version: 'v2.1.29',
      date: '02 de Agosto, 2026',
      title: 'Módulo Exclusivo NexaAPAC & Cards Clicáveis do Dashboard Financeiro',
      description: 'Criação do módulo independente para Faturamento e APACs (NexaAPAC) e transformação de todos os cards KPI em botões interativos para exibição de detalhes completos.',
      changes: [
        { type: 'Módulo NexaAPAC', text: 'Módulo dedicado para auditoria de APACs, controle de renovação, gestão de glosas e exportação de remessas BPA/APAC.' },
        { type: 'Módulo Financeiro', text: 'Removida a aba antiga de APACs e implementado modal interativo de detalhamento em cada card KPI do Dashboard.' }
      ]
    },
    {
      version: 'v2.1.27',
      date: '02 de Agosto, 2026',
      title: 'Proteção Total contra Tela Branca nas Abas Catálogo e Entrada de Notas',
      description: 'Blindagem completa no tratamento de propriedades e conversões numéricas/datas para evitar travamento de renderização no módulo de Estoque.',
      changes: [
        { type: 'Módulo Estoque (Catálogo)', text: 'Adicionada verificação contra registros nulos ou incompletos na lista de insumos e no filtro de busca.' },
        { type: 'Módulo Estoque (Entrada de Notas)', text: 'Adicionado tratamento defensivo na formatação de valores totais e datas de emissão/entrada das notas fiscais.' }
      ]
    },
    {
      version: 'v2.1.25',
      date: '02 de Agosto, 2026',
      title: 'Mapeamento de KPIs no Estoque & Correções contra Tela Branca',
      description: 'Painel de cards resumo de requisições incluído na aba "Atendimento de Requisições" do Estoque e aplicadas travas de segurança contra formatação de datas inválidas.',
      changes: [
        { type: 'Módulo Estoque & Farmácia', text: 'Adicionados os 4 cards KPI (Total de Pedidos, Pendentes, Entregas Parciais e Atendidos) no topo da aba Atendimento de Requisições do Estoque.' },
        { type: 'Resiliência & Segurança', text: 'Prevenção contra tela branca (NaN date parsing) em tabelas de requisições, histórico de movimentações e controle de validade do Estoque.' }
      ]
    },
    {
      version: 'v2.1.24',
      date: '02 de Agosto, 2026',
      title: 'Melhorias no Módulo de Recursos Humanos (RH) e Vale-Transporte',
      description: 'Ajuste de valor padrão da Presença Premiada para R$ 100,00, rolagem responsiva no modal de Vale-Transporte e adição de funcionalidade e campos para registro de demissão/desligamento de funcionários.',
      changes: [
        { type: 'Recursos Humanos', text: 'Presença Premiada configurada com valor padrão inicial de R$ 100,00.' },
        { type: 'Usabilidade & UX', text: 'Modal de Nova Concessão de Vale-Transporte atualizado com rolagem interna (maxHeight: 80vh) garantindo visualização completa dos botões de confirmação e cancelamento.' },
        { type: 'Recursos Humanos', text: 'Inclusão da opção de Demissão/Desligamento de funcionários com campo de data de saída, status inativo e atalho rápido de ação.' }
      ]
    },
    {
      version: 'v2.1.23',
      date: '01 de Agosto, 2026',
      title: 'Correção de Permissões Firestore e Restauração de Dados',
      description: 'Resolvido o problema de tela em branco nos módulos Estoque, Compras e RH, e corrigido o carregamento de dados (funcionários, usuários) que haviam sumido devido a bloqueios de segurança nas regras do Firestore.',
      changes: [
        { type: 'Correção Crítica', text: 'Correção das regras de segurança (firestore.rules) garantindo leitura e gravação para todas as coleções de retaguarda (estoque, financeiro, RH, etc).' },
        { type: 'Correção de Renderização', text: 'Resolução de erro de execução (TypeError) no dbService que causava tela branca (crash) na montagem dos módulos principais.' }
      ]
    },
    {
      version: 'v2.1.20',
      date: '01 de Agosto, 2026',
      title: 'Restaurado Cadastro de Funcionários e Usuários + Estabilização Módulos',
      description: 'Garantida a persistência e semeadura automática de funcionários e usuários administradores (Ana Carolina, J. Soares e TechCosta) no Firestore Cloud e Mock, além do repasse global da prop currentUser para todas as telas.',
      changes: [
        { type: 'Recuperação de Dados', text: 'Recuperado cadastro padrão e persistência de funcionários (supervisão, médicos e equipe) e usuários de acesso.' },
        { type: 'Correção de Módulos', text: 'Eliminada a tela branca nos módulos de Estoque, Compras, RH, Financeiro e Configurações com repasse global de prop do usuário logado.' }
      ]
    },
    {
      version: 'v2.1.16',
      date: '01 de Agosto, 2026',
      title: 'Correção nos Módulos de Compras, Estoque e RH',
      description: 'Resolvido o problema de tela branca ao acessar os módulos de Compras, Estoque e RH por meio do repasse correto de props do usuário e tratamento de exceções assíncronas nas requisições.',
      changes: [
        { type: 'Correção de Renderização', text: 'Resolução da duplicidade de declarações de escopo e repasse de prop currentUser para os componentes StockPanel, HRPanel e PurchasingPanel.' },
        { type: 'Tratamento de Erros', text: 'Proteção com blocos try/catch e retornos seguros de listas em chamadas do Firestore para evitar falhas de renderização.' }
      ]
    },
    {
      version: 'v2.1.14',
      date: '01 de Agosto, 2026',
      title: 'Restauração Total de Permissões e Acessos Admin',
      description: 'Garantido o sincronismo de perfis e permissões completas de Administrador (role admin + todos os setores) para as contas principais (contato@techcosta.net, anacg@nexa.com e jsoares@nexa.com).',
      changes: [
        { type: 'Autenticação & RBAC', text: 'Sincronização automática em onAuthChange do Firestore para contas de Administrador, liberando todos os módulos e setores do sistema.' },
        { type: 'Correção de Bug', text: 'Resolução da regressão que desatribuía o papel de Admin após a autenticação via Firebase Real.' }
      ]
    },
    {
      version: 'v2.1.10',
      date: '01 de Agosto, 2026',
      title: 'Migração para TypeScript & Tipagem de Serviços',
      description: 'Início da transição da base de código para TypeScript, visando maior segurança, autocompletar e robustez nas chamadas de serviço.',
      changes: [
        { type: 'Arquitetura', text: 'Configuração do ambiente TypeScript (tsconfig.json, types) e definição de interfaces globais.' },
        { type: 'Refatoração', text: 'Migração do hrService.ts para TypeScript com tipagem completa de parâmetros e retornos.' }
      ]
    },
    {
      version: 'v2.1.6',
      date: '01 de Agosto, 2026',
      title: 'Modularização de Componentes UI (Prioridade 2)',
      description: 'Refatoração dos componentes gigantes (StockPanel.jsx e HRPanel.jsx) extraindo toda a lógica de negócio e estados para Custom Hooks dedicados.',
      changes: [
        { type: 'Custom Hooks', text: 'Criação de useStockLogic.js e useHRLogic.js, separando mais de 2.000 linhas de regras de negócio da camada visual.' },
        { type: 'Desempenho', text: 'Melhoria significativa na manutenção e previsibilidade dos estados, preparando para a tipagem (TypeScript).' }
      ]
    },
    {
      version: 'v2.1.5',
      date: '01 de Agosto, 2026',
      title: 'Refatoração da Arquitetura de Dados (Modularização firebase.js)',
      description: 'Iniciada a refatoração do sistema para melhoria de performance e manutenção, decompondo o arquivo central de dados em múltiplos serviços especializados.',
      changes: [
        { type: 'Modularização de Serviços', text: 'firebase.js (2.016 linhas) desmembrado em authService, patientService, stockService, financialService, hrService, clinicalService e systemService.' },
        { type: 'Segurança Firebase', text: 'Configurações de ambiente movidas para .env com validações rigorosas e política reforçada para senhas temporárias (Adm/RH).' },
        { type: 'Desempenho', text: 'Melhoria na divisão de código (code splitting) e manutenção estrutural do projeto.' }
      ]
    },
    {
      version: 'v2.1.3',
      date: '31 de Julho, 2026',
      title: 'Módulo Estoque & Farmácia: Inventários Físicos, Múltiplos Locais, Transferências & FEFO',
      description: 'Lançamento da aba de Inventários Físicos com relatório de divergências e ajuste automático de saldos, cadastro de Múltiplos Locais de Estoque em T.I, Transferências entre locais e controle FEFO.',
      changes: [
        { type: 'Inventários Físicos', text: 'Abertura, digitação e salvamento de contagens físicas por local de armazenamento.' },
        { type: 'Ajuste Automático de Saldo', text: 'Cálculo de sobra/falta com impacto financeiro R$ e ajuste instantâneo dos saldos em nuvem (Firestore).' },
        { type: 'Múltiplos Locais (T.I)', text: 'Cadastro e gestão de locais de estoque (Almoxarifado Central, Farmácia Diálise, Enfermagem) nas configurações de T.I.' },
        { type: 'Transferências Internas', text: 'Movimentação de produtos entre locais com débito no local de origem e crédito no destino.' },
        { type: 'Lote & FEFO', text: 'Destaque visual dos lotes com vencimento mais próximo para priorização de consumo.' }
      ]
    },
    {
      version: 'v2.1.1',
      date: '31 de Julho, 2026',
      title: 'Portal de Requisições de Salão (Enfermagem), Atendimento na Farmácia & Trava de Estoque em T.I',
      description: 'Lançamento do mini-módulo de requisições para técnicas de enfermagem no salão de hemodiálise, nova aba de atendimento na farmácia com baixa em tempo real e trava de estoque configurável em T.I.',
      changes: [
        { type: 'Mini-Módulo Técnicas', text: 'Novo portal dedicado no Menu Principal para requisição ágil de materiais e medicamentos do salão com vínculo a pacientes da Recepção.' },
        { type: 'Aba Atendimento Farmácia', text: 'Nova aba no Estoque/Farmácia para separar pedidos e efetuar a baixa instantânea e online no estoque físico.' },
        { type: 'Trava de Estoque T.I', text: 'Parâmetro configurável em T.I. (ON/OFF) para bloquear requisições de produtos sem estoque disponível.' },
        { type: 'Auditoria Completa', text: 'Registro detalhado de criação, edição, exclusão e atendimento de requisições no Log de T.I.' }
      ]
    },
    {
      version: 'v2.0.6',
      date: '30 de Julho, 2026',
      title: 'Melhorias de Estoque/Farmácia & Categorias Centralizadas no T.I',
      description: 'Ordenação de colunas em todas as abas do estoque, CRUD completo para itens, fornecedores e setores, nova aba de Empréstimos de Produtos e cadastro de Categorias centralizado no Módulo de T.I.',
      changes: [
        { type: 'Ordenação no Estoque', text: 'Ordenação por clique em todas as tabelas e colunas do módulo de Estoque/Farmácia.' },
        { type: 'CRUD Completo', text: 'Adicionada edição e exclusão de itens, fornecedores e setores de estoque.' },
        { type: 'Empréstimos de Produtos', text: 'Controle completo de empréstimos concedidos e recebidos entre clínicas parceiras com botão de devolução rápida.' },
        { type: 'Centralização T.I', text: 'Gerenciamento de categorias de produtos transferido para as configurações do Módulo de T.I.' }
      ]
    },
    {
      version: 'v2.0.5',
      date: '30 de Julho, 2026',
      title: 'Melhorias de Operação e UX no Módulo Financeiro',
      description: 'Inclusão de ordenação por clique de colunas, novos quadros de previsão de Contas a Pagar (7 e 15 dias), edição e baixa completa de lançamentos e transferência exclusiva da importação XML para o Estoque.',
      changes: [
        { type: 'Ordenação de Colunas', text: 'Permite ordenar por clique todas as colunas de Contas a Pagar, Receber e Dívidas.' },
        { type: 'Previsão de Caixa', text: 'Quadros de Contas a Pagar nos Próximos 7 Dias e 15 Dias no Dashboard.' },
        { type: 'Ações Financeiras', text: 'Inclusão de Edição, Criação Manual, Exclusão e Baixa/Quitação para todos os títulos.' },
        { type: 'Arquitetura', text: 'Removida importação de XML do Financeiro, mantendo atribuição exclusiva no Módulo de Estoque.' }
      ]
    },
    {
      version: 'v2.0.4',
      date: '30 de Julho, 2026',
      title: 'Auditoria de Segurança e Persistência Cloud Firestore',
      description: 'Garantida a integração total com o Google Cloud Firestore para gravação em nuvem nos módulos RH, T.I, Financeiro, Compras e Estoque, com tratamentos de segurança e resiliência.',
      changes: [
        { type: 'Persistência Nuvem', text: 'Persistência no Cloud Firestore configurada para todas as tabelas financeiras, dívidas e conciliação bancária.' },
        { type: 'Segurança & Resiliência', text: 'Tratamento de exceções defensivas (try/catch) para evitar tela branca em falhas de rede.' }
      ]
    },
    {
      version: 'v2.0.3',
      date: '30 de Julho, 2026',
      title: 'Gestão de Parcelamentos, Dívidas e Conciliação Bancária',
      description: 'Lançamento de duas novas abas completas no Módulo Financeiro: Gestão de Contratos de Dívidas com geração automática mês a mês no Contas a Pagar e Conciliação Bancária com relatório de divergências.',
      changes: [
        { type: 'Parcelamentos & Dívidas', text: 'Cadastro de dívidas/financiamentos que gera automaticamente parcelas mês a mês no Contas a Pagar.' },
        { type: 'Conciliação Bancária', text: 'Cruzamento entre Extrato Bancário e Financeiro com relatório de divergências e botão Conciliar 1-Clique.' }
      ]
    },
    {
      version: 'v2.0.2',
      date: '30 de Julho, 2026',
      title: 'Correção de Carregamento nos Módulos Financeiro e Estoque',
      description: 'Resolução completa do problema de tela branca ao acessar os módulos Financeiro e Estoque, com inicialização defensiva e métricas validadas.',
      changes: [
        { type: 'Correção de Exceção', text: 'Inseridas variáveis de cálculo de métricas operacionais no escopo do Financeiro.' },
        { type: 'Resiliência de Dados', text: 'Inclusão de tratamentos defensivos contra falhas de conexão ou documentos pendentes.' }
      ]
    },
    {
      version: 'v2.0.1',
      date: '30 de Julho, 2026',
      title: 'Lançamento da Versão 2.0.1 - Painel Financeiro Operacional Personalizável',
      description: 'Grandes transformações no sistema! Painel de Controle do Financeiro focado em operações diárias com customização de quadros por usuário.',
      changes: [
        { type: 'Painel Operacional', text: 'Quadros direcionados ao operador financeiro (Contas a Pagar/Receber Hoje, Saldo de Caixa Realizado e Títulos em Atraso).' },
        { type: 'Personalização do Painel', text: 'Botão "Personalizar Painel" para reordenar, redimensionar e escolher os quadros visíveis.' },
        { type: 'Versão 2.0.1 Major', text: 'Marco histórico de integração total dos módulos Financeiro, Compras, Estoque e NexaHR.' }
      ]
    },
    {
      version: 'v1.2.47',
      date: '30 de Julho, 2026',
      title: 'Integração Tripla: Financeiro, Compras e Estoque',
      description: 'Conexão fluida entre os 3 módulos: reposição automática a partir do estoque crítico, lançamento automático de Contas a Pagar na aprovação de compras e importação unificada de NFe.',
      changes: [
        { type: 'Reposição Automática', text: 'Botão "Pedir Compra" no Estoque Crítico gera solicitação direta para o Portal de Compras.' },
        { type: 'Automação Financeira', text: 'Finalização de compras e notas fiscais geram automaticamente os títulos a pagar no Módulo Financeiro.' },
        { type: 'Retroalimentação de Status', text: 'Quitação no Financeiro reflete com badges visuais nos módulos de Compras e Estoque.' }
      ]
    },
    {
      version: 'v1.2.46',
      date: '30 de Julho, 2026',
      title: 'Aprimoramento do Monitoramento de Contratos em Experiência',
      description: 'Lógica inteligente para identificar colaboradores em experiência (vínculo ou admissão até 90 dias) e monitorar prazos de 45 e 90 dias no Painel.',
      changes: [
        { type: 'Monitoramento de Experiência', text: 'Captura automática de vínculos de experiência e contratos recentes nos últimos 90 dias.' },
        { type: 'Prazos de Avaliação', text: 'Exibição dos marcos de 1ª avaliação (45d) e término de experiência (90d) diretamente na caixa do Painel.' }
      ]
    },
    {
      version: 'v1.2.45',
      date: '30 de Julho, 2026',
      title: 'Sincronização de Contagem de Colaboradores Ativos no NexaHR',
      description: 'Unificação dos contadores das abas e KPIs para exibir estritamente colaboradores ativos (136), com filtro dedicado para inativos/demitidos.',
      changes: [
        { type: 'Sincronização de Dados', text: 'Aba de Funcionários e KPI do Painel alinhados para exibir 136 colaboradores ativos por padrão.' },
        { type: 'Filtro no Diretório', text: 'Adicionada opção no diretório para filtrar entre Ativos (136), Inativos (19) ou Todos os Registros (155).' }
      ]
    },
    {
      version: 'v1.2.44',
      date: '30 de Julho, 2026',
      title: 'Correção de UX & Fundo Opaco no Modal de Usuários',
      description: 'Eliminada a sobreposição visual no modal de cadastro/edição de usuários, aplicando fundo sólido 100% opaco, desfoque de fundo e novo visual premium.',
      changes: [
        { type: 'Correção Visual', text: 'Resolução do vazamento de texto da tabela por trás do modal de gestão de usuários (Configurações / T.I.).' },
        { type: 'Estatuto de UX', text: 'Container refinado com desfoque backdrop-filter, sombras de elevacão, bordas nítidas e ícones indicativos nos formulários.' }
      ]
    },
    {
      version: 'v1.2.43',
      date: '30 de Julho, 2026',
      title: 'Melhorias de UX no Módulo NexaHR, Ordenação e Painel Personalizável',
      description: 'Ficha dos funcionários clicável, ordenação de tabelas por coluna, opção BetimCARD no vale-transporte e caixas do painel reorganizáveis por usuário com tamanho pequeno por padrão.',
      changes: [
        { type: 'Usabilidade & UX', text: 'Nome e foto de funcionários clicáveis em todas as seções e tabelas do RH para abertura direta da ficha cadastral.' },
        { type: 'Ordenação Dinâmica', text: 'Colunas da lista de funcionários com ordenação crescente/decrescente com suporte visual.' },
        { type: 'Vale-Transporte', text: 'Inclusão da opção de cartão "BetimCARD" no formulário do benefício de VT.' },
        { type: 'Painel Customizável', text: 'Modo de organização de caixas no Painel de Controle com reposicionamento, ajuste de tamanho (pequeno por padrão) e salvamento por usuário no Cloud Firestore e localStorage.' }
      ]
    },
    {
      version: 'v1.2.41',
      date: '30 de Julho, 2026',
      title: 'Correção Definitiva de Fallback e Permissões no Firestore',
      description: 'Ajuste estrutural no carregamento, garantindo que usuários comuns consigam ler seus perfis corretamente mesmo que ocorram falhas de gravação, mantendo o acesso aos módulos.',
      changes: [
        { type: 'Correção', text: 'Separação de leitura e escrita do perfil para evitar que erros de permissão de gravação bloqueiem o carregamento das permissões (RBAC).' }
      ]
    },
    {
      version: 'v1.2.40',
      date: '30 de Julho, 2026',
      title: 'Limpeza de Usuários Duplicados & Restrição Rigorosa de Acesso RH/BI',
      description: 'Implementada desduplicação automática mantendo apenas cadastros completos e restrição garantida dos portais para usuários RH.',
      changes: [
        { type: 'Cadastro de Usuários', text: 'Limpeza de duplicidades de cadastros para anacg@nexa.com e contato@techcosta.net mantendo automaticamente o nome completo oficial.' },
        { type: 'Segurança & Portais', text: 'Imposta trava de segurança garantindo a exibição exclusiva dos portais de Recursos Humanos e BI para perfis RH em qualquer dispositivo.' }
      ]
    },
    {
      version: 'v1.2.38',
      date: '30 de Julho, 2026',
      title: 'Persistência Fulltime RBAC no Firebase Cloud (Nuvem)',
      description: 'Conexão direta dos perfis RBAC e configurações SaaS ao Google Cloud Firestore para sincronização multi-dispositivo permanente.',
      changes: [
        { type: 'Nuvem Realtime', text: 'Conectada a leitura e gravação da coleção `user_profiles` e `tenant_settings` ao Cloud Firestore real.' },
        { type: 'Segurança Firebase', text: 'Atualizadas regras `firestore.rules` permitindo sincronização em tempo real das permissões de T.I. para todos os computadores.' },
        { type: 'Recursos Humanos', text: 'Garantida a exibição exclusiva do portal NexaHR e do portal NexaINDEX (BI) para o perfil RH.' }
      ]
    },
    {
      version: 'v1.2.36',
      date: '30 de Julho, 2026',
      title: 'Integração de Permissões RBAC com Matriz do Módulo T.I.',
      description: 'Conectou a matriz de permissões RBAC configurada no painel de T.I. (NexaCONFIG) diretamente ao seletor de portais da tela inicial.',
      changes: [
        { type: 'Segurança & RBAC', text: 'Os módulos da tela inicial agora respeitam dinamicamente as permissões (Escrita, Leitura ou Sem Acesso) salvas no painel de T.I. para cada perfil.' },
        { type: 'Recursos Humanos', text: 'Ajustada a regra para que perfis configurados para BI e RH (como Recursos Humanos) visualizem rigorosamente os módulos autorizados na matriz de permissões.' }
      ]
    },
    {
      version: 'v1.2.34',
      date: '30 de Julho, 2026',
      title: 'Ajuste de Perfil RH & Ocultação de Módulos Restritos',
      description: 'Ocultação automática dos portais sem acesso na tela inicial e perfil dedicado de Recursos Humanos para a usuária anacg@nexa.com.',
      changes: [
        { type: 'Privacidade & RBAC', text: 'Módulos sem acesso agora ficam completamente ocultos na tela inicial.' },
        { type: 'Recursos Humanos', text: 'Usuária anacg@nexa.com configurada com perfil RH (acesso ao portal NexaHR e indicadores de BI do RH).' }
      ]
    },
    {
      version: 'v1.2.32',
      date: '30 de Julho, 2026',
      title: 'Sincronização Realtime no Firebase Cloud & Recuperação de Acessos',
      description: 'Ativação da conexão direta em tempo real com o Google Cloud Firebase (Firestore) para sincronização multi-dispositivo de funcionários e usuários.',
      changes: [
        { type: 'Sincronização', text: 'Ativada conexão em nuvem com o Firestore (USE_MOCK = false), permitindo que todos os computadores visualizem os mesmos dados em tempo real.' },
        { type: 'RH & Funcionários', text: 'Auto-provisionamento e semeadura automática da coleção de funcionários na nuvem.' },
        { type: 'Acessos', text: 'Garantido o perfil Administrador Ativo no Firestore Cloud para contato@techcosta.net, anacg@nexa.com e jsoares@nexa.com.' },
        { type: 'Segurança', text: 'Atualização de firestore.rules liberando coleções de funcionários, estoque, compras e parâmetros operacionais na nuvem.' }
      ]
    },
    {
      version: 'v1.2.30',
      date: '30 de Julho, 2026',
      title: 'Adequação LGPD, Posicionamento Hospitalar & Usuários Oficiais',
      description: 'Atualização do posicionamento do sistema como Gestão de Clínicas e Hospitais, remoção de dados expostos na tela de login e liberação de acessos dos administradores oficiais.',
      changes: [
        { type: 'Segurança', text: 'Remoção de e-mails e credenciais expostas na tela inicial de login em estrita conformidade com a LGPD.' },
        { type: 'Institucional', text: 'Atualização do subtítulo oficial para "Sistema de Gestão de Clínicas e Hospitais".' },
        { type: 'Acessos', text: 'Liberado e provisionado perfil Administrador Ativo para contato@techcosta.net, anacg@nexa.com e jsoares@nexa.com.' },
        { type: 'Limpeza', text: 'Remoção automática de usuários fictícios de demonstração (@clinica.com) do banco de dados.' }
      ]
    },
    {
      version: 'v1.2.24',
      date: '17 de Julho, 2026',
      title: 'Módulo NexaCAL (Agenda & Consultas)',
      description: 'Lançamento do módulo de agendamento de consultas e exames de imagem com grade de visualização integrada.',
      changes: [
        { type: 'Novo', text: 'Grade horária com multivisualização (Diária, Semanal e Mensal) com suporte a filtros rápidos por profissional.' },
        { type: 'Novo', text: 'Desenvolvimento de bloqueador de conflito de grade de escala médica em tempo real.' },
        { type: 'Novo', text: 'Fluxo integrado com recepção permitindo mudar status de comparecimento com botão "Chegou à Clínica".' },
        { type: 'Simulação', text: 'Integração de simulador de respostas de pré-confirmação via WhatsApp (SIM/NÃO) que ajusta a agenda dinamicamente.' }
      ]
    },
    {
      version: 'v1.2.22',
      date: '17 de Julho, 2026',
      title: 'Módulo NexaPROCURE (Compras & Cotações)',
      description: 'Lançamento do módulo de compras de insumos e medicamentos integrado ao controle de estoques e farmácia.',
      changes: [
        { type: 'Novo', text: 'Desenvolvimento do fluxo de requisição para funcionários (reposição de estoque existente ou novos itens).' },
        { type: 'Novo', text: 'Adicionado Stepper Timeline visual de status do pedido para acompanhamento de funcionários.' },
        { type: 'Novo', text: 'Implementação da Central de Aprovações em múltiplos níveis de alçada (Gestores de Setor e Diretores Clínicos).' },
        { type: 'Novo', text: 'Desenvolvido painel de comparação de cotação de 3 orçamentos com indicação automática de menor preço e entrega rápida.' },
        { type: 'Integração', text: 'Integração de entrada automática de saldo e lote no controle de estoque no encerramento da compra.' }
      ]
    },
    {
      version: 'v1.2.19',
      date: '17 de Julho, 2026',
      title: 'Ajuste de Layout no NexaHR (Vale-Transporte)',
      description: 'Reorganização estrutural dos componentes da aba de Vale-Transporte.',
      changes: [
        { type: 'Melhoria', text: 'Movido o quadro de indicadores de consolidação (KPIs) de Vale-Transporte para o topo da página, seguindo o padrão de design visual do sistema.' }
      ]
    },
    {
      version: 'v1.2.16',
      date: '17 de Julho, 2026',
      title: 'Quadro de Presença Premiada no NexaHR',
      description: 'Implementação de programa de assiduidade com ranking de elegibilidade reativo e cálculo de bônus financeiro projetado.',
      changes: [
        { type: 'Novo', text: 'Adicionado quadro de Presença Premiada no dashboard de controle com controle de elegibilidade.' },
        { type: 'Novo', text: 'Desenvolvido filtro automatizado de elegibilidade com base em faltas, atestados (licenças médicas) e advertências.' },
        { type: 'Novo', text: 'Configuração dinâmica do valor do prêmio de assiduidade individual por colaborador com cálculo projetado em tempo real.' }
      ]
    },
    {
      version: 'v1.2.11',
      date: '17 de Julho, 2026',
      title: 'Múltiplas Visualizações Gráficas no NexaINDEX',
      description: 'Lançamento de suporte para visualização de dados em tempo real no Dashboard através de 4 modos selecionáveis pelo usuário.',
      changes: [
        { type: 'Novo', text: 'Adicionado suporte para gráficos de coluna/barras SVG gerados dinamicamente para cada indicador.' },
        { type: 'Novo', text: 'Adicionado suporte para visualização de linha em degrau (Step chart) mostrando transições discretas.' },
        { type: 'Novo', text: 'Adicionado suporte para tabela de dados histórica compacta mostrando valores mensais, metas e status do alvo.' },
        { type: 'Melhoria', text: 'Botões seletores de modo gráfico integrados individualmente em cada indicador do painel BI.' }
      ]
    },
    {
      version: 'v1.2.10',
      date: '17 de Julho, 2026',
      title: 'Módulo NexaCONFIG (Configurações & TI)',
      description: 'Lançamento do painel completo de T.I. com customização de marcas SaaS, perfis de acesso RBAC, logs de segurança, backups e chaves de API.',
      changes: [
        { type: 'Novo', text: 'Painel de Branding SaaS para alteração do nome da clínica, upload de logo (Base64) e cor tema.' },
        { type: 'Novo', text: 'Controle de Acessos por Perfis (RBAC) com matriz de permissões (Leitura/Escrita/Bloqueado) por módulo.' },
        { type: 'Novo', text: 'Central de segurança para criação, edição e bloqueio de usuários vinculados a perfis.' },
        { type: 'Melhoria', text: 'Migração da gestão de usuários do portal de RH para a central de TI.' },
        { type: 'Melhoria', text: 'Ferramenta de exportação e importação de backups completos do banco local em formato JSON.' }
      ]
    },
    {
      version: 'v1.2.8',
      date: '17 de Julho, 2026',
      title: 'Controle de Vales-Transporte & Aniversariantes',
      description: 'Lançamento do painel festivo de aniversariantes do mês e central completa de controle e concessão de Vales-Transporte (VT).',
      changes: [
        { type: 'Novo', text: 'Painel visual festivo no Dashboard de RH listando aniversariantes do mês corrente.' },
        { type: 'Novo', text: 'Aba completa de Vale-Transporte (VT) com gerenciamento de linhas, itinerários e dados de cartões.' },
        { type: 'Novo', text: 'Módulo de cálculo automático de recarga de VT e desconto salarial em folha de pagamento (padrão 6%).' },
        { type: 'Melhoria', text: 'Persistência no localStorage local e criação de endpoints simulados na API dbService.' }
      ]
    },
    {
      version: 'v1.2.6',
      date: '17 de Julho, 2026',
      title: 'Métricas de RH Integradas (NexaHR & NexaINDEX)',
      description: 'Implementação de controle dinâmico de Turnover e Absenteísmo no NexaHR integrado automaticamente ao painel de BI do NexaINDEX.',
      changes: [
        { type: 'Novo', text: 'Novo Dashboard de RH exibindo taxa mensal de Turnover, Absenteísmo e histórico de ausências.' },
        { type: 'Novo', text: 'Nova aba de Ausências na ficha do colaborador para registro detalhado de faltas/horas perdidas.' },
        { type: 'Novo', text: 'Opções de status de vínculo e data de desligamento na aba de contratos dos funcionários.' },
        { type: 'Melhoria', text: 'Mecanismo de sincronismo automático de rotatividade e absenteísmo em tempo real no BI do NexaINDEX.' }
      ]
    },
    {
      version: 'v1.2.4',
      date: '17 de Julho, 2026',
      title: 'Módulo NexaFINANCE - Gestão Financeira',
      description: 'Lançamento do portal financeiro completo com conciliação automática de Notas Fiscais XML, contas a pagar, contas a receber e alertas de faturamento/APAC.',
      changes: [
        { type: 'Novo', text: 'Dashboard de Fluxo de Caixa, EBITDA, Ponto de Equilíbrio e Custo por Sessão.' },
        { type: 'Novo', text: 'Importador inteligente de XML NF-e que automatiza o contas a pagar e abastece o estoque.' },
        { type: 'Novo', text: 'Módulo de Contas a Pagar e Receber com filtros de status e rateio por centro de custos.' },
        { type: 'Novo', text: 'Painel de Gestão de APACs com alertas de vencimento para prevenção de glosas.' }
      ]
    },
    {
      version: 'v1.2.2',
      date: '16 de Julho, 2026',
      title: 'Novos Indicadores de Hemotransfusão e Hemovigilância (NexaINDEX)',
      description: 'Implementação de métricas para monitoramento de taxas de transfusão de sangue, hemocomponentes infundidos e reações adversas transfusionais.',
      changes: [
        { type: 'Novo', text: 'Indicadores de Taxa de Hemotransfusão e Taxa de Pacientes Hemotransfundidos.' },
        { type: 'Novo', text: 'Indicadores absolutos de bolsas infundidas e total de pacientes hemotransfundidos.' },
        { type: 'Novo', text: 'Métrica de vigilância com a Taxa de Reação Transfusional.' },
        { type: 'Melhoria', text: 'Carga histórica completa (Janeiro a Junho de 2026) baseada nos relatórios de hemovigilância da comissão de segurança.' }
      ]
    },
    {
      version: 'v1.1.9',
      date: '16 de Julho, 2026',
      title: 'Desempenho e Produtividade Cirúrgica de Acessos Vasculares (NexaINDEX)',
      description: 'Estruturação de indicadores individuais de cirurgiões vasculares (Moisés, Alexandre, Euler e Ricardo) para confecção e falência primária de FAV.',
      changes: [
        { type: 'Novo', text: 'Indicadores individuais de Confecção de Fístula Arteriovenosa (%) para cada cirurgião.' },
        { type: 'Novo', text: 'Indicadores individuais de Taxa de Falência Primária de FAV por profissional.' },
        { type: 'Melhoria', text: 'Carga histórica individualizada (Janeiro a Maio de 2026) baseada nos relatórios de auditoria cirúrgica.' }
      ]
    },
    {
      version: 'v1.1.8',
      date: '16 de Julho, 2026',
      title: 'Novos Indicadores de Confecção e Acompanhamento de FAV (NexaINDEX)',
      description: 'Estruturação de métricas de cirurgias de fístula arteriovenosa (FAV), maturação e taxas de falência primária.',
      changes: [
        { type: 'Novo', text: 'Indicadores de Taxas de Confecção de Fístula Arteriovenosa: FAV Simples, FAV com Bloqueio e FAV Basílica.' },
        { type: 'Novo', text: 'Indicador de Taxa de FAV em Processo de Maturação.' },
        { type: 'Novo', text: 'Indicador de Taxa de Falência Primária de FAV antes da primeira punção.' },
        { type: 'Melhoria', text: 'Carga histórica de dados de confecção de fístulas (Janeiro a Maio de 2026) lidos dos painéis cirúrgicos da enfermagem.' }
      ]
    },
    {
      version: 'v1.1.7',
      date: '16 de Julho, 2026',
      title: 'Novos Indicadores de Distribuição de Acessos Vasculares (NexaINDEX)',
      description: 'Estruturação do Mapa Vascular e controle de acessos vasculares (FAV, CDL, Permcath, PTFE e perdas).',
      changes: [
        { type: 'Novo', text: 'Indicadores de Taxa de Pacientes com FAV (Fístula), CDL, Permcath e PTFE (Prótese) com metas contratuais.' },
        { type: 'Novo', text: 'Indicador de Taxa de Utilização de Cateter temporário > 3 Meses.' },
        { type: 'Novo', text: 'Indicador de contagem absoluta do total de perdas de fístula arteriovenosa (FAV).' },
        { type: 'Melhoria', text: 'Carga histórica de dados do Mapa Vascular (Janeiro a Junho de 2026) baseada nos relatórios de enfermagem.' }
      ]
    },
    {
      version: 'v1.1.6',
      date: '16 de Julho, 2026',
      title: 'Novos Indicadores Clínicos de Hospitalização (NexaINDEX)',
      description: 'Estruturação e cadastro dos novos indicadores de internações hospitalares e intercorrências clínicas em HD e DP.',
      changes: [
        { type: 'Novo', text: 'Indicadores de Taxa de Hospitalização Geral, HD e DP com metas assistenciais integradas.' },
        { type: 'Novo', text: 'Indicadores de Taxa de Internações por Intercorrência Dialítica (Geral, HD e DP).' },
        { type: 'Novo', text: 'Indicador de contagem absoluta do total de internações hospitalares no mês.' },
        { type: 'Melhoria', text: 'Carga histórica de dados de hospitalizações (Janeiro a Junho de 2026) baseada nos painéis assistenciais.' }
      ]
    },
    {
      version: 'v1.1.2',
      date: '16 de Julho, 2026',
      title: 'Novos Indicadores Clínicos de Mortalidade (NexaINDEX)',
      description: 'Estruturação e cadastro dos novos indicadores de mortalidade e controle populacional para HD e DP.',
      changes: [
        { type: 'Novo', text: 'Indicadores de Taxa de Mortalidade Pacientes HD, DP e Geral com metas e fórmulas integradas.' },
        { type: 'Novo', text: 'Indicador de contagem de óbitos relacionados ao tratamento dialítico.' },
        { type: 'Novo', text: 'Indicadores de volumetria populacional (total de pacientes em HD/DP) e óbitos prevalentes.' },
        { type: 'Melhoria', text: 'Carga histórica de dados (Janeiro a Junho de 2026) baseada em planilhas assistenciais.' }
      ]
    },
    {
      version: 'v1.1.1',
      date: '16 de Julho, 2026',
      title: 'Módulo NexaHR: Gestão de Usuários & RH',
      description: 'Lançamento do portal de Recursos Humanos, Controle de Acessos RBAC e Auditoria.',
      changes: [
        { type: 'Novo', text: 'Cadastro de Funcionários em abas (Dados Pessoais com Foto, Contato, Profissionais, Bancários, Dependentes, Advertências, Vacinas e Documentos).' },
        { type: 'Novo', text: 'Gerenciador de Usuários com vinculação a Funcionários, inativação e redefinição de senhas.' },
        { type: 'Novo', text: 'Importador em lote de planilhas CSV com pré-visualização linha a linha e validação de erros.' },
        { type: 'Novo', text: 'Log de Auditoria completo (LGPD) registrando o valor anterior e novo de cada ação de RH.' },
        { type: 'Novo', text: 'Exportação imediata de relatórios em formato CSV compatível com o Excel.' }
      ]
    },
    {
      version: 'v1.0.23',
      date: '15 de Julho, 2026',
      title: 'Controle de NF-e, Fornecedores & Setores',
      description: 'Lançamento de recursos avançados de suprimentos no módulo NexaSTOCK.',
      changes: [
        { type: 'Novo', text: 'Importador de XML de NF-e com leitura automática de emitente, valores e lista de produtos.' },
        { type: 'Novo', text: 'Cadastro completo de Fornecedores e Setores Físicos de Estoque (Almoxarifados/Satélites).' },
        { type: 'Novo', text: 'Mapeamento inteligente de insumos do XML com catálogo de estoque para auto-abastecimento.' },
        { type: 'Novo', text: 'Painel e histórico de Notas Fiscais processadas e ativas no sistema.' }
      ]
    },
    {
      version: 'v1.0.22',
      date: '15 de Julho, 2026',
      title: 'Otimização de Espaço e Grid no Seletor',
      description: 'Redesenho do seletor de portais para melhor visualização em desktops.',
      changes: [
        { type: 'Melhoria', text: 'Readequação do grid para layout horizontal (4 colunas side-by-side) sem necessidade de rolagem vertical.' },
        { type: 'Melhoria', text: 'Compactação de tamanhos de fontes, margens, cabeçalho e tamanho de ícones nos cards de portal.' }
      ]
    },
    {
      version: 'v1.0.21',
      date: '15 de Julho, 2026',
      title: 'Identificação por Foto & Contatos de Emergência',
      description: 'Expansão de segurança do paciente no portal administrativo NexaCLINIC - Recepção.',
      changes: [
        { type: 'Novo', text: 'Upload de foto em formato Base64 para identificação visual rápida na ficha do paciente.' },
        { type: 'Novo', text: 'Cadastro dinâmico de múltiplos Contatos Importantes/Emergência com grau de parentesco.' },
        { type: 'Melhoria', text: 'Exibição de miniatura redonda do paciente e resumo do contato principal na listagem e triagem.' }
      ]
    },
    {
      version: 'v1.0.20',
      date: '15 de Julho, 2026',
      title: 'Central de Atualizações do Sistema',
      description: 'Criação do canal de comunicação direta de melhorias com o usuário.',
      changes: [
        { type: 'Novo', text: 'Timeline vertical integrada ao menu de ajuda do sistema para acompanhamento de novidades.' },
        { type: 'Novo', text: 'Indicador visual (ponto roxo de notificação) na barra superior do NexaCLINIC.' }
      ]
    },
    {
      version: 'v1.0.19',
      date: '15 de Julho, 2026',
      title: 'Módulo Clínico & Prescrição Completo',
      description: 'Lançamento das frentes assistenciais integradas na plataforma NexaCLINIC.',
      changes: [
        { type: 'Novo', text: 'Módulo Clínico completo com Prescrição de Diálise, fichas técnicas e evolução multiprofissional.' },
        { type: 'Novo', text: 'Monitoramento Intra-diálise de sala com registro de sinais vitais horários e ocorrências.' },
        { type: 'Melhoria', text: 'Exposição de endpoints CRUD completos na estrutura do banco de dados local mock e Firestore.' }
      ]
    },
    {
      version: 'v1.0.18',
      date: '15 de Julho, 2026',
      title: 'Portal de Recepção & Poltronas',
      description: 'Redesenho administrativo da clínica para gestão ágil de admissões e check-ins.',
      changes: [
        { type: 'Novo', text: 'Módulo NexaCLINIC - Recepção para cadastro completo de pacientes com informações regulatórias (CNS, APAC, etc.).' },
        { type: 'Novo', text: 'Grade de agendamento visual mostrando a ocupação das poltronas de diálise por sala e turno.' },
        { type: 'Novo', text: 'Fila operacional de check-in diário com aferição preliminar de temperatura, pressão arterial e peso de entrada.' }
      ]
    },
    {
      version: 'v1.0.17',
      date: '15 de Julho, 2026',
      title: 'Arquitetura Modular e Portal Central',
      description: 'Estruturação do sistema de indicadores original para se tornar uma plataforma corporativa expandida.',
      changes: [
        { type: 'Novo', text: 'Redesenho da tela de login e criação da tela pós-login de seleção de portais.' },
        { type: 'Melhoria', text: 'Isolamento da tela antiga de pacientes de dentro do NexaINDEX para a recepção clínica.' },
        { type: 'Correção', text: 'Correções na responsividade dos gráficos de BI no celular.' }
      ]
    }
  ];

  const getTagStyle = (type) => {
    switch (type) {
      case 'Novo':
        return { backgroundColor: 'rgba(5, 150, 105, 0.1)', color: 'var(--success-color)' };
      case 'Melhoria':
        return { backgroundColor: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' };
      case 'Correção':
        return { backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#d97706' };
      default:
        return { backgroundColor: '#f1f5f9', color: 'var(--text-secondary)' };
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <div style={styles.titleBox}>
            <div style={styles.iconBox}>
              <Megaphone size={20} color="#8b5cf6" />
            </div>
            <div>
              <h2 style={styles.title}>Histórico de Versões</h2>
              <p style={styles.subtitle}>Fique por dentro de todas as novidades implementadas no NexaCLINIC.</p>
            </div>
          </div>
          <button onClick={onClose} style={styles.closeBtn}><X size={20} /></button>
        </div>

        <div style={styles.body}>
          <div style={styles.timeline}>
            {updates.map((update, index) => (
              <div key={update.version} style={styles.timelineItem}>
                <div style={styles.timelinePoint}>
                  <CheckCircle2 size={16} color="#8b5cf6" style={{ backgroundColor: '#fff', borderRadius: '50%' }} />
                </div>
                <div style={styles.timelineCard}>
                  <div style={styles.cardHeader}>
                    <div style={styles.versionBadge}>{update.version}</div>
                    <span style={styles.date}><Calendar size={12} style={{ marginRight: '0.25rem' }} /> {update.date}</span>
                  </div>
                  <h3 style={styles.cardTitle}>{update.title}</h3>
                  <p style={styles.cardDesc}>{update.description}</p>
                  
                  <div style={styles.changeList}>
                    {update.changes.map((change, idx) => (
                      <div key={idx} style={styles.changeItem}>
                        <span style={{ ...styles.changeTag, ...getTagStyle(change.type) }}>{change.type}</span>
                        <span style={styles.changeText}>{change.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={styles.footer}>
          <span>Versão Atual do Sistema: <strong>v1.2.24</strong></span>
          <button onClick={onClose} className="btn btn-primary" style={{ backgroundColor: '#8b5cf6', fontSize: '0.8rem', padding: '0.5rem 1rem' }}>
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1100,
    padding: '1rem',
    backdropFilter: 'blur(3px)',
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: 'var(--border-radius-lg)',
    width: '100%',
    maxWidth: '620px',
    maxHeight: '85vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.25rem 1.5rem',
    borderBottom: '1px solid var(--border-color)',
  },
  titleBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  iconBox: {
    width: '40px',
    height: '40px',
    borderRadius: 'var(--border-radius-sm)',
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: '1.2rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
    marginBottom: '0.15rem',
  },
  subtitle: {
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--text-secondary)',
  },
  body: {
    padding: '1.5rem',
    overflowY: 'auto',
  },
  timeline: {
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    paddingLeft: '0.75rem',
    borderLeft: '2px solid rgba(139, 92, 246, 0.2)',
    marginLeft: '0.5rem',
  },
  timelineItem: {
    position: 'relative',
    marginBottom: '2rem',
  },
  timelinePoint: {
    position: 'absolute',
    left: '-21px',
    top: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '20px',
    height: '20px',
  },
  timelineCard: {
    backgroundColor: '#fff',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--border-radius-md)',
    padding: '1.25rem',
    boxShadow: 'var(--shadow-sm)',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.5rem',
  },
  versionBadge: {
    fontSize: '0.725rem',
    fontWeight: '700',
    backgroundColor: 'rgba(139, 92, 246, 0.08)',
    color: '#8b5cf6',
    padding: '0.15rem 0.5rem',
    borderRadius: '4px',
  },
  date: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    display: 'inline-flex',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: '0.95rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
    marginBottom: '0.25rem',
  },
  cardDesc: {
    fontSize: '0.8rem',
    color: 'var(--text-secondary)',
    marginBottom: '1rem',
    lineHeight: '1.4',
  },
  changeList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    borderTop: '1px solid #f1f5f9',
    paddingTop: '0.75rem',
  },
  changeItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.5rem',
    fontSize: '0.775rem',
    lineHeight: '1.4',
  },
  changeTag: {
    fontSize: '0.625rem',
    fontWeight: '800',
    textTransform: 'uppercase',
    padding: '0.1rem 0.4rem',
    borderRadius: '4px',
    flexShrink: 0,
  },
  changeText: {
    color: 'var(--text-secondary)',
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 1.5rem',
    borderTop: '1px solid var(--border-color)',
    backgroundColor: '#f8fafc',
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
    borderBottomLeftRadius: 'var(--border-radius-lg)',
    borderBottomRightRadius: 'var(--border-radius-lg)',
  }
};
