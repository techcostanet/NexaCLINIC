import React, { useState, useEffect } from 'react';
import { dbService } from '../../firebase';
import { Save, CheckCircle2, AlertTriangle, LayoutGrid, Table, Coffee, CheckCheck } from 'lucide-react';
import SignaturePad from './SignaturePad';

const SHIFTS = [
  '1º Turno (Manhã)',
  '2º Turno (Tarde)',
  '3º Turno (Noite)'
];

const ITEMS = [
  { id: 'uso_epi', label: 'Uso adequado do EPI' },
  { id: 'higienizacao', label: 'Higienização das mãos' },
  { id: 'descarte', label: 'Descarte de resíduos' },
  { id: 'conservacao', label: 'Conservação e armazenamento de EPI' },
  { id: 'ausencia_adornos', label: 'Ausência de adornos durante as atividades' },
  { id: 'bancadas_superficies', label: 'Bancadas e superfícies limpas e organizadas' },
  { id: 'condicoes_unhas', label: 'Condições e comprimento das unhas, conforme os requisitos de higiene' }
];

export default function DailyCopaChecklist({ onSuccess }) {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().substring(0, 5),
    shift: SHIFTS[0],
    sector: 'Copa',
    nutricionista: '',
    tecnicoSeguranca: '',
    signature: '',
    evaluations: ITEMS.reduce((acc, item) => ({
      ...acc,
      [item.id]: { status: 'C', observation: '' }
    }), {})
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [viewMode, setViewMode] = useState('cards');

  useEffect(() => {
    if (window.innerWidth >= 1024) {
      setViewMode('table');
    } else {
      setViewMode('cards');
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEvaluationChange = (itemId, field, value) => {
    setFormData(prev => ({
      ...prev,
      evaluations: {
        ...prev.evaluations,
        [itemId]: {
          ...prev.evaluations[itemId],
          [field]: value
        }
      }
    }));
  };

  // Marcar todos os itens como Conforme
  const handleSetAllConform = () => {
    setFormData(prev => ({
      ...prev,
      evaluations: ITEMS.reduce((acc, item) => ({
        ...acc,
        [item.id]: { ...prev.evaluations[item.id], status: 'C' }
      }), {})
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      await dbService.saveCopaInspection({
        ...formData,
        createdAt: new Date().toISOString()
      });
      setMessage('Checklist da Copa salvo com sucesso!');
      if (onSuccess) onSuccess();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error(error);
      setMessage('Erro ao salvar checklist.');
    } finally {
      setLoading(false);
    }
  };

  let totalNC = 0;
  Object.values(formData.evaluations || {}).forEach(ev => {
    if (ev.status === 'NC') totalNC++;
  });

  return (
    <div style={styles.card}>
      {/* Cabeçalho */}
      <div style={styles.header}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Coffee size={20} color="#0891b2" />
            <h2 style={styles.cardTitle}>Checklist Diário - Copa</h2>
          </div>
          <p style={styles.cardSubtitle}>
            Verificação diária de conformidade, segurança e boas práticas na Copa.
          </p>
        </div>

        <div style={styles.headerActions}>
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
        </div>
      </div>
      
      {message && (
        <div style={{ 
          ...styles.alert, 
          backgroundColor: message.includes('Erro') ? '#fef2f2' : '#f0fdf4', 
          color: message.includes('Erro') ? '#991b1b' : '#166534', 
          border: `1px solid ${message.includes('Erro') ? '#f87171' : '#4ade80'}` 
        }}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} style={styles.form}>
        {/* Dados Básicos */}
        <div style={styles.grid4}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Data</label>
            <input 
              type="date" 
              name="date"
              value={formData.date}
              onChange={handleChange}
              style={styles.input}
              required 
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Horário</label>
            <input 
              type="time" 
              name="time"
              value={formData.time}
              onChange={handleChange}
              style={styles.input}
              required 
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Turno</label>
            <select 
              name="shift"
              value={formData.shift}
              onChange={handleChange}
              style={styles.input}
            >
              {SHIFTS.map(shift => (
                <option key={shift} value={shift}>{shift}</option>
              ))}
            </select>
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Setor</label>
            <input 
              type="text" 
              name="sector"
              value={formData.sector}
              readOnly
              style={{ ...styles.input, backgroundColor: '#f1f5f9', cursor: 'not-allowed', fontWeight: '600' }}
            />
          </div>
        </div>

        {/* Barra de ação rápida */}
        <div style={styles.quickBar}>
          <button
            type="button"
            onClick={handleSetAllConform}
            style={styles.quickConformBtn}
          >
            <CheckCheck size={16} /> Conformes
          </button>
          <span style={styles.quickStatText}>
            {totalNC === 0 ? '✓ 100% Conforme' : `⚠ ${totalNC} item(ns) não conforme(s)`}
          </span>
        </div>

        {/* 1. Modo Cartões Touch (Mobile / Tablet) */}
        {viewMode === 'cards' && (
          <div style={styles.cardsGrid}>
            {ITEMS.map(item => {
              const evalData = formData.evaluations[item.id] || { status: 'C', observation: '' };
              const isC = evalData.status === 'C';
              const isNC = evalData.status === 'NC';
              const isNA = evalData.status === 'NA';

              return (
                <div 
                  key={item.id} 
                  style={{
                    ...styles.itemCard,
                    borderColor: isNC ? '#fca5a5' : '#e2e8f0',
                    backgroundColor: isNC ? '#fffaf0' : '#ffffff'
                  }}
                >
                  <div style={styles.itemCardHeader}>
                    <span style={styles.itemLabel}>{item.label}</span>
                    <span style={{
                      ...styles.statusBadge,
                      backgroundColor: isC ? '#dcfce7' : isNC ? '#fee2e2' : '#f1f5f9',
                      color: isC ? '#15803d' : isNC ? '#b91c1c' : '#475569'
                    }}>
                      {isC ? 'Conforme' : isNC ? 'Não Conforme' : 'Não Avaliado'}
                    </span>
                  </div>

                  {/* Botões Touch Segmentados */}
                  <div style={styles.touchButtonsRow}>
                    <button
                      type="button"
                      onClick={() => handleEvaluationChange(item.id, 'status', 'C')}
                      style={{
                        ...styles.touchPill,
                        ...(isC ? styles.touchPillCActive : styles.touchPillInactive)
                      }}
                    >
                      <CheckCircle2 size={15} /> Conforme (C)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleEvaluationChange(item.id, 'status', 'NC')}
                      style={{
                        ...styles.touchPill,
                        ...(isNC ? styles.touchPillNCActive : styles.touchPillInactive)
                      }}
                    >
                      <AlertTriangle size={15} /> Não Conforme (NC)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleEvaluationChange(item.id, 'status', 'NA')}
                      style={{
                        ...styles.touchPill,
                        ...(isNA ? styles.touchPillNAActive : styles.touchPillInactive)
                      }}
                    >
                      Não Avaliado (NA)
                    </button>
                  </div>

                  {/* Observações */}
                  <div style={{ marginTop: '0.25rem' }}>
                    <input 
                      type="text" 
                      value={evalData.observation}
                      onChange={(e) => handleEvaluationChange(item.id, 'observation', e.target.value)}
                      placeholder="Observações do item (se houver)..."
                      style={styles.inputObservation}
                    />
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
                  <th style={styles.th}>Descrição</th>
                  <th style={{...styles.th, textAlign: 'center'}}>Avaliação</th>
                  <th style={styles.th}>Observações</th>
                </tr>
              </thead>
              <tbody>
                {ITEMS.map(item => (
                  <tr key={item.id} style={styles.tr}>
                    <td style={styles.td}>
                      {item.label}
                    </td>
                    <td style={{...styles.td, textAlign: 'center'}}>
                      <div style={styles.radioGroup}>
                        <label style={styles.radioLabel}>
                          <input 
                            type="radio" 
                            name={`status-${item.id}`} 
                            value="C" 
                            checked={formData.evaluations[item.id].status === 'C'}
                            onChange={(e) => handleEvaluationChange(item.id, 'status', e.target.value)}
                          />
                          <span style={{ color: '#16a34a', fontWeight: 'bold' }} title="Conforme">C</span>
                        </label>
                        <label style={styles.radioLabel}>
                          <input 
                            type="radio" 
                            name={`status-${item.id}`} 
                            value="NC" 
                            checked={formData.evaluations[item.id].status === 'NC'}
                            onChange={(e) => handleEvaluationChange(item.id, 'status', e.target.value)}
                          />
                          <span style={{ color: '#dc2626', fontWeight: 'bold' }} title="Não Conforme">NC</span>
                        </label>
                        <label style={styles.radioLabel}>
                          <input 
                            type="radio" 
                            name={`status-${item.id}`} 
                            value="NA" 
                            checked={formData.evaluations[item.id].status === 'NA'}
                            onChange={(e) => handleEvaluationChange(item.id, 'status', e.target.value)}
                          />
                          <span style={{ color: '#6b7280', fontWeight: 'bold' }} title="Não Avaliado">NA</span>
                        </label>
                      </div>
                    </td>
                    <td style={styles.td}>
                      <input 
                        type="text" 
                        value={formData.evaluations[item.id].observation}
                        onChange={(e) => handleEvaluationChange(item.id, 'observation', e.target.value)}
                        placeholder="Observações..."
                        style={styles.input}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Responsáveis e Assinatura Touch */}
        <div style={styles.signaturesSection}>
          <div style={styles.grid2}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Nutricionista</label>
              <input 
                type="text" 
                name="nutricionista"
                value={formData.nutricionista}
                onChange={handleChange}
                style={styles.input}
                placeholder="Nome do(a) nutricionista"
                required 
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Técnico</label>
              <input 
                type="text" 
                name="tecnicoSeguranca"
                value={formData.tecnicoSeguranca}
                onChange={handleChange}
                style={styles.input}
                placeholder="Nome do técnico"
                required 
              />
            </div>
          </div>

          {/* Assinatura Touch */}
          <SignaturePad 
            value={formData.signature}
            onChange={(sig) => setFormData(prev => ({ ...prev, signature: sig }))}
            label="Assinatura"
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
            <span>{loading ? 'Salvando...' : 'Salvar'}</span>
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
    padding: '3px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0'
  },
  viewToggleBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    padding: '0.4rem 0.75rem',
    fontSize: '0.8rem',
    fontWeight: '600',
    color: '#64748b',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.15s ease'
  },
  viewToggleBtnActive: {
    backgroundColor: '#ffffff',
    color: '#0891b2',
    boxShadow: '0 1px 2px rgba(0,0,0,0.08)'
  },
  alert: {
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    marginBottom: '1.25rem',
    fontSize: '0.88rem',
    fontWeight: '500'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem'
  },
  grid4: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem'
  },
  grid2: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '1rem'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem'
  },
  label: {
    fontSize: '0.82rem',
    fontWeight: '600',
    color: '#334155'
  },
  input: {
    padding: '0.55rem 0.75rem',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    fontSize: '0.88rem',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box'
  },
  quickBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.6rem 0.85rem',
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    flexWrap: 'wrap',
    gap: '0.5rem'
  },
  quickConformBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    padding: '0.45rem 0.85rem',
    backgroundColor: '#ecfdf5',
    color: '#047857',
    border: '1px solid #a7f3d0',
    borderRadius: '6px',
    fontSize: '0.82rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.15s ease'
  },
  quickStatText: {
    fontSize: '0.82rem',
    fontWeight: '600',
    color: '#475569'
  },
  cardsGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem'
  },
  itemCard: {
    padding: '0.9rem',
    borderRadius: '10px',
    border: '1px solid #e2e8f0',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.65rem',
    transition: 'all 0.15s ease'
  },
  itemCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '0.5rem'
  },
  itemLabel: {
    fontSize: '0.92rem',
    fontWeight: '600',
    color: '#1e293b'
  },
  statusBadge: {
    fontSize: '0.75rem',
    fontWeight: '700',
    padding: '0.2rem 0.55rem',
    borderRadius: '20px',
    whiteSpace: 'nowrap'
  },
  touchButtonsRow: {
    display: 'flex',
    gap: '0.4rem',
    flexWrap: 'wrap'
  },
  touchPill: {
    flex: '1',
    minWidth: '110px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.35rem',
    padding: '0.55rem 0.5rem',
    borderRadius: '8px',
    fontSize: '0.8rem',
    fontWeight: '600',
    cursor: 'pointer',
    border: '1px solid transparent',
    transition: 'all 0.15s ease'
  },
  touchPillInactive: {
    backgroundColor: '#f8fafc',
    color: '#64748b',
    borderColor: '#e2e8f0'
  },
  touchPillCActive: {
    backgroundColor: '#10b981',
    color: '#ffffff',
    borderColor: '#059669',
    boxShadow: '0 2px 4px rgba(16, 185, 129, 0.25)'
  },
  touchPillNCActive: {
    backgroundColor: '#ef4444',
    color: '#ffffff',
    borderColor: '#dc2626',
    boxShadow: '0 2px 4px rgba(239, 68, 68, 0.25)'
  },
  touchPillNAActive: {
    backgroundColor: '#64748b',
    color: '#ffffff',
    borderColor: '#475569'
  },
  inputObservation: {
    width: '100%',
    padding: '0.45rem 0.65rem',
    borderRadius: '6px',
    border: '1px solid #e2e8f0',
    fontSize: '0.82rem',
    outline: 'none',
    backgroundColor: '#fafafa',
    boxSizing: 'border-box'
  },
  tableContainer: {
    overflowX: 'auto',
    border: '1px solid #e2e8f0',
    borderRadius: '8px'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.85rem'
  },
  tableHead: {
    backgroundColor: '#f8fafc'
  },
  th: {
    padding: '0.75rem',
    textAlign: 'left',
    color: '#475569',
    fontWeight: '600',
    borderBottom: '1px solid #e2e8f0'
  },
  tr: {
    borderBottom: '1px solid #e2e8f0'
  },
  td: {
    padding: '0.65rem 0.75rem',
    verticalAlign: 'middle',
    color: '#334155'
  },
  radioGroup: {
    display: 'flex',
    justifyContent: 'center',
    gap: '0.85rem'
  },
  radioLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    cursor: 'pointer',
    fontSize: '0.82rem'
  },
  signaturesSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    padding: '1rem',
    backgroundColor: '#f8fafc',
    borderRadius: '10px',
    border: '1px solid #e2e8f0',
    marginTop: '0.5rem'
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: '0.5rem'
  },
  btnPrimary: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    backgroundColor: '#0891b2',
    color: '#ffffff',
    padding: '0.65rem 1.25rem',
    borderRadius: '6px',
    border: 'none',
    fontWeight: '600',
    cursor: 'pointer',
    fontSize: '0.9rem',
    transition: 'background-color 0.15s ease'
  }
};
