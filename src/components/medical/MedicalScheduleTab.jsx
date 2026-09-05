import React, { useState, useMemo, useEffect } from 'react';
import { 
  Calendar, Plus, AlertTriangle, CheckCircle2, 
  Trash2, Edit2, Filter, ChevronLeft, ChevronRight, UserCheck, 
  ShieldAlert, LayoutGrid, List, Printer, RefreshCw, Sparkles, UserPlus, Info,
  Copy, RotateCcw, Check, ArrowRight, X, Layers
} from 'lucide-react';
import { dbService } from '../../firebase';
import { FALLBACK_DOCTORS } from '../../services/firebase/medicalService';
import { formatDoctorDisplayName, sortDoctorsByName } from '../../utils/doctorFormatters';

export default function MedicalScheduleTab({
  schedules = [],
  doctors = [],
  swaps = [],
  selectedMonth,
  onChangeMonth,
  onSaveSchedule,
  onDeleteSchedule,
  onClearMonth,
  loading = false
}) {
  const availableDoctors = Array.isArray(doctors) && doctors.length > 0 ? doctors : FALLBACK_DOCTORS;

  // View state: 'matriz' (Padrão) | 'lista'
  const [viewMode, setViewMode] = useState('matriz');
  const [selectedWeekIndex, setSelectedWeekIndex] = useState('todas'); // 'todas' | 0 | 1 | 2 | 3 | 4 | 5
  const [selectedSector, setSelectedSector] = useState('Todos');
  const [selectedShift, setSelectedShift] = useState('Todos');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Escala Recorrente por Dias da Semana
  const [scheduleMode, setScheduleMode] = useState('single'); // 'single' | 'recurring'
  const [recurringDays, setRecurringDays] = useState([1]); // 1 = Segunda
  const [recurringMonth, setRecurringMonth] = useState(selectedMonth || new Date().toISOString().substring(0, 7));
  const [overwriteExisting, setOverwriteExisting] = useState(true);

  // Modal de Cópia de Mês
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [sourceMonth, setSourceMonth] = useState('');
  const [copyStrategy, setCopyStrategy] = useState('dayOfWeek'); // 'dayOfWeek' | 'exactDay'
  const [copySectors, setCopySectors] = useState(['Salão 1', 'Salão 2', 'Salão 3', 'DP']);
  const [copyOverwrite, setCopyOverwrite] = useState(true);
  const [sourceSchedules, setSourceSchedules] = useState([]);
  const [loadingSource, setLoadingSource] = useState(false);
  const [doctorReplacements, setDoctorReplacements] = useState({});

  const [formData, setFormData] = useState({
    date: new Date().toISOString().substring(0, 10),
    sector: 'Salão 1',
    shift: '1º Turno',
    doctorId: availableDoctors[0]?.id || availableDoctors[0]?.uid || '',
    isSwap: false,
    originalDoctorName: '',
    notes: ''
  });

  const sectors = ['Salão 1', 'Salão 2', 'Salão 3', 'DP'];
  const shifts = ['1º Turno', '2º Turno', '3º Turno'];
  const weekDaysLabels = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

  // Decomposição dinâmica das semanas do mês selecionado
  const monthWeeks = useMemo(() => {
    if (!selectedMonth) return [];
    const [yearStr, monthStr] = selectedMonth.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);
    const daysInMonth = new Date(year, month, 0).getDate();

    const weeks = [];
    let currentWeek = [];

    // Primeiro dia do mês (0 = Domingo, 1 = Segunda, ..., 6 = Sábado)
    const firstDay = new Date(year, month - 1, 1).getDay();
    // Converter para índice iniciando na Segunda-feira (0 = Segunda, ..., 6 = Domingo)
    const startPadding = (firstDay + 6) % 7;

    // Preencher dias vazios antes do dia 1
    for (let i = 0; i < startPadding; i++) {
      currentWeek.push({
        dateStr: null,
        dayNum: null,
        isCurrentMonth: false,
        dayOfWeek: i
      });
    }

    // Preencher os dias reais do mês
    for (let day = 1; day <= daysInMonth; day++) {
      const dayDate = new Date(year, month - 1, day);
      const dayOfWeek = (dayDate.getDay() + 6) % 7;
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

      currentWeek.push({
        dateStr,
        dayNum: day,
        isCurrentMonth: true,
        dayOfWeek,
        isSunday: dayOfWeek === 6,
        isSaturday: dayOfWeek === 5
      });

      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }

    // Preencher dias vazios ao final da última semana
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push({
          dateStr: null,
          dayNum: null,
          isCurrentMonth: false,
          dayOfWeek: currentWeek.length
        });
      }
      weeks.push(currentWeek);
    }

    return weeks;
  }, [selectedMonth]);

  // Trava Anti-Buraco & Contadores
  const uncoveredCount = useMemo(() => {
    return schedules.filter(s => !s.doctorId || s.status === 'Pendente').length;
  }, [schedules]);

  const swapsCount = useMemo(() => {
    return schedules.filter(s => s.isSwap || s.checkinStatus === 'Substituído').length + (swaps?.length || 0);
  }, [schedules, swaps]);

  // Lista Filtrada para o Modo Lista
  const filteredSchedules = useMemo(() => {
    return schedules.filter(s => {
      if (selectedSector !== 'Todos') {
        const matchSector = s.sector.includes(selectedSector) || (selectedSector === 'DP' && s.sector.includes('Peritoneal'));
        if (!matchSector) return false;
      }
      if (selectedShift !== 'Todos' && s.shift !== selectedShift) return false;
      return true;
    }).sort((a, b) => a.date.localeCompare(b.date));
  }, [schedules, selectedSector, selectedShift]);

  // Mapeamento Rápido de Plantões para a Matriz
  const scheduleLookup = useMemo(() => {
    const map = {};
    schedules.forEach(s => {
      let secKey = s.sector;
      if (secKey.includes('Peritoneal')) secKey = 'DP';
      const key = `${s.date}_${secKey}_${s.shift}`;
      map[key] = s;
    });
    return map;
  }, [schedules]);

  // Mapeamento Rápido de Trocas do Mês
  const swapLookup = useMemo(() => {
    const map = {};
    if (Array.isArray(swaps)) {
      swaps.forEach(sw => {
        let secKey = sw.sector || '';
        if (secKey.includes('Peritoneal')) secKey = 'DP';
        const key = `${sw.date}_${secKey}_${sw.shift}`;
        map[key] = sw;
      });
    }
    return map;
  }, [swaps]);

  // Helper para mês anterior (ex: 2026-09 -> 2026-08)
  const getPreviousMonth = (monthStr) => {
    if (!monthStr) return '';
    const [yStr, mStr] = monthStr.split('-');
    let y = parseInt(yStr, 10);
    let m = parseInt(mStr, 10) - 1;
    if (m === 0) {
      m = 12;
      y -= 1;
    }
    return `${y}-${String(m).padStart(2, '0')}`;
  };

  // Helper para calcular todas as datas do mês selecionado para os dias da semana escolhidos
  const calculateRecurringDates = (monthStr, daysOfWeekArray) => {
    if (!monthStr || !daysOfWeekArray || daysOfWeekArray.length === 0) return [];
    const [yStr, mStr] = monthStr.split('-');
    const year = parseInt(yStr, 10);
    const month = parseInt(mStr, 10);
    const daysInMonth = new Date(year, month, 0).getDate();
    const result = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(year, month - 1, day);
      const dow = d.getDay(); // 0 = Domingo, 1 = Segunda, ..., 6 = Sábado
      if (daysOfWeekArray.includes(dow)) {
        const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        result.push({
          dateStr,
          dayNum: day,
          dayOfWeek: dow,
          shortName: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][dow],
          fullName: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'][dow]
        });
      }
    }
    return result;
  };

  // Detecção Inteligente de Conflitos (Médico escalado no mesmo turno e data em salões distintos)
  const doctorConflicts = useMemo(() => {
    const map = {};
    schedules.forEach(s => {
      if (s.doctorId && s.date && s.shift) {
        const key = `${s.date}_${s.shift}_${s.doctorId}`;
        if (!map[key]) map[key] = [];
        map[key].push(s);
      }
    });
    const conflicts = {};
    Object.entries(map).forEach(([k, list]) => {
      if (list.length > 1) {
        list.forEach(item => {
          conflicts[item.id] = list;
        });
      }
    });
    return conflicts;
  }, [schedules]);

  const conflictCount = useMemo(() => {
    return Object.keys(doctorConflicts).length;
  }, [doctorConflicts]);

  // Datas calculadas para a escala recorrente
  const recurringDates = useMemo(() => {
    return calculateRecurringDates(recurringMonth || selectedMonth, recurringDays);
  }, [recurringMonth, selectedMonth, recurringDays]);

  // Prévia da Escala Recorrente
  const recurringPreview = useMemo(() => {
    if (scheduleMode !== 'recurring') return [];
    const resolvedSector = formData.sector === 'DP' ? 'DP' : formData.sector;
    return recurringDates.map(d => {
      const key = `${d.dateStr}_${resolvedSector}_${formData.shift}`;
      const existing = scheduleLookup[key];
      return {
        ...d,
        existingDoc: existing ? existing.doctorName : null,
        existingId: existing ? existing.id : null,
        willReplace: !!existing
      };
    });
  }, [scheduleMode, recurringDates, formData.sector, formData.shift, scheduleLookup]);

  // Handler de Abertura do Modal de Escala / Edição
  const handleOpenAdd = (date = null, sec = null, sh = null) => {
    setEditingItem(null);
    setScheduleMode('single');
    const firstDocId = availableDoctors[0]?.id || availableDoctors[0]?.uid || '';
    const initialDate = date || (selectedMonth ? `${selectedMonth}-01` : new Date().toISOString().substring(0, 10));
    setFormData({
      date: initialDate,
      sector: sec || 'Salão 1',
      shift: sh || '1º Turno',
      doctorId: firstDocId,
      isSwap: false,
      originalDoctorName: '',
      notes: ''
    });
    setRecurringMonth(selectedMonth || initialDate.substring(0, 7));
    if (date) {
      const d = new Date(date + 'T12:00:00');
      setRecurringDays([d.getDay()]);
    } else {
      setRecurringDays([1]); // Segunda por padrão
    }
    setShowAddModal(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setScheduleMode('single');
    setFormData({
      date: item.date,
      sector: item.sector.includes('Peritoneal') ? 'DP' : item.sector,
      shift: item.shift,
      doctorId: item.doctorId,
      isSwap: !!item.isSwap,
      originalDoctorName: item.originalDoctorName || '',
      notes: item.notes || ''
    });
    setShowAddModal(true);
  };

  const handleCellClick = (dateStr, sectorName, shiftName) => {
    if (!dateStr) return;
    const key = `${dateStr}_${sectorName}_${shiftName}`;
    const existing = scheduleLookup[key];
    if (existing) {
      handleOpenEdit(existing);
    } else {
      handleOpenAdd(dateStr, sectorName, shiftName);
    }
  };

  // Funções do Modal de Cópia de Mês
  const handleOpenCopyModal = () => {
    const prev = getPreviousMonth(selectedMonth);
    setSourceMonth(prev);
    setDoctorReplacements({});
    setShowCopyModal(true);
    loadSourceMonth(prev);
  };

  const loadSourceMonth = async (srcMonth) => {
    if (!srcMonth) return;
    setLoadingSource(true);
    try {
      if (dbService.getMedicalSchedules) {
        const list = await dbService.getMedicalSchedules(srcMonth);
        setSourceSchedules(list || []);
      } else {
        setSourceSchedules([]);
      }
    } catch (e) {
      console.error('Erro ao carregar escala do mês anterior:', e);
      setSourceSchedules([]);
    } finally {
      setLoadingSource(false);
    }
  };

  const sourceDoctorList = useMemo(() => {
    if (!sourceSchedules || sourceSchedules.length === 0) return [];
    const map = {};
    sourceSchedules.forEach(s => {
      if (s.doctorId) {
        if (!map[s.doctorId]) {
          map[s.doctorId] = { id: s.doctorId, name: s.doctorName, count: 0 };
        }
        map[s.doctorId].count++;
      }
    });
    return Object.values(map).sort((a, b) => b.count - a.count);
  }, [sourceSchedules]);

  const generateCopiedSchedules = () => {
    if (!sourceSchedules || sourceSchedules.length === 0 || !sourceMonth || !selectedMonth) return [];
    const [srcY, srcM] = sourceMonth.split('-').map(Number);
    const [dstY, dstM] = selectedMonth.split('-').map(Number);
    const daysInDst = new Date(dstY, dstM, 0).getDate();
    const dateMap = {}; // srcDate -> dstDate

    if (copyStrategy === 'dayOfWeek') {
      const srcDaysByDow = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };
      const daysInSrc = new Date(srcY, srcM, 0).getDate();
      for (let d = 1; d <= daysInSrc; d++) {
        const date = new Date(srcY, srcM - 1, d);
        const dow = date.getDay();
        const str = `${srcY}-${String(srcM).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        srcDaysByDow[dow].push(str);
      }

      const dstDaysByDow = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };
      for (let d = 1; d <= daysInDst; d++) {
        const date = new Date(dstY, dstM - 1, d);
        const dow = date.getDay();
        const str = `${dstY}-${String(dstM).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        dstDaysByDow[dow].push(str);
      }

      for (let dow = 0; dow < 7; dow++) {
        const srcList = srcDaysByDow[dow];
        const dstList = dstDaysByDow[dow];
        srcList.forEach((srcDate, idx) => {
          if (dstList[idx]) {
            dateMap[srcDate] = dstList[idx];
          } else if (dstList.length > 0) {
            dateMap[srcDate] = dstList[dstList.length - 1];
          }
        });
      }
    } else {
      // exactDay
      for (let d = 1; d <= daysInDst; d++) {
        const srcStr = `${srcY}-${String(srcM).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const dstStr = `${dstY}-${String(dstM).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        dateMap[srcStr] = dstStr;
      }
    }

    const generated = [];
    const seenKeys = new Set();

    sourceSchedules.forEach(src => {
      const isDP = src.sector && src.sector.includes('Peritoneal');
      const secShort = isDP ? 'DP' : src.sector;
      if (!copySectors.includes(secShort)) return;

      const dstDate = dateMap[src.date];
      if (!dstDate) return;

      const targetDocId = doctorReplacements[src.doctorId] || src.doctorId;
      const targetDoc = availableDoctors.find(d => (d.id === targetDocId || d.uid === targetDocId));
      const targetDocName = targetDoc ? targetDoc.name : src.doctorName;
      const targetDocCrm = targetDoc ? (targetDoc.crm || '') : src.doctorCrm;

      const key = `${dstDate}_${secShort}_${src.shift}`;
      if (seenKeys.has(key)) return;
      seenKeys.add(key);

      const existingInDst = scheduleLookup[key];
      if (existingInDst && !copyOverwrite) {
        return;
      }

      generated.push({
        id: existingInDst ? existingInDst.id : undefined,
        month: selectedMonth,
        date: dstDate,
        sector: src.sector,
        shift: src.shift,
        doctorId: targetDocId,
        doctorName: targetDocName,
        doctorCrm: targetDocCrm,
        isSwap: false,
        originalDoctorName: '',
        status: 'Confirmado',
        checkinStatus: existingInDst?.checkinStatus || 'Pendente',
        notes: src.notes ? `Copiado de ${src.date}` : `Copiado da escala de ${sourceMonth}`
      });
    });

    return generated;
  };

  const previewCopiedList = useMemo(() => {
    return generateCopiedSchedules();
  }, [sourceSchedules, sourceMonth, selectedMonth, copyStrategy, copySectors, copyOverwrite, doctorReplacements, scheduleLookup]);

  const handleExecuteCopy = async () => {
    const generated = generateCopiedSchedules();
    if (generated.length === 0) {
      alert('Nenhum plantão pôde ser gerado com os parâmetros selecionados.');
      return;
    }
    await onSaveSchedule(generated);
    setShowCopyModal(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const doc = availableDoctors.find(d => (d.id === formData.doctorId || d.uid === formData.doctorId));
    const resolvedSector = formData.sector === 'DP' ? 'Diálise Peritoneal (DP)' : formData.sector;

    // Se for modo recorrente por dias da semana
    if (scheduleMode === 'recurring' && !editingItem) {
      if (recurringDates.length === 0) {
        alert('Selecione pelo menos um dia da semana para gerar os plantões recorrentes.');
        return;
      }
      const targetMonth = recurringMonth || selectedMonth;
      const shiftsToSave = [];

      recurringDates.forEach(d => {
        const key = `${d.dateStr}_${formData.sector}_${formData.shift}`;
        const existing = scheduleLookup[key];
        if (existing && !overwriteExisting) {
          return;
        }
        shiftsToSave.push({
          id: existing ? existing.id : undefined,
          month: targetMonth,
          date: d.dateStr,
          sector: resolvedSector,
          shift: formData.shift,
          doctorId: formData.doctorId,
          doctorName: doc ? doc.name : 'Médico Não Informado',
          doctorCrm: doc ? (doc.crm || '') : '',
          isSwap: !!formData.isSwap,
          originalDoctorName: formData.isSwap ? formData.originalDoctorName : '',
          status: 'Confirmado',
          checkinStatus: existing?.checkinStatus || (formData.isSwap ? 'Substituído' : 'Pendente'),
          notes: formData.notes
        });
      });

      if (shiftsToSave.length > 0) {
        onSaveSchedule(shiftsToSave);
      }
      setShowAddModal(false);
      return;
    }

    // Modo Individual padrão
    const month = formData.date.substring(0, 7);
    onSaveSchedule({
      id: editingItem ? editingItem.id : undefined,
      month,
      date: formData.date,
      sector: resolvedSector,
      shift: formData.shift,
      doctorId: formData.doctorId,
      doctorName: doc ? doc.name : 'Médico Não Informado',
      doctorCrm: doc ? (doc.crm || '') : '',
      isSwap: !!formData.isSwap,
      originalDoctorName: formData.isSwap ? formData.originalDoctorName : '',
      status: 'Confirmado',
      checkinStatus: editingItem?.checkinStatus || (formData.isSwap ? 'Substituído' : 'Pendente'),
      notes: formData.notes
    });
    setShowAddModal(false);
  };

  const handlePrint = () => {
    window.print();
  };

  // Balanço de Plantões e Coberturas por Médico no Mês
  const doctorBalance = useMemo(() => {
    const balance = {};
    availableDoctors.forEach(doc => {
      balance[doc.id || doc.uid || doc.name] = {
        name: doc.name,
        crm: doc.crm || '',
        titularCount: 0,
        swapsCount: 0,
        total: 0
      };
    });

    schedules.forEach(s => {
      const docKey = s.doctorId;
      if (balance[docKey]) {
        if (s.isSwap || s.checkinStatus === 'Substituído') {
          balance[docKey].swapsCount++;
        } else {
          balance[docKey].titularCount++;
        }
        balance[docKey].total++;
      }
    });

    return Object.values(balance).filter(b => b.total > 0).sort((a, b) => b.total - a.total);
  }, [schedules, availableDoctors]);

  return (
    <div style={styles.container}>
      {/* Top Header */}
      <div style={styles.header} className="no-print">
        <div>
          <h3 style={styles.title}>Escala Mensal de Plantões</h3>
          <p style={styles.subtitle}>Matriz visual de plantões nos Salões 1, 2, 3 e Diálise Peritoneal nos 3 turnos.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <input 
            type="month" 
            className="form-control"
            value={selectedMonth}
            onChange={e => onChangeMonth(e.target.value)}
            style={{ width: '220px', minWidth: '220px', fontWeight: '700' }}
          />

          {/* Alternador de Visualização Matriz vs Lista */}
          <div style={styles.viewToggleGroup}>
            <button
              type="button"
              onClick={() => setViewMode('matriz')}
              style={{
                ...styles.viewToggleBtn,
                ...(viewMode === 'matriz' ? styles.viewToggleBtnActive : {})
              }}
              title="Visualização em Matriz Semanal (Planilha)"
            >
              <LayoutGrid size={15} />
              <span>Matriz</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('lista')}
              style={{
                ...styles.viewToggleBtn,
                ...(viewMode === 'lista' ? styles.viewToggleBtnActive : {})
              }}
              title="Visualização em Lista Tabular"
            >
              <List size={15} />
              <span>Lista</span>
            </button>
          </div>

          <button 
            type="button" 
            onClick={handleOpenCopyModal}
            style={{ ...styles.printBtn, backgroundColor: '#f0fdf4', borderColor: '#86efac', color: '#166534' }}
            title="Copiar grade completa do mês anterior"
          >
            <Copy size={15} />
            <span>Copiar</span>
          </button>

          {schedules.length > 0 && onClearMonth && (
            <button 
              type="button" 
              onClick={() => onClearMonth(selectedMonth)}
              style={{ ...styles.printBtn, backgroundColor: '#fff1f2', borderColor: '#fecdd3', color: '#be123c' }}
              title="Limpar todos os plantões do mês"
            >
              <RotateCcw size={15} />
              <span>Limpar</span>
            </button>
          )}

          <button 
            type="button" 
            onClick={handlePrint}
            style={styles.printBtn}
            title="Imprimir Escala Oficial A4 Paisagem"
          >
            <Printer size={15} />
            <span>Imprimir</span>
          </button>

          <button 
            type="button" 
            onClick={() => handleOpenAdd()} 
            style={styles.addBtn}
          >
            <Plus size={15} />
            <span>Escalar</span>
          </button>
        </div>
      </div>

      {/* Trava Anti-Buraco & Coverage Alert Strip */}
      <div style={styles.alertStrip} className="no-print">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          {uncoveredCount > 0 ? (
            <div style={{ ...styles.alertBadge, backgroundColor: '#fee2e2', color: '#991b1b', borderColor: '#fca5a5' }}>
              <ShieldAlert size={16} />
              <span>{uncoveredCount} Vagas Abertas</span>
            </div>
          ) : (
            <div style={{ ...styles.alertBadge, backgroundColor: '#dcfce7', color: '#166534', borderColor: '#bbf7d0' }}>
              <CheckCircle2 size={16} />
              <span>100% dos Salões Cobertos</span>
            </div>
          )}

          {swapsCount > 0 && (
            <div style={{ ...styles.alertBadge, backgroundColor: '#f0fdf4', color: '#15803d', borderColor: '#bbf7d0' }}>
              <RefreshCw size={14} />
              <span>{swapsCount} Trocas no Mês</span>
            </div>
          )}

          {conflictCount > 0 && (
            <div style={{ ...styles.alertBadge, backgroundColor: '#fef2f2', color: '#b91c1c', borderColor: '#fca5a5' }} title="Médicos escalados em mais de um salão simultaneamente no mesmo turno">
              <AlertTriangle size={14} />
              <span>{conflictCount} Conflitos de Salão</span>
            </div>
          )}

          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
            Total de {schedules.length} plantões programados para {selectedMonth}.
          </span>
        </div>

        {/* Legenda Oficial de Cores (Estilo Planilha de Hemodiálise) */}
        <div style={styles.legendContainer}>
          <div style={styles.legendItem}>
            <span style={{ ...styles.legendBox, backgroundColor: '#dcfce7', borderColor: '#86efac' }}></span>
            <span>Troca</span>
          </div>
          <div style={styles.legendItem}>
            <span style={{ ...styles.legendBox, backgroundColor: '#fee2e2', borderColor: '#f87171' }}></span>
            <span>Vago</span>
          </div>
          <div style={styles.legendItem}>
            <span style={{ ...styles.legendBox, backgroundColor: '#ffffff', borderColor: '#cbd5e1' }}></span>
            <span>Titular</span>
          </div>
          <div style={styles.legendItem}>
            <span style={{ ...styles.legendBox, backgroundColor: '#fef3c7', borderColor: '#fde047' }}></span>
            <span>Pendente</span>
          </div>
        </div>
      </div>

      {/* Cabeçalho de Impressão Oficial (Apenas no Print) */}
      <div className="print-only" style={styles.printHeader}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #0f172a', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '900', color: '#0f172a' }}>
              Dialize Betim • Nex-Ai CLINIC — Escala Médica de Plantões
            </h2>
            <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.85rem', color: '#475569' }}>
              Unidade Betim / Salões de Hemodiálise e Diálise Peritoneal — Competência: {selectedMonth}
            </p>
          </div>
          <div style={{ textAlign: 'right', fontSize: '0.75rem', color: '#64748b' }}>
            Emitido em: {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODO 1: VISUALIZAÇÃO EM MATRIZ SEMANAL (PLANILHA INTERATIVA)               */}
      {/* ========================================================================= */}
      {viewMode === 'matriz' ? (
        <div style={styles.matrixContainer}>
          {/* Seletor de Semanas */}
          <div style={styles.weekTabsBar} className="no-print">
            <button
              type="button"
              onClick={() => setSelectedWeekIndex('todas')}
              style={{
                ...styles.weekTabBtn,
                ...(selectedWeekIndex === 'todas' ? styles.weekTabBtnActive : {})
              }}
            >
              Mês Completo ({monthWeeks.length} Semanas)
            </button>
            {monthWeeks.map((week, wIdx) => {
              const validDays = week.filter(d => d.isCurrentMonth);
              const firstDayStr = validDays[0] ? String(validDays[0].dayNum).padStart(2, '0') : '';
              const lastDayStr = validDays[validDays.length - 1] ? String(validDays[validDays.length - 1].dayNum).padStart(2, '0') : '';

              return (
                <button
                  key={wIdx}
                  type="button"
                  onClick={() => setSelectedWeekIndex(wIdx)}
                  style={{
                    ...styles.weekTabBtn,
                    ...(selectedWeekIndex === wIdx ? styles.weekTabBtnActive : {})
                  }}
                >
                  {wIdx + 1}ª Semana ({firstDayStr} a {lastDayStr})
                </button>
              );
            })}
          </div>

          {/* Renderização das Semanas */}
          {monthWeeks.map((week, wIdx) => {
            if (selectedWeekIndex !== 'todas' && selectedWeekIndex !== wIdx) return null;

            const validDays = week.filter(d => d.isCurrentMonth);
            const firstDayStr = validDays[0] ? String(validDays[0].dayNum).padStart(2, '0') : '';
            const lastDayStr = validDays[validDays.length - 1] ? String(validDays[validDays.length - 1].dayNum).padStart(2, '0') : '';

            return (
              <div key={wIdx} style={styles.weekCard} className="week-print-block">
                {/* Título da Semana */}
                <div style={styles.weekHeader}>
                  <span style={styles.weekTitleBadge}>{wIdx + 1}ª SEMANA</span>
                  <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#475569' }}>
                    {firstDayStr}/{selectedMonth.split('-')[1]} até {lastDayStr}/{selectedMonth.split('-')[1]}/{selectedMonth.split('-')[0]}
                  </span>
                </div>

                <div style={styles.matrixTableWrapper}>
                  <table style={styles.matrixTable}>
                    <thead>
                      <tr>
                        <th style={styles.matrixColHeaderFixed}>Setor</th>
                        <th style={styles.matrixColHeaderShift}>Turno</th>
                        {week.map((day, dIdx) => (
                          <th 
                            key={dIdx} 
                            style={{
                              ...styles.matrixColHeaderDay,
                              ...(day.isSunday ? styles.matrixColHeaderSunday : day.isSaturday ? styles.matrixColHeaderSaturday : {})
                            }}
                          >
                            <div style={{ fontSize: '0.75rem', fontWeight: '800', color: day.isSunday || day.isSaturday ? '#b91c1c' : '#0f172a' }}>
                              {weekDaysLabels[dIdx].toUpperCase()}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '600' }}>
                              {day.dateStr ? day.dateStr.split('-').reverse().slice(0, 2).join('/') : '-'}
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {shifts.map((shiftName, sIdx) => (
                        <React.Fragment key={shiftName}>
                          {sectors.map((sectorName, secIdx) => (
                            <tr key={`${shiftName}_${sectorName}`} style={secIdx === sectors.length - 1 ? styles.shiftDividerRow : {}}>
                              {/* Setor */}
                              <td style={styles.matrixSectorCell}>
                                <strong>{sectorName}</strong>
                              </td>

                              {/* Turno (agrupado visualmente no 1º setor) */}
                              <td style={styles.matrixShiftCell}>
                                <span style={styles.shiftTag}>
                                  {shiftName.replace(' Turno', 'º T')}
                                </span>
                              </td>

                              {/* Células dos Dias da Semana */}
                              {week.map((day, dIdx) => {
                                if (!day.isCurrentMonth || !day.dateStr) {
                                  return (
                                    <td key={dIdx} style={styles.matrixEmptyDayCell}>
                                      <span style={{ color: '#cbd5e1' }}>—</span>
                                    </td>
                                  );
                                }

                                if (day.isSunday) {
                                  return (
                                    <td key={dIdx} style={styles.matrixSundayCell}>
                                      <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Sem Turno</span>
                                    </td>
                                  );
                                }

                                const lookupKey = `${day.dateStr}_${sectorName}_${shiftName}`;
                                const item = scheduleLookup[lookupKey];
                                const swapInfo = swapLookup[lookupKey];
                                const isSwap = item?.isSwap || item?.checkinStatus === 'Substituído' || !!swapInfo;
                                const isUncovered = !item || !item.doctorId;
                                const hasConflict = item && !!doctorConflicts[item.id];

                                return (
                                  <td 
                                    key={dIdx} 
                                    onClick={() => handleCellClick(day.dateStr, sectorName, shiftName)}
                                    style={{
                                      ...styles.matrixDoctorCell,
                                      ...(isUncovered 
                                        ? styles.matrixCellUncovered 
                                        : hasConflict 
                                          ? { backgroundColor: '#fef2f2', border: '1px solid #f87171' } 
                                          : isSwap 
                                            ? styles.matrixCellSwap 
                                            : styles.matrixCellRegular)
                                    }}
                                    title={
                                      isUncovered 
                                        ? 'Clique para escalar médico' 
                                        : hasConflict
                                          ? `CONFLITO: ${item.doctorName} está escalado em mais de um salão simultaneamente!`
                                          : isSwap 
                                            ? `Troca: ${item.doctorName} (Original: ${item.originalDoctorName || swapInfo?.originalDoctorName || 'Titular'})` 
                                            : `Titular: ${item.doctorName}`
                                    }
                                  >
                                    {isUncovered ? (
                                      <div style={styles.cellUncoveredContent}>
                                        <span style={styles.vagoBadge}>VAGO</span>
                                        <span style={styles.cellEscalarText}>+ Escalar</span>
                                      </div>
                                    ) : (
                                      <div style={styles.cellDoctorContent}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '2px' }}>
                                          <strong style={{
                                            fontSize: '0.8rem',
                                            color: hasConflict ? '#b91c1c' : isSwap ? '#166534' : '#0f172a',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis'
                                          }}>
                                            {item.doctorName.replace('Dr. ', '').replace('Dra. ', '')}
                                          </strong>
                                          {hasConflict ? (
                                            <span style={{ fontSize: '0.65rem', fontWeight: '800', color: '#b91c1c', backgroundColor: '#fee2e2', padding: '0.1rem 0.35rem', borderRadius: '3px', border: '1px solid #fca5a5' }} title="Conflito de Sala!">
                                              Conflito
                                            </span>
                                          ) : (
                                            isSwap && <span style={styles.swapMiniBadge}>Troca</span>
                                          )}
                                        </div>

                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2px', fontSize: '0.68rem', color: '#64748b' }}>
                                          <span>{item.doctorCrm ? `CRM ${item.doctorCrm}` : 'Nefro'}</span>
                                          {item.checkinStatus === 'Presente' && (
                                            <span style={{ color: '#16a34a', fontWeight: '800' }}>✓</span>
                                          )}
                                        </div>
                                      </div>
                                    )}
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ========================================================================= */
        /* MODO 2: VISUALIZAÇÃO EM LISTA TABULAR CLÁSSICA                            */
        /* ========================================================================= */
        <div style={styles.tableWrapper}>
          {/* Filter Toolbar */}
          <div style={styles.filterBar} className="no-print">
            <div style={styles.filterGroup}>
              <span style={styles.filterLabel}>Salão:</span>
              {['Todos', ...sectors].map(sec => (
                <button
                  key={sec}
                  type="button"
                  onClick={() => setSelectedSector(sec)}
                  style={{
                    ...styles.filterBtn,
                    ...(selectedSector === sec ? styles.filterBtnActive : {})
                  }}
                >
                  {sec}
                </button>
              ))}
            </div>

            <div style={styles.filterGroup}>
              <span style={styles.filterLabel}>Turno:</span>
              {['Todos', ...shifts].map(sh => (
                <button
                  key={sh}
                  type="button"
                  onClick={() => setSelectedShift(sh)}
                  style={{
                    ...styles.filterBtn,
                    ...(selectedShift === sh ? styles.filterBtnActive : {})
                  }}
                >
                  {sh}
                </button>
              ))}
            </div>
          </div>

          <table style={styles.table}>
            <thead>
              <tr>
                <th>Data</th>
                <th>Setor</th>
                <th>Turno</th>
                <th>Médico</th>
                <th>CRM</th>
                <th>Tipo</th>
                <th>Presença</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredSchedules.length === 0 ? (
                <tr>
                  <td colSpan="9" style={styles.noDataCell}>
                    Nenhum plantão cadastrado para os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredSchedules.map(sch => {
                  const isPresent = sch.checkinStatus === 'Presente';
                  const isLate = sch.checkinStatus === 'Atraso';
                  const isAbsent = sch.checkinStatus === 'Ausente';
                  const isReplaced = sch.isSwap || sch.checkinStatus === 'Substituído';

                  return (
                    <tr key={sch.id}>
                      <td>
                        <div style={{ fontWeight: '800', color: '#0f172a' }}>
                          {new Date(sch.date + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' })}
                        </div>
                      </td>
                      <td style={{ fontWeight: '600' }}>{sch.sector}</td>
                      <td>
                        <span style={styles.shiftPill}>{sch.shift}</span>
                      </td>
                      <td>
                        <div style={{ fontWeight: '700', color: isReplaced ? '#166534' : '#0284c7' }}>
                          {sch.doctorName}
                        </div>
                        {sch.notes && <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{sch.notes}</div>}
                      </td>
                      <td style={{ fontSize: '0.8rem', color: '#475569' }}>{sch.doctorCrm || '-'}</td>
                      <td>
                        {isReplaced ? (
                          <span style={{ fontSize: '0.7rem', fontWeight: '700', color: '#166534', backgroundColor: '#dcfce7', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                            Troca
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Titular</span>
                        )}
                      </td>
                      <td>
                        {isPresent ? (
                          <span style={{ fontSize: '0.7rem', fontWeight: '700', color: '#166534', backgroundColor: '#dcfce7', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                            ✓ Presente
                          </span>
                        ) : isLate ? (
                          <span style={{ fontSize: '0.7rem', fontWeight: '700', color: '#854d0e', backgroundColor: '#fef9c3', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                            ⚠ Atraso
                          </span>
                        ) : isAbsent ? (
                          <span style={{ fontSize: '0.7rem', fontWeight: '800', color: '#991b1b', backgroundColor: '#fee2e2', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                            ✕ Ausente
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                            Aguardando Ronda
                          </span>
                        )}
                      </td>
                      <td>
                        <span style={{
                          fontSize: '0.7rem',
                          fontWeight: '700',
                          backgroundColor: sch.status === 'Confirmado' ? '#f0fdf4' : '#fef3c7',
                          color: sch.status === 'Confirmado' ? '#15803d' : '#b45309',
                          padding: '0.15rem 0.45rem',
                          borderRadius: '4px'
                        }}>
                          {sch.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.3rem' }}>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(sch)}
                            style={styles.actionIconBtn}
                            title="Alterar médico"
                          >
                            <Edit2 size={13} color="#0284c7" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteSchedule(sch.id)}
                            style={styles.actionIconBtn}
                            title="Excluir da escala"
                          >
                            <Trash2 size={13} color="#ef4444" />
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

      {/* ========================================================================= */}
      {/* PAINEL INFERIOR: RESUMO DE TROCAS & BALANÇO DE COBERTURAS                  */}
      {/* ========================================================================= */}
      <div style={styles.bottomSection} className="no-print">
        <div style={styles.bottomGrid}>
          {/* Card: Quadro de Trocas Registradas no Mês */}
          <div style={styles.summaryCard}>
            <div style={styles.summaryHeader}>
              <RefreshCw size={16} color="#16a34a" />
              <h4 style={styles.summaryTitle}>Bolsa de Trocas do Mês</h4>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.5rem', maxHeight: '180px', overflowY: 'auto' }}>
              {schedules.filter(s => s.isSwap || s.checkinStatus === 'Substituído').length === 0 ? (
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', padding: '0.75rem', textAlign: 'center' }}>
                  Nenhuma troca de plantão registrada neste mês.
                </div>
              ) : (
                schedules.filter(s => s.isSwap || s.checkinStatus === 'Substituído').map((sw, idx) => (
                  <div key={idx} style={styles.swapListItem}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#166534' }}>
                        {sw.doctorName}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                        assumiu {sw.sector} ({sw.shift}) em {new Date(sw.date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                      </span>
                    </div>
                    {sw.originalDoctorName && (
                      <span style={{ fontSize: '0.7rem', color: '#854d0e', backgroundColor: '#fef3c7', padding: '0.1rem 0.35rem', borderRadius: '4px' }}>
                        Titular: {sw.originalDoctorName}
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Card: Balanço de Plantões por Médico */}
          <div style={styles.summaryCard}>
            <div style={styles.summaryHeader}>
              <UserCheck size={16} color="#0284c7" />
              <h4 style={styles.summaryTitle}>Balanço de Plantões</h4>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginTop: '0.5rem', maxHeight: '180px', overflowY: 'auto' }}>
              {doctorBalance.length === 0 ? (
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', padding: '0.75rem', textAlign: 'center' }}>
                  Nenhum plantão contabilizado.
                </div>
              ) : (
                doctorBalance.map((doc, idx) => (
                  <div key={idx} style={styles.balanceRow}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <strong style={{ fontSize: '0.78rem', color: '#0f172a' }}>{doc.name}</strong>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.72rem' }}>
                      <span style={{ color: '#475569' }}>Titular: <strong>{doc.titularCount}</strong></span>
                      {doc.swapsCount > 0 && (
                        <span style={{ color: '#166534', fontWeight: '700' }}>Trocas: +{doc.swapsCount}</span>
                      )}
                      <span style={{ color: '#0284c7', fontWeight: '800' }}>Total: {doc.total}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Adicionar / Editar Plantão */}
      {showAddModal && (
        <div style={styles.modalOverlay} className="no-print">
          <div style={styles.modalCard}>
            {/* Header Fixo */}
            <div style={styles.modalHeader}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ margin: 0, fontWeight: '800', color: '#0f172a', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Calendar size={18} color="#0284c7" />
                  <span>{editingItem ? 'Editar Plantão' : (scheduleMode === 'recurring' ? 'Escalar por Semana' : 'Escalar Médico')}</span>
                </h4>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={styles.modalCloseBtn}
                  title="Fechar"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Alternador de Modo: Individual vs Recorrente */}
              {!editingItem && (
                <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.75rem', padding: '3px', backgroundColor: '#f1f5f9', borderRadius: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setScheduleMode('single')}
                    style={{
                      flex: 1,
                      padding: '0.45rem',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '0.82rem',
                      fontWeight: scheduleMode === 'single' ? '800' : '600',
                      backgroundColor: scheduleMode === 'single' ? '#ffffff' : 'transparent',
                      color: scheduleMode === 'single' ? '#0284c7' : '#64748b',
                      boxShadow: scheduleMode === 'single' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                      cursor: 'pointer'
                    }}
                  >
                    Individual
                  </button>
                  <button
                    type="button"
                    onClick={() => setScheduleMode('recurring')}
                    style={{
                      flex: 1,
                      padding: '0.45rem',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '0.82rem',
                      fontWeight: scheduleMode === 'recurring' ? '800' : '600',
                      backgroundColor: scheduleMode === 'recurring' ? '#ffffff' : 'transparent',
                      color: scheduleMode === 'recurring' ? '#0284c7' : '#64748b',
                      boxShadow: scheduleMode === 'recurring' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.3rem'
                    }}
                  >
                    <Sparkles size={14} color="#0284c7" />
                    <span>Recorrente</span>
                  </button>
                </div>
              )}
            </div>

            {/* Formulário com corpo rolável e rodapé fixo */}
            <form onSubmit={handleSubmit} style={styles.modalForm}>
              <div style={styles.modalBody}>
                {/* Modo Individual: Escolha de Data */}
                {(scheduleMode === 'single' || editingItem) ? (
                  <div className="form-group">
                    <label>Data *</label>
                    <input 
                      type="date" 
                      className="form-control" 
                      value={formData.date} 
                      onChange={e => setFormData({ ...formData, date: e.target.value })} 
                      required 
                    />
                  </div>
                ) : (
                  /* Modo Recorrente: Mês e Dias da Semana */
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                    <div className="form-group">
                      <label>Mês *</label>
                      <input 
                        type="month" 
                        className="form-control" 
                        value={recurringMonth} 
                        onChange={e => setRecurringMonth(e.target.value)} 
                        required 
                      />
                    </div>

                    <div className="form-group">
                      <label>Dias *</label>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.25rem', marginTop: '0.2rem' }}>
                        {[
                          { dow: 1, label: 'Seg' },
                          { dow: 2, label: 'Ter' },
                          { dow: 3, label: 'Qua' },
                          { dow: 4, label: 'Qui' },
                          { dow: 5, label: 'Sex' },
                          { dow: 6, label: 'Sáb' },
                          { dow: 0, label: 'Dom' }
                        ].map(day => {
                          const isSelected = recurringDays.includes(day.dow);
                          return (
                            <button
                              key={day.dow}
                              type="button"
                              onClick={() => {
                                if (isSelected) {
                                  if (recurringDays.length > 1) {
                                    setRecurringDays(recurringDays.filter(d => d !== day.dow));
                                  }
                                } else {
                                  setRecurringDays([...recurringDays, day.dow]);
                                }
                              }}
                              style={{
                                padding: '0.4rem 0.2rem',
                                borderRadius: '6px',
                                border: `1px solid ${isSelected ? '#0284c7' : '#cbd5e1'}`,
                                backgroundColor: isSelected ? '#0284c7' : '#f8fafc',
                                color: isSelected ? '#ffffff' : '#475569',
                                fontSize: '0.78rem',
                                fontWeight: isSelected ? '800' : '600',
                                cursor: 'pointer',
                                textAlign: 'center'
                              }}
                            >
                              {day.label}
                            </button>
                          );
                        })}
                      </div>

                      {/* Presets Rápidos */}
                      <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.4rem', flexWrap: 'wrap' }}>
                        <button
                          type="button"
                          onClick={() => setRecurringDays([1, 3, 5])}
                          style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: '#475569', cursor: 'pointer' }}
                        >
                          Seg/Qua/Sex
                        </button>
                        <button
                          type="button"
                          onClick={() => setRecurringDays([2, 4, 6])}
                          style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: '#475569', cursor: 'pointer' }}
                        >
                          Ter/Qui/Sáb
                        </button>
                        <button
                          type="button"
                          onClick={() => setRecurringDays([1, 2, 3, 4, 5])}
                          style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: '#475569', cursor: 'pointer' }}
                        >
                          Seg a Sex
                        </button>
                        <button
                          type="button"
                          onClick={() => setRecurringDays([0, 1, 2, 3, 4, 5, 6])}
                          style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: '#475569', cursor: 'pointer' }}
                        >
                          Todos
                        </button>
                      </div>

                      {/* Prévia das Datas Geradas */}
                      <div style={{ marginTop: '0.5rem', padding: '0.5rem', backgroundColor: '#f0f9ff', borderRadius: '6px', border: '1px solid #bae6fd' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#0369a1', marginBottom: '0.3rem' }}>
                          {recurringDates.length} plantões serão gerados:
                        </div>
                        <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', maxHeight: '55px', overflowY: 'auto' }}>
                          {recurringDates.map((d, idx) => (
                            <span key={idx} style={{ fontSize: '0.7rem', backgroundColor: '#ffffff', color: '#0284c7', padding: '0.1rem 0.4rem', borderRadius: '4px', border: '1px solid #bae6fd', fontWeight: '700' }}>
                              {d.dayNum}/{d.dateStr.split('-')[1]} ({d.shortName})
                            </span>
                          ))}
                        </div>
                      </div>

                      <div style={{ marginTop: '0.4rem' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer', margin: 0, fontSize: '0.78rem', color: '#475569' }}>
                          <input 
                            type="checkbox" 
                            checked={overwriteExisting} 
                            onChange={e => setOverwriteExisting(e.target.checked)}
                            style={{ width: '15px', height: '15px', accentColor: '#0284c7', cursor: 'pointer' }}
                          />
                          Sobrescrever plantões já preenchidos nestas datas
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label>Setor *</label>
                    <select 
                      className="form-control" 
                      value={formData.sector} 
                      onChange={e => setFormData({ ...formData, sector: e.target.value })}
                      required
                    >
                      {sectors.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Turno *</label>
                    <select 
                      className="form-control" 
                      value={formData.shift} 
                      onChange={e => setFormData({ ...formData, shift: e.target.value })}
                      required
                    >
                      {shifts.map(sh => <option key={sh} value={sh}>{sh}</option>)}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Médico *</label>
                  <select 
                    className="form-control" 
                    value={formData.doctorId} 
                    onChange={e => setFormData({ ...formData, doctorId: e.target.value })}
                    required
                  >
                    {availableDoctors.map(doc => (
                      <option key={doc.id || doc.uid || doc.name} value={doc.id || doc.uid || doc.name}>
                        {formatDoctorDisplayName(doc.name)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Opção de Troca / Substituição */}
                <div style={{ padding: '0.6rem 0.8rem', backgroundColor: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', margin: 0, fontSize: '0.82rem', fontWeight: '700', color: '#166534' }}>
                    <input 
                      type="checkbox" 
                      checked={formData.isSwap} 
                      onChange={e => setFormData({ ...formData, isSwap: e.target.checked })}
                      style={{ width: '16px', height: '16px', accentColor: '#16a34a', cursor: 'pointer' }}
                    />
                    Troca
                  </label>

                  {formData.isSwap && (
                    <div style={{ marginTop: '0.5rem' }}>
                      <label style={{ fontSize: '0.75rem', color: '#64748b' }}>Titular</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="Ex: Dra. Gabriela" 
                        value={formData.originalDoctorName}
                        onChange={e => setFormData({ ...formData, originalDoctorName: e.target.value })}
                        style={{ fontSize: '0.8rem' }}
                      />
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label>Observação</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Ex: Escala de rotina..." 
                    value={formData.notes} 
                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  />
                </div>
              </div>

              {/* Rodapé Fixo com Botões (Nunca desaparece da tela) */}
              <div style={styles.modalFooter}>
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)} 
                  style={styles.cancelBtn}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  style={styles.saveBtn}
                >
                  {scheduleMode === 'recurring' && !editingItem ? `Salvar (${recurringDates.length})` : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Copiar Escala do Mês Anterior */}
      {showCopyModal && (
        <div style={styles.modalOverlay} className="no-print">
          <div style={{ ...styles.modalCard, maxWidth: '620px', maxHeight: '92vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
              <div>
                <h4 style={{ margin: 0, fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Copy size={18} color="#0284c7" />
                  <span>Copiar Escala</span>
                </h4>
                <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                  Replique a grade completa de um mês para outro com inteligência de dias da semana.
                </p>
              </div>
              <button 
                type="button" 
                onClick={() => setShowCopyModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#94a3b8' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Seção 1: Origem e Destino */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '0.75rem', alignItems: 'center', padding: '0.85rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#475569' }}>Origem *</label>
                  <input 
                    type="month" 
                    className="form-control" 
                    value={sourceMonth} 
                    onChange={e => {
                      setSourceMonth(e.target.value);
                      loadSourceMonth(e.target.value);
                    }}
                    required 
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '1.2rem', color: '#0284c7' }}>
                  <ArrowRight size={20} />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#475569' }}>Destino</label>
                  <div style={{ 
                    padding: '0.45rem 0.75rem', 
                    backgroundColor: '#ffffff', 
                    border: '1px solid #cbd5e1', 
                    borderRadius: '6px', 
                    fontWeight: '800', 
                    color: '#0284c7',
                    fontSize: '0.85rem'
                  }}>
                    {selectedMonth}
                  </div>
                </div>
              </div>

              {/* Seção 2: Método de Cópia */}
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: '800', color: '#334155', display: 'block', marginBottom: '0.4rem' }}>
                  Método *
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <div 
                    onClick={() => setCopyStrategy('dayOfWeek')}
                    style={{
                      padding: '0.75rem',
                      borderRadius: '8px',
                      border: `1.5px solid ${copyStrategy === 'dayOfWeek' ? '#0284c7' : '#e2e8f0'}`,
                      backgroundColor: copyStrategy === 'dayOfWeek' ? '#f0f9ff' : '#ffffff',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: '700', fontSize: '0.8rem', color: copyStrategy === 'dayOfWeek' ? '#0284c7' : '#1e293b' }}>
                      <CheckCircle2 size={15} color={copyStrategy === 'dayOfWeek' ? '#0284c7' : '#cbd5e1'} />
                      <span>Dia da Semana</span>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.25rem' }}>
                      1ª Seg vai para 1ª Seg. Recomendado para hemodiálise.
                    </div>
                  </div>

                  <div 
                    onClick={() => setCopyStrategy('exactDay')}
                    style={{
                      padding: '0.75rem',
                      borderRadius: '8px',
                      border: `1.5px solid ${copyStrategy === 'exactDay' ? '#0284c7' : '#e2e8f0'}`,
                      backgroundColor: copyStrategy === 'exactDay' ? '#f0f9ff' : '#ffffff',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: '700', fontSize: '0.8rem', color: copyStrategy === 'exactDay' ? '#0284c7' : '#1e293b' }}>
                      <CheckCircle2 size={15} color={copyStrategy === 'exactDay' ? '#0284c7' : '#cbd5e1'} />
                      <span>Dia do Mês</span>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.25rem' }}>
                      Dia 01 vai para dia 01, dia 02 para 02, etc.
                    </div>
                  </div>
                </div>
              </div>

              {/* Seção 3: Setores */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: '800', color: '#334155', margin: 0 }}>
                    Setores
                  </label>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button
                      type="button"
                      onClick={() => setCopySectors(['Salão 1', 'Salão 2', 'Salão 3', 'DP'])}
                      style={{ background: 'none', border: 'none', fontSize: '0.72rem', color: '#0284c7', fontWeight: '700', cursor: 'pointer' }}
                    >
                      Todos
                    </button>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {['Salão 1', 'Salão 2', 'Salão 3', 'DP'].map(sec => {
                    const isSelected = copySectors.includes(sec);
                    return (
                      <button
                        key={sec}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            if (copySectors.length > 1) {
                              setCopySectors(copySectors.filter(s => s !== sec));
                            }
                          } else {
                            setCopySectors([...copySectors, sec]);
                          }
                        }}
                        style={{
                          padding: '0.35rem 0.75rem',
                          borderRadius: '6px',
                          fontSize: '0.78rem',
                          fontWeight: isSelected ? '800' : '600',
                          border: `1px solid ${isSelected ? '#0284c7' : '#cbd5e1'}`,
                          backgroundColor: isSelected ? '#e0f2fe' : '#ffffff',
                          color: isSelected ? '#0369a1' : '#475569',
                          cursor: 'pointer'
                        }}
                      >
                        {sec}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Seção 4: Substituição de Médicos na Cópia */}
              {sourceDoctorList.length > 0 && (
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: '800', color: '#334155', display: 'block', marginBottom: '0.4rem' }}>
                    Substituição
                  </label>
                  <div style={{ 
                    maxHeight: '160px', 
                    overflowY: 'auto', 
                    border: '1px solid #e2e8f0', 
                    borderRadius: '8px', 
                    padding: '0.5rem',
                    backgroundColor: '#fafafa',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.4rem'
                  }}>
                    {sourceDoctorList.map(item => {
                      const currentReplacement = doctorReplacements[item.id] || item.id;
                      return (
                        <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#ffffff', padding: '0.4rem 0.6rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '0.78rem', fontWeight: '700', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {item.name}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                              {item.count} plantões no mês anterior
                            </div>
                          </div>

                          <ArrowRight size={14} color="#94a3b8" />

                          <div style={{ flex: 1.2 }}>
                            <select
                              className="form-control"
                              value={currentReplacement}
                              onChange={e => {
                                setDoctorReplacements({
                                  ...doctorReplacements,
                                  [item.id]: e.target.value
                                });
                              }}
                              style={{ fontSize: '0.75rem', padding: '0.3rem 0.5rem' }}
                            >
                              {availableDoctors.map(doc => (
                                <option key={doc.id || doc.uid || doc.name} value={doc.id || doc.uid || doc.name}>
                                  {formatDoctorDisplayName(doc.name)}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Seção 5: Sobrescrita */}
              <div style={{ padding: '0.6rem 0.8rem', backgroundColor: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', cursor: 'pointer', margin: 0, fontSize: '0.8rem', fontWeight: '600', color: '#334155' }}>
                  <input 
                    type="checkbox" 
                    checked={copyOverwrite} 
                    onChange={e => setCopyOverwrite(e.target.checked)}
                    style={{ width: '16px', height: '16px', accentColor: '#0284c7', cursor: 'pointer' }}
                  />
                  Sobrescrever plantões já cadastrados no mês de destino
                </label>
              </div>

              {/* Prévia e Alerta */}
              {loadingSource ? (
                <div style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.8rem', color: '#64748b' }}>
                  Carregando escala de origem...
                </div>
              ) : sourceSchedules.length === 0 ? (
                <div style={{ padding: '0.75rem', backgroundColor: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '6px', fontSize: '0.78rem', color: '#9a3412', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <AlertTriangle size={16} />
                  <span>Nenhum plantão encontrado no mês de origem selecionado ({sourceMonth}).</span>
                </div>
              ) : (
                <div style={{ padding: '0.75rem', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '6px', fontSize: '0.78rem', color: '#166534', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <CheckCircle2 size={16} />
                  <span>
                    <strong>{previewCopiedList.length} plantões</strong> serão copiados para {selectedMonth} com sucesso.
                  </span>
                </div>
              )}

              {/* Botões do Modal de Cópia */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem', borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem' }}>
                <button 
                  type="button" 
                  onClick={() => setShowCopyModal(false)} 
                  style={styles.cancelBtn}
                >
                  Cancelar
                </button>
                <button 
                  type="button" 
                  onClick={handleExecuteCopy}
                  disabled={previewCopiedList.length === 0 || loadingSource}
                  style={{
                    ...styles.saveBtn,
                    backgroundColor: (previewCopiedList.length === 0 || loadingSource) ? '#94a3b8' : '#16a34a',
                    cursor: (previewCopiedList.length === 0 || loadingSource) ? 'not-allowed' : 'pointer'
                  }}
                >
                  Copiar ({previewCopiedList.length})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Estilos CSS Inline para Impressão e Layout */}
      <style>{`
        @media print {
          @page {
            size: landscape;
            margin: 8mm;
          }
          body {
            background: #ffffff !important;
            font-size: 10pt;
          }
          .no-print {
            display: none !important;
          }
          .print-only {
            display: block !important;
          }
          .week-print-block {
            page-break-inside: avoid;
            margin-bottom: 12mm;
          }
          table {
            border-collapse: collapse !important;
            width: 100% !important;
          }
          th, td {
            border: 1px solid #94a3b8 !important;
            padding: 4px 6px !important;
          }
        }
        @media screen {
          .print-only {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1rem',
    backgroundColor: '#ffffff',
    padding: '1.25rem',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
  },
  title: {
    margin: 0,
    fontSize: '1.1rem',
    fontWeight: '800',
    color: '#0f172a',
  },
  subtitle: {
    margin: '0.2rem 0 0 0',
    fontSize: '0.8rem',
    color: '#64748b',
  },
  viewToggleGroup: {
    display: 'flex',
    backgroundColor: '#f1f5f9',
    borderRadius: '6px',
    padding: '2px',
    border: '1px solid #e2e8f0'
  },
  viewToggleBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.3rem',
    padding: '0.4rem 0.75rem',
    borderRadius: '4px',
    border: 'none',
    backgroundColor: 'transparent',
    color: '#64748b',
    fontSize: '0.8rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.15s ease'
  },
  viewToggleBtnActive: {
    backgroundColor: '#ffffff',
    color: '#0284c7',
    fontWeight: '800',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  printBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    backgroundColor: '#f8fafc',
    color: '#334155',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    padding: '0.45rem 0.85rem',
    fontSize: '0.82rem',
    fontWeight: '700',
    cursor: 'pointer'
  },
  addBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    backgroundColor: '#0284c7',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    padding: '0.45rem 0.95rem',
    fontSize: '0.82rem',
    fontWeight: '700',
    cursor: 'pointer',
  },
  alertStrip: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '0.75rem',
    backgroundColor: '#ffffff',
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
  },
  alertBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
    padding: '0.3rem 0.65rem',
    borderRadius: '20px',
    fontSize: '0.75rem',
    fontWeight: '800',
    border: '1px solid transparent',
  },
  legendContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.85rem',
    fontSize: '0.75rem',
    color: '#475569',
    fontWeight: '600'
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.3rem'
  },
  legendBox: {
    width: '14px',
    height: '14px',
    borderRadius: '3px',
    border: '1px solid'
  },
  printHeader: {
    padding: '0.5rem 0',
    marginBottom: '0.5rem'
  },
  matrixContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem'
  },
  weekTabsBar: {
    display: 'flex',
    gap: '0.4rem',
    overflowX: 'auto',
    paddingBottom: '2px'
  },
  weekTabBtn: {
    padding: '0.45rem 0.85rem',
    borderRadius: '6px',
    border: '1px solid #e2e8f0',
    backgroundColor: '#ffffff',
    color: '#475569',
    fontSize: '0.78rem',
    fontWeight: '600',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'all 0.15s ease'
  },
  weekTabBtnActive: {
    backgroundColor: '#0284c7',
    color: '#ffffff',
    borderColor: '#0284c7',
    fontWeight: '800'
  },
  weekCard: {
    backgroundColor: '#ffffff',
    borderRadius: '10px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
    overflow: 'hidden'
  },
  weekHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.65rem 1rem',
    backgroundColor: '#f8fafc',
    borderBottom: '1px solid #e2e8f0'
  },
  weekTitleBadge: {
    fontSize: '0.8rem',
    fontWeight: '900',
    color: '#0284c7',
    letterSpacing: '0.04em'
  },
  matrixTableWrapper: {
    overflowX: 'auto'
  },
  matrixTable: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.8rem'
  },
  matrixColHeaderFixed: {
    backgroundColor: '#f1f5f9',
    color: '#334155',
    fontWeight: '800',
    padding: '0.5rem 0.75rem',
    border: '1px solid #cbd5e1',
    width: '90px',
    textAlign: 'left'
  },
  matrixColHeaderShift: {
    backgroundColor: '#f1f5f9',
    color: '#334155',
    fontWeight: '800',
    padding: '0.5rem 0.5rem',
    border: '1px solid #cbd5e1',
    width: '65px',
    textAlign: 'center'
  },
  matrixColHeaderDay: {
    backgroundColor: '#f8fafc',
    padding: '0.45rem 0.5rem',
    border: '1px solid #cbd5e1',
    textAlign: 'center',
    minWidth: '130px'
  },
  matrixColHeaderSunday: {
    backgroundColor: '#fef2f2'
  },
  matrixColHeaderSaturday: {
    backgroundColor: '#fffbeb'
  },
  shiftDividerRow: {
    borderBottom: '2px solid #cbd5e1'
  },
  matrixSectorCell: {
    padding: '0.5rem 0.75rem',
    border: '1px solid #e2e8f0',
    backgroundColor: '#ffffff',
    color: '#1e293b',
    fontWeight: '700',
    fontSize: '0.8rem'
  },
  matrixShiftCell: {
    padding: '0.4rem',
    border: '1px solid #e2e8f0',
    backgroundColor: '#f8fafc',
    textAlign: 'center'
  },
  shiftTag: {
    fontSize: '0.72rem',
    fontWeight: '800',
    color: '#0284c7',
    backgroundColor: '#e0f2fe',
    padding: '0.15rem 0.4rem',
    borderRadius: '4px'
  },
  matrixEmptyDayCell: {
    padding: '0.5rem',
    border: '1px solid #f1f5f9',
    backgroundColor: '#f8fafc',
    textAlign: 'center'
  },
  matrixSundayCell: {
    padding: '0.5rem',
    border: '1px solid #e2e8f0',
    backgroundColor: '#f8fafc',
    textAlign: 'center'
  },
  matrixDoctorCell: {
    padding: '0.45rem 0.5rem',
    border: '1px solid #cbd5e1',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    verticalAlign: 'top',
    height: '52px'
  },
  matrixCellRegular: {
    backgroundColor: '#ffffff'
  },
  matrixCellSwap: {
    backgroundColor: '#dcfce7',
    borderColor: '#86efac'
  },
  matrixCellUncovered: {
    backgroundColor: '#fee2e2',
    borderColor: '#fca5a5'
  },
  cellDoctorContent: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    height: '100%'
  },
  cellUncoveredContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '100%'
  },
  vagoBadge: {
    fontSize: '0.7rem',
    fontWeight: '900',
    color: '#991b1b',
    backgroundColor: '#fecaca',
    padding: '0.1rem 0.35rem',
    borderRadius: '4px'
  },
  cellEscalarText: {
    fontSize: '0.68rem',
    color: '#dc2626',
    fontWeight: '700'
  },
  swapMiniBadge: {
    fontSize: '0.62rem',
    fontWeight: '800',
    color: '#166534',
    backgroundColor: '#bbf7d0',
    padding: '0.05rem 0.3rem',
    borderRadius: '3px'
  },
  bottomSection: {
    marginTop: '0.5rem'
  },
  bottomGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '1rem'
  },
  summaryCard: {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    padding: '0.85rem 1rem'
  },
  summaryHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    borderBottom: '1px solid #f1f5f9',
    paddingBottom: '0.4rem'
  },
  summaryTitle: {
    margin: 0,
    fontSize: '0.85rem',
    fontWeight: '800',
    color: '#0f172a'
  },
  swapListItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.35rem 0.5rem',
    borderRadius: '4px',
    backgroundColor: '#f0fdf4',
    border: '1px solid #dcfce7'
  },
  balanceRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.35rem 0.5rem',
    borderRadius: '4px',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0'
  },
  tableWrapper: {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    overflow: 'hidden'
  },
  filterBar: {
    display: 'flex',
    gap: '1.5rem',
    alignItems: 'center',
    padding: '0.75rem 1rem',
    backgroundColor: '#f8fafc',
    borderBottom: '1px solid #e2e8f0',
    flexWrap: 'wrap'
  },
  filterGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem'
  },
  filterLabel: {
    fontSize: '0.75rem',
    fontWeight: '700',
    color: '#64748b'
  },
  filterBtn: {
    padding: '0.25rem 0.6rem',
    borderRadius: '4px',
    border: '1px solid #e2e8f0',
    backgroundColor: '#ffffff',
    color: '#475569',
    fontSize: '0.75rem',
    fontWeight: '600',
    cursor: 'pointer'
  },
  filterBtnActive: {
    backgroundColor: '#0284c7',
    color: '#ffffff',
    borderColor: '#0284c7',
    fontWeight: '800'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.85rem'
  },
  shiftPill: {
    fontSize: '0.72rem',
    fontWeight: '800',
    color: '#0284c7',
    backgroundColor: '#e0f2fe',
    padding: '0.15rem 0.5rem',
    borderRadius: '4px'
  },
  actionIconBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '4px'
  },
  noDataCell: {
    textAlign: 'center',
    padding: '2rem',
    color: '#94a3b8',
    fontSize: '0.85rem'
  },
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
    zIndex: 99999,
    padding: '1rem',
    overflowY: 'auto'
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '520px',
    maxHeight: 'min(90vh, 740px)',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    border: '1px solid #e2e8f0',
    overflow: 'hidden'
  },
  modalHeader: {
    padding: '1.25rem 1.5rem 0.85rem 1.5rem',
    borderBottom: '1px solid #f1f5f9',
    backgroundColor: '#ffffff',
    flexShrink: 0
  },
  modalCloseBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    color: '#94a3b8',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'color 0.15s ease'
  },
  modalForm: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    minHeight: 0,
    overflow: 'hidden'
  },
  modalBody: {
    flex: 1,
    overflowY: 'auto',
    padding: '1rem 1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    minHeight: 0
  },
  modalFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.75rem',
    padding: '0.85rem 1.5rem',
    backgroundColor: '#f8fafc',
    borderTop: '1px solid #e2e8f0',
    flexShrink: 0
  },
  cancelBtn: {
    padding: '0.45rem 0.9rem',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    backgroundColor: '#ffffff',
    color: '#475569',
    fontSize: '0.82rem',
    fontWeight: '600',
    cursor: 'pointer'
  },
  saveBtn: {
    padding: '0.45rem 1.1rem',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: '#0284c7',
    color: '#ffffff',
    fontSize: '0.82rem',
    fontWeight: '800',
    cursor: 'pointer'
  }
};
