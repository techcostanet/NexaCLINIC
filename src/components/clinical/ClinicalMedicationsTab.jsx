import React, { useState } from 'react';
import { Pill, Plus, Trash2, CheckCircle, Clock, AlertCircle, Send, FileText, Check } from 'lucide-react';

export default function ClinicalMedicationsTab({ 
  patient, 
  medications = [], 
  onSaveMedication, 
  onDeleteMedication, 
  onRequestSalonDispensation,
  loading = false 
}) {
  const [showForm, setShowForm] = useState(false);
  const [filterType, setFilterType] = useState('Todos'); // 'Todos', 'Intradialítico', 'Uso Domiciliar'
  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    route: 'IV (Pós-Diálise)',
    frequency: '3x por semana (Pós-HD)',
    type: 'Intradialítico',
    indication: '',
    prescriber: 'Dr. Lucas (Nefrologista)',
    status: 'Ativo',
    startDate: new Date().toISOString().substring(0, 10),
    observations: ''
  });

  const commonNephroMeds = [
    { name: 'Alfaepoetina (Eritropoetina)', dosage: '4.000 UI', route: 'IV (Pós-Diálise)', frequency: '3x por semana (Pós-HD)', type: 'Intradialítico', indication: 'Anemia na DRC' },
    { name: 'Sacarato de Hidróxido de Ferro (Noripurum)', dosage: '100 mg (1 ampola)', route: 'IV (Em infusão)', frequency: '1x por semana', type: 'Intradialítico', indication: 'Reposição de ferro' },
    { name: 'Carbonato de Sevelamer', dosage: '800 mg', route: 'Oral', frequency: '2 cp 3x ao dia (com refeições)', type: 'Uso Domiciliar', indication: 'Controle de fósforo' },
    { name: 'Calcitriol', dosage: '0.25 mcg', route: 'Oral', frequency: '1 cápsula ao dia', type: 'Uso Domiciliar', indication: 'Hiperparatireoidismo' },
    { name: 'Anlodipino', dosage: '10 mg', route: 'Oral', frequency: '1x ao dia pela manhã', type: 'Uso Domiciliar', indication: 'Hipertensão arterial' },
    { name: 'Cefazolina', dosage: '1.0 g', route: 'IV (Última hora de HD)', frequency: '3x por semana', type: 'Intradialítico', indication: 'Infecção de cateter' }
  ];

  const handleApplyTemplate = (tpl) => {
    setFormData({
      ...formData,
      name: tpl.name,
      dosage: tpl.dosage,
      route: tpl.route,
      frequency: tpl.frequency,
      type: tpl.type,
      indication: tpl.indication
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name) return;
    onSaveMedication({
      patientId: patient.id,
      ...formData
    });
    setShowForm(false);
    setFormData({
      name: '',
      dosage: '',
      route: 'IV (Pós-Diálise)',
      frequency: '3x por semana (Pós-HD)',
      type: 'Intradialítico',
      indication: '',
      prescriber: 'Dr. Lucas (Nefrologista)',
      status: 'Ativo',
      startDate: new Date().toISOString().substring(0, 10),
      observations: ''
    });
  };

  const filteredMeds = medications.filter(m => {
    if (filterType === 'Todos') return true;
    return m.type === filterType;
  });

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h3 style={styles.title}>Prescrição Medicamentosa</h3>
          <p style={styles.subtitle}>Gestão de fármacos intradialíticos e uso contínuo com rastreabilidade na farmácia.</p>
        </div>
        <button 
          type="button" 
          onClick={() => setShowForm(!showForm)} 
          style={styles.addBtn}
        >
          <Plus size={15} />
          <span>{showForm ? 'Fechar' : 'Prescrever'}</span>
        </button>
      </div>

      {/* Prescription Form */}
      {showForm && (
        <form onSubmit={handleSubmit} style={styles.formCard}>
          <div style={styles.templateSection}>
            <span style={styles.templateTitle}>Sugestões Rápidas:</span>
            <div style={styles.templateWrap}>
              {commonNephroMeds.map((tpl, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleApplyTemplate(tpl)}
                  style={styles.templateBtn}
                >
                  {tpl.name.split(' ')[0]} ({tpl.dosage})
                </button>
              ))}
            </div>
          </div>

          <div style={styles.formGrid}>
            <div className="form-group">
              <label>Medicamento *</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="Ex: Alfaepoetina 4.000 UI"
                value={formData.name} 
                onChange={e => setFormData({ ...formData, name: e.target.value })} 
                required 
              />
            </div>

            <div className="form-group">
              <label>Dosagem *</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="Ex: 4.000 UI / 100 mg / 800 mg"
                value={formData.dosage} 
                onChange={e => setFormData({ ...formData, dosage: e.target.value })} 
                required 
              />
            </div>

            <div className="form-group">
              <label>Via *</label>
              <select 
                className="form-control" 
                value={formData.route}
                onChange={e => setFormData({ ...formData, route: e.target.value })}
              >
                <option value="IV (Pós-Diálise)">IV (Pós-Diálise)</option>
                <option value="IV (Em infusão)">IV (Em infusão)</option>
                <option value="IV (Linha arterial)">IV (Linha arterial)</option>
                <option value="Subcutânea">Subcutânea</option>
                <option value="Oral">Oral</option>
                <option value="Intramuscular">Intramuscular</option>
              </select>
            </div>

            <div className="form-group">
              <label>Frequência *</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="Ex: 3x por semana / 1x ao dia"
                value={formData.frequency} 
                onChange={e => setFormData({ ...formData, frequency: e.target.value })} 
                required 
              />
            </div>

            <div className="form-group">
              <label>Tipo *</label>
              <select 
                className="form-control" 
                value={formData.type}
                onChange={e => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="Intradialítico">Intradialítico (Aplicação na Clínica)</option>
                <option value="Uso Domiciliar">Uso Domiciliar (Uso Contínuo)</option>
              </select>
            </div>

            <div className="form-group">
              <label>Indicação</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="Ex: Anemia DRC, Hiperfosfatemia"
                value={formData.indication} 
                onChange={e => setFormData({ ...formData, indication: e.target.value })} 
              />
            </div>

            <div className="form-group">
              <label>Início</label>
              <input 
                type="date" 
                className="form-control" 
                value={formData.startDate} 
                onChange={e => setFormData({ ...formData, startDate: e.target.value })} 
              />
            </div>

            <div className="form-group">
              <label>Responsável</label>
              <input 
                type="text" 
                className="form-control" 
                value={formData.prescriber} 
                onChange={e => setFormData({ ...formData, prescriber: e.target.value })} 
              />
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '0.75rem' }}>
            <label>Observações</label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="Ex: Administrar lentamente ao término da sessão na linha venosa..."
              value={formData.observations} 
              onChange={e => setFormData({ ...formData, observations: e.target.value })} 
            />
          </div>

          <div style={styles.formActions}>
            <button type="button" onClick={() => setShowForm(false)} className="btn btn-secondary">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="btn btn-primary" style={{ backgroundColor: '#0284c7' }}>
              {loading ? 'Salvando...' : 'Salvar Prescrição'}
            </button>
          </div>
        </form>
      )}

      {/* Filter Tabs */}
      <div style={styles.filterBar}>
        <div style={styles.filterGroup}>
          {['Todos', 'Intradialítico', 'Uso Domiciliar'].map(type => (
            <button
              key={type}
              type="button"
              onClick={() => setFilterType(type)}
              style={{
                ...styles.filterBtn,
                ...(filterType === type ? styles.filterBtnActive : {})
              }}
            >
              {type} ({medications.filter(m => type === 'Todos' || m.type === type).length})
            </button>
          ))}
        </div>
      </div>

      {/* Medications Table / Cards */}
      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th>Medicamento</th>
              <th>Dose</th>
              <th>Via</th>
              <th>Frequência</th>
              <th>Tipo</th>
              <th>Indicação</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredMeds.length === 0 ? (
              <tr>
                <td colSpan="8" style={styles.noDataCell}>
                  Nenhum medicamento prescrito para este filtro.
                </td>
              </tr>
            ) : (
              filteredMeds.map(med => {
                const isIntra = med.type === 'Intradialítico';
                return (
                  <tr key={med.id}>
                    <td>
                      <div style={{ fontWeight: '700', color: '#0f172a' }}>{med.name}</div>
                      {med.observations && (
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{med.observations}</div>
                      )}
                    </td>
                    <td style={{ fontWeight: '700', color: '#0284c7' }}>{med.dosage}</td>
                    <td>{med.route}</td>
                    <td>{med.frequency}</td>
                    <td>
                      <span style={{
                        ...styles.typeBadge,
                        backgroundColor: isIntra ? '#ede9fe' : '#f0fdf4',
                        color: isIntra ? '#6d28d9' : '#15803d',
                        borderColor: isIntra ? '#ddd6fe' : '#bbf7d0'
                      }}>
                        {med.type}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: '#475569' }}>{med.indication || '-'}</td>
                    <td>
                      <span style={styles.activeBadge}>
                        {med.status || 'Ativo'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                        {isIntra && (
                          <button
                            type="button"
                            onClick={() => onRequestSalonDispensation && onRequestSalonDispensation(med)}
                            style={styles.reqBtn}
                            title="Enviar requisição do medicamento para dispensação no salão (NexaREQ)"
                          >
                            <Send size={13} />
                            <span>Requisitar</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => onDeleteMedication(med.id)}
                          style={styles.deleteBtn}
                          title="Remover medicamento"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #e2e8f0',
    paddingBottom: '0.75rem',
    flexWrap: 'wrap',
    gap: '0.75rem',
  },
  title: {
    fontSize: '1.15rem',
    fontWeight: '800',
    color: '#0f172a',
    margin: 0,
  },
  subtitle: {
    fontSize: '0.8rem',
    color: '#64748b',
    margin: 0,
    marginTop: '0.2rem',
  },
  addBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    padding: '0.5rem 0.9rem',
    fontSize: '0.8rem',
    fontWeight: '700',
    backgroundColor: '#0284c7',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  formCard: {
    backgroundColor: '#f8fafc',
    border: '1px solid #cbd5e1',
    borderRadius: '10px',
    padding: '1.25rem',
    boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
  },
  templateSection: {
    marginBottom: '1rem',
    paddingBottom: '0.75rem',
    borderBottom: '1px dashed #cbd5e1',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    flexWrap: 'wrap',
  },
  templateTitle: {
    fontSize: '0.75rem',
    fontWeight: '700',
    color: '#475569',
  },
  templateWrap: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.4rem',
  },
  templateBtn: {
    fontSize: '0.7rem',
    fontWeight: '600',
    backgroundColor: '#fff',
    color: '#0369a1',
    border: '1px solid #bae6fd',
    borderRadius: '6px',
    padding: '0.2rem 0.5rem',
    cursor: 'pointer',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '0.75rem',
  },
  formActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.5rem',
    marginTop: '1rem',
    borderTop: '1px solid #e2e8f0',
    paddingTop: '0.75rem',
  },
  filterBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filterGroup: {
    display: 'flex',
    gap: '0.4rem',
  },
  filterBtn: {
    padding: '0.35rem 0.75rem',
    fontSize: '0.75rem',
    fontWeight: '600',
    backgroundColor: '#f1f5f9',
    color: '#475569',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  filterBtnActive: {
    backgroundColor: '#0284c7',
    color: '#fff',
    borderColor: '#0284c7',
  },
  tableWrapper: {
    overflowX: 'auto',
    backgroundColor: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.85rem',
    textAlign: 'left',
  },
  noDataCell: {
    textAlign: 'center',
    padding: '2.5rem 1rem',
    color: '#94a3b8',
    fontStyle: 'italic',
  },
  typeBadge: {
    fontSize: '0.7rem',
    fontWeight: '700',
    padding: '0.15rem 0.5rem',
    borderRadius: '6px',
    border: '1px solid transparent',
  },
  activeBadge: {
    fontSize: '0.7rem',
    fontWeight: '700',
    backgroundColor: '#dcfce7',
    color: '#166534',
    padding: '0.15rem 0.5rem',
    borderRadius: '6px',
  },
  reqBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.3rem',
    padding: '0.3rem 0.6rem',
    fontSize: '0.7rem',
    fontWeight: '700',
    backgroundColor: '#ecfdf5',
    color: '#059669',
    border: '1px solid #a7f3d0',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  deleteBtn: {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#ef4444',
    cursor: 'pointer',
    padding: '0.3rem',
  }
};
