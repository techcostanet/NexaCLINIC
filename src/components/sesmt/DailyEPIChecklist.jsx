import React, { useState, useEffect } from 'react';
import { dbService } from '../../firebase';
import { Save, CheckCircle2, AlertTriangle, LayoutGrid, Table, ShieldCheck, CheckCheck } from 'lucide-react';
import SignaturePad from './SignaturePad';

const SECTORS = [
  'Salão-1', 
  'Salão-2', 
  'Salão-3', 
  'Diálise Peritoneal', 
  'Hemodiálise Externa', 
  'Bloco Cirúrgico', 
  'Reuso', 
  'Sala Amarela'
];

const SHIFTS = [
  '1º Turno (Manhã)',
  '2º Turno (Tarde)',
  '3º Turno (Noite)'
];

const ITEMS = [
  { id: 'uso_epi', label: 'Uso adequado do EPI' },
  { id: 'higienizacao', label: 'Higienização das mãos' },
  { id: 'descarte', label: 'Descarte de resíduos' },
  { id: 'conservacao', label: 'Conservação e guarda de EPI' }
];

export default function DailyEPIChecklist({ onSuccess }) {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().substring(0, 5),
    shift: SHIFTS[0],
    sector: SECTORS[0],
    enfermeiro: '',
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
      await dbService.saveEpiInspection({
        ...formData,
        createdAt: new Date().toISOString()
      });
      setMessage('Checklist de EPI salvo com sucesso!');
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
            <ShieldCheck size={20} color="#0891b2" />
            <h2 style={styles.cardTitle}>Checklist Diário de EPI</h2>
          </div>
          <p style={styles.cardSubtitle}>
            Verificação diária de conformidade e segurança em setores clínicos.
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
        <div style={{ ...styles.alert, backgroundColor: message.includes('Erro') ? '#fef2f2' : '#f0fdf4', color: message.includes('Erro') ? '#991b1b' : '#166534', border: `1px solid ${message.includes('Erro') ? '#f87171' : '#4ade80'}` }}>
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
            <select 
              name="sector"
              value={formData.sector}
              onChange={handleChange}
              style={styles.input}
            >
              {SECTORS.map(sector => (
                <option key={sector} value={sector}>{sector}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Barra de ação rápida */}
        <div style={styles.quickBar}>
          <button
            type="button"
            onClick={handleSetAllConform}
            style={styles.quickConformBtn}
          >
            <CheckCheck size={16} /> Marcar Todos como Conforme
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
              <label style={styles.label}>Enfermeiro Responsável</label>
              <input 
                type="text" 
                name="enfermeiro"
                value={formData.enfermeiro}
                onChange={handleChange}
                style={styles.input}
                placeholder="Nome do enfermeiro"
                required 
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Técnico de Segurança</label>
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

          {/* Assinatura Digital Touch */}
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
            <span>{loading ? 'Salvando...' : 'Salvar Checklist'}</span>
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
    color: '#0891b2',
    boxShadow: '0 1px 2px rgba(0,0,0,0.08)'
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
  grid4: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '0.75rem',
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
  inputObservation: {
    padding: '0.55rem 0.75rem',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    fontSize: '0.85rem',
    width: '100%',
    boxSizing: 'border-box',
    backgroundColor: '#ffffff'
  },
  quickBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '0.75rem',
    backgroundColor: '#f8fafc',
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    border: '1px solid #e2e8f0'
  },
  quickConformBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    padding: '0.45rem 0.85rem',
    backgroundColor: '#10b981',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '0.8rem',
    fontWeight: '700',
    cursor: 'pointer'
  },
  quickStatText: {
    fontSize: '0.8rem',
    fontWeight: '700',
    color: '#334155'
  },
  cardsGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.85rem'
  },
  itemCard: {
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
  },
  itemCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '0.5rem'
  },
  itemLabel: {
    fontSize: '0.95rem',
    fontWeight: '700',
    color: '#0f172a'
  },
  statusBadge: {
    fontSize: '0.75rem',
    fontWeight: '700',
    padding: '0.2rem 0.6rem',
    borderRadius: '999px'
  },
  touchButtonsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
    gap: '0.5rem'
  },
  touchPill: {
    height: '42px',
    borderRadius: '8px',
    border: '1px solid transparent',
    fontSize: '0.82rem',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.35rem',
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
  touchPillNAActive: {
    backgroundColor: '#475569',
    color: '#ffffff',
    borderColor: '#334155',
    boxShadow: '0 2px 4px rgba(71, 85, 105, 0.25)'
  },
  touchPillInactive: {
    backgroundColor: '#f8fafc',
    color: '#64748b',
    borderColor: '#cbd5e1'
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
    minWidth: '600px'
  },
  tableHead: {
    backgroundColor: '#f8fafc',
  },
  th: {
    padding: '0.75rem 1rem',
    textAlign: 'left',
    fontSize: '0.75rem',
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    borderBottom: '1px solid #e2e8f0',
  },
  tr: {
    borderBottom: '1px solid #f1f5f9',
  },
  td: {
    padding: '0.75rem 1rem',
    fontSize: '0.85rem',
    color: '#334155',
  },
  radioGroup: {
    display: 'flex',
    justifyContent: 'center',
    gap: '1rem',
  },
  radioLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    cursor: 'pointer',
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
    backgroundColor: '#0891b2',
    color: '#ffffff',
    padding: '0.7rem 1.5rem',
    borderRadius: '8px',
    border: 'none',
    fontWeight: '700',
    fontSize: '0.92rem',
    cursor: 'pointer',
    boxShadow: '0 2px 4px rgba(8, 145, 178, 0.2)'
  }
};
