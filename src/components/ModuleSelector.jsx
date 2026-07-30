import React from 'react';
import { BarChart3, Users, LayoutDashboard, LogOut, HeartPulse, Package, DollarSign, Settings, ShoppingCart, Calendar } from 'lucide-react';
import { authService } from '../firebase';

export default function ModuleSelector({ user, onSelectModule }) {
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
      description: 'Fluxo de caixa, contas a pagar e receber, conciliação de glosas, alertas de APAC e importador de XML NF-e.',
      icon: DollarSign,
      color: '#10b981', // emerald-500
      allowedRoles: ['admin', 'financial']
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
      id: 'config',
      title: 'Configurações & TI',
      subtitle: 'NexaCONFIG - Administração',
      description: 'Gestão de acessos RBAC, tema visual dinâmico, logs de auditoria geral, API keys e backups do banco JSON.',
      icon: Settings,
      color: '#8b5cf6', // violet-500
      allowedRoles: ['admin']
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
    // Admin always sees everything
    if (userRole === 'admin') return true;

    // Check specific sector restrictions on user object if present (e.g. allowedSectors: ['rh'])
    if (user?.allowedSectors && Array.isArray(user.allowedSectors)) {
      // Map module IDs to sector names
      const modSector = mod.id === 'hr' ? 'rh' : mod.id === 'quality' ? 'qualidade' : mod.id;
      // If user has restricted sectors, verify sector inclusion
      if (user.allowedSectors.length > 0 && !user.allowedSectors.includes('all') && !user.allowedSectors.includes('admin')) {
        // Special mapping for RH role: RH and Quality (BI)
        if (userRole === 'rh') {
          return mod.id === 'hr' || mod.id === 'quality';
        }
        return user.allowedSectors.includes(modSector);
      }
    }

    // Map module IDs to RBAC permission keys
    const permKey = mod.id === 'quality' ? 'index' : mod.id;

    // Check dynamic RBAC matrix if available
    if (userProfileConfig && userProfileConfig.permissions && userProfileConfig.permissions[permKey] !== undefined) {
      return userProfileConfig.permissions[permKey] !== 'none';
    }

    // Default fallback if profile permissions matrix hasn't loaded or isn't set
    if (userRole === 'rh') {
      return mod.id === 'hr' || mod.id === 'quality';
    }

    return mod.allowedRoles.includes(userRole);
  });

  const roleLabel = userProfileConfig?.name || (
    userRole === 'admin' 
      ? 'Administrador Geral' 
      : userRole === 'rh' 
      ? 'Recursos Humanos' 
      : userRole === 'financial' 
      ? 'Gestão Financeira' 
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

        <div style={styles.grid}>
          {visibleModules.map((mod) => {
            const Icon = mod.icon;
            
            return (
              <div 
                key={mod.id} 
                style={styles.card}
                onClick={() => onSelectModule(mod.id)}
              >
                <div style={{ ...styles.iconBox, backgroundColor: mod.color }}>
                  <Icon size={22} color="#fff" />
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
    padding: '1rem',
  },
  wrapper: {
    width: '100%',
    maxWidth: '1000px',
  },
  header: {
    textAlign: 'center',
    marginBottom: '1.5rem',
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
  cardDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
    pointerEvents: 'none',
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
  noAccessMsg: {
    width: '100%',
    textAlign: 'center',
    padding: '0.5rem',
    fontSize: '0.75rem',
    color: 'var(--danger-color)',
    backgroundColor: 'var(--danger-light)',
    borderRadius: 'var(--border-radius-sm)',
    fontWeight: '600',
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
