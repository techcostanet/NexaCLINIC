import React, { useState, useEffect, useMemo } from 'react';
import { 
  FileText, 
  Clock, 
  Search, 
  Download, 
  DollarSign,
  AlertTriangle,
  UploadCloud,
  Edit2,
  CheckCircle2,
  X
} from 'lucide-react';
import { dbService } from '../firebase';
import { useUnit } from '../contexts/UnitContext';
import UnitSelector from './common/UnitSelector';

export default function ApacBillingPanel() {
  const { activeUnitId, filterByActiveUnit } = useUnit();
  const [activeTab, setActiveTab] = useState('apacs'); // 'apacs' | 'glosas' | 'remessas'
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Modal para Edição Rápida de APAC
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [apacForm, setApacForm] = useState({
    apacNumber: '',
    apacExpiry: '',
    insurance: 'SUS'
  });

  const [glosaList] = useState([
    { id: 'g1', unitId: 'betim', unit: 'Betim', lote: 'REM-2026-06', paciente: 'ADRIANO BRANDAO DA SILVA', motivo: 'APAC vencida durante o ciclo', valorGlosa: 612.50, status: 'Em Recurso', dataGlosa: '2026-07-05' },
    { id: 'g2', unitId: 'betim', unit: 'Betim', lote: 'REM-2026-05', paciente: 'MARIA APARECIDA COSTA', motivo: 'Divergência no CID', valorGlosa: 1225.00, status: 'Deferido', dataGlosa: '2026-06-12' },
    { id: 'g3', unitId: 'betim', unit: 'Betim', lote: 'REM-2026-06', paciente: 'ROBERTO ALVES PINTO', motivo: 'Assinatura divergente', valorGlosa: 306.25, status: 'Pendente', dataGlosa: '2026-07-10' }
  ]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const pList = await dbService.getPatients();
      setPatients(pList || []);
    } catch (err) {
      console.error(err);
      showAlert('Erro ao carregar dados de APACs dos pacientes.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 5000);
  };

  // Filtragem de Dados pela Unidade Ativa
  const currentPatients = useMemo(() => {
    const list = filterByActiveUnit(patients);
    return list.length > 0 ? list : (patients || []);
  }, [patients, activeUnitId]);
  const currentGlosaList = useMemo(() => filterByActiveUnit(glosaList), [glosaList, activeUnitId]);

  // Lista dinâmica de APACs baseada no cadastro central de pacientes
  const apacList = useMemo(() => {
    const today = new Date();
    return currentPatients.map(p => {
      const expDate = p.apacExpiry ? new Date(p.apacExpiry) : new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000);
      const diffDays = Math.ceil((expDate - today) / (1000 * 60 * 60 * 24));
      
      let status = 'Ativa';
      if (diffDays <= 10) {
        status = 'Urgente';
      } else if (diffDays <= 30) {
        status = 'Atenção';
      }

      return {
        id: p.id,
        patientId: p.id,
        patientName: p.name,
        cpf: p.cpf,
        code: p.apacNumber || '0303020059',
        procedimento: p.treatmentType === 'DP' ? 'Diálise Peritoneal' : 'Hemodiálise Contínua',
        expires: p.apacExpiry || '2026-10-31',
        diffDays,
        status,
        convenio: p.insurance || 'SUS',
        valorMes: p.treatmentType === 'DP' ? 2680.00 : 2450.00,
        unitId: p.unitId,
        unit: p.unit
      };
    });
  }, [currentPatients]);

  const getApacBadgeStyle = (status) => {
    switch (status) {
      case 'Urgente': return { backgroundColor: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5' };
      case 'Atenção': return { backgroundColor: '#fef3c7', color: '#b45309', border: '1px solid #fcd34d' };
      default: return { backgroundColor: '#dcfce7', color: '#166534', border: '1px solid #86efac' };
    }
  };

  const filteredApacs = apacList.filter(a => {
    const term = (searchTerm || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
    const pName = (a.patientName || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    const matchesSearch = pName.includes(term) || (a.code && a.code.includes(term)) || (a.cpf && a.cpf.includes(term));
    const matchesStatus = statusFilter ? a.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  const urgentCount = apacList.filter(a => a.status === 'Urgente').length;
  const warningCount = apacList.filter(a => a.status === 'Atenção').length;
  const totalFaturamentoEst = apacList.reduce((acc, c) => acc + c.valorMes, 0);

  const handleOpenEditApac = (pat) => {
    const rawPatient = patients.find(p => p.id === pat.id);
    if (!rawPatient) return;
    setEditingPatient(rawPatient);
    setApacForm({
      apacNumber: rawPatient.apacNumber || '',
      apacExpiry: rawPatient.apacExpiry || new Date(Date.now() + 90 * 86400000).toISOString().substring(0, 10),
      insurance: rawPatient.insurance || 'SUS'
    });
    setShowEditModal(true);
  };

  const handleSaveApac = async (e) => {
    e.preventDefault();
    if (!editingPatient) return;
    try {
      await dbService.updatePatient(editingPatient.id, {
        apacNumber: apacForm.apacNumber,
        apacExpiry: apacForm.apacExpiry,
        insurance: apacForm.insurance
      });
      showAlert(`APAC do paciente ${editingPatient.name} atualizada com sucesso!`, 'success');
      setShowEditModal(false);
      fetchData();
    } catch (err) {
      console.error(err);
      showAlert('Erro ao atualizar dados de APAC.', 'danger');
    }
  };

  return (
    <div style={styles.container}>
      {/* Mensagem de Feedback */}
      {message.text && (
        <div style={{
          padding: '0.75rem 1rem',
          borderRadius: '8px',
          marginBottom: '1rem',
          backgroundColor: message.type === 'danger' ? '#fee2e2' : '#dcfce7',
          color: message.type === 'danger' ? '#991b1b' : '#166534',
          fontWeight: '600'
        }}>
          {message.text}
        </div>
      )}

      {/* Module Title Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>NexaAPAC — Gestão de APACs e Faturamento</h1>
          <p style={styles.subtitle}>
            Auditoria de guias APAC, faturamento integrado à base central de pacientes, controle de glosas e remessas BPA.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <UnitSelector compact showLabel={false} />
          <button onClick={() => alert('Exportação de Remessa BPA/APAC SUS gerada com sucesso!')} style={styles.btnSecondary}>
            <Download size={16} /> Exportar
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div style={styles.kpiGrid}>
        <div style={styles.kpiCard}>
          <div style={styles.kpiHeader}>
            <span style={styles.kpiLabel}>Cadastrados</span>
            <FileText size={20} color="var(--primary-color)" />
          </div>
          <span style={styles.kpiValue}>{apacList.length} Pacientes</span>
          <span style={styles.kpiSubtext}>Base central regulada</span>
        </div>

        <div style={{ ...styles.kpiCard, borderLeft: '4px solid #ef4444' }}>
          <div style={styles.kpiHeader}>
            <span style={styles.kpiLabel}>Urgente</span>
            <AlertTriangle size={20} color="#ef4444" />
          </div>
          <span style={{ ...styles.kpiValue, color: '#ef4444' }}>{urgentCount} Guias</span>
          <span style={styles.kpiSubtext}>Vencem em menos de 10 dias</span>
        </div>

        <div style={{ ...styles.kpiCard, borderLeft: '4px solid #f59e0b' }}>
          <div style={styles.kpiHeader}>
            <span style={styles.kpiLabel}>Atenção</span>
            <Clock size={20} color="#f59e0b" />
          </div>
          <span style={{ ...styles.kpiValue, color: '#f59e0b' }}>{warningCount} Guias</span>
          <span style={styles.kpiSubtext}>Vencem nos próximos 30 dias</span>
        </div>

        <div style={{ ...styles.kpiCard, borderLeft: '4px solid #10b981' }}>
          <div style={styles.kpiHeader}>
            <span style={styles.kpiLabel}>Faturamento</span>
            <DollarSign size={20} color="#10b981" />
          </div>
          <span style={{ ...styles.kpiValue, color: '#10b981' }}>
            R$ {totalFaturamentoEst.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
          <span style={styles.kpiSubtext}>Repasse mensal estimado</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={styles.tabsHeader}>
        <div style={styles.tabs}>
          <button 
            onClick={() => setActiveTab('apacs')} 
            style={{ ...styles.tabBtn, ...(activeTab === 'apacs' ? styles.tabBtnActive : {}) }}
          >
            📋 Validade ({apacList.length})
          </button>
          <button 
            onClick={() => setActiveTab('glosas')} 
            style={{ ...styles.tabBtn, ...(activeTab === 'glosas' ? styles.tabBtnActive : {}) }}
          >
            ⚠️ Glosas ({currentGlosaList.length})
          </button>
          <button 
            onClick={() => setActiveTab('remessas')} 
            style={{ ...styles.tabBtn, ...(activeTab === 'remessas' ? styles.tabBtnActive : {}) }}
          >
            📦 Remessas
          </button>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div style={styles.filtersBar}>
        <div style={styles.searchWrapper}>
          <Search size={18} style={styles.searchIcon} />
          <input 
            type="text" 
            placeholder="Pesquisar por paciente, CPF ou Nº APAC..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
        </div>

        {activeTab === 'apacs' && (
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={styles.filterSelect}>
            <option value="">Status</option>
            <option value="Urgente">🔴 Urgente (&lt; 10 dias)</option>
            <option value="Atenção">🟡 Atenção (10 a 30 dias)</option>
            <option value="Ativa">🟢 Ativa</option>
          </select>
        )}
      </div>

      {/* TAB 1: APACs List */}
      {activeTab === 'apacs' && (
        <div style={styles.tableWrapper}>
          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Carregando dados das APACs dos pacientes...
            </div>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Paciente</th>
                  <th style={{ padding: '0.75rem 1rem' }}>CPF</th>
                  <th style={{ padding: '0.75rem 1rem' }}>APAC</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Procedimento</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Validade</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Prazo</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Faturamento</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredApacs.length === 0 ? (
                  <tr>
                    <td colSpan="9" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      Nenhum paciente encontrado com os filtros aplicados.
                    </td>
                  </tr>
                ) : (
                  filteredApacs.slice(0, 100).map(apac => (
                    <tr key={apac.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '0.875rem 1rem', fontWeight: '600' }}>{apac.patientName}</td>
                      <td style={{ padding: '0.875rem 1rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>{apac.cpf}</td>
                      <td style={{ padding: '0.875rem 1rem', fontFamily: 'monospace', fontWeight: '600' }}>{apac.code}</td>
                      <td style={{ padding: '0.875rem 1rem' }}>{apac.procedimento}</td>
                      <td style={{ padding: '0.875rem 1rem' }}>{apac.expires ? apac.expires.split('-').reverse().join('/') : '-'}</td>
                      <td style={{ padding: '0.875rem 1rem', fontWeight: '700', color: apac.diffDays <= 10 ? '#ef4444' : apac.diffDays <= 30 ? '#f59e0b' : 'var(--text-primary)' }}>
                        {apac.diffDays} dias
                      </td>
                      <td style={{ padding: '0.875rem 1rem', fontWeight: '700', color: '#10b981' }}>
                        R$ {apac.valorMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td style={{ padding: '0.875rem 1rem' }}>
                        <span style={{ padding: '0.25rem 0.6rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '700', ...getApacBadgeStyle(apac.status) }}>
                          {apac.status}
                        </span>
                      </td>
                      <td style={{ padding: '0.875rem 1rem' }}>
                        <button onClick={() => handleOpenEditApac(apac)} style={styles.actionBtn} title="Editar APAC">
                          <Edit2 size={13} style={{ marginRight: '4px' }} /> Editar
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* TAB 2: Glosas */}
      {activeTab === 'glosas' && (
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '0.75rem 1rem' }}>Lote</th>
                <th style={{ padding: '0.75rem 1rem' }}>Paciente</th>
                <th style={{ padding: '0.75rem 1rem' }}>Motivo</th>
                <th style={{ padding: '0.75rem 1rem' }}>Data</th>
                <th style={{ padding: '0.75rem 1rem' }}>Valor</th>
                <th style={{ padding: '0.75rem 1rem' }}>Recurso</th>
                <th style={{ padding: '0.75rem 1rem' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {currentGlosaList.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    Nenhum registro de glosa para a unidade selecionada.
                  </td>
                </tr>
              ) : (
                currentGlosaList.map(g => (
                  <tr key={g.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '0.875rem 1rem', fontWeight: '700' }}>{g.lote}</td>
                    <td style={{ padding: '0.875rem 1rem', fontWeight: '600' }}>{g.paciente}</td>
                    <td style={{ padding: '0.875rem 1rem' }}>{g.motivo}</td>
                    <td style={{ padding: '0.875rem 1rem' }}>{g.dataGlosa.split('-').reverse().join('/')}</td>
                    <td style={{ padding: '0.875rem 1rem', fontWeight: '700', color: '#ef4444' }}>
                      R$ {g.valorGlosa.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <span style={{
                        padding: '0.2rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        backgroundColor: g.status === 'Deferido' ? '#dcfce7' : g.status === 'Em Recurso' ? '#fef3c7' : '#fee2e2',
                        color: g.status === 'Deferido' ? '#166534' : g.status === 'Em Recurso' ? '#b45309' : '#991b1b'
                      }}>
                        {g.status}
                      </span>
                    </td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <button onClick={() => alert(`Entrando com recurso para a glosa de ${g.paciente}...`)} style={styles.actionBtn}>
                        Recorrer
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: Remessas */}
      {activeTab === 'remessas' && (
        <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
          <UploadCloud size={48} color="var(--primary-color)" style={{ marginBottom: '1rem' }} />
          <h3 style={{ margin: '0 0 0.5rem 0' }}>Geração de Arquivo BPA e APAC</h3>
          <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto 1.5rem auto' }}>
            Consolidação mensal de presenças e sessões dos pacientes da base central para exportação e faturamento.
          </p>
          <button onClick={() => alert('Remessa do mês atual exportada com sucesso!')} style={styles.btnPrimary}>
            <Download size={16} /> Fechar
          </button>
        </div>
      )}

      {/* Modal de Edição de APAC */}
      {showEditModal && editingPatient && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700' }}>
                Atualizar APAC — {editingPatient.name}
              </h3>
              <button onClick={() => setShowEditModal(false)} style={styles.closeBtn}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveApac} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              <div>
                <label style={styles.label}>Nº APAC Autorizada</label>
                <input 
                  type="text" 
                  value={apacForm.apacNumber} 
                  onChange={e => setApacForm(f => ({ ...f, apacNumber: e.target.value }))}
                  required
                  placeholder="Ex: 3126101004523"
                  style={styles.input}
                />
              </div>

              <div>
                <label style={styles.label}>Validade da APAC</label>
                <input 
                  type="date" 
                  value={apacForm.apacExpiry} 
                  onChange={e => setApacForm(f => ({ ...f, apacExpiry: e.target.value }))}
                  required
                  style={styles.input}
                />
              </div>

              <div>
                <label style={styles.label}>Convênio</label>
                <select 
                  value={apacForm.insurance} 
                  onChange={e => setApacForm(f => ({ ...f, insurance: e.target.value }))}
                  style={styles.input}
                >
                  <option value="SUS">SUS</option>
                  <option value="Unimed BH">Unimed BH</option>
                  <option value="Bradesco Saúde">Bradesco Saúde</option>
                  <option value="Amil">Amil</option>
                  <option value="Particular">Particular</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setShowEditModal(false)} style={styles.btnSecondary}>
                  Cancelar
                </button>
                <button type="submit" style={styles.btnPrimary}>
                  Salvar
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
    padding: '1.5rem',
    backgroundColor: '#f8fafc',
    minHeight: '85vh',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
    margin: 0,
  },
  subtitle: {
    fontSize: '0.875rem',
    color: 'var(--text-muted)',
    margin: '0.25rem 0 0 0',
  },
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '1rem',
    marginBottom: '1.5rem',
  },
  kpiCard: {
    backgroundColor: '#ffffff',
    padding: '1rem',
    borderRadius: '8px',
    border: '1px solid var(--border-color)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  kpiHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  kpiLabel: {
    fontSize: '0.75rem',
    fontWeight: '600',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
  },
  kpiValue: {
    fontSize: '1.4rem',
    fontWeight: '800',
    color: 'var(--text-primary)',
    margin: '0.5rem 0 0.25rem 0',
  },
  kpiSubtext: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
  },
  tabsHeader: {
    borderBottom: '1px solid var(--border-color)',
    marginBottom: '1rem',
  },
  tabs: {
    display: 'flex',
    gap: '0.5rem',
  },
  tabBtn: {
    padding: '0.75rem 1.25rem',
    backgroundColor: 'transparent',
    border: 'none',
    borderBottom: '2px solid transparent',
    fontSize: '0.9rem',
    fontWeight: '600',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  tabBtnActive: {
    color: 'var(--primary-color)',
    borderBottom: '2px solid var(--primary-color)',
  },
  filtersBar: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '1rem',
  },
  searchWrapper: {
    position: 'relative',
    flex: 1,
  },
  searchIcon: {
    position: 'absolute',
    left: '0.75rem',
    top: '50%',
    transform: 'translateY(-50%)',
    color: 'var(--text-muted)',
  },
  searchInput: {
    width: '100%',
    padding: '0.5rem 0.75rem 0.5rem 2.5rem',
    borderRadius: '6px',
    border: '1px solid var(--border-color)',
    fontSize: '0.875rem',
  },
  filterSelect: {
    padding: '0.5rem 0.75rem',
    borderRadius: '6px',
    border: '1px solid var(--border-color)',
    fontSize: '0.875rem',
    backgroundColor: '#ffffff',
  },
  tableWrapper: {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    border: '1px solid var(--border-color)',
    overflow: 'hidden',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
    fontSize: '0.875rem',
  },
  btnPrimary: {
    backgroundColor: 'var(--primary-color)',
    color: '#ffffff',
    border: 'none',
    padding: '0.6rem 1.2rem',
    borderRadius: '6px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  btnSecondary: {
    backgroundColor: '#ffffff',
    color: 'var(--text-primary)',
    border: '1px solid var(--border-color)',
    padding: '0.6rem 1rem',
    borderRadius: '6px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  actionBtn: {
    backgroundColor: 'var(--primary-light)',
    color: 'var(--primary-color)',
    border: 'none',
    padding: '0.35rem 0.75rem',
    borderRadius: '4px',
    fontWeight: '600',
    fontSize: '0.8rem',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
  },
  modalContent: {
    backgroundColor: '#ffffff',
    padding: '1.5rem',
    borderRadius: '10px',
    width: '90%',
    maxWidth: '460px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.15)'
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '0.75rem'
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--text-muted)'
  },
  label: {
    display: 'block',
    fontSize: '0.85rem',
    fontWeight: '600',
    color: 'var(--text-secondary)',
    marginBottom: '0.25rem'
  },
  input: {
    width: '100%',
    padding: '0.5rem 0.75rem',
    borderRadius: '6px',
    border: '1px solid var(--border-color)',
    fontSize: '0.875rem'
  }
};
