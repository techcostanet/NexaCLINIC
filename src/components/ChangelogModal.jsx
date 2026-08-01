import React from 'react';
import { X, Megaphone, Calendar, CheckCircle2, ArrowRight } from 'lucide-react';

export default function ChangelogModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const updates = [
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
