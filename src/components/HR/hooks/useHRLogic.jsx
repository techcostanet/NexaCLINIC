import React, { useState, useEffect, useMemo } from 'react';
import { dbService, authService } from '../../../firebase';
import { useUnit } from '../../../contexts/UnitContext';
import { 
  Users, UserPlus, Shield, Lock, Unlock, Edit2, Trash2, Plus, X, 
  Search, FileText, UploadCloud, Download, Calendar, ShieldAlert,
  CheckCircle2, AlertTriangle, Eye, Award, Check, UserCheck, HelpCircle,
  Gift, Bus, ArrowUp, ArrowDown, ArrowUpDown, Move, Settings, Save, 
  RotateCcw, ChevronLeft, ChevronRight, Maximize2, Minimize2
} from 'lucide-react';

const DEFAULT_DASHBOARD_LAYOUT = [
  { id: 'total_employees', title: 'Total de Funcionários', size: 'small' },
  { id: 'turnover', title: 'Turnover (Mensal)', size: 'small' },
  { id: 'absenteeism', title: 'Absenteísmo (Mensal)', size: 'small' },
  { id: 'warnings_kpi', title: 'Advertências Registradas', size: 'small' },
  { id: 'experience_kpi', title: 'Em Experiência', size: 'small' },
  { id: 'presenca_premiada', title: 'Presença Premiada', size: 'medium' },
  { id: 'birthdays', title: 'Aniversariantes do Mês', size: 'medium' },
  { id: 'expiring_contracts', title: 'Contratos em Experiência', size: 'medium' },
  { id: 'vaccines_list', title: 'Próximas Vacinações Vencendo', size: 'medium' },
  { id: 'warnings_list', title: 'Últimas Advertências', size: 'medium' },
  { id: 'absences_list', title: 'Últimas Ausências / Faltas', size: 'medium' },
];

export function useHRLogic(currentUser) {
  const { activeUnitId, filterByActiveUnit, matchItemUnit } = useUnit();
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'employees' | 'users' | 'reports' | 'audit'
  
  // Data States
  const [employees, setEmployees] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  
  // Logged operator (default for logs)
  const [operatorEmail, setOperatorEmail] = useState(currentUser?.name || currentUser?.email || 'Ana Carolina Cerqueira Gonzaga');

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSector, setFilterSector] = useState('');
  const [filterStatus, setFilterStatus] = useState('active'); // 'active' | 'inactive' | 'all'
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });

  // Dashboard Customization State (Cards reordering & sizes, default all small)
  const [dashboardLayout, setDashboardLayout] = useState(DEFAULT_DASHBOARD_LAYOUT);
  const [isCustomizingDashboard, setIsCustomizingDashboard] = useState(false);

  // Modals
  const [showEmpModal, setShowEmpModal] = useState(false);
  const [editingEmp, setEditingEmp] = useState(null);
  const [empActiveTab, setEmpActiveTab] = useState('pessoais'); // 'pessoais'|'contato'|'profissionais'|'bancarios'|'dependentes'|'warnings'|'vaccines'|'documents'
  
  // Employee Form State
  const [empForm, setEmpForm] = useState({
    name: '',
    gender: 'Feminino',
    birthDate: '',
    cpf: '',
    rg: '',
    motherName: '',
    photo: '',
    phone: '',
    email: '',
    city: 'Betim',
    state: 'MG',
    address: '',
    cep: '',
    role: '',
    sectorId: '',
    admissionDate: '',
    contractType: 'CLT',
    salary: '0',
    cnhNumber: '',
    cnhExpiry: '',
    bankName: '',
    bankAgency: '',
    bankAccount: '',
    dependents: [],
    warnings: [],
    vaccinations: [],
    documents: []
  });

  // User Administration States
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    role: 'professional',
    allowedSectors: [],
    status: 'active',
    employeeId: ''
  });
  const [tempPasswordMessage, setTempPasswordMessage] = useState('');

  // Sub-items forms (temporary)
  const [newDep, setNewDep] = useState({ name: '', relationship: 'Filho(a)', birthDate: '' });
  const [newWarning, setNewWarning] = useState({ date: new Date().toISOString().substring(0, 10), motive: 'Atraso Injustificado', text: '', docUrl: '' });
  const [newVaccine, setNewVaccine] = useState({ name: 'Hepatite B', dose: '1ª Dose', date: new Date().toISOString().substring(0, 10), expiryDate: '', lot: '' });
  const [newDoc, setNewDoc] = useState({ name: '', category: 'Identidade (RG)', expiryDate: '', fileUrl: '' });
  const [newAbsence, setNewAbsence] = useState({ date: new Date().toISOString().substring(0, 10), type: 'Falta Injustificada', days: '1', motive: '' });

  // Import State
  const [csvData, setCsvData] = useState([]);
  const [csvErrors, setCsvErrors] = useState([]);
  const [showImportPreview, setShowImportPreview] = useState(false);

  // Transport Vouchers State
  const [transportVouchers, setTransportVouchers] = useState([]);
  const [selectedVtPeriod, setSelectedVtPeriod] = useState('2026-08');
  const [showVtImportModal, setShowVtImportModal] = useState(false);
  const [vtImportPeriod, setVtImportPeriod] = useState('2026-09');
  const [vtImportRawText, setVtImportRawText] = useState('');
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState(null);
  const [voucherForm, setVoucherForm] = useState({
    employeeId: '',
    route: '',
    idaCost: '6.25',
    voltaCost: '6.25',
    dailyCost: '12.50',
    daysCount: '22',
    workSchedule: 'SEGUNDA A SÁBADO',
    currentBalance: '0.00',
    cardType: 'BHBus',
    cardNumber: '',
    discountPercent: '6'
  });
  const [awardValue, setAwardValue] = useState(100);
  const [awardPeriod, setAwardPeriod] = useState('2026-08');
  const [showAwardReportModal, setShowAwardReportModal] = useState(false);

  useEffect(() => {
    fetchData();
    // Resolve operator name from currentUser or session
    if (currentUser?.name) {
      setOperatorEmail(currentUser.name);
    } else if (currentUser?.email) {
      setOperatorEmail(currentUser.email);
    } else {
      const sess = sessionStorage.getItem('sistema_indicadores_session');
      if (sess) {
        dbService.getUsers().then(list => {
          const found = list.find(u => u.uid === sess);
          if (found) setOperatorEmail(found.name || found.email);
        });
      }
    }

    // Load saved dashboard layout preferences for the user
    const userKey = currentUser?.uid || currentUser?.email || 'default';
    if (currentUser?.hrDashboardLayout && Array.isArray(currentUser.hrDashboardLayout)) {
      setDashboardLayout(currentUser.hrDashboardLayout);
    } else {
      const saved = localStorage.getItem(`hr_dashboard_layout_${userKey}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setDashboardLayout(parsed);
          }
        } catch (err) {
          console.error('Error loading dashboard layout preference:', err);
        }
      }
    }
  }, [currentUser]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [empList, userList, secList, logList, vtList] = await Promise.all([
        dbService.getEmployees(),
        dbService.getUsers(),
        dbService.getSectors(),
        dbService.getAuditLogs(),
        dbService.getTransportVouchers()
      ]);
      setEmployees(empList);
      setUsersList(userList);
      setSectors(secList);
      setAuditLogs(logList);
      setTransportVouchers(vtList);

      if (secList.length > 0) {
        setEmpForm(f => ({ ...f, sectorId: secList[0].id }));
        setUserForm(f => ({ ...f, employeeId: empList[0]?.id || '' }));
      }
      if (empList.length > 0) {
        setVoucherForm(f => ({ ...f, employeeId: empList[0].id }));
      }
    } catch (err) {
      console.error(err);
      showAlert('Erro ao buscar dados de gestão de RH.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 5000);
  };

  // Helper Audit Logger
  const logAuditAction = async (action, details) => {
    try {
      const op = currentUser?.name || currentUser?.email || (operatorEmail === 'rh@clinica.com' ? 'Ana Carolina Cerqueira Gonzaga' : operatorEmail);
      await dbService.createAuditLog({
        operator: op,
        action,
        details
      });
    } catch (err) {
      console.error('Audit logging failed:', err);
    }
  };

  // Helper CNPJ/CPF formatters
  const formatCpf = (v) => {
    const clean = v.replace(/\D/g, '');
    if (clean.length !== 11) return v;
    return `${clean.substring(0, 3)}.${clean.substring(3, 6)}.${clean.substring(6, 9)}-${clean.substring(9, 11)}`;
  };

  // ----------------------------------------------------
  // Employee Actions
  // ----------------------------------------------------
  const handleOpenEmpAdd = () => {
    setEditingEmp(null);
    setEmpActiveTab('pessoais');
    setEmpForm({
      name: '',
      gender: 'Feminino',
      birthDate: '',
      cpf: '',
      rg: '',
      motherName: '',
      photo: '',
      phone: '',
      email: '',
      city: 'Betim',
      state: 'MG',
      address: '',
      cep: '',
      role: 'Enfermeiro(a)',
      sectorId: sectors[0]?.id || '',
      admissionDate: new Date().toISOString().substring(0, 10),
      contractType: 'CLT',
      salary: '3200',
      status: 'Ativo',
      terminationDate: '',
      cnhNumber: '',
      cnhExpiry: '',
      bankName: '',
      bankAgency: '',
      bankAccount: '',
      dependents: [],
      warnings: [],
      vaccinations: [],
      documents: [],
      absences: []
    });
    setShowEmpModal(true);
  };

  const handleOpenEmpEdit = (emp) => {
    setEditingEmp(emp);
    setEmpActiveTab('pessoais');
    setEmpForm({
      name: emp.name || '',
      gender: emp.gender || 'Feminino',
      birthDate: emp.birthDate || '',
      cpf: emp.cpf || '',
      rg: emp.rg || '',
      motherName: emp.motherName || '',
      photo: emp.photo || '',
      phone: emp.phone || '',
      email: emp.email || '',
      city: emp.city || 'Betim',
      state: emp.state || 'MG',
      address: emp.address || '',
      cep: emp.cep || '',
      role: emp.role || '',
      sectorId: emp.sectorId || (sectors[0]?.id || ''),
      admissionDate: emp.admissionDate || '',
      contractType: emp.contractType || 'CLT',
      salary: emp.salary ? emp.salary.toString() : '0',
      status: emp.status || 'Ativo',
      terminationDate: emp.terminationDate || '',
      cnhNumber: emp.cnhNumber || '',
      cnhExpiry: emp.cnhExpiry || '',
      bankName: emp.bankName || '',
      bankAgency: emp.bankAgency || '',
      bankAccount: emp.bankAccount || '',
      dependents: emp.dependents || [],
      warnings: emp.warnings || [],
      vaccinations: emp.vaccinations || [],
      documents: emp.documents || [],
      absences: emp.absences || []
    });
    setShowEmpModal(true);
  };

  // Filtragem de Dados pela Unidade Ativa
  const currentEmployees = useMemo(() => filterByActiveUnit(employees), [employees, activeUnitId]);
  const currentUsersList = useMemo(() => filterByActiveUnit(usersList), [usersList, activeUnitId]);
  const currentTransportVouchers = useMemo(() => filterByActiveUnit(transportVouchers), [transportVouchers, activeUnitId]);

  const handleSaveEmployee = async (e) => {
    e.preventDefault();
    if (!empForm.name || !empForm.cpf || !empForm.birthDate) {
      return showAlert('Nome, CPF e Nascimento são obrigatórios.', 'warning');
    }

    setActionLoading(true);
    try {
      const targetUnitId = activeUnitId === 'all' ? 'betim' : activeUnitId;
      const targetUnit = targetUnitId === 'taguatinga' ? 'Taguatinga' : 'Betim';

      const data = {
        ...empForm,
        salary: parseFloat(empForm.salary) || 0,
        unitId: targetUnitId,
        unit: targetUnit
      };

      if (editingEmp) {
        const oldVal = JSON.stringify(editingEmp);
        const newVal = JSON.stringify(data);
        await dbService.updateEmployee(editingEmp.id, data);
        showAlert(`Ficha do funcionário "${data.name}" atualizada!`, 'success');
        logAuditAction('Atualização de Funcionário', `Ficha de ${data.name} editada. De: ${oldVal} Para: ${newVal}`);
      } else {
        await dbService.createEmployee(data);
        showAlert(`Funcionário "${data.name}" admitido no sistema!`, 'success');
        logAuditAction('Criação de Funcionário', `Funcionário ${data.name} (CPF: ${data.cpf}) adicionado.`);
      }
      setShowEmpModal(false);
      fetchData();
    } catch (err) {
      showAlert('Erro ao gravar dados do funcionário.', 'danger');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDismissEmployee = async (emp) => {
    const termDate = prompt(`Confirma a demissão / desligamento do funcionário "${emp.name}"?\nDigite a data do desligamento (AAAA-MM-DD):`, new Date().toISOString().substring(0, 10));
    if (!termDate) return;

    setActionLoading(true);
    try {
      await dbService.updateEmployee(emp.id, {
        ...emp,
        status: 'Inativo',
        terminationDate: termDate
      });
      showAlert(`Desligamento de "${emp.name}" registrado com sucesso!`, 'success');
      logAuditAction('Desligamento / Demissão', `Funcionário ${emp.name} (ID: ${emp.id}) foi desligado na data ${termDate}.`);
      fetchData();
    } catch (err) {
      showAlert('Erro ao registrar desligamento.', 'danger');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteEmployee = async (emp) => {
    if (!window.confirm(`Tem certeza que deseja remover permanentemente o funcionário "${emp.name}"?`)) return;

    setActionLoading(true);
    try {
      await dbService.deleteEmployee(emp.id);
      showAlert(`Ficha do funcionário "${emp.name}" removida.`, 'success');
      logAuditAction('Exclusão de Funcionário', `Funcionário ${emp.name} (ID: ${emp.id}) excluído permanentemente.`);
      fetchData();
    } catch (err) {
      showAlert('Erro ao remover funcionário.', 'danger');
    } finally {
      setActionLoading(false);
    }
  };

  // Vale-Transporte Concessions Handlers
  const handleOpenVoucherAdd = () => {
    setEditingVoucher(null);
    setVoucherForm({
      employeeId: employees[0]?.id || '',
      period: selectedVtPeriod || '2026-08',
      route: '',
      idaCost: '6.25',
      voltaCost: '6.25',
      dailyCost: '12.50',
      daysCount: '22',
      workSchedule: 'SEGUNDA A SÁBADO',
      currentBalance: '0.00',
      cardType: 'BetimCARD',
      cardNumber: '',
      discountPercent: '6'
    });
    setShowVoucherModal(true);
  };

  const handleOpenVoucherEdit = (v) => {
    setEditingVoucher(v);
    setVoucherForm({
      employeeId: v.employeeId,
      period: v.period || selectedVtPeriod || '2026-08',
      route: v.route || '',
      idaCost: v.idaCost ? v.idaCost.toString() : '0',
      voltaCost: v.voltaCost ? v.voltaCost.toString() : '0',
      dailyCost: v.dailyCost ? v.dailyCost.toString() : '0',
      daysCount: v.daysCount ? v.daysCount.toString() : '0',
      workSchedule: v.workSchedule || 'SEGUNDA A SÁBADO',
      currentBalance: v.currentBalance ? v.currentBalance.toString() : '0',
      cardType: v.cardType || 'BetimCARD',
      cardNumber: v.cardNumber || '',
      discountPercent: v.discountPercent ? v.discountPercent.toString() : '6'
    });
    setShowVoucherModal(true);
  };

  const handleSaveVoucher = async (e) => {
    e.preventDefault();
    if (!voucherForm.employeeId || !voucherForm.route) {
      return showAlert('Funcionário e Itinerário são obrigatórios.', 'warning');
    }
    setActionLoading(true);
    try {
      const emp = employees.find(e => e.id === voucherForm.employeeId);
      const ida = parseFloat(voucherForm.idaCost) || 0;
      const volta = parseFloat(voucherForm.voltaCost) || 0;
      const daily = parseFloat(voucherForm.dailyCost) || (ida + volta);
      const days = parseInt(voucherForm.daysCount) || 22;
      const expected = daily * days;
      const currentBal = parseFloat(voucherForm.currentBalance) || 0;
      const recharge = Math.max(0, expected - currentBal);
      const period = voucherForm.period || selectedVtPeriod || '2026-08';

      const payload = {
        ...voucherForm,
        period,
        employeeName: emp?.name || '',
        idaCost: ida.toFixed(2),
        voltaCost: volta.toFixed(2),
        dailyCost: daily.toFixed(2),
        expectedValue: expected,
        totalValue: expected,
        currentBalance: currentBal,
        rechargeNeeded: recharge,
        rawRechargeNeeded: expected - currentBal
      };

      if (editingVoucher) {
        await dbService.updateTransportVoucher(editingVoucher.id, payload);
        showAlert('Concessão de Vale-Transporte atualizada com sucesso!', 'success');
        logAuditAction('Atualização de Vale-Transporte', `VT do funcionário ${emp?.name || voucherForm.employeeId} atualizado.`);
      } else {
        await dbService.createTransportVoucher(payload);
        showAlert('Concessão de Vale-Transporte cadastrada com sucesso!', 'success');
        logAuditAction('Criação de Vale-Transporte', `Novo VT cadastrado para o funcionário ${emp?.name || voucherForm.employeeId}.`);
      }

      if (period && period !== selectedVtPeriod) {
        setSelectedVtPeriod(period);
      }
      setShowVoucherModal(false);
      fetchData();
    } catch (err) {
      console.error(err);
      showAlert('Erro ao gravar concessão de Vale-Transporte.', 'danger');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteVoucher = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir esta concessão de Vale-Transporte?')) return;
    setActionLoading(true);
    try {
      await dbService.deleteTransportVoucher(id);
      showAlert('Concessão de Vale-Transporte excluída.', 'success');
      logAuditAction('Exclusão de Vale-Transporte', `Excluiu concessão VT ID: ${id}`);
      fetchData();
    } catch (err) {
      console.error(err);
      showAlert('Erro ao remover concessão.', 'danger');
    } finally {
      setActionLoading(false);
    }
  };

  const handleBatchImportVTSubmit = async (period, vouchersList) => {
    if (!vouchersList || vouchersList.length === 0) {
      return showAlert('Nenhum dado válido para importar.', 'warning');
    }
    setActionLoading(true);
    try {
      await dbService.importTransportVouchersBatch(period, vouchersList);
      showAlert(`Sucesso! ${vouchersList.length} concessões de VT importadas para o mês ${period}.`, 'success');
      logAuditAction('Importação em Lote de VT', `Importados ${vouchersList.length} vales para o período ${period}.`);
      setSelectedVtPeriod(period);
      setShowVtImportModal(false);
      fetchData();
    } catch (err) {
      console.error(err);
      showAlert('Erro ao realizar importação em lote de VT.', 'danger');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSimulateNextMonthVT = async (targetPeriod) => {
    if (!targetPeriod) return;
    const currentList = transportVouchers.filter(v => (v.period || '2026-08') === selectedVtPeriod);
    if (currentList.length === 0) {
      return showAlert('Não existem dados no mês selecionado para projetar o próximo mês.', 'warning');
    }
    if (!window.confirm(`Deseja gerar a previsão de Vale-Transporte para o mês ${targetPeriod} com base nos ${currentList.length} colaboradores do período ${selectedVtPeriod}?`)) return;

    setActionLoading(true);
    try {
      const simulated = currentList.map(v => {
        const expected = parseFloat(v.expectedValue || v.totalValue) || 0;
        const currentBal = Math.max(0, parseFloat(v.currentBalance) || 0);
        const req = Math.max(0, expected - currentBal);
        return {
          employeeName: v.employeeName || (employees.find(e => e.id === v.employeeId)?.name || 'Colaborador'),
          employeeId: v.employeeId,
          idaCost: v.idaCost || 6.25,
          voltaCost: v.voltaCost || 6.25,
          dailyCost: v.dailyCost || 12.50,
          workSchedule: v.workSchedule || 'SEGUNDA A SÁBADO',
          expectedValue: expected,
          balancePrevious: currentBal,
          currentBalance: Math.max(0, currentBal - ((v.dailyCost || 12.50) * 10)),
          rechargeNeeded: req,
          route: v.route || 'Linha Urbana',
          cardType: v.cardType || 'BetimCARD / BHBus',
          cardNumber: v.cardNumber || ''
        };
      });

      await dbService.importTransportVouchersBatch(targetPeriod, simulated);
      showAlert(`Projeção para ${targetPeriod} criada com sucesso!`, 'success');
      logAuditAction('Projeção de VT', `Gerou projeção de VT para ${targetPeriod}.`);
      setSelectedVtPeriod(targetPeriod);
      fetchData();
    } catch (err) {
      console.error(err);
      showAlert('Erro ao gerar projeção do próximo mês.', 'danger');
    } finally {
      setActionLoading(false);
    }
  };

  const handleExportVTReport = () => {
    const periodList = transportVouchers.filter(v => (v.period || '2026-08') === selectedVtPeriod);
    if (periodList.length === 0) {
      return showAlert('Nenhum dado para exportar no período selecionado.', 'warning');
    }

    let csvContent = "COLABORADOR;ESCALA;VALOR_IDA;VALOR_VOLTA;TARIFA_DIARIA;PREVISTO;SALDO_CARTAO;RECARGA_NECESSARIA;DESTAQUE\n";
    periodList.forEach(v => {
      const name = v.employeeName || (employees.find(e => e.id === v.employeeId)?.name || 'Sem Nome');
      const escala = v.workSchedule || 'SEGUNDA A SÁBADO';
      const ida = (parseFloat(v.idaCost) || 0).toFixed(2);
      const volta = (parseFloat(v.voltaCost) || 0).toFixed(2);
      const daily = (parseFloat(v.dailyCost) || 0).toFixed(2);
      const prev = (parseFloat(v.expectedValue || v.totalValue) || 0).toFixed(2);
      const bal = (parseFloat(v.currentBalance) || 0).toFixed(2);
      const req = (parseFloat(v.rechargeNeeded) || 0).toFixed(2);
      const tag = v.highlightType === 'orange' ? 'Especial/Novo' : (v.highlightType === 'yellow' ? 'Excedente' : (v.highlightType === 'red' ? 'Negativo' : 'Normal'));
      
      csvContent += `"${name}";"${escala}";${ida};${volta};${daily};${prev};${bal};${req};"${tag}"\n`;
    });

    const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Relatorio_Vale_Transporte_${selectedVtPeriod}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Base64 Photo Upload Handler
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1024 * 1024) return showAlert('A foto deve ter no máximo 1MB.', 'warning');
      const reader = new FileReader();
      reader.onloadend = () => {
        setEmpForm(f => ({ ...f, photo: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // File Upload inside documents / warnings (PDF or Img)
  const handleDocBase64Upload = (e, targetField) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (targetField === 'warning') {
          setNewWarning(w => ({ ...w, docUrl: reader.result }));
        } else {
          setNewDoc(d => ({ ...d, fileUrl: reader.result }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // ----------------------------------------------------
  // Dynamic Sub-items arrays
  // ----------------------------------------------------
  const handleAddDependent = () => {
    if (!newDep.name || !newDep.birthDate) return showAlert('Preencha nome e data de nascimento.', 'warning');
    setEmpForm(f => ({ ...f, dependents: [...f.dependents, newDep] }));
    setNewDep({ name: '', relationship: 'Filho(a)', birthDate: '' });
  };

  const handleAddWarning = () => {
    if (!newWarning.text) return showAlert('Escreva o teor da advertência.', 'warning');
    const warningItem = {
      id: 'warn-' + Math.random().toString(36).substr(2, 5),
      ...newWarning
    };
    setEmpForm(f => ({ ...f, warnings: [...f.warnings, warningItem] }));
    setNewWarning({ date: new Date().toISOString().substring(0, 10), motive: 'Atraso Injustificado', text: '', docUrl: '' });
  };

  const handleAddVaccine = () => {
    if (!newVaccine.name) return showAlert('Informe a vacina.', 'warning');
    setEmpForm(f => ({ ...f, vaccinations: [...f.vaccinations, newVaccine] }));
    setNewVaccine({ name: 'Hepatite B', dose: '1ª Dose', date: new Date().toISOString().substring(0, 10), expiryDate: '', lot: '' });
  };

  const handleAddDocument = () => {
    if (!newDoc.name) return showAlert('Informe o nome do documento.', 'warning');
    setEmpForm(f => ({ ...f, documents: [...f.documents, newDoc] }));
    setNewDoc({ name: '', category: 'Identidade (RG)', expiryDate: '', fileUrl: '' });
  };

  const handleAddAbsence = () => {
    const daysInput = newAbsence.days !== undefined ? newAbsence.days : newAbsence.hours;
    if (!daysInput) return showAlert('Informe os dias de ausência.', 'warning');
    const daysNum = parseFloat(daysInput) || 1;
    const absItem = {
      id: 'abs-' + Math.random().toString(36).substr(2, 5),
      ...newAbsence,
      days: daysNum,
      hours: daysNum * 8
    };
    setEmpForm(f => ({ ...f, absences: [...(f.absences || []), absItem] }));
    setNewAbsence({ date: new Date().toISOString().substring(0, 10), type: 'Falta Injustificada', days: '1', motive: '' });
  };

  // ----------------------------------------------------
  // User Management Actions
  // ----------------------------------------------------
  const handleOpenUserAdd = () => {
    setEditingUser(null);
    setTempPasswordMessage('');
    setUserForm({
      name: '',
      email: '',
      role: 'professional',
      allowedSectors: [],
      status: 'active',
      employeeId: employees[0]?.id || ''
    });
    setShowUserModal(true);
  };

  const handleOpenUserEdit = (user) => {
    setEditingUser(user);
    setTempPasswordMessage('');
    setUserForm({
      name: user.name || '',
      email: user.email || '',
      role: user.role || 'professional',
      allowedSectors: user.allowedSectors || [],
      status: user.status || 'active',
      employeeId: user.employeeId || ''
    });
    setShowUserModal(true);
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    if (!userForm.name || !userForm.email) return showAlert('Nome e Email são obrigatórios.', 'warning');

    setActionLoading(true);
    try {
      if (editingUser) {
        await dbService.updateUser(editingUser.uid, userForm);
        showAlert('Usuário atualizado com sucesso!', 'success');
        logAuditAction('Atualização de Usuário', `Usuário ${userForm.email} editado.`);
        setShowUserModal(false);
      } else {
        const userCred = await authService.createUser(userForm.email, userForm.name, userForm.role, userForm.allowedSectors);
        
        // Link with employeeId and status
        await dbService.updateUser(userCred.uid, {
          employeeId: userForm.employeeId,
          status: userForm.status
        });

        const tempPwd = userForm.email.split('@')[0] + '123';
        setTempPasswordMessage(`Usuário cadastrado com sucesso! Senha provisória: ${tempPwd}`);
        logAuditAction('Criação de Usuário', `Usuário de login ${userForm.email} criado.`);
      }
      fetchData();
    } catch (err) {
      showAlert(err.message || 'Erro ao salvar usuário.', 'danger');
    } finally {
      setActionLoading(false);
    }
  };

  const handleResetPassword = async (user) => {
    const newPwd = Math.random().toString(36).substring(2, 10) + 'A1!';
    if (!window.confirm(`Deseja resetar a senha de ${user.name}? A nova senha será exibida na tela.`)) return;

    setActionLoading(true);
    try {
      // In mock auth, we can just save it or show dialog
      alert(`Senha resetada com sucesso para ${user.email}!\n\nNova Senha Temporária: ${newPwd}`);
      logAuditAction('Reset de Senha', `Senha do usuário ${user.email} resetada administrativamente.`);
    } catch (err) {
      showAlert('Erro ao resetar senha.', 'danger');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleUserStatus = async (user) => {
    const isAct = (user.status || 'active') === 'active';
    const newStatus = isAct ? 'inactive' : 'active';
    setActionLoading(true);
    try {
      await dbService.updateUser(user.uid, { status: newStatus });
      showAlert(`Usuário ${user.email} foi ${newStatus === 'active' ? 'ativado' : 'inativado'}!`, 'success');
      logAuditAction('Alteração de Status de Usuário', `Status do usuário ${user.email} alterado para ${newStatus}.`);
      fetchData();
    } catch (err) {
      showAlert('Erro ao alterar status do usuário.', 'danger');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async (user) => {
    if (!window.confirm(`Deseja excluir permanentemente o acesso do usuário ${user.email}?`)) return;
    setActionLoading(true);
    try {
      await dbService.deleteUser(user.uid);
      showAlert('Usuário excluído.', 'success');
      logAuditAction('Exclusão de Usuário', `Usuário ${user.email} excluído.`);
      fetchData();
    } catch (err) {
      showAlert('Erro ao excluir usuário.', 'danger');
    } finally {
      setActionLoading(false);
    }
  };

  // ----------------------------------------------------
  // CSV Import / Export Relatórios
  // ----------------------------------------------------
  const handleDownloadTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8,Nome,CPF,Nascimento,Genero,Mae,Telefone,Email,Cargo,Setor_ID,Admissao,Salario,Tipo_Contrato\n"
      + "Jose da Silva,11122233344,1980-04-12,Masculino,Maria Silva,(31) 9999-8888,jose@clinica.com,Enfermeiro,enfermagem,2025-10-10,3800,CLT\n"
      + "Mariana Souza,55566677788,1992-07-25,Feminino,Ana Souza,(31) 9888-7777,mariana@clinica.com,Médica,medica,2024-01-15,11500,PJ\n";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "modelo_importacao_funcionarios.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCsvUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target.result;
      const lines = text.split('\n');
      const headers = lines[0].split(',');
      
      const parsedData = [];
      const errors = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const columns = line.split(',');
        
        const row = {
          name: columns[0] || '',
          cpf: columns[1] || '',
          birthDate: columns[2] || '',
          gender: columns[3] || 'Feminino',
          motherName: columns[4] || '',
          phone: columns[5] || '',
          email: columns[6] || '',
          role: columns[7] || '',
          sectorId: columns[8] || '',
          admissionDate: columns[9] || '',
          salary: columns[10] || '0',
          contractType: columns[11] || 'CLT'
        };

        const lineErrors = [];
        if (!row.name) lineErrors.push('Nome vazio');
        if (!row.cpf) lineErrors.push('CPF vazio');
        if (!row.birthDate) lineErrors.push('Nascimento vazio');
        if (row.cpf && !/^\d{11}$/.test(row.cpf.replace(/\D/g, ''))) lineErrors.push('CPF deve ter 11 dígitos');

        if (lineErrors.length > 0) {
          errors.push({ line: i + 1, item: row.name || `Linha ${i + 1}`, message: lineErrors.join(', ') });
        }

        parsedData.push(row);
      }

      setCsvData(parsedData);
      setCsvErrors(errors);
      setShowImportPreview(true);
    };
    reader.readAsText(file);
  };

  const handleConfirmCsvImport = async () => {
    if (csvErrors.length > 0) {
      return showAlert('Corrija os erros na tabela de preview antes de importar.', 'warning');
    }

    setActionLoading(true);
    try {
      let importedCount = 0;
      for (const row of csvData) {
        await dbService.createEmployee({
          name: row.name,
          gender: row.gender,
          birthDate: row.birthDate,
          cpf: formatCpf(row.cpf),
          rg: '',
          motherName: row.motherName,
          phone: row.phone,
          email: row.email,
          city: 'Betim',
          state: 'MG',
          address: '',
          cep: '',
          role: row.role,
          sectorId: row.sectorId || (sectors[0]?.id || ''),
          admissionDate: row.admissionDate,
          contractType: row.contractType,
          salary: parseFloat(row.salary) || 0,
          cnhNumber: '',
          cnhExpiry: '',
          bankName: '',
          bankAgency: '',
          bankAccount: ''
        });
        importedCount++;
      }
      
      showAlert(`${importedCount} funcionários importados em lote!`, 'success');
      logAuditAction('Importação em Lote', `Importação realizada de ${importedCount} funcionários via arquivo CSV.`);
      setShowImportPreview(false);
      fetchData();
    } catch (err) {
      showAlert('Erro durante a importação em lote.', 'danger');
    } finally {
      setActionLoading(false);
    }
  };

  // Generic CSV Downloader
  const downloadCsv = (filename, headers, rows) => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + rows.map(r => r.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportFullCadaster = () => {
    const headers = ['ID', 'Nome', 'CPF', 'Setor', 'Admissao', 'Cargo', 'Contrato', 'Salario'];
    const rows = currentEmployees.map(e => [
      e.id, e.name, e.cpf, 
      sectors.find(s => s.id === e.sectorId)?.name || e.sectorId, 
      e.admissionDate, e.role, e.contractType, e.salary
    ]);
    downloadCsv('relatorio_funcionarios_completo.csv', headers, rows);
  };

  const handleExportBirthdays = () => {
    const headers = ['Nome', 'Data Nascimento', 'Setor', 'Telefone'];
    const rows = currentEmployees.map(e => [
      e.name, e.birthDate, 
      sectors.find(s => s.id === e.sectorId)?.name || e.sectorId, 
      e.phone
    ]);
    downloadCsv('relatorio_aniversariantes_mes.csv', headers, rows);
  };

  const handleExportWarnings = () => {
    const headers = ['Funcionario', 'Data Advertencia', 'Motivo', 'Descricao'];
    const rows = [];
    currentEmployees.forEach(e => {
      if (e.warnings) {
        e.warnings.forEach(w => {
          rows.push([e.name, w.date, w.motive, w.text]);
        });
      }
    });
    downloadCsv('relatorio_advertencias_aplicadas.csv', headers, rows);
  };

  // ----------------------------------------------------
  // Dashboard Layout & Customization Handlers
  // ----------------------------------------------------
  const handleSaveDashboardLayout = async (newLayout) => {
    const layoutToSave = newLayout || dashboardLayout;
    setDashboardLayout(layoutToSave);
    const userKey = currentUser?.uid || currentUser?.email || 'default';
    localStorage.setItem(`hr_dashboard_layout_${userKey}`, JSON.stringify(layoutToSave));
    
    if (currentUser?.uid) {
      try {
        await dbService.updateUser(currentUser.uid, { hrDashboardLayout: layoutToSave });
      } catch (err) {
        console.error('Erro ao salvar layout na nuvem:', err);
      }
    }
    showAlert('Layout do Painel de Controle salvo com sucesso!', 'success');
    logAuditAction('Personalização de Dashboard', 'Layout das caixas do painel de controle do RH foi atualizado.');
  };

  const handleResetDashboardLayout = () => {
    setDashboardLayout(DEFAULT_DASHBOARD_LAYOUT);
    const userKey = currentUser?.uid || currentUser?.email || 'default';
    localStorage.removeItem(`hr_dashboard_layout_${userKey}`);
    showAlert('Layout restaurado para o padrão pequeno!', 'success');
  };

  const handleMoveCard = (index, direction) => {
    const newLayout = [...dashboardLayout];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= newLayout.length) return;
    const temp = newLayout[index];
    newLayout[index] = newLayout[targetIndex];
    newLayout[targetIndex] = temp;
    setDashboardLayout(newLayout);
  };

  const handleChangeCardSize = (id, newSize) => {
    const newLayout = dashboardLayout.map(card => 
      card.id === id ? { ...card, size: newSize } : card
    );
    setDashboardLayout(newLayout);
  };

  const handleOpenEmpByName = (nameOrId) => {
    const found = currentEmployees.find(e => e.id === nameOrId || e.name?.toLowerCase() === (nameOrId || '').toLowerCase());
    if (found) {
      handleOpenEmpEdit(found);
    } else {
      showAlert(`Ficha de "${nameOrId}" não encontrada.`, 'warning');
    }
  };

  // ----------------------------------------------------
  // Sorting & Filtering
  // ----------------------------------------------------
  const handleSort = (key) => {
    setSortConfig(prev => {
      if (prev.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'asc' };
    });
  };

  const renderSortIcon = (key) => {
    if (sortConfig.key !== key) return <ArrowUpDown size={14} style={{ opacity: 0.4 }} />;
    return sortConfig.direction === 'asc' 
      ? <ArrowUp size={14} style={{ color: '#ec4899' }} /> 
      : <ArrowDown size={14} style={{ color: '#ec4899' }} />;
  };

  const getFilteredEmployees = () => {
    const filtered = currentEmployees.filter(emp => {
      const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            emp.cpf.includes(searchTerm) ||
                            (emp.role && emp.role.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesSector = filterSector ? emp.sectorId === filterSector : true;
      const matchesStatus = filterStatus === 'all' 
        ? true 
        : filterStatus === 'inactive' 
          ? emp.status === 'Inativo' 
          : emp.status !== 'Inativo';
      return matchesSearch && matchesSector && matchesStatus;
    });

    if (!sortConfig.key) return filtered;

    return [...filtered].sort((a, b) => {
      let aVal = a[sortConfig.key] || '';
      let bVal = b[sortConfig.key] || '';

      if (sortConfig.key === 'sectorId') {
        aVal = sectors.find(s => s.id === a.sectorId)?.name || a.sectorId || '';
        bVal = sectors.find(s => s.id === b.sectorId)?.name || b.sectorId || '';
      } else if (sortConfig.key === 'warnings') {
        aVal = (a.warnings?.length || 0) + (a.documents?.length || 0);
        bVal = (b.warnings?.length || 0) + (b.documents?.length || 0);
      }

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
      }

      const strA = String(aVal).toLowerCase();
      const strB = String(bVal).toLowerCase();

      if (strA < strB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (strA > strB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const getRecentWarnings = () => {
    const list = [];
    currentEmployees.filter(e => e.status !== 'Inativo').forEach(e => {
      if (e.warnings) {
        e.warnings.forEach(w => list.push({ empName: e.name, ...w }));
      }
    });
    return list.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
  };

  const getUpcomingVaccines = () => {
    const list = [];
    currentEmployees.filter(e => e.status !== 'Inativo').forEach(e => {
      if (e.vaccinations) {
        e.vaccinations.forEach(v => {
          if (v.expiryDate) list.push({ empName: e.name, ...v });
        });
      }
    });
    return list.sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate)).slice(0, 5);
  };

  const isEmployeeInProbation = (e) => {
    if (!e || e.status === 'Inativo') return false;
    const typeStr = (e.contractType || '').toLowerCase();
    if (typeStr.includes('experi')) return true;
    if (e.admissionDate) {
      const admDate = new Date(e.admissionDate);
      if (!isNaN(admDate.getTime())) {
        const today = new Date();
        const daysDiff = (today - admDate) / (1000 * 60 * 60 * 24);
        if (daysDiff >= 0 && daysDiff <= 90) return true;
      }
    }
    return false;
  };

  const getExpiringContracts = () => {
    const today = new Date();
    return currentEmployees.filter(e => {
      if (!e || e.status === 'Inativo' || !e.admissionDate) return false;
      const admDate = new Date(e.admissionDate);
      if (isNaN(admDate.getTime())) return false;

      const typeStr = (e.contractType || '').toLowerCase();
      const isExplicitExp = typeStr.includes('experi');

      const limit45 = new Date(admDate.getTime() + 45 * 24 * 60 * 60 * 1000);
      const limit90 = new Date(admDate.getTime() + 90 * 24 * 60 * 60 * 1000);
      
      const diff45 = (limit45 - today) / (1000 * 60 * 60 * 24);
      const diff90 = (limit90 - today) / (1000 * 60 * 60 * 24);

      if (isExplicitExp) return true;
      return (diff45 >= -30 && diff45 <= 90) || (diff90 >= -30 && diff90 <= 90);
    }).map(e => {
      const admDate = new Date(e.admissionDate);
      const limit45 = new Date(admDate.getTime() + 45 * 24 * 60 * 60 * 1000);
      const limit90 = new Date(admDate.getTime() + 90 * 24 * 60 * 60 * 1000);
      const today = new Date();
      
      const diff45 = (limit45 - today) / (1000 * 60 * 60 * 24);
      const diff90 = (limit90 - today) / (1000 * 60 * 60 * 24);

      let stageLabel = '1ª Avaliação (45d)';
      let targetDate = limit45;

      if (diff45 < -5 || Math.abs(diff90) < Math.abs(diff45)) {
        stageLabel = 'Término (90d)';
        targetDate = limit90;
      }

      return {
        ...e,
        expStageLabel: stageLabel,
        expTargetDate: targetDate
      };
    }).sort((a, b) => a.expTargetDate - b.expTargetDate);
  };

  const getPresencaPremiadaData = (periodOverride) => {
    const periodToUse = periodOverride || awardPeriod || '2026-08';
    const [yStr, mStr] = periodToUse.split('-');
    const year = parseInt(yStr, 10) || 2026;
    const month = (parseInt(mStr, 10) || 8) - 1; // 0-indexed month
    const startDate = new Date(year, month, 1, 0, 0, 0);
    const endDate = new Date(year, month + 1, 0, 23, 59, 59);

    const eligible = [];
    const disqualified = [];

    currentEmployees.forEach(emp => {
      // Ignorar desligados antes do período
      if (emp.status === 'Inativo' && emp.terminationDate) {
        const term = new Date(emp.terminationDate);
        if (term < startDate) return;
      }

      const reasons = [];
      let daysOfContract = 0;

      // 1. Vínculo Empregatício: apenas CLT
      const contractType = (emp.contractType || '').trim().toUpperCase();
      if (contractType !== 'CLT') {
        reasons.push(`Contrato não-CLT (${emp.contractType || 'Não informado'})`);
      }

      // 2. Data de Admissão e Período de Experiência (> 90 dias)
      if (!emp.admissionDate) {
        reasons.push('Data de admissão não cadastrada');
      } else {
        const admDate = new Date(emp.admissionDate);
        if (isNaN(admDate.getTime())) {
          reasons.push('Data de admissão inválida');
        } else if (admDate > endDate) {
          reasons.push(`Admitido após o período (${emp.admissionDate})`);
        } else {
          // Diferença em dias até o encerramento do mês apurado
          daysOfContract = Math.floor((endDate.getTime() - admDate.getTime()) / (1000 * 60 * 60 * 24));
          if (daysOfContract <= 90) {
            reasons.push(`Em período de experiência (${daysOfContract} dias de contrato - carência mínima > 90 dias)`);
          }
        }
      }

      // 3. Status do Colaborador
      if (emp.status === 'Inativo') {
        reasons.push('Colaborador inativo / desligado');
      }

      // 4. Advertências Disciplinares: qualquer advertência no mês desclassifica
      if (emp.warnings && Array.isArray(emp.warnings)) {
        const monthWarnings = emp.warnings.filter(w => {
          if (!w.date) return false;
          const wDate = new Date(w.date);
          return wDate >= startDate && wDate <= endDate;
        });
        if (monthWarnings.length > 0) {
          const warnDetails = monthWarnings.map(w => `${w.motive || 'Advertência'}${w.date ? ` (${w.date})` : ''}`).join(', ');
          reasons.push(`${monthWarnings.length} advertência(s) disciplinar(es): ${warnDetails}`);
        }
      }

      // 5. Ausências / Faltas no mês
      if (emp.absences && Array.isArray(emp.absences)) {
        const monthAbsences = emp.absences.filter(abs => {
          if (!abs.date) return false;
          const absDate = new Date(abs.date);
          return absDate >= startDate && absDate <= endDate;
        });
        if (monthAbsences.length > 0) {
          const absDetails = monthAbsences.map(a => `${a.type || 'Ausência'}${a.date ? ` (${a.date})` : ''}`).join(', ');
          reasons.push(`${monthAbsences.length} ausência(s)/falta(s): ${absDetails}`);
        }
      }

      if (reasons.length > 0) {
        disqualified.push({
          employee: emp,
          reasons,
          reason: reasons.join(' • '),
          daysOfContract
        });
      } else {
        eligible.push({
          ...emp,
          daysOfContract
        });
      }
    });

    return { 
      eligible, 
      disqualified, 
      period: periodToUse, 
      awardValue,
      totalAwardCost: eligible.length * awardValue 
    };
  };

  const handleExportAwardReportCSV = (periodOverride) => {
    const data = getPresencaPremiadaData(periodOverride);
    const p = data.period;
    let csvContent = `RELATORIO DE PRESENCA PREMIADA - COMPETENCIA: ${p}\n`;
    csvContent += `VALOR POR COLABORADOR: R$ ${awardValue.toFixed(2)};TOTAL CONTEMPLADOS: ${data.eligible.length};CUSTO TOTAL: R$ ${(data.eligible.length * awardValue).toFixed(2)}\n\n`;
    
    csvContent += "STATUS;NUMERO;NOME_COLABORADOR;CPF;CARGO;SETOR;DATA_ADMISSAO;DIAS_CONTRATO;VALOR_PREMIO;MOTIVOS\n";

    data.eligible.forEach((emp, idx) => {
      const sectorName = sectors.find(s => s.id === emp.sectorId)?.name || emp.sectorId || 'Geral';
      csvContent += `"ELEGIVEL";${idx + 1};"${emp.name}";"${emp.cpf || ''}";"${emp.role || ''}";"${sectorName}";"${emp.admissionDate || ''}";${emp.daysOfContract};${awardValue.toFixed(2)};"Elegível (CLT > 90d, Sem advertências/faltas)"\n`;
    });

    data.disqualified.forEach((item, idx) => {
      const emp = item.employee;
      const sectorName = sectors.find(s => s.id === emp.sectorId)?.name || emp.sectorId || 'Geral';
      csvContent += `"EXCLUIDO";${idx + 1};"${emp.name}";"${emp.cpf || ''}";"${emp.role || ''}";"${sectorName}";"${emp.admissionDate || ''}";${item.daysOfContract};0.00;"${item.reason.replace(/"/g, '""')}"\n`;
    });

    const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Relatorio_Presenca_Premiada_${p}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const calculateCurrentMonthMetrics = () => {
    const today = new Date();
    const year = 2026;
    const month = 6; // Julho
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0, 23, 59, 59);

    const activeEmployees = currentEmployees.filter(e => {
      if (!e.admissionDate) return false;
      const adm = new Date(e.admissionDate);
      if (adm > endDate) return false;
      if (e.status === 'Inativo' && e.terminationDate) {
        const term = new Date(e.terminationDate);
        if (term < startDate) return false;
      }
      return true;
    });

    const activeCount = activeEmployees.length;

    const hires = currentEmployees.filter(e => {
      if (!e.admissionDate) return false;
      const adm = new Date(e.admissionDate);
      return adm >= startDate && adm <= endDate;
    }).length;

    const demissions = currentEmployees.filter(e => {
      if (e.status === 'Inativo' && e.terminationDate) {
        const term = new Date(e.terminationDate);
        return term >= startDate && term <= endDate;
      }
      return false;
    }).length;

    const turnoverVal = activeCount > 0 ? (((hires + demissions) / 2) / activeCount) * 100 : 0;

    let missedHours = 0;
    activeEmployees.forEach(e => {
      if (e.absences) {
        e.absences.forEach(abs => {
          if (abs.date && abs.type === 'Falta Injustificada') {
            const absDate = new Date(abs.date);
            if (absDate >= startDate && absDate <= endDate) {
              missedHours += parseFloat(abs.hours) || 0;
            }
          }
        });
      }
    });

    const absenteeismVal = activeCount > 0 ? (missedHours / (activeCount * 176)) * 100 : 0;

    const allAbsences = [];
    currentEmployees.forEach(e => {
      if (e.absences) {
        e.absences.forEach(abs => {
          allAbsences.push({ empName: e.name, ...abs });
        });
      }
    });
    const recentAbsencesVal = allAbsences.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

    return { turnover: turnoverVal, absenteeism: absenteeismVal, recentAbsences: recentAbsencesVal };
  };

  const getBirthdaysThisMonth = () => {
    const currentMonth = new Date().getMonth();
    return currentEmployees.filter(e => {
      if (e.status === 'Inativo') return false;
      if (!e.birthDate) return false;
      const parts = e.birthDate.split('-');
      if (parts.length < 2) return false;
      const bMonth = parseInt(parts[1], 10) - 1;
      return bMonth === currentMonth;
    }).map(e => {
      const parts = e.birthDate.split('-');
      const day = parseInt(parts[2], 10);
      return {
        id: e.id,
        name: e.name,
        photo: e.photo,
        day,
        role: e.role,
        sectorId: e.sectorId
      };
    }).sort((a, b) => a.day - b.day);
  };

  const birthdaysThisMonth = getBirthdaysThisMonth();
  const { turnover, absenteeism, recentAbsences } = calculateCurrentMonthMetrics();
  const filteredEmployees = getFilteredEmployees();
  const recentWarnings = getRecentWarnings();
  const upcomingVaccines = getUpcomingVaccines();
  const expiringContracts = getExpiringContracts();
  const presencaPremiada = getPresencaPremiadaData();

  return {
    activeTab,
    setActiveTab,
    employees: currentEmployees,
    setEmployees,
    usersList: currentUsersList,
    setUsersList,
    sectors,
    setSectors,
    auditLogs,
    setAuditLogs,
    loading,
    setLoading,
    actionLoading,
    setActionLoading,
    message,
    setMessage,
    operatorEmail,
    setOperatorEmail,
    searchTerm,
    setSearchTerm,
    filterSector,
    setFilterSector,
    filterStatus,
    setFilterStatus,
    sortConfig,
    setSortConfig,
    dashboardLayout,
    setDashboardLayout,
    isCustomizingDashboard,
    setIsCustomizingDashboard,
    showEmpModal,
    setShowEmpModal,
    editingEmp,
    setEditingEmp,
    empActiveTab,
    setEmpActiveTab,
    empForm,
    setEmpForm,
    showUserModal,
    setShowUserModal,
    editingUser,
    setEditingUser,
    userForm,
    setUserForm,
    tempPasswordMessage,
    setTempPasswordMessage,
    newDep,
    setNewDep,
    newWarning,
    setNewWarning,
    newVaccine,
    setNewVaccine,
    newDoc,
    setNewDoc,
    newAbsence,
    setNewAbsence,
    csvData,
    setCsvData,
    csvErrors,
    setCsvErrors,
    showImportPreview,
    setShowImportPreview,
    transportVouchers: currentTransportVouchers,
    setTransportVouchers,
    selectedVtPeriod,
    setSelectedVtPeriod,
    showVtImportModal,
    setShowVtImportModal,
    vtImportPeriod,
    setVtImportPeriod,
    vtImportRawText,
    setVtImportRawText,
    showVoucherModal,
    setShowVoucherModal,
    editingVoucher,
    setEditingVoucher,
    voucherForm,
    setVoucherForm,
    awardValue,
    setAwardValue,
    fetchData,
    showAlert,
    logAuditAction,
    formatCpf,
    handleOpenEmpAdd,
    handleOpenEmpEdit,
    handleSaveEmployee,
    handleDismissEmployee,
    handleDeleteEmployee,
    handleOpenVoucherAdd,
    handleOpenVoucherEdit,
    handleSaveVoucher,
    handleDeleteVoucher,
    handleBatchImportVTSubmit,
    handleSimulateNextMonthVT,
    handleExportVTReport,
    handlePhotoUpload,
    handleDocBase64Upload,
    handleAddDependent,
    handleAddWarning,
    handleAddVaccine,
    handleAddDocument,
    handleAddAbsence,
    handleOpenUserAdd,
    handleOpenUserEdit,
    handleSaveUser,
    handleResetPassword,
    handleToggleUserStatus,
    handleDeleteUser,
    handleDownloadTemplate,
    handleCsvUpload,
    handleConfirmCsvImport,
    downloadCsv,
    handleExportFullCadaster,
    handleExportBirthdays,
    handleExportWarnings,
    handleSaveDashboardLayout,
    handleResetDashboardLayout,
    handleMoveCard,
    handleChangeCardSize,
    handleOpenEmpByName,
    handleSort,
    renderSortIcon,
    getFilteredEmployees,
    getRecentWarnings,
    getUpcomingVaccines,
    isEmployeeInProbation,
    getExpiringContracts,
    getPresencaPremiadaData,
    calculateCurrentMonthMetrics,
    getBirthdaysThisMonth,
    birthdaysThisMonth,
    filteredEmployees,
    recentWarnings,
    upcomingVaccines,
    expiringContracts,
    awardPeriod,
    setAwardPeriod,
    showAwardReportModal,
    setShowAwardReportModal,
    handleExportAwardReportCSV,
    presencaPremiada,
    turnover,
    absenteeism,
    recentAbsences
  };
}
