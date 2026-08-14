import React, { useState } from 'react';
import { dbService } from '../../firebase';
import { 
  ClipboardList, 
  Search, 
  Calendar, 
  Eye, 
  Trash2, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  Shield, 
  Filter, 
  FileText,
  Clock,
  User,
  Check,
  AlertCircle
} from 'lucide-react';

export default function SesmtHistory({ epiData = [], extinguisherData = [], hydrantData = [], onRefresh }) {
  const [selectedType, setSelectedType] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedShift, setSelectedShift] = useState('ALL');
  const [selectedItem, setSelectedItem] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Normalizar registros para listagem unificada
  const normalizedRecords = [
    ...epiData.map(item => ({
      ...item,
      recordType: 'EPI',
      typeLabel: 'Checklist Diário EPI',
      displayDate: item.date || '',
      displayTime: item.time || '',
      displaySector: item.sector || '-',
      displayShift: item.shift || '-',
      responsible: item.enfermeiro || item.tecnicoSeguranca || '-'
    })),
    ...extinguisherData.map(item => ({
      ...item,
      recordType: 'EXTINGUISHER',
      typeLabel: 'Inspeção Extintores',
      displayDate: item.date || '',
      displayTime: '-',
      displaySector: 'Geral (21 Extintores)',
      displayShift: '-',
      responsible: item.inspectorName || '-'
    })),
    ...hydrantData.map(item => ({
      ...item,
      recordType: 'HYDRANT',
      typeLabel: 'Inspeção Hidrantes',
      displayDate: item.date || '',
      displayTime: '-',
      displaySector: 'Geral (6 Hidrantes)',
      displayShift: '-',
      responsible: item.inspectorName || '-'
    }))
  ].sort((a, b) => new Date(b.displayDate + (b.displayTime && b.displayTime !== '-' ? 'T' + b.displayTime : '')) - new Date(a.displayDate + (a.displayTime && a.displayTime !== '-' ? 'T' + a.displayTime : '')));

  // Filtragem dos registros
  const filteredRecords = normalizedRecords.filter(item => {
    // Filtro por tipo
    if (selectedType !== 'ALL' && item.recordType !== selectedType) return false;

    // Filtro por turno
    if (selectedShift !== 'ALL' && item.recordType === 'EPI' && item.displayShift !== selectedShift) return false;

    // Filtro por data
    if (startDate && item.displayDate < startDate) return false;
    if (endDate && item.displayDate > endDate) return false;

    // Filtro por termo de busca
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchSector = (item.displaySector || '').toLowerCase().includes(term);
      const matchResp = (item.responsible || '').toLowerCase().includes(term);
      const matchType = (item.typeLabel || '').toLowerCase().includes(term);
      const matchDate = (item.displayDate || '').includes(term);
      if (!matchSector && !matchResp && !matchType && !matchDate) return false;
    }

    return true;
  });

  const handleDelete = async (record) => {
    if (!window.confirm(`Deseja realmente excluir este registro de ${record.typeLabel} do dia ${record.displayDate}?`)) {
      return;
    }
    setDeletingId(record.id);
    try {
      if (record.recordType === 'EPI') {
        await dbService.deleteEpiInspection(record.id);
      } else if (record.recordType === 'EXTINGUISHER') {
        await dbService.deleteFireExtinguisherInspection(record.id);
      } else if (record.recordType === 'HYDRANT') {
        await dbService.deleteFireHydrantInspection(record.id);
      }
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Erro ao excluir registro:', err);
      alert('Erro ao excluir registro.');
    } finally {
      setDeletingId(null);
    }
  };

  const getTypeBadgeStyle = (type) => {
    switch (type) {
      case 'EPI':
        return { backgroundColor: '#ecfeff', color: '#0891b2', borderColor: '#a5f3fc' };
      case 'EXTINGUISHER':
        return { backgroundColor: '#fffbeb', color: '#b45309', borderColor: '#fde68a' };
      case 'HYDRANT':
        return { backgroundColor: '#f0fdf4', color: '#15803d', borderColor: '#bbf7d0' };
      default:
        return { backgroundColor: '#f1f5f9', color: '#475569', borderColor: '#cbd5e1' };
    }
  };

  return (
    <div style={styles.card}>
      <div style={styles.cardHeader}>
        <div>
          <h2 style={styles.cardTitle}>Histórico de Registros e Auditorias SESMT</h2>
          <p style={styles.cardSubtitle}>Consulte, visualize detalhes e gerencie todas as inspeções salvas no sistema</p>
        </div>
        <div style={styles.recordCounter}>
          <ClipboardList size={18} color="#0891b2" />
          <span>{filteredRecords.length} registro(s)</span>
        </div>
      </div>

      {/* Barra de Filtros */}
      <div style={styles.filterBar}>
        <div style={styles.typeTabs}>
          <button 
            style={{ ...styles.typeTab, ...(selectedType === 'ALL' ? styles.typeTabActive : {}) }}
            onClick={() => setSelectedType('ALL')}
          >
            Todos ({normalizedRecords.length})
          </button>
          <button 
            style={{ ...styles.typeTab, ...(selectedType === 'EPI' ? styles.typeTabActive : {}) }}
            onClick={() => setSelectedType('EPI')}
          >
            EPI ({epiData.length})
          </button>
          <button 
            style={{ ...styles.typeTab, ...(selectedType === 'EXTINGUISHER' ? styles.typeTabActive : {}) }}
            onClick={() => setSelectedType('EXTINGUISHER')}
          >
            Extintores ({extinguisherData.length})
          </button>
          <button 
            style={{ ...styles.typeTab, ...(selectedType === 'HYDRANT' ? styles.typeTabActive : {}) }}
            onClick={() => setSelectedType('HYDRANT')}
          >
            Hidrantes ({hydrantData.length})
          </button>
        </div>

        <div style={styles.filterInputs}>
          <div style={styles.searchBox}>
            <Search size={16} color="#94a3b8" />
            <input 
              type="text" 
              placeholder="Buscar por setor, responsável..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
          </div>

          <div style={styles.dateInputs}>
            <div style={styles.dateField}>
              <span style={styles.dateLabel}>De:</span>
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={styles.dateInput}
              />
            </div>
            <div style={styles.dateField}>
              <span style={styles.dateLabel}>Até:</span>
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={styles.dateInput}
              />
            </div>
          </div>

          {selectedType === 'EPI' && (
            <select 
              value={selectedShift}
              onChange={(e) => setSelectedShift(e.target.value)}
              style={styles.selectFilter}
            >
              <option value="ALL">Todos os Turnos</option>
              <option value="1º Turno (Manhã)">1º Turno (Manhã)</option>
              <option value="2º Turno (Tarde)">2º Turno (Tarde)</option>
              <option value="3º Turno (Noite)">3º Turno (Noite)</option>
            </select>
          )}

          {(searchTerm || startDate || endDate || selectedShift !== 'ALL') && (
            <button 
              onClick={() => { setSearchTerm(''); setStartDate(''); setEndDate(''); setSelectedShift('ALL'); }}
              style={styles.clearBtn}
              title="Limpar filtros"
            >
              <X size={14} /> Limpar
            </button>
          )}
        </div>
      </div>

      {/* Tabela de Registros */}
      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead style={styles.tableHead}>
            <tr>
              <th style={styles.th}>Data / Horário</th>
              <th style={styles.th}>Tipo</th>
              <th style={styles.th}>Setor / Local</th>
              <th style={styles.th}>Turno</th>
              <th style={styles.th}>Responsável</th>
              <th style={styles.th}>Resumo / Status</th>
              <th style={{ ...styles.th, textAlign: 'center' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecords.length === 0 ? (
              <tr>
                <td colSpan={7} style={styles.emptyTd}>
                  <AlertCircle size={32} color="#94a3b8" style={{ marginBottom: '0.5rem' }} />
                  <p style={{ margin: 0, fontWeight: '600', color: '#64748b' }}>Nenhum registro encontrado</p>
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Tente alterar os filtros ou preencha um formulário para começar.</span>
                </td>
              </tr>
            ) : (
              filteredRecords.map((record) => {
                const badgeStyle = getTypeBadgeStyle(record.recordType);

                // Calcular resumo para cada tipo
                let summaryElement = null;
                if (record.recordType === 'EPI') {
                  const evals = Object.values(record.evaluations || {});
                  const ncCount = evals.filter(e => e.status === 'NC').length;
                  summaryElement = ncCount === 0 ? (
                    <span style={styles.conformBadge}><Check size={12} /> 100% Conforme</span>
                  ) : (
                    <span style={styles.ncBadge}><AlertTriangle size={12} /> {ncCount} Não Conforme(s)</span>
                  );
                } else if (record.recordType === 'EXTINGUISHER') {
                  const total = (record.items || []).length;
                  summaryElement = <span style={styles.neutralBadge}>{total} Extintores Inspecionados</span>;
                } else if (record.recordType === 'HYDRANT') {
                  const total = (record.items || []).length;
                  summaryElement = <span style={styles.neutralBadge}>{total} Hidrantes Inspecionados</span>;
                }

                return (
                  <tr key={record.id} style={styles.tr}>
                    <td style={{ ...styles.td, fontWeight: '600' }}>
                      {record.displayDate ? record.displayDate.split('-').reverse().join('/') : '-'}
                      {record.displayTime && record.displayTime !== '-' && (
                        <span style={styles.timeTag}> {record.displayTime}</span>
                      )}
                    </td>
                    <td style={styles.td}>
                      <span style={{ ...styles.badge, ...badgeStyle }}>
                        {record.typeLabel}
                      </span>
                    </td>
                    <td style={{ ...styles.td, fontWeight: '500' }}>{record.displaySector}</td>
                    <td style={styles.td}>{record.displayShift}</td>
                    <td style={styles.td}>{record.responsible}</td>
                    <td style={styles.td}>{summaryElement}</td>
                    <td style={{ ...styles.td, textAlign: 'center' }}>
                      <div style={styles.actionsBox}>
                        <button 
                          style={styles.viewBtn} 
                          onClick={() => setSelectedItem(record)}
                          title="Visualizar Inspeção Completa"
                        >
                          <Eye size={16} /> Ver Detalhes
                        </button>
                        <button 
                          style={styles.deleteBtn}
                          disabled={deletingId === record.id}
                          onClick={() => handleDelete(record)}
                          title="Excluir Registro"
                        >
                          <Trash2 size={15} />
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

      {/* Modal de Detalhes da Inspeção */}
      {selectedItem && (
        <div style={styles.modalOverlay} onClick={() => setSelectedItem(null)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ ...styles.headerIcon, ...getTypeBadgeStyle(selectedItem.recordType) }}>
                  <ClipboardList size={22} />
                </div>
                <div>
                  <h3 style={styles.modalTitle}>Detalhes da Inspeção - {selectedItem.typeLabel}</h3>
                  <p style={styles.modalSubtitle}>Data: {selectedItem.displayDate.split('-').reverse().join('/')} {selectedItem.displayTime !== '-' ? `às ${selectedItem.displayTime}` : ''}</p>
                </div>
              </div>
              <button style={styles.closeBtn} onClick={() => setSelectedItem(null)}>
                <X size={20} />
              </button>
            </div>

            <div style={styles.modalBody}>
              {/* Meta Info Grid */}
              <div style={styles.metaGrid}>
                <div style={styles.metaItem}>
                  <span style={styles.metaLabel}>Data</span>
                  <span style={styles.metaVal}>{selectedItem.displayDate.split('-').reverse().join('/')}</span>
                </div>
                {selectedItem.recordType === 'EPI' && (
                  <>
                    <div style={styles.metaItem}>
                      <span style={styles.metaLabel}>Horário</span>
                      <span style={styles.metaVal}>{selectedItem.displayTime || '-'}</span>
                    </div>
                    <div style={styles.metaItem}>
                      <span style={styles.metaLabel}>Turno</span>
                      <span style={styles.metaVal}>{selectedItem.displayShift || '-'}</span>
                    </div>
                    <div style={styles.metaItem}>
                      <span style={styles.metaLabel}>Setor</span>
                      <span style={styles.metaVal}>{selectedItem.displaySector || '-'}</span>
                    </div>
                    <div style={styles.metaItem}>
                      <span style={styles.metaLabel}>Enfermeiro(a) Responsável</span>
                      <span style={styles.metaVal}>{selectedItem.enfermeiro || '-'}</span>
                    </div>
                    <div style={styles.metaItem}>
                      <span style={styles.metaLabel}>Técnico de Segurança</span>
                      <span style={styles.metaVal}>{selectedItem.tecnicoSeguranca || '-'}</span>
                    </div>
                  </>
                )}
                {(selectedItem.recordType === 'EXTINGUISHER' || selectedItem.recordType === 'HYDRANT') && (
                  <div style={styles.metaItem}>
                    <span style={styles.metaLabel}>Nome do Inspetor</span>
                    <span style={styles.metaVal}>{selectedItem.inspectorName || '-'}</span>
                  </div>
                )}
              </div>

              {/* Conteúdo de EPI */}
              {selectedItem.recordType === 'EPI' && (
                <div style={{ marginTop: '1.5rem' }}>
                  <h4 style={styles.sectionTitle}>Avaliações dos Itens de EPI e Segurança</h4>
                  <table style={styles.innerTable}>
                    <thead>
                      <tr>
                        <th style={styles.innerTh}>Item de Verificação</th>
                        <th style={{ ...styles.innerTh, textAlign: 'center', width: '150px' }}>Status</th>
                        <th style={styles.innerTh}>Observações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(selectedItem.evaluations || {}).map(([key, item]) => {
                        const labels = {
                          uso_epi: 'Uso adequado do EPI',
                          higienizacao: 'Higienização das mãos',
                          descarte: 'Descarte de resíduos',
                          conservacao: 'Conservação e armazenamento de EPI'
                        };
                        const statusColors = {
                          C: { bg: '#f0fdf4', color: '#166534', label: 'Conforme (C)' },
                          NC: { bg: '#fef2f2', color: '#991b1b', label: 'Não Conforme (NC)' },
                          NA: { bg: '#f1f5f9', color: '#475569', label: 'Não Avaliado (NA)' }
                        };
                        const s = statusColors[item.status] || statusColors.NA;
                        return (
                          <tr key={key} style={styles.innerTr}>
                            <td style={styles.innerTd}><strong>{labels[key] || key}</strong></td>
                            <td style={{ ...styles.innerTd, textAlign: 'center' }}>
                              <span style={{ ...styles.statusBadge, backgroundColor: s.bg, color: s.color }}>
                                {s.label}
                              </span>
                            </td>
                            <td style={styles.innerTd}>{item.observation || <span style={{ color: '#94a3b8' }}>-</span>}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Conteúdo de Extintores */}
              {selectedItem.recordType === 'EXTINGUISHER' && (
                <div style={{ marginTop: '1.5rem', overflowX: 'auto' }}>
                  <h4 style={styles.sectionTitle}>Inspeção dos 21 Extintores de Incêndio</h4>
                  <table style={styles.innerTable}>
                    <thead>
                      <tr>
                        <th style={{ ...styles.innerTh, textAlign: 'center' }}>N°</th>
                        <th style={styles.innerTh}>Tipo</th>
                        <th style={{ ...styles.innerTh, textAlign: 'center' }}>Acesso</th>
                        <th style={{ ...styles.innerTh, textAlign: 'center' }}>Sinaliz.</th>
                        <th style={{ ...styles.innerTh, textAlign: 'center' }}>Pino</th>
                        <th style={{ ...styles.innerTh, textAlign: 'center' }}>Lacre</th>
                        <th style={{ ...styles.innerTh, textAlign: 'center' }}>Pressão</th>
                        <th style={{ ...styles.innerTh, textAlign: 'center' }}>Mangueira</th>
                        <th style={{ ...styles.innerTh, textAlign: 'center' }}>Bico</th>
                        <th style={{ ...styles.innerTh, textAlign: 'center' }}>Físico</th>
                        <th style={styles.innerTh}>Validade</th>
                        <th style={styles.innerTh}>Assinatura</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(selectedItem.items || []).map((item) => (
                        <tr key={item.extinguisherNum} style={styles.innerTr}>
                          <td style={{ ...styles.innerTd, textAlign: 'center', fontWeight: 'bold' }}>{item.extinguisherNum}</td>
                          <td style={styles.innerTd}>{item.type || '-'}</td>
                          <td style={{ ...styles.innerTd, textAlign: 'center' }}>{item.evaluations?.acesso || 'C'}</td>
                          <td style={{ ...styles.innerTd, textAlign: 'center' }}>{item.evaluations?.sinalizacao || 'C'}</td>
                          <td style={{ ...styles.innerTd, textAlign: 'center' }}>{item.evaluations?.pino || 'C'}</td>
                          <td style={{ ...styles.innerTd, textAlign: 'center' }}>{item.evaluations?.lacre || 'C'}</td>
                          <td style={{ ...styles.innerTd, textAlign: 'center' }}>{item.evaluations?.pressurizacao || 'C'}</td>
                          <td style={{ ...styles.innerTd, textAlign: 'center' }}>{item.evaluations?.mangueira || 'C'}</td>
                          <td style={{ ...styles.innerTd, textAlign: 'center' }}>{item.evaluations?.bico || 'C'}</td>
                          <td style={{ ...styles.innerTd, textAlign: 'center' }}>{item.evaluations?.estado_fisico || 'C'}</td>
                          <td style={styles.innerTd}>{item.validity ? item.validity.split('-').reverse().join('/') : '-'}</td>
                          <td style={styles.innerTd}>{item.signature || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Conteúdo de Hidrantes */}
              {selectedItem.recordType === 'HYDRANT' && (
                <div style={{ marginTop: '1.5rem', overflowX: 'auto' }}>
                  <h4 style={styles.sectionTitle}>Inspeção dos 6 Hidrantes de Incêndio</h4>
                  <table style={styles.innerTable}>
                    <thead>
                      <tr>
                        <th style={{ ...styles.innerTh, textAlign: 'center' }}>N° Hidrante</th>
                        <th style={{ ...styles.innerTh, textAlign: 'center' }}>Mangueira</th>
                        <th style={styles.innerTh}>Validade (Mangueira)</th>
                        <th style={{ ...styles.innerTh, textAlign: 'center' }}>Bicos</th>
                        <th style={{ ...styles.innerTh, textAlign: 'center' }}>Chaves</th>
                        <th style={{ ...styles.innerTh, textAlign: 'center' }}>Estado Físico</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(selectedItem.items || []).map((item) => (
                        <tr key={item.hydrantNum} style={styles.innerTr}>
                          <td style={{ ...styles.innerTd, textAlign: 'center', fontWeight: 'bold' }}>{item.hydrantNum}</td>
                          <td style={{ ...styles.innerTd, textAlign: 'center' }}>{item.evaluations?.mangueira || 'C'}</td>
                          <td style={styles.innerTd}>{item.validity ? item.validity.split('-').reverse().join('/') : '-'}</td>
                          <td style={{ ...styles.innerTd, textAlign: 'center' }}>{item.evaluations?.bicos || 'C'}</td>
                          <td style={{ ...styles.innerTd, textAlign: 'center' }}>{item.evaluations?.chaves || 'C'}</td>
                          <td style={{ ...styles.innerTd, textAlign: 'center' }}>{item.evaluations?.estado_fisico || 'C'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div style={styles.modalFooter}>
              <button style={styles.btnSecondary} onClick={() => setSelectedItem(null)}>
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  card: {
    backgroundColor: '#ffffff',
    padding: '1.5rem',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    border: '1px solid #e2e8f0',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1.25rem',
    flexWrap: 'wrap',
    gap: '1rem'
  },
  cardTitle: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#0f172a',
    margin: 0,
  },
  cardSubtitle: {
    fontSize: '0.85rem',
    color: '#64748b',
    marginTop: '0.25rem'
  },
  recordCounter: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    padding: '0.4rem 0.75rem',
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#334155'
  },
  filterBar: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    marginBottom: '1.5rem',
    padding: '1rem',
    backgroundColor: '#f8fafc',
    borderRadius: '10px',
    border: '1px solid #e2e8f0'
  },
  typeTabs: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap'
  },
  typeTab: {
    padding: '0.4rem 0.85rem',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    backgroundColor: '#ffffff',
    fontSize: '0.82rem',
    fontWeight: '600',
    color: '#475569',
    cursor: 'pointer',
    transition: 'all 0.15s'
  },
  typeTabActive: {
    backgroundColor: '#0891b2',
    color: '#ffffff',
    borderColor: '#0891b2'
  },
  filterInputs: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    flexWrap: 'wrap'
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.4rem 0.75rem',
    backgroundColor: '#ffffff',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    flex: '1',
    minWidth: '220px'
  },
  searchInput: {
    border: 'none',
    outline: 'none',
    width: '100%',
    fontSize: '0.85rem',
    color: '#0f172a'
  },
  dateInputs: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    flexWrap: 'wrap'
  },
  dateField: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.3rem'
  },
  dateLabel: {
    fontSize: '0.75rem',
    fontWeight: '600',
    color: '#64748b'
  },
  dateInput: {
    padding: '0.4rem 0.5rem',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    fontSize: '0.8rem',
    color: '#0f172a',
    backgroundColor: '#ffffff'
  },
  selectFilter: {
    padding: '0.4rem 0.6rem',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    fontSize: '0.82rem',
    color: '#0f172a',
    backgroundColor: '#ffffff'
  },
  clearBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.4rem 0.75rem',
    borderRadius: '6px',
    border: '1px solid #fecaca',
    backgroundColor: '#fef2f2',
    color: '#dc2626',
    fontSize: '0.8rem',
    fontWeight: '600',
    cursor: 'pointer'
  },
  tableContainer: {
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    minWidth: '750px'
  },
  tableHead: {
    backgroundColor: '#0f172a',
  },
  th: {
    backgroundColor: '#0f172a',
    padding: '0.75rem 1rem',
    textAlign: 'left',
    fontSize: '0.8rem',
    fontWeight: '700',
    color: '#ffffff',
    borderBottom: '1px solid #334155',
    whiteSpace: 'nowrap'
  },
  tr: {
    borderBottom: '1px solid #f1f5f9',
    transition: 'background-color 0.15s'
  },
  td: {
    padding: '0.75rem 1rem',
    fontSize: '0.85rem',
    color: '#334155',
    verticalAlign: 'middle'
  },
  emptyTd: {
    padding: '3rem 1rem',
    textAlign: 'center'
  },
  timeTag: {
    fontSize: '0.75rem',
    color: '#64748b',
    fontWeight: 'normal'
  },
  badge: {
    display: 'inline-block',
    padding: '0.2rem 0.5rem',
    borderRadius: '9999px',
    fontSize: '0.75rem',
    fontWeight: '600',
    border: '1px solid transparent',
    whiteSpace: 'nowrap'
  },
  conformBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.2rem 0.5rem',
    borderRadius: '6px',
    backgroundColor: '#f0fdf4',
    color: '#15803d',
    fontSize: '0.75rem',
    fontWeight: '600',
    border: '1px solid #bbf7d0'
  },
  ncBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.2rem 0.5rem',
    borderRadius: '6px',
    backgroundColor: '#fef2f2',
    color: '#b91c1c',
    fontSize: '0.75rem',
    fontWeight: '600',
    border: '1px solid #fecaca'
  },
  neutralBadge: {
    display: 'inline-block',
    padding: '0.2rem 0.5rem',
    borderRadius: '6px',
    backgroundColor: '#f8fafc',
    color: '#475569',
    fontSize: '0.75rem',
    fontWeight: '500',
    border: '1px solid #e2e8f0'
  },
  actionsBox: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem'
  },
  viewBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.3rem',
    padding: '0.35rem 0.7rem',
    backgroundColor: '#0891b2',
    color: '#ffffff',
    borderRadius: '6px',
    border: 'none',
    fontSize: '0.78rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'opacity 0.15s'
  },
  deleteBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.35rem 0.5rem',
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    borderRadius: '6px',
    border: '1px solid #fca5a5',
    cursor: 'pointer',
    transition: 'opacity 0.15s'
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '1rem'
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    width: '100%',
    maxWidth: '850px',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  },
  modalHeader: {
    padding: '1.25rem 1.5rem',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8fafc'
  },
  headerIcon: {
    width: '42px',
    height: '42px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  modalTitle: {
    fontSize: '1.15rem',
    fontWeight: '700',
    color: '#0f172a',
    margin: 0
  },
  modalSubtitle: {
    fontSize: '0.8rem',
    color: '#64748b',
    margin: 0
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#64748b',
    padding: '0.25rem'
  },
  modalBody: {
    padding: '1.5rem',
    overflowY: 'auto',
    flex: 1
  },
  metaGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '1rem',
    backgroundColor: '#f8fafc',
    padding: '1rem',
    borderRadius: '8px',
    border: '1px solid #e2e8f0'
  },
  metaItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.2rem'
  },
  metaLabel: {
    fontSize: '0.72rem',
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase'
  },
  metaVal: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#0f172a'
  },
  sectionTitle: {
    fontSize: '0.95rem',
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: '0.75rem'
  },
  innerTable: {
    width: '100%',
    borderCollapse: 'collapse',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    fontSize: '0.85rem'
  },
  innerTh: {
    backgroundColor: '#f1f5f9',
    padding: '0.6rem 0.75rem',
    textAlign: 'left',
    fontSize: '0.75rem',
    fontWeight: '700',
    color: '#475569',
    borderBottom: '1px solid #cbd5e1'
  },
  innerTr: {
    borderBottom: '1px solid #f1f5f9'
  },
  innerTd: {
    padding: '0.6rem 0.75rem',
    color: '#334155'
  },
  statusBadge: {
    display: 'inline-block',
    padding: '0.2rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.75rem',
    fontWeight: '700'
  },
  modalFooter: {
    padding: '1rem 1.5rem',
    borderTop: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'flex-end',
    backgroundColor: '#f8fafc'
  },
  btnSecondary: {
    padding: '0.5rem 1.25rem',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    backgroundColor: '#ffffff',
    color: '#475569',
    fontWeight: '600',
    fontSize: '0.85rem',
    cursor: 'pointer'
  }
};
