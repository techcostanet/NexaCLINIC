import React, { useState, useEffect, useMemo } from 'react';
import { dbService } from '../firebase';
import { useUnit } from '../contexts/UnitContext';
import UnitSelector from './common/UnitSelector';
import DialysisScheduleTab from './assist/DialysisScheduleTab';
import { 
  HeartPulse, Activity, Calendar, ClipboardList, Wrench, Plus, 
  Search, Filter, X, CheckCircle2, AlertTriangle, Clock, Trash2, 
  Edit2, Eye, RefreshCw, Layers, User, Package, AlertCircle, 
  Check, ChevronRight, FileText, Printer, ShieldAlert, Cpu, Sparkles
} from 'lucide-react';

export default function CarePanel({ currentUser }) {
  const { activeUnitId, filterByActiveUnit, matchItemUnit } = useUnit();
  
  // Navigation: 'sessions' | 'schedule' | 'requisitions' | 'tickets'
  const [activeTab, setActiveTab] = useState('sessions');

  // Common Data States
  const [patients, setPatients] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [sessionsLogs, setSessionsLogs] = useState([]);
  const [requisitions, setRequisitions] = useState([]);
  const [stockItems, setStockItems] = useState([]);
  const [productKits, setProductKits] = useState([]);
  const [equipments, setEquipments] = useState([]);
  const [serviceOrders, setServiceOrders] = useState([]);
  const [tenantSettings, setTenantSettings] = useState({});

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // ----------------------------------------------------
  // ----------------------------------------------------
  // TAB 1: SESSÃO (Hemodialysis Session Tracking)
  // ----------------------------------------------------
  const [sessionSearchTerm, setSessionSearchTerm] = useState('');
  const [sessionCadenceFilter, setSessionCadenceFilter] = useState('all');
  const [sessionShiftFilter, setSessionShiftFilter] = useState('all');
  const [sessionRoomFilter, setSessionRoomFilter] = useState('all');
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [selectedSessionPatient, setSelectedSessionPatient] = useState(null);
  const [patientSearchTerm, setPatientSearchTerm] = useState('');

  const [machineId, setMachineId] = useState('Máquina 01 - Fresenius 4008S');
  const [preWeight, setPreWeight] = useState('');
  const [finalWeight, setFinalWeight] = useState('');
  const [preBp, setPreBp] = useState('130/80');
  const [preHr, setPreHr] = useState('76');
  const [preTemp, setPreTemp] = useState('36.2');
  const [accessEvaluation, setAccessEvaluation] = useState('FAV com bom frêmito e sopro');
  const [finalBp, setFinalBp] = useState('120/80');
  const [hemostasisTime, setHemostasisTime] = useState('15 min');
  const [dressingCondition, setDressingCondition] = useState('Limpo e oclusivo');
  const [hourlyRecords, setHourlyRecords] = useState([
    { hour: '1ªh', bp: '130/80', hr: '76', venousPressure: '120', arterialPressure: '-150', bloodFlowReal: '350', ufRate: '0.8', heparin: '1000 UI', notes: 'Início sem queixas' }
  ]);
  const [complications, setComplications] = useState([]);
  const [sessionNotes, setSessionNotes] = useState('');

  // ----------------------------------------------------
  // TAB 3: REQUISIÇÃO (Insumos & Kits)
  // ----------------------------------------------------
  const [reqViewMode, setReqViewMode] = useState('compact'); // 'compact' | 'normal' | 'cards'
  const [reqSearchTerm, setReqSearchTerm] = useState('');
  const [reqStatusFilter, setReqStatusFilter] = useState('all');
  const [reqSalonFilter, setReqSalonFilter] = useState('all');
  const [showReqModal, setShowReqModal] = useState(false);
  const [editingReq, setEditingReq] = useState(null);
  const [showReqDetailModal, setShowReqDetailModal] = useState(false);
  const [selectedReqDetail, setSelectedReqDetail] = useState(null);
  
  // Requisition Form
  const [reqPatientId, setReqPatientId] = useState('');
  const [reqPatientName, setReqPatientName] = useState('');
  const [reqSalonLocation, setReqSalonLocation] = useState('Salão 01');
  const [reqHasKit, setReqHasKit] = useState(false);
  const [reqSelectedKitId, setReqSelectedKitId] = useState('');
  const [reqIsGeneralUse, setReqIsGeneralUse] = useState(true);
  const [reqNotes, setReqNotes] = useState('');
  const [selectedItemId, setSelectedItemId] = useState('');
  const [itemSearchText, setItemSearchText] = useState('');
  const [isProductDropdownOpen, setIsProductDropdownOpen] = useState(false);
  const [requestedQty, setRequestedQty] = useState('1');
  const [reqItemsList, setReqItemsList] = useState([]);
  const [itemStockAlert, setItemStockAlert] = useState('');

  // ----------------------------------------------------
  // TAB 4: CHAMADOS (Máquinas & Equipamentos HD)
  // ----------------------------------------------------
  const [ticketSearchTerm, setTicketSearchTerm] = useState('');
  const [ticketStatusFilter, setTicketStatusFilter] = useState('all');
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [ticketForm, setTicketForm] = useState({
    equipmentId: '',
    type: 'Corretiva',
    priority: 'Alta',
    description: '',
    sector: 'Salão 01'
  });

  // Unit filtered data with safe fallback
  const currentPatients = useMemo(() => {
    const list = filterByActiveUnit(patients);
    return list.length > 0 ? list : (patients || []);
  }, [patients, activeUnitId]);

  // Pacientes filtrados para o modal de autocomplete (Idêntico ao AssistPanel)
  const filteredModalPatients = useMemo(() => {
    const term = (patientSearchTerm || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
    const termCpf = term.replace(/\D/g, '');
    return currentPatients.filter(p => {
      const pName = (p.name || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
      const pCpf = (p.cpf || '').replace(/\D/g, '');
      const pRoom = (p.room || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
      return pName.includes(term) || (termCpf && pCpf.includes(termCpf)) || pRoom.includes(term);
    }).slice(0, 10);
  }, [currentPatients, patientSearchTerm]);

  const currentRequisitions = useMemo(() => filterByActiveUnit(requisitions), [requisitions, activeUnitId]);
  const currentStockItems = useMemo(() => filterByActiveUnit(stockItems), [stockItems, activeUnitId]);
  const currentEquipments = useMemo(() => filterByActiveUnit(equipments), [equipments, activeUnitId]);
  const currentServiceOrders = useMemo(() => filterByActiveUnit(serviceOrders), [serviceOrders, activeUnitId]);

  const todayStr = useMemo(() => new Date().toISOString().substring(0, 10), []);

  const filteredSessionPatients = useMemo(() => {
    if (!sessionSearchTerm) {
      return currentPatients.filter(patient => {
        if (sessionShiftFilter !== 'all' && patient.shift && patient.shift !== sessionShiftFilter) return false;
        if (sessionRoomFilter !== 'all' && patient.room && patient.room !== sessionRoomFilter) return false;
        if (sessionCadenceFilter !== 'all') {
          const freq = (patient.dialysisFrequency || '').toLowerCase();
          if (sessionCadenceFilter === 'SQS' && !freq.includes('seg') && !freq.includes('sqs') && freq) return false;
          if (sessionCadenceFilter === 'TQS' && !freq.includes('ter') && !freq.includes('tqs') && freq) return false;
        }
        return true;
      });
    }

    const term = (sessionSearchTerm || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
    const termCpf = term.replace(/\D/g, '');
    return currentPatients.filter(p => {
      const pName = (p.name || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
      const pCpf = (p.cpf || '').replace(/\D/g, '');
      const pRoom = (p.room || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
      return pName.includes(term) || (termCpf && pCpf.includes(termCpf)) || pRoom.includes(term);
    });
  }, [currentPatients, sessionSearchTerm, sessionShiftFilter, sessionRoomFilter, sessionCadenceFilter]);

  const sortedStockItems = useMemo(() => {
    return [...currentStockItems].sort((a, b) => (a.name || '').localeCompare(b.name || '', 'pt-BR'));
  }, [currentStockItems]);

  const filteredStockItems = useMemo(() => {
    if (!itemSearchText.trim()) return sortedStockItems;
    const term = itemSearchText.toLowerCase();
    return sortedStockItems.filter(item => 
      (item.name || '').toLowerCase().includes(term) ||
      (item.code || '').toLowerCase().includes(term) ||
      (item.category || '').toLowerCase().includes(term)
    );
  }, [sortedStockItems, itemSearchText]);

  const dialysisEquipments = useMemo(() => {
    return currentEquipments.filter(e => 
      (e.category === 'Biomédico' || e.name?.toLowerCase().includes('máquina') || e.name?.toLowerCase().includes('hemodiálise') || e.name?.toLowerCase().includes('poltrona') || e.name?.toLowerCase().includes('osmose'))
    );
  }, [currentEquipments]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pList, prescList, sLogs, rList, sList, kList, eqList, oList, settings] = await Promise.all([
        dbService.getPatients ? dbService.getPatients() : [],
        dbService.getPrescriptions ? dbService.getPrescriptions() : [],
        dbService.getSessionsLogs ? dbService.getSessionsLogs() : [],
        dbService.getMaterialRequisitions ? dbService.getMaterialRequisitions() : [],
        dbService.getInventoryItems ? dbService.getInventoryItems() : [],
        dbService.getProductKits ? dbService.getProductKits() : [],
        dbService.getEquipments ? dbService.getEquipments() : [],
        dbService.getServiceOrders ? dbService.getServiceOrders() : [],
        dbService.getTenantSettings ? dbService.getTenantSettings() : {}
      ]);

      setPatients(pList || []);
      setPrescriptions(prescList || []);
      setSessionsLogs(sLogs || []);
      setRequisitions(rList || []);
      setStockItems(sList || []);
      setProductKits(kList || []);
      setEquipments(eqList || []);
      setServiceOrders(oList || []);
      setTenantSettings(settings || {});
    } catch (err) {
      console.error('Erro ao carregar dados do NexaCARE:', err);
      showAlert('Erro ao sincronizar informações.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 5000);
  };

  // ----------------------------------------------------
  // HANDLERS: SESSÃO
  // ----------------------------------------------------
  const handleOpenSessionModal = (patient) => {
    if (!patient) return;
    setSelectedSessionPatient(patient);
    setPatientSearchTerm(patient.name || '');

    const existing = sessionsLogs.find(l => l.patientId === patient.id && l.date === todayStr);

    if (existing) {
      setHourlyRecords(existing.hourlyData || []);
      setComplications(existing.complications || []);
      setSessionNotes(existing.notes || '');
      setMachineId(existing.machineId || 'Máquina 01 - Fresenius 4008S');
      setPreWeight(existing.preWeight?.toString() || '');
      setFinalWeight(existing.finalWeight?.toString() || '');
      setPreBp(existing.preBp || '130/80');
      setPreHr(existing.preHr || '76');
      setPreTemp(existing.preTemp || '36.2');
      setAccessEvaluation(existing.accessEvaluation || 'FAV com bom frêmito e sopro');
      setFinalBp(existing.finalBp || '120/80');
      setHemostasisTime(existing.hemostasisTime || '15 min');
      setDressingCondition(existing.dressingCondition || 'Limpo e oclusivo');
    } else {
      setHourlyRecords([
        { hour: '1ªh', bp: '130/80', hr: '76', venousPressure: '120', arterialPressure: '-150', bloodFlowReal: '350', ufRate: '0.8', heparin: '1000 UI', notes: 'Início sem queixas' }
      ]);
      setComplications([]);
      setSessionNotes('');
      setMachineId(patient.chairNumber ? `Máquina ${String(patient.chairNumber).padStart(2, '0')} - Fresenius 4008S` : 'Máquina 01 - Fresenius 4008S');
      setPreWeight(patient.dryWeight ? (parseFloat(patient.dryWeight) + 2.5).toFixed(1) : '');
      setFinalWeight(patient.dryWeight ? patient.dryWeight.toString() : '');
      setPreBp('130/80');
      setPreHr('76');
      setPreTemp('36.2');
      setAccessEvaluation('FAV com bom frêmito e sopro');
      setFinalBp('120/80');
      setHemostasisTime('15 min');
      setDressingCondition('Limpo e oclusivo');
    }
    setShowSessionModal(true);
  };

  const handleSelectPatient = (patient) => {
    handleOpenSessionModal(patient);
    setPatientSearchTerm(patient.name || '');
  };

  const handleOpenNewSessionModal = (patient = null) => {
    if (patient) {
      handleOpenSessionModal(patient);
    } else {
      setSelectedSessionPatient(null);
      setPatientSearchTerm('');
      setShowSessionModal(true);
    }
  };

  const handleAddHourRow = () => {
    const nextHour = `${hourlyRecords.length + 1}ªh`;
    const lastRow = hourlyRecords[hourlyRecords.length - 1] || {};
    setHourlyRecords([
      ...hourlyRecords,
      {
        hour: nextHour,
        bp: lastRow.bp || '120/80',
        hr: lastRow.hr || '76',
        venousPressure: lastRow.venousPressure || '120',
        arterialPressure: lastRow.arterialPressure || '-150',
        bloodFlowReal: lastRow.bloodFlowReal || '350',
        ufRate: lastRow.ufRate || '0.8',
        heparin: '500 UI',
        notes: ''
      }
    ]);
  };

  const handleHourlyRowChange = (index, field, value) => {
    const updated = [...hourlyRecords];
    updated[index][field] = value;
    setHourlyRecords(updated);
  };

  const handleRemoveHourRow = (index) => {
    setHourlyRecords(hourlyRecords.filter((_, idx) => idx !== index));
  };

  const toggleComplication = (compName) => {
    if (complications.includes(compName)) {
      setComplications(complications.filter(c => c !== compName));
    } else {
      setComplications([...complications, compName]);
    }
  };

  const handleSaveSession = async () => {
    if (!selectedSessionPatient) return;
    setActionLoading(true);
    try {
      const payload = {
        patientId: selectedSessionPatient.id,
        patientName: selectedSessionPatient.name,
        date: todayStr,
        shift: selectedSessionPatient.shift || '1º Turno',
        room: selectedSessionPatient.room || 'Salão 01',
        chairNumber: selectedSessionPatient.chairNumber || '01',
        machineId,
        preWeight: parseFloat(preWeight) || 0,
        finalWeight: parseFloat(finalWeight) || 0,
        preBp,
        preHr,
        preTemp,
        accessEvaluation,
        finalBp,
        hemostasisTime,
        dressingCondition,
        hourlyData: hourlyRecords,
        complications,
        notes: sessionNotes,
        technicianName: currentUser?.name || 'Técnica de Enfermagem',
        unit: activeUnitId
      };

      await dbService.saveSessionLog(payload);
      showAlert(`Sessão de ${selectedSessionPatient.name} registrada com sucesso!`, 'success');
      setShowSessionModal(false);
      
      const sLogs = await dbService.getSessionsLogs();
      setSessionsLogs(sLogs || []);
    } catch (err) {
      console.error(err);
      showAlert('Erro ao salvar sessão de hemodiálise.', 'danger');
    } finally {
      setActionLoading(false);
    }
  };

  // ----------------------------------------------------
  // HANDLERS: REQUISIÇÃO
  // ----------------------------------------------------
  const handleOpenReqModal = () => {
    setEditingReq(null);
    setReqPatientId('');
    setReqPatientName('');
    setReqSalonLocation('Salão 01');
    setReqHasKit(false);
    setReqSelectedKitId('');
    setReqIsGeneralUse(true);
    setReqNotes('');
    setReqItemsList([]);
    setItemSearchText('');
    setSelectedItemId('');
    setRequestedQty('1');
    setShowReqModal(true);
  };

  const handleAddItemToReq = () => {
    if (!selectedItemId) return;
    const item = stockItems.find(i => i.id === selectedItemId);
    if (!item) return;

    const qty = parseInt(requestedQty, 10);
    if (isNaN(qty) || qty <= 0) return;

    if (tenantSettings.blockRequisitionZeroStock && (item.currentStock || 0) < qty) {
      return setItemStockAlert(`Estoque insuficiente! Saldo disponível: ${item.currentStock || 0}`);
    }

    const existingIdx = reqItemsList.findIndex(i => i.itemId === item.id);
    if (existingIdx > -1) {
      const updated = [...reqItemsList];
      updated[existingIdx].quantity += qty;
      setReqItemsList(updated);
    } else {
      setReqItemsList([
        ...reqItemsList,
        {
          itemId: item.id,
          name: item.name,
          category: item.category || 'Insumo',
          unit: item.unit || 'UN',
          quantity: qty,
          currentStock: item.currentStock || 0
        }
      ]);
    }

    setSelectedItemId('');
    setItemSearchText('');
    setRequestedQty('1');
    setItemStockAlert('');
  };

  const handleApplyKitToReq = (kitId) => {
    setReqSelectedKitId(kitId);
    if (!kitId) return;
    const kit = productKits.find(k => k.id === kitId);
    if (kit && kit.items) {
      const itemsFormatted = kit.items.map(kItem => {
        const foundStock = stockItems.find(s => s.id === kItem.itemId || s.name === kItem.name);
        return {
          itemId: kItem.itemId || foundStock?.id || 'item-kit-' + Math.random(),
          name: kItem.name,
          category: kItem.category || 'Kit',
          unit: kItem.unit || 'UN',
          quantity: kItem.quantity || 1,
          currentStock: foundStock?.currentStock || 100
        };
      });
      setReqItemsList(itemsFormatted);
    }
  };

  const handleSaveRequisition = async (e) => {
    e.preventDefault();
    if (reqItemsList.length === 0) return showAlert('Adicione ao menos um item à requisição.', 'warning');

    setActionLoading(true);
    try {
      const payload = {
        patientId: reqIsGeneralUse ? null : reqPatientId,
        patientName: reqIsGeneralUse ? 'Uso Geral do Salão' : reqPatientName,
        salonLocation: reqSalonLocation,
        isGeneralUse: reqIsGeneralUse,
        hasKit: reqHasKit,
        kitId: reqSelectedKitId,
        notes: reqNotes,
        items: reqItemsList,
        requesterName: currentUser?.name || 'Técnica de Enfermagem',
        requesterId: currentUser?.uid || 'user-tech',
        status: 'Pendente',
        unit: activeUnitId
      };

      if (editingReq) {
        await dbService.saveMaterialRequisition({ ...editingReq, ...payload });
        showAlert('Requisição atualizada!', 'success');
      } else {
        await dbService.saveMaterialRequisition(payload);
        showAlert('Requisição enviada para a Farmácia/Estoque!', 'success');
      }

      setShowReqModal(false);
      const rList = await dbService.getMaterialRequisitions();
      setRequisitions(rList || []);
    } catch (err) {
      showAlert('Erro ao salvar requisição.', 'danger');
    } finally {
      setActionLoading(false);
    }
  };

  // ----------------------------------------------------
  // HANDLERS: CHAMADOS DE MÁQUINAS
  // ----------------------------------------------------
  const handleOpenTicketModal = () => {
    const firstEq = dialysisEquipments[0];
    setTicketForm({
      equipmentId: firstEq?.id || '',
      type: 'Corretiva',
      priority: 'Alta',
      description: '',
      sector: 'Salão 01'
    });
    setShowTicketModal(true);
  };

  const handleSaveTicket = async (e) => {
    e.preventDefault();
    if (!ticketForm.description.trim()) return showAlert('Descreva o defeito da máquina.', 'warning');

    setActionLoading(true);
    try {
      const targetEq = equipments.find(eq => eq.id === ticketForm.equipmentId);
      const payload = {
        equipmentId: ticketForm.equipmentId,
        equipmentName: targetEq?.name || 'Máquina de Hemodiálise',
        equipmentCode: targetEq?.code || '',
        sector: ticketForm.sector,
        type: ticketForm.type,
        priority: ticketForm.priority,
        status: 'Aberta',
        description: ticketForm.description,
        requesterName: currentUser?.name || 'Técnica de Enfermagem',
        requesterSector: 'Salão de Hemodiálise',
        unit: activeUnitId
      };

      await dbService.saveServiceOrder(payload, 'Chamado de máquina aberto pelo NexaCARE (Salão).', true);
      showAlert('Chamado de máquina registrado com sucesso para a Engenharia Clínica!', 'success');
      setShowTicketModal(false);

      const oList = await dbService.getServiceOrders();
      setServiceOrders(oList || []);
    } catch (err) {
      showAlert('Erro ao abrir chamado de máquina.', 'danger');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Hero Header Padrão Oficial Nexa */}
      <div style={styles.cardHeader}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={styles.heroIconBox}>
              <HeartPulse size={24} color="#ffffff" />
            </div>
            <div>
              <h1 style={styles.title}>NexaCARE — Enfermagem & Salão</h1>
              <p style={styles.subtitle}>
                Digitação de sessões de hemodiálise, consulta da escala de salão, requisição de insumos e abertura de chamados técnicos de máquinas.
              </p>
            </div>
          </div>
          <UnitSelector compact showLabel={false} />
        </div>
      </div>

      {/* Main Tabs Navigation (Strict 1-Word Clean Rule) */}
      <div style={styles.tabsWrapper}>
        <button 
          onClick={() => setActiveTab('sessions')} 
          style={{ ...styles.tabBtn, ...(activeTab === 'sessions' ? styles.tabBtnActive : {}) }}
        >
          <Activity size={16} /> Sessão
          <span style={styles.tabBadge}>
            {sessionsLogs.filter(l => l.date === todayStr && matchItemUnit(l)).length}/{currentPatients.length}
          </span>
        </button>

        <button 
          onClick={() => setActiveTab('schedule')} 
          style={{ ...styles.tabBtn, ...(activeTab === 'schedule' ? styles.tabBtnActive : {}) }}
        >
          <Calendar size={16} /> Escala
        </button>

        <button 
          onClick={() => setActiveTab('requisitions')} 
          style={{ ...styles.tabBtn, ...(activeTab === 'requisitions' ? styles.tabBtnActive : {}) }}
        >
          <ClipboardList size={16} /> Requisição
          {currentRequisitions.filter(r => r.status === 'Pendente').length > 0 && (
            <span style={{ ...styles.tabBadge, backgroundColor: '#fef3c7', color: '#b45309' }}>
              {currentRequisitions.filter(r => r.status === 'Pendente').length}
            </span>
          )}
        </button>

        <button 
          onClick={() => setActiveTab('tickets')} 
          style={{ ...styles.tabBtn, ...(activeTab === 'tickets' ? styles.tabBtnActive : {}) }}
        >
          <Wrench size={16} /> Chamados
          {currentServiceOrders.filter(o => o.status === 'Aberta' || o.status === 'Em Diagnóstico').length > 0 && (
            <span style={{ ...styles.tabBadge, backgroundColor: '#fee2e2', color: '#b91c1c' }}>
              {currentServiceOrders.filter(o => o.status === 'Aberta' || o.status === 'Em Diagnóstico').length}
            </span>
          )}
        </button>
      </div>

      {/* Message feedback */}
      {message.text && (
        <div style={{ ...styles.alert, backgroundColor: `var(--${message.type}-light, #f0fdf4)`, border: `1px solid var(--${message.type}-color, #10b981)` }}>
          <AlertTriangle size={18} color="var(--primary-color)" />
          <span style={{ fontWeight: '600' }}>{message.text}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ABA 1: SESSÃO                                                            */}
      {/* ========================================================================= */}
      {activeTab === 'sessions' && (
        <div style={styles.contentCard}>
          {/* Controls Header */}
          <div style={styles.controlsBar}>
            <div style={styles.searchWrapper}>
              <Search size={16} style={styles.searchIcon} />
              <input 
                type="text" 
                placeholder="Buscar paciente, CPF, cadeira..."
                value={sessionSearchTerm}
                onChange={e => setSessionSearchTerm(e.target.value)}
                style={styles.searchInput}
              />
              {sessionSearchTerm && (
                <button 
                  onClick={() => setSessionSearchTerm('')} 
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '0 0.5rem', display: 'flex', alignItems: 'center' }}
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <select 
                className="form-control" 
                value={sessionCadenceFilter} 
                onChange={e => setSessionCadenceFilter(e.target.value)}
                style={{ width: '150px', fontSize: '0.85rem' }}
              >
                <option value="all">Cadência (Todas)</option>
                <option value="today">Hoje (Turno Atual)</option>
                <option value="SQS">Seg / Qua / Sex (SQS)</option>
                <option value="TQS">Ter / Qui / Sáb (TQS)</option>
              </select>

              <select 
                className="form-control" 
                value={sessionShiftFilter} 
                onChange={e => setSessionShiftFilter(e.target.value)}
                style={{ width: '130px', fontSize: '0.85rem' }}
              >
                <option value="all">Turno (Todos)</option>
                <option value="1º Turno">1º Turno</option>
                <option value="2º Turno">2º Turno</option>
                <option value="3º Turno">3º Turno</option>
              </select>

              <select 
                className="form-control" 
                value={sessionRoomFilter} 
                onChange={e => setSessionRoomFilter(e.target.value)}
                style={{ width: '130px', fontSize: '0.85rem' }}
              >
                <option value="all">Salão (Todos)</option>
                <option value="Salão 01">Salão 01</option>
                <option value="Salão 02">Salão 02</option>
                <option value="Salão 03">Salão 03</option>
              </select>

              <button 
                onClick={() => handleOpenNewSessionModal()} 
                className="btn btn-primary"
                style={{ 
                  backgroundColor: '#0d9488', 
                  color: '#ffffff',
                  border: 'none', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.4rem',
                  fontWeight: '700',
                  padding: '0.55rem 1rem',
                  borderRadius: '8px',
                  boxShadow: '0 2px 4px rgba(13, 148, 136, 0.25)',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                <Plus size={16} /> Iniciar Sessão
              </button>
            </div>
          </div>

          {/* Patients Table for Session Monitoring */}
          <div style={styles.tableResponsive}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th>Paciente</th>
                  <th>Cadeira</th>
                  <th>Salão</th>
                  <th>Turno</th>
                  <th>Acesso</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredSessionPatients.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                        <HeartPulse size={42} color="#94a3b8" />
                        <p style={{ margin: 0, fontWeight: '700', color: '#334155', fontSize: '1.05rem' }}>
                          Nenhum paciente encontrado com os filtros atuais
                        </p>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
                          Tente ajustar a busca, alterar a Cadência/Salão ou inicie uma nova sessão diretamente.
                        </p>
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                          <button 
                            onClick={() => { setSessionSearchTerm(''); setSessionShiftFilter('all'); setSessionRoomFilter('all'); setSessionCadenceFilter('all'); }}
                            className="btn btn-sm btn-outline-secondary"
                            style={{ borderRadius: '6px' }}
                          >
                            Limpar Filtros
                          </button>
                          <button 
                            onClick={() => handleOpenNewSessionModal()}
                            className="btn btn-sm btn-primary"
                            style={{ backgroundColor: '#0d9488', border: 'none', borderRadius: '6px', fontWeight: '700' }}
                          >
                            <Plus size={14} /> Iniciar Sessão
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredSessionPatients.map(patient => {
                    const log = sessionsLogs.find(l => l.patientId === patient.id && l.date === todayStr);
                    const hasComplications = log?.complications?.length > 0;

                    return (
                      <tr key={patient.id}>
                        <td>
                          <div style={{ fontWeight: '700', color: '#1e293b' }}>{patient.name}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                            CPF: {patient.cpf || 'Não informado'} • Peso Seco: {patient.dryWeight ? `${patient.dryWeight} kg` : 'N/D'}
                          </div>
                        </td>
                        <td>
                          <span style={styles.chairBadge}>#{patient.chairNumber || '--'}</span>
                        </td>
                        <td>{patient.room || 'Salão 01'}</td>
                        <td>{patient.shift || '1º Turno'}</td>
                        <td>
                          <span style={{ fontSize: '0.8rem', fontWeight: '600', color: '#0369a1' }}>
                            {patient.accessType || 'FAV'}
                          </span>
                        </td>
                        <td>
                          {log ? (
                            <span style={{
                              ...styles.statusBadge,
                              backgroundColor: hasComplications ? '#fef2f2' : '#f0fdf4',
                              color: hasComplications ? '#b91c1c' : '#15803d',
                              border: `1px solid ${hasComplications ? '#fecaca' : '#bbf7d0'}`
                            }}>
                              <CheckCircle2 size={12} /> {log.hourlyData?.length || 0}h Registradas {hasComplications && '⚠️'}
                            </span>
                          ) : (
                            <span style={{ ...styles.statusBadge, backgroundColor: '#fffbeb', color: '#b45309', border: '1px solid #fef3c7' }}>
                              <Clock size={12} /> Pendente
                            </span>
                          )}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button 
                            onClick={() => handleOpenSessionModal(patient)} 
                            className="btn btn-sm"
                            style={{ 
                              backgroundColor: log ? '#0f766e' : '#0d9488', 
                              color: '#ffffff',
                              fontWeight: '700',
                              borderRadius: '6px',
                              padding: '0.45rem 0.9rem',
                              border: 'none',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                            }}
                          >
                            <Activity size={14} /> {log ? 'Acompanhar' : 'Digitar'}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ABA 2: ESCALA                                                            */}
      {/* ========================================================================= */}
      {activeTab === 'schedule' && (
        <div style={{ marginTop: '0.5rem' }}>
          <DialysisScheduleTab currentUser={currentUser} />
        </div>
      )}

      {/* ========================================================================= */}
      {/* ABA 3: REQUISIÇÃO                                                        */}
      {/* ========================================================================= */}
      {activeTab === 'requisitions' && (
        <div style={styles.contentCard}>
          <div style={styles.controlsBar}>
            <div style={styles.searchWrapper}>
              <Search size={16} style={styles.searchIcon} />
              <input 
                type="text" 
                placeholder="Filtrar requisições por paciente, insumo ou código..."
                value={reqSearchTerm}
                onChange={e => setReqSearchTerm(e.target.value)}
                style={styles.searchInput}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <select 
                className="form-control" 
                value={reqStatusFilter} 
                onChange={e => setReqStatusFilter(e.target.value)}
                style={{ width: '130px', fontSize: '0.85rem' }}
              >
                <option value="all">Status (Todos)</option>
                <option value="Pendente">Pendente</option>
                <option value="Atendida">Atendida</option>
                <option value="Parcial">Parcial</option>
              </select>

              <select 
                className="form-control" 
                value={reqSalonFilter} 
                onChange={e => setReqSalonFilter(e.target.value)}
                style={{ width: '130px', fontSize: '0.85rem' }}
              >
                <option value="all">Salão (Todos)</option>
                <option value="Salão 01">Salão 01</option>
                <option value="Salão 02">Salão 02</option>
                <option value="Salão 03">Salão 03</option>
              </select>

              <button 
                onClick={handleOpenReqModal} 
                className="btn btn-primary"
                style={{ backgroundColor: '#14b8a6', border: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <Plus size={16} /> Nova Requisição
              </button>
            </div>
          </div>

          <div style={styles.tableResponsive}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Paciente</th>
                  <th>Salão</th>
                  <th>Itens Solicitados</th>
                  <th>Status</th>
                  <th>Data</th>
                  <th style={{ textAlign: 'right' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {currentRequisitions.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                      Nenhuma requisição lançada. Clique em "Nova Requisição" para solicitar kits ou materiais de diálise.
                    </td>
                  </tr>
                ) : (
                  currentRequisitions
                    .filter(r => {
                      const matchSearch = (r.patientName || '').toLowerCase().includes(reqSearchTerm.toLowerCase()) ||
                                          (r.id || '').toLowerCase().includes(reqSearchTerm.toLowerCase());
                      const matchStatus = reqStatusFilter === 'all' || r.status === reqStatusFilter;
                      const matchSalon = reqSalonFilter === 'all' || r.salonLocation === reqSalonFilter;
                      return matchSearch && matchStatus && matchSalon;
                    })
                    .map(req => (
                      <tr key={req.id}>
                        <td style={{ fontWeight: '700', color: '#0f766e' }}>{req.id?.substring(0, 8)}</td>
                        <td style={{ fontWeight: '600' }}>{req.patientName || 'Uso Geral do Salão'}</td>
                        <td>{req.salonLocation || 'Salão 01'}</td>
                        <td>
                          <span style={{ fontSize: '0.85rem' }}>
                            {req.items?.length || 0} item(ns) {req.hasKit && '📦 (Kit)'}
                          </span>
                        </td>
                        <td>
                          <span style={{
                            ...styles.statusBadge,
                            backgroundColor: req.status === 'Atendida' ? '#f0fdf4' : req.status === 'Pendente' ? '#fef3c7' : '#f1f5f9',
                            color: req.status === 'Atendida' ? '#15803d' : req.status === 'Pendente' ? '#b45309' : '#475569',
                            border: `1px solid ${req.status === 'Atendida' ? '#bbf7d0' : '#fde68a'}`
                          }}>
                            {req.status}
                          </span>
                        </td>
                        <td style={{ fontSize: '0.8rem', color: '#64748b' }}>
                          {new Date(req.createdAt || Date.now()).toLocaleDateString('pt-BR')}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button 
                            onClick={() => {
                              setSelectedReqDetail(req);
                              setShowReqDetailModal(true);
                            }}
                            className="btn btn-sm btn-outline"
                            style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                          >
                            <Eye size={13} style={{ marginRight: '3px' }} /> Detalhes
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

      {/* ========================================================================= */}
      {/* ABA 4: CHAMADOS                                                          */}
      {/* ========================================================================= */}
      {activeTab === 'tickets' && (
        <div style={styles.contentCard}>
          <div style={styles.controlsBar}>
            <div style={styles.searchWrapper}>
              <Search size={16} style={styles.searchIcon} />
              <input 
                type="text" 
                placeholder="Buscar chamado por máquina, salão ou defeito..."
                value={ticketSearchTerm}
                onChange={e => setTicketSearchTerm(e.target.value)}
                style={styles.searchInput}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <select 
                className="form-control" 
                value={ticketStatusFilter} 
                onChange={e => setTicketStatusFilter(e.target.value)}
                style={{ width: '130px', fontSize: '0.85rem' }}
              >
                <option value="all">Status (Todos)</option>
                <option value="Aberta">Aberta</option>
                <option value="Em Diagnóstico">Em Diagnóstico</option>
                <option value="Concluída">Concluída</option>
              </select>

              <button 
                onClick={handleOpenTicketModal} 
                className="btn btn-primary"
                style={{ backgroundColor: '#0891b2', border: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <Plus size={16} /> Abrir Chamado
              </button>
            </div>
          </div>

          <div style={styles.tableResponsive}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th>Máquina / Ativo</th>
                  <th>Salão</th>
                  <th>Defeito Relatado</th>
                  <th>Prioridade</th>
                  <th>Status Manutenção</th>
                  <th>Abertura</th>
                </tr>
              </thead>
              <tbody>
                {currentServiceOrders.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                      Nenhum chamado aberto. Clique em "Abrir Chamado" para relatar falha em máquinas de hemodiálise ou poltronas.
                    </td>
                  </tr>
                ) : (
                  currentServiceOrders
                    .filter(o => {
                      const matchSearch = (o.equipmentName || '').toLowerCase().includes(ticketSearchTerm.toLowerCase()) ||
                                          (o.description || '').toLowerCase().includes(ticketSearchTerm.toLowerCase());
                      const matchStatus = ticketStatusFilter === 'all' || o.status === ticketStatusFilter;
                      return matchSearch && matchStatus;
                    })
                    .map(order => (
                      <tr key={order.id}>
                        <td>
                          <div style={{ fontWeight: '700', color: '#1e293b' }}>{order.equipmentName}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{order.equipmentCode || 'Biomédico'}</div>
                        </td>
                        <td>{order.sector || 'Salão de Diálise'}</td>
                        <td style={{ maxWidth: '300px' }}>
                          <span style={{ fontSize: '0.85rem', color: '#334155' }}>{order.description}</span>
                        </td>
                        <td>
                          <span style={{
                            ...styles.statusBadge,
                            backgroundColor: order.priority === 'Urgente' || order.priority === 'Alta' ? '#fef2f2' : '#f0f9ff',
                            color: order.priority === 'Urgente' || order.priority === 'Alta' ? '#b91c1c' : '#0369a1',
                            border: `1px solid ${order.priority === 'Urgente' || order.priority === 'Alta' ? '#fecaca' : '#bae6fd'}`
                          }}>
                            {order.priority || 'Normal'}
                          </span>
                        </td>
                        <td>
                          <span style={{
                            ...styles.statusBadge,
                            backgroundColor: order.status === 'Concluída' ? '#f0fdf4' : order.status === 'Aberta' ? '#fef2f2' : '#fef3c7',
                            color: order.status === 'Concluída' ? '#15803d' : order.status === 'Aberta' ? '#b91c1c' : '#b45309',
                            border: `1px solid ${order.status === 'Concluída' ? '#bbf7d0' : order.status === 'Aberta' ? '#fecaca' : '#fde68a'}`
                          }}>
                            {order.status}
                          </span>
                        </td>
                        <td style={{ fontSize: '0.8rem', color: '#64748b' }}>
                          {new Date(order.createdAt || Date.now()).toLocaleDateString('pt-BR')}
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: DIGITAÇÃO DA SESSÃO DE HEMODIÁLISE                                 */}
      {/* ========================================================================= */}
      {showSessionModal && (
        <div style={styles.modalOverlay}>
          <div style={{ ...styles.modalCard, maxWidth: '950px' }}>
            <div style={styles.modalHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ ...styles.heroIconBox, width: '40px', height: '40px' }}>
                  <Activity size={20} color="#fff" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800' }}>
                    {selectedSessionPatient ? `Sessão — ${selectedSessionPatient.name}` : 'Iniciar Sessão de Diálise'}
                  </h3>
                  {selectedSessionPatient && (
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      {selectedSessionPatient.room || 'Salão 01'} • Cadeira #{selectedSessionPatient.chairNumber || '01'} • {selectedSessionPatient.shift || '1º Turno'} • Acesso: {selectedSessionPatient.accessType || 'FAV'}
                    </span>
                  )}
                </div>
              </div>
              <button onClick={() => setShowSessionModal(false)} style={styles.modalCloseBtn}><X size={20} /></button>
            </div>

            <div style={styles.modalBody}>
              {/* Paciente com Autocomplete (Idêntico ao AssistPanel) */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                  Paciente:
                </label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type="text"
                    placeholder="Digite o nome ou CPF..."
                    value={patientSearchTerm}
                    onChange={(e) => {
                      setPatientSearchTerm(e.target.value);
                      if (!e.target.value) {
                        setSelectedSessionPatient(null);
                      }
                    }}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid #d1d5db',
                      fontSize: '0.9rem',
                      outline: 'none',
                      backgroundColor: '#fff',
                      boxSizing: 'border-box'
                    }}
                  />
                  {patientSearchTerm && !selectedSessionPatient && filteredModalPatients.length > 0 && (
                    <div style={styles.patientDropdown}>
                      {filteredModalPatients.map(pat => (
                        <div 
                          key={pat.id} 
                          onClick={() => handleSelectPatient(pat)}
                          style={styles.patientDropdownItem}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
                        >
                          <div style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '0.95rem' }}>{pat.name}</div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                            CPF: {pat.cpf || 'N/A'} • {pat.room || 'Sem salão'} ({pat.shift || 'Turno N/A'})
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {selectedSessionPatient && (
                  <div style={styles.selectedPatientBadge}>
                    <span>Vinculado a: <strong>{selectedSessionPatient.name}</strong></span>
                    <button 
                      type="button" 
                      onClick={() => {
                        setSelectedSessionPatient(null);
                        setPatientSearchTerm('');
                      }}
                      style={styles.removeLinkBtn}
                    >
                      Trocar Paciente
                    </button>
                  </div>
                )}
              </div>

              {!selectedSessionPatient && (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px dashed #cbd5e1' }}>
                  <HeartPulse size={42} color="#0d9488" style={{ marginBottom: '0.75rem' }} />
                  <h4 style={{ margin: '0 0 0.5rem 0', fontWeight: '800', color: '#1e293b' }}>Selecione um Paciente</h4>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b' }}>
                    Digite o nome ou CPF no campo acima para selecionar o paciente e abrir a folha de diálise.
                  </p>
                </div>
              )}

              {selectedSessionPatient && (
                <>
                  {/* Prescrição Vigente Resumida */}
                  <div style={styles.prescInfoBox}>
                    <span style={{ fontWeight: '700', color: '#0f766e', fontSize: '0.85rem' }}>📋 Prescrição Médica:</span>
                    <span style={{ fontSize: '0.8rem', color: '#334155' }}>
                      Tempo: 4.0h • Fluxo Sangue (Qb): 350 mL/min • Capilar: Alto Fluxo • Heparina: 5000 UI • Peso Seco Alvo: <strong>{selectedSessionPatient.dryWeight ? `${selectedSessionPatient.dryWeight} kg` : 'N/D'}</strong>
                    </span>
                  </div>

                  {/* SEÇÃO 1: PRÉ-DIÁLISE */}
                  <div style={styles.sectionCard}>
                    <h4 style={styles.sectionTitle}>1. Pré-Diálise</h4>
                    <div style={styles.grid4}>
                      <div className="form-group">
                        <label>Peso Inicial (kg) *</label>
                        <input 
                          type="number" step="0.1" className="form-control" 
                          value={preWeight} onChange={e => setPreWeight(e.target.value)} 
                          placeholder="Ex: 72.5" required 
                        />
                      </div>
                      <div className="form-group">
                        <label>PA Inicial (mmHg) *</label>
                        <input 
                          type="text" className="form-control" 
                          value={preBp} onChange={e => setPreBp(e.target.value)} 
                          placeholder="130/80" required 
                        />
                      </div>
                      <div className="form-group">
                        <label>Pulso (bpm)</label>
                        <input 
                          type="text" className="form-control" 
                          value={preHr} onChange={e => setPreHr(e.target.value)} 
                          placeholder="76" 
                        />
                      </div>
                      <div className="form-group">
                        <label>Temperatura (°C)</label>
                        <input 
                          type="text" className="form-control" 
                          value={preTemp} onChange={e => setPreTemp(e.target.value)} 
                          placeholder="36.2" 
                        />
                      </div>
                    </div>
                    <div style={{ marginTop: '0.5rem' }}>
                      <label>Acesso</label>
                      <input 
                        type="text" className="form-control" 
                        value={accessEvaluation} onChange={e => setAccessEvaluation(e.target.value)} 
                        placeholder="Ex: FAV com excelente frêmito e sopro, sem sinais flogísticos" 
                      />
                    </div>
                  </div>

                  {/* SEÇÃO 2: MONITORIZAÇÃO HORÁRIA */}
                  <div style={styles.sectionCard}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <h4 style={styles.sectionTitle}>2. Horário</h4>
                      <button type="button" onClick={handleAddHourRow} className="btn btn-sm btn-outline" style={{ fontSize: '0.75rem' }}>
                        <Plus size={13} /> Adicionar Hora
                      </button>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                      <table style={styles.hourlyTable}>
                        <thead>
                          <tr>
                            <th>Hora</th>
                            <th>PA</th>
                            <th>FC</th>
                            <th>PV</th>
                            <th>PA art</th>
                            <th>Qb</th>
                            <th>Taxa UF</th>
                            <th>Heparina</th>
                            <th>Anotações</th>
                            <th></th>
                          </tr>
                        </thead>
                        <tbody>
                          {hourlyRecords.map((row, idx) => (
                            <tr key={idx}>
                              <td style={{ fontWeight: '700', width: '50px' }}>{row.hour}</td>
                              <td>
                                <input type="text" className="form-control" value={row.bp} onChange={e => handleHourlyRowChange(idx, 'bp', e.target.value)} style={styles.inputMini} />
                              </td>
                              <td>
                                <input type="text" className="form-control" value={row.hr} onChange={e => handleHourlyRowChange(idx, 'hr', e.target.value)} style={styles.inputMini} />
                              </td>
                              <td>
                                <input type="text" className="form-control" value={row.venousPressure} onChange={e => handleHourlyRowChange(idx, 'venousPressure', e.target.value)} style={styles.inputMini} />
                              </td>
                              <td>
                                <input type="text" className="form-control" value={row.arterialPressure} onChange={e => handleHourlyRowChange(idx, 'arterialPressure', e.target.value)} style={styles.inputMini} />
                              </td>
                              <td>
                                <input type="text" className="form-control" value={row.bloodFlowReal} onChange={e => handleHourlyRowChange(idx, 'bloodFlowReal', e.target.value)} style={styles.inputMini} />
                              </td>
                              <td>
                                <input type="text" className="form-control" value={row.ufRate} onChange={e => handleHourlyRowChange(idx, 'ufRate', e.target.value)} style={styles.inputMini} />
                              </td>
                              <td>
                                <input type="text" className="form-control" value={row.heparin} onChange={e => handleHourlyRowChange(idx, 'heparin', e.target.value)} style={styles.inputMini} />
                              </td>
                              <td>
                                <input type="text" className="form-control" value={row.notes} onChange={e => handleHourlyRowChange(idx, 'notes', e.target.value)} placeholder="Obs..." style={{ fontSize: '0.75rem', padding: '0.2rem' }} />
                              </td>
                              <td>
                                {hourlyRecords.length > 1 && (
                                  <button type="button" onClick={() => handleRemoveHourRow(idx)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                                    <Trash2 size={13} />
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* SEÇÃO 3: INTERCORRÊNCIAS */}
                  <div style={styles.sectionCard}>
                    <h4 style={styles.sectionTitle}>3. Intercorrências (1 Toque)</h4>
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.4rem' }}>
                      {['Hipotensão', 'Cãibras', 'Coagulação', 'Febre', 'Cefaleia', 'Náuseas', 'Sangramento', 'Precordialgia'].map(comp => {
                        const isSelected = complications.includes(comp);
                        return (
                          <button
                            key={comp}
                            type="button"
                            onClick={() => toggleComplication(comp)}
                            style={{
                              fontSize: '0.75rem',
                              fontWeight: '600',
                              padding: '0.35rem 0.65rem',
                              borderRadius: '6px',
                              border: isSelected ? '1px solid #ef4444' : '1px solid #cbd5e1',
                              backgroundColor: isSelected ? '#fee2e2' : '#ffffff',
                              color: isSelected ? '#b91c1c' : '#475569',
                              cursor: 'pointer'
                            }}
                          >
                            {isSelected ? '⚠️ ' : ''}{comp}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* SEÇÃO 4: PÓS-DIÁLISE */}
                  <div style={styles.sectionCard}>
                    <h4 style={styles.sectionTitle}>4. Pós-Diálise</h4>
                    <div style={styles.grid4}>
                      <div className="form-group">
                        <label>Peso Final (kg)</label>
                        <input 
                          type="number" step="0.1" className="form-control" 
                          value={finalWeight} onChange={e => setFinalWeight(e.target.value)} 
                          placeholder="Ex: 70.0" 
                        />
                      </div>
                      <div className="form-group">
                        <label>PA Final (mmHg)</label>
                        <input 
                          type="text" className="form-control" 
                          value={finalBp} onChange={e => setFinalBp(e.target.value)} 
                          placeholder="120/80" 
                        />
                      </div>
                      <div className="form-group">
                        <label>Hemostasia</label>
                        <input 
                          type="text" className="form-control" 
                          value={hemostasisTime} onChange={e => setHemostasisTime(e.target.value)} 
                          placeholder="15 min" 
                        />
                      </div>
                      <div className="form-group">
                        <label>Curativo</label>
                        <input 
                          type="text" className="form-control" 
                          value={dressingCondition} onChange={e => setDressingCondition(e.target.value)} 
                          placeholder="Limpo e seco" 
                        />
                      </div>
                    </div>

                    {preWeight && finalWeight && (
                      <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#0f766e', fontWeight: '700' }}>
                        💧 Perda Hídrica Efetiva: {(parseFloat(preWeight) - parseFloat(finalWeight)).toFixed(2)} kg
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            <div style={styles.modalFooter}>
              <button type="button" onClick={() => setShowSessionModal(false)} className="btn btn-secondary">Cancelar</button>
              <button type="button" onClick={handleSaveSession} disabled={actionLoading || !selectedSessionPatient} className="btn btn-primary" style={{ backgroundColor: '#0d9488', border: 'none', fontWeight: '700' }}>
                {actionLoading ? 'Gravando...' : 'Salvar Sessão de Diálise'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: NOVA REQUISIÇÃO DE INSUMOS                                         */}
      {/* ========================================================================= */}
      {showReqModal && (
        <div style={styles.modalOverlay}>
          <div style={{ ...styles.modalCard, maxWidth: '750px' }}>
            <div style={styles.modalHeader}>
              <div>
                <h3 style={{ margin: 0, fontWeight: '800' }}>Nova Requisição de Insumos</h3>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Solicitação de kits e medicamentos para o salão de diálise.</span>
              </div>
              <button onClick={() => setShowReqModal(false)} style={styles.modalCloseBtn}><X size={20} /></button>
            </div>

            <form onSubmit={handleSaveRequisition} style={styles.modalBody}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group">
                  <label>Salão / Destino *</label>
                  <select className="form-control" value={reqSalonLocation} onChange={e => setReqSalonLocation(e.target.value)} required>
                    <option value="Salão 01">Salão 01</option>
                    <option value="Salão 02">Salão 02</option>
                    <option value="Salão 03">Salão 03</option>
                    <option value="Posto de Enfermagem">Posto de Enfermagem</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Vincular a Paciente</label>
                  <select 
                    className="form-control"
                    value={reqIsGeneralUse ? 'general' : reqPatientId}
                    onChange={e => {
                      if (e.target.value === 'general') {
                        setReqIsGeneralUse(true);
                        setReqPatientId('');
                        setReqPatientName('');
                      } else {
                        setReqIsGeneralUse(false);
                        setReqPatientId(e.target.value);
                        const pat = patients.find(p => p.id === e.target.value);
                        setReqPatientName(pat?.name || '');
                      }
                    }}
                  >
                    <option value="general">📦 Uso Geral do Salão</option>
                    {currentPatients.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.room || 'Salão'} - Cadeira #{p.chairNumber || '--'})</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Kit Rápido Strip */}
              <div style={{ backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#475569' }}>Kits Pré-definidos:</span>
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.4rem' }}>
                  {productKits.map(kit => (
                    <button
                      key={kit.id}
                      type="button"
                      onClick={() => handleApplyKitToReq(kit.id)}
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        backgroundColor: reqSelectedKitId === kit.id ? '#14b8a6' : '#ffffff',
                        color: reqSelectedKitId === kit.id ? '#ffffff' : '#0f766e',
                        border: '1px solid #99f6e4',
                        borderRadius: '6px',
                        padding: '0.25rem 0.6rem',
                        cursor: 'pointer'
                      }}
                    >
                      📦 {kit.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Adicionar Insumos Avulsos */}
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end', marginBottom: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label>Pesquisar Insumo no Estoque</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Digite o nome do material ou medicamento..."
                    value={itemSearchText}
                    onChange={e => {
                      setItemSearchText(e.target.value);
                      setIsProductDropdownOpen(true);
                    }}
                  />
                  {isProductDropdownOpen && itemSearchText && (
                    <div style={styles.dropdown}>
                      {filteredStockItems.slice(0, 8).map(item => (
                        <div 
                          key={item.id}
                          onClick={() => {
                            setSelectedItemId(item.id);
                            setItemSearchText(item.name);
                            setIsProductDropdownOpen(false);
                          }}
                          style={styles.dropdownItem}
                        >
                          <strong>{item.name}</strong> • Saldo: {item.currentStock || 0} {item.unit}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div style={{ width: '80px' }}>
                  <label>Qtd</label>
                  <input type="number" min="1" className="form-control" value={requestedQty} onChange={e => setRequestedQty(e.target.value)} />
                </div>
                <button type="button" onClick={handleAddItemToReq} className="btn btn-primary" style={{ backgroundColor: '#14b8a6', border: 'none' }}>
                  Adicionar
                </button>
              </div>

              {itemStockAlert && <div style={{ color: '#ef4444', fontSize: '0.8rem', marginBottom: '0.5rem' }}>{itemStockAlert}</div>}

              {/* Lista de Itens na Requisição */}
              <div style={styles.sectionCard}>
                <h4 style={styles.sectionTitle}>Itens na Requisição ({reqItemsList.length})</h4>
                {reqItemsList.length === 0 ? (
                  <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Nenhum item adicionado ainda.</p>
                ) : (
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th>Material</th>
                        <th>Qtd</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {reqItemsList.map((it, idx) => (
                        <tr key={idx}>
                          <td>{it.name}</td>
                          <td style={{ fontWeight: '700' }}>{it.quantity} {it.unit}</td>
                          <td style={{ textAlign: 'right' }}>
                            <button type="button" onClick={() => setReqItemsList(reqItemsList.filter((_, i) => i !== idx))} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              <div style={styles.modalFooter}>
                <button type="button" onClick={() => setShowReqModal(false)} className="btn btn-secondary">Cancelar</button>
                <button type="submit" disabled={actionLoading} className="btn btn-primary" style={{ backgroundColor: '#14b8a6', border: 'none' }}>
                  {actionLoading ? 'Enviando...' : 'Transmitir Requisição'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: NOVO CHAMADO DE MÁQUINA DE HEMODIÁLISE                             */}
      {/* ========================================================================= */}
      {showTicketModal && (
        <div style={styles.modalOverlay}>
          <div style={{ ...styles.modalCard, maxWidth: '600px' }}>
            <div style={styles.modalHeader}>
              <div>
                <h3 style={{ margin: 0, fontWeight: '800' }}>Abrir Chamado Técnico de Máquina</h3>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Comunique falhas de equipamentos diretamente à Engenharia Clínica.</span>
              </div>
              <button onClick={() => setShowTicketModal(false)} style={styles.modalCloseBtn}><X size={20} /></button>
            </div>

            <form onSubmit={handleSaveTicket} style={styles.modalBody}>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label>Máquina / Equipamento *</label>
                <select 
                  className="form-control" 
                  value={ticketForm.equipmentId} 
                  onChange={e => setTicketForm({ ...ticketForm, equipmentId: e.target.value })}
                  required
                >
                  {dialysisEquipments.map(eq => (
                    <option key={eq.id} value={eq.id}>
                      {eq.name} ({eq.code || 'SN: ' + eq.serialNumber}) — {eq.sector || 'Salão'}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group">
                  <label>Salão / Localização *</label>
                  <select 
                    className="form-control" 
                    value={ticketForm.sector} 
                    onChange={e => setTicketForm({ ...ticketForm, sector: e.target.value })}
                  >
                    <option value="Salão 01">Salão 01</option>
                    <option value="Salão 02">Salão 02</option>
                    <option value="Salão 03">Salão 03</option>
                    <option value="Reúso de Dialisadores">Reúso de Dialisadores</option>
                    <option value="Tratamento de Água (Osmose)">Tratamento de Água (Osmose)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Urgência / Prioridade *</label>
                  <select 
                    className="form-control" 
                    value={ticketForm.priority} 
                    onChange={e => setTicketForm({ ...ticketForm, priority: e.target.value })}
                  >
                    <option value="Baixa">Baixa (Pode aguardar)</option>
                    <option value="Média">Média (Próximo turno)</option>
                    <option value="Alta">Alta (Máquina parada)</option>
                    <option value="Urgente">Urgente (Em sessão)</option>
                  </select>
                </div>
              </div>

              {/* Sugestões Rápidas de Defeito */}
              <div style={{ backgroundColor: '#f8fafc', padding: '0.65rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#475569' }}>Defeitos Comuns:</span>
                <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginTop: '0.35rem' }}>
                  {[
                    'Alarme de condutividade', 
                    'Vazamento de diassat', 
                    'Pressão transmembrana (TMP) alta', 
                    'Sensor óptico / detector de bolha disparando', 
                    'Braço da poltrona quebrado / travado',
                    'Bomba de sangue travando'
                  ].map(def => (
                    <button
                      key={def}
                      type="button"
                      onClick={() => setTicketForm({ ...ticketForm, description: def })}
                      style={{
                        fontSize: '0.72rem',
                        padding: '0.2rem 0.5rem',
                        backgroundColor: '#fff',
                        border: '1px solid #cbd5e1',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        color: '#0891b2'
                      }}
                    >
                      {def}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label>Descrição do Problema *</label>
                <textarea 
                  className="form-control" 
                  rows="3" 
                  placeholder="Relate o alarme apresentado, mensagens no display ou ruído..."
                  value={ticketForm.description}
                  onChange={e => setTicketForm({ ...ticketForm, description: e.target.value })}
                  required
                />
              </div>

              <div style={styles.modalFooter}>
                <button type="button" onClick={() => setShowTicketModal(false)} className="btn btn-secondary">Cancelar</button>
                <button type="submit" disabled={actionLoading} className="btn btn-primary" style={{ backgroundColor: '#0891b2', border: 'none' }}>
                  {actionLoading ? 'Abrindo Chamado...' : 'Transmitir para Manutenção'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: DETALHES DA REQUISIÇÃO                                            */}
      {/* ========================================================================= */}
      {showReqDetailModal && selectedReqDetail && (
        <div style={styles.modalOverlay}>
          <div style={{ ...styles.modalCard, maxWidth: '600px' }}>
            <div style={styles.modalHeader}>
              <div>
                <h3 style={{ margin: 0, fontWeight: '800' }}>Detalhes da Requisição #{selectedReqDetail.id?.substring(0, 8)}</h3>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{selectedReqDetail.patientName} • {selectedReqDetail.salonLocation}</span>
              </div>
              <button onClick={() => setShowReqDetailModal(false)} style={styles.modalCloseBtn}><X size={20} /></button>
            </div>

            <div style={styles.modalBody}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem', fontSize: '0.85rem' }}>
                <div><strong>Status:</strong> {selectedReqDetail.status}</div>
                <div><strong>Solicitante:</strong> {selectedReqDetail.requesterName}</div>
                <div><strong>Data:</strong> {new Date(selectedReqDetail.createdAt || Date.now()).toLocaleString('pt-BR')}</div>
                <div><strong>Destino:</strong> {selectedReqDetail.salonLocation}</div>
              </div>

              <h4 style={styles.sectionTitle}>Insumos Solicitados</h4>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Quantidade</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedReqDetail.items?.map((it, i) => (
                    <tr key={i}>
                      <td>{it.name}</td>
                      <td style={{ fontWeight: '700' }}>{it.quantity} {it.unit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={styles.modalFooter}>
              <button type="button" onClick={() => setShowReqDetailModal(false)} className="btn btn-secondary">Fechar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Estilos CSS-in-JS fiéis aos padrões de excelência estética do NexaCLINIC
const styles = {
  container: {
    padding: '1.5rem',
    maxWidth: '1600px',
    margin: '0 auto'
  },
  cardHeader: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '1.25rem 1.5rem',
    marginBottom: '1.25rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    border: '1px solid #e2e8f0'
  },
  heroIconBox: {
    width: '48px',
    height: '48px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 10px rgba(20, 184, 166, 0.3)'
  },
  title: {
    margin: 0,
    fontSize: '1.35rem',
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: '-0.02em'
  },
  subtitle: {
    margin: '0.2rem 0 0 0',
    fontSize: '0.85rem',
    color: '#64748b'
  },
  tabsWrapper: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '1.25rem',
    overflowX: 'auto',
    paddingBottom: '0.25rem'
  },
  tabBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.65rem 1.25rem',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    backgroundColor: '#ffffff',
    color: '#475569',
    fontSize: '0.875rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.15s ease'
  },
  tabBtnActive: {
    backgroundColor: '#14b8a6',
    color: '#ffffff',
    borderColor: '#14b8a6',
    boxShadow: '0 2px 6px rgba(20, 184, 166, 0.3)'
  },
  tabBadge: {
    fontSize: '0.75rem',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    padding: '0.1rem 0.4rem',
    borderRadius: '10px',
    fontWeight: '700'
  },
  contentCard: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '1.25rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    border: '1px solid #e2e8f0'
  },
  controlsBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '0.75rem',
    marginBottom: '1.25rem'
  },
  searchWrapper: {
    position: 'relative',
    flex: '1 1 280px',
    maxWidth: '450px'
  },
  searchIcon: {
    position: 'absolute',
    left: '0.75rem',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#94a3b8'
  },
  searchInput: {
    width: '100%',
    padding: '0.55rem 0.75rem 0.55rem 2.2rem',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    fontSize: '0.875rem'
  },
  tableResponsive: {
    overflowX: 'auto'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.875rem'
  },
  chairBadge: {
    fontWeight: '800',
    color: '#0f766e',
    backgroundColor: '#f0fdfa',
    padding: '0.2rem 0.5rem',
    borderRadius: '6px',
    border: '1px solid #ccfbf1'
  },
  statusBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.3rem',
    padding: '0.2rem 0.55rem',
    borderRadius: '12px',
    fontSize: '0.75rem',
    fontWeight: '700'
  },
  alert: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    marginBottom: '1rem',
    fontSize: '0.875rem'
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    backdropFilter: 'blur(3px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: '1rem'
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    width: '100%',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
    overflow: 'hidden'
  },
  modalHeader: {
    padding: '1rem 1.5rem',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  modalCloseBtn: {
    background: 'none',
    border: 'none',
    color: '#94a3b8',
    cursor: 'pointer'
  },
  modalBody: {
    padding: '1.25rem 1.5rem',
    overflowY: 'auto',
    flex: 1
  },
  modalFooter: {
    padding: '1rem 1.5rem',
    borderTop: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.75rem',
    backgroundColor: '#f8fafc'
  },
  prescInfoBox: {
    backgroundColor: '#f0fdfa',
    border: '1px solid #ccfbf1',
    borderRadius: '8px',
    padding: '0.75rem 1rem',
    marginBottom: '1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    flexWrap: 'wrap'
  },
  sectionCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '1rem',
    marginBottom: '1rem'
  },
  sectionTitle: {
    margin: '0 0 0.75rem 0',
    fontSize: '0.9rem',
    fontWeight: '800',
    color: '#1e293b'
  },
  grid4: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: '0.75rem'
  },
  hourlyTable: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.75rem'
  },
  inputMini: {
    padding: '0.25rem 0.4rem',
    fontSize: '0.75rem',
    textAlign: 'center'
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
    zIndex: 10,
    maxHeight: '200px',
    overflowY: 'auto'
  },
  dropdownItem: {
    padding: '0.5rem 0.75rem',
    fontSize: '0.8rem',
    cursor: 'pointer',
    borderBottom: '1px solid #f1f5f9'
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
    maxHeight: '220px',
    overflowY: 'auto',
    zIndex: 1000,
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
  },
  patientDropdownItem: {
    padding: '0.55rem 0.75rem',
    borderBottom: '1px solid #f3f4f6',
    cursor: 'pointer',
    transition: 'background-color 0.15s ease'
  },
  selectedPatientBadge: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ecfdf5',
    border: '1px solid #a7f3d0',
    padding: '0.45rem 0.75rem',
    borderRadius: '6px',
    fontSize: '0.85rem',
    color: '#065f46',
    marginTop: '0.45rem'
  },
  removeLinkBtn: {
    background: 'none',
    border: 'none',
    color: '#dc2626',
    fontSize: '0.75rem',
    fontWeight: '600',
    cursor: 'pointer'
  }
};
