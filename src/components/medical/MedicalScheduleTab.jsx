import React, { useState } from 'react';
import { 
  Calendar, Plus, AlertTriangle, CheckCircle2, 
  Trash2, Edit2, Filter, ChevronLeft, ChevronRight, UserCheck, ShieldAlert
} from 'lucide-react';
import { FALLBACK_DOCTORS } from '../../services/firebase/medicalService';

export default function MedicalScheduleTab({
  schedules = [],
  doctors = [],
  selectedMonth,
  onChangeMonth,
  onSaveSchedule,
  onDeleteSchedule,
  loading = false
}) {
  const availableDoctors = Array.isArray(doctors) && doctors.length > 0 ? doctors : FALLBACK_DOCTORS;

  const [selectedSector, setSelectedSector] = useState('Todos');
  const [selectedShift, setSelectedShift] = useState('Todos');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().substring(0, 10),
    sector: 'Salão 1',
    shift: '1º Turno',
    doctorId: availableDoctors[0]?.id || availableDoctors[0]?.uid || '',
    notes: ''
  });

  const sectors = ['Salão 1', 'Salão 2', 'Salão 3', 'Diálise Peritoneal (DP)'];
  const shifts = ['1º Turno', '2º Turno', '3º Turno'];

  const filteredSchedules = schedules.filter(s => {
    if (selectedSector !== 'Todos' && s.sector !== selectedSector) return false;
    if (selectedShift !== 'Todos' && s.shift !== selectedShift) return false;
    return true;
  }).sort((a, b) => a.date.localeCompare(b.date));

  // Trava Anti-Buraco (detect uncovered shifts)
  const uncoveredCount = schedules.filter(s => !s.doctorId || s.status === 'Pendente').length;

  const handleOpenAdd = (date = null, sec = null, sh = null) => {
    setEditingItem(null);
    const firstDocId = availableDoctors[0]?.id || availableDoctors[0]?.uid || '';
    setFormData({
      date: date || new Date().toISOString().substring(0, 10),
      sector: sec || 'Salão 1',
      shift: sh || '1º Turno',
      doctorId: firstDocId,
      notes: ''
    });
    setShowAddModal(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({
      date: item.date,
      sector: item.sector,
      shift: item.shift,
      doctorId: item.doctorId,
      notes: item.notes || ''
    });
    setShowAddModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const doc = availableDoctors.find(d => (d.id === formData.doctorId || d.uid === formData.doctorId));
    const month = formData.date.substring(0, 7);
    
    onSaveSchedule({
      id: editingItem ? editingItem.id : undefined,
      month,
      date: formData.date,
      sector: formData.sector,
      shift: formData.shift,
      doctorId: formData.doctorId,
      doctorName: doc ? doc.name : 'Médico Não Informado',
      doctorCrm: doc ? (doc.crm || '') : '',
      status: 'Confirmado',
      checkinStatus: editingItem?.checkinStatus || 'Pendente',
      notes: formData.notes
    });
    setShowAddModal(false);
  };

  return (
    <div style={styles.container}>
      {/* Top Header */}
      <div style={styles.header}>
        <div>
          <h3 style={styles.title}>Escala Mensal de Plantões</h3>
          <p style={styles.subtitle}>Distribuição da equipe médica nos Salões 1, 2, 3 e Diálise Peritoneal nos 3 turnos.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <input 
            type="month" 
            className="form-control"
            value={selectedMonth}
            onChange={e => onChangeMonth(e.target.value)}
            style={{ width: '220px', minWidth: '220px', fontWeight: '700' }}
          />
          <button 
            type="button" 
            onClick={() => handleOpenAdd()} 
            style={styles.addBtn}
          >
            <Plus size={15} />
            <span>Escalar</span>
          </button>
        </div>
      </div>

      {/* Trava Anti-Buraco & Coverage Alert Strip */}
      <div style={styles.alertStrip}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          {uncoveredCount > 0 ? (
            <div style={{ ...styles.alertBadge, backgroundColor: '#fee2e2', color: '#991b1b', borderColor: '#fca5a5' }}>
              <ShieldAlert size={16} />
              <span>{uncoveredCount} Plantões sem Médico</span>
            </div>
          ) : (
            <div style={{ ...styles.alertBadge, backgroundColor: '#dcfce7', color: '#166534', borderColor: '#bbf7d0' }}>
              <CheckCircle2 size={16} />
              <span>100% dos Salões Cobertos</span>
            </div>
          )}
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
            Total de {schedules.length} plantões programados para {selectedMonth}.
          </span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div style={styles.filterBar}>
        <div style={styles.filterGroup}>
          <span style={styles.filterLabel}>Salão:</span>
          {['Todos', ...sectors].map(sec => (
            <button
              key={sec}
              type="button"
              onClick={() => setSelectedSector(sec)}
              style={{
                ...styles.filterBtn,
                ...(selectedSector === sec ? styles.filterBtnActive : {})
              }}
            >
              {sec.replace('Diálise Peritoneal (DP)', 'DP')}
            </button>
          ))}
        </div>

        <div style={styles.filterGroup}>
          <span style={styles.filterLabel}>Turno:</span>
          {['Todos', ...shifts].map(sh => (
            <button
              key={sh}
              type="button"
              onClick={() => setSelectedShift(sh)}
              style={{
                ...styles.filterBtn,
                ...(selectedShift === sh ? styles.filterBtnActive : {})
              }}
            >
              {sh}
            </button>
          ))}
        </div>
      </div>

      {/* Schedule Table */}
      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th>Data</th>
              <th>Setor</th>
              <th>Turno</th>
              <th>Médico</th>
              <th>CRM</th>
              <th>Presença</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredSchedules.length === 0 ? (
              <tr>
                <td colSpan="8" style={styles.noDataCell}>
                  Nenhum plantão cadastrado para os filtros selecionados.
                </td>
              </tr>
            ) : (
              filteredSchedules.map(sch => {
                const isPresent = sch.checkinStatus === 'Presente';
                const isLate = sch.checkinStatus === 'Atraso';
                const isAbsent = sch.checkinStatus === 'Ausente';
                const isReplaced = sch.checkinStatus === 'Substituído';

                return (
                  <tr key={sch.id}>
                    <td>
                      <div style={{ fontWeight: '800', color: '#0f172a' }}>
                        {new Date(sch.date + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' })}
                      </div>
                    </td>
                    <td style={{ fontWeight: '600' }}>{sch.sector}</td>
                    <td>
                      <span style={styles.shiftPill}>{sch.shift}</span>
                    </td>
                    <td>
                      <div style={{ fontWeight: '700', color: '#0284c7' }}>{sch.doctorName}</div>
                      {sch.notes && <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{sch.notes}</div>}
                    </td>
                    <td style={{ fontSize: '0.8rem', color: '#475569' }}>{sch.doctorCrm || '-'}</td>
                    <td>
                      {isPresent ? (
                        <span style={{ fontSize: '0.7rem', fontWeight: '700', color: '#166534', backgroundColor: '#dcfce7', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                          ✓ Presente ({sch.checkinTime || 'Confirmado'})
                        </span>
                      ) : isLate ? (
                        <span style={{ fontSize: '0.7rem', fontWeight: '700', color: '#854d0e', backgroundColor: '#fef9c3', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                          ⚠ Atraso ({sch.checkinTime})
                        </span>
                      ) : isAbsent ? (
                        <span style={{ fontSize: '0.7rem', fontWeight: '800', color: '#991b1b', backgroundColor: '#fee2e2', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                          ✕ Ausente
                        </span>
                      ) : isReplaced ? (
                        <span style={{ fontSize: '0.7rem', fontWeight: '700', color: '#6d28d9', backgroundColor: '#ede9fe', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                          🔄 Substituído
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                          Aguardando Ronda
                        </span>
                      )}
                    </td>
                    <td>
                      <span style={{
                        fontSize: '0.7rem',
                        fontWeight: '700',
                        backgroundColor: sch.status === 'Confirmado' ? '#f0fdf4' : '#fef3c7',
                        color: sch.status === 'Confirmado' ? '#15803d' : '#b45309',
                        padding: '0.15rem 0.45rem',
                        borderRadius: '4px'
                      }}>
                        {sch.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.3rem' }}>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(sch)}
                          style={styles.actionIconBtn}
                          title="Alterar médico"
                        >
                          <Edit2 size={13} color="#0284c7" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteSchedule(sch.id)}
                          style={styles.actionIconBtn}
                          title="Excluir da escala"
                        >
                          <Trash2 size={13} color="#ef4444" />
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

      {/* Modal: Adicionar / Editar Plantão */}
      {showAddModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <h4 style={{ margin: '0 0 1rem 0', fontWeight: '800', color: '#0f172a' }}>
              {editingItem ? 'Editar Plantão' : 'Escalar Médico'}
            </h4>

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
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
                  <label>Setor *</label>
                  <select 
                    className="form-control" 
                    value={formData.sector} 
                    onChange={e => setFormData({ ...formData, sector: e.target.value })}
                  >
                    {sectors.map(sec => (
                      <option key={sec} value={sec}>{sec}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Turno *</label>
                  <select 
                    className="form-control" 
                    value={formData.shift} 
                    onChange={e => setFormData({ ...formData, shift: e.target.value })}
                  >
                    {shifts.map(sh => (
                      <option key={sh} value={sh}>{sh}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Médico *</label>
                  <select 
                    className="form-control" 
                    value={formData.doctorId} 
                    onChange={e => setFormData({ ...formData, doctorId: e.target.value })}
                    required
                  >
                    <option value="">Selecione...</option>
                    {availableDoctors.map(doc => (
                      <option key={doc.id || doc.uid} value={doc.id || doc.uid}>
                        {doc.name} {doc.crm ? `(${doc.crm})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Observações</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Ex: Sobreaviso ou duplicidade"
                    value={formData.notes} 
                    onChange={e => setFormData({ ...formData, notes: e.target.value })} 
                  />
                </div>
              </div>

              <div style={styles.modalActions}>
                <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-secondary">
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
  alertStrip: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '0.6rem 1rem',
  },
  alertBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    fontSize: '0.75rem',
    fontWeight: '800',
    padding: '0.2rem 0.6rem',
    borderRadius: '6px',
    border: '1px solid transparent',
  },
  filterBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '0.75rem',
  },
  filterGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    flexWrap: 'wrap',
  },
  filterLabel: {
    fontSize: '0.75rem',
    fontWeight: '700',
    color: '#64748b',
    marginRight: '0.2rem',
  },
  filterBtn: {
    padding: '0.3rem 0.6rem',
    fontSize: '0.75rem',
    fontWeight: '600',
    backgroundColor: '#f1f5f9',
    color: '#475569',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  filterBtnActive: {
    backgroundColor: '#8b5cf6',
    color: '#fff',
    borderColor: '#8b5cf6',
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
  shiftPill: {
    fontSize: '0.7rem',
    fontWeight: '700',
    backgroundColor: '#f1f5f9',
    color: '#334155',
    padding: '0.15rem 0.45rem',
    borderRadius: '4px',
    border: '1px solid #cbd5e1',
  },
  actionIconBtn: {
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '0.25rem',
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
