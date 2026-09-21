import React, { useState } from 'react';
import { 
  ShieldCheck, CheckCircle2, AlertCircle, X, Calendar, 
  DollarSign, Send, RotateCcw, FileText, ArrowRight, User
} from 'lucide-react';
import { formatDoctorDisplayName } from '../../utils/doctorFormatters';

export default function MedicalHomologationModal({
  production,
  month,
  schedules = [],
  procedures = [],
  appointments = [],
  settings = {},
  onClose,
  onConfirmHomologate,
  onCancelHomologation,
  loading = false
}) {
  if (!production) return null;

  const isAlreadyHomologated = production.isHomologated;
  const docId = production.doctorId;

  // Filtrar plantões detalhados do médico no mês
  const docShifts = schedules
    .filter(s => 
      (s.doctorId === docId) && 
      (s.checkinStatus === 'Presente' || s.checkinStatus === 'Substituído' || (s.status === 'Confirmado' && s.checkinStatus !== 'Ausente'))
    )
    .sort((a, b) => (a.date || '').localeCompare(b.date || ''));

  // Filtrar procedimentos do médico no mês
  const docProcs = procedures
    .filter(p => p.doctorId === docId)
    .sort((a, b) => (a.date || '').localeCompare(b.date || ''));

  // Formulário de homologação
  const defaultDueDate = `${month}-30`;
  const [dueDate, setDueDate] = useState(production.dueDate || defaultDueDate);
  const [adjustment, setAdjustment] = useState(production.adjustment || 0);
  const [adjustmentReason, setAdjustmentReason] = useState(production.adjustmentReason || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmUndo, setConfirmUndo] = useState(false);

  // Cálculo líquido com ajuste
  const computedNet = Math.max(0, (production.grossTotal || 0) + (parseFloat(adjustment) || 0));

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      if (onConfirmHomologate) {
        await onConfirmHomologate({
          ...production,
          month,
          dueDate: dueDate || defaultDueDate,
          adjustment: parseFloat(adjustment) || 0,
          adjustmentReason: adjustmentReason.trim(),
          netTotal: computedNet
        });
      }
      onClose();
    } catch (err) {
      console.error('Erro ao homologar produção médica:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUndo = async () => {
    setIsSubmitting(true);
    try {
      if (onCancelHomologation) {
        await onCancelHomologation(production.id, production.payableId, production.doctorName);
      }
      onClose();
    } catch (err) {
      console.error('Erro ao desfazer homologação:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Formatação amigável do mês
  const formattedMonth = (() => {
    if (!month) return '';
    const [y, m] = month.split('-');
    const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    const idx = parseInt(m, 10) - 1;
    return `${months[idx] || m} de ${y}`;
  })();

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        {/* Modal Header */}
        <div style={styles.modalHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: isAlreadyHomologated 
                ? 'linear-gradient(135deg, #10b981, #059669)' 
                : 'linear-gradient(135deg, #6366f1, #4f46e5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
            }}>
              <ShieldCheck size={22} />
            </div>
            <div>
              <h3 style={styles.modalTitle}>
                {isAlreadyHomologated ? 'Produção Médica Homologada' : 'Homologação de Produção Médica'}
              </h3>
              <p style={styles.modalSubtitle}>
                Gestão Médica • Competência {formattedMonth} ({month})
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} style={styles.closeBtn}>
            <X size={20} />
          </button>
        </div>

        {/* Status Notice Banner */}
        {isAlreadyHomologated ? (
          <div style={styles.bannerSuccess}>
            <CheckCircle2 size={18} color="#166534" style={{ flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: '800', color: '#166534' }}>
                Homologação Concluída no NexaFINANCE
              </div>
              <div style={{ fontSize: '0.78rem', color: '#15803d', marginTop: '0.1rem' }}>
                Título lançado no Contas a Pagar sob o ID <code>{production.payableId || 'Ref. Financeira'}</code>
                {production.homologatedAt && ` em ${new Date(production.homologatedAt).toLocaleString('pt-BR')}`}.
              </div>
            </div>
          </div>
        ) : (
          <div style={styles.bannerInfo}>
            <AlertCircle size={18} color="#1e40af" style={{ flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: '800', color: '#1e40af' }}>
                Conferência de Repasse & Lançamento Automático
              </div>
              <div style={{ fontSize: '0.78rem', color: '#1d4ed8', marginTop: '0.1rem' }}>
                Confira os itens apurados abaixo. Ao confirmar, o título financeiro será lançado automaticamente no Contas a Pagar na categoria <strong>Honorários Médicos</strong> com a chave PIX do profissional.
              </div>
            </div>
          </div>
        )}

        {/* Doctor Info Card */}
        <div style={styles.doctorCard}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div style={styles.avatarCircle}>
              <User size={20} color="#0284c7" />
            </div>
            <div>
              <div style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a' }}>
                {formatDoctorDisplayName(production.doctorName)}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748b', display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginTop: '0.15rem' }}>
                <span>CRM: <strong>{production.doctorCrm || 'Ativo'}</strong></span>
                <span>•</span>
                <span>Vínculo: <strong>{production.contractType || 'PJ'}</strong></span>
                <span>•</span>
                <span>PIX: <strong style={{ color: '#0284c7' }}>{production.pixKey || 'Não cadastrado'}</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div style={styles.scrollContent}>
          {/* Section: Plantões */}
          <div style={styles.sectionBlock}>
            <div style={styles.sectionHeader}>
              <span style={styles.sectionTitle}>1. Plantões Auditados nos Salões & DP</span>
              <span style={styles.sectionValue}>
                {production.shiftsCount} plantões • R$ {production.shiftsTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>

            {docShifts.length === 0 ? (
              <div style={styles.emptyItem}>Nenhum plantão presencial apurado nesta competência.</div>
            ) : (
              <div style={styles.itemsList}>
                {docShifts.map((s, idx) => (
                  <div key={s.id || idx} style={styles.itemRow}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={styles.dateBadge}>
                        {new Date(s.date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', weekday: 'short' })}
                      </span>
                      <span style={{ fontWeight: '700', color: '#1e293b' }}>{s.sector}</span>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>({s.shift})</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={styles.presencePill}>{s.checkinStatus || 'Presente'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section: Consultas da Agenda */}
          <div style={styles.sectionBlock}>
            <div style={styles.sectionHeader}>
              <span style={styles.sectionTitle}>2. Consultas Ambulatoriais (Agenda)</span>
              <span style={styles.sectionValue}>
                {production.consultationsCount} consultas • R$ {production.consultationsTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            {production.consultationsCount === 0 ? (
              <div style={styles.emptyItem}>Nenhuma consulta ambulatorial concluída na agenda deste mês.</div>
            ) : (
              <div style={styles.itemRow}>
                <span style={{ fontSize: '0.82rem', color: '#334155' }}>
                  Atendimentos e consultas médicas finalizadas no módulo Agenda
                </span>
                <span style={{ fontWeight: '700', color: '#0284c7' }}>
                  {production.consultationsCount} atendimentos realizados
                </span>
              </div>
            )}
          </div>

          {/* Section: Procedimentos */}
          <div style={styles.sectionBlock}>
            <div style={styles.sectionHeader}>
              <span style={styles.sectionTitle}>3. Procedimentos Nefrológicos</span>
              <span style={styles.sectionValue}>
                {production.proceduresCount} procedimentos • R$ {production.proceduresTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>

            {docProcs.length === 0 ? (
              <div style={styles.emptyItem}>Nenhum procedimento complementar lançado neste período.</div>
            ) : (
              <div style={styles.itemsList}>
                {docProcs.map((p, idx) => (
                  <div key={p.id || idx} style={styles.itemRow}>
                    <div>
                      <div style={{ fontWeight: '700', color: '#0f172a' }}>{p.procedureType}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        Paciente: {p.patientName || 'Paciente da Clínica'} • Data: {new Date(p.date + 'T12:00:00').toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                    <span style={{ fontWeight: '800', color: '#059669' }}>
                      R$ {(parseFloat(p.value) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section: Resumo Financeiro e Ajustes */}
          <div style={styles.summaryCard}>
            <div style={styles.summaryRow}>
              <span style={{ color: '#475569', fontWeight: '600' }}>Subtotal Bruto:</span>
              <span style={{ fontWeight: '800', color: '#0f172a' }}>
                R$ {(production.grossTotal || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>

            {!isAlreadyHomologated ? (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <div>
                    <label style={styles.inputLabel}>Ajuste (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={adjustment}
                      onChange={e => setAdjustment(e.target.value)}
                      style={styles.input}
                    />
                  </div>
                  <div>
                    <label style={styles.inputLabel}>Justificativa</label>
                    <input
                      type="text"
                      placeholder="Ex: Hora extra, plantão emergencial, desconto..."
                      value={adjustmentReason}
                      onChange={e => setAdjustmentReason(e.target.value)}
                      style={styles.input}
                    />
                  </div>
                </div>

                <div style={{ marginTop: '0.6rem' }}>
                  <label style={styles.inputLabel}>Data de Vencimento no Contas a Pagar *</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={e => setDueDate(e.target.value)}
                    required
                    style={{ ...styles.input, maxWidth: '200px' }}
                  />
                </div>
              </>
            ) : (
              <>
                {production.adjustment ? (
                  <div style={styles.summaryRow}>
                    <span style={{ color: '#475569', fontWeight: '600' }}>
                      Ajuste ({production.adjustmentReason || 'Ajuste apurado'}):
                    </span>
                    <span style={{ fontWeight: '800', color: production.adjustment >= 0 ? '#166534' : '#b91c1c' }}>
                      {production.adjustment >= 0 ? '+' : ''} R$ {parseFloat(production.adjustment).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ) : null}
                <div style={styles.summaryRow}>
                  <span style={{ color: '#475569', fontWeight: '600' }}>Vencimento Programado:</span>
                  <span style={{ fontWeight: '700', color: '#1e293b' }}>
                    {production.dueDate ? new Date(production.dueDate + 'T12:00:00').toLocaleDateString('pt-BR') : 'Final do mês'}
                  </span>
                </div>
              </>
            )}

            <div style={styles.divider}></div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase' }}>
                  Total Líquido Homologado
                </span>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                  Forma de Repasse: PIX ({production.pixKey || 'Chave do médico'})
                </div>
              </div>
              <div style={{ fontSize: '1.45rem', fontWeight: '900', color: '#059669' }}>
                R$ {(isAlreadyHomologated ? (production.netTotal || production.grossTotal) : computedNet).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div style={styles.modalFooter}>
          {isAlreadyHomologated ? (
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
              {!confirmUndo ? (
                <button
                  type="button"
                  onClick={() => setConfirmUndo(true)}
                  style={styles.undoBtn}
                  title="Estornar homologação e remover lançamento do contas a pagar"
                >
                  <RotateCcw size={14} />
                  <span>Desfazer Homologação</span>
                </button>
              ) : (
                <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.78rem', color: '#dc2626', fontWeight: '700' }}>
                    Confirmar estorno?
                  </span>
                  <button
                    type="button"
                    onClick={handleUndo}
                    disabled={isSubmitting}
                    style={{ ...styles.undoBtn, backgroundColor: '#dc2626', color: '#fff', borderColor: '#dc2626' }}
                  >
                    {isSubmitting ? 'Estornando...' : 'Sim, Desfazer'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmUndo(false)}
                    style={styles.cancelBtn}
                  >
                    Não
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={onClose}
                style={styles.closeActionBtn}
              >
                Fechar
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem', width: '100%' }}>
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                style={styles.cancelBtn}
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleConfirm}
                disabled={isSubmitting}
                style={styles.confirmBtn}
              >
                <Send size={15} />
                <span>{isSubmitting ? 'Homologando...' : 'Confirmar e Homologar'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    backdropFilter: 'blur(3px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 99999,
    padding: '1rem'
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '680px',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    border: '1px solid #e2e8f0',
    overflow: 'hidden'
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.25rem 1.5rem',
    borderBottom: '1px solid #e2e8f0',
    backgroundColor: '#f8fafc'
  },
  modalTitle: {
    margin: 0,
    fontSize: '1.15rem',
    fontWeight: '800',
    color: '#0f172a'
  },
  modalSubtitle: {
    margin: '0.15rem 0 0 0',
    fontSize: '0.78rem',
    color: '#64748b'
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: '#64748b',
    cursor: 'pointer',
    padding: '0.35rem',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  bannerSuccess: {
    backgroundColor: '#f0fdf4',
    borderBottom: '1px solid #bbf7d0',
    padding: '0.85rem 1.5rem',
    display: 'flex',
    gap: '0.75rem',
    alignItems: 'center'
  },
  bannerInfo: {
    backgroundColor: '#eff6ff',
    borderBottom: '1px solid #bfdbfe',
    padding: '0.85rem 1.5rem',
    display: 'flex',
    gap: '0.75rem',
    alignItems: 'center'
  },
  doctorCard: {
    backgroundColor: '#f8fafc',
    borderBottom: '1px solid #e2e8f0',
    padding: '0.85rem 1.5rem'
  },
  avatarCircle: {
    width: '38px',
    height: '38px',
    borderRadius: '50%',
    backgroundColor: '#e0f2fe',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid #bae6fd'
  },
  scrollContent: {
    padding: '1.25rem 1.5rem',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  sectionBlock: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    overflow: 'hidden'
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: '0.65rem 1rem',
    borderBottom: '1px solid #e2e8f0'
  },
  sectionTitle: {
    fontSize: '0.82rem',
    fontWeight: '800',
    color: '#334155'
  },
  sectionValue: {
    fontSize: '0.8rem',
    fontWeight: '700',
    color: '#0284c7'
  },
  itemsList: {
    maxHeight: '160px',
    overflowY: 'auto',
    padding: '0.25rem 0'
  },
  itemRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.5rem 1rem',
    borderBottom: '1px solid #f1f5f9',
    fontSize: '0.8rem'
  },
  emptyItem: {
    padding: '0.85rem 1rem',
    fontSize: '0.78rem',
    color: '#94a3b8',
    fontStyle: 'italic',
    textAlign: 'center'
  },
  dateBadge: {
    backgroundColor: '#f1f5f9',
    color: '#475569',
    fontWeight: '700',
    fontSize: '0.72rem',
    padding: '0.15rem 0.45rem',
    borderRadius: '4px'
  },
  presencePill: {
    fontSize: '0.68rem',
    fontWeight: '700',
    backgroundColor: '#dcfce7',
    color: '#166534',
    padding: '0.15rem 0.45rem',
    borderRadius: '4px'
  },
  summaryCard: {
    backgroundColor: '#f8fafc',
    border: '1px solid #cbd5e1',
    borderRadius: '12px',
    padding: '1rem 1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.6rem'
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '0.85rem'
  },
  inputLabel: {
    display: 'block',
    fontSize: '0.72rem',
    fontWeight: '700',
    color: '#475569',
    marginBottom: '0.25rem'
  },
  input: {
    width: '100%',
    padding: '0.45rem 0.65rem',
    fontSize: '0.82rem',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    outline: 'none',
    backgroundColor: '#fff'
  },
  divider: {
    height: '1px',
    backgroundColor: '#e2e8f0',
    margin: '0.25rem 0'
  },
  modalFooter: {
    display: 'flex',
    padding: '1rem 1.5rem',
    borderTop: '1px solid #e2e8f0',
    backgroundColor: '#f8fafc'
  },
  cancelBtn: {
    padding: '0.5rem 1rem',
    fontSize: '0.82rem',
    fontWeight: '700',
    backgroundColor: '#f1f5f9',
    color: '#475569',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    cursor: 'pointer'
  },
  confirmBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    padding: '0.5rem 1.25rem',
    fontSize: '0.82rem',
    fontWeight: '800',
    backgroundColor: '#10b981',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.25)'
  },
  undoBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
    padding: '0.45rem 0.85rem',
    fontSize: '0.78rem',
    fontWeight: '700',
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    border: '1px solid #fca5a5',
    borderRadius: '6px',
    cursor: 'pointer'
  },
  closeActionBtn: {
    padding: '0.5rem 1.25rem',
    fontSize: '0.82rem',
    fontWeight: '700',
    backgroundColor: '#0f172a',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer'
  }
};
