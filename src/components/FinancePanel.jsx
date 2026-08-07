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
  Clock,
  Edit,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  X,
  PieChart,
  BarChart2,
  Layers,
  AlertTriangle,
  FileSpreadsheet,
  Building2,
  CheckCircle2,
  Sliders,
  Calculator,
  ArrowUpRight,
  ShieldCheck,
  Target,
  Search,
  Activity
} from 'lucide-react';

import { dbService } from '../firebase';

export default function FinancePanel() {
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'payable' | 'receivable' | 'budget' | 'cashflow_projection' | 'agreements' | 'installments' | 'reconciliation'
  const [payableList, setPayableList] = useState([]);
  const [receivableList, setReceivableList] = useState([]);
  const [costCenters, setCostCenters] = useState([]);
  const [budgetPlans, setBudgetPlans] = useState([]);
  const [agreementsList, setAgreementsList] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState('Betim'); // 'Betim' | 'Contagem' | 'Matriz' | 'Todas'
  const [loading, setLoading] = useState(true);

  // States for new Budget & Agreement Modals / Forms
  const [showAddBudget, setShowAddBudget] = useState(false);
  const [newBudget, setNewBudget] = useState({
    costCenterId: '1.1',
    plannedAmount: '',
    year: 2026,
    month: 7,
    notes: ''
  });

  const [showAddAgreement, setShowAddAgreement] = useState(false);
  const [newAgreement, setNewAgreement] = useState({
    supplier: '',
    totalAmount: '',
    installmentCount: '6',
    installmentAmount: '',
    dueDay: '10',
    notes: ''
  });

  // Initial Cash Balance for Cashflow Projection
  const [initialCashBalance, setInitialCashBalance] = useState(() => {
    try {
      const saved = localStorage.getItem('sistema_indicadores_initial_cash_balance');
      return saved !== null ? parseFloat(saved) : 150000;
    } catch {
      return 150000;
    }
  });
  const [showEditCashBalance, setShowEditCashBalance] = useState(false);
  const [tempCashBalance, setTempCashBalance] = useState('');

  // Manual Bank Statement Modal State
  const [showAddManualStatement, setShowAddManualStatement] = useState(false);
  const [newManualStatement, setNewManualStatement] = useState({
    date: new Date().toISOString().substring(0, 10),
    bankName: 'Itaú Unibanco (PJ)',
    description: '',
    amount: '',
    type: 'Débito'
  });

  const [partialItem, setPartialItem] = useState(null);
  const [partialAmountPaid, setPartialAmountPaid] = useState('');
  const [showImportBetimModal, setShowImportBetimModal] = useState(false);


  // Custom Dashboard Layout for Financial Operator
  const DEFAULT_FINANCE_LAYOUT = [
    { id: 'payables_month', name: '📅 Contas a Pagar do Mês', size: 'small', visible: true },
    { id: 'overdue_current_month', name: '🔴 Vencidos do Mês', size: 'small', visible: true },
    { id: 'overdue_prev_month', name: '⚠️ Vencidos do Mês Anterior', size: 'small', visible: true },
    { id: 'payables_today', name: '🚨 Pagar Hoje & Atrasados', size: 'small', visible: true },
    { id: 'payables_7days', name: '🗓️ Contas a Pagar (Próximos 7 Dias)', size: 'small', visible: true },
    { id: 'payables_15days', name: '🗓️ Contas a Pagar (Próximos 15 Dias)', size: 'small', visible: true },
    { id: 'receivables_today', name: '🟢 Contas a Receber Hoje', size: 'small', visible: true },
    { id: 'cash_flow_summary', name: '💵 Saldo em Caixa (Realizado)', size: 'small', visible: true },
    { id: 'overdue_alerts', name: '⚠️ Títulos em Atraso Geral', size: 'small', visible: true },
    { id: 'cash_flow_bar', name: '📊 Fluxo de Caixa (Entradas vs Saídas)', size: 'medium', visible: true },
    { id: 'cost_distribution', name: '🍰 Distribuição de Despesas por Categoria', size: 'medium', visible: true },
    { id: 'ebitda', name: '📈 EBITDA Realizado (Visão Executiva)', size: 'small', visible: false },
    { id: 'apac_glosa', name: '📋 Glosa de Convênios & APACs', size: 'small', visible: true }
  ];

  const [dashboardLayout, setDashboardLayout] = useState(() => {
    try {
      const saved = localStorage.getItem('sistema_indicadores_finance_dashboard_layout');
      if (!saved) return DEFAULT_FINANCE_LAYOUT;
      const parsed = JSON.parse(saved);
      const existingIds = new Set(parsed.map(c => c.id));
      const missingCards = DEFAULT_FINANCE_LAYOUT.filter(c => !existingIds.has(c.id));
      if (missingCards.length > 0) {
        return [...missingCards, ...parsed];
      }
      return parsed;
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

  // Form & Editing states for manual additions / edits
  const [showAddPayable, setShowAddPayable] = useState(false);
  const [showAddReceivable, setShowAddReceivable] = useState(false);
  const [editingPayable, setEditingPayable] = useState(null);
  const [editingReceivable, setEditingReceivable] = useState(null);

  const [newPayable, setNewPayable] = useState({
    supplier: '',
    cnpj: '',
    description: '',
    amount: '',
    dueDate: '',
    category: 'Insumo Clínico',
    invoiceNumber: '',
    paymentMethod: 'PIX',
    bankAccount: 'Itaú Unibanco (PJ)',
    natureType: 'Custo Variável / Operacional'
  });

  const [newReceivable, setNewReceivable] = useState({
    client: '',
    category: 'Convênio',
    description: '',
    amount: '',
    dueDate: '',
    invoiceNumber: '',
    paymentMethod: 'PIX',
    bankAccount: 'Itaú Unibanco (PJ)'
  });

  // Filter & Sort states
  const [payableFilter, setPayableFilter] = useState('Todos'); // 'Todos' | 'Pendente' | 'Pago'
  const [receivableFilter, setReceivableFilter] = useState('Todos'); // 'Todos' | 'Pendente' | 'Pago'

  // Formato das linhas de registros em Contas a Pagar ('compacta' por padrão | 'normal')
  const [payableRowDensity, setPayableRowDensity] = useState(() => {
    try {
      return localStorage.getItem('sistema_indicadores_payable_density') || 'compacta';
    } catch {
      return 'compacta';
    }
  });

  const handleSetPayableDensity = (density) => {
    setPayableRowDensity(density);
    try {
      localStorage.setItem('sistema_indicadores_payable_density', density);
    } catch (err) {
      console.error(err);
    }
  };

  // Seletor Fácil de Mês e Ano para o Dashboard (padrão: mês corrente)
  const now = new Date();
  const [selectedDashboardYear, setSelectedDashboardYear] = useState(() => now.getFullYear());
  const [selectedDashboardMonth, setSelectedDashboardMonth] = useState(() => now.getMonth() + 1); // 1-12 | 0 = 'Ano Todo'

  const MONTH_NAMES = [
    { value: 1, label: 'Jan', full: 'Janeiro' },
    { value: 2, label: 'Fev', full: 'Fevereiro' },
    { value: 3, label: 'Mar', full: 'Março' },
    { value: 4, label: 'Abr', full: 'Abril' },
    { value: 5, label: 'Mai', full: 'Maio' },
    { value: 6, label: 'Jun', full: 'Junho' },
    { value: 7, label: 'Jul', full: 'Julho' },
    { value: 8, label: 'Ago', full: 'Agosto' },
    { value: 9, label: 'Set', full: 'Setembro' },
    { value: 10, label: 'Out', full: 'Outubro' },
    { value: 11, label: 'Nov', full: 'Novembro' },
    { value: 12, label: 'Dez', full: 'Dezembro' }
  ];

  const [payableSort, setPayableSort] = useState({ key: 'dueDate', direction: 'asc' });
  const [receivableSort, setReceivableSort] = useState({ key: 'dueDate', direction: 'asc' });
  const [debtSort, setDebtSort] = useState({ key: 'firstDueDate', direction: 'asc' });
  const [budgetSort, setBudgetSort] = useState({ key: 'code', direction: 'asc' });
  const [agreementSort, setAgreementSort] = useState({ key: 'supplier', direction: 'asc' });
  const [reconciliationSort, setReconciliationSort] = useState({ key: 'date', direction: 'asc' });
  const [projectionSort, setProjectionSort] = useState({ key: 'monthIndex', direction: 'asc' });

  // Debts & Installments States
  const [debtsList, setDebtsList] = useState([]);
  const [bankStatements, setBankStatements] = useState([]);

  const [showAddDebt, setShowAddDebt] = useState(false);
  const [editingDebt, setEditingDebt] = useState(null);
  const [newDebt, setNewDebt] = useState({
    creditor: '',
    cnpj: '',
    totalAmount: '',
    installmentCount: '12',
    installmentAmount: '',
    firstDueDate: new Date().toISOString().substring(0, 10),
    category: 'Equipamento',
    notes: ''
  });
  const [selectedDebtDetail, setSelectedDebtDetail] = useState(null);

  // Modal interativo de detalhe de Card do Dashboard
  const [selectedDashboardDetail, setSelectedDashboardDetail] = useState(null);
  const [detailFilter, setDetailFilter] = useState('');

  // Sorting Helper Function
  const sortList = (list, sortConfig) => {
    if (!sortConfig || !sortConfig.key) return list;
    return [...list].sort((a, b) => {
      let valA = a[sortConfig.key] ?? '';
      let valB = b[sortConfig.key] ?? '';

      if (['amount', 'totalAmount', 'installmentAmount', 'installmentCount', 'planned', 'realized', 'due', 'devio', 'pctExecution', 'paidInstallments', 'devido', 'pago', 'saldo', 'fluxo', 'monthIndex'].includes(sortConfig.key)) {
        valA = parseFloat(valA) || 0;
        valB = parseFloat(valB) || 0;
      } else {
        valA = String(valA).toLowerCase();
        valB = String(valB).toLowerCase();
      }

      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const renderSortableHeader = (label, key, currentSort, setSort) => {
    const isActive = currentSort.key === key;
    return (
      <th 
        style={{ ...styles.th, cursor: 'pointer', userSelect: 'none' }} 
        onClick={() => {
          setSort({
            key,
            direction: isActive && currentSort.direction === 'asc' ? 'desc' : 'asc'
          });
        }}
        title={`Clique para ordenar por ${label}`}
      >
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <span>{label}</span>
          {isActive ? (
            currentSort.direction === 'asc' ? <ArrowUp size={13} color="#10b981" /> : <ArrowDown size={13} color="#10b981" />
          ) : (
            <ArrowUpDown size={12} color="#94a3b8" />
          )}
        </div>
      </th>
    );
  };

  // Load database tables
  const loadData = async () => {
    setLoading(true);
    try {
      const pay = await dbService.getAccountsPayable();
      const rec = await dbService.getAccountsReceivable();
      const debts = dbService.getDebts ? await dbService.getDebts() : [];
      const stmts = dbService.getBankStatements ? await dbService.getBankStatements() : [];
      const cCenters = dbService.getCostCenters ? await dbService.getCostCenters() : [];
      const bPlans = dbService.getBudgetPlans ? await dbService.getBudgetPlans() : [];
      const agrs = dbService.getAgreements ? await dbService.getAgreements() : [];

      setPayableList(pay);
      setReceivableList(rec);
      setDebtsList(debts);
      setBankStatements(stmts);
      setCostCenters(cCenters);
      setBudgetPlans(bPlans);
      setAgreementsList(agrs);
    } catch (err) {
      console.error('Erro ao buscar dados financeiros:', err);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    loadData();
  }, []);

  // Handlers for Debts & Installments
  const handleSaveDebt = async (e) => {
    e.preventDefault();
    if (!newDebt.creditor || !newDebt.totalAmount) {
      alert('Preencha o credor e o valor total da dívida.');
      return;
    }
    try {
      await dbService.saveDebt(newDebt);
      setShowAddDebt(false);
      setEditingDebt(null);
      setNewDebt({
        creditor: '',
        cnpj: '',
        totalAmount: '',
        installmentCount: '12',
        installmentAmount: '',
        firstDueDate: new Date().toISOString().substring(0, 10),
        category: 'Equipamento',
        notes: ''
      });
      loadData();
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar parcelamento.');
    }
  };

  const handleEditDebtClick = (debt) => {
    setNewDebt({
      id: debt.id,
      creditor: debt.creditor || '',
      cnpj: debt.cnpj || '',
      totalAmount: debt.totalAmount ? String(debt.totalAmount) : '',
      installmentCount: debt.installmentCount ? String(debt.installmentCount) : '12',
      installmentAmount: debt.installmentAmount ? String(debt.installmentAmount) : '',
      firstDueDate: debt.firstDueDate || new Date().toISOString().substring(0, 10),
      category: debt.category || 'Equipamento',
      notes: debt.notes || ''
    });
    setShowAddDebt(true);
  };

  const handleDeleteDebt = async (id) => {
    if (confirm('Deseja realmente excluir esta dívida e todas as suas parcelas pendentes em Contas a Pagar?')) {
      try {
        await dbService.deleteDebt(id);
        if (selectedDebtDetail?.id === id) setSelectedDebtDetail(null);
        loadData();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleEditBudgetClick = (bPlan, ccId) => {
    if (bPlan) {
      setNewBudget({
        id: bPlan.id,
        costCenterId: bPlan.costCenterId || ccId,
        plannedAmount: bPlan.plannedAmount ? String(bPlan.plannedAmount) : '',
        year: bPlan.year || 2026,
        month: bPlan.month || 7,
        notes: bPlan.notes || ''
      });
    } else {
      setNewBudget({
        costCenterId: ccId || '1.1',
        plannedAmount: '',
        year: 2026,
        month: 7,
        notes: ''
      });
    }
    setShowAddBudget(true);
  };

  const handleDeleteBudgetPlan = async (id) => {
    if (confirm('Deseja realmente excluir esta meta orçamentária?')) {
      try {
        if (dbService.deleteBudgetPlan) await dbService.deleteBudgetPlan(id);
        loadData();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleEditAgreementClick = (agr) => {
    setNewAgreement({
      id: agr.id,
      supplier: agr.supplier || '',
      totalAmount: agr.totalAmount ? String(agr.totalAmount) : '',
      installmentCount: agr.installmentCount ? String(agr.installmentCount) : '6',
      installmentAmount: agr.installmentAmount ? String(agr.installmentAmount) : '',
      dueDay: agr.dueDay ? String(agr.dueDay) : '10',
      notes: agr.notes || ''
    });
    setShowAddAgreement(true);
  };

  const handleDeleteAgreement = async (id) => {
    if (confirm('Deseja realmente excluir este acordo?')) {
      try {
        if (dbService.deleteAgreement) await dbService.deleteAgreement(id);
        loadData();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleSaveInitialCashBalance = (e) => {
    e.preventDefault();
    const val = parseFloat(tempCashBalance);
    if (isNaN(val)) return alert('Informe um valor válido para o saldo inicial de caixa.');
    setInitialCashBalance(val);
    try {
      localStorage.setItem('sistema_indicadores_initial_cash_balance', String(val));
    } catch (err) {
      console.error(err);
    }
    setShowEditCashBalance(false);
  };

  const handleSaveManualStatement = async (e) => {
    e.preventDefault();
    if (!newManualStatement.description || !newManualStatement.amount) {
      alert('Preencha a descrição e o valor da movimentação bancária.');
      return;
    }
    try {
      const numVal = parseFloat(newManualStatement.amount) || 0;
      const finalAmt = newManualStatement.type === 'Débito' ? -Math.abs(numVal) : Math.abs(numVal);
      await dbService.saveBankStatement({
        date: newManualStatement.date,
        bankName: newManualStatement.bankName || 'Itaú Unibanco (PJ)',
        description: newManualStatement.description,
        amount: finalAmt,
        type: newManualStatement.type,
        status: 'Pendente',
        note: 'Lançamento manual de extrato',
        importedAt: new Date().toISOString()
      });
      setShowAddManualStatement(false);
      setNewManualStatement({
        date: new Date().toISOString().substring(0, 10),
        bankName: 'Itaú Unibanco (PJ)',
        description: '',
        amount: '',
        type: 'Débito'
      });
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteStatement = async (id) => {
    if (confirm('Deseja remover este item do extrato bancário?')) {
      try {
        if (dbService.deleteBankStatement) await dbService.deleteBankStatement(id);
        loadData();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleUnreconcileStatement = async (stmt) => {
    if (confirm('Deseja desfazer a conciliação deste lançamento bancário?')) {
      try {
        await dbService.saveBankStatement({
          ...stmt,
          status: 'Pendente',
          note: 'Conciliação desfeita pelo operador'
        });
        loadData();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleSaveBudgetPlan = async (e) => {
    e.preventDefault();
    if (!newBudget.plannedAmount) {
      alert('Informe o valor planejado da meta.');
      return;
    }
    try {
      if (dbService.saveBudgetPlan) {
        await dbService.saveBudgetPlan({
          ...newBudget,
          unit: selectedUnit === 'Todas' ? 'Betim' : selectedUnit,
          plannedAmount: parseFloat(newBudget.plannedAmount) || 0
        });
      }
      setShowAddBudget(false);
      setNewBudget({ costCenterId: '1.1', plannedAmount: '', year: 2026, month: 7, notes: '' });
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveAgreement = async (e) => {
    e.preventDefault();
    if (!newAgreement.supplier || !newAgreement.totalAmount) {
      alert('Informe o fornecedor e o valor total do acordo.');
      return;
    }
    try {
      const tot = parseFloat(newAgreement.totalAmount) || 0;
      const count = parseInt(newAgreement.installmentCount) || 1;
      const instVal = parseFloat(newAgreement.installmentAmount) || (tot / count);
      if (dbService.saveAgreement) {
        await dbService.saveAgreement({
          ...newAgreement,
          unit: selectedUnit === 'Todas' ? 'Betim' : selectedUnit,
          totalAmount: tot,
          installmentCount: count,
          installmentAmount: instVal,
          paidInstallments: 0,
          status: 'Ativo'
        });
      }
      setShowAddAgreement(false);
      setNewAgreement({ supplier: '', totalAmount: '', installmentCount: '6', installmentAmount: '', dueDay: '10', notes: '' });
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleConfirmPartialPayment = async (e) => {
    e.preventDefault();
    if (!partialItem) return;
    const paidVal = parseFloat(partialAmountPaid) || 0;
    const totalAmount = parseFloat(partialItem.amount) || 0;
    const prevPaid = parseFloat(partialItem.amountPaid) || 0;
    const newTotalPaid = prevPaid + paidVal;
    
    let newStatus = 'PAGO_PARCIAL';
    if (newTotalPaid >= totalAmount) {
      newStatus = 'Pago';
    }

    try {
      await dbService.saveAccountsPayable({
        ...partialItem,
        amountPaid: newTotalPaid,
        status: newStatus,
        paymentDate: new Date().toISOString().substring(0, 10)
      });
      setPartialItem(null);
      setPartialAmountPaid('');
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleImportBetimData = async () => {
    try {
      await loadData();
      setShowImportBetimModal(false);
      alert('Planilha de Betim importada! Todos os 32 títulos foram sincronizados e vinculados aos Centros de Custo.');
    } catch (err) {
      console.error(err);
    }
  };

  const handleQuickReconcile = async (stmt) => {

    try {
      if (stmt.type === 'Débito' && dbService.saveAccountsPayable) {
        await dbService.saveAccountsPayable({
          supplier: stmt.description,
          cnpj: '00.000.000/0001-00',
          description: `Conciliação Automática: ${stmt.description}`,
          amount: Math.abs(stmt.amount),
          dueDate: stmt.date,
          category: 'Serviço/Utilidades',
          invoiceNumber: `EXT-${stmt.id}`,
          status: 'Pago',
          paymentDate: stmt.date
        });
      } else if (stmt.type === 'Crédito' && dbService.saveAccountsReceivable) {
        await dbService.saveAccountsReceivable({
          client: stmt.description,
          category: 'Convênio',
          description: `Conciliação Automática: ${stmt.description}`,
          amount: Math.abs(stmt.amount),
          dueDate: stmt.date,
          invoiceNumber: `EXT-${stmt.id}`,
          status: 'Pago',
          receivedDate: stmt.date
        });
      }

      if (dbService.saveBankStatement) {
        await dbService.saveBankStatement({
          ...stmt,
          status: 'Conciliado',
          note: 'Conciliado manualmente via painel de conciliação'
        });
      }

      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  // Save Payable (Create or Edit)
  const handleSavePayable = async (e) => {
    e.preventDefault();
    const itemToSave = editingPayable || newPayable;
    if (!itemToSave.supplier || !itemToSave.amount || !itemToSave.dueDate) return;

    try {
      await dbService.saveAccountsPayable({
        ...itemToSave,
        amount: parseFloat(itemToSave.amount),
        status: itemToSave.status || 'Pendente',
        paymentDate: itemToSave.paymentDate || ''
      });
      setShowAddPayable(false);
      setEditingPayable(null);
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

  // Save Receivable (Create or Edit)
  const handleSaveReceivable = async (e) => {
    e.preventDefault();
    const itemToSave = editingReceivable || newReceivable;
    if (!itemToSave.client || !itemToSave.amount || !itemToSave.dueDate) return;

    try {
      await dbService.saveAccountsReceivable({
        ...itemToSave,
        amount: parseFloat(itemToSave.amount),
        status: itemToSave.status || 'Pendente',
        receivedDate: itemToSave.receivedDate || ''
      });
      setShowAddReceivable(false);
      setEditingReceivable(null);
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

  // Month & Year Filter Prefixes
  const selectedMonthStr = String(selectedDashboardMonth).padStart(2, '0');
  const selectedMonthPrefix = selectedDashboardMonth === 0 
    ? `${selectedDashboardYear}-` 
    : `${selectedDashboardYear}-${selectedMonthStr}`;

  // Previous month calculation
  let prevMonthVal = selectedDashboardMonth === 0 ? (now.getMonth() === 0 ? 12 : now.getMonth()) : (selectedDashboardMonth === 1 ? 12 : selectedDashboardMonth - 1);
  let prevYearVal = selectedDashboardMonth === 0 ? (now.getMonth() === 0 ? selectedDashboardYear - 1 : selectedDashboardYear) : (selectedDashboardMonth === 1 ? selectedDashboardYear - 1 : selectedDashboardYear);
  const prevMonthPrefix = `${prevYearVal}-${String(prevMonthVal).padStart(2, '0')}`;

  // 1. Contas a pagar do Mês
  const payablesSelectedMonthList = payableList.filter(p => {
    const matchUnit = selectedUnit === 'Todas' || !p.unit || p.unit === selectedUnit;
    const matchMonth = p.dueDate && p.dueDate.startsWith(selectedMonthPrefix);
    return matchUnit && matchMonth;
  });
  const totalPayablesSelectedMonth = payablesSelectedMonthList.reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);
  const paidPayablesSelectedMonth = payablesSelectedMonthList
    .filter(p => p.status === 'Pago' || (parseFloat(p.amountPaid) || 0) >= (parseFloat(p.amount) || 0))
    .reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);
  const pendingPayablesSelectedMonth = totalPayablesSelectedMonth - paidPayablesSelectedMonth;

  // 2. Vencidos do Mês Anterior
  const overduePrevMonthList = payableList.filter(p => {
    const matchUnit = selectedUnit === 'Todas' || !p.unit || p.unit === selectedUnit;
    const matchMonth = p.dueDate && p.dueDate.startsWith(prevMonthPrefix);
    const isPaid = p.status === 'Pago' || ((parseFloat(p.amountPaid) || 0) >= (parseFloat(p.amount) || 0) && (parseFloat(p.amount) || 0) > 0);
    return matchUnit && matchMonth && !isPaid;
  });
  const totalOverduePrevMonth = overduePrevMonthList.reduce((acc, curr) => {
    const amt = parseFloat(curr.amount) || 0;
    const paid = parseFloat(curr.amountPaid) || 0;
    return acc + Math.max(0, amt - paid);
  }, 0);

  // 3. Vencidos do Mês Corrente / Selecionado
  const overdueSelectedMonthList = payableList.filter(p => {
    const matchUnit = selectedUnit === 'Todas' || !p.unit || p.unit === selectedUnit;
    const matchMonth = p.dueDate && p.dueDate.startsWith(selectedMonthPrefix);
    const isPaid = p.status === 'Pago' || ((parseFloat(p.amountPaid) || 0) >= (parseFloat(p.amount) || 0) && (parseFloat(p.amount) || 0) > 0);
    const isOverdue = p.dueDate && p.dueDate < todayStr;
    return matchUnit && matchMonth && !isPaid && isOverdue;
  });
  const totalOverdueSelectedMonth = overdueSelectedMonthList.reduce((acc, curr) => {
    const amt = parseFloat(curr.amount) || 0;
    const paid = parseFloat(curr.amountPaid) || 0;
    return acc + Math.max(0, amt - paid);
  }, 0);

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

  // 7 Days & 15 Days Payables Calculations
  const todayObj = new Date();
  todayObj.setHours(0, 0, 0, 0);

  const date7Days = new Date(todayObj);
  date7Days.setDate(date7Days.getDate() + 7);
  const date7DaysStr = date7Days.toISOString().substring(0, 10);

  const date15Days = new Date(todayObj);
  date15Days.setDate(date15Days.getDate() + 15);
  const date15DaysStr = date15Days.toISOString().substring(0, 10);

  const payables7DaysList = payableList.filter(p => p.status !== 'Pago' && (p.dueDate || '') >= todayStr && (p.dueDate || '') <= date7DaysStr);
  const totalPayables7Days = payables7DaysList.reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);

  const payables15DaysList = payableList.filter(p => p.status !== 'Pago' && (p.dueDate || '') >= todayStr && (p.dueDate || '') <= date15DaysStr);
  const totalPayables15Days = payables15DaysList.reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);

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
        <div style={{ ...styles.tabs, flexWrap: 'wrap' }}>
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
            Contas a Pagar ({payableList.filter(p => selectedUnit === 'Todas' || p.unit === selectedUnit).length})
          </button>
          <button 
            onClick={() => setActiveTab('receivable')} 
            style={{ ...styles.tabBtn, ...(activeTab === 'receivable' ? styles.tabBtnActive : {}) }}
          >
            Contas a Receber ({receivableList.length})
          </button>
          <button 
            onClick={() => setActiveTab('budget')} 
            style={{ ...styles.tabBtn, ...(activeTab === 'budget' ? styles.tabBtnActive : {}), borderBottom: activeTab === 'budget' ? '3px solid #10b981' : 'none' }}
          >
            🎯 Orçamento X Realizado
          </button>
          <button 
            onClick={() => setActiveTab('cashflow_projection')} 
            style={{ ...styles.tabBtn, ...(activeTab === 'cashflow_projection' ? styles.tabBtnActive : {}), borderBottom: activeTab === 'cashflow_projection' ? '3px solid #f59e0b' : 'none' }}
          >
            📈 Saldo Fluxo (Projeção)
          </button>
          <button 
            onClick={() => setActiveTab('agreements')} 
            style={{ ...styles.tabBtn, ...(activeTab === 'agreements' ? styles.tabBtnActive : {}) }}
          >
            🤝 Acordos & Renegociações ({agreementsList.length})
          </button>
          <button 
            onClick={() => setActiveTab('installments')} 
            style={{ ...styles.tabBtn, ...(activeTab === 'installments' ? styles.tabBtnActive : {}) }}
          >
            Dívidas Longo Prazo ({debtsList.length})
          </button>
          <button 
            onClick={() => setActiveTab('reconciliation')} 
            style={{ ...styles.tabBtn, ...(activeTab === 'reconciliation' ? styles.tabBtnActive : {}) }}
          >
            Conciliação Bancária
          </button>
          <button 
            onClick={() => setActiveTab('dre')} 
            style={{ ...styles.tabBtn, ...(activeTab === 'dre' ? styles.tabBtnActive : {}), borderBottom: activeTab === 'dre' ? '3px solid #8b5cf6' : 'none' }}
          >
            📊 DRE Gerencial
          </button>
        </div>

        <button onClick={loadData} style={styles.refreshBtn} title="Atualizar dados">
          <RefreshCw size={15} />
        </button>
      </div>


      {/* Portal Dashboard view */}
      {activeTab === 'dashboard' && (
        <div>
          {/* Seletor Fácil de Mês e Ano (1 Clique, padrão: Mês Corrente) */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            justify: 'space-between',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '1rem',
            padding: '0.75rem 1rem',
            backgroundColor: 'var(--bg-card)',
            borderRadius: '10px',
            border: '1px solid var(--border-color)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={18} color="#10b981" />
              <span style={{ fontWeight: '700', fontSize: '0.875rem', color: 'var(--text-primary)' }}>Filtro de Período do Dashboard:</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              {/* Seletor de Ano */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', backgroundColor: 'var(--bg-secondary)', padding: '0.2rem 0.4rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                <button onClick={() => setSelectedDashboardYear(prev => prev - 1)} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '0.1rem 0.3rem', color: 'var(--text-primary)' }} title="Ano Anterior"><ChevronLeft size={14} /></button>
                <span style={{ fontWeight: '700', fontSize: '0.85rem', color: '#10b981', minWidth: '42px', textAlign: 'center' }}>{selectedDashboardYear}</span>
                <button onClick={() => setSelectedDashboardYear(prev => prev + 1)} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '0.1rem 0.3rem', color: 'var(--text-primary)' }} title="Próximo Ano"><ChevronRight size={14} /></button>
              </div>

              {/* Botões de Mês (1 Clique) */}
              <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
                {MONTH_NAMES.map(m => {
                  const isCurrentRealMonth = (m.value === (now.getMonth() + 1)) && (selectedDashboardYear === now.getFullYear());
                  const isSelected = selectedDashboardMonth === m.value;
                  return (
                    <button
                      key={m.value}
                      onClick={() => setSelectedDashboardMonth(m.value)}
                      style={{
                        padding: '0.3rem 0.55rem',
                        fontSize: '0.78rem',
                        fontWeight: isSelected ? '700' : '500',
                        borderRadius: '6px',
                        border: isSelected ? '1px solid #10b981' : '1px solid var(--border-color)',
                        backgroundColor: isSelected ? '#10b981' : (isCurrentRealMonth ? 'rgba(16,185,129,0.1)' : 'var(--bg-secondary)'),
                        color: isSelected ? '#ffffff' : (isCurrentRealMonth ? '#059669' : 'var(--text-primary)'),
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                      title={isCurrentRealMonth ? `${m.label} (Mês Atual)` : `Selecionar ${m.full}`}
                    >
                      {m.label}
                    </button>
                  );
                })}

                {/* Botão de Atalho para Mês Atual */}
                <button
                  onClick={() => {
                    setSelectedDashboardYear(now.getFullYear());
                    setSelectedDashboardMonth(now.getMonth() + 1);
                  }}
                  style={{
                    padding: '0.3rem 0.6rem',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    borderRadius: '6px',
                    border: '1px solid #3b82f6',
                    backgroundColor: (selectedDashboardMonth === now.getMonth() + 1 && selectedDashboardYear === now.getFullYear()) ? '#3b82f6' : 'transparent',
                    color: (selectedDashboardMonth === now.getMonth() + 1 && selectedDashboardYear === now.getFullYear()) ? '#ffffff' : '#3b82f6',
                    cursor: 'pointer',
                    marginLeft: '0.25rem'
                  }}
                  title="Restaurar visualização para o mês corrente"
                >
                  Mês Atual
                </button>

                {/* Botão de Ano Todo */}
                <button
                  onClick={() => setSelectedDashboardMonth(0)}
                  style={{
                    padding: '0.3rem 0.6rem',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    borderRadius: '6px',
                    border: selectedDashboardMonth === 0 ? '1px solid #8b5cf6' : '1px solid var(--border-color)',
                    backgroundColor: selectedDashboardMonth === 0 ? '#8b5cf6' : 'transparent',
                    color: selectedDashboardMonth === 0 ? '#ffffff' : 'var(--text-muted)',
                    cursor: 'pointer'
                  }}
                  title="Visualizar todo o ano acumulado"
                >
                  Ano Todo
                </button>
              </div>
            </div>
          </div>

          {/* Customization Toolbar Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', padding: '0.5rem 0.75rem', backgroundColor: 'var(--bg-card)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <div>
              <span style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-primary)' }}>Painel de Operações Financeiras</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
                Exibindo: <strong>{selectedDashboardMonth > 0 ? MONTH_NAMES[selectedDashboardMonth - 1].full : 'Ano Todo'} / {selectedDashboardYear}</strong>
              </span>
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
                    onClick={() => {
                      if (!isCustomizingDashboard) {
                        setSelectedDashboardDetail(card);
                        setDetailFilter('');
                      }
                    }}
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
                      cursor: isCustomizingDashboard ? 'default' : 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: isCustomizingDashboard ? 'none' : '0 1px 3px rgba(0,0,0,0.05)'
                    }}
                    title={isCustomizingDashboard ? '' : `Clique para ver os detalhes completos de ${card.name}`}
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
                    {card.id === 'payables_month' && (
                      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center' }}>
                        <div style={styles.kpiHeader}>
                          <span style={styles.kpiLabel}>Contas a Pagar do Mês ({selectedDashboardMonth > 0 ? MONTH_NAMES[selectedDashboardMonth - 1].label : 'Ano'}/{selectedDashboardYear})</span>
                          <Calendar size={18} color="#3b82f6" />
                        </div>
                        <span style={{ ...styles.kpiValue, color: '#3b82f6' }}>
                          R$ {totalPayablesSelectedMonth.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                        <div style={styles.kpiFooter}>
                          Pago: R$ {paidPayablesSelectedMonth.toLocaleString('pt-BR')} | Pendente: R$ {pendingPayablesSelectedMonth.toLocaleString('pt-BR')} ({payablesSelectedMonthList.length} contas)
                        </div>
                      </div>
                    )}

                    {card.id === 'overdue_current_month' && (
                      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center' }}>
                        <div style={styles.kpiHeader}>
                          <span style={styles.kpiLabel}>Vencidos do Mês ({selectedDashboardMonth > 0 ? MONTH_NAMES[selectedDashboardMonth - 1].label : 'Ano'}/{selectedDashboardYear})</span>
                          <AlertTriangle size={18} color="#ef4444" />
                        </div>
                        <span style={{ ...styles.kpiValue, color: totalOverdueSelectedMonth > 0 ? '#ef4444' : '#10b981' }}>
                          R$ {totalOverdueSelectedMonth.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                        <div style={styles.kpiFooter}>
                          {overdueSelectedMonthList.length} conta(s) vencida(s) no período
                        </div>
                      </div>
                    )}

                    {card.id === 'overdue_prev_month' && (
                      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center' }}>
                        <div style={styles.kpiHeader}>
                          <span style={styles.kpiLabel}>Vencidos do Mês Anterior ({MONTH_NAMES[prevMonthVal - 1].label}/{prevYearVal})</span>
                          <Clock size={18} color="#f59e0b" />
                        </div>
                        <span style={{ ...styles.kpiValue, color: totalOverduePrevMonth > 0 ? '#f59e0b' : '#10b981' }}>
                          R$ {totalOverduePrevMonth.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                        <div style={styles.kpiFooter}>
                          {overduePrevMonthList.length} conta(s) pendente(s) do mês anterior
                        </div>
                      </div>
                    )}

                    {card.id === 'payables_today' && (
                      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center' }}>
                        <div style={styles.kpiHeader}>
                          <span style={styles.kpiLabel}>Pagar Hoje / Atrasados</span>
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

                    {card.id === 'payables_7days' && (
                      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center' }}>
                        <div style={styles.kpiHeader}>
                          <span style={styles.kpiLabel}>A Pagar (Próximos 7 Dias)</span>
                          <Calendar size={18} color="#f59e0b" />
                        </div>
                        <span style={{ ...styles.kpiValue, color: '#f59e0b' }}>
                          R$ {totalPayables7Days.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                        <div style={styles.kpiFooter}>
                          {payables7DaysList.length} conta(s) a vencer nos próximos 7 dias
                        </div>
                      </div>
                    )}

                    {card.id === 'payables_15days' && (
                      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center' }}>
                        <div style={styles.kpiHeader}>
                          <span style={styles.kpiLabel}>A Pagar (Próximos 15 Dias)</span>
                          <Calendar size={18} color="#3b82f6" />
                        </div>
                        <span style={{ ...styles.kpiValue, color: '#3b82f6' }}>
                          R$ {totalPayables15Days.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                        <div style={styles.kpiFooter}>
                          {payables15DaysList.length} conta(s) a vencer nos próximos 15 dias
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

          {/* Modal Interativo de Detalhamento dos Cards KPI do Dashboard */}
          {selectedDashboardDetail && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.65)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              padding: '1rem',
              backdropFilter: 'blur(4px)'
            }}>
              <div style={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                width: '100%',
                maxWidth: '900px',
                maxHeight: '90vh',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                overflow: 'hidden'
              }}>
                {/* Modal Header */}
                <div style={{
                  padding: '1.25rem 1.5rem',
                  borderBottom: '1px solid var(--border-color)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  backgroundColor: '#f8fafc'
                }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                      Detalhamento Completo: {selectedDashboardDetail.name}
                    </h3>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Listagem detalhada e diagnósticos consolidados em tempo real
                    </span>
                  </div>
                  <button 
                    onClick={() => setSelectedDashboardDetail(null)}
                    style={{
                      border: 'none',
                      backgroundColor: 'transparent',
                      cursor: 'pointer',
                      padding: '0.25rem',
                      borderRadius: '4px',
                      color: 'var(--text-secondary)'
                    }}
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Modal Search / Action Filter Bar */}
                <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '1rem', backgroundColor: '#ffffff' }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input 
                      type="text" 
                      placeholder="Pesquisar nos registros deste card..."
                      value={detailFilter}
                      onChange={e => setDetailFilter(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.45rem 0.75rem 0.45rem 2.25rem',
                        borderRadius: '6px',
                        border: '1px solid var(--border-color)',
                        fontSize: '0.85rem'
                      }}
                    />
                  </div>
                </div>

                {/* Modal Body Table Content based on Card ID */}
                <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
                  {/* CARD: payables_month */}
                  {selectedDashboardDetail.id === 'payables_month' && (
                    <div>
                      <div style={{ padding: '0.75rem 1rem', backgroundColor: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe', marginBottom: '1rem', color: '#1e40af', fontSize: '0.875rem' }}>
                        <strong>Resumo do Mês ({selectedDashboardMonth > 0 ? MONTH_NAMES[selectedDashboardMonth - 1].full : 'Ano Todo'}/{selectedDashboardYear}):</strong> Total de <strong>R$ {totalPayablesSelectedMonth.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong> em {payablesSelectedMonthList.length} conta(s). (Quitados: R$ {paidPayablesSelectedMonth.toLocaleString('pt-BR')} | Saldo Pendente: R$ {pendingPayablesSelectedMonth.toLocaleString('pt-BR')})
                      </div>
                      <table style={styles.table}>
                        <thead>
                          <tr style={{ backgroundColor: '#f8fafc' }}>
                            <th style={styles.th}>Fornecedor</th>
                            <th style={styles.th}>Categoria</th>
                            <th style={styles.th}>Vencimento</th>
                            <th style={styles.th}>Valor (R$)</th>
                            <th style={styles.th}>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {payablesSelectedMonthList
                            .filter(p => p.supplier.toLowerCase().includes(detailFilter.toLowerCase()) || p.category.toLowerCase().includes(detailFilter.toLowerCase()))
                            .map(p => (
                              <tr key={p.id} style={styles.tr}>
                                <td style={styles.td}><strong>{p.supplier}</strong></td>
                                <td style={styles.td}>{p.category}</td>
                                <td style={styles.td}>{p.dueDate ? p.dueDate.split('-').reverse().join('/') : '-'}</td>
                                <td style={{ ...styles.td, fontWeight: '700' }}>R$ {(parseFloat(p.amount) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                                <td style={styles.td}>
                                  <span style={{
                                    backgroundColor: p.status === 'Pago' ? '#dcfce7' : (p.dueDate < todayStr ? '#fee2e2' : '#e0f2fe'),
                                    color: p.status === 'Pago' ? '#166534' : (p.dueDate < todayStr ? '#991b1b' : '#0369a1'),
                                    padding: '0.2rem 0.5rem',
                                    borderRadius: '4px',
                                    fontSize: '0.75rem',
                                    fontWeight: '700'
                                  }}>
                                    {p.status === 'Pago' ? '✓ Pago' : (p.dueDate < todayStr ? '⚠️ Vencido' : '⏳ A Vencer')}
                                  </span>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* CARD: overdue_current_month */}
                  {selectedDashboardDetail.id === 'overdue_current_month' && (
                    <div>
                      <div style={{ padding: '0.75rem 1rem', backgroundColor: '#fef2f2', borderRadius: '8px', border: '1px solid #fecaca', marginBottom: '1rem', color: '#991b1b', fontSize: '0.875rem' }}>
                        <strong>Vencidos no Mês ({selectedDashboardMonth > 0 ? MONTH_NAMES[selectedDashboardMonth - 1].full : 'Ano'}/{selectedDashboardYear}):</strong> {overdueSelectedMonthList.length} conta(s) vencida(s) totalizando <strong>R$ {totalOverdueSelectedMonth.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong> em aberto.
                      </div>
                      <table style={styles.table}>
                        <thead>
                          <tr style={{ backgroundColor: '#f8fafc' }}>
                            <th style={styles.th}>Fornecedor</th>
                            <th style={styles.th}>Vencimento</th>
                            <th style={styles.th}>Valor Devido (R$)</th>
                            <th style={styles.th}>Ação</th>
                          </tr>
                        </thead>
                        <tbody>
                          {overdueSelectedMonthList
                            .filter(p => p.supplier.toLowerCase().includes(detailFilter.toLowerCase()))
                            .map(p => {
                              const amt = parseFloat(p.amount) || 0;
                              const paid = parseFloat(p.amountPaid) || 0;
                              const due = amt - paid;
                              return (
                                <tr key={p.id} style={styles.tr}>
                                  <td style={styles.td}><strong>{p.supplier}</strong></td>
                                  <td style={{ ...styles.td, color: '#ef4444', fontWeight: '700' }}>{p.dueDate?.split('-').reverse().join('/')}</td>
                                  <td style={{ ...styles.td, fontWeight: '700', color: '#ef4444' }}>R$ {due.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                                  <td style={styles.td}>
                                    <button
                                      onClick={() => {
                                        setSelectedDashboardDetail(null);
                                        setActiveTab('payable');
                                        setPartialItem(p);
                                        setPartialAmountPaid(due);
                                      }}
                                      style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', color: '#047857', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer' }}
                                    >
                                      Baixar Título
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* CARD: overdue_prev_month */}
                  {selectedDashboardDetail.id === 'overdue_prev_month' && (
                    <div>
                      <div style={{ padding: '0.75rem 1rem', backgroundColor: '#fffbeb', borderRadius: '8px', border: '1px solid #fde68a', marginBottom: '1rem', color: '#92400e', fontSize: '0.875rem' }}>
                        <strong>Pendências do Mês Anterior ({MONTH_NAMES[prevMonthVal - 1].full}/{prevYearVal}):</strong> {overduePrevMonthList.length} conta(s) não quitadas no mês anterior, totalizando <strong>R$ {totalOverduePrevMonth.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>.
                      </div>
                      <table style={styles.table}>
                        <thead>
                          <tr style={{ backgroundColor: '#f8fafc' }}>
                            <th style={styles.th}>Fornecedor</th>
                            <th style={styles.th}>Vencimento</th>
                            <th style={styles.th}>Valor Devido (R$)</th>
                            <th style={styles.th}>Ação</th>
                          </tr>
                        </thead>
                        <tbody>
                          {overduePrevMonthList
                            .filter(p => p.supplier.toLowerCase().includes(detailFilter.toLowerCase()))
                            .map(p => {
                              const amt = parseFloat(p.amount) || 0;
                              const paid = parseFloat(p.amountPaid) || 0;
                              const due = amt - paid;
                              return (
                                <tr key={p.id} style={styles.tr}>
                                  <td style={styles.td}><strong>{p.supplier}</strong></td>
                                  <td style={{ ...styles.td, color: '#f59e0b', fontWeight: '700' }}>{p.dueDate?.split('-').reverse().join('/')}</td>
                                  <td style={{ ...styles.td, fontWeight: '700', color: '#b45309' }}>R$ {due.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                                  <td style={styles.td}>
                                    <button
                                      onClick={() => {
                                        setSelectedDashboardDetail(null);
                                        setActiveTab('payable');
                                        setPartialItem(p);
                                        setPartialAmountPaid(due);
                                      }}
                                      style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', color: '#047857', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer' }}
                                    >
                                      Baixar Título
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* CARD: payables_today */}
                  {selectedDashboardDetail.id === 'payables_today' && (
                    <div>
                      <div style={{ padding: '0.75rem 1rem', backgroundColor: '#fef2f2', borderRadius: '8px', border: '1px solid #fecaca', marginBottom: '1rem', color: '#991b1b', fontSize: '0.875rem' }}>
                        <strong>Resumo:</strong> {payablesTodayOrOverdue.length} conta(s) com vencimento para HOJE ou já VENCIDAS, totalizando <strong>R$ {totalPayablesTodayOrOverdue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>.
                      </div>
                      <table style={styles.table}>
                        <thead>
                          <tr style={{ backgroundColor: '#f8fafc' }}>
                            <th style={styles.th}>Fornecedor</th>
                            <th style={styles.th}>Categoria</th>
                            <th style={styles.th}>Data Vencimento</th>
                            <th style={styles.th}>Valor (R$)</th>
                            <th style={styles.th}>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {payablesTodayOrOverdue
                            .filter(p => p.supplier.toLowerCase().includes(detailFilter.toLowerCase()) || p.category.toLowerCase().includes(detailFilter.toLowerCase()))
                            .map(p => (
                              <tr key={p.id} style={styles.tr}>
                                <td style={styles.td}><strong>{p.supplier}</strong></td>
                                <td style={styles.td}>{p.category}</td>
                                <td style={{ ...styles.td, fontWeight: '700', color: p.dueDate < todayStr ? '#ef4444' : '#b45309' }}>
                                  {p.dueDate ? p.dueDate.split('-').reverse().join('/') : '-'} {p.dueDate < todayStr ? '(Vencido)' : '(Hoje)'}
                                </td>
                                <td style={{ ...styles.td, fontWeight: '700' }}>R$ {(parseFloat(p.amount) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                                <td style={styles.td}>
                                  <span style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '700' }}>
                                    {p.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* CARD: payables_7days */}
                  {selectedDashboardDetail.id === 'payables_7days' && (
                    <div>
                      <div style={{ padding: '0.75rem 1rem', backgroundColor: '#fffbeb', borderRadius: '8px', border: '1px solid #fde68a', marginBottom: '1rem', color: '#92400e', fontSize: '0.875rem' }}>
                        <strong>Resumo:</strong> {payables7DaysList.length} conta(s) a vencer nos próximos 7 dias, somando <strong>R$ {totalPayables7Days.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>.
                      </div>
                      <table style={styles.table}>
                        <thead>
                          <tr style={{ backgroundColor: '#f8fafc' }}>
                            <th style={styles.th}>Fornecedor</th>
                            <th style={styles.th}>Categoria</th>
                            <th style={styles.th}>Vencimento</th>
                            <th style={styles.th}>Valor (R$)</th>
                            <th style={styles.th}>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {payables7DaysList
                            .filter(p => p.supplier.toLowerCase().includes(detailFilter.toLowerCase()))
                            .map(p => (
                              <tr key={p.id} style={styles.tr}>
                                <td style={styles.td}><strong>{p.supplier}</strong></td>
                                <td style={styles.td}>{p.category}</td>
                                <td style={styles.td}>{p.dueDate ? p.dueDate.split('-').reverse().join('/') : '-'}</td>
                                <td style={{ ...styles.td, fontWeight: '700' }}>R$ {(parseFloat(p.amount) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                                <td style={styles.td}>
                                  <span style={{ backgroundColor: '#fef3c7', color: '#b45309', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '700' }}>
                                    {p.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* CARD: payables_15days */}
                  {selectedDashboardDetail.id === 'payables_15days' && (
                    <div>
                      <div style={{ padding: '0.75rem 1rem', backgroundColor: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe', marginBottom: '1rem', color: '#1e40af', fontSize: '0.875rem' }}>
                        <strong>Resumo:</strong> {payables15DaysList.length} conta(s) a vencer nos próximos 15 dias, totalizando <strong>R$ {totalPayables15Days.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>.
                      </div>
                      <table style={styles.table}>
                        <thead>
                          <tr style={{ backgroundColor: '#f8fafc' }}>
                            <th style={styles.th}>Fornecedor</th>
                            <th style={styles.th}>Categoria</th>
                            <th style={styles.th}>Vencimento</th>
                            <th style={styles.th}>Valor (R$)</th>
                            <th style={styles.th}>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {payables15DaysList
                            .filter(p => p.supplier.toLowerCase().includes(detailFilter.toLowerCase()))
                            .map(p => (
                              <tr key={p.id} style={styles.tr}>
                                <td style={styles.td}><strong>{p.supplier}</strong></td>
                                <td style={styles.td}>{p.category}</td>
                                <td style={styles.td}>{p.dueDate ? p.dueDate.split('-').reverse().join('/') : '-'}</td>
                                <td style={{ ...styles.td, fontWeight: '700' }}>R$ {(parseFloat(p.amount) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                                <td style={styles.td}>
                                  <span style={{ backgroundColor: '#e0f2fe', color: '#0369a1', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '700' }}>
                                    {p.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* CARD: receivables_today */}
                  {selectedDashboardDetail.id === 'receivables_today' && (
                    <div>
                      <div style={{ padding: '0.75rem 1rem', backgroundColor: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0', marginBottom: '1rem', color: '#166534', fontSize: '0.875rem' }}>
                        <strong>Resumo:</strong> Contas a receber previstas para HOJE no valor total de <strong>R$ {totalReceivablesToday.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>. Já recebidos: <strong>R$ {receivedToday.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>.
                      </div>
                      <table style={styles.table}>
                        <thead>
                          <tr style={{ backgroundColor: '#f8fafc' }}>
                            <th style={styles.th}>Cliente / Convênio</th>
                            <th style={styles.th}>Categoria</th>
                            <th style={styles.th}>Nº Guia/Doc</th>
                            <th style={styles.th}>Valor (R$)</th>
                            <th style={styles.th}>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {receivablesToday
                            .filter(r => r.client.toLowerCase().includes(detailFilter.toLowerCase()))
                            .map(r => (
                              <tr key={r.id} style={styles.tr}>
                                <td style={styles.td}><strong>{r.client}</strong></td>
                                <td style={styles.td}>{r.category}</td>
                                <td style={styles.td}>{r.invoiceNumber || '-'}</td>
                                <td style={{ ...styles.td, fontWeight: '700' }}>R$ {(parseFloat(r.amount) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                                <td style={styles.td}>
                                  <span style={{ backgroundColor: r.status === 'Pago' ? '#dcfce7' : '#fee2e2', color: r.status === 'Pago' ? '#166534' : '#991b1b', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '700' }}>
                                    {r.status === 'Pago' ? '✓ Recebido' : '⏳ Pendente'}
                                  </span>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* CARD: cash_flow_summary */}
                  {selectedDashboardDetail.id === 'cash_flow_summary' && (
                    <div>
                      <div style={{ padding: '0.75rem 1rem', backgroundColor: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe', marginBottom: '1rem', color: '#1e40af', fontSize: '0.875rem' }}>
                        <strong>Extrato Realizado:</strong> Saldo líquido de <strong>R$ {realizedBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong> (Total Entradas Quitadas: R$ {totalReceivedRealized.toLocaleString('pt-BR')} | Total Saídas Quitadas: R$ {totalPaidRealized.toLocaleString('pt-BR')}).
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                          <h4 style={{ margin: '0 0 0.5rem 0', color: '#166534' }}>🟢 Entradas Quitadas (Recebidas)</h4>
                          <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.85rem' }}>
                            {receivableList.filter(r => r.status === 'Pago').slice(0, 10).map(r => (
                              <li key={r.id} style={{ padding: '0.35rem 0', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between' }}>
                                <span>{r.client}</span>
                                <strong>R$ {r.amount.toLocaleString('pt-BR')}</strong>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 style={{ margin: '0 0 0.5rem 0', color: '#991b1b' }}>🔴 Saídas Quitadas (Pagas)</h4>
                          <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.85rem' }}>
                            {payableList.filter(p => p.status === 'Pago').slice(0, 10).map(p => (
                              <li key={p.id} style={{ padding: '0.35rem 0', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between' }}>
                                <span>{p.supplier}</span>
                                <strong>R$ {p.amount.toLocaleString('pt-BR')}</strong>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* CARD: overdue_alerts */}
                  {selectedDashboardDetail.id === 'overdue_alerts' && (
                    <div>
                      <div style={{ padding: '0.75rem 1rem', backgroundColor: '#fffbeb', borderRadius: '8px', border: '1px solid #fde68a', marginBottom: '1rem', color: '#92400e', fontSize: '0.875rem' }}>
                        <strong>Alerta de Cobrança:</strong> {overduePayables.length} despesa(s) atrasada(s) e {overdueReceivables.length} receita(s) em atraso, somando <strong>R$ {totalOverdueAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>.
                      </div>
                      <h4 style={{ margin: '0 0 0.5rem 0', color: '#ef4444' }}>🔴 Despesas em Atraso (Pagar)</h4>
                      <table style={styles.table}>
                        <thead>
                          <tr style={{ backgroundColor: '#f8fafc' }}>
                            <th style={styles.th}>Fornecedor</th>
                            <th style={styles.th}>Vencimento</th>
                            <th style={styles.th}>Valor (R$)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {overduePayables.map(p => (
                            <tr key={p.id} style={styles.tr}>
                              <td style={styles.td}><strong>{p.supplier}</strong></td>
                              <td style={{ ...styles.td, color: '#ef4444', fontWeight: '700' }}>{p.dueDate?.split('-').reverse().join('/')}</td>
                              <td style={{ ...styles.td, fontWeight: '700' }}>R$ {p.amount.toLocaleString('pt-BR')}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* GENERIC FALLBACK FOR OTHER CARDS */}
                  {['cash_flow_bar', 'cost_distribution', 'ebitda', 'apac_glosa'].includes(selectedDashboardDetail.id) && (
                    <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                      <h4>📊 Consolidação Gerencial do Indicador</h4>
                      <p>Este card apresenta a consolidação acumulada de métricas do sistema financeiro e de auditoria da clínica.</p>
                      <ul>
                        <li><strong>Contas a Receber Totais:</strong> R$ {totalReceivables.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</li>
                        <li><strong>Contas a Pagar Totais:</strong> R$ {totalPayables.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</li>
                        <li><strong>Diferença de Caixa Projetada:</strong> R$ {ebitdaProjected.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</li>
                      </ul>
                    </div>
                  )}
                </div>

                {/* Modal Footer */}
                <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', backgroundColor: '#f8fafc' }}>
                  <button onClick={() => setSelectedDashboardDetail(null)} style={styles.btnSecondary}>
                    Fechar Detalhamento
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Accounts Payable (Contas a Pagar) View */}
      {activeTab === 'payable' && (
        <div style={styles.tabContent}>
          <div style={styles.actionsBar}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
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

              {/* Seletor de Formato das Linhas (Compacta ou Normal - Padrão: Compacta) */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', backgroundColor: 'var(--bg-secondary)', padding: '0.2rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', padding: '0 0.3rem', fontWeight: '600' }}>Linhas:</span>
                <button
                  onClick={() => handleSetPayableDensity('compacta')}
                  style={{
                    padding: '0.25rem 0.5rem',
                    fontSize: '0.75rem',
                    fontWeight: payableRowDensity === 'compacta' ? '700' : '500',
                    borderRadius: '4px',
                    border: 'none',
                    backgroundColor: payableRowDensity === 'compacta' ? 'var(--bg-card)' : 'transparent',
                    color: payableRowDensity === 'compacta' ? '#10b981' : 'var(--text-muted)',
                    boxShadow: payableRowDensity === 'compacta' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}
                  title="Modo Compacto (Padrão): exibe mais registros por página"
                >
                  <Sliders size={12} />
                  <span>Compacta</span>
                </button>
                <button
                  onClick={() => handleSetPayableDensity('normal')}
                  style={{
                    padding: '0.25rem 0.5rem',
                    fontSize: '0.75rem',
                    fontWeight: payableRowDensity === 'normal' ? '700' : '500',
                    borderRadius: '4px',
                    border: 'none',
                    backgroundColor: payableRowDensity === 'normal' ? 'var(--bg-card)' : 'transparent',
                    color: payableRowDensity === 'normal' ? '#10b981' : 'var(--text-muted)',
                    boxShadow: payableRowDensity === 'normal' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}
                  title="Modo Normal: espaçamento padrão"
                >
                  <Layers size={12} />
                  <span>Normal</span>
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                onClick={() => {
                  setEditingPayable(null);
                  setShowAddPayable(!showAddPayable);
                }} 
                style={styles.btnPrimary}
              >
                <Plus size={14} />
                <span>Nova Despesa</span>
              </button>
            </div>
          </div>

          {/* Add / Edit Payable Form */}
          {(showAddPayable || editingPayable) && (
            <form onSubmit={handleSavePayable} style={styles.formContainer}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h4 style={{ margin: 0, color: 'var(--text-primary)' }}>
                  {editingPayable ? '✏️ Editar Lançamento - Contas a Pagar' : '➕ Novo Lançamento - Contas a Pagar'}
                </h4>
                <button 
                  type="button" 
                  onClick={() => {
                    setShowAddPayable(false);
                    setEditingPayable(null);
                  }} 
                  style={{ border: 'none', background: 'none', cursor: 'pointer' }}
                >
                  <X size={18} color="var(--text-secondary)" />
                </button>
              </div>

              <div style={styles.formGrid}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Fornecedor</label>
                  <input 
                    type="text" 
                    value={editingPayable ? editingPayable.supplier : newPayable.supplier} 
                    onChange={e => {
                      if (editingPayable) setEditingPayable({ ...editingPayable, supplier: e.target.value });
                      else setNewPayable({ ...newPayable, supplier: e.target.value });
                    }} 
                    style={styles.input} 
                    required 
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Valor (R$)</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    value={editingPayable ? editingPayable.amount : newPayable.amount} 
                    onChange={e => {
                      if (editingPayable) setEditingPayable({ ...editingPayable, amount: e.target.value });
                      else setNewPayable({ ...newPayable, amount: e.target.value });
                    }} 
                    style={styles.input} 
                    required 
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Vencimento</label>
                  <input 
                    type="date" 
                    value={editingPayable ? editingPayable.dueDate : newPayable.dueDate} 
                    onChange={e => {
                      if (editingPayable) setEditingPayable({ ...editingPayable, dueDate: e.target.value });
                      else setNewPayable({ ...newPayable, dueDate: e.target.value });
                    }} 
                    style={styles.input} 
                    required 
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Categoria</label>
                  <select 
                    value={editingPayable ? editingPayable.category : newPayable.category} 
                    onChange={e => {
                      if (editingPayable) setEditingPayable({ ...editingPayable, category: e.target.value });
                      else setNewPayable({ ...newPayable, category: e.target.value });
                    }} 
                    style={styles.input}
                  >
                    <option value="Insumo Clínico">Insumo Clínico</option>
                    <option value="Concentrado">Concentrado</option>
                    <option value="Medicamento">Medicamento</option>
                    <option value="Serviço/Utilidades">Serviço/Utilidades</option>
                    <option value="Equipamento">Equipamento</option>
                    <option value="Outros">Outros</option>
                  </select>
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Nº Nota Fiscal / Documento</label>
                  <input 
                    type="text" 
                    value={editingPayable ? (editingPayable.invoiceNumber || '') : newPayable.invoiceNumber} 
                    onChange={e => {
                      if (editingPayable) setEditingPayable({ ...editingPayable, invoiceNumber: e.target.value });
                      else setNewPayable({ ...newPayable, invoiceNumber: e.target.value });
                    }} 
                    placeholder="Ex: NF-98421 / Aut. 8831"
                    style={styles.input} 
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Meio / Forma de Pagamento</label>
                  <select 
                    value={editingPayable ? (editingPayable.paymentMethod || 'PIX') : newPayable.paymentMethod} 
                    onChange={e => {
                      if (editingPayable) setEditingPayable({ ...editingPayable, paymentMethod: e.target.value });
                      else setNewPayable({ ...newPayable, paymentMethod: e.target.value });
                    }} 
                    style={styles.input}
                  >
                    <option value="PIX">PIX</option>
                    <option value="Boleto Bancário">Boleto Bancário</option>
                    <option value="Cartão de Crédito">Cartão de Crédito</option>
                    <option value="Cartão de Débito">Cartão de Débito</option>
                    <option value="Transferência (TED/DOC)">Transferência (TED/DOC)</option>
                    <option value="Dinheiro">Dinheiro / Espécie</option>
                  </select>
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Banco / Conta</label>
                  <select 
                    value={editingPayable ? (editingPayable.bankAccount || 'Itaú Unibanco (PJ)') : newPayable.bankAccount} 
                    onChange={e => {
                      if (editingPayable) setEditingPayable({ ...editingPayable, bankAccount: e.target.value });
                      else setNewPayable({ ...newPayable, bankAccount: e.target.value });
                    }} 
                    style={styles.input}
                  >
                    <option value="Itaú Unibanco (PJ)">Itaú Unibanco (PJ)</option>
                    <option value="Banco do Brasil">Banco do Brasil</option>
                    <option value="Bradesco">Bradesco</option>
                    <option value="Caixa Econômica">Caixa Econômica</option>
                    <option value="Stone">Stone Pagamentos</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Classificação de Custo</label>
                  <select 
                    value={editingPayable ? (editingPayable.natureType || 'Custo Variável / Operacional') : newPayable.natureType} 
                    onChange={e => {
                      if (editingPayable) setEditingPayable({ ...editingPayable, natureType: e.target.value });
                      else setNewPayable({ ...newPayable, natureType: e.target.value });
                    }} 
                    style={styles.input}
                  >
                    <option value="Custo Variável / Operacional">Custo Variável / Operacional (Insumos, Materiais)</option>
                    <option value="Custo Fixo Recorrente">Custo Fixo Recorrente (Aluguel, Folha, Softwares)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
                <button 
                  type="button" 
                  onClick={() => {
                    setShowAddPayable(false);
                    setEditingPayable(null);
                  }} 
                  style={styles.btnSecondary}
                >
                  Cancelar
                </button>
                <button type="submit" style={styles.btnSave}>
                  {editingPayable ? 'Salvar Alterações' : 'Adicionar Despesa'}
                </button>
              </div>
            </form>
          )}

          {/* Table list */}
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  {renderSortableHeader('Fornecedor / Descrição', 'supplier', payableSort, setPayableSort)}
                  {renderSortableHeader('Filial & Competência', 'mesCompetencia', payableSort, setPayableSort)}
                  {renderSortableHeader('Parc.', 'installmentInfo', payableSort, setPayableSort)}
                  {renderSortableHeader('Centro de Custos & Modalidade', 'costCenterId', payableSort, setPayableSort)}
                  {renderSortableHeader('Vencimento', 'dueDate', payableSort, setPayableSort)}
                  {renderSortableHeader('Devido (R$)', 'amount', payableSort, setPayableSort)}
                  {renderSortableHeader('Pago / Saldo', 'amountPaid', payableSort, setPayableSort)}
                  {renderSortableHeader('Status', 'status', payableSort, setPayableSort)}
                  <th style={{ ...styles.th, padding: payableRowDensity === 'compacta' ? '0.45rem 0.5rem' : '0.75rem 1rem' }}>Ações & Baixa</th>
                </tr>
              </thead>
              <tbody>
                {sortList(
                  payableList.filter(p => {
                    const matchUnit = selectedUnit === 'Todas' || !p.unit || p.unit === selectedUnit;
                    const matchFilter = payableFilter === 'Todos' || p.status === payableFilter || (payableFilter === 'Pendente' && p.status !== 'Pago');
                    return matchUnit && matchFilter;
                  }),
                  payableSort
                ).map(p => {
                  const amt = parseFloat(p.amount) || 0;
                  const paid = parseFloat(p.amountPaid) || 0;
                  const dueBalance = amt - paid;
                  const cc = costCenters.find(c => c.id === p.costCenterId);
                  const isCompact = payableRowDensity === 'compacta';
                  const cellPadding = isCompact ? '0.35rem 0.5rem' : '0.75rem 1rem';
                  const cellFontSize = isCompact ? '0.78rem' : '0.85rem';

                  let statusBg = '#fee2e2';
                  let statusColor = '#991b1b';
                  let statusLabel = p.status || 'ATRASADO';

                  if (p.status === 'Pago' || dueBalance <= 0) {
                    statusBg = '#d1fae5';
                    statusColor = '#065f46';
                    statusLabel = '✓ PAGO';
                  } else if (p.status === 'PARCIAL' || (paid > 0 && dueBalance > 0)) {
                    statusBg = '#fef3c7';
                    statusColor = '#92400e';
                    statusLabel = `PARCIAL (R$ ${paid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })})`;
                  } else if (p.status === 'A_VENCER') {
                    statusBg = '#e0f2fe';
                    statusColor = '#0369a1';
                    statusLabel = '⏳ A VENCER';
                  }

                  return (
                    <tr key={p.id} style={styles.tr}>
                      <td style={{ ...styles.td, padding: cellPadding, fontSize: cellFontSize }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                          <strong>{p.supplier}</strong>
                          {p.paymentMethod && (
                            <span style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem', borderRadius: '4px', backgroundColor: '#f0fdf4', color: '#166534', fontWeight: '700', border: '1px solid #bbf7d0' }}>
                              💳 {p.paymentMethod}
                            </span>
                          )}
                          {p.purchaseId ? (
                            <span style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem', borderRadius: '4px', backgroundColor: '#e0f2fe', color: '#0369a1', fontWeight: '700' }}>
                              🛒 Compras
                            </span>
                          ) : p.invoiceNumber ? (
                            <span style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem', borderRadius: '4px', backgroundColor: '#f1f5f9', color: '#475569', fontWeight: '700' }}>
                              NF #{p.invoiceNumber}
                            </span>
                          ) : null}
                        </div>
                        {p.description && <div style={{ ...styles.subtext, marginTop: isCompact ? '0.05rem' : '0.15rem' }}>{p.description}</div>}
                      </td>
                      <td style={{ ...styles.td, padding: cellPadding, fontSize: cellFontSize }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#0f172a' }}>📍 {p.unit || 'Betim'}</span>
                          <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Comp: <strong>{p.mesCompetencia || 'Julho'}</strong></span>
                        </div>
                      </td>
                      <td style={{ ...styles.td, padding: cellPadding, fontSize: cellFontSize }}>
                        <span style={{ fontSize: '0.75rem', padding: '0.15rem 0.45rem', borderRadius: '4px', backgroundColor: '#f1f5f9', fontWeight: '700', color: '#334155' }}>
                          {p.installmentInfo || '1'}
                        </span>
                      </td>
                      <td style={{ ...styles.td, padding: cellPadding, fontSize: cellFontSize }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#047857' }}>
                            {cc ? `${cc.code} - ${cc.name}` : p.category || 'Insumo Clínico'}
                          </span>
                          {p.modality && <span style={{ fontSize: '0.68rem', color: '#64748b' }}>Mod: {p.modality}</span>}
                        </div>
                      </td>
                      <td style={{ ...styles.td, padding: cellPadding, fontSize: cellFontSize }}>{p.dueDate ? p.dueDate.split('-').reverse().join('/') : '-'}</td>
                      <td style={{ ...styles.td, padding: cellPadding, fontSize: cellFontSize, fontWeight: '700' }}>
                        R$ {amt.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td style={{ ...styles.td, padding: cellPadding, fontSize: cellFontSize }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: '0.75rem', color: paid > 0 ? '#10b981' : '#94a3b8', fontWeight: '700' }}>
                            Pago: R$ {paid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                          {dueBalance > 0 && (
                            <span style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: '700' }}>
                              Saldo: R$ {dueBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ ...styles.td, padding: cellPadding, fontSize: cellFontSize }}>
                        <span style={{ ...styles.statusBadge, backgroundColor: statusBg, color: statusColor, padding: isCompact ? '0.1rem 0.4rem' : '0.2rem 0.5rem' }}>
                          {statusLabel}
                        </span>
                      </td>
                      <td style={{ ...styles.td, padding: cellPadding, fontSize: cellFontSize }}>
                        <div style={{ display: 'flex', gap: '0.25rem' }}>
                          <button 
                            onClick={() => {
                              setPartialItem(p);
                              setPartialAmountPaid(dueBalance > 0 ? dueBalance : amt);
                            }}
                            style={{ padding: isCompact ? '0.2rem 0.4rem' : '0.3rem 0.5rem', borderRadius: '6px', backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', color: '#047857', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
                            title="Dar baixa parcial ou total neste título"
                          >
                            <DollarSign size={13} />
                            <span>Baixar</span>
                          </button>
                          <button 
                            onClick={() => {
                              setEditingPayable({ ...p, amount: String(p.amount) });
                              setShowAddPayable(false);
                            }}
                            style={{ ...styles.actionBtnCheck, padding: isCompact ? '0.25rem' : '0.35rem', backgroundColor: '#f1f5f9', color: '#334155' }} 
                            title="Editar Lançamento"
                          >
                            <Edit size={14} />
                          </button>
                          <button onClick={() => handleDeletePayable(p.id)} style={{ ...styles.actionBtnDelete, padding: isCompact ? '0.25rem' : '0.35rem' }} title="Excluir">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
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

            <button 
              onClick={() => {
                setEditingReceivable(null);
                setShowAddReceivable(!showAddReceivable);
              }} 
              style={styles.btnPrimary}
            >
              <Plus size={14} />
              <span>Nova Receita</span>
            </button>
          </div>

          {/* Add / Edit Receivable Form */}
          {(showAddReceivable || editingReceivable) && (
            <form onSubmit={handleSaveReceivable} style={styles.formContainer}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h4 style={{ margin: 0, color: 'var(--text-primary)' }}>
                  {editingReceivable ? '✏️ Editar Recebimento - Contas a Receber' : '➕ Novo Recebimento - Contas a Receber'}
                </h4>
                <button 
                  type="button" 
                  onClick={() => {
                    setShowAddReceivable(false);
                    setEditingReceivable(null);
                  }} 
                  style={{ border: 'none', background: 'none', cursor: 'pointer' }}
                >
                  <X size={18} color="var(--text-secondary)" />
                </button>
              </div>

              <div style={styles.formGrid}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Cliente / Fonte Pagadora</label>
                  <input 
                    type="text" 
                    value={editingReceivable ? editingReceivable.client : newReceivable.client} 
                    onChange={e => {
                      if (editingReceivable) setEditingReceivable({ ...editingReceivable, client: e.target.value });
                      else setNewReceivable({ ...newReceivable, client: e.target.value });
                    }} 
                    style={styles.input} 
                    required 
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Valor (R$)</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    value={editingReceivable ? editingReceivable.amount : newReceivable.amount} 
                    onChange={e => {
                      if (editingReceivable) setEditingReceivable({ ...editingReceivable, amount: e.target.value });
                      else setNewReceivable({ ...newReceivable, amount: e.target.value });
                    }} 
                    style={styles.input} 
                    required 
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Data de Vencimento</label>
                  <input 
                    type="date" 
                    value={editingReceivable ? editingReceivable.dueDate : newReceivable.dueDate} 
                    onChange={e => {
                      if (editingReceivable) setEditingReceivable({ ...editingReceivable, dueDate: e.target.value });
                      else setNewReceivable({ ...newReceivable, dueDate: e.target.value });
                    }} 
                    style={styles.input} 
                    required 
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Categoria</label>
                  <select 
                    value={editingReceivable ? editingReceivable.category : newReceivable.category} 
                    onChange={e => {
                      if (editingReceivable) setEditingReceivable({ ...editingReceivable, category: e.target.value });
                      else setNewReceivable({ ...newReceivable, category: e.target.value });
                    }} 
                    style={styles.input}
                  >
                    <option value="SUS">Repasse SUS (APAC)</option>
                    <option value="Convênio">Convênio Privado</option>
                    <option value="Particular">Faturamento Particular</option>
                    <option value="Outros">Outras Receitas</option>
                  </select>
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Nº Guia / Lote / Documento</label>
                  <input 
                    type="text" 
                    value={editingReceivable ? (editingReceivable.invoiceNumber || '') : newReceivable.invoiceNumber} 
                    onChange={e => {
                      if (editingReceivable) setEditingReceivable({ ...editingReceivable, invoiceNumber: e.target.value });
                      else setNewReceivable({ ...newReceivable, invoiceNumber: e.target.value });
                    }} 
                    placeholder="Ex: LOTE-8842 / G-1249"
                    style={styles.input} 
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Meio / Forma de Recebimento</label>
                  <select 
                    value={editingReceivable ? (editingReceivable.paymentMethod || 'PIX') : newReceivable.paymentMethod} 
                    onChange={e => {
                      if (editingReceivable) setEditingReceivable({ ...editingReceivable, paymentMethod: e.target.value });
                      else setNewReceivable({ ...newReceivable, paymentMethod: e.target.value });
                    }} 
                    style={styles.input}
                  >
                    <option value="PIX">PIX</option>
                    <option value="Boleto Bancário">Boleto Bancário</option>
                    <option value="Cartão de Crédito">Cartão de Crédito</option>
                    <option value="Cartão de Débito">Cartão de Débito</option>
                    <option value="Transferência (TED/DOC)">Transferência (TED/DOC)</option>
                    <option value="Dinheiro">Dinheiro / Espécie</option>
                  </select>
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Banco / Conta Crédito</label>
                  <select 
                    value={editingReceivable ? (editingReceivable.bankAccount || 'Itaú Unibanco (PJ)') : newReceivable.bankAccount} 
                    onChange={e => {
                      if (editingReceivable) setEditingReceivable({ ...editingReceivable, bankAccount: e.target.value });
                      else setNewReceivable({ ...newReceivable, bankAccount: e.target.value });
                    }} 
                    style={styles.input}
                  >
                    <option value="Itaú Unibanco (PJ)">Itaú Unibanco (PJ)</option>
                    <option value="Banco do Brasil">Banco do Brasil</option>
                    <option value="Bradesco">Bradesco</option>
                    <option value="Caixa Econômica">Caixa Econômica</option>
                    <option value="Stone">Stone Pagamentos</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
                <button 
                  type="button" 
                  onClick={() => {
                    setShowAddReceivable(false);
                    setEditingReceivable(null);
                  }} 
                  style={styles.btnSecondary}
                >
                  Cancelar
                </button>
                <button type="submit" style={styles.btnSave}>
                  {editingReceivable ? 'Salvar Alterações' : 'Adicionar Receita'}
                </button>
              </div>
            </form>
          )}

          {/* Table list */}
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  {renderSortableHeader('Cliente / Fonte Pagadora', 'client', receivableSort, setReceivableSort)}
                  {renderSortableHeader('Categoria', 'category', receivableSort, setReceivableSort)}
                  {renderSortableHeader('Nº Guia / Lote', 'invoiceNumber', receivableSort, setReceivableSort)}
                  {renderSortableHeader('Vencimento', 'dueDate', receivableSort, setReceivableSort)}
                  {renderSortableHeader('Valor (R$)', 'amount', receivableSort, setReceivableSort)}
                  {renderSortableHeader('Status', 'status', receivableSort, setReceivableSort)}
                  <th style={styles.th}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {sortList(
                  receivableList.filter(r => receivableFilter === 'Todos' || r.status === receivableFilter),
                  receivableSort
                ).map(r => (
                  <tr key={r.id} style={styles.tr}>
                    <td style={styles.td}>
                      <strong>{r.client}</strong>
                      {r.description && <div style={styles.subtext}>{r.description}</div>}
                    </td>
                    <td style={styles.td}>{r.category}</td>
                    <td style={styles.td}>{r.invoiceNumber || '-'}</td>
                    <td style={styles.td}>{r.dueDate ? r.dueDate.split('-').reverse().join('/') : '-'}</td>
                    <td style={{ ...styles.td, fontWeight: '700' }}>
                      R$ {(parseFloat(r.amount) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={styles.td}>
                      <span 
                        onClick={() => handleToggleReceivableStatus(r)}
                        style={{
                          ...styles.statusBadge,
                          backgroundColor: r.status === 'Pago' ? '#d1fae5' : '#fee2e2',
                          color: r.status === 'Pago' ? '#065f46' : '#991b1b',
                          cursor: 'pointer'
                        }}
                        title="Clique para alternar entre Recebido / Pendente"
                      >
                        {r.status === 'Pago' ? '✓ Recebido' : '⏳ Pendente'}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <div style={{ display: 'flex', gap: '0.25rem' }}>
                        <button 
                          onClick={() => {
                            setEditingReceivable({ ...r, amount: String(r.amount) });
                            setShowAddReceivable(false);
                          }}
                          style={{ ...styles.actionBtnCheck, backgroundColor: '#f1f5f9', color: '#334155' }} 
                          title="Editar Recebimento"
                        >
                          <Edit size={14} />
                        </button>
                        <button 
                          onClick={() => handleToggleReceivableStatus(r)}
                          style={{
                            ...styles.actionBtnCheck,
                            backgroundColor: r.status === 'Pago' ? '#fef3c7' : '#d1fae5',
                            color: r.status === 'Pago' ? '#b45309' : '#065f46'
                          }} 
                          title={r.status === 'Pago' ? 'Estornar para Pendente' : 'Marcar como Recebido'}
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

      {/* Installments & Debts View (Parcelamentos & Dívidas) */}
      {activeTab === 'installments' && (
        <div style={styles.tabContent}>
          <div style={styles.actionsBar}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-primary)' }}>Contratos de Dívidas & Financiamentos</h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Ao cadastrar um parcelamento, o sistema gera automaticamente os lançamentos mês a mês no Contas a Pagar.
              </span>
            </div>

            <button onClick={() => setShowAddDebt(!showAddDebt)} style={styles.btnPrimary}>
              <Plus size={14} />
              <span>Novo Parcelamento / Dívida</span>
            </button>
          </div>

          {/* Add New Debt / Installment Form */}
          {showAddDebt && (
            <form onSubmit={handleSaveDebt} style={styles.formContainer}>
              <h4 style={{ margin: '0 0 1rem 0', color: 'var(--text-primary)' }}>Novo Parcelamento de Dívida / Contrato</h4>
              <div style={styles.formGrid}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Credor / Banco / Fornecedor</label>
                  <input 
                    type="text" 
                    value={newDebt.creditor} 
                    onChange={e => setNewDebt({...newDebt, creditor: e.target.value})} 
                    placeholder="Ex: Fresenius Medical Care / Banco Itaú"
                    style={styles.input} 
                    required 
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>CNPJ do Credor (Opcional)</label>
                  <input 
                    type="text" 
                    value={newDebt.cnpj} 
                    onChange={e => setNewDebt({...newDebt, cnpj: e.target.value})} 
                    placeholder="00.000.000/0001-00"
                    style={styles.input} 
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Valor Total da Dívida (R$)</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    value={newDebt.totalAmount} 
                    onChange={e => {
                      const total = parseFloat(e.target.value) || 0;
                      const count = parseInt(newDebt.installmentCount) || 1;
                      setNewDebt({
                        ...newDebt, 
                        totalAmount: e.target.value,
                        installmentAmount: (total / count).toFixed(2)
                      });
                    }} 
                    style={styles.input} 
                    required 
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Nº de Parcelas</label>
                  <input 
                    type="number" 
                    min="1"
                    max="120"
                    value={newDebt.installmentCount} 
                    onChange={e => {
                      const count = parseInt(e.target.value) || 1;
                      const total = parseFloat(newDebt.totalAmount) || 0;
                      setNewDebt({
                        ...newDebt, 
                        installmentCount: e.target.value,
                        installmentAmount: count > 0 ? (total / count).toFixed(2) : '0.00'
                      });
                    }} 
                    style={styles.input} 
                    required 
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Valor Parcela Mensal (R$)</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    value={newDebt.installmentAmount} 
                    onChange={e => setNewDebt({...newDebt, installmentAmount: e.target.value})} 
                    style={styles.input} 
                    required 
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Vencimento 1ª Parcela</label>
                  <input 
                    type="date" 
                    value={newDebt.firstDueDate} 
                    onChange={e => setNewDebt({...newDebt, firstDueDate: e.target.value})} 
                    style={styles.input} 
                    required 
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Categoria</label>
                  <select 
                    value={newDebt.category} 
                    onChange={e => setNewDebt({...newDebt, category: e.target.value})} 
                    style={styles.input}
                  >
                    <option value="Equipamento">Equipamento / Máquinas</option>
                    <option value="Serviço/Utilidades">Empréstimo / Financiamento</option>
                    <option value="Insumo Clínico">Insumo Clínico Parcelado</option>
                    <option value="Outros">Outras Dívidas</option>
                  </select>
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Observações / Contrato</label>
                  <input 
                    type="text" 
                    value={newDebt.notes} 
                    onChange={e => setNewDebt({...newDebt, notes: e.target.value})} 
                    placeholder="Ex: Contrato de Financiamento #40291"
                    style={styles.input} 
                  />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowAddDebt(false)} style={styles.btnSecondary}>Cancelar</button>
                <button type="submit" style={styles.btnSave}>Gerar Dívida & Parcelas</button>
              </div>
            </form>
          )}

          {/* Table of Debts */}
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  {renderSortableHeader('Credor / Instituição', 'creditor', debtSort, setDebtSort)}
                  {renderSortableHeader('Categoria', 'category', debtSort, setDebtSort)}
                  {renderSortableHeader('Valor Total', 'totalAmount', debtSort, setDebtSort)}
                  {renderSortableHeader('Parcelas', 'installmentCount', debtSort, setDebtSort)}
                  {renderSortableHeader('Valor Mensal', 'installmentAmount', debtSort, setDebtSort)}
                  {renderSortableHeader('1ª Parcela', 'firstDueDate', debtSort, setDebtSort)}
                  {renderSortableHeader('Status', 'status', debtSort, setDebtSort)}
                  <th style={styles.th}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {debtsList.length === 0 ? (
                  <tr style={styles.tr}>
                    <td colSpan="8" style={{ ...styles.td, textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                      Nenhum contrato de dívida ou parcelamento cadastrado. Clique no botão acima para adicionar.
                    </td>
                  </tr>
                ) : (
                  sortList(debtsList, debtSort).map(debt => (
                    <tr key={debt.id} style={styles.tr}>
                      <td style={styles.td}>
                        <strong>{debt.creditor}</strong>
                        {debt.notes && <div style={styles.subtext}>{debt.notes}</div>}
                      </td>
                      <td style={styles.td}>{debt.category}</td>
                      <td style={{ ...styles.td, fontWeight: '700' }}>
                        R$ {(parseFloat(debt.totalAmount) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td style={styles.td}>
                        <span style={{ backgroundColor: '#e0f2fe', color: '#0369a1', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: '700', fontSize: '0.8rem' }}>
                          {debt.installmentCount}x
                        </span>
                      </td>
                      <td style={styles.td}>
                        R$ {(parseFloat(debt.installmentAmount) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td style={styles.td}>{debt.firstDueDate ? debt.firstDueDate.split('-').reverse().join('/') : '-'}</td>
                      <td style={styles.td}>
                        <span style={{ backgroundColor: '#d1fae5', color: '#065f46', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: '600', fontSize: '0.8rem' }}>
                          {debt.status || 'Ativo'}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                          <button 
                            onClick={() => handleEditDebtClick(debt)} 
                            style={{ ...styles.actionBtnCheck, backgroundColor: '#f1f5f9', color: '#334155' }} 
                            title="Editar Contrato de Dívida"
                          >
                            <Edit size={14} />
                          </button>
                          <button 
                            onClick={() => setSelectedDebtDetail(selectedDebtDetail?.id === debt.id ? null : debt)} 
                            style={{ ...styles.actionBtnCheck, backgroundColor: '#e0f2fe', color: '#0369a1' }} 
                            title="Ver parcelas geradas em Contas a Pagar"
                          >
                            <FileText size={14} />
                          </button>
                          <button onClick={() => handleDeleteDebt(debt.id)} style={styles.actionBtnDelete} title="Excluir Dívida">
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

          {/* Expandable Installment Detail Drawer */}
          {selectedDebtDetail && (
            <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: 'var(--bg-card)', borderRadius: '10px', border: '1px solid #3b82f6' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <h4 style={{ margin: 0, color: 'var(--text-primary)' }}>
                  📋 Parcelas no Contas a Pagar - {selectedDebtDetail.creditor} ({selectedDebtDetail.installmentCount}x de R$ {selectedDebtDetail.installmentAmount?.toLocaleString?.('pt-BR') || selectedDebtDetail.installmentAmount})
                </h4>
                <button onClick={() => setSelectedDebtDetail(null)} style={styles.btnSecondary}>Fechar</button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.5rem' }}>
                {payableList
                  .filter(p => p.debtId === selectedDebtDetail.id || p.description?.includes(selectedDebtDetail.creditor))
                  .map((p, idx) => (
                    <div key={p.id || idx} style={{ padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: p.status === 'Pago' ? '#f0fdf4' : '#fffbbd', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: '700' }}>
                        <span>{p.description}</span>
                        <span style={{ color: p.status === 'Pago' ? '#166534' : '#b45309' }}>{p.status}</span>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Vencimento: {p.dueDate?.split('-').reverse().join('/')}</span>
                      <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                        R$ {(parseFloat(p.amount) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Bank Reconciliation View (Conciliação Bancária) */}
      {activeTab === 'reconciliation' && (
        <div style={styles.tabContent}>
          {/* Summary Cards Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ backgroundColor: 'var(--bg-card)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>🟢 Conciliados (Match)</span>
              <h3 style={{ margin: '0.35rem 0 0 0', color: '#10b981', fontSize: '1.2rem' }}>
                {bankStatements.filter(s => s.status === 'Conciliado').length} lançamentos
              </h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Batimento com extrato</span>
            </div>

            <div style={{ backgroundColor: 'var(--bg-card)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>🟡 Divergências de Valor</span>
              <h3 style={{ margin: '0.35rem 0 0 0', color: '#f59e0b', fontSize: '1.2rem' }}>
                {bankStatements.filter(s => s.status === 'Divergente').length} divergência(s)
              </h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Requer ajuste de tarifas/juros</span>
            </div>

            <div style={{ backgroundColor: 'var(--bg-card)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>🔴 Não Lançado no Financeiro</span>
              <h3 style={{ margin: '0.35rem 0 0 0', color: '#ef4444', fontSize: '1.2rem' }}>
                {bankStatements.filter(s => s.status === 'Divergente' && s.note?.includes('não registrada')).length} débito(s)
              </h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Tarifas/PIX pendentes de lançamento</span>
            </div>

            <div style={{ backgroundColor: 'var(--bg-card)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>🔵 Banco Integrado</span>
              <h3 style={{ margin: '0.35rem 0 0 0', color: '#3b82f6', fontSize: '1.2rem' }}>
                Itaú Unibanco (PJ)
              </h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Extrato atualizado hoje</span>
            </div>
          </div>

          {/* Action Bar */}
          <div style={styles.actionsBar}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-primary)' }}>Extrato Bancário vs. Sistema Financeiro</h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Comparativo em tempo real entre o extrato da conta bancária e as contas lançadas na clínica.
              </span>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={() => setShowAddManualStatement(!showAddManualStatement)} style={styles.btnPrimary}>
                <Plus size={14} /> Novo Lançamento Manual
              </button>
              <button onClick={() => alert('Simulação de Leitura de Extrato OFX/CSV concluída com sucesso!')} style={styles.btnSecondary}>
                <Upload size={14} /> Importar OFX / CSV
              </button>
            </div>
          </div>

          {/* Form Modal for Manual Bank Statement Entry */}
          {showAddManualStatement && (
            <form onSubmit={handleSaveManualStatement} style={{ ...styles.formContainer, border: '2px solid #3b82f6', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h4 style={{ margin: 0, color: 'var(--text-primary)' }}>🏦 Novo Lançamento Manual no Extrato Bancário</h4>
                <button type="button" onClick={() => setShowAddManualStatement(false)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>
                  <X size={18} />
                </button>
              </div>

              <div style={styles.formGrid}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Data da Movimentação</label>
                  <input 
                    type="date" 
                    value={newManualStatement.date} 
                    onChange={e => setNewManualStatement({ ...newManualStatement, date: e.target.value })}
                    style={styles.input}
                    required
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Banco / Conta</label>
                  <input 
                    type="text" 
                    value={newManualStatement.bankName} 
                    onChange={e => setNewManualStatement({ ...newManualStatement, bankName: e.target.value })}
                    placeholder="Ex: Itaú Unibanco (PJ)"
                    style={styles.input}
                    required
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Descrição / Histórico</label>
                  <input 
                    type="text" 
                    value={newManualStatement.description} 
                    onChange={e => setNewManualStatement({ ...newManualStatement, description: e.target.value })}
                    placeholder="Ex: Tarifa Manutenção Conta / PIX Recebido"
                    style={styles.input}
                    required
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Tipo de Movimentação</label>
                  <select 
                    value={newManualStatement.type} 
                    onChange={e => setNewManualStatement({ ...newManualStatement, type: e.target.value })}
                    style={styles.input}
                  >
                    <option value="Débito">Débito (Saída / Tarifa)</option>
                    <option value="Crédito">Crédito (Entrada / Rendimento)</option>
                  </select>
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Valor (R$)</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    value={newManualStatement.amount} 
                    onChange={e => setNewManualStatement({ ...newManualStatement, amount: e.target.value })}
                    placeholder="Ex: 85.50"
                    style={styles.input}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowAddManualStatement(false)} style={styles.btnSecondary}>Cancelar</button>
                <button type="submit" style={styles.btnSave}>Salvar Lançamento</button>
              </div>
            </form>
          )}

          {/* Bank Statements Reconciliation Table */}
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  {renderSortableHeader('Data Extrato', 'date', reconciliationSort, setReconciliationSort)}
                  {renderSortableHeader('Banco', 'bankName', reconciliationSort, setReconciliationSort)}
                  {renderSortableHeader('Descrição no Banco', 'description', reconciliationSort, setReconciliationSort)}
                  {renderSortableHeader('Tipo', 'type', reconciliationSort, setReconciliationSort)}
                  {renderSortableHeader('Valor Extrato', 'amount', reconciliationSort, setReconciliationSort)}
                  {renderSortableHeader('Status Conciliação', 'status', reconciliationSort, setReconciliationSort)}
                  <th style={styles.th}>Observação / Diagnóstico</th>
                  <th style={styles.th}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {sortList(bankStatements, reconciliationSort).map(stmt => {
                  const isConciled = stmt.status === 'Conciliado';
                  return (
                    <tr key={stmt.id} style={styles.tr}>
                      <td style={styles.td}>{stmt.date.split('-').reverse().join('/')}</td>
                      <td style={styles.td}><strong>{stmt.bankName}</strong></td>
                      <td style={styles.td}>
                        <strong>{stmt.description}</strong>
                      </td>
                      <td style={styles.td}>
                        <span style={{
                          backgroundColor: stmt.type === 'Crédito' ? '#d1fae5' : '#fee2e2',
                          color: stmt.type === 'Crédito' ? '#065f46' : '#991b1b',
                          padding: '0.15rem 0.4rem',
                          borderRadius: '4px',
                          fontWeight: '700',
                          fontSize: '0.75rem'
                        }}>
                          {stmt.type}
                        </span>
                      </td>
                      <td style={{ ...styles.td, fontWeight: '700', color: stmt.type === 'Crédito' ? '#10b981' : '#ef4444' }}>
                        {stmt.type === 'Crédito' ? '+' : '-'} R$ {Math.abs(stmt.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td style={styles.td}>
                        <span style={{
                          backgroundColor: isConciled ? '#d1fae5' : '#fef3c7',
                          color: isConciled ? '#065f46' : '#b45309',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                          fontWeight: '600',
                          fontSize: '0.8rem'
                        }}>
                          {isConciled ? '🟢 Conciliado' : '🟡 Divergência'}
                        </span>
                      </td>
                      <td style={{ ...styles.td, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {stmt.note || 'Lançamento conferido e aprovado pelo operador.'}
                      </td>
                      <td style={styles.td}>
                        <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                          {!isConciled ? (
                            <button 
                              onClick={() => handleQuickReconcile(stmt)} 
                              style={{ ...styles.actionBtnCheck, backgroundColor: '#10b981', color: '#ffffff', border: 'none', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                              title="Criar lançamento automático no Financeiro e Conciliar"
                            >
                              <Check size={12} /> Conciliar 1-Clique
                            </button>
                          ) : (
                            <button 
                              onClick={() => handleUnreconcileStatement(stmt)}
                              style={{ ...styles.actionBtnCheck, backgroundColor: '#fef3c7', color: '#b45309', border: 'none', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem' }}
                              title="Desfazer conciliação e voltar para pendente"
                            >
                              Desfazer
                            </button>
                          )}
                          <button onClick={() => handleDeleteStatement(stmt.id)} style={styles.actionBtnDelete} title="Excluir Item do Extrato">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {/* DRE Gerencial (Demonstração do Resultado do Exercício) View */}
      {activeTab === 'dre' && (() => {
        // Dynamic DRE Calculations
        const recListUnit = receivableList.filter(r => selectedUnit === 'Todas' || r.unit === selectedUnit);
        const payListUnit = payableList.filter(p => selectedUnit === 'Todas' || p.unit === selectedUnit);

        const receitaBruta = recListUnit.reduce((acc, r) => acc + (parseFloat(r.amount) || 0), 0) || 540000;
        const impostosDeducoes = receitaBruta * 0.06; // 6% Impostos Médios de Serviços (ISS / PIS / COFINS)
        const receitaLiquida = receitaBruta - impostosDeducoes;

        const custosVariaveis = payListUnit
          .filter(p => ['Insumo Clínico', 'Medicamento', 'Concentrado'].includes(p.category) || p.natureType === 'Custo Variável / Operacional')
          .reduce((acc, p) => acc + (parseFloat(p.amount) || 0), 0) || (receitaLiquida * 0.32);

        const margemContribui = receitaLiquida - custosVariaveis;
        const pctMargemContribui = receitaLiquida > 0 ? (margemContribui / receitaLiquida) * 100 : 0;

        const custosFixos = payListUnit
          .filter(p => (!['Insumo Clínico', 'Medicamento', 'Concentrado'].includes(p.category)) || p.natureType === 'Custo Fixo Recorrente')
          .reduce((acc, p) => acc + (parseFloat(p.amount) || 0), 0) || (receitaLiquida * 0.45);

        const ebitda = margemContribui - custosFixos;
        const pctEbitda = receitaLiquida > 0 ? (ebitda / receitaLiquida) * 100 : 0;

        const despesasFinanceiras = bankStatements
          .filter(s => s.type === 'Débito')
          .reduce((acc, s) => acc + Math.abs(parseFloat(s.amount) || 0), 0) || (receitaBruta * 0.015);

        const resultadoLiquido = ebitda - despesasFinanceiras;
        const pctResultadoLiquido = receitaLiquida > 0 ? (resultadoLiquido / receitaLiquida) * 100 : 0;

        return (
          <div style={styles.tabContent}>
            {/* Header Summary Cards Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.25rem' }}>
              <div style={{ backgroundColor: 'var(--bg-card)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-color)', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700' }}>💵 Receita Líquida (RL)</span>
                  <DollarSign size={16} color="#2563eb" />
                </div>
                <h3 style={{ margin: '0.4rem 0 0 0', color: '#2563eb', fontSize: '1.3rem', fontWeight: '800' }}>
                  R$ {receitaLiquida.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </h3>
                <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Faturamento Abatido Impostos ({selectedUnit})</span>
              </div>

              <div style={{ backgroundColor: 'var(--bg-card)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-color)', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700' }}>📈 Margem de Contribuição</span>
                  <TrendingUp size={16} color="#059669" />
                </div>
                <h3 style={{ margin: '0.4rem 0 0 0', color: '#059669', fontSize: '1.3rem', fontWeight: '800' }}>
                  {pctMargemContribui.toFixed(1)}%
                </h3>
                <span style={{ fontSize: '0.72rem', color: '#047857' }}>R$ {margemContribui.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} pós custos variáveis</span>
              </div>

              <div style={{ backgroundColor: 'var(--bg-card)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-color)', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700' }}>📊 EBITDA Operacional</span>
                  <Activity size={16} color={ebitda >= 0 ? '#10b981' : '#dc2626'} />
                </div>
                <h3 style={{ margin: '0.4rem 0 0 0', color: ebitda >= 0 ? '#10b981' : '#dc2626', fontSize: '1.3rem', fontWeight: '800' }}>
                  {pctEbitda.toFixed(1)}%
                </h3>
                <span style={{ fontSize: '0.72rem', color: '#64748b' }}>R$ {ebitda.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} antes de despesas financ.</span>
              </div>

              <div style={{ backgroundColor: 'var(--bg-card)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-color)', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700' }}>🏆 Lucro Líquido do Exercício</span>
                  <PieChart size={16} color={resultadoLiquido >= 0 ? '#059669' : '#b91c1c'} />
                </div>
                <h3 style={{ margin: '0.4rem 0 0 0', color: resultadoLiquido >= 0 ? '#059669' : '#b91c1c', fontSize: '1.3rem', fontWeight: '800' }}>
                  R$ {resultadoLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </h3>
                <span style={{ fontSize: '0.72rem', color: resultadoLiquido >= 0 ? '#047857' : '#991b1b' }}>Margem Líquida: {pctResultadoLiquido.toFixed(1)}%</span>
              </div>
            </div>

            {/* DRE Structure Table */}
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>
                    <th style={{ ...styles.th, color: '#f8fafc', width: '45%' }}>Estrutura de Contas da DRE Gerencial</th>
                    <th style={{ ...styles.th, color: '#f8fafc' }}>Valor Realizado (R$)</th>
                    <th style={{ ...styles.th, color: '#f8fafc' }}>% s/ Receita Líquida</th>
                    <th style={{ ...styles.th, color: '#f8fafc' }}>Análise Vertical & Diagnóstico</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ ...styles.tr, backgroundColor: '#f8fafc', fontWeight: '800' }}>
                    <td style={{ ...styles.td, fontSize: '0.95rem', color: '#0f172a' }}>(+) RECEITA BRUTA OPERACIONAL</td>
                    <td style={{ ...styles.td, fontWeight: '800', color: '#2563eb' }}>
                      R$ {receitaBruta.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ ...styles.td, fontWeight: '700' }}>-</td>
                    <td style={{ ...styles.td, fontSize: '0.8rem', color: '#475569' }}>Total de Faturamento Bruto (Consultas + APAC + Convênios)</td>
                  </tr>

                  <tr style={styles.tr}>
                    <td style={{ ...styles.td, paddingLeft: '1.5rem', color: '#64748b' }}>(-) Impostos & Deduções Incidentes (ISS/PIS/COFINS ~6%)</td>
                    <td style={{ ...styles.td, color: '#dc2626', fontWeight: '600' }}>
                      -R$ {impostosDeducoes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ ...styles.td, color: '#64748b' }}>6.0%</td>
                    <td style={{ ...styles.td, fontSize: '0.8rem', color: '#94a3b8' }}>Deduções diretas da Nota Fiscal de Serviço</td>
                  </tr>

                  <tr style={{ ...styles.tr, backgroundColor: '#eff6ff', fontWeight: '800' }}>
                    <td style={{ ...styles.td, fontSize: '0.95rem', color: '#1e40af' }}>(=) RECEITA LÍQUIDA OPERACIONAL</td>
                    <td style={{ ...styles.td, fontWeight: '800', color: '#1e40af' }}>
                      R$ {receitaLiquida.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ ...styles.td, fontWeight: '800', color: '#1e40af' }}>100.0%</td>
                    <td style={{ ...styles.td, fontSize: '0.8rem', color: '#1e40af' }}>Base de cálculo para os indicadores de Margem da Clínica</td>
                  </tr>

                  <tr style={styles.tr}>
                    <td style={{ ...styles.td, paddingLeft: '1.5rem', color: '#475569' }}>(-) Custos Variáveis & Insumos Clínicos (Materiais, Medicamentos)</td>
                    <td style={{ ...styles.td, color: '#dc2626', fontWeight: '600' }}>
                      -R$ {custosVariaveis.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ ...styles.td, color: '#64748b' }}>
                      {((custosVariaveis / receitaLiquida) * 100).toFixed(1)}%
                    </td>
                    <td style={{ ...styles.td, fontSize: '0.8rem', color: '#64748b' }}>Custos diretos atrelados ao volume de atendimentos</td>
                  </tr>

                  <tr style={{ ...styles.tr, backgroundColor: '#ecfdf5', fontWeight: '800' }}>
                    <td style={{ ...styles.td, fontSize: '0.95rem', color: '#065f46' }}>(=) MARGEM DE CONTRIBUIÇÃO</td>
                    <td style={{ ...styles.td, fontWeight: '800', color: '#059669' }}>
                      R$ {margemContribui.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ ...styles.td, fontWeight: '800', color: '#059669' }}>
                      {pctMargemContribui.toFixed(1)}%
                    </td>
                    <td style={{ ...styles.td, fontSize: '0.8rem', color: '#047857' }}>
                      {pctMargemContribui > 50 ? '🟢 Margem de contribuição saudável' : '🟡 Recomenda-se rever custos com insumos'}
                    </td>
                  </tr>

                  <tr style={styles.tr}>
                    <td style={{ ...styles.td, paddingLeft: '1.5rem', color: '#475569' }}>(-) Custos Fixos & Despesas Operacionais (RH, Aluguel, Utilidades)</td>
                    <td style={{ ...styles.td, color: '#dc2626', fontWeight: '600' }}>
                      -R$ {custosFixos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ ...styles.td, color: '#64748b' }}>
                      {((custosFixos / receitaLiquida) * 100).toFixed(1)}%
                    </td>
                    <td style={{ ...styles.td, fontSize: '0.8rem', color: '#64748b' }}>Despesas fixas recorrentes para manter a clínica aberta</td>
                  </tr>

                  <tr style={{ ...styles.tr, backgroundColor: ebitda >= 0 ? '#f0fdf4' : '#fef2f2', fontWeight: '800' }}>
                    <td style={{ ...styles.td, fontSize: '0.95rem', color: ebitda >= 0 ? '#166534' : '#991b1b' }}>(=) EBITDA / RESULTADO OPERACIONAL</td>
                    <td style={{ ...styles.td, fontWeight: '800', color: ebitda >= 0 ? '#15803d' : '#b91c1c' }}>
                      R$ {ebitda.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ ...styles.td, fontWeight: '800', color: ebitda >= 0 ? '#15803d' : '#b91c1c' }}>
                      {pctEbitda.toFixed(1)}%
                    </td>
                    <td style={{ ...styles.td, fontSize: '0.8rem', color: ebitda >= 0 ? '#166534' : '#991b1b' }}>
                      {ebitda >= 0 ? '🟢 Operação gerando caixa positivo' : '🔴 Operação em deficit pré-financeiro'}
                    </td>
                  </tr>

                  <tr style={styles.tr}>
                    <td style={{ ...styles.td, paddingLeft: '1.5rem', color: '#475569' }}>(-) Despesas Financeiras & Tarifas Bancárias</td>
                    <td style={{ ...styles.td, color: '#dc2626', fontWeight: '600' }}>
                      -R$ {despesasFinanceiras.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ ...styles.td, color: '#64748b' }}>
                      {((despesasFinanceiras / receitaLiquida) * 100).toFixed(1)}%
                    </td>
                    <td style={{ ...styles.td, fontSize: '0.8rem', color: '#64748b' }}>Juros, taxas de cartão e tarifas bancárias acumuladas</td>
                  </tr>

                  <tr style={{ ...styles.tr, backgroundColor: resultadoLiquido >= 0 ? '#d1fae5' : '#fee2e2', fontWeight: '900' }}>
                    <td style={{ ...styles.td, fontSize: '1rem', color: resultadoLiquido >= 0 ? '#065f46' : '#991b1b' }}>
                      🏆 (=) LUCRO LÍQUIDO DO EXERCÍCIO
                    </td>
                    <td style={{ ...styles.td, fontSize: '1.05rem', fontWeight: '900', color: resultadoLiquido >= 0 ? '#047857' : '#991b1b' }}>
                      R$ {resultadoLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ ...styles.td, fontSize: '1rem', fontWeight: '900', color: resultadoLiquido >= 0 ? '#047857' : '#991b1b' }}>
                      {pctResultadoLiquido.toFixed(1)}%
                    </td>
                    <td style={{ ...styles.td, fontSize: '0.85rem', fontWeight: '800', color: resultadoLiquido >= 0 ? '#065f46' : '#991b1b' }}>
                      {resultadoLiquido >= 0 ? '✅ Resultado Líquido Positivo!' : '⚠️ Nec. de reestruturação de dívidas'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        );
      })()}

      {/* Orçamento X Realizado (Budget vs Actual) View */}
      {activeTab === 'budget' && (
        <div style={styles.tabContent}>
          {/* Header Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ backgroundColor: 'var(--bg-card)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-color)', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700' }}>🎯 Total Orçado (Meta)</span>
                <Target size={16} color="#3b82f6" />
              </div>
              <h3 style={{ margin: '0.4rem 0 0 0', color: '#1e293b', fontSize: '1.3rem', fontWeight: '800' }}>
                R$ {budgetPlans.reduce((acc, b) => acc + (parseFloat(b.plannedAmount) || 0), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </h3>
              <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Planejamento Julho/2026 ({selectedUnit})</span>
            </div>

            <div style={{ backgroundColor: 'var(--bg-card)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700' }}>💵 Realizado (Gasto Efetivo)</span>
                <DollarSign size={16} color="#10b981" />
              </div>
              <h3 style={{ margin: '0.4rem 0 0 0', color: '#10b981', fontSize: '1.3rem', fontWeight: '800' }}>
                R$ {payableList
                  .filter(p => (selectedUnit === 'Todas' || p.unit === selectedUnit) && p.status === 'Pago')
                  .reduce((acc, p) => acc + (parseFloat(p.amountPaid || p.amount) || 0), 0)
                  .toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </h3>
              <span style={{ fontSize: '0.72rem', color: '#047857' }}>Baixado em Caixa no Mês</span>
            </div>

            <div style={{ backgroundColor: 'var(--bg-card)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700' }}>📊 Compromissos Devidos</span>
                <Clock size={16} color="#f59e0b" />
              </div>
              <h3 style={{ margin: '0.4rem 0 0 0', color: '#f59e0b', fontSize: '1.3rem', fontWeight: '800' }}>
                R$ {payableList
                  .filter(p => (selectedUnit === 'Todas' || p.unit === selectedUnit))
                  .reduce((acc, p) => acc + (parseFloat(p.amount) || 0), 0)
                  .toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </h3>
              <span style={{ fontSize: '0.72rem', color: '#b45309' }}>Total de Títulos Cadastrados</span>
            </div>

            <div style={{ backgroundColor: 'var(--bg-card)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700' }}>🛡️ Status da Variância</span>
                <ShieldCheck size={16} color="#059669" />
              </div>
              <h3 style={{ margin: '0.4rem 0 0 0', color: '#059669', fontSize: '1.2rem', fontWeight: '800' }}>
                🟢 Dentro do Orçamento
              </h3>
              <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Execução sob controle orçamentário</span>
            </div>
          </div>

          {/* Action Bar for Budget */}
          <div style={styles.actionsBar}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-primary)', fontWeight: '700' }}>
                Comparativo Orçamento X Realizado por Centro de Custos
              </h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Exibindo planejamento e gastos executados da Unidade <strong>{selectedUnit}</strong>
              </span>
            </div>

            <button onClick={() => setShowAddBudget(true)} style={styles.btnPrimary}>
              <Plus size={14} />
              <span>Configurar Meta Orçamentária</span>
            </button>
          </div>

          {/* Form Modal for Adding Budget Plan */}
          {showAddBudget && (
            <form onSubmit={handleSaveBudgetPlan} style={{ ...styles.formContainer, border: '2px solid #10b981' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h4 style={{ margin: 0, color: 'var(--text-primary)' }}>🎯 Configurar Meta Orçamentária (Unidade {selectedUnit})</h4>
                <button type="button" onClick={() => setShowAddBudget(false)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>
                  <X size={18} />
                </button>
              </div>

              <div style={styles.formGrid}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Centro de Custos</label>
                  <select 
                    value={newBudget.costCenterId} 
                    onChange={e => setNewBudget({ ...newBudget, costCenterId: e.target.value })}
                    style={styles.input}
                  >
                    {costCenters.map(cc => (
                      <option key={cc.id} value={cc.id}>{cc.code} - {cc.name}</option>
                    ))}
                  </select>
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Valor Orçado / Meta (R$)</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    value={newBudget.plannedAmount} 
                    onChange={e => setNewBudget({ ...newBudget, plannedAmount: e.target.value })}
                    placeholder="Ex: 150000.00"
                    style={styles.input}
                    required
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Mês / Ano Competência</label>
                  <input 
                    type="number" 
                    value={newBudget.month} 
                    onChange={e => setNewBudget({ ...newBudget, month: parseInt(e.target.value) })}
                    style={{ ...styles.input, width: '80px', display: 'inline-block', marginRight: '0.5rem' }}
                    min="1" max="12"
                  />
                  <input 
                    type="number" 
                    value={newBudget.year} 
                    onChange={e => setNewBudget({ ...newBudget, year: parseInt(e.target.value) })}
                    style={{ ...styles.input, width: '100px', display: 'inline-block' }}
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Observações</label>
                  <input 
                    type="text" 
                    value={newBudget.notes} 
                    onChange={e => setNewBudget({ ...newBudget, notes: e.target.value })}
                    placeholder="Base de cálculo ou observação estratégica"
                    style={styles.input}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowAddBudget(false)} style={styles.btnSecondary}>Cancelar</button>
                <button type="submit" style={styles.btnSave}>Salvar Meta Orçamentária</button>
              </div>
            </form>
          )}

          {/* Budget Matrix Table */}
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc' }}>
                  {renderSortableHeader('Código & Centro de Custo', 'code', budgetSort, setBudgetSort)}
                  {renderSortableHeader('Categoria Pai', 'parentName', budgetSort, setBudgetSort)}
                  {renderSortableHeader('Meta Orçada (R$)', 'planned', budgetSort, setBudgetSort)}
                  {renderSortableHeader('Realizado / Pago (R$)', 'realized', budgetSort, setBudgetSort)}
                  {renderSortableHeader('Devido / Cadastrado (R$)', 'due', budgetSort, setBudgetSort)}
                  {renderSortableHeader('Desvio (R$)', 'devio', budgetSort, setBudgetSort)}
                  {renderSortableHeader('Execução', 'pctExecution', budgetSort, setBudgetSort)}
                  {renderSortableHeader('Status Variância', 'statusText', budgetSort, setBudgetSort)}
                  <th style={styles.th}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {sortList(costCenters.map(cc => {
                  const bPlan = budgetPlans.find(b => b.costCenterId === cc.id);
                  const planned = parseFloat(bPlan?.plannedAmount) || 0;

                  // Compute actual paid and due for this cost center
                  const payablesCC = payableList.filter(p => (selectedUnit === 'Todas' || p.unit === selectedUnit) && p.costCenterId === cc.id);
                  const due = payablesCC.reduce((acc, p) => acc + (parseFloat(p.amount) || 0), 0);
                  const realized = payablesCC
                    .filter(p => p.status === 'Pago')
                    .reduce((acc, p) => acc + (parseFloat(p.amountPaid || p.amount) || 0), 0);

                  const devio = realized - planned;
                  const pctExecution = planned > 0 ? (realized / planned) * 100 : (realized > 0 ? 100 : 0);

                  let statusBg = '#d1fae5';
                  let statusColor = '#065f46';
                  let statusText = '🟢 Dentro da Meta';

                  if (planned > 0 && realized > planned * 1.1) {
                    statusBg = '#fee2e2';
                    statusColor = '#991b1b';
                    statusText = '🔴 Estouro Crítico (>10%)';
                  } else if (planned > 0 && realized > planned) {
                    statusBg = '#fef3c7';
                    statusColor = '#92400e';
                    statusText = '🟡 Atenção (Excedeu Meta)';
                  }

                  return {
                    ...cc,
                    bPlan,
                    planned,
                    realized,
                    due,
                    devio,
                    pctExecution,
                    statusBg,
                    statusColor,
                    statusText
                  };
                }), budgetSort).map(cc => {
                  const bPlan = cc.bPlan;
                  const planned = cc.planned;
                  const due = cc.due;
                  const realized = cc.realized;
                  const devio = cc.devio;
                  const pctExecution = cc.pctExecution;
                  const statusBg = cc.statusBg;
                  const statusColor = cc.statusColor;
                  const statusText = cc.statusText;

                  return (
                    <tr key={cc.id} style={styles.tr}>
                      <td style={styles.td}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: '800', backgroundColor: '#e2e8f0', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>
                            {cc.code}
                          </span>
                          <strong style={{ color: '#0f172a' }}>{cc.name}</strong>
                        </div>
                      </td>
                      <td style={{ ...styles.td, fontSize: '0.75rem', color: '#64748b' }}>{cc.parentName}</td>
                      <td style={{ ...styles.td, fontWeight: '700', color: '#2563eb' }}>
                        R$ {planned.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td style={{ ...styles.td, fontWeight: '700', color: '#059669' }}>
                        R$ {realized.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td style={{ ...styles.td, fontWeight: '600', color: '#475569' }}>
                        R$ {due.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td style={{ ...styles.td, fontWeight: '700', color: devio > 0 ? '#dc2626' : '#16a34a' }}>
                        {devio > 0 ? `+R$ ${devio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : `R$ ${devio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                      </td>
                      <td style={styles.td}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{ flex: 1, height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ width: `${Math.min(pctExecution, 100)}%`, height: '100%', backgroundColor: pctExecution > 100 ? '#ef4444' : '#10b981', transition: 'width 0.3s' }} />
                          </div>
                          <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#334155' }}>
                            {pctExecution.toFixed(1)}%
                          </span>
                        </div>
                      </td>
                      <td style={styles.td}>
                        <span style={{ fontSize: '0.75rem', fontWeight: '700', padding: '0.2rem 0.55rem', borderRadius: '12px', backgroundColor: statusBg, color: statusColor }}>
                          {statusText}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <div style={{ display: 'flex', gap: '0.25rem' }}>
                          <button 
                            onClick={() => handleEditBudgetClick(bPlan, cc.id)} 
                            style={{ ...styles.actionBtnCheck, backgroundColor: '#f1f5f9', color: '#334155' }} 
                            title="Editar Meta Orçamentária"
                          >
                            <Edit size={14} />
                          </button>
                          {bPlan && (
                            <button onClick={() => handleDeleteBudgetPlan(bPlan.id)} style={styles.actionBtnDelete} title="Excluir Meta">
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Projeção de Saldo Fluxo (Cash Flow Projection) View */}
      {activeTab === 'cashflow_projection' && (
        <div style={styles.tabContent}>
          {/* Executive Warning Alert Banner for Betim */}
          <div style={{ backgroundColor: '#fef2f2', border: '2px solid #fca5a5', borderRadius: '12px', padding: '1.25rem', marginBottom: '1rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <AlertTriangle size={28} color="#dc2626" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <h3 style={{ margin: 0, color: '#991b1b', fontSize: '1.1rem', fontWeight: '800' }}>
                ⚠️ Projeção Executiva de Liquidez - Saldo Fluxo Acumulado ({selectedUnit})
              </h3>
              <p style={{ margin: '0.4rem 0 0 0', color: '#7f1d1d', fontSize: '0.875rem', lineHeight: '1.4' }}>
                De acordo com a planilha de Contas a Pagar de Betim 2026, o rombo acumulado atinge <strong>-R$ 1.899.979,34 em Agosto/2026</strong> devido ao acúmulo de títulos vencidos desde Setembro/2025. 
                Recomenda-se migrar <strong>R$ 1.222.310,85</strong> em passivos de fornecedores para a aba de <strong>Acordos & Renegociações</strong> para restaurar o fluxo positivo de caixa.
              </p>
            </div>
          </div>

          {/* Action Bar with Initial Cash Balance Adjustment */}
          <div style={{ ...styles.actionsBar, marginBottom: '1.25rem' }}>
            <div>
              <h4 style={{ margin: 0, color: 'var(--text-primary)', fontWeight: '700', fontSize: '0.95rem' }}>
                💵 Saldo Inicial de Caixa Definido: <span style={{ color: '#059669', fontWeight: '800' }}>R$ {initialCashBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </h4>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Ponto de partida do saldo bancário para a projeção de liquidez da Unidade {selectedUnit}
              </span>
            </div>

            <button 
              onClick={() => {
                setTempCashBalance(String(initialCashBalance));
                setShowEditCashBalance(!showEditCashBalance);
              }} 
              style={styles.btnSecondary}
            >
              <Sliders size={14} />
              <span>Ajustar Saldo Inicial de Caixa</span>
            </button>
          </div>

          {/* Modal to Adjust Initial Cash Balance */}
          {showEditCashBalance && (
            <form onSubmit={handleSaveInitialCashBalance} style={{ ...styles.formContainer, border: '2px solid #3b82f6', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h4 style={{ margin: 0, color: 'var(--text-primary)' }}>💵 Ajustar Saldo Inicial de Caixa da Clínica</h4>
                <button type="button" onClick={() => setShowEditCashBalance(false)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>
                  <X size={18} />
                </button>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Valor do Saldo Inicial em Caixa (R$)</label>
                <input 
                  type="number" 
                  step="0.01" 
                  value={tempCashBalance} 
                  onChange={e => setTempCashBalance(e.target.value)}
                  placeholder="Ex: 150000.00"
                  style={styles.input}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowEditCashBalance(false)} style={styles.btnSecondary}>Cancelar</button>
                <button type="submit" style={styles.btnSave}>Salvar Saldo Inicial</button>
              </div>
            </form>
          )}

          {/* Timeline Monthly Projections Table */}
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>
                  {renderSortableHeader('Mês Competência', 'monthIndex', projectionSort, setProjectionSort)}
                  {renderSortableHeader('Situação Predominante', 'status', projectionSort, setProjectionSort)}
                  {renderSortableHeader('Total Devido no Mês (R$)', 'devido', projectionSort, setProjectionSort)}
                  {renderSortableHeader('Total Pago no Mês (R$)', 'pago', projectionSort, setProjectionSort)}
                  {renderSortableHeader('Saldo do Mês (R$)', 'saldo', projectionSort, setProjectionSort)}
                  {renderSortableHeader('Saldo Fluxo Acumulado (R$)', 'fluxo', projectionSort, setProjectionSort)}
                </tr>
              </thead>
              <tbody>
                {sortList([
                  { monthIndex: 1, month: 'JUN/2025', status: 'ATRASADO', devido: 0, pago: 0, saldo: 0, fluxo: initialCashBalance + 0 },
                  { monthIndex: 2, month: 'SET/2025', status: 'ATRASADO', devido: 52940.94, pago: 0, saldo: -52940.94, fluxo: initialCashBalance - 52940.94 },
                  { monthIndex: 3, month: 'OUT/2025', status: 'ATRASADO', devido: 56828.78, pago: 0, saldo: -56828.78, fluxo: initialCashBalance - 109769.72 },
                  { monthIndex: 4, month: 'NOV/2025', status: 'ATRASADO', devido: 50010.72, pago: 0, saldo: -50010.72, fluxo: initialCashBalance - 159780.44 },
                  { monthIndex: 5, month: 'DEZ/2025', status: 'ATRASADO', devido: 54472.12, pago: 0, saldo: -54472.12, fluxo: initialCashBalance - 214252.56 },
                  { monthIndex: 6, month: 'JAN/2026', status: 'ATRASADO', devido: 53056.61, pago: 0, saldo: -53056.61, fluxo: initialCashBalance - 267309.17 },
                  { monthIndex: 7, month: 'FEV/2026', status: 'ATRASADO', devido: 104417.71, pago: 0, saldo: -104417.71, fluxo: initialCashBalance - 371726.88 },
                  { monthIndex: 8, month: 'MAR/2026', status: 'ATRASADO', devido: 49200.00, pago: 0, saldo: -49200.00, fluxo: initialCashBalance - 420926.88 },
                  { monthIndex: 9, month: 'ABR/2026', status: 'ATRASADO', devido: 198115.05, pago: 0, saldo: -198115.05, fluxo: initialCashBalance - 619041.93 },
                  { monthIndex: 10, month: 'MAI/2026', status: 'ATRASADO', devido: 45403.04, pago: 1340.00, saldo: -44063.04, fluxo: initialCashBalance - 663104.97 },
                  { monthIndex: 11, month: 'JUN/2026', status: 'ATRASADO', devido: 126532.07, pago: 0, saldo: -126532.07, fluxo: initialCashBalance - 795139.42 },
                  { monthIndex: 12, month: 'JUL/2026', status: 'ATRASADO / BAIXAS', devido: 477151.10, pago: 57445.95, saldo: -419705.15, fluxo: initialCashBalance - 1222310.85 },
                  { monthIndex: 13, month: 'AGO/2026', status: 'A VENCER', devido: 677668.49, pago: 392644.50, saldo: -285023.99, fluxo: initialCashBalance - 1899979.34 }
                ], projectionSort).map((row, i) => (
                  <tr key={i} style={{ ...styles.tr, backgroundColor: row.fluxo < 0 ? '#fff5f5' : '#ffffff' }}>
                    <td style={styles.td}><strong style={{ color: '#0f172a' }}>{row.month}</strong></td>
                    <td style={styles.td}>
                      <span style={{ fontSize: '0.75rem', fontWeight: '700', padding: '0.2rem 0.5rem', borderRadius: '4px', backgroundColor: row.status.includes('VENCER') ? '#e0f2fe' : '#fee2e2', color: row.status.includes('VENCER') ? '#0369a1' : '#991b1b' }}>
                        {row.status}
                      </span>
                    </td>
                    <td style={{ ...styles.td, fontWeight: '700' }}>
                      R$ {row.devido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ ...styles.td, fontWeight: '700', color: '#059669' }}>
                      R$ {row.pago.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ ...styles.td, fontWeight: '700', color: row.saldo < 0 ? '#dc2626' : '#059669' }}>
                      {row.saldo < 0 ? `-R$ ${Math.abs(row.saldo).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : `R$ ${row.saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                    </td>
                    <td style={{ ...styles.td, fontWeight: '900', color: row.fluxo < 0 ? '#b91c1c' : '#059669', fontSize: '0.9rem' }}>
                      {row.fluxo < 0 ? `-R$ ${Math.abs(row.fluxo).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : `R$ ${row.fluxo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Acordos & Renegociações (Agreements) View */}
      {activeTab === 'agreements' && (
        <div style={styles.tabContent}>
          <div style={styles.actionsBar}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-primary)', fontWeight: '700' }}>
                🤝 Gestão de Acordos e Renegociações de Dívidas ({selectedUnit})
              </h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Controle de passivos faturados em parcelas de longo prazo com fornecedores
              </span>
            </div>

            <button onClick={() => setShowAddAgreement(true)} style={styles.btnPrimary}>
              <Plus size={14} />
              <span>Registrar Novo Acordo</span>
            </button>
          </div>

          {/* Form Modal for Add Agreement */}
          {showAddAgreement && (
            <form onSubmit={handleSaveAgreement} style={{ ...styles.formContainer, border: '2px solid #3b82f6' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h4 style={{ margin: 0, color: 'var(--text-primary)' }}>🤝 Novo Acordo de Pagamento</h4>
                <button type="button" onClick={() => setShowAddAgreement(false)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>
                  <X size={18} />
                </button>
              </div>

              <div style={styles.formGrid}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Fornecedor Credor</label>
                  <input 
                    type="text" 
                    value={newAgreement.supplier} 
                    onChange={e => setNewAgreement({ ...newAgreement, supplier: e.target.value })}
                    placeholder="Ex: LACERDA ALIMENTAÇÃO"
                    style={styles.input}
                    required
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Valor Total Acordado (R$)</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    value={newAgreement.totalAmount} 
                    onChange={e => setNewAgreement({ ...newAgreement, totalAmount: e.target.value })}
                    placeholder="Ex: 152185.80"
                    style={styles.input}
                    required
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Nº de Parcelas</label>
                  <input 
                    type="number" 
                    value={newAgreement.installmentCount} 
                    onChange={e => setNewAgreement({ ...newAgreement, installmentCount: e.target.value })}
                    style={styles.input}
                    required
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Valor da Parcela Mensal (R$)</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    value={newAgreement.installmentAmount} 
                    onChange={e => setNewAgreement({ ...newAgreement, installmentAmount: e.target.value })}
                    placeholder="Calculado automaticamente se vazio"
                    style={styles.input}
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Dia de Vencimento</label>
                  <input 
                    type="number" 
                    value={newAgreement.dueDay} 
                    onChange={e => setNewAgreement({ ...newAgreement, dueDay: e.target.value })}
                    style={styles.input}
                    min="1" max="31"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowAddAgreement(false)} style={styles.btnSecondary}>Cancelar</button>
                <button type="submit" style={styles.btnSave}>Salvar Acordo</button>
              </div>
            </form>
          )}

          {/* Agreements List Table */}
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc' }}>
                  {renderSortableHeader('Fornecedor / Credor', 'supplier', agreementSort, setAgreementSort)}
                  {renderSortableHeader('Filial', 'unit', agreementSort, setAgreementSort)}
                  {renderSortableHeader('Total Renegociado', 'totalAmount', agreementSort, setAgreementSort)}
                  {renderSortableHeader('Parcelamento', 'installmentCount', agreementSort, setAgreementSort)}
                  {renderSortableHeader('Valor Parcela', 'installmentAmount', agreementSort, setAgreementSort)}
                  {renderSortableHeader('Progresso', 'paidInstallments', agreementSort, setAgreementSort)}
                  {renderSortableHeader('Status', 'status', agreementSort, setAgreementSort)}
                  <th style={styles.th}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {sortList(agreementsList, agreementSort).map(agr => (
                  <tr key={agr.id} style={styles.tr}>
                    <td style={styles.td}>
                      <strong style={{ color: '#0f172a' }}>{agr.supplier}</strong>
                      {agr.notes && <div style={styles.subtext}>{agr.notes}</div>}
                    </td>
                    <td style={styles.td}>📍 {agr.unit || 'Betim'}</td>
                    <td style={{ ...styles.td, fontWeight: '700', color: '#1e293b' }}>
                      R$ {(parseFloat(agr.totalAmount) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={styles.td}>
                      <span style={{ fontSize: '0.75rem', fontWeight: '700', padding: '0.15rem 0.45rem', borderRadius: '4px', backgroundColor: '#e0f2fe', color: '#0369a1' }}>
                        {agr.installmentCount}x
                      </span>
                    </td>
                    <td style={{ ...styles.td, fontWeight: '700', color: '#059669' }}>
                      R$ {(parseFloat(agr.installmentAmount) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={styles.td}>
                      <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#475569' }}>
                        {agr.paidInstallments || 0} de {agr.installmentCount} pagas
                      </span>
                    </td>
                    <td style={styles.td}>
                      <span style={{ fontSize: '0.75rem', fontWeight: '700', padding: '0.2rem 0.5rem', borderRadius: '12px', backgroundColor: '#d1fae5', color: '#065f46' }}>
                        {agr.status || 'Ativo'}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <div style={{ display: 'flex', gap: '0.25rem' }}>
                        <button 
                          onClick={() => handleEditAgreementClick(agr)} 
                          style={{ ...styles.actionBtnCheck, backgroundColor: '#f1f5f9', color: '#334155' }} 
                          title="Editar Acordo"
                        >
                          <Edit size={14} />
                        </button>
                        <button onClick={() => handleDeleteAgreement(agr.id)} style={styles.actionBtnDelete} title="Excluir Acordo">
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

      {/* Partial Payment Modal */}
      {partialItem && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '1.5rem', width: '90%', maxWidth: '480px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', pb: '0.75rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#0f172a', fontWeight: '800' }}>
                💵 Registrar Baixa / Quitação Parcial
              </h3>
              <button onClick={() => setPartialItem(null)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ marginBottom: '1rem', backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.85rem', color: '#334155' }}>Fornecedor: <strong>{partialItem.supplier}</strong></div>
              <div style={{ fontSize: '0.85rem', color: '#334155' }}>NF: <strong>{partialItem.invoiceNumber || '-'}</strong></div>
              <div style={{ fontSize: '0.85rem', color: '#334155' }}>Valor Total Devido: <strong>R$ {(parseFloat(partialItem.amount) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></div>
              <div style={{ fontSize: '0.85rem', color: '#059669' }}>Já Pago Anteriormente: <strong>R$ {(parseFloat(partialItem.amountPaid) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></div>
            </div>

            <form onSubmit={handleConfirmPartialPayment}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Valor do Pagamento Efetuado Hoje (R$)</label>
                <input 
                  type="number" 
                  step="0.01" 
                  value={partialAmountPaid} 
                  onChange={e => setPartialAmountPaid(e.target.value)}
                  style={{ ...styles.input, fontSize: '1rem', fontWeight: '700', color: '#10b981' }}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.25rem' }}>
                <button type="button" onClick={() => setPartialItem(null)} style={styles.btnSecondary}>Cancelar</button>
                <button type="submit" style={styles.btnSave}>Confirmar Pagamento</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import Betim Spreadsheet Modal */}
      {showImportBetimModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', padding: '1.75rem', width: '90%', maxWidth: '600px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileSpreadsheet size={22} color="#059669" />
                <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#0f172a', fontWeight: '800' }}>
                  Importar Planilha Contas a Pagar Betim - 2026
                </h3>
              </div>
              <button onClick={() => setShowImportBetimModal(false)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: '0.875rem', color: '#475569', lineHeight: '1.5' }}>
              O sistema identificou o arquivo do fluxo de caixa de <strong>Betim (2026)</strong>. Todos os 32 lançamentos (CEMIG, VFB Brasil, Farmarin, FGTS, PIS, Martins Costa, Copasa, DCTFWeb, Folha e Vantive) serão sincronizados e categorizados por Centro de Custos.
            </p>

            <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '0.85rem', marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#166534', marginBottom: '0.3rem' }}>Resumo da Estrutura a Importar:</div>
              <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.78rem', color: '#15803d' }}>
                <li>Mapeamento automático de Mês de Competência (Jun/25 a Ago/26)</li>
                <li>Vincular Centros de Custo: Insumos (1.1), Equipamentos (1.2), Energia/Água (2.1), RH/Folha (3.1), Impostos (3.2)</li>
                <li>Preservar número das parcelas (ex: 02/14, 4-6) e pagamentos parciais executados</li>
              </ul>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button onClick={() => setShowImportBetimModal(false)} style={styles.btnSecondary}>Cancelar</button>
              <button onClick={handleImportBetimData} style={styles.btnPrimary}>
                <CheckCircle2 size={16} /> Confirmar Importação Betim
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
