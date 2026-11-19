import React, { useState, useEffect, useMemo } from 'react';
import {
  Package, Plus, Search, Edit2, Trash2, Power, CheckCircle2, AlertCircle, X
} from 'lucide-react';
import {
  getFoodProducts, createFoodProduct, updateFoodProduct, deleteFoodProduct,
  toggleFoodProductActive, getFoodEntries, getFoodWaste,
  formatCurrency
} from '../../../services/firebase/foodWasteService';

export default function FoodProductsTab({ currentUser }) {
  const [products, setProducts] = useState([]);
  const [entries, setEntries] = useState([]);
  const [waste, setWaste] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [nome, setNome] = useState('');
  const [unidade, setUnidade] = useState('un');
  const [custoUnitario, setCustoUnitario] = useState('');
  const [ativo, setAtivo] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, tipo = 'sucesso') => {
    setToast({ msg, tipo });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prods, ent, wst] = await Promise.all([
        getFoodProducts(),
        getFoodEntries(),
        getFoodWaste()
      ]);
      setProducts(prods || []);
      setEntries(ent || []);
      setWaste(wst || []);
    } catch (e) {
      console.error('Erro ao buscar alimentos:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const handleSync = () => fetchData();
    window.addEventListener('food:sync', handleSync);
    return () => window.removeEventListener('food:sync', handleSync);
  }, []);

  const handleOpenCreateModal = () => {
    setEditingProduct(null);
    setNome('');
    setUnidade('un');
    setCustoUnitario('');
    setAtivo(true);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (p) => {
    setEditingProduct(p);
    setNome(p.nome);
    setUnidade(p.unidade || 'un');
    setCustoUnitario(String(p.custo_unitario || 0));
    setAtivo(p.ativo !== false);
    setIsModalOpen(true);
  };

  const handleToggleActive = async (id) => {
    try {
      await toggleFoodProductActive(id);
      showToast('Status do alimento atualizado!');
      fetchData();
    } catch (e) {
      console.error(e);
      showToast('Erro ao alternar status do alimento.', 'erro');
    }
  };

  const handleDelete = async (id, nomeItem) => {
    if (window.confirm(`Deseja realmente excluir o alimento "${nomeItem}"?`)) {
      try {
        await deleteFoodProduct(id);
        showToast('Alimento removido com sucesso!');
        fetchData();
      } catch (e) {
        console.error(e);
        showToast('Erro ao excluir alimento.', 'erro');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const costNum = parseFloat(custoUnitario);
    if (!nome.trim() || !unidade || isNaN(costNum) || costNum < 0) {
      showToast('Preencha um nome, unidade e custo unitário válido (>= 0).', 'erro');
      return;
    }

    setSubmitting(true);
    try {
      if (editingProduct) {
        await updateFoodProduct(editingProduct.id, {
          nome: nome.trim(),
          unidade: unidade.trim(),
          custo_unitario: costNum,
          ativo
        });
        showToast('Alimento atualizado com sucesso!');
      } else {
        await createFoodProduct({
          nome: nome.trim(),
          unidade: unidade.trim(),
          custo_unitario: costNum,
          ativo
        });
        showToast('Novo alimento cadastrado com sucesso!');
      }

      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
      showToast('Erro ao salvar alimento.', 'erro');
    } finally {
      setSubmitting(false);
    }
  };

  // Contadores de uso
  const productUsageMap = useMemo(() => {
    const map = {};
    products.forEach((p) => {
      map[p.id] = { entradas: 0, sobras: 0 };
    });

    entries.forEach((e) => {
      if (map[e.produto_id]) map[e.produto_id].entradas += 1;
    });

    waste.forEach((w) => {
      if (map[w.produto_id]) map[w.produto_id].sobras += 1;
    });

    return map;
  }, [products, entries, waste]);

  const filteredProducts = useMemo(() => {
    if (!searchTerm) return products;
    const s = searchTerm.toLowerCase();
    return products.filter((p) => (p.nome || '').toLowerCase().includes(s));
  }, [products, searchTerm]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* TOAST */}
      {toast && (
        <div style={{
          ...styles.toast,
          backgroundColor: toast.tipo === 'erro' ? '#fef2f2' : '#ecfdf5',
          color: toast.tipo === 'erro' ? '#dc2626' : '#059669',
          border: `1px solid ${toast.tipo === 'erro' ? '#fecaca' : '#a7f3d0'}`
        }}>
          {toast.tipo === 'erro' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
          <span>{toast.msg}</span>
        </div>
      )}

      {/* BARRA DE AÇÕES */}
      <div style={styles.actionRow}>
        <div style={styles.searchBox}>
          <Search size={15} color="#94a3b8" />
          <input
            type="text"
            placeholder="Buscar alimento por nome..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
        </div>

        <button
          type="button"
          onClick={handleOpenCreateModal}
          style={styles.btnPrimary}
        >
          <Plus size={16} />
          <span>Produto</span>
        </button>
      </div>

      {/* TABELA DE PRODUTOS (RÓTULOS 1 PALAVRA) */}
      <div style={styles.tableCard}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.trHead}>
              <th style={styles.th}>Produto</th>
              <th style={styles.th}>Unidade</th>
              <th style={styles.th}>Custo</th>
              <th style={styles.th}>Entradas</th>
              <th style={styles.th}>Sobras</th>
              <th style={styles.th}>Status</th>
              <th style={{ ...styles.th, textAlign: 'right' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ ...styles.td, textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>
                  Carregando catálogo de alimentos...
                </td>
              </tr>
            ) : filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ ...styles.td, textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>
                  Nenhum alimento cadastrado.
                </td>
              </tr>
            ) : (
              filteredProducts.map((p) => {
                const usage = productUsageMap[p.id] || { entradas: 0, sobras: 0 };
                return (
                  <tr key={p.id} style={styles.trBody}>
                    <td style={{ ...styles.td, fontWeight: 700, color: 'var(--text-primary, #0f172a)' }}>
                      {p.nome}
                    </td>
                    <td style={styles.td}>
                      <span style={styles.unitBadge}>{p.unidade}</span>
                    </td>
                    <td style={{ ...styles.td, fontWeight: 700, color: '#059669' }}>
                      {formatCurrency(p.custo_unitario)}
                    </td>
                    <td style={styles.td}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary, #64748b)' }}>
                        {usage.entradas} lotes
                      </span>
                    </td>
                    <td style={styles.td}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#dc2626' }}>
                        {usage.sobras} descartes
                      </span>
                    </td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.statusBadge,
                        backgroundColor: p.ativo ? '#ecfdf5' : '#f1f5f9',
                        color: p.ativo ? '#059669' : '#64748b',
                        border: p.ativo ? '1px solid #a7f3d0' : '1px solid #cbd5e1'
                      }}>
                        {p.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td style={{ ...styles.td, textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                        <button
                          type="button"
                          onClick={() => handleToggleActive(p.id)}
                          style={{
                            ...styles.iconBtn,
                            color: p.ativo ? '#059669' : '#94a3b8'
                          }}
                          title={p.ativo ? 'Desativar' : 'Ativar'}
                        >
                          <Power size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(p)}
                          style={styles.iconBtn}
                          title="Editar"
                        >
                          <Edit2 size={14} color="#0891b2" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(p.id, p.nome)}
                          style={{ ...styles.iconBtn, color: '#ef4444' }}
                          title="Excluir"
                        >
                          <Trash2 size={14} />
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

      {/* MODAL DE CADASTRO / EDIÇÃO */}
      {isModalOpen && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary, #0f172a)' }}>
                  {editingProduct ? 'Editar Produto' : 'Novo Produto'}
                </h3>
                <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.75rem', color: 'var(--text-secondary, #64748b)' }}>
                  Cadastre alimentos, refeições, dietas ou insumos da clínica
                </p>
              </div>
              <button type="button" onClick={() => setIsModalOpen(false)} style={styles.btnClose}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={styles.label}>Produto (Nome)</label>
                <input
                  type="text"
                  placeholder="Ex: MARMITEX PACIENTE - ALMOÇO"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  style={styles.input}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={styles.label}>Unidade</label>
                  <select
                    value={unidade}
                    onChange={(e) => setUnidade(e.target.value)}
                    style={styles.input}
                    required
                  >
                    <option value="un">un (Unidade)</option>
                    <option value="kg">kg (Quilograma)</option>
                    <option value="g">g (Grama)</option>
                    <option value="l">l (Litro)</option>
                    <option value="ml">ml (Mililitro)</option>
                    <option value="porção">porção (Porção)</option>
                  </select>
                </div>

                <div>
                  <label style={styles.label}>Custo (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={custoUnitario}
                    onChange={(e) => setCustoUnitario(e.target.value)}
                    style={styles.input}
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  <input
                    type="checkbox"
                    checked={ativo}
                    onChange={(e) => setAtivo(e.target.checked)}
                    style={{ width: '16px', height: '16px', accentColor: '#059669' }}
                  />
                  <span>Alimento ativo para registro de sobras e entradas</span>
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.65rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={styles.btnSecondary}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={styles.btnPrimary}
                >
                  {submitting ? 'Salvando...' : 'Salvar'}
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
  toast: {
    padding: '0.75rem 1.25rem',
    borderRadius: '10px',
    fontSize: '0.85rem',
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
  },
  actionRow: {
    backgroundColor: 'var(--bg-card, #ffffff)',
    borderRadius: '12px',
    border: '1px solid var(--border-color, #e2e8f0)',
    padding: '0.85rem 1.25rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '0.75rem'
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.45rem',
    backgroundColor: 'var(--bg-surface, #f8fafc)',
    padding: '0.45rem 0.75rem',
    borderRadius: '8px',
    border: '1px solid var(--border-color, #cbd5e1)',
    minWidth: '260px'
  },
  searchInput: {
    background: 'none',
    border: 'none',
    outline: 'none',
    width: '100%',
    color: 'var(--text-primary, #0f172a)',
    fontSize: '0.825rem'
  },
  btnPrimary: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    padding: '0.55rem 1rem',
    borderRadius: '8px',
    backgroundColor: '#059669',
    color: '#ffffff',
    border: 'none',
    fontWeight: 700,
    fontSize: '0.825rem',
    cursor: 'pointer',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
  },
  btnSecondary: {
    padding: '0.5rem 0.9rem',
    borderRadius: '8px',
    border: '1px solid var(--border-color, #cbd5e1)',
    backgroundColor: 'var(--bg-card, #ffffff)',
    color: 'var(--text-primary, #1e293b)',
    fontWeight: 600,
    fontSize: '0.825rem',
    cursor: 'pointer'
  },
  tableCard: {
    backgroundColor: 'var(--bg-card, #ffffff)',
    borderRadius: '12px',
    border: '1px solid var(--border-color, #e2e8f0)',
    overflow: 'hidden'
  },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
  trHead: { backgroundColor: 'var(--bg-surface, #f8fafc)', borderBottom: '1px solid var(--border-color, #e2e8f0)' },
  th: { padding: '0.75rem 1rem', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary, #64748b)' },
  trBody: { borderBottom: '1px solid var(--border-color, #f1f5f9)' },
  td: { padding: '0.75rem 1rem', fontSize: '0.85rem', verticalAlign: 'middle' },
  unitBadge: {
    display: 'inline-block',
    padding: '0.15rem 0.45rem',
    borderRadius: '4px',
    fontSize: '0.72rem',
    fontWeight: 700,
    backgroundColor: '#f1f5f9',
    color: '#334155'
  },
  statusBadge: {
    display: 'inline-block',
    padding: '0.15rem 0.5rem',
    borderRadius: '6px',
    fontSize: '0.7rem',
    fontWeight: 700
  },
  iconBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '0.3rem',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    backdropFilter: 'blur(3px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000,
    padding: '1rem'
  },
  modal: {
    backgroundColor: 'var(--bg-card, #ffffff)',
    borderRadius: '14px',
    width: '100%',
    maxWidth: '520px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15)',
    border: '1px solid var(--border-color, #e2e8f0)',
    overflow: 'hidden'
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 1.25rem',
    borderBottom: '1px solid var(--border-color, #e2e8f0)',
    backgroundColor: 'var(--bg-surface, #f8fafc)'
  },
  btnClose: { background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' },
  label: { fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem', display: 'block' },
  input: { width: '100%', padding: '0.55rem 0.8rem', borderRadius: '8px', border: '1px solid var(--border-color, #cbd5e1)', fontSize: '0.85rem', boxSizing: 'border-box' }
};
