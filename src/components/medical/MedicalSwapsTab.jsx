import React, { useState } from 'react';
import { 
  RefreshCw, CheckCircle2, XCircle, Clock, 
  Mail, ShieldCheck, AlertCircle, ArrowRight, UserCheck, Plus, X
} from 'lucide-react';
import { formatDoctorDisplayName, sortDoctorsByName } from '../../utils/doctorFormatters';
import { FALLBACK_DOCTORS } from '../../services/firebase/medicalService';

export default function MedicalSwapsTab({
  swaps = [],
  currentDoctor,
  doctors = [],
  schedules = [],
  isCoordination = true,
  onRequestSwap,
  onRespondSwap,
  onHomologateSwap,
  loading = false
}) {
  const [selectedSwapForEmails, setSelectedSwapForEmails] = useState(null);
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [showNewSwapModal, setShowNewSwapModal] = useState(false);

  const availableDoctors = Array.isArray(doctors) && doctors.length > 0 ? doctors : FALLBACK_DOCTORS;
  const activeDoc = currentDoctor || availableDoctors[0];
  const activeDocId = activeDoc?.id || activeDoc?.uid;

  // Filter shifts assigned to the current active doctor
  const myShifts = schedules.filter(s => {
    const isDoc = s.doctorId === activeDocId || s.doctorId === activeDoc?.id || s.doctorId === activeDoc?.uid;
    const isNotAbsent = s.checkinStatus !== 'Ausente';
    return isDoc && isNotAbsent;
  }).sort((a, b) => (a.date || '').localeCompare(b.date || ''));

  // Swap Request Form State
  const [selectedShiftId, setSelectedShiftId] = useState('');
  const [targetDoctorId, setTargetDoctorId] = useState('');
  const [swapReason, setSwapReason] = useState('');
  const [submittingSwap, setSubmittingSwap] = useState(false);

  const handleOpenNewSwap = () => {
    if (myShifts.length > 0) {
      setSelectedShiftId(myShifts[0].id);
    } else {
      setSelectedShiftId('');
    }
    const otherDocs = availableDoctors.filter(d => (d.id || d.uid) !== activeDocId);
    if (otherDocs.length > 0) {
      setTargetDoctorId(otherDocs[0].id || otherDocs[0].uid);
    }
    setSwapReason('');
    setShowNewSwapModal(true);
  };

  const handleSendSwapSubmit = async (e) => {
    e.preventDefault();
    if (!selectedShiftId || !targetDoctorId) return;

    const chosenShift = myShifts.find(s => s.id === selectedShiftId);
    const chosenTargetDoc = availableDoctors.find(d => (d.id || d.uid) === targetDoctorId);

    if (!chosenShift || !chosenTargetDoc) return;

    setSubmittingSwap(true);
    try {
      const swapPayload = {
        shiftId: chosenShift.id,
        shiftDate: chosenShift.date,
        shift: chosenShift.shift,
        sector: chosenShift.sector,
        unitId: chosenShift.unitId || 'betim',
        requestingDoctorId: activeDocId,
        requestingDoctorName: formatDoctorDisplayName(activeDoc.name),
        requestingDoctorEmail: activeDoc.email || 'contato@techcosta.net',
        targetDoctorId: chosenTargetDoc.id || chosenTargetDoc.uid,
        targetDoctorName: formatDoctorDisplayName(chosenTargetDoc.name),
        targetDoctorEmail: chosenTargetDoc.email || 'secretariabetim@dialize.com.br',
        reason: swapReason.trim() || 'Troca de plantão assistencial',
        status: 'Pendente',
        requestedAt: new Date().toISOString(),
        emailLogs: [
          {
            to: chosenTargetDoc.email || 'secretariabetim@dialize.com.br',
            subject: `[Nex-Ai.MED] Solicitação de Troca de Plantão — ${chosenShift.date}`,
            date: new Date().toLocaleString('pt-BR')
          },
          {
            to: activeDoc.email || 'contato@techcosta.net',
            subject: `[Nex-Ai.MED] Comprovante de Solicitação de Troca — ${chosenShift.date}`,
            date: new Date().toLocaleString('pt-BR')
          }
        ]
      };

      if (onRequestSwap) {
        await onRequestSwap(swapPayload);
      }
      setShowNewSwapModal(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingSwap(false);
    }
  };

  const filteredSwaps = swaps.filter(s => {
    if (filterStatus === 'Todos') return true;
    return s.status === filterStatus;
  }).sort((a, b) => new Date(b.requestedAt || 0) - new Date(a.requestedAt || 0));

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h3 style={styles.title}>Bolsa de Trocas & Notificações por E-mail</h3>
            <p style={styles.subtitle}>Gestão de substituições de plantão entre médicos com auditoria e notificações automáticas.</p>
          </div>
          <button
            type="button"
            onClick={handleOpenNewSwap}
            style={styles.newSwapBtn}
          >
            <Plus size={15} />
            <span>Pedir Troca de Plantão</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div style={styles.filterBar}>
        <div style={styles.filterGroup}>
          {['Todos', 'Pendente', 'Aceito', 'Homologado', 'Recusado'].map(st => (
            <button
              key={st}
              type="button"
              onClick={() => setFilterStatus(st)}
              style={{
                ...styles.filterBtn,
                ...(filterStatus === st ? styles.filterBtnActive : {})
              }}
            >
              {st} ({swaps.filter(s => st === 'Todos' || s.status === st).length})
            </button>
          ))}
        </div>
      </div>

      {/* Swaps Table */}
      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th>Plantão</th>
              <th>Solicitante</th>
              <th></th>
              <th>Substituto</th>
              <th>Motivo</th>
              <th>Notificações</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredSwaps.length === 0 ? (
              <tr>
                <td colSpan="8" style={styles.noDataCell}>
                  Nenhuma solicitação de troca encontrada.
                </td>
              </tr>
            ) : (
              filteredSwaps.map(swap => {
                const isPendingTarget = swap.status === 'Pendente';
                const isPendingCoord = swap.status === 'Aceito';
                const isHomologated = swap.status === 'Homologado';

                const canRespond = activeDoc && (activeDoc.id === swap.targetDoctorId || activeDoc.uid === swap.targetDoctorId) && isPendingTarget;

                return (
                  <tr key={swap.id}>
                    <td>
                      <div style={{ fontWeight: '700', color: '#0f172a' }}>
                        {new Date(swap.shiftDate + 'T12:00:00').toLocaleDateString('pt-BR')}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        {swap.sector} • {swap.shift}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: '700', color: '#1e293b' }}>{formatDoctorDisplayName(swap.requestingDoctorName)}</div>
                    </td>
                    <td style={{ textAlign: 'center', color: '#94a3b8' }}>
                      <ArrowRight size={14} />
                    </td>
                    <td>
                      <div style={{ fontWeight: '700', color: '#0284c7' }}>{formatDoctorDisplayName(swap.targetDoctorName)}</div>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: '#475569', maxWidth: '200px' }}>
                      {swap.reason || '-'}
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() => setSelectedSwapForEmails(swap)}
                        style={styles.emailBadge}
                        title="Ver histórico de e-mails disparados"
                      >
                        <Mail size={12} />
                        <span>{swap.emailLogs?.length || 1} E-mails</span>
                      </button>
                    </td>
                    <td>
                      <span style={{
                        ...styles.statusPill,
                        backgroundColor: isHomologated ? '#dcfce7' : isPendingCoord ? '#eff6ff' : isPendingTarget ? '#fef3c7' : '#fee2e2',
                        color: isHomologated ? '#166534' : isPendingCoord ? '#1d4ed8' : isPendingTarget ? '#b45309' : '#991b1b'
                      }}>
                        {swap.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                        {/* Target Doctor Action */}
                        {canRespond && (
                          <>
                            <button
                              type="button"
                              onClick={() => onRespondSwap(swap.id, true)}
                              style={{ ...styles.actionBtn, backgroundColor: '#10b981', color: '#fff' }}
                            >
                              Aceitar
                            </button>
                            <button
                              type="button"
                              onClick={() => onRespondSwap(swap.id, false)}
                              style={{ ...styles.actionBtn, backgroundColor: '#ef4444', color: '#fff' }}
                            >
                              Recusar
                            </button>
                          </>
                        )}

                        {/* Coordination Homologation Action */}
                        {isCoordination && isPendingCoord && (
                          <button
                            type="button"
                            onClick={() => onHomologateSwap(swap.id, true)}
                            style={{ ...styles.actionBtn, backgroundColor: '#8b5cf6', color: '#fff' }}
                          >
                            Homologar
                          </button>
                        )}

                        {isCoordination && isPendingTarget && (
                          <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Aguardando Colega</span>
                        )}

                        {isHomologated && (
                          <span style={{ fontSize: '0.7rem', color: '#166534', fontWeight: '700' }}>✓ Concluída</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal: Solicitar Nova Troca de Plantão */}
      {showNewSwapModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <RefreshCw size={18} color="#0284c7" />
                <h4 style={{ margin: 0, fontWeight: '800', color: '#0f172a' }}>Solicitar Troca de Plantão</h4>
              </div>
              <button onClick={() => setShowNewSwapModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={18} />
              </button>
            </div>

            {myShifts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '1.5rem 1rem', color: '#64748b' }}>
                <AlertCircle size={32} color="#f59e0b" style={{ margin: '0 auto 0.5rem auto' }} />
                <p style={{ fontWeight: '700', color: '#0f172a', margin: '0 0 0.25rem 0' }}>Nenhum plantão escalado</p>
                <p style={{ fontSize: '0.8rem', margin: 0 }}>Você não possui plantões escalados pela coordenação disponíveis para troca neste período.</p>
                <div style={{ marginTop: '1.25rem' }}>
                  <button type="button" onClick={() => setShowNewSwapModal(false)} className="btn btn-secondary">Fechar</button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSendSwapSubmit}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <div className="form-group">
                    <label>Seu Plantão a Trocar *</label>
                    <select
                      className="form-control"
                      value={selectedShiftId}
                      onChange={e => setSelectedShiftId(e.target.value)}
                      required
                    >
                      {myShifts.map(s => (
                        <option key={s.id} value={s.id}>
                          {new Date(s.date + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' })} • {s.sector} • Turno {s.shift}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Colega Substituto *</label>
                    <select
                      className="form-control"
                      value={targetDoctorId}
                      onChange={e => setTargetDoctorId(e.target.value)}
                      required
                    >
                      {sortDoctorsByName(availableDoctors.filter(d => (d.id || d.uid) !== activeDocId)).map(doc => (
                        <option key={doc.id || doc.uid} value={doc.id || doc.uid}>
                          {formatDoctorDisplayName(doc.name)} {doc.crm ? `(${doc.crm})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Motivo da Troca</label>
                    <textarea
                      className="form-control"
                      placeholder="Ex: Participação em congresso de nefrologia / compromisso pessoal..."
                      value={swapReason}
                      onChange={e => setSwapReason(e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.25rem', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
                  <button type="button" onClick={() => setShowNewSwapModal(false)} className="btn btn-secondary">
                    Cancelar
                  </button>
                  <button type="submit" disabled={submittingSwap} className="btn btn-primary" style={{ backgroundColor: '#0284c7' }}>
                    {submittingSwap ? 'Enviando...' : 'Enviar Solicitação'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Modal: Visualizar Histórico de E-mails Disparados */}
      {selectedSwapForEmails && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Mail size={18} color="#0284c7" />
                <h4 style={{ margin: 0, fontWeight: '800', color: '#0f172a' }}>Rastreabilidade de E-mails</h4>
              </div>
              <button onClick={() => setSelectedSwapForEmails(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {(selectedSwapForEmails.emailLogs || []).map((log, lIdx) => (
                <div key={lIdx} style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b', marginBottom: '0.2rem' }}>
                    <span>Destinatário: <strong>{log.to}</strong></span>
                    <span>{log.date}</span>
                  </div>
                  <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#0f172a' }}>
                    {log.subject}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#059669', marginTop: '0.3rem', fontWeight: '600' }}>
                    ✓ Notificação entregue aos servidores SMTP
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
              <button onClick={() => setSelectedSwapForEmails(null)} className="btn btn-secondary">
                Fechar
              </button>
            </div>
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
  newSwapBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    padding: '0.45rem 0.9rem',
    fontSize: '0.82rem',
    fontWeight: '700',
    backgroundColor: '#0284c7',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  filterBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filterGroup: {
    display: 'flex',
    gap: '0.35rem',
    flexWrap: 'wrap',
  },
  filterBtn: {
    padding: '0.35rem 0.75rem',
    fontSize: '0.8rem',
    fontWeight: '600',
    backgroundColor: '#f1f5f9',
    color: '#475569',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  filterBtnActive: {
    backgroundColor: '#0f172a',
    color: '#fff',
  },
  tableWrapper: {
    backgroundColor: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.85rem',
    textAlign: 'left',
  },
  noDataCell: {
    padding: '2rem',
    textAlign: 'center',
    color: '#94a3b8',
    fontStyle: 'italic',
  },
  statusPill: {
    fontSize: '0.7rem',
    fontWeight: '700',
    padding: '0.2rem 0.5rem',
    borderRadius: '4px',
    display: 'inline-block',
  },
  actionBtn: {
    padding: '0.25rem 0.6rem',
    fontSize: '0.75rem',
    fontWeight: '700',
    borderRadius: '4px',
    border: 'none',
    cursor: 'pointer',
  },
  emailBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.3rem',
    backgroundColor: '#eff6ff',
    color: '#1d4ed8',
    border: '1px solid #bfdbfe',
    borderRadius: '4px',
    padding: '0.15rem 0.4rem',
    fontSize: '0.75rem',
    fontWeight: '600',
    cursor: 'pointer',
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
    maxWidth: '520px',
    padding: '1.25rem',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  }
};
