import React from 'react';
import { X, Megaphone, Calendar, CheckCircle2, ArrowRight } from 'lucide-react';

export default function ChangelogModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const updates = [
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
