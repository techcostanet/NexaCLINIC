import React, { useState, useEffect } from 'react';
import { 
  Save, DollarSign, Check, Edit2, 
  X, AlertCircle, History, Trash2, Plus
} from 'lucide-react';
import { DEFAULT_MEDICAL_SETTINGS } from '../../services/firebase/medicalService';
import { dbService } from '../../firebase';

export default function MedicalSettingsTab({
  settings = {},
  onSaveSettings,
  loading = false
}) {
  const [formData, setFormData] = useState({
    shiftFee: settings.shiftFee || DEFAULT_MEDICAL_SETTINGS.shiftFee,
    shiftFees: {
      ...DEFAULT_MEDICAL_SETTINGS.shiftFees,
      ...(settings.shiftFees || {})
    },
    consultationFee: settings.consultationFee || DEFAULT_MEDICAL_SETTINGS.consultationFee,
    consultationFees: {
      ...DEFAULT_MEDICAL_SETTINGS.consultationFees,
      ...(settings.consultationFees || {})
    },
    procedureFees: {
      ...DEFAULT_MEDICAL_SETTINGS.procedureFees,
      ...(settings.procedureFees || {})
    },
    procedureStatus: {
      ...DEFAULT_MEDICAL_SETTINGS.procedureStatus,
      ...(settings.procedureStatus || {})
    }
  });

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [historyModalItem, setHistoryModalItem] = useState(null);
  const [editingProcItem, setEditingProcItem] = useState(null);
  const [showNewProcModal, setShowNewProcModal] = useState(false);
  const [newProcName, setNewProcName] = useState('');
  const [newProcValue, setNewProcValue] = useState('');

  useEffect(() => {
    if (settings && Object.keys(settings).length > 0) {
      setFormData({
        shiftFee: settings.shiftFee || DEFAULT_MEDICAL_SETTINGS.shiftFee,
        shiftFees: {
          ...DEFAULT_MEDICAL_SETTINGS.shiftFees,
          ...(settings.shiftFees || {})
        },
        consultationFee: settings.consultationFee || DEFAULT_MEDICAL_SETTINGS.consultationFee,
        consultationFees: {
          ...DEFAULT_MEDICAL_SETTINGS.consultationFees,
          ...(settings.consultationFees || {})
        },
        procedureFees: {
          ...DEFAULT_MEDICAL_SETTINGS.procedureFees,
          ...(settings.procedureFees || {})
        },
        procedureStatus: {
          ...DEFAULT_MEDICAL_SETTINGS.procedureStatus,
          ...(settings.procedureStatus || {})
        }
      });
    }
  }, [settings]);

  const handleSave = async (updatedData = null) => {
    const dataToSave = updatedData || formData;
    if (onSaveSettings) {
      await onSaveSettings(dataToSave);
    }
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleShiftFeeChange = (shiftName, val) => {
    const updated = {
      ...formData,
      shiftFees: {
        ...formData.shiftFees,
        [shiftName]: parseFloat(val) || 0
      }
    };
    setFormData(updated);
    handleSave(updated);
  };

  const handleConsultFeeChange = (consultType, val) => {
    const updated = {
      ...formData,
      consultationFees: {
        ...formData.consultationFees,
        [consultType]: parseFloat(val) || 0
      }
    };
    setFormData(updated);
    handleSave(updated);
  };

  const handleToggleProcedure = (procName) => {
    const current = formData.procedureStatus?.[procName] !== false;
    const updated = {
      ...formData,
      procedureStatus: {
        ...formData.procedureStatus,
        [procName]: !current
      }
    };
    setFormData(updated);
    handleSave(updated);

    if (dbService?.saveProcedure && dbService?.getProcedures) {
      dbService.getProcedures().then(list => {
        const match = list.find(p => p.name === procName);
        if (match) {
          dbService.saveProcedure({ ...match, active: !current });
        }
      }).catch(e => console.warn('Erro ao sincronizar status com T.I:', e));
    }
  };

  const handleDeleteProcedure = (procName) => {
    if (!window.confirm(`Deseja remover o procedimento "${procName}" da tabela de honorários?`)) return;
    const newFees = { ...formData.procedureFees };
    delete newFees[procName];
    const newStatus = { ...formData.procedureStatus };
    delete newStatus[procName];
    const updated = {
      ...formData,
      procedureFees: newFees,
      procedureStatus: newStatus
    };
    setFormData(updated);
    handleSave(updated);

    if (dbService?.deleteProcedure && dbService?.getProcedures) {
      dbService.getProcedures().then(list => {
        const match = list.find(p => p.name === procName);
        if (match) {
          dbService.deleteProcedure(match.id);
        }
      }).catch(e => console.warn('Erro ao excluir procedimento no T.I:', e));
    }
  };

  const handleSaveEditedProc = (e) => {
    e.preventDefault();
    if (!editingProcItem) return;
    const numVal = parseFloat(editingProcItem.value) || 0;
    const updated = {
      ...formData,
      procedureFees: {
        ...formData.procedureFees,
        [editingProcItem.name]: numVal
      }
    };
    setFormData(updated);
    handleSave(updated);

    if (dbService?.saveProcedure && dbService?.getProcedures) {
      dbService.getProcedures().then(list => {
        const match = list.find(p => p.name === editingProcItem.name);
        if (match) {
          dbService.saveProcedure({ ...match, value: numVal });
        } else {
          dbService.saveProcedure({
            name: editingProcItem.name,
            value: numVal,
            active: true,
            modules: { assist: true, medical: true, clinical: true, apac: false }
          });
        }
      }).catch(e => console.warn('Erro ao atualizar procedimento no T.I:', e));
    }

    setEditingProcItem(null);
  };

  const handleCreateNewProc = (e) => {
    e.preventDefault();
    if (!newProcName.trim()) return;
    const procName = newProcName.trim().toUpperCase();
    const val = parseFloat(newProcValue) || 0;
    const updated = {
      ...formData,
      procedureFees: {
        ...formData.procedureFees,
        [procName]: val
      },
      procedureStatus: {
        ...formData.procedureStatus,
        [procName]: true
      }
    };
    setFormData(updated);
    handleSave(updated);

    if (dbService?.saveProcedure) {
      dbService.saveProcedure({
        name: procName,
        value: val,
        active: true,
        modules: { assist: true, medical: true, clinical: true, apac: false }
      }).catch(e => console.warn('Erro ao criar procedimento no T.I:', e));
    }

    setNewProcName('');
    setNewProcValue('');
    setShowNewProcModal(false);
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h3 style={styles.title}>Valores de produção</h3>
            <p style={styles.subtitle}>Tabela referencial de remuneração para consultas, plantões assistenciais e procedimentos nefrológicos.</p>
          </div>
          {savedSuccess && (
            <span style={{ color: '#166534', fontSize: '0.8rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.3rem', backgroundColor: '#dcfce7', padding: '0.3rem 0.6rem', borderRadius: '6px' }}>
              <Check size={16} /> Salvo na nuvem
            </span>
          )}
        </div>
      </div>

      {/* Section 1: Consultas & Plantões side-by-side */}
      <div style={styles.grid2}>
        {/* Consultas Table */}
        <div style={styles.card}>
          <h4 style={styles.cardTitle}>Consultas</h4>
          <div style={styles.tableWrapperCompact}>
            <table style={styles.tableCompact}>
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th style={{ textAlign: 'right' }}>Valor atual (R$)</th>
                  <th style={{ textAlign: 'center', width: '100px' }}>Histórico</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(formData.consultationFees).map(([tipo, val]) => (
                  <tr key={tipo}>
                    <td style={{ fontWeight: '600', color: '#1e293b' }}>{tipo}</td>
                    <td style={{ textAlign: 'right', fontWeight: '700', color: '#0f172a' }}>
                      R$ {val.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        type="button"
                        onClick={() => setHistoryModalItem({ title: `Consulta ${tipo}`, currentVal: val })}
                        style={styles.historyBtn}
                      >
                        <History size={13} />
                        <span>Histórico</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Plantões Table */}
        <div style={styles.card}>
          <h4 style={styles.cardTitle}>Plantões</h4>
          <div style={styles.tableWrapperCompact}>
            <table style={styles.tableCompact}>
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th style={{ textAlign: 'right' }}>Valor atual (R$)</th>
                  <th style={{ textAlign: 'center', width: '100px' }}>Histórico</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(formData.shiftFees).map(([tipo, val]) => (
                  <tr key={tipo}>
                    <td style={{ fontWeight: '600', color: '#1e293b' }}>{tipo}</td>
                    <td style={{ textAlign: 'right', fontWeight: '700', color: '#0f172a' }}>
                      R$ {val.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        type="button"
                        onClick={() => setHistoryModalItem({ title: `Plantão ${tipo}`, currentVal: val })}
                        style={styles.historyBtn}
                      >
                        <History size={13} />
                        <span>Histórico</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Section 2: Procedimentos List */}
      <div style={{ ...styles.card, marginTop: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '800', color: '#0f172a' }}>
              Procedimentos Médicos ({Object.keys(formData.procedureFees).length})
            </h4>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
              Tabela de procedimentos autorizados com valores de repasse profissional e status de vigência.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowNewProcModal(true)}
            style={styles.newProcBtn}
          >
            <Plus size={14} />
            <span>Novo Procedimento</span>
          </button>
        </div>

        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <tbody>
              {Object.entries(formData.procedureFees).map(([procName, val]) => {
                const isActive = formData.procedureStatus?.[procName] !== false;

                return (
                  <tr key={procName} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ fontWeight: '700', fontSize: '0.82rem', color: isActive ? '#0f172a' : '#94a3b8', letterSpacing: '-0.2px' }}>
                      {procName}
                    </td>

                    <td style={{ textAlign: 'right', fontWeight: '700', fontSize: '0.85rem', color: isActive ? '#0f172a' : '#94a3b8', width: '130px' }}>
                      R$ {val.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>

                    {/* Toggle Switch */}
                    <td style={{ textAlign: 'center', width: '80px' }}>
                      <button
                        type="button"
                        onClick={() => handleToggleProcedure(procName)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: '0.2rem'
                        }}
                        title={isActive ? 'Desativar procedimento' : 'Ativar procedimento'}
                      >
                        <div style={{
                          width: '36px',
                          height: '20px',
                          backgroundColor: isActive ? '#0f172a' : '#cbd5e1',
                          borderRadius: '20px',
                          position: 'relative',
                          transition: 'background-color 0.2s ease'
                        }}>
                          <div style={{
                            width: '14px',
                            height: '14px',
                            backgroundColor: '#ffffff',
                            borderRadius: '50%',
                            position: 'absolute',
                            top: '3px',
                            left: isActive ? '19px' : '3px',
                            transition: 'left 0.2s ease'
                          }} />
                        </div>
                      </button>
                    </td>

                    {/* Actions: History, Edit, Delete */}
                    <td style={{ textAlign: 'right', width: '110px' }}>
                      <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end', alignItems: 'center' }}>
                        <button
                          type="button"
                          onClick={() => setHistoryModalItem({ title: procName, currentVal: val })}
                          style={styles.iconActionBtn}
                          title="Histórico de alterações"
                        >
                          <History size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingProcItem({ name: procName, value: val })}
                          style={styles.iconActionBtn}
                          title="Editar valor"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteProcedure(procName)}
                          style={{ ...styles.iconActionBtn, color: '#ef4444' }}
                          title="Excluir procedimento"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Histórico de Alterações de Valor */}
      {historyModalItem && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContentSmall}>
            <div style={styles.modalHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <History size={18} color="#0284c7" />
                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '800', color: '#0f172a' }}>
                  Histórico: {historyModalItem.title}
                </h4>
              </div>
              <button onClick={() => setHistoryModalItem(null)} style={styles.closeBtn}><X size={18} /></button>
            </div>
            <div style={{ padding: '1rem' }}>
              <div style={{ backgroundColor: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '700' }}>VALOR VIGENTE</span>
                <div style={{ fontSize: '1.25rem', fontWeight: '900', color: '#059669', marginTop: '0.2rem' }}>
                  R$ {historyModalItem.currentVal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8rem', color: '#475569' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.4rem' }}>
                  <span>Vigência atual (desde 01/01/2026):</span>
                  <strong>R$ {historyModalItem.currentVal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.4rem', color: '#94a3b8' }}>
                  <span>Ano 2025:</span>
                  <span>R$ {(historyModalItem.currentVal * 0.95).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>
            <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid #e2e8f0', textAlign: 'right' }}>
              <button onClick={() => setHistoryModalItem(null)} className="btn btn-secondary">Fechar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Editar Valor de Procedimento */}
      {editingProcItem && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContentSmall}>
            <div style={styles.modalHeader}>
              <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '800', color: '#0f172a' }}>
                Editar Valor: {editingProcItem.name}
              </h4>
              <button onClick={() => setEditingProcItem(null)} style={styles.closeBtn}><X size={18} /></button>
            </div>
            <form onSubmit={handleSaveEditedProc}>
              <div style={{ padding: '1rem' }}>
                <div className="form-group">
                  <label>Valor de Remuneração (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control"
                    value={editingProcItem.value}
                    onChange={e => setEditingProcItem({ ...editingProcItem, value: e.target.value })}
                    required
                    autoFocus
                  />
                </div>
              </div>
              <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button type="button" onClick={() => setEditingProcItem(null)} className="btn btn-secondary">Cancelar</button>
                <button type="submit" className="btn btn-primary" style={{ backgroundColor: '#10b981' }}>Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Novo Procedimento */}
      {showNewProcModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContentSmall}>
            <div style={styles.modalHeader}>
              <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '800', color: '#0f172a' }}>
                Novo Procedimento
              </h4>
              <button onClick={() => setShowNewProcModal(false)} style={styles.closeBtn}><X size={18} /></button>
            </div>
            <form onSubmit={handleCreateNewProc}>
              <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div className="form-group">
                  <label>Nome do Procedimento *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Ex: CATETER PERITONEAL TENCKHOFF"
                    value={newProcName}
                    onChange={e => setNewProcName(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
                <div className="form-group">
                  <label>Valor de Remuneração (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control"
                    placeholder="0.00"
                    value={newProcValue}
                    onChange={e => setNewProcValue(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button type="button" onClick={() => setShowNewProcModal(false)} className="btn btn-secondary">Cancelar</button>
                <button type="submit" className="btn btn-primary" style={{ backgroundColor: '#10b981' }}>Cadastrar</button>
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
    gap: '1rem',
  },
  card: {
    backgroundColor: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    padding: '1.25rem',
    boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
  },
  cardTitle: {
    fontSize: '0.95rem',
    fontWeight: '800',
    color: '#0f172a',
    margin: 0,
    marginBottom: '0.75rem',
  },
  tableWrapperCompact: {
    overflowX: 'auto',
  },
  tableCompact: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.82rem',
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
    fontSize: '0.82rem',
    textAlign: 'left',
  },
  historyBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.3rem',
    padding: '0.25rem 0.55rem',
    fontSize: '0.75rem',
    fontWeight: '600',
    backgroundColor: '#ffffff',
    color: '#475569',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  newProcBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
    padding: '0.4rem 0.8rem',
    fontSize: '0.78rem',
    fontWeight: '700',
    backgroundColor: '#0f172a',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  iconActionBtn: {
    background: 'none',
    border: 'none',
    color: '#64748b',
    cursor: 'pointer',
    padding: '0.25rem',
    borderRadius: '4px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
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
  modalContentSmall: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    width: '100%',
    maxWidth: '420px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  },
  modalHeader: {
    padding: '1rem 1.25rem',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#64748b',
    padding: '0.2rem',
  }
};
