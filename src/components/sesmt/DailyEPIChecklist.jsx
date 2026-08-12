import React, { useState } from 'react';
import { dbService } from '../../firebase';
import { Save } from 'lucide-react';

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

const ITEMS = [
  { id: 'uso_epi', label: 'Uso adequado do EPI' },
  { id: 'higienizacao', label: 'Higienização das mãos' },
  { id: 'descarte', label: 'Descarte de resíduos' },
  { id: 'conservacao', label: 'Conservação e armazenamento de EPI' }
];

export default function DailyEPIChecklist() {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().substring(0, 5),
    sector: SECTORS[0],
    enfermeiro: '',
    tecnicoSeguranca: '',
    evaluations: ITEMS.reduce((acc, item) => ({
      ...acc,
      [item.id]: { status: 'C', observation: '' }
    }), {})
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      await dbService.saveEpiInspection({
        ...formData,
        createdAt: new Date().toISOString()
      });
      setMessage('Checklist salvo com sucesso!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error(error);
      setMessage('Erro ao salvar checklist.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.card}>
      <h2 style={styles.cardTitle}>Checklist de Verificação Diária de EPI e Segurança</h2>
      
      {message && (
        <div style={{ ...styles.alert, backgroundColor: message.includes('Erro') ? '#fef2f2' : '#f0fdf4', color: message.includes('Erro') ? '#991b1b' : '#166534', border: `1px solid ${message.includes('Erro') ? '#f87171' : '#4ade80'}` }}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.grid3}>
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

        <div style={styles.grid2}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Enfermeiro(a) Responsável</label>
            <input 
              type="text" 
              name="enfermeiro"
              value={formData.enfermeiro}
              onChange={handleChange}
              style={styles.input}
              placeholder="Nome"
              required 
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Técnico de Segurança do Trabalho</label>
            <input 
              type="text" 
              name="tecnicoSeguranca"
              value={formData.tecnicoSeguranca}
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
  grid3: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
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
  tableContainer: {
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    overflow: 'hidden',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
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
    marginTop: '1rem',
  },
  btnPrimary: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    backgroundColor: '#0891b2',
    color: '#ffffff',
    padding: '0.6rem 1.25rem',
    borderRadius: '8px',
    border: 'none',
    fontWeight: '600',
    fontSize: '0.9rem',
    cursor: 'pointer',
  }
};
