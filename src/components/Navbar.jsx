import React, { useState, useEffect } from 'react';
import { authService, dbService } from '../firebase';
import { Activity, LogOut, Menu, X, BarChart3, UploadCloud, Users, HeartPulse, FileText, LayoutGrid, Megaphone, ShoppingCart, BookOpen } from 'lucide-react';
import ChangelogModal from './ChangelogModal';
import UnitSelector from './common/UnitSelector';
import NexAiBrand from './common/NexAiBrand';

export default function Navbar({ user, currentPage, setCurrentPage, currentModule, setCurrentModule, setIsReportsOpen, setIsGuideOpen }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [changelogOpen, setChangelogOpen] = useState(false);
  const [tenantSettings, setTenantSettings] = useState({ name: 'Nex-Ai CLINIC', logo: '' });

  const loadBranding = async () => {
    try {
      const settings = await dbService.getTenantSettings();
      if (settings) {
        setTenantSettings({ name: settings.name || 'Nex-Ai CLINIC', logo: settings.logo || '' });
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadBranding();
    window.addEventListener('tenant-branding-changed', loadBranding);
    return () => window.removeEventListener('tenant-branding-changed', loadBranding);
  }, []);

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error('Erro ao deslogar:', err);
    }
  };

  // Dynamic navigation items based on the active portal
  const navItems = [];
  if (currentModule === 'quality') {
    navItems.push({ id: 'dashboard', label: 'Dashboard', icon: BarChart3 });
    navItems.push({ id: 'upload', label: 'Lançar Dados', icon: FileText });
    if (user && user.role === 'admin') {
      navItems.push({ id: 'admin', label: 'Painel Admin', icon: Users });
    }
  }

  const navigateTo = (pageId) => {
    setCurrentPage(pageId);
    setMobileMenuOpen(false);
  };

  const handleBackToSelector = () => {
    setCurrentModule('selector');
    setMobileMenuOpen(false);
  };

  const portalName = currentModule === 'assist'
    ? 'Nex-Ai.ASSIST'
    : currentModule === 'reception' 
    ? 'Nex-Ai.RECEPTION' 
    : currentModule === 'clinical'
    ? 'Nex-Ai.CLINIC'
    : currentModule === 'stock'
    ? 'Nex-Ai.STOCK'
    : currentModule === 'maintenance'
    ? 'Nex-Ai.SERVICE'
    : currentModule === 'hr'
    ? 'Nex-Ai.HR'
    : currentModule === 'finance'
    ? 'Nex-Ai.FINANCE'
    : currentModule === 'apac'
    ? 'Nex-Ai.APAC'
    : currentModule === 'purchasing'
    ? 'Nex-Ai.PROCURE'
    : currentModule === 'calendar'
    ? 'Nex-Ai.CAL'
    : currentModule === 'config'
    ? 'Nex-Ai.CONFIG'
    : currentModule === 'requisitions'
    ? 'Nex-Ai.CARE'
    : currentModule === 'sesmt'
    ? 'Nex-Ai.SAFE'
    : currentModule === 'medical'
    ? 'Nex-Ai.MED'
    : 'Nex-Ai.INDEX';

  return (
    <nav style={styles.nav}>
      <div style={styles.navContainer}>
        {/* Brand Logo */}
        <div style={styles.brand} onClick={() => currentModule === 'quality' ? navigateTo('dashboard') : handleBackToSelector()}>
          {tenantSettings.logo ? (
            <img src={tenantSettings.logo} alt="Logo" style={styles.brandLogoImg} />
          ) : null}
          <NexAiBrand size="md" showIcon={!tenantSettings.logo} suffix="" />
          {portalName && (
            <span style={{ 
              fontSize: '0.75rem', 
              fontWeight: '700', 
              color: '#4f46e5',
              backgroundColor: '#eef2ff',
              padding: '0.2rem 0.5rem',
              borderRadius: '6px',
              border: '1px solid #c7d2fe',
              marginLeft: '0.4rem',
              letterSpacing: '0.02em'
            }}>
              {portalName}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {/* Reports Button */}
          {currentModule !== 'selector' && setIsReportsOpen && (
            <button 
              onClick={() => setIsReportsOpen(true)} 
              style={{ ...styles.backSelectorBtn, backgroundColor: '#ecfdf5', color: '#047857', border: '1px solid #10b981' }}
              title="Abrir Central de Relatórios"
            >
              <FileText size={16} />
              <span className="desktop-only">Relatórios</span>
            </button>
          )}

          {/* Module Guide / Manual Button */}
          {currentModule !== 'selector' && setIsGuideOpen && (
            <button 
              onClick={() => setIsGuideOpen(true)} 
              style={{ ...styles.backSelectorBtn, backgroundColor: '#f0f9ff', color: '#0369a1', border: '1px solid #38bdf8' }}
              title="Abrir Manual e Instruções do Módulo"
            >
              <BookOpen size={16} />
              <span className="desktop-only">Manual</span>
            </button>
          )}

          {/* Back to Portal Selector Button */}
          <button 
            onClick={handleBackToSelector} 
            style={styles.backSelectorBtn}
            title="Alternar entre portais/módulos"
          >
            <LayoutGrid size={16} />
            <span className="desktop-only">Trocar Portal</span>
          </button>
        </div>

        {/* Desktop Menu */}
        <div style={styles.desktopMenu}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => navigateTo(item.id)}
                style={{
                  ...styles.navLink,
                  ...(isActive ? styles.navLinkActive : {}),
                }}
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Unit Selector */}
        <div style={{ display: 'flex', alignItems: 'center', marginRight: '0.4rem' }}>
          <UnitSelector compact showLabel={false} />
        </div>

        {/* User Profile Info & Logout */}
        <div style={styles.userInfoContainer}>
          <div style={styles.userProfile}>
            <span style={styles.userName}>{user?.name}</span>
            <span
              className={`badge ${
                user?.role === 'admin' ? 'badge-admin' : 'badge-prof'
              }`}
              style={styles.roleBadge}
            >
              {user?.role === 'admin' ? 'Admin' : 'Profissional'}
            </span>
          </div>
          <button 
            onClick={() => setChangelogOpen(true)} 
            style={styles.changelogTriggerBtn} 
            title="Novidades da Versão (Changelog)"
          >
            <Megaphone size={16} />
            <span style={styles.changelogDot}></span>
          </button>
          <button onClick={handleLogout} style={styles.logoutBtn} title="Sair do sistema">
            <LogOut size={18} />
          </button>
        </div>

        {/* Mobile Burger Toggle */}
        <button
          style={styles.mobileMenuToggle}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div style={styles.mobileMenu}>
          <div style={styles.mobileUserSection}>
            <div style={styles.mobileUserName}>{user?.name}</div>
            <div style={styles.mobileUserEmail}>{user?.email}</div>
            <div style={{ marginTop: '0.5rem' }}>
              <span
                className={`badge ${
                  user?.role === 'admin' ? 'badge-admin' : 'badge-prof'
                }`}
              >
                {user?.role === 'admin' ? 'Administrador' : 'Profissional'}
              </span>
            </div>
          </div>
          <div style={styles.mobileDivider}></div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => navigateTo(item.id)}
                style={{
                  ...styles.mobileNavLink,
                  ...(isActive ? styles.mobileNavLinkActive : {}),
                }}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
          <div style={styles.mobileDivider}></div>
          <button 
            onClick={() => { setChangelogOpen(true); setMobileMenuOpen(false); }} 
            style={styles.mobileNavLink}
          >
            <Megaphone size={18} />
            <span>Novidades da Versão</span>
          </button>
          <div style={styles.mobileDivider}></div>
          <button onClick={handleLogout} style={styles.mobileLogoutBtn}>
            <LogOut size={18} />
            <span>Sair do Sistema</span>
          </button>
        </div>
      )}
      <ChangelogModal isOpen={changelogOpen} onClose={() => setChangelogOpen(false)} />
    </nav>
  );
}

const styles = {
  nav: {
    backgroundColor: '#ffffff',
    borderBottom: '1px solid var(--border-color)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    boxShadow: 'var(--shadow-sm)',
  },
  navContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    maxWidth: 'var(--max-width)',
    height: '64px',
    margin: '0 auto',
    padding: '0 1.5rem',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    cursor: 'pointer',
  },
  brandLogoImg: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    objectFit: 'cover',
  },
  brandText: {
    fontSize: '1.25rem',
    fontWeight: '700',
    letterSpacing: '-0.02em',
    color: 'var(--text-primary)',
  },
  backSelectorBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: 'none',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--border-radius-sm)',
    padding: '0.4rem 0.75rem',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    fontSize: '0.8rem',
    fontWeight: '600',
    marginLeft: '1.5rem',
    transition: 'all var(--transition-fast)',
  },
  desktopMenu: {
    display: 'flex',
    gap: '0.75rem',
    marginLeft: '2rem',
    marginRight: 'auto',
  },
  navLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: 'none',
    border: 'none',
    padding: '0.5rem 0.75rem',
    borderRadius: 'var(--border-radius-sm)',
    color: 'var(--text-secondary)',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
  },
  navLinkActive: {
    backgroundColor: 'var(--primary-light)',
    color: 'var(--primary-color)',
  },
  userInfoContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  userProfile: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  userName: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: 'var(--text-primary)',
  },
  roleBadge: {
    fontSize: '0.65rem',
    padding: '0.1rem 0.4rem',
  },
  changelogTriggerBtn: {
    position: 'relative',
    background: 'none',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--border-radius-sm)',
    padding: '0.5rem',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all var(--transition-fast)',
  },
  changelogDot: {
    position: 'absolute',
    top: '-3px',
    right: '-3px',
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#8b5cf6',
    border: '2px solid #fff',
  },
  logoutBtn: {
    background: 'none',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--border-radius-sm)',
    padding: '0.5rem',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all var(--transition-fast)',
  },
  mobileMenuToggle: {
    display: 'none',
    background: 'none',
    border: 'none',
    color: 'var(--text-primary)',
    cursor: 'pointer',
  },
  mobileMenu: {
    display: 'none',
    backgroundColor: '#ffffff',
    borderBottom: '1px solid var(--border-color)',
    padding: '1rem 1.5rem',
  },
  mobileUserSection: {
    padding: '0.5rem 0',
  },
  mobileUserName: {
    fontSize: '1rem',
    fontWeight: '600',
    color: 'var(--text-primary)',
  },
  mobileUserEmail: {
    fontSize: '0.8rem',
    color: 'var(--text-secondary)',
  },
  mobileDivider: {
    height: '1px',
    backgroundColor: 'var(--border-color)',
    margin: '1rem 0',
  },
  mobileNavLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    background: 'none',
    border: 'none',
    padding: '0.75rem 1rem',
    borderRadius: 'var(--border-radius-sm)',
    width: '100%',
    textAlign: 'left',
    color: 'var(--text-secondary)',
    fontSize: '0.95rem',
    fontWeight: '500',
    cursor: 'pointer',
  },
  mobileNavLinkActive: {
    backgroundColor: 'var(--primary-light)',
    color: 'var(--primary-color)',
  },
  mobileLogoutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    background: 'none',
    border: 'none',
    padding: '0.75rem 1rem',
    width: '100%',
    color: 'var(--danger-color)',
    fontSize: '0.95rem',
    fontWeight: '500',
    cursor: 'pointer',
  },
  // Responsive rules overrides
  '@media (max-width: 768px)': {
    desktopMenu: {
      display: 'none',
    },
    userInfoContainer: {
      display: 'none',
    },
    mobileMenuToggle: {
      display: 'block',
    },
    mobileMenu: {
      display: 'block',
    },
  },
};

// Apply simple media query styling hack in React
const stylesInject = `
  @media (max-width: 768px) {
    .desktop-only { display: none !important; }
    .mobile-menu-toggle { display: block !important; }
  }
`;
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.type = 'text/css';
  style.innerHTML = `
    @media (max-width: 768px) {
      nav > div > div:nth-child(2) { display: none !important; }
      nav > div > div:nth-child(3) { display: none !important; }
      nav > div > button:nth-child(4) { display: block !important; }
    }
  `;
  document.head.appendChild(style);
}
