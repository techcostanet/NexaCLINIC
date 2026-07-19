import React, { useState, useEffect } from 'react';
import { dbService } from '../firebase';
import { 
  Package, Boxes, Clock, Calendar, Plus, Search, 
  X, FileText, UploadCloud, Briefcase, Warehouse,
  CheckCircle2, AlertTriangle, ArrowUpRight, ArrowDownLeft, Trash2, Edit2
} from 'lucide-react';

export default function StockPanel() {
  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory' | 'invoices' | 'suppliers' | 'sectors' | 'transactions' | 'expiry'
  
  // Data States
  const [items, setItems] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [invoices, setInvoices] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

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
  const [xmlWizardStep, setXmlWizardStep] = useState(1); // 1: Upload, 2: Supplier, 3: Mapping, 4: Review
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
  const [itemMappings, setItemMappings] = useState([]); // Array of { xmlCode, xmlName, mappedItemId, quantity, price, batch, expiryDate }

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [itemList, txList, supList, secList, invList] = await Promise.all([
        dbService.getInventoryItems(),
        dbService.getStockTransactions(),
        dbService.getSuppliers(),
        dbService.getStockSectors(),
        dbService.getPurchaseInvoices()
      ]);
      
      setItems(itemList);
      setTransactions(txList);
      setSuppliers(supList);
      setSectors(secList);
      setInvoices(invList);

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

      showAlert(`Nota Fiscal Nº ${xmlData.number} processada e estoque abastecido!`, 'success');
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
              <option value="Insumo Clínico">Insumo Clínico</option>
              <option value="Medicamento">Medicamento</option>
              <option value="Concentrado">Concentrado</option>
              <option value="Outros">Outros</option>
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
                    <th>Item de Insumo</th>
                    <th>Categoria</th>
                    <th>Estoque Atual</th>
                    <th>Setor Padrão</th>
                    <th>Mínimo</th>
                    <th>Status</th>
                    <th>Preço Unitário</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.length === 0 ? (
                    <tr>
                      <td colSpan="8" style={styles.noDataCell}>Nenhum insumo no catálogo.</td>
                    </tr>
                  ) : (
                    filteredItems.map(item => {
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
                            <button onClick={() => handleOpenEditModal(item)} style={styles.actionEditBtn}>
                              Editar
                            </button>
                          </td>
                        </tr>
                      );
                    })
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
                    <th>NF-e Nº</th>
                    <th>Chave de Acesso</th>
                    <th>Fornecedor</th>
                    <th>Emissão</th>
                    <th>Data de Entrada</th>
                    <th>Valor Total</th>
                    <th>Itens Recebidos</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.length === 0 ? (
                    <tr>
                      <td colSpan="8" style={styles.noDataCell}>Nenhuma Nota Fiscal importada ou registrada.</td>
                    </tr>
                  ) : (
                    invoices.map(inv => (
                      <tr key={inv.id}>
                        <td style={{ fontWeight: '600' }}>{inv.number}</td>
                        <td style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{inv.accessKey || 'N/A'}</td>
                        <td style={{ fontWeight: '600' }}>{inv.supplierName}</td>
                        <td>{new Date(inv.issueDate).toLocaleDateString('pt-BR')}</td>
                        <td>{new Date(inv.entryDate).toLocaleDateString('pt-BR')}</td>
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
                    <th>Fornecedor</th>
                    <th>CNPJ</th>
                    <th>Contato</th>
                    <th>Telefone</th>
                    <th>Email</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {suppliers.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={styles.noDataCell}>Nenhum fornecedor cadastrado.</td>
                    </tr>
                  ) : (
                    suppliers.map(sup => (
                      <tr key={sup.id}>
                        <td style={{ fontWeight: '600' }}>{sup.name}</td>
                        <td>{sup.cnpj || '-'}</td>
                        <td>{sup.contact || '-'}</td>
                        <td>{sup.phone || '-'}</td>
                        <td>{sup.email || '-'}</td>
                        <td>
                          <button onClick={() => handleOpenSupplierEdit(sup)} style={styles.actionEditBtn}>
                            Editar
                          </button>
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
                    <th>Nome do Setor</th>
                    <th>Descrição / Finalidade</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {sectors.length === 0 ? (
                    <tr>
                      <td colSpan="3" style={styles.noDataCell}>Nenhum setor físico cadastrado.</td>
                    </tr>
                  ) : (
                    sectors.map(sec => (
                      <tr key={sec.id}>
                        <td style={{ fontWeight: '600' }}>{sec.name}</td>
                        <td>{sec.description || 'Sem descrição'}</td>
                        <td>
                          <button onClick={() => handleOpenSectorEdit(sec)} style={styles.actionEditBtn}>
                            Editar
                          </button>
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
                    <th>Data/Hora</th>
                    <th>Item</th>
                    <th>Tipo</th>
                    <th>Quantidade</th>
                    <th>Setor Destino</th>
                    <th>Lote</th>
                    <th>Operador</th>
                    <th>Observações</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.length === 0 ? (
                    <tr>
                      <td colSpan="8" style={styles.noDataCell}>Nenhuma movimentação registrada.</td>
                    </tr>
                  ) : (
                    transactions
                      .sort((a, b) => new Date(b.date) - new Date(a.date))
                      .map(tx => {
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
        </>
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
