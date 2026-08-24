import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, Save, CheckCircle2, AlertTriangle, Clock, Calendar, 
  User, ShieldCheck, Zap, Building2, ChevronRight, Award, Plus, Trash2,
  ChevronLeft, Copy, BarChart3, Check
} from 'lucide-react';
import { dbService } from '../../firebase';

export default function DoctorScheduleModal({ 
  isOpen, 
  onClose, 
  doctors = [], 
  selectedDoctorId = null,
  appointments = [], 
  onSaved 
}) {
  const currentYearNum = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYearNum);
  const [selectedMonthScope, setSelectedMonthScope] = useState('all'); // 'all' (Ano Inteiro) | '01'..'12'
  const [activeDoctorId, setActiveDoctorId] = useState(selectedDoctorId || doctors[0]?.uid || '');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState({ text: '', type: '' });

  // Default day configuration
  const defaultDayConfig = {
    '1': { active: true, morningStart: '08:00', morningEnd: '12:00', afternoonStart: '13:30', afternoonEnd: '18:00' },
    '2': { active: true, morningStart: '08:00', morningEnd: '12:00', afternoonStart: '13:30', afternoonEnd: '18:00' },
    '3': { active: true, morningStart: '08:00', morningEnd: '12:00', afternoonStart: '13:30', afternoonEnd: '18:00' },
    '4': { active: true, morningStart: '08:00', morningEnd: '12:00', afternoonStart: '13:30', afternoonEnd: '18:00' },
    '5': { active: true, morningStart: '08:00', morningEnd: '12:00', afternoonStart: '13:30', afternoonEnd: '17:00' },
    '6': { active: false, morningStart: '08:00', morningEnd: '12:00', afternoonStart: '', afternoonEnd: '' },
    '0': { active: false, morningStart: '', morningEnd: '', afternoonStart: '', afternoonEnd: '' }
  };

  // Schedule Config State for active doctor
  const [config, setConfig] = useState({
    monthlyFirstConsultLimit: 30,
    monthlyReturnLimit: 50,
    monthlyProcedureLimit: 15,
    slotDuration: 30,
    maxEncaixesPerDay: 2,
    defaultRoom: 'Consultório 1',
    availableDays: [1, 2, 3, 4, 5],
    dayConfig: defaultDayConfig,
    yearlyConfigs: {} // { [year]: { months: { '01': { ... } }, annualDefault: { ... } } }
  });

  const weekDays = [
    { day: 1, label: 'Segunda' },
    { day: 2, label: 'Terça' },
    { day: 3, label: 'Quarta' },
    { day: 4, label: 'Quinta' },
    { day: 5, label: 'Sexta' },
    { day: 6, label: 'Sábado' },
    { day: 0, label: 'Domingo' }
  ];

  const monthsList = [
    { id: '01', name: 'Jan', fullName: 'Janeiro' },
    { id: '02', name: 'Fev', fullName: 'Fevereiro' },
    { id: '03', name: 'Mar', fullName: 'Março' },
    { id: '04', name: 'Abr', fullName: 'Abril' },
    { id: '05', name: 'Mai', fullName: 'Maio' },
    { id: '06', name: 'Jun', fullName: 'Junho' },
    { id: '07', name: 'Jul', fullName: 'Julho' },
    { id: '08', name: 'Ago', fullName: 'Agosto' },
    { id: '09', name: 'Set', fullName: 'Setembro' },
    { id: '10', name: 'Out', fullName: 'Outubro' },
    { id: '11', name: 'Nov', fullName: 'Novembro' },
    { id: '12', name: 'Dez', fullName: 'Dezembro' }
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
    if (selectedDoctorId) {
      setActiveDoctorId(selectedDoctorId);
    } else if (doctors.length > 0 && !activeDoctorId) {
      setActiveDoctorId(doctors[0].uid);
    }
  }, [selectedDoctorId, doctors]);

  useEffect(() => {
    if (activeDoctorId && isOpen) {
      loadDoctorConfig(activeDoctorId);
    }
  }, [activeDoctorId, isOpen]);

  const loadDoctorConfig = async (docId) => {
    setLoading(true);
    try {
      const schedules = await dbService.getDoctorSchedules();
      const docSched = (schedules || []).find(s => s.doctorId === docId);
      if (docSched) {
        setConfig({
          monthlyFirstConsultLimit: docSched.monthlyFirstConsultLimit ?? 30,
          monthlyReturnLimit: docSched.monthlyReturnLimit ?? 50,
          monthlyProcedureLimit: docSched.monthlyProcedureLimit ?? 15,
          slotDuration: docSched.slotDuration ?? 30,
          maxEncaixesPerDay: docSched.maxEncaixesPerDay ?? 2,
          defaultRoom: docSched.defaultRoom || 'Consultório 1',
          availableDays: docSched.availableDays || [1, 2, 3, 4, 5],
          dayConfig: docSched.dayConfig || defaultDayConfig,
          yearlyConfigs: docSched.yearlyConfigs || {}
        });
      } else {
        setConfig({
          monthlyFirstConsultLimit: 30,
          monthlyReturnLimit: 50,
          monthlyProcedureLimit: 15,
          slotDuration: 30,
          maxEncaixesPerDay: 2,
          defaultRoom: 'Consultório 1',
          availableDays: [1, 2, 3, 4, 5],
          dayConfig: defaultDayConfig,
          yearlyConfigs: {}
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Get current active limits based on year & month scope
  const currentLimits = useMemo(() => {
    if (selectedMonthScope !== 'all') {
      const yearCfg = config.yearlyConfigs?.[selectedYear];
      const monthCfg = yearCfg?.months?.[selectedMonthScope];
      if (monthCfg) {
        return {
          monthlyFirstConsultLimit: monthCfg.monthlyFirstConsultLimit ?? config.monthlyFirstConsultLimit,
          monthlyReturnLimit: monthCfg.monthlyReturnLimit ?? config.monthlyReturnLimit,
          monthlyProcedureLimit: monthCfg.monthlyProcedureLimit ?? config.monthlyProcedureLimit
        };
      }
    }
    return {
      monthlyFirstConsultLimit: config.monthlyFirstConsultLimit,
      monthlyReturnLimit: config.monthlyReturnLimit,
      monthlyProcedureLimit: config.monthlyProcedureLimit
    };
  }, [config, selectedYear, selectedMonthScope]);

  const handleUpdateLimit = (field, value) => {
    const num = parseInt(value, 10) || 0;
    if (selectedMonthScope === 'all') {
      // Update global & base
      setConfig(prev => ({
        ...prev,
        [field]: num
      }));
    } else {
      // Update specific month in yearlyConfigs
      setConfig(prev => {
        const existingYear = prev.yearlyConfigs?.[selectedYear] || { months: {} };
        const existingMonth = existingYear.months?.[selectedMonthScope] || {
          monthlyFirstConsultLimit: prev.monthlyFirstConsultLimit,
          monthlyReturnLimit: prev.monthlyReturnLimit,
          monthlyProcedureLimit: prev.monthlyProcedureLimit
        };
        return {
          ...prev,
          yearlyConfigs: {
            ...prev.yearlyConfigs,
            [selectedYear]: {
              ...existingYear,
              months: {
                ...existingYear.months,
                [selectedMonthScope]: {
                  ...existingMonth,
                  [field]: num
                }
              }
            }
          }
        };
      });
    }
  };

  // Replicate current limits and configuration to ALL 12 months of the year
  const handleReplicateToAllMonths = () => {
    const currentFirst = currentLimits.monthlyFirstConsultLimit;
    const currentReturn = currentLimits.monthlyReturnLimit;
    const currentProc = currentLimits.monthlyProcedureLimit;

    const newMonths = {};
    monthsList.forEach(m => {
      newMonths[m.id] = {
        monthlyFirstConsultLimit: currentFirst,
        monthlyReturnLimit: currentReturn,
        monthlyProcedureLimit: currentProc
      };
    });

    setConfig(prev => ({
      ...prev,
      monthlyFirstConsultLimit: currentFirst,
      monthlyReturnLimit: currentReturn,
      monthlyProcedureLimit: currentProc,
      yearlyConfigs: {
        ...prev.yearlyConfigs,
        [selectedYear]: {
          ...(prev.yearlyConfigs?.[selectedYear] || {}),
          annualDefault: {
            monthlyFirstConsultLimit: currentFirst,
            monthlyReturnLimit: currentReturn,
            monthlyProcedureLimit: currentProc
          },
          months: newMonths
        }
      }
    }));

    setFeedback({
      text: `Configuração replicada para todos os 12 meses do ano de ${selectedYear}!`,
      type: 'success'
    });
    setTimeout(() => setFeedback({ text: '', type: '' }), 4000);
  };

  const handleToggleDay = (dayNum) => {
    const isCurrentlyActive = config.availableDays.includes(dayNum);
    let newDays;
    if (isCurrentlyActive) {
      newDays = config.availableDays.filter(d => d !== dayNum);
    } else {
      newDays = [...config.availableDays, dayNum].sort();
    }

    const currentDayCfg = config.dayConfig[String(dayNum)] || {};
    setConfig({
      ...config,
      availableDays: newDays,
      dayConfig: {
        ...config.dayConfig,
        [String(dayNum)]: {
          ...currentDayCfg,
          active: !isCurrentlyActive,
          morningStart: currentDayCfg.morningStart || '08:00',
          morningEnd: currentDayCfg.morningEnd || '12:00',
          afternoonStart: currentDayCfg.afternoonStart || '13:30',
          afternoonEnd: currentDayCfg.afternoonEnd || '18:00'
        }
      }
    });
  };

  const handleDayTimeChange = (dayNum, field, value) => {
    const currentDayCfg = config.dayConfig[String(dayNum)] || {};
    setConfig({
      ...config,
      dayConfig: {
        ...config.dayConfig,
        [String(dayNum)]: {
          ...currentDayCfg,
          [field]: value
        }
      }
    });
  };

  // Yearly Stats for active doctor in selected year
  const yearPrefix = String(selectedYear);
  const activeDocYearAppointments = useMemo(() => {
    return appointments.filter(a => 
      a.doctorId === activeDoctorId && 
      a.date && a.date.startsWith(yearPrefix) && 
      a.status !== 'Cancelado'
    );
  }, [appointments, activeDoctorId, yearPrefix]);

  // Current scope appointments
  const activeDocScopeAppointments = useMemo(() => {
    if (selectedMonthScope === 'all') return activeDocYearAppointments;
    const monthPrefix = `${selectedYear}-${selectedMonthScope}`;
    return appointments.filter(a => 
      a.doctorId === activeDoctorId && 
      a.date && a.date.startsWith(monthPrefix) && 
      a.status !== 'Cancelado'
    );
  }, [appointments, activeDoctorId, selectedYear, selectedMonthScope, activeDocYearAppointments]);

  const firstConsultsCount = activeDocScopeAppointments.filter(a => 
    (a.type || '').toLowerCase().includes('primeira') || (a.type || '').toLowerCase().includes('inicial')
  ).length;

  const returnsCount = activeDocScopeAppointments.filter(a => 
    (a.type || '').toLowerCase().includes('retorno') || (a.type || '').toLowerCase().includes('reavalia')
  ).length;

  const proceduresCount = activeDocScopeAppointments.filter(a => 
    (a.type || '').toLowerCase().includes('procedimento') || (a.type || '').toLowerCase().includes('pequeno') || (a.type || '').toLowerCase().includes('biópsia')
  ).length;

  // Annual Totals
  const annualFirstQuota = currentLimits.monthlyFirstConsultLimit * 12;
  const annualReturnQuota = currentLimits.monthlyReturnLimit * 12;
  const annualProcQuota = currentLimits.monthlyProcedureLimit * 12;
  const annualTotalCapacity = annualFirstQuota + annualReturnQuota + annualProcQuota;
  const annualRealizedTotal = activeDocYearAppointments.length;

  const activeDoctorObj = doctors.find(d => d.uid === activeDoctorId);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!activeDoctorId) return;

    setSaving(true);
    try {
      const payload = {
        ...config,
        doctorId: activeDoctorId,
        doctorName: activeDoctorObj?.name || 'Médico',
        year: selectedYear,
        updatedAt: new Date().toISOString()
      };
      await dbService.saveDoctorSchedule(activeDoctorId, payload);
      setFeedback({ text: `Agenda de ${activeDoctorObj?.name || 'Médico'} salva com sucesso para ${selectedYear}!`, type: 'success' });
      if (onSaved) onSaved(payload);
      setTimeout(() => setFeedback({ text: '', type: '' }), 3500);
    } catch (err) {
      console.error(err);
      setFeedback({ text: 'Erro ao salvar configuração na nuvem.', type: 'danger' });
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        {/* Header */}
        <div style={styles.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={styles.iconBox}>
              <Award size={20} color="#0891b2" />
            </div>
            <div>
              <h2 style={styles.title}>Agenda</h2>
              <p style={styles.subtitle}>Defina cotas anuais e mensais de consultas, dias e horários de atendimento.</p>
            </div>
          </div>
          <button onClick={onClose} style={styles.closeBtn} title="Fechar">
            <X size={20} />
          </button>
        </div>

        {/* Feedback Alert */}
        {feedback.text && (
          <div style={{
            ...styles.alert,
            backgroundColor: feedback.type === 'danger' ? '#fef2f2' : '#f0fdf4',
            color: feedback.type === 'danger' ? '#991b1b' : '#166534',
            borderColor: feedback.type === 'danger' ? '#fca5a5' : '#bbf7d0'
          }}>
            {feedback.type === 'danger' ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />}
            <span>{feedback.text}</span>
          </div>
        )}

        {/* Content Body with Doctor Selector */}
        <div style={styles.body}>
          {/* Doctor Sidebar */}
          <div style={styles.sidebar}>
            <span style={styles.sidebarTitle}>Profissionais</span>
            <div style={styles.doctorList}>
              {doctors.map(doc => {
                const isSelected = doc.uid === activeDoctorId;
                return (
                  <button
                    key={doc.uid}
                    type="button"
                    onClick={() => setActiveDoctorId(doc.uid)}
                    style={{
                      ...styles.doctorItem,
                      backgroundColor: isSelected ? '#ecfdf5' : '#ffffff',
                      borderColor: isSelected ? '#10b981' : '#e2e8f0',
                      color: isSelected ? '#065f46' : '#1e293b'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <User size={14} color={isSelected ? '#10b981' : '#64748b'} />
                      <strong style={{ fontSize: '0.82rem', textAlign: 'left' }}>{doc.name}</strong>
                    </div>
                    {isSelected && <ChevronRight size={14} color="#10b981" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Configuration Form */}
          <div style={styles.mainContent}>
            {loading ? (
              <div style={styles.loadingBox}>Carregando grade do profissional...</div>
            ) : (
              <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                
                {/* 📅 Year & Month Scope Selector */}
                <div style={styles.yearControlCard}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <Calendar size={18} color="#0891b2" />
                      <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>Ano:</strong>
                      <div style={styles.yearStepper}>
                        <button 
                          type="button" 
                          onClick={() => setSelectedYear(y => y - 1)} 
                          style={styles.yearStepBtn}
                        >
                          <ChevronLeft size={14} />
                        </button>
                        <span style={styles.yearDisplay}>{selectedYear}</span>
                        <button 
                          type="button" 
                          onClick={() => setSelectedYear(y => y + 1)} 
                          style={styles.yearStepBtn}
                        >
                          <ChevronRight size={14} />
                        </button>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                      <button
                        type="button"
                        onClick={handleReplicateToAllMonths}
                        style={styles.replicateBtn}
                        title="Replicar valores atuais para todos os 12 meses do ano selecionado"
                      >
                        <Copy size={13} /> Replicar para o Ano Inteiro
                      </button>
                    </div>
                  </div>

                  {/* 12 Months Tabs */}
                  <div style={styles.monthsGrid}>
                    <button
                      type="button"
                      onClick={() => setSelectedMonthScope('all')}
                      style={{
                        ...styles.monthTab,
                        backgroundColor: selectedMonthScope === 'all' ? '#0891b2' : '#ffffff',
                        color: selectedMonthScope === 'all' ? '#ffffff' : '#334155',
                        borderColor: selectedMonthScope === 'all' ? '#0891b2' : '#cbd5e1',
                        fontWeight: '800'
                      }}
                    >
                      Ano Inteiro (12m)
                    </button>
                    {monthsList.map(m => {
                      const isSelected = selectedMonthScope === m.id;
                      const monthCount = activeDocYearAppointments.filter(a => a.date?.startsWith(`${selectedYear}-${m.id}`)).length;
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setSelectedMonthScope(m.id)}
                          style={{
                            ...styles.monthTab,
                            backgroundColor: isSelected ? '#0891b2' : '#ffffff',
                            color: isSelected ? '#ffffff' : '#334155',
                            borderColor: isSelected ? '#0891b2' : '#e2e8f0'
                          }}
                        >
                          <span>{m.name}</span>
                          <span style={{ 
                            fontSize: '0.65rem', 
                            opacity: 0.85,
                            backgroundColor: isSelected ? 'rgba(255,255,255,0.25)' : '#f1f5f9',
                            padding: '0.05rem 0.3rem',
                            borderRadius: '9999px'
                          }}>
                            {monthCount}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 📊 Annual Capacity Summary Card */}
                <div style={styles.annualSummaryCard}>
                  <div style={styles.annualSummaryHeader}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <BarChart3 size={16} color="#0891b2" />
                      <strong style={{ fontSize: '0.85rem', color: '#0f172a' }}>
                        Capacidade Anual {selectedYear} ({activeDoctorObj?.name})
                      </strong>
                    </div>
                    <span style={styles.annualTotalBadge}>
                      {annualRealizedTotal} agendamentos em {selectedYear}
                    </span>
                  </div>

                  <div style={styles.annualMetricsGrid}>
                    <div style={styles.annualMetricBox}>
                      <span style={styles.annualMetricLabel}>Primeira Consulta / Ano</span>
                      <strong style={{ fontSize: '1.05rem', color: '#0891b2' }}>{annualFirstQuota} vagas</strong>
                      <span style={styles.annualMetricSub}>{currentLimits.monthlyFirstConsultLimit} / mês</span>
                    </div>

                    <div style={styles.annualMetricBox}>
                      <span style={styles.annualMetricLabel}>Retorno / Ano</span>
                      <strong style={{ fontSize: '1.05rem', color: '#10b981' }}>{annualReturnQuota} vagas</strong>
                      <span style={styles.annualMetricSub}>{currentLimits.monthlyReturnLimit} / mês</span>
                    </div>

                    <div style={styles.annualMetricBox}>
                      <span style={styles.annualMetricLabel}>Procedimentos / Ano</span>
                      <strong style={{ fontSize: '1.05rem', color: '#7c3aed' }}>{annualProcQuota} vagas</strong>
                      <span style={styles.annualMetricSub}>{currentLimits.monthlyProcedureLimit} / mês</span>
                    </div>

                    <div style={{ ...styles.annualMetricBox, backgroundColor: '#ecfeff', borderColor: '#a5f3fc' }}>
                      <span style={{ ...styles.annualMetricLabel, color: '#0e7490' }}>Capacidade Total / Ano</span>
                      <strong style={{ fontSize: '1.15rem', color: '#0891b2' }}>{annualTotalCapacity} vagas</strong>
                      <span style={styles.annualMetricSub}>12 meses planejados</span>
                    </div>
                  </div>
                </div>

                {/* 📊 Cotas de Atendimento */}
                <div style={styles.sectionBox}>
                  <div style={styles.sectionHeader}>
                    <Award size={16} color="#0891b2" />
                    <strong style={styles.sectionTitle}>
                      Cotas ({selectedMonthScope === 'all' ? `Padrão Mensal para ${selectedYear}` : `${monthsList.find(m => m.id === selectedMonthScope)?.fullName} de ${selectedYear}`})
                    </strong>
                  </div>

                  <div style={styles.quotaGrid}>
                    {/* Primeira Consulta */}
                    <div style={styles.quotaCard}>
                      <div style={styles.quotaCardHeader}>
                        <span style={styles.quotaLabel}>Primeira Consulta</span>
                        <span style={{ fontSize: '0.75rem', fontWeight: '800', color: firstConsultsCount >= currentLimits.monthlyFirstConsultLimit ? '#dc2626' : '#0891b2' }}>
                          {firstConsultsCount} / {currentLimits.monthlyFirstConsultLimit} mês
                        </span>
                      </div>
                      <div style={styles.progressBarBg}>
                        <div style={{
                          ...styles.progressBarFill,
                          width: `${Math.min(100, (firstConsultsCount / (currentLimits.monthlyFirstConsultLimit || 1)) * 100)}%`,
                          backgroundColor: firstConsultsCount >= currentLimits.monthlyFirstConsultLimit ? '#dc2626' : '#0891b2'
                        }} />
                      </div>
                      <div style={{ marginTop: '0.5rem' }}>
                        <label style={styles.fieldLabel}>Limite</label>
                        <input 
                          type="number" 
                          min="1" 
                          max="500" 
                          value={currentLimits.monthlyFirstConsultLimit} 
                          onChange={e => handleUpdateLimit('monthlyFirstConsultLimit', e.target.value)}
                          style={styles.input}
                          required
                        />
                      </div>
                    </div>

                    {/* Retorno */}
                    <div style={styles.quotaCard}>
                      <div style={styles.quotaCardHeader}>
                        <span style={styles.quotaLabel}>Retorno</span>
                        <span style={{ fontSize: '0.75rem', fontWeight: '800', color: returnsCount >= currentLimits.monthlyReturnLimit ? '#dc2626' : '#10b981' }}>
                          {returnsCount} / {currentLimits.monthlyReturnLimit} mês
                        </span>
                      </div>
                      <div style={styles.progressBarBg}>
                        <div style={{
                          ...styles.progressBarFill,
                          width: `${Math.min(100, (returnsCount / (currentLimits.monthlyReturnLimit || 1)) * 100)}%`,
                          backgroundColor: returnsCount >= currentLimits.monthlyReturnLimit ? '#dc2626' : '#10b981'
                        }} />
                      </div>
                      <div style={{ marginTop: '0.5rem' }}>
                        <label style={styles.fieldLabel}>Limite</label>
                        <input 
                          type="number" 
                          min="1" 
                          max="1000" 
                          value={currentLimits.monthlyReturnLimit} 
                          onChange={e => handleUpdateLimit('monthlyReturnLimit', e.target.value)}
                          style={styles.input}
                          required
                        />
                      </div>
                    </div>

                    {/* Procedimentos */}
                    <div style={styles.quotaCard}>
                      <div style={styles.quotaCardHeader}>
                        <span style={styles.quotaLabel}>Procedimentos</span>
                        <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#7c3aed' }}>
                          Meta: {currentLimits.monthlyProcedureLimit}
                        </span>
                      </div>
                      <div style={styles.progressBarBg}>
                        <div style={{
                          ...styles.progressBarFill,
                          width: `${Math.min(100, (proceduresCount / (currentLimits.monthlyProcedureLimit || 1)) * 100)}%`,
                          backgroundColor: '#7c3aed'
                        }} />
                      </div>
                      <div style={{ marginTop: '0.5rem' }}>
                        <label style={styles.fieldLabel}>Limite</label>
                        <input 
                          type="number" 
                          min="0" 
                          max="200" 
                          value={currentLimits.monthlyProcedureLimit} 
                          onChange={e => handleUpdateLimit('monthlyProcedureLimit', e.target.value)}
                          style={styles.input}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* ⚙️ Parâmetros Operacionais */}
                <div style={styles.sectionBox}>
                  <div style={styles.sectionHeader}>
                    <Clock size={16} color="#0891b2" />
                    <strong style={styles.sectionTitle}>Parâmetros</strong>
                  </div>

                  <div style={styles.paramsGrid}>
                    <div style={styles.inputGroup}>
                      <label style={styles.fieldLabel}>Duração</label>
                      <select 
                        value={config.slotDuration} 
                        onChange={e => setConfig({ ...config, slotDuration: parseInt(e.target.value, 10) || 30 })}
                        style={styles.input}
                      >
                        <option value="15">15 minutos</option>
                        <option value="20">20 minutos</option>
                        <option value="30">30 minutos (Padrão)</option>
                        <option value="40">40 minutos</option>
                        <option value="45">45 minutos</option>
                        <option value="60">60 minutos (1 hora)</option>
                      </select>
                    </div>

                    <div style={styles.inputGroup}>
                      <label style={styles.fieldLabel}>Encaixes</label>
                      <input 
                        type="number" 
                        min="0" 
                        max="10" 
                        value={config.maxEncaixesPerDay} 
                        onChange={e => setConfig({ ...config, maxEncaixesPerDay: parseInt(e.target.value, 10) || 0 })}
                        style={styles.input}
                        placeholder="Máx. por dia"
                      />
                    </div>

                    <div style={styles.inputGroup}>
                      <label style={styles.fieldLabel}>Consultório</label>
                      <select 
                        value={config.defaultRoom} 
                        onChange={e => setConfig({ ...config, defaultRoom: e.target.value })}
                        style={styles.input}
                      >
                        {availableRooms.map(r => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* 📅 Grade Semanal de Atendimento */}
                <div style={styles.sectionBox}>
                  <div style={styles.sectionHeader}>
                    <Calendar size={16} color="#0891b2" />
                    <strong style={styles.sectionTitle}>Grade</strong>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {weekDays.map(({ day, label }) => {
                      const isActive = config.availableDays.includes(day);
                      const dayCfg = config.dayConfig[String(day)] || {};

                      return (
                        <div 
                          key={day} 
                          style={{
                            ...styles.dayRow,
                            backgroundColor: isActive ? '#f0fdf4' : '#f8fafc',
                            borderColor: isActive ? '#86efac' : '#e2e8f0'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', minWidth: '130px' }}>
                            <input 
                              type="checkbox" 
                              id={`day_${day}`}
                              checked={isActive} 
                              onChange={() => handleToggleDay(day)}
                              style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                            />
                            <label htmlFor={`day_${day}`} style={{ fontWeight: '700', fontSize: '0.85rem', color: isActive ? '#166534' : '#64748b', cursor: 'pointer' }}>
                              {label}
                            </label>
                          </div>

                          {isActive ? (
                            <div style={styles.dayTimesGrid}>
                              <div style={styles.timeSubGroup}>
                                <span style={styles.timeSubLabel}>Manhã:</span>
                                <input 
                                  type="time" 
                                  value={dayCfg.morningStart || '08:00'} 
                                  onChange={e => handleDayTimeChange(day, 'morningStart', e.target.value)}
                                  style={styles.timeInput}
                                />
                                <span>às</span>
                                <input 
                                  type="time" 
                                  value={dayCfg.morningEnd || '12:00'} 
                                  onChange={e => handleDayTimeChange(day, 'morningEnd', e.target.value)}
                                  style={styles.timeInput}
                                />
                              </div>

                              <div style={styles.timeSubGroup}>
                                <span style={styles.timeSubLabel}>Tarde:</span>
                                <input 
                                  type="time" 
                                  value={dayCfg.afternoonStart || '13:30'} 
                                  onChange={e => handleDayTimeChange(day, 'afternoonStart', e.target.value)}
                                  style={styles.timeInput}
                                />
                                <span>às</span>
                                <input 
                                  type="time" 
                                  value={dayCfg.afternoonEnd || '18:00'} 
                                  onChange={e => handleDayTimeChange(day, 'afternoonEnd', e.target.value)}
                                  style={styles.timeInput}
                                />
                              </div>
                            </div>
                          ) : (
                            <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontStyle: 'italic' }}>
                              Não atende
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Footer Save Button */}
                <div style={styles.footer}>
                  <button type="button" onClick={onClose} style={styles.btnCancel}>
                    Cancelar
                  </button>
                  <button type="submit" disabled={saving} style={styles.btnSave}>
                    <Save size={16} /> {saving ? 'Salvando...' : 'Salvar'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    zIndex: 99999, padding: '1.5rem'
  },
  modal: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    width: '100%', maxWidth: '1020px',
    maxHeight: '92vh',
    display: 'flex', flexDirection: 'column',
    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
    overflow: 'hidden'
  },
  header: {
    padding: '1.25rem 1.5rem',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#f8fafc'
  },
  iconBox: {
    width: '38px', height: '38px', borderRadius: '10px',
    backgroundColor: '#e0f2fe',
    display: 'flex', alignItems: 'center', justifyContent: 'center'
  },
  title: {
    margin: 0, fontSize: '1.15rem', color: '#0f172a', fontWeight: '800'
  },
  subtitle: {
    margin: '0.15rem 0 0 0', fontSize: '0.78rem', color: '#64748b'
  },
  closeBtn: {
    background: 'none', border: 'none', cursor: 'pointer', color: '#64748b',
    padding: '0.4rem', borderRadius: '8px', display: 'flex', alignItems: 'center'
  },
  alert: {
    padding: '0.75rem 1.25rem',
    display: 'flex', alignItems: 'center', gap: '0.5rem',
    fontSize: '0.85rem', fontWeight: '600',
    borderBottom: '1px solid transparent'
  },
  body: {
    display: 'grid',
    gridTemplateColumns: '260px 1fr',
    flex: 1,
    overflowY: 'auto',
    minHeight: '520px'
  },
  sidebar: {
    borderRight: '1px solid #e2e8f0',
    backgroundColor: '#f8fafc',
    padding: '1rem',
    display: 'flex', flexDirection: 'column', gap: '0.6rem'
  },
  sidebarTitle: {
    fontSize: '0.7rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em'
  },
  doctorList: {
    display: 'flex', flexDirection: 'column', gap: '0.4rem', overflowY: 'auto'
  },
  doctorItem: {
    padding: '0.65rem 0.75rem', borderRadius: '8px', border: '1px solid',
    cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    transition: 'all 0.15s ease'
  },
  mainContent: {
    padding: '1.25rem',
    overflowY: 'auto'
  },
  loadingBox: {
    padding: '3rem', textAlign: 'center', color: '#64748b', fontSize: '0.9rem'
  },
  yearControlCard: {
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '0.85rem 1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem'
  },
  yearStepper: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    overflow: 'hidden'
  },
  yearStepBtn: {
    backgroundColor: 'transparent',
    border: 'none',
    padding: '0.35rem 0.5rem',
    cursor: 'pointer',
    color: '#475569',
    display: 'flex',
    alignItems: 'center'
  },
  yearDisplay: {
    fontWeight: '800',
    fontSize: '0.9rem',
    color: '#0891b2',
    padding: '0 0.5rem'
  },
  replicateBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.3rem',
    padding: '0.35rem 0.7rem',
    borderRadius: '6px',
    backgroundColor: '#ecfdf5',
    color: '#065f46',
    border: '1px solid #a7f3d0',
    fontWeight: '700',
    fontSize: '0.75rem',
    cursor: 'pointer'
  },
  monthsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(65px, 1fr))',
    gap: '0.3rem'
  },
  monthTab: {
    padding: '0.35rem 0.4rem',
    borderRadius: '6px',
    border: '1px solid',
    fontSize: '0.75rem',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.15rem',
    transition: 'all 0.15s ease'
  },
  annualSummaryCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '0.85rem 1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.65rem'
  },
  annualSummaryHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '0.5rem'
  },
  annualTotalBadge: {
    fontSize: '0.72rem',
    fontWeight: '800',
    backgroundColor: '#e0f2fe',
    color: '#0369a1',
    padding: '0.15rem 0.5rem',
    borderRadius: '9999px'
  },
  annualMetricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: '0.6rem'
  },
  annualMetricBox: {
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '0.6rem 0.75rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.15rem'
  },
  annualMetricLabel: {
    fontSize: '0.7rem',
    fontWeight: '700',
    color: '#64748b'
  },
  annualMetricSub: {
    fontSize: '0.65rem',
    color: '#94a3b8'
  },
  sectionBox: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '1rem',
    display: 'flex', flexDirection: 'column', gap: '0.75rem'
  },
  sectionHeader: {
    display: 'flex', alignItems: 'center', gap: '0.4rem'
  },
  sectionTitle: {
    fontSize: '0.88rem', color: '#0f172a'
  },
  quotaGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem'
  },
  quotaCard: {
    backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.75rem'
  },
  quotaCardHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
  },
  quotaLabel: {
    fontSize: '0.8rem', fontWeight: '700', color: '#334155'
  },
  progressBarBg: {
    height: '6px', backgroundColor: '#e2e8f0', borderRadius: '9999px', overflow: 'hidden', marginTop: '0.4rem'
  },
  progressBarFill: {
    height: '100%', transition: 'width 0.3s ease'
  },
  fieldLabel: {
    fontSize: '0.72rem', fontWeight: '700', color: '#64748b', display: 'block', marginBottom: '0.2rem'
  },
  paramsGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem'
  },
  inputGroup: {
    display: 'flex', flexDirection: 'column'
  },
  input: {
    padding: '0.5rem 0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1',
    fontSize: '0.85rem', color: '#0f172a', backgroundColor: '#ffffff', outline: 'none'
  },
  dayRow: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid', gap: '0.8rem'
  },
  dayTimesGrid: {
    display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap'
  },
  timeSubGroup: {
    display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', color: '#475569'
  },
  timeSubLabel: {
    fontWeight: '700', color: '#334155'
  },
  timeInput: {
    padding: '0.25rem 0.4rem', borderRadius: '4px', border: '1px solid #cbd5e1',
    fontSize: '0.78rem', backgroundColor: '#ffffff'
  },
  footer: {
    display: 'flex', justifyContent: 'flex-end', gap: '0.6rem', marginTop: '0.5rem'
  },
  btnCancel: {
    padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1',
    backgroundColor: '#ffffff', color: '#475569', fontSize: '0.85rem', fontWeight: '700', cursor: 'pointer'
  },
  btnSave: {
    padding: '0.6rem 1.25rem', borderRadius: '8px', border: 'none',
    backgroundColor: '#10b981', color: '#ffffff', fontSize: '0.85rem', fontWeight: '800', cursor: 'pointer',
    display: 'flex', alignItems: 'center', gap: '0.4rem'
  }
};
