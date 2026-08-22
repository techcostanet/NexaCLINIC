import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShoppingBag, ClipboardList, CheckSquare, DollarSign, Truck, Plus, 
  Search, Building2, User, Clock, ArrowRight, ShieldAlert, Award,
  Edit, Trash2, X, AlertTriangle, ArrowUpDown, ChevronUp, ChevronDown,
  Package, Zap, CheckCircle2, History, Filter, RefreshCw
} from 'lucide-react';
import { dbService } from '../firebase';

export default function PurchasingPanel({ currentUser }) {
  const [activeTab, setActiveTab] = useState('reposition'); // 'reposition' | 'requests' | 'approvals' | 'quotes' | 'suppliers'
  const [purchases, setPurchases] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [user, setUser] = useState(currentUser || null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Filtros da Aba Reposição
  const [repositionSearch, setRepositionSearch] = useState('');
  const [repositionCategory, setRepositionCategory] = useState('all');
  const [repositionSeverity, setRepositionSeverity] = useState('all'); // 'all' | 'zero' | 'below_min'

  // Modais de Solicitação
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestForm, setRequestForm] = useState({
    type: 'Reposição', // 'Reposição' | 'Novo'
    selectedStockId: '',
    newItemName: '',
    quantity: 10,
    unit: 'Unidade',
    justification: '',
    sector: 'farmacia'
  });

  // Sala de Cotações
  const [quoteForm, setQuoteForm] = useState({
    supplierA: { name: '', price: '', deliveryDays: '' },
    supplierB: { name: '', price: '', deliveryDays: '' },
    supplierC: { name: '', price: '', deliveryDays: '' }
  });
  const [activeQuoteId, setActiveQuoteId] = useState(null);

  // Fornecedores e Ordenação
  const [supplierSearch, setSupplierSearch] = useState('');
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [supplierSortField, setSupplierSortField] = useState('name');
  const [supplierSortDirection, setSupplierSortDirection] = useState('asc'); // 'asc' | 'desc'
  const [supplierForm, setSupplierForm] = useState({
    name: '',
    tradeName: '',
    cnpj: '',
    phone: '',
    email: '',
    contactPerson: '',
    address: '',
    leadTime: 3,
    status: 'Homologado',
    notes: ''
  });

  useEffect(() => {
    if (currentUser) {
      setUser(currentUser);
    } else {
      const sessionUserId = sessionStorage.getItem('sistema_indicadores_session');
      if (dbService.getUsers) {
        dbService.getUsers().then(users => {
          const found = users?.find(u => u.uid === sessionUserId);
          if (found) setUser(found);
          else setUser({ name: 'Administrador TechCosta', role: 'admin', email: 'contato@techcosta.net' });
        });
      }
    }

    fetchData();
  }, [currentUser]);

  const fetchData = async (showSpinner = true) => {
    if (showSpinner) setLoading(true);
    try {
      const [purList, itemsList, suppList] = await Promise.all([
        dbService.getPurchases ? dbService.getPurchases() : [],
        dbService.getInventoryItems ? dbService.getInventoryItems() : [],
        dbService.getSuppliers ? dbService.getSuppliers() : []
      ]);

      setPurchases(purList || []);
      setInventoryItems(itemsList || []);
      setSuppliers(suppList || []);
    } catch (err) {
      console.error('Erro ao carregar dados do portal de compras:', err);
      showAlert('Erro ao carregar dados de compras.', 'danger');
    } finally {
      if (showSpinner) setLoading(false);
    }
  };

  const showAlert = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 5000);
  };

  // Itens Críticos do Estoque (Abaixo ou no Estoque Mínimo)
  const criticalItems = useMemo(() => {
    return inventoryItems.filter(item => {
      const current = parseFloat(item.currentStock) || 0;
      const min = parseFloat(item.minStock) || 0;
      // Item crítico se saldo for zero ou menor/igual ao mínimo
      return current <= min || current === 0;
    });
  }, [inventoryItems]);

  // Itens Críticos Filtrados
  const filteredCriticalItems = useMemo(() => {
    return criticalItems.filter(item => {
      // Busca
      if (repositionSearch) {
        const term = repositionSearch.toLowerCase();
        const matchName = item.name?.toLowerCase().includes(term);
        const matchCode = item.code?.toLowerCase().includes(term);
        const matchCat = item.category?.toLowerCase().includes(term);
        if (!matchName && !matchCode && !matchCat) return false;
      }

      // Categoria
      if (repositionCategory !== 'all' && item.category !== repositionCategory) {
        return false;
      }

      // Gravidade
      const current = parseFloat(item.currentStock) || 0;
      const min = parseFloat(item.minStock) || 0;
      if (repositionSeverity === 'zero' && current > 0) return false;
      if (repositionSeverity === 'below_min' && (current === 0 || current > min)) return false;

      return true;
    });
  }, [criticalItems, repositionSearch, repositionCategory, repositionSeverity]);

  // Categorias únicas dos itens do estoque
  const inventoryCategories = useMemo(() => {
    const set = new Set();
    inventoryItems.forEach(i => {
      if (i.category) set.add(i.category);
    });
    return Array.from(set);
  }, [inventoryItems]);

  // Contagens de Aprovações Pendentes
  const pendingApprovalsCount = useMemo(() => {
    return purchases.filter(p => p.status === 'Aguardando Gestor' || p.status === 'Aguardando Diretor').length;
  }, [purchases]);

  // Contagem de Cotações Pendentes
  const pendingQuotesCount = useMemo(() => {
    return purchases.filter(p => p.status === 'Aguardando Cotação').length;
  }, [purchases]);

  // Ordenação de Fornecedores Clicável
  const handleSortSuppliers = (field) => {
    if (supplierSortField === field) {
      setSupplierSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSupplierSortField(field);
      setSupplierSortDirection('asc');
    }
  };

  const sortedSuppliers = useMemo(() => {
    const list = suppliers.filter(s => 
      !supplierSearch || 
      (s.name && s.name.toLowerCase().includes(supplierSearch.toLowerCase())) ||
      (s.tradeName && s.tradeName.toLowerCase().includes(supplierSearch.toLowerCase())) ||
      (s.cnpj && s.cnpj.includes(supplierSearch)) ||
      (s.contactPerson && s.contactPerson.toLowerCase().includes(supplierSearch.toLowerCase()))
    );

    return list.sort((a, b) => {
      let aVal = a[supplierSortField] ?? '';
      let bVal = b[supplierSortField] ?? '';

      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();

      if (aVal < bVal) return supplierSortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return supplierSortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [suppliers, supplierSearch, supplierSortField, supplierSortDirection]);

  // Abrir Modal de Solicitação Rápida para Item Crítico Específico
  const handleQuickRequestItem = (item) => {
    const current = parseFloat(item.currentStock) || 0;
    const min = parseFloat(item.minStock) || 0;
    const ideal = parseFloat(item.idealStock) || (min * 2 > 0 ? min * 2 : 20);
    const suggestedQty = Math.max(1, Math.round(ideal - current));

    setRequestForm({
      type: 'Reposição',
      selectedStockId: item.id,
      newItemName: item.name,
      quantity: suggestedQty,
      unit: item.unit || 'Unidade',
      justification: `Reposição automática: Saldo atual (${current} ${item.unit || 'un'}) abaixo do mínimo (${min} ${item.unit || 'un'}).`,
      sector: item.category === 'Medicamento' ? 'farmacia' : 'enfermagem'
    });
    setShowRequestModal(true);
  };

  // Gerar Solicitação em Lote para TODOS os Itens Críticos
  const handleBatchRequestAllCritical = async () => {
    if (criticalItems.length === 0) {
      showAlert('Nenhum item crítico para reposição no momento.', 'warning');
      return;
    }

    if (!window.confirm(`Deseja gerar solicitações de compra automáticas para todos os ${criticalItems.length} itens críticos?`)) {
      return;
    }

    setActionLoading(true);
    try {
      let createdCount = 0;
      for (const item of criticalItems) {
        const current = parseFloat(item.currentStock) || 0;
        const min = parseFloat(item.minStock) || 0;
        const ideal = parseFloat(item.idealStock) || (min * 2 > 0 ? min * 2 : 20);
        const suggestedQty = Math.max(1, Math.round(ideal - current));

        const newRequest = {
          type: 'Reposição',
          productId: item.id,
          productName: item.name,
          quantity: suggestedQty,
          unit: item.unit || 'Unidade',
          justification: `Reposição em Lote: Saldo atual (${current}) crítico perante o estoque mínimo (${min}).`,
          sector: item.category === 'Medicamento' ? 'farmacia' : 'enfermagem',
          requesterName: currentUser?.name || 'Comprador NexaPROCURE',
          requesterEmail: currentUser?.email || 'compras@dialize.com.br',
          status: 'Aguardando Gestor',
          history: [
            { status: 'Aguardando Gestor', date: new Date().toISOString(), message: 'Solicitação gerada via Reposição Crítica em Lote.' }
          ]
        };

        await dbService.createPurchase(newRequest);
        createdCount++;
      }

      showAlert(`Sucesso! ${createdCount} solicitações de compras geradas para aprovação.`, 'success');
      fetchData(false);
      setActiveTab('requests');
    } catch (err) {
      console.error(err);
      showAlert('Erro ao gerar solicitações em lote.', 'danger');
    } finally {
      setActionLoading(false);
    }
  };

  // Criação Individual de Solicitação
  const handleCreateRequest = async (e) => {
    e.preventDefault();
    let name = requestForm.newItemName;
    if (requestForm.type === 'Reposição') {
      const selected = inventoryItems.find(itm => itm.id === requestForm.selectedStockId);
      if (!selected) return showAlert('Selecione um produto do estoque.', 'danger');
      name = selected.name;
    }

    if (!name) return showAlert('Informe o nome do item.', 'danger');

    setActionLoading(true);
    try {
      const newRequest = {
        type: requestForm.type,
        productId: requestForm.selectedStockId || 'novo-item',
        productName: name,
        quantity: parseInt(requestForm.quantity) || 1,
        unit: requestForm.unit || 'Unidade',
        justification: requestForm.justification,
        sector: requestForm.sector,
        requesterName: currentUser?.name || 'Funcionário',
        requesterEmail: currentUser?.email || 'funcionario@clinica.com',
        status: 'Aguardando Gestor',
        history: [
          { status: 'Aguardando Gestor', date: new Date().toISOString(), message: 'Solicitação de compra criada.' }
        ]
      };

      await dbService.createPurchase(newRequest);
      showAlert('Solicitação de compra criada com sucesso!', 'success');
      setShowRequestModal(false);
      setRequestForm({
        type: 'Reposição',
        selectedStockId: '',
        newItemName: '',
        quantity: 10,
        unit: 'Unidade',
        justification: '',
        sector: 'farmacia'
      });
      fetchData(false);
    } catch (err) {
      console.error(err);
      showAlert('Erro ao criar solicitação.', 'danger');
    } finally {
      setActionLoading(false);
    }
  };

  // Aprovação Gestor
  const handleApproveManager = async (req, approve = true) => {
    const updatedHistory = [
      ...req.history,
      { 
        status: approve ? 'Aguardando Diretor' : 'Recusado pelo Gestor', 
        date: new Date().toISOString(), 
        message: approve ? 'Aprovado pelo Gestor de Setor.' : 'Recusado pelo Gestor de Setor.' 
      }
    ];

    try {
      await dbService.updatePurchase(req.id, {
        status: approve ? 'Aguardando Diretor' : 'Recusado pelo Gestor',
        history: updatedHistory
      });
      showAlert(approve ? 'Aprovado! Enviado ao Diretor Clínico.' : 'Solicitação recusada.', 'success');
      fetchData(false);
    } catch (err) {
      console.error(err);
      showAlert('Erro ao processar aprovação.', 'danger');
    }
  };

  // Aprovação Diretor
  const handleApproveDirector = async (req, approve = true) => {
    const updatedHistory = [
      ...req.history,
      { 
        status: approve ? 'Aguardando Cotação' : 'Recusado pelo Diretor', 
        date: new Date().toISOString(), 
        message: approve ? 'Verba autorizada pelo Diretor Clínico.' : 'Recusado pelo Diretor Clínico.' 
      }
    ];

    try {
      await dbService.updatePurchase(req.id, {
        status: approve ? 'Aguardando Cotação' : 'Recusado pelo Diretor',
        history: updatedHistory
      });
      showAlert(approve ? 'Verba autorizada! Enviado para cotação.' : 'Compra recusada pela diretoria.', 'success');
      fetchData(false);
    } catch (err) {
      console.error(err);
      showAlert('Erro ao processar aprovação da diretoria.', 'danger');
    }
  };

  // Cotação Vencedora
  const calculateQuoteWinner = () => {
    const { supplierA, supplierB, supplierC } = quoteForm;
    const validQuotes = [
      { id: 'A', ...supplierA },
      { id: 'B', ...supplierB },
      { id: 'C', ...supplierC }
    ].filter(q => q.name && q.price && q.deliveryDays);

    if (validQuotes.length === 0) return { bestPrice: null, bestTime: null };

    let bestPrice = validQuotes[0];
    validQuotes.forEach(q => {
      if (parseFloat(q.price) < parseFloat(bestPrice.price)) bestPrice = q;
    });

    let bestTime = validQuotes[0];
    validQuotes.forEach(q => {
      if (parseInt(q.deliveryDays) < parseInt(bestTime.deliveryDays)) bestTime = q;
    });

    return { bestPrice, bestTime };
  };

  // Finalização da Compra com Automação de Estoque e Financeiro
  const handleFinalizePurchase = async (req, selectedSupplierId) => {
    const { supplierA, supplierB, supplierC } = quoteForm;
    const selectedSupplier = selectedSupplierId === 'A' ? supplierA : selectedSupplierId === 'B' ? supplierB : supplierC;

    if (!selectedSupplier || !selectedSupplier.name) {
      return showAlert('Selecione um orçamento válido.', 'danger');
    }

    const updatedHistory = [
      ...req.history,
      { 
        status: 'Finalizado', 
        date: new Date().toISOString(), 
        message: `Compra efetuada com ${selectedSupplier.name} por R$ ${parseFloat(selectedSupplier.price).toFixed(2)}.` 
      }
    ];

    setActionLoading(true);
    try {
      const payableRefId = 'PAY-' + Math.random().toString(36).substr(2, 7).toUpperCase();

      await dbService.updatePurchase(req.id, {
        status: 'Finalizado',
        quotes: { supplierA, supplierB, supplierC },
        selectedSupplier: selectedSupplierId,
        history: updatedHistory,
        payableId: payableRefId,
        paymentStatus: 'Pendente'
      });

      // 1. Entrada Automática no Estoque
      if (dbService.createStockTransaction) {
        await dbService.createStockTransaction({
          itemId: req.productId,
          itemName: req.productName,
          quantity: req.quantity,
          type: 'Entrada',
          batch: 'NEXAPROCURE-' + Math.random().toString(36).substr(2, 5).toUpperCase(),
          expiryDate: new Date(Date.now() + 365*24*60*60*1000).toISOString().substring(0, 10),
          operator: currentUser?.name || 'Compras',
          notes: `Entrada automática via NexaPROCURE. Fornecedor: ${selectedSupplier.name}`
        });
      }

      // 2. Lançamento Automático no Contas a Pagar
      if (dbService.saveAccountsPayable) {
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 30);
        await dbService.saveAccountsPayable({
          id: payableRefId,
          unit: 'Betim',
          costCenterId: '1.1',
          mesCompetencia: new Date().toISOString().substring(0, 7),
          fornecedor: selectedSupplier.name,
          descricao: `Compra de ${req.quantity}x ${req.productName}`,
          categoria: 'Insumos',
          valorTotal: parseFloat(selectedSupplier.price) * (req.quantity || 1),
          dataVencimento: dueDate.toISOString().substring(0, 10),
          formaPagamento: 'Boleto',
          status: 'Pendente',
          origemModulo: 'NexaPROCURE'
        });
      }

      showAlert(`Compra de "${req.productName}" finalizada! Entrada gerada no Estoque e no Financeiro.`, 'success');
      setActiveQuoteId(null);
      fetchData(false);
    } catch (err) {
      console.error(err);
      showAlert('Erro ao finalizar compra.', 'danger');
    } finally {
      setActionLoading(false);
    }
  };

  // Fornecedores - Ações
  const handleOpenSupplierAdd = () => {
    setEditingSupplier(null);
    setSupplierForm({
      name: '',
      tradeName: '',
      cnpj: '',
      phone: '',
      email: '',
      contactPerson: '',
      address: '',
      leadTime: 3,
      status: 'Homologado',
      notes: ''
    });
    setShowSupplierModal(true);
  };

  const handleOpenSupplierEdit = (sup) => {
    setEditingSupplier(sup);
    setSupplierForm({
      name: sup.name || '',
      tradeName: sup.tradeName || '',
      cnpj: sup.cnpj || '',
      phone: sup.phone || '',
      email: sup.email || '',
      contactPerson: sup.contactPerson || '',
      address: sup.address || '',
      leadTime: sup.leadTime || 3,
      status: sup.status || 'Homologado',
      notes: sup.notes || ''
    });
    setShowSupplierModal(true);
  };

  const handleSaveSupplier = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      if (editingSupplier) {
        await dbService.updateSupplier(editingSupplier.id, supplierForm);
        showAlert(`Fornecedor "${supplierForm.name}" atualizado!`, 'success');
      } else {
        await dbService.createSupplier ? await dbService.createSupplier(supplierForm) : await dbService.addSupplier(supplierForm);
        showAlert(`Fornecedor "${supplierForm.name}" cadastrado!`, 'success');
      }
      setShowSupplierModal(false);
      const updated = await dbService.getSuppliers();
      setSuppliers(updated || []);
    } catch (err) {
      console.error(err);
      showAlert('Erro ao salvar fornecedor.', 'danger');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteSupplier = async (id, name) => {
    if (!window.confirm(`Deseja realmente remover o fornecedor "${name}"?`)) return;
    setActionLoading(true);
    try {
      await dbService.deleteSupplier(id);
      showAlert(`Fornecedor "${name}" removido!`, 'success');
      const updated = await dbService.getSuppliers();
      setSuppliers(updated || []);
    } catch (err) {
      console.error(err);
      showAlert('Erro ao remover fornecedor.', 'danger');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'Aguardando Gestor': return { bg: '#fffbeb', text: '#b45309' };
      case 'Aguardando Diretor': return { bg: '#f0f9ff', text: '#0369a1' };
      case 'Aguardando Cotação': return { bg: '#eff6ff', text: '#1d4ed8' };
      case 'Finalizado': return { bg: '#ecfdf5', text: '#047857' };
      default: return { bg: '#fef2f2', text: '#b91c1c' };
    }
  };

  const { bestPrice, bestTime } = calculateQuoteWinner();

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

      {/* Hero Header Padronizado */}
      <div style={styles.heroSection}>
        <div style={styles.heroLeft}>
          <div style={styles.heroIconBadge}>
            <ShoppingBag size={28} color="#fff" />
          </div>
          <div>
            <h1 style={styles.heroTitle}>NexaPROCURE</h1>
            <p style={styles.heroSubtitle}>
              Gestão de compras hospitalares, reposição de estoque crítico, cotações triplas e fornecedores.
            </p>
          </div>
        </div>

        <div style={styles.heroActions}>
          {activeTab === 'reposition' && criticalItems.length > 0 && (
            <button 
              onClick={handleBatchRequestAllCritical}
              disabled={actionLoading}
              style={styles.batchBtn}
              title="Gerar solicitação de compras para todos os itens abaixo do mínimo"
            >
              <Zap size={18} />
              <span>Solicitação em Lote</span>
            </button>
          )}

          <button 
            onClick={() => {
              setRequestForm({
                type: 'Reposição',
                selectedStockId: '',
                newItemName: '',
                quantity: 10,
                unit: 'Unidade',
                justification: '',
                sector: 'farmacia'
              });
              setShowRequestModal(true);
            }}
            style={styles.primaryBtn}
          >
            <Plus size={18} />
            <span>Nova Solicitação</span>
          </button>
        </div>
      </div>

      {/* Abas com Contadores Dinâmicos */}
      <div style={styles.tabsWrapper}>
        <button 
          onClick={() => setActiveTab('reposition')} 
          style={{
            ...styles.tabBtn,
            color: activeTab === 'reposition' ? '#0891b2' : 'var(--text-secondary)',
            borderBottomColor: activeTab === 'reposition' ? '#0891b2' : 'transparent',
            fontWeight: activeTab === 'reposition' ? '700' : '600'
          }}
        >
          <Zap size={16} color={activeTab === 'reposition' ? '#0891b2' : 'currentColor'} />
          <span>Reposição</span>
          {criticalItems.length > 0 && (
            <span style={styles.badgeDanger}>{criticalItems.length}</span>
          )}
        </button>

        <button 
          onClick={() => setActiveTab('requests')} 
          style={{
            ...styles.tabBtn,
            color: activeTab === 'requests' ? '#0891b2' : 'var(--text-secondary)',
            borderBottomColor: activeTab === 'requests' ? '#0891b2' : 'transparent',
            fontWeight: activeTab === 'requests' ? '700' : '600'
          }}
        >
          <ClipboardList size={16} color={activeTab === 'requests' ? '#0891b2' : 'currentColor'} />
          <span>Solicitações</span>
          <span style={styles.badgeNeutral}>{purchases.length}</span>
        </button>

        <button 
          onClick={() => setActiveTab('approvals')} 
          style={{
            ...styles.tabBtn,
            color: activeTab === 'approvals' ? '#0891b2' : 'var(--text-secondary)',
            borderBottomColor: activeTab === 'approvals' ? '#0891b2' : 'transparent',
            fontWeight: activeTab === 'approvals' ? '700' : '600'
          }}
        >
          <CheckSquare size={16} color={activeTab === 'approvals' ? '#0891b2' : 'currentColor'} />
          <span>Aprovações</span>
          {pendingApprovalsCount > 0 && (
            <span style={styles.badgeWarning}>{pendingApprovalsCount}</span>
          )}
        </button>

        <button 
          onClick={() => setActiveTab('quotes')} 
          style={{
            ...styles.tabBtn,
            color: activeTab === 'quotes' ? '#0891b2' : 'var(--text-secondary)',
            borderBottomColor: activeTab === 'quotes' ? '#0891b2' : 'transparent',
            fontWeight: activeTab === 'quotes' ? '700' : '600'
          }}
        >
          <DollarSign size={16} color={activeTab === 'quotes' ? '#0891b2' : 'currentColor'} />
          <span>Cotações</span>
          {pendingQuotesCount > 0 && (
            <span style={styles.badgeInfo}>{pendingQuotesCount}</span>
          )}
        </button>

        <button 
          onClick={() => setActiveTab('suppliers')} 
          style={{
            ...styles.tabBtn,
            color: activeTab === 'suppliers' ? '#0891b2' : 'var(--text-secondary)',
            borderBottomColor: activeTab === 'suppliers' ? '#0891b2' : 'transparent',
            fontWeight: activeTab === 'suppliers' ? '700' : '600'
          }}
        >
          <Building2 size={16} color={activeTab === 'suppliers' ? '#0891b2' : 'currentColor'} />
          <span>Fornecedores</span>
          <span style={styles.badgeNeutral}>{suppliers.length}</span>
        </button>
      </div>

      {loading ? (
        <div style={styles.emptyState}>
          <RefreshCw size={32} color="#0891b2" className="spin" />
          <p style={{ marginTop: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Carregando dados de compras e estoque...
          </p>
        </div>
      ) : (
        <>
          {/* TAB 1: REPOSIÇÃO CRÍTICA (Estoque Mínimo em Tempo Real) */}
          {activeTab === 'reposition' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Cards de Métricas da Reposição */}
              <div style={styles.repositionMetricsGrid}>
                <div style={styles.repositionMetricCard}>
                  <span style={styles.metricLabel}>Total Crítico</span>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', marginTop: '0.25rem' }}>
                    <strong style={{ fontSize: '1.6rem', color: criticalItems.length > 0 ? '#ef4444' : '#10b981' }}>
                      {criticalItems.length}
                    </strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>itens</span>
                  </div>
                </div>

                <div style={styles.repositionMetricCard}>
                  <span style={styles.metricLabel}>Estoque Zerado</span>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', marginTop: '0.25rem' }}>
                    <strong style={{ fontSize: '1.6rem', color: '#b91c1c' }}>
                      {criticalItems.filter(i => (parseFloat(i.currentStock) || 0) === 0).length}
                    </strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>urgentes</span>
                  </div>
                </div>

                <div style={styles.repositionMetricCard}>
                  <span style={styles.metricLabel}>Abaixo do Mínimo</span>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', marginTop: '0.25rem' }}>
                    <strong style={{ fontSize: '1.6rem', color: '#d97706' }}>
                      {criticalItems.filter(i => {
                        const cur = parseFloat(i.currentStock) || 0;
                        const min = parseFloat(i.minStock) || 0;
                        return cur > 0 && cur <= min;
                      }).length}
                    </strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>itens</span>
                  </div>
                </div>

                <div style={styles.repositionMetricCard}>
                  <span style={styles.metricLabel}>Catálogo Total</span>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', marginTop: '0.25rem' }}>
                    <strong style={{ fontSize: '1.6rem', color: 'var(--text-primary)' }}>
                      {inventoryItems.length}
                    </strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>cadastrados</span>
                  </div>
                </div>
              </div>

              {/* Barra de Filtros da Reposição */}
              <div style={styles.filterBar}>
                <div style={styles.searchBox}>
                  <Search size={18} color="var(--text-secondary)" />
                  <input 
                    type="text"
                    placeholder="Buscar insumo crítico por nome ou código..."
                    value={repositionSearch}
                    onChange={(e) => setRepositionSearch(e.target.value)}
                    style={styles.searchInput}
                  />
                  {repositionSearch && (
                    <button onClick={() => setRepositionSearch('')} style={styles.clearSearchBtn}>×</button>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  <select 
                    value={repositionCategory} 
                    onChange={(e) => setRepositionCategory(e.target.value)}
                    style={styles.selectInput}
                  >
                    <option value="all">📁 Categorias</option>
                    {inventoryCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>

                  <select 
                    value={repositionSeverity} 
                    onChange={(e) => setRepositionSeverity(e.target.value)}
                    style={styles.selectInput}
                  >
                    <option value="all">⚠️ Gravidade</option>
                    <option value="zero">🔴 Somente Zerados (0)</option>
                    <option value="below_min">🟡 Abaixo do Mínimo</option>
                  </select>

                  <button onClick={() => fetchData(true)} style={styles.refreshBtn} title="Atualizar estoque em tempo real">
                    <RefreshCw size={16} />
                  </button>
                </div>
              </div>

              {/* Tabela de Itens Críticos */}
              <div style={styles.tableCard}>
                <table style={styles.table}>
                  <thead>
                    <tr style={styles.theadRow}>
                      <th style={styles.th}>Insumo</th>
                      <th style={styles.th}>Categoria</th>
                      <th style={styles.th}>Saldo</th>
                      <th style={styles.th}>Mínimo</th>
                      <th style={styles.th}>Ideal</th>
                      <th style={styles.th}>Sugestão</th>
                      <th style={styles.th}>Custo</th>
                      <th style={{ ...styles.th, textAlign: 'right' }}>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCriticalItems.length === 0 ? (
                      <tr>
                        <td colSpan="8" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                          <CheckCircle2 size={36} color="#10b981" style={{ margin: '0 auto 0.5rem auto' }} />
                          <div style={{ fontWeight: '700', color: 'var(--text-primary)' }}>Estoque em Nível Seguro!</div>
                          <span style={{ fontSize: '0.85rem' }}>Nenhum produto está abaixo do estoque mínimo com os filtros selecionados.</span>
                        </td>
                      </tr>
                    ) : (
                      filteredCriticalItems.map(item => {
                        const current = parseFloat(item.currentStock) || 0;
                        const min = parseFloat(item.minStock) || 0;
                        const ideal = parseFloat(item.idealStock) || (min * 2 > 0 ? min * 2 : 20);
                        const suggestedQty = Math.max(1, Math.round(ideal - current));
                        const isZero = current === 0;

                        return (
                          <tr key={item.id} style={styles.tr}>
                            <td style={styles.td}>
                              <div style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{item.name}</div>
                              {item.code && (
                                <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Cód: {item.code}</span>
                              )}
                            </td>
                            <td style={styles.td}>
                              <span style={styles.categoryBadge}>
                                {item.category || 'Geral'}
                              </span>
                            </td>
                            <td style={styles.td}>
                              <span style={{
                                ...styles.stockStatusBadge,
                                backgroundColor: isZero ? '#fef2f2' : '#fffbeb',
                                color: isZero ? '#ef4444' : '#d97706',
                                borderColor: isZero ? '#fecaca' : '#fde68a'
                              }}>
                                {current} {item.unit || 'un'}
                              </span>
                            </td>
                            <td style={styles.td}>
                              <span style={{ fontWeight: '600', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                {min} {item.unit || 'un'}
                              </span>
                            </td>
                            <td style={styles.td}>
                              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                {ideal} {item.unit || 'un'}
                              </span>
                            </td>
                            <td style={styles.td}>
                              <span style={{ fontWeight: '800', color: '#0891b2', fontSize: '0.9rem' }}>
                                +{suggestedQty} {item.unit || 'un'}
                              </span>
                            </td>
                            <td style={styles.td}>
                              <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: '600' }}>
                                {item.costPrice ? `R$ ${parseFloat(item.costPrice).toFixed(2)}` : '--'}
                              </span>
                            </td>
                            <td style={{ ...styles.td, textAlign: 'right' }}>
                              <button 
                                onClick={() => handleQuickRequestItem(item)}
                                style={styles.quickOrderBtn}
                                title="Solicitar compra direta deste item"
                              >
                                <Zap size={14} />
                                <span>Solicitar</span>
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

          {/* TAB 2: SOLICITAÇÕES DE COMPRA */}
          {activeTab === 'requests' && (
            <div style={styles.listCard}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', margin: 0, color: 'var(--text-primary)' }}>
                  📋 Esteira de Solicitações de Compras
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {purchases.length === 0 ? (
                  <p style={styles.noDataText}>Nenhuma solicitação de compra registrada.</p>
                ) : (
                  purchases.map(req => {
                    const badge = getStatusBadgeColor(req.status);
                    return (
                      <div key={req.id} style={styles.purchaseItem}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                          <div>
                            <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>{req.productName}</strong>
                            <span style={{ fontSize: '0.78rem', display: 'block', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                              Quantidade: <strong>{req.quantity} {req.unit || 'un'}</strong> | Solicitante: {req.requesterName} ({req.sector?.toUpperCase()})
                            </span>
                            {req.justification && (
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontStyle: 'italic', display: 'block', marginTop: '0.2rem' }}>
                                "{req.justification}"
                              </span>
                            )}
                          </div>
                          <span style={{ ...styles.statusBadge, backgroundColor: badge.bg, color: badge.text }}>
                            {req.status}
                          </span>
                        </div>

                        {/* Stepper Timeline */}
                        <div style={styles.timelineWrapper}>
                          <div style={styles.timelineTrack}></div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', width: '100%' }}>
                            {['Solicitado', 'Gestor', 'Diretor', 'Cotação', 'Finalizado'].map((step, idx) => {
                              let isDone = false;
                              if (step === 'Solicitado') isDone = true;
                              if (step === 'Gestor' && ['Aguardando Diretor', 'Aguardando Cotação', 'Finalizado'].includes(req.status)) isDone = true;
                              if (step === 'Diretor' && ['Aguardando Cotação', 'Finalizado'].includes(req.status)) isDone = true;
                              if (step === 'Cotação' && req.status === 'Finalizado') isDone = true;
                              if (step === 'Finalizado' && req.status === 'Finalizado') isDone = true;

                              return (
                                <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                  <div style={{ 
                                    ...styles.timelineNode, 
                                    backgroundColor: isDone ? '#10b981' : '#e2e8f0',
                                    color: isDone ? '#fff' : '#94a3b8'
                                  }}>
                                    {idx + 1}
                                  </div>
                                  <span style={{ fontSize: '0.65rem', color: isDone ? '#10b981' : 'var(--text-secondary)', fontWeight: '600', marginTop: '0.25rem' }}>
                                    {step}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB 3: APROVAÇÕES PENDENTES */}
          {activeTab === 'approvals' && (
            <div style={styles.listCard}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1.25rem', color: 'var(--text-primary)' }}>
                🔑 Alçadas de Aprovações Pendentes
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {purchases.filter(p => p.status === 'Aguardando Gestor' || p.status === 'Aguardando Diretor').length === 0 ? (
                  <p style={styles.noDataText}>Nenhuma aprovação pendente no momento.</p>
                ) : (
                  purchases.filter(p => p.status === 'Aguardando Gestor' || p.status === 'Aguardando Diretor').map(req => {
                    const isManagerLevel = req.status === 'Aguardando Gestor';
                    
                    return (
                      <div key={req.id} style={styles.approvalRow}>
                        <div style={{ flex: 1 }}>
                          <span style={{ 
                            fontSize: '0.7rem', 
                            padding: '0.15rem 0.5rem', 
                            borderRadius: '6px', 
                            backgroundColor: isManagerLevel ? '#fffbeb' : '#f0f9ff', 
                            color: isManagerLevel ? '#b45309' : '#0369a1',
                            fontWeight: '700',
                            textTransform: 'uppercase',
                            marginRight: '0.5rem'
                          }}>
                            {req.status}
                          </span>
                          <strong style={{ fontSize: '0.95rem' }}>{req.productName}</strong>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                            Quantidade: <strong>{req.quantity} {req.unit || 'un'}</strong> | Setor: <strong>{req.sector?.toUpperCase()}</strong> | Solicitante: {req.requesterName}
                          </div>
                          {req.justification && (
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontStyle: 'italic', marginTop: '0.25rem', paddingLeft: '0.5rem', borderLeft: '2px solid #e5e7eb' }}>
                              "{req.justification}"
                            </div>
                          )}
                        </div>

                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          {isManagerLevel ? (
                            <>
                              <button onClick={() => handleApproveManager(req, false)} style={styles.rejectBtn}>Recusar</button>
                              <button onClick={() => handleApproveManager(req, true)} style={styles.approveBtn}>Aprovar Gestor</button>
                            </>
                          ) : (
                            <>
                              <button onClick={() => handleApproveDirector(req, false)} style={styles.rejectBtn}>Recusar</button>
                              <button onClick={() => handleApproveDirector(req, true)} style={styles.approveBtn}>Autorizar Verba</button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB 4: SALA DE COTAÇÕES */}
          {activeTab === 'quotes' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 2fr', gap: '1.5rem' }}>
              {/* Itens aguardando cotação */}
              <div style={styles.listCard}>
                <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--text-primary)' }}>
                  📦 Itens Aguardando Cotação
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {purchases.filter(p => p.status === 'Aguardando Cotação').length === 0 ? (
                    <p style={styles.noDataText}>Nenhum item aguardando cotação.</p>
                  ) : (
                    purchases.filter(p => p.status === 'Aguardando Cotação').map(req => (
                      <div 
                        key={req.id} 
                        onClick={() => {
                          setActiveQuoteId(req.id);
                          setQuoteForm({
                            supplierA: { name: '', price: '', deliveryDays: '' },
                            supplierB: { name: '', price: '', deliveryDays: '' },
                            supplierC: { name: '', price: '', deliveryDays: '' }
                          });
                        }}
                        style={{ 
                          ...styles.quoteSelectableItem,
                          borderLeftColor: activeQuoteId === req.id ? '#0891b2' : 'var(--border-color)',
                          backgroundColor: activeQuoteId === req.id ? '#ecfeff' : '#fff'
                        }}
                      >
                        <strong style={{ color: 'var(--text-primary)', fontSize: '0.9rem' }}>{req.productName}</strong>
                        <span style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                          Qtd: <strong>{req.quantity} {req.unit || 'un'}</strong> | Setor: {req.sector?.toUpperCase()}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Formulário Comparativo de Cotações */}
              <div style={styles.formCard}>
                {activeQuoteId ? (
                  (() => {
                    const currentReq = purchases.find(p => p.id === activeQuoteId);
                    return (
                      <div>
                        <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '1rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.5rem', color: 'var(--text-primary)' }}>
                          📊 Comparar 3 Orçamentos — {currentReq?.productName} (Qtd: {currentReq?.quantity} {currentReq?.unit || 'un'})
                        </h3>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
                          {/* Fornecedor A */}
                          <div style={styles.supplierBlock}>
                            <h4 style={{ fontSize: '0.8rem', fontWeight: '700', marginBottom: '0.5rem', color: '#0891b2' }}>Fornecedor A</h4>
                            <div style={styles.formGroup}>
                              <label style={styles.formLabel}>Fornecedor</label>
                              <input type="text" placeholder="Nome da Distribuidora" style={styles.modalInput} value={quoteForm.supplierA.name} onChange={e => setQuoteForm({ ...quoteForm, supplierA: { ...quoteForm.supplierA, name: e.target.value } })} />
                            </div>
                            <div style={styles.formGroup}>
                              <label style={styles.formLabel}>Preço (R$)</label>
                              <input type="number" step="0.01" placeholder="0.00" style={styles.modalInput} value={quoteForm.supplierA.price} onChange={e => setQuoteForm({ ...quoteForm, supplierA: { ...quoteForm.supplierA, price: e.target.value } })} />
                            </div>
                            <div style={styles.formGroup}>
                              <label style={styles.formLabel}>Prazo (Dias)</label>
                              <input type="number" placeholder="Ex: 3" style={styles.modalInput} value={quoteForm.supplierA.deliveryDays} onChange={e => setQuoteForm({ ...quoteForm, supplierA: { ...quoteForm.supplierA, deliveryDays: e.target.value } })} />
                            </div>
                          </div>

                          {/* Fornecedor B */}
                          <div style={styles.supplierBlock}>
                            <h4 style={{ fontSize: '0.8rem', fontWeight: '700', marginBottom: '0.5rem', color: '#10b981' }}>Fornecedor B</h4>
                            <div style={styles.formGroup}>
                              <label style={styles.formLabel}>Fornecedor</label>
                              <input type="text" placeholder="Nome da Distribuidora" style={styles.modalInput} value={quoteForm.supplierB.name} onChange={e => setQuoteForm({ ...quoteForm, supplierB: { ...quoteForm.supplierB, name: e.target.value } })} />
                            </div>
                            <div style={styles.formGroup}>
                              <label style={styles.formLabel}>Preço (R$)</label>
                              <input type="number" step="0.01" placeholder="0.00" style={styles.modalInput} value={quoteForm.supplierB.price} onChange={e => setQuoteForm({ ...quoteForm, supplierB: { ...quoteForm.supplierB, price: e.target.value } })} />
                            </div>
                            <div style={styles.formGroup}>
                              <label style={styles.formLabel}>Prazo (Dias)</label>
                              <input type="number" placeholder="Ex: 5" style={styles.modalInput} value={quoteForm.supplierB.deliveryDays} onChange={e => setQuoteForm({ ...quoteForm, supplierB: { ...quoteForm.supplierB, deliveryDays: e.target.value } })} />
                            </div>
                          </div>

                          {/* Fornecedor C */}
                          <div style={styles.supplierBlock}>
                            <h4 style={{ fontSize: '0.8rem', fontWeight: '700', marginBottom: '0.5rem', color: '#8b5cf6' }}>Fornecedor C</h4>
                            <div style={styles.formGroup}>
                              <label style={styles.formLabel}>Fornecedor</label>
                              <input type="text" placeholder="Nome da Distribuidora" style={styles.modalInput} value={quoteForm.supplierC.name} onChange={e => setQuoteForm({ ...quoteForm, supplierC: { ...quoteForm.supplierC, name: e.target.value } })} />
                            </div>
                            <div style={styles.formGroup}>
                              <label style={styles.formLabel}>Preço (R$)</label>
                              <input type="number" step="0.01" placeholder="0.00" style={styles.modalInput} value={quoteForm.supplierC.price} onChange={e => setQuoteForm({ ...quoteForm, supplierC: { ...quoteForm.supplierC, price: e.target.value } })} />
                            </div>
                            <div style={styles.formGroup}>
                              <label style={styles.formLabel}>Prazo (Dias)</label>
                              <input type="number" placeholder="Ex: 7" style={styles.modalInput} value={quoteForm.supplierC.deliveryDays} onChange={e => setQuoteForm({ ...quoteForm, supplierC: { ...quoteForm.supplierC, deliveryDays: e.target.value } })} />
                            </div>
                          </div>
                        </div>

                        {/* Vencedores Destacados */}
                        {bestPrice && (
                          <div style={styles.metricsWrapper}>
                            {bestPrice.name && (
                              <div style={styles.metricItem}>
                                <Award size={20} color="#10b981" />
                                <div>
                                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Melhor Preço 💰</div>
                                  <strong style={{ fontSize: '0.9rem', color: '#047857' }}>{bestPrice.name} (R$ {parseFloat(bestPrice.price).toFixed(2)})</strong>
                                </div>
                              </div>
                            )}
                            {bestTime.name && (
                              <div style={styles.metricItem}>
                                <Truck size={20} color="#0891b2" />
                                <div>
                                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Entrega Mais Rápida ⚡</div>
                                  <strong style={{ fontSize: '0.9rem', color: '#0369a1' }}>{bestTime.name} ({bestTime.deliveryDays} dias)</strong>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Botões de Decisão de Compra */}
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
                          <button onClick={() => handleFinalizePurchase(currentReq, 'A')} disabled={!quoteForm.supplierA.name || actionLoading} style={{ ...styles.decisionBtn, backgroundColor: '#0891b2' }}>Comprar do A</button>
                          <button onClick={() => handleFinalizePurchase(currentReq, 'B')} disabled={!quoteForm.supplierB.name || actionLoading} style={{ ...styles.decisionBtn, backgroundColor: '#10b981' }}>Comprar do B</button>
                          <button onClick={() => handleFinalizePurchase(currentReq, 'C')} disabled={!quoteForm.supplierC.name || actionLoading} style={{ ...styles.decisionBtn, backgroundColor: '#8b5cf6' }}>Comprar do C</button>
                        </div>
                      </div>
                    );
                  })()
                ) : (
                  <p style={{ ...styles.noDataText, textAlign: 'center', margin: '4rem 0' }}>Selecione um item na lista ao lado para comparar os orçamentos.</p>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: GESTÃO DE FORNECEDORES (Colunas Clicáveis para Ordenação) */}
          {activeTab === 'suppliers' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={styles.filterBar}>
                <div style={styles.searchBox}>
                  <Search size={18} color="var(--text-secondary)" />
                  <input 
                    type="text" 
                    placeholder="Buscar fornecedor por razão, fantasia, CNPJ ou contato..." 
                    value={supplierSearch} 
                    onChange={e => setSupplierSearch(e.target.value)} 
                    style={styles.searchInput}
                  />
                  {supplierSearch && (
                    <button onClick={() => setSupplierSearch('')} style={styles.clearSearchBtn}>×</button>
                  )}
                </div>
                <button onClick={handleOpenSupplierAdd} style={styles.primaryBtn}>
                  <Plus size={16} /> <span>Novo Fornecedor</span>
                </button>
              </div>

              <div style={styles.tableCard}>
                <table style={styles.table}>
                  <thead>
                    <tr style={styles.theadRow}>
                      <th 
                        onClick={() => handleSortSuppliers('name')}
                        style={{ ...styles.th, cursor: 'pointer', userSelect: 'none' }}
                        title="Clique para ordenar por Razão Social"
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <span>Razão</span>
                          {supplierSortField === 'name' ? (
                            supplierSortDirection === 'asc' ? <ChevronUp size={14} color="#0891b2" /> : <ChevronDown size={14} color="#0891b2" />
                          ) : (
                            <ArrowUpDown size={12} color="#9ca3af" />
                          )}
                        </div>
                      </th>

                      <th 
                        onClick={() => handleSortSuppliers('cnpj')}
                        style={{ ...styles.th, cursor: 'pointer', userSelect: 'none' }}
                        title="Clique para ordenar por CNPJ"
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <span>CNPJ</span>
                          {supplierSortField === 'cnpj' ? (
                            supplierSortDirection === 'asc' ? <ChevronUp size={14} color="#0891b2" /> : <ChevronDown size={14} color="#0891b2" />
                          ) : (
                            <ArrowUpDown size={12} color="#9ca3af" />
                          )}
                        </div>
                      </th>

                      <th 
                        onClick={() => handleSortSuppliers('contactPerson')}
                        style={{ ...styles.th, cursor: 'pointer', userSelect: 'none' }}
                        title="Clique para ordenar por Contato"
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <span>Contato</span>
                          {supplierSortField === 'contactPerson' ? (
                            supplierSortDirection === 'asc' ? <ChevronUp size={14} color="#0891b2" /> : <ChevronDown size={14} color="#0891b2" />
                          ) : (
                            <ArrowUpDown size={12} color="#9ca3af" />
                          )}
                        </div>
                      </th>

                      <th 
                        onClick={() => handleSortSuppliers('email')}
                        style={{ ...styles.th, cursor: 'pointer', userSelect: 'none' }}
                        title="Clique para ordenar por Email"
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <span>Email</span>
                          {supplierSortField === 'email' ? (
                            supplierSortDirection === 'asc' ? <ChevronUp size={14} color="#0891b2" /> : <ChevronDown size={14} color="#0891b2" />
                          ) : (
                            <ArrowUpDown size={12} color="#9ca3af" />
                          )}
                        </div>
                      </th>

                      <th 
                        onClick={() => handleSortSuppliers('leadTime')}
                        style={{ ...styles.th, cursor: 'pointer', userSelect: 'none' }}
                        title="Clique para ordenar por Prazo"
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <span>Prazo</span>
                          {supplierSortField === 'leadTime' ? (
                            supplierSortDirection === 'asc' ? <ChevronUp size={14} color="#0891b2" /> : <ChevronDown size={14} color="#0891b2" />
                          ) : (
                            <ArrowUpDown size={12} color="#9ca3af" />
                          )}
                        </div>
                      </th>

                      <th style={{ ...styles.th, textAlign: 'right' }}>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedSuppliers.length === 0 ? (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-secondary)' }}>
                          Nenhum fornecedor encontrado. Clique em "Novo Fornecedor" para cadastrar.
                        </td>
                      </tr>
                    ) : (
                      sortedSuppliers.map(sup => (
                        <tr key={sup.id} style={styles.tr}>
                          <td style={styles.td}>
                            <div style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{sup.name}</div>
                            {sup.tradeName && (
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{sup.tradeName}</span>
                            )}
                          </td>
                          <td style={styles.td}>{sup.cnpj || '-'}</td>
                          <td style={styles.td}>
                            <div>{sup.contactPerson || '-'}</div>
                            {sup.phone && <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{sup.phone}</span>}
                          </td>
                          <td style={styles.td}>{sup.email || '-'}</td>
                          <td style={styles.td}>
                            <span style={styles.leadTimeBadge}>
                              <Truck size={12} /> {sup.leadTime || 3} dias
                            </span>
                          </td>
                          <td style={{ ...styles.td, textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                              <button onClick={() => handleOpenSupplierEdit(sup)} style={styles.cardActionBtn} title="Editar">
                                <Edit size={15} />
                              </button>
                              <button onClick={() => handleDeleteSupplier(sup.id, sup.name)} style={{ ...styles.cardActionBtn, color: '#ef4444' }} title="Excluir">
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* MODAL: NOVA / EDITAR SOLICITAÇÃO */}
      {showRequestModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShoppingBag size={20} color="#0891b2" />
                <h3 style={styles.modalTitle}>Nova Solicitação de Compra</h3>
              </div>
              <button onClick={() => setShowRequestModal(false)} style={styles.modalCloseBtn}>×</button>
            </div>

            <form onSubmit={handleCreateRequest} style={styles.modalForm}>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Tipo</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setRequestForm(prev => ({ ...prev, type: 'Reposição' }))}
                    style={{
                      ...styles.catSelectBtn,
                      backgroundColor: requestForm.type === 'Reposição' ? '#0891b2' : '#f3f4f6',
                      color: requestForm.type === 'Reposição' ? '#fff' : 'var(--text-primary)',
                      flex: 1
                    }}
                  >
                    📦 Reposição de Estoque
                  </button>
                  <button
                    type="button"
                    onClick={() => setRequestForm(prev => ({ ...prev, type: 'Novo' }))}
                    style={{
                      ...styles.catSelectBtn,
                      backgroundColor: requestForm.type === 'Novo' ? '#0891b2' : '#f3f4f6',
                      color: requestForm.type === 'Novo' ? '#fff' : 'var(--text-primary)',
                      flex: 1
                    }}
                  >
                    ✨ Novo Item / Extra
                  </button>
                </div>
              </div>

              {requestForm.type === 'Reposição' ? (
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Produto</label>
                  <select 
                    value={requestForm.selectedStockId}
                    onChange={(e) => {
                      const sel = inventoryItems.find(i => i.id === e.target.value);
                      setRequestForm(prev => ({ 
                        ...prev, 
                        selectedStockId: e.target.value,
                        unit: sel?.unit || 'Unidade'
                      }));
                    }}
                    style={styles.modalInput}
                    required
                  >
                    <option value="">Selecione o insumo cadastrado...</option>
                    {inventoryItems.map(itm => (
                      <option key={itm.id} value={itm.id}>
                        {itm.name} (Saldo: {itm.currentStock || 0} / Mín: {itm.minStock || 0})
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Nome</label>
                  <input 
                    type="text" 
                    placeholder="Descrição completa do item..."
                    value={requestForm.newItemName}
                    onChange={(e) => setRequestForm(prev => ({ ...prev, newItemName: e.target.value }))}
                    style={styles.modalInput}
                    required
                  />
                </div>
              )}

              <div style={styles.formRow}>
                <div style={{ flex: 1 }}>
                  <label style={styles.formLabel}>Quantidade</label>
                  <input 
                    type="number" 
                    min="1"
                    value={requestForm.quantity}
                    onChange={(e) => setRequestForm(prev => ({ ...prev, quantity: e.target.value }))}
                    style={styles.modalInput}
                    required
                  />
                </div>

                <div style={{ flex: 1 }}>
                  <label style={styles.formLabel}>Unidade</label>
                  <input 
                    type="text" 
                    placeholder="Un, Frasco, Cx..."
                    value={requestForm.unit}
                    onChange={(e) => setRequestForm(prev => ({ ...prev, unit: e.target.value }))}
                    style={styles.modalInput}
                  />
                </div>

                <div style={{ flex: 1 }}>
                  <label style={styles.formLabel}>Setor</label>
                  <select 
                    value={requestForm.sector}
                    onChange={(e) => setRequestForm(prev => ({ ...prev, sector: e.target.value }))}
                    style={styles.modalInput}
                  >
                    <option value="farmacia">Farmácia</option>
                    <option value="enfermagem">Enfermagem</option>
                    <option value="manutencao">Manutenção</option>
                    <option value="recepcao">Recepção</option>
                    <option value="ti">TI</option>
                  </select>
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Justificativa</label>
                <textarea 
                  rows={3}
                  placeholder="Explique o motivo da compra ou necessidade clínica..."
                  value={requestForm.justification}
                  onChange={(e) => setRequestForm(prev => ({ ...prev, justification: e.target.value }))}
                  style={styles.modalTextarea}
                  required
                />
              </div>

              <div style={styles.modalActions}>
                <button 
                  type="button" 
                  onClick={() => setShowRequestModal(false)}
                  style={styles.modalCancelBtn}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={actionLoading}
                  style={styles.modalSubmitBtn}
                >
                  {actionLoading ? 'Enviando...' : 'Enviar Solicitação'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: FORNECEDOR */}
      {showSupplierModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Building2 size={20} color="#0891b2" />
                <h3 style={styles.modalTitle}>
                  {editingSupplier ? 'Editar Fornecedor' : 'Cadastrar Fornecedor'}
                </h3>
              </div>
              <button onClick={() => setShowSupplierModal(false)} style={styles.modalCloseBtn}>×</button>
            </div>

            <form onSubmit={handleSaveSupplier} style={styles.modalForm}>
              <div style={styles.formRow}>
                <div style={{ flex: 1 }}>
                  <label style={styles.formLabel}>Razão *</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="Razão social completa..." 
                    value={supplierForm.name} 
                    onChange={e => setSupplierForm({ ...supplierForm, name: e.target.value })} 
                    style={styles.modalInput} 
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={styles.formLabel}>Fantasia</label>
                  <input 
                    type="text" 
                    placeholder="Nome fantasia..." 
                    value={supplierForm.tradeName} 
                    onChange={e => setSupplierForm({ ...supplierForm, tradeName: e.target.value })} 
                    style={styles.modalInput} 
                  />
                </div>
              </div>

              <div style={styles.formRow}>
                <div style={{ flex: 1 }}>
                  <label style={styles.formLabel}>CNPJ *</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="00.000.000/0001-00" 
                    value={supplierForm.cnpj} 
                    onChange={e => setSupplierForm({ ...supplierForm, cnpj: e.target.value })} 
                    style={styles.modalInput} 
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={styles.formLabel}>Telefone</label>
                  <input 
                    type="text" 
                    placeholder="(00) 00000-0000" 
                    value={supplierForm.phone} 
                    onChange={e => setSupplierForm({ ...supplierForm, phone: e.target.value })} 
                    style={styles.modalInput} 
                  />
                </div>
              </div>

              <div style={styles.formRow}>
                <div style={{ flex: 1 }}>
                  <label style={styles.formLabel}>Email</label>
                  <input 
                    type="email" 
                    placeholder="vendas@fornecedor.com" 
                    value={supplierForm.email} 
                    onChange={e => setSupplierForm({ ...supplierForm, email: e.target.value })} 
                    style={styles.modalInput} 
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={styles.formLabel}>Contato</label>
                  <input 
                    type="text" 
                    placeholder="Nome do vendedor/representante..." 
                    value={supplierForm.contactPerson} 
                    onChange={e => setSupplierForm({ ...supplierForm, contactPerson: e.target.value })} 
                    style={styles.modalInput} 
                  />
                </div>
              </div>

              <div style={styles.formRow}>
                <div style={{ flex: 1 }}>
                  <label style={styles.formLabel}>Prazo (Dias)</label>
                  <input 
                    type="number" 
                    placeholder="Ex: 3" 
                    value={supplierForm.leadTime} 
                    onChange={e => setSupplierForm({ ...supplierForm, leadTime: e.target.value })} 
                    style={styles.modalInput} 
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={styles.formLabel}>Status</label>
                  <select 
                    value={supplierForm.status} 
                    onChange={e => setSupplierForm({ ...supplierForm, status: e.target.value })} 
                    style={styles.modalInput}
                  >
                    <option value="Homologado">Homologado</option>
                    <option value="Preferencial">Preferencial</option>
                    <option value="Em Análise">Em Análise</option>
                    <option value="Bloqueado">Bloqueado</option>
                  </select>
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Endereço</label>
                <input 
                  type="text" 
                  placeholder="Rua, Número, Bairro, Cidade - UF" 
                  value={supplierForm.address} 
                  onChange={e => setSupplierForm({ ...supplierForm, address: e.target.value })} 
                  style={styles.modalInput} 
                />
              </div>

              <div style={styles.modalActions}>
                <button 
                  type="button" 
                  onClick={() => setShowSupplierModal(false)} 
                  style={styles.modalCancelBtn}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={actionLoading} 
                  style={styles.modalSubmitBtn}
                >
                  {actionLoading ? 'Salvando...' : editingSupplier ? 'Atualizar' : 'Cadastrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '1.5rem',
    maxWidth: '1280px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem'
  },
  alertToast: {
    position: 'fixed',
    top: '20px',
    right: '20px',
    color: '#fff',
    padding: '0.85rem 1.25rem',
    borderRadius: '10px',
    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)',
    zIndex: 9999,
    fontSize: '0.875rem',
    fontWeight: '600',
    animation: 'slideIn 0.3s ease-out'
  },
  heroSection: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.5rem',
    backgroundColor: '#fff',
    padding: '1.5rem',
    borderRadius: '16px',
    border: '1px solid var(--border-color)',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
    flexWrap: 'wrap',
    gap: '1.25rem'
  },
  heroLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.25rem'
  },
  heroIconBadge: {
    width: '56px',
    height: '56px',
    borderRadius: '14px',
    background: 'linear-gradient(135deg, #0891b2 0%, #0284c7 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 8px 16px rgba(8, 145, 178, 0.25)',
    flexShrink: 0
  },
  heroTitle: {
    fontSize: '1.6rem',
    fontWeight: '800',
    color: 'var(--text-primary)',
    margin: 0
  },
  heroSubtitle: {
    fontSize: '0.9rem',
    color: 'var(--text-secondary)',
    margin: '0.35rem 0 0 0',
    maxWidth: '600px'
  },
  heroActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    flexWrap: 'wrap'
  },
  primaryBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    backgroundColor: '#0891b2',
    color: '#fff',
    border: 'none',
    padding: '0.75rem 1.25rem',
    borderRadius: '10px',
    fontWeight: '600',
    fontSize: '0.9rem',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(8, 145, 178, 0.25)',
    transition: 'all 0.15s ease'
  },
  batchBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.45rem',
    backgroundColor: '#fef2f2',
    color: '#ef4444',
    border: '1px solid #fecaca',
    padding: '0.75rem 1.15rem',
    borderRadius: '10px',
    fontWeight: '700',
    fontSize: '0.85rem',
    cursor: 'pointer',
    transition: 'all 0.15s ease'
  },
  tabsWrapper: {
    display: 'flex',
    gap: '0.25rem',
    borderBottom: '2px solid var(--border-color)',
    paddingBottom: '2px',
    flexWrap: 'wrap'
  },
  tabBtn: {
    background: 'none',
    border: 'none',
    padding: '0.75rem 1.25rem',
    fontSize: '0.875rem',
    cursor: 'pointer',
    borderBottom: '2px solid transparent',
    marginBottom: '-2px',
    transition: 'all 0.15s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '0.45rem'
  },
  badgeDanger: {
    fontSize: '0.7rem',
    fontWeight: '700',
    padding: '0.1rem 0.45rem',
    borderRadius: '10px',
    backgroundColor: '#ef4444',
    color: '#fff'
  },
  badgeWarning: {
    fontSize: '0.7rem',
    fontWeight: '700',
    padding: '0.1rem 0.45rem',
    borderRadius: '10px',
    backgroundColor: '#f59e0b',
    color: '#fff'
  },
  badgeInfo: {
    fontSize: '0.7rem',
    fontWeight: '700',
    padding: '0.1rem 0.45rem',
    borderRadius: '10px',
    backgroundColor: '#0284c7',
    color: '#fff'
  },
  badgeNeutral: {
    fontSize: '0.7rem',
    fontWeight: '700',
    padding: '0.1rem 0.45rem',
    borderRadius: '10px',
    backgroundColor: '#f3f4f6',
    color: 'var(--text-secondary)'
  },
  repositionMetricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '0.75rem'
  },
  repositionMetricCard: {
    backgroundColor: '#fff',
    padding: '1rem 1.25rem',
    borderRadius: '12px',
    border: '1px solid var(--border-color)',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
  },
  metricLabel: {
    fontSize: '0.78rem',
    fontWeight: '600',
    color: 'var(--text-secondary)',
    textTransform: 'uppercase'
  },
  filterBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '0.75rem',
    backgroundColor: '#fff',
    padding: '0.75rem 1rem',
    borderRadius: '12px',
    border: '1px solid var(--border-color)',
    flexWrap: 'wrap'
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    backgroundColor: '#f9fafb',
    padding: '0.45rem 0.75rem',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    flex: '1 1 250px'
  },
  searchInput: {
    border: 'none',
    background: 'transparent',
    outline: 'none',
    width: '100%',
    fontSize: '0.85rem',
    color: 'var(--text-primary)'
  },
  clearSearchBtn: {
    background: 'none',
    border: 'none',
    fontSize: '1.1rem',
    cursor: 'pointer',
    color: 'var(--text-secondary)'
  },
  selectInput: {
    padding: '0.45rem 0.65rem',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    backgroundColor: '#fff',
    fontSize: '0.82rem',
    color: 'var(--text-primary)',
    cursor: 'pointer'
  },
  refreshBtn: {
    padding: '0.5rem',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    backgroundColor: '#fff',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  tableCard: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    border: '1px solid var(--border-color)',
    overflowX: 'auto',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left'
  },
  theadRow: {
    backgroundColor: '#f9fafb',
    borderBottom: '1px solid #e5e7eb'
  },
  th: {
    padding: '0.75rem 1rem',
    fontSize: '0.8rem',
    fontWeight: '700',
    color: 'var(--text-secondary)'
  },
  tr: {
    borderBottom: '1px solid #f3f4f6',
    transition: 'background-color 0.15s ease'
  },
  td: {
    padding: '0.75rem 1rem',
    fontSize: '0.85rem',
    verticalAlign: 'middle'
  },
  categoryBadge: {
    fontSize: '0.72rem',
    fontWeight: '600',
    backgroundColor: '#f3f4f6',
    color: 'var(--text-primary)',
    padding: '0.15rem 0.5rem',
    borderRadius: '6px'
  },
  stockStatusBadge: {
    fontSize: '0.78rem',
    fontWeight: '700',
    padding: '0.2rem 0.55rem',
    borderRadius: '6px',
    border: '1px solid',
    display: 'inline-block'
  },
  leadTimeBadge: {
    fontSize: '0.75rem',
    fontWeight: '600',
    backgroundColor: '#eff6ff',
    color: '#1d4ed8',
    padding: '0.2rem 0.5rem',
    borderRadius: '6px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem'
  },
  quickOrderBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
    backgroundColor: '#0891b2',
    color: '#fff',
    border: 'none',
    padding: '0.35rem 0.75rem',
    borderRadius: '6px',
    fontWeight: '600',
    fontSize: '0.78rem',
    cursor: 'pointer'
  },
  listCard: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '1.25rem',
    border: '1px solid var(--border-color)',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '1.25rem',
    border: '1px solid var(--border-color)',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
  },
  purchaseItem: {
    backgroundColor: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: '10px',
    padding: '1rem 1.25rem'
  },
  statusBadge: {
    fontSize: '0.75rem',
    fontWeight: '700',
    padding: '0.2rem 0.6rem',
    borderRadius: '6px'
  },
  timelineWrapper: {
    position: 'relative',
    marginTop: '1.25rem',
    paddingTop: '0.5rem'
  },
  timelineTrack: {
    position: 'absolute',
    top: '18px',
    left: '5%',
    right: '5%',
    height: '2px',
    backgroundColor: '#e2e8f0',
    zIndex: 1
  },
  timelineNode: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.75rem',
    fontWeight: '700',
    position: 'relative',
    zIndex: 2
  },
  approvalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 1.25rem',
    backgroundColor: '#f9fafb',
    borderRadius: '10px',
    border: '1px solid #e5e7eb',
    gap: '1rem',
    flexWrap: 'wrap'
  },
  approveBtn: {
    backgroundColor: '#10b981',
    color: '#fff',
    border: 'none',
    padding: '0.45rem 0.85rem',
    borderRadius: '6px',
    fontSize: '0.82rem',
    fontWeight: '600',
    cursor: 'pointer'
  },
  rejectBtn: {
    backgroundColor: '#fff',
    color: '#ef4444',
    border: '1px solid #fecaca',
    padding: '0.45rem 0.85rem',
    borderRadius: '6px',
    fontSize: '0.82rem',
    fontWeight: '600',
    cursor: 'pointer'
  },
  quoteSelectableItem: {
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    border: '1px solid var(--border-color)',
    borderLeftWidth: '4px',
    cursor: 'pointer',
    transition: 'all 0.15s ease'
  },
  supplierBlock: {
    backgroundColor: '#f8fafc',
    padding: '0.75rem',
    borderRadius: '8px',
    border: '1px solid #e2e8f0'
  },
  metricsWrapper: {
    display: 'flex',
    gap: '1rem',
    padding: '0.75rem 1rem',
    backgroundColor: '#f0fdf4',
    border: '1px solid #bbf7d0',
    borderRadius: '8px',
    marginBottom: '1rem'
  },
  metricItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.65rem'
  },
  decisionBtn: {
    color: '#fff',
    border: 'none',
    padding: '0.55rem 1.15rem',
    borderRadius: '8px',
    fontSize: '0.82rem',
    fontWeight: '600',
    cursor: 'pointer'
  },
  cardActionBtn: {
    background: 'none',
    border: 'none',
    padding: '0.25rem',
    cursor: 'pointer',
    color: 'var(--text-secondary)'
  },
  emptyState: {
    textAlign: 'center',
    padding: '3rem 1.5rem',
    backgroundColor: '#fff',
    borderRadius: '12px',
    border: '1px dashed #d1d5db'
  },
  noDataText: {
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
    textAlign: 'center',
    margin: '1.5rem 0'
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: '1rem'
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    width: '100%',
    maxWidth: '560px',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 1.25rem',
    borderBottom: '1px solid #f3f4f6'
  },
  modalTitle: {
    fontSize: '1.1rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
    margin: 0
  },
  modalCloseBtn: {
    background: 'none',
    border: 'none',
    fontSize: '1.5rem',
    cursor: 'pointer',
    color: 'var(--text-secondary)',
    lineHeight: 1
  },
  modalForm: {
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem'
  },
  formRow: {
    display: 'flex',
    gap: '0.75rem'
  },
  formLabel: {
    fontSize: '0.8rem',
    fontWeight: '600',
    color: 'var(--text-secondary)'
  },
  modalInput: {
    padding: '0.55rem 0.75rem',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    fontSize: '0.85rem',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box'
  },
  modalTextarea: {
    padding: '0.55rem 0.75rem',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    fontSize: '0.85rem',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
    resize: 'vertical'
  },
  catSelectBtn: {
    padding: '0.55rem 0.75rem',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    fontSize: '0.82rem',
    fontWeight: '600',
    cursor: 'pointer',
    textAlign: 'center',
    transition: 'all 0.15s ease'
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.65rem',
    paddingTop: '0.5rem',
    borderTop: '1px solid #f3f4f6'
  },
  modalCancelBtn: {
    padding: '0.55rem 1.15rem',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    backgroundColor: '#fff',
    fontSize: '0.85rem',
    fontWeight: '600',
    color: 'var(--text-secondary)',
    cursor: 'pointer'
  },
  modalSubmitBtn: {
    padding: '0.55rem 1.35rem',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#0891b2',
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#fff',
    cursor: 'pointer'
  }
};
