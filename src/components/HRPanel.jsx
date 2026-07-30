import React, { useState, useEffect } from 'react';
import { dbService, authService } from '../firebase';
import { 
  Users, UserPlus, Shield, Lock, Unlock, Edit2, Trash2, Plus, X, 
  Search, FileText, UploadCloud, Download, Calendar, ShieldAlert,
  CheckCircle2, AlertTriangle, Eye, Award, Check, UserCheck, HelpCircle,
  Gift, Bus
} from 'lucide-react';

export default function HRPanel({ currentUser }) {
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
  const [newAbsence, setNewAbsence] = useState({ date: new Date().toISOString().substring(0, 10), type: 'Falta Injustificada', hours: '8', motive: '' });

  // Import State
  const [csvData, setCsvData] = useState([]);
  const [csvErrors, setCsvErrors] = useState([]);
  const [showImportPreview, setShowImportPreview] = useState(false);

  // Transport Vouchers State
  const [transportVouchers, setTransportVouchers] = useState([]);
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState(null);
  const [voucherForm, setVoucherForm] = useState({
    employeeId: '',
    route: '',
    dailyCost: '11.00',
    daysCount: '22',
    cardType: 'BHBus',
    cardNumber: '',
    discountPercent: '6'
  });
  const [awardValue, setAwardValue] = useState(200);

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

  const handleSaveEmployee = async (e) => {
    e.preventDefault();
    if (!empForm.name || !empForm.cpf || !empForm.birthDate) {
      return showAlert('Nome, CPF e Nascimento são obrigatórios.', 'warning');
    }

    setActionLoading(true);
    try {
      const data = {
        ...empForm,
        salary: parseFloat(empForm.salary) || 0
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
      route: '',
      dailyCost: '11.00',
      daysCount: '22',
      cardType: 'BHBus',
      cardNumber: '',
      discountPercent: '6'
    });
    setShowVoucherModal(true);
  };

  const handleOpenVoucherEdit = (v) => {
    setEditingVoucher(v);
    setVoucherForm({
      employeeId: v.employeeId,
      route: v.route || '',
      dailyCost: v.dailyCost ? v.dailyCost.toString() : '0',
      daysCount: v.daysCount ? v.daysCount.toString() : '0',
      cardType: v.cardType || 'BHBus',
      cardNumber: v.cardNumber || '',
      discountPercent: v.discountPercent ? v.discountPercent.toString() : '6'
    });
    setShowVoucherModal(true);
  };

  const handleSaveVoucher = async (e) => {
    e.preventDefault();
    if (!voucherForm.employeeId || !voucherForm.route) {
      return showAlert('Funcionário e Rota são obrigatórios.', 'warning');
    }
    setActionLoading(true);
    try {
      if (editingVoucher) {
        await dbService.updateTransportVoucher(editingVoucher.id, voucherForm);
        showAlert('Concessão de Vale-Transporte atualizada com sucesso!', 'success');
        logAuditAction('Atualização de Vale-Transporte', `VT do funcionário ${employees.find(emp => emp.id === voucherForm.employeeId)?.name || voucherForm.employeeId} atualizado.`);
      } else {
        await dbService.createTransportVoucher(voucherForm);
        showAlert('Concessão de Vale-Transporte cadastrada com sucesso!', 'success');
        logAuditAction('Criação de Vale-Transporte', `Novo VT cadastrado para o funcionário ${employees.find(emp => emp.id === voucherForm.employeeId)?.name || voucherForm.employeeId}.`);
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
    if (!newAbsence.hours) return showAlert('Informe as horas de ausência.', 'warning');
    const absItem = {
      id: 'abs-' + Math.random().toString(36).substr(2, 5),
      ...newAbsence,
      hours: parseFloat(newAbsence.hours) || 0
    };
    setEmpForm(f => ({ ...f, absences: [...(f.absences || []), absItem] }));
    setNewAbsence({ date: new Date().toISOString().substring(0, 10), type: 'Falta Injustificada', hours: '8', motive: '' });
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
    const rows = employees.map(e => [
      e.id, e.name, e.cpf, 
      sectors.find(s => s.id === e.sectorId)?.name || e.sectorId, 
      e.admissionDate, e.role, e.contractType, e.salary
    ]);
    downloadCsv('relatorio_funcionarios_completo.csv', headers, rows);
  };

  const handleExportBirthdays = () => {
    const headers = ['Nome', 'Data Nascimento', 'Setor', 'Telefone'];
    const rows = employees.map(e => [
      e.name, e.birthDate, 
      sectors.find(s => s.id === e.sectorId)?.name || e.sectorId, 
      e.phone
    ]);
    downloadCsv('relatorio_aniversariantes_mes.csv', headers, rows);
  };

  const handleExportWarnings = () => {
    const headers = ['Funcionario', 'Data Advertencia', 'Motivo', 'Descricao'];
    const rows = [];
    employees.forEach(e => {
      if (e.warnings) {
        e.warnings.forEach(w => {
          rows.push([e.name, w.date, w.motive, w.text]);
        });
      }
    });
    downloadCsv('relatorio_advertencias_aplicadas.csv', headers, rows);
  };

  // ----------------------------------------------------
  // Filtering & Dashboard calculations
  // ----------------------------------------------------
  const getFilteredEmployees = () => {
    return employees.filter(emp => {
      const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            emp.cpf.includes(searchTerm) ||
                            (emp.role && emp.role.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesSector = filterSector ? emp.sectorId === filterSector : true;
      return matchesSearch && matchesSector;
    });
  };

  const getRecentWarnings = () => {
    const list = [];
    employees.forEach(e => {
      if (e.warnings) {
        e.warnings.forEach(w => list.push({ empName: e.name, ...w }));
      }
    });
    return list.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
  };

  const getUpcomingVaccines = () => {
    const list = [];
    employees.forEach(e => {
      if (e.vaccinations) {
        e.vaccinations.forEach(v => {
          if (v.expiryDate) list.push({ empName: e.name, ...v });
        });
      }
    });
    return list.sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate)).slice(0, 5);
  };

  const getExpiringContracts = () => {
    return employees.filter(e => {
      if (e.contractType === 'Experiência' && e.admissionDate) {
        const adm = new Date(e.admissionDate);
        const limit = new Date(adm.getTime() + 90 * 24 * 60 * 60 * 1000);
        const today = new Date();
        const diff = (limit - today) / (1000 * 60 * 60 * 24);
        return diff >= 0 && diff <= 30; // expiring in next 30 days
      }
      return false;
    });
  };

  const getPresencaPremiadaData = () => {
    const year = 2026;
    const month = 6; // Julho
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0, 23, 59, 59);

    const eligible = [];
    const disqualified = [];

    employees.filter(e => e.status !== 'Inativo').forEach(emp => {
      let hasAbsence = false;
      let absenceReason = '';
      if (emp.absences) {
        const monthAbsences = emp.absences.filter(abs => {
          const absDate = new Date(abs.date);
          return absDate >= startDate && absDate <= endDate;
        });
        if (monthAbsences.length > 0) {
          hasAbsence = true;
          absenceReason = `${monthAbsences.length} ausência(s) (${monthAbsences.map(a => a.type).join(', ')})`;
        }
      }

      let hasWarning = false;
      let warningReason = '';
      if (emp.warnings) {
        const monthWarnings = emp.warnings.filter(w => {
          const wDate = new Date(w.date);
          return wDate >= startDate && wDate <= endDate;
        });
        if (monthWarnings.length > 0) {
          hasWarning = true;
          warningReason = `${monthWarnings.length} advertência(s)`;
        }
      }

      if (hasAbsence || hasWarning) {
        disqualified.push({
          employee: emp,
          reason: [absenceReason, warningReason].filter(Boolean).join(' e ')
        });
      } else {
        eligible.push(emp);
      }
    });

    return { eligible, disqualified };
  };

  const calculateCurrentMonthMetrics = () => {
    const today = new Date();
    const year = 2026;
    const month = 6; // Julho
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0, 23, 59, 59);

    const activeEmployees = employees.filter(e => {
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

    const hires = employees.filter(e => {
      if (!e.admissionDate) return false;
      const adm = new Date(e.admissionDate);
      return adm >= startDate && adm <= endDate;
    }).length;

    const demissions = employees.filter(e => {
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
    employees.forEach(e => {
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
    return employees.filter(e => {
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

  return (
    <div style={styles.container}>
      <div style={styles.cardHeader}>
        <div>
          <h1 style={styles.title}>NexaHR - Recursos Humanos & Governança</h1>
          <p style={styles.subtitle}>Gerenciamento completo de equipe, controle de permissões de usuários, central de arquivos e logs de auditoria.</p>
        </div>
      </div>

      {/* Primary Tabs */}
      <div style={styles.tabsWrapper}>
        <button onClick={() => setActiveTab('dashboard')} style={{ ...styles.tabBtn, ...(activeTab === 'dashboard' ? styles.tabBtnActive : {}) }}>
          Painel de Controle
        </button>
        <button onClick={() => setActiveTab('employees')} style={{ ...styles.tabBtn, ...(activeTab === 'employees' ? styles.tabBtnActive : {}) }}>
          <Users size={16} /> Funcionários ({employees.length})
        </button>
        <button onClick={() => setActiveTab('transport')} style={{ ...styles.tabBtn, ...(activeTab === 'transport' ? styles.tabBtnActive : {}) }}>
          <Bus size={16} /> Vale-Transporte
        </button>
        <button onClick={() => setActiveTab('reports')} style={{ ...styles.tabBtn, ...(activeTab === 'reports' ? styles.tabBtnActive : {}) }}>
          <FileText size={16} /> Relatórios & Importação
        </button>
        <button onClick={() => setActiveTab('audit')} style={{ ...styles.tabBtn, ...(activeTab === 'audit' ? styles.tabBtnActive : {}) }}>
          Auditoria & Logs
        </button>
      </div>

      {/* Message feedback */}
      {message.text && (
        <div style={{ ...styles.alert, backgroundColor: `var(--${message.type}-light)`, border: `1px solid var(--${message.type}-color)` }}>
          <ShieldAlert size={18} color={`var(--${message.type}-color)`} />
          <span style={{ color: `var(--${message.type}-color)`, fontWeight: '600' }}>{message.text}</span>
        </div>
      )}

      {loading ? (
        <div style={styles.loadingBox}>Carregando módulo de RH...</div>
      ) : (
        <>
          {/* TAB 1: Dashboard / KPIs */}
          {activeTab === 'dashboard' && (
            <div style={styles.dashboardContainer}>
              <div style={styles.kpiGrid}>
                <div style={styles.kpiCard}>
                  <span style={styles.kpiLabel}>Total de Funcionários</span>
                  <span style={styles.kpiVal}>{employees.filter(e => e.status !== 'Inativo').length}</span>
                </div>
                <div style={{ ...styles.kpiCard, borderLeftColor: '#10b981' }}>
                  <span style={styles.kpiLabel}>Turnover (Mensal)</span>
                  <span style={styles.kpiVal}>{turnover.toFixed(2)}%</span>
                </div>
                <div style={{ ...styles.kpiCard, borderLeftColor: '#3b82f6' }}>
                  <span style={styles.kpiLabel}>Absenteísmo (Mensal)</span>
                  <span style={styles.kpiVal}>{absenteeism.toFixed(2)}%</span>
                </div>
                <div style={{ ...styles.kpiCard, borderLeftColor: '#ef4444' }}>
                  <span style={styles.kpiLabel}>Advertências</span>
                  <span style={styles.kpiVal}>{recentWarnings.length}</span>
                </div>
                <div style={{ ...styles.kpiCard, borderLeftColor: '#f59e0b' }}>
                  <span style={styles.kpiLabel}>Em Experiência</span>
                  <span style={styles.kpiVal}>{employees.filter(e => e.contractType === 'Experiência').length}</span>
                </div>
              </div>

              <div style={styles.dashboardSplitGrid}>
                {/* Birthday Panel */}
                <div style={{ ...styles.kpiSection, gridColumn: 'span 2', background: 'linear-gradient(135deg, rgba(236,72,153,0.05) 0%, rgba(139,92,246,0.05) 100%)', border: '1px solid rgba(236,72,153,0.15)' }}>
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ec4899' }}>
                    <Gift size={20} /> 🎂 Aniversariantes do Mês de {new Date().toLocaleString('pt-BR', { month: 'long' })}
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
                    {birthdaysThisMonth.length === 0 ? (
                      <p style={{ ...styles.noDataMini, gridColumn: 'span 2' }}>Nenhum aniversariante neste mês.</p>
                    ) : (
                      birthdaysThisMonth.map((b, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: '8px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                          <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#fdf2f8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#db2777', overflow: 'hidden' }}>
                            {b.photo ? <img src={b.photo} alt={b.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : b.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: '700', fontSize: '0.85rem' }}>{b.name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Dia {b.day} ({b.role})</div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Warnings list */}
                <div style={styles.kpiSection}>
                  <h3>⚠️ Últimas Advertências Registradas</h3>
                  <div style={styles.listWrapper}>
                    {recentWarnings.length === 0 ? (
                      <p style={styles.noDataMini}>Nenhuma advertência recente.</p>
                    ) : (
                      recentWarnings.map((w, idx) => (
                        <div key={idx} style={styles.listItem}>
                          <div>
                            <strong>{w.empName}</strong> - {w.motive}
                            <span style={styles.listSubText}>{w.text}</span>
                          </div>
                          <span style={styles.listBadge}>{new Date(w.date).toLocaleDateString('pt-BR')}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Expiry alerts list */}
                <div style={styles.kpiSection}>
                  <h3>💉 Próximas Vacinações Vencendo</h3>
                  <div style={styles.listWrapper}>
                    {upcomingVaccines.length === 0 ? (
                      <p style={styles.noDataMini}>Sem vacinas com validade próxima.</p>
                    ) : (
                      upcomingVaccines.map((v, idx) => (
                        <div key={idx} style={styles.listItem}>
                          <div>
                            <strong>{v.empName}</strong> - Vacina: {v.name} ({v.dose})
                            <span style={styles.listSubText}>Lote: {v.lot || '-'}</span>
                          </div>
                          <span style={{ ...styles.listBadge, backgroundColor: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>
                            Vence: {new Date(v.expiryDate).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Recent Absences list */}
                <div style={{ ...styles.kpiSection, gridColumn: 'span 2' }}>
                  <h3>📅 Últimas Ausências / Faltas Registradas</h3>
                  <div style={styles.listWrapper}>
                    {recentAbsences.length === 0 ? (
                      <p style={styles.noDataMini}>Nenhuma ausência registrada recentemente.</p>
                    ) : (
                      recentAbsences.map((abs, idx) => (
                        <div key={idx} style={styles.listItem}>
                          <div>
                            <strong>{abs.empName}</strong> - {abs.type} ({abs.hours}h)
                            <span style={styles.listSubText}>{abs.motive || 'Sem observação'}</span>
                          </div>
                          <span style={{ 
                            ...styles.listBadge, 
                            backgroundColor: abs.type === 'Falta Injustificada' ? '#fee2e2' : '#f1f5f9',
                            color: abs.type === 'Falta Injustificada' ? '#991b1b' : '#475569' 
                          }}>
                            {new Date(abs.date).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Experiencing contracts warning */}
                <div style={{ ...styles.kpiSection, gridColumn: 'span 2' }}>
                  <h3>⏳ Contratos de Experiência Vencendo nos Próximos 30 Dias</h3>
                  <div style={styles.listWrapper}>
                    {expiringContracts.length === 0 ? (
                      <p style={styles.noDataMini}>Nenhum contrato de experiência vencendo nos próximos 30 dias.</p>
                    ) : (
                      expiringContracts.map((e, idx) => {
                        const limit = new Date(new Date(e.admissionDate).getTime() + 90 * 24 * 60 * 60 * 1000);
                        return (
                          <div key={idx} style={styles.listItem}>
                            <div>
                              <strong>{e.name}</strong> - Cargo: {e.role} | Setor: {sectors.find(s => s.id === e.sectorId)?.name || e.sectorId}
                            </div>
                            <span style={{ ...styles.listBadge, backgroundColor: '#fef3c7', color: '#d97706' }}>
                              Fim da Experiência: {limit.toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Módulo Presença Premiada */}
                <div style={{ ...styles.kpiSection, gridColumn: 'span 2', borderLeft: '4px solid #10b981' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      🏆 Presença Premiada - Julho de 2026
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: '600' }}>Valor do Prêmio:</span>
                      <input 
                        type="number" 
                        value={awardValue} 
                        onChange={e => setAwardValue(Math.max(0, parseFloat(e.target.value) || 0))}
                        style={{ width: '80px', padding: '0.2rem 0.4rem', fontSize: '0.8rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}
                      />
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>R$ por colaborador</span>
                    </div>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                    Critério de elegibilidade: colaboradores sem nenhuma falta (injustificada/justificada), licença médica ou advertência no mês.
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    {/* Elegíveis */}
                    <div>
                      <h4 style={{ fontSize: '0.85rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                        ✅ Elegíveis ({presencaPremiada.eligible.length})
                      </h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '200px', overflowY: 'auto', paddingRight: '5px' }}>
                        {presencaPremiada.eligible.length === 0 ? (
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Nenhum colaborador elegível.</p>
                        ) : (
                          presencaPremiada.eligible.map(emp => (
                            <div key={emp.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem', borderRadius: '6px', backgroundColor: 'rgba(16,185,129,0.03)', border: '1px solid rgba(16,185,129,0.1)' }}>
                              <div>
                                <span style={{ fontWeight: '700', fontSize: '0.8rem', color: 'var(--text-primary)' }}>{emp.name}</span>
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>{emp.role}</span>
                              </div>
                              <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#10b981' }}>+R$ {awardValue.toFixed(2)}</span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Não-Elegíveis */}
                    <div>
                      <h4 style={{ fontSize: '0.85rem', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                        ❌ Não-Elegíveis ({presencaPremiada.disqualified.length})
                      </h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '200px', overflowY: 'auto', paddingRight: '5px' }}>
                        {presencaPremiada.disqualified.length === 0 ? (
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Nenhum colaborador desqualificado.</p>
                        ) : (
                          presencaPremiada.disqualified.map(item => (
                            <div key={item.employee.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem', borderRadius: '6px', backgroundColor: 'rgba(239,68,68,0.03)', border: '1px solid rgba(239,68,68,0.1)' }}>
                              <div style={{ flex: 1 }}>
                                <span style={{ fontWeight: '700', fontSize: '0.8rem', color: 'var(--text-primary)' }}>{item.employee.name}</span>
                                <span style={{ fontSize: '0.7rem', color: '#ef4444', display: 'block', wordBreak: 'break-all' }}>{item.reason}</span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: '1.25rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Custo Mensal Adicional Projetado:</span>
                    <strong style={{ fontSize: '1.1rem', color: '#10b981', fontWeight: '800' }}>
                      R$ {(presencaPremiada.eligible.length * awardValue).toFixed(2)}
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: Vale-Transporte */}
          {activeTab === 'transport' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-color)' }}>Benefício de Vale-Transporte (VT)</h2>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Configuração de itinerários, controle de recargas e simulação de descontos em folha de pagamento.</p>
                </div>
                <button onClick={handleOpenVoucherAdd} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', backgroundColor: '#ec4899' }}>
                  <Plus size={16} /> Nova Concessão
                </button>
              </div>

              {/* VT Summary Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div style={{ ...styles.kpiCard, borderLeftColor: '#ec4899', display: 'flex', flexDirection: 'column' }}>
                  <span style={styles.kpiLabel}>Total de Beneficiários</span>
                  <span style={styles.kpiVal}>{transportVouchers.length}</span>
                </div>
                <div style={{ ...styles.kpiCard, borderLeftColor: '#10b981', display: 'flex', flexDirection: 'column' }}>
                  <span style={styles.kpiLabel}>Custo Bruto Mensal VT</span>
                  <span style={styles.kpiVal}>
                    R$ {transportVouchers.reduce((acc, curr) => acc + ((parseFloat(curr.dailyCost) || 0) * (parseInt(curr.daysCount) || 0)), 0).toFixed(2)}
                  </span>
                </div>
                <div style={{ ...styles.kpiCard, borderLeftColor: '#3b82f6', display: 'flex', flexDirection: 'column' }}>
                  <span style={styles.kpiLabel}>Desconto Consolidado em Folha</span>
                  <span style={styles.kpiVal}>
                    R$ {transportVouchers.reduce((acc, curr) => {
                      const emp = employees.find(e => e.id === curr.employeeId);
                      const sal = emp ? parseFloat(emp.salary) || 0 : 0;
                      const maxDiscount = sal * 0.06;
                      const totalCost = (parseFloat(curr.dailyCost) || 0) * (parseInt(curr.daysCount) || 0);
                      const actualDiscount = Math.min(maxDiscount, totalCost);
                      return acc + actualDiscount;
                    }, 0).toFixed(2)}
                  </span>
                </div>
              </div>

              <div style={{
                backgroundColor: 'var(--bg-card)',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                overflowX: 'auto'
              }}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th>Funcionário</th>
                      <th>Cargo / Setor</th>
                      <th>Itinerário / Rota</th>
                      <th>Tarifa Diária</th>
                      <th>Dias Recarga</th>
                      <th>Valor Carga</th>
                      <th>Desconto Salarial (6%)</th>
                      <th>Cartão</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transportVouchers.length === 0 ? (
                      <tr><td colSpan="9" style={styles.noDataCell}>Nenhuma concessão de vale-transporte configurada.</td></tr>
                    ) : (
                      transportVouchers.map((v) => {
                        const emp = employees.find(e => e.id === v.employeeId);
                        const empName = emp ? emp.name : 'Desconhecido';
                        const empRole = emp ? emp.role : '-';
                        const empSector = emp ? (sectors.find(s => s.id === emp.sectorId)?.name || emp.sectorId) : '-';
                        const sal = emp ? parseFloat(emp.salary) || 0 : 0;
                        const maxDiscount = sal * 0.06;
                        const totalCost = (parseFloat(v.dailyCost) || 0) * (parseInt(v.daysCount) || 0);
                        const actualDiscount = Math.min(maxDiscount, totalCost);

                        return (
                          <tr key={v.id}>
                            <td style={{ fontWeight: '600' }}>{empName}</td>
                            <td>{empRole} ({empSector})</td>
                            <td>
                              <div style={{ fontWeight: '500' }}>{v.route}</div>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{v.cardType} - {v.cardNumber || 'Sem cartão'}</span>
                            </td>
                            <td>R$ {parseFloat(v.dailyCost || 0).toFixed(2)}</td>
                            <td style={{ fontWeight: '700' }}>{v.daysCount} dias</td>
                            <td style={{ color: '#10b981', fontWeight: '700' }}>R$ {totalCost.toFixed(2)}</td>
                            <td style={{ color: '#ef4444', fontWeight: '600' }}>
                              R$ {actualDiscount.toFixed(2)}
                              <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'normal', color: 'var(--text-muted)' }}>
                                ({maxDiscount > totalCost ? 'Desconto integral' : 'Limite 6% atingido'})
                              </span>
                            </td>
                            <td>
                              <span style={{ 
                                padding: '0.2rem 0.5rem', 
                                borderRadius: '12px', 
                                fontSize: '0.75rem', 
                                fontWeight: '700',
                                backgroundColor: '#f1f5f9',
                                color: '#475569'
                              }}>
                                {v.cardType}
                              </span>
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button onClick={() => handleOpenVoucherEdit(v)} style={styles.actionEditBtn}>
                                  Editar
                                </button>
                                <button onClick={() => handleDeleteVoucher(v.id)} style={{ ...styles.actionEditBtn, color: 'var(--danger-color)' }}>
                                  Excluir
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: Employees Directory */}
          {activeTab === 'employees' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={styles.filtersBar}>
                <div style={styles.searchWrapper}>
                  <Search size={18} style={styles.searchIcon} />
                  <input 
                    type="text" 
                    placeholder="Pesquisar funcionário por nome ou CPF..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    style={styles.searchInput}
                  />
                </div>
                <div style={styles.selectsWrapper}>
                  <select value={filterSector} onChange={e => setFilterSector(e.target.value)} style={styles.filterSelect}>
                    <option value="">Todos os Setores</option>
                    {sectors.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <button onClick={handleOpenEmpAdd} style={styles.addBtn}>
                  <Plus size={16} /> Novo Funcionário
                </button>
              </div>

              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th>Funcionário</th>
                      <th>CPF</th>
                      <th>Setor / Cargo</th>
                      <th>Tipo Contrato</th>
                      <th>Admissão</th>
                      <th>Pendências</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEmployees.length === 0 ? (
                      <tr>
                        <td colSpan="7" style={styles.noDataCell}>Nenhum funcionário cadastrado ou encontrado.</td>
                      </tr>
                    ) : (
                      filteredEmployees.map(emp => {
                        const warnCount = emp.warnings?.length || 0;
                        const docCount = emp.documents?.length || 0;
                        return (
                          <tr key={emp.id}>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0' }}>
                                {emp.photo ? (
                                  <img src={emp.photo} alt={emp.name} style={styles.tablePhoto} />
                                ) : (
                                  <div style={styles.tablePhotoPlaceholder}>{emp.name.charAt(0)}</div>
                                )}
                                <div>
                                  <div style={{ fontWeight: '600' }}>{emp.name}</div>
                                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{emp.email}</div>
                                </div>
                              </div>
                            </td>
                            <td>{emp.cpf}</td>
                            <td>
                              <div style={{ fontWeight: '600' }}>{emp.role}</div>
                              <span style={styles.categoryBadge}>{sectors.find(s => s.id === emp.sectorId)?.name || emp.sectorId}</span>
                            </td>
                            <td>{emp.contractType}</td>
                            <td>{emp.admissionDate ? new Date(emp.admissionDate).toLocaleDateString('pt-BR') : '-'}</td>
                            <td>
                              {warnCount > 0 && <span style={{ ...styles.badgeCritical, marginRight: '0.25rem' }}>{warnCount} Adv.</span>}
                              {docCount > 0 && <span style={styles.badgeNormal}>{docCount} Docs</span>}
                              {warnCount === 0 && docCount === 0 && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Nenhuma</span>}
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: '0.25rem' }}>
                                <button onClick={() => handleOpenEmpEdit(emp)} style={styles.actionEditBtn}>Ficha</button>
                                <button onClick={() => handleDeleteEmployee(emp)} style={{ ...styles.actionEditBtn, color: 'var(--danger-color)', borderColor: 'rgba(239,68,68,0.2)' }}>Excluir</button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: Reports & Import */}
          {activeTab === 'reports' && (
            <div style={styles.reportsGrid}>
              <div style={styles.kpiSection}>
                <h3>⬇️ Exportar Relatórios do RH</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Baixe as listagens operacionais em formato compatível com o Excel (CSV).</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <button onClick={handleExportFullCadaster} style={styles.downloadReportBtn}>
                    <Download size={16} /> Cadastro Geral de Funcionários
                  </button>
                  <button onClick={handleExportBirthdays} style={styles.downloadReportBtn}>
                    <Download size={16} /> Aniversariantes do Mês
                  </button>
                  <button onClick={handleExportWarnings} style={styles.downloadReportBtn}>
                    <Download size={16} /> Histórico de Advertências Disciplinares
                  </button>
                </div>
              </div>

              <div style={styles.kpiSection}>
                <h3>⬆️ Importador em Lote (CSV)</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Importe fichas de funcionários em lote. Faça o download do modelo abaixo antes do envio.</p>
                
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                  <button onClick={handleDownloadTemplate} style={{ ...styles.txBtn, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Download size={16} /> Baixar Modelo CSV
                  </button>
                  
                  <input type="file" accept=".csv" onChange={handleCsvUpload} id="csv-upload-input" style={{ display: 'none' }} />
                  <label htmlFor="csv-upload-input" className="btn btn-primary" style={{ backgroundColor: '#ec4899', cursor: 'pointer', margin: 0 }}>
                    <UploadCloud size={16} /> Enviar CSV
                  </label>
                </div>

                {showImportPreview && (
                  <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-sm)', padding: '1rem', backgroundColor: '#fafafa' }}>
                    <h4>Preview de Importação ({csvData.length} linhas detectadas)</h4>
                    {csvErrors.length > 0 ? (
                      <div style={styles.warningBanner}>
                        <AlertTriangle size={18} />
                        <span>Erros de validação encontrados:</span>
                        <ul style={{ fontSize: '0.8rem', paddingLeft: '1.25rem' }}>
                          {csvErrors.map((err, idx) => <li key={idx}>Linha {err.line} ({err.item}): {err.message}</li>)}
                        </ul>
                      </div>
                    ) : (
                      <div style={{ ...styles.alert, backgroundColor: 'var(--success-light)', color: 'var(--success-color)', border: '1px solid var(--success-color)' }}>
                        <CheckCircle2 size={18} />
                        <span>Tudo pronto! Nenhuma falha detectada. Pronto para importar.</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
                      <button onClick={() => setShowImportPreview(false)} className="btn btn-secondary">Cancelar</button>
                      <button onClick={handleConfirmCsvImport} disabled={csvErrors.length > 0} className="btn btn-primary" style={{ backgroundColor: 'var(--success-color)' }}>
                        Confirmar Carga
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: Audit Logs */}
          {activeTab === 'audit' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontWeight: '700' }}>Log de Auditoria de Governança</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Registra automaticamente alterações cruciais (LGPD / Segurança)</span>
              </div>

              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th>Data/Hora</th>
                      <th>Operador</th>
                      <th>Ação Executada</th>
                      <th>Histórico / Alterações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs
                      .sort((a, b) => new Date(b.date) - new Date(a.date))
                      .map(log => (
                        <tr key={log.id}>
                          <td>{new Date(log.date).toLocaleString('pt-BR')}</td>
                          <td style={{ fontWeight: '600' }}>
                            {log.operator === 'rh@clinica.com' ? 'Ana Carolina Cerqueira Gonzaga' : log.operator}
                          </td>
                          <td><span style={styles.categoryBadge}>{log.action}</span></td>
                          <td style={{ fontSize: '0.8rem', fontFamily: 'monospace', maxWidth: '350px', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                            {log.details}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Employee Modal (Ficha Completa) */}
      {showEmpModal && (
        <div style={styles.modalOverlay}>
          <div style={{ ...styles.modalCard, maxWidth: '850px', width: '95%' }}>
            <div style={styles.modalHeader}>
              <h2>{editingEmp ? `Ficha: ${empForm.name}` : 'Cadastrar Funcionário'}</h2>
              <button onClick={() => setShowEmpModal(false)} style={styles.modalCloseBtn}><X size={20} /></button>
            </div>
            
            {/* Modal Internal Tabs */}
            <div style={styles.wizardStepsBar}>
              <div onClick={() => setEmpActiveTab('pessoais')} style={{ ...styles.wizardStep, ...(empActiveTab === 'pessoais' ? styles.wizardStepActive : {}) }}>1. Pessoais</div>
              <div onClick={() => setEmpActiveTab('contato')} style={{ ...styles.wizardStep, ...(empActiveTab === 'contato' ? styles.wizardStepActive : {}) }}>2. Contato</div>
              <div onClick={() => setEmpActiveTab('profissionais')} style={{ ...styles.wizardStep, ...(empActiveTab === 'profissionais' ? styles.wizardStepActive : {}) }}>3. Contratos</div>
              <div onClick={() => setEmpActiveTab('bancarios')} style={{ ...styles.wizardStep, ...(empActiveTab === 'bancarios' ? styles.wizardStepActive : {}) }}>4. Bancários</div>
              <div onClick={() => setEmpActiveTab('dependentes')} style={{ ...styles.wizardStep, ...(empActiveTab === 'dependentes' ? styles.wizardStepActive : {}) }}>5. Dependentes ({empForm.dependents.length})</div>
              <div onClick={() => setEmpActiveTab('warnings')} style={{ ...styles.wizardStep, ...(empActiveTab === 'warnings' ? styles.wizardStepActive : {}) }}>6. Adv. ({empForm.warnings.length})</div>
              <div onClick={() => setEmpActiveTab('vaccines')} style={{ ...styles.wizardStep, ...(empActiveTab === 'vaccines' ? styles.wizardStepActive : {}) }}>7. Vacinas ({empForm.vaccinations.length})</div>
              <div onClick={() => setEmpActiveTab('documents')} style={{ ...styles.wizardStep, ...(empActiveTab === 'documents' ? styles.wizardStepActive : {}) }}>8. Arquivos ({empForm.documents.length})</div>
              <div onClick={() => setEmpActiveTab('absences')} style={{ ...styles.wizardStep, ...(empActiveTab === 'absences' ? styles.wizardStepActive : {}) }}>9. Ausências ({empForm.absences ? empForm.absences.length : 0})</div>
            </div>

            <form onSubmit={handleSaveEmployee} style={styles.modalForm}>
              <div style={{ maxHeight: '55vh', overflowY: 'auto', padding: '0.25rem' }}>
                
                {/* SUBTAB 1: Pessoais */}
                {empActiveTab === 'pessoais' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {/* Photo Upload area */}
                    <div style={styles.photoUploadContainer}>
                      <div style={styles.photoPreviewWrapper}>
                        {empForm.photo ? (
                          <img src={empForm.photo} alt="Foto" style={styles.photoPreview} />
                        ) : (
                          <div style={styles.photoPlaceholder}><Users size={32} color="var(--text-muted)" /></div>
                        )}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>Foto de Crachá</span>
                        <input type="file" accept="image/*" onChange={handlePhotoUpload} id="emp-photo-upload" style={{ display: 'none' }} />
                        <label htmlFor="emp-photo-upload" className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem', cursor: 'pointer', display: 'inline-block' }}>Carregar Imagem</label>
                        {empForm.photo && <button type="button" onClick={() => setEmpForm(f => ({ ...f, photo: '' }))} className="btn btn-danger" style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem' }}>Remover</button>}
                      </div>
                    </div>

                    <div style={styles.formGrid}>
                      <div className="form-group">
                        <label>Nome Completo *</label>
                        <input type="text" className="form-control" required value={empForm.name} onChange={e => setEmpForm({ ...empForm, name: e.target.value })} />
                      </div>
                      <div className="form-group">
                        <label>CPF *</label>
                        <input type="text" className="form-control" required value={empForm.cpf} onChange={e => setEmpForm({ ...empForm, cpf: formatCpf(e.target.value) })} />
                      </div>
                      <div className="form-group">
                        <label>Data de Nascimento *</label>
                        <input type="date" className="form-control" required value={empForm.birthDate} onChange={e => setEmpForm({ ...empForm, birthDate: e.target.value })} />
                      </div>
                      <div className="form-group">
                        <label>Gênero</label>
                        <select className="form-control" value={empForm.gender} onChange={e => setEmpForm({ ...empForm, gender: e.target.value })}>
                          <option value="Feminino">Feminino</option>
                          <option value="Masculino">Masculino</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>RG</label>
                        <input type="text" className="form-control" value={empForm.rg} onChange={e => setEmpForm({ ...empForm, rg: e.target.value })} />
                      </div>
                      <div className="form-group">
                        <label>Nome da Mãe</label>
                        <input type="text" className="form-control" value={empForm.motherName} onChange={e => setEmpForm({ ...empForm, motherName: e.target.value })} />
                      </div>
                    </div>
                  </div>
                )}

                {/* SUBTAB 2: Contato */}
                {empActiveTab === 'contato' && (
                  <div style={styles.formGrid}>
                    <div className="form-group">
                      <label>Telefone Contato</label>
                      <input type="text" className="form-control" placeholder="(00) 00000-0000" value={empForm.phone} onChange={e => setEmpForm({ ...empForm, phone: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label>E-mail Pessoal</label>
                      <input type="email" className="form-control" placeholder="nome@provedor.com" value={empForm.email} onChange={e => setEmpForm({ ...empForm, email: e.target.value })} />
                    </div>
                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                      <label>Endereço Completo</label>
                      <input type="text" className="form-control" placeholder="Rua, número, bairro..." value={empForm.address} onChange={e => setEmpForm({ ...empForm, address: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label>Cidade</label>
                      <input type="text" className="form-control" value={empForm.city} onChange={e => setEmpForm({ ...empForm, city: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label>CEP</label>
                      <input type="text" className="form-control" placeholder="00000-000" value={empForm.cep} onChange={e => setEmpForm({ ...empForm, cep: e.target.value })} />
                    </div>
                  </div>
                )}

                {/* SUBTAB 3: Profissionais */}
                {empActiveTab === 'profissionais' && (
                  <div style={styles.formGrid}>
                    <div className="form-group">
                      <label>Cargo / Função *</label>
                      <input type="text" className="form-control" required placeholder="Ex: Enfermeira" value={empForm.role} onChange={e => setEmpForm({ ...empForm, role: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label>Setor de Trabalho *</label>
                      <select className="form-control" value={empForm.sectorId} onChange={e => setEmpForm({ ...empForm, sectorId: e.target.value })}>
                        {sectors.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Data de Admissão *</label>
                      <input type="date" className="form-control" required value={empForm.admissionDate} onChange={e => setEmpForm({ ...empForm, admissionDate: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label>Tipo de Contrato</label>
                      <select className="form-control" value={empForm.contractType} onChange={e => setEmpForm({ ...empForm, contractType: e.target.value })}>
                        <option value="CLT">CLT</option>
                        <option value="PJ">PJ</option>
                        <option value="Experiência">Experiência (90 dias)</option>
                        <option value="Temporário">Temporário</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Salário Base (R$)</label>
                      <input type="number" className="form-control" value={empForm.salary} onChange={e => setEmpForm({ ...empForm, salary: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label>Número CNH</label>
                      <input type="text" className="form-control" value={empForm.cnhNumber} onChange={e => setEmpForm({ ...empForm, cnhNumber: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label>Vencimento CNH</label>
                      <input type="date" className="form-control" value={empForm.cnhExpiry} onChange={e => setEmpForm({ ...empForm, cnhExpiry: e.target.value })} />
                    </div>
                  </div>
                )}

                {/* SUBTAB 4: Bancários */}
                {empActiveTab === 'bancarios' && (
                  <div style={styles.formGrid}>
                    <div className="form-group">
                      <label>Banco</label>
                      <input type="text" className="form-control" placeholder="Ex: Itaú" value={empForm.bankName} onChange={e => setEmpForm({ ...empForm, bankName: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label>Agência</label>
                      <input type="text" className="form-control" placeholder="1234" value={empForm.bankAgency} onChange={e => setEmpForm({ ...empForm, bankAgency: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label>Conta Corrente / Salário</label>
                      <input type="text" className="form-control" placeholder="12345-6" value={empForm.bankAccount} onChange={e => setEmpForm({ ...empForm, bankAccount: e.target.value })} />
                    </div>
                  </div>
                )}

                {/* SUBTAB 5: Dependentes */}
                {empActiveTab === 'dependentes' && (
                  <div>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1.5fr auto', gap: '0.5rem', marginBottom: '1.5rem', alignItems: 'center' }}>
                      <div className="form-group">
                        <label>Nome do Dependente</label>
                        <input type="text" className="form-control" value={newDep.name} onChange={e => setNewDep({ ...newDep, name: e.target.value })} />
                      </div>
                      <div className="form-group">
                        <label>Parentesco</label>
                        <select className="form-control" value={newDep.relationship} onChange={e => setNewDep({ ...newDep, relationship: e.target.value })}>
                          <option value="Filho(a)">Filho(a)</option>
                          <option value="Cônjuge">Cônjuge</option>
                          <option value="Pai/Mãe">Pai/Mãe</option>
                          <option value="Outros">Outros</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Data Nascimento</label>
                        <input type="date" className="form-control" value={newDep.birthDate} onChange={e => setNewDep({ ...newDep, birthDate: e.target.value })} />
                      </div>
                      <button type="button" onClick={handleAddDependent} className="btn btn-primary" style={{ height: '38px', marginTop: '20px', backgroundColor: '#ec4899' }}>Adicionar</button>
                    </div>

                    <table style={styles.table}>
                      <thead>
                        <tr>
                          <th>Nome</th>
                          <th>Grau Parentesco</th>
                          <th>Nascimento</th>
                          <th>Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {empForm.dependents.length === 0 ? (
                          <tr><td colSpan="4" style={styles.noDataCell}>Nenhum dependente cadastrado.</td></tr>
                        ) : (
                          empForm.dependents.map((dep, idx) => (
                            <tr key={idx}>
                              <td style={{ fontWeight: '600' }}>{dep.name}</td>
                              <td>{dep.relationship}</td>
                              <td>{new Date(dep.birthDate).toLocaleDateString('pt-BR')}</td>
                              <td>
                                <button type="button" onClick={() => setEmpForm(f => ({ ...f, dependents: f.dependents.filter((_, i) => i !== idx) }))} style={{ ...styles.actionEditBtn, color: 'var(--danger-color)' }}>
                                  Remover
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* SUBTAB 9: Ausências / Faltas */}
                {empActiveTab === 'absences' && (
                  <div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1.5fr 1fr 2fr auto', gap: '0.5rem', marginBottom: '1.5rem', alignItems: 'center' }}>
                      <div className="form-group">
                        <label>Data *</label>
                        <input type="date" className="form-control" value={newAbsence.date} onChange={e => setNewAbsence({ ...newAbsence, date: e.target.value })} />
                      </div>
                      <div className="form-group">
                        <label>Tipo de Ausência</label>
                        <select className="form-control" value={newAbsence.type} onChange={e => setNewAbsence({ ...newAbsence, type: e.target.value })}>
                          <option value="Falta Injustificada">Falta Injustificada</option>
                          <option value="Falta Justificada">Falta Justificada</option>
                          <option value="Atraso">Atraso</option>
                          <option value="Licença Médica">Licença Médica</option>
                          <option value="Folga">Folga</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Horas Perdidas</label>
                        <input type="number" className="form-control" placeholder="8" value={newAbsence.hours} onChange={e => setNewAbsence({ ...newAbsence, hours: e.target.value })} />
                      </div>
                      <div className="form-group">
                        <label>Motivo / Observação</label>
                        <input type="text" className="form-control" placeholder="Atestado, problemas pessoais..." value={newAbsence.motive} onChange={e => setNewAbsence({ ...newAbsence, motive: e.target.value })} />
                      </div>
                      <button type="button" onClick={handleAddAbsence} className="btn btn-primary" style={{ height: '38px', marginTop: '20px', backgroundColor: '#ec4899' }}>Registrar</button>
                    </div>

                    <table style={styles.table}>
                      <thead>
                        <tr>
                          <th>Data</th>
                          <th>Tipo</th>
                          <th>Horas</th>
                          <th>Motivo</th>
                          <th>Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {!empForm.absences || empForm.absences.length === 0 ? (
                          <tr><td colSpan="5" style={styles.noDataCell}>Nenhuma ausência registrada.</td></tr>
                        ) : (
                          empForm.absences.map((abs, idx) => (
                            <tr key={idx}>
                              <td>{new Date(abs.date).toLocaleDateString('pt-BR')}</td>
                              <td>
                                <span style={{
                                  padding: '0.2rem 0.5rem',
                                  borderRadius: '12px',
                                  fontSize: '0.75rem',
                                  fontWeight: '700',
                                  textTransform: 'uppercase',
                                  backgroundColor: abs.type === 'Falta Injustificada' ? '#fee2e2' : '#f1f5f9',
                                  color: abs.type === 'Falta Injustificada' ? '#991b1b' : '#475569'
                                }}>
                                  {abs.type}
                                </span>
                              </td>
                              <td style={{ fontWeight: '600' }}>{abs.hours}h</td>
                              <td>{abs.motive || '-'}</td>
                              <td>
                                <button type="button" onClick={() => setEmpForm(f => ({ ...f, absences: f.absences.filter((_, i) => i !== idx) }))} style={{ ...styles.actionEditBtn, color: 'var(--danger-color)' }}>
                                  Remover
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* SUBTAB 6: Advertências */}
                {empActiveTab === 'warnings' && (
                  <div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1.25fr 1.5fr 2fr 1fr auto', gap: '0.5rem', marginBottom: '1.5rem', alignItems: 'center' }}>
                      <div className="form-group">
                        <label>Data</label>
                        <input type="date" className="form-control" value={newWarning.date} onChange={e => setNewWarning({ ...newWarning, date: e.target.value })} />
                      </div>
                      <div className="form-group">
                        <label>Motivo</label>
                        <select className="form-control" value={newWarning.motive} onChange={e => setNewWarning({ ...newWarning, motive: e.target.value })}>
                          <option value="Atraso Injustificado">Atraso Injustificado</option>
                          <option value="Falta Injustificada">Falta Injustificada</option>
                          <option value="Insubordinação">Insubordinação</option>
                          <option value="Uso Inadequado de EPI">Uso Inadequado de EPI</option>
                          <option value="Outros">Outros</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Teor/Descrição</label>
                        <input type="text" className="form-control" value={newWarning.text} onChange={e => setNewWarning({ ...newWarning, text: e.target.value })} />
                      </div>
                      <div className="form-group">
                        <label>Anexar Assinado</label>
                        <input type="file" onChange={e => handleDocBase64Upload(e, 'warning')} style={{ fontSize: '0.75rem' }} />
                      </div>
                      <button type="button" onClick={handleAddWarning} className="btn btn-primary" style={{ height: '38px', marginTop: '20px', backgroundColor: '#ec4899' }}>Registrar</button>
                    </div>

                    <table style={styles.table}>
                      <thead>
                        <tr>
                          <th>Data</th>
                          <th>Motivo</th>
                          <th>Descrição</th>
                          <th>Arquivo</th>
                          <th>Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {empForm.warnings.length === 0 ? (
                          <tr><td colSpan="5" style={styles.noDataCell}>Nenhuma advertência registrada.</td></tr>
                        ) : (
                          empForm.warnings.map((w, idx) => (
                            <tr key={idx}>
                              <td>{new Date(w.date).toLocaleDateString('pt-BR')}</td>
                              <td style={{ fontWeight: '600' }}>{w.motive}</td>
                              <td>{w.text}</td>
                              <td>
                                {w.docUrl ? (
                                  <a href={w.docUrl} download={`advertencia-${empForm.name}-${w.date}.png`} style={{ color: '#ec4899', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                    <Download size={14} /> Baixar Anexo
                                  </a>
                                ) : (
                                  <span style={{ color: 'var(--text-muted)' }}>Sem anexo</span>
                                )}
                              </td>
                              <td>
                                <button type="button" onClick={() => setEmpForm(f => ({ ...f, warnings: f.warnings.filter((_, i) => i !== idx) }))} style={{ ...styles.actionEditBtn, color: 'var(--danger-color)' }}>
                                  Excluir
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* SUBTAB 7: Vacinas */}
                {empActiveTab === 'vaccines' && (
                  <div>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr auto', gap: '0.5rem', marginBottom: '1.5rem', alignItems: 'center' }}>
                      <div className="form-group">
                        <label>Vacina</label>
                        <select className="form-control" value={newVaccine.name} onChange={e => setNewVaccine({ ...newVaccine, name: e.target.value })}>
                          <option value="Hepatite B">Hepatite B</option>
                          <option value="Dupla Adulto (dT - Tétano/Difteria)">Dupla Adulto (dT - Tétano/Difteria)</option>
                          <option value="Tríplice Viral (Sarampo/Caxumba/Rubéola)">Tríplice Viral (Sarampo/Caxumba/Rubéola)</option>
                          <option value="Influenza (Gripe)">Influenza (Gripe)</option>
                          <option value="COVID-19 Bivalente">COVID-19 Bivalente</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Dose</label>
                        <input type="text" className="form-control" placeholder="1ª Dose, Reforço" value={newVaccine.dose} onChange={e => setNewVaccine({ ...newVaccine, dose: e.target.value })} />
                      </div>
                      <div className="form-group">
                        <label>Aplicação</label>
                        <input type="date" className="form-control" value={newVaccine.date} onChange={e => setNewVaccine({ ...newVaccine, date: e.target.value })} />
                      </div>
                      <div className="form-group">
                        <label>Próxima Dose</label>
                        <input type="date" className="form-control" value={newVaccine.expiryDate} onChange={e => setNewVaccine({ ...newVaccine, expiryDate: e.target.value })} />
                      </div>
                      <div className="form-group">
                        <label>Lote</label>
                        <input type="text" className="form-control" placeholder="Lote" value={newVaccine.lot} onChange={e => setNewVaccine({ ...newVaccine, lot: e.target.value })} />
                      </div>
                      <button type="button" onClick={handleAddVaccine} className="btn btn-primary" style={{ height: '38px', marginTop: '20px', backgroundColor: '#ec4899' }}>Registrar</button>
                    </div>

                    <table style={styles.table}>
                      <thead>
                        <tr>
                          <th>Vacina</th>
                          <th>Dose</th>
                          <th>Aplicação</th>
                          <th>Lote</th>
                          <th>Próxima Dose</th>
                          <th>Validade</th>
                          <th>Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {empForm.vaccinations.length === 0 ? (
                          <tr><td colSpan="7" style={styles.noDataCell}>Nenhuma vacina registrada.</td></tr>
                        ) : (
                          empForm.vaccinations.map((vac, idx) => {
                            const valInfo = getExpiryStatus(vac.expiryDate);
                            return (
                              <tr key={idx}>
                                <td style={{ fontWeight: '600' }}>{vac.name}</td>
                                <td>{vac.dose}</td>
                                <td>{new Date(vac.date).toLocaleDateString('pt-BR')}</td>
                                <td>{vac.lot || '-'}</td>
                                <td>{vac.expiryDate ? new Date(vac.expiryDate).toLocaleDateString('pt-BR') : '-'}</td>
                                <td>
                                  {vac.expiryDate ? (
                                    <span style={{ fontWeight: '700', color: valInfo.color }}>{valInfo.text}</span>
                                  ) : (
                                    <span style={{ color: 'var(--text-muted)' }}>Definitiva</span>
                                  )}
                                </td>
                                <td>
                                  <button type="button" onClick={() => setEmpForm(f => ({ ...f, vaccinations: f.vaccinations.filter((_, i) => i !== idx) }))} style={{ ...styles.actionEditBtn, color: 'var(--danger-color)' }}>
                                    Remover
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* SUBTAB 8: Central de Documentos / Arquivos */}
                {empActiveTab === 'documents' && (
                  <div>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1.5fr 1fr auto', gap: '0.5rem', marginBottom: '1.5rem', alignItems: 'center' }}>
                      <div className="form-group">
                        <label>Nome do Arquivo *</label>
                        <input type="text" className="form-control" placeholder="Ex: CPF Assinado, Diploma" value={newDoc.name} onChange={e => setNewDoc({ ...newDoc, name: e.target.value })} />
                      </div>
                      <div className="form-group">
                        <label>Categoria</label>
                        <select className="form-control" value={newDoc.category} onChange={e => setNewDoc({ ...newDoc, category: e.target.value })}>
                          <option value="Identidade (RG)">Identidade (RG)</option>
                          <option value="CPF">CPF</option>
                          <option value="Diploma">Diploma</option>
                          <option value="ASO (Admissional)">ASO (Admissional)</option>
                          <option value="ASO (Periódico)">ASO (Periódico)</option>
                          <option value="Carteira Profissional">Carteira Profissional</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Vencimento (se houver)</label>
                        <input type="date" className="form-control" value={newDoc.expiryDate} onChange={e => setNewDoc({ ...newDoc, expiryDate: e.target.value })} />
                      </div>
                      <div className="form-group">
                        <label>Arquivo</label>
                        <input type="file" onChange={e => handleDocBase64Upload(e, 'doc')} style={{ fontSize: '0.75rem' }} />
                      </div>
                      <button type="button" onClick={handleAddDocument} className="btn btn-primary" style={{ height: '38px', marginTop: '20px', backgroundColor: '#ec4899' }}>Registrar</button>
                    </div>

                    <table style={styles.table}>
                      <thead>
                        <tr>
                          <th>Documento</th>
                          <th>Categoria</th>
                          <th>Validade</th>
                          <th>Download / Arquivo</th>
                          <th>Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {empForm.documents.length === 0 ? (
                          <tr><td colSpan="5" style={styles.noDataCell}>Nenhum documento arquivado.</td></tr>
                        ) : (
                          empForm.documents.map((docItem, idx) => {
                            const valInfo = getExpiryStatus(docItem.expiryDate);
                            return (
                              <tr key={idx}>
                                <td style={{ fontWeight: '600' }}>{docItem.name}</td>
                                <td>{docItem.category}</td>
                                <td>
                                  {docItem.expiryDate ? (
                                    <span style={{ fontWeight: '700', color: valInfo.color }}>
                                      {new Date(docItem.expiryDate).toLocaleDateString('pt-BR')} ({valInfo.text})
                                    </span>
                                  ) : (
                                    <span style={{ color: 'var(--text-muted)' }}>Vitalício</span>
                                  )}
                                </td>
                                <td>
                                  {docItem.fileUrl ? (
                                    <a href={docItem.fileUrl} download={`${empForm.name}-${docItem.name}.png`} style={{ color: '#ec4899', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                      <Download size={14} /> Baixar
                                    </a>
                                  ) : (
                                    <span style={{ color: 'var(--text-muted)' }}>Sem arquivo</span>
                                  )}
                                </td>
                                <td>
                                  <button type="button" onClick={() => setEmpForm(f => ({ ...f, documents: f.documents.filter((_, i) => i !== idx) }))} style={{ ...styles.actionEditBtn, color: 'var(--danger-color)' }}>
                                    Excluir
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                )}

              </div>
              <div style={styles.modalFooter}>
                <button type="button" onClick={() => setShowEmpModal(false)} className="btn btn-secondary">Cancelar</button>
                <button type="submit" disabled={actionLoading} className="btn btn-primary" style={{ backgroundColor: '#ec4899' }}>
                  {actionLoading ? 'Salvando...' : 'Salvar Dados do Funcionário'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Vale-Transporte Modal */}
      {showVoucherModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <div style={styles.modalHeader}>
              <h2>{editingVoucher ? 'Editar Concessão de VT' : 'Nova Concessão de Vale-Transporte'}</h2>
              <button onClick={() => setShowVoucherModal(false)} style={styles.modalCloseBtn}><X size={20} /></button>
            </div>
            <form onSubmit={handleSaveVoucher} style={styles.modalForm}>
              <div className="form-group">
                <label>Funcionário *</label>
                <select className="form-control" required value={voucherForm.employeeId} onChange={e => setVoucherForm({ ...voucherForm, employeeId: e.target.value })}>
                  {employees.filter(emp => emp.status !== 'Inativo').map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name} ({emp.role})</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Itinerário / Rota de Ônibus *</label>
                <input type="text" className="form-control" required placeholder="Ex: 302B - Industrial/Centro" value={voucherForm.route} onChange={e => setVoucherForm({ ...voucherForm, route: e.target.value })} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <div className="form-group">
                  <label>Tarifa Diária (R$) *</label>
                  <input type="number" step="0.05" className="form-control" required value={voucherForm.dailyCost} onChange={e => setVoucherForm({ ...voucherForm, dailyCost: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Dias de Carga *</label>
                  <input type="number" className="form-control" required value={voucherForm.daysCount} onChange={e => setVoucherForm({ ...voucherForm, daysCount: e.target.value })} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <div className="form-group">
                  <label>Tipo do Cartão</label>
                  <select className="form-control" value={voucherForm.cardType} onChange={e => setVoucherForm({ ...voucherForm, cardType: e.target.value })}>
                    <option value="BHBus">BHBus</option>
                    <option value="Ótimo">Ótimo</option>
                    <option value="Transcon">Transcon</option>
                    <option value="Vale-Pedágio">Vale-Pedágio</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Número do Cartão</label>
                  <input type="text" className="form-control" placeholder="00012345" value={voucherForm.cardNumber} onChange={e => setVoucherForm({ ...voucherForm, cardNumber: e.target.value })} />
                </div>
              </div>

              <div className="form-group">
                <label>Desconto Salarial (%)</label>
                <input type="number" className="form-control" value={voucherForm.discountPercent} onChange={e => setVoucherForm({ ...voucherForm, discountPercent: e.target.value })} />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Desconto padrão de 6% sobre o salário base.</span>
              </div>

              <div style={{ padding: '0.75rem', borderRadius: '8px', backgroundColor: 'var(--bg-body)', border: '1px solid var(--border-color)', margin: '1rem 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span>Valor Total da Carga Mensal:</span>
                  <strong style={{ color: '#10b981' }}>
                    R$ {((parseFloat(voucherForm.dailyCost) || 0) * (parseInt(voucherForm.daysCount) || 0)).toFixed(2)}
                  </strong>
                </div>
              </div>

              <div style={styles.modalFooter}>
                <button type="button" onClick={() => setShowVoucherModal(false)} className="btn btn-secondary">Cancelar</button>
                <button type="submit" disabled={actionLoading} className="btn btn-primary" style={{ backgroundColor: '#ec4899' }}>
                  {actionLoading ? 'Salvando...' : 'Confirmar Concessão'}
                </button>
              </div>
            </form>
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
    gap: '1.5rem',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '1rem',
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
    marginBottom: '0.25rem',
  },
  subtitle: {
    fontSize: '0.875rem',
    color: 'var(--text-secondary)',
  },
  tabsWrapper: {
    display: 'flex',
    gap: '0.25rem',
    borderBottom: '2px solid var(--border-color)',
    paddingBottom: '2px',
    flexWrap: 'wrap',
  },
  tabBtn: {
    background: 'none',
    border: 'none',
    padding: '0.75rem 1.25rem',
    fontSize: '0.875rem',
    fontWeight: '600',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    borderBottom: '2px solid transparent',
    marginBottom: '-2px',
    transition: 'all 0.15s ease',
  },
  tabBtnActive: {
    color: '#ec4899',
    borderBottomColor: '#ec4899',
  },
  alert: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '1rem',
    borderRadius: 'var(--border-radius-sm)',
    fontSize: '0.9rem',
  },
  warningBanner: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    backgroundColor: 'var(--danger-light)',
    padding: '0.75rem 1rem',
    borderRadius: 'var(--border-radius-sm)',
    color: 'var(--danger-color)',
    fontSize: '0.875rem',
    borderLeft: '4px solid var(--danger-color)',
    fontWeight: '600',
  },
  filtersBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '1rem',
    flexWrap: 'wrap',
  },
  searchWrapper: {
    position: 'relative',
    flex: '1 1 300px',
    display: 'flex',
    alignItems: 'center',
  },
  searchIcon: {
    position: 'absolute',
    left: '0.75rem',
    color: 'var(--text-muted)',
  },
  searchInput: {
    width: '100%',
    padding: '0.625rem 0.625rem 0.625rem 2.5rem',
    borderRadius: 'var(--border-radius-sm)',
    border: '1px solid var(--border-color)',
    fontSize: '0.875rem',
  },
  selectsWrapper: {
    display: 'flex',
    gap: '0.5rem',
  },
  filterSelect: {
    padding: '0.625rem 1.75rem 0.625rem 0.75rem',
    borderRadius: 'var(--border-radius-sm)',
    border: '1px solid var(--border-color)',
    backgroundColor: '#fff',
    fontSize: '0.875rem',
    cursor: 'pointer',
  },
  txBtn: {
    padding: '0.625rem 1.25rem',
    fontSize: '0.875rem',
    fontWeight: '600',
    backgroundColor: '#fff',
    border: '1px solid #ec4899',
    color: '#ec4899',
    borderRadius: 'var(--border-radius-sm)',
    cursor: 'pointer',
    transition: 'background-color 0.15s ease',
  },
  addBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.625rem 1.25rem',
    fontSize: '0.875rem',
    fontWeight: '600',
    backgroundColor: '#ec4899',
    color: '#fff',
    border: 'none',
    borderRadius: 'var(--border-radius-sm)',
    cursor: 'pointer',
    transition: 'filter 0.15s ease',
  },
  loadingBox: {
    textAlign: 'center',
    padding: '3rem',
    color: 'var(--text-muted)',
    fontSize: '1rem',
  },
  tableWrapper: {
    backgroundColor: '#fff',
    borderRadius: 'var(--border-radius-md)',
    border: '1px solid var(--border-color)',
    overflowX: 'auto',
    boxShadow: 'var(--shadow-sm)',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
    fontSize: '0.875rem',
  },
  noDataCell: {
    textAlign: 'center',
    padding: '3rem',
    color: 'var(--text-muted)',
  },
  categoryBadge: {
    fontSize: '0.725rem',
    padding: '0.15rem 0.5rem',
    borderRadius: '4px',
    backgroundColor: '#f1f5f9',
    color: 'var(--text-secondary)',
    fontWeight: '600',
  },
  badgeCritical: {
    fontSize: '0.75rem',
    padding: '0.15rem 0.5rem',
    borderRadius: '4px',
    backgroundColor: 'var(--danger-light)',
    color: 'var(--danger-color)',
    fontWeight: '700',
  },
  badgeNormal: {
    fontSize: '0.75rem',
    padding: '0.15rem 0.5rem',
    borderRadius: '4px',
    backgroundColor: 'var(--success-light)',
    color: 'var(--success-color)',
    fontWeight: '700',
  },
  actionEditBtn: {
    background: 'none',
    border: '1px solid var(--border-color)',
    borderRadius: '4px',
    padding: '0.35rem 0.6rem',
    cursor: 'pointer',
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
    fontWeight: '600',
  },
  tablePhoto: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '1.5px solid var(--border-color)',
    flexShrink: 0,
  },
  tablePhotoPlaceholder: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    backgroundColor: 'rgba(236, 72, 153, 0.08)',
    color: '#ec4899',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '0.9rem',
    border: '1.5px solid rgba(236, 72, 153, 0.1)',
    flexShrink: 0,
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    padding: '1rem',
    backdropFilter: 'blur(4px)',
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 'var(--border-radius-lg)',
    width: '100%',
    maxWidth: '480px',
    boxShadow: 'var(--shadow-lg)',
    display: 'flex',
    flexDirection: 'column',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.25rem 1.5rem',
    borderBottom: '1px solid var(--border-color)',
  },
  modalCloseBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--text-secondary)',
  },
  modalForm: {
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  modalFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.5rem',
    borderTop: '1px solid var(--border-color)',
    paddingTop: '1.25rem',
    marginTop: '1rem',
  },
  wizardStepsBar: {
    display: 'flex',
    borderBottom: '1px solid var(--border-color)',
    backgroundColor: '#f8fafc',
    flexWrap: 'wrap',
  },
  wizardStep: {
    flex: '1 1 auto',
    textAlign: 'center',
    padding: '0.75rem 0.5rem',
    fontSize: '0.75rem',
    fontWeight: '600',
    color: 'var(--text-muted)',
    borderBottom: '2px solid transparent',
    cursor: 'pointer',
  },
  wizardStepActive: {
    color: '#ec4899',
    borderBottomColor: '#ec4899',
  },
  photoUploadContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    backgroundColor: '#f8fafc',
    padding: '1rem',
    borderRadius: 'var(--border-radius-md)',
    border: '1px solid var(--border-color)',
  },
  photoPreviewWrapper: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    overflow: 'hidden',
    border: '2px solid var(--border-color)',
    backgroundColor: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  photoPreview: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  photoPlaceholder: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
  },
  // Dashboard elements
  dashboardContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '1rem',
  },
  kpiCard: {
    backgroundColor: '#fff',
    border: '1px solid var(--border-color)',
    borderLeft: '4px solid #ec4899',
    borderRadius: 'var(--border-radius-sm)',
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: 'var(--shadow-sm)',
  },
  kpiLabel: {
    fontSize: '0.8rem',
    color: 'var(--text-secondary)',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  kpiVal: {
    fontSize: '1.75rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
    marginTop: '0.25rem',
  },
  dashboardSplitGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1.5rem',
  },
  kpiSection: {
    backgroundColor: '#fff',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--border-radius-md)',
    padding: '1.25rem',
    boxShadow: 'var(--shadow-sm)',
  },
  listWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    marginTop: '1rem',
  },
  listItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #f1f5f9',
    paddingBottom: '0.5rem',
    fontSize: '0.85rem',
  },
  listSubText: {
    display: 'block',
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    marginTop: '0.15rem',
  },
  listBadge: {
    fontSize: '0.75rem',
    padding: '0.15rem 0.5rem',
    borderRadius: '4px',
    backgroundColor: '#f1f5f9',
    color: 'var(--text-secondary)',
    fontWeight: '600',
  },
  noDataMini: {
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: '1rem 0',
  },
  // Reports
  reportsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '1.5rem',
  },
  downloadReportBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem 1rem',
    borderRadius: 'var(--border-radius-sm)',
    border: '1px solid var(--border-color)',
    backgroundColor: '#fff',
    fontWeight: '600',
    color: 'var(--text-primary)',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    textAlign: 'left',
  },
  expiryLabel: {
    fontSize: '0.8rem',
  }
};

// Expiry checker
const getExpiryStatus = (expiryDate) => {
  if (!expiryDate) return { text: 'N/A', color: 'var(--text-muted)' };
  const expiry = new Date(expiryDate);
  const today = new Date();
  const diffTime = expiry - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { text: 'Expirado', color: '#ef4444' };
  }
  if (diffDays <= 60) {
    return { text: `Vence em ${diffDays}d`, color: '#f59e0b' };
  }
  return { text: `Válido (${diffDays}d)`, color: 'var(--success-color)' };
};
