import React, { useState, useEffect, useMemo } from 'react';
import { dbService } from '../../../firebase';
import { useUnit } from '../../../contexts/UnitContext';
import { parseDanfePdf } from '../../../utils/danfePdfParser';
import { 
  Package, Boxes, Clock, Calendar, Plus, Search, 
  X, FileText, UploadCloud, Briefcase, Warehouse,
  CheckCircle2, AlertTriangle, AlertCircle, ArrowUpRight, ArrowDownLeft, Trash2, Edit,
  ArrowUpDown, ArrowUp, ArrowDown, RefreshCw, Send, ClipboardList, Repeat
} from 'lucide-react';

export function useStockLogic(currentUser) {
  const { activeUnitId, filterByActiveUnit, matchItemUnit } = useUnit();

  const safeArray = (val) => {
    if (Array.isArray(val)) return val;
    if (val && typeof val === 'object') return Object.values(val);
    return [];
  };

  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory' | 'physical_inventory' | 'transfers' | 'invoices' | 'suppliers' | 'sectors' | 'transactions' | 'expiry' | 'loans'
  
  // Data States
  const [items, setItems] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loans, setLoans] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [requisitions, setRequisitions] = useState([]);
  const [stockLocations, setStockLocations] = useState([]);
  const [inventories, setInventories] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [productBatches, setProductBatches] = useState([]);
  const [productKits, setProductKits] = useState([]);
  const [tenantSettings, setTenantSettings] = useState({ requisitionTTLHours: 1 });

  // Filtragem de Dados pela Unidade Ativa
  const currentItems = useMemo(() => filterByActiveUnit(items), [items, activeUnitId]);
  const currentTransactions = useMemo(() => filterByActiveUnit(transactions), [transactions, activeUnitId]);
  const currentInvoices = useMemo(() => filterByActiveUnit(invoices), [invoices, activeUnitId]);
  const currentLoans = useMemo(() => filterByActiveUnit(loans), [loans, activeUnitId]);
  const currentRequisitions = useMemo(() => filterByActiveUnit(requisitions), [requisitions, activeUnitId]);
  const currentInventories = useMemo(() => filterByActiveUnit(inventories), [inventories, activeUnitId]);
  const currentTransfers = useMemo(() => filterByActiveUnit(transfers), [transfers, activeUnitId]);
  const currentProductBatches = useMemo(() => filterByActiveUnit(productBatches), [productBatches, activeUnitId]);
  const currentSuppliers = useMemo(() => filterByActiveUnit(suppliers), [suppliers, activeUnitId]);
  
  // Traceability & Recall State
  const [traceabilitySearchTerm, setTraceabilitySearchTerm] = useState('');
  const [traceabilityResult, setTraceabilityResult] = useState({ batches: [], dispensations: [] });
  const [traceabilityLoading, setTraceabilityLoading] = useState(false);
  
  // Requisition Fulfillment Modal State
  const [showFulfillModal, setShowFulfillModal] = useState(false);
  const [fulfillingReq, setFulfillingReq] = useState(null);
  const [fulfillItems, setFulfillItems] = useState([]);
  const [fulfillmentNotes, setFulfillmentNotes] = useState('');
  
  // Physical Inventories Modal & Counting State
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [editingInventory, setEditingInventory] = useState(null);
  const [inventoryForm, setInventoryForm] = useState({
    title: '',
    locationId: '',
    notes: ''
  });
  const [showCountModal, setShowCountModal] = useState(false);
  const [countingInventory, setCountingInventory] = useState(null);
  const [countItems, setCountItems] = useState([]);

  // Stock Transfers Modal State
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferForm, setTransferForm] = useState({
    originLocationId: '',
    destinationLocationId: '',
    itemId: '',
    quantity: '',
    batch: '',
    expiryDate: '',
    operator: 'Almoxarife João',
    notes: ''
  });

  // Product Kits Modal State (Kits de Insumos / Hemodiálise)
  const [showKitModal, setShowKitModal] = useState(false);
  const [editingKit, setEditingKit] = useState(null);
  const [kitForm, setKitForm] = useState({
    code: '',
    name: '',
    category: 'Hemodiálise',
    description: '',
    suggestedLocation: 'Salão 1',
    items: []
  });

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  // Column Sorting States for each tab
  const [inventorySort, setInventorySort] = useState({ key: 'name', direction: 'asc' });
  const [transactionSort, setTransactionSort] = useState({ key: 'date', direction: 'desc' });
  const [supplierSort, setSupplierSort] = useState({ key: 'name', direction: 'asc' });
  const [sectorSort, setSectorSort] = useState({ key: 'name', direction: 'asc' });
  const [invoiceSort, setInvoiceSort] = useState({ key: 'entryDate', direction: 'desc' });
  const [loanSort, setLoanSort] = useState({ key: 'loanDate', direction: 'desc' });
  const [kitSort, setKitSort] = useState({ key: 'name', direction: 'asc' });

  // Modals States
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [itemForm, setItemForm] = useState({
    name: '',
    category: 'Insumo Clínico / MatMed',
    currentStock: '0',
    minStock: '10',
    unit: 'unidades',
    price: '0.00',
    hasBatchControl: false,
    isControlled: false,
    defaultSectorId: ''
  });

  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [supplierForm, setSupplierForm] = useState({
    name: '',
    cnpj: '',
    contact: '',
    phone: '',
    email: ''
  });

  const [showSectorModal, setShowSectorModal] = useState(false);
  const [editingSector, setEditingSector] = useState(null);
  const [sectorForm, setSectorForm] = useState({
    name: '',
    description: ''
  });

  // Loans Modal State (Empréstimos de Produtos / Medicamentos)
  const [showLoanModal, setShowLoanModal] = useState(false);
  const [editingLoan, setEditingLoan] = useState(null);
  const [loanForm, setLoanForm] = useState({
    type: 'Concedido',
    productName: '',
    quantity: '1',
    unit: 'Caixa(s)',
    partnerName: '',
    loanDate: new Date().toISOString().substring(0, 10),
    expectedReturnDate: '',
    notes: ''
  });

  // Manual Transaction Modal State
  const [showTxForm, setShowTxForm] = useState(false);
  const [txForm, setTxForm] = useState({
    itemId: '',
    quantity: '',
    type: 'Entrada',
    batch: '',
    expiryDate: '',
    operator: 'Almoxarife João',
    notes: '',
    sectorId: ''
  });

  // XML & NFS-e Import Wizard States
  const [showXmlWizard, setShowXmlWizard] = useState(false);
  const [xmlWizardStep, setXmlWizardStep] = useState(1);
  const [xmlData, setXmlData] = useState(null);
  const [xmlError, setXmlError] = useState('');
  const [entryMode, setEntryMode] = useState('upload'); // 'upload' | 'manual'
  const [invoiceTypeFilter, setInvoiceTypeFilter] = useState('all'); // 'all' | 'product' | 'service'
  const [selectedInvoiceDetail, setSelectedInvoiceDetail] = useState(null);
  const [showInvoiceDetailModal, setShowInvoiceDetailModal] = useState(false);
  const [supplierMapping, setSupplierMapping] = useState({
    exists: false,
    id: '',
    name: '',
    cnpj: '',
    contact: '',
    phone: '',
    email: ''
  });
  const [itemMappings, setItemMappings] = useState([]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchTabData(activeTab);
  }, [activeTab]);

  const getTimeRemaining = (createdAt) => {
    if (!createdAt) return null;
    const ttlHours = parseFloat(tenantSettings?.requisitionTTLHours) || 1;
    const ttlMs = ttlHours * 60 * 60 * 1000;
    const createdMs = new Date(createdAt).getTime();
    if (isNaN(createdMs)) return null;
    const diff = (createdMs + ttlMs) - Date.now();
    if (diff <= 0) return { expired: true, text: 'Expirada', mins: 0 };
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return { expired: false, text: `${mins}m restantes`, mins, urgent: mins <= 15, attention: mins <= 30 };
    const hrs = Math.floor(mins / 60);
    const remMins = mins % 60;
    return { expired: false, text: `${hrs}h ${remMins}m`, mins, urgent: false, attention: false };
  };

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [itemList, supList, secList, catList, locList, batchList, kitList, reqList, tSettings] = await Promise.all([
        dbService.getInventoryItems ? dbService.getInventoryItems().catch(() => []) : [],
        dbService.getSuppliers ? dbService.getSuppliers().catch(() => []) : [],
        dbService.getStockSectors ? dbService.getStockSectors().catch(() => []) : [],
        dbService.getProductCategories ? dbService.getProductCategories().catch(() => []) : [],
        dbService.getStockLocations ? dbService.getStockLocations().catch(() => []) : [],
        dbService.getProductBatches ? dbService.getProductBatches().catch(() => []) : [],
        dbService.getProductKits ? dbService.getProductKits().catch(() => []) : [],
        dbService.getMaterialRequisitions ? dbService.getMaterialRequisitions().catch(() => []) : [],
        dbService.getTenantSettings ? dbService.getTenantSettings().catch(() => ({ requisitionTTLHours: 1 })) : { requisitionTTLHours: 1 }
      ]);
      
      setItems(safeArray(itemList));
      setSuppliers(safeArray(supList));
      setSectors(safeArray(secList));
      setStockLocations(safeArray(locList));
      setProductBatches(safeArray(batchList));
      setProductKits(safeArray(kitList));
      setRequisitions(safeArray(reqList));
      if (tSettings) setTenantSettings(tSettings);
      setCategoriesList((catList && safeArray(catList).length > 0) ? safeArray(catList) : [
        { id: 'c1', name: 'Insumo Clínico / MatMed' },
        { id: 'c2', name: 'Medicamento' },
        { id: 'c3', name: 'Medicamento Controlado' },
        { id: 'c4', name: 'OPME' },
        { id: 'c5', name: 'Fios Cirúrgicos' },
        { id: 'c6', name: 'Material de Limpeza' },
        { id: 'c7', name: 'Bens Permanentes / Patrimônio' },
        { id: 'c8', name: 'Material de Escritório' },
        { id: 'c9', name: 'EPI' },
        { id: 'c10', name: 'Osmose / Tratamento de Água' },
        { id: 'c11', name: 'Serviços Terceirizados' },
        { id: 'c12', name: 'Nutrição & Alimentação (SND)' },
        { id: 'c13', name: 'Manutenção & Conservação' },
        { id: 'c14', name: 'Obra & Infraestrutura' },
        { id: 'c15', name: 'Tecnologia da Informação (T.I)' },
        { id: 'c16', name: 'Descartáveis' },
        { id: 'c17', name: 'Diálise Peritoneal' }
      ]);

      if (itemList && itemList.length > 0) {
        setTxForm(f => ({ 
          ...f, 
          itemId: itemList[0].id,
          sectorId: secList?.[0]?.id || ''
        }));
        setItemForm(f => ({
          ...f,
          defaultSectorId: secList?.[0]?.id || ''
        }));
      }

      if (locList && locList.length > 0) {
        setInventoryForm(f => ({ ...f, locationId: locList[0].id }));
        setTransferForm(f => ({
          ...f,
          originLocationId: locList[0].id,
          destinationLocationId: locList[1]?.id || locList[0].id,
          itemId: itemList?.[0]?.id || ''
        }));
      }
    } catch (err) {
      console.error(err);
      showAlert('Erro ao carregar dados iniciais do estoque.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const fetchTabData = async (tab) => {
    try {
      if (tab === 'invoices' && invoices.length === 0) {
        const invList = await (dbService.getPurchaseInvoices ? dbService.getPurchaseInvoices().catch(() => []) : []);
        setInvoices(safeArray(invList));
      } else if (tab === 'transactions' && transactions.length === 0) {
        const txList = await (dbService.getStockTransactions ? dbService.getStockTransactions().catch(() => []) : []);
        // Slice to 100 max to prevent React memory rendering crash (Tela Branca)
        setTransactions(safeArray(txList).slice(0, 100));
      } else if (tab === 'requisitions' && requisitions.length === 0) {
        const reqList = await (dbService.getMaterialRequisitions ? dbService.getMaterialRequisitions().catch(() => []) : []);
        setRequisitions(safeArray(reqList));
      } else if (tab === 'physical_inventory' && inventories.length === 0) {
        const invsList = await (dbService.getInventories ? dbService.getInventories().catch(() => []) : []);
        setInventories(safeArray(invsList));
      } else if (tab === 'transfers' && transfers.length === 0) {
        const transList = await (dbService.getStockTransfers ? dbService.getStockTransfers().catch(() => []) : []);
        setTransfers(safeArray(transList));
      } else if (tab === 'loans' && loans.length === 0) {
        const loanList = await (dbService.getStockLoans ? dbService.getStockLoans().catch(() => []) : []);
        setLoans(safeArray(loanList));
      } else if (tab === 'expiry') {
        const bList = await (dbService.getProductBatches ? dbService.getProductBatches().catch(() => []) : []);
        setProductBatches(safeArray(bList));
      } else if (tab === 'kits' && productKits.length === 0) {
        const kitList = await (dbService.getProductKits ? dbService.getProductKits().catch(() => []) : []);
        setProductKits(safeArray(kitList));
      }
    } catch (err) {
      console.error(`Erro ao carregar dados da aba ${tab}:`, err);
    }
  };

  const fetchData = async () => {
    await fetchInitialData();
    await fetchTabData(activeTab);
  };

  const showAlert = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 5000);
  };

  // Sorting Helper Functions
  const sortData = (list, sortConfig) => {
    if (!Array.isArray(list)) return [];
    if (!sortConfig || !sortConfig.key) return list;
    return [...list].sort((a, b) => {
      let valA = (a && a[sortConfig.key]) ?? '';
      let valB = (b && b[sortConfig.key]) ?? '';

      if (['currentStock', 'minStock', 'price', 'quantity', 'totalValue'].includes(sortConfig.key)) {
        valA = parseFloat(valA) || 0;
        valB = parseFloat(valB) || 0;
      } else {
        valA = String(valA).toLowerCase();
        valB = String(valB).toLowerCase();
      }

      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const renderSortHeader = (label, key, currentSort, setSort) => {
    const isActive = currentSort.key === key;
    return (
      <th 
        style={{ padding: '0.75rem 1rem', fontWeight: '600', color: '#64748b', borderBottom: '1px solid var(--border-color)', backgroundColor: '#f8fafc', textAlign: 'left', cursor: 'pointer', userSelect: 'none' }} 
        onClick={() => {
          setSort({
            key,
            direction: isActive && currentSort.direction === 'asc' ? 'desc' : 'asc'
          });
        }}
        title={`Clique para ordenar por ${label}`}
      >
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <span>{label}</span>
          {isActive ? (
            currentSort.direction === 'asc' ? <ArrowUp size={13} color="#10b981" /> : <ArrowDown size={13} color="#10b981" />
          ) : (
            <ArrowUpDown size={12} color="#94a3b8" />
          )}
        </div>
      </th>
    );
  };

  // ----------------------------------------------------
  // Item Methods
  // ----------------------------------------------------
  const handleOpenAddModal = () => {
    setEditingItem(null);
    setItemForm({
      name: '',
      category: 'Insumo Clínico / MatMed',
      currentStock: '0',
      minStock: '10',
      unit: 'unidades',
      price: '0.00',
      hasBatchControl: false,
      isControlled: false,
      defaultSectorId: sectors[0]?.id || ''
    });
    setShowItemModal(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingItem(item);
    setItemForm({
      name: item.name,
      category: item.category,
      currentStock: item.currentStock.toString(),
      minStock: item.minStock.toString(),
      unit: item.unit || 'unidades',
      price: item.price ? item.price.toString() : '0.00',
      hasBatchControl: !!item.hasBatchControl,
      isControlled: !!item.isControlled,
      defaultSectorId: item.defaultSectorId || (sectors[0]?.id || '')
    });
    setShowItemModal(true);
  };

  const handleSaveItem = async (e) => {
    e.preventDefault();
    if (!itemForm.name) return showAlert('Nome do item é obrigatório.', 'warning');

    setActionLoading(true);
    try {
      const targetUnitId = activeUnitId === 'all' ? 'betim' : activeUnitId;
      const targetUnit = targetUnitId === 'taguatinga' ? 'Taguatinga' : 'Betim';

      const data = {
        name: itemForm.name,
        category: itemForm.category,
        currentStock: parseFloat(itemForm.currentStock) || 0,
        minStock: parseFloat(itemForm.minStock) || 0,
        unit: itemForm.unit,
        price: parseFloat(itemForm.price) || 0,
        hasBatchControl: !!itemForm.hasBatchControl,
        isControlled: !!itemForm.isControlled,
        defaultSectorId: itemForm.defaultSectorId,
        unitId: targetUnitId,
        unit: targetUnit
      };

      if (editingItem) {
        await dbService.updateInventoryItem(editingItem.id, data);
        showAlert('Item atualizado com sucesso!', 'success');
      } else {
        await dbService.createInventoryItem(data);
        showAlert('Item cadastrado com sucesso!', 'success');
      }
      setShowItemModal(false);
      fetchData();
    } catch (err) {
      showAlert('Erro ao salvar item no catálogo.', 'danger');
    } finally {
      setActionLoading(false);
    }
  };

  const handleQuickPurchaseRequest = async (item) => {
    setActionLoading(true);
    try {
      const neededQty = Math.max(10, (parseFloat(item.minStock) * 2) - parseFloat(item.currentStock));
      await dbService.createPurchase({
        type: 'Reposição',
        selectedStockId: item.id,
        productId: item.id,
        productName: item.name,
        quantity: neededQty,
        justification: `Reposição automática gerada por Estoque Crítico (Saldo: ${item.currentStock}, Mínimo: ${item.minStock}).`,
        sector: item.category || 'Almoxarifado',
        status: 'Aguardando Gestor',
        requesterName: 'Almoxarifado (Estoque)',
        requesterEmail: 'estoque@clinica.com',
        history: [
          { status: 'Aguardando Gestor', date: new Date().toISOString(), message: `Solicitação gerada automaticamente pelo alerta de estoque baixo no almoxarifado.` }
        ]
      });
      showAlert(`Solicitação de compra para "${item.name}" enviada para o Portal de Compras com sucesso!`, 'success');
    } catch (err) {
      console.error(err);
      showAlert('Erro ao enviar solicitação de compra.', 'danger');
    } finally {
      setActionLoading(false);
    }
  };

  // ----------------------------------------------------
  // Supplier Methods
  // ----------------------------------------------------
  const handleOpenSupplierAdd = () => {
    setEditingSupplier(null);
    setSupplierForm({ name: '', cnpj: '', contact: '', phone: '', email: '' });
    setShowSupplierModal(true);
  };

  const handleOpenSupplierEdit = (supplier) => {
    setEditingSupplier(supplier);
    setSupplierForm({
      name: supplier.name,
      cnpj: supplier.cnpj || '',
      contact: supplier.contact || '',
      phone: supplier.phone || '',
      email: supplier.email || ''
    });
    setShowSupplierModal(true);
  };

  const handleSaveSupplier = async (e) => {
    e.preventDefault();
    if (!supplierForm.name) return showAlert('Razão social/nome é obrigatório.', 'warning');

    setActionLoading(true);
    try {
      if (editingSupplier) {
        await dbService.updateSupplier(editingSupplier.id, supplierForm);
        showAlert('Fornecedor atualizado!', 'success');
      } else {
        await dbService.createSupplier({
          ...supplierForm,
          unitId: activeUnitId,
          unit: activeUnit?.name || (activeUnitId === 'taguatinga' ? 'Taguatinga' : 'Betim'),
          units: [activeUnitId]
        });
        showAlert('Fornecedor cadastrado!', 'success');
      }
      setShowSupplierModal(false);
      fetchData();
    } catch (err) {
      showAlert('Erro ao salvar fornecedor.', 'danger');
    } finally {
      setActionLoading(false);
    }
  };

  // ----------------------------------------------------
  // Sector Methods
  // ----------------------------------------------------
  const handleOpenSectorAdd = () => {
    setEditingSector(null);
    setSectorForm({ name: '', description: '' });
    setShowSectorModal(true);
  };

  const handleOpenSectorEdit = (sec) => {
    setEditingSector(sec);
    setSectorForm({
      name: sec.name,
      description: sec.description || ''
    });
    setShowSectorModal(true);
  };

  const handleSaveSector = async (e) => {
    e.preventDefault();
    if (!sectorForm.name) return showAlert('Nome do setor é obrigatório.', 'warning');

    setActionLoading(true);
    try {
      if (editingSector) {
        await dbService.updateStockSector(editingSector.id, sectorForm);
        showAlert('Setor de estoque atualizado!', 'success');
      } else {
        await dbService.createStockSector(sectorForm);
        showAlert('Setor de estoque cadastrado!', 'success');
      }
      setShowSectorModal(false);
      fetchData();
    } catch (err) {
      showAlert('Erro ao salvar setor de estoque.', 'danger');
    } finally {
      setActionLoading(false);
    }
  };
  const handleDeleteItem = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este item do catálogo de estoque?')) return;
    setActionLoading(true);
    try {
      if (dbService.deleteInventoryItem) await dbService.deleteInventoryItem(id);
      showAlert('Item excluído do catálogo.', 'success');
      fetchData();
    } catch (err) {
      showAlert('Erro ao excluir item.', 'danger');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteSupplier = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este fornecedor?')) return;
    setActionLoading(true);
    try {
      if (dbService.deleteSupplier) await dbService.deleteSupplier(id);
      showAlert('Fornecedor excluído.', 'success');
      fetchData();
    } catch (err) {
      showAlert('Erro ao excluir fornecedor.', 'danger');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteSector = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este setor físico?')) return;
    setActionLoading(true);
    try {
      if (dbService.deleteStockSector) await dbService.deleteStockSector(id);
      showAlert('Setor de estoque excluído.', 'success');
      fetchData();
    } catch (err) {
      showAlert('Erro ao excluir setor.', 'danger');
    } finally {
      setActionLoading(false);
    }
  };

  // ----------------------------------------------------
  // Product Kit Methods (Kits de Insumos)
  // ----------------------------------------------------
  const handleOpenKitAdd = () => {
    setEditingKit(null);
    setKitForm({
      code: `KIT-${String((productKits || []).length + 1).padStart(3, '0')}`,
      name: '',
      category: 'Hemodiálise',
      description: '',
      suggestedLocation: 'Salão 1',
      items: []
    });
    setShowKitModal(true);
  };

  const handleOpenKitEdit = (kit) => {
    setEditingKit(kit);
    setKitForm({
      code: kit.code || '',
      name: kit.name || '',
      category: kit.category || 'Hemodiálise',
      description: kit.description || '',
      suggestedLocation: kit.suggestedLocation || 'Salão 1',
      items: kit.items ? [...kit.items] : []
    });
    setShowKitModal(true);
  };

  const handleKitItemAdd = (itemId, quantity = 1) => {
    const itemObj = items.find(i => i.id === itemId);
    if (!itemObj) return;
    const existing = kitForm.items.find(i => i.itemId === itemId);
    if (existing) {
      setKitForm({
        ...kitForm,
        items: kitForm.items.map(i => i.itemId === itemId ? { ...i, quantity: i.quantity + quantity } : i)
      });
    } else {
      setKitForm({
        ...kitForm,
        items: [
          ...kitForm.items,
          {
            itemId: itemObj.id,
            itemName: itemObj.name,
            unit: itemObj.unit || 'unidades',
            quantity: quantity,
            price: parseFloat(itemObj.price) || 0,
            isControlled: !!itemObj.isControlled
          }
        ]
      });
    }
  };

  const handleKitItemRemove = (itemId) => {
    setKitForm({
      ...kitForm,
      items: kitForm.items.filter(i => i.itemId !== itemId)
    });
  };

  const handleKitItemQtyChange = (itemId, newQty) => {
    const qty = Math.max(1, parseFloat(newQty) || 1);
    setKitForm({
      ...kitForm,
      items: kitForm.items.map(i => i.itemId === itemId ? { ...i, quantity: qty } : i)
    });
  };

  const handleSaveKit = async (e) => {
    e?.preventDefault();
    if (!kitForm.name.trim()) {
      showAlert('Nome do Kit é obrigatório.', 'warning');
      return;
    }
    if (!kitForm.items || kitForm.items.length === 0) {
      showAlert('Adicione pelo menos um insumo componente ao Kit.', 'warning');
      return;
    }

    setActionLoading(true);
    try {
      const calculatedCost = kitForm.items.reduce((acc, it) => {
        const itemObj = items.find(i => i.id === it.itemId);
        const itemPrice = parseFloat(itemObj?.price) || (parseFloat(it.price) || 0);
        return acc + (itemPrice * (parseFloat(it.quantity) || 1));
      }, 0);

      const hasControlled = kitForm.items.some(it => {
        const itemObj = items.find(i => i.id === it.itemId);
        return itemObj?.isControlled || it.isControlled;
      });

      const payload = {
        ...kitForm,
        id: editingKit ? editingKit.id : undefined,
        totalCost: calculatedCost,
        hasControlledMedicine: hasControlled
      };

      const saved = await dbService.saveProductKit(payload);
      if (editingKit) {
        setProductKits(prev => prev.map(k => k.id === saved.id ? saved : k));
        showAlert(`Kit "${saved.name}" atualizado com sucesso!`, 'success');
      } else {
        setProductKits(prev => [saved, ...prev]);
        showAlert(`Kit "${saved.name}" cadastrado com sucesso!`, 'success');
      }
      setShowKitModal(false);
    } catch (err) {
      console.error('Erro ao salvar kit:', err);
      showAlert('Erro ao salvar kit de produtos.', 'danger');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteKit = async (kitId, kitName) => {
    if (!window.confirm(`Deseja realmente excluir o kit "${kitName}"?`)) return;
    try {
      await dbService.deleteProductKit(kitId);
      setProductKits(prev => prev.filter(k => k.id !== kitId));
      showAlert(`Kit "${kitName}" removido com sucesso.`, 'success');
    } catch (err) {
      console.error(err);
      showAlert('Erro ao excluir kit de produtos.', 'danger');
    }
  };

  // ----------------------------------------------------
  // Stock Loans Methods (Empréstimos)
  // ----------------------------------------------------
  const handleOpenLoanAdd = () => {
    setEditingLoan(null);
    setLoanForm({
      type: 'Concedido',
      productName: items[0]?.name || '',
      quantity: '1',
      unit: 'Caixa(s)',
      partnerName: '',
      loanDate: new Date().toISOString().substring(0, 10),
      expectedReturnDate: '',
      notes: ''
    });
    setShowLoanModal(true);
  };

  const handleOpenLoanEdit = (loan) => {
    setEditingLoan(loan);
    setLoanForm({
      type: loan.type,
      productName: loan.productName,
      quantity: String(loan.quantity),
      unit: loan.unit || 'Caixa(s)',
      partnerName: loan.partnerName,
      loanDate: loan.loanDate || new Date().toISOString().substring(0, 10),
      expectedReturnDate: loan.expectedReturnDate || '',
      notes: loan.notes || ''
    });
    setShowLoanModal(true);
  };

  const handleSaveLoan = async (e) => {
    e.preventDefault();
    if (!loanForm.productName || !loanForm.partnerName) {
      return showAlert('Informe o produto e a instituição parceira.', 'warning');
    }

    setActionLoading(true);
    try {
      const payload = {
        ...loanForm,
        ...(editingLoan ? { id: editingLoan.id, status: editingLoan.status } : { status: 'Ativo' })
      };
      await dbService.saveStockLoan(payload);
      showAlert(editingLoan ? 'Empréstimo atualizado com sucesso!' : 'Empréstimo de produto cadastrado com sucesso!', 'success');
      setShowLoanModal(false);
      fetchData();
    } catch (err) {
      showAlert('Erro ao salvar empréstimo.', 'danger');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReturnLoan = async (loan) => {
    if (!window.confirm(`Confirmar a devolução/baixa do empréstimo de "${loan.productName}" com ${loan.partnerName}?`)) return;
    setActionLoading(true);
    try {
      await dbService.returnStockLoan(loan.id);
      showAlert(`Empréstimo de "${loan.productName}" marcado como Devolvido!`, 'success');
      fetchData();
    } catch (err) {
      showAlert('Erro ao dar baixa no empréstimo.', 'danger');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteLoan = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir o registro deste empréstimo?')) return;
    setActionLoading(true);
    try {
      await dbService.deleteStockLoan(id);
      showAlert('Empréstimo excluído com sucesso.', 'success');
      fetchData();
    } catch (err) {
      showAlert('Erro ao excluir empréstimo.', 'danger');
    } finally {
      setActionLoading(false);
    }
  };

  // ----------------------------------------------------
  // Physical Inventories Handlers
  // ----------------------------------------------------
  const handleOpenInventoryAdd = () => {
    setEditingInventory(null);
    setInventoryForm({
      title: `Inventário Físico - ${new Date().toLocaleDateString('pt-BR')}`,
      locationId: stockLocations[0]?.id || '',
      notes: ''
    });
    setShowInventoryModal(true);
  };

  const handleSaveInventory = async (e) => {
    e.preventDefault();
    if (!inventoryForm.title || !inventoryForm.locationId) {
      return showAlert('Título e Local de Estoque são obrigatórios.', 'warning');
    }
    setActionLoading(true);
    try {
      const loc = stockLocations.find(l => l.id === inventoryForm.locationId);
      const payload = {
        title: inventoryForm.title,
        locationId: inventoryForm.locationId,
        locationName: loc ? loc.name : 'Estoque Geral',
        notes: inventoryForm.notes,
        status: 'Em Andamento',
        items: items.map(i => ({
          itemId: i.id,
          itemName: i.name,
          category: i.category,
          unit: i.unit,
          price: i.price,
          systemCount: i.currentStock,
          physicalCount: i.currentStock
        }))
      };
      await dbService.saveInventory(payload);
      showAlert('Inventário físico aberto com sucesso! Digite as contagens.', 'success');
      setShowInventoryModal(false);
      fetchData();
    } catch (err) {
      showAlert('Erro ao abrir inventário.', 'danger');
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenCountModal = (inv) => {
    setCountingInventory(inv);
    if (inv.items && inv.items.length > 0) {
      setCountItems(inv.items);
    } else {
      setCountItems(items.map(i => ({
        itemId: i.id,
        itemName: i.name,
        category: i.category,
        unit: i.unit,
        price: i.price,
        systemCount: i.currentStock,
        physicalCount: i.currentStock
      })));
    }
    setShowCountModal(true);
  };

  const handleUpdatePhysicalCount = (itemId, val) => {
    setCountItems(list => list.map(item => {
      if (item.itemId === itemId) {
        return { ...item, physicalCount: val };
      }
      return item;
    }));
  };

  const handleSaveCountDraft = async () => {
    if (!countingInventory) return;
    setActionLoading(true);
    try {
      await dbService.saveInventory({
        ...countingInventory,
        items: countItems
      });
      showAlert('Contagem física salva como rascunho.', 'success');
      setShowCountModal(false);
      fetchData();
    } catch (err) {
      showAlert('Erro ao salvar contagem.', 'danger');
    } finally {
      setActionLoading(false);
    }
  };

  const handleFinalizeInventorySubmit = async () => {
    if (!countingInventory) return;
    if (!window.confirm('Atenção: Ao concluir o inventário, os saldos de estoque do sistema serão ATUALIZADOS AUTOMATICAMENTE conforme a contagem física! Deseja continuar?')) return;
    
    setActionLoading(true);
    try {
      await dbService.finalizeInventory(countingInventory.id, countItems, 'Auditor de Estoque');
      showAlert('Inventário finalizado e saldos de estoque ajustados com sucesso!', 'success');
      setShowCountModal(false);
      fetchData();
    } catch (err) {
      showAlert('Erro ao finalizar inventário.', 'danger');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteInventory = async (id, title) => {
    if (!window.confirm(`Deseja cancelar/excluir o inventário "${title}"?`)) return;
    setActionLoading(true);
    try {
      await dbService.deleteInventory(id);
      showAlert('Inventário excluído.', 'success');
      fetchData();
    } catch (err) {
      showAlert('Erro ao excluir inventário.', 'danger');
    } finally {
      setActionLoading(false);
    }
  };

  // ----------------------------------------------------
  // Stock Transfers Handlers
  // ----------------------------------------------------
  const handleOpenTransferModal = () => {
    if (stockLocations.length < 2) {
      return showAlert('Você precisa ter pelo menos 2 locais de estoque cadastrados para efetuar transferências. Cadastre em Módulo T.I > Locais de Estoque.', 'warning');
    }
    if (items.length === 0) {
      return showAlert('Cadastre produtos no catálogo antes de efetuar transferências.', 'warning');
    }
    setTransferForm({
      originLocationId: stockLocations[0].id,
      destinationLocationId: stockLocations[1]?.id || stockLocations[0].id,
      itemId: items[0].id,
      quantity: '1',
      batch: '',
      expiryDate: '',
      operator: 'Almoxarife João',
      notes: ''
    });
    setShowTransferModal(true);
  };

  const handleSaveTransfer = async (e) => {
    e.preventDefault();
    if (transferForm.originLocationId === transferForm.destinationLocationId) {
      return showAlert('O local de origem e destino devem ser diferentes!', 'warning');
    }
    const qty = parseFloat(transferForm.quantity);
    if (isNaN(qty) || qty <= 0) return showAlert('Insira uma quantidade válida.', 'warning');

    const selectedItem = items.find(i => i.id === transferForm.itemId);
    if (!selectedItem) return showAlert('Produto não encontrado.', 'warning');

    if (selectedItem.currentStock < qty) {
      return showAlert(`Estoque insuficiente no local de origem! Saldo disponível: ${selectedItem.currentStock} ${selectedItem.unit}`, 'danger');
    }

    const originLoc = stockLocations.find(l => l.id === transferForm.originLocationId);
    const destLoc = stockLocations.find(l => l.id === transferForm.destinationLocationId);

    setActionLoading(true);
    try {
      await dbService.saveStockTransfer({
        originLocationId: transferForm.originLocationId,
        originLocationName: originLoc ? originLoc.name : 'Origem',
        destinationLocationId: transferForm.destinationLocationId,
        destinationLocationName: destLoc ? destLoc.name : 'Destino',
        itemId: transferForm.itemId,
        itemName: selectedItem.name,
        quantity: qty,
        unit: selectedItem.unit || 'unidades',
        batch: transferForm.batch || 'TRANSF',
        expiryDate: transferForm.expiryDate || '',
        operator: transferForm.operator,
        notes: transferForm.notes
      });

      showAlert(`Transferência de ${qty} ${selectedItem.unit} de "${selectedItem.name}" realizada com sucesso!`, 'success');
      setShowTransferModal(false);
      fetchData();
    } catch (err) {
      showAlert('Erro ao registrar transferência.', 'danger');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteTransfer = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este registro de transferência?')) return;
    setActionLoading(true);
    try {
      await dbService.deleteStockTransfer(id);
      showAlert('Registro de transferência excluído.', 'success');
      fetchData();
    } catch (err) {
      showAlert('Erro ao excluir transferência.', 'danger');
    } finally {
      setActionLoading(false);
    }
  };

  // ----------------------------------------------------
  // Manual Transaction Methods
  // ----------------------------------------------------
  const handleOpenTxForm = () => {
    if (items.length === 0) {
      return showAlert('Cadastre pelo menos um item no estoque antes de realizar movimentações.', 'warning');
    }
    setTxForm({
      itemId: items[0].id,
      quantity: '',
      type: 'Entrada',
      batch: '',
      expiryDate: '',
      operator: 'Almoxarife João',
      notes: '',
      sectorId: sectors[0]?.id || ''
    });
    setShowTxForm(true);
  };

  const handleSaveTransaction = async (e) => {
    e.preventDefault();
    if (!txForm.itemId || !txForm.quantity) return showAlert('Selecione o item e a quantidade.', 'warning');

    const qty = parseFloat(txForm.quantity);
    if (isNaN(qty) || qty <= 0) return showAlert('A quantidade deve ser maior que zero.', 'warning');

    const selectedItem = items.find(i => i.id === txForm.itemId);
    if (txForm.type === 'Saída' && selectedItem.currentStock < qty) {
      return showAlert(`Estoque insuficiente! Saldo atual: ${selectedItem.currentStock} ${selectedItem.unit}`, 'danger');
    }

    setActionLoading(true);
    try {
      await dbService.createStockTransaction({
        itemId: txForm.itemId,
        itemName: selectedItem.name,
        quantity: qty,
        type: txForm.type,
        batch: txForm.batch,
        expiryDate: txForm.expiryDate,
        operator: txForm.operator,
        notes: txForm.notes,
        sectorId: txForm.sectorId
      });

      if (txForm.type === 'Entrada' && txForm.batch && dbService.upsertProductBatchOnEntry) {
        await dbService.upsertProductBatchOnEntry({
          itemId: txForm.itemId,
          itemName: selectedItem.name,
          batchNumber: txForm.batch,
          expiryDate: txForm.expiryDate || '',
          quantity: qty,
          unit: selectedItem.unit || 'unidades',
          costPrice: selectedItem.price || 0,
          supplierName: 'Entrada Manual',
          invoiceNumber: 'MANUAL',
          sectorId: txForm.sectorId
        });
      }

      showAlert('Movimentação registrada com sucesso!', 'success');
      setShowTxForm(false);
      fetchData();
    } catch (err) {
      showAlert('Erro ao registrar movimentação.', 'danger');
    } finally {
      setActionLoading(false);
    }
  };

  // ----------------------------------------------------
  // Requisition Fulfillment Methods (Atendimento de Requisições & Rastreabilidade)
  // ----------------------------------------------------
  const handleOpenFulfillModal = (req) => {
    setFulfillingReq(req);
    const initialItems = req.items ? req.items.map(i => {
      // Find candidate batches for this item ordered by FEFO (expiryDate asc)
      const itemBatches = (productBatches || [])
        .filter(b => b.itemId === i.itemId && (parseFloat(b.currentQuantity) || 0) > 0)
        .sort((a, b) => new Date(a.expiryDate || '9999-12-31') - new Date(b.expiryDate || '9999-12-31'));

      const bestBatch = itemBatches.length > 0 ? itemBatches[0] : null;

      return {
        ...i,
        deliveredQuantity: i.deliveredQuantity > 0 ? i.deliveredQuantity : i.requestedQuantity,
        batchId: i.batchId || (bestBatch ? bestBatch.id : ''),
        batchNumber: i.batchNumber || (bestBatch ? bestBatch.batchNumber : (i.batch || '')),
        expiryDate: i.expiryDate || (bestBatch ? bestBatch.expiryDate : '')
      };
    }) : [];
    setFulfillItems(initialItems);
    setFulfillmentNotes(req.fulfillment?.notes || '');
    setShowFulfillModal(true);
  };

  const handleFulfillQuantityChange = (index, val) => {
    const qty = parseInt(val, 10);
    const updated = [...fulfillItems];
    updated[index].deliveredQuantity = isNaN(qty) || qty < 0 ? 0 : qty;
    setFulfillItems(updated);
  };

  const handleFulfillBatchChange = (index, selectedBatchId) => {
    const updated = [...fulfillItems];
    if (!selectedBatchId) {
      updated[index].batchId = '';
      updated[index].batchNumber = '';
      updated[index].expiryDate = '';
    } else {
      const foundBatch = (productBatches || []).find(b => b.id === selectedBatchId);
      if (foundBatch) {
        updated[index].batchId = foundBatch.id;
        updated[index].batchNumber = foundBatch.batchNumber;
        updated[index].expiryDate = foundBatch.expiryDate;
      }
    }
    setFulfillItems(updated);
  };

  const handleFulfillManualBatchChange = (index, field, value) => {
    const updated = [...fulfillItems];
    updated[index][field] = value;
    setFulfillItems(updated);
  };

  const handleFillAllRequestedQuantity = () => {
    const updated = fulfillItems.map(i => ({
      ...i,
      deliveredQuantity: i.requestedQuantity
    }));
    setFulfillItems(updated);
  };

  const handleProcessFulfillment = async (targetStatus) => {
    if (!fulfillingReq) return;

    setActionLoading(true);
    try {
      let finalStatus = targetStatus;
      
      if (targetStatus === 'AUTO') {
        const totalRequested = fulfillItems.reduce((acc, i) => acc + (i.requestedQuantity || 0), 0);
        const totalDelivered = fulfillItems.reduce((acc, i) => acc + (i.deliveredQuantity || 0), 0);
        
        if (totalDelivered <= 0) {
          finalStatus = 'Cancelado';
        } else if (totalDelivered < totalRequested) {
          finalStatus = 'Parcial';
        } else {
          finalStatus = 'Entregue';
        }
      }

      if (finalStatus === 'Entregue' || finalStatus === 'Parcial') {
        for (const fItem of fulfillItems) {
          const delQty = parseFloat(fItem.deliveredQuantity) || 0;
          if (delQty > 0) {
            const targetStockItem = items.find(i => i.id === fItem.itemId || i.name.toLowerCase() === fItem.itemName.toLowerCase());
            if (targetStockItem) {
              // 1. Deduct general stock
              const newStock = Math.max(0, (parseFloat(targetStockItem.currentStock) || 0) - delQty);
              await dbService.updateInventoryItem(targetStockItem.id, {
                ...targetStockItem,
                currentStock: newStock
              });

              // 2. Deduct specific batch if selected
              if (fItem.batchId && dbService.deductProductBatch) {
                await dbService.deductProductBatch(fItem.batchId, delQty);
              }

              // 3. Register transaction log
              await dbService.createStockTransaction({
                itemId: targetStockItem.id,
                itemName: targetStockItem.name,
                quantity: delQty,
                type: 'Saída',
                batch: fItem.batchNumber || 'GERAL',
                expiryDate: fItem.expiryDate || '',
                operator: 'Farmácia Central',
                notes: `Atendimento Requisição ${fulfillingReq.requisitionCode} (Destino: ${fulfillingReq.patientName || 'Salão'})`
              });

              // 4. Record patient dispensation for complete traceability & chart history
              if (dbService.savePatientDispensation) {
                await dbService.savePatientDispensation({
                  patientId: fulfillingReq.patientId || '',
                  patientName: fulfillingReq.patientName || 'Uso Geral / Salão',
                  requisitionId: fulfillingReq.id,
                  requisitionCode: fulfillingReq.requisitionCode || '',
                  requestedBy: fulfillingReq.requestedBy || 'Enfermagem',
                  fulfilledBy: 'Farmácia Central',
                  itemId: targetStockItem.id,
                  itemName: targetStockItem.name,
                  quantity: delQty,
                  unit: fItem.unit || targetStockItem.unit || 'unidades',
                  batchId: fItem.batchId || '',
                  batchNumber: fItem.batchNumber || '',
                  expiryDate: fItem.expiryDate || '',
                  date: new Date().toISOString(),
                  notes: fulfillmentNotes
                });
              }
            }
          }
        }
      }

      const updatedReqPayload = {
        ...fulfillingReq,
        status: finalStatus,
        items: fulfillItems,
        fulfillment: {
          fulfilledBy: 'Farmácia Central',
          fulfilledAt: new Date().toISOString(),
          notes: fulfillmentNotes
        }
      };

      await dbService.saveMaterialRequisition(updatedReqPayload);

      if (dbService.createAuditLog) {
        await dbService.createAuditLog({
          operator: 'Farmácia Central',
          action: `Atendimento de Requisição (${finalStatus})`,
          details: `Requisição ${fulfillingReq.requisitionCode} finalizada com status "${finalStatus}". Solicitada por: ${fulfillingReq.requestedBy}. Paciente: ${fulfillingReq.patientName || 'Uso Geral'}.`
        });
      }

      showAlert(`Requisição ${fulfillingReq.requisitionCode} processada como "${finalStatus}" e baixa efetuada no estoque!`, 'success');
      setShowFulfillModal(false);
      fetchData();
    } catch (err) {
      console.error(err);
      showAlert('Erro ao processar atendimento de requisição.', 'danger');
    } finally {
      setActionLoading(false);
    }
  };

  // ----------------------------------------------------
  // Traceability & Recall Search
  // ----------------------------------------------------
  const handleSearchTraceability = async (term = null) => {
    const queryTerm = term !== null ? term : traceabilitySearchTerm;
    if (!queryTerm || !queryTerm.trim()) {
      setTraceabilityResult({ batches: [], dispensations: [] });
      return;
    }
    setTraceabilityLoading(true);
    try {
      if (dbService.getBatchTraceability) {
        const res = await dbService.getBatchTraceability(queryTerm);
        setTraceabilityResult(res || { batches: [], dispensations: [] });
      }
    } catch (e) {
      console.error('Erro ao buscar rastreabilidade:', e);
      showAlert('Erro ao buscar rastreabilidade do lote.', 'danger');
    } finally {
      setTraceabilityLoading(false);
    }
  };

  // ----------------------------------------------------
  // Início de Entrada Manual de Nota (Serviço ou Produto)
  // ----------------------------------------------------
  const handleStartManualServiceEntry = (type = 'service') => {
    const today = new Date().toISOString().substring(0, 10);
    const defaultDueDate = new Date();
    defaultDueDate.setDate(defaultDueDate.getDate() + 30);

    setXmlData({
      number: '',
      accessKey: '',
      issueDate: today,
      totalValue: '',
      supplierName: '',
      supplierCnpj: '',
      serviceDescription: '',
      serviceCategory: 'Serviços Terceirizados',
      items: [{
        xmlCode: 'SERV-01',
        xmlName: 'Serviço Prestado',
        quantity: 1,
        price: 0,
        total: 0,
        batch: '',
        expiryDate: '',
        isService: true
      }],
      installments: [{
        installmentNumber: '1/1',
        dueDate: defaultDueDate.toISOString().substring(0, 10),
        amount: ''
      }],
      sourceType: 'MANUAL',
      invoiceType: type
    });

    setSupplierMapping({
      exists: false,
      id: '',
      name: '',
      cnpj: '',
      contact: 'Prestador de Serviço',
      phone: '',
      email: ''
    });

    setItemMappings([{
      xmlCode: 'SERV-01',
      xmlName: 'Serviço Prestado',
      quantity: 1,
      price: 0,
      batch: '',
      expiryDate: '',
      mappedItemId: 'SERVICE_NO_STOCK'
    }]);

    setXmlError('');
    setEntryMode('manual');
    setXmlWizardStep(1);
    setShowXmlWizard(true);
  };

  const handleStartImportWizard = () => {
    setXmlData(null);
    setEntryMode('upload');
    setXmlWizardStep(1);
    setXmlError('');
    setShowXmlWizard(true);
  };

  // ----------------------------------------------------
  // XML & PDF (DANFE / NFS-e) Import Methods (Parser)
  // ----------------------------------------------------
  const handleXmlUpload = async (e) => {
    setXmlError('');
    const file = e.target.files[0];
    if (!file) return;

    const isPdf = file.name.toLowerCase().endsWith('.pdf') || file.type === 'application/pdf';

    if (isPdf) {
      setActionLoading(true);
      try {
        const arrayBuffer = await file.arrayBuffer();
        const parsed = await parseDanfePdf(arrayBuffer);
        const isService = (xmlData?.invoiceType === 'service') || (parsed.invoiceType === 'service') || (!parsed.items || parsed.items.length === 0);

        const sumInst = (parsed.installments || []).reduce((acc, inst) => acc + (parseFloat(inst.amount) || 0), 0);
        const finalTotal = (parseFloat(parsed.totalValue) > 0) ? parseFloat(parsed.totalValue) : sumInst;

        setXmlData({
          number: parsed.number,
          accessKey: parsed.accessKey,
          issueDate: parsed.issueDate,
          totalValue: finalTotal,
          supplierName: parsed.supplierName,
          supplierCnpj: parsed.supplierCnpj,
          items: isService ? [] : parsed.items,
          installments: (parsed.installments && parsed.installments.length > 0) ? parsed.installments : [{
            installmentNumber: '1/1',
            dueDate: parsed.issueDate || new Date().toISOString().substring(0, 10),
            amount: finalTotal
          }],
          sourceType: 'PDF',
          invoiceType: isService ? 'service' : 'product',
          serviceDescription: parsed.serviceDescription || (isService ? `Prestação de serviços conforme documento Nº ${parsed.number}` : ''),
          serviceCategory: xmlData?.serviceCategory || 'Serviços Terceirizados'
        });

        // Step 2 Setup: Check if supplier exists
        const formattedCnpj = formatCnpj(parsed.supplierCnpj);
        const existingSupplier = suppliers.find(s => cleanCnpj(s.cnpj) === cleanCnpj(parsed.supplierCnpj));

        if (existingSupplier) {
          setSupplierMapping({
            exists: true,
            id: existingSupplier.id,
            name: existingSupplier.name,
            cnpj: existingSupplier.cnpj,
            contact: existingSupplier.contact || '',
            phone: existingSupplier.phone || '',
            email: existingSupplier.email || ''
          });
        } else {
          setSupplierMapping({
            exists: false,
            id: '',
            name: parsed.supplierName,
            cnpj: formattedCnpj,
            contact: isService ? 'Prestador NFS-e' : 'Contato DANFE PDF',
            phone: '',
            email: ''
          });
        }

        // Step 3 Setup: Build item mappings
        if (isService) {
          setItemMappings([]);
        } else {
          const mappings = (parsed.items || []).map(pi => {
            const matchedItem = items.find(item => 
              item.name.toLowerCase().includes(pi.xmlName.toLowerCase()) || 
              pi.xmlName.toLowerCase().includes(item.name.toLowerCase())
            );

            return {
              xmlCode: pi.xmlCode,
              xmlName: pi.xmlName,
              quantity: pi.quantity,
              price: pi.price,
              batch: pi.batch || '',
              expiryDate: pi.expiryDate || '',
              mappedItemId: matchedItem ? matchedItem.id : 'CREATE_NEW'
            };
          });
          setItemMappings(mappings);
        }

        setXmlWizardStep(2);
      } catch (err) {
        console.error(err);
        setXmlError(err.message || 'Erro ao processar o arquivo PDF da DANFE/NFS-e.');
      } finally {
        setActionLoading(false);
      }
      return;
    }

    // XML parsing
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(evt.target.result, 'text/xml');
        
        // Verifica se é XML de NFS-e (padrão ABRASF, municipal ou nacional)
        const isNfseXml = xmlDoc.getElementsByTagName('CompNfse').length > 0 ||
                          xmlDoc.getElementsByTagName('Nfse').length > 0 ||
                          xmlDoc.getElementsByTagName('InfNfse').length > 0 ||
                          xmlDoc.getElementsByTagName('tcCompNfse').length > 0 ||
                          xmlDoc.getElementsByTagName('ConsultarNfseResposta').length > 0 ||
                          xmlDoc.getElementsByTagName('NFSe').length > 0 ||
                          xmlDoc.getElementsByTagName('infNFSe').length > 0;

        if (isNfseXml) {
          const numNfse = xmlDoc.getElementsByTagName('Numero')[0]?.textContent ||
                          xmlDoc.getElementsByTagName('nNFSe')[0]?.textContent ||
                          xmlDoc.getElementsByTagName('NumeroRps')[0]?.textContent ||
                          String(Math.floor(100000 + Math.random() * 900000));

          const codVerif = xmlDoc.getElementsByTagName('CodigoVerificacao')[0]?.textContent ||
                           xmlDoc.getElementsByTagName('cVerif')[0]?.textContent || '';

          const dEmiRaw = xmlDoc.getElementsByTagName('DataEmissao')[0]?.textContent ||
                          xmlDoc.getElementsByTagName('dEmi')[0]?.textContent || '';
          const issueDate = dEmiRaw ? dEmiRaw.substring(0, 10) : new Date().toISOString().substring(0, 10);

          const prestadorNome = xmlDoc.querySelector('PrestadorServico RazaoSocial')?.textContent ||
                                xmlDoc.querySelector('Prestador RazaoSocial')?.textContent ||
                                xmlDoc.querySelector('emit xNome')?.textContent ||
                                xmlDoc.getElementsByTagName('RazaoSocial')[0]?.textContent ||
                                'Prestador de Serviço';

          const prestadorCnpj = xmlDoc.querySelector('PrestadorServico Cnpj')?.textContent ||
                                xmlDoc.querySelector('IdentificacaoPrestador Cnpj')?.textContent ||
                                xmlDoc.querySelector('emit CNPJ')?.textContent ||
                                xmlDoc.getElementsByTagName('Cnpj')[0]?.textContent ||
                                xmlDoc.getElementsByTagName('CNPJ')[0]?.textContent || '';

          const vServ = parseFloat(xmlDoc.getElementsByTagName('ValorServicos')[0]?.textContent ||
                                   xmlDoc.getElementsByTagName('ValorLiquidoNfse')[0]?.textContent ||
                                   xmlDoc.getElementsByTagName('vServPrest')[0]?.textContent ||
                                   xmlDoc.getElementsByTagName('vNFSe')[0]?.textContent || 0);

          const discriminacao = xmlDoc.getElementsByTagName('Discriminacao')[0]?.textContent ||
                                xmlDoc.getElementsByTagName('xDescServ')[0]?.textContent ||
                                `Prestação de serviços conforme NFS-e Nº ${numNfse}`;

          const defaultDueDate = new Date();
          defaultDueDate.setDate(defaultDueDate.getDate() + 30);

          setXmlData({
            number: numNfse,
            accessKey: codVerif,
            issueDate: issueDate,
            totalValue: vServ,
            supplierName: prestadorNome,
            supplierCnpj: prestadorCnpj,
            serviceDescription: discriminacao.trim().slice(0, 300),
            serviceCategory: 'Serviços Terceirizados',
            items: [{
              xmlCode: 'SERV-01',
              xmlName: discriminacao.trim().slice(0, 200) || `Serviço NFS-e Nº ${numNfse}`,
              quantity: 1,
              price: vServ,
              total: vServ,
              batch: '',
              expiryDate: '',
              isService: true
            }],
            installments: [{
              installmentNumber: '1/1',
              dueDate: defaultDueDate.toISOString().substring(0, 10),
              amount: vServ
            }],
            sourceType: 'XML',
            invoiceType: 'service'
          });

          const formattedCnpj = formatCnpj(prestadorCnpj);
          const existingSupplier = suppliers.find(s => cleanCnpj(s.cnpj) === cleanCnpj(prestadorCnpj));

          if (existingSupplier) {
            setSupplierMapping({
              exists: true,
              id: existingSupplier.id,
              name: existingSupplier.name,
              cnpj: existingSupplier.cnpj,
              contact: existingSupplier.contact || '',
              phone: existingSupplier.phone || '',
              email: existingSupplier.email || ''
            });
          } else {
            setSupplierMapping({
              exists: false,
              id: '',
              name: prestadorNome,
              cnpj: formattedCnpj,
              contact: 'Prestador XML NFS-e',
              phone: '',
              email: ''
            });
          }

          setItemMappings([{
            xmlCode: 'SERV-01',
            xmlName: discriminacao.trim().slice(0, 200) || `Serviço NFS-e Nº ${numNfse}`,
            quantity: 1,
            price: vServ,
            batch: '',
            expiryDate: '',
            mappedItemId: 'SERVICE_NO_STOCK'
          }]);

          setXmlWizardStep(2);
          return;
        }

        // Caso seja NF-e de Produtos
        const nNF = xmlDoc.getElementsByTagName('nNF')[0]?.textContent;
        if (!nNF) {
          throw new Error('Nós obrigatórios de NF-e ou NFS-e não encontrados. Certifique-se de que é um XML de Nota Fiscal válido.');
        }

        const chNFe = xmlDoc.getElementsByTagName('chNFe')[0]?.textContent || 
                       xmlDoc.getElementsByTagName('infNFe')[0]?.getAttribute('Id')?.replace('NFe', '') || '';
        const dhEmi = xmlDoc.getElementsByTagName('dhEmi')[0]?.textContent || 
                       xmlDoc.getElementsByTagName('dEmi')[0]?.textContent || '';
        const vNF = parseFloat(xmlDoc.getElementsByTagName('vNF')[0]?.textContent || 0);

        // Emitente (Supplier)
        const emitName = xmlDoc.querySelector('emit xNome')?.textContent || '';
        const emitCnpj = xmlDoc.querySelector('emit CNPJ')?.textContent || '';

        // Products details
        const detNodes = xmlDoc.getElementsByTagName('det');
        const parsedItems = [];

        for (let i = 0; i < detNodes.length; i++) {
          const det = detNodes[i];
          const cProd = det.querySelector('prod cProd')?.textContent || '';
          const xProd = det.querySelector('prod xProd')?.textContent || '';
          const qCom = parseFloat(det.querySelector('prod qCom')?.textContent || 0);
          const vUnCom = parseFloat(det.querySelector('prod vUnCom')?.textContent || 0);
          const vProd = parseFloat(det.querySelector('prod vProd')?.textContent || 0);
          
          // Try to extract batch/expiry info (commonly inside rastro/med)
          const nLote = det.querySelector('rastro nLote')?.textContent || det.querySelector('med nLote')?.textContent || '';
          const dVal = det.querySelector('rastro dVal')?.textContent || det.querySelector('med dVal')?.textContent || '';

          parsedItems.push({
            xmlCode: cProd,
            xmlName: xProd,
            quantity: qCom,
            price: vUnCom,
            total: vProd,
            batch: nLote,
            expiryDate: dVal
          });
        }

        // Extract installments / duplicatas (<cobr><dup>)
        const dupNodes = xmlDoc.getElementsByTagName('dup');
        const installments = [];
        if (dupNodes.length > 0) {
          for (let i = 0; i < dupNodes.length; i++) {
            const dup = dupNodes[i];
            const nDup = dup.querySelector('nDup')?.textContent || `${i + 1}/${dupNodes.length}`;
            const dVenc = dup.querySelector('dVenc')?.textContent || '';
            const vDup = parseFloat(dup.querySelector('vDup')?.textContent || 0);
            if (vDup > 0) {
              installments.push({
                installmentNumber: nDup,
                dueDate: dVenc,
                amount: vDup
              });
            }
          }
        }

        const issueDate = (dhEmi || '').substring(0, 10) || new Date().toISOString().substring(0, 10);

        // Save parsed XML state
        setXmlData({
          number: nNF,
          accessKey: chNFe,
          issueDate: issueDate,
          totalValue: vNF,
          supplierName: emitName,
          supplierCnpj: emitCnpj,
          items: parsedItems,
          installments: installments.length > 0 ? installments : [{
            installmentNumber: '1/1',
            dueDate: issueDate,
            amount: vNF
          }],
          sourceType: 'XML',
          invoiceType: 'product',
          serviceDescription: ''
        });

        // Step 2 Setup: Check if supplier exists
        const formattedCnpj = formatCnpj(emitCnpj);
        const existingSupplier = suppliers.find(s => cleanCnpj(s.cnpj) === cleanCnpj(emitCnpj));
        
        if (existingSupplier) {
          setSupplierMapping({
            exists: true,
            id: existingSupplier.id,
            name: existingSupplier.name,
            cnpj: existingSupplier.cnpj,
            contact: existingSupplier.contact,
            phone: existingSupplier.phone,
            email: existingSupplier.email
          });
        } else {
          setSupplierMapping({
            exists: false,
            id: '',
            name: emitName,
            cnpj: formattedCnpj,
            contact: 'Contato XML',
            phone: '',
            email: ''
          });
        }

        // Step 3 Setup: Build item mappings
        const mappings = parsedItems.map(pi => {
          // Attempt fuzzy match by name
          const matchedItem = items.find(item => 
            item.name.toLowerCase().includes(pi.xmlName.toLowerCase()) || 
            pi.xmlName.toLowerCase().includes(item.name.toLowerCase())
          );

          return {
            xmlCode: pi.xmlCode,
            xmlName: pi.xmlName,
            quantity: pi.quantity,
            price: pi.price,
            batch: pi.batch || '',
            expiryDate: pi.expiryDate || '',
            mappedItemId: matchedItem ? matchedItem.id : 'CREATE_NEW'
          };
        });

        setItemMappings(mappings);
        setXmlWizardStep(2);
      } catch (err) {
        console.error(err);
        setXmlError(err.message || 'Erro ao processar o arquivo XML.');
      }
    };
    reader.readAsText(file);
  };

  const handleConfirmSupplierMapping = async () => {
    // If supplier doesn't exist, we must create it
    if (!supplierMapping.exists) {
      setActionLoading(true);
      try {
        const newSup = await dbService.createSupplier({
          name: supplierMapping.name,
          cnpj: supplierMapping.cnpj,
          contact: supplierMapping.contact,
          phone: supplierMapping.phone,
          email: supplierMapping.email
        });
        
        setSupplierMapping(f => ({ ...f, exists: true, id: newSup.id }));
        showAlert(`Fornecedor ${newSup.name} cadastrado com sucesso!`, 'success');
      } catch (err) {
        showAlert('Erro ao auto-cadastrar fornecedor.', 'danger');
        setActionLoading(false);
        return;
      } finally {
        setActionLoading(false);
      }
    }
    // Avanca para a Etapa 3: Financeiro
    setXmlWizardStep(3);
  };

  const handleUpdateInstallment = (index, field, value) => {
    setXmlData(prev => {
      if (!prev || !prev.installments) return prev;
      const updated = [...prev.installments];
      updated[index] = {
        ...updated[index],
        [field]: field === 'amount' ? (parseFloat(value) || 0) : value
      };
      return { ...prev, installments: updated };
    });
  };

  const handleAddInstallment = () => {
    setXmlData(prev => {
      if (!prev) return prev;
      const currentList = prev.installments || [];
      const nextNum = currentList.length + 1;
      const defaultDueDate = new Date();
      defaultDueDate.setDate(defaultDueDate.getDate() + (30 * nextNum));
      
      const updated = [
        ...currentList,
        {
          installmentNumber: `${nextNum}/${nextNum}`,
          dueDate: defaultDueDate.toISOString().substring(0, 10),
          amount: 0
        }
      ];
      return { ...prev, installments: updated };
    });
  };

  const handleRemoveInstallment = (index) => {
    setXmlData(prev => {
      if (!prev || !prev.installments) return prev;
      const updated = prev.installments.filter((_, idx) => idx !== index);
      return { ...prev, installments: updated };
    });
  };

  const handleMappingItemChange = (xmlCode, itemId) => {
    setItemMappings(prev => prev.map(m => m.xmlCode === xmlCode ? { ...m, mappedItemId: itemId } : m));
  };

  const handleMappingFieldChange = (xmlCode, field, value) => {
    setItemMappings(prev => prev.map(m => m.xmlCode === xmlCode ? { ...m, [field]: value } : m));
  };

  const getSelectedUnit = () => {
    try {
      const stored = localStorage.getItem('nexa_active_unit');
      if (stored && stored !== 'all') return stored;
    } catch (e) {}
    if (currentUser?.primaryUnit && currentUser.primaryUnit !== 'all') return currentUser.primaryUnit;
    return 'betim';
  };

  const handleFinishXmlWizard = async () => {
    setActionLoading(true);
    const currentUnitId = getSelectedUnit();
    const currentUnitName = currentUnitId === 'taguatinga' ? 'Taguatinga' : 'Betim';
    try {
      const isService = xmlData?.invoiceType === 'service' || (!itemMappings || itemMappings.length === 0);
      const sumInst = (xmlData?.installments || []).reduce((acc, inst) => acc + (parseFloat(inst.amount) || 0), 0);
      const finalInvoiceTotal = (parseFloat(xmlData?.totalValue) > 0) ? parseFloat(xmlData.totalValue) : (sumInst > 0 ? sumInst : 0);

      if (isService) {
        // --- FLUXO DE NOTA DE SERVIÇOS PRESTADOS (NFS-e) ---
        const serviceItems = [{
          name: xmlData.serviceDescription || 'Serviço Prestado',
          quantity: 1,
          price: finalInvoiceTotal,
          total: finalInvoiceTotal,
          isService: true
        }];

        // Step 1: Gravar NFS-e no histórico de notas fiscais
        await dbService.createPurchaseInvoice({
          number: xmlData.number,
          accessKey: xmlData.accessKey || '',
          issueDate: xmlData.issueDate,
          supplierId: supplierMapping.id,
          supplierName: supplierMapping.name,
          supplierCnpj: supplierMapping.cnpj,
          totalValue: finalInvoiceTotal,
          items: serviceItems,
          installments: xmlData.installments || [],
          unitId: currentUnitId,
          unit: currentUnitName,
          invoiceType: 'service',
          serviceDescription: xmlData.serviceDescription || '',
          serviceCategory: xmlData.serviceCategory || 'Serviços Terceirizados'
        });

        // Step 2: Lançamento automático no Contas a Pagar do Financeiro para cada parcela
        if (dbService.saveAccountsPayable) {
          const instList = (xmlData.installments && xmlData.installments.length > 0) 
            ? xmlData.installments 
            : [{ installmentNumber: '1/1', dueDate: xmlData.issueDate || new Date().toISOString().substring(0, 10), amount: finalInvoiceTotal }];

          for (const inst of instList) {
            const defaultDueDate = new Date();
            defaultDueDate.setDate(defaultDueDate.getDate() + 30);
            const finalDueDate = inst.dueDate || defaultDueDate.toISOString().substring(0, 10);

            await dbService.saveAccountsPayable({
              supplier: supplierMapping.name,
              cnpj: supplierMapping.cnpj || '00.000.000/0001-00',
              description: `Entrada NFS-e Nº ${xmlData.number} - ${(xmlData.serviceDescription || 'Serviço Prestado').slice(0, 45)} (Parcela ${inst.installmentNumber})`,
              amount: parseFloat(inst.amount) || finalInvoiceTotal || 0,
              dueDate: finalDueDate,
              category: xmlData.serviceCategory || 'Serviços Terceirizados',
              invoiceNumber: xmlData.number,
              accessKey: xmlData.accessKey || '',
              documentType: 'NFS-e',
              status: 'Pendente',
              unitId: currentUnitId,
              unit: currentUnitName
            });
          }
        }

        showAlert(`Nota Fiscal de Serviços Nº ${xmlData.number} processada! Documento arquivado e ${(xmlData.installments || []).length || 1} conta(s) a pagar lançada(s) no Financeiro.`, 'success');
        setShowXmlWizard(false);
        const invList = await (dbService.getPurchaseInvoices ? dbService.getPurchaseInvoices().catch(() => []) : []);
        setInvoices(safeArray(invList));
        fetchData();
        return;
      }

      // --- FLUXO DE NOTA FISCAL DE PRODUTOS / INSUMOS (NF-e) ---
      // Step 1: Create all new items if mapped to CREATE_NEW
      const finalItemsList = [];
      const updatedItemList = [...items];

      for (const m of itemMappings) {
        let itemId = m.mappedItemId;
        let name = m.xmlName;

        if (itemId === 'CREATE_NEW') {
          // Auto create in inventory catalog
          const newCat = await dbService.createInventoryItem({
            name: name,
            category: 'Insumo Clínico',
            currentStock: 0,
            minStock: 10,
            unit: 'unidades',
            price: m.price,
            hasBatchControl: !!(m.batch || m.expiryDate),
            defaultSectorId: sectors[0]?.id || '',
            unitId: currentUnitId,
            unit: currentUnitName
          });
          itemId = newCat.id;
          updatedItemList.push(newCat);
        }

        finalItemsList.push({
          itemId,
          name: m.xmlName,
          quantity: m.quantity,
          price: m.price,
          total: m.quantity * m.price,
          batch: m.batch,
          expiryDate: m.expiryDate
        });

        // Register in product_batches if lot info exists
        if (m.batch && dbService.upsertProductBatchOnEntry) {
          await dbService.upsertProductBatchOnEntry({
            itemId: itemId,
            itemName: m.xmlName,
            batchNumber: m.batch,
            expiryDate: m.expiryDate || '',
            quantity: m.quantity,
            unit: 'unidades',
            costPrice: m.price,
            supplierName: supplierMapping.name,
            invoiceNumber: xmlData.number,
            unitId: currentUnitId,
            unit: currentUnitName
          });
        }

        // Register in stock_transactions for audit trace
        await dbService.createStockTransaction({
          itemId: itemId,
          itemName: m.xmlName,
          quantity: m.quantity,
          type: 'Entrada',
          batch: m.batch || 'ENTRADA-NFE',
          expiryDate: m.expiryDate || '',
          operator: currentUser?.name || currentUser?.email || 'Farmácia Central',
          notes: `Entrada NF-e Nº ${xmlData.number} (${supplierMapping.name})`,
          unitId: currentUnitId,
          unit: currentUnitName
        });
      }

      // Step 2: Record Invoice & Abastece Estoque
      await dbService.createPurchaseInvoice({
        number: xmlData.number,
        accessKey: xmlData.accessKey,
        issueDate: xmlData.issueDate,
        supplierId: supplierMapping.id,
        supplierName: supplierMapping.name,
        supplierCnpj: supplierMapping.cnpj,
        totalValue: finalInvoiceTotal,
        items: finalItemsList,
        installments: xmlData.installments || [],
        unitId: currentUnitId,
        unit: currentUnitName,
        invoiceType: 'product'
      });

      // Step 3: Automate Payable Account creation in Finance for every installment/duplicata
      if (dbService.saveAccountsPayable) {
        const instList = (xmlData.installments && xmlData.installments.length > 0) 
          ? xmlData.installments 
          : [{ installmentNumber: '1/1', dueDate: xmlData.issueDate || new Date().toISOString().substring(0, 10), amount: finalInvoiceTotal }];

        for (const inst of instList) {
          const defaultDueDate = new Date();
          defaultDueDate.setDate(defaultDueDate.getDate() + 30);
          const finalDueDate = inst.dueDate || defaultDueDate.toISOString().substring(0, 10);

          await dbService.saveAccountsPayable({
            supplier: supplierMapping.name,
            cnpj: supplierMapping.cnpj || '00.000.000/0001-00',
            description: `Entrada NF-e Nº ${xmlData.number} (Parcela ${inst.installmentNumber})`,
            amount: parseFloat(inst.amount) || finalInvoiceTotal || 0,
            dueDate: finalDueDate,
            category: 'Insumo Clínico',
            invoiceNumber: xmlData.number,
            accessKey: xmlData.accessKey || '',
            documentType: 'NF-e',
            status: 'Pendente',
            unitId: currentUnitId,
            unit: currentUnitName
          });
        }
      }

      // Atualiza o saldo local dos produtos imediatamente
      setItems(prevItems => {
        return prevItems.map(item => {
          const matchedEntry = finalItemsList.find(fi => fi.itemId === item.id);
          if (matchedEntry) {
            return {
              ...item,
              currentStock: (parseFloat(item.currentStock) || 0) + (parseFloat(matchedEntry.quantity) || 0)
            };
          }
          return item;
        });
      });

      showAlert(`Nota Fiscal Nº ${xmlData.number} processada! Estoque abastecido e ${(xmlData.installments || []).length || 1} conta(s) a pagar lançada(s) no Financeiro.`, 'success');
      setShowXmlWizard(false);
      const invList = await (dbService.getPurchaseInvoices ? dbService.getPurchaseInvoices().catch(() => []) : []);
      setInvoices(safeArray(invList));
      fetchData();
    } catch (err) {
      console.error(err);
      showAlert('Erro ao finalizar importação da nota fiscal.', 'danger');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteInvoice = async (id) => {
    if (!window.confirm('Deseja realmente remover esta nota fiscal do histórico de entradas?')) return;
    setActionLoading(true);
    try {
      if (dbService.deletePurchaseInvoice) {
        await dbService.deletePurchaseInvoice(id);
      }
      showAlert('Nota fiscal excluída com sucesso!', 'success');
      const invList = await (dbService.getPurchaseInvoices ? dbService.getPurchaseInvoices().catch(() => []) : []);
      setInvoices(safeArray(invList));
    } catch (err) {
      console.error(err);
      showAlert('Erro ao excluir nota fiscal.', 'danger');
    } finally {
      setActionLoading(false);
    }
  };

  const handleFixInvoiceType = async (invoice, newType = 'service') => {
    setActionLoading(true);
    try {
      const sumInst = (invoice?.installments || []).reduce((acc, inst) => acc + (parseFloat(inst.amount) || 0), 0);
      const newTotal = (parseFloat(invoice?.totalValue) > 0) ? parseFloat(invoice.totalValue) : (sumInst > 0 ? sumInst : 0);
      
      const updateData = {
        invoiceType: newType,
        totalValue: newTotal,
        serviceDescription: invoice.serviceDescription || (newType === 'service' ? `Prestação de serviços conforme NFS-e Nº ${invoice.number}` : '')
      };

      if (dbService.updatePurchaseInvoice) {
        await dbService.updatePurchaseInvoice(invoice.id, updateData);
      }
      
      setInvoices(prev => prev.map(inv => inv.id === invoice.id ? { ...inv, ...updateData } : inv));
      if (selectedInvoiceDetail?.id === invoice.id) {
        setSelectedInvoiceDetail(prev => ({ ...prev, ...updateData }));
      }
      showAlert(`Nota Fiscal Nº ${invoice.number} atualizada para ${newType === 'service' ? 'Serviço' : 'Produto'} com valor de R$ ${newTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}!`, 'success');
    } catch (err) {
      console.error(err);
      showAlert('Erro ao atualizar nota.', 'danger');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteBatch = async (id) => {
    if (!window.confirm('Deseja realmente remover este lote do controle de estoque?')) return;
    setActionLoading(true);
    try {
      await dbService.deleteProductBatch(id);
      showAlert('Lote removido com sucesso!', 'success');
      fetchData();
    } catch (err) {
      console.error(err);
      showAlert('Erro ao remover lote.', 'danger');
    } finally {
      setActionLoading(false);
    }
  };

  // Helper CNPJ formatters
  const formatCnpj = (v) => {
    if (!v) return '';
    const clean = v.replace(/\D/g, '');
    if (clean.length !== 14) return v;
    return `${clean.substring(0, 2)}.${clean.substring(2, 5)}.${clean.substring(5, 8)}/${clean.substring(8, 12)}-${clean.substring(12, 14)}`;
  };

  const cleanCnpj = (v) => v ? v.replace(/\D/g, '') : '';

  // ----------------------------------------------------
  // Expiry Calculations & Filtering
  // ----------------------------------------------------
  const getExpiryStatus = (expiryDate) => {
    if (!expiryDate) return { text: 'N/A', color: 'var(--text-muted)', class: '' };
    const expiry = new Date(expiryDate);
    const today = new Date();
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { text: 'Vencido', color: 'var(--danger-color)' };
    }
    if (diffDays <= 60) {
      return { text: `Vence em ${diffDays}d`, color: 'var(--warning-color)' };
    }
    return { text: `Válido (${diffDays}d)`, color: 'var(--success-color)' };
  };

  const getFilteredItems = () => {
    if (!Array.isArray(currentItems)) return [];
    return currentItems.filter(item => {
      if (!item) return false;
      const name = item.name ? String(item.name).toLowerCase() : '';
      const matchesSearch = name.includes((searchTerm || '').toLowerCase());
      const matchesCategory = filterCategory ? item.category === filterCategory : true;
      return matchesSearch && matchesCategory;
    });
  };

  const getLowStockItems = () => {
    if (!Array.isArray(currentItems)) return [];
    return currentItems.filter(i => {
      if (!i) return false;
      const current = parseFloat(i.currentStock) || 0;
      const min = parseFloat(i.minStock) || 0;
      return current <= min;
    });
  };

  const getExpiryTransactions = () => {
    if (Array.isArray(currentProductBatches) && currentProductBatches.length > 0) {
      return currentProductBatches.map(b => ({
        id: b.id,
        itemId: b.itemId,
        itemName: b.itemName,
        batch: b.batchNumber,
        quantity: b.currentQuantity !== undefined ? b.currentQuantity : b.initialQuantity,
        initialQuantity: b.initialQuantity,
        date: b.createdAt,
        expiryDate: b.expiryDate,
        status: b.status || 'Ativo',
        invoiceNumber: b.invoiceNumber,
        supplierName: b.supplierName,
        operator: b.supplierName || 'Entrada NF-e'
      })).sort((a, b) => {
        if (!a.expiryDate) return 1;
        if (!b.expiryDate) return -1;
        return new Date(a.expiryDate) - new Date(b.expiryDate);
      });
    }

    if (!Array.isArray(currentTransactions)) return [];
    return currentTransactions
      .filter(t => t && t.type === 'Entrada' && t.expiryDate)
      .sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));
  };

  const filteredItems = getFilteredItems();
  const lowStockItems = getLowStockItems();
  const expiryList = getExpiryTransactions();

  return {
    activeTab,
    setActiveTab,
    items: currentItems,
    setItems,
    transactions: currentTransactions,
    setTransactions,
    suppliers: currentSuppliers,
    setSuppliers,
    sectors,
    setSectors,
    invoices: currentInvoices,
    setInvoices,
    loans: currentLoans,
    setLoans,
    categoriesList,
    setCategoriesList,
    requisitions: currentRequisitions,
    setRequisitions,
    stockLocations,
    setStockLocations,
    inventories: currentInventories,
    setInventories,
    transfers: currentTransfers,
    setTransfers,
    productBatches: currentProductBatches,
    setProductBatches,
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
    setTraceabilityLoading,
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
    entryMode,
    setEntryMode,
    handleStartManualServiceEntry,
    handleStartImportWizard,
    handleDeleteInvoice,
    handleFixInvoiceType,
    invoiceTypeFilter,
    setInvoiceTypeFilter,
    selectedInvoiceDetail,
    setSelectedInvoiceDetail,
    showInvoiceDetailModal,
    setShowInvoiceDetailModal,
    filteredItems,
    lowStockItems,
    expiryList,
    tenantSettings,
    setTenantSettings,
    getTimeRemaining
  };
}
