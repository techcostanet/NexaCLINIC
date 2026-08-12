import React from 'react';
import { 
  BarChart3, Users, LayoutDashboard, LogOut, HeartPulse, Package, DollarSign, 
  Settings, ShoppingCart, Calendar, ClipboardList, FileText, Wrench, ShieldCheck,
  LayoutGrid, List, LayoutList, Columns, ArrowRight, Search 
} from 'lucide-react';
import { authService } from '../firebase';

export default function ModuleSelector({ user, onSelectModule }) {
  const [viewMode, setViewMode] = React.useState('grid'); // 'grid' (padrão), 'list', 'compact', 'expanded'
  const [searchTerm, setSearchTerm] = React.useState('');

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error('Erro ao deslogar:', err);
    }
  };

  const modules = [
    {
      id: 'reception',
      title: 'Recepção & Cadastro',
      subtitle: 'NexaCLINIC - Recepção',
      description: 'Admissão de pacientes, regulação de guias/APACs e controle presencial de diálise diária.',
      icon: Users,
      color: 'var(--secondary-color)',
      allowedRoles: ['admin', 'professional', 'receptionist']
    },
    {
      id: 'clinical',
      title: 'Módulo Clínico & Prescrição',
      subtitle: 'NexaCLINIC - Assistencial',
      description: 'Prescrições de diálise, prontuário médico, evoluções multiprofissionais e acompanhamento de sessões.',
      icon: HeartPulse,
      color: '#8b5cf6', // purple-500
      allowedRoles: ['admin', 'professional']
    },
    {
      id: 'stock',
      title: 'Estoque & Farmácia',
      subtitle: 'NexaSTOCK - Logística',
      description: 'Controle de farmácia clínica, dispensação de medicamentos, inventário e validade de insumos.',
      icon: Package,
      color: '#f59e0b', // amber-500
      allowedRoles: ['admin', 'professional', 'stock_keeper']
    },
    {
      id: 'maintenance',
      title: 'Manutenção & Engenharia Clínica',
      subtitle: 'NexaSERVICE - Ordem de Serviço',
      description: 'Gestão de ativos biomédicos e prediais com histórico técnico por equipamento e chamados de ordem de serviço.',
      icon: Wrench,
      color: '#0891b2', // cyan-600
      allowedRoles: ['admin', 'professional', 'technician', 'rh']
    },
    {
      id: 'quality',
      title: 'Gestão da Qualidade & BI',
      subtitle: 'NexaINDEX - BI',
      description: 'Métricas assistenciais, metas de indicadores hospitalares e auditoria de faturamento.',
      icon: BarChart3,
      color: 'var(--primary-color)',
      allowedRoles: ['admin', 'professional', 'rh', 'financial']
    },
    {
      id: 'hr',
      title: 'Recursos Humanos & Benefícios',
      subtitle: 'NexaHR - Pessoal',
      description: 'Gestão de funcionários, admissões, controle de passagens VT, ausências e indicadores de turnover.',
      icon: Users,
      color: '#ec4899', // pink-500
      allowedRoles: ['admin', 'rh']
    },
    {
      id: 'finance',
      title: 'Módulo Financeiro',
      subtitle: 'NexaFINANCE - Financeiro',
      description: 'Fluxo de caixa, contas a pagar e receber, conciliação bancária, parcelamentos e importação de XML NF-e.',
      icon: DollarSign,
      color: '#10b981', // emerald-500
      allowedRoles: ['admin', 'financial']
    },
    {
      id: 'apac',
      title: 'APACs & Faturamento',
      subtitle: 'NexaAPAC - Faturamento',
      description: 'Auditoria de guias APAC, faturamento SUS/Convênios, gestão de glosas e exportação de remessas BPA.',
      icon: FileText,
      color: '#ef4444', // red-500
      allowedRoles: ['admin', 'financial', 'receptionist']
    },
    {
      id: 'calendar',
      title: 'Agenda & Consultas',
      subtitle: 'NexaCAL - Agendamentos',
      description: 'Grade horária diária, semanal e mensal, controle de salas, confirmação de pacientes e bloqueio de conflito de escalas.',
      icon: Calendar,
      color: '#06b6d4', // cyan-500
      allowedRoles: ['admin', 'professional', 'receptionist']
    },
    {
      id: 'purchasing',
      title: 'Compras & Cotações',
      subtitle: 'NexaPROCURE - Suprimentos',
      description: 'Solicitações de reposição/novos itens, aprovação de verba, cotação de 3 orçamentos e entrada automática no estoque.',
      icon: ShoppingCart,
      color: '#f59e0b', // amber-500
      allowedRoles: ['admin', 'professional', 'rh', 'receptionist']
    },
    {
      id: 'requisitions',
      title: 'Requisições de Insumos (Salão)',
      subtitle: 'NexaREQ - Enfermagem',
      description: 'Solicitação ágil de materiais e medicamentos para salões de hemodiálise e vinculação a pacientes.',
      icon: ClipboardList,
      color: '#14b8a6', // teal-500
      allowedRoles: ['admin', 'professional', 'technician']
    },
    {
      id: 'config',
      title: 'Configurações & TI',
      subtitle: 'NexaCONFIG - Administração',
      description: 'Gestão de acessos RBAC, tema visual dinâmico, logs de auditoria geral, API keys e backups do banco JSON.',
      icon: Settings,
      color: '#8b5cf6', // violet-500
      allowedRoles: ['admin']
    },
    {
      id: 'sesmt',
      title: 'SESMT & Segurança',
      subtitle: 'NexaSAFE - Segurança',
      description: 'Checklists de EPI, inspeções de extintores e hidrantes, e painel de conformidade e riscos.',
      icon: ShieldCheck,
      color: '#059669', // emerald-600
      allowedRoles: ['admin', 'rh', 'technician', 'sesmt']
    }
  ];

  const [profiles, setProfiles] = React.useState([]);

  React.useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const { dbService } = await import('../firebase');
        const list = await dbService.getUserProfiles();
        if (list && list.length > 0) {
          setProfiles(list);
        }
      } catch (err) {
        console.error('Erro ao carregar perfis RBAC:', err);
      }
    };
    fetchProfiles();
  }, []);

  const userRole = user?.role || 'professional';
  
  // Find current user profile configuration from stored RBAC profiles
  const userProfileConfig = profiles.find((p) => p.id === userRole);

  const visibleModules = modules.filter((mod) => {
    // Módulo de Manutenção (NexaSERVICE) é universal para todos os funcionários abrirem chamados
    if (mod.id === 'maintenance') return true;

    // Admin sempre visualiza todos os módulos
    if (userRole === 'admin') return true;

    // Map module IDs to RBAC permission keys
    const permKey = mod.id === 'quality' ? 'index' : mod.id;

    // Check dynamic RBAC matrix se disponível (Tem prioridade sobre legacy allowedSectors)
    if (userProfileConfig && userProfileConfig.permissions && userProfileConfig.permissions[permKey] !== undefined) {
      return userProfileConfig.permissions[permKey] !== 'none';
    }

    // Check specific sector restrictions on user object if present (e.g. allowedSectors: ['rh'])
    if (user?.allowedSectors && Array.isArray(user.allowedSectors)) {
      const modSector = mod.id === 'hr' ? 'rh' : mod.id === 'quality' ? 'qualidade' : mod.id === 'stock' ? 'estoque' : mod.id === 'purchasing' ? 'compras' : mod.id === 'clinical' ? 'medica' : mod.id === 'finance' ? 'faturamento' : mod.id === 'reception' ? 'recepcao' : mod.id;
      if (user.allowedSectors.length > 0 && !user.allowedSectors.includes('all') && !user.allowedSectors.includes('admin')) {
        if (userRole === 'rh') {
          return mod.id === 'hr' || mod.id === 'quality' || mod.id === 'maintenance';
        }
        return user.allowedSectors.includes(modSector);
      }
    }

    if (userRole === 'rh') {
      return mod.id === 'hr' || mod.id === 'quality' || mod.id === 'maintenance';
    }

    return Array.isArray(mod.allowedRoles) ? mod.allowedRoles.includes(userRole) : true;
  });

  const filteredModules = visibleModules.filter((mod) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      mod.title.toLowerCase().includes(term) ||
      mod.subtitle.toLowerCase().includes(term) ||
      mod.description.toLowerCase().includes(term)
    );
  });

  const roleLabel = userProfileConfig?.name || (
    userRole === 'admin' 
      ? 'Administrador Geral' 
      : userRole === 'rh' 
      ? 'Recursos Humanos' 
      : userRole === 'financial' 
      ? 'Gestão Financeira' 
      : userRole === 'sesmt'
      ? 'SESMT & Segurança do Trabalho'
      : userRole === 'receptionist' 
      ? 'Recepção' 
      : 'Profissional Clínico'
  );

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        <div style={styles.header}>
          <div style={styles.logoContainer}>
            <img src="/logo.png" alt="Logo" style={styles.logo} />
          </div>
          <h1 style={styles.welcome}>Olá, {user?.name || 'Profissional'}</h1>
          <p style={styles.instructions}>Selecione abaixo o portal que deseja acessar para continuar o trabalho:</p>
          <div style={styles.roleContainer}>
            Perfil atual: <span style={styles.roleBadge}>{roleLabel}</span>
          </div>
        </div>

        {/* Toolbar de Controle: Busca e Seleção de Modos de Visualização */}
        <div style={styles.toolbar}>
          <div style={styles.searchBox}>
            <Search size={16} color="var(--text-secondary, #64748b)" />
            <input
              type="text"
              placeholder="Buscar módulo por nome ou descrição..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
          </div>

          <div style={styles.viewModeSelector}>
            <span style={styles.viewModeLabel}>Visualização:</span>
            <div style={styles.viewButtonGroup}>
              <button
                type="button"
                title="Grid Padrão (Cards)"
                onClick={() => setViewMode('grid')}
                style={{
                  ...styles.viewBtn,
                  ...(viewMode === 'grid' ? styles.viewBtnActive : {})
                }}
              >
                <LayoutGrid size={15} />
                <span style={styles.btnLabel}>Grid</span>
              </button>

              <button
                type="button"
                title="Lista Detalhada"
                onClick={() => setViewMode('list')}
                style={{
                  ...styles.viewBtn,
                  ...(viewMode === 'list' ? styles.viewBtnActive : {})
                }}
              >
                <List size={15} />
                <span style={styles.btnLabel}>Detalhada</span>
              </button>

              <button
                type="button"
                title="Lista Compacta"
                onClick={() => setViewMode('compact')}
                style={{
                  ...styles.viewBtn,
                  ...(viewMode === 'compact' ? styles.viewBtnActive : {})
                }}
              >
                <LayoutList size={15} />
                <span style={styles.btnLabel}>Compacta</span>
              </button>

              <button
                type="button"
                title="Cards Expandidos / Destaque"
                onClick={() => setViewMode('expanded')}
                style={{
                  ...styles.viewBtn,
                  ...(viewMode === 'expanded' ? styles.viewBtnActive : {})
                }}
              >
                <Columns size={15} />
                <span style={styles.btnLabel}>Expandida</span>
              </button>
            </div>
          </div>
        </div>

        {/* 1. Visão GRID PADRÃO (Cards) */}
        {viewMode === 'grid' && (
          <div style={styles.grid}>
            {filteredModules.map((mod) => {
              const Icon = mod.icon;
              return (
                <div 
                  key={mod.id} 
                  style={styles.card}
                  onClick={() => onSelectModule(mod.id)}
                >
                  <div style={{ ...styles.iconBox, backgroundColor: mod.color }}>
                    {Icon ? <Icon size={22} color="#fff" /> : <FileText size={22} color="#fff" />}
                  </div>
                  <h3 style={styles.cardTitle}>{mod.title}</h3>
                  <span style={{ ...styles.cardSubtitle, color: mod.color }}>{mod.subtitle}</span>
                  <p style={styles.cardDesc}>{mod.description}</p>
                  
                  <button style={{ ...styles.btn, backgroundColor: mod.color }}>
                    Entrar no Portal
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* 2. Visão LISTA DETALHADA */}
        {viewMode === 'list' && (
          <div style={styles.listContainer}>
            {filteredModules.map((mod) => {
              const Icon = mod.icon;
              return (
                <div 
                  key={mod.id} 
                  style={styles.listCard}
                  onClick={() => onSelectModule(mod.id)}
                >
                  <div style={{ ...styles.listIconBox, backgroundColor: mod.color }}>
                    {Icon ? <Icon size={24} color="#fff" /> : <FileText size={24} color="#fff" />}
                  </div>
                  <div style={styles.listContent}>
                    <div style={styles.listHeaderRow}>
                      <h3 style={styles.listTitle}>{mod.title}</h3>
                      <span style={{ ...styles.listSubtitleBadge, color: mod.color, borderColor: mod.color + '40', backgroundColor: mod.color + '12' }}>
                        {mod.subtitle}
                      </span>
                    </div>
                    <p style={styles.listDesc}>{mod.description}</p>
                  </div>
                  <div style={styles.listAction}>
                    <button style={{ ...styles.listBtn, backgroundColor: mod.color }}>
                      <span>Entrar</span>
                      <ArrowRight size={15} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 3. Visão LISTA COMPACTA */}
        {viewMode === 'compact' && (
          <div style={styles.compactContainer}>
            {filteredModules.map((mod) => {
              const Icon = mod.icon;
              return (
                <div 
                  key={mod.id} 
                  style={styles.compactCard}
                  onClick={() => onSelectModule(mod.id)}
                >
                  <div style={{ ...styles.compactIconBox, backgroundColor: mod.color }}>
                    {Icon ? <Icon size={16} color="#fff" /> : <FileText size={16} color="#fff" />}
                  </div>
                  <div style={styles.compactInfo}>
                    <span style={styles.compactTitle}>{mod.title}</span>
                    <span style={styles.compactSubtitle}>• {mod.subtitle}</span>
                  </div>
                  <div style={styles.compactDesc}>{mod.description}</div>
                  <button style={{ ...styles.compactBtn, color: mod.color, borderColor: mod.color + '40' }}>
                    <span>Acessar</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* 4. Visão CARDS EXPANDIDOS */}
        {viewMode === 'expanded' && (
          <div style={styles.expandedGrid}>
            {filteredModules.map((mod) => {
              const Icon = mod.icon;
              return (
                <div 
                  key={mod.id} 
                  style={styles.expandedCard}
                  onClick={() => onSelectModule(mod.id)}
                >
                  <div style={{ ...styles.expandedTopAccent, backgroundColor: mod.color }} />
                  <div style={styles.expandedCardInner}>
                    <div style={styles.expandedHeader}>
                      <div style={{ ...styles.expandedIconBox, backgroundColor: mod.color }}>
                        {Icon ? <Icon size={24} color="#fff" /> : <FileText size={24} color="#fff" />}
                      </div>
                      <div style={styles.expandedTitleGroup}>
                        <span style={{ ...styles.expandedSubtitle, color: mod.color }}>{mod.subtitle}</span>
                        <h3 style={styles.expandedTitle}>{mod.title}</h3>
                      </div>
                    </div>
                    <p style={styles.expandedDesc}>{mod.description}</p>
                    <div style={styles.expandedFooter}>
                      <button style={{ ...styles.expandedBtn, backgroundColor: mod.color }}>
                        <span>Entrar no Módulo</span>
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {filteredModules.length === 0 && (
          <div style={styles.emptyState}>
            Nenhum módulo encontrado para a busca "{searchTerm}".
          </div>
        )}

        <div style={styles.footer}>
          <button onClick={handleLogout} style={styles.logoutBtn}>
            <LogOut size={16} />
            <span>Sair da Conta</span>
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #ecfeff 0%, #f8fafc 100%)',
    padding: '1.5rem 1rem',
  },
  wrapper: {
    width: '100%',
    maxWidth: '1050px',
  },
  header: {
    textAlign: 'center',
    marginBottom: '1.25rem',
  },
  logoContainer: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    backgroundColor: 'rgba(8, 145, 178, 0.1)',
    marginBottom: '0.5rem',
    overflow: 'hidden',
  },
  logo: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  welcome: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
    marginBottom: '0.25rem',
  },
  instructions: {
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
    marginBottom: '0.5rem',
  },
  roleContainer: {
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
    fontWeight: '500',
  },
  roleBadge: {
    backgroundColor: '#fff',
    border: '1px solid var(--border-color)',
    padding: '0.1rem 0.5rem',
    borderRadius: '20px',
    color: 'var(--text-secondary)',
    fontWeight: '600',
  },

  // Toolbar
  toolbar: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '0.75rem',
    marginBottom: '1.5rem',
    backgroundColor: '#ffffff',
    padding: '0.65rem 1rem',
    borderRadius: 'var(--border-radius-md, 12px)',
    border: '1px solid var(--border-color, #e2e8f0)',
    boxShadow: 'var(--shadow-sm, 0 1px 3px rgba(0,0,0,0.05))',
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '0.4rem 0.75rem',
    flex: '1 1 220px',
    maxWidth: '380px',
  },
  searchInput: {
    border: 'none',
    outline: 'none',
    backgroundColor: 'transparent',
    fontSize: '0.85rem',
    width: '100%',
    color: 'var(--text-primary, #1e293b)',
  },
  viewModeSelector: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginLeft: 'auto',
  },
  viewModeLabel: {
    fontSize: '0.8rem',
    fontWeight: '600',
    color: 'var(--text-secondary, #64748b)',
  },
  viewButtonGroup: {
    display: 'flex',
    backgroundColor: '#f1f5f9',
    padding: '3px',
    borderRadius: '8px',
    gap: '2px',
  },
  viewBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    padding: '0.4rem 0.65rem',
    border: 'none',
    borderRadius: '6px',
    backgroundColor: 'transparent',
    color: '#64748b',
    fontSize: '0.75rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  viewBtnActive: {
    backgroundColor: '#ffffff',
    color: 'var(--primary-color, #0891b2)',
    boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
  },
  btnLabel: {
    display: 'inline',
  },

  // 1. Grid Padrão
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
    gap: '1rem',
    marginBottom: '2rem',
  },
  card: {
    backgroundColor: '#ffffff',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--border-radius-md)',
    padding: '1.5rem 1.25rem',
    boxShadow: 'var(--shadow-sm)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  iconBox: {
    width: '44px',
    height: '44px',
    borderRadius: 'var(--border-radius-sm)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '0.75rem',
    boxShadow: 'var(--shadow-sm)',
  },
  cardTitle: {
    fontSize: '1rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
    marginBottom: '0.15rem',
    lineHeight: '1.2',
  },
  cardSubtitle: {
    fontSize: '0.65rem',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '0.75rem',
  },
  cardDesc: {
    fontSize: '0.775rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.4',
    marginBottom: '1.25rem',
    flexGrow: 1,
  },
  btn: {
    width: '100%',
    border: 'none',
    color: '#fff',
    padding: '0.5rem',
    fontSize: '0.8rem',
    fontWeight: '600',
    borderRadius: 'var(--border-radius-sm)',
    cursor: 'pointer',
    textAlign: 'center',
    transition: 'transform 0.15s ease, filter 0.15s ease',
  },

  // 2. Lista Detalhada
  listContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    marginBottom: '2rem',
  },
  listCard: {
    backgroundColor: '#ffffff',
    border: '1px solid var(--border-color, #e2e8f0)',
    borderRadius: 'var(--border-radius-md, 10px)',
    padding: '1rem 1.25rem',
    display: 'flex',
    alignItems: 'center',
    gap: '1.25rem',
    boxShadow: 'var(--shadow-sm, 0 1px 3px rgba(0,0,0,0.05))',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  listIconBox: {
    width: '46px',
    height: '46px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  listContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.2rem',
  },
  listHeaderRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    flexWrap: 'wrap',
  },
  listTitle: {
    fontSize: '1rem',
    fontWeight: '700',
    color: 'var(--text-primary, #0f172a)',
    margin: 0,
  },
  listSubtitleBadge: {
    fontSize: '0.65rem',
    fontWeight: '700',
    padding: '0.15rem 0.5rem',
    borderRadius: '12px',
    border: '1px solid',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  listDesc: {
    fontSize: '0.8rem',
    color: 'var(--text-secondary, #475569)',
    margin: 0,
    lineHeight: '1.4',
  },
  listAction: {
    flexShrink: 0,
  },
  listBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    border: 'none',
    color: '#ffffff',
    padding: '0.5rem 1rem',
    borderRadius: '6px',
    fontWeight: '600',
    fontSize: '0.8rem',
    cursor: 'pointer',
  },

  // 3. Lista Compacta
  compactContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    marginBottom: '2rem',
  },
  compactCard: {
    backgroundColor: '#ffffff',
    border: '1px solid var(--border-color, #e2e8f0)',
    borderRadius: '8px',
    padding: '0.6rem 1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  compactIconBox: {
    width: '32px',
    height: '32px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  compactInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    minWidth: '220px',
  },
  compactTitle: {
    fontSize: '0.875rem',
    fontWeight: '700',
    color: 'var(--text-primary, #0f172a)',
  },
  compactSubtitle: {
    fontSize: '0.725rem',
    color: 'var(--text-muted, #94a3b8)',
    fontWeight: '500',
  },
  compactDesc: {
    fontSize: '0.775rem',
    color: 'var(--text-secondary, #64748b)',
    flex: 1,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    paddingRight: '1rem',
  },
  compactBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.3rem',
    backgroundColor: 'transparent',
    border: '1px solid',
    padding: '0.3rem 0.65rem',
    borderRadius: '6px',
    fontSize: '0.75rem',
    fontWeight: '600',
    cursor: 'pointer',
    flexShrink: 0,
  },

  // 4. Cards Expandidos
  expandedGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '1.25rem',
    marginBottom: '2rem',
  },
  expandedCard: {
    backgroundColor: '#ffffff',
    border: '1px solid var(--border-color, #e2e8f0)',
    borderRadius: 'var(--border-radius-md, 12px)',
    overflow: 'hidden',
    boxShadow: 'var(--shadow-sm, 0 2px 4px rgba(0,0,0,0.04))',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    flexDirection: 'column',
  },
  expandedTopAccent: {
    height: '4px',
    width: '100%',
  },
  expandedCardInner: {
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },
  expandedHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.85rem',
    marginBottom: '0.85rem',
  },
  expandedIconBox: {
    width: '48px',
    height: '48px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
  },
  expandedTitleGroup: {
    display: 'flex',
    flexDirection: 'column',
  },
  expandedSubtitle: {
    fontSize: '0.675rem',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  expandedTitle: {
    fontSize: '1.05rem',
    fontWeight: '700',
    color: 'var(--text-primary, #0f172a)',
    lineHeight: '1.25',
    margin: 0,
  },
  expandedDesc: {
    fontSize: '0.825rem',
    color: 'var(--text-secondary, #475569)',
    lineHeight: '1.45',
    marginBottom: '1.25rem',
    flex: 1,
  },
  expandedFooter: {
    marginTop: 'auto',
  },
  expandedBtn: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    border: 'none',
    color: '#ffffff',
    padding: '0.6rem',
    borderRadius: '8px',
    fontWeight: '600',
    fontSize: '0.825rem',
    cursor: 'pointer',
  },

  emptyState: {
    textAlign: 'center',
    padding: '3rem 1rem',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px dashed #cbd5e1',
    color: '#64748b',
    fontSize: '0.9rem',
    marginBottom: '2rem',
  },

  footer: {
    display: 'flex',
    justifyContent: 'center',
  },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: 'none',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--border-radius-sm)',
    padding: '0.5rem 0.75rem',
    color: 'var(--text-secondary)',
    fontSize: '0.8rem',
    fontWeight: '500',
    cursor: 'pointer',
    backgroundColor: '#fff',
    transition: 'all 0.15s ease',
  }
};

