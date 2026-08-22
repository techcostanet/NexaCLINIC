import React, { useState } from 'react';
import { 
  RefreshCw, CheckCircle2, XCircle, Clock, 
  Mail, ShieldCheck, AlertCircle, ArrowRight, UserCheck
} from 'lucide-react';

export default function MedicalSwapsTab({
  swaps = [],
  currentDoctor,
  isCoordination = true,
  onRespondSwap,
  onHomologateSwap,
  loading = false
}) {
  const [selectedSwapForEmails, setSelectedSwapForEmails] = useState(null);
  const [filterStatus, setFilterStatus] = useState('Todos');

  const filteredSwaps = swaps.filter(s => {
    if (filterStatus === 'Todos') return true;
    return s.status === filterStatus;
  }).sort((a, b) => new Date(b.requestedAt || 0) - new Date(a.requestedAt || 0));

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h3 style={styles.title}>Bolsa de Trocas & Notificações por E-mail</h3>
          <p style={styles.subtitle}>Gestão de substituições de plantão entre médicos com auditoria e notificações automáticas.</p>
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

                const canRespond = currentDoctor && currentDoctor.id === swap.targetDoctorId && isPendingTarget;

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
                      <div style={{ fontWeight: '700', color: '#1e293b' }}>{swap.requestingDoctorName}</div>
                    </td>
                    <td style={{ textAlign: 'center', color: '#94a3b8' }}>
                      <ArrowRight size={14} />
                    </td>
                    <td>
                      <div style={{ fontWeight: '700', color: '#0284c7' }}>{swap.targetDoctorName}</div>
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
    padding: '0.3rem 0.65rem',
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
  emailBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.3rem',
    fontSize: '0.7rem',
    fontWeight: '700',
    backgroundColor: '#f0f9ff',
    color: '#0369a1',
    border: '1px solid #bae6fd',
    padding: '0.15rem 0.45rem',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  statusPill: {
    fontSize: '0.7rem',
    fontWeight: '700',
    padding: '0.15rem 0.5rem',
    borderRadius: '6px',
  },
  actionBtn: {
    padding: '0.25rem 0.55rem',
    fontSize: '0.7rem',
    fontWeight: '700',
    border: 'none',
    borderRadius: '4px',
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
    padding: '1.5rem',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
  }
};
