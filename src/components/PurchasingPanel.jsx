import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShoppingBag, ClipboardList, CheckSquare, DollarSign, Truck, Plus, 
  Search, Building2, User, Clock, ArrowRight, ShieldAlert, Award,
  Edit, Trash2, X, AlertTriangle, ArrowUpDown, ChevronUp, ChevronDown,
  Package, Zap, CheckCircle2, History, Filter, RefreshCw, Layers, Info,
  ListFilter, Maximize2, Eye, FileText, Tag, Sparkles
} from 'lucide-react';
import { dbService } from '../firebase';
import { useUnit } from '../contexts/UnitContext';
import UnitSelector from './common/UnitSelector';
import WebQuotationsTab from './purchasing/WebQuotationsTab';
import PurchaseRequestModal from './purchasing/PurchaseRequestModal';
import PurchaseDetailsModal from './purchasing/PurchaseDetailsModal';

export default function PurchasingPanel({ currentUser }) {
  const { activeUnitId, filterByActiveUnit, matchItemUnit } = useUnit();
  const [activeTab, setActiveTab] = useState('reposition'); // 'reposition' | 'requests' | 'approvals' | 'quotes' | 'suppliers'
  const [purchases, setPurchases] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [requisitions, setRequisitions] = useState([]);
  const [tenantSettings, setTenantSettings] = useState({});
  const [showSalonModal, setShowSalonModal] = useState(false);
  const [selectedItemBreakdown, setSelectedItemBreakdown] = useState(null);
  const [user, setUser] = useState(currentUser || null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Filtros da Aba Reposição
  const [repositionSearch, setRepositionSearch] = useState('');
  const [repositionCategory, setRepositionCategory] = useState('all');
  const [repositionSeverity, setRepositionSeverity] = useState('all'); // 'all' | 'zero' | 'below_min'

  // Modos de Visualização das Solicitações (Compacta como Padrão)
  const [requestsViewMode, setRequestsViewMode] = useState(() => {
    return localStorage.getItem('nexa_purchases_view_mode') || 'compact';
  });

  const handleSetViewMode = (mode) => {
    setRequestsViewMode(mode);
    localStorage.setItem('nexa_purchases_view_mode', mode);
  };

  // Filtros da Esteira de Solicitações
  const [requestsSearch, setRequestsSearch] = useState('');
  const [requestsStatusFilter, setRequestsStatusFilter] = useState('all');
  const [myRequestsOnly, setMyRequestsOnly] = useState(false);

  // Modais de Solicitação (Multi-Item e Detalhes)
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [editingRequest, setEditingRequest] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedRequestDetails, setSelectedRequestDetails] = useState(null);

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
      const [purList, itemsList, suppList, reqList, settings] = await Promise.all([
        dbService.getPurchases ? dbService.getPurchases() : [],
        dbService.getInventoryItems ? dbService.getInventoryItems() : [],
        dbService.getSuppliers ? dbService.getSuppliers() : [],
        dbService.getMaterialRequisitions ? dbService.getMaterialRequisitions() : [],
        dbService.getTenantSettings ? dbService.getTenantSettings() : {}
      ]);

      setPurchases(purList || []);
      setInventoryItems(itemsList || []);
      setSuppliers(suppList || []);
      setRequisitions(reqList || []);
      setTenantSettings(settings || {});
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

  // Helper para normalizar insumos da solicitação (Multi-Item vs Legado)
  const getRequestItems = (req) => {
    if (req.items && Array.isArray(req.items) && req.items.length > 0) {
      return req.items;
    }
    if (req.productName) {
      return [{
        id: 'legacy_1',
        type: req.type || 'Reposição',
        productId: req.productId || '',
        productName: req.productName,
        quantity: req.quantity || 1,
        unit: req.unit || 'Unidade',
        specification: req.justification || ''
      }];
    }
    return [];
  };

  // Helper de Código Amigável (SOL-2026-001)
  const generatePurchaseCode = (existingList = []) => {
    const year = new Date().getFullYear();
    const seq = String((existingList?.length || 0) + 1).padStart(3, '0');
    return `SOL-${year}-${seq}`;
  };

  // Permissões e Níveis de Acesso no NexaPROCURE (RBAC)
  const isPurchasingAdmin = useMemo(() => {
    if (!user) return false;
    const email = (user.email || '').toLowerCase().trim();
    const role = (user.role || '').toLowerCase().trim();
    const sectors = (user.sectors || user.setores || []).map(s => String(s).toLowerCase());
    const jobTitle = (user.jobTitle || user.cargo || '').toLowerCase();

    if (email === 'contato@techcosta.net' || role === 'admin' || user.isAdmin === true) return true;
    if (role === 'compras' || role === 'suprimentos' || role === 'almoxarifado') return true;
    if (sectors.includes('compras') || sectors.includes('suprimentos')) return true;
    if (jobTitle.includes('comprador') || jobTitle.includes('compras') || jobTitle.includes('suprimentos') || jobTitle.includes('almoxarife')) return true;
    if (user.permissions?.purchasing === 'write') return true;
    return false;
  }, [user]);

  const isPurchasingApprover = useMemo(() => {
    if (!user) return false;
    if (isPurchasingAdmin) return true;
    const role = (user.role || '').toLowerCase().trim();
    const jobTitle = (user.jobTitle || user.cargo || '').toLowerCase();

    if (['manager', 'gestor', 'diretoria', 'director', 'coordenador', 'supervisor'].includes(role)) return true;
    if (jobTitle.includes('gerente') || jobTitle.includes('gestor') || jobTitle.includes('coordenador') || jobTitle.includes('supervisor') || jobTitle.includes('diretor') || jobTitle.includes('responsavel tecnico')) return true;
    return false;
  }, [user, isPurchasingAdmin]);

  const isRequesterOnly = !isPurchasingAdmin && !isPurchasingApprover;

  // Permissão para editar solicitação (solicitante no status inicial ou admin)
  const canUserEditRequest = (req) => {
    if (!user || !req) return false;
    if (isPurchasingAdmin) return true;
    const userEmail = (user.email || '').toLowerCase().trim();
    const userName = (user.name || '').toLowerCase().trim();
    const isOwner = (req.requesterEmail && req.requesterEmail.toLowerCase() === userEmail) ||
                    (req.requesterName && req.requesterName.toLowerCase() === userName);
    const isInitialStatus = req.status === 'Aguardando Gestor' || (req.status && req.status.toLowerCase().includes('recusad'));
    return isOwner && isInitialStatus;
  };

  const canUserDeleteRequest = (req) => {
    return canUserEditRequest(req);
  };

  // Redirecionamento automático de aba baseado no perfil
  useEffect(() => {
    if (isRequesterOnly && activeTab !== 'requests') {
      setActiveTab('requests');
    } else if (!isPurchasingAdmin && isPurchasingApprover && ['reposition', 'quotes', 'suppliers'].includes(activeTab)) {
      setActiveTab('requests');
    }
  }, [isRequesterOnly, isPurchasingApprover, isPurchasingAdmin, activeTab]);

  // Filtragem de Dados pela Unidade Ativa
  const currentPurchases = useMemo(() => filterByActiveUnit(purchases), [purchases, activeUnitId]);
  const currentInventoryItems = useMemo(() => filterByActiveUnit(inventoryItems), [inventoryItems, activeUnitId]);
  const currentRequisitions = useMemo(() => filterByActiveUnit(requisitions), [requisitions, activeUnitId]);

  // Solicitações Exibidas com Filtros de Busca, Status e Minhas Solicitações
  const displayedPurchases = useMemo(() => {
    let list = currentPurchases;

    // Filtro Minhas Solicitações
    if (isRequesterOnly && myRequestsOnly && user) {
      const userEmail = (user.email || '').toLowerCase().trim();
      const userName = (user.name || '').toLowerCase().trim();
      list = list.filter(p => 
        (p.requesterEmail && p.requesterEmail.toLowerCase() === userEmail) ||
        (p.requesterName && p.requesterName.toLowerCase() === userName)
      );
    }

    // Filtro de Status
    if (requestsStatusFilter !== 'all') {
      if (requestsStatusFilter === 'Recusado') {
        list = list.filter(p => p.status && p.status.toLowerCase().includes('recusad'));
      } else {
        list = list.filter(p => p.status === requestsStatusFilter);
      }
    }

    // Busca textual (código, produto, itens, solicitante, justificativa)
    if (requestsSearch.trim()) {
      const term = requestsSearch.toLowerCase().trim();
      list = list.filter(p => {
        const matchCode = p.code?.toLowerCase().includes(term);
        const matchProd = p.productName?.toLowerCase().includes(term);
        const matchReq = p.requesterName?.toLowerCase().includes(term);
        const matchJust = p.justification?.toLowerCase().includes(term);
        const matchSector = p.sector?.toLowerCase().includes(term);
        const matchItems = p.items && Array.isArray(p.items) && p.items.some(i => i.productName?.toLowerCase().includes(term));
        return matchCode || matchProd || matchReq || matchJust || matchSector || matchItems;
      });
    }

    // Ordenar pelas mais recentes
    return list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }, [currentPurchases, isRequesterOnly, myRequestsOnly, user, requestsStatusFilter, requestsSearch]);

  // Itens com Cálculo dos 4 Saldos (Físico, Reservado, Disponível, Trânsito)
  const enrichedInventoryItems = useMemo(() => {
    return currentInventoryItems.map(item => {
      const physicalStock = parseFloat(item.currentStock) || 0;
      const minStock = parseFloat(item.minStock) || 0;
      const idealStock = parseFloat(item.idealStock) || (minStock * 2 > 0 ? minStock * 2 : 20);

      // Requisições Ativas (Pendente ou Parcial) que comprometem este item
      const activeReqsForItem = currentRequisitions.filter(r => 
        (r.status === 'Pendente' || r.status === 'Parcial') &&
        r.items && r.items.some(i => i.itemId === item.id || (i.itemName && i.itemName.toLowerCase() === (item.name || '').toLowerCase()))
      );

      let committedStock = 0;
      const salonBreakdown = [];

      activeReqsForItem.forEach(r => {
        const matchItem = r.items.find(i => i.itemId === item.id || (i.itemName && i.itemName.toLowerCase() === (item.name || '').toLowerCase()));
        if (matchItem) {
          const reqQty = parseFloat(matchItem.requestedQuantity) || 0;
          const delQty = parseFloat(matchItem.deliveredQuantity) || 0;
          const pendingQty = Math.max(0, reqQty - delQty);
          committedStock += pendingQty;
          if (pendingQty > 0) {
            salonBreakdown.push({
              code: r.requisitionCode,
              salon: r.salonLocation || 'Salão Geral',
              requestedBy: r.requestedBy || 'Técnica',
              patient: r.patientName || 'Uso Geral',
              qty: pendingQty,
              unit: matchItem.unit || item.unit || 'un',
              status: r.status,
              createdAt: r.createdAt
            });
          }
        }
      });

      // Saldo Disponível Real (Físico - Reservado)
      const availableStock = Math.max(0, physicalStock - committedStock);

      // Compras em Trânsito (Pedidos de Compra Abertos com suporte Multi-Item)
      const inTransitPurchases = currentPurchases.filter(p => 
        p.status !== 'Finalizado' && p.status !== 'Rejeitado' && !p.status?.toLowerCase().includes('recusad')
      );

      let inTransitStock = 0;
      inTransitPurchases.forEach(p => {
        const pItems = getRequestItems(p);
        pItems.forEach(pi => {
          if (pi.productId === item.id || (pi.productName && pi.productName.toLowerCase() === (item.name || '').toLowerCase())) {
            inTransitStock += (parseFloat(pi.quantity) || 0);
          }
        });
      });

      const projectedStock = availableStock + inTransitStock;

      // Sugestão de Compra Inteligente
      const suggestedQty = Math.max(0, Math.round(idealStock - projectedStock));

      // É Crítico se o Disponível for menor/igual ao Mínimo ou Zerado
      const isCritical = (availableStock <= minStock) || (availableStock === 0);

      return {
        ...item,
        physicalStock,
        committedStock,
        availableStock,
        inTransitStock,
        projectedStock,
        minStock,
        idealStock,
        suggestedQty,
        isCritical,
        salonBreakdown,
        activeReqCount: activeReqsForItem.length
      };
    });
  }, [currentInventoryItems, currentRequisitions, currentPurchases]);

  // Itens Críticos do Estoque (Baseados no Saldo Disponível)
  const criticalItems = useMemo(() => {
    return enrichedInventoryItems.filter(item => item.isCritical);
  }, [enrichedInventoryItems]);

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

      // Gravidade (baseada em Disponível)
      const avail = item.availableStock;
      const min = item.minStock;
      if (repositionSeverity === 'zero' && avail > 0) return false;
      if (repositionSeverity === 'below_min' && (avail === 0 || avail > min)) return false;

      return true;
    });
  }, [criticalItems, repositionSearch, repositionCategory, repositionSeverity]);

  // Categorias únicas dos itens do estoque
  const inventoryCategories = useMemo(() => {
    const set = new Set();
    currentInventoryItems.forEach(i => {
      if (i.category) set.add(i.category);
    });
    return Array.from(set);
  }, [currentInventoryItems]);

  // Contagens de Aprovações Pendentes
  const pendingApprovalsCount = useMemo(() => {
    return currentPurchases.filter(p => p.status === 'Aguardando Gestor' || p.status === 'Aguardando Diretor').length;
  }, [currentPurchases]);

  // Contagem de Cotações Pendentes
  const pendingQuotesCount = useMemo(() => {
    return currentPurchases.filter(p => p.status === 'Aguardando Cotação').length;
  }, [currentPurchases]);

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

  // Abertura do Modal de Nova Solicitação (com suporte a pré-preenchimento)
  const handleOpenNewRequest = (prepopulatedItem = null) => {
    if (prepopulatedItem) {
      setEditingRequest({
        items: [prepopulatedItem],
        sector: prepopulatedItem.sector || 'farmacia',
        justification: prepopulatedItem.justification || '',
        priority: 'Normal'
      });
    } else {
      setEditingRequest(null);
    }
    setShowRequestModal(true);
  };

  // Abertura do Modal de Edição de Solicitação Existente
  const handleOpenEditRequest = (req) => {
    setEditingRequest(req);
    setShowRequestModal(true);
  };

  // Abrir Detalhes da Solicitação
  const handleOpenDetails = (req) => {
    setSelectedRequestDetails(req);
    setShowDetailsModal(true);
  };

  // Abrir Modal de Solicitação Rápida para Item Crítico Específico
  const handleQuickRequestItem = (item) => {
    const avail = item.availableStock;
    const phys = item.physicalStock;
    const res = item.committedStock;
    const min = item.minStock;
    const trans = item.inTransitStock;
    const suggestedQty = item.suggestedQty > 0 ? item.suggestedQty : Math.max(1, Math.round(item.idealStock - avail));

    handleOpenNewRequest({
      id: 'item_quick_' + Date.now(),
      type: 'Reposição',
      productId: item.id,
      productName: item.name,
      quantity: suggestedQty,
      unit: item.unit || 'Unidade',
      specification: '',
      sector: item.category === 'Medicamento' ? 'farmacia' : 'enfermagem',
      justification: `Reposição Inteligente: Saldo Disponível (${avail} ${item.unit || 'un'}) crítico perante o mínimo (${min} ${item.unit || 'un'}). [Físico: ${phys}, Reservado: ${res}, Trânsito: ${trans}].`
    });
  };

  // Gerar Solicitação Consolidada em Lote para TODOS os Itens Críticos
  const handleBatchRequestAllCritical = async () => {
    if (criticalItems.length === 0) {
      showAlert('Nenhum item crítico para reposição no momento.', 'warning');
      return;
    }

    if (!window.confirm(`Deseja gerar um pedido de compra consolidado contendo todos os ${criticalItems.length} itens críticos calculados sobre o saldo disponível?`)) {
      return;
    }

    setActionLoading(true);
    try {
      const targetUnitId = activeUnitId === 'all' ? 'betim' : activeUnitId;
      const targetUnit = targetUnitId === 'taguatinga' ? 'Taguatinga' : 'Betim';

      const batchItems = criticalItems.map((item, idx) => {
        const avail = item.availableStock;
        const phys = item.physicalStock;
        const res = item.committedStock;
        const min = item.minStock;
        const trans = item.inTransitStock;
        const suggestedQty = item.suggestedQty > 0 ? item.suggestedQty : Math.max(1, Math.round(item.idealStock - avail));

        return {
          id: 'batch_item_' + idx,
          type: 'Reposição',
          productId: item.id,
          productName: item.name,
          quantity: suggestedQty,
          unit: item.unit || 'Unidade',
          specification: `Saldo Disponível: ${avail} / Mín: ${min} [Físico: ${phys}, Reservado: ${res}, Trânsito: ${trans}]`
        };
      });

      const newCode = generatePurchaseCode(purchases);
      const totalQty = batchItems.reduce((acc, it) => acc + it.quantity, 0);

      const newRequest = {
        code: newCode,
        type: 'Reposição',
        sector: 'farmacia',
        priority: 'Urgente',
        productId: 'lote-critico',
        productName: `Lote Crítico de Reposição (${batchItems.length} insumos)`,
        quantity: totalQty,
        unit: 'itens',
        justification: `Reposição em Lote Inteligente: ${batchItems.length} insumos com saldo disponível abaixo do estoque mínimo.`,
        items: batchItems,
        itemsCount: batchItems.length,
        requesterName: currentUser?.name || 'Comprador NexaPROCURE',
        requesterEmail: currentUser?.email || 'compras@dialize.com.br',
        status: 'Aguardando Gestor',
        unitId: targetUnitId,
        unit: targetUnit,
        history: [
          { 
            status: 'Aguardando Gestor', 
            date: new Date().toISOString(), 
            message: `Pedido #${newCode} gerado via Reposição Crítica em Lote com ${batchItems.length} insumos.` 
          }
        ]
      };

      await dbService.createPurchase(newRequest);
      showAlert(`Sucesso! Solicitação #${newCode} gerada com ${batchItems.length} insumos críticos.`, 'success');
      fetchData(false);
      setActiveTab('requests');
    } catch (err) {
      console.error(err);
      showAlert('Erro ao gerar solicitação em lote.', 'danger');
    } finally {
      setActionLoading(false);
    }
  };

  // Salvar Solicitação Multi-Item (Criação ou Atualização)
  const handleSaveRequest = async (formData) => {
    setActionLoading(true);
    try {
      const targetUnitId = activeUnitId === 'all' ? 'betim' : activeUnitId;
      const targetUnit = targetUnitId === 'taguatinga' ? 'Taguatinga' : 'Betim';

      const items = formData.items || [];
      const totalQty = items.reduce((acc, it) => acc + (parseFloat(it.quantity) || 0), 0);
      const primaryProductName = items.length === 1 
        ? items[0].productName 
        : `${items[0].productName} (+${items.length - 1} itens)`;

      if (editingRequest && editingRequest.id) {
        // Modo Edição
        const updatedHistory = [
          ...(editingRequest.history || []),
          {
            status: editingRequest.status,
            date: new Date().toISOString(),
            message: `Solicitação atualizada por ${user?.name || 'Solicitante'}. (${items.length} itens)`
          }
        ];

        await dbService.updatePurchase(editingRequest.id, {
          sector: formData.sector,
          priority: formData.priority,
          justification: formData.justification,
          items: items,
          itemsCount: items.length,
          productName: primaryProductName,
          quantity: totalQty,
          unit: items[0]?.unit || 'un',
          history: updatedHistory
        });

        showAlert(`Solicitação #${editingRequest.code || ''} atualizada com sucesso!`, 'success');
      } else {
        // Modo Criação
        const newCode = generatePurchaseCode(purchases);
        const newPurchase = {
          code: newCode,
          type: items.some(i => i.type === 'Novo') ? 'Misto' : 'Reposição',
          sector: formData.sector,
          priority: formData.priority,
          justification: formData.justification,
          items: items,
          itemsCount: items.length,
          productId: items[0]?.productId || 'multiplo',
          productName: primaryProductName,
          quantity: totalQty,
          unit: items[0]?.unit || 'un',
          requesterName: user?.name || currentUser?.name || 'Profissional',
          requesterEmail: user?.email || currentUser?.email || '',
          status: 'Aguardando Gestor',
          unitId: targetUnitId,
          unit: targetUnit,
          history: [
            { 
              status: 'Aguardando Gestor', 
              date: new Date().toISOString(), 
              message: `Solicitação #${newCode} criada por ${user?.name || 'Profissional'} com ${items.length} insumos.` 
            }
          ]
        };

        await dbService.createPurchase(newPurchase);
        showAlert(`Solicitação #${newCode} criada com sucesso (${items.length} insumos)!`, 'success');
      }

      setShowRequestModal(false);
      setEditingRequest(null);
      fetchData(false);
    } catch (err) {
      console.error('Erro ao salvar solicitação:', err);
      showAlert('Erro ao salvar solicitação.', 'danger');
    } finally {
      setActionLoading(false);
    }
  };

  // Excluir Solicitação de Compra
  const handleDeleteRequest = async (req) => {
    const reqName = req.code ? `#${req.code}` : `"${req.productName}"`;
    if (!window.confirm(`Deseja realmente excluir a solicitação ${reqName}?`)) return;

    setActionLoading(true);
    try {
      if (dbService.deletePurchase) {
        await dbService.deletePurchase(req.id);
      } else {
        await dbService.updatePurchase(req.id, { status: 'Cancelada', deleted: true });
      }
      showAlert(`Solicitação ${reqName} excluída com sucesso!`, 'success');
      if (selectedRequestDetails?.id === req.id) {
        setShowDetailsModal(false);
        setSelectedRequestDetails(null);
      }
      fetchData(false);
    } catch (err) {
      console.error('Erro ao excluir solicitação:', err);
      showAlert('Erro ao excluir solicitação.', 'danger');
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

  // Finalização da Compra com Automação de Estoque Multi-Item e Financeiro
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

      // 1. Entrada Automática no Estoque para cada item do pedido
      if (dbService.createStockTransaction) {
        const reqItems = getRequestItems(req);
        for (const item of reqItems) {
          await dbService.createStockTransaction({
            itemId: item.productId || req.productId,
            itemName: item.productName || req.productName,
            quantity: item.quantity,
            type: 'Entrada',
            batch: 'NEXAPROCURE-' + Math.random().toString(36).substr(2, 5).toUpperCase(),
            expiryDate: new Date(Date.now() + 365*24*60*60*1000).toISOString().substring(0, 10),
            operator: currentUser?.name || 'Compras',
            notes: `Entrada automática via NexaPROCURE. Fornecedor: ${selectedSupplier.name}`
          });
        }
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
          descricao: `Compra #${req.code || ''}: ${req.productName}`,
          categoria: 'Insumos',
          valorTotal: parseFloat(selectedSupplier.price) * (req.quantity || 1),
          dataVencimento: dueDate.toISOString().substring(0, 10),
          formaPagamento: 'Boleto',
          status: 'Pendente',
          origemModulo: 'NexaPROCURE'
        });
      }

      showAlert(`Compra #${req.code || ''} finalizada! Entrada gerada no Estoque e no Financeiro.`, 'success');
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
      case 'Aguardando Gestor': return { bg: '#fffbeb', text: '#b45309', border: '#fde68a' };
      case 'Aguardando Diretor': return { bg: '#f0f9ff', text: '#0369a1', border: '#bae6fd' };
      case 'Aguardando Cotação': return { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' };
      case 'Finalizado': return { bg: '#ecfdf5', text: '#047857', border: '#a7f3d0' };
      default: return { bg: '#fef2f2', text: '#b91c1c', border: '#fecaca' };
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
              {isRequesterOnly 
                ? 'Central de solicitações de insumos e acompanhamento de status em tempo real.'
                : 'Gestão de compras hospitalares, reposição de estoque crítico, cotações triplas e fornecedores.'}
            </p>
          </div>
        </div>

        <div style={styles.heroActions}>
          <UnitSelector compact showLabel={false} />
          {isPurchasingAdmin && activeTab === 'reposition' && criticalItems.length > 0 && (
            <button 
              onClick={handleBatchRequestAllCritical}
              disabled={actionLoading}
              style={styles.batchBtn}
              title="Gerar pedido consolidado para todos os itens abaixo do mínimo"
            >
              <Zap size={18} />
              <span>Solicitação em Lote</span>
            </button>
          )}

          <button 
            onClick={() => handleOpenNewRequest()}
            style={styles.primaryBtn}
          >
            <Plus size={18} />
            <span>Nova Solicitação</span>
          </button>
        </div>
      </div>

      {/* Abas com Controle de Acesso (RBAC) */}
      {!isRequesterOnly && (
        <div style={styles.tabsWrapper}>
          {isPurchasingAdmin && (
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
          )}

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
            <span style={styles.badgeNeutral}>{currentPurchases.length}</span>
          </button>

          {isPurchasingApprover && (
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
          )}

          {isPurchasingAdmin && (
            <>
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
            </>
          )}
        </div>
      )}

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
              {/* Cards de Métricas da Reposição Inteligente */}
              <div style={styles.repositionMetricsGrid}>
                <div style={styles.repositionMetricCard}>
                  <span style={styles.metricLabel}>Total Crítico</span>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', marginTop: '0.25rem' }}>
                    <strong style={{ fontSize: '1.6rem', color: criticalItems.length > 0 ? '#ef4444' : '#10b981' }}>
                      {criticalItems.length}
                    </strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>insumos</span>
                  </div>
                </div>

                <div style={styles.repositionMetricCard}>
                  <span style={styles.metricLabel}>Disponível Zerado</span>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', marginTop: '0.25rem' }}>
                    <strong style={{ fontSize: '1.6rem', color: '#b91c1c' }}>
                      {criticalItems.filter(i => i.availableStock === 0).length}
                    </strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>urgentes</span>
                  </div>
                </div>

                <div style={styles.repositionMetricCard}>
                  <span style={styles.metricLabel}>Abaixo do Mínimo</span>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', marginTop: '0.25rem' }}>
                    <strong style={{ fontSize: '1.6rem', color: '#d97706' }}>
                      {criticalItems.filter(i => i.availableStock > 0 && i.availableStock <= i.minStock).length}
                    </strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>em risco</span>
                  </div>
                </div>

                <div style={styles.repositionMetricCard}>
                  <span style={styles.metricLabel}>Em Trânsito</span>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', marginTop: '0.25rem' }}>
                    <strong style={{ fontSize: '1.6rem', color: '#0369a1' }}>
                      {enrichedInventoryItems.filter(i => i.inTransitStock > 0).length}
                    </strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>pedidos abertos</span>
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
                    <option value="zero">🔴 Disponível Zerado (0)</option>
                    <option value="below_min">🟡 Abaixo do Mínimo</option>
                  </select>

                  <button onClick={() => fetchData(true)} style={styles.refreshBtn} title="Atualizar estoque e requisições em tempo real">
                    <RefreshCw size={16} />
                  </button>
                </div>
              </div>

              {/* Tabela Inteligente dos 4 Saldos de Estoque */}
              <div style={styles.tableCard}>
                <table style={styles.table}>
                  <thead>
                    <tr style={styles.theadRow}>
                      <th style={styles.th}>Insumo</th>
                      <th style={styles.th}>Categoria</th>
                      <th style={styles.th}>Físico</th>
                      <th style={styles.th}>Reservado</th>
                      <th style={styles.th}>Disponível</th>
                      <th style={styles.th}>Trânsito</th>
                      <th style={styles.th}>Mínimo</th>
                      <th style={styles.th}>Sugestão</th>
                      <th style={{ ...styles.th, textAlign: 'right' }}>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCriticalItems.length === 0 ? (
                      <tr>
                        <td colSpan="9" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                          <CheckCircle2 size={36} color="#10b981" style={{ margin: '0 auto 0.5rem auto' }} />
                          <div style={{ fontWeight: '700', color: 'var(--text-primary)' }}>Estoque em Nível Seguro!</div>
                          <span style={{ fontSize: '0.85rem' }}>Nenhum insumo está com saldo disponível abaixo do estoque mínimo.</span>
                        </td>
                      </tr>
                    ) : (
                      filteredCriticalItems.map(item => {
                        const isZeroAvail = item.availableStock === 0;

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
                              <span style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '0.88rem' }}>
                                {item.physicalStock} {item.unit || 'un'}
                              </span>
                            </td>
                            <td style={styles.td}>
                              {item.committedStock > 0 ? (
                                <button 
                                  type="button" 
                                  onClick={() => { setSelectedItemBreakdown(item); setShowSalonModal(true); }}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    padding: '0.25rem 0.55rem',
                                    borderRadius: '6px',
                                    backgroundColor: '#fef3c7',
                                    color: '#b45309',
                                    border: '1px solid #fde68a',
                                    fontWeight: '700',
                                    fontSize: '0.78rem',
                                    cursor: 'pointer'
                                  }}
                                  title="Clique para ver requisições e salões demandantes"
                                >
                                  ⚠️ {item.committedStock} {item.unit || 'un'}
                                </button>
                              ) : (
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>0</span>
                              )}
                            </td>
                            <td style={styles.td}>
                              <span style={{
                                ...styles.stockStatusBadge,
                                backgroundColor: isZeroAvail ? '#fef2f2' : '#fffbeb',
                                color: isZeroAvail ? '#ef4444' : '#d97706',
                                borderColor: isZeroAvail ? '#fecaca' : '#fde68a',
                                fontWeight: '800'
                              }}>
                                {item.availableStock} {item.unit || 'un'}
                              </span>
                            </td>
                            <td style={styles.td}>
                              {item.inTransitStock > 0 ? (
                                <span style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '3px',
                                  fontSize: '0.78rem',
                                  backgroundColor: '#e0f2fe',
                                  color: '#0369a1',
                                  padding: '0.2rem 0.5rem',
                                  borderRadius: '4px',
                                  fontWeight: '700',
                                  border: '1px solid #bae6fd'
                                }}>
                                  <Truck size={12} /> +{item.inTransitStock} {item.unit || 'un'}
                                </span>
                              ) : (
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>-</span>
                              )}
                            </td>
                            <td style={styles.td}>
                              <span style={{ fontWeight: '600', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                {item.minStock} {item.unit || 'un'}
                              </span>
                            </td>
                            <td style={styles.td}>
                              <span style={{ fontWeight: '800', color: '#0891b2', fontSize: '0.9rem' }}>
                                +{item.suggestedQty} {item.unit || 'un'}
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

          {/* TAB 2: SOLICITAÇÕES DE COMPRA (COM 3 MODOS DE VISUALIZAÇÃO E MULTI-ITEM) */}
          {activeTab === 'requests' && (
            <div style={styles.listCard}>
              {/* Barra Superior da Esteira */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: '800', margin: 0, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    📋 Esteira de Solicitações
                  </h3>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    Acompanhe o andamento dos pedidos, itens solicitados e aprovações em tempo real.
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                  {/* Filtro Setor/Minhas para Solicitantes */}
                  {isRequesterOnly && (
                    <div style={styles.segmentedToggle}>
                      <button
                        onClick={() => setMyRequestsOnly(false)}
                        style={{
                          ...styles.segmentedBtn,
                          backgroundColor: !myRequestsOnly ? '#0891b2' : 'transparent',
                          color: !myRequestsOnly ? '#fff' : 'var(--text-secondary)',
                          fontWeight: !myRequestsOnly ? '700' : '500'
                        }}
                      >
                        Setor
                      </button>
                      <button
                        onClick={() => setMyRequestsOnly(true)}
                        style={{
                          ...styles.segmentedBtn,
                          backgroundColor: myRequestsOnly ? '#0891b2' : 'transparent',
                          color: myRequestsOnly ? '#fff' : 'var(--text-secondary)',
                          fontWeight: myRequestsOnly ? '700' : '500'
                        }}
                      >
                        Minhas
                      </button>
                    </div>
                  )}

                  {/* Seletor de Modos de Visualização (Compacta, Normal, Estendida) */}
                  <div style={styles.viewModeToggle}>
                    <button
                      onClick={() => handleSetViewMode('compact')}
                      style={{
                        ...styles.viewModeBtn,
                        backgroundColor: requestsViewMode === 'compact' ? '#0891b2' : 'transparent',
                        color: requestsViewMode === 'compact' ? '#fff' : 'var(--text-secondary)',
                        fontWeight: requestsViewMode === 'compact' ? '700' : '500'
                      }}
                      title="Visualização Compacta (Tabela Padrão)"
                    >
                      <ListFilter size={14} />
                      <span>Compacta</span>
                    </button>
                    <button
                      onClick={() => handleSetViewMode('normal')}
                      style={{
                        ...styles.viewModeBtn,
                        backgroundColor: requestsViewMode === 'normal' ? '#0891b2' : 'transparent',
                        color: requestsViewMode === 'normal' ? '#fff' : 'var(--text-secondary)',
                        fontWeight: requestsViewMode === 'normal' ? '700' : '500'
                      }}
                      title="Visualização Normal (Cards)"
                    >
                      <Layers size={14} />
                      <span>Normal</span>
                    </button>
                    <button
                      onClick={() => handleSetViewMode('extended')}
                      style={{
                        ...styles.viewModeBtn,
                        backgroundColor: requestsViewMode === 'extended' ? '#0891b2' : 'transparent',
                        color: requestsViewMode === 'extended' ? '#fff' : 'var(--text-secondary)',
                        fontWeight: requestsViewMode === 'extended' ? '700' : '500'
                      }}
                      title="Visualização Estendida (Cards Completos com Stepper e Itens)"
                    >
                      <Maximize2 size={14} />
                      <span>Estendida</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Barra de Busca e Filtros Rápidos */}
              <div style={styles.filterBar}>
                <div style={styles.searchBox}>
                  <Search size={18} color="var(--text-secondary)" />
                  <input 
                    type="text" 
                    placeholder="Buscar por código (#SOL), insumo, solicitante ou setor..."
                    value={requestsSearch}
                    onChange={(e) => setRequestsSearch(e.target.value)}
                    style={styles.searchInput}
                  />
                  {requestsSearch && (
                    <button onClick={() => setRequestsSearch('')} style={styles.clearSearchBtn}>×</button>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <select 
                    value={requestsStatusFilter}
                    onChange={(e) => setRequestsStatusFilter(e.target.value)}
                    style={styles.selectInput}
                  >
                    <option value="all">🔍 Todos os Status</option>
                    <option value="Aguardando Gestor">⏳ Aguardando Gestor</option>
                    <option value="Aguardando Diretor">🔑 Aguardando Diretor</option>
                    <option value="Aguardando Cotação">💰 Aguardando Cotação</option>
                    <option value="Finalizado">✅ Finalizado</option>
                    <option value="Recusado">❌ Recusados</option>
                  </select>

                  <button onClick={() => fetchData(true)} style={styles.refreshBtn} title="Recarregar">
                    <RefreshCw size={16} />
                  </button>
                </div>
              </div>

              {/* Conteúdo da Esteira nos 3 Modos */}
              {displayedPurchases.length === 0 ? (
                <div style={styles.emptyState}>
                  <ClipboardList size={36} color="#94a3b8" style={{ margin: '0 auto 0.5rem auto' }} />
                  <p style={{ fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
                    Nenhuma solicitação encontrada.
                  </p>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {requestsSearch || requestsStatusFilter !== 'all' 
                      ? 'Tente ajustar os filtros de busca ou status.'
                      : 'Clique em "+ Nova Solicitação" para criar um novo pedido de insumos.'}
                  </span>
                </div>
              ) : (
                <>
                  {/* MODO 1: VISUALIZAÇÃO COMPACTA (PADRÃO ⭐ - TABELA DENSA E EFICIENTE) */}
                  {requestsViewMode === 'compact' && (
                    <div style={styles.tableCard}>
                      <table style={styles.table}>
                        <thead>
                          <tr style={styles.theadRow}>
                            <th style={{ ...styles.th, width: '130px' }}>Código</th>
                            <th style={{ ...styles.th, width: '110px' }}>Data</th>
                            <th style={{ ...styles.th, width: '110px' }}>Setor</th>
                            <th style={styles.th}>Solicitante</th>
                            <th style={styles.th}>Insumos Solicitados</th>
                            <th style={{ ...styles.th, width: '150px' }}>Status</th>
                            <th style={{ ...styles.th, textAlign: 'right', width: '130px' }}>Ações</th>
                          </tr>
                        </thead>
                        <tbody>
                          {displayedPurchases.map(req => {
                            const badge = getStatusBadgeColor(req.status);
                            const items = getRequestItems(req);
                            const canEdit = canUserEditRequest(req);
                            const canDelete = canUserDeleteRequest(req);

                            return (
                              <tr key={req.id} style={styles.tr}>
                                <td style={styles.td}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                    <strong style={{ color: '#0891b2', fontSize: '0.85rem' }}>
                                      {req.code ? `#${req.code}` : `#${req.id.substring(0, 7)}`}
                                    </strong>
                                    {req.priority === 'Urgente' && (
                                      <span style={styles.urgentMiniBadge}>🚨</span>
                                    )}
                                  </div>
                                </td>
                                <td style={styles.td}>
                                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                                    {req.createdAt ? new Date(req.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) : '-'}
                                  </span>
                                </td>
                                <td style={styles.td}>
                                  <span style={styles.categoryBadge}>
                                    {req.sector || 'Geral'}
                                  </span>
                                </td>
                                <td style={styles.td}>
                                  <div style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '0.82rem' }}>
                                    {req.requesterName || 'Profissional'}
                                  </div>
                                </td>
                                <td style={styles.td}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
                                    {items.slice(0, 2).map((it, idx) => (
                                      <span key={idx} style={styles.compactItemPill} title={it.specification || it.productName}>
                                        <strong>{it.quantity}{it.unit || 'un'}</strong> {it.productName}
                                      </span>
                                    ))}
                                    {items.length > 2 && (
                                      <span style={styles.compactMorePill} onClick={() => handleOpenDetails(req)}>
                                        +{items.length - 2} mais
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td style={styles.td}>
                                  <span style={{
                                    ...styles.statusBadge,
                                    backgroundColor: badge.bg,
                                    color: badge.text,
                                    borderColor: badge.border
                                  }}>
                                    {req.status}
                                  </span>
                                </td>
                                <td style={{ ...styles.td, textAlign: 'right' }}>
                                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                                    <button 
                                      type="button"
                                      onClick={() => handleOpenDetails(req)} 
                                      style={styles.actionIconBtn}
                                      title="Visualizar Detalhes"
                                    >
                                      <Eye size={15} color="#0891b2" />
                                    </button>
                                    {canEdit && (
                                      <button 
                                        type="button"
                                        onClick={() => handleOpenEditRequest(req)} 
                                        style={styles.actionIconBtn}
                                        title="Editar Solicitação"
                                      >
                                        <Edit size={15} color="#d97706" />
                                      </button>
                                    )}
                                    {canDelete && (
                                      <button 
                                        type="button"
                                        onClick={() => handleDeleteRequest(req)} 
                                        style={{ ...styles.actionIconBtn, color: '#ef4444' }}
                                        title="Excluir Solicitação"
                                      >
                                        <Trash2 size={15} color="#ef4444" />
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* MODO 2: VISUALIZAÇÃO NORMAL (CARDS MÉDIOS INFORMATIVOS) */}
                  {requestsViewMode === 'normal' && (
                    <div style={styles.normalCardsGrid}>
                      {displayedPurchases.map(req => {
                        const badge = getStatusBadgeColor(req.status);
                        const items = getRequestItems(req);
                        const canEdit = canUserEditRequest(req);
                        const canDelete = canUserDeleteRequest(req);

                        return (
                          <div key={req.id} style={styles.normalCard}>
                            {/* Topo do Card */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                              <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                  <strong style={{ color: '#0891b2', fontSize: '0.95rem' }}>
                                    {req.code ? `#${req.code}` : `#${req.id.substring(0, 7)}`}
                                  </strong>
                                  {req.priority === 'Urgente' && (
                                    <span style={styles.urgentMiniBadge}>🚨 Urgente</span>
                                  )}
                                </div>
                                <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block', marginTop: '0.15rem' }}>
                                  {req.createdAt ? new Date(req.createdAt).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) : '-'}
                                </span>
                              </div>
                              <span style={{
                                ...styles.statusBadge,
                                backgroundColor: badge.bg,
                                color: badge.text,
                                borderColor: badge.border
                              }}>
                                {req.status}
                              </span>
                            </div>

                            {/* Solicitante e Setor */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc', padding: '0.45rem 0.65rem', borderRadius: '6px', fontSize: '0.78rem' }}>
                              <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>
                                👤 {req.requesterName || 'Profissional'}
                              </span>
                              <span style={styles.categoryBadge}>
                                {req.sector || 'Geral'}
                              </span>
                            </div>

                            {/* Insumos */}
                            <div>
                              <span style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                                Insumos ({items.length}):
                              </span>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', marginTop: '0.25rem' }}>
                                {items.slice(0, 3).map((it, idx) => (
                                  <div key={idx} style={styles.cardItemRow}>
                                    <span style={{ fontWeight: '700', color: '#0891b2' }}>{it.quantity} {it.unit || 'un'}</span>
                                    <span style={{ color: 'var(--text-primary)', fontWeight: '500', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                      {it.productName}
                                    </span>
                                  </div>
                                ))}
                                {items.length > 3 && (
                                  <span style={{ fontSize: '0.72rem', color: '#0891b2', fontWeight: '600', cursor: 'pointer' }} onClick={() => handleOpenDetails(req)}>
                                    +{items.length - 3} outros itens no pedido...
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Justificativa */}
                            {req.justification && (
                              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)', fontStyle: 'italic', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                "{req.justification}"
                              </p>
                            )}

                            {/* Rodapé de Ações */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.5rem', borderTop: '1px solid #f1f5f9', marginTop: 'auto' }}>
                              <button
                                type="button"
                                onClick={() => handleOpenDetails(req)}
                                style={styles.cardDetailBtn}
                              >
                                <Eye size={13} />
                                <span>Detalhes</span>
                              </button>

                              <div style={{ display: 'flex', gap: '0.35rem' }}>
                                {canEdit && (
                                  <button
                                    type="button"
                                    onClick={() => handleOpenEditRequest(req)}
                                    style={styles.cardEditBtn}
                                    title="Editar Solicitação"
                                  >
                                    <Edit size={13} />
                                    <span>Editar</span>
                                  </button>
                                )}
                                {canDelete && (
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteRequest(req)}
                                    style={styles.cardDeleteBtn}
                                    title="Excluir Solicitação"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* MODO 3: VISUALIZAÇÃO ESTENDIDA (CARDS AMPLOS COM STEPPER E DETALHES COMPLETOS) */}
                  {requestsViewMode === 'extended' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {displayedPurchases.map(req => {
                        const badge = getStatusBadgeColor(req.status);
                        const items = getRequestItems(req);
                        const canEdit = canUserEditRequest(req);
                        const canDelete = canUserDeleteRequest(req);

                        return (
                          <div key={req.id} style={styles.extendedCard}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                              <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                                  <strong style={{ fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                                    Solicitação #{req.code || req.id.substring(0, 7)}
                                  </strong>
                                  <span style={styles.categoryBadge}>{req.sector?.toUpperCase() || 'GERAL'}</span>
                                  {req.priority === 'Urgente' && (
                                    <span style={styles.urgentMiniBadge}>🚨 URGENTE</span>
                                  )}
                                </div>
                                <span style={{ fontSize: '0.78rem', display: 'block', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                                  Solicitante: <strong>{req.requesterName}</strong> | Criado em: {req.createdAt ? new Date(req.createdAt).toLocaleString('pt-BR') : '-'}
                                </span>
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ ...styles.statusBadge, backgroundColor: badge.bg, color: badge.text, borderColor: badge.border }}>
                                  {req.status}
                                </span>
                                {canEdit && (
                                  <button onClick={() => handleOpenEditRequest(req)} style={styles.cardEditBtn} title="Editar">
                                    <Edit size={14} /> <span>Editar</span>
                                  </button>
                                )}
                                {canDelete && (
                                  <button onClick={() => handleDeleteRequest(req)} style={styles.cardDeleteBtn} title="Excluir">
                                    <Trash2 size={14} />
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Stepper Timeline Visual */}
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

                            {/* Tabela de Itens Integrada no Card */}
                            <div style={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                                <thead>
                                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                                    <th style={{ padding: '0.45rem 0.75rem', textAlign: 'left', color: '#64748b' }}>Insumo</th>
                                    <th style={{ padding: '0.45rem 0.75rem', textAlign: 'left', color: '#64748b', width: '110px' }}>Tipo</th>
                                    <th style={{ padding: '0.45rem 0.75rem', textAlign: 'left', color: '#64748b', width: '120px' }}>Quantidade</th>
                                    <th style={{ padding: '0.45rem 0.75rem', textAlign: 'left', color: '#64748b' }}>Especificação</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {items.map((it, idx) => (
                                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                      <td style={{ padding: '0.45rem 0.75rem', fontWeight: '700' }}>{it.productName}</td>
                                      <td style={{ padding: '0.45rem 0.75rem' }}>
                                        <span style={{ fontSize: '0.68rem', padding: '0.1rem 0.35rem', borderRadius: '4px', backgroundColor: it.type === 'Reposição' ? '#ecfeff' : '#fdf4ff', color: it.type === 'Reposição' ? '#0891b2' : '#a21caf', fontWeight: '700' }}>
                                          {it.type || 'Reposição'}
                                        </span>
                                      </td>
                                      <td style={{ padding: '0.45rem 0.75rem', fontWeight: '700', color: '#0891b2' }}>
                                        {it.quantity} {it.unit || 'un'}
                                      </td>
                                      <td style={{ padding: '0.45rem 0.75rem', color: 'var(--text-secondary)' }}>
                                        {it.specification || '-'}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>

                            {/* Justificativa */}
                            {req.justification && (
                              <div style={{ backgroundColor: '#fffbeb', border: '1px solid #fde68a', borderRadius: '6px', padding: '0.6rem 0.85rem', fontSize: '0.8rem', color: '#92400e', fontStyle: 'italic' }}>
                                "{req.justification}"
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* TAB 3: APROVAÇÕES PENDENTES (MULTI-ITEM AWARE) */}
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
                    const items = getRequestItems(req);

                    return (
                      <div key={req.id} style={styles.approvalRow}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                            <span style={{ 
                              fontSize: '0.7rem', 
                              padding: '0.15rem 0.5rem', 
                              borderRadius: '6px', 
                              backgroundColor: isManagerLevel ? '#fffbeb' : '#f0f9ff', 
                              color: isManagerLevel ? '#b45309' : '#0369a1',
                              fontWeight: '700',
                              textTransform: 'uppercase'
                            }}>
                              {req.status}
                            </span>
                            <strong style={{ fontSize: '0.95rem' }}>
                              {req.code ? `Pedido #${req.code}` : req.productName}
                            </strong>
                            <span style={styles.categoryBadge}>{req.sector?.toUpperCase() || 'GERAL'}</span>
                          </div>

                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
                            Solicitante: <strong>{req.requesterName}</strong> | Total: <strong>{items.length} insumos</strong> ({req.quantity} unidades)
                          </div>

                          {/* Preview de Itens */}
                          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginTop: '0.35rem' }}>
                            {items.map((it, idx) => (
                              <span key={idx} style={styles.compactItemPill}>
                                <strong>{it.quantity}{it.unit || 'un'}</strong> {it.productName}
                              </span>
                            ))}
                          </div>

                          {req.justification && (
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontStyle: 'italic', marginTop: '0.35rem', paddingLeft: '0.5rem', borderLeft: '2px solid #e5e7eb' }}>
                              "{req.justification}"
                            </div>
                          )}
                        </div>

                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          <button
                            type="button"
                            onClick={() => handleOpenDetails(req)}
                            style={styles.cardDetailBtn}
                          >
                            <Eye size={14} />
                            <span>Ver</span>
                          </button>

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

          {/* TAB 4: COTAÇÕES WEB E E-PROCUREMENT */}
          {activeTab === 'quotes' && (
            <WebQuotationsTab 
              currentUser={user}
              activeUnitId={activeUnitId}
              inventoryItems={currentInventoryItems}
              suppliers={suppliers}
              requisitions={currentRequisitions}
              onUpdateStock={() => fetchData(false)}
            />
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

      {/* MODAL: NOVA / EDITAR SOLICITAÇÃO (MULTI-ITEM) */}
      <PurchaseRequestModal 
        show={showRequestModal}
        onClose={() => { setShowRequestModal(false); setEditingRequest(null); }}
        onSave={handleSaveRequest}
        editingRequest={editingRequest}
        inventoryItems={currentInventoryItems}
        currentUser={user}
        actionLoading={actionLoading}
      />

      {/* MODAL: DETALHES COMPLETOS DA SOLICITAÇÃO */}
      <PurchaseDetailsModal 
        show={showDetailsModal}
        onClose={() => { setShowDetailsModal(false); setSelectedRequestDetails(null); }}
        request={selectedRequestDetails}
        onEdit={handleOpenEditRequest}
        onDelete={handleDeleteRequest}
        canEdit={canUserEditRequest(selectedRequestDetails)}
        canDelete={canUserDeleteRequest(selectedRequestDetails)}
        getStatusBadgeColor={getStatusBadgeColor}
      />

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

      {/* MODAL: DETALHAMENTO DE RESERVAS POR SALÃO / TÉCNICA */}
      {showSalonModal && selectedItemBreakdown && (
        <div style={styles.modalOverlay}>
          <div style={{ ...styles.modalContent, maxWidth: '620px' }}>
            <div style={styles.modalHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Layers size={20} color="#b45309" />
                <h3 style={styles.modalTitle}>Detalhamento de Requisições Abertas</h3>
              </div>
              <button onClick={() => { setShowSalonModal(false); setSelectedItemBreakdown(null); }} style={styles.modalCloseBtn}>×</button>
            </div>

            <div style={{ padding: '1.25rem' }}>
              <div style={{ backgroundColor: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', padding: '0.85rem', marginBottom: '1rem' }}>
                <strong style={{ color: '#b45309', fontSize: '0.95rem' }}>{selectedItemBreakdown.name}</strong>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.35rem', fontSize: '0.82rem', color: '#92400e', flexWrap: 'wrap' }}>
                  <span>Físico: <strong>{selectedItemBreakdown.physicalStock} {selectedItemBreakdown.unit || 'un'}</strong></span>
                  <span>Reservado: <strong>{selectedItemBreakdown.committedStock} {selectedItemBreakdown.unit || 'un'}</strong></span>
                  <span>Disponível: <strong>{selectedItemBreakdown.availableStock} {selectedItemBreakdown.unit || 'un'}</strong></span>
                  <span>Mínimo: <strong>{selectedItemBreakdown.minStock} {selectedItemBreakdown.unit || 'un'}</strong></span>
                </div>
              </div>

              <h4 style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                Requisições que Comprometeram o Estoque:
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '300px', overflowY: 'auto' }}>
                {selectedItemBreakdown.salonBreakdown.map((req, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <strong style={{ color: 'var(--primary-color)', fontSize: '0.85rem' }}>{req.code}</strong>
                        <span style={{ fontSize: '0.75rem', backgroundColor: '#e0f2fe', color: '#0369a1', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: '700' }}>
                          📍 {req.salon}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                        Solicitante: <strong>{req.requestedBy}</strong> | Destino: <strong>{req.patient}</strong>
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                        Data: {req.createdAt ? new Date(req.createdAt).toLocaleString('pt-BR') : '-'}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.95rem', fontWeight: '800', color: '#b45309' }}>
                        {req.qty} {req.unit}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => { setShowSalonModal(false); setSelectedItemBreakdown(null); }}
                  style={styles.primaryBtn}
                >
                  Fechar
                </button>
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
    justifyContent: 'center',
    color: '#64748b'
  },
  segmentedToggle: {
    display: 'inline-flex',
    backgroundColor: '#f1f5f9',
    padding: '3px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0'
  },
  segmentedBtn: {
    border: 'none',
    padding: '0.35rem 0.75rem',
    borderRadius: '6px',
    fontSize: '0.78rem',
    cursor: 'pointer',
    transition: 'all 0.15s ease'
  },
  viewModeToggle: {
    display: 'inline-flex',
    backgroundColor: '#f1f5f9',
    padding: '3px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    gap: '2px'
  },
  viewModeBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
    border: 'none',
    padding: '0.35rem 0.65rem',
    borderRadius: '6px',
    fontSize: '0.78rem',
    cursor: 'pointer',
    transition: 'all 0.15s ease'
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
    borderRadius: '6px',
    display: 'inline-block'
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
  statusBadge: {
    fontSize: '0.75rem',
    fontWeight: '700',
    padding: '0.2rem 0.6rem',
    borderRadius: '6px',
    border: '1px solid transparent',
    display: 'inline-block',
    whiteSpace: 'nowrap'
  },
  urgentMiniBadge: {
    fontSize: '0.68rem',
    fontWeight: '800',
    backgroundColor: '#fef2f2',
    color: '#ef4444',
    border: '1px solid #fecaca',
    padding: '0.1rem 0.35rem',
    borderRadius: '4px'
  },
  compactItemPill: {
    fontSize: '0.75rem',
    padding: '0.15rem 0.5rem',
    backgroundColor: '#f1f5f9',
    color: '#334155',
    borderRadius: '6px',
    border: '1px solid #e2e8f0',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    whiteSpace: 'nowrap'
  },
  compactMorePill: {
    fontSize: '0.72rem',
    padding: '0.15rem 0.45rem',
    backgroundColor: '#ecfeff',
    color: '#0891b2',
    borderRadius: '6px',
    border: '1px solid #cffafe',
    fontWeight: '700',
    cursor: 'pointer'
  },
  actionIconBtn: {
    background: 'none',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    padding: '0.35rem',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.15s ease'
  },
  normalCardsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '1rem'
  },
  normalCard: {
    backgroundColor: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '1.1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    transition: 'transform 0.15s ease, box-shadow 0.15s ease'
  },
  cardItemRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    fontSize: '0.78rem',
    backgroundColor: '#f8fafc',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px'
  },
  cardDetailBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.3rem',
    padding: '0.35rem 0.65rem',
    borderRadius: '6px',
    border: '1px solid #cffafe',
    backgroundColor: '#ecfeff',
    color: '#0891b2',
    fontWeight: '700',
    fontSize: '0.75rem',
    cursor: 'pointer'
  },
  cardEditBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.3rem',
    padding: '0.35rem 0.65rem',
    borderRadius: '6px',
    border: '1px solid #fed7aa',
    backgroundColor: '#fffbeb',
    color: '#d97706',
    fontWeight: '700',
    fontSize: '0.75rem',
    cursor: 'pointer'
  },
  cardDeleteBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0.35rem 0.55rem',
    borderRadius: '6px',
    border: '1px solid #fecaca',
    backgroundColor: '#fef2f2',
    color: '#ef4444',
    fontWeight: '700',
    fontSize: '0.75rem',
    cursor: 'pointer'
  },
  extendedCard: {
    backgroundColor: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  timelineWrapper: {
    position: 'relative',
    marginTop: '0.5rem',
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
