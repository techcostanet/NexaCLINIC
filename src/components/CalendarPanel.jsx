import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, Clock, User, HeartPulse, Building2, Plus, 
  ChevronLeft, ChevronRight, CheckCircle2, AlertTriangle, MessageSquare, Check, X
} from 'lucide-react';
import { dbService } from '../firebase';

export default function CalendarPanel() {
  const [viewMode, setViewMode] = useState('day'); // 'day' | 'week' | 'month'
  const [currentDate, setCurrentDate] = useState(new Date(2026, 6, 17)); // Match current mock date
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Filter states
  const [selectedDoctorId, setSelectedDoctorId] = useState('all');
  const [selectedRoom, setSelectedRoom] = useState('all');

  // Form State
  const [showAddModal, setShowAddModal] = useState(false);
  const [aptForm, setAptForm] = useState({
    patientId: '',
    patientName: '',
    doctorId: '',
    date: '2026-07-17',
    time: '09:00',
    type: 'Consulta Médica', // 'Consulta Médica' | 'Exame de Imagem' | 'Sessão de Diálise'
    room: 'Consultório 1',
    notes: ''
  });

  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'
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

      setAppointments(aptList);
      setPatients(patList);

      // Filter users who are doctors/professionals
      const docList = userList.filter(u => u.role === 'admin' || u.role === 'professional');
      setDoctors(docList);

      // Seed fallback appointments if empty
      if (aptList.length === 0) {
        const fallbacks = [
          {
            id: 'apt-1',
            patientId: patList[0]?.id || 'pat-1',
            patientName: patList[0]?.name || 'ADAIR PRAXEDES MORENO',
            doctorId: docList[0]?.uid || 'doc-1',
            doctorName: docList[0]?.name || 'Dr. Carlos (Nefrologista)',
            date: '2026-07-17',
            time: '08:30',
            type: 'Consulta Médica',
            room: 'Consultório 1',
            status: 'Confirmado',
            whatsappStatus: 'Enviado',
            notes: 'Acompanhamento trimestral'
          },
          {
            id: 'apt-2',
            patientId: patList[1]?.id || 'pat-2',
            patientName: patList[1]?.name || 'ADAO LUCIANO DIAS',
            doctorId: docList[0]?.uid || 'doc-1',
            doctorName: docList[0]?.name || 'Dr. Carlos (Nefrologista)',
            date: '2026-07-17',
            time: '10:00',
            type: 'Sessão de Diálise',
            room: 'Salão 1',
            status: 'Aguardando',
            whatsappStatus: 'Confirmado',
            notes: 'Ajuste de peso seco'
          }
        ];
        // Store in DB
        for (const item of fallbacks) {
          await dbService.createAppointment(item);
        }
        setAppointments(fallbacks);
      }
    } catch (err) {
      console.error(err);
      showAlert('Erro ao buscar dados da agenda.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 5000);
  };

  const handleNavigateDate = (direction) => {
    const next = new Date(currentDate);
    if (viewMode === 'day') {
      next.setDate(next.getDate() + direction);
    } else if (viewMode === 'week') {
      next.setDate(next.getDate() + direction * 7);
    } else if (viewMode === 'month') {
      next.setMonth(next.getMonth() + direction);
    }
    setCurrentDate(next);
  };

  const handleSaveAppointment = async (e) => {
    e.preventDefault();
    if (!aptForm.patientId && !aptForm.patientName) {
      return showAlert('Selecione ou digite um paciente.', 'danger');
    }

    const docFound = doctors.find(d => d.uid === aptForm.doctorId);
    const docName = docFound ? docFound.name : 'Profissional Clínico';

    // 1. Conflict Check: Doctor & Time slot
    const hasConflict = appointments.some(apt => 
      apt.doctorId === aptForm.doctorId && 
      apt.date === aptForm.date && 
      apt.time === aptForm.time &&
      apt.status !== 'Cancelado'
    );

    if (hasConflict) {
      return showAlert(`O ${docName} já tem um agendamento marcado em ${new Date(aptForm.date).toLocaleDateString('pt-BR')} às ${aptForm.time}!`, 'danger');
    }

    let patName = aptForm.patientName;
    if (aptForm.patientId) {
      const p = patients.find(pat => pat.id === aptForm.patientId);
      if (p) patName = p.name;
    }

    const newApt = {
      patientId: aptForm.patientId || 'novo-paciente',
      patientName: patName,
      doctorId: aptForm.doctorId,
      doctorName: docName,
      date: aptForm.date,
      time: aptForm.time,
      type: aptForm.type,
      room: aptForm.room,
      status: 'Agendado',
      whatsappStatus: 'Enviado',
      notes: aptForm.notes
    };

    try {
      await dbService.createAppointment(newApt);
      showAlert('Consulta agendada com sucesso!', 'success');
      setShowAddModal(false);
      setAptForm({
        patientId: '',
        patientName: '',
        doctorId: '',
        date: '2026-07-17',
        time: '09:00',
        type: 'Consulta Médica',
        room: 'Consultório 1',
        notes: ''
      });
      fetchData();
    } catch (err) {
      console.error(err);
      showAlert('Erro ao agendar consulta.', 'danger');
    }
  };

  const handleUpdateStatus = async (aptId, newStatus) => {
    try {
      await dbService.updateAppointment(aptId, { status: newStatus });
      showAlert(`Status do agendamento atualizado para: ${newStatus}`, 'success');

      // Integration: If patient is marked as "Aguardando", we can trigger a simulated receptionist notice
      if (newStatus === 'Aguardando') {
        // Mocking entry into the reception clinical session queue
        showAlert('Paciente direcionado para a fila de Triagem na Recepção!', 'success');
      }

      fetchData();
    } catch (err) {
      console.error(err);
      showAlert('Erro ao atualizar status.', 'danger');
    }
  };

  const handleSimulateWhatsAppResponse = async (aptId, response) => {
    try {
      await dbService.updateAppointment(aptId, { 
        whatsappStatus: response,
        status: response === 'Confirmado' ? 'Confirmado' : 'Cancelado'
      });
      showAlert(`WhatsApp simulado: Paciente respondeu "${response === 'Confirmado' ? 'SIM' : 'NÃO'}"`, 'success');
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const getFilteredAppointments = () => {
    return appointments.filter(apt => {
      if (selectedDoctorId !== 'all' && apt.doctorId !== selectedDoctorId) return false;
      if (selectedRoom !== 'all' && apt.room !== selectedRoom) return false;
      return true;
    });
  };

  const renderDayView = () => {
    const formattedDate = currentDate.toISOString().substring(0, 10);
    const dayApts = getFilteredAppointments().filter(apt => apt.date === formattedDate);

    return (
      <div style={styles.gridContainer}>
        <table style={styles.calendarTable}>
          <thead>
            <tr>
              <th style={{ width: '100px' }}>Horário</th>
              <th>Paciente & Prontuário</th>
              <th>Médico / Sala</th>
              <th>WhatsApp Status</th>
              <th>Ações de Chegada</th>
            </tr>
          </thead>
          <tbody>
            {timeSlots.map(time => {
              const apt = dayApts.find(a => a.time === time);
              return (
                <tr key={time} style={{ height: '60px' }}>
                  <td style={{ fontWeight: '700', color: 'var(--text-secondary)' }}>{time}</td>
                  <td>
                    {apt ? (
                      <div>
                        <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{apt.patientName}</strong>
                        <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Procedimento: {apt.type} {apt.notes ? `| Nota: ${apt.notes}` : ''}
                        </span>
                      </div>
                    ) : (
                      <button 
                        onClick={() => {
                          setAptForm(f => ({ ...f, time, date: formattedDate }));
                          setShowAddModal(true);
                        }} 
                        style={styles.emptySlotBtn}
                      >
                        + Horário Livre
                      </button>
                    )}
                  </td>
                  <td>
                    {apt && (
                      <div>
                        <span style={{ fontWeight: '600' }}>{apt.doctorName}</span>
                        <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{apt.room}</span>
                      </div>
                    )}
                  </td>
                  <td>
                    {apt && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{
                          padding: '0.2rem 0.5rem',
                          borderRadius: '12px',
                          fontSize: '0.7rem',
                          fontWeight: '700',
                          backgroundColor: apt.whatsappStatus === 'Confirmado' ? '#d1fae5' : apt.whatsappStatus === 'Recusado' ? '#fee2e2' : '#fef3c7',
                          color: apt.whatsappStatus === 'Confirmado' ? '#065f46' : apt.whatsappStatus === 'Recusado' ? '#991b1b' : '#b45309'
                        }}>
                          💬 {apt.whatsappStatus}
                        </span>
                        {apt.whatsappStatus === 'Enviado' && (
                          <div style={{ display: 'flex', gap: '0.25rem' }}>
                            <button onClick={() => handleSimulateWhatsAppResponse(apt.id, 'Confirmado')} style={styles.simBtn} title="Simular Confirmação (SIM)">👍</button>
                            <button onClick={() => handleSimulateWhatsAppResponse(apt.id, 'Recusado')} style={{ ...styles.simBtn, backgroundColor: 'rgba(239,68,68,0.1)' }} title="Simular Recusa (NÃO)">👎</button>
                          </div>
                        )}
                      </div>
                    )}
                  </td>
                  <td>
                    {apt && apt.status !== 'Finalizado' && apt.status !== 'Cancelado' && (
                      <div style={{ display: 'flex', gap: '0.25rem' }}>
                        {apt.status === 'Confirmado' && (
                          <button onClick={() => handleUpdateStatus(apt.id, 'Aguardando')} style={styles.checkInBtn}>
                            Chegou à Clínica
                          </button>
                        )}
                        {apt.status === 'Aguardando' && (
                          <button onClick={() => handleUpdateStatus(apt.id, 'Em Consulta')} style={{ ...styles.checkInBtn, backgroundColor: '#8b5cf6' }}>
                            Iniciar Consulta
                          </button>
                        )}
                        {apt.status === 'Em Consulta' && (
                          <button onClick={() => handleUpdateStatus(apt.id, 'Finalizado')} style={{ ...styles.checkInBtn, backgroundColor: 'var(--success-color)' }}>
                            Finalizar
                          </button>
                        )}
                        <button onClick={() => handleUpdateStatus(apt.id, 'Cancelado')} style={{ ...styles.checkInBtn, backgroundColor: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>
                          Cancelar
                        </button>
                      </div>
                    )}
                    {apt && (apt.status === 'Finalizado' || apt.status === 'Cancelado') && (
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>
                        {apt.status === 'Finalizado' ? '🏁 Concluído' : '❌ Cancelado'}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  const renderWeekView = () => {
    // Generate dates for Sunday to Saturday of the current week
    const startOfWeek = new Date(currentDate);
    const dayOfWeek = startOfWeek.getDay();
    startOfWeek.setDate(startOfWeek.getDate() - dayOfWeek);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(d.getDate() + i);
      days.push(d);
    }

    const filtered = getFilteredAppointments();

    return (
      <div style={styles.weekGrid}>
        {days.map(day => {
          const formatted = day.toISOString().substring(0, 10);
          const dayApts = filtered.filter(a => a.date === formatted).sort((a,b) => a.time.localeCompare(b.time));
          const isToday = new Date().toDateString() === day.toDateString();

          return (
            <div key={formatted} style={{ ...styles.weekColumn, backgroundColor: isToday ? 'rgba(8, 145, 178, 0.02)' : '#fff' }}>
              <div style={{ ...styles.weekHeader, borderBottomColor: isToday ? 'var(--primary-color)' : 'var(--border-color)' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                  {day.toLocaleDateString('pt-BR', { weekday: 'short' })}
                </span>
                <strong style={{ fontSize: '1.25rem', display: 'block', color: 'var(--text-color)' }}>{day.getDate()}</strong>
              </div>
              <div style={{ padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', minHeight: '300px' }}>
                {dayApts.length === 0 ? (
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontStyle: 'italic', textAlign: 'center', marginTop: '1rem' }}>Sem compromissos</span>
                ) : (
                  dayApts.map(apt => (
                    <div key={apt.id} style={styles.weekAptCard}>
                      <span style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--primary-color)' }}>{apt.time}</span>
                      <div style={{ fontSize: '0.75rem', fontWeight: '700', margin: '0.1rem 0' }}>{apt.patientName}</div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>{apt.doctorName}</div>
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

  const renderMonthView = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    const cells = [];
    // Pad previous month days
    for (let i = 0; i < firstDayIndex; i++) {
      cells.push(null);
    }
    // Fill current month days
    for (let i = 1; i <= totalDays; i++) {
      cells.push(new Date(year, month, i));
    }

    return (
      <div style={styles.monthCalendarGrid}>
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(w => (
          <div key={w} style={styles.monthDayName}>{w}</div>
        ))}
        {cells.map((cell, idx) => {
          if (!cell) return <div key={`empty-${idx}`} style={styles.monthCellEmpty}></div>;

          const formatted = cell.toISOString().substring(0, 10);
          const dayApts = getFilteredAppointments().filter(a => a.date === formatted);

          return (
            <div 
              key={formatted} 
              onClick={() => {
                setCurrentDate(cell);
                setViewMode('day');
              }}
              style={styles.monthCell}
            >
              <span style={{ fontSize: '0.8rem', fontWeight: '700' }}>{cell.getDate()}</span>
              {dayApts.length > 0 && (
                <div style={styles.monthAptBadge}>
                  {dayApts.length} consultas
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
      <div style={styles.cardHeader}>
        <div>
          <h1 style={styles.title}>NexaCAL - Gerenciamento de Agenda Clinica</h1>
          <p style={styles.subtitle}>Controle de consultas ambulatoriais, exames de imagem e visualização semanal e mensal da grade de plantões.</p>
        </div>
      </div>

      {/* Date Stepper bar */}
      <div style={styles.toolbar}>
        <div style={{ display: 'flex', gap: '0.25rem', backgroundColor: 'var(--bg-body)', padding: '2px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
          <button onClick={() => setViewMode('day')} style={{ ...styles.viewToggleBtn, ...(viewMode === 'day' ? styles.viewToggleBtnActive : {}) }}>Diário</button>
          <button onClick={() => setViewMode('week')} style={{ ...styles.viewToggleBtn, ...(viewMode === 'week' ? styles.viewToggleBtnActive : {}) }}>Semanal</button>
          <button onClick={() => setViewMode('month')} style={{ ...styles.viewToggleBtn, ...(viewMode === 'month' ? styles.viewToggleBtnActive : {}) }}>Mensal</button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button onClick={() => handleNavigateDate(-1)} style={styles.navBtn}><ChevronLeft size={16} /></button>
          <strong style={{ fontSize: '1rem', color: 'var(--text-color)' }}>
            {viewMode === 'day' && currentDate.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}
            {viewMode === 'week' && `Semana de ${currentDate.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })}`}
            {viewMode === 'month' && currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
          </strong>
          <button onClick={() => handleNavigateDate(1)} style={styles.navBtn}><ChevronRight size={16} /></button>
        </div>

        <button onClick={() => setShowAddModal(true)} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', backgroundColor: 'var(--primary-color)' }}>
          <Plus size={16} /> Novo Agendamento
        </button>
      </div>

      {/* Filter panel */}
      <div style={styles.filterBar}>
        <div className="form-group" style={{ margin: 0 }}>
          <label style={{ fontSize: '0.75rem', fontWeight: '700', marginBottom: '0.25rem', display: 'block' }}>Filtrar Médico</label>
          <select className="form-control" style={{ width: '200px', fontSize: '0.8rem', padding: '0.3rem' }} value={selectedDoctorId} onChange={e => setSelectedDoctorId(e.target.value)}>
            <option value="all">Todos os Profissionais</option>
            {doctors.map(d => (
              <option key={d.uid} value={d.uid}>{d.name}</option>
            ))}
          </select>
        </div>

        <div className="form-group" style={{ margin: 0 }}>
          <label style={{ fontSize: '0.75rem', fontWeight: '700', marginBottom: '0.25rem', display: 'block' }}>Filtrar Sala</label>
          <select className="form-control" style={{ width: '200px', fontSize: '0.8rem', padding: '0.3rem' }} value={selectedRoom} onChange={e => setSelectedRoom(e.target.value)}>
            <option value="all">Todas as Salas</option>
            <option value="Consultório 1">Consultório 1</option>
            <option value="Consultório 2">Consultório 2</option>
            <option value="Salão 1">Salão 1 (Diálise)</option>
            <option value="Sala Ultrassom">Sala Ultrassom</option>
          </select>
        </div>
      </div>

      {/* Views Output */}
      {viewMode === 'day' && renderDayView()}
      {viewMode === 'week' && renderWeekView()}
      {viewMode === 'month' && renderMonthView()}

      {/* Appointment Creation Modal */}
      {showAddModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <div style={styles.modalHeader}>
              <h2>Agendar Consulta ou Procedimento</h2>
              <button onClick={() => setShowAddModal(false)} style={styles.closeBtn}><X size={18} /></button>
            </div>
            <form onSubmit={handleSaveAppointment} style={styles.form}>
              <div className="form-group">
                <label>Vincular a Paciente Existente</label>
                <select className="form-control" value={aptForm.patientId} onChange={e => setAptForm({ ...aptForm, patientId: e.target.value })}>
                  <option value="">-- Selecione o Paciente --</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.cpf})</option>
                  ))}
                </select>
              </div>

              {!aptForm.patientId && (
                <div className="form-group">
                  <label>Nome do Novo Paciente (Manual) *</label>
                  <input type="text" className="form-control" placeholder="Digite o nome do paciente..." value={aptForm.patientName} onChange={e => setAptForm({ ...aptForm, patientName: e.target.value })} />
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Médico Responsável *</label>
                  <select className="form-control" required value={aptForm.doctorId} onChange={e => setAptForm({ ...aptForm, doctorId: e.target.value })}>
                    <option value="">-- Selecione o Médico --</option>
                    {doctors.map(d => (
                      <option key={d.uid} value={d.uid}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Procedimento / Tipo *</label>
                  <select className="form-control" value={aptForm.type} onChange={e => setAptForm({ ...aptForm, type: e.target.value })}>
                    <option value="Consulta Médica">Consulta Nefrologia</option>
                    <option value="Exame de Imagem">Ultrassom de Vias Urinárias</option>
                    <option value="Sessão de Diálise">Sessão de Diálise</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Data *</label>
                  <input type="date" className="form-control" required value={aptForm.date} onChange={e => setAptForm({ ...aptForm, date: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Horário *</label>
                  <select className="form-control" required value={aptForm.time} onChange={e => setAptForm({ ...aptForm, time: e.target.value })}>
                    {timeSlots.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Local / Sala</label>
                  <select className="form-control" value={aptForm.room} onChange={e => setAptForm({ ...aptForm, room: e.target.value })}>
                    <option value="Consultório 1">Consultório 1</option>
                    <option value="Consultório 2">Consultório 2</option>
                    <option value="Salão 1">Salão 1</option>
                    <option value="Sala Ultrassom">Sala Ultrassom</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Notas / Recomendações</label>
                <input type="text" className="form-control" placeholder="Jejum 8 horas, trazer exames..." value={aptForm.notes} onChange={e => setAptForm({ ...aptForm, notes: e.target.value })} />
              </div>

              <div style={styles.modalFooter}>
                <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-secondary">Cancelar</button>
                <button type="submit" className="btn btn-primary" style={{ backgroundColor: 'var(--primary-color)' }}>Confirmar Agendamento</button>
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
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: '800',
    color: 'var(--text-color)',
    margin: 0,
  },
  subtitle: {
    fontSize: '0.875rem',
    color: 'var(--text-muted)',
    margin: '0.25rem 0 0 0',
  },
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    border: '1px solid var(--border-color)',
    boxShadow: 'var(--shadow-sm)',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  viewToggleBtn: {
    background: 'none',
    border: 'none',
    padding: '0.4rem 1rem',
    fontSize: '0.8rem',
    fontWeight: '600',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    borderRadius: '4px',
    transition: 'all 0.15s ease',
  },
  viewToggleBtnActive: {
    backgroundColor: '#fff',
    color: 'var(--primary-color)',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  navBtn: {
    border: '1px solid var(--border-color)',
    background: '#fff',
    borderRadius: '50%',
    width: '28px',
    height: '28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: 'var(--text-secondary)',
  },
  filterBar: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'center',
  },
  gridContainer: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    border: '1px solid var(--border-color)',
    boxShadow: 'var(--shadow-sm)',
    overflowX: 'auto',
  },
  calendarTable: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
    fontSize: '0.85rem',
    tableLayout: 'fixed',
  },
  emptySlotBtn: {
    border: '1px dashed var(--border-color)',
    background: 'none',
    color: 'var(--text-muted)',
    width: '100%',
    padding: '0.5rem',
    borderRadius: '4px',
    textAlign: 'left',
    cursor: 'pointer',
    fontSize: '0.75rem',
    fontWeight: '500',
    transition: 'all 0.15s ease',
  },
  checkInBtn: {
    backgroundColor: 'var(--primary-color)',
    border: 'none',
    color: '#fff',
    padding: '0.3rem 0.6rem',
    fontSize: '0.7rem',
    borderRadius: '4px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  simBtn: {
    backgroundColor: 'rgba(16,185,129,0.1)',
    border: 'none',
    borderRadius: '4px',
    padding: '0.2rem 0.4rem',
    cursor: 'pointer',
    fontSize: '0.8rem',
  },
  weekGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '0.5rem',
  },
  weekColumn: {
    borderRadius: '8px',
    border: '1px solid var(--border-color)',
    boxShadow: 'var(--shadow-sm)',
    overflow: 'hidden',
  },
  weekHeader: {
    padding: '0.75rem',
    textAlign: 'center',
    backgroundColor: '#f8fafc',
    borderBottom: '2px solid transparent',
  },
  weekAptCard: {
    padding: '0.5rem',
    borderRadius: '6px',
    backgroundColor: 'rgba(8, 145, 178, 0.04)',
    borderLeft: '3px solid var(--primary-color)',
    fontSize: '0.75rem',
  },
  monthCalendarGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '4px',
    backgroundColor: 'var(--border-color)',
    padding: '4px',
    borderRadius: '8px',
  },
  monthDayName: {
    backgroundColor: '#f8fafc',
    padding: '0.5rem',
    textAlign: 'center',
    fontWeight: '700',
    fontSize: '0.8rem',
    color: 'var(--text-secondary)',
  },
  monthCell: {
    backgroundColor: '#fff',
    minHeight: '80px',
    padding: '0.5rem',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  monthCellEmpty: {
    backgroundColor: '#f1f5f9',
  },
  monthAptBadge: {
    backgroundColor: 'rgba(8, 145, 178, 0.1)',
    color: 'var(--primary-color)',
    fontSize: '0.65rem',
    fontWeight: '700',
    padding: '0.1rem 0.3rem',
    borderRadius: '4px',
    textAlign: 'center',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1050,
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    width: '100%',
    maxWidth: '550px',
    boxShadow: 'var(--shadow-lg)',
    overflow: 'hidden',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 1.5rem',
    borderBottom: '1px solid var(--border-color)',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--text-muted)',
  },
  form: {
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  modalFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.5rem',
    marginTop: '0.5rem',
  }
};
