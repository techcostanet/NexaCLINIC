import React, { useState, useEffect, useMemo } from 'react';
import { dbService } from '../../firebase';
import { 
  Calendar, Search, Filter, Printer, User, Activity, AlertTriangle, 
  CheckCircle2, RefreshCw, ArrowRightLeft, ShieldAlert, Cpu, 
  MapPin, Clock, Plus, X, ChevronRight, Eye, Wrench, HeartPulse,
  Sparkles, Layers, Info
} from 'lucide-react';

export default function DialysisScheduleTab({ currentUser, onOpenPostModalWithPatient }) {
  // Navigation State
  const [selectedSalon, setSelectedSalon] = useState('Salão 01');
  const [selectedShift, setSelectedShift] = useState('1º Turno');
  const [cadence, setCadence] = useState('SQS'); // 'SQS' (Seg/Qua/Sex) | 'TQS' (Ter/Qui/Sáb)
  const [selectedDay, setSelectedDay] = useState('all'); // 'all' or 'segunda', 'terca', etc.

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

  // Set default cadence based on today's day of week
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

  // Group points by Box
  const groupedBoxes = useMemo(() => {
    if (!scheduleData || !scheduleData.points) return {};
    const boxes = {};
    scheduleData.points.forEach(point => {
      const bName = point.box || 'Box Geral';
      if (!boxes[bName]) boxes[bName] = [];
      boxes[bName].push(point);
    });
    return boxes;
  }, [scheduleData]);

  // Equipment lookup map
  const equipmentMap = useMemo(() => {
    const map = new Map();
    equipments.forEach(eq => {
      if (eq.serialNumber) {
        map.set(eq.serialNumber.trim().toUpperCase(), eq);
      }
    });
    return map;
  }, [equipments]);

  // Operational metrics
  const metrics = useMemo(() => {
    if (!dbService.calculateScheduleMetrics) return {};
    return dbService.calculateScheduleMetrics(scheduleData, cadence);
  }, [scheduleData, cadence]);

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
        lastPreventiveDate: '2026-05-10',
        nextPreventiveDate: '2026-08-10',
        calibrationValidUntil: '2026-12-31',
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
      if (selectedNewPatient) {
        patientToSave = {
          name: selectedNewPatient.name,
          dn: selectedNewPatient.birthDate ? selectedNewPatient.birthDate.split('-').reverse().join('/') : '',
          accessType: selectedNewPatient.accessType || 'Fístula Arteriovenosa',
          needleSize: selectedNewPatient.needleSize || '16',
          isolation: selectedNewPatient.isolation || null
        };
      }

      await dbService.updatePointPatient(
        selectedSalon,
        selectedShift,
        selectedSlotForReallocate.pointId,
        cadence,
        patientToSave
      );

      setMessage({ text: 'Escala atualizada com sucesso!', type: 'success' });
      setShowReallocateModal(false);
      setSelectedSlotForReallocate(null);
      setSelectedNewPatient(null);
      loadSchedule();
    } catch (err) {
      console.error(err);
      setMessage({ text: 'Erro ao atualizar escala', type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  // Print Handler
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Notification */}
      {message.text && (
        <div className={`p-4 rounded-xl flex items-center justify-between text-sm shadow-sm transition-all duration-300 ${
          message.type === 'success' 
            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
            : 'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          <div className="flex items-center gap-2">
            {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <AlertTriangle className="w-5 h-5 text-rose-600" />}
            <span className="font-semibold">{message.text}</span>
          </div>
          <button onClick={() => setMessage({ text: '', type: '' })} className="p-1 hover:bg-black/5 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Control Navigation & Filter Bar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-4 print:hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Salão Selector */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 mr-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" /> Salão
            </span>
            {['Salão 01', 'Salão 02', 'Salão 03'].map(sal => (
              <button
                key={sal}
                onClick={() => setSelectedSalon(sal)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 whitespace-nowrap shadow-xs ${
                  selectedSalon === sal
                    ? 'bg-indigo-600 text-white shadow-indigo-200 ring-2 ring-indigo-600 ring-offset-2'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {sal}
              </button>
            ))}
          </div>

          {/* Turno Selector */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 mr-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Turno
            </span>
            {['1º Turno', '2º Turno', '3º Turno'].map(tur => (
              <button
                key={tur}
                onClick={() => setSelectedShift(tur)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 whitespace-nowrap shadow-xs ${
                  selectedShift === tur
                    ? 'bg-cyan-600 text-white shadow-cyan-200 ring-2 ring-cyan-600 ring-offset-2'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tur}
              </button>
            ))}
          </div>

          {/* Actions: Search & Print */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSearchModal(true)}
              className="flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition-colors shadow-xs"
              title="Buscar Paciente ou Máquina em todos os Salões"
            >
              <Search className="w-4 h-4 text-slate-500" />
              <span>Localizar</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-sm font-semibold transition-colors shadow-xs"
              title="Imprimir Escala do Salão em A4"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir</span>
            </button>
          </div>
        </div>

        {/* Cadence Tabs */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 mr-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> Cadência
            </span>
            <button
              onClick={() => setCadence('SQS')}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                cadence === 'SQS'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Segunda • Quarta • Sexta
            </button>
            <button
              onClick={() => setCadence('TQS')}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                cadence === 'TQS'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Terça • Quinta • Sábado
            </button>
          </div>

          <div className="text-xs font-medium text-slate-500 flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Escala Operacional Ativa • {selectedSalon} • {selectedShift}</span>
          </div>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 print:grid-cols-6">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">Capacidade</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black text-slate-800">{metrics.totalMachines || 0}</span>
            <span className="text-xs text-slate-600">máquinas</span>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">Ocupação</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black text-indigo-600">{metrics.occupiedSlots || 0}</span>
            <span className="text-xs font-semibold text-indigo-500">({metrics.occupancyRate || 0}%)</span>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">Vagas</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className={`text-2xl font-black ${(metrics.vacantSlots || 0) > 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
              {metrics.vacantSlots || 0}
            </span>
            <span className="text-xs text-slate-600">livres</span>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">Fístulas</span>
          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
            <span className="text-xl font-black text-emerald-700">{metrics.favCount || 0}</span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded border border-emerald-200">
              15: {metrics.needle15 || 0}
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded border border-emerald-200">
              16: {metrics.needle16 || 0}
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded border border-emerald-200">
              17: {metrics.needle17 || 0}
            </span>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">Cateteres</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xs font-bold text-amber-700">CDL: {metrics.cdlCount || 0}</span>
            <span className="text-xs font-bold text-purple-700">Perm: {metrics.permcathCount || 0}</span>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">Isolamento</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className={`text-2xl font-black ${(metrics.isolationCount || 0) > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
              {metrics.isolationCount || 0}
            </span>
            <span className="text-xs text-slate-600">pacientes</span>
          </div>
        </div>
      </div>

      {/* Print Header (Only visible on paper) */}
      <div className="hidden print:block mb-4 pb-2 border-b-2 border-slate-800 text-center">
        <h1 className="text-xl font-bold text-slate-900">ESCALA OPERACIONAL DE HEMODIÁLISE — {selectedSalon.toUpperCase()}</h1>
        <p className="text-xs font-semibold text-slate-600">
          Turno: {selectedShift} • Cadência: {cadence === 'SQS' ? 'Segunda / Quarta / Sexta' : 'Terça / Quinta / Sábado'} • Data da Impressão: {new Date().toLocaleDateString('pt-BR')}
        </p>
      </div>

      {/* Room Grid Layout by Box */}
      {loading ? (
        <div className="bg-white rounded-2xl p-16 border border-slate-200 text-center flex flex-col items-center justify-center">
          <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mb-3" />
          <p className="text-sm font-semibold text-slate-600">Carregando mapa de leitos e pacientes...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedBoxes).map(([boxName, points]) => (
            <div key={boxName} className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200 shadow-xs">
              {/* Box Title Bar */}
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-bold tracking-wide uppercase ${
                    boxName.includes('Amarela') 
                      ? 'bg-amber-100 text-amber-900 border border-amber-300' 
                      : 'bg-slate-800 text-white'
                  }`}>
                    {boxName}
                  </span>
                  <span className="text-xs font-medium text-slate-500">
                    {points.length} {points.length === 1 ? 'ponto' : 'pontos'} instalados
                  </span>
                </div>
              </div>

              {/* Points Grid inside Box */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3.5">
                {points.map(pt => {
                  const patient = cadence === 'SQS' ? pt.sqs?.mainPatient : pt.tqs?.mainPatient;
                  const isVacant = !patient || !patient.name;
                  const eq = equipmentMap.get((pt.serialNumber || '').trim().toUpperCase());
                  const isMaintenanceAlert = eq && eq.status && eq.status !== 'Em Operação';

                  return (
                    <div
                      key={pt.id || pt.ponto}
                      className={`relative bg-white rounded-xl p-3.5 border transition-all duration-200 shadow-xs hover:shadow-md flex flex-col justify-between ${
                        isVacant
                          ? 'border-dashed border-emerald-300 bg-emerald-50/30'
                          : patient?.isolation
                          ? 'border-rose-200 ring-1 ring-rose-300/50'
                          : 'border-slate-200/90'
                      }`}
                    >
                      {/* Point Card Header */}
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-800 rounded-md text-xs font-black">
                            P{pt.ponto}
                          </span>
                          {pt.serialNumber ? (
                            <button
                              onClick={() => handleOpenMachineDetails(pt.serialNumber)}
                              className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1"
                              title="Ver ficha técnica e manutenção da máquina"
                            >
                              <Cpu className="w-3 h-3" />
                              <span>{pt.serialNumber}</span>
                            </button>
                          ) : (
                            <span className="text-[11px] text-slate-400">Sem máquina</span>
                          )}
                        </div>

                        {/* Machine Maintenance status badge */}
                        {pt.serialNumber && (
                          <span
                            onClick={() => handleOpenMachineDetails(pt.serialNumber)}
                            className={`cursor-pointer inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                              isMaintenanceAlert
                                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}
                            title="Status de Manutenção"
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${isMaintenanceAlert ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
                            <span>{isMaintenanceAlert ? eq.status : 'Operacional'}</span>
                          </span>
                        )}
                      </div>

                      {/* Point Card Body */}
                      <div className="py-2.5">
                        {isVacant ? (
                          <div className="py-3 text-center">
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-1 rounded-lg">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Vaga Livre
                            </span>
                            <p className="text-[11px] text-slate-400 mt-1">Disponível para admissão ou remanejamento</p>
                          </div>
                        ) : (
                          <div className="space-y-1.5">
                            {/* Patient Name */}
                            <div className="flex items-start gap-1.5">
                              <User className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                              <div className="min-w-0 flex-1">
                                <h4 className="text-xs font-bold text-slate-900 leading-tight truncate" title={patient.name}>
                                  {patient.name}
                                </h4>
                                {patient.dn && (
                                  <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                                    <span>DN: {patient.dn}</span>
                                    {calculateAge(null, patient.dn) && (
                                      <span className="text-slate-400 font-medium">• {calculateAge(null, patient.dn)}</span>
                                    )}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Access & Isolation Badges */}
                            <div className="flex flex-wrap items-center gap-1 pt-1">
                              {/* Vascular Access */}
                              {patient.accessType === 'Permcath' || (patient.accessRaw && patient.accessRaw.toUpperCase().includes('PERM')) ? (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200">
                                  🟣 Permcath
                                </span>
                              ) : patient.accessType === 'Cateter Duplo Lúmen' || (patient.accessRaw && patient.accessRaw.toUpperCase().includes('CDL')) ? (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                                  🟡 CDL
                                </span>
                              ) : (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                                  🟢 FAV {patient.needleSize ? `Ag.${patient.needleSize}` : (patient.accessRaw?.match(/AG\s*\.?\s*(\d+)/i)?.[0] || 'Ag.16')}
                                </span>
                              )}

                              {/* Isolation / Special tag */}
                              {(patient.isolation || patient.accessRaw?.toUpperCase().includes('HIV') || patient.accessRaw?.toUpperCase().includes('ÚNICO') || patient.accessRaw?.toUpperCase().includes('UNICO')) && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1">
                                  <ShieldAlert className="w-2.5 h-2.5" /> Uso Único
                                </span>
                              )}

                              {patient.accessRaw?.toUpperCase().includes('HCV') && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-orange-100 text-orange-800 border border-orange-300">
                                  HCV
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Point Card Footer Actions */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] print:hidden">
                        {isVacant ? (
                          <button
                            onClick={() => {
                              setSelectedSlotForReallocate({
                                pointId: pt.id || pt.ponto,
                                ponto: pt.ponto,
                                box: pt.box,
                                currentPatient: null
                              });
                              setShowReallocateModal(true);
                            }}
                            className="w-full py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg flex items-center justify-center gap-1 transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Alocar</span>
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => {
                                setSelectedSlotForReallocate({
                                  pointId: pt.id || pt.ponto,
                                  ponto: pt.ponto,
                                  box: pt.box,
                                  currentPatient: patient
                                });
                                setShowReallocateModal(true);
                              }}
                              className="text-slate-600 hover:text-indigo-600 font-semibold flex items-center gap-1 transition-colors"
                              title="Remanejar ou trocar paciente de leito"
                            >
                              <ArrowRightLeft className="w-3 h-3" />
                              <span>Remanejar</span>
                            </button>

                            {onOpenPostModalWithPatient && (
                              <button
                                onClick={() => onOpenPostModalWithPatient({
                                  patientName: patient.name,
                                  room: selectedSalon,
                                  shift: selectedShift,
                                  point: pt.ponto,
                                  serialNumber: pt.serialNumber
                                })}
                                className="text-slate-600 hover:text-rose-600 font-semibold flex items-center gap-1 transition-colors"
                                title="Abrir comunicado clínico deste paciente no mural"
                              >
                                <AlertTriangle className="w-3 h-3" />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Search className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-800 text-base">Localizador de Pacientes & Máquinas</h3>
              </div>
              <button
                onClick={() => {
                  setShowSearchModal(false);
                  setSearchTerm('');
                  setSearchResults([]);
                }}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 border-b border-slate-100">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Digite o nome do paciente ou número de série da máquina..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                  autoFocus
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {searchResults.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-sm">
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
                    className="p-3 bg-slate-50 hover:bg-indigo-50/50 border border-slate-200 hover:border-indigo-200 rounded-xl cursor-pointer transition-all flex items-center justify-between group"
                  >
                    <div>
                      <h4 className="text-sm font-bold text-slate-800 group-hover:text-indigo-700">
                        {res.patient.name}
                      </h4>
                      <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                        <span className="font-semibold text-slate-700">{res.salao}</span> •
                        <span>{res.turno}</span> •
                        <span>{res.box}</span> •
                        <span className="font-bold text-slate-700">Ponto {res.ponto}</span> •
                        <span>{res.cadence}</span>
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reallocation / Alocação Modal */}
      {showReallocateModal && selectedSlotForReallocate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-800 text-base">
                  {selectedSlotForReallocate.currentPatient ? 'Remanejar Paciente' : 'Alocar Paciente no Leito'}
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowReallocateModal(false);
                  setSelectedSlotForReallocate(null);
                  setSelectedNewPatient(null);
                  setReallocatePatientTerm('');
                }}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                <p><strong className="text-slate-700">Localização:</strong> {selectedSalon} • {selectedShift} • {selectedSlotForReallocate.box} • Ponto {selectedSlotForReallocate.ponto}</p>
                <p><strong className="text-slate-700">Cadência:</strong> {cadence === 'SQS' ? 'Segunda, Quarta e Sexta' : 'Terça, Quinta e Sábado'}</p>
                {selectedSlotForReallocate.currentPatient && (
                  <p><strong className="text-slate-700">Paciente Atual:</strong> {selectedSlotForReallocate.currentPatient.name}</p>
                )}
              </div>

              {/* Patient Selection Dropdown */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Novo Paciente
                </label>
                <input
                  type="text"
                  value={reallocatePatientTerm}
                  onChange={(e) => setReallocatePatientTerm(e.target.value)}
                  placeholder="Pesquisar paciente cadastrado no sistema..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                />

                {reallocatePatientTerm.trim() && (
                  <div className="mt-2 max-h-40 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100 bg-white shadow-xs">
                    {patients
                      .filter(p => (p.name || '').toLowerCase().includes(reallocatePatientTerm.toLowerCase()))
                      .slice(0, 10)
                      .map(p => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => {
                            setSelectedNewPatient(p);
                            setReallocatePatientTerm(p.name);
                          }}
                          className="w-full text-left p-2.5 hover:bg-indigo-50 text-xs font-semibold text-slate-700 flex items-center justify-between"
                        >
                          <span>{p.name}</span>
                          <span className="text-[10px] text-slate-400">{p.accessType || 'FAV'}</span>
                        </button>
                      ))}
                  </div>
                )}
              </div>

              {selectedSlotForReallocate.currentPatient && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedNewPatient({ name: '', isVacant: true })}
                    className="text-xs font-semibold text-rose-600 hover:text-rose-800 flex items-center gap-1"
                  >
                    <span>Liberar esta vaga (deixar leito livre)</span>
                  </button>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowReallocateModal(false);
                  setSelectedSlotForReallocate(null);
                  setSelectedNewPatient(null);
                }}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveReallocation}
                disabled={actionLoading}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-xs transition-colors disabled:opacity-50"
              >
                {actionLoading ? 'Salvando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Machine Maintenance Modal */}
      {showMachineModal && selectedMachine && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-800 text-base">Ficha Técnica da Máquina</h3>
              </div>
              <button
                onClick={() => {
                  setShowMachineModal(false);
                  setSelectedMachine(null);
                }}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-3.5 text-xs">
              <div className="flex items-center justify-between p-3 bg-indigo-50/60 border border-indigo-100 rounded-xl">
                <div>
                  <h4 className="font-black text-indigo-950 text-sm">{selectedMachine.name}</h4>
                  <p className="text-indigo-700 font-mono text-xs mt-0.5">Série: {selectedMachine.serialNumber}</p>
                </div>
                <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[11px]">
                  {selectedMachine.status || 'Em Operação'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Marca / Modelo</span>
                  <span className="text-slate-800 font-semibold mt-0.5 block">{selectedMachine.brand || 'Nipro'} • {selectedMachine.model || 'DIAMAX 220F'}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Setor Físico</span>
                  <span className="text-slate-800 font-semibold mt-0.5 block">{selectedMachine.sector || selectedSalon}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Última Preventiva</span>
                  <span className="text-slate-800 font-semibold mt-0.5 block">{selectedMachine.lastPreventiveDate || '10/05/2026'}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Próxima Preventiva</span>
                  <span className="text-slate-800 font-semibold mt-0.5 block">{selectedMachine.nextPreventiveDate || '10/08/2026'}</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Calibração & Observações</span>
                <p className="text-slate-700 mt-1 leading-relaxed">
                  {selectedMachine.notes || 'Equipamento calibrado e conforme com o protocolo técnico de dialisato.'}
                </p>
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowMachineModal(false);
                  setSelectedMachine(null);
                }}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-xl transition-colors"
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
