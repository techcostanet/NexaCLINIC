import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, Clock, User, HeartPulse, Building2, Plus, 
  ChevronLeft, ChevronRight, CheckCircle2, AlertTriangle, MessageSquare, Check, X,
  Search, RefreshCw, Phone, Edit2, Trash2, ArrowRight, UserCheck, ShieldAlert, Sparkles,
  Send, Users, Eye, Filter, Zap, Cake, HelpCircle, Lock, Award, Sliders, ExternalLink,
  Tv, Radio, Volume2, Copy
} from 'lucide-react';
import { dbService } from '../firebase';
import { isBrazilianHoliday, getBrazilianHolidays } from '../utils/brazilHolidays';
import DoctorScheduleModal from './calendar/DoctorScheduleModal';
import ScheduleBlockModal from './calendar/ScheduleBlockModal';
import CalendarReportsModal from './CalendarReportsModal';
import TvTipsManagerModal from './tv/TvTipsManagerModal';
import { formatDoctorDisplayName, sortDoctorsByName } from '../utils/doctorFormatters';
import { useUnit } from '../contexts/UnitContext';
import UnitSelector from './common/UnitSelector';

export default function CalendarPanel({ currentUser, isReportsOpen, setIsReportsOpen }) {
  const { activeUnitId, filterByActiveUnit, matchItemUnit } = useUnit();

  // Navigation & View Mode
  const [viewMode, setViewMode] = useState('day'); // 'day' | 'rooms' | 'week' | 'month'
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Data States
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [doctorSchedules, setDoctorSchedules] = useState([]);
  const [scheduleBlocks, setScheduleBlocks] = useState([]);
  const [tenantSettings, setTenantSettings] = useState({ name: 'Nexa Clínica', cnpj: '00.000.000/0001-00', logo: '' });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Filter States
  const [selectedDoctorId, setSelectedDoctorId] = useState('all');
  const [selectedRoom, setSelectedRoom] = useState('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [showModal, setShowModal] = useState(false);
  const [showDoctorScheduleModal, setShowDoctorScheduleModal] = useState(false);
  const [showScheduleBlockModal, setShowScheduleBlockModal] = useState(false);
  const [showTvModal, setShowTvModal] = useState(false);
  const [showTvTipsModal, setShowTvTipsModal] = useState(false);
  const [calledApts, setCalledApts] = useState({});
  const [copiedTvLink, setCopiedTvLink] = useState(false);
  const [editingApt, setEditingApt] = useState(null);
  const [patientSearchInModal, setPatientSearchInModal] = useState('');
  
  const [aptForm, setAptForm] = useState({
    patientId: '',
    patientName: '',
    patientPhone: '',
    patientCpf: '',
    patientBirthDate: '',
    doctorId: '',
    date: new Date().toISOString().substring(0, 10),
    time: '09:00',
    endTime: '09:30',
    type: 'Primeira Consulta',
    room: 'Consultório 1',
    status: 'Agendado',
    isEncaixe: false,
    notes: ''
  });

  const defaultTimeSlots = [
    '07:00', '07:30', '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00'
  ];

  const availableRooms = [
    'Consultório 1',
    'Consultório 2',
    'Consultório 3',
    'Consultório 4',
    'Consultório 5',
    'Consultório 6',
    'Consultório DP'
  ];

  // Helper to calculate age from birthDate (YYYY-MM-DD)
  const calculateAge = (birthDateStr) => {
    if (!birthDateStr) return null;
    const parts = birthDateStr.split('-');
    if (parts.length !== 3) return null;
    const birth = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    if (isNaN(birth.getTime())) return null;
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age >= 0 ? `${age} anos` : null;
  };

  // Helper to add minutes to HH:mm string
  const addMinutesToTime = (timeStr, mins = 30) => {
    if (!timeStr || !timeStr.includes(':')) return '';
    const [h, m] = timeStr.split(':').map(Number);
    if (isNaN(h) || isNaN(m)) return '';
    const totalMins = h * 60 + m + mins;
    const newH = Math.floor(totalMins / 60) % 24;
    const newM = totalMins % 60;
    return `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;
  };

  useEffect(() => {
    fetchData();

    // Listener em tempo real para sincronização de chamadas da TV
    const unsub = dbService.subscribeToPatientCalls ? dbService.subscribeToPatientCalls(activeUnitId, (callList) => {
      const callMap = {};
      (callList || []).forEach(c => {
        if (c.appointmentId) {
          callMap[c.appointmentId] = Math.max(callMap[c.appointmentId] || 0, c.callCount || 1);
        }
      });
      setCalledApts(callMap);
    }) : () => {};

    return () => {
      if (typeof unsub === 'function') unsub();
    };
  }, [activeUnitId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [aptList, patList, userList, schedList, blockList, tenantData, recentCalls] = await Promise.all([
        dbService.getAppointments(),
        dbService.getPatients(),
        dbService.getUsers(),
        dbService.getDoctorSchedules(),
        dbService.getScheduleBlocks(),
        dbService.getTenantSettings ? dbService.getTenantSettings().catch(() => null) : Promise.resolve(null),
        dbService.getRecentPatientCalls ? dbService.getRecentPatientCalls(activeUnitId).catch(() => []) : Promise.resolve([])
      ]);

      setAppointments(aptList || []);
      setPatients(patList || []);
      setDoctorSchedules(schedList || []);
      setScheduleBlocks(blockList || []);
      if (tenantData && tenantData.name) {
        setTenantSettings(tenantData);
      }
      if (recentCalls && Array.isArray(recentCalls)) {
        const callMap = {};
        recentCalls.forEach(c => {
          if (c.appointmentId) {
            callMap[c.appointmentId] = Math.max(callMap[c.appointmentId] || 0, c.callCount || 1);
          }
        });
        setCalledApts(callMap);
      }

      // Filter clinical professionals / doctors
      const docList = (userList || []).filter(u => 
        u.role === 'admin' || 
        u.role === 'professional' || 
        u.role === 'doctor' ||
        u.role === 'clinical' || 
        (u.allowedSectors && (u.allowedSectors.includes('medica') || u.allowedSectors.includes('consultorio')))
      );
      const finalDocs = sortDoctorsByName(docList.length > 0 ? docList : userList || []);
      setDoctors(finalDocs);

      // Seed mock sample appointments if DB is brand new
      if ((!aptList || aptList.length === 0) && patList && patList.length > 0) {
        const todayStr = new Date().toISOString().substring(0, 10);
        const fallbacks = [
          {
            patientId: patList[0]?.id || 'pat-1',
            patientName: patList[0]?.name || 'ADAIR PRAXEDES MORENO',
            patientPhone: patList[0]?.phone || '31988887777',
            patientCpf: patList[0]?.cpf || '123.456.789-00',
            patientBirthDate: patList[0]?.birthDate || '1968-07-21',
            doctorId: finalDocs[0]?.uid || 'doc-1',
            doctorName: finalDocs[0]?.name || 'Dr. Carlos (Nefrologista)',
            date: todayStr,
            time: '08:30',
            endTime: '09:00',
            type: 'Primeira Consulta',
            room: 'Consultório 1',
            isEncaixe: false,
            status: 'Confirmado',
            whatsappStatus: 'Enviado',
            notes: 'Acompanhamento trimestral de creatinina',
            unitId: 'betim',
            unit: 'Betim'
          },
          {
            patientId: patList[1]?.id || 'pat-2',
            patientName: patList[1]?.name || 'ADAO LUCIANO DIAS',
            patientPhone: patList[1]?.phone || '31977776666',
            patientCpf: patList[1]?.cpf || '987.654.321-11',
            patientBirthDate: patList[1]?.birthDate || '1972-07-18',
            doctorId: finalDocs[0]?.uid || 'doc-1',
            doctorName: finalDocs[0]?.name || 'Dr. Carlos (Nefrologista)',
            date: todayStr,
            time: '09:30',
            endTime: '10:00',
            type: 'Retorno',
            room: 'Consultório 1',
            isEncaixe: false,
            status: 'Aguardando',
            whatsappStatus: 'Confirmado',
            notes: 'Reavaliação de exames pós-hemodiálise',
            unitId: 'betim',
            unit: 'Betim'
          }
        ];
        const createdList = [];
        for (const item of fallbacks) {
          const res = await dbService.createAppointment(item);
          createdList.push(res);
        }
        setAppointments(createdList);
      }
    } catch (err) {
      console.error(err);
      showAlert('Erro ao carregar dados da agenda em tempo real.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 4500);
  };

  // Filtragem de Dados pela Unidade Ativa
  const currentAppointments = useMemo(() => filterByActiveUnit(appointments), [appointments, activeUnitId, filterByActiveUnit]);
  const currentPatients = useMemo(() => filterByActiveUnit(patients), [patients, activeUnitId, filterByActiveUnit]);
  const currentDoctorSchedules = useMemo(() => filterByActiveUnit(doctorSchedules), [doctorSchedules, activeUnitId, filterByActiveUnit]);
  const currentScheduleBlocks = useMemo(() => filterByActiveUnit(scheduleBlocks), [scheduleBlocks, activeUnitId, filterByActiveUnit]);

  // Date Navigation
  const handleNavigateDate = (direction) => {
    const next = new Date(currentDate);
    if (viewMode === 'day' || viewMode === 'rooms') {
      next.setDate(next.getDate() + direction);
    } else if (viewMode === 'week') {
      next.setDate(next.getDate() + direction * 7);
    } else if (viewMode === 'month') {
      next.setMonth(next.getMonth() + direction);
    }
    setCurrentDate(next);
  };

  const handleGoToToday = () => {
    setCurrentDate(new Date());
  };

  // Helper to get doctor schedule duration
  const getDoctorDuration = (docId) => {
    const s = currentDoctorSchedules.find(sc => sc.doctorId === docId) || doctorSchedules.find(sc => sc.doctorId === docId);
    return s?.slotDuration || 30;
  };

  // Open Add Modal
  const handleOpenAddModal = (initialSlot = null) => {
    setEditingApt(null);
    setPatientSearchInModal('');
    const todayStr = currentDate.toISOString().substring(0, 10);
    const initialDocId = initialSlot?.doctorId || (selectedDoctorId !== 'all' ? selectedDoctorId : doctors[0]?.uid || '');
    const duration = getDoctorDuration(initialDocId);
    const initialTime = initialSlot?.time || '09:00';

    setAptForm({
      patientId: '',
      patientName: '',
      patientPhone: '',
      patientCpf: '',
      patientBirthDate: '',
      doctorId: initialDocId,
      date: initialSlot?.date || todayStr,
      time: initialTime,
      endTime: initialSlot?.endTime || addMinutesToTime(initialTime, duration),
      type: 'Primeira Consulta',
      room: initialSlot?.room || 'Consultório 1',
      status: 'Agendado',
      isEncaixe: Boolean(initialSlot?.isEncaixe),
      notes: ''
    });
    setShowModal(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (apt) => {
    setEditingApt(apt);
    setPatientSearchInModal(apt.patientName || '');
    const duration = getDoctorDuration(apt.doctorId);

    setAptForm({
      patientId: apt.patientId || '',
      patientName: apt.patientName || '',
      patientPhone: apt.patientPhone || '',
      patientCpf: apt.patientCpf || '',
      patientBirthDate: apt.patientBirthDate || '',
      doctorId: apt.doctorId || '',
      date: apt.date || '',
      time: apt.time || '09:00',
      endTime: apt.endTime || addMinutesToTime(apt.time || '09:00', duration),
      type: apt.type || 'Primeira Consulta',
      room: apt.room || 'Consultório 1',
      status: apt.status || 'Agendado',
      isEncaixe: Boolean(apt.isEncaixe),
      notes: apt.notes || ''
    });
    setShowModal(true);
  };

  // Conflict / Multiple Patients Check in real time
  const conflictingAppointments = useMemo(() => {
    if (!aptForm.doctorId || !aptForm.date || !aptForm.time) return [];
    return currentAppointments.filter(apt => 
      apt.id !== editingApt?.id &&
      apt.doctorId === aptForm.doctorId && 
      apt.date === aptForm.date && 
      apt.time === aptForm.time &&
      apt.status !== 'Cancelado'
    );
  }, [currentAppointments, editingApt, aptForm.doctorId, aptForm.date, aptForm.time]);

  // Check if chosen modal date is holiday
  const modalDateHoliday = useMemo(() => {
    return isBrazilianHoliday(aptForm.date);
  }, [aptForm.date]);

  // Check if chosen doctor is blocked on modal date
  const modalDoctorBlock = useMemo(() => {
    if (!aptForm.doctorId || !aptForm.date) return null;
    return currentScheduleBlocks.find(b => 
      (b.doctorId === 'all' || b.doctorId === aptForm.doctorId) &&
      aptForm.date >= b.startDate && aptForm.date <= b.endDate
    );
  }, [currentScheduleBlocks, aptForm.doctorId, aptForm.date]);

  // Check if doctor attends on that day of the week
  const modalDoctorDayConfig = useMemo(() => {
    if (!aptForm.doctorId || !aptForm.date) return null;
    const sched = currentDoctorSchedules.find(s => s.doctorId === aptForm.doctorId) || doctorSchedules.find(s => s.doctorId === aptForm.doctorId);
    if (!sched) return null;

    const parts = aptForm.date.split('-');
    if (parts.length !== 3) return null;
    const dayOfWeek = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2])).getDay();
    const isDayActive = (sched.availableDays || [1, 2, 3, 4, 5]).includes(dayOfWeek);

    return {
      isDayActive,
      dayOfWeek,
      schedule: sched
    };
  }, [currentDoctorSchedules, doctorSchedules, aptForm.doctorId, aptForm.date]);

  // Check doctor's monthly / annual quotas
  const modalDoctorQuotaCheck = useMemo(() => {
    if (!aptForm.doctorId || !aptForm.date) return null;
    const sched = currentDoctorSchedules.find(s => s.doctorId === aptForm.doctorId) || doctorSchedules.find(s => s.doctorId === aptForm.doctorId);
    const monthPrefix = aptForm.date.substring(0, 7); // YYYY-MM
    const [yearKey, monthKey] = monthPrefix.split('-');

    const docMonthApts = currentAppointments.filter(a => 
      a.id !== editingApt?.id &&
      a.doctorId === aptForm.doctorId && 
      a.date && a.date.startsWith(monthPrefix) &&
      a.status !== 'Cancelado'
    );

    const isFirstConsult = (aptForm.type || '').toLowerCase().includes('primeira');
    const isReturn = (aptForm.type || '').toLowerCase().includes('retorno');

    const firstCount = docMonthApts.filter(a => (a.type || '').toLowerCase().includes('primeira')).length;
    const returnCount = docMonthApts.filter(a => (a.type || '').toLowerCase().includes('retorno')).length;

    // Check if custom quota exists in yearlyConfigs for this year and month
    const customMonthCfg = sched?.yearlyConfigs?.[yearKey]?.months?.[monthKey];
    const firstLimit = customMonthCfg?.monthlyFirstConsultLimit ?? (sched?.monthlyFirstConsultLimit ?? 30);
    const returnLimit = customMonthCfg?.monthlyReturnLimit ?? (sched?.monthlyReturnLimit ?? 50);

    return {
      firstCount,
      firstLimit,
      firstExceeded: isFirstConsult && firstCount >= firstLimit,
      returnCount,
      returnLimit,
      returnExceeded: isReturn && returnCount >= returnLimit
    };
  }, [currentDoctorSchedules, doctorSchedules, currentAppointments, editingApt, aptForm.doctorId, aptForm.date, aptForm.type]);

  // Save Appointment (Create or Edit)
  const handleSaveAppointment = async (e) => {
    e.preventDefault();
    if (!aptForm.patientId && !aptForm.patientName.trim()) {
      return showAlert('Selecione um paciente cadastrado ou digite o nome.', 'danger');
    }

    if (!aptForm.doctorId) {
      return showAlert('Selecione o profissional de saúde responsável.', 'danger');
    }

    const docFound = doctors.find(d => d.uid === aptForm.doctorId);
    const docName = docFound ? formatDoctorDisplayName(docFound.name) : 'Profissional Clínico';

    let patName = aptForm.patientName;
    let patPhone = aptForm.patientPhone;
    let patCpf = aptForm.patientCpf;
    let patBirthDate = aptForm.patientBirthDate;

    if (aptForm.patientId) {
      const p = currentPatients.find(pat => pat.id === aptForm.patientId) || patients.find(pat => pat.id === aptForm.patientId);
      if (p) {
        patName = p.name;
        patPhone = p.phone || patPhone;
        patCpf = p.cpf || patCpf;
        patBirthDate = p.birthDate || patBirthDate;
      }
    }

    const finalIsEncaixe = Boolean(aptForm.isEncaixe || conflictingAppointments.length > 0);
    const targetUnitId = activeUnitId === 'all' ? 'betim' : activeUnitId;
    const targetUnit = targetUnitId === 'taguatinga' ? 'Taguatinga' : 'Betim';

    const appointmentPayload = {
      patientId: aptForm.patientId || 'avulso',
      patientName: patName,
      patientPhone: patPhone,
      patientCpf: patCpf,
      patientBirthDate: patBirthDate || '',
      doctorId: aptForm.doctorId,
      doctorName: docName,
      date: aptForm.date,
      time: aptForm.time,
      endTime: aptForm.endTime || addMinutesToTime(aptForm.time, getDoctorDuration(aptForm.doctorId)),
      type: aptForm.type,
      room: aptForm.room || 'Consultório 1',
      status: aptForm.status || 'Agendado',
      isEncaixe: finalIsEncaixe,
      whatsappStatus: editingApt?.whatsappStatus || 'Pendente',
      notes: aptForm.notes || '',
      unitId: targetUnitId,
      unit: targetUnit,
      updatedAt: new Date().toISOString()
    };

    setActionLoading(true);
    try {
      if (editingApt) {
        setAppointments(prev => prev.map(a => a.id === editingApt.id ? { ...a, ...appointmentPayload } : a));
        await dbService.updateAppointment(editingApt.id, appointmentPayload);
        showAlert(`Agendamento de "${patName}" atualizado com sucesso!`);
      } else {
        const created = await dbService.createAppointment(appointmentPayload);
        setAppointments(prev => [...prev, created]);
        const encaixeText = finalIsEncaixe ? ' (Encaixe registrado)' : '';
        showAlert(`Consulta de "${patName}" agendada com sucesso para ${aptForm.date.split('-').reverse().join('/')} às ${aptForm.time}${encaixeText}!`);
      }
      setShowModal(false);
    } catch (err) {
      console.error(err);
      showAlert('Erro ao gravar agendamento na nuvem.', 'danger');
      fetchData();
    } finally {
      setActionLoading(false);
    }
  };

  // Quick Status Update
  const handleUpdateStatus = async (aptId, newStatus) => {
    setAppointments(prev => prev.map(a => a.id === aptId ? { ...a, status: newStatus } : a));
    try {
      await dbService.updateAppointment(aptId, { status: newStatus });
      if (newStatus === 'Aguardando') {
        showAlert('Paciente registrado na Recepção!', 'success');
      } else if (newStatus === 'Em Consulta') {
        showAlert('Atendimento clínico iniciado!', 'success');
      } else if (newStatus === 'Finalizado') {
        showAlert('Atendimento finalizado com sucesso!', 'success');
      } else if (newStatus === 'Faltou') {
        showAlert('Falta (No-Show) registrada com sucesso.', 'warning');
      } else {
        showAlert(`Status atualizado para: ${newStatus}`, 'success');
      }
    } catch (err) {
      console.error(err);
      showAlert('Erro ao atualizar status na nuvem.', 'danger');
      fetchData();
    }
  };

  // Chamar Paciente no Painel da TV
  const handleCallPatient = async (apt) => {
    if (!apt) return;
    try {
      const roomName = apt.room && apt.room !== 'Nenhum' ? apt.room : 'Consultório 1';
      const targetUnitId = apt.unitId || (activeUnitId === 'all' ? 'betim' : activeUnitId);
      const targetUnit = apt.unit || (targetUnitId === 'taguatinga' ? 'Taguatinga' : 'Betim');

      if (dbService.callPatient) {
        await dbService.callPatient({
          patientName: apt.patientName,
          patientId: apt.patientId,
          appointmentId: apt.id,
          room: roomName,
          doctorName: apt.doctorName || 'Médico Responsável',
          unitId: targetUnitId,
          unit: targetUnit
        });
      }

      setCalledApts(prev => ({
        ...prev,
        [apt.id]: (prev[apt.id] || 0) + 1
      }));

      showAlert(`Chamando "${apt.patientName}" no Painel da TV (${roomName})!`, 'success');
    } catch (err) {
      console.error('Erro ao emitir chamada para a TV:', err);
      showAlert('Erro ao emitir chamada para o Painel da TV.', 'danger');
    }
  };

  // WhatsApp Sender
  const handleSendWhatsApp = async (apt) => {
    const rawPhone = (apt.patientPhone || '').replace(/\D/g, '');
    const dateFormatted = apt.date ? apt.date.split('-').reverse().join('/') : '';
    const roomInfo = apt.room && apt.room !== 'Nenhum' ? ` no local *${apt.room}*` : '';
    const timeRange = apt.endTime ? `${apt.time} às ${apt.endTime}` : apt.time;
    const encaixeText = apt.isEncaixe ? ' *(Encaixe)*' : '';
    const clinicName = tenantSettings?.name || 'Clínica';
    const textMsg = `Olá *${apt.patientName}*! 👋\nConfirmamos seu agendamento${encaixeText} de *${apt.type}* com *${apt.doctorName}* na clínica *${clinicName}* para o dia *${dateFormatted}* das *${timeRange}*${roomInfo}.\n\nPor favor, responda *SIM* para confirmar ou nos avise se precisar reagendar.`;
    
    const waUrl = rawPhone.length >= 10 
      ? `https://wa.me/55${rawPhone}?text=${encodeURIComponent(textMsg)}`
      : `https://wa.me/?text=${encodeURIComponent(textMsg)}`;
    
    window.open(waUrl, '_blank');

    try {
      await dbService.updateAppointment(apt.id, { whatsappStatus: 'Enviado' });
      setAppointments(prev => prev.map(a => a.id === apt.id ? { ...a, whatsappStatus: 'Enviado' } : a));
    } catch (e) {
      console.error(e);
    }
  };

  // Delete Appointment
  const handleDeleteAppointment = async (apt) => {
    if (!window.confirm(`Deseja realmente excluir o agendamento de "${apt.patientName}" marcado para ${apt.date.split('-').reverse().join('/')} às ${apt.time}?`)) {
      return;
    }
    setAppointments(prev => prev.filter(a => a.id !== apt.id));
    try {
      await dbService.deleteAppointment(apt.id);
      showAlert(`Agendamento de "${apt.patientName}" removido com sucesso.`);
    } catch (err) {
      console.error(err);
      showAlert('Erro ao excluir agendamento na nuvem.', 'danger');
      fetchData();
    }
  };

  // Navigation helpers for Global Search results
  const handleJumpToAppointmentDate = (dateStr) => {
    if (!dateStr) return;
    const [y, m, d] = dateStr.split('-').map(Number);
    if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
      setCurrentDate(new Date(y, m - 1, d));
      setViewMode('day');
      setSearchTerm('');
    }
  };

  // Formatted Current Date
  const formattedCurrentDate = useMemo(() => {
    return currentDate.toISOString().substring(0, 10);
  }, [currentDate]);

  // Brazilian holiday for current date
  const currentHoliday = useMemo(() => {
    return isBrazilianHoliday(formattedCurrentDate);
  }, [formattedCurrentDate]);

  // Active blocks for current date and current doctor filter
  const currentDayBlocks = useMemo(() => {
    return currentScheduleBlocks.filter(b => 
      formattedCurrentDate >= b.startDate && 
      formattedCurrentDate <= b.endDate &&
      (selectedDoctorId === 'all' || b.doctorId === 'all' || b.doctorId === selectedDoctorId)
    );
  }, [currentScheduleBlocks, formattedCurrentDate, selectedDoctorId]);

  // 🔍 GLOBAL SEARCH RESULTS (Searches across ALL days, ALL months, ALL years)
  const globalSearchResults = useMemo(() => {
    if (!searchTerm.trim()) return [];
    const term = searchTerm.toLowerCase().trim();

    return currentAppointments.filter(apt => {
      // Doctor filter if selected
      if (selectedDoctorId !== 'all' && apt.doctorId !== selectedDoctorId) return false;
      // Room filter if selected
      if (selectedRoom !== 'all' && (apt.room || 'Nenhum') !== selectedRoom) return false;
      // Status filter if selected
      if (selectedStatusFilter !== 'all') {
        if (selectedStatusFilter === 'Encaixe') {
          if (!apt.isEncaixe) return false;
        } else if (apt.status !== selectedStatusFilter) {
          return false;
        }
      }

      // Deep search matching across all fields:
      const nameMatch = (apt.patientName || '').toLowerCase().includes(term);
      const cpfMatch = (apt.patientCpf || '').replace(/\D/g, '').includes(term.replace(/\D/g, '')) || (apt.patientCpf || '').toLowerCase().includes(term);
      const phoneMatch = (apt.patientPhone || '').replace(/\D/g, '').includes(term.replace(/\D/g, '')) || (apt.patientPhone || '').toLowerCase().includes(term);
      const docMatch = (apt.doctorName || '').toLowerCase().includes(term);
      const notesMatch = (apt.notes || '').toLowerCase().includes(term);
      const typeMatch = (apt.type || '').toLowerCase().includes(term);
      const roomMatch = (apt.room || '').toLowerCase().includes(term);
      const statusMatch = (apt.status || '').toLowerCase().includes(term);
      const timeMatch = (apt.time || '').toLowerCase().includes(term);

      // Date matching in multiple formats: '2026-08-24', '24/08/2026', '24/08', '2026', month name
      let dateMatch = false;
      if (apt.date) {
        const dateIso = apt.date; // YYYY-MM-DD
        const dateBr = apt.date.split('-').reverse().join('/'); // DD/MM/YYYY
        const dateBrShort = apt.date.split('-').slice(1).reverse().join('/'); // DD/MM
        const yearStr = apt.date.split('-')[0];
        
        dateMatch = dateIso.includes(term) || dateBr.includes(term) || dateBrShort.includes(term) || yearStr.includes(term);
      }

      return nameMatch || cpfMatch || phoneMatch || docMatch || notesMatch || typeMatch || roomMatch || statusMatch || timeMatch || dateMatch;
    }).sort((a, b) => (b.date || '').localeCompare(a.date || '') || (a.time || '').localeCompare(b.time || ''));
  }, [currentAppointments, searchTerm, selectedDoctorId, selectedRoom, selectedStatusFilter]);

  // Standard Filtered Appointments (for calendar view modes)
  const filteredAppointments = useMemo(() => {
    return currentAppointments.filter(apt => {
      if (selectedDoctorId !== 'all' && apt.doctorId !== selectedDoctorId) return false;
      if (selectedRoom !== 'all' && (apt.room || 'Nenhum') !== selectedRoom) return false;
      if (selectedStatusFilter !== 'all') {
        if (selectedStatusFilter === 'Encaixe') {
          if (!apt.isEncaixe) return false;
        } else if (apt.status !== selectedStatusFilter) {
          return false;
        }
      }
      return true;
    });
  }, [currentAppointments, selectedDoctorId, selectedRoom, selectedStatusFilter]);

  // Current Day KPIs
  const dayAppointments = useMemo(() => {
    return filteredAppointments.filter(apt => apt.date === formattedCurrentDate);
  }, [filteredAppointments, formattedCurrentDate]);

  const kpis = useMemo(() => {
    const total = dayAppointments.length;
    const waiting = dayAppointments.filter(a => a.status === 'Aguardando').length;
    const inProgress = dayAppointments.filter(a => a.status === 'Em Consulta').length;
    const finished = dayAppointments.filter(a => a.status === 'Finalizado').length;
    const confirmed = dayAppointments.filter(a => a.status === 'Confirmado').length;
    const encaixes = dayAppointments.filter(a => a.isEncaixe).length;
    return { total, waiting, inProgress, finished, confirmed, encaixes };
  }, [dayAppointments]);

  // Dynamic Time Slots for Day View
  const dynamicTimeSlots = useMemo(() => {
    const aptTimes = dayAppointments.map(a => a.time).filter(Boolean);
    return Array.from(new Set([...defaultTimeSlots, ...aptTimes])).sort();
  }, [dayAppointments, defaultTimeSlots]);

  // Filtered patients for autocomplete modal
  const modalFilteredPatients = useMemo(() => {
    if (!patientSearchInModal.trim()) return [];
    const term = patientSearchInModal.toLowerCase();
    return currentPatients.filter(p => 
      (p.name || '').toLowerCase().includes(term) || 
      (p.cpf || '').includes(term) ||
      (p.phone || '').includes(term)
    ).slice(0, 6);
  }, [currentPatients, patientSearchInModal]);

  const currentModalPatientAge = useMemo(() => {
    return calculateAge(aptForm.patientBirthDate);
  }, [aptForm.patientBirthDate]);

  // =========================================================================
  // VIEW RENDERERS
  // =========================================================================

  // 0. Global Search Results View (Displays when search term is active)
  const renderGlobalSearchView = () => {
    return (
      <div style={styles.searchResultsContainer}>
        <div style={styles.searchResultsHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Search size={18} color="#0891b2" />
            <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>
              Busca Global — {globalSearchResults.length} agendamento(s) encontrado(s) em todos os anos e meses
            </strong>
          </div>
          <button 
            type="button" 
            onClick={() => setSearchTerm('')} 
            style={styles.clearSearchBadgeBtn}
          >
            Limpar Busca
          </button>
        </div>

        {globalSearchResults.length === 0 ? (
          <div style={styles.emptyGlobalSearch}>
            <Search size={32} color="#cbd5e1" />
            <strong style={{ color: '#475569', fontSize: '0.95rem' }}>Nenhum agendamento encontrado</strong>
            <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>
              Não encontramos resultados para "{searchTerm}" em nenhuma data, mês ou ano.
            </span>
            <button onClick={() => setSearchTerm('')} style={styles.btnSecondarySmall}>
              Limpar Pesquisa
            </button>
          </div>
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Data</th>
                  <th style={{ ...styles.th, width: '90px', textAlign: 'center' }}>Horário</th>
                  <th style={styles.th}>Paciente</th>
                  <th style={styles.th}>Médico</th>
                  <th style={styles.th}>WhatsApp</th>
                  <th style={styles.th}>Status</th>
                  <th style={{ ...styles.th, width: '220px', textAlign: 'center' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {globalSearchResults.map(apt => {
                  const patAge = apt.patientBirthDate ? calculateAge(apt.patientBirthDate) : null;
                  const dateFormatted = apt.date ? apt.date.split('-').reverse().join('/') : '-';
                  const dateObj = apt.date ? new Date(apt.date + 'T12:00:00') : null;
                  const weekdayStr = dateObj ? dateObj.toLocaleDateString('pt-BR', { weekday: 'short' }) : '';

                  return (
                    <tr key={apt.id} style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: apt.isEncaixe ? '#fffbeb' : '#ffffff' }}>
                      {/* Data */}
                      <td style={{ padding: '0.65rem 0.85rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <strong style={{ fontSize: '0.85rem', color: '#0f172a' }}>{dateFormatted}</strong>
                          <span style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'capitalize' }}>{weekdayStr}</span>
                        </div>
                      </td>

                      {/* Horário */}
                      <td style={{ padding: '0.65rem 0.85rem', textAlign: 'center' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <strong style={{ fontSize: '0.88rem', color: '#0891b2' }}>{apt.time}</strong>
                          {apt.endTime && <span style={{ fontSize: '0.68rem', color: '#64748b' }}>{apt.endTime}</span>}
                        </div>
                      </td>

                      {/* Paciente */}
                      <td style={{ padding: '0.65rem 0.85rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                            <strong style={{ fontSize: '0.9rem', color: '#0f172a' }}>{apt.patientName}</strong>
                            {apt.isEncaixe && (
                              <span style={styles.encaixeBadge}>
                                <Zap size={11} /> ENCAIXE
                              </span>
                            )}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.72rem', color: '#64748b' }}>
                            <span style={{ fontWeight: '700', color: apt.type?.includes('Primeira') ? '#0891b2' : '#10b981' }}>{apt.type}</span>
                            {patAge && <span>• 🎂 {patAge}</span>}
                            {apt.patientPhone && <span>• 📞 {apt.patientPhone}</span>}
                          </div>
                        </div>
                      </td>

                      {/* Médico & Sala */}
                      <td style={{ padding: '0.65rem 0.85rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: '700', fontSize: '0.82rem', color: '#334155' }}>{apt.doctorName}</span>
                          <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{apt.room}</span>
                        </div>
                      </td>

                      {/* WhatsApp */}
                      <td style={{ padding: '0.65rem 0.85rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <span style={{
                            padding: '0.15rem 0.4rem',
                            borderRadius: '4px',
                            fontSize: '0.68rem',
                            fontWeight: '700',
                            backgroundColor: apt.whatsappStatus === 'Confirmado' ? '#dcfce7' : apt.whatsappStatus === 'Recusado' ? '#fee2e2' : '#fef3c7',
                            color: apt.whatsappStatus === 'Confirmado' ? '#166534' : apt.whatsappStatus === 'Recusado' ? '#991b1b' : '#b45309'
                          }}>
                            💬 {apt.whatsappStatus || 'Pendente'}
                          </span>
                          <button onClick={() => handleSendWhatsApp(apt)} style={styles.waActionBtn} title="WhatsApp">
                            <Send size={10} />
                          </button>
                        </div>
                      </td>

                      {/* Status */}
                      <td style={{ padding: '0.65rem 0.85rem' }}>
                        <span style={{
                          padding: '0.2rem 0.5rem',
                          borderRadius: '9999px',
                          fontSize: '0.72rem',
                          fontWeight: '700',
                          display: 'inline-block',
                          backgroundColor: 
                            apt.status === 'Aguardando' ? '#fef3c7' :
                            apt.status === 'Em Consulta' ? '#ede9fe' :
                            apt.status === 'Finalizado' ? '#dcfce7' :
                            apt.status === 'Faltou' ? '#fee2e2' :
                            apt.status === 'Cancelado' ? '#f1f5f9' : '#e0f2fe',
                          color: 
                            apt.status === 'Aguardando' ? '#b45309' :
                            apt.status === 'Em Consulta' ? '#6d28d9' :
                            apt.status === 'Finalizado' ? '#166534' :
                            apt.status === 'Faltou' ? '#dc2626' :
                            apt.status === 'Cancelado' ? '#475569' : '#0369a1'
                        }}>
                          {apt.status}
                        </span>
                      </td>

                      {/* Ações */}
                      <td style={{ padding: '0.65rem 0.85rem', textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', flexWrap: 'wrap' }}>
                          <button 
                            type="button" 
                            onClick={() => handleJumpToAppointmentDate(apt.date)}
                            style={styles.jumpDateBtn}
                            title="Ir para esta data na grade do dia"
                          >
                            <ExternalLink size={12} /> Ver Dia
                          </button>
                          <button onClick={() => handleOpenEditModal(apt)} style={styles.iconBtn} title="Editar">
                            <Edit2 size={13} color="#0891b2" />
                          </button>
                          <button onClick={() => handleDeleteAppointment(apt)} style={{ ...styles.iconBtn, backgroundColor: '#fee2e2' }} title="Excluir">
                            <Trash2 size={13} color="#dc2626" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  // 1. Day View (Timeline Table)
  const renderDayView = () => {
    return (
      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={{ ...styles.th, width: '130px', textAlign: 'center' }}>Horário</th>
              <th style={styles.th}>Paciente</th>
              <th style={styles.th}>Médico</th>
              <th style={styles.th}>WhatsApp</th>
              <th style={styles.th}>Status</th>
              <th style={{ ...styles.th, width: '170px', textAlign: 'center' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {dynamicTimeSlots.map(time => {
              const aptsAtThisTime = dayAppointments.filter(a => a.time === time);
              
              const isSlotBlocked = currentDayBlocks.some(b => {
                if (b.period === 'Dia Inteiro') return true;
                if (b.period === 'Manhã') return time < '12:00';
                if (b.period === 'Tarde') return time >= '12:00';
                if (b.period === 'Horário') return time >= (b.startTime || '00:00') && time <= (b.endTime || '23:59');
                return false;
              });

              if (aptsAtThisTime.length === 0) {
                return (
                  <tr key={time} style={{ ...styles.trEmpty, backgroundColor: isSlotBlocked ? '#fef2f2' : '#ffffff' }}>
                    <td style={styles.tdTime}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.2rem' }}>
                        <Clock size={13} color={isSlotBlocked ? '#dc2626' : '#94a3b8'} />
                        <span style={{ fontWeight: '700', fontSize: '0.88rem', color: isSlotBlocked ? '#dc2626' : '#64748b' }}>{time}</span>
                      </div>
                    </td>
                    <td colSpan={5} style={styles.tdEmptySlot}>
                      {isSlotBlocked ? (
                        <div style={styles.blockedSlotBanner}>
                          <Lock size={13} color="#dc2626" />
                          <span>Horário Bloqueado</span>
                          <button 
                            type="button" 
                            onClick={() => setShowScheduleBlockModal(true)} 
                            style={styles.manageBlockSmallBtn}
                          >
                            Gerenciar
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => handleOpenAddModal({ time, date: formattedCurrentDate })} 
                          style={styles.emptySlotBtn}
                        >
                          <Plus size={13} /> Horário Livre — Clique para Agendar
                        </button>
                      )}
                    </td>
                  </tr>
                );
              }

              return (
                <React.Fragment key={time}>
                  {aptsAtThisTime.map((apt, idx) => {
                    const patAge = apt.patientBirthDate ? calculateAge(apt.patientBirthDate) : null;
                    const isMultiple = aptsAtThisTime.length > 1;

                    return (
                      <tr 
                        key={apt.id} 
                        style={{ 
                          borderBottom: idx === aptsAtThisTime.length - 1 ? '2px solid #e2e8f0' : '1px dashed #e2e8f0',
                          backgroundColor: apt.isEncaixe ? '#fffbeb' : '#ffffff'
                        }}
                      >
                        {idx === 0 ? (
                          <td 
                            rowSpan={aptsAtThisTime.length}
                            style={{ 
                              fontWeight: '800', 
                              color: '#0891b2', 
                              textAlign: 'center', 
                              backgroundColor: '#fafbfc',
                              borderRight: '1px solid #e2e8f0',
                              verticalAlign: 'top',
                              paddingTop: '0.75rem'
                            }}
                          >
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                                <Clock size={14} />
                                <span style={{ fontSize: '0.95rem' }}>{time}</span>
                              </div>
                              {apt.endTime && (
                                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>até {apt.endTime}</span>
                              )}
                              {isMultiple && (
                                <span style={styles.multipleBadge}>
                                  {aptsAtThisTime.length} pacientes
                                </span>
                              )}
                              <button 
                                onClick={() => handleOpenAddModal({ time, date: formattedCurrentDate, isEncaixe: true })}
                                style={{ ...styles.addEncaixeBtn, marginTop: '0.4rem' }}
                                title="Adicionar Encaixe neste horário"
                              >
                                <Zap size={10} /> + Encaixe
                              </button>
                            </div>
                          </td>
                        ) : null}

                        {/* Paciente Info */}
                        <td style={{ padding: '0.6rem 0.75rem' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                              <strong style={{ fontSize: '0.92rem', color: '#0f172a' }}>{apt.patientName}</strong>
                              {apt.isEncaixe && (
                                <span style={styles.encaixeBadge}>
                                  <Zap size={11} /> ENCAIXE
                                </span>
                              )}
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: '#64748b', flexWrap: 'wrap' }}>
                              <span style={{ fontWeight: '700', color: apt.type?.includes('Primeira') ? '#0891b2' : '#10b981' }}>
                                {apt.type}
                              </span>
                              {patAge && (
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem', color: '#475569', backgroundColor: '#f1f5f9', padding: '0.1rem 0.35rem', borderRadius: '4px' }}>
                                  <Cake size={11} color="#64748b" /> {patAge}
                                </span>
                              )}
                              {apt.patientPhone && <span>• 📞 {apt.patientPhone}</span>}
                            </div>
                            
                            {apt.notes && (
                              <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontStyle: 'italic' }}>
                                Obs: {apt.notes}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Médico & Sala */}
                        <td style={{ padding: '0.6rem 0.75rem' }}>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontWeight: '700', fontSize: '0.85rem', color: '#334155' }}>{apt.doctorName}</span>
                            <span style={{ fontSize: '0.75rem', color: apt.room === 'Nenhum' ? '#94a3b8' : '#64748b', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                              <Building2 size={12} /> {apt.room}
                            </span>
                          </div>
                        </td>

                        {/* WhatsApp */}
                        <td style={{ padding: '0.6rem 0.75rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
                            <span style={{
                              padding: '0.2rem 0.45rem',
                              borderRadius: '6px',
                              fontSize: '0.7rem',
                              fontWeight: '700',
                              backgroundColor: apt.whatsappStatus === 'Confirmado' ? '#dcfce7' : apt.whatsappStatus === 'Recusado' ? '#fee2e2' : '#fef3c7',
                              color: apt.whatsappStatus === 'Confirmado' ? '#166534' : apt.whatsappStatus === 'Recusado' ? '#991b1b' : '#b45309'
                            }}>
                              💬 {apt.whatsappStatus || 'Pendente'}
                            </span>
                            <button 
                              onClick={() => handleSendWhatsApp(apt)} 
                              style={styles.waActionBtn}
                              title="Enviar WhatsApp"
                            >
                              <Send size={11} /> Lembrete
                            </button>
                          </div>
                        </td>

                        {/* Status */}
                        <td style={{ padding: '0.6rem 0.75rem' }}>
                          <span style={{
                            padding: '0.25rem 0.6rem',
                            borderRadius: '9999px',
                            fontSize: '0.75rem',
                            fontWeight: '700',
                            display: 'inline-block',
                            backgroundColor: 
                              apt.status === 'Aguardando' ? '#fef3c7' :
                              apt.status === 'Em Consulta' ? '#ede9fe' :
                              apt.status === 'Finalizado' ? '#dcfce7' :
                              apt.status === 'Faltou' ? '#fee2e2' :
                              apt.status === 'Cancelado' ? '#f1f5f9' : '#e0f2fe',
                            color: 
                              apt.status === 'Aguardando' ? '#b45309' :
                              apt.status === 'Em Consulta' ? '#6d28d9' :
                              apt.status === 'Finalizado' ? '#166534' :
                              apt.status === 'Faltou' ? '#dc2626' :
                              apt.status === 'Cancelado' ? '#475569' : '#0369a1'
                          }}>
                            {apt.status}
                          </span>
                        </td>

                        {/* Actions */}
                        <td style={{ padding: '0.6rem 0.75rem', textAlign: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', flexWrap: 'wrap' }}>
                            {apt.status !== 'Finalizado' && apt.status !== 'Cancelado' && apt.status !== 'Faltou' && (
                              <>
                                {/* Botão de Chamada na Smart TV */}
                                <button 
                                  onClick={() => handleCallPatient(apt)} 
                                  style={{ 
                                    ...styles.statusBtn, 
                                    backgroundColor: calledApts[apt.id] ? '#7c3aed' : '#0284c7',
                                    boxShadow: calledApts[apt.id] ? '0 0 8px rgba(124, 58, 237, 0.4)' : 'none'
                                  }}
                                  title={calledApts[apt.id] ? `Rechamar na TV (${calledApts[apt.id]}x chamado)` : 'Chamar na TV'}
                                >
                                  <Radio size={12} />
                                  <span>{calledApts[apt.id] ? `Rechamar (${calledApts[apt.id]})` : 'Chamar'}</span>
                                </button>

                                {apt.status === 'Agendado' && (
                                  <button onClick={() => handleUpdateStatus(apt.id, 'Confirmado')} style={{ ...styles.statusBtn, backgroundColor: '#0284c7' }}>
                                    Confirmar
                                  </button>
                                )}
                                {(apt.status === 'Agendado' || apt.status === 'Confirmado') && (
                                  <button onClick={() => handleUpdateStatus(apt.id, 'Aguardando')} style={{ ...styles.statusBtn, backgroundColor: '#d97706' }} title="Chegou">
                                    <UserCheck size={12} /> Chegou
                                  </button>
                                )}
                                {apt.status === 'Aguardando' && (
                                  <button onClick={() => handleUpdateStatus(apt.id, 'Em Consulta')} style={{ ...styles.statusBtn, backgroundColor: '#7c3aed' }}>
                                    Iniciar
                                  </button>
                                )}
                                {apt.status === 'Em Consulta' && (
                                  <button onClick={() => handleUpdateStatus(apt.id, 'Finalizado')} style={{ ...styles.statusBtn, backgroundColor: '#16a34a' }}>
                                    Finalizar
                                  </button>
                                )}
                                {(apt.status === 'Agendado' || apt.status === 'Confirmado' || apt.status === 'Aguardando') && (
                                  <button onClick={() => handleUpdateStatus(apt.id, 'Faltou')} style={{ ...styles.statusBtn, backgroundColor: '#dc2626' }} title="Registrar Falta (No-Show)">
                                    Faltou
                                  </button>
                                )}
                              </>
                            )}

                            {apt.status === 'Faltou' && (
                              <button onClick={() => handleUpdateStatus(apt.id, 'Confirmado')} style={{ ...styles.statusBtn, backgroundColor: '#0284c7' }} title="Reagendar">
                                Reagendar
                              </button>
                            )}
                            
                            <button onClick={() => handleOpenEditModal(apt)} style={styles.iconBtn} title="Editar">
                              <Edit2 size={13} color="#0891b2" />
                            </button>
                            <button onClick={() => handleDeleteAppointment(apt)} style={{ ...styles.iconBtn, backgroundColor: '#fee2e2' }} title="Excluir">
                              <Trash2 size={13} color="#dc2626" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  // 2. Multi-Room Grid View
  const renderRoomsView = () => {
    return (
      <div style={styles.roomsContainer}>
        {availableRooms.map(roomName => {
          const roomApts = dayAppointments.filter(a => (a.room || 'Consultório 1') === roomName).sort((a,b) => a.time.localeCompare(b.time));
          return (
            <div key={roomName} style={styles.roomCard}>
              <div style={styles.roomCardHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Building2 size={16} color="#0891b2" />
                  <strong style={{ fontSize: '0.9rem', color: '#0f172a' }}>{roomName}</strong>
                </div>
                <span style={styles.roomCountBadge}>{roomApts.length}</span>
              </div>

              <div style={styles.roomCardBody}>
                {roomApts.length === 0 ? (
                  <div style={styles.emptyRoomState}>
                    <span>Nenhum atendimento nesta sala hoje.</span>
                    <button 
                      onClick={() => handleOpenAddModal({ room: roomName, date: formattedCurrentDate })} 
                      style={styles.addSmallBtn}
                    >
                      <Plus size={12} /> Agendar
                    </button>
                  </div>
                ) : (
                  roomApts.map(apt => (
                    <div key={apt.id} style={{ ...styles.roomAptItem, ...(apt.isEncaixe ? { borderLeft: '3px solid #f97316', backgroundColor: '#fffbeb' } : {}) }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <strong style={{ color: '#0891b2', fontSize: '0.85rem' }}>{apt.time}{apt.endTime ? ` - ${apt.endTime}` : ''}</strong>
                          {apt.isEncaixe && <span style={styles.encaixeBadgeSmall}>⚡ Encaixe</span>}
                        </div>
                        <span style={{ fontSize: '0.7rem', fontWeight: '700', color: '#64748b' }}>{apt.status}</span>
                      </div>
                      <span style={{ fontWeight: '700', fontSize: '0.85rem', color: '#1e293b' }}>{apt.patientName}</span>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Médico: {apt.doctorName}</span>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.3rem', marginTop: '0.3rem', flexWrap: 'wrap' }}>
                        <button 
                          onClick={() => handleCallPatient(apt)} 
                          style={{
                            ...styles.waActionBtn,
                            backgroundColor: calledApts[apt.id] ? '#7c3aed' : '#0284c7',
                            color: '#ffffff'
                          }}
                          title="Chamar na TV"
                        >
                          <Radio size={11} /> {calledApts[apt.id] ? `Rechamar (${calledApts[apt.id]})` : 'Chamar'}
                        </button>
                        <button onClick={() => handleSendWhatsApp(apt)} style={styles.waActionBtn}>
                          <Send size={11} /> WhatsApp
                        </button>
                        <button onClick={() => handleOpenEditModal(apt)} style={styles.iconBtn}>
                          <Edit2 size={12} color="#0891b2" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // 3. Weekly Grid View
  const renderWeekView = () => {
    const startOfWeek = new Date(currentDate);
    const dayIndex = startOfWeek.getDay();
    startOfWeek.setDate(startOfWeek.getDate() - dayIndex);

    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(d.getDate() + i);
      weekDays.push(d);
    }

    return (
      <div style={styles.weekContainer}>
        {weekDays.map(dayObj => {
          const formatted = dayObj.toISOString().substring(0, 10);
          const dayApts = filteredAppointments.filter(a => a.date === formatted).sort((a,b) => a.time.localeCompare(b.time));
          const isToday = new Date().toDateString() === dayObj.toDateString();
          const dayHoliday = isBrazilianHoliday(formatted);

          return (
            <div key={formatted} style={{ ...styles.weekColumn, backgroundColor: isToday ? '#f0fdfa' : '#ffffff', borderColor: isToday ? '#0891b2' : '#e2e8f0' }}>
              <div style={{ ...styles.weekColHeader, backgroundColor: isToday ? '#e0f2fe' : '#f8fafc' }}>
                <strong style={{ fontSize: '0.85rem', color: '#0f172a' }}>
                  {dayObj.toLocaleDateString('pt-BR', { weekday: 'short' })}
                </strong>
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '700' }}>
                  {dayObj.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                </span>
                {dayHoliday.isHoliday && (
                  <span style={styles.holidayBadgeMini} title={`Feriado: ${dayHoliday.name}`}>
                    🇧🇷 {dayHoliday.name}
                  </span>
                )}
                <span style={styles.weekCountBadge}>{dayApts.length}</span>
              </div>

              <div style={styles.weekColBody}>
                {dayApts.length === 0 ? (
                  <div style={styles.emptyWeekState}>
                    <button onClick={() => handleOpenAddModal({ date: formatted })} style={styles.addSmallBtn}>
                      <Plus size={11} /> Agendar
                    </button>
                  </div>
                ) : (
                  dayApts.map(apt => (
                    <div 
                      key={apt.id} 
                      onClick={() => handleOpenEditModal(apt)}
                      style={{ 
                        ...styles.weekAptCard, 
                        ...(apt.isEncaixe ? { borderLeft: '3px solid #f97316', backgroundColor: '#fffbeb' } : {}) 
                      }} 
                      title="Editar"
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#0891b2' }}>{apt.time}</span>
                        {apt.isEncaixe && <span style={styles.encaixeBadgeSmall}>⚡ Encaixe</span>}
                        <span style={{ fontSize: '0.65rem', fontWeight: '700', color: '#64748b' }}>{apt.room}</span>
                      </div>
                      <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#0f172a', margin: '0.1rem 0' }}>{apt.patientName}</div>
                      <div style={{ fontSize: '0.7rem', color: '#475569' }}>{apt.doctorName}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // 4. Monthly Grid View
  const renderMonthView = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    const cells = [];
    for (let i = 0; i < firstDayIndex; i++) cells.push(null);
    for (let i = 1; i <= totalDays; i++) cells.push(new Date(year, month, i));

    return (
      <div style={styles.monthCalendarGrid}>
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(w => (
          <div key={w} style={styles.monthDayName}>{w}</div>
        ))}
        {cells.map((cell, idx) => {
          if (!cell) return <div key={`empty-${idx}`} style={styles.monthCellEmpty}></div>;

          const formatted = cell.toISOString().substring(0, 10);
          const dayApts = filteredAppointments.filter(a => a.date === formatted);
          const encaixesCount = dayApts.filter(a => a.isEncaixe).length;
          const isToday = new Date().toDateString() === cell.toDateString();
          const dayHoliday = isBrazilianHoliday(formatted);

          return (
            <div 
              key={formatted} 
              onClick={() => {
                setCurrentDate(cell);
                setViewMode('day');
              }}
              style={{ 
                ...styles.monthCell, 
                backgroundColor: isToday ? '#f0fdfa' : dayHoliday.isHoliday ? '#fefce8' : '#ffffff', 
                borderColor: isToday ? '#0891b2' : dayHoliday.isHoliday ? '#fef08a' : '#e2e8f0' 
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: '800', color: isToday ? '#0891b2' : '#334155' }}>
                  {cell.getDate()}
                </span>
                {dayHoliday.isHoliday && (
                  <span style={styles.holidayBadgeMicro} title={dayHoliday.name}>
                    🇧🇷
                  </span>
                )}
              </div>

              {dayHoliday.isHoliday && (
                <div style={styles.monthHolidayName} title={dayHoliday.name}>
                  {dayHoliday.name}
                </div>
              )}

              {dayApts.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', marginTop: '0.25rem' }}>
                  <div style={styles.monthAptBadge}>
                    {dayApts.length} {dayApts.length === 1 ? 'consulta' : 'consultas'}
                  </div>
                  {encaixesCount > 0 && (
                    <div style={{ ...styles.monthAptBadge, backgroundColor: '#ffedd5', color: '#c2410c' }}>
                      ⚡ {encaixesCount} encaixe{encaixesCount > 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div style={styles.container}>
      {/* Top Header */}
      <div style={styles.header}>
        <div style={styles.headerTitleBox}>
          <div style={styles.headerIcon}>
            <CalendarIcon size={24} color="#ffffff" />
          </div>
          <div>
            <h1 style={styles.title}>Agenda</h1>
            <p style={styles.subtitle}>Painel multissala com feriados nacionais, bloqueios, WhatsApp e cotas anuais por médico.</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <UnitSelector compact showLabel={false} />
          <button 
            onClick={() => setShowDoctorScheduleModal(true)} 
            className="btn btn-secondary" 
            style={styles.configBtn} 
            title="Configurar cotas anuais e grade de cada médico"
          >
            <Sliders size={15} />
            <span>Grade</span>
          </button>
          <button 
            onClick={() => setShowScheduleBlockModal(true)} 
            className="btn btn-secondary" 
            style={styles.blockBtn} 
            title="Bloquear dias ou períodos para ausências ou congressos"
          >
            <Lock size={15} />
            <span>Bloquear</span>
          </button>
          <button 
            onClick={() => setShowTvModal(true)} 
            className="btn btn-secondary" 
            style={{
              ...styles.configBtn,
              backgroundColor: '#f0f9ff',
              borderColor: '#bae6fd',
              color: '#0284c7'
            }} 
            title="Abrir ou copiar o link do Painel da TV"
          >
            <Tv size={15} />
            <span>Painel</span>
          </button>
          <button onClick={fetchData} className="btn btn-secondary" style={styles.refreshBtn} title="Atualizar">
            <RefreshCw size={15} className={loading ? 'spin' : ''} />
            <span>Atualizar</span>
          </button>
          <button onClick={() => handleOpenAddModal()} className="btn btn-primary" style={styles.newAptBtn}>
            <Plus size={18} /> Agendar
          </button>
        </div>
      </div>

      {/* Alert Notification */}
      {message.text && (
        <div style={{
          ...styles.alert,
          backgroundColor: message.type === 'danger' ? '#fef2f2' : '#f0fdf4',
          color: message.type === 'danger' ? '#991b1b' : '#166534',
          borderColor: message.type === 'danger' ? '#fca5a5' : '#bbf7d0'
        }}>
          {message.type === 'danger' ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
          <span>{message.text}</span>
        </div>
      )}

      {/* 🇧🇷 BANNER DE FERIADO NACIONAL (se o dia atual for feriado) */}
      {currentHoliday.isHoliday && (
        <div style={styles.holidayBanner}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.3rem' }}>🇧🇷</span>
            <div>
              <strong style={{ fontSize: '0.9rem', color: '#854d0e' }}>
                Feriado Nacional: {currentHoliday.name}
              </strong>
              <span style={{ fontSize: '0.75rem', color: '#a16207', marginLeft: '0.5rem' }}>
                ({currentHoliday.type})
              </span>
            </div>
          </div>
          <span style={styles.holidayTag}>Feriado</span>
        </div>
      )}

      {/* 🔒 BANNER DE BLOQUEIO DE MÉDICO (se houver bloqueio no dia selecionado) */}
      {currentDayBlocks.length > 0 && (
        <div style={styles.doctorBlockBanner}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Lock size={18} color="#dc2626" />
            <div>
              <strong style={{ fontSize: '0.88rem', color: '#991b1b' }}>
                Bloqueios ({currentDayBlocks.length}):
              </strong>
              <span style={{ fontSize: '0.78rem', color: '#7f1d1d', marginLeft: '0.4rem' }}>
                {currentDayBlocks.map(b => `${b.doctorName} (${b.reason} - ${b.period})`).join(' | ')}
              </span>
            </div>
          </div>
          <button 
            onClick={() => setShowScheduleBlockModal(true)} 
            style={styles.manageBlockBtn}
          >
            Bloqueios
          </button>
        </div>
      )}

      {/* 📊 KPI Cards - Recepção do Dia */}
      <div style={styles.kpiGrid}>
        <div 
          onClick={() => setSelectedStatusFilter('all')}
          style={{ ...styles.kpiCard, borderColor: selectedStatusFilter === 'all' ? '#0891b2' : '#e2e8f0', cursor: 'pointer' }}
        >
          <div style={styles.kpiHeader}>
            <span style={styles.kpiLabel}>Total</span>
            <Users size={18} color="#0891b2" />
          </div>
          <div style={styles.kpiValue}>{kpis.total}</div>
          <div style={styles.kpiSub}>Hoje</div>
        </div>

        <div 
          onClick={() => setSelectedStatusFilter('Confirmado')}
          style={{ ...styles.kpiCard, borderColor: selectedStatusFilter === 'Confirmado' ? '#0284c7' : '#e2e8f0', cursor: 'pointer' }}
        >
          <div style={styles.kpiHeader}>
            <span style={styles.kpiLabel}>Confirmados</span>
            <CheckCircle2 size={18} color="#0284c7" />
          </div>
          <div style={{ ...styles.kpiValue, color: '#0284c7' }}>{kpis.confirmed}</div>
          <div style={styles.kpiSub}>Confirmados</div>
        </div>

        <div 
          onClick={() => setSelectedStatusFilter('Aguardando')}
          style={{ ...styles.kpiCard, borderColor: selectedStatusFilter === 'Aguardando' ? '#d97706' : '#e2e8f0', cursor: 'pointer' }}
        >
          <div style={styles.kpiHeader}>
            <span style={styles.kpiLabel}>Aguardando</span>
            <Clock size={18} color="#d97706" />
          </div>
          <div style={{ ...styles.kpiValue, color: '#d97706' }}>{kpis.waiting}</div>
          <div style={styles.kpiSub}>Recepção</div>
        </div>

        <div 
          onClick={() => setSelectedStatusFilter('Em Consulta')}
          style={{ ...styles.kpiCard, borderColor: selectedStatusFilter === 'Em Consulta' ? '#7c3aed' : '#e2e8f0', cursor: 'pointer' }}
        >
          <div style={styles.kpiHeader}>
            <span style={styles.kpiLabel}>Atendimento</span>
            <HeartPulse size={18} color="#7c3aed" />
          </div>
          <div style={{ ...styles.kpiValue, color: '#7c3aed' }}>{kpis.inProgress}</div>
          <div style={styles.kpiSub}>Consultório</div>
        </div>

        <div 
          onClick={() => setSelectedStatusFilter('Encaixe')}
          style={{ ...styles.kpiCard, borderColor: selectedStatusFilter === 'Encaixe' ? '#ea580c' : '#e2e8f0', cursor: 'pointer', backgroundColor: '#fff7ed' }}
        >
          <div style={styles.kpiHeader}>
            <span style={{ ...styles.kpiLabel, color: '#c2410c' }}>Encaixes</span>
            <Zap size={18} color="#ea580c" />
          </div>
          <div style={{ ...styles.kpiValue, color: '#ea580c' }}>{kpis.encaixes}</div>
          <div style={styles.kpiSub}>Extras</div>
        </div>

        <div 
          onClick={() => setSelectedStatusFilter('Finalizado')}
          style={{ ...styles.kpiCard, borderColor: selectedStatusFilter === 'Finalizado' ? '#16a34a' : '#e2e8f0', cursor: 'pointer' }}
        >
          <div style={styles.kpiHeader}>
            <span style={styles.kpiLabel}>Concluídos</span>
            <UserCheck size={18} color="#16a34a" />
          </div>
          <div style={{ ...styles.kpiValue, color: '#16a34a' }}>{kpis.finished}</div>
          <div style={styles.kpiSub}>Finalizados</div>
        </div>
      </div>

      {/* 🏷️ Legenda Visual Limpa (Sem os nomes das cores) */}
      <div style={styles.legendContainer}>
        <div style={styles.legendHeader}>
          <Filter size={13} color="#0891b2" />
          <span style={{ fontWeight: '700', fontSize: '0.8rem', color: '#334155' }}>Legenda:</span>
        </div>
        <div style={styles.legendBadges}>
          <div style={styles.legendItem}>
            <span style={{ ...styles.legendDot, backgroundColor: '#0284c7' }} />
            <span>Agendado</span>
          </div>
          <div style={styles.legendItem}>
            <span style={{ ...styles.legendDot, backgroundColor: '#16a34a' }} />
            <span>Confirmado</span>
          </div>
          <div style={styles.legendItem}>
            <span style={{ ...styles.legendDot, backgroundColor: '#d97706' }} />
            <span>Aguardando</span>
          </div>
          <div style={styles.legendItem}>
            <span style={{ ...styles.legendDot, backgroundColor: '#7c3aed' }} />
            <span>Em Consulta</span>
          </div>
          <div style={{ ...styles.legendItem, backgroundColor: '#ffedd5', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>
            <span style={{ ...styles.legendDot, backgroundColor: '#ea580c' }} />
            <span style={{ fontWeight: '800', color: '#c2410c' }}>⚡ Encaixe</span>
          </div>
          <div style={styles.legendItem}>
            <span style={{ ...styles.legendDot, backgroundColor: '#dc2626' }} />
            <span>Faltou</span>
          </div>
          <div style={styles.legendItem}>
            <span style={{ ...styles.legendDot, backgroundColor: '#64748b' }} />
            <span>Cancelado</span>
          </div>
        </div>
      </div>

      {/* Toolbar & Date Stepper */}
      <div style={styles.toolbar}>
        <div style={styles.viewModeGroup}>
          <button onClick={() => setViewMode('day')} style={{ ...styles.viewBtn, ...(viewMode === 'day' ? styles.viewBtnActive : {}) }}>Horários</button>
          <button onClick={() => setViewMode('rooms')} style={{ ...styles.viewBtn, ...(viewMode === 'rooms' ? styles.viewBtnActive : {}) }}>Salas</button>
          <button onClick={() => setViewMode('week')} style={{ ...styles.viewBtn, ...(viewMode === 'week' ? styles.viewBtnActive : {}) }}>Semanal</button>
          <button onClick={() => setViewMode('month')} style={{ ...styles.viewBtn, ...(viewMode === 'month' ? styles.viewBtnActive : {}) }}>Mensal</button>
        </div>

        <div style={styles.dateNavigator}>
          <button onClick={() => handleNavigateDate(-1)} style={styles.navArrowBtn}><ChevronLeft size={16} /></button>
          <button onClick={handleGoToToday} style={styles.todayBtn}>Hoje</button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <strong style={styles.currentDateLabel}>
              {viewMode === 'day' || viewMode === 'rooms' 
                ? currentDate.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'long', year: 'numeric' })
                : viewMode === 'week'
                ? `Semana de ${currentDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}`
                : currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
            </strong>
            {currentHoliday.isHoliday && (
              <span style={styles.holidayBadgeInline} title={currentHoliday.name}>
                🇧🇷 Feriado
              </span>
            )}
          </div>
          <button onClick={() => handleNavigateDate(1)} style={styles.navArrowBtn}><ChevronRight size={16} /></button>
        </div>

        {/* Global Universal Search Bar (Searches across all years, months, and days) */}
        <div style={styles.searchBox}>
          <Search size={16} color="#0891b2" />
          <input 
            type="text" 
            placeholder="Pesquisar..." 
            value={searchTerm} 
            onChange={e => setSearchTerm(e.target.value)}
            style={styles.searchInput}
            title="Pesquise por nome, CPF, telefone, médico, data ou procedimento em todos os anos e meses"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} style={styles.clearSearchBtn} title="Limpar"><X size={14} /></button>
          )}
        </div>
      </div>

      {/* Secondary Filters Bar */}
      <div style={styles.filterBar}>
        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>Médico</label>
          <select value={selectedDoctorId} onChange={e => setSelectedDoctorId(e.target.value)} style={styles.selectFilter}>
            <option value="all">Todos</option>
            {sortDoctorsByName(doctors).map(d => (
              <option key={d.uid} value={d.uid}>{formatDoctorDisplayName(d.name)}</option>
            ))}
          </select>
        </div>

        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>Sala</label>
          <select value={selectedRoom} onChange={e => setSelectedRoom(e.target.value)} style={styles.selectFilter}>
            <option value="all">Todas</option>
            {availableRooms.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>Status</label>
          <select value={selectedStatusFilter} onChange={e => setSelectedStatusFilter(e.target.value)} style={styles.selectFilter}>
            <option value="all">Todos</option>
            <option value="Agendado">Agendado</option>
            <option value="Confirmado">Confirmado</option>
            <option value="Aguardando">Aguardando</option>
            <option value="Em Consulta">Em Consulta</option>
            <option value="Encaixe">Encaixes</option>
            <option value="Finalizado">Finalizado</option>
            <option value="Faltou">Faltou</option>
            <option value="Cancelado">Cancelado</option>
          </select>
        </div>

        {(selectedDoctorId !== 'all' || selectedRoom !== 'all' || selectedStatusFilter !== 'all' || searchTerm) && (
          <button 
            onClick={() => {
              setSelectedDoctorId('all');
              setSelectedRoom('all');
              setSelectedStatusFilter('all');
              setSearchTerm('');
            }}
            style={styles.clearFiltersBtn}
          >
            Limpar
          </button>
        )}
      </div>

      {/* View Content */}
      <div style={{ marginTop: '0.75rem' }}>
        {loading ? (
          <div style={styles.loadingBox}>
            <RefreshCw size={24} className="spin" color="#0891b2" />
            <span>Sincronizando agenda com a nuvem...</span>
          </div>
        ) : searchTerm.trim() ? (
          /* Render Global Search Results whenever a search term is present */
          renderGlobalSearchView()
        ) : (
          <>
            {viewMode === 'day' && renderDayView()}
            {viewMode === 'rooms' && renderRoomsView()}
            {viewMode === 'week' && renderWeekView()}
            {viewMode === 'month' && renderMonthView()}
          </>
        )}
      </div>

      {/* MODAL: CONFIGURAÇÃO DE GRADE & COTAS POR MÉDICO */}
      <DoctorScheduleModal
        isOpen={showDoctorScheduleModal}
        onClose={() => setShowDoctorScheduleModal(false)}
        doctors={doctors}
        selectedDoctorId={selectedDoctorId !== 'all' ? selectedDoctorId : doctors[0]?.uid}
        appointments={currentAppointments}
        onSaved={() => {
          fetchData();
          showAlert('Agenda atualizada com sucesso!');
        }}
      />

      {/* MODAL: BLOQUEIO DE DIAS & AUSÊNCIAS */}
      <ScheduleBlockModal
        isOpen={showScheduleBlockModal}
        onClose={() => setShowScheduleBlockModal(false)}
        doctors={doctors}
        appointments={currentAppointments}
        existingBlocks={currentScheduleBlocks}
        activeUnitId={activeUnitId}
        onBlockSaved={() => {
          fetchData();
          showAlert('Bloqueio criado com sucesso!');
        }}
        onBlockDeleted={() => {
          fetchData();
          showAlert('Bloqueio removido com sucesso!');
        }}
      />

      {/* MODAL: NOVO / EDITAR AGENDAMENTO */}
      {showModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            {/* Modal Header */}
            <div style={styles.modalHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CalendarIcon size={20} color="#0891b2" />
                <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#0f172a', fontWeight: '800' }}>
                  {editingApt ? 'Editar' : 'Agendamento'}
                </h3>
              </div>
              <button onClick={() => setShowModal(false)} style={styles.closeBtn}>
                <X size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveAppointment} style={styles.modalBody}>
              
              {/* 🇧🇷 ALERTA DE FERIADO NO AGENDAMENTO */}
              {modalDateHoliday.isHoliday && (
                <div style={styles.modalHolidayAlert}>
                  <span style={{ fontSize: '1.1rem' }}>🇧🇷</span>
                  <div style={{ fontSize: '0.8rem', color: '#854d0e', fontWeight: '700' }}>
                    Atenção: A data selecionada ({aptForm.date.split('-').reverse().join('/')}) é Feriado Nacional ({modalDateHoliday.name}).
                  </div>
                </div>
              )}

              {/* 🔒 ALERTA DE BLOQUEIO DE MÉDICO */}
              {modalDoctorBlock && (
                <div style={styles.modalBlockAlert}>
                  <Lock size={16} color="#dc2626" />
                  <div style={{ fontSize: '0.8rem', color: '#991b1b', fontWeight: '700' }}>
                    Aviso: O profissional possui bloqueio nesta data ({modalDoctorBlock.reason} - {modalDoctorBlock.period}).
                  </div>
                </div>
              )}

              {/* ⚠️ ALERTA DE DIA DE ATENDIMENTO NÃO CONFIGURADO */}
              {modalDoctorDayConfig && !modalDoctorDayConfig.isDayActive && (
                <div style={styles.modalDayAlert}>
                  <AlertTriangle size={16} color="#d97706" />
                  <div style={{ fontSize: '0.8rem', color: '#92400e', fontWeight: '700' }}>
                    Aviso: O médico não possui atendimento previsto para este dia da semana na grade.
                  </div>
                </div>
              )}

              {/* 📊 AVISO DE COTA ATINGIDA */}
              {modalDoctorQuotaCheck && (modalDoctorQuotaCheck.firstExceeded || modalDoctorQuotaCheck.returnExceeded) && (
                <div style={styles.modalQuotaAlert}>
                  <Award size={16} color="#c2410c" />
                  <div style={{ fontSize: '0.8rem', color: '#9a3412', fontWeight: '700' }}>
                    {modalDoctorQuotaCheck.firstExceeded && `Cota de Primeira Consulta atingida (${modalDoctorQuotaCheck.firstCount}/${modalDoctorQuotaCheck.firstLimit} no mês)!`}
                    {modalDoctorQuotaCheck.returnExceeded && `Cota de Retorno atingida (${modalDoctorQuotaCheck.returnCount}/${modalDoctorQuotaCheck.returnLimit} no mês)!`}
                  </div>
                </div>
              )}

              {/* Paciente Autocomplete / Nome */}
              <div style={{ position: 'relative' }}>
                <label style={styles.inputLabel}>Paciente *</label>
                <input 
                  type="text" 
                  className="form-control" 
                  required 
                  placeholder="Buscar paciente por nome ou CPF..."
                  value={patientSearchInModal || aptForm.patientName} 
                  onChange={e => {
                    setPatientSearchInModal(e.target.value);
                    setAptForm(f => ({ ...f, patientName: e.target.value, patientId: '' }));
                  }} 
                  style={styles.textInput}
                />

                {/* Dropdown Autocomplete */}
                {modalFilteredPatients.length > 0 && (
                  <div style={styles.autocompleteDropdown}>
                    {modalFilteredPatients.map(p => (
                      <div 
                        key={p.id} 
                        onClick={() => {
                          setAptForm(f => ({
                            ...f,
                            patientId: p.id,
                            patientName: p.name,
                            patientPhone: p.phone || '',
                            patientCpf: p.cpf || '',
                            patientBirthDate: p.birthDate || ''
                          }));
                          setPatientSearchInModal(p.name);
                        }}
                        style={styles.autocompleteItem}
                      >
                        <strong style={{ color: '#0f172a' }}>{p.name}</strong>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>CPF: {p.cpf || 'Não informado'} | Tel: {p.phone || 'S/ Tel'}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Data de Nascimento */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={styles.inputLabel}>
                    Nascimento {currentModalPatientAge && <span style={styles.ageBadge}>({currentModalPatientAge})</span>}
                  </label>
                  <input 
                    type="date" 
                    className="form-control" 
                    value={aptForm.patientBirthDate} 
                    onChange={e => setAptForm({ ...aptForm, patientBirthDate: e.target.value })} 
                    style={styles.textInput}
                  />
                </div>
                <div>
                  <label style={styles.inputLabel}>Telefone</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="(31) 98888-7777"
                    value={aptForm.patientPhone} 
                    onChange={e => setAptForm({ ...aptForm, patientPhone: e.target.value })} 
                    style={styles.textInput}
                  />
                </div>
              </div>

              {/* Médico e Tipo */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={styles.inputLabel}>Médico *</label>
                  <select 
                    className="form-control" 
                    required 
                    value={aptForm.doctorId} 
                    onChange={e => {
                      const newDocId = e.target.value;
                      const duration = getDoctorDuration(newDocId);
                      setAptForm(f => ({
                        ...f,
                        doctorId: newDocId,
                        endTime: addMinutesToTime(f.time, duration)
                      }));
                    }}
                    style={styles.textInput}
                  >
                    <option value="">Selecione o Médico</option>
                    {sortDoctorsByName(doctors).map(d => (
                      <option key={d.uid} value={d.uid}>{formatDoctorDisplayName(d.name)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={styles.inputLabel}>Tipo</label>
                  <select 
                    className="form-control" 
                    value={aptForm.type} 
                    onChange={e => setAptForm({ ...aptForm, type: e.target.value })}
                    style={styles.textInput}
                  >
                    <option value="Primeira Consulta">Primeira Consulta (Cota)</option>
                    <option value="Retorno">Retorno (Cota)</option>
                    <option value="Consulta Nefrologia">Consulta Nefrologia</option>
                    <option value="Avaliação Nutricional">Nutrição</option>
                    <option value="Acompanhamento Psicológico">Psicologia</option>
                    <option value="Procedimento Clínico">Procedimento</option>
                    <option value="Sessão de Diálise">Diálise</option>
                    <option value="Exame Ultrassom">Ultrassom</option>
                  </select>
                </div>
              </div>

              {/* Data, Horário Inicial, Horário Final e Sala */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr 1.2fr', gap: '0.75rem' }}>
                <div>
                  <label style={styles.inputLabel}>Data *</label>
                  <input 
                    type="date" 
                    required 
                    className="form-control" 
                    value={aptForm.date} 
                    onChange={e => setAptForm({ ...aptForm, date: e.target.value })} 
                    style={styles.textInput}
                  />
                </div>
                <div>
                  <label style={styles.inputLabel}>Início *</label>
                  <input 
                    type="time" 
                    required 
                    className="form-control" 
                    value={aptForm.time} 
                    onChange={e => {
                      const newTime = e.target.value;
                      const duration = getDoctorDuration(aptForm.doctorId);
                      setAptForm(f => ({
                        ...f,
                        time: newTime,
                        endTime: addMinutesToTime(newTime, duration)
                      }));
                    }}
                    style={styles.textInput}
                  />
                </div>
                <div>
                  <label style={styles.inputLabel}>Fim</label>
                  <input 
                    type="time" 
                    className="form-control" 
                    value={aptForm.endTime} 
                    onChange={e => setAptForm({ ...aptForm, endTime: e.target.value })} 
                    style={styles.textInput}
                  />
                </div>
                <div>
                  <label style={styles.inputLabel}>Consultório</label>
                  <select 
                    className="form-control" 
                    value={aptForm.room} 
                    onChange={e => setAptForm({ ...aptForm, room: e.target.value })}
                    style={styles.textInput}
                  >
                    {availableRooms.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* ⚠️ ALERTA DE HORÁRIO CONFLITANTE / ENCAIXE */}
              {conflictingAppointments.length > 0 && (
                <div style={styles.conflictBox}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#c2410c', fontWeight: '700', fontSize: '0.85rem' }}>
                    <AlertTriangle size={17} color="#ea580c" />
                    <span>Atenção: Horário já possui {conflictingAppointments.length} agendamento(s) com este profissional!</span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#7c2d12', marginTop: '0.25rem', paddingLeft: '1.4rem' }}>
                    <strong>Paciente(s) neste horário:</strong> {conflictingAppointments.map(c => `${c.patientName} (${c.type})`).join(', ')}
                  </div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginTop: '0.5rem', cursor: 'pointer', fontSize: '0.82rem', fontWeight: '700', color: '#9a3412' }}>
                    <input 
                      type="checkbox" 
                      checked={aptForm.isEncaixe} 
                      onChange={e => setAptForm(f => ({ ...f, isEncaixe: e.target.checked }))}
                      style={{ width: '16px', height: '16px', accentColor: '#ea580c' }}
                    />
                    <span>⚡ Confirmar como ENCAIXE</span>
                  </label>
                </div>
              )}

              {/* Flag de Encaixe manual */}
              {conflictingAppointments.length === 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.6rem', backgroundColor: '#fffbeb', borderRadius: '6px', border: '1px solid #fef3c7' }}>
                  <input 
                    type="checkbox" 
                    id="isEncaixeCheckbox"
                    checked={aptForm.isEncaixe} 
                    onChange={e => setAptForm(f => ({ ...f, isEncaixe: e.target.checked }))}
                    style={{ width: '16px', height: '16px', accentColor: '#ea580c' }}
                  />
                  <label htmlFor="isEncaixeCheckbox" style={{ fontSize: '0.8rem', fontWeight: '700', color: '#b45309', cursor: 'pointer', margin: 0 }}>
                    ⚡ Marcar como Encaixe
                  </label>
                </div>
              )}

              {/* Status e Observações */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '0.75rem' }}>
                <div>
                  <label style={styles.inputLabel}>Status</label>
                  <select 
                    className="form-control" 
                    value={aptForm.status} 
                    onChange={e => setAptForm({ ...aptForm, status: e.target.value })}
                    style={styles.textInput}
                  >
                    <option value="Agendado">Agendado</option>
                    <option value="Confirmado">Confirmado</option>
                    <option value="Aguardando">Aguardando</option>
                    <option value="Em Consulta">Em Consulta</option>
                    <option value="Finalizado">Finalizado</option>
                    <option value="Faltou">Faltou</option>
                    <option value="Cancelado">Cancelado</option>
                  </select>
                </div>
                <div>
                  <label style={styles.inputLabel}>Observações</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Ex: Jejum 8h, trazer exames..." 
                    value={aptForm.notes} 
                    onChange={e => setAptForm({ ...aptForm, notes: e.target.value })} 
                    style={styles.textInput}
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div style={styles.modalFooter}>
                <button type="button" onClick={() => setShowModal(false)} style={styles.cancelBtn}>
                  Cancelar
                </button>
                <button type="submit" disabled={actionLoading} style={styles.confirmSaveBtn}>
                  {actionLoading ? 'Salvando...' : editingApt ? 'Salvar' : 'Confirmar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: PAINEL DA SMART TV */}
      {showTvModal && (
        <div style={styles.modalOverlay}>
          <div style={{ ...styles.modalContent, maxWidth: '580px' }}>
            <div style={styles.modalHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Tv size={20} color="#0284c7" />
                <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#0f172a', fontWeight: '800' }}>
                  Painel
                </h3>
              </div>
              <button onClick={() => setShowTvModal(false)} style={styles.closeBtn}>
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#475569', lineHeight: 1.5 }}>
                  Abra este link no navegador de qualquer Smart TV na sala de espera para exibir e vocalizar as chamadas de pacientes em tempo real.
                </p>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: '10px',
                  padding: '0.6rem 0.85rem'
                }}>
                  <input
                    readOnly
                    value={`${window.location.origin}/?painel_tv=1&unidade=${activeUnitId === 'all' ? 'betim' : activeUnitId}`}
                    style={{
                      flex: 1,
                      border: 'none',
                      backgroundColor: 'transparent',
                      fontSize: '0.85rem',
                      color: '#0369a1',
                      fontWeight: '600',
                      outline: 'none'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const link = `${window.location.origin}/?painel_tv=1&unidade=${activeUnitId === 'all' ? 'betim' : activeUnitId}`;
                      navigator.clipboard.writeText(link);
                      setCopiedTvLink(true);
                      setTimeout(() => setCopiedTvLink(false), 2500);
                    }}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      padding: '0.4rem 0.75rem',
                      borderRadius: '6px',
                      backgroundColor: copiedTvLink ? '#16a34a' : '#0284c7',
                      color: '#ffffff',
                      border: 'none',
                      fontSize: '0.8rem',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                  >
                    {copiedTvLink ? <Check size={14} /> : <Copy size={14} />}
                    <span>{copiedTvLink ? 'Copiado' : 'Copiar'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const link = `${window.location.origin}/?painel_tv=1&unidade=${activeUnitId === 'all' ? 'betim' : activeUnitId}`;
                      window.open(link, '_blank');
                    }}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      padding: '0.4rem 0.75rem',
                      borderRadius: '6px',
                      backgroundColor: '#f1f5f9',
                      color: '#334155',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.8rem',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                  >
                    <ExternalLink size={14} />
                    <span>Abrir</span>
                  </button>
                </div>
              </div>

              <div style={{
                backgroundColor: '#f0f9ff',
                border: '1px solid #bae6fd',
                borderRadius: '10px',
                padding: '1rem',
                fontSize: '0.85rem',
                color: '#0369a1',
                lineHeight: 1.6
              }}>
                <strong style={{ display: 'block', marginBottom: '0.4rem', color: '#0284c7' }}>
                  📺 Instruções para a Smart TV:
                </strong>
                1. No controle da TV, abra o aplicativo Navegador (Internet).<br />
                2. Digite o endereço copiado acima e acesse a página.<br />
                3. Toque no botão "Tela" para colocar o painel em tela cheia.<br />
                4. Toque no botão "Ativar" na TV uma única vez para autorizar a voz e o sino sonoro.
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowTvTipsModal(true)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.5rem 0.9rem',
                    borderRadius: '8px',
                    backgroundColor: '#f0fdf4',
                    color: '#166534',
                    border: '1px solid #bbf7d0',
                    fontSize: '0.85rem',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                  title="Gerenciar e personalizar as 70 dicas educativas da TV"
                >
                  <Sparkles size={16} color="#16a34a" />
                  <span>Dicas</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowTvModal(false)}
                  style={styles.cancelBtn}
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: GERENCIAMENTO DE DICAS EDUCATIVAS DA TV */}
      <TvTipsManagerModal
        isOpen={showTvTipsModal}
        onClose={() => setShowTvTipsModal(false)}
      />

      {/* Calendar Reports Modal (NexaCAL) */}
      {isReportsOpen && (
        <CalendarReportsModal
          onClose={() => setIsReportsOpen && setIsReportsOpen(false)}
          appointments={appointments}
          patients={patients}
          doctors={doctors}
          doctorSchedules={doctorSchedules}
          scheduleBlocks={scheduleBlocks}
          tenantSettings={tenantSettings}
        />
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '1.5rem',
    maxWidth: '1350px',
    margin: '0 auto',
    fontFamily: 'Inter, system-ui, sans-serif'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.25rem',
    flexWrap: 'wrap',
    gap: '1rem'
  },
  headerTitleBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem'
  },
  headerIcon: {
    width: '46px',
    height: '46px',
    borderRadius: '12px',
    backgroundColor: '#0891b2',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(8, 145, 178, 0.25)'
  },
  title: {
    fontSize: '1.45rem',
    fontWeight: '800',
    color: '#0f172a',
    margin: 0
  },
  subtitle: {
    fontSize: '0.85rem',
    color: '#64748b',
    margin: 0
  },
  configBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    padding: '0.55rem 0.9rem',
    borderRadius: '8px',
    backgroundColor: '#ecfdf5',
    color: '#065f46',
    border: '1px solid #a7f3d0',
    fontWeight: '700',
    fontSize: '0.85rem',
    cursor: 'pointer'
  },
  blockBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    padding: '0.55rem 0.9rem',
    borderRadius: '8px',
    backgroundColor: '#fef2f2',
    color: '#991b1b',
    border: '1px solid #fecaca',
    fontWeight: '700',
    fontSize: '0.85rem',
    cursor: 'pointer'
  },
  refreshBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    padding: '0.55rem 0.9rem',
    borderRadius: '8px',
    backgroundColor: '#f1f5f9',
    color: '#334155',
    border: '1px solid #cbd5e1',
    fontWeight: '600',
    fontSize: '0.85rem',
    cursor: 'pointer'
  },
  newAptBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    padding: '0.55rem 1.1rem',
    borderRadius: '8px',
    backgroundColor: '#0891b2',
    color: '#ffffff',
    border: 'none',
    fontWeight: '700',
    fontSize: '0.85rem',
    boxShadow: '0 2px 6px rgba(8, 145, 178, 0.3)',
    cursor: 'pointer'
  },
  alert: {
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    border: '1px solid',
    marginBottom: '1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.85rem',
    fontWeight: '600'
  },
  holidayBanner: {
    backgroundColor: '#fefce8',
    border: '1px solid #fef08a',
    borderRadius: '10px',
    padding: '0.65rem 1rem',
    marginBottom: '1rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  holidayTag: {
    backgroundColor: '#fef08a',
    color: '#713f12',
    fontSize: '0.72rem',
    fontWeight: '800',
    padding: '0.2rem 0.5rem',
    borderRadius: '6px'
  },
  doctorBlockBanner: {
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '10px',
    padding: '0.65rem 1rem',
    marginBottom: '1rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  manageBlockBtn: {
    backgroundColor: '#fee2e2',
    border: '1px solid #fca5a5',
    color: '#991b1b',
    fontSize: '0.75rem',
    fontWeight: '700',
    padding: '0.3rem 0.6rem',
    borderRadius: '6px',
    cursor: 'pointer'
  },
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
    gap: '0.75rem',
    marginBottom: '1rem'
  },
  kpiCard: {
    backgroundColor: '#ffffff',
    padding: '0.85rem',
    borderRadius: '10px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
    transition: 'all 0.15s ease'
  },
  kpiHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.35rem'
  },
  kpiLabel: {
    fontSize: '0.75rem',
    fontWeight: '700',
    color: '#64748b'
  },
  kpiValue: {
    fontSize: '1.5rem',
    fontWeight: '800',
    color: '#0f172a'
  },
  kpiSub: {
    fontSize: '0.7rem',
    color: '#94a3b8'
  },
  legendContainer: {
    backgroundColor: '#f8fafc',
    padding: '0.6rem 0.85rem',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    marginBottom: '1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    flexWrap: 'wrap'
  },
  legendHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.3rem'
  },
  legendBadges: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.85rem',
    flexWrap: 'wrap'
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    fontSize: '0.75rem',
    color: '#475569',
    fontWeight: '600'
  },
  legendDot: {
    width: '10px',
    height: '10px',
    borderRadius: '9999px',
    display: 'inline-block'
  },
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '0.75rem',
    backgroundColor: '#ffffff',
    padding: '0.75rem 1rem',
    borderRadius: '10px',
    border: '1px solid #e2e8f0',
    marginBottom: '0.75rem',
    flexWrap: 'wrap'
  },
  viewModeGroup: {
    display: 'flex',
    gap: '0.25rem',
    backgroundColor: '#f1f5f9',
    padding: '3px',
    borderRadius: '8px'
  },
  viewBtn: {
    padding: '0.4rem 0.75rem',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: 'transparent',
    color: '#64748b',
    fontSize: '0.8rem',
    fontWeight: '600',
    cursor: 'pointer'
  },
  viewBtnActive: {
    backgroundColor: '#ffffff',
    color: '#0891b2',
    fontWeight: '800',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
  },
  dateNavigator: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  navArrowBtn: {
    background: 'none',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    padding: '0.35rem',
    cursor: 'pointer',
    color: '#334155',
    display: 'flex',
    alignItems: 'center'
  },
  todayBtn: {
    backgroundColor: '#f1f5f9',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    padding: '0.35rem 0.7rem',
    fontSize: '0.8rem',
    fontWeight: '700',
    cursor: 'pointer',
    color: '#334155'
  },
  currentDateLabel: {
    fontSize: '0.92rem',
    color: '#0f172a',
    textTransform: 'capitalize'
  },
  holidayBadgeInline: {
    fontSize: '0.68rem',
    fontWeight: '800',
    backgroundColor: '#fef08a',
    color: '#854d0e',
    padding: '0.1rem 0.4rem',
    borderRadius: '4px'
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    backgroundColor: '#f8fafc',
    border: '1px solid #0891b2',
    borderRadius: '8px',
    padding: '0.35rem 0.65rem'
  },
  searchInput: {
    border: 'none',
    backgroundColor: 'transparent',
    outline: 'none',
    fontSize: '0.82rem',
    color: '#0f172a',
    width: '200px'
  },
  clearSearchBtn: {
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    color: '#94a3b8',
    padding: 0
  },
  filterBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    backgroundColor: '#ffffff',
    padding: '0.65rem 1rem',
    borderRadius: '10px',
    border: '1px solid #e2e8f0',
    flexWrap: 'wrap'
  },
  filterGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem'
  },
  filterLabel: {
    fontSize: '0.78rem',
    fontWeight: '700',
    color: '#475569'
  },
  selectFilter: {
    padding: '0.35rem 0.6rem',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    fontSize: '0.8rem',
    color: '#0f172a',
    backgroundColor: '#ffffff'
  },
  clearFiltersBtn: {
    backgroundColor: '#fee2e2',
    border: 'none',
    color: '#991b1b',
    fontSize: '0.75rem',
    fontWeight: '700',
    padding: '0.35rem 0.65rem',
    borderRadius: '6px',
    cursor: 'pointer'
  },
  searchResultsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem'
  },
  searchResultsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ecfeff',
    border: '1px solid #a5f3fc',
    padding: '0.65rem 1rem',
    borderRadius: '8px'
  },
  clearSearchBadgeBtn: {
    backgroundColor: '#ffffff',
    border: '1px solid #0891b2',
    color: '#0891b2',
    borderRadius: '6px',
    padding: '0.25rem 0.6rem',
    fontSize: '0.75rem',
    fontWeight: '700',
    cursor: 'pointer'
  },
  emptyGlobalSearch: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    padding: '3rem 1.5rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    textAlign: 'center'
  },
  jumpDateBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    backgroundColor: '#e0f2fe',
    color: '#0369a1',
    border: '1px solid #bae6fd',
    borderRadius: '5px',
    padding: '0.25rem 0.5rem',
    fontSize: '0.7rem',
    fontWeight: '700',
    cursor: 'pointer'
  },
  btnSecondarySmall: {
    backgroundColor: '#f1f5f9',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    padding: '0.4rem 0.8rem',
    fontSize: '0.8rem',
    fontWeight: '700',
    color: '#334155',
    cursor: 'pointer',
    marginTop: '0.5rem'
  },
  loadingBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.75rem',
    padding: '4rem',
    color: '#64748b',
    fontSize: '0.9rem'
  },
  tableWrapper: {
    backgroundColor: '#ffffff',
    borderRadius: '10px',
    border: '1px solid #e2e8f0',
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse'
  },
  th: {
    backgroundColor: '#f8fafc',
    padding: '0.65rem 0.85rem',
    fontSize: '0.75rem',
    fontWeight: '800',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    borderBottom: '1px solid #e2e8f0'
  },
  trEmpty: {
    borderBottom: '1px solid #f1f5f9'
  },
  tdTime: {
    padding: '0.6rem 0.75rem',
    textAlign: 'center',
    backgroundColor: '#fafbfc',
    borderRight: '1px solid #e2e8f0'
  },
  tdEmptySlot: {
    padding: '0.4rem 0.75rem'
  },
  emptySlotBtn: {
    width: '100%',
    padding: '0.45rem',
    borderRadius: '6px',
    border: '1px dashed #cbd5e1',
    backgroundColor: 'transparent',
    color: '#94a3b8',
    fontSize: '0.8rem',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.3rem',
    transition: 'all 0.15s ease'
  },
  blockedSlotBanner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    padding: '0.45rem',
    borderRadius: '6px',
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    color: '#991b1b',
    fontSize: '0.78rem',
    fontWeight: '700'
  },
  manageBlockSmallBtn: {
    backgroundColor: '#fee2e2',
    border: '1px solid #fca5a5',
    color: '#991b1b',
    fontSize: '0.7rem',
    fontWeight: '700',
    padding: '0.15rem 0.45rem',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  multipleBadge: {
    fontSize: '0.65rem',
    backgroundColor: '#ea580c',
    color: '#ffffff',
    padding: '0.1rem 0.4rem',
    borderRadius: '9999px',
    fontWeight: '800',
    marginTop: '0.2rem'
  },
  addEncaixeBtn: {
    border: '1px solid #fed7aa',
    backgroundColor: '#fff7ed',
    color: '#c2410c',
    fontSize: '0.68rem',
    fontWeight: '800',
    padding: '0.15rem 0.45rem',
    borderRadius: '4px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.2rem'
  },
  encaixeBadge: {
    fontSize: '0.65rem',
    fontWeight: '800',
    backgroundColor: '#ffedd5',
    color: '#c2410c',
    padding: '0.1rem 0.4rem',
    borderRadius: '4px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.2rem'
  },
  encaixeBadgeSmall: {
    fontSize: '0.65rem',
    fontWeight: '800',
    backgroundColor: '#ffedd5',
    color: '#c2410c',
    padding: '0.05rem 0.35rem',
    borderRadius: '3px'
  },
  waActionBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    backgroundColor: '#dcfce7',
    color: '#166534',
    border: '1px solid #86efac',
    borderRadius: '5px',
    padding: '0.2rem 0.45rem',
    fontSize: '0.7rem',
    fontWeight: '700',
    cursor: 'pointer'
  },
  statusBtn: {
    padding: '0.25rem 0.5rem',
    borderRadius: '5px',
    border: 'none',
    color: '#ffffff',
    fontSize: '0.7rem',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.2rem'
  },
  iconBtn: {
    padding: '0.3rem',
    borderRadius: '5px',
    border: '1px solid #cbd5e1',
    backgroundColor: '#ffffff',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  roomsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '1rem'
  },
  roomCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
  },
  roomCardHeader: {
    backgroundColor: '#f8fafc',
    padding: '0.75rem 1rem',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  roomCountBadge: {
    fontSize: '0.75rem',
    fontWeight: '800',
    backgroundColor: '#0891b2',
    color: '#ffffff',
    padding: '0.15rem 0.5rem',
    borderRadius: '9999px'
  },
  roomCardBody: {
    padding: '0.75rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    minHeight: '200px'
  },
  emptyRoomState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    padding: '2rem',
    color: '#94a3b8',
    fontSize: '0.8rem',
    textAlign: 'center',
    flex: 1
  },
  addSmallBtn: {
    backgroundColor: '#f1f5f9',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    padding: '0.25rem 0.6rem',
    fontSize: '0.75rem',
    fontWeight: '700',
    color: '#334155',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.2rem'
  },
  roomAptItem: {
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '0.6rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.2rem'
  },
  weekContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '0.5rem',
    minHeight: '500px'
  },
  weekColumn: {
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  },
  weekColHeader: {
    padding: '0.5rem',
    textAlign: 'center',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.15rem'
  },
  holidayBadgeMini: {
    fontSize: '0.62rem',
    fontWeight: '800',
    backgroundColor: '#fef08a',
    color: '#854d0e',
    padding: '0.05rem 0.25rem',
    borderRadius: '3px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  holidayBadgeMicro: {
    fontSize: '0.7rem'
  },
  monthHolidayName: {
    fontSize: '0.62rem',
    fontWeight: '800',
    color: '#854d0e',
    backgroundColor: '#fef08a',
    padding: '0.05rem 0.25rem',
    borderRadius: '3px',
    marginTop: '0.15rem',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  weekCountBadge: {
    fontSize: '0.68rem',
    fontWeight: '800',
    backgroundColor: '#0891b2',
    color: '#ffffff',
    padding: '0.05rem 0.35rem',
    borderRadius: '9999px',
    alignSelf: 'center',
    marginTop: '0.2rem'
  },
  weekColBody: {
    padding: '0.4rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem',
    flex: 1,
    overflowY: 'auto'
  },
  emptyWeekState: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    padding: '1rem'
  },
  weekAptCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    padding: '0.4rem',
    cursor: 'pointer',
    boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
  },
  monthCalendarGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '0.4rem'
  },
  monthDayName: {
    textAlign: 'center',
    padding: '0.5rem',
    fontSize: '0.75rem',
    fontWeight: '800',
    color: '#64748b',
    backgroundColor: '#f8fafc',
    borderRadius: '6px'
  },
  monthCellEmpty: {
    backgroundColor: '#f8fafc',
    borderRadius: '6px',
    opacity: 0.5,
    minHeight: '85px'
  },
  monthCell: {
    border: '1px solid',
    borderRadius: '8px',
    padding: '0.4rem',
    minHeight: '85px',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    transition: 'all 0.15s ease'
  },
  monthAptBadge: {
    fontSize: '0.68rem',
    fontWeight: '700',
    backgroundColor: '#e0f2fe',
    color: '#0369a1',
    padding: '0.1rem 0.35rem',
    borderRadius: '4px',
    textAlign: 'center'
  },
  modalOverlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    zIndex: 99999, padding: '1rem'
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: '14px',
    width: '100%', maxWidth: '700px',
    maxHeight: '90vh',
    display: 'flex', flexDirection: 'column',
    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
    overflow: 'hidden'
  },
  modalHeader: {
    padding: '1rem 1.25rem',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#f8fafc'
  },
  closeBtn: {
    background: 'none', border: 'none', cursor: 'pointer', color: '#64748b'
  },
  modalBody: {
    padding: '1.25rem',
    display: 'flex', flexDirection: 'column', gap: '0.85rem',
    overflowY: 'auto'
  },
  modalHolidayAlert: {
    backgroundColor: '#fefce8', border: '1px solid #fef08a', borderRadius: '8px',
    padding: '0.5rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem'
  },
  modalBlockAlert: {
    backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px',
    padding: '0.5rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem'
  },
  modalDayAlert: {
    backgroundColor: '#fffbeb', border: '1px solid #fef3c7', borderRadius: '8px',
    padding: '0.5rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem'
  },
  modalQuotaAlert: {
    backgroundColor: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '8px',
    padding: '0.5rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem'
  },
  inputLabel: {
    fontSize: '0.75rem', fontWeight: '700', color: '#475569', marginBottom: '0.25rem', display: 'block'
  },
  textInput: {
    padding: '0.5rem 0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1',
    fontSize: '0.85rem', color: '#0f172a', width: '100%', outline: 'none'
  },
  ageBadge: {
    fontSize: '0.7rem', color: '#0891b2', fontWeight: '800'
  },
  autocompleteDropdown: {
    position: 'absolute', top: '100%', left: 0, right: 0,
    backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px',
    marginTop: '2px', zIndex: 100, boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
    maxHeight: '180px', overflowY: 'auto'
  },
  autocompleteItem: {
    padding: '0.5rem 0.75rem', borderBottom: '1px solid #f1f5f9', cursor: 'pointer',
    display: 'flex', flexDirection: 'column'
  },
  conflictBox: {
    backgroundColor: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '8px',
    padding: '0.65rem', display: 'flex', flexDirection: 'column'
  },
  modalFooter: {
    display: 'flex', justifyContent: 'flex-end', gap: '0.6rem', marginTop: '0.5rem'
  },
  cancelBtn: {
    padding: '0.55rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1',
    backgroundColor: '#ffffff', color: '#475569', fontSize: '0.85rem', fontWeight: '700', cursor: 'pointer'
  },
  confirmSaveBtn: {
    padding: '0.55rem 1.25rem', borderRadius: '8px', border: 'none',
    backgroundColor: '#0891b2', color: '#ffffff', fontSize: '0.85rem', fontWeight: '800', cursor: 'pointer'
  }
};
