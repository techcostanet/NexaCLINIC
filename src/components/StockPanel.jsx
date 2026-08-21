import React, { useState, useEffect } from 'react';
import { dbService } from '../firebase';
import { 
  Package, Boxes, Clock, Calendar, Plus, Search, 
  X, FileText, UploadCloud, Briefcase, Warehouse,
  CheckCircle2, AlertTriangle, AlertCircle, ArrowUpRight, ArrowDownLeft, Trash2, Edit,
  ArrowUpDown, ArrowUp, ArrowDown, RefreshCw, Send, ClipboardList, Repeat,
  AlignJustify, Table, LayoutGrid, Building2, ShoppingCart, Layers, DollarSign
} from 'lucide-react';

import { useStockLogic } from './Stock/hooks/useStockLogic';
import StockReportsModal from './StockReportsModal';

export const formatCurrencyBR = (val) => {
  const num = parseFloat(val) || 0;
  return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

export const formatNumberBR = (val, decimals = 2) => {
  const num = parseFloat(val) || 0;
  return num.toLocaleString('pt-BR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
};

export default function StockPanel({ currentUser, isReportsOpen, setIsReportsOpen }) {
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
    productBatches,
    setProductBatches,
    productKits,
    setProductKits,
    kitSort,
    setKitSort,
    showKitModal,
    setShowKitModal,
    editingKit,
    setEditingKit,
    kitForm,
    setKitForm,
    handleOpenKitAdd,
    handleOpenKitEdit,
    handleKitItemAdd,
    handleKitItemRemove,
    handleKitItemQtyChange,
    handleSaveKit,
    handleDeleteKit,
    handleDeleteBatch,
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
    handleFulfillBatchChange,
    handleFulfillManualBatchChange,
    handleFillAllRequestedQuantity,
    handleProcessFulfillment,
    traceabilitySearchTerm,
    setTraceabilitySearchTerm,
    traceabilityResult,
    setTraceabilityResult,
    traceabilityLoading,
    handleSearchTraceability,
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

  // View Mode: 'compact' (Padrão) | 'normal' | 'cards'
  const [productViewMode, setProductViewMode] = useState('compact');

  return (
    <div style={styles.container}>
      {/* Header / Hero Section (Design Padrão Nexa) */}
      <div style={styles.heroSection}>
        <div style={styles.heroLeft}>
          <div style={styles.heroIconBadge}>
            <Boxes size={28} color="#fff" />
          </div>
          <div>
            <h1 style={styles.heroTitle}>NexaSTOCK — Estoque & Farmácia Hospitalar</h1>
            <p style={styles.heroSubtitle}>
              Gestão de suprimentos, lotes FEFO, dispensação clínica, transferências entre setores e controle de rastreabilidade.
            </p>
          </div>
        </div>

        <div style={styles.heroActions}>
          <button 
            onClick={handleOpenAddModal}
            style={styles.primaryHeroBtn}
            title="Cadastrar Novo Insumo"
          >
            <Plus size={18} />
            <span>Cadastrar Insumo</span>
          </button>
        </div>
      </div>

      {/* Main Tabs */}
      <div style={styles.tabsWrapper}>
        <button 
          onClick={() => setActiveTab('inventory')} 
          style={{ ...styles.tabBtn, ...(activeTab === 'inventory' ? styles.tabBtnActive : {}) }}
        >
          <Boxes size={16} /> Catálogo ({(items || []).length})
        </button>
        <button 
          onClick={() => setActiveTab('kits')} 
          style={{ ...styles.tabBtn, ...(activeTab === 'kits' ? styles.tabBtnActive : {}) }}
        >
          <Package size={16} /> Kits ({(productKits || []).length})
        </button>
        <button 
          onClick={() => setActiveTab('physical_inventory')} 
          style={{ ...styles.tabBtn, ...(activeTab === 'physical_inventory' ? styles.tabBtnActive : {}) }}
        >
          <ClipboardList size={16} /> Inventários ({(inventories || []).length})
        </button>
        <button 
          onClick={() => setActiveTab('transfers')} 
          style={{ ...styles.tabBtn, ...(activeTab === 'transfers' ? styles.tabBtnActive : {}) }}
        >
          <Repeat size={16} /> Transferências ({(transfers || []).length})
        </button>
        <button 
          onClick={() => setActiveTab('invoices')} 
          style={{ ...styles.tabBtn, ...(activeTab === 'invoices' ? styles.tabBtnActive : {}) }}
        >
          <FileText size={16} /> Entradas ({(invoices || []).length})
        </button>
        <button 
          onClick={() => setActiveTab('transactions')} 
          style={{ ...styles.tabBtn, ...(activeTab === 'transactions' ? styles.tabBtnActive : {}) }}
        >
          <Clock size={16} /> Movimentações
        </button>
        <button 
          onClick={() => setActiveTab('expiry')} 
          style={{ ...styles.tabBtn, ...(activeTab === 'expiry' ? styles.tabBtnActive : {}) }}
        >
          <Calendar size={16} /> Validade ({(productBatches || []).length > 0 ? (productBatches || []).length : (expiryList || []).length})
        </button>
        <button 
          onClick={() => setActiveTab('loans')} 
          style={{ ...styles.tabBtn, ...(activeTab === 'loans' ? styles.tabBtnActive : {}) }}
        >
          <RefreshCw size={16} /> Empréstimos ({(loans || []).length})
        </button>
        <button 
          onClick={() => setActiveTab('requisitions')} 
          style={{ ...styles.tabBtn, ...(activeTab === 'requisitions' ? styles.tabBtnActive : {}) }}
        >
          <Send size={16} /> Requisições ({(requisitions || []).filter(r => r && (r.status === 'Pendente' || r.status === 'Parcial')).length > 0 ? `${(requisitions || []).filter(r => r && (r.status === 'Pendente' || r.status === 'Parcial')).length} Pendente(s)` : (requisitions || []).length})
        </button>
        <button 
          onClick={() => { setActiveTab('traceability'); if (traceabilitySearchTerm) handleSearchTraceability(); }} 
          style={{ ...styles.tabBtn, ...(activeTab === 'traceability' ? styles.tabBtnActive : {}) }}
        >
          <Search size={16} /> Rastreabilidade
        </button>
      </div>

      {/* Message feedback */}
      {message.text && (
        <div style={{ ...styles.alert, backgroundColor: `var(--${message.type}-light)`, border: `1px solid var(--${message.type}-color)` }}>
          <AlertCircle size={18} color={`var(--${message.type}-color)`} />
          <span style={{ color: `var(--${message.type}-color)`, fontWeight: '600' }}>{message.text}</span>
        </div>
      )}

      {/* Filters and Search */}
      {activeTab !== 'physical_inventory' && activeTab !== 'transfers' && activeTab !== 'requisitions' && (
        <div style={styles.filtersBar}>
          <div style={styles.searchWrapper}>
            <Search size={18} style={styles.searchIcon} />
            <input 
              type="text" 
              placeholder={activeTab === 'invoices' ? "Buscar por número da NF, fornecedor..." : activeTab === 'kits' ? "Buscar kit por nome, código, composição..." : activeTab === 'suppliers' ? "Buscar fornecedor..." : activeTab === 'sectors' ? "Buscar setor..." : activeTab === 'loans' ? "Buscar por produto, parceiro..." : activeTab === 'expiry' ? "Buscar por insumo ou lote..." : "Buscar insumo por nome..."} 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)} 
              style={styles.searchInput}
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} style={{ position: 'absolute', right: '0.75rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={14} />
              </button>
            )}
          </div>

          <div style={styles.selectsWrapper}>
            {activeTab === 'inventory' && (
              <select 
                value={filterCategory} 
                onChange={e => setFilterCategory(e.target.value)}
                style={styles.filterSelect}
              >
                <option value="">Todas as Categorias</option>
                {categoriesList.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
            )}

            {/* View Mode Segmented Controls for Inventory */}
            {activeTab === 'inventory' && (
              <div style={{ display: 'inline-flex', alignItems: 'center', backgroundColor: 'var(--bg-body)', padding: '0.2rem', borderRadius: '8px', border: '1px solid var(--border-color)', gap: '0.2rem' }}>
                <button 
                  type="button"
                  onClick={() => setProductViewMode('compact')} 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.35rem 0.65rem',
                    borderRadius: '6px',
                    fontSize: '0.78rem',
                    fontWeight: '600',
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor: productViewMode === 'compact' ? '#f59e0b' : 'transparent',
                    color: productViewMode === 'compact' ? '#fff' : 'var(--text-secondary)',
                    transition: 'all 0.15s ease'
                  }}
                  title="Visualização Compacta (Padrão)"
                >
                  <AlignJustify size={14} /> Compacta
                </button>
                <button 
                  type="button"
                  onClick={() => setProductViewMode('normal')} 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.35rem 0.65rem',
                    borderRadius: '6px',
                    fontSize: '0.78rem',
                    fontWeight: '600',
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor: productViewMode === 'normal' ? '#f59e0b' : 'transparent',
                    color: productViewMode === 'normal' ? '#fff' : 'var(--text-secondary)',
                    transition: 'all 0.15s ease'
                  }}
                  title="Visualização Normal / Detalhada"
                >
                  <Table size={14} /> Normal
                </button>
                <button 
                  type="button"
                  onClick={() => setProductViewMode('cards')} 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.35rem 0.65rem',
                    borderRadius: '6px',
                    fontSize: '0.78rem',
                    fontWeight: '600',
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor: productViewMode === 'cards' ? '#f59e0b' : 'transparent',
                    color: productViewMode === 'cards' ? '#fff' : 'var(--text-secondary)',
                    transition: 'all 0.15s ease'
                  }}
                  title="Visualização em Grade de Cards"
                >
                  <LayoutGrid size={14} /> Cards
                </button>
              </div>
            )}

            {activeTab === 'inventory' && (
              <button onClick={handleOpenAddModal} className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#f59e0b' }}>
                <Plus size={16} /> Cadastrar Insumo
              </button>
            )}

            {activeTab === 'kits' && (
              <button onClick={handleOpenKitAdd} className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#f59e0b' }}>
                <Plus size={16} /> Novo Kit
              </button>
            )}

            {activeTab === 'suppliers' && (
              <button onClick={handleOpenSupplierAdd} className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#f59e0b' }}>
                <Plus size={16} /> Novo Fornecedor
              </button>
            )}

            {activeTab === 'sectors' && (
              <button onClick={handleOpenSectorAdd} className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#f59e0b' }}>
                <Plus size={16} /> Novo Setor
              </button>
            )}

            {activeTab === 'loans' && (
              <button onClick={handleOpenLoanAdd} className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#0284c7' }}>
                <Plus size={16} /> Novo Empréstimo
              </button>
            )}

            {activeTab === 'transactions' && (
              <button onClick={handleOpenTxForm} className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#f59e0b' }}>
                <Plus size={16} /> Nova Movimentação
              </button>
            )}

            {activeTab === 'invoices' && (
              <button onClick={() => { setXmlWizardStep(1); setShowXmlWizard(true); }} className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#f59e0b' }}>
                <UploadCloud size={16} /> Importar NF-e (XML / PDF)
              </button>
            )}
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          <RefreshCw size={28} className="spin" style={{ marginBottom: '0.5rem' }} />
          <p>Carregando dados do estoque...</p>
        </div>
      ) : (
        <>
          {/* TAB 1: Inventory Catalogue */}
          {activeTab === 'inventory' && (() => {
            const sortedItems = sortData(filteredItems, inventorySort);

            return (
              <div>
                {/* 1. VIEW MODE: COMPACTA (PADRÃO) */}
                {productViewMode === 'compact' && (
                  <div style={styles.tableWrapper}>
                    <table style={styles.table}>
                      <thead>
                        <tr>
                          {renderSortHeader('Item de Insumo', 'name', inventorySort, setInventorySort)}
                          {renderSortHeader('Categoria', 'category', inventorySort, setInventorySort)}
                          <th style={styles.th}>Rastreável</th>
                          {renderSortHeader('Estoque Atual', 'currentStock', inventorySort, setInventorySort)}
                          {renderSortHeader('Mínimo', 'minStock', inventorySort, setInventorySort)}
                          <th style={styles.th}>Status</th>
                          {renderSortHeader('Preço Unitário', 'price', inventorySort, setInventorySort)}
                          <th style={styles.th}>Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sortedItems.length === 0 ? (
                          <tr>
                            <td colSpan="8" style={styles.noDataCell}>Nenhum insumo encontrado no catálogo.</td>
                          </tr>
                        ) : (
                          sortedItems.map((item, idx) => {
                            const currentVal = parseFloat(item?.currentStock) || 0;
                            const minVal = parseFloat(item?.minStock) || 0;
                            const isLow = currentVal <= minVal;
                            const itemPrice = parseFloat(item?.price) || 0;
                            const hasLote = !!item?.hasBatchControl;

                            return (
                              <tr key={item?.id || idx} style={{ height: '36px', ...(isLow ? styles.rowWarning : {}) }}>
                                <td onClick={() => handleOpenEditModal(item)} style={{ fontWeight: '700', color: isLow ? '#b91c1c' : 'var(--text-primary)', cursor: 'pointer', padding: '0.35rem 0.5rem' }} title="Clique para editar">
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                                    <Package size={14} color={item?.isControlled ? '#dc2626' : '#f59e0b'} />
                                    <span>{item?.name || 'Insumo Sem Nome'}</span>
                                    {item?.isControlled && (
                                      <span style={{ backgroundColor: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca', padding: '0.05rem 0.35rem', borderRadius: '4px', fontSize: '0.65rem', fontWeight: '700' }}>
                                        🔒 Controlado
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td style={{ padding: '0.35rem 0.5rem' }}>
                                  <span style={styles.categoryBadge}>{item?.category || 'Geral'}</span>
                                </td>
                                <td style={{ padding: '0.35rem 0.5rem' }}>
                                  {hasLote ? (
                                    <span style={{ backgroundColor: '#e0f2fe', color: '#0369a1', padding: '0.1rem 0.4rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '700' }}>
                                      ✓ Lote
                                    </span>
                                  ) : (
                                    <span style={{ color: '#9ca3af', fontSize: '0.7rem' }}>Geral</span>
                                  )}
                                </td>
                                <td style={{ fontWeight: '700', color: isLow ? 'var(--danger-color)' : 'var(--text-primary)', padding: '0.35rem 0.5rem' }}>
                                  {currentVal} {item?.unit || 'un'}
                                </td>
                                <td style={{ padding: '0.35rem 0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                  {minVal} {item?.unit || 'un'}
                                </td>
                                <td style={{ padding: '0.35rem 0.5rem' }}>
                                  {isLow ? (
                                    <span style={{ ...styles.badgeCritical, fontSize: '0.7rem', padding: '0.1rem 0.35rem' }}>Abaixo do Mínimo</span>
                                  ) : (
                                    <span style={{ ...styles.badgeNormal, fontSize: '0.7rem', padding: '0.1rem 0.35rem' }}>Regular</span>
                                  )}
                                </td>
                                <td style={{ padding: '0.35rem 0.5rem', fontWeight: '600' }}>
                                  {formatCurrencyBR(itemPrice)}
                                </td>
                                <td style={{ padding: '0.35rem 0.5rem' }}>
                                  <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                                    <button onClick={() => handleOpenEditModal(item)} style={{ ...styles.actionEditBtn, padding: '0.2rem 0.45rem', fontSize: '0.75rem' }} title="Editar Item">
                                      Editar
                                    </button>
                                    <button onClick={() => handleDeleteItem(item.id)} style={{ ...styles.actionEditBtn, padding: '0.2rem 0.45rem', fontSize: '0.75rem', backgroundColor: '#fee2e2', color: '#991b1b' }} title="Excluir">
                                      <Trash2 size={12} />
                                    </button>
                                    {isLow && (
                                      <button onClick={() => handleQuickPurchaseRequest(item)} style={{ ...styles.actionEditBtn, padding: '0.2rem 0.45rem', fontSize: '0.75rem', backgroundColor: '#ec4899', color: '#ffffff', border: 'none', display: 'inline-flex', alignItems: 'center', gap: '2px' }} title="Pedir Compra">
                                        + Compra
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

                {/* 2. VIEW MODE: NORMAL (DETALHADA) */}
                {productViewMode === 'normal' && (
                  <div style={styles.tableWrapper}>
                    <table style={styles.table}>
                      <thead>
                        <tr>
                          {renderSortHeader('Item de Insumo', 'name', inventorySort, setInventorySort)}
                          {renderSortHeader('Categoria', 'category', inventorySort, setInventorySort)}
                          {renderSortHeader('Setor Padrão', 'defaultSectorId', inventorySort, setInventorySort)}
                          {renderSortHeader('Saldo', 'currentStock', inventorySort, setInventorySort)}
                          {renderSortHeader('Mínimo', 'minStock', inventorySort, setInventorySort)}
                          {renderSortHeader('Preço Unitário', 'price', inventorySort, setInventorySort)}
                          <th>Total em Estoque</th>
                          <th style={styles.th}>Rastreabilidade</th>
                          <th style={styles.th}>Status</th>
                          <th style={styles.th}>Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sortedItems.length === 0 ? (
                          <tr>
                            <td colSpan="10" style={styles.noDataCell}>Nenhum insumo encontrado no catálogo.</td>
                          </tr>
                        ) : (
                          sortedItems.map((item, idx) => {
                            const currentVal = parseFloat(item?.currentStock) || 0;
                            const minVal = parseFloat(item?.minStock) || 0;
                            const isLow = currentVal <= minVal;
                            const sectorName = sectors.find(s => s?.id === item?.defaultSectorId)?.name || 'Almoxarifado Central';
                            const itemPrice = parseFloat(item?.price) || 0;
                            const totalValue = currentVal * itemPrice;
                            const hasLote = !!item?.hasBatchControl;
                            const stockPercent = minVal > 0 ? Math.min(100, Math.round((currentVal / minVal) * 100)) : 100;

                            return (
                              <tr key={item?.id || idx} style={isLow ? styles.rowWarning : {}}>
                                <td onClick={() => handleOpenEditModal(item)} style={{ cursor: 'pointer' }} title="Clique para editar insumo">
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.35rem 0' }}>
                                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: item?.isControlled ? 'rgba(220,38,38,0.1)' : 'rgba(245,158,11,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                      <Boxes size={16} color={item?.isControlled ? '#dc2626' : '#f59e0b'} />
                                    </div>
                                    <div>
                                      <div style={{ fontWeight: '700', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                                        <span>{item?.name || 'Insumo Sem Nome'}</span>
                                        {item?.isControlled && (
                                          <span style={{ backgroundColor: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca', padding: '0.08rem 0.35rem', borderRadius: '4px', fontSize: '0.68rem', fontWeight: '700' }}>
                                            🔒 Controlado (Portaria 344)
                                          </span>
                                        )}
                                      </div>
                                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Unidade: {item?.unit || 'un'}</div>
                                    </div>
                                  </div>
                                </td>
                                <td><span style={styles.categoryBadge}>{item?.category || 'Geral'}</span></td>
                                <td style={{ fontSize: '0.85rem' }}>{sectorName}</td>
                                <td>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', minWidth: '110px' }}>
                                    <span style={{ fontWeight: '700', color: isLow ? 'var(--danger-color)' : 'var(--text-primary)' }}>
                                      {currentVal} {item?.unit || 'un'}
                                    </span>
                                    <div style={{ width: '100%', height: '5px', backgroundColor: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                                      <div style={{
                                        width: `${stockPercent}%`,
                                        height: '100%',
                                        backgroundColor: currentVal <= 0 ? '#ef4444' : isLow ? '#f59e0b' : '#10b981',
                                        borderRadius: '3px'
                                      }} />
                                    </div>
                                  </div>
                                </td>
                                <td style={{ fontSize: '0.85rem' }}>{minVal} {item?.unit || 'un'}</td>
                                <td style={{ fontWeight: '600' }}>{formatCurrencyBR(itemPrice)}</td>
                                <td style={{ fontWeight: '700', color: '#10b981' }}>{formatCurrencyBR(totalValue)}</td>
                                <td>
                                  {hasLote ? (
                                    <span style={{ backgroundColor: '#e0f2fe', color: '#0369a1', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '700' }}>
                                      ✓ Lote / FEFO
                                    </span>
                                  ) : (
                                    <span style={{ color: '#9ca3af', fontSize: '0.75rem' }}>Controle Geral</span>
                                  )}
                                </td>
                                <td>
                                  {isLow ? (
                                    <span style={styles.badgeCritical}>Abaixo do Mínimo</span>
                                  ) : (
                                    <span style={styles.badgeNormal}>Regular</span>
                                  )}
                                </td>
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

                {/* 3. VIEW MODE: CARDS (GRADE VISUAL) */}
                {productViewMode === 'cards' && (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: '1.25rem'
                  }}>
                    {sortedItems.length === 0 ? (
                      <div style={{ ...styles.noDataCell, gridColumn: '1 / -1', padding: '2.5rem', textAlign: 'center', backgroundColor: '#fff', borderRadius: '8px' }}>
                        Nenhum insumo encontrado no catálogo.
                      </div>
                    ) : (
                      sortedItems.map((item, idx) => {
                        const currentVal = parseFloat(item?.currentStock) || 0;
                        const minVal = parseFloat(item?.minStock) || 0;
                        const isLow = currentVal <= minVal;
                        const sectorName = sectors.find(s => s?.id === item?.defaultSectorId)?.name || 'Almoxarifado Central';
                        const itemPrice = parseFloat(item?.price) || 0;
                        const totalValue = currentVal * itemPrice;
                        const hasLote = !!item?.hasBatchControl;
                        const stockPercent = minVal > 0 ? Math.min(100, Math.round((currentVal / minVal) * 100)) : 100;

                        return (
                          <div 
                            key={item?.id || idx}
                            style={{
                              borderRadius: '12px',
                              backgroundColor: 'var(--bg-card)',
                              border: `1px solid ${isLow ? '#fca5a5' : 'var(--border-color)'}`,
                              boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                              padding: '1.1rem',
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'space-between',
                              gap: '0.85rem',
                              transition: 'transform 0.15s ease, box-shadow 0.15s ease'
                            }}
                          >
                            {/* Card Top: Badges */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.35rem' }}>
                              <span style={styles.categoryBadge}>
                                {item?.category || 'Geral'}
                              </span>

                              {item?.isControlled ? (
                                <span style={{ backgroundColor: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca', padding: '0.15rem 0.45rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: '700' }}>
                                  🔒 Controlado
                                </span>
                              ) : hasLote ? (
                                <span style={{ backgroundColor: '#e0f2fe', color: '#0369a1', padding: '0.15rem 0.45rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: '700' }}>
                                  ✓ Rastreável FEFO
                                </span>
                              ) : (
                                <span style={{ backgroundColor: '#f1f5f9', color: '#64748b', padding: '0.15rem 0.45rem', borderRadius: '6px', fontSize: '0.7rem' }}>
                                  Controle Geral
                                </span>
                              )}
                            </div>

                            {/* Card Center: Icon & Title */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                              <div style={{
                                width: '46px',
                                height: '46px',
                                borderRadius: '10px',
                                backgroundColor: item?.isControlled ? '#fee2e2' : isLow ? '#fee2e2' : '#fef3c7',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                              }}>
                                <Boxes size={22} color={item?.isControlled ? '#dc2626' : isLow ? '#dc2626' : '#d97706'} />
                              </div>

                              <div style={{ overflow: 'hidden' }}>
                                <h3 
                                  onClick={() => handleOpenEditModal(item)}
                                  style={{ margin: 0, fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-primary)', cursor: 'pointer', textDecoration: 'underline' }}
                                  title="Clique para editar insumo"
                                >
                                  {item?.name || 'Insumo Sem Nome'}
                                </h3>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                  <Warehouse size={12} /> {sectorName}
                                </div>
                              </div>
                            </div>

                            {/* Stock Bar */}
                            <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Saldo Atual:</span>
                                <strong style={{ color: isLow ? 'var(--danger-color)' : 'var(--text-primary)' }}>
                                  {currentVal} / {minVal} {item?.unit || 'un'}
                                </strong>
                              </div>
                              <div style={{ width: '100%', height: '6px', backgroundColor: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                                <div style={{
                                  width: `${stockPercent}%`,
                                  height: '100%',
                                  backgroundColor: currentVal <= 0 ? '#ef4444' : isLow ? '#f59e0b' : '#10b981',
                                  borderRadius: '3px'
                                }} />
                              </div>
                            </div>

                            {/* Key Metrics Grid */}
                            <div style={{
                              display: 'grid',
                              gridTemplateColumns: '1fr 1fr',
                              gap: '0.4rem',
                              fontSize: '0.75rem'
                            }}>
                              <div>
                                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.68rem' }}>Preço Unitário</span>
                                <strong>{formatCurrencyBR(itemPrice)}</strong>
                              </div>
                              <div>
                                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.68rem' }}>Total Estocado</span>
                                <strong style={{ color: '#10b981' }}>{formatCurrencyBR(totalValue)}</strong>
                              </div>
                            </div>

                            {/* Footer Actions */}
                            <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.2rem' }}>
                              <button
                                onClick={() => handleOpenEditModal(item)}
                                style={{
                                  flex: 1,
                                  padding: '0.4rem',
                                  fontSize: '0.8rem',
                                  fontWeight: '700',
                                  backgroundColor: '#f59e0b',
                                  color: '#fff',
                                  border: 'none',
                                  borderRadius: '6px',
                                  cursor: 'pointer'
                                }}
                              >
                                Editar Insumo
                              </button>
                              <button
                                onClick={() => handleDeleteItem(item.id)}
                                style={{
                                  padding: '0.4rem 0.6rem',
                                  fontSize: '0.75rem',
                                  fontWeight: '600',
                                  backgroundColor: 'transparent',
                                  color: 'var(--danger-color)',
                                  border: '1px solid rgba(239,68,68,0.3)',
                                  borderRadius: '6px',
                                  cursor: 'pointer'
                                }}
                                title="Excluir Insumo"
                              >
                                <Trash2 size={13} />
                              </button>
                              {isLow && (
                                <button
                                  onClick={() => handleQuickPurchaseRequest(item)}
                                  style={{
                                    padding: '0.4rem 0.65rem',
                                    fontSize: '0.75rem',
                                    fontWeight: '700',
                                    backgroundColor: '#ec4899',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer'
                                  }}
                                  title="Pedir Compra"
                                >
                                  + Compra
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            );
          })()}

          {/* TAB 1.5: Kits de Produtos */}
          {activeTab === 'kits' && (() => {
            const sortedKits = sortData(productKits || [], kitSort);
            const filteredKits = sortedKits.filter(k => {
              if (!searchTerm) return true;
              const term = searchTerm.toLowerCase();
              return (
                (k.name || '').toLowerCase().includes(term) ||
                (k.code || '').toLowerCase().includes(term) ||
                (k.category || '').toLowerCase().includes(term) ||
                (k.suggestedLocation || '').toLowerCase().includes(term) ||
                (k.items || []).some(it => (it.itemName || '').toLowerCase().includes(term))
              );
            });

            return (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div>
                    <h2 style={{ fontSize: '1.15rem', fontWeight: '700', margin: 0, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Package size={22} color="#f59e0b" /> Kits de Insumos & Procedimentos
                    </h2>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.2rem 0 0 0' }}>
                      Pacotes padronizados para abertura de sessão de hemodiálise, curativos e punções.
                    </p>
                  </div>
                  <button 
                    onClick={handleOpenKitAdd}
                    className="btn btn-primary"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#f59e0b' }}
                  >
                    <Plus size={16} /> Novo Kit
                  </button>
                </div>

                <div style={styles.tableWrapper}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        {renderSortHeader('Código', 'code', kitSort, setKitSort)}
                        {renderSortHeader('Nome do Kit', 'name', kitSort, setKitSort)}
                        {renderSortHeader('Categoria', 'category', kitSort, setKitSort)}
                        <th>Salão Padrão</th>
                        <th>Composição ({filteredKits.length > 0 ? 'Itens' : '0'})</th>
                        {renderSortHeader('Custo Estimado', 'totalCost', kitSort, setKitSort)}
                        <th>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredKits.length === 0 ? (
                        <tr>
                          <td colSpan="7" style={styles.noDataCell}>
                            Nenhum kit de produtos cadastrado. Clique em "+ Novo Kit" para cadastrar o primeiro pacote.
                          </td>
                        </tr>
                      ) : (
                        filteredKits.map((kit, idx) => {
                          const totalCost = parseFloat(kit.totalCost) || (kit.items || []).reduce((acc, it) => acc + ((parseFloat(it.price) || 0) * (parseFloat(it.quantity) || 1)), 0);
                          const hasControlled = kit.hasControlledMedicine || (kit.items || []).some(i => i.isControlled || items.find(it => it.id === i.itemId)?.isControlled);

                          return (
                            <tr key={kit.id || idx}>
                              <td style={{ fontWeight: '700', color: 'var(--primary-color)' }}>
                                {kit.code || `KIT-${idx + 1}`}
                              </td>
                              <td>
                                <div style={{ fontWeight: '700', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                                  <span>{kit.name}</span>
                                  {hasControlled && (
                                    <span style={{ backgroundColor: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca', padding: '0.08rem 0.35rem', borderRadius: '4px', fontSize: '0.68rem', fontWeight: '700' }}>
                                      🔒 Contém Controlado
                                    </span>
                                  )}
                                </div>
                                {kit.description && (
                                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                                    {kit.description}
                                  </div>
                                )}
                              </td>
                              <td>
                                <span style={styles.categoryBadge}>{kit.category || 'Hemodiálise'}</span>
                              </td>
                              <td>
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '0.75rem', backgroundColor: '#e0f2fe', color: '#0369a1', padding: '0.15rem 0.45rem', borderRadius: '4px', fontWeight: '700' }}>
                                  📍 {kit.suggestedLocation || 'Salão 1'}
                                </span>
                              </td>
                              <td>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                                  <span style={{ fontWeight: '600', fontSize: '0.8rem', color: '#334155' }}>
                                    {(kit.items || []).length} insumo(s)
                                  </span>
                                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                                    {(kit.items || []).slice(0, 3).map((it, i) => (
                                      <span key={i} style={{ fontSize: '0.7rem', backgroundColor: '#f1f5f9', color: '#475569', padding: '0.1rem 0.35rem', borderRadius: '4px' }}>
                                        {it.quantity}x {it.itemName}
                                      </span>
                                    ))}
                                    {(kit.items || []).length > 3 && (
                                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', alignSelf: 'center' }}>
                                        +{(kit.items || []).length - 3} mais
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td style={{ fontWeight: '700', color: '#059669' }}>
                                {formatCurrencyBR(totalCost)}
                              </td>
                              <td>
                                <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                                  <button 
                                    onClick={() => handleOpenKitEdit(kit)}
                                    style={{ ...styles.actionEditBtn, padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                                    title="Editar Kit"
                                  >
                                    Editar
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteKit(kit.id, kit.name)}
                                    style={{ ...styles.actionEditBtn, padding: '0.25rem 0.5rem', fontSize: '0.75rem', backgroundColor: '#fee2e2', color: '#991b1b' }}
                                    title="Excluir Kit"
                                  >
                                    <Trash2 size={12} />
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
              </div>
            );
          })()}

          {/* TAB: Physical Inventories (Inventários Físicos) */}
          {activeTab === 'physical_inventory' && (
            <div style={styles.tableWrapper}>
              <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '700', color: 'var(--text-primary)' }}>📋 Gestão de Inventários Físicos & Auditoria de Saldo</h3>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Crie e execute contagens de estoque por local. Ao concluir, o saldo do sistema é ajustado automaticamente com relatório de divergência.
                  </span>
                </div>
                <button onClick={handleOpenInventoryAdd} className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', backgroundColor: '#f59e0b', padding: '0.5rem 0.85rem', borderRadius: '6px', fontWeight: '700', fontSize: '0.85rem' }}>
                  <Plus size={16} /> Novo Inventário
                </button>
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
                      <td colSpan="6" style={styles.noDataCell}>Nenhum inventário físico registrado. Clique em "Novo Inventário" para iniciar.</td>
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
              <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '700', color: 'var(--text-primary)' }}>🔄 Histórico de Transferências Entre Locais de Estoque</h3>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Rastreamento de movimentações internas (ex: Almoxarifado Central ➡️ Farmácia da Diálise).
                  </span>
                </div>
                <button onClick={handleOpenTransferModal} className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', backgroundColor: '#f59e0b', padding: '0.5rem 0.85rem', borderRadius: '6px', fontWeight: '700', fontSize: '0.85rem' }}>
                  <Plus size={16} /> Nova Transferência
                </button>
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
                      <td colSpan="9" style={styles.noDataCell}>Nenhuma transferência entre locais registrada. Clique em "Nova Transferência".</td>
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

          {/* TAB 6: Expiry & Batches Control */}
          {activeTab === 'expiry' && (
            <div style={styles.tableWrapper}>
              <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-primary)' }}>📦 Lotes & Rastreabilidade de Validade (FEFO)</h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Ordenado por proximidade de vencimento (Primeiro que Vence, Primeiro que Sai).
                  </span>
                </div>
              </div>

              <table style={styles.table}>
                <thead>
                  <tr>
                    <th>Item de Insumo</th>
                    <th>Lote</th>
                    <th>Saldo Atual</th>
                    <th>Qtd Inicial</th>
                    <th>Data Entrada</th>
                    <th>Data Validade</th>
                    <th>Status</th>
                    <th>Origem / NF-e</th>
                    <th style={styles.th}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {expiryList.length === 0 ? (
                    <tr>
                      <td colSpan="9" style={styles.noDataCell}>Nenhum lote com validade registrada no momento.</td>
                    </tr>
                  ) : (
                    expiryList.map(tx => {
                      const expiryInfo = getExpiryStatus(tx?.expiryDate);
                      const currentQty = parseFloat(tx?.quantity) || 0;
                      const initialQty = parseFloat(tx?.initialQuantity) || currentQty;
                      const isExhausted = currentQty <= 0;

                      return (
                        <tr key={tx?.id || Math.random()} style={isExhausted ? { opacity: 0.6 } : {}}>
                          <td style={{ fontWeight: '600' }}>{tx?.itemName}</td>
                          <td style={{ fontWeight: '700', color: 'var(--primary-color)' }}>{tx?.batch || '-'}</td>
                          <td style={{ fontWeight: '700', color: isExhausted ? '#9ca3af' : '#166534' }}>
                            {currentQty}
                          </td>
                          <td style={{ color: 'var(--text-muted)' }}>{initialQty}</td>
                          <td>{tx?.date && !isNaN(new Date(tx.date).getTime()) ? new Date(tx.date).toLocaleDateString('pt-BR') : '-'}</td>
                          <td style={{ fontWeight: '600' }}>{tx?.expiryDate && !isNaN(new Date(tx.expiryDate).getTime()) ? new Date(tx.expiryDate).toLocaleDateString('pt-BR') : '-'}</td>
                          <td>
                            {isExhausted ? (
                              <span style={{ ...styles.badge, backgroundColor: '#f3f4f6', color: '#6b7280' }}>Esgotado</span>
                            ) : (
                              <span style={{ ...styles.expiryLabel, color: expiryInfo.color }}>
                                {expiryInfo.text}
                              </span>
                            )}
                          </td>
                          <td style={{ fontSize: '0.8rem' }}>
                            {tx?.invoiceNumber && tx?.invoiceNumber !== 'MANUAL' ? `NF-e ${tx.invoiceNumber}` : 'Entrada Manual'}
                            {tx?.supplierName && <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{tx.supplierName}</div>}
                          </td>
                          <td>
                            {tx?.id && handleDeleteBatch && (
                              <button 
                                onClick={() => handleDeleteBatch(tx.id)} 
                                style={{ ...styles.actionEditBtn, backgroundColor: '#fee2e2', color: '#991b1b' }} 
                                title="Excluir Registro de Lote"
                              >
                                <Trash2 size={13} />
                              </button>
                            )}
                          </td>
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
                      <th style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Data</th>
                      <th style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Solicitante</th>
                      <th style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Destino</th>
                      <th style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Itens</th>
                      <th style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Status</th>
                      <th style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', textAlign: 'right' }}>Ações</th>
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
                        <td style={{ padding: '0.875rem 1rem', fontWeight: '600' }}>
                          <div>{req?.patientName || 'Uso Geral'}</div>
                          {req?.salonLocation && (
                            <div style={{ marginTop: '0.25rem' }}>
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '0.75rem', backgroundColor: '#e0f2fe', color: '#0369a1', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: '700' }}>
                                📍 {req.salonLocation}
                              </span>
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '0.875rem 1rem' }}>
                          {req?.items && req.items.length > 0 ? (
                            <div>
                              <div><strong>{req.items[0]?.itemName}</strong> ({req.items[0]?.requestedQuantity} {req.items[0]?.unit})</div>
                              {req.items.length > 1 && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>+ {req.items.length - 1} outro(s) item(ns)</div>}
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginTop: '0.25rem' }}>
                                {req.hasKit && (
                                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '0.7rem', backgroundColor: '#fef3c7', color: '#b45309', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: '700' }}>
                                    📦 Kit de Insumos
                                  </span>
                                )}
                                {(req.hasControlledMedicine || req.items.some(i => i.isControlled || items.find(it => it.id === i.itemId)?.isControlled)) && (
                                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '0.7rem', backgroundColor: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: '700' }}>
                                    🔒 CONTROLADO (Portaria 344)
                                  </span>
                                )}
                              </div>
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

      {/* TAB 9: Traceability & Reverse Batch Search (Recall) */}
      {activeTab === 'traceability' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Search Card */}
          <div style={{ ...styles.card, padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.15rem', fontWeight: '700', margin: '0 0 0.25rem 0', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Search size={20} color="var(--primary-color)" /> Rastreabilidade & Busca Reversa de Lotes (Recall)
                </h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                  Consulte a cadeia completa de medicamentos e insumos: entrada por nota fiscal, fornecedor, estoque atual e histórico de todos os pacientes que receberam o lote.
                </p>
              </div>

              {traceabilityResult.dispensations.length > 0 && (
                <button
                  type="button"
                  onClick={() => window.print()}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.45rem 0.85rem', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: '#ffffff', color: 'var(--text-primary)', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer' }}
                >
                  <FileText size={15} /> Imprimir Relatório de Recall
                </button>
              )}
            </div>

            <form 
              onSubmit={(e) => { e.preventDefault(); handleSearchTraceability(); }}
              style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}
            >
              <div style={{ position: 'relative', flex: 1 }}>
                <Search size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Digite o Número do Lote, Nome do Medicamento/Insumo, Paciente ou NF-e..."
                  value={traceabilitySearchTerm}
                  onChange={(e) => setTraceabilitySearchTerm(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem 0.85rem 0.65rem 2.4rem', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.9rem', outline: 'none' }}
                />
                {traceabilitySearchTerm && (
                  <button 
                    type="button" 
                    onClick={() => { setTraceabilitySearchTerm(''); handleSearchTraceability(''); }}
                    style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
              <button
                type="submit"
                disabled={traceabilityLoading}
                className="btn btn-primary"
                style={{ padding: '0.65rem 1.25rem', backgroundColor: '#0284c7', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
              >
                {traceabilityLoading ? <RefreshCw size={16} className="spin" /> : <Search size={16} />}
                Rastrear Lote
              </button>
            </form>

            {/* Quick Batch Suggestions */}
            {(productBatches || []).length > 0 && (
              <div style={{ marginTop: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)' }}>Lotes Recentes:</span>
                {(productBatches || []).slice(0, 6).map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => {
                      setTraceabilitySearchTerm(b.batchNumber);
                      handleSearchTraceability(b.batchNumber);
                    }}
                    style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '0.2rem 0.6rem', fontSize: '0.75rem', cursor: 'pointer', color: '#334155' }}
                  >
                    🏷️ {b.itemName} — <strong>{b.batchNumber}</strong>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Results Section */}
          {traceabilityLoading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              <RefreshCw size={32} className="spin" style={{ marginBottom: '0.5rem' }} />
              <p>Rastreando dados do lote e histórico de pacientes...</p>
            </div>
          ) : (
            <>
              {/* Summary Stats */}
              {(traceabilityResult.batches.length > 0 || traceabilityResult.dispensations.length > 0) && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  <div style={{ ...styles.card, padding: '1rem', backgroundColor: '#f0f9ff', border: '1px solid #bae6fd' }}>
                    <span style={{ fontSize: '0.75rem', color: '#0369a1', fontWeight: '700', textTransform: 'uppercase' }}>Lotes Localizados</span>
                    <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0369a1', marginTop: '0.25rem' }}>{traceabilityResult.batches.length}</div>
                  </div>
                  <div style={{ ...styles.card, padding: '1rem', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                    <span style={{ fontSize: '0.75rem', color: '#15803d', fontWeight: '700', textTransform: 'uppercase' }}>Dispensações a Pacientes</span>
                    <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#15803d', marginTop: '0.25rem' }}>{traceabilityResult.dispensations.length}</div>
                  </div>
                  <div style={{ ...styles.card, padding: '1rem', backgroundColor: '#fefce8', border: '1px solid #fef08a' }}>
                    <span style={{ fontSize: '0.75rem', color: '#a16207', fontWeight: '700', textTransform: 'uppercase' }}>Total Unidades Dispensadas</span>
                    <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#a16207', marginTop: '0.25rem' }}>
                      {traceabilityResult.dispensations.reduce((acc, d) => acc + (parseFloat(d.quantity) || 0), 0)}
                    </div>
                  </div>
                </div>
              )}

              {/* Batches Details Table */}
              {traceabilityResult.batches.length > 0 && (
                <div style={styles.tableWrapper}>
                  <div style={{ padding: '0.75rem 1rem', backgroundColor: '#f8fafc', borderBottom: '1px solid var(--border-color)', fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                    📦 Dados de Origem do Lote (Entrada no Estoque)
                  </div>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th>Item / Insumo</th>
                        <th>Lote</th>
                        <th>Saldo Atual</th>
                        <th>Qtd Inicial</th>
                        <th>Validade</th>
                        <th>Status</th>
                        <th>Fornecedor</th>
                        <th>NF-e</th>
                      </tr>
                    </thead>
                    <tbody>
                      {traceabilityResult.batches.map(b => (
                        <tr key={b.id}>
                          <td style={{ fontWeight: '600' }}>{b.itemName}</td>
                          <td style={{ fontWeight: '700', color: 'var(--primary-color)' }}>{b.batchNumber}</td>
                          <td style={{ fontWeight: '700', color: (parseFloat(b.currentQuantity) || 0) <= 0 ? '#9ca3af' : '#166534' }}>
                            {b.currentQuantity} {b.unit || 'un'}
                          </td>
                          <td style={{ color: 'var(--text-muted)' }}>{b.initialQuantity}</td>
                          <td style={{ fontWeight: '600' }}>{b.expiryDate ? new Date(b.expiryDate).toLocaleDateString('pt-BR') : '-'}</td>
                          <td>
                            <span style={{
                              padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '700',
                              backgroundColor: b.status === 'Ativo' ? '#dcfce7' : b.status === 'Vencido' ? '#fee2e2' : '#f3f4f6',
                              color: b.status === 'Ativo' ? '#166534' : b.status === 'Vencido' ? '#991b1b' : '#6b7280'
                            }}>
                              {b.status || 'Ativo'}
                            </span>
                          </td>
                          <td style={{ fontSize: '0.8rem' }}>{b.supplierName || 'Fornecedor Padrão'}</td>
                          <td style={{ fontSize: '0.8rem' }}>{b.invoiceNumber || 'Manual'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Patient Dispensations Table */}
              <div style={styles.tableWrapper}>
                <div style={{ padding: '0.75rem 1rem', backgroundColor: '#f8fafc', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                    🏥 Histórico de Dispensações para Pacientes
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {traceabilityResult.dispensations.length} registro(s) encontrado(s)
                  </span>
                </div>

                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th>Data / Hora</th>
                      <th>Paciente</th>
                      <th>Item / Insumo</th>
                      <th>Lote</th>
                      <th>Validade</th>
                      <th>Qtd</th>
                      <th>Solicitante</th>
                      <th>Dispensado Por</th>
                      <th>Requisição</th>
                    </tr>
                  </thead>
                  <tbody>
                    {traceabilityResult.dispensations.length === 0 ? (
                      <tr>
                        <td colSpan="9" style={styles.noDataCell}>
                          {traceabilitySearchTerm 
                            ? `Nenhuma dispensação de paciente encontrada para "${traceabilitySearchTerm}".`
                            : 'Digite um número de lote ou selecione um lote recente acima para consultar a rastreabilidade.'}
                        </td>
                      </tr>
                    ) : (
                      traceabilityResult.dispensations.map((disp, dIdx) => (
                        <tr key={disp.id || dIdx}>
                          <td>
                            <div>{disp.date ? new Date(disp.date).toLocaleDateString('pt-BR') : '-'}</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                              {disp.date ? new Date(disp.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : ''}
                            </div>
                          </td>
                          <td style={{ fontWeight: '700', color: '#1e40af' }}>
                            {disp.patientName || 'Uso Geral / Salão'}
                          </td>
                          <td style={{ fontWeight: '600' }}>{disp.itemName}</td>
                          <td style={{ fontWeight: '700', color: 'var(--primary-color)' }}>
                            {disp.batchNumber || '-'}
                          </td>
                          <td style={{ fontSize: '0.8rem' }}>
                            {disp.expiryDate ? new Date(disp.expiryDate).toLocaleDateString('pt-BR') : '-'}
                          </td>
                          <td style={{ fontWeight: '700', color: '#047857' }}>
                            {disp.quantity} {disp.unit || 'un'}
                          </td>
                          <td style={{ fontSize: '0.8rem' }}>{disp.requestedBy || 'Enfermagem'}</td>
                          <td style={{ fontSize: '0.8rem' }}>{disp.fulfilledBy || 'Farmácia'}</td>
                          <td style={{ fontSize: '0.8rem', fontWeight: '600' }}>
                            {disp.requisitionCode || '-'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}

      {/* Requisition Fulfillment Modal */}
      {showFulfillModal && fulfillingReq && (
        <div style={styles.modalOverlay}>
          <div style={{ ...styles.modalCard, maxWidth: '850px' }}>
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
                <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: '700' }}>Itens Solicitados & Lote a Dispensar:</h4>
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
                      <th style={{ padding: '0.5rem 0.75rem', width: '320px' }}>Lote & Validade (Sugestão FEFO)</th>
                      <th style={{ padding: '0.5rem 0.75rem', textAlign: 'center', width: '100px' }}>Qtd Pedida</th>
                      <th style={{ padding: '0.5rem 0.75rem', textAlign: 'center', width: '110px' }}>Qtd Entregue *</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fulfillItems.map((item, idx) => {
                      const stockCatalogItem = items.find(i => i.id === item.itemId || i.name.toLowerCase() === item.itemName?.toLowerCase());
                      const hasLoteFlag = stockCatalogItem?.hasBatchControl;
                      const matchingBatches = (productBatches || [])
                        .filter(b => (b.itemId === item.itemId || b.itemName?.toLowerCase() === item.itemName?.toLowerCase()) && (parseFloat(b.currentQuantity) || 0) > 0)
                        .sort((a, b) => new Date(a.expiryDate || '9999-12-31') - new Date(b.expiryDate || '9999-12-31'));

                      return (
                        <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb' }}>
                          <td style={{ padding: '0.5rem 0.75rem', fontWeight: '600' }}>
                            <div>{item.itemName}</div>
                            {hasLoteFlag && (
                              <span style={{ backgroundColor: '#e0f2fe', color: '#0369a1', fontSize: '0.7rem', padding: '0.1rem 0.35rem', borderRadius: '3px', fontWeight: '700' }}>
                                ✓ Rastreável
                              </span>
                            )}
                          </td>
                          <td style={{ padding: '0.5rem 0.75rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                              {matchingBatches.length > 0 ? (
                                <select
                                  value={item.batchId || ''}
                                  onChange={(e) => handleFulfillBatchChange(idx, e.target.value)}
                                  style={{ width: '100%', padding: '0.35rem 0.5rem', fontSize: '0.8rem', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: '#fff', fontWeight: '600' }}
                                >
                                  {matchingBatches.map((b, bIdx) => (
                                    <option key={b.id} value={b.id}>
                                      {b.batchNumber} (Val: {b.expiryDate ? new Date(b.expiryDate).toLocaleDateString('pt-BR') : 'S/D'} | Saldo: {b.currentQuantity}) {bIdx === 0 ? '⭐ FEFO' : ''}
                                    </option>
                                  ))}
                                  <option value="">[Digitar outro lote manual]</option>
                                </select>
                              ) : null}

                              {(!item.batchId || matchingBatches.length === 0) && (
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.3rem' }}>
                                  <input
                                    type="text"
                                    placeholder="Nº Lote"
                                    value={item.batchNumber || ''}
                                    onChange={(e) => handleFulfillManualBatchChange(idx, 'batchNumber', e.target.value)}
                                    style={{ padding: '0.3rem 0.4rem', fontSize: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}
                                  />
                                  <input
                                    type="date"
                                    placeholder="Validade"
                                    value={item.expiryDate || ''}
                                    onChange={(e) => handleFulfillManualBatchChange(idx, 'expiryDate', e.target.value)}
                                    style={{ padding: '0.3rem 0.4rem', fontSize: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}
                                  />
                                </div>
                              )}
                            </div>
                          </td>
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
                      );
                    })}
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
                
                <div style={{ marginTop: '0.75rem', padding: '0.75rem', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <input 
                    type="checkbox" 
                    id="item-batch-control-checkbox"
                    checked={!!itemForm.hasBatchControl} 
                    onChange={e => setItemForm({ ...itemForm, hasBatchControl: e.target.checked })}
                    style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#16a34a' }}
                  />
                  <div>
                    <label htmlFor="item-batch-control-checkbox" style={{ fontWeight: '700', fontSize: '0.85rem', color: '#166534', cursor: 'pointer', margin: 0, display: 'block' }}>
                      Controla Lote & Rastreabilidade
                    </label>
                    <span style={{ fontSize: '0.75rem', color: '#15803d', display: 'block' }}>
                      Exige registro de número de lote e data de validade na entrada e rastreia o paciente na dispensação.
                    </span>
                  </div>
                </div>

                <div style={{ marginTop: '0.75rem', padding: '0.75rem', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <input 
                    type="checkbox" 
                    id="item-controlled-checkbox"
                    checked={!!itemForm.isControlled} 
                    onChange={e => setItemForm({ ...itemForm, isControlled: e.target.checked })}
                    style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#dc2626' }}
                  />
                  <div>
                    <label htmlFor="item-controlled-checkbox" style={{ fontWeight: '700', fontSize: '0.85rem', color: '#991b1b', cursor: 'pointer', margin: 0, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <span>🔒 Medicamento Controlado</span>
                      <span style={{ fontSize: '0.7rem', backgroundColor: '#991b1b', color: '#fff', padding: '0.1rem 0.35rem', borderRadius: '4px' }}>Portaria 344</span>
                    </label>
                    <span style={{ fontSize: '0.75rem', color: '#b91c1c', display: 'block' }}>
                      Exige retenção de receita especial, guarda trancada e sinalização visual destacada no sistema.
                    </span>
                  </div>
                </div>
              </div>
              <div style={styles.modalFooter}>
                <button type="button" onClick={() => setShowItemModal(false)} className="btn btn-secondary">Cancelar</button>
                <button type="submit" disabled={actionLoading} className="btn btn-primary" style={{ backgroundColor: '#f59e0b' }}>
                  {actionLoading ? 'Salvando...' : 'Salvar Insumo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Kit Modal (Cadastro / Edição de Kit de Produtos) */}
      {showKitModal && (() => {
        const currentTotalCost = (kitForm.items || []).reduce((acc, it) => {
          const itemObj = items.find(i => i.id === it.itemId);
          const itemPrice = parseFloat(itemObj?.price) || (parseFloat(it.price) || 0);
          return acc + (itemPrice * (parseFloat(it.quantity) || 1));
        }, 0);

        return (
          <div style={styles.modalOverlay}>
            <div style={{ ...styles.modalCard, maxWidth: '780px', width: '92%' }}>
              <div style={styles.modalHeader}>
                <h2>{editingKit ? 'Editar Kit de Produtos' : 'Cadastrar Novo Kit de Produtos'}</h2>
                <button onClick={() => setShowKitModal(false)} style={styles.modalCloseBtn}><X size={20} /></button>
              </div>
              <form onSubmit={handleSaveKit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
                <div style={styles.modalForm}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label>Código do Kit *</label>
                      <input 
                        type="text" className="form-control" placeholder="KIT-HEMO-01" required
                        value={kitForm.code} onChange={e => setKitForm({ ...kitForm, code: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Nome do Kit *</label>
                      <input 
                        type="text" className="form-control" placeholder="Ex: Kit Conexão Hemodiálise (Fístula AV)" required
                        value={kitForm.name} onChange={e => setKitForm({ ...kitForm, name: e.target.value })}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label>Categoria</label>
                      <select 
                        className="form-control"
                        value={kitForm.category}
                        onChange={e => setKitForm({ ...kitForm, category: e.target.value })}
                      >
                        <option value="Hemodiálise">Hemodiálise</option>
                        <option value="Diálise Peritoneal">Diálise Peritoneal</option>
                        <option value="Enfermagem & Curativos">Enfermagem</option>
                        <option value="Emergência & UTI">Emergência</option>
                        <option value="Geral">Geral</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Salão Padrão</label>
                      <select 
                        className="form-control"
                        value={kitForm.suggestedLocation}
                        onChange={e => setKitForm({ ...kitForm, suggestedLocation: e.target.value })}
                      >
                        <option value="Salão 1">Salão 1</option>
                        <option value="Salão 2">Salão 2</option>
                        <option value="Salão 3">Salão 3</option>
                        <option value="Consultório / Outro">Consultório / Outro</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Descrição</label>
                    <input 
                      type="text" className="form-control" placeholder="Instruções de uso ou composição do kit..."
                      value={kitForm.description} onChange={e => setKitForm({ ...kitForm, description: e.target.value })}
                    />
                  </div>

                  {/* Insumos Componentes do Kit */}
                  <div style={{ marginTop: '0.75rem', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.85rem', backgroundColor: '#f8fafc' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: '700', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Package size={16} color="#f59e0b" /> Composição de Insumos do Kit
                      </h4>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        Total: <strong>{(kitForm.items || []).length}</strong> insumo(s)
                      </span>
                    </div>

                    {/* Seletor rápido de insumos */}
                    <div style={{ marginBottom: '0.6rem' }}>
                      <select 
                        id="kit-item-picker"
                        className="form-control"
                        defaultValue=""
                        onChange={(e) => {
                          if (e.target.value) {
                            handleKitItemAdd(e.target.value, 1);
                            e.target.value = '';
                          }
                        }}
                      >
                        <option value="">+ Selecione um insumo para adicionar ao Kit...</option>
                        {items.map(it => (
                          <option key={it.id} value={it.id}>
                            {it.isControlled ? '🔒 [CONTROLADO] ' : ''}{it.name} ({it.unit || 'un'}) - R$ {(parseFloat(it.price) || 0).toFixed(2)}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Tabela de itens adicionados */}
                    {(kitForm.items || []).length === 0 ? (
                      <div style={{ padding: '1rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.8rem', backgroundColor: '#fff', borderRadius: '6px', border: '1px dashed #cbd5e1' }}>
                        Nenhum insumo adicionado ao kit ainda. Selecione no campo acima.
                      </div>
                    ) : (
                      <div style={{ maxHeight: '180px', overflowY: 'auto', backgroundColor: '#fff', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                        <table style={{ width: '100%', fontSize: '0.8rem', borderCollapse: 'collapse' }}>
                          <thead style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #e2e8f0' }}>
                            <tr>
                              <th style={{ padding: '0.4rem 0.6rem', textAlign: 'left' }}>Insumo</th>
                              <th style={{ padding: '0.4rem 0.6rem', textAlign: 'center', width: '90px' }}>Qtd</th>
                              <th style={{ padding: '0.4rem 0.6rem', textAlign: 'right', width: '90px' }}>Unitário</th>
                              <th style={{ padding: '0.4rem 0.6rem', textAlign: 'right', width: '90px' }}>Subtotal</th>
                              <th style={{ padding: '0.4rem 0.6rem', textAlign: 'center', width: '40px' }}></th>
                            </tr>
                          </thead>
                          <tbody>
                            {kitForm.items.map((it, idx) => {
                              const itemObj = items.find(i => i.id === it.itemId);
                              const unitPrice = parseFloat(itemObj?.price) || (parseFloat(it.price) || 0);
                              const isCtrl = itemObj?.isControlled || it.isControlled;
                              const sub = unitPrice * (parseFloat(it.quantity) || 1);

                              return (
                                <tr key={it.itemId || idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                  <td style={{ padding: '0.4rem 0.6rem' }}>
                                    <div style={{ fontWeight: '600', color: '#1e293b' }}>
                                      {it.itemName}
                                    </div>
                                    {isCtrl && (
                                      <span style={{ fontSize: '0.65rem', backgroundColor: '#fee2e2', color: '#991b1b', padding: '0.05rem 0.3rem', borderRadius: '3px', fontWeight: '700' }}>
                                        🔒 Controlado
                                      </span>
                                    )}
                                  </td>
                                  <td style={{ padding: '0.4rem 0.6rem', textAlign: 'center' }}>
                                    <input 
                                      type="number" 
                                      min="1" 
                                      value={it.quantity}
                                      onChange={e => handleKitItemQtyChange(it.itemId, e.target.value)}
                                      style={{ width: '60px', padding: '0.2rem 0.3rem', textAlign: 'center', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                                    />
                                  </td>
                                  <td style={{ padding: '0.4rem 0.6rem', textAlign: 'right' }}>
                                    {formatCurrencyBR(unitPrice)}
                                  </td>
                                  <td style={{ padding: '0.4rem 0.6rem', textAlign: 'right', fontWeight: '600' }}>
                                    {formatCurrencyBR(sub)}
                                  </td>
                                  <td style={{ padding: '0.4rem 0.6rem', textAlign: 'center' }}>
                                    <button 
                                      type="button"
                                      onClick={() => handleKitItemRemove(it.itemId)}
                                      style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#ef4444', padding: '0.2rem' }}
                                      title="Remover item do kit"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* Total do Kit */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '0.75rem', marginTop: '0.6rem' }}>
                      <span style={{ fontSize: '0.8rem', color: '#475569' }}>Custo Estimado do Kit:</span>
                      <span style={{ fontSize: '1.05rem', fontWeight: '700', color: '#059669' }}>
                        {formatCurrencyBR(currentTotalCost)}
                      </span>
                    </div>
                  </div>
                </div>
                <div style={styles.modalFooter}>
                  <button type="button" onClick={() => setShowKitModal(false)} className="btn btn-secondary">Cancelar</button>
                  <button type="submit" disabled={actionLoading} className="btn btn-primary" style={{ backgroundColor: '#f59e0b' }}>
                    {actionLoading ? 'Salvando...' : 'Salvar Kit'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        );
      })()}

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

                        {(() => {
                          const isBatchTracked = m.mappedItemId === 'CREATE_NEW' || items.find(i => i.id === m.mappedItemId)?.hasBatchControl;
                          return (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                              <div className="form-group">
                                <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  Lote {isBatchTracked && <span style={{ color: '#0369a1', fontSize: '0.7rem', fontWeight: '700' }}>(Rastreável)</span>}
                                </label>
                                <input 
                                  type="text" className="form-control" placeholder="Número do lote" style={{ padding: '0.35rem 0.5rem', fontSize: '0.8rem', borderColor: isBatchTracked && !m.batch ? '#f59e0b' : undefined }}
                                  value={m.batch} onChange={e => handleMappingFieldChange(m.xmlCode, 'batch', e.target.value)}
                                />
                              </div>
                              <div className="form-group">
                                <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  Validade {isBatchTracked && <span style={{ color: '#0369a1', fontSize: '0.7rem', fontWeight: '700' }}>(Rastreável)</span>}
                                </label>
                                <input 
                                  type="date" className="form-control" style={{ padding: '0.35rem 0.5rem', fontSize: '0.8rem', borderColor: isBatchTracked && !m.expiryDate ? '#f59e0b' : undefined }}
                                  value={m.expiryDate} onChange={e => handleMappingFieldChange(m.xmlCode, 'expiryDate', e.target.value)}
                                />
                              </div>
                            </div>
                          );
                        })()}
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
                  <label style={{ fontWeight: '600', marginBottom: '0.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Instituição / Clínica Parceira *</span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>Selecione na lista ou digite nova</span>
                  </label>
                  <input 
                    type="text"
                    list="partner-clinic-suggestions"
                    placeholder="Selecione na lista ou digite (Ex: Hospital São Lucas)..."
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                    value={loanForm.partnerName}
                    onChange={e => setLoanForm({ ...loanForm, partnerName: e.target.value })}
                    required
                  />
                  <datalist id="partner-clinic-suggestions">
                    {Array.from(new Set([
                      'Hospital São Lucas',
                      'Clínica NefroVida',
                      'Santa Casa de Misericórdia',
                      'Hospital Regional de Betim',
                      'Clínica Renal Center',
                      'Hospital Unimed',
                      'Hospital das Clínicas',
                      ...(loans || []).map(l => l?.partnerName).filter(Boolean)
                    ])).map((name, i) => (
                      <option key={i} value={name} />
                    ))}
                  </datalist>
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

      {/* Stock Reports Modal */}
      {isReportsOpen && (
        <StockReportsModal
          onClose={() => setIsReportsOpen && setIsReportsOpen(false)}
          items={items}
          transactions={transactions}
          suppliers={suppliers}
          sectors={sectors}
          invoices={invoices}
          loans={loans}
          requisitions={requisitions}
          stockLocations={stockLocations}
          inventories={inventories}
          transfers={transfers}
          productBatches={productBatches}
        />
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
  heroSection: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1.5rem',
    backgroundColor: '#fff',
    padding: '1.5rem 2rem',
    borderRadius: '16px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    border: '1px solid var(--border-color)',
    marginBottom: '0.5rem'
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
    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 8px 16px rgba(245, 158, 11, 0.25)',
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
    maxWidth: '650px'
  },
  heroActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem'
  },
  primaryHeroBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem 1.25rem',
    borderRadius: '10px',
    backgroundColor: '#f59e0b',
    color: '#fff',
    border: 'none',
    fontWeight: '700',
    fontSize: '0.9rem',
    cursor: 'pointer',
    boxShadow: '0 4px 10px rgba(245, 158, 11, 0.25)',
    transition: 'all 0.2s ease'
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
