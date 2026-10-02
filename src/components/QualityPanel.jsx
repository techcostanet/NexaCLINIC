import React, { useState } from 'react';
import { BarChart3, Activity, UploadCloud, Settings, FileSpreadsheet, FileText } from 'lucide-react';
import ModuleHeader from './common/ModuleHeader';
import Dashboard from './Dashboard';
import UploadData from './UploadData';
import AdminPanel from './AdminPanel';

export default function QualityPanel({ currentUser, isReportsOpen, setIsReportsOpen }) {
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'upload' | 'admin'

  const canAccessAdmin = currentUser?.role === 'admin';

  return (
    <div style={styles.container}>
      {/* Cabeçalho Padronizado do Módulo */}
      <ModuleHeader
        title=".INDEX"
        subtitle="Gestão da Qualidade, Indicadores Hospitalares e Inteligência Clínica"
        icon={BarChart3}
        gradient="linear-gradient(135deg, #0284c7, #0369a1)"
        dotColor="#0284c7"
        actions={
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            {setIsReportsOpen && (
              <button
                type="button"
                onClick={() => setIsReportsOpen(true)}
                style={styles.headerBtn}
                title="Abrir Central de Relatórios"
              >
                <FileText size={15} />
                <span>Relatórios</span>
              </button>
            )}
          </div>
        }
      />

      {/* Navegação por Abas Padronizada */}
      <div style={styles.tabContainer}>
        <button
          type="button"
          style={{ ...styles.tabButton, ...(activeTab === 'dashboard' ? styles.tabActive : {}) }}
          onClick={() => setActiveTab('dashboard')}
        >
          <Activity size={16} />
          <span>Dashboard</span>
        </button>

        <button
          type="button"
          style={{ ...styles.tabButton, ...(activeTab === 'upload' ? styles.tabActive : {}) }}
          onClick={() => setActiveTab('upload')}
        >
          <UploadCloud size={16} />
          <span>Lançamento</span>
        </button>

        {canAccessAdmin && (
          <button
            type="button"
            style={{ ...styles.tabButton, ...(activeTab === 'admin' ? styles.tabActive : {}) }}
            onClick={() => setActiveTab('admin')}
          >
            <Settings size={16} />
            <span>Admin</span>
          </button>
        )}
      </div>

      {/* Conteúdo da Aba Ativa */}
      <div style={styles.tabContent}>
        {activeTab === 'dashboard' && (
          <Dashboard 
            currentUser={currentUser} 
            onNavigateToUpload={() => setActiveTab('upload')}
          />
        )}

        {activeTab === 'upload' && (
          <UploadData 
            currentUser={currentUser} 
            onSuccess={() => setActiveTab('dashboard')}
          />
        )}

        {activeTab === 'admin' && canAccessAdmin && (
          <AdminPanel 
            currentUser={currentUser} 
          />
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
    fontFamily: 'Inter, system-ui, sans-serif'
  },
  headerBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.45rem',
    padding: '0.48rem 0.95rem',
    borderRadius: '8px',
    backgroundColor: '#f0f9ff',
    color: '#0284c7',
    border: '1px solid #bae6fd',
    fontSize: '0.85rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.15s',
    boxShadow: '0 1px 2px rgba(2,132,199,0.06)'
  },
  tabContainer: {
    display: 'flex',
    gap: '0.4rem',
    borderBottom: '2px solid #e2e8f0',
    overflowX: 'auto',
    WebkitOverflowScrolling: 'touch',
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
    paddingBottom: '2px',
    whiteSpace: 'nowrap',
    flexWrap: 'nowrap'
  },
  tabButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.45rem',
    padding: '0.65rem 1.15rem',
    border: 'none',
    background: 'none',
    fontSize: '0.88rem',
    fontWeight: '600',
    color: '#64748b',
    cursor: 'pointer',
    borderBottom: '2px solid transparent',
    marginBottom: '-2px',
    transition: 'all 0.2s',
    whiteSpace: 'nowrap',
    flexShrink: 0
  },
  tabActive: {
    color: '#0284c7',
    borderBottom: '2px solid #0284c7',
    fontWeight: '700'
  },
  tabContent: {
    width: '100%'
  }
};
