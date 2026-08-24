import React, { useState } from 'react';
import { Save, DollarSign, Users, FileSpreadsheet, Check } from 'lucide-react';

export default function MedicalSettingsTab({
  settings = {},
  doctors = [],
  onSaveSettings,
  loading = false
}) {
  const [formData, setFormData] = useState({
    shiftFee: settings.shiftFee || 1200.0,
    consultationFee: settings.consultationFee || 150.0,
    procedureFees: {
      'Cateter Duplo Lúmen (CDL)': settings.procedureFees?.['Cateter Duplo Lúmen (CDL)'] || 450.0,
      'Implante de Permcath': settings.procedureFees?.['Implante de Permcath'] || 850.0,
      'Biópsia Renal': settings.procedureFees?.['Biópsia Renal'] || 600.0,
      'Mapeamento de Fístula AV': settings.procedureFees?.['Mapeamento de Fístula AV'] || 300.0,
      'Curativo Especial de Acesso': settings.procedureFees?.['Curativo Especial de Acesso'] || 120.0,
      'Punção Biópsia / Aspiração': settings.procedureFees?.['Punção Biópsia / Aspiração'] || 350.0
    }
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleProcedureFeeChange = (procName, val) => {
    setFormData({
      ...formData,
      procedureFees: {
        ...formData.procedureFees,
        [procName]: parseFloat(val) || 0
      }
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    await onSaveSettings(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h3 style={styles.title}>Honorários</h3>
          <p style={styles.subtitle}>Configuração dos valores praticados para plantões, consultas e procedimentos.</p>
        </div>
      </div>

      <form onSubmit={handleSave}>
        <div style={styles.grid2}>
          {/* Column 1: Base Fees */}
          <div style={styles.card}>
            <h4 style={styles.cardTitle}>Base</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.75rem' }}>
              <div className="form-group">
                <label>Plantão *</label>
                <div style={styles.inputPrefix}>
                  <span>R$</span>
                  <input 
                    type="number" 
                    step="0.01"
                    className="form-control" 
                    value={formData.shiftFee}
                    onChange={e => setFormData({ ...formData, shiftFee: parseFloat(e.target.value) || 0 })}
                    required
                  />
                </div>
                <small style={{ color: '#64748b', fontSize: '0.7rem' }}>Valor padrão remunerado por turno de 4 horas.</small>
              </div>

              <div className="form-group">
                <label>Consulta *</label>
                <div style={styles.inputPrefix}>
                  <span>R$</span>
                  <input 
                    type="number" 
                    step="0.01"
                    className="form-control" 
                    value={formData.consultationFee}
                    onChange={e => setFormData({ ...formData, consultationFee: parseFloat(e.target.value) || 0 })}
                    required
                  />
                </div>
                <small style={{ color: '#64748b', fontSize: '0.7rem' }}>Valor por consulta concluída no módulo Agenda.</small>
              </div>
            </div>
          </div>

          {/* Column 2: Procedure Fees Table */}
          <div style={styles.card}>
            <h4 style={styles.cardTitle}>Procedimentos</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginTop: '0.75rem' }}>
              {Object.keys(formData.procedureFees).map(proc => (
                <div key={proc} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: '600', color: '#334155', flexGrow: 1 }}>{proc}</span>
                  <div style={{ ...styles.inputPrefix, width: '130px' }}>
                    <span>R$</span>
                    <input 
                      type="number" 
                      step="0.01"
                      className="form-control" 
                      value={formData.procedureFees[proc]}
                      onChange={e => handleProcedureFeeChange(proc, e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Save Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem', gap: '0.75rem', alignItems: 'center' }}>
          {savedSuccess && (
            <span style={{ color: '#166534', fontSize: '0.8rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Check size={16} /> Salvo com sucesso!
            </span>
          )}
          <button type="submit" disabled={loading} className="btn btn-primary" style={{ backgroundColor: '#8b5cf6', padding: '0.5rem 1.25rem' }}>
            <Save size={16} />
            <span>{loading ? 'Salvando...' : 'Salvar'}</span>
          </button>
        </div>
      </form>

      {/* Registered Doctors Table */}
      <div style={{ marginTop: '1.5rem' }}>
        <h4 style={{ fontSize: '1rem', fontWeight: '800', color: '#0f172a', margin: '0 0 0.5rem 0' }}>
          Profissionais
        </h4>
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th>Médico</th>
                <th>CRM</th>
                <th>Especialidade</th>
                <th>Vínculo</th>
                <th>PIX</th>
                <th>Banco</th>
              </tr>
            </thead>
            <tbody>
              {doctors.map(doc => (
                <tr key={doc.id}>
                  <td style={{ fontWeight: '800', color: '#0f172a' }}>{doc.name}</td>
                  <td>{doc.crm}</td>
                  <td>{doc.specialty}</td>
                  <td>
                    <span style={{ fontSize: '0.7rem', fontWeight: '800', padding: '0.15rem 0.45rem', borderRadius: '4px', backgroundColor: '#eff6ff', color: '#1e40af' }}>
                      {doc.contractType}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.75rem', color: '#0284c7' }}>{doc.pixKey || '-'}</td>
                  <td style={{ fontSize: '0.75rem', color: '#475569' }}>{doc.bank || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
    borderBottom: '1px solid #e2e8f0',
    paddingBottom: '0.75rem',
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
  grid2: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '1.25rem',
  },
  card: {
    backgroundColor: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    padding: '1.25rem',
  },
  cardTitle: {
    fontSize: '0.95rem',
    fontWeight: '800',
    color: '#0f172a',
    margin: 0,
    borderBottom: '1px solid #f1f5f9',
    paddingBottom: '0.5rem',
  },
  inputPrefix: {
    display: 'flex',
    alignItems: 'center',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    paddingLeft: '0.5rem',
    backgroundColor: '#f8fafc',
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
  }
};
