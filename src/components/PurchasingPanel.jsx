import React, { useState, useEffect } from 'react';
import { 
  ClipboardList, CheckSquare, DollarSign, Truck, Plus, 
  Search, Building2, User, Clock, ArrowRight, ShieldAlert, Award
} from 'lucide-react';
import { dbService } from '../firebase';

export default function PurchasingPanel() {
  const [activeTab, setActiveTab] = useState('requests'); // 'requests' | 'approvals' | 'quotes' | 'products'
  const [purchases, setPurchases] = useState([]);
  const [stockItems, setStockItems] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Form State for Requesting
  const [requestForm, setRequestForm] = useState({
    type: 'Reposição', // 'Reposição' | 'Novo'
    selectedStockId: '',
    newItemName: '',
    quantity: 10,
    justification: '',
    sector: 'enfermagem'
  });

  // Form State for Quotes
  const [quoteForm, setQuoteForm] = useState({
    supplierA: { name: '', price: '', deliveryDays: '' },
    supplierB: { name: '', price: '', deliveryDays: '' },
    supplierC: { name: '', price: '', deliveryDays: '' }
  });
  const [activeQuoteId, setActiveQuoteId] = useState(null);

  useEffect(() => {
    // Resolve mock session user
    const sessionUserId = sessionStorage.getItem('sistema_indicadores_session');
    dbService.getUsers().then(users => {
      const found = users.find(u => u.uid === sessionUserId);
      if (found) {
        setCurrentUser(found);
      } else {
        // Fallback for mock environment
        setCurrentUser({ name: 'Administrador TechCosta', role: 'admin', email: 'contato@techcosta.net' });
      }
    });

    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [purList, itemsList] = await Promise.all([
        dbService.getPurchases(),
        dbService.getStockItems ? dbService.getStockItems() : []
      ]);
      
      // Seed fallback stock items if empty
      let finalItems = itemsList;
      if (itemsList.length === 0) {
        finalItems = [
          { id: 'itm-1', name: 'Soro Fisiológico 500ml', currentStock: 150, minStock: 200, category: 'Medicamento' },
          { id: 'itm-2', name: 'Luva de Procedimento (M)', currentStock: 500, minStock: 600, category: 'Material' },
          { id: 'itm-3', name: 'Álcool Gel 70% 1L', currentStock: 12, minStock: 20, category: 'Insumo' },
          { id: 'itm-4', name: 'Agulha Descansável 25x7', currentStock: 80, minStock: 150, category: 'Material' }
        ];
        setStockItems(finalItems);
      } else {
        setStockItems(itemsList);
      }

      setPurchases(purList);
    } catch (err) {
      console.error(err);
      showAlert('Erro ao carregar dados do portal de compras.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 5000);
  };

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    let name = requestForm.newItemName;
    if (requestForm.type === 'Reposição') {
      const selected = stockItems.find(itm => itm.id === requestForm.selectedStockId);
      if (!selected) return showAlert('Selecione um produto do estoque.', 'danger');
      name = selected.name;
    }

    if (!name) return showAlert('Informe o nome do item.', 'danger');

    const newRequest = {
      type: requestForm.type,
      productId: requestForm.selectedStockId || 'novo-item',
      productName: name,
      quantity: parseInt(requestForm.quantity) || 1,
      justification: requestForm.justification,
      sector: requestForm.sector,
      requesterName: currentUser?.name || 'Funcionário',
      requesterEmail: currentUser?.email || 'funcionario@clinica.com',
      status: 'Aguardando Gestor',
      history: [
        { status: 'Aguardando Gestor', date: new Date().toISOString(), message: 'Solicitação de compra criada.' }
      ]
    };

    try {
      await dbService.createPurchase(newRequest);
      showAlert('Solicitação de compra enviada para aprovação do gestor!', 'success');
      setRequestForm({
        type: 'Reposição',
        selectedStockId: '',
        newItemName: '',
        quantity: 10,
        justification: '',
        sector: 'enfermagem'
      });
      fetchData();
    } catch (err) {
      console.error(err);
      showAlert('Erro ao criar solicitação.', 'danger');
    }
  };

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
      fetchData();
    } catch (err) {
      console.error(err);
      showAlert('Erro ao processar aprovação.', 'danger');
    }
  };

  const handleApproveDirector = async (req, approve = true) => {
    const updatedHistory = [
      ...req.history,
      { 
        status: approve ? 'Aguardando Cotação' : 'Recusado pelo Diretor', 
        date: new Date().toISOString(), 
        message: approve ? 'Verba aprovada pelo Diretor Clínico.' : 'Recusado pelo Diretor Clínico.' 
      }
    ];

    try {
      await dbService.updatePurchase(req.id, {
        status: approve ? 'Aguardando Cotação' : 'Recusado pelo Diretor',
        history: updatedHistory
      });
      showAlert(approve ? 'Verba aprovada! Enviado ao setor de compras.' : 'Compra recusada pela diretoria.', 'success');
      fetchData();
    } catch (err) {
      console.error(err);
      showAlert('Erro ao processar aprovação da diretoria.', 'danger');
    }
  };

  const calculateQuoteWinner = () => {
    const { supplierA, supplierB, supplierC } = quoteForm;
    
    const validQuotes = [
      { id: 'A', ...supplierA },
      { id: 'B', ...supplierB },
      { id: 'C', ...supplierC }
    ].filter(q => q.name && q.price && q.deliveryDays);

    if (validQuotes.length === 0) return { bestPrice: null, bestTime: null };

    // Find Best Price
    let bestPrice = validQuotes[0];
    validQuotes.forEach(q => {
      if (parseFloat(q.price) < parseFloat(bestPrice.price)) {
        bestPrice = q;
      }
    });

    // Find Best Delivery Days
    let bestTime = validQuotes[0];
    validQuotes.forEach(q => {
      if (parseInt(q.deliveryDays) < parseInt(bestTime.deliveryDays)) {
        bestTime = q;
      }
    });

    return { bestPrice, bestTime };
  };

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

    try {
      // 1. Update purchase state to Completed
      await dbService.updatePurchase(req.id, {
        status: 'Finalizado',
        quotes: { supplierA, supplierB, supplierC },
        selectedSupplier: selectedSupplierId,
        history: updatedHistory
      });

      // 2. Automate Entry inside stock system
      if (dbService.createStockTransaction) {
        await dbService.createStockTransaction({
          itemId: req.productId,
          itemName: req.productName,
          quantity: req.quantity,
          type: 'Entrada',
          batch: 'NEXAPROCURE-' + Math.random().toString(36).substr(2, 5).toUpperCase(),
          expiryDate: new Date(Date.now() + 365*24*60*60*1000).toISOString().substring(0, 10), // Default 1 year validity
          operator: currentUser?.name || 'Compras',
          notes: `Entrada automática via NexaPROCURE. Fornecedor: ${selectedSupplier.name}`
        });
      }

      showAlert('Compra finalizada e estoque atualizado com sucesso!', 'success');
      setActiveQuoteId(null);
      setQuoteForm({
        supplierA: { name: '', price: '', deliveryDays: '' },
        supplierB: { name: '', price: '', deliveryDays: '' },
        supplierC: { name: '', price: '', deliveryDays: '' }
      });
      fetchData();
    } catch (err) {
      console.error(err);
      showAlert('Erro ao finalizar compra.', 'danger');
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'Aguardando Gestor': return { bg: '#fef3c7', text: '#d97706' };
      case 'Aguardando Diretor': return { bg: '#e0f2fe', text: '#0369a1' };
      case 'Aguardando Cotação': return { bg: '#ede9fe', text: '#6d28d9' };
      case 'Finalizado': return { bg: '#d1fae5', text: '#065f46' };
      case 'Recusado pelo Gestor':
      case 'Recusado pelo Diretor': return { bg: '#fee2e2', text: '#991b1b' };
      default: return { bg: '#f1f5f9', text: '#475569' };
    }
  };

  const { bestPrice, bestTime } = calculateQuoteWinner();

  return (
    <div style={styles.container}>
      <div style={styles.cardHeader}>
        <div>
          <h1 style={styles.title}>NexaPROCURE - Portal de Compras & Suprimentos</h1>
          <p style={styles.subtitle}>Gestão de requisições de mercadorias, fluxo de cotações com múltiplos orçamentos e auditoria de alçada de despesa.</p>
        </div>
      </div>

      {/* Tabs Menu */}
      <div style={styles.tabsWrapper}>
        <button onClick={() => setActiveTab('requests')} style={{ ...styles.tabBtn, ...(activeTab === 'requests' ? styles.tabBtnActive : {}) }}>
          <ClipboardList size={16} /> Minhas Solicitações
        </button>
        {(currentUser?.role === 'admin' || currentUser?.role === 'professional') && (
          <button onClick={() => setActiveTab('approvals')} style={{ ...styles.tabBtn, ...(activeTab === 'approvals' ? styles.tabBtnActive : {}) }}>
            <CheckSquare size={16} /> Central de Aprovações
          </button>
        )}
        {(currentUser?.role === 'admin' || currentUser?.role === 'rh') && (
          <button onClick={() => setActiveTab('quotes')} style={{ ...styles.tabBtn, ...(activeTab === 'quotes' ? styles.tabBtnActive : {}) }}>
            <Building2 size={16} /> Sala de Cotações (Comprador)
          </button>
        )}
      </div>

      {message.text && (
        <div style={{ ...styles.alert, backgroundColor: `var(--${message.type}-light)`, border: `1px solid var(--${message.type}-color)` }}>
          <ShieldAlert size={18} color={`var(--${message.type}-color)`} />
          <span style={{ color: `var(--${message.type}-color)`, fontWeight: '600' }}>{message.text}</span>
        </div>
      )}

      {loading ? (
        <div style={styles.loadingBox}>Carregando portal de suprimentos...</div>
      ) : (
        <>
          {/* TAB 1: Minhas Solicitações (Funcionários) */}
          {activeTab === 'requests' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '1.5rem' }}>
              {/* Form Request */}
              <div style={styles.formCard}>
                <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--text-color)' }}>➕ Solicitar Novo Suprimento</h3>
                <form onSubmit={handleCreateRequest} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label>Tipo de Solicitação</label>
                    <select className="form-control" value={requestForm.type} onChange={e => setRequestForm({ ...requestForm, type: e.target.value })}>
                      <option value="Reposição">Reposição de Estoque</option>
                      <option value="Novo">Produto Novo (Cadastrar)</option>
                    </select>
                  </div>

                  {requestForm.type === 'Reposição' ? (
                    <div className="form-group">
                      <label>Item do Estoque *</label>
                      <select className="form-control" value={requestForm.selectedStockId} onChange={e => setRequestForm({ ...requestForm, selectedStockId: e.target.value })}>
                        <option value="">-- Selecione do Estoque --</option>
                        {stockItems.map(itm => (
                          <option key={itm.id} value={itm.id}>{itm.name} (Saldo: {itm.currentStock})</option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div className="form-group">
                      <label>Nome do Novo Produto *</label>
                      <input type="text" className="form-control" placeholder="Ex: Seringa Insulina BD 1ml" value={requestForm.newItemName} onChange={e => setRequestForm({ ...requestForm, newItemName: e.target.value })} />
                    </div>
                  )}

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div className="form-group">
                      <label>Quantidade *</label>
                      <input type="number" className="form-control" min="1" value={requestForm.quantity} onChange={e => setRequestForm({ ...requestForm, quantity: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label>Setor Destino</label>
                      <select className="form-control" value={requestForm.sector} onChange={e => setRequestForm({ ...requestForm, sector: e.target.value })}>
                        <option value="enfermagem">Enfermagem</option>
                        <option value="medica">Clínica Médica</option>
                        <option value="recepcao">Recepção</option>
                        <option value="nutricao">Nutrição</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Justificativa do Pedido *</label>
                    <textarea className="form-control" rows="2" placeholder="Urgência médica, estoque abaixo do mínimo..." value={requestForm.justification} onChange={e => setRequestForm({ ...requestForm, justification: e.target.value })}></textarea>
                  </div>

                  <button type="submit" className="btn btn-primary" style={{ backgroundColor: 'var(--primary-color)', marginTop: '0.5rem' }}>
                    Enviar Solicitação
                  </button>
                </form>
              </div>

              {/* Status List */}
              <div style={styles.listCard}>
                <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--text-color)' }}>📋 Acompanhamento de Pedidos</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '420px', overflowY: 'auto' }}>
                  {purchases.length === 0 ? (
                    <p style={styles.noDataText}>Nenhuma requisição criada ainda.</p>
                  ) : (
                    purchases.map(req => {
                      const badge = getStatusBadgeColor(req.status);
                      return (
                        <div key={req.id} style={styles.purchaseItem}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                              <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{req.productName}</strong>
                              <span style={{ fontSize: '0.75rem', display: 'block', color: 'var(--text-secondary)' }}>
                                Qtd: {req.quantity} | Solicitado por: {req.requesterName} ({req.sector.toUpperCase()})
                              </span>
                            </div>
                            <span style={{ ...styles.statusBadge, backgroundColor: badge.bg, color: badge.text }}>
                              {req.status}
                            </span>
                          </div>

                          {/* Stepper timeline */}
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
                                      backgroundColor: isDone ? 'var(--success-color)' : '#e2e8f0',
                                      color: isDone ? '#fff' : '#94a3b8'
                                    }}>
                                      {idx + 1}
                                    </div>
                                    <span style={{ fontSize: '0.6rem', color: isDone ? 'var(--success-color)' : 'var(--text-muted)', fontWeight: '600', marginTop: '0.2rem' }}>
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
            </div>
          )}

          {/* TAB 2: Central de Aprovações (Gestores e Diretores) */}
          {activeTab === 'approvals' && (
            <div style={styles.listCard}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1.25rem', color: 'var(--text-color)' }}>
                🔑 Alçadas e Aprovações Pendentes
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
                            padding: '0.1rem 0.4rem', 
                            borderRadius: '4px', 
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
                            Quantidade: <strong>{req.quantity}</strong> | Setor: <strong>{req.sector.toUpperCase()}</strong> | Solicitante: {req.requesterName}
                          </div>
                          {req.justification && (
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '0.25rem', paddingLeft: '0.5rem', borderLeft: '2px solid var(--border-color)' }}>
                              "{req.justification}"
                            </div>
                          )}
                        </div>

                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          {isManagerLevel ? (
                            <>
                              <button onClick={() => handleApproveManager(req, false)} className="btn btn-secondary" style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}>Recusar</button>
                              <button onClick={() => handleApproveManager(req, true)} className="btn btn-primary" style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem', backgroundColor: '#ec4899' }}>Aprovar Produto</button>
                            </>
                          ) : (
                            <>
                              <button onClick={() => handleApproveDirector(req, false)} className="btn btn-secondary" style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}>Recusar Verba</button>
                              <button onClick={() => handleApproveDirector(req, true)} className="btn btn-primary" style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem', backgroundColor: 'var(--success-color)' }}>Autorizar Verba</button>
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

          {/* TAB 3: Sala de Cotações (Compradores) */}
          {activeTab === 'quotes' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '1.5rem' }}>
              {/* Approved requests needing quote */}
              <div style={styles.listCard}>
                <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '1rem' }}>📦 Aguardando Orçamentos</h3>
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
                          borderLeftColor: activeQuoteId === req.id ? 'var(--primary-color)' : 'var(--border-color)',
                          backgroundColor: activeQuoteId === req.id ? 'rgba(8, 145, 178, 0.03)' : 'var(--bg-card)'
                        }}
                      >
                        <strong>{req.productName}</strong>
                        <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          Qtd: {req.quantity} | Setor: {req.sector.toUpperCase()}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Quotes Entry Form */}
              <div style={styles.formCard}>
                {activeQuoteId ? (
                  (() => {
                    const currentReq = purchases.find(p => p.id === activeQuoteId);
                    return (
                      <div>
                        <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                          📊 Comparar 3 Orçamentos - {currentReq?.productName} (Qtd: {currentReq?.quantity})
                        </h3>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
                          {/* Supplier A */}
                          <div style={styles.supplierBlock}>
                            <h4 style={{ fontSize: '0.8rem', fontWeight: '700', marginBottom: '0.5rem', color: 'var(--primary-color)' }}>Fornecedor A</h4>
                            <div className="form-group" style={{ marginBottom: '0.5rem' }}>
                              <label style={{ fontSize: '0.7rem' }}>Nome Empresa</label>
                              <input type="text" className="form-control" style={{ fontSize: '0.75rem', padding: '0.25rem' }} value={quoteForm.supplierA.name} onChange={e => setQuoteForm({ ...quoteForm, supplierA: { ...quoteForm.supplierA, name: e.target.value } })} />
                            </div>
                            <div className="form-group" style={{ marginBottom: '0.5rem' }}>
                              <label style={{ fontSize: '0.7rem' }}>Preço Unitário (R$)</label>
                              <input type="number" className="form-control" style={{ fontSize: '0.75rem', padding: '0.25rem' }} value={quoteForm.supplierA.price} onChange={e => setQuoteForm({ ...quoteForm, supplierA: { ...quoteForm.supplierA, price: e.target.value } })} />
                            </div>
                            <div className="form-group" style={{ marginBottom: '0.5rem' }}>
                              <label style={{ fontSize: '0.7rem' }}>Entrega (Dias)</label>
                              <input type="number" className="form-control" style={{ fontSize: '0.75rem', padding: '0.25rem' }} value={quoteForm.supplierA.deliveryDays} onChange={e => setQuoteForm({ ...quoteForm, supplierA: { ...quoteForm.supplierA, deliveryDays: e.target.value } })} />
                            </div>
                          </div>

                          {/* Supplier B */}
                          <div style={styles.supplierBlock}>
                            <h4 style={{ fontSize: '0.8rem', fontWeight: '700', marginBottom: '0.5rem', color: '#10b981' }}>Fornecedor B</h4>
                            <div className="form-group" style={{ marginBottom: '0.5rem' }}>
                              <label style={{ fontSize: '0.7rem' }}>Nome Empresa</label>
                              <input type="text" className="form-control" style={{ fontSize: '0.75rem', padding: '0.25rem' }} value={quoteForm.supplierB.name} onChange={e => setQuoteForm({ ...quoteForm, supplierB: { ...quoteForm.supplierB, name: e.target.value } })} />
                            </div>
                            <div className="form-group" style={{ marginBottom: '0.5rem' }}>
                              <label style={{ fontSize: '0.7rem' }}>Preço Unitário (R$)</label>
                              <input type="number" className="form-control" style={{ fontSize: '0.75rem', padding: '0.25rem' }} value={quoteForm.supplierB.price} onChange={e => setQuoteForm({ ...quoteForm, supplierB: { ...quoteForm.supplierB, price: e.target.value } })} />
                            </div>
                            <div className="form-group" style={{ marginBottom: '0.5rem' }}>
                              <label style={{ fontSize: '0.7rem' }}>Entrega (Dias)</label>
                              <input type="number" className="form-control" style={{ fontSize: '0.75rem', padding: '0.25rem' }} value={quoteForm.supplierB.deliveryDays} onChange={e => setQuoteForm({ ...quoteForm, supplierB: { ...quoteForm.supplierB, deliveryDays: e.target.value } })} />
                            </div>
                          </div>

                          {/* Supplier C */}
                          <div style={styles.supplierBlock}>
                            <h4 style={{ fontSize: '0.8rem', fontWeight: '700', marginBottom: '0.5rem', color: '#8b5cf6' }}>Fornecedor C</h4>
                            <div className="form-group" style={{ marginBottom: '0.5rem' }}>
                              <label style={{ fontSize: '0.7rem' }}>Nome Empresa</label>
                              <input type="text" className="form-control" style={{ fontSize: '0.75rem', padding: '0.25rem' }} value={quoteForm.supplierC.name} onChange={e => setQuoteForm({ ...quoteForm, supplierC: { ...quoteForm.supplierC, name: e.target.value } })} />
                            </div>
                            <div className="form-group" style={{ marginBottom: '0.5rem' }}>
                              <label style={{ fontSize: '0.7rem' }}>Preço Unitário (R$)</label>
                              <input type="number" className="form-control" style={{ fontSize: '0.75rem', padding: '0.25rem' }} value={quoteForm.supplierC.price} onChange={e => setQuoteForm({ ...quoteForm, supplierC: { ...quoteForm.supplierC, price: e.target.value } })} />
                            </div>
                            <div className="form-group" style={{ marginBottom: '0.5rem' }}>
                              <label style={{ fontSize: '0.7rem' }}>Entrega (Dias)</label>
                              <input type="number" className="form-control" style={{ fontSize: '0.75rem', padding: '0.25rem' }} value={quoteForm.supplierC.deliveryDays} onChange={e => setQuoteForm({ ...quoteForm, supplierC: { ...quoteForm.supplierC, deliveryDays: e.target.value } })} />
                            </div>
                          </div>
                        </div>

                        {/* Winners Display */}
                        {bestPrice && (
                          <div style={styles.metricsWrapper}>
                            {bestPrice.name && (
                              <div style={styles.metricItem}>
                                <Award size={18} color="var(--success-color)" />
                                <div>
                                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Melhor Preço 💰</div>
                                  <strong>{bestPrice.name} (R$ {parseFloat(bestPrice.price).toFixed(2)})</strong>
                                </div>
                              </div>
                            )}
                            {bestTime.name && (
                              <div style={styles.metricItem}>
                                <Truck size={18} color="var(--primary-color)" />
                                <div>
                                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Entrega Mais Rápida ⚡</div>
                                  <strong>{bestTime.name} ({bestTime.deliveryDays} dias)</strong>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Order confirmation actions */}
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                          <button onClick={() => handleFinalizePurchase(currentReq, 'A')} disabled={!quoteForm.supplierA.name} className="btn btn-primary" style={{ backgroundColor: 'var(--primary-color)', fontSize: '0.75rem' }}>Comprar do A</button>
                          <button onClick={() => handleFinalizePurchase(currentReq, 'B')} disabled={!quoteForm.supplierB.name} className="btn btn-primary" style={{ backgroundColor: '#10b981', fontSize: '0.75rem' }}>Comprar do B</button>
                          <button onClick={() => handleFinalizePurchase(currentReq, 'C')} disabled={!quoteForm.supplierC.name} className="btn btn-primary" style={{ backgroundColor: '#8b5cf6', fontSize: '0.75rem' }}>Comprar do C</button>
                        </div>
                      </div>
                    );
                  })()
                ) : (
                  <p style={{ ...styles.noDataText, textAlign: 'center', margin: '4rem 0' }}>Selecione um item na lista de solicitações aprovadas para iniciar os orçamentos.</p>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: '800',
    color: 'var(--text-color)',
    margin: 0,
  },
  subtitle: {
    fontSize: '0.875rem',
    color: 'var(--text-muted)',
    margin: '0.25rem 0 0 0',
  },
  tabsWrapper: {
    display: 'flex',
    gap: '0.25rem',
    borderBottom: '2px solid var(--border-color)',
    paddingBottom: '2px',
    flexWrap: 'wrap',
  },
  tabBtn: {
    background: 'none',
    border: 'none',
    padding: '0.75rem 1.25rem',
    fontSize: '0.875rem',
    fontWeight: '600',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    borderBottom: '2px solid transparent',
    marginBottom: '-2px',
    transition: 'all 0.15s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  tabBtnActive: {
    color: 'var(--primary-color)',
    borderBottomColor: 'var(--primary-color)',
  },
  alert: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '1rem',
    borderRadius: 'var(--border-radius-sm)',
    fontSize: '0.9rem',
  },
  loadingBox: {
    textAlign: 'center',
    padding: '3rem',
    fontSize: '0.9rem',
    color: 'var(--text-muted)',
  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    border: '1px solid var(--border-color)',
    padding: '1.5rem',
    boxShadow: 'var(--shadow-sm)',
  },
  listCard: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    border: '1px solid var(--border-color)',
    padding: '1.5rem',
    boxShadow: 'var(--shadow-sm)',
  },
  noDataText: {
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
    fontStyle: 'italic',
  },
  purchaseItem: {
    padding: '1rem',
    borderRadius: '8px',
    backgroundColor: 'var(--bg-body)',
    border: '1px solid var(--border-color)',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  statusBadge: {
    fontSize: '0.7rem',
    fontWeight: '700',
    padding: '0.2rem 0.5rem',
    borderRadius: '12px',
  },
  timelineWrapper: {
    position: 'relative',
    marginTop: '0.5rem',
    padding: '0 0.5rem',
  },
  timelineTrack: {
    position: 'absolute',
    top: '12px',
    left: '1.5rem',
    right: '1.5rem',
    height: '2px',
    backgroundColor: '#e2e8f0',
    zIndex: 1,
  },
  timelineNode: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.7rem',
    fontWeight: '700',
    zIndex: 2,
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
  },
  approvalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem',
    borderRadius: '8px',
    backgroundColor: 'var(--bg-body)',
    border: '1px solid var(--border-color)',
    gap: '1rem',
  },
  quoteSelectableItem: {
    padding: '0.75rem',
    borderRadius: '6px',
    borderLeft: '4px solid transparent',
    border: '1px solid var(--border-color)',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  supplierBlock: {
    padding: '0.75rem',
    borderRadius: '6px',
    backgroundColor: 'var(--bg-body)',
    border: '1px solid var(--border-color)',
  },
  metricsWrapper: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
    backgroundColor: '#f8fafc',
    padding: '0.75rem',
    borderRadius: '6px',
    border: '1px solid var(--border-color)',
    marginBottom: '1rem',
  },
  metricItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.8rem',
  }
};
