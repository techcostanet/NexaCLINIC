import React, { useState, useEffect, useMemo } from 'react';
import {
  PackagePlus, Search, Plus, Filter, Edit2, Trash2, CheckCircle2, AlertCircle,
  BarChart2, LineChart as LineChartIcon, AreaChart as AreaChartIcon, X, DollarSign
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, LineChart, Line,
  AreaChart, Area, XAxis, YAxis, LabelList, Tooltip
} from 'recharts';
import {
  getFoodEntries, createFoodEntry, updateFoodEntry, deleteFoodEntry,
  getFoodProducts, parseLocalDate, formatDateBR, formatDateInput,
  formatCurrency, formatNumber, formatQuantity
} from '../../../services/firebase/foodWasteService';

export default function FoodEntriesTab({ currentUser }) {
  const now = new Date();
  const currentMonthStr = (now.getMonth() + 1).toString().padStart(2, '0');
  const currentYearStr = now.getFullYear().toString();

  // Filtros
  const [selectedMonth, setSelectedMonth] = useState(currentMonthStr);
  const [selectedYear, setSelectedYear] = useState(currentYearStr);
  const [searchTerm, setSearchTerm] = useState('');

  // Gráfico
  const [chartType, setChartType] = useState('bar');
  const [metric, setMetric] = useState('valor'); // 'valor' | 'quantidade'
  const [period, setPeriod] = useState('dia'); // 'dia' | 'semana'

  // Dados
  const [entries, setEntries] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [valorTotal, setValorTotal] = useState('');
  const [dataEntrada, setDataEntrada] = useState(formatDateInput(new Date()));
  const [observacao, setObservacao] = useState('Entrada Registrada');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, tipo = 'sucesso') => {
    setToast({ msg, tipo });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ent, prods] = await Promise.all([
        getFoodEntries(),
        getFoodProducts()
      ]);
      setEntries(ent || []);
      setProducts(prods || []);
    } catch (e) {
      console.error('Erro ao buscar entradas:', e);
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

  const resetForm = () => {
    setEditingEntry(null);
    setSelectedProductId(products[0]?.id || '');
    setQuantidade('');
    setValorTotal('');
    setDataEntrada(formatDateInput(new Date()));
    setObservacao('Entrada Registrada');
  };

  const handleOpenNewModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleEdit = (entry) => {
    setEditingEntry(entry);
    setSelectedProductId(entry.produto_id || '');
    setQuantidade(String(entry.quantidade || ''));
    setValorTotal(String(entry.valor_total || ''));
    setDataEntrada(formatDateInput(entry.data_entrada || entry.criado_em));
    setObservacao(entry.observacao || '');
    setIsModalOpen(true);
  };

  const handleProductChange = (prodId) => {
    setSelectedProductId(prodId);
    const prod = products.find((p) => p.id === prodId);
    if (prod && quantidade) {
      const qty = parseFloat(quantidade);
      if (!isNaN(qty)) {
        setValorTotal((qty * prod.custo_unitario).toFixed(2));
      }
    }
  };

  const handleQuantidadeChange = (val) => {
    setQuantidade(val);
    const qty = parseFloat(val);
    const prod = products.find((p) => p.id === selectedProductId);
    if (prod && !isNaN(qty)) {
      setValorTotal((qty * prod.custo_unitario).toFixed(2));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const qtyNum = parseFloat(quantidade);
    const valTotalNum = parseFloat(valorTotal);

    if (!selectedProductId || isNaN(qtyNum) || qtyNum <= 0 || isNaN(valTotalNum) || valTotalNum < 0) {
      showToast('Selecione o produto e informe uma quantidade e valor total válidos.', 'erro');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        produto_id: selectedProductId,
        quantidade: qtyNum,
        valor_total: valTotalNum,
        data_entrada: dataEntrada,
        observacao
      };

      if (editingEntry) {
        await updateFoodEntry(editingEntry.id, payload);
        showToast('Entrada atualizada com sucesso!');
      } else {
        await createFoodEntry(payload);
        showToast('Entrada registrada com sucesso!');
      }

      setIsModalOpen(false);
      resetForm();
      fetchData();
    } catch (err) {
      console.error(err);
      showToast('Erro ao salvar entrada.', 'erro');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Deseja realmente excluir este registro de entrada?')) {
      try {
        await deleteFoodEntry(id);
        showToast('Entrada excluída!');
        fetchData();
      } catch (err) {
        console.error(err);
        showToast('Erro ao excluir entrada.', 'erro');
      }
    }
  };

  // Filtragem
  const filteredEntries = useMemo(() => {
    return entries.filter((e) => {
      const d = parseLocalDate(e.data_entrada || e.criado_em);
      const mStr = (d.getMonth() + 1).toString().padStart(2, '0');
      const yStr = d.getFullYear().toString();

      const monthMatch = selectedMonth === 'ALL' || mStr === selectedMonth;
      const yearMatch = selectedYear === 'ALL' || yStr === selectedYear;

      const pNome = e.produto?.nome || '';
      const obs = e.observacao || '';
      const searchMatch = !searchTerm ||
        pNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        obs.toLowerCase().includes(searchTerm.toLowerCase());

      return monthMatch && yearMatch && searchMatch;
    });
  }, [entries, selectedMonth, selectedYear, searchTerm]);

  // Estatísticas
  const statsPeriodo = useMemo(() => {
    let totalInvestido = 0;
    let totalQtd = 0;
    filteredEntries.forEach((e) => {
      totalInvestido += Number(e.valor_total) || 0;
      totalQtd += Number(e.quantidade) || 0;
    });
    return {
      totalInvestido,
      totalQtd,
      totalLotes: filteredEntries.length
    };
  }, [filteredEntries]);

  // Gráfico de Entradas
  const chartData = useMemo(() => {
    if (!filteredEntries.length && selectedMonth !== 'ALL') return [];

    if (selectedMonth === 'ALL') {
      const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      const monthlyGroup = monthNames.map((name) => ({ name, valor: 0 }));

      filteredEntries.forEach((e) => {
        const d = parseLocalDate(e.data_entrada || e.criado_em);
        const mIdx = d.getMonth();
        const val = metric === 'valor' ? (Number(e.valor_total) || 0) : (Number(e.quantidade) || 0);
        if (mIdx >= 0 && mIdx < 12) {
          monthlyGroup[mIdx].valor += val;
        }
      });

      return monthlyGroup.map((item) => ({
        name: item.name,
        valor: Number(item.valor.toFixed(2))
      }));
    }

    const grouped = {};
    filteredEntries.forEach((e) => {
      let key = '';
      let sortKey = 0;
      const d = parseLocalDate(e.data_entrada || e.criado_em);

      if (period === 'dia') {
        key = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`;
        sortKey = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
      } else {
        const dayOfMonth = d.getDate();
        const weekNum = Math.ceil(dayOfMonth / 7);
        key = `Sem. ${weekNum}`;
        sortKey = weekNum;
      }

      const val = metric === 'valor' ? (Number(e.valor_total) || 0) : (Number(e.quantidade) || 0);
      if (!grouped[key]) {
        grouped[key] = { label: key, sortKey, valor: 0 };
      }
      grouped[key].valor += val;
    });

    return Object.values(grouped)
      .sort((a, b) => a.sortKey - b.sortKey)
      .map((item) => ({
        name: item.label,
        valor: Number(item.valor.toFixed(2))
      }));
  }, [filteredEntries, selectedMonth, period, metric]);

  const meses = [
    { value: 'ALL', label: 'Todos os Meses' },
    { value: '01', label: 'Janeiro' },
    { value: '02', label: 'Fevereiro' },
    { value: '03', label: 'Março' },
    { value: '04', label: 'Abril' },
    { value: '05', label: 'Maio' },
    { value: '06', label: 'Junho' },
    { value: '07', label: 'Julho' },
    { value: '08', label: 'Agosto' },
    { value: '09', label: 'Setembro' },
    { value: '10', label: 'Outubro' },
    { value: '11', label: 'Novembro' },
    { value: '12', label: 'Dezembro' }
  ];

  const anos = [
    { value: 'ALL', label: 'Todos os Anos' },
    { value: '2026', label: '2026' },
    { value: '2025', label: '2025' },
    { value: '2024', label: '2024' }
  ];

  const selectedProduct = products.find(p => p.id === selectedProductId);

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

      {/* CARDS DE ESTATÍSTICA DO PERÍODO */}
      <div style={styles.statsGrid}>
        <div style={{ ...styles.statCard, borderLeft: '4px solid #059669' }}>
          <span style={styles.statLabel}>Investimento</span>
          <h3 style={styles.statValue}>{formatCurrency(statsPeriodo.totalInvestido)}</h3>
          <p style={styles.statSub}>Total de compras registradas</p>
        </div>

        <div style={{ ...styles.statCard, borderLeft: '4px solid #0891b2' }}>
          <span style={styles.statLabel}>Volume</span>
          <h3 style={styles.statValue}>{formatNumber(statsPeriodo.totalQtd)} un/kg</h3>
          <p style={styles.statSub}>Quantidade física recebida</p>
        </div>

        <div style={{ ...styles.statCard, borderLeft: '4px solid #7c3aed' }}>
          <span style={styles.statLabel}>Lotes</span>
          <h3 style={styles.statValue}>{statsPeriodo.totalLotes}</h3>
          <p style={styles.statSub}>Entradas registradas no período</p>
        </div>
      </div>

      {/* GRÁFICO HISTÓRICO DE ENTRADAS */}
      <div style={styles.chartCard}>
        <div style={styles.chartHeader}>
          <div>
            <h3 style={styles.chartTitle}>Histórico de Entradas</h3>
            <p style={styles.chartSub}>
              {selectedMonth === 'ALL'
                ? 'Evolução mensal consolidada de aquisições'
                : `Evolução de recebimento por ${period === 'dia' ? 'dia' : 'semana'}`}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={styles.toggleGroup}>
              <button
                type="button"
                onClick={() => setMetric('valor')}
                style={{
                  ...styles.toggleBtn,
                  backgroundColor: metric === 'valor' ? '#059669' : 'transparent',
                  color: metric === 'valor' ? '#ffffff' : 'var(--text-secondary, #64748b)'
                }}
              >
                R$
              </button>
              <button
                type="button"
                onClick={() => setMetric('quantidade')}
                style={{
                  ...styles.toggleBtn,
                  backgroundColor: metric === 'quantidade' ? '#059669' : 'transparent',
                  color: metric === 'quantidade' ? '#ffffff' : 'var(--text-secondary, #64748b)'
                }}
              >
                Qtd
              </button>
            </div>

            {selectedMonth !== 'ALL' && (
              <div style={styles.toggleGroup}>
                <button
                  type="button"
                  onClick={() => setPeriod('dia')}
                  style={{
                    ...styles.toggleBtn,
                    backgroundColor: period === 'dia' ? '#059669' : 'transparent',
                    color: period === 'dia' ? '#ffffff' : 'var(--text-secondary, #64748b)'
                  }}
                >
                  Dia
                </button>
                <button
                  type="button"
                  onClick={() => setPeriod('semana')}
                  style={{
                    ...styles.toggleBtn,
                    backgroundColor: period === 'semana' ? '#059669' : 'transparent',
                    color: period === 'semana' ? '#ffffff' : 'var(--text-secondary, #64748b)'
                  }}
                >
                  Semana
                </button>
              </div>
            )}

            <div style={styles.toggleGroup}>
              <button
                type="button"
                onClick={() => setChartType('bar')}
                style={{
                  ...styles.toggleBtn,
                  backgroundColor: chartType === 'bar' ? '#059669' : 'transparent',
                  color: chartType === 'bar' ? '#ffffff' : 'var(--text-secondary, #64748b)'
                }}
              >
                <BarChart2 size={14} />
              </button>
              <button
                type="button"
                onClick={() => setChartType('line')}
                style={{
                  ...styles.toggleBtn,
                  backgroundColor: chartType === 'line' ? '#059669' : 'transparent',
                  color: chartType === 'line' ? '#ffffff' : 'var(--text-secondary, #64748b)'
                }}
              >
                <LineChartIcon size={14} />
              </button>
              <button
                type="button"
                onClick={() => setChartType('area')}
                style={{
                  ...styles.toggleBtn,
                  backgroundColor: chartType === 'area' ? '#059669' : 'transparent',
                  color: chartType === 'area' ? '#ffffff' : 'var(--text-secondary, #64748b)'
                }}
              >
                <AreaChartIcon size={14} />
              </button>
            </div>
          </div>
        </div>

        <div style={{ height: '240px', width: '100%', marginTop: '0.75rem' }}>
          {loading ? (
            <div style={styles.emptyNotice}>Carregando gráfico de entradas...</div>
          ) : chartData.length === 0 ? (
            <div style={styles.emptyNotice}>Nenhuma entrada registrada no período.</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'bar' ? (
                <BarChart data={chartData} margin={{ top: 25, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={(val) => metric === 'valor' ? `R$${val}` : val} />
                  <Tooltip formatter={(val) => [metric === 'valor' ? formatCurrency(val) : formatNumber(val), metric === 'valor' ? 'Investimento' : 'Quantidade']} />
                  <Bar dataKey="valor" fill="#059669" radius={[6, 6, 0, 0]}>
                    <LabelList
                      dataKey="valor"
                      position="top"
                      fill="#059669"
                      fontSize={10}
                      fontWeight="bold"
                      formatter={(val) => metric === 'valor' ? formatCurrency(val) : formatNumber(val)}
                    />
                  </Bar>
                </BarChart>
              ) : chartType === 'line' ? (
                <LineChart data={chartData} margin={{ top: 25, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={(val) => metric === 'valor' ? `R$${val}` : val} />
                  <Tooltip formatter={(val) => [metric === 'valor' ? formatCurrency(val) : formatNumber(val), metric === 'valor' ? 'Investimento' : 'Quantidade']} />
                  <Line type="monotone" dataKey="valor" stroke="#059669" strokeWidth={3} dot={{ r: 4, fill: '#059669' }}>
                    <LabelList
                      dataKey="valor"
                      position="top"
                      fill="#059669"
                      fontSize={10}
                      fontWeight="bold"
                      formatter={(val) => metric === 'valor' ? formatCurrency(val) : formatNumber(val)}
                    />
                  </Line>
                </LineChart>
              ) : (
                <AreaChart data={chartData} margin={{ top: 25, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={(val) => metric === 'valor' ? `R$${val}` : val} />
                  <Tooltip formatter={(val) => [metric === 'valor' ? formatCurrency(val) : formatNumber(val), metric === 'valor' ? 'Investimento' : 'Quantidade']} />
                  <Area type="monotone" dataKey="valor" stroke="#059669" fill="#059669" fillOpacity={0.2} dot={{ r: 4, fill: '#059669' }}>
                    <LabelList
                      dataKey="valor"
                      position="top"
                      fill="#059669"
                      fontSize={10}
                      fontWeight="bold"
                      formatter={(val) => metric === 'valor' ? formatCurrency(val) : formatNumber(val)}
                    />
                  </Area>
                </AreaChart>
              )}
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* BARRA DE FILTROS E AÇÃO */}
      <div style={styles.actionRow}>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            style={styles.select}
          >
            {meses.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            style={styles.select}
          >
            {anos.map((y) => (
              <option key={y.value} value={y.value}>{y.label}</option>
            ))}
          </select>

          <div style={styles.searchBox}>
            <Search size={15} color="#94a3b8" />
            <input
              type="text"
              placeholder="Buscar por alimento ou observação..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleOpenNewModal}
          style={styles.btnPrimary}
        >
          <Plus size={16} />
          <span>Entrada</span>
        </button>
      </div>

      {/* TABELA DE ENTRADAS (RÓTULOS 1 PALAVRA) */}
      <div style={styles.tableCard}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.trHead}>
              <th style={styles.th}>Data</th>
              <th style={styles.th}>Produto</th>
              <th style={styles.th}>Quantidade</th>
              <th style={styles.th}>Custo</th>
              <th style={styles.th}>Total</th>
              <th style={styles.th}>Observação</th>
              <th style={{ ...styles.th, textAlign: 'right' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ ...styles.td, textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>
                  Carregando entradas...
                </td>
              </tr>
            ) : filteredEntries.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ ...styles.td, textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>
                  Nenhum lote de entrada encontrado.
                </td>
              </tr>
            ) : (
              filteredEntries.map((e) => (
                <tr key={e.id} style={styles.trBody}>
                  <td style={{ ...styles.td, fontWeight: 600 }}>
                    {formatDateBR(e.data_entrada)}
                  </td>
                  <td style={{ ...styles.td, fontWeight: 700, color: 'var(--text-primary, #0f172a)' }}>
                    {e.produto?.nome || 'Insumo'}
                  </td>
                  <td style={{ ...styles.td, fontWeight: 600 }}>
                    {formatQuantity(e.quantidade, e.produto?.unidade)}
                  </td>
                  <td style={{ ...styles.td, color: 'var(--text-secondary, #64748b)' }}>
                    {formatCurrency(e.produto?.custo_unitario)}
                  </td>
                  <td style={{ ...styles.td, fontWeight: 700, color: '#059669' }}>
                    {formatCurrency(e.valor_total)}
                  </td>
                  <td style={{ ...styles.td, color: 'var(--text-secondary, #64748b)' }}>
                    {e.observacao || '—'}
                  </td>
                  <td style={{ ...styles.td, textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                      <button
                        type="button"
                        onClick={() => handleEdit(e)}
                        style={styles.iconBtn}
                        title="Editar"
                      >
                        <Edit2 size={14} color="#0891b2" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(e.id)}
                        style={{ ...styles.iconBtn, color: '#ef4444' }}
                        title="Excluir"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL DE CRIAÇÃO / EDIÇÃO */}
      {isModalOpen && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary, #0f172a)' }}>
                  {editingEntry ? 'Editar Entrada' : 'Nova Entrada'}
                </h3>
                <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.75rem', color: 'var(--text-secondary, #64748b)' }}>
                  Lançamento de aquisições e suprimentos alimentares
                </p>
              </div>
              <button type="button" onClick={() => setIsModalOpen(false)} style={styles.btnClose}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={styles.label}>Produto</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => handleProductChange(e.target.value)}
                  style={styles.input}
                  required
                >
                  <option value="">Selecione um alimento...</option>
                  {products.filter(p => p.ativo).map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nome} ({p.unidade}) — Custo Ref: {formatCurrency(p.custo_unitario)}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={styles.label}>
                    Quantidade {selectedProduct ? `(${selectedProduct.unidade})` : ''}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0.00"
                    value={quantidade}
                    onChange={(e) => handleQuantidadeChange(e.target.value)}
                    style={styles.input}
                    required
                  />
                </div>

                <div>
                  <label style={styles.label}>Data</label>
                  <input
                    type="date"
                    value={dataEntrada}
                    onChange={(e) => setDataEntrada(e.target.value)}
                    style={styles.input}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={styles.label}>Total (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={valorTotal}
                    onChange={(e) => setValorTotal(e.target.value)}
                    style={styles.input}
                    required
                  />
                </div>

                <div>
                  <label style={styles.label}>Observação</label>
                  <input
                    type="text"
                    placeholder="Ex: Fornecedor, NF..."
                    value={observacao}
                    onChange={(e) => setObservacao(e.target.value)}
                    style={styles.input}
                  />
                </div>
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
                  style={{ ...styles.btnPrimary, backgroundColor: '#059669' }}
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
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem'
  },
  statCard: {
    backgroundColor: 'var(--bg-card, #ffffff)',
    borderRadius: '12px',
    border: '1px solid var(--border-color, #e2e8f0)',
    padding: '1rem 1.15rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
  },
  statLabel: {
    fontSize: '0.72rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    color: 'var(--text-secondary, #64748b)'
  },
  statValue: {
    margin: '0.35rem 0 0.15rem 0',
    fontSize: '1.4rem',
    fontWeight: 800,
    color: 'var(--text-primary, #0f172a)'
  },
  statSub: {
    margin: 0,
    fontSize: '0.72rem',
    color: 'var(--text-secondary, #94a3b8)'
  },
  chartCard: {
    backgroundColor: 'var(--bg-card, #ffffff)',
    borderRadius: '14px',
    border: '1px solid var(--border-color, #e2e8f0)',
    padding: '1.15rem 1.25rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
  },
  chartHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '0.5rem'
  },
  chartTitle: {
    margin: 0,
    fontSize: '0.95rem',
    fontWeight: 700,
    color: 'var(--text-primary, #0f172a)'
  },
  chartSub: {
    margin: '0.2rem 0 0 0',
    fontSize: '0.75rem',
    color: 'var(--text-secondary, #64748b)'
  },
  toggleGroup: {
    display: 'flex',
    backgroundColor: 'var(--bg-surface, #f8fafc)',
    padding: '0.2rem',
    borderRadius: '8px',
    border: '1px solid var(--border-color, #e2e8f0)'
  },
  toggleBtn: {
    border: 'none',
    padding: '0.3rem 0.55rem',
    borderRadius: '6px',
    fontSize: '0.75rem',
    fontWeight: 700,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  emptyNotice: {
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.85rem',
    color: 'var(--text-secondary, #94a3b8)'
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
    minWidth: '240px'
  },
  searchInput: {
    background: 'none',
    border: 'none',
    outline: 'none',
    width: '100%',
    color: 'var(--text-primary, #0f172a)',
    fontSize: '0.825rem'
  },
  select: {
    padding: '0.45rem 0.75rem',
    borderRadius: '8px',
    border: '1px solid var(--border-color, #cbd5e1)',
    backgroundColor: 'var(--bg-surface, #f8fafc)',
    color: 'var(--text-primary, #0f172a)',
    fontSize: '0.825rem',
    fontWeight: 600,
    outline: 'none',
    cursor: 'pointer'
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
    maxWidth: '560px',
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
