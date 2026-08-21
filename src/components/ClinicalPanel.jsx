import React, { useState, useEffect } from 'react';
import { dbService } from '../firebase';
import { 
  HeartPulse, ClipboardList, Activity, Plus, Search, Edit2, 
  Trash2, User, Clock, Check, X, AlertTriangle, MessageSquare, 
  TrendingUp, Pill, Settings, Thermometer, Megaphone, Sparkles, Mail
} from 'lucide-react';

export default function ClinicalPanel() {
  const [activeTab, setActiveTab] = useState('prescriptions'); // 'prescriptions' | 'monitoring' | 'evolutions' | 'timeline'
  const [patients, setPatients] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [sessionsLogs, setSessionsLogs] = useState([]);
  const [clinicalNotes, setClinicalNotes] = useState([]);
  const [assistPosts, setAssistPosts] = useState([]);
  const [patientDispensations, setPatientDispensations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Quick assist notice form in patient chart
  const [quickAssistText, setQuickAssistText] = useState('');
  const [quickAssistCategory, setQuickAssistCategory] = useState('Internação');
  const [quickAssistUrgency, setQuickAssistUrgency] = useState('Urgente');

  // Common Selection states
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Prescription Form State
  const [showPrescForm, setShowPrescForm] = useState(false);
  const [prescForm, setPrescForm] = useState({
    type: 'HD',
    dialyzerModel: 'HF80 (Alto Fluxo)',
    sessionTime: '4.0',
    bloodFlow: '300',
    dialysateFlow: '500',
    heparinType: 'Intermitente',
    heparinDose: '5000 UI',
    bicarbonate: '32 mEq/L',
    sodium: '138 mEq/L',
    dryWeight: ''
  });

  // Session Log / Monitoring State
  const [selectedSessionPatient, setSelectedSessionPatient] = useState(null);
  const [complications, setComplications] = useState([]);
  const [sessionNotes, setSessionNotes] = useState('');
  const [hourlyRecords, setHourlyRecords] = useState([
    { hour: '1ªh', bp: '120/80', hr: '80', venousPressure: '120', arterialPressure: '-150', bloodFlowReal: '300', ufRate: '0.8', notes: 'Início estável' }
  ]);

  // Clinical Note Form State
  const [noteCategory, setNoteCategory] = useState('Médica');
  const [noteText, setNoteText] = useState('');
  const [noteAuthor, setNoteAuthor] = useState('Dr. Lucas (Nefrologista)');

  useEffect(() => {
    fetchClinicalData();
  }, []);

  const fetchClinicalData = async () => {
    setLoading(true);
    try {
      const [pList, pRecs, sLogs, cNotes, aPosts, pDisps] = await Promise.all([
        dbService.getPatients(),
        dbService.getPrescriptions(),
        dbService.getSessionsLogs(),
        dbService.getClinicalNotes(),
        dbService.getAssistPosts ? dbService.getAssistPosts() : [],
        dbService.getPatientDispensations ? dbService.getPatientDispensations() : []
      ]);

      const activePatients = pList.filter(p => p.treatmentStatus === 'Ativo');
      setPatients(activePatients);
      setPrescriptions(pRecs);
      setSessionsLogs(sLogs);
      setClinicalNotes(cNotes);
      setAssistPosts(aPosts || []);
      setPatientDispensations(pDisps || []);

      if (activePatients.length > 0 && !selectedPatientId) {
        setSelectedPatientId(activePatients[0].id);
      }
    } catch (err) {
      console.error(err);
      showAlert('Erro ao carregar dados clínicos.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 5000);
  };

  // ----------------------------------------------------
  // Prescription Handling
  // ----------------------------------------------------
  const getSelectedPatient = () => patients.find(p => p.id === selectedPatientId);
  const getPrescriptionForSelected = () => prescriptions.find(p => p.patientId === selectedPatientId);

  const handleOpenPrescForm = () => {
    const activePresc = getPrescriptionForSelected();
    const activePat = getSelectedPatient();
    
    if (activePresc) {
      setPrescForm({
        type: activePresc.type || 'HD',
        dialyzerModel: activePresc.dialyzerModel || 'HF80 (Alto Fluxo)',
        sessionTime: activePresc.sessionTime || '4.0',
        bloodFlow: activePresc.bloodFlow || '300',
        dialysateFlow: activePresc.dialysateFlow || '500',
        heparinType: activePresc.heparinType || 'Intermitente',
        heparinDose: activePresc.heparinDose || '5000 UI',
        bicarbonate: activePresc.bicarbonate || '32 mEq/L',
        sodium: activePresc.sodium || '138 mEq/L',
        dryWeight: activePresc.dryWeight || activePat?.dryWeight || ''
      });
    } else {
      setPrescForm({
        type: 'HD',
        dialyzerModel: 'HF80 (Alto Fluxo)',
        sessionTime: '4.0',
        bloodFlow: '300',
        dialysateFlow: '500',
        heparinType: 'Intermitente',
        heparinDose: '5000 UI',
        bicarbonate: '32 mEq/L',
        sodium: '138 mEq/L',
        dryWeight: activePat?.dryWeight || ''
      });
    }
    setShowPrescForm(true);
  };

  const handleSavePrescription = async (e) => {
    e.preventDefault();
    const activePat = getSelectedPatient();
    if (!activePat) return;

    setActionLoading(true);
    try {
      await dbService.savePrescription({
        patientId: activePat.id,
        patientName: activePat.name,
        ...prescForm,
        dryWeight: parseFloat(prescForm.dryWeight) || 0
      });
      showAlert('Prescrição dialítica gravada com sucesso!', 'success');
      setShowPrescForm(false);
      fetchClinicalData();
    } catch (err) {
      showAlert('Erro ao gravar prescrição.', 'danger');
    } finally {
      setActionLoading(false);
    }
  };

  // ----------------------------------------------------
  // Session Monitoring Handling
  // ----------------------------------------------------
  const handleOpenSessionLog = (patient) => {
    setSelectedSessionPatient(patient);
    
    // Check if there is already an active session log for today
    const todayDate = new Date().toISOString().substring(0, 10);
    const existing = sessionsLogs.find(l => l.patientId === patient.id && l.date === todayDate);

    if (existing) {
      setHourlyRecords(existing.hourlyData || []);
      setComplications(existing.complications || []);
      setSessionNotes(existing.notes || '');
    } else {
      setHourlyRecords([
        { hour: '1ªh', bp: '120/80', hr: '80', venousPressure: '120', arterialPressure: '-150', bloodFlowReal: '300', ufRate: '0.8', notes: 'Início estável' }
      ]);
      setComplications([]);
      setSessionNotes('');
    }
  };

  const handleAddHourRow = () => {
    const nextHour = `${hourlyRecords.length + 1}ªh`;
    const lastRow = hourlyRecords[hourlyRecords.length - 1] || {};
    setHourlyRecords([
      ...hourlyRecords,
      {
        hour: nextHour,
        bp: lastRow.bp || '120/80',
        hr: lastRow.hr || '80',
        venousPressure: lastRow.venousPressure || '120',
        arterialPressure: lastRow.arterialPressure || '-150',
        bloodFlowReal: lastRow.bloodFlowReal || '300',
        ufRate: lastRow.ufRate || '0.8',
        notes: ''
      }
    ]);
  };

  const handleHourlyRowChange = (index, field, value) => {
    const updated = [...hourlyRecords];
    updated[index][field] = value;
    setHourlyRecords(updated);
  };

  const handleRemoveHourRow = (index) => {
    setHourlyRecords(hourlyRecords.filter((_, idx) => idx !== index));
  };

  const toggleComplication = (compName) => {
    if (complications.includes(compName)) {
      setComplications(complications.filter(c => c !== compName));
    } else {
      setComplications([...complications, compName]);
    }
  };

  const handleSaveSessionLog = async () => {
    if (!selectedSessionPatient) return;
    setActionLoading(true);
    try {
      const todayDate = new Date().toISOString().substring(0, 10);
      await dbService.saveSessionLog({
        patientId: selectedSessionPatient.id,
        patientName: selectedSessionPatient.name,
        date: todayDate,
        shift: selectedSessionPatient.shift,
        room: selectedSessionPatient.room,
        chairNumber: selectedSessionPatient.chairNumber,
        hourlyData: hourlyRecords,
        complications,
        notes: sessionNotes
      });

      showAlert(`Acompanhamento de sessão para ${selectedSessionPatient.name} salvo com sucesso.`, 'success');
      setSelectedSessionPatient(null);
      fetchClinicalData();
    } catch (err) {
      showAlert('Erro ao salvar diálise.', 'danger');
    } finally {
      setActionLoading(false);
    }
  };

  // ----------------------------------------------------
  // Clinical Notes (Evolution) Handling
  // ----------------------------------------------------
  const handleSaveClinicalNote = async (e) => {
    e.preventDefault();
    const activePat = getSelectedPatient();
    if (!activePat || !noteText) return;

    setActionLoading(true);
    try {
      await dbService.createClinicalNote({
        patientId: activePat.id,
        patientName: activePat.name,
        category: noteCategory,
        author: noteAuthor,
        text: noteText
      });
      showAlert('Evolução clínica lançada!', 'success');
      setNoteText('');
      fetchClinicalData();
    } catch (err) {
      showAlert('Erro ao salvar evolução.', 'danger');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteClinicalNote = async (id) => {
    if (!window.confirm('Tem certeza de que deseja excluir esta nota de evolução?')) return;
    try {
      await dbService.deleteClinicalNote(id);
      showAlert('Evolução clínica removida.', 'success');
      fetchClinicalData();
    } catch (err) {
      showAlert('Erro ao remover nota.', 'danger');
    }
  };

  const handleSaveQuickAssistPost = async (e) => {
    e.preventDefault();
    const activePat = getSelectedPatient();
    if (!activePat || !quickAssistText.trim()) return;

    setActionLoading(true);
    try {
      await dbService.createAssistPost({
        title: `${quickAssistCategory} - ${activePat.name}`,
        message: quickAssistText.trim(),
        category: quickAssistCategory,
        urgency: quickAssistUrgency,
        patientId: activePat.id,
        patientName: activePat.name,
        room: activePat.room || 'Salão 1',
        shift: activePat.shift || '1º Turno',
        source: 'native',
        status: 'published',
        author: 'Equipe Clínica (Prontuário)',
        authorRole: 'Clínico / Assistencial',
        createdAt: new Date().toISOString()
      });

      setQuickAssistText('');
      showAlert('Comunicado assistencial salvo e publicado no feed geral!', 'success');
      fetchClinicalData();
    } catch (err) {
      showAlert('Erro ao gravar comunicado assistencial.', 'danger');
    } finally {
      setActionLoading(false);
    }
  };

  const getFilteredNotes = () => {
    return clinicalNotes
      .filter(n => n.patientId === selectedPatientId)
      .sort((a, b) => b.date.localeCompare(a.date));
  };

  const getFilteredAssistPosts = () => {
    return assistPosts
      .filter(p => p.patientId === selectedPatientId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  };

  const activePatient = getSelectedPatient();
  const activePresc = getPrescriptionForSelected();
  const activeNotes = getFilteredNotes();
  const activeAssistPosts = getFilteredAssistPosts();

  const getTodayWeekday = () => {
    const day = new Date().getDay();
    if ([1, 3, 5].includes(day)) return 'Seg/Qua/Sex';
    if ([2, 4, 6].includes(day)) return 'Ter/Qui/Sáb';
    return 'Seg/Qua/Sex';
  };
  const todayWeekday = getTodayWeekday();

  const todayPatients = patients.filter(
    p => p.dialysisFrequency?.includes(todayWeekday) || p.dialysisFrequency === 'Diário'
  );

  return (
    <div style={styles.container}>
      <div style={styles.cardHeader}>
        <div>
          <h1 style={styles.title}>NexaCLINIC - Módulo Clínico & Assistencial</h1>
          <p style={styles.subtitle}>Gestão de prescrições dialíticas, prontuário renal e monitoramento de sessões.</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={styles.tabsWrapper}>
        <button 
          onClick={() => setActiveTab('prescriptions')} 
          style={{ ...styles.tabBtn, ...(activeTab === 'prescriptions' ? styles.tabBtnActive : {}) }}
        >
          <ClipboardList size={16} /> Prescrições de Hemodiálise
        </button>
        <button 
          onClick={() => setActiveTab('monitoring')} 
          style={{ ...styles.tabBtn, ...(activeTab === 'monitoring' ? styles.tabBtnActive : {}) }}
        >
          <Activity size={16} /> Monitoramento de Sessões ({sessionsLogs.filter(l => l.date === new Date().toISOString().substring(0, 10)).length}/{todayPatients.length})
        </button>
        <button 
          onClick={() => setActiveTab('evolutions')} 
          style={{ ...styles.tabBtn, ...(activeTab === 'evolutions' ? styles.tabBtnActive : {}) }}
        >
          <MessageSquare size={16} /> Evoluções Multidisciplinares
        </button>
        <button 
          onClick={() => setActiveTab('dispensations')} 
          style={{ ...styles.tabBtn, ...(activeTab === 'dispensations' ? styles.tabBtnActive : {}) }}
        >
          <Pill size={16} /> Medicamentos & Insumos ({(patientDispensations || []).filter(d => d.patientId === selectedPatientId).length})
        </button>
        <button 
          onClick={() => setActiveTab('timeline')} 
          style={{ 
            ...styles.tabBtn, 
            ...(activeTab === 'timeline' ? styles.tabBtnActive : {}),
            backgroundColor: activeTab === 'timeline' ? '#ec4899' : undefined,
            color: activeTab === 'timeline' ? '#fff' : undefined,
            borderColor: activeTab === 'timeline' ? '#ec4899' : undefined
          }}
        >
          <Megaphone size={16} /> Feed & Comunicados ({activeAssistPosts.length})
        </button>
      </div>

      {/* Message feedback */}
      {message.text && (
        <div style={{ ...styles.alert, backgroundColor: `var(--${message.type}-light)`, border: `1px solid var(--${message.type}-color)` }}>
          <AlertTriangle size={18} color={`var(--${message.type}-color)`} />
          <span style={{ color: `var(--${message.type}-color)`, fontWeight: '600' }}>{message.text}</span>
        </div>
      )}

      {loading ? (
        <div style={styles.loadingBox}>Carregando dados assistenciais...</div>
      ) : (
        <>
          {/* TAB 1, 3, 4 & 5: Require Patient Selector */}
          {(activeTab === 'prescriptions' || activeTab === 'evolutions' || activeTab === 'timeline' || activeTab === 'dispensations') && (
            <div style={styles.selectionLayout}>
              {/* Left Column: Select Patient */}
              <div style={styles.sidebar}>
                <div style={styles.sidebarSearch}>
                  <Search size={16} style={styles.sidebarSearchIcon} />
                  <input 
                    type="text" 
                    placeholder="Filtrar pacientes..." 
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    style={styles.sidebarSearchInput}
                  />
                </div>
                <div style={styles.sidebarList}>
                  {patients
                    .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map(p => {
                      const pCount = assistPosts.filter(ap => ap.patientId === p.id).length;
                      return (
                        <div 
                          key={p.id}
                          onClick={() => setSelectedPatientId(p.id)}
                          style={{
                            ...styles.patientItem,
                            ...(p.id === selectedPatientId ? styles.patientItemActive : {})
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={styles.sidebarPatName}>{p.name}</span>
                            {pCount > 0 && (
                              <span style={{ fontSize: '0.65rem', backgroundColor: '#fdf2f8', color: '#db2777', padding: '0.1rem 0.35rem', borderRadius: '8px', fontWeight: '700', border: '1px solid #fbcfe8' }}>
                                {pCount}
                              </span>
                            )}
                          </div>
                          <div style={styles.sidebarPatSub}>
                            <span>{p.room || 'Sem salão'}</span> • <span>{p.shift}</span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Right Column: Content */}
              <div style={styles.mainContentArea}>
                {activePatient ? (
                  activeTab === 'prescriptions' ? (
                    /* SUB-TAB: PRESCRIPTIONS */
                    <div style={styles.contentCard}>
                      <div style={styles.contentHeader}>
                        <div style={styles.patientBanner}>
                          <User size={24} color="#8b5cf6" />
                          <div>
                            <h2>{activePatient.name}</h2>
                            <p>CPF: {activePatient.cpf} | Acesso atual: <strong>{activePatient.accessType}</strong></p>
                          </div>
                        </div>
                        <button onClick={handleOpenPrescForm} style={styles.primaryActionBtn}>
                          <Edit2 size={14} /> {activePresc ? 'Alterar Prescrição' : 'Nova Prescrição'}
                        </button>
                      </div>

                      {showPrescForm ? (
                        /* Prescription Intake/Edit Form */
                        <form onSubmit={handleSavePrescription} style={styles.prescForm}>
                          <div style={styles.formGrid}>
                            <div className="form-group">
                              <label>Tipo de Terapia *</label>
                              <select 
                                className="form-control" value={prescForm.type}
                                onChange={e => setPrescForm({ ...prescForm, type: e.target.value })}
                              >
                                <option value="HD">Hemodiálise Convencional (HD)</option>
                                <option value="HDF">Hemodiafiltração (HDF Online)</option>
                                <option value="DP">Diálise Peritoneal (DP)</option>
                              </select>
                            </div>
                            <div className="form-group">
                              <label>Modelo do Dialisador (Capilar) *</label>
                              <input 
                                type="text" className="form-control" placeholder="Ex: HF80 (Alto Fluxo)"
                                value={prescForm.dialyzerModel} onChange={e => setPrescForm({ ...prescForm, dialyzerModel: e.target.value })} required
                              />
                            </div>
                            <div className="form-group">
                              <label>Duração da Sessão (Horas) *</label>
                              <select 
                                className="form-control" value={prescForm.sessionTime}
                                onChange={e => setPrescForm({ ...prescForm, sessionTime: e.target.value })}
                              >
                                <option value="4.0">4.0 Horas</option>
                                <option value="3.5">3.5 Horas</option>
                                <option value="3.0">3.0 Horas</option>
                                <option value="4.5">4.5 Horas</option>
                              </select>
                            </div>
                            <div className="form-group">
                              <label>Fluxo de Sangue Sugerido (QB - mL/min) *</label>
                              <input 
                                type="number" className="form-control" placeholder="300"
                                value={prescForm.bloodFlow} onChange={e => setPrescForm({ ...prescForm, bloodFlow: e.target.value })} required
                              />
                            </div>
                            <div className="form-group">
                              <label>Fluxo de Dialisato (QD - mL/min) *</label>
                              <select 
                                className="form-control" value={prescForm.dialysateFlow}
                                onChange={e => setPrescForm({ ...prescForm, dialysateFlow: e.target.value })}
                              >
                                <option value="500">500 mL/min</option>
                                <option value="600">600 mL/min</option>
                                <option value="800">800 mL/min</option>
                              </select>
                            </div>
                            <div className="form-group">
                              <label>Heparinização *</label>
                              <select 
                                className="form-control" value={prescForm.heparinType}
                                onChange={e => setPrescForm({ ...prescForm, heparinType: e.target.value })}
                              >
                                <option value="Intermitente">Intermitente</option>
                                <option value="Contínua">Bomba Contínua</option>
                                <option value="Sem Heparina">Sem Heparina (Lavagem SF 0.9%)</option>
                              </select>
                            </div>
                            <div className="form-group">
                              <label>Dose Total Heparina (UI) *</label>
                              <input 
                                type="text" className="form-control" placeholder="Ex: 5000 UI"
                                value={prescForm.heparinDose} onChange={e => setPrescForm({ ...prescForm, heparinDose: e.target.value })} required
                              />
                            </div>
                            <div className="form-group">
                              <label>Bicarbonato *</label>
                              <input 
                                type="text" className="form-control" placeholder="Ex: 32 mEq/L"
                                value={prescForm.bicarbonate} onChange={e => setPrescForm({ ...prescForm, bicarbonate: e.target.value })} required
                              />
                            </div>
                            <div className="form-group">
                              <label>Sódio Prescrito *</label>
                              <input 
                                type="text" className="form-control" placeholder="Ex: 138 mEq/L"
                                value={prescForm.sodium} onChange={e => setPrescForm({ ...prescForm, sodium: e.target.value })} required
                              />
                            </div>
                            <div className="form-group">
                              <label>Peso Seco Alvo (kg) *</label>
                              <input 
                                type="number" step="0.1" className="form-control" placeholder="Ex: 68.5"
                                value={prescForm.dryWeight} onChange={e => setPrescForm({ ...prescForm, dryWeight: e.target.value })} required
                              />
                            </div>
                          </div>
                          <div style={styles.formActions}>
                            <button type="button" onClick={() => setShowPrescForm(false)} className="btn btn-secondary">
                              Cancelar
                            </button>
                            <button type="submit" disabled={actionLoading} className="btn btn-primary">
                              {actionLoading ? 'Gravando...' : 'Salvar Prescrição'}
                            </button>
                          </div>
                        </form>
                      ) : activePresc ? (
                        /* Prescription Details Summary View */
                        <div style={styles.prescView}>
                          <div style={styles.detailsGrid}>
                            <div style={styles.detailItem}>
                              <span style={styles.detailLabel}>Modalidade</span>
                              <span style={styles.detailValue}>{activePresc.type}</span>
                            </div>
                            <div style={styles.detailItem}>
                              <span style={styles.detailLabel}>Capilar (Dialisador)</span>
                              <span style={styles.detailValue}>{activePresc.dialyzerModel}</span>
                            </div>
                            <div style={styles.detailItem}>
                              <span style={styles.detailLabel}>Tempo de Sessão</span>
                              <span style={styles.detailValue}>{activePresc.sessionTime} Horas</span>
                            </div>
                            <div style={styles.detailItem}>
                              <span style={styles.detailLabel}>Fluxo Sangue (QB)</span>
                              <span style={styles.detailValue}>{activePresc.bloodFlow} mL/min</span>
                            </div>
                            <div style={styles.detailItem}>
                              <span style={styles.detailLabel}>Fluxo Dialisato (QD)</span>
                              <span style={styles.detailValue}>{activePresc.dialysateFlow} mL/min</span>
                            </div>
                            <div style={styles.detailItem}>
                              <span style={styles.detailLabel}>Heparina</span>
                              <span style={styles.detailValue}>{activePresc.heparinType} ({activePresc.heparinDose})</span>
                            </div>
                            <div style={styles.detailItem}>
                              <span style={styles.detailLabel}>Bicarbonato</span>
                              <span style={styles.detailValue}>{activePresc.bicarbonate}</span>
                            </div>
                            <div style={styles.detailItem}>
                              <span style={styles.detailLabel}>Sódio</span>
                              <span style={styles.detailValue}>{activePresc.sodium}</span>
                            </div>
                            <div style={styles.detailItem}>
                              <span style={styles.detailLabel}>Peso Seco Alvo</span>
                              <span style={styles.detailValue}>{activePresc.dryWeight} kg</span>
                            </div>
                          </div>

                          <div style={styles.prescFooter}>
                            <span>Última atualização da prescrição: {new Date(activePresc.updatedAt).toLocaleDateString('pt-BR')}</span>
                          </div>
                        </div>
                      ) : (
                        <div style={styles.noDataState}>
                          <p>Nenhuma prescrição cadastrada para este paciente.</p>
                          <button onClick={handleOpenPrescForm} className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
                            Cadastrar Prescrição Agora
                          </button>
                        </div>
                      )}
                    </div>
                  ) : activeTab === 'evolutions' ? (
                    /* SUB-TAB: EVOLUTIONS */
                    <div style={styles.contentCard}>
                      <h2>Evolução Multiprofissional</h2>
                      
                      {/* Evolution Form */}
                      <form onSubmit={handleSaveClinicalNote} style={styles.noteForm}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                          <div className="form-group">
                            <label>Categoria Profissional</label>
                            <select 
                              className="form-control" value={noteCategory}
                              onChange={e => setNoteCategory(e.target.value)}
                            >
                              <option value="Médica">Médica</option>
                              <option value="Enfermagem">Enfermagem</option>
                              <option value="Nutrição">Nutrição</option>
                              <option value="Psicologia">Psicologia</option>
                              <option value="Serviço Social">Serviço Social</option>
                            </select>
                          </div>
                          <div className="form-group">
                            <label>Autor / Profissional Responsável</label>
                            <input 
                              type="text" className="form-control" value={noteAuthor}
                              onChange={e => setNoteAuthor(e.target.value)} required
                            />
                          </div>
                        </div>
                        <div className="form-group">
                          <label>Texto da Evolução Clínica *</label>
                          <textarea 
                            className="form-control" rows="4" placeholder="Descreva a evolução do paciente, parâmetros laboratoriais, queixas ou recomendações terapêuticas..."
                            value={noteText} onChange={e => setNoteText(e.target.value)} required
                            style={{ resize: 'vertical' }}
                          />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                          <button type="submit" disabled={actionLoading} className="btn btn-primary" style={{ backgroundColor: '#8b5cf6' }}>
                            {actionLoading ? 'Salvando...' : 'Gravar Evolução'}
                          </button>
                        </div>
                      </form>

                      {/* Notes Timeline */}
                      <div style={styles.timeline}>
                        <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>Histórico Clínico</h3>
                        {activeNotes.length === 0 ? (
                          <div style={styles.noNotes}>Sem notas de evolução registradas para este paciente.</div>
                        ) : (
                          activeNotes.map(note => (
                            <div key={note.id} style={styles.timelineItem}>
                              <div style={styles.timelineBadge}>
                                {note.category.substring(0, 3).toUpperCase()}
                              </div>
                              <div style={styles.timelineContent}>
                                <div style={styles.timelineHeader}>
                                  <span style={styles.timelineAuthor}>{note.author} ({note.category})</span>
                                  <span style={styles.timelineDate}>{new Date(note.date).toLocaleDateString('pt-BR')}</span>
                                </div>
                                <p style={styles.timelineText}>{note.text}</p>
                                <button onClick={() => handleDeleteClinicalNote(note.id)} style={styles.deleteNoteBtn}>
                                  Excluir nota
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  ) : activeTab === 'dispensations' ? (
                    /* SUB-TAB: DISPENSATIONS & TRACEABILITY */
                    <div style={styles.contentCard}>
                      <div style={styles.contentHeader}>
                        <div style={styles.patientBanner}>
                          <Pill size={24} color="#0284c7" />
                          <div>
                            <h2>Medicamentos & Insumos Dispensados: {activePatient.name}</h2>
                            <p>Rastreabilidade completa de itens clínicos, doses, números de lote, datas de validade e profissionais responsáveis.</p>
                          </div>
                        </div>
                      </div>

                      {(() => {
                        const activeDisps = (patientDispensations || []).filter(d => 
                          d.patientId === activePatient.id || 
                          (d.patientName && activePatient.name && d.patientName.toLowerCase() === activePatient.name.toLowerCase())
                        );

                        return (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {/* Quick Patient Dispensation Stats */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem' }}>
                              <div style={{ padding: '0.75rem', backgroundColor: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '8px' }}>
                                <span style={{ fontSize: '0.7rem', color: '#0369a1', fontWeight: '700', textTransform: 'uppercase' }}>Total de Baixas</span>
                                <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0369a1' }}>{activeDisps.length}</div>
                              </div>
                              <div style={{ padding: '0.75rem', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px' }}>
                                <span style={{ fontSize: '0.7rem', color: '#15803d', fontWeight: '700', textTransform: 'uppercase' }}>Itens Distintos</span>
                                <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#15803d' }}>
                                  {new Set(activeDisps.map(d => d.itemName)).size}
                                </div>
                              </div>
                              <div style={{ padding: '0.75rem', backgroundColor: '#faf5ff', border: '1px solid #e9d5ff', borderRadius: '8px' }}>
                                <span style={{ fontSize: '0.7rem', color: '#7e22ce', fontWeight: '700', textTransform: 'uppercase' }}>Última Dispensação</span>
                                <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#7e22ce', marginTop: '0.2rem' }}>
                                  {activeDisps.length > 0 && activeDisps[0].date ? new Date(activeDisps[0].date).toLocaleDateString('pt-BR') : 'Sem registros'}
                                </div>
                              </div>
                            </div>

                            {/* Table of Dispensations */}
                            <div style={styles.tableWrapper}>
                              <table style={styles.table}>
                                <thead>
                                  <tr>
                                    <th>Data / Hora</th>
                                    <th>Medicamento / Insumo</th>
                                    <th>Quantidade</th>
                                    <th>Lote</th>
                                    <th>Validade</th>
                                    <th>Solicitante</th>
                                    <th>Dispensado Por</th>
                                    <th>Requisição</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {activeDisps.length === 0 ? (
                                    <tr>
                                      <td colSpan="8" style={styles.noDataCell}>Nenhum medicamento ou insumo dispensado para este paciente até o momento.</td>
                                    </tr>
                                  ) : (
                                    activeDisps.map((disp, dIdx) => (
                                      <tr key={disp.id || dIdx}>
                                        <td>
                                          <div>{disp.date ? new Date(disp.date).toLocaleDateString('pt-BR') : '-'}</div>
                                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                            {disp.date ? new Date(disp.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : ''}
                                          </div>
                                        </td>
                                        <td style={{ fontWeight: '600' }}>{disp.itemName}</td>
                                        <td style={{ fontWeight: '700', color: '#047857' }}>
                                          {disp.quantity} {disp.unit || 'un'}
                                        </td>
                                        <td style={{ fontWeight: '700', color: 'var(--primary-color)' }}>
                                          {disp.batchNumber || '-'}
                                        </td>
                                        <td>
                                          {disp.expiryDate ? new Date(disp.expiryDate).toLocaleDateString('pt-BR') : '-'}
                                        </td>
                                        <td>{disp.requestedBy || 'Enfermagem'}</td>
                                        <td>{disp.fulfilledBy || 'Farmácia Central'}</td>
                                        <td style={{ fontWeight: '600', fontSize: '0.8rem' }}>{disp.requisitionCode || '-'}</td>
                                      </tr>
                                    ))
                                  )}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  ) : (
                    /* SUB-TAB 4: LINHA DO TEMPO ASSISTENCIAL (NexaASSIST) */
                    <div style={styles.contentCard}>
                      <div style={styles.contentHeader}>
                        <div style={styles.patientBanner}>
                          <Megaphone size={24} color="#ec4899" />
                          <div>
                            <h2>Linha do Tempo Assistencial: {activePatient.name}</h2>
                            <p>Comunicados rápidos, altas, internações e intercorrências registradas no plantão.</p>
                          </div>
                        </div>
                      </div>

                      {/* Formulário Rápido de Comunicado Assistencial */}
                      <form onSubmit={handleSaveQuickAssistPost} style={{ padding: '1.25rem', borderRadius: '12px', borderLeft: '4px solid #ec4899', backgroundColor: '#fdf2f8', marginBottom: '1.5rem', border: '1px solid #fbcfe8' }}>
                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                          <div style={{ flex: 1, minWidth: '160px' }}>
                            <label style={{ fontSize: '0.8rem', fontWeight: '600', display: 'block', marginBottom: '0.25rem' }}>Tipo de Notícia / Evento</label>
                            <select 
                              className="form-control" 
                              value={quickAssistCategory} 
                              onChange={e => {
                                setQuickAssistCategory(e.target.value);
                                setQuickAssistUrgency(e.target.value === 'Internação' || e.target.value === 'Intercorrência' || e.target.value === 'Óbito' ? 'Urgente' : 'Informativo');
                              }}
                            >
                              <option value="Internação">🔴 Internação Hospitalar</option>
                              <option value="Alta">🟢 Alta / Retorno</option>
                              <option value="Transferência">🔵 Transferência</option>
                              <option value="Intercorrência">🟡 Intercorrência no Plantão</option>
                              <option value="Nutrição">🥗 Nutrição / Dieta</option>
                              <option value="Psicologia">🧠 Psicologia</option>
                              <option value="Serviço Social">🤝 Serviço Social / Transporte</option>
                              <option value="Óbito">⚫ Óbito</option>
                              <option value="Geral">ℹ️ Aviso Geral</option>
                            </select>
                          </div>
                          <div style={{ flex: 1, minWidth: '140px' }}>
                            <label style={{ fontSize: '0.8rem', fontWeight: '600', display: 'block', marginBottom: '0.25rem' }}>Nível de Urgência</label>
                            <select 
                              className="form-control" 
                              value={quickAssistUrgency} 
                              onChange={e => setQuickAssistUrgency(e.target.value)}
                            >
                              <option value="Informativo">ℹ️ Informativo</option>
                              <option value="Atenção">🟡 Atenção</option>
                              <option value="Urgente">🔴 Urgente</option>
                            </select>
                          </div>
                        </div>
                        <div className="form-group">
                          <textarea 
                            rows={3} 
                            className="form-control" 
                            placeholder={`Descreva a ocorrência sobre ${activePatient.name} (ex: internado no Hospital X, alta confirmada, etc)...`}
                            value={quickAssistText}
                            onChange={e => setQuickAssistText(e.target.value)}
                            required
                            style={{ resize: 'vertical', backgroundColor: '#fff' }}
                          />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                          <button type="submit" disabled={actionLoading} className="btn btn-primary" style={{ backgroundColor: '#ec4899', borderColor: '#db2777' }}>
                            {actionLoading ? 'Publicando...' : 'Publicar Comunicado'}
                          </button>
                        </div>
                      </form>

                      {/* Lista Cronológica do Paciente */}
                      <div style={styles.timeline}>
                        <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
                          Ocorrências Registradas ({activeAssistPosts.length})
                        </h3>
                        {activeAssistPosts.length === 0 ? (
                          <div style={styles.noNotes}>
                            Nenhum comunicado assistencial ou internação registrada para {activePatient.name}.
                          </div>
                        ) : (
                          activeAssistPosts.map(post => {
                            const isUrgent = post.urgency === 'Urgente';
                            const badgeColor = post.category === 'Internação' ? '#ef4444' : post.category === 'Alta' ? '#10b981' : post.category === 'Intercorrência' ? '#f59e0b' : '#8b5cf6';
                            return (
                              <div key={post.id} style={{ ...styles.timelineItem, borderLeft: `4px solid ${badgeColor}` }}>
                                <div style={{ ...styles.timelineBadge, backgroundColor: badgeColor, color: '#fff' }}>
                                  {post.category.substring(0, 3).toUpperCase()}
                                </div>
                                <div style={styles.timelineContent}>
                                  <div style={styles.timelineHeader}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                                      <span style={styles.timelineAuthor}>{post.author}</span>
                                      <span style={{ fontSize: '0.75rem', backgroundColor: '#f3f4f6', padding: '0.15rem 0.4rem', borderRadius: '4px', color: '#4b5563' }}>
                                        {post.source === 'email' ? '✉️ Via E-mail' : '💻 NexaCLINIC'}
                                      </span>
                                      {isUrgent && (
                                        <span style={{ fontSize: '0.7rem', backgroundColor: '#fee2e2', color: '#b91c1c', padding: '0.15rem 0.4rem', borderRadius: '4px', fontWeight: '700' }}>
                                          URGENTE
                                        </span>
                                      )}
                                    </div>
                                    <span style={styles.timelineDate}>
                                      {new Date(post.createdAt).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                  </div>
                                  <p style={{ ...styles.timelineText, whiteSpace: 'pre-line' }}>{post.message}</p>
                                  {Array.isArray(post.readBy) && post.readBy.length > 0 && (
                                    <div style={{ fontSize: '0.75rem', color: '#059669', marginTop: '0.5rem', fontWeight: '500' }}>
                                      ✓ {post.readBy.length} {post.readBy.length === 1 ? 'profissional deu ciente' : 'profissionais deram ciente'}
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  )
                ) : (
                  <div style={styles.noSelectionBox}>Selecione um paciente na barra lateral para carregar a ficha clínica.</div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: Session logs list */}
          {activeTab === 'monitoring' && (
            <div style={styles.monitoringLayout}>
              {selectedSessionPatient ? (
                /* Detail/Recording session view */
                <div style={styles.contentCard}>
                  <div style={styles.contentHeader}>
                    <div style={styles.patientBanner}>
                      <Activity size={24} color="#8b5cf6" />
                      <div>
                        <h2>Acompanhamento Intra-diálise: {selectedSessionPatient.name}</h2>
                        <p>Sala: {selectedSessionPatient.room} | Turno: {selectedSessionPatient.shift} | Poltrona: #{selectedSessionPatient.chairNumber}</p>
                      </div>
                    </div>
                    <button onClick={() => setSelectedSessionPatient(null)} style={styles.backBtn}>
                      Voltar para Lista
                    </button>
                  </div>

                  {/* Hourly Parameters Log Table */}
                  <div style={{ marginTop: '1.5rem' }}>
                    <h3 style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>Registros de Parâmetros Horários</h3>
                    <div style={styles.tableWrapper}>
                      <table style={styles.table}>
                        <thead>
                          <tr>
                            <th>Hora</th>
                            <th>P.A. (mmHg)</th>
                            <th>F.C. (bpm)</th>
                            <th>P. Venosa</th>
                            <th>P. Arterial</th>
                            <th>Fluxo Sangue Real</th>
                            <th>UF (L/h)</th>
                            <th>Observações</th>
                            <th>Ações</th>
                          </tr>
                        </thead>
                        <tbody>
                          {hourlyRecords.map((row, index) => (
                            <tr key={index}>
                              <td>
                                <input 
                                  type="text" className="form-control text-center" style={{ width: '60px' }}
                                  value={row.hour} onChange={e => handleHourlyRowChange(index, 'hour', e.target.value)}
                                />
                              </td>
                              <td>
                                <input 
                                  type="text" className="form-control" style={{ width: '90px' }} placeholder="120/80"
                                  value={row.bp} onChange={e => handleHourlyRowChange(index, 'bp', e.target.value)}
                                />
                              </td>
                              <td>
                                <input 
                                  type="number" className="form-control" style={{ width: '70px' }} placeholder="80"
                                  value={row.hr} onChange={e => handleHourlyRowChange(index, 'hr', e.target.value)}
                                />
                              </td>
                              <td>
                                <input 
                                  type="number" className="form-control" style={{ width: '80px' }} placeholder="120"
                                  value={row.venousPressure} onChange={e => handleHourlyRowChange(index, 'venousPressure', e.target.value)}
                                />
                              </td>
                              <td>
                                <input 
                                  type="number" className="form-control" style={{ width: '80px' }} placeholder="-150"
                                  value={row.arterialPressure} onChange={e => handleHourlyRowChange(index, 'arterialPressure', e.target.value)}
                                />
                              </td>
                              <td>
                                <input 
                                  type="number" className="form-control" style={{ width: '85px' }} placeholder="300"
                                  value={row.bloodFlowReal} onChange={e => handleHourlyRowChange(index, 'bloodFlowReal', e.target.value)}
                                />
                              </td>
                              <td>
                                <input 
                                  type="number" step="0.1" className="form-control" style={{ width: '70px' }} placeholder="0.8"
                                  value={row.ufRate} onChange={e => handleHourlyRowChange(index, 'ufRate', e.target.value)}
                                />
                              </td>
                              <td>
                                <input 
                                  type="text" className="form-control" placeholder="Sem intercorrências..."
                                  value={row.notes} onChange={e => handleHourlyRowChange(index, 'notes', e.target.value)}
                                />
                              </td>
                              <td>
                                <button onClick={() => handleRemoveHourRow(index)} style={styles.actionDeleteBtn}>
                                  <X size={14} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <button onClick={handleAddHourRow} style={styles.addHourBtn}>
                      <Plus size={14} /> Adicionar Próxima Hora
                    </button>
                  </div>

                  {/* Complications Selector */}
                  <div style={styles.complicationsSection}>
                    <h3 style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>Intercorrências / Sintomas Clínicos</h3>
                    <div style={styles.complicationsGrid}>
                      {['Nenhuma', 'Hipotensão', 'Hipertensão', 'Câimbras', 'Cefaleia', 'Náuseas / Vômitos', 'Calafrios / Febre', 'Dor precordial', 'Problemas com Acesso (fluxo baixo)'].map(comp => (
                        <label key={comp} style={styles.compLabel}>
                          <input 
                            type="checkbox" 
                            checked={complications.includes(comp)} 
                            onChange={() => toggleComplication(comp)}
                          />
                          <span>{comp}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Doctor/Nurse overall comments */}
                  <div className="form-group" style={{ marginTop: '1.5rem' }}>
                    <label>Evolução Final da Diálise / Condutas</label>
                    <textarea 
                      className="form-control" rows="3" placeholder="Insira o resumo do encerramento da diálise, peso final retirado e intercorrências médicas se houver..."
                      value={sessionNotes} onChange={e => setSessionNotes(e.target.value)}
                    />
                  </div>

                  <div style={styles.formFooter}>
                    <button onClick={() => setSelectedSessionPatient(null)} className="btn btn-secondary">Cancelar</button>
                    <button onClick={handleSaveSessionLog} disabled={actionLoading} className="btn btn-primary" style={{ backgroundColor: '#8b5cf6' }}>
                      {actionLoading ? 'Salvando Sessão...' : 'Gravar Acompanhamento'}
                    </button>
                  </div>
                </div>
              ) : (
                /* Patient List with session statuses */
                <div style={styles.tableWrapper}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th>Nome Completo</th>
                        <th>CPF</th>
                        <th>Sala / Turno</th>
                        <th>Poltrona</th>
                        <th>Acesso</th>
                        <th>Status Diálise (Hoje)</th>
                        <th>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {todayPatients.length === 0 ? (
                        <tr>
                          <td colSpan="7" style={styles.noDataCell}>Nenhum paciente agendado para hemodiálise hoje.</td>
                        </tr>
                      ) : (
                        todayPatients.map(pat => {
                          const todayDate = new Date().toISOString().substring(0, 10);
                          const log = sessionsLogs.find(l => l.patientId === pat.id && l.date === todayDate);

                          return (
                            <tr key={pat.id}>
                              <td style={{ fontWeight: '600' }}>{pat.name}</td>
                              <td>{pat.cpf}</td>
                              <td>{pat.room} • {pat.shift}</td>
                              <td style={{ fontWeight: '700' }}>#{pat.chairNumber}</td>
                              <td>{pat.accessType}</td>
                              <td>
                                {log ? (
                                  <span style={styles.badgeActive}>
                                    Acompanhado ({log.hourlyData?.length || 0}h) {log.complications?.length > 0 && '⚠️'}
                                  </span>
                                ) : (
                                  <span style={styles.badgeIdle}>Aguardando Registro</span>
                                )}
                              </td>
                              <td>
                                <button onClick={() => handleOpenSessionLog(pat)} style={styles.monitorBtn}>
                                  {log ? 'Ver / Editar Sessão' : 'Registrar Sessão'}
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '1rem',
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
    marginBottom: '0.25rem',
  },
  subtitle: {
    fontSize: '0.875rem',
    color: 'var(--text-secondary)',
  },
  tabsWrapper: {
    display: 'flex',
    gap: '0.5rem',
    borderBottom: '2px solid var(--border-color)',
    paddingBottom: '2px',
  },
  tabBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: 'none',
    border: 'none',
    padding: '0.75rem 1.25rem',
    fontSize: '0.9rem',
    fontWeight: '600',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    borderBottom: '2px solid transparent',
    marginBottom: '-2px',
    transition: 'all 0.15s ease',
  },
  tabBtnActive: {
    color: '#8b5cf6',
    borderBottomColor: '#8b5cf6',
  },
  alert: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '1rem',
    borderRadius: 'var(--border-radius-sm)',
    fontSize: '0.9rem',
  },
  loadingBox: {
    textAlign: 'center',
    padding: '3rem',
    color: 'var(--text-muted)',
    fontSize: '1rem',
  },
  selectionLayout: {
    display: 'grid',
    gridTemplateColumns: '260px 1fr',
    gap: '1.5rem',
    minHeight: '450px',
  },
  sidebar: {
    backgroundColor: '#fff',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--border-radius-md)',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: 'var(--shadow-sm)',
    overflow: 'hidden',
  },
  sidebarSearch: {
    position: 'relative',
    padding: '0.75rem',
    borderBottom: '1px solid var(--border-color)',
    display: 'flex',
    alignItems: 'center',
  },
  sidebarSearchIcon: {
    position: 'absolute',
    left: '1.25rem',
    color: 'var(--text-muted)',
  },
  sidebarSearchInput: {
    width: '100%',
    padding: '0.5rem 0.5rem 0.5rem 2rem',
    fontSize: '0.85rem',
    borderRadius: 'var(--border-radius-sm)',
    border: '1px solid var(--border-color)',
  },
  sidebarList: {
    flexGrow: 1,
    overflowY: 'auto',
    maxHeight: '400px',
  },
  patientItem: {
    padding: '0.75rem 1rem',
    borderBottom: '1px solid var(--border-color)',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  patientItemActive: {
    backgroundColor: 'rgba(139, 92, 246, 0.05)',
    borderLeft: '4px solid #8b5cf6',
    paddingLeft: '0.75rem',
  },
  sidebarPatName: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: 'var(--text-primary)',
    display: 'block',
  },
  sidebarPatSub: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
  },
  mainContentArea: {
    flexGrow: 1,
  },
  contentCard: {
    backgroundColor: '#fff',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--border-radius-md)',
    padding: '1.5rem',
    boxShadow: 'var(--shadow-sm)',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  contentHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '1rem',
    gap: '1rem',
  },
  patientBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  primaryActionBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 1rem',
    fontSize: '0.8rem',
    fontWeight: '600',
    backgroundColor: '#8b5cf6',
    color: '#fff',
    border: 'none',
    borderRadius: 'var(--border-radius-sm)',
    cursor: 'pointer',
    transition: 'filter 0.15s ease',
  },
  noSelectionBox: {
    backgroundColor: '#f8fafc',
    border: '1px dashed var(--border-color)',
    borderRadius: 'var(--border-radius-md)',
    padding: '4rem 2rem',
    textAlign: 'center',
    color: 'var(--text-muted)',
  },
  noDataBox: {
    textAlign: 'center',
    padding: '3rem 2rem',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '1rem',
  },
  formFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.5rem',
    borderTop: '1px solid var(--border-color)',
    paddingTop: '1rem',
  },
  prescDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  prescGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
  },
  detailBox: {
    backgroundColor: '#f8fafc',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--border-radius-sm)',
    padding: '0.75rem 1rem',
    display: 'flex',
    flexDirection: 'column',
  },
  detailLabel: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    fontWeight: '600',
    marginBottom: '0.25rem',
  },
  detailValue: {
    fontSize: '0.95rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
  },
  prescMetaBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.8rem',
    color: 'var(--success-color)',
    backgroundColor: 'var(--success-light)',
    padding: '0.625rem 1rem',
    borderRadius: 'var(--border-radius-sm)',
    fontWeight: '500',
  },
  noteForm: {
    backgroundColor: '#f8fafc',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--border-radius-sm)',
    padding: '1rem',
  },
  timeline: {
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    paddingLeft: '1rem',
  },
  noNotes: {
    color: 'var(--text-muted)',
    fontSize: '0.875rem',
    fontStyle: 'italic',
  },
  timelineItem: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '1.5rem',
    position: 'relative',
  },
  timelineBadge: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    color: '#8b5cf6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.7rem',
    fontWeight: '800',
    flexShrink: 0,
  },
  timelineContent: {
    backgroundColor: '#fff',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--border-radius-sm)',
    padding: '0.75rem 1rem',
    flexGrow: 1,
    boxShadow: 'var(--shadow-sm)',
  },
  timelineHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '0.5rem',
  },
  timelineAuthor: {
    fontWeight: '700',
    fontSize: '0.85rem',
    color: 'var(--text-primary)',
  },
  timelineDate: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
  },
  timelineText: {
    fontSize: '0.875rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.4',
  },
  deleteNoteBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--danger-color)',
    fontSize: '0.75rem',
    cursor: 'pointer',
    marginTop: '0.5rem',
    padding: 0,
    fontWeight: '500',
  },
  monitoringLayout: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  backBtn: {
    padding: '0.5rem 1rem',
    background: 'none',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--border-radius-sm)',
    fontSize: '0.8rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
  tableWrapper: {
    backgroundColor: '#fff',
    borderRadius: 'var(--border-radius-md)',
    border: '1px solid var(--border-color)',
    overflowX: 'auto',
    boxShadow: 'var(--shadow-sm)',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
    fontSize: '0.85rem',
  },
  noDataCell: {
    textAlign: 'center',
    padding: '3rem',
    color: 'var(--text-muted)',
  },
  actionDeleteBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--danger-color)',
    cursor: 'pointer',
  },
  addHourBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    border: '1px dashed #8b5cf6',
    color: '#8b5cf6',
    backgroundColor: 'rgba(139, 92, 246, 0.02)',
    padding: '0.5rem 1rem',
    borderRadius: 'var(--border-radius-sm)',
    fontSize: '0.8rem',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '0.75rem',
  },
  complicationsSection: {
    backgroundColor: '#f8fafc',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--border-radius-sm)',
    padding: '1rem',
    marginTop: '1.5rem',
  },
  complicationsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: '0.5rem',
  },
  compLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.8rem',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
  },
  badgeActive: {
    fontSize: '0.75rem',
    padding: '0.15rem 0.5rem',
    borderRadius: '4px',
    backgroundColor: 'rgba(139, 92, 246, 0.08)',
    color: '#8b5cf6',
    fontWeight: '700',
  },
  badgeIdle: {
    fontSize: '0.75rem',
    padding: '0.15rem 0.5rem',
    borderRadius: '4px',
    backgroundColor: '#f1f5f9',
    color: 'var(--text-muted)',
    fontWeight: '500',
  },
  monitorBtn: {
    backgroundColor: '#8b5cf6',
    color: '#fff',
    border: 'none',
    padding: '0.4rem 0.75rem',
    borderRadius: 'var(--border-radius-sm)',
    fontWeight: '600',
    fontSize: '0.75rem',
    cursor: 'pointer',
  }
};
