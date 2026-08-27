import React, { useState, useEffect, useMemo } from 'react';
import { dbService } from '../../firebase';
import { 
  Laptop, Plus, Search, Filter, X, FileText, CheckCircle2, 
  AlertTriangle, Clock, Trash2, Edit, AlertCircle, HardDrive, 
  ShieldAlert, Calendar, BarChart3, QrCode, Cpu, Layers, 
  ChevronRight, RefreshCw, Check, AlertOctagon, Activity, DollarSign, 
  List, LayoutGrid, User, Eye, Printer, ShieldCheck, HelpCircle,
  MessageSquare, Send, ArrowRight, Gauge, CheckSquare, Zap, Tag
} from 'lucide-react';

const IT_CATEGORIES = [
  { id: 'Hardware', name: 'Hardware', subcategories: ['Desktop', 'Notebook', 'Monitor', 'Nobreak', 'Teclado/Mouse', 'Fonte/Cabos', 'Outro'] },
  { id: 'Sistemas', name: 'Sistemas', subcategories: ['NexaCLINIC', 'Windows', 'Microsoft 365', 'Antivírus', 'Certificado Digital', 'Navegador', 'Outro'] },
  { id: 'Rede', name: 'Rede', subcategories: ['Wi-Fi', 'Cabo Desconectado', 'Lentidão', 'Queda de Link', 'Switch/Roteador', 'Outro'] },
  { id: 'Impressoras', name: 'Impressoras', subcategories: ['Zebra / Etiquetadora', 'Laser / Prescrição', 'Leitor de Barras', 'Scanner', 'Outro'] },
  { id: 'Acessos', name: 'Acessos', subcategories: ['Novo Usuário', 'Redefinição de Senha', 'Permissão de Módulo', 'E-mail Corporativo', 'Outro'] },
  { id: 'Telefonia', name: 'Telefonia', subcategories: ['Ramal VoIP', 'Aparelho Físico', 'Linha Muda', 'Outro'] },
  { id: 'Segurança', name: 'Segurança', subcategories: ['Arquivo Deletado', 'Suspeita de Vírus', 'Bloqueio de Segurança', 'Outro'] },
  { id: 'Servidores', name: 'Servidores', subcategories: ['Servidor Local', 'Banco de Dados', 'Backup', 'Outro'] },
  { id: 'Outros', name: 'Outros', subcategories: ['Dúvida Operacional', 'Treinamento', 'Melhoria', 'Geral'] }
];

const CLINIC_SECTORS = [
  "Recepção",
  "Salão A de Hemodiálise",
  "Salão B de Hemodiálise",
  "Salão C de Hemodiálise",
  "Posto de Enfermagem",
  "Consultório Médico",
  "Farmácia Clínica",
  "Laboratório",
  "Tratamento de Água (CTA)",
  "Reúso de Dialisadores",
  "Expurgo / CME",
  "Faturamento / APAC",
  "Financeiro",
  "Recursos Humanos (RH)",
  "Compras",
  "SESMT",
  "Diretoria",
  "Sala de Servidores",
  "Copa",
  "Geral"
];

const SLA_HOURS = {
  'Crítico': 2,
  'Alta': 8,
  'Média': 24,
  'Baixa': 48
};

export default function ITServiceOrdersTab({ 
  currentUser, 
  activeUnitId = 'all',
  filterByActiveUnit,
  onOpenNewOrderGlobal
}) {
  const [viewMode, setViewMode] = useState('compact'); // 'compact' | 'cards' | 'sla'
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sectorFilter, setSectorFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [slaFilter, setSlaFilter] = useState('all'); // 'all' | 'on_time' | 'warning' | 'overdue' | 'met'

  // Modals
  const [showNewModal, setShowNewModal] = useState(false);
  const [showManageModal, setShowManageModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newComment, setNewComment] = useState('');

  // Form State - New Order
  const [form, setForm] = useState({
    title: '',
    category: 'Hardware',
    subcategory: 'Desktop',
    sector: currentUser?.allowedSectors?.[0] ? currentUser.allowedSectors[0].charAt(0).toUpperCase() + currentUser.allowedSectors[0].slice(1) : 'Recepção',
    priority: 'Média',
    description: '',
    requesterName: currentUser?.name || 'Colaborador',
    requesterEmail: currentUser?.email || 'contato@techcosta.net',
    requesterSector: currentUser?.allowedSectors?.[0] || 'Geral',
    notifyEmail: true
  });

  // Form State - Management (T.I. / Admin)
  const [manageForm, setManageForm] = useState({
    status: 'Aberta',
    assignedTechnician: '',
    diagnostic: '',
    solutionApplied: '',
    priority: 'Média',
    totalCost: 0,
    partsUsed: [],
    updateNote: ''
  });

  // Check if current user is Tech / Admin
  const isTechOrAdmin = useMemo(() => {
    if (!currentUser) return false;
    if (currentUser.role === 'admin' || currentUser.role === 'technician' || currentUser.role === 'eng' || currentUser.role === 'master') return true;
    if (currentUser.email === 'contato@techcosta.net' || currentUser.email === 'admin@dialize.com.br') return true;
    const allowed = currentUser.allowedSectors || [];
    return allowed.some(sec => ['manutencao', 'engenharia', 'admin', 'ti'].includes(String(sec).toLowerCase()));
  }, [currentUser]);

  // Load and Subscribe to IT Service Orders
  useEffect(() => {
    setLoading(true);
    let unsub = () => {};

    if (dbService.subscribeToITServiceOrders) {
      unsub = dbService.subscribeToITServiceOrders((items) => {
        setOrders(items || []);
        setLoading(false);
      });
    } else {
      fetchOrders();
    }

    return () => {
      if (typeof unsub === 'function') unsub();
    };
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      if (dbService.getITServiceOrders) {
        const data = await dbService.getITServiceOrders();
        setOrders(data || []);
      }
    } catch (err) {
      console.error('Erro ao buscar ordens de serviço de T.I.:', err);
      showAlert('Erro ao carregar chamados de T.I.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 4500);
  };

  // Filter by Unit
  const unitFilteredOrders = useMemo(() => {
    if (typeof filterByActiveUnit === 'function') {
      return filterByActiveUnit(orders);
    }
    if (activeUnitId === 'all') return orders;
    return orders.filter(o => o.unitId === activeUnitId || !o.unitId);
  }, [orders, activeUnitId, filterByActiveUnit]);

  // Visibility / RBAC:
  // If standard user -> only their own orders
  // If admin/tech -> all orders
  const scopedOrders = useMemo(() => {
    if (isTechOrAdmin) return unitFilteredOrders;
    const uEmail = (currentUser?.email || '').trim().toLowerCase();
    const uName = (currentUser?.name || '').trim().toLowerCase();
    return unitFilteredOrders.filter(o => {
      const oEmail = (o.requesterEmail || '').trim().toLowerCase();
      const oName = (o.requesterName || '').trim().toLowerCase();
      return (uEmail && oEmail === uEmail) || (uName && oName === uName);
    });
  }, [unitFilteredOrders, isTechOrAdmin, currentUser]);

  // SLA Status Helper
  const getSlaStatus = (order) => {
    const isCompleted = ['Resolvida', 'Cancelada', 'Concluída'].includes(order.status);
    const deadline = order.slaDeadline ? new Date(order.slaDeadline).getTime() : 0;
    const now = Date.now();

    if (isCompleted) {
      const compDate = order.completionDate ? new Date(order.completionDate).getTime() : now;
      if (deadline > 0 && compDate <= deadline) {
        return { type: 'met', label: 'Cumprido', color: '#16a34a', bg: '#dcfce7', border: '#bbf7d0' };
      }
      return { type: 'overdue_resolved', label: 'Estourado', color: '#dc2626', bg: '#fee2e2', border: '#fca5a5' };
    }

    if (!deadline) {
      return { type: 'on_time', label: 'No Prazo', color: '#0284c7', bg: '#e0f2fe', border: '#bae6fd' };
    }

    const remainingMs = deadline - now;
    const remainingHours = remainingMs / (1000 * 60 * 60);

    if (remainingMs <= 0) {
      const overdueHours = Math.abs(Math.round(remainingHours));
      return { 
        type: 'overdue', 
        label: 'Atrasado', 
        badgeText: `Vencido (${overdueHours}h)`, 
        color: '#dc2626', 
        bg: '#fee2e2', 
        border: '#fca5a5',
        hours: remainingHours
      };
    }

    const totalHours = order.slaHours || SLA_HOURS[order.priority] || 24;
    const totalMs = totalHours * 3600 * 1000;
    const ratio = remainingMs / totalMs;

    if (ratio <= 0.25 || remainingHours <= 2) {
      return { 
        type: 'warning', 
        label: 'Alerta', 
        badgeText: `${Math.round(remainingHours)}h restantes`, 
        color: '#d97706', 
        bg: '#fef3c7', 
        border: '#fde68a',
        hours: remainingHours
      };
    }

    return { 
      type: 'on_time', 
      label: 'No Prazo', 
      badgeText: `${Math.round(remainingHours)}h restantes`, 
      color: '#0284c7', 
      bg: '#e0f2fe', 
      border: '#bae6fd',
      hours: remainingHours
    };
  };

  // Filtered Orders for UI
  const filteredOrders = useMemo(() => {
    return scopedOrders.filter(order => {
      const search = searchTerm.toLowerCase();
      const matchesSearch = 
        !search ||
        (order.code || '').toLowerCase().includes(search) ||
        (order.title || '').toLowerCase().includes(search) ||
        (order.description || '').toLowerCase().includes(search) ||
        (order.requesterName || '').toLowerCase().includes(search) ||
        (order.assignedTechnician || '').toLowerCase().includes(search) ||
        (order.sector || '').toLowerCase().includes(search);

      const matchesCat = categoryFilter === 'all' || order.category === categoryFilter;
      const matchesSector = sectorFilter === 'all' || order.sector === sectorFilter;
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || order.priority === priorityFilter;

      let matchesSla = true;
      if (slaFilter !== 'all') {
        const sla = getSlaStatus(order);
        if (slaFilter === 'on_time') matchesSla = sla.type === 'on_time';
        else if (slaFilter === 'warning') matchesSla = sla.type === 'warning';
        else if (slaFilter === 'overdue') matchesSla = sla.type === 'overdue';
        else if (slaFilter === 'met') matchesSla = sla.type === 'met';
      }

      return matchesSearch && matchesCat && matchesSector && matchesStatus && matchesPriority && matchesSla;
    });
  }, [scopedOrders, searchTerm, categoryFilter, sectorFilter, statusFilter, priorityFilter, slaFilter]);

  // SLA Dashboard Metrics
  const slaMetrics = useMemo(() => {
    const total = scopedOrders.length;
    const openOrders = scopedOrders.filter(o => !['Resolvida', 'Cancelada', 'Concluída'].includes(o.status));
    const resolvedOrders = scopedOrders.filter(o => ['Resolvida', 'Concluída'].includes(o.status));
    const criticalOrders = openOrders.filter(o => o.priority === 'Crítico');

    let onTimeCount = 0;
    let warningCount = 0;
    let overdueCount = 0;
    let metSlaCount = 0;
    let totalResolvedWithSla = 0;
    let totalResolutionTimeHours = 0;

    scopedOrders.forEach(o => {
      const sla = getSlaStatus(o);
      if (sla.type === 'on_time') onTimeCount++;
      if (sla.type === 'warning') warningCount++;
      if (sla.type === 'overdue') overdueCount++;
      if (sla.type === 'met') {
        metSlaCount++;
        totalResolvedWithSla++;
      }
      if (sla.type === 'overdue_resolved') {
        totalResolvedWithSla++;
      }

      if (o.completionDate && o.openDate) {
        const openTime = new Date(o.openDate).getTime();
        const compTime = new Date(o.completionDate).getTime();
        const diffHours = (compTime - openTime) / (1000 * 60 * 60);
        if (diffHours > 0) {
          totalResolutionTimeHours += diffHours;
        }
      }
    });

    const slaComplianceRate = totalResolvedWithSla > 0 
      ? Math.round((metSlaCount / totalResolvedWithSla) * 100) 
      : 100;

    const avgResolutionTime = resolvedOrders.length > 0
      ? (totalResolutionTimeHours / resolvedOrders.length).toFixed(1)
      : '0.0';

    return {
      total,
      openCount: openOrders.length,
      resolvedCount: resolvedOrders.length,
      criticalCount: criticalOrders.length,
      onTimeCount,
      warningCount,
      overdueCount,
      slaComplianceRate,
      avgResolutionTime
    };
  }, [scopedOrders]);

  // Handle Open New Order Modal
  const handleOpenNew = () => {
    setForm({
      title: '',
      category: 'Hardware',
      subcategory: 'Desktop',
      sector: 'Recepção',
      priority: 'Média',
      description: '',
      requesterName: currentUser?.name || 'Colaborador',
      requesterEmail: currentUser?.email || 'contato@techcosta.net',
      requesterSector: currentUser?.allowedSectors?.[0] || 'Geral',
      notifyEmail: true
    });
    setShowNewModal(true);
  };

  // Handle Save New Order
  const handleSaveNewOrder = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) {
      showAlert('Preencha o título e a descrição do problema.', 'danger');
      return;
    }

    try {
      const targetUnitId = activeUnitId === 'all' ? 'betim' : activeUnitId;
      const targetUnit = targetUnitId === 'taguatinga' ? 'Taguatinga' : 'Betim';

      const payload = {
        ...form,
        unitId: targetUnitId,
        unit: targetUnit,
        status: 'Aberta'
      };

      const saved = await dbService.saveITServiceOrder(payload, 'Chamado de T.I. aberto no sistema.', form.notifyEmail);
      showAlert(`✅ Chamado ${saved.code} registrado com sucesso! SLA: ${SLA_HOURS[form.priority]} horas.`, 'success');
      setShowNewModal(false);
      fetchOrders();
    } catch (err) {
      console.error('Erro ao abrir chamado de T.I.:', err);
      showAlert('Erro ao registrar chamado de T.I.', 'danger');
    }
  };

  // Handle Manage / View Order
  const handleOpenManage = (order) => {
    setSelectedOrder(order);
    setManageForm({
      status: order.status || 'Aberta',
      assignedTechnician: order.assignedTechnician || '',
      diagnostic: order.diagnostic || '',
      solutionApplied: order.solutionApplied || '',
      priority: order.priority || 'Média',
      totalCost: order.totalCost || 0,
      partsUsed: order.partsUsed || [],
      updateNote: ''
    });
    setNewComment('');
    setShowManageModal(true);
  };

  // Handle Save Management Changes
  const handleSaveManage = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;

    try {
      const payload = {
        ...selectedOrder,
        ...manageForm,
        lastUpdatedBy: currentUser?.name || 'Técnico T.I.'
      };

      const noteText = manageForm.updateNote || `Atualizado por ${currentUser?.name || 'Técnico'}. Status: ${manageForm.status}`;
      await dbService.saveITServiceOrder(payload, noteText, true);

      showAlert(`Ordem de Serviço ${selectedOrder.code} atualizada!`, 'success');
      setShowManageModal(false);
      setSelectedOrder(null);
      fetchOrders();
    } catch (err) {
      console.error('Erro ao atualizar chamado:', err);
      showAlert('Erro ao atualizar chamado.', 'danger');
    }
  };

  // Handle Add Timeline Comment
  const handleAddComment = async () => {
    if (!newComment.trim() || !selectedOrder) return;
    try {
      const now = new Date().toISOString();
      const updatedLogs = [
        {
          id: `log-${Date.now()}`,
          date: now,
          author: currentUser?.name || 'Usuário',
          status: selectedOrder.status,
          note: newComment.trim()
        },
        ...(selectedOrder.timelineLogs || [])
      ];

      const payload = {
        ...selectedOrder,
        timelineLogs: updatedLogs
      };

      await dbService.saveITServiceOrder(payload, `Comentário adicionado: ${newComment.trim()}`, false);
      setSelectedOrder(payload);
      setNewComment('');
      showAlert('Mensagem enviada com sucesso!', 'success');
      fetchOrders();
    } catch (err) {
      console.error('Erro ao enviar mensagem:', err);
      showAlert('Erro ao enviar mensagem.', 'danger');
    }
  };

  // Print IT Service Order
  const handlePrintOrder = (order) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      showAlert('Pop-up bloqueado. Permita pop-ups para imprimir.', 'danger');
      return;
    }

    const issueDate = new Date().toLocaleDateString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const sla = getSlaStatus(order);

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Ordem de Serviço T.I. - ${order.code}</title>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 25px; color: #1e293b; font-size: 12px; }
          .header { border-bottom: 2px solid #4f46e5; padding-bottom: 12px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
          .title { font-size: 18px; font-weight: bold; color: #312e81; text-transform: uppercase; }
          .subtitle { font-size: 11px; color: #64748b; margin-top: 2px; }
          .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px 20px; background: #f8fafc; padding: 14px; border-radius: 6px; border: 1px solid #e2e8f0; margin-bottom: 15px; }
          .grid-item { display: flex; justify-content: space-between; }
          .label { font-weight: bold; color: #475569; }
          .value { color: #0f172a; font-weight: 600; }
          .section-title { font-size: 12px; font-weight: bold; color: #312e81; text-transform: uppercase; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; margin-top: 15px; margin-bottom: 8px; }
          .box { background: #f8fafc; border: 1px solid #e2e8f0; padding: 10px 14px; border-radius: 6px; margin-bottom: 10px; font-size: 11px; line-height: 1.5; }
          .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 50px; text-align: center; font-size: 11px; page-break-inside: avoid; }
          .sign-line { border-top: 1px solid #64748b; padding-top: 6px; font-weight: bold; }
          @media print { .no-print { display: none; } }
        </style>
      </head>
      <body>
        <div class="no-print" style="text-align: right; margin-bottom: 15px;">
          <button onclick="window.print()" style="background: #4f46e5; color: #fff; border: none; padding: 8px 16px; border-radius: 6px; font-size: 12px; font-weight: bold; cursor: pointer;">🖨️ Imprimir Documento</button>
        </div>

        <div class="header">
          <div>
            <div class="title">NexaCLINIC — Ordem de Serviço de T.I.</div>
            <div class="subtitle">Departamento de Tecnologia da Informação & Suporte Técnico</div>
          </div>
          <div style="text-align: right;">
            <div style="font-weight: bold; font-size: 14px; color: #4f46e5;">${order.code}</div>
            <div style="font-size: 10px; color: #64748b;">Emissão: ${issueDate}</div>
          </div>
        </div>

        <div class="section-title">1. Dados do Chamado & Solicitante</div>
        <div class="grid">
          <div class="grid-item"><span class="label">Código:</span> <span class="value">${order.code}</span></div>
          <div class="grid-item"><span class="label">Status:</span> <span class="value">${order.status}</span></div>
          <div class="grid-item"><span class="label">Solicitante:</span> <span class="value">${order.requesterName}</span></div>
          <div class="grid-item"><span class="label">E-mail:</span> <span class="value">${order.requesterEmail || 'N/A'}</span></div>
          <div class="grid-item"><span class="label">Setor Afetado:</span> <span class="value">${order.sector}</span></div>
          <div class="grid-item"><span class="label">Unidade:</span> <span class="value">${order.unit || 'Betim'}</span></div>
          <div class="grid-item"><span class="label">Categoria:</span> <span class="value">${order.category} (${order.subcategory || 'Geral'})</span></div>
          <div class="grid-item"><span class="label">Prioridade / SLA:</span> <span class="value">${order.priority} (${order.slaHours || 24}h)</span></div>
          <div class="grid-item"><span class="label">Abertura:</span> <span class="value">${new Date(order.openDate).toLocaleString('pt-BR')}</span></div>
          <div class="grid-item"><span class="label">Prazo Limite (SLA):</span> <span class="value">${order.slaDeadline ? new Date(order.slaDeadline).toLocaleString('pt-BR') : 'N/A'}</span></div>
        </div>

        <div class="section-title">2. Descrição da Ocorrência</div>
        <div class="box">
          <div style="font-weight: bold; color: #1e1b4b; margin-bottom: 4px;">${order.title}</div>
          <div>${order.description}</div>
        </div>

        <div class="section-title">3. Parecer Técnico & Solução Aplicada</div>
        <div class="box">
          <div style="margin-bottom: 6px;"><strong>Técnico / Analista:</strong> ${order.assignedTechnician || 'Em atribuição'}</div>
          <div style="margin-bottom: 6px;"><strong>Diagnóstico Técnico:</strong> ${order.diagnostic || 'Em análise técnica.'}</div>
          <div><strong>Solução Aplicada:</strong> ${order.solutionApplied || 'Pendente de encerramento.'}</div>
          ${order.completionDate ? `<div style="margin-top: 6px; color: #166534;"><strong>Concluído em:</strong> ${new Date(order.completionDate).toLocaleString('pt-BR')}</div>` : ''}
        </div>

        <div class="signatures">
          <div>
            <div class="sign-line">Suporte Técnico / Analista de T.I.</div>
            <div style="font-size: 10px; color: #64748b;">Assinatura do Técnico</div>
          </div>
          <div>
            <div class="sign-line">Solicitante / Responsável do Setor</div>
            <div style="font-size: 10px; color: #64748b;">Aceite e Homologação</div>
          </div>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() { window.print(); }, 300);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const getPriorityBadgeStyle = (priority) => {
    switch (priority) {
      case 'Crítico': return { bg: '#fee2e2', text: '#b91c1c', border: '#fca5a5' };
      case 'Alta': return { bg: '#ffedd5', text: '#c2410c', border: '#fed7aa' };
      case 'Média': return { bg: '#fef3c7', text: '#b45309', border: '#fde68a' };
      default: return { bg: '#f3f4f6', text: '#4b5563', border: '#e5e7eb' };
    }
  };

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'Resolvida': case 'Concluída': return { bg: '#dcfce7', text: '#15803d', border: '#bbf7d0' };
      case 'Em Atendimento': return { bg: '#e0e7ff', text: '#4338ca', border: '#c7d2fe' };
      case 'Em Triagem': return { bg: '#ede9fe', text: '#6d28d9', border: '#ddd6fe' };
      case 'Aguardando Usuário': return { bg: '#fef3c7', text: '#b45309', border: '#fde68a' };
      case 'Aguardando Peça': return { bg: '#ffedd5', text: '#c2410c', border: '#fed7aa' };
      case 'Cancelada': return { bg: '#fee2e2', text: '#991b1b', border: '#fca5a5' };
      case 'Aberta': return { bg: '#e0f2fe', text: '#0369a1', border: '#bae6fd' };
      default: return { bg: '#f3f4f6', text: '#4b5563', border: '#e5e7eb' };
    }
  };

  return (
    <div style={styles.container}>
      {/* Toast Alert */}
      {message.text && (
        <div style={{ ...styles.alert, backgroundColor: message.type === 'danger' ? '#fee2e2' : '#dcfce7', color: message.type === 'danger' ? '#991b1b' : '#166534' }}>
          {message.type === 'danger' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Header Info Banner for Standard User */}
      {!isTechOrAdmin && (
        <div style={styles.userBanner}>
          <div style={styles.userBannerIcon}>
            <Laptop size={20} color="#4f46e5" />
          </div>
          <div style={{ flex: 1 }}>
            <h4 style={styles.userBannerTitle}>Central de Chamados de T.I.</h4>
            <p style={styles.userBannerText}>
              Aqui você acompanha suas solicitações de suporte, computadores, redes e sistemas com controle de prazo de atendimento (SLA).
            </p>
          </div>
          <button onClick={handleOpenNew} style={styles.btnPrimary}>
            <Plus size={16} /> Novo Chamado
          </button>
        </div>
      )}

      {/* KPI Cards Row */}
      <div style={styles.kpiGrid}>
        <div style={styles.kpiCard}>
          <div style={styles.kpiHeader}>
            <span style={styles.kpiLabel}>Total</span>
            <Laptop size={18} color="#4f46e5" />
          </div>
          <div style={{ ...styles.kpiValue, color: '#4f46e5' }}>{slaMetrics.total}</div>
          <span style={styles.kpiSub}>{slaMetrics.openCount} Chamados em Aberto</span>
        </div>

        <div style={styles.kpiCard}>
          <div style={styles.kpiHeader}>
            <span style={styles.kpiLabel}>No Prazo</span>
            <CheckCircle2 size={18} color="#10b981" />
          </div>
          <div style={{ ...styles.kpiValue, color: '#10b981' }}>{slaMetrics.onTimeCount}</div>
          <span style={styles.kpiSub}>{slaMetrics.resolvedCount} Resolvidos</span>
        </div>

        <div style={styles.kpiCard}>
          <div style={styles.kpiHeader}>
            <span style={styles.kpiLabel}>Alerta SLA</span>
            <Clock size={18} color="#f59e0b" />
          </div>
          <div style={{ ...styles.kpiValue, color: '#f59e0b' }}>{slaMetrics.warningCount}</div>
          <span style={styles.kpiSub}>Próximos do vencimento</span>
        </div>

        <div style={styles.kpiCard}>
          <div style={styles.kpiHeader}>
            <span style={styles.kpiLabel}>Críticos</span>
            <AlertTriangle size={18} color="#ef4444" />
          </div>
          <div style={{ ...styles.kpiValue, color: '#ef4444' }}>{slaMetrics.criticalCount}</div>
          <span style={styles.kpiSub}>{slaMetrics.overdueCount} Estourados / Atrasados</span>
        </div>

        <div style={styles.kpiCard}>
          <div style={styles.kpiHeader}>
            <span style={styles.kpiLabel}>Conformidade SLA</span>
            <Gauge size={18} color="#6366f1" />
          </div>
          <div style={{ ...styles.kpiValue, color: '#6366f1' }}>{slaMetrics.slaComplianceRate}%</div>
          <span style={styles.kpiSub}>TMR Médio: {slaMetrics.avgResolutionTime}h</span>
        </div>
      </div>

      {/* Control Bar: View Mode, Search & Filters */}
      <div style={styles.controlBar}>
        <div style={styles.viewToggleGroup}>
          <button 
            style={{ ...styles.viewBtn, ...(viewMode === 'compact' ? styles.viewBtnActive : {}) }}
            onClick={() => setViewMode('compact')}
          >
            <List size={15} /> Tabela
          </button>
          <button 
            style={{ ...styles.viewBtn, ...(viewMode === 'cards' ? styles.viewBtnActive : {}) }}
            onClick={() => setViewMode('cards')}
          >
            <LayoutGrid size={15} /> Cards
          </button>
          <button 
            style={{ ...styles.viewBtn, ...(viewMode === 'sla' ? styles.viewBtnActive : {}) }}
            onClick={() => setViewMode('sla')}
          >
            <Gauge size={15} /> Painel SLA
          </button>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button onClick={handleOpenNew} style={styles.btnPrimary}>
            <Plus size={16} /> Novo Chamado
          </button>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div style={styles.filterBar}>
        <div style={styles.searchBox}>
          <Search size={16} color="#94a3b8" />
          <input 
            type="text" 
            placeholder="Buscar por código, título, solicitante, setor..."
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
            {IT_CATEGORIES.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <select 
            value={sectorFilter} 
            onChange={(e) => setSectorFilter(e.target.value)}
            style={styles.selectFilter}
          >
            <option value="all">Setor</option>
            {CLINIC_SECTORS.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            style={styles.selectFilter}
          >
            <option value="all">Status</option>
            <option value="Aberta">Aberta</option>
            <option value="Em Triagem">Em Triagem</option>
            <option value="Em Atendimento">Em Atendimento</option>
            <option value="Aguardando Usuário">Aguardando Usuário</option>
            <option value="Aguardando Peça">Aguardando Peça</option>
            <option value="Resolvida">Resolvida</option>
            <option value="Cancelada">Cancelada</option>
          </select>

          <select 
            value={priorityFilter} 
            onChange={(e) => setPriorityFilter(e.target.value)}
            style={styles.selectFilter}
          >
            <option value="all">Prioridade</option>
            <option value="Crítico">Crítico (2h)</option>
            <option value="Alta">Alta (8h)</option>
            <option value="Média">Média (24h)</option>
            <option value="Baixa">Baixa (48h)</option>
          </select>

          <select 
            value={slaFilter} 
            onChange={(e) => setSlaFilter(e.target.value)}
            style={styles.selectFilter}
          >
            <option value="all">SLA</option>
            <option value="on_time">No Prazo</option>
            <option value="warning">Alerta</option>
            <option value="overdue">Atrasado</option>
            <option value="met">Cumprido</option>
          </select>
        </div>
      </div>

      {/* VIEW 1: COMPACT TABLE */}
      {viewMode === 'compact' && (
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Código</th>
                <th style={styles.th}>Assunto</th>
                <th style={styles.th}>Categoria</th>
                <th style={styles.th}>Setor</th>
                <th style={styles.th}>Prioridade</th>
                <th style={styles.th}>SLA</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Solicitante</th>
                <th style={styles.th}>Técnico</th>
                <th style={{ ...styles.th, textAlign: 'center' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="10" style={styles.emptyTd}>
                    <RefreshCw size={20} className="spin" style={{ margin: '0 auto 8px', display: 'block', color: '#4f46e5' }} />
                    Carregando chamados de T.I...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="10" style={styles.emptyTd}>
                    Nenhum chamado de T.I. encontrado com os filtros aplicados.
                  </td>
                </tr>
              ) : (
                filteredOrders.map(order => {
                  const sla = getSlaStatus(order);
                  const pStyle = getPriorityBadgeStyle(order.priority);
                  const sStyle = getStatusBadgeStyle(order.status);

                  return (
                    <tr key={order.id} style={styles.tr}>
                      <td style={styles.tdBold}>{order.code}</td>
                      <td style={styles.td}>
                        <div style={{ fontWeight: 600, color: '#1e293b' }}>{order.title}</div>
                        <div style={{ fontSize: '11px', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '280px' }}>
                          {order.description}
                        </div>
                      </td>
                      <td style={styles.td}>
                        <span style={styles.badgeCategory}>{order.category}</span>
                      </td>
                      <td style={styles.td}>
                        <span style={styles.badgeSector}>{order.sector}</span>
                      </td>
                      <td style={styles.td}>
                        <span style={{ ...styles.badge, backgroundColor: pStyle.bg, color: pStyle.text, borderColor: pStyle.border }}>
                          {order.priority}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <span style={{ ...styles.badge, backgroundColor: sla.bg, color: sla.color, borderColor: sla.border, fontWeight: 700 }}>
                          {sla.badgeText || sla.label}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <span style={{ ...styles.badge, backgroundColor: sStyle.bg, color: sStyle.text, borderColor: sStyle.border }}>
                          {order.status}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <div style={{ fontSize: '11px', fontWeight: 600 }}>{order.requesterName}</div>
                        <div style={{ fontSize: '10px', color: '#94a3b8' }}>{new Date(order.openDate).toLocaleDateString('pt-BR')}</div>
                      </td>
                      <td style={styles.td}>
                        <span style={{ fontSize: '11px', color: order.assignedTechnician ? '#4338ca' : '#94a3b8', fontWeight: 500 }}>
                          {order.assignedTechnician || 'Pendente'}
                        </span>
                      </td>
                      <td style={{ ...styles.td, textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                          <button 
                            onClick={() => handleOpenManage(order)}
                            title={isTechOrAdmin ? "Atender / Gerenciar" : "Ver Detalhes"}
                            style={styles.actionBtnPrimary}
                          >
                            <Eye size={14} /> {isTechOrAdmin ? 'Atender' : 'Ver'}
                          </button>
                          <button 
                            onClick={() => handlePrintOrder(order)}
                            title="Imprimir O.S."
                            style={styles.actionBtnSecondary}
                          >
                            <Printer size={14} />
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

      {/* VIEW 2: CARDS GRID */}
      {viewMode === 'cards' && (
        <div style={styles.cardsGrid}>
          {filteredOrders.length === 0 ? (
            <div style={styles.emptyBox}>Nenhum chamado encontrado.</div>
          ) : (
            filteredOrders.map(order => {
              const sla = getSlaStatus(order);
              const pStyle = getPriorityBadgeStyle(order.priority);
              const sStyle = getStatusBadgeStyle(order.status);

              return (
                <div key={order.id} style={styles.card}>
                  <div style={styles.cardTop}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={styles.cardCode}>{order.code}</span>
                      <span style={{ ...styles.badge, backgroundColor: pStyle.bg, color: pStyle.text, borderColor: pStyle.border }}>
                        {order.priority}
                      </span>
                    </div>
                    <span style={{ ...styles.badge, backgroundColor: sla.bg, color: sla.color, borderColor: sla.border, fontWeight: 700 }}>
                      {sla.badgeText || sla.label}
                    </span>
                  </div>

                  <h3 style={styles.cardTitle}>{order.title}</h3>
                  <p style={styles.cardDesc}>{order.description}</p>

                  <div style={styles.cardMetaGrid}>
                    <div style={styles.metaItem}><span style={styles.metaLabel}>Setor:</span> <span style={styles.metaVal}>{order.sector}</span></div>
                    <div style={styles.metaItem}><span style={styles.metaLabel}>Categoria:</span> <span style={styles.metaVal}>{order.category}</span></div>
                    <div style={styles.metaItem}><span style={styles.metaLabel}>Solicitante:</span> <span style={styles.metaVal}>{order.requesterName}</span></div>
                    <div style={styles.metaItem}><span style={styles.metaLabel}>Técnico:</span> <span style={styles.metaVal}>{order.assignedTechnician || 'Não atribuído'}</span></div>
                  </div>

                  <div style={styles.cardBottom}>
                    <span style={{ ...styles.badge, backgroundColor: sStyle.bg, color: sStyle.text, borderColor: sStyle.border }}>
                      {order.status}
                    </span>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button onClick={() => handlePrintOrder(order)} style={styles.actionBtnSecondary} title="Imprimir">
                        <Printer size={14} />
                      </button>
                      <button onClick={() => handleOpenManage(order)} style={styles.actionBtnPrimary}>
                        <Eye size={14} /> {isTechOrAdmin ? 'Atender' : 'Detalhes'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* VIEW 3: SLA EXECUTIVE DASHBOARD */}
      {viewMode === 'sla' && (
        <div style={styles.slaDashboard}>
          <div style={styles.slaSummaryCard}>
            <div style={styles.slaHeaderRow}>
              <div>
                <h3 style={styles.slaTitle}>Painel de Conformidade de SLA</h3>
                <p style={styles.slaSub}>Metas contratuais de atendimento técnico por prioridade e setor</p>
              </div>
              <div style={styles.slaScoreBox}>
                <span style={styles.slaScoreVal}>{slaMetrics.slaComplianceRate}%</span>
                <span style={styles.slaScoreLbl}>Dentro da Meta</span>
              </div>
            </div>

            <div style={styles.slaProgressTrack}>
              <div style={{ ...styles.slaProgressBar, width: `${slaMetrics.slaComplianceRate}%` }}></div>
            </div>
          </div>

          {/* SLA Rules Reference Table */}
          <div style={styles.slaRulesGrid}>
            <div style={styles.slaRuleCard}>
              <div style={{ ...styles.slaRuleHeader, backgroundColor: '#fee2e2', color: '#b91c1c' }}>
                <AlertOctagon size={16} /> Crítico — SLA 2 Horas
              </div>
              <div style={styles.slaRuleBody}>
                <p style={styles.slaRuleText}>Indisponibilidade total de rede, parada de máquinas de salão, servidores ou prontuário médico.</p>
                <div style={styles.slaRuleStat}>Abertos agora: <strong>{slaMetrics.criticalCount}</strong></div>
              </div>
            </div>

            <div style={styles.slaRuleCard}>
              <div style={{ ...styles.slaRuleHeader, backgroundColor: '#ffedd5', color: '#c2410c' }}>
                <AlertTriangle size={16} /> Alta — SLA 8 Horas
              </div>
              <div style={styles.slaRuleBody}>
                <p style={styles.slaRuleText}>Impacto em setor crítico, impressoras de etiquetas Zebra, falhas de autenticação em bloco.</p>
                <div style={styles.slaRuleStat}>Meta de Resolução: <strong>No mesmo dia</strong></div>
              </div>
            </div>

            <div style={styles.slaRuleCard}>
              <div style={{ ...styles.slaRuleHeader, backgroundColor: '#fef3c7', color: '#b45309' }}>
                <Clock size={16} /> Média — SLA 24 Horas
              </div>
              <div style={styles.slaRuleBody}>
                <p style={styles.slaRuleText}>Problemas individuais, lentidão sem parada total, instalação de programas e certificados.</p>
                <div style={styles.slaRuleStat}>Meta de Resolução: <strong>Até 1 dia útil</strong></div>
              </div>
            </div>

            <div style={styles.slaRuleCard}>
              <div style={{ ...styles.slaRuleHeader, backgroundColor: '#f1f5f9', color: '#475569' }}>
                <HelpCircle size={16} /> Baixa — SLA 48 Horas
              </div>
              <div style={styles.slaRuleBody}>
                <p style={styles.slaRuleText}>Dúvidas gerais, melhorias de fluxo, novos pontos de rede planejados e solicitações rotineiras.</p>
                <div style={styles.slaRuleStat}>Meta de Resolução: <strong>Até 2 dias úteis</strong></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: NEW IT SERVICE ORDER */}
      {showNewModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={styles.modalIconBox}><Laptop size={20} color="#4f46e5" /></div>
                <div>
                  <h2 style={styles.modalTitle}>Novo Chamado de T.I.</h2>
                  <p style={styles.modalSubtitle}>Solicitação de suporte técnico e sistemas</p>
                </div>
              </div>
              <button onClick={() => setShowNewModal(false)} style={styles.closeBtn}><X size={18} /></button>
            </div>

            <form onSubmit={handleSaveNewOrder} style={styles.modalForm}>
              <div style={styles.formRow}>
                <div style={{ flex: 2 }}>
                  <label style={styles.label}>Título</label>
                  <input 
                    type="text" 
                    placeholder="Ex: Impressora da recepção travou / Wi-Fi salão A"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    required
                    style={styles.input}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={styles.label}>Prioridade</label>
                  <select 
                    value={form.priority} 
                    onChange={(e) => setForm({ ...form, priority: e.target.value })}
                    style={styles.select}
                  >
                    <option value="Baixa">Baixa (SLA 48h)</option>
                    <option value="Média">Média (SLA 24h)</option>
                    <option value="Alta">Alta (SLA 8h)</option>
                    <option value="Crítico">Crítico (SLA 2h)</option>
                  </select>
                </div>
              </div>

              <div style={styles.formRow}>
                <div style={{ flex: 1 }}>
                  <label style={styles.label}>Categoria</label>
                  <select 
                    value={form.category} 
                    onChange={(e) => {
                      const cat = IT_CATEGORIES.find(c => c.id === e.target.value);
                      setForm({ ...form, category: e.target.value, subcategory: cat?.subcategories[0] || 'Geral' });
                    }}
                    style={styles.select}
                  >
                    {IT_CATEGORIES.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div style={{ flex: 1 }}>
                  <label style={styles.label}>Subcategoria</label>
                  <select 
                    value={form.subcategory} 
                    onChange={(e) => setForm({ ...form, subcategory: e.target.value })}
                    style={styles.select}
                  >
                    {(IT_CATEGORIES.find(c => c.id === form.category)?.subcategories || ['Geral']).map(sub => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>

                <div style={{ flex: 1 }}>
                  <label style={styles.label}>Setor</label>
                  <select 
                    value={form.sector} 
                    onChange={(e) => setForm({ ...form, sector: e.target.value })}
                    style={styles.select}
                  >
                    {CLINIC_SECTORS.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={styles.formRow}>
                <div style={{ flex: 1 }}>
                  <label style={styles.label}>Solicitante</label>
                  <input 
                    type="text" 
                    value={form.requesterName}
                    onChange={(e) => setForm({ ...form, requesterName: e.target.value })}
                    required
                    style={styles.input}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={styles.label}>E-mail</label>
                  <input 
                    type="email" 
                    value={form.requesterEmail}
                    onChange={(e) => setForm({ ...form, requesterEmail: e.target.value })}
                    required
                    style={styles.input}
                  />
                </div>
              </div>

              <div>
                <label style={styles.label}>Descrição</label>
                <textarea 
                  rows="4"
                  placeholder="Descreva detalhadamente o problema ocorrido, mensagem de erro na tela ou comportamento anormal..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  required
                  style={styles.textarea}
                ></textarea>
              </div>

              <div style={styles.modalFooter}>
                <button type="button" onClick={() => setShowNewModal(false)} style={styles.btnSecondary}>
                  Cancelar
                </button>
                <button type="submit" style={styles.btnPrimary}>
                  <Check size={16} /> Abrir Chamado
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: MANAGE / VIEW IT SERVICE ORDER */}
      {showManageModal && selectedOrder && (
        <div style={styles.modalOverlay}>
          <div style={{ ...styles.modalContent, maxWidth: '850px' }}>
            <div style={styles.modalHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={styles.modalIconBox}><Laptop size={20} color="#4f46e5" /></div>
                <div>
                  <h2 style={styles.modalTitle}>Chamado {selectedOrder.code}</h2>
                  <p style={styles.modalSubtitle}>{selectedOrder.title}</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button onClick={() => handlePrintOrder(selectedOrder)} style={styles.actionBtnSecondary} title="Imprimir">
                  <Printer size={16} /> Imprimir
                </button>
                <button onClick={() => setShowManageModal(false)} style={styles.closeBtn}><X size={18} /></button>
              </div>
            </div>

            {/* Quick Summary Info Box */}
            <div style={styles.orderSummaryBox}>
              <div style={styles.summaryItem}><span style={styles.summaryLbl}>Setor:</span> <span style={styles.summaryVal}>{selectedOrder.sector}</span></div>
              <div style={styles.summaryItem}><span style={styles.summaryLbl}>Categoria:</span> <span style={styles.summaryVal}>{selectedOrder.category} ({selectedOrder.subcategory})</span></div>
              <div style={styles.summaryItem}><span style={styles.summaryLbl}>Solicitante:</span> <span style={styles.summaryVal}>{selectedOrder.requesterName}</span></div>
              <div style={styles.summaryItem}><span style={styles.summaryLbl}>Abertura:</span> <span style={styles.summaryVal}>{new Date(selectedOrder.openDate).toLocaleString('pt-BR')}</span></div>
              <div style={styles.summaryItem}><span style={styles.summaryLbl}>Prazo SLA:</span> <span style={{ ...styles.summaryVal, color: '#4f46e5', fontWeight: 700 }}>{selectedOrder.slaDeadline ? new Date(selectedOrder.slaDeadline).toLocaleString('pt-BR') : 'N/A'}</span></div>
            </div>

            <div style={styles.problemBox}>
              <div style={{ fontWeight: 700, color: '#1e1b4b', marginBottom: '4px' }}>Descrição do Problema</div>
              <div style={{ color: '#334155', fontSize: '13px', lineHeight: 1.5 }}>{selectedOrder.description}</div>
            </div>

            {/* If Admin / Tech -> Technical Form */}
            {isTechOrAdmin ? (
              <form onSubmit={handleSaveManage} style={styles.modalForm}>
                <div style={styles.formRow}>
                  <div style={{ flex: 1 }}>
                    <label style={styles.label}>Status</label>
                    <select 
                      value={manageForm.status} 
                      onChange={(e) => setManageForm({ ...manageForm, status: e.target.value })}
                      style={styles.select}
                    >
                      <option value="Aberta">Aberta</option>
                      <option value="Em Triagem">Em Triagem</option>
                      <option value="Em Atendimento">Em Atendimento</option>
                      <option value="Aguardando Usuário">Aguardando Usuário</option>
                      <option value="Aguardando Peça">Aguardando Peça</option>
                      <option value="Resolvida">Resolvida</option>
                      <option value="Cancelada">Cancelada</option>
                    </select>
                  </div>

                  <div style={{ flex: 1 }}>
                    <label style={styles.label}>Técnico</label>
                    <input 
                      type="text" 
                      placeholder="Nome do analista de T.I."
                      value={manageForm.assignedTechnician}
                      onChange={(e) => setManageForm({ ...manageForm, assignedTechnician: e.target.value })}
                      style={styles.input}
                    />
                  </div>

                  <div style={{ flex: 1 }}>
                    <label style={styles.label}>Prioridade</label>
                    <select 
                      value={manageForm.priority} 
                      onChange={(e) => setManageForm({ ...manageForm, priority: e.target.value })}
                      style={styles.select}
                    >
                      <option value="Baixa">Baixa (48h)</option>
                      <option value="Média">Média (24h)</option>
                      <option value="Alta">Alta (8h)</option>
                      <option value="Crítico">Crítico (2h)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={styles.label}>Diagnóstico</label>
                  <textarea 
                    rows="2"
                    placeholder="Diagnóstico técnico da causa raiz do problema..."
                    value={manageForm.diagnostic}
                    onChange={(e) => setManageForm({ ...manageForm, diagnostic: e.target.value })}
                    style={styles.textarea}
                  ></textarea>
                </div>

                <div>
                  <label style={styles.label}>Solução</label>
                  <textarea 
                    rows="2"
                    placeholder="Ações executadas para resolução do chamado..."
                    value={manageForm.solutionApplied}
                    onChange={(e) => setManageForm({ ...manageForm, solutionApplied: e.target.value })}
                    style={styles.textarea}
                  ></textarea>
                </div>

                <div style={styles.modalFooter}>
                  <button type="button" onClick={() => setShowManageModal(false)} style={styles.btnSecondary}>
                    Fechar
                  </button>
                  <button type="submit" style={styles.btnPrimary}>
                    <Check size={16} /> Salvar Alterações
                  </button>
                </div>
              </form>
            ) : (
              <div style={styles.userViewDetails}>
                <div style={styles.diagnosticCard}>
                  <div style={{ fontWeight: 700, color: '#065f46', marginBottom: '4px' }}>Parecer Técnico & Solução</div>
                  <div style={{ fontSize: '13px', color: '#1e293b', marginBottom: '4px' }}>
                    <strong>Técnico:</strong> {selectedOrder.assignedTechnician || 'Em triagem técnica'}
                  </div>
                  <div style={{ fontSize: '13px', color: '#1e293b', marginBottom: '4px' }}>
                    <strong>Diagnóstico:</strong> {selectedOrder.diagnostic || 'Aguardando parecer do especialista de T.I.'}
                  </div>
                  <div style={{ fontSize: '13px', color: '#1e293b' }}>
                    <strong>Solução:</strong> {selectedOrder.solutionApplied || 'Em andamento.'}
                  </div>
                </div>
              </div>
            )}

            {/* TIMELINE / MESSAGES SECTION */}
            <div style={styles.timelineSection}>
              <h4 style={styles.timelineTitle}>
                <MessageSquare size={16} /> Histórico & Interações
              </h4>

              <div style={styles.commentInputRow}>
                <input 
                  type="text" 
                  placeholder="Escreva uma mensagem ou atualização..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                  style={styles.commentInput}
                />
                <button onClick={handleAddComment} style={styles.btnPrimary}>
                  <Send size={15} /> Enviar
                </button>
              </div>

              <div style={styles.timelineList}>
                {(selectedOrder.timelineLogs || []).map((log, idx) => (
                  <div key={log.id || idx} style={styles.timelineItem}>
                    <div style={styles.timelineBullet}></div>
                    <div style={styles.timelineBody}>
                      <div style={styles.timelineHeader}>
                        <span style={styles.timelineAuthor}>{log.author}</span>
                        <span style={styles.timelineDate}>{new Date(log.date).toLocaleString('pt-BR')}</span>
                        {log.status && <span style={styles.timelineStatus}>{log.status}</span>}
                      </div>
                      <div style={styles.timelineNote}>{log.note}</div>
                    </div>
                  </div>
                ))}
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
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  alert: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 16px',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: 600
  },
  userBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    background: 'linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)',
    border: '1px solid #c7d2fe',
    borderRadius: '12px',
    padding: '14px 18px'
  },
  userBannerIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    background: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 4px rgba(79, 70, 229, 0.1)'
  },
  userBannerTitle: {
    margin: '0 0 2px 0',
    fontSize: '15px',
    fontWeight: 700,
    color: '#312e81'
  },
  userBannerText: {
    margin: 0,
    fontSize: '12px',
    color: '#4338ca'
  },
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '12px'
  },
  kpiCard: {
    background: 'var(--card-bg, #ffffff)',
    border: '1px solid var(--border-color, #e2e8f0)',
    borderRadius: '10px',
    padding: '14px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
  },
  kpiHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  kpiLabel: {
    fontSize: '12px',
    fontWeight: 600,
    color: 'var(--text-secondary, #64748b)'
  },
  kpiValue: {
    fontSize: '22px',
    fontWeight: 800,
    lineHeight: 1.2
  },
  kpiSub: {
    fontSize: '11px',
    color: 'var(--text-secondary, #94a3b8)'
  },
  controlBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '10px'
  },
  viewToggleGroup: {
    display: 'flex',
    background: 'var(--card-bg, #ffffff)',
    border: '1px solid var(--border-color, #e2e8f0)',
    borderRadius: '8px',
    padding: '3px',
    gap: '4px'
  },
  viewBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    borderRadius: '6px',
    border: 'none',
    background: 'transparent',
    color: 'var(--text-secondary, #64748b)',
    fontSize: '12px',
    fontWeight: 600,
    cursor: 'pointer'
  },
  viewBtnActive: {
    background: '#4f46e5',
    color: '#ffffff'
  },
  filterBar: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
    alignItems: 'center',
    background: 'var(--card-bg, #ffffff)',
    border: '1px solid var(--border-color, #e2e8f0)',
    borderRadius: '10px',
    padding: '10px 14px'
  },
  searchBox: {
    flex: '1 1 240px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'var(--bg-secondary, #f8fafc)',
    border: '1px solid var(--border-color, #cbd5e1)',
    borderRadius: '6px',
    padding: '6px 10px'
  },
  searchInput: {
    border: 'none',
    background: 'transparent',
    outline: 'none',
    width: '100%',
    fontSize: '13px',
    color: 'var(--text-primary, #0f172a)'
  },
  filterGroup: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px'
  },
  selectFilter: {
    padding: '6px 10px',
    borderRadius: '6px',
    border: '1px solid var(--border-color, #cbd5e1)',
    background: 'var(--card-bg, #ffffff)',
    fontSize: '12px',
    color: 'var(--text-primary, #0f172a)',
    outline: 'none',
    fontWeight: 500
  },
  tableContainer: {
    background: 'var(--card-bg, #ffffff)',
    border: '1px solid var(--border-color, #e2e8f0)',
    borderRadius: '10px',
    overflowX: 'auto',
    boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '12px'
  },
  th: {
    background: 'var(--bg-secondary, #f8fafc)',
    padding: '10px 12px',
    textAlign: 'left',
    fontSize: '11px',
    fontWeight: 700,
    color: 'var(--text-secondary, #475569)',
    borderBottom: '1px solid var(--border-color, #e2e8f0)',
    textTransform: 'uppercase',
    letterSpacing: '0.3px'
  },
  tr: {
    borderBottom: '1px solid var(--border-color, #f1f5f9)',
    transition: 'background 0.15s ease'
  },
  td: {
    padding: '10px 12px',
    verticalAlign: 'middle',
    color: 'var(--text-primary, #1e293b)'
  },
  tdBold: {
    padding: '10px 12px',
    verticalAlign: 'middle',
    fontWeight: 700,
    color: '#4f46e5'
  },
  emptyTd: {
    padding: '30px',
    textAlign: 'center',
    color: 'var(--text-secondary, #94a3b8)',
    fontSize: '13px'
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: 600,
    border: '1px solid transparent'
  },
  badgeCategory: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '2px 6px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: 600,
    background: '#f1f5f9',
    color: '#475569'
  },
  badgeSector: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '2px 6px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: 600,
    background: '#ede9fe',
    color: '#5b21b6'
  },
  btnPrimary: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    background: '#4f46e5',
    color: '#ffffff',
    border: 'none',
    padding: '8px 14px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: 600,
    cursor: 'pointer'
  },
  btnSecondary: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    background: '#f1f5f9',
    color: '#334155',
    border: '1px solid #cbd5e1',
    padding: '8px 14px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: 600,
    cursor: 'pointer'
  },
  actionBtnPrimary: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    background: '#e0e7ff',
    color: '#4338ca',
    border: '1px solid #c7d2fe',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: 600,
    cursor: 'pointer'
  },
  actionBtnSecondary: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f8fafc',
    color: '#64748b',
    border: '1px solid #cbd5e1',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    cursor: 'pointer'
  },
  cardsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '14px'
  },
  card: {
    background: 'var(--card-bg, #ffffff)',
    border: '1px solid var(--border-color, #e2e8f0)',
    borderRadius: '10px',
    padding: '14px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
  },
  cardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  cardCode: {
    fontWeight: 800,
    color: '#4f46e5',
    fontSize: '13px'
  },
  cardTitle: {
    margin: 0,
    fontSize: '14px',
    fontWeight: 700,
    color: 'var(--text-primary, #0f172a)'
  },
  cardDesc: {
    margin: 0,
    fontSize: '12px',
    color: 'var(--text-secondary, #64748b)',
    lineHeight: 1.4
  },
  cardMetaGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '6px',
    background: 'var(--bg-secondary, #f8fafc)',
    padding: '8px',
    borderRadius: '6px',
    fontSize: '11px'
  },
  metaItem: {
    display: 'flex',
    flexDirection: 'column'
  },
  metaLabel: {
    fontSize: '10px',
    color: '#94a3b8'
  },
  metaVal: {
    fontWeight: 600,
    color: '#1e293b'
  },
  cardBottom: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTop: '1px solid var(--border-color, #f1f5f9)',
    paddingTop: '8px'
  },
  emptyBox: {
    padding: '40px',
    textAlign: 'center',
    color: '#94a3b8',
    gridColumn: '1 / -1',
    background: '#fff',
    borderRadius: '8px'
  },
  slaDashboard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  slaSummaryCard: {
    background: 'linear-gradient(135deg, #312e81 0%, #4338ca 100%)',
    borderRadius: '12px',
    padding: '20px',
    color: '#ffffff'
  },
  slaHeaderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px'
  },
  slaTitle: {
    margin: '0 0 4px 0',
    fontSize: '18px',
    fontWeight: 700
  },
  slaSub: {
    margin: 0,
    fontSize: '12px',
    color: '#c7d2fe'
  },
  slaScoreBox: {
    textAlign: 'right'
  },
  slaScoreVal: {
    fontSize: '32px',
    fontWeight: 800
  },
  slaScoreLbl: {
    display: 'block',
    fontSize: '11px',
    color: '#a5b4fc'
  },
  slaProgressTrack: {
    height: '10px',
    background: 'rgba(255,255,255,0.2)',
    borderRadius: '5px',
    overflow: 'hidden'
  },
  slaProgressBar: {
    height: '100%',
    background: '#10b981',
    borderRadius: '5px',
    transition: 'width 0.3s ease'
  },
  slaRulesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '12px'
  },
  slaRuleCard: {
    background: 'var(--card-bg, #ffffff)',
    border: '1px solid var(--border-color, #e2e8f0)',
    borderRadius: '10px',
    overflow: 'hidden'
  },
  slaRuleHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '10px 14px',
    fontSize: '12px',
    fontWeight: 700
  },
  slaRuleBody: {
    padding: '12px 14px',
    fontSize: '11px',
    color: '#475569',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  slaRuleText: {
    margin: 0,
    lineHeight: 1.4
  },
  slaRuleStat: {
    borderTop: '1px solid #f1f5f9',
    paddingTop: '6px',
    fontSize: '11px',
    color: '#1e293b'
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: '20px'
  },
  modalContent: {
    background: 'var(--card-bg, #ffffff)',
    borderRadius: '12px',
    width: '100%',
    maxWidth: '650px',
    maxHeight: '90vh',
    overflowY: 'auto',
    padding: '20px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid var(--border-color, #e2e8f0)',
    paddingBottom: '12px',
    marginBottom: '16px'
  },
  modalIconBox: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    background: '#eef2ff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  modalTitle: {
    margin: 0,
    fontSize: '16px',
    fontWeight: 700,
    color: 'var(--text-primary, #0f172a)'
  },
  modalSubtitle: {
    margin: 0,
    fontSize: '11px',
    color: 'var(--text-secondary, #64748b)'
  },
  closeBtn: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    color: '#64748b'
  },
  modalForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  formRow: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap'
  },
  label: {
    display: 'block',
    fontSize: '11px',
    fontWeight: 700,
    color: 'var(--text-secondary, #475569)',
    marginBottom: '4px',
    textTransform: 'uppercase',
    letterSpacing: '0.3px'
  },
  input: {
    width: '100%',
    padding: '8px 10px',
    borderRadius: '6px',
    border: '1px solid var(--border-color, #cbd5e1)',
    fontSize: '13px',
    outline: 'none',
    background: 'var(--card-bg, #ffffff)',
    color: 'var(--text-primary, #0f172a)',
    boxSizing: 'border-box'
  },
  select: {
    width: '100%',
    padding: '8px 10px',
    borderRadius: '6px',
    border: '1px solid var(--border-color, #cbd5e1)',
    fontSize: '13px',
    outline: 'none',
    background: 'var(--card-bg, #ffffff)',
    color: 'var(--text-primary, #0f172a)',
    boxSizing: 'border-box'
  },
  textarea: {
    width: '100%',
    padding: '8px 10px',
    borderRadius: '6px',
    border: '1px solid var(--border-color, #cbd5e1)',
    fontSize: '13px',
    outline: 'none',
    background: 'var(--card-bg, #ffffff)',
    color: 'var(--text-primary, #0f172a)',
    boxSizing: 'border-box',
    fontFamily: 'inherit'
  },
  modalFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    borderTop: '1px solid var(--border-color, #e2e8f0)',
    paddingTop: '14px',
    marginTop: '10px'
  },
  orderSummaryBox: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
    gap: '8px 14px',
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '10px 14px',
    marginBottom: '12px',
    fontSize: '11px'
  },
  summaryItem: {
    display: 'flex',
    flexDirection: 'column'
  },
  summaryLbl: {
    color: '#64748b',
    fontSize: '10px',
    fontWeight: 600
  },
  summaryVal: {
    color: '#0f172a',
    fontWeight: 600
  },
  problemBox: {
    background: '#f1f5f9',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    padding: '12px',
    marginBottom: '14px'
  },
  userViewDetails: {
    marginBottom: '14px'
  },
  diagnosticCard: {
    background: '#ecfdf5',
    border: '1px solid #a7f3d0',
    borderRadius: '8px',
    padding: '12px'
  },
  timelineSection: {
    borderTop: '1px solid var(--border-color, #e2e8f0)',
    paddingTop: '14px',
    marginTop: '10px'
  },
  timelineTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    margin: '0 0 10px 0',
    fontSize: '13px',
    fontWeight: 700,
    color: '#334155'
  },
  commentInputRow: {
    display: 'flex',
    gap: '8px',
    marginBottom: '14px'
  },
  commentInput: {
    flex: 1,
    padding: '8px 12px',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    fontSize: '12px',
    outline: 'none'
  },
  timelineList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    maxHeight: '200px',
    overflowY: 'auto'
  },
  timelineItem: {
    display: 'flex',
    gap: '10px',
    position: 'relative'
  },
  timelineBullet: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: '#4f46e5',
    marginTop: '4px',
    flexShrink: 0
  },
  timelineBody: {
    flex: 1,
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    padding: '6px 10px',
    fontSize: '11px'
  },
  timelineHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '2px'
  },
  timelineAuthor: {
    fontWeight: 700,
    color: '#1e293b'
  },
  timelineDate: {
    color: '#94a3b8',
    fontSize: '10px'
  },
  timelineStatus: {
    background: '#e0e7ff',
    color: '#4338ca',
    fontSize: '9px',
    fontWeight: 700,
    padding: '1px 5px',
    borderRadius: '3px'
  },
  timelineNote: {
    color: '#475569',
    lineHeight: 1.4
  }
};
