import React, { useState, useEffect } from 'react';
import { dbService } from '../../firebase';
import { Save, Droplet, RefreshCw, CheckCircle2, AlertTriangle, LayoutGrid, Table, CheckCheck } from 'lucide-react';
import SignaturePad from './SignaturePad';

const CRITERIA = [
  { id: 'acesso', label: 'Acesso' },
  { id: 'sinalizacao', label: 'Sinalização' },
  { id: 'caixa', label: 'Caixa' },
  { id: 'mangueira', label: 'Mangueira' },
  { id: 'esguicho', label: 'Esguicho' },
  { id: 'chave', label: 'Chave' },
  { id: 'registro', label: 'Registro' },
  { id: 'estado_fisico', label: 'Estado' }
];

export default function WeeklyFireHydrantForm({ onSuccess }) {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    inspectorName: '',
    tecnicoSeguranca: '',
    signature: '',
    items: []
  });

  const [loading, setLoading] = useState(false);
  const [loadingEquip, setLoadingEquip] = useState(true);
  const [message, setMessage] = useState('');
  // Visualização: 'cards' para mobile / tablet ou 'table' para desktop
  const [viewMode, setViewMode] = useState('cards');

  useEffect(() => {
    if (window.innerWidth >= 1024) {
      setViewMode('table');
    } else {
      setViewMode('cards');
    }
  }, []);

  const loadHydrants = async () => {
    setLoadingEquip(true);
    try {
      const data = await dbService.getEquipment('HYDRANT');
      const activeList = (data || []).filter(item => item.status === 'ATIVO');

      const initialItems = activeList.length > 0 ? activeList.map((hyd, i) => ({
        hydrantNum: i + 1,
        equipmentId: hyd.id,
        code: hyd.code || `HID-${String(i + 1).padStart(2, '0')}`,
        sector: hyd.sector || 'Geral',
        type: hyd.type || 'Hidrante de Parede',
        evaluations: CRITERIA.reduce((acc, c) => ({ ...acc, [c.id]: 'C' }), {})
      })) : Array.from({ length: 6 }).map((_, i) => ({
        hydrantNum: i + 1,
        code: `HID-${String(i + 1).padStart(2, '0')}`,
        sector: 'Geral',
        type: 'Hidrante de Parede',
        evaluations: CRITERIA.reduce((acc, c) => ({ ...acc, [c.id]: 'C' }), {})
      }));

      setFormData(prev => ({
        ...prev,
        items: initialItems
      }));
    } catch (err) {
      console.error('Erro ao carregar hidrantes para formulário', err);
    } finally {
      setLoadingEquip(false);
    }
  };

  useEffect(() => {
    loadHydrants();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEvaluationChange = (index, critId, value) => {
    setFormData(prev => {
      const newItems = [...prev.items];
      newItems[index].evaluations[critId] = value;
      return { ...prev, items: newItems };
    });
  };

  // Marcar todos os critérios de um hidrante específico como Conforme
  const handleSetHydrantAllConform = (index) => {
    setFormData(prev => {
      const newItems = [...prev.items];
      newItems[index].evaluations = CRITERIA.reduce((acc, c) => ({ ...acc, [c.id]: 'C' }), {});
      return { ...prev, items: newItems };
    });
  };

  // Marcar todos os hidrantes como 100% Conforme
  const handleSetAllConformGlobal = () => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map(item => ({
        ...item,
        evaluations: CRITERIA.reduce((acc, c) => ({ ...acc, [c.id]: 'C' }), {})
      }))
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      await dbService.saveFireHydrantInspection({
        date: formData.date,
        inspectorName: formData.inspectorName,
        tecnicoSeguranca: formData.tecnicoSeguranca || '',
        signature: formData.signature || '',
        items: formData.items,
        createdAt: new Date().toISOString()
      });
      setMessage('Inspeção de hidrantes salva com sucesso!');
      if (onSuccess) onSuccess();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error(error);
      setMessage('Erro ao salvar inspeção.');
    } finally {
      setLoading(false);
    }
  };

  let totalNC = 0;
  formData.items.forEach(item => {
    Object.values(item.evaluations || {}).forEach(v => {
      if (v === 'NC') totalNC++;
    });
  });

  return (
    <div style={styles.card}>
      {/* Cabeçalho */}
      <div style={styles.header}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Droplet size={20} color="#0284c7" />
            <h2 style={styles.cardTitle}>Inspeção de Hidrantes</h2>
          </div>
          <p style={styles.cardSubtitle}>
            Checklist técnico dos {formData.items.length} hidrantes ativos cadastrados na clínica.
          </p>
        </div>

        <div style={styles.headerActions}>
          {/* Alternador de Modo de Visualização */}
          <div style={styles.viewToggleGroup}>
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              style={{ ...styles.viewToggleBtn, ...(viewMode === 'cards' ? styles.viewToggleBtnActive : {}) }}
              title="Modo Cartões (ideal para celular e tablet)"
            >
              <LayoutGrid size={15} /> Cartões
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              style={{ ...styles.viewToggleBtn, ...(viewMode === 'table' ? styles.viewToggleBtnActive : {}) }}
              title="Modo Tabela (ideal para computador)"
            >
              <Table size={15} /> Tabela
            </button>
          </div>

          <button 
            type="button" 
            onClick={loadHydrants} 
            style={styles.refreshBtn}
            title="Recarregar lista de hidrantes cadastrados"
          >
            <RefreshCw size={14} className={loadingEquip ? 'animate-spin' : ''} /> Atualizar
          </button>
        </div>
      </div>
      
      {message && (
        <div style={{ ...styles.alert, backgroundColor: message.includes('Erro') ? '#fef2f2' : '#f0fdf4', color: message.includes('Erro') ? '#991b1b' : '#166534', border: `1px solid ${message.includes('Erro') ? '#f87171' : '#4ade80'}` }}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} style={styles.form}>
        {/* Barra superior de Dados e Ação Rápida */}
        <div style={styles.topControlGrid}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Data da Inspeção</label>
            <input 
              type="date" 
              name="date"
              value={formData.date}
              onChange={handleChange}
              style={styles.input}
              required 
            />
          </div>

          <div style={styles.quickActionBox}>
            <button 
              type="button" 
              onClick={handleSetAllConformGlobal}
              style={styles.quickConformBtn}
            >
              <CheckCheck size={16} /> Marcar Todos como Conforme
            </button>
            <span style={styles.quickStatText}>
              {totalNC === 0 ? '✓ 100% Conforme' : `⚠ ${totalNC} não-conformidade(s)`}
            </span>
          </div>
        </div>

        {/* 1. Modo Cartões Touch (Mobile / Tablet) */}
        {viewMode === 'cards' && (
          <div style={styles.cardsGrid}>
            {formData.items.map((item, index) => {
              const hasNC = Object.values(item.evaluations || {}).some(v => v === 'NC');
              return (
                <div 
                  key={item.code || item.hydrantNum} 
                  style={{
                    ...styles.equipmentCard,
                    borderColor: hasNC ? '#fca5a5' : '#e2e8f0',
                    backgroundColor: hasNC ? '#fffaf0' : '#ffffff'
                  }}
                >
                  <div style={styles.equipmentCardHeader}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                      <span style={styles.cardCodeBadge}>{item.code || `#${item.hydrantNum}`}</span>
                      <span style={styles.cardSector}>{item.sector}</span>
                      <span style={styles.cardTypeBadge}>{item.type}</span>
                    </div>

                    <button 
                      type="button" 
                      onClick={() => handleSetHydrantAllConform(index)}
                      style={styles.cardQuickAllBtn}
                      title="Marcar todos os itens deste hidrante como Conforme"
                    >
                      <CheckCircle2 size={14} color="#16a34a" /> Tudo Conforme
                    </button>
                  </div>

                  {/* Grid de Critérios Touch */}
                  <div style={styles.criteriaTouchGrid}>
                    {CRITERIA.map(c => {
                      const isC = item.evaluations[c.id] === 'C';
                      const isNC = item.evaluations[c.id] === 'NC';
                      return (
                        <div key={c.id} style={styles.criterionRow}>
                          <span style={styles.criterionLabel}>{c.label}</span>
                          <div style={styles.touchPillGroup}>
                            <button
                              type="button"
                              onClick={() => handleEvaluationChange(index, c.id, 'C')}
                              style={{
                                ...styles.touchPill,
                                ...(isC ? styles.touchPillCActive : styles.touchPillInactive)
                              }}
                            >
                              C
                            </button>
                            <button
                              type="button"
                              onClick={() => handleEvaluationChange(index, c.id, 'NC')}
                              style={{
                                ...styles.touchPill,
                                ...(isNC ? styles.touchPillNCActive : styles.touchPillInactive)
                              }}
                            >
                              NC
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 2. Modo Tabela Clássica (Desktop) */}
        {viewMode === 'table' && (
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead style={styles.tableHead}>
                <tr>
                  <th style={{ ...styles.th, width: '80px' }}>Código</th>
                  <th style={{ ...styles.th, textAlign: 'left', minWidth: '150px' }}>Setor</th>
                  <th style={{ ...styles.th, minWidth: '130px' }}>Tipo</th>
                  {CRITERIA.map(c => (
                    <th key={c.id} style={{...styles.th, textAlign: 'center'}}>{c.label}</th>
                  ))}
                  <th style={{ ...styles.th, width: '90px' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {formData.items.map((item, index) => (
                  <tr key={item.code || item.hydrantNum} style={styles.tr}>
                    <td style={{...styles.td, fontWeight: '700', textAlign: 'center', color: '#0f172a'}}>
                      {item.code || `#${item.hydrantNum}`}
                    </td>
                    <td style={styles.td}>
                      <span style={{ fontWeight: '600', color: '#334155' }}>{item.sector}</span>
                    </td>
                    <td style={{ ...styles.td, textAlign: 'center' }}>
                      <span style={styles.typeBadge}>{item.type}</span>
                    </td>
                    {CRITERIA.map(c => {
                      const isC = item.evaluations[c.id] === 'C';
                      return (
                        <td key={c.id} style={{...styles.td, textAlign: 'center'}}>
                          <select
                            value={item.evaluations[c.id]}
                            onChange={(e) => handleEvaluationChange(index, c.id, e.target.value)}
                            style={{
                              ...styles.selectSmall,
                              backgroundColor: isC ? '#f0fdf4' : '#fef2f2',
                              color: isC ? '#15803d' : '#b91c1c',
                              borderColor: isC ? '#bbf7d0' : '#fecaca',
                              fontWeight: 'bold',
                              textAlign: 'center',
                              padding: '0.2rem'
                            }}
                          >
                            <option value="C">C</option>
                            <option value="NC">NC</option>
                          </select>
                        </td>
                      );
                    })}
                    <td style={{ ...styles.td, textAlign: 'center' }}>
                      <button
                        type="button"
                        onClick={() => handleSetHydrantAllConform(index)}
                        style={styles.tableQuickBtn}
                        title="Marcar Conforme"
                      >
                        <CheckCircle2 size={13} color="#16a34a" /> OK
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Identificação e Assinatura Touch */}
        <div style={styles.signaturesSection}>
          <div style={styles.grid2}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Inspetor Responsável</label>
              <input 
                type="text" 
                name="inspectorName"
                value={formData.inspectorName}
                onChange={handleChange}
                style={styles.input}
                placeholder="Nome do inspetor"
                required 
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Técnico de Segurança</label>
              <input 
                type="text" 
                name="tecnicoSeguranca"
                value={formData.tecnicoSeguranca || ''}
                onChange={handleChange}
                style={styles.input}
                placeholder="Nome do técnico"
                required 
              />
            </div>
          </div>

          {/* Assinatura Touch na Tela */}
          <SignaturePad 
            value={formData.signature}
            onChange={(sig) => setFormData(prev => ({ ...prev, signature: sig }))}
            label="Assinatura Digital Touch"
            placeholder="Assine com o dedo ou caneta touch no celular ou tablet"
          />
        </div>

        <div style={styles.actions}>
          <button 
            type="submit" 
            disabled={loading}
            style={loading ? {...styles.btnPrimary, opacity: 0.7} : styles.btnPrimary}
          >
            <Save size={18} />
            <span>{loading ? 'Salvando...' : 'Salvar Inspeção'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

const styles = {
  card: {
    backgroundColor: '#ffffff',
    padding: '1.25rem',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    border: '1px solid #e2e8f0',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.25rem',
    flexWrap: 'wrap',
    gap: '0.75rem'
  },
  cardTitle: {
    fontSize: '1.2rem',
    fontWeight: '800',
    color: '#0f172a',
    margin: 0
  },
  cardSubtitle: {
    margin: 0,
    fontSize: '0.82rem',
    color: '#64748b'
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    flexWrap: 'wrap'
  },
  viewToggleGroup: {
    display: 'flex',
    backgroundColor: '#f1f5f9',
    padding: '0.2rem',
    borderRadius: '8px'
  },
  viewToggleBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
    padding: '0.35rem 0.7rem',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: 'transparent',
    color: '#64748b',
    fontSize: '0.78rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.15s'
  },
  viewToggleBtnActive: {
    backgroundColor: '#ffffff',
    color: '#0284c7',
    boxShadow: '0 1px 2px rgba(0,0,0,0.08)'
  },
  refreshBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
    padding: '0.4rem 0.8rem',
    backgroundColor: '#f1f5f9',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    fontSize: '0.78rem',
    fontWeight: '600',
    color: '#475569',
    cursor: 'pointer'
  },
  alert: {
    padding: '0.85rem 1rem',
    borderRadius: '8px',
    marginBottom: '1.25rem',
    fontWeight: '600',
    fontSize: '0.85rem'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  topControlGrid: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    flexWrap: 'wrap',
    gap: '1rem',
    backgroundColor: '#f8fafc',
    padding: '0.85rem 1rem',
    borderRadius: '8px',
    border: '1px solid #e2e8f0'
  },
  quickActionBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    flexWrap: 'wrap'
  },
  quickConformBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    padding: '0.5rem 0.9rem',
    backgroundColor: '#10b981',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '0.8rem',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 1px 2px rgba(16, 185, 129, 0.2)'
  },
  quickStatText: {
    fontSize: '0.8rem',
    fontWeight: '700',
    color: '#334155'
  },
  cardsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '1rem'
  },
  equipmentCard: {
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.85rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
    transition: 'all 0.15s'
  },
  equipmentCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '0.5rem',
    paddingBottom: '0.65rem',
    borderBottom: '1px solid #f1f5f9'
  },
  cardCodeBadge: {
    backgroundColor: '#0f172a',
    color: '#ffffff',
    padding: '0.25rem 0.55rem',
    borderRadius: '6px',
    fontWeight: '800',
    fontSize: '0.82rem'
  },
  cardSector: {
    fontWeight: '700',
    color: '#1e293b',
    fontSize: '0.88rem'
  },
  cardTypeBadge: {
    backgroundColor: '#e0f2fe',
    color: '#0369a1',
    padding: '0.15rem 0.45rem',
    borderRadius: '4px',
    fontSize: '0.72rem',
    fontWeight: '700'
  },
  cardQuickAllBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.25rem 0.55rem',
    backgroundColor: '#f0fdf4',
    border: '1px solid #bbf7d0',
    borderRadius: '5px',
    fontSize: '0.72rem',
    fontWeight: '700',
    color: '#15803d',
    cursor: 'pointer'
  },
  criteriaTouchGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: '0.65rem'
  },
  criterionRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.3rem',
    backgroundColor: '#f8fafc',
    padding: '0.45rem 0.6rem',
    borderRadius: '6px',
    border: '1px solid #f1f5f9'
  },
  criterionLabel: {
    fontSize: '0.75rem',
    fontWeight: '700',
    color: '#475569'
  },
  touchPillGroup: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '0.35rem'
  },
  touchPill: {
    height: '38px',
    borderRadius: '6px',
    border: '1px solid transparent',
    fontSize: '0.82rem',
    fontWeight: '800',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.12s'
  },
  touchPillCActive: {
    backgroundColor: '#16a34a',
    color: '#ffffff',
    borderColor: '#15803d',
    boxShadow: '0 2px 4px rgba(22, 163, 74, 0.25)'
  },
  touchPillNCActive: {
    backgroundColor: '#dc2626',
    color: '#ffffff',
    borderColor: '#b91c1c',
    boxShadow: '0 2px 4px rgba(220, 38, 38, 0.25)'
  },
  touchPillInactive: {
    backgroundColor: '#ffffff',
    color: '#64748b',
    borderColor: '#cbd5e1'
  },
  grid2: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: '1rem',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem',
  },
  label: {
    fontSize: '0.82rem',
    fontWeight: '700',
    color: '#475569',
  },
  input: {
    padding: '0.65rem 0.75rem',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    fontSize: '0.9rem',
    width: '100%',
    boxSizing: 'border-box'
  },
  signaturesSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    marginTop: '0.5rem',
    paddingTop: '1rem',
    borderTop: '1px solid #f1f5f9'
  },
  tableContainer: {
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    overflowX: 'auto',
    WebkitOverflowScrolling: 'touch'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    minWidth: '850px'
  },
  tableHead: {
    backgroundColor: '#0c4a6e',
  },
  th: {
    backgroundColor: '#0c4a6e',
    padding: '0.75rem 0.5rem',
    textAlign: 'center',
    fontSize: '0.78rem',
    fontWeight: '700',
    color: '#ffffff',
    borderRight: '1px solid rgba(255, 255, 255, 0.2)',
    borderBottom: '1px solid #075985',
    whiteSpace: 'nowrap'
  },
  tr: {
    borderBottom: '1px solid #f1f5f9',
  },
  td: {
    padding: '0.5rem',
    fontSize: '0.85rem',
    color: '#334155',
    borderRight: '1px solid #f1f5f9',
  },
  selectSmall: {
    padding: '0.35rem',
    borderRadius: '4px',
    border: '1px solid #cbd5e1',
    fontSize: '0.78rem',
    width: '100%',
    boxSizing: 'border-box',
    cursor: 'pointer'
  },
  typeBadge: {
    backgroundColor: '#f1f5f9',
    color: '#0f172a',
    padding: '0.15rem 0.4rem',
    borderRadius: '4px',
    fontSize: '0.72rem',
    fontWeight: '700'
  },
  tableQuickBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.2rem',
    padding: '0.2rem 0.4rem',
    backgroundColor: '#f0fdf4',
    border: '1px solid #bbf7d0',
    borderRadius: '4px',
    fontSize: '0.72rem',
    fontWeight: '700',
    color: '#15803d',
    cursor: 'pointer'
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: '0.5rem',
  },
  btnPrimary: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    backgroundColor: '#0284c7',
    color: '#ffffff',
    padding: '0.7rem 1.5rem',
    borderRadius: '8px',
    border: 'none',
    fontWeight: '700',
    fontSize: '0.92rem',
    cursor: 'pointer',
    boxShadow: '0 2px 4px rgba(2, 132, 199, 0.2)'
  }
};
