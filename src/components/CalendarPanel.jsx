import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, Clock, User, HeartPulse, Building2, Plus, 
  ChevronLeft, ChevronRight, CheckCircle2, AlertTriangle, MessageSquare, Check, X,
  Search, RefreshCw, Phone, Edit2, Trash2, ArrowRight, UserCheck, ShieldAlert, Sparkles,
  Send, Users, Eye, Filter
} from 'lucide-react';
import { dbService } from '../firebase';

export default function CalendarPanel({ currentUser }) {
  // Navigation & View Mode
  const [viewMode, setViewMode] = useState('day'); // 'day' | 'rooms' | 'week' | 'month'
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Data States
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Filter States
  const [selectedDoctorId, setSelectedDoctorId] = useState('all');
  const [selectedRoom, setSelectedRoom] = useState('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State for Create & Edit
  const [showModal, setShowModal] = useState(false);
  const [editingApt, setEditingApt] = useState(null);
  const [patientSearchInModal, setPatientSearchInModal] = useState('');
  
  const [aptForm, setAptForm] = useState({
    patientId: '',
    patientName: '',
    patientPhone: '',
    patientCpf: '',
    doctorId: '',
    date: new Date().toISOString().substring(0, 10),
    time: '09:00',
    type: 'Consulta Médica',
    room: 'Consultório 1',
    status: 'Agendado',
    notes: ''
  });

  const timeSlots = [
    '07:00', '07:30', '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00'
  ];

  const availableRooms = [
    'Consultório 1',
    'Consultório 2',
    'Consultório 3',
    'Salão 1 (Diálise)',
    'Salão 2 (Diálise)',
    'Sala Ultrassom',
    'Sala de Pequenos Procedimentos'
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [aptList, patList, userList] = await Promise.all([
        dbService.getAppointments(),
        dbService.getPatients(),
        dbService.getUsers()
      ]);

      setAppointments(aptList || []);
      setPatients(patList || []);

      // Filter clinical professionals / doctors
      const docList = (userList || []).filter(u => 
        u.role === 'admin' || 
        u.role === 'professional' || 
        u.role === 'clinical' || 
        (u.allowedSectors && u.allowedSectors.includes('medica'))
      );
      setDoctors(docList.length > 0 ? docList : userList || []);

      // Seed mock sample appointments if DB is brand new
      if ((!aptList || aptList.length === 0) && patList && patList.length > 0) {
        const todayStr = new Date().toISOString().substring(0, 10);
        const fallbacks = [
          {
            patientId: patList[0]?.id || 'pat-1',
            patientName: patList[0]?.name || 'ADAIR PRAXEDES MORENO',
            patientPhone: patList[0]?.phone || '31988887777',
            patientCpf: patList[0]?.cpf || '123.456.789-00',
            doctorId: docList[0]?.uid || 'doc-1',
            doctorName: docList[0]?.name || 'Dr. Carlos (Nefrologista)',
            date: todayStr,
            time: '08:30',
            type: 'Consulta Nefrologia',
            room: 'Consultório 1',
            status: 'Confirmado',
            whatsappStatus: 'Enviado',
            notes: 'Acompanhamento trimestral de creatinina'
          },
          {
            patientId: patList[1]?.id || 'pat-2',
            patientName: patList[1]?.name || 'ADAO LUCIANO DIAS',
            patientPhone: patList[1]?.phone || '31977776666',
            patientCpf: patList[1]?.cpf || '987.654.321-11',
            doctorId: docList[0]?.uid || 'doc-1',
            doctorName: docList[0]?.name || 'Dr. Carlos (Nefrologista)',
            date: todayStr,
            time: '10:00',
            type: 'Sessão de Diálise',
            room: 'Salão 1 (Diálise)',
            status: 'Aguardando',
            whatsappStatus: 'Confirmado',
            notes: 'Ajuste de peso seco'
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

  // Open Add Modal
  const handleOpenAddModal = (initialSlot = null) => {
    setEditingApt(null);
    setPatientSearchInModal('');
    const todayStr = currentDate.toISOString().substring(0, 10);
    setAptForm({
      patientId: '',
      patientName: '',
      patientPhone: '',
      patientCpf: '',
      doctorId: doctors[0]?.uid || '',
      date: initialSlot?.date || todayStr,
      time: initialSlot?.time || '09:00',
      type: 'Consulta Nefrologia',
      room: initialSlot?.room || 'Consultório 1',
      status: 'Agendado',
      notes: ''
    });
    setShowModal(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (apt) => {
    setEditingApt(apt);
    setPatientSearchInModal(apt.patientName || '');
    setAptForm({
      patientId: apt.patientId || '',
      patientName: apt.patientName || '',
      patientPhone: apt.patientPhone || '',
      patientCpf: apt.patientCpf || '',
      doctorId: apt.doctorId || '',
      date: apt.date || '',
      time: apt.time || '09:00',
      type: apt.type || 'Consulta Nefrologia',
      room: apt.room || 'Consultório 1',
      status: apt.status || 'Agendado',
      notes: apt.notes || ''
    });
    setShowModal(true);
  };

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
    const docName = docFound ? docFound.name : 'Profissional Clínico';

    // Conflict Check: Check if doctor already has an active appointment in this date and time (ignoring itself if editing)
    const hasConflict = appointments.some(apt => 
      apt.id !== editingApt?.id &&
      apt.doctorId === aptForm.doctorId && 
      apt.date === aptForm.date && 
      apt.time === aptForm.time &&
      apt.status !== 'Cancelado'
    );

    if (hasConflict) {
      return showAlert(`O profissional "${docName}" já possui atendimento marcado em ${aptForm.date.split('-').reverse().join('/')} às ${aptForm.time}!`, 'danger');
    }

    let patName = aptForm.patientName;
    let patPhone = aptForm.patientPhone;
    let patCpf = aptForm.patientCpf;

    if (aptForm.patientId) {
      const p = patients.find(pat => pat.id === aptForm.patientId);
      if (p) {
        patName = p.name;
        patPhone = p.phone || patPhone;
        patCpf = p.cpf || patCpf;
      }
    }

    const appointmentPayload = {
      patientId: aptForm.patientId || 'avulso',
      patientName: patName,
      patientPhone: patPhone,
      patientCpf: patCpf,
      doctorId: aptForm.doctorId,
      doctorName: docName,
      date: aptForm.date,
      time: aptForm.time,
      type: aptForm.type,
      room: aptForm.room,
      status: aptForm.status || 'Agendado',
      whatsappStatus: editingApt?.whatsappStatus || 'Pendente',
      notes: aptForm.notes || '',
      updatedAt: new Date().toISOString()
    };

    setActionLoading(true);
    try {
      if (editingApt) {
        // Optimistic update
        setAppointments(prev => prev.map(a => a.id === editingApt.id ? { ...a, ...appointmentPayload } : a));
        await dbService.updateAppointment(editingApt.id, appointmentPayload);
        showAlert(`Agendamento de "${patName}" atualizado com sucesso!`);
      } else {
        const created = await dbService.createAppointment(appointmentPayload);
        setAppointments(prev => [...prev, created]);
        showAlert(`Consulta de "${patName}" agendada com sucesso para ${aptForm.date.split('-').reverse().join('/')} às ${aptForm.time}!`);
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
    // Optimistic UI update
    setAppointments(prev => prev.map(a => a.id === aptId ? { ...a, status: newStatus } : a));
    try {
      await dbService.updateAppointment(aptId, { status: newStatus });
      if (newStatus === 'Aguardando') {
        showAlert('Paciente registrado na Sala de Espera / Recepção!', 'success');
      } else if (newStatus === 'Em Consulta') {
        showAlert('Atendimento clínico iniciado!', 'success');
      } else if (newStatus === 'Finalizado') {
        showAlert('Atendimento finalizado com sucesso!', 'success');
      } else {
        showAlert(`Status atualizado para: ${newStatus}`, 'success');
      }
    } catch (err) {
      console.error(err);
      showAlert('Erro ao atualizar status na nuvem.', 'danger');
      fetchData();
    }
  };

  // WhatsApp Sender
  const handleSendWhatsApp = async (apt) => {
    const rawPhone = (apt.patientPhone || '').replace(/\D/g, '');
    const dateFormatted = apt.date ? apt.date.split('-').reverse().join('/') : '';
    const textMsg = `Olá *${apt.patientName}*! 👋\nConfirmamos seu agendamento de *${apt.type}* com *${apt.doctorName}* na clínica *NexAi* para o dia *${dateFormatted}* às *${apt.time}* (${apt.room}).\n\nPor favor, responda *SIM* para confirmar ou nos avise se precisar reagendar.`;
    
    // Open WhatsApp Web/API
    const waUrl = rawPhone.length >= 10 
      ? `https://wa.me/55${rawPhone}?text=${encodeURIComponent(textMsg)}`
      : `https://wa.me/?text=${encodeURIComponent(textMsg)}`;
    
    window.open(waUrl, '_blank');

    // Update status to 'Enviado' in Firestore
    try {
      await dbService.updateAppointment(apt.id, { whatsappStatus: 'Enviado' });
      setAppointments(prev => prev.map(a => a.id === apt.id ? { ...a, whatsappStatus: 'Enviado' } : a));
    } catch (e) {
      console.error(e);
    }
  };

  // Simulate WhatsApp Confirmation / Recusal
  const handleSimulateWhatsAppResponse = async (aptId, response) => {
    const newAptStatus = response === 'Confirmado' ? 'Confirmado' : 'Cancelado';
    setAppointments(prev => prev.map(a => a.id === aptId ? { ...a, whatsappStatus: response, status: newAptStatus } : a));
    try {
      await dbService.updateAppointment(aptId, { 
        whatsappStatus: response,
        status: newAptStatus
      });
      showAlert(`WhatsApp: Paciente registrou "${response.toUpperCase()}"`, 'success');
    } catch (err) {
      console.error(err);
      fetchData();
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

  // Filtered Appointments
  const formattedCurrentDate = useMemo(() => {
    return currentDate.toISOString().substring(0, 10);
  }, [currentDate]);

  const filteredAppointments = useMemo(() => {
    return appointments.filter(apt => {
      // Doctor filter
      if (selectedDoctorId !== 'all' && apt.doctorId !== selectedDoctorId) return false;
      // Room filter
      if (selectedRoom !== 'all' && apt.room !== selectedRoom) return false;
      // Status filter
      if (selectedStatusFilter !== 'all' && apt.status !== selectedStatusFilter) return false;
      // Search term
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchName = (apt.patientName || '').toLowerCase().includes(term);
        const matchDoc = (apt.doctorName || '').toLowerCase().includes(term);
        const matchNotes = (apt.notes || '').toLowerCase().includes(term);
        const matchType = (apt.type || '').toLowerCase().includes(term);
        const matchCpf = (apt.patientCpf || '').includes(term);
        if (!matchName && !matchDoc && !matchNotes && !matchType && !matchCpf) return false;
      }
      return true;
    });
  }, [appointments, selectedDoctorId, selectedRoom, selectedStatusFilter, searchTerm]);

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
    const canceled = dayAppointments.filter(a => a.status === 'Cancelado').length;
    return { total, waiting, inProgress, finished, confirmed, canceled };
  }, [dayAppointments]);

  // Filtered Patients inside modal search
  const modalFilteredPatients = useMemo(() => {
    if (!patientSearchInModal.trim()) return patients.slice(0, 30);
    const term = patientSearchInModal.toLowerCase();
    return patients.filter(p => 
      (p.name || '').toLowerCase().includes(term) ||
      (p.cpf || '').includes(term) ||
      (p.phone || '').includes(term)
    ).slice(0, 30);
  }, [patients, patientSearchInModal]);

  // ----------------------------------------------------
  // RENDER VIEWS
  // ----------------------------------------------------

  // 1. Daily Timeline View
  const renderDayView = () => {
    return (
      <div style={styles.gridContainer}>
        <table style={styles.calendarTable}>
          <thead>
            <tr>
              <th style={{ width: '90px', textAlign: 'center' }}>Horário</th>
              <th style={{ width: '28%' }}>Paciente & Contato</th>
              <th style={{ width: '22%' }}>Profissional & Sala</th>
              <th style={{ width: '16%' }}>WhatsApp</th>
              <th style={{ width: '14%' }}>Status</th>
              <th style={{ width: '20%', textAlign: 'center' }}>Ações de Recepção</th>
            </tr>
          </thead>
          <tbody>
            {timeSlots.map(time => {
              const aptsAtThisTime = dayAppointments.filter(a => a.time === time);
              return (
                <tr key={time} style={{ borderBottom: '1px solid #f1f5f9', minHeight: '52px' }}>
                  <td style={{ fontWeight: '800', color: '#0891b2', textAlign: 'center', backgroundColor: '#fafbfc' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.2rem' }}>
                      <Clock size={13} />
                      <span>{time}</span>
                    </div>
                  </td>
                  
                  {aptsAtThisTime.length === 0 ? (
                    <td colSpan="5" style={{ padding: '0.4rem 0.75rem' }}>
                      <button 
                        onClick={() => handleOpenAddModal({ time, date: formattedCurrentDate })} 
                        style={styles.emptySlotBtn}
                      >
                        <Plus size={14} /> Horário Livre — Clique para Agendar
                      </button>
                    </td>
                  ) : (
                    aptsAtThisTime.map(apt => (
                      <React.Fragment key={apt.id}>
                        <td style={{ padding: '0.6rem 0.75rem' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                            <strong style={{ fontSize: '0.9rem', color: '#0f172a' }}>{apt.patientName}</strong>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: '#64748b' }}>
                              <span>{apt.type}</span>
                              {apt.patientPhone && <span>• 📞 {apt.patientPhone}</span>}
                            </div>
                            {apt.notes && (
                              <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontStyle: 'italic' }}>
                                Obs: {apt.notes}
                              </span>
                            )}
                          </div>
                        </td>

                        <td style={{ padding: '0.6rem 0.75rem' }}>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontWeight: '700', fontSize: '0.85rem', color: '#334155' }}>{apt.doctorName}</span>
                            <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                              <Building2 size={12} /> {apt.room}
                            </span>
                          </div>
                        </td>

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
                              title="Enviar confirmação via WhatsApp Web"
                            >
                              <Send size={12} /> Lembrete
                            </button>
                          </div>
                        </td>

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
                              apt.status === 'Cancelado' ? '#fee2e2' : '#e0f2fe',
                            color: 
                              apt.status === 'Aguardando' ? '#b45309' :
                              apt.status === 'Em Consulta' ? '#6d28d9' :
                              apt.status === 'Finalizado' ? '#166534' :
                              apt.status === 'Cancelado' ? '#991b1b' : '#0369a1'
                          }}>
                            {apt.status}
                          </span>
                        </td>

                        <td style={{ padding: '0.6rem 0.75rem', textAlign: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', flexWrap: 'wrap' }}>
                            {apt.status !== 'Finalizado' && apt.status !== 'Cancelado' && (
                              <>
                                {apt.status === 'Agendado' && (
                                  <button onClick={() => handleUpdateStatus(apt.id, 'Confirmado')} style={{ ...styles.statusBtn, backgroundColor: '#0284c7' }}>
                                    Confirmar
                                  </button>
                                )}
                                {(apt.status === 'Agendado' || apt.status === 'Confirmado') && (
                                  <button onClick={() => handleUpdateStatus(apt.id, 'Aguardando')} style={{ ...styles.statusBtn, backgroundColor: '#d97706' }} title="Paciente chegou na recepção">
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
                              </>
                            )}
                            
                            <button onClick={() => handleOpenEditModal(apt)} style={styles.iconBtn} title="Editar / Reagendar">
                              <Edit2 size={13} color="#0891b2" />
                            </button>
                            <button onClick={() => handleDeleteAppointment(apt)} style={{ ...styles.iconBtn, backgroundColor: '#fee2e2' }} title="Excluir Agendamento">
                              <Trash2 size={13} color="#dc2626" />
                            </button>
                          </div>
                        </td>
                      </React.Fragment>
                    ))
                  )}
                </tr>
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
          const roomApts = dayAppointments.filter(a => a.room === roomName).sort((a,b) => a.time.localeCompare(b.time));
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
                    <span>Nenhum atendimento marcado para esta sala hoje.</span>
                    <button 
                      onClick={() => handleOpenAddModal({ room: roomName, date: formattedCurrentDate })} 
                      style={styles.addSmallBtn}
                    >
                      <Plus size={12} /> Agendar Sala
                    </button>
                  </div>
                ) : (
                  roomApts.map(apt => (
                    <div key={apt.id} style={styles.roomAptItem}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong style={{ color: '#0891b2', fontSize: '0.85rem' }}>{apt.time}</strong>
                        <span style={{ fontSize: '0.7rem', fontWeight: '700', color: '#64748b' }}>{apt.status}</span>
                      </div>
                      <span style={{ fontWeight: '700', fontSize: '0.85rem', color: '#1e293b' }}>{apt.patientName}</span>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Médico: {apt.doctorName}</span>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.3rem', marginTop: '0.3rem' }}>
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
    const dayOfWeek = startOfWeek.getDay();
    startOfWeek.setDate(startOfWeek.getDate() - dayOfWeek);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(d.getDate() + i);
      days.push(d);
    }

    return (
      <div style={styles.weekGrid}>
        {days.map(day => {
          const formatted = day.toISOString().substring(0, 10);
          const dayApts = filteredAppointments.filter(a => a.date === formatted).sort((a,b) => a.time.localeCompare(b.time));
          const isToday = new Date().toDateString() === day.toDateString();

          return (
            <div key={formatted} style={{ ...styles.weekColumn, backgroundColor: isToday ? '#f0fdfa' : '#ffffff' }}>
              <div style={{ ...styles.weekHeader, backgroundColor: isToday ? '#ccfbf1' : '#f8fafc', borderBottomColor: isToday ? '#0891b2' : '#e2e8f0' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: isToday ? '#0f766e' : '#64748b' }}>
                  {day.toLocaleDateString('pt-BR', { weekday: 'short' })}
                </span>
                <strong style={{ fontSize: '1.25rem', display: 'block', color: '#0f172a' }}>{day.getDate()}</strong>
              </div>
              <div style={{ padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', minHeight: '380px' }}>
                {dayApts.length === 0 ? (
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontStyle: 'italic', textAlign: 'center', marginTop: '1.5rem' }}>Sem consultas</span>
                ) : (
                  dayApts.map(apt => (
                    <div key={apt.id} onClick={() => handleOpenEditModal(apt)} style={styles.weekAptCard} title="Clique para editar">
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#0891b2' }}>{apt.time}</span>
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
          const isToday = new Date().toDateString() === cell.toDateString();

          return (
            <div 
              key={formatted} 
              onClick={() => {
                setCurrentDate(cell);
                setViewMode('day');
              }}
              style={{ ...styles.monthCell, backgroundColor: isToday ? '#f0fdfa' : '#ffffff', borderColor: isToday ? '#0891b2' : '#e2e8f0' }}
            >
              <span style={{ fontSize: '0.85rem', fontWeight: '800', color: isToday ? '#0891b2' : '#334155' }}>
                {cell.getDate()}
              </span>
              {dayApts.length > 0 && (
                <div style={styles.monthAptBadge}>
                  {dayApts.length} {dayApts.length === 1 ? 'consulta' : 'consultas'}
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
            <h1 style={styles.title}>NexaCAL — Gestão de Agenda & Consultas</h1>
            <p style={styles.subtitle}>Painel multissala de agendamento em tempo real com confirmação WhatsApp e recepção ágil.</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button onClick={fetchData} className="btn btn-secondary" style={styles.refreshBtn} title="Atualizar dados na nuvem">
            <RefreshCw size={15} className={loading ? 'spin' : ''} />
            <span>Atualizar</span>
          </button>
          <button onClick={() => handleOpenAddModal()} className="btn btn-primary" style={styles.newAptBtn}>
            <Plus size={18} /> Novo Agendamento
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

      {/* 📊 KPI Cards - Recepção do Dia */}
      <div style={styles.kpiGrid}>
        <div 
          onClick={() => setSelectedStatusFilter('all')}
          style={{ ...styles.kpiCard, borderColor: selectedStatusFilter === 'all' ? '#0891b2' : '#e2e8f0', cursor: 'pointer' }}
        >
          <div style={styles.kpiHeader}>
            <span style={styles.kpiLabel}>Total do Dia</span>
            <Users size={18} color="#0891b2" />
          </div>
          <div style={styles.kpiValue}>{kpis.total}</div>
          <div style={styles.kpiSub}>Agendamentos hoje</div>
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
          <div style={styles.kpiSub}>Presença confirmada</div>
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
          <div style={styles.kpiSub}>Na sala de espera</div>
        </div>

        <div 
          onClick={() => setSelectedStatusFilter('Em Consulta')}
          style={{ ...styles.kpiCard, borderColor: selectedStatusFilter === 'Em Consulta' ? '#7c3aed' : '#e2e8f0', cursor: 'pointer' }}
        >
          <div style={styles.kpiHeader}>
            <span style={styles.kpiLabel}>Em Atendimento</span>
            <HeartPulse size={18} color="#7c3aed" />
          </div>
          <div style={{ ...styles.kpiValue, color: '#7c3aed' }}>{kpis.inProgress}</div>
          <div style={styles.kpiSub}>No consultório / salão</div>
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
          <div style={styles.kpiSub}>Finalizados com sucesso</div>
        </div>
      </div>

      {/* Toolbar & Date Stepper */}
      <div style={styles.toolbar}>
        <div style={styles.viewModeGroup}>
          <button onClick={() => setViewMode('day')} style={{ ...styles.viewBtn, ...(viewMode === 'day' ? styles.viewBtnActive : {}) }}>Horários</button>
          <button onClick={() => setViewMode('rooms')} style={{ ...styles.viewBtn, ...(viewMode === 'rooms' ? styles.viewBtnActive : {}) }}>Por Salas</button>
          <button onClick={() => setViewMode('week')} style={{ ...styles.viewBtn, ...(viewMode === 'week' ? styles.viewBtnActive : {}) }}>Semanal</button>
          <button onClick={() => setViewMode('month')} style={{ ...styles.viewBtn, ...(viewMode === 'month' ? styles.viewBtnActive : {}) }}>Mensal</button>
        </div>

        <div style={styles.dateNavigator}>
          <button onClick={() => handleNavigateDate(-1)} style={styles.navArrowBtn}><ChevronLeft size={16} /></button>
          <button onClick={handleGoToToday} style={styles.todayBtn}>Hoje</button>
          <strong style={styles.currentDateLabel}>
            {viewMode === 'day' || viewMode === 'rooms' 
              ? currentDate.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'long', year: 'numeric' })
              : viewMode === 'week'
              ? `Semana de ${currentDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}`
              : currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
          </strong>
          <button onClick={() => handleNavigateDate(1)} style={styles.navArrowBtn}><ChevronRight size={16} /></button>
        </div>

        {/* Global Search Bar */}
        <div style={styles.searchBox}>
          <Search size={16} color="#64748b" />
          <input 
            type="text" 
            placeholder="Buscar por paciente, CPF, médico ou nota..." 
            value={searchTerm} 
            onChange={e => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} style={styles.clearSearchBtn}><X size={14} /></button>
          )}
        </div>
      </div>

      {/* Secondary Filters Bar */}
      <div style={styles.filterBar}>
        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>Filtrar Médico:</label>
          <select value={selectedDoctorId} onChange={e => setSelectedDoctorId(e.target.value)} style={styles.selectFilter}>
            <option value="all">Todos os Profissionais</option>
            {doctors.map(d => (
              <option key={d.uid} value={d.uid}>{d.name}</option>
            ))}
          </select>
        </div>

        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>Filtrar Sala:</label>
          <select value={selectedRoom} onChange={e => setSelectedRoom(e.target.value)} style={styles.selectFilter}>
            <option value="all">Todas as Salas</option>
            {availableRooms.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>Filtrar Status:</label>
          <select value={selectedStatusFilter} onChange={e => setSelectedStatusFilter(e.target.value)} style={styles.selectFilter}>
            <option value="all">Todos os Status</option>
            <option value="Agendado">Agendado</option>
            <option value="Confirmado">Confirmado</option>
            <option value="Aguardando">Aguardando (Recepção)</option>
            <option value="Em Consulta">Em Consulta</option>
            <option value="Finalizado">Finalizado</option>
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
            style={styles.resetFiltersBtn}
          >
            Limpar Filtros
          </button>
        )}
      </div>

      {/* Main View Area */}
      {loading ? (
        <div style={styles.loadingContainer}>
          <RefreshCw size={28} className="spin" color="#0891b2" />
          <p style={{ marginTop: '0.75rem', color: '#64748b', fontWeight: '600' }}>Carregando agenda em tempo real...</p>
        </div>
      ) : (
        <>
          {viewMode === 'day' && renderDayView()}
          {viewMode === 'rooms' && renderRoomsView()}
          {viewMode === 'week' && renderWeekView()}
          {viewMode === 'month' && renderMonthView()}
        </>
      )}

      {/* Modal de Agendamento / Edição */}
      {showModal && (
        <div style={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div style={styles.modalCard} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CalendarIcon size={20} color="#0891b2" />
                <h2 style={styles.modalTitle}>{editingApt ? 'Editar / Reagendar Consulta' : 'Novo Agendamento Clínico'}</h2>
              </div>
              <button onClick={() => setShowModal(false)} style={styles.closeModalBtn}><X size={20} /></button>
            </div>

            <form onSubmit={handleSaveAppointment} style={styles.modalForm}>
              {/* Paciente Selection with Instant Search */}
              <div style={styles.formSection}>
                <label style={styles.inputLabel}>Localizar Paciente Cadastrado</label>
                <div style={styles.patientSearchBox}>
                  <Search size={15} color="#64748b" />
                  <input 
                    type="text" 
                    placeholder="Digite o nome, CPF ou telefone do paciente..."
                    value={patientSearchInModal}
                    onChange={e => {
                      setPatientSearchInModal(e.target.value);
                      if (!aptForm.patientId) {
                        setAptForm(f => ({ ...f, patientName: e.target.value }));
                      }
                    }}
                    style={styles.patientSearchInput}
                  />
                </div>

                <select 
                  className="form-control" 
                  value={aptForm.patientId} 
                  onChange={e => {
                    const selectedId = e.target.value;
                    const pat = patients.find(p => p.id === selectedId);
                    setAptForm(f => ({
                      ...f,
                      patientId: selectedId,
                      patientName: pat ? pat.name : f.patientName,
                      patientPhone: pat ? (pat.phone || f.patientPhone) : f.patientPhone,
                      patientCpf: pat ? (pat.cpf || f.patientCpf) : f.patientCpf
                    }));
                    if (pat) setPatientSearchInModal(pat.name);
                  }}
                  style={styles.patientSelect}
                >
                  <option value="">-- Ou selecione na lista de pacientes ({modalFilteredPatients.length}) --</option>
                  {modalFilteredPatients.map(p => (
                    <option key={p.id} value={p.id}>{p.name} {p.cpf ? `(CPF: ${p.cpf})` : ''}</option>
                  ))}
                </select>
              </div>

              {/* Paciente Avulso / Telefone */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={styles.inputLabel}>Nome do Paciente *</label>
                  <input 
                    type="text" 
                    required 
                    className="form-control" 
                    placeholder="Nome completo do paciente"
                    value={aptForm.patientName} 
                    onChange={e => setAptForm({ ...aptForm, patientName: e.target.value })} 
                    style={styles.textInput}
                  />
                </div>
                <div>
                  <label style={styles.inputLabel}>Telefone / WhatsApp</label>
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

              {/* Médico e Procedimento */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={styles.inputLabel}>Profissional de Saúde *</label>
                  <select 
                    className="form-control" 
                    required 
                    value={aptForm.doctorId} 
                    onChange={e => setAptForm({ ...aptForm, doctorId: e.target.value })}
                    style={styles.textInput}
                  >
                    <option value="">-- Selecione o Médico --</option>
                    {doctors.map(d => (
                      <option key={d.uid} value={d.uid}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={styles.inputLabel}>Tipo de Atendimento / Procedimento</label>
                  <select 
                    className="form-control" 
                    value={aptForm.type} 
                    onChange={e => setAptForm({ ...aptForm, type: e.target.value })}
                    style={styles.textInput}
                  >
                    <option value="Consulta Nefrologia">Consulta Nefrologia</option>
                    <option value="Avaliação Nutricional">Avaliação Nutricional</option>
                    <option value="Acompanhamento Psicológico">Acompanhamento Psicológico</option>
                    <option value="Sessão de Diálise">Sessão de Diálise</option>
                    <option value="Exame Ultrassom">Exame Ultrassom / Doppler</option>
                    <option value="Curativo Acesso Vascular">Curativo Acesso Vascular</option>
                  </select>
                </div>
              </div>

              {/* Data, Horário e Sala */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1.2fr', gap: '0.75rem' }}>
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
                  <label style={styles.inputLabel}>Horário *</label>
                  <select 
                    className="form-control" 
                    required 
                    value={aptForm.time} 
                    onChange={e => setAptForm({ ...aptForm, time: e.target.value })}
                    style={styles.textInput}
                  >
                    {timeSlots.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={styles.inputLabel}>Consultório / Sala</label>
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

              {/* Status e Observações */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '0.75rem' }}>
                <div>
                  <label style={styles.inputLabel}>Status Atual</label>
                  <select 
                    className="form-control" 
                    value={aptForm.status} 
                    onChange={e => setAptForm({ ...aptForm, status: e.target.value })}
                    style={styles.textInput}
                  >
                    <option value="Agendado">Agendado</option>
                    <option value="Confirmado">Confirmado</option>
                    <option value="Aguardando">Aguardando (Na Recepção)</option>
                    <option value="Em Consulta">Em Consulta</option>
                    <option value="Finalizado">Finalizado</option>
                    <option value="Cancelado">Cancelado</option>
                  </select>
                </div>
                <div>
                  <label style={styles.inputLabel}>Recomendações / Notas</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Ex: Jejum 8h, trazer exames anteriores..." 
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
                  {actionLoading ? 'Salvando na Nuvem...' : editingApt ? 'Salvar Alterações' : 'Confirmar Agendamento'}
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
  refreshBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    padding: '0.55rem 0.9rem',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    backgroundColor: '#ffffff',
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#475569',
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
    fontSize: '0.85rem',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 2px 6px rgba(8, 145, 178, 0.3)'
  },
  alert: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    border: '1px solid',
    marginBottom: '1rem',
    fontSize: '0.85rem',
    fontWeight: '600'
  },
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '0.85rem',
    marginBottom: '1.25rem'
  },
  kpiCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    padding: '1rem 1.15rem',
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
    color: '#64748b',
    textTransform: 'uppercase'
  },
  kpiValue: {
    fontSize: '1.65rem',
    fontWeight: '800',
    color: '#0f172a',
    margin: '0.1rem 0'
  },
  kpiSub: {
    fontSize: '0.72rem',
    color: '#94a3b8'
  },
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: '0.75rem 1rem',
    borderRadius: '10px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
    flexWrap: 'wrap',
    gap: '0.75rem',
    marginBottom: '0.75rem'
  },
  viewModeGroup: {
    display: 'flex',
    gap: '0.25rem',
    backgroundColor: '#f1f5f9',
    padding: '3px',
    borderRadius: '8px'
  },
  viewBtn: {
    background: 'none',
    border: 'none',
    padding: '0.35rem 0.85rem',
    fontSize: '0.8rem',
    fontWeight: '600',
    color: '#64748b',
    cursor: 'pointer',
    borderRadius: '6px',
    transition: 'all 0.15s'
  },
  viewBtnActive: {
    backgroundColor: '#ffffff',
    color: '#0891b2',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
  },
  dateNavigator: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  navArrowBtn: {
    border: '1px solid #cbd5e1',
    background: '#ffffff',
    borderRadius: '50%',
    width: '28px',
    height: '28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: '#475569'
  },
  todayBtn: {
    padding: '0.25rem 0.65rem',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    backgroundColor: '#ffffff',
    fontSize: '0.75rem',
    fontWeight: '700',
    color: '#0891b2',
    cursor: 'pointer'
  },
  currentDateLabel: {
    fontSize: '0.95rem',
    color: '#0f172a',
    minWidth: '220px',
    textAlign: 'center'
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    padding: '0.4rem 0.75rem',
    backgroundColor: '#f8fafc',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    flex: '1',
    maxWidth: '360px',
    minWidth: '220px'
  },
  searchInput: {
    border: 'none',
    outline: 'none',
    backgroundColor: 'transparent',
    fontSize: '0.8rem',
    width: '100%',
    color: '#0f172a'
  },
  clearSearchBtn: {
    background: 'none',
    border: 'none',
    color: '#94a3b8',
    cursor: 'pointer',
    padding: 0
  },
  filterBar: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: '0.65rem 1rem',
    borderRadius: '10px',
    border: '1px solid #e2e8f0',
    marginBottom: '1.25rem',
    flexWrap: 'wrap'
  },
  filterGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem'
  },
  filterLabel: {
    fontSize: '0.75rem',
    fontWeight: '700',
    color: '#64748b'
  },
  selectFilter: {
    padding: '0.35rem 0.6rem',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    fontSize: '0.8rem',
    color: '#0f172a',
    backgroundColor: '#ffffff',
    cursor: 'pointer'
  },
  resetFiltersBtn: {
    padding: '0.35rem 0.7rem',
    borderRadius: '6px',
    border: '1px solid #fecaca',
    backgroundColor: '#fef2f2',
    color: '#dc2626',
    fontSize: '0.75rem',
    fontWeight: '600',
    cursor: 'pointer'
  },
  gridContainer: {
    backgroundColor: '#ffffff',
    borderRadius: '10px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
    overflowX: 'auto'
  },
  calendarTable: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.85rem'
  },
  emptySlotBtn: {
    border: '1px dashed #cbd5e1',
    background: '#fafbfc',
    color: '#94a3b8',
    width: '100%',
    padding: '0.45rem',
    borderRadius: '6px',
    textAlign: 'left',
    cursor: 'pointer',
    fontSize: '0.75rem',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '0.3rem',
    transition: 'all 0.15s ease'
  },
  waActionBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.2rem 0.45rem',
    backgroundColor: '#f0fdf4',
    color: '#16a34a',
    border: '1px solid #bbf7d0',
    borderRadius: '4px',
    fontSize: '0.7rem',
    fontWeight: '700',
    cursor: 'pointer'
  },
  statusBtn: {
    border: 'none',
    color: '#ffffff',
    padding: '0.25rem 0.55rem',
    borderRadius: '4px',
    fontSize: '0.7rem',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.2rem'
  },
  iconBtn: {
    padding: '0.25rem 0.4rem',
    border: '1px solid #e2e8f0',
    backgroundColor: '#f8fafc',
    borderRadius: '4px',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  roomsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: '1rem'
  },
  roomCard: {
    backgroundColor: '#ffffff',
    borderRadius: '10px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
    overflow: 'hidden'
  },
  roomCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.75rem 1rem',
    backgroundColor: '#f8fafc',
    borderBottom: '1px solid #e2e8f0'
  },
  roomCountBadge: {
    padding: '0.15rem 0.45rem',
    borderRadius: '9999px',
    backgroundColor: '#e0f2fe',
    color: '#0369a1',
    fontSize: '0.7rem',
    fontWeight: '800'
  },
  roomCardBody: {
    padding: '0.75rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    minHeight: '220px'
  },
  emptyRoomState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1.5rem 0.5rem',
    color: '#94a3b8',
    fontSize: '0.75rem',
    textAlign: 'center',
    gap: '0.5rem'
  },
  addSmallBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.2rem',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    border: '1px solid #cbd5e1',
    backgroundColor: '#ffffff',
    color: '#0891b2',
    fontSize: '0.7rem',
    fontWeight: '700',
    cursor: 'pointer'
  },
  roomAptItem: {
    padding: '0.6rem',
    borderRadius: '8px',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.2rem'
  },
  weekGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '0.5rem',
    overflowX: 'auto'
  },
  weekColumn: {
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
    overflow: 'hidden'
  },
  weekHeader: {
    padding: '0.75rem',
    textAlign: 'center',
    borderBottom: '2px solid transparent'
  },
  weekAptCard: {
    padding: '0.5rem',
    borderRadius: '6px',
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderLeft: '3px solid #0891b2',
    cursor: 'pointer',
    boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
    transition: 'transform 0.1s'
  },
  monthCalendarGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '4px',
    backgroundColor: '#e2e8f0',
    padding: '4px',
    borderRadius: '10px'
  },
  monthDayName: {
    backgroundColor: '#f8fafc',
    padding: '0.5rem',
    textAlign: 'center',
    fontWeight: '700',
    fontSize: '0.8rem',
    color: '#475569'
  },
  monthCell: {
    minHeight: '85px',
    padding: '0.5rem',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    cursor: 'pointer',
    borderRadius: '4px',
    border: '1px solid transparent'
  },
  monthCellEmpty: {
    backgroundColor: '#f1f5f9'
  },
  monthAptBadge: {
    backgroundColor: '#e0f2fe',
    color: '#0369a1',
    fontSize: '0.65rem',
    fontWeight: '800',
    padding: '0.15rem 0.35rem',
    borderRadius: '4px',
    textAlign: 'center'
  },
  loadingContainer: {
    padding: '3rem',
    textAlign: 'center',
    backgroundColor: '#ffffff',
    borderRadius: '10px',
    border: '1px solid #e2e8f0'
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1050,
    padding: '1rem'
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    width: '100%',
    maxWidth: '650px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    overflow: 'hidden'
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 1.25rem',
    borderBottom: '1px solid #e2e8f0',
    backgroundColor: '#f8fafc'
  },
  modalTitle: {
    fontSize: '1.1rem',
    fontWeight: '700',
    color: '#0f172a',
    margin: 0
  },
  closeModalBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#64748b'
  },
  modalForm: {
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.85rem',
    maxHeight: '80vh',
    overflowY: 'auto'
  },
  formSection: {
    backgroundColor: '#f8fafc',
    padding: '0.75rem',
    borderRadius: '8px',
    border: '1px solid #e2e8f0'
  },
  patientSearchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    padding: '0.4rem 0.6rem',
    backgroundColor: '#ffffff',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    marginBottom: '0.5rem'
  },
  patientSearchInput: {
    border: 'none',
    outline: 'none',
    width: '100%',
    fontSize: '0.8rem',
    color: '#0f172a'
  },
  patientSelect: {
    width: '100%',
    padding: '0.45rem',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    fontSize: '0.8rem',
    backgroundColor: '#ffffff'
  },
  inputLabel: {
    display: 'block',
    fontSize: '0.75rem',
    fontWeight: '700',
    color: '#334155',
    marginBottom: '0.25rem'
  },
  textInput: {
    width: '100%',
    padding: '0.45rem 0.65rem',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    fontSize: '0.82rem',
    backgroundColor: '#ffffff',
    color: '#0f172a'
  },
  modalFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.5rem',
    marginTop: '0.5rem',
    paddingTop: '0.75rem',
    borderTop: '1px solid #e2e8f0'
  },
  cancelBtn: {
    padding: '0.5rem 1rem',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    backgroundColor: '#ffffff',
    color: '#475569',
    fontWeight: '600',
    fontSize: '0.85rem',
    cursor: 'pointer'
  },
  confirmSaveBtn: {
    padding: '0.5rem 1.25rem',
    borderRadius: '6px',
    backgroundColor: '#0891b2',
    color: '#ffffff',
    border: 'none',
    fontWeight: '700',
    fontSize: '0.85rem',
    cursor: 'pointer',
    boxShadow: '0 2px 5px rgba(8, 145, 178, 0.25)'
  }
};
