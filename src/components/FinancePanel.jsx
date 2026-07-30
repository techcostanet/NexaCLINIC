import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  FileText, 
  Upload, 
  Trash2, 
  Check, 
  AlertCircle, 
  Calendar, 
  Briefcase, 
  Plus, 
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Settings,
  Eye,
  EyeOff,
  Save,
  Clock
} from 'lucide-react';
import { dbService } from '../firebase';

export default function FinancePanel() {
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'payable' | 'receivable' | 'apac'
  const [payableList, setPayableList] = useState([]);
  const [receivableList, setReceivableList] = useState([]);
  const [xmlImports, setXmlImports] = useState([]);
  const [loading, setLoading] = useState(true);

  // Custom Dashboard Layout for Financial Operator
  const DEFAULT_FINANCE_LAYOUT = [
    { id: 'payables_today', name: '🔴 Contas a Pagar Hoje & Vencidas', size: 'small', visible: true },
    { id: 'receivables_today', name: '🟢 Contas a Receber Hoje', size: 'small', visible: true },
    { id: 'cash_flow_summary', name: '💵 Saldo em Caixa (Realizado)', size: 'small', visible: true },
    { id: 'overdue_alerts', name: '⚠️ Títulos em Atraso', size: 'small', visible: true },
    { id: 'cash_flow_bar', name: '📊 Fluxo de Caixa (Entradas vs Saídas)', size: 'medium', visible: true },
    { id: 'cost_distribution', name: '🍰 Distribuição de Despesas por Categoria', size: 'medium', visible: true },
    { id: 'ebitda', name: '📈 EBITDA Realizado (Visão Executiva)', size: 'small', visible: false },
    { id: 'apac_glosa', name: '📋 Glosa de Convênios & APACs', size: 'small', visible: true }
  ];

  const [dashboardLayout, setDashboardLayout] = useState(() => {
    try {
      const saved = localStorage.getItem('sistema_indicadores_finance_dashboard_layout');
      return saved ? JSON.parse(saved) : DEFAULT_FINANCE_LAYOUT;
    } catch {
      return DEFAULT_FINANCE_LAYOUT;
    }
  });

  const [isCustomizingDashboard, setIsCustomizingDashboard] = useState(false);

  const handleSaveDashboardLayout = (newLayout) => {
    setDashboardLayout(newLayout);
    try {
      localStorage.setItem('sistema_indicadores_finance_dashboard_layout', JSON.stringify(newLayout));
    } catch (e) {
      console.error(e);
    }
  };

  const handleMoveCard = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= dashboardLayout.length) return;
    const updated = [...dashboardLayout];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    handleSaveDashboardLayout(updated);
  };

  const handleChangeCardSize = (id, newSize) => {
    const updated = dashboardLayout.map(card => card.id === id ? { ...card, size: newSize } : card);
    handleSaveDashboardLayout(updated);
  };

  const handleToggleCardVisibility = (id) => {
    const updated = dashboardLayout.map(card => card.id === id ? { ...card, visible: !card.visible } : card);
    handleSaveDashboardLayout(updated);
  };

  const handleResetDashboardLayout = () => {
    handleSaveDashboardLayout(DEFAULT_FINANCE_LAYOUT);
  };

  // Form states for manual additions
  const [showAddPayable, setShowAddPayable] = useState(false);
  const [showAddReceivable, setShowAddReceivable] = useState(false);

  const [newPayable, setNewPayable] = useState({
    supplier: '',
    cnpj: '',
    description: '',
    amount: '',
    dueDate: '',
    category: 'Insumo Clínico',
    invoiceNumber: ''
  });

  const [newReceivable, setNewReceivable] = useState({
    client: '',
    category: 'Convênio',
    description: '',
    amount: '',
    dueDate: '',
    invoiceNumber: ''
  });

  // Filter states
  const [payableFilter, setPayableFilter] = useState('Todos'); // 'Todos' | 'Pendente' | 'Pago'
  const [receivableFilter, setReceivableFilter] = useState('Todos'); // 'Todos' | 'Pendente' | 'Pago'

  // Load database tables
  const loadData = async () => {
    setLoading(true);
    try {
      const pay = await dbService.getAccountsPayable();
      const rec = await dbService.getAccountsReceivable();
      const xmls = await dbService.getXmlImports();

      setPayableList(pay);
      setReceivableList(rec);
      setXmlImports(xmls);
    } catch (err) {
      console.error('Erro ao buscar dados financeiros:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // XML drag and drop simulation
  const handleXmlSimulatedImport = async () => {
    // Generate mock XML data representing a medical supply invoice
    const mockXmlData = {
      filename: `NFe-312607${Math.floor(Math.random() * 100000000000000)}.xml`,
      supplier: Math.random() > 0.5 ? 'Fresenius Medical Care' : 'Baxter Hospitalar Ltda',
      cnpj: Math.random() > 0.5 ? '98.765.432/0001-21' : '12.345.678/0001-90',
      invoiceNumber: Math.floor(1000 + Math.random() * 9000).toString(),
      amount: (15000 + Math.random() * 20000).toFixed(2),
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10)
    };

    try {
      await dbService.saveXmlImport(mockXmlData);
      alert(`XML importado com sucesso!\nFornecedor: ${mockXmlData.supplier}\nNF-e nº: ${mockXmlData.invoiceNumber}\nValor: R$ ${parseFloat(mockXmlData.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  // Add Manual Payable
  const handleAddPayable = async (e) => {
    e.preventDefault();
    if (!newPayable.supplier || !newPayable.amount || !newPayable.dueDate) return;

    try {
      await dbService.saveAccountsPayable({
        ...newPayable,
        amount: parseFloat(newPayable.amount),
        status: 'Pendente',
        paymentDate: ''
      });
      setShowAddPayable(false);
      setNewPayable({
        supplier: '',
        cnpj: '',
        description: '',
        amount: '',
        dueDate: '',
        category: 'Insumo Clínico',
        invoiceNumber: ''
      });
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  // Add Manual Receivable
  const handleAddReceivable = async (e) => {
    e.preventDefault();
    if (!newReceivable.client || !newReceivable.amount || !newReceivable.dueDate) return;

    try {
      await dbService.saveAccountsReceivable({
        ...newReceivable,
        amount: parseFloat(newReceivable.amount),
        status: 'Pendente',
        receivedDate: ''
      });
      setShowAddReceivable(false);
      setNewReceivable({
        client: '',
        category: 'Convênio',
        description: '',
        amount: '',
        dueDate: '',
        invoiceNumber: ''
      });
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  // Mark Payable as Paid
  const handleTogglePayableStatus = async (item) => {
    const nextStatus = item.status === 'Pago' ? 'Pendente' : 'Pago';
    const paymentDate = nextStatus === 'Pago' ? new Date().toISOString().substring(0, 10) : '';
    try {
      await dbService.saveAccountsPayable({
        ...item,
        status: nextStatus,
        paymentDate
      });

      // Synchronize back to Purchasing Order if applicable
      if (item.purchaseId && dbService.updatePurchase) {
        await dbService.updatePurchase(item.purchaseId, {
          paymentStatus: nextStatus === 'Pago' ? 'Quitado' : 'Pendente'
        });
      }

      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  // Mark Receivable as Paid
  const handleToggleReceivableStatus = async (item) => {
    const nextStatus = item.status === 'Pago' ? 'Pendente' : 'Pago';
    const receivedDate = nextStatus === 'Pago' ? new Date().toISOString().substring(0, 10) : '';
    try {
      await dbService.saveAccountsReceivable({
        ...item,
        status: nextStatus,
        receivedDate
      });
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  // Delete Payable
  const handleDeletePayable = async (id) => {
    if (confirm('Deseja realmente excluir este lançamento financeiro?')) {
      try {
        await dbService.deleteAccountsPayable(id);
        loadData();
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Delete Receivable
  const handleDeleteReceivable = async (id) => {
    if (confirm('Deseja realmente excluir este recebimento?')) {
      try {
        await dbService.deleteAccountsReceivable(id);
        loadData();
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Calculate Metrics
  const totalReceivables = receivableList.reduce((acc, curr) => acc + curr.amount, 0);
  const receivedAmount = receivableList.filter(r => r.status === 'Pago').reduce((acc, curr) => acc + curr.amount, 0);
  const pendingReceivables = totalReceivables - receivedAmount;

  const totalPayables = payableList.reduce((acc, curr) => acc + curr.amount, 0);
  const paidAmount = payableList.filter(p => p.status === 'Pago').reduce((acc, curr) => acc + curr.amount, 0);
  const pendingPayables = totalPayables - paidAmount;

  const ebitda = receivedAmount - paidAmount; // Operacional líquido realizado
  const ebitdaProjected = totalReceivables - totalPayables; // Projetado mensal
  
  // Categorized expenses
  const categories = {};
  payableList.forEach(p => {
    categories[p.category] = (categories[p.category] || 0) + p.amount;
  });

  // Operational Dashboard Calculations (Today & Overdue)
  const todayStr = new Date().toISOString().substring(0, 10);

  const payablesTodayOrOverdue = payableList.filter(p => p.status !== 'Pago' && (p.dueDate || '') <= todayStr);
  const totalPayablesTodayOrOverdue = payablesTodayOrOverdue.reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);

  const receivablesToday = receivableList.filter(r => (r.dueDate || '') === todayStr);
  const totalReceivablesToday = receivablesToday.reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);
  const receivedToday = receivablesToday.filter(r => r.status === 'Pago').reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);

  const totalReceivedRealized = receivableList.filter(r => r.status === 'Pago').reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);
  const totalPaidRealized = payableList.filter(p => p.status === 'Pago').reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);
  const realizedBalance = totalReceivedRealized - totalPaidRealized;

  const overduePayables = payableList.filter(p => p.status !== 'Pago' && (p.dueDate || '') < todayStr);
  const overdueReceivables = receivableList.filter(r => r.status !== 'Pago' && (r.dueDate || '') < todayStr);
  const totalOverdueAmount = overduePayables.reduce((a, c) => a + (parseFloat(c.amount) || 0), 0) + overdueReceivables.reduce((a, c) => a + (parseFloat(c.amount) || 0), 0);

  // Simulated APAC alert list
  const mockApacs = [
    { id: '1', patientName: 'ADAIR PRAXEDES MORENO', code: '0303020059', expires: '2026-07-28', status: 'Atenção' },
    { id: '2', patientName: 'ADAO LUCIANO DIAS', code: '0303020059', expires: '2026-08-15', status: 'Ativa' },
    { id: '3', patientName: 'ADRIANO BRANDAO DA SILVA', code: '0303020059', expires: '2026-07-20', status: 'Urgente' },
    { id: '4', patientName: 'AGMAR DE SOUZA TAVARES', code: '0303020059', expires: '2026-09-02', status: 'Ativa' },
    { id: '5', patientName: 'ALAN ALVES DE SOUZA', code: '0303020059', expires: '2026-07-22', status: 'Urgente' }
  ];

  const getApacBadgeStyle = (status) => {
    switch (status) {
      case 'Urgente': return { backgroundColor: '#fecaca', color: '#b91c1c' };
      case 'Atenção': return { backgroundColor: '#fef3c7', color: '#b45309' };
      default: return { backgroundColor: '#d1fae5', color: '#065f46' };
    }
  };

  if (loading && payableList.length === 0) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', flexDirection: 'column' }}>
        <RefreshCw size={36} className="spin-animation" style={{ color: '#10b981' }} />
        <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Carregando dados financeiros...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Navigation tabs */}
      <div style={styles.tabsHeader}>
        <div style={styles.tabs}>
          <button 
            onClick={() => setActiveTab('dashboard')} 
            style={{ ...styles.tabBtn, ...(activeTab === 'dashboard' ? styles.tabBtnActive : {}) }}
          >
            Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('payable')} 
            style={{ ...styles.tabBtn, ...(activeTab === 'payable' ? styles.tabBtnActive : {}) }}
          >
            Contas a Pagar ({payableList.filter(p => p.status === 'Pendente').length})
          </button>
          <button 
            onClick={() => setActiveTab('receivable')} 
            style={{ ...styles.tabBtn, ...(activeTab === 'receivable' ? styles.tabBtnActive : {}) }}
          >
            Contas a Receber ({receivableList.filter(r => r.status === 'Pendente').length})
          </button>
          <button 
            onClick={() => setActiveTab('apac')} 
            style={{ ...styles.tabBtn, ...(activeTab === 'apac' ? styles.tabBtnActive : {}) }}
          >
            APACs & Faturamento
          </button>
        </div>

        <button onClick={loadData} style={styles.refreshBtn} title="Atualizar dados">
          <RefreshCw size={15} />
        </button>
      </div>

      {/* Portal Dashboard view */}
      {activeTab === 'dashboard' && (
        <div>
          {/* Customization Toolbar Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', padding: '0.5rem 0.75rem', backgroundColor: 'var(--bg-card)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <div>
              <span style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-primary)' }}>Painel de Operações Financeiras</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>Visão customizável para operadores</span>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <button 
                onClick={() => setIsCustomizingDashboard(!isCustomizingDashboard)}
                style={{
                  padding: '0.35rem 0.75rem',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  borderRadius: '6px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: isCustomizingDashboard ? '#10b981' : 'var(--bg-secondary)',
                  color: isCustomizingDashboard ? '#ffffff' : 'var(--text-primary)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}
              >
                <Settings size={14} />
                <span>{isCustomizingDashboard ? 'Concluir Ajustes' : 'Personalizar Painel'}</span>
              </button>
              {isCustomizingDashboard && (
                <button 
                  onClick={handleResetDashboardLayout}
                  style={{
                    padding: '0.35rem 0.6rem',
                    fontSize: '0.75rem',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'transparent',
                    color: 'var(--text-muted)',
                    cursor: 'pointer'
                  }}
                >
                  Restaurar Padrão
                </button>
              )}
            </div>
          </div>

          {/* Customization Drawer when editing */}
          {isCustomizingDashboard && (
            <div style={{ marginBottom: '1rem', padding: '0.75rem', backgroundColor: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#166534', display: 'block', marginBottom: '0.5rem' }}>Exibir / Ocultar Quadros Operacionais:</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {dashboardLayout.map(card => (
                  <button
                    key={card.id}
                    onClick={() => handleToggleCardVisibility(card.id)}
                    style={{
                      padding: '0.25rem 0.5rem',
                      fontSize: '0.75rem',
                      borderRadius: '4px',
                      border: '1px solid #86efac',
                      backgroundColor: card.visible ? '#dcfce7' : '#f1f5f9',
                      color: card.visible ? '#15803d' : '#64748b',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}
                  >
                    {card.visible ? <Eye size={12} /> : <EyeOff size={12} />}
                    <span>{card.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Grid Layout Container */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '1rem',
            alignItems: 'stretch'
          }}>
            {dashboardLayout
              .filter(card => card.visible || isCustomizingDashboard)
              .map((card, index) => {
                const getGridSpan = (size) => {
                  switch (size) {
                    case 'large': return 'span 4';
                    case 'medium': return 'span 2';
                    default: return 'span 1';
                  }
                };

                return (
                  <div
                    key={card.id}
                    style={{
                      gridColumn: getGridSpan(card.size),
                      backgroundColor: 'var(--bg-card)',
                      borderRadius: '10px',
                      border: isCustomizingDashboard ? '2px dashed #10b981' : '1px solid var(--border-color)',
                      padding: '1rem',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      opacity: !card.visible && isCustomizingDashboard ? 0.5 : 1,
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {/* Controls overlay in customizing mode */}
                    {isCustomizingDashboard && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(16,185,129,0.08)', padding: '0.35rem 0.5rem', borderRadius: '6px', marginBottom: '0.75rem', fontSize: '0.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                          <button disabled={index === 0} onClick={() => handleMoveCard(index, -1)} style={{ border: 'none', background: 'none', cursor: 'pointer', opacity: index === 0 ? 0.3 : 1 }} title="Mover para esquerda/cima"><ChevronLeft size={16} /></button>
                          <button disabled={index === dashboardLayout.length - 1} onClick={() => handleMoveCard(index, 1)} style={{ border: 'none', background: 'none', cursor: 'pointer', opacity: index === dashboardLayout.length - 1 ? 0.3 : 1 }} title="Mover para direita/baixo"><ChevronRight size={16} /></button>
                          <span style={{ fontWeight: '700', color: '#10b981' }}>Pos. {index + 1}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <span style={{ fontWeight: '600' }}>Tamanho:</span>
                          <select value={card.size || 'small'} onChange={e => handleChangeCardSize(card.id, e.target.value)} style={{ fontSize: '0.75rem', padding: '0.15rem 0.3rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                            <option value="small">Pequeno (1 Col)</option>
                            <option value="medium">Médio (2 Col)</option>
                            <option value="large">Grande (4 Col)</option>
                          </select>
                        </div>
                      </div>
                    )}

                    {/* Operational Card Content Renderers */}
                    {card.id === 'payables_today' && (
                      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center' }}>
                        <div style={styles.kpiHeader}>
                          <span style={styles.kpiLabel}>Contas a Pagar Hoje / Vencidas</span>
                          <AlertCircle size={18} color="#ef4444" />
                        </div>
                        <span style={{ ...styles.kpiValue, color: payablesTodayOrOverdue.length > 0 ? '#ef4444' : '#10b981' }}>
                          R$ {totalPayablesTodayOrOverdue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                        <div style={styles.kpiFooter}>
                          {payablesTodayOrOverdue.length} conta(s) pendente(s) de quitação
                        </div>
                      </div>
                    )}

                    {card.id === 'receivables_today' && (
                      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center' }}>
                        <div style={styles.kpiHeader}>
                          <span style={styles.kpiLabel}>Contas a Receber Hoje</span>
                          <TrendingUp size={18} color="#10b981" />
                        </div>
                        <span style={{ ...styles.kpiValue, color: '#10b981' }}>
                          R$ {totalReceivablesToday.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                        <div style={styles.kpiFooter}>
                          Recebido hoje: R$ {receivedToday.toLocaleString('pt-BR')} ({receivablesToday.length} títulos)
                        </div>
                      </div>
                    )}

                    {card.id === 'cash_flow_summary' && (
                      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center' }}>
                        <div style={styles.kpiHeader}>
                          <span style={styles.kpiLabel}>Saldo em Caixa (Realizado)</span>
                          <DollarSign size={18} color="#3b82f6" />
                        </div>
                        <span style={{ ...styles.kpiValue, color: realizedBalance >= 0 ? '#3b82f6' : '#ef4444' }}>
                          R$ {realizedBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                        <div style={styles.kpiFooter}>
                          Entradas: R$ {totalReceivedRealized.toLocaleString('pt-BR')} | Saídas: R$ {totalPaidRealized.toLocaleString('pt-BR')}
                        </div>
                      </div>
                    )}

                    {card.id === 'overdue_alerts' && (
                      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center' }}>
                        <div style={styles.kpiHeader}>
                          <span style={styles.kpiLabel}>Títulos em Atraso (Cobrança & Juros)</span>
                          <Clock size={18} color="#f59e0b" />
                        </div>
                        <span style={{ ...styles.kpiValue, color: '#f59e0b' }}>
                          {overduePayables.length + overdueReceivables.length} pendência(s)
                        </span>
                        <div style={styles.kpiFooter}>
                          Total acumulado: R$ {totalOverdueAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                    )}

                    {card.id === 'cash_flow_bar' && (
                      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                        <h3 style={styles.sectionTitle}>Fluxo de Caixa (Entradas vs. Saídas)</h3>
                        <div style={styles.chartBarWrapper}>
                          <div style={styles.chartBarLabel}>
                            <span>Entradas (Receitas Previstas)</span>
                            <strong>R$ {totalReceivables.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
                          </div>
                          <div style={styles.progressBarBg}>
                            <div style={{ ...styles.progressBarFill, width: '100%', backgroundColor: '#10b981' }} />
                          </div>
                          <span style={styles.barPercentage}>Recebido: R$ {receivedAmount.toLocaleString('pt-BR')} ({((receivedAmount / (totalReceivables || 1)) * 100).toFixed(1)}%)</span>
                        </div>
                        <div style={styles.chartBarWrapper}>
                          <div style={styles.chartBarLabel}>
                            <span>Saídas (Despesas Previstas)</span>
                            <strong>R$ {totalPayables.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
                          </div>
                          <div style={styles.progressBarBg}>
                            <div style={{ ...styles.progressBarFill, width: `${((totalPayables / (totalReceivables || 1)) * 100).toFixed(1)}%`, backgroundColor: '#ef4444' }} />
                          </div>
                          <span style={styles.barPercentage}>Pago: R$ {paidAmount.toLocaleString('pt-BR')} ({((paidAmount / (totalPayables || 1)) * 100).toFixed(1)}%)</span>
                        </div>
                      </div>
                    )}

                    {card.id === 'cost_distribution' && (
                      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                        <h3 style={styles.sectionTitle}>Distribuição de Custos / Despesas</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                          {Object.entries(categories).map(([cat, val]) => {
                            const perc = ((val / (totalPayables || 1)) * 100).toFixed(1);
                            return (
                              <div key={cat} style={styles.costItem}>
                                <div style={styles.costInfo}>
                                  <span style={styles.costCatName}>{cat}</span>
                                  <span style={styles.costPerc}>{perc}%</span>
                                </div>
                                <div style={styles.costBarBg}>
                                  <div style={{ ...styles.costBarFill, width: `${perc}%`, backgroundColor: '#3b82f6' }} />
                                </div>
                                <span style={styles.costValue}>R$ {val.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {card.id === 'ebitda' && (
                      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center' }}>
                        <div style={styles.kpiHeader}>
                          <span style={styles.kpiLabel}>EBITDA Realizado (Visão Executiva)</span>
                          <TrendingUp size={18} color="#10b981" />
                        </div>
                        <span style={{ ...styles.kpiValue, color: ebitda >= 0 ? '#10b981' : '#ef4444' }}>
                          R$ {ebitda.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                        <div style={styles.kpiFooter}>
                          Projetado Total: R$ {ebitdaProjected.toLocaleString('pt-BR')}
                        </div>
                      </div>
                    )}

                    {card.id === 'apac_glosa' && (
                      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center' }}>
                        <div style={styles.kpiHeader}>
                          <span style={styles.kpiLabel}>Glosa de Convênios & APACs</span>
                          <AlertCircle size={18} color="#ef4444" />
                        </div>
                        <span style={{ ...styles.kpiValue, color: '#ef4444' }}>1,84%</span>
                        <div style={styles.kpiFooter}>
                          {mockApacs.filter(a => a.status === 'Urgente').length} APAC(s) exigindo renovação urgente
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Accounts Payable (Contas a Pagar) View */}
      {activeTab === 'payable' && (
        <div style={styles.tabContent}>
          <div style={styles.actionsBar}>
            <div style={styles.filtersGroup}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginRight: '0.5rem' }}>Filtro:</span>
              <button 
                onClick={() => setPayableFilter('Todos')}
                style={{ ...styles.filterBadge, ...(payableFilter === 'Todos' ? styles.filterBadgeActive : {}) }}
              >
                Todos
              </button>
              <button 
                onClick={() => setPayableFilter('Pendente')}
                style={{ ...styles.filterBadge, ...(payableFilter === 'Pendente' ? styles.filterBadgeActive : {}) }}
              >
                Pendente
              </button>
              <button 
                onClick={() => setPayableFilter('Pago')}
                style={{ ...styles.filterBadge, ...(payableFilter === 'Pago' ? styles.filterBadgeActive : {}) }}
              >
                Pago
              </button>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={handleXmlSimulatedImport} style={styles.xmlBtn}>
                <Upload size={14} />
                <span>Importar XML NF-e</span>
              </button>
              <button onClick={() => setShowAddPayable(!showAddPayable)} style={styles.btnPrimary}>
                <Plus size={14} />
                <span>Nova Despesa</span>
              </button>
            </div>
          </div>

          {/* Add Manual Payable Form */}
          {showAddPayable && (
            <form onSubmit={handleAddPayable} style={styles.formContainer}>
              <h4 style={{ margin: '0 0 1rem 0', color: 'var(--text-primary)' }}>Novo Lançamento - Contas a Pagar</h4>
              <div style={styles.formGrid}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Fornecedor</label>
                  <input 
                    type="text" 
                    value={newPayable.supplier} 
                    onChange={e => setNewPayable({...newPayable, supplier: e.target.value})} 
                    style={styles.input} 
                    required 
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Valor (R$)</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    value={newPayable.amount} 
                    onChange={e => setNewPayable({...newPayable, amount: e.target.value})} 
                    style={styles.input} 
                    required 
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Vencimento</label>
                  <input 
                    type="date" 
                    value={newPayable.dueDate} 
                    onChange={e => setNewPayable({...newPayable, dueDate: e.target.value})} 
                    style={styles.input} 
                    required 
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Categoria</label>
                  <select 
                    value={newPayable.category} 
                    onChange={e => setNewPayable({...newPayable, category: e.target.value})} 
                    style={styles.input}
                  >
                    <option value="Insumo Clínico">Insumo Clínico</option>
                    <option value="Concentrado">Concentrado</option>
                    <option value="Medicamento">Medicamento</option>
                    <option value="Serviço/Utilidades">Serviço/Utilidades</option>
                    <option value="Equipamento">Equipamento</option>
                  </select>
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Nº Nota Fiscal</label>
                  <input 
                    type="text" 
                    value={newPayable.invoiceNumber} 
                    onChange={e => setNewPayable({...newPayable, invoiceNumber: e.target.value})} 
                    style={styles.input} 
                  />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowAddPayable(false)} style={styles.btnSecondary}>Cancelar</button>
                <button type="submit" style={styles.btnSave}>Adicionar</button>
              </div>
            </form>
          )}

          {/* Table list */}
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Fornecedor</th>
                  <th style={styles.th}>Categoria</th>
                  <th style={styles.th}>NF-e</th>
                  <th style={styles.th}>Vencimento</th>
                  <th style={styles.th}>Valor</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {payableList
                  .filter(p => payableFilter === 'Todos' || p.status === payableFilter)
                  .map(p => (
                    <tr key={p.id} style={styles.tr}>
                      <td style={styles.td}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <strong>{p.supplier}</strong>
                          {p.purchaseId ? (
                            <span style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem', borderRadius: '4px', backgroundColor: '#e0f2fe', color: '#0369a1', fontWeight: '700' }}>
                              🛒 Compras
                            </span>
                          ) : p.description?.includes('NF-e') ? (
                            <span style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem', borderRadius: '4px', backgroundColor: '#f1f5f9', color: '#475569', fontWeight: '700' }}>
                              📦 Estoque NFe
                            </span>
                          ) : null}
                        </div>
                        {p.description && <div style={styles.subtext}>{p.description}</div>}
                      </td>
                      <td style={styles.td}>{p.category}</td>
                      <td style={styles.td}>{p.invoiceNumber || '-'}</td>
                      <td style={styles.td}>{p.dueDate.split('-').reverse().join('/')}</td>
                      <td style={styles.td}>R$ {p.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                      <td style={styles.td}>
                        <span 
                          onClick={() => handleTogglePayableStatus(p)}
                          style={{
                            ...styles.statusBadge,
                            backgroundColor: p.status === 'Pago' ? '#d1fae5' : '#fee2e2',
                            color: p.status === 'Pago' ? '#065f46' : '#991b1b',
                          }}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <div style={{ display: 'flex', gap: '0.25rem' }}>
                          <button 
                            onClick={() => handleTogglePayableStatus(p)}
                            style={styles.actionBtnCheck} 
                            title={p.status === 'Pago' ? 'Marcar como pendente' : 'Marcar como pago'}
                          >
                            <Check size={14} />
                          </button>
                          <button onClick={() => handleDeletePayable(p.id)} style={styles.actionBtnDelete} title="Excluir">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Accounts Receivable (Contas a Receber) View */}
      {activeTab === 'receivable' && (
        <div style={styles.tabContent}>
          <div style={styles.actionsBar}>
            <div style={styles.filtersGroup}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginRight: '0.5rem' }}>Filtro:</span>
              <button 
                onClick={() => setReceivableFilter('Todos')}
                style={{ ...styles.filterBadge, ...(receivableFilter === 'Todos' ? styles.filterBadgeActive : {}) }}
              >
                Todos
              </button>
              <button 
                onClick={() => setReceivableFilter('Pendente')}
                style={{ ...styles.filterBadge, ...(receivableFilter === 'Pendente' ? styles.filterBadgeActive : {}) }}
              >
                Pendente
              </button>
              <button 
                onClick={() => setReceivableFilter('Pago')}
                style={{ ...styles.filterBadge, ...(receivableFilter === 'Pago' ? styles.filterBadgeActive : {}) }}
              >
                Pago
              </button>
            </div>

            <button onClick={() => setShowAddReceivable(!showAddReceivable)} style={styles.btnPrimary}>
              <Plus size={14} />
              <span>Nova Receita</span>
            </button>
          </div>

          {/* Add Manual Receivable Form */}
          {showAddReceivable && (
            <form onSubmit={handleAddReceivable} style={styles.formContainer}>
              <h4 style={{ margin: '0 0 1rem 0', color: 'var(--text-primary)' }}>Novo Recebimento - Contas a Receber</h4>
              <div style={styles.formGrid}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Cliente / Fonte Pagadora</label>
                  <input 
                    type="text" 
                    value={newReceivable.client} 
                    onChange={e => setNewReceivable({...newReceivable, client: e.target.value})} 
                    style={styles.input} 
                    required 
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Valor (R$)</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    value={newReceivable.amount} 
                    onChange={e => setNewReceivable({...newReceivable, amount: e.target.value})} 
                    style={styles.input} 
                    required 
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Data de Vencimento</label>
                  <input 
                    type="date" 
                    value={newReceivable.dueDate} 
                    onChange={e => setNewReceivable({...newReceivable, dueDate: e.target.value})} 
                    style={styles.input} 
                    required 
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Categoria</label>
                  <select 
                    value={newReceivable.category} 
                    onChange={e => setNewReceivable({...newReceivable, category: e.target.value})} 
                    style={styles.input}
                  >
                    <option value="SUS">Repasse SUS (APAC)</option>
                    <option value="Convênio">Convênio Privado</option>
                    <option value="Particular">Faturamento Particular</option>
                  </select>
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Nº Guia/Lote</label>
                  <input 
                    type="text" 
                    value={newReceivable.invoiceNumber} 
                    onChange={e => setNewReceivable({...newReceivable, invoiceNumber: e.target.value})} 
                    style={styles.input} 
                  />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowAddReceivable(false)} style={styles.btnSecondary}>Cancelar</button>
                <button type="submit" style={styles.btnSave}>Adicionar</button>
              </div>
            </form>
          )}

          {/* Table list */}
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Cliente / Fonte Pagadora</th>
                  <th style={styles.th}>Categoria</th>
                  <th style={styles.th}>Nº Guia / Lote</th>
                  <th style={styles.th}>Vencimento</th>
                  <th style={styles.th}>Valor</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {receivableList
                  .filter(r => receivableFilter === 'Todos' || r.status === receivableFilter)
                  .map(r => (
                    <tr key={r.id} style={styles.tr}>
                      <td style={styles.td}>
                        <strong>{r.client}</strong>
                        {r.description && <div style={styles.subtext}>{r.description}</div>}
                      </td>
                      <td style={styles.td}>{r.category}</td>
                      <td style={styles.td}>{r.invoiceNumber || '-'}</td>
                      <td style={styles.td}>{r.dueDate.split('-').reverse().join('/')}</td>
                      <td style={styles.td}>R$ {r.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                      <td style={styles.td}>
                        <span 
                          onClick={() => handleToggleReceivableStatus(r)}
                          style={{
                            ...styles.statusBadge,
                            backgroundColor: r.status === 'Pago' ? '#d1fae5' : '#fee2e2',
                            color: r.status === 'Pago' ? '#065f46' : '#991b1b',
                          }}
                        >
                          {r.status === 'Pago' ? 'Recebido' : 'Pendente'}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <div style={{ display: 'flex', gap: '0.25rem' }}>
                          <button 
                            onClick={() => handleToggleReceivableStatus(r)}
                            style={styles.actionBtnCheck} 
                            title={r.status === 'Pago' ? 'Marcar como pendente' : 'Marcar como recebido'}
                          >
                            <Check size={14} />
                          </button>
                          <button onClick={() => handleDeleteReceivable(r.id)} style={styles.actionBtnDelete} title="Excluir">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* APACs & Billing View */}
      {activeTab === 'apac' && (
        <div style={styles.tabContent}>
          <div style={styles.apacAlertBanner}>
            <AlertCircle size={20} color="#b45309" />
            <div style={{ marginLeft: '0.75rem' }}>
              <strong>Atenção ao faturamento:</strong> Há 3 guias APAC de pacientes ativas que vencem nos próximos 10 dias. Regularize o pedido médico de renovação para evitar glosas operacionais automáticas pelo SUS.
            </div>
          </div>

          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Paciente</th>
                  <th style={styles.th}>Nº APAC Autorizada</th>
                  <th style={styles.th}>Data de Vencimento</th>
                  <th style={styles.th}>Dias Restantes</th>
                  <th style={styles.th}>Status de Validade</th>
                </tr>
              </thead>
              <tbody>
                {mockApacs.map(apac => {
                  const today = new Date();
                  const expireDate = new Date(apac.expires);
                  const diffTime = Math.abs(expireDate - today);
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                  
                  return (
                    <tr key={apac.id} style={styles.tr}>
                      <td style={styles.td}><strong>{apac.patientName}</strong></td>
                      <td style={styles.td}>{apac.code}</td>
                      <td style={styles.td}>{apac.expires.split('-').reverse().join('/')}</td>
                      <td style={styles.td}>{diffDays} dias</td>
                      <td style={styles.td}>
                        <span style={{ ...styles.statusBadge, ...getApacBadgeStyle(apac.status) }}>
                          {apac.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '1.5rem',
    backgroundColor: '#f8fafc',
    minHeight: '80vh',
  },
  tabsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #e2e8f0',
    marginBottom: '1.5rem',
  },
  tabs: {
    display: 'flex',
    gap: '0.25rem',
  },
  tabBtn: {
    padding: '0.75rem 1.25rem',
    backgroundColor: 'transparent',
    border: 'none',
    borderBottom: '2px solid transparent',
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#64748b',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  tabBtnActive: {
    color: '#10b981',
    borderBottom: '2px solid #10b981',
  },
  refreshBtn: {
    padding: '0.5rem',
    borderRadius: '8px',
    backgroundColor: '#fff',
    border: '1px solid #e2e8f0',
    color: '#64748b',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '1rem',
    marginBottom: '1.5rem',
  },
  kpiCard: {
    backgroundColor: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '1.25rem',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
  },
  kpiHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.5rem',
  },
  kpiLabel: {
    fontSize: '0.775rem',
    color: '#64748b',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  kpiValue: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#0f172a',
    display: 'block',
    margin: '0.25rem 0',
  },
  kpiFooter: {
    fontSize: '0.75rem',
    color: '#94a3b8',
  },
  dashboardSplit: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
    gap: '1.5rem',
    marginTop: '1rem',
  },
  dashboardSection: {
    backgroundColor: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '1.5rem',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
  },
  sectionTitle: {
    fontSize: '1rem',
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: '1.25rem',
  },
  chartBarWrapper: {
    marginBottom: '1.25rem',
  },
  chartBarLabel: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.85rem',
    color: '#475569',
    marginBottom: '0.5rem',
  },
  progressBarBg: {
    height: '10px',
    backgroundColor: '#e2e8f0',
    borderRadius: '5px',
    overflow: 'hidden',
    marginBottom: '0.25rem',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: '5px',
  },
  barPercentage: {
    fontSize: '0.75rem',
    color: '#94a3b8',
  },
  costItem: {
    marginBottom: '0.75rem',
  },
  costInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.8rem',
    color: '#475569',
    marginBottom: '0.25rem',
  },
  costCatName: {
    fontWeight: '600',
  },
  costPerc: {
    fontWeight: '700',
    color: '#64748b',
  },
  costBarBg: {
    height: '6px',
    backgroundColor: '#f1f5f9',
    borderRadius: '3px',
    overflow: 'hidden',
    marginBottom: '0.25rem',
  },
  costBarFill: {
    height: '100%',
    borderRadius: '3px',
  },
  costValue: {
    fontSize: '0.75rem',
    color: '#94a3b8',
  },
  tabContent: {
    backgroundColor: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '1.25rem',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
  },
  actionsBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.25rem',
    flexWrap: 'wrap',
    gap: '0.75rem',
  },
  filtersGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
  },
  filterBadge: {
    padding: '0.35rem 0.75rem',
    borderRadius: '16px',
    backgroundColor: '#f1f5f9',
    border: 'none',
    fontSize: '0.8rem',
    fontWeight: '600',
    color: '#475569',
    cursor: 'pointer',
  },
  filterBadgeActive: {
    backgroundColor: '#10b981',
    color: '#fff',
  },
  xmlBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.45rem 1rem',
    borderRadius: '8px',
    backgroundColor: '#ecfdf5',
    border: '1px solid #a7f3d0',
    color: '#047857',
    fontSize: '0.825rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
  btnPrimary: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.45rem 1rem',
    borderRadius: '8px',
    backgroundColor: '#10b981',
    border: 'none',
    color: '#fff',
    fontSize: '0.825rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
  tableWrapper: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    textAlign: 'left',
    padding: '0.75rem 1rem',
    borderBottom: '1px solid #e2e8f0',
    color: '#475569',
    fontSize: '0.8rem',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  tr: {
    borderBottom: '1px solid #f1f5f9',
    transition: 'background-color 0.2s',
  },
  td: {
    padding: '0.75rem 1rem',
    fontSize: '0.85rem',
    color: '#0f172a',
    verticalAlign: 'middle',
  },
  subtext: {
    fontSize: '0.75rem',
    color: '#94a3b8',
    marginTop: '0.15rem',
  },
  statusBadge: {
    display: 'inline-flex',
    padding: '0.2rem 0.5rem',
    borderRadius: '12px',
    fontSize: '0.75rem',
    fontWeight: '700',
    textTransform: 'uppercase',
    cursor: 'pointer',
  },
  actionBtnCheck: {
    padding: '0.35rem',
    borderRadius: '6px',
    backgroundColor: '#f0fdf4',
    border: '1px solid #bbf7d0',
    color: '#15803d',
    cursor: 'pointer',
  },
  actionBtnDelete: {
    padding: '0.35rem',
    borderRadius: '6px',
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    color: '#b91c1c',
    cursor: 'pointer',
  },
  formContainer: {
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '1.25rem',
    marginBottom: '1.25rem',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '1rem',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem',
  },
  label: {
    fontSize: '0.75rem',
    fontWeight: '700',
    color: '#475569',
  },
  input: {
    padding: '0.45rem',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    backgroundColor: '#fff',
    fontSize: '0.825rem',
    outline: 'none',
  },
  btnSecondary: {
    padding: '0.45rem 1rem',
    borderRadius: '6px',
    backgroundColor: '#e2e8f0',
    border: 'none',
    color: '#475569',
    fontSize: '0.825rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
  btnSave: {
    padding: '0.45rem 1rem',
    borderRadius: '6px',
    backgroundColor: '#10b981',
    border: 'none',
    color: '#fff',
    fontSize: '0.825rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
  apacAlertBanner: {
    display: 'flex',
    alignItems: 'center',
    padding: '1rem',
    backgroundColor: '#fef3c7',
    border: '1px solid #fde68a',
    borderRadius: '8px',
    color: '#92400e',
    fontSize: '0.825rem',
    marginBottom: '1.25rem',
  }
};
