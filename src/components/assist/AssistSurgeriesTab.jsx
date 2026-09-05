import React, { useState, useEffect, useMemo } from 'react';
import { dbService } from '../../firebase';
import { INITIAL_PROCEDURES } from '../../services/firebase/procedureService';
import { 
  Calendar as CalendarIcon, Clock, User, Plus, Search, Filter, 
  Printer, ChevronLeft, ChevronRight, Edit3, Trash2, CheckCircle2, 
  AlertTriangle, Shield, MapPin, Stethoscope, AlertCircle, X, Check,
  Activity, ArrowRight, RefreshCw, FileText, Lock, Unlock,
  LayoutGrid, List, CheckCircle, Tag, Eye, HeartPulse, Sparkles
} from 'lucide-react';
import { useUnit } from '../../contexts/UnitContext';

// Procedimentos Frequentes (Sugestões Rápidas de 1 Clique)
const QUICK_PROCEDURES = [
  'CONFECÇÃO DE FAV SIMPLES',
  'IMPLANTE DE PERMCATH',
  'RETIRADA DE PERMCATH',
  'DUPLEX',
  'FAV BASILICA',
  'CDL DE URGENCIA',
  'REVISÃO DE FAV',
  'LIGADURA DE FAV'
];

// Motivos Clínicos Frequentes (Sugestões Rápidas)
const COMMON_MOTIVES = [
  'ACESSO',
  'DOR PUNÇÃO FAV',
  'DOR EM FAV',
  'DIFICULDADE DE PUNÇÃO',
  'ABAULAMENTO DE FAV',
  'ESTENOSE DE FAV',
  'TROMBOSE DE FAV',
  'URGÊNCIA'
];

// Cirurgiões Conhecidos
const COMMON_SURGEONS = [
  'Moisés Arantes Diniz',
  'Alexandre Jesus'
];

// Locais Frequentes
const COMMON_HOSPITALS = [
  'Hospital Regional – Portaria Principal – Sala Cirúrgica 5º Andar',
  'Clínica Dialize',
  'Centro Cirúrgico Central'
];

export default function AssistSurgeriesTab({ currentUser, onOpenPostModalWithPatient }) {
  const { activeUnitId } = useUnit();

  // Estados Principais
  const [surgeries, setSurgeries] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [patients, setPatients] = useState([]);
  const [catalogProcedures, setCatalogProcedures] = useState(INITIAL_PROCEDURES);
  const [isCustomProcedure, setIsCustomProcedure] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Modos de Visualização: 'week' (Semana) | 'month' (Mês) | 'day' (Dia) | 'compact' (Tabela)
  const [viewMode, setViewMode] = useState('week');

  // Sub-modo para Semana: 'cards' (Cartões Clínicos) | 'table' (Linhas)
  const [weekDisplayType, setWeekDisplayType] = useState('cards');

  // Data de Referência (Default inteligente: 2026-09-08 para coincidir com o período vascular)
  const [currentDate, setCurrentDate] = useState('2026-09-08');

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSurgeon, setSelectedSurgeon] = useState('all');
  const [selectedHospital, setSelectedHospital] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Modais
  const [showSurgeryModal, setShowSurgeryModal] = useState(false);
  const [editingSurgery, setEditingSurgery] = useState(null);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [selectedDateForBlock, setSelectedDateForBlock] = useState('');
  const [blockReason, setBlockReason] = useState('NÃO TEREMOS AGENDAMENTO DEVIDO FERIADO');

  // Formulário de Agendamento
  const [formData, setFormData] = useState({
    date: '2026-09-08',
    time: '08:00',
    patientId: '',
    patientName: '',
    procedure: 'CONFECÇÃO DE FAV SIMPLES',
    indication: 'ACESSO',
    surgeon: 'Moisés Arantes Diniz',
    anesthesiologist: 'Sem Agenda',
    hospital: 'Hospital Regional – Portaria Principal – Sala Cirúrgica 5º Andar',
    status: 'Agendado',
    antibiotic: 'Cefazolina 2g IV',
    observations: '',
    postToMural: true
  });

  const [patientSearch, setPatientSearch] = useState('');

  // Notificações Toast
  const showAlert = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 4000);
  };

  // Carregar Dados com resiliência total
  const loadData = async () => {
    setLoading(true);
    try {
      const [surgRes, blockRes, patRes, procRes] = await Promise.allSettled([
        dbService.getSurgeries ? dbService.getSurgeries({ unitId: activeUnitId }) : Promise.resolve([]),
        dbService.getSurgeryBlocks ? dbService.getSurgeryBlocks() : Promise.resolve([]),
        dbService.getPatients ? dbService.getPatients() : Promise.resolve([]),
        dbService.getProcedures ? dbService.getProcedures() : Promise.resolve([])
      ]);

      if (surgRes.status === 'fulfilled') setSurgeries(surgRes.value || []);
      if (blockRes.status === 'fulfilled') setBlocks(blockRes.value || []);
      if (patRes.status === 'fulfilled') setPatients(patRes.value || []);
      if (procRes.status === 'fulfilled' && Array.isArray(procRes.value) && procRes.value.length > 0) {
        setCatalogProcedures(procRes.value);
      } else {
        setCatalogProcedures(INITIAL_PROCEDURES);
      }
    } catch (err) {
      console.error('Erro ao carregar cirurgias:', err);
      showAlert('Erro ao sincronizar cirurgias.', 'danger');
      setCatalogProcedures(INITIAL_PROCEDURES);
    } finally {
      setLoading(false);
    }
  };

  const availableProcedures = useMemo(() => {
    const list = (catalogProcedures && catalogProcedures.length > 0) ? catalogProcedures : INITIAL_PROCEDURES;
    const filtered = list
      .filter(p => p.active !== false && (p.modules ? p.modules.assist === true : true))
      .map(p => (p.name || '').trim().toUpperCase())
      .filter(Boolean);
    const unique = Array.from(new Set(filtered));
    unique.sort((a, b) => a.localeCompare(b));
    return unique.length > 0 ? unique : QUICK_PROCEDURES;
  }, [catalogProcedures]);

  useEffect(() => {
    loadData();
  }, [activeUnitId]);

  // Utilitários de Data para Semana
  const getWeekDates = (dateStr) => {
    const d = new Date(dateStr + 'T12:00:00');
    const day = d.getDay(); // 0 = Dom, 1 = Seg, ...
    const diffToMonday = day === 0 ? -6 : 1 - day;
    
    const monday = new Date(d);
    monday.setDate(d.getDate() + diffToMonday);

    const weekDays = [];
    const dayNames = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'];

    for (let i = 0; i < 5; i++) {
      const current = new Date(monday);
      current.setDate(monday.getDate() + i);
      const yyyy = current.getFullYear();
      const mm = String(current.getMonth() + 1).padStart(2, '0');
      const dd = String(current.getDate()).padStart(2, '0');
      const isoDate = `${yyyy}-${mm}-${dd}`;
      weekDays.push({
        isoDate,
        dayName: dayNames[i],
        formatted: `${dd}/${mm}/${yyyy}`,
        shortFormatted: `${dd}/${mm}`,
        dateObj: current
      });
    }
    return weekDays;
  };

  const weekDays = useMemo(() => getWeekDates(currentDate), [currentDate]);

  // Navegação Temporal
  const handlePrev = () => {
    const d = new Date(currentDate + 'T12:00:00');
    if (viewMode === 'day') {
      d.setDate(d.getDate() - 1);
    } else if (viewMode === 'month') {
      d.setMonth(d.getMonth() - 1);
    } else {
      d.setDate(d.getDate() - 7);
    }
    setCurrentDate(d.toISOString().split('T')[0]);
  };

  const handleNext = () => {
    const d = new Date(currentDate + 'T12:00:00');
    if (viewMode === 'day') {
      d.setDate(d.getDate() + 1);
    } else if (viewMode === 'month') {
      d.setMonth(d.getMonth() + 1);
    } else {
      d.setDate(d.getDate() + 7);
    }
    setCurrentDate(d.toISOString().split('T')[0]);
  };

  const handleToday = () => {
    const todayIso = new Date().toISOString().split('T')[0];
    setCurrentDate(todayIso.startsWith('2026-09') ? todayIso : '2026-09-08');
  };

  // Filtragem de Cirurgias
  const filteredSurgeries = useMemo(() => {
    return surgeries.filter(s => {
      // Filtro de Busca
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchPatient = (s.patientName || '').toLowerCase().includes(term);
        const matchProc = (s.procedure || '').toLowerCase().includes(term);
        const matchMotive = (s.indication || s.motive || '').toLowerCase().includes(term);
        const matchDoc = (s.surgeon || '').toLowerCase().includes(term);
        const matchHosp = (s.hospital || '').toLowerCase().includes(term);
        const matchObs = (s.observations || '').toLowerCase().includes(term);
        if (!matchPatient && !matchProc && !matchMotive && !matchDoc && !matchHosp && !matchObs) {
          return false;
        }
      }

      // Filtro por Cirurgião
      if (selectedSurgeon !== 'all') {
        if ((s.surgeon || '').toLowerCase() !== selectedSurgeon.toLowerCase()) return false;
      }

      // Filtro por Hospital
      if (selectedHospital !== 'all') {
        if ((s.hospital || '').toLowerCase() !== selectedHospital.toLowerCase()) return false;
      }

      // Filtro por Situação
      if (selectedStatus !== 'all') {
        if ((s.status || '').toLowerCase() !== selectedStatus.toLowerCase()) return false;
      }

      return true;
    });
  }, [surgeries, searchTerm, selectedSurgeon, selectedHospital, selectedStatus]);

  // Estatísticas e Métricas KPI no topo
  const kpis = useMemo(() => {
    const total = filteredSurgeries.length;
    let favCount = 0;
    let catheterCount = 0;
    let urgencyCount = 0;
    let completedCount = 0;

    filteredSurgeries.forEach(s => {
      const proc = (s.procedure || '').toUpperCase();
      const status = (s.status || '').toLowerCase();
      const isUrg = s.isUrgency || status === 'urgência' || (s.patientName || '').toUpperCase().includes('URGENCIA');

      if (proc.includes('FAV') || proc.includes('FISTULA')) favCount++;
      if (proc.includes('PERMCATH') || proc.includes('CDL') || proc.includes('CATETER')) catheterCount++;
      if (isUrg) urgencyCount++;
      if (status === 'realizado') completedCount++;
    });

    return { total, favCount, catheterCount, urgencyCount, completedCount };
  }, [filteredSurgeries]);

  // Agrupamento por data
  const surgeriesByDate = useMemo(() => {
    const map = {};
    filteredSurgeries.forEach(s => {
      if (!map[s.date]) map[s.date] = [];
      map[s.date].push(s);
    });
    // Ordena cada dia por horário
    Object.keys(map).forEach(d => {
      map[d].sort((a, b) => (a.time || '').localeCompare(b.time || ''));
    });
    return map;
  }, [filteredSurgeries]);

  // Mapa de Bloqueios por Data
  const blocksByDate = useMemo(() => {
    const map = {};
    blocks.forEach(b => {
      map[b.date] = b.reason;
    });
    return map;
  }, [blocks]);

  // Abrir Modal de Agendamento
  const handleOpenCreateModal = (targetDate = null, defaultTime = '08:00') => {
    setEditingSurgery(null);
    setIsCustomProcedure(false);
    const initialProc = availableProcedures[0] || 'CONFECÇÃO DE FAV SIMPLES';
    setFormData({
      date: targetDate || currentDate,
      time: defaultTime,
      patientId: '',
      patientName: '',
      procedure: initialProc,
      indication: 'ACESSO',
      surgeon: 'Moisés Arantes Diniz',
      anesthesiologist: 'Sem Agenda',
      hospital: 'Hospital Regional – Portaria Principal – Sala Cirúrgica 5º Andar',
      status: 'Agendado',
      antibiotic: 'Cefazolina 2g IV',
      observations: '',
      postToMural: true
    });
    setPatientSearch('');
    setShowSurgeryModal(true);
  };

  const handleOpenEditModal = (surgery) => {
    setEditingSurgery(surgery);
    const currentProc = surgery.procedure || '';
    const isCustom = !!(currentProc && !availableProcedures.includes(currentProc));
    setIsCustomProcedure(isCustom);
    setFormData({
      date: surgery.date || currentDate,
      time: surgery.time || '08:00',
      patientId: surgery.patientId || '',
      patientName: surgery.patientName || '',
      procedure: currentProc || availableProcedures[0] || 'CONFECÇÃO DE FAV SIMPLES',
      indication: surgery.indication || surgery.motive || 'ACESSO',
      surgeon: surgery.surgeon || 'Moisés Arantes Diniz',
      anesthesiologist: surgery.anesthesiologist || 'Sem Agenda',
      hospital: surgery.hospital || 'Hospital Regional – Portaria Principal – Sala Cirúrgica 5º Andar',
      status: surgery.status || 'Agendado',
      antibiotic: surgery.antibiotic || '',
      observations: surgery.observations || '',
      postToMural: false
    });
    setPatientSearch(surgery.patientName || '');
    setShowSurgeryModal(true);
  };

  // Salvar Agendamento
  const handleSaveSurgery = async (e) => {
    e.preventDefault();
    if (!formData.date || !formData.time || !formData.patientName.trim()) {
      showAlert('Preencha data, horário e paciente.', 'warning');
      return;
    }

    setActionLoading(true);
    try {
      const payload = {
        ...formData,
        patientName: formData.patientName.trim().toUpperCase(),
        procedure: formData.procedure.trim().toUpperCase(),
        indication: formData.indication.trim().toUpperCase(),
        unitId: activeUnitId === 'all' ? 'betim' : activeUnitId
      };

      if (editingSurgery) {
        await dbService.updateSurgery(editingSurgery.id, payload, currentUser);
        showAlert('Cirurgia atualizada!', 'success');
      } else {
        await dbService.createSurgery(payload, currentUser);
        showAlert('Cirurgia agendada com sucesso!', 'success');
      }

      setShowSurgeryModal(false);
      loadData();
    } catch (err) {
      console.error(err);
      showAlert('Erro ao salvar agendamento.', 'danger');
    } finally {
      setActionLoading(false);
    }
  };

  // Alternar Situação Rápida (1 Clique: Concluir ou Reabrir)
  const handleToggleStatus = async (surgery) => {
    setActionLoading(true);
    try {
      const nextStatus = surgery.status === 'Realizado' ? 'Agendado' : 'Realizado';
      await dbService.updateSurgery(surgery.id, { ...surgery, status: nextStatus }, currentUser);
      showAlert(`Situação atualizada para ${nextStatus}!`, 'success');
      loadData();
    } catch (err) {
      console.error(err);
      showAlert('Erro ao atualizar situação.', 'danger');
    } finally {
      setActionLoading(false);
    }
  };

  // Excluir Agendamento
  const handleDeleteSurgery = async (surgery) => {
    if (!window.confirm(`Deseja remover o agendamento de ${surgery.patientName}?`)) return;

    setActionLoading(true);
    try {
      await dbService.deleteSurgery(surgery.id, surgery.muralPostId);
      showAlert('Agendamento removido.', 'success');
      loadData();
    } catch (err) {
      console.error(err);
      showAlert('Erro ao excluir cirurgia.', 'danger');
    } finally {
      setActionLoading(false);
    }
  };

  // Bloquear / Desbloquear Dia
  const handleOpenBlockModal = (dateStr) => {
    setSelectedDateForBlock(dateStr);
    setBlockReason(blocksByDate[dateStr] || 'NÃO TEREMOS AGENDAMENTO DEVIDO FERIADO');
    setShowBlockModal(true);
  };

  const handleSaveBlock = async () => {
    setActionLoading(true);
    try {
      await dbService.toggleSurgeryBlock({
        date: selectedDateForBlock,
        reason: blockReason.trim(),
        unitId: activeUnitId === 'all' ? 'betim' : activeUnitId
      });
      showAlert('Bloqueio atualizado!', 'success');
      setShowBlockModal(false);
      loadData();
    } catch (err) {
      console.error(err);
      showAlert('Erro ao atualizar bloqueio.', 'danger');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveBlock = async (dateStr) => {
    if (!window.confirm('Deseja liberar este dia para agendamentos?')) return;
    setActionLoading(true);
    try {
      await dbService.toggleSurgeryBlock({ date: dateStr, reason: '' });
      showAlert('Dia liberado com sucesso!', 'success');
      loadData();
    } catch (err) {
      console.error(err);
      showAlert('Erro ao desbloquear dia.', 'danger');
    } finally {
      setActionLoading(false);
    }
  };

  // Impressão
  const handlePrint = () => {
    window.print();
  };

  // Helper visual para Procedure Pill
  const getProcedureBadgeStyle = (procName = '') => {
    const upper = procName.toUpperCase();
    if (upper.includes('PERMCATH') || upper.includes('CDL')) {
      return { bg: '#ecfdf5', color: '#047857', border: '#a7f3d0' };
    }
    if (upper.includes('FAV') || upper.includes('FISTULA')) {
      return { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' };
    }
    if (upper.includes('DUPLEX')) {
      return { bg: '#f5f3ff', color: '#6d28d9', border: '#ddd6fe' };
    }
    return { bg: '#f8fafc', color: '#334155', border: '#e2e8f0' };
  };

  // Status Badge
  const renderStatusPill = (status, isUrgency) => {
    if (isUrgency || status === 'Urgência') {
      return (
        <span style={styles.pillUrgency}>
          <AlertTriangle size={12} />
          <span>Urgência</span>
        </span>
      );
    }
    if (status === 'Realizado') {
      return (
        <span style={styles.pillSuccess}>
          <CheckCircle2 size={12} />
          <span>Realizado</span>
        </span>
      );
    }
    if (status === 'Pendente') {
      return (
        <span style={styles.pillWarning}>
          <Clock size={12} />
          <span>Pendente</span>
        </span>
      );
    }
    return (
      <span style={styles.pillPrimary}>
        <Clock size={12} />
        <span>Agendado</span>
      </span>
    );
  };

  return (
    <div style={styles.container}>
      {/* Toast Alert */}
      {message.text && (
        <div style={{
          ...styles.alertToast,
          backgroundColor: message.type === 'success' ? '#10b981' : message.type === 'warning' ? '#f59e0b' : '#ef4444'
        }}>
          {message.text}
        </div>
      )}

      {/* KPI DASHBOARD CARDS */}
      <div style={styles.kpiGrid}>
        <div style={styles.kpiCard}>
          <div style={{ ...styles.kpiIconWrapper, backgroundColor: '#eff6ff', color: '#2563eb' }}>
            <CalendarIcon size={22} />
          </div>
          <div style={styles.kpiInfo}>
            <span style={styles.kpiLabel}>Agendadas</span>
            <span style={styles.kpiValue}>{kpis.total}</span>
          </div>
        </div>

        <div style={styles.kpiCard}>
          <div style={{ ...styles.kpiIconWrapper, backgroundColor: '#eef2ff', color: '#4f46e5' }}>
            <Activity size={22} />
          </div>
          <div style={styles.kpiInfo}>
            <span style={styles.kpiLabel}>Fístulas</span>
            <span style={styles.kpiValue}>{kpis.favCount}</span>
          </div>
        </div>

        <div style={styles.kpiCard}>
          <div style={{ ...styles.kpiIconWrapper, backgroundColor: '#ecfdf5', color: '#059669' }}>
            <Shield size={22} />
          </div>
          <div style={styles.kpiInfo}>
            <span style={styles.kpiLabel}>Cateteres</span>
            <span style={styles.kpiValue}>{kpis.catheterCount}</span>
          </div>
        </div>

        <div style={styles.kpiCard}>
          <div style={{ ...styles.kpiIconWrapper, backgroundColor: '#fffbeb', color: '#d97706' }}>
            <AlertTriangle size={22} />
          </div>
          <div style={styles.kpiInfo}>
            <span style={styles.kpiLabel}>Urgências</span>
            <span style={{ ...styles.kpiValue, color: kpis.urgencyCount > 0 ? '#dc2626' : '#d97706' }}>
              {kpis.urgencyCount}
            </span>
          </div>
        </div>

        <div style={styles.kpiCard}>
          <div style={{ ...styles.kpiIconWrapper, backgroundColor: '#f0fdf4', color: '#16a34a' }}>
            <CheckCircle2 size={22} />
          </div>
          <div style={styles.kpiInfo}>
            <span style={styles.kpiLabel}>Realizadas</span>
            <span style={styles.kpiValue}>{kpis.completedCount}</span>
          </div>
        </div>
      </div>

      {/* PAINEL DE CONTROLES, NAVEGAÇÃO E FILTROS */}
      <div style={styles.controlCard}>
        <div style={styles.controlHeaderRow}>
          {/* Modos de Visão: Semana, Mês, Dia, Tabela */}
          <div style={styles.segmentedGroup}>
            <button
              onClick={() => setViewMode('week')}
              style={{
                ...styles.segmentedBtn,
                backgroundColor: viewMode === 'week' ? '#0284c7' : 'transparent',
                color: viewMode === 'week' ? '#ffffff' : '#64748b',
                fontWeight: viewMode === 'week' ? '700' : '600'
              }}
            >
              <CalendarIcon size={15} />
              <span>Semana</span>
            </button>
            <button
              onClick={() => setViewMode('month')}
              style={{
                ...styles.segmentedBtn,
                backgroundColor: viewMode === 'month' ? '#0284c7' : 'transparent',
                color: viewMode === 'month' ? '#ffffff' : '#64748b',
                fontWeight: viewMode === 'month' ? '700' : '600'
              }}
            >
              <LayoutGrid size={15} />
              <span>Mês</span>
            </button>
            <button
              onClick={() => setViewMode('day')}
              style={{
                ...styles.segmentedBtn,
                backgroundColor: viewMode === 'day' ? '#0284c7' : 'transparent',
                color: viewMode === 'day' ? '#ffffff' : '#64748b',
                fontWeight: viewMode === 'day' ? '700' : '600'
              }}
            >
              <Clock size={15} />
              <span>Dia</span>
            </button>
            <button
              onClick={() => setViewMode('compact')}
              style={{
                ...styles.segmentedBtn,
                backgroundColor: viewMode === 'compact' ? '#0284c7' : 'transparent',
                color: viewMode === 'compact' ? '#ffffff' : '#64748b',
                fontWeight: viewMode === 'compact' ? '700' : '600'
              }}
            >
              <List size={15} />
              <span>Tabela</span>
            </button>
          </div>

          {/* Navegação de Datas */}
          <div style={styles.navGroup}>
            <button onClick={handlePrev} style={styles.navSquareBtn} title="Anterior">
              <ChevronLeft size={18} />
            </button>
            <button onClick={handleToday} style={styles.todayTextBtn}>
              Hoje
            </button>
            <button onClick={handleNext} style={styles.navSquareBtn} title="Próximo">
              <ChevronRight size={18} />
            </button>

            <div style={styles.activeRangeBadge}>
              <CalendarIcon size={16} color="#0284c7" />
              <span>
                {viewMode === 'week' && `${weekDays[0].shortFormatted} a ${weekDays[4].shortFormatted}`}
                {viewMode === 'day' && `${currentDate.split('-').reverse().join('/')}`}
                {viewMode === 'month' && `${new Date(currentDate + 'T12:00:00').toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}`}
                {viewMode === 'compact' && 'Todos os Agendamentos'}
              </span>
            </div>
          </div>

          {/* Botões de Ação Principal */}
          <div style={styles.headerActionButtons}>
            {viewMode === 'week' && (
              <div style={styles.weekToggleContainer}>
                <button
                  onClick={() => setWeekDisplayType('cards')}
                  style={{
                    ...styles.subToggleBtn,
                    backgroundColor: weekDisplayType === 'cards' ? '#e0f2fe' : 'transparent',
                    color: weekDisplayType === 'cards' ? '#0369a1' : '#64748b',
                    fontWeight: weekDisplayType === 'cards' ? '700' : '500'
                  }}
                  title="Exibição em Cards Interativos"
                >
                  <LayoutGrid size={14} />
                  <span>Cards</span>
                </button>
                <button
                  onClick={() => setWeekDisplayType('table')}
                  style={{
                    ...styles.subToggleBtn,
                    backgroundColor: weekDisplayType === 'table' ? '#e0f2fe' : 'transparent',
                    color: weekDisplayType === 'table' ? '#0369a1' : '#64748b',
                    fontWeight: weekDisplayType === 'table' ? '700' : '500'
                  }}
                  title="Exibição em Linhas de Tabela"
                >
                  <List size={14} />
                  <span>Linhas</span>
                </button>
              </div>
            )}

            <button onClick={handlePrint} style={styles.secondaryActionBtn} title="Imprimir Mapa Cirúrgico">
              <Printer size={16} />
              <span>Imprimir</span>
            </button>

            <button onClick={() => handleOpenCreateModal()} style={styles.primaryActionBtn}>
              <Plus size={17} />
              <span>Agendar</span>
            </button>
          </div>
        </div>

        {/* Linha de Busca e Filtros */}
        <div style={styles.filterBar}>
          <div style={styles.searchBox}>
            <Search size={16} color="#94a3b8" />
            <input
              type="text"
              placeholder="Buscar paciente, procedimento, motivo ou cirurgião..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} style={styles.clearSearchBtn}>
                <X size={14} />
              </button>
            )}
          </div>

          <div style={styles.filterGroup}>
            <select
              value={selectedSurgeon}
              onChange={(e) => setSelectedSurgeon(e.target.value)}
              style={styles.filterSelect}
            >
              <option value="all">Cirurgião</option>
              {COMMON_SURGEONS.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            <select
              value={selectedHospital}
              onChange={(e) => setSelectedHospital(e.target.value)}
              style={styles.filterSelect}
            >
              <option value="all">Local</option>
              <option value="Hospital Regional – Portaria Principal – Sala Cirúrgica 5º Andar">Hospital Regional</option>
              <option value="Clínica Dialize">Clínica Dialize</option>
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              style={styles.filterSelect}
            >
              <option value="all">Situação</option>
              <option value="Agendado">Agendado</option>
              <option value="Pendente">Pendente</option>
              <option value="Realizado">Realizado</option>
              <option value="Urgência">Urgência</option>
            </select>
          </div>
        </div>
      </div>

      {/* CONTEÚDO PRINCIPAL DE AGENDAMENTO */}

      {/* 1. MODO SEMANA */}
      {viewMode === 'week' && (
        <div style={styles.weekLayout}>
          {weekDays.map(day => {
            const daySurgeries = surgeriesByDate[day.isoDate] || [];
            const blockReason = blocksByDate[day.isoDate];
            const isBlocked = !!blockReason;

            // Extrai parâmetros dominantes do dia
            const firstSurg = daySurgeries[0];
            const surgeonName = firstSurg?.surgeon || (day.dayName === 'Quarta' || day.dayName === 'Quinta' ? 'Alexandre Jesus' : 'Moisés Arantes Diniz');
            const anesthesiologistName = firstSurg?.anesthesiologist || (day.dayName === 'Quinta' ? 'Matheus' : day.dayName === 'Sexta' ? 'Bruno Xavier' : 'Sem Agenda');
            const hospitalName = firstSurg?.hospital || (day.dayName === 'Quarta' ? 'Clínica Dialize' : 'Hospital Regional');
            const startTime = firstSurg?.time || (day.dayName === 'Quinta' || day.dayName === 'Sexta' ? '08:00' : '12:00');

            return (
              <div key={day.isoDate} style={styles.daySectionCard}>
                {/* Header Elegante do Dia */}
                <div style={styles.dayHeader}>
                  <div style={styles.dayHeaderLeft}>
                    <div style={styles.dayDateChip}>
                      <span style={styles.dayDateChipDay}>{day.dayName}</span>
                      <span style={styles.dayDateChipDate}>{day.shortFormatted}</span>
                    </div>

                    <div style={styles.daySessionMeta}>
                      <div style={styles.metaChip} title="Cirurgião Responsável">
                        <User size={13} color="#0284c7" />
                        <span>{surgeonName}</span>
                      </div>
                      <div style={styles.metaChip} title="Local da Cirurgia">
                        <MapPin size={13} color="#0284c7" />
                        <span>{hospitalName.includes('Regional') ? 'Hospital Regional' : hospitalName}</span>
                      </div>
                      <div style={styles.metaChip} title="Anestesista">
                        <Stethoscope size={13} color="#64748b" />
                        <span>{anesthesiologistName}</span>
                      </div>
                      <div style={styles.metaChip} title="Horário de Início">
                        <Clock size={13} color="#64748b" />
                        <span>Início: {startTime}</span>
                      </div>
                    </div>
                  </div>

                  <div style={styles.dayHeaderRight}>
                    <span style={styles.dayCounterBadge}>
                      {daySurgeries.length} {daySurgeries.length === 1 ? 'procedimento' : 'procedimentos'}
                    </span>

                    {isBlocked ? (
                      <button 
                        onClick={() => handleRemoveBlock(day.isoDate)}
                        style={styles.unblockActionBtn}
                        title="Desbloquear este dia"
                      >
                        <Unlock size={14} />
                        <span>Desbloquear</span>
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleOpenBlockModal(day.isoDate)}
                        style={styles.blockActionBtn}
                        title="Bloquear dia para feriado ou recesso"
                      >
                        <Lock size={14} />
                        <span>Bloquear</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleOpenCreateModal(day.isoDate, startTime)}
                      style={styles.quickAddDayBtn}
                      title="Agendar procedimento neste dia"
                    >
                      <Plus size={14} />
                      <span>Agendar</span>
                    </button>
                  </div>
                </div>

                {/* Conteúdo do Dia */}
                {isBlocked ? (
                  <div style={styles.blockedDayNotice}>
                    <AlertCircle size={22} color="#b45309" />
                    <div>
                      <strong style={{ display: 'block', fontSize: '0.92rem' }}>Dia Bloqueado para Agendamentos</strong>
                      <span style={{ fontSize: '0.84rem', opacity: 0.9 }}>{blockReason}</span>
                    </div>
                  </div>
                ) : daySurgeries.length === 0 ? (
                  <div style={styles.emptyDayContainer}>
                    <p style={{ margin: 0, fontSize: '0.88rem', color: '#94a3b8' }}>
                      Nenhum procedimento agendado para {day.dayName.toLowerCase()}.
                    </p>
                    <button 
                      onClick={() => handleOpenCreateModal(day.isoDate, startTime)}
                      style={styles.emptyDayAddBtn}
                    >
                      <Plus size={14} />
                      <span>Adicionar Agendamento</span>
                    </button>
                  </div>
                ) : weekDisplayType === 'cards' ? (
                  /* Grade de Cards Modernos */
                  <div style={styles.surgeryCardsGrid}>
                    {daySurgeries.map((surg, idx) => {
                      const procStyle = getProcedureBadgeStyle(surg.procedure);
                      const isUrgent = surg.isUrgency || (surg.status === 'Urgência') || (surg.patientName || '').toUpperCase().includes('URGENCIA');

                      return (
                        <div 
                          key={surg.id || idx} 
                          style={{
                            ...styles.surgeryCard,
                            borderLeft: isUrgent ? '4px solid #ef4444' : surg.status === 'Realizado' ? '4px solid #10b981' : '4px solid #0284c7'
                          }}
                        >
                          {/* Topo do Card: Horário & Situação */}
                          <div style={styles.surgeryCardHeader}>
                            <div style={styles.surgeryTimeChip}>
                              <Clock size={13} color="#0284c7" />
                              <span>{surg.time}</span>
                            </div>

                            <div style={styles.surgeryCardStatus}>
                              {renderStatusPill(surg.status, surg.isUrgency)}
                            </div>
                          </div>

                          {/* Nome do Paciente em Destaque */}
                          <div style={styles.surgeryPatientBlock}>
                            <span style={styles.surgeryPatientName}>
                              {surg.patientName}
                            </span>
                            {(surg.indication || surg.motive) && (
                              <span style={styles.surgeryMotiveChip}>
                                {surg.indication || surg.motive}
                              </span>
                            )}
                          </div>

                          {/* Procedimento Cirúrgico */}
                          <div style={{
                            ...styles.surgeryProcedureBadge,
                            backgroundColor: procStyle.bg,
                            color: procStyle.color,
                            border: `1px solid ${procStyle.border}`
                          }}>
                            <HeartPulse size={14} />
                            <span>{surg.procedure}</span>
                          </div>

                          {/* Detalhes Clínicos Secundários */}
                          <div style={styles.surgeryDetailsRow}>
                            {surg.antibiotic && (
                              <span style={styles.surgeryAtbChip} title="Antibiótico Profilático">
                                💊 {surg.antibiotic}
                              </span>
                            )}
                            {surg.observations && (
                              <span style={styles.surgeryObsChip} title="Observações">
                                ⚠️ {surg.observations}
                              </span>
                            )}
                          </div>

                          {/* Rodapé de Ações Rápidas */}
                          <div style={styles.surgeryCardFooter}>
                            <button
                              onClick={() => handleToggleStatus(surg)}
                              style={{
                                ...styles.quickStatusToggleBtn,
                                backgroundColor: surg.status === 'Realizado' ? '#f0fdf4' : '#f8fafc',
                                color: surg.status === 'Realizado' ? '#16a34a' : '#64748b'
                              }}
                              title={surg.status === 'Realizado' ? 'Reabrir agendamento' : 'Marcar como Realizado'}
                            >
                              <CheckCircle size={14} />
                              <span>{surg.status === 'Realizado' ? 'Realizado' : 'Concluir'}</span>
                            </button>

                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button
                                onClick={() => handleOpenEditModal(surg)}
                                style={styles.actionIconBtn}
                                title="Editar Agendamento"
                              >
                                <Edit3 size={15} color="#0284c7" />
                              </button>
                              <button
                                onClick={() => handleDeleteSurgery(surg)}
                                style={styles.actionIconBtnDanger}
                                title="Excluir Agendamento"
                              >
                                <Trash2 size={15} color="#ef4444" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  /* Exibição em Linhas de Tabela Moderna */
                  <div style={styles.tableCardContainer}>
                    <table style={styles.modernTable}>
                      <thead>
                        <tr>
                          <th style={{ ...styles.th, width: '85px' }}>Horário</th>
                          <th style={styles.th}>Paciente</th>
                          <th style={styles.th}>Procedimento</th>
                          <th style={styles.th}>Motivo</th>
                          <th style={styles.th}>ATB</th>
                          <th style={styles.th}>Observação</th>
                          <th style={{ ...styles.th, width: '110px' }}>Situação</th>
                          <th style={{ ...styles.th, width: '100px', textAlign: 'center' }}>Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {daySurgeries.map((surg, idx) => (
                          <tr key={surg.id || idx} style={styles.tr}>
                            <td style={styles.tdTime}>
                              <Clock size={13} color="#0284c7" />
                              <span>{surg.time}</span>
                            </td>
                            <td style={styles.tdPatient}>
                              <strong>{surg.patientName}</strong>
                            </td>
                            <td style={styles.tdProc}>
                              <span style={styles.inlineProcBadge}>{surg.procedure}</span>
                            </td>
                            <td style={styles.tdMotive}>{surg.indication || surg.motive || '--'}</td>
                            <td style={styles.tdAtb}>{surg.antibiotic || '--'}</td>
                            <td style={styles.tdObs}>{surg.observations || '--'}</td>
                            <td style={styles.tdStatus}>{renderStatusPill(surg.status, surg.isUrgency)}</td>
                            <td style={styles.tdActions}>
                              <button onClick={() => handleOpenEditModal(surg)} style={styles.actionIconBtn} title="Editar">
                                <Edit3 size={14} color="#0284c7" />
                              </button>
                              <button onClick={() => handleDeleteSurgery(surg)} style={styles.actionIconBtnDanger} title="Excluir">
                                <Trash2 size={14} color="#ef4444" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 2. MODO MÊS */}
      {viewMode === 'month' && (
        <div style={styles.monthCard}>
          <div style={styles.monthNotice}>
            <CalendarIcon size={18} color="#0284c7" />
            <span>Distribuição mensal de procedimentos cirúrgicos. Clique em qualquer dia para abrir os detalhes.</span>
          </div>
          <div style={styles.monthGrid}>
            {weekDays.map(d => {
              const count = (surgeriesByDate[d.isoDate] || []).length;
              const isBlocked = !!blocksByDate[d.isoDate];
              return (
                <div 
                  key={d.isoDate} 
                  style={{
                    ...styles.monthDayBox,
                    backgroundColor: isBlocked ? '#fef2f2' : count > 0 ? '#f0f9ff' : '#ffffff',
                    borderColor: count > 0 ? '#bae6fd' : '#e2e8f0'
                  }}
                  onClick={() => {
                    setCurrentDate(d.isoDate);
                    setViewMode('day');
                  }}
                >
                  <div style={styles.monthDayHeader}>
                    <strong>{d.dayName}</strong>
                    <span style={styles.monthDayDateText}>{d.shortFormatted}</span>
                  </div>
                  {isBlocked ? (
                    <span style={styles.monthBlockedBadge}>Bloqueado</span>
                  ) : (
                    <div style={styles.monthCountBadge}>
                      <Activity size={14} color="#0284c7" />
                      <span>{count} {count === 1 ? 'Cirurgia' : 'Cirurgias'}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. MODO DIA (TIMELINE CRONOLÓGICA) */}
      {viewMode === 'day' && (
        <div style={styles.dayContainer}>
          <div style={styles.dayTimelineHeader}>
            <div>
              <h3 style={styles.dayTitle}>
                {new Date(currentDate + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }).toUpperCase()}
              </h3>
              <span style={styles.daySub}>
                {blocksByDate[currentDate] ? `Bloqueio: ${blocksByDate[currentDate]}` : `${(surgeriesByDate[currentDate] || []).length} procedimentos programados`}
              </span>
            </div>
            <button onClick={() => handleOpenCreateModal(currentDate)} style={styles.primaryActionBtn}>
              <Plus size={16} />
              <span>Agendar</span>
            </button>
          </div>

          {blocksByDate[currentDate] ? (
            <div style={styles.blockedDayNotice}>
              <AlertCircle size={22} color="#b45309" />
              <div>
                <strong>Dia Bloqueado</strong>
                <p style={{ margin: '4px 0 0 0' }}>{blocksByDate[currentDate]}</p>
              </div>
            </div>
          ) : (surgeriesByDate[currentDate] || []).length === 0 ? (
            <div style={styles.emptyDayContainer}>
              <p style={{ margin: 0, color: '#94a3b8' }}>Nenhum procedimento agendado para esta data.</p>
              <button onClick={() => handleOpenCreateModal(currentDate)} style={styles.emptyDayAddBtn}>
                <Plus size={14} />
                <span>Adicionar Cirurgia</span>
              </button>
            </div>
          ) : (
            <div style={styles.timelineList}>
              {(surgeriesByDate[currentDate] || []).map((surg, idx) => (
                <div key={surg.id || idx} style={styles.timelineCard}>
                  <div style={styles.timelineTimeBox}>
                    <Clock size={16} color="#0284c7" />
                    <strong>{surg.time}</strong>
                  </div>

                  <div style={styles.timelineInfo}>
                    <div style={styles.timelineHeaderRow}>
                      <h4 style={styles.timelinePatient}>{surg.patientName}</h4>
                      {renderStatusPill(surg.status, surg.isUrgency)}
                    </div>

                    <div style={styles.timelineDetailsGrid}>
                      <div>
                        <span style={styles.detailLabel}>Procedimento:</span>
                        <span style={styles.detailVal}>{surg.procedure}</span>
                      </div>
                      <div>
                        <span style={styles.detailLabel}>Motivo:</span>
                        <span style={styles.detailVal}>{surg.indication || surg.motive || '--'}</span>
                      </div>
                      <div>
                        <span style={styles.detailLabel}>Cirurgião:</span>
                        <span style={styles.detailVal}>{surg.surgeon}</span>
                      </div>
                      <div>
                        <span style={styles.detailLabel}>Anestesista:</span>
                        <span style={styles.detailVal}>{surg.anesthesiologist || 'Sem Agenda'}</span>
                      </div>
                      <div>
                        <span style={styles.detailLabel}>Local:</span>
                        <span style={styles.detailVal}>{surg.hospital}</span>
                      </div>
                      <div>
                        <span style={styles.detailLabel}>ATB:</span>
                        <span style={styles.detailVal}>{surg.antibiotic || '--'}</span>
                      </div>
                    </div>

                    {surg.observations && (
                      <div style={{ marginTop: '6px', fontSize: '0.82rem', color: '#64748b' }}>
                        <strong>Obs:</strong> {surg.observations}
                      </div>
                    )}
                  </div>

                  <div style={styles.timelineActions}>
                    <button onClick={() => handleToggleStatus(surg)} style={styles.actionIconBtn} title="Alternar Situação">
                      <CheckCircle size={16} color="#16a34a" />
                    </button>
                    <button onClick={() => handleOpenEditModal(surg)} style={styles.actionIconBtn} title="Editar">
                      <Edit3 size={16} color="#0284c7" />
                    </button>
                    <button onClick={() => handleDeleteSurgery(surg)} style={styles.actionIconBtnDanger} title="Excluir">
                      <Trash2 size={16} color="#ef4444" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 4. MODO COMPACTO (TABELA GERAL) */}
      {viewMode === 'compact' && (
        <div style={styles.compactCard}>
          <div style={styles.tableCardContainer}>
            <table style={styles.modernTable}>
              <thead>
                <tr>
                  <th style={styles.th}>Data</th>
                  <th style={styles.th}>Horário</th>
                  <th style={styles.th}>Paciente</th>
                  <th style={styles.th}>Procedimento</th>
                  <th style={styles.th}>Motivo</th>
                  <th style={styles.th}>Cirurgião</th>
                  <th style={styles.th}>Local</th>
                  <th style={styles.th}>Situação</th>
                  <th style={styles.th}>ATB</th>
                  <th style={styles.th}>Observação</th>
                  <th style={{ ...styles.th, textAlign: 'center' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredSurgeries.length === 0 ? (
                  <tr>
                    <td colSpan={11} style={styles.emptyTd}>
                      Nenhum agendamento localizado para os filtros informados.
                    </td>
                  </tr>
                ) : (
                  filteredSurgeries.map((surg, idx) => (
                    <tr key={surg.id || idx} style={styles.tr}>
                      <td style={styles.tdDate}>{surg.date.split('-').reverse().join('/')}</td>
                      <td style={styles.tdTime}>{surg.time}</td>
                      <td style={styles.tdPatient}><strong>{surg.patientName}</strong></td>
                      <td style={styles.tdProc}>
                        <span style={styles.inlineProcBadge}>{surg.procedure}</span>
                      </td>
                      <td style={styles.tdMotive}>{surg.indication || surg.motive || '--'}</td>
                      <td style={styles.tdDoc}>{surg.surgeon}</td>
                      <td style={styles.tdHosp}>{surg.hospital.includes('Regional') ? 'Hospital Regional' : surg.hospital}</td>
                      <td style={styles.tdStatus}>{renderStatusPill(surg.status, surg.isUrgency)}</td>
                      <td style={styles.tdAtb}>{surg.antibiotic || '--'}</td>
                      <td style={styles.tdObs}>{surg.observations || '--'}</td>
                      <td style={styles.tdActions}>
                        <button onClick={() => handleOpenEditModal(surg)} style={styles.actionIconBtn} title="Editar">
                          <Edit3 size={14} color="#0284c7" />
                        </button>
                        <button onClick={() => handleDeleteSurgery(surg)} style={styles.actionIconBtnDanger} title="Excluir">
                          <Trash2 size={14} color="#ef4444" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL DE AGENDAMENTO CIRÚRGICO */}
      {showSurgeryModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <div style={styles.modalHeader}>
              <div style={styles.modalHeaderLeft}>
                <div style={styles.modalIconWrapper}>
                  <HeartPulse size={20} color="#0284c7" />
                </div>
                <div>
                  <h3 style={styles.modalTitle}>
                    {editingSurgery ? 'Editar Agendamento' : 'Novo Agendamento Cirúrgico'}
                  </h3>
                  <span style={styles.modalSubTitle}>Preencha as informações do mapa cirúrgico</span>
                </div>
              </div>
              <button onClick={() => setShowSurgeryModal(false)} style={styles.modalCloseBtn}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveSurgery} style={styles.formContainer}>
              <div style={styles.formGrid2}>
                <div>
                  <label style={styles.formLabel}>Data</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    style={styles.formInput}
                  />
                </div>

                <div>
                  <label style={styles.formLabel}>Horário</label>
                  <input
                    type="time"
                    required
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    style={styles.formInput}
                  />
                </div>
              </div>

              {/* Paciente com Autocomplete e botão de Urgência */}
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Paciente</label>
                <div style={styles.patientInputWrapper}>
                  <input
                    type="text"
                    required
                    placeholder="Nome do paciente..."
                    value={formData.patientName}
                    onChange={(e) => {
                      setFormData({ ...formData, patientName: e.target.value, patientId: '' });
                      setPatientSearch(e.target.value);
                    }}
                    style={styles.formInput}
                  />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, patientName: 'CDL DE URGENCIA', status: 'Urgência' })}
                    style={styles.quickUrgencyBtn}
                    title="Preencher como vaga de urgência"
                  >
                    <AlertTriangle size={13} />
                    <span>Urgência</span>
                  </button>
                </div>

                {/* Sugestões de pacientes */}
                {patientSearch && !formData.patientId && patients.length > 0 && (
                  <div style={styles.patientDropdown}>
                    {patients
                      .filter(p => (p.name || '').toLowerCase().includes(patientSearch.toLowerCase()))
                      .slice(0, 4)
                      .map(p => (
                        <div
                          key={p.id}
                          onClick={() => {
                            setFormData({ ...formData, patientName: p.name, patientId: p.id });
                            setPatientSearch('');
                          }}
                          style={styles.patientDropdownItem}
                        >
                          <strong>{p.name}</strong>
                          <span style={styles.patientDropdownMeta}>
                            {p.cpf ? `CPF: ${p.cpf}` : ''} {p.room ? `• ${p.room}` : ''}
                          </span>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {/* Procedimento com Chips Rápidos */}
              <div style={styles.formGroup}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={styles.formLabel}>Procedimento</label>
                  <button
                    type="button"
                    onClick={() => setIsCustomProcedure(!isCustomProcedure)}
                    style={styles.toggleCustomBtn}
                  >
                    {isCustomProcedure ? 'Selecionar do Catálogo' : 'Digitar Manualmente'}
                  </button>
                </div>

                {/* Chips de Procedimentos Populares */}
                <div style={styles.quickChipsRow}>
                  {QUICK_PROCEDURES.slice(0, 4).map(qp => (
                    <button
                      key={qp}
                      type="button"
                      onClick={() => setFormData({ ...formData, procedure: qp })}
                      style={{
                        ...styles.quickChip,
                        backgroundColor: formData.procedure === qp ? '#0284c7' : '#f1f5f9',
                        color: formData.procedure === qp ? '#ffffff' : '#475569'
                      }}
                    >
                      {qp}
                    </button>
                  ))}
                </div>

                {!isCustomProcedure ? (
                  <select
                    required
                    value={formData.procedure}
                    onChange={(e) => setFormData({ ...formData, procedure: e.target.value })}
                    style={styles.formSelect}
                  >
                    <option value="">Selecione o procedimento...</option>
                    {availableProcedures.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                    {formData.procedure && !availableProcedures.includes(formData.procedure) && (
                      <option value={formData.procedure}>{formData.procedure}</option>
                    )}
                  </select>
                ) : (
                  <input
                    type="text"
                    placeholder="Digite o procedimento cirúrgico..."
                    value={formData.procedure}
                    onChange={(e) => setFormData({ ...formData, procedure: e.target.value })}
                    style={styles.formInput}
                    autoFocus
                    required
                  />
                )}
              </div>

              <div style={styles.formGrid2}>
                <div>
                  <label style={styles.formLabel}>Motivo</label>
                  <input
                    type="text"
                    required
                    list="motivesList"
                    value={formData.indication}
                    onChange={(e) => setFormData({ ...formData, indication: e.target.value })}
                    style={styles.formInput}
                  />
                  <datalist id="motivesList">
                    {COMMON_MOTIVES.map(m => <option key={m} value={m} />)}
                  </datalist>
                </div>

                <div>
                  <label style={styles.formLabel}>Situação</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    style={styles.formSelect}
                  >
                    <option value="Agendado">Agendado</option>
                    <option value="Pendente">Pendente</option>
                    <option value="Realizado">Realizado</option>
                    <option value="Urgência">Urgência</option>
                    <option value="Cancelado">Cancelado</option>
                  </select>
                </div>
              </div>

              <div style={styles.formGrid2}>
                <div>
                  <label style={styles.formLabel}>Cirurgião</label>
                  <input
                    type="text"
                    required
                    list="surgeonsList"
                    value={formData.surgeon}
                    onChange={(e) => setFormData({ ...formData, surgeon: e.target.value })}
                    style={styles.formInput}
                  />
                  <datalist id="surgeonsList">
                    {COMMON_SURGEONS.map(s => <option key={s} value={s} />)}
                  </datalist>
                </div>

                <div>
                  <label style={styles.formLabel}>Anestesista</label>
                  <input
                    type="text"
                    placeholder="Sem Agenda, Matheus, Bruno..."
                    value={formData.anesthesiologist}
                    onChange={(e) => setFormData({ ...formData, anesthesiologist: e.target.value })}
                    style={styles.formInput}
                  />
                </div>
              </div>

              <div style={styles.formGrid2}>
                <div>
                  <label style={styles.formLabel}>Local</label>
                  <input
                    type="text"
                    required
                    list="hospitalsList"
                    value={formData.hospital}
                    onChange={(e) => setFormData({ ...formData, hospital: e.target.value })}
                    style={styles.formInput}
                  />
                  <datalist id="hospitalsList">
                    {COMMON_HOSPITALS.map(h => <option key={h} value={h} />)}
                  </datalist>
                </div>

                <div>
                  <label style={styles.formLabel}>Antibiótico</label>
                  <input
                    type="text"
                    placeholder="Cefazolina 2g IV..."
                    value={formData.antibiotic}
                    onChange={(e) => setFormData({ ...formData, antibiotic: e.target.value })}
                    style={styles.formInput}
                  />
                </div>
              </div>

              <div>
                <label style={styles.formLabel}>Observação</label>
                <input
                  type="text"
                  placeholder="Ex: Aguardando PTFE, Pendente de Risco Cirúrgico..."
                  value={formData.observations}
                  onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                  style={styles.formInput}
                />
              </div>

              {!editingSurgery && (
                <label style={styles.checkboxContainer}>
                  <input
                    type="checkbox"
                    checked={formData.postToMural}
                    onChange={(e) => setFormData({ ...formData, postToMural: e.target.checked })}
                    style={{ accentColor: '#0284c7' }}
                  />
                  <span>Publicar no Mural com as informações deste agendamento</span>
                </label>
              )}

              <div style={styles.modalActionButtons}>
                <button
                  type="button"
                  onClick={() => setShowSurgeryModal(false)}
                  style={styles.modalCancelBtn}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  style={styles.primaryActionBtn}
                >
                  {actionLoading ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE BLOQUEIO DE DIA */}
      {showBlockModal && (
        <div style={styles.modalOverlay}>
          <div style={{ ...styles.modalCard, maxWidth: '440px' }}>
            <div style={styles.modalHeader}>
              <div style={styles.modalHeaderLeft}>
                <div style={{ ...styles.modalIconWrapper, backgroundColor: '#fef3c7' }}>
                  <Lock size={20} color="#b45309" />
                </div>
                <div>
                  <h3 style={styles.modalTitle}>Bloquear Dia</h3>
                  <span style={styles.modalSubTitle}>{selectedDateForBlock.split('-').reverse().join('/')}</span>
                </div>
              </div>
              <button onClick={() => setShowBlockModal(false)} style={styles.modalCloseBtn}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '20px' }}>
              <p style={{ margin: '0 0 16px 0', fontSize: '0.88rem', color: '#64748b' }}>
                Informe a justificativa para bloquear agendamentos neste dia:
              </p>

              <label style={styles.formLabel}>Justificativa</label>
              <input
                type="text"
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                placeholder="Ex: NÃO TEREMOS AGENDAMENTO DEVIDO FERIADO"
                style={styles.formInput}
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button
                  type="button"
                  onClick={() => setShowBlockModal(false)}
                  style={styles.modalCancelBtn}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveBlock}
                  disabled={actionLoading}
                  style={{ ...styles.primaryActionBtn, backgroundColor: '#b45309' }}
                >
                  {actionLoading ? 'Salvando...' : 'Confirmar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Estilos Vanilla CSS Modernos e Padronizados
const styles = {
  container: {
    padding: '0 0 40px 0',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  alertToast: {
    position: 'fixed',
    top: '20px',
    right: '20px',
    color: '#fff',
    padding: '12px 20px',
    borderRadius: '10px',
    boxShadow: '0 6px 16px rgba(0,0,0,0.15)',
    zIndex: 9999,
    fontWeight: '600',
    fontSize: '0.88rem'
  },

  // KPI Dashboard Cards
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
    gap: '14px'
  },
  kpiCard: {
    backgroundColor: '#ffffff',
    borderRadius: '14px',
    padding: '16px 18px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    transition: 'transform 0.15s ease, box-shadow 0.15s ease'
  },
  kpiIconWrapper: {
    width: '46px',
    height: '46px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  kpiInfo: {
    display: 'flex',
    flexDirection: 'column'
  },
  kpiLabel: {
    fontSize: '0.78rem',
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.3px'
  },
  kpiValue: {
    fontSize: '1.45rem',
    fontWeight: '800',
    color: '#0f172a',
    lineHeight: 1.2
  },

  // Painel de Controle e Filtros
  controlCard: {
    backgroundColor: '#ffffff',
    borderRadius: '14px',
    padding: '18px 20px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  controlHeaderRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '14px'
  },
  segmentedGroup: {
    display: 'inline-flex',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    padding: '4px',
    borderRadius: '10px',
    gap: '3px',
    border: '1px solid #e2e8f0'
  },
  segmentedBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '7px 14px',
    borderRadius: '7px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.84rem',
    transition: 'all 0.15s ease'
  },
  navGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  navSquareBtn: {
    width: '34px',
    height: '34px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    backgroundColor: '#ffffff',
    color: '#334155',
    cursor: 'pointer',
    transition: 'background 0.2s'
  },
  todayTextBtn: {
    padding: '7px 14px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    backgroundColor: '#ffffff',
    color: '#334155',
    fontWeight: '600',
    fontSize: '0.82rem',
    cursor: 'pointer'
  },
  activeRangeBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginLeft: '6px',
    fontWeight: '700',
    fontSize: '0.9rem',
    color: '#0f172a'
  },
  headerActionButtons: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  weekToggleContainer: {
    display: 'inline-flex',
    backgroundColor: '#f1f5f9',
    padding: '3px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    gap: '3px'
  },
  subToggleBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    padding: '5px 10px',
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.78rem'
  },
  primaryActionBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 18px',
    borderRadius: '9px',
    border: 'none',
    backgroundColor: '#0284c7',
    color: '#ffffff',
    fontWeight: '700',
    fontSize: '0.88rem',
    cursor: 'pointer',
    boxShadow: '0 2px 6px rgba(2, 132, 199, 0.25)',
    transition: 'all 0.2s'
  },
  secondaryActionBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    borderRadius: '9px',
    border: '1px solid #cbd5e1',
    backgroundColor: '#ffffff',
    color: '#475569',
    fontWeight: '600',
    fontSize: '0.84rem',
    cursor: 'pointer'
  },
  filterBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    flexWrap: 'wrap',
    paddingTop: '12px',
    borderTop: '1px solid #f1f5f9'
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#f8fafc',
    padding: '7px 14px',
    borderRadius: '9px',
    border: '1px solid #cbd5e1',
    flex: '1',
    minWidth: '260px'
  },
  searchInput: {
    border: 'none',
    outline: 'none',
    backgroundColor: 'transparent',
    fontSize: '0.86rem',
    width: '100%',
    color: '#1e293b'
  },
  clearSearchBtn: {
    border: 'none',
    backgroundColor: 'transparent',
    color: '#94a3b8',
    cursor: 'pointer'
  },
  filterGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  filterSelect: {
    padding: '7px 12px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    backgroundColor: '#ffffff',
    fontSize: '0.82rem',
    color: '#334155',
    fontWeight: '600',
    outline: 'none'
  },

  // Semana
  weekLayout: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  daySectionCard: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 2px 5px rgba(0,0,0,0.03)',
    overflow: 'hidden'
  },
  dayHeader: {
    backgroundColor: '#f8fafc',
    borderBottom: '1px solid #e2e8f0',
    padding: '14px 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '12px'
  },
  dayHeaderLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    flexWrap: 'wrap'
  },
  dayDateChip: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#0284c7',
    color: '#ffffff',
    padding: '6px 14px',
    borderRadius: '9px',
    boxShadow: '0 2px 4px rgba(2, 132, 199, 0.2)'
  },
  dayDateChipDay: {
    fontWeight: '800',
    fontSize: '0.88rem'
  },
  dayDateChipDate: {
    fontWeight: '600',
    fontSize: '0.8rem',
    opacity: 0.95
  },
  daySessionMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap'
  },
  metaChip: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    backgroundColor: '#ffffff',
    padding: '4px 10px',
    borderRadius: '6px',
    border: '1px solid #e2e8f0',
    fontSize: '0.78rem',
    fontWeight: '600',
    color: '#334155'
  },
  dayHeaderRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  dayCounterBadge: {
    fontSize: '0.8rem',
    fontWeight: '700',
    color: '#0284c7',
    backgroundColor: '#e0f2fe',
    padding: '4px 10px',
    borderRadius: '6px'
  },
  blockActionBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '6px 12px',
    borderRadius: '7px',
    border: '1px solid #cbd5e1',
    backgroundColor: '#ffffff',
    color: '#64748b',
    fontSize: '0.78rem',
    fontWeight: '600',
    cursor: 'pointer'
  },
  unblockActionBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '6px 12px',
    borderRadius: '7px',
    border: '1px solid #10b981',
    backgroundColor: '#ecfdf5',
    color: '#059669',
    fontSize: '0.78rem',
    fontWeight: '700',
    cursor: 'pointer'
  },
  quickAddDayBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '6px 12px',
    borderRadius: '7px',
    border: 'none',
    backgroundColor: '#0284c7',
    color: '#ffffff',
    fontSize: '0.78rem',
    fontWeight: '700',
    cursor: 'pointer'
  },
  blockedDayNotice: {
    backgroundColor: '#fef3c7',
    color: '#92400e',
    padding: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '14px',
    margin: '16px',
    borderRadius: '12px'
  },
  emptyDayContainer: {
    padding: '30px 20px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px'
  },
  emptyDayAddBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '7px 16px',
    borderRadius: '8px',
    border: '1px dashed #cbd5e1',
    backgroundColor: '#f8fafc',
    color: '#0284c7',
    fontWeight: '600',
    fontSize: '0.82rem',
    cursor: 'pointer'
  },

  // Cards de Cirurgia (Semana)
  surgeryCardsGrid: {
    padding: '16px',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '14px'
  },
  surgeryCard: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '14px 16px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    transition: 'transform 0.15s ease, box-shadow 0.15s ease'
  },
  surgeryCardHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  surgeryTimeChip: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    backgroundColor: '#e0f2fe',
    color: '#0369a1',
    padding: '3px 9px',
    borderRadius: '6px',
    fontSize: '0.8rem',
    fontWeight: '700'
  },
  surgeryCardStatus: {
    display: 'flex',
    alignItems: 'center'
  },
  surgeryPatientBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: '3px'
  },
  surgeryPatientName: {
    fontSize: '0.98rem',
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: '-0.01em'
  },
  surgeryMotiveChip: {
    fontSize: '0.76rem',
    color: '#64748b',
    fontWeight: '600'
  },
  surgeryProcedureBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '5px 10px',
    borderRadius: '7px',
    fontSize: '0.78rem',
    fontWeight: '700',
    lineHeight: 1.3
  },
  surgeryDetailsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    flexWrap: 'wrap'
  },
  surgeryAtbChip: {
    backgroundColor: '#f8fafc',
    color: '#475569',
    border: '1px solid #e2e8f0',
    padding: '2px 8px',
    borderRadius: '5px',
    fontSize: '0.72rem',
    fontWeight: '600'
  },
  surgeryObsChip: {
    backgroundColor: '#fef3c7',
    color: '#b45309',
    padding: '2px 8px',
    borderRadius: '5px',
    fontSize: '0.72rem',
    fontWeight: '700'
  },
  surgeryCardFooter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: '8px',
    borderTop: '1px solid #f1f5f9',
    marginTop: '4px'
  },
  quickStatusToggleBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    padding: '4px 10px',
    borderRadius: '6px',
    border: '1px solid #e2e8f0',
    fontSize: '0.76rem',
    fontWeight: '600',
    cursor: 'pointer'
  },
  actionIconBtn: {
    border: 'none',
    backgroundColor: '#f0f9ff',
    padding: '6px',
    borderRadius: '6px',
    cursor: 'pointer'
  },
  actionIconBtnDanger: {
    border: 'none',
    backgroundColor: '#fef2f2',
    padding: '6px',
    borderRadius: '6px',
    cursor: 'pointer'
  },

  // Pills de Situação
  pillPrimary: {
    backgroundColor: '#e0f2fe',
    color: '#0369a1',
    padding: '3px 9px',
    borderRadius: '6px',
    fontSize: '0.74rem',
    fontWeight: '600',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    border: '1px solid #bae6fd'
  },
  pillSuccess: {
    backgroundColor: '#dcfce7',
    color: '#15803d',
    padding: '3px 9px',
    borderRadius: '6px',
    fontSize: '0.74rem',
    fontWeight: '700',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    border: '1px solid #bbf7d0'
  },
  pillWarning: {
    backgroundColor: '#fef3c7',
    color: '#b45309',
    padding: '3px 9px',
    borderRadius: '6px',
    fontSize: '0.74rem',
    fontWeight: '700',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    border: '1px solid #fde68a'
  },
  pillUrgency: {
    backgroundColor: '#fee2e2',
    color: '#b91c1c',
    padding: '3px 9px',
    borderRadius: '6px',
    fontSize: '0.74rem',
    fontWeight: '800',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    border: '1px solid #fca5a5'
  },

  // Tabela Moderna
  tableCardContainer: {
    overflowX: 'auto',
    width: '100%'
  },
  modernTable: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.84rem'
  },
  th: {
    backgroundColor: '#f8fafc',
    color: '#475569',
    fontWeight: '700',
    fontSize: '0.76rem',
    textTransform: 'uppercase',
    padding: '11px 16px',
    borderBottom: '1px solid #e2e8f0',
    whiteSpace: 'nowrap'
  },
  tr: {
    borderBottom: '1px solid #f1f5f9',
    transition: 'background 0.15s'
  },
  tdTime: {
    padding: '12px 16px',
    fontWeight: '700',
    color: '#1e293b',
    display: 'flex',
    alignItems: 'center',
    gap: '5px'
  },
  tdPatient: {
    padding: '12px 16px',
    color: '#0f172a',
    textTransform: 'uppercase'
  },
  tdProc: {
    padding: '12px 16px'
  },
  inlineProcBadge: {
    backgroundColor: '#eff6ff',
    color: '#1d4ed8',
    padding: '3px 8px',
    borderRadius: '6px',
    fontWeight: '600',
    fontSize: '0.78rem'
  },
  tdMotive: {
    padding: '12px 16px',
    color: '#64748b'
  },
  tdAtb: {
    padding: '12px 16px',
    fontSize: '0.78rem',
    color: '#475569'
  },
  tdObs: {
    padding: '12px 16px',
    fontSize: '0.78rem',
    color: '#64748b'
  },
  tdStatus: {
    padding: '12px 16px'
  },
  tdActions: {
    padding: '12px 16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px'
  },
  tdDate: {
    padding: '12px 16px',
    fontWeight: '600',
    color: '#475569'
  },
  tdDoc: {
    padding: '12px 16px',
    color: '#334155'
  },
  tdHosp: {
    padding: '12px 16px',
    color: '#64748b',
    fontSize: '0.8rem'
  },
  emptyTd: {
    padding: '36px',
    textAlign: 'center',
    color: '#94a3b8',
    fontStyle: 'italic'
  },

  // Mês
  monthCard: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '20px',
    border: '1px solid #e2e8f0'
  },
  monthNotice: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#f0f9ff',
    padding: '10px 14px',
    borderRadius: '8px',
    fontSize: '0.84rem',
    color: '#0369a1',
    marginBottom: '16px'
  },
  monthGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
    gap: '12px'
  },
  monthDayBox: {
    padding: '16px',
    borderRadius: '12px',
    border: '1px solid #cbd5e1',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    transition: 'all 0.15s ease'
  },
  monthDayHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.88rem',
    color: '#1e293b'
  },
  monthDayDateText: {
    color: '#64748b',
    fontSize: '0.8rem'
  },
  monthCountBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '0.84rem',
    fontWeight: '700',
    color: '#0284c7'
  },
  monthBlockedBadge: {
    fontSize: '0.74rem',
    fontWeight: '700',
    color: '#b45309'
  },

  // Dia
  dayContainer: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '20px',
    border: '1px solid #e2e8f0',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  dayTimelineHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #f1f5f9',
    paddingBottom: '14px'
  },
  dayTitle: {
    margin: '0 0 4px 0',
    fontSize: '1.1rem',
    fontWeight: '800',
    color: '#0f172a'
  },
  daySub: {
    fontSize: '0.84rem',
    color: '#64748b'
  },
  timelineList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  timelineCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '14px 18px',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    backgroundColor: '#f8fafc'
  },
  timelineTimeBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
    backgroundColor: '#ffffff',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    padding: '10px 14px',
    minWidth: '75px',
    color: '#0369a1'
  },
  timelineInfo: {
    flex: '1',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  timelineHeaderRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  timelinePatient: {
    margin: 0,
    fontSize: '0.98rem',
    fontWeight: '800',
    color: '#0f172a',
    textTransform: 'uppercase'
  },
  timelineDetailsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '4px 14px',
    fontSize: '0.8rem'
  },
  detailLabel: {
    color: '#64748b',
    fontWeight: '600',
    marginRight: '4px'
  },
  detailVal: {
    color: '#1e293b',
    fontWeight: '700'
  },
  timelineActions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },

  // Compacto
  compactCard: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    border: '1px solid #e2e8f0',
    overflow: 'hidden'
  },

  // Modais
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 99999,
    padding: '16px',
    backdropFilter: 'blur(3px)'
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '580px',
    maxHeight: '92vh',
    overflowY: 'auto',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
  },
  modalHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '18px 22px',
    borderBottom: '1px solid #e2e8f0',
    backgroundColor: '#f8fafc'
  },
  modalHeaderLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  modalIconWrapper: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    backgroundColor: '#e0f2fe',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  modalTitle: {
    margin: 0,
    fontSize: '1.1rem',
    fontWeight: '800',
    color: '#0f172a'
  },
  modalSubTitle: {
    fontSize: '0.78rem',
    color: '#64748b'
  },
  modalCloseBtn: {
    border: 'none',
    backgroundColor: 'transparent',
    color: '#64748b',
    cursor: 'pointer',
    padding: '4px'
  },
  formContainer: {
    padding: '22px',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px'
  },
  formGrid2: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    position: 'relative'
  },
  formLabel: {
    fontSize: '0.76rem',
    fontWeight: '700',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: '0.3px'
  },
  formInput: {
    padding: '9px 12px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    fontSize: '0.86rem',
    color: '#1e293b',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box'
  },
  formSelect: {
    padding: '9px 12px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    fontSize: '0.86rem',
    color: '#1e293b',
    outline: 'none',
    width: '100%',
    backgroundColor: '#ffffff',
    boxSizing: 'border-box'
  },
  patientInputWrapper: {
    display: 'flex',
    gap: '8px'
  },
  quickUrgencyBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '0 12px',
    borderRadius: '8px',
    border: '1px solid #fde047',
    backgroundColor: '#fef08a',
    color: '#854d0e',
    fontWeight: '700',
    fontSize: '0.78rem',
    cursor: 'pointer',
    whiteSpace: 'nowrap'
  },
  patientDropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    zIndex: 10,
    maxHeight: '180px',
    overflowY: 'auto'
  },
  patientDropdownItem: {
    padding: '8px 12px',
    borderBottom: '1px solid #f1f5f9',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.84rem'
  },
  patientDropdownMeta: {
    color: '#64748b',
    fontSize: '0.76rem'
  },
  toggleCustomBtn: {
    background: 'none',
    border: 'none',
    color: '#0284c7',
    fontSize: '0.76rem',
    fontWeight: '600',
    cursor: 'pointer',
    padding: 0
  },
  quickChipsRow: {
    display: 'flex',
    gap: '6px',
    flexWrap: 'wrap',
    marginBottom: '2px'
  },
  quickChip: {
    padding: '4px 10px',
    borderRadius: '6px',
    border: '1px solid #e2e8f0',
    fontSize: '0.74rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.15s ease'
  },
  checkboxContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '0.84rem',
    color: '#334155',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '4px'
  },
  modalActionButtons: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    paddingTop: '16px',
    borderTop: '1px solid #f1f5f9',
    marginTop: '8px'
  },
  modalCancelBtn: {
    padding: '8px 16px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    backgroundColor: '#ffffff',
    color: '#64748b',
    fontWeight: '600',
    fontSize: '0.84rem',
    cursor: 'pointer'
  }
};
