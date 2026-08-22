import React, { useState } from 'react';
import { 
  Calendar, RefreshCw, Plus, CheckCircle2, 
  Clock, ShieldAlert, FileText, Send, User, ChevronRight
} from 'lucide-react';

export default function MedicalMyShiftsTab({
  doctor,
  doctors = [],
  patients = [],
  schedules = [],
  procedures = [],
  onRequestSwap,
  onSaveProcedure,
  loading = false
}) {
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [selectedShiftForSwap, setSelectedShiftForSwap] = useState(null);
  const [targetDoctorId, setTargetDoctorId] = useState('');
  const [swapReason, setSwapReason] = useState('');

  const [showProcModal, setShowProcModal] = useState(false);
  const [procFormData, setProcFormData] = useState({
    patientId: patients[0]?.id || '',
    date: new Date().toISOString().substring(0, 10),
    procedureType: 'Cateter Duplo Lúmen (CDL)',
    notes: ''
  });

  const mySchedules = schedules
    .filter(s => s.doctorId === doctor?.id)
    .sort((a, b) => a.date.localeCompare(b.date));

  const myProcedures = procedures
    .filter(p => p.doctorId === doctor?.id)
    .sort((a, b) => b.date.localeCompare(a.date));

  const handleOpenSwap = (shift) => {
    setSelectedShiftForSwap(shift);
    const otherDocs = doctors.filter(d => d.id !== doctor?.id);
    setTargetDoctorId(otherDocs[0]?.id || '');
    setSwapReason('');
    setShowSwapModal(true);
  };

  const handleSendSwap = (e) => {
    e.preventDefault();
    const targetDoc = doctors.find(d => d.id === targetDoctorId);
    if (!selectedShiftForSwap || !targetDoc) return;

    onRequestSwap({
      requestingDoctorId: doctor.id,
      requestingDoctorName: doctor.name,
      targetDoctorId: targetDoc.id,
      targetDoctorName: targetDoc.name,
      targetDoctorEmail: targetDoc.email,
      scheduleId: selectedShiftForSwap.id,
      shiftDate: selectedShiftForSwap.date,
      sector: selectedShiftForSwap.sector,
      shift: selectedShiftForSwap.shift,
      reason: swapReason
    });
    setShowSwapModal(false);
  };

  const handleSaveProc = (e) => {
    e.preventDefault();
    const pat = patients.find(p => p.id === procFormData.patientId);
    onSaveProcedure({
      doctorId: doctor.id,
      doctorName: doctor.name,
      patientId: procFormData.patientId,
      patientName: pat ? pat.name : 'Paciente Não Informado',
      date: procFormData.date,
      procedureType: procFormData.procedureType,
      notes: procFormData.notes
    });
    setShowProcModal(false);
    setProcFormData({
      patientId: patients[0]?.id || '',
      date: new Date().toISOString().substring(0, 10),
      procedureType: 'Cateter Duplo Lúmen (CDL)',
      notes: ''
    });
  };

  return (
    <div style={styles.container}>
      {/* Doctor Hero Card */}
      <div style={styles.doctorCard}>
        <div style={styles.doctorInfo}>
          <div style={styles.avatarBox}>
            <User size={24} color="#8b5cf6" />
          </div>
          <div>
            <h2 style={styles.doctorName}>{doctor?.name}</h2>
            <p style={styles.doctorMeta}>
              CRM: <strong>{doctor?.crm || 'Ativo'}</strong> • Especialidade: <strong>{doctor?.specialty || 'Nefrologia'}</strong> • E-mail: {doctor?.email}
            </p>
          </div>
        </div>

        <button 
          type="button" 
          onClick={() => setShowProcModal(true)} 
          style={styles.procActionBtn}
        >
          <Plus size={16} />
          <span>Lançar Procedimento</span>
        </button>
      </div>

      {/* Grid: 2 Columns (My Shifts & Executed Procedures) */}
      <div style={styles.grid2}>
        {/* Column 1: My Shift Schedule */}
        <div style={styles.cardSection}>
          <div style={styles.sectionHeader}>
            <div>
              <h3 style={styles.sectionTitle}>Meus Plantões do Mês</h3>
              <p style={styles.sectionSub}>Programação de plantões nos Salões 1, 2, 3 e Diálise Peritoneal (DP).</p>
            </div>
            <span style={styles.countBadge}>{mySchedules.length} Plantões</span>
          </div>

          <div style={styles.shiftList}>
            {mySchedules.length === 0 ? (
              <div style={styles.emptyBox}>Nenhum plantão escalado para você neste período.</div>
            ) : (
              mySchedules.map(sch => {
                const isPresent = sch.checkinStatus === 'Presente';
                const isLate = sch.checkinStatus === 'Atraso';

                return (
                  <div key={sch.id} style={styles.shiftItem}>
                    <div style={styles.shiftDateCol}>
                      <span style={styles.shiftDay}>
                        {new Date(sch.date + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' })}
                      </span>
                      <span style={styles.shiftPill}>{sch.shift}</span>
                    </div>

                    <div style={styles.shiftDetails}>
                      <div style={styles.shiftSector}>{sch.sector}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        Presença: {isPresent ? (
                          <strong style={{ color: '#166534' }}>Confirmada na Ronda ({sch.checkinTime || '06:00'})</strong>
                        ) : isLate ? (
                          <strong style={{ color: '#854d0e' }}>Atraso ({sch.checkinTime})</strong>
                        ) : (
                          <span>Pendente de Ronda</span>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOpenSwap(sch)}
                      style={styles.swapBtn}
                      title="Solicitar troca de plantão com um colega"
                    >
                      <RefreshCw size={13} />
                      <span>Trocar</span>
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Column 2: My Executed Procedures */}
        <div style={styles.cardSection}>
          <div style={styles.sectionHeader}>
            <div>
              <h3 style={styles.sectionTitle}>Procedimentos Executados</h3>
              <p style={styles.sectionSub}>Registro de cateteres, biópsias e intervenções clínicas.</p>
            </div>
            <span style={styles.countBadge}>{myProcedures.length} Lançados</span>
          </div>

          <div style={styles.procList}>
            {myProcedures.length === 0 ? (
              <div style={styles.emptyBox}>Nenhum procedimento registrado neste mês.</div>
            ) : (
              myProcedures.map(proc => (
                <div key={proc.id} style={styles.procItem}>
                  <div>
                    <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '0.85rem' }}>
                      {proc.procedureType}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#475569' }}>
                      Paciente: <strong>{proc.patientName}</strong>
                    </div>
                    {proc.notes && (
                      <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.15rem' }}>
                        {proc.notes}
                      </div>
                    )}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#0284c7' }}>
                      {new Date(proc.date + 'T12:00:00').toLocaleDateString('pt-BR')}
                    </div>
                    <span style={{ fontSize: '0.65rem', backgroundColor: '#dcfce7', color: '#166534', padding: '0.1rem 0.35rem', borderRadius: '4px', fontWeight: '700' }}>
                      {proc.status || 'Realizado'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modal: Solicitar Troca de Plantão */}
      {showSwapModal && selectedShiftForSwap && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <h4 style={{ margin: '0 0 0.5rem 0', fontWeight: '800', color: '#0f172a' }}>
              Solicitar Troca de Plantão
            </h4>
            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0 0 1rem 0' }}>
              Plantão: <strong>{new Date(selectedShiftForSwap.date + 'T12:00:00').toLocaleDateString('pt-BR')}</strong> • {selectedShiftForSwap.sector} • {selectedShiftForSwap.shift}
            </p>

            <form onSubmit={handleSendSwap}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div className="form-group">
                  <label>Médico Substituto *</label>
                  <select 
                    className="form-control" 
                    value={targetDoctorId} 
                    onChange={e => setTargetDoctorId(e.target.value)}
                    required
                  >
                    <option value="">Selecione o Médico Substituto...</option>
                    {doctors.filter(d => (d.id !== doctor?.id && d.uid !== doctor?.id)).map(doc => (
                      <option key={doc.id || doc.uid} value={doc.id || doc.uid}>
                        {doc.name} {doc.crm ? `(${doc.crm})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Motivo da Troca *</label>
                  <textarea 
                    rows={3} 
                    className="form-control" 
                    placeholder="Descreva o motivo (ex: Congresso, Compromisso acadêmico, Imprevisto pessoal)..."
                    value={swapReason}
                    onChange={e => setSwapReason(e.target.value)}
                    required
                  />
                </div>

                <div style={{ fontSize: '0.75rem', backgroundColor: '#f0f9ff', border: '1px solid #bae6fd', padding: '0.6rem', borderRadius: '6px', color: '#0369a1' }}>
                  ✉️ O colega selecionado receberá uma notificação por e-mail para aceitar a troca antes do envio à Coordenação.
                </div>
              </div>

              <div style={styles.modalActions}>
                <button type="button" onClick={() => setShowSwapModal(false)} className="btn btn-secondary">
                  Cancelar
                </button>
                <button type="submit" disabled={loading} className="btn btn-primary" style={{ backgroundColor: '#0284c7' }}>
                  {loading ? 'Enviando...' : 'Enviar Solicitação'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Lançar Procedimento Executado */}
      {showProcModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <h4 style={{ margin: '0 0 1rem 0', fontWeight: '800', color: '#0f172a' }}>
              Lançar Procedimento Executado
            </h4>

            <form onSubmit={handleSaveProc}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div className="form-group">
                  <label>Paciente *</label>
                  <select 
                    className="form-control" 
                    value={procFormData.patientId} 
                    onChange={e => setProcFormData({ ...procFormData, patientId: e.target.value })}
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
                    value={procFormData.date} 
                    onChange={e => setProcFormData({ ...procFormData, date: e.target.value })} 
                    required 
                  />
                </div>

                <div className="form-group">
                  <label>Procedimento *</label>
                  <select 
                    className="form-control" 
                    value={procFormData.procedureType} 
                    onChange={e => setProcFormData({ ...procFormData, procedureType: e.target.value })}
                    required
                  >
                    <option value="Cateter Duplo Lúmen (CDL)">Cateter Duplo Lúmen (CDL)</option>
                    <option value="Implante de Permcath">Implante de Permcath</option>
                    <option value="Biópsia Renal">Biópsia Renal</option>
                    <option value="Mapeamento de Fístula AV">Mapeamento de Fístula AV</option>
                    <option value="Curativo Especial de Acesso">Curativo Especial de Acesso</option>
                    <option value="Punção Biópsia / Aspiração">Punção Biópsia / Aspiração</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Observações</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Ex: Punção em Jugular D guiada por USG sem intercorrências..."
                    value={procFormData.notes} 
                    onChange={e => setProcFormData({ ...procFormData, notes: e.target.value })} 
                  />
                </div>
              </div>

              <div style={styles.modalActions}>
                <button type="button" onClick={() => setShowProcModal(false)} className="btn btn-secondary">
                  Cancelar
                </button>
                <button type="submit" disabled={loading} className="btn btn-primary" style={{ backgroundColor: '#10b981' }}>
                  {loading ? 'Salvando...' : 'Gravar Procedimento'}
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
  doctorCard: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '1.25rem 1.5rem',
    color: '#0f172a',
    border: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1rem',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
  },
  doctorInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  avatarBox: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    backgroundColor: 'rgba(139, 92, 246, 0.12)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  doctorName: {
    fontSize: '1.2rem',
    fontWeight: '800',
    margin: 0,
    color: '#0f172a',
  },
  doctorMeta: {
    fontSize: '0.82rem',
    color: '#64748b',
    margin: '0.2rem 0 0 0',
  },
  procActionBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    padding: '0.55rem 1rem',
    fontSize: '0.85rem',
    fontWeight: '700',
    backgroundColor: '#10b981',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  grid2: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '1.25rem',
  },
  cardSection: {
    backgroundColor: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '1.25rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #f1f5f9',
    paddingBottom: '0.6rem',
  },
  sectionTitle: {
    fontSize: '1.05rem',
    fontWeight: '800',
    color: '#0f172a',
    margin: 0,
  },
  sectionSub: {
    fontSize: '0.75rem',
    color: '#64748b',
    margin: '0.15rem 0 0 0',
  },
  countBadge: {
    fontSize: '0.7rem',
    fontWeight: '800',
    backgroundColor: '#f1f5f9',
    color: '#475569',
    padding: '0.2rem 0.55rem',
    borderRadius: '20px',
  },
  shiftList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.6rem',
    maxHeight: '480px',
    overflowY: 'auto',
  },
  shiftItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '0.75rem',
    gap: '0.5rem',
  },
  shiftDateCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
    minWidth: '95px',
  },
  shiftDay: {
    fontSize: '0.8rem',
    fontWeight: '800',
    color: '#0f172a',
  },
  shiftPill: {
    fontSize: '0.65rem',
    fontWeight: '700',
    backgroundColor: '#fff',
    color: '#6d28d9',
    border: '1px solid #ddd6fe',
    padding: '0.1rem 0.35rem',
    borderRadius: '4px',
    width: 'fit-content',
  },
  shiftDetails: {
    flexGrow: 1,
  },
  shiftSector: {
    fontSize: '0.85rem',
    fontWeight: '700',
    color: '#1e293b',
  },
  swapBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.3rem',
    padding: '0.35rem 0.65rem',
    fontSize: '0.75rem',
    fontWeight: '700',
    backgroundColor: '#eff6ff',
    color: '#0284c7',
    border: '1px solid #bae6fd',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  procList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.6rem',
    maxHeight: '480px',
    overflowY: 'auto',
  },
  procItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '0.75rem',
  },
  emptyBox: {
    textAlign: 'center',
    padding: '2rem 1rem',
    color: '#94a3b8',
    fontSize: '0.85rem',
    fontStyle: 'italic',
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
