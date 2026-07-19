import React, { useState, useEffect } from 'react';
import { dbService } from '../firebase';
import { BarChart3, Calendar, Filter, CheckCircle, AlertCircle, HelpCircle, ShieldAlert } from 'lucide-react';

// A premium SVG Sparkline and Trend chart component
function DynamicChart({ history, target, unit, lowerIsBetter, chartType = 'line' }) {
  if (!history || history.length === 0) {
    return <div style={styles.noHistory}>Sem histórico suficiente</div>;
  }

  // Sort history chronologically: period YYYY-MM
  const sorted = [...history].sort((a, b) => a.period.localeCompare(b.period));
  const values = sorted.map(d => d.value);
  
  const minVal = Math.min(...values, target) * 0.9;
  const maxVal = Math.max(...values, target) * 1.1;
  const range = maxVal - minVal || 1;

  // SVG parameters
  const width = 300;
  const height = 100;
  const paddingLeft = 35;
  const paddingRight = 10;
  const paddingTop = 15;
  const paddingBottom = 20;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  // Calculate coordinates
  const points = sorted.map((d, index) => {
    const x = paddingLeft + (index / (sorted.length - 1 || 1)) * chartWidth;
    const y = paddingTop + chartHeight - ((d.value - minVal) / range) * chartHeight;
    return { x, y, val: d.value, period: d.period };
  });

  // Calculate target line Y position
  const targetY = paddingTop + chartHeight - ((target - minVal) / range) * chartHeight;

  if (chartType === 'table') {
    return (
      <div style={{ maxHeight: '115px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '0.75rem', marginTop: '5px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--bg-body)', borderBottom: '1px solid var(--border-color)', fontWeight: 'bold' }}>
              <th style={{ padding: '4px 8px' }}>Mês</th>
              <th style={{ padding: '4px 8px' }}>Valor</th>
              <th style={{ padding: '4px 8px' }}>Meta</th>
              <th style={{ padding: '4px 8px' }}>Resultado</th>
            </tr>
          </thead>
          <tbody>
            {sorted.slice().reverse().map((d, i) => {
              const isTargetMet = lowerIsBetter ? d.value <= target : d.value >= target;
              const [year, month] = d.period.split('-');
              return (
                <tr key={i} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '4px 8px' }}>{month}/{year.substring(2)}</td>
                  <td style={{ padding: '4px 8px', fontWeight: 'bold' }}>{d.value} {unit}</td>
                  <td style={{ padding: '4px 8px', color: 'var(--text-secondary)' }}>{lowerIsBetter ? '≤' : '≥'} {target}</td>
                  <td style={{ padding: '4px 8px' }}>
                    <span style={{
                      padding: '0.1rem 0.3rem',
                      borderRadius: '4px',
                      fontSize: '0.65rem',
                      fontWeight: '700',
                      backgroundColor: isTargetMet ? 'var(--success-light)' : 'var(--danger-light)',
                      color: isTargetMet ? 'var(--success-color)' : 'var(--danger-color)'
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

  // Paths calculations
  let pathD = '';
  let areaD = '';

  if (chartType === 'step') {
    if (points.length > 0) {
      pathD = `M ${points[0].x} ${points[0].y}`;
      for (let i = 1; i < points.length; i++) {
        const prev = points[i - 1];
        const curr = points[i];
        const midX = (prev.x + curr.x) / 2;
        pathD += ` L ${midX} ${prev.y} L ${midX} ${curr.y} L ${curr.x} ${curr.y}`;
      }
      areaD = `${pathD} L ${points[points.length - 1].x} ${paddingTop + chartHeight} L ${points[0].x} ${paddingTop + chartHeight} Z`;
    }
  } else {
    // default line path
    if (points.length > 0) {
      pathD = `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ');
      areaD = `${pathD} L ${points[points.length - 1].x} ${paddingTop + chartHeight} L ${points[0].x} ${paddingTop + chartHeight} Z`;
    }
  }

  return (
    <div style={styles.chartContainer}>
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: '110px' }}>
        <defs>
          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--primary-color)" stopOpacity="0.2"/>
            <stop offset="100%" stopColor="var(--primary-color)" stopOpacity="0.0"/>
          </linearGradient>
        </defs>

        {/* Grid Lines */}
        <line x1={paddingLeft} y1={paddingTop} x2={width - paddingRight} y2={paddingTop} stroke="#f1f5f9" strokeWidth="1" />
        <line x1={paddingLeft} y1={paddingTop + chartHeight / 2} x2={width - paddingRight} y2={paddingTop + chartHeight / 2} stroke="#f1f5f9" strokeWidth="1" />
        <line x1={paddingLeft} y1={paddingTop + chartHeight} x2={width - paddingRight} y2={paddingTop + chartHeight} stroke="#e2e8f0" strokeWidth="1.5" />

        {/* Target Line */}
        {targetY >= paddingTop && targetY <= paddingTop + chartHeight && (
          <line
            x1={paddingLeft}
            y1={targetY}
            x2={width - paddingRight}
            y2={targetY}
            stroke="var(--warning-color)"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />
        )}

        {/* Column Bars representation */}
        {chartType === 'bar' && points.map((p, i) => {
          const isTargetMet = lowerIsBetter ? p.val <= target : p.val >= target;
          const barWidth = Math.max(8, chartWidth / (points.length * 2.2));
          const barHeight = paddingTop + chartHeight - p.y;
          return (
            <g key={i}>
              <rect
                x={p.x - barWidth / 2}
                y={p.y}
                width={barWidth}
                height={Math.max(barHeight, 2)}
                fill={isTargetMet ? 'rgba(16,185,129,0.75)' : 'rgba(239,68,68,0.75)'}
                rx="1"
              />
              <text
                x={p.x}
                y={p.y - 4}
                textAnchor="middle"
                fontSize="7"
                fontWeight="700"
                fill="var(--text-secondary)"
              >
                {p.val}
              </text>
            </g>
          );
        })}

        {/* Draw line/step path area */}
        {chartType !== 'bar' && areaD && <path d={areaD} fill="url(#chartGradient)" />}

        {/* Line or Step path stroke */}
        {chartType !== 'bar' && pathD && (
          <path
            d={pathD}
            fill="none"
            stroke="var(--primary-color)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* Dots on points for Line and Step */}
        {chartType !== 'bar' && points.map((p, i) => {
          const isTargetMet = lowerIsBetter ? p.val <= target : p.val >= target;
          return (
            <g key={i}>
              <circle
                cx={p.x}
                cy={p.y}
                r="3.5"
                fill="#ffffff"
                stroke={isTargetMet ? 'var(--success-color)' : 'var(--danger-color)'}
                strokeWidth="1.5"
              />
              <text
                x={p.x}
                y={p.y - 7}
                textAnchor="middle"
                fontSize="7.5"
                fontWeight="700"
                fill="var(--text-secondary)"
              >
                {p.val}
              </text>
            </g>
          );
        })}

        {/* Y Axis Labels */}
        <text x={paddingLeft - 5} y={paddingTop + 3} textAnchor="end" fontSize="8" fill="var(--text-muted)">
          {maxVal.toFixed(1)}
        </text>
        <text x={paddingLeft - 5} y={targetY + 3} textAnchor="end" fontSize="8" fill="var(--warning-color)" fontWeight="700">
          Meta:{target}
        </text>
        <text x={paddingLeft - 5} y={paddingTop + chartHeight + 3} textAnchor="end" fontSize="8" fill="var(--text-muted)">
          {minVal.toFixed(1)}
        </text>

        {/* X Axis Labels */}
        {points.map((p, i) => (
          <text
            key={i}
            x={p.x}
            y={paddingTop + chartHeight + 13}
            textAnchor="middle"
            fontSize="8"
            fill="var(--text-secondary)"
          >
            {p.period.substring(5)}/{p.period.substring(2,4)}
          </text>
        ))}
      </svg>
    </div>
  );
}

export default function Dashboard({ currentUser }) {
  const [sectors, setSectors] = useState([]);
  const [indicators, setIndicators] = useState([]);
  const [indicatorData, setIndicatorData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [selectedSector, setSelectedSector] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [availablePeriods, setAvailablePeriods] = useState([]);
  const [chartTypes, setChartTypes] = useState({});

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      // 1. Fetch authorized sectors
      const allSectors = await dbService.getSectors();
      const userSectors = currentUser.role === 'admin'
        ? allSectors
        : allSectors.filter(s => currentUser.allowedSectors.includes(s.id));
      
      setSectors(userSectors);

      if (userSectors.length > 0) {
        // Set first sector as default
        setSelectedSector(userSectors[0].id);
      }

      // 2. Fetch all indicators
      const allIndicators = await dbService.getIndicators();
      setIndicators(allIndicators);

      // 3. Fetch data for allowed sectors
      const data = await dbService.getIndicatorData(
        userSectors.map(s => s.id),
        currentUser.role === 'admin'
      );
      setIndicatorData(data);

      // Extract unique periods and sort desc
      const periods = [...new Set(data.map(d => d.period))].sort((a, b) => b.localeCompare(a));
      setAvailablePeriods(periods);
      if (periods.length > 0) {
        setSelectedPeriod(periods[0]); // default to most recent period
      } else {
        // Fallback placeholder period if empty database
        setSelectedPeriod('2026-07');
      }

    } catch (err) {
      console.error('Erro ao buscar dados do dashboard:', err);
    } finally {
      setLoading(true); // Wait, set to false
      setLoading(false);
    }
  };

  // Helper to determine target logic: lower or higher is better
  const isLowerBetter = (indicatorId, name) => {
    const term = (indicatorId + ' ' + name).toLowerCase();
    return term.includes('infeccao') || 
           term.includes('infecção') || 
           term.includes('mortalidade') || 
           term.includes('glosa') || 
           term.includes('custo') ||
           term.includes('evitado');
  };

  // Filter indicators and data
  const filteredIndicators = indicators.filter(ind => ind.sectorId === selectedSector);
  
  const metricsForPeriod = filteredIndicators.map(ind => {
    // Current period value
    const currentRecord = indicatorData.find(d => d.indicatorId === ind.id && d.period === selectedPeriod);
    const currentValue = currentRecord ? currentRecord.value : null;

    // Historical records for this indicator
    const history = indicatorData.filter(d => d.indicatorId === ind.id);

    const lowerIsBetter = isLowerBetter(ind.id, ind.name);
    
    // Check if target is met
    let targetMet = null;
    if (currentValue !== null) {
      targetMet = lowerIsBetter ? currentValue <= ind.target : currentValue >= ind.target;
    }

    return {
      ...ind,
      currentValue,
      history,
      targetMet,
      lowerIsBetter
    };
  });

  // Calculate high-level summary cards for selected period
  const totalIndicators = metricsForPeriod.length;
  const measuredIndicators = metricsForPeriod.filter(m => m.currentValue !== null).length;
  const targetsMet = metricsForPeriod.filter(m => m.currentValue !== null && m.targetMet === true).length;
  const targetsMissed = metricsForPeriod.filter(m => m.currentValue !== null && m.targetMet === false).length;

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '3rem' }}>Carregando dados do painel principal...</div>;
  }

  return (
    <div style={styles.container}>
      {/* Welcome Banner */}
      <div style={styles.welcomeBanner}>
        <div>
          <h1 style={styles.welcomeTitle}>Olá, {currentUser.name}!</h1>
          <p style={styles.welcomeSubtitle}>
            Abaixo estão os indicadores de hemodiálise vinculados à sua permissão de acesso.
          </p>
        </div>
        <div style={styles.userInfo}>
          <span className="badge badge-prof" style={{ marginRight: '0.5rem', backgroundColor: '#e0f2fe', color: '#0284c7' }}>
            Setores Liberados: {sectors.length}
          </span>
          <span className={`badge ${currentUser.role === 'admin' ? 'badge-admin' : 'badge-prof'}`}>
            {currentUser.role === 'admin' ? 'Acesso Global' : 'Acesso Restrito'}
          </span>
        </div>
      </div>

      {sectors.length === 0 ? (
        <div className="alert alert-warning">
          <ShieldAlert size={20} />
          <div>
            <strong>Nenhum setor liberado!</strong> Fale com o administrador do sistema para liberar os setores do seu perfil.
          </div>
        </div>
      ) : (
        <>
          {/* Dashboard Filter controls */}
          <div className="card" style={styles.filterCard}>
            <div style={styles.filterTitle}>
              <Filter size={18} color="var(--primary-color)" />
              <span>Filtros do Painel</span>
            </div>
            <div style={styles.filterRow}>
              <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                <label htmlFor="sector-filter">Setor Hospitalar</label>
                <select
                  id="sector-filter"
                  className="form-control"
                  value={selectedSector}
                  onChange={(e) => setSelectedSector(e.target.value)}
                >
                  {sectors.map(sec => (
                    <option key={sec.id} value={sec.id}>{sec.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                <label htmlFor="period-filter">Período de Referência</label>
                <div style={styles.periodInputWrapper}>
                  <Calendar size={16} style={styles.periodIcon} />
                  <select
                    id="period-filter"
                    className="form-control"
                    style={{ paddingLeft: '2.25rem' }}
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value)}
                  >
                    {availablePeriods.length === 0 ? (
                      <option value="2026-07">Julho/2026</option>
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
              </div>
            </div>
          </div>

          {/* Quick Metrics KPI cards */}
          <div className="grid grid-cols-4" style={{ marginBottom: '2rem' }}>
            <div className="card" style={styles.kpiCard}>
              <div style={styles.kpiHeader}>
                <span style={styles.kpiLabel}>Total de Indicadores</span>
              </div>
              <div style={styles.kpiValue}>{totalIndicators}</div>
              <div style={styles.kpiFooter}>Cadastrados neste setor</div>
            </div>

            <div className="card" style={{ ...styles.kpiCard, borderLeft: '4px solid var(--primary-color)' }}>
              <div style={styles.kpiHeader}>
                <span style={styles.kpiLabel}>Coletas Registradas</span>
              </div>
              <div style={styles.kpiValue}>
                {measuredIndicators} <span style={styles.kpiFraction}>/ {totalIndicators}</span>
              </div>
              <div style={styles.kpiFooter}>No mês selecionado</div>
            </div>

            <div className="card" style={{ ...styles.kpiCard, borderLeft: '4px solid var(--success-color)' }}>
              <div style={styles.kpiHeader}>
                <CheckCircle size={16} color="var(--success-color)" />
                <span style={styles.kpiLabel}>Metas Atingidas</span>
              </div>
              <div style={{ ...styles.kpiValue, color: 'var(--success-color)' }}>
                {targetsMet}
              </div>
              <div style={styles.kpiFooter}>
                {measuredIndicators > 0 ? `${((targetsMet / measuredIndicators) * 100).toFixed(0)}% de conformidade` : 'Aguardando coletas'}
              </div>
            </div>

            <div className="card" style={{ ...styles.kpiCard, borderLeft: '4px solid var(--danger-color)' }}>
              <div style={styles.kpiHeader}>
                <AlertCircle size={16} color="var(--danger-color)" />
                <span style={styles.kpiLabel}>Fora da Meta</span>
              </div>
              <div style={{ ...styles.kpiValue, color: 'var(--danger-color)' }}>
                {targetsMissed}
              </div>
              <div style={styles.kpiFooter}>Necessitam plano de ação</div>
            </div>
          </div>

          {/* Indicators Grid View */}
          <div style={styles.gridHeader}>
            <h2 style={{ marginBottom: 0 }}>Indicadores de {sectors.find(s => s.id === selectedSector)?.name}</h2>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Metas calculadas para o período: <strong>{selectedPeriod}</strong>
            </span>
          </div>

          {metricsForPeriod.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
              <HelpCircle size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
              <p>Nenhum indicador cadastrado para este setor.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2">
              {metricsForPeriod.map((metric) => (
                <div key={metric.id} className="card" style={styles.metricCard}>
                  {/* Metric Title & Description */}
                  <div>
                    <h3 style={styles.metricName}>{metric.name}</h3>
                    <p style={styles.metricDesc}>{metric.description}</p>
                  </div>

                  {/* Value Summary Grid */}
                  <div style={styles.valueRow}>
                    <div style={styles.valueBlock}>
                      <span style={styles.valueLabel}>Valor Coletado</span>
                      {metric.currentValue !== null ? (
                        <div style={styles.valueNum}>
                          {metric.currentValue}
                          <span style={styles.valueUnit}>{metric.unit}</span>
                        </div>
                      ) : (
                        <div style={styles.noValue}>Pendente</div>
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

                    <div style={styles.valueBlockRight}>
                      <span style={styles.valueLabel}>Status</span>
                      {metric.currentValue === null ? (
                        <span className="badge badge-warning" style={{ alignSelf: 'flex-start' }}>Sem Dado</span>
                      ) : metric.targetMet ? (
                        <span className="badge badge-success" style={{ alignSelf: 'flex-start' }}>Meta Atingida</span>
                      ) : (
                        <span className="badge badge-danger" style={{ alignSelf: 'flex-start' }}>Fora da Meta</span>
                      )}
                    </div>
                  </div>

                  {/* Trend Sparkline */}
                  <div style={styles.trendContainer}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <div style={styles.trendLabel}>Tendência Temporal</div>
                      <div style={{ display: 'flex', gap: '0.2rem', backgroundColor: 'var(--bg-body)', padding: '2px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
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
                                background: isSel ? 'var(--primary-color)' : 'none',
                                color: isSel ? '#ffffff' : 'var(--text-secondary)',
                                border: 'none',
                                borderRadius: '3px',
                                fontSize: '0.65rem',
                                padding: '2px 6px',
                                fontWeight: '700',
                                cursor: 'pointer',
                                transition: 'all 0.15s'
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
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '0.5rem 0',
  },
  welcomeBanner: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  welcomeTitle: {
    fontSize: '2rem',
    fontWeight: '700',
    letterSpacing: '-0.025em',
    marginBottom: '0.25rem',
  },
  welcomeSubtitle: {
    color: 'var(--text-secondary)',
    fontSize: '0.95rem',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
  },
  filterCard: {
    padding: '1.25rem 1.5rem',
    marginBottom: '1.5rem',
    backgroundColor: '#ffffff',
  },
  filterTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontWeight: '600',
    fontSize: '0.95rem',
    color: 'var(--text-primary)',
    marginBottom: '1rem',
  },
  filterRow: {
    display: 'flex',
    gap: '1.5rem',
    flexWrap: 'wrap',
  },
  periodInputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  periodIcon: {
    position: 'absolute',
    left: '0.75rem',
    color: 'var(--text-muted)',
    pointerEvents: 'none',
  },
  kpiCard: {
    padding: '1.25rem',
    backgroundColor: '#ffffff',
    display: 'flex',
    flexDirection: 'column',
  },
  kpiHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    marginBottom: '0.5rem',
  },
  kpiLabel: {
    fontSize: '0.8rem',
    fontWeight: '600',
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.02em',
  },
  kpiValue: {
    fontSize: '2rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
    lineHeight: '1.1',
  },
  kpiFraction: {
    fontSize: '1rem',
    color: 'var(--text-muted)',
    fontWeight: '500',
  },
  kpiFooter: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    marginTop: '0.5rem',
  },
  gridHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: '1rem',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '0.5rem',
  },
  metricCard: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    gap: '1.25rem',
    backgroundColor: '#ffffff',
    transition: 'transform var(--transition-fast), box-shadow var(--transition-fast)',
  },
  metricName: {
    fontSize: '1.1rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
    marginBottom: '0.25rem',
  },
  metricDesc: {
    fontSize: '0.78rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.4',
  },
  valueRow: {
    display: 'flex',
    justifyContent: 'space-between',
    backgroundColor: 'var(--bg-color)',
    padding: '0.875rem 1rem',
    borderRadius: 'var(--border-radius-sm)',
    border: '1px solid var(--border-color)',
  },
  valueBlock: {
    display: 'flex',
    flexDirection: 'column',
  },
  valueBlockRight: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  valueLabel: {
    fontSize: '0.7rem',
    color: 'var(--text-muted)',
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: '0.25rem',
  },
  valueNum: {
    fontSize: '1.35rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
    lineHeight: '1',
  },
  valueNumTarget: {
    fontSize: '1.35rem',
    fontWeight: '600',
    color: 'var(--text-secondary)',
    lineHeight: '1',
  },
  valueUnit: {
    fontSize: '0.75rem',
    fontWeight: '500',
    color: 'var(--text-muted)',
    marginLeft: '0.15rem',
  },
  noValue: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: 'var(--text-muted)',
    fontStyle: 'italic',
  },
  trendContainer: {
    borderTop: '1px dashed var(--border-color)',
    paddingTop: '0.875rem',
  },
  trendLabel: {
    fontSize: '0.75rem',
    fontWeight: '600',
    color: 'var(--text-secondary)',
    marginBottom: '0.5rem',
  },
  chartContainer: {
    backgroundColor: '#fafafa',
    borderRadius: '4px',
    border: '1px solid #f1f5f9',
    padding: '0.25rem',
  },
  noHistory: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: '2rem 0',
  }
};
