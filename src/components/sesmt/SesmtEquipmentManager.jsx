import React, { useState } from 'react';
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
  Tag
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
  'Farmácia / Almoxarifado',
  'CPD / Servidores',
  'Sala de Máquinas',
  'DML / Limpeza',
  'Copa / Refeitório',
  'Acesso Externo / Estacionamento'
];

const EXTINGUISHER_TYPES = [
  'CO2 (Dióxido de Carbono)',
  'PQS (Pó Químico Seco)',
  'AP (Água Pressurizada)',
  'Pó ABC (Polivalente)'
];

const HYDRANT_TYPES = [
  'Hidrante de Parede',
  'Hidrante Externo / Coluna'
];

export default function SesmtEquipmentManager({ equipmentData = [], onRefresh }) {
  const [activeCategory, setActiveCategory] = useState('EXTINGUISHER'); // 'EXTINGUISHER' | 'HYDRANT'
  const [filterStatus, setFilterStatus] = useState('TODOS'); // 'TODOS' | 'ATIVO' | 'A_VENCER' | 'VENCIDO' | 'INATIVO'
  const [searchTerm, setSearchTerm] = useState('');
  
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
            <Flame size={16} /> Extintores de Incêndio ({equipmentData.filter(i => (i.category || 'EXTINGUISHER') === 'EXTINGUISHER').length})
          </button>
          <button 
            style={{ ...styles.categoryBtn, ...(activeCategory === 'HYDRANT' ? styles.categoryBtnActive : {}) }}
            onClick={() => { setActiveCategory('HYDRANT'); setFilterStatus('TODOS'); }}
          >
            <Droplet size={16} /> Hidrantes de Parede / Coluna ({equipmentData.filter(i => i.category === 'HYDRANT').length})
          </button>
        </div>

        <button onClick={() => handleOpenModal()} style={styles.addBtn}>
          <Plus size={16} /> Novo Equipamento
        </button>
      </div>

      {/* Cards de Métricas e Alertas */}
      <div style={styles.statsGrid}>
        <div style={styles.statBox}>
          <span style={styles.statLabel}>Total Cadastrado</span>
          <span style={styles.statValue}>{totalCount}</span>
        </div>
        <div style={{ ...styles.statBox, borderLeft: '4px solid #16a34a' }}>
          <span style={styles.statLabel}>Ativos em Operação</span>
          <span style={{ ...styles.statValue, color: '#16a34a' }}>{activeCount}</span>
        </div>
        <div style={{ ...styles.statBox, borderLeft: '4px solid #d97706' }}>
          <span style={styles.statLabel}>A Vencer (em 60 dias)</span>
          <span style={{ ...styles.statValue, color: '#d97706' }}>{expiringCount}</span>
        </div>
        <div style={{ ...styles.statBox, borderLeft: '4px solid #dc2626' }}>
          <span style={styles.statLabel}>Vencidos (Recarga Urgente)</span>
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

      {/* Tabela de Equipamentos */}
      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Nº / Cód.</th>
              <th style={styles.th}>Localização / Setor</th>
              <th style={styles.th}>Tipo</th>
              <th style={styles.th}>Capacidade</th>
              <th style={styles.th}>Última Carga</th>
              <th style={styles.th}>Validade da Carga</th>
              <th style={styles.th}>Teste Hidrostático</th>
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
                          title="Editar Equipamento"
                        >
                          <Edit size={14} />
                        </button>
                        <button 
                          onClick={() => handleToggleStatus(item)} 
                          style={{
                            ...styles.toggleStatusBtn,
                            color: item.status === 'ATIVO' ? '#d97706' : '#16a34a'
                          }} 
                          title={item.status === 'ATIVO' ? 'Inativar Equipamento' : 'Ativar Equipamento'}
                        >
                          <Power size={14} />
                        </button>
                        <button 
                          onClick={() => setDeleteConfirmId(item.id)} 
                          style={styles.deleteBtn} 
                          title="Excluir Equipamento"
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
                    <option value="EXTINGUISHER">Extintor de Incêndio</option>
                    <option value="HYDRANT">Hidrante de Parede / Coluna</option>
                  </select>
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Nº / Código de Identificação *</label>
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
                  <label style={styles.label}>Localização / Setor *</label>
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
                  <label style={styles.label}>Tipo de Equipamento / Agente *</label>
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
                  <label style={styles.label}>Capacidade / Tamanho</label>
                  <input 
                    type="text" 
                    placeholder="Ex: 6 kg, 10 L, Mangueira 30m" 
                    value={formData.capacity} 
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    style={styles.input}
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Status Operacional *</label>
                  <select 
                    value={formData.status} 
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    style={styles.select}
                  >
                    <option value="ATIVO">ATIVO (Em Operação)</option>
                    <option value="MANUTENCAO">EM MANUTENÇÃO / RECARGA</option>
                    <option value="INATIVO">INATIVO (Baixado / Reserva)</option>
                  </select>
                </div>
              </div>

              <div style={styles.formRow3}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Data da Última Carga</label>
                  <input 
                    type="date" 
                    value={formData.rechargeDate} 
                    onChange={(e) => setFormData({ ...formData, rechargeDate: e.target.value })}
                    style={styles.input}
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Validade da Carga / Recarga *</label>
                  <input 
                    type="date" 
                    value={formData.validityDate} 
                    onChange={(e) => setFormData({ ...formData, validityDate: e.target.value })}
                    style={{ ...styles.input, borderColor: '#0891b2' }}
                    required
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Validade Teste Hidrostático (5 anos)</label>
                  <input 
                    type="date" 
                    value={formData.hydrostaticTestDate} 
                    onChange={(e) => setFormData({ ...formData, hydrostaticTestDate: e.target.value })}
                    style={styles.input}
                  />
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Observações / Instruções Adicionais</label>
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
    width: '100%',
    maxWidth: '650px',
    maxHeight: '90vh',
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
