import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, Search, Building2, Clock, CheckCircle2, AlertTriangle, 
  ExternalLink, Copy, Send, Check, Eye, Trash2, Award, Printer, 
  FileText, Truck, DollarSign, Package, ArrowUpDown, ChevronRight,
  Filter, Layers, X, Calendar, Share2
} from 'lucide-react';
import { dbService } from '../../firebase';
import { generateQuoteToken, generateQuotationCode } from '../../services/firebase/purchasingService';

export default function WebQuotationsTab({ 
  currentUser, 
  activeUnitId, 
  inventoryItems = [], 
  suppliers = [],
  requisitions = [],
  onUpdateStock
}) {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Selected Quotation for Comparison / Details
  const [activeQuotation, setActiveQuotation] = useState(null);
  const [responses, setResponses] = useState([]);
  const [loadingResponses, setLoadingResponses] = useState(false);
  const [showComparisonModal, setShowComparisonModal] = useState(false);

  // Homologation State
  const [homologationMode, setHomologationMode] = useState('split'); // 'single' | 'split'
  const [selectedSingleSupplierId, setSelectedSingleSupplierId] = useState('');
  const [itemSplitAwards, setItemSplitAwards] = useState({}); // itemId -> supplierId
  const [actionLoading, setActionLoading] = useState(false);

  // New Quotation Modal State
  const [showNewModal, setShowNewModal] = useState(false);
  const [newQuoteForm, setNewQuoteForm] = useState({
    title: '',
    deadline: '',
    notes: '',
    items: [],
    selectedSuppliers: []
  });

  // Share Links Modal
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedQuotationForShare, setSelectedQuotationForShare] = useState(null);
  const [copiedToken, setCopiedToken] = useState(null);

  // PO / Order View Modal
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderToView, setOrderToView] = useState(null);

  useEffect(() => {
    loadQuotations();
  }, []);

  const loadQuotations = async () => {
    setLoading(true);
    try {
      const list = await dbService.getWebQuotations();
      setQuotations(list || []);
    } catch (err) {
      console.error('Erro ao carregar cotações:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenComparison = async (quote) => {
    setActiveQuotation(quote);
    setShowComparisonModal(true);
    setLoadingResponses(true);
    try {
      const respList = await dbService.getQuoteResponses(quote.id);
      setResponses(respList || []);

      // Auto-calculate default lowest-price split
      const autoSplits = {};
      (quote.items || []).forEach(it => {
        let lowestPrice = Infinity;
        let bestSupplierId = null;

        (respList || []).forEach(r => {
          const matchingOffer = (r.items || []).find(oi => oi.itemId === it.id);
          if (matchingOffer && matchingOffer.available && matchingOffer.unitPrice > 0) {
            if (matchingOffer.unitPrice < lowestPrice) {
              lowestPrice = matchingOffer.unitPrice;
              bestSupplierId = r.supplierId || r.supplierName;
            }
          }
        });

        if (bestSupplierId) {
          autoSplits[it.id] = bestSupplierId;
        }
      });

      setItemSplitAwards(quote.winningSplits || autoSplits);
      setSelectedSingleSupplierId(quote.winningSupplierId || (respList[0]?.supplierId || respList[0]?.supplierName || ''));
    } catch (err) {
      console.error('Erro ao carregar propostas da cotação:', err);
    } finally {
      setLoadingResponses(false);
    }
  };

  // Open New Quotation Modal
  const handleOpenNewModal = () => {
    const nextCode = generateQuotationCode(quotations.length);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 3);
    tomorrow.setHours(18, 0, 0, 0);

    const formattedDeadline = tomorrow.toISOString().slice(0, 16);

    setNewQuoteForm({
      code: nextCode,
      title: `Cotação Semanal de Insumos #${nextCode}`,
      deadline: formattedDeadline,
      notes: 'Frete CIF prioritário. Pagamento via Boleto 28 dias. Enviar Registro ANVISA para insumos estéreis.',
      items: [],
      selectedSuppliers: suppliers.slice(0, 3).map(s => ({
        supplierId: s.id,
        name: s.name,
        tradeName: s.tradeName || s.name,
        cnpj: s.cnpj || '',
        contactPerson: s.contactPerson || '',
        phone: s.phone || '',
        email: s.email || '',
        token: generateQuoteToken(),
        status: 'Pendente'
      }))
    });
    setShowNewModal(true);
  };

  // Add Item to Quotation
  const handleAddItemToQuote = (stockItem) => {
    const exists = newQuoteForm.items.some(i => i.productId === stockItem.id);
    if (exists) return;

    const newItem = {
      id: 'item_' + Date.now() + Math.random().toString(36).substr(2, 4),
      productId: stockItem.id,
      productName: stockItem.name,
      quantity: Math.max(1, (parseFloat(stockItem.idealStock) || 20) - (parseFloat(stockItem.currentStock) || 0)),
      unit: stockItem.unit || 'un',
      specification: stockItem.specification || stockItem.category || '',
      lastPricePaid: parseFloat(stockItem.lastPrice || stockItem.averageCost) || 0
    };

    setNewQuoteForm(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
  };

  // Import Critical Items from Stock
  const handleImportCriticalStock = () => {
    const critical = inventoryItems.filter(item => {
      const curr = parseFloat(item.currentStock) || 0;
      const min = parseFloat(item.minStock) || 0;
      return curr <= min;
    });

    if (critical.length === 0) {
      alert('Nenhum item do estoque está abaixo do nível mínimo no momento.');
      return;
    }

    const itemsToAdd = critical.map(item => ({
      id: 'item_' + Date.now() + Math.random().toString(36).substr(2, 4),
      productId: item.id,
      productName: item.name,
      quantity: Math.max(10, Math.round(((parseFloat(item.minStock) || 10) * 2) - (parseFloat(item.currentStock) || 0))),
      unit: item.unit || 'un',
      specification: item.category || '',
      lastPricePaid: parseFloat(item.lastPrice || item.averageCost) || 0
    }));

    setNewQuoteForm(prev => ({
      ...prev,
      items: [...prev.items, ...itemsToAdd.filter(na => !prev.items.some(ex => ex.productId === na.productId))]
    }));
  };

  // Remove Item from Quote Form
  const handleRemoveItemFromQuote = (itemId) => {
    setNewQuoteForm(prev => ({
      ...prev,
      items: prev.items.filter(i => i.id !== itemId)
    }));
  };

  // Update Item in Quote Form
  const handleUpdateQuoteItem = (itemId, field, value) => {
    setNewQuoteForm(prev => ({
      ...prev,
      items: prev.items.map(i => i.id === itemId ? { ...i, [field]: value } : i)
    }));
  };

  // Toggle Supplier in Quote Form
  const handleToggleSupplier = (supplier) => {
    const isSelected = newQuoteForm.selectedSuppliers.some(s => s.supplierId === supplier.id);
    if (isSelected) {
      setNewQuoteForm(prev => ({
        ...prev,
        selectedSuppliers: prev.selectedSuppliers.filter(s => s.supplierId !== supplier.id)
      }));
    } else {
      setNewQuoteForm(prev => ({
        ...prev,
        selectedSuppliers: [
          ...prev.selectedSuppliers,
          {
            supplierId: supplier.id,
            name: supplier.name,
            tradeName: supplier.tradeName || supplier.name,
            cnpj: supplier.cnpj || '',
            contactPerson: supplier.contactPerson || '',
            phone: supplier.phone || '',
            email: supplier.email || '',
            token: generateQuoteToken(),
            status: 'Pendente'
          }
        ]
      }));
    }
  };

  // Save / Publish New Quotation
  const handleSaveQuotation = async (e) => {
    e.preventDefault();
    if (newQuoteForm.items.length === 0) {
      alert('Adicione pelo menos um item à cotação.');
      return;
    }
    if (newQuoteForm.selectedSuppliers.length === 0) {
      alert('Selecione pelo menos um fornecedor para enviar a cotação.');
      return;
    }

    setActionLoading(true);
    try {
      const payload = {
        code: newQuoteForm.code || generateQuotationCode(quotations.length),
        title: newQuoteForm.title,
        unitId: activeUnitId || 'geral',
        unit: activeUnitId === 'betim' ? 'Betim' : activeUnitId === 'taguatinga' ? 'Taguatinga' : 'Geral',
        buyerName: currentUser?.name || 'Comprador NexaCLINIC',
        buyerEmail: currentUser?.email || '',
        status: 'Aberta',
        deadline: newQuoteForm.deadline,
        notes: newQuoteForm.notes,
        items: newQuoteForm.items,
        suppliers: newQuoteForm.selectedSuppliers
      };

      const created = await dbService.createWebQuotation(payload);
      setShowNewModal(false);
      await loadQuotations();

      // Open share modal immediately
      setSelectedQuotationForShare(created);
      setShowShareModal(true);
    } catch (err) {
      console.error('Erro ao salvar cotação:', err);
      alert('Erro ao criar cotação. Tente novamente.');
    } finally {
      setActionLoading(false);
    }
  };

  // Copy Link to Clipboard
  const handleCopyLink = (token) => {
    const portalUrl = `${window.location.origin}/?token=${token}`;
    navigator.clipboard.writeText(portalUrl);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 3000);
  };

  // WhatsApp Share Dispatch
  const handleSendWhatsApp = (supplier, quote) => {
    const portalUrl = `${window.location.origin}/?token=${supplier.token}`;
    const cleanPhone = (supplier.phone || '').replace(/\D/g, '');
    const deadlineFormatted = new Date(quote.deadline).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
    
    const text = `Olá, *${supplier.contactPerson || supplier.name}*!\n\nA *NexaCLINIC (${quote.unit})* abriu a Cotação *#${quote.code}* com ${quote.items.length} itens.\n\nPor favor, acesse o link seguro abaixo para digitar seus preços, prazos e condições comerciais até *${deadlineFormatted}*:\n🔗 ${portalUrl}\n\nObrigado!`;

    const whatsappUrl = `https://api.whatsapp.com/send?phone=${cleanPhone ? '55' + cleanPhone : ''}&text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  };

  // Homologate Quotation
  const handleHomologateQuotation = async () => {
    if (!activeQuotation) return;
    if (responses.length === 0) {
      alert('Não há propostas recebidas para homologação.');
      return;
    }

    if (!window.confirm('Deseja realmente homologar esta cotação e emitir o Pedido de Compra?')) {
      return;
    }

    setActionLoading(true);
    try {
      let winningSupplierName = '';
      if (homologationMode === 'single') {
        const foundResp = responses.find(r => (r.supplierId || r.supplierName) === selectedSingleSupplierId);
        winningSupplierName = foundResp ? foundResp.supplierName : selectedSingleSupplierId;
      }

      await dbService.updateWebQuotation(activeQuotation.id, {
        status: 'Homologada',
        winningSupplierId: homologationMode === 'single' ? selectedSingleSupplierId : undefined,
        winningSupplierName: homologationMode === 'single' ? winningSupplierName : 'Compra Dividida (Split)',
        winningSplits: homologationMode === 'split' ? itemSplitAwards : undefined
      });

      setShowComparisonModal(false);
      await loadQuotations();
      alert('Cotação homologada com sucesso! O Pedido de Compra Oficial foi emitido.');
    } catch (err) {
      console.error('Erro ao homologar cotação:', err);
      alert('Erro ao homologar cotação.');
    } finally {
      setActionLoading(false);
    }
  };

  // Filtered Quotations
  const filteredQuotations = useMemo(() => {
    return quotations.filter(q => {
      const matchStatus = statusFilter === 'all' || q.status === statusFilter;
      const matchSearch = searchTerm === '' || 
        q.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.unit?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchStatus && matchSearch;
    });
  }, [quotations, statusFilter, searchTerm]);

  return (
    <div style={styles.tabContainer}>
      
      {/* Top Header & Actions */}
      <div style={styles.topBar}>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center', flex: 1 }}>
          <div style={styles.searchWrapper}>
            <Search size={16} color="#64748b" />
            <input 
              type="text" 
              placeholder="Buscar por código, título ou filial..." 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
            {searchTerm && <button onClick={() => setSearchTerm('')} style={styles.clearBtn}>×</button>}
          </div>

          <div style={styles.filterWrapper}>
            <Filter size={14} color="#64748b" />
            <select 
              value={statusFilter} 
              onChange={e => setStatusFilter(e.target.value)}
              style={styles.filterSelect}
            >
              <option value="all">Todos os Status</option>
              <option value="Aberta">Abertas</option>
              <option value="Em Análise">Em Análise</option>
              <option value="Homologada">Homologadas</option>
              <option value="Expirada">Expiradas</option>
            </select>
          </div>
        </div>

        <button onClick={handleOpenNewModal} style={styles.btnPrimary}>
          <Plus size={16} />
          <span>Nova Cotação</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div style={styles.kpiGrid}>
        <div style={styles.kpiCard}>
          <span style={styles.kpiLabel}>Total</span>
          <strong style={styles.kpiValue}>{quotations.length}</strong>
        </div>
        <div style={styles.kpiCard}>
          <span style={{ ...styles.kpiLabel, color: '#0284c7' }}>Abertas</span>
          <strong style={{ ...styles.kpiValue, color: '#0284c7' }}>
            {quotations.filter(q => q.status === 'Aberta').length}
          </strong>
        </div>
        <div style={styles.kpiCard}>
          <span style={{ ...styles.kpiLabel, color: '#eab308' }}>Em Análise</span>
          <strong style={{ ...styles.kpiValue, color: '#ca8a04' }}>
            {quotations.filter(q => q.status === 'Em Análise').length}
          </strong>
        </div>
        <div style={styles.kpiCard}>
          <span style={{ ...styles.kpiLabel, color: '#16a34a' }}>Homologadas</span>
          <strong style={{ ...styles.kpiValue, color: '#16a34a' }}>
            {quotations.filter(q => q.status === 'Homologada').length}
          </strong>
        </div>
      </div>

      {/* Quotations List */}
      <div style={styles.tableCard}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.theadRow}>
              <th style={styles.th}>Código</th>
              <th style={styles.th}>Título</th>
              <th style={styles.th}>Filial</th>
              <th style={styles.th}>Prazo</th>
              <th style={styles.th}>Progresso</th>
              <th style={styles.th}>Status</th>
              <th style={{ ...styles.th, textAlign: 'right' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" style={styles.emptyTd}>
                  <div style={styles.spinner}></div>
                  <span>Carregando cotações web...</span>
                </td>
              </tr>
            ) : filteredQuotations.length === 0 ? (
              <tr>
                <td colSpan="7" style={styles.emptyTd}>
                  <Package size={32} color="#94a3b8" style={{ marginBottom: '0.5rem' }} />
                  <p style={{ margin: 0, fontWeight: '600' }}>Nenhuma cotação encontrada.</p>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Clique em "Nova Cotação" para iniciar uma rodada com fornecedores.</span>
                </td>
              </tr>
            ) : (
              filteredQuotations.map(q => {
                const totalSuppliers = q.suppliers?.length || 0;
                const respondedSuppliers = q.suppliers?.filter(s => s.status === 'Respondida').length || 0;
                const isDeadlinePassed = new Date(q.deadline) < new Date();
                const deadlineFormatted = new Date(q.deadline).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });

                return (
                  <tr key={q.id} style={styles.trRow}>
                    <td style={styles.td}>
                      <strong style={{ color: '#0284c7', fontSize: '0.85rem' }}>{q.code}</strong>
                    </td>

                    <td style={styles.td}>
                      <strong style={{ fontSize: '0.88rem', color: '#0f172a', display: 'block' }}>{q.title}</strong>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{q.items?.length || 0} insumos solicitados</span>
                    </td>

                    <td style={styles.td}>
                      <span style={styles.unitBadge}>{q.unit}</span>
                    </td>

                    <td style={styles.td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: isDeadlinePassed ? '#991b1b' : '#334155' }}>
                        <Clock size={13} color={isDeadlinePassed ? '#dc2626' : '#64748b'} />
                        <span>{deadlineFormatted}</span>
                      </div>
                    </td>

                    <td style={styles.td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={styles.progressBarBg}>
                          <div style={{
                            ...styles.progressBarFill,
                            width: totalSuppliers > 0 ? `${(respondedSuppliers / totalSuppliers) * 100}%` : '0%'
                          }}></div>
                        </div>
                        <span style={{ fontSize: '0.75rem', fontWeight: '700', color: respondedSuppliers > 0 ? '#16a34a' : '#64748b' }}>
                          {respondedSuppliers}/{totalSuppliers}
                        </span>
                      </div>
                    </td>

                    <td style={styles.td}>
                      <span style={{
                        ...styles.statusBadge,
                        backgroundColor: q.status === 'Homologada' ? '#dcfce7' : q.status === 'Em Análise' ? '#fef9c3' : '#e0f2fe',
                        color: q.status === 'Homologada' ? '#15803d' : q.status === 'Em Análise' ? '#a16207' : '#0369a1'
                      }}>
                        {q.status}
                      </span>
                    </td>

                    <td style={{ ...styles.td, textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end' }}>
                        <button 
                          onClick={() => handleOpenComparison(q)} 
                          title="Abrir Mapa Comparativo de Preços" 
                          style={styles.actionBtnPrimary}
                        >
                          <Eye size={14} />
                          <span>Comparativo</span>
                        </button>

                        <button 
                          onClick={() => {
                            setSelectedQuotationForShare(q);
                            setShowShareModal(true);
                          }} 
                          title="Ver Links e WhatsApp dos Fornecedores" 
                          style={styles.actionBtnSecondary}
                        >
                          <Share2 size={14} />
                          <span>Links</span>
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

      {/* ========================================================================= */}
      {/* MODAL 1: NOVA COTAÇÃO WEB */}
      {/* ========================================================================= */}
      {showNewModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContentLarge}>
            <div style={styles.modalHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Plus size={20} color="#0284c7" />
                <h2 style={styles.modalTitle}>Nova Cotação Web (NexaPROCURE)</h2>
              </div>
              <button onClick={() => setShowNewModal(false)} style={styles.closeBtn}>×</button>
            </div>

            <form onSubmit={handleSaveQuotation} style={{ padding: '1.25rem' }}>
              
              {/* Top Details */}
              <div style={styles.formRow3}>
                <div className="form-group">
                  <label style={styles.label}>Código</label>
                  <input type="text" readOnly value={newQuoteForm.code} style={{ ...styles.input, backgroundColor: '#f1f5f9' }} />
                </div>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label style={styles.label}>Título *</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="Ex: Cotação de Insumos de Hemodiálise e Farmácia" 
                    value={newQuoteForm.title} 
                    onChange={e => setNewQuoteForm({ ...newQuoteForm, title: e.target.value })} 
                    style={styles.input} 
                  />
                </div>
              </div>

              <div style={styles.formRow2}>
                <div className="form-group">
                  <label style={styles.label}>Prazo Limite *</label>
                  <input 
                    type="datetime-local" 
                    required 
                    value={newQuoteForm.deadline} 
                    onChange={e => setNewQuoteForm({ ...newQuoteForm, deadline: e.target.value })} 
                    style={styles.input} 
                  />
                </div>
                <div className="form-group">
                  <label style={styles.label}>Observações para Fornecedores</label>
                  <input 
                    type="text" 
                    placeholder="Orientações de entrega, tipo de frete..." 
                    value={newQuoteForm.notes} 
                    onChange={e => setNewQuoteForm({ ...newQuoteForm, notes: e.target.value })} 
                    style={styles.input} 
                  />
                </div>
              </div>

              {/* Step 2: Cesta de Itens */}
              <div style={styles.sectionBox}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Package size={16} color="#0284c7" />
                    <strong style={{ fontSize: '0.9rem', color: '#0f172a' }}>Cesta de Insumos ({newQuoteForm.items.length})</strong>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button 
                      type="button" 
                      onClick={handleImportCriticalStock} 
                      style={styles.btnOutlineSecondary}
                    >
                      ⚡ Importar Estoque Crítico
                    </button>
                  </div>
                </div>

                {/* Quick Add from inventory dropdown */}
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <select 
                    style={{ ...styles.select, flex: 1 }}
                    onChange={e => {
                      const sel = inventoryItems.find(i => i.id === e.target.value);
                      if (sel) handleAddItemToQuote(sel);
                      e.target.value = '';
                    }}
                    defaultValue=""
                  >
                    <option value="" disabled>+ Adicionar item do catálogo de estoque...</option>
                    {inventoryItems.map(item => (
                      <option key={item.id} value={item.id}>
                        {item.name} (Atual: {item.currentStock || 0} {item.unit || 'un'} | Mín: {item.minStock || 0})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Items Table in Modal */}
                <div style={{ maxHeight: '220px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
                  <table style={styles.table}>
                    <thead>
                      <tr style={styles.theadRow}>
                        <th style={styles.th}>Insumo</th>
                        <th style={{ ...styles.th, width: '110px' }}>Quantidade</th>
                        <th style={{ ...styles.th, width: '90px' }}>Unidade</th>
                        <th style={{ ...styles.th, width: '130px' }}>Último Preço</th>
                        <th style={{ ...styles.th, width: '40px' }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {newQuoteForm.items.length === 0 ? (
                        <tr>
                          <td colSpan="5" style={{ textAlign: 'center', padding: '1.5rem', color: '#64748b', fontSize: '0.8rem' }}>
                            Nenhum insumo adicionado. Selecione no menu acima ou clique em "Importar Estoque Crítico".
                          </td>
                        </tr>
                      ) : (
                        newQuoteForm.items.map(item => (
                          <tr key={item.id} style={styles.trRow}>
                            <td style={styles.td}>
                              <input 
                                type="text" 
                                value={item.productName} 
                                onChange={e => handleUpdateQuoteItem(item.id, 'productName', e.target.value)}
                                style={{ ...styles.input, fontWeight: '600' }}
                              />
                            </td>
                            <td style={styles.td}>
                              <input 
                                type="number" 
                                value={item.quantity} 
                                onChange={e => handleUpdateQuoteItem(item.id, 'quantity', parseFloat(e.target.value) || 1)}
                                style={styles.input}
                              />
                            </td>
                            <td style={styles.td}>
                              <input 
                                type="text" 
                                value={item.unit} 
                                onChange={e => handleUpdateQuoteItem(item.id, 'unit', e.target.value)}
                                style={styles.input}
                              />
                            </td>
                            <td style={styles.td}>
                              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                {item.lastPricePaid ? item.lastPricePaid.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '-'}
                              </span>
                            </td>
                            <td style={styles.td}>
                              <button 
                                type="button" 
                                onClick={() => handleRemoveItemFromQuote(item.id)}
                                style={styles.deleteIconBtn}
                              >
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

              {/* Step 3: Fornecedores Convidados */}
              <div style={styles.sectionBox}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.75rem' }}>
                  <Building2 size={16} color="#0284c7" />
                  <strong style={{ fontSize: '0.9rem', color: '#0f172a' }}>
                    Fornecedores Convidados ({newQuoteForm.selectedSuppliers.length})
                  </strong>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '0.5rem', maxHeight: '160px', overflowY: 'auto' }}>
                  {suppliers.map(s => {
                    const isSelected = newQuoteForm.selectedSuppliers.some(sel => sel.supplierId === s.id);
                    return (
                      <div 
                        key={s.id} 
                        onClick={() => handleToggleSupplier(s)}
                        style={{
                          ...styles.supplierCheckCard,
                          backgroundColor: isSelected ? '#f0f9ff' : '#fff',
                          borderColor: isSelected ? '#0284c7' : '#cbd5e1'
                        }}
                      >
                        <input 
                          type="checkbox" 
                          checked={isSelected} 
                          onChange={() => {}} 
                          style={{ cursor: 'pointer' }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <strong style={{ fontSize: '0.8rem', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {s.name}
                          </strong>
                          <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>
                            {s.phone ? `📱 ${s.phone}` : s.email || 'Sem contato'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Modal Actions */}
              <div style={styles.modalFooter}>
                <button type="button" onClick={() => setShowNewModal(false)} style={styles.btnSecondary}>
                  Cancelar
                </button>
                <button type="submit" disabled={actionLoading} style={styles.btnPrimary}>
                  {actionLoading ? 'Gerando Cotação...' : 'Publicar Cotação e Gerar Links'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: LINKS DOS FORNECEDORES & WHATSAPP */}
      {/* ========================================================================= */}
      {showShareModal && selectedQuotationForShare && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContentMedium}>
            <div style={styles.modalHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Share2 size={18} color="#0284c7" />
                <h2 style={styles.modalTitle}>Links Exclusivos dos Fornecedores ({selectedQuotationForShare.code})</h2>
              </div>
              <button onClick={() => setShowShareModal(false)} style={styles.closeBtn}>×</button>
            </div>

            <div style={{ padding: '1.25rem' }}>
              <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '0 0 1rem 0' }}>
                Cada fornecedor possui um link único criptografado. Clique em <strong>WhatsApp</strong> para abrir a mensagem pré-formatada ou <strong>Copiar</strong> para colar em e-mails.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '350px', overflowY: 'auto' }}>
                {selectedQuotationForShare.suppliers?.map(s => {
                  const isCopied = copiedToken === s.token;
                  return (
                    <div key={s.token} style={styles.shareRowCard}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <strong style={{ fontSize: '0.88rem', color: '#0f172a' }}>{s.name}</strong>
                          <span style={{
                            fontSize: '0.7rem',
                            fontWeight: '700',
                            padding: '0.1rem 0.4rem',
                            borderRadius: '4px',
                            backgroundColor: s.status === 'Respondida' ? '#dcfce7' : '#f1f5f9',
                            color: s.status === 'Respondida' ? '#166534' : '#64748b'
                          }}>
                            {s.status}
                          </span>
                        </div>
                        <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginTop: '0.15rem' }}>
                          Contato: {s.contactPerson || 'Representante'} {s.phone && `• ${s.phone}`}
                        </span>
                      </div>

                      <div style={{ display: 'flex', gap: '0.35rem' }}>
                        <button 
                          onClick={() => handleCopyLink(s.token)} 
                          style={styles.actionBtnSecondary}
                          title="Copiar Link Seguro do Fornecedor"
                        >
                          {isCopied ? <Check size={14} color="#16a34a" /> : <Copy size={14} />}
                          <span>{isCopied ? 'Copiado!' : 'Copiar'}</span>
                        </button>

                        <button 
                          onClick={() => handleSendWhatsApp(s, selectedQuotationForShare)} 
                          style={styles.btnWhatsApp}
                          title="Enviar convite por WhatsApp"
                        >
                          <Send size={14} />
                          <span>WhatsApp</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={styles.modalFooter}>
              <button onClick={() => setShowShareModal(false)} style={styles.btnSecondary}>
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: MAPA COMPARATIVO DE PREÇOS (QUADRO INTELIGENTE) */}
      {/* ========================================================================= */}
      {showComparisonModal && activeQuotation && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContentFull}>
            <div style={styles.modalHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Award size={20} color="#0284c7" />
                <div>
                  <h2 style={styles.modalTitle}>Mapa Comparativo de Cotações — {activeQuotation.code}</h2>
                  <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                    {activeQuotation.title} • {activeQuotation.unit}
                  </span>
                </div>
              </div>
              <button onClick={() => setShowComparisonModal(false)} style={styles.closeBtn}>×</button>
            </div>

            <div style={{ padding: '1.25rem', overflowY: 'auto', flex: 1 }}>
              
              {loadingResponses ? (
                <div style={{ textAlign: 'center', padding: '3rem' }}>
                  <div style={styles.spinner}></div>
                  <p style={{ marginTop: '0.75rem', color: '#0369a1', fontWeight: '600' }}>Carregando lances dos fornecedores...</p>
                </div>
              ) : responses.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px dashed #cbd5e1' }}>
                  <Clock size={36} color="#94a3b8" style={{ marginBottom: '0.5rem' }} />
                  <h3 style={{ margin: '0 0 0.25rem 0', color: '#0f172a', fontSize: '1rem' }}>Aguardando Respostas</h3>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b' }}>
                    Nenhum fornecedor enviou sua proposta ainda. Você pode reenviar os links pelo botão "Links".
                  </p>
                </div>
              ) : (
                <>
                  {/* Homologation Selection Mode */}
                  <div style={styles.homologationBar}>
                    <div>
                      <strong style={{ fontSize: '0.9rem', color: '#0f172a', display: 'block' }}>Estratégia de Homologação:</strong>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        Escolha se deseja dividir a compra pelos melhores preços ou fechar pedido único.
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600' }}>
                        <input 
                          type="radio" 
                          name="homologMode" 
                          value="split" 
                          checked={homologationMode === 'split'} 
                          onChange={() => setHomologationMode('split')}
                        />
                        🏆 Menor Preço por Item (Split)
                      </label>

                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600' }}>
                        <input 
                          type="radio" 
                          name="homologMode" 
                          value="single" 
                          checked={homologationMode === 'single'} 
                          onChange={() => setHomologationMode('single')}
                        />
                        📦 Pedido Global Consolidado
                      </label>
                    </div>
                  </div>

                  {/* Matrix Table */}
                  <div style={{ overflowX: 'auto', marginBottom: '1.5rem', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                    <table style={styles.matrixTable}>
                      <thead>
                        <tr style={styles.matrixTheadRow}>
                          <th style={{ ...styles.th, minWidth: '220px', position: 'sticky', left: 0, backgroundColor: '#f8fafc', zIndex: 2 }}>
                            Insumo Solicitado
                          </th>
                          <th style={{ ...styles.th, width: '100px', textAlign: 'center' }}>Qtd</th>
                          <th style={{ ...styles.th, width: '110px', textAlign: 'right' }}>Última Compra</th>
                          
                          {/* Suppliers Columns */}
                          {responses.map(resp => (
                            <th key={resp.id} style={{ ...styles.th, minWidth: '180px', textAlign: 'center', backgroundColor: '#f0f9ff' }}>
                              <div style={{ fontWeight: '800', color: '#0369a1' }}>{resp.supplierName}</div>
                              <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 'normal' }}>
                                Prazo: {resp.leadTimeDays || 3}d • Frete {resp.freightType}
                              </span>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {activeQuotation.items?.map(item => {
                          // Find lowest price for this item among all responses
                          let lowestPrice = Infinity;
                          responses.forEach(r => {
                            const offer = (r.items || []).find(oi => oi.itemId === item.id);
                            if (offer && offer.available && offer.unitPrice > 0 && offer.unitPrice < lowestPrice) {
                              lowestPrice = offer.unitPrice;
                            }
                          });

                          return (
                            <tr key={item.id} style={styles.trRow}>
                              <td style={{ ...styles.td, position: 'sticky', left: 0, backgroundColor: '#fff', zIndex: 1 }}>
                                <strong style={{ fontSize: '0.85rem', color: '#0f172a' }}>{item.productName}</strong>
                                {item.specification && (
                                  <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>{item.specification}</span>
                                )}
                              </td>

                              <td style={{ ...styles.td, textAlign: 'center', fontWeight: '700' }}>
                                {item.quantity} {item.unit}
                              </td>

                              <td style={{ ...styles.td, textAlign: 'right', fontSize: '0.82rem', color: '#64748b' }}>
                                {item.lastPricePaid ? item.lastPricePaid.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '-'}
                              </td>

                              {/* Supplier Offers for this item */}
                              {responses.map(resp => {
                                const offer = (resp.items || []).find(oi => oi.itemId === item.id);
                                const isLowest = offer && offer.available && offer.unitPrice === lowestPrice && lowestPrice < Infinity;
                                const isChosenSplit = itemSplitAwards[item.id] === (resp.supplierId || resp.supplierName);

                                if (!offer || !offer.available) {
                                  return (
                                    <td key={resp.id} style={{ ...styles.td, textAlign: 'center', backgroundColor: '#f8fafc', color: '#94a3b8', fontSize: '0.78rem' }}>
                                      Sem Estoque
                                    </td>
                                  );
                                }

                                return (
                                  <td 
                                    key={resp.id} 
                                    onClick={() => {
                                      if (homologationMode === 'split') {
                                        setItemSplitAwards(prev => ({
                                          ...prev,
                                          [item.id]: resp.supplierId || resp.supplierName
                                        }));
                                      }
                                    }}
                                    style={{
                                      ...styles.td,
                                      textAlign: 'center',
                                      backgroundColor: isChosenSplit ? '#dcfce7' : isLowest ? '#f0fdf4' : '#fff',
                                      border: isChosenSplit ? '2px solid #16a34a' : '1px solid #e2e8f0',
                                      cursor: homologationMode === 'split' ? 'pointer' : 'default'
                                    }}
                                  >
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
                                      <strong style={{ fontSize: '0.9rem', color: isLowest ? '#15803d' : '#0f172a' }}>
                                        {offer.unitPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                      </strong>
                                      {isLowest && <span title="Menor Preço!">🏆</span>}
                                    </div>
                                    {offer.brand && (
                                      <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block', marginTop: '0.1rem' }}>
                                        Marca: {offer.brand}
                                      </span>
                                    )}
                                  </td>
                                );
                              })}
                            </tr>
                          );
                        })}

                        {/* Grand Totals Row */}
                        <tr style={{ backgroundColor: '#f8fafc', fontWeight: '800' }}>
                          <td style={{ ...styles.td, position: 'sticky', left: 0, backgroundColor: '#f8fafc', zIndex: 1 }} colSpan="3">
                            <span style={{ fontSize: '0.88rem', textTransform: 'uppercase' }}>Valor Total da Proposta</span>
                          </td>
                          {responses.map(resp => (
                            <td key={resp.id} style={{ ...styles.td, textAlign: 'center' }}>
                              <strong style={{ fontSize: '1.05rem', color: '#0284c7' }}>
                                {resp.totalGrandAmount?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                              </strong>
                              {resp.proposalDocUrl && (
                                <a 
                                  href={resp.proposalDocUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  style={{ display: 'block', fontSize: '0.72rem', color: '#0284c7', textDecoration: 'underline', marginTop: '0.2rem' }}
                                >
                                  📄 Ver PDF Proposta
                                </a>
                              )}
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Commercial Conditions Cards */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                    {responses.map(resp => (
                      <div key={resp.id} style={styles.conditionCard}>
                        <strong style={{ fontSize: '0.9rem', color: '#0369a1', display: 'block', marginBottom: '0.35rem' }}>
                          {resp.supplierName}
                        </strong>
                        <div style={{ fontSize: '0.78rem', color: '#334155', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                          <span>🚚 <strong>Frete:</strong> {resp.freightType} {resp.freightValue ? `(R$ ${resp.freightValue})` : '(Incluso)'}</span>
                          <span>💳 <strong>Pagamento:</strong> {resp.paymentTerm}</span>
                          <span>⏱️ <strong>Prazo Entrega:</strong> {resp.leadTimeDays} dias úteis</span>
                          <span>📅 <strong>Validade:</strong> {resp.proposalValidityDays} dias</span>
                          {resp.observations && (
                            <span style={{ fontStyle: 'italic', color: '#64748b', marginTop: '0.25rem', borderTop: '1px dashed #cbd5e1', paddingTop: '0.25rem' }}>
                              "{resp.observations}"
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

            </div>

            {/* Homologation Action Bar */}
            <div style={styles.modalFooter}>
              <button onClick={() => setShowComparisonModal(false)} style={styles.btnSecondary}>
                Fechar
              </button>
              {activeQuotation.status !== 'Homologada' && responses.length > 0 && (
                <button 
                  onClick={handleHomologateQuotation} 
                  disabled={actionLoading}
                  style={styles.btnSuccess}
                >
                  <Award size={16} />
                  <span>{actionLoading ? 'Homologando...' : 'Homologar e Fechar Cotação'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

const styles = {
  tabContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem'
  },
  topBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1rem',
    backgroundColor: '#fff',
    padding: '1rem 1.25rem',
    borderRadius: '10px',
    border: '1px solid var(--border-color)',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
  },
  searchWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    backgroundColor: '#f8fafc',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    padding: '0.4rem 0.75rem',
    minWidth: '280px'
  },
  searchInput: {
    border: 'none',
    outline: 'none',
    backgroundColor: 'transparent',
    fontSize: '0.82rem',
    width: '100%'
  },
  clearBtn: {
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    color: '#94a3b8',
    fontSize: '1.1rem'
  },
  filterWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    backgroundColor: '#f8fafc',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    padding: '0.4rem 0.75rem'
  },
  filterSelect: {
    border: 'none',
    outline: 'none',
    backgroundColor: 'transparent',
    fontSize: '0.82rem',
    color: '#334155',
    cursor: 'pointer'
  },
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
    gap: '1rem'
  },
  kpiCard: {
    backgroundColor: '#fff',
    padding: '1rem',
    borderRadius: '8px',
    border: '1px solid var(--border-color)',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
  },
  kpiLabel: {
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
    fontWeight: '700',
    textTransform: 'uppercase',
    display: 'block'
  },
  kpiValue: {
    fontSize: '1.5rem',
    fontWeight: '800',
    color: 'var(--text-primary)',
    display: 'block',
    marginTop: '0.25rem'
  },
  tableCard: {
    backgroundColor: '#fff',
    borderRadius: '10px',
    border: '1px solid var(--border-color)',
    overflowX: 'auto',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left'
  },
  theadRow: {
    backgroundColor: '#f8fafc',
    borderBottom: '1px solid var(--border-color)'
  },
  th: {
    padding: '0.75rem 1rem',
    fontSize: '0.75rem',
    fontWeight: '700',
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.02em'
  },
  trRow: {
    borderBottom: '1px solid #f1f5f9',
    transition: 'background-color 0.15s ease'
  },
  td: {
    padding: '0.75rem 1rem',
    fontSize: '0.85rem',
    verticalAlign: 'middle'
  },
  emptyTd: {
    textAlign: 'center',
    padding: '3rem 1rem',
    color: 'var(--text-secondary)'
  },
  unitBadge: {
    fontSize: '0.75rem',
    padding: '0.2rem 0.5rem',
    borderRadius: '4px',
    backgroundColor: '#f1f5f9',
    color: '#475569',
    fontWeight: '600'
  },
  statusBadge: {
    fontSize: '0.75rem',
    padding: '0.2rem 0.55rem',
    borderRadius: '6px',
    fontWeight: '700',
    textTransform: 'uppercase'
  },
  progressBarBg: {
    width: '70px',
    height: '6px',
    backgroundColor: '#e2e8f0',
    borderRadius: '3px',
    overflow: 'hidden'
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#16a34a',
    borderRadius: '3px'
  },
  btnPrimary: {
    backgroundColor: '#0891b2',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    padding: '0.5rem 1rem',
    fontWeight: '700',
    fontSize: '0.85rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    cursor: 'pointer'
  },
  btnSecondary: {
    backgroundColor: '#f1f5f9',
    color: '#475569',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    padding: '0.5rem 1rem',
    fontWeight: '700',
    fontSize: '0.85rem',
    cursor: 'pointer'
  },
  btnSuccess: {
    backgroundColor: '#16a34a',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    padding: '0.5rem 1.25rem',
    fontWeight: '800',
    fontSize: '0.85rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    cursor: 'pointer'
  },
  btnOutlineSecondary: {
    backgroundColor: '#fff',
    color: '#0369a1',
    border: '1px solid #bae6fd',
    borderRadius: '6px',
    padding: '0.35rem 0.75rem',
    fontWeight: '700',
    fontSize: '0.78rem',
    cursor: 'pointer'
  },
  btnWhatsApp: {
    backgroundColor: '#22c55e',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    padding: '0.35rem 0.65rem',
    fontWeight: '700',
    fontSize: '0.75rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    cursor: 'pointer'
  },
  actionBtnPrimary: {
    backgroundColor: '#e0f2fe',
    color: '#0284c7',
    border: '1px solid #bae6fd',
    borderRadius: '6px',
    padding: '0.35rem 0.65rem',
    fontWeight: '700',
    fontSize: '0.75rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    cursor: 'pointer'
  },
  actionBtnSecondary: {
    backgroundColor: '#f8fafc',
    color: '#475569',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    padding: '0.35rem 0.65rem',
    fontWeight: '700',
    fontSize: '0.75rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    cursor: 'pointer'
  },
  deleteIconBtn: {
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    padding: '0.25rem'
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
  modalContentLarge: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    width: '100%',
    maxWidth: '850px',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)'
  },
  modalContentMedium: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    width: '100%',
    maxWidth: '550px',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)'
  },
  modalContentFull: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    width: '100%',
    maxWidth: '1100px',
    maxHeight: '92vh',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)'
  },
  modalHeader: {
    padding: '1rem 1.25rem',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8fafc'
  },
  modalTitle: {
    margin: 0,
    fontSize: '1rem',
    fontWeight: '800',
    color: '#0f172a'
  },
  closeBtn: {
    border: 'none',
    backgroundColor: 'transparent',
    fontSize: '1.4rem',
    color: '#94a3b8',
    cursor: 'pointer',
    lineHeight: 1
  },
  modalFooter: {
    padding: '1rem 1.25rem',
    borderTop: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.75rem',
    backgroundColor: '#f8fafc'
  },
  formRow3: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: '0.75rem',
    marginBottom: '0.75rem'
  },
  formRow2: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '0.75rem',
    marginBottom: '0.75rem'
  },
  label: {
    fontSize: '0.75rem',
    fontWeight: '700',
    color: '#475569',
    marginBottom: '0.25rem',
    display: 'block'
  },
  input: {
    width: '100%',
    padding: '0.45rem 0.65rem',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    fontSize: '0.82rem',
    boxSizing: 'border-box'
  },
  select: {
    width: '100%',
    padding: '0.45rem 0.65rem',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    fontSize: '0.82rem',
    backgroundColor: '#fff',
    boxSizing: 'border-box'
  },
  sectionBox: {
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '0.85rem',
    marginBottom: '0.85rem'
  },
  supplierCheckCard: {
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    padding: '0.5rem 0.65rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    cursor: 'pointer',
    userSelect: 'none',
    transition: 'all 0.15s ease'
  },
  shareRowCard: {
    backgroundColor: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '0.75rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '0.75rem'
  },
  homologationBar: {
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '0.75rem 1rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1rem',
    marginBottom: '1rem'
  },
  matrixTable: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left'
  },
  matrixTheadRow: {
    backgroundColor: '#f8fafc',
    borderBottom: '2px solid #cbd5e1'
  },
  conditionCard: {
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '0.75rem 1rem'
  },
  spinner: {
    width: '32px',
    height: '32px',
    border: '3px solid #e2e8f0',
    borderTop: '3px solid #0891b2',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto'
  }
};
