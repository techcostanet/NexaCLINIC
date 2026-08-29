import React, { useState } from 'react';
import { Plus, Trash2, Edit2, Activity, CheckCircle, Search } from 'lucide-react';
import { FALLBACK_DOCTORS } from '../../services/firebase/medicalService';
import { formatDoctorDisplayName, sortDoctorsByName } from '../../utils/doctorFormatters';

export default function MedicalProceduresTab({
  procedures = [],
  doctors = [],
  patients = [],
  settings = {},
  onSaveProcedure,
  onDeleteProcedure,
  loading = false
}) {
  const availableDoctors = Array.isArray(doctors) && doctors.length > 0 ? doctors : FALLBACK_DOCTORS;

  const [showModal, setShowModal] = useState(false);
  const [filterDoc, setFilterDoc] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    doctorId: availableDoctors[0]?.id || availableDoctors[0]?.uid || '',
    patientId: patients[0]?.id || '',
    date: new Date().toISOString().substring(0, 10),
    procedureType: 'Cateter Duplo Lúmen (CDL)',
    notes: ''
  });

  const procedureTypes = [
    'Cateter Duplo Lúmen (CDL)',
    'Implante de Permcath',
    'Biópsia Renal',
    'Mapeamento de Fístula AV',
    'Curativo Especial de Acesso',
    'Punção Biópsia / Aspiração'
  ];

  const filteredProcedures = procedures.filter(p => {
    if (filterDoc !== 'Todos' && p.doctorId !== filterDoc) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchPat = p.patientName?.toLowerCase().includes(term);
      const matchDoc = p.doctorName?.toLowerCase().includes(term);
      const matchProc = p.procedureType?.toLowerCase().includes(term);
      if (!matchPat && !matchDoc && !matchProc) return false;
    }
    return true;
  }).sort((a, b) => b.date.localeCompare(a.date));

  const totalValue = filteredProcedures.reduce((acc, curr) => acc + (parseFloat(curr.value) || 0), 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    const doc = availableDoctors.find(d => (d.id === formData.doctorId || d.uid === formData.doctorId));
    const pat = patients.find(p => p.id === formData.patientId);

    onSaveProcedure({
      doctorId: formData.doctorId,
      doctorName: doc ? formatDoctorDisplayName(doc.name) : 'Médico Não Informado',
      patientId: formData.patientId,
      patientName: pat ? pat.name : 'Paciente Não Informado',
      date: formData.date,
      procedureType: formData.procedureType,
      value: settings.procedureFees?.[formData.procedureType] || 350.0,
      notes: formData.notes
    });
    setShowModal(false);
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h3 style={styles.title}>Procedimentos Médicos Executados</h3>
          <p style={styles.subtitle}>Registro e auditoria de implantes de cateteres, biópsias renais e acessos vasculares.</p>
        </div>
        <button 
          type="button" 
          onClick={() => setShowModal(true)} 
          style={styles.addBtn}
        >
          <Plus size={15} />
          <span>Lançar</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div style={styles.kpiGrid}>
        <div style={styles.kpiCard}>
          <span style={styles.kpiLabel}>Total de Procedimentos</span>
          <div style={styles.kpiValue}>{filteredProcedures.length}</div>
        </div>
        <div style={styles.kpiCard}>
          <span style={styles.kpiLabel}>Valor Total Apurado</span>
          <div style={{ ...styles.kpiValue, color: '#10b981' }}>
            R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div style={styles.kpiCard}>
          <span style={styles.kpiLabel}>Médicos Executantes</span>
          <div style={{ ...styles.kpiValue, color: '#8b5cf6' }}>
            {new Set(filteredProcedures.map(p => p.doctorId)).size}
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div style={styles.filterBar}>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <select 
            className="form-control" 
            value={filterDoc}
            onChange={e => setFilterDoc(e.target.value)}
            style={{ width: '220px', fontSize: '0.8rem' }}
          >
            <option value="Todos">Todos</option>
            {sortDoctorsByName(availableDoctors).map(doc => (
              <option key={doc.id || doc.uid} value={doc.id || doc.uid}>{formatDoctorDisplayName(doc.name)}</option>
            ))}
          </select>

          <input 
            type="text" 
            className="form-control" 
            placeholder="Buscar paciente ou procedimento..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ width: '240px', fontSize: '0.8rem' }}
          />
        </div>
      </div>

      {/* Table */}
      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th>Data</th>
              <th>Médico</th>
              <th>Paciente</th>
              <th>Procedimento</th>
              <th>Valor</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredProcedures.length === 0 ? (
              <tr>
                <td colSpan="7" style={styles.noDataCell}>
                  Nenhum procedimento registrado para os filtros aplicados.
                </td>
              </tr>
            ) : (
              filteredProcedures.map(proc => (
                <tr key={proc.id}>
                  <td>
                    <div style={{ fontWeight: '700', color: '#0f172a' }}>
                      {new Date(proc.date + 'T12:00:00').toLocaleDateString('pt-BR')}
                    </div>
                  </td>
                  <td style={{ fontWeight: '600' }}>{proc.doctorName}</td>
                  <td>
                    <div style={{ fontWeight: '700', color: '#0284c7' }}>{proc.patientName}</div>
                    {proc.notes && <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{proc.notes}</div>}
                  </td>
                  <td style={{ fontWeight: '600' }}>{proc.procedureType}</td>
                  <td style={{ fontWeight: '800', color: '#059669' }}>
                    R$ {(parseFloat(proc.value) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td>
                    <span style={styles.statusBadge}>
                      {proc.status || 'Auditado'}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      onClick={() => onDeleteProcedure(proc.id)}
                      style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                      title="Excluir procedimento"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal: Lançar Procedimento */}
      {showModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <h4 style={{ margin: '0 0 1rem 0', fontWeight: '800', color: '#0f172a' }}>
              Lançar Procedimento
            </h4>

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div className="form-group">
                  <label>Médico *</label>
                  <select 
                    className="form-control" 
                    value={formData.doctorId} 
                    onChange={e => setFormData({ ...formData, doctorId: e.target.value })}
                    required
                  >
                    <option value="">Selecione...</option>
                    {sortDoctorsByName(availableDoctors).map(d => (
                      <option key={d.id || d.uid} value={d.id || d.uid}>
                        {formatDoctorDisplayName(d.name)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Paciente *</label>
                  <select 
                    className="form-control" 
                    value={formData.patientId} 
                    onChange={e => setFormData({ ...formData, patientId: e.target.value })}
                    required
                  >
                    {patients.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.cpf})</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Data *</label>
                  <input 
                    type="date" 
                    className="form-control" 
                    value={formData.date} 
                    onChange={e => setFormData({ ...formData, date: e.target.value })} 
                    required 
                  />
                </div>

                <div className="form-group">
                  <label>Procedimento *</label>
                  <select 
                    className="form-control" 
                    value={formData.procedureType} 
                    onChange={e => setFormData({ ...formData, procedureType: e.target.value })}
                    required
                  >
                    {procedureTypes.map(pt => (
                      <option key={pt} value={pt}>
                        {pt} (R$ {(settings.procedureFees?.[pt] || 350).toLocaleString('pt-BR', { minimumFractionDigits: 2 })})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Observações</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Ex: Implante em Jugular D guiado por ultrassom..."
                    value={formData.notes} 
                    onChange={e => setFormData({ ...formData, notes: e.target.value })} 
                  />
                </div>
              </div>

              <div style={styles.modalActions}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                  Cancelar
                </button>
                <button type="submit" disabled={loading} className="btn btn-primary" style={{ backgroundColor: '#8b5cf6' }}>
                  {loading ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
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
    backgroundColor: '#8b5cf6',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '0.75rem',
  },
  kpiCard: {
    backgroundColor: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '0.75rem 1rem',
    boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
  },
  kpiLabel: {
    fontSize: '0.7rem',
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
  },
  kpiValue: {
    fontSize: '1.25rem',
    fontWeight: '800',
    color: '#0f172a',
    marginTop: '0.25rem',
  },
  filterBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  statusBadge: {
    fontSize: '0.7rem',
    fontWeight: '700',
    backgroundColor: '#dcfce7',
    color: '#166534',
    padding: '0.15rem 0.45rem',
    borderRadius: '4px',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: '1rem',
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    width: '100%',
    maxWidth: '480px',
    padding: '1.5rem',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.5rem',
    marginTop: '1.25rem',
    borderTop: '1px solid #e2e8f0',
    paddingTop: '0.75rem',
  }
};
