import React from 'react';
import { 
  ShoppingBag, X, Calendar, User, Building2, Layers, CheckCircle2, 
  Clock, AlertTriangle, Edit, Trash2, ShieldCheck, FileText, Tag, ArrowRight
} from 'lucide-react';

export default function PurchaseDetailsModal({
  show,
  onClose,
  request,
  onEdit,
  onDelete,
  canEdit = false,
  canDelete = false,
  getStatusBadgeColor
}) {
  if (!show || !request) return null;

  const items = (request.items && Array.isArray(request.items) && request.items.length > 0)
    ? request.items
    : [{
        id: 'legacy_1',
        type: request.type || 'Reposição',
        productId: request.productId || '',
        productName: request.productName || 'Insumo',
        quantity: request.quantity || 1,
        unit: request.unit || 'Unidade',
        specification: request.justification || ''
      }];

  const badge = getStatusBadgeColor ? getStatusBadgeColor(request.status) : { bg: '#eff6ff', text: '#1d4ed8' };
  const history = request.history || [];

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modalContent}>
        {/* Cabeçalho */}
        <div style={styles.modalHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={styles.headerIcon}>
              <FileText size={22} color="#0891b2" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <h3 style={styles.modalTitle}>
                  Solicitação #{request.code || request.id?.substring(0, 8)}
                </h3>
                <span style={{
                  ...styles.statusBadge,
                  backgroundColor: badge.bg,
                  color: badge.text
                }}>
                  {request.status}
                </span>
                {request.priority === 'Urgente' && (
                  <span style={styles.urgentBadge}>🚨 URGENTE</span>
                )}
              </div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                Criada em {request.createdAt ? new Date(request.createdAt).toLocaleString('pt-BR') : '-'}
              </span>
            </div>
          </div>
          <button onClick={onClose} style={styles.modalCloseBtn}>×</button>
        </div>

        <div style={styles.modalBody}>
          {/* Grid de Metadados */}
          <div style={styles.metaGrid}>
            <div style={styles.metaCard}>
              <span style={styles.metaLabel}>Solicitante</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}>
                <User size={15} color="#64748b" />
                <strong style={{ fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                  {request.requesterName || 'Profissional'}
                </strong>
              </div>
              {request.requesterEmail && (
                <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{request.requesterEmail}</span>
              )}
            </div>

            <div style={styles.metaCard}>
              <span style={styles.metaLabel}>Setor</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}>
                <Building2 size={15} color="#64748b" />
                <strong style={{ fontSize: '0.88rem', color: 'var(--text-primary)', textTransform: 'uppercase' }}>
                  {request.sector || 'Geral'}
                </strong>
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Unidade: {request.unit || 'Betim'}</span>
            </div>

            <div style={styles.metaCard}>
              <span style={styles.metaLabel}>Total de Insumos</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}>
                <Layers size={15} color="#0891b2" />
                <strong style={{ fontSize: '1.1rem', color: '#0891b2' }}>
                  {items.length} {items.length === 1 ? 'insumo' : 'insumos'}
                </strong>
              </div>
            </div>
          </div>

          {/* Stepper de 5 Etapas */}
          <div style={styles.stepperBox}>
            <span style={styles.sectionTitle}>Esteira de Aprovação</span>
            <div style={styles.timelineWrapper}>
              <div style={styles.timelineTrack}></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', width: '100%' }}>
                {['Solicitado', 'Gestor', 'Diretor', 'Cotação', 'Finalizado'].map((step, idx) => {
                  let isDone = false;
                  if (step === 'Solicitado') isDone = true;
                  if (step === 'Gestor' && ['Aguardando Diretor', 'Aguardando Cotação', 'Finalizado'].includes(request.status)) isDone = true;
                  if (step === 'Diretor' && ['Aguardando Cotação', 'Finalizado'].includes(request.status)) isDone = true;
                  if (step === 'Cotação' && request.status === 'Finalizado') isDone = true;
                  if (step === 'Finalizado' && request.status === 'Finalizado') isDone = true;

                  const isCurrent = (
                    (step === 'Solicitado' && request.status === 'Aguardando Gestor') ||
                    (step === 'Gestor' && request.status === 'Aguardando Gestor') ||
                    (step === 'Diretor' && request.status === 'Aguardando Diretor') ||
                    (step === 'Cotação' && request.status === 'Aguardando Cotação') ||
                    (step === 'Finalizado' && request.status === 'Finalizado')
                  );

                  return (
                    <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={{ 
                        ...styles.timelineNode, 
                        backgroundColor: isDone ? '#10b981' : isCurrent ? '#0891b2' : '#e2e8f0',
                        color: (isDone || isCurrent) ? '#fff' : '#94a3b8',
                        boxShadow: isCurrent ? '0 0 0 4px #cffafe' : 'none'
                      }}>
                        {idx + 1}
                      </div>
                      <span style={{ 
                        fontSize: '0.72rem', 
                        color: isDone ? '#10b981' : isCurrent ? '#0891b2' : 'var(--text-secondary)', 
                        fontWeight: (isDone || isCurrent) ? '700' : '600', 
                        marginTop: '0.35rem' 
                      }}>
                        {step}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Justificativa */}
          {request.justification && (
            <div style={styles.justificationBox}>
              <span style={styles.sectionTitle}>Justificativa</span>
              <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.85rem', color: '#334155', fontStyle: 'italic', lineHeight: '1.4' }}>
                "{request.justification}"
              </p>
            </div>
          )}

          {/* Tabela de Insumos */}
          <div style={styles.itemsSection}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={styles.sectionTitle}>Insumos Solicitados ({items.length})</span>
            </div>

            <div style={styles.itemsTableWrapper}>
              <table style={styles.itemsTable}>
                <thead>
                  <tr>
                    <th style={{ ...styles.itemsTh, width: '40px' }}>#</th>
                    <th style={{ ...styles.itemsTh, width: '90px' }}>Tipo</th>
                    <th style={styles.itemsTh}>Insumo / Descrição</th>
                    <th style={{ ...styles.itemsTh, width: '130px' }}>Quantidade</th>
                    <th style={styles.itemsTh}>Especificação</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it, idx) => (
                    <tr key={it.id || idx} style={styles.itemsTr}>
                      <td style={{ ...styles.itemsTd, color: '#94a3b8', fontWeight: '600' }}>{idx + 1}</td>
                      <td style={styles.itemsTd}>
                        <span style={{
                          ...styles.itemTypeBadge,
                          backgroundColor: it.type === 'Reposição' ? '#ecfeff' : '#fdf4ff',
                          color: it.type === 'Reposição' ? '#0891b2' : '#a21caf',
                          borderColor: it.type === 'Reposição' ? '#cffafe' : '#f5d0fe'
                        }}>
                          {it.type === 'Reposição' ? '📦 Estoque' : '✨ Novo'}
                        </span>
                      </td>
                      <td style={{ ...styles.itemsTd, fontWeight: '700', color: 'var(--text-primary)' }}>
                        {it.productName}
                      </td>
                      <td style={styles.itemsTd}>
                        <strong style={{ color: '#0891b2', fontSize: '0.9rem' }}>{it.quantity}</strong>{' '}
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{it.unit}</span>
                      </td>
                      <td style={{ ...styles.itemsTd, color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                        {it.specification || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Histórico / Logs */}
          {history.length > 0 && (
            <div style={styles.historySection}>
              <span style={styles.sectionTitle}>Histórico de Movimentações</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                {history.map((h, idx) => (
                  <div key={idx} style={styles.historyRow}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Clock size={13} color="#94a3b8" />
                      <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                        {h.date ? new Date(h.date).toLocaleString('pt-BR') : '-'}
                      </span>
                      <span style={styles.historyStatusPill}>{h.status}</span>
                    </div>
                    <span style={{ fontSize: '0.8rem', color: '#334155', marginTop: '0.2rem', display: 'block' }}>
                      {h.message}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Rodapé de Ações */}
        <div style={styles.modalFooter}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {canDelete && (
              <button
                type="button"
                onClick={() => { onClose(); onDelete(request); }}
                style={styles.deleteBtn}
              >
                <Trash2 size={15} />
                <span>Excluir</span>
              </button>
            )}
            {canEdit && (
              <button
                type="button"
                onClick={() => { onClose(); onEdit(request); }}
                style={styles.editBtn}
              >
                <Edit size={15} />
                <span>Editar</span>
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            style={styles.closeBtn}
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    backdropFilter: 'blur(3px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: '1rem'
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '720px',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    display: 'flex',
    flexDirection: 'column'
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.25rem 1.5rem',
    borderBottom: '1px solid #f1f5f9'
  },
  headerIcon: {
    width: '42px',
    height: '42px',
    borderRadius: '10px',
    backgroundColor: '#ecfeff',
    border: '1px solid #cffafe',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  modalTitle: {
    fontSize: '1.15rem',
    fontWeight: '800',
    color: 'var(--text-primary)',
    margin: 0
  },
  modalCloseBtn: {
    background: 'none',
    border: 'none',
    fontSize: '1.6rem',
    cursor: 'pointer',
    color: '#94a3b8',
    lineHeight: 1,
    padding: '0.25rem'
  },
  statusBadge: {
    fontSize: '0.72rem',
    fontWeight: '700',
    padding: '0.15rem 0.55rem',
    borderRadius: '6px'
  },
  urgentBadge: {
    fontSize: '0.7rem',
    fontWeight: '800',
    backgroundColor: '#fef2f2',
    color: '#ef4444',
    border: '1px solid #fecaca',
    padding: '0.15rem 0.5rem',
    borderRadius: '6px'
  },
  modalBody: {
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem'
  },
  metaGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '0.75rem'
  },
  metaCard: {
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    padding: '0.75rem 1rem'
  },
  metaLabel: {
    fontSize: '0.72rem',
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase'
  },
  sectionTitle: {
    fontSize: '0.78rem',
    fontWeight: '700',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: '0.03em'
  },
  stepperBox: {
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '1rem 1.25rem'
  },
  timelineWrapper: {
    position: 'relative',
    marginTop: '1.25rem',
    paddingTop: '0.25rem'
  },
  timelineTrack: {
    position: 'absolute',
    top: '16px',
    left: '5%',
    right: '5%',
    height: '2px',
    backgroundColor: '#e2e8f0',
    zIndex: 1
  },
  timelineNode: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.75rem',
    fontWeight: '700',
    position: 'relative',
    zIndex: 2,
    transition: 'all 0.2s ease'
  },
  justificationBox: {
    backgroundColor: '#fffbeb',
    border: '1px solid #fde68a',
    borderRadius: '10px',
    padding: '0.85rem 1.15rem'
  },
  itemsSection: {
    display: 'flex',
    flexDirection: 'column'
  },
  itemsTableWrapper: {
    backgroundColor: '#fff',
    borderRadius: '10px',
    border: '1px solid #e2e8f0',
    overflowX: 'auto'
  },
  itemsTable: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left'
  },
  itemsTh: {
    padding: '0.65rem 0.85rem',
    fontSize: '0.75rem',
    fontWeight: '700',
    color: '#64748b',
    backgroundColor: '#f8fafc',
    borderBottom: '1px solid #e2e8f0'
  },
  itemsTr: {
    borderBottom: '1px solid #f1f5f9'
  },
  itemsTd: {
    padding: '0.65rem 0.85rem',
    fontSize: '0.82rem',
    verticalAlign: 'middle'
  },
  itemTypeBadge: {
    fontSize: '0.7rem',
    fontWeight: '700',
    padding: '0.15rem 0.45rem',
    borderRadius: '6px',
    border: '1px solid',
    display: 'inline-block'
  },
  historySection: {
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    padding: '0.85rem 1.15rem'
  },
  historyRow: {
    backgroundColor: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '0.6rem 0.85rem'
  },
  historyStatusPill: {
    fontSize: '0.7rem',
    fontWeight: '700',
    backgroundColor: '#f1f5f9',
    color: '#475569',
    padding: '0.1rem 0.4rem',
    borderRadius: '4px'
  },
  modalFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 1.5rem',
    borderTop: '1px solid #f1f5f9',
    backgroundColor: '#fff',
    borderBottomLeftRadius: '16px',
    borderBottomRightRadius: '16px'
  },
  closeBtn: {
    padding: '0.6rem 1.25rem',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#0891b2',
    color: '#fff',
    fontWeight: '700',
    fontSize: '0.85rem',
    cursor: 'pointer'
  },
  editBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
    padding: '0.55rem 0.95rem',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    backgroundColor: '#fff',
    color: '#0891b2',
    fontWeight: '700',
    fontSize: '0.82rem',
    cursor: 'pointer'
  },
  deleteBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
    padding: '0.55rem 0.95rem',
    borderRadius: '8px',
    border: '1px solid #fecaca',
    backgroundColor: '#fff',
    color: '#ef4444',
    fontWeight: '700',
    fontSize: '0.82rem',
    cursor: 'pointer'
  }
};
