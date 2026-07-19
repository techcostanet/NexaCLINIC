import React, { useState, useEffect } from 'react';
import { dbService, authService } from '../firebase';
import { UserPlus, Settings, Check, X, Shield, Lock, Unlock, Users, BarChart3, Plus, Edit2, Trash2, Calendar, Home, Folder, Activity, UserX } from 'lucide-react';

export default function AdminPanel({ currentUser }) {
  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'indicators' | 'parameters'
  const [activeParamSubTab, setActiveParamSubTab] = useState('sectors'); // 'sectors' | 'shifts' | 'rooms' | 'accessTypes' | 'dialysisFrequencies'
  
  const [users, setUsers] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [indicators, setIndicators] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [accessTypes, setAccessTypes] = useState([]);
  const [dialysisFrequencies, setDialysisFrequencies] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // ----------------------------------------------------
  // User Management State
  // ----------------------------------------------------
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState('professional');
  const [newSectors, setNewSectors] = useState([]);
  const [newStatus, setNewStatus] = useState('active');
  const [editingUser, setEditingUser] = useState(null);

  // ----------------------------------------------------
  // Indicator Management State
  // ----------------------------------------------------
  const [indicatorName, setIndicatorName] = useState('');
  const [indicatorDesc, setIndicatorDesc] = useState('');
  const [indicatorSector, setIndicatorSector] = useState('');
  const [indicatorUnit, setIndicatorUnit] = useState('%');
  const [indicatorTarget, setIndicatorTarget] = useState('');
  const [editingIndicator, setEditingIndicator] = useState(null);

  // ----------------------------------------------------
  // Parameters State (Sectors, Shifts, Rooms, Accesses, Dialysis Frequencies)
  // ----------------------------------------------------
  // Sector CRUD State
  const [sectorName, setSectorName] = useState('');
  const [sectorDesc, setSectorDesc] = useState('');
  const [editingSector, setEditingSector] = useState(null);

  // Shift CRUD State
  const [shiftName, setShiftName] = useState('');
  const [editingShift, setEditingShift] = useState(null);

  // Room CRUD State
  const [roomName, setRoomName] = useState('');
  const [editingRoom, setEditingRoom] = useState(null);

  // Access Type CRUD State
  const [accessName, setAccessName] = useState('');
  const [editingAccess, setEditingAccess] = useState(null);

  // Dialysis Frequency CRUD State
  const [dialysisFrequencyName, setDialysisFrequencyName] = useState('');
  const [editingDialysisFrequency, setEditingDialysisFrequency] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const allSectors = await dbService.getSectors();
      setSectors(allSectors);
      
      const allUsers = await dbService.getUsers();
      setUsers(allUsers);

      const allIndicators = await dbService.getIndicators();
      setIndicators(allIndicators);

      const allShifts = await dbService.getShifts();
      setShifts(allShifts);

      const allRooms = await dbService.getRooms();
      setRooms(allRooms);

      const allAccessTypes = await dbService.getAccessTypes();
      setAccessTypes(allAccessTypes);

      const allDialysisFrequencies = await dbService.getDialysisFrequencies();
      setDialysisFrequencies(allDialysisFrequencies);

      if (allSectors.length > 0) {
        setIndicatorSector(allSectors[0].id);
      }
    } catch (err) {
      console.error(err);
      showAlert('Erro ao buscar dados do servidor.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 5000);
  };

  // ----------------------------------------------------
  // User Actions
  // ----------------------------------------------------
  const handleRoleChange = (role) => {
    setNewRole(role);
    if (role === 'admin') {
      setNewSectors(sectors.map(s => s.id));
    } else {
      setNewSectors([]);
    }
  };

  const handleSectorToggle = (sectorId) => {
    if (newSectors.includes(sectorId)) {
      setNewSectors(newSectors.filter(id => id !== sectorId));
    } else {
      setNewSectors([...newSectors, sectorId]);
    }
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    if (!newName || !newEmail) {
      return showAlert('Preencha os campos obrigatórios.', 'warning');
    }

    if (newRole === 'professional' && newSectors.length === 0) {
      return showAlert('Selecione pelo menos um setor para o profissional.', 'warning');
    }

    setActionLoading(true);
    try {
      if (editingUser) {
        await dbService.updateUser(editingUser.uid, {
          name: newName,
          email: newEmail,
          role: newRole,
          allowedSectors: newRole === 'admin' ? sectors.map(s => s.id) : newSectors,
          status: newStatus
        });
        showAlert(`Profissional "${newName}" atualizado com sucesso!`, 'success');
        setEditingUser(null);
      } else {
        await authService.createUser(newEmail, newName, newRole, newSectors);
        showAlert(`Profissional cadastrado! Senha inicial: ${newEmail.split('@')[0]}123`, 'success');
      }
      setNewName('');
      setNewEmail('');
      setNewRole('professional');
      setNewSectors([]);
      setNewStatus('active');
      await fetchData();
    } catch (err) {
      showAlert(err.message || 'Erro ao salvar profissional.', 'danger');
    } finally {
      setActionLoading(false);
    }
  };

  const startEditUser = (user) => {
    setEditingUser(user);
    setNewName(user.name);
    setNewEmail(user.email);
    setNewRole(user.role);
    setNewSectors(user.allowedSectors || []);
    setNewStatus(user.status || 'active');
  };

  const cancelEditUser = () => {
    setEditingUser(null);
    setNewName('');
    setNewEmail('');
    setNewRole('professional');
    setNewSectors([]);
    setNewStatus('active');
  };

  const handleDeleteUser = async (uid, name) => {
    if (uid === currentUser.uid) {
      return showAlert('Você não pode excluir o seu próprio usuário!', 'warning');
    }
    if (!window.confirm(`Tem certeza que deseja excluir permanentemente o profissional "${name}"? Esta ação não pode ser desfeita.`)) {
      return;
    }

    setActionLoading(true);
    try {
      await dbService.deleteUser(uid);
      showAlert(`Profissional "${name}" excluído.`, 'success');
      await fetchData();
    } catch (err) {
      showAlert('Erro ao excluir profissional.', 'danger');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleUserStatus = async (user) => {
    if (user.uid === currentUser.uid) {
      return showAlert('Você não pode inativar o seu próprio usuário!', 'warning');
    }
    const newStatusVal = (user.status || 'active') === 'active' ? 'inactive' : 'active';
    const actionLabel = newStatusVal === 'active' ? 'ativado' : 'inativado';
    
    setActionLoading(true);
    try {
      await dbService.updateUser(user.uid, {
        name: user.name,
        email: user.email,
        role: user.role,
        allowedSectors: user.allowedSectors,
        status: newStatusVal
      });
      showAlert(`Profissional "${user.name}" foi ${actionLabel}!`, 'success');
      await fetchData();
    } catch (err) {
      showAlert('Erro ao alterar status do profissional.', 'danger');
    } finally {
      setActionLoading(false);
    }
  };

  // ----------------------------------------------------
  // Indicator Actions
  // ----------------------------------------------------
  const handleSaveIndicator = async (e) => {
    e.preventDefault();
    if (!indicatorName || !indicatorTarget) {
      return showAlert('Preencha nome e meta.', 'warning');
    }

    const target = parseFloat(indicatorTarget.toString().replace(',', '.'));
    if (isNaN(target)) {
      return showAlert('A meta deve ser um número válido.', 'warning');
    }

    const indicatorData = {
      name: indicatorName,
      description: indicatorDesc,
      sectorId: indicatorSector,
      unit: indicatorUnit,
      target: target
    };

    setActionLoading(true);
    try {
      if (editingIndicator) {
        await dbService.updateIndicator(editingIndicator.id, indicatorData);
        showAlert(`Indicador "${indicatorName}" atualizado!`, 'success');
        setEditingIndicator(null);
      } else {
        await dbService.createIndicator(indicatorData);
        showAlert(`Indicador "${indicatorName}" criado com sucesso!`, 'success');
      }

      setIndicatorName('');
      setIndicatorDesc('');
      setIndicatorTarget('');
      setIndicatorUnit('%');
      await fetchData();
    } catch (err) {
      showAlert('Erro ao salvar indicador.', 'danger');
    } finally {
      setActionLoading(false);
    }
  };

  const startEditIndicator = (ind) => {
    setEditingIndicator(ind);
    setIndicatorName(ind.name);
    setIndicatorDesc(ind.description || '');
    setIndicatorSector(ind.sectorId);
    setIndicatorUnit(ind.unit);
    setIndicatorTarget(ind.target.toString());
  };

  const cancelEditIndicator = () => {
    setEditingIndicator(null);
    setIndicatorName('');
    setIndicatorDesc('');
    setIndicatorTarget('');
    setIndicatorUnit('%');
  };

  const handleDeleteIndicator = async (id, name) => {
    if (!window.confirm(`Tem certeza que deseja excluir o indicador "${name}"? Isso também removerá todos os dados históricos desse indicador no Dashboard!`)) {
      return;
    }

    setActionLoading(true);
    try {
      await dbService.deleteIndicator(id);
      showAlert(`Indicador "${name}" excluído.`, 'success');
      await fetchData();
    } catch (err) {
      showAlert('Erro ao excluir indicador.', 'danger');
    } finally {
      setActionLoading(false);
    }
  };

  // ----------------------------------------------------
  // Parameter CRUD Handlers (Sectors, Shifts, Rooms)
  // ----------------------------------------------------
  const handleSaveSector = async (e) => {
    e.preventDefault();
    if (!sectorName) return showAlert('Preencha o nome do setor.', 'warning');
    
    setActionLoading(true);
    try {
      if (editingSector) {
        await dbService.updateSector(editingSector.id, { name: sectorName, description: sectorDesc });
        showAlert(`Setor "${sectorName}" atualizado!`, 'success');
        setEditingSector(null);
      } else {
        await dbService.createSector({ name: sectorName, description: sectorDesc });
        showAlert(`Setor "${sectorName}" criado!`, 'success');
      }
      setSectorName('');
      setSectorDesc('');
      await fetchData();
    } catch (err) {
      showAlert('Erro ao salvar setor.', 'danger');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteSector = async (id, name) => {
    if (!window.confirm(`Excluir o setor "${name}" removerá também todos os indicadores associados! Deseja continuar?`)) return;
    setActionLoading(true);
    try {
      await dbService.deleteSector(id);
      showAlert(`Setor "${name}" excluído.`, 'success');
      await fetchData();
    } catch (err) {
      showAlert('Erro ao excluir setor.', 'danger');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveShift = async (e) => {
    e.preventDefault();
    if (!shiftName) return showAlert('Preencha o nome do turno.', 'warning');

    setActionLoading(true);
    try {
      if (editingShift) {
        await dbService.updateShift(editingShift.id, { name: shiftName });
        showAlert(`Turno "${shiftName}" atualizado!`, 'success');
        setEditingShift(null);
      } else {
        await dbService.createShift({ name: shiftName });
        showAlert(`Turno "${shiftName}" cadastrado!`, 'success');
      }
      setShiftName('');
      await fetchData();
    } catch (err) {
      showAlert('Erro ao salvar turno.', 'danger');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteShift = async (id, name) => {
    if (!window.confirm(`Tem certeza que deseja excluir o turno "${name}"?`)) return;
    setActionLoading(true);
    try {
      await dbService.deleteShift(id);
      showAlert(`Turno "${name}" excluído.`, 'success');
      await fetchData();
    } catch (err) {
      showAlert('Erro ao excluir turno.', 'danger');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveRoom = async (e) => {
    e.preventDefault();
    if (!roomName) return showAlert('Preencha o nome do salão.', 'warning');

    setActionLoading(true);
    try {
      if (editingRoom) {
        await dbService.updateRoom(editingRoom.id, { name: roomName });
        showAlert(`Salão "${roomName}" atualizado!`, 'success');
        setEditingRoom(null);
      } else {
        await dbService.createRoom({ name: roomName });
        showAlert(`Salão "${roomName}" cadastrado!`, 'success');
      }
      setRoomName('');
      await fetchData();
    } catch (err) {
      showAlert('Erro ao salvar salão.', 'danger');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteRoom = async (id, name) => {
    if (!window.confirm(`Tem certeza que deseja excluir o salão "${name}"?`)) return;
    setActionLoading(true);
    try {
      await dbService.deleteRoom(id);
      showAlert(`Salão "${name}" excluído.`, 'success');
      await fetchData();
    } catch (err) {
      showAlert('Erro ao excluir salão.', 'danger');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveAccessType = async (e) => {
    e.preventDefault();
    if (!accessName) return showAlert('Preencha o nome do acesso vascular.', 'warning');

    setActionLoading(true);
    try {
      if (editingAccess) {
        await dbService.updateAccessType(editingAccess.id, { name: accessName });
        showAlert(`Acesso vascular "${accessName}" atualizado!`, 'success');
        setEditingAccess(null);
      } else {
        await dbService.createAccessType({ name: accessName });
        showAlert(`Acesso vascular "${accessName}" cadastrado!`, 'success');
      }
      setAccessName('');
      await fetchData();
    } catch (err) {
      showAlert('Erro ao salvar acesso vascular.', 'danger');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteAccessType = async (id, name) => {
    if (!window.confirm(`Tem certeza que deseja excluir o acesso vascular "${name}"?`)) return;
    setActionLoading(true);
    try {
      await dbService.deleteAccessType(id);
      showAlert(`Acesso vascular "${name}" excluído.`, 'success');
      await fetchData();
    } catch (err) {
      showAlert('Erro ao excluir acesso vascular.', 'danger');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveDialysisFrequency = async (e) => {
    e.preventDefault();
    if (!dialysisFrequencyName) return showAlert('Preencha o nome da escala de diálise.', 'warning');

    setActionLoading(true);
    try {
      if (editingDialysisFrequency) {
        await dbService.updateDialysisFrequency(editingDialysisFrequency.id, { name: dialysisFrequencyName });
        showAlert(`Escala "${dialysisFrequencyName}" atualizada!`, 'success');
        setEditingDialysisFrequency(null);
      } else {
        await dbService.createDialysisFrequency({ name: dialysisFrequencyName });
        showAlert(`Escala "${dialysisFrequencyName}" cadastrada!`, 'success');
      }
      setDialysisFrequencyName('');
      await fetchData();
    } catch (err) {
      showAlert('Erro ao salvar escala de diálise.', 'danger');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteDialysisFrequency = async (id, name) => {
    if (!window.confirm(`Tem certeza que deseja excluir a escala de diálise "${name}"?`)) return;
    setActionLoading(true);
    try {
      await dbService.deleteDialysisFrequency(id);
      showAlert(`Escala "${name}" excluída.`, 'success');
      await fetchData();
    } catch (err) {
      showAlert('Erro ao excluir escala de diálise.', 'danger');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '3rem' }}>Carregando painel administrativo...</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>Painel de Controle e Governança</h1>
        <p>Gerencie profissionais (RBAC), metas dos indicadores e parâmetros de infraestrutura da clínica.</p>
      </div>

      {message.text && (
        <div className={`alert alert-${message.type}`} style={{ marginBottom: '1.5rem' }}>
          <span>{message.text}</span>
        </div>
      )}

      {/* Tabs Header */}
      <div style={styles.tabsContainer}>
        <button
          onClick={() => setActiveTab('users')}
          style={{ ...styles.tabButton, ...(activeTab === 'users' ? styles.tabButtonActive : {}) }}
        >
          <Users size={18} />
          <span>Profissionais</span>
        </button>
        <button
          onClick={() => setActiveTab('indicators')}
          style={{ ...styles.tabButton, ...(activeTab === 'indicators' ? styles.tabButtonActive : {}) }}
        >
          <BarChart3 size={18} />
          <span>Indicadores e Metas</span>
        </button>
        <button
          onClick={() => setActiveTab('parameters')}
          style={{ ...styles.tabButton, ...(activeTab === 'parameters' ? styles.tabButtonActive : {}) }}
        >
          <Settings size={18} />
          <span>Parâmetros da Clínica</span>
        </button>
      </div>

      {/* TAB 1: User Administration */}
      {activeTab === 'users' && (
        <div className="grid grid-cols-3">
          <div className="card" style={{ gridColumn: 'span 1' }}>
            <h2 className="card-title">
              <UserPlus size={20} color="var(--primary-color)" />
              {editingUser ? 'Editar Profissional' : 'Novo Profissional'}
            </h2>
            <form onSubmit={handleSaveUser}>
              <div className="form-group">
                <label htmlFor="user-name">Nome Completo</label>
                <input
                  id="user-name"
                  type="text"
                  className="form-control"
                  placeholder="Ex: Dra. Juliana Silva"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  required
                  disabled={actionLoading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="user-email">E-mail Corporativo</label>
                <input
                  id="user-email"
                  type="email"
                  className="form-control"
                  placeholder="juliana.silva@clinica.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  required
                  disabled={actionLoading}
                />
              </div>

              <div className="form-group">
                <label>Perfil de Acesso</label>
                <div style={styles.radioGroup}>
                  <label style={styles.radioLabel}>
                    <input
                      type="radio"
                      name="role"
                      checked={newRole === 'professional'}
                      onChange={() => handleRoleChange('professional')}
                      disabled={actionLoading}
                    />
                    <span>Profissional Comum</span>
                  </label>
                  <label style={styles.radioLabel}>
                    <input
                      type="radio"
                      name="role"
                      checked={newRole === 'admin'}
                      onChange={() => handleRoleChange('admin')}
                      disabled={actionLoading}
                    />
                    <span>Administrador</span>
                  </label>
                </div>
              </div>

              {newRole === 'professional' && (
                <div className="form-group">
                  <label>Setores Autorizados</label>
                  <div style={styles.checkboxList}>
                    {sectors.map((sec) => (
                      <label key={sec.id} className="form-checkbox" style={styles.checkboxItem}>
                        <input
                          type="checkbox"
                          checked={newSectors.includes(sec.id)}
                          onChange={() => handleSectorToggle(sec.id)}
                          disabled={actionLoading}
                        />
                        <div>
                          <div style={styles.checkboxName}>{sec.name}</div>
                          <div style={styles.checkboxDesc}>{sec.description}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {newRole === 'admin' && (
                <div className="alert alert-warning" style={{ fontSize: '0.8rem', padding: '0.75rem', marginBottom: '1rem' }}>
                  <Shield size={16} style={{ flexShrink: 0 }} />
                  <span>Admins possuem acesso total a todas as áreas.</span>
                </div>
              )}

              {editingUser && (
                <div className="form-group">
                  <label htmlFor="user-status">Status da Conta</label>
                  <select
                    id="user-status"
                    className="form-control"
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    disabled={actionLoading}
                  >
                    <option value="active">Ativo</option>
                    <option value="inactive">Inativo (Bloquear Acesso)</option>
                  </select>
                </div>
              )}

              {!editingUser && (
                <div style={styles.passwordHint}>
                  <Lock size={12} />
                  <span>Senha provisória: prefixo-email + 123</span>
                </div>
              )}

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                {editingUser && (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={cancelEditUser}
                    disabled={actionLoading}
                    style={{ flex: 1 }}
                  >
                    Cancelar
                  </button>
                )}
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={actionLoading}
                  style={{ flex: 2 }}
                >
                  <Check size={16} />
                  <span>{editingUser ? 'Atualizar Dados' : 'Cadastrar Profissional'}</span>
                </button>
              </div>
            </form>
          </div>

          <div className="card" style={{ gridColumn: 'span 2' }}>
            <h2 className="card-title">
              <Users size={20} color="var(--primary-color)" />
              Profissionais Cadastrados
            </h2>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Nome / E-mail</th>
                    <th>Perfil</th>
                    <th>Setores Liberados</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.uid}>
                      <td>
                        <div style={{ fontWeight: '600' }}>{u.name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{u.email}</div>
                      </td>
                      <td>
                        <span className={`badge ${u.role === 'admin' ? 'badge-admin' : 'badge-prof'}`}>
                          {u.role === 'admin' ? 'Admin' : 'Profissional'}
                        </span>
                      </td>
                      <td>
                        {u.role === 'admin' ? (
                          <span style={styles.allSectorsText}>Acesso Total</span>
                        ) : u.allowedSectors && u.allowedSectors.length > 0 ? (
                          <div style={styles.badgeGroup}>
                            {u.allowedSectors.map((sectorId) => {
                              const sec = sectors.find((s) => s.id === sectorId);
                              return (
                                <span key={sectorId} style={styles.sectorBadge}>
                                  {sec ? sec.name : sectorId}
                                </span>
                              );
                            })}
                          </div>
                        ) : (
                          <span style={{ color: 'var(--danger-color)', fontSize: '0.8rem', fontWeight: '500' }}>
                            Nenhum setor liberado
                          </span>
                        )}
                      </td>
                      <td>
                        <span
                          className="badge"
                          style={
                            u.status === 'inactive'
                              ? { backgroundColor: '#fee2e2', color: '#ef4444' }
                              : { backgroundColor: 'var(--success-light)', color: 'var(--success-color)' }
                          }
                        >
                          {u.status === 'inactive' ? 'Inativo' : 'Ativo'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.375rem' }}>
                          <button
                            className="btn btn-secondary"
                            style={{ padding: '0.375rem', borderRadius: '4px' }}
                            onClick={() => startEditUser(u)}
                            disabled={actionLoading}
                            title="Editar Profissional"
                          >
                            <Edit2 size={12} />
                          </button>
                          <button
                            className="btn btn-secondary"
                            style={{
                              padding: '0.375rem',
                              borderRadius: '4px',
                              color: u.status === 'inactive' ? 'var(--success-color)' : '#b45309'
                            }}
                            onClick={() => handleToggleUserStatus(u)}
                            disabled={actionLoading || u.uid === currentUser.uid}
                            title={u.status === 'inactive' ? 'Ativar Profissional' : 'Inativar Profissional'}
                          >
                            {u.status === 'inactive' ? <Unlock size={12} /> : <Lock size={12} />}
                          </button>
                          <button
                            className="btn btn-secondary"
                            style={{ padding: '0.375rem', borderRadius: '4px', color: 'var(--danger-color)' }}
                            onClick={() => handleDeleteUser(u.uid, u.name)}
                            disabled={actionLoading || u.uid === currentUser.uid}
                            title="Excluir Profissional"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Indicator Administration */}
      {activeTab === 'indicators' && (
        <div className="grid grid-cols-3">
          <div className="card" style={{ gridColumn: 'span 1' }}>
            <h2 className="card-title">
              <BarChart3 size={20} color="var(--primary-color)" />
              {editingIndicator ? 'Editar Indicador' : 'Novo Indicador Clínico'}
            </h2>
            <form onSubmit={handleSaveIndicator}>
              <div className="form-group">
                <label htmlFor="ind-name">Nome do Indicador</label>
                <input
                  id="ind-name"
                  type="text"
                  className="form-control"
                  placeholder="Ex: Reinternações em 30 dias"
                  value={indicatorName}
                  onChange={(e) => setIndicatorName(e.target.value)}
                  required
                  disabled={actionLoading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="ind-desc">Descrição / Fórmula</label>
                <textarea
                  id="ind-desc"
                  className="form-control"
                  rows="3"
                  placeholder="Ex: Percentual de pacientes..."
                  value={indicatorDesc}
                  onChange={(e) => setIndicatorDesc(e.target.value)}
                  disabled={actionLoading}
                  style={{ fontFamily: 'inherit', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <div className="form-group" style={{ flex: 1.2 }}>
                  <label htmlFor="ind-sector">Setor Vinculado</label>
                  <select
                    id="ind-sector"
                    className="form-control"
                    value={indicatorSector}
                    onChange={(e) => setIndicatorSector(e.target.value)}
                    disabled={actionLoading}
                  >
                    {sectors.map(sec => (
                      <option key={sec.id} value={sec.id}>{sec.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group" style={{ flex: 0.8 }}>
                  <label htmlFor="ind-unit">Unidade</label>
                  <select
                    id="ind-unit"
                    className="form-control"
                    value={indicatorUnit}
                    onChange={(e) => setIndicatorUnit(e.target.value)}
                    disabled={actionLoading}
                  >
                    <option value="%">%</option>
                    <option value="absoluto">Absoluto</option>
                    <option value="reusos">Reusos</option>
                    <option value="pontos">Pontos (NPS)</option>
                    <option value="dias">Dias</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="ind-target">Meta Estipulada</label>
                <input
                  id="ind-target"
                  type="text"
                  className="form-control"
                  placeholder="Ex: 5.0"
                  value={indicatorTarget}
                  onChange={(e) => setIndicatorTarget(e.target.value)}
                  required
                  disabled={actionLoading}
                />
              </div>

              <div style={styles.actionBtns}>
                {editingIndicator && (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={cancelEditIndicator}
                    disabled={actionLoading}
                    style={{ flex: 1 }}
                  >
                    Cancelar
                  </button>
                )}
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={actionLoading}
                  style={{ flex: 1.5 }}
                >
                  <Check size={16} />
                  <span>{editingIndicator ? 'Atualizar Meta' : 'Criar Indicador'}</span>
                </button>
              </div>
            </form>
          </div>

          <div className="card" style={{ gridColumn: 'span 2' }}>
            <h2 className="card-title">
              <BarChart3 size={20} color="var(--primary-color)" />
              Indicadores Configurados
            </h2>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Setor</th>
                    <th>Unidade</th>
                    <th>Meta</th>
                    <th style={{ textAlign: 'right' }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {indicators.map((ind) => {
                    const sec = sectors.find(s => s.id === ind.sectorId);
                    return (
                      <tr key={ind.id}>
                        <td style={{ maxWidth: '220px' }}>
                          <div style={{ fontWeight: '600' }}>{ind.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={ind.description}>
                            {ind.description}
                          </div>
                        </td>
                        <td>
                          <span style={styles.sectorBadge}>
                            {sec ? sec.name : ind.sectorId}
                          </span>
                        </td>
                        <td>
                          <code>{ind.unit}</code>
                        </td>
                        <td>
                          <strong>
                            {ind.id.includes('infeccao') || ind.id.includes('mortalidade') || ind.id.includes('glosa') ? '≤ ' : '≥ '}
                            {ind.target} {ind.unit}
                          </strong>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '0.375rem' }}>
                            <button
                              className="btn btn-secondary"
                              style={{ padding: '0.375rem', borderRadius: '4px' }}
                              onClick={() => startEditIndicator(ind)}
                              title="Editar indicador"
                            >
                              <Edit2 size={12} />
                            </button>
                            <button
                              className="btn btn-secondary"
                              style={{ padding: '0.375rem', borderRadius: '4px', color: 'var(--danger-color)' }}
                              onClick={() => handleDeleteIndicator(ind.id, ind.name)}
                              title="Excluir indicador"
                              disabled={actionLoading}
                            >
                              <Trash2 size={12} />
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
        </div>
      )}

      {/* TAB 3: Clinic Configuration Parameters */}
      {activeTab === 'parameters' && (
        <div>
          {/* Sub-tabs header */}
          <div style={styles.subTabsContainer}>
            <button
              onClick={() => setActiveParamSubTab('sectors')}
              style={{ ...styles.subTabButton, ...(activeParamSubTab === 'sectors' ? styles.subTabButtonActive : {}) }}
            >
              <Folder size={14} />
              <span>Setores</span>
            </button>
            <button
              onClick={() => setActiveParamSubTab('shifts')}
              style={{ ...styles.subTabButton, ...(activeParamSubTab === 'shifts' ? styles.subTabButtonActive : {}) }}
            >
              <Calendar size={14} />
              <span>Turnos</span>
            </button>
            <button
              onClick={() => setActiveParamSubTab('rooms')}
              style={{ ...styles.subTabButton, ...(activeParamSubTab === 'rooms' ? styles.subTabButtonActive : {}) }}
            >
              <Home size={14} />
              <span>Salões (Salas)</span>
            </button>
            <button
              onClick={() => setActiveParamSubTab('accessTypes')}
              style={{ ...styles.subTabButton, ...(activeParamSubTab === 'accessTypes' ? styles.subTabButtonActive : {}) }}
            >
              <Activity size={14} />
              <span>Acessos Vasculares</span>
            </button>
            <button
              onClick={() => setActiveParamSubTab('dialysisFrequencies')}
              style={{ ...styles.subTabButton, ...(activeParamSubTab === 'dialysisFrequencies' ? styles.subTabButtonActive : {}) }}
            >
              <Calendar size={14} />
              <span>Escalas de Diálise</span>
            </button>
          </div>

          {/* SUBTAB: Sectors */}
          {activeParamSubTab === 'sectors' && (
            <div className="grid grid-cols-3">
              <div className="card" style={{ gridColumn: 'span 1' }}>
                <h2 className="card-title">
                  <Folder size={18} color="var(--primary-color)" />
                  {editingSector ? 'Editar Setor' : 'Novo Setor Hospitalar'}
                </h2>
                <form onSubmit={handleSaveSector}>
                  <div className="form-group">
                    <label htmlFor="sector-name">Nome do Setor</label>
                    <input
                      id="sector-name"
                      type="text"
                      className="form-control"
                      placeholder="Ex: Nutrição"
                      value={sectorName}
                      onChange={(e) => setSectorName(e.target.value)}
                      required
                      disabled={actionLoading}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="sector-desc">Descrição</label>
                    <input
                      id="sector-desc"
                      type="text"
                      className="form-control"
                      placeholder="Ex: Indicadores nutricionais dos pacientes"
                      value={sectorDesc}
                      onChange={(e) => setSectorDesc(e.target.value)}
                      disabled={actionLoading}
                    />
                  </div>
                  <div style={styles.actionBtns}>
                    {editingSector && (
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => { setEditingSector(null); setSectorName(''); setSectorDesc(''); }}
                        disabled={actionLoading}
                      >
                        Cancelar
                      </button>
                    )}
                    <button type="submit" className="btn btn-primary" disabled={actionLoading}>
                      <Check size={14} />
                      <span>{editingSector ? 'Atualizar' : 'Salvar Setor'}</span>
                    </button>
                  </div>
                </form>
              </div>

              <div className="card" style={{ gridColumn: 'span 2' }}>
                <h2 className="card-title">Setores Ativos</h2>
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Nome</th>
                        <th>Descrição</th>
                        <th style={{ textAlign: 'right' }}>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sectors.map(sec => (
                        <tr key={sec.id}>
                          <td><strong>{sec.name}</strong></td>
                          <td>{sec.description}</td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', gap: '0.375rem' }}>
                              <button
                                className="btn btn-secondary"
                                style={{ padding: '0.375rem', borderRadius: '4px' }}
                                onClick={() => { setEditingSector(sec); setSectorName(sec.name); setSectorDesc(sec.description || ''); }}
                              >
                                <Edit2 size={12} />
                              </button>
                              <button
                                className="btn btn-secondary"
                                style={{ padding: '0.375rem', borderRadius: '4px', color: 'var(--danger-color)' }}
                                onClick={() => handleDeleteSector(sec.id, sec.name)}
                                disabled={actionLoading}
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* SUBTAB: Shifts */}
          {activeParamSubTab === 'shifts' && (
            <div className="grid grid-cols-3">
              <div className="card" style={{ gridColumn: 'span 1' }}>
                <h2 className="card-title">
                  <Calendar size={18} color="var(--primary-color)" />
                  {editingShift ? 'Editar Turno' : 'Novo Turno de Diálise'}
                </h2>
                <form onSubmit={handleSaveShift}>
                  <div className="form-group">
                    <label htmlFor="shift-name">Identificação do Turno</label>
                    <input
                      id="shift-name"
                      type="text"
                      className="form-control"
                      placeholder="Ex: 4º Turno (Noite)"
                      value={shiftName}
                      onChange={(e) => setShiftName(e.target.value)}
                      required
                      disabled={actionLoading}
                    />
                  </div>
                  <div style={styles.actionBtns}>
                    {editingShift && (
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => { setEditingShift(null); setShiftName(''); }}
                        disabled={actionLoading}
                      >
                        Cancelar
                      </button>
                    )}
                    <button type="submit" className="btn btn-primary" disabled={actionLoading}>
                      <Check size={14} />
                      <span>{editingShift ? 'Atualizar' : 'Salvar Turno'}</span>
                    </button>
                  </div>
                </form>
              </div>

              <div className="card" style={{ gridColumn: 'span 2' }}>
                <h2 className="card-title">Turnos Ativos</h2>
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Turno</th>
                        <th style={{ textAlign: 'right' }}>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {shifts.map(sh => (
                        <tr key={sh.id}>
                          <td><strong>{sh.name}</strong></td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', gap: '0.375rem' }}>
                              <button
                                className="btn btn-secondary"
                                style={{ padding: '0.375rem', borderRadius: '4px' }}
                                onClick={() => { setEditingShift(sh); setShiftName(sh.name); }}
                              >
                                <Edit2 size={12} />
                              </button>
                              <button
                                className="btn btn-secondary"
                                style={{ padding: '0.375rem', borderRadius: '4px', color: 'var(--danger-color)' }}
                                onClick={() => handleDeleteShift(sh.id, sh.name)}
                                disabled={actionLoading}
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* SUBTAB: Rooms */}
          {activeParamSubTab === 'rooms' && (
            <div className="grid grid-cols-3">
              <div className="card" style={{ gridColumn: 'span 1' }}>
                <h2 className="card-title">
                  <Home size={18} color="var(--primary-color)" />
                  {editingRoom ? 'Editar Salão' : 'Novo Salão de Hemodiálise'}
                </h2>
                <form onSubmit={handleSaveRoom}>
                  <div className="form-group">
                    <label htmlFor="room-name">Identificação do Salão</label>
                    <input
                      id="room-name"
                      type="text"
                      className="form-control"
                      placeholder="Ex: Salão de Isolamento VHB"
                      value={roomName}
                      onChange={(e) => setRoomName(e.target.value)}
                      required
                      disabled={actionLoading}
                    />
                  </div>
                  <div style={styles.actionBtns}>
                    {editingRoom && (
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => { setEditingRoom(null); setRoomName(''); }}
                        disabled={actionLoading}
                      >
                        Cancelar
                      </button>
                    )}
                    <button type="submit" className="btn btn-primary" disabled={actionLoading}>
                      <Check size={14} />
                      <span>{editingRoom ? 'Atualizar' : 'Salvar Salão'}</span>
                    </button>
                  </div>
                </form>
              </div>

              <div className="card" style={{ gridColumn: 'span 2' }}>
                <h2 className="card-title">Salões Ativos</h2>
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Salão / Sala</th>
                        <th style={{ textAlign: 'right' }}>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rooms.map(rm => (
                        <tr key={rm.id}>
                          <td><strong>{rm.name}</strong></td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', gap: '0.375rem' }}>
                              <button
                                className="btn btn-secondary"
                                style={{ padding: '0.375rem', borderRadius: '4px' }}
                                onClick={() => { setEditingRoom(rm); setRoomName(rm.name); }}
                              >
                                <Edit2 size={12} />
                              </button>
                              <button
                                className="btn btn-secondary"
                                style={{ padding: '0.375rem', borderRadius: '4px', color: 'var(--danger-color)' }}
                                onClick={() => handleDeleteRoom(rm.id, rm.name)}
                                disabled={actionLoading}
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* SUBTAB: AccessTypes */}
          {activeParamSubTab === 'accessTypes' && (
            <div className="grid grid-cols-3">
              <div className="card" style={{ gridColumn: 'span 1' }}>
                <h2 className="card-title">
                  <Activity size={18} color="var(--primary-color)" />
                  {editingAccess ? 'Editar Acesso' : 'Novo Acesso Vascular'}
                </h2>
                <form onSubmit={handleSaveAccessType}>
                  <div className="form-group">
                    <label htmlFor="access-name">Nome do Acesso</label>
                    <input
                      id="access-name"
                      type="text"
                      className="form-control"
                      placeholder="Ex: Fístula Arteriovenosa"
                      value={accessName}
                      onChange={(e) => setAccessName(e.target.value)}
                      required
                      disabled={actionLoading}
                    />
                  </div>
                  <div style={styles.actionBtns}>
                    {editingAccess && (
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => { setEditingAccess(null); setAccessName(''); }}
                        disabled={actionLoading}
                      >
                        Cancelar
                      </button>
                    )}
                    <button type="submit" className="btn btn-primary" disabled={actionLoading}>
                      <Check size={14} />
                      <span>{editingAccess ? 'Atualizar' : 'Salvar Acesso'}</span>
                    </button>
                  </div>
                </form>
              </div>

              <div className="card" style={{ gridColumn: 'span 2' }}>
                <h2 className="card-title">Acessos Cadastrados</h2>
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Acesso Vascular</th>
                        <th style={{ textAlign: 'right' }}>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {accessTypes.map(ac => (
                        <tr key={ac.id}>
                          <td><strong>{ac.name}</strong></td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', gap: '0.375rem' }}>
                              <button
                                className="btn btn-secondary"
                                style={{ padding: '0.375rem', borderRadius: '4px' }}
                                onClick={() => { setEditingAccess(ac); setAccessName(ac.name); }}
                              >
                                <Edit2 size={12} />
                              </button>
                              <button
                                className="btn btn-secondary"
                                style={{ padding: '0.375rem', borderRadius: '4px', color: 'var(--danger-color)' }}
                                onClick={() => handleDeleteAccessType(ac.id, ac.name)}
                                disabled={actionLoading}
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* SUBTAB: DialysisFrequencies */}
          {activeParamSubTab === 'dialysisFrequencies' && (
            <div className="grid grid-cols-3">
              <div className="card" style={{ gridColumn: 'span 1' }}>
                <h2 className="card-title">
                  <Calendar size={18} color="var(--primary-color)" />
                  {editingDialysisFrequency ? 'Editar Escala' : 'Nova Escala de Diálise'}
                </h2>
                <form onSubmit={handleSaveDialysisFrequency}>
                  <div className="form-group">
                    <label htmlFor="frequency-name">Nome da Escala</label>
                    <input
                      id="frequency-name"
                      type="text"
                      className="form-control"
                      placeholder="Ex: 3x por semana (Seg/Qua/Sex)"
                      value={dialysisFrequencyName}
                      onChange={(e) => setDialysisFrequencyName(e.target.value)}
                      required
                      disabled={actionLoading}
                    />
                  </div>
                  <div style={styles.actionBtns}>
                    {editingDialysisFrequency && (
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => { setEditingDialysisFrequency(null); setDialysisFrequencyName(''); }}
                        disabled={actionLoading}
                      >
                        Cancelar
                      </button>
                    )}
                    <button type="submit" className="btn btn-primary" disabled={actionLoading}>
                      <Check size={14} />
                      <span>{editingDialysisFrequency ? 'Atualizar' : 'Salvar Escala'}</span>
                    </button>
                  </div>
                </form>
              </div>

              <div className="card" style={{ gridColumn: 'span 2' }}>
                <h2 className="card-title">Escalas Cadastradas</h2>
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Escala de Diálise</th>
                        <th style={{ textAlign: 'right' }}>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dialysisFrequencies.map(df => (
                        <tr key={df.id}>
                          <td><strong>{df.name}</strong></td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', gap: '0.375rem' }}>
                              <button
                                className="btn btn-secondary"
                                style={{ padding: '0.375rem', borderRadius: '4px' }}
                                onClick={() => { setEditingDialysisFrequency(df); setDialysisFrequencyName(df.name); }}
                              >
                                <Edit2 size={12} />
                              </button>
                              <button
                                className="btn btn-secondary"
                                style={{ padding: '0.375rem', borderRadius: '4px', color: 'var(--danger-color)' }}
                                onClick={() => handleDeleteDialysisFrequency(df.id, df.name)}
                                disabled={actionLoading}
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '0.5rem 0',
  },
  header: {
    marginBottom: '1.5rem',
  },
  tabsContainer: {
    display: 'flex',
    borderBottom: '1px solid var(--border-color)',
    marginBottom: '1.5rem',
    gap: '0.5rem',
  },
  tabButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: 'none',
    border: 'none',
    borderBottom: '2px solid transparent',
    padding: '0.75rem 1.25rem',
    color: 'var(--text-secondary)',
    fontSize: '0.9rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
  },
  tabButtonActive: {
    borderBottomColor: 'var(--primary-color)',
    color: 'var(--primary-color)',
    fontWeight: '600',
  },
  subTabsContainer: {
    display: 'flex',
    gap: '0.25rem',
    marginBottom: '1.25rem',
    borderBottom: '1px dashed var(--border-color)',
    paddingBottom: '0.5rem',
  },
  subTabButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.375rem',
    background: 'none',
    border: '1px solid var(--border-color)',
    borderRadius: '20px',
    padding: '0.375rem 0.875rem',
    color: 'var(--text-secondary)',
    fontSize: '0.8rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
  },
  subTabButtonActive: {
    backgroundColor: 'var(--primary-color)',
    borderColor: 'var(--primary-color)',
    color: '#ffffff',
  },
  radioGroup: {
    display: 'flex',
    gap: '1.5rem',
    marginTop: '0.25rem',
  },
  radioLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    fontSize: '0.875rem',
    cursor: 'pointer',
  },
  checkboxList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    maxHeight: '220px',
    overflowY: 'auto',
    padding: '0.5rem',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--border-radius-sm)',
    backgroundColor: '#fafafa',
  },
  checkboxItem: {
    alignItems: 'flex-start',
    padding: '0.5rem',
    borderRadius: '4px',
  },
  checkboxName: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: 'var(--text-primary)',
  },
  checkboxDesc: {
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
  },
  badgeGroup: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.25rem',
  },
  sectorBadge: {
    fontSize: '0.75rem',
    padding: '0.2rem 0.5rem',
    backgroundColor: '#f1f5f9',
    color: '#334155',
    borderRadius: '4px',
    fontWeight: '500',
    whiteSpace: 'nowrap'
  },
  allSectorsText: {
    fontSize: '0.75rem',
    padding: '0.2rem 0.5rem',
    backgroundColor: '#fae8ff',
    color: '#86198f',
    borderRadius: '4px',
    fontWeight: '600',
  },
  passwordHint: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    marginTop: '0.75rem',
  },
  actionBtns: {
    display: 'flex',
    gap: '0.75rem',
    marginTop: '1rem',
  },
  closeModalBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
  }
};
