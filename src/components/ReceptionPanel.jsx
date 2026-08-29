import React, { useState, useEffect, useMemo } from 'react';
import { dbService } from '../firebase';
import { useUnit } from '../contexts/UnitContext';
import UnitSelector from './common/UnitSelector';
import { 
  Plus, Search, Edit2, Trash2, User, Calendar, 
  Check, X, FileText, CheckCircle2, AlertCircle, 
  MapPin, Clock, Armchair, AlertTriangle, ShieldCheck,
  UserCheck, RefreshCw, Phone, MessageSquare, Heart,
  Activity, ShieldAlert, Sparkles, Send, Building2,
  Droplets, Stethoscope, ChevronRight, ExternalLink
} from 'lucide-react';

export default function ReceptionPanel() {
  const { activeUnitId, filterByActiveUnit, matchItemUnit } = useUnit();
  const [activeTab, setActiveTab] = useState('checkin'); // 'checkin' | 'patients' | 'grid' | 'ronda'
  const [patients, setPatients] = useState([]);
  const [checkins, setCheckins] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [accessTypes, setAccessTypes] = useState([]);
  const [dialysisFrequencies, setDialysisFrequencies] = useState([]);
  const [medicalSchedules, setMedicalSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [cepLoading, setCepLoading] = useState(false);

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterShift, setFilterShift] = useState('');
  const [filterRoom, setFilterRoom] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Modal State
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [patientModalTab, setPatientModalTab] = useState('identificacao'); 
  // 'identificacao' | 'contatos' | 'convenio' | 'logistica' | 'nefrologia' | 'transplante'
  const [editingPatient, setEditingPatient] = useState(null);

  // Unified Form State
  const defaultPatientForm = {
    // 1. Identificação
    name: '',
    socialName: '',
    gender: 'Masculino',
    birthDate: '',
    cpf: '',
    rg: '',
    rgIssuer: 'SSP/MG',
    cns: '',
    motherName: '',
    fatherName: '',
    maritalStatus: 'Casado(a)',
    race: 'Branca',
    patientType: 'Crônico',
    treatmentStatus: 'Ativo',
    photo: '',

    // 2. Contatos & Endereço
    cep: '',
    address: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: 'Betim',
    state: 'MG',
    referencePoint: '',
    phone: '',
    email: '',
    contacts: [],

    // 3. Convênio & APAC
    insurance: 'SUS',
    insuranceNumber: '',
    insurancePlan: '',
    insuranceExpiry: '',
    apacNumber: '',
    apacExpiry: '',
    protocolNumber: '',

    // 4. Logística de Diálise
    treatmentType: 'HD',
    dialysisFrequency: '3x por semana (Seg/Qua/Sex)',
    shift: '1º Turno',
    room: 'Salão 1',
    chairNumber: '1',
    dryWeight: '',
    accessType: 'Fístula Arteriovenosa',
    accessSide: 'MSE (Membro Superior Esquerdo)',
    attendingDoctor: '',

    // 5. Nefrologia & Admissão
    originType: 'Novo',
    originCenter: '',
    firstDialysisDate: '',
    firstDialysisType: 'Eletiva',
    firstDialysisLocation: 'Hospital',
    admissionDate: new Date().toISOString().substring(0, 10),
    primaryDiagnosis: 'N18.0 - Doença Renal Terminal',
    bloodType: 'O',
    rhFactor: 'Positivo',
    allergies: 'Nenhuma conhecida',
    diabetes: 'Não',
    diabetesMeds: 'Sem medicação',
    has: 'Sim',
    cardiopathy: 'Não',
    smoking: 'Não',
    alcohol: 'Não',

    // 6. Transplante Renal
    transplantEligible: 'Em avaliação',
    transplantStatus: 'Admissão recente (< 90 dias)',
    transplantCenter: 'Hospital do Rim / Santa Casa',
    transplantRbtNumber: '',
    donorType: 'Doador Falecido',
    pregnancies: 0,
    births: 0,
    abortions: 0,
    transfusions: 0,
    transplantNotes: ''
  };

  const [patientForm, setPatientForm] = useState(defaultPatientForm);

  // Checkin Modal State
  const [showCheckinModal, setShowCheckinModal] = useState(false);
  const [selectedPatientForCheckin, setSelectedPatientForCheckin] = useState(null);
  const [checkinForm, setCheckinForm] = useState({
    preWeight: '',
    systolicBP: '120',
    diastolicBP: '80',
    temperature: '36.5',
    notes: ''
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [pList, cList, sList, rList, aList, dList, mList] = await Promise.all([
        dbService.getPatients(),
        dbService.getCheckins(),
        dbService.getShifts(),
        dbService.getRooms(),
        dbService.getAccessTypes(),
        dbService.getDialysisFrequencies(),
        dbService.getMedicalSchedules ? dbService.getMedicalSchedules() : []
      ]);

      setPatients(pList || []);
      setCheckins(cList || []);
      setShifts(sList || []);
      setRooms(rList || []);
      setAccessTypes(aList || []);
      setDialysisFrequencies(dList || []);
      setMedicalSchedules(mList || []);

      if (sList.length > 0) setPatientForm(f => ({ ...f, shift: sList[0].name }));
      if (rList.length > 0) setPatientForm(f => ({ ...f, room: rList[0].name }));
      if (aList.length > 0) setPatientForm(f => ({ ...f, accessType: aList[0].name }));
      if (dList.length > 0) setPatientForm(f => ({ ...f, dialysisFrequency: dList[0].name }));
    } catch (err) {
      console.error(err);
      showAlert('Erro ao carregar dados operacionais da recepção.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleMedicalCheckin = async (scheduleId, status, notes = '') => {
    try {
      await dbService.recordMedicalCheckin(scheduleId, status, 'Recepção Central', notes);
      showAlert(`Presença médica atualizada: ${status}!`, 'success');
      const updatedSchedules = await dbService.getMedicalSchedules();
      setMedicalSchedules(updatedSchedules || []);
    } catch (err) {
      console.error(err);
      showAlert('Erro ao registrar presença médica.', 'danger');
    }
  };

  const showAlert = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 5000);
  };

  // ----------------------------------------------------
  // Patients Management Methods
  // ----------------------------------------------------
  const handleOpenAddModal = () => {
    setEditingPatient(null);
    setPatientModalTab('identificacao');
    setPatientForm({
      ...defaultPatientForm,
      dialysisFrequency: dialysisFrequencies[0]?.name || '3x por semana (Seg/Qua/Sex)',
      shift: shifts[0]?.name || '1º Turno',
      room: rooms[0]?.name || 'Salão 1',
      accessType: accessTypes[0]?.name || 'Fístula Arteriovenosa'
    });
    setShowPatientModal(true);
  };

  const handleOpenEditModal = (patient) => {
    setEditingPatient(patient);
    setPatientModalTab('identificacao');
    setPatientForm({
      ...defaultPatientForm,
      ...patient,
      contacts: patient.contacts || []
    });
    setShowPatientModal(true);
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        return showAlert('A foto deve ter no máximo 1MB.', 'warning');
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPatientForm(prev => ({ ...prev, photo: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFetchCep = async () => {
    const rawCep = (patientForm.cep || '').replace(/\D/g, '');
    if (rawCep.length !== 8) {
      return showAlert('Informe um CEP válido com 8 dígitos.', 'warning');
    }

    setCepLoading(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${rawCep}/json/`);
      const data = await res.json();
      if (data.erro) {
        showAlert('CEP não encontrado na base dos Correios.', 'warning');
      } else {
        setPatientForm(prev => ({
          ...prev,
          address: data.logradouro || prev.address,
          neighborhood: data.bairro || prev.neighborhood,
          city: data.localidade || prev.city,
          state: data.uf || prev.state
        }));
        showAlert('Endereço preenchido automaticamente!', 'success');
      }
    } catch (err) {
      console.error(err);
      showAlert('Não foi possível consultar o CEP no momento.', 'warning');
    } finally {
      setCepLoading(false);
    }
  };

  const handleAddContact = () => {
    setPatientForm(prev => ({
      ...prev,
      contacts: [...(prev.contacts || []), { name: '', relationship: 'Filho(a)', phone: '', notes: '' }]
    }));
  };

  const handleRemoveContact = (index) => {
    setPatientForm(prev => ({
      ...prev,
      contacts: (prev.contacts || []).filter((_, idx) => idx !== index)
    }));
  };

  const handleContactChange = (index, field, value) => {
    setPatientForm(prev => {
      const updated = [...(prev.contacts || [])];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, contacts: updated };
    });
  };

  // Filtragem de Dados pela Unidade Ativa
  const currentPatients = useMemo(() => filterByActiveUnit(patients), [patients, activeUnitId]);
  const currentCheckins = useMemo(() => filterByActiveUnit(checkins), [checkins, activeUnitId]);
  const currentMedicalSchedules = useMemo(() => filterByActiveUnit(medicalSchedules), [medicalSchedules, activeUnitId]);

  const handleSavePatient = async (e) => {
    e.preventDefault();
    if (!patientForm.name || !patientForm.cpf || !patientForm.birthDate) {
      return showAlert('Nome, CPF e Nascimento são obrigatórios.', 'warning');
    }

    setActionLoading(true);
    try {
      const targetUnitId = activeUnitId === 'all' ? 'betim' : activeUnitId;
      const targetUnit = targetUnitId === 'taguatinga' ? 'Taguatinga' : 'Betim';

      const dataToSave = {
        ...patientForm,
        dryWeight: patientForm.dryWeight ? parseFloat(patientForm.dryWeight) : 0,
        unitId: targetUnitId,
        unit: targetUnit
      };

      if (editingPatient) {
        await dbService.updatePatient(editingPatient.id, dataToSave);
        showAlert('Paciente atualizado com sucesso!', 'success');
      } else {
        await dbService.createPatient(dataToSave);
        showAlert('Paciente admitido com sucesso!', 'success');
      }
      setShowPatientModal(false);
      fetchInitialData();
    } catch (err) {
      showAlert(err.message || 'Erro ao salvar paciente.', 'danger');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeletePatient = async (id) => {
    if (!window.confirm('Tem certeza de que deseja excluir este paciente? Esta ação não pode ser desfeita.')) {
      return;
    }
    try {
      await dbService.deletePatient(id);
      showAlert('Paciente excluído com sucesso.', 'success');
      fetchInitialData();
    } catch (err) {
      showAlert('Erro ao excluir paciente.', 'danger');
    }
  };

  // ----------------------------------------------------
  // Check-in Methods
  // ----------------------------------------------------
  const handleOpenCheckinModal = (patient) => {
    setSelectedPatientForCheckin(patient);
    setCheckinForm({
      preWeight: patient.dryWeight ? patient.dryWeight.toString() : '',
      systolicBP: '120',
      diastolicBP: '80',
      temperature: '36.5',
      notes: ''
    });
    setShowCheckinModal(true);
  };

  const handleSaveCheckin = async (e) => {
    e.preventDefault();
    if (!selectedPatientForCheckin) return;

    setActionLoading(true);
    try {
      const targetUnitId = activeUnitId === 'all' ? 'betim' : activeUnitId;
      const targetUnit = targetUnitId === 'taguatinga' ? 'Taguatinga' : 'Betim';
      const todayDate = new Date().toISOString().substring(0, 10);
      const preWeightNum = parseFloat(checkinForm.preWeight) || 0;
      const dryWeightNum = parseFloat(selectedPatientForCheckin.dryWeight) || 0;
      const weightGain = (preWeightNum > 0 && dryWeightNum > 0) ? (preWeightNum - dryWeightNum).toFixed(2) : '0.00';

      await dbService.saveCheckin({
        patientId: selectedPatientForCheckin.id,
        patientName: selectedPatientForCheckin.name,
        date: todayDate,
        preWeight: preWeightNum,
        dryWeight: dryWeightNum,
        weightGain: parseFloat(weightGain),
        bp: `${checkinForm.systolicBP}/${checkinForm.diastolicBP}`,
        temperature: parseFloat(checkinForm.temperature) || 36.5,
        shift: selectedPatientForCheckin.shift || '1º Turno',
        room: selectedPatientForCheckin.room || 'Salão 1',
        chairNumber: selectedPatientForCheckin.chairNumber || '1',
        accessType: selectedPatientForCheckin.accessType || 'Fístula Arteriovenosa',
        unitId: targetUnitId,
        unit: targetUnit,
        notes: checkinForm.notes || ''
      });

      showAlert(`Check-in de ${selectedPatientForCheckin.name} registrado com sucesso!`, 'success');
      setShowCheckinModal(false);
      fetchInitialData();
    } catch (err) {
      showAlert('Erro ao realizar check-in.', 'danger');
    } finally {
      setActionLoading(false);
    }
  };

  // ----------------------------------------------------
  // Helper calculations & filters
  // ----------------------------------------------------
  const calculateAge = (birthDate) => {
    if (!birthDate) return '-';
    const diff = Date.now() - new Date(birthDate).getTime();
    const ageDate = new Date(diff);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  const getTodayWeekday = () => {
    const day = new Date().getDay();
    // 0: Sunday, 1: Mon, 2: Tue, 3: Wed, 4: Thu, 5: Fri, 6: Sat
    if ([1, 3, 5].includes(day)) return 'Seg/Qua/Sex';
    if ([2, 4, 6].includes(day)) return 'Ter/Qui/Sáb';
    return 'Seg/Qua/Sex';
  };

  const todayScheduleFilter = getTodayWeekday();

  const getFilteredPatients = () => {
    return currentPatients.filter(p => {
      const matchesSearch = (p.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (p.cpf || '').includes(searchTerm) ||
                            (p.cns || '').includes(searchTerm) ||
                            (p.chairNumber || '').toString() === searchTerm;
      const matchesShift = filterShift ? p.shift === filterShift : true;
      const matchesRoom = filterRoom ? p.room === filterRoom : true;
      const matchesStatus = filterStatus ? p.treatmentStatus === filterStatus : true;
      return matchesSearch && matchesShift && matchesRoom && matchesStatus;
    });
  };

  const getPatientsForToday = () => {
    return currentPatients.filter(p => {
      const matchesFrequency = (p.dialysisFrequency || '').includes(todayScheduleFilter) || p.dialysisFrequency === 'Diário';
      const isActive = p.treatmentStatus === 'Ativo';
      
      const matchesSearch = (p.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                            (p.cpf || '').includes(searchTerm) ||
                            (p.chairNumber || '').toString() === searchTerm;
      const matchesShift = filterShift ? p.shift === filterShift : true;
      const matchesRoom = filterRoom ? p.room === filterRoom : true;

      return matchesFrequency && isActive && matchesSearch && matchesShift && matchesRoom;
    });
  };

  const getCheckinForPatientToday = (patientId) => {
    const todayDate = new Date().toISOString().substring(0, 10);
    return currentCheckins.find(c => c.patientId === patientId && c.date === todayDate);
  };

  const getApacStatus = (expiryDate) => {
    if (!expiryDate) return { text: 'Pendente', color: '#64748b', bg: '#f1f5f9', isWarning: false };
    const expiry = new Date(expiryDate);
    const today = new Date();
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { text: 'Vencida', color: '#b91c1c', bg: '#fee2e2', isWarning: true };
    }
    if (diffDays <= 30) {
      return { text: `Vence ${diffDays}d`, color: '#b45309', bg: '#fef3c7', isWarning: true };
    }
    return { text: 'Regular', color: '#15803d', bg: '#dcfce7', isWarning: false };
  };

  const openWhatsApp = (phone, name = '') => {
    if (!phone) {
      return showAlert('Paciente sem telefone cadastrado.', 'warning');
    }
    const cleanPhone = phone.replace(/\D/g, '');
    const fullNumber = cleanPhone.length <= 11 ? `55${cleanPhone}` : cleanPhone;
    const message = encodeURIComponent(`Olá ${name ? name : ''}, entramos em contato da recepção da clínica de nefrologia referente ao seu agendamento de diálise.`);
    window.open(`https://wa.me/${fullNumber}?text=${message}`, '_blank');
  };

  const filteredPatients = getFilteredPatients();
  const todayPatients = getPatientsForToday();

  // Chair distribution grid generator
  const maxChairs = 12;
  const renderRoomGrid = (roomName) => {
    return (
      <div key={roomName} style={styles.roomSection}>
        <div style={styles.roomHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MapPin size={18} color="var(--primary-color)" />
            <h3 style={styles.roomTitle}>{roomName}</h3>
          </div>
          <span style={styles.roomBadge}>Capacidade: {maxChairs} Poltronas</span>
        </div>
        
        <div style={styles.gridContainer}>
          {shifts.map(sh => {
            const roomShiftPatients = currentPatients.filter(
              p => p.room === roomName && p.shift === sh.name && p.treatmentStatus === 'Ativo'
            );

            return (
              <div key={sh.name} style={styles.shiftCol}>
                <div style={styles.shiftColHeader}>
                  <Clock size={14} color="#64748b" />
                  <h4 style={styles.shiftColTitle}>{sh.name}</h4>
                  <span style={styles.shiftOccupancyBadge}>
                    {roomShiftPatients.length}/{maxChairs}
                  </span>
                </div>
                
                <div style={styles.seatsGrid}>
                  {Array.from({ length: maxChairs }).map((_, idx) => {
                    const chairNum = (idx + 1).toString();
                    const pat = roomShiftPatients.find(p => p.chairNumber === chairNum);
                    const checkin = pat ? getCheckinForPatientToday(pat.id) : null;

                    return (
                      <div 
                        key={chairNum} 
                        style={{
                          ...styles.seatCard,
                          ...(pat ? styles.seatOccupied : styles.seatEmpty),
                          ...(checkin ? styles.seatCheckedIn : {})
                        }}
                        title={pat ? `${pat.name} - Poltrona ${chairNum}` : `Poltrona ${chairNum} Livre`}
                      >
                        <div style={styles.seatHeader}>
                          <Armchair size={15} color={pat ? (checkin ? '#059669' : '#0284c7') : '#94a3b8'} />
                          <span style={styles.seatNum}>#{chairNum}</span>
                        </div>
                        {pat ? (
                          <div style={styles.seatBody}>
                            <div style={styles.seatPatName}>
                              {pat.name.split(' ')[0]} {pat.name.split(' ').slice(-1)[0]}
                            </div>
                            <span style={styles.seatAccessBadge}>
                              {pat.accessType ? pat.accessType.substring(0, 10) : 'FAV'}
                            </span>
                            {checkin ? (
                              <span style={styles.seatStatusActive}>Presente</span>
                            ) : (
                              <span style={styles.seatStatusPending}>Pendente</span>
                            )}
                          </div>
                        ) : (
                          <div style={styles.seatFreeLabel}>Livre</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // KPIs
  const checkedInTodayCount = todayPatients.filter(p => getCheckinForPatientToday(p.id)).length;
  const pendingTodayCount = todayPatients.length - checkedInTodayCount;
  const apacWarningCount = currentPatients.filter(p => getApacStatus(p.apacExpiry).isWarning).length;

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.cardHeader}>
        <div>
          <h1 style={styles.title}>NexaCLINIC — Recepção</h1>
          <p style={styles.subtitle}>
            Admissão completa de pacientes, regulação APAC, controle de presença diário e alocação de poltronas.
          </p>
        </div>
        <UnitSelector compact showLabel={false} />
      </div>

      {/* KPI Cards Row */}
      <div style={styles.kpiRow}>
        <div style={styles.kpiCard}>
          <div style={styles.kpiIconWrap}>
            <Calendar size={20} color="var(--primary-color)" />
          </div>
          <div>
            <span style={styles.kpiLabel}>Agendados</span>
            <div style={styles.kpiValue}>{todayPatients.length}</div>
            <span style={styles.kpiSub}>Escala {todayScheduleFilter}</span>
          </div>
        </div>

        <div style={{ ...styles.kpiCard, borderLeft: '4px solid #10b981' }}>
          <div style={{ ...styles.kpiIconWrap, backgroundColor: '#ecfdf5' }}>
            <CheckCircle2 size={20} color="#10b981" />
          </div>
          <div>
            <span style={styles.kpiLabel}>Presentes</span>
            <div style={{ ...styles.kpiValue, color: '#10b981' }}>{checkedInTodayCount}</div>
            <span style={styles.kpiSub}>Check-in realizado</span>
          </div>
        </div>

        <div style={{ ...styles.kpiCard, borderLeft: '4px solid #f59e0b' }}>
          <div style={{ ...styles.kpiIconWrap, backgroundColor: '#fef3c7' }}>
            <Clock size={20} color="#d97706" />
          </div>
          <div>
            <span style={styles.kpiLabel}>Pendentes</span>
            <div style={{ ...styles.kpiValue, color: '#d97706' }}>{pendingTodayCount}</div>
            <span style={styles.kpiSub}>Aguardando entrada</span>
          </div>
        </div>

        <div style={{ ...styles.kpiCard, borderLeft: '4px solid #ef4444' }}>
          <div style={{ ...styles.kpiIconWrap, backgroundColor: '#fee2e2' }}>
            <ShieldAlert size={20} color="#ef4444" />
          </div>
          <div>
            <span style={styles.kpiLabel}>APACs</span>
            <div style={{ ...styles.kpiValue, color: '#ef4444' }}>{apacWarningCount}</div>
            <span style={styles.kpiSub}>A vencer ou vencidas</span>
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div style={styles.tabsWrapper}>
        <button 
          onClick={() => setActiveTab('checkin')} 
          style={{ ...styles.tabBtn, ...(activeTab === 'checkin' ? styles.tabBtnActive : {}) }}
        >
          <CheckCircle2 size={16} /> Presença ({checkedInTodayCount}/{todayPatients.length})
        </button>
        <button 
          onClick={() => setActiveTab('patients')} 
          style={{ ...styles.tabBtn, ...(activeTab === 'patients' ? styles.tabBtnActive : {}) }}
        >
          <User size={16} /> Pacientes ({currentPatients.length})
        </button>
        <button 
          onClick={() => setActiveTab('grid')} 
          style={{ ...styles.tabBtn, ...(activeTab === 'grid' ? styles.tabBtnActive : {}) }}
        >
          <Armchair size={16} /> Poltronas
        </button>
        <button 
          onClick={() => setActiveTab('ronda')} 
          style={{ ...styles.tabBtn, ...(activeTab === 'ronda' ? styles.tabBtnActive : {}) }}
        >
          <UserCheck size={16} /> Ronda
        </button>
      </div>

      {/* Message feedback */}
      {message.text && (
        <div style={{ ...styles.alert, backgroundColor: message.type === 'danger' ? '#fee2e2' : message.type === 'warning' ? '#fef3c7' : '#ecfdf5' }}>
          <AlertCircle size={18} color={message.type === 'danger' ? '#dc2626' : message.type === 'warning' ? '#d97706' : '#16a34a'} />
          <span style={{ color: message.type === 'danger' ? '#dc2626' : message.type === 'warning' ? '#d97706' : '#16a34a', fontWeight: '700' }}>
            {message.text}
          </span>
        </div>
      )}

      {/* Filters Bar */}
      {activeTab !== 'grid' && (
        <div style={styles.filtersBar}>
          <div style={styles.searchWrapper}>
            <Search size={18} style={styles.searchIcon} />
            <input 
              type="text" 
              placeholder="Pesquisar por paciente, CPF, CNS ou poltrona..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
          </div>
          <div style={styles.selectsWrapper}>
            <select value={filterShift} onChange={e => setFilterShift(e.target.value)} style={styles.filterSelect}>
              <option value="">Turnos</option>
              {shifts.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
            </select>
            <select value={filterRoom} onChange={e => setFilterRoom(e.target.value)} style={styles.filterSelect}>
              <option value="">Salas</option>
              {rooms.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
            </select>
            {activeTab === 'patients' && (
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={styles.filterSelect}>
                <option value="">Status</option>
                <option value="Ativo">Ativo</option>
                <option value="Suspenso">Suspenso</option>
                <option value="Em Trânsito">Em Trânsito</option>
                <option value="Transplantado">Transplantado</option>
                <option value="Óbito">Óbito</option>
              </select>
            )}
          </div>
          {activeTab === 'patients' && (
            <button onClick={handleOpenAddModal} style={styles.addBtn}>
              <Plus size={16} /> Admissão
            </button>
          )}
        </div>
      )}

      {loading ? (
        <div style={styles.loadingBox}>Carregando recepção...</div>
      ) : (
        <>
          {/* TAB 1: Daily Check-in */}
          {activeTab === 'checkin' && (
            <div style={styles.tabContent}>
              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th>Paciente</th>
                      <th>Documento</th>
                      <th>Turno</th>
                      <th>Sala</th>
                      <th>Poltrona</th>
                      <th>Acesso</th>
                      <th>APAC</th>
                      <th>Presença</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {todayPatients.length === 0 ? (
                      <tr>
                        <td colSpan="9" style={styles.noDataCell}>Nenhum paciente agendado ou encontrado para os filtros atuais.</td>
                      </tr>
                    ) : (
                      todayPatients.map(pat => {
                        const checkin = getCheckinForPatientToday(pat.id);
                        const apacInfo = getApacStatus(pat.apacExpiry);

                        return (
                          <tr key={pat.id} style={checkin ? styles.rowCheckedIn : {}}>
                            <td>
                              <div style={styles.patientCell}>
                                {pat.photo ? (
                                  <img src={pat.photo} alt={pat.name} style={styles.tablePhoto} />
                                ) : (
                                  <div style={styles.tablePhotoPlaceholder}>
                                    {pat.name.charAt(0)}
                                  </div>
                                )}
                                <div style={styles.patientNameBlock}>
                                  <span style={styles.patName}>{pat.name}</span>
                                  <span style={styles.motherName}>Mãe: {pat.motherName || 'Não informada'}</span>
                                </div>
                              </div>
                            </td>
                            <td>
                              <div style={styles.docCell}>
                                <span>{pat.cpf || '-'}</span>
                                {pat.cns && <small style={styles.cnsMuted}>CNS: {pat.cns}</small>}
                              </div>
                            </td>
                            <td><span style={styles.badgeShift}>{pat.shift}</span></td>
                            <td><span style={styles.badgeRoom}>{pat.room}</span></td>
                            <td style={{ fontWeight: '700', textAlign: 'center' }}>#{pat.chairNumber || '-'}</td>
                            <td>
                              <span style={styles.accessBadge}>{pat.accessType || 'FAV'}</span>
                            </td>
                            <td>
                              <span style={{ ...styles.apacBadge, color: apacInfo.color, backgroundColor: apacInfo.bg }}>
                                {apacInfo.text}
                              </span>
                            </td>
                            <td>
                              {checkin ? (
                                <div style={styles.checkinDoneBox}>
                                  <span style={styles.checkinDoneBadge}>✓ Presente</span>
                                  <span style={styles.checkinDetails}>
                                    PA: {checkin.bp} | Peso: {checkin.preWeight}kg
                                  </span>
                                  {checkin.weightGain > 0 && (
                                    <span style={{ 
                                      fontSize: '0.7rem', 
                                      fontWeight: '700', 
                                      color: checkin.weightGain >= 4 ? '#dc2626' : '#d97706' 
                                    }}>
                                      Ganho: +{checkin.weightGain}kg
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <button onClick={() => handleOpenCheckinModal(pat)} style={styles.checkinBtn}>
                                  Registrar
                                </button>
                              )}
                            </td>
                            <td>
                              <div style={styles.actionButtons}>
                                <button 
                                  onClick={() => openWhatsApp(pat.phone, pat.name)} 
                                  style={styles.actionWhatsBtn} 
                                  title="Enviar mensagem no WhatsApp"
                                >
                                  <MessageSquare size={14} />
                                </button>
                                <button 
                                  onClick={() => handleOpenEditModal(pat)} 
                                  style={styles.actionEditBtn} 
                                  title="Editar cadastro"
                                >
                                  <Edit2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: Patients List */}
          {activeTab === 'patients' && (
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th>Paciente</th>
                    <th>Documento</th>
                    <th>Nascimento</th>
                    <th>Convênio</th>
                    <th>Frequência</th>
                    <th>Acesso</th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPatients.length === 0 ? (
                    <tr>
                      <td colSpan="8" style={styles.noDataCell}>Nenhum paciente cadastrado para os filtros atuais.</td>
                    </tr>
                  ) : (
                    filteredPatients.map(pat => {
                      const apacInfo = getApacStatus(pat.apacExpiry);
                      const age = calculateAge(pat.birthDate);
                      return (
                        <tr key={pat.id}>
                          <td>
                            <div style={styles.patientCell}>
                              {pat.photo ? (
                                <img src={pat.photo} alt={pat.name} style={styles.tablePhoto} />
                              ) : (
                                <div style={styles.tablePhotoPlaceholder}>
                                  {pat.name.charAt(0)}
                                </div>
                              )}
                              <div style={styles.patientNameBlock}>
                                <span style={styles.patName}>{pat.name}</span>
                                <span style={styles.phoneLabel}>☎ {pat.phone || 'Sem telefone'}</span>
                                {pat.contacts && pat.contacts.length > 0 && (
                                  <span style={styles.contactsSummary}>
                                    Recado ({pat.contacts[0].relationship}): {pat.contacts[0].name}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td>
                            <div style={styles.docCell}>
                              <span style={styles.cpfLabel}>{pat.cpf || '-'}</span>
                              <small style={styles.cnsMuted}>CNS: {pat.cns || '-'}</small>
                            </div>
                          </td>
                          <td>
                            <span>{pat.birthDate ? new Date(pat.birthDate).toLocaleDateString('pt-BR') : '-'}</span>
                            <small style={styles.ageMuted}> ({age} anos)</small>
                          </td>
                          <td>
                            <div style={styles.insuranceCell}>
                              <span style={styles.insuranceBadge}>{pat.insurance || 'SUS'}</span>
                              {pat.apacNumber && (
                                <span style={{ ...styles.apacBadge, color: apacInfo.color, backgroundColor: apacInfo.bg, marginTop: '2px' }}>
                                  APAC: {apacInfo.text}
                                </span>
                              )}
                            </div>
                          </td>
                          <td>{pat.dialysisFrequency || 'Seg/Qua/Sex'}</td>
                          <td><span style={styles.accessBadge}>{pat.accessType || 'FAV'}</span></td>
                          <td>
                            <span style={{
                              fontSize: '0.75rem',
                              fontWeight: '700',
                              padding: '0.2rem 0.6rem',
                              borderRadius: '6px',
                              backgroundColor: pat.treatmentStatus === 'Ativo' ? '#dcfce7' : '#fee2e2',
                              color: pat.treatmentStatus === 'Ativo' ? '#15803d' : '#b91c1c'
                            }}>
                              {pat.treatmentStatus || 'Ativo'}
                            </span>
                          </td>
                          <td>
                            <div style={styles.actionButtons}>
                              <button 
                                onClick={() => openWhatsApp(pat.phone, pat.name)} 
                                style={styles.actionWhatsBtn} 
                                title="Conversar no WhatsApp"
                              >
                                <MessageSquare size={14} />
                              </button>
                              <button 
                                onClick={() => handleOpenEditModal(pat)} 
                                style={styles.actionEditBtn} 
                                title="Editar cadastro"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button 
                                onClick={() => handleDeletePatient(pat.id)} 
                                style={styles.actionDeleteBtn} 
                                title="Excluir cadastro"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 3: Chairs Grid */}
          {activeTab === 'grid' && (
            <div style={styles.gridTabsContent}>
              {rooms.map(room => renderRoomGrid(room.name))}
            </div>
          )}

          {/* TAB 4: Medical Shift Round (Ronda Médica) */}
          {activeTab === 'ronda' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800', color: '#0f172a' }}>
                      Ronda Médica Presencial
                    </h3>
                    <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                      Auditoria de presença dos médicos nefrologistas em cada salão e turno hoje ({new Date().toLocaleDateString('pt-BR')}).
                    </p>
                  </div>
                  <span style={{ fontSize: '0.8rem', fontWeight: '800', backgroundColor: '#eff6ff', color: '#1e40af', padding: '0.3rem 0.75rem', borderRadius: '6px', border: '1px solid #bfdbfe' }}>
                    Auditoria
                  </span>
                </div>

                {medicalSchedules.filter(s => s.date === new Date().toISOString().substring(0, 10)).length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#94a3b8' }}>
                    Nenhum plantão médico programado para a data de hoje.
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
                    {medicalSchedules
                      .filter(s => s.date === new Date().toISOString().substring(0, 10))
                      .map(sch => {
                        const isPresent = sch.checkinStatus === 'Presente';
                        const isLate = sch.checkinStatus === 'Atraso';
                        const isAbsent = sch.checkinStatus === 'Ausente';
                        const isReplaced = sch.checkinStatus === 'Substituído';

                        return (
                          <div 
                            key={sch.id}
                            style={{
                              backgroundColor: '#f8fafc',
                              border: '1px solid #e2e8f0',
                              borderRadius: '10px',
                              padding: '1rem',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '0.75rem'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <div>
                                <span style={{ fontSize: '0.7rem', fontWeight: '800', backgroundColor: '#e2e8f0', color: '#334155', padding: '0.15rem 0.45rem', borderRadius: '4px' }}>
                                  {sch.sector} • {sch.shift}
                                </span>
                                <h4 style={{ margin: '0.35rem 0 0 0', fontSize: '0.95rem', fontWeight: '800', color: '#0f172a' }}>
                                  {sch.doctorName}
                                </h4>
                                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                  CRM: {sch.doctorCrm || '-'}
                                </span>
                              </div>

                              <div>
                                {isPresent ? (
                                  <span style={{ fontSize: '0.7rem', fontWeight: '800', backgroundColor: '#dcfce7', color: '#166534', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                                    ✓ Presente ({sch.checkinTime})
                                  </span>
                                ) : isLate ? (
                                  <span style={{ fontSize: '0.7rem', fontWeight: '800', backgroundColor: '#fef9c3', color: '#854d0e', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                                    ⚠ Atraso ({sch.checkinTime})
                                  </span>
                                ) : isAbsent ? (
                                  <span style={{ fontSize: '0.7rem', fontWeight: '800', backgroundColor: '#fee2e2', color: '#991b1b', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                                    ✕ Ausente
                                  </span>
                                ) : isReplaced ? (
                                  <span style={{ fontSize: '0.7rem', fontWeight: '800', backgroundColor: '#ede9fe', color: '#6d28d9', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                                    🔄 Substituído
                                  </span>
                                ) : (
                                  <span style={{ fontSize: '0.7rem', fontWeight: '700', backgroundColor: '#f1f5f9', color: '#94a3b8', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                                    Pendente
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Ronda Buttons */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.35rem' }}>
                              <button
                                type="button"
                                onClick={() => handleMedicalCheckin(sch.id, 'Presente')}
                                style={{
                                  padding: '0.4rem 0.2rem',
                                  fontSize: '0.7rem',
                                  fontWeight: '700',
                                  backgroundColor: isPresent ? '#166534' : '#dcfce7',
                                  color: isPresent ? '#fff' : '#166534',
                                  border: 'none',
                                  borderRadius: '6px',
                                  cursor: 'pointer'
                                }}
                              >
                                ✓ Presente
                              </button>

                              <button
                                type="button"
                                onClick={() => handleMedicalCheckin(sch.id, 'Atraso')}
                                style={{
                                  padding: '0.4rem 0.2rem',
                                  fontSize: '0.7rem',
                                  fontWeight: '700',
                                  backgroundColor: isLate ? '#854d0e' : '#fef9c3',
                                  color: isLate ? '#fff' : '#854d0e',
                                  border: 'none',
                                  borderRadius: '6px',
                                  cursor: 'pointer'
                                }}
                              >
                                ⚠ Atraso
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  const sub = prompt('Nome do médico substituto:');
                                  if (sub) handleMedicalCheckin(sch.id, 'Substituído', `Substituído por ${sub}`);
                                }}
                                style={{
                                  padding: '0.4rem 0.2rem',
                                  fontSize: '0.7rem',
                                  fontWeight: '700',
                                  backgroundColor: isReplaced ? '#6d28d9' : '#ede9fe',
                                  color: isReplaced ? '#fff' : '#6d28d9',
                                  border: 'none',
                                  borderRadius: '6px',
                                  cursor: 'pointer'
                                }}
                              >
                                🔄 Troca
                              </button>

                              <button
                                type="button"
                                onClick={() => handleMedicalCheckin(sch.id, 'Ausente', 'Não compareceu')}
                                style={{
                                  padding: '0.4rem 0.2rem',
                                  fontSize: '0.7rem',
                                  fontWeight: '700',
                                  backgroundColor: isAbsent ? '#991b1b' : '#fee2e2',
                                  color: isAbsent ? '#fff' : '#991b1b',
                                  border: 'none',
                                  borderRadius: '6px',
                                  cursor: 'pointer'
                                }}
                              >
                                ✕ Falta
                              </button>
                            </div>

                            {sch.notes && (
                              <div style={{ fontSize: '0.7rem', color: '#475569', backgroundColor: '#fff', padding: '0.35rem 0.5rem', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                                📝 {sch.notes}
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* Patient Intake / Admission Modal with Tabs */}
      {showPatientModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCardLarge}>
            <div style={styles.modalHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <User size={22} color="var(--primary-color)" />
                <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800' }}>
                  {editingPatient ? 'Ficha Cadastral do Paciente' : 'Admissão de Novo Paciente'}
                </h2>
              </div>
              <button onClick={() => setShowPatientModal(false)} style={styles.modalCloseBtn}><X size={20} /></button>
            </div>

            {/* Modal Internal Tabs */}
            <div style={styles.modalTabsBar}>
              <button
                type="button"
                onClick={() => setPatientModalTab('identificacao')}
                style={{ ...styles.modalTabItem, ...(patientModalTab === 'identificacao' ? styles.modalTabItemActive : {}) }}
              >
                1. Identificação
              </button>
              <button
                type="button"
                onClick={() => setPatientModalTab('contatos')}
                style={{ ...styles.modalTabItem, ...(patientModalTab === 'contatos' ? styles.modalTabItemActive : {}) }}
              >
                2. Contatos
              </button>
              <button
                type="button"
                onClick={() => setPatientModalTab('convenio')}
                style={{ ...styles.modalTabItem, ...(patientModalTab === 'convenio' ? styles.modalTabItemActive : {}) }}
              >
                3. Convênio
              </button>
              <button
                type="button"
                onClick={() => setPatientModalTab('logistica')}
                style={{ ...styles.modalTabItem, ...(patientModalTab === 'logistica' ? styles.modalTabItemActive : {}) }}
              >
                4. Logística
              </button>
              <button
                type="button"
                onClick={() => setPatientModalTab('nefrologia')}
                style={{ ...styles.modalTabItem, ...(patientModalTab === 'nefrologia' ? styles.modalTabItemActive : {}) }}
              >
                5. Nefrologia
              </button>
              <button
                type="button"
                onClick={() => setPatientModalTab('transplante')}
                style={{ ...styles.modalTabItem, ...(patientModalTab === 'transplante' ? styles.modalTabItemActive : {}) }}
              >
                6. Transplante
              </button>
            </div>

            <form onSubmit={handleSavePatient} style={styles.modalForm}>
              <div style={styles.modalScrollableBody}>
                {/* TAB 1: Identificação */}
                {patientModalTab === 'identificacao' && (
                  <div style={styles.formSectionGroup}>
                    {/* Photo Upload Area */}
                    <div style={styles.photoUploadContainer}>
                      <div style={styles.photoPreviewWrapper}>
                        {patientForm.photo ? (
                          <img src={patientForm.photo} alt="Foto" style={styles.photoPreview} />
                        ) : (
                          <div style={styles.photoPlaceholder}>
                            <User size={32} color="var(--text-muted)" />
                          </div>
                        )}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#1e293b' }}>Foto do Paciente</span>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Formatos: JPG ou PNG (Máx 1MB).</span>
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={handlePhotoChange} 
                            style={{ display: 'none' }} 
                            id="patient-photo-file"
                          />
                          <label htmlFor="patient-photo-file" className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem', cursor: 'pointer', display: 'inline-block' }}>
                            Carregar Foto
                          </label>
                          {patientForm.photo && (
                            <button 
                              type="button" 
                              onClick={() => setPatientForm(f => ({ ...f, photo: '' }))} 
                              className="btn btn-danger" 
                              style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem' }}
                            >
                              Remover
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    <div style={styles.formGrid}>
                      <div className="form-group" style={{ gridColumn: 'span 2' }}>
                        <label>Nome Completo *</label>
                        <input 
                          type="text" className="form-control" placeholder="Nome Completo do Paciente"
                          value={patientForm.name} onChange={e => setPatientForm({ ...patientForm, name: e.target.value })} required
                        />
                      </div>
                      <div className="form-group">
                        <label>Nome Social</label>
                        <input 
                          type="text" className="form-control" placeholder="Nome social ou apelido"
                          value={patientForm.socialName} onChange={e => setPatientForm({ ...patientForm, socialName: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label>Nascimento *</label>
                        <input 
                          type="date" className="form-control"
                          value={patientForm.birthDate} onChange={e => setPatientForm({ ...patientForm, birthDate: e.target.value })} required
                        />
                      </div>
                      <div className="form-group">
                        <label>Gênero *</label>
                        <select 
                          className="form-control" value={patientForm.gender} 
                          onChange={e => setPatientForm({ ...patientForm, gender: e.target.value })}
                        >
                          <option value="Masculino">Masculino</option>
                          <option value="Feminino">Feminino</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Estado Civil</label>
                        <select 
                          className="form-control" value={patientForm.maritalStatus} 
                          onChange={e => setPatientForm({ ...patientForm, maritalStatus: e.target.value })}
                        >
                          <option value="Solteiro(a)">Solteiro(a)</option>
                          <option value="Casado(a)">Casado(a)</option>
                          <option value="Divorciado(a)">Divorciado(a)</option>
                          <option value="Viúvo(a)">Viúvo(a)</option>
                          <option value="União Estável">União Estável</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>CPF *</label>
                        <input 
                          type="text" className="form-control" placeholder="000.000.000-00"
                          value={patientForm.cpf} onChange={e => setPatientForm({ ...patientForm, cpf: e.target.value })} required
                        />
                      </div>
                      <div className="form-group">
                        <label>RG</label>
                        <input 
                          type="text" className="form-control" placeholder="MG-00.000.000"
                          value={patientForm.rg} onChange={e => setPatientForm({ ...patientForm, rg: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label>Órgão Emissor</label>
                        <input 
                          type="text" className="form-control" placeholder="SSP/MG"
                          value={patientForm.rgIssuer} onChange={e => setPatientForm({ ...patientForm, rgIssuer: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label>CNS (Cartão SUS - 15 Dígitos)</label>
                        <input 
                          type="text" className="form-control" placeholder="700000000000000"
                          value={patientForm.cns} onChange={e => setPatientForm({ ...patientForm, cns: e.target.value })}
                        />
                      </div>
                      <div className="form-group" style={{ gridColumn: 'span 2' }}>
                        <label>Nome da Mãe *</label>
                        <input 
                          type="text" className="form-control" placeholder="Nome Completo da Mãe (Obrigatório SUS)"
                          value={patientForm.motherName} onChange={e => setPatientForm({ ...patientForm, motherName: e.target.value })}
                        />
                      </div>
                      <div className="form-group" style={{ gridColumn: 'span 2' }}>
                        <label>Nome do Pai / Responsável Legal</label>
                        <input 
                          type="text" className="form-control" placeholder="Nome do pai ou responsável legal"
                          value={patientForm.fatherName} onChange={e => setPatientForm({ ...patientForm, fatherName: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label>Tipo do Paciente</label>
                        <select 
                          className="form-control" value={patientForm.patientType} 
                          onChange={e => setPatientForm({ ...patientForm, patientType: e.target.value })}
                        >
                          <option value="Crônico">Crônico</option>
                          <option value="Agudo">Agudo</option>
                          <option value="Trânsito">Trânsito</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Status</label>
                        <select 
                          className="form-control" value={patientForm.treatmentStatus} 
                          onChange={e => setPatientForm({ ...patientForm, treatmentStatus: e.target.value })}
                        >
                          <option value="Ativo">Ativo</option>
                          <option value="Suspenso">Suspenso</option>
                          <option value="Em Trânsito">Em Trânsito</option>
                          <option value="Transplantado">Transplantado</option>
                          <option value="Óbito">Óbito</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: Contatos & Endereço */}
                {patientModalTab === 'contatos' && (
                  <div style={styles.formSectionGroup}>
                    <h4 style={styles.subSectionTitle}>Endereço Residencial</h4>
                    <div style={styles.formGrid}>
                      <div className="form-group">
                        <label>CEP</label>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <input 
                            type="text" className="form-control" placeholder="32000-000"
                            value={patientForm.cep} onChange={e => setPatientForm({ ...patientForm, cep: e.target.value })}
                          />
                          <button 
                            type="button" 
                            onClick={handleFetchCep} 
                            disabled={cepLoading}
                            className="btn btn-secondary" 
                            style={{ padding: '0 0.8rem', fontSize: '0.75rem' }}
                          >
                            {cepLoading ? '...' : 'Buscar'}
                          </button>
                        </div>
                      </div>
                      <div className="form-group" style={{ gridColumn: 'span 2' }}>
                        <label>Logradouro (Rua / Avenida)</label>
                        <input 
                          type="text" className="form-control" placeholder="Rua, Avenida, Praça..."
                          value={patientForm.address} onChange={e => setPatientForm({ ...patientForm, address: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label>Número</label>
                        <input 
                          type="text" className="form-control" placeholder="123"
                          value={patientForm.number} onChange={e => setPatientForm({ ...patientForm, number: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label>Complemento</label>
                        <input 
                          type="text" className="form-control" placeholder="Apto, Bloco..."
                          value={patientForm.complement} onChange={e => setPatientForm({ ...patientForm, complement: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label>Bairro</label>
                        <input 
                          type="text" className="form-control" placeholder="Bairro"
                          value={patientForm.neighborhood} onChange={e => setPatientForm({ ...patientForm, neighborhood: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label>Cidade</label>
                        <input 
                          type="text" className="form-control" placeholder="Cidade"
                          value={patientForm.city} onChange={e => setPatientForm({ ...patientForm, city: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label>Estado (UF)</label>
                        <input 
                          type="text" className="form-control" placeholder="MG"
                          value={patientForm.state} onChange={e => setPatientForm({ ...patientForm, state: e.target.value })}
                        />
                      </div>
                      <div className="form-group" style={{ gridColumn: 'span 2' }}>
                        <label>Ponto de Referência</label>
                        <input 
                          type="text" className="form-control" placeholder="Próximo à praça ou posto de saúde"
                          value={patientForm.referencePoint} onChange={e => setPatientForm({ ...patientForm, referencePoint: e.target.value })}
                        />
                      </div>
                    </div>

                    <h4 style={{ ...styles.subSectionTitle, marginTop: '1.25rem' }}>Telefones & WhatsApp</h4>
                    <div style={styles.formGrid}>
                      <div className="form-group">
                        <label>Telefone Principal</label>
                        <input 
                          type="text" className="form-control" placeholder="(31) 99999-9999"
                          value={patientForm.phone} onChange={e => setPatientForm({ ...patientForm, phone: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label>E-mail</label>
                        <input 
                          type="email" className="form-control" placeholder="paciente@exemplo.com.br"
                          value={patientForm.email} onChange={e => setPatientForm({ ...patientForm, email: e.target.value })}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
                      <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '700', color: '#1e293b' }}>
                        Acompanhantes & Contatos de Emergência
                      </h4>
                      <button 
                        type="button" 
                        onClick={handleAddContact} 
                        className="btn btn-secondary" 
                        style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                      >
                        <Plus size={14} /> Adicionar
                      </button>
                    </div>

                    {(patientForm.contacts || []).length === 0 ? (
                      <p style={{ fontSize: '0.8rem', color: '#94a3b8', fontStyle: 'italic', padding: '0.75rem 0' }}>
                        Nenhum contato de emergência registrado. Clique em "+ Adicionar" para cadastrar familiares ou cuidadores.
                      </p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.75rem' }}>
                        {(patientForm.contacts || []).map((contact, idx) => (
                          <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1.5fr auto', gap: '0.5rem', alignItems: 'center', backgroundColor: '#f8fafc', padding: '0.5rem', borderRadius: '8px' }}>
                            <input 
                              type="text" className="form-control" placeholder="Nome do familiar"
                              value={contact.name} onChange={e => handleContactChange(idx, 'name', e.target.value)}
                            />
                            <select 
                              className="form-control" value={contact.relationship}
                              onChange={e => handleContactChange(idx, 'relationship', e.target.value)}
                            >
                              <option value="Filho(a)">Filho(a)</option>
                              <option value="Cônjuge">Cônjuge</option>
                              <option value="Pai/Mãe">Pai/Mãe</option>
                              <option value="Irmão(ã)">Irmão(ã)</option>
                              <option value="Cuidador(a)">Cuidador(a)</option>
                              <option value="Vizinho(a)">Vizinho(a)</option>
                              <option value="Outro">Outro</option>
                            </select>
                            <input 
                              type="text" className="form-control" placeholder="Telefone"
                              value={contact.phone} onChange={e => handleContactChange(idx, 'phone', e.target.value)}
                            />
                            <button 
                              type="button" 
                              onClick={() => handleRemoveContact(idx)} 
                              className="btn btn-danger" 
                              style={{ padding: '0.4rem 0.6rem' }}
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 3: Convênio & APAC */}
                {patientModalTab === 'convenio' && (
                  <div style={styles.formSectionGroup}>
                    <div style={styles.formGrid}>
                      <div className="form-group">
                        <label>Pagante *</label>
                        <select 
                          className="form-control" value={patientForm.insurance}
                          onChange={e => setPatientForm({ ...patientForm, insurance: e.target.value })}
                        >
                          <option value="SUS">SUS</option>
                          <option value="Unimed">Unimed</option>
                          <option value="Bradesco Saúde">Bradesco Saúde</option>
                          <option value="Amil">Amil</option>
                          <option value="SulAmérica">SulAmérica</option>
                          <option value="Particular">Particular</option>
                          <option value="Outros">Outros</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Nº Carteirinha / Matrícula</label>
                        <input 
                          type="text" className="form-control" placeholder="000000000"
                          value={patientForm.insuranceNumber} onChange={e => setPatientForm({ ...patientForm, insuranceNumber: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label>Tipo de Plano</label>
                        <input 
                          type="text" className="form-control" placeholder="Ex: Apartamento, Enfermaria, Básico"
                          value={patientForm.insurancePlan} onChange={e => setPatientForm({ ...patientForm, insurancePlan: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label>Validade da Carteirinha</label>
                        <input 
                          type="date" className="form-control"
                          value={patientForm.insuranceExpiry} onChange={e => setPatientForm({ ...patientForm, insuranceExpiry: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label>Número da APAC (se SUS)</label>
                        <input 
                          type="text" className="form-control" placeholder="0000000000000"
                          value={patientForm.apacNumber} onChange={e => setPatientForm({ ...patientForm, apacNumber: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label>Data de Validade da APAC</label>
                        <input 
                          type="date" className="form-control"
                          value={patientForm.apacExpiry} onChange={e => setPatientForm({ ...patientForm, apacExpiry: e.target.value })}
                        />
                      </div>
                      <div className="form-group" style={{ gridColumn: 'span 2' }}>
                        <label>Nº Protocolo / Laudo de Autorização</label>
                        <input 
                          type="text" className="form-control" placeholder="Protocolo da regulação municipal ou estadual"
                          value={patientForm.protocolNumber} onChange={e => setPatientForm({ ...patientForm, protocolNumber: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 4: Logística de Diálise */}
                {patientModalTab === 'logistica' && (
                  <div style={styles.formSectionGroup}>
                    <div style={styles.formGrid}>
                      <div className="form-group">
                        <label>Modalidade de Tratamento</label>
                        <select 
                          className="form-control" value={patientForm.treatmentType}
                          onChange={e => setPatientForm({ ...patientForm, treatmentType: e.target.value })}
                        >
                          <option value="HD">Hemodiálise (HD)</option>
                          <option value="DP">Diálise Peritoneal (DP)</option>
                          <option value="Conservador">Tratamento Conservador</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Frequência Prescrita *</label>
                        <select 
                          className="form-control" value={patientForm.dialysisFrequency}
                          onChange={e => setPatientForm({ ...patientForm, dialysisFrequency: e.target.value })}
                        >
                          {dialysisFrequencies.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Turno *</label>
                        <select 
                          className="form-control" value={patientForm.shift}
                          onChange={e => setPatientForm({ ...patientForm, shift: e.target.value })}
                        >
                          {shifts.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Sala / Salão *</label>
                        <select 
                          className="form-control" value={patientForm.room}
                          onChange={e => setPatientForm({ ...patientForm, room: e.target.value })}
                        >
                          {rooms.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Nº Poltrona *</label>
                        <input 
                          type="number" min="1" max="20" className="form-control"
                          value={patientForm.chairNumber} onChange={e => setPatientForm({ ...patientForm, chairNumber: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label>Acesso Vascular *</label>
                        <select 
                          className="form-control" value={patientForm.accessType}
                          onChange={e => setPatientForm({ ...patientForm, accessType: e.target.value })}
                        >
                          {accessTypes.map(a => <option key={a.id} value={a.name}>{a.name}</option>)}
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Local do Acesso</label>
                        <input 
                          type="text" className="form-control" placeholder="Ex: MSE Rádio-Cefálica, Jugular D"
                          value={patientForm.accessSide} onChange={e => setPatientForm({ ...patientForm, accessSide: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label>Peso Seco Alvo (kg)</label>
                        <input 
                          type="number" step="0.1" className="form-control" placeholder="65.0"
                          value={patientForm.dryWeight} onChange={e => setPatientForm({ ...patientForm, dryWeight: e.target.value })}
                        />
                      </div>
                      <div className="form-group" style={{ gridColumn: 'span 2' }}>
                        <label>Médico Assistente</label>
                        <input 
                          type="text" className="form-control" placeholder="Nome do nefrologista de referência"
                          value={patientForm.attendingDoctor} onChange={e => setPatientForm({ ...patientForm, attendingDoctor: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 5: Nefrologia & Admissão */}
                {patientModalTab === 'nefrologia' && (
                  <div style={styles.formSectionGroup}>
                    <h4 style={styles.subSectionTitle}>Histórico de Entrada</h4>
                    <div style={styles.formGrid}>
                      <div className="form-group">
                        <label>Origem do Paciente</label>
                        <select 
                          className="form-control" value={patientForm.originType}
                          onChange={e => setPatientForm({ ...patientForm, originType: e.target.value })}
                        >
                          <option value="Novo">Paciente Novo (1ª Diálise)</option>
                          <option value="Transferência">Transferência de Outro Centro</option>
                          <option value="Trânsito">Paciente em Trânsito</option>
                          <option value="Pós-alta">Pós-alta Hospitalar</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Centro / Hospital de Origem</label>
                        <input 
                          type="text" className="form-control" placeholder="Nome da clínica ou hospital de onde veio"
                          value={patientForm.originCenter} onChange={e => setPatientForm({ ...patientForm, originCenter: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label>Data 1ª Diálise da Vida</label>
                        <input 
                          type="date" className="form-control"
                          value={patientForm.firstDialysisDate} onChange={e => setPatientForm({ ...patientForm, firstDialysisDate: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label>Caráter da 1ª Diálise</label>
                        <select 
                          className="form-control" value={patientForm.firstDialysisType}
                          onChange={e => setPatientForm({ ...patientForm, firstDialysisType: e.target.value })}
                        >
                          <option value="Eletiva">Eletiva (Programada)</option>
                          <option value="Urgência">Urgência / Emergência</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Local da 1ª Diálise</label>
                        <select 
                          className="form-control" value={patientForm.firstDialysisLocation}
                          onChange={e => setPatientForm({ ...patientForm, firstDialysisLocation: e.target.value })}
                        >
                          <option value="Hospital">Hospital</option>
                          <option value="Clínica">Clínica de Diálise</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Início na Clínica Atual</label>
                        <input 
                          type="date" className="form-control"
                          value={patientForm.admissionDate} onChange={e => setPatientForm({ ...patientForm, admissionDate: e.target.value })}
                        />
                      </div>
                    </div>

                    <h4 style={{ ...styles.subSectionTitle, marginTop: '1.25rem' }}>Diagnóstico & Alergias</h4>
                    <div style={styles.formGrid}>
                      <div className="form-group" style={{ gridColumn: 'span 2' }}>
                        <label>Etiologia Principal da DRC (CID-10)</label>
                        <input 
                          type="text" className="form-control" placeholder="Ex: N18.0 DRC Terminal, Nefropatia Diabética, Nefroesclerose"
                          value={patientForm.primaryDiagnosis} onChange={e => setPatientForm({ ...patientForm, primaryDiagnosis: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label>Tipo Sanguíneo</label>
                        <select 
                          className="form-control" value={patientForm.bloodType}
                          onChange={e => setPatientForm({ ...patientForm, bloodType: e.target.value })}
                        >
                          <option value="A">A</option>
                          <option value="B">B</option>
                          <option value="AB">AB</option>
                          <option value="O">O</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Fator RH</label>
                        <select 
                          className="form-control" value={patientForm.rhFactor}
                          onChange={e => setPatientForm({ ...patientForm, rhFactor: e.target.value })}
                        >
                          <option value="Positivo">Positivo (+)</option>
                          <option value="Negativo">Negativo (-)</option>
                        </select>
                      </div>
                      <div className="form-group" style={{ gridColumn: 'span 2' }}>
                        <label style={{ color: '#dc2626', fontWeight: '800' }}>⚠️ Alergias Conhecidas</label>
                        <input 
                          type="text" className="form-control" placeholder="Ex: Dipirona, Heparina, Iodo, Látex (ou Nenhuma)"
                          value={patientForm.allergies} onChange={e => setPatientForm({ ...patientForm, allergies: e.target.value })}
                          style={{ borderColor: '#fca5a5' }}
                        />
                      </div>
                    </div>

                    <h4 style={{ ...styles.subSectionTitle, marginTop: '1.25rem' }}>Comorbidades & Hábitos</h4>
                    <div style={styles.formGrid}>
                      <div className="form-group">
                        <label>Diabetes Mellitus</label>
                        <select 
                          className="form-control" value={patientForm.diabetes}
                          onChange={e => setPatientForm({ ...patientForm, diabetes: e.target.value })}
                        >
                          <option value="Não">Não</option>
                          <option value="Tipo I">Tipo I</option>
                          <option value="Tipo II">Tipo II</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Terapêutica Diabetes</label>
                        <select 
                          className="form-control" value={patientForm.diabetesMeds}
                          onChange={e => setPatientForm({ ...patientForm, diabetesMeds: e.target.value })}
                        >
                          <option value="Sem medicação">Sem medicação</option>
                          <option value="Insulina">Insulina</option>
                          <option value="Medicação Oral">Medicação Oral</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Hipertensão (HAS)</label>
                        <select 
                          className="form-control" value={patientForm.has}
                          onChange={e => setPatientForm({ ...patientForm, has: e.target.value })}
                        >
                          <option value="Sim">Sim</option>
                          <option value="Não">Não</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Cardiopatia / IAM</label>
                        <select 
                          className="form-control" value={patientForm.cardiopathy}
                          onChange={e => setPatientForm({ ...patientForm, cardiopathy: e.target.value })}
                        >
                          <option value="Não">Não</option>
                          <option value="Sim">Sim</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Tabagismo</label>
                        <select 
                          className="form-control" value={patientForm.smoking}
                          onChange={e => setPatientForm({ ...patientForm, smoking: e.target.value })}
                        >
                          <option value="Não">Não</option>
                          <option value="Fumante">Fumante Ativo</option>
                          <option value="Ex-fumante">Ex-fumante</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Etilismo</label>
                        <select 
                          className="form-control" value={patientForm.alcohol}
                          onChange={e => setPatientForm({ ...patientForm, alcohol: e.target.value })}
                        >
                          <option value="Não">Não</option>
                          <option value="Consome">Consumo Frequente</option>
                          <option value="Ex-etilista">Ex-etilista</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 6: Transplante Renal */}
                {patientModalTab === 'transplante' && (
                  <div style={styles.formSectionGroup}>
                    <div style={styles.formGrid}>
                      <div className="form-group">
                        <label>Indicação para Transplante</label>
                        <select 
                          className="form-control" value={patientForm.transplantEligible}
                          onChange={e => setPatientForm({ ...patientForm, transplantEligible: e.target.value })}
                        >
                          <option value="Sim">Sim (Indicado)</option>
                          <option value="Em avaliação">Em Avaliação Inicial</option>
                          <option value="Não">Não Indicado</option>
                          <option value="Contraindicado">Contraindicado</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Situação na Fila RBT</label>
                        <select 
                          className="form-control" value={patientForm.transplantStatus}
                          onChange={e => setPatientForm({ ...patientForm, transplantStatus: e.target.value })}
                        >
                          <option value="Admissão recente (< 90 dias)">Admissão recente (&lt; 90 dias)</option>
                          <option value="Em preparo de exames">Em preparo de exames</option>
                          <option value="Inscrito Ativo na Fila">Inscrito Ativo na Fila</option>
                          <option value="Inapto temporário">Inapto Temporário</option>
                          <option value="Transplantado">Transplantado</option>
                          <option value="Perda de vaga">Perda de vaga</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Centro Transplantador</label>
                        <input 
                          type="text" className="form-control" placeholder="Ex: Hospital do Rim, Santa Casa, Felício Rocho"
                          value={patientForm.transplantCenter} onChange={e => setPatientForm({ ...patientForm, transplantCenter: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label>Nº Inscrição Central (RBT)</label>
                        <input 
                          type="text" className="form-control" placeholder="Número de inscrição estadual"
                          value={patientForm.transplantRbtNumber} onChange={e => setPatientForm({ ...patientForm, transplantRbtNumber: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label>Tipo de Doador Pretendido</label>
                        <select 
                          className="form-control" value={patientForm.donorType}
                          onChange={e => setPatientForm({ ...patientForm, donorType: e.target.value })}
                        >
                          <option value="Doador Falecido">Doador Falecido (Cadáver)</option>
                          <option value="Doador Vivo">Doador Vivo Relacionado / Não Relacionado</option>
                        </select>
                      </div>
                    </div>

                    <h4 style={{ ...styles.subSectionTitle, marginTop: '1.25rem' }}>
                      Histórico Obstétrico & Imunológico (Sensibilização HLA)
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                      <div className="form-group">
                        <label>Gestações</label>
                        <input 
                          type="number" min="0" className="form-control"
                          value={patientForm.pregnancies} onChange={e => setPatientForm({ ...patientForm, pregnancies: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                      <div className="form-group">
                        <label>Partos</label>
                        <input 
                          type="number" min="0" className="form-control"
                          value={patientForm.births} onChange={e => setPatientForm({ ...patientForm, births: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                      <div className="form-group">
                        <label>Abortos</label>
                        <input 
                          type="number" min="0" className="form-control"
                          value={patientForm.abortions} onChange={e => setPatientForm({ ...patientForm, abortions: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                      <div className="form-group">
                        <label>Transfusões de Sangue</label>
                        <input 
                          type="number" min="0" className="form-control"
                          value={patientForm.transfusions} onChange={e => setPatientForm({ ...patientForm, transfusions: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                    </div>

                    <div className="form-group" style={{ marginTop: '1rem' }}>
                      <label>Observações do Transplante</label>
                      <textarea 
                        rows="3" className="form-control" placeholder="Ex: Aguarda AngioTC de coronárias, liberação odontológica e prova cruzada."
                        value={patientForm.transplantNotes} onChange={e => setPatientForm({ ...patientForm, transplantNotes: e.target.value })}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div style={styles.modalFooter}>
                <button type="button" onClick={() => setShowPatientModal(false)} className="btn btn-secondary">
                  Cancelar
                </button>
                <button type="submit" disabled={actionLoading} className="btn btn-primary">
                  {actionLoading ? 'Salvando...' : 'Salvar Ficha do Paciente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Check-in Intake Modal */}
      {showCheckinModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCardSmall}>
            <div style={styles.modalHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={20} color="#059669" />
                <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800' }}>Confirmar Presença</h2>
              </div>
              <button onClick={() => setShowCheckinModal(false)} style={styles.modalCloseBtn}><X size={20} /></button>
            </div>
            
            <div style={styles.checkinAlertInfo}>
              <div style={{ fontWeight: '800', color: '#0f172a', fontSize: '0.95rem' }}>
                {selectedPatientForCheckin?.name}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.2rem' }}>
                {selectedPatientForCheckin?.room} • {selectedPatientForCheckin?.shift} (Poltrona #{selectedPatientForCheckin?.chairNumber})
              </div>
            </div>

            <form onSubmit={handleSaveCheckin} style={styles.modalForm}>
              <div className="form-group">
                <label>Peso de Entrada (kg) *</label>
                <input 
                  type="number" step="0.01" className="form-control" required
                  value={checkinForm.preWeight} onChange={e => setCheckinForm({ ...checkinForm, preWeight: e.target.value })}
                  style={{ fontSize: '1.1rem', fontWeight: '700' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                  <span>Peso Seco: <strong>{selectedPatientForCheckin?.dryWeight || '--'} kg</strong></span>
                  {checkinForm.preWeight && selectedPatientForCheckin?.dryWeight && (
                    <span style={{ 
                      fontWeight: '700', 
                      color: (parseFloat(checkinForm.preWeight) - parseFloat(selectedPatientForCheckin.dryWeight)) >= 4 ? '#dc2626' : '#059669' 
                    }}>
                      Ganho: +{(parseFloat(checkinForm.preWeight) - parseFloat(selectedPatientForCheckin.dryWeight)).toFixed(2)} kg
                    </span>
                  )}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label>PA Sistólica *</label>
                  <input 
                    type="number" className="form-control" placeholder="120" required
                    value={checkinForm.systolicBP} onChange={e => setCheckinForm({ ...checkinForm, systolicBP: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>PA Diastólica *</label>
                  <input 
                    type="number" className="form-control" placeholder="80" required
                    value={checkinForm.diastolicBP} onChange={e => setCheckinForm({ ...checkinForm, diastolicBP: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Temperatura Corporal (°C) *</label>
                <input 
                  type="number" step="0.1" className="form-control" placeholder="36.5" required
                  value={checkinForm.temperature} onChange={e => setCheckinForm({ ...checkinForm, temperature: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Observação de Chegada</label>
                <input 
                  type="text" className="form-control" placeholder="Ex: Queixa de dor no braço, edema moderado..."
                  value={checkinForm.notes} onChange={e => setCheckinForm({ ...checkinForm, notes: e.target.value })}
                />
              </div>

              <div style={styles.modalFooter}>
                <button type="button" onClick={() => setShowCheckinModal(false)} className="btn btn-secondary">
                  Cancelar
                </button>
                <button type="submit" disabled={actionLoading} className="btn btn-primary" style={{ backgroundColor: '#059669' }}>
                  {actionLoading ? 'Registrando...' : 'Confirmar Presença'}
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
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: '800',
    color: '#0f172a',
    margin: 0,
  },
  subtitle: {
    fontSize: '0.85rem',
    color: '#64748b',
    margin: '0.25rem 0 0 0',
  },
  kpiRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '1rem',
  },
  kpiCard: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '1rem',
    border: '1px solid #e2e8f0',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    display: 'flex',
    alignItems: 'center',
    gap: '0.9rem',
    borderLeft: '4px solid var(--primary-color)',
  },
  kpiIconWrap: {
    width: '42px',
    height: '42px',
    borderRadius: '10px',
    backgroundColor: 'rgba(13, 148, 136, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  kpiLabel: {
    fontSize: '0.75rem',
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  kpiValue: {
    fontSize: '1.4rem',
    fontWeight: '800',
    color: '#0f172a',
    lineHeight: '1.2',
  },
  kpiSub: {
    fontSize: '0.75rem',
    color: '#94a3b8',
  },
  tabsWrapper: {
    display: 'flex',
    gap: '0.5rem',
    borderBottom: '2px solid #e2e8f0',
    paddingBottom: '0.25rem',
    flexWrap: 'wrap',
  },
  tabBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.6rem 1.1rem',
    fontSize: '0.85rem',
    fontWeight: '700',
    color: '#64748b',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '8px 8px 0 0',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  tabBtnActive: {
    color: 'var(--primary-color)',
    backgroundColor: '#fff',
    borderBottom: '3px solid var(--primary-color)',
    boxShadow: '0 -2px 5px rgba(0,0,0,0.03)',
  },
  filtersBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '0.75rem',
    flexWrap: 'wrap',
    backgroundColor: '#fff',
    padding: '0.75rem',
    borderRadius: '10px',
    border: '1px solid #e2e8f0',
  },
  searchWrapper: {
    position: 'relative',
    flex: '1',
    minWidth: '240px',
  },
  searchIcon: {
    position: 'absolute',
    left: '0.75rem',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#94a3b8',
  },
  searchInput: {
    width: '100%',
    padding: '0.55rem 0.75rem 0.55rem 2.25rem',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    fontSize: '0.85rem',
    outline: 'none',
  },
  selectsWrapper: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap',
  },
  filterSelect: {
    padding: '0.55rem 0.75rem',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    fontSize: '0.85rem',
    backgroundColor: '#fff',
    color: '#334155',
    outline: 'none',
  },
  addBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    backgroundColor: 'var(--primary-color)',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    padding: '0.55rem 1rem',
    fontSize: '0.85rem',
    fontWeight: '700',
    cursor: 'pointer',
  },
  tableWrapper: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    overflowX: 'auto',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
    fontSize: '0.85rem',
  },
  patientCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.4rem 0',
  },
  tablePhoto: {
    width: '38px',
    height: '38px',
    borderRadius: '8px',
    objectFit: 'cover',
    border: '1px solid #e2e8f0',
  },
  tablePhotoPlaceholder: {
    width: '38px',
    height: '38px',
    borderRadius: '8px',
    backgroundColor: 'rgba(13, 148, 136, 0.1)',
    color: 'var(--primary-color)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '800',
    fontSize: '1rem',
  },
  patientNameBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.15rem',
  },
  patName: {
    fontWeight: '800',
    color: '#0f172a',
  },
  motherName: {
    fontSize: '0.7rem',
    color: '#64748b',
  },
  phoneLabel: {
    fontSize: '0.75rem',
    color: '#64748b',
  },
  contactsSummary: {
    fontSize: '0.7rem',
    color: '#0369a1',
  },
  docCell: {
    display: 'flex',
    flexDirection: 'column',
    fontSize: '0.8rem',
  },
  cpfLabel: {
    fontWeight: '600',
    color: '#334155',
  },
  cnsMuted: {
    fontSize: '0.7rem',
    color: '#94a3b8',
  },
  ageMuted: {
    fontSize: '0.75rem',
    color: '#64748b',
  },
  badgeShift: {
    fontSize: '0.75rem',
    fontWeight: '700',
    backgroundColor: '#f1f5f9',
    color: '#334155',
    padding: '0.2rem 0.5rem',
    borderRadius: '6px',
  },
  badgeRoom: {
    fontSize: '0.75rem',
    fontWeight: '700',
    backgroundColor: '#eff6ff',
    color: '#1e40af',
    padding: '0.2rem 0.5rem',
    borderRadius: '6px',
  },
  accessBadge: {
    fontSize: '0.75rem',
    fontWeight: '700',
    backgroundColor: '#ede9fe',
    color: '#6d28d9',
    padding: '0.2rem 0.5rem',
    borderRadius: '6px',
  },
  apacBadge: {
    fontSize: '0.7rem',
    fontWeight: '800',
    padding: '0.15rem 0.45rem',
    borderRadius: '4px',
    display: 'inline-block',
  },
  insuranceCell: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '0.2rem',
  },
  insuranceBadge: {
    fontSize: '0.75rem',
    fontWeight: '700',
    backgroundColor: '#f8fafc',
    color: '#334155',
    border: '1px solid #e2e8f0',
    padding: '0.15rem 0.45rem',
    borderRadius: '4px',
  },
  checkinDoneBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.15rem',
  },
  checkinDoneBadge: {
    fontSize: '0.7rem',
    fontWeight: '800',
    backgroundColor: '#dcfce7',
    color: '#15803d',
    padding: '0.15rem 0.45rem',
    borderRadius: '4px',
    width: 'fit-content',
  },
  checkinDetails: {
    fontSize: '0.7rem',
    color: '#475569',
    fontWeight: '600',
  },
  checkinBtn: {
    backgroundColor: '#059669',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    padding: '0.35rem 0.75rem',
    fontSize: '0.75rem',
    fontWeight: '700',
    cursor: 'pointer',
  },
  actionButtons: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
  },
  actionWhatsBtn: {
    backgroundColor: '#25d366',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    padding: '0.35rem 0.45rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionEditBtn: {
    backgroundColor: '#f1f5f9',
    color: '#475569',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    padding: '0.35rem 0.45rem',
    cursor: 'pointer',
  },
  actionDeleteBtn: {
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    border: '1px solid #fca5a5',
    borderRadius: '6px',
    padding: '0.35rem 0.45rem',
    cursor: 'pointer',
  },
  rowCheckedIn: {
    backgroundColor: 'rgba(220, 252, 231, 0.25)',
  },
  noDataCell: {
    textAlign: 'center',
    padding: '3rem 1rem',
    color: '#94a3b8',
  },
  loadingBox: {
    textAlign: 'center',
    padding: '3rem',
    color: '#64748b',
    fontWeight: '700',
  },
  alert: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem 1rem',
    borderRadius: '8px',
  },
  // Room Grid Styles
  gridTabsContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  roomSection: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    padding: '1.25rem',
  },
  roomHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #f1f5f9',
    paddingBottom: '0.75rem',
    marginBottom: '1rem',
  },
  roomTitle: {
    fontSize: '1.1rem',
    fontWeight: '800',
    color: '#0f172a',
    margin: 0,
  },
  roomBadge: {
    fontSize: '0.75rem',
    fontWeight: '700',
    backgroundColor: '#f1f5f9',
    color: '#475569',
    padding: '0.2rem 0.6rem',
    borderRadius: '6px',
  },
  gridContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '1rem',
  },
  shiftCol: {
    backgroundColor: '#f8fafc',
    borderRadius: '10px',
    padding: '0.9rem',
    border: '1px solid #e2e8f0',
  },
  shiftColHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    marginBottom: '0.75rem',
    borderBottom: '1px solid #e2e8f0',
    paddingBottom: '0.4rem',
  },
  shiftColTitle: {
    fontSize: '0.85rem',
    fontWeight: '800',
    color: '#334155',
    margin: 0,
    flex: '1',
  },
  shiftOccupancyBadge: {
    fontSize: '0.7rem',
    fontWeight: '800',
    backgroundColor: '#e2e8f0',
    color: '#1e293b',
    padding: '0.1rem 0.4rem',
    borderRadius: '4px',
  },
  seatsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
    gap: '0.5rem',
  },
  seatCard: {
    borderRadius: '8px',
    padding: '0.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
    border: '1px solid #e2e8f0',
    minHeight: '75px',
    backgroundColor: '#fff',
  },
  seatEmpty: {
    backgroundColor: '#f8fafc',
    borderStyle: 'dashed',
    opacity: 0.7,
  },
  seatOccupied: {
    backgroundColor: '#eff6ff',
    borderColor: '#bfdbfe',
  },
  seatCheckedIn: {
    backgroundColor: '#ecfdf5',
    borderColor: '#a7f3d0',
  },
  seatHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  seatNum: {
    fontSize: '0.7rem',
    fontWeight: '800',
    color: '#64748b',
  },
  seatBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.15rem',
  },
  seatPatName: {
    fontSize: '0.75rem',
    fontWeight: '800',
    color: '#0f172a',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  seatAccessBadge: {
    fontSize: '0.65rem',
    fontWeight: '700',
    color: '#6d28d9',
  },
  seatStatusActive: {
    fontSize: '0.65rem',
    fontWeight: '800',
    color: '#059669',
  },
  seatStatusPending: {
    fontSize: '0.65rem',
    fontWeight: '700',
    color: '#d97706',
  },
  seatFreeLabel: {
    fontSize: '0.7rem',
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: '0.5rem',
  },
  // Modal Styles
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: '1rem',
  },
  modalCardLarge: {
    backgroundColor: '#fff',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '900px',
    maxHeight: '92vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    overflow: 'hidden',
  },
  modalCardSmall: {
    backgroundColor: '#fff',
    borderRadius: '14px',
    width: '100%',
    maxWidth: '460px',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    padding: '1.25rem',
    gap: '1rem',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.25rem 1.5rem',
    borderBottom: '1px solid #f1f5f9',
  },
  modalCloseBtn: {
    background: 'none',
    border: 'none',
    color: '#94a3b8',
    cursor: 'pointer',
    padding: '0.25rem',
    borderRadius: '6px',
  },
  modalTabsBar: {
    display: 'flex',
    gap: '0.25rem',
    backgroundColor: '#f8fafc',
    padding: '0.5rem 1.5rem',
    borderBottom: '1px solid #e2e8f0',
    overflowX: 'auto',
  },
  modalTabItem: {
    padding: '0.45rem 0.9rem',
    fontSize: '0.8rem',
    fontWeight: '700',
    color: '#64748b',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  modalTabItemActive: {
    backgroundColor: 'var(--primary-color)',
    color: '#fff',
  },
  modalForm: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflow: 'hidden',
  },
  modalScrollableBody: {
    padding: '1.5rem',
    overflowY: 'auto',
    maxHeight: '65vh',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  formSectionGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  subSectionTitle: {
    fontSize: '0.95rem',
    fontWeight: '800',
    color: '#1e293b',
    margin: 0,
    borderBottom: '1px solid #f1f5f9',
    paddingBottom: '0.35rem',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '0.9rem',
  },
  photoUploadContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.25rem',
    backgroundColor: '#f8fafc',
    padding: '1rem',
    borderRadius: '10px',
    border: '1px solid #e2e8f0',
  },
  photoPreviewWrapper: {
    width: '72px',
    height: '72px',
    borderRadius: '12px',
    overflow: 'hidden',
    border: '2px solid #cbd5e1',
    flexShrink: 0,
  },
  photoPreview: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  photoPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#e2e8f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.75rem',
    padding: '1rem 1.5rem',
    borderTop: '1px solid #f1f5f9',
    backgroundColor: '#f8fafc',
  },
  checkinAlertInfo: {
    backgroundColor: '#f8fafc',
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
  }
};
