import React, { useState, useEffect } from 'react';
import { dbService } from '../firebase';
import { 
  Package, Boxes, Clock, Calendar, Plus, Search, 
  X, FileText, UploadCloud, Briefcase, Warehouse,
  CheckCircle2, AlertTriangle, AlertCircle, ArrowUpRight, ArrowDownLeft, Trash2, Edit,
  ArrowUpDown, ArrowUp, ArrowDown, RefreshCw, Send, ClipboardList, Repeat
} from 'lucide-react';

import { useStockLogic } from './Stock/hooks/useStockLogic';

export default function StockPanel({ currentUser }) {
  const stockLogic = useStockLogic(currentUser);
  const {
    activeTab,
    setActiveTab,
    items,
    setItems,
    transactions,
    setTransactions,
    suppliers,
    setSuppliers,
    sectors,
    setSectors,
    invoices,
    setInvoices,
    loans,
    setLoans,
    categoriesList,
    setCategoriesList,
    requisitions,
    setRequisitions,
    stockLocations,
    setStockLocations,
    inventories,
    setInventories,
    transfers,
    setTransfers,
    showFulfillModal,
    setShowFulfillModal,
    fulfillingReq,
    setFulfillingReq,
    fulfillItems,
    setFulfillItems,
    fulfillmentNotes,
    setFulfillmentNotes,
    showInventoryModal,
    setShowInventoryModal,
    editingInventory,
    setEditingInventory,
    inventoryForm,
    setInventoryForm,
    showCountModal,
    setShowCountModal,
    countingInventory,
    setCountingInventory,
    countItems,
    setCountItems,
    showTransferModal,
    setShowTransferModal,
    transferForm,
    setTransferForm,
    loading,
    setLoading,
    actionLoading,
    setActionLoading,
    message,
    setMessage,
    searchTerm,
    setSearchTerm,
    filterCategory,
    setFilterCategory,
    inventorySort,
    setInventorySort,
    transactionSort,
    setTransactionSort,
    supplierSort,
    setSupplierSort,
    sectorSort,
    setSectorSort,
    invoiceSort,
    setInvoiceSort,
    loanSort,
    setLoanSort,
    showItemModal,
    setShowItemModal,
    editingItem,
    setEditingItem,
    itemForm,
    setItemForm,
    showSupplierModal,
    setShowSupplierModal,
    editingSupplier,
    setEditingSupplier,
    supplierForm,
    setSupplierForm,
    showSectorModal,
    setShowSectorModal,
    editingSector,
    setEditingSector,
    sectorForm,
    setSectorForm,
    showLoanModal,
    setShowLoanModal,
    editingLoan,
    setEditingLoan,
    loanForm,
    setLoanForm,
    showTxForm,
    setShowTxForm,
    txForm,
    setTxForm,
    showXmlWizard,
    setShowXmlWizard,
    xmlWizardStep,
    setXmlWizardStep,
    xmlData,
    setXmlData,
    xmlError,
    setXmlError,
    supplierMapping,
    setSupplierMapping,
    itemMappings,
    setItemMappings,
    fetchData,
    showAlert,
    sortData,
    renderSortHeader,
    handleOpenAddModal,
    handleOpenEditModal,
    handleSaveItem,
    handleQuickPurchaseRequest,
    handleOpenSupplierAdd,
    handleOpenSupplierEdit,
    handleSaveSupplier,
    handleOpenSectorAdd,
    handleOpenSectorEdit,
    handleSaveSector,
    handleDeleteItem,
    handleDeleteSupplier,
    handleDeleteSector,
    handleOpenLoanAdd,
    handleOpenLoanEdit,
    handleSaveLoan,
    handleReturnLoan,
    handleDeleteLoan,
    handleOpenInventoryAdd,
    handleSaveInventory,
    handleOpenCountModal,
    handleUpdatePhysicalCount,
    handleSaveCountDraft,
    handleFinalizeInventorySubmit,
    handleDeleteInventory,
    handleOpenTransferModal,
    handleSaveTransfer,
    handleDeleteTransfer,
    handleOpenTxForm,
    handleSaveTransaction,
    handleOpenFulfillModal,
    handleFulfillQuantityChange,
    handleFillAllRequestedQuantity,
    handleProcessFulfillment,
    handleXmlUpload,
    handleConfirmSupplierMapping,
    handleUpdateInstallment,
    handleAddInstallment,
    handleRemoveInstallment,
    handleMappingItemChange,
    handleMappingFieldChange,
    handleFinishXmlWizard,
    formatCnpj,
    cleanCnpj,
    getExpiryStatus,
    getFilteredItems,
    getLowStockItems,
    getExpiryTransactions,
    filteredItems,
    lowStockItems,
    expiryList
  } = stockLogic;

  return (
    <div style={styles.container}>
      <div style={styles.cardHeader}>
        <div>
          <h1 style={styles.title}>NexaSTOCK - Estoque, Farmácia & Logística</h1>
          <p style={styles.subtitle}>Gestão de fornecedores, locais de armazenamento, importação de XML e notas fiscais de compra.</p>
        </div>
      </div>

      {/* Main Tabs */}
      <div style={styles.tabsWrapper}>
        <button 
          onClick={() => setActiveTab('inventory')} 
          style={{ ...styles.tabBtn, ...(activeTab === 'inventory' ? styles.tabBtnActive : {}) }}
        >
          <Boxes size={16} /> Catálogo de Produtos ({(items || []).length})
        </button>
        <button 
          onClick={() => setActiveTab('physical_inventory')} 
          style={{ ...styles.tabBtn, ...(activeTab === 'physical_inventory' ? styles.tabBtnActive : {}) }}
        >
          <ClipboardList size={16} /> Inventários Físicos ({(inventories || []).length})
        </button>
        <button 
          onClick={() => setActiveTab('transfers')} 
          style={{ ...styles.tabBtn, ...(activeTab === 'transfers' ? styles.tabBtnActive : {}) }}
        >
          <Repeat size={16} /> Transferências de Estoque ({(transfers || []).length})
        </button>
        <button 
          onClick={() => setActiveTab('invoices')} 
          style={{ ...styles.tabBtn, ...(activeTab === 'invoices' ? styles.tabBtnActive : {}) }}
        >
          <FileText size={16} /> Entrada de Notas (XML / PDF) ({(invoices || []).length})
        </button>
        <button 
          onClick={() => setActiveTab('transactions')} 
          style={{ ...styles.tabBtn, ...(activeTab === 'transactions' ? styles.tabBtnActive : {}) }}
        >
          <Clock size={16} /> Histórico de Movimentações
        </button>
        <button 
          onClick={() => setActiveTab('expiry')} 
          style={{ ...styles.tabBtn, ...(activeTab === 'expiry' ? styles.tabBtnActive : {}) }}
        >
          <Calendar size={16} /> Controle de Validade
        </button>
        <button 
          onClick={() => setActiveTab('loans')} 
          style={{ ...styles.tabBtn, ...(activeTab === 'loans' ? styles.tabBtnActive : {}) }}
        >
          <RefreshCw size={16} /> Empréstimos de Produtos ({(loans || []).length})
        </button>
        <button 
          onClick={() => setActiveTab('requisitions')} 
          style={{ ...styles.tabBtn, ...(activeTab === 'requisitions' ? styles.tabBtnActive : {}) }}
        >
          <Send size={16} /> Atendimento de Requisições ({(requisitions || []).filter(r => r && (r.status === 'Pendente' || r.status === 'Parcial')).length > 0 ? `${(requisitions || []).filter(r => r && (r.status === 'Pendente' || r.status === 'Parcial')).length} Pendente(s)` : (requisitions || []).length})
        </button>
      </div>

      {/* Message feedback */}
      {message.text && (
        <div style={{ ...styles.alert, backgroundColor: `var(--${message.type}-light)`, border: `1px solid var(--${message.type}-color)` }}>
          <AlertCircle size={18} color={`var(--${message.type}-color)`} />
          <span style={{ color: `var(--${message.type}-color)`, fontWeight: '600' }}>{message.text}</span>
        </div>
      )}

      {/* Warning Alert Banner */}
      {activeTab === 'inventory' && lowStockItems.length > 0 && (
        <div style={styles.warningBanner}>
          <AlertTriangle size={18} />
          <span>Alerta de Logística: <strong>{lowStockItems.length} itens</strong> estão com estoque abaixo do mínimo de segurança!</span>
        </div>
      )}

      {/* Dynamic Actions Bar */}
      <div style={styles.filtersBar}>
        <div style={styles.searchWrapper}>
          <Search size={18} style={styles.searchIcon} />
          <input 
            type="text" 
            placeholder="Pesquisar..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
        </div>
        <div style={styles.selectsWrapper}>
          {activeTab === 'inventory' && (
            <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} style={styles.filterSelect}>
              <option value="">Todas as Categorias</option>
              {categoriesList.map(c => (
                <option key={c?.id || Math.random()} value={c?.name}>{c?.name}</option>
              ))}
            </select>
          )}
        </div>
        
        {/* Dynamic Buttons depending on Tab */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {activeTab === 'inventory' && (
            <button onClick={handleOpenAddModal} style={styles.addBtn}>
              <Plus size={16} /> Novo Insumo
            </button>
          )}
          {activeTab === 'physical_inventory' && (
            <button onClick={handleOpenInventoryAdd} style={styles.addBtn}>
              <Plus size={16} /> Abrir Novo Inventário Físico
            </button>
          )}
          {activeTab === 'transfers' && (
            <button onClick={handleOpenTransferModal} style={styles.addBtn}>
              <Repeat size={16} /> Nova Transferência de Estoque
            </button>
          )}
          {activeTab === 'invoices' && (
            <button onClick={() => setShowXmlWizard(true)} style={styles.addBtn}>
              <UploadCloud size={16} /> Importar XML / PDF de NF-e
            </button>
          )}
          {activeTab === 'suppliers' && (
            <button onClick={handleOpenSupplierAdd} style={styles.addBtn}>
              <Plus size={16} /> Novo Fornecedor
            </button>
          )}
          {activeTab === 'sectors' && (
            <button onClick={handleOpenSectorAdd} style={styles.addBtn}>
              <Warehouse size={16} /> Novo Setor Físico
            </button>
          )}
          {activeTab === 'loans' && (
            <button onClick={handleOpenLoanAdd} style={styles.addBtn}>
              <Plus size={16} /> Novo Empréstimo
            </button>
          )}
          <button onClick={handleOpenTxForm} style={styles.txBtn}>
            Lançar Movimentação Manual
          </button>
        </div>
      </div>

      {loading ? (
        <div style={styles.loadingBox}>Carregando dados...</div>
      ) : (
        <>
          {/* TAB 1: Inventory Catalogue */}
          {activeTab === 'inventory' && (
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    {renderSortHeader('Item de Insumo', 'name', inventorySort, setInventorySort)}
                    {renderSortHeader('Categoria', 'category', inventorySort, setInventorySort)}
                    {renderSortHeader('Estoque Atual', 'currentStock', inventorySort, setInventorySort)}
                    {renderSortHeader('Setor Padrão', 'defaultSectorId', inventorySort, setInventorySort)}
                    {renderSortHeader('Mínimo', 'minStock', inventorySort, setInventorySort)}
                    <th style={styles.th}>Status</th>
                    {renderSortHeader('Preço Unitário', 'price', inventorySort, setInventorySort)}
                    <th style={styles.th}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.length === 0 ? (
                    <tr>
                      <td colSpan="8" style={styles.noDataCell}>Nenhum insumo no catálogo.</td>
                    </tr>
                  ) : (
                    sortData(filteredItems, inventorySort).map((item, idx) => {
                      const currentVal = parseFloat(item?.currentStock) || 0;
                      const minVal = parseFloat(item?.minStock) || 0;
                      const isLow = currentVal <= minVal;
                      const sectorName = sectors.find(s => s?.id === item?.defaultSectorId)?.name || 'Almoxarifado Central';
                      const itemPrice = parseFloat(item?.price) || 0;
                      return (
                        <tr key={item?.id || idx} style={isLow ? styles.rowWarning : {}}>
                          <td style={{ fontWeight: '600' }}>{item?.name || 'Insumo Sem Nome'}</td>
                          <td><span style={styles.categoryBadge}>{item?.category || 'Geral'}</span></td>
                          <td style={{ fontWeight: '700', color: isLow ? 'var(--danger-color)' : 'var(--text-primary)' }}>
                            {currentVal} {item?.unit || 'unidades'}
                          </td>
                          <td>{sectorName}</td>
                          <td>{minVal} {item?.unit || 'unidades'}</td>
                          <td>
                            {isLow ? (
                              <span style={styles.badgeCritical}>Abaixo do Mínimo</span>
                            ) : (
                              <span style={styles.badgeNormal}>Regular</span>
                            )}
                          </td>
                          <td>R$ {itemPrice.toFixed(2)}</td>
                          <td>
                            <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                              <button onClick={() => handleOpenEditModal(item)} style={styles.actionEditBtn} title="Editar Item">
                                <Edit size={13} /> Editar
                              </button>
                              <button onClick={() => handleDeleteItem(item.id)} style={{ ...styles.actionEditBtn, backgroundColor: '#fee2e2', color: '#991b1b' }} title="Excluir Item">
                                <Trash2 size={13} />
                              </button>
                              {isLow && (
                                <button onClick={() => handleQuickPurchaseRequest(item)} style={{ ...styles.actionEditBtn, backgroundColor: '#ec4899', color: '#ffffff', border: 'none', display: 'inline-flex', alignItems: 'center', gap: '2px' }} title="Gerar solicitação automática no Portal de Compras">
                                  <Plus size={12} /> Pedir Compra
                                </button>
                              )}
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

          {/* TAB: Physical Inventories (Inventários Físicos) */}
          {activeTab === 'physical_inventory' && (
            <div style={styles.tableWrapper}>
              <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '700', color: 'var(--text-primary)' }}>📋 Gestão de Inventários Físicos & Auditoria de Saldo</h3>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Crie e execute contagens de estoque por local. Ao concluir, o saldo do sistema é ajustado automaticamente com relatório de divergência.
                  </span>
                </div>
              </div>

              <table style={styles.table}>
                <thead>
                  <tr>
                    <th>Título do Inventário</th>
                    <th>Local de Estoque</th>
                    <th>Data de Criação</th>
                    <th>Itens Auditados</th>
                    <th>Status</th>
                    <th>Ações & Relatórios</th>
                  </tr>
                </thead>
                <tbody>
                  {inventories.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={styles.noDataCell}>Nenhum inventário físico registrado. Clique em "Abrir Novo Inventário Físico" para iniciar.</td>
                    </tr>
                  ) : (
                    inventories.map(inv => (
                      <tr key={inv.id}>
                        <td style={{ fontWeight: '600' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <ClipboardList size={16} color="var(--primary-color)" />
                            {inv?.title}
                          </div>
                        </td>
                        <td>
                          <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                            <Warehouse size={13} style={{ marginRight: '4px' }} />
                            {inv?.locationName || 'Estoque Geral'}
                          </span>
                        </td>
                        <td>{inv?.createdAt ? new Date(inv.createdAt).toLocaleDateString('pt-BR') : '-'}</td>
                        <td>{inv?.items?.length || items.length} produtos</td>
                        <td>
                          <span style={{
                            padding: '0.25rem 0.6rem',
                            borderRadius: '12px',
                            fontSize: '0.75rem',
                            fontWeight: '700',
                            backgroundColor: inv?.status === 'Concluído' ? '#dcfce7' : '#fef3c7',
                            color: inv?.status === 'Concluído' ? '#166534' : '#92400e'
                          }}>
                            {inv?.status || 'Em Andamento'}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.35rem' }}>
                            <button onClick={() => handleOpenCountModal(inv)} style={{ ...styles.actionEditBtn, backgroundColor: 'var(--primary-light)', color: 'var(--primary-color)' }}>
                              <Edit size={13} /> {inv?.status === 'Concluído' ? 'Ver Divergências' : 'Digitar Contagem'}
                            </button>
                            <button onClick={() => handleDeleteInventory(inv?.id, inv?.title)} style={{ ...styles.actionEditBtn, backgroundColor: '#fee2e2', color: '#991b1b' }}>
                              <Trash2 size={13} /> Excluir
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB: Stock Transfers (Transferências entre Locais) */}
          {activeTab === 'transfers' && (
            <div style={styles.tableWrapper}>
              <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '700', color: 'var(--text-primary)' }}>🔄 Histórico de Transferências Entre Locais de Estoque</h3>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Rastreamento de movimentações internas (ex: Almoxarifado Central ➡️ Farmácia da Diálise).
                  </span>
                </div>
              </div>

              <table style={styles.table}>
                <thead>
                  <tr>
                    <th>Data / Hora</th>
                    <th>Origem (Local)</th>
                    <th>Destino (Local)</th>
                    <th>Produto Transferido</th>
                    <th>Quantidade</th>
                    <th>Lote / Validade</th>
                    <th>Operador</th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {transfers.length === 0 ? (
                    <tr>
                      <td colSpan="9" style={styles.noDataCell}>Nenhuma transferência entre locais registrada. Clique em "Nova Transferência de Estoque".</td>
                    </tr>
                  ) : (
                    transfers.map(tr => (
                      <tr key={tr?.id || Math.random()}>
                        <td>{tr?.createdAt ? new Date(tr.createdAt).toLocaleString('pt-BR') : '-'}</td>
                        <td style={{ fontWeight: '600', color: '#991b1b' }}>
                          <ArrowDownLeft size={14} style={{ marginRight: '4px' }} />
                          {tr?.originLocationName || 'Origem'}
                        </td>
                        <td style={{ fontWeight: '600', color: '#166534' }}>
                          <ArrowUpRight size={14} style={{ marginRight: '4px' }} />
                          {tr?.destinationLocationName || 'Destino'}
                        </td>
                        <td style={{ fontWeight: '600' }}>{tr?.itemName}</td>
                        <td style={{ fontWeight: '700' }}>{tr?.quantity} {tr?.unit || 'unidades'}</td>
                        <td>{tr?.batch || 'S/L'} {tr?.expiryDate ? `(${new Date(tr.expiryDate).toLocaleDateString('pt-BR')})` : ''}</td>
                        <td>{tr?.operator || 'Almoxarife'}</td>
                        <td><span style={styles.badgeNormal}>Concluída</span></td>
                        <td>
                          <button onClick={() => handleDeleteTransfer(tr?.id)} style={{ ...styles.actionEditBtn, backgroundColor: '#fee2e2', color: '#991b1b' }}>
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 2: Purchase Invoices List */}
          {activeTab === 'invoices' && (
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    {renderSortHeader('NF-e Nº', 'number', invoiceSort, setInvoiceSort)}
                    {renderSortHeader('Chave de Acesso', 'accessKey', invoiceSort, setInvoiceSort)}
                    {renderSortHeader('Fornecedor', 'supplierName', invoiceSort, setInvoiceSort)}
                    {renderSortHeader('Emissão', 'issueDate', invoiceSort, setInvoiceSort)}
                    {renderSortHeader('Data de Entrada', 'entryDate', invoiceSort, setInvoiceSort)}
                    {renderSortHeader('Valor Total', 'totalValue', invoiceSort, setInvoiceSort)}
                    <th style={styles.th}>Itens Recebidos</th>
                    <th style={styles.th}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.length === 0 ? (
                    <tr>
                      <td colSpan="8" style={styles.noDataCell}>Nenhuma Nota Fiscal importada ou registrada.</td>
                    </tr>
                  ) : (
                    sortData(invoices, invoiceSort).map((inv, idx) => {
                      const totalVal = parseFloat(inv?.totalValue) || 0;
                      return (
                        <tr key={inv?.id || idx}>
                          <td style={{ fontWeight: '600' }}>{inv?.number || 'NF-e Sem Nº'}</td>
                          <td style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{inv?.accessKey || 'N/A'}</td>
                          <td style={{ fontWeight: '600' }}>{inv?.supplierName || 'Fornecedor Desconhecido'}</td>
                          <td>{inv?.issueDate && !isNaN(new Date(inv.issueDate).getTime()) ? new Date(inv.issueDate).toLocaleDateString('pt-BR') : '-'}</td>
                          <td>{inv?.entryDate && !isNaN(new Date(inv.entryDate).getTime()) ? new Date(inv.entryDate).toLocaleDateString('pt-BR') : '-'}</td>
                          <td style={{ fontWeight: '700' }}>R$ {totalVal.toFixed(2)}</td>
                          <td>{inv?.items?.length || 0} produtos</td>
                          <td><span style={styles.badgeNormal}>Processada</span></td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 3: Suppliers Directory */}
          {activeTab === 'suppliers' && (
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    {renderSortHeader('Fornecedor', 'name', supplierSort, setSupplierSort)}
                    {renderSortHeader('CNPJ', 'cnpj', supplierSort, setSupplierSort)}
                    {renderSortHeader('Contato', 'contact', supplierSort, setSupplierSort)}
                    {renderSortHeader('Telefone', 'phone', supplierSort, setSupplierSort)}
                    {renderSortHeader('Email', 'email', supplierSort, setSupplierSort)}
                    <th style={styles.th}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {suppliers.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={styles.noDataCell}>Nenhum fornecedor cadastrado.</td>
                    </tr>
                  ) : (
                    sortData(suppliers, supplierSort).map(sup => (
                      <tr key={sup.id}>
                        <td style={{ fontWeight: '600' }}>{sup.name}</td>
                        <td>{sup.cnpj || '-'}</td>
                        <td>{sup.contact || '-'}</td>
                        <td>{sup.phone || '-'}</td>
                        <td>{sup.email || '-'}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.35rem' }}>
                            <button onClick={() => handleOpenSupplierEdit(sup)} style={styles.actionEditBtn} title="Editar Fornecedor">
                              <Edit size={13} /> Editar
                            </button>
                            <button onClick={() => handleDeleteSupplier(sup.id)} style={{ ...styles.actionEditBtn, backgroundColor: '#fee2e2', color: '#991b1b' }} title="Excluir Fornecedor">
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 4: Stock Sectors */}
          {activeTab === 'sectors' && (
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    {renderSortHeader('Nome do Setor', 'name', sectorSort, setSectorSort)}
                    {renderSortHeader('Descrição / Finalidade', 'description', sectorSort, setSectorSort)}
                    <th style={styles.th}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {sectors.length === 0 ? (
                    <tr>
                      <td colSpan="3" style={styles.noDataCell}>Nenhum setor físico cadastrado.</td>
                    </tr>
                  ) : (
                    sortData(sectors, sectorSort).map(sec => (
                      <tr key={sec.id}>
                        <td style={{ fontWeight: '600' }}>{sec.name}</td>
                        <td>{sec.description || 'Sem descrição'}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.35rem' }}>
                            <button onClick={() => handleOpenSectorEdit(sec)} style={styles.actionEditBtn} title="Editar Setor">
                              <Edit size={13} /> Editar
                            </button>
                            <button onClick={() => handleDeleteSector(sec.id)} style={{ ...styles.actionEditBtn, backgroundColor: '#fee2e2', color: '#991b1b' }} title="Excluir Setor">
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 5: Stock Transactions History */}
          {activeTab === 'transactions' && (
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    {renderSortHeader('Data/Hora', 'date', transactionSort, setTransactionSort)}
                    {renderSortHeader('Item', 'itemName', transactionSort, setTransactionSort)}
                    {renderSortHeader('Tipo', 'type', transactionSort, setTransactionSort)}
                    {renderSortHeader('Quantidade', 'quantity', transactionSort, setTransactionSort)}
                    <th style={styles.th}>Setor Destino</th>
                    <th style={styles.th}>Lote</th>
                    {renderSortHeader('Operador', 'operator', transactionSort, setTransactionSort)}
                    <th style={styles.th}>Observações</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.length === 0 ? (
                    <tr>
                      <td colSpan="8" style={styles.noDataCell}>Nenhuma movimentação registrada.</td>
                    </tr>
                  ) : (
                    sortData(transactions, transactionSort).map(tx => {
                      const isEntry = tx?.type === 'Entrada';
                      const secName = sectors.find(s => s?.id === tx?.sectorId)?.name || 'Almoxarifado Central';
                      return (
                        <tr key={tx?.id || Math.random()}>
                          <td>{tx?.date && !isNaN(new Date(tx.date).getTime()) ? new Date(tx.date).toLocaleString('pt-BR') : '-'}</td>
                          <td style={{ fontWeight: '600' }}>{tx?.itemName}</td>
                          <td>
                            <span style={{ 
                              ...styles.txTypeBadge, 
                              backgroundColor: isEntry ? 'var(--success-light)' : 'var(--danger-light)',
                              color: isEntry ? 'var(--success-color)' : 'var(--danger-color)',
                              borderColor: isEntry ? 'rgba(5, 150, 105, 0.1)' : 'rgba(225, 29, 72, 0.1)'
                            }}>
                              {isEntry ? <ArrowUpRight size={12} /> : <ArrowDownLeft size={12} />}
                              {tx?.type}
                            </span>
                          </td>
                          <td style={{ fontWeight: '700' }}>{tx?.quantity}</td>
                          <td>{secName}</td>
                          <td>{tx?.batch || '-'}</td>
                          <td>{tx?.operator}</td>
                          <td style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>{tx?.notes || '-'}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 6: Expiry Control */}
          {activeTab === 'expiry' && (
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th>Item de Insumo</th>
                    <th>Lote</th>
                    <th>Quantidade Inicial</th>
                    <th>Data de Entrada</th>
                    <th>Data de Validade</th>
                    <th>Controle Validade</th>
                    <th>Operador</th>
                  </tr>
                </thead>
                <tbody>
                  {expiryList.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={styles.noDataCell}>Nenhum lote com validade registrada.</td>
                    </tr>
                  ) : (
                    expiryList.map(tx => {
                      const expiryInfo = getExpiryStatus(tx?.expiryDate);
                      return (
                        <tr key={tx?.id || Math.random()}>
                          <td style={{ fontWeight: '600' }}>{tx?.itemName}</td>
                          <td style={{ fontWeight: '700' }}>{tx?.batch || '-'}</td>
                          <td>{tx?.quantity}</td>
                          <td>{tx?.date && !isNaN(new Date(tx.date).getTime()) ? new Date(tx.date).toLocaleDateString('pt-BR') : '-'}</td>
                          <td>{tx?.expiryDate && !isNaN(new Date(tx.expiryDate).getTime()) ? new Date(tx.expiryDate).toLocaleDateString('pt-BR') : '-'}</td>
                          <td>
                            <span style={{ ...styles.expiryLabel, color: expiryInfo.color }}>
                              {expiryInfo.text}
                            </span>
                          </td>
                          <td>{tx?.operator}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 7: Stock Loans (Empréstimos de Produtos / Medicamentos) */}
          {activeTab === 'loans' && (
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    {renderSortHeader('Tipo', 'type', loanSort, setLoanSort)}
                    {renderSortHeader('Produto / Medicamento', 'productName', loanSort, setLoanSort)}
                    {renderSortHeader('Quantidade', 'quantity', loanSort, setLoanSort)}
                    {renderSortHeader('Instituição / Clínica Parceira', 'partnerName', loanSort, setLoanSort)}
                    {renderSortHeader('Data Empréstimo', 'loanDate', loanSort, setLoanSort)}
                    {renderSortHeader('Previsão Devolução', 'expectedReturnDate', loanSort, setLoanSort)}
                    {renderSortHeader('Status', 'status', loanSort, setLoanSort)}
                    <th style={styles.th}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {loans.length === 0 ? (
                    <tr>
                      <td colSpan="8" style={styles.noDataCell}>Nenhum empréstimo registrado. Clique em "Novo Empréstimo" para cadastrar.</td>
                    </tr>
                  ) : (
                    sortData(loans, loanSort).map(loan => {
                      const isGiven = loan?.type === 'Concedido';
                      const isReturned = loan?.status === 'Devolvido';
                      return (
                        <tr key={loan?.id || Math.random()}>
                          <td>
                            <span style={{
                              padding: '0.2rem 0.5rem',
                              borderRadius: '4px',
                              fontWeight: '700',
                              fontSize: '0.75rem',
                              backgroundColor: isGiven ? '#e0f2fe' : '#fef3c7',
                              color: isGiven ? '#0369a1' : '#b45309'
                            }}>
                              {isGiven ? '📤 Concedido' : '📥 Recebido'}
                            </span>
                          </td>
                          <td style={{ fontWeight: '600' }}>
                            {loan?.productName}
                            {loan?.notes && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{loan.notes}</div>}
                          </td>
                          <td style={{ fontWeight: '700' }}>{loan?.quantity} {loan?.unit || ''}</td>
                          <td><strong>{loan?.partnerName}</strong></td>
                          <td>{loan?.loanDate ? loan.loanDate.split('-').reverse().join('/') : '-'}</td>
                          <td>{loan?.expectedReturnDate ? loan.expectedReturnDate.split('-').reverse().join('/') : 'Indefinido'}</td>
                          <td>
                            <span style={{
                              padding: '0.2rem 0.5rem',
                              borderRadius: '4px',
                              fontWeight: '600',
                              fontSize: '0.75rem',
                              backgroundColor: isReturned ? '#d1fae5' : '#fee2e2',
                              color: isReturned ? '#065f46' : '#991b1b'
                            }}>
                              {isReturned ? `✓ Devolvido em ${loan?.returnDate || ''}` : '⏳ Pendente (Ativo)'}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                              {!isReturned && (
                                <button 
                                  onClick={() => handleReturnLoan(loan)} 
                                  style={{ ...styles.actionEditBtn, backgroundColor: '#d1fae5', color: '#065f46' }} 
                                  title="Registrar Devolução / Dar Baixa"
                                >
                                  <RefreshCw size={12} /> Dar Baixa
                                </button>
                              )}
                              <button onClick={() => handleOpenLoanEdit(loan)} style={styles.actionEditBtn} title="Editar Empréstimo">
                                <Edit size={13} />
                              </button>
                              <button onClick={() => handleDeleteLoan(loan?.id)} style={{ ...styles.actionEditBtn, backgroundColor: '#fee2e2', color: '#991b1b' }} title="Excluir">
                                <Trash2 size={13} />
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
        </>
      )}

      {/* Requisitions Fulfillment Tab Content */}
      {activeTab === 'requisitions' && (
        <div style={{ marginTop: '1rem' }}>
          {/* Cards KPI de Requisições */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ backgroundColor: '#ffffff', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase' }}>Total de Pedidos</span>
                <Package size={20} color="#6b7280" />
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--text-color)' }}>{requisitions.length}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Histórico total de requisições</div>
            </div>

            <div style={{ backgroundColor: '#ffffff', border: '1px solid var(--border-color)', borderTop: '4px solid #f59e0b', borderRadius: '10px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase' }}>Pendentes</span>
                <Clock size={20} color="#f59e0b" />
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#d97706' }}>
                {requisitions.filter(r => r?.status === 'Pendente').length}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Aguardando separação na farmácia</div>
            </div>

            <div style={{ backgroundColor: '#ffffff', border: '1px solid var(--border-color)', borderTop: '4px solid #ea580c', borderRadius: '10px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase' }}>Entregas Parciais</span>
                <AlertTriangle size={20} color="#ea580c" />
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#ea580c' }}>
                {requisitions.filter(r => r?.status === 'Parcial').length}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Entregues parcialmente</div>
            </div>

            <div style={{ backgroundColor: '#ffffff', border: '1px solid var(--border-color)', borderTop: '4px solid #10b981', borderRadius: '10px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase' }}>Atendidos / Entregues</span>
                <CheckCircle2 size={20} color="#10b981" />
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#059669' }}>
                {requisitions.filter(r => r?.status === 'Entregue').length}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Concluídos com sucesso</div>
            </div>
          </div>

          <div style={{ backgroundColor: '#ffffff', padding: '1.25rem', borderRadius: '10px', border: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-color)', fontWeight: '700' }}>
                  Atendimento de Requisições do Salão
                </h3>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Recebimento de pedidos de insumos em tempo real vindos da hemodiálise com abate automático no estoque.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', backgroundColor: '#fef3c7', color: '#b45309', padding: '0.35rem 0.65rem', borderRadius: '9999px', fontWeight: '600', border: '1px solid #fde68a' }}>
                  {requisitions.filter(r => r?.status === 'Pendente').length} Pendente(s)
                </span>
                <span style={{ fontSize: '0.8rem', backgroundColor: '#ffedd5', color: '#c2410c', padding: '0.35rem 0.65rem', borderRadius: '9999px', fontWeight: '600', border: '1px solid #fed7aa' }}>
                  {requisitions.filter(r => r?.status === 'Parcial').length} Parcial(is)
                </span>
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
            {requisitions.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                <Send size={40} color="#9ca3af" />
                <p style={{ fontWeight: '600', color: 'var(--text-color)', marginTop: '0.75rem' }}>Nenhuma requisição recebida no momento</p>
                <p style={{ fontSize: '0.85rem' }}>As solicitações enviadas pelas técnicas no salão de hemodiálise aparecerão aqui.</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                  <thead style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid var(--border-color)' }}>
                    <tr>
                      <th style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Código</th>
                      <th style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Data / Hora</th>
                      <th style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Solicitante</th>
                      <th style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Paciente / Destino</th>
                      <th style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Itens Requisitados</th>
                      <th style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Status</th>
                      <th style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', textAlign: 'right' }}>Ação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requisitions.map((req) => (
                      <tr key={req?.id || Math.random()} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '0.875rem 1rem', fontWeight: '700', color: 'var(--primary-color)' }}>
                          {req?.requisitionCode}
                        </td>
                        <td style={{ padding: '0.875rem 1rem' }}>
                          <div>{req?.createdAt && !isNaN(new Date(req.createdAt).getTime()) ? new Date(req.createdAt).toLocaleDateString('pt-BR') : '-'}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{req?.createdAt && !isNaN(new Date(req.createdAt).getTime()) ? new Date(req.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : ''}</div>
                        </td>
                        <td style={{ padding: '0.875rem 1rem' }}>{req?.requestedBy}</td>
                        <td style={{ padding: '0.875rem 1rem', fontWeight: '600' }}>{req?.patientName || 'Uso Geral'}</td>
                        <td style={{ padding: '0.875rem 1rem' }}>
                          {req?.items && req.items.length > 0 ? (
                            <div>
                              <div><strong>{req.items[0]?.itemName}</strong> ({req.items[0]?.requestedQuantity} {req.items[0]?.unit})</div>
                              {req.items.length > 1 && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>+ {req.items.length - 1} outro(s) item(ns)</div>}
                            </div>
                          ) : 'Sem itens'}
                        </td>
                        <td style={{ padding: '0.875rem 1rem' }}>
                          <span style={{ 
                            padding: '0.25rem 0.5rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '600',
                            backgroundColor: req?.status === 'Pendente' ? '#fef3c7' : req?.status === 'Parcial' ? '#ffedd5' : req?.status === 'Entregue' ? '#d1fae5' : '#fee2e2',
                            color: req?.status === 'Pendente' ? '#b45309' : req?.status === 'Parcial' ? '#c2410c' : req?.status === 'Entregue' ? '#047857' : '#b91c1c'
                          }}>
                            {req?.status}
                          </span>
                        </td>
                        <td style={{ padding: '0.875rem 1rem', textAlign: 'right' }}>
                          <button 
                            onClick={() => handleOpenFulfillModal(req)}
                            style={{ 
                              padding: '0.4rem 0.8rem', borderRadius: '6px', border: 'none', fontWeight: '600', fontSize: '0.8rem', cursor: 'pointer',
                              backgroundColor: req?.status === 'Entregue' ? '#f3f4f6' : 'var(--primary-color)',
                              color: req?.status === 'Entregue' ? '#374151' : '#ffffff'
                            }}
                          >
                            {req?.status === 'Entregue' ? 'Ver Atendimento' : 'Atender Requisição'}
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
      )}

      {/* Requisition Fulfillment Modal */}
      {showFulfillModal && fulfillingReq && (
        <div style={styles.modalOverlay}>
          <div style={{ ...styles.modalCard, maxWidth: '650px' }}>
            <div style={styles.modalHeader}>
              <h2>Atender Requisição: {fulfillingReq.requisitionCode}</h2>
              <button onClick={() => setShowFulfillModal(false)} style={styles.modalCloseBtn}><X size={20} /></button>
            </div>

            <div style={styles.modalForm}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', backgroundColor: '#f9fafb', padding: '0.85rem', borderRadius: '8px', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                <div><strong>Solicitante:</strong> {fulfillingReq.requestedBy}</div>
                <div><strong>Destino:</strong> {fulfillingReq.patientName || 'Uso Geral'}</div>
                <div><strong>Data:</strong> {new Date(fulfillingReq.createdAt).toLocaleString('pt-BR')}</div>
                <div><strong>Status Atual:</strong> {fulfillingReq.status}</div>
              </div>

              {fulfillingReq.notes && (
                <div style={{ fontSize: '0.85rem', fontStyle: 'italic', marginBottom: '0.5rem', color: '#4b5563' }}>
                  Obs. Técnica: "{fulfillingReq.notes}"
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: '700' }}>Itens Solicitados & Quantidade Entregue:</h4>
                <button 
                  type="button" 
                  onClick={handleFillAllRequestedQuantity}
                  style={{ background: 'none', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '0.2rem 0.5rem', fontSize: '0.75rem', cursor: 'pointer', color: 'var(--primary-color)' }}
                >
                  Preencher com Total Solicitado
                </button>
              </div>

              <div style={{ border: '1px solid var(--border-color)', borderRadius: '6px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead style={{ backgroundColor: '#f3f4f6', textAlign: 'left' }}>
                    <tr>
                      <th style={{ padding: '0.5rem 0.75rem' }}>Item / Material</th>
                      <th style={{ padding: '0.5rem 0.75rem', textAlign: 'center', width: '100px' }}>Qtd Pedida</th>
                      <th style={{ padding: '0.5rem 0.75rem', textAlign: 'center', width: '120px' }}>Qtd Entregue *</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fulfillItems.map((item, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb' }}>
                        <td style={{ padding: '0.5rem 0.75rem', fontWeight: '600' }}>{item.itemName}</td>
                        <td style={{ padding: '0.5rem 0.75rem', textAlign: 'center' }}>{item.requestedQuantity} {item.unit}</td>
                        <td style={{ padding: '0.5rem 0.75rem', textAlign: 'center' }}>
                          <input 
                            type="number" 
                            min="0" 
                            value={item.deliveredQuantity !== undefined ? item.deliveredQuantity : item.requestedQuantity}
                            onChange={(e) => handleFulfillQuantityChange(idx, e.target.value)}
                            style={{ width: '80px', padding: '0.35rem', textAlign: 'center', borderRadius: '4px', border: '1px solid var(--border-color)', fontWeight: '700' }}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: '600', display: 'block', marginBottom: '0.25rem' }}>Observações da Farmácia:</label>
                <textarea 
                  value={fulfillmentNotes} 
                  onChange={(e) => setFulfillmentNotes(e.target.value)} 
                  placeholder="Ex: Entregue lote X com validade 2027..."
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.85rem', height: '50px' }}
                />
              </div>
            </div>

            <div style={styles.modalFooter}>
              <button 
                type="button" 
                onClick={() => handleProcessFulfillment('Cancelado')}
                style={{ padding: '0.5rem 0.85rem', borderRadius: '6px', border: '1px solid #fca5a5', backgroundColor: '#fef2f2', color: '#991b1b', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer' }}
                disabled={actionLoading}
              >
                Recusar Pedido
              </button>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  type="button" 
                  onClick={() => setShowFulfillModal(false)}
                  style={{ padding: '0.5rem 0.85rem', borderRadius: '6px', border: '1px solid #d1d5db', backgroundColor: '#f3f4f6', fontSize: '0.85rem', fontWeight: '600', color: '#374151', cursor: 'pointer' }}
                >
                  Fechar
                </button>
                <button 
                  type="button" 
                  onClick={() => handleProcessFulfillment('AUTO')}
                  style={{ padding: '0.5rem 1.2rem', borderRadius: '6px', border: 'none', backgroundColor: '#10b981', color: '#ffffff', fontSize: '0.85rem', fontWeight: '700', cursor: 'pointer' }}
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Processando...' : 'Confirmar & Baixar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Item Modal */}
      {showItemModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <div style={styles.modalHeader}>
              <h2>{editingItem ? 'Editar Produto' : 'Cadastrar Novo Insumo'}</h2>
              <button onClick={() => setShowItemModal(false)} style={styles.modalCloseBtn}><X size={20} /></button>
            </div>
            <form onSubmit={handleSaveItem} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
              <div style={styles.modalForm}>
                <div className="form-group">
                  <label>Nome do Insumo *</label>
                  <input 
                    type="text" className="form-control" placeholder="Ex: Capilar HF80" required
                    value={itemForm.name} onChange={e => setItemForm({ ...itemForm, name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Categoria *</label>
                  <select 
                    className="form-control" value={itemForm.category}
                    onChange={e => setItemForm({ ...itemForm, category: e.target.value })}
                  >
                    <option value="Insumo Clínico / MatMed">Insumo Clínico / MatMed</option>
                    <option value="Medicamento">Medicamento</option>
                    <option value="Concentrado">Concentrado</option>
                    <option value="OPME">OPME</option>
                    <option value="Descartáveis">Descartáveis</option>
                    <option value="Outros">Outros</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Almoxarifado/Setor Padrão</label>
                  <select 
                    className="form-control" value={itemForm.defaultSectorId}
                    onChange={e => setItemForm({ ...itemForm, defaultSectorId: e.target.value })}
                  >
                    {sectors.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label>Estoque Inicial</label>
                    <input 
                      type="number" className="form-control" disabled={editingItem !== null}
                      value={itemForm.currentStock} onChange={e => setItemForm({ ...itemForm, currentStock: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Estoque Mínimo *</label>
                    <input 
                      type="number" className="form-control" required
                      value={itemForm.minStock} onChange={e => setItemForm({ ...itemForm, minStock: e.target.value })}
                    />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label>Unidade de Medida</label>
                    <input 
                      type="text" className="form-control" placeholder="Ex: unidades, frascos"
                      value={itemForm.unit} onChange={e => setItemForm({ ...itemForm, unit: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Preço Unitário (R$)</label>
                    <input 
                      type="text" className="form-control" placeholder="0.00"
                      value={itemForm.price} onChange={e => setItemForm({ ...itemForm, price: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <div style={styles.modalFooter}>
                <button type="button" onClick={() => setShowItemModal(false)} className="btn btn-secondary">Cancelar</button>
                <button type="submit" disabled={actionLoading} className="btn btn-primary" style={{ backgroundColor: '#f59e0b' }}>
                  {actionLoading ? 'Salvando...' : 'Salvar Produto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Supplier Modal */}
      {showSupplierModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <div style={styles.modalHeader}>
              <h2>{editingSupplier ? 'Editar Fornecedor' : 'Cadastrar Novo Fornecedor'}</h2>
              <button onClick={() => setShowSupplierModal(false)} style={styles.modalCloseBtn}><X size={20} /></button>
            </div>
            <form onSubmit={handleSaveSupplier} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
              <div style={styles.modalForm}>
                <div className="form-group">
                  <label>Razão Social / Nome *</label>
                  <input 
                    type="text" className="form-control" placeholder="Ex: Baxter Hospitalar Ltda" required
                    value={supplierForm.name} onChange={e => setSupplierForm({ ...supplierForm, name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>CNPJ</label>
                  <input 
                    type="text" className="form-control" placeholder="00.000.000/0000-00"
                    value={supplierForm.cnpj} onChange={e => setSupplierForm({ ...supplierForm, cnpj: formatCnpj(e.target.value) })}
                  />
                </div>
                <div className="form-group">
                  <label>Pessoa de Contato</label>
                  <input 
                    type="text" className="form-control" placeholder="Ex: Carlos Silva"
                    value={supplierForm.contact} onChange={e => setSupplierForm({ ...supplierForm, contact: e.target.value })}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label>Telefone</label>
                    <input 
                      type="text" className="form-control" placeholder="(00) 0000-0000"
                      value={supplierForm.phone} onChange={e => setSupplierForm({ ...supplierForm, phone: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input 
                      type="email" className="form-control" placeholder="vendas@fornecedor.com"
                      value={supplierForm.email} onChange={e => setSupplierForm({ ...supplierForm, email: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <div style={styles.modalFooter}>
                <button type="button" onClick={() => setShowSupplierModal(false)} className="btn btn-secondary">Cancelar</button>
                <button type="submit" disabled={actionLoading} className="btn btn-primary" style={{ backgroundColor: '#f59e0b' }}>
                  {actionLoading ? 'Salvando...' : 'Salvar Fornecedor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sector Modal */}
      {showSectorModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <div style={styles.modalHeader}>
              <h2>{editingSector ? 'Editar Setor de Estoque' : 'Cadastrar Novo Setor de Estoque'}</h2>
              <button onClick={() => setShowSectorModal(false)} style={styles.modalCloseBtn}><X size={20} /></button>
            </div>
            <form onSubmit={handleSaveSector} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
              <div style={styles.modalForm}>
                <div className="form-group">
                  <label>Nome do Setor Físico *</label>
                  <input 
                    type="text" className="form-control" placeholder="Ex: Almoxarifado Central" required
                    value={sectorForm.name} onChange={e => setSectorForm({ ...sectorForm, name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Descrição / Finalidade</label>
                  <input 
                    type="text" className="form-control" placeholder="Depósito principal de insumos e medicamentos"
                    value={sectorForm.description} onChange={e => setSectorForm({ ...sectorForm, description: e.target.value })}
                  />
                </div>
              </div>
              <div style={styles.modalFooter}>
                <button type="button" onClick={() => setShowSectorModal(false)} className="btn btn-secondary">Cancelar</button>
                <button type="submit" disabled={actionLoading} className="btn btn-primary" style={{ backgroundColor: '#f59e0b' }}>
                  {actionLoading ? 'Salvando...' : 'Salvar Setor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manual Transaction Modal */}
      {showTxForm && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <div style={styles.modalHeader}>
              <h2>Lançar Movimentação Manual</h2>
              <button onClick={() => setShowTxForm(false)} style={styles.modalCloseBtn}><X size={20} /></button>
            </div>
            <form onSubmit={handleSaveTransaction} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
              <div style={styles.modalForm}>
                <div className="form-group">
                  <label>Item de Estoque *</label>
                  <select 
                    className="form-control" value={txForm.itemId}
                    onChange={e => setTxForm({ ...txForm, itemId: e.target.value })}
                  >
                    {items.map(i => <option key={i.id} value={i.id}>{i.name} (Saldo: {i.currentStock} {i.unit})</option>)}
                  </select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label>Tipo de Operação *</label>
                    <select 
                      className="form-control" value={txForm.type}
                      onChange={e => setTxForm({ ...txForm, type: e.target.value })}
                    >
                      <option value="Entrada">Entrada (Abastecimento)</option>
                      <option value="Saída">Saída (Consumo/Dispensação)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Quantidade *</label>
                    <input 
                      type="number" step="0.01" className="form-control" required placeholder="0"
                      value={txForm.quantity} onChange={e => setTxForm({ ...txForm, quantity: e.target.value })}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Setor Destino/Origem *</label>
                  <select 
                    className="form-control" value={txForm.sectorId}
                    onChange={e => setTxForm({ ...txForm, sectorId: e.target.value })}
                  >
                    {sectors.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label>Lote (se Entrada)</label>
                    <input 
                      type="text" className="form-control" placeholder="L-X100"
                      value={txForm.batch} onChange={e => setTxForm({ ...txForm, batch: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Validade (se Entrada)</label>
                    <input 
                      type="date" className="form-control"
                      value={txForm.expiryDate} onChange={e => setTxForm({ ...txForm, expiryDate: e.target.value })}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Operador Responsável *</label>
                  <input 
                    type="text" className="form-control" required
                    value={txForm.operator} onChange={e => setTxForm({ ...txForm, operator: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Observação / Justificativa</label>
                  <input 
                    type="text" className="form-control" placeholder="Ex: Dispensação para Sala 2"
                    value={txForm.notes} onChange={e => setTxForm({ ...txForm, notes: e.target.value })}
                  />
                </div>
              </div>
              <div style={styles.modalFooter}>
                <button type="button" onClick={() => setShowTxForm(false)} className="btn btn-secondary">Cancelar</button>
                <button type="submit" disabled={actionLoading} className="btn btn-primary" style={{ backgroundColor: '#f59e0b' }}>
                  {actionLoading ? 'Gravando...' : 'Gravar Movimentação'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* XML & PDF (DANFE) IMPORT WIZARD */}
      {showXmlWizard && (
        <div style={styles.modalOverlay}>
          <div style={{ ...styles.modalCard, maxWidth: '820px', width: '92%' }}>
            <div style={styles.modalHeader}>
              <h2>Importar Nota Fiscal Eletrônica (XML / PDF DANFE)</h2>
              <button onClick={() => setShowXmlWizard(false)} style={styles.modalCloseBtn}><X size={20} /></button>
            </div>
            
            <div style={styles.wizardStepsBar}>
              <div style={{ ...styles.wizardStep, ...(xmlWizardStep >= 1 ? styles.wizardStepActive : {}) }}>1. Arquivo</div>
              <div style={{ ...styles.wizardStep, ...(xmlWizardStep >= 2 ? styles.wizardStepActive : {}) }}>2. Fornecedor</div>
              <div style={{ ...styles.wizardStep, ...(xmlWizardStep >= 3 ? styles.wizardStepActive : {}) }}>3. Financeiro</div>
              <div style={{ ...styles.wizardStep, ...(xmlWizardStep >= 4 ? styles.wizardStepActive : {}) }}>4. Mapear Itens</div>
              <div style={{ ...styles.wizardStep, ...(xmlWizardStep >= 5 ? styles.wizardStepActive : {}) }}>5. Finalizar</div>
            </div>

            <div style={{ padding: '1.25rem 1.5rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column' }}>
              {/* STEP 1: Upload XML or PDF File */}
              {xmlWizardStep === 1 && (
                <div style={styles.xmlUploadArea}>
                  <UploadCloud size={48} color="#f59e0b" style={{ marginBottom: '1rem' }} />
                  <p style={{ fontWeight: '600', color: 'var(--text-primary)', margin: '0 0 0.5rem 0' }}>
                    Arraste ou clique para selecionar o arquivo XML (.xml) ou DANFE em PDF (.pdf)
                  </p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                    Compatível com XML padrão SEFAZ e DANFE em formato PDF
                  </p>
                  
                  <input 
                    type="file" 
                    accept=".xml,.pdf,application/pdf,text/xml" 
                    onChange={handleXmlUpload} 
                    id="xml-file-upload-input" 
                    style={{ display: 'none' }} 
                  />
                  <label htmlFor="xml-file-upload-input" className="btn btn-primary" style={{ backgroundColor: '#f59e0b', cursor: 'pointer', padding: '0.6rem 1.5rem' }}>
                    {actionLoading ? 'Processando Arquivo...' : 'Escolher Arquivo (XML ou PDF)'}
                  </label>

                  {xmlError && (
                    <div style={{ ...styles.alert, marginTop: '1rem', backgroundColor: 'var(--danger-light)', border: '1px solid var(--danger-color)', color: 'var(--danger-color)' }}>
                      <AlertTriangle size={18} />
                      <span>{xmlError}</span>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 2: Supplier Mapping */}
              {xmlWizardStep === 2 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={styles.infoSummaryBox}>
                    <h4>Dados do Documento ({xmlData?.sourceType || 'XML'})</h4>
                    <p>Nota Fiscal: <strong>{xmlData?.number}</strong></p>
                    <p>Chave: <strong>{xmlData?.accessKey || 'Não identificada no arquivo'}</strong></p>
                    <p>Valor Total: <strong>R$ {xmlData?.totalValue ? parseFloat(xmlData.totalValue).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '0,00'}</strong></p>
                  </div>
                  
                  <div style={styles.mappingCard}>
                    <h3>Emitente da Nota (Fornecedor)</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Nome no Documento: <strong>{xmlData?.supplierName}</strong></p>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>CNPJ: <strong>{formatCnpj(xmlData?.supplierCnpj)}</strong></p>
                    
                    {supplierMapping.exists ? (
                      <div style={{ ...styles.alert, backgroundColor: 'var(--success-light)', color: 'var(--success-color)', border: '1px solid var(--success-color)', marginTop: '0.75rem' }}>
                        <CheckCircle2 size={18} />
                        <span>Fornecedor vinculado: <strong>{supplierMapping.name}</strong></span>
                      </div>
                    ) : (
                      <div style={{ marginTop: '1rem', border: '1px solid #f59e0b', padding: '1rem', borderRadius: 'var(--border-radius-sm)', backgroundColor: 'rgba(245, 158, 11, 0.03)' }}>
                        <h4 style={{ color: '#f59e0b', marginBottom: '0.5rem' }}>Fornecedor Novo</h4>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>O fornecedor não está cadastrado. Confirme os dados abaixo para cadastrá-lo automaticamente:</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          <div className="form-group">
                            <label>Nome / Razão Social</label>
                            <input 
                              type="text" className="form-control" 
                              value={supplierMapping.name} onChange={e => setSupplierMapping({ ...supplierMapping, name: e.target.value })}
                            />
                          </div>
                          <div className="form-group">
                            <label>CNPJ</label>
                            <input 
                              type="text" className="form-control" disabled
                              value={supplierMapping.cnpj}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
                    <button type="button" onClick={() => setXmlWizardStep(1)} className="btn btn-secondary">Voltar</button>
                    <button type="button" onClick={handleConfirmSupplierMapping} className="btn btn-primary" style={{ backgroundColor: '#f59e0b' }}>
                      Avançar para Financeiro
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: Financial Review & Installments */}
              {xmlWizardStep === 3 && (() => {
                const installmentsList = xmlData?.installments || [];
                const sumInstallments = installmentsList.reduce((acc, inst) => acc + (parseFloat(inst.amount) || 0), 0);
                const totalInvoice = parseFloat(xmlData?.totalValue) || 0;
                const isDifference = Math.abs(sumInstallments - totalInvoice) > 0.05;

                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={styles.infoSummaryBox}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
                        <div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Nota Fiscal</span>
                          <strong>Nº {xmlData?.number || 'S/N'}</strong>
                        </div>
                        <div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Emissão</span>
                          <strong>{xmlData?.issueDate ? xmlData.issueDate.split('-').reverse().join('/') : 'Hoje'}</strong>
                        </div>
                        <div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Fornecedor</span>
                          <strong>{supplierMapping.name}</strong>
                        </div>
                        <div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Valor Total da Nota</span>
                          <strong style={{ color: '#0369a1', fontSize: '1.05rem' }}>
                            R$ {totalInvoice.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </strong>
                        </div>
                      </div>
                    </div>

                    <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-md)', padding: '1rem', backgroundColor: '#fff' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                        <div>
                          <h4 style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                            Faturas & Duplicatas (Contas a Pagar)
                          </h4>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            Confira ou edite as parcelas identificadas no arquivo que serão lançadas automaticamente no financeiro.
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={handleAddInstallment}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.35rem 0.65rem', borderRadius: '6px', border: '1px solid #0284c7', backgroundColor: '#f0f9ff', color: '#0284c7', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer' }}
                        >
                          <Plus size={14} /> Adicionar Parcela
                        </button>
                      </div>

                      <div style={{ overflowX: 'auto', border: '1px solid var(--border-color)', borderRadius: '6px', marginBottom: '0.75rem' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                          <thead style={{ backgroundColor: '#f8fafc', textAlign: 'left', borderBottom: '1px solid var(--border-color)' }}>
                            <tr>
                              <th style={{ padding: '0.5rem 0.75rem', width: '120px' }}>Parcela</th>
                              <th style={{ padding: '0.5rem 0.75rem', width: '180px' }}>Vencimento</th>
                              <th style={{ padding: '0.5rem 0.75rem' }}>Valor (R$)</th>
                              <th style={{ padding: '0.5rem 0.75rem', textAlign: 'center', width: '70px' }}>Ações</th>
                            </tr>
                          </thead>
                          <tbody>
                            {installmentsList.length === 0 ? (
                              <tr>
                                <td colSpan="4" style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                  Nenhuma parcela configurada. Clique em "+ Adicionar Parcela".
                                </td>
                              </tr>
                            ) : (
                              installmentsList.map((inst, idx) => (
                                <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                  <td style={{ padding: '0.4rem 0.75rem' }}>
                                    <input 
                                      type="text" 
                                      className="form-control"
                                      style={{ padding: '0.3rem 0.5rem', fontSize: '0.85rem', fontWeight: '600' }}
                                      value={inst.installmentNumber}
                                      onChange={e => handleUpdateInstallment(idx, 'installmentNumber', e.target.value)}
                                      placeholder="Ex: 1/2"
                                    />
                                  </td>
                                  <td style={{ padding: '0.4rem 0.75rem' }}>
                                    <input 
                                      type="date" 
                                      className="form-control"
                                      style={{ padding: '0.3rem 0.5rem', fontSize: '0.85rem' }}
                                      value={inst.dueDate}
                                      onChange={e => handleUpdateInstallment(idx, 'dueDate', e.target.value)}
                                    />
                                  </td>
                                  <td style={{ padding: '0.4rem 0.75rem' }}>
                                    <input 
                                      type="number" 
                                      step="0.01"
                                      className="form-control"
                                      style={{ padding: '0.3rem 0.5rem', fontSize: '0.85rem', fontWeight: '700' }}
                                      value={inst.amount}
                                      onChange={e => handleUpdateInstallment(idx, 'amount', e.target.value)}
                                    />
                                  </td>
                                  <td style={{ padding: '0.4rem 0.75rem', textAlign: 'center' }}>
                                    {installmentsList.length > 1 && (
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveInstallment(idx)}
                                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.2rem' }}
                                        title="Remover parcela"
                                      >
                                        <Trash2 size={16} />
                                      </button>
                                    )}
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>

                      {/* Totalization feedback banner */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc', padding: '0.6rem 0.85rem', borderRadius: '6px', fontSize: '0.85rem' }}>
                        <div>
                          <span>Soma das Parcelas: </span>
                          <strong style={{ fontSize: '0.95rem' }}>
                            R$ {sumInstallments.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </strong>
                        </div>
                        <div>
                          {!isDifference ? (
                            <span style={{ color: '#166534', fontWeight: '700', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                              <CheckCircle2 size={16} color="#166534" /> Total confere com o valor da nota
                            </span>
                          ) : (
                            <span style={{ color: '#b45309', fontWeight: '700', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                              <AlertTriangle size={16} color="#b45309" /> Diferença de R$ {Math.abs(sumInstallments - totalInvoice).toFixed(2)} em relação ao total da NF
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
                      <button type="button" onClick={() => setXmlWizardStep(2)} className="btn btn-secondary">Voltar</button>
                      <button type="button" onClick={() => setXmlWizardStep(4)} className="btn btn-primary" style={{ backgroundColor: '#f59e0b' }}>
                        Avançar para Mapear Itens
                      </button>
                    </div>
                  </div>
                );
              })()}

              {/* STEP 4: Mapeamento de Itens */}
              {xmlWizardStep === 4 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={styles.warningBanner}>
                    <AlertTriangle size={16} />
                    <span>Mapeie cada item da nota para um produto do catálogo. Selecione "[Criar como novo]" para incluí-lo automaticamente.</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {itemMappings.map((m, idx) => (
                      <div key={m.xmlCode + '-' + idx} style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-sm)', padding: '1rem', backgroundColor: '#fafafa' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '1rem', marginBottom: '0.75rem' }}>
                          <div>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Descrição na Nota (Cód: {m.xmlCode})</span>
                            <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>{m.xmlName}</span>
                            <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                              Quant: <strong>{m.quantity}</strong> | Preço: <strong>R$ {m.price?.toFixed(2)}</strong>
                            </span>
                          </div>
                          <div className="form-group">
                            <label>Produto no Catálogo *</label>
                            <select 
                              className="form-control"
                              value={m.mappedItemId}
                              onChange={e => handleMappingItemChange(m.xmlCode, e.target.value)}
                            >
                              <option value="CREATE_NEW">[Criar como novo item no estoque]</option>
                              {items.map(i => <option key={i.id} value={i.id}>{i.name} (Saldo: {i.currentStock})</option>)}
                            </select>
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                          <div className="form-group">
                            <label>Lote</label>
                            <input 
                              type="text" className="form-control" placeholder="Lote do item" style={{ padding: '0.35rem 0.5rem', fontSize: '0.8rem' }}
                              value={m.batch} onChange={e => handleMappingFieldChange(m.xmlCode, 'batch', e.target.value)}
                            />
                          </div>
                          <div className="form-group">
                            <label>Validade</label>
                            <input 
                              type="date" className="form-control" style={{ padding: '0.35rem 0.5rem', fontSize: '0.8rem' }}
                              value={m.expiryDate} onChange={e => handleMappingFieldChange(m.xmlCode, 'expiryDate', e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem' }}>
                    <button type="button" onClick={() => setXmlWizardStep(3)} className="btn btn-secondary">Voltar</button>
                    <button type="button" onClick={() => setXmlWizardStep(5)} className="btn btn-primary" style={{ backgroundColor: '#f59e0b' }}>
                      Revisar e Finalizar
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 5: Review and Finish */}
              {xmlWizardStep === 5 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <h3>Revisão Geral de Entrada da Nota Fiscal</h3>
                  
                  <div style={styles.infoSummaryBox}>
                    <p>Nota Fiscal: <strong>{xmlData?.number}</strong> ({xmlData?.sourceType || 'XML'})</p>
                    <p>Fornecedor: <strong>{supplierMapping.name}</strong> ({supplierMapping.cnpj})</p>
                    <p>Valor Total da Nota: <strong>R$ {xmlData?.totalValue ? parseFloat(xmlData.totalValue).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '0,00'}</strong></p>
                    {xmlData?.installments && xmlData.installments.length > 0 && (
                      <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px dashed #cbd5e1' }}>
                        <span style={{ fontWeight: '700', fontSize: '0.8rem', color: '#0369a1', display: 'block', marginBottom: '0.25rem' }}>
                          📅 Contas a Pagar a Gerar no Financeiro ({xmlData.installments.length} parcela(s)):
                        </span>
                        {xmlData.installments.map((inst, i) => (
                          <div key={i} style={{ fontSize: '0.75rem', color: '#334155' }}>
                            • Parcela <strong>{inst.installmentNumber}</strong>: Vencimento em <strong>{inst.dueDate ? inst.dueDate.split('-').reverse().join('/') : '30 dias'}</strong> — <strong>R$ {parseFloat(inst.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <h4 style={{ marginBottom: '0.5rem' }}>Itens a serem abastecidos no estoque:</h4>
                    <table style={styles.table}>
                      <thead>
                        <tr>
                          <th>Produto Catálogo</th>
                          <th>Quantidade</th>
                          <th>Preço Un.</th>
                          <th>Subtotal</th>
                          <th>Lote / Validade</th>
                        </tr>
                      </thead>
                      <tbody>
                        {itemMappings.map(m => {
                          const isNew = m.mappedItemId === 'CREATE_NEW';
                          const catItemName = isNew ? `[NOVO] ${m.xmlName}` : (items.find(i => i.id === m.mappedItemId)?.name || m.xmlName);
                          return (
                            <tr key={m.xmlCode}>
                              <td style={{ fontWeight: '600' }}>{catItemName}</td>
                              <td>{m.quantity}</td>
                              <td>R$ {m.price?.toFixed(2)}</td>
                              <td>R$ {(m.quantity * m.price).toFixed(2)}</td>
                              <td>{m.batch || 'N/A'} {m.expiryDate ? `(${new Date(m.expiryDate).toLocaleDateString('pt-BR')})` : ''}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem' }}>
                    <button type="button" onClick={() => setXmlWizardStep(4)} className="btn btn-secondary">Voltar</button>
                    <button type="button" onClick={handleFinishXmlWizard} disabled={actionLoading} className="btn btn-primary" style={{ backgroundColor: 'var(--success-color)' }}>
                      {actionLoading ? 'Abastecendo Estoque...' : 'Confirmar e Processar Entrada'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Loan Modal (Empréstimos de Produtos / Medicamentos) */}
      {showLoanModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <div style={styles.modalHeader}>
              <h2>{editingLoan ? 'Editar Empréstimo' : 'Cadastrar Empréstimo de Produto / Medicamento'}</h2>
              <button onClick={() => setShowLoanModal(false)} style={styles.modalCloseBtn}><X size={20} /></button>
            </div>
            <form onSubmit={handleSaveLoan} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
              <div style={styles.modalForm}>
                <div className="form-group">
                  <label style={{ fontWeight: '600', marginBottom: '0.25rem', display: 'block' }}>Tipo de Empréstimo *</label>
                  <select 
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                    value={loanForm.type}
                    onChange={e => setLoanForm({ ...loanForm, type: e.target.value })}
                  >
                    <option value="Concedido">📤 Concedido (Estoque Próprio Emprestado para Terceiros)</option>
                    <option value="Recebido">📥 Recebido (Empréstimo Recebido de Outra Clínica / Hospital)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label style={{ fontWeight: '600', marginBottom: '0.25rem', display: 'block' }}>Produto / Medicamento Emprestado *</label>
                  <input 
                    type="text"
                    list="product-suggestions"
                    placeholder="Ex: Erythropoietin 4000UI / Dialisador Capilar"
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                    value={loanForm.productName}
                    onChange={e => setLoanForm({ ...loanForm, productName: e.target.value })}
                    required
                  />
                  <datalist id="product-suggestions">
                    {items.map(i => <option key={i.id} value={i.name} />)}
                  </datalist>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label style={{ fontWeight: '600', marginBottom: '0.25rem', display: 'block' }}>Quantidade *</label>
                    <input 
                      type="number"
                      min="1"
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                      value={loanForm.quantity}
                      onChange={e => setLoanForm({ ...loanForm, quantity: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label style={{ fontWeight: '600', marginBottom: '0.25rem', display: 'block' }}>Unidade de Medida</label>
                    <select 
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                      value={loanForm.unit}
                      onChange={e => setLoanForm({ ...loanForm, unit: e.target.value })}
                    >
                      <option value="Caixa(s)">Caixa(s)</option>
                      <option value="Unidade(s)">Unidade(s)</option>
                      <option value="Ampola(s)">Ampola(s)</option>
                      <option value="Frasco(s)">Frasco(s)</option>
                      <option value="Kit(s)">Kit(s)</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label style={{ fontWeight: '600', marginBottom: '0.25rem', display: 'block' }}>Instituição / Clínica Parceira *</label>
                  <input 
                    type="text"
                    placeholder="Ex: Hospital São Lucas / Clínica NefroVida"
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                    value={loanForm.partnerName}
                    onChange={e => setLoanForm({ ...loanForm, partnerName: e.target.value })}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label style={{ fontWeight: '600', marginBottom: '0.25rem', display: 'block' }}>Data do Empréstimo</label>
                    <input 
                      type="date"
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                      value={loanForm.loanDate}
                      onChange={e => setLoanForm({ ...loanForm, loanDate: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label style={{ fontWeight: '600', marginBottom: '0.25rem', display: 'block' }}>Previsão de Devolução</label>
                    <input 
                      type="date"
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                      value={loanForm.expectedReturnDate}
                      onChange={e => setLoanForm({ ...loanForm, expectedReturnDate: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label style={{ fontWeight: '600', marginBottom: '0.25rem', display: 'block' }}>Observações / Termo de Acordo</label>
                  <input 
                    type="text"
                    placeholder="Ex: Empréstimo emergencial autorizado pelo almoxarifado central"
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                    value={loanForm.notes}
                    onChange={e => setLoanForm({ ...loanForm, notes: e.target.value })}
                  />
                </div>
              </div>

              <div style={styles.modalFooter}>
                <button type="button" onClick={() => setShowLoanModal(false)} className="btn btn-secondary">Cancelar</button>
                <button type="submit" disabled={actionLoading} className="btn btn-primary" style={{ backgroundColor: 'var(--primary-color)' }}>
                  {actionLoading ? 'Salvando...' : (editingLoan ? 'Salvar Alterações' : 'Cadastrar Empréstimo')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Physical Inventory Opening Modal */}
      {showInventoryModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <div style={styles.modalHeader}>
              <h2>Abrir Novo Inventário Físico</h2>
              <button onClick={() => setShowInventoryModal(false)} style={styles.modalCloseBtn}><X size={20} /></button>
            </div>
            <form onSubmit={handleSaveInventory} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
              <div style={styles.modalForm}>
                <div className="form-group">
                  <label style={{ fontWeight: '600', marginBottom: '0.25rem', display: 'block' }}>Título do Inventário *</label>
                  <input 
                    type="text"
                    required
                    placeholder="Ex: Inventário Mensal - Farmácia da Diálise - Julho/2026"
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                    value={inventoryForm.title}
                    onChange={e => setInventoryForm({ ...inventoryForm, title: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label style={{ fontWeight: '600', marginBottom: '0.25rem', display: 'block' }}>Local de Estoque Auditado *</label>
                  <select
                    required
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                    value={inventoryForm.locationId}
                    onChange={e => setInventoryForm({ ...inventoryForm, locationId: e.target.value })}
                  >
                    {stockLocations.map(loc => (
                      <option key={loc.id} value={loc.id}>{loc.name} ({loc.responsible || 'Sem responsável'})</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label style={{ fontWeight: '600', marginBottom: '0.25rem', display: 'block' }}>Observações do Auditor</label>
                  <textarea 
                    rows="2"
                    placeholder="Observações ou instruções da auditoria física..."
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                    value={inventoryForm.notes}
                    onChange={e => setInventoryForm({ ...inventoryForm, notes: e.target.value })}
                  />
                </div>
              </div>

              <div style={styles.modalFooter}>
                <button type="button" onClick={() => setShowInventoryModal(false)} className="btn btn-secondary">Cancelar</button>
                <button type="submit" disabled={actionLoading} className="btn btn-primary" style={{ backgroundColor: 'var(--primary-color)' }}>
                  {actionLoading ? 'Criando...' : 'Iniciar Contagem'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Physical Count & Divergence Modal */}
      {showCountModal && countingInventory && (
        <div style={styles.modalOverlay}>
          <div style={{ ...styles.modalCard, maxWidth: '900px' }}>
            <div style={styles.modalHeader}>
              <div>
                <h2 style={{ margin: 0 }}>📋 {countingInventory.title}</h2>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Local: <strong>{countingInventory.locationName}</strong> | Status: <strong style={{ color: countingInventory.status === 'Concluído' ? '#166534' : '#92400e' }}>{countingInventory.status}</strong>
                </span>
              </div>
              <button onClick={() => setShowCountModal(false)} style={styles.modalCloseBtn}><X size={20} /></button>
            </div>

            <div style={{ padding: '1.25rem 1.5rem', overflowY: 'auto', flex: 1 }}>
              <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-primary)' }}>📊 Relatório de Divergências & Contagem Física</h4>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Digite a quantidade física contada na prateleira. O sistema exibirá o cálculo automático da sobra/falta.
                  </span>
                </div>
                {countingInventory.status !== 'Concluído' && (
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button type="button" onClick={handleSaveCountDraft} disabled={actionLoading} className="btn btn-secondary">
                      Salvar Rascunho
                    </button>
                    <button type="button" onClick={handleFinalizeInventorySubmit} disabled={actionLoading} className="btn btn-primary" style={{ backgroundColor: '#10b981' }}>
                      <CheckCircle2 size={16} /> Concluir & Ajustar Saldos
                    </button>
                  </div>
                )}
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th>Produto / Insumo</th>
                      <th>Saldo no Sistema</th>
                      <th>Contagem Física (Digitada)</th>
                      <th>Divergência (Falta / Sobra)</th>
                      <th>Preço Un.</th>
                      <th>Impacto Financeiro R$</th>
                    </tr>
                  </thead>
                  <tbody>
                    {countItems.map((item) => {
                      const sysVal = parseFloat(item.systemCount) || 0;
                      const physVal = parseFloat(item.physicalCount) || 0;
                      const diff = physVal - sysVal;
                      const unitPrice = parseFloat(item.price) || 0;
                      const financialDiff = diff * unitPrice;

                      return (
                        <tr key={item.itemId}>
                          <td style={{ fontWeight: '600' }}>
                            {item.itemName}
                            <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.category || 'Insumo'}</span>
                          </td>
                          <td style={{ fontWeight: '600' }}>{sysVal} {item.unit || 'un'}</td>
                          <td>
                            {countingInventory.status === 'Concluído' ? (
                              <span style={{ fontWeight: '700' }}>{physVal} {item.unit || 'un'}</span>
                            ) : (
                              <input 
                                type="number" 
                                className="form-control"
                                style={{ width: '100px', fontWeight: '700', padding: '0.35rem 0.5rem' }}
                                value={item.physicalCount} 
                                onChange={e => handleUpdatePhysicalCount(item.itemId, e.target.value)}
                              />
                            )}
                          </td>
                          <td>
                            {diff === 0 ? (
                              <span style={{ color: '#166534', fontWeight: '600' }}>✓ Sem divergência (0)</span>
                            ) : diff > 0 ? (
                              <span style={{ color: '#2563eb', fontWeight: '700' }}>⬆ Sobra de +{diff} {item.unit || 'un'}</span>
                            ) : (
                              <span style={{ color: '#dc2626', fontWeight: '700' }}>⬇ Falta de {diff} {item.unit || 'un'}</span>
                            )}
                          </td>
                          <td>R$ {unitPrice.toFixed(2)}</td>
                          <td style={{ fontWeight: '700', color: financialDiff < 0 ? '#dc2626' : financialDiff > 0 ? '#2563eb' : 'var(--text-primary)' }}>
                            {financialDiff === 0 ? 'R$ 0,00' : `${financialDiff > 0 ? '+' : ''}R$ ${financialDiff.toFixed(2)}`}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div style={styles.modalFooter}>
              <button type="button" onClick={() => setShowCountModal(false)} className="btn btn-secondary">Fechar</button>
            </div>
          </div>
        </div>
      )}

      {/* Stock Transfer Modal */}
      {showTransferModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <div style={styles.modalHeader}>
              <h2>🔄 Nova Transferência Entre Locais de Estoque</h2>
              <button onClick={() => setShowTransferModal(false)} style={styles.modalCloseBtn}><X size={20} /></button>
            </div>
            <form onSubmit={handleSaveTransfer} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
              <div style={styles.modalForm}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label style={{ fontWeight: '600', marginBottom: '0.25rem', display: 'block' }}>Local de Origem (Saída) *</label>
                    <select 
                      required
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                      value={transferForm.originLocationId}
                      onChange={e => setTransferForm({ ...transferForm, originLocationId: e.target.value })}
                    >
                      {stockLocations.map(loc => (
                        <option key={loc.id} value={loc.id}>{loc.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label style={{ fontWeight: '600', marginBottom: '0.25rem', display: 'block' }}>Local de Destino (Entrada) *</label>
                    <select 
                      required
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                      value={transferForm.destinationLocationId}
                      onChange={e => setTransferForm({ ...transferForm, destinationLocationId: e.target.value })}
                    >
                      {stockLocations.map(loc => (
                        <option key={loc.id} value={loc.id}>{loc.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label style={{ fontWeight: '600', marginBottom: '0.25rem', display: 'block' }}>Produto / Insumo *</label>
                  <select 
                    required
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                    value={transferForm.itemId}
                    onChange={e => setTransferForm({ ...transferForm, itemId: e.target.value })}
                  >
                    {items.map(i => (
                      <option key={i.id} value={i.id}>{i.name} (Saldo Atual: {i.currentStock} {i.unit})</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label style={{ fontWeight: '600', marginBottom: '0.25rem', display: 'block' }}>Quantidade *</label>
                    <input 
                      type="number"
                      min="1"
                      required
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                      value={transferForm.quantity}
                      onChange={e => setTransferForm({ ...transferForm, quantity: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label style={{ fontWeight: '600', marginBottom: '0.25rem', display: 'block' }}>Lote</label>
                    <input 
                      type="text"
                      placeholder="Lote do produto"
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                      value={transferForm.batch}
                      onChange={e => setTransferForm({ ...transferForm, batch: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label style={{ fontWeight: '600', marginBottom: '0.25rem', display: 'block' }}>Validade</label>
                    <input 
                      type="date"
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                      value={transferForm.expiryDate}
                      onChange={e => setTransferForm({ ...transferForm, expiryDate: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label style={{ fontWeight: '600', marginBottom: '0.25rem', display: 'block' }}>Observações da Transferência</label>
                  <input 
                    type="text"
                    placeholder="Ex: Abastecimento de materiais da Farmácia da Diálise para o turno da manhã"
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                    value={transferForm.notes}
                    onChange={e => setTransferForm({ ...transferForm, notes: e.target.value })}
                  />
                </div>
              </div>

              <div style={styles.modalFooter}>
                <button type="button" onClick={() => setShowTransferModal(false)} className="btn btn-secondary">Cancelar</button>
                <button type="submit" disabled={actionLoading} className="btn btn-primary" style={{ backgroundColor: 'var(--primary-color)' }}>
                  {actionLoading ? 'Transferindo...' : 'Efetuar Transferência'}
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
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '1rem',
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
    marginBottom: '0.25rem',
  },
  subtitle: {
    fontSize: '0.875rem',
    color: 'var(--text-secondary)',
  },
  tabsWrapper: {
    display: 'flex',
    gap: '0.25rem',
    borderBottom: '2px solid var(--border-color)',
    paddingBottom: '2px',
    flexWrap: 'wrap',
  },
  tabBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: 'none',
    border: 'none',
    padding: '0.75rem 1rem',
    fontSize: '0.85rem',
    fontWeight: '600',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    borderBottom: '2px solid transparent',
    marginBottom: '-2px',
    transition: 'all 0.15s ease',
  },
  tabBtnActive: {
    color: '#f59e0b',
    borderBottomColor: '#f59e0b',
  },
  alert: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '1rem',
    borderRadius: 'var(--border-radius-sm)',
    fontSize: '0.9rem',
  },
  warningBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    backgroundColor: 'var(--danger-light)',
    padding: '0.75rem 1rem',
    borderRadius: 'var(--border-radius-sm)',
    color: 'var(--danger-color)',
    fontSize: '0.875rem',
    borderLeft: '4px solid var(--danger-color)',
    fontWeight: '600',
  },
  filtersBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '1rem',
    flexWrap: 'wrap',
  },
  searchWrapper: {
    position: 'relative',
    flex: '1 1 300px',
    display: 'flex',
    alignItems: 'center',
  },
  searchIcon: {
    position: 'absolute',
    left: '0.75rem',
    color: 'var(--text-muted)',
  },
  searchInput: {
    width: '100%',
    padding: '0.625rem 0.625rem 0.625rem 2.5rem',
    borderRadius: 'var(--border-radius-sm)',
    border: '1px solid var(--border-color)',
    fontSize: '0.875rem',
  },
  selectsWrapper: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap',
  },
  filterSelect: {
    padding: '0.625rem 1.75rem 0.625rem 0.75rem',
    borderRadius: 'var(--border-radius-sm)',
    border: '1px solid var(--border-color)',
    backgroundColor: '#fff',
    fontSize: '0.875rem',
    cursor: 'pointer',
  },
  txBtn: {
    padding: '0.625rem 1.25rem',
    fontSize: '0.875rem',
    fontWeight: '600',
    backgroundColor: '#fff',
    border: '1px solid #f59e0b',
    color: '#f59e0b',
    borderRadius: 'var(--border-radius-sm)',
    cursor: 'pointer',
    transition: 'background-color 0.15s ease',
  },
  addBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.625rem 1.25rem',
    fontSize: '0.875rem',
    fontWeight: '600',
    backgroundColor: '#f59e0b',
    color: '#fff',
    border: 'none',
    borderRadius: 'var(--border-radius-sm)',
    cursor: 'pointer',
    transition: 'filter 0.15s ease',
  },
  loadingBox: {
    textAlign: 'center',
    padding: '3rem',
    color: 'var(--text-muted)',
    fontSize: '1rem',
  },
  tableWrapper: {
    backgroundColor: '#fff',
    borderRadius: 'var(--border-radius-md)',
    border: '1px solid var(--border-color)',
    overflowX: 'auto',
    boxShadow: 'var(--shadow-sm)',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
    fontSize: '0.875rem',
  },
  noDataCell: {
    textAlign: 'center',
    padding: '3rem',
    color: 'var(--text-muted)',
  },
  rowWarning: {
    backgroundColor: 'rgba(239, 68, 68, 0.02)',
  },
  categoryBadge: {
    fontSize: '0.75rem',
    padding: '0.15rem 0.5rem',
    borderRadius: '4px',
    backgroundColor: '#f1f5f9',
    color: 'var(--text-secondary)',
    fontWeight: '600',
  },
  badgeCritical: {
    fontSize: '0.75rem',
    padding: '0.15rem 0.5rem',
    borderRadius: '4px',
    backgroundColor: 'var(--danger-light)',
    color: 'var(--danger-color)',
    fontWeight: '700',
  },
  badgeNormal: {
    fontSize: '0.75rem',
    padding: '0.15rem 0.5rem',
    borderRadius: '4px',
    backgroundColor: 'var(--success-light)',
    color: 'var(--success-color)',
    fontWeight: '700',
  },
  actionEditBtn: {
    background: 'none',
    border: '1px solid var(--border-color)',
    borderRadius: '4px',
    padding: '0.35rem 0.6rem',
    cursor: 'pointer',
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
    fontWeight: '600',
  },
  expiryLabel: {
    fontSize: '0.8rem',
    fontWeight: '700',
  },
  txTypeBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    fontSize: '0.75rem',
    padding: '0.15rem 0.5rem',
    borderRadius: '4px',
    border: '1px solid transparent',
    fontWeight: '700',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    padding: '1rem',
    backdropFilter: 'blur(4px)',
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 'var(--border-radius-lg)',
    width: '100%',
    maxWidth: '520px',
    maxHeight: '88vh',
    boxShadow: 'var(--shadow-lg)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.25rem 1.5rem',
    borderBottom: '1px solid var(--border-color)',
    flexShrink: 0,
    backgroundColor: '#fff',
  },
  modalCloseBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--text-secondary)',
  },
  modalForm: {
    padding: '1.25rem 1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    overflowY: 'auto',
    flex: 1,
  },
  modalFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.5rem',
    borderTop: '1px solid var(--border-color)',
    padding: '1rem 1.5rem',
    marginTop: 'auto',
    backgroundColor: '#fff',
    position: 'sticky',
    bottom: 0,
    zIndex: 10,
    flexShrink: 0,
  },
  // Wizard elements
  wizardStepsBar: {
    display: 'flex',
    borderBottom: '1px solid var(--border-color)',
    backgroundColor: '#f8fafc',
  },
  wizardStep: {
    flex: 1,
    textAlign: 'center',
    padding: '0.75rem',
    fontSize: '0.8rem',
    fontWeight: '600',
    color: 'var(--text-muted)',
    borderBottom: '2px solid transparent',
  },
  wizardStepActive: {
    color: '#f59e0b',
    borderBottomColor: '#f59e0b',
  },
  xmlUploadArea: {
    border: '2px dashed rgba(245, 158, 11, 0.3)',
    borderRadius: 'var(--border-radius-md)',
    padding: '3rem 2rem',
    textAlign: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.02)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    cursor: 'pointer',
  },
  infoSummaryBox: {
    backgroundColor: '#f8fafc',
    border: '1px solid var(--border-color)',
    padding: '1rem',
    borderRadius: 'var(--border-radius-sm)',
    fontSize: '0.85rem',
    lineHeight: '1.5',
  },
  mappingCard: {
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--border-radius-md)',
    padding: '1.25rem',
    backgroundColor: '#fff',
    boxShadow: 'var(--shadow-sm)',
  }
};
