import React, { useState, useEffect } from 'react';
import { dbService } from '../firebase';
import { 
  ClipboardList, Plus, Search, Filter, X, FileText, CheckCircle2, 
  AlertTriangle, Clock, Trash2, Edit, AlertCircle, User, Package, 
  Send, ChevronRight, Eye, RefreshCw
} from 'lucide-react';

export default function TechnicianPanel({ currentUser }) {
  const [requisitions, setRequisitions] = useState([]);
  const [patients, setPatients] = useState([]);
  const [stockItems, setStockItems] = useState([]);
  const [tenantSettings, setTenantSettings] = useState({ blockRequisitionZeroStock: false });
  
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingReq, setEditingReq] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedReqDetail, setSelectedReqDetail] = useState(null);

  // Form State
  const [patientId, setPatientId] = useState('');
  const [patientName, setPatientName] = useState('');
  const [isGeneralUse, setIsGeneralUse] = useState(true);
  const [notes, setNotes] = useState('');

  // Items drafting in form
  const [selectedItemId, setSelectedItemId] = useState('');
  const [requestedQty, setRequestedQty] = useState('1');
  const [reqItemsList, setReqItemsList] = useState([]);
  const [itemStockAlert, setItemStockAlert] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [reqList, patList, itemList, settings] = await Promise.all([
        dbService.getMaterialRequisitions ? dbService.getMaterialRequisitions() : [],
        dbService.getPatients ? dbService.getPatients() : [],
        dbService.getInventoryItems ? dbService.getInventoryItems() : [],
        dbService.getTenantSettings ? dbService.getTenantSettings() : {}
      ]);

      setRequisitions(reqList || []);
      setPatients(patList || []);
      setStockItems(itemList || []);
      setTenantSettings(settings || {});
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
    setIsGeneralUse(true);
    setNotes('');
    setReqItemsList([]);
    setSelectedItemId(stockItems.length > 0 ? stockItems[0].id : '');
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
    setNotes(req.notes || '');
    setReqItemsList(req.items ? [...req.items] : []);
    setSelectedItemId(stockItems.length > 0 ? stockItems[0].id : '');
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

  const handleAddItemToReq = () => {
    if (!selectedItemId) {
      showAlert('Selecione um item do estoque.', 'warning');
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
        setItemStockAlert(`O item "${itemObj.name}" está com estoque ZERADO. A trava de T.I. impede a solicitação.`);
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
      setReqItemsList(updatedList);
    } else {
      setReqItemsList([...reqItemsList, {
        itemId: itemObj.id,
        itemName: itemObj.name,
        unit: itemObj.unit || 'unidades',
        requestedQuantity: qtyNum,
        deliveredQuantity: 0
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
      showAlert('Adicione pelo menos um item à requisição.', 'warning');
      return;
    }

    setActionLoading(true);
    try {
      const operatorName = currentUser?.name || currentUser?.email || 'Técnica de Enfermagem';
      
      const reqPayload = {
        id: editingReq ? editingReq.id : undefined,
        requisitionCode: editingReq ? editingReq.requisitionCode : undefined,
        requestedBy: operatorName,
        userId: currentUser?.uid || 'user-tech',
        patientId: isGeneralUse ? null : patientId,
        patientName: isGeneralUse ? 'Uso Geral (Salão)' : patientName,
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
        showAlert(`Requisição ${savedReq.requisitionCode} enviada à farmácia com sucesso!`, 'success');
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

  // Filtered List
  const filteredRequisitions = requisitions.filter(r => {
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      !searchTerm ||
      (r.requisitionCode && r.requisitionCode.toLowerCase().includes(searchLower)) ||
      (r.patientName && r.patientName.toLowerCase().includes(searchLower)) ||
      (r.requestedBy && r.requestedBy.toLowerCase().includes(searchLower)) ||
      (r.items && r.items.some(i => i.itemName.toLowerCase().includes(searchLower)));
    
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pendente':
        return <span style={{ ...styles.badge, backgroundColor: '#fef3c7', color: '#b45309', border: '1px solid #fde68a' }}><Clock size={12} /> Pendente</span>;
      case 'Parcial':
        return <span style={{ ...styles.badge, backgroundColor: '#ffedd5', color: '#c2410c', border: '1px solid #fed7aa' }}><AlertTriangle size={12} /> Parcial</span>;
      case 'Entregue':
        return <span style={{ ...styles.badge, backgroundColor: '#d1fae5', color: '#047857', border: '1px solid #a7f3d0' }}><CheckCircle2 size={12} /> Entregue</span>;
      case 'Cancelado':
        return <span style={{ ...styles.badge, backgroundColor: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5' }}><X size={12} /> Cancelado</span>;
      default:
        return <span style={styles.badge}>{status}</span>;
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <div style={styles.badgePortal}>
            <ClipboardList size={14} color="#0d9488" /> Portal de Requisições do Salão
          </div>
          <h1 style={styles.title}>Requisição de Insumos & Medicamentos</h1>
          <p style={styles.subtitle}>
            Solicitações diretas da hemodiálise para a farmácia/estoque central com rastreabilidade assistencial.
          </p>
        </div>
        <div style={styles.headerActions}>
          <button style={styles.btnRefresh} onClick={fetchData} title="Atualizar dados">
            <RefreshCw size={16} className={loading ? 'spin' : ''} />
          </button>
          <button style={styles.btnPrimary} onClick={handleOpenCreateModal}>
            <Plus size={18} /> Nova Requisição
          </button>
        </div>
      </div>

      {/* Alert Messages */}
      {message.text && (
        <div style={{
          ...styles.alert,
          backgroundColor: message.type === 'danger' ? '#fee2e2' : message.type === 'warning' ? '#fef3c7' : '#d1fae5',
          color: message.type === 'danger' ? '#991b1b' : message.type === 'warning' ? '#92400e' : '#065f46',
          borderLeft: `4px solid ${message.type === 'danger' ? '#ef4444' : message.type === 'warning' ? '#f59e0b' : '#10b981'}`
        }}>
          {message.text}
        </div>
      )}

      {/* Stats KPI */}
      <div style={styles.kpiGrid}>
        <div style={styles.kpiCard}>
          <div style={styles.kpiHeader}>
            <span style={styles.kpiTitle}>Total de Pedidos</span>
            <Package size={20} color="#6b7280" />
          </div>
          <div style={styles.kpiValue}>{totalCount}</div>
          <div style={styles.kpiSub}>Histórico total de requisições</div>
        </div>

        <div style={{ ...styles.kpiCard, borderTop: '4px solid #f59e0b' }}>
          <div style={styles.kpiHeader}>
            <span style={styles.kpiTitle}>Pendentes</span>
            <Clock size={20} color="#f59e0b" />
          </div>
          <div style={{ ...styles.kpiValue, color: '#d97706' }}>{pendingCount}</div>
          <div style={styles.kpiSub}>Aguardando separação na farmácia</div>
        </div>

        <div style={{ ...styles.kpiCard, borderTop: '4px solid #ea580c' }}>
          <div style={styles.kpiHeader}>
            <span style={styles.kpiTitle}>Entregas Parciais</span>
            <AlertTriangle size={20} color="#ea580c" />
          </div>
          <div style={{ ...styles.kpiValue, color: '#ea580c' }}>{partialCount}</div>
          <div style={styles.kpiSub}>Entregues parcialmente</div>
        </div>

        <div style={{ ...styles.kpiCard, borderTop: '4px solid #10b981' }}>
          <div style={styles.kpiHeader}>
            <span style={styles.kpiTitle}>Atendidos / Entregues</span>
            <CheckCircle2 size={20} color="#10b981" />
          </div>
          <div style={{ ...styles.kpiValue, color: '#059669' }}>{deliveredCount}</div>
          <div style={styles.kpiSub}>Concluídos com sucesso</div>
        </div>
      </div>

      {/* Filters bar */}
      <div style={styles.filterCard}>
        <div style={styles.searchBox}>
          <Search size={18} color="#9ca3af" />
          <input 
            type="text" 
            placeholder="Buscar por Código, Paciente, Item ou Solicitante..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            style={styles.searchInput}
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} style={styles.btnClearSearch}>
              <X size={14} />
            </button>
          )}
        </div>

        <div style={styles.filterGroup}>
          <Filter size={16} color="#6b7280" />
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            style={styles.selectFilter}
          >
            <option value="all">Todos os Status</option>
            <option value="Pendente">Pendentes</option>
            <option value="Parcial">Parciais</option>
            <option value="Entregue">Entregues</option>
            <option value="Cancelado">Cancelados</option>
          </select>
        </div>
      </div>

      {/* Table / List */}
      <div style={styles.tableCard}>
        {loading ? (
          <div style={styles.loadingBox}>
            <RefreshCw size={24} className="spin" color="var(--primary-color)" />
            <span>Carregando requisições...</span>
          </div>
        ) : filteredRequisitions.length === 0 ? (
          <div style={styles.emptyBox}>
            <ClipboardList size={40} color="#9ca3af" />
            <p style={{ fontWeight: '600', color: 'var(--text-color)', marginTop: '0.75rem' }}>Nenhuma requisição encontrada</p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {searchTerm || statusFilter !== 'all' ? 'Tente ajustar seus filtros de busca.' : 'Clique em "Nova Requisição" para solicitar materiais à farmácia.'}
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Código</th>
                  <th style={styles.th}>Data / Hora</th>
                  <th style={styles.th}>Paciente / Destino</th>
                  <th style={styles.th}>Itens Solicitados</th>
                  <th style={styles.th}>Solicitante</th>
                  <th style={styles.th}>Status</th>
                  <th style={{ ...styles.th, textAlign: 'right' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequisitions.map((req) => (
                  <tr key={req.id} style={styles.tr}>
                    <td style={{ ...styles.td, fontWeight: '700', color: 'var(--primary-color)' }}>
                      {req.requisitionCode}
                    </td>
                    <td style={styles.td}>
                      <span style={{ fontSize: '0.825rem', color: 'var(--text-color)' }}>
                        {new Date(req.createdAt).toLocaleDateString('pt-BR')}
                      </span>
                      <br />
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {new Date(req.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <User size={14} color="#6b7280" />
                        <span style={{ fontWeight: '600', fontSize: '0.875rem' }}>{req.patientName || 'Uso Geral'}</span>
                      </div>
                    </td>
                    <td style={styles.td}>
                      <div style={{ fontSize: '0.825rem' }}>
                        {req.items && req.items.length > 0 ? (
                          <>
                            <div>
                              <strong>{req.items[0].itemName}</strong> ({req.items[0].requestedQuantity} {req.items[0].unit})
                            </div>
                            {req.items.length > 1 && (
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                + mais {req.items.length - 1} item(ns)
                              </span>
                            )}
                          </>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>Sem itens</span>
                        )}
                      </div>
                    </td>
                    <td style={{ ...styles.td, fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                      {req.requestedBy}
                    </td>
                    <td style={styles.td}>
                      {getStatusBadge(req.status)}
                    </td>
                    <td style={{ ...styles.td, textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.35rem' }}>
                        <button 
                          style={styles.btnActionView} 
                          onClick={() => { setSelectedReqDetail(req); setShowDetailModal(true); }}
                          title="Ver Detalhes Completo"
                        >
                          <Eye size={14} />
                        </button>
                        
                        {req.status === 'Pendente' && (
                          <>
                            <button 
                              style={styles.btnActionEdit} 
                              onClick={() => handleOpenEditModal(req)}
                              title="Editar Requisição"
                            >
                              <Edit size={14} />
                            </button>
                            <button 
                              style={styles.btnActionDelete} 
                              onClick={() => handleDeleteRequisition(req)}
                              title="Excluir Requisição"
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
      </div>

      {/* Modal Nova / Editar Requisição */}
      {showModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>
                {editingReq ? `Editar Requisição (${editingReq.requisitionCode})` : 'Nova Requisição de Insumos (Salão)'}
              </h2>
              <button style={styles.btnClose} onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitRequisition} style={styles.modalForm}>
              {/* Paciente selection */}
              <div style={styles.formGroup}>
                <label style={styles.label}>Destino / Paciente da Hemodiálise:</label>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                    <input 
                      type="radio" 
                      name="destType" 
                      checked={isGeneralUse} 
                      onChange={() => { setIsGeneralUse(true); setPatientId(''); setPatientName(''); }} 
                    />
                    Uso Geral do Salão / Bancada
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                    <input 
                      type="radio" 
                      name="destType" 
                      checked={!isGeneralUse} 
                      onChange={() => setIsGeneralUse(false)} 
                    />
                    Vincular a Paciente Específico
                  </label>
                </div>

                {!isGeneralUse && (
                  <select 
                    value={patientId} 
                    onChange={handlePatientSelect}
                    style={styles.input}
                    required={!isGeneralUse}
                  >
                    <option value="">-- Selecione o Paciente --</option>
                    {patients.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} {p.shift ? `(${p.shift} - ${p.room || 'Salão'})` : ''}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Items draft area */}
              <div style={styles.itemsSection}>
                <h3 style={styles.itemsSectionTitle}>Selecionar Itens do Estoque</h3>
                
                {itemStockAlert && (
                  <div style={styles.stockAlertBox}>
                    <AlertCircle size={16} /> {itemStockAlert}
                  </div>
                )}

                <div style={styles.addItemGrid}>
                  <div style={{ flex: 1 }}>
                    <label style={{ ...styles.label, fontSize: '0.8rem' }}>Material / Medicamento:</label>
                    <select 
                      value={selectedItemId} 
                      onChange={(e) => { setSelectedItemId(e.target.value); setItemStockAlert(''); }}
                      style={styles.input}
                    >
                      {stockItems.map(item => (
                        <option key={item.id} value={item.id}>
                          {item.name} ({item.category || 'Geral'}) - Saldo: {item.currentStock || 0} {item.unit || 'un'}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={{ width: '100px' }}>
                    <label style={{ ...styles.label, fontSize: '0.8rem' }}>Qtd:</label>
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
                      <Plus size={16} /> Adicionar
                    </button>
                  </div>
                </div>

                {/* Draft Table */}
                <div style={{ marginTop: '1rem' }}>
                  <label style={{ ...styles.label, fontSize: '0.85rem' }}>Itens no Pedido ({reqItemsList.length}):</label>
                  {reqItemsList.length === 0 ? (
                    <div style={{ padding: '1rem', backgroundColor: '#f9fafb', border: '1px dashed #d1d5db', borderRadius: '6px', textAlign: 'center', fontSize: '0.85rem', color: '#6b7280' }}>
                      Nenhum item adicionado ainda. Escolha um produto acima e clique em "Adicionar".
                    </div>
                  ) : (
                    <div style={{ maxHeight: '180px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                        <thead style={{ backgroundColor: '#f3f4f6', textAlign: 'left' }}>
                          <tr>
                            <th style={{ padding: '0.5rem' }}>Material</th>
                            <th style={{ padding: '0.5rem', width: '90px' }}>Qtd Pedida</th>
                            <th style={{ padding: '0.5rem', width: '50px', textAlign: 'center' }}>Remover</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reqItemsList.map((item, idx) => (
                            <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb' }}>
                              <td style={{ padding: '0.5rem', fontWeight: '500' }}>{item.itemName}</td>
                              <td style={{ padding: '0.5rem' }}>{item.requestedQuantity} {item.unit}</td>
                              <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                                <button 
                                  type="button" 
                                  onClick={() => handleRemoveItemFromReq(idx)}
                                  style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                                >
                                  <X size={14} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>

              {/* Notes */}
              <div style={styles.formGroup}>
                <label style={styles.label}>Observações / Justificativa (opcional):</label>
                <textarea 
                  value={notes} 
                  onChange={(e) => setNotes(e.target.value)} 
                  placeholder="Ex: Paciente com intercorrência no 2º turno, agulha substituída..."
                  style={{ ...styles.input, height: '60px', resize: 'vertical' }}
                />
              </div>

              <div style={styles.modalFooter}>
                <button type="button" style={styles.btnSecondary} onClick={() => setShowModal(false)}>
                  Cancelar
                </button>
                <button type="submit" style={styles.btnPrimary} disabled={actionLoading}>
                  {actionLoading ? 'Salvando...' : editingReq ? 'Atualizar Requisição' : 'Enviar à Farmácia'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Ver Detalhes Completo */}
      {showDetailModal && selectedReqDetail && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>
                Detalhes da Requisição: {selectedReqDetail.requisitionCode}
              </h2>
              <button style={styles.btnClose} onClick={() => setShowDetailModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', backgroundColor: '#f9fafb', padding: '1rem', borderRadius: '8px' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Solicitante:</span>
                  <div style={{ fontWeight: '600' }}>{selectedReqDetail.requestedBy}</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Status Atual:</span>
                  <div>{getStatusBadge(selectedReqDetail.status)}</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Data e Hora:</span>
                  <div style={{ fontWeight: '500' }}>{new Date(selectedReqDetail.createdAt).toLocaleString('pt-BR')}</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Destino / Paciente:</span>
                  <div style={{ fontWeight: '600' }}>{selectedReqDetail.patientName || 'Uso Geral'}</div>
                </div>
              </div>

              {selectedReqDetail.notes && (
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>Observações:</span>
                  <div style={{ fontSize: '0.85rem', fontStyle: 'italic', backgroundColor: '#fffbe6', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ffe58f' }}>
                    "{selectedReqDetail.notes}"
                  </div>
                </div>
              )}

              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: '700', marginBottom: '0.5rem' }}>Itens Solicitados & Dispensados:</h4>
                <div style={{ border: '1px solid var(--border-color)', borderRadius: '6px', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                    <thead style={{ backgroundColor: '#f3f4f6', textAlign: 'left' }}>
                      <tr>
                        <th style={{ padding: '0.5rem' }}>Item / Material</th>
                        <th style={{ padding: '0.5rem', textAlign: 'center' }}>Qtd Solicitada</th>
                        <th style={{ padding: '0.5rem', textAlign: 'center' }}>Qtd Entregue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedReqDetail.items && selectedReqDetail.items.map((item, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid #e5e7eb' }}>
                          <td style={{ padding: '0.5rem', fontWeight: '500' }}>{item.itemName}</td>
                          <td style={{ padding: '0.5rem', textAlign: 'center', fontWeight: '600' }}>{item.requestedQuantity} {item.unit}</td>
                          <td style={{ padding: '0.5rem', textAlign: 'center', fontWeight: '700', color: item.deliveredQuantity >= item.requestedQuantity ? '#059669' : item.deliveredQuantity > 0 ? '#d97706' : '#6b7280' }}>
                            {item.deliveredQuantity || 0} {item.unit}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {selectedReqDetail.fulfillment && (
                <div style={{ backgroundColor: '#ecfdf5', padding: '0.75rem', borderRadius: '6px', border: '1px solid #a7f3d0', fontSize: '0.8rem', color: '#065f46' }}>
                  <strong>Atendido por:</strong> {selectedReqDetail.fulfillment.fulfilledBy || 'Farmácia Central'} em {new Date(selectedReqDetail.fulfillment.fulfilledAt).toLocaleString('pt-BR')}
                  {selectedReqDetail.fulfillment.notes && <div><strong>Notas da Farmácia:</strong> {selectedReqDetail.fulfillment.notes}</div>}
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
    padding: '1.5rem',
    maxWidth: 'var(--max-width)',
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1.5rem',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  badgePortal: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
    backgroundColor: '#ccfbf1',
    color: '#0f766e',
    fontSize: '0.75rem',
    fontWeight: '700',
    padding: '0.25rem 0.6rem',
    borderRadius: '9999px',
    marginBottom: '0.5rem',
    border: '1px solid #99f6e4'
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: 'var(--text-color)',
    margin: 0,
  },
  subtitle: {
    fontSize: '0.875rem',
    color: 'var(--text-muted)',
    marginTop: '0.25rem',
  },
  headerActions: {
    display: 'flex',
    gap: '0.5rem',
    alignItems: 'center',
  },
  btnPrimary: {
    backgroundColor: 'var(--primary-color)',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '0.6rem 1.2rem',
    fontWeight: '600',
    fontSize: '0.875rem',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    cursor: 'pointer',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  btnRefresh: {
    backgroundColor: '#ffffff',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    padding: '0.6rem',
    color: 'var(--text-color)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
  },
  alert: {
    padding: '0.875rem 1rem',
    borderRadius: '8px',
    fontSize: '0.875rem',
    marginBottom: '1.5rem',
    fontWeight: '500',
  },
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '1rem',
    marginBottom: '1.5rem',
  },
  kpiCard: {
    backgroundColor: '#ffffff',
    padding: '1.25rem',
    borderRadius: '10px',
    border: '1px solid var(--border-color)',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  },
  kpiHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  kpiTitle: {
    fontSize: '0.8rem',
    fontWeight: '600',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
  },
  kpiValue: {
    fontSize: '1.8rem',
    fontWeight: '800',
    color: 'var(--text-color)',
    margin: '0.5rem 0 0.25rem 0',
  },
  kpiSub: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
  },
  filterCard: {
    backgroundColor: '#ffffff',
    padding: '1rem',
    borderRadius: '10px',
    border: '1px solid var(--border-color)',
    marginBottom: '1rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '1rem',
    flexWrap: 'wrap',
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    backgroundColor: 'var(--bg-color)',
    border: '1px solid var(--border-color)',
    borderRadius: '6px',
    padding: '0.5rem 0.75rem',
    flex: 1,
    minWidth: '260px',
  },
  searchInput: {
    border: 'none',
    background: 'transparent',
    outline: 'none',
    width: '100%',
    fontSize: '0.875rem',
    color: 'var(--text-color)',
  },
  btnClearSearch: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#9ca3af',
    padding: 0,
  },
  filterGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  selectFilter: {
    padding: '0.5rem 0.75rem',
    borderRadius: '6px',
    border: '1px solid var(--border-color)',
    backgroundColor: '#ffffff',
    fontSize: '0.875rem',
    outline: 'none',
    color: 'var(--text-color)',
  },
  tableCard: {
    backgroundColor: '#ffffff',
    borderRadius: '10px',
    border: '1px solid var(--border-color)',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    overflow: 'hidden',
  },
  loadingBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '3rem',
    gap: '0.75rem',
    color: 'var(--text-muted)',
  },
  emptyBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '3rem',
    textAlign: 'center',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
  },
  th: {
    backgroundColor: '#f9fafb',
    padding: '0.75rem 1rem',
    fontSize: '0.75rem',
    fontWeight: '700',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    borderBottom: '1px solid var(--border-color)',
  },
  tr: {
    borderBottom: '1px solid var(--border-color)',
  },
  td: {
    padding: '0.875rem 1rem',
    verticalAlign: 'middle',
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.25rem 0.5rem',
    borderRadius: '9999px',
    fontSize: '0.75rem',
    fontWeight: '600',
  },
  btnActionView: {
    backgroundColor: '#f3f4f6',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    padding: '0.35rem 0.5rem',
    color: '#374151',
    cursor: 'pointer',
  },
  btnActionEdit: {
    backgroundColor: '#eff6ff',
    border: '1px solid #bfdbfe',
    borderRadius: '6px',
    padding: '0.35rem 0.5rem',
    color: '#1d4ed8',
    cursor: 'pointer',
  },
  btnActionDelete: {
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '6px',
    padding: '0.35rem 0.5rem',
    color: '#dc2626',
    cursor: 'pointer',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '1rem',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    width: '100%',
    maxWidth: '650px',
    maxHeight: '90vh',
    overflowY: 'auto',
    padding: '1.5rem',
    boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '0.75rem',
  },
  modalTitle: {
    fontSize: '1.15rem',
    fontWeight: '700',
    color: 'var(--text-color)',
    margin: 0,
  },
  btnClose: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#9ca3af',
  },
  modalForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    marginTop: '1rem',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem',
  },
  label: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: 'var(--text-color)',
  },
  input: {
    padding: '0.6rem',
    borderRadius: '6px',
    border: '1px solid var(--border-color)',
    fontSize: '0.875rem',
    outline: 'none',
    width: '100%',
  },
  itemsSection: {
    backgroundColor: '#f9fafb',
    padding: '1rem',
    borderRadius: '8px',
    border: '1px solid var(--border-color)',
  },
  itemsSectionTitle: {
    fontSize: '0.9rem',
    fontWeight: '700',
    margin: '0 0 0.75rem 0',
    color: 'var(--text-color)',
  },
  stockAlertBox: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    padding: '0.5rem 0.75rem',
    borderRadius: '6px',
    fontSize: '0.8rem',
    fontWeight: '500',
    marginBottom: '0.75rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
  },
  addItemGrid: {
    display: 'flex',
    gap: '0.5rem',
    alignItems: 'flex-end',
  },
  btnAddItem: {
    backgroundColor: '#0d9488',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    padding: '0.6rem 0.85rem',
    fontSize: '0.8rem',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
  },
  modalFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.5rem',
    marginTop: '1rem',
    borderTop: '1px solid var(--border-color)',
    paddingTop: '1rem',
  },
  btnSecondary: {
    backgroundColor: '#f3f4f6',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    padding: '0.6rem 1rem',
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#374151',
    cursor: 'pointer',
  }
};
