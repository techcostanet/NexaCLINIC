import React, { useState, useEffect } from 'react';
import { dbService } from '../firebase';
import { 
  Package, Boxes, Clock, Calendar, Plus, Search, 
  X, FileText, UploadCloud, Briefcase, Warehouse,
  CheckCircle2, AlertTriangle, AlertCircle, ArrowUpRight, ArrowDownLeft, Trash2, Edit,
  ArrowUpDown, ArrowUp, ArrowDown, RefreshCw, Send, ClipboardList, Repeat
} from 'lucide-react';

export default function StockPanel() {
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

  // Modals States
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [itemForm, setItemForm] = useState({
    name: '',
    category: 'Insumo Clínico',
    currentStock: '0',
    minStock: '10',
    unit: 'unidades',
    price: '0.00',
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

  // XML Import Wizard States
  const [showXmlWizard, setShowXmlWizard] = useState(false);
  const [xmlWizardStep, setXmlWizardStep] = useState(1);
  const [xmlData, setXmlData] = useState(null);
  const [xmlError, setXmlError] = useState('');
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
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [itemList, txList, supList, secList, invList, loanList, catList, locList, invsList, transList] = await Promise.all([
        dbService.getInventoryItems(),
        dbService.getStockTransactions(),
        dbService.getSuppliers(),
        dbService.getStockSectors(),
        dbService.getPurchaseInvoices(),
        dbService.getStockLoans ? dbService.getStockLoans() : [],
        dbService.getProductCategories ? dbService.getProductCategories() : [],
        dbService.getStockLocations ? dbService.getStockLocations() : [],
        dbService.getInventories ? dbService.getInventories() : [],
        dbService.getStockTransfers ? dbService.getStockTransfers() : []
      ]);
      
      setItems(itemList);
      setTransactions(txList);
      setSuppliers(supList);
      setSectors(secList);
      setInvoices(invList);
      setLoans(loanList);
      setStockLocations(locList);
      setInventories(invsList);
      setTransfers(transList);
      setCategoriesList(catList.length > 0 ? catList : [
        { id: 'c1', name: 'Insumo Clínico' },
        { id: 'c2', name: 'Medicamento' },
        { id: 'c3', name: 'Concentrado' },
        { id: 'c4', name: 'Material Médico' },
        { id: 'c5', name: 'Equipamento' }
      ]);

      if (itemList.length > 0) {
        setTxForm(f => ({ 
          ...f, 
          itemId: itemList[0].id,
          sectorId: secList[0]?.id || ''
        }));
        setItemForm(f => ({
          ...f,
          defaultSectorId: secList[0]?.id || ''
        }));
      }

      if (locList.length > 0) {
        setInventoryForm(f => ({ ...f, locationId: locList[0].id }));
        setTransferForm(f => ({
          ...f,
          originLocationId: locList[0].id,
          destinationLocationId: locList[1]?.id || locList[0].id,
          itemId: itemList[0]?.id || ''
        }));
      }
    } catch (err) {
      console.error(err);
      showAlert('Erro ao carregar dados do estoque.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 5000);
  };

  // Sorting Helper Functions
  const sortData = (list, sortConfig) => {
    if (!sortConfig || !sortConfig.key) return list;
    return [...list].sort((a, b) => {
      let valA = a[sortConfig.key] ?? '';
      let valB = b[sortConfig.key] ?? '';

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
        style={{ ...styles.th, cursor: 'pointer', userSelect: 'none' }} 
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
      category: 'Insumo Clínico',
      currentStock: '0',
      minStock: '10',
      unit: 'unidades',
      price: '0.00',
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
      defaultSectorId: item.defaultSectorId || (sectors[0]?.id || '')
    });
    setShowItemModal(true);
  };

  const handleSaveItem = async (e) => {
    e.preventDefault();
    if (!itemForm.name) return showAlert('Nome do item é obrigatório.', 'warning');

    setActionLoading(true);
    try {
      const data = {
        name: itemForm.name,
        category: itemForm.category,
        currentStock: parseFloat(itemForm.currentStock) || 0,
        minStock: parseFloat(itemForm.minStock) || 0,
        unit: itemForm.unit,
        price: parseFloat(itemForm.price) || 0,
        defaultSectorId: itemForm.defaultSectorId
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
        await dbService.createSupplier(supplierForm);
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
  // Requisition Fulfillment Methods (Atendimento de Requisições)
  // ----------------------------------------------------
  const handleOpenFulfillModal = (req) => {
    setFulfillingReq(req);
    const initialItems = req.items ? req.items.map(i => ({
      ...i,
      deliveredQuantity: i.deliveredQuantity > 0 ? i.deliveredQuantity : i.requestedQuantity
    })) : [];
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
              const newStock = Math.max(0, (parseFloat(targetStockItem.currentStock) || 0) - delQty);
              await dbService.updateInventoryItem(targetStockItem.id, {
                ...targetStockItem,
                currentStock: newStock
              });

              await dbService.createStockTransaction({
                itemId: targetStockItem.id,
                itemName: targetStockItem.name,
                quantity: delQty,
                type: 'Saída',
                operator: 'Farmácia Central',
                notes: `Atendimento Requisição ${fulfillingReq.requisitionCode} (Destino: ${fulfillingReq.patientName || 'Salão'})`
              });
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
  // XML Import Methods (Parser)
  // ----------------------------------------------------
  const handleXmlUpload = (e) => {
    setXmlError('');
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(evt.target.result, 'text/xml');
        
        // Basic validation
        const nNF = xmlDoc.getElementsByTagName('nNF')[0]?.textContent;
        if (!nNF) {
          throw new Error('Nós obrigatórios de NF-e não encontrados. Certifique-se de que é um XML de Nota Fiscal Eletrônica válido.');
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

        // Save parsed XML state
        setXmlData({
          number: nNF,
          accessKey: chNFe,
          issueDate: dhEmi.substring(0, 10),
          totalValue: vNF,
          supplierName: emitName,
          supplierCnpj: emitCnpj,
          items: parsedItems
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
    setXmlWizardStep(3);
  };

  const handleMappingItemChange = (xmlCode, itemId) => {
    setItemMappings(prev => prev.map(m => m.xmlCode === xmlCode ? { ...m, mappedItemId: itemId } : m));
  };

  const handleMappingFieldChange = (xmlCode, field, value) => {
    setItemMappings(prev => prev.map(m => m.xmlCode === xmlCode ? { ...m, [field]: value } : m));
  };

  const handleFinishXmlWizard = async () => {
    setActionLoading(true);
    try {
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
            defaultSectorId: sectors[0]?.id || ''
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
      }

      // Step 2: Record Invoice
      await dbService.createPurchaseInvoice({
        number: xmlData.number,
        accessKey: xmlData.accessKey,
        issueDate: xmlData.issueDate,
        supplierId: supplierMapping.id,
        supplierName: supplierMapping.name,
        totalValue: xmlData.totalValue,
        items: finalItemsList
      });

      // Step 3: Automate Payable Account creation in Finance
      if (dbService.saveAccountsPayable) {
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 30);
        await dbService.saveAccountsPayable({
          supplier: supplierMapping.name,
          cnpj: supplierMapping.cnpj || '00.000.000/0001-00',
          description: `Entrada NF-e Nº ${xmlData.number} (Importação de Estoque)`,
          amount: parseFloat(xmlData.totalValue) || 0,
          dueDate: dueDate.toISOString().substring(0, 10),
          category: 'Insumo Clínico',
          invoiceNumber: xmlData.number,
          status: 'Pendente'
        });
      }

      showAlert(`Nota Fiscal Nº ${xmlData.number} processada, estoque abastecido e conta a pagar lançada no Financeiro!`, 'success');
      setShowXmlWizard(false);
      fetchData();
    } catch (err) {
      console.error(err);
      showAlert('Erro ao finalizar importação da nota fiscal.', 'danger');
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
    return items.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory ? item.category === filterCategory : true;
      return matchesSearch && matchesCategory;
    });
  };

  const getLowStockItems = () => items.filter(i => i.currentStock <= i.minStock);

  const getExpiryTransactions = () => {
    return transactions
      .filter(t => t.type === 'Entrada' && t.expiryDate)
      .sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));
  };

  const filteredItems = getFilteredItems();
  const lowStockItems = getLowStockItems();
  const expiryList = getExpiryTransactions();

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
          <Boxes size={16} /> Catálogo de Produtos ({items.length})
        </button>
        <button 
          onClick={() => setActiveTab('physical_inventory')} 
          style={{ ...styles.tabBtn, ...(activeTab === 'physical_inventory' ? styles.tabBtnActive : {}) }}
        >
          <ClipboardList size={16} /> Inventários Físicos ({inventories.length})
        </button>
        <button 
          onClick={() => setActiveTab('transfers')} 
          style={{ ...styles.tabBtn, ...(activeTab === 'transfers' ? styles.tabBtnActive : {}) }}
        >
          <Repeat size={16} /> Transferências de Estoque ({transfers.length})
        </button>
        <button 
          onClick={() => setActiveTab('invoices')} 
          style={{ ...styles.tabBtn, ...(activeTab === 'invoices' ? styles.tabBtnActive : {}) }}
        >
          <FileText size={16} /> Entrada de Notas & XML ({invoices.length})
        </button>
        <button 
          onClick={() => setActiveTab('suppliers')} 
          style={{ ...styles.tabBtn, ...(activeTab === 'suppliers' ? styles.tabBtnActive : {}) }}
        >
          <Briefcase size={16} /> Fornecedores ({suppliers.length})
        </button>
        <button 
          onClick={() => setActiveTab('sectors')} 
          style={{ ...styles.tabBtn, ...(activeTab === 'sectors' ? styles.tabBtnActive : {}) }}
        >
          <Warehouse size={16} /> Setores de Estoque ({sectors.length})
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
          <RefreshCw size={16} /> Empréstimos de Produtos ({loans.length})
        </button>
        <button 
          onClick={() => setActiveTab('requisitions')} 
          style={{ ...styles.tabBtn, ...(activeTab === 'requisitions' ? styles.tabBtnActive : {}) }}
        >
          <Send size={16} /> Atendimento de Requisições ({requisitions.filter(r => r.status === 'Pendente' || r.status === 'Parcial').length > 0 ? `${requisitions.filter(r => r.status === 'Pendente' || r.status === 'Parcial').length} Pendente(s)` : requisitions.length})
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
                <option key={c.id} value={c.name}>{c.name}</option>
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
              <UploadCloud size={16} /> Importar XML de NF-e
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
                    sortData(filteredItems, inventorySort).map(item => {
                      const isLow = item.currentStock <= item.minStock;
                      const sectorName = sectors.find(s => s.id === item.defaultSectorId)?.name || 'Almoxarifado Central';
                      return (
                        <tr key={item.id} style={isLow ? styles.rowWarning : {}}>
                          <td style={{ fontWeight: '600' }}>{item.name}</td>
                          <td><span style={styles.categoryBadge}>{item.category}</span></td>
                          <td style={{ fontWeight: '700', color: isLow ? 'var(--danger-color)' : 'var(--text-primary)' }}>
                            {item.currentStock} {item.unit}
                          </td>
                          <td>{sectorName}</td>
                          <td>{item.minStock} {item.unit}</td>
                          <td>
                            {isLow ? (
                              <span style={styles.badgeCritical}>Abaixo do Mínimo</span>
                            ) : (
                              <span style={styles.badgeNormal}>Regular</span>
                            )}
                          </td>
                          <td>R$ {item.price ? item.price.toFixed(2) : '0.00'}</td>
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
                            {inv.title}
                          </div>
                        </td>
                        <td>
                          <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                            <Warehouse size={13} style={{ marginRight: '4px' }} />
                            {inv.locationName || 'Estoque Geral'}
                          </span>
                        </td>
                        <td>{inv.createdAt ? new Date(inv.createdAt).toLocaleDateString('pt-BR') : '-'}</td>
                        <td>{inv.items?.length || items.length} produtos</td>
                        <td>
                          <span style={{
                            padding: '0.25rem 0.6rem',
                            borderRadius: '12px',
                            fontSize: '0.75rem',
                            fontWeight: '700',
                            backgroundColor: inv.status === 'Concluído' ? '#dcfce7' : '#fef3c7',
                            color: inv.status === 'Concluído' ? '#166534' : '#92400e'
                          }}>
                            {inv.status || 'Em Andamento'}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.35rem' }}>
                            <button onClick={() => handleOpenCountModal(inv)} style={{ ...styles.actionEditBtn, backgroundColor: 'var(--primary-light)', color: 'var(--primary-color)' }}>
                              <Edit size={13} /> {inv.status === 'Concluído' ? 'Ver Divergências' : 'Digitar Contagem'}
                            </button>
                            <button onClick={() => handleDeleteInventory(inv.id, inv.title)} style={{ ...styles.actionEditBtn, backgroundColor: '#fee2e2', color: '#991b1b' }}>
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
                      <tr key={tr.id}>
                        <td>{tr.createdAt ? new Date(tr.createdAt).toLocaleString('pt-BR') : '-'}</td>
                        <td style={{ fontWeight: '600', color: '#991b1b' }}>
                          <ArrowDownLeft size={14} style={{ marginRight: '4px' }} />
                          {tr.originLocationName || 'Origem'}
                        </td>
                        <td style={{ fontWeight: '600', color: '#166534' }}>
                          <ArrowUpRight size={14} style={{ marginRight: '4px' }} />
                          {tr.destinationLocationName || 'Destino'}
                        </td>
                        <td style={{ fontWeight: '600' }}>{tr.itemName}</td>
                        <td style={{ fontWeight: '700' }}>{tr.quantity} {tr.unit || 'unidades'}</td>
                        <td>{tr.batch || 'S/L'} {tr.expiryDate ? `(${new Date(tr.expiryDate).toLocaleDateString('pt-BR')})` : ''}</td>
                        <td>{tr.operator || 'Almoxarife'}</td>
                        <td><span style={styles.badgeNormal}>Concluída</span></td>
                        <td>
                          <button onClick={() => handleDeleteTransfer(tr.id)} style={{ ...styles.actionEditBtn, backgroundColor: '#fee2e2', color: '#991b1b' }}>
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
                    sortData(invoices, invoiceSort).map(inv => (
                      <tr key={inv.id}>
                        <td style={{ fontWeight: '600' }}>{inv.number}</td>
                        <td style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{inv.accessKey || 'N/A'}</td>
                        <td style={{ fontWeight: '600' }}>{inv.supplierName}</td>
                        <td>{inv.issueDate ? new Date(inv.issueDate).toLocaleDateString('pt-BR') : '-'}</td>
                        <td>{inv.entryDate ? new Date(inv.entryDate).toLocaleDateString('pt-BR') : '-'}</td>
                        <td style={{ fontWeight: '700' }}>R$ {inv.totalValue ? inv.totalValue.toFixed(2) : '0.00'}</td>
                        <td>{inv.items?.length || 0} produtos</td>
                        <td><span style={styles.badgeNormal}>Processada</span></td>
                      </tr>
                    ))
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
                      const isEntry = tx.type === 'Entrada';
                      const secName = sectors.find(s => s.id === tx.sectorId)?.name || 'Almoxarifado Central';
                      return (
                        <tr key={tx.id}>
                          <td>{new Date(tx.date).toLocaleString('pt-BR')}</td>
                          <td style={{ fontWeight: '600' }}>{tx.itemName}</td>
                          <td>
                            <span style={{ 
                              ...styles.txTypeBadge, 
                              backgroundColor: isEntry ? 'var(--success-light)' : 'var(--danger-light)',
                              color: isEntry ? 'var(--success-color)' : 'var(--danger-color)',
                              borderColor: isEntry ? 'rgba(5, 150, 105, 0.1)' : 'rgba(225, 29, 72, 0.1)'
                            }}>
                              {isEntry ? <ArrowUpRight size={12} /> : <ArrowDownLeft size={12} />}
                              {tx.type}
                            </span>
                          </td>
                          <td style={{ fontWeight: '700' }}>{tx.quantity}</td>
                          <td>{secName}</td>
                          <td>{tx.batch || '-'}</td>
                          <td>{tx.operator}</td>
                          <td style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>{tx.notes || '-'}</td>
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
                      const expiryInfo = getExpiryStatus(tx.expiryDate);
                      return (
                        <tr key={tx.id}>
                          <td style={{ fontWeight: '600' }}>{tx.itemName}</td>
                          <td style={{ fontWeight: '700' }}>{tx.batch || '-'}</td>
                          <td>{tx.quantity}</td>
                          <td>{new Date(tx.date).toLocaleDateString('pt-BR')}</td>
                          <td>{tx.expiryDate ? new Date(tx.expiryDate).toLocaleDateString('pt-BR') : '-'}</td>
                          <td>
                            <span style={{ ...styles.expiryLabel, color: expiryInfo.color }}>
                              {expiryInfo.text}
                            </span>
                          </td>
                          <td>{tx.operator}</td>
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
                      const isGiven = loan.type === 'Concedido';
                      const isReturned = loan.status === 'Devolvido';
                      return (
                        <tr key={loan.id}>
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
                            {loan.productName}
                            {loan.notes && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{loan.notes}</div>}
                          </td>
                          <td style={{ fontWeight: '700' }}>{loan.quantity} {loan.unit || ''}</td>
                          <td><strong>{loan.partnerName}</strong></td>
                          <td>{loan.loanDate ? loan.loanDate.split('-').reverse().join('/') : '-'}</td>
                          <td>{loan.expectedReturnDate ? loan.expectedReturnDate.split('-').reverse().join('/') : 'Indefinido'}</td>
                          <td>
                            <span style={{
                              padding: '0.2rem 0.5rem',
                              borderRadius: '4px',
                              fontWeight: '600',
                              fontSize: '0.75rem',
                              backgroundColor: isReturned ? '#d1fae5' : '#fee2e2',
                              color: isReturned ? '#065f46' : '#991b1b'
                            }}>
                              {isReturned ? `✓ Devolvido em ${loan.returnDate || ''}` : '⏳ Pendente (Ativo)'}
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
                              <button onClick={() => handleDeleteLoan(loan.id)} style={{ ...styles.actionEditBtn, backgroundColor: '#fee2e2', color: '#991b1b' }} title="Excluir">
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
                  {requisitions.filter(r => r.status === 'Pendente').length} Pendente(s)
                </span>
                <span style={{ fontSize: '0.8rem', backgroundColor: '#ffedd5', color: '#c2410c', padding: '0.35rem 0.65rem', borderRadius: '9999px', fontWeight: '600', border: '1px solid #fed7aa' }}>
                  {requisitions.filter(r => r.status === 'Parcial').length} Parcial(is)
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
                      <tr key={req.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '0.875rem 1rem', fontWeight: '700', color: 'var(--primary-color)' }}>
                          {req.requisitionCode}
                        </td>
                        <td style={{ padding: '0.875rem 1rem' }}>
                          <div>{new Date(req.createdAt).toLocaleDateString('pt-BR')}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(req.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</div>
                        </td>
                        <td style={{ padding: '0.875rem 1rem' }}>{req.requestedBy}</td>
                        <td style={{ padding: '0.875rem 1rem', fontWeight: '600' }}>{req.patientName || 'Uso Geral'}</td>
                        <td style={{ padding: '0.875rem 1rem' }}>
                          {req.items && req.items.length > 0 ? (
                            <div>
                              <div><strong>{req.items[0].itemName}</strong> ({req.items[0].requestedQuantity} {req.items[0].unit})</div>
                              {req.items.length > 1 && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>+ {req.items.length - 1} outro(s) item(ns)</div>}
                            </div>
                          ) : 'Sem itens'}
                        </td>
                        <td style={{ padding: '0.875rem 1rem' }}>
                          <span style={{ 
                            padding: '0.25rem 0.5rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '600',
                            backgroundColor: req.status === 'Pendente' ? '#fef3c7' : req.status === 'Parcial' ? '#ffedd5' : req.status === 'Entregue' ? '#d1fae5' : '#fee2e2',
                            color: req.status === 'Pendente' ? '#b45309' : req.status === 'Parcial' ? '#c2410c' : req.status === 'Entregue' ? '#047857' : '#b91c1c'
                          }}>
                            {req.status}
                          </span>
                        </td>
                        <td style={{ padding: '0.875rem 1rem', textAlign: 'right' }}>
                          <button 
                            onClick={() => handleOpenFulfillModal(req)}
                            style={{ 
                              padding: '0.4rem 0.8rem', borderRadius: '6px', border: 'none', fontWeight: '600', fontSize: '0.8rem', cursor: 'pointer',
                              backgroundColor: req.status === 'Entregue' ? '#f3f4f6' : 'var(--primary-color)',
                              color: req.status === 'Entregue' ? '#374151' : '#ffffff'
                            }}
                          >
                            {req.status === 'Entregue' ? 'Ver Atendimento' : 'Atender Requisição'}
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

            <div style={{ padding: '1rem 0' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', backgroundColor: '#f9fafb', padding: '0.85rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem' }}>
                <div><strong>Solicitante:</strong> {fulfillingReq.requestedBy}</div>
                <div><strong>Destino:</strong> {fulfillingReq.patientName || 'Uso Geral'}</div>
                <div><strong>Data:</strong> {new Date(fulfillingReq.createdAt).toLocaleString('pt-BR')}</div>
                <div><strong>Status Atual:</strong> {fulfillingReq.status}</div>
              </div>

              {fulfillingReq.notes && (
                <div style={{ fontSize: '0.85rem', fontStyle: 'italic', marginBottom: '1rem', color: '#4b5563' }}>
                  Obs. Técnica: "{fulfillingReq.notes}"
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: '700' }}>Itens Solicitados & Quantidade Entregue:</h4>
                <button 
                  type="button" 
                  onClick={handleFillAllRequestedQuantity}
                  style={{ background: 'none', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '0.2rem 0.5rem', fontSize: '0.75rem', cursor: 'pointer', color: 'var(--primary-color)' }}
                >
                  Preencher com Total Solicitado
                </button>
              </div>

              <div style={{ border: '1px solid var(--border-color)', borderRadius: '6px', overflow: 'hidden', marginBottom: '1rem' }}>
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

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: '600', display: 'block', marginBottom: '0.25rem' }}>Observações da Farmácia:</label>
                <textarea 
                  value={fulfillmentNotes} 
                  onChange={(e) => setFulfillmentNotes(e.target.value)} 
                  placeholder="Ex: Entregue lote X com validade 2027..."
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.85rem', height: '50px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                <button 
                  type="button" 
                  onClick={() => handleProcessFulfillment('Cancelado')}
                  style={{ padding: '0.5rem 0.85rem', borderRadius: '6px', border: '1px solid #fca5a5', backgroundColor: '#fef2f2', color: '#991b1b', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer' }}
                  disabled={actionLoading}
                >
                  Recusar / Cancelar Pedido
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
                    {actionLoading ? 'Processando...' : 'Confirmar Atendimento & Baixar Estoque'}
                  </button>
                </div>
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
            <form onSubmit={handleSaveItem} style={styles.modalForm}>
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
                  <option value="Insumo Clínico">Insumo Clínico</option>
                  <option value="Medicamento">Medicamento</option>
                  <option value="Concentrado">Concentrado</option>
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
            <form onSubmit={handleSaveSupplier} style={styles.modalForm}>
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
            <form onSubmit={handleSaveSector} style={styles.modalForm}>
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
            <form onSubmit={handleSaveTransaction} style={styles.modalForm}>
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

      {/* XML IMPORT WIZARD */}
      {showXmlWizard && (
        <div style={styles.modalOverlay}>
          <div style={{ ...styles.modalCard, maxWidth: '800px', width: '90%' }}>
            <div style={styles.modalHeader}>
              <h2>Importar Nota Fiscal Eletrônica (XML NFe)</h2>
              <button onClick={() => setShowXmlWizard(false)} style={styles.modalCloseBtn}><X size={20} /></button>
            </div>
            
            <div style={styles.wizardStepsBar}>
              <div style={{ ...styles.wizardStep, ...(xmlWizardStep >= 1 ? styles.wizardStepActive : {}) }}>1. XML</div>
              <div style={{ ...styles.wizardStep, ...(xmlWizardStep >= 2 ? styles.wizardStepActive : {}) }}>2. Fornecedor</div>
              <div style={{ ...styles.wizardStep, ...(xmlWizardStep >= 3 ? styles.wizardStepActive : {}) }}>3. Mapear Itens</div>
              <div style={{ ...styles.wizardStep, ...(xmlWizardStep >= 4 ? styles.wizardStepActive : {}) }}>4. Finalizar</div>
            </div>

            <div style={{ padding: '1.5rem', maxHeight: '60vh', overflowY: 'auto' }}>
              {/* STEP 1: Upload XML File */}
              {xmlWizardStep === 1 && (
                <div style={styles.xmlUploadArea}>
                  <UploadCloud size={48} color="#f59e0b" style={{ marginBottom: '1rem' }} />
                  <p style={{ fontWeight: '600', color: 'var(--text-primary)' }}>Arraste ou clique para selecionar o arquivo .xml da NF-e</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Compatível com formato padrão da SEFAZ</p>
                  
                  <input 
                    type="file" 
                    accept=".xml" 
                    onChange={handleXmlUpload} 
                    id="xml-file-upload-input" 
                    style={{ display: 'none' }} 
                  />
                  <label htmlFor="xml-file-upload-input" className="btn btn-primary" style={{ backgroundColor: '#f59e0b', cursor: 'pointer' }}>
                    Escolher Arquivo XML
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
                    <h4>Dados da Nota Lida</h4>
                    <p>Número: <strong>{xmlData?.number}</strong></p>
                    <p>Chave: <strong>{xmlData?.accessKey}</strong></p>
                    <p>Valor Total: <strong>R$ {xmlData?.totalValue?.toFixed(2)}</strong></p>
                  </div>
                  
                  <div style={styles.mappingCard}>
                    <h3>Emitente da Nota (Fornecedor)</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Nome no XML: <strong>{xmlData?.supplierName}</strong></p>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>CNPJ no XML: <strong>{formatCnpj(xmlData?.supplierCnpj)}</strong></p>
                    
                    {supplierMapping.exists ? (
                      <div style={{ ...styles.alert, backgroundColor: 'var(--success-light)', color: 'var(--success-color)', border: '1px solid var(--success-color)', marginTop: '0.75rem' }}>
                        <CheckCircle2 size={18} />
                        <span>Fornecedor já cadastrado e vinculado automaticamente: <strong>{supplierMapping.name}</strong></span>
                      </div>
                    ) : (
                      <div style={{ marginTop: '1rem', border: '1px solid #f59e0b', padding: '1rem', borderRadius: 'var(--border-radius-sm)', backgroundColor: 'rgba(245, 158, 11, 0.03)' }}>
                        <h4 style={{ color: '#f59e0b', marginBottom: '0.5rem' }}>Fornecedor Não Encontrado</h4>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>O fornecedor deste XML não está cadastrado. Confirme os dados abaixo para cadastrá-lo automaticamente:</p>
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
                      Avançar
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: Mapeamento de Itens */}
              {xmlWizardStep === 3 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={styles.warningBanner}>
                    <AlertTriangle size={16} />
                    <span>Mapeie cada item do XML para um item do catálogo. Selecione "[Criar como novo]" para criar o produto no estoque.</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {itemMappings.map((m, idx) => (
                      <div key={m.xmlCode} style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-sm)', padding: '1rem', backgroundColor: '#fafafa' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '1rem', marginBottom: '0.75rem' }}>
                          <div>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Nome original no XML (Cód: {m.xmlCode})</span>
                            <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>{m.xmlName}</span>
                            <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                              Quant: <strong>{m.quantity}</strong> | Preço XML: <strong>R$ {m.price?.toFixed(2)}</strong>
                            </span>
                          </div>
                          <div className="form-group">
                            <label>Associar a Produto no Catálogo *</label>
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
                    <button type="button" onClick={() => setXmlWizardStep(2)} className="btn btn-secondary">Voltar</button>
                    <button type="button" onClick={() => setXmlWizardStep(4)} className="btn btn-primary" style={{ backgroundColor: '#f59e0b' }}>
                      Revisar e Finalizar
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4: Review and Finish */}
              {xmlWizardStep === 4 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <h3>Revisão de Importação da NF-e</h3>
                  
                  <div style={styles.infoSummaryBox}>
                    <p>Nota Fiscal: <strong>{xmlData?.number}</strong></p>
                    <p>Fornecedor: <strong>{supplierMapping.name}</strong> ({supplierMapping.cnpj})</p>
                    <p>Valor da Nota: <strong>R$ {xmlData?.totalValue?.toFixed(2)}</strong></p>
                  </div>

                  <div>
                    <h4 style={{ marginBottom: '0.5rem' }}>Itens a serem abastecidos:</h4>
                    <table style={styles.table}>
                      <thead>
                        <tr>
                          <th>Produto Catalogo</th>
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
                    <button type="button" onClick={() => setXmlWizardStep(3)} className="btn btn-secondary">Voltar</button>
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
            <form onSubmit={handleSaveLoan} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
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

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
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
            <form onSubmit={handleSaveInventory} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
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

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
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
          <div style={{ ...styles.modalCard, maxWidth: '900px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={styles.modalHeader}>
              <div>
                <h2 style={{ margin: 0 }}>📋 {countingInventory.title}</h2>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Local: <strong>{countingInventory.locationName}</strong> | Status: <strong style={{ color: countingInventory.status === 'Concluído' ? '#166534' : '#92400e' }}>{countingInventory.status}</strong>
                </span>
              </div>
              <button onClick={() => setShowCountModal(false)} style={styles.modalCloseBtn}><X size={20} /></button>
            </div>

            <div style={{ padding: '1.25rem' }}>
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
            <form onSubmit={handleSaveTransfer} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
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

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
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
    maxWidth: '480px',
    boxShadow: 'var(--shadow-lg)',
    display: 'flex',
    flexDirection: 'column',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.25rem 1.5rem',
    borderBottom: '1px solid var(--border-color)',
  },
  modalCloseBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--text-secondary)',
  },
  modalForm: {
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  modalFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.5rem',
    borderTop: '1px solid var(--border-color)',
    paddingTop: '1.25rem',
    marginTop: '1rem',
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
