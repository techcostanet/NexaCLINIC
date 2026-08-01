import React, { useState, useEffect } from 'react';
import { dbService } from '../../../firebase';
import { 
  Package, Boxes, Clock, Calendar, Plus, Search, 
  X, FileText, UploadCloud, Briefcase, Warehouse,
  CheckCircle2, AlertTriangle, AlertCircle, ArrowUpRight, ArrowDownLeft, Trash2, Edit,
  ArrowUpDown, ArrowUp, ArrowDown, RefreshCw, Send, ClipboardList, Repeat
} from 'lucide-react';

export function useStockLogic() {
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

  return {
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
  };
}
