import React, { useState, useEffect, useMemo } from 'react';
import { dbService } from '../../firebase';
import { 
  Calendar, Search, AlertTriangle, 
  CheckCircle2, RefreshCw, ArrowRightLeft, ShieldAlert, Cpu, 
  MapPin, Clock, Plus, X, ChevronRight, Wrench,
  UserMinus, Pencil, Activity, FlaskConical
} from 'lucide-react';
import { useUnit } from '../../contexts/UnitContext';

export default function DialysisScheduleTab({ currentUser, onOpenPostModalWithPatient }) {
  const { activeUnitId, filterByActiveUnit } = useUnit();
  // Navigation State
  const [selectedSalon, setSelectedSalon] = useState('Salão 01');
  const [selectedShift, setSelectedShift] = useState('1º Turno');
  const [cadence, setCadence] = useState('SQS'); // 'SQS' (Seg/Qua/Sex) | 'TQS' (Ter/Qui/Sáb)

  // Data State
  const [scheduleData, setScheduleData] = useState(null);
  const [allSchedules, setAllSchedules] = useState(null);
  const [patients, setPatients] = useState([]);
  const [equipments, setEquipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Search & Modals
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchModal, setShowSearchModal] = useState(false);

  // Reallocation / Swap Modal
  const [showReallocateModal, setShowReallocateModal] = useState(false);
  const [selectedSlotForReallocate, setSelectedSlotForReallocate] = useState(null);
  const [reallocatePatientTerm, setReallocatePatientTerm] = useState('');
  const [selectedNewPatient, setSelectedNewPatient] = useState(null);

  // Machine Maintenance Modal
  const [showMachineModal, setShowMachineModal] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState(null);

  // Edit Access & Heparin Modal
  const [showEditPatientModal, setShowEditPatientModal] = useState(false);
  const [selectedSlotForEdit, setSelectedSlotForEdit] = useState(null);

  // Patient Labs Modal
  const [showLabsModal, setShowLabsModal] = useState(false);
  const [selectedPatientForLabs, setSelectedPatientForLabs] = useState(null);
  const [patientLabsList, setPatientLabsList] = useState([]);
  const [loadingLabs, setLoadingLabs] = useState(false);
  const [selectedLabsMonth, setSelectedLabsMonth] = useState(null);

  // Auto-detect today's cadence
  useEffect(() => {
    const dayOfWeek = new Date().getDay(); // 0 = Sun, 1 = Mon, 2 = Tue, 3 = Wed, 4 = Thu, 5 = Fri, 6 = Sat
    if (dayOfWeek === 2 || dayOfWeek === 4 || dayOfWeek === 6) {
      setCadence('TQS');
    } else {
      setCadence('SQS');
    }
  }, []);

  // Fetch data
  const loadSchedule = async () => {
    setLoading(true);
    try {
      const [sched, allScheds, pats, equips] = await Promise.all([
        dbService.getDialysisSchedule ? dbService.getDialysisSchedule(selectedSalon, selectedShift) : null,
        dbService.getAllDialysisSchedules ? dbService.getAllDialysisSchedules() : null,
        dbService.getPatients ? dbService.getPatients() : [],
        dbService.getEquipments ? dbService.getEquipments() : []
      ]);
      setScheduleData(sched);
      setAllSchedules(allScheds);
      setPatients(pats || []);
      setEquipments(equips || []);
    } catch (err) {
      console.error('Erro ao carregar escala de hemodiálise:', err);
      setMessage({ text: 'Erro ao sincronizar dados da escala', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSchedule();
  }, [selectedSalon, selectedShift]);

  // Global Search
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }
    if (dbService.searchPatientInSchedule) {
      const res = dbService.searchPatientInSchedule(searchTerm, allSchedules);
      setSearchResults(res);
    }
  }, [searchTerm, allSchedules]);

  // Helper for Age calculation
  const calculateAge = (birthDateStr, dnStr) => {
    let dateObj = null;
    if (birthDateStr) {
      dateObj = new Date(birthDateStr);
    } else if (dnStr) {
      const parts = dnStr.split('/');
      if (parts.length === 3) {
        let yr = parts[2];
        if (yr.length === 2) yr = (parseInt(yr) > 30 ? '19' : '20') + yr;
        dateObj = new Date(`${yr}-${parts[1]}-${parts[0]}`);
      }
    }
    if (!dateObj || isNaN(dateObj.getTime())) return '';
    const ageDiff = Date.now() - dateObj.getTime();
    const ageDate = new Date(ageDiff);
    const age = Math.abs(ageDate.getUTCFullYear() - 1970);
    return age > 0 ? `${age} anos` : '';
  };

  // Effective schedule data filtered by active unit
  const activeScheduleData = useMemo(() => {
    if (activeUnitId === 'taguatinga') {
      return { points: [] };
    }
    return scheduleData;
  }, [scheduleData, activeUnitId]);

  // Group points by Box
  const groupedBoxes = useMemo(() => {
    if (!activeScheduleData || !activeScheduleData.points) return {};
    const boxes = {};
    activeScheduleData.points.forEach(point => {
      const bName = point.box || 'Box Geral';
      if (!boxes[bName]) boxes[bName] = [];
      boxes[bName].push(point);
    });
    return boxes;
  }, [activeScheduleData]);

  // Equipment lookup map
  const equipmentMap = useMemo(() => {
    const map = new Map();
    filterByActiveUnit(equipments).forEach(eq => {
      if (eq.serialNumber) {
        map.set(eq.serialNumber.trim().toUpperCase(), eq);
      }
    });
    return map;
  }, [equipments, activeUnitId]);

  // Operational metrics
  const metrics = useMemo(() => {
    if (activeUnitId === 'taguatinga') {
      return { totalSlots: 0, occupiedSlots: 0, vacantSlots: 0, favCount: 0, needle15: 0, needle16: 0, needle17: 0, cdlCount: 0, permcathCount: 0, isolationCount: 0 };
    }
    if (!dbService.calculateScheduleMetrics) return {};
    return dbService.calculateScheduleMetrics(scheduleData, cadence);
  }, [scheduleData, cadence, activeUnitId]);

  // Handle open machine modal
  const handleOpenMachineDetails = (serial) => {
    if (!serial) return;
    const eq = equipmentMap.get(serial.trim().toUpperCase());
    if (eq) {
      setSelectedMachine(eq);
    } else {
      setSelectedMachine({
        name: `Máquina Nipro Diamax 220F`,
        serialNumber: serial,
        model: 'DIAMAX 220F',
        brand: 'Nipro',
        status: 'Em Operação',
        sector: `${selectedSalon} - ${selectedShift}`,
        lastPreventiveDate: '10/05/2026',
        nextPreventiveDate: '10/08/2026',
        calibrationValidUntil: '31/12/2026',
        notes: 'Equipamento em operação com conformidade atestada.'
      });
    }
    setShowMachineModal(true);
  };

  // Handle Reallocate / Assign Patient
  const handleSaveReallocation = async () => {
    if (!selectedSlotForReallocate) return;
    setActionLoading(true);
    try {
      let patientToSave = null;
      let isClearing = false;

      if (selectedNewPatient?.isVacant) {
        patientToSave = null;
        isClearing = true;
      } else if (selectedNewPatient) {
        patientToSave = {
          name: (selectedNewPatient.name || '').trim().toUpperCase(),
          dn: selectedNewPatient.birthDate ? selectedNewPatient.birthDate.split('-').reverse().join('/') : (selectedNewPatient.dn || ''),
          accessType: selectedNewPatient.accessType || 'Fístula Arteriovenosa',
          needleSize: selectedNewPatient.needleSize || '16',
          isolation: selectedNewPatient.isolation || null
        };
      } else if (reallocatePatientTerm.trim()) {
        patientToSave = {
          name: reallocatePatientTerm.trim().toUpperCase(),
          dn: '',
          accessType: 'Fístula Arteriovenosa',
          needleSize: '16',
          isolation: null
        };
      }

      await dbService.updatePointPatient(
        selectedSalon,
        selectedShift,
        selectedSlotForReallocate.pointId,
        cadence,
        patientToSave
      );

      setMessage({ 
        text: isClearing ? 'Vaga desocupada com sucesso!' : 'Escala atualizada com sucesso!', 
        type: 'success' 
      });
      setShowReallocateModal(false);
      setSelectedSlotForReallocate(null);
      setSelectedNewPatient(null);
      setReallocatePatientTerm('');
      loadSchedule();
    } catch (err) {
      console.error(err);
      setMessage({ text: 'Erro ao atualizar escala', type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  // Abrir modal de edição rápida de Acesso e Heparina
  const handleOpenEditPatient = (pt, patient) => {
    if (!patient) return;
    let defaultAccess = patient.accessType;
    if (!defaultAccess) {
      if (patient.accessRaw?.toUpperCase().includes('PERM')) defaultAccess = 'Permcath';
      else if (patient.accessRaw?.toUpperCase().includes('CDL')) defaultAccess = 'Cateter Duplo Lúmen';
      else defaultAccess = 'Fístula Arteriovenosa';
    }
    const defaultNeedle = patient.needleSize || (patient.accessRaw && patient.accessRaw.match(/AG\s*\.?\s*(\d+)/i)?.[1]) || '16';
    setSelectedSlotForEdit({
      pointId: pt.id || pt.ponto,
      ponto: pt.ponto,
      box: pt.box,
      patient: patient,
      accessType: defaultAccess,
      needleSize: defaultNeedle,
      heparina: patient.heparina || '',
      isolation: !!(patient.isolation || patient.accessRaw?.toUpperCase().includes('HIV') || patient.accessRaw?.toUpperCase().includes('ÚNICO') || patient.accessRaw?.toUpperCase().includes('UNICO'))
    });
    setShowEditPatientModal(true);
  };

  // Salvar parâmetros de Acesso e Heparina do paciente
  const handleSaveEditPatient = async () => {
    if (!selectedSlotForEdit || !selectedSlotForEdit.patient) return;
    setActionLoading(true);
    try {
      const { pointId, accessType, needleSize, heparina, isolation, patient } = selectedSlotForEdit;
      
      let accessRaw = accessType === 'Permcath' ? 'PERM' : accessType === 'Cateter Duplo Lúmen' ? 'CDL' : `FAV Ag.${needleSize || '16'}`;
      if (isolation) accessRaw += ' USO ÚNICO';
      if (heparina) accessRaw += ` Heparina:${heparina}`;

      // 1. Atualizar na escala
      if (dbService.updatePointPatientParameters) {
        await dbService.updatePointPatientParameters(
          selectedSalon,
          selectedShift,
          pointId,
          cadence,
          {
            accessType,
            needleSize: accessType === 'Fístula Arteriovenosa' ? needleSize : null,
            heparina,
            isolation: isolation ? 'Uso Único' : null,
            accessRaw
          }
        );
      }

      // 2. Sincronizar com o cadastro mestre do paciente
      const patNameNorm = (patient.name || '').trim().toUpperCase();
      const matchingMaster = patients.find(p => (p.name || '').trim().toUpperCase() === patNameNorm);
      if (matchingMaster && matchingMaster.id && dbService.updatePatient) {
        await dbService.updatePatient(matchingMaster.id, {
          accessType,
          needleSize: accessType === 'Fístula Arteriovenosa' ? needleSize : null,
          heparina,
          isolation: isolation ? 'Uso Único' : null
        });
      }

      setMessage({ text: `Dados de ${patient.name} atualizados com sucesso!`, type: 'success' });
      setShowEditPatientModal(false);
      setSelectedSlotForEdit(null);
      await loadSchedule();
    } catch (err) {
      console.error('Erro ao atualizar dados do paciente:', err);
      setMessage({ text: 'Erro ao salvar alterações do paciente', type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  // Handle open patient lab exams
  const handleOpenPatientLabs = async (patient) => {
    if (!patient) return;
    setSelectedPatientForLabs(patient);
    setShowLabsModal(true);
    setLoadingLabs(true);
    try {
      const pId = patient.patientId || patient.id || patient.name;
      const exams = await dbService.getPatientLabExams(pId);
      setPatientLabsList(exams || []);
      if (exams && exams.length > 0) {
        setSelectedLabsMonth(exams[0].month);
      } else {
        setSelectedLabsMonth(null);
      }
    } catch (err) {
      console.error('Erro ao buscar exames laboratoriais do paciente:', err);
      setPatientLabsList([]);
    } finally {
      setLoadingLabs(false);
    }
  };

  return (
    <div style={tabStyles.container}>
      {/* Toast Alert */}
      {message.text && (
        <div style={{
          ...tabStyles.alertToast,
          backgroundColor: message.type === 'success' ? '#10b981' : '#ef4444'
        }}>
          <span>{message.text}</span>
          <button onClick={() => setMessage({ text: '', type: '' })} style={tabStyles.toastCloseBtn}>×</button>
        </div>
      )}

      {/* Control Navigation & Filter Card */}
      <div style={tabStyles.filterCard}>
        <div style={tabStyles.filterTopRow}>
          {/* Salão Selector */}
          <div style={tabStyles.filterGroup}>
            <span style={tabStyles.filterLabel}>
              <MapPin size={14} style={{ marginRight: '4px', color: '#6366f1' }} /> Salão
            </span>
            <div style={tabStyles.pillContainer}>
              {['Salão 01', 'Salão 02', 'Salão 03'].map(sal => (
                <button
                  key={sal}
                  onClick={() => setSelectedSalon(sal)}
                  style={{
                    ...tabStyles.pillBtn,
                    backgroundColor: selectedSalon === sal ? '#4f46e5' : '#f8fafc',
                    color: selectedSalon === sal ? '#ffffff' : '#475569',
                    borderColor: selectedSalon === sal ? '#4f46e5' : '#e2e8f0',
                    fontWeight: selectedSalon === sal ? '700' : '500',
                    boxShadow: selectedSalon === sal ? '0 2px 8px rgba(79, 70, 229, 0.25)' : 'none'
                  }}
                >
                  {sal}
                </button>
              ))}
            </div>
          </div>

          {/* Turno Selector */}
          <div style={tabStyles.filterGroup}>
            <span style={tabStyles.filterLabel}>
              <Clock size={14} style={{ marginRight: '4px', color: '#0ea5e9' }} /> Turno
            </span>
            <div style={tabStyles.pillContainer}>
              {['1º Turno', '2º Turno', '3º Turno'].map(tur => (
                <button
                  key={tur}
                  onClick={() => setSelectedShift(tur)}
                  style={{
                    ...tabStyles.pillBtn,
                    backgroundColor: selectedShift === tur ? '#0284c7' : '#f8fafc',
                    color: selectedShift === tur ? '#ffffff' : '#475569',
                    borderColor: selectedShift === tur ? '#0284c7' : '#e2e8f0',
                    fontWeight: selectedShift === tur ? '700' : '500',
                    boxShadow: selectedShift === tur ? '0 2px 8px rgba(2, 132, 199, 0.25)' : 'none'
                  }}
                >
                  {tur}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Actions (Search) */}
          <div style={tabStyles.actionBtnsGroup}>
            <button
              onClick={() => setShowSearchModal(true)}
              style={tabStyles.searchOpenBtn}
              title="Buscar paciente ou máquina em qualquer salão"
            >
              <Search size={15} color="#4f46e5" />
              <span>Localizar</span>
            </button>
          </div>
        </div>

        {/* Cadence Bar */}
        <div style={tabStyles.cadenceRow}>
          <div style={tabStyles.cadenceLeft}>
            <span style={tabStyles.filterLabel}>
              <Calendar size={14} style={{ marginRight: '4px', color: '#10b981' }} /> Cadência
            </span>
            <div style={tabStyles.pillContainer}>
              <button
                onClick={() => setCadence('SQS')}
                style={{
                  ...tabStyles.cadenceBtn,
                  backgroundColor: cadence === 'SQS' ? '#2563eb' : '#f8fafc',
                  color: cadence === 'SQS' ? '#ffffff' : '#475569',
                  borderColor: cadence === 'SQS' ? '#2563eb' : '#e2e8f0',
                  fontWeight: cadence === 'SQS' ? '700' : '500'
                }}
              >
                Segunda • Quarta • Sexta
              </button>
              <button
                onClick={() => setCadence('TQS')}
                style={{
                  ...tabStyles.cadenceBtn,
                  backgroundColor: cadence === 'TQS' ? '#059669' : '#f8fafc',
                  color: cadence === 'TQS' ? '#ffffff' : '#475569',
                  borderColor: cadence === 'TQS' ? '#059669' : '#e2e8f0',
                  fontWeight: cadence === 'TQS' ? '700' : '500'
                }}
              >
                Terça • Quinta • Sábado
              </button>
            </div>
          </div>

          <div style={tabStyles.activeBadgeIndicator}>
            <span style={tabStyles.liveDot}></span>
            <span>Escala Operacional • {selectedSalon} • {selectedShift}</span>
          </div>
        </div>
      </div>

      {/* KPI Stats Bar - 7 Indicadores em Linha Única */}
      <div style={tabStyles.statsGrid}>
        <div style={tabStyles.statCard}>
          <span style={tabStyles.statLabel}>Capacidade</span>
          <div style={tabStyles.statValueRow}>
            <span style={tabStyles.statNumber}>{metrics.totalMachines || 0}</span>
            <span style={tabStyles.statSub}>máquinas</span>
          </div>
        </div>

        <div style={tabStyles.statCard}>
          <span style={tabStyles.statLabel}>Ocupação</span>
          <div style={tabStyles.statValueRow}>
            <span style={{ ...tabStyles.statNumber, color: '#4f46e5' }}>{metrics.occupiedSlots || 0}</span>
            <span style={{ ...tabStyles.statSub, color: '#6366f1', fontWeight: '700' }}>
              ({metrics.occupancyRate || 0}%)
            </span>
          </div>
        </div>

        <div style={tabStyles.statCard}>
          <span style={tabStyles.statLabel}>Vagas</span>
          <div style={tabStyles.statValueRow}>
            <span style={{ 
              ...tabStyles.statNumber, 
              color: (metrics.vacantSlots || 0) > 0 ? '#059669' : '#94a3b8' 
            }}>
              {metrics.vacantSlots || 0}
            </span>
            <span style={tabStyles.statSub}>livres</span>
          </div>
        </div>

        <div style={tabStyles.statCard}>
          <span style={tabStyles.statLabel}>Fístulas</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '3px', marginTop: '3px', flexWrap: 'wrap' }}>
            <span style={{ ...tabStyles.statNumber, color: '#047857', marginRight: '2px' }}>{metrics.favCount || 0}</span>
            <span style={tabStyles.needlePill}>15:{metrics.needle15 || 0}</span>
            <span style={tabStyles.needlePill}>16:{metrics.needle16 || 0}</span>
            <span style={tabStyles.needlePill}>17:{metrics.needle17 || 0}</span>
          </div>
        </div>

        <div style={tabStyles.statCard}>
          <span style={tabStyles.statLabel}>Cateteres</span>
          <div style={{ display: 'flex', gap: '5px', marginTop: '4px', alignItems: 'baseline' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: '700', color: '#b45309', whiteSpace: 'nowrap' }}>CDL: {metrics.cdlCount || 0}</span>
            <span style={{ fontSize: '0.74rem', fontWeight: '700', color: '#7e22ce', whiteSpace: 'nowrap' }}>Perm: {metrics.permcathCount || 0}</span>
          </div>
        </div>

        <div style={tabStyles.statCard}>
          <span style={tabStyles.statLabel}>Isolamento</span>
          <div style={tabStyles.statValueRow}>
            <span style={{ 
              ...tabStyles.statNumber, 
              color: (metrics.isolationCount || 0) > 0 ? '#e11d48' : '#94a3b8' 
            }}>
              {metrics.isolationCount || 0}
            </span>
            <span style={tabStyles.statSub}>pacientes</span>
          </div>
        </div>

        <div style={tabStyles.statCard}>
          <span style={tabStyles.statLabel}>Heparina</span>
          <div style={tabStyles.statValueRow}>
            <span style={{ ...tabStyles.statNumber, color: '#2563eb' }}>{metrics.heparinCount || 0}</span>
            <span style={{ ...tabStyles.statSub, color: '#1d4ed8', fontWeight: '700' }}>
              ({metrics.totalHeparinDoseMl || 0} mL)
            </span>
          </div>
        </div>
      </div>

      {/* Room Grid Layout by Box */}
      {loading ? (
        <div style={tabStyles.loadingBox}>
          <RefreshCw size={32} color="#4f46e5" className="spin" />
          <p style={{ marginTop: '0.75rem', color: '#64748b', fontSize: '0.9rem', fontWeight: '600' }}>
            Carregando leitos e pacientes da hemodiálise...
          </p>
        </div>
      ) : Object.keys(groupedBoxes).length === 0 ? (
        <div style={{
          padding: '3.5rem 2rem',
          textAlign: 'center',
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px dashed #cbd5e1',
          margin: '1rem 0'
        }}>
          <Calendar size={48} color="#94a3b8" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.5rem' }}>
            Nenhum leito ou paciente cadastrado para {activeUnitId === 'taguatinga' ? 'Taguatinga / DF' : 'esta sala/turno'}
          </h3>
          <p style={{ fontSize: '0.88rem', color: '#64748b', maxWidth: '480px', margin: '0 auto' }}>
            Esta filial ainda não possui pacientes alocados nesta combinação de salão e turno. Novos pacientes podem ser admitidos no módulo de Recepção/Cadastro.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {Object.entries(groupedBoxes).map(([boxName, points]) => (
            <div key={boxName} style={tabStyles.boxWrapper}>
              {/* Box Header */}
              <div style={tabStyles.boxHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    ...tabStyles.boxTag,
                    backgroundColor: boxName.includes('Amarela') ? '#fef3c7' : '#1e293b',
                    color: boxName.includes('Amarela') ? '#92400e' : '#ffffff',
                    border: boxName.includes('Amarela') ? '1px solid #fde68a' : 'none'
                  }}>
                    {boxName}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '500' }}>
                    {points.length} {points.length === 1 ? 'ponto' : 'pontos'}
                  </span>
                </div>
              </div>

              {/* Points Grid */}
              <div style={tabStyles.pointsGrid}>
                {points.map(pt => {
                  const patient = cadence === 'SQS' ? pt.sqs?.mainPatient : pt.tqs?.mainPatient;
                  const isVacant = !patient || !patient.name;
                  const eq = equipmentMap.get((pt.serialNumber || '').trim().toUpperCase());
                  const isMaintenanceAlert = eq && eq.status && eq.status !== 'Em Operação';

                  return (
                    <div
                      key={pt.id || pt.ponto}
                      style={{
                        ...tabStyles.pointCard,
                        borderStyle: isVacant ? 'dashed' : 'solid',
                        borderColor: isVacant ? '#6ee7b7' : patient?.isolation ? '#fca5a5' : '#e2e8f0',
                        backgroundColor: isVacant ? '#f0fdf4' : '#ffffff'
                      }}
                    >
                      {/* Point Header */}
                      <div style={tabStyles.pointHeader}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={tabStyles.pointNumBadge}>
                            P{pt.ponto}
                          </span>
                          {pt.serialNumber ? (
                            <button
                              type="button"
                              onClick={() => handleOpenMachineDetails(pt.serialNumber)}
                              style={tabStyles.serialBtn}
                              title="Ver ficha técnica e manutenção da máquina"
                            >
                              <Cpu size={12} style={{ marginRight: '3px' }} />
                              <span>{pt.serialNumber}</span>
                            </button>
                          ) : (
                            <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Sem máquina</span>
                          )}
                        </div>

                        {/* Machine status badge */}
                        {pt.serialNumber && (
                          <span
                            onClick={() => handleOpenMachineDetails(pt.serialNumber)}
                            style={{
                              ...tabStyles.maintStatusPill,
                              backgroundColor: isMaintenanceAlert ? '#fef3c7' : '#ecfdf5',
                              color: isMaintenanceAlert ? '#92400e' : '#047857',
                              borderColor: isMaintenanceAlert ? '#fde68a' : '#a7f3d0'
                            }}
                            title="Status da Manutenção"
                          >
                            <span style={{
                              width: '6px',
                              height: '6px',
                              borderRadius: '50%',
                              backgroundColor: isMaintenanceAlert ? '#f59e0b' : '#10b981',
                              marginRight: '4px'
                            }}></span>
                            {isMaintenanceAlert ? eq.status : 'Operacional'}
                          </span>
                        )}
                      </div>

                      {/* Point Body */}
                      <div style={{ padding: '0.75rem 0' }}>
                        {isVacant ? (
                          <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
                            <span style={tabStyles.vacantPill}>
                              <CheckCircle2 size={13} style={{ marginRight: '4px' }} /> Vaga Livre
                            </span>
                            <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '4px 0 0 0' }}>
                              Disponível para paciente
                            </p>
                          </div>
                        ) : (
                          <div 
                            onClick={() => handleOpenEditPatient(pt, patient)}
                            style={tabStyles.patientClickableArea}
                            title="Clique para editar Acesso e Heparina"
                          >
                            {/* Patient Name */}
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                              <div style={tabStyles.patientAvatar}>
                                {patient.name ? patient.name.trim().charAt(0).toUpperCase() : '?'}
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <h4 style={tabStyles.patientName} title={patient.name}>
                                  {patient.name ? patient.name.toUpperCase() : ''}
                                </h4>
                                {patient.dn && (
                                  <div style={{ fontSize: '0.73rem', color: '#64748b', marginTop: '2px' }}>
                                    <span>DN: {patient.dn}</span>
                                    {calculateAge(null, patient.dn) && (
                                      <span style={{ color: '#475569', fontWeight: '600' }}> • {calculateAge(null, patient.dn)}</span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Access, Heparina & Isolation Tags */}
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px', alignItems: 'center' }}>
                              {/* Vascular Access */}
                              {patient.accessType === 'Permcath' || (patient.accessRaw && patient.accessRaw.toUpperCase().includes('PERM')) ? (
                                <span style={tabStyles.accessPermcath}>
                                  🟣 Permcath
                                </span>
                              ) : patient.accessType === 'Cateter Duplo Lúmen' || (patient.accessRaw && patient.accessRaw.toUpperCase().includes('CDL')) ? (
                                <span style={tabStyles.accessCDL}>
                                  🟡 CDL
                                </span>
                              ) : (
                                <span style={tabStyles.accessFAV}>
                                  🟢 FAV {patient.needleSize ? `Ag.${patient.needleSize}` : (patient.accessRaw?.match(/AG\s*\.?\s*(\d+)/i)?.[0] || 'Ag.16')}
                                </span>
                              )}

                              {/* Heparina Tag (Badge posicionada exatamente ao lado do acesso vascular) */}
                              {patient.heparina ? (
                                <span style={tabStyles.accessHeparina} title="Prescrição de Heparina">
                                  💉 {patient.heparina}
                                </span>
                              ) : (
                                <span style={tabStyles.accessHeparinaEmpty} title="Clique para prescrever Heparina">
                                  + Heparina
                                </span>
                              )}

                              {/* Isolation Tag */}
                              {(patient.isolation || patient.accessRaw?.toUpperCase().includes('HIV') || patient.accessRaw?.toUpperCase().includes('ÚNICO') || patient.accessRaw?.toUpperCase().includes('UNICO')) && (
                                <span style={tabStyles.accessIsolation}>
                                  <ShieldAlert size={10} style={{ marginRight: '3px' }} /> Uso Único
                                </span>
                              )}

                              {patient.accessRaw?.toUpperCase().includes('HCV') && (
                                <span style={tabStyles.accessHCV}>
                                  HCV
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Point Footer Actions */}
                      <div style={tabStyles.pointFooter}>
                        {isVacant ? (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedSlotForReallocate({
                                pointId: pt.id || pt.ponto,
                                ponto: pt.ponto,
                                box: pt.box,
                                currentPatient: null
                              });
                              setShowReallocateModal(true);
                            }}
                            style={tabStyles.allocateBtn}
                          >
                            <Plus size={14} style={{ marginRight: '4px' }} />
                            <span>Alocar</span>
                          </button>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => handleOpenEditPatient(pt, patient)}
                              style={tabStyles.editParamBtn}
                              title="Editar acesso vascular e heparina"
                            >
                              <Pencil size={12} style={{ marginRight: '3px' }} />
                              <span>Editar</span>
                            </button>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenPatientLabs(patient);
                              }}
                              style={tabStyles.labsBtn}
                              title="Consultar exames laboratoriais do paciente"
                            >
                              <Activity size={12} style={{ marginRight: '3px' }} />
                              <span>Exames</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setSelectedSlotForReallocate({
                                  pointId: pt.id || pt.ponto,
                                  ponto: pt.ponto,
                                  box: pt.box,
                                  currentPatient: patient
                                });
                                setShowReallocateModal(true);
                              }}
                              style={tabStyles.reallocateBtn}
                              title="Remanejar ou trocar paciente de leito"
                            >
                              <ArrowRightLeft size={13} style={{ marginRight: '4px' }} />
                              <span>Remanejar</span>
                            </button>

                            {onOpenPostModalWithPatient && (
                              <button
                                type="button"
                                onClick={() => onOpenPostModalWithPatient({
                                  name: (patient.name || '').toUpperCase(),
                                  patientName: (patient.name || '').toUpperCase(),
                                  room: selectedSalon,
                                  shift: selectedShift,
                                  point: pt.ponto,
                                  serialNumber: pt.serialNumber
                                })}
                                style={tabStyles.postTriggerBtn}
                                title="Abrir comunicado no mural"
                              >
                                <AlertTriangle size={13} style={{ marginRight: '4px' }} />
                                <span>Comunicado</span>
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Global Patient Search Modal */}
      {showSearchModal && (
        <div style={tabStyles.modalBackdrop}>
          <div style={tabStyles.modalCard}>
            <div style={tabStyles.modalHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Search size={18} color="#4f46e5" />
                <h3 style={tabStyles.modalHeading}>Localizar Paciente ou Máquina</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowSearchModal(false);
                  setSearchTerm('');
                  setSearchResults([]);
                }}
                style={tabStyles.modalCloseBtn}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '1rem', borderBottom: '1px solid #f1f5f9' }}>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Digite o nome do paciente ou número de série da máquina..."
                style={tabStyles.modalSearchInput}
                autoFocus
              />
            </div>

            <div style={tabStyles.modalSearchResultsList}>
              {searchResults.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#94a3b8', fontSize: '0.85rem' }}>
                  {searchTerm.trim() ? 'Nenhum paciente ou máquina localizada com este termo.' : 'Digite o nome do paciente para localizá-lo em qualquer salão e turno.'}
                </div>
              ) : (
                searchResults.map((res, i) => (
                  <div
                    key={i}
                    onClick={() => {
                      setSelectedSalon(res.salao);
                      setSelectedShift(res.turno);
                      setCadence(res.cadenceCode);
                      setShowSearchModal(false);
                      setSearchTerm('');
                    }}
                    style={tabStyles.searchResultItem}
                  >
                    <div>
                      <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: '700', color: '#1e293b' }}>
                        {res.patient.name ? res.patient.name.toUpperCase() : ''}
                      </h4>
                      <p style={{ margin: '3px 0 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                        <strong style={{ color: '#4f46e5' }}>{res.salao}</strong> • {res.turno} • {res.box} • <strong>Ponto {res.ponto}</strong> • {res.cadence}
                      </p>
                    </div>
                    <ChevronRight size={18} color="#94a3b8" />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reallocation Modal */}
      {showReallocateModal && selectedSlotForReallocate && (
        <div style={tabStyles.modalBackdrop}>
          <div style={{ ...tabStyles.modalCard, maxWidth: '520px' }}>
            <div style={tabStyles.modalHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ArrowRightLeft size={18} color="#4f46e5" />
                <h3 style={tabStyles.modalHeading}>
                  {selectedSlotForReallocate.currentPatient ? 'Remanejar' : 'Alocar'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowReallocateModal(false);
                  setSelectedSlotForReallocate(null);
                  setSelectedNewPatient(null);
                  setReallocatePatientTerm('');
                }}
                style={tabStyles.modalCloseBtn}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={tabStyles.infoBox}>
                <p style={{ margin: 0 }}><strong>Local:</strong> {selectedSalon} • {selectedShift} • {selectedSlotForReallocate.box} • Ponto {selectedSlotForReallocate.ponto}</p>
                <p style={{ margin: '4px 0 0 0' }}><strong>Cadência:</strong> {cadence === 'SQS' ? 'Segunda, Quarta e Sexta' : 'Terça, Quinta e Sábado'}</p>
                {selectedSlotForReallocate.currentPatient && (
                  <p style={{ margin: '4px 0 0 0' }}><strong>Paciente:</strong> {selectedSlotForReallocate.currentPatient.name ? selectedSlotForReallocate.currentPatient.name.toUpperCase() : ''}</p>
                )}
              </div>

              {selectedNewPatient?.isVacant ? (
                <div style={{
                  padding: '12px 14px',
                  borderRadius: '8px',
                  backgroundColor: '#fff1f2',
                  border: '2px dashed #fda4af',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <UserMinus size={18} color="#e11d48" />
                      <strong style={{ color: '#9f1239', fontSize: '0.88rem' }}>
                        Vaga Selecionada para Desocupação
                      </strong>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedNewPatient(null);
                        setReallocatePatientTerm('');
                      }}
                      style={{
                        border: '1px solid #fda4af',
                        backgroundColor: '#ffffff',
                        color: '#be123c',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        cursor: 'pointer'
                      }}
                    >
                      Desfazer
                    </button>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: '#be123c', lineHeight: 1.4 }}>
                    O paciente <strong>{selectedSlotForReallocate.currentPatient?.name ? selectedSlotForReallocate.currentPatient.name.toUpperCase() : ''}</strong> será desvinculado e o leito ficará <strong>VAGO</strong> ao clicar em Desocupar.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>
                      Paciente
                    </label>
                    <input
                      type="text"
                      value={reallocatePatientTerm}
                      onChange={(e) => {
                        const val = e.target.value;
                        setReallocatePatientTerm(val);
                        if (!val) {
                          setSelectedNewPatient(null);
                        }
                      }}
                      placeholder="Buscar paciente cadastrado..."
                      style={{ ...tabStyles.modalSearchInput, textTransform: 'uppercase' }}
                    />

                    {reallocatePatientTerm.trim() && !selectedNewPatient && (
                      <div style={tabStyles.dropdownList}>
                        {patients
                          .filter(p => (p.name || '').toLowerCase().includes(reallocatePatientTerm.toLowerCase()))
                          .slice(0, 8)
                          .map(p => (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => {
                                setSelectedNewPatient(p);
                                setReallocatePatientTerm((p.name || '').toUpperCase());
                              }}
                              style={tabStyles.dropdownItem}
                            >
                              <span style={{ fontWeight: '600' }}>{p.name ? p.name.toUpperCase() : ''}</span>
                              <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{p.accessType || 'FAV'}</span>
                            </button>
                          ))}
                      </div>
                    )}

                    {selectedNewPatient && !selectedNewPatient.isVacant && (
                      <div style={{
                        marginTop: '8px',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        backgroundColor: '#f0fdf4',
                        border: '1px solid #bbf7d0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '0.82rem',
                        color: '#15803d'
                      }}>
                        <div>
                          <span>Novo: <strong>{selectedNewPatient.name ? selectedNewPatient.name.toUpperCase() : ''}</strong></span>
                          <div style={{ fontSize: '0.72rem', color: '#166534' }}>{selectedNewPatient.accessType || 'FAV'}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedNewPatient(null);
                            setReallocatePatientTerm('');
                          }}
                          style={{
                            border: 'none',
                            background: 'none',
                            color: '#15803d',
                            fontWeight: '700',
                            cursor: 'pointer',
                            fontSize: '0.9rem'
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  </div>

                  {selectedSlotForReallocate.currentPatient && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedNewPatient({ name: '', isVacant: true });
                        setReallocatePatientTerm('');
                      }}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        border: '1px solid #fecdd3',
                        backgroundColor: '#fff1f2',
                        color: '#be123c',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        width: 'fit-content',
                        marginTop: '4px'
                      }}
                    >
                      <UserMinus size={14} />
                      <span>Desocupar</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            <div style={tabStyles.modalFooter}>
              <button
                type="button"
                onClick={() => {
                  setShowReallocateModal(false);
                  setSelectedSlotForReallocate(null);
                  setSelectedNewPatient(null);
                  setReallocatePatientTerm('');
                }}
                style={tabStyles.cancelBtn}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveReallocation}
                disabled={actionLoading || (!selectedNewPatient && !reallocatePatientTerm.trim())}
                style={{
                  ...tabStyles.confirmBtn,
                  backgroundColor: selectedNewPatient?.isVacant ? '#e11d48' : tabStyles.confirmBtn.backgroundColor,
                  opacity: (actionLoading || (!selectedNewPatient && !reallocatePatientTerm.trim())) ? 0.6 : 1,
                  cursor: (actionLoading || (!selectedNewPatient && !reallocatePatientTerm.trim())) ? 'not-allowed' : 'pointer'
                }}
              >
                {actionLoading ? 'Salvando...' : (selectedNewPatient?.isVacant ? 'Desocupar' : 'Confirmar')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Machine Maintenance Modal */}
      {showMachineModal && selectedMachine && (
        <div style={tabStyles.modalBackdrop}>
          <div style={{ ...tabStyles.modalCard, maxWidth: '500px' }}>
            <div style={tabStyles.modalHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Wrench size={18} color="#4f46e5" />
                <h3 style={tabStyles.modalHeading}>Ficha Técnica da Máquina</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowMachineModal(false);
                  setSelectedMachine(null);
                }}
                style={tabStyles.modalCloseBtn}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.85rem',
                backgroundColor: '#eef2ff',
                borderRadius: '10px',
                border: '1px solid #e0e7ff'
              }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '800', color: '#1e1b4b' }}>
                    {selectedMachine.name}
                  </h4>
                  <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: '#4338ca', fontFamily: 'monospace' }}>
                    Série: {selectedMachine.serialNumber}
                  </p>
                </div>
                <span style={{
                  padding: '4px 10px',
                  backgroundColor: '#dcfce7',
                  color: '#166534',
                  borderRadius: '20px',
                  fontSize: '0.75rem',
                  fontWeight: '700'
                }}>
                  {selectedMachine.status || 'Em Operação'}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div style={tabStyles.maintDetailCard}>
                  <span style={tabStyles.maintDetailLabel}>Marca / Modelo</span>
                  <span style={tabStyles.maintDetailVal}>{selectedMachine.brand || 'Nipro'} • {selectedMachine.model || 'DIAMAX 220F'}</span>
                </div>
                <div style={tabStyles.maintDetailCard}>
                  <span style={tabStyles.maintDetailLabel}>Setor Físico</span>
                  <span style={tabStyles.maintDetailVal}>{selectedMachine.sector || selectedSalon}</span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div style={tabStyles.maintDetailCard}>
                  <span style={tabStyles.maintDetailLabel}>Última Preventiva</span>
                  <span style={tabStyles.maintDetailVal}>{selectedMachine.lastPreventiveDate || '10/05/2026'}</span>
                </div>
                <div style={tabStyles.maintDetailCard}>
                  <span style={tabStyles.maintDetailLabel}>Próxima Preventiva</span>
                  <span style={tabStyles.maintDetailVal}>{selectedMachine.nextPreventiveDate || '10/08/2026'}</span>
                </div>
              </div>

              <div style={tabStyles.maintDetailCard}>
                <span style={tabStyles.maintDetailLabel}>Calibração & Observações</span>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.78rem', color: '#334155', lineHeight: 1.4 }}>
                  {selectedMachine.notes || 'Equipamento calibrado e conforme com o protocolo técnico de dialisato.'}
                </p>
              </div>
            </div>

            <div style={tabStyles.modalFooter}>
              <button
                type="button"
                onClick={() => {
                  setShowMachineModal(false);
                  setSelectedMachine(null);
                }}
                style={tabStyles.cancelBtn}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Edição de Acesso e Heparina */}
      {showEditPatientModal && selectedSlotForEdit && (
        <div style={tabStyles.modalBackdrop}>
          <div style={tabStyles.modalCard}>
            <div style={tabStyles.modalHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  backgroundColor: '#eff6ff',
                  color: '#2563eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 1px 3px rgba(37, 99, 235, 0.15)'
                }}>
                  <Pencil size={18} />
                </div>
                <div>
                  <h3 style={tabStyles.modalTitle}>Editar Escala</h3>
                  <span style={tabStyles.modalSubtitle}>
                    {selectedSlotForEdit.box} • Ponto {selectedSlotForEdit.ponto} • {selectedSalon} ({selectedShift})
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowEditPatientModal(false);
                  setSelectedSlotForEdit(null);
                }}
                style={tabStyles.modalCloseBtn}
              >
                ✕
              </button>
            </div>

            <div style={tabStyles.modalBody}>
              {/* Paciente Identificação */}
              <div style={{
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <div style={{ ...tabStyles.patientAvatar, width: '40px', height: '40px', fontSize: '1.05rem' }}>
                  {selectedSlotForEdit.patient.name ? selectedSlotForEdit.patient.name.charAt(0).toUpperCase() : '?'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: '800', color: '#0f172a', fontSize: '0.95rem', letterSpacing: '-0.01em' }}>
                    {selectedSlotForEdit.patient.name?.toUpperCase()}
                  </div>
                  {selectedSlotForEdit.patient.dn && (
                    <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
                      DN: {selectedSlotForEdit.patient.dn}
                      {calculateAge(null, selectedSlotForEdit.patient.dn) && (
                        <span style={{ color: '#475569', fontWeight: '600' }}> • {calculateAge(null, selectedSlotForEdit.patient.dn)}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Acesso Vascular */}
              <div>
                <label style={tabStyles.formLabel}>Acesso</label>
                <select
                  value={selectedSlotForEdit.accessType}
                  onChange={(e) => setSelectedSlotForEdit({ ...selectedSlotForEdit, accessType: e.target.value })}
                  style={tabStyles.modalSelect}
                >
                  <option value="Fístula Arteriovenosa">Fístula (FAV)</option>
                  <option value="Cateter Duplo Lúmen">Cateter (CDL)</option>
                  <option value="Permcath">Permcath</option>
                  <option value="Prótese">Prótese</option>
                </select>
              </div>

              {/* Calibre da Agulha (se FAV) */}
              {selectedSlotForEdit.accessType === 'Fístula Arteriovenosa' && (
                <div>
                  <label style={tabStyles.formLabel}>Agulha</label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    {['15', '16', '17'].map(size => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setSelectedSlotForEdit({ ...selectedSlotForEdit, needleSize: size })}
                        style={{
                          flex: 1,
                          padding: '10px',
                          borderRadius: '10px',
                          border: '1.5px solid',
                          borderColor: selectedSlotForEdit.needleSize === size ? '#059669' : '#cbd5e1',
                          backgroundColor: selectedSlotForEdit.needleSize === size ? '#ecfdf5' : '#ffffff',
                          color: selectedSlotForEdit.needleSize === size ? '#065f46' : '#475569',
                          fontWeight: selectedSlotForEdit.needleSize === size ? '800' : '600',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          fontSize: '0.88rem'
                        }}
                      >
                        Agulha {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Heparina */}
              <div>
                <label style={tabStyles.formLabel}>Heparina</label>
                <input
                  type="text"
                  placeholder="Ex: 1,5 ml, 2,0 ml, NA..."
                  value={selectedSlotForEdit.heparina}
                  onChange={(e) => setSelectedSlotForEdit({ ...selectedSlotForEdit, heparina: e.target.value })}
                  style={tabStyles.modalSearchInput}
                />
                {/* Sugestões rápidas de heparina */}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
                  {['0,5 ml', '1,0 ml', '1,5 ml', '1,8 ml', '2,0 ml', '2,5 ml', 'NA'].map(sug => (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => setSelectedSlotForEdit({ ...selectedSlotForEdit, heparina: sug })}
                      style={{
                        padding: '5px 11px',
                        borderRadius: '8px',
                        border: '1px solid',
                        borderColor: selectedSlotForEdit.heparina === sug ? '#2563eb' : '#bfdbfe',
                        backgroundColor: selectedSlotForEdit.heparina === sug ? '#2563eb' : '#eff6ff',
                        color: selectedSlotForEdit.heparina === sug ? '#ffffff' : '#1d4ed8',
                        fontSize: '0.78rem',
                        fontWeight: '700',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              </div>

              {/* Isolamento */}
              <div style={{
                backgroundColor: '#f8fafc',
                borderRadius: '10px',
                border: '1px solid #e2e8f0',
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <input
                  id="chk-isolation"
                  type="checkbox"
                  checked={selectedSlotForEdit.isolation}
                  onChange={(e) => setSelectedSlotForEdit({ ...selectedSlotForEdit, isolation: e.target.checked })}
                  style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#2563eb' }}
                />
                <label htmlFor="chk-isolation" style={{ fontSize: '0.85rem', fontWeight: '600', color: '#334155', cursor: 'pointer' }}>
                  Isolamento
                </label>
              </div>
            </div>

            <div style={tabStyles.modalFooter}>
              <button
                type="button"
                onClick={() => {
                  setShowEditPatientModal(false);
                  setSelectedSlotForEdit(null);
                }}
                style={tabStyles.cancelBtn}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveEditPatient}
                disabled={actionLoading}
                style={{
                  ...tabStyles.confirmBtn,
                  backgroundColor: '#2563eb',
                  opacity: actionLoading ? 0.7 : 1,
                  cursor: actionLoading ? 'not-allowed' : 'pointer'
                }}
              >
                {actionLoading ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Patient Lab Exams Modal */}
      {showLabsModal && selectedPatientForLabs && (
        <div style={tabStyles.modalBackdrop} onClick={() => setShowLabsModal(false)}>
          <div
            style={{
              ...tabStyles.modalCard,
              maxWidth: '920px',
              maxHeight: '92vh',
              display: 'flex',
              flexDirection: 'column'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={tabStyles.modalHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #06b6d4, #0891b2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  boxShadow: '0 4px 10px rgba(8, 145, 178, 0.3)'
                }}>
                  <Activity size={22} />
                </div>
                <div>
                  <h3 style={tabStyles.modalHeading}>
                    {selectedPatientForLabs.name ? selectedPatientForLabs.name.toUpperCase() : 'PACIENTE'}
                  </h3>
                  <span style={tabStyles.modalSubtitle}>
                    {selectedPatientForLabs.dn ? `DN: ${selectedPatientForLabs.dn}` : ''}
                    {selectedPatientForLabs.patientCpf ? ` • CPF: ${selectedPatientForLabs.patientCpf}` : ''}
                    {selectedPatientForLabs.chartNumber ? ` • Prontuário: ${selectedPatientForLabs.chartNumber}` : ''}
                    {` • ${selectedSalon} • ${selectedShift}`}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowLabsModal(false);
                  setSelectedPatientForLabs(null);
                  setPatientLabsList([]);
                }}
                style={tabStyles.modalCloseBtn}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '1.25rem 1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {loadingLabs ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                  <RefreshCw size={24} className="spin" style={{ marginBottom: '8px', color: '#0891b2' }} />
                  <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: '600' }}>Carregando exames laboratoriais do paciente...</p>
                </div>
              ) : patientLabsList.length === 0 ? (
                <div style={{
                  padding: '2.5rem',
                  textAlign: 'center',
                  backgroundColor: '#f8fafc',
                  borderRadius: '12px',
                  border: '1px dashed #cbd5e1'
                }}>
                  <FlaskConical size={36} color="#94a3b8" style={{ marginBottom: '8px' }} />
                  <h4 style={{ margin: 0, color: '#334155', fontSize: '1rem', fontWeight: '700' }}>Nenhum Exame Encontrado</h4>
                  <p style={{ margin: '6px 0 0 0', color: '#64748b', fontSize: '0.85rem' }}>
                    Não foram localizados registros laboratoriais para este paciente nos arquivos dos últimos 4 meses.
                  </p>
                </div>
              ) : (() => {
                const activeExam = patientLabsList.find(e => e.month === selectedLabsMonth) || patientLabsList[0];
                const k = activeExam?.potassium;
                const p = activeExam?.phosphorus;
                const hb = activeExam?.hemoglobin;
                const ktv = activeExam?.ktv;
                const ca = activeExam?.calcium;
                const ht = activeExam?.hematocrit;
                const alb = activeExam?.albumin;
                const cr = activeExam?.creatinine;
                const na = activeExam?.sodium;
                const fer = activeExam?.ferritin;
                const sat = activeExam?.transferrinSat;
                const pth = activeExam?.pth;
                const pre = activeExam?.ureaPre;
                const pos = activeExam?.ureaPost;
                const urr = activeExam?.urr;

                // Alerts
                const alerts = [];
                if (k !== null && k !== undefined) {
                  if (k > 5.5) alerts.push({ text: `Potássio Elevado (${k} mEq/L) - Risco de arritmia`, type: 'danger' });
                  else if (k < 3.5) alerts.push({ text: `Potássio Baixo (${k} mEq/L) - Hipocalemia`, type: 'warning' });
                }
                if (p !== null && p !== undefined && p > 5.5) {
                  alerts.push({ text: `Fósforo Elevado (${p} mg/dL) - Avaliar quelantes`, type: 'warning' });
                }
                if (hb !== null && hb !== undefined && hb < 10.0) {
                  alerts.push({ text: `Hemoglobina Baixa (${hb} g/dL) - Anemia`, type: 'danger' });
                }
                if (ktv !== null && ktv !== undefined && ktv < 1.20) {
                  alerts.push({ text: `Adequação Subótima (Kt/V ${ktv}) - Meta ≥ 1.20`, type: 'warning' });
                }

                return (
                  <>
                    {/* Month Selector Tabs */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {patientLabsList.map(item => {
                          const isSel = item.month === activeExam.month;
                          const [y, m] = (item.month || '').split('-');
                          const monthNames = { '08': 'Agosto', '09': 'Setembro', '10': 'Outubro', '11': 'Novembro' };
                          const label = `${monthNames[m] || m}/${y || ''}`;
                          return (
                            <button
                              key={item.month || item.id}
                              type="button"
                              onClick={() => setSelectedLabsMonth(item.month)}
                              style={{
                                padding: '6px 14px',
                                borderRadius: '8px',
                                fontSize: '0.82rem',
                                fontWeight: isSel ? '700' : '500',
                                backgroundColor: isSel ? '#0891b2' : '#f1f5f9',
                                color: isSel ? '#ffffff' : '#475569',
                                border: isSel ? '1px solid #0891b2' : '1px solid #e2e8f0',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease'
                              }}
                            >
                              {label}
                            </button>
                          );
                        })}
                      </div>

                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                        <span>Coleta: <strong>{activeExam.date ? activeExam.date.split('-').reverse().join('/') : '-'}</strong></span>
                        {activeExam.doctorName && (
                          <span style={{ marginLeft: '8px' }}>• {activeExam.doctorName} (CRM {activeExam.doctorCrm || '-'})</span>
                        )}
                      </div>
                    </div>

                    {/* Critical Alerts Banner */}
                    {alerts.length > 0 ? (
                      <div style={{
                        padding: '10px 14px',
                        borderRadius: '10px',
                        backgroundColor: '#fff1f2',
                        border: '1px solid #fecdd3',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#be123c', fontWeight: '700', fontSize: '0.83rem' }}>
                          <AlertTriangle size={15} />
                          <span>Alertas Clínicos</span>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '2px' }}>
                          {alerts.map((al, idx) => (
                            <span
                              key={idx}
                              style={{
                                fontSize: '0.76rem',
                                fontWeight: '600',
                                padding: '2px 8px',
                                borderRadius: '6px',
                                backgroundColor: al.type === 'danger' ? '#ffe4e6' : '#fef3c7',
                                color: al.type === 'danger' ? '#9f1239' : '#92400e',
                                border: al.type === 'danger' ? '1px solid #fca5a5' : '1px solid #fde68a'
                              }}
                            >
                              {al.text}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div style={{
                        padding: '8px 12px',
                        borderRadius: '8px',
                        backgroundColor: '#f0fdf4',
                        border: '1px solid #bbf7d0',
                        color: '#166534',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        <CheckCircle2 size={14} color="#16a34a" />
                        <span>Parâmetros de diálise dentro das metas clínicas estabelecidas.</span>
                      </div>
                    )}

                    {/* 6 Key Nephrology Metric Cards Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
                      {/* Potássio */}
                      <div style={{
                        padding: '12px',
                        borderRadius: '12px',
                        backgroundColor: k > 5.5 ? '#fff1f2' : k < 3.5 ? '#fffbeb' : '#f8fafc',
                        border: `1px solid ${k > 5.5 ? '#fecdd3' : k < 3.5 ? '#fde68a' : '#e2e8f0'}`
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Potássio</span>
                          <span style={{
                            fontSize: '0.7rem',
                            fontWeight: '700',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            backgroundColor: k > 5.5 ? '#ffe4e6' : k < 3.5 ? '#fef3c7' : '#dcfce7',
                            color: k > 5.5 ? '#9f1239' : k < 3.5 ? '#92400e' : '#166534'
                          }}>
                            {k > 5.5 ? 'Elevado' : k < 3.5 ? 'Baixo' : 'Meta'}
                          </span>
                        </div>
                        <div style={{ fontSize: '1.35rem', fontWeight: '800', color: k > 5.5 ? '#e11d48' : '#0f172a', margin: '4px 0' }}>
                          K: {k !== null && k !== undefined ? `${k}` : '-'} • Na: {na !== null && na !== undefined ? `${na}` : '-'}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Metas: K 3.5-5.5 • Na 135-145 mEq/L</div>
                      </div>

                      {/* Fósforo & Cálcio */}
                      <div style={{
                        padding: '12px',
                        borderRadius: '12px',
                        backgroundColor: p > 5.5 ? '#fff1f2' : '#f8fafc',
                        border: `1px solid ${p > 5.5 ? '#fecdd3' : '#e2e8f0'}`
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Fósforo & Cálcio</span>
                          <span style={{
                            fontSize: '0.7rem',
                            fontWeight: '700',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            backgroundColor: p > 5.5 ? '#ffe4e6' : '#dcfce7',
                            color: p > 5.5 ? '#9f1239' : '#166534'
                          }}>
                            {p > 5.5 ? 'Fósforo Alto' : 'Meta'}
                          </span>
                        </div>
                        <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', margin: '4px 0' }}>
                          P: {p !== null && p !== undefined ? `${p} mg/dL` : '-'} • Ca: {ca !== null && ca !== undefined ? `${ca}` : '-'}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Metas: P 3.5-5.5 • Ca 8.5-10.2 mg/dL</div>
                      </div>

                      {/* Hemoglobina & Hematócrito */}
                      <div style={{
                        padding: '12px',
                        borderRadius: '12px',
                        backgroundColor: hb < 10.0 ? '#fff1f2' : '#f8fafc',
                        border: `1px solid ${hb < 10.0 ? '#fecdd3' : '#e2e8f0'}`
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Hemoglobina</span>
                          <span style={{
                            fontSize: '0.7rem',
                            fontWeight: '700',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            backgroundColor: hb < 10.0 ? '#ffe4e6' : '#dcfce7',
                            color: hb < 10.0 ? '#9f1239' : '#166534'
                          }}>
                            {hb < 10.0 ? 'Anemia' : 'Meta'}
                          </span>
                        </div>
                        <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', margin: '4px 0' }}>
                          Hb: {hb !== null && hb !== undefined ? `${hb} g/dL` : '-'} • Ht: {ht !== null && ht !== undefined ? `${ht}%` : '-'}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Meta: Hb 10.0 a 12.0 g/dL</div>
                      </div>

                      {/* Adequação de Diálise (Kt/V & URR) */}
                      <div style={{
                        padding: '12px',
                        borderRadius: '12px',
                        backgroundColor: ktv < 1.20 ? '#fffbeb' : '#f8fafc',
                        border: `1px solid ${ktv < 1.20 ? '#fde68a' : '#e2e8f0'}`
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Adequação (Kt/V)</span>
                          <span style={{
                            fontSize: '0.7rem',
                            fontWeight: '700',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            backgroundColor: ktv >= 1.20 ? '#dcfce7' : '#fef3c7',
                            color: ktv >= 1.20 ? '#166534' : '#92400e'
                          }}>
                            {ktv >= 1.20 ? 'Adequado' : 'Subótimo'}
                          </span>
                        </div>
                        <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', margin: '4px 0' }}>
                          Kt/V: {ktv !== null && ktv !== undefined ? `${ktv}` : '-'} • URR: {urr !== null && urr !== undefined ? `${urr}%` : '-'}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                          Ureia Pré: {pre || '-'} • Pós: {pos || '-'} mg/dL (Meta Kt/V ≥ 1.20)
                        </div>
                      </div>

                      {/* Albumina & Creatinina */}
                      <div style={{
                        padding: '12px',
                        borderRadius: '12px',
                        backgroundColor: alb && alb < 3.8 ? '#fffbeb' : '#f8fafc',
                        border: `1px solid ${alb && alb < 3.8 ? '#fde68a' : '#e2e8f0'}`
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Albumina & Creatinina</span>
                          {alb && (
                            <span style={{
                              fontSize: '0.7rem',
                              fontWeight: '700',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              backgroundColor: alb >= 3.8 ? '#dcfce7' : '#fef3c7',
                              color: alb >= 3.8 ? '#166534' : '#92400e'
                            }}>
                              {alb >= 3.8 ? 'Nutrido' : 'Atenção'}
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', margin: '4px 0' }}>
                          Alb: {alb !== null && alb !== undefined ? `${alb} g/dL` : '-'} • Cr: {cr !== null && cr !== undefined ? `${cr} mg/dL` : '-'}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Meta Albumina: ≥ 3.8 g/dL</div>
                      </div>

                      {/* Cinética do Ferro & PTH */}
                      <div style={{
                        padding: '12px',
                        borderRadius: '12px',
                        backgroundColor: '#f8fafc',
                        border: '1px solid #e2e8f0'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Cinética do Ferro & PTH</span>
                          {pth && (
                            <span style={{
                              fontSize: '0.7rem',
                              fontWeight: '700',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              backgroundColor: '#f1f5f9',
                              color: '#334155'
                            }}>
                              PTH
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0f172a', margin: '4px 0' }}>
                          Fer: {fer || '-'} • Sat: {sat ? `${sat}%` : '-'} • PTH: {pth || '-'}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                          Metas: Ferritina 200-800 ng/mL • Sat 20-50%
                        </div>
                      </div>
                    </div>

                    {/* Sorologias */}
                    <div style={{
                      padding: '10px 14px',
                      borderRadius: '10px',
                      backgroundColor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '8px'
                    }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#334155', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <ShieldAlert size={14} color="#64748b" />
                        <span>Sorologias Infecciosas:</span>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{
                          fontSize: '0.75rem',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          backgroundColor: activeExam.hiv === 'Não Reagente' ? '#ecfdf5' : '#fee2e2',
                          color: activeExam.hiv === 'Não Reagente' ? '#047857' : '#991b1b',
                          fontWeight: '600'
                        }}>
                          HIV: {activeExam.hiv || 'Pendente'}
                        </span>
                        <span style={{
                          fontSize: '0.75rem',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          backgroundColor: activeExam.hcv === 'Não Reagente' ? '#ecfdf5' : '#fee2e2',
                          color: activeExam.hcv === 'Não Reagente' ? '#047857' : '#991b1b',
                          fontWeight: '600'
                        }}>
                          HCV: {activeExam.hcv || 'Pendente'}
                        </span>
                        <span style={{
                          fontSize: '0.75rem',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          backgroundColor: activeExam.hbsag === 'Não Reagente' ? '#ecfdf5' : '#fee2e2',
                          color: activeExam.hbsag === 'Não Reagente' ? '#047857' : '#991b1b',
                          fontWeight: '600'
                        }}>
                          HBsAg: {activeExam.hbsag || 'Pendente'}
                        </span>
                        <span style={{
                          fontSize: '0.75rem',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          backgroundColor: '#ecfdf5',
                          color: '#047857',
                          fontWeight: '600'
                        }}>
                          Anti-HBs: {activeExam.antiHbs || 'Pendente'}
                        </span>
                      </div>
                    </div>

                    {/* Comparative Evolution Table (4 Months) */}
                    <div>
                      <h4 style={{ margin: '6px 0 8px 0', fontSize: '0.88rem', fontWeight: '700', color: '#1e293b' }}>
                        Evolução Laboratorial Comparativa (Últimos Meses)
                      </h4>
                      <div style={{ overflowX: 'auto', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
                          <thead>
                            <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #cbd5e1' }}>
                              <th style={{ padding: '8px 10px', fontWeight: '700', color: '#475569' }}>Mês</th>
                              <th style={{ padding: '8px 10px', fontWeight: '700', color: '#475569' }}>Data</th>
                              <th style={{ padding: '8px 10px', fontWeight: '700', color: '#475569' }}>Kt/V</th>
                              <th style={{ padding: '8px 10px', fontWeight: '700', color: '#475569' }}>Potássio</th>
                              <th style={{ padding: '8px 10px', fontWeight: '700', color: '#475569' }}>Fósforo</th>
                              <th style={{ padding: '8px 10px', fontWeight: '700', color: '#475569' }}>Cálcio</th>
                              <th style={{ padding: '8px 10px', fontWeight: '700', color: '#475569' }}>Hb</th>
                              <th style={{ padding: '8px 10px', fontWeight: '700', color: '#475569' }}>Ht</th>
                              <th style={{ padding: '8px 10px', fontWeight: '700', color: '#475569' }}>Ureia Pré</th>
                              <th style={{ padding: '8px 10px', fontWeight: '700', color: '#475569' }}>Ureia Pós</th>
                              <th style={{ padding: '8px 10px', fontWeight: '700', color: '#475569' }}>Albumina</th>
                            </tr>
                          </thead>
                          <tbody>
                            {patientLabsList.map(row => {
                              const [y, m] = (row.month || '').split('-');
                              const monthNames = { '08': 'Agosto', '09': 'Setembro', '10': 'Outubro', '11': 'Novembro' };
                              const monthLabel = `${monthNames[m] || m}/${y ? y.substring(2) : ''}`;
                              return (
                                <tr key={row.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                  <td style={{ padding: '8px 10px', fontWeight: '700', color: '#0891b2' }}>{monthLabel}</td>
                                  <td style={{ padding: '8px 10px', color: '#64748b' }}>{row.date ? row.date.split('-').reverse().join('/') : '-'}</td>
                                  <td style={{
                                    padding: '8px 10px',
                                    fontWeight: '700',
                                    color: row.ktv >= 1.20 ? '#166534' : row.ktv ? '#b45309' : '#64748b'
                                  }}>
                                    {row.ktv || '-'}
                                  </td>
                                  <td style={{
                                    padding: '8px 10px',
                                    fontWeight: '700',
                                    color: row.potassium > 5.5 ? '#b91c1c' : row.potassium < 3.5 ? '#b45309' : '#166534'
                                  }}>
                                    {row.potassium ? `${row.potassium}` : '-'}
                                  </td>
                                  <td style={{
                                    padding: '8px 10px',
                                    fontWeight: '700',
                                    color: row.phosphorus > 5.5 ? '#b91c1c' : '#166534'
                                  }}>
                                    {row.phosphorus ? `${row.phosphorus}` : '-'}
                                  </td>
                                  <td style={{ padding: '8px 10px' }}>{row.calcium || '-'}</td>
                                  <td style={{
                                    padding: '8px 10px',
                                    fontWeight: '700',
                                    color: row.hemoglobin < 10.0 ? '#b91c1c' : '#166534'
                                  }}>
                                    {row.hemoglobin || '-'}
                                  </td>
                                  <td style={{ padding: '8px 10px' }}>{row.hematocrit ? `${row.hematocrit}%` : '-'}</td>
                                  <td style={{ padding: '8px 10px' }}>{row.ureaPre || '-'}</td>
                                  <td style={{ padding: '8px 10px' }}>{row.ureaPost || '-'}</td>
                                  <td style={{ padding: '8px 10px' }}>{row.albumin || '-'}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>

            {/* Modal Footer */}
            <div style={tabStyles.modalFooter}>
              <button
                type="button"
                onClick={() => {
                  setShowLabsModal(false);
                  setSelectedPatientForLabs(null);
                  setPatientLabsList([]);
                }}
                style={tabStyles.cancelBtn}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const tabStyles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
    width: '100%'
  },
  alertToast: {
    padding: '0.85rem 1.25rem',
    borderRadius: '10px',
    color: '#ffffff',
    fontSize: '0.88rem',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
  },
  toastCloseBtn: {
    background: 'none',
    border: 'none',
    color: '#ffffff',
    fontSize: '1.2rem',
    cursor: 'pointer'
  },
  filterCard: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '1.25rem',
    border: '1px solid #e2e8f0',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  filterTopRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '1rem'
  },
  filterGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  filterLabel: {
    fontSize: '0.78rem',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: '#475569',
    display: 'flex',
    alignItems: 'center'
  },
  pillContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    flexWrap: 'wrap'
  },
  pillBtn: {
    padding: '7px 14px',
    borderRadius: '10px',
    fontSize: '0.85rem',
    border: '1px solid',
    cursor: 'pointer',
    transition: 'all 0.15s ease'
  },
  actionBtnsGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  searchOpenBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 14px',
    borderRadius: '10px',
    fontSize: '0.85rem',
    fontWeight: '600',
    backgroundColor: '#f1f5f9',
    color: '#334155',
    border: '1px solid #cbd5e1',
    cursor: 'pointer'
  },
  printBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 14px',
    borderRadius: '10px',
    fontSize: '0.85rem',
    fontWeight: '600',
    backgroundColor: '#1e293b',
    color: '#ffffff',
    border: 'none',
    cursor: 'pointer'
  },
  cadenceRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '0.75rem',
    paddingTop: '0.75rem',
    borderTop: '1px solid #f1f5f9'
  },
  cadenceLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flexWrap: 'wrap'
  },
  cadenceBtn: {
    padding: '6px 14px',
    borderRadius: '8px',
    fontSize: '0.82rem',
    border: '1px solid',
    cursor: 'pointer',
    transition: 'all 0.15s ease'
  },
  activeBadgeIndicator: {
    fontSize: '0.78rem',
    fontWeight: '600',
    color: '#64748b',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  liveDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#10b981'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
    gap: '0.5rem',
    width: '100%',
    alignItems: 'stretch'
  },
  statCard: {
    backgroundColor: '#ffffff',
    borderRadius: '10px',
    padding: '0.65rem 0.75rem',
    border: '1px solid #e2e8f0',
    boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    minWidth: 0
  },
  statLabel: {
    fontSize: '0.68rem',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.03em',
    color: '#475569',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  statValueRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '4px',
    marginTop: '3px',
    flexWrap: 'nowrap',
    overflow: 'hidden'
  },
  statNumber: {
    fontSize: '1.25rem',
    fontWeight: '900',
    color: '#1e293b',
    lineHeight: 1.1
  },
  statSub: {
    fontSize: '0.7rem',
    color: '#475569',
    whiteSpace: 'nowrap'
  },
  needlePill: {
    fontSize: '0.62rem',
    fontWeight: '700',
    padding: '1px 4px',
    backgroundColor: '#ecfdf5',
    color: '#065f46',
    borderRadius: '4px',
    border: '1px solid #a7f3d0'
  },
  loadingBox: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '3rem',
    textAlign: 'center',
    border: '1px solid #e2e8f0',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  },
  boxWrapper: {
    backgroundColor: '#f8fafc',
    borderRadius: '16px',
    padding: '1.15rem',
    border: '1px solid #e2e8f0',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.85rem'
  },
  boxHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  boxTag: {
    padding: '4px 10px',
    borderRadius: '8px',
    fontSize: '0.78rem',
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: '0.04em'
  },
  pointsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))',
    gap: '0.85rem'
  },
  pointCard: {
    borderRadius: '12px',
    padding: '0.85rem 1rem',
    borderWidth: '1px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    transition: 'all 0.15s ease',
    boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
  },
  pointHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: '6px',
    borderBottom: '1px solid #f1f5f9'
  },
  pointNumBadge: {
    padding: '2px 7px',
    backgroundColor: '#f1f5f9',
    color: '#1e293b',
    borderRadius: '6px',
    fontSize: '0.75rem',
    fontWeight: '800'
  },
  serialBtn: {
    border: 'none',
    background: 'none',
    fontSize: '0.72rem',
    fontWeight: '700',
    color: '#4f46e5',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    padding: 0
  },
  maintStatusPill: {
    fontSize: '0.68rem',
    fontWeight: '700',
    padding: '2px 7px',
    borderRadius: '12px',
    border: '1px solid',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center'
  },
  patientAvatar: {
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    backgroundColor: '#e0e7ff',
    color: '#4338ca',
    fontSize: '0.8rem',
    fontWeight: '800',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  patientName: {
    margin: 0,
    fontSize: '0.82rem',
    fontWeight: '700',
    color: '#0f172a',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    textTransform: 'uppercase'
  },
  accessFAV: {
    fontSize: '0.68rem',
    fontWeight: '700',
    padding: '2px 7px',
    borderRadius: '6px',
    backgroundColor: '#ecfdf5',
    color: '#065f46',
    border: '1px solid #a7f3d0'
  },
  accessCDL: {
    fontSize: '0.68rem',
    fontWeight: '700',
    padding: '2px 7px',
    borderRadius: '6px',
    backgroundColor: '#fffbeb',
    color: '#92400e',
    border: '1px solid #fde68a'
  },
  accessPermcath: {
    fontSize: '0.68rem',
    fontWeight: '700',
    padding: '2px 7px',
    borderRadius: '6px',
    backgroundColor: '#faf5ff',
    color: '#6b21a8',
    border: '1px solid #e9d5ff'
  },
  accessIsolation: {
    fontSize: '0.68rem',
    fontWeight: '700',
    padding: '2px 7px',
    borderRadius: '6px',
    backgroundColor: '#ffe4e6',
    color: '#9f1239',
    border: '1px solid #fecdd3',
    display: 'inline-flex',
    alignItems: 'center'
  },
  accessHCV: {
    fontSize: '0.68rem',
    fontWeight: '700',
    padding: '2px 7px',
    borderRadius: '6px',
    backgroundColor: '#ffedd5',
    color: '#9a3412',
    border: '1px solid #fed7aa'
  },
  vacantPill: {
    display: 'inline-flex',
    alignItems: 'center',
    fontSize: '0.78rem',
    fontWeight: '700',
    color: '#047857',
    backgroundColor: '#d1fae5',
    padding: '3px 10px',
    borderRadius: '8px'
  },
  pointFooter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: '6px',
    borderTop: '1px solid #f1f5f9'
  },
  allocateBtn: {
    width: '100%',
    padding: '6px',
    borderRadius: '8px',
    backgroundColor: '#059669',
    color: '#ffffff',
    fontSize: '0.75rem',
    fontWeight: '700',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  reallocateBtn: {
    border: 'none',
    background: 'none',
    color: '#475569',
    fontSize: '0.72rem',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    padding: '2px 4px'
  },
  postTriggerBtn: {
    border: 'none',
    background: 'none',
    color: '#e11d48',
    fontSize: '0.72rem',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    padding: '2px 4px'
  },
  modalBackdrop: {
    position: 'fixed',
    inset: 0,
    zIndex: 9999,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1rem'
  },
  modalCard: {
    backgroundColor: '#ffffff',
    width: '100%',
    maxWidth: '560px',
    borderRadius: '16px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    maxHeight: '85vh'
  },
  modalHeader: {
    padding: '1.25rem 1.75rem',
    borderBottom: '1px solid #e2e8f0',
    backgroundColor: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  modalHeading: {
    margin: 0,
    fontSize: '1.05rem',
    fontWeight: '800',
    color: '#1e293b'
  },
  modalTitle: {
    margin: 0,
    fontSize: '1.05rem',
    fontWeight: '800',
    color: '#1e293b'
  },
  modalSubtitle: {
    fontSize: '0.78rem',
    color: '#64748b',
    display: 'block',
    marginTop: '2px'
  },
  modalBody: {
    padding: '1.5rem 1.75rem',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.2rem'
  },
  modalCloseBtn: {
    background: 'none',
    border: 'none',
    color: '#94a3b8',
    cursor: 'pointer',
    padding: '4px',
    fontSize: '1.1rem',
    lineHeight: 1
  },
  modalSearchInput: {
    width: '100%',
    padding: '10px 14px',
    borderRadius: '10px',
    border: '1px solid #cbd5e1',
    backgroundColor: '#f8fafc',
    fontSize: '0.88rem',
    outline: 'none',
    boxSizing: 'border-box'
  },
  modalSearchResultsList: {
    flex: 1,
    overflowY: 'auto',
    padding: '0.75rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  searchResultItem: {
    padding: '10px 12px',
    backgroundColor: '#f8fafc',
    borderRadius: '10px',
    border: '1px solid #e2e8f0',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    transition: 'all 0.15s ease'
  },
  infoBox: {
    padding: '10px 12px',
    backgroundColor: '#f8fafc',
    borderRadius: '10px',
    border: '1px solid #e2e8f0',
    fontSize: '0.8rem',
    color: '#334155'
  },
  dropdownList: {
    marginTop: '6px',
    maxHeight: '160px',
    overflowY: 'auto',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    backgroundColor: '#ffffff',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
  },
  dropdownItem: {
    width: '100%',
    textAlign: 'left',
    padding: '8px 12px',
    border: 'none',
    borderBottom: '1px solid #f1f5f9',
    backgroundColor: '#ffffff',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '0.8rem'
  },
  modalFooter: {
    padding: '1rem 1.75rem',
    borderTop: '1px solid #e2e8f0',
    backgroundColor: '#f8fafc',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px'
  },
  cancelBtn: {
    padding: '8px 16px',
    borderRadius: '10px',
    fontSize: '0.85rem',
    fontWeight: '600',
    backgroundColor: '#e2e8f0',
    color: '#475569',
    border: 'none',
    cursor: 'pointer'
  },
  confirmBtn: {
    padding: '8px 20px',
    borderRadius: '10px',
    fontSize: '0.85rem',
    fontWeight: '700',
    backgroundColor: '#4f46e5',
    color: '#ffffff',
    border: 'none',
    cursor: 'pointer'
  },
  maintDetailCard: {
    padding: '8px 10px',
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    border: '1px solid #e2e8f0'
  },
  maintDetailLabel: {
    display: 'block',
    fontSize: '0.68rem',
    fontWeight: '700',
    textTransform: 'uppercase',
    color: '#64748b'
  },
  maintDetailVal: {
    display: 'block',
    fontSize: '0.8rem',
    fontWeight: '600',
    color: '#1e293b',
    marginTop: '2px'
  },
  accessHeparina: {
    fontSize: '0.68rem',
    fontWeight: '700',
    padding: '2px 7px',
    borderRadius: '6px',
    backgroundColor: '#eff6ff',
    color: '#1d4ed8',
    border: '1px solid #bfdbfe',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '3px'
  },
  accessHeparinaEmpty: {
    fontSize: '0.68rem',
    fontWeight: '600',
    padding: '2px 7px',
    borderRadius: '6px',
    backgroundColor: '#f8fafc',
    color: '#94a3b8',
    border: '1px dashed #cbd5e1',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '3px',
    cursor: 'pointer'
  },
  patientClickableArea: {
    cursor: 'pointer',
    borderRadius: '8px',
    padding: '4px',
    transition: 'background-color 0.15s ease'
  },
  editParamBtn: {
    border: 'none',
    background: 'none',
    color: '#2563eb',
    fontSize: '0.72rem',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    padding: '2px 4px'
  },
  labsBtn: {
    border: 'none',
    background: 'none',
    color: '#0891b2',
    fontSize: '0.72rem',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    padding: '2px 4px'
  },
  modalSelect: {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '10px',
    border: '1px solid #cbd5e1',
    fontSize: '0.88rem',
    backgroundColor: '#ffffff',
    color: '#1e293b',
    outline: 'none'
  },
  formLabel: {
    display: 'block',
    fontSize: '0.8rem',
    fontWeight: '700',
    color: '#475569',
    marginBottom: '6px'
  }
};
