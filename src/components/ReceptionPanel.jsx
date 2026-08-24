import React, { useState, useEffect, useMemo } from 'react';
import { dbService } from '../firebase';
import { useUnit } from '../contexts/UnitContext';
import UnitSelector from './common/UnitSelector';
import { 
  Plus, Search, Edit2, Trash2, User, Calendar, 
  Check, X, FileText, CheckCircle2, AlertCircle, 
  MapPin, Clock, Armchair, AlertTriangle, ShieldCheck,
  UserCheck, RefreshCw
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

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterShift, setFilterShift] = useState('');
  const [filterRoom, setFilterRoom] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Patient Modal / Form State
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [patientForm, setPatientForm] = useState({
    name: '',
    gender: 'Masculino',
    birthDate: '',
    cpf: '',
    rg: '',
    cns: '', // Cartão Nacional de Saúde
    motherName: '',
    phone: '',
    city: 'Betim',
    state: 'MG',
    admissionDate: new Date().toISOString().substring(0, 10),
    treatmentStatus: 'Ativo',
    treatmentType: 'HD',
    dialysisFrequency: '3x por semana (Seg/Qua/Sex)',
    shift: '1º Turno',
    room: 'Salão 1',
    chairNumber: '1',
    dryWeight: '',
    accessType: 'Fístula Arteriovenosa',
    insurance: 'SUS',
    apacNumber: '',
    apacExpiry: '',
    photo: '',
    contacts: []
  });

  // Checkin Modal State
  const [showCheckinModal, setShowCheckinModal] = useState(false);
  const [selectedPatientForCheckin, setSelectedPatientForCheckin] = useState(null);
  const [checkinForm, setCheckinForm] = useState({
    preWeight: '',
    systolicBP: '120',
    diastolicBP: '80',
    temperature: '36.5'
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

      setPatients(pList);
      setCheckins(cList);
      setShifts(sList);
      setRooms(rList);
      setAccessTypes(aList);
      setDialysisFrequencies(dList);
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
    setPatientForm({
      name: '',
      gender: 'Masculino',
      birthDate: '',
      cpf: '',
      rg: '',
      cns: '',
      motherName: '',
      phone: '',
      city: 'Betim',
      state: 'MG',
      admissionDate: new Date().toISOString().substring(0, 10),
      treatmentStatus: 'Ativo',
      treatmentType: 'HD',
      dialysisFrequency: dialysisFrequencies[0]?.name || '3x por semana (Seg/Qua/Sex)',
      shift: shifts[0]?.name || '1º Turno',
      room: rooms[0]?.name || 'Salão 1',
      chairNumber: '1',
      dryWeight: '',
      accessType: accessTypes[0]?.name || 'Fístula Arteriovenosa',
      insurance: 'SUS',
      apacNumber: '',
      apacExpiry: '',
      photo: '',
      contacts: []
    });
    setShowPatientModal(true);
  };

  const handleOpenEditModal = (patient) => {
    setEditingPatient(patient);
    setPatientForm({
      name: patient.name || '',
      gender: patient.gender || 'Masculino',
      birthDate: patient.birthDate || '',
      cpf: patient.cpf || '',
      rg: patient.rg || '',
      cns: patient.cns || '',
      motherName: patient.motherName || '',
      phone: patient.phone || '',
      city: patient.city || 'Betim',
      state: patient.state || 'MG',
      admissionDate: patient.admissionDate || '',
      treatmentStatus: patient.treatmentStatus || 'Ativo',
      treatmentType: patient.treatmentType || 'HD',
      dialysisFrequency: patient.dialysisFrequency || '',
      shift: patient.shift || '',
      room: patient.room || '',
      chairNumber: patient.chairNumber || '1',
      dryWeight: patient.dryWeight || '',
      accessType: patient.accessType || '',
      insurance: patient.insurance || 'SUS',
      apacNumber: patient.apacNumber || '',
      apacExpiry: patient.apacExpiry || '',
      photo: patient.photo || '',
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

  const handleAddContact = () => {
    setPatientForm(prev => ({
      ...prev,
      contacts: [...(prev.contacts || []), { name: '', relationship: 'Filho(a)', phone: '' }]
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
      return showAlert('Nome, CPF e Data de Nascimento são obrigatórios.', 'warning');
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
        showAlert('Paciente cadastrado com sucesso!', 'success');
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
      temperature: '36.5'
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

      await dbService.saveCheckin({
        patientId: selectedPatientForCheckin.id,
        patientName: selectedPatientForCheckin.name,
        date: todayDate,
        preWeight: parseFloat(checkinForm.preWeight) || 0,
        bp: `${checkinForm.systolicBP}/${checkinForm.diastolicBP}`,
        temperature: parseFloat(checkinForm.temperature) || 36.5,
        shift: selectedPatientForCheckin.shift,
        room: selectedPatientForCheckin.room,
        chairNumber: selectedPatientForCheckin.chairNumber || '1',
        unitId: targetUnitId,
        unit: targetUnit
      });

      showAlert(`Check-in de ${selectedPatientForCheckin.name} realizado!`, 'success');
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
  const getTodayWeekday = () => {
    const day = new Date().getDay();
    // 0: Sunday, 1: Mon, 2: Tue, 3: Wed, 4: Thu, 5: Fri, 6: Sat
    if ([1, 3, 5].includes(day)) return 'Seg/Qua/Sex';
    if ([2, 4, 6].includes(day)) return 'Ter/Qui/Sáb';
    return 'Seg/Qua/Sex'; // Fallback to Mon/Wed/Fri
  };

  const todayScheduleFilter = getTodayWeekday();

  const getFilteredPatients = () => {
    return currentPatients.filter(p => {
      const matchesSearch = p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            p.cpf?.includes(searchTerm) ||
                            p.cns?.includes(searchTerm);
      const matchesShift = filterShift ? p.shift === filterShift : true;
      const matchesRoom = filterRoom ? p.room === filterRoom : true;
      const matchesStatus = filterStatus ? p.treatmentStatus === filterStatus : true;
      return matchesSearch && matchesShift && matchesRoom && matchesStatus;
    });
  };

  const getPatientsForToday = () => {
    const todayDate = new Date().toISOString().substring(0, 10);
    return currentPatients.filter(p => {
      // Filter patients that dialyze today (matching weekday scale) and are active
      const matchesFrequency = p.dialysisFrequency?.includes(todayScheduleFilter) || p.dialysisFrequency === 'Diário';
      const isActive = p.treatmentStatus === 'Ativo';
      
      const matchesSearch = p.name?.toLowerCase().includes(searchTerm.toLowerCase()) || p.cpf?.includes(searchTerm);
      const matchesShift = filterShift ? p.shift === filterShift : true;
      const matchesRoom = filterRoom ? p.room === filterRoom : true;

      return matchesFrequency && isActive && matchesSearch && matchesShift && matchesRoom;
    });
  };

  const getCheckinForPatientToday = (patientId) => {
    const todayDate = new Date().toISOString().substring(0, 10);
    return currentCheckins.find(c => c.patientId === patientId && c.date === todayDate);
  };

  // Check APAC expirations
  const getApacStatus = (expiryDate) => {
    if (!expiryDate) return { text: 'Sem APAC', color: 'var(--text-muted)', isWarning: false };
    const expiry = new Date(expiryDate);
    const today = new Date();
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { text: 'Vencida', color: 'var(--danger-color)', isWarning: true };
    }
    if (diffDays <= 30) {
      return { text: `Vence em ${diffDays}d`, color: 'var(--warning-color)', isWarning: true };
    }
    return { text: 'Regular', color: 'var(--success-color)', isWarning: false };
  };

  const filteredPatients = getFilteredPatients();
  const todayPatients = getPatientsForToday();

  // Chair distribution grid generator
  const maxChairs = 12; // Standard seats per room
  const renderRoomGrid = (roomName) => {
    const shiftList = shifts.map(s => s.name);
    
    return (
      <div key={roomName} style={styles.roomSection}>
        <h3 style={styles.roomTitle}><MapPin size={18} /> {roomName}</h3>
        <div style={styles.gridContainer}>
          {shifts.map(sh => {
            // Get patients in this room and this shift
            const roomShiftPatients = currentPatients.filter(
              p => p.room === roomName && p.shift === sh.name && p.treatmentStatus === 'Ativo'
            );

            return (
              <div key={sh.name} style={styles.shiftCol}>
                <h4 style={styles.shiftColTitle}><Clock size={14} /> {sh.name}</h4>
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
                          <Armchair size={16} />
                          <span style={styles.seatNum}>#{chairNum}</span>
                        </div>
                        {pat ? (
                          <div style={styles.seatBody}>
                            <div style={styles.seatPatName}>{pat.name.split(' ')[0]} {pat.name.split(' ').slice(-1)[0]}</div>
                            <span style={styles.seatAccessBadge}>{pat.accessType.substring(0, 8)}...</span>
                            {checkin && <span style={styles.seatStatus}>Em Diálise</span>}
                          </div>
                        ) : (
                          <div style={styles.seatFreeLabel}>Disponível</div>
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

  return (
    <div style={styles.container}>
      <div style={styles.cardHeader}>
        <div>
          <h1 style={styles.title}>NexaCLINIC - Recepção & Cadastro</h1>
          <p style={styles.subtitle}>Gerenciamento de admissões, escalas de poltronas de diálise e check-in presencial diário.</p>
        </div>
        <UnitSelector compact showLabel={false} />
      </div>

      {/* Tabs */}
      <div style={styles.tabsWrapper}>
        <button 
          onClick={() => setActiveTab('checkin')} 
          style={{ ...styles.tabBtn, ...(activeTab === 'checkin' ? styles.tabBtnActive : {}) }}
        >
          <CheckCircle2 size={16} /> Check-in do Dia ({todayPatients.filter(p => getCheckinForPatientToday(p.id)).length}/{todayPatients.length})
        </button>
        <button 
          onClick={() => setActiveTab('patients')} 
          style={{ ...styles.tabBtn, ...(activeTab === 'patients' ? styles.tabBtnActive : {}) }}
        >
          <User size={16} /> Pacientes Cadastrados ({currentPatients.length})
        </button>
        <button 
          onClick={() => setActiveTab('grid')} 
          style={{ ...styles.tabBtn, ...(activeTab === 'grid' ? styles.tabBtnActive : {}) }}
        >
          <Armchair size={16} /> Escala de Poltronas & Salas
        </button>
        <button 
          onClick={() => setActiveTab('ronda')} 
          style={{ ...styles.tabBtn, ...(activeTab === 'ronda' ? styles.tabBtnActive : {}) }}
        >
          <UserCheck size={16} /> Ronda Médica ({currentMedicalSchedules.filter(s => s.date === new Date().toISOString().substring(0, 10) && s.checkinStatus === 'Presente').length}/{currentMedicalSchedules.filter(s => s.date === new Date().toISOString().substring(0, 10)).length})
        </button>
      </div>

      {/* Message feedback */}
      {message.text && (
        <div style={{ ...styles.alert, backgroundColor: `var(--${message.type}-light)`, border: `1px solid var(--${message.type}-color)` }}>
          <AlertCircle size={18} color={`var(--${message.type}-color)`} />
          <span style={{ color: `var(--${message.type}-color)`, fontWeight: '600' }}>{message.text}</span>
        </div>
      )}

      {/* Filters Bar */}
      {activeTab !== 'grid' && (
        <div style={styles.filtersBar}>
          <div style={styles.searchWrapper}>
            <Search size={18} style={styles.searchIcon} />
            <input 
              type="text" 
              placeholder="Pesquisar por nome, CPF ou CNS..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
          </div>
          <div style={styles.selectsWrapper}>
            <select value={filterShift} onChange={e => setFilterShift(e.target.value)} style={styles.filterSelect}>
              <option value="">Todos os Turnos</option>
              {shifts.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
            </select>
            <select value={filterRoom} onChange={e => setFilterRoom(e.target.value)} style={styles.filterSelect}>
              <option value="">Todas as Salas</option>
              {rooms.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
            </select>
            {activeTab === 'patients' && (
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={styles.filterSelect}>
                <option value="">Todos os Status</option>
                <option value="Ativo">Ativos</option>
                <option value="Inativo">Inativos</option>
                <option value="Óbito">Óbito</option>
                <option value="Transplantado">Transplantado</option>
              </select>
            )}
          </div>
          {activeTab === 'patients' && (
            <button onClick={handleOpenAddModal} style={styles.addBtn}>
              <Plus size={16} /> Adicionar Paciente
            </button>
          )}
        </div>
      )}

      {loading ? (
        <div style={styles.loadingBox}>Carregando painel de recepção...</div>
      ) : (
        <>
          {/* TAB 1: Daily Check-in */}
          {activeTab === 'checkin' && (
            <div style={styles.tabContent}>
              <div style={styles.todayBanner}>
                <Calendar size={18} />
                <span>Hoje é dia de pacientes da escala de: <strong>{todayScheduleFilter}</strong></span>
              </div>
              
              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th>Nome Completo</th>
                      <th>CPF</th>
                      <th>Turno / Sala</th>
                      <th>Poltrona</th>
                      <th>Insumo Principal (Acesso)</th>
                      <th>APAC / Status</th>
                      <th>Check-in</th>
                    </tr>
                  </thead>
                  <tbody>
                    {todayPatients.length === 0 ? (
                      <tr>
                        <td colSpan="7" style={styles.noDataCell}>Nenhum paciente agendado ou encontrado para os filtros atuais.</td>
                      </tr>
                    ) : (
                      todayPatients.map(pat => {
                        const checkin = getCheckinForPatientToday(pat.id);
                        const apacInfo = getApacStatus(pat.apacExpiry);

                        return (
                          <tr key={pat.id} style={checkin ? styles.rowCheckedIn : {}}>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0' }}>
                                {pat.photo ? (
                                  <img src={pat.photo} alt={pat.name} style={styles.tablePhoto} />
                                ) : (
                                  <div style={styles.tablePhotoPlaceholder}>
                                    {pat.name.charAt(0)}
                                  </div>
                                )}
                                <div style={styles.patientNameCell}>
                                  <span style={styles.patName}>{pat.name}</span>
                                  <span style={styles.motherName}>Mãe: {pat.motherName || 'Não informada'}</span>
                                </div>
                              </div>
                            </td>
                            <td>{pat.cpf}</td>
                            <td>
                              <div style={styles.locationBadges}>
                                <span style={styles.badgeShift}>{pat.shift}</span>
                                <span style={styles.badgeRoom}>{pat.room}</span>
                              </div>
                            </td>
                            <td style={{ fontWeight: '600' }}>#{pat.chairNumber || '-'}</td>
                            <td><span style={styles.accessBadge}>{pat.accessType}</span></td>
                            <td>
                              <span style={{ ...styles.apacLabel, color: apacInfo.color }}>
                                {pat.apacNumber || 'N/A'} ({apacInfo.text})
                              </span>
                            </td>
                            <td>
                              {checkin ? (
                                <div style={styles.checkinDoneBox}>
                                  <span style={styles.checkinDoneBadge}>✓ Concluído</span>
                                  <span style={styles.checkinDetails}>PA: {checkin.bp} | Peso: {checkin.preWeight}kg</span>
                                </div>
                              ) : (
                                <button onClick={() => handleOpenCheckinModal(pat)} style={styles.checkinBtn}>
                                  Confirmar Presença
                                </button>
                              )}
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
                    <th>Nome do Paciente</th>
                    <th>CNS / CPF</th>
                    <th>Nascimento</th>
                    <th>Convênio / APAC</th>
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
                      return (
                        <tr key={pat.id}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0' }}>
                              {pat.photo ? (
                                <img src={pat.photo} alt={pat.name} style={styles.tablePhoto} />
                              ) : (
                                <div style={styles.tablePhotoPlaceholder}>
                                  {pat.name.charAt(0)}
                                </div>
                              )}
                              <div style={styles.patientNameCell}>
                                <span style={styles.patName}>{pat.name}</span>
                                <span style={styles.phoneLabel}>☎ {pat.phone || 'Sem telefone'}</span>
                                {pat.contacts && pat.contacts.length > 0 && (
                                  <span style={styles.contactsSummary}>
                                    🚨 {pat.contacts[0].relationship}: {pat.contacts[0].name} ({pat.contacts[0].phone})
                                    {pat.contacts.length > 1 && ` (+${pat.contacts.length - 1})`}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td>
                            <div style={styles.cnsCell}>
                              <span>CNS: {pat.cns || '-'}</span>
                              <span style={styles.cpfLabel}>CPF: {pat.cpf}</span>
                            </div>
                          </td>
                          <td>{pat.birthDate ? new Date(pat.birthDate).toLocaleDateString('pt-BR') : '-'}</td>
                          <td>
                            <div style={styles.insuranceCell}>
                              <span style={styles.insuranceBadge}>{pat.insurance}</span>
                              {pat.apacNumber && (
                                <span style={{ ...styles.apacSubLabel, color: apacInfo.color }}>
                                  APAC: {pat.apacNumber}
                                </span>
                              )}
                            </div>
                          </td>
                          <td>{pat.dialysisFrequency}</td>
                          <td>{pat.accessType}</td>
                          <td>
                            <span className={`badge badge-${pat.treatmentStatus === 'Ativo' ? 'success' : 'danger'}`}>
                              {pat.treatmentStatus}
                            </span>
                          </td>
                          <td>
                            <div style={styles.actionButtons}>
                              <button onClick={() => handleOpenEditModal(pat)} style={styles.actionEditBtn} title="Editar cadastro">
                                <Edit2 size={14} />
                              </button>
                              <button onClick={() => handleDeletePatient(pat.id)} style={styles.actionDeleteBtn} title="Excluir cadastro">
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
                      Ronda Médica Presencial (Salões & DP)
                    </h3>
                    <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                      Auditoria de presença dos médicos nefrologistas em cada salão e turno hoje ({new Date().toLocaleDateString('pt-BR')}).
                    </p>
                  </div>
                  <span style={{ fontSize: '0.8rem', fontWeight: '800', backgroundColor: '#eff6ff', color: '#1e40af', padding: '0.3rem 0.75rem', borderRadius: '6px', border: '1px solid #bfdbfe' }}>
                    Auditoria da Recepção
                  </span>
                </div>

                {medicalSchedules.filter(s => s.date === new Date().toISOString().substring(0, 10)).length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#94a3b8' }}>
                    Nenhum plantão médico programado para a data de hoje no NexaMED.
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

                            {/* Check-in Buttons */}
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
                                  const sub = prompt('Nome do médico que assumiu a substituição:');
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

      {/* Patient Intake Modal */}
      {showPatientModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCardLarge}>
            <div style={styles.modalHeader}>
              <h2>{editingPatient ? 'Editar Ficha do Paciente' : 'Cadastro de Admissão de Paciente'}</h2>
              <button onClick={() => setShowPatientModal(false)} style={styles.modalCloseBtn}><X size={20} /></button>
            </div>
            <form onSubmit={handleSavePatient} style={styles.modalForm}>
              <div style={styles.formSectionGroup}>
                <h3 style={styles.sectionHeader}>1. Dados Identificadores</h3>
                
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
                    <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Foto de Identificação</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Formatos aceitos: JPG, PNG. Tamanho máximo: 1MB.</span>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handlePhotoChange} 
                        style={{ display: 'none' }} 
                        id="patient-photo-file"
                      />
                      <label htmlFor="patient-photo-file" className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem', cursor: 'pointer', display: 'inline-block' }}>
                        Carregar Imagem
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
                    <label>Data de Nascimento *</label>
                    <input 
                      type="date" className="form-control"
                      value={patientForm.birthDate} onChange={e => setPatientForm({ ...patientForm, birthDate: e.target.value })} required
                    />
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
                      type="text" className="form-control" placeholder="M-00.000.000"
                      value={patientForm.rg} onChange={e => setPatientForm({ ...patientForm, rg: e.target.value })}
                    />
                  </div>
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label>CNS (Cartão Nacional de Saúde)</label>
                    <input 
                      type="text" className="form-control" placeholder="000 0000 0000 0000"
                      value={patientForm.cns} onChange={e => setPatientForm({ ...patientForm, cns: e.target.value })}
                    />
                  </div>
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label>Nome Completo da Mãe</label>
                    <input 
                      type="text" className="form-control" placeholder="Nome Completo da Mãe do Paciente"
                      value={patientForm.motherName} onChange={e => setPatientForm({ ...patientForm, motherName: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Telefone / WhatsApp</label>
                    <input 
                      type="text" className="form-control" placeholder="(31) 99999-9999"
                      value={patientForm.phone} onChange={e => setPatientForm({ ...patientForm, phone: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div style={styles.formSectionGroup}>
                <h3 style={styles.sectionHeader}>2. Dados Clínicos e Alocação</h3>
                <div style={styles.formGrid}>
                  <div className="form-group">
                    <label>Status Clínico *</label>
                    <select 
                      className="form-control" value={patientForm.treatmentStatus}
                      onChange={e => setPatientForm({ ...patientForm, treatmentStatus: e.target.value })}
                    >
                      <option value="Ativo">Ativo</option>
                      <option value="Inativo">Inativo</option>
                      <option value="Óbito">Óbito</option>
                      <option value="Transplantado">Transplantado</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Escala de Diálise (Frequência) *</label>
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
                      type="number" min="1" max="15" className="form-control"
                      value={patientForm.chairNumber} onChange={e => setPatientForm({ ...patientForm, chairNumber: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Acesso Vascular Inicial *</label>
                    <select 
                      className="form-control" value={patientForm.accessType}
                      onChange={e => setPatientForm({ ...patientForm, accessType: e.target.value })}
                    >
                      {accessTypes.map(a => <option key={a.id} value={a.name}>{a.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Peso Seco Prescrito (kg)</label>
                    <input 
                      type="text" className="form-control" placeholder="00.0"
                      value={patientForm.dryWeight} onChange={e => setPatientForm({ ...patientForm, dryWeight: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div style={styles.formSectionGroup}>
                <h3 style={styles.sectionHeader}>3. Informações de Convênio & Regulação</h3>
                <div style={styles.formGrid}>
                  <div className="form-group">
                    <label>Convênio *</label>
                    <select 
                      className="form-control" value={patientForm.insurance}
                      onChange={e => setPatientForm({ ...patientForm, insurance: e.target.value })}
                    >
                      <option value="SUS">SUS</option>
                      <option value="Unimed">Unimed</option>
                      <option value="Bradesco Saúde">Bradesco Saúde</option>
                      <option value="Amil">Amil</option>
                      <option value="Outros">Outros</option>
                    </select>
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
                </div>
              </div>

              <div style={styles.formSectionGroup}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(13, 148, 136, 0.1)', paddingBottom: '0.25rem' }}>
                  <h3 style={{ ...styles.sectionHeader, borderBottom: 'none', marginBottom: 0 }}>4. Contatos Importantes / Emergência</h3>
                  <button 
                    type="button" 
                    onClick={handleAddContact} 
                    className="btn btn-secondary" 
                    style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                  >
                    <Plus size={12} /> Adicionar Contato
                  </button>
                </div>
                
                {(patientForm.contacts || []).length === 0 ? (
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic', padding: '0.5rem 0' }}>
                    Nenhum contato cadastrado. Clique em "Adicionar Contato" para registrar familiares ou contatos de emergência.
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
                    {(patientForm.contacts || []).map((contact, idx) => (
                      <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1.5fr auto', gap: '0.5rem', alignItems: 'center' }}>
                        <div>
                          <input 
                            type="text" className="form-control" placeholder="Nome do Contato" required
                            value={contact.name} onChange={e => handleContactChange(idx, 'name', e.target.value)}
                          />
                        </div>
                        <div>
                          <select 
                            className="form-control" value={contact.relationship}
                            onChange={e => handleContactChange(idx, 'relationship', e.target.value)}
                          >
                            <option value="Filho(a)">Filho(a)</option>
                            <option value="Cônjuge">Cônjuge</option>
                            <option value="Pai/Mãe">Pai/Mãe</option>
                            <option value="Irmão/Irmã">Irmão/Irmã</option>
                            <option value="Outro">Outro</option>
                          </select>
                        </div>
                        <div>
                          <input 
                            type="text" className="form-control" placeholder="Telefone" required
                            value={contact.phone} onChange={e => handleContactChange(idx, 'phone', e.target.value)}
                          />
                        </div>
                        <div>
                          <button 
                            type="button" 
                            onClick={() => handleRemoveContact(idx)} 
                            className="btn btn-danger" 
                            style={{ padding: '0.5rem' }}
                          >
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={styles.modalFooter}>
                <button type="button" onClick={() => setShowPatientModal(false)} className="btn btn-secondary">Cancelar</button>
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
              <h2>Confirmar Check-in</h2>
              <button onClick={() => setShowCheckinModal(false)} style={styles.modalCloseBtn}><X size={20} /></button>
            </div>
            <div style={styles.checkinAlertInfo}>
              <strong>Paciente:</strong> {selectedPatientForCheckin?.name} <br/>
              <strong>Agendamento:</strong> {selectedPatientForCheckin?.room} - {selectedPatientForCheckin?.shift} (Poltrona #{selectedPatientForCheckin?.chairNumber})
            </div>
            <form onSubmit={handleSaveCheckin} style={styles.modalForm}>
              <div className="form-group">
                <label>Peso de Entrada (kg) *</label>
                <input 
                  type="number" step="0.01" className="form-control" required
                  value={checkinForm.preWeight} onChange={e => setCheckinForm({ ...checkinForm, preWeight: e.target.value })}
                />
                <span style={styles.inputHelp}>Peso seco recomendado: {selectedPatientForCheckin?.dryWeight}kg</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
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

              <div style={styles.modalFooter}>
                <button type="button" onClick={() => setShowCheckinModal(false)} className="btn btn-secondary">Cancelar</button>
                <button type="submit" disabled={actionLoading} className="btn btn-primary" style={{ backgroundColor: 'var(--secondary-color)' }}>
                  {actionLoading ? 'Registrando...' : 'Confirmar Entrada'}
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
    color: 'var(--secondary-color)',
    borderBottomColor: 'var(--secondary-color)',
  },
  alert: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '1rem',
    borderRadius: 'var(--border-radius-sm)',
    fontSize: '0.9rem',
  },
  filtersBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '1rem',
    flexWrap: 'wrap',
  },
  searchWrapper: {
    position: 'relative',
    flex: '1 1 300px',
    display: 'flex',
    alignItems: 'center',
  },
  searchIcon: {
    position: 'absolute',
    left: '0.75rem',
    color: 'var(--text-muted)',
  },
  searchInput: {
    width: '100%',
    padding: '0.625rem 0.625rem 0.625rem 2.5rem',
    borderRadius: 'var(--border-radius-sm)',
    border: '1px solid var(--border-color)',
    fontSize: '0.875rem',
  },
  selectsWrapper: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap',
  },
  filterSelect: {
    padding: '0.625rem 1.75rem 0.625rem 0.75rem',
    borderRadius: 'var(--border-radius-sm)',
    border: '1px solid var(--border-color)',
    backgroundColor: '#fff',
    fontSize: '0.875rem',
    cursor: 'pointer',
  },
  addBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.625rem 1.25rem',
    fontSize: '0.875rem',
    fontWeight: '600',
    backgroundColor: 'var(--secondary-color)',
    color: '#fff',
    border: 'none',
    borderRadius: 'var(--border-radius-sm)',
    cursor: 'pointer',
    transition: 'filter 0.15s ease',
  },
  loadingBox: {
    textAlign: 'center',
    padding: '3rem',
    color: 'var(--text-muted)',
    fontSize: '1rem',
  },
  tabContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  todayBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    backgroundColor: 'rgba(13, 148, 136, 0.05)',
    padding: '0.75rem 1rem',
    borderRadius: 'var(--border-radius-sm)',
    color: 'var(--secondary-color)',
    fontSize: '0.875rem',
    borderLeft: '4px solid var(--secondary-color)',
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
    fontSize: '0.875rem',
  },
  noDataCell: {
    textAlign: 'center',
    padding: '3rem',
    color: 'var(--text-muted)',
  },
  rowCheckedIn: {
    backgroundColor: 'rgba(13, 148, 136, 0.02)',
  },
  patientNameCell: {
    display: 'flex',
    flexDirection: 'column',
    padding: '0.75rem 1rem',
  },
  patName: {
    fontWeight: '600',
    color: 'var(--text-primary)',
  },
  motherName: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
  },
  phoneLabel: {
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
  },
  cnsCell: {
    display: 'flex',
    flexDirection: 'column',
    fontSize: '0.8rem',
  },
  cpfLabel: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
  },
  locationBadges: {
    display: 'flex',
    gap: '0.25rem',
    flexWrap: 'wrap',
  },
  badgeShift: {
    fontSize: '0.7rem',
    padding: '0.15rem 0.4rem',
    borderRadius: '4px',
    backgroundColor: '#f1f5f9',
    color: 'var(--text-secondary)',
    fontWeight: '600',
  },
  badgeRoom: {
    fontSize: '0.7rem',
    padding: '0.15rem 0.4rem',
    borderRadius: '4px',
    backgroundColor: 'var(--primary-light)',
    color: 'var(--primary-color)',
    fontWeight: '600',
  },
  accessBadge: {
    fontSize: '0.75rem',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    backgroundColor: '#f8fafc',
    border: '1px solid var(--border-color)',
    fontWeight: '500',
  },
  apacLabel: {
    fontSize: '0.8rem',
    fontWeight: '600',
  },
  checkinDoneBox: {
    display: 'flex',
    flexDirection: 'column',
  },
  checkinDoneBadge: {
    color: 'var(--success-color)',
    fontWeight: '700',
    fontSize: '0.8rem',
  },
  checkinDetails: {
    fontSize: '0.7rem',
    color: 'var(--text-muted)',
  },
  checkinBtn: {
    backgroundColor: 'var(--secondary-color)',
    color: '#fff',
    border: 'none',
    padding: '0.5rem 0.8rem',
    borderRadius: 'var(--border-radius-sm)',
    fontWeight: '600',
    fontSize: '0.8rem',
    cursor: 'pointer',
    transition: 'filter 0.15s ease',
  },
  insuranceCell: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  insuranceBadge: {
    display: 'inline-block',
    width: 'fit-content',
    fontSize: '0.7rem',
    padding: '0.1rem 0.4rem',
    borderRadius: '4px',
    backgroundColor: 'rgba(8, 145, 178, 0.08)',
    color: 'var(--primary-color)',
    fontWeight: '700',
  },
  apacSubLabel: {
    fontSize: '0.75rem',
    fontWeight: '600',
  },
  actionButtons: {
    display: 'flex',
    gap: '0.25rem',
  },
  actionEditBtn: {
    background: 'none',
    border: '1px solid var(--border-color)',
    borderRadius: '4px',
    padding: '0.35rem',
    cursor: 'pointer',
    color: 'var(--text-secondary)',
  },
  actionDeleteBtn: {
    background: 'none',
    border: '1px solid rgba(225, 29, 72, 0.2)',
    borderRadius: '4px',
    padding: '0.35rem',
    cursor: 'pointer',
    color: 'var(--danger-color)',
  },
  gridTabsContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
  },
  roomSection: {
    backgroundColor: '#fff',
    borderRadius: 'var(--border-radius-lg)',
    border: '1px solid var(--border-color)',
    padding: '1.5rem',
    boxShadow: 'var(--shadow-sm)',
  },
  roomTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '1.15rem',
    color: 'var(--text-primary)',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '0.75rem',
    marginBottom: '1.25rem',
  },
  gridContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '1.5rem',
  },
  shiftCol: {
    backgroundColor: '#f8fafc',
    borderRadius: 'var(--border-radius-md)',
    padding: '1rem',
    border: '1px dashed var(--border-color)',
  },
  shiftColTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    fontSize: '0.9rem',
    color: 'var(--text-secondary)',
    marginBottom: '1rem',
    fontWeight: '700',
  },
  seatsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '0.75rem',
  },
  seatCard: {
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--border-radius-sm)',
    padding: '0.6rem 0.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem',
    transition: 'all 0.15s ease',
  },
  seatEmpty: {
    backgroundColor: '#fff',
    borderColor: '#e2e8f0',
    color: 'var(--text-muted)',
    borderStyle: 'dashed',
  },
  seatOccupied: {
    backgroundColor: '#fff',
    borderColor: '#cbd5e1',
    boxShadow: 'var(--shadow-sm)',
  },
  seatCheckedIn: {
    borderColor: 'var(--secondary-color)',
    backgroundColor: 'rgba(13, 148, 136, 0.02)',
  },
  seatHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    color: 'var(--text-muted)',
  },
  seatNum: {
    fontSize: '0.7rem',
    fontWeight: '700',
  },
  seatBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.1rem',
  },
  seatPatName: {
    fontSize: '0.75rem',
    fontWeight: '600',
    color: 'var(--text-primary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  seatAccessBadge: {
    fontSize: '0.65rem',
    color: 'var(--text-muted)',
  },
  seatStatus: {
    fontSize: '0.65rem',
    color: 'var(--secondary-color)',
    fontWeight: '700',
  },
  seatFreeLabel: {
    fontSize: '0.7rem',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: '0.5rem 0',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    padding: '1rem',
    backdropFilter: 'blur(4px)',
  },
  modalCardLarge: {
    backgroundColor: '#fff',
    borderRadius: 'var(--border-radius-lg)',
    width: '100%',
    maxWidth: '750px',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: 'var(--shadow-lg)',
  },
  modalCardSmall: {
    backgroundColor: '#fff',
    borderRadius: 'var(--border-radius-lg)',
    width: '100%',
    maxWidth: '450px',
    boxShadow: 'var(--shadow-lg)',
    display: 'flex',
    flexDirection: 'column',
    padding: '1.5rem',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.25rem 1.5rem',
    borderBottom: '1px solid var(--border-color)',
  },
  modalCloseBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--text-secondary)',
  },
  modalForm: {
    padding: '1.5rem',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  formSectionGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  sectionHeader: {
    fontSize: '0.95rem',
    color: 'var(--secondary-color)',
    fontWeight: '700',
    borderBottom: '1px solid rgba(13, 148, 136, 0.1)',
    paddingBottom: '0.25rem',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
  },
  modalFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.5rem',
    borderTop: '1px solid var(--border-color)',
    paddingTop: '1.25rem',
    marginTop: '1rem',
  },
  checkinAlertInfo: {
    backgroundColor: 'rgba(13, 148, 136, 0.05)',
    border: '1px solid rgba(13, 148, 136, 0.1)',
    padding: '0.75rem 1rem',
    borderRadius: 'var(--border-radius-sm)',
    fontSize: '0.85rem',
    marginBottom: '1rem',
    lineHeight: '1.4',
  },
  inputHelp: {
    fontSize: '0.725rem',
    color: 'var(--text-muted)',
    marginTop: '0.25rem',
    display: 'block',
  },
  photoUploadContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    backgroundColor: '#f8fafc',
    padding: '1rem',
    borderRadius: 'var(--border-radius-md)',
    border: '1px solid var(--border-color)',
    marginBottom: '1rem',
  },
  photoPreviewWrapper: {
    width: '70px',
    height: '70px',
    borderRadius: '50%',
    overflow: 'hidden',
    border: '2px solid var(--border-color)',
    backgroundColor: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  photoPreview: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  photoPlaceholder: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tablePhoto: {
    width: '38px',
    height: '38px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '1.5px solid var(--border-color)',
    flexShrink: 0,
  },
  tablePhotoPlaceholder: {
    width: '38px',
    height: '38px',
    borderRadius: '50%',
    backgroundColor: 'rgba(13, 148, 136, 0.08)',
    color: 'var(--secondary-color)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '0.95rem',
    border: '1.5px solid rgba(13, 148, 136, 0.1)',
    flexShrink: 0,
  },
  contactsSummary: {
    fontSize: '0.725rem',
    color: 'var(--text-muted)',
    display: 'block',
    marginTop: '0.15rem',
  }
};
