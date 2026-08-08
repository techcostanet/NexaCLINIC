import React, { useState, useEffect } from 'react';
import { dbService } from '../firebase';
import { 
  Settings, Users, Shield, Globe, Database, Key, Check, Plus, X, 
  Trash2, ShieldAlert, CheckCircle2, Copy, Download, Upload, Palette,
  ListFilter, Edit, Warehouse, KeyRound, RefreshCw
} from 'lucide-react';

export default function ConfigPanel() {
  const [activeTab, setActiveTab] = useState('branding'); // 'branding' | 'profiles' | 'users' | 'locations' | 'categories' | 'integrations' | 'logs'
  
  // Data States
  const [tenantSettings, setTenantSettings] = useState({ name: '', cnpj: '', logo: '', themeColor: '#ec4899' });
  const [profiles, setProfiles] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [stockLocations, setStockLocations] = useState([]);
  
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
      const [settings, profileList, users, empList, logs, catList, locList] = await Promise.all([
        dbService.getTenantSettings(),
        dbService.getUserProfiles(),
        dbService.getUsers(),
        dbService.getEmployees(),
        dbService.getAuditLogs(),
        dbService.getProductCategories ? dbService.getProductCategories() : [],
        dbService.getStockLocations ? dbService.getStockLocations() : []
      ]);
      setTenantSettings(settings);
      setProfiles(profileList);
      setUsersList(users);
      setEmployees(empList);
      setAuditLogs(logs);
      setCategoriesList(catList);
      setStockLocations(locList);

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
      status: 'active'
    });
    setShowUserModal(true);
  };

  const handleOpenUserEdit = (user) => {
    setEditingUser(user);
    setTempPasswordMessage('');
    setUserForm({
      name: user.name || '',
      email: user.email || '',
      role: user.role || 'reception',
      employeeId: user.employeeId || '',
      status: user.status || 'active'
    });
    setShowUserModal(true);
  };

  const handleGenerateTempPassword = async (user) => {
    const targetUser = user || editingUser;
    if (!targetUser) return;
    setActionLoading(true);
    try {
      const tempPass = await dbService.generateTempPassword(targetUser.uid);
      setGeneratedTempPass(tempPass);
      showAlert(`Senha temporária gerada e salva no banco cloud para ${targetUser.name}!`, 'success');
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
    setActionLoading(true);
    try {
      if (editingUser) {
        await dbService.updateUser(editingUser.uid, userForm);
        if (userForm.password) {
          await dbService.updateUserPassword(editingUser.uid, userForm.password);
        }
        showAlert(`Acesso de "${userForm.name}" gravado com sucesso no banco cloud!`, 'success');
        logAudit('Modificação de Usuário', `Usuário ${userForm.email} editado. Status: ${userForm.status}, Perfil: ${userForm.role}`);
        setShowUserModal(false);
      } else {
        const tempPass = userForm.password || Math.random().toString(36).substring(2, 10);
        const res = await dbService.createUser(userForm.email, userForm.name, userForm.role, []);
        // Get created user to update employeeId, password & status
        const updatedUsers = await dbService.getUsers();
        const created = updatedUsers.find(u => (u.email || '').toLowerCase() === userForm.email.toLowerCase());
        if (created) {
          await dbService.updateUser(created.uid, {
            employeeId: userForm.employeeId,
            status: userForm.status,
            password: tempPass
          });
        }
        const msg = res?.isExisting
          ? `O e-mail "${userForm.email}" já possuía cadastro de login na autenticação. O perfil e a senha de "${userForm.name}" foram sincronizados na nuvem!`
          : `Usuário criado com sucesso! Senha configurada na nuvem: ${tempPass}`;
        setTempPasswordMessage(msg);
        setGeneratedTempPass(tempPass);
        logAudit('Criação de Usuário', `Usuário de login ${userForm.email} salvo sob perfil ${userForm.role}.`);
      }
      fetchData();
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

  return (
    <div style={styles.container}>
      <div style={styles.cardHeader}>
        <div>
          <h1 style={styles.title}>NexaCONFIG - Portal de Administração & T.I.</h1>
          <p style={styles.subtitle}>Gerenciamento de marcas da clínica (SaaS), controle de acesso por perfis de segurança (RBAC), chaves de API e backups do banco.</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={styles.tabsWrapper}>
        <button onClick={() => setActiveTab('branding')} style={{ ...styles.tabBtn, ...(activeTab === 'branding' ? styles.tabBtnActive : {}) }}>
          <Palette size={16} /> Personalização & Branding
        </button>
        <button onClick={() => setActiveTab('profiles')} style={{ ...styles.tabBtn, ...(activeTab === 'profiles' ? styles.tabBtnActive : {}) }}>
          <Shield size={16} /> Perfis & Permissões (RBAC)
        </button>
        <button onClick={() => setActiveTab('users')} style={{ ...styles.tabBtn, ...(activeTab === 'users' ? styles.tabBtnActive : {}) }}>
          <Users size={16} /> Usuários do Sistema ({usersList.length})
        </button>
        <button onClick={() => setActiveTab('locations')} style={{ ...styles.tabBtn, ...(activeTab === 'locations' ? styles.tabBtnActive : {}) }}>
          <Warehouse size={16} /> Locais de Estoque ({stockLocations.length})
        </button>
        <button onClick={() => setActiveTab('categories')} style={{ ...styles.tabBtn, ...(activeTab === 'categories' ? styles.tabBtnActive : {}) }}>
          <ListFilter size={16} /> Categorias do Sistema ({categoriesList.length})
        </button>
        <button onClick={() => setActiveTab('integrations')} style={{ ...styles.tabBtn, ...(activeTab === 'integrations' ? styles.tabBtnActive : {}) }}>
          <Key size={16} /> Integrações & Backups
        </button>
        <button onClick={() => setActiveTab('logs')} style={{ ...styles.tabBtn, ...(activeTab === 'logs' ? styles.tabBtnActive : {}) }}>
          <ShieldAlert size={16} /> Segurança & Logs de T.I.
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
              { key: 'index', label: 'BI & Qualidade (INDEX)' },
              { key: 'reception', label: 'Recepção & Cadastro' },
              { key: 'clinical', label: 'Prontuário & Clínico' },
              { key: 'calendar', label: 'Agenda & Consultas' },
              { key: 'stock', label: 'Estoque & Farmácia' },
              { key: 'purchasing', label: 'Compras & Cotações' },
              { key: 'requisitions', label: 'Requisições (Salão)' },
              { key: 'apac', label: 'APACs & Faturamento' },
              { key: 'finance', label: 'Módulo Financeiro' },
              { key: 'hr', label: 'Recursos Humanos (RH)' },
              { key: 'config', label: 'Configurações T.I.' }
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
                        <th style={{ minWidth: '180px' }}>Perfil / Função</th>
                        {rbacModules.map(m => (
                          <th key={m.key} style={{ minWidth: '140px', textAlign: 'center' }}>{m.label}</th>
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
                                  <option value="write">Escrita / Full</option>
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
                      <th>Operador / Usuário</th>
                      <th>Email de Login</th>
                      <th>Perfil / Permissão</th>
                      <th>Vínculo Funcionário</th>
                      <th>Status da Conta</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersList.map((user) => {
                      const emp = employees.find(e => e.id === user.employeeId);
                      const profile = profiles.find(p => p.id === user.role);

                      return (
                        <tr key={user.uid}>
                          <td style={{ fontWeight: '600' }}>{user.name}</td>
                          <td>{user.email}</td>
                          <td>
                            <span style={{ 
                              padding: '0.2rem 0.5rem', 
                              borderRadius: '12px', 
                              fontSize: '0.75rem', 
                              fontWeight: '700',
                              backgroundColor: user.role === 'admin' ? '#fee2e2' : '#f1f5f9',
                              color: user.role === 'admin' ? '#991b1b' : '#475569'
                            }}>
                              {profile ? profile.name : user.role}
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
                    <th>Nome do Local</th>
                    <th>Descrição / Aplicação</th>
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
                    <th>Nome da Categoria</th>
                    <th>Módulo Destino</th>
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
                    <th>Data/Hora</th>
                    <th>Operador</th>
                    <th>Ação realizada</th>
                    <th>Detalhes da Operação</th>
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
                    {editingUser ? 'Editar Acesso do Usuário' : 'Criar Novo Usuário'}
                  </h2>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                    {editingUser ? 'Atualize os dados e privilégios de acesso ao sistema' : 'Cadastre uma nova credencial de operador'}
                  </p>
                </div>
              </div>
              <button onClick={() => setShowUserModal(false)} style={styles.modalCloseBtn}><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSaveUser} style={styles.modalForm}>
              {tempPasswordMessage ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '0.5rem 0' }}>
                  <div style={{ ...styles.alert, backgroundColor: 'var(--success-light)', color: 'var(--success-color)', border: '1px solid var(--success-color)' }}>
                    <CheckCircle2 size={18} />
                    <span>{tempPasswordMessage}</span>
                  </div>
                  <button type="button" onClick={() => setShowUserModal(false)} className="btn btn-primary" style={{ backgroundColor: tenantSettings.themeColor || '#ec4899', color: '#ffffff', width: '100%', padding: '0.6rem', borderRadius: '6px', fontWeight: '600' }}>Fechar</button>
                </div>
              ) : (
                <>
                  <div className="form-group" style={{ marginBottom: '0.85rem' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.35rem', display: 'block', color: 'var(--text-primary)' }}>Nome Completo *</label>
                    <input type="text" className="form-control" required placeholder="Nome e Sobrenome" value={userForm.name} onChange={e => setUserForm({ ...userForm, name: e.target.value })} style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: '#ffffff', color: 'var(--text-primary)', fontSize: '0.875rem' }} />
                  </div>
                  
                  <div className="form-group" style={{ marginBottom: '0.85rem' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.35rem', display: 'block', color: 'var(--text-primary)' }}>Email de Login *</label>
                    <input type="email" className="form-control" required disabled={editingUser !== null} placeholder="usuario@clinica.com" value={userForm.email} onChange={e => setUserForm({ ...userForm, email: e.target.value })} style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: editingUser !== null ? '#f1f5f9' : '#ffffff', color: 'var(--text-primary)', fontSize: '0.875rem' }} />
                  </div>
                  
                  <div className="form-group" style={{ marginBottom: '0.85rem' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.35rem', display: 'block', color: 'var(--text-primary)' }}>Vincular a Funcionário Físico</label>
                    <select className="form-control" value={userForm.employeeId} onChange={e => setUserForm({ ...userForm, employeeId: e.target.value })} style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: '#ffffff', color: 'var(--text-primary)', fontSize: '0.875rem' }}>
                      <option value="">Não vincular a funcionário</option>
                      {employees.map(emp => (
                        <option key={emp.id} value={emp.id}>{emp.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-group" style={{ marginBottom: '0.85rem' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.35rem', display: 'block', color: 'var(--text-primary)' }}>Perfil de Permissão *</label>
                    <select className="form-control" required value={userForm.role} onChange={e => setUserForm({ ...userForm, role: e.target.value })} style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: '#ffffff', color: 'var(--text-primary)', fontSize: '0.875rem' }}>
                      {profiles.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group" style={{ marginBottom: '0.85rem' }}>
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
                        style={{ flex: 1, padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: '#ffffff', color: 'var(--text-primary)', fontSize: '0.875rem' }} 
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
                    <div style={{ ...styles.alert, backgroundColor: '#fef3c7', color: '#92400e', border: '1px solid #f59e0b', marginBottom: '0.85rem' }}>
                      <KeyRound size={16} />
                      <span>Senha Temporária Atual Salva na Nuvem: <strong>{generatedTempPass}</strong></span>
                    </div>
                  )}
                  
                  <div className="form-group" style={{ marginBottom: '0.85rem' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.35rem', display: 'block', color: 'var(--text-primary)' }}>Status de Login</label>
                    <select className="form-control" value={userForm.status} onChange={e => setUserForm({ ...userForm, status: e.target.value })} style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: '#ffffff', color: 'var(--text-primary)', fontSize: '0.875rem' }}>
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
                </>
              )}
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
                <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>{editingLocation ? 'Editar Local de Estoque' : 'Cadastrar Local de Estoque'}</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Defina os locais físicos e almoxarifados da clínica.</span>
              </div>
              <button onClick={() => setShowLocationModal(false)} style={styles.modalCloseBtn}><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSaveLocation} style={styles.modalForm}>
              <div className="form-group" style={{ marginBottom: '0.85rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.35rem', display: 'block', color: 'var(--text-primary)' }}>Nome do Local / Almoxarifado *</label>
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
                <label style={{ fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.35rem', display: 'block', color: 'var(--text-primary)' }}>Responsável pelo Local</label>
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
                <label style={{ fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.35rem', display: 'block', color: 'var(--text-primary)' }}>Descrição / Observações</label>
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
                <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>{editingCategory ? 'Editar Categoria' : 'Cadastrar Nova Categoria'}</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Defina o nome e o módulo de aplicação da categoria.</span>
              </div>
              <button onClick={() => setShowCategoryModal(false)} style={styles.modalCloseBtn}><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSaveCategory} style={styles.modalForm}>
              <div className="form-group" style={{ marginBottom: '0.85rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.35rem', display: 'block', color: 'var(--text-primary)' }}>Nome da Categoria *</label>
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
                <label style={{ fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.35rem', display: 'block', color: 'var(--text-primary)' }}>Módulo de Aplicação *</label>
                <select 
                  className="form-control" 
                  required 
                  value={categoryForm.module} 
                  onChange={e => setCategoryForm({ ...categoryForm, module: e.target.value })} 
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: '#ffffff', color: 'var(--text-primary)', fontSize: '0.875rem' }}
                >
                  <option value="Estoque">Estoque / Farmácia</option>
                  <option value="Financeiro">Financeiro / Contas</option>
                  <option value="RH">Recursos Humanos (RH)</option>
                  <option value="T.I">T.I / Geral</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: '0.85rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.35rem', display: 'block', color: 'var(--text-primary)' }}>Descrição / Finalidade</label>
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
    overflow: 'hidden',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)',
    border: '1px solid var(--border-color)',
    display: 'flex',
    flexDirection: 'column',
  },
  modalHeader: {
    padding: '1.25rem 1.5rem',
    borderBottom: '1px solid var(--border-color)',
    backgroundColor: '#ffffff',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    backgroundColor: '#ffffff',
  },
  modalFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.75rem',
    marginTop: '1rem',
    paddingTop: '1rem',
    borderTop: '1px solid var(--border-color)',
  }
};
