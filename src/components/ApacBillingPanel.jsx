import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  Clock, 
  Search, 
  Download, 
  DollarSign,
  AlertTriangle,
  UploadCloud
} from 'lucide-react';
import { useUnit } from '../contexts/UnitContext';
import UnitSelector from './common/UnitSelector';

export default function ApacBillingPanel() {
  const { activeUnitId, filterByActiveUnit, matchItemUnit } = useUnit();
  const [activeTab, setActiveTab] = useState('apacs'); // 'apacs' | 'glosas' | 'remessas'
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Simulated dataset for APACs & Billing (Tagged with betim)
  const [apacList] = useState([
    { id: '1', unitId: 'betim', unit: 'Betim', patientName: 'ADAIR PRAXEDES MORENO', code: '0303020059', procedimiento: 'Hemodiálise Contínua (Trissemanal)', expires: '2026-07-28', status: 'Atenção', convenio: 'SUS', valorMes: 2450.00 },
    { id: '2', unitId: 'betim', unit: 'Betim', patientName: 'ADAO LUCIANO DIAS', code: '0303020059', procedimiento: 'Hemodiálise Contínua (Trissemanal)', expires: '2026-08-15', status: 'Ativa', convenio: 'SUS', valorMes: 2450.00 },
    { id: '3', unitId: 'betim', unit: 'Betim', patientName: 'ADRIANO BRANDAO DA SILVA', code: '0303020059', procedimiento: 'Hemodiálise Contínua (Trissemanal)', expires: '2026-07-20', status: 'Urgente', convenio: 'SUS', valorMes: 2450.00 },
    { id: '4', unitId: 'betim', unit: 'Betim', patientName: 'AGMAR DE SOUZA TAVARES', code: '0303020059', procedimiento: 'Hemodiálise Contínua (Trissemanal)', expires: '2026-09-02', status: 'Ativa', convenio: 'SUS', valorMes: 2450.00 },
    { id: '5', unitId: 'betim', unit: 'Betim', patientName: 'ALAN ALVES DE SOUZA', code: '0303020059', procedimiento: 'Hemodiálise Contínua (Trissemanal)', expires: '2026-07-22', status: 'Urgente', convenio: 'SUS', valorMes: 2450.00 },
    { id: '6', unitId: 'betim', unit: 'Betim', patientName: 'CARLOS EDUARDO SILVA', code: '0303020059', procedimiento: 'Hemodiálise High-Flux', expires: '2026-08-30', status: 'Ativa', convenio: 'SUS', valorMes: 2890.00 },
    { id: '7', unitId: 'betim', unit: 'Betim', patientName: 'FRANCISCA OLIVEIRA SANTOS', code: '0303020059', procedimiento: 'Hemodiálise Contínua', expires: '2026-08-05', status: 'Atenção', convenio: 'SUS', valorMes: 2450.00 }
  ]);

  const [glosaList] = useState([
    { id: 'g1', unitId: 'betim', unit: 'Betim', lote: 'REM-2026-06', paciente: 'ADRIANO BRANDAO DA SILVA', motivo: 'APAC Vencida durante o ciclo', valorGlosa: 612.50, status: 'Em Recurso', dataGlosa: '2026-07-05' },
    { id: 'g2', unitId: 'betim', unit: 'Betim', lote: 'REM-2026-05', paciente: 'MARIA APARECIDA COSTA', motivo: 'Divergência no CID de insuficiência renal', valorGlosa: 1225.00, status: 'Deferido', dataGlosa: '2026-06-12' },
    { id: 'g3', unitId: 'betim', unit: 'Betim', lote: 'REM-2026-06', paciente: 'ROBERTO ALVES PINTO', motivo: 'Assinatura de presença com falta injustificada', valorGlosa: 306.25, status: 'Pendente', dataGlosa: '2026-07-10' }
  ]);

  // Filtragem de Dados pela Unidade Ativa
  const currentApacList = useMemo(() => filterByActiveUnit(apacList), [apacList, activeUnitId]);
  const currentGlosaList = useMemo(() => filterByActiveUnit(glosaList), [glosaList, activeUnitId]);

  const getApacBadgeStyle = (status) => {
    switch (status) {
      case 'Urgente': return { backgroundColor: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5' };
      case 'Atenção': return { backgroundColor: '#fef3c7', color: '#b45309', border: '1px solid #fcd34d' };
      default: return { backgroundColor: '#dcfce7', color: '#166534', border: '1px solid #86efac' };
    }
  };

  const filteredApacs = currentApacList.filter(a => {
    const matchesSearch = a.patientName.toLowerCase().includes(searchTerm.toLowerCase()) || a.code.includes(searchTerm);
    const matchesStatus = statusFilter ? a.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  const urgentCount = currentApacList.filter(a => a.status === 'Urgente').length;
  const warningCount = currentApacList.filter(a => a.status === 'Atenção').length;
  const totalFaturamentoEst = currentApacList.reduce((acc, c) => acc + c.valorMes, 0);

  return (
    <div style={styles.container}>
      {/* Module Title Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>NexaAPAC - Gestão de APACs & Faturamento SUS / Convênios</h1>
          <p style={styles.subtitle}>
            Portal exclusivo para auditoria de APACs, faturamento de sessões de diálise, controle de glosas e remessas BPA/APAC.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <UnitSelector compact showLabel={false} />
          <button onClick={() => alert('Exportação de Remessa BPA/APAC SUS gerada com sucesso!')} style={styles.btnSecondary}>
            <Download size={16} /> Gerar Remessa SUS (BPA/APAC)
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div style={styles.kpiGrid}>
        <div style={styles.kpiCard}>
          <div style={styles.kpiHeader}>
            <span style={styles.kpiLabel}>APACs Ativas / Cadastradas</span>
            <FileText size={20} color="var(--primary-color)" />
          </div>
          <span style={styles.kpiValue}>{currentApacList.length} Pacientes</span>
          <span style={styles.kpiSubtext}>Regulados na Nefrologia</span>
        </div>

        <div style={{ ...styles.kpiCard, borderLeft: '4px solid #ef4444' }}>
          <div style={styles.kpiHeader}>
            <span style={styles.kpiLabel}>APACs com Vencimento Urgente</span>
            <AlertTriangle size={20} color="#ef4444" />
          </div>
          <span style={{ ...styles.kpiValue, color: '#ef4444' }}>{urgentCount} Guias</span>
          <span style={styles.kpiSubtext}>Vencem em menos de 10 dias</span>
        </div>

        <div style={{ ...styles.kpiCard, borderLeft: '4px solid #f59e0b' }}>
          <div style={styles.kpiHeader}>
            <span style={styles.kpiLabel}>Atenção para Renovação</span>
            <Clock size={20} color="#f59e0b" />
          </div>
          <span style={{ ...styles.kpiValue, color: '#f59e0b' }}>{warningCount} Guias</span>
          <span style={styles.kpiSubtext}>Vencem nos próximos 30 dias</span>
        </div>

        <div style={{ ...styles.kpiCard, borderLeft: '4px solid #10b981' }}>
          <div style={styles.kpiHeader}>
            <span style={styles.kpiLabel}>Faturamento Estimado do Mês</span>
            <DollarSign size={20} color="#10b981" />
          </div>
          <span style={{ ...styles.kpiValue, color: '#10b981' }}>
            R$ {totalFaturamentoEst.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
          <span style={styles.kpiSubtext}>Repasse mensal do SUS</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={styles.tabsHeader}>
        <div style={styles.tabs}>
          <button 
            onClick={() => setActiveTab('apacs')} 
            style={{ ...styles.tabBtn, ...(activeTab === 'apacs' ? styles.tabBtnActive : {}) }}
          >
            📋 Validade de APACs ({currentApacList.length})
          </button>
          <button 
            onClick={() => setActiveTab('glosas')} 
            style={{ ...styles.tabBtn, ...(activeTab === 'glosas' ? styles.tabBtnActive : {}) }}
          >
            ⚠️ Gestão de Glosas ({currentGlosaList.length})
          </button>
          <button 
            onClick={() => setActiveTab('remessas')} 
            style={{ ...styles.tabBtn, ...(activeTab === 'remessas' ? styles.tabBtnActive : {}) }}
          >
            📦 Remessas & Lotes de Faturamento
          </button>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div style={styles.filtersBar}>
        <div style={styles.searchWrapper}>
          <Search size={18} style={styles.searchIcon} />
          <input 
            type="text" 
            placeholder="Pesquisar por paciente ou Nº da APAC..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
        </div>

        {activeTab === 'apacs' && (
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={styles.filterSelect}>
            <option value="">Todos os Status de Validade</option>
            <option value="Urgente">🔴 Urgente (&lt; 10 dias)</option>
            <option value="Atenção">🟡 Atenção (10 a 30 dias)</option>
            <option value="Ativa">🟢 Ativa / Regular</option>
          </select>
        )}
      </div>

      {/* TAB 1: APACs List */}
      {activeTab === 'apacs' && (
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '0.75rem 1rem' }}>Paciente</th>
                <th style={{ padding: '0.75rem 1rem' }}>Nº APAC Autorizada</th>
                <th style={{ padding: '0.75rem 1rem' }}>Procedimento SUS</th>
                <th style={{ padding: '0.75rem 1rem' }}>Validade APAC</th>
                <th style={{ padding: '0.75rem 1rem' }}>Dias Restantes</th>
                <th style={{ padding: '0.75rem 1rem' }}>Faturamento Mensal</th>
                <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                <th style={{ padding: '0.75rem 1rem' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredApacs.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    Nenhuma APAC encontrada para a unidade selecionada.
                  </td>
                </tr>
              ) : (
                filteredApacs.map(apac => {
                  const today = new Date();
                  const expireDate = new Date(apac.expires);
                  const diffTime = expireDate - today;
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                  return (
                    <tr key={apac.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '0.875rem 1rem', fontWeight: '600' }}>{apac.patientName}</td>
                      <td style={{ padding: '0.875rem 1rem', fontFamily: 'monospace', fontWeight: '600' }}>{apac.code}</td>
                      <td style={{ padding: '0.875rem 1rem' }}>{apac.procedimiento}</td>
                      <td style={{ padding: '0.875rem 1rem' }}>{apac.expires.split('-').reverse().join('/')}</td>
                      <td style={{ padding: '0.875rem 1rem', fontWeight: '700', color: diffDays <= 10 ? '#ef4444' : diffDays <= 30 ? '#f59e0b' : 'var(--text-primary)' }}>
                        {diffDays} dias
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
                        <button onClick={() => alert(`Solicitação de renovação para a APAC ${apac.code} de ${apac.patientName} registrada!`)} style={styles.actionBtn}>
                          Renovar APAC
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

      {/* TAB 2: Glosas */}
      {activeTab === 'glosas' && (
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '0.75rem 1rem' }}>Lote / Remessa</th>
                <th style={{ padding: '0.75rem 1rem' }}>Paciente</th>
                <th style={{ padding: '0.75rem 1rem' }}>Motivo da Glosa</th>
                <th style={{ padding: '0.75rem 1rem' }}>Data da Glosa</th>
                <th style={{ padding: '0.75rem 1rem' }}>Valor Glosado</th>
                <th style={{ padding: '0.75rem 1rem' }}>Status do Recurso</th>
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
                        Recorrer Glosa
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
          <h3 style={{ margin: '0 0 0.5rem 0' }}>Geração de Arquivo de Remessa BPA / APAC SUS</h3>
          <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto 1.5rem auto' }}>
            Consolidação mensal de presenças diárias dos pacientes do salão de hemodiálise para exportação e faturamento no Datasus.
          </p>
          <button onClick={() => alert('Remessa do mês atual exportada com sucesso!')} style={styles.btnPrimary}>
            <Download size={16} /> Fechar Mês & Baixar Arquivo BPA/APAC
          </button>
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
  }
};
