import React, { useState, useEffect } from 'react';
import { dbService } from '../../firebase';
import { 
  Shield, 
  Flame, 
  Droplet, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  X, 
  RotateCcw, 
  Power, 
  Calendar, 
  Building2, 
  Tag,
  LayoutGrid,
  Table
} from 'lucide-react';

const SECTORS_LIST = [
  'Bloco Cirúrgico',
  'Salão-1',
  'Salão-2',
  'Salão-3',
  'Diálise Peritoneal',
  'Hemodiálise Externa',
  'Reuso',
  'Sala Amarela',
  'Recepção Principal',
  'Corredor Central',
  'Farmácia',
  'CPD',
  'Sala de Máquinas',
  'DML',
  'Copa',
  'Acesso Externo'
];

const EXTINGUISHER_TYPES = [
  'CO2 (Dióxido de Carbono)',
  'PQS (Pó Químico Seco)',
  'AP (Água Pressurizada)',
  'Pó ABC (Polivalente)'
];

const HYDRANT_TYPES = [
  'Hidrante de Parede',
  'Hidrante Externo'
];

export default function SesmtEquipmentManager({ equipmentData = [], onRefresh }) {
  const [activeCategory, setActiveCategory] = useState('EXTINGUISHER'); // 'EXTINGUISHER' | 'HYDRANT'
  const [filterStatus, setFilterStatus] = useState('TODOS'); // 'TODOS' | 'ATIVO' | 'A_VENCER' | 'VENCIDO' | 'INATIVO'
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('cards');

  useEffect(() => {
    if (window.innerWidth >= 1024) {
      setViewMode('table');
    } else {
      setViewMode('cards');
    }
  }, []);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState(getInitialFormData('EXTINGUISHER'));
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [feedbackMsg, setFeedbackMsg] = useState({ text: '', type: '' });

  function getInitialFormData(category) {
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    const defVal = nextYear.toISOString().split('T')[0];

    const hydroDate = new Date();
    hydroDate.setFullYear(hydroDate.getFullYear() + 5);
    const defHydro = hydroDate.toISOString().split('T')[0];

    return {
      category: category || 'EXTINGUISHER',
      code: '',
      sector: SECTORS_LIST[0],
      type: category === 'HYDRANT' ? HYDRANT_TYPES[0] : EXTINGUISHER_TYPES[0],
      capacity: category === 'HYDRANT' ? 'Mangueira 30m' : '6 kg',
      rechargeDate: new Date().toISOString().split('T')[0],
      validityDate: defVal,
      hydrostaticTestDate: defHydro,
      status: 'ATIVO',
      observations: ''
    };
  }

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        category: item.category || activeCategory,
        code: item.code || '',
        sector: item.sector || SECTORS_LIST[0],
        type: item.type || '',
        capacity: item.capacity || '',
        rechargeDate: item.rechargeDate || '',
        validityDate: item.validityDate || '',
        hydrostaticTestDate: item.hydrostaticTestDate || '',
        status: item.status || 'ATIVO',
        observations: item.observations || ''
      });
    } else {
      setEditingItem(null);
      setFormData(getInitialFormData(activeCategory));
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingItem(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await dbService.saveEquipment({
        ...(editingItem ? { id: editingItem.id } : {}),
        ...formData
      });
      setFeedbackMsg({ text: editingItem ? 'Equipamento atualizado com sucesso!' : 'Equipamento cadastrado com sucesso!', type: 'success' });
      handleCloseModal();
      if (onRefresh) onRefresh();
      setTimeout(() => setFeedbackMsg({ text: '', type: '' }), 3500);
    } catch (err) {
      console.error(err);
      setFeedbackMsg({ text: 'Erro ao salvar equipamento.', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await dbService.deleteEquipment(id);
      setDeleteConfirmId(null);
      setFeedbackMsg({ text: 'Equipamento removido com sucesso!', type: 'success' });
      if (onRefresh) onRefresh();
      setTimeout(() => setFeedbackMsg({ text: '', type: '' }), 3500);
    } catch (err) {
      console.error(err);
      setFeedbackMsg({ text: 'Erro ao excluir equipamento.', type: 'error' });
    }
  };

  const handleToggleStatus = async (item) => {
    try {
      const newStatus = item.status === 'ATIVO' ? 'INATIVO' : 'ATIVO';
      await dbService.saveEquipment({
        ...item,
        status: newStatus
      });
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  // Helper de cálculo de status de validade
  const getValidityStatus = (dateStr) => {
    if (!dateStr) return { label: 'Sem Data', color: '#64748b', bg: '#f1f5f9' };
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(dateStr + 'T00:00:00');
    
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { label: `Vencido (${Math.abs(diffDays)}d atrás)`, status: 'VENCIDO', color: '#dc2626', bg: '#fef2f2', border: '#fecaca' };
    }
    if (diffDays <= 60) {
      return { label: `A Vencer (${diffDays} dias)`, status: 'A_VENCER', color: '#d97706', bg: '#fffbeb', border: '#fde68a' };
    }
    return { label: 'Na Validade', status: 'OK', color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' };
  };

  // Filtragem por Categoria (Extintor / Hidrante)
  const categoryItems = equipmentData.filter(item => (item.category || 'EXTINGUISHER') === activeCategory);

  // Contadores
  let totalCount = categoryItems.length;
  let activeCount = 0;
  let expiringCount = 0;
  let expiredCount = 0;

  categoryItems.forEach(item => {
    if (item.status === 'ATIVO') activeCount++;
    const vStat = getValidityStatus(item.validityDate);
    if (vStat.status === 'A_VENCER') expiringCount++;
    if (vStat.status === 'VENCIDO') expiredCount++;
  });

  // Filtragem combinada
  const filteredList = categoryItems.filter(item => {
    // Filtro por texto de busca
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchCode = (item.code || '').toLowerCase().includes(term);
      const matchSector = (item.sector || '').toLowerCase().includes(term);
      const matchType = (item.type || '').toLowerCase().includes(term);
      if (!matchCode && !matchSector && !matchType) return false;
    }

    // Filtro por status
    if (filterStatus === 'ATIVO') return item.status === 'ATIVO';
    if (filterStatus === 'INATIVO') return item.status === 'INATIVO';
    if (filterStatus === 'A_VENCER') {
      const vStat = getValidityStatus(item.validityDate);
      return vStat.status === 'A_VENCER';
    }
    if (filterStatus === 'VENCIDO') {
      const vStat = getValidityStatus(item.validityDate);
      return vStat.status === 'VENCIDO';
    }

    return true;
  });

  return (
    <div style={styles.card}>
      {/* Top Banner / Feedback Message */}
      {feedbackMsg.text && (
        <div style={{
          ...styles.alertBanner,
          backgroundColor: feedbackMsg.type === 'success' ? '#f0fdf4' : '#fef2f2',
          borderColor: feedbackMsg.type === 'success' ? '#bbf7d0' : '#fecaca',
          color: feedbackMsg.type === 'success' ? '#166534' : '#991b1b'
        }}>
          {feedbackMsg.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* Header com Categorias e Botão Novo */}
      <div style={styles.topRow}>
        <div style={styles.categoryToggleGroup}>
          <button 
            style={{ ...styles.categoryBtn, ...(activeCategory === 'EXTINGUISHER' ? styles.categoryBtnActive : {}) }}
            onClick={() => { setActiveCategory('EXTINGUISHER'); setFilterStatus('TODOS'); }}
          >
            <Flame size={16} /> Extintores ({equipmentData.filter(i => (i.category || 'EXTINGUISHER') === 'EXTINGUISHER').length})
          </button>
          <button 
            style={{ ...styles.categoryBtn, ...(activeCategory === 'HYDRANT' ? styles.categoryBtnActive : {}) }}
            onClick={() => { setActiveCategory('HYDRANT'); setFilterStatus('TODOS'); }}
          >
            <Droplet size={16} /> Hidrantes ({equipmentData.filter(i => i.category === 'HYDRANT').length})
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <div style={styles.viewToggleGroup}>
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              style={{ ...styles.viewToggleBtn, ...(viewMode === 'cards' ? styles.viewToggleBtnActive : {}) }}
              title="Modo Cartões (ideal para celular e tablet)"
            >
              <LayoutGrid size={15} /> Cartões
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              style={{ ...styles.viewToggleBtn, ...(viewMode === 'table' ? styles.viewToggleBtnActive : {}) }}
              title="Modo Tabela (ideal para computador)"
            >
              <Table size={15} /> Tabela
            </button>
          </div>

          <button onClick={() => handleOpenModal()} style={styles.addBtn}>
            <Plus size={16} /> Novo Equipamento
          </button>
        </div>
      </div>

      {/* Cards de Métricas e Alertas */}
      <div style={styles.statsGrid}>
        <div style={styles.statBox}>
          <span style={styles.statLabel}>Total</span>
          <span style={styles.statValue}>{totalCount}</span>
        </div>
        <div style={{ ...styles.statBox, borderLeft: '4px solid #16a34a' }}>
          <span style={styles.statLabel}>Ativos</span>
          <span style={{ ...styles.statValue, color: '#16a34a' }}>{activeCount}</span>
        </div>
        <div style={{ ...styles.statBox, borderLeft: '4px solid #d97706' }}>
          <span style={styles.statLabel}>A Vencer (60d)</span>
          <span style={{ ...styles.statValue, color: '#d97706' }}>{expiringCount}</span>
        </div>
        <div style={{ ...styles.statBox, borderLeft: '4px solid #dc2626' }}>
          <span style={styles.statLabel}>Vencidos</span>
          <span style={{ ...styles.statValue, color: '#dc2626' }}>{expiredCount}</span>
        </div>
      </div>

      {/* Barra de Filtros e Busca */}
      <div style={styles.filterBar}>
        <div style={styles.searchBox}>
          <Search size={16} color="#64748b" />
          <input 
            type="text" 
            placeholder="Buscar por código, setor ou tipo..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} style={styles.clearSearchBtn}>
              <X size={14} />
            </button>
          )}
        </div>

        <div style={styles.filterStatusGroup}>
          <button 
            style={{ ...styles.statusFilterBtn, ...(filterStatus === 'TODOS' ? styles.statusFilterBtnActive : {}) }}
            onClick={() => setFilterStatus('TODOS')}
          >
            Todos
          </button>
          <button 
            style={{ ...styles.statusFilterBtn, ...(filterStatus === 'ATIVO' ? styles.statusFilterBtnActive : {}) }}
            onClick={() => setFilterStatus('ATIVO')}
          >
            Ativos
          </button>
          <button 
            style={{ ...styles.statusFilterBtn, ...(filterStatus === 'A_VENCER' ? styles.statusFilterBtnActive : {}) }}
            onClick={() => setFilterStatus('A_VENCER')}
          >
            A Vencer ({expiringCount})
          </button>
          <button 
            style={{ ...styles.statusFilterBtn, ...(filterStatus === 'VENCIDO' ? styles.statusFilterBtnActive : {}) }}
            onClick={() => setFilterStatus('VENCIDO')}
          >
            Vencidos ({expiredCount})
          </button>
          <button 
            style={{ ...styles.statusFilterBtn, ...(filterStatus === 'INATIVO' ? styles.statusFilterBtnActive : {}) }}
            onClick={() => setFilterStatus('INATIVO')}
          >
            Inativos
          </button>
        </div>
      </div>

      {/* 1. Modo Cartões (Otimizado para Celular e Tablet) */}
      {viewMode === 'cards' && (
        <div style={styles.equipCardsGrid}>
          {filteredList.length === 0 ? (
            <div style={styles.emptyCardBox}>
              <p style={{ margin: 0, color: '#94a3b8' }}>Nenhum equipamento encontrado com os filtros atuais.</p>
            </div>
          ) : (
            filteredList.map((item) => {
              const vStatus = getValidityStatus(item.validityDate);
              const isInactive = item.status === 'INATIVO';

              return (
                <div 
                  key={item.id} 
                  style={{
                    ...styles.equipCard,
                    opacity: isInactive ? 0.65 : 1,
                    borderLeft: `4px solid ${vStatus.color || '#cbd5e1'}`
                  }}
                >
                  <div style={styles.equipCardTop}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span style={styles.equipCodeBadge}>{item.code || 'S/N'}</span>
                      <span style={styles.equipSector}>{item.sector}</span>
                      <span style={styles.typeBadge}>{item.type}</span>
                    </div>

                    <div style={styles.actionGroup}>
                      <button 
                        onClick={() => handleOpenModal(item)} 
                        style={styles.editBtn} 
                        title="Editar"
                      >
                        <Edit size={14} />
                      </button>
                      <button 
                        onClick={() => handleToggleStatus(item)} 
                        style={{
                          ...styles.toggleStatusBtn,
                          color: item.status === 'ATIVO' ? '#d97706' : '#16a34a'
                        }} 
                        title={item.status === 'ATIVO' ? 'Inativar' : 'Ativar'}
                      >
                        <Power size={14} />
                      </button>
                      <button 
                        onClick={() => setDeleteConfirmId(item.id)} 
                        style={styles.deleteBtn} 
                        title="Excluir"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <div style={styles.equipCardDetails}>
                    <div style={styles.equipDetailItem}>
                      <span style={styles.detailKey}>Capacidade</span>
                      <span style={styles.detailVal}>{item.capacity || '-'}</span>
                    </div>
                    <div style={styles.equipDetailItem}>
                      <span style={styles.detailKey}>Última Carga</span>
                      <span style={styles.detailVal}>{item.rechargeDate ? formatDateBR(item.rechargeDate) : '-'}</span>
                    </div>
                    <div style={styles.equipDetailItem}>
                      <span style={styles.detailKey}>Validade</span>
                      <span style={{
                        ...styles.validityBadge,
                        backgroundColor: vStatus.bg,
                        color: vStatus.color,
                        border: `1px solid ${vStatus.border || vStatus.color}`
                      }}>
                        {item.validityDate ? formatDateBR(item.validityDate) : '-'} ({vStatus.label})
                      </span>
                    </div>
                    {item.hydrostaticTestDate && (
                      <div style={styles.equipDetailItem}>
                        <span style={styles.detailKey}>Hidrostático</span>
                        <span style={styles.detailVal}>{formatDateBR(item.hydrostaticTestDate)}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* 2. Modo Tabela Clássica (Desktop) */}
      {viewMode === 'table' && (
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Código</th>
                <th style={styles.th}>Setor</th>
                <th style={styles.th}>Tipo</th>
                <th style={styles.th}>Capacidade</th>
                <th style={styles.th}>Recarga</th>
                <th style={styles.th}>Validade</th>
                <th style={styles.th}>Hidrostático</th>
                <th style={styles.th}>Status</th>
                <th style={{ ...styles.th, textAlign: 'center' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan="9" style={styles.emptyRow}>
                    Nenhum equipamento encontrado com os filtros atuais.
                  </td>
                </tr>
              ) : (
                filteredList.map((item) => {
                  const vStatus = getValidityStatus(item.validityDate);
                  const isInactive = item.status === 'INATIVO';

                  return (
                    <tr key={item.id} style={{ ...styles.tr, opacity: isInactive ? 0.6 : 1 }}>
                      <td style={{ ...styles.td, fontWeight: '700', color: '#0f172a' }}>
                        {item.code || 'S/N'}
                      </td>
                      <td style={styles.td}>
                        <span style={{ fontWeight: '600', color: '#334155' }}>{item.sector}</span>
                      </td>
                      <td style={styles.td}>
                        <span style={styles.typeBadge}>{item.type}</span>
                      </td>
                      <td style={styles.td}>{item.capacity || '-'}</td>
                      <td style={styles.td}>
                        {item.rechargeDate ? formatDateBR(item.rechargeDate) : '-'}
                      </td>
                      <td style={styles.td}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                          <span style={{ fontWeight: '600' }}>{item.validityDate ? formatDateBR(item.validityDate) : '-'}</span>
                          <span style={{
                            fontSize: '0.72rem',
                            fontWeight: '700',
                            padding: '0.15rem 0.45rem',
                            borderRadius: '4px',
                            display: 'inline-block',
                            width: 'fit-content',
                            backgroundColor: vStatus.bg,
                            color: vStatus.color,
                            border: `1px solid ${vStatus.border || vStatus.color}`
                          }}>
                            {vStatus.label}
                          </span>
                        </div>
                      </td>
                      <td style={styles.td}>
                        {item.hydrostaticTestDate ? formatDateBR(item.hydrostaticTestDate) : '-'}
                      </td>
                      <td style={styles.td}>
                        <span style={{
                          padding: '0.2rem 0.5rem',
                          borderRadius: '12px',
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          backgroundColor: item.status === 'ATIVO' ? '#f0fdf4' : '#f1f5f9',
                          color: item.status === 'ATIVO' ? '#16a34a' : '#64748b'
                        }}>
                          {item.status || 'ATIVO'}
                        </span>
                      </td>
                      <td style={{ ...styles.td, textAlign: 'center' }}>
                        <div style={styles.actionGroup}>
                          <button 
                            onClick={() => handleOpenModal(item)} 
                            style={styles.editBtn} 
                            title="Editar"
                          >
                            <Edit size={14} />
                          </button>
                          <button 
                            onClick={() => handleToggleStatus(item)} 
                            style={{
                              ...styles.toggleStatusBtn,
                              color: item.status === 'ATIVO' ? '#d97706' : '#16a34a'
                            }} 
                            title={item.status === 'ATIVO' ? 'Inativar' : 'Ativar'}
                          >
                            <Power size={14} />
                          </button>
                          <button 
                            onClick={() => setDeleteConfirmId(item.id)} 
                            style={styles.deleteBtn} 
                            title="Excluir"
                          >
                            <Trash2 size={14} />
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
      )}

      {/* Modal de Confirmação de Exclusão */}
      {deleteConfirmId && (
        <div style={styles.modalOverlay}>
          <div style={styles.deleteModalBox}>
            <AlertTriangle size={36} color="#dc2626" style={{ marginBottom: '0.5rem' }} />
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#0f172a' }}>Confirmar Exclusão</h3>
            <p style={{ margin: '0 0 1.25rem 0', color: '#64748b', fontSize: '0.85rem' }}>
              Deseja realmente remover este equipamento do cadastro? Esta ação é irreversível.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button onClick={() => setDeleteConfirmId(null)} style={styles.cancelBtn}>
                Cancelar
              </button>
              <button onClick={() => handleDelete(deleteConfirmId)} style={styles.confirmDeleteBtn}>
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Adicionar / Editar Equipamento */}
      {modalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalBox}>
            <div style={styles.modalHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Shield size={20} color="#0891b2" />
                <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#0f172a', fontWeight: '800' }}>
                  {editingItem ? 'Editar Equipamento' : 'Novo Equipamento'}
                </h3>
              </div>
              <button onClick={handleCloseModal} style={styles.closeBtn}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={styles.modalBody}>
              <div style={styles.formRow2}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Categoria *</label>
                  <select 
                    value={formData.category} 
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    style={styles.select}
                  >
                    <option value="EXTINGUISHER">Extintor</option>
                    <option value="HYDRANT">Hidrante</option>
                  </select>
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Código *</label>
                  <input 
                    type="text" 
                    placeholder="Ex: EXT-01 ou HID-01" 
                    value={formData.code} 
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    style={styles.input}
                    required
                  />
                </div>
              </div>

              <div style={styles.formRow2}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Setor *</label>
                  <select 
                    value={formData.sector} 
                    onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                    style={styles.select}
                  >
                    {SECTORS_LIST.map(sec => (
                      <option key={sec} value={sec}>{sec}</option>
                    ))}
                  </select>
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Tipo *</label>
                  <input 
                    type="text" 
                    placeholder="Ex: CO2 (6kg), AP (10L), PQS (4kg)" 
                    value={formData.type} 
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    style={styles.input}
                    required
                  />
                </div>
              </div>

              <div style={styles.formRow2}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Capacidade</label>
                  <input 
                    type="text" 
                    placeholder="Ex: 6 kg, 10 L, Mangueira 30m" 
                    value={formData.capacity} 
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    style={styles.input}
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Status *</label>
                  <select 
                    value={formData.status} 
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    style={styles.select}
                  >
                    <option value="ATIVO">ATIVO</option>
                    <option value="MANUTENCAO">MANUTENÇÃO</option>
                    <option value="INATIVO">INATIVO</option>
                  </select>
                </div>
              </div>

              <div style={styles.formRow3}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Recarga</label>
                  <input 
                    type="date" 
                    value={formData.rechargeDate} 
                    onChange={(e) => setFormData({ ...formData, rechargeDate: e.target.value })}
                    style={styles.input}
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Validade *</label>
                  <input 
                    type="date" 
                    value={formData.validityDate} 
                    onChange={(e) => setFormData({ ...formData, validityDate: e.target.value })}
                    style={{ ...styles.input, borderColor: '#0891b2' }}
                    required
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Hidrostático</label>
                  <input 
                    type="date" 
                    value={formData.hydrostaticTestDate} 
                    onChange={(e) => setFormData({ ...formData, hydrostaticTestDate: e.target.value })}
                    style={styles.input}
                  />
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Observações</label>
                <textarea 
                  rows="2" 
                  placeholder="Informações sobre o suporte, empresa de recarga, histórico, etc." 
                  value={formData.observations}
                  onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                  style={styles.textarea}
                />
              </div>

              <div style={styles.modalFooter}>
                <button type="button" onClick={handleCloseModal} style={styles.cancelBtn}>
                  Cancelar
                </button>
                <button type="submit" disabled={submitting} style={styles.saveBtn}>
                  {submitting ? 'Salvando...' : editingItem ? 'Salvar Alterações' : 'Cadastrar Equipamento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function formatDateBR(dateStr) {
  if (!dateStr) return '-';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
}

const styles = {
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    padding: '1.5rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
  },
  alertBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    border: '1px solid',
    marginBottom: '1rem',
    fontSize: '0.9rem',
    fontWeight: '600'
  },
  topRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1rem',
    marginBottom: '1.25rem'
  },
  categoryToggleGroup: {
    display: 'flex',
    gap: '0.5rem',
    backgroundColor: '#f1f5f9',
    padding: '0.25rem',
    borderRadius: '8px'
  },
  categoryBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    padding: '0.5rem 1rem',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: 'transparent',
    color: '#64748b',
    fontSize: '0.85rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.15s'
  },
  categoryBtnActive: {
    backgroundColor: '#ffffff',
    color: '#0891b2',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  addBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    padding: '0.55rem 1.1rem',
    backgroundColor: '#0891b2',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.85rem',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 2px 5px rgba(8, 145, 178, 0.25)'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '0.75rem',
    marginBottom: '1.25rem'
  },
  statBox: {
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '0.85rem 1rem',
    display: 'flex',
    flexDirection: 'column'
  },
  statLabel: {
    fontSize: '0.75rem',
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase'
  },
  statValue: {
    fontSize: '1.5rem',
    fontWeight: '800',
    color: '#0f172a',
    marginTop: '0.2rem'
  },
  filterBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1rem',
    marginBottom: '1rem',
    paddingBottom: '1rem',
    borderBottom: '1px solid #f1f5f9'
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    backgroundColor: '#f8fafc',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    padding: '0.4rem 0.75rem',
    minWidth: '280px'
  },
  searchInput: {
    border: 'none',
    background: 'none',
    outline: 'none',
    fontSize: '0.85rem',
    color: '#0f172a',
    width: '100%'
  },
  clearSearchBtn: {
    background: 'none',
    border: 'none',
    color: '#94a3b8',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center'
  },
  filterStatusGroup: {
    display: 'flex',
    gap: '0.35rem',
    flexWrap: 'wrap'
  },
  statusFilterBtn: {
    padding: '0.35rem 0.7rem',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    backgroundColor: '#ffffff',
    fontSize: '0.8rem',
    fontWeight: '600',
    color: '#475569',
    cursor: 'pointer'
  },
  statusFilterBtnActive: {
    backgroundColor: '#0f172a',
    color: '#ffffff',
    borderColor: '#0f172a'
  },
  tableWrapper: {
    overflowX: 'auto'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
    fontSize: '0.85rem'
  },
  th: {
    backgroundColor: '#154c79',
    color: '#ffffff',
    padding: '0.65rem 0.75rem',
    fontWeight: '700',
    fontSize: '0.8rem',
    border: '1px solid #0f3d61',
    whiteSpace: 'nowrap'
  },
  tr: {
    borderBottom: '1px solid #e2e8f0',
    transition: 'background 0.1s'
  },
  td: {
    padding: '0.65rem 0.75rem',
    color: '#334155',
    verticalAlign: 'middle'
  },
  typeBadge: {
    backgroundColor: '#f1f5f9',
    color: '#0f172a',
    padding: '0.2rem 0.5rem',
    borderRadius: '4px',
    fontWeight: '600',
    fontSize: '0.78rem'
  },
  actionGroup: {
    display: 'inline-flex',
    gap: '0.35rem'
  },
  editBtn: {
    padding: '0.35rem',
    backgroundColor: '#f0fdfa',
    color: '#0d9488',
    border: '1px solid #ccfbf1',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  toggleStatusBtn: {
    padding: '0.35rem',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  deleteBtn: {
    padding: '0.35rem',
    backgroundColor: '#fef2f2',
    color: '#dc2626',
    border: '1px solid #fecaca',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  emptyRow: {
    textAlign: 'center',
    padding: '2rem',
    color: '#94a3b8',
    fontStyle: 'italic'
  },
  viewToggleGroup: {
    display: 'flex',
    backgroundColor: '#f1f5f9',
    padding: '0.2rem',
    borderRadius: '8px'
  },
  viewToggleBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
    padding: '0.35rem 0.7rem',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: 'transparent',
    color: '#64748b',
    fontSize: '0.78rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.15s'
  },
  viewToggleBtnActive: {
    backgroundColor: '#ffffff',
    color: '#0891b2',
    boxShadow: '0 1px 2px rgba(0,0,0,0.08)'
  },
  equipCardsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '1rem'
  },
  equipCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
  },
  equipCardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '0.5rem',
    paddingBottom: '0.65rem',
    borderBottom: '1px solid #f1f5f9'
  },
  equipCodeBadge: {
    backgroundColor: '#0f172a',
    color: '#ffffff',
    padding: '0.2rem 0.55rem',
    borderRadius: '6px',
    fontWeight: '800',
    fontSize: '0.82rem'
  },
  equipSector: {
    fontWeight: '700',
    color: '#1e293b',
    fontSize: '0.88rem'
  },
  equipCardDetails: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
    gap: '0.6rem'
  },
  equipDetailItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.15rem'
  },
  detailKey: {
    fontSize: '0.72rem',
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase'
  },
  detailVal: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#0f172a'
  },
  validityBadge: {
    fontSize: '0.75rem',
    fontWeight: '700',
    padding: '0.15rem 0.5rem',
    borderRadius: '4px',
    display: 'inline-block',
    width: 'fit-content'
  },
  emptyCardBox: {
    textAlign: 'center',
    padding: '2.5rem',
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    border: '1px dashed #cbd5e1'
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
    zIndex: 9999,
    padding: '1rem'
  },
  modalBox: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    width: '95%',
    maxWidth: '650px',
    maxHeight: '92vh',
    overflowY: 'auto',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)'
  },
  deleteModalBox: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    width: '100%',
    maxWidth: '400px',
    padding: '1.75rem',
    textAlign: 'center',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)'
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.25rem 1.5rem',
    borderBottom: '1px solid #e2e8f0'
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: '#94a3b8',
    cursor: 'pointer'
  },
  modalBody: {
    padding: '1.25rem 1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  formRow2: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '1rem'
  },
  formRow3: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
    gap: '0.75rem'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem'
  },
  label: {
    fontSize: '0.8rem',
    fontWeight: '700',
    color: '#334155'
  },
  input: {
    padding: '0.55rem 0.75rem',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    fontSize: '0.85rem',
    color: '#0f172a',
    backgroundColor: '#ffffff'
  },
  select: {
    padding: '0.55rem 0.75rem',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    fontSize: '0.85rem',
    color: '#0f172a',
    backgroundColor: '#ffffff',
    cursor: 'pointer'
  },
  textarea: {
    padding: '0.55rem 0.75rem',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    fontSize: '0.85rem',
    color: '#0f172a',
    resize: 'vertical'
  },
  modalFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.75rem',
    paddingTop: '1rem',
    borderTop: '1px solid #e2e8f0',
    marginTop: '0.5rem'
  },
  cancelBtn: {
    padding: '0.55rem 1rem',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    backgroundColor: '#ffffff',
    color: '#475569',
    fontWeight: '600',
    fontSize: '0.85rem',
    cursor: 'pointer'
  },
  confirmDeleteBtn: {
    padding: '0.55rem 1.25rem',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: '#dc2626',
    color: '#ffffff',
    fontWeight: '700',
    fontSize: '0.85rem',
    cursor: 'pointer'
  },
  saveBtn: {
    padding: '0.55rem 1.25rem',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: '#0891b2',
    color: '#ffffff',
    fontWeight: '700',
    fontSize: '0.85rem',
    cursor: 'pointer'
  }
};
