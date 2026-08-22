import React, { useState, useEffect, useMemo } from 'react';
import { dbService } from '../firebase';
import { 
  ClipboardList, Plus, Search, Filter, X, CheckCircle2, 
  AlertTriangle, Clock, Trash2, Edit, AlertCircle, User, Package, 
  Eye, RefreshCw, AlignJustify, Table, LayoutGrid, Layers, MapPin, Send, Repeat
} from 'lucide-react';

export default function TechnicianPanel({ currentUser }) {
  const [requisitions, setRequisitions] = useState([]);
  const [patients, setPatients] = useState([]);
  const [stockItems, setStockItems] = useState([]);
  const [productKits, setProductKits] = useState([]);
  const [tenantSettings, setTenantSettings] = useState({ blockRequisitionZeroStock: false });
  
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Visual View Mode: 'compact' (Padrão) | 'normal' | 'cards'
  const [viewMode, setViewMode] = useState('compact');

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [salonFilter, setSalonFilter] = useState('all');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingReq, setEditingReq] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedReqDetail, setSelectedReqDetail] = useState(null);

  // Form State
  const [patientId, setPatientId] = useState('');
  const [patientName, setPatientName] = useState('');
  const [salonLocation, setSalonLocation] = useState('');
  const [hasKit, setHasKit] = useState(false);
  const [selectedKitId, setSelectedKitId] = useState('');
  const [isGeneralUse, setIsGeneralUse] = useState(true);
  const [notes, setNotes] = useState('');

  // Items drafting in form
  const [selectedItemId, setSelectedItemId] = useState('');
  const [itemSearchText, setItemSearchText] = useState('');
  const [isProductDropdownOpen, setIsProductDropdownOpen] = useState(false);
  const [requestedQty, setRequestedQty] = useState('1');
  const [reqItemsList, setReqItemsList] = useState([]);
  const [itemStockAlert, setItemStockAlert] = useState('');

  // Sorted items and patients A-Z
  const sortedStockItems = useMemo(() => {
    return [...stockItems].sort((a, b) => (a.name || '').localeCompare(b.name || '', 'pt-BR'));
  }, [stockItems]);

  const sortedPatients = useMemo(() => {
    return [...patients].sort((a, b) => (a.name || '').localeCompare(b.name || '', 'pt-BR'));
  }, [patients]);

  const filteredStockItems = useMemo(() => {
    if (!itemSearchText.trim()) return sortedStockItems;
    const term = itemSearchText.toLowerCase();
    return sortedStockItems.filter(item => 
      (item.name || '').toLowerCase().includes(term) ||
      (item.code || '').toLowerCase().includes(term) ||
      (item.category || '').toLowerCase().includes(term) ||
      (item.barcode || '').toLowerCase().includes(term)
    );
  }, [sortedStockItems, itemSearchText]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('#product-search-container')) {
        setIsProductDropdownOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [reqList, patList, itemList, settings, kitList] = await Promise.all([
        dbService.getMaterialRequisitions ? dbService.getMaterialRequisitions() : [],
        dbService.getPatients ? dbService.getPatients() : [],
        dbService.getInventoryItems ? dbService.getInventoryItems() : [],
        dbService.getTenantSettings ? dbService.getTenantSettings() : {},
        dbService.getProductKits ? dbService.getProductKits() : []
      ]);

      setRequisitions(reqList || []);
      setPatients(patList || []);
      setStockItems(itemList || []);
      setTenantSettings(settings || {});
      setProductKits(kitList || []);
    } catch (err) {
      console.error('Erro ao carregar dados de requisições:', err);
      showAlert('Erro ao carregar dados do sistema.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 5000);
  };

  const logAudit = async (action, details) => {
    try {
      const operatorName = currentUser?.name || currentUser?.email || 'Técnica de Enfermagem';
      await dbService.createAuditLog({
        operator: operatorName,
        action,
        details
      });
    } catch (e) {
      console.error('Erro ao registrar log de auditoria:', e);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingReq(null);
    setPatientId('');
    setPatientName('');
    setSalonLocation('');
    setHasKit(false);
    setSelectedKitId('');
    setIsGeneralUse(true);
    setNotes('');
    setReqItemsList([]);
    setSelectedItemId('');
    setItemSearchText('');
    setIsProductDropdownOpen(false);
    setRequestedQty('1');
    setItemStockAlert('');
    setShowModal(true);
  };

  const handleOpenEditModal = (req) => {
    if (req.status !== 'Pendente') {
      showAlert('Apenas requisições com status "Pendente" podem ser editadas.', 'danger');
      return;
    }
    setEditingReq(req);
    setIsGeneralUse(!req.patientId);
    setPatientId(req.patientId || '');
    setPatientName(req.patientName || '');
    setSalonLocation(req.salonLocation || '');
    setHasKit(!!req.hasKit);
    setSelectedKitId(req.kitId || '');
    setNotes(req.notes || '');
    setReqItemsList(req.items ? [...req.items] : []);
    setSelectedItemId('');
    setItemSearchText('');
    setIsProductDropdownOpen(false);
    setRequestedQty('1');
    setItemStockAlert('');
    setShowModal(true);
  };

  const handlePatientSelect = (e) => {
    const pId = e.target.value;
    setPatientId(pId);
    if (!pId) {
      setIsGeneralUse(true);
      setPatientName('');
    } else {
      setIsGeneralUse(false);
      const found = patients.find(p => p.id === pId);
      setPatientName(found ? found.name : '');
    }
  };

  const handleApplyKit = (kitId) => {
    if (!kitId) return;
    const kit = productKits.find(k => k.id === kitId);
    if (!kit) return;
    
    setSelectedKitId(kit.id);
    setHasKit(true);
    if (kit.suggestedLocation && !salonLocation) {
      setSalonLocation(kit.suggestedLocation);
    }

    const newItems = [...reqItemsList];
    (kit.items || []).forEach(kitItem => {
      const existingIdx = newItems.findIndex(i => i.itemId === kitItem.itemId);
      const qty = parseFloat(kitItem.quantity) || 1;
      const itemObj = stockItems.find(i => i.id === kitItem.itemId);
      const isControlled = itemObj?.isControlled || kitItem.isControlled;

      if (existingIdx > -1) {
        newItems[existingIdx].requestedQuantity += qty;
        if (isControlled) newItems[existingIdx].isControlled = true;
      } else {
        newItems.push({
          itemId: kitItem.itemId,
          itemName: kitItem.itemName || itemObj?.name || 'Insumo',
          unit: kitItem.unit || itemObj?.unit || 'unidades',
          requestedQuantity: qty,
          deliveredQuantity: 0,
          isControlled: !!isControlled
        });
      }
    });

    setReqItemsList(newItems);
    showAlert(`Kit "${kit.name}" adicionado à requisição (${(kit.items || []).length} itens)!`, 'success');
  };

  const handleAddItemToReq = () => {
    if (!selectedItemId) {
      showAlert('Selecione um insumo.', 'warning');
      return;
    }
    const qtyNum = parseInt(requestedQty, 10);
    if (isNaN(qtyNum) || qtyNum <= 0) {
      showAlert('Informe uma quantidade válida maior que zero.', 'warning');
      return;
    }

    const itemObj = stockItems.find(i => i.id === selectedItemId);
    if (!itemObj) return;

    // Check zero stock lock if enabled in TI Settings
    const isZeroStockBlocked = !!tenantSettings.blockRequisitionZeroStock;
    if (isZeroStockBlocked) {
      const currentAvail = parseFloat(itemObj.currentStock) || 0;
      if (currentAvail <= 0) {
        setItemStockAlert(`O insumo "${itemObj.name}" está com estoque ZERADO. A trava de T.I. impede a solicitação.`);
        return;
      }
      if (qtyNum > currentAvail) {
        setItemStockAlert(`Estoque insuficiente! Saldo disponível de "${itemObj.name}": ${currentAvail} ${itemObj.unit || 'un'}.`);
        return;
      }
    }

    setItemStockAlert('');

    // Check if already in list
    const existingIndex = reqItemsList.findIndex(i => i.itemId === itemObj.id);
    if (existingIndex > -1) {
      const updatedList = [...reqItemsList];
      updatedList[existingIndex].requestedQuantity += qtyNum;
      if (itemObj.isControlled) updatedList[existingIndex].isControlled = true;
      setReqItemsList(updatedList);
    } else {
      setReqItemsList([...reqItemsList, {
        itemId: itemObj.id,
        itemName: itemObj.name,
        unit: itemObj.unit || 'unidades',
        requestedQuantity: qtyNum,
        deliveredQuantity: 0,
        isControlled: !!itemObj.isControlled
      }]);
    }

    setRequestedQty('1');
  };

  const handleRemoveItemFromReq = (index) => {
    const updated = reqItemsList.filter((_, i) => i !== index);
    setReqItemsList(updated);
  };

  const handleSubmitRequisition = async (e) => {
    e.preventDefault();
    if (reqItemsList.length === 0) {
      showAlert('Adicione pelo menos um insumo à requisição.', 'warning');
      return;
    }

    // Salão is mandatory when requisition contains a kit
    if (hasKit && !salonLocation) {
      showAlert('O campo Salão é obrigatório para requisições com Kits.', 'warning');
      return;
    }

    setActionLoading(true);
    try {
      const operatorName = currentUser?.name || currentUser?.email || 'Técnica de Enfermagem';
      const hasControlled = reqItemsList.some(i => i.isControlled || stockItems.find(it => it.id === i.itemId)?.isControlled);

      const reqPayload = {
        id: editingReq ? editingReq.id : undefined,
        requisitionCode: editingReq ? editingReq.requisitionCode : undefined,
        requestedBy: operatorName,
        userId: currentUser?.uid || 'user-tech',
        patientId: isGeneralUse ? null : patientId,
        patientName: isGeneralUse ? 'Uso Geral' : patientName,
        salonLocation: salonLocation,
        hasKit: !!hasKit,
        kitId: selectedKitId || null,
        hasControlledMedicine: hasControlled,
        status: editingReq ? editingReq.status : 'Pendente',
        notes: notes,
        items: reqItemsList,
        createdAt: editingReq ? editingReq.createdAt : new Date().toISOString()
      };

      const savedReq = await dbService.saveMaterialRequisition(reqPayload);

      if (editingReq) {
        logAudit('Requisição Editada', `Requisição ${savedReq.requisitionCode} alterada pela técnica ${operatorName}. Total de itens: ${reqItemsList.length}`);
        showAlert(`Requisição ${savedReq.requisitionCode} atualizada com sucesso!`, 'success');
      } else {
        logAudit('Requisição Criada', `Requisição ${savedReq.requisitionCode} criada por ${operatorName} para ${reqPayload.patientName}. Total de itens: ${reqItemsList.length}`);
        showAlert(`Requisição ${savedReq.requisitionCode} enviada com sucesso!`, 'success');
      }

      setShowModal(false);
      fetchData();
    } catch (err) {
      console.error(err);
      showAlert('Erro ao salvar requisição.', 'danger');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteRequisition = async (req) => {
    if (req.status !== 'Pendente') {
      showAlert('Apenas requisições com status "Pendente" podem ser excluídas.', 'danger');
      return;
    }

    if (!window.confirm(`Deseja realmente cancelar/excluir a requisição ${req.requisitionCode}?`)) {
      return;
    }

    setActionLoading(true);
    try {
      await dbService.deleteMaterialRequisition(req.id);
      const operatorName = currentUser?.name || currentUser?.email || 'Técnica de Enfermagem';
      logAudit('Requisição Excluída', `Requisição ${req.requisitionCode} excluída pela técnica ${operatorName}.`);
      showAlert(`Requisição ${req.requisitionCode} excluída com sucesso!`, 'success');
      fetchData();
    } catch (err) {
      console.error(err);
      showAlert('Erro ao excluir requisição.', 'danger');
    } finally {
      setActionLoading(false);
    }
  };

  // Stats calculation
  const totalCount = requisitions.length;
  const pendingCount = requisitions.filter(r => r.status === 'Pendente').length;
  const partialCount = requisitions.filter(r => r.status === 'Parcial').length;
  const deliveredCount = requisitions.filter(r => r.status === 'Entregue').length;
  const expiredCount = requisitions.filter(r => r.status === 'Expirada').length;

  const getTimeRemaining = (createdAt) => {
    if (!createdAt) return null;
    const ttlHours = parseFloat(tenantSettings.requisitionTTLHours) || 1;
    const ttlMs = ttlHours * 60 * 60 * 1000;
    const createdMs = new Date(createdAt).getTime();
    if (isNaN(createdMs)) return null;
    const diff = (createdMs + ttlMs) - Date.now();
    if (diff <= 0) return { expired: true, text: 'Expirada' };
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return { expired: false, text: `${mins}m restantes`, urgent: mins <= 15 };
    const hrs = Math.floor(mins / 60);
    const remMins = mins % 60;
    return { expired: false, text: `${hrs}h ${remMins}m`, urgent: false };
  };

  const handleReRequestExpired = async (req) => {
    if (!window.confirm(`Deseja reenviar a requisição ${req.requisitionCode} para o salão ${req.salonLocation || ''}?`)) return;
    setActionLoading(true);
    try {
      const operatorName = currentUser?.name || currentUser?.email || 'Técnica de Enfermagem';
      const newReqPayload = {
        requestedBy: operatorName,
        userId: currentUser?.uid || 'user-tech',
        patientId: req.patientId || null,
        patientName: req.patientName || 'Uso Geral',
        salonLocation: req.salonLocation || '',
        hasKit: !!req.hasKit,
        kitId: req.kitId || null,
        hasControlledMedicine: req.hasControlledMedicine,
        status: 'Pendente',
        notes: req.notes ? `[Renovação de ${req.requisitionCode}] ${req.notes}` : `Renovação de ${req.requisitionCode}`,
        items: (req.items || []).map(i => ({ ...i, deliveredQuantity: 0 })),
        createdAt: new Date().toISOString()
      };
      const saved = await dbService.saveMaterialRequisition(newReqPayload);
      showAlert(`Nova requisição ${saved.requisitionCode} criada com sucesso!`, 'success');
      logAudit('Requisição Renovada', `Requisição ${saved.requisitionCode} recriada após expiração de ${req.requisitionCode}.`);
      fetchData();
    } catch (e) {
      console.error(e);
      showAlert('Erro ao renovar requisição.', 'danger');
    } finally {
      setActionLoading(false);
    }
  };

  // Filtered List
  const filteredRequisitions = useMemo(() => {
    return requisitions.filter(r => {
      const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
      const matchesSalon = salonFilter === 'all' || r.salonLocation === salonFilter;
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        !searchTerm ||
        (r.requisitionCode && r.requisitionCode.toLowerCase().includes(searchLower)) ||
        (r.patientName && r.patientName.toLowerCase().includes(searchLower)) ||
        (r.requestedBy && r.requestedBy.toLowerCase().includes(searchLower)) ||
        (r.salonLocation && r.salonLocation.toLowerCase().includes(searchLower)) ||
        (r.items && r.items.some(i => i.itemName && i.itemName.toLowerCase().includes(searchLower)));
      
      return matchesStatus && matchesSalon && matchesSearch;
    });
  }, [requisitions, statusFilter, salonFilter, searchTerm]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pendente':
        return <span style={{ ...styles.badge, backgroundColor: '#fef3c7', color: '#b45309', border: '1px solid #fde68a' }}><Clock size={12} /> Pendente</span>;
      case 'Parcial':
        return <span style={{ ...styles.badge, backgroundColor: '#ffedd5', color: '#c2410c', border: '1px solid #fed7aa' }}><AlertTriangle size={12} /> Parcial</span>;
      case 'Entregue':
        return <span style={{ ...styles.badge, backgroundColor: '#d1fae5', color: '#047857', border: '1px solid #a7f3d0' }}><CheckCircle2 size={12} /> Entregue</span>;
      case 'Expirada':
        return <span style={{ ...styles.badge, backgroundColor: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5' }}><Clock size={12} /> Expirada (TTL)</span>;
      case 'Cancelado':
        return <span style={{ ...styles.badge, backgroundColor: '#f3f4f6', color: '#4b5563', border: '1px solid #e5e7eb' }}><X size={12} /> Cancelado</span>;
      default:
        return <span style={styles.badge}>{status}</span>;
    }
  };

  return (
    <div style={styles.container}>
      {/* Header / Hero Section (Padrão Nexa) */}
      <div style={styles.heroSection}>
        <div style={styles.heroLeft}>
          <div style={styles.heroIconBadge}>
            <ClipboardList size={28} color="#fff" />
          </div>
          <div>
            <h1 style={styles.heroTitle}>NexaREQ — Requisições de Insumos</h1>
            <p style={styles.heroSubtitle}>
              Solicitações ágeis de materiais e medicamentos para salões de hemodiálise, kits padronizados e dispensação central.
            </p>
          </div>
        </div>

        <div style={styles.heroActions}>
          <button 
            style={styles.secondaryHeroBtn} 
            onClick={fetchData} 
            title="Atualizar registros"
          >
            <RefreshCw size={16} className={loading ? 'spin' : ''} />
            <span>Atualizar</span>
          </button>
          <button 
            style={styles.primaryHeroBtn} 
            onClick={handleOpenCreateModal}
          >
            <Plus size={18} />
            <span>Nova Requisição</span>
          </button>
        </div>
      </div>

      {/* Message feedback */}
      {message.text && (
        <div style={{
          ...styles.alert,
          backgroundColor: message.type === 'danger' ? '#fee2e2' : message.type === 'warning' ? '#fef3c7' : '#d1fae5',
          color: message.type === 'danger' ? '#991b1b' : message.type === 'warning' ? '#92400e' : '#065f46',
          borderLeft: `4px solid ${message.type === 'danger' ? '#ef4444' : message.type === 'warning' ? '#f59e0b' : '#10b981'}`
        }}>
          <AlertCircle size={18} />
          <span>{message.text}</span>
        </div>
      )}

      {/* Stats KPI Grid */}
      <div style={styles.kpiGrid}>
        <div style={{ ...styles.kpiCard, borderTop: '4px solid #64748b' }}>
          <div style={styles.kpiHeader}>
            <span style={styles.kpiTitle}>Total</span>
            <div style={{ ...styles.kpiIconWrapper, backgroundColor: '#f1f5f9' }}>
              <Package size={18} color="#64748b" />
            </div>
          </div>
          <div style={styles.kpiValue}>{totalCount}</div>
          <div style={styles.kpiSub}>Histórico de requisições</div>
        </div>

        <div style={{ ...styles.kpiCard, borderTop: '4px solid #f59e0b' }}>
          <div style={styles.kpiHeader}>
            <span style={styles.kpiTitle}>Pendentes</span>
            <div style={{ ...styles.kpiIconWrapper, backgroundColor: '#fef3c7' }}>
              <Clock size={18} color="#d97706" />
            </div>
          </div>
          <div style={{ ...styles.kpiValue, color: '#d97706' }}>{pendingCount}</div>
          <div style={styles.kpiSub}>Aguardando separação</div>
        </div>

        <div style={{ ...styles.kpiCard, borderTop: '4px solid #ea580c' }}>
          <div style={styles.kpiHeader}>
            <span style={styles.kpiTitle}>Parciais</span>
            <div style={{ ...styles.kpiIconWrapper, backgroundColor: '#ffedd5' }}>
              <AlertTriangle size={18} color="#ea580c" />
            </div>
          </div>
          <div style={{ ...styles.kpiValue, color: '#ea580c' }}>{partialCount}</div>
          <div style={styles.kpiSub}>Atendidos parcialmente</div>
        </div>

        <div style={{ ...styles.kpiCard, borderTop: '4px solid #10b981' }}>
          <div style={styles.kpiHeader}>
            <span style={styles.kpiTitle}>Entregues</span>
            <div style={{ ...styles.kpiIconWrapper, backgroundColor: '#d1fae5' }}>
              <CheckCircle2 size={18} color="#059669" />
            </div>
          </div>
          <div style={{ ...styles.kpiValue, color: '#059669' }}>{deliveredCount}</div>
          <div style={styles.kpiSub}>Concluídos com sucesso</div>
        </div>

        <div style={{ ...styles.kpiCard, borderTop: '4px solid #ef4444' }}>
          <div style={styles.kpiHeader}>
            <span style={styles.kpiTitle}>Expiradas</span>
            <div style={{ ...styles.kpiIconWrapper, backgroundColor: '#fee2e2' }}>
              <Clock size={18} color="#ef4444" />
            </div>
          </div>
          <div style={{ ...styles.kpiValue, color: '#ef4444' }}>{expiredCount}</div>
          <div style={styles.kpiSub}>Reserva liberada (TTL)</div>
        </div>
      </div>

      {/* Filters & View Switcher Bar */}
      <div style={styles.filterCard}>
        <div style={styles.searchBox}>
          <Search size={18} color="#9ca3af" />
          <input 
            type="text" 
            placeholder="Buscar por código, paciente, insumo ou solicitante..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            style={styles.searchInput}
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} style={styles.btnClearSearch} title="Limpar busca">
              <X size={14} />
            </button>
          )}
        </div>

        <div style={styles.filterGroup}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Filter size={15} color="#6b7280" />
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              style={styles.selectFilter}
            >
              <option value="all">Status (Todos)</option>
              <option value="Pendente">Pendentes</option>
              <option value="Parcial">Parciais</option>
              <option value="Entregue">Entregues</option>
              <option value="Expirada">Expiradas (TTL)</option>
              <option value="Cancelado">Cancelados</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <MapPin size={15} color="#6b7280" />
            <select 
              value={salonFilter} 
              onChange={(e) => setSalonFilter(e.target.value)}
              style={styles.selectFilter}
            >
              <option value="all">Salão (Todos)</option>
              <option value="Salão 1">Salão 1</option>
              <option value="Salão 2">Salão 2</option>
              <option value="Salão 3">Salão 3</option>
              <option value="Consultório">Consultório</option>
              <option value="Outro">Outro</option>
            </select>
          </div>

          {/* View Mode Switcher */}
          <div style={styles.viewModeGroup}>
            <button
              onClick={() => setViewMode('compact')}
              style={{
                ...styles.viewModeBtn,
                ...(viewMode === 'compact' ? styles.viewModeBtnActive : {})
              }}
              title="Visualização Compacta"
            >
              <AlignJustify size={15} />
              <span style={{ fontSize: '0.75rem', fontWeight: '600' }}>Compacta</span>
            </button>
            <button
              onClick={() => setViewMode('normal')}
              style={{
                ...styles.viewModeBtn,
                ...(viewMode === 'normal' ? styles.viewModeBtnActive : {})
              }}
              title="Visualização Detalhada"
            >
              <Table size={15} />
              <span style={{ fontSize: '0.75rem', fontWeight: '600' }}>Normal</span>
            </button>
            <button
              onClick={() => setViewMode('cards')}
              style={{
                ...styles.viewModeBtn,
                ...(viewMode === 'cards' ? styles.viewModeBtnActive : {})
              }}
              title="Visualização em Cards"
            >
              <LayoutGrid size={15} />
              <span style={{ fontSize: '0.75rem', fontWeight: '600' }}>Cards</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area: Compact Table / Normal Table / Cards */}
      <div style={styles.contentWrapper}>
        {loading ? (
          <div style={styles.loadingBox}>
            <RefreshCw size={28} className="spin" color="#14b8a6" />
            <span>Carregando requisições...</span>
          </div>
        ) : filteredRequisitions.length === 0 ? (
          <div style={styles.emptyBox}>
            <div style={styles.emptyIconCircle}>
              <ClipboardList size={36} color="#14b8a6" />
            </div>
            <p style={{ fontWeight: '700', color: 'var(--text-color)', marginTop: '0.75rem', fontSize: '1rem' }}>
              Nenhuma requisição encontrada
            </p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '400px', margin: '0.25rem auto 1rem auto' }}>
              {searchTerm || statusFilter !== 'all' || salonFilter !== 'all' 
                ? 'Nenhum resultado corresponde aos filtros aplicados.' 
                : 'Clique no botão "Nova Requisição" para solicitar insumos e kits à farmácia.'}
            </p>
            <button style={styles.primaryHeroBtn} onClick={handleOpenCreateModal}>
              <Plus size={16} />
              <span>Criar Nova Requisição</span>
            </button>
          </div>
        ) : (
          <>
            {/* 1. VIEW MODE: COMPACT (PADRÃO) */}
            {viewMode === 'compact' && (
              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={{ ...styles.th, width: '100px' }}>Código</th>
                      <th style={{ ...styles.th, width: '130px' }}>Data</th>
                      <th style={styles.th}>Destino</th>
                      <th style={styles.th}>Insumos</th>
                      <th style={styles.th}>Solicitante</th>
                      <th style={{ ...styles.th, width: '110px' }}>Status</th>
                      <th style={{ ...styles.th, textAlign: 'right', width: '110px' }}>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRequisitions.map((req) => (
                      <tr key={req.id} style={styles.trCompact}>
                        <td style={{ ...styles.tdCompact, fontWeight: '700', color: '#0d9488' }}>
                          {req.requisitionCode}
                        </td>
                        <td style={styles.tdCompact}>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-color)', fontWeight: '500' }}>
                            {new Date(req.createdAt).toLocaleDateString('pt-BR')} {new Date(req.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </td>
                        <td style={styles.tdCompact}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                            <span style={{ fontWeight: '600', fontSize: '0.85rem' }}>{req.patientName || 'Uso Geral'}</span>
                            {req.salonLocation && (
                              <span style={styles.salonBadge}>
                                📍 {req.salonLocation}
                              </span>
                            )}
                          </div>
                        </td>
                        <td style={styles.tdCompact}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '0.825rem', fontWeight: '500' }}>
                              {req.items && req.items.length > 0 ? (
                                <>
                                  <strong>{req.items[0].itemName}</strong> ({req.items[0].requestedQuantity} {req.items[0].unit})
                                  {req.items.length > 1 && (
                                    <span style={{ color: 'var(--text-muted)', marginLeft: '0.25rem' }}>
                                      +{req.items.length - 1} item(ns)
                                    </span>
                                  )}
                                </>
                              ) : (
                                <span style={{ color: 'var(--text-muted)' }}>Sem insumos</span>
                              )}
                            </span>
                            {req.hasKit && (
                              <span style={styles.kitBadge}>
                                📦 Kit
                              </span>
                            )}
                            {(req.hasControlledMedicine || (req.items && req.items.some(i => i.isControlled || stockItems.find(it => it.id === i.itemId)?.isControlled))) && (
                              <span style={styles.controlledBadge}>
                                🔒 Controlado
                              </span>
                            )}
                          </div>
                        </td>
                        <td style={{ ...styles.tdCompact, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {req.requestedBy}
                        </td>
                        <td style={styles.tdCompact}>
                          <div>
                            {getStatusBadge(req.status)}
                            {(req.status === 'Pendente' || req.status === 'Parcial') && (
                              (() => {
                                const rem = getTimeRemaining(req.createdAt);
                                if (!rem || rem.expired) return null;
                                return (
                                  <div style={{ fontSize: '0.68rem', color: rem.urgent ? '#dc2626' : '#b45309', fontWeight: '700', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '2px' }}>
                                    <Clock size={10} /> {rem.text}
                                  </div>
                                );
                              })()
                            )}
                          </div>
                        </td>
                        <td style={{ ...styles.tdCompact, textAlign: 'right' }}>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.3rem' }}>
                            <button 
                              style={styles.actionBtnView} 
                              onClick={() => { setSelectedReqDetail(req); setShowDetailModal(true); }}
                              title="Visualizar Detalhes"
                            >
                              <Eye size={14} />
                            </button>

                            {req.status === 'Expirada' && (
                              <button 
                                style={{ ...styles.actionBtnEdit, backgroundColor: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca' }} 
                                onClick={() => handleReRequestExpired(req)}
                                title="Requisitar Novamente (Renovar)"
                              >
                                <Repeat size={14} />
                              </button>
                            )}
                            
                            {req.status === 'Pendente' && (
                              <>
                                <button 
                                  style={styles.actionBtnEdit} 
                                  onClick={() => handleOpenEditModal(req)}
                                  title="Editar"
                                >
                                  <Edit size={14} />
                                </button>
                                <button 
                                  style={styles.actionBtnDelete} 
                                  onClick={() => handleDeleteRequisition(req)}
                                  title="Excluir"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* 2. VIEW MODE: NORMAL (DETALHADA) */}
            {viewMode === 'normal' && (
              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Código</th>
                      <th style={styles.th}>Data</th>
                      <th style={styles.th}>Destino</th>
                      <th style={styles.th}>Insumos Solicitados</th>
                      <th style={styles.th}>Solicitante</th>
                      <th style={styles.th}>Status</th>
                      <th style={{ ...styles.th, textAlign: 'right' }}>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRequisitions.map((req) => (
                      <tr key={req.id} style={styles.tr}>
                        <td style={{ ...styles.td, fontWeight: '700', color: '#0d9488', fontSize: '0.95rem' }}>
                          {req.requisitionCode}
                        </td>
                        <td style={styles.td}>
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-color)', fontWeight: '600' }}>
                            {new Date(req.createdAt).toLocaleDateString('pt-BR')}
                          </span>
                          <br />
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {new Date(req.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </td>
                        <td style={styles.td}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                              <User size={15} color="#64748b" />
                              <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>{req.patientName || 'Uso Geral'}</span>
                            </div>
                            {req.salonLocation && (
                              <div>
                                <span style={styles.salonBadge}>
                                  📍 {req.salonLocation}
                                </span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td style={styles.td}>
                          <div style={{ fontSize: '0.85rem' }}>
                            {req.items && req.items.length > 0 ? (
                              <>
                                <div>
                                  <strong>{req.items[0].itemName}</strong> ({req.items[0].requestedQuantity} {req.items[0].unit})
                                </div>
                                {req.items.length > 1 && (
                                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                    + mais {req.items.length - 1} insumo(s)
                                  </span>
                                )}
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginTop: '0.35rem' }}>
                                  {req.hasKit && (
                                    <span style={styles.kitBadge}>
                                      📦 Kit de Insumos
                                    </span>
                                  )}
                                  {(req.hasControlledMedicine || (req.items && req.items.some(i => i.isControlled || stockItems.find(it => it.id === i.itemId)?.isControlled))) && (
                                    <span style={styles.controlledBadge}>
                                      🔒 CONTROLADO (Portaria 344)
                                    </span>
                                  )}
                                </div>
                              </>
                            ) : (
                              <span style={{ color: 'var(--text-muted)' }}>Sem insumos</span>
                            )}
                          </div>
                        </td>
                        <td style={{ ...styles.td, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                          {req.requestedBy}
                        </td>
                        <td style={styles.td}>
                          <div>
                            {getStatusBadge(req.status)}
                            {(req.status === 'Pendente' || req.status === 'Parcial') && (
                              (() => {
                                const rem = getTimeRemaining(req.createdAt);
                                if (!rem || rem.expired) return null;
                                return (
                                  <div style={{ fontSize: '0.72rem', color: rem.urgent ? '#dc2626' : '#b45309', fontWeight: '700', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                    <Clock size={11} /> {rem.text}
                                  </div>
                                );
                              })()
                            )}
                          </div>
                        </td>
                        <td style={{ ...styles.td, textAlign: 'right' }}>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.35rem' }}>
                            <button 
                              style={styles.actionBtnView} 
                              onClick={() => { setSelectedReqDetail(req); setShowDetailModal(true); }}
                              title="Visualizar Detalhes"
                            >
                              <Eye size={15} />
                            </button>

                            {req.status === 'Expirada' && (
                              <button 
                                style={{ ...styles.actionBtnEdit, backgroundColor: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca' }} 
                                onClick={() => handleReRequestExpired(req)}
                                title="Requisitar Novamente (Renovar)"
                              >
                                <Repeat size={15} />
                              </button>
                            )}
                            
                            {req.status === 'Pendente' && (
                              <>
                                <button 
                                  style={styles.actionBtnEdit} 
                                  onClick={() => handleOpenEditModal(req)}
                                  title="Editar"
                                >
                                  <Edit size={15} />
                                </button>
                                <button 
                                  style={styles.actionBtnDelete} 
                                  onClick={() => handleDeleteRequisition(req)}
                                  title="Excluir"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* 3. VIEW MODE: CARDS */}
            {viewMode === 'cards' && (
              <div style={styles.cardsGrid}>
                {filteredRequisitions.map((req) => (
                  <div key={req.id} style={styles.reqCard}>
                    <div style={styles.reqCardHeader}>
                      <div>
                        <span style={styles.reqCardCode}>{req.requisitionCode}</span>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                          {new Date(req.createdAt).toLocaleDateString('pt-BR')} às {new Date(req.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        {getStatusBadge(req.status)}
                        {(req.status === 'Pendente' || req.status === 'Parcial') && (
                          (() => {
                            const rem = getTimeRemaining(req.createdAt);
                            if (!rem || rem.expired) return null;
                            return (
                              <div style={{ fontSize: '0.7rem', color: rem.urgent ? '#dc2626' : '#b45309', fontWeight: '700', marginTop: '0.2rem' }}>
                                ⏳ {rem.text}
                              </div>
                            );
                          })()
                        )}
                      </div>
                    </div>

                    <div style={styles.reqCardBody}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
                        <User size={16} color="#0d9488" />
                        <span style={{ fontWeight: '700', fontSize: '0.95rem' }}>{req.patientName || 'Uso Geral'}</span>
                      </div>

                      {req.salonLocation && (
                        <div style={{ marginBottom: '0.6rem' }}>
                          <span style={styles.salonBadge}>
                            📍 {req.salonLocation}
                          </span>
                        </div>
                      )}

                      <div style={{ backgroundColor: '#f8fafc', padding: '0.6rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '0.6rem' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600', marginBottom: '0.3rem' }}>
                          Insumos ({(req.items || []).length}):
                        </div>
                        <div style={{ maxHeight: '70px', overflowY: 'auto', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                          {(req.items || []).map((item, idx) => (
                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span>• {item.itemName}</span>
                              <strong style={{ color: '#0d9488' }}>{item.requestedQuantity} {item.unit}</strong>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                        {req.hasKit && <span style={styles.kitBadge}>📦 Kit</span>}
                        {(req.hasControlledMedicine || (req.items && req.items.some(i => i.isControlled))) && (
                          <span style={styles.controlledBadge}>🔒 Controlado</span>
                        )}
                      </div>
                    </div>

                    <div style={styles.reqCardFooter}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Por: {req.requestedBy}
                      </span>
                      <div style={{ display: 'flex', gap: '0.3rem' }}>
                        <button 
                          style={styles.actionBtnView} 
                          onClick={() => { setSelectedReqDetail(req); setShowDetailModal(true); }}
                          title="Visualizar Detalhes"
                        >
                          <Eye size={14} />
                        </button>
                        {req.status === 'Expirada' && (
                          <button 
                            style={{ ...styles.actionBtnEdit, backgroundColor: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca' }} 
                            onClick={() => handleReRequestExpired(req)}
                            title="Requisitar Novamente (Renovar)"
                          >
                            <Repeat size={14} />
                          </button>
                        )}
                        {req.status === 'Pendente' && (
                          <>
                            <button 
                              style={styles.actionBtnEdit} 
                              onClick={() => handleOpenEditModal(req)}
                              title="Editar"
                            >
                              <Edit size={14} />
                            </button>
                            <button 
                              style={styles.actionBtnDelete} 
                              onClick={() => handleDeleteRequisition(req)}
                              title="Excluir"
                            >
                              <Trash2 size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal Nova / Editar Requisição */}
      {showModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <div style={styles.modalHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{ ...styles.kpiIconWrapper, backgroundColor: '#ccfbf1' }}>
                  <ClipboardList size={20} color="#0d9488" />
                </div>
                <div>
                  <h2 style={styles.modalTitle}>
                    {editingReq ? `Editar Requisição (${editingReq.requisitionCode})` : 'Nova Requisição'}
                  </h2>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {editingReq ? 'Atualize as informações do pedido pendente' : 'Solicitação ágil de insumos e kits para a farmácia'}
                  </span>
                </div>
              </div>
              <button style={styles.modalCloseBtn} onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitRequisition} style={styles.modalForm}>
              {/* Salão & Destino Selection */}
              <div style={styles.formGrid2}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>
                    Salão {hasKit && <span style={{ color: '#dc2626', fontWeight: '700' }}>* (Obrigatório p/ Kit)</span>}:
                  </label>
                  <select 
                    value={salonLocation} 
                    onChange={e => setSalonLocation(e.target.value)}
                    style={{ ...styles.input, borderColor: hasKit && !salonLocation ? '#ef4444' : undefined }}
                    required={hasKit}
                  >
                    <option value="">Selecione o Salão</option>
                    <option value="Salão 1">Salão 1</option>
                    <option value="Salão 2">Salão 2</option>
                    <option value="Salão 3">Salão 3</option>
                    <option value="Consultório">Consultório</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Destino:</label>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', height: '40px' }}>
                    <label style={styles.radioLabel}>
                      <input 
                        type="radio" 
                        name="destType" 
                        checked={isGeneralUse} 
                        onChange={() => { setIsGeneralUse(true); setPatientId(''); setPatientName(''); }} 
                      />
                      <span>Uso Geral</span>
                    </label>
                    <label style={styles.radioLabel}>
                      <input 
                        type="radio" 
                        name="destType" 
                        checked={!isGeneralUse} 
                        onChange={() => setIsGeneralUse(false)} 
                      />
                      <span>Paciente</span>
                    </label>
                  </div>
                </div>
              </div>

              {!isGeneralUse && (
                <div style={styles.formGroup}>
                  <label style={styles.label}>Paciente *:</label>
                  <select 
                    value={patientId} 
                    onChange={handlePatientSelect}
                    style={styles.input}
                    required={!isGeneralUse}
                  >
                    <option value="">Selecione o Paciente</option>
                    {sortedPatients.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} {p.shift ? `(${p.shift} - ${p.room || 'Salão'})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Seção Rápida de Kits de Insumos */}
              {productKits.length > 0 && (
                <div style={styles.kitSelectionCard}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                    <label style={{ fontWeight: '700', fontSize: '0.825rem', color: '#92400e', margin: 0, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Package size={16} /> Kits:
                    </label>
                    <span style={{ fontSize: '0.72rem', color: '#b45309', fontWeight: '500' }}>Adicione múltiplos insumos com 1 clique</span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                    {productKits.map(kit => (
                      <button
                        key={kit.id}
                        type="button"
                        onClick={() => handleApplyKit(kit.id)}
                        style={styles.kitPillBtn}
                        title={`Clique para incluir os ${(kit.items || []).length} insumos deste kit`}
                      >
                        + {kit.name} ({(kit.items || []).length} itens)
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Insumos Draft Area */}
              <div style={styles.itemsSection}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                  <h3 style={styles.itemsSectionTitle}>Insumos</h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Itens individuais</span>
                </div>
                
                {itemStockAlert && (
                  <div style={styles.stockAlertBox}>
                    <AlertCircle size={16} />
                    <span>{itemStockAlert}</span>
                  </div>
                )}

                <div style={styles.addItemGrid}>
                  <div style={{ flex: 1, position: 'relative' }} id="product-search-container">
                    <label style={{ ...styles.label, fontSize: '0.8rem' }}>Insumo:</label>
                    <div style={{ position: 'relative' }}>
                      <input 
                        type="text"
                        placeholder="🔍 Digite para buscar insumo..."
                        value={itemSearchText}
                        onFocus={() => setIsProductDropdownOpen(true)}
                        onChange={(e) => {
                          setItemSearchText(e.target.value);
                          setIsProductDropdownOpen(true);
                          setItemStockAlert('');
                          if (!e.target.value) setSelectedItemId('');
                        }}
                        style={{
                          ...styles.input,
                          paddingRight: '2.2rem',
                          borderColor: selectedItemId ? '#10b981' : undefined,
                          fontWeight: selectedItemId ? '600' : 'normal'
                        }}
                      />
                      {itemSearchText && (
                        <button
                          type="button"
                          onClick={() => {
                            setItemSearchText('');
                            setSelectedItemId('');
                            setIsProductDropdownOpen(true);
                          }}
                          style={styles.btnClearSearchBtn}
                          title="Limpar busca"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    {/* Live Filtered Dropdown */}
                    {isProductDropdownOpen && (
                      <div style={styles.dropdownMenu}>
                        {filteredStockItems.length === 0 ? (
                          <div style={{ padding: '0.75rem', fontSize: '0.85rem', color: '#64748b', textAlign: 'center' }}>
                            Nenhum insumo encontrado para "{itemSearchText}"
                          </div>
                        ) : (
                          filteredStockItems.slice(0, 150).map(item => {
                            const isSelected = item.id === selectedItemId;
                            return (
                              <div
                                key={item.id}
                                onClick={() => {
                                  setSelectedItemId(item.id);
                                  setItemSearchText(item.name);
                                  setIsProductDropdownOpen(false);
                                  setItemStockAlert('');
                                }}
                                style={{
                                  ...styles.dropdownItem,
                                  backgroundColor: isSelected ? '#ecfdf5' : '#ffffff',
                                }}
                                onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = '#f8fafc'; }}
                                onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = '#ffffff'; }}
                              >
                                <div>
                                  <div style={{ fontWeight: 600, color: isSelected ? '#047857' : '#1e293b', display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
                                    <span>{item.name}</span>
                                    {item.isControlled && (
                                      <span style={styles.controlledBadge}>
                                        🔒 CONTROLADO (Portaria 344)
                                      </span>
                                    )}
                                  </div>
                                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.1rem' }}>
                                    {item.category || 'Geral'} {item.code ? `• Cód: ${item.code}` : ''} • Unidade: {item.unit || 'un'}
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        )}
                        {filteredStockItems.length > 150 && (
                          <div style={{ padding: '0.5rem', fontSize: '0.75rem', color: '#64748b', textAlign: 'center', backgroundColor: '#f8fafc', fontStyle: 'italic' }}>
                            Mostrando 150 de {filteredStockItems.length} insumos. Digite para filtrar.
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div style={{ width: '110px' }}>
                    <label style={{ ...styles.label, fontSize: '0.8rem' }}>Quantidade:</label>
                    <input 
                      type="number" 
                      min="1" 
                      value={requestedQty} 
                      onChange={(e) => setRequestedQty(e.target.value)} 
                      style={styles.input}
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                    <button 
                      type="button" 
                      onClick={handleAddItemToReq}
                      style={styles.btnAddItem}
                    >
                      <Plus size={16} />
                      <span>Adicionar</span>
                    </button>
                  </div>
                </div>

                {/* Draft Table */}
                <div style={{ marginTop: '1rem' }}>
                  <label style={{ ...styles.label, fontSize: '0.85rem' }}>Itens ({reqItemsList.length}):</label>
                  {reqItemsList.length === 0 ? (
                    <div style={styles.emptyDraftBox}>
                      Nenhum item adicionado ainda. Escolha um insumo acima ou adicione um Kit pré-montado.
                    </div>
                  ) : (
                    <div style={styles.draftTableWrapper}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                        <thead style={{ backgroundColor: '#f8fafc', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>
                          <tr>
                            <th style={{ padding: '0.5rem 0.75rem', fontWeight: '700', color: 'var(--text-muted)', fontSize: '0.75rem' }}>Insumo</th>
                            <th style={{ padding: '0.5rem 0.75rem', width: '120px', fontWeight: '700', color: 'var(--text-muted)', fontSize: '0.75rem' }}>Quantidade</th>
                            <th style={{ padding: '0.5rem 0.75rem', width: '60px', textAlign: 'center', fontWeight: '700', color: 'var(--text-muted)', fontSize: '0.75rem' }}>Ações</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reqItemsList.map((item, idx) => {
                            const isCtrl = item.isControlled || stockItems.find(it => it.id === item.itemId)?.isControlled;
                            return (
                              <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={{ padding: '0.5rem 0.75rem', fontWeight: '600' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
                                    <span>{item.itemName}</span>
                                    {isCtrl && (
                                      <span style={styles.controlledBadge}>
                                        🔒 Controlado
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td style={{ padding: '0.5rem 0.75rem', fontWeight: '600', color: '#0d9488' }}>
                                  {item.requestedQuantity} {item.unit}
                                </td>
                                <td style={{ padding: '0.5rem 0.75rem', textAlign: 'center' }}>
                                  <button 
                                    type="button" 
                                    onClick={() => handleRemoveItemFromReq(idx)}
                                    style={styles.btnRemoveDraft}
                                    title="Remover insumo"
                                  >
                                    <Trash2 size={14} />
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
              </div>

              {/* Observações */}
              <div style={styles.formGroup}>
                <label style={styles.label}>Observações:</label>
                <textarea 
                  value={notes} 
                  onChange={(e) => setNotes(e.target.value)} 
                  placeholder="Ex: Intercorrência no 2º turno, agulha substituída..."
                  style={{ ...styles.input, height: '64px', resize: 'vertical' }}
                />
              </div>

              <div style={styles.modalFooter}>
                <button type="button" style={styles.btnSecondary} onClick={() => setShowModal(false)}>
                  Cancelar
                </button>
                <button type="submit" style={styles.primaryHeroBtn} disabled={actionLoading}>
                  {actionLoading ? (
                    <>
                      <RefreshCw size={16} className="spin" />
                      <span>Salvando...</span>
                    </>
                  ) : editingReq ? (
                    <>
                      <CheckCircle2 size={16} />
                      <span>Salvar</span>
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      <span>Enviar</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Ver Detalhes */}
      {showDetailModal && selectedReqDetail && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <div style={styles.modalHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{ ...styles.kpiIconWrapper, backgroundColor: '#ccfbf1' }}>
                  <Eye size={20} color="#0d9488" />
                </div>
                <div>
                  <h2 style={styles.modalTitle}>
                    Detalhes ({selectedReqDetail.requisitionCode})
                  </h2>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Registro assistencial de dispensação hospitalar
                  </span>
                </div>
              </div>
              <button style={styles.modalCloseBtn} onClick={() => setShowDetailModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              <div style={styles.detailsGrid}>
                <div>
                  <span style={styles.detailLabel}>Solicitante:</span>
                  <div style={styles.detailValue}>{selectedReqDetail.requestedBy}</div>
                </div>
                <div>
                  <span style={styles.detailLabel}>Status:</span>
                  <div>{getStatusBadge(selectedReqDetail.status)}</div>
                </div>
                <div>
                  <span style={styles.detailLabel}>Data:</span>
                  <div style={styles.detailValue}>
                    {new Date(selectedReqDetail.createdAt).toLocaleString('pt-BR')}
                  </div>
                </div>
                <div>
                  <span style={styles.detailLabel}>Destino:</span>
                  <div style={{ ...styles.detailValue, display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
                    <span>{selectedReqDetail.patientName || 'Uso Geral'}</span>
                    {selectedReqDetail.salonLocation && (
                      <span style={styles.salonBadge}>
                        📍 {selectedReqDetail.salonLocation}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {(selectedReqDetail.hasKit || selectedReqDetail.hasControlledMedicine) && (
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {selectedReqDetail.hasKit && (
                    <span style={styles.kitBadge}>
                      📦 Kit de Insumos
                    </span>
                  )}
                  {selectedReqDetail.hasControlledMedicine && (
                    <span style={styles.controlledBadge}>
                      🔒 CONTÉM MEDICAMENTO CONTROLADO (Portaria 344)
                    </span>
                  )}
                </div>
              )}

              {selectedReqDetail.notes && (
                <div>
                  <span style={styles.detailLabel}>Observações:</span>
                  <div style={styles.notesBox}>
                    "{selectedReqDetail.notes}"
                  </div>
                </div>
              )}

              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: '700', marginBottom: '0.5rem', color: 'var(--text-color)' }}>
                  Insumos Solicitados:
                </h4>
                <div style={styles.draftTableWrapper}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                    <thead style={{ backgroundColor: '#f8fafc', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>
                      <tr>
                        <th style={{ padding: '0.5rem 0.75rem', fontWeight: '700', color: 'var(--text-muted)', fontSize: '0.75rem' }}>Insumo</th>
                        <th style={{ padding: '0.5rem 0.75rem', textAlign: 'center', fontWeight: '700', color: 'var(--text-muted)', fontSize: '0.75rem' }}>Quantidade</th>
                        <th style={{ padding: '0.5rem 0.75rem', textAlign: 'center', fontWeight: '700', color: 'var(--text-muted)', fontSize: '0.75rem' }}>Entregue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedReqDetail.items && selectedReqDetail.items.map((item, i) => {
                        const isCtrl = item.isControlled || stockItems.find(it => it.id === item.itemId)?.isControlled;
                        return (
                          <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '0.5rem 0.75rem', fontWeight: '600' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
                                <span>{item.itemName}</span>
                                {isCtrl && (
                                  <span style={styles.controlledBadge}>
                                    🔒 Controlado
                                  </span>
                                )}
                              </div>
                            </td>
                            <td style={{ padding: '0.5rem 0.75rem', textAlign: 'center', fontWeight: '600' }}>
                              {item.requestedQuantity} {item.unit}
                            </td>
                            <td style={{ 
                              padding: '0.5rem 0.75rem', 
                              textAlign: 'center', 
                              fontWeight: '700', 
                              color: item.deliveredQuantity >= item.requestedQuantity ? '#059669' : item.deliveredQuantity > 0 ? '#d97706' : '#64748b' 
                            }}>
                              {item.deliveredQuantity || 0} {item.unit}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {selectedReqDetail.fulfillment && (
                <div style={styles.fulfillmentBox}>
                  <strong>Atendido por:</strong> {selectedReqDetail.fulfillment.fulfilledBy || 'Farmácia Central'} em {new Date(selectedReqDetail.fulfillment.fulfilledAt).toLocaleString('pt-BR')}
                  {selectedReqDetail.fulfillment.notes && (
                    <div style={{ marginTop: '0.3rem' }}><strong>Notas da Farmácia:</strong> {selectedReqDetail.fulfillment.notes}</div>
                  )}
                </div>
              )}
            </div>

            <div style={styles.modalFooter}>
              <button style={styles.btnSecondary} onClick={() => setShowDetailModal(false)}>
                Fechar
              </button>
            </div>
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
    gap: '1.25rem',
    maxWidth: 'var(--max-width, 1400px)',
    margin: '0 auto',
    padding: '0.5rem',
  },
  heroSection: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1.5rem',
    backgroundColor: '#ffffff',
    padding: '1.5rem 2rem',
    borderRadius: '16px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    border: '1px solid var(--border-color, #e2e8f0)',
  },
  heroLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.25rem',
  },
  heroIconBadge: {
    width: '56px',
    height: '56px',
    borderRadius: '14px',
    background: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 8px 16px rgba(20, 184, 166, 0.25)',
    flexShrink: 0,
  },
  heroTitle: {
    fontSize: '1.6rem',
    fontWeight: '800',
    color: 'var(--text-color, #1e293b)',
    margin: 0,
    letterSpacing: '-0.02em',
  },
  heroSubtitle: {
    fontSize: '0.9rem',
    color: 'var(--text-muted, #64748b)',
    margin: '0.35rem 0 0 0',
    maxWidth: '650px',
  },
  heroActions: {
    display: 'flex',
    gap: '0.75rem',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  primaryHeroBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    backgroundColor: '#14b8a6',
    color: '#ffffff',
    border: 'none',
    padding: '0.75rem 1.25rem',
    borderRadius: '10px',
    fontWeight: '600',
    fontSize: '0.9rem',
    cursor: 'pointer',
    boxShadow: '0 4px 10px rgba(20, 184, 166, 0.25)',
    transition: 'all 0.15s ease',
  },
  secondaryHeroBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    backgroundColor: '#ffffff',
    color: 'var(--text-color, #334155)',
    border: '1px solid var(--border-color, #cbd5e1)',
    padding: '0.75rem 1rem',
    borderRadius: '10px',
    fontWeight: '600',
    fontSize: '0.9rem',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  alert: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.875rem 1.25rem',
    borderRadius: '10px',
    fontSize: '0.875rem',
    fontWeight: '600',
  },
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '1rem',
  },
  kpiCard: {
    backgroundColor: '#ffffff',
    padding: '1.25rem',
    borderRadius: '14px',
    border: '1px solid var(--border-color, #e2e8f0)',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem',
    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
  },
  kpiHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  kpiIconWrapper: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  kpiTitle: {
    fontSize: '0.8rem',
    fontWeight: '700',
    color: 'var(--text-muted, #64748b)',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  kpiValue: {
    fontSize: '1.85rem',
    fontWeight: '800',
    color: 'var(--text-color, #1e293b)',
    margin: '0.2rem 0',
  },
  kpiSub: {
    fontSize: '0.75rem',
    color: 'var(--text-muted, #94a3b8)',
  },
  filterCard: {
    backgroundColor: '#ffffff',
    padding: '1rem 1.25rem',
    borderRadius: '14px',
    border: '1px solid var(--border-color, #e2e8f0)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '1rem',
    flexWrap: 'wrap',
    boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    backgroundColor: '#f8fafc',
    border: '1px solid var(--border-color, #cbd5e1)',
    borderRadius: '8px',
    padding: '0.55rem 0.85rem',
    flex: 1,
    minWidth: '280px',
  },
  searchInput: {
    border: 'none',
    background: 'transparent',
    outline: 'none',
    width: '100%',
    fontSize: '0.875rem',
    color: 'var(--text-color, #1e293b)',
  },
  btnClearSearch: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#94a3b8',
    padding: 0,
    display: 'flex',
    alignItems: 'center',
  },
  filterGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    flexWrap: 'wrap',
  },
  selectFilter: {
    padding: '0.55rem 0.85rem',
    borderRadius: '8px',
    border: '1px solid var(--border-color, #cbd5e1)',
    backgroundColor: '#ffffff',
    fontSize: '0.85rem',
    outline: 'none',
    color: 'var(--text-color, #334155)',
    fontWeight: '500',
    cursor: 'pointer',
  },
  viewModeGroup: {
    display: 'inline-flex',
    backgroundColor: '#f1f5f9',
    padding: '3px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    gap: '2px',
  },
  viewModeBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '0.35rem 0.65rem',
    border: 'none',
    backgroundColor: 'transparent',
    color: '#64748b',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  viewModeBtnActive: {
    backgroundColor: '#ffffff',
    color: '#0d9488',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  contentWrapper: {
    backgroundColor: '#ffffff',
    borderRadius: '14px',
    border: '1px solid var(--border-color, #e2e8f0)',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    overflow: 'hidden',
  },
  loadingBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4rem 2rem',
    gap: '0.85rem',
    color: 'var(--text-muted, #64748b)',
  },
  emptyBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4rem 2rem',
    textAlign: 'center',
  },
  emptyIconCircle: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    backgroundColor: '#ccfbf1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '0.5rem',
  },
  tableWrapper: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
    fontSize: '0.875rem',
  },
  th: {
    backgroundColor: '#f8fafc',
    padding: '0.75rem 1rem',
    fontSize: '0.75rem',
    fontWeight: '700',
    color: 'var(--text-muted, #64748b)',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    borderBottom: '1px solid var(--border-color, #e2e8f0)',
  },
  tr: {
    borderBottom: '1px solid var(--border-color, #e2e8f0)',
    transition: 'background-color 0.1s ease',
  },
  trCompact: {
    borderBottom: '1px solid var(--border-color, #e2e8f0)',
    height: '42px',
  },
  td: {
    padding: '0.875rem 1rem',
    verticalAlign: 'middle',
  },
  tdCompact: {
    padding: '0.45rem 1rem',
    verticalAlign: 'middle',
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.2rem 0.55rem',
    borderRadius: '9999px',
    fontSize: '0.75rem',
    fontWeight: '600',
  },
  salonBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '3px',
    fontSize: '0.72rem',
    backgroundColor: '#e0f2fe',
    color: '#0369a1',
    padding: '0.1rem 0.45rem',
    borderRadius: '4px',
    fontWeight: '700',
  },
  kitBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '3px',
    fontSize: '0.68rem',
    backgroundColor: '#fef3c7',
    color: '#b45309',
    padding: '0.1rem 0.4rem',
    borderRadius: '4px',
    fontWeight: '700',
    border: '1px solid #fde68a',
  },
  controlledBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '3px',
    fontSize: '0.68rem',
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    border: '1px solid #fecaca',
    padding: '0.1rem 0.4rem',
    borderRadius: '4px',
    fontWeight: '700',
  },
  actionBtnView: {
    backgroundColor: '#f1f5f9',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    padding: '0.35rem 0.55rem',
    color: '#334155',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    transition: 'all 0.15s ease',
  },
  actionBtnEdit: {
    backgroundColor: '#eff6ff',
    border: '1px solid #bfdbfe',
    borderRadius: '6px',
    padding: '0.35rem 0.55rem',
    color: '#1d4ed8',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    transition: 'all 0.15s ease',
  },
  actionBtnDelete: {
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '6px',
    padding: '0.35rem 0.55rem',
    color: '#dc2626',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    transition: 'all 0.15s ease',
  },
  cardsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '1.25rem',
    padding: '1.25rem',
  },
  reqCard: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px solid var(--border-color, #e2e8f0)',
    boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  reqCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '1rem',
    borderBottom: '1px solid #f1f5f9',
    backgroundColor: '#f8fafc',
  },
  reqCardCode: {
    fontWeight: '800',
    fontSize: '0.95rem',
    color: '#0d9488',
  },
  reqCardBody: {
    padding: '1rem',
    flex: 1,
  },
  reqCardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.75rem 1rem',
    borderTop: '1px solid #f1f5f9',
    backgroundColor: '#ffffff',
  },
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
    zIndex: 1000,
    padding: '1rem',
    backdropFilter: 'blur(4px)',
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '680px',
    maxHeight: '90vh',
    overflowY: 'auto',
    padding: '1.5rem',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    display: 'flex',
    flexDirection: 'column',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid var(--border-color, #e2e8f0)',
    paddingBottom: '1rem',
  },
  modalTitle: {
    fontSize: '1.2rem',
    fontWeight: '700',
    color: 'var(--text-color, #1e293b)',
    margin: 0,
  },
  modalCloseBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#94a3b8',
    display: 'flex',
    alignItems: 'center',
  },
  modalForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
    marginTop: '1.25rem',
  },
  formGrid2: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '1rem',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem',
  },
  label: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: 'var(--text-color, #1e293b)',
  },
  radioLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    fontSize: '0.85rem',
    fontWeight: '500',
    color: 'var(--text-color, #334155)',
    cursor: 'pointer',
  },
  input: {
    padding: '0.625rem 0.85rem',
    borderRadius: '8px',
    border: '1px solid var(--border-color, #cbd5e1)',
    fontSize: '0.875rem',
    outline: 'none',
    width: '100%',
    backgroundColor: '#ffffff',
    color: 'var(--text-color, #1e293b)',
  },
  kitSelectionCard: {
    padding: '0.875rem',
    backgroundColor: '#fef3c7',
    borderRadius: '10px',
    border: '1px solid #fde68a',
  },
  kitPillBtn: {
    padding: '0.35rem 0.75rem',
    backgroundColor: '#ffffff',
    border: '1px solid #d97706',
    borderRadius: '6px',
    fontSize: '0.78rem',
    fontWeight: '600',
    color: '#b45309',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.3rem',
    transition: 'all 0.15s ease',
  },
  itemsSection: {
    backgroundColor: '#f8fafc',
    padding: '1.25rem',
    borderRadius: '12px',
    border: '1px solid var(--border-color, #e2e8f0)',
  },
  itemsSectionTitle: {
    fontSize: '0.95rem',
    fontWeight: '700',
    margin: 0,
    color: 'var(--text-color, #1e293b)',
  },
  stockAlertBox: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    padding: '0.6rem 0.85rem',
    borderRadius: '8px',
    fontSize: '0.825rem',
    fontWeight: '600',
    marginBottom: '0.85rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.45rem',
  },
  addItemGrid: {
    display: 'flex',
    gap: '0.75rem',
    alignItems: 'flex-end',
    flexWrap: 'wrap',
  },
  btnClearSearchBtn: {
    position: 'absolute',
    right: '0.5rem',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#94a3b8',
    fontSize: '0.9rem',
    padding: '0.2rem 0.4rem',
  },
  dropdownMenu: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    maxHeight: '260px',
    overflowY: 'auto',
    backgroundColor: '#ffffff',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15)',
    zIndex: 1000,
    marginTop: '4px',
  },
  dropdownItem: {
    padding: '0.6rem 0.85rem',
    cursor: 'pointer',
    borderBottom: '1px solid #f1f5f9',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '0.85rem',
    transition: 'background-color 0.1s ease',
  },
  btnAddItem: {
    backgroundColor: '#14b8a6',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '0.625rem 1rem',
    fontSize: '0.875rem',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
    height: '38px',
    boxShadow: '0 2px 4px rgba(20, 184, 166, 0.2)',
  },
  emptyDraftBox: {
    padding: '1.25rem',
    backgroundColor: '#ffffff',
    border: '1px dashed #cbd5e1',
    borderRadius: '8px',
    textAlign: 'center',
    fontSize: '0.85rem',
    color: '#64748b',
  },
  draftTableWrapper: {
    maxHeight: '200px',
    overflowY: 'auto',
    border: '1px solid var(--border-color, #e2e8f0)',
    borderRadius: '8px',
    backgroundColor: '#ffffff',
  },
  btnRemoveDraft: {
    background: 'none',
    border: 'none',
    color: '#ef4444',
    cursor: 'pointer',
    padding: '0.2rem',
    display: 'inline-flex',
    alignItems: 'center',
  },
  modalFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.75rem',
    marginTop: '1rem',
    borderTop: '1px solid var(--border-color, #e2e8f0)',
    paddingTop: '1.25rem',
  },
  btnSecondary: {
    backgroundColor: '#f1f5f9',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    padding: '0.625rem 1.25rem',
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#334155',
    cursor: 'pointer',
  },
  detailsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
    backgroundColor: '#f8fafc',
    padding: '1.25rem',
    borderRadius: '10px',
    border: '1px solid #e2e8f0',
  },
  detailLabel: {
    fontSize: '0.75rem',
    color: 'var(--text-muted, #64748b)',
    fontWeight: '600',
    display: 'block',
    marginBottom: '0.2rem',
  },
  detailValue: {
    fontWeight: '700',
    fontSize: '0.9rem',
    color: 'var(--text-color, #1e293b)',
  },
  notesBox: {
    fontSize: '0.85rem',
    fontStyle: 'italic',
    backgroundColor: '#fffbe6',
    padding: '0.75rem',
    borderRadius: '8px',
    border: '1px solid #ffe58f',
    color: '#78350f',
  },
  fulfillmentBox: {
    backgroundColor: '#ecfdf5',
    padding: '0.875rem',
    borderRadius: '8px',
    border: '1px solid #a7f3d0',
    fontSize: '0.825rem',
    color: '#065f46',
  }
};
