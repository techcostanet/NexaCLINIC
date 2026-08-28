import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  ShoppingBag, Plus, Trash2, X, AlertCircle, Package, Sparkles, Check, 
  Layers, Search, ChevronDown, CheckCircle2
} from 'lucide-react';

const normalizeText = (str) => {
  return (str || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
};

export default function PurchaseRequestModal({
  show,
  onClose,
  onSave,
  editingRequest = null,
  inventoryItems = [],
  currentUser = null,
  actionLoading = false
}) {
  const [sector, setSector] = useState('farmacia');
  const [priority, setPriority] = useState('Normal');
  const [justification, setJustification] = useState('');
  const [items, setItems] = useState([]);

  // Draft item line state
  const [itemType, setItemType] = useState('Reposição'); // 'Reposição' | 'Novo'
  const [selectedStockId, setSelectedStockId] = useState('');
  const [selectedStockItem, setSelectedStockItem] = useState(null);
  const [stockSearchQuery, setStockSearchQuery] = useState('');
  const [isStockDropdownOpen, setIsStockDropdownOpen] = useState(false);

  const [newItemName, setNewItemName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState('Unidade');
  const [specification, setSpecification] = useState('');
  const [formError, setFormError] = useState('');

  const searchContainerRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setIsStockDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (show) {
      setFormError('');
      if (editingRequest) {
        setSector(editingRequest.sector || 'farmacia');
        setPriority(editingRequest.priority || 'Normal');
        setJustification(editingRequest.justification || '');

        if (editingRequest.items && Array.isArray(editingRequest.items) && editingRequest.items.length > 0) {
          setItems(editingRequest.items);
        } else if (editingRequest.productName) {
          setItems([{
            id: 'item_' + Math.random().toString(36).substr(2, 9),
            type: editingRequest.type || 'Reposição',
            productId: editingRequest.productId || '',
            productName: editingRequest.productName,
            quantity: editingRequest.quantity || 1,
            unit: editingRequest.unit || 'Unidade',
            specification: ''
          }]);
        } else {
          setItems([]);
        }
      } else {
        // Nova solicitação limpa
        setSector('farmacia');
        setPriority('Normal');
        setJustification('');
        setItems([]);
      }

      // Reset draft item
      setItemType('Reposição');
      setSelectedStockId('');
      setSelectedStockItem(null);
      setStockSearchQuery('');
      setIsStockDropdownOpen(false);
      setNewItemName('');
      setQuantity(1);
      setUnit('Unidade');
      setSpecification('');
    }
  }, [show, editingRequest]);

  // Filtragem dinâmica e inteligente dos insumos do estoque
  const filteredStockItems = useMemo(() => {
    if (!Array.isArray(inventoryItems) || inventoryItems.length === 0) return [];
    
    const query = normalizeText(stockSearchQuery);
    if (!query) {
      // Retorna os primeiros 50 itens
      return inventoryItems.slice(0, 50);
    }

    const matched = inventoryItems.filter(item => {
      const name = normalizeText(item.name);
      const code = normalizeText(item.code);
      const barcode = normalizeText(item.barcode);
      const category = normalizeText(item.category);
      const subgroup = normalizeText(item.subgroup);
      return name.includes(query) || code.includes(query) || barcode.includes(query) || category.includes(query) || subgroup.includes(query);
    });

    // Ordenar para que os que começam com o termo venham primeiro
    return matched.sort((a, b) => {
      const aStarts = normalizeText(a.name).startsWith(query);
      const bStarts = normalizeText(b.name).startsWith(query);
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;
      return (a.name || '').localeCompare(b.name || '');
    }).slice(0, 60);
  }, [inventoryItems, stockSearchQuery]);

  // Selecionar insumo do estoque pelo autocomplete
  const handleSelectStockItem = (item) => {
    setSelectedStockId(item.id);
    setSelectedStockItem(item);
    setStockSearchQuery(item.name);
    setIsStockDropdownOpen(false);
    if (item.unit) {
      setUnit(item.unit);
    }
    setFormError('');
  };

  const handleClearStockSelection = () => {
    setSelectedStockId('');
    setSelectedStockItem(null);
    setStockSearchQuery('');
    setUnit('Unidade');
  };

  if (!show) return null;

  // Adicionar item da linha draft para a lista
  const handleAddItem = () => {
    setFormError('');
    let finalName = '';
    let prodId = '';

    if (itemType === 'Reposição') {
      if (!selectedStockId && !selectedStockItem) {
        setFormError('Selecione ou digite um insumo cadastrado do estoque.');
        return;
      }
      const found = selectedStockItem || inventoryItems.find(i => i.id === selectedStockId);
      if (!found) {
        setFormError('Insumo não encontrado no estoque.');
        return;
      }
      finalName = found.name;
      prodId = found.id;
    } else {
      if (!newItemName.trim()) {
        setFormError('Informe o nome ou descrição do novo insumo.');
        return;
      }
      finalName = newItemName.trim();
      prodId = 'novo-item';
    }

    const qtyNum = parseInt(quantity) || 1;
    if (qtyNum <= 0) {
      setFormError('A quantidade deve ser maior que zero.');
      return;
    }

    const newItem = {
      id: 'item_' + Math.random().toString(36).substr(2, 9),
      type: itemType,
      productId: prodId,
      productName: finalName,
      quantity: qtyNum,
      unit: unit.trim() || 'Unidade',
      specification: specification.trim()
    };

    setItems(prev => [...prev, newItem]);

    // Limpar campos de adição
    setSelectedStockId('');
    setSelectedStockItem(null);
    setStockSearchQuery('');
    setIsStockDropdownOpen(false);
    setNewItemName('');
    setQuantity(1);
    setUnit('Unidade');
    setSpecification('');
    setFormError('');
  };

  const handleRemoveItem = (id) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError('');

    let finalItems = [...items];

    // Se o usuário preencheu a linha de adição mas esqueceu de clicar em "+ Adicionar", inclui automaticamente
    if (finalItems.length === 0) {
      let draftName = '';
      let draftId = '';
      if (itemType === 'Reposição' && (selectedStockId || selectedStockItem)) {
        const found = selectedStockItem || inventoryItems.find(i => i.id === selectedStockId);
        if (found) {
          draftName = found.name;
          draftId = found.id;
        }
      } else if (itemType === 'Novo' && newItemName.trim()) {
        draftName = newItemName.trim();
        draftId = 'novo-item';
      }

      if (draftName) {
        finalItems.push({
          id: 'item_' + Math.random().toString(36).substr(2, 9),
          type: itemType,
          productId: draftId,
          productName: draftName,
          quantity: Math.max(1, parseInt(quantity) || 1),
          unit: unit.trim() || 'Unidade',
          specification: specification.trim()
        });
      }
    }

    if (finalItems.length === 0) {
      setFormError('Adicione pelo menos um insumo para criar o pedido de solicitação.');
      return;
    }

    if (!justification.trim()) {
      setFormError('Preencha a justificativa da solicitação.');
      return;
    }

    onSave({
      sector,
      priority,
      justification: justification.trim(),
      items: finalItems
    });
  };

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modalContent}>
        {/* Cabeçalho */}
        <div style={styles.modalHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={styles.headerIcon}>
              <ShoppingBag size={20} color="#0891b2" />
            </div>
            <div>
              <h3 style={styles.modalTitle}>
                {editingRequest ? `Editar Solicitação #${editingRequest.code || ''}` : 'Novo Pedido de Solicitação'}
              </h3>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                {editingRequest ? 'Atualize os dados e insumos da solicitação' : 'Inclua múltiplos insumos (estoque ou novos) em um único pedido'}
              </span>
            </div>
          </div>
          <button onClick={onClose} style={styles.modalCloseBtn}>×</button>
        </div>

        <form onSubmit={handleSubmit} style={styles.modalForm}>
          {formError && (
            <div style={styles.errorAlert}>
              <AlertCircle size={16} />
              <span>{formError}</span>
            </div>
          )}

          {/* Dados Gerais do Pedido */}
          <div style={styles.sectionBox}>
            <span style={styles.sectionTitle}>1. Informações Gerais</span>
            
            <div style={styles.formRow}>
              <div style={{ flex: 1 }}>
                <label style={styles.formLabel}>Setor *</label>
                <select 
                  value={sector}
                  onChange={(e) => setSector(e.target.value)}
                  style={styles.modalInput}
                  required
                >
                  <option value="farmacia">Farmácia</option>
                  <option value="enfermagem">Enfermagem</option>
                  <option value="manutencao">Manutenção</option>
                  <option value="recepcao">Recepção</option>
                  <option value="ti">TI</option>
                  <option value="administrativo">Administrativo</option>
                  <option value="laboratorio">Laboratório</option>
                  <option value="nutricao">Nutrição</option>
                  <option value="geral">Geral</option>
                </select>
              </div>

              <div style={{ width: '160px' }}>
                <label style={styles.formLabel}>Prioridade *</label>
                <select 
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  style={{
                    ...styles.modalInput,
                    fontWeight: '700',
                    color: priority === 'Urgente' ? '#ef4444' : '#0284c7',
                    backgroundColor: priority === 'Urgente' ? '#fef2f2' : '#f0f9ff'
                  }}
                  required
                >
                  <option value="Normal">🟢 Normal</option>
                  <option value="Urgente">🔴 Urgente</option>
                </select>
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Justificativa *</label>
              <textarea 
                rows={2}
                placeholder="Explique a necessidade clínica, operacional ou motivo do pedido..."
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                style={styles.modalTextarea}
                required
              />
            </div>
          </div>

          {/* Construtor de Insumos */}
          <div style={styles.sectionBox}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
              <span style={styles.sectionTitle}>2. Adicionar Insumo</span>
              <div style={{ display: 'flex', gap: '0.35rem' }}>
                <button
                  type="button"
                  onClick={() => { setItemType('Reposição'); setFormError(''); }}
                  style={{
                    ...styles.typeBtn,
                    backgroundColor: itemType === 'Reposição' ? '#0891b2' : '#f1f5f9',
                    color: itemType === 'Reposição' ? '#fff' : '#64748b',
                    borderColor: itemType === 'Reposição' ? '#0891b2' : '#cbd5e1'
                  }}
                >
                  <Package size={13} />
                  <span>Estoque</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setItemType('Novo'); setFormError(''); }}
                  style={{
                    ...styles.typeBtn,
                    backgroundColor: itemType === 'Novo' ? '#0891b2' : '#f1f5f9',
                    color: itemType === 'Novo' ? '#fff' : '#64748b',
                    borderColor: itemType === 'Novo' ? '#0891b2' : '#cbd5e1'
                  }}
                >
                  <Sparkles size={13} />
                  <span>Novo</span>
                </button>
              </div>
            </div>

            {/* Seleção do Produto: Autocomplete com Busca por Digitação */}
            {itemType === 'Reposição' ? (
              <div style={styles.formGroup} ref={searchContainerRef}>
                <label style={styles.formLabel}>Insumo Cadastrado (Digite para buscar)</label>
                
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', pointerEvents: 'none' }} />
                    <input 
                      type="text"
                      placeholder="Digite o nome, código ou categoria (ex: seringa, luva, dipirona)..."
                      value={stockSearchQuery}
                      onChange={(e) => {
                        setStockSearchQuery(e.target.value);
                        setSelectedStockId('');
                        setSelectedStockItem(null);
                        setIsStockDropdownOpen(true);
                      }}
                      onFocus={() => setIsStockDropdownOpen(true)}
                      style={{
                        ...styles.modalInput,
                        paddingLeft: '36px',
                        paddingRight: selectedStockItem || stockSearchQuery ? '60px' : '36px'
                      }}
                    />
                    
                    <div style={{ position: 'absolute', right: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {(stockSearchQuery || selectedStockItem) && (
                        <button
                          type="button"
                          onClick={handleClearStockSelection}
                          style={styles.inputClearBtn}
                          title="Limpar busca"
                        >
                          <X size={14} />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setIsStockDropdownOpen(!isStockDropdownOpen)}
                        style={styles.inputDropdownToggle}
                        title="Ver lista"
                      >
                        <ChevronDown size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Dropdown Flutuante de Produtos */}
                  {isStockDropdownOpen && (
                    <div style={styles.autocompleteDropdown}>
                      {filteredStockItems.length === 0 ? (
                        <div style={{ padding: '1rem', textAlign: 'center', color: '#64748b', fontSize: '0.82rem' }}>
                          Nenhum insumo encontrado para "{stockSearchQuery}".
                        </div>
                      ) : (
                        <div style={{ maxHeight: '240px', overflowY: 'auto' }}>
                          <div style={{ padding: '0.4rem 0.75rem', fontSize: '0.72rem', color: '#94a3b8', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', fontWeight: '700', textTransform: 'uppercase' }}>
                            {filteredStockItems.length} insumos encontrados (clique para selecionar):
                          </div>
                          {filteredStockItems.map(item => {
                            const isSelected = selectedStockId === item.id;
                            const stockNum = parseFloat(item.currentStock) || 0;
                            const minNum = parseFloat(item.minStock) || 0;
                            const isBelowMin = stockNum <= minNum;

                            return (
                              <div
                                key={item.id}
                                onClick={() => handleSelectStockItem(item)}
                                style={{
                                  ...styles.autocompleteItem,
                                  backgroundColor: isSelected ? '#f0fdf4' : '#fff'
                                }}
                              >
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                                    <strong style={{ fontSize: '0.84rem', color: isSelected ? '#15803d' : '#1e293b' }}>
                                      {item.name}
                                    </strong>
                                    {item.code && (
                                      <span style={styles.itemCodeBadge}>
                                        #{item.code}
                                      </span>
                                    )}
                                  </div>
                                  <div style={{ display: 'flex', gap: '0.65rem', marginTop: '0.2rem', fontSize: '0.74rem', color: '#64748b' }}>
                                    {item.category && <span>🏷️ {item.category}</span>}
                                    {item.subgroup && <span>📁 {item.subgroup}</span>}
                                  </div>
                                </div>

                                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                  <span style={{
                                    fontSize: '0.76rem',
                                    fontWeight: '700',
                                    padding: '0.15rem 0.5rem',
                                    borderRadius: '6px',
                                    backgroundColor: isBelowMin ? '#fef2f2' : '#ecfdf5',
                                    color: isBelowMin ? '#b91c1c' : '#15803d',
                                    border: `1px solid ${isBelowMin ? '#fecaca' : '#bbf7d0'}`
                                  }}>
                                    Saldo: {stockNum} {item.unit || 'un'}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Confirmação do Insumo Selecionado */}
                {selectedStockItem && (
                  <div style={styles.selectedItemPreview}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <CheckCircle2 size={16} color="#15803d" />
                      <span style={{ fontSize: '0.8rem', color: '#166534', fontWeight: '600' }}>
                        Insumo selecionado: <strong>{selectedStockItem.name}</strong> (Saldo Atual: {selectedStockItem.currentStock || 0} {selectedStockItem.unit || 'un'})
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Nome / Descrição do Novo Insumo</label>
                <input 
                  type="text"
                  placeholder="Ex: Teclado USB ABNT2, Resma Papel A4, Medicamento não listado..."
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  style={styles.modalInput}
                />
              </div>
            )}

            {/* Linha de Quantidade, Unidade, Especificação e Botão Adicionar */}
            <div style={{ display: 'grid', gridTemplateColumns: '100px 110px 1fr auto', gap: '0.65rem', alignItems: 'flex-end', marginTop: '0.5rem' }}>
              <div>
                <label style={styles.formLabel}>Quantidade</label>
                <input 
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  style={styles.modalInput}
                />
              </div>

              <div>
                <label style={styles.formLabel}>Unidade</label>
                <input 
                  type="text"
                  placeholder="un, cx, frasco..."
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  style={styles.modalInput}
                />
              </div>

              <div>
                <label style={styles.formLabel}>Especificação (Opcional)</label>
                <input 
                  type="text"
                  placeholder="Marca, modelo, tamanho ou observação..."
                  value={specification}
                  onChange={(e) => setSpecification(e.target.value)}
                  style={styles.modalInput}
                />
              </div>

              <div>
                <button
                  type="button"
                  onClick={handleAddItem}
                  style={styles.addItemBtn}
                  title="Adicionar insumo à lista do pedido"
                >
                  <Plus size={16} />
                  <span>Adicionar</span>
                </button>
              </div>
            </div>
          </div>

          {/* Lista de Insumos Adicionados */}
          <div style={styles.sectionBox}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
              <span style={styles.sectionTitle}>3. Insumos do Pedido</span>
              <span style={styles.itemsCountBadge}>
                {items.length} {items.length === 1 ? 'insumo' : 'insumos'}
              </span>
            </div>

            {items.length === 0 ? (
              <div style={styles.emptyItemsBox}>
                <Layers size={28} color="#94a3b8" />
                <p style={{ margin: '0.4rem 0 0 0', fontSize: '0.85rem', color: '#64748b', fontWeight: '500' }}>
                  Nenhum insumo incluído neste pedido.
                </p>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                  Selecione os produtos acima e clique em "Adicionar" para montar a solicitação.
                </span>
              </div>
            ) : (
              <div style={styles.itemsTableWrapper}>
                <table style={styles.itemsTable}>
                  <thead>
                    <tr>
                      <th style={{ ...styles.itemsTh, width: '40px' }}>#</th>
                      <th style={{ ...styles.itemsTh, width: '90px' }}>Tipo</th>
                      <th style={styles.itemsTh}>Insumo</th>
                      <th style={{ ...styles.itemsTh, width: '120px' }}>Quantidade</th>
                      <th style={styles.itemsTh}>Especificação</th>
                      <th style={{ ...styles.itemsTh, width: '45px', textAlign: 'center' }}>Ação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((it, idx) => (
                      <tr key={it.id || idx} style={styles.itemsTr}>
                        <td style={{ ...styles.itemsTd, color: '#94a3b8', fontWeight: '600' }}>{idx + 1}</td>
                        <td style={styles.itemsTd}>
                          <span style={{
                            ...styles.itemTypeBadge,
                            backgroundColor: it.type === 'Reposição' ? '#ecfeff' : '#fdf4ff',
                            color: it.type === 'Reposição' ? '#0891b2' : '#a21caf',
                            borderColor: it.type === 'Reposição' ? '#cffafe' : '#f5d0fe'
                          }}>
                            {it.type === 'Reposição' ? '📦 Estoque' : '✨ Novo'}
                          </span>
                        </td>
                        <td style={{ ...styles.itemsTd, fontWeight: '700', color: 'var(--text-primary)' }}>
                          {it.productName}
                        </td>
                        <td style={styles.itemsTd}>
                          <strong style={{ color: '#0891b2', fontSize: '0.9rem' }}>{it.quantity}</strong>{' '}
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{it.unit}</span>
                        </td>
                        <td style={{ ...styles.itemsTd, color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                          {it.specification || '-'}
                        </td>
                        <td style={{ ...styles.itemsTd, textAlign: 'center' }}>
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(it.id)}
                            style={styles.deleteItemBtn}
                            title="Remover insumo da lista"
                          >
                            <Trash2 size={15} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Rodapé do Modal */}
          <div style={styles.modalActions}>
            <button 
              type="button" 
              onClick={onClose}
              style={styles.modalCancelBtn}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={actionLoading || items.length === 0}
              style={{
                ...styles.modalSubmitBtn,
                opacity: (actionLoading || items.length === 0) ? 0.6 : 1,
                cursor: (actionLoading || items.length === 0) ? 'not-allowed' : 'pointer'
              }}
            >
              {actionLoading ? 'Salvando...' : editingRequest ? 'Atualizar Solicitação' : `Enviar Solicitação (${items.length} ${items.length === 1 ? 'insumo' : 'insumos'})`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
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
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '740px',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    display: 'flex',
    flexDirection: 'column'
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.25rem 1.5rem',
    borderBottom: '1px solid #f1f5f9'
  },
  headerIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    backgroundColor: '#ecfeff',
    border: '1px solid #cffafe',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  modalTitle: {
    fontSize: '1.15rem',
    fontWeight: '800',
    color: 'var(--text-primary)',
    margin: 0
  },
  modalCloseBtn: {
    background: 'none',
    border: 'none',
    fontSize: '1.6rem',
    cursor: 'pointer',
    color: '#94a3b8',
    lineHeight: 1,
    padding: '0.25rem'
  },
  modalForm: {
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem'
  },
  sectionBox: {
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '1rem 1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem'
  },
  sectionTitle: {
    fontSize: '0.82rem',
    fontWeight: '700',
    color: '#334155',
    textTransform: 'uppercase',
    letterSpacing: '0.03em'
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
    fontSize: '0.78rem',
    fontWeight: '600',
    color: 'var(--text-secondary)'
  },
  modalInput: {
    padding: '0.55rem 0.75rem',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    backgroundColor: '#fff',
    fontSize: '0.85rem',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
    color: 'var(--text-primary)'
  },
  modalTextarea: {
    padding: '0.55rem 0.75rem',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    backgroundColor: '#fff',
    fontSize: '0.85rem',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
    resize: 'vertical',
    color: 'var(--text-primary)'
  },
  typeBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.3rem',
    padding: '0.3rem 0.65rem',
    borderRadius: '6px',
    border: '1px solid',
    fontSize: '0.75rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.15s ease'
  },
  addItemBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
    backgroundColor: '#0891b2',
    color: '#fff',
    border: 'none',
    padding: '0.55rem 0.95rem',
    borderRadius: '8px',
    fontWeight: '700',
    fontSize: '0.82rem',
    cursor: 'pointer',
    boxShadow: '0 2px 6px rgba(8, 145, 178, 0.25)',
    whiteSpace: 'nowrap'
  },
  itemsCountBadge: {
    fontSize: '0.75rem',
    fontWeight: '700',
    backgroundColor: '#ecfeff',
    color: '#0891b2',
    border: '1px solid #cffafe',
    padding: '0.15rem 0.55rem',
    borderRadius: '12px'
  },
  emptyItemsBox: {
    padding: '1.75rem 1rem',
    textAlign: 'center',
    backgroundColor: '#fff',
    border: '1px dashed #cbd5e1',
    borderRadius: '10px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  },
  itemsTableWrapper: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    overflowX: 'auto'
  },
  itemsTable: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left'
  },
  itemsTh: {
    padding: '0.55rem 0.75rem',
    fontSize: '0.75rem',
    fontWeight: '700',
    color: '#64748b',
    backgroundColor: '#f8fafc',
    borderBottom: '1px solid #e2e8f0'
  },
  itemsTr: {
    borderBottom: '1px solid #f1f5f9'
  },
  itemsTd: {
    padding: '0.55rem 0.75rem',
    fontSize: '0.82rem',
    verticalAlign: 'middle'
  },
  itemTypeBadge: {
    fontSize: '0.7rem',
    fontWeight: '700',
    padding: '0.15rem 0.45rem',
    borderRadius: '6px',
    border: '1px solid',
    display: 'inline-block'
  },
  deleteItemBtn: {
    background: 'none',
    border: 'none',
    color: '#ef4444',
    cursor: 'pointer',
    padding: '0.25rem',
    borderRadius: '4px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  errorAlert: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.65rem 0.85rem',
    backgroundColor: '#fef2f2',
    color: '#b91c1c',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    fontSize: '0.82rem',
    fontWeight: '600'
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.75rem',
    paddingTop: '0.5rem',
    borderTop: '1px solid #f1f5f9'
  },
  modalCancelBtn: {
    padding: '0.65rem 1.25rem',
    borderRadius: '10px',
    border: '1px solid #cbd5e1',
    backgroundColor: '#fff',
    fontSize: '0.85rem',
    fontWeight: '600',
    color: 'var(--text-secondary)',
    cursor: 'pointer'
  },
  modalSubmitBtn: {
    padding: '0.65rem 1.5rem',
    borderRadius: '10px',
    border: 'none',
    backgroundColor: '#0891b2',
    fontSize: '0.85rem',
    fontWeight: '700',
    color: '#fff',
    boxShadow: '0 4px 12px rgba(8, 145, 178, 0.25)'
  }
};
