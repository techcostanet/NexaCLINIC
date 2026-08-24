import React, { useState } from 'react';
import { 
  Save, DollarSign, Users, FileSpreadsheet, Check, Edit2, 
  X, UserCheck, AlertCircle, Phone, Mail, CreditCard, Shield, Stethoscope
} from 'lucide-react';

export default function MedicalSettingsTab({
  settings = {},
  doctors = [],
  onSaveSettings,
  onSaveDoctor,
  loading = false
}) {
  const [formData, setFormData] = useState({
    shiftFee: settings.shiftFee || 1200.0,
    consultationFee: settings.consultationFee || 150.0,
    procedureFees: {
      'Cateter Duplo Lúmen (CDL)': settings.procedureFees?.['Cateter Duplo Lúmen (CDL)'] || 450.0,
      'Implante de Permcath': settings.procedureFees?.['Implante de Permcath'] || 850.0,
      'Biópsia Renal': settings.procedureFees?.['Biópsia Renal'] || 600.0,
      'Mapeamento de Fístula AV': settings.procedureFees?.['Mapeamento de Fístula AV'] || 300.0,
      'Curativo Especial de Acesso': settings.procedureFees?.['Curativo Especial de Acesso'] || 120.0,
      'Punção Biópsia / Aspiração': settings.procedureFees?.['Punção Biópsia / Aspiração'] || 350.0
    }
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

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

  const handleProcedureFeeChange = (procName, val) => {
    setFormData({
      ...formData,
      procedureFees: {
        ...formData.procedureFees,
        [procName]: parseFloat(val) || 0
      }
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (onSaveSettings) {
      await onSaveSettings(formData);
    }
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
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
        <div>
          <h3 style={styles.title}>Honorários</h3>
          <p style={styles.subtitle}>Configuração dos valores praticados para plantões, consultas e procedimentos.</p>
        </div>
      </div>

      <form onSubmit={handleSave}>
        <div style={styles.grid2}>
          {/* Column 1: Base Fees */}
          <div style={styles.card}>
            <h4 style={styles.cardTitle}>Base</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.75rem' }}>
              <div className="form-group">
                <label>Plantão *</label>
                <div style={styles.inputPrefix}>
                  <span>R$</span>
                  <input 
                    type="number" 
                    step="0.01"
                    className="form-control" 
                    value={formData.shiftFee}
                    onChange={e => setFormData({ ...formData, shiftFee: parseFloat(e.target.value) || 0 })}
                    required
                  />
                </div>
                <small style={{ color: '#64748b', fontSize: '0.7rem' }}>Valor padrão remunerado por turno de 4 horas.</small>
              </div>

              <div className="form-group">
                <label>Consulta *</label>
                <div style={styles.inputPrefix}>
                  <span>R$</span>
                  <input 
                    type="number" 
                    step="0.01"
                    className="form-control" 
                    value={formData.consultationFee}
                    onChange={e => setFormData({ ...formData, consultationFee: parseFloat(e.target.value) || 0 })}
                    required
                  />
                </div>
                <small style={{ color: '#64748b', fontSize: '0.7rem' }}>Valor por consulta concluída no módulo Agenda.</small>
              </div>
            </div>
          </div>

          {/* Column 2: Procedure Fees Table */}
          <div style={styles.card}>
            <h4 style={styles.cardTitle}>Procedimentos</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginTop: '0.75rem' }}>
              {Object.keys(formData.procedureFees).map(proc => (
                <div key={proc} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: '600', color: '#334155', flexGrow: 1 }}>{proc}</span>
                  <div style={{ ...styles.inputPrefix, width: '130px' }}>
                    <span>R$</span>
                    <input 
                      type="number" 
                      step="0.01"
                      className="form-control" 
                      value={formData.procedureFees[proc]}
                      onChange={e => handleProcedureFeeChange(proc, e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Save Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem', gap: '0.75rem', alignItems: 'center' }}>
          {savedSuccess && (
            <span style={{ color: '#166534', fontSize: '0.8rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Check size={16} /> Salvo com sucesso!
            </span>
          )}
          <button type="submit" disabled={loading} className="btn btn-primary" style={{ backgroundColor: '#8b5cf6', padding: '0.5rem 1.25rem' }}>
            <Save size={16} />
            <span>{loading ? 'Salvando...' : 'Salvar'}</span>
          </button>
        </div>
      </form>

      {/* Registered Doctors Table */}
      <div style={{ marginTop: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
              Profissionais ({doctors.length})
            </h4>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
              Cadastros criados pelo T.I. com dados médicos, cadastrais e bancários gerenciados pela Coordenação Médica.
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
              {doctors.map(doc => {
                const hasIncompleteData = !doc.crm || !doc.cpf || !doc.phone || !doc.susCard;
                return (
                  <tr key={doc.id || doc.uid} style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: hasIncompleteData ? '#fffdf7' : '#ffffff' }}>
                    <td style={{ fontWeight: '800', color: '#0f172a' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <span>{doc.name}</span>
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

      {/* Modal: Editar / Completar Cadastro do Médico */}
      {editingDoctor && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            {/* Modal Header */}
            <div style={styles.modalHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Stethoscope size={20} color="#0284c7" />
                <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#0f172a', fontWeight: '800' }}>
                  Cadastro: {doctorForm.name || 'Médico'}
                </h3>
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
                      placeholder="medico@nexaclinic.med.br"
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
    gap: '1.25rem',
  },
  card: {
    backgroundColor: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    padding: '1.25rem',
  },
  cardTitle: {
    fontSize: '0.95rem',
    fontWeight: '800',
    color: '#0f172a',
    margin: 0,
    borderBottom: '1px solid #f1f5f9',
    paddingBottom: '0.5rem',
  },
  inputPrefix: {
    display: 'flex',
    alignItems: 'center',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    paddingLeft: '0.5rem',
    backgroundColor: '#f8fafc',
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
  incompleteBadge: {
    fontSize: '0.65rem',
    fontWeight: '800',
    backgroundColor: '#fef3c7',
    color: '#b45309',
    padding: '0.1rem 0.4rem',
    borderRadius: '4px',
    border: '1px solid #fde68a'
  },
  editDoctorBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.25rem 0.55rem',
    borderRadius: '6px',
    backgroundColor: '#f0fdfa',
    color: '#0f766e',
    border: '1px solid #99f6e4',
    fontSize: '0.72rem',
    fontWeight: '700',
    cursor: 'pointer'
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
