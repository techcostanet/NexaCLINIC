import React, { useState, useEffect, useMemo } from 'react';
import { dbService } from '../../firebase';
import { 
  Laptop, Plus, Search, Filter, X, FileText, CheckCircle2, 
  AlertTriangle, Clock, Trash2, Edit, AlertCircle, HardDrive, 
  ShieldAlert, Calendar, BarChart3, QrCode, Cpu, Layers, 
  ChevronRight, RefreshCw, Check, AlertOctagon, Activity, DollarSign, 
  List, LayoutGrid, User, Eye, Printer, ShieldCheck, HelpCircle,
  MessageSquare, Send, ArrowRight, Gauge, CheckSquare, Zap, Tag,
  ArrowUpDown, ArrowUp, ArrowDown, Wrench, BookOpen, Kanban, Play,
  Pause, RotateCcw, ArrowRightCircle
} from 'lucide-react';
import ITNewTaskModal from './ITNewTaskModal';
import ITDailyRoundModal from './ITDailyRoundModal';
import ITAssetsModal from './ITAssetsModal';
import ITWikiModal from './ITWikiModal';
import ITEditModal from './ITEditModal';
import ITUrgencyModal from './ITUrgencyModal';

const IT_CATEGORIES = [
  { id: 'Hardware', name: 'Hardware', subcategories: ['Desktop', 'Notebook', 'Monitor', 'Nobreak', 'Periféricos', 'Cabos', 'Outro'] },
  { id: 'Sistemas', name: 'Sistemas', subcategories: ['Nex-Ai CLINIC', 'Windows', 'Microsoft 365', 'Antivírus', 'Certificado Digital', 'Navegador', 'Outro'] },
  { id: 'Rede', name: 'Rede', subcategories: ['Wi-Fi', 'Cabo Desconectado', 'Lentidão', 'Queda de Link', 'Switch', 'Outro'] },
  { id: 'Impressoras', name: 'Impressoras', subcategories: ['Zebra', 'Laser', 'Leitor de Barras', 'Scanner', 'Outro'] },
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
  "CTA",
  "Reúso de Dialisadores",
  "CME",
  "Faturamento",
  "Financeiro",
  "RH",
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
  const [viewMode, setViewMode] = useState('compact'); // 'compact' | 'cards' | 'kanban' | 'sla'
  const [originFilter, setOriginFilter] = useState('all'); // 'all' | 'user' | 'internal'
  const [orders, setOrders] = useState([]);
  const [itSort, setItSort] = useState({ field: 'code', dir: 'desc' });
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
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [showDailyRoundModal, setShowDailyRoundModal] = useState(false);
  const [showAssetsModal, setShowAssetsModal] = useState(false);
  const [showWikiModal, setShowWikiModal] = useState(false);
  const [showManageModal, setShowManageModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [orderToEdit, setOrderToEdit] = useState(null);
  const [showUrgencyModal, setShowUrgencyModal] = useState(false);
  const [orderToCobrar, setOrderToCobrar] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newComment, setNewComment] = useState('');

  const KANBAN_COLUMNS = [
    { id: 'pendente', title: 'Pendente', color: '#6366f1', statuses: ['Aberta', 'Em Triagem'] },
    { id: 'andamento', title: 'Em Andamento', color: '#0284c7', statuses: ['Em Atendimento'] },
    { id: 'aguardando', title: 'Aguardando', color: '#f59e0b', statuses: ['Aguardando Usuário', 'Aguardando Peça'] },
    { id: 'concluido', title: 'Concluído', color: '#10b981', statuses: ['Resolvida', 'Concluída', 'Cancelada'] }
  ];

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
      const matchesOrigin = 
        originFilter === 'all' || 
        (originFilter === 'internal' ? order.origin === 'internal' : 
         originFilter === 'user' ? order.origin !== 'internal' :
         originFilter === 'urgent' ? (order.urgencyCount || 0) > 0 : true);

      let matchesSla = true;
      if (slaFilter !== 'all') {
        const sla = getSlaStatus(order);
        if (slaFilter === 'on_time') matchesSla = sla.type === 'on_time';
        else if (slaFilter === 'warning') matchesSla = sla.type === 'warning';
        else if (slaFilter === 'overdue') matchesSla = sla.type === 'overdue';
        else if (slaFilter === 'met') matchesSla = sla.type === 'met';
      }

      return matchesSearch && matchesCat && matchesSector && matchesStatus && matchesPriority && matchesSla && matchesOrigin;
    });
  }, [scopedOrders, searchTerm, categoryFilter, sectorFilter, statusFilter, priorityFilter, slaFilter, originFilter]);

  // Handle IT Sorting
  const handleItSort = (field) => {
    setItSort(prev => {
      if (prev.field === field) {
        return { field, dir: prev.dir === 'asc' ? 'desc' : 'asc' };
      }
      return { field, dir: 'asc' };
    });
  };

  // Memoized Sorted Orders
  const sortedOrders = useMemo(() => {
    if (!itSort.field) return filteredOrders;
    return [...filteredOrders].sort((a, b) => {
      let valA = '';
      let valB = '';

      switch (itSort.field) {
        case 'code':
          valA = a.code || '';
          valB = b.code || '';
          break;
        case 'title':
          valA = a.title || '';
          valB = b.title || '';
          break;
        case 'category':
          valA = a.category || '';
          valB = b.category || '';
          break;
        case 'sector':
          valA = a.sector || '';
          valB = b.sector || '';
          break;
        case 'priority': {
          const priorityWeights = { 'Crítico': 4, 'Alta': 3, 'Média': 2, 'Baixa': 1 };
          const pA = priorityWeights[a.priority] || 0;
          const pB = priorityWeights[b.priority] || 0;
          return itSort.dir === 'asc' ? pA - pB : pB - pA;
        }
        case 'sla': {
          const slaA = getSlaStatus(a).hours ?? 9999;
          const slaB = getSlaStatus(b).hours ?? 9999;
          return itSort.dir === 'asc' ? slaA - slaB : slaB - slaA;
        }
        case 'status':
          valA = a.status || '';
          valB = b.status || '';
          break;
        case 'requester':
          valA = a.requesterName || '';
          valB = b.requesterName || '';
          break;
        case 'technician':
          valA = a.assignedTechnician || '';
          valB = b.assignedTechnician || '';
          break;
        default:
          valA = a[itSort.field] || '';
          valB = b[itSort.field] || '';
      }

      if (typeof valA === 'string' && typeof valB === 'string') {
        const comp = valA.localeCompare(valB, 'pt-BR', { numeric: true, sensitivity: 'base' });
        return itSort.dir === 'asc' ? comp : -comp;
      }
      return 0;
    });
  }, [filteredOrders, itSort]);

  // Render Table Header with Sort Arrow
  const renderSortHeader = (label, field) => {
    const isActive = itSort.field === field;
    return (
      <th 
        style={{ ...styles.th, cursor: 'pointer', userSelect: 'none' }}
        onClick={() => handleItSort(field)}
        title={`Ordenar por ${label}`}
      >
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <span>{label}</span>
          {isActive ? (
            itSort.dir === 'asc' ? (
              <ArrowUp size={13} style={{ color: '#4f46e5' }} />
            ) : (
              <ArrowDown size={13} style={{ color: '#4f46e5' }} />
            )
          ) : (
            <ArrowUpDown size={12} style={{ opacity: 0.35 }} />
          )}
        </div>
      </th>
    );
  };

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

    const userCount = scopedOrders.filter(o => o.origin !== 'internal').length;
    const internalCount = scopedOrders.filter(o => o.origin === 'internal').length;
    const urgentCount = scopedOrders.filter(o => (o.urgencyCount || 0) > 0).length;
    const proactiveRate = total > 0 ? Math.round((internalCount / total) * 100) : 0;

    const avgResolutionTime = resolvedOrders.length > 0
      ? (totalResolutionTimeHours / resolvedOrders.length).toFixed(1)
      : '0.0';

    return {
      total,
      userCount,
      internalCount,
      urgentCount,
      proactiveRate,
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

  // Quick Status Transition (Kanban)
  const handleQuickStatusChange = async (order, nextStatus) => {
    try {
      const now = new Date().toISOString();
      const updatedLogs = [
        {
          id: `log-${Date.now()}`,
          date: now,
          author: currentUser?.name || 'Técnico T.I.',
          status: nextStatus,
          note: `Status alterado no Kanban para: ${nextStatus}`
        },
        ...(order.timelineLogs || [])
      ];

      const payload = {
        ...order,
        status: nextStatus,
        lastUpdatedBy: currentUser?.name || 'Técnico T.I.',
        timelineLogs: updatedLogs
      };

      if (['Resolvida', 'Concluída'].includes(nextStatus)) {
        payload.completionDate = now;
      }

      await dbService.saveITServiceOrder(payload, `Status alterado para ${nextStatus}`, false);
      showAlert(`Status de ${order.code} alterado para ${nextStatus}!`, 'success');
      fetchOrders();
    } catch (err) {
      console.error('Erro ao atualizar status no Kanban:', err);
      showAlert('Erro ao atualizar status da tarefa.', 'danger');
    }
  };

  // Handle Save Internal Task
  const handleSaveInternalTask = async (taskPayload) => {
    try {
      const saved = await dbService.saveITServiceOrder(taskPayload, 'Tarefa interna proativa cadastrada pela equipe de T.I.', false);
      showAlert(`Tarefa ${saved.code} cadastrada com sucesso!`, 'success');
      fetchOrders();
    } catch (err) {
      console.error('Erro ao salvar tarefa interna:', err);
      showAlert('Erro ao cadastrar tarefa interna.', 'danger');
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

  // Permission helper for full edit / delete
  const canModifyOrder = (order) => {
    if (!order) return false;
    if (isTechOrAdmin) return true;
    const uEmail = (currentUser?.email || '').trim().toLowerCase();
    const uName = (currentUser?.name || '').trim().toLowerCase();
    const oEmail = (order.requesterEmail || '').trim().toLowerCase();
    const oName = (order.requesterName || '').trim().toLowerCase();
    return (uEmail && oEmail === uEmail) || (uName && oName === uName);
  };

  // Handle Open Edit Modal
  const handleOpenEdit = (order) => {
    setOrderToEdit(order);
    setShowEditModal(true);
  };

  // Handle Save Full Edit
  const handleSaveEdit = async (updatedOrder) => {
    try {
      const now = new Date().toISOString();
      const updatedLogs = [
        {
          id: `log-${Date.now()}`,
          date: now,
          author: currentUser?.name || 'Técnico T.I.',
          status: updatedOrder.status,
          note: `Alterações salvas na edição completa da demanda.`
        },
        ...(updatedOrder.timelineLogs || [])
      ];

      const payload = {
        ...updatedOrder,
        timelineLogs: updatedLogs,
        lastUpdatedBy: currentUser?.name || 'Técnico T.I.'
      };

      await dbService.saveITServiceOrder(payload, 'Alterações salvas via edição completa.', false);
      showAlert(`Demanda ${payload.code} atualizada com sucesso!`, 'success');
      setShowEditModal(false);
      setOrderToEdit(null);
      if (selectedOrder && selectedOrder.id === payload.id) {
        setSelectedOrder(payload);
      }
      fetchOrders();
    } catch (err) {
      console.error('Erro ao editar demanda de T.I.:', err);
      showAlert('Erro ao atualizar demanda.', 'danger');
    }
  };

  // Handle Open Delete Modal
  const handleOpenDelete = (order) => {
    setOrderToDelete(order);
    setShowDeleteModal(true);
  };

  // Handle Confirm Delete
  const handleConfirmDelete = async () => {
    if (!orderToDelete) return;
    try {
      await dbService.deleteITServiceOrder(orderToDelete.id);
      showAlert(`Demanda ${orderToDelete.code} excluída permanentemente.`, 'success');
      setShowDeleteModal(false);
      if (selectedOrder && selectedOrder.id === orderToDelete.id) {
        setShowManageModal(false);
        setSelectedOrder(null);
      }
      setOrderToDelete(null);
      fetchOrders();
    } catch (err) {
      console.error('Erro ao excluir demanda:', err);
      showAlert('Erro ao excluir demanda.', 'danger');
    }
  };

  // Handle Open Cobrança de Agilidade
  const handleOpenCobrar = (order) => {
    setOrderToCobrar(order);
    setShowUrgencyModal(true);
  };

  // Handle Confirm Cobrança de Agilidade
  const handleConfirmCobrança = async (reason, note) => {
    if (!orderToCobrar) return;
    try {
      const now = new Date().toISOString();
      const newCount = (orderToCobrar.urgencyCount || 0) + 1;
      const urgencyLog = {
        id: `urgency-${Date.now()}`,
        date: now,
        author: currentUser?.name || 'Solicitante',
        type: 'urgency',
        status: orderToCobrar.status,
        note: `⚡ COBRANÇA DE AGILIDADE (${newCount}ª cobrança): [${reason}] ${note ? '- ' + note : ''}`
      };

      const updatedLogs = [urgencyLog, ...(orderToCobrar.timelineLogs || [])];
      const payload = {
        ...orderToCobrar,
        urgencyCount: newCount,
        isUrgentFollowUp: true,
        lastCobradoAt: now,
        lastCobradoBy: currentUser?.name || 'Solicitante',
        timelineLogs: updatedLogs
      };

      await dbService.saveITServiceOrder(payload, `Cobrança de agilidade registrada: ${reason}`, true);
      showAlert(`⚡ Cobrança de agilidade enviada para a equipe de T.I.!`, 'success');
      setShowUrgencyModal(false);
      setOrderToCobrar(null);
      if (selectedOrder && selectedOrder.id === payload.id) {
        setSelectedOrder(payload);
      }
      fetchOrders();
    } catch (err) {
      console.error('Erro ao enviar cobrança:', err);
      showAlert('Erro ao registrar cobrança de agilidade.', 'danger');
    }
  };

  // Quick Reply from Tech to Requester
  const handleSendQuickReply = async (replyText) => {
    if (!selectedOrder) return;
    try {
      const now = new Date().toISOString();
      const replyLog = {
        id: `reply-${Date.now()}`,
        date: now,
        author: currentUser?.name || 'Técnico T.I.',
        status: selectedOrder.status,
        note: `💬 Resposta da T.I.: ${replyText}`
      };

      const updatedLogs = [replyLog, ...(selectedOrder.timelineLogs || [])];
      const payload = {
        ...selectedOrder,
        timelineLogs: updatedLogs,
        lastUpdatedBy: currentUser?.name || 'Técnico T.I.'
      };

      await dbService.saveITServiceOrder(payload, replyText, true);
      setSelectedOrder(payload);
      showAlert('Resposta rápida enviada ao solicitante!', 'success');
      fetchOrders();
    } catch (err) {
      console.error('Erro ao enviar resposta rápida:', err);
      showAlert('Erro ao registrar resposta rápida.', 'danger');
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
            <div class="title">Nex-Ai CLINIC — Ordem de Serviço de T.I.</div>
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
          <div class="grid-item"><span class="label">Prioridade:</span> <span class="value">${order.priority} (${order.slaHours || 24}h)</span></div>
          <div class="grid-item"><span class="label">Abertura:</span> <span class="value">${new Date(order.openDate).toLocaleString('pt-BR')}</span></div>
          <div class="grid-item"><span class="label">Prazo Limite:</span> <span class="value">${order.slaDeadline ? new Date(order.slaDeadline).toLocaleString('pt-BR') : 'N/A'}</span></div>
        </div>

        <div class="section-title">2. Descrição da Ocorrência</div>
        <div class="box">
          <div style="font-weight: bold; color: #1e1b4b; margin-bottom: 4px;">${order.title}</div>
          <div>${order.description}</div>
        </div>

        <div class="section-title">3. Parecer Técnico & Solução</div>
        <div class="box">
          <div style="margin-bottom: 6px;"><strong>Técnico:</strong> ${order.assignedTechnician || 'Em atribuição'}</div>
          <div style="margin-bottom: 6px;"><strong>Diagnóstico Técnico:</strong> ${order.diagnostic || 'Em análise técnica.'}</div>
          <div><strong>Solução:</strong> ${order.solutionApplied || 'Pendente de encerramento.'}</div>
          ${order.completionDate ? `<div style="margin-top: 6px; color: #166534;"><strong>Concluído em:</strong> ${new Date(order.completionDate).toLocaleString('pt-BR')}</div>` : ''}
        </div>

        <div class="signatures">
          <div>
            <div class="sign-line">Suporte Técnico</div>
            <div style="font-size: 10px; color: #64748b;">Assinatura do Técnico</div>
          </div>
          <div>
            <div class="sign-line">Solicitante</div>
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

      {/* Origin Segmentation Filters */}
      <div style={styles.originTabsRow}>
        <div style={styles.originPillsGroup}>
          <button
            type="button"
            onClick={() => setOriginFilter('all')}
            style={{
              ...styles.originPill,
              ...(originFilter === 'all' ? styles.originPillActive : {})
            }}
          >
            Todos ({slaMetrics.total})
          </button>
          <button
            type="button"
            onClick={() => setOriginFilter('user')}
            style={{
              ...styles.originPill,
              ...(originFilter === 'user' ? styles.originPillActiveUser : {})
            }}
          >
            <Laptop size={13} /> Chamados ({slaMetrics.userCount})
          </button>
          <button
            type="button"
            onClick={() => setOriginFilter('internal')}
            style={{
              ...styles.originPill,
              ...(originFilter === 'internal' ? styles.originPillActiveInternal : {})
            }}
          >
            <Wrench size={13} /> Tarefas Internas ({slaMetrics.internalCount})
          </button>
          <button
            type="button"
            onClick={() => setOriginFilter('urgent')}
            style={{
              ...styles.originPill,
              ...(originFilter === 'urgent' ? styles.originPillActiveUrgent : {})
            }}
          >
            <Zap size={13} color={originFilter === 'urgent' ? '#ffffff' : '#f59e0b'} /> Cobrados ({slaMetrics.urgentCount})
          </button>
        </div>
      </div>

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
          <span style={styles.kpiSub}>{slaMetrics.overdueCount} Atrasados</span>
        </div>

        <div style={styles.kpiCard}>
          <div style={styles.kpiHeader}>
            <span style={styles.kpiLabel}>Atuação Proativa</span>
            <Activity size={18} color="#7c3aed" />
          </div>
          <div style={{ ...styles.kpiValue, color: '#7c3aed' }}>{slaMetrics.proactiveRate}%</div>
          <span style={styles.kpiSub}>{slaMetrics.internalCount} Proativas • {slaMetrics.userCount} Reativas</span>
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
            style={{ ...styles.viewBtn, ...(viewMode === 'kanban' ? styles.viewBtnActive : {}) }}
            onClick={() => setViewMode('kanban')}
          >
            <Kanban size={15} /> Kanban
          </button>
          <button 
            style={{ ...styles.viewBtn, ...(viewMode === 'sla' ? styles.viewBtnActive : {}) }}
            onClick={() => setViewMode('sla')}
          >
            <Gauge size={15} /> SLA
          </button>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button onClick={handleOpenNew} style={styles.btnPrimary}>
            <Plus size={16} /> Chamado
          </button>

          {isTechOrAdmin && (
            <>
              <button 
                type="button"
                onClick={() => setShowNewTaskModal(true)} 
                style={styles.btnPurple}
                title="Cadastrar ação interna da equipe de T.I."
              >
                <Wrench size={15} /> Tarefa T.I.
              </button>

              <button 
                type="button"
                onClick={() => setShowDailyRoundModal(true)} 
                style={styles.btnSky}
                title="Checklist matinal de rotina de infraestrutura"
              >
                <ShieldCheck size={15} /> Ronda Diária
              </button>

              <button 
                type="button"
                onClick={() => setShowAssetsModal(true)} 
                style={styles.btnIndigo}
                title="Controle patrimonial e etiquetas com QR Code"
              >
                <HardDrive size={15} /> Inventário
              </button>
            </>
          )}

          <button 
            type="button"
            onClick={() => setShowWikiModal(true)} 
            style={styles.btnEmerald}
            title="Procedimentos rápidos e soluções técnicas"
          >
            <BookOpen size={15} /> Wiki
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
                {renderSortHeader('Código', 'code')}
                {renderSortHeader('Assunto', 'title')}
                {renderSortHeader('Categoria', 'category')}
                {renderSortHeader('Setor', 'sector')}
                {renderSortHeader('Prioridade', 'priority')}
                {renderSortHeader('SLA', 'sla')}
                {renderSortHeader('Status', 'status')}
                {renderSortHeader('Solicitante', 'requester')}
                {renderSortHeader('Técnico', 'technician')}
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
              ) : sortedOrders.length === 0 ? (
                <tr>
                  <td colSpan="10" style={styles.emptyTd}>
                    Nenhum chamado de T.I. encontrado com os filtros aplicados.
                  </td>
                </tr>
              ) : (
                sortedOrders.map(order => {
                  const sla = getSlaStatus(order);
                  const pStyle = getPriorityBadgeStyle(order.priority);
                  const sStyle = getStatusBadgeStyle(order.status);

                  return (
                    <tr key={order.id} style={styles.tr}>
                      <td style={styles.tdBold}>
                        <div>{order.code}</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginTop: '2px' }}>
                          {order.origin === 'internal' ? (
                            <span style={styles.badgeInternalMini}>
                              <Wrench size={9} /> Tarefa
                            </span>
                          ) : (
                            <span style={styles.badgeTicketMini}>
                              <Laptop size={9} /> Chamado
                            </span>
                          )}
                          {(order.urgencyCount || 0) > 0 && (
                            <span style={styles.badgeUrgentMini} title={`Cobrado ${order.urgencyCount}x por ${order.lastCobradoBy || 'solicitante'}`}>
                              <Zap size={9} /> {order.urgencyCount}x
                            </span>
                          )}
                        </div>
                      </td>
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
                        <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', alignItems: 'center' }}>
                          <button 
                            onClick={() => handleOpenManage(order)}
                            title={isTechOrAdmin ? "Atender" : "Ver"}
                            style={styles.actionBtnPrimary}
                          >
                            <Eye size={13} /> {isTechOrAdmin ? 'Atender' : 'Ver'}
                          </button>
                          {!['Resolvida', 'Cancelada', 'Concluída'].includes(order.status) && (
                            <button 
                              onClick={() => handleOpenCobrar(order)}
                              title="Cobrar agilidade da T.I."
                              style={styles.actionBtnZap}
                            >
                              <Zap size={13} />
                            </button>
                          )}
                          {canModifyOrder(order) && (
                            <button 
                              onClick={() => handleOpenEdit(order)}
                              title="Editar chamado/tarefa"
                              style={styles.actionBtnEdit}
                            >
                              <Edit size={13} />
                            </button>
                          )}
                          {canModifyOrder(order) && (
                            <button 
                              onClick={() => handleOpenDelete(order)}
                              title="Excluir chamado"
                              style={styles.actionBtnDelete}
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                          <button 
                            onClick={() => handlePrintOrder(order)}
                            title="Imprimir O.S."
                            style={styles.actionBtnSecondary}
                          >
                            <Printer size={13} />
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
          {sortedOrders.length === 0 ? (
            <div style={styles.emptyBox}>Nenhum chamado encontrado.</div>
          ) : (
            sortedOrders.map(order => {
              const sla = getSlaStatus(order);
              const pStyle = getPriorityBadgeStyle(order.priority);
              const sStyle = getStatusBadgeStyle(order.status);

              return (
                <div key={order.id} style={styles.card}>
                  <div style={styles.cardTop}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      <span style={styles.cardCode}>{order.code}</span>
                      {order.origin === 'internal' ? (
                        <span style={styles.badgeInternalMini}>
                          <Wrench size={10} /> Tarefa
                        </span>
                      ) : (
                        <span style={styles.badgeTicketMini}>
                          <Laptop size={10} /> Chamado
                        </span>
                      )}
                      {(order.urgencyCount || 0) > 0 && (
                        <span style={styles.badgeUrgentMini} title={`Cobrado ${order.urgencyCount}x por ${order.lastCobradoBy || 'solicitante'}`}>
                          <Zap size={9} /> Cobrado ({order.urgencyCount}x)
                        </span>
                      )}
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
                    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                      {!['Resolvida', 'Cancelada', 'Concluída'].includes(order.status) && (
                        <button onClick={() => handleOpenCobrar(order)} style={styles.actionBtnZap} title="Cobrar agilidade da T.I.">
                          <Zap size={13} />
                        </button>
                      )}
                      {canModifyOrder(order) && (
                        <button onClick={() => handleOpenEdit(order)} style={styles.actionBtnEdit} title="Editar">
                          <Edit size={13} />
                        </button>
                      )}
                      {canModifyOrder(order) && (
                        <button onClick={() => handleOpenDelete(order)} style={styles.actionBtnDelete} title="Excluir">
                          <Trash2 size={13} />
                        </button>
                      )}
                      <button onClick={() => handlePrintOrder(order)} style={styles.actionBtnSecondary} title="Imprimir">
                        <Printer size={13} />
                      </button>
                      <button onClick={() => handleOpenManage(order)} style={styles.actionBtnPrimary}>
                        <Eye size={13} /> {isTechOrAdmin ? 'Atender' : 'Ver'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* VIEW 3: KANBAN BOARD */}
      {viewMode === 'kanban' && (
        <div style={styles.kanbanContainer}>
          {KANBAN_COLUMNS.map(col => {
            const colOrders = sortedOrders.filter(o => col.statuses.includes(o.status));
            return (
              <div key={col.id} style={styles.kanbanCol}>
                <div style={{ ...styles.kanbanColHeader, borderTopColor: col.color }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ ...styles.kanbanDot, backgroundColor: col.color }} />
                    <span style={styles.kanbanColTitle}>{col.title}</span>
                  </div>
                  <span style={styles.kanbanCountBadge}>{colOrders.length}</span>
                </div>

                <div style={styles.kanbanCardsList}>
                  {colOrders.length === 0 ? (
                    <div style={styles.kanbanEmpty}>Nenhuma demanda</div>
                  ) : (
                    colOrders.map(order => {
                      const sla = getSlaStatus(order);
                      const pStyle = getPriorityBadgeStyle(order.priority);
                      const isInternal = order.origin === 'internal';

                      return (
                        <div key={order.id} style={styles.kanbanCard}>
                          {/* Card top */}
                          <div style={styles.kanbanCardTop}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
                              {isInternal ? (
                                <span style={styles.badgeInternalTag}>
                                  <Wrench size={10} /> Tarefa {order.taskType ? `• ${order.taskType}` : ''}
                                </span>
                              ) : (
                                <span style={styles.badgeTicketTag}>
                                  <Laptop size={10} /> Chamado
                                </span>
                              )}
                              {(order.urgencyCount || 0) > 0 && (
                                <span style={styles.badgeUrgentMini} title={`Cobrado ${order.urgencyCount}x`}>
                                  <Zap size={9} /> {order.urgencyCount}x
                                </span>
                              )}
                            </div>
                            <span style={{ ...styles.badge, backgroundColor: pStyle.bg, color: pStyle.text, borderColor: pStyle.border, fontSize: '10px' }}>
                              {order.priority}
                            </span>
                          </div>

                          <div style={styles.kanbanCardCode}>{order.code}</div>
                          <div style={styles.kanbanCardTitle}>{order.title}</div>

                          <div style={styles.kanbanCardMeta}>
                            <div>Setor: <strong style={{ color: '#1e293b' }}>{order.sector}</strong></div>
                            <div>Técnico: <strong style={{ color: '#4338ca' }}>{order.assignedTechnician || 'Pendente'}</strong></div>
                          </div>

                          {/* SLA Pill */}
                          <div style={{ margin: '6px 0' }}>
                            <span style={{ ...styles.badge, backgroundColor: sla.bg, color: sla.color, borderColor: sla.border, fontWeight: 700, fontSize: '10px' }}>
                              {sla.badgeText || sla.label}
                            </span>
                          </div>

                          {/* Card Actions & Moves */}
                          <div style={styles.kanbanCardActions}>
                            <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
                              <button 
                                type="button"
                                onClick={() => handleOpenManage(order)}
                                style={styles.actionBtnPrimary}
                                title={isTechOrAdmin ? "Atender" : "Ver"}
                              >
                                <Eye size={12} />
                              </button>
                              {!['Resolvida', 'Cancelada', 'Concluída'].includes(order.status) && (
                                <button 
                                  type="button"
                                  onClick={() => handleOpenCobrar(order)}
                                  style={styles.actionBtnZap}
                                  title="Cobrar agilidade da T.I."
                                >
                                  <Zap size={12} />
                                </button>
                              )}
                              {canModifyOrder(order) && (
                                <button 
                                  type="button"
                                  onClick={() => handleOpenEdit(order)}
                                  style={styles.actionBtnEdit}
                                  title="Editar"
                                >
                                  <Edit size={12} />
                                </button>
                              )}
                              {canModifyOrder(order) && (
                                <button 
                                  type="button"
                                  onClick={() => handleOpenDelete(order)}
                                  style={styles.actionBtnDelete}
                                  title="Excluir"
                                >
                                  <Trash2 size={12} />
                                </button>
                              )}
                              <button 
                                type="button"
                                onClick={() => handlePrintOrder(order)}
                                style={styles.actionBtnSecondary}
                                title="Imprimir"
                              >
                                <Printer size={12} />
                              </button>
                            </div>

                            {isTechOrAdmin && (
                              <div style={{ display: 'flex', gap: '4px' }}>
                                {col.id === 'pendente' && (
                                  <button
                                    type="button"
                                    onClick={() => handleQuickStatusChange(order, 'Em Atendimento')}
                                    style={styles.kanbanMoveBtn}
                                    title="Iniciar atendimento"
                                  >
                                    <Play size={10} /> Iniciar
                                  </button>
                                )}
                                {col.id === 'andamento' && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => handleQuickStatusChange(order, 'Aguardando Peça')}
                                      style={styles.kanbanMoveBtnWait}
                                      title="Aguardar Peça/Usuário"
                                    >
                                      <Pause size={10} /> Pausar
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleQuickStatusChange(order, 'Resolvida')}
                                      style={styles.kanbanMoveBtnSuccess}
                                      title="Concluir demanda"
                                    >
                                      <Check size={10} /> Concluir
                                    </button>
                                  </>
                                )}
                                {col.id === 'aguardando' && (
                                  <button
                                    type="button"
                                    onClick={() => handleQuickStatusChange(order, 'Em Atendimento')}
                                    style={styles.kanbanMoveBtn}
                                    title="Retomar atendimento"
                                  >
                                    <Play size={10} /> Retomar
                                  </button>
                                )}
                                {col.id === 'concluido' && (
                                  <button
                                    type="button"
                                    onClick={() => handleQuickStatusChange(order, 'Aberta')}
                                    style={styles.kanbanMoveBtnReopen}
                                    title="Reabrir demanda"
                                  >
                                    <RotateCcw size={10} /> Reabrir
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
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
                    placeholder="Ex: Impressora travou ou sem conexão Wi-Fi"
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    <h2 style={styles.modalTitle}>Chamado {selectedOrder.code}</h2>
                    {(selectedOrder.urgencyCount || 0) > 0 && (
                      <span style={styles.badgeUrgentMini}>
                        <Zap size={10} /> Cobrança Ativa ({selectedOrder.urgencyCount}x)
                      </span>
                    )}
                  </div>
                  <p style={styles.modalSubtitle}>{selectedOrder.title}</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                {!['Resolvida', 'Cancelada', 'Concluída'].includes(selectedOrder.status) && (
                  <button onClick={() => handleOpenCobrar(selectedOrder)} style={styles.actionBtnZap} title="Cobrar agilidade da T.I.">
                    <Zap size={14} /> Cobrar
                  </button>
                )}
                {canModifyOrder(selectedOrder) && (
                  <button onClick={() => handleOpenEdit(selectedOrder)} style={styles.actionBtnEdit} title="Editar chamado/tarefa">
                    <Edit size={14} /> Editar
                  </button>
                )}
                {canModifyOrder(selectedOrder) && (
                  <button onClick={() => handleOpenDelete(selectedOrder)} style={styles.actionBtnDelete} title="Excluir chamado">
                    <Trash2 size={14} /> Excluir
                  </button>
                )}
                <button onClick={() => handlePrintOrder(selectedOrder)} style={styles.actionBtnSecondary} title="Imprimir">
                  <Printer size={14} /> Imprimir
                </button>
                <button onClick={() => setShowManageModal(false)} style={styles.closeBtn}><X size={18} /></button>
              </div>
            </div>

            {/* Urgency Alert Banner if charged */}
            {(selectedOrder.urgencyCount || 0) > 0 && (
              <div style={styles.urgencyAlertBanner}>
                <Zap size={20} color="#d97706" style={{ flexShrink: 0 }} />
                <div>
                  <div style={{ fontWeight: 700, color: '#92400e', fontSize: '13px' }}>
                    Cobrança de Agilidade Ativa ({selectedOrder.urgencyCount}ª solicitação de prioridade)
                  </div>
                  <div style={{ fontSize: '12px', color: '#b45309', marginTop: '2px' }}>
                    Cobrado por <strong>{selectedOrder.lastCobradoBy || 'Solicitante'}</strong> em {selectedOrder.lastCobradoAt ? new Date(selectedOrder.lastCobradoAt).toLocaleString('pt-BR') : 'recente'}.
                  </div>
                </div>
              </div>
            )}

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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <h4 style={styles.timelineTitle}>
                  <MessageSquare size={16} /> Histórico & Interações
                </h4>
                {!['Resolvida', 'Cancelada', 'Concluída'].includes(selectedOrder.status) && (
                  <button 
                    type="button" 
                    onClick={() => handleOpenCobrar(selectedOrder)}
                    style={styles.btnUrgencyLink}
                    title="Cobrar agilidade da equipe de T.I."
                  >
                    <Zap size={13} /> Cobrar Agilidade
                  </button>
                )}
              </div>

              {/* Quick Tech Replies Chips (if Tech/Admin) */}
              {isTechOrAdmin && !['Resolvida', 'Cancelada', 'Concluída'].includes(selectedOrder.status) && (
                <div style={styles.quickRepliesContainer}>
                  <span style={styles.quickReplyLabel}>Respostas Rápidas:</span>
                  <button type="button" onClick={() => handleSendQuickReply('Técnico a caminho do setor.')} style={styles.quickReplyChip}>
                    🚶 Técnico a caminho
                  </button>
                  <button type="button" onClick={() => handleSendQuickReply('Em análise no laboratório de T.I.')} style={styles.quickReplyChip}>
                    🔬 No laboratório
                  </button>
                  <button type="button" onClick={() => handleSendQuickReply('Peça de reposição solicitada ao compras.')} style={styles.quickReplyChip}>
                    📦 Peça solicitada
                  </button>
                  <button type="button" onClick={() => handleSendQuickReply('Aguardando liberação de acesso/rede.')} style={styles.quickReplyChip}>
                    🔐 Aguardando acesso
                  </button>
                </div>
              )}

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
                {(selectedOrder.timelineLogs || []).map((log, idx) => {
                  const isUrgency = log.type === 'urgency' || (log.note && log.note.includes('COBRANÇA DE AGILIDADE'));
                  return (
                    <div 
                      key={log.id || idx} 
                      style={{
                        ...styles.timelineItem,
                        ...(isUrgency ? styles.timelineItemUrgent : {})
                      }}
                    >
                      <div style={{ ...styles.timelineBullet, ...(isUrgency ? styles.timelineBulletUrgent : {}) }}>
                        {isUrgency ? <Zap size={10} color="#ffffff" /> : null}
                      </div>
                      <div style={styles.timelineBody}>
                        <div style={styles.timelineHeader}>
                          <span style={{ ...styles.timelineAuthor, ...(isUrgency ? { color: '#92400e', fontWeight: 700 } : {}) }}>
                            {log.author}
                          </span>
                          <span style={styles.timelineDate}>{new Date(log.date).toLocaleString('pt-BR')}</span>
                          {log.status && <span style={styles.timelineStatus}>{log.status}</span>}
                          {isUrgency && <span style={styles.timelineUrgentTag}>⚡ Cobrança</span>}
                        </div>
                        <div style={{ ...styles.timelineNote, ...(isUrgency ? { color: '#78350f', fontWeight: 500 } : {}) }}>
                          {log.note}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* MODAL: EDIT IT SERVICE ORDER / TASK */}
      <ITEditModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setOrderToEdit(null);
        }}
        order={orderToEdit}
        onSave={handleSaveEdit}
        currentUser={currentUser}
      />

      {/* MODAL: COBRANÇA DE AGILIDADE */}
      <ITUrgencyModal
        isOpen={showUrgencyModal}
        onClose={() => {
          setShowUrgencyModal(false);
          setOrderToCobrar(null);
        }}
        order={orderToCobrar}
        onConfirm={handleConfirmCobrança}
        currentUser={currentUser}
      />

      {/* MODAL: CONFIRM DELETE */}
      {showDeleteModal && orderToDelete && (
        <div style={styles.modalOverlay}>
          <div style={{ ...styles.modalContent, maxWidth: '440px', textAlign: 'center' }}>
            <div style={styles.deleteModalIcon}>
              <Trash2 size={24} />
            </div>
            <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>
              Excluir Demanda {orderToDelete.code}?
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px', lineHeight: 1.5 }}>
              Esta ação é <strong>irreversível</strong> e removerá permanentemente o chamado <strong>"{orderToDelete.title}"</strong> e todo o seu histórico de interações.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button 
                type="button" 
                onClick={() => {
                  setShowDeleteModal(false);
                  setOrderToDelete(null);
                }} 
                style={styles.btnSecondary}
              >
                Cancelar
              </button>
              <button 
                type="button" 
                onClick={handleConfirmDelete} 
                style={styles.btnDanger}
              >
                <Trash2 size={15} /> Confirmar Exclusão
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: NOVA TAREFA PROATIVA DE T.I. */}
      <ITNewTaskModal
        isOpen={showNewTaskModal}
        onClose={() => setShowNewTaskModal(false)}
        onSave={handleSaveInternalTask}
        currentUser={currentUser}
      />

      {/* MODAL: RONDA DIÁRIA DE T.I. */}
      <ITDailyRoundModal
        isOpen={showDailyRoundModal}
        onClose={() => setShowDailyRoundModal(false)}
        currentUser={currentUser}
        onRoundSaved={() => showAlert('Ronda matinal de T.I. registrada com sucesso!', 'success')}
      />

      {/* MODAL: INVENTÁRIO DE ATIVOS T.I. */}
      <ITAssetsModal
        isOpen={showAssetsModal}
        onClose={() => setShowAssetsModal(false)}
        currentUser={currentUser}
      />

      {/* MODAL: BASE DE CONHECIMENTO (WIKI T.I.) */}
      <ITWikiModal
        isOpen={showWikiModal}
        onClose={() => setShowWikiModal(false)}
      />
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  originTabsRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '10px'
  },
  originPillsGroup: {
    display: 'flex',
    gap: '6px',
    background: 'var(--card-bg, #ffffff)',
    border: '1px solid var(--border-color, #e2e8f0)',
    borderRadius: '10px',
    padding: '4px'
  },
  originPill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 14px',
    borderRadius: '7px',
    border: 'none',
    background: 'transparent',
    color: '#64748b',
    fontSize: '12px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.15s ease'
  },
  originPillActive: {
    background: '#1e293b',
    color: '#ffffff'
  },
  originPillActiveUser: {
    background: '#2563eb',
    color: '#ffffff'
  },
  originPillActiveInternal: {
    background: '#7c3aed',
    color: '#ffffff'
  },
  btnPurple: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    background: '#7c3aed',
    color: '#ffffff',
    border: 'none',
    padding: '7px 12px',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: 600,
    cursor: 'pointer',
    boxShadow: '0 1px 3px rgba(124, 58, 237, 0.2)'
  },
  btnSky: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    background: '#0284c7',
    color: '#ffffff',
    border: 'none',
    padding: '7px 12px',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: 600,
    cursor: 'pointer'
  },
  btnIndigo: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    background: '#4f46e5',
    color: '#ffffff',
    border: 'none',
    padding: '7px 12px',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: 600,
    cursor: 'pointer'
  },
  btnEmerald: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    background: '#059669',
    color: '#ffffff',
    border: 'none',
    padding: '7px 12px',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: 600,
    cursor: 'pointer'
  },
  badgeInternalMini: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '3px',
    padding: '1px 5px',
    borderRadius: '4px',
    fontSize: '9px',
    fontWeight: 700,
    background: '#f5f3ff',
    color: '#7c3aed',
    border: '1px solid #ddd6fe',
    marginTop: '2px'
  },
  badgeTicketMini: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '3px',
    padding: '1px 5px',
    borderRadius: '4px',
    fontSize: '9px',
    fontWeight: 700,
    background: '#eff6ff',
    color: '#2563eb',
    border: '1px solid #bfdbfe',
    marginTop: '2px'
  },
  badgeInternalTag: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '2px 6px',
    borderRadius: '4px',
    fontSize: '10px',
    fontWeight: 700,
    background: '#f5f3ff',
    color: '#7c3aed',
    border: '1px solid #ddd6fe'
  },
  badgeTicketTag: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '2px 6px',
    borderRadius: '4px',
    fontSize: '10px',
    fontWeight: 700,
    background: '#eff6ff',
    color: '#2563eb',
    border: '1px solid #bfdbfe'
  },
  kanbanContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: '14px',
    alignItems: 'flex-start'
  },
  kanbanCol: {
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderTop: '3px solid',
    borderRadius: '10px',
    padding: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  kanbanColHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: '6px',
    borderBottom: '1px solid #e2e8f0'
  },
  kanbanDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%'
  },
  kanbanColTitle: {
    fontSize: '13px',
    fontWeight: 700,
    color: '#1e293b'
  },
  kanbanCountBadge: {
    fontSize: '11px',
    fontWeight: 700,
    background: '#ffffff',
    border: '1px solid #cbd5e1',
    color: '#475569',
    padding: '1px 6px',
    borderRadius: '10px'
  },
  kanbanCardsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    minHeight: '120px'
  },
  kanbanCard: {
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '10px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  kanbanCardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  kanbanCardCode: {
    fontSize: '11px',
    fontWeight: 800,
    color: '#4338ca'
  },
  kanbanCardTitle: {
    fontSize: '12px',
    fontWeight: 600,
    color: '#0f172a',
    lineHeight: 1.3
  },
  kanbanCardMeta: {
    fontSize: '10px',
    color: '#64748b',
    background: '#f8fafc',
    padding: '5px 7px',
    borderRadius: '5px',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px'
  },
  kanbanCardActions: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTop: '1px solid #f1f5f9',
    paddingTop: '6px',
    marginTop: '2px'
  },
  kanbanEmpty: {
    padding: '24px',
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: '11px',
    fontStyle: 'italic'
  },
  kanbanMoveBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '3px',
    background: '#f0fdf4',
    color: '#15803d',
    border: '1px solid #bbf7d0',
    padding: '3px 6px',
    borderRadius: '4px',
    fontSize: '10px',
    fontWeight: 700,
    cursor: 'pointer'
  },
  kanbanMoveBtnWait: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '3px',
    background: '#fffbeb',
    color: '#b45309',
    border: '1px solid #fde68a',
    padding: '3px 6px',
    borderRadius: '4px',
    fontSize: '10px',
    fontWeight: 700,
    cursor: 'pointer'
  },
  kanbanMoveBtnSuccess: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '3px',
    background: '#dcfce7',
    color: '#166534',
    border: '1px solid #86efac',
    padding: '3px 6px',
    borderRadius: '4px',
    fontSize: '10px',
    fontWeight: 700,
    cursor: 'pointer'
  },
  kanbanMoveBtnReopen: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '3px',
    background: '#f1f5f9',
    color: '#475569',
    border: '1px solid #cbd5e1',
    padding: '3px 6px',
    borderRadius: '4px',
    fontSize: '10px',
    fontWeight: 700,
    cursor: 'pointer'
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
  },
  originPillActiveUrgent: {
    background: '#d97706',
    color: '#ffffff'
  },
  badgeUrgentMini: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '3px',
    background: '#fffbeb',
    color: '#b45309',
    border: '1px solid #fde68a',
    borderRadius: '4px',
    padding: '1px 5px',
    fontSize: '10px',
    fontWeight: 700
  },
  actionBtnZap: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '3px',
    background: '#fffbeb',
    color: '#b45309',
    border: '1px solid #fde68a',
    padding: '4px 7px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: 700,
    cursor: 'pointer'
  },
  actionBtnEdit: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '3px',
    background: '#f8fafc',
    color: '#0284c7',
    border: '1px solid #bae6fd',
    padding: '4px 7px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: 600,
    cursor: 'pointer'
  },
  actionBtnDelete: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '3px',
    background: '#fef2f2',
    color: '#dc2626',
    border: '1px solid #fecaca',
    padding: '4px 7px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: 600,
    cursor: 'pointer'
  },
  btnCobrarHeader: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    background: '#fffbeb',
    color: '#b45309',
    border: '1px solid #fde68a',
    padding: '4px 9px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 700,
    cursor: 'pointer'
  },
  urgencyAlertBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    background: '#fffbeb',
    border: '1px solid #fde68a',
    borderRadius: '8px',
    padding: '10px 14px',
    marginBottom: '12px'
  },
  btnUrgencyLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    background: '#fffbeb',
    color: '#b45309',
    border: '1px solid #fde68a',
    padding: '3px 8px',
    borderRadius: '5px',
    fontSize: '11px',
    fontWeight: 700,
    cursor: 'pointer'
  },
  quickRepliesContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    flexWrap: 'wrap',
    marginBottom: '10px',
    background: '#f8fafc',
    padding: '6px 10px',
    borderRadius: '6px',
    border: '1px solid #e2e8f0'
  },
  quickReplyLabel: {
    fontSize: '10px',
    fontWeight: 700,
    color: '#64748b',
    textTransform: 'uppercase'
  },
  quickReplyChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    background: '#ffffff',
    border: '1px solid #cbd5e1',
    color: '#334155',
    padding: '2px 8px',
    borderRadius: '12px',
    fontSize: '10px',
    fontWeight: 600,
    cursor: 'pointer'
  },
  timelineItemUrgent: {
    background: '#fffbeb',
    border: '1px solid #fde68a',
    borderRadius: '6px',
    padding: '6px 8px'
  },
  timelineBulletUrgent: {
    width: '18px',
    height: '18px',
    borderRadius: '50%',
    background: '#f59e0b',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: '2px'
  },
  timelineUrgentTag: {
    background: '#fef3c7',
    color: '#b45309',
    fontSize: '9px',
    fontWeight: 800,
    padding: '1px 5px',
    borderRadius: '3px',
    border: '1px solid #fde68a'
  },
  deleteModalIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    background: '#fee2e2',
    color: '#dc2626',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 12px'
  },
  btnDanger: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    background: '#dc2626',
    color: '#ffffff',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: 700,
    cursor: 'pointer'
  }
};
