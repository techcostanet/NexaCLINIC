import React from 'react';
import { 
  X, TrendingUp, TrendingDown, Clock, Building2, Calendar, 
  DollarSign, Package, Award, ArrowRight, BarChart3, AlertCircle
} from 'lucide-react';

export default function PriceHistoryModal({ 
  isOpen, 
  onClose, 
  item, 
  quotations = [], 
  purchases = [] 
}) {
  if (!isOpen || !item) return null;

  // Extract all historical price events for this item from quotations and purchases
  const historyEvents = [];

  // 1. Check completed/homologated quotations
  (quotations || []).forEach(q => {
    if (q.status === 'Homologada' && q.purchaseOrders && Array.isArray(q.purchaseOrders)) {
      q.purchaseOrders.forEach(po => {
        (po.items || []).forEach(poi => {
          if (poi.productId === item.id || poi.productName?.toLowerCase().trim() === item.name?.toLowerCase().trim()) {
            historyEvents.push({
              source: 'Cotação Homologada',
              code: po.code || q.code,
              date: po.createdAt || q.updatedAt || q.createdAt,
              supplierName: po.supplierName,
              quantity: poi.quantity,
              unit: poi.unit || item.unit || 'un',
              unitPrice: poi.unitPrice,
              totalPrice: poi.totalPrice,
              brand: poi.brand || '-'
            });
          }
        });
      });
    }
  });

  // 2. Check finalized purchases / historical orders
  (purchases || []).forEach(p => {
    if (p.status === 'Finalizado' || p.status === 'Entregue') {
      const pItems = p.items && Array.isArray(p.items) ? p.items : (p.productName ? [p] : []);
      pItems.forEach(pi => {
        if (pi.productId === item.id || pi.productName?.toLowerCase().trim() === item.name?.toLowerCase().trim()) {
          const unitPrice = parseFloat(pi.price || p.price || 0);
          if (unitPrice > 0) {
            historyEvents.push({
              source: 'Pedido Direto',
              code: p.code || 'PED',
              date: p.updatedAt || p.date || p.createdAt,
              supplierName: p.selectedSupplierName || p.supplier || 'Fornecedor Cadastrado',
              quantity: pi.quantity || 1,
              unit: pi.unit || item.unit || 'un',
              unitPrice: unitPrice,
              totalPrice: unitPrice * (pi.quantity || 1),
              brand: pi.brand || '-'
            });
          }
        }
      });
    }
  });

  // If item has current lastPrice / averageCost recorded, add it as baseline
  const currentLastPrice = parseFloat(item.lastPrice || item.averageCost || 0);

  // Sort chronological descending
  historyEvents.sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());

  // Metrics
  const minPrice = historyEvents.length > 0 
    ? Math.min(...historyEvents.map(e => e.unitPrice)) 
    : currentLastPrice;
  const maxPrice = historyEvents.length > 0 
    ? Math.max(...historyEvents.map(e => e.unitPrice)) 
    : currentLastPrice;
  const avgPrice = historyEvents.length > 0
    ? historyEvents.reduce((acc, e) => acc + e.unitPrice, 0) / historyEvents.length
    : currentLastPrice;

  return (
    <div style={styles.overlay}>
      <div style={styles.modalContainer}>
        {/* Header */}
        <div style={styles.modalHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BarChart3 size={20} color="#0284c7" />
            <div>
              <h2 style={styles.modalTitle}>Histórico de Preços & Inflação de Insumo</h2>
              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                Auditoria de compras anteriores e oscilação de mercado
              </span>
            </div>
          </div>
          <button onClick={onClose} style={styles.closeBtn}>×</button>
        </div>

        <div style={styles.modalBody}>
          {/* Item Highlight Header */}
          <div style={styles.itemHeaderCard}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <strong style={{ fontSize: '1.05rem', color: '#0f172a' }}>{item.name}</strong>
                {item.code && <span style={styles.codeBadge}>#{item.code}</span>}
              </div>
              <span style={{ fontSize: '0.78rem', color: '#64748b', display: 'block', marginTop: '0.2rem' }}>
                Categoria: <strong>{item.category || 'Geral'}</strong> • Unidade: <strong>{item.unit || 'un'}</strong>
              </span>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block', textTransform: 'uppercase', fontWeight: '700' }}>
                Último Preço Cadastrado
              </span>
              <strong style={{ fontSize: '1.3rem', color: '#0284c7', fontWeight: '900' }}>
                {currentLastPrice > 0 ? currentLastPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'Não informado'}
              </strong>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div style={styles.metricsGrid}>
            <div style={styles.metricCard}>
              <span style={styles.metricLabel}>Menor Preço Histórico</span>
              <strong style={{ ...styles.metricValue, color: '#16a34a' }}>
                {minPrice > 0 ? minPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '-'}
              </strong>
              <span style={styles.metricHint}>Melhor compra registrada</span>
            </div>

            <div style={styles.metricCard}>
              <span style={styles.metricLabel}>Preço Médio Ponderado</span>
              <strong style={{ ...styles.metricValue, color: '#0284c7' }}>
                {avgPrice > 0 ? avgPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '-'}
              </strong>
              <span style={styles.metricHint}>Média de todas as compras</span>
            </div>

            <div style={styles.metricCard}>
              <span style={styles.metricLabel}>Maior Preço Pago</span>
              <strong style={{ ...styles.metricValue, color: '#dc2626' }}>
                {maxPrice > 0 ? maxPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '-'}
              </strong>
              <span style={styles.metricHint}>Pico de valor registrado</span>
            </div>

            <div style={styles.metricCard}>
              <span style={styles.metricLabel}>Total de Entradas / Compras</span>
              <strong style={{ ...styles.metricValue, color: '#334155' }}>
                {historyEvents.length}
              </strong>
              <span style={styles.metricHint}>Registros auditados</span>
            </div>
          </div>

          {/* History Records Table */}
          <div style={styles.tableCard}>
            <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc' }}>
              <strong style={{ fontSize: '0.85rem', color: '#0f172a' }}>Linha do Tempo de Preços Praticados</strong>
              <span style={{ fontSize: '0.74rem', color: '#64748b' }}>Ordenado por data mais recente</span>
            </div>

            {historyEvents.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
                <Clock size={32} color="#94a3b8" style={{ marginBottom: '0.5rem' }} />
                <p style={{ margin: 0, fontWeight: '600' }}>Nenhuma compra anterior registrada para este insumo.</p>
                <span style={{ fontSize: '0.78rem' }}>Os registros serão gerados automaticamente conforme as cotações forem homologadas.</span>
              </div>
            ) : (
              <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                <table style={styles.table}>
                  <thead>
                    <tr style={styles.theadRow}>
                      <th style={styles.th}>Data</th>
                      <th style={styles.th}>Documento / Origem</th>
                      <th style={styles.th}>Fornecedor</th>
                      <th style={{ ...styles.th, textAlign: 'center' }}>Qtd</th>
                      <th style={{ ...styles.th, textAlign: 'right' }}>Preço Unitário</th>
                      <th style={{ ...styles.th, textAlign: 'right' }}>Valor Total</th>
                      <th style={{ ...styles.th, textAlign: 'center' }}>Variação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historyEvents.map((ev, index) => {
                      const prevEvent = historyEvents[index + 1];
                      let varianceBadge = null;
                      if (prevEvent && prevEvent.unitPrice > 0) {
                        const diffPercent = ((ev.unitPrice - prevEvent.unitPrice) / prevEvent.unitPrice) * 100;
                        if (diffPercent < 0) {
                          varianceBadge = (
                            <span style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: '700', backgroundColor: '#dcfce7', padding: '0.1rem 0.35rem', borderRadius: '4px' }}>
                              ↓ {Math.abs(diffPercent).toFixed(1)}% (Economia)
                            </span>
                          );
                        } else if (diffPercent > 0) {
                          varianceBadge = (
                            <span style={{ fontSize: '0.72rem', color: '#dc2626', fontWeight: '700', backgroundColor: '#fee2e2', padding: '0.1rem 0.35rem', borderRadius: '4px' }}>
                              ↑ +{diffPercent.toFixed(1)}% (Aumento)
                            </span>
                          );
                        } else {
                          varianceBadge = <span style={{ fontSize: '0.72rem', color: '#64748b' }}>0.0%</span>;
                        }
                      } else {
                        varianceBadge = <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Base</span>;
                      }

                      return (
                        <tr key={index} style={styles.trRow}>
                          <td style={styles.td}>
                            <span style={{ fontSize: '0.8rem', color: '#334155', fontWeight: '600' }}>
                              {ev.date ? new Date(ev.date).toLocaleDateString('pt-BR') : '-'}
                            </span>
                          </td>
                          <td style={styles.td}>
                            <strong style={{ fontSize: '0.8rem', color: '#0369a1' }}>{ev.code}</strong>
                            <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block' }}>{ev.source}</span>
                          </td>
                          <td style={styles.td}>
                            <strong style={{ fontSize: '0.82rem', color: '#0f172a' }}>{ev.supplierName}</strong>
                            {ev.brand && ev.brand !== '-' && <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block' }}>Marca: {ev.brand}</span>}
                          </td>
                          <td style={{ ...styles.td, textAlign: 'center', fontWeight: '700' }}>
                            {ev.quantity} {ev.unit}
                          </td>
                          <td style={{ ...styles.td, textAlign: 'right', fontWeight: '800', color: '#0f172a' }}>
                            {ev.unitPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </td>
                          <td style={{ ...styles.td, textAlign: 'right', color: '#475569', fontSize: '0.8rem' }}>
                            {ev.totalPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </td>
                          <td style={{ ...styles.td, textAlign: 'center' }}>
                            {varianceBadge}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={styles.modalFooter}>
          <button onClick={onClose} style={styles.btnSecondary}>
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 99999,
    padding: '1rem'
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    width: '100%',
    maxWidth: '840px',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
  },
  modalHeader: {
    padding: '1rem 1.25rem',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8fafc'
  },
  modalTitle: {
    margin: 0,
    fontSize: '1rem',
    fontWeight: '800',
    color: '#0f172a'
  },
  closeBtn: {
    border: 'none',
    backgroundColor: 'transparent',
    fontSize: '1.4rem',
    color: '#94a3b8',
    cursor: 'pointer',
    lineHeight: 1
  },
  modalBody: {
    padding: '1.25rem',
    overflowY: 'auto',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  itemHeaderCard: {
    backgroundColor: '#f0f9ff',
    border: '1px solid #bae6fd',
    borderRadius: '8px',
    padding: '1rem 1.25rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1rem'
  },
  codeBadge: {
    fontSize: '0.72rem',
    fontWeight: '700',
    color: '#0369a1',
    backgroundColor: '#fff',
    border: '1px solid #bae6fd',
    padding: '0.1rem 0.4rem',
    borderRadius: '4px'
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
    gap: '0.75rem'
  },
  metricCard: {
    backgroundColor: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '0.75rem',
    boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
  },
  metricLabel: {
    fontSize: '0.72rem',
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    display: 'block'
  },
  metricValue: {
    fontSize: '1.15rem',
    fontWeight: '900',
    display: 'block',
    margin: '0.2rem 0'
  },
  metricHint: {
    fontSize: '0.68rem',
    color: '#94a3b8',
    display: 'block'
  },
  tableCard: {
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    overflow: 'hidden',
    backgroundColor: '#fff'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.8rem'
  },
  theadRow: {
    backgroundColor: '#f8fafc',
    borderBottom: '1px solid #e2e8f0'
  },
  th: {
    padding: '0.55rem 0.75rem',
    fontWeight: '700',
    color: '#475569',
    textTransform: 'uppercase',
    fontSize: '0.7rem',
    letterSpacing: '0.02em'
  },
  trRow: {
    borderBottom: '1px solid #f1f5f9'
  },
  td: {
    padding: '0.6rem 0.75rem',
    verticalAlign: 'middle'
  },
  modalFooter: {
    padding: '0.85rem 1.25rem',
    borderTop: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'flex-end',
    backgroundColor: '#f8fafc'
  },
  btnSecondary: {
    backgroundColor: '#fff',
    color: '#475569',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    padding: '0.45rem 1rem',
    fontWeight: '700',
    fontSize: '0.82rem',
    cursor: 'pointer'
  }
};
