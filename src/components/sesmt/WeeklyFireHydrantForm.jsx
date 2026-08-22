import React, { useState, useEffect } from 'react';
import { dbService } from '../../firebase';
import { Save, Droplet, RefreshCw } from 'lucide-react';

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
    items: []
  });

  const [loading, setLoading] = useState(false);
  const [loadingEquip, setLoadingEquip] = useState(true);
  const [message, setMessage] = useState('');

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
        sector: 'Setor Geral',
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      await dbService.saveFireHydrantInspection({
        date: formData.date,
        inspectorName: formData.inspectorName,
        tecnicoSeguranca: formData.tecnicoSeguranca || '',
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

  return (
    <div style={styles.card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h2 style={styles.cardTitle}>Inspeção Semanal de Hidrantes de Incêndio</h2>
          <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b' }}>
            Checklist técnico dos {formData.items.length} hidrantes ativos cadastrados na clínica.
          </p>
        </div>
        <button 
          type="button" 
          onClick={loadHydrants} 
          style={styles.refreshBtn}
          title="Recarregar lista de hidrantes cadastrados"
        >
          <RefreshCw size={14} className={loadingEquip ? 'animate-spin' : ''} /> Atualizar Equipamentos
        </button>
      </div>
      
      {message && (
        <div style={{ ...styles.alert, backgroundColor: message.includes('Erro') ? '#fef2f2' : '#f0fdf4', color: message.includes('Erro') ? '#991b1b' : '#166534', border: `1px solid ${message.includes('Erro') ? '#f87171' : '#4ade80'}` }}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.grid2}>
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
        </div>

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
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={styles.grid2}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Inspetor</label>
            <input 
              type="text" 
              name="inspectorName"
              value={formData.inspectorName}
              onChange={handleChange}
              style={styles.input}
              placeholder="Nome"
              required 
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Técnico</label>
            <input 
              type="text" 
              name="tecnicoSeguranca"
              value={formData.tecnicoSeguranca || ''}
              onChange={handleChange}
              style={styles.input}
              placeholder="Nome"
              required 
            />
          </div>
        </div>

        <div style={styles.actions}>
          <button 
            type="submit" 
            disabled={loading}
            style={loading ? {...styles.btnPrimary, opacity: 0.7} : styles.btnPrimary}
          >
            <Save size={20} />
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
    padding: '1.5rem',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    border: '1px solid #e2e8f0',
  },
  cardTitle: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#0f172a',
    margin: 0,
    marginBottom: '0.25rem'
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
    padding: '1rem',
    borderRadius: '8px',
    marginBottom: '1.5rem',
    fontWeight: '500',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  grid2: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '1rem',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  label: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#475569',
  },
  input: {
    padding: '0.6rem',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    fontSize: '0.9rem',
    width: '100%',
    boxSizing: 'border-box'
  },
  inputSmall: {
    padding: '0.3rem',
    borderRadius: '4px',
    border: '1px solid #cbd5e1',
    fontSize: '0.75rem',
    width: '100%',
    boxSizing: 'border-box'
  },
  selectSmall: {
    padding: '0.3rem',
    borderRadius: '4px',
    border: '1px solid #cbd5e1',
    fontSize: '0.75rem',
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
  tableContainer: {
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    minWidth: '800px'
  },
  tableHead: {
    backgroundColor: '#154c79',
  },
  th: {
    backgroundColor: '#154c79',
    padding: '0.75rem 0.5rem',
    textAlign: 'center',
    fontSize: '0.78rem',
    fontWeight: '700',
    color: '#ffffff',
    borderRight: '1px solid rgba(255, 255, 255, 0.2)',
    borderBottom: '1px solid #0f3d64',
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
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: '1rem',
  },
  btnPrimary: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    backgroundColor: '#0f766e',
    color: '#ffffff',
    padding: '0.6rem 1.25rem',
    borderRadius: '8px',
    border: 'none',
    fontWeight: '600',
    fontSize: '0.9rem',
    cursor: 'pointer',
  }
};
