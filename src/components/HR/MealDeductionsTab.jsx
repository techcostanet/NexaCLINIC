import React, { useState, useEffect, useMemo } from 'react';
import {
  Utensils,
  Sun,
  Moon,
  Search,
  Calendar,
  KeyRound,
  Download,
  FileText,
  DollarSign,
  Users,
  RefreshCw,
  Eye,
  CheckCircle2,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import {
  getMonthlyMealSummary,
  resetEmployeeMealPassword,
  getTodayDateStr
} from '../../services/firebase/mealService';
import { formatCurrency, formatDateBR } from '../../services/firebase/foodWasteService';

export default function MealDeductionsTab() {
  const currentMonth = getTodayDateStr().slice(0, 7);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [summaryData, setSummaryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal de Detalhes
  const [selectedEmployeeOrders, setSelectedEmployeeOrders] = useState(null);

  // Estado de Reset de Senha
  const [resettingId, setResettingId] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);

  const loadSummary = async () => {
    setLoading(true);
    try {
      const data = await getMonthlyMealSummary(selectedMonth);
      setSummaryData(data);
    } catch (err) {
      console.error('Erro ao buscar dados de marmitas no RH:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSummary();
  }, [selectedMonth]);

  // Estatísticas globais do mês
  const stats = useMemo(() => {
    const totalMarmitas = summaryData.reduce((sum, d) => sum + d.totalOrders, 0);
    const totalAlmoco = summaryData.reduce((sum, d) => sum + d.totalAlmoco, 0);
    const totalJantar = summaryData.reduce((sum, d) => sum + d.totalJantar, 0);
    const totalDiscount = summaryData.reduce((sum, d) => sum + d.totalDiscount, 0);
    const totalCost = summaryData.reduce((sum, d) => sum + d.totalCost, 0);

    return {
      marmitas: totalMarmitas,
      colaboradores: summaryData.length,
      almoco: totalAlmoco,
      jantar: totalJantar,
      desconto: totalDiscount,
      fornecedor: totalCost
    };
  }, [summaryData]);

  // Filtro de colaboradores
  const filteredList = useMemo(() => {
    if (!search) return summaryData;
    const q = search.toLowerCase();
    return summaryData.filter(d => {
      const name = (d.employeeName || '').toLowerCase();
      const cpf = (d.employeeCpf || '').replace(/\D/g, '');
      const sector = (d.sector || '').toLowerCase();
      return name.includes(q) || cpf.includes(q.replace(/\D/g, '')) || sector.includes(q);
    });
  }, [summaryData, search]);

  // Ação de Reset de Senha pelo RH
  const handleResetPassword = async (emp) => {
    if (!window.confirm(`Deseja resetar a senha de marmitas do colaborador ${emp.employeeName}? A nova senha voltará a ser os 4 primeiros dígitos do CPF.`)) {
      return;
    }

    setResettingId(emp.employeeId);
    try {
      await resetEmployeeMealPassword(emp.employeeId);
      setToastMsg({ type: 'success', text: `Senha de ${emp.employeeName} resetada com sucesso para o padrão do CPF.` });
    } catch (err) {
      setToastMsg({ type: 'error', text: 'Erro ao resetar senha: ' + err.message });
    } finally {
      setResettingId(null);
    }
  };

  // Exportar relatório em CSV para folha
  const handleExportCsv = () => {
    if (summaryData.length === 0) return;
    const headers = ['Colaborador', 'CPF', 'Setor', 'Almoço', 'Jantar', 'Total Marmitas', 'Valor Desconto (R$)'];
    const rows = summaryData.map(d => [
      `"${d.employeeName}"`,
      `"${d.employeeCpf}"`,
      `"${d.sector}"`,
      d.totalAlmoco,
      d.totalJantar,
      d.totalOrders,
      d.totalDiscount.toFixed(2)
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `desconto_marmitas_rh_${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={styles.container}>
      {toastMsg && (
        <div style={{
          ...styles.toast,
          backgroundColor: toastMsg.type === 'success' ? '#dcfce7' : '#fee2e2',
          color: toastMsg.type === 'success' ? '#166534' : '#991b1b',
          borderColor: toastMsg.type === 'success' ? '#86efac' : '#fca5a5'
        }}>
          {toastMsg.type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
          <span style={{ flex: 1, fontSize: '0.85rem' }}>{toastMsg.text}</span>
          <button onClick={() => setToastMsg(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>×</button>
        </div>
      )}

      {/* BARRA SUPERIOR DE CONTROLES */}
      <div style={styles.topBar}>
        <div style={styles.monthSelector}>
          <Calendar size={18} color="#0284c7" />
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            style={styles.monthInput}
          />
        </div>

        <div style={styles.topActions}>
          <button
            onClick={loadSummary}
            style={styles.actionBtnOutline}
            title="Atualizar dados"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            Atualizar
          </button>

          <button
            onClick={handleExportCsv}
            disabled={summaryData.length === 0}
            style={styles.actionBtnPrimary}
            title="Exportar planilha para folha de pagamento"
          >
            <Download size={15} />
            Exportar
          </button>
        </div>
      </div>

      {/* STAT CARDS */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <span style={styles.statTitle}>Consumo</span>
          <strong style={styles.statNumber}>{stats.marmitas}</strong>
          <span style={styles.statSub}>marmitas no mês</span>
        </div>

        <div style={styles.statCard}>
          <span style={styles.statTitle}>Colaboradores</span>
          <strong style={{ ...styles.statNumber, color: '#0284c7' }}>{stats.colaboradores}</strong>
          <span style={styles.statSub}>funcionários atendidos</span>
        </div>

        <div style={styles.statCard}>
          <span style={styles.statTitle}>Desconto</span>
          <strong style={{ ...styles.statNumber, color: '#dc2626' }}>
            {formatCurrency(stats.desconto)}
          </strong>
          <span style={styles.statSub}>total a descontar em folha</span>
        </div>

        <div style={styles.statCard}>
          <span style={styles.statTitle}>Fornecedor</span>
          <strong style={styles.statNumber}>
            {formatCurrency(stats.fornecedor)}
          </strong>
          <span style={styles.statSub}>fatura total terceirizada</span>
        </div>
      </div>

      {/* BARRA DE PESQUISA */}
      <div style={styles.filterBar}>
        <div style={styles.searchWrapper}>
          <Search size={16} style={styles.searchIcon} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Pesquisar por colaborador, CPF ou setor..."
            style={styles.searchInput}
          />
        </div>
      </div>

      {/* TABELA DE DESCONTOS CONSOLIDADA */}
      <div style={styles.tableCard}>
        {loading ? (
          <div style={styles.loadingBox}>
            <RefreshCw size={24} className="animate-spin" color="#0284c7" />
            <span>Processando fechamento mensal de marmitas...</span>
          </div>
        ) : filteredList.length === 0 ? (
          <div style={styles.emptyBox}>
            <Utensils size={36} color="#cbd5e1" style={{ marginBottom: '8px' }} />
            <p style={{ margin: 0, fontWeight: 600, color: '#64748b' }}>Nenhum consumo de marmita registrado neste mês.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Colaborador</th>
                  <th style={styles.th}>CPF</th>
                  <th style={styles.th}>Setor</th>
                  <th style={styles.th}>Almoço</th>
                  <th style={styles.th}>Jantar</th>
                  <th style={styles.th}>Marmitas</th>
                  <th style={styles.th}>Desconto</th>
                  <th style={{ ...styles.th, textAlign: 'center' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredList.map(item => (
                  <tr key={item.employeeId} style={styles.tr}>
                    <td style={{ ...styles.td, fontWeight: 600 }}>{item.employeeName}</td>
                    <td style={styles.td}>{item.employeeCpf || '—'}</td>
                    <td style={styles.td}>{item.sector}</td>
                    <td style={styles.td}>{item.totalAlmoco}</td>
                    <td style={styles.td}>{item.totalJantar}</td>
                    <td style={{ ...styles.td, fontWeight: 700, color: '#0284c7' }}>
                      {item.totalOrders}
                    </td>
                    <td style={{ ...styles.td, fontWeight: 700, color: '#dc2626' }}>
                      {formatCurrency(item.totalDiscount)}
                    </td>
                    <td style={{ ...styles.td, textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button
                          onClick={() => setSelectedEmployeeOrders(item)}
                          title="Visualizar histórico de datas"
                          style={styles.detailBtn}
                        >
                          <Eye size={14} />
                          Detalhes
                        </button>

                        <button
                          onClick={() => handleResetPassword(item)}
                          disabled={resettingId === item.employeeId}
                          title="Resetar senha para os 4 primeiros dígitos do CPF"
                          style={styles.resetBtn}
                        >
                          <RotateCcw size={14} />
                          Resetar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL DETALHES DAS MARMITAS DO COLABORADOR */}
      {selectedEmployeeOrders && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <div style={styles.modalHeader}>
              <div>
                <h3 style={styles.modalTitle}>Histórico</h3>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  {selectedEmployeeOrders.employeeName} ({selectedEmployeeOrders.sector})
                </span>
              </div>
              <button onClick={() => setSelectedEmployeeOrders(null)} style={styles.modalCloseBtn}>×</button>
            </div>

            <div style={styles.modalBody}>
              <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Data</th>
                      <th style={styles.th}>Refeição</th>
                      <th style={styles.th}>Status</th>
                      <th style={styles.th}>Desconto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedEmployeeOrders.orders.map(o => (
                      <tr key={o.id} style={styles.tr}>
                        <td style={styles.td}>{formatDateBR(o.date)}</td>
                        <td style={styles.td}>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontWeight: 600,
                            color: o.mealType === 'jantar' ? '#7c3aed' : '#d97706'
                          }}>
                            {o.mealType === 'jantar' ? <Moon size={13} /> : <Sun size={13} />}
                            {o.mealType === 'jantar' ? 'Jantar' : 'Almoço'}
                          </span>
                        </td>
                        <td style={styles.td}>
                          <span style={{
                            ...styles.statusBadge,
                            backgroundColor: o.status === 'entregue' ? '#dcfce7' : '#e0f2fe',
                            color: o.status === 'entregue' ? '#166534' : '#0369a1'
                          }}>
                            {o.status === 'entregue' ? 'Entregue' : 'Solicitado'}
                          </span>
                        </td>
                        <td style={{ ...styles.td, fontWeight: 600 }}>
                          {formatCurrency(o.discountValue)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div style={styles.modalFooter}>
              <div style={{ flex: 1, fontWeight: 700, fontSize: '0.9rem' }}>
                Total: {selectedEmployeeOrders.totalOrders} marmitas ({formatCurrency(selectedEmployeeOrders.totalDiscount)})
              </div>
              <button onClick={() => setSelectedEmployeeOrders(null)} style={styles.actionBtnPrimary}>
                Fechar
              </button>
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
    gap: '1.25rem'
  },
  toast: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1px solid'
  },
  topBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '12px',
    backgroundColor: '#ffffff',
    padding: '12px 18px',
    borderRadius: '12px',
    border: '1px solid #e2e8f0'
  },
  monthSelector: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  monthInput: {
    padding: '8px 12px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    fontSize: '0.9rem',
    fontWeight: 600,
    outline: 'none'
  },
  topActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  actionBtnOutline: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 14px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    backgroundColor: '#ffffff',
    color: '#334155',
    fontWeight: 600,
    fontSize: '0.85rem',
    cursor: 'pointer'
  },
  actionBtnPrimary: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 14px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#0284c7',
    color: '#ffffff',
    fontWeight: 600,
    fontSize: '0.85rem',
    cursor: 'pointer'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '12px'
  },
  statCard: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  statTitle: {
    fontSize: '0.75rem',
    fontWeight: 700,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.04em'
  },
  statNumber: {
    fontSize: '1.6rem',
    fontWeight: 800,
    color: '#0f172a'
  },
  statSub: {
    fontSize: '0.75rem',
    color: '#94a3b8'
  },
  filterBar: {
    backgroundColor: '#ffffff',
    padding: '12px 18px',
    borderRadius: '12px',
    border: '1px solid #e2e8f0'
  },
  searchWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },
  searchIcon: {
    position: 'absolute',
    left: '10px',
    color: '#94a3b8'
  },
  searchInput: {
    width: '100%',
    padding: '8px 12px 8px 34px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    fontSize: '0.85rem',
    outline: 'none'
  },
  tableCard: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    overflow: 'hidden'
  },
  loadingBox: {
    padding: '3rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    color: '#64748b',
    fontSize: '0.9rem'
  },
  emptyBox: {
    padding: '3.5rem 1rem',
    textAlign: 'center'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.85rem'
  },
  th: {
    textAlign: 'left',
    padding: '10px 14px',
    backgroundColor: '#f8fafc',
    color: '#475569',
    fontWeight: 700,
    borderBottom: '1px solid #e2e8f0',
    fontSize: '0.75rem',
    textTransform: 'uppercase',
    letterSpacing: '0.04em'
  },
  tr: {
    borderBottom: '1px solid #f1f5f9'
  },
  td: {
    padding: '12px 14px',
    color: '#334155',
    verticalAlign: 'middle'
  },
  statusBadge: {
    display: 'inline-block',
    padding: '3px 8px',
    borderRadius: '999px',
    fontSize: '0.75rem',
    fontWeight: 700,
    textTransform: 'uppercase'
  },
  detailBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '5px 9px',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    backgroundColor: '#ffffff',
    color: '#334155',
    fontSize: '0.75rem',
    fontWeight: 600,
    cursor: 'pointer'
  },
  resetBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '5px 9px',
    borderRadius: '6px',
    border: '1px solid #fed7aa',
    backgroundColor: '#fff7ed',
    color: '#ea580c',
    fontSize: '0.75rem',
    fontWeight: 600,
    cursor: 'pointer'
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
    padding: '1rem'
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderRadius: '14px',
    width: '100%',
    maxWidth: '540px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.25)',
    overflow: 'hidden'
  },
  modalHeader: {
    padding: '14px 18px',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc'
  },
  modalTitle: {
    margin: 0,
    fontSize: '1.05rem',
    fontWeight: 700,
    color: '#0f172a'
  },
  modalCloseBtn: {
    background: 'none',
    border: 'none',
    fontSize: '1.4rem',
    color: '#64748b',
    cursor: 'pointer'
  },
  modalBody: {
    padding: '14px 18px'
  },
  modalFooter: {
    padding: '12px 18px',
    borderTop: '1px solid #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc'
  }
};
