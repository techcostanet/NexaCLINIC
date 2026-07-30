import React, { useState, useEffect } from 'react';
import { dbService } from '../firebase';
import { 
  Settings, Users, Shield, Globe, Database, Key, Check, Plus, X, 
  Trash2, ShieldAlert, CheckCircle2, Copy, Download, Upload, Palette
} from 'lucide-react';

export default function ConfigPanel() {
  const [activeTab, setActiveTab] = useState('branding'); // 'branding' | 'profiles' | 'users' | 'logs' | 'integrations'
  
  // Data States
  const [tenantSettings, setTenantSettings] = useState({ name: '', cnpj: '', logo: '', themeColor: '#ec4899' });
  const [profiles, setProfiles] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  
  // Actions loading
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  
  // User Form
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [tempPasswordMessage, setTempPasswordMessage] = useState('');
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
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
      const [settings, profileList, users, empList, logs] = await Promise.all([
        dbService.getTenantSettings(),
        dbService.getUserProfiles(),
        dbService.getUsers(),
        dbService.getEmployees(),
        dbService.getAuditLogs()
      ]);
      setTenantSettings(settings);
      setProfiles(profileList);
      setUsersList(users);
      setEmployees(empList);
      setAuditLogs(logs);

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

  const handleSaveUser = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      if (editingUser) {
        await dbService.updateUser(editingUser.uid, userForm);
        showAlert(`Acesso de "${userForm.name}" gravado!`, 'success');
        logAudit('Modificação de Usuário', `Usuário ${userForm.email} editado. Status: ${userForm.status}, Perfil: ${userForm.role}`);
        setShowUserModal(false);
      } else {
        const tempPass = Math.random().toString(36).substring(2, 10);
        await dbService.createUser(userForm.email, userForm.name, userForm.role, []);
        // Get created user to update employeeId & status if set
        const updatedUsers = await dbService.getUsers();
        const created = updatedUsers.find(u => u.email === userForm.email);
        if (created) {
          await dbService.updateUser(created.uid, {
            employeeId: userForm.employeeId,
            status: userForm.status
          });
        }
        setTempPasswordMessage(`Usuário criado! Senha temporária gerada: ${tempPass}`);
        logAudit('Criação de Usuário', `Usuário de login ${userForm.email} criado sob perfil ${userForm.role}.`);
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
          {activeTab === 'profiles' && (
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
                      <th>Perfil / Função</th>
                      <th>BI (INDEX)</th>
                      <th>Atendimento (Recepção)</th>
                      <th>Prontuário (Clínico)</th>
                      <th>Estoque & Farmácia</th>
                      <th>Financeiro (Faturamento)</th>
                      <th>Recursos Humanos (RH)</th>
                      <th>Configurações T.I.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {profiles.map(p => (
                      <tr key={p.id}>
                        <td style={{ fontWeight: '700' }}>{p.name}</td>
                        {['index', 'reception', 'clinical', 'stock', 'finance', 'hr', 'config'].map(modKey => (
                          <td key={modKey}>
                            <select 
                              className="form-control"
                              value={p.permissions[modKey] || 'none'}
                              onChange={e => handlePermissionChange(p.id, modKey, e.target.value)}
                              style={{ 
                                fontSize: '0.8rem', 
                                padding: '0.2rem 0.5rem', 
                                border: '1px solid var(--border-color)',
                                backgroundColor: p.permissions[modKey] === 'write' ? 'rgba(16,185,129,0.05)' : p.permissions[modKey] === 'read' ? 'rgba(59,130,246,0.05)' : 'transparent',
                                color: p.permissions[modKey] === 'write' ? '#10b981' : p.permissions[modKey] === 'read' ? '#3b82f6' : 'var(--text-muted)',
                                fontWeight: p.permissions[modKey] !== 'none' ? '700' : 'normal'
                              }}
                            >
                              <option value="none">Bloqueado</option>
                              <option value="read">Leitura</option>
                              <option value="write">Escrita / Full</option>
                            </select>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

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
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <button onClick={() => handleOpenUserEdit(user)} style={styles.actionEditBtn}>
                                Editar
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
