import React, { useState, useMemo, useEffect } from 'react';
import { 
  X, UploadCloud, FileSpreadsheet, Download, CheckCircle2, 
  AlertTriangle, Search, Eye, RefreshCw, Clock
} from 'lucide-react';
import { parsePayslipsBatch } from '../../utils/payslipPdfParser';
import { exportYoukExcelFile, formatCurrencyBR } from '../../utils/youkExcelGenerator';
import { dbService } from '../../firebase';
import SearchableEmployeeSelect from './SearchableEmployeeSelect';

export default function PayslipImportModal({ 
  isOpen, 
  onClose, 
  employees = [], 
  currentUser 
}) {
  const [activeTab, setActiveTab] = useState('import'); // 'import' | 'history'
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, fileName: '' });
  
  const [batchResult, setBatchResult] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'matched' | 'unmatched'
  const [selectedPayslip, setSelectedPayslip] = useState(null);
  
  // Histórico de Lotes
  const [historyBatches, setHistoryBatches] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Alerta Preventivo de CPF pendente na exportação Youk
  const [warningModalOpen, setWarningModalOpen] = useState(false);
  const [warningModalData, setWarningModalData] = useState({ pendingCount: 0, totalCount: 0 });

  // Colaboradores ordenados alfabeticamente para o seletor de vínculo
  const sortedEmployees = useMemo(() => {
    return [...employees].sort((a, b) => 
      (a.name || '').localeCompare(b.name || '', 'pt-BR', { sensitivity: 'base' })
    );
  }, [employees]);

  useEffect(() => {
    if (isOpen) {
      loadHistory();
    }
  }, [isOpen]);

  const loadHistory = async () => {
    setLoadingHistory(true);
    try {
      if (dbService.getPayrollBatches) {
        const list = await dbService.getPayrollBatches();
        setHistoryBatches(list || []);
      }
    } catch (err) {
      console.warn('Erro ao carregar histórico de lotes:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Processar arquivos (arrastados ou selecionados)
  const handleFiles = async (files) => {
    if (!files || files.length === 0) return;
    setIsProcessing(true);
    setProgress({ current: 0, total: 1, fileName: 'Iniciando leitura...' });

    try {
      // Se for apenas um arquivo e for ZIP
      const firstFile = files[0];
      const isZip = firstFile.name.toLowerCase().endsWith('.zip') || firstFile.type.includes('zip');
      const input = isZip ? firstFile : Array.from(files);

      const result = await parsePayslipsBatch(input, employees, (p) => {
        setProgress(p);
      });

      setBatchResult(result);
    } catch (err) {
      console.error('Erro no processamento da folha:', err);
      alert('Falha ao processar os arquivos de folha: ' + (err.message || 'Erro desconhecido'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  // Vinculação manual de colaborador
  const handleManualLink = (payslipId, selectedEmpId) => {
    if (!batchResult) return;
    const emp = employees.find(e => e.id === selectedEmpId);
    
    setBatchResult(prev => {
      const updatedItems = prev.items.map(it => {
        if (it.id === payslipId) {
          return {
            ...it,
            isMatched: !!emp,
            matchedEmployee: emp || null,
            matchMethod: 'manual'
          };
        }
        return it;
      });

      const matchedCount = updatedItems.filter(it => it.isMatched && (it.matchedEmployee?.cpf || it.cpf)).length;
      return {
        ...prev,
        summary: {
          ...prev.summary,
          matchedCount,
          unmatchedCount: updatedItems.length - matchedCount
        },
        items: updatedItems
      };
    });
  };

  // Disparar exportação ou exibir alerta preventivo de CPF pendente
  const handleExportClick = () => {
    if (!batchResult || !batchResult.items || batchResult.items.length === 0) return;

    const pendingItems = batchResult.items.filter(it => !it.matchedEmployee?.cpf && !it.cpf);
    if (pendingItems.length > 0) {
      setWarningModalData({
        pendingCount: pendingItems.length,
        totalCount: batchResult.items.length
      });
      setWarningModalOpen(true);
      return;
    }

    executeExport();
  };

  // Execução direta do download e registro no banco
  const executeExport = async () => {
    setWarningModalOpen(false);
    if (!batchResult || !batchResult.items || batchResult.items.length === 0) return;

    try {
      const sample = batchResult.items[0];
      const mes = sample?.month || '09';
      const ano = sample?.year || '2026';
      const fileName = `ReciboPg_Youk_${mes}_${ano}.xlsx`;

      exportYoukExcelFile(batchResult.items, fileName);

      // Gravar histórico de lote no banco
      const operatorName = currentUser?.name || currentUser?.email || 'Operador RH';
      const batchRecord = {
        competence: `${mes}/${ano}`,
        fileName,
        totalCount: batchResult.summary.totalCount,
        matchedCount: batchResult.summary.matchedCount,
        unmatchedCount: batchResult.summary.unmatchedCount,
        totalNet: batchResult.summary.totalNet,
        totalEarnings: batchResult.summary.totalEarnings,
        totalDiscounts: batchResult.summary.totalDiscounts,
        operator: operatorName,
        itemsCount: batchResult.items.length
      };

      if (dbService.createPayrollBatch) {
        await dbService.createPayrollBatch(batchRecord);
        loadHistory();
      }

      if (dbService.createAuditLog) {
        await dbService.createAuditLog({
          operator: operatorName,
          action: 'Exportação Youk',
          details: `Exportada planilha da competência ${mes}/${ano} com ${batchResult.items.length} holerites.`
        });
      }

      alert(`Arquivo ${fileName} exportado com sucesso! Lote gravado no histórico.`);
    } catch (err) {
      console.error('Erro na exportação para Youk:', err);
      alert('Erro ao gerar planilha do Youk: ' + err.message);
    }
  };

  // Filtragem dos itens exibidos
  const filteredItems = useMemo(() => {
    if (!batchResult || !batchResult.items) return [];
    return batchResult.items.filter(it => {
      const empName = (it.matchedEmployee?.name || it.employeeName || '').toLowerCase();
      const code = String(it.matchedEmployee?.registration || it.employeeCode || '').toLowerCase();
      const cpf = String(it.matchedEmployee?.cpf || it.cpf || '').toLowerCase();
      const term = searchTerm.toLowerCase();

      const matchesSearch = !term || empName.includes(term) || code.includes(term) || cpf.includes(term);

      if (!matchesSearch) return false;

      const hasCpf = !!(it.matchedEmployee?.cpf || it.cpf);
      if (statusFilter === 'matched') return it.isMatched && hasCpf;
      if (statusFilter === 'unmatched') return !it.isMatched || !hasCpf;

      return true;
    });
  }, [batchResult, searchTerm, statusFilter]);

  if (!isOpen) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        
        {/* Cabeçalho */}
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <div style={styles.headerIcon}>
              <FileSpreadsheet size={24} color="#059669" />
            </div>
            <div>
              <div style={styles.badgeLabel}>.RH • FOLHA</div>
              <h2 style={styles.title}>Holerites</h2>
              <p style={styles.subtitle}>Processamento de contracheques e exportação para Youk Manager</p>
            </div>
          </div>

          <div style={styles.headerActions}>
            <div style={styles.tabGroup}>
              <button 
                type="button"
                style={{
                  ...styles.tabBtn,
                  ...(activeTab === 'import' ? styles.tabBtnActive : {})
                }}
                onClick={() => setActiveTab('import')}
              >
                Importar
              </button>
              <button 
                type="button"
                style={{
                  ...styles.tabBtn,
                  ...(activeTab === 'history' ? styles.tabBtnActive : {})
                }}
                onClick={() => setActiveTab('history')}
              >
                Histórico
              </button>
            </div>

            <button type="button" style={styles.closeBtn} onClick={onClose} title="Fechar">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Corpo do Modal */}
        <div style={styles.body}>

          {activeTab === 'history' ? (
            /* Visualização do Histórico de Lotes */
            <div style={styles.historyContainer}>
              <div style={styles.historyTop}>
                <h3 style={styles.sectionTitle}>Histórico de Exportações</h3>
                <button type="button" style={styles.refreshBtn} onClick={loadHistory} disabled={loadingHistory}>
                  <RefreshCw size={14} className={loadingHistory ? 'spin' : ''} />
                  Atualizar
                </button>
              </div>

              {historyBatches.length === 0 ? (
                <div style={styles.emptyState}>
                  <Clock size={40} color="#94a3b8" />
                  <p style={{ marginTop: '0.75rem', fontWeight: 600, color: '#64748b' }}>Nenhum lote de folha exportado ainda</p>
                  <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Importe o primeiro arquivo ZIP para gerar o histórico.</p>
                </div>
              ) : (
                <div style={styles.tableWrapper}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Data</th>
                        <th style={styles.th}>Competência</th>
                        <th style={styles.th}>Arquivo</th>
                        <th style={styles.th}>Holerites</th>
                        <th style={styles.th}>Líquido</th>
                        <th style={styles.th}>Operador</th>
                      </tr>
                    </thead>
                    <tbody>
                      {historyBatches.map(b => (
                        <tr key={b.id} style={styles.tr}>
                          <td style={styles.td}>
                            {new Date(b.createdAt).toLocaleDateString('pt-BR')} {new Date(b.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td style={{ ...styles.td, fontWeight: 700, color: '#0f172a' }}>{b.competence}</td>
                          <td style={styles.td}>{b.fileName}</td>
                          <td style={styles.td}>
                            <span style={styles.badgeGreen}>{b.totalCount} holerites</span>
                          </td>
                          <td style={{ ...styles.td, fontWeight: 700, color: '#059669' }}>
                            R$ {formatCurrencyBR(b.totalNet)}
                          </td>
                          <td style={styles.td}>{b.operator || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            /* Visualização de Importação e Processamento */
            <>
              {/* Dropzone */}
              {!batchResult && !isProcessing && (
                <div 
                  style={{
                    ...styles.dropzone,
                    ...(isDragging ? styles.dropzoneActive : {})
                  }}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('payslipFileInput')?.click()}
                >
                  <input 
                    type="file" 
                    id="payslipFileInput" 
                    style={{ display: 'none' }}
                    accept=".zip,.pdf" 
                    multiple
                    onChange={(e) => handleFiles(e.target.files)}
                  />
                  <div style={styles.dropzoneIconWrapper}>
                    <UploadCloud size={44} color="#059669" />
                  </div>
                  <h4 style={styles.dropzoneTitle}>Arraste o arquivo .ZIP ou arquivos .PDF da folha</h4>
                  <p style={styles.dropzoneSubtitle}>
                    O sistema descompacta e lê os contracheques individuais em segundos
                  </p>
                  <div style={styles.dropzoneButton}>
                    Selecionar
                  </div>
                </div>
              )}

              {/* Barra de Progresso durante processamento */}
              {isProcessing && (
                <div style={styles.progressContainer}>
                  <div style={styles.progressHeader}>
                    <span style={{ fontWeight: 600, color: '#1e293b' }}>Processando contracheques...</span>
                    <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                      {progress.current} de {progress.total}
                    </span>
                  </div>
                  <div style={styles.progressBarTrack}>
                    <div 
                      style={{
                        ...styles.progressBarFill,
                        width: progress.total > 0 ? `${(progress.current / progress.total) * 100}%` : '10%'
                      }}
                    />
                  </div>
                  <p style={styles.progressFile}>{progress.fileName}</p>
                </div>
              )}

              {/* Resultado do Processamento */}
              {batchResult && (
                <div>
                  {/* Resumo KPI */}
                  <div style={styles.kpiGrid}>
                    <div style={styles.kpiCard}>
                      <span style={styles.kpiLabel}>Holerites</span>
                      <span style={styles.kpiValue}>{batchResult.summary.totalCount}</span>
                    </div>

                    <div style={styles.kpiCard}>
                      <span style={styles.kpiLabel}>Vinculados</span>
                      <span style={{ ...styles.kpiValue, color: '#059669' }}>
                        {batchResult.summary.matchedCount}
                      </span>
                    </div>

                    <div style={styles.kpiCard}>
                      <span style={styles.kpiLabel}>Pendentes</span>
                      <span style={{ ...styles.kpiValue, color: batchResult.summary.unmatchedCount > 0 ? '#d97706' : '#64748b' }}>
                        {batchResult.summary.unmatchedCount}
                      </span>
                    </div>

                    <div style={styles.kpiCard}>
                      <span style={styles.kpiLabel}>Líquido</span>
                      <span style={{ ...styles.kpiValue, color: '#2563eb' }}>
                        R$ {formatCurrencyBR(batchResult.summary.totalNet)}
                      </span>
                    </div>
                  </div>

                  {/* Barra de Ferramentas da Tabela */}
                  <div style={styles.toolbar}>
                    <div style={styles.searchWrapper}>
                      <Search size={16} color="#94a3b8" />
                      <input 
                        type="text"
                        style={styles.searchInput}
                        placeholder="Pesquisar por colaborador, matrícula ou CPF..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>

                    <div style={styles.filterGroup}>
                      <button
                        type="button"
                        style={{
                          ...styles.filterBtn,
                          ...(statusFilter === 'all' ? styles.filterBtnActive : {})
                        }}
                        onClick={() => setStatusFilter('all')}
                      >
                        Todos ({batchResult.items.length})
                      </button>
                      <button
                        type="button"
                        style={{
                          ...styles.filterBtn,
                          ...(statusFilter === 'matched' ? styles.filterBtnActive : {})
                        }}
                        onClick={() => setStatusFilter('matched')}
                      >
                        Vinculados ({batchResult.summary.matchedCount})
                      </button>
                      <button
                        type="button"
                        style={{
                          ...styles.filterBtn,
                          ...(statusFilter === 'unmatched' ? styles.filterBtnActive : {})
                        }}
                        onClick={() => setStatusFilter('unmatched')}
                      >
                        Pendentes ({batchResult.summary.unmatchedCount})
                      </button>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button 
                        type="button" 
                        style={styles.btnSecondary}
                        onClick={() => setBatchResult(null)}
                      >
                        Limpar
                      </button>

                      <button 
                        type="button" 
                        style={styles.btnPrimary}
                        onClick={handleExportClick}
                      >
                        <Download size={16} />
                        Exportar
                      </button>
                    </div>
                  </div>

                  {/* Tabela de Conferência */}
                  <div style={styles.tableWrapper}>
                    <table style={styles.table}>
                      <thead>
                        <tr>
                          <th style={styles.th}>Colaborador</th>
                          <th style={styles.th}>Matrícula</th>
                          <th style={styles.th}>CPF</th>
                          <th style={styles.th}>Proventos</th>
                          <th style={styles.th}>Descontos</th>
                          <th style={styles.th}>Líquido</th>
                          <th style={styles.th}>Status</th>
                          <th style={{ ...styles.th, textAlign: 'center' }}>Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredItems.map(item => {
                          const hasCpf = !!(item.matchedEmployee?.cpf || item.cpf);
                          const isOk = item.isMatched && hasCpf;

                          return (
                            <tr key={item.id} style={styles.tr}>
                              <td style={styles.td}>
                                <div style={{ fontWeight: 600, color: '#0f172a' }}>
                                  {item.matchedEmployee?.name || item.employeeName || 'Colaborador não identificado'}
                                </div>
                                {item.matchedEmployee && item.employeeName && item.matchedEmployee.name !== item.employeeName && (
                                  <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                                    Holerite: {item.employeeName} {item.matchConfidence ? `(${item.matchConfidence}%)` : ''}
                                  </div>
                                )}
                                {!item.matchedEmployee && item.employeeName && (
                                  <div style={{ fontSize: '0.7rem', color: '#dc2626', fontWeight: 500 }}>
                                    Lido no PDF: {item.employeeName} (Pendente de vínculo)
                                  </div>
                                )}
                                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                  {item.matchedEmployee?.role || item.role || 'Cargo não informado'}
                                </div>
                              </td>

                              <td style={styles.td}>
                                <span style={styles.badgeCode}>
                                  {item.matchedEmployee?.registration || item.employeeCode || '-'}
                                </span>
                              </td>

                              <td style={styles.td}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', minWidth: '150px' }}>
                                  {item.matchedEmployee?.cpf || item.cpf ? (
                                    <span style={{ fontWeight: 600, color: '#0f172a' }}>
                                      {item.matchedEmployee?.cpf || item.cpf}
                                    </span>
                                  ) : null}
                                  <SearchableEmployeeSelect
                                    value={item.matchedEmployee?.id || ''}
                                    employees={sortedEmployees}
                                    onChange={(selectedEmpId) => handleManualLink(item.id, selectedEmpId)}
                                    hasCpf={!!(item.matchedEmployee?.cpf || item.cpf)}
                                    placeholder={item.matchedEmployee ? 'Trocar...' : 'Vincular...'}
                                  />
                                </div>
                              </td>

                              <td style={styles.td}>
                                R$ {formatCurrencyBR(item.grossEarnings)}
                              </td>

                              <td style={{ ...styles.td, color: '#ef4444' }}>
                                R$ {formatCurrencyBR(item.totalDiscounts)}
                              </td>

                              <td style={{ ...styles.td, fontWeight: 700, color: '#059669' }}>
                                R$ {formatCurrencyBR(item.netSalary)}
                              </td>

                              <td style={styles.td}>
                                {isOk ? (
                                  <span style={styles.badgeStatusOk}>
                                    <CheckCircle2 size={12} />
                                    Pronto
                                  </span>
                                ) : (
                                  <span style={styles.badgeStatusWarn}>
                                    <AlertTriangle size={12} />
                                    Pendente
                                  </span>
                                )}
                              </td>

                              <td style={{ ...styles.td, textAlign: 'center' }}>
                                <button
                                  type="button"
                                  style={styles.btnAction}
                                  onClick={() => setSelectedPayslip(item)}
                                  title="Ver verbas"
                                >
                                  <Eye size={15} />
                                  Ver
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}

        </div>

        {/* Modal de Detalhes das Verbas (Visualização do Holerite) */}
        {selectedPayslip && (
          <div style={styles.subModalOverlay}>
            <div style={styles.subModal}>
              <div style={styles.subModalHeader}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
                    {selectedPayslip.matchedEmployee?.name || selectedPayslip.employeeName}
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    Matrícula: {selectedPayslip.matchedEmployee?.registration || selectedPayslip.employeeCode || '-'} • {selectedPayslip.matchedEmployee?.role || selectedPayslip.role || 'Cargo não informado'} • Admissão: {selectedPayslip.matchedEmployee?.admissionDate || selectedPayslip.admissionDate || '-'}
                  </p>
                </div>
                <button 
                  type="button" 
                  style={styles.closeBtn} 
                  onClick={() => setSelectedPayslip(null)}
                >
                  <X size={18} />
                </button>
              </div>

              <div style={styles.subModalBody}>
                {/* Informações da Empresa & Recibo */}
                <div style={styles.infoRow}>
                  <div><strong>Empresa:</strong> {selectedPayslip.companyName}</div>
                  <div><strong>CNPJ:</strong> {selectedPayslip.companyCnpj}</div>
                  <div><strong>Competência:</strong> {selectedPayslip.periodLabel || `${selectedPayslip.month}/${selectedPayslip.year}`}</div>
                </div>

                {/* Tabela de Verbas */}
                <div style={styles.tableWrapper}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Código</th>
                        <th style={styles.th}>Descrição</th>
                        <th style={styles.th}>Referência</th>
                        <th style={styles.th}>Proventos</th>
                        <th style={styles.th}>Descontos</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedPayslip.events.map((ev, idx) => (
                        <tr key={idx} style={styles.tr}>
                          <td style={styles.td}><span style={styles.badgeCode}>{ev.code}</span></td>
                          <td style={{ ...styles.td, fontWeight: 600 }}>{ev.description}</td>
                          <td style={styles.td}>{ev.reference || '-'}</td>
                          <td style={{ ...styles.td, color: ev.earnings ? '#059669' : '#64748b' }}>
                            {ev.earnings ? `R$ ${formatCurrencyBR(ev.earnings)}` : '-'}
                          </td>
                          <td style={{ ...styles.td, color: ev.discounts ? '#ef4444' : '#64748b' }}>
                            {ev.discounts ? `R$ ${formatCurrencyBR(ev.discounts)}` : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Bases e Totais */}
                <div style={styles.basesGrid}>
                  <div style={styles.baseItem}>
                    <span style={styles.baseLabel}>Salário Base</span>
                    <span style={styles.baseVal}>R$ {formatCurrencyBR(selectedPayslip.baseSalary)}</span>
                  </div>
                  <div style={styles.baseItem}>
                    <span style={styles.baseLabel}>Base INSS</span>
                    <span style={styles.baseVal}>R$ {formatCurrencyBR(selectedPayslip.baseInss)}</span>
                  </div>
                  <div style={styles.baseItem}>
                    <span style={styles.baseLabel}>Base FGTS</span>
                    <span style={styles.baseVal}>R$ {formatCurrencyBR(selectedPayslip.baseFgts)}</span>
                  </div>
                  <div style={styles.baseItem}>
                    <span style={styles.baseLabel}>FGTS Mês</span>
                    <span style={styles.baseVal}>R$ {formatCurrencyBR(selectedPayslip.fgtsValue)}</span>
                  </div>
                  <div style={styles.baseItem}>
                    <span style={styles.baseLabel}>Base IRRF</span>
                    <span style={styles.baseVal}>R$ {formatCurrencyBR(selectedPayslip.baseIrrf)}</span>
                  </div>
                </div>

                {/* Totais Finais */}
                <div style={styles.totalsBox}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Total Vencimentos:</span>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: '#059669' }}>
                      R$ {formatCurrencyBR(selectedPayslip.grossEarnings)}
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Total Descontos:</span>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: '#ef4444' }}>
                      R$ {formatCurrencyBR(selectedPayslip.totalDiscounts)}
                    </div>
                  </div>
                  <div style={{ borderLeft: '2px solid #e2e8f0', paddingLeft: '1.25rem' }}>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Valor Líquido:</span>
                    <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#2563eb' }}>
                      R$ {formatCurrencyBR(selectedPayslip.netSalary)}
                    </div>
                  </div>
                </div>
              </div>

              <div style={styles.subModalFooter}>
                <button 
                  type="button" 
                  style={styles.btnSecondary} 
                  onClick={() => setSelectedPayslip(null)}
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Alerta: Holerites sem CPF */}
        {warningModalOpen && (
          <div style={styles.subModalOverlay}>
            <div style={{ ...styles.subModal, maxWidth: '440px' }}>
              <div style={{ ...styles.subModalHeader, borderBottom: '1px solid #fed7aa', backgroundColor: '#fffbeb' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    backgroundColor: '#fef3c7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#d97706',
                    flexShrink: 0
                  }}>
                    <AlertTriangle size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#92400e', margin: 0 }}>
                      Alerta
                    </h3>
                    <span style={{ fontSize: '0.75rem', color: '#b45309' }}>
                      {warningModalData.pendingCount} de {warningModalData.totalCount} holerites sem CPF
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  style={styles.closeBtn}
                  onClick={() => setWarningModalOpen(false)}
                >
                  <X size={18} />
                </button>
              </div>

              <div style={{ ...styles.subModalBody, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#475569', lineHeight: 1.5 }}>
                  Foram identificados <strong>{warningModalData.pendingCount} contracheque(s)</strong> sem CPF preenchido ou com vínculo pendente.
                </p>
                <div style={{
                  padding: '0.75rem',
                  backgroundColor: '#fffbeb',
                  border: '1px solid #fef3c7',
                  borderRadius: '8px',
                  fontSize: '0.78rem',
                  color: '#92400e',
                  lineHeight: 1.4
                }}>
                  A plataforma Youk Manager exige o CPF cadastrado para validar o funcionário e viabilizar a assinatura digital no celular.
                </div>
                <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b' }}>
                  Deseja exportar a planilha mesmo com CPFs pendentes ou prefere vincular os colaboradores antes?
                </p>
              </div>

              <div style={{
                padding: '0.75rem 1.25rem',
                borderTop: '1px solid #f1f5f9',
                backgroundColor: '#f8fafc',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '0.5rem',
                borderBottomLeftRadius: '12px',
                borderBottomRightRadius: '12px'
              }}>
                <button
                  type="button"
                  style={styles.btnSecondary}
                  onClick={() => setWarningModalOpen(false)}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  style={{
                    ...styles.btnPrimary,
                    backgroundColor: '#d97706'
                  }}
                  onClick={executeExport}
                >
                  Exportar
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

const styles = {
  overlay: {
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
    zIndex: 9999,
    padding: '1rem'
  },
  modal: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '1080px',
    maxHeight: '92vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    overflow: 'hidden'
  },
  header: {
    padding: '1.25rem 1.5rem',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc'
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.85rem'
  },
  headerIcon: {
    width: '46px',
    height: '46px',
    borderRadius: '12px',
    backgroundColor: '#ecfdf5',
    border: '1px solid #a7f3d0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  badgeLabel: {
    fontSize: '0.68rem',
    fontWeight: 800,
    letterSpacing: '0.05em',
    color: '#059669',
    marginBottom: '2px'
  },
  title: {
    fontSize: '1.3rem',
    fontWeight: 800,
    color: '#0f172a',
    margin: 0,
    lineHeight: 1.2
  },
  subtitle: {
    fontSize: '0.8rem',
    color: '#64748b',
    margin: 0
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem'
  },
  tabGroup: {
    display: 'flex',
    backgroundColor: '#e2e8f0',
    padding: '3px',
    borderRadius: '8px'
  },
  tabBtn: {
    border: 'none',
    backgroundColor: 'transparent',
    padding: '0.4rem 0.85rem',
    borderRadius: '6px',
    fontSize: '0.8rem',
    fontWeight: 600,
    color: '#64748b',
    cursor: 'pointer',
    transition: 'all 0.15s ease'
  },
  tabBtnActive: {
    backgroundColor: '#ffffff',
    color: '#0f172a',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  closeBtn: {
    border: 'none',
    backgroundColor: 'transparent',
    color: '#64748b',
    cursor: 'pointer',
    padding: '0.4rem',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  body: {
    padding: '1.25rem 1.5rem',
    overflowY: 'auto',
    flex: 1
  },
  dropzone: {
    border: '2px dashed #a7f3d0',
    backgroundColor: '#f0fdf4',
    borderRadius: '14px',
    padding: '3.5rem 2rem',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  },
  dropzoneActive: {
    borderColor: '#059669',
    backgroundColor: '#dcfce7'
  },
  dropzoneIconWrapper: {
    width: '72px',
    height: '72px',
    borderRadius: '50%',
    backgroundColor: '#ffffff',
    boxShadow: '0 4px 12px rgba(5, 150, 105, 0.15)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '1rem'
  },
  dropzoneTitle: {
    fontSize: '1.15rem',
    fontWeight: 700,
    color: '#065f46',
    margin: '0 0 0.35rem 0'
  },
  dropzoneSubtitle: {
    fontSize: '0.85rem',
    color: '#047857',
    margin: '0 0 1.25rem 0',
    maxWidth: '480px'
  },
  dropzoneButton: {
    backgroundColor: '#059669',
    color: '#ffffff',
    padding: '0.6rem 1.4rem',
    borderRadius: '8px',
    fontWeight: 600,
    fontSize: '0.85rem',
    boxShadow: '0 2px 6px rgba(5, 150, 105, 0.25)'
  },
  progressContainer: {
    padding: '2.5rem 1.5rem',
    textAlign: 'center',
    maxWidth: '520px',
    margin: '0 auto'
  },
  progressHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '0.6rem',
    fontSize: '0.9rem'
  },
  progressBarTrack: {
    width: '100%',
    height: '10px',
    backgroundColor: '#e2e8f0',
    borderRadius: '999px',
    overflow: 'hidden'
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#059669',
    borderRadius: '999px',
    transition: 'width 0.2s ease'
  },
  progressFile: {
    fontSize: '0.78rem',
    color: '#64748b',
    marginTop: '0.6rem',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '0.85rem',
    marginBottom: '1.25rem'
  },
  kpiCard: {
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    padding: '0.85rem 1rem',
    display: 'flex',
    flexDirection: 'column'
  },
  kpiLabel: {
    fontSize: '0.72rem',
    fontWeight: 700,
    color: '#64748b',
    textTransform: 'uppercase'
  },
  kpiValue: {
    fontSize: '1.4rem',
    fontWeight: 800,
    color: '#0f172a',
    marginTop: '0.2rem'
  },
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '0.75rem',
    marginBottom: '1rem',
    flexWrap: 'wrap'
  },
  searchWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    backgroundColor: '#f8fafc',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    padding: '0.45rem 0.75rem',
    flex: 1,
    minWidth: '240px'
  },
  searchInput: {
    border: 'none',
    backgroundColor: 'transparent',
    outline: 'none',
    fontSize: '0.85rem',
    width: '100%',
    color: '#0f172a'
  },
  filterGroup: {
    display: 'flex',
    gap: '0.35rem'
  },
  filterBtn: {
    border: '1px solid #cbd5e1',
    backgroundColor: '#ffffff',
    padding: '0.45rem 0.75rem',
    borderRadius: '7px',
    fontSize: '0.78rem',
    fontWeight: 600,
    color: '#64748b',
    cursor: 'pointer'
  },
  filterBtnActive: {
    backgroundColor: '#059669',
    borderColor: '#059669',
    color: '#ffffff'
  },
  btnPrimary: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    backgroundColor: '#059669',
    color: '#ffffff',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    fontWeight: 600,
    fontSize: '0.82rem',
    cursor: 'pointer',
    boxShadow: '0 2px 5px rgba(5, 150, 105, 0.25)'
  },
  btnSecondary: {
    border: '1px solid #cbd5e1',
    backgroundColor: '#ffffff',
    color: '#334155',
    padding: '0.5rem 0.85rem',
    borderRadius: '8px',
    fontWeight: 600,
    fontSize: '0.82rem',
    cursor: 'pointer'
  },
  tableWrapper: {
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    overflow: 'hidden'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.8rem'
  },
  th: {
    backgroundColor: '#f1f5f9',
    color: '#334155',
    fontWeight: 700,
    padding: '0.65rem 0.85rem',
    textAlign: 'left',
    borderBottom: '1px solid #e2e8f0'
  },
  tr: {
    borderBottom: '1px solid #f1f5f9',
    transition: 'background-color 0.15s ease'
  },
  td: {
    padding: '0.65rem 0.85rem',
    color: '#334155'
  },
  badgeCode: {
    backgroundColor: '#f1f5f9',
    color: '#475569',
    padding: '2px 6px',
    borderRadius: '4px',
    fontFamily: 'monospace',
    fontWeight: 700,
    fontSize: '0.75rem'
  },
  badgeGreen: {
    backgroundColor: '#ecfdf5',
    color: '#059669',
    padding: '2px 8px',
    borderRadius: '6px',
    fontWeight: 700,
    fontSize: '0.75rem'
  },
  badgeStatusOk: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    backgroundColor: '#dcfce7',
    color: '#15803d',
    padding: '2px 7px',
    borderRadius: '6px',
    fontWeight: 700,
    fontSize: '0.72rem'
  },
  badgeStatusWarn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    backgroundColor: '#fef3c7',
    color: '#b45309',
    padding: '2px 7px',
    borderRadius: '6px',
    fontWeight: 700,
    fontSize: '0.72rem'
  },
  selectLink: {
    padding: '0.25rem 0.4rem',
    borderRadius: '6px',
    border: '1px solid #f59e0b',
    backgroundColor: '#fffbeb',
    fontSize: '0.75rem',
    color: '#92400e',
    outline: 'none',
    cursor: 'pointer'
  },
  btnAction: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    border: '1px solid #cbd5e1',
    backgroundColor: '#ffffff',
    color: '#0f172a',
    padding: '0.25rem 0.5rem',
    borderRadius: '6px',
    fontSize: '0.72rem',
    fontWeight: 600,
    cursor: 'pointer'
  },
  subModalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000,
    padding: '1rem'
  },
  subModal: {
    backgroundColor: '#ffffff',
    borderRadius: '14px',
    width: '100%',
    maxWidth: '720px',
    maxHeight: '88vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
    overflow: 'hidden'
  },
  subModalHeader: {
    padding: '1rem 1.25rem',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc'
  },
  subModalBody: {
    padding: '1.25rem',
    overflowY: 'auto',
    flex: 1
  },
  subModalFooter: {
    padding: '0.75rem 1.25rem',
    borderTop: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'flex-end',
    backgroundColor: '#f8fafc'
  },
  infoRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '0.5rem',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '0.65rem 0.85rem',
    fontSize: '0.75rem',
    color: '#334155',
    marginBottom: '1rem'
  },
  basesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: '0.5rem',
    marginTop: '1rem'
  },
  baseItem: {
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '0.5rem',
    textAlign: 'center'
  },
  baseLabel: {
    fontSize: '0.68rem',
    color: '#64748b',
    fontWeight: 600,
    display: 'block'
  },
  baseVal: {
    fontSize: '0.85rem',
    fontWeight: 700,
    color: '#1e293b',
    marginTop: '2px'
  },
  totalsBox: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f1f5f9',
    borderRadius: '10px',
    padding: '0.85rem 1.25rem',
    marginTop: '1rem'
  },
  historyContainer: {
    padding: '0.5rem 0'
  },
  historyTop: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '1rem'
  },
  sectionTitle: {
    fontSize: '1rem',
    fontWeight: 700,
    color: '#0f172a',
    margin: 0
  },
  refreshBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    border: '1px solid #cbd5e1',
    backgroundColor: '#ffffff',
    color: '#475569',
    padding: '0.35rem 0.65rem',
    borderRadius: '6px',
    fontSize: '0.78rem',
    fontWeight: 600,
    cursor: 'pointer'
  },
  emptyState: {
    textAlign: 'center',
    padding: '3rem 1rem'
  }
};
