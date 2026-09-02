import React, { useState, useEffect, useMemo } from 'react';
import QRCode from 'qrcode';
import { dbService } from '../firebase';
import { useUnit } from '../contexts/UnitContext';
import UnitSelector from './common/UnitSelector';
import ITServiceOrdersTab from './maintenance/ITServiceOrdersTab';
import { 
  Wrench, Plus, Search, Filter, X, FileText, CheckCircle2, 
  AlertTriangle, Clock, Trash2, Edit, AlertCircle, HardDrive, 
  ShieldAlert, Calendar, BarChart3, QrCode, Cpu, Laptop, Layers, 
  ChevronRight, RefreshCw, Check, AlertOctagon, Activity, DollarSign, AlignJustify, List, LayoutGrid,
  User, CheckSquare, Eye, Printer, ShieldCheck, Copy, ExternalLink, Download
} from 'lucide-react';

export default function MaintenancePanel({ currentUser }) {
  const { activeUnitId, filterByActiveUnit, matchItemUnit } = useUnit();
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'it_orders' | 'equipments' | 'calendar' | 'kpi'
  const [ordersViewMode, setOrdersViewMode] = useState('compact'); // 'compact' | 'normal' | 'card'
  const [equipmentsViewMode, setEquipmentsViewMode] = useState('compact');
  const [calendarViewMode, setCalendarViewMode] = useState('compact');
  const [equipments, setEquipments] = useState([]);
  const [serviceOrders, setServiceOrders] = useState([]);
  const [stockItems, setStockItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  // Modals
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);

  const [showEquipmentModal, setShowEquipmentModal] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState(null);
  const [isCustomSector, setIsCustomSector] = useState(false);

  // Filtragem de Dados pela Unidade Ativa
  const currentEquipments = useMemo(() => filterByActiveUnit(equipments), [equipments, activeUnitId]);
  const currentServiceOrders = useMemo(() => filterByActiveUnit(serviceOrders), [serviceOrders, activeUnitId]);
  const currentStockItems = useMemo(() => filterByActiveUnit(stockItems), [stockItems, activeUnitId]);

  const sectorOptions = useMemo(() => {
    const defaultSectors = [
      "Salão-1",
      "Salão-2",
      "Salão-3",
      "Salão A de Hemodiálise",
      "Salão B de Hemodiálise",
      "Salão C de Hemodiálise",
      "Tratamento de Água (ETA / Osmose)",
      "Reúso de Dialisadores",
      "Posto de Enfermagem",
      "Consultório Médico",
      "EXPURGO / CME (Esterilização)",
      "Recepção / Atendimento",
      "Farmácia Clínica / Estoque",
      "Área Técnica / Gerador / Compressores",
      "Administrativo / Diretoria",
      "Copa / Refeitório"
    ];
    const existingSectors = currentEquipments.map(e => e.sector).filter(Boolean);
    return Array.from(new Set([...defaultSectors, ...existingSectors]));
  }, [currentEquipments]);

  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedEqHistory, setSelectedEqHistory] = useState(null);

  const [showQrModal, setShowQrModal] = useState(false);
  const [selectedEqQr, setSelectedEqQr] = useState(null);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  // Form States - Service Order
  const [orderForm, setOrderForm] = useState({
    equipmentId: '',
    type: 'Corretiva',
    priority: 'Média',
    status: 'Aberta',
    requesterName: currentUser?.name || 'Solicitante',
    requesterSector: 'Geral',
    assignedTechnician: '',
    description: '',
    diagnostic: '',
    laborCost: '0.00',
    partsUsed: [] // { itemId, name, quantity, unitCost }
  });

  // Form States - Equipment
  const [eqForm, setEqForm] = useState({
    code: '',
    name: '',
    category: 'Biomédico',
    subcategory: '',
    brand: '',
    model: '',
    serialNumber: '',
    sector: '',
    criticality: 'Média',
    status: 'Em Operação',
    acquisitionDate: '',
    acquisitionValue: '',
    warrantyUntil: '',
    preventiveIntervalDays: 90,
    lastPreventiveDate: '',
    nextPreventiveDate: '',
    requiresCalibration: false,
    calibrationValidUntil: '',
    notes: ''
  });

  useEffect(() => {
    setLoading(true);
    let unsubOrders = () => {};
    let unsubEquips = () => {};

    if (dbService.subscribeToServiceOrders) {
      unsubOrders = dbService.subscribeToServiceOrders((orders) => {
        setServiceOrders((orders || []).filter(o => {
          const cat = String(o.equipmentCategory || o.category || '').toLowerCase();
          const eqId = String(o.equipmentId || '').toLowerCase();
          const type = String(o.type || '').toLowerCase();
          const desc = String(o.description || '').toLowerCase();
          const name = String(o.equipmentName || '').toLowerCase();
          return !cat.includes('ti') && !cat.includes('software') && !cat.includes('hardware') &&
                 !eqId.includes('ti') && !eqId.includes('sw') && !type.includes('ti') &&
                 !desc.includes('servidor') && !desc.includes('poweredge') && !desc.includes('zebra') &&
                 !name.includes('servidor') && !name.includes('poweredge') && !name.includes('zebra');
        }));
        setLoading(false);
      });
    }

    if (dbService.subscribeToEquipments) {
      unsubEquips = dbService.subscribeToEquipments((eqs) => {
        setEquipments((eqs || []).filter(e => {
          const cat = String(e.category || '').toLowerCase();
          const id = String(e.id || '').toLowerCase();
          const name = String(e.name || '').toLowerCase();
          const code = String(e.code || '').toLowerCase();
          return !cat.includes('ti') && !cat.includes('software') && !cat.includes('hardware') &&
                 !id.includes('ti-') && !id.includes('sw-') && !id.includes('eqp-ti') && !id.includes('eqp-sw') &&
                 !code.includes('ti-') && !code.includes('sw-') && !code.includes('pat-ti') && !code.includes('pat-sw') &&
                 !name.includes('servidor') && !name.includes('poweredge') && !name.includes('zebra');
        }));
        setLoading(false);
      });
    }

    fetchData();

    return () => {
      if (typeof unsubOrders === 'function') unsubOrders();
      if (typeof unsubEquips === 'function') unsubEquips();
    };
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [eqList, osList, itemsList] = await Promise.all([
        dbService.getEquipments ? dbService.getEquipments() : [],
        dbService.getServiceOrders ? dbService.getServiceOrders() : [],
        dbService.getInventoryItems ? dbService.getInventoryItems() : []
      ]);

      setEquipments((eqList || []).filter(e => {
        const cat = String(e.category || '').toLowerCase();
        const id = String(e.id || '').toLowerCase();
        const name = String(e.name || '').toLowerCase();
        const code = String(e.code || '').toLowerCase();
        return !cat.includes('ti') && !cat.includes('software') && !cat.includes('hardware') &&
               !id.includes('ti-') && !id.includes('sw-') && !id.includes('eqp-ti') && !id.includes('eqp-sw') &&
               !code.includes('ti-') && !code.includes('sw-') && !code.includes('pat-ti') && !code.includes('pat-sw') &&
               !name.includes('servidor') && !name.includes('poweredge') && !name.includes('zebra');
      }));
      setServiceOrders((osList || []).filter(o => {
        const cat = String(o.equipmentCategory || o.category || '').toLowerCase();
        const eqId = String(o.equipmentId || '').toLowerCase();
        const type = String(o.type || '').toLowerCase();
        const desc = String(o.description || '').toLowerCase();
        const name = String(o.equipmentName || '').toLowerCase();
        return !cat.includes('ti') && !cat.includes('software') && !cat.includes('hardware') &&
               !eqId.includes('ti') && !eqId.includes('sw') && !type.includes('ti') &&
               !desc.includes('servidor') && !desc.includes('poweredge') && !desc.includes('zebra') &&
               !name.includes('servidor') && !name.includes('poweredge') && !name.includes('zebra');
      }));
      setStockItems(itemsList || []);
    } catch (err) {
      console.error('Erro ao carregar dados de Manutenção:', err);
      showAlert('Erro ao carregar dados do módulo de Manutenção.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 4000);
  };

  // Check User Permission (Tech / Admin vs Standard Employee)
  const isTechOrAdmin = useMemo(() => {
    if (!currentUser) return false;
    if (currentUser.role === 'admin' || currentUser.role === 'technician' || currentUser.role === 'eng') return true;
    if (currentUser.email === 'contato@techcosta.net') return true;
    const allowed = currentUser.allowedSectors || [];
    return allowed.some(sec => ['manutencao', 'engenharia', 'admin'].includes(String(sec).toLowerCase()));
  }, [currentUser]);

  // User specific orders (Standard Employees only see their own opened orders)
  const userOrders = useMemo(() => {
    if (isTechOrAdmin) return currentServiceOrders;
    const userEmail = (currentUser?.email || '').trim().toLowerCase();
    const userName = (currentUser?.name || '').trim().toLowerCase();
    return currentServiceOrders.filter(o => {
      const osEmail = (o.requesterEmail || '').trim().toLowerCase();
      const osName = (o.requesterName || '').trim().toLowerCase();
      return (userEmail && osEmail === userEmail) || (userName && osName === userName);
    });
  }, [currentServiceOrders, isTechOrAdmin, currentUser]);

  // KPI Calculations
  const kpis = useMemo(() => {
    const totalEq = currentEquipments.length;
    const bioEq = currentEquipments.filter(e => e.category === 'Biomédico').length;

    const predEq = currentEquipments.filter(e => e.category === 'Infraestrutura').length;
    const inopEq = currentEquipments.filter(e => e.status === 'Inoperante' || e.status === 'Em Manutenção').length;

    const openOrders = currentServiceOrders.filter(o => o.status === 'Aberta' || o.status === 'Em Diagnóstico' || o.status === 'Em Execução' || o.status === 'Aguardando Peça').length;
    const completedOrders = currentServiceOrders.filter(o => o.status === 'Concluída' || o.status === 'Encerrada').length;
    
    const myOpenOrders = userOrders.filter(o => o.status === 'Aberta' || o.status === 'Em Diagnóstico' || o.status === 'Em Execução' || o.status === 'Aguardando Peça').length;
    const myCompletedOrders = userOrders.filter(o => o.status === 'Concluída' || o.status === 'Encerrada').length;

    const totalCost = currentServiceOrders.reduce((sum, o) => sum + (Number(o.totalCost) || 0), 0);

    const todayStr = new Date().toISOString().split('T')[0];
    const overduePreventives = currentEquipments.filter(e => e.nextPreventiveDate && e.nextPreventiveDate < todayStr).length;

    return { 
      totalEq, bioEq, predEq, inopEq, 
      openOrders, completedOrders, 
      myOpenOrders, myCompletedOrders,
      totalCost, overduePreventives 
    };
  }, [currentEquipments, currentServiceOrders, userOrders]);

  // Filtering Service Orders
  const filteredOrders = useMemo(() => {
    return userOrders.filter(order => {
      const matchesSearch = 
        (order.code || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.equipmentName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.assignedTechnician || '').toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      const matchesType = typeFilter === 'all' || order.type === typeFilter;
      const matchesCategory = categoryFilter === 'all' || order.equipmentCategory === categoryFilter;

      return matchesSearch && matchesStatus && matchesType && matchesCategory;
    });
  }, [userOrders, searchTerm, statusFilter, typeFilter, categoryFilter]);

  // Filtering Equipments
  const filteredEquipments = useMemo(() => {
    return currentEquipments.filter(eq => {
      const matchesSearch = 
        (eq.code || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (eq.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (eq.serialNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (eq.sector || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (eq.brand || '').toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = categoryFilter === 'all' || eq.category === categoryFilter;
      const matchesStatus = statusFilter === 'all' || eq.status === statusFilter;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [currentEquipments, searchTerm, categoryFilter, statusFilter]);

  // Handle Equipment Save
  const handleSaveEquipment = async (e) => {
    e.preventDefault();
    if (!eqForm.name.trim() || !eqForm.category) {
      showAlert('Preencha o nome e a categoria do equipamento.', 'danger');
      return;
    }

    try {
      const targetUnitId = activeUnitId === 'all' ? 'betim' : activeUnitId;
      const targetUnit = targetUnitId === 'taguatinga' ? 'Taguatinga' : 'Betim';

      const payload = {
        ...eqForm,
        id: editingEquipment ? editingEquipment.id : undefined,
        code: eqForm.code.trim() || `PAT-${Math.floor(1000 + Math.random() * 9000)}`,
        unitId: targetUnitId,
        unit: targetUnit
      };

      await dbService.saveEquipment(payload);
      showAlert(`Equipamento ${editingEquipment ? 'atualizado' : 'cadastrado'} com sucesso!`, 'success');
      setShowEquipmentModal(false);
      setEditingEquipment(null);
      fetchData();
    } catch (err) {
      console.error('Erro ao salvar equipamento:', err);
      showAlert('Erro ao salvar equipamento.', 'danger');
    }
  };

  // Handle Order Save
  const handleSaveOrder = async (e) => {
    e.preventDefault();
    if (!orderForm.equipmentId || !orderForm.description.trim()) {
      showAlert('Selecione o equipamento e descreva o problema.', 'danger');
      return;
    }

    const selectedEq = currentEquipments.find(e => e.id === orderForm.equipmentId) || equipments.find(e => e.id === orderForm.equipmentId);
    
    // Calculate total cost (labor + parts)
    const partsTotal = orderForm.partsUsed.reduce((acc, p) => acc + (Number(p.unitCost || 0) * Number(p.quantity || 1)), 0);
    const totalCost = partsTotal + Number(orderForm.laborCost || 0);

    const isNew = !editingOrder;
    const targetUnitId = activeUnitId === 'all' ? 'betim' : activeUnitId;
    const targetUnit = targetUnitId === 'taguatinga' ? 'Taguatinga' : 'Betim';

    const payload = {
      ...orderForm,
      id: editingOrder ? editingOrder.id : undefined,
      requesterName: orderForm.requesterName || currentUser?.name || 'Solicitante',
      requesterEmail: orderForm.requesterEmail || currentUser?.email || 'contato@techcosta.net',
      lastUpdatedBy: currentUser?.name || 'Técnico',
      equipmentName: selectedEq ? selectedEq.name : 'Equipamento não especificado',
      equipmentCategory: selectedEq ? selectedEq.category : 'Outros',
      sector: selectedEq ? selectedEq.sector : orderForm.requesterSector,
      totalCost,
      completionDate: (orderForm.status === 'Concluída' || orderForm.status === 'Encerrada') ? new Date().toISOString() : null,
      unitId: targetUnitId,
      unit: targetUnit
    };

    try {
      const updateNoteText = isNew 
        ? 'Chamado aberto no sistema.'
        : (orderForm.updateNote || `Atendimento atualizado por ${currentUser?.name || 'Técnico'}. Status alterado para: ${orderForm.status}`);

      const savedOS = await dbService.saveServiceOrder(payload, updateNoteText, orderForm.notifyRequesterEmail);
      
      // Update Equipment Status if order status changes to Inoperante / Em Manutenção
      if (selectedEq) {
        let newEqStatus = selectedEq.status;
        if (orderForm.status === 'Em Execução' || orderForm.status === 'Em Diagnóstico') {
          newEqStatus = 'Em Manutenção';
        } else if (orderForm.status === 'Concluída' || orderForm.status === 'Encerrada') {
          newEqStatus = 'Em Operação';
        }
        if (newEqStatus !== selectedEq.status) {
          await dbService.saveEquipment({ ...selectedEq, status: newEqStatus });
        }
      }

      if (savedOS) {
        setServiceOrders(prev => {
          const idx = prev.findIndex(o => o.id === savedOS.id);
          if (idx >= 0) {
            const updated = [...prev];
            updated[idx] = savedOS;
            return updated;
          }
          return [savedOS, ...prev];
        });
      }

      showAlert(
        isNew 
          ? `✅ Chamado ${savedOS?.code || ''} aberto com sucesso! E-mail de confirmação enviado para ${payload.requesterEmail}.`
          : `Ordem de Serviço ${editingOrder.code} atualizada! ${orderForm.notifyRequesterEmail ? `E-mail enviado para ${payload.requesterEmail}.` : ''}`, 
        'success'
      );
      setShowOrderModal(false);
      setEditingOrder(null);
      fetchData();
    } catch (err) {
      console.error('Erro ao salvar OS:', err);
      showAlert('Erro ao salvar Ordem de Serviço.', 'danger');
    }
  };

  const handleOpenNewOrder = (eq = null) => {
    setEditingOrder(null);
    setOrderForm({
      equipmentId: eq ? eq.id : '',
      type: 'Corretiva',
      priority: 'Média',
      status: 'Aberta',
      requesterName: currentUser?.name || 'Solicitante',
      requesterEmail: currentUser?.email || 'contato@techcosta.net',
      requesterSector: eq ? eq.sector : (currentUser?.allowedSectors?.[0] || 'Enfermagem'),
      assignedTechnician: '',
      description: '',
      diagnostic: '',
      updateNote: '',
      notifyRequesterEmail: true,
      laborCost: '0.00',
      partsUsed: []
    });
    setShowOrderModal(true);
  };

  const handleOpenEditOrder = (os) => {
    setEditingOrder(os);
    setOrderForm({
      equipmentId: os.equipmentId || '',
      type: os.type || 'Corretiva',
      priority: os.priority || 'Média',
      status: os.status || 'Aberta',
      requesterName: os.requesterName || currentUser?.name || '',
      requesterEmail: os.requesterEmail || currentUser?.email || 'contato@techcosta.net',
      requesterSector: os.requesterSector || '',
      assignedTechnician: os.assignedTechnician || '',
      description: os.description || '',
      diagnostic: os.diagnostic || '',
      updateNote: '',
      notifyRequesterEmail: true,
      laborCost: os.laborCost || '0.00',
      partsUsed: os.partsUsed || []
    });
    setShowOrderModal(true);
  };

  const handleOpenNewEquipment = () => {
    setEditingEquipment(null);
    setEqForm({
      code: '',
      name: '',
      category: 'Biomédico',
      subcategory: '',
      brand: '',
      model: '',
      serialNumber: '',
      sector: '',
      criticality: 'Média',
      status: 'Em Operação',
      acquisitionDate: '',
      acquisitionValue: '',
      warrantyUntil: '',
      preventiveIntervalDays: 90,
      lastPreventiveDate: '',
      nextPreventiveDate: '',
      requiresCalibration: false,
      calibrationValidUntil: '',
      notes: ''
    });
    setIsCustomSector(false);
    setShowEquipmentModal(true);
  };

  const handleOpenEditEquipment = (eq) => {
    setEditingEquipment(eq);
    setEqForm({ ...eq });
    setIsCustomSector(Boolean(eq.sector && !sectorOptions.includes(eq.sector)));
    setShowEquipmentModal(true);
  };

  const handleOpenHistory = (eq) => {
    setSelectedEqHistory(eq);
    setShowHistoryModal(true);
  };

  const handleGenerateEquipmentPdf = (eq) => {
    if (!eq) return;
    const eqOrders = serviceOrders.filter(o => o.equipmentId === eq.id);
    const totalCost = eqOrders.reduce((sum, o) => sum + (Number(o.totalCost) || 0), 0);
    const issueDate = new Date().toLocaleDateString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    const printWindow = window.open('', '_blank', 'width=900,height=850');
    if (!printWindow) {
      showAlert('Por favor, permita janelas pop-up no seu navegador para gerar o PDF.', 'danger');
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <title>Prontuário Técnico - ${eq.code} - ${eq.name}</title>
        <style>
          @page { size: A4; margin: 12mm; }
          body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #1e293b; line-height: 1.5; margin: 0; padding: 15px; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #0891b2; padding-bottom: 12px; margin-bottom: 20px; }
          .header-title { font-size: 18px; font-weight: 800; color: #0891b2; text-transform: uppercase; letter-spacing: 0.5px; }
          .header-sub { font-size: 11px; color: #64748b; margin-top: 2px; }
          .section-title { font-size: 13px; font-weight: 700; color: #0f172a; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; margin-top: 20px; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.5px; }
          .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px 16px; font-size: 11px; background: #f8fafc; padding: 12px; border-radius: 6px; border: 1px solid #e2e8f0; }
          .info-item { display: flex; justify-content: space-between; }
          .info-label { font-weight: bold; color: #475569; }
          .info-value { color: #0f172a; font-weight: 600; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 11px; }
          th { background-color: #f1f5f9; color: #334155; font-weight: bold; text-transform: uppercase; padding: 8px; border: 1px solid #cbd5e1; text-align: left; font-size: 10px; }
          td { padding: 8px; border: 1px solid #e2e8f0; vertical-align: top; }
          .os-code { font-weight: bold; color: #0891b2; }
          .os-diagnostic { background-color: #f0fdf4; color: #166534; padding: 6px; border-radius: 4px; margin-top: 4px; font-size: 10px; border: 1px solid #bbf7d0; }
          .summary-box { display: flex; justify-content: space-between; background: #ecfeff; border: 1px solid #a5f3fc; padding: 10px 15px; border-radius: 6px; margin-top: 15px; font-size: 12px; font-weight: bold; color: #0e7490; }
          .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 60px; text-align: center; font-size: 11px; page-break-inside: avoid; }
          .signature-line { border-top: 1px solid #64748b; padding-top: 5px; font-weight: bold; color: #334155; }
          @media print {
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="no-print" style="margin-bottom: 15px; text-align: right;">
          <button onclick="window.print()" style="background: #0891b2; color: #fff; border: none; padding: 8px 16px; border-radius: 6px; font-size: 13px; font-weight: bold; cursor: pointer; display: inline-flex; align-items: center; gap: 6px;">🖨️ Imprimir / Salvar em PDF</button>
        </div>

        <div class="header">
          <div>
            <div class="header-title">NexaCLINIC - Prontuário Técnico do Equipamento</div>
            <div class="header-sub">Histórico Rastreável de Manutenção, Engenharia Clínica & T.I.</div>
          </div>
          <div style="text-align: right;">
            <div style="font-weight: bold; font-size: 11px;">Emissão: ${issueDate}</div>
            <div style="font-size: 10px; color: #64748b;">Sistema NexaSERVICE v3.1.0</div>
          </div>
        </div>

        <div class="section-title">1. Dados Cadastrais do Ativo</div>
        <div class="info-grid">
          <div class="info-item"><span class="info-label">Código Patrimônio:</span> <span class="info-value">${eq.code}</span></div>
          <div class="info-item"><span class="info-label">Nome do Ativo:</span> <span class="info-value">${eq.name}</span></div>
          <div class="info-item"><span class="info-label">Categoria:</span> <span class="info-value">${eq.category} (${eq.subcategory || 'Geral'})</span></div>
          <div class="info-item"><span class="info-label">Setor / Localização:</span> <span class="info-value">${eq.sector}</span></div>
          <div class="info-item"><span class="info-label">Marca / Fabricante:</span> <span class="info-value">${eq.brand || 'N/A'}</span></div>
          <div class="info-item"><span class="info-label">Modelo:</span> <span class="info-value">${eq.model || 'N/A'}</span></div>
          <div class="info-item"><span class="info-label">Número de Série:</span> <span class="info-value">${eq.serialNumber || 'N/A'}</span></div>
          <div class="info-item"><span class="info-label">Status Operacional:</span> <span class="info-value">${eq.status}</span></div>
          <div class="info-item"><span class="info-label">Periodicidade Preventiva:</span> <span class="info-value">A cada ${eq.preventiveIntervalDays || 90} dias</span></div>
          <div class="info-item"><span class="info-label">Próxima Preventiva:</span> <span class="info-value">${eq.nextPreventiveDate ? new Date(eq.nextPreventiveDate + 'T00:00:00').toLocaleDateString('pt-BR') : 'N/A'}</span></div>
        </div>

        <div class="summary-box">
          <span>Total de Intervenções: ${eqOrders.length} OS(s)</span>
          <span>Custo Acumulado Total: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalCost)}</span>
        </div>

        <div class="section-title">2. Histórico Rastreável de Ordens de Serviço (OS)</div>
        ${eqOrders.length === 0 ? `
          <p style="font-size: 11px; color: #64748b; font-style: italic; padding: 10px; background: #f8fafc; border-radius: 4px;">Nenhuma Ordem de Serviço registrada para este equipamento até a presente data.</p>
        ` : `
          <table>
            <thead>
              <tr>
                <th style="width: 15%;">Código / Data</th>
                <th style="width: 15%;">Tipo / SLA</th>
                <th style="width: 25%;">Solicitante & Técnico</th>
                <th style="width: 35%;">Sintoma & Laudo Técnico</th>
                <th style="width: 10%;">Custo Total</th>
              </tr>
            </thead>
            <tbody>
              ${eqOrders.map(os => `
                <tr>
                  <td>
                    <div class="os-code">${os.code}</div>
                    <div style="color: #64748b; font-size: 10px;">Abertura: ${new Date(os.openDate).toLocaleDateString('pt-BR')}</div>
                    ${os.completionDate ? `<div style="color: #166534; font-size: 10px;">Conclusão: ${new Date(os.completionDate).toLocaleDateString('pt-BR')}</div>` : ''}
                  </td>
                  <td>
                    <strong>${os.type}</strong><br/>
                    <span style="font-size: 10px; color: #64748b;">SLA: ${os.priority}</span>
                  </td>
                  <td>
                    <div><strong>Sol.:</strong> ${os.requesterName} (${os.requesterSector})</div>
                    <div style="color: #0891b2;"><strong>Téc.:</strong> ${os.assignedTechnician || 'Não atribuído'}</div>
                  </td>
                  <td>
                    <div><strong>Sintoma:</strong> ${os.description}</div>
                    ${os.diagnostic ? `<div class="os-diagnostic"><strong>Laudo Técnico:</strong> ${os.diagnostic}</div>` : ''}
                  </td>
                  <td style="font-weight: bold; color: #0f172a;">
                    ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(os.totalCost || 0)}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `}

        <div class="signatures">
          <div>
            <div class="signature-line">Engenharia Clínica / T.I. Responsável</div>
            <div style="font-size: 10px; color: #64748b;">Assinatura e Carimbo</div>
          </div>
          <div>
            <div class="signature-line">Responsável Técnico do Setor / Unidade</div>
            <div style="font-size: 10px; color: #64748b;">Assinatura e Aceite</div>
          </div>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const handleOpenQr = async (eq) => {
    setSelectedEqQr(eq);
    setCopiedLink(false);
    setShowQrModal(true);
    try {
      const targetUrl = `${window.location.origin}/?chamado_equipamento=${encodeURIComponent(eq.id)}`;
      const url = await QRCode.toDataURL(targetUrl, {
        width: 220,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff'
        }
      });
      setQrDataUrl(url);
    } catch (err) {
      console.error('Erro ao gerar QR Code do equipamento:', err);
    }
  };

  const handlePrintAssetTag = (eq, qrUrl) => {
    if (!eq) return;
    const printWindow = window.open('', '_blank', 'width=520,height=600');
    if (!printWindow) {
      showAlert('Por favor, permita pop-ups para imprimir a etiqueta patrimonial.', 'danger');
      return;
    }
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <title>Etiqueta Patrimonial - ${eq.code}</title>
        <style>
          @page { size: 80mm 100mm; margin: 4mm; }
          body { font-family: 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 10px; color: #0f172a; text-align: center; }
          .tag-card { border: 2px solid #0f172a; border-radius: 8px; padding: 10px; }
          .header { font-size: 13px; font-weight: 800; color: #0891b2; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #0891b2; padding-bottom: 4px; margin-bottom: 8px; }
          .code { font-size: 20px; font-weight: 900; color: #0f172a; margin: 4px 0; }
          .name { font-size: 11px; font-weight: 700; color: #334155; margin-bottom: 4px; }
          .sector { font-size: 10px; color: #64748b; margin-bottom: 8px; }
          .qr-img { width: 170px; height: 170px; margin: 0 auto; display: block; }
          .instruction { font-size: 9px; font-weight: 700; color: #0891b2; text-transform: uppercase; margin-top: 8px; letter-spacing: 0.3px; }
          .sub { font-size: 8px; color: #64748b; margin-top: 2px; }
          @media print { .no-print { display: none; } }
        </style>
      </head>
      <body>
        <div class="tag-card">
          <div class="header">NexaCLINIC • Engenharia Clínica</div>
          <div class="code">${eq.code}</div>
          <div class="name">${eq.name}</div>
          <div class="sector">Setor: ${eq.sector || 'Geral'} • Série: ${eq.serialNumber || 'N/A'}</div>
          <img src="${qrUrl}" class="qr-img" alt="QR Code" />
          <div class="instruction">Aponte a Câmera para Abrir Chamado</div>
          <div class="sub">Sistema Integrado de Manutenção Hospitalar</div>
        </div>
        <script>
          window.onload = function() {
            setTimeout(function() { window.print(); }, 250);
          };
        </script>
      </body>
      </html>
    `;
    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'Em Operação': return { bg: '#dcfce7', text: '#15803d', border: '#bbf7d0' };
      case 'Em Manutenção': return { bg: '#fef3c7', text: '#b45309', border: '#fde68a' };
      case 'Inoperante': return { bg: '#fee2e2', text: '#b91c1c', border: '#fca5a5' };
      case 'Aguardando Peça': return { bg: '#e0e7ff', text: '#4338ca', border: '#c7d2fe' };
      case 'Concluída': case 'Encerrada': return { bg: '#dcfce7', text: '#15803d', border: '#bbf7d0' };
      case 'Aberta': return { bg: '#e0f2fe', text: '#0369a1', border: '#bae6fd' };
      default: return { bg: '#f3f4f6', text: '#4b5563', border: '#e5e7eb' };
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'Crítico': return <span style={{ ...styles.badge, backgroundColor: '#fee2e2', color: '#b91c1c' }}>Crítico (2h)</span>;
      case 'Alta': return <span style={{ ...styles.badge, backgroundColor: '#ffedd5', color: '#c2410c' }}>Alta (8h)</span>;
      case 'Média': return <span style={{ ...styles.badge, backgroundColor: '#fef3c7', color: '#b45309' }}>Média (24h)</span>;
      default: return <span style={{ ...styles.badge, backgroundColor: '#f3f4f6', color: '#4b5563' }}>Baixa (48h)</span>;
    }
  };

  return (
    <div style={styles.container}>
      {/* Top Banner Header */}
      <div style={styles.header}>
        <div style={styles.headerTitleBox}>
          <div style={styles.headerIcon}>
            <Wrench size={24} color="#fff" />
          </div>
          <div>
            <h1 style={styles.title}>NexaSERVICE - Manutenção</h1>
            <p style={styles.subtitle}>
              Gestão integrada de Ativos Hospitalares, Engenharia Clínica e Equipamentos Prediais
            </p>
          </div>
        </div>

        <div style={styles.headerActions}>
          <UnitSelector compact showLabel={false} />
          <button onClick={() => handleOpenNewOrder()} style={styles.btnPrimary}>
            <Plus size={16} /> Nova OS
          </button>
          {isTechOrAdmin && (
            <button onClick={handleOpenNewEquipment} style={styles.btnSecondary}>
              <HardDrive size={16} /> Novo Equipamento
            </button>
          )}
        </div>
      </div>

      {/* Alert Message Toast */}
      {message.text && (
        <div style={{ ...styles.alert, backgroundColor: message.type === 'danger' ? '#fee2e2' : '#dcfce7', color: message.type === 'danger' ? '#991b1b' : '#166534' }}>
          {message.type === 'danger' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
          <span>{message.text}</span>
        </div>
      )}

      {/* KPI Cards Row */}
      {activeTab !== 'it_orders' && (
        <div style={styles.kpiGrid}>
          {!isTechOrAdmin ? (
            <>
              <div style={styles.kpiCard}>
                <div style={styles.kpiHeader}>
                  <span style={styles.kpiLabel}>Meus Chamados</span>
                  <Clock size={18} color="#f59e0b" />
                </div>
                <div style={{ ...styles.kpiValue, color: '#f59e0b' }}>{kpis.myOpenOrders}</div>
                <span style={styles.kpiSub}>Em atendimento técnico</span>
              </div>

              <div style={styles.kpiCard}>
                <div style={styles.kpiHeader}>
                  <span style={styles.kpiLabel}>Concluídos</span>
                  <CheckCircle2 size={18} color="#10b981" />
                </div>
                <div style={{ ...styles.kpiValue, color: '#10b981' }}>{kpis.myCompletedOrders}</div>
                <span style={styles.kpiSub}>Resolvidos</span>
              </div>
            </>
          ) : (
            <>
              <div style={styles.kpiCard}>
                <div style={styles.kpiHeader}>
                  <span style={styles.kpiLabel}>Ativos</span>
                  <HardDrive size={18} color="#0891b2" />
                </div>
                <div style={styles.kpiValue}>{kpis.totalEq}</div>
                <span style={styles.kpiSub}>Bio: {kpis.bioEq} | Predial: {kpis.predEq}</span>
              </div>

              <div style={styles.kpiCard}>
                <div style={styles.kpiHeader}>
                  <span style={styles.kpiLabel}>OS em Aberto</span>
                  <Clock size={18} color="#f59e0b" />
                </div>
                <div style={{ ...styles.kpiValue, color: '#f59e0b' }}>{kpis.openOrders}</div>
                <span style={styles.kpiSub}>{kpis.completedOrders} Concluídas</span>
              </div>

              <div style={styles.kpiCard}>
                <div style={styles.kpiHeader}>
                  <span style={styles.kpiLabel}>Em Manutenção</span>
                  <AlertTriangle size={18} color="#ef4444" />
                </div>
                <div style={{ ...styles.kpiValue, color: '#ef4444' }}>{kpis.inopEq}</div>
                <span style={styles.kpiSub}>{kpis.overduePreventives} Atrasadas</span>
              </div>

              <div style={styles.kpiCard}>
                <div style={styles.kpiHeader}>
                  <span style={styles.kpiLabel}>Custo Acumulado</span>
                  <DollarSign size={18} color="#10b981" />
                </div>
                <div style={{ ...styles.kpiValue, color: '#10b981' }}>
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(kpis.totalCost)}
                </div>
                <span style={styles.kpiSub}>Manutenção Clínica</span>
              </div>
            </>
          )}
        </div>
      )}

      {/* Navigation Tabs */}
      <div style={styles.tabContainer}>
        <button 
          style={{ ...styles.tabButton, ...(activeTab === 'orders' ? styles.tabActive : {}) }}
          onClick={() => setActiveTab('orders')}
        >
          <FileText size={16} /> {isTechOrAdmin ? `OS Clínica (${currentServiceOrders.length})` : `Meus Chamados Clínicos (${userOrders.length})`}
        </button>

        <button 
          style={{ ...styles.tabButton, ...(activeTab === 'it_orders' ? styles.tabActive : {}) }}
          onClick={() => setActiveTab('it_orders')}
        >
          <Laptop size={16} /> {isTechOrAdmin ? 'Chamados T.I.' : 'Meus Chamados T.I.'}
        </button>

        {isTechOrAdmin && (
          <>
            <button 
              style={{ ...styles.tabButton, ...(activeTab === 'equipments' ? styles.tabActive : {}) }}
              onClick={() => setActiveTab('equipments')}
            >
              <HardDrive size={16} /> Equipamentos ({currentEquipments.length})
            </button>
            <button 
              style={{ ...styles.tabButton, ...(activeTab === 'calendar' ? styles.tabActive : {}) }}
              onClick={() => setActiveTab('calendar')}
            >
              <Calendar size={16} /> Cronograma
            </button>
            <button 
              style={{ ...styles.tabButton, ...(activeTab === 'kpi' ? styles.tabActive : {}) }}
              onClick={() => setActiveTab('kpi')}
            >
              <BarChart3 size={16} /> Indicadores
            </button>
          </>
        )}
      </div>

      {/* Search and Filters Bar (Only for orders and equipments tabs) */}
      {(activeTab === 'orders' || activeTab === 'equipments') && (
        <div style={styles.filterBar}>
          <div style={styles.searchBox}>
            <Search size={16} color="#94a3b8" />
            <input 
              type="text" 
              placeholder={activeTab === 'orders' ? "Buscar por código, equipamento, problema..." : "Buscar por patrimônio, nome, setor..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
          </div>

          <div style={styles.filterGroup}>
            <select 
              value={categoryFilter} 
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={styles.selectFilter}
            >
              <option value="all">Categoria</option>
              <option value="Biomédico">Biomédico</option>
              <option value="Infraestrutura">Infraestrutura</option>
            </select>

            {activeTab === 'orders' && (
              <select 
                value={typeFilter} 
                onChange={(e) => setTypeFilter(e.target.value)}
                style={styles.selectFilter}
              >
                <option value="all">Tipo</option>
                <option value="Corretiva">Corretiva</option>
                <option value="Preventiva">Preventiva</option>
                <option value="Calibração">Calibração</option>
                <option value="Instalação">Instalação</option>
              </select>
            )}

            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              style={styles.selectFilter}
            >
              <option value="all">Status</option>
              {activeTab === 'orders' ? (
                <>
                  <option value="Aberta">Aberta</option>
                  <option value="Em Diagnóstico">Em Diagnóstico</option>
                  <option value="Aguardando Peça">Aguardando Peça</option>
                  <option value="Em Execução">Em Execução</option>
                  <option value="Concluída">Concluída</option>
                </>
              ) : (
                <>
                  <option value="Em Operação">Em Operação</option>
                  <option value="Em Manutenção">Em Manutenção</option>
                  <option value="Inoperante">Inoperante</option>
                  <option value="Desativado">Desativado</option>
                </>
              )}
            </select>
          </div>
        </div>
      )}

      {/* TAB CONTENT: IT SERVICE ORDERS */}
      {activeTab === 'it_orders' && (
        <ITServiceOrdersTab 
          currentUser={currentUser}
          activeUnitId={activeUnitId}
          filterByActiveUnit={filterByActiveUnit}
        />
      )}

      {/* TAB CONTENT 1: SERVICE ORDERS (KANBAN & LIST) */}
      {activeTab === 'orders' && (
        <div>
          {loading ? (
            <div style={styles.loadingBox}>
              <RefreshCw size={24} className="spin" color="#0891b2" />
              <p>Carregando Ordens de Serviço...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div style={styles.emptyBox}>
              <FileText size={40} color="#cbd5e1" />
              <p style={{ fontWeight: '600', color: '#475569', marginTop: '0.5rem' }}>Nenhuma Ordem de Serviço encontrada.</p>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Aperte no botão "Nova Ordem de Serviço" acima para abrir um novo chamado.</p>
            </div>
          ) : ordersViewMode === 'card' ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
              {filteredOrders.map(order => {
                const statusBadge = getStatusBadgeStyle(order.status);
                return (
                  <div key={order.id} style={{ background: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '1rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <span style={{ fontWeight: '700', fontSize: '0.9rem', color: '#0f172a' }}>{order.code}</span>
                        <span style={{ ...styles.badge, backgroundColor: statusBadge.bg, color: statusBadge.text, border: `1px solid ${statusBadge.border}` }}>
                          {order.status}
                        </span>
                      </div>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#1e293b', margin: '0.2rem 0' }}>{order.equipmentName}</h4>
                      <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0.1rem 0' }}>Local: <strong>{order.sector}</strong> | Categoria: {order.equipmentCategory}</p>
                      <p style={{ fontSize: '0.8rem', color: '#475569', marginTop: '0.4rem' }}><strong>Problema:</strong> {order.description}</p>
                      <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.5rem' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#475569', background: '#f1f5f9', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>Tipo: {order.type}</span>
                        {getPriorityBadge(order.priority)}
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', paddingTop: '0.6rem', borderTop: '1px solid #f1f5f9' }}>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        <div>Sol: {order.requesterName}</div>
                        <div style={{ color: '#0891b2', fontWeight: '500' }}>{order.assignedTechnician || 'Aguardando atribuição'}</div>
                      </div>
                      <button onClick={() => handleOpenEditOrder(order)} style={styles.btnCardAction} title="Editar OS / Atendimento">
                        <Edit size={14} color="#0284c7" /> Atender OS
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={{ ...styles.th, padding: ordersViewMode === 'compact' ? '0.35rem 0.5rem' : '0.6rem 0.75rem', fontSize: ordersViewMode === 'compact' ? '0.75rem' : '0.85rem' }}>Código</th>
                    <th style={{ ...styles.th, padding: ordersViewMode === 'compact' ? '0.35rem 0.5rem' : '0.6rem 0.75rem', fontSize: ordersViewMode === 'compact' ? '0.75rem' : '0.85rem' }}>Equipamento</th>
                    <th style={{ ...styles.th, padding: ordersViewMode === 'compact' ? '0.35rem 0.5rem' : '0.6rem 0.75rem', fontSize: ordersViewMode === 'compact' ? '0.75rem' : '0.85rem' }}>Categoria</th>
                    <th style={{ ...styles.th, padding: ordersViewMode === 'compact' ? '0.35rem 0.5rem' : '0.6rem 0.75rem', fontSize: ordersViewMode === 'compact' ? '0.75rem' : '0.85rem' }}>Tipo</th>
                    <th style={{ ...styles.th, padding: ordersViewMode === 'compact' ? '0.35rem 0.5rem' : '0.6rem 0.75rem', fontSize: ordersViewMode === 'compact' ? '0.75rem' : '0.85rem' }}>Solicitante</th>
                    <th style={{ ...styles.th, padding: ordersViewMode === 'compact' ? '0.35rem 0.5rem' : '0.6rem 0.75rem', fontSize: ordersViewMode === 'compact' ? '0.75rem' : '0.85rem' }}>Técnico</th>
                    <th style={{ ...styles.th, padding: ordersViewMode === 'compact' ? '0.35rem 0.5rem' : '0.6rem 0.75rem', fontSize: ordersViewMode === 'compact' ? '0.75rem' : '0.85rem' }}>Status</th>
                    <th style={{ ...styles.th, padding: ordersViewMode === 'compact' ? '0.35rem 0.5rem' : '0.6rem 0.75rem', fontSize: ordersViewMode === 'compact' ? '0.75rem' : '0.85rem' }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map(order => {
                    const statusBadge = getStatusBadgeStyle(order.status);
                    const isCompact = ordersViewMode === 'compact';
                    return (
                      <tr key={order.id} style={styles.tr}>
                        <td style={{ ...styles.td, padding: isCompact ? '0.25rem 0.5rem' : '0.6rem 0.75rem', fontSize: isCompact ? '0.78rem' : '0.85rem' }}>
                          <span style={{ fontWeight: '700', color: '#0f172a' }}>{order.code}</span>
                          <span style={{ fontSize: '0.7rem', color: '#94a3b8', marginLeft: '0.4rem' }}>
                            ({new Date(order.openDate).toLocaleDateString('pt-BR')})
                          </span>
                        </td>
                        <td style={{ ...styles.td, padding: isCompact ? '0.25rem 0.5rem' : '0.6rem 0.75rem', fontSize: isCompact ? '0.78rem' : '0.85rem' }}>
                          <span style={{ fontWeight: '600', color: '#1e293b' }}>{order.equipmentName}</span>
                          <span style={{ fontSize: '0.72rem', color: '#64748b', marginLeft: '0.4rem' }}>[{order.sector}]</span>
                        </td>
                        <td style={{ ...styles.td, padding: isCompact ? '0.25rem 0.5rem' : '0.6rem 0.75rem', fontSize: isCompact ? '0.78rem' : '0.85rem' }}>
                          <span style={styles.categoryBadge}>{order.equipmentCategory}</span>
                        </td>
                        <td style={{ ...styles.td, padding: isCompact ? '0.25rem 0.5rem' : '0.6rem 0.75rem', fontSize: isCompact ? '0.78rem' : '0.85rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#475569' }}>{order.type}</span>
                            {getPriorityBadge(order.priority)}
                          </div>
                        </td>
                        <td style={{ ...styles.td, padding: isCompact ? '0.25rem 0.5rem' : '0.6rem 0.75rem', fontSize: isCompact ? '0.78rem' : '0.85rem' }}>
                          <span>{order.requesterName}</span>
                          <span style={{ fontSize: '0.72rem', color: '#64748b', marginLeft: '0.3rem' }}>({order.requesterSector})</span>
                        </td>
                        <td style={{ ...styles.td, padding: isCompact ? '0.25rem 0.5rem' : '0.6rem 0.75rem', fontSize: isCompact ? '0.78rem' : '0.85rem' }}>
                          <span style={{ fontWeight: '500', color: '#0891b2' }}>
                            {order.assignedTechnician || 'Aguardando atribuição'}
                          </span>
                        </td>
                        <td style={{ ...styles.td, padding: isCompact ? '0.25rem 0.5rem' : '0.6rem 0.75rem', fontSize: isCompact ? '0.78rem' : '0.85rem' }}>
                          <span style={{ ...styles.badge, backgroundColor: statusBadge.bg, color: statusBadge.text, border: `1px solid ${statusBadge.border}`, padding: isCompact ? '0.15rem 0.4rem' : '0.25rem 0.5rem', fontSize: isCompact ? '0.7rem' : '0.75rem' }}>
                            {order.status}
                          </span>
                        </td>
                        <td style={{ ...styles.td, padding: isCompact ? '0.25rem 0.5rem' : '0.6rem 0.75rem', fontSize: isCompact ? '0.78rem' : '0.85rem' }}>
                          <button 
                            onClick={() => handleOpenEditOrder(order)} 
                            style={{ ...styles.actionBtn, padding: isCompact ? '0.15rem 0.3rem' : '0.3rem 0.5rem' }}
                            title="Editar OS / Laudo Técnico"
                          >
                            <Edit size={14} color="#0284c7" />
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
      )}

      {/* TAB CONTENT 2: EQUIPMENTS & ASSETS */}
      {activeTab === 'equipments' && (
        <div>
          {loading ? (
            <div style={styles.loadingBox}>
              <RefreshCw size={24} className="spin" color="#0891b2" />
              <p>Carregando inventário de equipamentos...</p>
            </div>
          ) : filteredEquipments.length === 0 ? (
            <div style={styles.emptyBox}>
              <HardDrive size={40} color="#cbd5e1" />
              <p style={{ fontWeight: '600', color: '#475569', marginTop: '0.5rem' }}>Nenhum equipamento cadastrado com os filtros selecionados.</p>
            </div>
          ) : equipmentsViewMode === 'card' ? (
            <div style={styles.eqGrid}>
              {filteredEquipments.map(eq => {
                const statusBadge = getStatusBadgeStyle(eq.status);
                const relatedOsCount = serviceOrders.filter(o => o.equipmentId === eq.id).length;

                return (
                  <div key={eq.id} style={styles.eqCard}>
                    <div style={styles.eqCardHeader}>
                      <div>
                        <span style={styles.eqCode}>{eq.code}</span>
                        <h3 style={styles.eqTitle}>{eq.name}</h3>
                      </div>
                      <span style={{ ...styles.badge, backgroundColor: statusBadge.bg, color: statusBadge.text }}>
                        {eq.status}
                      </span>
                    </div>

                    <div style={styles.eqCardBody}>
                      <div style={styles.eqInfoRow}>
                        <span style={styles.eqInfoLabel}>Categoria:</span>
                        <span style={{ fontWeight: '600', color: '#0891b2' }}>{eq.category} ({eq.subcategory || 'Geral'})</span>
                      </div>
                      <div style={styles.eqInfoRow}>
                        <span style={styles.eqInfoLabel}>Modelo:</span>
                        <span>{eq.brand} - {eq.model}</span>
                      </div>
                      <div style={styles.eqInfoRow}>
                        <span style={styles.eqInfoLabel}>Série:</span>
                        <span>{eq.serialNumber || 'N/A'}</span>
                      </div>
                      <div style={styles.eqInfoRow}>
                        <span style={styles.eqInfoLabel}>Setor:</span>
                        <span style={{ fontWeight: '600', color: '#334155' }}>{eq.sector}</span>
                      </div>
                      <div style={styles.eqInfoRow}>
                        <span style={styles.eqInfoLabel}>Preventiva:</span>
                        <span style={{ fontWeight: '600', color: eq.nextPreventiveDate && eq.nextPreventiveDate < new Date().toISOString().split('T')[0] ? '#ef4444' : '#166534' }}>
                          {eq.nextPreventiveDate ? new Date(eq.nextPreventiveDate + 'T00:00:00').toLocaleDateString('pt-BR') : 'Não agendada'}
                        </span>
                      </div>
                    </div>

                    <div style={styles.eqCardFooter}>
                      <div style={{ display: 'flex', gap: '0.3rem' }}>
                        <button onClick={() => handleOpenHistory(eq)} style={styles.btnCardAction} title="Histórico de OS">
                          <Clock size={14} /> Histórico ({relatedOsCount})
                        </button>
                        <button onClick={() => handleOpenQr(eq)} style={styles.btnCardAction} title="Ver QR Code">
                          <QrCode size={14} /> QR
                        </button>
                      </div>

                      <div style={{ display: 'flex', gap: '0.3rem' }}>
                        <button onClick={() => handleOpenNewOrder(eq)} style={styles.btnCardPrimary} title="Abrir OS para este equipamento">
                          <Wrench size={14} /> OS
                        </button>
                        <button onClick={() => handleOpenEditEquipment(eq)} style={styles.actionBtn} title="Editar Cadastro">
                          <Edit size={15} color="#0284c7" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={{ ...styles.th, padding: equipmentsViewMode === 'compact' ? '0.35rem 0.5rem' : '0.6rem 0.75rem', fontSize: equipmentsViewMode === 'compact' ? '0.75rem' : '0.85rem' }}>Patrimônio</th>
                    <th style={{ ...styles.th, padding: equipmentsViewMode === 'compact' ? '0.35rem 0.5rem' : '0.6rem 0.75rem', fontSize: equipmentsViewMode === 'compact' ? '0.75rem' : '0.85rem' }}>Equipamento</th>
                    <th style={{ ...styles.th, padding: equipmentsViewMode === 'compact' ? '0.35rem 0.5rem' : '0.6rem 0.75rem', fontSize: equipmentsViewMode === 'compact' ? '0.75rem' : '0.85rem' }}>Categoria</th>
                    <th style={{ ...styles.th, padding: equipmentsViewMode === 'compact' ? '0.35rem 0.5rem' : '0.6rem 0.75rem', fontSize: equipmentsViewMode === 'compact' ? '0.75rem' : '0.85rem' }}>Modelo</th>
                    <th style={{ ...styles.th, padding: equipmentsViewMode === 'compact' ? '0.35rem 0.5rem' : '0.6rem 0.75rem', fontSize: equipmentsViewMode === 'compact' ? '0.75rem' : '0.85rem' }}>Série</th>
                    <th style={{ ...styles.th, padding: equipmentsViewMode === 'compact' ? '0.35rem 0.5rem' : '0.6rem 0.75rem', fontSize: equipmentsViewMode === 'compact' ? '0.75rem' : '0.85rem' }}>Setor</th>
                    <th style={{ ...styles.th, padding: equipmentsViewMode === 'compact' ? '0.35rem 0.5rem' : '0.6rem 0.75rem', fontSize: equipmentsViewMode === 'compact' ? '0.75rem' : '0.85rem' }}>Preventiva</th>
                    <th style={{ ...styles.th, padding: equipmentsViewMode === 'compact' ? '0.35rem 0.5rem' : '0.6rem 0.75rem', fontSize: equipmentsViewMode === 'compact' ? '0.75rem' : '0.85rem' }}>Status</th>
                    <th style={{ ...styles.th, padding: equipmentsViewMode === 'compact' ? '0.35rem 0.5rem' : '0.6rem 0.75rem', fontSize: equipmentsViewMode === 'compact' ? '0.75rem' : '0.85rem' }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEquipments.map(eq => {
                    const statusBadge = getStatusBadgeStyle(eq.status);
                    const relatedOsCount = serviceOrders.filter(o => o.equipmentId === eq.id).length;
                    const isCompact = equipmentsViewMode === 'compact';
                    const isOverdue = eq.nextPreventiveDate && eq.nextPreventiveDate < new Date().toISOString().split('T')[0];

                    return (
                      <tr key={eq.id} style={styles.tr}>
                        <td style={{ ...styles.td, padding: isCompact ? '0.25rem 0.5rem' : '0.6rem 0.75rem', fontSize: isCompact ? '0.78rem' : '0.85rem' }}>
                          <span style={{ fontWeight: '700', color: '#0f172a' }}>{eq.code}</span>
                        </td>
                        <td style={{ ...styles.td, padding: isCompact ? '0.25rem 0.5rem' : '0.6rem 0.75rem', fontSize: isCompact ? '0.78rem' : '0.85rem' }}>
                          <span style={{ fontWeight: '600', color: '#1e293b' }}>{eq.name}</span>
                        </td>
                        <td style={{ ...styles.td, padding: isCompact ? '0.25rem 0.5rem' : '0.6rem 0.75rem', fontSize: isCompact ? '0.78rem' : '0.85rem' }}>
                          <span style={styles.categoryBadge}>{eq.category}</span>
                        </td>
                        <td style={{ ...styles.td, padding: isCompact ? '0.25rem 0.5rem' : '0.6rem 0.75rem', fontSize: isCompact ? '0.78rem' : '0.85rem' }}>
                          <span>{eq.brand || 'N/A'} {eq.model ? `- ${eq.model}` : ''}</span>
                        </td>
                        <td style={{ ...styles.td, padding: isCompact ? '0.25rem 0.5rem' : '0.6rem 0.75rem', fontSize: isCompact ? '0.78rem' : '0.85rem' }}>
                          <span>{eq.serialNumber || 'N/A'}</span>
                        </td>
                        <td style={{ ...styles.td, padding: isCompact ? '0.25rem 0.5rem' : '0.6rem 0.75rem', fontSize: isCompact ? '0.78rem' : '0.85rem' }}>
                          <span style={{ fontWeight: '600', color: '#334155' }}>{eq.sector}</span>
                        </td>
                        <td style={{ ...styles.td, padding: isCompact ? '0.25rem 0.5rem' : '0.6rem 0.75rem', fontSize: isCompact ? '0.78rem' : '0.85rem' }}>
                          <span style={{ fontWeight: '600', color: isOverdue ? '#ef4444' : '#166534' }}>
                            {eq.nextPreventiveDate ? new Date(eq.nextPreventiveDate + 'T00:00:00').toLocaleDateString('pt-BR') : 'Não agendada'}
                          </span>
                        </td>
                        <td style={{ ...styles.td, padding: isCompact ? '0.25rem 0.5rem' : '0.6rem 0.75rem', fontSize: isCompact ? '0.78rem' : '0.85rem' }}>
                          <span style={{ ...styles.badge, backgroundColor: statusBadge.bg, color: statusBadge.text, padding: isCompact ? '0.15rem 0.4rem' : '0.25rem 0.5rem', fontSize: isCompact ? '0.7rem' : '0.75rem' }}>
                            {eq.status}
                          </span>
                        </td>
                        <td style={{ ...styles.td, padding: isCompact ? '0.25rem 0.5rem' : '0.6rem 0.75rem', fontSize: isCompact ? '0.78rem' : '0.85rem' }}>
                          <div style={{ display: 'flex', gap: '0.3rem' }}>
                            <button onClick={() => handleOpenHistory(eq)} style={{ ...styles.actionBtn, padding: '0.2rem 0.4rem' }} title="Histórico de OS">
                              <Clock size={13} /> ({relatedOsCount})
                            </button>
                            <button onClick={() => handleOpenQr(eq)} style={{ ...styles.actionBtn, padding: '0.2rem 0.4rem' }} title="Tag QR Code">
                              <QrCode size={13} />
                            </button>
                            <button onClick={() => handleOpenNewOrder(eq)} style={{ ...styles.btnPrimary, padding: '0.2rem 0.4rem', fontSize: '0.72rem' }} title="Abrir OS">
                              <Wrench size={12} /> OS
                            </button>
                            <button onClick={() => handleOpenEditEquipment(eq)} style={{ ...styles.actionBtn, padding: '0.2rem 0.4rem' }} title="Editar">
                              <Edit size={13} color="#0284c7" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT 3: CALENDAR & PREVENTIVES */}
      {activeTab === 'calendar' && (
        <div style={styles.cardContainer}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Calendar size={20} color="#0891b2" />
            <h2 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0f172a' }}>
              Cronograma Preventivo
            </h2>
          </div>

          {calendarViewMode === 'card' ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
              {equipments.map(eq => {
                const isOverdue = eq.nextPreventiveDate && eq.nextPreventiveDate < new Date().toISOString().split('T')[0];
                return (
                  <div key={eq.id} style={{ background: '#ffffff', borderRadius: '8px', border: isOverdue ? '1px solid #fca5a5' : '1px solid #cbd5e1', padding: '1rem', borderLeft: isOverdue ? '5px solid #ef4444' : '5px solid #10b981', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: '700', color: '#64748b' }}>
                        <span>{eq.code}</span>
                        <span>{eq.category}</span>
                      </div>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#1e293b', margin: '0.3rem 0' }}>{eq.name}</h4>
                      <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0.2rem 0' }}>Setor: <strong>{eq.sector}</strong></p>
                      <p style={{ fontSize: '0.75rem', color: '#475569' }}>Intervalo: Cada {eq.preventiveIntervalDays || 90} dias</p>
                    </div>
                    <div style={{ marginTop: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '0.75rem', fontWeight: '600', color: isOverdue ? '#ef4444' : '#166534' }}>
                          {isOverdue ? 'ATRASADA!' : 'Próxima:'}
                        </div>
                        <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#0f172a' }}>
                          {eq.nextPreventiveDate ? new Date(eq.nextPreventiveDate + 'T00:00:00').toLocaleDateString('pt-BR') : 'Não definida'}
                        </div>
                      </div>
                      <button onClick={() => handleOpenNewOrder(eq)} style={{ ...styles.btnPrimary, padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>
                        <Wrench size={12} /> Agendar
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : calendarViewMode === 'normal' ? (
            <div style={styles.preventiveList}>
              {equipments.map(eq => {
                const isOverdue = eq.nextPreventiveDate && eq.nextPreventiveDate < new Date().toISOString().split('T')[0];
                return (
                  <div key={eq.id} style={{ ...styles.preventiveItem, borderLeft: isOverdue ? '4px solid #ef4444' : '4px solid #10b981' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b' }}>{eq.code} • {eq.category}</span>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#1e293b', margin: '0.1rem 0' }}>{eq.name}</h4>
                      <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Setor: {eq.sector} | Intervalo: Cada {eq.preventiveIntervalDays || 90} dias</p>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: '600', color: isOverdue ? '#ef4444' : '#166534' }}>
                        {isOverdue ? 'PREVENTIVA ATRASADA!' : 'Próxima Preventiva:'}
                      </div>
                      <div style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a' }}>
                        {eq.nextPreventiveDate ? new Date(eq.nextPreventiveDate + 'T00:00:00').toLocaleDateString('pt-BR') : 'Não definida'}
                      </div>
                      <button onClick={() => handleOpenNewOrder(eq)} style={{ ...styles.btnPrimary, padding: '0.25rem 0.5rem', fontSize: '0.75rem', marginTop: '0.4rem' }}>
                        <Wrench size={12} /> Agendar
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={{ ...styles.th, padding: '0.35rem 0.5rem', fontSize: '0.75rem' }}>Código</th>
                    <th style={{ ...styles.th, padding: '0.35rem 0.5rem', fontSize: '0.75rem' }}>Equipamento</th>
                    <th style={{ ...styles.th, padding: '0.35rem 0.5rem', fontSize: '0.75rem' }}>Setor</th>
                    <th style={{ ...styles.th, padding: '0.35rem 0.5rem', fontSize: '0.75rem' }}>Intervalo</th>
                    <th style={{ ...styles.th, padding: '0.35rem 0.5rem', fontSize: '0.75rem' }}>Preventiva</th>
                    <th style={{ ...styles.th, padding: '0.35rem 0.5rem', fontSize: '0.75rem' }}>Status</th>
                    <th style={{ ...styles.th, padding: '0.35rem 0.5rem', fontSize: '0.75rem' }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {equipments.map(eq => {
                    const isOverdue = eq.nextPreventiveDate && eq.nextPreventiveDate < new Date().toISOString().split('T')[0];
                    return (
                      <tr key={eq.id} style={styles.tr}>
                        <td style={{ ...styles.td, padding: '0.25rem 0.5rem', fontSize: '0.78rem' }}>
                          <span style={{ fontWeight: '700', color: '#0f172a' }}>{eq.code}</span>
                        </td>
                        <td style={{ ...styles.td, padding: '0.25rem 0.5rem', fontSize: '0.78rem' }}>
                          <span style={{ fontWeight: '600', color: '#1e293b' }}>{eq.name}</span>
                        </td>
                        <td style={{ ...styles.td, padding: '0.25rem 0.5rem', fontSize: '0.78rem' }}>
                          <span>{eq.sector}</span>
                        </td>
                        <td style={{ ...styles.td, padding: '0.25rem 0.5rem', fontSize: '0.78rem' }}>
                          <span>Cada {eq.preventiveIntervalDays || 90} dias</span>
                        </td>
                        <td style={{ ...styles.td, padding: '0.25rem 0.5rem', fontSize: '0.78rem' }}>
                          <span style={{ fontWeight: '700', color: isOverdue ? '#ef4444' : '#0f172a' }}>
                            {eq.nextPreventiveDate ? new Date(eq.nextPreventiveDate + 'T00:00:00').toLocaleDateString('pt-BR') : 'Não definida'}
                          </span>
                        </td>
                        <td style={{ ...styles.td, padding: '0.25rem 0.5rem', fontSize: '0.78rem' }}>
                          <span style={{ ...styles.badge, backgroundColor: isOverdue ? '#fee2e2' : '#dcfce7', color: isOverdue ? '#991b1b' : '#166534', padding: '0.15rem 0.4rem', fontSize: '0.7rem' }}>
                            {isOverdue ? 'Atrasada' : 'Em Dia'}
                          </span>
                        </td>
                        <td style={{ ...styles.td, padding: '0.25rem 0.5rem', fontSize: '0.78rem' }}>
                          <button onClick={() => handleOpenNewOrder(eq)} style={{ ...styles.btnPrimary, padding: '0.2rem 0.45rem', fontSize: '0.72rem' }}>
                            <Wrench size={12} /> Agendar OS
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
      )}

      {/* TAB CONTENT 4: KPI & BI DASHBOARD */}
      {activeTab === 'kpi' && (
        <div style={styles.kpiContainer}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0f172a', marginBottom: '1rem' }}>
            Indicadores de Desempenho (BI Manutenção)
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
            <div style={styles.biCard}>
              <h3 style={styles.biTitle}>MTBF & MTTR (Indicadores de Confiabilidade)</h3>
              <div style={styles.biValueBox}>
                <div>
                  <span style={styles.biLabel}>MTBF (Tempo Médio Entre Falhas)</span>
                  <div style={{ fontSize: '1.4rem', fontWeight: '700', color: '#0891b2' }}>42 Dias</div>
                </div>
                <div>
                  <span style={styles.biLabel}>MTTR (Tempo Médio de Reparo)</span>
                  <div style={{ fontSize: '1.4rem', fontWeight: '700', color: '#10b981' }}>3.2 Horas</div>
                </div>
              </div>
            </div>

            <div style={styles.biCard}>
              <h3 style={styles.biTitle}>SLA de Atendimento Técnico</h3>
              <div style={styles.biValueBox}>
                <div>
                  <span style={styles.biLabel}>Chamados no Prazo</span>
                  <div style={{ fontSize: '1.4rem', fontWeight: '700', color: '#10b981' }}>96.5%</div>
                </div>
                <div>
                  <span style={styles.biLabel}>Tempo Médio 1º Atendimento</span>
                  <div style={{ fontSize: '1.4rem', fontWeight: '700', color: '#0891b2' }}>18 Minutos</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: NOVA OS (SOLICITANTE) / ATENDIMENTO TÉCNICO */}
      {showOrderModal && (
        <div style={styles.modalOverlay}>
          <div style={{ ...styles.modalContent, maxWidth: '650px' }}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>
                {editingOrder ? `Atendimento Técnico: ${editingOrder.code}` : 'Novo Chamado'}
              </h3>
              <button onClick={() => setShowOrderModal(false)} style={styles.closeBtn}>
                <X size={20} />
              </button>
            </div>

            {/* Context Header Banner */}
            {!editingOrder ? (
              <div style={{ padding: '0.75rem 1rem', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#166534', fontWeight: '600', fontSize: '0.85rem' }}>
                  <User size={18} color="#16a34a" />
                  <div>
                    <div><strong>Solicitante:</strong> {currentUser?.name || 'Funcionário Logado'}</div>
                    <div style={{ fontSize: '0.75rem', color: '#475569', fontWeight: 'normal' }}>
                      E-mail: {currentUser?.email || 'contato@techcosta.net'} | Setor: {orderForm.requesterSector || 'Geral'}
                    </div>
                  </div>
                </div>
                <span style={{ fontSize: '0.75rem', background: '#dcfce7', color: '#15803d', padding: '0.2rem 0.6rem', borderRadius: '12px', fontWeight: '700' }}>
                  Nova Abertura
                </span>
              </div>
            ) : (
              <div style={{ padding: '0.75rem 1rem', background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '8px', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <span style={{ fontWeight: '700', color: '#0369a1', fontSize: '0.9rem' }}>
                    [{editingOrder.code}] {editingOrder.equipmentName}
                  </span>
                  <span style={{ ...styles.badge, backgroundColor: getStatusBadgeStyle(editingOrder.status).bg, color: getStatusBadgeStyle(editingOrder.status).text, border: `1px solid ${getStatusBadgeStyle(editingOrder.status).border}` }}>
                    {editingOrder.status}
                  </span>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#334155', marginBottom: '0.4rem' }}>
                  <strong>Solicitante:</strong> {editingOrder.requesterName} ({editingOrder.requesterEmail || 'Sem e-mail informado'}) • Setor: {editingOrder.sector}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#475569', background: '#fff', padding: '0.5rem', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                  <strong>Sintoma Relatado:</strong> "{editingOrder.description}"
                </div>
              </div>
            )}

            <form onSubmit={handleSaveOrder} style={styles.formGrid}>
              {!editingOrder ? (
                /* -------------------------------------------------------------
                   MODO ABERTURA: QUALQUER FUNCIONÁRIO (SIMPLIFICADO)
                ------------------------------------------------------------- */
                <>
                  <div style={styles.formField}>
                    <label style={styles.label}>Equipamento *</label>
                    <select 
                      value={orderForm.equipmentId} 
                      onChange={(e) => {
                        const selectedEq = equipments.find(eq => eq.id === e.target.value);
                        setOrderForm({ 
                          ...orderForm, 
                          equipmentId: e.target.value,
                          requesterSector: selectedEq ? selectedEq.sector : orderForm.requesterSector
                        });
                      }}
                      style={styles.input}
                      required
                    >
                      <option value="">Selecione o equipamento...</option>
                      {equipments.map(eq => (
                        <option key={eq.id} value={eq.id}>
                          [{eq.code}] {eq.name} — Setor: {eq.sector} ({eq.category})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={styles.formRow2}>
                    <div style={styles.formField}>
                      <label style={styles.label}>Tipo *</label>
                      <select 
                        value={orderForm.type} 
                        onChange={(e) => setOrderForm({ ...orderForm, type: e.target.value })}
                        style={styles.input}
                      >
                        <option value="Corretiva">Corretiva (Defeito)</option>
                        <option value="Infraestrutura">Infraestrutura (Predial)</option>
                        <option value="Preventiva">Preventiva (Calibração)</option>
                      </select>
                    </div>

                    <div style={styles.formField}>
                      <label style={styles.label}>Prioridade *</label>
                      <select 
                        value={orderForm.priority} 
                        onChange={(e) => setOrderForm({ ...orderForm, priority: e.target.value })}
                        style={styles.input}
                      >
                        <option value="Baixa">Baixa</option>
                        <option value="Média">Média</option>
                        <option value="Alta">Alta</option>
                        <option value="Crítico">Crítico</option>
                      </select>
                    </div>
                  </div>

                  <div style={styles.formField}>
                    <label style={styles.label}>Descrição *</label>
                    <textarea 
                      rows={4} 
                      placeholder="Descreva com detalhes o sintoma apresentado, barulhos, mensagens de erro ou mau funcionamento..."
                      value={orderForm.description}
                      onChange={(e) => setOrderForm({ ...orderForm, description: e.target.value })}
                      style={styles.textarea}
                      required
                    />
                  </div>

                  <div style={{ padding: '0.6rem 0.8rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <ShieldCheck size={16} color="#0891b2" />
                    <span>Ao enviar, este chamado será encaminhado para a equipe técnica e um e-mail de confirmação será enviado para <strong>{currentUser?.email || 'seu e-mail'}</strong>.</span>
                  </div>
                </>
              ) : !isTechOrAdmin ? (
                /* -------------------------------------------------------------
                   MODO VISUALIZAÇÃO DO SOLICITANTE (LEITURA)
                ------------------------------------------------------------- */
                <>
                  <div style={{ padding: '0.75rem', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0', marginBottom: '0.5rem' }}>
                    <div style={{ fontSize: '0.85rem', color: '#334155', marginBottom: '0.4rem' }}>
                      <strong>Técnico:</strong> <span style={{ color: '#0891b2', fontWeight: '600' }}>{editingOrder.assignedTechnician || 'Aguardando atribuição pela equipe'}</span>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#334155', marginBottom: '0.4rem' }}>
                      <strong>Prioridade:</strong> {editingOrder.priority}
                    </div>
                    {editingOrder.diagnostic && (
                      <div style={{ fontSize: '0.85rem', color: '#166534', background: '#f0fdf4', padding: '0.5rem', borderRadius: '4px', border: '1px solid #bbf7d0', marginTop: '0.4rem' }}>
                        <strong>Laudo:</strong> {editingOrder.diagnostic}
                      </div>
                    )}
                  </div>

                  {/* Timeline Logs */}
                  {editingOrder.timelineLogs && editingOrder.timelineLogs.length > 0 && (
                    <div style={{ marginTop: '0.5rem' }}>
                      <label style={{ ...styles.label, marginBottom: '0.4rem', color: '#334155' }}>Histórico</label>
                      <div style={{ maxHeight: '160px', overflowY: 'auto', background: '#f8fafc', padding: '0.6rem', borderRadius: '6px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        {editingOrder.timelineLogs.map((log, idx) => (
                          <div key={log.id || idx} style={{ fontSize: '0.78rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.3rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                              <span><strong>{log.author}</strong> — Status: <span style={{ color: '#0891b2', fontWeight: '600' }}>{log.status}</span></span>
                              <span>{new Date(log.date).toLocaleString('pt-BR')}</span>
                            </div>
                            <div style={{ color: '#1e293b', marginTop: '0.1rem' }}>{log.note}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                /* -------------------------------------------------------------
                   MODO ATENDIMENTO TÉCNICO: EQUIPE DE MANUTENÇÃO
                ------------------------------------------------------------- */
                <>
                  <div style={styles.formRow2}>
                    <div style={styles.formField}>
                      <label style={styles.label}>Status *</label>
                      <select 
                        value={orderForm.status} 
                        onChange={(e) => setOrderForm({ ...orderForm, status: e.target.value })}
                        style={{ ...styles.input, fontWeight: '700', color: '#0369a1' }}
                      >
                        <option value="Aberta">Aberta</option>
                        <option value="Em Diagnóstico">Em Diagnóstico</option>
                        <option value="Aguardando Peça">Aguardando Peça</option>
                        <option value="Em Execução">Em Execução</option>
                        <option value="Concluída">Concluída</option>
                        <option value="Cancelada">Cancelada</option>
                      </select>
                    </div>

                    <div style={styles.formField}>
                      <label style={styles.label}>Técnico *</label>
                      <input 
                        type="text" 
                        placeholder="Nome do técnico ou empresa terceirizada"
                        value={orderForm.assignedTechnician}
                        onChange={(e) => setOrderForm({ ...orderForm, assignedTechnician: e.target.value })}
                        style={styles.input}
                      />
                    </div>
                  </div>

                  <div style={styles.formRow2}>
                    <div style={styles.formField}>
                      <label style={styles.label}>Prioridade</label>
                      <select 
                        value={orderForm.priority} 
                        onChange={(e) => setOrderForm({ ...orderForm, priority: e.target.value })}
                        style={styles.input}
                      >
                        <option value="Baixa">Baixa (Até 48 horas)</option>
                        <option value="Média">Média (Até 24 horas)</option>
                        <option value="Alta">Alta (Até 8 horas)</option>
                        <option value="Crítico">Crítico (Até 2 horas)</option>
                      </select>
                    </div>

                    <div style={styles.formField}>
                      <label style={styles.label}>Mão de Obra (R$)</label>
                      <input 
                        type="number" 
                        step="0.01"
                        placeholder="0.00"
                        value={orderForm.laborCost}
                        onChange={(e) => setOrderForm({ ...orderForm, laborCost: e.target.value })}
                        style={styles.input}
                      />
                    </div>
                  </div>

                  <div style={styles.formField}>
                    <label style={styles.label}>Laudo</label>
                    <textarea 
                      rows={3} 
                      placeholder="Causa raiz identificada, procedimentos efetuados, testes aplicados e parecer da solução..."
                      value={orderForm.diagnostic}
                      onChange={(e) => setOrderForm({ ...orderForm, diagnostic: e.target.value })}
                      style={styles.textarea}
                    />
                  </div>

                  <div style={styles.formField}>
                    <label style={styles.label}>Apontamento</label>
                    <textarea 
                      rows={2} 
                      placeholder="Descreva o que foi feito nesta etapa para enviar por e-mail ao solicitante..."
                      value={orderForm.updateNote}
                      onChange={(e) => setOrderForm({ ...orderForm, updateNote: e.target.value })}
                      style={styles.textarea}
                    />
                  </div>

                  <div style={{ padding: '0.6rem 0.8rem', background: '#ecfeff', border: '1px solid #a5f3fc', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600', color: '#0891b2' }}>
                      <input 
                        type="checkbox"
                        checked={orderForm.notifyRequesterEmail}
                        onChange={(e) => setOrderForm({ ...orderForm, notifyRequesterEmail: e.target.checked })}
                      />
                      <span>Enviar notificação por e-mail para: <strong>{editingOrder.requesterEmail || orderForm.requesterEmail}</strong></span>
                    </label>
                  </div>

                  {/* Timeline Logs */}
                  {editingOrder.timelineLogs && editingOrder.timelineLogs.length > 0 && (
                    <div style={{ marginTop: '0.5rem' }}>
                      <label style={{ ...styles.label, marginBottom: '0.4rem', color: '#334155' }}>Histórico</label>
                      <div style={{ maxHeight: '130px', overflowY: 'auto', background: '#f8fafc', padding: '0.6rem', borderRadius: '6px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        {editingOrder.timelineLogs.map((log, idx) => (
                          <div key={log.id || idx} style={{ fontSize: '0.78rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.3rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                              <span><strong>{log.author}</strong> — Status: <span style={{ color: '#0891b2', fontWeight: '600' }}>{log.status}</span></span>
                              <span>{new Date(log.date).toLocaleString('pt-BR')}</span>
                            </div>
                            <div style={{ color: '#1e293b', marginTop: '0.1rem' }}>{log.note}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              <div style={styles.modalFooter}>
                <button type="button" onClick={() => setShowOrderModal(false)} style={styles.btnSecondary}>
                  {(!editingOrder || isTechOrAdmin) ? 'Cancelar' : 'Fechar'}
                </button>
                {(!editingOrder || isTechOrAdmin) && (
                  <button type="submit" style={styles.btnPrimary}>
                    {editingOrder ? 'Salvar' : 'Salvar'}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: NOVO / EDITAR EQUIPAMENTO */}
      {showEquipmentModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>
                {editingEquipment ? `Editar: ${editingEquipment.code}` : 'Novo Equipamento'}
              </h3>
              <button onClick={() => setShowEquipmentModal(false)} style={styles.closeBtn}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveEquipment} style={styles.formGrid}>
              <div style={styles.formRow2}>
                <div style={styles.formField}>
                  <label style={styles.label}>Patrimônio</label>
                  <input 
                    type="text" 
                    placeholder="Ex: PAT-00105 ou código de barra"
                    value={eqForm.code}
                    onChange={(e) => setEqForm({ ...eqForm, code: e.target.value })}
                    style={styles.input}
                  />
                </div>

                <div style={styles.formField}>
                  <label style={styles.label}>Equipamento *</label>
                  <input 
                    type="text" 
                    placeholder="Ex: Máquina de Hemodiálise, Gerador, Osmose..."
                    value={eqForm.name}
                    onChange={(e) => setEqForm({ ...eqForm, name: e.target.value })}
                    style={styles.input}
                    required
                  />
                </div>
              </div>

              <div style={styles.formRow2}>
                <div style={styles.formField}>
                  <label style={styles.label}>Categoria *</label>
                  <select 
                    value={eqForm.category} 
                    onChange={(e) => setEqForm({ ...eqForm, category: e.target.value })}
                    style={styles.input}
                  >
                    <option value="Biomédico">Biomédico</option>
                    <option value="Infraestrutura">Infraestrutura</option>
                  </select>
                </div>

                <div style={styles.formField}>
                  <label style={styles.label}>Setor *</label>
                  <select 
                    value={sectorOptions.includes(eqForm.sector) ? eqForm.sector : (eqForm.sector ? 'Outro' : '')}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === 'Outro') {
                        setEqForm({ ...eqForm, sector: '' });
                        setIsCustomSector(true);
                      } else {
                        setEqForm({ ...eqForm, sector: val });
                        setIsCustomSector(false);
                      }
                    }}
                    style={styles.input}
                    required={!isCustomSector}
                  >
                    <option value="">Selecione o setor...</option>
                    {sectorOptions.map(sec => (
                      <option key={sec} value={sec}>{sec}</option>
                    ))}
                    <option value="Outro">Outro (Digitar setor personalizado...)</option>
                  </select>
                  {(isCustomSector || (eqForm.sector && !sectorOptions.includes(eqForm.sector))) && (
                    <input 
                      type="text" 
                      placeholder="Digite o setor personalizado (Ex: Laboratório...)"
                      value={eqForm.sector}
                      onChange={(e) => setEqForm({ ...eqForm, sector: e.target.value })}
                      style={{ ...styles.input, marginTop: '0.4rem' }}
                      required
                    />
                  )}
                </div>
              </div>

              <div style={styles.formRow2}>
                <div style={styles.formField}>
                  <label style={styles.label}>Marca</label>
                  <input 
                    type="text" 
                    placeholder="Ex: Nipro, Fresenius, Stemac, Deltamed..."
                    value={eqForm.brand}
                    onChange={(e) => setEqForm({ ...eqForm, brand: e.target.value })}
                    style={styles.input}
                  />
                </div>

                <div style={styles.formField}>
                  <label style={styles.label}>Modelo</label>
                  <input 
                    type="text" 
                    placeholder="Ex: 4008S, Diamax 220F, ST-250KVA..."
                    value={eqForm.model}
                    onChange={(e) => setEqForm({ ...eqForm, model: e.target.value })}
                    style={styles.input}
                  />
                </div>
              </div>

              <div style={styles.formRow2}>
                <div style={styles.formField}>
                  <label style={styles.label}>Série</label>
                  <input 
                    type="text" 
                    placeholder="Número de série de fábrica"
                    value={eqForm.serialNumber}
                    onChange={(e) => setEqForm({ ...eqForm, serialNumber: e.target.value })}
                    style={styles.input}
                  />
                </div>

                <div style={styles.formField}>
                  <label style={styles.label}>Intervalo (Dias)</label>
                  <input 
                    type="number" 
                    placeholder="Ex: 90"
                    value={eqForm.preventiveIntervalDays}
                    onChange={(e) => setEqForm({ ...eqForm, preventiveIntervalDays: Number(e.target.value) })}
                    style={styles.input}
                  />
                </div>
              </div>

              <div style={styles.formRow2}>
                <div style={styles.formField}>
                  <label style={styles.label}>Preventiva</label>
                  <input 
                    type="date" 
                    value={eqForm.nextPreventiveDate}
                    onChange={(e) => setEqForm({ ...eqForm, nextPreventiveDate: e.target.value })}
                    style={styles.input}
                  />
                </div>

                <div style={styles.formField}>
                  <label style={styles.label}>Status</label>
                  <select 
                    value={eqForm.status} 
                    onChange={(e) => setEqForm({ ...eqForm, status: e.target.value })}
                    style={styles.input}
                  >
                    <option value="Em Operação">Em Operação</option>
                    <option value="Em Manutenção">Em Manutenção</option>
                    <option value="Inoperante">Inoperante</option>
                    <option value="Desativado">Desativado</option>
                  </select>
                </div>
              </div>

              <div style={styles.modalFooter}>
                <button type="button" onClick={() => setShowEquipmentModal(false)} style={styles.btnSecondary}>
                  Cancelar
                </button>
                <button type="submit" style={styles.btnPrimary}>
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: HISTÓRICO RASTREÁVEL DO EQUIPAMENTO */}
      {showHistoryModal && selectedEqHistory && (
        <div style={styles.modalOverlay}>
          <div style={{ ...styles.modalContent, maxWidth: '750px' }}>
            <div style={styles.modalHeader}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#0891b2' }}>{selectedEqHistory.code}</span>
                <h3 style={styles.modalTitle}>Histórico Rastreável de Manutenção: {selectedEqHistory.name}</h3>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button onClick={() => handleGenerateEquipmentPdf(selectedEqHistory)} style={styles.btnPrimary} title="Gerar PDF / Imprimir Prontuário Técnico">
                  <Printer size={15} /> Gerar PDF
                </button>
                <button onClick={() => setShowHistoryModal(false)} style={styles.closeBtn}>
                  <X size={20} />
                </button>
              </div>
            </div>

            <div style={{ padding: '1rem 0' }}>
              <div style={{ display: 'flex', gap: '1rem', background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Modelo:</span>
                  <div style={{ fontSize: '0.85rem', fontWeight: '600' }}>{selectedEqHistory.brand} {selectedEqHistory.model}</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Setor:</span>
                  <div style={{ fontSize: '0.85rem', fontWeight: '600' }}>{selectedEqHistory.sector}</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Status:</span>
                  <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#0891b2' }}>{selectedEqHistory.status}</div>
                </div>
              </div>

              <h4 style={{ fontSize: '0.9rem', fontWeight: '700', marginBottom: '0.75rem', color: '#334155' }}>
                Timeline de Ordens de Serviço Registradas:
              </h4>

              {serviceOrders.filter(o => o.equipmentId === selectedEqHistory.id).length === 0 ? (
                <p style={{ fontSize: '0.85rem', color: '#94a3b8', fontStyle: 'italic' }}>Nenhuma Ordem de Serviço registrada para este equipamento até o momento.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {serviceOrders.filter(o => o.equipmentId === selectedEqHistory.id).map(os => (
                    <div key={os.id} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.75rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                        <span style={{ fontWeight: '700', color: '#0f172a' }}>{os.code} ({os.type})</span>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{new Date(os.openDate).toLocaleDateString('pt-BR')}</span>
                      </div>
                      <p style={{ fontSize: '0.85rem', color: '#334155', margin: '0.2rem 0' }}><strong>Sintoma:</strong> {os.description}</p>
                      {os.diagnostic && (
                        <p style={{ fontSize: '0.85rem', color: '#166534', backgroundColor: '#f0fdf4', padding: '0.4rem', borderRadius: '4px', marginTop: '0.4rem' }}>
                          <strong>Laudo Técnico:</strong> {os.diagnostic}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ETIQUETA PATRIMONIAL COM QR CODE */}
      {showQrModal && selectedEqQr && (
        <div style={styles.modalOverlay}>
          <div style={{ ...styles.modalContent, maxWidth: '450px', textAlign: 'center' }}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Etiqueta Patrimonial</h3>
              <button onClick={() => setShowQrModal(false)} style={styles.closeBtn}>
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '1rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ border: '2px solid #0f172a', borderRadius: '12px', padding: '1.25rem', background: '#fff', boxShadow: '0 4px 14px rgba(0,0,0,0.08)', width: '100%', boxSizing: 'border-box' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#0891b2', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.4rem', marginBottom: '0.6rem' }}>
                  NexaCLINIC • Engenharia Clínica
                </div>

                <div style={{ background: '#f8fafc', borderRadius: '8px', padding: '0.75rem', display: 'flex', justifyContent: 'center', marginBottom: '0.75rem' }}>
                  {qrDataUrl ? (
                    <img 
                      src={qrDataUrl} 
                      alt={`QR Code ${selectedEqQr.code}`}
                      width={210}
                      height={210}
                      style={{ display: 'block', borderRadius: '4px' }}
                    />
                  ) : (
                    <div style={{ width: '210px', height: '210px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                      <RefreshCw size={24} className="spin" />
                    </div>
                  )}
                </div>

                <div style={{ fontSize: '1.25rem', fontWeight: '900', color: '#0f172a' }}>
                  {selectedEqQr.code}
                </div>
                <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#1e293b', marginTop: '0.2rem' }}>
                  {selectedEqQr.name}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.2rem' }}>
                  Setor: <strong>{selectedEqQr.sector}</strong> {selectedEqQr.serialNumber ? `• Série: ${selectedEqQr.serialNumber}` : ''}
                </div>

                <div style={{ fontSize: '0.72rem', fontWeight: '700', color: '#0891b2', textTransform: 'uppercase', marginTop: '0.6rem', letterSpacing: '0.3px' }}>
                  Aponte a Câmera para Abrir Chamado
                </div>
              </div>

              <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '0.85rem 0 1rem', lineHeight: '1.4' }}>
                Qualquer pessoa com smartphone pode escanear esta etiqueta no salão para relatar defeitos e abrir chamados diretamente.
              </p>

              <div style={{ display: 'flex', gap: '0.5rem', width: '100%', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button 
                  onClick={() => handlePrintAssetTag(selectedEqQr, qrDataUrl)}
                  style={{ ...styles.btnPrimary, display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', padding: '0.5rem 0.85rem' }}
                >
                  <Printer size={15} /> Imprimir Etiqueta
                </button>
                <button 
                  onClick={() => {
                    const targetUrl = `${window.location.origin}/?chamado_equipamento=${encodeURIComponent(selectedEqQr.id)}`;
                    navigator.clipboard.writeText(targetUrl);
                    setCopiedLink(true);
                    setTimeout(() => setCopiedLink(false), 2500);
                  }}
                  style={{ ...styles.btnSecondary, display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', padding: '0.5rem 0.85rem', color: copiedLink ? '#15803d' : '#334155' }}
                >
                  {copiedLink ? <Check size={15} color="#15803d" /> : <Copy size={15} />}
                  {copiedLink ? 'Link Copiado!' : 'Copiar Link'}
                </button>
                <button 
                  onClick={() => {
                    const targetUrl = `${window.location.origin}/?chamado_equipamento=${encodeURIComponent(selectedEqQr.id)}`;
                    window.open(targetUrl, '_blank');
                  }}
                  style={{ ...styles.btnSecondary, display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', padding: '0.5rem 0.85rem' }}
                  title="Abrir página de chamado em nova aba para testar"
                >
                  <ExternalLink size={15} /> Testar Chamado
                </button>
                {qrDataUrl && (
                  <a 
                    href={qrDataUrl}
                    download={`QR_${selectedEqQr.code}.png`}
                    style={{ ...styles.btnSecondary, display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', padding: '0.5rem 0.85rem', textDecoration: 'none' }}
                  >
                    <Download size={15} /> Baixar QR
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '1.5rem',
    maxWidth: '1300px',
    margin: '0 auto',
    fontFamily: 'Inter, system-ui, sans-serif'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
    flexWrap: 'wrap',
    gap: '1rem'
  },
  headerTitleBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem'
  },
  headerIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    backgroundColor: '#0891b2',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 10px rgba(8, 145, 178, 0.25)'
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: '800',
    color: '#0f172a',
    margin: 0
  },
  subtitle: {
    fontSize: '0.85rem',
    color: '#64748b',
    margin: 0
  },
  headerActions: {
    display: 'flex',
    gap: '0.5rem'
  },
  btnPrimary: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    backgroundColor: '#0891b2',
    color: '#fff',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    fontWeight: '600',
    fontSize: '0.85rem',
    cursor: 'pointer'
  },
  btnSecondary: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    backgroundColor: '#ffffff',
    color: '#334155',
    border: '1px solid #cbd5e1',
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    fontWeight: '600',
    fontSize: '0.85rem',
    cursor: 'pointer'
  },
  alert: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    marginBottom: '1rem',
    fontWeight: '600',
    fontSize: '0.85rem'
  },
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '1rem',
    marginBottom: '1.5rem'
  },
  kpiCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '1rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
  },
  kpiHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.5rem'
  },
  kpiLabel: {
    fontSize: '0.8rem',
    fontWeight: '600',
    color: '#64748b'
  },
  kpiValue: {
    fontSize: '1.5rem',
    fontWeight: '800',
    color: '#0f172a'
  },
  kpiSub: {
    fontSize: '0.75rem',
    color: '#94a3b8'
  },
  tabContainer: {
    display: 'flex',
    gap: '0.5rem',
    borderBottom: '2px solid #e2e8f0',
    marginBottom: '1rem'
  },
  tabButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    padding: '0.6rem 1rem',
    border: 'none',
    background: 'none',
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#64748b',
    cursor: 'pointer',
    borderBottom: '2px solid transparent',
    marginBottom: '-2px'
  },
  tabActive: {
    color: '#0891b2',
    borderBottom: '2px solid #0891b2'
  },
  filterBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '1.25rem',
    flexWrap: 'wrap'
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    backgroundColor: '#ffffff',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    padding: '0.4rem 0.75rem',
    flex: '1',
    minWidth: '250px'
  },
  searchInput: {
    border: 'none',
    outline: 'none',
    width: '100%',
    fontSize: '0.85rem'
  },
  filterGroup: {
    display: 'flex',
    gap: '0.5rem'
  },
  selectFilter: {
    backgroundColor: '#ffffff',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    padding: '0.4rem 0.6rem',
    fontSize: '0.8rem',
    outline: 'none',
    color: '#334155'
  },
  tableContainer: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left'
  },
  th: {
    backgroundColor: '#f8fafc',
    color: '#475569',
    fontSize: '0.75rem',
    fontWeight: '700',
    textTransform: 'uppercase',
    padding: '0.75rem 1rem',
    borderBottom: '1px solid #e2e8f0'
  },
  tr: {
    borderBottom: '1px solid #f1f5f9'
  },
  td: {
    padding: '0.75rem 1rem',
    fontSize: '0.85rem'
  },
  badge: {
    display: 'inline-block',
    padding: '0.2rem 0.5rem',
    borderRadius: '12px',
    fontSize: '0.7rem',
    fontWeight: '700'
  },
  categoryBadge: {
    backgroundColor: '#ecfeff',
    color: '#0891b2',
    border: '1px solid #cffaff',
    padding: '0.2rem 0.5rem',
    borderRadius: '12px',
    fontSize: '0.7rem',
    fontWeight: '700'
  },
  actionBtn: {
    background: '#f1f5f9',
    border: 'none',
    borderRadius: '6px',
    padding: '0.35rem',
    cursor: 'pointer'
  },
  eqGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '1.25rem'
  },
  eqCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
  },
  eqCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '0.75rem'
  },
  eqCode: {
    fontSize: '0.75rem',
    fontWeight: '800',
    color: '#0891b2'
  },
  eqTitle: {
    fontSize: '1rem',
    fontWeight: '700',
    color: '#0f172a',
    margin: 0
  },
  eqCardBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem',
    fontSize: '0.8rem',
    color: '#475569',
    marginBottom: '1rem'
  },
  eqInfoRow: {
    display: 'flex',
    justifyContent: 'space-between'
  },
  eqInfoLabel: {
    color: '#94a3b8'
  },
  eqCardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '0.75rem',
    borderTop: '1px solid #f1f5f9'
  },
  btnCardAction: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.2rem',
    background: '#f8fafc',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    padding: '0.3rem 0.5rem',
    fontSize: '0.75rem',
    fontWeight: '600',
    color: '#475569',
    cursor: 'pointer'
  },
  btnCardPrimary: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.2rem',
    background: '#0891b2',
    border: 'none',
    borderRadius: '6px',
    padding: '0.3rem 0.6rem',
    fontSize: '0.75rem',
    fontWeight: '600',
    color: '#fff',
    cursor: 'pointer'
  },
  loadingBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '3rem'
  },
  emptyBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '3rem',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px dashed #cbd5e1'
  },
  cardContainer: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '1.25rem'
  },
  preventiveList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem'
  },
  preventiveItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    padding: '0.75rem 1rem'
  },
  kpiContainer: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '1.25rem'
  },
  biCard: {
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '1rem',
    backgroundColor: '#fafafa'
  },
  biTitle: {
    fontSize: '0.9rem',
    fontWeight: '700',
    color: '#334155',
    marginBottom: '0.75rem'
  },
  biValueBox: {
    display: 'flex',
    justifyContent: 'space-around'
  },
  biLabel: {
    fontSize: '0.75rem',
    color: '#64748b'
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '1rem'
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '1.5rem',
    width: '100%',
    maxWidth: '650px',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
    borderBottom: '1px solid #f1f5f9',
    paddingBottom: '0.75rem'
  },
  modalTitle: {
    fontSize: '1.1rem',
    fontWeight: '700',
    color: '#0f172a',
    margin: 0
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#64748b'
  },
  formGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.85rem'
  },
  formRow2: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '0.85rem'
  },
  formField: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem'
  },
  label: {
    fontSize: '0.8rem',
    fontWeight: '600',
    color: '#334155'
  },
  input: {
    padding: '0.5rem',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    fontSize: '0.85rem',
    outline: 'none'
  },
  textarea: {
    padding: '0.5rem',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    fontSize: '0.85rem',
    outline: 'none',
    fontFamily: 'inherit'
  },
  modalFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.5rem',
    marginTop: '1rem',
    paddingTop: '0.75rem',
    borderTop: '1px solid #f1f5f9'
  }
};
