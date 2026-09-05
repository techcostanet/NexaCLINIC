import React, { useState, useMemo } from 'react';
import { 
  Users, UserCheck, AlertCircle, Edit2, Search, Filter, 
  Stethoscope, Save, X, Phone, Mail, CreditCard, Shield, CheckCircle2
} from 'lucide-react';
import { formatDoctorDisplayName, sortDoctorsByName } from '../../utils/doctorFormatters';

export default function MedicalDoctorsTab({
  doctors = [],
  onSaveDoctor,
  loading = false
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'pending' | 'active' | 'inactive'

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

  // Metrics
  const metrics = useMemo(() => {
    const total = doctors.length;
    const pending = doctors.filter(d => !d.cpf || !d.susCard || !d.phone || !d.crm).length;
    const complete = total - pending;
    return { total, complete, pending };
  }, [doctors]);

  // Filtered Doctors List
  const filteredDoctors = useMemo(() => {
    const list = doctors.filter(doc => {
      const isPending = !doc.cpf || !doc.susCard || !doc.phone || !doc.crm;
      if (filterStatus === 'pending' && !isPending) return false;
      if (filterStatus === 'active' && doc.active === false) return false;
      if (filterStatus === 'inactive' && doc.active !== false) return false;

      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      const cleanName = formatDoctorDisplayName(doc.name || '');
      return (
        (cleanName && cleanName.toLowerCase().includes(term)) ||
        (doc.name && doc.name.toLowerCase().includes(term)) ||
        (doc.crm && doc.crm.toLowerCase().includes(term)) ||
        (doc.cpf && doc.cpf.toLowerCase().includes(term)) ||
        (doc.email && doc.email.toLowerCase().includes(term)) ||
        (doc.phone && doc.phone.toLowerCase().includes(term)) ||
        (doc.specialty && doc.specialty.toLowerCase().includes(term))
      );
    });
    return sortDoctorsByName(list);
  }, [doctors, searchTerm, filterStatus]);

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
      console.error('Erro ao salvar médico:', err);
    } finally {
      setSavingDoctor(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Header & Guia de Fluxo */}
      <div style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={styles.iconCircle}>
            <Stethoscope size={22} color="#0284c7" />
          </div>
          <div>
            <h3 style={styles.title}>Profissionais & Corpo Clínico</h3>
            <p style={styles.subtitle}>
              Gerencie a complementação cadastral de médicos admitidos pelo T.I. com dados sensíveis de CRM, CPF, SUS, Celular e Chaves Financeiras.
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={styles.kpiGrid}>
        <div style={styles.kpiCard}>
          <span style={styles.kpiLabel}>Total</span>
          <span style={{ ...styles.kpiValue, color: '#0f172a' }}>{metrics.total}</span>
          <span style={styles.kpiSub}>Profissionais no corpo clínico</span>
        </div>
        <div style={styles.kpiCard}>
          <span style={styles.kpiLabel}>Completos</span>
          <span style={{ ...styles.kpiValue, color: '#166534' }}>{metrics.complete}</span>
          <span style={styles.kpiSub}>Com ficha cadastral 100% preenchida</span>
        </div>
        <div style={{ ...styles.kpiCard, backgroundColor: metrics.pending > 0 ? '#fffbeb' : '#ffffff', borderColor: metrics.pending > 0 ? '#fde68a' : '#e2e8f0' }}>
          <span style={{ ...styles.kpiLabel, color: metrics.pending > 0 ? '#b45309' : '#64748b' }}>Pendentes</span>
          <span style={{ ...styles.kpiValue, color: metrics.pending > 0 ? '#b45309' : '#64748b' }}>{metrics.pending}</span>
          <span style={styles.kpiSub}>Aguardando complementação de dados</span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div style={styles.toolbar}>
        <div style={styles.searchBox}>
          <Search size={16} color="#64748b" />
          <input
            type="text"
            placeholder="Pesquisar por médico, CRM, CPF, e-mail, celular ou especialidade..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} style={styles.clearBtn}>
              <X size={14} />
            </button>
          )}
        </div>

        <div style={styles.filterGroup}>
          <button
            type="button"
            onClick={() => setFilterStatus('all')}
            style={{
              ...styles.filterBtn,
              ...(filterStatus === 'all' ? styles.filterBtnActive : {})
            }}
          >
            Todos ({doctors.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('pending')}
            style={{
              ...styles.filterBtn,
              ...(filterStatus === 'pending' ? styles.filterBtnActiveWarn : {})
            }}
          >
            Pendentes ({metrics.pending})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('active')}
            style={{
              ...styles.filterBtn,
              ...(filterStatus === 'active' ? styles.filterBtnActive : {})
            }}
          >
            Ativos
          </button>
        </div>
      </div>

      {/* Table of Doctors */}
      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th>Médico</th>
              <th>CRM</th>
              <th>Especialidade</th>
              <th>CPF</th>
              <th>SUS</th>
              <th>Celular</th>
              <th>E-mail</th>
              <th>Vínculo</th>
              <th>PIX</th>
              <th>Banco</th>
              <th>Status</th>
              <th style={{ textAlign: 'center', width: '120px' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredDoctors.length === 0 ? (
              <tr>
                <td colSpan="12" style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                  Nenhum médico encontrado com os filtros aplicados.
                </td>
              </tr>
            ) : (
              filteredDoctors.map(doc => {
                const isPending = !doc.cpf || !doc.susCard || !doc.phone || !doc.crm;
                return (
                  <tr key={doc.id || doc.uid} style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: isPending ? '#fffdf7' : '#ffffff' }}>
                    <td style={{ fontWeight: '800', color: '#0f172a' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span>{formatDoctorDisplayName(doc.name)}</span>
                        {isPending && (
                          <span style={styles.incompleteBadge} title="Clique em 'Completar' para preencher os dados pendentes">
                            Completar
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontWeight: '700', color: doc.crm ? '#0f172a' : '#b45309' }}>
                        {doc.crm || 'Pendente'}
                      </span>
                    </td>
                    <td>{doc.specialty || 'Nefrologia'}</td>
                    <td style={{ fontSize: '0.75rem', color: '#475569' }}>{doc.cpf || '-'}</td>
                    <td style={{ fontSize: '0.75rem', color: '#475569' }}>{doc.susCard || '-'}</td>
                    <td style={{ fontSize: '0.75rem', color: '#475569' }}>{doc.phone || doc.mobile || '-'}</td>
                    <td style={{ fontSize: '0.75rem', color: '#0284c7' }}>{doc.email || '-'}</td>
                    <td>
                      <span style={styles.contractBadge}>
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
                        style={{
                          ...styles.actionBtn,
                          ...(isPending ? styles.actionBtnPending : styles.actionBtnNormal)
                        }}
                        title="Completar dados cadastrais do médico"
                      >
                        <Edit2 size={13} />
                        <span>{isPending ? 'Completar' : 'Editar'}</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal: Editar / Completar Cadastro do Médico */}
      {editingDoctor && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            {/* Modal Header */}
            <div style={styles.modalHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Stethoscope size={18} color="#0284c7" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#0f172a', fontWeight: '800' }}>
                    Cadastro: {doctorForm.name || 'Médico'}
                  </h3>
                  <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                    Complementação de dados da prática clínica e honorários
                  </span>
                </div>
              </div>
              <button onClick={() => setEditingDoctor(null)} style={styles.closeBtn}>
                <X size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveDoctorSubmit} style={styles.modalBody}>
              
              {/* Bloco 1: Dados Pessoais & Contato */}
              <div style={styles.formSection}>
                <span style={styles.sectionHeaderTitle}>Pessoais</span>
                <div style={styles.formGrid2}>
                  <div>
                    <label style={styles.fieldLabel}>Médico *</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={doctorForm.name} 
                      onChange={e => setDoctorForm({ ...doctorForm, name: e.target.value })}
                      required
                      style={styles.input}
                    />
                  </div>
                  <div>
                    <label style={styles.fieldLabel}>CPF</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="000.000.000-00"
                      value={doctorForm.cpf} 
                      onChange={e => setDoctorForm({ ...doctorForm, cpf: e.target.value })}
                      style={styles.input}
                    />
                  </div>
                  <div>
                    <label style={styles.fieldLabel}>SUS</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="Número Cartão SUS / CNS"
                      value={doctorForm.susCard} 
                      onChange={e => setDoctorForm({ ...doctorForm, susCard: e.target.value })}
                      style={styles.input}
                    />
                  </div>
                  <div>
                    <label style={styles.fieldLabel}>Celular</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="(31) 98888-7777"
                      value={doctorForm.phone} 
                      onChange={e => setDoctorForm({ ...doctorForm, phone: e.target.value })}
                      style={styles.input}
                    />
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={styles.fieldLabel}>E-mail</label>
                    <input 
                      type="email" 
                      className="form-control" 
                      placeholder="medico@nexai.med.br"
                      value={doctorForm.email} 
                      onChange={e => setDoctorForm({ ...doctorForm, email: e.target.value })}
                      style={styles.input}
                    />
                  </div>
                </div>
              </div>

              {/* Bloco 2: Dados Profissionais */}
              <div style={styles.formSection}>
                <span style={styles.sectionHeaderTitle}>Profissionais</span>
                <div style={styles.formGrid2}>
                  <div>
                    <label style={styles.fieldLabel}>CRM *</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="Ex: 45892/MG"
                      value={doctorForm.crm} 
                      onChange={e => setDoctorForm({ ...doctorForm, crm: e.target.value })}
                      required
                      style={styles.input}
                    />
                  </div>
                  <div>
                    <label style={styles.fieldLabel}>Especialidade</label>
                    <select 
                      className="form-control" 
                      value={doctorForm.specialty} 
                      onChange={e => setDoctorForm({ ...doctorForm, specialty: e.target.value })}
                      style={styles.input}
                    >
                      <option value="Nefrologia">Nefrologia</option>
                      <option value="Cirurgia Vascular">Cirurgia Vascular</option>
                      <option value="Clínica Geral">Clínica Geral</option>
                      <option value="Cardiologia">Cardiologia</option>
                      <option value="Nutrologia">Nutrologia</option>
                      <option value="Outra">Outra</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Bloco 3: Dados Financeiros & Honorários */}
              <div style={styles.formSection}>
                <span style={styles.sectionHeaderTitle}>Honorários</span>
                <div style={styles.formGrid2}>
                  <div>
                    <label style={styles.fieldLabel}>Vínculo</label>
                    <select 
                      className="form-control" 
                      value={doctorForm.contractType} 
                      onChange={e => setDoctorForm({ ...doctorForm, contractType: e.target.value })}
                      style={styles.input}
                    >
                      <option value="PJ">PJ (Pessoa Jurídica)</option>
                      <option value="CLT">CLT</option>
                      <option value="Autônomo">Autônomo (RPA)</option>
                      <option value="Cooperado">Cooperado</option>
                    </select>
                  </div>
                  <div>
                    <label style={styles.fieldLabel}>Status</label>
                    <select 
                      className="form-control" 
                      value={doctorForm.active ? 'active' : 'inactive'} 
                      onChange={e => setDoctorForm({ ...doctorForm, active: e.target.value === 'active' })}
                      style={styles.input}
                    >
                      <option value="active">Ativo</option>
                      <option value="inactive">Inativo</option>
                    </select>
                  </div>
                  <div>
                    <label style={styles.fieldLabel}>PIX</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="Chave PIX (CPF, CNPJ, Email ou Aleatória)"
                      value={doctorForm.pixKey} 
                      onChange={e => setDoctorForm({ ...doctorForm, pixKey: e.target.value })}
                      style={styles.input}
                    />
                  </div>
                  <div>
                    <label style={styles.fieldLabel}>Banco</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="Ex: Banco do Brasil Ag 1234 CC 5678"
                      value={doctorForm.bank} 
                      onChange={e => setDoctorForm({ ...doctorForm, bank: e.target.value })}
                      style={styles.input}
                    />
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div style={styles.modalFooter}>
                <button type="button" onClick={() => setEditingDoctor(null)} style={styles.btnCancel}>
                  Cancelar
                </button>
                <button type="submit" disabled={savingDoctor} style={styles.btnSave}>
                  <Save size={15} /> {savingDoctor ? 'Salvando...' : 'Salvar'}
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
    gap: '1.25rem',
  },
  header: {
    borderBottom: '1px solid #e2e8f0',
    paddingBottom: '0.85rem',
  },
  iconCircle: {
    width: '42px',
    height: '42px',
    borderRadius: '10px',
    backgroundColor: '#f0f9ff',
    border: '1px solid #bae6fd',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  title: {
    fontSize: '1.2rem',
    fontWeight: '800',
    color: '#0f172a',
    margin: 0,
  },
  subtitle: {
    fontSize: '0.82rem',
    color: '#64748b',
    margin: 0,
    marginTop: '0.2rem',
  },
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
  },
  kpiCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    padding: '1rem 1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem'
  },
  kpiLabel: {
    fontSize: '0.72rem',
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: '#64748b'
  },
  kpiValue: {
    fontSize: '1.75rem',
    fontWeight: '900',
    lineHeight: 1.1
  },
  kpiSub: {
    fontSize: '0.72rem',
    color: '#94a3b8'
  },
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '0.75rem'
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    backgroundColor: '#fff',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    padding: '0.45rem 0.75rem',
    flexGrow: 1,
    maxWidth: '520px'
  },
  searchInput: {
    border: 'none',
    outline: 'none',
    fontSize: '0.82rem',
    width: '100%',
    color: '#0f172a'
  },
  clearBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#94a3b8',
    display: 'flex',
    alignItems: 'center'
  },
  filterGroup: {
    display: 'flex',
    gap: '0.35rem'
  },
  filterBtn: {
    padding: '0.4rem 0.75rem',
    borderRadius: '6px',
    border: '1px solid #e2e8f0',
    backgroundColor: '#ffffff',
    color: '#64748b',
    fontSize: '0.75rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.15s ease'
  },
  filterBtnActive: {
    backgroundColor: '#0284c7',
    color: '#ffffff',
    borderColor: '#0284c7'
  },
  filterBtnActiveWarn: {
    backgroundColor: '#d97706',
    color: '#ffffff',
    borderColor: '#d97706'
  },
  tableWrapper: {
    overflowX: 'auto',
    backgroundColor: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.82rem',
    textAlign: 'left',
  },
  incompleteBadge: {
    fontSize: '0.65rem',
    fontWeight: '800',
    backgroundColor: '#fef3c7',
    color: '#b45309',
    padding: '0.12rem 0.45rem',
    borderRadius: '4px',
    border: '1px solid #fde68a',
    display: 'inline-block'
  },
  contractBadge: {
    fontSize: '0.7rem',
    fontWeight: '800',
    padding: '0.15rem 0.45rem',
    borderRadius: '4px',
    backgroundColor: '#eff6ff',
    color: '#1e40af'
  },
  actionBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.3rem',
    padding: '0.35rem 0.75rem',
    borderRadius: '6px',
    fontSize: '0.75rem',
    fontWeight: '800',
    cursor: 'pointer',
    transition: 'all 0.15s ease'
  },
  actionBtnPending: {
    backgroundColor: '#fef3c7',
    color: '#92400e',
    border: '1px solid #fcd34d',
  },
  actionBtnNormal: {
    backgroundColor: '#f0fdfa',
    color: '#0f766e',
    border: '1px solid #99f6e4',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 99999,
    padding: '1rem'
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: '14px',
    width: '100%',
    maxWidth: '680px',
    maxHeight: '92vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
    overflow: 'hidden'
  },
  modalHeader: {
    padding: '1rem 1.25rem',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8fafc'
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#64748b'
  },
  modalBody: {
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    overflowY: 'auto'
  },
  formSection: {
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '0.85rem'
  },
  sectionHeaderTitle: {
    fontSize: '0.72rem',
    fontWeight: '800',
    color: '#0284c7',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    display: 'block',
    marginBottom: '0.5rem'
  },
  formGrid2: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '0.65rem'
  },
  fieldLabel: {
    fontSize: '0.72rem',
    fontWeight: '700',
    color: '#475569',
    marginBottom: '0.2rem',
    display: 'block'
  },
  input: {
    padding: '0.45rem 0.6rem',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    fontSize: '0.82rem',
    color: '#0f172a',
    backgroundColor: '#ffffff',
    width: '100%',
    outline: 'none'
  },
  modalFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.6rem',
    marginTop: '0.5rem'
  },
  btnCancel: {
    padding: '0.55rem 1rem',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    backgroundColor: '#ffffff',
    color: '#475569',
    fontSize: '0.82rem',
    fontWeight: '700',
    cursor: 'pointer'
  },
  btnSave: {
    padding: '0.55rem 1.25rem',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#0284c7',
    color: '#ffffff',
    fontSize: '0.82rem',
    fontWeight: '800',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem'
  }
};
