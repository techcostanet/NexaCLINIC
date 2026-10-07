import React, { useState } from 'react';
import { 
  HeartHandshake, Brain, Apple, LayoutDashboard, FileSpreadsheet,
  Users, CheckCircle2, AlertCircle
} from 'lucide-react';
import ModuleHeader from '../common/ModuleHeader';
import { useUnit } from '../../contexts/UnitContext';
import MultiDashboardTab from './MultiDashboardTab';
import MultiSocialTab from './MultiSocialTab';
import MultiPsychologyTab from './MultiPsychologyTab';
import MultiNutritionTab from './MultiNutritionTab';
import MultiReportsModal from './MultiReportsModal';

export default function MultiPanel({ currentUser, isReportsOpen, setIsReportsOpen }) {
  const { activeUnitId } = useUnit();
  const [activeTab, setActiveTab] = useState('social'); // Começa focado no Serviço Social conforme solicitação
  const [reportsModalOpen, setReportsModalOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (mensagem, tipo = 'sucesso') => {
    setToast({ mensagem, tipo });
    setTimeout(() => setToast(null), 3500);
  };

  // Abas com padrão rigoroso de rótulo de 1 palavra / termo único
  const abas = [
    { id: 'social', rotulo: 'Social', icone: HeartHandshake },
    { id: 'painel', rotulo: 'Painel', icone: LayoutDashboard },
    { id: 'psicologia', rotulo: 'Psicologia', icone: Brain },
    { id: 'nutricao', rotulo: 'Nutrição', icone: Apple },
  ];

  const handleOpenReports = () => {
    if (setIsReportsOpen) setIsReportsOpen(true);
    setReportsModalOpen(true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* CABEÇALHO OFICIAL DO MÓDULO */}
      <ModuleHeader
        icon={HeartHandshake}
        title=".MULTI"
        subtitle="Serviço Social, Psicologia & Nutrição"
        gradient="linear-gradient(135deg, #7c3aed, #4f46e5)"
        dotColor="#7c3aed"
        actions={
          <div style={{ display: 'flex', gap: '0.65rem' }}>
            <button
              type="button"
              onClick={handleOpenReports}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.55rem 0.95rem',
                borderRadius: '10px',
                border: '1px solid var(--border-color, #cbd5e1)',
                backgroundColor: 'var(--bg-card, #ffffff)',
                color: 'var(--text-primary, #0f172a)',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
              }}
            >
              <FileSpreadsheet size={16} color="#7c3aed" />
              <span>Relatórios</span>
            </button>
          </div>
        }
      />

      {/* TOAST INFORMATIVO */}
      {toast && (
        <div
          style={{
            padding: '0.75rem 1.25rem',
            borderRadius: '10px',
            backgroundColor: toast.tipo === 'erro' ? '#fef2f2' : '#ecfdf5',
            color: toast.tipo === 'erro' ? '#dc2626' : '#059669',
            border: `1px solid ${toast.tipo === 'erro' ? '#fecaca' : '#a7f3d0'}`,
            fontSize: '0.85rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
          }}
        >
          {toast.tipo === 'erro' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
          <span>{toast.mensagem}</span>
        </div>
      )}

      {/* NAVEGAÇÃO POR ABAS (RÓTULOS DE 1 TERMO) */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          borderBottom: '1px solid var(--border-color, #e2e8f0)',
          paddingBottom: '0.25rem',
          overflowX: 'auto'
        }}
      >
        {abas.map((a) => {
          const Icon = a.icone;
          const ativa = activeTab === a.id;
          return (
            <button
              key={a.id}
              onClick={() => setActiveTab(a.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.65rem 1.1rem',
                borderRadius: '8px 8px 0 0',
                border: 'none',
                borderBottom: ativa ? '3px solid #7c3aed' : '3px solid transparent',
                backgroundColor: ativa ? 'var(--bg-card, #ffffff)' : 'transparent',
                color: ativa ? '#7c3aed' : 'var(--text-secondary, #64748b)',
                fontSize: '0.85rem',
                fontWeight: ativa ? 700 : 500,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease'
              }}
            >
              <Icon size={16} />
              <span>{a.rotulo}</span>
            </button>
          );
        })}
      </div>

      {/* CONTEÚDO DINÂMICO DA ABA */}
      <div>
        {activeTab === 'social' && (
          <MultiSocialTab
            unitId={activeUnitId}
            currentUser={currentUser}
          />
        )}

        {activeTab === 'painel' && (
          <MultiDashboardTab
            unitId={activeUnitId}
            onSelectTab={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'psicologia' && (
          <MultiPsychologyTab
            unitId={activeUnitId}
            currentUser={currentUser}
          />
        )}

        {activeTab === 'nutricao' && (
          <MultiNutritionTab
            unitId={activeUnitId}
            currentUser={currentUser}
          />
        )}
      </div>

      {/* CENTRAL DE RELATÓRIOS MULTIPROFISSIONAIS */}
      <MultiReportsModal
        isOpen={reportsModalOpen || isReportsOpen}
        onClose={() => {
          setReportsModalOpen(false);
          if (setIsReportsOpen) setIsReportsOpen(false);
        }}
        unitId={activeUnitId}
      />
    </div>
  );
}
