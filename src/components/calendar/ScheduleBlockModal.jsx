import React, { useState } from 'react';
import { 
  X, Lock, Unlock, AlertTriangle, CheckCircle2, Calendar, 
  Clock, User, ShieldAlert, Trash2, Plus, Users
} from 'lucide-react';
import { dbService } from '../../firebase';
import { formatDoctorDisplayName, sortDoctorsByName } from '../../utils/doctorFormatters';

export default function ScheduleBlockModal({
  isOpen,
  onClose,
  doctors = [],
  appointments = [],
  existingBlocks = [],
  onBlockSaved,
  onBlockDeleted
}) {
  const [doctorId, setDoctorId] = useState(doctors[0]?.uid || 'all');
  const [startDate, setStartDate] = useState(new Date().toISOString().substring(0, 10));
  const [endDate, setEndDate] = useState(new Date().toISOString().substring(0, 10));
  const [period, setPeriod] = useState('Dia Inteiro');
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('18:00');
  const [reason, setReason] = useState('Solicitação');
  const [notes, setNotes] = useState('');
  
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState({ text: '', type: '' });

  if (!isOpen) return null;

  // Real-time calculation of conflicting appointments affected by this block
  const conflictingAppointments = appointments.filter(apt => {
    if (apt.status === 'Cancelado') return false;
    if (doctorId !== 'all' && apt.doctorId !== doctorId) return false;
    if (apt.date < startDate || apt.date > endDate) return false;

    if (period === 'Manhã') {
      return (apt.time || '00:00') < '12:00';
    } else if (period === 'Tarde') {
      return (apt.time || '00:00') >= '12:00';
    } else if (period === 'Horário') {
      return (apt.time || '00:00') >= startTime && (apt.time || '00:00') <= endTime;
    }
    return true; // Dia Inteiro
  });

  const selectedDoctorObj = doctors.find(d => d.uid === doctorId);

  const handleSaveBlock = async (e) => {
    e.preventDefault();
    if (!startDate || !endDate) {
      return setFeedback({ text: 'Selecione a data inicial e final do bloqueio.', type: 'danger' });
    }
    if (startDate > endDate) {
      return setFeedback({ text: 'A data inicial não pode ser posterior à data final.', type: 'danger' });
    }

    setSaving(true);
    try {
      const payload = {
        doctorId,
        doctorName: doctorId === 'all' ? 'Todos os Médicos' : formatDoctorDisplayName(selectedDoctorObj?.name || 'Médico'),
        startDate,
        endDate,
        period,
        startTime: period === 'Horário' ? startTime : (period === 'Manhã' ? '08:00' : period === 'Tarde' ? '12:00' : '07:00'),
        endTime: period === 'Horário' ? endTime : (period === 'Manhã' ? '12:00' : period === 'Tarde' ? '18:00' : '19:00'),
        reason,
        notes,
        createdAt: new Date().toISOString()
      };

      const created = await dbService.createScheduleBlock(payload);
      setFeedback({ text: 'Bloqueio registrado com sucesso!', type: 'success' });
      if (onBlockSaved) onBlockSaved(created);
      setTimeout(() => {
        setFeedback({ text: '', type: '' });
        onClose();
      }, 1500);
    } catch (err) {
      console.error(err);
      setFeedback({ text: 'Erro ao salvar bloqueio na nuvem.', type: 'danger' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (blockId) => {
    if (!window.confirm('Deseja realmente remover este bloqueio e liberar os horários na agenda?')) return;
    try {
      await dbService.deleteScheduleBlock(blockId);
      if (onBlockDeleted) onBlockDeleted(blockId);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        {/* Header */}
        <div style={styles.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={styles.iconBox}>
              <Lock size={20} color="#dc2626" />
            </div>
            <div>
              <h2 style={styles.title}>Bloquear</h2>
              <p style={styles.subtitle}>Registre solicitações, congressos, férias ou ausências para fechar horários na grade.</p>
            </div>
          </div>
          <button onClick={onClose} style={styles.closeBtn}>
            <X size={20} />
          </button>
        </div>

        {/* Feedback Alert */}
        {feedback.text && (
          <div style={{
            ...styles.alert,
            backgroundColor: feedback.type === 'danger' ? '#fef2f2' : '#f0fdf4',
            color: feedback.type === 'danger' ? '#991b1b' : '#166534',
            borderColor: feedback.type === 'danger' ? '#fca5a5' : '#bbf7d0'
          }}>
            {feedback.type === 'danger' ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />}
            <span>{feedback.text}</span>
          </div>
        )}

        <div style={styles.body}>
          {/* Form */}
          <form onSubmit={handleSaveBlock} style={styles.formContainer}>
            <div style={styles.formGrid}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Profissional</label>
                <select 
                  value={doctorId} 
                  onChange={e => setDoctorId(e.target.value)} 
                  style={styles.input}
                  required
                >
                  <option value="all">Todos</option>
                  {sortDoctorsByName(doctors).map(d => (
                    <option key={d.uid} value={d.uid}>{formatDoctorDisplayName(d.name)}</option>
                  ))}
                </select>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Motivo</label>
                <select 
                  value={reason} 
                  onChange={e => setReason(e.target.value)} 
                  style={styles.input}
                >
                  <option value="Solicitação">Solicitação</option>
                  <option value="Congresso">Congresso</option>
                  <option value="Férias">Férias</option>
                  <option value="Folga">Folga</option>
                  <option value="Pessoal">Pessoal</option>
                  <option value="Atestado">Atestado</option>
                  <option value="Manutenção">Manutenção</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Início</label>
                <input 
                  type="date" 
                  value={startDate} 
                  onChange={e => setStartDate(e.target.value)} 
                  style={styles.input}
                  required 
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Fim</label>
                <input 
                  type="date" 
                  value={endDate} 
                  onChange={e => setEndDate(e.target.value)} 
                  style={styles.input}
                  required 
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Período</label>
                <select 
                  value={period} 
                  onChange={e => setPeriod(e.target.value)} 
                  style={styles.input}
                >
                  <option value="Dia Inteiro">Dia Inteiro</option>
                  <option value="Manhã">Manhã (08:00 às 12:00)</option>
                  <option value="Tarde">Tarde (13:30 às 18:00)</option>
                  <option value="Horário">Horário</option>
                </select>
              </div>

              {period === 'Horário' && (
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <div style={{ flex: 1 }}>
                    <label style={styles.label}>Início</label>
                    <input 
                      type="time" 
                      value={startTime} 
                      onChange={e => setStartTime(e.target.value)} 
                      style={styles.input}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={styles.label}>Fim</label>
                    <input 
                      type="time" 
                      value={endTime} 
                      onChange={e => setEndTime(e.target.value)} 
                      style={styles.input}
                    />
                  </div>
                </div>
              )}

              <div style={{ ...styles.inputGroup, gridColumn: 'span 2' }}>
                <label style={styles.label}>Observações</label>
                <input 
                  type="text" 
                  value={notes} 
                  onChange={e => setNotes(e.target.value)} 
                  placeholder="Detalhes adicionais sobre a ausência..."
                  style={styles.input} 
                />
              </div>
            </div>

            {/* ⚠️ Warning Box about conflicting appointments */}
            {conflictingAppointments.length > 0 && (
              <div style={styles.conflictBox}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#9a3412', fontWeight: '700', fontSize: '0.85rem' }}>
                  <AlertTriangle size={18} color="#ea580c" />
                  <span>Atenção: Existem {conflictingAppointments.length} agendamento(s) marcado(s) neste período:</span>
                </div>
                <div style={styles.conflictList}>
                  {conflictingAppointments.slice(0, 5).map(apt => (
                    <div key={apt.id} style={styles.conflictItem}>
                      <span style={{ fontWeight: '700', color: '#0f172a' }}>{apt.date.split('-').reverse().join('/')} às {apt.time}</span>
                      <span>— {apt.patientName} ({apt.doctorName})</span>
                    </div>
                  ))}
                  {conflictingAppointments.length > 5 && (
                    <div style={{ fontSize: '0.75rem', color: '#64748b', fontStyle: 'italic' }}>
                      + {conflictingAppointments.length - 5} outro(s) paciente(s) precisarão ser remanejados.
                    </div>
                  )}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem', marginTop: '0.5rem' }}>
              <button type="button" onClick={onClose} style={styles.btnSecondary}>Cancelar</button>
              <button type="submit" disabled={saving} style={styles.btnDanger}>
                <Lock size={15} /> {saving ? 'Salvando...' : 'Bloquear'}
              </button>
            </div>
          </form>

          {/* Active Blocks List */}
          <div style={styles.activeBlocksSection}>
            <div style={styles.sectionTitleRow}>
              <ShieldAlert size={16} color="#dc2626" />
              <strong style={{ fontSize: '0.9rem', color: '#0f172a' }}>Bloqueios ({existingBlocks.length})</strong>
            </div>

            <div style={styles.blocksList}>
              {existingBlocks.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.82rem' }}>
                  Nenhum dia ou período bloqueado no momento.
                </div>
              ) : (
                existingBlocks.map(b => (
                  <div key={b.id} style={styles.blockCard}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <strong style={{ color: '#0f172a', fontSize: '0.85rem' }}>{b.doctorName}</strong>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: '#64748b', marginTop: '0.15rem' }}>
                          <span>📅 {b.startDate.split('-').reverse().join('/')} {b.startDate !== b.endDate ? ` até ${b.endDate.split('-').reverse().join('/')}` : ''}</span>
                          <span>• 🕒 {b.period}</span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#dc2626', fontWeight: '700', marginTop: '0.2rem' }}>
                          Motivo: {b.reason} {b.notes ? `(${b.notes})` : ''}
                        </div>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => handleDelete(b.id)}
                        style={styles.deleteBtn}
                        title="Desbloquear"
                      >
                        <Trash2 size={14} /> Desbloquear
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    zIndex: 99999, padding: '1.5rem'
  },
  modal: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    width: '100%', maxWidth: '900px',
    maxHeight: '90vh',
    display: 'flex', flexDirection: 'column',
    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
    overflow: 'hidden'
  },
  header: {
    padding: '1.25rem 1.5rem',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#f8fafc'
  },
  iconBox: {
    width: '38px', height: '38px', borderRadius: '10px',
    backgroundColor: '#fee2e2',
    display: 'flex', alignItems: 'center', justifyContent: 'center'
  },
  title: {
    margin: 0, fontSize: '1.15rem', color: '#0f172a', fontWeight: '800'
  },
  subtitle: {
    margin: '0.15rem 0 0 0', fontSize: '0.78rem', color: '#64748b'
  },
  closeBtn: {
    background: 'none', border: 'none', cursor: 'pointer', color: '#64748b',
    padding: '0.4rem', borderRadius: '8px', display: 'flex', alignItems: 'center'
  },
  alert: {
    padding: '0.75rem 1.25rem',
    display: 'flex', alignItems: 'center', gap: '0.5rem',
    fontSize: '0.85rem', fontWeight: '600',
    borderBottom: '1px solid transparent'
  },
  body: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1.5rem',
    padding: '1.5rem',
    overflowY: 'auto'
  },
  formContainer: {
    display: 'flex', flexDirection: 'column', gap: '1rem'
  },
  formGrid: {
    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem'
  },
  inputGroup: {
    display: 'flex', flexDirection: 'column'
  },
  label: {
    fontSize: '0.75rem', fontWeight: '700', color: '#475569', marginBottom: '0.25rem'
  },
  input: {
    padding: '0.5rem 0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1',
    fontSize: '0.85rem', color: '#0f172a', backgroundColor: '#ffffff', outline: 'none'
  },
  conflictBox: {
    backgroundColor: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '8px',
    padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem'
  },
  conflictList: {
    display: 'flex', flexDirection: 'column', gap: '0.2rem', marginTop: '0.2rem'
  },
  conflictItem: {
    fontSize: '0.75rem', color: '#7c2d12'
  },
  btnSecondary: {
    padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1',
    backgroundColor: '#ffffff', color: '#475569', fontSize: '0.85rem', fontWeight: '700', cursor: 'pointer'
  },
  btnDanger: {
    padding: '0.6rem 1.25rem', borderRadius: '8px', border: 'none',
    backgroundColor: '#dc2626', color: '#ffffff', fontSize: '0.85rem', fontWeight: '800', cursor: 'pointer',
    display: 'flex', alignItems: 'center', gap: '0.4rem'
  },
  activeBlocksSection: {
    borderLeft: '1px solid #e2e8f0',
    paddingLeft: '1.5rem',
    display: 'flex', flexDirection: 'column', gap: '0.75rem'
  },
  sectionTitleRow: {
    display: 'flex', alignItems: 'center', gap: '0.4rem'
  },
  blocksList: {
    display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '420px', overflowY: 'auto'
  },
  blockCard: {
    backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px',
    padding: '0.75rem'
  },
  deleteBtn: {
    backgroundColor: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '6px',
    color: '#991b1b', fontSize: '0.72rem', fontWeight: '700', padding: '0.25rem 0.5rem',
    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem'
  }
};
