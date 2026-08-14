import React, { useState } from 'react';
import { dbService } from '../../firebase';
import { Save } from 'lucide-react';

const NUM_EXTINGUISHERS = 21;
const CRITERIA = [
  { id: 'acesso', label: 'Acesso e Visib.' },
  { id: 'sinalizacao', label: 'Sinalização' },
  { id: 'pino', label: 'Pino' },
  { id: 'lacre', label: 'Lacre / anel' },
  { id: 'pressurizacao', label: 'Pressurização' },
  { id: 'mangueira', label: 'Mangueira' },
  { id: 'bico', label: 'Bico' },
  { id: 'estado_fisico', label: 'Estado Físico' }
];

export default function WeeklyFireExtinguisherForm() {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    inspectorName: '',
    items: Array.from({ length: NUM_EXTINGUISHERS }).map((_, i) => ({
      extinguisherNum: i + 1,
      type: '',
      validity: '',
      signature: '',
      evaluations: CRITERIA.reduce((acc, c) => ({ ...acc, [c.id]: 'C' }), {})
    }))
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (index, field, value) => {
    setFormData(prev => {
      const newItems = [...prev.items];
      newItems[index][field] = value;
      return { ...prev, items: newItems };
    });
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
      await dbService.saveFireExtinguisherInspection({
        date: formData.date,
        inspectorName: formData.inspectorName,
        items: formData.items,
        createdAt: new Date().toISOString()
      });
      setMessage('Inspeção salva com sucesso!');
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
      <h2 style={styles.cardTitle}>Inspeção Semanal de Extintores de Incêndio</h2>
      
      {message && (
        <div style={{ ...styles.alert, backgroundColor: message.includes('Erro') ? '#fef2f2' : '#f0fdf4', color: message.includes('Erro') ? '#991b1b' : '#166534', border: `1px solid ${message.includes('Erro') ? '#f87171' : '#4ade80'}` }}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.grid2}>
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
          <div style={styles.formGroup}>
            <label style={styles.label}>Nome do Inspetor</label>
            <input 
              type="text" 
              name="inspectorName"
              value={formData.inspectorName}
              onChange={handleChange}
              style={styles.input}
              placeholder="Assinatura/Nome"
              required 
            />
          </div>
        </div>

        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead style={styles.tableHead}>
              <tr>
                <th style={styles.th}>N° Extintor</th>
                <th style={styles.th}>Tipo</th>
                {CRITERIA.map(c => (
                  <th key={c.id} style={{...styles.th, textAlign: 'center'}}>{c.label}</th>
                ))}
                <th style={{...styles.th, textAlign: 'center'}}>Validade</th>
                <th style={{...styles.th, textAlign: 'center'}}>Assinatura</th>
              </tr>
            </thead>
            <tbody>
              {formData.items.map((item, index) => (
                <tr key={item.extinguisherNum} style={styles.tr}>
                  <td style={{...styles.td, fontWeight: 'bold', textAlign: 'center'}}>{item.extinguisherNum}</td>
                  <td style={styles.td}>
                    <select
                      value={item.type}
                      onChange={(e) => handleItemChange(index, 'type', e.target.value)}
                      style={styles.selectSmall}
                    >
                      <option value="">Selecione</option>
                      <option value="AP">Água Press.</option>
                      <option value="PQS">Pó Químico</option>
                      <option value="CO2">CO2</option>
                    </select>
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
                  <td style={styles.td}>
                    <input 
                      type="date"
                      value={item.validity}
                      onChange={(e) => handleItemChange(index, 'validity', e.target.value)}
                      style={styles.inputSmall}
                    />
                  </td>
                  <td style={styles.td}>
                    <input 
                      type="text"
                      value={item.signature || ''}
                      onChange={(e) => handleItemChange(index, 'signature', e.target.value)}
                      placeholder="Assinatura"
                      style={styles.inputSmall}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
    marginBottom: '1.5rem',
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
    padding: '0.75rem 0.5rem',
    textAlign: 'center',
    fontSize: '0.75rem',
    fontWeight: '700',
    color: '#ffffff',
    borderRight: '1px solid rgba(255, 255, 255, 0.2)',
    borderBottom: '1px solid #cbd5e1',
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
