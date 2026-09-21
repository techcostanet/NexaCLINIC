import React, { useState, useEffect } from 'react';
import { dbService } from '../../firebase';
import { 
  ClipboardList, 
  Search, 
  Eye, 
  Trash2, 
  X, 
  AlertTriangle, 
  Check, 
  AlertCircle,
  LayoutGrid,
  Table,
  Printer
} from 'lucide-react';

export default function SesmtHistory({ epiData = [], copaData = [], extinguisherData = [], hydrantData = [], onRefresh }) {
  const [selectedType, setSelectedType] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedShift, setSelectedShift] = useState('ALL');
  const [selectedItem, setSelectedItem] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [viewMode, setViewMode] = useState('cards');

  useEffect(() => {
    if (window.innerWidth >= 1024) {
      setViewMode('table');
    } else {
      setViewMode('cards');
    }
  }, []);

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
    ...copaData.map(item => ({
      ...item,
      recordType: 'COPA',
      typeLabel: 'Checklist Copa',
      displayDate: item.date || '',
      displayTime: item.time || '',
      displaySector: 'Copa',
      displayShift: item.shift || '-',
      responsible: item.nutricionista || item.tecnicoSeguranca || '-'
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
    if (selectedShift !== 'ALL' && (item.recordType === 'EPI' || item.recordType === 'COPA') && item.displayShift !== selectedShift) return false;

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
      } else if (record.recordType === 'COPA') {
        await dbService.deleteCopaInspection(record.id);
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
      case 'COPA':
        return { backgroundColor: '#fef3c7', color: '#b45309', borderColor: '#fde68a' };
      case 'EXTINGUISHER':
        return { backgroundColor: '#fffbeb', color: '#b45309', borderColor: '#fde68a' };
      case 'HYDRANT':
        return { backgroundColor: '#f0fdf4', color: '#15803d', borderColor: '#bbf7d0' };
      default:
        return { backgroundColor: '#f1f5f9', color: '#475569', borderColor: '#cbd5e1' };
    }
  };

  const handlePrintOfficialSheet = (record) => {
    if (!record) return;
    const printWindow = window.open('', '_blank', 'width=900,height=800');
    if (!printWindow) {
      alert('Por favor, permita popups para imprimir o formulário oficial.');
      return;
    }

    const isCopa = record.recordType === 'COPA';
    const isEpi = record.recordType === 'EPI';

    const epiLabels = {
      uso_epi: 'Uso adequado do EPI',
      higienizacao: 'Higienização das mãos',
      descarte: 'Descarte de resíduos',
      conservacao: 'Conservação e armazenamento de EPI',
      limpeza_ralos: 'Condições e limpeza dos ralos',
      ausencia_adornos: 'Ausência de adornos durante as atividades',
      uso_cilios: 'Uso adequado de cílios, sem comprometer as condições de higiene e segurança',
      bancadas_superficies: 'Bancadas e superfícies limpas e organizadas',
      produtos_quimicos: 'Produtos químicos identificados e armazenados corretamente',
      fds_quimicos: 'FDS disponíveis para os produtos químicos aplicáveis',
      condicoes_unhas: 'Condições e comprimento das unhas, conforme os requisitos de higiene'
    };

    const copaLabels = {
      uso_epi: 'Uso adequado do EPI',
      higienizacao: 'Higienização das mãos',
      descarte: 'Descarte de resíduos',
      conservacao: 'Conservação e armazenamento de EPI',
      ausencia_adornos: 'Ausência de adornos durante as atividades',
      bancadas_superficies: 'Bancadas e superfícies limpas e organizadas',
      condicoes_unhas: 'Condições e comprimento das unhas, conforme os requisitos de higiene'
    };

    const activeLabels = isCopa ? copaLabels : epiLabels;
    const formattedDate = record.displayDate ? record.displayDate.split('-').reverse().join('/') : '-';

    let tableRows = '';
    if (isEpi || isCopa) {
      Object.keys(activeLabels).forEach(key => {
        const item = (record.evaluations && record.evaluations[key]) || { status: 'NA', observation: '' };
        const isC = item.status === 'C' ? 'X' : '';
        const isNC = item.status === 'NC' ? 'X' : '';
        const isNA = item.status === 'NA' ? 'X' : '';
        tableRows += `
          <tr>
            <td style="padding: 6px 10px; border: 1px solid #000; font-size: 11px;">${activeLabels[key]}</td>
            <td style="padding: 6px 4px; border: 1px solid #000; text-align: center; font-weight: bold; width: 35px; font-size: 12px;">${isC}</td>
            <td style="padding: 6px 4px; border: 1px solid #000; text-align: center; font-weight: bold; width: 35px; font-size: 12px;">${isNC}</td>
            <td style="padding: 6px 4px; border: 1px solid #000; text-align: center; font-weight: bold; width: 35px; font-size: 12px;">${isNA}</td>
            <td style="padding: 6px 10px; border: 1px solid #000; font-size: 11px;">${item.observation || ''}</td>
          </tr>
        `;
      });
    }

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${isCopa ? 'Checklist Copa' : 'Checklist EPI'} - ${formattedDate}</title>
        <style>
          @page { size: A4 portrait; margin: 12mm 15mm; }
          body { font-family: Arial, Helvetica, sans-serif; color: #000; margin: 0; padding: 10px; }
          .header-box { text-align: center; border: 2px solid #000; padding: 10px; margin-bottom: 12px; }
          .header-title { font-size: 14px; font-weight: bold; text-transform: uppercase; margin: 0; }
          .meta-box { border: 1px solid #000; padding: 8px 12px; margin-bottom: 12px; font-size: 11px; line-height: 1.6; }
          .meta-row { display: flex; justify-content: space-between; margin-bottom: 4px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 14px; }
          th { background-color: #f2f2f2; border: 1px solid #000; padding: 6px 8px; font-size: 11px; text-align: left; }
          .resp-box { border: 1px solid #000; padding: 10px; margin-top: 10px; }
          .resp-title { font-size: 11px; font-weight: bold; margin-bottom: 8px; text-transform: uppercase; }
          .resp-grid { display: flex; gap: 20px; justify-content: space-between; }
          .resp-col { flex: 1; border: 1px dashed #999; padding: 8px; min-height: 70px; display: flex; flex-direction: column; justify-content: space-between; }
          .resp-label { font-size: 10px; color: #333; }
          .resp-val { font-size: 11px; font-weight: bold; margin-top: 2px; }
          .sig-img { max-height: 50px; object-fit: contain; margin-top: 4px; }
        </style>
      </head>
      <body>
        <div class="header-box">
          <div class="header-title">CHECKLIST DE VERIFICAÇÃO DIÁRIA DE EPI E SEGURANÇA</div>
          <div style="font-size: 11px; margin-top: 4px; color: #333;">NEX-AI CLINIC • MÓDULO SESMT</div>
        </div>

        <div class="meta-box">
          <div class="meta-row">
            <div><strong>DATA:</strong> ${formattedDate}</div>
            <div><strong>Horário:</strong> ${record.displayTime || '-'}</div>
            <div><strong>Turno:</strong> ${record.displayShift || '-'}</div>
          </div>
          <div style="margin-top: 4px;">
            <strong>SETOR:</strong> ${record.displaySector || (isCopa ? 'Copa' : '-')}
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>DESCRIÇÃO</th>
              <th style="text-align: center; width: 35px;">C</th>
              <th style="text-align: center; width: 35px;">NC</th>
              <th style="text-align: center; width: 35px;">NA</th>
              <th>OBSERVAÇÕES</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>

        <div class="resp-box">
          <div class="resp-title">RESPONSÁVEIS</div>
          <div class="resp-grid">
            <div class="resp-col">
              <div>
                <div class="resp-label">${isCopa ? 'Nutricionista Responsável:' : 'Enfermeiro(a) Responsável:'}</div>
                <div class="resp-val">${(isCopa ? record.nutricionista : record.enfermeiro) || '-'}</div>
              </div>
            </div>
            <div class="resp-col">
              <div>
                <div class="resp-label">Técnica de Segurança do Trabalho:</div>
                <div class="resp-val">${record.tecnicoSeguranca || '-'}</div>
              </div>
              ${record.signature ? `<img src="${record.signature}" class="sig-img" alt="Assinatura Digital" />` : ''}
            </div>
          </div>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  };

  return (
    <div style={styles.card}>
      <div style={styles.cardHeader}>
        <div>
          <h2 style={styles.cardTitle}>Histórico de Registros e Auditorias</h2>
          <p style={styles.cardSubtitle}>Consulte, visualize detalhes e gerencie todas as inspeções salvas no sistema</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
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

          <div style={styles.recordCounter}>
            <ClipboardList size={18} color="#0891b2" />
            <span>{filteredRecords.length} registro(s)</span>
          </div>
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
            style={{ ...styles.typeTab, ...(selectedType === 'COPA' ? styles.typeTabActive : {}) }}
            onClick={() => setSelectedType('COPA')}
          >
            Copa ({copaData.length})
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

      {/* 1. Modo Cartões (Otimizado para Celular e Tablet) */}
      {viewMode === 'cards' && (
        <div style={styles.historyCardsGrid}>
          {filteredRecords.length === 0 ? (
            <div style={styles.emptyCardBox}>
              <AlertCircle size={32} color="#94a3b8" style={{ marginBottom: '0.5rem' }} />
              <p style={{ margin: 0, fontWeight: '600', color: '#64748b' }}>Nenhum registro encontrado</p>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Tente alterar os filtros ou preencha um formulário para começar.</span>
            </div>
          ) : (
            filteredRecords.map((record) => {
              const badgeStyle = getTypeBadgeStyle(record.recordType);

              let summaryElement = null;
              if (record.recordType === 'EPI' || record.recordType === 'COPA') {
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
                <div key={record.id} style={styles.historyCard}>
                  <div style={styles.historyCardTop}>
                    <span style={{ ...styles.badge, ...badgeStyle }}>
                      {record.typeLabel}
                    </span>
                    <span style={{ fontSize: '0.82rem', fontWeight: '700', color: '#0f172a' }}>
                      {record.displayDate ? record.displayDate.split('-').reverse().join('/') : '-'}
                      {record.displayTime && record.displayTime !== '-' && ` às ${record.displayTime}`}
                    </span>
                  </div>

                  <div style={styles.historyCardInfo}>
                    <div style={styles.infoRow}>
                      <span style={styles.infoKey}>Setor:</span>
                      <span style={styles.infoVal}>{record.displaySector}</span>
                    </div>
                    {record.displayShift && record.displayShift !== '-' && (
                      <div style={styles.infoRow}>
                        <span style={styles.infoKey}>Turno:</span>
                        <span style={styles.infoVal}>{record.displayShift}</span>
                      </div>
                    )}
                    <div style={styles.infoRow}>
                      <span style={styles.infoKey}>Responsável:</span>
                      <span style={styles.infoVal}>{record.responsible}</span>
                    </div>
                    <div style={styles.infoRow}>
                      <span style={styles.infoKey}>Status:</span>
                      <div>{summaryElement}</div>
                    </div>
                  </div>

                  <div style={styles.historyCardActions}>
                    <button 
                      style={styles.viewCardBtn} 
                      onClick={() => setSelectedItem(record)}
                      title="Visualizar Detalhes"
                    >
                      <Eye size={15} /> Detalhes
                    </button>
                    {(record.recordType === 'EPI' || record.recordType === 'COPA') && (
                      <button 
                        style={styles.printBtn} 
                        onClick={() => handlePrintOfficialSheet(record)}
                        title="Imprimir Ficha Oficial"
                      >
                        <Printer size={15} /> Imprimir
                      </button>
                    )}
                    <button 
                      style={styles.deleteBtn}
                      disabled={deletingId === record.id}
                      onClick={() => handleDelete(record)}
                      title="Excluir Registro"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* 2. Modo Tabela Clássica (Desktop) */}
      {viewMode === 'table' && (
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead style={styles.tableHead}>
              <tr>
                <th style={styles.th}>Data</th>
                <th style={styles.th}>Tipo</th>
                <th style={styles.th}>Setor</th>
                <th style={styles.th}>Turno</th>
                <th style={styles.th}>Responsável</th>
                <th style={styles.th}>Status</th>
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

                  let summaryElement = null;
                  if (record.recordType === 'EPI' || record.recordType === 'COPA') {
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
                            title="Visualizar Detalhes"
                          >
                            <Eye size={15} /> Detalhes
                          </button>
                          {(record.recordType === 'EPI' || record.recordType === 'COPA') && (
                            <button 
                              style={styles.printBtn} 
                              onClick={() => handlePrintOfficialSheet(record)}
                              title="Imprimir Ficha Oficial"
                            >
                              <Printer size={15} /> Imprimir
                            </button>
                          )}
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
      )}

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
                      <span style={styles.metaLabel}>Enfermeiro</span>
                      <span style={styles.metaVal}>{selectedItem.enfermeiro || '-'}</span>
                    </div>
                    <div style={styles.metaItem}>
                      <span style={styles.metaLabel}>Técnico</span>
                      <span style={styles.metaVal}>{selectedItem.tecnicoSeguranca || '-'}</span>
                    </div>
                  </>
                )}
                {selectedItem.recordType === 'COPA' && (
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
                      <span style={styles.metaVal}>Copa</span>
                    </div>
                    <div style={styles.metaItem}>
                      <span style={styles.metaLabel}>Nutricionista</span>
                      <span style={styles.metaVal}>{selectedItem.nutricionista || '-'}</span>
                    </div>
                    <div style={styles.metaItem}>
                      <span style={styles.metaLabel}>Técnico</span>
                      <span style={styles.metaVal}>{selectedItem.tecnicoSeguranca || '-'}</span>
                    </div>
                  </>
                )}
                {(selectedItem.recordType === 'EXTINGUISHER' || selectedItem.recordType === 'HYDRANT') && (
                  <div style={styles.metaItem}>
                    <span style={styles.metaLabel}>Inspetor</span>
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
                          conservacao: 'Conservação e armazenamento de EPI',
                          limpeza_ralos: 'Condições e limpeza dos ralos',
                          ausencia_adornos: 'Ausência de adornos durante as atividades',
                          uso_cilios: 'Uso adequado de cílios, sem comprometer as condições de higiene e segurança',
                          bancadas_superficies: 'Bancadas e superfícies limpas e organizadas',
                          produtos_quimicos: 'Produtos químicos identificados e armazenados corretamente',
                          fds_quimicos: 'FDS disponíveis para os produtos químicos aplicáveis',
                          condicoes_unhas: 'Condições e comprimento das unhas, conforme os requisitos de higiene'
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

              {/* Conteúdo da Copa */}
              {selectedItem.recordType === 'COPA' && (
                <div style={{ marginTop: '1.5rem' }}>
                  <h4 style={styles.sectionTitle}>Avaliações dos Itens de Segurança da Copa</h4>
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
                        const copaLabels = {
                          uso_epi: 'Uso adequado do EPI',
                          higienizacao: 'Higienização das mãos',
                          descarte: 'Descarte de resíduos',
                          conservacao: 'Conservação e armazenamento de EPI',
                          ausencia_adornos: 'Ausência de adornos durante as atividades',
                          bancadas_superficies: 'Bancadas e superfícies limpas e organizadas',
                          condicoes_unhas: 'Condições e comprimento das unhas, conforme os requisitos de higiene'
                        };
                        const statusColors = {
                          C: { bg: '#f0fdf4', color: '#166534', label: 'Conforme (C)' },
                          NC: { bg: '#fef2f2', color: '#991b1b', label: 'Não Conforme (NC)' },
                          NA: { bg: '#f1f5f9', color: '#475569', label: 'Não Avaliado (NA)' }
                        };
                        const s = statusColors[item.status] || statusColors.NA;
                        return (
                          <tr key={key} style={styles.innerTr}>
                            <td style={styles.innerTd}><strong>{copaLabels[key] || key}</strong></td>
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
                  <h4 style={styles.sectionTitle}>Inspeção de Extintores de Incêndio</h4>
                  <table style={styles.innerTable}>
                    <thead>
                      <tr>
                        <th style={{ ...styles.innerTh, textAlign: 'center' }}>Código</th>
                        <th style={styles.innerTh}>Setor</th>
                        <th style={styles.innerTh}>Tipo</th>
                        <th style={{ ...styles.innerTh, textAlign: 'center' }}>Acesso</th>
                        <th style={{ ...styles.innerTh, textAlign: 'center' }}>Sinaliz.</th>
                        <th style={{ ...styles.innerTh, textAlign: 'center' }}>Pino</th>
                        <th style={{ ...styles.innerTh, textAlign: 'center' }}>Lacre</th>
                        <th style={{ ...styles.innerTh, textAlign: 'center' }}>Pressão</th>
                        <th style={{ ...styles.innerTh, textAlign: 'center' }}>Mangueira</th>
                        <th style={{ ...styles.innerTh, textAlign: 'center' }}>Bico</th>
                        <th style={{ ...styles.innerTh, textAlign: 'center' }}>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(selectedItem.items || []).map((item, idx) => (
                        <tr key={item.code || item.extinguisherNum || idx} style={styles.innerTr}>
                          <td style={{ ...styles.innerTd, textAlign: 'center', fontWeight: 'bold' }}>{item.code || item.extinguisherNum}</td>
                          <td style={styles.innerTd}>{item.sector || '-'}</td>
                          <td style={styles.innerTd}>{item.type || '-'}</td>
                          <td style={{ ...styles.innerTd, textAlign: 'center' }}>{item.evaluations?.acesso || 'C'}</td>
                          <td style={{ ...styles.innerTd, textAlign: 'center' }}>{item.evaluations?.sinalizacao || 'C'}</td>
                          <td style={{ ...styles.innerTd, textAlign: 'center' }}>{item.evaluations?.pino || 'C'}</td>
                          <td style={{ ...styles.innerTd, textAlign: 'center' }}>{item.evaluations?.lacre || 'C'}</td>
                          <td style={{ ...styles.innerTd, textAlign: 'center' }}>{item.evaluations?.pressurizacao || 'C'}</td>
                          <td style={{ ...styles.innerTd, textAlign: 'center' }}>{item.evaluations?.mangueira || 'C'}</td>
                          <td style={{ ...styles.innerTd, textAlign: 'center' }}>{item.evaluations?.bico || 'C'}</td>
                          <td style={{ ...styles.innerTd, textAlign: 'center' }}>{item.evaluations?.estado_fisico || 'C'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Conteúdo de Hidrantes */}
              {selectedItem.recordType === 'HYDRANT' && (
                <div style={{ marginTop: '1.5rem', overflowX: 'auto' }}>
                  <h4 style={styles.sectionTitle}>Inspeção de Hidrantes de Incêndio</h4>
                  <table style={styles.innerTable}>
                    <thead>
                      <tr>
                        <th style={{ ...styles.innerTh, textAlign: 'center' }}>Código</th>
                        <th style={styles.innerTh}>Setor</th>
                        <th style={styles.innerTh}>Tipo</th>
                        <th style={{ ...styles.innerTh, textAlign: 'center' }}>Acesso</th>
                        <th style={{ ...styles.innerTh, textAlign: 'center' }}>Sinaliz.</th>
                        <th style={{ ...styles.innerTh, textAlign: 'center' }}>Caixa</th>
                        <th style={{ ...styles.innerTh, textAlign: 'center' }}>Mangueira</th>
                        <th style={{ ...styles.innerTh, textAlign: 'center' }}>Esguicho</th>
                        <th style={{ ...styles.innerTh, textAlign: 'center' }}>Chave</th>
                        <th style={{ ...styles.innerTh, textAlign: 'center' }}>Registro</th>
                        <th style={{ ...styles.innerTh, textAlign: 'center' }}>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(selectedItem.items || []).map((item, idx) => (
                        <tr key={item.code || item.hydrantNum || idx} style={styles.innerTr}>
                          <td style={{ ...styles.innerTd, textAlign: 'center', fontWeight: 'bold' }}>{item.code || item.hydrantNum}</td>
                          <td style={styles.innerTd}>{item.sector || '-'}</td>
                          <td style={styles.innerTd}>{item.type || '-'}</td>
                          <td style={{ ...styles.innerTd, textAlign: 'center' }}>{item.evaluations?.acesso || item.evaluations?.mangueira || 'C'}</td>
                          <td style={{ ...styles.innerTd, textAlign: 'center' }}>{item.evaluations?.sinalizacao || 'C'}</td>
                          <td style={{ ...styles.innerTd, textAlign: 'center' }}>{item.evaluations?.caixa || 'C'}</td>
                          <td style={{ ...styles.innerTd, textAlign: 'center' }}>{item.evaluations?.mangueira || 'C'}</td>
                          <td style={{ ...styles.innerTd, textAlign: 'center' }}>{item.evaluations?.esguicho || item.evaluations?.bicos || 'C'}</td>
                          <td style={{ ...styles.innerTd, textAlign: 'center' }}>{item.evaluations?.chave || item.evaluations?.chaves || 'C'}</td>
                          <td style={{ ...styles.innerTd, textAlign: 'center' }}>{item.evaluations?.registro || 'C'}</td>
                          <td style={{ ...styles.innerTd, textAlign: 'center' }}>{item.evaluations?.estado_fisico || 'C'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Assinatura Digital */}
              {selectedItem.signature && (
                <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ ...styles.sectionTitle, marginBottom: '0.5rem' }}>Assinatura Digital</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.35rem' }}>
                    <img 
                      src={selectedItem.signature} 
                      alt="Assinatura Digital" 
                      style={{ maxHeight: '90px', border: '1px dashed #cbd5e1', borderRadius: '6px', backgroundColor: '#ffffff', padding: '4px' }} 
                    />
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Assinatura colhida digitalmente via dispositivo portátil</span>
                  </div>
                </div>
              )}
            </div>

            <div style={{ ...styles.modalFooter, gap: '0.75rem', alignItems: 'center' }}>
              {(selectedItem.recordType === 'EPI' || selectedItem.recordType === 'COPA') && (
                <button 
                  style={styles.btnPrintPrimary} 
                  onClick={() => handlePrintOfficialSheet(selectedItem)}
                  title="Imprimir Ficha Oficial"
                >
                  <Printer size={16} /> Imprimir Ficha
                </button>
              )}
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
  },
  btnPrintPrimary: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    padding: '0.5rem 1.25rem',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: '#0891b2',
    color: '#ffffff',
    fontWeight: '600',
    fontSize: '0.85rem',
    cursor: 'pointer',
    transition: 'opacity 0.15s'
  },
  printBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.3rem',
    padding: '0.35rem 0.65rem',
    backgroundColor: '#ecfeff',
    color: '#0891b2',
    border: '1px solid #a5f3fc',
    borderRadius: '6px',
    fontSize: '0.78rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'opacity 0.15s'
  },
  viewToggleGroup: {
    display: 'inline-flex',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    backgroundColor: '#f8fafc',
    padding: '2px',
    gap: '2px'
  },
  viewToggleBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
    padding: '0.35rem 0.65rem',
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
    boxShadow: '0 1px 2px rgba(0,0,0,0.06)'
  },
  historyCardsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '1rem'
  },
  emptyCardBox: {
    gridColumn: '1 / -1',
    padding: '3rem 1rem',
    textAlign: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: '10px',
    border: '1px dashed #cbd5e1'
  },
  historyCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
  },
  historyCardTop: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '0.5rem',
    paddingBottom: '0.5rem',
    borderBottom: '1px solid #f1f5f9'
  },
  historyCardInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem',
    fontSize: '0.82rem'
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '0.5rem'
  },
  infoKey: {
    color: '#64748b',
    fontWeight: '500'
  },
  infoVal: {
    color: '#0f172a',
    fontWeight: '600',
    textAlign: 'right'
  },
  historyCardActions: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '0.5rem',
    paddingTop: '0.5rem',
    borderTop: '1px solid #f1f5f9'
  },
  viewCardBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
    padding: '0.45rem 0.85rem',
    backgroundColor: '#0891b2',
    color: '#ffffff',
    borderRadius: '6px',
    border: 'none',
    fontSize: '0.8rem',
    fontWeight: '600',
    cursor: 'pointer',
    flex: 1,
    justifyContent: 'center'
  }
};
