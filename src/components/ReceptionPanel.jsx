import React, { useState, useEffect, useMemo, useRef } from 'react';
import { dbService } from '../firebase';
import { useUnit } from '../contexts/UnitContext';
import UnitSelector from './common/UnitSelector';
import NexAiBrand from './common/NexAiBrand';
import { 
  Plus, Search, Edit2, Trash2, User, Calendar, 
  Check, X, FileText, CheckCircle2, AlertCircle, 
  MapPin, Clock, AlertTriangle, ShieldCheck,
  UserCheck, RefreshCw, Phone, MessageSquare, Heart,
  Activity, ShieldAlert, Sparkles, Tv, ChevronLeft, ChevronRight,
  List, LayoutList, LayoutGrid, Download
} from 'lucide-react';

export const PATIENT_TREATMENT_OPTIONS = [
  'CAPD', 'HD', 'APD', 'DPI', 'TTO Con.', 'TX-Renal', 'Doador', 'Óbito', 'Inativos'
];

export const PATIENT_TYPE_OPTIONS = [
  'Crônico', 'Agudo', 'Trânsito'
];

export default function ReceptionPanel() {
  const { activeUnitId, filterByActiveUnit, matchItemUnit } = useUnit();
  const [activeTab, setActiveTab] = useState('patients'); // 'patients' | 'ronda'
  const [patients, setPatients] = useState([]);
  const [checkins, setCheckins] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [accessTypes, setAccessTypes] = useState([]);
  const [dialysisFrequencies, setDialysisFrequencies] = useState([]);
  const [medicalSchedules, setMedicalSchedules] = useState([]);
  const [medicalDoctors, setMedicalDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [cepLoading, setCepLoading] = useState(false);

  // Filters State (Pacientes)
  const [searchTerm, setSearchTerm] = useState('');
  const [filterShift, setFilterShift] = useState('');
  const [filterRoom, setFilterRoom] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterTreatment, setFilterTreatment] = useState('');
  const [filterPatientType, setFilterPatientType] = useState('');
  const [filterSchedule, setFilterSchedule] = useState('');
  const [patientViewMode, setPatientViewMode] = useState(() => {
    return localStorage.getItem('nexai_reception_view_mode') || 'compact';
  }); // 'compact' | 'normal' | 'cards'
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);
  const searchWrapperRef = useRef(null);

  // Ronda State
  const [rondaDate, setRondaDate] = useState(() => new Date().toISOString().substring(0, 10));
  const [filterRondaSector, setFilterRondaSector] = useState('');
  const [filterRondaShift, setFilterRondaShift] = useState('');
  const [showRondaModal, setShowRondaModal] = useState(false);
  const [editingRonda, setEditingRonda] = useState(null);
  const [rondaForm, setRondaForm] = useState({
    id: '',
    date: '',
    sector: 'Salão 1',
    shift: '1º Turno',
    doctorId: '',
    doctorName: '',
    doctorCrm: '',
    status: 'Presente',
    checkinTime: '',
    substituteName: '',
    notes: ''
  });

  // Modal State (Pacientes)
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
    needleSize: '16',
    heparina: '',
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

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchWrapperRef.current && !searchWrapperRef.current.contains(e.target)) {
        setIsSearchDropdownOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsSearchDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [pList, sList, rList, aList, dList, mList, docList] = await Promise.all([
        dbService.getPatients(),
        dbService.getShifts(),
        dbService.getRooms(),
        dbService.getAccessTypes(),
        dbService.getDialysisFrequencies(),
        dbService.getMedicalSchedules ? dbService.getMedicalSchedules() : [],
        dbService.getMedicalDoctors ? dbService.getMedicalDoctors() : []
      ]);

      setPatients(pList || []);
      setShifts(sList || []);
      setRooms(rList || []);
      setAccessTypes(aList || []);
      setDialysisFrequencies(dList || []);
      setMedicalSchedules(mList || []);
      setMedicalDoctors(docList || []);

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

  const handleOpenAddRonda = () => {
    const now = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    setEditingRonda(null);
    setRondaForm({
      id: '',
      date: rondaDate,
      sector: filterRondaSector || 'Salão 1',
      shift: filterRondaShift || '1º Turno',
      doctorId: medicalDoctors[0]?.id || medicalDoctors[0]?.uid || '',
      doctorName: medicalDoctors[0]?.name || '',
      doctorCrm: medicalDoctors[0]?.crm || '',
      status: 'Presente',
      checkinTime: now,
      substituteName: '',
      notes: ''
    });
    setShowRondaModal(true);
  };

  const handleOpenEditRonda = (item) => {
    setEditingRonda(item);
    setRondaForm({
      id: item.id || '',
      date: item.date || rondaDate,
      sector: item.sector || 'Salão 1',
      shift: item.shift || '1º Turno',
      doctorId: item.doctorId || '',
      doctorName: item.doctorName || '',
      doctorCrm: item.doctorCrm || '',
      status: item.checkinStatus || 'Presente',
      checkinTime: item.checkinTime || '',
      substituteName: item.substituteName || (item.notes?.includes('Substituído por') ? item.notes.replace('Substituído por', '').trim() : ''),
      notes: item.notes || ''
    });
    setShowRondaModal(true);
  };

  const handleSaveRonda = async (e) => {
    e.preventDefault();
    if (!rondaForm.sector || !rondaForm.shift) {
      return showAlert('Setor e Turno são obrigatórios.', 'warning');
    }

    const doc = medicalDoctors.find(d => (d.id || d.uid) === rondaForm.doctorId) || 
                (rondaForm.doctorName ? { name: rondaForm.doctorName, crm: rondaForm.doctorCrm } : null);

    const docName = doc ? doc.name : (rondaForm.doctorName || 'Médico Não Informado');
    const docCrm = doc ? (doc.crm || '') : (rondaForm.doctorCrm || '');
    const month = (rondaForm.date || rondaDate).substring(0, 7);

    const notesFinal = rondaForm.status === 'Substituído' && rondaForm.substituteName
      ? `Substituído por ${rondaForm.substituteName}. ${rondaForm.notes}`.trim()
      : rondaForm.notes;

    const payload = {
      id: editingRonda ? editingRonda.id : undefined,
      month,
      date: rondaForm.date || rondaDate,
      sector: rondaForm.sector,
      shift: rondaForm.shift,
      doctorId: rondaForm.doctorId || (doc ? (doc.id || doc.uid) : ''),
      doctorName: docName,
      doctorCrm: docCrm,
      status: 'Confirmado',
      checkinStatus: rondaForm.status,
      checkinTime: rondaForm.checkinTime || (rondaForm.status === 'Presente' || rondaForm.status === 'Atraso' ? new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : null),
      checkedBy: 'Recepção Central',
      notes: notesFinal,
      unitId: activeUnitId === 'all' ? 'betim' : activeUnitId
    };

    try {
      setActionLoading(true);
      if (dbService.saveMedicalSchedule) {
        await dbService.saveMedicalSchedule(payload);
      }
      showAlert(editingRonda ? 'Ronda médica atualizada!' : 'Ronda médica registrada com sucesso!', 'success');
      setShowRondaModal(false);
      setEditingRonda(null);
      const updated = await dbService.getMedicalSchedules();
      setMedicalSchedules(updated || []);
    } catch (err) {
      console.error(err);
      showAlert('Erro ao salvar dados da ronda médica.', 'danger');
    } finally {
      setActionLoading(false);
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
  const currentPatients = useMemo(() => {
    const list = filterByActiveUnit(patients);
    return list.length > 0 ? list : (patients || []);
  }, [patients, activeUnitId]);
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

  const normalizeSearch = (text) => {
    if (!text) return '';
    return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  };

  const todayScheduleFilter = getTodayWeekday();

  const getFilteredPatients = () => {
    const cleanSearch = normalizeSearch(searchTerm);
    const cleanDigits = searchTerm.replace(/\D/g, '');

    return currentPatients.filter(p => {
      const pName = normalizeSearch(p.name);
      const pSocial = normalizeSearch(p.socialName);
      const pCpf = (p.cpf || '').replace(/\D/g, '');
      const pCns = (p.cns || '').replace(/\D/g, '');
      const pChart = normalizeSearch(p.chartNumber);
      const pChair = (p.chairNumber || p.point || '').toString();

      const matchesSearch = !cleanSearch || 
                            pName.includes(cleanSearch) ||
                            (pSocial && pSocial.includes(cleanSearch)) ||
                            (cleanDigits && pCpf.includes(cleanDigits)) ||
                            (cleanDigits && pCns.includes(cleanDigits)) ||
                            pChart.includes(cleanSearch) ||
                            pChair === cleanSearch;

      const matchesShift = filterShift ? p.shift === filterShift : true;
      const matchesRoom = filterRoom ? p.room === filterRoom : true;
      const patStatus = p.treatmentStatus || 'Ativo';
      const matchesStatus = filterStatus ? patStatus === filterStatus : true;
      const matchesTreatment = filterTreatment ? (p.treatmentType || 'HD') === filterTreatment : true;
      const matchesPatientType = filterPatientType ? (p.patientType || 'Crônico') === filterPatientType : true;
      const matchesSchedule = filterSchedule ? ((p.dialysisFrequency || '').includes(filterSchedule) || p.dialysisFrequency === filterSchedule) : true;

      return matchesSearch && matchesShift && matchesRoom && matchesStatus && matchesTreatment && matchesPatientType && matchesSchedule;
    });
  };

  const handleExportExcel = async () => {
    try {
      const XLSX = await import('xlsx');
      const listToExport = getFilteredPatients();
      if (listToExport.length === 0) {
        return showAlert('Nenhum paciente para exportar com os filtros atuais.', 'warning');
      }

      const rows = listToExport.map((p, idx) => ({
        '#': idx + 1,
        'Nome': p.name || '',
        'Nome Social': p.socialName || '',
        'CPF': p.cpf || '',
        'CNS': p.cns || '',
        'Nascimento': p.birthDate ? new Date(p.birthDate).toLocaleDateString('pt-BR') : '',
        'Idade': calculateAge(p.birthDate) || '',
        'Gênero': p.gender || '',
        'Telefone': p.phone || '',
        'Convênio': p.insurance || 'SUS',
        'Tratamento': p.treatmentType || 'HD',
        'Tipo': p.patientType || 'Crônico',
        'Dias': p.dialysisFrequency || '',
        'Turno': p.shift || '',
        'Sala': p.room || '',
        'Poltrona': p.chairNumber || '',
        'Acesso': p.accessType || '',
        'Status': p.treatmentStatus || 'Ativo'
      }));

      const worksheet = XLSX.utils.json_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Pacientes');

      // Auto width columns
      const maxColLengths = {};
      rows.forEach(row => {
        Object.keys(row).forEach(key => {
          const val = String(row[key] || '');
          maxColLengths[key] = Math.max(maxColLengths[key] || key.length, val.length);
        });
      });
      worksheet['!cols'] = Object.keys(maxColLengths).map(key => ({
        wch: Math.min(Math.max((maxColLengths[key] || 10) + 3, 10), 40)
      }));

      const dateStr = new Date().toISOString().substring(0, 10);
      XLSX.writeFile(workbook, `NexAi_Pacientes_Recepcao_${dateStr}.xlsx`);
      showAlert(`Planilha exportada com sucesso! (${listToExport.length} pacientes)`, 'success');
    } catch (err) {
      console.error('Erro ao exportar pacientes para Excel:', err);
      showAlert('Erro ao gerar exportação Excel.', 'danger');
    }
  };

  const getPatientsForToday = () => {
    const cleanSearch = normalizeSearch(searchTerm);
    const cleanDigits = searchTerm.replace(/\D/g, '');

    // Se o usuário estiver pesquisando explicitamente por nome ou documento, busca em todos os pacientes ativos
    if (cleanSearch) {
      return currentPatients.filter(p => {
        const pName = normalizeSearch(p.name);
        const pSocial = normalizeSearch(p.socialName);
        const pCpf = (p.cpf || '').replace(/\D/g, '');
        const pCns = (p.cns || '').replace(/\D/g, '');
        const pChart = normalizeSearch(p.chartNumber);
        const pChair = (p.chairNumber || p.point || '').toString();

        const matchesSearch = pName.includes(cleanSearch) ||
                              (pSocial && pSocial.includes(cleanSearch)) ||
                              (cleanDigits && pCpf.includes(cleanDigits)) ||
                              (cleanDigits && pCns.includes(cleanDigits)) ||
                              pChart.includes(cleanSearch) ||
                              pChair === cleanSearch;

        const matchesShift = filterShift ? p.shift === filterShift : true;
        const matchesRoom = filterRoom ? p.room === filterRoom : true;

        return matchesSearch && matchesShift && matchesRoom;
      });
    }

    return currentPatients.filter(p => {
      const matchesFrequency = (p.dialysisFrequency || '').includes(todayScheduleFilter) || p.dialysisFrequency === 'Diário';
      const isActive = p.treatmentStatus === 'Ativo';
      const matchesShift = filterShift ? p.shift === filterShift : true;
      const matchesRoom = filterRoom ? p.room === filterRoom : true;

      return matchesFrequency && isActive && matchesShift && matchesRoom;
    });
  };

  // Resultados de autocomplete instantâneo para a barra de pesquisa da recepção
  const searchAutocompleteResults = useMemo(() => {
    if (!searchTerm.trim()) return [];
    const clean = normalizeSearch(searchTerm);
    const cleanDigits = searchTerm.replace(/\D/g, '');
    return currentPatients.filter(p => {
      const pName = normalizeSearch(p.name);
      const pSocial = normalizeSearch(p.socialName);
      const pCpf = (p.cpf || '').replace(/\D/g, '');
      const pCns = (p.cns || '').replace(/\D/g, '');
      return pName.includes(clean) || (pSocial && pSocial.includes(clean)) || (cleanDigits && pCpf.includes(cleanDigits)) || (cleanDigits && pCns.includes(cleanDigits));
    }).slice(0, 8);
  }, [currentPatients, searchTerm]);

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

  // Ronda Filters & Stats
  const filteredRondaSchedules = useMemo(() => {
    return currentMedicalSchedules.filter(s => {
      const matchesDate = s.date === rondaDate;
      const matchesSector = filterRondaSector ? s.sector === filterRondaSector : true;
      const matchesShift = filterRondaShift ? s.shift === filterRondaShift : true;
      return matchesDate && matchesSector && matchesShift;
    });
  }, [currentMedicalSchedules, rondaDate, filterRondaSector, filterRondaShift]);

  const rondaStats = useMemo(() => {
    const daySchedules = currentMedicalSchedules.filter(s => s.date === rondaDate);
    const total = daySchedules.length;
    const presentes = daySchedules.filter(s => s.checkinStatus === 'Presente').length;
    const atrasos = daySchedules.filter(s => s.checkinStatus === 'Atraso').length;
    const substituidos = daySchedules.filter(s => s.checkinStatus === 'Substituído').length;
    const ausentes = daySchedules.filter(s => s.checkinStatus === 'Ausente').length;
    const pendentes = daySchedules.filter(s => !s.checkinStatus || s.checkinStatus === 'Pendente').length;
    return { total, presentes, atrasos, substituidos, ausentes, pendentes };
  }, [currentMedicalSchedules, rondaDate]);

  // KPIs Superiores & Contagem por Status
  const statusCounts = useMemo(() => {
    const counts = { total: currentPatients.length, Ativo: 0, Suspenso: 0, 'Em Trânsito': 0, Transplantado: 0, Óbito: 0 };
    currentPatients.forEach(p => {
      const st = p.treatmentStatus || 'Ativo';
      if (counts[st] !== undefined) counts[st]++;
      else counts.Ativo++;
    });
    return counts;
  }, [currentPatients]);

  const activePatientsCount = statusCounts.Ativo;

  return (
    <div style={styles.container}>
      {/* Header com Design Oficial NexAiBrand Padronizado */}
      <div style={styles.cardHeader}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #0d9488, #0f766e)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(13, 148, 136, 0.25)',
            flexShrink: 0
          }}>
            <UserCheck size={26} color="#fff" />
          </div>
          <div>
            <h1 style={{ margin: 0, display: 'flex', alignItems: 'center' }}>
              <NexAiBrand size="lg" suffix=".RECEPTION" showIcon={false} />
            </h1>
            <p style={styles.subtitle}>
              Admissão completa de pacientes, cadastro clínico e auditoria presencial de ronda médica.
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <UnitSelector compact showLabel={false} />
          <button
            type="button"
            onClick={() => window.open('/tv', '_blank')}
            title="Abrir Painel de TV da Sala de Espera"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.45rem 0.8rem',
              borderRadius: '8px',
              backgroundColor: '#f0f9ff',
              color: '#0284c7',
              border: '1px solid #bae6fd',
              fontSize: '0.825rem',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <Tv size={15} />
            <span>TV</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row (3 Indicadores Consolidados) */}
      <div style={{ ...styles.kpiRow, gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
        <div 
          style={{ ...styles.kpiCard, cursor: 'pointer' }}
          onClick={() => setFilterStatus('')}
          title="Ver todos os pacientes"
        >
          <div style={styles.kpiIconWrap}>
            <User size={20} color="var(--primary-color)" />
          </div>
          <div>
            <span style={styles.kpiLabel}>Pacientes</span>
            <div style={styles.kpiValue}>{currentPatients.length}</div>
            <span style={styles.kpiSub}>Cadastrados na unidade</span>
          </div>
        </div>

        <div 
          style={{ 
            ...styles.kpiCard, 
            borderLeft: '4px solid #10b981',
            cursor: 'pointer',
            backgroundColor: filterStatus === 'Ativo' ? '#f0fdf4' : '#fff'
          }}
          onClick={() => setFilterStatus(filterStatus === 'Ativo' ? '' : 'Ativo')}
          title={filterStatus === 'Ativo' ? 'Filtro de Ativos ativo (clique para limpar)' : 'Filtrar apenas pacientes Ativos'}
        >
          <div style={{ ...styles.kpiIconWrap, backgroundColor: '#ecfdf5' }}>
            <CheckCircle2 size={20} color="#10b981" />
          </div>
          <div>
            <span style={styles.kpiLabel}>Ativos</span>
            <div style={{ ...styles.kpiValue, color: '#10b981' }}>{activePatientsCount}</div>
            <span style={styles.kpiSub}>Em diálise regular</span>
          </div>
        </div>

        <div 
          style={{ ...styles.kpiCard, borderLeft: '4px solid #3b82f6', cursor: 'pointer' }}
          onClick={() => setActiveTab('ronda')}
          title="Ir para a auditoria de ronda"
        >
          <div style={{ ...styles.kpiIconWrap, backgroundColor: '#eff6ff' }}>
            <UserCheck size={20} color="#2563eb" />
          </div>
          <div>
            <span style={styles.kpiLabel}>Ronda</span>
            <div style={{ ...styles.kpiValue, color: '#2563eb' }}>
              {rondaStats.presentes}/{rondaStats.total}
            </div>
            <span style={styles.kpiSub}>Médicos auditados hoje</span>
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div style={styles.tabsWrapper}>
        <button 
          onClick={() => setActiveTab('patients')} 
          style={{ ...styles.tabBtn, ...(activeTab === 'patients' ? styles.tabBtnActive : {}) }}
        >
          <User size={16} /> Pacientes ({currentPatients.length})
        </button>
        <button 
          onClick={() => setActiveTab('ronda')} 
          style={{ ...styles.tabBtn, ...(activeTab === 'ronda' ? styles.tabBtnActive : {}) }}
        >
          <UserCheck size={16} /> Ronda ({rondaStats.total})
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

      {/* Filters & Actions Bar (Pacientes) */}
      {activeTab === 'patients' && (
        <div style={styles.filtersContainer}>
          <div style={styles.filtersBar}>
            {/* Campo de Busca do Paciente */}
            <div ref={searchWrapperRef} style={{ ...styles.searchWrapper, position: 'relative' }}>
              <label style={styles.filterLabel}>
                Paciente:
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Search size={18} style={styles.searchIcon} />
                <input 
                  type="text" 
                  placeholder="Pesquisar por paciente, CPF, CNS ou poltrona..."
                  value={searchTerm}
                  onFocus={() => setIsSearchDropdownOpen(true)}
                  onChange={e => {
                    setSearchTerm(e.target.value);
                    setIsSearchDropdownOpen(true);
                  }}
                  style={{ ...styles.searchInput, textTransform: 'uppercase' }}
                />
                {searchTerm && (
                  <button 
                    type="button"
                    onClick={() => {
                      setSearchTerm('');
                      setIsSearchDropdownOpen(false);
                    }} 
                    style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center' }}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {isSearchDropdownOpen && searchTerm.trim().length >= 1 && searchAutocompleteResults.length > 0 && (
                <div style={styles.patientDropdown}>
                  {searchAutocompleteResults.map(p => (
                    <div 
                      key={p.id} 
                      onClick={() => {
                        setSearchTerm(p.name);
                        setIsSearchDropdownOpen(false);
                      }}
                      style={styles.patientDropdownItem}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
                    >
                      <div style={{ fontWeight: '800', color: '#0f172a', fontSize: '0.92rem', textTransform: 'uppercase' }}>
                        {p.name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                        CPF: {p.cpf || 'N/A'} • {p.room || 'Sem salão'} ({p.shift || 'Turno N/A'})
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Select Turno */}
            <div style={styles.filterCol}>
              <label style={styles.filterLabel}>Turno:</label>
              <select value={filterShift} onChange={e => setFilterShift(e.target.value)} style={styles.filterSelect}>
                <option value="">Todos</option>
                {shifts.map(s => <option key={s.id || s.name} value={s.name}>{s.name}</option>)}
              </select>
            </div>

            {/* Select Sala */}
            <div style={styles.filterCol}>
              <label style={styles.filterLabel}>Sala:</label>
              <select value={filterRoom} onChange={e => setFilterRoom(e.target.value)} style={styles.filterSelect}>
                <option value="">Todas</option>
                {rooms.map(r => <option key={r.id || r.name} value={r.name}>{r.name}</option>)}
              </select>
            </div>

            {/* Select Status */}
            <div style={styles.filterCol}>
              <label style={styles.filterLabel}>Status:</label>
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={styles.filterSelect}>
                <option value="">Todos</option>
                <option value="Ativo">Ativo</option>
                <option value="Suspenso">Suspenso</option>
                <option value="Em Trânsito">Em Trânsito</option>
                <option value="Transplantado">Transplantado</option>
                <option value="Óbito">Óbito</option>
              </select>
            </div>

            {/* Select Tratamento */}
            <div style={styles.filterCol}>
              <label style={styles.filterLabel}>Tratamento:</label>
              <select value={filterTreatment} onChange={e => setFilterTreatment(e.target.value)} style={styles.filterSelect}>
                <option value="">Todos</option>
                {PATIENT_TREATMENT_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>

            {/* Select Tipo */}
            <div style={styles.filterCol}>
              <label style={styles.filterLabel}>Tipo:</label>
              <select value={filterPatientType} onChange={e => setFilterPatientType(e.target.value)} style={styles.filterSelect}>
                <option value="">Todos</option>
                {PATIENT_TYPE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>

            {/* Select Dias */}
            <div style={styles.filterCol}>
              <label style={styles.filterLabel}>Dias:</label>
              <select value={filterSchedule} onChange={e => setFilterSchedule(e.target.value)} style={styles.filterSelect}>
                <option value="">Todos</option>
                {dialysisFrequencies.map(f => <option key={f.id} value={f.name}>{f.name}</option>)}
              </select>
            </div>

            {/* Seletor de Visão (Compacto / Normal / Cards) */}
            <div style={styles.filterCol}>
              <label style={styles.filterLabel}>Visão:</label>
              <div style={styles.viewToggleGroup}>
                <button
                  type="button"
                  onClick={() => {
                    setPatientViewMode('compact');
                    localStorage.setItem('nexai_reception_view_mode', 'compact');
                  }}
                  style={{
                    ...styles.viewToggleBtn,
                    ...(patientViewMode === 'compact' ? styles.viewToggleBtnActive : {})
                  }}
                  title="Visão Compacta (Alta densidade, padrão)"
                >
                  <List size={14} />
                  <span>Compacto</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPatientViewMode('normal');
                    localStorage.setItem('nexai_reception_view_mode', 'normal');
                  }}
                  style={{
                    ...styles.viewToggleBtn,
                    ...(patientViewMode === 'normal' ? styles.viewToggleBtnActive : {})
                  }}
                  title="Visão Normal (Tabular detalhada)"
                >
                  <LayoutList size={14} />
                  <span>Normal</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPatientViewMode('cards');
                    localStorage.setItem('nexai_reception_view_mode', 'cards');
                  }}
                  style={{
                    ...styles.viewToggleBtn,
                    ...(patientViewMode === 'cards' ? styles.viewToggleBtnActive : {})
                  }}
                  title="Visão em Cards (Grade responsiva)"
                >
                  <LayoutGrid size={14} />
                  <span>Cards</span>
                </button>
              </div>
            </div>

            {/* Botão Exportar Excel */}
            <div style={styles.filterCol}>
              <label style={{ ...styles.filterLabel, visibility: 'hidden' }}>Exportar:</label>
              <button 
                type="button" 
                onClick={handleExportExcel} 
                style={{
                  ...styles.addBtn,
                  backgroundColor: '#059669',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.5rem 0.85rem'
                }}
                title="Exportar lista filtrada para planilha Excel (.xlsx)"
              >
                <Download size={15} /> Exportar
              </button>
            </div>

            {/* Botão Admissão */}
            <div style={styles.filterCol}>
              <label style={{ ...styles.filterLabel, visibility: 'hidden' }}>Ação:</label>
              <button onClick={handleOpenAddModal} style={styles.addBtn}>
                <Plus size={16} /> Admissão
              </button>
            </div>
          </div>

          {/* Barra de Pílulas Rápidas de Status com Contadores */}
          <div style={styles.statusChipsBar}>
            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', alignSelf: 'center', marginRight: '4px' }}>
              Status:
            </span>
            {[
              { key: '', label: 'Todos', count: statusCounts.total, color: '#475569', bg: '#f1f5f9' },
              { key: 'Ativo', label: 'Ativo', count: statusCounts.Ativo, color: '#15803d', bg: '#dcfce7' },
              { key: 'Suspenso', label: 'Suspenso', count: statusCounts.Suspenso, color: '#b45309', bg: '#fef3c7' },
              { key: 'Em Trânsito', label: 'Em Trânsito', count: statusCounts['Em Trânsito'], color: '#2563eb', bg: '#eff6ff' },
              { key: 'Transplantado', label: 'Transplantado', count: statusCounts.Transplantado, color: '#7c3aed', bg: '#f3e8ff' },
              { key: 'Óbito', label: 'Óbito', count: statusCounts.Óbito, color: '#64748b', bg: '#f1f5f9' },
            ].map(pill => {
              const isSelected = filterStatus === pill.key;
              return (
                <button
                  key={pill.label}
                  type="button"
                  onClick={() => setFilterStatus(isSelected && pill.key !== '' ? '' : pill.key)}
                  style={{
                    ...styles.statusChip,
                    backgroundColor: isSelected ? pill.color : pill.bg,
                    color: isSelected ? '#ffffff' : pill.color,
                    border: isSelected ? `1px solid ${pill.color}` : '1px solid transparent',
                    boxShadow: isSelected ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'
                  }}
                >
                  <span>{pill.label}</span>
                  <span style={{
                    fontSize: '0.7rem',
                    fontWeight: '800',
                    padding: '0.1rem 0.4rem',
                    borderRadius: '999px',
                    backgroundColor: isSelected ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.06)'
                  }}>
                    {pill.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {loading ? (
        <div style={styles.loadingBox}>Carregando recepção...</div>
      ) : (
        <>
          {/* TAB 1: Patients List (3 Formas de Visualização) */}
          {activeTab === 'patients' && (
            <>
              {filteredPatients.length === 0 ? (
                <div style={styles.noDataBox}>
                  <AlertCircle size={36} color="#94a3b8" />
                  <div style={{ fontWeight: '700', color: '#475569', fontSize: '0.95rem', marginTop: '0.5rem' }}>
                    Nenhum paciente cadastrado para os filtros atuais.
                  </div>
                  {(searchTerm || filterShift || filterRoom || filterStatus || filterTreatment || filterPatientType || filterSchedule) && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchTerm('');
                        setFilterShift('');
                        setFilterRoom('');
                        setFilterStatus('');
                        setFilterTreatment('');
                        setFilterPatientType('');
                        setFilterSchedule('');
                      }}
                      style={styles.clearFiltersBtn}
                    >
                      Limpar filtros
                    </button>
                  )}
                </div>
              ) : patientViewMode === 'compact' ? (
                /* 1. VISÃO COMPACTA (PADRÃO) */
                <div style={styles.tableWrapper}>
                  <table style={styles.compactTable}>
                    <thead>
                      <tr style={styles.compactTheadRow}>
                        <th style={styles.compactTh}>Paciente</th>
                        <th style={styles.compactTh}>Documento</th>
                        <th style={styles.compactTh}>Nascimento</th>
                        <th style={styles.compactTh}>Convênio</th>
                        <th style={styles.compactTh}>Tratamento</th>
                        <th style={styles.compactTh}>Dias</th>
                        <th style={styles.compactTh}>Acesso</th>
                        <th style={styles.compactTh}>Status</th>
                        <th style={{ ...styles.compactTh, textAlign: 'center' }}>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPatients.map(pat => {
                        const age = calculateAge(pat.birthDate);
                        const isAtivo = (pat.treatmentStatus || 'Ativo') === 'Ativo';
                        return (
                          <tr key={pat.id} style={styles.compactTr}>
                            <td style={styles.compactTd}>
                              <div style={styles.compactPatientCell}>
                                {pat.photo ? (
                                  <img src={pat.photo} alt={pat.name} style={styles.compactPhoto} />
                                ) : (
                                  <div style={styles.compactPhotoPlaceholder}>
                                    {pat.name.charAt(0)}
                                  </div>
                                )}
                                <div style={styles.compactNameBlock}>
                                  <span style={styles.compactPatName}>{pat.name}</span>
                                  <span style={styles.compactPhoneLabel}>☎ {pat.phone || 'Sem telefone'}</span>
                                </div>
                              </div>
                            </td>
                            <td style={styles.compactTd}>
                              <div style={styles.compactDocCell}>
                                <span style={styles.compactCpf}>{pat.cpf || '-'}</span>
                                <small style={styles.compactCns}>CNS: {pat.cns || '-'}</small>
                              </div>
                            </td>
                            <td style={styles.compactTd}>
                              <span style={{ fontSize: '0.8rem', color: '#334155' }}>
                                {pat.birthDate ? new Date(pat.birthDate).toLocaleDateString('pt-BR') : '-'}
                              </span>
                              <small style={{ color: '#64748b', fontSize: '0.72rem', marginLeft: '3px' }}>({age}a)</small>
                            </td>
                            <td style={styles.compactTd}>
                              <span style={styles.compactInsuranceBadge}>{pat.insurance || 'SUS'}</span>
                            </td>
                            <td style={styles.compactTd}>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                <span style={{
                                  fontSize: '0.72rem',
                                  fontWeight: '700',
                                  padding: '0.1rem 0.4rem',
                                  borderRadius: '4px',
                                  backgroundColor: '#e0f2fe',
                                  color: '#0369a1',
                                  display: 'inline-block',
                                  width: 'fit-content'
                                }}>
                                  {pat.treatmentType || 'HD'}
                                </span>
                                <small style={{ fontSize: '0.7rem', color: '#64748b' }}>
                                  {pat.patientType || 'Crônico'}
                                </small>
                              </div>
                            </td>
                            <td style={styles.compactTd}>
                              <span style={{ fontSize: '0.8rem', color: '#475569' }}>
                                {pat.dialysisFrequency || 'Seg/Qua/Sex'}
                              </span>
                            </td>
                            <td style={styles.compactTd}>
                              <span style={styles.compactAccessBadge}>{pat.accessType || 'FAV'}</span>
                            </td>
                            <td style={styles.compactTd}>
                              <span style={{
                                fontSize: '0.72rem',
                                fontWeight: '700',
                                padding: '0.15rem 0.5rem',
                                borderRadius: '4px',
                                backgroundColor: isAtivo ? '#dcfce7' : '#fee2e2',
                                color: isAtivo ? '#15803d' : '#b91c1c'
                              }}>
                                {pat.treatmentStatus || 'Ativo'}
                              </span>
                            </td>
                            <td style={{ ...styles.compactTd, textAlign: 'center' }}>
                              <div style={styles.compactActionButtons}>
                                <button 
                                  onClick={() => openWhatsApp(pat.phone, pat.name)} 
                                  style={styles.compactActionWhatsBtn} 
                                  title="Conversar no WhatsApp"
                                >
                                  <MessageSquare size={13} />
                                </button>
                                <button 
                                  onClick={() => handleOpenEditModal(pat)} 
                                  style={styles.compactActionEditBtn} 
                                  title="Editar cadastro"
                                >
                                  <Edit2 size={13} />
                                </button>
                                <button 
                                  onClick={() => handleDeletePatient(pat.id)} 
                                  style={styles.compactActionDeleteBtn} 
                                  title="Excluir cadastro"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : patientViewMode === 'normal' ? (
                /* 2. VISÃO NORMAL (TABULAR DETALHADA) */
                <div style={styles.tableWrapper}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th>Paciente</th>
                        <th>Documento</th>
                        <th>Nascimento</th>
                        <th>Convênio</th>
                        <th>Tratamento</th>
                        <th>Dias</th>
                        <th>Acesso</th>
                        <th>Status</th>
                        <th style={{ textAlign: 'center' }}>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPatients.map(pat => {
                        const apacInfo = getApacStatus(pat.apacExpiry);
                        const age = calculateAge(pat.birthDate);
                        const isAtivo = (pat.treatmentStatus || 'Ativo') === 'Ativo';
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
                            <td>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                                <span style={{
                                  fontSize: '0.75rem',
                                  fontWeight: '700',
                                  padding: '0.15rem 0.5rem',
                                  borderRadius: '4px',
                                  backgroundColor: '#e0f2fe',
                                  color: '#0369a1',
                                  display: 'inline-block',
                                  width: 'fit-content'
                                }}>
                                  {pat.treatmentType || 'HD'}
                                </span>
                                <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                                  {pat.patientType || 'Crônico'}
                                </span>
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
                                backgroundColor: isAtivo ? '#dcfce7' : '#fee2e2',
                                color: isAtivo ? '#15803d' : '#b91c1c'
                              }}>
                                {pat.treatmentStatus || 'Ativo'}
                              </span>
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <div style={{ ...styles.actionButtons, justifyContent: 'center' }}>
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
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                /* 3. VISÃO EM CARDS (GRADE RESPONSIVA) */
                <div style={styles.cardsGrid}>
                  {filteredPatients.map(pat => {
                    const age = calculateAge(pat.birthDate);
                    const hasEmergency = pat.contacts && pat.contacts.length > 0;
                    const isAtivo = (pat.treatmentStatus || 'Ativo') === 'Ativo';
                    return (
                      <div key={pat.id} style={styles.patientCard}>
                        {/* Card Header */}
                        <div style={styles.cardTop}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0, flex: 1 }}>
                            {pat.photo ? (
                              <img src={pat.photo} alt={pat.name} style={styles.cardPhoto} />
                            ) : (
                              <div style={styles.cardPhotoPlaceholder}>
                                {pat.name.charAt(0)}
                              </div>
                            )}
                            <div style={{ minWidth: 0 }}>
                              <div style={styles.cardPatName} title={pat.name}>{pat.name}</div>
                              <div style={styles.cardMeta}>
                                <span>CPF: {pat.cpf || '-'}</span>
                                <span>•</span>
                                <span>{age} anos</span>
                              </div>
                            </div>
                          </div>
                          <span style={{
                            fontSize: '0.72rem',
                            fontWeight: '700',
                            padding: '0.2rem 0.55rem',
                            borderRadius: '6px',
                            backgroundColor: isAtivo ? '#dcfce7' : '#fee2e2',
                            color: isAtivo ? '#15803d' : '#b91c1c',
                            flexShrink: 0
                          }}>
                            {pat.treatmentStatus || 'Ativo'}
                          </span>
                        </div>

                        {/* Alocação (Sala, Turno, Poltrona) */}
                        <div style={styles.cardAlocacao}>
                          <div style={styles.cardAlocacaoItem}>
                            <span style={styles.cardAlocacaoLabel}>Sala</span>
                            <span style={styles.cardAlocacaoVal}>{pat.room || 'Sem sala'}</span>
                          </div>
                          <div style={styles.cardAlocacaoItem}>
                            <span style={styles.cardAlocacaoLabel}>Turno</span>
                            <span style={styles.cardAlocacaoVal}>{pat.shift || 'Sem turno'}</span>
                          </div>
                          <div style={styles.cardAlocacaoItem}>
                            <span style={styles.cardAlocacaoLabel}>Poltrona</span>
                            <span style={styles.cardAlocacaoVal}>{pat.chairNumber ? `Nº ${pat.chairNumber}` : '-'}</span>
                          </div>
                        </div>

                        {/* Detalhes Clínicos */}
                        <div style={styles.cardTagsRow}>
                          <span style={styles.cardTag}>{pat.insurance || 'SUS'}</span>
                          <span style={{
                            fontSize: '0.72rem',
                            fontWeight: '700',
                            padding: '0.15rem 0.5rem',
                            borderRadius: '4px',
                            backgroundColor: '#e0f2fe',
                            color: '#0369a1'
                          }}>
                            {pat.treatmentType || 'HD'}
                          </span>
                          <span style={{
                            fontSize: '0.72rem',
                            fontWeight: '700',
                            padding: '0.15rem 0.5rem',
                            borderRadius: '4px',
                            backgroundColor: '#fef3c7',
                            color: '#b45309'
                          }}>
                            {pat.patientType || 'Crônico'}
                          </span>
                          <span style={styles.cardTagFrequency}>{pat.dialysisFrequency || 'Seg/Qua/Sex'}</span>
                          <span style={styles.cardTagAccess}>{pat.accessType || 'FAV'}</span>
                        </div>

                        {/* Contato e Recado */}
                        <div style={styles.cardContactInfo}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: '#334155' }}>
                            <Phone size={13} color="#64748b" />
                            <span style={{ fontWeight: '600' }}>{pat.phone || 'Sem telefone'}</span>
                          </div>
                          {hasEmergency && (
                            <div style={{ fontSize: '0.73rem', color: '#0284c7', marginTop: '2px' }}>
                              Recado ({pat.contacts[0].relationship}): {pat.contacts[0].name}
                            </div>
                          )}
                        </div>

                        {/* Rodapé com Ações */}
                        <div style={styles.cardActionsRow}>
                          <button
                            type="button"
                            onClick={() => openWhatsApp(pat.phone, pat.name)}
                            style={styles.cardActionWhats}
                            title="WhatsApp"
                          >
                            <MessageSquare size={13} />
                            <span>WhatsApp</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(pat)}
                            style={styles.cardActionEdit}
                            title="Editar cadastro"
                          >
                            <Edit2 size={13} />
                            <span>Editar</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeletePatient(pat.id)}
                            style={styles.cardActionDelete}
                            title="Excluir cadastro"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* TAB 2: Ronda Médica Presencial */}
          {activeTab === 'ronda' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Barra de Filtros e Controles da Ronda */}
              <div style={{ 
                backgroundColor: '#fff', 
                border: '1px solid #e2e8f0', 
                borderRadius: '12px', 
                padding: '1rem 1.25rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem'
              }}>
                {/* Seletor de Data */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase' }}>
                    Data:
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', backgroundColor: '#f8fafc', padding: '0.2rem 0.4rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                    <button
                      type="button"
                      onClick={() => {
                        const d = new Date(rondaDate + 'T12:00:00');
                        d.setDate(d.getDate() - 1);
                        setRondaDate(d.toISOString().substring(0, 10));
                      }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569', display: 'flex', alignItems: 'center', padding: '4px' }}
                      title="Dia anterior"
                    >
                      <ChevronLeft size={16} />
                    </button>

                    <input 
                      type="date"
                      value={rondaDate}
                      onChange={e => setRondaDate(e.target.value)}
                      style={{
                        border: 'none',
                        background: 'transparent',
                        fontSize: '0.88rem',
                        fontWeight: '700',
                        color: '#0f172a',
                        outline: 'none',
                        cursor: 'pointer'
                      }}
                    />

                    <button
                      type="button"
                      onClick={() => {
                        const d = new Date(rondaDate + 'T12:00:00');
                        d.setDate(d.getDate() + 1);
                        setRondaDate(d.toISOString().substring(0, 10));
                      }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569', display: 'flex', alignItems: 'center', padding: '4px' }}
                      title="Próximo dia"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setRondaDate(new Date().toISOString().substring(0, 10))}
                    style={{
                      padding: '0.35rem 0.75rem',
                      fontSize: '0.78rem',
                      fontWeight: '700',
                      backgroundColor: rondaDate === new Date().toISOString().substring(0, 10) ? '#e0e7ff' : '#f1f5f9',
                      color: rondaDate === new Date().toISOString().substring(0, 10) ? '#4338ca' : '#475569',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    Hoje
                  </button>
                </div>

                {/* Filtros de Setor, Turno e Botão Nova Ronda */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                  <select 
                    value={filterRondaSector} 
                    onChange={e => setFilterRondaSector(e.target.value)}
                    style={{
                      padding: '0.45rem 0.75rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.82rem',
                      backgroundColor: '#fff',
                      color: '#334155',
                      fontWeight: '600'
                    }}
                  >
                    <option value="">Setores</option>
                    <option value="Salão 1">Salão 1</option>
                    <option value="Salão 2">Salão 2</option>
                    <option value="Salão 3">Salão 3</option>
                    <option value="DP">DP</option>
                  </select>

                  <select 
                    value={filterRondaShift} 
                    onChange={e => setFilterRondaShift(e.target.value)}
                    style={{
                      padding: '0.45rem 0.75rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.82rem',
                      backgroundColor: '#fff',
                      color: '#334155',
                      fontWeight: '600'
                    }}
                  >
                    <option value="">Turnos</option>
                    <option value="1º Turno">1º Turno</option>
                    <option value="2º Turno">2º Turno</option>
                    <option value="3º Turno">3º Turno</option>
                  </select>

                  <button 
                    type="button" 
                    onClick={handleOpenAddRonda}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      padding: '0.45rem 0.9rem',
                      backgroundColor: 'var(--primary-color)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '0.82rem',
                      fontWeight: '700',
                      cursor: 'pointer',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                    }}
                  >
                    <Plus size={16} /> Registrar Ronda
                  </button>
                </div>
              </div>

              {/* Indicadores KPI da Ronda em Linha Única */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: '0.75rem'
              }}>
                <div style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.85rem 1rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b' }}>Escalados</span>
                  <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0f172a', marginTop: '2px' }}>
                    {rondaStats.total}
                  </div>
                </div>

                <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '0.85rem 1rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#166534' }}>Presentes</span>
                  <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#16a34a', marginTop: '2px' }}>
                    {rondaStats.presentes}
                  </div>
                </div>

                <div style={{ backgroundColor: '#fefce8', border: '1px solid #fef08a', borderRadius: '10px', padding: '0.85rem 1rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#854d0e' }}>Atrasos</span>
                  <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#ca8a04', marginTop: '2px' }}>
                    {rondaStats.atrasos}
                  </div>
                </div>

                <div style={{ backgroundColor: '#faf5ff', border: '1px solid #e9d5ff', borderRadius: '10px', padding: '0.85rem 1rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#6b21a8' }}>Substituídos</span>
                  <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#9333ea', marginTop: '2px' }}>
                    {rondaStats.substituidos}
                  </div>
                </div>

                <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '0.85rem 1rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#991b1b' }}>Ausentes</span>
                  <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#dc2626', marginTop: '2px' }}>
                    {rondaStats.ausentes}
                  </div>
                </div>

                <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.85rem 1rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b' }}>Pendentes</span>
                  <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#64748b', marginTop: '2px' }}>
                    {rondaStats.pendentes}
                  </div>
                </div>
              </div>

              {/* Lista de Cards da Ronda */}
              <div style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '800', color: '#0f172a' }}>
                      Auditoria de Presença Médica
                    </h3>
                    <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                      Plantões escalados para {new Date(rondaDate + 'T12:00:00').toLocaleDateString('pt-BR')}.
                    </p>
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: '800', backgroundColor: '#eff6ff', color: '#1d4ed8', padding: '0.25rem 0.65rem', borderRadius: '6px' }}>
                    {filteredRondaSchedules.length} plantão(ões)
                  </span>
                </div>

                {filteredRondaSchedules.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3.5rem 1rem', color: '#64748b' }}>
                    <AlertCircle size={36} color="#94a3b8" style={{ marginBottom: '0.75rem' }} />
                    <h4 style={{ margin: '0 0 0.4rem 0', fontSize: '1rem', fontWeight: '800', color: '#334155' }}>
                      Nenhum plantão localizado para esta data
                    </h4>
                    <p style={{ margin: '0 0 1.25rem 0', fontSize: '0.82rem', color: '#94a3b8' }}>
                      Não há escala médica cadastrada para {new Date(rondaDate + 'T12:00:00').toLocaleDateString('pt-BR')} com os filtros selecionados.
                    </p>
                    <button 
                      type="button" 
                      onClick={handleOpenAddRonda}
                      style={{
                        padding: '0.5rem 1.2rem',
                        backgroundColor: 'var(--primary-color)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '0.82rem',
                        fontWeight: '700',
                        cursor: 'pointer'
                      }}
                    >
                      <Plus size={15} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                      Registrar Presença Médica Agora
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
                    {filteredRondaSchedules.map(sch => {
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
                            padding: '1.1rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.85rem',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                              <span style={{ 
                                fontSize: '0.72rem', 
                                fontWeight: '800', 
                                backgroundColor: '#e2e8f0', 
                                color: '#1e293b', 
                                padding: '0.2rem 0.55rem', 
                                borderRadius: '5px' 
                              }}>
                                {sch.sector} • {sch.shift}
                              </span>
                              <h4 style={{ margin: '0.45rem 0 0 0', fontSize: '1rem', fontWeight: '800', color: '#0f172a' }}>
                                {sch.doctorName}
                              </h4>
                              <span style={{ fontSize: '0.76rem', color: '#64748b' }}>
                                CRM: {sch.doctorCrm || 'Não informado'}
                              </span>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                              {isPresent ? (
                                <span style={{ fontSize: '0.72rem', fontWeight: '800', backgroundColor: '#dcfce7', color: '#166534', padding: '0.25rem 0.55rem', borderRadius: '5px' }}>
                                  ✓ Presente {sch.checkinTime ? `(${sch.checkinTime})` : ''}
                                </span>
                              ) : isLate ? (
                                <span style={{ fontSize: '0.72rem', fontWeight: '800', backgroundColor: '#fef9c3', color: '#854d0e', padding: '0.25rem 0.55rem', borderRadius: '5px' }}>
                                  ⚠ Atraso {sch.checkinTime ? `(${sch.checkinTime})` : ''}
                                </span>
                              ) : isAbsent ? (
                                <span style={{ fontSize: '0.72rem', fontWeight: '800', backgroundColor: '#fee2e2', color: '#991b1b', padding: '0.25rem 0.55rem', borderRadius: '5px' }}>
                                  ✕ Ausente
                                </span>
                              ) : isReplaced ? (
                                <span style={{ fontSize: '0.72rem', fontWeight: '800', backgroundColor: '#ede9fe', color: '#6d28d9', padding: '0.25rem 0.55rem', borderRadius: '5px' }}>
                                  🔄 Substituído
                                </span>
                              ) : (
                                <span style={{ fontSize: '0.72rem', fontWeight: '700', backgroundColor: '#f1f5f9', color: '#64748b', padding: '0.25rem 0.55rem', borderRadius: '5px' }}>
                                  Pendente
                                </span>
                              )}

                              <button
                                type="button"
                                onClick={() => handleOpenEditRonda(sch)}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  cursor: 'pointer',
                                  color: '#64748b',
                                  padding: '4px',
                                  borderRadius: '4px'
                                }}
                                title="Editar dados da ronda"
                              >
                                <Edit2 size={14} />
                              </button>
                            </div>
                          </div>

                          {/* Notas ou Informação de Substituto */}
                          {sch.notes && (
                            <div style={{ fontSize: '0.74rem', color: '#334155', backgroundColor: '#fff', padding: '0.45rem 0.65rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                              📝 {sch.notes}
                            </div>
                          )}

                          {/* Ações Rápidas de Presença */}
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.4rem', marginTop: 'auto' }}>
                            <button
                              type="button"
                              onClick={() => handleMedicalCheckin(sch.id, 'Presente')}
                              style={{
                                padding: '0.42rem 0.2rem',
                                fontSize: '0.72rem',
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
                                padding: '0.42rem 0.2rem',
                                fontSize: '0.72rem',
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
                                padding: '0.42rem 0.2rem',
                                fontSize: '0.72rem',
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
                                padding: '0.42rem 0.2rem',
                                fontSize: '0.72rem',
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
                        <label>Mãe *</label>
                        <input 
                          type="text" className="form-control" placeholder="Nome Completo da Mãe (Obrigatório SUS)"
                          value={patientForm.motherName} onChange={e => setPatientForm({ ...patientForm, motherName: e.target.value })}
                        />
                      </div>
                      <div className="form-group" style={{ gridColumn: 'span 2' }}>
                        <label>Pai</label>
                        <input 
                          type="text" className="form-control" placeholder="Nome do pai ou responsável"
                          value={patientForm.fatherName} onChange={e => setPatientForm({ ...patientForm, fatherName: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label>Tipo *</label>
                        <select 
                          className="form-control" value={patientForm.patientType} 
                          onChange={e => setPatientForm({ ...patientForm, patientType: e.target.value })}
                        >
                          {PATIENT_TYPE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Tratamento *</label>
                        <select 
                          className="form-control" value={patientForm.treatmentType} 
                          onChange={e => setPatientForm({ ...patientForm, treatmentType: e.target.value })}
                        >
                          {PATIENT_TREATMENT_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Dias *</label>
                        <select 
                          className="form-control" value={patientForm.dialysisFrequency}
                          onChange={e => setPatientForm({ ...patientForm, dialysisFrequency: e.target.value })}
                        >
                          {dialysisFrequencies.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
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
                        <label>Tratamento *</label>
                        <select 
                          className="form-control" value={patientForm.treatmentType}
                          onChange={e => setPatientForm({ ...patientForm, treatmentType: e.target.value })}
                        >
                          {PATIENT_TREATMENT_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Tipo *</label>
                        <select 
                          className="form-control" value={patientForm.patientType} 
                          onChange={e => setPatientForm({ ...patientForm, patientType: e.target.value })}
                        >
                          {PATIENT_TYPE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Dias *</label>
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
                        <label>Sala *</label>
                        <select 
                          className="form-control" value={patientForm.room}
                          onChange={e => setPatientForm({ ...patientForm, room: e.target.value })}
                        >
                          {rooms.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Poltrona *</label>
                        <input 
                          type="number" min="1" max="20" className="form-control"
                          value={patientForm.chairNumber} onChange={e => setPatientForm({ ...patientForm, chairNumber: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label>Acesso *</label>
                        <select 
                          className="form-control" value={patientForm.accessType}
                          onChange={e => setPatientForm({ ...patientForm, accessType: e.target.value })}
                        >
                          {accessTypes.map(a => <option key={a.id} value={a.name}>{a.name}</option>)}
                        </select>
                      </div>
                      {patientForm.accessType === 'Fístula Arteriovenosa' && (
                        <div className="form-group">
                          <label>Agulha</label>
                          <select
                            className="form-control"
                            value={patientForm.needleSize || '16'}
                            onChange={e => setPatientForm({ ...patientForm, needleSize: e.target.value })}
                          >
                            <option value="15">Agulha 15</option>
                            <option value="16">Agulha 16</option>
                            <option value="17">Agulha 17</option>
                          </select>
                        </div>
                      )}
                      <div className="form-group">
                        <label>Heparina</label>
                        <input 
                          type="text" className="form-control" placeholder="Ex: 1,5 ml, 2,0 ml, NA"
                          value={patientForm.heparina || ''} onChange={e => setPatientForm({ ...patientForm, heparina: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label>Sítio</label>
                        <input 
                          type="text" className="form-control" placeholder="Ex: MSE Rádio-Cefálica, Jugular D"
                          value={patientForm.accessSide} onChange={e => setPatientForm({ ...patientForm, accessSide: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label>Peso (kg)</label>
                        <input 
                          type="number" step="0.1" className="form-control" placeholder="65.0"
                          value={patientForm.dryWeight} onChange={e => setPatientForm({ ...patientForm, dryWeight: e.target.value })}
                        />
                      </div>
                      <div className="form-group" style={{ gridColumn: 'span 2' }}>
                        <label>Médico</label>
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

      {/* Modal de Ronda Médica */}
      {showRondaModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCardSmall}>
            <div style={styles.modalHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <UserCheck size={20} color="var(--primary-color)" />
                <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800' }}>
                  {editingRonda ? 'Editar Ronda Médica' : 'Registrar Presença Médica'}
                </h2>
              </div>
              <button 
                type="button" 
                onClick={() => setShowRondaModal(false)} 
                style={styles.modalCloseBtn}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveRonda} style={styles.modalForm}>
              <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                {/* Linha 1: Data, Setor e Turno */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.6rem' }}>
                  <div className="form-group">
                    <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#475569' }}>Data *</label>
                    <input 
                      type="date" 
                      className="form-control" 
                      required
                      value={rondaForm.date || rondaDate} 
                      onChange={e => setRondaForm({ ...rondaForm, date: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#475569' }}>Setor *</label>
                    <select 
                      className="form-control" 
                      required
                      value={rondaForm.sector} 
                      onChange={e => setRondaForm({ ...rondaForm, sector: e.target.value })}
                    >
                      <option value="Salão 1">Salão 1</option>
                      <option value="Salão 2">Salão 2</option>
                      <option value="Salão 3">Salão 3</option>
                      <option value="DP">DP</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#475569' }}>Turno *</label>
                    <select 
                      className="form-control" 
                      required
                      value={rondaForm.shift} 
                      onChange={e => setRondaForm({ ...rondaForm, shift: e.target.value })}
                    >
                      <option value="1º Turno">1º Turno</option>
                      <option value="2º Turno">2º Turno</option>
                      <option value="3º Turno">3º Turno</option>
                    </select>
                  </div>
                </div>

                {/* Linha 2: Médico */}
                <div className="form-group">
                  <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#475569' }}>Médico Escalado *</label>
                  <select 
                    className="form-control"
                    value={rondaForm.doctorId}
                    onChange={e => {
                      const docId = e.target.value;
                      const selected = medicalDoctors.find(d => (d.id || d.uid) === docId);
                      if (selected) {
                        setRondaForm({
                          ...rondaForm,
                          doctorId: docId,
                          doctorName: selected.name,
                          doctorCrm: selected.crm || ''
                        });
                      } else {
                        setRondaForm({
                          ...rondaForm,
                          doctorId: docId,
                          doctorName: '',
                          doctorCrm: ''
                        });
                      }
                    }}
                  >
                    <option value="">Selecione o médico...</option>
                    {medicalDoctors.map(doc => (
                      <option key={doc.id || doc.uid} value={doc.id || doc.uid}>
                        {doc.name} {doc.crm ? `(CRM: ${doc.crm})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Caso precise de digitação manual de médico */}
                {(!rondaForm.doctorId || medicalDoctors.length === 0) && (
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.6rem' }}>
                    <div className="form-group">
                      <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#475569' }}>Nome do Médico</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="Nome completo do médico"
                        value={rondaForm.doctorName} 
                        onChange={e => setRondaForm({ ...rondaForm, doctorName: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#475569' }}>CRM</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="Ex: 54321-MG"
                        value={rondaForm.doctorCrm} 
                        onChange={e => setRondaForm({ ...rondaForm, doctorCrm: e.target.value })}
                      />
                    </div>
                  </div>
                )}

                {/* Linha 3: Status da Presença e Horário */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#475569' }}>Status da Presença *</label>
                    <select 
                      className="form-control" 
                      required
                      value={rondaForm.status} 
                      onChange={e => setRondaForm({ ...rondaForm, status: e.target.value })}
                    >
                      <option value="Presente">✓ Presente</option>
                      <option value="Atraso">⚠ Atraso</option>
                      <option value="Substituído">🔄 Substituído</option>
                      <option value="Ausente">✕ Ausente</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#475569' }}>Horário da Ronda</label>
                    <input 
                      type="time" 
                      className="form-control"
                      value={rondaForm.checkinTime} 
                      onChange={e => setRondaForm({ ...rondaForm, checkinTime: e.target.value })}
                    />
                  </div>
                </div>

                {/* Linha Condicional: Substituto */}
                {rondaForm.status === 'Substituído' && (
                  <div className="form-group">
                    <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#6d28d9' }}>Médico Substituto *</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="Nome do médico que está cobrindo o plantão"
                      required
                      value={rondaForm.substituteName} 
                      onChange={e => setRondaForm({ ...rondaForm, substituteName: e.target.value })}
                    />
                  </div>
                )}

                {/* Linha 4: Observações */}
                <div className="form-group">
                  <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#475569' }}>Observações</label>
                  <textarea 
                    rows="2" 
                    className="form-control" 
                    placeholder="Registros adicionais da recepção sobre o plantão ou motivos de atraso/troca..."
                    value={rondaForm.notes} 
                    onChange={e => setRondaForm({ ...rondaForm, notes: e.target.value })}
                  />
                </div>
              </div>

              <div style={styles.modalFooter}>
                <button 
                  type="button" 
                  onClick={() => setShowRondaModal(false)} 
                  className="btn btn-secondary"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={actionLoading} 
                  className="btn btn-primary"
                >
                  {actionLoading ? 'Salvando...' : (editingRonda ? 'Atualizar Ronda' : 'Salvar Presença')}
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
  filtersContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.65rem',
    backgroundColor: '#fff',
    padding: '0.85rem',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  },
  filtersBar: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '0.75rem',
    flexWrap: 'wrap',
  },
  filterCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  filterLabel: {
    fontSize: '0.75rem',
    fontWeight: '700',
    color: '#475569',
    display: 'block',
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
    transition: 'border-color 0.2s',
  },
  patientDropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    marginTop: '4px',
    maxHeight: '260px',
    overflowY: 'auto',
    zIndex: 1000,
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  },
  patientDropdownItem: {
    padding: '0.55rem 0.75rem',
    borderBottom: '1px solid #f3f4f6',
    cursor: 'pointer',
    transition: 'background-color 0.15s ease',
  },
  filterSelect: {
    padding: '0.55rem 0.75rem',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    fontSize: '0.85rem',
    backgroundColor: '#fff',
    color: '#334155',
    outline: 'none',
    cursor: 'pointer',
    minWidth: '110px',
  },
  viewToggleGroup: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    padding: '2px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
  },
  viewToggleBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
    padding: '0.45rem 0.65rem',
    fontSize: '0.78rem',
    fontWeight: '700',
    color: '#64748b',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  viewToggleBtnActive: {
    backgroundColor: '#ffffff',
    color: 'var(--primary-color)',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  addBtn: {
    display: 'inline-flex',
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
    boxShadow: '0 2px 4px rgba(13, 148, 136, 0.2)',
  },
  statusChipsBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.45rem',
    flexWrap: 'wrap',
    paddingTop: '0.5rem',
    borderTop: '1px solid #f1f5f9',
  },
  statusChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
    padding: '0.25rem 0.65rem',
    borderRadius: '999px',
    fontSize: '0.75rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
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
  noDataBox: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    padding: '3.5rem 1.5rem',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  },
  clearFiltersBtn: {
    marginTop: '1rem',
    padding: '0.45rem 0.9rem',
    fontSize: '0.8rem',
    fontWeight: '700',
    color: 'var(--primary-color)',
    backgroundColor: '#f0fdfa',
    border: '1px solid #99f6e4',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  // Visão Compacta (Alta Densidade)
  compactTable: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
    fontSize: '0.82rem',
  },
  compactTheadRow: {
    backgroundColor: '#f8fafc',
    borderBottom: '2px solid #e2e8f0',
  },
  compactTh: {
    padding: '0.45rem 0.65rem',
    fontSize: '0.74rem',
    fontWeight: '800',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: '0.03em',
  },
  compactTr: {
    borderBottom: '1px solid #f1f5f9',
    transition: 'background-color 0.15s',
  },
  compactTd: {
    padding: '0.35rem 0.65rem',
    verticalAlign: 'middle',
  },
  compactPatientCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  compactPhoto: {
    width: '28px',
    height: '28px',
    borderRadius: '6px',
    objectFit: 'cover',
    border: '1px solid #e2e8f0',
    flexShrink: 0,
  },
  compactPhotoPlaceholder: {
    width: '28px',
    height: '28px',
    borderRadius: '6px',
    backgroundColor: 'rgba(13, 148, 136, 0.12)',
    color: 'var(--primary-color)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '800',
    fontSize: '0.85rem',
    flexShrink: 0,
  },
  compactNameBlock: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
  },
  compactPatName: {
    fontWeight: '800',
    color: '#0f172a',
    fontSize: '0.84rem',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '260px',
  },
  compactPhoneLabel: {
    fontSize: '0.7rem',
    color: '#64748b',
  },
  compactDocCell: {
    display: 'flex',
    flexDirection: 'column',
  },
  compactCpf: {
    fontWeight: '600',
    color: '#334155',
    fontSize: '0.78rem',
  },
  compactCns: {
    fontSize: '0.68rem',
    color: '#94a3b8',
  },
  compactInsuranceBadge: {
    fontSize: '0.72rem',
    fontWeight: '700',
    backgroundColor: '#f8fafc',
    color: '#334155',
    border: '1px solid #e2e8f0',
    padding: '0.1rem 0.4rem',
    borderRadius: '4px',
  },
  compactAccessBadge: {
    fontSize: '0.72rem',
    fontWeight: '700',
    backgroundColor: '#ede9fe',
    color: '#6d28d9',
    padding: '0.12rem 0.45rem',
    borderRadius: '4px',
  },
  compactActionButtons: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.25rem',
  },
  compactActionWhatsBtn: {
    backgroundColor: '#25d366',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    width: '26px',
    height: '26px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'opacity 0.15s',
  },
  compactActionEditBtn: {
    backgroundColor: '#f1f5f9',
    color: '#475569',
    border: '1px solid #cbd5e1',
    borderRadius: '5px',
    width: '26px',
    height: '26px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'background-color 0.15s',
  },
  compactActionDeleteBtn: {
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    border: '1px solid #fca5a5',
    borderRadius: '5px',
    width: '26px',
    height: '26px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'background-color 0.15s',
  },
  // Visão em Cards (Grade Moderna)
  cardsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '1rem',
  },
  patientCard: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
  },
  cardTop: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '0.5rem',
  },
  cardPhoto: {
    width: '42px',
    height: '42px',
    borderRadius: '10px',
    objectFit: 'cover',
    border: '1px solid #e2e8f0',
    flexShrink: 0,
  },
  cardPhotoPlaceholder: {
    width: '42px',
    height: '42px',
    borderRadius: '10px',
    backgroundColor: 'rgba(13, 148, 136, 0.12)',
    color: 'var(--primary-color)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '800',
    fontSize: '1.1rem',
    flexShrink: 0,
  },
  cardPatName: {
    fontWeight: '800',
    color: '#0f172a',
    fontSize: '0.92rem',
    lineHeight: 1.2,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '190px',
  },
  cardMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    fontSize: '0.75rem',
    color: '#64748b',
    marginTop: '3px',
  },
  cardAlocacao: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    border: '1px solid #f1f5f9',
    padding: '0.45rem 0.65rem',
  },
  cardAlocacaoItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1px',
  },
  cardAlocacaoLabel: {
    fontSize: '0.68rem',
    fontWeight: '700',
    color: '#94a3b8',
    textTransform: 'uppercase',
  },
  cardAlocacaoVal: {
    fontSize: '0.78rem',
    fontWeight: '700',
    color: '#334155',
  },
  cardTagsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    flexWrap: 'wrap',
  },
  cardTag: {
    fontSize: '0.72rem',
    fontWeight: '700',
    backgroundColor: '#f1f5f9',
    color: '#334155',
    padding: '0.15rem 0.5rem',
    borderRadius: '4px',
    border: '1px solid #e2e8f0',
  },
  cardTagFrequency: {
    fontSize: '0.72rem',
    fontWeight: '600',
    backgroundColor: '#eff6ff',
    color: '#1e40af',
    padding: '0.15rem 0.5rem',
    borderRadius: '4px',
  },
  cardTagAccess: {
    fontSize: '0.72rem',
    fontWeight: '700',
    backgroundColor: '#ede9fe',
    color: '#6d28d9',
    padding: '0.15rem 0.5rem',
    borderRadius: '4px',
  },
  cardContactInfo: {
    backgroundColor: '#fafafa',
    borderRadius: '8px',
    padding: '0.4rem 0.6rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  cardActionsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginTop: 'auto',
    paddingTop: '0.5rem',
    borderTop: '1px solid #f1f5f9',
  },
  cardActionWhats: {
    flex: 1,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.35rem',
    backgroundColor: '#25d366',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    padding: '0.45rem 0.6rem',
    fontSize: '0.78rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'opacity 0.15s',
  },
  cardActionEdit: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.35rem',
    backgroundColor: '#f1f5f9',
    color: '#475569',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    padding: '0.45rem 0.65rem',
    fontSize: '0.78rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'background-color 0.15s',
  },
  cardActionDelete: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    border: '1px solid #fca5a5',
    borderRadius: '8px',
    padding: '0.45rem 0.6rem',
    cursor: 'pointer',
    transition: 'background-color 0.15s',
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
  },
};
