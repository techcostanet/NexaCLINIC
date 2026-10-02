import React, { useState, useEffect, useMemo } from 'react';
import { dbService } from '../firebase';
import { useUnit } from '../contexts/UnitContext';
import { 
  BarChart3, Calendar, Filter, CheckCircle, AlertCircle, HelpCircle, 
  ShieldAlert, Printer, FileText, Search, Activity, Target, Layers, 
  Building2, X, ChevronRight, AlertTriangle, CheckCircle2, TrendingUp, 
  TrendingDown, ArrowUpRight, ArrowDownRight, RotateCcw
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, PieChart, Pie, Cell, ReferenceLine, LineChart, Line, Legend 
} from 'recharts';
import AtaPsicologiaModal from './AtaPsicologiaModal';
import SesmtReportsModal from './sesmt/SesmtReportsModal';

// Cores Oficiais da Dashboard Executiva
const STATUS_COLORS = {
  met: '#10b981',
  missed: '#ef4444',
  pending: '#94a3b8'
};

const SECTOR_PALETTE = ['#0284c7', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899', '#06b6d4', '#6366f1', '#14b8a6'];

// Função médica e regulamentar refinada para determinar se Menor é Melhor
export const isLowerBetter = (indicatorId, name) => {
  const term = ((indicatorId || '') + ' ' + (name || '')).toLowerCase();

  // Exceções onde termos de segurança ou adequação representam MAIOR MELHOR
  if (term.includes('sem acidente') || term.includes('sem_acidente') || 
      term.includes('adequado') || term.includes('adequação') ||
      term.includes('sem anemia') || term.includes('confeccionada') ||
      term.includes('satisfacao') || term.includes('satisfação') ||
      term.includes('nps') || term.includes('cobertura') ||
      term.includes('treinamento') || term.includes('conformidade') ||
      term.includes('adesao') || term.includes('adesão')) {
    if (term.includes('não conforme') || term.includes('nao_conforme') || 
        term.includes('não conformidade') || term.includes('nao_conformidade') ||
        term.includes('desvio') || term.includes('reincidencia') || term.includes('reincidência')) {
      return true;
    }
    return false;
  }

  return term.includes('infeccao') || term.includes('infecção') || 
         term.includes('mortalidade') || term.includes('obito') || term.includes('óbito') ||
         term.includes('glosa') || term.includes('custo') ||
         term.includes('evitado') || term.includes('acidente') ||
         term.includes('perfuro') || term.includes('tempo_resolucao') ||
         term.includes('tempo de resolução') || term.includes('vencido') ||
         term.includes('desvio') || term.includes('reincidencia') ||
         term.includes('reincidência') || term.includes('não conforme') ||
         term.includes('nao_conforme') || term.includes('não conformidade') ||
         term.includes('nao_conformidade') || term.includes('turnover') ||
         term.includes('absenteismo') || term.includes('absenteísmo') ||
         term.includes('falencia') || term.includes('falência') ||
         term.includes('perda') || term.includes('internacao') || term.includes('internação') ||
         term.includes('internacoes') || term.includes('internações') ||
         term.includes('hospitalizacao') || term.includes('hospitalização') ||
         term.includes('crise') || term.includes('ansiedade') || term.includes('depressao') ||
         term.includes('depressão') || term.includes('risco') ||
         term.includes('reacao_transfusional') || term.includes('reação transfusional') ||
         term.includes('reacoes_transfusionais') || term.includes('reações transfusionais') ||
         term.includes('anemia grave') || term.includes('hb_grave') ||
         term.includes('pth_alto') || term.includes('paratormonio elevado') || term.includes('pth > 600') ||
         term.includes('potassio_baixo') || term.includes('potassio_alto') ||
         term.includes('potássio sérico baixo') || term.includes('potássio sérico alto') ||
         term.includes('fosforo_baixo') || term.includes('fosforo_alto') ||
         term.includes('fósforo sérico baixo') || term.includes('fósforo sérico alto') ||
         term.includes('baixo_peso') || term.includes('baixo peso') ||
         term.includes('obesidade') ||
         term.includes('taxa_uso_cdl') || term.includes('taxa_uso_cateter_longo');
};

// Componente de Mini Sparkline / Gráfico de Tendência
function DynamicChart({ history, target, unit, lowerIsBetter, chartType = 'line' }) {
  if (!history || history.length === 0) {
    return <div style={styles.noHistory}>Sem coletas registradas</div>;
  }

  const sorted = [...history].sort((a, b) => a.period.localeCompare(b.period));
  const values = sorted.map(d => d.value);
  const minVal = Math.min(...values, target) * 0.9;
  const maxVal = Math.max(...values, target) * 1.1;
  const range = maxVal - minVal || 1;

  if (chartType === 'table') {
    return (
      <div style={styles.miniTableContainer}>
        <table style={styles.miniTable}>
          <thead>
            <tr style={styles.miniTableHead}>
              <th style={styles.miniTh}>Mês</th>
              <th style={styles.miniTh}>Valor</th>
              <th style={styles.miniTh}>Meta</th>
              <th style={styles.miniTh}>Status</th>
            </tr>
          </thead>
          <tbody>
            {sorted.slice().reverse().map((d, i) => {
              const isTargetMet = lowerIsBetter ? d.value <= target : d.value >= target;
              const [year, month] = d.period.split('-');
              return (
                <tr key={i} style={styles.miniTr}>
                  <td style={styles.miniTd}>{month}/{year.substring(2)}</td>
                  <td style={{ ...styles.miniTd, fontWeight: '700' }}>{d.value} {unit}</td>
                  <td style={{ ...styles.miniTd, color: '#64748b' }}>{lowerIsBetter ? '≤' : '≥'} {target}</td>
                  <td style={styles.miniTd}>
                    <span style={{
                      padding: '1px 6px',
                      borderRadius: '4px',
                      fontSize: '0.65rem',
                      fontWeight: '700',
                      backgroundColor: isTargetMet ? '#ecfdf5' : '#fef2f2',
                      color: isTargetMet ? '#059669' : '#dc2626'
                    }}>
                      {isTargetMet ? 'OK' : 'FORA'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  const chartData = sorted.map(d => ({
    period: d.period.split('-')[1] + '/' + d.period.split('-')[0].substring(2),
    valor: d.value,
    meta: target
  }));

  return (
    <div style={{ width: '100%', height: '110px' }}>
      <ResponsiveContainer width="100%" height="100%">
        {chartType === 'bar' ? (
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="period" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 9 }} domain={[minVal > 0 ? 0 : 'auto', 'auto']} />
            <Tooltip formatter={(val) => [`${val} ${unit}`, 'Valor']} />
            <ReferenceLine y={target} stroke="#0284c7" strokeDasharray="3 3" />
            <Bar dataKey="valor" fill="#0284c7" radius={[3, 3, 0, 0]} />
          </BarChart>
        ) : (
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="period" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 9 }} domain={[minVal > 0 ? 0 : 'auto', 'auto']} />
            <Tooltip formatter={(val) => [`${val} ${unit}`, 'Valor']} />
            <ReferenceLine y={target} stroke="#0284c7" strokeDasharray="3 3" />
            <Line 
              type={chartType === 'step' ? 'stepAfter' : 'monotone'} 
              dataKey="valor" 
              stroke="#0284c7" 
              strokeWidth={2} 
              dot={{ r: 3, fill: '#0284c7' }} 
            />
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}

export default function Dashboard({ currentUser, onNavigateToUpload }) {
  const { activeUnitId, filterByActiveUnit } = useUnit();

  const [loading, setLoading] = useState(true);
  const [sectors, setSectors] = useState([]);
  const [indicators, setIndicators] = useState([]);
  const [indicatorData, setIndicatorData] = useState([]);
  const [availablePeriods, setAvailablePeriods] = useState([]);

  // Filtros Globais Interativos
  const [selectedPeriod, setSelectedPeriod] = useState('2026-07');
  const [selectedSector, setSelectedSector] = useState('TODOS');
  const [statusFilter, setStatusFilter] = useState('TODOS'); // 'TODOS' | 'MET' | 'MISSED' | 'PENDING'
  const [searchQuery, setSearchQuery] = useState('');
  const [chartTypes, setChartTypes] = useState({});

  // Modais de Apoio e Análise Detalhada
  const [selectedIndicatorDetail, setSelectedIndicatorDetail] = useState(null);
  const [showAtaModal, setShowAtaModal] = useState(false);
  const [showSesmtReportsModal, setShowSesmtReportsModal] = useState(false);

  // Filtragem de Dados pela Unidade Ativa
  const currentIndicatorData = useMemo(() => filterByActiveUnit(indicatorData), [indicatorData, activeUnitId]);

  const currentPeriods = useMemo(() => {
    return [...new Set(currentIndicatorData.map(d => d.period))].sort((a, b) => b.localeCompare(a));
  }, [currentIndicatorData]);

  useEffect(() => {
    if (currentPeriods.length > 0) {
      if (!currentPeriods.includes(selectedPeriod)) {
        setSelectedPeriod(currentPeriods[0]);
      }
    } else {
      setSelectedPeriod('2026-07');
    }
  }, [currentPeriods]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const allSectors = await dbService.getSectors();
      const userSectors = currentUser?.role === 'admin'
        ? allSectors
        : allSectors.filter(s => currentUser?.allowedSectors?.includes(s.id));
      setSectors(userSectors);

      const allIndicators = await dbService.getIndicators();
      setIndicators(allIndicators);

      const data = await dbService.getIndicatorData(
        userSectors.map(s => s.id),
        currentUser?.role === 'admin'
      );
      setIndicatorData(data);

      const periods = [...new Set(data.map(d => d.period))].sort((a, b) => b.localeCompare(a));
      setAvailablePeriods(periods);
      if (periods.length > 0) {
        setSelectedPeriod(periods[0]);
      }
    } catch (err) {
      console.error('Erro ao buscar dados do dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = (metricId, layout) => {
    const style = document.createElement('style');
    style.innerHTML = `
      @page { size: ${layout}; margin: 10mm; }
      @media print {
        body { margin: 0; padding: 0; background: white; }
        body * { visibility: hidden; }
        #metric-card-${metricId}, #metric-card-${metricId} * { visibility: visible; }
        #metric-card-${metricId} {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          margin: 0 !important;
          padding: 20px !important;
          box-shadow: none !important;
          border: none !important;
        }
        .no-print { display: none !important; }
      }
    `;
    document.head.appendChild(style);

    setTimeout(() => {
      window.print();
      document.head.removeChild(style);
    }, 100);
  };

  // Processamento e Cruzamento de Métricas para o Período
  const processedMetrics = useMemo(() => {
    const allowedSectorIds = sectors.map(s => s.id);
    
    // Filtro inicial por setor
    let scopedIndicators = indicators.filter(ind => allowedSectorIds.includes(ind.sectorId));
    if (selectedSector !== 'TODOS') {
      scopedIndicators = scopedIndicators.filter(ind => ind.sectorId === selectedSector);
    }

    return scopedIndicators.map(ind => {
      const currentRecord = currentIndicatorData.find(d => d.indicatorId === ind.id && d.period === selectedPeriod);
      const currentValue = currentRecord ? currentRecord.value : null;
      const history = currentIndicatorData.filter(d => d.indicatorId === ind.id);
      const lowerIsBetter = isLowerBetter(ind.id, ind.name);
      
      let targetMet = null;
      let variancePercent = null;
      if (currentValue !== null) {
        targetMet = lowerIsBetter ? currentValue <= ind.target : currentValue >= ind.target;
        if (ind.target > 0) {
          variancePercent = (((currentValue - ind.target) / ind.target) * 100).toFixed(1);
        }
      }

      const sectorObj = sectors.find(s => s.id === ind.sectorId);

      return {
        ...ind,
        sectorName: sectorObj ? sectorObj.name : ind.sectorId,
        currentValue,
        history,
        targetMet,
        variancePercent,
        lowerIsBetter
      };
    });
  }, [indicators, currentIndicatorData, selectedPeriod, selectedSector, sectors]);

  // Totais Gerais do Escopo Selecionado (Cards Superiores)
  const totalIndicatorsCount = processedMetrics.length;
  const measuredCount = processedMetrics.filter(m => m.currentValue !== null).length;
  const metCount = processedMetrics.filter(m => m.currentValue !== null && m.targetMet === true).length;
  const missedCount = processedMetrics.filter(m => m.currentValue !== null && m.targetMet === false).length;
  const pendingCount = totalIndicatorsCount - measuredCount;
  const complianceRate = measuredCount > 0 ? ((metCount / measuredCount) * 100).toFixed(1) : '0.0';

  // Métricas Filtradas por Busca e Status (Grade de Cards)
  const displayMetrics = useMemo(() => {
    return processedMetrics.filter(m => {
      // Filtro por status clicado no card
      if (statusFilter === 'MET' && (m.currentValue === null || !m.targetMet)) return false;
      if (statusFilter === 'MISSED' && (m.currentValue === null || m.targetMet)) return false;
      if (statusFilter === 'PENDING' && m.currentValue !== null) return false;

      // Filtro por texto de busca
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = (m.name || '').toLowerCase().includes(q);
        const matchesSector = (m.sectorName || '').toLowerCase().includes(q);
        const matchesDesc = (m.description || '').toLowerCase().includes(q);
        return matchesName || matchesSector || matchesDesc;
      }
      return true;
    });
  }, [processedMetrics, statusFilter, searchQuery]);

  // Desempenho Consolidado por Setor (Seção Abaixo)
  const sectorPerformanceData = useMemo(() => {
    return sectors.map(sec => {
      const secIndicators = indicators.filter(ind => ind.sectorId === sec.id);
      let secMet = 0;
      let secMissed = 0;
      let secMeasured = 0;

      secIndicators.forEach(ind => {
        const rec = currentIndicatorData.find(d => d.indicatorId === ind.id && d.period === selectedPeriod);
        if (rec) {
          secMeasured++;
          const lower = isLowerBetter(ind.id, ind.name);
          const isOk = lower ? rec.value <= ind.target : rec.value >= ind.target;
          if (isOk) secMet++;
          else secMissed++;
        }
      });

      const rate = secMeasured > 0 ? Math.round((secMet / secMeasured) * 100) : 0;
      return {
        id: sec.id,
        name: sec.name,
        total: secIndicators.length,
        measured: secMeasured,
        met: secMet,
        missed: secMissed,
        rate
      };
    }).filter(s => s.total > 0);
  }, [sectors, indicators, currentIndicatorData, selectedPeriod]);

  // Top Indicadores Fora da Meta (Alertas Críticos Abaixo)
  const topMissedIndicators = useMemo(() => {
    return processedMetrics
      .filter(m => m.currentValue !== null && !m.targetMet)
      .map(m => {
        const diff = Math.abs(m.currentValue - m.target);
        const diffRate = m.target > 0 ? (diff / m.target) * 100 : 0;
        return {
          ...m,
          diffRate
        };
      })
      .sort((a, b) => b.diffRate - a.diffRate)
      .slice(0, 6);
  }, [processedMetrics]);

  // Dados para Gráficos Executivos Recharts
  const pieStatusData = useMemo(() => [
    { name: 'Metas Atingidas', value: metCount, color: '#10b981' },
    { name: 'Fora da Meta', value: missedCount, color: '#ef4444' },
    { name: 'Sem Coleta', value: pendingCount, color: '#94a3b8' }
  ].filter(d => d.value > 0), [metCount, missedCount, pendingCount]);

  const barSectorComparisonData = useMemo(() => {
    return sectorPerformanceData.map(s => ({
      name: s.name.replace(/Equipe |Módulo /g, ''),
      Conformidade: s.rate,
      Meta: 85
    }));
  }, [sectorPerformanceData]);

  if (loading) {
    return (
      <div style={styles.loadingBox}>
        <Activity size={32} color="#0284c7" className="spinning" />
        <p style={{ marginTop: '0.75rem', color: '#64748b', fontWeight: '600' }}>
          Carregando indicadores hospitalares...
        </p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Barra de Filtros Principais */}
      <div style={styles.filterCard}>
        <div style={styles.filterTopRow}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: '240px' }}>
            <Filter size={18} color="#0284c7" />
            <span style={styles.filterTitle}>Painel de Indicadores:</span>
          </div>

          <div style={styles.periodPresetGroup}>
            {['MES_ATUAL', 'ULTIMOS_30', 'MES_ANTERIOR', 'TODOS'].map(preset => {
              const labelMap = {
                MES_ATUAL: 'Mês Atual',
                ULTIMOS_30: '30 Dias',
                MES_ANTERIOR: 'Mês Anterior',
                TODOS: 'Todos'
              };
              const isActive = (preset === 'MES_ATUAL' && selectedPeriod === (availablePeriods[0] || '2026-07')) ||
                               (preset === 'MES_ANTERIOR' && selectedPeriod === availablePeriods[1]) ||
                               (preset === 'TODOS' && selectedPeriod === 'TODOS');
              return (
                <button
                  key={preset}
                  type="button"
                  onClick={() => {
                    if (preset === 'MES_ATUAL') setSelectedPeriod(availablePeriods[0] || '2026-07');
                    else if (preset === 'MES_ANTERIOR' && availablePeriods[1]) setSelectedPeriod(availablePeriods[1]);
                    else if (preset === 'TODOS') setSelectedPeriod(availablePeriods[availablePeriods.length - 1] || '2026-01');
                    else setSelectedPeriod(availablePeriods[0] || '2026-07');
                  }}
                  style={{
                    ...styles.presetBtn,
                    ...(isActive ? styles.presetBtnActive : {})
                  }}
                >
                  {labelMap[preset]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Linha com Seletores de Setor, Período e Busca */}
        <div style={styles.filterControlsRow}>
          {/* Seletor de Setor */}
          <div style={styles.filterField}>
            <Building2 size={16} color="#64748b" />
            <span style={styles.fieldLabel}>Setor:</span>
            <select
              value={selectedSector}
              onChange={(e) => {
                setSelectedSector(e.target.value);
                setStatusFilter('TODOS');
              }}
              style={styles.fieldSelect}
            >
              <option value="TODOS">Todos os Setores ({sectors.length})</option>
              {sectors.map(sec => (
                <option key={sec.id} value={sec.id}>{sec.name}</option>
              ))}
            </select>
          </div>

          {/* Seletor de Período Específico */}
          <div style={styles.filterField}>
            <Calendar size={16} color="#64748b" />
            <span style={styles.fieldLabel}>Período:</span>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              style={styles.fieldSelect}
            >
              {availablePeriods.length === 0 ? (
                <option value="2026-07">Julho de 2026</option>
              ) : (
                availablePeriods.map(p => {
                  const [year, month] = p.split('-');
                  const monthName = new Date(year, month - 1).toLocaleDateString('pt-BR', { month: 'long' });
                  return (
                    <option key={p} value={p}>
                      {monthName.charAt(0).toUpperCase() + monthName.slice(1)} de {year}
                    </option>
                  );
                })
              )}
            </select>
          </div>

          {/* Busca Rápida por Texto */}
          <div style={{ ...styles.filterField, flex: 1, minWidth: '200px' }}>
            <Search size={16} color="#94a3b8" />
            <input
              type="text"
              placeholder="Buscar indicador por nome ou fórmula..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={styles.searchInput}
            />
          </div>

          {/* Botões Especiais de Setor (Psicologia e SESMT) */}
          {selectedSector === 'psicologia' && (
            <button
              type="button"
              onClick={() => setShowAtaModal(true)}
              style={styles.specialActionBtn}
              title="Gerar Ata Mensal de Psicologia"
            >
              <FileText size={15} />
              <span>Ata Mensal</span>
            </button>
          )}

          {selectedSector === 'sesmt' && (
            <button
              type="button"
              onClick={() => setShowSesmtReportsModal(true)}
              style={{ ...styles.specialActionBtn, backgroundColor: '#f0fdf4', borderColor: '#bbf7d0', color: '#059669' }}
              title="Abrir Central de Relatórios SESMT"
            >
              <FileText size={15} />
              <span>Relatórios</span>
            </button>
          )}

          {(selectedSector !== 'TODOS' || statusFilter !== 'TODOS' || searchQuery) && (
            <button
              type="button"
              onClick={() => {
                setSelectedSector('TODOS');
                setStatusFilter('TODOS');
                setSearchQuery('');
              }}
              style={styles.resetFilterBtn}
              title="Limpar todos os filtros"
            >
              <RotateCcw size={14} />
              <span>Limpar</span>
            </button>
          )}
        </div>
      </div>

      {/* Cards de Métricas Rápidas Executivas (Clicáveis para Filtrar!) */}
      <div style={styles.kpiGrid}>
        {/* Card 1: Conformidade Global / IQH */}
        <div 
          style={{ ...styles.kpiCard, borderLeft: '4px solid #0284c7' }}
          title="Taxa de sucesso ponderada das metas batidas"
        >
          <div style={styles.kpiHeader}>
            <span style={styles.kpiLabel}>Conformidade</span>
            <Target size={18} color="#0284c7" />
          </div>
          <div style={{ ...styles.kpiValue, color: '#0284c7' }}>{complianceRate}%</div>
          <div style={styles.kpiSub}>Meta Institucional: ≥ 85%</div>
        </div>

        {/* Card 2: Total de Indicadores (Clicar reseta para Todos) */}
        <div 
          style={{
            ...styles.kpiCard,
            borderLeft: '4px solid #64748b',
            cursor: 'pointer',
            ...(statusFilter === 'TODOS' ? styles.kpiCardActive : {})
          }}
          onClick={() => setStatusFilter('TODOS')}
          title="Clique para exibir todos os indicadores"
        >
          <div style={styles.kpiHeader}>
            <span style={styles.kpiLabel}>Total Indicadores</span>
            <Layers size={18} color="#64748b" />
          </div>
          <div style={styles.kpiValue}>{totalIndicatorsCount}</div>
          <div style={styles.kpiSub}>Cadastrados no escopo</div>
        </div>

        {/* Card 3: Metas Atingidas (Clicar filtra os Conformes) */}
        <div 
          style={{
            ...styles.kpiCard,
            borderLeft: '4px solid #10b981',
            cursor: 'pointer',
            ...(statusFilter === 'MET' ? styles.kpiCardActive : {})
          }}
          onClick={() => setStatusFilter(prev => prev === 'MET' ? 'TODOS' : 'MET')}
          title="Clique para filtrar apenas os indicadores que atingiram a meta"
        >
          <div style={styles.kpiHeader}>
            <span style={styles.kpiLabel}>Metas Atingidas</span>
            <CheckCircle2 size={18} color="#10b981" />
          </div>
          <div style={{ ...styles.kpiValue, color: '#10b981' }}>{metCount}</div>
          <div style={styles.kpiSub}>
            {statusFilter === 'MET' ? '● Filtro ativo' : 'Clique para filtrar'}
          </div>
        </div>

        {/* Card 4: Fora da Meta / Atenção (Clicar filtra os Desvios) */}
        <div 
          style={{
            ...styles.kpiCard,
            borderLeft: '4px solid #ef4444',
            cursor: 'pointer',
            ...(statusFilter === 'MISSED' ? styles.kpiCardActive : {})
          }}
          onClick={() => setStatusFilter(prev => prev === 'MISSED' ? 'TODOS' : 'MISSED')}
          title="Clique para filtrar os indicadores com desvio"
        >
          <div style={styles.kpiHeader}>
            <span style={styles.kpiLabel}>Fora da Meta</span>
            <AlertCircle size={18} color="#ef4444" />
          </div>
          <div style={{ ...styles.kpiValue, color: '#ef4444' }}>{missedCount}</div>
          <div style={styles.kpiSub}>
            {statusFilter === 'MISSED' ? '● Filtro ativo' : 'Exigem plano de ação'}
          </div>
        </div>

        {/* Card 5: Coletas Registradas */}
        <div 
          style={{ ...styles.kpiCard, borderLeft: '4px solid #8b5cf6' }}
          title="Volume de indicadores coletados neste mês"
        >
          <div style={styles.kpiHeader}>
            <span style={styles.kpiLabel}>Registrados</span>
            <Activity size={18} color="#8b5cf6" />
          </div>
          <div style={styles.kpiValue}>
            {measuredCount} <span style={styles.kpiFraction}>/ {totalIndicatorsCount}</span>
          </div>
          <div style={styles.kpiSub}>
            {totalIndicatorsCount > 0 ? `${Math.round((measuredCount / totalIndicatorsCount) * 100)}% de cobertura` : '0%'}
          </div>
        </div>

        {/* Card 6: Setores Ativos */}
        <div 
          style={{ ...styles.kpiCard, borderLeft: '4px solid #0d9488' }}
          title="Setores monitorados na instituição"
        >
          <div style={styles.kpiHeader}>
            <span style={styles.kpiLabel}>Setores</span>
            <Building2 size={18} color="#0d9488" />
          </div>
          <div style={styles.kpiValue}>{sectors.length}</div>
          <div style={styles.kpiSub}>Áreas hospitalares</div>
        </div>
      </div>

      {/* SEÇÃO 1: PAINEL DE DESEMPENHO POR SETOR (CARDS CLICÁVEIS) */}
      <div style={styles.sectionCard}>
        <div style={styles.sectionHeader}>
          <div>
            <h3 style={styles.sectionTitle}>Desempenho por Setor Hospitalar</h3>
            <p style={styles.sectionSubtitle}>
              Clique sobre um setor para filtrar imediatamente seus indicadores correspondentes
            </p>
          </div>
          {selectedSector !== 'TODOS' && (
            <button
              type="button"
              onClick={() => setSelectedSector('TODOS')}
              style={styles.showAllSectorsBtn}
            >
              Ver Todos os Setores →
            </button>
          )}
        </div>

        <div style={styles.sectorsGrid}>
          {sectorPerformanceData.map((sec, idx) => {
            const isSelected = selectedSector === sec.id;
            return (
              <div
                key={sec.id}
                onClick={() => setSelectedSector(isSelected ? 'TODOS' : sec.id)}
                style={{
                  ...styles.sectorCard,
                  ...(isSelected ? styles.sectorCardSelected : {})
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <span style={styles.sectorCardName}>{sec.name}</span>
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: '800',
                    color: sec.rate >= 85 ? '#059669' : sec.rate >= 60 ? '#d97706' : '#dc2626'
                  }}>
                    {sec.rate}%
                  </span>
                </div>

                {/* Barra de Progresso de Conformidade */}
                <div style={styles.sectorProgressBarBg}>
                  <div 
                    style={{
                      ...styles.sectorProgressBarFill,
                      width: `${sec.rate}%`,
                      backgroundColor: sec.rate >= 85 ? '#10b981' : sec.rate >= 60 ? '#f59e0b' : '#ef4444'
                    }}
                  />
                </div>

                <div style={styles.sectorCardFooter}>
                  <span>{sec.total} indicadores</span>
                  <span style={{ color: '#059669', fontWeight: '700' }}>{sec.met} OK</span>
                  {sec.missed > 0 && <span style={{ color: '#dc2626', fontWeight: '700' }}>{sec.missed} fora</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SEÇÃO 2: TOP DESVIOS CRÍTICOS (ALERTA EXECUTIVO) */}
      {topMissedIndicators.length > 0 && statusFilter !== 'MET' && (
        <div style={styles.missedSectionCard}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <AlertTriangle size={18} color="#dc2626" />
            <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '800', color: '#991b1b' }}>
              Painel de Desvios Críticos — Exigem Plano de Ação
            </h3>
          </div>

          <div style={styles.missedGrid}>
            {topMissedIndicators.map(item => (
              <div 
                key={item.id} 
                style={styles.missedCard}
                onClick={() => setSelectedIndicatorDetail(item)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <strong style={{ fontSize: '0.85rem', color: '#0f172a' }}>{item.name}</strong>
                  <span style={styles.missedBadge}>Desvio</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.35rem', fontSize: '0.78rem' }}>
                  <span style={{ color: '#64748b' }}>Setor: <strong>{item.sectorName}</strong></span>
                  <span style={{ color: '#dc2626', fontWeight: '800' }}>
                    Atual: {item.currentValue} {item.unit} (Meta: {item.lowerIsBetter ? '≤' : '≥'} {item.target})
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SEÇÃO 3: GRÁFICOS CONSOLIDADOS RECHARTS */}
      <div style={styles.chartsGrid}>
        {/* Gráfico 1: Aderência por Setor */}
        <div style={styles.chartBox}>
          <div style={styles.chartHeader}>
            <h4 style={styles.chartTitle}>Aderência de Metas por Setor</h4>
            <span style={styles.chartSub}>Meta Institucional: ≥ 85%</span>
          </div>
          <div style={{ height: '220px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barSectorComparisonData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} />
                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 10, fontWeight: 600 }} />
                <Tooltip formatter={(val) => [`${val}%`, 'Conformidade']} />
                <ReferenceLine x={85} stroke="#0284c7" strokeDasharray="3 3" label={{ value: '85%', fontSize: 9, fill: '#0284c7' }} />
                <Bar dataKey="Conformidade" fill="#0284c7" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico 2: Distribuição de Indicadores por Status */}
        <div style={styles.chartBox}>
          <div style={styles.chartHeader}>
            <h4 style={styles.chartTitle}>Distribuição por Status</h4>
            <span style={styles.chartSub}>{measuredCount} aferidos no período</span>
          </div>
          <div style={{ height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {pieStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* SEÇÃO 4: GRADE PRINCIPAL DE INDICADORES (CARDS CLICÁVEIS) */}
      <div style={styles.indicatorsSectionHeader}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800', color: '#0f172a' }}>
            Indicadores do Período ({displayMetrics.length})
          </h3>
          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
            {selectedSector === 'TODOS' ? 'Todos os setores hospitalares' : `Setor: ${sectors.find(s => s.id === selectedSector)?.name}`} • Referência: {selectedPeriod}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {onNavigateToUpload && (
            <button
              type="button"
              onClick={onNavigateToUpload}
              style={styles.newRecordBtn}
              title="Lançar novas coletas de dados"
            >
              + Lançar Dados
            </button>
          )}
        </div>
      </div>

      {displayMetrics.length === 0 ? (
        <div style={styles.emptyStateBox}>
          <HelpCircle size={40} color="#94a3b8" style={{ marginBottom: '0.5rem' }} />
          <h4 style={{ margin: 0, color: '#334155' }}>Nenhum indicador localizado</h4>
          <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.85rem' }}>
            Tente redefinir os filtros de busca ou período de referência.
          </p>
        </div>
      ) : (
        <div style={styles.indicatorCardsGrid}>
          {displayMetrics.map((metric) => (
            <div 
              key={metric.id} 
              id={`metric-card-${metric.id}`} 
              style={styles.metricCard}
            >
              {/* Cabeçalho do Card */}
              <div style={styles.metricCardHeader}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                    <span style={styles.sectorBadge}>{metric.sectorName}</span>
                    {metric.currentValue === null ? (
                      <span style={{ ...styles.statusBadge, backgroundColor: '#f1f5f9', color: '#64748b' }}>
                        Pendente
                      </span>
                    ) : metric.targetMet ? (
                      <span style={{ ...styles.statusBadge, backgroundColor: '#ecfdf5', color: '#059669' }}>
                        Conforme
                      </span>
                    ) : (
                      <span style={{ ...styles.statusBadge, backgroundColor: '#fef2f2', color: '#dc2626' }}>
                        Desvio
                      </span>
                    )}
                  </div>
                  <h4 style={styles.metricCardName} title={metric.name}>{metric.name}</h4>
                </div>

                <div className="no-print" style={{ display: 'flex', gap: '0.3rem' }}>
                  <button 
                    onClick={() => handlePrint(metric.id, 'portrait')}
                    title="Imprimir Laudo Retrato"
                    style={styles.printBtn}
                  >
                    <Printer size={13} />
                  </button>
                </div>
              </div>

              {/* Descrição Curta */}
              <p style={styles.metricCardDesc}>{metric.description}</p>

              {/* Bloco de Valores (Realizado x Meta) */}
              <div style={styles.valueRow}>
                <div style={styles.valueBlock}>
                  <span style={styles.valueLabel}>Realizado</span>
                  {metric.currentValue !== null ? (
                    <div style={styles.valueNum}>
                      {metric.currentValue}
                      <span style={styles.valueUnit}>{metric.unit}</span>
                    </div>
                  ) : (
                    <div style={styles.noValue}>Aguardando</div>
                  )}
                </div>

                <div style={styles.valueBlock}>
                  <span style={styles.valueLabel}>Meta Alvo</span>
                  <div style={styles.valueNumTarget}>
                    {metric.lowerIsBetter ? '≤ ' : '≥ '}
                    {metric.target}
                    <span style={styles.valueUnit}>{metric.unit}</span>
                  </div>
                </div>

                {metric.variancePercent !== null && (
                  <div style={styles.valueBlock}>
                    <span style={styles.valueLabel}>Variação</span>
                    <span style={{
                      fontSize: '0.85rem',
                      fontWeight: '800',
                      color: metric.targetMet ? '#059669' : '#dc2626',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '2px'
                    }}>
                      {parseFloat(metric.variancePercent) > 0 ? `+${metric.variancePercent}%` : `${metric.variancePercent}%`}
                    </span>
                  </div>
                )}
              </div>

              {/* Seletor Compacto de Gráfico & Mini Sparkline */}
              <div style={styles.trendContainer}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <span style={styles.trendLabel}>Evolução Mensal</span>
                  <div style={styles.chartTypeGroup}>
                    {[
                      { id: 'line', label: 'Linha' },
                      { id: 'bar', label: 'Barras' },
                      { id: 'step', label: 'Degrau' },
                      { id: 'table', label: 'Tabela' }
                    ].map(t => {
                      const isSel = (chartTypes[metric.id] || 'line') === t.id;
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setChartTypes(prev => ({ ...prev, [metric.id]: t.id }))}
                          style={{
                            ...styles.chartTypeBtn,
                            ...(isSel ? styles.chartTypeBtnActive : {})
                          }}
                        >
                          {t.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <DynamicChart
                  history={metric.history}
                  target={metric.target}
                  unit={metric.unit}
                  lowerIsBetter={metric.lowerIsBetter}
                  chartType={chartTypes[metric.id] || 'line'}
                />
              </div>

              {/* Botão Clicável de Análise Detalhada (Deep Dive) */}
              <button
                type="button"
                onClick={() => setSelectedIndicatorDetail(metric)}
                style={styles.deepDiveBtn}
              >
                <span>Análise Completa</span>
                <ChevronRight size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* MODAL DE ANÁLISE DETALHADA DO INDICADOR (DEEP DIVE MODAL) */}
      {selectedIndicatorDetail && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            {/* Header do Modal */}
            <div style={styles.modalHeader}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                  <span style={styles.sectorBadge}>{selectedIndicatorDetail.sectorName}</span>
                  <span style={{
                    ...styles.statusBadge,
                    backgroundColor: selectedIndicatorDetail.currentValue === null ? '#f1f5f9' : selectedIndicatorDetail.targetMet ? '#ecfdf5' : '#fef2f2',
                    color: selectedIndicatorDetail.currentValue === null ? '#64748b' : selectedIndicatorDetail.targetMet ? '#059669' : '#dc2626'
                  }}>
                    {selectedIndicatorDetail.currentValue === null ? 'Pendente' : selectedIndicatorDetail.targetMet ? 'Conforme' : 'Desvio Detectado'}
                  </span>
                </div>
                <h3 style={styles.modalTitle}>{selectedIndicatorDetail.name}</h3>
              </div>

              <button
                type="button"
                onClick={() => setSelectedIndicatorDetail(null)}
                style={styles.modalCloseBtn}
              >
                <X size={20} color="#64748b" />
              </button>
            </div>

            {/* Corpo do Modal */}
            <div style={styles.modalBody}>
              {/* KPIs de Destaque no Modal */}
              <div style={styles.modalKpisGrid}>
                <div style={styles.modalKpiBox}>
                  <span style={styles.modalKpiLabel}>Valor Atual ({selectedPeriod})</span>
                  <div style={{ ...styles.modalKpiValue, color: selectedIndicatorDetail.targetMet ? '#059669' : '#dc2626' }}>
                    {selectedIndicatorDetail.currentValue !== null ? `${selectedIndicatorDetail.currentValue} ${selectedIndicatorDetail.unit}` : 'Sem Dado'}
                  </div>
                </div>

                <div style={styles.modalKpiBox}>
                  <span style={styles.modalKpiLabel}>Meta Institucional</span>
                  <div style={{ ...styles.modalKpiValue, color: '#0284c7' }}>
                    {selectedIndicatorDetail.lowerIsBetter ? '≤ ' : '≥ '}
                    {selectedIndicatorDetail.target} {selectedIndicatorDetail.unit}
                  </div>
                </div>

                <div style={styles.modalKpiBox}>
                  <span style={styles.modalKpiLabel}>Critério de Sucesso</span>
                  <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#334155', marginTop: '0.2rem' }}>
                    {selectedIndicatorDetail.lowerIsBetter ? 'Quanto menor, melhor' : 'Quanto maior, melhor'}
                  </div>
                </div>

                <div style={styles.modalKpiBox}>
                  <span style={styles.modalKpiLabel}>Histórico Total</span>
                  <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#334155', marginTop: '0.2rem' }}>
                    {selectedIndicatorDetail.history?.length || 0} meses apurados
                  </div>
                </div>
              </div>

              {/* Descrição e Fórmula */}
              <div style={styles.modalDescBox}>
                <strong style={{ fontSize: '0.82rem', color: '#1e293b', display: 'block', marginBottom: '0.2rem' }}>
                  Fórmula de Cálculo & Racional Clínico:
                </strong>
                <p style={{ margin: 0, fontSize: '0.82rem', color: '#475569', lineHeight: '1.4' }}>
                  {selectedIndicatorDetail.description || 'Indicador clínico-assistencial regulamentado para monitoramento de segurança e qualidade hospitalar.'}
                </p>
              </div>

              {/* Gráfico Histórico Completo */}
              <div style={{ marginTop: '1rem' }}>
                <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.9rem', fontWeight: '700', color: '#0f172a' }}>
                  Evolução Histórica x Linha de Meta
                </h4>
                <div style={{ height: '220px', width: '100%', backgroundColor: '#fcfcfd', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.5rem' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart 
                      data={[...(selectedIndicatorDetail.history || [])]
                        .sort((a, b) => a.period.localeCompare(b.period))
                        .map(d => ({
                          mes: d.period.split('-')[1] + '/' + d.period.split('-')[0].substring(2),
                          valor: d.value,
                          meta: selectedIndicatorDetail.target
                        }))
                      }
                      margin={{ top: 15, right: 15, left: -15, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip formatter={(val) => [`${val} ${selectedIndicatorDetail.unit}`, '']} />
                      <Legend />
                      <ReferenceLine 
                        y={selectedIndicatorDetail.target} 
                        stroke="#0284c7" 
                        strokeDasharray="4 4" 
                        label={{ value: `Meta: ${selectedIndicatorDetail.target}`, fontSize: 10, fill: '#0284c7' }} 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="valor" 
                        name="Valor Realizado" 
                        stroke={selectedIndicatorDetail.targetMet ? '#10b981' : '#dc2626'} 
                        strokeWidth={2.5} 
                        dot={{ r: 4 }} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Tabela de Histórico Cronológico */}
              <div style={{ marginTop: '1rem' }}>
                <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.9rem', fontWeight: '700', color: '#0f172a' }}>
                  Tabela Cronológica de Aferições
                </h4>
                <div style={{ maxHeight: '180px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                  <table style={styles.modalHistoryTable}>
                    <thead>
                      <tr style={{ backgroundColor: '#f8fafc', color: '#475569' }}>
                        <th style={styles.modalTh}>Período</th>
                        <th style={styles.modalTh}>Valor</th>
                        <th style={styles.modalTh}>Meta</th>
                        <th style={styles.modalTh}>Desvio</th>
                        <th style={styles.modalTh}>Resultado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...(selectedIndicatorDetail.history || [])]
                        .sort((a, b) => b.period.localeCompare(a.period))
                        .map((row, idx) => {
                          const isOk = selectedIndicatorDetail.lowerIsBetter 
                            ? row.value <= selectedIndicatorDetail.target 
                            : row.value >= selectedIndicatorDetail.target;
                          const gap = (row.value - selectedIndicatorDetail.target).toFixed(2);
                          return (
                            <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                              <td style={styles.modalTd}>{row.period}</td>
                              <td style={{ ...styles.modalTd, fontWeight: '700' }}>{row.value} {selectedIndicatorDetail.unit}</td>
                              <td style={styles.modalTd}>{selectedIndicatorDetail.target} {selectedIndicatorDetail.unit}</td>
                              <td style={{ ...styles.modalTd, color: isOk ? '#059669' : '#dc2626', fontWeight: '700' }}>
                                {gap > 0 ? `+${gap}` : gap}
                              </td>
                              <td style={styles.modalTd}>
                                <span style={{
                                  padding: '2px 8px',
                                  borderRadius: '4px',
                                  fontSize: '0.72rem',
                                  fontWeight: '800',
                                  backgroundColor: isOk ? '#ecfdf5' : '#fef2f2',
                                  color: isOk ? '#059669' : '#dc2626'
                                }}>
                                  {isOk ? 'CONFORME' : 'FORA'}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Rodapé do Modal */}
            <div style={styles.modalFooter}>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => handlePrint(selectedIndicatorDetail.id, 'portrait')}
                  style={styles.modalPrintBtn}
                >
                  <Printer size={15} />
                  <span>Imprimir Retrato</span>
                </button>
                <button
                  type="button"
                  onClick={() => handlePrint(selectedIndicatorDetail.id, 'landscape')}
                  style={styles.modalPrintBtn}
                >
                  <Printer size={15} style={{ transform: 'rotate(-90deg)' }} />
                  <span>Imprimir Paisagem</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setSelectedIndicatorDetail(null)}
                style={styles.modalCloseFooterBtn}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modais Especiais dos Setores */}
      {showAtaModal && selectedSector === 'psicologia' && (
        <AtaPsicologiaModal 
          onClose={() => setShowAtaModal(false)} 
          selectedPeriod={selectedPeriod}
          currentUser={currentUser}
        />
      )}

      {showSesmtReportsModal && (
        <SesmtReportsModal 
          isOpen={showSesmtReportsModal}
          onClose={() => setShowSesmtReportsModal(false)} 
        />
      )}
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
    fontFamily: 'Inter, system-ui, sans-serif'
  },
  loadingBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4rem 1rem'
  },
  filterCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '1rem 1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.85rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
  },
  filterTopRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '0.75rem',
    borderBottom: '1px solid #f1f5f9',
    paddingBottom: '0.65rem'
  },
  filterTitle: {
    fontSize: '0.88rem',
    fontWeight: '800',
    color: '#0f172a'
  },
  periodPresetGroup: {
    display: 'flex',
    gap: '0.35rem',
    flexWrap: 'wrap'
  },
  presetBtn: {
    padding: '0.32rem 0.65rem',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    backgroundColor: '#ffffff',
    fontSize: '0.78rem',
    fontWeight: '600',
    color: '#475569',
    cursor: 'pointer',
    transition: 'all 0.15s'
  },
  presetBtnActive: {
    backgroundColor: '#0284c7',
    color: '#ffffff',
    borderColor: '#0284c7'
  },
  filterControlsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    flexWrap: 'wrap'
  },
  filterField: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem'
  },
  fieldLabel: {
    fontSize: '0.8rem',
    fontWeight: '700',
    color: '#64748b'
  },
  fieldSelect: {
    padding: '0.38rem 0.65rem',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    fontSize: '0.82rem',
    color: '#0f172a',
    backgroundColor: '#ffffff',
    cursor: 'pointer'
  },
  searchInput: {
    padding: '0.38rem 0.65rem',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    fontSize: '0.82rem',
    color: '#0f172a',
    backgroundColor: '#ffffff',
    width: '100%',
    outline: 'none'
  },
  specialActionBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
    padding: '0.4rem 0.75rem',
    borderRadius: '6px',
    backgroundColor: '#f0f9ff',
    color: '#0284c7',
    border: '1px solid #bae6fd',
    fontSize: '0.8rem',
    fontWeight: '700',
    cursor: 'pointer'
  },
  resetFilterBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.3rem',
    padding: '0.38rem 0.65rem',
    borderRadius: '6px',
    border: '1px solid #fecaca',
    backgroundColor: '#fef2f2',
    color: '#dc2626',
    fontSize: '0.78rem',
    fontWeight: '700',
    cursor: 'pointer'
  },
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '0.85rem'
  },
  kpiCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '1rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
    transition: 'all 0.15s'
  },
  kpiCardActive: {
    backgroundColor: '#f8fafc',
    boxShadow: '0 0 0 2px #0284c7'
  },
  kpiHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.35rem'
  },
  kpiLabel: {
    fontSize: '0.72rem',
    fontWeight: '800',
    color: '#64748b',
    textTransform: 'uppercase'
  },
  kpiValue: {
    fontSize: '1.65rem',
    fontWeight: '900',
    color: '#0f172a',
    margin: '0.15rem 0'
  },
  kpiFraction: {
    fontSize: '0.95rem',
    fontWeight: '600',
    color: '#94a3b8'
  },
  kpiSub: {
    fontSize: '0.72rem',
    color: '#94a3b8'
  },
  sectionCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '1.15rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '0.5rem',
    marginBottom: '0.85rem'
  },
  sectionTitle: {
    margin: 0,
    fontSize: '0.98rem',
    fontWeight: '800',
    color: '#0f172a'
  },
  sectionSubtitle: {
    margin: '2px 0 0',
    fontSize: '0.78rem',
    color: '#64748b'
  },
  showAllSectorsBtn: {
    background: 'none',
    border: 'none',
    color: '#0284c7',
    fontSize: '0.8rem',
    fontWeight: '700',
    cursor: 'pointer'
  },
  sectorsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
    gap: '0.75rem'
  },
  sectorCard: {
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '0.75rem 0.85rem',
    cursor: 'pointer',
    transition: 'all 0.15s'
  },
  sectorCardSelected: {
    backgroundColor: '#f0f9ff',
    borderColor: '#0284c7',
    boxShadow: '0 0 0 1px #0284c7'
  },
  sectorCardName: {
    fontSize: '0.8rem',
    fontWeight: '700',
    color: '#1e293b'
  },
  sectorProgressBarBg: {
    width: '100%',
    height: '6px',
    backgroundColor: '#e2e8f0',
    borderRadius: '3px',
    overflow: 'hidden',
    margin: '0.4rem 0'
  },
  sectorProgressBarFill: {
    height: '100%',
    borderRadius: '3px',
    transition: 'width 0.3s'
  },
  sectorCardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.72rem',
    color: '#64748b'
  },
  missedSectionCard: {
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '12px',
    padding: '1rem',
    boxShadow: '0 1px 3px rgba(220,38,38,0.05)'
  },
  missedGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: '0.65rem'
  },
  missedCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #fca5a5',
    borderRadius: '8px',
    padding: '0.65rem 0.85rem',
    cursor: 'pointer',
    boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
  },
  missedBadge: {
    fontSize: '0.65rem',
    fontWeight: '800',
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    padding: '1px 6px',
    borderRadius: '4px'
  },
  chartsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '1.25rem'
  },
  chartBox: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '1rem 1.15rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
  },
  chartHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.75rem'
  },
  chartTitle: {
    margin: 0,
    fontSize: '0.9rem',
    fontWeight: '800',
    color: '#0f172a'
  },
  chartSub: {
    fontSize: '0.72rem',
    color: '#64748b',
    fontWeight: '600'
  },
  indicatorsSectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '0.5rem',
    marginTop: '0.5rem'
  },
  newRecordBtn: {
    padding: '0.45rem 0.95rem',
    backgroundColor: '#0284c7',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.82rem',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 1px 2px rgba(2,132,199,0.2)'
  },
  emptyStateBox: {
    backgroundColor: '#ffffff',
    border: '1px dashed #cbd5e1',
    borderRadius: '12px',
    padding: '3rem 1rem',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  indicatorCardsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '1rem'
  },
  metricCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '1.15rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    transition: 'all 0.15s'
  },
  metricCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '0.5rem'
  },
  sectorBadge: {
    display: 'inline-block',
    fontSize: '0.68rem',
    fontWeight: '800',
    backgroundColor: '#f0f9ff',
    color: '#0284c7',
    padding: '1px 6px',
    borderRadius: '4px'
  },
  statusBadge: {
    display: 'inline-block',
    fontSize: '0.68rem',
    fontWeight: '800',
    padding: '1px 6px',
    borderRadius: '4px'
  },
  metricCardName: {
    margin: '0.35rem 0 0',
    fontSize: '0.98rem',
    fontWeight: '800',
    color: '#0f172a',
    lineHeight: '1.25'
  },
  printBtn: {
    padding: '0.3rem',
    borderRadius: '6px',
    border: '1px solid #e2e8f0',
    backgroundColor: '#ffffff',
    color: '#64748b',
    cursor: 'pointer'
  },
  metricCardDesc: {
    margin: 0,
    fontSize: '0.78rem',
    color: '#64748b',
    lineHeight: '1.35',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden'
  },
  valueRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    padding: '0.65rem 0.85rem'
  },
  valueBlock: {
    display: 'flex',
    flexDirection: 'column'
  },
  valueLabel: {
    fontSize: '0.68rem',
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase'
  },
  valueNum: {
    fontSize: '1.35rem',
    fontWeight: '900',
    color: '#0f172a'
  },
  valueNumTarget: {
    fontSize: '1.05rem',
    fontWeight: '800',
    color: '#0284c7'
  },
  valueUnit: {
    fontSize: '0.72rem',
    fontWeight: '600',
    color: '#64748b',
    marginLeft: '2px'
  },
  noValue: {
    fontSize: '0.85rem',
    fontWeight: '700',
    color: '#94a3b8'
  },
  trendContainer: {
    borderTop: '1px solid #f1f5f9',
    paddingTop: '0.65rem'
  },
  trendLabel: {
    fontSize: '0.72rem',
    fontWeight: '700',
    color: '#64748b'
  },
  chartTypeGroup: {
    display: 'flex',
    gap: '2px',
    backgroundColor: '#f1f5f9',
    padding: '2px',
    borderRadius: '5px'
  },
  chartTypeBtn: {
    border: 'none',
    background: 'none',
    fontSize: '0.65rem',
    fontWeight: '700',
    color: '#64748b',
    padding: '2px 5px',
    borderRadius: '3px',
    cursor: 'pointer'
  },
  chartTypeBtnActive: {
    backgroundColor: '#0284c7',
    color: '#ffffff'
  },
  noHistory: {
    height: '90px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.75rem',
    color: '#94a3b8'
  },
  miniTableContainer: {
    maxHeight: '110px',
    overflowY: 'auto',
    border: '1px solid #e2e8f0',
    borderRadius: '6px'
  },
  miniTable: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.72rem'
  },
  miniTableHead: {
    backgroundColor: '#f8fafc',
    borderBottom: '1px solid #e2e8f0',
    color: '#475569'
  },
  miniTh: {
    padding: '4px 6px',
    textAlign: 'left',
    fontWeight: '700'
  },
  miniTr: {
    borderBottom: '1px solid #f1f5f9'
  },
  miniTd: {
    padding: '4px 6px'
  },
  deepDiveBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    padding: '0.45rem 0.65rem',
    borderRadius: '6px',
    border: '1px solid #e2e8f0',
    backgroundColor: '#ffffff',
    color: '#0284c7',
    fontSize: '0.78rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.15s'
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    backdropFilter: 'blur(3px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: '1rem'
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    maxWidth: '750px',
    width: '100%',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
    overflow: 'hidden'
  },
  modalHeader: {
    padding: '1.25rem 1.5rem',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  modalTitle: {
    margin: 0,
    fontSize: '1.15rem',
    fontWeight: '900',
    color: '#0f172a'
  },
  modalCloseBtn: {
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    padding: '4px'
  },
  modalBody: {
    padding: '1.25rem 1.5rem',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.85rem'
  },
  modalKpisGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: '0.75rem'
  },
  modalKpiBox: {
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '0.65rem 0.85rem'
  },
  modalKpiLabel: {
    fontSize: '0.68rem',
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase'
  },
  modalKpiValue: {
    fontSize: '1.25rem',
    fontWeight: '900',
    marginTop: '0.15rem'
  },
  modalDescBox: {
    backgroundColor: '#f0f9ff',
    border: '1px solid #bae6fd',
    borderRadius: '8px',
    padding: '0.75rem 0.95rem'
  },
  modalHistoryTable: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.78rem'
  },
  modalTh: {
    padding: '6px 10px',
    textAlign: 'left',
    fontWeight: '700'
  },
  modalTd: {
    padding: '6px 10px'
  },
  modalFooter: {
    padding: '1rem 1.5rem',
    borderTop: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8fafc'
  },
  modalPrintBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
    padding: '0.45rem 0.85rem',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    backgroundColor: '#ffffff',
    color: '#334155',
    fontSize: '0.8rem',
    fontWeight: '700',
    cursor: 'pointer'
  },
  modalCloseFooterBtn: {
    padding: '0.45rem 1.15rem',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: '#0284c7',
    color: '#ffffff',
    fontSize: '0.82rem',
    fontWeight: '700',
    cursor: 'pointer'
  }
};
