import React, { useState, useEffect, useMemo } from 'react';
import { dbService } from '../firebase';
import { Plus, Search, Edit2, Trash2, User, Calendar, ShieldCheck, HeartPulse, X, Check, FileText } from 'lucide-react';
import { useUnit } from '../contexts/UnitContext';
import UnitSelector from './common/UnitSelector';

export default function PatientsPanel() {
  const { activeUnitId, filterByActiveUnit } = useUnit();
  const [patients, setPatients] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [accessTypes, setAccessTypes] = useState([]);
  const [dialysisFrequencies, setDialysisFrequencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterShift, setFilterShift] = useState('');
  const [filterRoom, setFilterRoom] = useState('');
  const [filterAccess, setFilterAccess] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Modal / Form State
  const [showModal, setShowModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  
  const [name, setName] = useState('');
  const [gender, setGender] = useState('M');
  const [birthDate, setBirthDate] = useState('');
  const [chartNumber, setChartNumber] = useState('');
  const [cpf, setCpf] = useState('');
  const [admissionDate, setAdmissionDate] = useState(new Date().toISOString().substring(0, 10));
  const [treatmentStatus, setTreatmentStatus] = useState('Ativo');
  const [dialysisFrequency, setDialysisFrequency] = useState('');
  const [dryWeight, setDryWeight] = useState('');
  const [accessType, setAccessType] = useState('');
  const [shift, setShift] = useState('');
  const [room, setRoom] = useState('');
  
  // New patient fields
  const [patientType, setPatientType] = useState('Crônico');
  const [city, setCity] = useState('');
  const [state, setState] = useState('MG');
  const [treatmentType, setTreatmentType] = useState('HD');

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const pList = await dbService.getPatients();
      setPatients(pList);
      
      const sList = await dbService.getShifts();
      setShifts(sList);
      if (sList.length > 0) setShift(sList[0].name);

      const rList = await dbService.getRooms();
      setRooms(rList);
      if (rList.length > 0) setRoom(rList[0].name);

      const aList = await dbService.getAccessTypes();
      setAccessTypes(aList);
      if (aList.length > 0) setAccessType(aList[0].name);

      const dList = await dbService.getDialysisFrequencies();
      setDialysisFrequencies(dList);
      if (dList.length > 0) setDialysisFrequency(dList[0].name);
    } catch (err) {
      console.error(err);
      showAlert('Erro ao carregar dados dos pacientes ou parâmetros da clínica.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const list = await dbService.getPatients();
      setPatients(list);
    } catch (err) {
      console.error(err);
    }
  };

  const showAlert = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 5000);
  };

  const openAddModal = () => {
    setEditingPatient(null);
    setName('');
    setGender('M');
    setBirthDate('');
    setChartNumber('');
    setCpf('');
    setAdmissionDate(new Date().toISOString().substring(0, 10));
    setTreatmentStatus('Ativo');
    setDialysisFrequency(dialysisFrequencies.length > 0 ? dialysisFrequencies[0].name : '');
    setDryWeight('');
    setAccessType(accessTypes.length > 0 ? accessTypes[0].name : '');
    if (shifts.length > 0) setShift(shifts[0].name);
    if (rooms.length > 0) setRoom(rooms[0].name);
    
    setPatientType('Crônico');
    setCity('');
    setState('MG');
    setTreatmentType('HD');
    
    setShowModal(true);
  };

  const openEditModal = (pat) => {
    setEditingPatient(pat);
    setName(pat.name);
    setGender(pat.gender);
    setBirthDate(pat.birthDate);
    setChartNumber(pat.chartNumber || '');
    setCpf(pat.cpf || '');
    setAdmissionDate(pat.admissionDate || new Date().toISOString().substring(0, 10));
    setTreatmentStatus(pat.treatmentStatus || 'Ativo');
    setDialysisFrequency(pat.dialysisFrequency || (dialysisFrequencies.length > 0 ? dialysisFrequencies[0].name : ''));
    setDryWeight(pat.dryWeight || '');
    setAccessType(pat.accessType);
    setShift(pat.shift);
    setRoom(pat.room);
    
    setPatientType(pat.patientType || 'Crônico');
    setCity(pat.city || '');
    setState(pat.state || 'MG');
    setTreatmentType(pat.treatmentType || 'HD');
    
    setShowModal(true);
  };

  const handleSavePatient = async (e) => {
    e.preventDefault();
    if (!name || !birthDate || !chartNumber) {
      return showAlert('Preencha os campos obrigatórios (Nome, Nascimento, Prontuário).', 'warning');
    }

    const targetUnitId = activeUnitId === 'all' ? 'betim' : activeUnitId;
    const targetUnit = targetUnitId === 'taguatinga' ? 'Taguatinga' : 'Betim';

    const patientData = {
      name,
      gender,
      birthDate,
      chartNumber,
      cpf,
      admissionDate,
      treatmentStatus,
      dialysisFrequency,
      dryWeight: parseFloat(dryWeight) || null,
      accessType,
      shift,
      room,
      patientType,
      city,
      state,
      treatmentType,
      unitId: targetUnitId,
      unit: targetUnit
    };

    setActionLoading(true);
    try {
      if (editingPatient) {
        await dbService.updatePatient(editingPatient.id, patientData);
        showAlert(`Cadastro de ${name} atualizado com sucesso!`, 'success');
      } else {
        await dbService.createPatient(patientData);
        showAlert(`Paciente ${name} cadastrado com sucesso!`, 'success');
      }
      setShowModal(false);
      await fetchPatients();
    } catch (err) {
      showAlert('Erro ao salvar paciente.', 'danger');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeletePatient = async (id, patName) => {
    if (!window.confirm(`Tem certeza que deseja excluir o cadastro do paciente ${patName}?`)) {
      return;
    }

    setActionLoading(true);
    try {
      await dbService.deletePatient(id);
      showAlert(`Cadastro de ${patName} excluído.`, 'success');
      await fetchPatients();
    } catch (err) {
      showAlert('Erro ao excluir paciente.', 'danger');
    } finally {
      setActionLoading(false);
    }
  };

  const calculateAge = (birthStr) => {
    if (!birthStr) return '';
    const today = new Date();
    const birthDate = new Date(birthStr);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'Ativo':
        return { backgroundColor: 'var(--success-light)', color: 'var(--success-color)' };
      case 'Suspenso':
        return { backgroundColor: '#fffbeb', color: '#b45309' };
      case 'Transplantado':
        return { backgroundColor: '#e0f2fe', color: '#0369a1' };
      case 'Transferido':
        return { backgroundColor: '#f1f5f9', color: '#475569' };
      case 'Óbito':
        return { backgroundColor: '#fecaca', color: '#dc2626' };
      default:
        return { backgroundColor: '#f1f5f9', color: '#475569' };
    }
  };

  // Filtragem de Pacientes pela Unidade Ativa
  const currentPatients = useMemo(() => filterByActiveUnit(patients), [patients, activeUnitId]);

  // Filtered Patients List
  const filteredPatients = currentPatients.filter((pat) => {
    const matchesName = (pat.name || '').toLowerCase().includes((searchTerm || '').toLowerCase()) || 
                        (pat.chartNumber && pat.chartNumber.toLowerCase().includes((searchTerm || '').toLowerCase())) ||
                        (pat.cpf && pat.cpf.includes(searchTerm));
    const matchesShift = filterShift ? pat.shift === filterShift : true;
    const matchesRoom = filterRoom ? pat.room === filterRoom : true;
    const matchesAccess = filterAccess ? pat.accessType === filterAccess : true;
    const matchesStatus = filterStatus ? pat.treatmentStatus === filterStatus : true;
    return matchesName && matchesShift && matchesRoom && matchesAccess && matchesStatus;
  });

  // Calculate statistics
  const totalCount = currentPatients.length;
  const activeCount = currentPatients.filter(p => p.treatmentStatus === 'Ativo').length;
  const transplantCount = currentPatients.filter(p => p.treatmentStatus === 'Transplantado').length;
  const deathCount = currentPatients.filter(p => p.treatmentStatus === 'Óbito').length;

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '3rem' }}>Carregando cadastro de pacientes...</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1>Cadastro de Pacientes</h1>
            <p>Gerencie as fichas clínicas dos pacientes em tratamento de hemodiálise, turnos e salas.</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <UnitSelector compact showLabel={false} />
            <button className="btn btn-primary" onClick={openAddModal}>
              <Plus size={18} />
              <span>Adicionar Paciente</span>
            </button>
          </div>
        </div>
      </div>

      {message.text && (
        <div className={`alert alert-${message.type}`} style={{ marginBottom: '1.5rem' }}>
          <span>{message.text}</span>
        </div>
      )}

      {/* KPI stats cards */}
      <div className="grid grid-cols-4" style={{ marginBottom: '1.5rem' }}>
        <div className="card" style={styles.kpiCard}>
          <div style={styles.kpiHeader}>
            <User size={16} color="var(--primary-color)" />
            <span style={styles.kpiLabel}>Total Geral</span>
          </div>
          <div style={styles.kpiValue}>{totalCount}</div>
          <div style={styles.kpiFooter}>Registros históricos</div>
        </div>

        <div className="card" style={styles.kpiCard}>
          <div style={styles.kpiHeader}>
            <Check size={16} color="var(--success-color)" />
            <span style={styles.kpiLabel}>Pacientes Ativos</span>
          </div>
          <div style={styles.kpiValue} style={{ ...styles.kpiValue, color: 'var(--success-color)' }}>{activeCount}</div>
          <div style={styles.kpiFooter}>Em tratamento clínico</div>
        </div>

        <div className="card" style={styles.kpiCard}>
          <div style={styles.kpiHeader}>
            <HeartPulse size={16} color="var(--secondary-color)" />
            <span style={styles.kpiLabel}>Transplantados</span>
          </div>
          <div style={styles.kpiValue} style={{ ...styles.kpiValue, color: '#0369a1' }}>{transplantCount}</div>
          <div style={styles.kpiFooter}>Reabilitação bem sucedida</div>
        </div>

        <div className="card" style={styles.kpiCard}>
          <div style={styles.kpiHeader}>
            <X size={16} color="#dc2626" />
            <span style={styles.kpiLabel}>Óbitos no Período</span>
          </div>
          <div style={styles.kpiValue} style={{ ...styles.kpiValue, color: '#dc2626' }}>{deathCount}</div>
          <div style={styles.kpiFooter}>Indicador de mortalidade</div>
        </div>
      </div>

      {/* Filters Card */}
      <div className="card" style={styles.filterCard}>
        <div style={styles.filterRow}>
          {/* Name/Chart Search */}
          <div className="form-group" style={{ flex: '2 1 220px', marginBottom: 0 }}>
            <label htmlFor="search-name">Buscar Paciente</label>
            <div style={styles.searchWrapper}>
              <Search size={16} style={styles.searchIcon} />
              <input
                id="search-name"
                type="text"
                className="form-control"
                style={{ paddingLeft: '2.25rem' }}
                placeholder="Nome, Prontuário ou CPF..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="form-group" style={{ flex: '1 1 130px', marginBottom: 0 }}>
            <label htmlFor="filter-status">Status</label>
            <select
              id="filter-status"
              className="form-control"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">Todos</option>
              <option value="Ativo">Ativo</option>
              <option value="Suspenso">Suspenso</option>
              <option value="Transplantado">Transplantado</option>
              <option value="Transferido">Transferido</option>
              <option value="Óbito">Óbito</option>
            </select>
          </div>

          {/* Shift Filter */}
          <div className="form-group" style={{ flex: '1 1 130px', marginBottom: 0 }}>
            <label htmlFor="filter-shift">Turno</label>
            <select
              id="filter-shift"
              className="form-control"
              value={filterShift}
              onChange={(e) => setFilterShift(e.target.value)}
            >
              <option value="">Todos</option>
              {shifts.map(sh => (
                <option key={sh.id} value={sh.name}>{sh.name}</option>
              ))}
            </select>
          </div>

          {/* Room Filter */}
          <div className="form-group" style={{ flex: '1 1 130px', marginBottom: 0 }}>
            <label htmlFor="filter-room">Salão</label>
            <select
              id="filter-room"
              className="form-control"
              value={filterRoom}
              onChange={(e) => setFilterRoom(e.target.value)}
            >
              <option value="">Todos</option>
              {rooms.map(rm => (
                <option key={rm.id} value={rm.name}>{rm.name}</option>
              ))}
            </select>
          </div>

          {/* Access Filter */}
          <div className="form-group" style={{ flex: '1 1 150px', marginBottom: 0 }}>
            <label htmlFor="filter-access">Acesso</label>
            <select
              id="filter-access"
              className="form-control"
              value={filterAccess}
              onChange={(e) => setFilterAccess(e.target.value)}
            >
              <option value="">Todos</option>
              {accessTypes.map(ac => (
                <option key={ac.id} value={ac.name}>{ac.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Patients Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {filteredPatients.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
            Não encontramos pacientes correspondentes aos filtros aplicados.
          </div>
        ) : (
          <div className="table-container" style={{ border: 'none', borderRadius: 0, boxShadow: 'none' }}>
            <table>
              <thead>
                <tr>
                  <th>Paciente</th>
                  <th>Idade</th>
                  <th>Status</th>
                  <th>Acesso</th>
                  <th>Turno</th>
                  <th>Frequência</th>
                  <th style={{ textAlign: 'right' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.map((pat) => (
                  <tr key={pat.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: '600' }}>{pat.name}</span>
                        {pat.treatmentType && (
                          <span className="badge" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary-color)', fontSize: '0.65rem', padding: '1px 4px', textTransform: 'uppercase' }}>
                            {pat.treatmentType}
                          </span>
                        )}
                        {pat.patientType && (
                          <span className="badge" style={{ backgroundColor: '#f1f5f9', color: '#475569', fontSize: '0.65rem', padding: '1px 4px' }}>
                            {pat.patientType}
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        <span>Pront: <strong>{pat.chartNumber || '-'}</strong></span>
                        {pat.cpf && <span>• CPF: {pat.cpf}</span>}
                      </div>
                    </td>
                    <td>
                      <div>{calculateAge(pat.birthDate)} anos • {pat.gender === 'M' ? 'M' : 'F'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {pat.city && `${pat.city} - ${pat.state || 'MG'}`}
                      </div>
                    </td>
                    <td>
                      <span
                        className="badge"
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          ...getStatusBadgeStyle(pat.treatmentStatus)
                        }}
                      >
                        {pat.treatmentStatus || 'Ativo'}
                      </span>
                    </td>
                    <td>
                      <span
                        className="badge"
                        style={{
                          backgroundColor: pat.accessType.includes('Fístula') ? 'var(--success-light)' : 'var(--danger-light)',
                          color: pat.accessType.includes('Fístula') ? 'var(--success-color)' : 'var(--danger-color)',
                          fontSize: '0.75rem',
                          textTransform: 'none',
                          letterSpacing: 'normal'
                        }}
                      >
                        {pat.accessType}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: '600' }}>{pat.shift}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{pat.room}</div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.85rem' }}>{pat.dialysisFrequency}</div>
                      {pat.dryWeight && <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Peso Seco: <strong>{pat.dryWeight} kg</strong></div>}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.375rem' }}>
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '0.375rem', borderRadius: '4px' }}
                          onClick={() => openEditModal(pat)}
                          title="Editar cadastro"
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '0.375rem', borderRadius: '4px', color: 'var(--danger-color)' }}
                          onClick={() => handleDeletePatient(pat.id, pat.name)}
                          title="Excluir paciente"
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
        )}
      </div>

      {/* Modal Add/Edit Patient */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '650px' }}>
            <div className="modal-header">
              <h3>{editingPatient ? 'Editar Ficha do Paciente' : 'Cadastrar Novo Paciente'}</h3>
              <button
                style={styles.closeModalBtn}
                onClick={() => setShowModal(false)}
                disabled={actionLoading}
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSavePatient}>
              <div className="modal-body">
                {/* Row 1: Name & Chart */}
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <div className="form-group" style={{ flex: '2 1 300px' }}>
                    <label htmlFor="pat-form-name">Nome Completo</label>
                    <input
                      id="pat-form-name"
                      type="text"
                      className="form-control"
                      placeholder="Ex: Carlos Alberto de Oliveira"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      disabled={actionLoading}
                    />
                  </div>
                  <div className="form-group" style={{ flex: '1 1 150px' }}>
                    <label htmlFor="pat-form-chart">Prontuário</label>
                    <input
                      id="pat-form-chart"
                      type="text"
                      className="form-control"
                      placeholder="Ex: PR-1025"
                      value={chartNumber}
                      onChange={(e) => setChartNumber(e.target.value)}
                      required
                      disabled={actionLoading}
                    />
                  </div>
                </div>

                {/* Row 2: CPF, Sex, BirthDate */}
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <div className="form-group" style={{ flex: 1.2 }}>
                    <label htmlFor="pat-form-cpf">CPF</label>
                    <input
                      id="pat-form-cpf"
                      type="text"
                      className="form-control"
                      placeholder="Ex: 000.000.000-00"
                      value={cpf}
                      onChange={(e) => setCpf(e.target.value)}
                      disabled={actionLoading}
                    />
                  </div>
                  <div className="form-group" style={{ flex: 0.8 }}>
                    <label htmlFor="pat-form-gender">Sexo</label>
                    <select
                      id="pat-form-gender"
                      className="form-control"
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      disabled={actionLoading}
                    >
                      <option value="M">Masculino</option>
                      <option value="F">Feminino</option>
                    </select>
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label htmlFor="pat-form-birth">Data de Nascimento</label>
                    <input
                      id="pat-form-birth"
                      type="date"
                      className="form-control"
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      required
                      disabled={actionLoading}
                    />
                  </div>
                </div>

                {/* Row 2.5: City, State, Patient Type, Treatment Type */}
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <div className="form-group" style={{ flex: '1.2 1 180px' }}>
                    <label htmlFor="pat-form-city">Município</label>
                    <input
                      id="pat-form-city"
                      type="text"
                      className="form-control"
                      placeholder="Ex: Betim"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      disabled={actionLoading}
                    />
                  </div>
                  <div className="form-group" style={{ flex: '0.5 1 80px' }}>
                    <label htmlFor="pat-form-state">Estado (UF)</label>
                    <input
                      id="pat-form-state"
                      type="text"
                      className="form-control"
                      placeholder="Ex: MG"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      disabled={actionLoading}
                      maxLength={2}
                    />
                  </div>
                  <div className="form-group" style={{ flex: '1 1 140px' }}>
                    <label htmlFor="pat-form-pat-type">Tipo de Paciente</label>
                    <select
                      id="pat-form-pat-type"
                      className="form-control"
                      value={patientType}
                      onChange={(e) => setPatientType(e.target.value)}
                      disabled={actionLoading}
                    >
                      <option value="Crônico">Crônico</option>
                      <option value="Agudo">Agudo</option>
                    </select>
                  </div>
                  <div className="form-group" style={{ flex: '1 1 140px' }}>
                    <label htmlFor="pat-form-treat-type">Tipo de Tratamento</label>
                    <select
                      id="pat-form-treat-type"
                      className="form-control"
                      value={treatmentType}
                      onChange={(e) => setTreatmentType(e.target.value)}
                      disabled={actionLoading}
                    >
                      <option value="HD">HD (Hemodiálise)</option>
                      <option value="APD">APD (Diálise Peritoneal Automatizada)</option>
                      <option value="CAPD">CAPD (Diálise Peritoneal Ambulatorial Contínua)</option>
                      <option value="DPI">DPI (Diálise Peritoneal Intermitente)</option>
                    </select>
                  </div>
                </div>

                {/* Row 3: Admission Date, Treatment Status, dry Weight */}
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <div className="form-group" style={{ flex: 1.2 }}>
                    <label htmlFor="pat-form-admission">Data de Admissão</label>
                    <input
                      id="pat-form-admission"
                      type="date"
                      className="form-control"
                      value={admissionDate}
                      onChange={(e) => setAdmissionDate(e.target.value)}
                      required
                      disabled={actionLoading}
                    />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label htmlFor="pat-form-status">Status Clínico</label>
                    <select
                      id="pat-form-status"
                      className="form-control"
                      value={treatmentStatus}
                      onChange={(e) => setTreatmentStatus(e.target.value)}
                      disabled={actionLoading}
                    >
                      <option value="Ativo">Ativo</option>
                      <option value="Suspenso">Suspenso</option>
                      <option value="Transplantado">Transplantado</option>
                      <option value="Transferido">Transferido</option>
                      <option value="Óbito">Óbito</option>
                    </select>
                  </div>
                  <div className="form-group" style={{ flex: 0.8 }}>
                    <label htmlFor="pat-form-weight">Peso Seco (kg)</label>
                    <input
                      id="pat-form-weight"
                      type="text"
                      className="form-control"
                      placeholder="Ex: 72.5"
                      value={dryWeight}
                      onChange={(e) => setDryWeight(e.target.value)}
                      disabled={actionLoading}
                    />
                  </div>
                </div>

                {/* Access Type & Frequency */}
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <div className="form-group" style={{ flex: 1.2 }}>
                    <label htmlFor="pat-form-access">Tipo de Acesso Vascular</label>
                    <select
                      id="pat-form-access"
                      className="form-control"
                      value={accessType}
                      onChange={(e) => setAccessType(e.target.value)}
                      disabled={actionLoading}
                    >
                      {accessTypes.map(ac => (
                        <option key={ac.id} value={ac.name}>{ac.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label htmlFor="pat-form-freq">Escala</label>
                    <select
                      id="pat-form-freq"
                      className="form-control"
                      value={dialysisFrequency}
                      onChange={(e) => setDialysisFrequency(e.target.value)}
                      disabled={actionLoading}
                    >
                      {dialysisFrequencies.map(df => (
                        <option key={df.id} value={df.name}>{df.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Row: Shift & Room (DYNAMIC) */}
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label htmlFor="pat-form-shift">Turno de Diálise</label>
                    <select
                      id="pat-form-shift"
                      className="form-control"
                      value={shift}
                      onChange={(e) => setShift(e.target.value)}
                      disabled={actionLoading}
                    >
                      {shifts.map(sh => (
                        <option key={sh.id} value={sh.name}>{sh.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label htmlFor="pat-form-room">Salão Alocado</label>
                    <select
                      id="pat-form-room"
                      className="form-control"
                      value={room}
                      onChange={(e) => setRoom(e.target.value)}
                      disabled={actionLoading}
                    >
                      {rooms.map(rm => (
                        <option key={rm.id} value={rm.name}>{rm.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                  disabled={actionLoading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={actionLoading}
                >
                  <Check size={16} />
                  <span>{actionLoading ? 'Salvando...' : 'Salvar Ficha'}</span>
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
    padding: '0.5rem 0',
  },
  header: {
    marginBottom: '2rem',
  },
  kpiCard: {
    padding: '1.25rem',
    backgroundColor: '#ffffff',
  },
  kpiHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    marginBottom: '0.5rem',
  },
  kpiLabel: {
    fontSize: '0.8rem',
    fontWeight: '600',
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.02em',
  },
  kpiValue: {
    fontSize: '2rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
    lineHeight: '1.1',
  },
  kpiFooter: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    marginTop: '0.5rem',
  },
  filterCard: {
    padding: '1.25rem 1.5rem',
    marginBottom: '1.5rem',
    backgroundColor: '#ffffff',
  },
  filterRow: {
    display: 'flex',
    gap: '1.25rem',
    flexWrap: 'wrap',
    alignItems: 'flex-end',
  },
  searchWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  searchIcon: {
    position: 'absolute',
    left: '0.75rem',
    color: 'var(--text-muted)',
    pointerEvents: 'none',
  },
  closeModalBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
  }
};
