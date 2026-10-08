import React from 'react';
import { 
  AlertTriangle, X, Edit2, Trash2, Calendar, 
  Clock, CheckCircle2, User, Stethoscope, ChevronRight 
} from 'lucide-react';
import { formatDoctorDisplayName } from '../../utils/doctorFormatters';

export default function MedicalConflictsModal({
  isOpen,
  onClose,
  conflictGroups = [],
  onEditSchedule,
  onDeleteSchedule,
  onLocateDate,
  selectedMonth
}) {
  if (!isOpen) return null;

  const totalShiftsInConflict = conflictGroups.reduce((acc, g) => acc + (g.items?.length || 0), 0);
  const uniqueDoctorsCount = new Set(conflictGroups.map(g => g.doctorId || g.doctorName)).size;

  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return '';
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]), 12, 0, 0);
        const dowNames = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
        return {
          formatted: `${parts[2]}/${parts[1]}/${parts[0]}`,
          dayOfWeek: dowNames[d.getDay()]
        };
      }
      return { formatted: dateStr, dayOfWeek: '' };
    } catch {
      return { formatted: dateStr, dayOfWeek: '' };
    }
  };

  const getSectorBadgeStyle = (sector) => {
    if (sector?.includes('1')) {
      return { backgroundColor: '#eff6ff', color: '#1d4ed8', borderColor: '#bfdbfe' };
    }
    if (sector?.includes('2')) {
      return { backgroundColor: '#faf5ff', color: '#7e22ce', borderColor: '#e9d5ff' };
    }
    if (sector?.includes('3')) {
      return { backgroundColor: '#fffbeb', color: '#b45309', borderColor: '#fde68a' };
    }
    return { backgroundColor: '#ecfdf5', color: '#047857', borderColor: '#a7f3d0' };
  };

  const handleDeleteItem = (itemId) => {
    if (!onDeleteSchedule || !itemId) return;
    onDeleteSchedule(itemId);
  };

  const handleEditItem = (item) => {
    if (!onEditSchedule || !item) return;
    onClose();
    onEditSchedule(item);
  };

  const handleLocate = (item) => {
    if (onLocateDate) {
      onLocateDate(item);
    }
    onClose();
  };

  return (
    <div style={styles.overlay} onClick={onClose} className="no-print">
      <div 
        style={styles.modal} 
        onClick={e => e.stopPropagation()} 
        role="dialog" 
        aria-modal="true"
        aria-labelledby="conflicts-modal-title"
      >
        {/* Header */}
        <div style={styles.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={styles.iconCircle}>
              <AlertTriangle size={20} color="#b91c1c" />
            </div>
            <div>
              <h3 id="conflicts-modal-title" style={styles.title}>
                Conflitos
              </h3>
              <p style={styles.subtitle}>
                Médicos escalados simultaneamente em múltiplos salões no mesmo turno • {selectedMonth}
              </p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            style={styles.closeBtn} 
            title="Fechar"
            aria-label="Fechar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Resumo de Indicadores */}
        <div style={styles.kpiContainer}>
          <div style={styles.kpiCard}>
            <span style={styles.kpiLabel}>Conflitos</span>
            <strong style={{ ...styles.kpiValue, color: '#b91c1c' }}>{conflictGroups.length}</strong>
            <span style={styles.kpiSub}>sobreposições</span>
          </div>
          <div style={styles.kpiCard}>
            <span style={styles.kpiLabel}>Plantões</span>
            <strong style={{ ...styles.kpiValue, color: '#c2410c' }}>{totalShiftsInConflict}</strong>
            <span style={styles.kpiSub}>envolvidos</span>
          </div>
          <div style={styles.kpiCard}>
            <span style={styles.kpiLabel}>Profissionais</span>
            <strong style={{ ...styles.kpiValue, color: '#4338ca' }}>{uniqueDoctorsCount}</strong>
            <span style={styles.kpiSub}>afetados</span>
          </div>
        </div>

        {/* Corpo com a listagem de conflitos */}
        <div style={styles.body}>
          {conflictGroups.length === 0 ? (
            <div style={styles.emptyState}>
              <CheckCircle2 size={46} color="#16a34a" />
              <h4 style={{ margin: '0.75rem 0 0.25rem 0', color: '#166534', fontWeight: '800' }}>
                Nenhum Conflito
              </h4>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#475569' }}>
                Todos os médicos estão alocados em salões únicos por turno sem nenhuma sobreposição de horário.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={styles.alertBanner}>
                <AlertTriangle size={16} color="#b91c1c" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span style={{ fontSize: '0.8rem', color: '#991b1b', lineHeight: '1.35' }}>
                  A escala de hemodiálise exige um médico exclusivo por salão e turno. Resolva as duplicidades abaixo editando o médico escalado ou desescalando o plantão excedente.
                </span>
              </div>

              {conflictGroups.map((group, gIdx) => {
                const dateInfo = formatDateDisplay(group.date);
                const doctorDisplay = formatDoctorDisplayName(group.doctorName || 'Médico');

                return (
                  <div key={group.key || gIdx} style={styles.groupCard}>
                    {/* Cabeçalho do Conflito */}
                    <div style={styles.groupHeader}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                        <div style={styles.doctorBadge}>
                          <Stethoscope size={14} color="#0369a1" />
                          <strong style={{ color: '#0f172a', fontSize: '0.88rem' }}>
                            {doctorDisplay}
                          </strong>
                          {group.doctorCrm && (
                            <span style={styles.crmTag}>CRM {group.doctorCrm}</span>
                          )}
                        </div>

                        <div style={styles.metaBadge}>
                          <Calendar size={13} color="#64748b" />
                          <span>{dateInfo.formatted} ({dateInfo.dayOfWeek})</span>
                        </div>

                        <div style={styles.shiftBadge}>
                          <Clock size={13} color="#854d0e" />
                          <span>{group.shift}</span>
                        </div>
                      </div>

                      <div style={styles.overlapCountBadge}>
                        <span>{group.items.length} Salões Simultâneos</span>
                      </div>
                    </div>

                    {/* Lista comparativa dos plantões conflitantes */}
                    <div style={styles.itemsGrid}>
                      {group.items.map((item, iIdx) => {
                        const secStyle = getSectorBadgeStyle(item.sector);
                        const isSwap = item.isSwap || item.checkinStatus === 'Substituído';

                        return (
                          <div key={item.id || iIdx} style={styles.itemBox}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                              <span style={{ ...styles.sectorTag, ...secStyle }}>
                                {item.sector}
                              </span>

                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                {isSwap && (
                                  <span style={styles.swapTag}>
                                    Troca
                                  </span>
                                )}
                                <span style={{
                                  fontSize: '0.7rem',
                                  fontWeight: '700',
                                  padding: '0.1rem 0.4rem',
                                  borderRadius: '4px',
                                  backgroundColor: item.status === 'Confirmado' ? '#f0fdf4' : '#fef3c7',
                                  color: item.status === 'Confirmado' ? '#15803d' : '#b45309',
                                  border: `1px solid ${item.status === 'Confirmado' ? '#bbf7d0' : '#fde047'}`
                                }}>
                                  {item.status || 'Confirmado'}
                                </span>
                              </div>
                            </div>

                            {item.notes && (
                              <p style={styles.itemNotes}>
                                <em>Obs:</em> {item.notes}
                              </p>
                            )}

                            {isSwap && item.originalDoctorName && (
                              <span style={{ fontSize: '0.72rem', color: '#854d0e', marginTop: '0.2rem' }}>
                                Titular original: {item.originalDoctorName}
                              </span>
                            )}

                            {/* Ações Diretas */}
                            <div style={styles.itemActions}>
                              <button
                                type="button"
                                onClick={() => handleLocate(item)}
                                style={styles.locateBtn}
                                title="Ver na matriz de escala"
                              >
                                <span>Localizar</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleEditItem(item)}
                                style={styles.editBtn}
                                title="Editar médico ou salão deste plantão"
                              >
                                <Edit2 size={13} />
                                <span>Editar</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDeleteItem(item.id)}
                                style={styles.deleteBtn}
                                title="Desescalar e desocupar este salão"
                              >
                                <Trash2 size={13} />
                                <span>Desescalar</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
            {conflictGroups.length > 0 
              ? 'Ao editar ou desescalar um plantão, o conflito é recalculado imediatamente.' 
              : 'Escala sem apontamento de inconformidades.'}
          </span>
          <button 
            type="button" 
            onClick={onClose} 
            style={styles.closeFooterBtn}
          >
            Fechar
          </button>
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
    zIndex: 1100,
    padding: '1rem'
  },
  modal: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    width: '100%',
    maxWidth: '740px',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
    border: '1px solid #fecdd3',
    overflow: 'hidden'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1rem 1.25rem',
    borderBottom: '1px solid #fee2e2',
    backgroundColor: '#fff5f5'
  },
  iconCircle: {
    width: '38px',
    height: '38px',
    borderRadius: '10px',
    backgroundColor: '#fee2e2',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid #fca5a5'
  },
  title: {
    margin: 0,
    fontSize: '1.1rem',
    fontWeight: '800',
    color: '#991b1b',
    letterSpacing: '-0.3px'
  },
  subtitle: {
    margin: '0.15rem 0 0 0',
    fontSize: '0.78rem',
    color: '#7f1d1d'
  },
  closeBtn: {
    background: 'transparent',
    border: 'none',
    color: '#991b1b',
    cursor: 'pointer',
    padding: '0.35rem',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color 0.15s ease'
  },
  kpiContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '0.75rem',
    padding: '0.85rem 1.25rem',
    backgroundColor: '#f8fafc',
    borderBottom: '1px solid #e2e8f0'
  },
  kpiCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '0.5rem 0.75rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  },
  kpiLabel: {
    fontSize: '0.7rem',
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.3px'
  },
  kpiValue: {
    fontSize: '1.35rem',
    fontWeight: '900',
    lineHeight: '1.2'
  },
  kpiSub: {
    fontSize: '0.68rem',
    color: '#94a3b8'
  },
  body: {
    padding: '1.1rem 1.25rem',
    overflowY: 'auto',
    flex: 1
  },
  alertBanner: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.5rem',
    backgroundColor: '#fef2f2',
    border: '1px solid #fecdd3',
    borderRadius: '8px',
    padding: '0.65rem 0.85rem'
  },
  emptyState: {
    textAlign: 'center',
    padding: '3rem 1.5rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  },
  groupCard: {
    backgroundColor: '#ffffff',
    borderRadius: '10px',
    border: '1px solid #e2e8f0',
    borderLeft: '4px solid #ef4444',
    padding: '0.85rem 1rem',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem'
  },
  groupHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '0.5rem',
    borderBottom: '1px solid #f1f5f9',
    paddingBottom: '0.6rem'
  },
  doctorBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    backgroundColor: '#f0f9ff',
    border: '1px solid #bae6fd',
    padding: '0.2rem 0.5rem',
    borderRadius: '6px'
  },
  crmTag: {
    fontSize: '0.7rem',
    color: '#0369a1',
    fontWeight: '700',
    marginLeft: '0.2rem'
  },
  metaBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.3rem',
    fontSize: '0.78rem',
    color: '#334155',
    fontWeight: '600',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    padding: '0.2rem 0.5rem',
    borderRadius: '6px'
  },
  shiftBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.3rem',
    fontSize: '0.75rem',
    fontWeight: '700',
    color: '#854d0e',
    backgroundColor: '#fef9c3',
    border: '1px solid #fde047',
    padding: '0.2rem 0.5rem',
    borderRadius: '6px'
  },
  overlapCountBadge: {
    fontSize: '0.72rem',
    fontWeight: '800',
    color: '#b91c1c',
    backgroundColor: '#fee2e2',
    border: '1px solid #fca5a5',
    padding: '0.2rem 0.55rem',
    borderRadius: '20px'
  },
  itemsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '0.75rem'
  },
  itemBox: {
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '0.7rem 0.8rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.45rem'
  },
  sectorTag: {
    fontSize: '0.78rem',
    fontWeight: '800',
    padding: '0.2rem 0.55rem',
    borderRadius: '6px',
    border: '1px solid'
  },
  swapTag: {
    fontSize: '0.68rem',
    fontWeight: '700',
    backgroundColor: '#f0fdf4',
    color: '#166534',
    border: '1px solid #bbf7d0',
    padding: '0.1rem 0.35rem',
    borderRadius: '4px'
  },
  itemNotes: {
    margin: 0,
    fontSize: '0.74rem',
    color: '#64748b',
    lineHeight: '1.3'
  },
  itemActions: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '0.4rem',
    marginTop: '0.4rem',
    borderTop: '1px dashed #e2e8f0',
    paddingTop: '0.45rem'
  },
  locateBtn: {
    backgroundColor: '#ffffff',
    border: '1px solid #cbd5e1',
    color: '#475569',
    fontSize: '0.72rem',
    fontWeight: '600',
    padding: '0.25rem 0.5rem',
    borderRadius: '5px',
    cursor: 'pointer'
  },
  editBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    backgroundColor: '#ffffff',
    border: '1px solid #bae6fd',
    color: '#0284c7',
    fontSize: '0.72rem',
    fontWeight: '700',
    padding: '0.25rem 0.55rem',
    borderRadius: '5px',
    cursor: 'pointer'
  },
  deleteBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    backgroundColor: '#fee2e2',
    border: '1px solid #fca5a5',
    color: '#b91c1c',
    fontSize: '0.72rem',
    fontWeight: '700',
    padding: '0.25rem 0.55rem',
    borderRadius: '5px',
    cursor: 'pointer'
  },
  footer: {
    padding: '0.85rem 1.25rem',
    borderTop: '1px solid #e2e8f0',
    backgroundColor: '#f8fafc',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '1rem'
  },
  closeFooterBtn: {
    backgroundColor: '#0f172a',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    padding: '0.45rem 1rem',
    fontSize: '0.82rem',
    fontWeight: '700',
    cursor: 'pointer'
  }
};
