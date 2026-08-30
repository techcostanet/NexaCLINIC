import React, { useState, useEffect, useMemo } from 'react';
import { dbService } from '../firebase';
import { 
  HeartPulse, ClipboardList, Activity, Plus, Search, Edit2, 
  Trash2, User, Clock, Check, X, AlertTriangle, MessageSquare, 
  TrendingUp, Pill, Settings, Thermometer, Megaphone, Sparkles, 
  FileText, Calculator, Droplets, ShieldCheck, Printer, CheckCircle2
} from 'lucide-react';

import ClinicalPatientCockpit from './clinical/ClinicalPatientCockpit';
import ClinicalMedicationsTab from './clinical/ClinicalMedicationsTab';
import ClinicalLabExamsTab from './clinical/ClinicalLabExamsTab';
import ClinicalApacTab from './clinical/ClinicalApacTab';
import ClinicalCalculatorsTab from './clinical/ClinicalCalculatorsTab';
import ClinicalExportModal from './clinical/ClinicalExportModal';
import ClinicalAiSummaryModal from './clinical/ClinicalAiSummaryModal';
import { useUnit } from '../contexts/UnitContext';
import UnitSelector from './common/UnitSelector';

export default function ClinicalPanel() {
  const { activeUnitId, filterByActiveUnit, matchItemUnit } = useUnit();
  const [activeTab, setActiveTab] = useState('prescriptions'); 
  // 'prescriptions' | 'medications' | 'monitoring' | 'evolutions' | 'labexams' | 'apac' | 'calculators' | 'dispensations' | 'timeline'

  const [patients, setPatients] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [sessionsLogs, setSessionsLogs] = useState([]);
  const [clinicalNotes, setClinicalNotes] = useState([]);
  const [assistPosts, setAssistPosts] = useState([]);
  const [patientDispensations, setPatientDispensations] = useState([]);
  const [medications, setMedications] = useState([]);
  const [labExams, setLabExams] = useState([]);
  const [apacRecords, setApacRecords] = useState([]);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Modals
  const [showExportModal, setShowExportModal] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);

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
  const [machineId, setMachineId] = useState('Máquina 01 - Fresenius 4008S');
  const [preWeight, setPreWeight] = useState('');
  const [finalWeight, setFinalWeight] = useState('');
  const [hourlyRecords, setHourlyRecords] = useState([
    { hour: '1ªh', bp: '120/80', hr: '80', venousPressure: '120', arterialPressure: '-150', bloodFlowReal: '300', ufRate: '0.8', notes: 'Início estável' }
  ]);

  // Clinical Note Form State & Category Filter
  const [evolutionFilter, setEvolutionFilter] = useState('Todas');
  const [noteCategory, setNoteCategory] = useState('Médica');
  const [noteText, setNoteText] = useState('');
  const [noteAuthor, setNoteAuthor] = useState('Dr. Lucas (Nefrologista)');

  // Quick assist notice form in patient chart
  const [quickAssistText, setQuickAssistText] = useState('');
  const [quickAssistCategory, setQuickAssistCategory] = useState('Internação');
  const [quickAssistUrgency, setQuickAssistUrgency] = useState('Urgente');

  useEffect(() => {
    fetchClinicalData();
  }, []);

  const fetchClinicalData = async () => {
    setLoading(true);
    try {
      const [pList, pRecs, sLogs, cNotes, aPosts, pDisps, pMeds, pLabs, pApacs] = await Promise.all([
        dbService.getPatients(),
        dbService.getPrescriptions(),
        dbService.getSessionsLogs(),
        dbService.getClinicalNotes(),
        dbService.getAssistPosts ? dbService.getAssistPosts() : [],
        dbService.getPatientDispensations ? dbService.getPatientDispensations() : [],
        dbService.getPatientMedications ? dbService.getPatientMedications() : [],
        dbService.getPatientLabExams ? dbService.getPatientLabExams() : [],
        dbService.getPatientApacRecords ? dbService.getPatientApacRecords() : []
      ]);

      const activePatients = pList.filter(p => p.treatmentStatus === 'Ativo');
      setPatients(activePatients);
      setPrescriptions(pRecs || []);
      setSessionsLogs(sLogs || []);
      setClinicalNotes(cNotes || []);
      setAssistPosts(aPosts || []);
      setPatientDispensations(pDisps || []);
      setMedications(pMeds || []);
      setLabExams(pLabs || []);
      setApacRecords(pApacs || []);

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

  // Filtragem de Dados pela Unidade Ativa
  const currentPatients = useMemo(() => {
    const list = filterByActiveUnit(patients);
    return list.length > 0 ? list : (patients || []);
  }, [patients, activeUnitId]);
  const currentPrescriptions = useMemo(() => filterByActiveUnit(prescriptions), [prescriptions, activeUnitId]);
  const currentSessionsLogs = useMemo(() => filterByActiveUnit(sessionsLogs), [sessionsLogs, activeUnitId]);
  const currentClinicalNotes = useMemo(() => filterByActiveUnit(clinicalNotes), [clinicalNotes, activeUnitId]);
  const currentAssistPosts = useMemo(() => filterByActiveUnit(assistPosts), [assistPosts, activeUnitId]);
  const currentMedications = useMemo(() => filterByActiveUnit(medications), [medications, activeUnitId]);
  const currentLabExams = useMemo(() => filterByActiveUnit(labExams), [labExams, activeUnitId]);
  const currentApacRecords = useMemo(() => filterByActiveUnit(apacRecords), [apacRecords, activeUnitId]);
  const currentDispensations = useMemo(() => filterByActiveUnit(patientDispensations), [patientDispensations, activeUnitId]);

  const getSelectedPatient = () => currentPatients.find(p => p.id === selectedPatientId);
  const getPrescriptionForSelected = () => currentPrescriptions.find(p => p.patientId === selectedPatientId);
  const getMedicationsForSelected = () => currentMedications.filter(m => m.patientId === selectedPatientId);
  const getLabExamsForSelected = () => currentLabExams.filter(e => e.patientId === selectedPatientId).sort((a, b) => b.date.localeCompare(a.date));
  const getApacRecordForSelected = () => currentApacRecords.find(a => a.patientId === selectedPatientId);

  // ----------------------------------------------------
  // Prescription Handling
  // ----------------------------------------------------
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
  // Medication Handlers
  // ----------------------------------------------------
  const handleSaveMedication = async (medData) => {
    setActionLoading(true);
    try {
      await dbService.savePatientMedication(medData);
      showAlert('Medicamento prescrito salvo!', 'success');
      fetchClinicalData();
    } catch (err) {
      showAlert('Erro ao salvar medicamento.', 'danger');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteMedication = async (id) => {
    if (!window.confirm('Deseja excluir este medicamento da prescrição?')) return;
    try {
      await dbService.deletePatientMedication(id);
      showAlert('Medicamento excluído.', 'success');
      fetchClinicalData();
    } catch (err) {
      showAlert('Erro ao excluir.', 'danger');
    }
  };

  const handleRequestSalonDispensation = async (med) => {
    const activePat = getSelectedPatient();
    if (!activePat) return;
    try {
      if (dbService.createRequisition) {
        await dbService.createRequisition({
          sector: activePat.room || 'Salão 1',
          requester: 'Prescrição Médica (NexaCLINIC)',
          shift: activePat.shift || '1º Turno',
          patientId: activePat.id,
          patientName: activePat.name,
          priority: 'Média',
          status: 'pending',
          items: [{
            product: med.name,
            quantity: 1,
            dosage: med.dosage,
            route: med.route
          }]
        });
      }
      showAlert(`Requisição de ${med.name} enviada para a farmácia/salão!`, 'success');
    } catch (err) {
      showAlert('Erro ao enviar requisição.', 'danger');
    }
  };

  // ----------------------------------------------------
  // Lab Exam Handlers
  // ----------------------------------------------------
  const handleSaveLabExam = async (examData) => {
    setActionLoading(true);
    try {
      await dbService.savePatientLabExam(examData);
      showAlert('Exame laboratorial lançado com sucesso!', 'success');
      fetchClinicalData();
    } catch (err) {
      showAlert('Erro ao salvar exame.', 'danger');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteLabExam = async (id) => {
    if (!window.confirm('Excluir lançamento de exame?')) return;
    try {
      await dbService.deletePatientLabExam(id);
      showAlert('Exame excluído.', 'success');
      fetchClinicalData();
    } catch (err) {
      showAlert('Erro ao excluir exame.', 'danger');
    }
  };

  // ----------------------------------------------------
  // APAC Record Handler
  // ----------------------------------------------------
  const handleSaveApacRecord = async (apacData) => {
    setActionLoading(true);
    try {
      await dbService.savePatientApacRecord(apacData);
      showAlert('Dados da APAC atualizados!', 'success');
      fetchClinicalData();
    } catch (err) {
      showAlert('Erro ao salvar APAC.', 'danger');
    } finally {
      setActionLoading(false);
    }
  };

  // ----------------------------------------------------
  // Session Monitoring Handling
  // ----------------------------------------------------
  const handleOpenSessionLog = (patient) => {
    setSelectedSessionPatient(patient);
    const todayDate = new Date().toISOString().substring(0, 10);
    const existing = sessionsLogs.find(l => l.patientId === patient.id && l.date === todayDate);

    if (existing) {
      setHourlyRecords(existing.hourlyData || []);
      setComplications(existing.complications || []);
      setSessionNotes(existing.notes || '');
      setMachineId(existing.machineId || 'Máquina 01 - Fresenius 4008S');
      setPreWeight(existing.preWeight || '');
      setFinalWeight(existing.finalWeight || '');
    } else {
      setHourlyRecords([
        { hour: '1ªh', bp: '120/80', hr: '80', venousPressure: '120', arterialPressure: '-150', bloodFlowReal: '300', ufRate: '0.8', notes: 'Início estável' }
      ]);
      setComplications([]);
      setSessionNotes('');
      setMachineId('Máquina 01 - Fresenius 4008S');
      setPreWeight(patient.dryWeight ? (parseFloat(patient.dryWeight) + 2.5).toFixed(1) : '');
      setFinalWeight(patient.dryWeight ? patient.dryWeight.toString() : '');
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
        machineId,
        preWeight: parseFloat(preWeight) || 0,
        finalWeight: parseFloat(finalWeight) || 0,
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
  // Clinical Evolution Templates & Handling
  // ----------------------------------------------------
  const evolutionTemplates = {
    'Médica': 'Paciente admitido em boas condições hemodinâmicas. Acesso vascular sem sinais flogísticos ou estenose. Peso seco mantido. Prescrição dialítica ajustada conforme metas laboratoriais. Sem queixas intradialíticas.',
    'Enfermagem': 'Acesso vascular avaliado com bom frêmito e sopro audível. Punção em membro superior realizada com técnica asséptica e agulha 16G. Fluxo de sangue contínuo. Sessão concluída com hemostasia efetiva e sem hematomas.',
    'Nutrição': 'Avaliação do estado nutricional e inquérito alimentar. Ganho de peso interdialítico dentro da faixa aceitável (≤ 5% do peso seco). Orientado sobre restrição de fósforo e ingestão adequada de proteínas de alto valor biológico.',
    'Psicologia': 'Atendimento psicológico de suporte no leito. Paciente verbaliza boa adaptação à rotina do tratamento e suporte familiar preservado. Ausência de ideação depressiva ou ansiedade patológica no momento.',
    'Serviço Social': 'Atendimento do serviço social realizado. Orientação sobre renovação de laudo para transporte sanitário municipal e manutenção de benefício de prestação continuada (BPC/LOAS). Família orientada.'
  };

  const handleApplyEvolutionTemplate = (cat) => {
    setNoteCategory(cat);
    if (cat === 'Médica') setNoteAuthor('Dr. Lucas (Nefrologista)');
    if (cat === 'Enfermagem') setNoteAuthor('Enfª. Cláudia (COREN/MG 192841)');
    if (cat === 'Nutrição') setNoteAuthor('Nutr. Juliana (CRN 9482)');
    if (cat === 'Psicologia') setNoteAuthor('Psic. Fernanda (CRP 04/3829)');
    if (cat === 'Serviço Social') setNoteAuthor('Ass. Social Renato (CRESS 1829)');
    setNoteText(evolutionTemplates[cat] || '');
  };

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
    if (!window.confirm('Excluir esta nota de evolução?')) return;
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
      showAlert('Comunicado assistencial salvo e publicado no mural geral!', 'success');
      fetchClinicalData();
    } catch (err) {
      showAlert('Erro ao gravar comunicado assistencial.', 'danger');
    } finally {
      setActionLoading(false);
    }
  };

  const activePatient = getSelectedPatient();
  const activePresc = getPrescriptionForSelected();
  const activeMeds = getMedicationsForSelected();
  const activeLabs = getLabExamsForSelected();
  const activeApac = getApacRecordForSelected();
  const activeNotes = currentClinicalNotes
    .filter(n => n.patientId === selectedPatientId)
    .filter(n => evolutionFilter === 'Todas' || n.category === evolutionFilter)
    .sort((a, b) => b.date.localeCompare(a.date));
  const activeAssistPosts = currentAssistPosts
    .filter(p => p.patientId === selectedPatientId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const getTodayWeekday = () => {
    const day = new Date().getDay();
    if ([1, 3, 5].includes(day)) return 'Segunda, quarta e sexta';
    if ([2, 4, 6].includes(day)) return 'Terça, quinta e sábado';
    return 'Segunda, quarta e sexta';
  };
  const todayWeekday = getTodayWeekday();

  const todayPatients = currentPatients.filter(
    p => p.dialysisFrequency?.includes(todayWeekday) || p.dialysisFrequency === 'Diário'
  );

  return (
    <div style={styles.container}>
      {/* Top Main Title Header */}
      <div style={styles.cardHeader}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={styles.title}>NexaCLINIC - Módulo Clínico & Assistencial</h1>
            <p style={styles.subtitle}>Prontuário eletrônico nefrológico, prescrições dialíticas, farmacoterapia e regulação APAC.</p>
          </div>
          <UnitSelector compact showLabel={false} />
        </div>
      </div>

      {/* Main Tabs Navigation (Strict 1-Word Clean Padrão) */}
      <div style={styles.tabsWrapper}>
        <button 
          onClick={() => setActiveTab('prescriptions')} 
          style={{ ...styles.tabBtn, ...(activeTab === 'prescriptions' ? styles.tabBtnActive : {}) }}
        >
          <ClipboardList size={16} /> Prescrição
        </button>

        <button 
          onClick={() => setActiveTab('medications')} 
          style={{ ...styles.tabBtn, ...(activeTab === 'medications' ? styles.tabBtnActive : {}) }}
        >
          <Pill size={16} /> Medicamentos ({activeMeds.length})
        </button>

        <button 
          onClick={() => setActiveTab('monitoring')} 
          style={{ ...styles.tabBtn, ...(activeTab === 'monitoring' ? styles.tabBtnActive : {}) }}
        >
          <Activity size={16} /> Sessões ({sessionsLogs.filter(l => l.date === new Date().toISOString().substring(0, 10)).length}/{todayPatients.length})
        </button>

        <button 
          onClick={() => setActiveTab('evolutions')} 
          style={{ ...styles.tabBtn, ...(activeTab === 'evolutions' ? styles.tabBtnActive : {}) }}
        >
          <MessageSquare size={16} /> Evoluções
        </button>

        <button 
          onClick={() => setActiveTab('labexams')} 
          style={{ ...styles.tabBtn, ...(activeTab === 'labexams' ? styles.tabBtnActive : {}) }}
        >
          <TrendingUp size={16} /> Exames ({activeLabs.length})
        </button>

        <button 
          onClick={() => setActiveTab('apac')} 
          style={{ ...styles.tabBtn, ...(activeTab === 'apac' ? styles.tabBtnActive : {}) }}
        >
          <FileText size={16} /> Laudos
        </button>

        <button 
          onClick={() => setActiveTab('calculators')} 
          style={{ ...styles.tabBtn, ...(activeTab === 'calculators' ? styles.tabBtnActive : {}) }}
        >
          <Calculator size={16} /> Calculadora
        </button>

        <button 
          onClick={() => setActiveTab('dispensations')} 
          style={{ ...styles.tabBtn, ...(activeTab === 'dispensations' ? styles.tabBtnActive : {}) }}
        >
          <Droplets size={16} /> Insumos ({(patientDispensations || []).filter(d => d.patientId === selectedPatientId).length})
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
          <Megaphone size={16} /> Mural ({activeAssistPosts.length})
        </button>
      </div>

      {/* Message feedback */}
      {message.text && (
        <div style={{ ...styles.alert, backgroundColor: `var(--${message.type}-light, #f0fdf4)`, border: `1px solid var(--${message.type}-color, #10b981)` }}>
          <AlertTriangle size={18} color="var(--primary-color)" />
          <span style={{ fontWeight: '600' }}>{message.text}</span>
        </div>
      )}

      {loading ? (
        <div style={styles.loadingBox}>Carregando dados assistenciais...</div>
      ) : (
        <>
          {/* TAB 2 (Sessões) has special layout */}
          {activeTab === 'monitoring' ? (
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

                  {/* Machine and Pre/Post Weight Row */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div className="form-group">
                      <label>Máquina de Diálise *</label>
                      <select className="form-control" value={machineId} onChange={e => setMachineId(e.target.value)}>
                        <option value="Máquina 01 - Fresenius 4008S">Máquina 01 - Fresenius 4008S</option>
                        <option value="Máquina 02 - Gambro AK98">Máquina 02 - Gambro AK98</option>
                        <option value="Máquina 03 - Nipro Surdial X">Máquina 03 - Nipro Surdial X</option>
                        <option value="Máquina 04 - B.Braun Dialog+">Máquina 04 - B.Braun Dialog+</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Peso Pré-Diálise (kg)</label>
                      <input 
                        type="number" step="0.1" className="form-control" placeholder="Ex: 66.5"
                        value={preWeight} onChange={e => setPreWeight(e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label>Peso Pós-Diálise (kg)</label>
                      <input 
                        type="number" step="0.1" className="form-control" placeholder="Ex: 64.0"
                        value={finalWeight} onChange={e => setFinalWeight(e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label>Perda de Peso Total</label>
                      <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0284c7', paddingTop: '0.4rem' }}>
                        {preWeight && finalWeight ? `${(parseFloat(preWeight) - parseFloat(finalWeight)).toFixed(1)} kg` : '--'}
                      </div>
                    </div>
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
                            <th>Fluxo Real</th>
                            <th>Taxa UF (L/h)</th>
                            <th>Observações</th>
                            <th>Ações</th>
                          </tr>
                        </thead>
                        <tbody>
                          {hourlyRecords.map((row, index) => {
                            const ufNum = parseFloat(row.ufRate) || 0;
                            const isHighUf = ufNum > 1.0;
                            return (
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
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                    <input 
                                      type="number" step="0.1" className="form-control" style={{ width: '70px', borderColor: isHighUf ? '#f59e0b' : undefined }} placeholder="0.8"
                                      value={row.ufRate} onChange={e => handleHourlyRowChange(index, 'ufRate', e.target.value)}
                                    />
                                    {isHighUf && <span title="Taxa de UF elevada" style={{ color: '#d97706', fontSize: '0.8rem' }}>⚠</span>}
                                  </div>
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
                            );
                          })}
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
                        <th>Nome</th>
                        <th>CPF</th>
                        <th>Sala</th>
                        <th>Poltrona</th>
                        <th>Acesso</th>
                        <th>Status</th>
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
                          const log = currentSessionsLogs.find(l => l.patientId === pat.id && l.date === todayDate);

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
                                  <span style={styles.badgePending}>Pendente</span>
                                )}
                              </td>
                              <td>
                                <button 
                                  onClick={() => handleStartSessionMonitoring(pat)} 
                                  className="btn btn-sm"
                                  style={{ backgroundColor: '#8b5cf6', color: '#fff' }}
                                >
                                  {log ? 'Ver / Editar' : 'Registrar'}
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
          ) : (
            /* ALL OTHER TABS: Two-column Patient Selector + Cockpit Layout */
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
                  {currentPatients
                    .filter(p => {
                      const term = (searchTerm || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
                      const pName = (p.name || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
                      const pCpf = (p.cpf || '').replace(/\D/g, '');
                      const termCpf = term.replace(/\D/g, '');
                      return pName.includes(term) || (termCpf && pCpf.includes(termCpf));
                    })
                    .map(p => {
                      const pCount = currentAssistPosts.filter(ap => ap.patientId === p.id).length;
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

              {/* Right Column: Dynamic Tab Content with 360 Cockpit Header */}
              <div style={styles.mainContentArea}>
                {activePatient ? (
                  <>
                    {/* Cockpit 360 Header on top of all patient views */}
                    <ClinicalPatientCockpit 
                      patient={activePatient}
                      prescription={activePresc}
                      latestExam={activeLabs[0]}
                      latestSession={currentSessionsLogs.find(s => s.patientId === activePatient.id)}
                      onOpenAiSummary={() => setShowAiModal(true)}
                      onExportPdf={() => setShowExportModal(true)}
                    />

                    {/* TAB: PRESCRIPTIONS */}
                    {activeTab === 'prescriptions' && (
                      <div style={styles.contentCard}>
                        <div style={styles.contentHeader}>
                          <div>
                            <h3 style={{ margin: 0, fontWeight: '800' }}>Prescrição Dialítica</h3>
                            <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>Parâmetros da máquina, dialisador, fluxo e peso seco alvo.</p>
                          </div>
                          <button onClick={handleOpenPrescForm} style={styles.primaryActionBtn}>
                            <Edit2 size={14} /> {activePresc ? 'Alterar' : 'Cadastrar'}
                          </button>
                        </div>

                        {showPrescForm ? (
                          <form onSubmit={handleSavePrescription} style={styles.prescForm}>
                            <div style={styles.formGrid}>
                              <div className="form-group">
                                <label>Terapia *</label>
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
                                <label>Capilar (Dialisador) *</label>
                                <input 
                                  type="text" className="form-control" placeholder="Ex: HF80 (Alto Fluxo)"
                                  value={prescForm.dialyzerModel} onChange={e => setPrescForm({ ...prescForm, dialyzerModel: e.target.value })} required
                                />
                              </div>
                              <div className="form-group">
                                <label>Duração (Horas) *</label>
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
                                <label>Fluxo Sangue (QB) *</label>
                                <input 
                                  type="number" className="form-control" placeholder="300"
                                  value={prescForm.bloodFlow} onChange={e => setPrescForm({ ...prescForm, bloodFlow: e.target.value })} required
                                />
                              </div>
                              <div className="form-group">
                                <label>Fluxo Dialisato (QD) *</label>
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
                                <label>Dose Heparina *</label>
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
                                <label>Sódio *</label>
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
                          <div style={styles.prescView}>
                            <div style={styles.detailsGrid}>
                              <div style={styles.detailItem}>
                                <span style={styles.detailLabel}>Modalidade</span>
                                <span style={styles.detailValue}>{activePresc.type}</span>
                              </div>
                              <div style={styles.detailItem}>
                                <span style={styles.detailLabel}>Capilar</span>
                                <span style={styles.detailValue}>{activePresc.dialyzerModel}</span>
                              </div>
                              <div style={styles.detailItem}>
                                <span style={styles.detailLabel}>Tempo</span>
                                <span style={styles.detailValue}>{activePresc.sessionTime} Horas</span>
                              </div>
                              <div style={styles.detailItem}>
                                <span style={styles.detailLabel}>Fluxo Sangue</span>
                                <span style={styles.detailValue}>{activePresc.bloodFlow} mL/min</span>
                              </div>
                              <div style={styles.detailItem}>
                                <span style={styles.detailLabel}>Fluxo Dialisato</span>
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
                                <span style={styles.detailLabel}>Peso Seco</span>
                                <span style={{ ...styles.detailValue, color: '#0284c7' }}>{activePresc.dryWeight} kg</span>
                              </div>
                            </div>
                            <div style={styles.prescFooter}>
                              <span>Última atualização da prescrição: {new Date(activePresc.updatedAt).toLocaleDateString('pt-BR')}</span>
                            </div>
                          </div>
                        ) : (
                          <div style={styles.noDataState}>
                            <p>Nenhuma prescrição dialítica cadastrada para este paciente.</p>
                            <button onClick={handleOpenPrescForm} className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
                              Cadastrar Prescrição
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* TAB: MEDICATIONS */}
                    {activeTab === 'medications' && (
                      <ClinicalMedicationsTab 
                        patient={activePatient}
                        medications={activeMeds}
                        onSaveMedication={handleSaveMedication}
                        onDeleteMedication={handleDeleteMedication}
                        onRequestSalonDispensation={handleRequestSalonDispensation}
                        loading={actionLoading}
                      />
                    )}

                    {/* TAB: EVOLUTIONS */}
                    {activeTab === 'evolutions' && (
                      <div style={styles.contentCard}>
                        <div style={styles.contentHeader}>
                          <div>
                            <h3 style={{ margin: 0, fontWeight: '800' }}>Evoluções Multiprofissionais</h3>
                            <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>Registros estruturados de medicina, enfermagem, nutrição, psicologia e serviço social.</p>
                          </div>
                        </div>

                        {/* Quick Templates Strip */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#475569' }}>Roteiro Rápido:</span>
                          {['Médica', 'Enfermagem', 'Nutrição', 'Psicologia', 'Serviço Social'].map(cat => (
                            <button
                              key={cat}
                              type="button"
                              onClick={() => handleApplyEvolutionTemplate(cat)}
                              style={{
                                fontSize: '0.75rem',
                                fontWeight: '600',
                                backgroundColor: '#fff',
                                color: '#8b5cf6',
                                border: '1px solid #ddd6fe',
                                borderRadius: '6px',
                                padding: '0.25rem 0.6rem',
                                cursor: 'pointer'
                              }}
                            >
                              {cat}
                            </button>
                          ))}
                        </div>

                        {/* Evolution Form */}
                        <form onSubmit={handleSaveClinicalNote} style={styles.noteForm}>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                            <div className="form-group">
                              <label>Especialidade</label>
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
                              <label>Profissional</label>
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

                        {/* Category Filter Tabs for Timeline */}
                        <div style={{ display: 'flex', gap: '0.4rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem', marginTop: '1rem' }}>
                          {['Todas', 'Médica', 'Enfermagem', 'Nutrição', 'Psicologia', 'Serviço Social'].map(cat => (
                            <button
                              key={cat}
                              type="button"
                              onClick={() => setEvolutionFilter(cat)}
                              style={{
                                padding: '0.3rem 0.7rem',
                                fontSize: '0.75rem',
                                fontWeight: '600',
                                backgroundColor: evolutionFilter === cat ? '#8b5cf6' : '#f1f5f9',
                                color: evolutionFilter === cat ? '#fff' : '#475569',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer'
                              }}
                            >
                              {cat}
                            </button>
                          ))}
                        </div>

                        {/* Notes Timeline */}
                        <div style={styles.timeline}>
                          {activeNotes.length === 0 ? (
                            <div style={styles.noNotes}>Sem notas de evolução registradas para este filtro.</div>
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
                                    Excluir
                                  </button>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}

                    {/* TAB: LAB EXAMS */}
                    {activeTab === 'labexams' && (
                      <ClinicalLabExamsTab 
                        patient={activePatient}
                        labExams={activeLabs}
                        onSaveLabExam={handleSaveLabExam}
                        onDeleteLabExam={handleDeleteLabExam}
                        loading={actionLoading}
                      />
                    )}

                    {/* TAB: APAC RECORDS */}
                    {activeTab === 'apac' && (
                      <ClinicalApacTab 
                        patient={activePatient}
                        prescription={activePresc}
                        latestExam={activeLabs[0]}
                        apacRecord={activeApac}
                        onSaveApacRecord={handleSaveApacRecord}
                        loading={actionLoading}
                      />
                    )}

                    {/* TAB: CALCULATORS */}
                    {activeTab === 'calculators' && (
                      <ClinicalCalculatorsTab 
                        patient={activePatient}
                        prescription={activePresc}
                        latestExam={activeLabs[0]}
                      />
                    )}

                    {/* TAB: DISPENSATIONS (FARMÁCIA) */}
                    {activeTab === 'dispensations' && (
                      <div style={styles.contentCard}>
                        <div style={styles.contentHeader}>
                          <div>
                            <h3 style={{ margin: 0, fontWeight: '800' }}>Insumos Dispensados na Farmácia</h3>
                            <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>Rastreabilidade de lotes, validades e dispensações realizadas para {activePatient.name}.</p>
                          </div>
                        </div>

                        {(() => {
                          const activeDisps = (patientDispensations || []).filter(d => 
                            d.patientId === activePatient.id || 
                            (d.patientName && activePatient.name && d.patientName.toLowerCase() === activePatient.name.toLowerCase())
                          );

                          return (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                              <div style={styles.tableWrapper}>
                                <table style={styles.table}>
                                  <thead>
                                    <tr>
                                      <th>Data</th>
                                      <th>Insumo</th>
                                      <th>Quantidade</th>
                                      <th>Lote</th>
                                      <th>Validade</th>
                                      <th>Solicitante</th>
                                      <th>Farmácia</th>
                                      <th>Requisição</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {activeDisps.length === 0 ? (
                                      <tr>
                                        <td colSpan="8" style={styles.noDataCell}>Nenhum insumo dispensado para este paciente até o momento.</td>
                                      </tr>
                                    ) : (
                                      activeDisps.map((disp, dIdx) => (
                                        <tr key={disp.id || dIdx}>
                                          <td>
                                            <div>{disp.date ? new Date(disp.date).toLocaleDateString('pt-BR') : '-'}</div>
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
                    )}

                    {/* TAB: TIMELINE (MURAL / NexaASSIST) */}
                    {activeTab === 'timeline' && (
                      <div style={styles.contentCard}>
                        <div style={styles.contentHeader}>
                          <div>
                            <h3 style={{ margin: 0, fontWeight: '800' }}>Mural Assistencial: {activePatient.name}</h3>
                            <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>Comunicados de plantão, internações, altas e transferências vinculadas.</p>
                          </div>
                        </div>

                        {/* Formulário Rápido de Comunicado */}
                        <form onSubmit={handleSaveQuickAssistPost} style={{ padding: '1.25rem', borderRadius: '12px', borderLeft: '4px solid #ec4899', backgroundColor: '#fdf2f8', marginBottom: '1.5rem', border: '1px solid #fbcfe8' }}>
                          <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                            <div style={{ flex: 1, minWidth: '160px' }}>
                              <label style={{ fontSize: '0.8rem', fontWeight: '600', display: 'block', marginBottom: '0.25rem' }}>Tipo de Evento</label>
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
                              <label style={{ fontSize: '0.8rem', fontWeight: '600', display: 'block', marginBottom: '0.25rem' }}>Urgência</label>
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

                        {/* Lista Cronológica */}
                        <div style={styles.timeline}>
                          {activeAssistPosts.length === 0 ? (
                            <div style={styles.noNotes}>
                              Nenhum comunicado assistencial registrado para {activePatient.name}.
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
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div style={styles.noSelectionBox}>Selecione um paciente na barra lateral para carregar o prontuário.</div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* MODAL 1: Exportar Sumário em PDF */}
      {showExportModal && (
        <ClinicalExportModal 
          patient={activePatient}
          prescription={activePresc}
          medications={activeMeds}
          labExams={activeLabs}
          clinicalNotes={clinicalNotes.filter(n => n.patientId === selectedPatientId)}
          onClose={() => setShowExportModal(false)}
        />
      )}

      {/* MODAL 2: Copiloto Clínico IA */}
      {showAiModal && (
        <ClinicalAiSummaryModal 
          patient={activePatient}
          prescription={activePresc}
          medications={activeMeds}
          labExams={activeLabs}
          clinicalNotes={clinicalNotes.filter(n => n.patientId === selectedPatientId)}
          sessionsLogs={sessionsLogs}
          onClose={() => setShowAiModal(false)}
          onInsertEvolution={(aiText) => {
            setNoteCategory('Médica');
            setNoteAuthor('Copiloto IA (Revisado pelo Médico)');
            setNoteText(aiText);
            setActiveTab('evolutions');
            showAlert('Resumo da IA inserido no formulário de evolução!', 'success');
          }}
        />
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
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '0.75rem',
  },
  title: {
    fontSize: '1.4rem',
    fontWeight: '800',
    color: 'var(--text-primary)',
    marginBottom: '0.2rem',
  },
  subtitle: {
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
  },
  tabsWrapper: {
    display: 'flex',
    gap: '0.4rem',
    borderBottom: '2px solid var(--border-color)',
    paddingBottom: '2px',
    overflowX: 'auto',
  },
  tabBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    background: 'none',
    border: 'none',
    padding: '0.65rem 1rem',
    fontSize: '0.85rem',
    fontWeight: '600',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    borderBottom: '2px solid transparent',
    marginBottom: '-2px',
    whiteSpace: 'nowrap',
    transition: 'all 0.15s ease',
  },
  tabBtnActive: {
    color: '#8b5cf6',
    borderBottomColor: '#8b5cf6',
    fontWeight: '700',
  },
  alert: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    fontSize: '0.85rem',
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
    gap: '1.25rem',
    minHeight: '450px',
  },
  sidebar: {
    backgroundColor: '#fff',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: 'var(--shadow-sm)',
    overflow: 'hidden',
    height: 'fit-content',
    maxHeight: '800px',
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
    padding: '0.45rem 0.45rem 0.45rem 2rem',
    fontSize: '0.85rem',
    borderRadius: '6px',
    border: '1px solid var(--border-color)',
  },
  sidebarList: {
    flexGrow: 1,
    overflowY: 'auto',
    maxHeight: '650px',
  },
  patientItem: {
    padding: '0.65rem 0.9rem',
    borderBottom: '1px solid var(--border-color)',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  patientItemActive: {
    backgroundColor: 'rgba(139, 92, 246, 0.08)',
    borderLeft: '4px solid #8b5cf6',
    paddingLeft: '0.65rem',
  },
  sidebarPatName: {
    fontSize: '0.85rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
    display: 'block',
  },
  sidebarPatSub: {
    fontSize: '0.7rem',
    color: 'var(--text-muted)',
  },
  mainContentArea: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  contentCard: {
    backgroundColor: '#fff',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    padding: '1.25rem',
    boxShadow: 'var(--shadow-sm)',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  contentHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '0.75rem',
    gap: '1rem',
    flexWrap: 'wrap',
  },
  patientBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  primaryActionBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    padding: '0.45rem 0.85rem',
    fontSize: '0.8rem',
    fontWeight: '700',
    backgroundColor: '#8b5cf6',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  noSelectionBox: {
    backgroundColor: '#f8fafc',
    border: '1px dashed var(--border-color)',
    borderRadius: '12px',
    padding: '4rem 2rem',
    textAlign: 'center',
    color: 'var(--text-muted)',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '0.75rem',
  },
  formActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.5rem',
    borderTop: '1px solid var(--border-color)',
    paddingTop: '0.75rem',
    marginTop: '0.75rem',
  },
  prescForm: {
    backgroundColor: '#f8fafc',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    padding: '1rem',
  },
  prescView: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  detailsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '0.75rem',
  },
  detailItem: {
    backgroundColor: '#f8fafc',
    border: '1px solid var(--border-color)',
    borderRadius: '6px',
    padding: '0.6rem 0.8rem',
    display: 'flex',
    flexDirection: 'column',
  },
  detailLabel: {
    fontSize: '0.7rem',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    fontWeight: '700',
    marginBottom: '0.2rem',
  },
  detailValue: {
    fontSize: '0.9rem',
    fontWeight: '800',
    color: 'var(--text-primary)',
  },
  prescFooter: {
    fontSize: '0.75rem',
    color: '#64748b',
    borderTop: '1px solid #f1f5f9',
    paddingTop: '0.5rem',
  },
  noDataState: {
    textAlign: 'center',
    padding: '2.5rem 1rem',
    color: '#94a3b8',
  },
  noteForm: {
    backgroundColor: '#f8fafc',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    padding: '1rem',
  },
  timeline: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    marginTop: '0.5rem',
  },
  noNotes: {
    color: 'var(--text-muted)',
    fontSize: '0.85rem',
    fontStyle: 'italic',
    padding: '1rem 0',
  },
  timelineItem: {
    display: 'flex',
    gap: '0.75rem',
    position: 'relative',
    backgroundColor: '#fff',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    padding: '0.75rem 1rem',
    boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
  },
  timelineBadge: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    color: '#8b5cf6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.65rem',
    fontWeight: '800',
    flexShrink: 0,
  },
  timelineContent: {
    flexGrow: 1,
  },
  timelineHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '0.35rem',
  },
  timelineAuthor: {
    fontWeight: '700',
    fontSize: '0.8rem',
    color: 'var(--text-primary)',
  },
  timelineDate: {
    fontSize: '0.7rem',
    color: 'var(--text-muted)',
  },
  timelineText: {
    fontSize: '0.85rem',
    margin: 0,
    color: '#334155',
    lineHeight: 1.4,
  },
  deleteNoteBtn: {
    background: 'none',
    border: 'none',
    color: '#ef4444',
    fontSize: '0.7rem',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '0.4rem',
    padding: 0,
  },
  monitoringLayout: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  tableWrapper: {
    overflowX: 'auto',
    backgroundColor: '#fff',
    border: '1px solid var(--border-color)',
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
    color: 'var(--text-muted)',
  },
  badgeActive: {
    fontSize: '0.7rem',
    fontWeight: '700',
    backgroundColor: '#dcfce7',
    color: '#15803d',
    padding: '0.15rem 0.5rem',
    borderRadius: '4px',
  },
  badgeIdle: {
    fontSize: '0.7rem',
    fontWeight: '600',
    backgroundColor: '#f1f5f9',
    color: '#64748b',
    padding: '0.15rem 0.5rem',
    borderRadius: '4px',
  },
  monitorBtn: {
    padding: '0.35rem 0.75rem',
    fontSize: '0.75rem',
    fontWeight: '700',
    backgroundColor: '#8b5cf6',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  backBtn: {
    padding: '0.4rem 0.8rem',
    fontSize: '0.75rem',
    fontWeight: '600',
    backgroundColor: '#f1f5f9',
    color: '#475569',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  addHourBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.3rem',
    marginTop: '0.75rem',
    padding: '0.4rem 0.8rem',
    fontSize: '0.75rem',
    fontWeight: '700',
    backgroundColor: '#ede9fe',
    color: '#6d28d9',
    border: '1px solid #ddd6fe',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  actionDeleteBtn: {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#ef4444',
    cursor: 'pointer',
  },
  complicationsSection: {
    marginTop: '1.25rem',
    backgroundColor: '#f8fafc',
    padding: '1rem',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
  },
  complicationsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '0.5rem',
  },
  compLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    fontSize: '0.8rem',
    color: '#334155',
    cursor: 'pointer',
  },
  formFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.5rem',
    borderTop: '1px solid var(--border-color)',
    paddingTop: '1rem',
    marginTop: '1rem',
  }
};
