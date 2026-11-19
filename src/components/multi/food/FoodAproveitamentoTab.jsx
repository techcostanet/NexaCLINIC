import React, { useState, useEffect, useMemo } from 'react';
import {
  TrendingUp, PackagePlus, Trash2, PieChart as PieIcon, Filter,
  BarChart2, LineChart as LineChartIcon, AreaChart as AreaChartIcon,
  CheckCircle2, AlertTriangle, ArrowUpRight
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, LineChart, Line,
  AreaChart, Area, XAxis, YAxis, LabelList, Tooltip, Legend
} from 'recharts';
import {
  getFoodEntries, getFoodWaste, getFoodProducts, parseLocalDate,
  formatCurrency, formatNumber, formatQuantity
} from '../../../services/firebase/foodWasteService';

export default function FoodAproveitamentoTab() {
  const now = new Date();
  const currentMonthStr = (now.getMonth() + 1).toString().padStart(2, '0');
  const currentYearStr = now.getFullYear().toString();

  // Filtros
  const [selectedMonth, setSelectedMonth] = useState(currentMonthStr);
  const [selectedYear, setSelectedYear] = useState(currentYearStr);
  const [chartType, setChartType] = useState('bar'); // 'bar' | 'line' | 'area'

  // Dados
  const [allEntradas, setAllEntradas] = useState([]);
  const [allSobras, setAllSobras] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [entries, waste, prods] = await Promise.all([
        getFoodEntries(),
        getFoodWaste(),
        getFoodProducts()
      ]);
      setAllEntradas(entries || []);
      setAllSobras(waste || []);
      setAllProducts(prods || []);
    } catch (e) {
      console.error('Erro ao buscar dados de aproveitamento:', e);
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

  // Filtrar Entradas e Sobras pelo Mês e Ano
  const filteredData = useMemo(() => {
    const fEntradas = allEntradas.filter((e) => {
      const d = parseLocalDate(e.data_entrada || e.criado_em);
      const mStr = (d.getMonth() + 1).toString().padStart(2, '0');
      const yStr = d.getFullYear().toString();
      const monthMatch = selectedMonth === 'ALL' || mStr === selectedMonth;
      const yearMatch = selectedYear === 'ALL' || yStr === selectedYear;
      return monthMatch && yearMatch;
    });

    const fSobras = allSobras.filter((s) => {
      const d = parseLocalDate(s.data_sobra || s.criado_em);
      const mStr = (d.getMonth() + 1).toString().padStart(2, '0');
      const yStr = d.getFullYear().toString();
      const monthMatch = selectedMonth === 'ALL' || mStr === selectedMonth;
      const yearMatch = selectedYear === 'ALL' || yStr === selectedYear;
      return monthMatch && yearMatch;
    });

    return { fEntradas, fSobras };
  }, [allEntradas, allSobras, selectedMonth, selectedYear]);

  // Cálculos de Estatísticas & Balanço Geral
  const stats = useMemo(() => {
    let totalEntradasMes = 0;
    let totalSobrasMes = 0;

    filteredData.fEntradas.forEach((e) => {
      totalEntradasMes += Number(e.valor_total) || 0;
    });

    filteredData.fSobras.forEach((s) => {
      totalSobrasMes += Number(s.valor_perda) || 0;
    });

    const consumoReal = Math.max(0, totalEntradasMes - totalSobrasMes);
    const aproveitamentoMedio = totalEntradasMes > 0
      ? Number(((consumoReal / totalEntradasMes) * 100).toFixed(1))
      : 100;

    return {
      totalEntradasMes,
      totalSobrasMes,
      consumoReal,
      aproveitamentoMedio: Math.min(100, Math.max(0, aproveitamentoMedio))
    };
  }, [filteredData]);

  // Tabela Analítica por Produto
  const detailTable = useMemo(() => {
    const productStatsMap = {};

    allProducts.forEach((p) => {
      productStatsMap[p.id] = {
        produtoId: p.id,
        nome: p.nome,
        unidade: p.unidade,
        custo_unitario: p.custo_unitario,
        entradaQtd: 0,
        entradaValor: 0,
        sobraQtd: 0,
        sobraValor: 0
      };
    });

    filteredData.fEntradas.forEach((e) => {
      const pId = e.produto_id;
      if (!productStatsMap[pId]) {
        productStatsMap[pId] = {
          produtoId: pId,
          nome: e.produto?.nome || 'Insumo',
          unidade: e.produto?.unidade || 'un',
          custo_unitario: e.produto?.custo_unitario || 0,
          entradaQtd: 0,
          entradaValor: 0,
          sobraQtd: 0,
          sobraValor: 0
        };
      }
      productStatsMap[pId].entradaQtd += Number(e.quantidade) || 0;
      productStatsMap[pId].entradaValor += Number(e.valor_total) || 0;
    });

    filteredData.fSobras.forEach((s) => {
      const pId = s.produto_id;
      if (!productStatsMap[pId]) {
        productStatsMap[pId] = {
          produtoId: pId,
          nome: s.produto?.nome || 'Insumo',
          unidade: s.produto?.unidade || 'un',
          custo_unitario: s.produto?.custo_unitario || 0,
          entradaQtd: 0,
          entradaValor: 0,
          sobraQtd: 0,
          sobraValor: 0
        };
      }
      productStatsMap[pId].sobraQtd += Number(s.quantidade) || 0;
      productStatsMap[pId].sobraValor += Number(s.valor_perda) || 0;
    });

    return Object.values(productStatsMap)
      .filter((item) => item.entradaQtd > 0 || item.sobraQtd > 0)
      .map((item) => {
        const cValor = Math.max(0, item.entradaValor - item.sobraValor);
        const cQtd = Math.max(0, item.entradaQtd - item.sobraQtd);
        const pct = item.entradaValor > 0
          ? Number(((cValor / item.entradaValor) * 100).toFixed(1))
          : (item.sobraValor > 0 ? 0 : 100);

        return {
          ...item,
          entradaQtd: Number(item.entradaQtd.toFixed(2)),
          entradaValor: Number(item.entradaValor.toFixed(2)),
          sobraQtd: Number(item.sobraQtd.toFixed(2)),
          sobraValor: Number(item.sobraValor.toFixed(2)),
          consumoQtd: Number(cQtd.toFixed(2)),
          consumoValor: Number(cValor.toFixed(2)),
          aproveitamentoPct: Math.min(100, Math.max(0, pct))
        };
      })
      .sort((a, b) => b.entradaValor - a.entradaValor);
  }, [allProducts, filteredData]);

  // Gráfico Agrupado (Entradas vs Sobras)
  const groupedChartData = useMemo(() => {
    if (selectedMonth === 'ALL') {
      const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      const monthlyData = monthNames.map((name) => ({
        semana: name,
        entrada: 0,
        sobra: 0
      }));

      filteredData.fEntradas.forEach((e) => {
        const d = parseLocalDate(e.data_entrada || e.criado_em);
        const mIdx = d.getMonth();
        if (mIdx >= 0 && mIdx < 12) {
          monthlyData[mIdx].entrada += Number(e.valor_total) || 0;
        }
      });

      filteredData.fSobras.forEach((s) => {
        const d = parseLocalDate(s.data_sobra || s.criado_em);
        const mIdx = d.getMonth();
        if (mIdx >= 0 && mIdx < 12) {
          monthlyData[mIdx].sobra += Number(s.valor_perda) || 0;
        }
      });

      return monthlyData.map((item) => ({
        semana: item.semana,
        entrada: Number(item.entrada.toFixed(2)),
        sobra: Number(item.sobra.toFixed(2))
      }));
    }

    const timelineWeeks = {
      'Semana 1': { semana: 'Semana 1', entrada: 0, sobra: 0 },
      'Semana 2': { semana: 'Semana 2', entrada: 0, sobra: 0 },
      'Semana 3': { semana: 'Semana 3', entrada: 0, sobra: 0 },
      'Semana 4': { semana: 'Semana 4', entrada: 0, sobra: 0 },
      'Semana 5': { semana: 'Semana 5', entrada: 0, sobra: 0 }
    };

    filteredData.fEntradas.forEach((e) => {
      const d = parseLocalDate(e.data_entrada || e.criado_em);
      const dayOfMonth = d.getDate();
      const weekIdx = Math.min(5, Math.ceil(dayOfMonth / 7));
      const label = `Semana ${weekIdx}`;
      if (timelineWeeks[label]) timelineWeeks[label].entrada += Number(e.valor_total) || 0;
    });

    filteredData.fSobras.forEach((s) => {
      const d = parseLocalDate(s.data_sobra || s.criado_em);
      const dayOfMonth = d.getDate();
      const weekIdx = Math.min(5, Math.ceil(dayOfMonth / 7));
      const label = `Semana ${weekIdx}`;
      if (timelineWeeks[label]) timelineWeeks[label].sobra += Number(s.valor_perda) || 0;
    });

    return Object.values(timelineWeeks)
      .filter((item, idx) => idx < 4 || item.entrada > 0 || item.sobra > 0)
      .map((item) => ({
        semana: item.semana,
        entrada: Number(item.entrada.toFixed(2)),
        sobra: Number(item.sobra.toFixed(2))
      }));
  }, [selectedMonth, filteredData]);

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

  const monthLabel = selectedMonth === 'ALL' ? 'Todos os Meses' : meses.find((m) => m.value === selectedMonth)?.label;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* BARRA DE FILTRO POR MÊS E ANO */}
      <div style={styles.filterCard}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={styles.filterIconBox}>
            <Filter size={18} color="#059669" />
          </div>
          <div>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary, #0f172a)' }}>
              Eficiência e Aproveitamento
            </span>
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary, #64748b)' }}>
              Balanço consolidado de compras vs desperdício para: <strong>{monthLabel} / {selectedYear === 'ALL' ? 'Todos' : selectedYear}</strong>
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
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
        </div>
      </div>

      {/* 4 CARDS ESTATÍSTICOS */}
      <div style={styles.statsGrid}>
        <div style={{ ...styles.statCard, borderLeft: '4px solid #059669' }}>
          <span style={styles.statLabel}>Entradas</span>
          <h3 style={styles.statValue}>{formatCurrency(stats.totalEntradasMes)}</h3>
          <p style={styles.statSub}>Total de suprimentos adquiridos</p>
        </div>

        <div style={{ ...styles.statCard, borderLeft: '4px solid #dc2626' }}>
          <span style={styles.statLabel}>Sobras</span>
          <h3 style={styles.statValue}>{formatCurrency(stats.totalSobrasMes)}</h3>
          <p style={styles.statSub}>Total financeiro descartado</p>
        </div>

        <div style={{ ...styles.statCard, borderLeft: '4px solid #0891b2' }}>
          <span style={styles.statLabel}>Consumo</span>
          <h3 style={styles.statValue}>{formatCurrency(stats.consumoReal)}</h3>
          <p style={styles.statSub}>Valor real consumido</p>
        </div>

        <div style={{ ...styles.statCard, borderLeft: '4px solid #10b981' }}>
          <span style={styles.statLabel}>Aproveitamento</span>
          <h3 style={{ ...styles.statValue, color: stats.aproveitamentoMedio >= 90 ? '#059669' : stats.aproveitamentoMedio >= 75 ? '#d97706' : '#dc2626' }}>
            {stats.aproveitamentoMedio}%
          </h3>
          <p style={styles.statSub}>Eficiência de consumo</p>
        </div>
      </div>

      {/* GRÁFICO COMPARATIVO ENTRADAS X SOBRAS */}
      <div style={styles.chartCard}>
        <div style={styles.chartHeader}>
          <div>
            <h3 style={styles.chartTitle}>Comparativo: Entradas x Sobras</h3>
            <p style={styles.chartSub}>
              {selectedMonth === 'ALL'
                ? 'Balanço mensal de compras e perdas no ano'
                : 'Balanço semanal do período selecionado'}
            </p>
          </div>

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

        <div style={{ height: '280px', width: '100%', marginTop: '0.75rem' }}>
          {loading ? (
            <div style={styles.emptyNotice}>Carregando comparativo...</div>
          ) : groupedChartData.length === 0 ? (
            <div style={styles.emptyNotice}>Nenhum registro para o período selecionado.</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'bar' ? (
                <BarChart data={groupedChartData} margin={{ top: 25, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="semana" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={(val) => `R$${val}`} />
                  <Tooltip formatter={(val) => formatCurrency(val)} />
                  <Legend />
                  <Bar dataKey="entrada" name="Entradas (R$)" fill="#059669" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="sobra" name="Sobras (R$)" fill="#dc2626" radius={[6, 6, 0, 0]} />
                </BarChart>
              ) : chartType === 'line' ? (
                <LineChart data={groupedChartData} margin={{ top: 25, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="semana" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={(val) => `R$${val}`} />
                  <Tooltip formatter={(val) => formatCurrency(val)} />
                  <Legend />
                  <Line type="monotone" dataKey="entrada" name="Entradas (R$)" stroke="#059669" strokeWidth={3} dot={{ r: 4, fill: '#059669' }} />
                  <Line type="monotone" dataKey="sobra" name="Sobras (R$)" stroke="#dc2626" strokeWidth={3} dot={{ r: 4, fill: '#dc2626' }} />
                </LineChart>
              ) : (
                <AreaChart data={groupedChartData} margin={{ top: 25, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="semana" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={(val) => `R$${val}`} />
                  <Tooltip formatter={(val) => formatCurrency(val)} />
                  <Legend />
                  <Area type="monotone" dataKey="entrada" name="Entradas (R$)" stroke="#059669" fill="#059669" fillOpacity={0.25} />
                  <Area type="monotone" dataKey="sobra" name="Sobras (R$)" stroke="#dc2626" fill="#dc2626" fillOpacity={0.25} />
                </AreaChart>
              )}
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* TABELA DE APROVEITAMENTO POR PRODUTO (RÓTULOS 1 PALAVRA) */}
      <div style={styles.tableCard}>
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-color, #e2e8f0)' }}>
          <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary, #0f172a)' }}>
            Aproveitamento por Alimento
          </h3>
          <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.75rem', color: 'var(--text-secondary, #64748b)' }}>
            Detalhamento quantitativo e financeiro de consumo vs descarte
          </p>
        </div>

        <table style={styles.table}>
          <thead>
            <tr style={styles.trHead}>
              <th style={styles.th}>Produto</th>
              <th style={styles.th}>Entradas</th>
              <th style={styles.th}>Sobras</th>
              <th style={styles.th}>Consumo</th>
              <th style={styles.th}>Aproveitamento</th>
              <th style={{ ...styles.th, textAlign: 'right' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ ...styles.td, textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>
                  Carregando aproveitamento...
                </td>
              </tr>
            ) : detailTable.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ ...styles.td, textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>
                  Nenhum dado encontrado para o período.
                </td>
              </tr>
            ) : (
              detailTable.map((item) => {
                const status = item.aproveitamentoPct >= 90 ? 'Excelente' : item.aproveitamentoPct >= 75 ? 'Bom' : 'Alerta';
                const statusColor = item.aproveitamentoPct >= 90 ? '#059669' : item.aproveitamentoPct >= 75 ? '#d97706' : '#dc2626';
                const statusBg = item.aproveitamentoPct >= 90 ? '#ecfdf5' : item.aproveitamentoPct >= 75 ? '#fffbeb' : '#fef2f2';

                return (
                  <tr key={item.produtoId} style={styles.trBody}>
                    <td style={{ ...styles.td, fontWeight: 700, color: 'var(--text-primary, #0f172a)' }}>
                      {item.nome}
                      <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-secondary, #64748b)', fontWeight: 400 }}>
                        {item.unidade} • Custo: {formatCurrency(item.custo_unitario)}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary, #0f172a)' }}>
                        {formatCurrency(item.entradaValor)}
                      </span>
                      <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-secondary, #64748b)' }}>
                        {formatQuantity(item.entradaQtd, item.unidade)}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <span style={{ fontWeight: 600, color: '#dc2626' }}>
                        {formatCurrency(item.sobraValor)}
                      </span>
                      <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-secondary, #64748b)' }}>
                        {formatQuantity(item.sobraQtd, item.unidade)}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <span style={{ fontWeight: 600, color: '#059669' }}>
                        {formatCurrency(item.consumoValor)}
                      </span>
                      <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-secondary, #64748b)' }}>
                        {formatQuantity(item.consumoQtd, item.unidade)}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={styles.progressBarBg}>
                          <div style={{
                            ...styles.progressBarFill,
                            width: `${item.aproveitamentoPct}%`,
                            backgroundColor: statusColor
                          }} />
                        </div>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: statusColor, minWidth: '45px' }}>
                          {item.aproveitamentoPct}%
                        </span>
                      </div>
                    </td>
                    <td style={{ ...styles.td, textAlign: 'right' }}>
                      <span style={{
                        ...styles.statusBadge,
                        backgroundColor: statusBg,
                        color: statusColor,
                        border: `1px solid ${statusColor}40`
                      }}>
                        {status}
                      </span>
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
}

const styles = {
  filterCard: {
    backgroundColor: 'var(--bg-card, #ffffff)',
    borderRadius: '12px',
    border: '1px solid var(--border-color, #e2e8f0)',
    padding: '0.85rem 1.25rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '0.75rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
  },
  filterIconBox: {
    padding: '0.45rem',
    borderRadius: '8px',
    backgroundColor: '#ecfdf5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
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
  progressBarBg: {
    flex: 1,
    height: '6px',
    borderRadius: '999px',
    backgroundColor: 'var(--border-color, #e2e8f0)',
    overflow: 'hidden',
    minWidth: '60px',
    maxWidth: '120px'
  },
  progressBarFill: {
    height: '100%',
    borderRadius: '999px',
    transition: 'width 0.3s ease'
  },
  statusBadge: {
    display: 'inline-block',
    padding: '0.2rem 0.6rem',
    borderRadius: '6px',
    fontSize: '0.72rem',
    fontWeight: 700
  }
};
