import React, { useState, useEffect, useMemo } from 'react';
import {
  Sparkles, ShoppingBag, TrendingDown, Calendar, RefreshCw,
  CheckCircle2, AlertTriangle, ArrowRight, CheckSquare, Square, ShieldAlert
} from 'lucide-react';
import {
  getFoodEntries, getFoodWaste, getFoodProducts, parseLocalDate,
  formatCurrency, formatNumber, formatQuantity
} from '../../../services/firebase/foodWasteService';

export default function FoodPredictionTab() {
  const [diasPrevisao, setDiasPrevisao] = useState(7);
  const [margemSeguranca, setMargemSeguranca] = useState(10); // %
  const [loading, setLoading] = useState(true);

  const [allPredictions, setAllPredictions] = useState([]);
  const [selectedProductIds, setSelectedProductIds] = useState([]);

  const calcularPrevisao = async () => {
    setLoading(true);
    try {
      const [entries, waste, products] = await Promise.all([
        getFoodEntries(),
        getFoodWaste(),
        getFoodProducts()
      ]);

      // Montar mapa de histórico dos últimos 60 dias para base de consumo diário
      const now = new Date();
      const cutoff = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000).getTime();

      const statsMap = {};
      products.forEach((p) => {
        statsMap[p.id] = {
          produtoId: p.id,
          nome: p.nome,
          unidade: p.unidade,
          custoUnitario: Number(p.custo_unitario) || 10,
          entradaQtd: 0,
          sobraQtd: 0
        };
      });

      entries.forEach((e) => {
        const dt = parseLocalDate(e.data_entrada || e.criado_em).getTime();
        if (dt >= cutoff && statsMap[e.produto_id]) {
          statsMap[e.produto_id].entradaQtd += Number(e.quantidade) || 0;
        }
      });

      waste.forEach((w) => {
        const dt = parseLocalDate(w.data_sobra || w.criado_em).getTime();
        if (dt >= cutoff && statsMap[w.produto_id]) {
          statsMap[w.produto_id].sobraQtd += Number(w.quantidade) || 0;
        }
      });

      const calcList = Object.values(statsMap).map((item) => {
        const diasHistorico = 60;
        const consumoTotal = Math.max(0, item.entradaQtd - item.sobraQtd);
        const consumoDiario = item.entradaQtd > 0 ? (consumoTotal / diasHistorico) : 1;
        const sobraDiaria = item.sobraQtd / diasHistorico;
        const taxaDesperdicio = item.entradaQtd > 0 ? (item.sobraQtd / item.entradaQtd) * 100 : 0;

        const qtdBase = Math.max(0.1, consumoDiario * diasPrevisao);
        const qtdComMargem = qtdBase * (1 + margemSeguranca / 100);
        const economia = (sobraDiaria * diasPrevisao * 0.45) * item.custoUnitario;
        const custoTotal = qtdComMargem * item.custoUnitario;

        let statusAlerta = 'excelente'; // 'excelente' | 'atencao' | 'critico'
        let recomendacaoIA = `Comprar ${qtdComMargem.toFixed(2)} ${item.unidade} supre a demanda estimada para ${diasPrevisao} dias com estoque seguro.`;

        if (taxaDesperdicio > 25) {
          statusAlerta = 'critico';
          recomendacaoIA = `Reduzir lote em 15% devido à alta taxa histórica de descarte (${taxaDesperdicio.toFixed(1)}%). Economia projetada de ${formatCurrency(economia)}.`;
        } else if (taxaDesperdicio > 12) {
          statusAlerta = 'atencao';
          recomendacaoIA = `Fracionar compras em 2 entregas semanais para evitar perdas e avarias por shelf-life.`;
        }

        return {
          produtoId: item.produtoId,
          nome: item.nome,
          unidade: item.unidade,
          custoUnitario: item.custoUnitario,
          consumoMedioDiario: Number(consumoDiario.toFixed(2)),
          sobraMedioDiario: Number(sobraDiaria.toFixed(2)),
          taxaDesperdicioPct: Number(taxaDesperdicio.toFixed(1)),
          quantidadeSugerida: Number(qtdComMargem.toFixed(2)),
          custoEstimadoTotal: Number(custoTotal.toFixed(2)),
          economiaEstimada: Number(economia.toFixed(2)),
          statusAlerta,
          recomendacaoIA
        };
      });

      setAllPredictions(calcList);
      if (selectedProductIds.length === 0) {
        setSelectedProductIds(calcList.map((p) => p.produtoId));
      }
    } catch (err) {
      console.error('Erro ao calcular previsão:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    calcularPrevisao();
    const handleSync = () => calcularPrevisao();
    window.addEventListener('food:sync', handleSync);
    return () => window.removeEventListener('food:sync', handleSync);
  }, [diasPrevisao, margemSeguranca]);

  const toggleSelectProduct = (id) => {
    setSelectedProductIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedProductIds.length === allPredictions.length) {
      setSelectedProductIds([]);
    } else {
      setSelectedProductIds(allPredictions.map((p) => p.produtoId));
    }
  };

  const filteredPredictions = allPredictions.filter((p) =>
    selectedProductIds.includes(p.produtoId)
  );

  const totalInvestimento = filteredPredictions.reduce((acc, p) => acc + p.custoEstimadoTotal, 0);
  const totalEconomia = filteredPredictions.reduce((acc, p) => acc + p.economiaEstimada, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* BARRA DE PARÂMETROS DA IA */}
      <div style={styles.filterCard}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={styles.filterIconBox}>
            <Sparkles size={20} color="#7c3aed" />
          </div>
          <div>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary, #0f172a)' }}>
              Inteligência Preditiva de Compras
            </span>
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary, #64748b)' }}>
              Previsão algorítmica de reposição com base no consumo real e corte de desperdício
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={styles.controlLabel}>Horizonte:</span>
            <div style={styles.toggleGroup}>
              {[7, 14, 21, 30].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDiasPrevisao(d)}
                  style={{
                    ...styles.toggleBtn,
                    backgroundColor: diasPrevisao === d ? '#7c3aed' : 'transparent',
                    color: diasPrevisao === d ? '#ffffff' : 'var(--text-secondary, #64748b)'
                  }}
                >
                  {d}d
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={styles.controlLabel}>Margem:</span>
            <div style={styles.toggleGroup}>
              {[5, 10, 15, 20].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMargemSeguranca(m)}
                  style={{
                    ...styles.toggleBtn,
                    backgroundColor: margemSeguranca === m ? '#7c3aed' : 'transparent',
                    color: margemSeguranca === m ? '#ffffff' : 'var(--text-secondary, #64748b)'
                  }}
                >
                  +{m}%
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={calcularPrevisao}
            style={styles.btnSecondary}
            title="Recalcular Previsão"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* CARDS DE INVESTIMENTO PREVISTO E ECONOMIA */}
      <div style={styles.statsGrid}>
        <div style={{ ...styles.statCard, borderLeft: '4px solid #7c3aed' }}>
          <span style={styles.statLabel}>Investimento</span>
          <h3 style={styles.statValue}>{formatCurrency(totalInvestimento)}</h3>
          <p style={styles.statSub}>
            Estimado para {filteredPredictions.length} itens ({diasPrevisao} dias)
          </p>
        </div>

        <div style={{ ...styles.statCard, borderLeft: '4px solid #059669' }}>
          <span style={styles.statLabel}>Economia</span>
          <h3 style={{ ...styles.statValue, color: '#059669' }}>{formatCurrency(totalEconomia)}</h3>
          <p style={styles.statSub}>
            Economia potencial mitigando descartes históricos
          </p>
        </div>
      </div>

      {/* TABELA DE RECOMENDAÇÕES DA IA */}
      <div style={styles.tableCard}>
        <div style={styles.tableHeaderBar}>
          <div>
            <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary, #0f172a)' }}>
              Grade de Reposição Preditiva
            </h3>
            <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.75rem', color: 'var(--text-secondary, #64748b)' }}>
              Selecione os alimentos para gerar a cesta otimizada de compras
            </p>
          </div>

          <button
            type="button"
            onClick={handleSelectAll}
            style={styles.btnSelectAll}
          >
            {selectedProductIds.length === allPredictions.length ? 'Desmarcar' : 'Selecionar'}
          </button>
        </div>

        <table style={styles.table}>
          <thead>
            <tr style={styles.trHead}>
              <th style={{ ...styles.th, width: '40px', textAlign: 'center' }}>✓</th>
              <th style={styles.th}>Alimento</th>
              <th style={styles.th}>Consumo</th>
              <th style={styles.th}>Desperdício</th>
              <th style={styles.th}>Sugerido</th>
              <th style={styles.th}>Total</th>
              <th style={styles.th}>Economia</th>
              <th style={styles.th}>Alerta</th>
              <th style={styles.th}>Recomendação</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={9} style={{ ...styles.td, textAlign: 'center', color: '#94a3b8', padding: '2.5rem' }}>
                  Calculando previsão com IA...
                </td>
              </tr>
            ) : allPredictions.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ ...styles.td, textAlign: 'center', color: '#94a3b8', padding: '2.5rem' }}>
                  Nenhum dado preditivo disponível.
                </td>
              </tr>
            ) : (
              allPredictions.map((pred) => {
                const isSelected = selectedProductIds.includes(pred.produtoId);
                const statusColor = pred.statusAlerta === 'critico' ? '#dc2626' : pred.statusAlerta === 'atencao' ? '#d97706' : '#059669';
                const statusBg = pred.statusAlerta === 'critico' ? '#fef2f2' : pred.statusAlerta === 'atencao' ? '#fffbeb' : '#ecfdf5';
                const statusLabel = pred.statusAlerta === 'critico' ? 'Crítico' : pred.statusAlerta === 'atencao' ? 'Atenção' : 'Excelente';

                return (
                  <tr
                    key={pred.produtoId}
                    style={{
                      ...styles.trBody,
                      backgroundColor: isSelected ? 'transparent' : 'var(--bg-surface, #f8fafc)',
                      opacity: isSelected ? 1 : 0.6
                    }}
                  >
                    <td style={{ ...styles.td, textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectProduct(pred.produtoId)}
                        style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: '#7c3aed' }}
                      />
                    </td>
                    <td style={{ ...styles.td, fontWeight: 700, color: 'var(--text-primary, #0f172a)' }}>
                      {pred.nome}
                      <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-secondary, #64748b)', fontWeight: 400 }}>
                        {formatCurrency(pred.custoUnitario)} / {pred.unidade}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <span style={{ fontWeight: 600 }}>
                        {pred.consumoMedioDiario} {pred.unidade}
                      </span>
                      <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-secondary, #64748b)' }}>
                        por dia
                      </span>
                    </td>
                    <td style={styles.td}>
                      <span style={{ fontWeight: 700, color: statusColor }}>
                        {pred.taxaDesperdicioPct}%
                      </span>
                      <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-secondary, #64748b)' }}>
                        {pred.sobraMedioDiario} {pred.unidade}/dia
                      </span>
                    </td>
                    <td style={{ ...styles.td, fontWeight: 800, color: '#7c3aed' }}>
                      {pred.quantidadeSugerida} {pred.unidade}
                    </td>
                    <td style={{ ...styles.td, fontWeight: 700, color: 'var(--text-primary, #0f172a)' }}>
                      {formatCurrency(pred.custoEstimadoTotal)}
                    </td>
                    <td style={{ ...styles.td, fontWeight: 700, color: '#059669' }}>
                      {formatCurrency(pred.economiaEstimada)}
                    </td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.statusBadge,
                        backgroundColor: statusBg,
                        color: statusColor,
                        border: `1px solid ${statusColor}40`
                      }}>
                        {statusLabel}
                      </span>
                    </td>
                    <td style={{ ...styles.td, fontSize: '0.78rem', color: 'var(--text-secondary, #64748b)', maxWidth: '280px' }}>
                      {pred.recomendacaoIA}
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
    backgroundColor: '#f5f3ff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  controlLabel: {
    fontSize: '0.75rem',
    fontWeight: 700,
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
    padding: '0.25rem 0.5rem',
    borderRadius: '6px',
    fontSize: '0.75rem',
    fontWeight: 700,
    cursor: 'pointer'
  },
  btnSecondary: {
    padding: '0.4rem 0.6rem',
    borderRadius: '8px',
    border: '1px solid var(--border-color, #cbd5e1)',
    backgroundColor: 'var(--bg-surface, #f8fafc)',
    color: 'var(--text-primary, #1e293b)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
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
    fontSize: '1.45rem',
    fontWeight: 800,
    color: 'var(--text-primary, #0f172a)'
  },
  statSub: {
    margin: 0,
    fontSize: '0.72rem',
    color: 'var(--text-secondary, #94a3b8)'
  },
  tableCard: {
    backgroundColor: 'var(--bg-card, #ffffff)',
    borderRadius: '12px',
    border: '1px solid var(--border-color, #e2e8f0)',
    overflow: 'hidden'
  },
  tableHeaderBar: {
    padding: '1rem 1.25rem',
    borderBottom: '1px solid var(--border-color, #e2e8f0)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '0.5rem'
  },
  btnSelectAll: {
    padding: '0.35rem 0.75rem',
    borderRadius: '6px',
    border: '1px solid var(--border-color, #cbd5e1)',
    backgroundColor: 'var(--bg-surface, #f8fafc)',
    color: 'var(--text-primary, #0f172a)',
    fontSize: '0.75rem',
    fontWeight: 700,
    cursor: 'pointer'
  },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
  trHead: { backgroundColor: 'var(--bg-surface, #f8fafc)', borderBottom: '1px solid var(--border-color, #e2e8f0)' },
  th: { padding: '0.75rem 0.85rem', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary, #64748b)' },
  trBody: { borderBottom: '1px solid var(--border-color, #f1f5f9)' },
  td: { padding: '0.75rem 0.85rem', fontSize: '0.825rem', verticalAlign: 'middle' },
  statusBadge: {
    display: 'inline-block',
    padding: '0.15rem 0.5rem',
    borderRadius: '6px',
    fontSize: '0.7rem',
    fontWeight: 700
  }
};
