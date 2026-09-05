import React, { useState, useEffect } from 'react';
import { dbService } from '../firebase';
import { 
  Settings, Users, Shield, Globe, Database, Key, Check, Plus, X, 
  Trash2, ShieldAlert, CheckCircle2, Copy, Download, Upload, Palette,
  ListFilter, Edit, Warehouse, KeyRound, RefreshCw, Clock, Mail, Activity
} from 'lucide-react';
import EmailSettingsTab from './config/EmailSettingsTab';

export default function ConfigPanel() {
  const [activeTab, setActiveTab] = useState('branding'); // 'branding' | 'profiles' | 'users' | 'locations' | 'categories' | 'email' | 'integrations' | 'logs'
  
  // Data States
  const [tenantSettings, setTenantSettings] = useState({ name: '', cnpj: '', logo: '', themeColor: '#ec4899' });
  const [profiles, setProfiles] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [stockLocations, setStockLocations] = useState([]);

  // Catálogo Central de Procedimentos (Módulo T.I)
  const [proceduresList, setProceduresList] = useState([]);
  const [procedureSearch, setProcedureSearch] = useState('');
  const [procedureModuleFilter, setProcedureModuleFilter] = useState('all'); // 'all' | 'assist' | 'medical' | 'clinical' | 'apac'
  const [showProcedureModal, setShowProcedureModal] = useState(false);
  const [editingProcedure, setEditingProcedure] = useState(null);
  const [procedureForm, setProcedureForm] = useState({
    name: '',
    code: '',
    value: '',
    active: true,
    modules: {
      assist: true,
      medical: true,
      clinical: true,
      apac: false
    }
  });

  // Email Server State (Módulo T.I)
  const [emailSettings, setEmailSettings] = useState({
    enabled: true,
    senderName: 'Nex-Ai CLINIC — Notificações Automáticas',
    senderEmail: 'notificacoes@clinica.med.br',
    replyToEmail: 'contato@clinica.med.br',
    provider: 'smtp',
    smtpHost: 'smtp.gmail.com',
    smtpPort: 587,
    encryption: 'TLS',
    smtpUser: 'notificacoes@clinica.med.br',
    smtpPassword: '',
    bccAudit: 'ti.auditoria@clinica.med.br',
    footerSignature: 'Nex-Ai CLINIC — Ecossistema Inteligente de Gestão em Saúde\nEsta é uma notificação automática gerada pelo sistema. Por favor, não responda diretamente a este e-mail.',
    notifications: {
      medicalSwaps: true,
      serviceOrders: true,
      hrAdmissions: true,
      purchasingQuotes: true,
      calendarReminders: true,
      assistAlerts: true,
      securityAlerts: true
    }
  });
  const [testingEmail, setTestingEmail] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [emailLogsList, setEmailLogsList] = useState([]);
  
  // Actions loading
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Stock Locations Form State (Módulo T.I)
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [locationForm, setLocationForm] = useState({
    name: '',
    description: '',
    responsible: '',
    status: 'Ativo'
  });

  // Categories Form State (Módulo T.I)
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    module: 'Estoque',
    description: ''
  });
  
  // User Form
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [tempPasswordMessage, setTempPasswordMessage] = useState('');
  const [generatedTempPass, setGeneratedTempPass] = useState('');
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'reception', // profileId
    employeeId: '',
    status: 'active'
  });

  // Integration simulated keys
  const [apiKeys, setApiKeys] = useState([
    { id: 'key-1', name: 'Gateway WhatsApp Reminders', token: 'nx_live_51MzkxNDIyODk0...', createdAt: '2026-07-01' },
    { id: 'key-2', name: 'Faturamento SUS - APAC Transmit', token: 'nx_live_9921aHjK112a...', createdAt: '2026-07-10' }
  ]);
  const [newKeyName, setNewKeyName] = useState('');

  // Backup files
  const [backupString, setBackupString] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [settings, profileList, users, empList, logs, catList, locList, emailConf, emailLogs, procList] = await Promise.all([
        dbService.getTenantSettings(),
        dbService.getUserProfiles(),
        dbService.getUsers(),
        dbService.getEmployees(),
        dbService.getAuditLogs(),
        dbService.getProductCategories ? dbService.getProductCategories() : [],
        dbService.getStockLocations ? dbService.getStockLocations() : [],
        dbService.getEmailSettings ? dbService.getEmailSettings() : null,
        dbService.getEmailLogs ? dbService.getEmailLogs() : [],
        dbService.getProcedures ? dbService.getProcedures() : []
      ]);
      setTenantSettings(settings);
      setProfiles(profileList);
      setUsersList(users);
      const sortedEmployees = (empList || []).slice().sort((a, b) => 
        (a.name || '').localeCompare(b.name || '', 'pt-BR', { sensitivity: 'base' })
      );
      setEmployees(sortedEmployees);
      setAuditLogs(logs);
      setCategoriesList(catList);
      setStockLocations(locList);
      setProceduresList(procList || []);
      if (emailConf) setEmailSettings(emailConf);
      if (emailLogs) setEmailLogsList(emailLogs);

      // Apply theme color immediately
      if (settings.themeColor) {
        document.documentElement.style.setProperty('--primary-color', settings.themeColor);
      }
    } catch (err) {
      console.error(err);
      showAlert('Erro ao carregar configurações do sistema.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 5000);
  };

  const logAudit = async (action, details) => {
    try {
      await dbService.createAuditLog({
        operator: 'ti@clinica.com',
        action,
        details
      });
    } catch (e) {
      console.error(e);
    }
  };

  // ----------------------------------------------------
  // Tenant Settings (SaaS & Theme)
  // ----------------------------------------------------
  const handleSaveTenantSettings = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await dbService.saveTenantSettings(tenantSettings);
      document.documentElement.style.setProperty('--primary-color', tenantSettings.themeColor);
      showAlert('Configurações da clínica e tema visual salvos!', 'success');
      logAudit('Customização SaaS', `Configurações de marca e cor tema (${tenantSettings.themeColor}) atualizadas.`);
      // Reload branding dynamically
      window.dispatchEvent(new Event('tenant-branding-changed'));
    } catch (err) {
      showAlert('Erro ao gravar configurações da clínica.', 'danger');
    } finally {
      setActionLoading(false);
    }
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 500 * 1024) return showAlert('A logomarca deve ter no máximo 500KB.', 'warning');
      const reader = new FileReader();
      reader.onloadend = () => {
        setTenantSettings(s => ({ ...s, logo: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // ----------------------------------------------------
  // Profiles Matrix (RBAC)
  // ----------------------------------------------------
  const handlePermissionChange = async (profileId, moduleKey, val) => {
    const updatedProfiles = [...profiles];
    const pIdx = updatedProfiles.findIndex(p => p.id === profileId);
    if (pIdx > -1) {
      updatedProfiles[pIdx].permissions[moduleKey] = val;
      setProfiles(updatedProfiles);
      try {
        await dbService.saveUserProfile(updatedProfiles[pIdx]);
        logAudit('Atualização de Permissão', `Perfil "${updatedProfiles[pIdx].name}" - Módulo ${moduleKey} definido como ${val}.`);
      } catch (err) {
        showAlert('Erro ao atualizar permissão no banco.', 'danger');
      }
    }
  };

  // ----------------------------------------------------
  // User Management
  // ----------------------------------------------------
  const handleOpenUserAdd = () => {
    setEditingUser(null);
    setTempPasswordMessage('');
    setUserForm({
      name: '',
      email: '',
      role: profiles[0]?.id || 'reception',
      employeeId: employees[0]?.id || '',
      primaryUnit: 'betim',
      allowedUnits: ['betim'],
      status: 'active'
    });
    setShowUserModal(true);
  };

  const handleOpenUserEdit = (user) => {
    setEditingUser(user);
    setTempPasswordMessage('');
    const matchedRole = (user.role === 'rh') ? 'hr' : (user.role || 'reception');
    const uUnit = user.primaryUnit || (user.allowedUnits && user.allowedUnits.includes('taguatinga') && !user.allowedUnits.includes('betim') ? 'taguatinga' : (user.allowedUnits && user.allowedUnits.includes('all') ? 'all' : 'betim'));
    setUserForm({
      name: user.name || '',
      email: user.email || '',
      role: matchedRole,
      employeeId: user.employeeId || '',
      primaryUnit: uUnit,
      allowedUnits: user.allowedUnits || (uUnit === 'all' ? ['all', 'betim', 'taguatinga'] : [uUnit]),
      status: user.status || 'active'
    });
    setShowUserModal(true);
  };

  const handleGenerateTempPassword = async (user) => {
    const targetUser = user || editingUser;
    if (!targetUser) return;
    setActionLoading(true);
    try {
      const identifier = targetUser.email || targetUser.uid;
      const tempPass = await dbService.generateTempPassword(identifier);
      setGeneratedTempPass(tempPass);
      showAlert(`Senha temporária gerada e salva na nuvem para ${targetUser.name || targetUser.email}!`, 'success');
      logAudit('Senha Temporária Gerada', `Gerada nova senha temporária para o usuário ${targetUser.email}.`);
      fetchData();
    } catch (err) {
      console.error(err);
      showAlert('Erro ao gerar senha temporária.', 'danger');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    if (!userForm.name || !userForm.email) {
      return showAlert('Preencha os campos obrigatórios (Nome e E-mail).', 'warning');
    }
    setActionLoading(true);
    try {
      const allowedUnitsToSave = userForm.primaryUnit === 'all' ? ['all', 'betim', 'taguatinga'] : [userForm.primaryUnit || 'betim'];
      if (editingUser) {
        await dbService.updateUser(editingUser.uid, {
          name: userForm.name,
          email: userForm.email,
          role: userForm.role,
          employeeId: userForm.employeeId || '',
          primaryUnit: userForm.primaryUnit || 'betim',
          allowedUnits: allowedUnitsToSave,
          status: userForm.status || 'active'
        });
        if (userForm.password) {
          const identifier = editingUser.email || editingUser.uid;
          await dbService.updateUserPassword(identifier, userForm.password);
        }
        showAlert(`Acesso de "${userForm.name}" gravado com sucesso!`, 'success');
        logAudit('Modificação de Usuário', `Usuário ${userForm.email} editado. Status: ${userForm.status}, Perfil: ${userForm.role}, Filial: ${userForm.primaryUnit}`);
        setShowUserModal(false);
      } else {
        const tempPass = userForm.password || Math.random().toString(36).substring(2, 10);
        const res = await dbService.createUser(
          userForm.email,
          userForm.name,
          userForm.role,
          [],
          userForm.primaryUnit || 'betim',
          allowedUnitsToSave,
          {
            employeeId: userForm.employeeId || '',
            status: userForm.status || 'active',
            password: tempPass
          }
        );
        const msg = res?.isExisting
          ? `O e-mail "${userForm.email}" já possuía cadastro. O perfil e acesso de "${userForm.name}" foram sincronizados!`
          : `Usuário "${userForm.name}" criado com sucesso! Senha inicial: ${tempPass}`;
        showAlert(msg, 'success');
        setGeneratedTempPass(tempPass);
        logAudit('Criação de Usuário', `Usuário de login ${userForm.email} salvo sob perfil ${userForm.role} na filial ${userForm.primaryUnit}.`);
        setShowUserModal(false);
      }
      await fetchData();
    } catch (err) {
      console.error(err);
      showAlert(err.message || 'Erro ao gravar usuário.', 'danger');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleUserStatus = async (user) => {
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    setActionLoading(true);
    try {
      await dbService.updateUser(user.uid, { ...user, status: newStatus });
      showAlert(`Status do usuário "${user.name}" alterado para ${newStatus === 'active' ? 'Ativo' : 'Bloqueado'}.`, 'success');
      logAudit('Bloqueio/Ativação de Usuário', `Usuário ${user.email} alterado para ${newStatus}.`);
      fetchData();
    } catch (err) {
      showAlert('Erro ao alterar status de segurança.', 'danger');
    } finally {
      setActionLoading(false);
    }
  };

  // ----------------------------------------------------
  // Categories Management Methods (T.I)
  // ----------------------------------------------------
  const handleOpenCategoryAdd = () => {
    setEditingCategory(null);
    setCategoryForm({ name: '', module: 'Estoque', description: '' });
    setShowCategoryModal(true);
  };

  const handleOpenCategoryEdit = (cat) => {
    setEditingCategory(cat);
    setCategoryForm({
      name: cat.name,
      module: cat.module || 'Estoque',
      description: cat.description || ''
    });
    setShowCategoryModal(true);
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!categoryForm.name) return showAlert('Nome da categoria é obrigatório.', 'warning');

    setActionLoading(true);
    try {
      const payload = {
        ...categoryForm,
        ...(editingCategory ? { id: editingCategory.id } : {})
      };
      await dbService.saveProductCategory(payload);
      showAlert(editingCategory ? 'Categoria atualizada!' : 'Categoria cadastrada com sucesso!', 'success');
      logAudit('Cadastro/Edição de Categoria', `Categoria "${categoryForm.name}" salva para o módulo ${categoryForm.module}.`);
      setShowCategoryModal(false);
      fetchData();
    } catch (err) {
      showAlert('Erro ao salvar categoria.', 'danger');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir esta categoria do sistema?')) return;
    setActionLoading(true);
    try {
      await dbService.deleteProductCategory(id);
      showAlert('Categoria excluída com sucesso.', 'success');
      logAudit('Exclusão de Categoria', `Categoria ID ${id} excluída do sistema.`);
      fetchData();
    } catch (err) {
      showAlert('Erro ao excluir categoria.', 'danger');
    } finally {
      setActionLoading(false);
    }
  };

  // ----------------------------------------------------
  // Integrations & Backups
  // ----------------------------------------------------
  const handleGenerateApiKey = () => {
    if (!newKeyName) return showAlert('Dê um nome para a chave de API.', 'warning');
    const token = 'nx_live_' + Math.random().toString(36).substr(2, 9) + Math.random().toString(36).substr(2, 9);
    const newKey = {
      id: 'key-' + Math.random().toString(36).substr(2, 5),
      name: newKeyName,
      token,
      createdAt: new Date().toISOString().substring(0, 10)
    };
    setApiKeys([...apiKeys, newKey]);
    setNewKeyName('');
    showAlert('Nova chave de API gerada com sucesso!', 'success');
    logAudit('Geração de API Key', `Chave "${newKey.name}" gerada.`);
  };

  const handleExportBackup = async () => {
    try {
      const dataStr = await dbService.exportBackup();
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `nexa-backup-${new Date().toISOString().substring(0,10)}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      showAlert('Backup do sistema gerado e baixado!', 'success');
      logAudit('Backup exportado', 'Cópia de segurança completa do banco de dados local exportada pelo administrador.');
    } catch (err) {
      showAlert('Erro ao exportar dados.', 'danger');
    }
  };

  const handleImportBackup = async () => {
    if (!backupString) return showAlert('Cole o JSON de backup ou insira o conteúdo correspondente.', 'warning');
    if (!window.confirm('ATENÇÃO: A restauração de backup substituirá todos os dados correntes! Deseja continuar?')) return;
    setActionLoading(true);
    try {
      await dbService.importBackup(backupString);
      showAlert('Backup restaurado com sucesso! O sistema será recarregado.', 'success');
      logAudit('Backup restaurado', 'Banco de dados local sobrescrito via importação de backup.');
      setTimeout(() => window.location.reload(), 1500);
    } catch (err) {
      showAlert(err.message, 'danger');
    } finally {
      setActionLoading(false);
    }
  };

  // ----------------------------------------------------
  // Stock Locations (Locais de Estoque - Módulo T.I)
  // ----------------------------------------------------
  const handleOpenLocationAdd = () => {
    setEditingLocation(null);
    setLocationForm({ name: '', description: '', responsible: '', status: 'Ativo' });
    setShowLocationModal(true);
  };

  const handleOpenLocationEdit = (loc) => {
    setEditingLocation(loc);
    setLocationForm({
      name: loc.name || '',
      description: loc.description || '',
      responsible: loc.responsible || '',
      status: loc.status || 'Ativo'
    });
    setShowLocationModal(true);
  };

  const handleSaveLocation = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      if (editingLocation) {
        await dbService.saveStockLocation({ id: editingLocation.id, ...locationForm });
        showAlert(`Local de estoque "${locationForm.name}" atualizado!`, 'success');
      } else {
        await dbService.saveStockLocation(locationForm);
        showAlert(`Local de estoque "${locationForm.name}" criado!`, 'success');
      }
      setShowLocationModal(false);
      const updated = await dbService.getStockLocations();
      setStockLocations(updated);
      logAudit('Gestão de Locais de Estoque', `Local "${locationForm.name}" ${editingLocation ? 'editado' : 'criado'}.`);
    } catch (err) {
      showAlert('Erro ao salvar local de estoque.', 'danger');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteLocation = async (id, name) => {
    if (!window.confirm(`Deseja realmente remover o local de estoque "${name}"?`)) return;
    setActionLoading(true);
    try {
      await dbService.deleteStockLocation(id);
      showAlert(`Local "${name}" removido!`, 'success');
      const updated = await dbService.getStockLocations();
      setStockLocations(updated);
      logAudit('Exclusão de Local de Estoque', `Local "${name}" removido.`);
    } catch (err) {
      showAlert('Erro ao remover local de estoque.', 'danger');
    } finally {
      setActionLoading(false);
    }
  };

  // ----------------------------------------------------
  // Central Procedures Catalog Methods (Módulo T.I)
  // ----------------------------------------------------
  const handleOpenProcedureAdd = () => {
    setEditingProcedure(null);
    setProcedureForm({
      name: '',
      code: '',
      value: '',
      active: true,
      modules: {
        assist: true,
        medical: true,
        clinical: true,
        apac: false
      }
    });
    setShowProcedureModal(true);
  };

  const handleOpenProcedureEdit = (proc) => {
    setEditingProcedure(proc);
    setProcedureForm({
      name: proc.name || '',
      code: proc.code || '',
      value: proc.value !== undefined ? proc.value : '',
      active: proc.active !== false,
      modules: {
        assist: !!proc.modules?.assist,
        medical: !!proc.modules?.medical,
        clinical: !!proc.modules?.clinical,
        apac: !!proc.modules?.apac
      }
    });
    setShowProcedureModal(true);
  };

  const handleSaveProcedure = async (e) => {
    e.preventDefault();
    if (!procedureForm.name.trim()) return showAlert('Nome do procedimento é obrigatório.', 'warning');
    if (procedureForm.value === '' || isNaN(parseFloat(procedureForm.value))) {
      return showAlert('Valor do procedimento deve ser numérico.', 'warning');
    }

    setActionLoading(true);
    try {
      const payload = {
        ...(editingProcedure ? { id: editingProcedure.id } : {}),
        name: procedureForm.name.trim().toUpperCase(),
        code: procedureForm.code.trim(),
        value: parseFloat(procedureForm.value) || 0,
        active: procedureForm.active !== false,
        modules: procedureForm.modules
      };
      await dbService.saveProcedure(payload);
      showAlert(editingProcedure ? 'Procedimento atualizado!' : 'Procedimento cadastrado com sucesso!', 'success');
      logAudit('Cadastro de Procedimento', `Procedimento "${payload.name}" cadastrado/atualizado no T.I. com valor R$ ${payload.value}.`);
      setShowProcedureModal(false);
      const updated = await dbService.getProcedures();
      setProceduresList(updated || []);
    } catch (err) {
      showAlert('Erro ao salvar procedimento.', 'danger');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteProcedure = async (id, name) => {
    if (!window.confirm(`Deseja realmente remover o procedimento "${name}" do catálogo do sistema?`)) return;
    setActionLoading(true);
    try {
      await dbService.deleteProcedure(id);
      showAlert(`Procedimento "${name}" excluído!`, 'success');
      logAudit('Exclusão de Procedimento', `Procedimento "${name}" excluído pelo T.I.`);
      const updated = await dbService.getProcedures();
      setProceduresList(updated || []);
    } catch (err) {
      showAlert('Erro ao excluir procedimento.', 'danger');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleProcedureActive = async (proc) => {
    setActionLoading(true);
    try {
      const updatedItem = {
        ...proc,
        active: proc.active === false ? true : false
      };
      await dbService.saveProcedure(updatedItem);
      showAlert(`Procedimento "${proc.name}" ${updatedItem.active ? 'ativado' : 'desativado'}!`, 'success');
      logAudit('Alteração de Procedimento', `Procedimento "${proc.name}" alterado para ${updatedItem.active ? 'Ativo' : 'Inativo'}.`);
      const updated = await dbService.getProcedures();
      setProceduresList(updated || []);
    } catch (err) {
      showAlert('Erro ao alterar situação do procedimento.', 'danger');
    } finally {
      setActionLoading(false);
    }
  };

  // ----------------------------------------------------
  // Email Server Configuration (Módulo T.I)
  // ----------------------------------------------------
  const handleSaveEmailSettings = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setActionLoading(true);
    try {
      await dbService.saveEmailSettings(emailSettings);
      showAlert('Configurações do servidor de e-mail salvas com sucesso!', 'success');
      logAudit('Configuração de E-mail', `Servidor SMTP ${emailSettings.smtpHost}:${emailSettings.smtpPort} (${emailSettings.senderEmail}) atualizado.`);
      if (dbService.getEmailLogs) {
        const logs = await dbService.getEmailLogs();
        setEmailLogsList(logs);
      }
    } catch (err) {
      showAlert('Erro ao salvar configurações do servidor de e-mail.', 'danger');
    } finally {
      setActionLoading(false);
    }
  };

  const handleTestEmail = async (targetRecipient) => {
    setTestingEmail(true);
    setTestResult(null);
    try {
      await dbService.testEmailConnection(targetRecipient, emailSettings);
      setTestResult({
        success: true,
        message: `Disparo concluído com sucesso para ${targetRecipient}!`,
        timestamp: new Date().toLocaleTimeString('pt-BR')
      });
      showAlert(`Disparo de teste concluído com sucesso para ${targetRecipient}!`, 'success');
      logAudit('Teste de E-mail', `Disparo de teste de e-mail executado para ${targetRecipient}.`);
      if (dbService.getEmailLogs) {
        const logs = await dbService.getEmailLogs();
        setEmailLogsList(logs);
      }
    } catch (err) {
      setTestResult({
        success: false,
        message: 'Falha no teste: ' + (err.message || 'Verifique as credenciais SMTP.'),
        timestamp: new Date().toLocaleTimeString('pt-BR')
      });
      showAlert('Falha no envio de teste de e-mail.', 'danger');
    } finally {
      setTestingEmail(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.cardHeader}>
        <div>
          <h1 style={styles.title}>NexaCONFIG — Administração & T.I.</h1>
          <p style={styles.subtitle}>Gerenciamento de marcas da clínica (SaaS), controle de acesso por perfis de segurança (RBAC), servidor de e-mails, integrações e logs.</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={styles.tabsWrapper}>
        <button onClick={() => setActiveTab('branding')} style={{ ...styles.tabBtn, ...(activeTab === 'branding' ? styles.tabBtnActive : {}) }}>
          <Palette size={16} /> Branding
        </button>
        <button onClick={() => setActiveTab('profiles')} style={{ ...styles.tabBtn, ...(activeTab === 'profiles' ? styles.tabBtnActive : {}) }}>
          <Shield size={16} /> Perfis
        </button>
        <button onClick={() => setActiveTab('users')} style={{ ...styles.tabBtn, ...(activeTab === 'users' ? styles.tabBtnActive : {}) }}>
          <Users size={16} /> Usuários ({usersList.length})
        </button>
        <button onClick={() => setActiveTab('locations')} style={{ ...styles.tabBtn, ...(activeTab === 'locations' ? styles.tabBtnActive : {}) }}>
          <Warehouse size={16} /> Locais ({stockLocations.length})
        </button>
        <button onClick={() => setActiveTab('categories')} style={{ ...styles.tabBtn, ...(activeTab === 'categories' ? styles.tabBtnActive : {}) }}>
          <ListFilter size={16} /> Categorias ({categoriesList.length})
        </button>
        <button onClick={() => setActiveTab('procedures')} style={{ ...styles.tabBtn, ...(activeTab === 'procedures' ? styles.tabBtnActive : {}) }}>
          <Activity size={16} /> Procedimentos ({proceduresList.length})
        </button>
        <button onClick={() => setActiveTab('email')} style={{ ...styles.tabBtn, ...(activeTab === 'email' ? styles.tabBtnActive : {}) }}>
          <Mail size={16} /> E-mail
        </button>
        <button onClick={() => setActiveTab('integrations')} style={{ ...styles.tabBtn, ...(activeTab === 'integrations' ? styles.tabBtnActive : {}) }}>
          <Key size={16} /> Integrações
        </button>
        <button onClick={() => setActiveTab('logs')} style={{ ...styles.tabBtn, ...(activeTab === 'logs' ? styles.tabBtnActive : {}) }}>
          <ShieldAlert size={16} /> Segurança ({auditLogs.length})
        </button>
      </div>

      {/* Messages */}
      {message.text && (
        <div style={{ ...styles.alert, backgroundColor: `var(--${message.type}-light)`, border: `1px solid var(--${message.type}-color)` }}>
          <ShieldAlert size={18} color={`var(--${message.type}-color)`} />
          <span style={{ color: `var(--${message.type}-color)`, fontWeight: '600' }}>{message.text}</span>
        </div>
      )}

      {loading ? (
        <div style={styles.loadingBox}>Carregando painel de T.I...</div>
      ) : (
        <>
          {/* TAB 1: Branding */}
          {activeTab === 'branding' && (
            <div style={styles.panelGrid}>
              <form onSubmit={handleSaveTenantSettings} style={{ ...styles.settingsCard, gridColumn: 'span 2' }}>
                <h3>🏢 Configurações do Tenant (Clínica)</h3>
                <div style={styles.formRow}>
                  <div className="form-group" style={{ flex: 2 }}>
                    <label>Nome Fantasia da Clínica *</label>
                    <input type="text" className="form-control" required value={tenantSettings.name} onChange={e => setTenantSettings({ ...tenantSettings, name: e.target.value })} />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>CNPJ da Clínica *</label>
                    <input type="text" className="form-control" required value={tenantSettings.cnpj} onChange={e => setTenantSettings({ ...tenantSettings, cnpj: e.target.value })} />
                  </div>
                </div>

                <div style={styles.formRow}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Cor Primária do Sistema (Branding)</label>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                      {['#ec4899', '#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444'].map(color => (
                        <div 
                          key={color} 
                          onClick={() => setTenantSettings({ ...tenantSettings, themeColor: color })}
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            backgroundColor: color,
                            cursor: 'pointer',
                            border: tenantSettings.themeColor === color ? '3px solid #000' : '1px solid #ccc',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                          }} 
                        />
                      ))}
                    </div>
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Logomarca (Upload de Arquivo)</label>
                    <input type="file" className="form-control" onChange={handleLogoUpload} style={{ fontSize: '0.8rem', padding: '0.2rem' }} />
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Formatos suportados: PNG, JPG. Máx: 500KB.</span>
                  </div>
                </div>

                <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '0.75rem', color: 'var(--text-color)' }}>
                    ⚙️ Regras de Negócio & Estoque (Parâmetros de T.I.)
                  </h4>
                  <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input 
                      type="checkbox" 
                      id="blockReqZeroStock"
                      checked={!!tenantSettings.blockRequisitionZeroStock}
                      onChange={e => setTenantSettings({ ...tenantSettings, blockRequisitionZeroStock: e.target.checked })}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                    <label htmlFor="blockReqZeroStock" style={{ margin: 0, fontWeight: '600', cursor: 'pointer', fontSize: '0.9rem' }}>
                      Bloquear requisição de materiais/medicamentos sem estoque disponível (Estoque Zerado)
                    </label>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '1.75rem', marginTop: '0.2rem' }}>
                    Quando ativado, as técnicas no salão de hemodiálise serão impedidas de solicitar produtos cujo saldo seja zero ou insuficiente.
                  </p>

                  <div style={{ marginTop: '1.25rem', padding: '1rem', backgroundColor: 'var(--bg-body)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                      <div style={{ flex: '1 1 300px' }}>
                        <label style={{ margin: 0, fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <Clock size={16} color="var(--primary-color)" /> Tempo de Vida das Requisições (TTL por Turno)
                        </label>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>
                          Tempo limite para que requisições pendentes/parciais expirem automaticamente, liberando o estoque reservado de volta para o saldo disponível de compra e novos turnos.
                        </p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <input
                          type="number"
                          min="0.25"
                          max="72"
                          step="0.5"
                          className="form-control"
                          value={tenantSettings.requisitionTTLHours !== undefined ? tenantSettings.requisitionTTLHours : 1}
                          onChange={e => setTenantSettings({ ...tenantSettings, requisitionTTLHours: Math.max(0.1, parseFloat(e.target.value) || 1) })}
                          style={{ width: '85px', textAlign: 'center', fontWeight: '700', padding: '0.4rem' }}
                        />
                        <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-primary)' }}>hora(s)</span>
                      </div>
                    </div>

                    {/* Presets rápidos */}
                    <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.85rem', flexWrap: 'wrap' }}>
                      {[
                        { label: '1 hora (Inicial)', hours: 1 },
                        { label: '2 horas', hours: 2 },
                        { label: '4 horas', hours: 4 },
                        { label: '8 horas (1 Turno)', hours: 8 },
                        { label: '12 horas', hours: 12 },
                        { label: '24 horas (1 Dia)', hours: 24 }
                      ].map(preset => {
                        const isSelected = (parseFloat(tenantSettings.requisitionTTLHours) || 1) === preset.hours;
                        return (
                          <button
                            key={preset.hours}
                            type="button"
                            onClick={() => setTenantSettings({ ...tenantSettings, requisitionTTLHours: preset.hours })}
                            style={{
                              padding: '0.35rem 0.65rem',
                              borderRadius: '6px',
                              border: isSelected ? '1.5px solid var(--primary-color)' : '1px solid var(--border-color)',
                              backgroundColor: isSelected ? 'rgba(236, 72, 153, 0.12)' : '#ffffff',
                              color: isSelected ? 'var(--primary-color)' : 'var(--text-secondary)',
                              fontSize: '0.78rem',
                              fontWeight: isSelected ? '700' : '500',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            {preset.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <button type="submit" disabled={actionLoading} className="btn btn-primary" style={{ backgroundColor: tenantSettings.themeColor || '#ec4899', alignSelf: 'flex-start', marginTop: '1rem' }}>
                  {actionLoading ? 'Salvando...' : 'Aplicar Configurações & Cor de Marca'}
                </button>
              </form>

              <div style={styles.settingsCard}>
                <h3>👁️ Pré-visualização da Marca</h3>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '2rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-body)' }}>
                  {tenantSettings.logo ? (
                    <img src={tenantSettings.logo} alt="Logo" style={{ maxHeight: '80px', maxWidth: '100%', objectFit: 'contain' }} />
                  ) : (
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: tenantSettings.themeColor || '#ec4899', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1.5rem', fontWeight: 'bold' }}>
                      {tenantSettings.name ? tenantSettings.name.substring(0,2).toUpperCase() : 'NX'}
                    </div>
                  )}
                  <strong style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>{tenantSettings.name || 'Nome da Clínica'}</strong>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>CNPJ: {tenantSettings.cnpj || '00.000.000/0001-00'}</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: RBAC Matrix */}
          {activeTab === 'profiles' && (() => {
            const rbacModules = [
              { key: 'assist', label: 'Assistencial' },
              { key: 'medical', label: 'Médico' },
              { key: 'index', label: 'Qualidade' },
              { key: 'reception', label: 'Recepção' },
              { key: 'clinical', label: 'Clínico' },
              { key: 'calendar', label: 'Agenda' },
              { key: 'stock', label: 'Estoque' },
              { key: 'maintenance', label: 'Manutenção' },
              { key: 'purchasing', label: 'Compras' },
              { key: 'requisitions', label: 'Enfermagem' },
              { key: 'apac', label: 'Faturamento' },
              { key: 'finance', label: 'Financeiro' },
              { key: 'hr', label: 'RH' },
              { key: 'sesmt', label: 'SESMT' },
              { key: 'config', label: 'Configurações' }
            ];

            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{
                  backgroundColor: 'var(--bg-card)',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  overflowX: 'auto',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
                }}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={{ minWidth: '180px' }}>Perfil</th>
                        {rbacModules.map(m => (
                          <th key={m.key} style={{ minWidth: '130px', textAlign: 'center' }}>{m.label}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {profiles.map(p => (
                        <tr key={p.id}>
                          <td style={{ fontWeight: '700', whiteSpace: 'nowrap' }}>{p.name}</td>
                          {rbacModules.map(mod => {
                            const modKey = mod.key;
                            const currentPerm = p.permissions?.[modKey] || 'none';
                            return (
                              <td key={modKey} style={{ textAlign: 'center' }}>
                                <select 
                                  className="form-control"
                                  value={currentPerm}
                                  onChange={e => handlePermissionChange(p.id, modKey, e.target.value)}
                                  style={{ 
                                    fontSize: '0.8rem', 
                                    padding: '0.2rem 0.5rem', 
                                    border: '1px solid var(--border-color)',
                                    backgroundColor: currentPerm === 'write' ? 'rgba(16,185,129,0.05)' : currentPerm === 'read' ? 'rgba(59,130,246,0.05)' : 'transparent',
                                    color: currentPerm === 'write' ? '#10b981' : currentPerm === 'read' ? '#3b82f6' : 'var(--text-muted)',
                                    fontWeight: currentPerm !== 'none' ? '700' : 'normal'
                                  }}
                                >
                                  <option value="none">Bloqueado</option>
                                  <option value="read">Leitura</option>
                                  <option value="write">Escrita</option>
                                </select>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })()}

          {/* TAB 3: Users */}
          {activeTab === 'users' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={handleOpenUserAdd} style={styles.addBtn}>
                  <Plus size={16} /> Criar Conta de Usuário
                </button>
              </div>

              <div style={styles.tableCard}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th>Usuário</th>
                      <th>Email</th>
                      <th>Filial</th>
                      <th>Perfil</th>
                      <th>Funcionário</th>
                      <th>Status</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersList.map((user) => {
                      const emp = employees.find(e => e.id === user.employeeId);
                      const userRoleKey = (user.role === 'rh') ? 'hr' : user.role;
                      const profile = profiles.find(p => p.id === user.role || p.id === userRoleKey || (user.role === 'hr' && p.id === 'rh'));
                      const uUnit = user.primaryUnit || (user.allowedUnits && user.allowedUnits.includes('taguatinga') && !user.allowedUnits.includes('betim') ? 'taguatinga' : (user.allowedUnits && user.allowedUnits.includes('all') ? 'all' : 'betim'));

                      return (
                        <tr key={user.uid}>
                          <td style={{ fontWeight: '600' }}>{user.name}</td>
                          <td>{user.email}</td>
                          <td>
                            <span style={{ 
                              padding: '0.2rem 0.5rem', 
                              borderRadius: '4px', 
                              fontSize: '0.72rem', 
                              fontWeight: '700',
                              backgroundColor: uUnit === 'taguatinga' ? '#ecfdf5' : uUnit === 'all' ? '#f5f3ff' : '#eff6ff',
                              color: uUnit === 'taguatinga' ? '#065f46' : uUnit === 'all' ? '#6b21a8' : '#1e40af',
                              border: `1px solid ${uUnit === 'taguatinga' ? '#a7f3d0' : uUnit === 'all' ? '#ddd6fe' : '#bfdbfe'}`
                            }}>
                              {uUnit === 'taguatinga' ? '🏢 Taguatinga' : uUnit === 'all' ? '🌐 Todas' : '🏢 Betim'}
                            </span>
                          </td>
                          <td>
                            <span style={{ 
                              padding: '0.2rem 0.5rem', 
                              borderRadius: '12px', 
                              fontSize: '0.75rem', 
                              fontWeight: '700',
                              backgroundColor: user.role === 'admin' ? '#fee2e2' : '#f1f5f9',
                              color: user.role === 'admin' ? '#991b1b' : '#475569'
                            }}>
                              {profile ? profile.name : (user.role === 'rh' || user.role === 'hr' ? 'Recursos Humanos (RH)' : user.role)}
                            </span>
                          </td>
                          <td>{emp ? emp.name : <span style={{ color: 'var(--text-muted)' }}>Nenhum</span>}</td>
                          <td>
                            <span style={{ 
                              padding: '0.2rem 0.5rem', 
                              borderRadius: '12px', 
                              fontSize: '0.75rem', 
                              fontWeight: '700',
                              backgroundColor: user.status === 'active' ? '#d1fae5' : '#f3f4f6',
                              color: user.status === 'active' ? '#065f46' : '#374151'
                            }}>
                              {user.status === 'active' ? 'Liberado' : 'Bloqueado'}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                              <button onClick={() => handleOpenUserEdit(user)} style={styles.actionEditBtn}>
                                Editar
                              </button>
                              <button onClick={() => { handleOpenUserEdit(user); }} style={{ ...styles.actionEditBtn, color: 'var(--primary-color)' }}>
                                <KeyRound size={13} style={{ marginRight: '2px', verticalAlign: 'middle' }} /> Senha
                              </button>
                              <button onClick={() => handleGenerateTempPassword(user)} style={{ ...styles.actionEditBtn, color: '#f59e0b' }}>
                                <RefreshCw size={13} style={{ marginRight: '2px', verticalAlign: 'middle' }} /> Gerar Temp
                              </button>
                              <button onClick={() => handleToggleUserStatus(user)} style={{ ...styles.actionEditBtn, color: user.status === 'active' ? 'var(--danger-color)' : '#10b981' }}>
                                {user.status === 'active' ? 'Bloquear' : 'Ativar'}
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

          {/* TAB: Stock Locations (Locais de Estoque) */}
          {activeTab === 'locations' && (
            <div style={styles.tableCard}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                  <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>🏭 Locais de Estoque da Clínica</h3>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Cadastre os depósitos, almoxarifados e pontos de consumo de insumos (Almoxarifado Central, Farmácia da Diálise, Posto de Enfermagem, etc.).
                  </span>
                </div>
                <button onClick={handleOpenLocationAdd} className="btn btn-primary" style={{ backgroundColor: tenantSettings.themeColor || '#ec4899', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Plus size={16} /> Novo Local de Estoque
                </button>
              </div>

              <table style={styles.table}>
                <thead>
                  <tr>
                    <th>Local</th>
                    <th>Descrição</th>
                    <th>Responsável</th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {stockLocations.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                        Nenhum local de estoque cadastrado. Clique em "Novo Local de Estoque" para adicionar.
                      </td>
                    </tr>
                  ) : (
                    stockLocations.map(loc => (
                      <tr key={loc.id}>
                        <td style={{ fontWeight: '600' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Warehouse size={16} color="var(--primary-color)" />
                            {loc.name}
                          </div>
                        </td>
                        <td>{loc.description || '-'}</td>
                        <td>{loc.responsible || '-'}</td>
                        <td>
                          <span style={{
                            padding: '0.2rem 0.5rem',
                            borderRadius: '12px',
                            fontSize: '0.75rem',
                            fontWeight: '700',
                            backgroundColor: loc.status === 'Ativo' ? '#dcfce7' : '#fee2e2',
                            color: loc.status === 'Ativo' ? '#166534' : '#991b1b'
                          }}>
                            {loc.status || 'Ativo'}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button onClick={() => handleOpenLocationEdit(loc)} style={styles.actionEditBtn}>
                              <Edit size={14} /> Editar
                            </button>
                            <button onClick={() => handleDeleteLocation(loc.id, loc.name)} style={{ ...styles.actionEditBtn, color: 'var(--danger-color)' }}>
                              <Trash2 size={14} /> Excluir
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB: Categories Management (Módulo T.I Centralizado) */}
          {activeTab === 'categories' && (
            <div style={styles.tableCard}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                  <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>🏷️ Categorias de Produtos & Módulos</h3>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Gerencie centralidamente as categorias dos produtos de Estoque, Financeiro e RH.
                  </span>
                </div>
                <button onClick={handleOpenCategoryAdd} className="btn btn-primary" style={{ backgroundColor: tenantSettings.themeColor || '#ec4899', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Plus size={16} /> Nova Categoria
                </button>
              </div>

              <table style={styles.table}>
                <thead>
                  <tr>
                    <th>Categoria</th>
                    <th>Módulo</th>
                    <th>Descrição</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {categoriesList.length === 0 ? (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                        Nenhuma categoria cadastrada. Clique em "Nova Categoria" para adicionar.
                      </td>
                    </tr>
                  ) : (
                    categoriesList.map(cat => (
                      <tr key={cat.id}>
                        <td style={{ fontWeight: '600' }}>{cat.name}</td>
                        <td>
                          <span style={{
                            padding: '0.2rem 0.5rem',
                            borderRadius: '4px',
                            fontWeight: '700',
                            fontSize: '0.75rem',
                            backgroundColor: '#e0f2fe',
                            color: '#0369a1'
                          }}>
                            {cat.module || 'Estoque'}
                          </span>
                        </td>
                        <td style={{ color: 'var(--text-secondary)' }}>{cat.description || 'Sem descrição'}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.35rem' }}>
                            <button 
                              onClick={() => handleOpenCategoryEdit(cat)} 
                              className="btn btn-secondary" 
                              style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                              title="Editar Categoria"
                            >
                              <Edit size={13} /> Editar
                            </button>
                            <button 
                              onClick={() => handleDeleteCategory(cat.id)} 
                              className="btn btn-secondary" 
                              style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', backgroundColor: '#fee2e2', color: '#991b1b', border: 'none' }}
                              title="Excluir Categoria"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB: Email Server Configuration (Módulo T.I) */}
          {activeTab === 'email' && (
            <EmailSettingsTab
              emailSettings={emailSettings}
              setEmailSettings={setEmailSettings}
              onSave={handleSaveEmailSettings}
              onTest={handleTestEmail}
              testing={testingEmail}
              testResult={testResult}
              actionLoading={actionLoading}
              emailLogs={emailLogsList}
              themeColor={tenantSettings.themeColor || '#8b5cf6'}
            />
          )}

          {/* TAB: Procedures Catalog (Módulo T.I Centralizado) */}
          {activeTab === 'procedures' && (
            <div style={styles.tableCard}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>📋 Procedimentos</h3>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Catálogo centralizado com parametrização de valores e visibilidade por módulo.
                  </span>
                </div>
                <button 
                  onClick={handleOpenProcedureAdd} 
                  className="btn btn-primary" 
                  style={{ backgroundColor: tenantSettings.themeColor || '#ec4899', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <Plus size={16} /> Novo
                </button>
              </div>

              {/* Filtros e Busca */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                <div style={{ flex: '1', minWidth: '260px' }}>
                  <input
                    type="text"
                    placeholder="Buscar por nome ou código..."
                    className="form-control"
                    value={procedureSearch}
                    onChange={e => setProcedureSearch(e.target.value)}
                    style={{ width: '100%', padding: '0.55rem 0.85rem', fontSize: '0.86rem' }}
                  />
                </div>

                {/* Filtros Rápidos por Módulo (Aprovado) */}
                <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                  {[
                    { id: 'all', label: 'Todos', count: proceduresList.length },
                    { id: 'assist', label: 'Cirurgias', count: proceduresList.filter(p => p.modules?.assist).length },
                    { id: 'medical', label: 'Médico', count: proceduresList.filter(p => p.modules?.medical).length },
                    { id: 'clinical', label: 'Prontuário', count: proceduresList.filter(p => p.modules?.clinical).length },
                    { id: 'apac', label: 'APAC', count: proceduresList.filter(p => p.modules?.apac).length }
                  ].map(f => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setProcedureModuleFilter(f.id)}
                      style={{
                        padding: '0.35rem 0.75rem',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        fontWeight: '700',
                        cursor: 'pointer',
                        border: procedureModuleFilter === f.id ? '1px solid #0284c7' : '1px solid #cbd5e1',
                        backgroundColor: procedureModuleFilter === f.id ? '#0284c7' : '#ffffff',
                        color: procedureModuleFilter === f.id ? '#ffffff' : '#475569',
                        transition: 'all 0.15s'
                      }}
                    >
                      {f.label} ({f.count})
                    </button>
                  ))}
                </div>
              </div>

              {/* Tabela de Procedimentos */}
              <div style={{ overflowX: 'auto' }}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th>Procedimento</th>
                      <th>Código</th>
                      <th>Módulos</th>
                      <th>Valor</th>
                      <th>Situação</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const filtered = proceduresList.filter(p => {
                        if (procedureModuleFilter === 'assist' && !p.modules?.assist) return false;
                        if (procedureModuleFilter === 'medical' && !p.modules?.medical) return false;
                        if (procedureModuleFilter === 'clinical' && !p.modules?.clinical) return false;
                        if (procedureModuleFilter === 'apac' && !p.modules?.apac) return false;

                        if (procedureSearch.trim()) {
                          const term = procedureSearch.trim().toLowerCase();
                          const matchName = (p.name || '').toLowerCase().includes(term);
                          const matchCode = (p.code || '').toLowerCase().includes(term);
                          if (!matchName && !matchCode) return false;
                        }
                        return true;
                      });

                      if (filtered.length === 0) {
                        return (
                          <tr>
                            <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                              Nenhum procedimento encontrado para os filtros selecionados.
                            </td>
                          </tr>
                        );
                      }

                      return filtered.map(proc => (
                        <tr key={proc.id}>
                          <td style={{ fontWeight: '700', color: 'var(--text-primary)' }}>
                            {proc.name}
                          </td>
                          <td>
                            {proc.code ? (
                              <span style={{
                                padding: '0.15rem 0.45rem',
                                borderRadius: '4px',
                                fontSize: '0.74rem',
                                fontFamily: 'monospace',
                                backgroundColor: '#f1f5f9',
                                color: '#475569'
                              }}>
                                {proc.code}
                              </span>
                            ) : (
                              <span style={{ color: '#94a3b8', fontSize: '0.76rem' }}>—</span>
                            )}
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                              {proc.modules?.assist && (
                                <span style={{ padding: '0.15rem 0.45rem', borderRadius: '4px', fontWeight: '700', fontSize: '0.7rem', backgroundColor: '#e0f2fe', color: '#0369a1' }}>
                                  Cirurgias
                                </span>
                              )}
                              {proc.modules?.medical && (
                                <span style={{ padding: '0.15rem 0.45rem', borderRadius: '4px', fontWeight: '700', fontSize: '0.7rem', backgroundColor: '#f3e8ff', color: '#7e22ce' }}>
                                  Médico
                                </span>
                              )}
                              {proc.modules?.clinical && (
                                <span style={{ padding: '0.15rem 0.45rem', borderRadius: '4px', fontWeight: '700', fontSize: '0.7rem', backgroundColor: '#dcfce7', color: '#15803d' }}>
                                  Prontuário
                                </span>
                              )}
                              {proc.modules?.apac && (
                                <span style={{ padding: '0.15rem 0.45rem', borderRadius: '4px', fontWeight: '700', fontSize: '0.7rem', backgroundColor: '#fef3c7', color: '#b45309' }}>
                                  APAC
                                </span>
                              )}
                              {!proc.modules?.assist && !proc.modules?.medical && !proc.modules?.clinical && !proc.modules?.apac && (
                                <span style={{ color: '#94a3b8', fontSize: '0.72rem' }}>Oculto</span>
                              )}
                            </div>
                          </td>
                          <td style={{ fontWeight: '800', color: '#059669', whiteSpace: 'nowrap' }}>
                            R$ {(parseFloat(proc.value) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                          <td>
                            <button
                              type="button"
                              onClick={() => handleToggleProcedureActive(proc)}
                              style={{
                                border: 'none',
                                background: 'none',
                                cursor: 'pointer',
                                padding: 0
                              }}
                              title={proc.active !== false ? 'Clique para desativar' : 'Clique para ativar'}
                            >
                              <span style={{
                                padding: '0.2rem 0.55rem',
                                borderRadius: '12px',
                                fontWeight: '700',
                                fontSize: '0.74rem',
                                backgroundColor: proc.active !== false ? '#dcfce7' : '#f1f5f9',
                                color: proc.active !== false ? '#15803d' : '#64748b'
                              }}>
                                {proc.active !== false ? 'Ativo' : 'Inativo'}
                              </span>
                            </button>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '0.35rem' }}>
                              <button 
                                onClick={() => handleOpenProcedureEdit(proc)} 
                                className="btn btn-secondary" 
                                style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                                title="Editar Procedimento"
                              >
                                <Edit size={13} /> Editar
                              </button>
                              <button 
                                onClick={() => handleDeleteProcedure(proc.id, proc.name)} 
                                className="btn btn-secondary" 
                                style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', backgroundColor: '#fee2e2', color: '#991b1b', border: 'none' }}
                                title="Excluir Procedimento"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ));
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: Integrations & Backup */}
          {activeTab === 'integrations' && (
            <div style={styles.panelGrid}>
              <div style={styles.settingsCard}>
                <h3>🔑 Chaves de Acesso de APIs (Simuladas)</h3>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                  <input type="text" className="form-control" placeholder="Nome do serviço parceiro (ex: SMS)" value={newKeyName} onChange={e => setNewKeyName(e.target.value)} />
                  <button onClick={handleGenerateApiKey} className="btn btn-primary" style={{ backgroundColor: tenantSettings.themeColor || '#ec4899' }}>Gerar Token</button>
                </div>

                <div style={styles.listWrapper}>
                  {apiKeys.map(key => (
                    <div key={key.id} style={styles.listItem}>
                      <div>
                        <strong>{key.name}</strong>
                        <span style={styles.listSubText}>Token: <code>{key.token}</code></span>
                      </div>
                      <span style={styles.listBadge}>Gerada: {key.createdAt}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={styles.settingsCard}>
                <h3>💾 Backup & Recuperação</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <button onClick={handleExportBackup} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', backgroundColor: '#10b981' }}>
                    <Download size={18} /> Exportar Banco (Download JSON)
                  </button>
                  
                  <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '1rem 0' }} />

                  <label style={{ fontWeight: '700' }}>Importar/Restaurar Backup</label>
                  <textarea 
                    className="form-control"
                    placeholder="Cole aqui o conteúdo JSON exportado para restaurar os dados do sistema..."
                    rows={4}
                    value={backupString}
                    onChange={e => setBackupString(e.target.value)}
                    style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}
                  />
                  <button onClick={handleImportBackup} disabled={actionLoading} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', backgroundColor: '#ef4444' }}>
                    <Upload size={18} /> {actionLoading ? 'Restaurando...' : 'Restaurar Dados (Sobrescrever local)'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: Logs */}
          {activeTab === 'logs' && (
            <div style={styles.tableCard}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Operador</th>
                    <th>Ação</th>
                    <th>Detalhes</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.slice().reverse().map((log) => (
                    <tr key={log.id}>
                      <td style={{ whiteSpace: 'nowrap' }}>{new Date(log.date).toLocaleString('pt-BR')}</td>
                      <td style={{ fontWeight: '600' }}>{log.operator}</td>
                      <td>
                        <span style={{ 
                          padding: '0.2rem 0.5rem', 
                          borderRadius: '4px', 
                          fontSize: '0.7rem', 
                          fontWeight: '700', 
                          backgroundColor: '#f1f5f9', 
                          color: '#475569' 
                        }}>{log.action}</span>
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* User administration Modal */}
      {showUserModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <div style={styles.modalHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(236, 72, 153, 0.1)',
                  color: tenantSettings.themeColor || '#ec4899',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Shield size={20} />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.1rem', fontWeight: '700', margin: 0, color: 'var(--text-primary)' }}>
                    {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
                  </h2>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                    {editingUser ? 'Atualize os dados e privilégios de acesso ao sistema' : 'Cadastre uma nova credencial de operador'}
                  </p>
                </div>
              </div>
              <button onClick={() => setShowUserModal(false)} style={styles.modalCloseBtn}><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSaveUser} style={styles.modalForm}>
              <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.35rem', display: 'block', color: 'var(--text-primary)' }}>Nome Completo *</label>
                <input type="text" className="form-control" required placeholder="Nome e Sobrenome" value={userForm.name} onChange={e => setUserForm({ ...userForm, name: e.target.value })} style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: '#ffffff', color: 'var(--text-primary)', fontSize: '0.875rem' }} />
              </div>
              
              <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.35rem', display: 'block', color: 'var(--text-primary)' }}>Email de Login *</label>
                <input type="email" className="form-control" required disabled={editingUser !== null} placeholder="usuario@clinica.com" value={userForm.email} onChange={e => setUserForm({ ...userForm, email: e.target.value })} style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: editingUser !== null ? '#f1f5f9' : '#ffffff', color: 'var(--text-primary)', fontSize: '0.875rem' }} />
              </div>
              
              <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.35rem', display: 'block', color: 'var(--text-primary)' }}>Funcionário</label>
                <select className="form-control" value={userForm.employeeId} onChange={e => setUserForm({ ...userForm, employeeId: e.target.value })} style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: '#ffffff', color: 'var(--text-primary)', fontSize: '0.875rem' }}>
                  <option value="">Não vincular a funcionário</option>
                  {employees
                    .slice()
                    .sort((a, b) => (a.name || '').localeCompare(b.name || '', 'pt-BR', { sensitivity: 'base' }))
                    .map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.name}</option>
                    ))}
                </select>
              </div>
              
              <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.35rem', display: 'block', color: 'var(--text-primary)' }}>Perfil *</label>
                <select className="form-control" required value={userForm.role} onChange={e => setUserForm({ ...userForm, role: e.target.value })} style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: '#ffffff', color: 'var(--text-primary)', fontSize: '0.875rem' }}>
                  {profiles.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.35rem', display: 'block', color: 'var(--text-primary)' }}>Filial *</label>
                <select 
                  className="form-control" 
                  required 
                  value={userForm.primaryUnit || 'betim'} 
                  onChange={e => {
                    const u = e.target.value;
                    setUserForm({ 
                      ...userForm, 
                      primaryUnit: u,
                      allowedUnits: u === 'all' ? ['all', 'betim', 'taguatinga'] : [u]
                    });
                  }} 
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: '#ffffff', color: 'var(--text-primary)', fontSize: '0.875rem' }}
                >
                  <option value="betim">🏢 Unidade Betim - MG</option>
                  <option value="taguatinga">🏢 Unidade Taguatinga - DF</option>
                  <option value="all">🌐 Todas as Unidades (Acesso Global)</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.35rem', display: 'block', color: 'var(--text-primary)' }}>
                  {editingUser ? 'Nova Senha (deixe em branco para manter a atual)' : 'Senha de Acesso Inicial'}
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder={editingUser ? "Digite a nova senha de login" : "Ex: MinhaSenha123"} 
                    value={userForm.password} 
                    onChange={e => setUserForm({ ...userForm, password: e.target.value })} 
                    style={{ flex: 1, padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: '#ffffff', color: 'var(--text-primary)', fontSize: '0.875rem' }} 
                  />
                  {editingUser && (
                    <button 
                      type="button" 
                      onClick={() => handleGenerateTempPassword(editingUser)}
                      disabled={actionLoading}
                      className="btn btn-outline"
                      title="Gerar Senha Temporária Dinâmica"
                      style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', fontWeight: '600', color: '#f59e0b', borderColor: '#f59e0b', cursor: 'pointer', whiteSpace: 'nowrap' }}
                    >
                      <RefreshCw size={14} /> Gerar Temporária
                    </button>
                  )}
                </div>
              </div>

              {generatedTempPass && (
                <div style={{ ...styles.alert, backgroundColor: '#fef3c7', color: '#92400e', border: '1px solid #f59e0b', marginBottom: '0.75rem' }}>
                  <KeyRound size={16} />
                  <span>Senha Temporária Salva na Nuvem: <strong>{generatedTempPass}</strong></span>
                </div>
              )}
              
              <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.35rem', display: 'block', color: 'var(--text-primary)' }}>Status</label>
                <select className="form-control" value={userForm.status} onChange={e => setUserForm({ ...userForm, status: e.target.value })} style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: '#ffffff', color: 'var(--text-primary)', fontSize: '0.875rem' }}>
                  <option value="active">Ativo (Permitir Login)</option>
                  <option value="inactive">Inativo (Bloquear Login)</option>
                </select>
              </div>

              <div style={styles.modalFooter}>
                <button type="button" onClick={() => setShowUserModal(false)} className="btn btn-secondary" style={{ padding: '0.55rem 1.25rem', borderRadius: '8px', fontWeight: '600', fontSize: '0.875rem', cursor: 'pointer' }}>Cancelar</button>
                <button type="submit" disabled={actionLoading} className="btn btn-primary" style={{ backgroundColor: tenantSettings.themeColor || '#ec4899', color: '#ffffff', padding: '0.55rem 1.25rem', borderRadius: '8px', fontWeight: '600', fontSize: '0.875rem', border: 'none', cursor: 'pointer' }}>
                  {actionLoading ? 'Salvando...' : 'Gravar Acesso'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock Location Modal (Módulo T.I) */}
      {showLocationModal && (
        <div style={styles.modalOverlay}>
          <div style={{ ...styles.modalCard, maxWidth: '500px' }}>
            <div style={styles.modalHeader}>
              <div>
                <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>{editingLocation ? 'Editar Local' : 'Cadastrar Local'}</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Defina os locais físicos e almoxarifados da clínica.</span>
              </div>
              <button onClick={() => setShowLocationModal(false)} style={styles.modalCloseBtn}><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSaveLocation} style={styles.modalForm}>
              <div className="form-group" style={{ marginBottom: '0.85rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.35rem', display: 'block', color: 'var(--text-primary)' }}>Local *</label>
                <input 
                  type="text" 
                  className="form-control" 
                  required 
                  placeholder="Ex: Almoxarifado Central, Farmácia UTI, Centro Cirúrgico" 
                  value={locationForm.name} 
                  onChange={e => setLocationForm({ ...locationForm, name: e.target.value })} 
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: '#ffffff', color: 'var(--text-primary)', fontSize: '0.875rem' }} 
                />
              </div>

              <div className="form-group" style={{ marginBottom: '0.85rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.35rem', display: 'block', color: 'var(--text-primary)' }}>Responsável</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Ex: Dra. Maria (Farmacêutica)" 
                  value={locationForm.responsible} 
                  onChange={e => setLocationForm({ ...locationForm, responsible: e.target.value })} 
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: '#ffffff', color: 'var(--text-primary)', fontSize: '0.875rem' }} 
                />
              </div>

              <div className="form-group" style={{ marginBottom: '0.85rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.35rem', display: 'block', color: 'var(--text-primary)' }}>Status</label>
                <select 
                  className="form-control" 
                  value={locationForm.status} 
                  onChange={e => setLocationForm({ ...locationForm, status: e.target.value })} 
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: '#ffffff', color: 'var(--text-primary)', fontSize: '0.875rem' }}
                >
                  <option value="Ativo">Ativo</option>
                  <option value="Inativo">Inativo</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: '0.85rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.35rem', display: 'block', color: 'var(--text-primary)' }}>Descrição</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Ex: Depósito de medicamentos controlados e insumos da hemodiálise" 
                  value={locationForm.description} 
                  onChange={e => setLocationForm({ ...locationForm, description: e.target.value })} 
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: '#ffffff', color: 'var(--text-primary)', fontSize: '0.875rem' }} 
                />
              </div>

              <div style={styles.modalFooter}>
                <button type="button" onClick={() => setShowLocationModal(false)} className="btn btn-secondary" style={{ padding: '0.55rem 1.25rem', borderRadius: '8px', fontWeight: '600', fontSize: '0.875rem', cursor: 'pointer' }}>Cancelar</button>
                <button type="submit" disabled={actionLoading} className="btn btn-primary" style={{ backgroundColor: tenantSettings.themeColor || '#ec4899', color: '#ffffff', padding: '0.55rem 1.25rem', borderRadius: '8px', fontWeight: '600', fontSize: '0.875rem', border: 'none', cursor: 'pointer' }}>
                  {actionLoading ? 'Salvando...' : (editingLocation ? 'Salvar Alterações' : 'Cadastrar Local')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Modal (Módulo T.I) */}
      {showCategoryModal && (
        <div style={styles.modalOverlay}>
          <div style={{ ...styles.modalCard, maxWidth: '500px' }}>
            <div style={styles.modalHeader}>
              <div>
                <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>{editingCategory ? 'Editar Categoria' : 'Cadastrar Categoria'}</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Defina o nome e o módulo de aplicação da categoria.</span>
              </div>
              <button onClick={() => setShowCategoryModal(false)} style={styles.modalCloseBtn}><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSaveCategory} style={styles.modalForm}>
              <div className="form-group" style={{ marginBottom: '0.85rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.35rem', display: 'block', color: 'var(--text-primary)' }}>Categoria *</label>
                <input 
                  type="text" 
                  className="form-control" 
                  required 
                  placeholder="Ex: Dialisadores, Medicamentos, Informática" 
                  value={categoryForm.name} 
                  onChange={e => setCategoryForm({ ...categoryForm, name: e.target.value })} 
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: '#ffffff', color: 'var(--text-primary)', fontSize: '0.875rem' }} 
                />
              </div>

              <div className="form-group" style={{ marginBottom: '0.85rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.35rem', display: 'block', color: 'var(--text-primary)' }}>Módulo *</label>
                <select 
                  className="form-control" 
                  required 
                  value={categoryForm.module} 
                  onChange={e => setCategoryForm({ ...categoryForm, module: e.target.value })} 
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: '#ffffff', color: 'var(--text-primary)', fontSize: '0.875rem' }}
                >
                  <option value="Estoque">Estoque</option>
                  <option value="Financeiro">Financeiro</option>
                  <option value="RH">RH</option>
                  <option value="T.I">TI</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: '0.85rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.35rem', display: 'block', color: 'var(--text-primary)' }}>Descrição</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Ex: Produtos consumíveis da sala de hemodiálise" 
                  value={categoryForm.description} 
                  onChange={e => setCategoryForm({ ...categoryForm, description: e.target.value })} 
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: '#ffffff', color: 'var(--text-primary)', fontSize: '0.875rem' }} 
                />
              </div>

              <div style={styles.modalFooter}>
                <button type="button" onClick={() => setShowCategoryModal(false)} className="btn btn-secondary" style={{ padding: '0.55rem 1.25rem', borderRadius: '8px', fontWeight: '600', fontSize: '0.875rem', cursor: 'pointer' }}>Cancelar</button>
                <button type="submit" disabled={actionLoading} className="btn btn-primary" style={{ backgroundColor: tenantSettings.themeColor || '#ec4899', color: '#ffffff', padding: '0.55rem 1.25rem', borderRadius: '8px', fontWeight: '600', fontSize: '0.875rem', border: 'none', cursor: 'pointer' }}>
                  {actionLoading ? 'Salvando...' : (editingCategory ? 'Salvar Categoria' : 'Cadastrar Categoria')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Cadastro e Edição de Procedimentos (Módulo T.I) */}
      {showProcedureModal && (
        <div style={styles.modalOverlay}>
          <div style={{ ...styles.modalCard, maxWidth: '520px' }}>
            <div style={styles.modalHeader}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                {editingProcedure ? 'Editar Procedimento' : 'Novo Procedimento'}
              </h3>
              <button onClick={() => setShowProcedureModal(false)} style={styles.modalCloseBtn}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveProcedure} style={styles.modalForm}>
              <div className="form-group" style={{ marginBottom: '0.85rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.35rem', display: 'block', color: 'var(--text-primary)' }}>
                  Nome *
                </label>
                <input 
                  type="text" 
                  className="form-control" 
                  required 
                  placeholder="Ex: CONFECÇÃO DE FAV SIMPLES" 
                  value={procedureForm.name} 
                  onChange={e => setProcedureForm({ ...procedureForm, name: e.target.value })} 
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: '#ffffff', color: 'var(--text-primary)', fontSize: '0.875rem' }} 
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '0.85rem' }}>
                <div className="form-group">
                  <label style={{ fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.35rem', display: 'block', color: 'var(--text-primary)' }}>
                    Código
                  </label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Ex: 04.06.01.001-5" 
                    value={procedureForm.code} 
                    onChange={e => setProcedureForm({ ...procedureForm, code: e.target.value })} 
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: '#ffffff', color: 'var(--text-primary)', fontSize: '0.875rem' }} 
                  />
                </div>

                <div className="form-group">
                  <label style={{ fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.35rem', display: 'block', color: 'var(--text-primary)' }}>
                    Valor *
                  </label>
                  <input 
                    type="number" 
                    step="0.01" 
                    min="0" 
                    required 
                    placeholder="0,00" 
                    value={procedureForm.value} 
                    onChange={e => setProcedureForm({ ...procedureForm, value: e.target.value })} 
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: '#ffffff', color: 'var(--text-primary)', fontSize: '0.875rem' }} 
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.35rem', display: 'block', color: 'var(--text-primary)' }}>
                  Situação
                </label>
                <select 
                  className="form-control" 
                  value={procedureForm.active ? 'active' : 'inactive'} 
                  onChange={e => setProcedureForm({ ...procedureForm, active: e.target.value === 'active' })} 
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: '#ffffff', color: 'var(--text-primary)', fontSize: '0.875rem' }}
                >
                  <option value="active">Ativo</option>
                  <option value="inactive">Inativo</option>
                </select>
              </div>

              {/* Marcação de Onde Deve Aparecer (Módulos) */}
              <div style={{ backgroundColor: '#f8fafc', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '1.25rem' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: '700', color: '#1e293b', marginBottom: '8px', display: 'block' }}>
                  Onde deve aparecer:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.84rem', color: '#334155', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={procedureForm.modules?.assist} 
                      onChange={e => setProcedureForm({
                        ...procedureForm,
                        modules: { ...procedureForm.modules, assist: e.target.checked }
                      })}
                      style={{ accentColor: '#0284c7' }}
                    />
                    <span>Cirurgias (NexaASSIST)</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.84rem', color: '#334155', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={procedureForm.modules?.medical} 
                      onChange={e => setProcedureForm({
                        ...procedureForm,
                        modules: { ...procedureForm.modules, medical: e.target.checked }
                      })}
                      style={{ accentColor: '#7e22ce' }}
                    />
                    <span>Médico (NexaMED)</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.84rem', color: '#334155', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={procedureForm.modules?.clinical} 
                      onChange={e => setProcedureForm({
                        ...procedureForm,
                        modules: { ...procedureForm.modules, clinical: e.target.checked }
                      })}
                      style={{ accentColor: '#15803d' }}
                    />
                    <span>Prontuário (NexaCLINIC)</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.84rem', color: '#334155', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={procedureForm.modules?.apac} 
                      onChange={e => setProcedureForm({
                        ...procedureForm,
                        modules: { ...procedureForm.modules, apac: e.target.checked }
                      })}
                      style={{ accentColor: '#b45309' }}
                    />
                    <span>APAC (Faturamento)</span>
                  </label>
                </div>
              </div>

              <div style={styles.modalFooter}>
                <button 
                  type="button" 
                  onClick={() => setShowProcedureModal(false)} 
                  className="btn btn-secondary" 
                  style={{ padding: '0.55rem 1.25rem', borderRadius: '8px', fontWeight: '600', fontSize: '0.875rem', cursor: 'pointer' }}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={actionLoading} 
                  className="btn btn-primary" 
                  style={{ backgroundColor: tenantSettings.themeColor || '#ec4899', color: '#ffffff', padding: '0.55rem 1.25rem', borderRadius: '8px', fontWeight: '600', fontSize: '0.875rem', border: 'none', cursor: 'pointer' }}
                >
                  {actionLoading ? 'Salvando...' : 'Salvar'}
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
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    transition: 'all 0.2s',
  },
  tabBtnActive: {
    color: 'var(--primary-color)',
    borderBottomColor: 'var(--primary-color)',
  },
  alert: {
    padding: '0.75rem 1rem',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.875rem',
  },
  loadingBox: {
    padding: '3rem',
    textAlign: 'center',
    color: 'var(--text-secondary)',
    fontSize: '1.1rem',
  },
  panelGrid: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: '1.5rem',
  },
  settingsCard: {
    backgroundColor: 'var(--bg-card)',
    borderRadius: '8px',
    border: '1px solid var(--border-color)',
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
  },
  formRow: {
    display: 'flex',
    gap: '1rem',
  },
  tableCard: {
    backgroundColor: 'var(--bg-card)',
    borderRadius: '8px',
    border: '1px solid var(--border-color)',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
    overflow: 'hidden',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.875rem',
  },
  noDataCell: {
    padding: '2rem',
    textAlign: 'center',
    color: 'var(--text-muted)',
  },
  actionEditBtn: {
    background: 'none',
    border: 'none',
    color: '#8b5cf6',
    fontWeight: '700',
    cursor: 'pointer',
    fontSize: '0.8rem',
  },
  kpiCard: {
    backgroundColor: 'var(--bg-card)',
    padding: '1.25rem',
    borderRadius: '8px',
    border: '1px solid var(--border-color)',
    borderLeftWidth: '5px',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
  },
  kpiLabel: {
    fontSize: '0.75rem',
    textTransform: 'uppercase',
    color: 'var(--text-secondary)',
    fontWeight: '700',
    letterSpacing: '0.05em',
  },
  kpiVal: {
    fontSize: '1.75rem',
    fontWeight: '800',
    color: 'var(--text-primary)',
    marginTop: '0.25rem',
  },
  addBtn: {
    backgroundColor: 'var(--primary-color)',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    padding: '0.5rem 1rem',
    fontWeight: '600',
    fontSize: '0.875rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
  },
  listWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  listItem: {
    backgroundColor: 'var(--bg-body)',
    borderRadius: '6px',
    padding: '0.75rem',
    border: '1px solid var(--border-color)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listSubText: {
    display: 'block',
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
    marginTop: '0.25rem',
  },
  listBadge: {
    fontSize: '0.7rem',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    backgroundColor: 'rgba(236,72,153,0.1)',
    color: '#ec4899',
    fontWeight: '700',
  },
  modalOverlay: {
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
    padding: '1rem',
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '520px',
    maxHeight: '92vh',
    overflow: 'hidden',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)',
    border: '1px solid var(--border-color)',
    display: 'flex',
    flexDirection: 'column',
  },
  modalHeader: {
    padding: '1.15rem 1.35rem',
    borderBottom: '1px solid var(--border-color)',
    backgroundColor: '#ffffff',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexShrink: 0,
  },
  modalCloseBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--text-muted)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4px',
    borderRadius: '50%',
  },
  modalForm: {
    padding: '1.25rem 1.35rem',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflowY: 'auto',
    minHeight: 0,
    backgroundColor: '#ffffff',
  },
  modalFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.75rem',
    marginTop: '0.75rem',
    paddingTop: '0.85rem',
    borderTop: '1px solid var(--border-color)',
    position: 'sticky',
    bottom: 0,
    backgroundColor: '#ffffff',
    zIndex: 5,
    flexShrink: 0,
  }
};
