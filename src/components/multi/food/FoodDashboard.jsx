import React, { useState, useEffect, useMemo } from 'react';
import {
  TrendingDown, Calendar, AlertTriangle, PackageCheck,
  BarChart2, LineChart as LineChartIcon, AreaChart as AreaChartIcon,
  PieChart as PieChartIcon, Filter
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, LineChart, Line,
  AreaChart, Area, XAxis, YAxis, LabelList, PieChart, Pie, Cell, Tooltip
} from 'recharts';
import {
  getFoodWaste, getFoodProducts, parseLocalDate,
  formatCurrency, formatNumber, formatQuantity
} from '../../../services/firebase/foodWasteService';

export default function FoodDashboard() {
  const now = new Date();
  const currentMonthStr = (now.getMonth() + 1).toString().padStart(2, '0');
  const currentYearStr = now.getFullYear().toString();

  // Filtros de Período
  const [selectedMonth, setSelectedMonth] = useState(currentMonthStr);
  const [selectedYear, setSelectedYear] = useState(currentYearStr);

  const [rawSobras, setRawSobras] = useState([]);
  const [productsList, setProductsList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filtros do Gráfico 1: Histórico
  const [metric, setMetric] = useState('valor'); // 'valor' | 'quantidade'
  const [period, setPeriod] = useState('dia'); // 'dia' | 'semana'
  const [chartTypeMain, setChartTypeMain] = useState('bar'); // 'bar' | 'line' | 'area'

  // Filtros do Gráfico 2: Top Produtos
  const [chartTypeTop, setChartTypeTop] = useState('donut'); // 'donut' | 'pie' | 'bar'

  const fetchData = async () => {
    setLoading(true);
    try {
      const [waste, prods] = await Promise.all([
        getFoodWaste(),
        getFoodProducts()
      ]);
      setRawSobras(waste || []);
      setProductsList(prods || []);
    } catch (e) {
      console.error('Erro ao buscar dados do dashboard de alimentos:', e);
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

  // Sobras Filtradas por Mês e Ano
  const filteredSobras = useMemo(() => {
    return rawSobras.filter((s) => {
      const d = parseLocalDate(s.data_sobra || s.criado_em);
      const mStr = (d.getMonth() + 1).toString().padStart(2, '0');
      const yStr = d.getFullYear().toString();

      const monthMatch = selectedMonth === 'ALL' || mStr === selectedMonth;
      const yearMatch = selectedYear === 'ALL' || yStr === selectedYear;
      return monthMatch && yearMatch;
    });
  }, [rawSobras, selectedMonth, selectedYear]);

  // Estatísticas dos Cards
  const stats = useMemo(() => {
    const todayLocal = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0).getTime();
    const sevenDaysAgo = todayLocal - 7 * 24 * 60 * 60 * 1000;

    let desperdicioHoje = 0;
    let desperdicioSemana = 0;
    let desperdicioMes = 0;

    filteredSobras.forEach((s) => {
      const val = Number(s.valor_perda) || 0;
      desperdicioMes += val;

      const itemTime = parseLocalDate(s.data_sobra || s.criado_em).getTime();
      if (itemTime === todayLocal) {
        desperdicioHoje += val;
      }
      if (itemTime >= sevenDaysAgo) {
        desperdicioSemana += val;
      }
    });

    return {
      desperdicioHoje,
      desperdicioSemana,
      desperdicioMes,
      produtosAtivos: productsList.filter(p => p.ativo).length
    };
  }, [filteredSobras, productsList]);

  // Ranking Top Produtos por Desperdício
  const topProducts = useMemo(() => {
    const productLossMap = {};

    filteredSobras.forEach((s) => {
      const prod = productsList.find((p) => p.id === s.produto_id) || s.produto || { nome: 'Outros', unidade: 'un' };
      const pName = prod.nome || 'Outros';
      const pUnit = prod.unidade || 'un';

      if (!productLossMap[pName]) {
        productLossMap[pName] = { nome: pName, valor: 0, qtd: 0, unidade: pUnit };
      }
      productLossMap[pName].valor += Number(s.valor_perda) || 0;
      productLossMap[pName].qtd += Number(s.quantidade) || 0;
    });

    const totalMes = stats.desperdicioMes;

    return Object.values(productLossMap)
      .map((item) => ({
        nome: item.nome,
        valor: Number(item.valor.toFixed(2)),
        quantidade: Number(item.qtd.toFixed(2)),
        unidade: item.unidade,
        percentual: totalMes > 0 ? Number(((item.valor / totalMes) * 100).toFixed(1)) : 0
      }))
      .sort((a, b) => b.valor - a.valor)
      .slice(0, 6);
  }, [filteredSobras, productsList, stats.desperdicioMes]);

  // Dados do Gráfico Principal
  const mainChartData = useMemo(() => {
    if (!filteredSobras.length && selectedMonth !== 'ALL') return [];

    if (selectedMonth === 'ALL') {
      const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      const monthlyGroup = monthNames.map((name) => ({ name, valor: 0 }));

      filteredSobras.forEach((s) => {
        const d = parseLocalDate(s.data_sobra || s.criado_em);
        const mIdx = d.getMonth();
        const val = metric === 'valor' ? (Number(s.valor_perda) || 0) : (Number(s.quantidade) || 0);
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
    filteredSobras.forEach((s) => {
      let key = '';
      let sortKey = 0;
      const d = parseLocalDate(s.data_sobra || s.criado_em);

      if (period === 'dia') {
        key = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`;
        sortKey = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
      } else {
        const dayOfMonth = d.getDate();
        const weekNum = Math.ceil(dayOfMonth / 7);
        key = `Sem. ${weekNum}`;
        sortKey = weekNum;
      }

      const val = metric === 'valor' ? (Number(s.valor_perda) || 0) : (Number(s.quantidade) || 0);
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
  }, [filteredSobras, selectedMonth, period, metric]);

  const DONUT_COLORS = ['#dc2626', '#ea580c', '#f59e0b', '#10b981', '#06b6d4', '#6366f1'];

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
              Período de Análise
            </span>
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary, #64748b)' }}>
              Indicadores filtrados para: <strong>{monthLabel} / {selectedYear === 'ALL' ? 'Todos' : selectedYear}</strong>
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
        <div style={{ ...styles.statCard, borderLeft: '4px solid #dc2626' }}>
          <div style={styles.statContent}>
            <div>
              <span style={styles.statLabel}>Hoje</span>
              <h3 style={styles.statValue}>{formatCurrency(stats.desperdicioHoje)}</h3>
              <p style={styles.statSub}>Desperdício do dia</p>
            </div>
            <div style={{ ...styles.statIconBadge, backgroundColor: '#fef2f2', color: '#dc2626' }}>
              <TrendingDown size={22} />
            </div>
          </div>
        </div>

        <div style={{ ...styles.statCard, borderLeft: '4px solid #ea580c' }}>
          <div style={styles.statContent}>
            <div>
              <span style={styles.statLabel}>Semana</span>
              <h3 style={styles.statValue}>{formatCurrency(stats.desperdicioSemana)}</h3>
              <p style={styles.statSub}>Últimos 7 dias</p>
            </div>
            <div style={{ ...styles.statIconBadge, backgroundColor: '#fff7ed', color: '#ea580c' }}>
              <Calendar size={22} />
            </div>
          </div>
        </div>

        <div style={{ ...styles.statCard, borderLeft: '4px solid #d97706' }}>
          <div style={styles.statContent}>
            <div>
              <span style={styles.statLabel}>Período</span>
              <h3 style={styles.statValue}>{formatCurrency(stats.desperdicioMes)}</h3>
              <p style={styles.statSub}>{monthLabel} / {selectedYear}</p>
            </div>
            <div style={{ ...styles.statIconBadge, backgroundColor: '#fffbeb', color: '#d97706' }}>
              <AlertTriangle size={22} />
            </div>
          </div>
        </div>

        <div style={{ ...styles.statCard, borderLeft: '4px solid #059669' }}>
          <div style={styles.statContent}>
            <div>
              <span style={styles.statLabel}>Ativos</span>
              <h3 style={styles.statValue}>{stats.produtosAtivos}</h3>
              <p style={styles.statSub}>Alimentos cadastrados</p>
            </div>
            <div style={{ ...styles.statIconBadge, backgroundColor: '#ecfdf5', color: '#059669' }}>
              <PackageCheck size={22} />
            </div>
          </div>
        </div>
      </div>

      {/* GRÁFICOS: HISTÓRICO E TOP PRODUTOS */}
      <div style={styles.chartsGrid}>
        {/* GRÁFICO 1: HISTÓRICO DE SOBRAS */}
        <div style={styles.chartCard}>
          <div style={styles.chartHeader}>
            <div>
              <h3 style={styles.chartTitle}>Histórico de Desperdício</h3>
              <p style={styles.chartSub}>
                {selectedMonth === 'ALL'
                  ? 'Evolução mensal consolidada de Janeiro a Dezembro'
                  : `Evolução de sobras por ${period === 'dia' ? 'dia' : 'semana'}`}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', flexWrap: 'wrap' }}>
              {/* Seletor Métrica R$ / Qtd */}
              <div style={styles.toggleGroup}>
                <button
                  type="button"
                  onClick={() => setMetric('valor')}
                  style={{
                    ...styles.toggleBtn,
                    backgroundColor: metric === 'valor' ? '#ea580c' : 'transparent',
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
                    backgroundColor: metric === 'quantidade' ? '#ea580c' : 'transparent',
                    color: metric === 'quantidade' ? '#ffffff' : 'var(--text-secondary, #64748b)'
                  }}
                >
                  Qtd
                </button>
              </div>

              {/* Seletor Agrupamento Dia / Semana */}
              {selectedMonth !== 'ALL' && (
                <div style={styles.toggleGroup}>
                  <button
                    type="button"
                    onClick={() => setPeriod('dia')}
                    style={{
                      ...styles.toggleBtn,
                      backgroundColor: period === 'dia' ? '#ea580c' : 'transparent',
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
                      backgroundColor: period === 'semana' ? '#ea580c' : 'transparent',
                      color: period === 'semana' ? '#ffffff' : 'var(--text-secondary, #64748b)'
                    }}
                  >
                    Semana
                  </button>
                </div>
              )}

              {/* Tipo de Gráfico */}
              <div style={styles.toggleGroup}>
                <button
                  type="button"
                  onClick={() => setChartTypeMain('bar')}
                  title="Barras"
                  style={{
                    ...styles.toggleBtn,
                    backgroundColor: chartTypeMain === 'bar' ? '#ea580c' : 'transparent',
                    color: chartTypeMain === 'bar' ? '#ffffff' : 'var(--text-secondary, #64748b)'
                  }}
                >
                  <BarChart2 size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => setChartTypeMain('line')}
                  title="Linha"
                  style={{
                    ...styles.toggleBtn,
                    backgroundColor: chartTypeMain === 'line' ? '#ea580c' : 'transparent',
                    color: chartTypeMain === 'line' ? '#ffffff' : 'var(--text-secondary, #64748b)'
                  }}
                >
                  <LineChartIcon size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => setChartTypeMain('area')}
                  title="Área"
                  style={{
                    ...styles.toggleBtn,
                    backgroundColor: chartTypeMain === 'area' ? '#ea580c' : 'transparent',
                    color: chartTypeMain === 'area' ? '#ffffff' : 'var(--text-secondary, #64748b)'
                  }}
                >
                  <AreaChartIcon size={14} />
                </button>
              </div>
            </div>
          </div>

          <div style={{ height: '300px', width: '100%', marginTop: '0.75rem' }}>
            {loading ? (
              <div style={styles.emptyNotice}>Carregando indicadores...</div>
            ) : mainChartData.length === 0 ? (
              <div style={styles.emptyNotice}>Nenhum registro no período selecionado.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                {chartTypeMain === 'bar' ? (
                  <BarChart data={mainChartData} margin={{ top: 25, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={(val) => metric === 'valor' ? `R$${val}` : val} />
                    <Tooltip formatter={(val) => [metric === 'valor' ? formatCurrency(val) : formatNumber(val), metric === 'valor' ? 'Perda' : 'Quantidade']} />
                    <Bar dataKey="valor" fill="#ea580c" radius={[6, 6, 0, 0]}>
                      <LabelList
                        dataKey="valor"
                        position="top"
                        fill="#ea580c"
                        fontSize={10}
                        fontWeight="bold"
                        formatter={(val) => metric === 'valor' ? formatCurrency(val) : formatNumber(val)}
                      />
                    </Bar>
                  </BarChart>
                ) : chartTypeMain === 'line' ? (
                  <LineChart data={mainChartData} margin={{ top: 25, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={(val) => metric === 'valor' ? `R$${val}` : val} />
                    <Tooltip formatter={(val) => [metric === 'valor' ? formatCurrency(val) : formatNumber(val), metric === 'valor' ? 'Perda' : 'Quantidade']} />
                    <Line type="monotone" dataKey="valor" stroke="#ea580c" strokeWidth={3} dot={{ r: 4, fill: '#ea580c' }}>
                      <LabelList
                        dataKey="valor"
                        position="top"
                        fill="#ea580c"
                        fontSize={10}
                        fontWeight="bold"
                        formatter={(val) => metric === 'valor' ? formatCurrency(val) : formatNumber(val)}
                      />
                    </Line>
                  </LineChart>
                ) : (
                  <AreaChart data={mainChartData} margin={{ top: 25, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={(val) => metric === 'valor' ? `R$${val}` : val} />
                    <Tooltip formatter={(val) => [metric === 'valor' ? formatCurrency(val) : formatNumber(val), metric === 'valor' ? 'Perda' : 'Quantidade']} />
                    <Area type="monotone" dataKey="valor" stroke="#ea580c" fill="#ea580c" fillOpacity={0.2} dot={{ r: 4, fill: '#ea580c' }}>
                      <LabelList
                        dataKey="valor"
                        position="top"
                        fill="#ea580c"
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

        {/* GRÁFICO 2: TOP PRODUTOS DESPERDIÇADOS */}
        <div style={styles.chartCard}>
          <div style={styles.chartHeader}>
            <div>
              <h3 style={styles.chartTitle}>Top Alimentos Desperdiçados</h3>
              <p style={styles.chartSub}>Ranking de perdas financeiras no período</p>
            </div>

            <div style={styles.toggleGroup}>
              <button
                type="button"
                onClick={() => setChartTypeTop('donut')}
                title="Donut"
                style={{
                  ...styles.toggleBtn,
                  backgroundColor: chartTypeTop === 'donut' ? '#ea580c' : 'transparent',
                  color: chartTypeTop === 'donut' ? '#ffffff' : 'var(--text-secondary, #64748b)'
                }}
              >
                <PieChartIcon size={14} />
              </button>
              <button
                type="button"
                onClick={() => setChartTypeTop('pie')}
                title="Pizza"
                style={{
                  ...styles.toggleBtn,
                  backgroundColor: chartTypeTop === 'pie' ? '#ea580c' : 'transparent',
                  color: chartTypeTop === 'pie' ? '#ffffff' : 'var(--text-secondary, #64748b)'
                }}
              >
                <PieChartIcon size={14} />
              </button>
              <button
                type="button"
                onClick={() => setChartTypeTop('bar')}
                title="Barras"
                style={{
                  ...styles.toggleBtn,
                  backgroundColor: chartTypeTop === 'bar' ? '#ea580c' : 'transparent',
                  color: chartTypeTop === 'bar' ? '#ffffff' : 'var(--text-secondary, #64748b)'
                }}
              >
                <BarChart2 size={14} />
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: topProducts.length > 0 ? '1fr 1fr' : '1fr', gap: '1rem', marginTop: '0.75rem', alignItems: 'center' }}>
            <div style={{ height: '260px' }}>
              {loading ? (
                <div style={styles.emptyNotice}>Carregando top itens...</div>
              ) : topProducts.length === 0 ? (
                <div style={styles.emptyNotice}>Sem dados de perda no período.</div>
              ) : chartTypeTop === 'bar' ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topProducts} layout="vertical" margin={{ left: -10, right: 20 }}>
                    <XAxis type="number" hide />
                    <YAxis dataKey="nome" type="category" width={90} fontSize={10} stroke="#94a3b8" tickLine={false} />
                    <Tooltip formatter={(val) => [formatCurrency(val), 'Perda']} />
                    <Bar dataKey="valor" fill="#ea580c" radius={[0, 6, 6, 0]}>
                      {topProducts.map((_, idx) => (
                        <Cell key={`top-bar-${idx}`} fill={DONUT_COLORS[idx % DONUT_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip formatter={(val) => [formatCurrency(val), 'Perda']} />
                    <Pie
                      data={topProducts}
                      dataKey="valor"
                      nameKey="nome"
                      cx="50%"
                      cy="50%"
                      innerRadius={chartTypeTop === 'donut' ? 45 : 0}
                      outerRadius={75}
                      paddingAngle={3}
                    >
                      {topProducts.map((_, idx) => (
                        <Cell key={`cell-${idx}`} fill={DONUT_COLORS[idx % DONUT_COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* TABELA DE RANKING AO LADO DO GRÁFICO */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', maxHeight: '260px', overflowY: 'auto' }}>
              {topProducts.map((item, idx) => (
                <div key={idx} style={styles.rankingRow}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', minWidth: 0 }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: DONUT_COLORS[idx % DONUT_COLORS.length], shrink: 0 }} />
                    <div style={{ minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary, #0f172a)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.nome}
                      </p>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary, #64748b)' }}>
                        {formatQuantity(item.quantidade, item.unidade)}
                      </span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', shrink: 0 }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#dc2626' }}>
                      {formatCurrency(item.valor)}
                    </span>
                    <span style={styles.pctBadge}>
                      {item.percentual}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
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
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '1rem'
  },
  statCard: {
    backgroundColor: 'var(--bg-card, #ffffff)',
    borderRadius: '12px',
    border: '1px solid var(--border-color, #e2e8f0)',
    padding: '1rem 1.15rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
  },
  statContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  statLabel: {
    fontSize: '0.72rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    color: 'var(--text-secondary, #64748b)'
  },
  statValue: {
    margin: '0.35rem 0 0.15rem 0',
    fontSize: '1.45rem',
    fontWeight: 800,
    color: 'var(--text-primary, #0f172a)'
  },
  statSub: {
    margin: 0,
    fontSize: '0.72rem',
    color: 'var(--text-secondary, #94a3b8)'
  },
  statIconBadge: {
    width: '42px',
    height: '42px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  chartsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))',
    gap: '1.25rem'
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
  rankingRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.45rem 0.6rem',
    borderRadius: '8px',
    backgroundColor: 'var(--bg-surface, #f8fafc)',
    border: '1px solid var(--border-color, #f1f5f9)'
  },
  pctBadge: {
    display: 'inline-block',
    marginLeft: '0.35rem',
    padding: '0.1rem 0.35rem',
    borderRadius: '4px',
    fontSize: '0.65rem',
    fontWeight: 700,
    backgroundColor: '#fee2e2',
    color: '#991b1b'
  }
};
