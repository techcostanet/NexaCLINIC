import React, { useState, useEffect } from 'react';
import { 
  Save, DollarSign, Users, FileSpreadsheet, Check, Edit2, 
  X, UserCheck, AlertCircle, Phone, Mail, CreditCard, Shield, 
  Stethoscope, History, Trash2, Plus, ToggleLeft, ToggleRight
} from 'lucide-react';
import { formatDoctorDisplayName, sortDoctorsByName } from '../../utils/doctorFormatters';
import { DEFAULT_MEDICAL_SETTINGS } from '../../services/firebase/medicalService';

export default function MedicalSettingsTab({
  settings = {},
  doctors = [],
  onSaveSettings,
  onSaveDoctor,
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

  // Doctor Edit Modal State
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [doctorForm, setDoctorForm] = useState({
    name: '',
    crm: '',
    specialty: 'Nefrologia',
    cpf: '',
    susCard: '',
    email: '',
    phone: '',
    contractType: 'PJ',
    pixKey: '',
    bank: '',
    active: true
  });
  const [savingDoctor, setSavingDoctor] = useState(false);

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
  };

  const handleSaveEditedProc = (e) => {
    e.preventDefault();
    if (!editingProcItem) return;
    const updated = {
      ...formData,
      procedureFees: {
        ...formData.procedureFees,
        [editingProcItem.name]: parseFloat(editingProcItem.value) || 0
      }
    };
    setFormData(updated);
    handleSave(updated);
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
    setNewProcName('');
    setNewProcValue('');
    setShowNewProcModal(false);
  };

  // Open Edit Doctor Modal
  const handleOpenEditDoctor = (doc) => {
    setEditingDoctor(doc);
    setDoctorForm({
      name: doc.name || '',
      crm: doc.crm || '',
      specialty: doc.specialty || 'Nefrologia',
      cpf: doc.cpf || '',
      susCard: doc.susCard || '',
      email: doc.email || '',
      phone: doc.phone || doc.mobile || '',
      contractType: doc.contractType || 'PJ',
      pixKey: doc.pixKey || '',
      bank: doc.bank || '',
      active: doc.active !== false
    });
  };

  const handleSaveDoctorSubmit = async (e) => {
    e.preventDefault();
    if (!editingDoctor) return;
    setSavingDoctor(true);
    try {
      const docId = editingDoctor.id || editingDoctor.uid;
      if (onSaveDoctor) {
        await onSaveDoctor(docId, doctorForm);
      }
      setEditingDoctor(null);
    } catch (err) {
      console.error(err);
    } finally {
      setSavingDoctor(false);
    }
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

      {/* Section 1: Consultas & Plantões side-by-side (Exact Print 1 Layout) */}
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

      {/* Section 2: Procedimentos List (Exact Print 2 Layout) */}
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

      {/* Section 3: Registered Doctors Table */}
      <div style={{ marginTop: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
              Profissionais ({doctors.length})
            </h4>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
              Cadastros médicos e bancários gerenciados pela Coordenação Médica para apuração de honorários.
            </span>
          </div>
        </div>

        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th>Médico</th>
                <th>CRM</th>
                <th>Especialidade</th>
                <th>CPF</th>
                <th>SUS</th>
                <th>E-mail</th>
                <th>Celular</th>
                <th>Vínculo</th>
                <th>PIX</th>
                <th>Banco</th>
                <th>Status</th>
                <th style={{ textAlign: 'center', width: '100px' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {sortDoctorsByName(doctors).map(doc => {
                const hasIncompleteData = !doc.crm || !doc.cpf || !doc.phone || !doc.susCard;
                return (
                  <tr key={doc.id || doc.uid} style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: hasIncompleteData ? '#fffdf7' : '#ffffff' }}>
                    <td style={{ fontWeight: '800', color: '#0f172a' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <span>{formatDoctorDisplayName(doc.name)}</span>
                        {hasIncompleteData && (
                          <span style={styles.incompleteBadge} title="Cadastro pendente de complementação de dados">
                            Completar
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontWeight: '700', color: doc.crm ? '#0f172a' : '#94a3b8' }}>
                        {doc.crm || 'Pendente'}
                      </span>
                    </td>
                    <td>{doc.specialty || 'Nefrologia'}</td>
                    <td style={{ fontSize: '0.75rem', color: '#475569' }}>{doc.cpf || '-'}</td>
                    <td style={{ fontSize: '0.75rem', color: '#475569' }}>{doc.susCard || '-'}</td>
                    <td style={{ fontSize: '0.75rem', color: '#0284c7' }}>{doc.email || '-'}</td>
                    <td style={{ fontSize: '0.75rem', color: '#475569' }}>{doc.phone || doc.mobile || '-'}</td>
                    <td>
                      <span style={{ fontSize: '0.7rem', fontWeight: '800', padding: '0.15rem 0.45rem', borderRadius: '4px', backgroundColor: '#eff6ff', color: '#1e40af' }}>
                        {doc.contractType || 'PJ'}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.75rem', color: '#0284c7' }}>{doc.pixKey || '-'}</td>
                    <td style={{ fontSize: '0.75rem', color: '#475569' }}>{doc.bank || '-'}</td>
                    <td>
                      <span style={{
                        fontSize: '0.7rem',
                        fontWeight: '700',
                        padding: '0.15rem 0.4rem',
                        borderRadius: '4px',
                        backgroundColor: doc.active !== false ? '#dcfce7' : '#fee2e2',
                        color: doc.active !== false ? '#166534' : '#991b1b'
                      }}>
                        {doc.active !== false ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button 
                        type="button" 
                        onClick={() => handleOpenEditDoctor(doc)}
                        style={styles.editDoctorBtn}
                        title="Editar cadastro do médico"
                      >
                        <Edit2 size={13} /> {hasIncompleteData ? 'Completar' : 'Editar'}
                      </button>
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

      {/* Modal: Editar Cadastro do Médico */}
      {editingDoctor && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Stethoscope size={20} color="#0284c7" />
                <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#0f172a', fontWeight: '800' }}>
                  Cadastro: {doctorForm.name || 'Médico'}
                </h3>
              </div>
              <button onClick={() => setEditingDoctor(null)} style={styles.closeBtn}><X size={20} /></button>
            </div>

            <form onSubmit={handleSaveDoctorSubmit} style={styles.modalBody}>
              <div style={styles.modalGrid}>
                <div className="form-group">
                  <label>Nome Completo *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={doctorForm.name}
                    onChange={e => setDoctorForm({ ...doctorForm, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>CRM *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Ex: 45892/MG"
                    value={doctorForm.crm}
                    onChange={e => setDoctorForm({ ...doctorForm, crm: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Especialidade *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={doctorForm.specialty}
                    onChange={e => setDoctorForm({ ...doctorForm, specialty: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>CPF *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="000.000.000-00"
                    value={doctorForm.cpf}
                    onChange={e => setDoctorForm({ ...doctorForm, cpf: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Cartão SUS</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Cartão Nacional de Saúde"
                    value={doctorForm.susCard}
                    onChange={e => setDoctorForm({ ...doctorForm, susCard: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>E-mail *</label>
                  <input
                    type="email"
                    className="form-control"
                    value={doctorForm.email}
                    onChange={e => setDoctorForm({ ...doctorForm, email: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Celular / WhatsApp *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="(31) 98765-4321"
                    value={doctorForm.phone}
                    onChange={e => setDoctorForm({ ...doctorForm, phone: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Tipo de Vínculo</label>
                  <select
                    className="form-control"
                    value={doctorForm.contractType}
                    onChange={e => setDoctorForm({ ...doctorForm, contractType: e.target.value })}
                  >
                    <option value="PJ">PJ (Pessoa Jurídica)</option>
                    <option value="CLT">CLT (Empregado)</option>
                    <option value="Sócio">Sócio Cotista</option>
                    <option value="RPA">RPA (Autônomo)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Chave PIX</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="CPF, CNPJ, Email ou Chave Aleatória"
                    value={doctorForm.pixKey}
                    onChange={e => setDoctorForm({ ...doctorForm, pixKey: e.target.value })}
                  />
                </div>

                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Dados Bancários (Banco / Agência / Conta)</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Ex: Banco do Brasil (001) Ag 1234-5 CC 45892-1"
                    value={doctorForm.bank}
                    onChange={e => setDoctorForm({ ...doctorForm, bank: e.target.value })}
                  />
                </div>
              </div>

              <div style={styles.modalFooter}>
                <button type="button" onClick={() => setEditingDoctor(null)} className="btn btn-secondary">
                  Cancelar
                </button>
                <button type="submit" disabled={savingDoctor} className="btn btn-primary" style={{ backgroundColor: '#0284c7' }}>
                  {savingDoctor ? 'Salvando...' : 'Salvar Alterações'}
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
  editDoctorBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.3rem',
    padding: '0.25rem 0.55rem',
    fontSize: '0.7rem',
    fontWeight: '700',
    backgroundColor: '#eff6ff',
    color: '#1d4ed8',
    border: '1px solid #bfdbfe',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  incompleteBadge: {
    fontSize: '0.65rem',
    fontWeight: '800',
    padding: '0.1rem 0.35rem',
    borderRadius: '4px',
    backgroundColor: '#fef3c7',
    color: '#b45309',
    border: '1px solid #fde68a',
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
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    width: '100%',
    maxWidth: '650px',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
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
  modalBody: {
    padding: '1.25rem',
  },
  modalGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '0.75rem',
  },
  modalFooter: {
    marginTop: '1.25rem',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.75rem',
    borderTop: '1px solid #e2e8f0',
    paddingTop: '1rem',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#64748b',
    padding: '0.2rem',
  }
};
