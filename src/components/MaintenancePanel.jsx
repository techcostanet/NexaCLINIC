import React, { useState, useEffect, useMemo } from 'react';
import { dbService } from '../firebase';
import { 
  Wrench, Plus, Search, Filter, X, FileText, CheckCircle2, 
  AlertTriangle, Clock, Trash2, Edit, AlertCircle, HardDrive, 
  ShieldAlert, Calendar, BarChart3, QrCode, Cpu, Laptop, Layers, 
  ChevronRight, RefreshCw, Check, AlertOctagon, Activity, DollarSign,
  User, CheckSquare, Eye, Printer, ShieldCheck
} from 'lucide-react';

export default function MaintenancePanel({ currentUser }) {
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'equipments' | 'calendar' | 'kpi'
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

  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedEqHistory, setSelectedEqHistory] = useState(null);

  const [showQrModal, setShowQrModal] = useState(false);
  const [selectedEqQr, setSelectedEqQr] = useState(null);

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
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [eqList, osList, itemsList] = await Promise.all([
        dbService.getEquipments ? dbService.getEquipments() : [],
        dbService.getServiceOrders ? dbService.getServiceOrders() : [],
        dbService.getInventoryItems ? dbService.getInventoryItems() : []
      ]);

      setEquipments(eqList || []);
      setServiceOrders(osList || []);
      setStockItems(itemsList || []);
    } catch (err) {
      console.error('Erro ao carregar dados de Manutenção & TI:', err);
      showAlert('Erro ao carregar dados do módulo de Manutenção.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 4000);
  };

  // KPI Calculations
  const kpis = useMemo(() => {
    const totalEq = equipments.length;
    const bioEq = equipments.filter(e => e.category === 'Biomédico').length;
    const tiEq = equipments.filter(e => e.category?.startsWith('TI')).length;
    const predEq = equipments.filter(e => e.category === 'Infraestrutura').length;
    const inopEq = equipments.filter(e => e.status === 'Inoperante' || e.status === 'Em Manutenção').length;

    const openOrders = serviceOrders.filter(o => o.status === 'Aberta' || o.status === 'Em Diagnóstico' || o.status === 'Em Execução').length;
    const completedOrders = serviceOrders.filter(o => o.status === 'Concluída' || o.status === 'Encerrada').length;
    
    // Total spent on maintenance
    const totalCost = serviceOrders.reduce((sum, o) => sum + (Number(o.totalCost) || 0), 0);

    // Preventive compliance
    const todayStr = new Date().toISOString().split('T')[0];
    const overduePreventives = equipments.filter(e => e.nextPreventiveDate && e.nextPreventiveDate < todayStr).length;

    return { totalEq, bioEq, tiEq, predEq, inopEq, openOrders, completedOrders, totalCost, overduePreventives };
  }, [equipments, serviceOrders]);

  // Filtering Service Orders
  const filteredOrders = useMemo(() => {
    return serviceOrders.filter(order => {
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
  }, [serviceOrders, searchTerm, statusFilter, typeFilter, categoryFilter]);

  // Filtering Equipments
  const filteredEquipments = useMemo(() => {
    return equipments.filter(eq => {
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
  }, [equipments, searchTerm, categoryFilter, statusFilter]);

  // Handle Equipment Save
  const handleSaveEquipment = async (e) => {
    e.preventDefault();
    if (!eqForm.name.trim() || !eqForm.category) {
      showAlert('Preencha o nome e a categoria do equipamento.', 'danger');
      return;
    }

    try {
      const payload = {
        ...eqForm,
        id: editingEquipment ? editingEquipment.id : undefined,
        code: eqForm.code.trim() || `PAT-${Math.floor(1000 + Math.random() * 9000)}`
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

    const selectedEq = equipments.find(e => e.id === orderForm.equipmentId);
    
    // Calculate total cost (labor + parts)
    const partsTotal = orderForm.partsUsed.reduce((acc, p) => acc + (Number(p.unitCost || 0) * Number(p.quantity || 1)), 0);
    const totalCost = partsTotal + Number(orderForm.laborCost || 0);

    const payload = {
      ...orderForm,
      id: editingOrder ? editingOrder.id : undefined,
      equipmentName: selectedEq ? selectedEq.name : 'Equipamento não especificado',
      equipmentCategory: selectedEq ? selectedEq.category : 'Outros',
      sector: selectedEq ? selectedEq.sector : orderForm.requesterSector,
      totalCost,
      completionDate: (orderForm.status === 'Concluída' || orderForm.status === 'Encerrada') ? new Date().toISOString() : null
    };

    try {
      await dbService.saveServiceOrder(payload);
      
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

      showAlert(`Ordem de Serviço ${editingOrder ? 'atualizada' : 'aberta'} com sucesso!`, 'success');
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
      requesterSector: eq ? eq.sector : 'Geral',
      assignedTechnician: '',
      description: '',
      diagnostic: '',
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
      requesterName: os.requesterName || '',
      requesterSector: os.requesterSector || '',
      assignedTechnician: os.assignedTechnician || '',
      description: os.description || '',
      diagnostic: os.diagnostic || '',
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
    setShowEquipmentModal(true);
  };

  const handleOpenEditEquipment = (eq) => {
    setEditingEquipment(eq);
    setEqForm({ ...eq });
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

  const handleOpenQr = (eq) => {
    setSelectedEqQr(eq);
    setShowQrModal(true);
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
            <h1 style={styles.title}>NexaSERVICE - Manutenção & TI</h1>
            <p style={styles.subtitle}>
              Gestão integrada de Ativos Hospitalares, Engenharia Clínica, Equipamentos Prediais e Suporte de TI (Hardware & Software)
            </p>
          </div>
        </div>

        <div style={styles.headerActions}>
          <button onClick={() => handleOpenNewOrder()} style={styles.btnPrimary}>
            <Plus size={16} /> Nova Ordem de Serviço
          </button>
          <button onClick={handleOpenNewEquipment} style={styles.btnSecondary}>
            <HardDrive size={16} /> Novo Equipamento
          </button>
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
      <div style={styles.kpiGrid}>
        <div style={styles.kpiCard}>
          <div style={styles.kpiHeader}>
            <span style={styles.kpiLabel}>Total de Ativos</span>
            <HardDrive size={18} color="#0891b2" />
          </div>
          <div style={styles.kpiValue}>{kpis.totalEq}</div>
          <span style={styles.kpiSub}>Bio: {kpis.bioEq} | TI: {kpis.tiEq} | Predial: {kpis.predEq}</span>
        </div>

        <div style={styles.kpiCard}>
          <div style={styles.kpiHeader}>
            <span style={styles.kpiLabel}>OS em Aberto / Andamento</span>
            <Clock size={18} color="#f59e0b" />
          </div>
          <div style={{ ...styles.kpiValue, color: '#f59e0b' }}>{kpis.openOrders}</div>
          <span style={styles.kpiSub}>{kpis.completedOrders} Ordens Concluídas</span>
        </div>

        <div style={styles.kpiCard}>
          <div style={styles.kpiHeader}>
            <span style={styles.kpiLabel}>Equipamentos em Manutenção</span>
            <AlertTriangle size={18} color="#ef4444" />
          </div>
          <div style={{ ...styles.kpiValue, color: '#ef4444' }}>{kpis.inopEq}</div>
          <span style={styles.kpiSub}>{kpis.overduePreventives} Preventivas Atrasadas</span>
        </div>

        <div style={styles.kpiCard}>
          <div style={styles.kpiHeader}>
            <span style={styles.kpiLabel}>Custo Acumulado Manutenção</span>
            <DollarSign size={18} color="#10b981" />
          </div>
          <div style={{ ...styles.kpiValue, color: '#10b981' }}>
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(kpis.totalCost)}
          </div>
          <span style={styles.kpiSub}>Peças + Serviços Terceiros</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={styles.tabContainer}>
        <button 
          style={{ ...styles.tabButton, ...(activeTab === 'orders' ? styles.tabActive : {}) }}
          onClick={() => setActiveTab('orders')}
        >
          <FileText size={16} /> Ordens de Serviço ({serviceOrders.length})
        </button>
        <button 
          style={{ ...styles.tabButton, ...(activeTab === 'equipments' ? styles.tabActive : {}) }}
          onClick={() => setActiveTab('equipments')}
        >
          <HardDrive size={16} /> Equipamentos & Ativos ({equipments.length})
        </button>
        <button 
          style={{ ...styles.tabButton, ...(activeTab === 'calendar' ? styles.tabActive : {}) }}
          onClick={() => setActiveTab('calendar')}
        >
          <Calendar size={16} /> Cronograma de Preventivas
        </button>
        <button 
          style={{ ...styles.tabButton, ...(activeTab === 'kpi' ? styles.tabActive : {}) }}
          onClick={() => setActiveTab('kpi')}
        >
          <BarChart3 size={16} /> Indicadores & BI
        </button>
      </div>

      {/* Search and Filters Bar */}
      <div style={styles.filterBar}>
        <div style={styles.searchBox}>
          <Search size={16} color="#94a3b8" />
          <input 
            type="text" 
            placeholder={activeTab === 'orders' ? "Buscar por código da OS, equipamento, problema..." : "Buscar por patrimônio, nome, marca, setor..."}
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
            <option value="all">Todas Categoria (Biomédico, TI, Predial)</option>
            <option value="Biomédico">Biomédico & Clínico</option>
            <option value="TI Hardware">TI - Hardware</option>
            <option value="TI Software">TI - Software & Licenças</option>
            <option value="Infraestrutura">Infraestrutura & Predial</option>
          </select>

          {activeTab === 'orders' && (
            <select 
              value={typeFilter} 
              onChange={(e) => setTypeFilter(e.target.value)}
              style={styles.selectFilter}
            >
              <option value="all">Todos os Tipos de OS</option>
              <option value="Corretiva">Corretiva</option>
              <option value="Preventiva">Preventiva</option>
              <option value="Calibração">Calibração / Preditiva</option>
              <option value="TI - Hardware">TI - Hardware</option>
              <option value="TI - Software">TI - Software</option>
              <option value="Instalação">Instalação / Comissionamento</option>
            </select>
          )}

          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            style={styles.selectFilter}
          >
            <option value="all">Todos os Status</option>
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
          ) : (
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Código OS</th>
                    <th style={styles.th}>Equipamento / Ativo</th>
                    <th style={styles.th}>Categoria</th>
                    <th style={styles.th}>Tipo & Prioridade</th>
                    <th style={styles.th}>Solicitante / Setor</th>
                    <th style={styles.th}>Técnico Responsável</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map(order => {
                    const statusBadge = getStatusBadgeStyle(order.status);
                    return (
                      <tr key={order.id} style={styles.tr}>
                        <td style={styles.td}>
                          <span style={{ fontWeight: '700', color: '#0f172a' }}>{order.code}</span>
                          <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                            {new Date(order.openDate).toLocaleDateString('pt-BR')}
                          </div>
                        </td>
                        <td style={styles.td}>
                          <div style={{ fontWeight: '600', color: '#1e293b' }}>{order.equipmentName}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{order.sector}</div>
                        </td>
                        <td style={styles.td}>
                          <span style={styles.categoryBadge}>{order.equipmentCategory}</span>
                        </td>
                        <td style={styles.td}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                            <span style={{ fontSize: '0.8rem', fontWeight: '600', color: '#475569' }}>{order.type}</span>
                            {getPriorityBadge(order.priority)}
                          </div>
                        </td>
                        <td style={styles.td}>
                          <div style={{ fontSize: '0.85rem', color: '#334155' }}>{order.requesterName}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{order.requesterSector}</div>
                        </td>
                        <td style={styles.td}>
                          <div style={{ fontSize: '0.85rem', fontWeight: '500', color: '#0891b2' }}>
                            {order.assignedTechnician || 'Aguardando atribuição'}
                          </div>
                        </td>
                        <td style={styles.td}>
                          <span style={{ ...styles.badge, backgroundColor: statusBadge.bg, color: statusBadge.text, border: `1px solid ${statusBadge.border}` }}>
                            {order.status}
                          </span>
                        </td>
                        <td style={styles.td}>
                          <div style={{ display: 'flex', gap: '0.4rem' }}>
                            <button 
                              onClick={() => handleOpenEditOrder(order)} 
                              style={styles.actionBtn}
                              title="Editar OS / Laudo Técnico"
                            >
                              <Edit size={15} color="#0284c7" />
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
          ) : (
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
                        <span style={styles.eqInfoLabel}>Marca / Modelo:</span>
                        <span>{eq.brand} - {eq.model}</span>
                      </div>
                      <div style={styles.eqInfoRow}>
                        <span style={styles.eqInfoLabel}>Nº de Série:</span>
                        <span>{eq.serialNumber || 'N/A'}</span>
                      </div>
                      <div style={styles.eqInfoRow}>
                        <span style={styles.eqInfoLabel}>Setor / Sala:</span>
                        <span style={{ fontWeight: '600', color: '#334155' }}>{eq.sector}</span>
                      </div>
                      <div style={styles.eqInfoRow}>
                        <span style={styles.eqInfoLabel}>Próxima Preventiva:</span>
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
                          <QrCode size={14} /> Tag QR
                        </button>
                      </div>

                      <div style={{ display: 'flex', gap: '0.3rem' }}>
                        <button onClick={() => handleOpenNewOrder(eq)} style={styles.btnCardPrimary} title="Abrir OS para este equipamento">
                          <Wrench size={14} /> Abrir OS
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
          )}
        </div>
      )}

      {/* TAB CONTENT 3: CALENDAR & PREVENTIVES */}
      {activeTab === 'calendar' && (
        <div style={styles.cardContainer}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Calendar size={20} color="#0891b2" />
            <h2 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0f172a' }}>
              Cronograma de Manutenções Preventivas & Calibrações
            </h2>
          </div>

          <div style={styles.preventiveList}>
            {equipments.map(eq => {
              const isOverdue = eq.nextPreventiveDate && eq.nextPreventiveDate < new Date().toISOString().split('T')[0];
              return (
                <div key={eq.id} style={{ ...styles.preventiveItem, borderLeft: isOverdue ? '4px solid #ef4444' : '4px solid #10b981' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b' }}>{eq.code} • {eq.category}</span>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#1e293b', margin: '0.1rem 0' }}>{eq.name}</h4>
                    <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Local: {eq.sector} | Periodicidade: Cada {eq.preventiveIntervalDays || 90} dias</p>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: '600', color: isOverdue ? '#ef4444' : '#166534' }}>
                      {isOverdue ? 'PREVENTIVA ATRASADA!' : 'Próxima Preventiva:'}
                    </div>
                    <div style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a' }}>
                      {eq.nextPreventiveDate ? new Date(eq.nextPreventiveDate + 'T00:00:00').toLocaleDateString('pt-BR') : 'Não definida'}
                    </div>
                    <button onClick={() => handleOpenNewOrder(eq)} style={{ ...styles.btnPrimary, padding: '0.25rem 0.5rem', fontSize: '0.75rem', marginTop: '0.4rem' }}>
                      <Wrench size={12} /> Agendar OS Preventiva
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB CONTENT 4: KPI & BI DASHBOARD */}
      {activeTab === 'kpi' && (
        <div style={styles.kpiContainer}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0f172a', marginBottom: '1rem' }}>
            Indicadores de Desempenho (BI Manutenção & TI)
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
              <h3 style={styles.biTitle}>SLA de Atendimento T.I.</h3>
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

      {/* MODAL: NOVA / EDITAR ORDEM DE SERVIÇO */}
      {showOrderModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>
                {editingOrder ? `Editar OS: ${editingOrder.code}` : 'Nova Ordem de Serviço'}
              </h3>
              <button onClick={() => setShowOrderModal(false)} style={styles.closeBtn}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveOrder} style={styles.formGrid}>
              <div style={styles.formField}>
                <label style={styles.label}>Equipamento / Ativo *</label>
                <select 
                  value={orderForm.equipmentId} 
                  onChange={(e) => setOrderForm({ ...orderForm, equipmentId: e.target.value })}
                  style={styles.input}
                  required
                >
                  <option value="">Selecione um equipamento cadastrado...</option>
                  {equipments.map(eq => (
                    <option key={eq.id} value={eq.id}>
                      [{eq.code}] {eq.name} ({eq.category} - {eq.sector})
                    </option>
                  ))}
                </select>
              </div>

              <div style={styles.formRow2}>
                <div style={styles.formField}>
                  <label style={styles.label}>Tipo de OS *</label>
                  <select 
                    value={orderForm.type} 
                    onChange={(e) => setOrderForm({ ...orderForm, type: e.target.value })}
                    style={styles.input}
                  >
                    <option value="Corretiva">Corretiva (Quebra/Falha)</option>
                    <option value="Preventiva">Preventiva (Revisão)</option>
                    <option value="Calibração">Calibração / Preditiva</option>
                    <option value="TI - Hardware">T.I. - Hardware</option>
                    <option value="TI - Software">T.I. - Software / Sistemas</option>
                    <option value="Instalação">Instalação / Comissionamento</option>
                  </select>
                </div>

                <div style={styles.formField}>
                  <label style={styles.label}>Prioridade / SLA *</label>
                  <select 
                    value={orderForm.priority} 
                    onChange={(e) => setOrderForm({ ...orderForm, priority: e.target.value })}
                    style={styles.input}
                  >
                    <option value="Baixa">Baixa (Até 48 horas)</option>
                    <option value="Média">Média (Até 24 horas)</option>
                    <option value="Alta">Alta (Até 8 horas)</option>
                    <option value="Crítico">Crítico / Parada (Até 2 horas)</option>
                  </select>
                </div>
              </div>

              <div style={styles.formRow2}>
                <div style={styles.formField}>
                  <label style={styles.label}>Status Atual da OS</label>
                  <select 
                    value={orderForm.status} 
                    onChange={(e) => setOrderForm({ ...orderForm, status: e.target.value })}
                    style={styles.input}
                  >
                    <option value="Aberta">Aberta (Aguardando Triagem)</option>
                    <option value="Em Diagnóstico">Em Diagnóstico</option>
                    <option value="Aguardando Peça">Aguardando Peça / Terceiro</option>
                    <option value="Em Execução">Em Execução</option>
                    <option value="Concluída">Concluída</option>
                  </select>
                </div>

                <div style={styles.formField}>
                  <label style={styles.label}>Técnico / Responsável</label>
                  <input 
                    type="text" 
                    placeholder="Nome do técnico ou empresa terceirizada"
                    value={orderForm.assignedTechnician}
                    onChange={(e) => setOrderForm({ ...orderForm, assignedTechnician: e.target.value })}
                    style={styles.input}
                  />
                </div>
              </div>

              <div style={styles.formField}>
                <label style={styles.label}>Descrição do Problema / Sintoma Reportado *</label>
                <textarea 
                  rows={3} 
                  placeholder="Relate detalhadamente o sintoma apresentado pelo equipamento..."
                  value={orderForm.description}
                  onChange={(e) => setOrderForm({ ...orderForm, description: e.target.value })}
                  style={styles.textarea}
                  required
                />
              </div>

              <div style={styles.formField}>
                <label style={styles.label}>Laudo Técnico / Diagnóstico da Solução</label>
                <textarea 
                  rows={3} 
                  placeholder="Causa raiz identificada, testes efetuados e laudo técnico da solução..."
                  value={orderForm.diagnostic}
                  onChange={(e) => setOrderForm({ ...orderForm, diagnostic: e.target.value })}
                  style={styles.textarea}
                />
              </div>

              <div style={styles.modalFooter}>
                <button type="button" onClick={() => setShowOrderModal(false)} style={styles.btnSecondary}>
                  Cancelar
                </button>
                <button type="submit" style={styles.btnPrimary}>
                  Salvar Ordem de Serviço
                </button>
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
                {editingEquipment ? `Editar Equipamento: ${editingEquipment.code}` : 'Novo Equipamento / Ativo'}
              </h3>
              <button onClick={() => setShowEquipmentModal(false)} style={styles.closeBtn}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveEquipment} style={styles.formGrid}>
              <div style={styles.formRow2}>
                <div style={styles.formField}>
                  <label style={styles.label}>Código / Patrimônio</label>
                  <input 
                    type="text" 
                    placeholder="Ex: PAT-00105 ou código de barra"
                    value={eqForm.code}
                    onChange={(e) => setEqForm({ ...eqForm, code: e.target.value })}
                    style={styles.input}
                  />
                </div>

                <div style={styles.formField}>
                  <label style={styles.label}>Nome do Equipamento *</label>
                  <input 
                    type="text" 
                    placeholder="Ex: Máquina de Hemodiálise, Servidor Dell..."
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
                    <option value="Biomédico">Biomédico & Clínico</option>
                    <option value="TI Hardware">TI - Hardware</option>
                    <option value="TI Software">TI - Software & Licença</option>
                    <option value="Infraestrutura">Infraestrutura & Predial</option>
                  </select>
                </div>

                <div style={styles.formField}>
                  <label style={styles.label}>Setor / Localização *</label>
                  <input 
                    type="text" 
                    placeholder="Ex: Salão A, Data Center, Recepção..."
                    value={eqForm.sector}
                    onChange={(e) => setEqForm({ ...eqForm, sector: e.target.value })}
                    style={styles.input}
                    required
                  />
                </div>
              </div>

              <div style={styles.formRow2}>
                <div style={styles.formField}>
                  <label style={styles.label}>Marca / Fabricante</label>
                  <input 
                    type="text" 
                    placeholder="Ex: Fresenius, Dell, Zebra..."
                    value={eqForm.brand}
                    onChange={(e) => setEqForm({ ...eqForm, brand: e.target.value })}
                    style={styles.input}
                  />
                </div>

                <div style={styles.formField}>
                  <label style={styles.label}>Modelo / Versão</label>
                  <input 
                    type="text" 
                    placeholder="Ex: 4008S, PowerEdge R750..."
                    value={eqForm.model}
                    onChange={(e) => setEqForm({ ...eqForm, model: e.target.value })}
                    style={styles.input}
                  />
                </div>
              </div>

              <div style={styles.formRow2}>
                <div style={styles.formField}>
                  <label style={styles.label}>Número de Série</label>
                  <input 
                    type="text" 
                    placeholder="Número de série de fábrica"
                    value={eqForm.serialNumber}
                    onChange={(e) => setEqForm({ ...eqForm, serialNumber: e.target.value })}
                    style={styles.input}
                  />
                </div>

                <div style={styles.formField}>
                  <label style={styles.label}>Frequência de Preventiva (Dias)</label>
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
                  <label style={styles.label}>Próxima Preventiva</label>
                  <input 
                    type="date" 
                    value={eqForm.nextPreventiveDate}
                    onChange={(e) => setEqForm({ ...eqForm, nextPreventiveDate: e.target.value })}
                    style={styles.input}
                  />
                </div>

                <div style={styles.formField}>
                  <label style={styles.label}>Status de Operação</label>
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
                  Salvar Equipamento
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
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Marca / Modelo:</span>
                  <div style={{ fontSize: '0.85rem', fontWeight: '600' }}>{selectedEqHistory.brand} {selectedEqHistory.model}</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Setor:</span>
                  <div style={{ fontSize: '0.85rem', fontWeight: '600' }}>{selectedEqHistory.sector}</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Status Operacional:</span>
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

      {/* MODAL: GENERATOR DE QR CODE */}
      {showQrModal && selectedEqQr && (
        <div style={styles.modalOverlay}>
          <div style={{ ...styles.modalContent, maxWidth: '400px', textAlign: 'center' }}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Tag QR Code de Patrimônio</h3>
              <button onClick={() => setShowQrModal(false)} style={styles.closeBtn}>
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '1.5rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ border: '3px solid #0f172a', borderRadius: '12px', padding: '1rem', background: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                <QrCode size={160} color="#0f172a" />
                <div style={{ fontSize: '1rem', fontWeight: '800', color: '#0f172a', marginTop: '0.5rem' }}>
                  {selectedEqQr.code}
                </div>
                <div style={{ fontSize: '0.8rem', fontWeight: '600', color: '#0891b2' }}>
                  {selectedEqQr.name}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                  Setor: {selectedEqQr.sector}
                </div>
              </div>
              <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '1rem' }}>
                Imprima esta etiqueta para colar fisicamente no equipamento. Ela permite leitura rápida por câmera para abertura instantânea de OS.
              </p>
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
