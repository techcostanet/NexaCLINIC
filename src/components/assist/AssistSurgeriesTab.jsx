import React, { useState, useEffect, useMemo, useRef } from 'react';
import { dbService } from '../../firebase';
import { 
  Calendar as CalendarIcon, Clock, User, Plus, Search, Filter, 
  Printer, ChevronLeft, ChevronRight, Edit3, Trash2, CheckCircle2, 
  AlertTriangle, Shield, MapPin, Stethoscope, AlertCircle, X, Check,
  Activity, ArrowRight, RefreshCw, FileText, Lock, Unlock
} from 'lucide-react';
import { useUnit } from '../../contexts/UnitContext';

// Procedimentos Frequentes (Sugestões Rápidas)
const COMMON_PROCEDURES = [
  'IMPLANTE DE PERMCATH',
  'RETIRADA DE PERMCATH',
  'DUPLEX',
  'FAV SIMPLES COM SUPORTE ANESTESICO',
  'FAV BASILICA',
  'FAV COM PTFE',
  'CONFECÇÃO DE FAV',
  'REVISÃO DE FAV',
  'LIGADURA DE FAV',
  'CDL DE URGENCIA'
];

// Motivos Clínicos Frequentes (Sugestões Rápidas)
const COMMON_MOTIVES = [
  'ACESSO',
  'DOR PUNÇÃO FAV',
  'DOR EM FAV',
  'DIFICULDADE DE PUNÇÃO',
  'ABAULAMENTO DE FAV',
  'DOR EM FAV APÓS HEMATOMA',
  'DIFICULDADE DE PUNÇÃO+DOR',
  'FALENCIA PRIMARIA',
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
  const [catalogProcedures, setCatalogProcedures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Visualização: 'week' (Semana) | 'month' (Mês) | 'day' (Dia) | 'compact' (Compacto)
  const [viewMode, setViewMode] = useState('week');

  // Data de Referência (Default: 2026-09-08 correspondente ao período do PDF de modelo)
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
    procedure: 'FAV SIMPLES COM SUPORTE ANESTESICO',
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

  // Carregar Dados
  const loadData = async () => {
    setLoading(true);
    try {
      const [surgList, blockList, patList, procList] = await Promise.all([
        dbService.getSurgeries ? dbService.getSurgeries({ unitId: activeUnitId }) : [],
        dbService.getSurgeryBlocks ? dbService.getSurgeryBlocks() : [],
        dbService.getPatients ? dbService.getPatients() : [],
        dbService.getProcedures ? dbService.getProcedures() : []
      ]);
      setSurgeries(surgList || []);
      setBlocks(blockList || []);
      setPatients(patList || []);
      setCatalogProcedures(procList || []);
    } catch (err) {
      console.error('Erro ao carregar cirurgias:', err);
      showAlert('Erro ao sincronizar cirurgias.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const availableProcedures = useMemo(() => {
    if (catalogProcedures && catalogProcedures.length > 0) {
      const activeForAssist = catalogProcedures
        .filter(p => p.active !== false && p.modules?.assist !== false)
        .map(p => p.name);
      if (activeForAssist.length > 0) return activeForAssist;
    }
    return COMMON_PROCEDURES;
  }, [catalogProcedures]);

  useEffect(() => {
    loadData();
  }, [activeUnitId]);

  // Utilitários de Data
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
    // Se a data de hoje estiver no futuro/passado e houver cirurgias em 2026-09-08, ajusta com inteligência
    const todayIso = new Date().toISOString().split('T')[0];
    setCurrentDate(todayIso.startsWith('2026-09') ? todayIso : '2026-09-08');
  };

  // Filtragem de Cirurgias
  const filteredSurgeries = useMemo(() => {
    return surgeries.filter(s => {
      // Filtro de Busca Geral
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

  // Agrupamento de cirurgias por data
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

  // Abertura do Modal de Criação / Edição
  const handleOpenCreateModal = (targetDate = null, defaultTime = '08:00') => {
    setEditingSurgery(null);
    setFormData({
      date: targetDate || currentDate,
      time: defaultTime,
      patientId: '',
      patientName: '',
      procedure: 'FAV SIMPLES COM SUPORTE ANESTESICO',
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
    setFormData({
      date: surgery.date || currentDate,
      time: surgery.time || '08:00',
      patientId: surgery.patientId || '',
      patientName: surgery.patientName || '',
      procedure: surgery.procedure || '',
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
        showAlert('Cirurgia atualizada com sucesso!', 'success');
      } else {
        await dbService.createSurgery(payload, currentUser);
        showAlert('Cirurgia agendada e publicada no Mural!', 'success');
      }

      setShowSurgeryModal(false);
      loadData();
    } catch (err) {
      console.error(err);
      showAlert('Erro ao salvar agendamento cirúrgico.', 'danger');
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
      showAlert('Bloqueio do dia atualizado!', 'success');
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
      showAlert('Dia desbloqueado com sucesso!', 'success');
      loadData();
    } catch (err) {
      console.error(err);
      showAlert('Erro ao desbloquear dia.', 'danger');
    } finally {
      setActionLoading(false);
    }
  };

  // Impressão Formatada
  const handlePrint = () => {
    window.print();
  };

  // Badges visuais de Observações / Urgência
  const renderObsBadge = (obs) => {
    if (!obs) return null;
    const upper = obs.toUpperCase();
    if (upper.includes('PTFE')) {
      return (
        <span style={{
          backgroundColor: '#0284c7',
          color: '#ffffff',
          padding: '3px 8px',
          borderRadius: '4px',
          fontSize: '0.74rem',
          fontWeight: '700',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          {obs}
        </span>
      );
    }
    if (upper.includes('RISCO')) {
      return (
        <span style={{
          backgroundColor: '#0284c7',
          color: '#ffffff',
          padding: '3px 8px',
          borderRadius: '4px',
          fontSize: '0.74rem',
          fontWeight: '700',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          {obs}
        </span>
      );
    }
    return (
      <span style={{
        backgroundColor: '#f1f5f9',
        color: '#475569',
        padding: '3px 8px',
        borderRadius: '4px',
        fontSize: '0.74rem',
        fontWeight: '600'
      }}>
        {obs}
      </span>
    );
  };

  // Render do Status da Linha
  const renderStatusBadge = (status, isUrgency) => {
    if (isUrgency || status === 'Urgência') {
      return (
        <span style={{
          backgroundColor: '#fef08a',
          color: '#854d0e',
          padding: '2px 8px',
          borderRadius: '6px',
          fontSize: '0.75rem',
          fontWeight: '700',
          border: '1px solid #fde047'
        }}>
          Urgência
        </span>
      );
    }
    if (status === 'Pendente') {
      return (
        <span style={{
          backgroundColor: '#fef3c7',
          color: '#b45309',
          padding: '2px 8px',
          borderRadius: '6px',
          fontSize: '0.75rem',
          fontWeight: '700',
          border: '1px solid #fde68a'
        }}>
          Pendente
        </span>
      );
    }
    if (status === 'Realizado') {
      return (
        <span style={{
          backgroundColor: '#dcfce7',
          color: '#15803d',
          padding: '2px 8px',
          borderRadius: '6px',
          fontSize: '0.75rem',
          fontWeight: '700',
          border: '1px solid #bbf7d0'
        }}>
          Realizado
        </span>
      );
    }
    return (
      <span style={{
        backgroundColor: '#e0f2fe',
        color: '#0369a1',
        padding: '2px 8px',
        borderRadius: '6px',
        fontSize: '0.75rem',
        fontWeight: '600',
        border: '1px solid #bae6fd'
      }}>
        Agendado
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

      {/* Barra Superior de Controles e Filtros */}
      <div style={styles.topControlCard}>
        <div style={styles.controlRow}>
          {/* Seletor de Visualizações: Semana, Mês, Dia, Compacto */}
          <div style={styles.viewModeGroup}>
            <button
              onClick={() => setViewMode('week')}
              style={{
                ...styles.viewModeBtn,
                backgroundColor: viewMode === 'week' ? '#0284c7' : 'transparent',
                color: viewMode === 'week' ? '#ffffff' : '#64748b',
                fontWeight: viewMode === 'week' ? '700' : '600'
              }}
            >
              Semana
            </button>
            <button
              onClick={() => setViewMode('month')}
              style={{
                ...styles.viewModeBtn,
                backgroundColor: viewMode === 'month' ? '#0284c7' : 'transparent',
                color: viewMode === 'month' ? '#ffffff' : '#64748b',
                fontWeight: viewMode === 'month' ? '700' : '600'
              }}
            >
              Mês
            </button>
            <button
              onClick={() => setViewMode('day')}
              style={{
                ...styles.viewModeBtn,
                backgroundColor: viewMode === 'day' ? '#0284c7' : 'transparent',
                color: viewMode === 'day' ? '#ffffff' : '#64748b',
                fontWeight: viewMode === 'day' ? '700' : '600'
              }}
            >
              Dia
            </button>
            <button
              onClick={() => setViewMode('compact')}
              style={{
                ...styles.viewModeBtn,
                backgroundColor: viewMode === 'compact' ? '#0284c7' : 'transparent',
                color: viewMode === 'compact' ? '#ffffff' : '#64748b',
                fontWeight: viewMode === 'compact' ? '700' : '600'
              }}
            >
              Compacto
            </button>
          </div>

          {/* Navegação de Período */}
          <div style={styles.periodNavGroup}>
            <button onClick={handlePrev} style={styles.navBtn} title="Período Anterior">
              <ChevronLeft size={18} />
            </button>
            <button onClick={handleToday} style={styles.todayBtn}>
              Hoje
            </button>
            <button onClick={handleNext} style={styles.navBtn} title="Próximo Período">
              <ChevronRight size={18} />
            </button>

            <div style={styles.periodLabel}>
              <CalendarIcon size={16} color="#0284c7" />
              <span>
                {viewMode === 'week' && `Semana: ${weekDays[0].shortFormatted} a ${weekDays[4].shortFormatted}`}
                {viewMode === 'day' && `Dia: ${currentDate.split('-').reverse().join('/')}`}
                {viewMode === 'month' && `Mês: ${new Date(currentDate + 'T12:00:00').toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}`}
                {viewMode === 'compact' && 'Todos os Agendamentos'}
              </span>
            </div>
          </div>

          {/* Ações da Direita: Imprimir e Nova Cirurgia */}
          <div style={styles.actionsRight}>
            <button onClick={handlePrint} style={styles.secondaryBtn} title="Imprimir Mapa Cirúrgico">
              <Printer size={16} />
              <span>Imprimir</span>
            </button>
            <button onClick={() => handleOpenCreateModal()} style={styles.primaryBtn}>
              <Plus size={16} />
              <span>Cirurgia</span>
            </button>
          </div>
        </div>

        {/* Linha de Filtros Rápidos */}
        <div style={styles.filterRow}>
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

          <div style={styles.filterSelects}>
            <select
              value={selectedSurgeon}
              onChange={(e) => setSelectedSurgeon(e.target.value)}
              style={styles.selectFilter}
            >
              <option value="all">Cirurgião</option>
              {COMMON_SURGEONS.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            <select
              value={selectedHospital}
              onChange={(e) => setSelectedHospital(e.target.value)}
              style={styles.selectFilter}
            >
              <option value="all">Local</option>
              <option value="Hospital Regional – Portaria Principal – Sala Cirúrgica 5º Andar">Hospital Regional</option>
              <option value="Clínica Dialize">Clínica Dialize</option>
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              style={styles.selectFilter}
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

      {/* CONTEÚDO CONFORME O MODO DE VISUALIZAÇÃO */}

      {/* 1. MODO SEMANA (Fiel ao PDF 'MAPA CIRÚRGICO VASCULAR') */}
      {viewMode === 'week' && (
        <div style={styles.weekContainer}>
          {/* Banner de Título Imprimível */}
          <div style={styles.printHeader}>
            <h2 style={styles.printTitle}>
              MAPA CIRÚRGICO VASCULAR {weekDays[0].formatted} A {weekDays[4].formatted}
            </h2>
          </div>

          {/* Dias da Semana (Segunda a Sexta) */}
          {weekDays.map(day => {
            const daySurgeries = surgeriesByDate[day.isoDate] || [];
            const blockReason = blocksByDate[day.isoDate];
            const isBlocked = !!blockReason;

            // Extrai parâmetros dominantes do cabeçalho do dia (se houver agendamentos)
            const firstSurg = daySurgeries[0];
            const surgeonName = firstSurg?.surgeon || (day.dayName === 'Quarta' || day.dayName === 'Quinta' ? 'Alexandre Jesus' : 'Moisés Arantes Diniz');
            const anesthesiologistName = firstSurg?.anesthesiologist || (day.dayName === 'Quinta' ? 'Matheus' : day.dayName === 'Sexta' ? 'Bruno Xavier' : 'Sem Agenda');
            const hospitalName = firstSurg?.hospital || (day.dayName === 'Quarta' ? 'Clínica Dialize' : 'Hospital Regional – Portaria Principal – Sala Cirúrgica 5º Andar');
            const startTime = firstSurg?.time || (day.dayName === 'Quinta' || day.dayName === 'Sexta' ? '08:00:00' : '12:00:00');

            return (
              <div key={day.isoDate} style={styles.dayBlockCard}>
                {/* Cabeçalho da Sessão Cirúrgica do Dia */}
                <div style={styles.sessionHeader}>
                  <div style={styles.sessionDayBadge}>
                    <span style={styles.sessionDayText}>{day.dayName.toUpperCase()}</span>
                    <span style={styles.sessionDateText}>{day.shortFormatted}</span>
                  </div>

                  <div style={styles.sessionMetaGrid}>
                    <div style={styles.metaItem}>
                      <span style={styles.metaLabel}>Início</span>
                      <span style={styles.metaValue}>{startTime}</span>
                    </div>

                    <div style={styles.metaItem}>
                      <span style={styles.metaLabel}>Cirurgião</span>
                      <span style={styles.metaValueHighlight}>{surgeonName}</span>
                    </div>

                    <div style={styles.metaItem}>
                      <span style={styles.metaLabel}>Anestesista</span>
                      <span style={styles.metaValue}>{anesthesiologistName}</span>
                    </div>

                    <div style={{ ...styles.metaItem, gridColumn: 'span 3' }}>
                      <span style={styles.metaLabel}>Local</span>
                      <span style={styles.metaValueSmall}>{hospitalName}</span>
                    </div>
                  </div>

                  <div style={styles.dayActions}>
                    {isBlocked ? (
                      <button 
                        onClick={() => handleRemoveBlock(day.isoDate)}
                        style={styles.unblockBtn}
                        title="Desbloquear este dia"
                      >
                        <Unlock size={14} />
                        <span>Desbloquear</span>
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleOpenBlockModal(day.isoDate)}
                        style={styles.blockBtn}
                        title="Bloquear dia para feriado ou manutenção"
                      >
                        <Lock size={14} />
                        <span>Bloquear</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleOpenCreateModal(day.isoDate, startTime)}
                      style={styles.addMiniBtn}
                      title="Agendar neste dia"
                    >
                      <Plus size={14} />
                      <span>Agendar</span>
                    </button>
                  </div>
                </div>

                {/* Se estiver bloqueado (Feriado, etc.) */}
                {isBlocked ? (
                  <div style={styles.holidayBanner}>
                    <AlertCircle size={20} color="#b45309" />
                    <span>{blockReason}</span>
                  </div>
                ) : daySurgeries.length === 0 ? (
                  <div style={styles.emptyDayNotice}>
                    <span>Nenhum procedimento agendado para este dia.</span>
                    <button 
                      onClick={() => handleOpenCreateModal(day.isoDate, startTime)}
                      style={styles.emptyAddBtn}
                    >
                      + Adicionar Agendamento
                    </button>
                  </div>
                ) : (
                  /* Tabela de Cirurgias do Dia (Padrão PDF) */
                  <div style={styles.tableResponsive}>
                    <table style={styles.surgeryTable}>
                      <thead>
                        <tr>
                          <th style={{ ...styles.th, width: '90px' }}>Horário</th>
                          <th style={styles.th}>Paciente</th>
                          <th style={styles.th}>Procedimento</th>
                          <th style={styles.th}>Motivo</th>
                          <th style={styles.th}>Obs</th>
                          <th style={{ ...styles.th, width: '100px' }}>Situação</th>
                          <th style={styles.th}>ATB</th>
                          <th style={{ ...styles.th, width: '80px', textAlign: 'center' }}>Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {daySurgeries.map((surg, idx) => {
                          const isCdlUrgency = (surg.patientName || '').toUpperCase().includes('URGENCIA');
                          return (
                            <tr 
                              key={surg.id || idx}
                              style={{
                                ...styles.tr,
                                backgroundColor: isCdlUrgency ? '#fef9c3' : idx % 2 === 0 ? '#ffffff' : '#f8fafc'
                              }}
                            >
                              <td style={styles.tdTime}>
                                <Clock size={12} color="#0284c7" />
                                <span>{surg.time}</span>
                              </td>
                              <td style={styles.tdPatient}>
                                <strong>{surg.patientName}</strong>
                              </td>
                              <td style={styles.tdProc}>
                                {surg.procedure}
                              </td>
                              <td style={styles.tdMotive}>
                                {surg.indication || surg.motive || '--'}
                              </td>
                              <td style={styles.tdObs}>
                                {renderObsBadge(surg.observations)}
                              </td>
                              <td style={styles.tdStatus}>
                                {renderStatusBadge(surg.status, surg.isUrgency)}
                              </td>
                              <td style={styles.tdAtb}>
                                {surg.antibiotic || '--'}
                              </td>
                              <td style={styles.tdActions}>
                                <button
                                  onClick={() => handleOpenEditModal(surg)}
                                  style={styles.iconBtn}
                                  title="Editar"
                                >
                                  <Edit3 size={14} color="#0284c7" />
                                </button>
                                <button
                                  onClick={() => handleDeleteSurgery(surg)}
                                  style={styles.iconBtnDanger}
                                  title="Excluir"
                                >
                                  <Trash2 size={14} color="#ef4444" />
                                </button>
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
          })}
        </div>
      )}

      {/* 2. MODO MÊS */}
      {viewMode === 'month' && (
        <div style={styles.monthCard}>
          <div style={styles.monthNotice}>
            <CalendarIcon size={18} color="#0284c7" />
            <span>Exibindo visão mensal resumida com distribuição de cirurgias. Clique no dia para visualizar em detalhes.</span>
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
                    backgroundColor: isBlocked ? '#fef2f2' : count > 0 ? '#f0f9ff' : '#ffffff'
                  }}
                  onClick={() => {
                    setCurrentDate(d.isoDate);
                    setViewMode('day');
                  }}
                >
                  <div style={styles.monthDayHeader}>
                    <strong>{d.dayName}</strong>
                    <span>{d.shortFormatted}</span>
                  </div>
                  {isBlocked ? (
                    <span style={styles.monthBlockedBadge}>Feriado / Bloqueado</span>
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

      {/* 3. MODO DIA */}
      {viewMode === 'day' && (
        <div style={styles.dayContainer}>
          <div style={styles.dayTimelineHeader}>
            <div>
              <h3 style={styles.dayTitle}>
                {new Date(currentDate + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }).toUpperCase()}
              </h3>
              <span style={styles.daySub}>
                {blocksByDate[currentDate] ? `Bloqueio: ${blocksByDate[currentDate]}` : `${(surgeriesByDate[currentDate] || []).length} procedimentos agendados`}
              </span>
            </div>
            <button onClick={() => handleOpenCreateModal(currentDate)} style={styles.primaryBtn}>
              <Plus size={16} />
              <span>Cirurgia</span>
            </button>
          </div>

          {blocksByDate[currentDate] ? (
            <div style={styles.holidayBanner}>
              <AlertCircle size={20} color="#b45309" />
              <span>{blocksByDate[currentDate]}</span>
            </div>
          ) : (surgeriesByDate[currentDate] || []).length === 0 ? (
            <div style={styles.emptyDayNotice}>
              <span>Nenhum procedimento agendado para esta data.</span>
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
                      {renderStatusBadge(surg.status, surg.isUrgency)}
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
                        <span style={styles.detailLabel}>ATB Profilático:</span>
                        <span style={styles.detailVal}>{surg.antibiotic || '--'}</span>
                      </div>
                    </div>

                    {surg.observations && (
                      <div style={styles.timelineObsRow}>
                        <span style={styles.detailLabel}>Obs:</span>
                        {renderObsBadge(surg.observations)}
                      </div>
                    )}
                  </div>

                  <div style={styles.timelineActions}>
                    <button onClick={() => handleOpenEditModal(surg)} style={styles.iconBtn} title="Editar">
                      <Edit3 size={16} color="#0284c7" />
                    </button>
                    <button onClick={() => handleDeleteSurgery(surg)} style={styles.iconBtnDanger} title="Excluir">
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
          <div style={styles.tableResponsive}>
            <table style={styles.surgeryTable}>
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
                  <th style={styles.th}>Obs</th>
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
                    <tr key={surg.id || idx} style={{ ...styles.tr, backgroundColor: idx % 2 === 0 ? '#fff' : '#f8fafc' }}>
                      <td style={styles.tdDate}>{surg.date.split('-').reverse().join('/')}</td>
                      <td style={styles.tdTime}>{surg.time}</td>
                      <td style={styles.tdPatient}><strong>{surg.patientName}</strong></td>
                      <td style={styles.tdProc}>{surg.procedure}</td>
                      <td style={styles.tdMotive}>{surg.indication || surg.motive || '--'}</td>
                      <td style={styles.tdDoc}>{surg.surgeon}</td>
                      <td style={styles.tdHosp}>{surg.hospital.includes('Regional') ? 'Hospital Regional' : surg.hospital}</td>
                      <td style={styles.tdStatus}>{renderStatusBadge(surg.status, surg.isUrgency)}</td>
                      <td style={styles.tdAtb}>{surg.antibiotic || '--'}</td>
                      <td style={styles.tdObs}>{renderObsBadge(surg.observations)}</td>
                      <td style={styles.tdActions}>
                        <button onClick={() => handleOpenEditModal(surg)} style={styles.iconBtn} title="Editar">
                          <Edit3 size={14} color="#0284c7" />
                        </button>
                        <button onClick={() => handleDeleteSurgery(surg)} style={styles.iconBtnDanger} title="Excluir">
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

      {/* MODAL DE CIRURGIA (CRIAR / EDITAR) */}
      {showSurgeryModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <div style={styles.modalHeader}>
              <div style={styles.modalHeaderLeft}>
                <Stethoscope size={22} color="#0284c7" />
                <h3 style={styles.modalTitle}>
                  {editingSurgery ? 'Editar' : 'Agendar'}
                </h3>
              </div>
              <button onClick={() => setShowSurgeryModal(false)} style={styles.modalCloseBtn}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveSurgery} style={styles.formContainer}>
              <div style={styles.formGrid2}>
                <div>
                  <label style={styles.label}>Data</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    style={styles.input}
                  />
                </div>

                <div>
                  <label style={styles.label}>Horário</label>
                  <input
                    type="time"
                    required
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    style={styles.input}
                  />
                </div>
              </div>

              {/* Paciente com Autocomplete / Busca */}
              <div style={styles.formGroup}>
                <label style={styles.label}>Paciente</label>
                <div style={styles.patientInputGroup}>
                  <input
                    type="text"
                    required
                    placeholder="Nome do paciente ou CDL DE URGÊNCIA..."
                    value={formData.patientName}
                    onChange={(e) => {
                      setFormData({ ...formData, patientName: e.target.value, patientId: '' });
                      setPatientSearch(e.target.value);
                    }}
                    style={styles.input}
                  />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, patientName: 'CDL DE URGENCIA', status: 'Urgência' })}
                    style={styles.quickUrgBtn}
                    title="Preencher como vaga de urgência"
                  >
                    Urgência
                  </button>
                </div>

                {/* Sugestões de pacientes se digitar */}
                {patientSearch && !formData.patientId && patients.length > 0 && (
                  <div style={styles.patientSuggestions}>
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
                          style={styles.suggestionItem}
                        >
                          <strong>{p.name}</strong>
                          <span style={styles.suggestionMeta}>
                            {p.cpf ? `CPF: ${p.cpf}` : ''} {p.room ? `• ${p.room}` : ''}
                          </span>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              <div style={styles.formGrid2}>
                <div>
                  <label style={styles.label}>Procedimento</label>
                  <input
                    type="text"
                    required
                    list="procList"
                    value={formData.procedure}
                    onChange={(e) => setFormData({ ...formData, procedure: e.target.value })}
                    style={styles.input}
                  />
                  <datalist id="procList">
                    {availableProcedures.map(p => <option key={p} value={p} />)}
                  </datalist>
                </div>

                <div>
                  <label style={styles.label}>Motivo</label>
                  <input
                    type="text"
                    required
                    list="motiveList"
                    value={formData.indication}
                    onChange={(e) => setFormData({ ...formData, indication: e.target.value })}
                    style={styles.input}
                  />
                  <datalist id="motiveList">
                    {COMMON_MOTIVES.map(m => <option key={m} value={m} />)}
                  </datalist>
                </div>
              </div>

              <div style={styles.formGrid2}>
                <div>
                  <label style={styles.label}>Cirurgião</label>
                  <input
                    type="text"
                    required
                    list="surgeonList"
                    value={formData.surgeon}
                    onChange={(e) => setFormData({ ...formData, surgeon: e.target.value })}
                    style={styles.input}
                  />
                  <datalist id="surgeonList">
                    {COMMON_SURGEONS.map(s => <option key={s} value={s} />)}
                  </datalist>
                </div>

                <div>
                  <label style={styles.label}>Anestesista</label>
                  <input
                    type="text"
                    placeholder="Sem Agenda, Matheus, Bruno Xavier..."
                    value={formData.anesthesiologist}
                    onChange={(e) => setFormData({ ...formData, anesthesiologist: e.target.value })}
                    style={styles.input}
                  />
                </div>
              </div>

              <div style={styles.formGrid2}>
                <div>
                  <label style={styles.label}>Local</label>
                  <input
                    type="text"
                    required
                    list="hospList"
                    value={formData.hospital}
                    onChange={(e) => setFormData({ ...formData, hospital: e.target.value })}
                    style={styles.input}
                  />
                  <datalist id="hospList">
                    {COMMON_HOSPITALS.map(h => <option key={h} value={h} />)}
                  </datalist>
                </div>

                <div>
                  <label style={styles.label}>Situação</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    style={styles.select}
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
                  <label style={styles.label}>Antibiótico</label>
                  <input
                    type="text"
                    placeholder="Cefazolina 2g IV, Cefalotina..."
                    value={formData.antibiotic}
                    onChange={(e) => setFormData({ ...formData, antibiotic: e.target.value })}
                    style={styles.input}
                  />
                </div>

                <div>
                  <label style={styles.label}>Observação</label>
                  <input
                    type="text"
                    placeholder="Aguardando PTFE, Pendente Risco..."
                    value={formData.observations}
                    onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                    style={styles.input}
                  />
                </div>
              </div>

              {/* Checkbox para postar no Mural */}
              {!editingSurgery && (
                <label style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={formData.postToMural}
                    onChange={(e) => setFormData({ ...formData, postToMural: e.target.checked })}
                    style={{ accentColor: '#0284c7' }}
                  />
                  <span>Publicar no Mural com as informações do agendamento</span>
                </label>
              )}

              <div style={styles.modalFooter}>
                <button
                  type="button"
                  onClick={() => setShowSurgeryModal(false)}
                  style={styles.cancelBtn}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  style={styles.primaryBtn}
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
                <Lock size={20} color="#b45309" />
                <h3 style={styles.modalTitle}>Bloquear</h3>
              </div>
              <button onClick={() => setShowBlockModal(false)} style={styles.modalCloseBtn}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '20px' }}>
              <p style={{ margin: '0 0 16px 0', fontSize: '0.88rem', color: '#64748b' }}>
                Informe a justificativa para bloquear agendamentos no dia <strong>{selectedDateForBlock.split('-').reverse().join('/')}</strong>:
              </p>

              <label style={styles.label}>Justificativa</label>
              <input
                type="text"
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                placeholder="Ex: NÃO TEREMOS AGENDAMENTO DEVIDO FERIADO"
                style={styles.input}
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px' }}>
                <button
                  type="button"
                  onClick={() => setShowBlockModal(false)}
                  style={styles.cancelBtn}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveBlock}
                  disabled={actionLoading}
                  style={{ ...styles.primaryBtn, backgroundColor: '#b45309' }}
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

// Estilos Vanilla CSS
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
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    zIndex: 9999,
    fontWeight: '600',
    fontSize: '0.9rem',
    animation: 'slideIn 0.3s ease'
  },
  topControlCard: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '16px 20px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px'
  },
  controlRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '12px'
  },
  viewModeGroup: {
    display: 'inline-flex',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    padding: '4px',
    borderRadius: '10px',
    gap: '4px',
    border: '1px solid #e2e8f0'
  },
  viewModeBtn: {
    padding: '6px 14px',
    borderRadius: '7px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.84rem',
    transition: 'all 0.2s ease'
  },
  periodNavGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  navBtn: {
    width: '32px',
    height: '32px',
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
  todayBtn: {
    padding: '6px 14px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    backgroundColor: '#ffffff',
    color: '#334155',
    fontWeight: '600',
    fontSize: '0.82rem',
    cursor: 'pointer'
  },
  periodLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginLeft: '8px',
    fontWeight: '700',
    fontSize: '0.9rem',
    color: '#1e293b'
  },
  actionsRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  primaryBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 18px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#0284c7',
    color: '#ffffff',
    fontWeight: '700',
    fontSize: '0.86rem',
    cursor: 'pointer',
    boxShadow: '0 2px 6px rgba(2, 132, 199, 0.25)',
    transition: 'all 0.2s'
  },
  secondaryBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    backgroundColor: '#ffffff',
    color: '#475569',
    fontWeight: '600',
    fontSize: '0.84rem',
    cursor: 'pointer'
  },
  filterRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    flexWrap: 'wrap',
    paddingTop: '10px',
    borderTop: '1px solid #f1f5f9'
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#f8fafc',
    padding: '6px 12px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    flex: '1',
    minWidth: '240px'
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
    cursor: 'pointer',
    padding: '2px'
  },
  filterSelects: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  selectFilter: {
    padding: '6px 10px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    backgroundColor: '#ffffff',
    fontSize: '0.82rem',
    color: '#334155',
    fontWeight: '600',
    outline: 'none'
  },

  // Semana
  weekContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  printHeader: {
    backgroundColor: '#ffffff',
    padding: '14px 20px',
    borderRadius: '10px',
    border: '2px solid #0284c7',
    textAlign: 'center',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
  },
  printTitle: {
    margin: 0,
    fontSize: '1.25rem',
    fontWeight: '800',
    color: '#0369a1',
    letterSpacing: '0.5px'
  },
  dayBlockCard: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
    overflow: 'hidden'
  },
  sessionHeader: {
    backgroundColor: '#e0f2fe',
    borderBottom: '2px solid #0284c7',
    padding: '12px 18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '12px'
  },
  sessionDayBadge: {
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#0284c7',
    color: '#ffffff',
    padding: '6px 14px',
    borderRadius: '8px',
    textAlign: 'center',
    minWidth: '100px'
  },
  sessionDayText: {
    fontWeight: '800',
    fontSize: '0.88rem',
    letterSpacing: '0.5px'
  },
  sessionDateText: {
    fontWeight: '600',
    fontSize: '0.78rem',
    opacity: 0.95
  },
  sessionMetaGrid: {
    display: 'grid',
    gridTemplateColumns: 'auto auto auto',
    gap: '8px 24px',
    flex: '1'
  },
  metaItem: {
    display: 'flex',
    flexDirection: 'column'
  },
  metaLabel: {
    fontSize: '0.68rem',
    textTransform: 'uppercase',
    fontWeight: '700',
    color: '#0369a1'
  },
  metaValue: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#1e293b'
  },
  metaValueHighlight: {
    fontSize: '0.9rem',
    fontWeight: '800',
    color: '#0f172a'
  },
  metaValueSmall: {
    fontSize: '0.8rem',
    fontWeight: '600',
    color: '#334155'
  },
  dayActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  blockBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '5px 10px',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    backgroundColor: '#ffffff',
    color: '#64748b',
    fontSize: '0.76rem',
    fontWeight: '600',
    cursor: 'pointer'
  },
  unblockBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '5px 10px',
    borderRadius: '6px',
    border: '1px solid #10b981',
    backgroundColor: '#ecfdf5',
    color: '#059669',
    fontSize: '0.76rem',
    fontWeight: '700',
    cursor: 'pointer'
  },
  addMiniBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '5px 12px',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: '#0284c7',
    color: '#ffffff',
    fontSize: '0.76rem',
    fontWeight: '700',
    cursor: 'pointer'
  },
  holidayBanner: {
    backgroundColor: '#fef3c7',
    color: '#92400e',
    padding: '24px 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    fontWeight: '800',
    fontSize: '0.96rem',
    letterSpacing: '0.5px'
  },
  emptyDayNotice: {
    padding: '28px',
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: '0.88rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px'
  },
  emptyAddBtn: {
    padding: '6px 14px',
    borderRadius: '6px',
    border: '1px dashed #cbd5e1',
    backgroundColor: '#f8fafc',
    color: '#0284c7',
    fontWeight: '600',
    fontSize: '0.82rem',
    cursor: 'pointer'
  },

  // Tabela
  tableResponsive: {
    overflowX: 'auto',
    width: '100%'
  },
  surgeryTable: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.84rem',
    textAlign: 'left'
  },
  th: {
    backgroundColor: '#f8fafc',
    color: '#475569',
    fontWeight: '700',
    fontSize: '0.76rem',
    textTransform: 'uppercase',
    padding: '10px 14px',
    borderBottom: '1px solid #e2e8f0',
    whiteSpace: 'nowrap'
  },
  tr: {
    borderBottom: '1px solid #f1f5f9',
    transition: 'background 0.15s'
  },
  tdTime: {
    padding: '12px 14px',
    fontWeight: '700',
    color: '#1e293b',
    display: 'flex',
    alignItems: 'center',
    gap: '5px'
  },
  tdPatient: {
    padding: '12px 14px',
    color: '#0f172a'
  },
  tdProc: {
    padding: '12px 14px',
    fontWeight: '600',
    color: '#334155'
  },
  tdMotive: {
    padding: '12px 14px',
    color: '#64748b'
  },
  tdObs: {
    padding: '12px 14px'
  },
  tdStatus: {
    padding: '12px 14px'
  },
  tdAtb: {
    padding: '12px 14px',
    fontSize: '0.8rem',
    color: '#475569'
  },
  tdActions: {
    padding: '12px 14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px'
  },
  iconBtn: {
    border: 'none',
    backgroundColor: '#f0f9ff',
    padding: '5px',
    borderRadius: '6px',
    cursor: 'pointer'
  },
  iconBtnDanger: {
    border: 'none',
    backgroundColor: '#fef2f2',
    padding: '5px',
    borderRadius: '6px',
    cursor: 'pointer'
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
    borderRadius: '12px',
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
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '12px'
  },
  monthDayBox: {
    padding: '16px',
    borderRadius: '10px',
    border: '1px solid #cbd5e1',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    transition: 'all 0.2s'
  },
  monthDayHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.88rem',
    color: '#1e293b'
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
    borderRadius: '12px',
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
    borderRadius: '10px',
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
    color: '#0f172a'
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
  timelineObsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  timelineActions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },

  // Compacto
  compactCard: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    overflow: 'hidden'
  },
  tdDate: {
    padding: '10px 14px',
    fontWeight: '600',
    color: '#475569'
  },
  tdDoc: {
    padding: '10px 14px',
    color: '#334155'
  },
  tdHosp: {
    padding: '10px 14px',
    color: '#64748b',
    fontSize: '0.8rem'
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
    padding: '16px'
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderRadius: '14px',
    width: '100%',
    maxWidth: '560px',
    maxHeight: '92vh',
    overflowY: 'auto',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
  },
  modalHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 20px',
    borderBottom: '1px solid #e2e8f0',
    backgroundColor: '#f8fafc'
  },
  modalHeaderLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  modalTitle: {
    margin: 0,
    fontSize: '1.1rem',
    fontWeight: '800',
    color: '#0f172a'
  },
  modalCloseBtn: {
    border: 'none',
    backgroundColor: 'transparent',
    color: '#64748b',
    cursor: 'pointer',
    padding: '4px'
  },
  formContainer: {
    padding: '20px',
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
    gap: '4px',
    position: 'relative'
  },
  label: {
    fontSize: '0.78rem',
    fontWeight: '700',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: '0.3px'
  },
  input: {
    padding: '8px 12px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    fontSize: '0.86rem',
    color: '#1e293b',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box'
  },
  select: {
    padding: '8px 12px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    fontSize: '0.86rem',
    color: '#1e293b',
    outline: 'none',
    width: '100%',
    backgroundColor: '#ffffff',
    boxSizing: 'border-box'
  },
  patientInputGroup: {
    display: 'flex',
    gap: '8px'
  },
  quickUrgBtn: {
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
  patientSuggestions: {
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
  suggestionItem: {
    padding: '8px 12px',
    borderBottom: '1px solid #f1f5f9',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.84rem'
  },
  suggestionMeta: {
    color: '#64748b',
    fontSize: '0.76rem'
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '0.84rem',
    color: '#334155',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '4px'
  },
  modalFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    paddingTop: '16px',
    borderTop: '1px solid #f1f5f9',
    marginTop: '6px'
  },
  cancelBtn: {
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
