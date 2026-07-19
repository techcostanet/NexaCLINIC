import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { dbService } from '../firebase';
import { UploadCloud, FileSpreadsheet, ShieldAlert, CheckCircle2, History, Keyboard, Save, Download, FileText } from 'lucide-react';

export default function UploadData({ currentUser }) {
  const [activeTab, setActiveTab] = useState('manual'); // 'manual' | 'spreadsheet'
  const [sectors, setSectors] = useState([]);
  const [indicators, setIndicators] = useState([]);
  const [uploadHistory, setUploadHistory] = useState([]);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [saving, setSaving] = useState(false);

  // Manual Form State
  const [manualSector, setManualSector] = useState('');
  const [manualIndicator, setManualIndicator] = useState('');
  const [manualValue, setManualValue] = useState('');
  const [manualPeriod, setManualPeriod] = useState(new Date().toISOString().substring(0, 7)); // YYYY-MM

  // Spreadsheet Upload State
  const [file, setFile] = useState(null);
  const [parsing, setParsing] = useState(false);
  const [parsedData, setParsedData] = useState([]);
  const [validationErrors, setValidationErrors] = useState([]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      // Fetch authorized sectors
      const allSectors = await dbService.getSectors();
      const userSectors = currentUser.role === 'admin'
        ? allSectors
        : allSectors.filter(s => currentUser.allowedSectors.includes(s.id));
      setSectors(userSectors);

      if (userSectors.length > 0) {
        setManualSector(userSectors[0].id);
      }

      // Fetch all indicators
      const allIndicators = await dbService.getIndicators();
      setIndicators(allIndicators);

      // Fetch upload and entry history
      const history = await dbService.getUploadsHistory();
      setUploadHistory(history);
    } catch (err) {
      console.error(err);
    }
  };

  const showAlert = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 5000);
  };

  // Filter indicators based on the selected sector in the manual form
  const filteredIndicators = indicators.filter(ind => ind.sectorId === manualSector);

  // Update default manual indicator when sector changes
  useEffect(() => {
    if (filteredIndicators.length > 0) {
      setManualIndicator(filteredIndicators[0].id);
    } else {
      setManualIndicator('');
    }
  }, [manualSector, indicators]);

  // Submit manual data record
  const handleSaveManual = async (e) => {
    e.preventDefault();
    if (!manualSector || !manualIndicator || !manualValue || !manualPeriod) {
      return showAlert('Preencha todos os campos do formulário.', 'warning');
    }

    const value = parseFloat(manualValue.toString().replace(',', '.'));
    if (isNaN(value)) {
      return showAlert('O valor deve ser um número válido.', 'warning');
    }

    setSaving(true);
    try {
      await dbService.saveSingleIndicatorRecord({
        indicatorId: manualIndicator,
        sectorId: manualSector,
        value: value,
        period: manualPeriod
      }, currentUser.uid);

      showAlert('Indicador lançado com sucesso!', 'success');
      setManualValue('');
      
      // Reload history log
      const history = await dbService.getUploadsHistory();
      setUploadHistory(history);
    } catch (err) {
      showAlert(err.message || 'Erro ao salvar indicador.', 'danger');
    } finally {
      setSaving(false);
    }
  };

  // ----------------------------------------------------
  // Spreadsheet Upload Logic
  // ----------------------------------------------------
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (selectedFile) => {
    if (!selectedFile.name.endsWith('.csv')) {
      return showAlert('Por favor, selecione apenas arquivos CSV.', 'danger');
    }
    setFile(selectedFile);
    setParsedData([]);
    setValidationErrors([]);
    parseCSV(selectedFile);
  };

  const parseCSV = (csvFile) => {
    setParsing(true);
    Papa.parse(csvFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        validateCSVData(results.data);
        setParsing(false);
      },
      error: (err) => {
        console.error(err);
        showAlert('Falha ao processar o arquivo CSV.', 'danger');
        setParsing(false);
      }
    });
  };

  const validateCSVData = (rawData) => {
    const validRows = [];
    const errors = [];

    if (rawData.length === 0) {
      errors.push('A planilha está vazia.');
      setValidationErrors(errors);
      return;
    }

    const firstRowKeys = Object.keys(rawData[0]).map(k => k.trim());
    const requiredHeaders = ['Setor', 'Indicador', 'Valor', 'Periodo'];
    
    const missingHeaders = requiredHeaders.filter(h => !firstRowKeys.some(k => k.toLowerCase() === h.toLowerCase()));
    if (missingHeaders.length > 0) {
      errors.push(`Cabeçalhos obrigatórios ausentes: ${missingHeaders.join(', ')}`);
      setValidationErrors(errors);
      return;
    }

    rawData.forEach((row, index) => {
      const lineNum = index + 2;
      
      const getVal = (keyName) => {
        const foundKey = Object.keys(row).find(k => k.trim().toLowerCase() === keyName.toLowerCase());
        return foundKey ? row[foundKey].trim() : '';
      };

      const sector = getVal('Setor');
      const indicatorName = getVal('Indicador');
      const valueStr = getVal('Valor');
      const period = getVal('Periodo');
      const unit = getVal('Unidade') || '%';
      const targetStr = getVal('Meta') || '0';

      if (!sector || !indicatorName || !valueStr || !period) {
        errors.push(`Linha ${lineNum}: Existem colunas obrigatórias vazias.`);
        return;
      }

      const mappedSector = sectors.find(s => s.name.toLowerCase() === sector.toLowerCase() || s.id === sector.toLowerCase());
      if (!mappedSector) {
        errors.push(`Linha ${lineNum}: Setor "${sector}" não cadastrado ou não autorizado para seu perfil.`);
        return;
      }

      const value = parseFloat(valueStr.replace(',', '.'));
      if (isNaN(value)) {
        errors.push(`Linha ${lineNum}: O valor "${valueStr}" deve ser numérico.`);
        return;
      }

      const target = parseFloat(targetStr.replace(',', '.'));
      if (isNaN(target)) {
        errors.push(`Linha ${lineNum}: A meta "${targetStr}" deve ser numérica.`);
        return;
      }

      const periodRegex = /^\d{4}-\d{2}$/;
      if (!periodRegex.test(period)) {
        errors.push(`Linha ${lineNum}: Período "${period}" inválido. Use AAAA-MM (Ex: 2026-07).`);
        return;
      }

      validRows.push({
        sector: mappedSector.id,
        indicatorName,
        value,
        period,
        unit,
        target
      });
    });

    setParsedData(validRows);
    setValidationErrors(errors);
  };

  const handleSaveSpreadsheet = async () => {
    if (parsedData.length === 0 || validationErrors.length > 0) return;

    setSaving(true);
    try {
      await dbService.saveIndicatorDataBatch(parsedData, file.name, currentUser.uid);
      showAlert(`Planilha importada! ${parsedData.length} registros inseridos.`, 'success');
      setFile(null);
      setParsedData([]);
      setValidationErrors([]);
      
      const history = await dbService.getUploadsHistory();
      setUploadHistory(history);
    } catch (err) {
      showAlert(err.message || 'Erro ao salvar no Firestore.', 'danger');
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadSample = () => {
    const csvContent = 
      "Setor,Indicador,Valor,Periodo,Unidade,Meta\n" +
      "Enfermagem,Taxa de Infecção por Cateter,1.4,2026-07,%,1.5\n" +
      "Enfermagem,Média de Reuso de Dialisadores,12.5,2026-07,reusos,12\n" +
      "Equipe Médica,Taxa de Internação Hospitalar,8.2,2026-07,%,10.0\n" +
      "Qualidade,Satisfação do Paciente (NPS),88,2026-07,pontos,80";

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "modelo_indicadores_hemodialise.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>Lançamento de Indicadores</h1>
        <p>Insira dados manuais mensais ou suba uma planilha consolidada de indicadores.</p>
      </div>

      {message.text && (
        <div className={`alert alert-${message.type}`} style={{ marginBottom: '1.5rem' }}>
          <span>{message.text}</span>
        </div>
      )}

      {/* Tabs Header */}
      <div style={styles.tabsContainer}>
        <button
          onClick={() => setActiveTab('manual')}
          style={{ ...styles.tabButton, ...(activeTab === 'manual' ? styles.tabButtonActive : {}) }}
        >
          <Keyboard size={18} />
          <span>Digitação Manual</span>
        </button>
        <button
          onClick={() => setActiveTab('spreadsheet')}
          style={{ ...styles.tabButton, ...(activeTab === 'spreadsheet' ? styles.tabButtonActive : {}) }}
        >
          <UploadCloud size={18} />
          <span>Importar Planilha (CSV)</span>
        </button>
      </div>

      <div className="grid grid-cols-3">
        {/* Main interactive area */}
        <div className="card" style={{ gridColumn: 'span 2' }}>
          {activeTab === 'manual' ? (
            /* TAB: Manual Data Entry Form */
            <div>
              <h2 className="card-title">
                <Keyboard size={20} color="var(--primary-color)" />
                Formulário de Digitação
              </h2>
              
              {sectors.length === 0 ? (
                <div className="alert alert-warning" style={{ fontSize: '0.875rem' }}>
                  <span>Nenhum setor autorizado no seu perfil para lançamento manual.</span>
                </div>
              ) : (
                <form onSubmit={handleSaveManual}>
                  {/* Select Sector */}
                  <div className="form-group">
                    <label htmlFor="manual-sector-select">Setor Hospitalar</label>
                    <select
                      id="manual-sector-select"
                      className="form-control"
                      value={manualSector}
                      onChange={(e) => setManualSector(e.target.value)}
                      disabled={saving}
                    >
                      {sectors.map(sec => (
                        <option key={sec.id} value={sec.id}>{sec.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Select Indicator */}
                  <div className="form-group">
                    <label htmlFor="manual-indicator-select">Indicador Clínico</label>
                    {filteredIndicators.length === 0 ? (
                      <div style={styles.noIndicatorsHint}>
                        Nenhum indicador cadastrado para este setor. Crie um no painel administrativo primeiro.
                      </div>
                    ) : (
                      <select
                        id="manual-indicator-select"
                        className="form-control"
                        value={manualIndicator}
                        onChange={(e) => setManualIndicator(e.target.value)}
                        disabled={saving}
                      >
                        {filteredIndicators.map(ind => (
                          <option key={ind.id} value={ind.id}>
                            {ind.name} (Meta: {ind.lowerIsBetter ? '≤' : '≥'} {ind.target}{ind.unit})
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* Value and Period Grid */}
                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label htmlFor="manual-val-input">Valor Medido</label>
                      <input
                        id="manual-val-input"
                        type="text"
                        className="form-control"
                        placeholder="Ex: 1.4 ou 12"
                        value={manualValue}
                        onChange={(e) => setManualValue(e.target.value)}
                        required
                        disabled={saving || filteredIndicators.length === 0}
                      />
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label htmlFor="manual-period-input">Mês/Ano Referência</label>
                      <input
                        id="manual-period-input"
                        type="month"
                        className="form-control"
                        value={manualPeriod}
                        onChange={(e) => setManualPeriod(e.target.value)}
                        required
                        disabled={saving}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ width: '100%', marginTop: '1.25rem' }}
                    disabled={saving || filteredIndicators.length === 0}
                  >
                    <Save size={16} />
                    <span>{saving ? 'Gravando dados...' : 'Salvar Registro no Banco'}</span>
                  </button>
                </form>
              )}
            </div>
          ) : (
            /* TAB: Spreadsheet Import */
            <div>
              <h2 className="card-title">
                <UploadCloud size={20} color="var(--primary-color)" />
                Carregar Planilha CSV
              </h2>

              <div
                style={{
                  ...styles.dropZone,
                  ...(file ? styles.dropZoneActive : {}),
                }}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <FileSpreadsheet size={48} color={file ? 'var(--primary-color)' : 'var(--text-muted)'} />
                {file ? (
                  <div style={styles.fileInfo}>
                    <span style={styles.fileName}>{file.name}</span>
                    <span style={styles.fileSize}>({(file.size / 1024).toFixed(1)} KB)</span>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center' }}>
                    <p style={styles.dropText}>Arraste o CSV de Indicadores aqui ou</p>
                    <label className="btn btn-secondary" style={{ marginTop: '0.5rem', cursor: 'pointer' }}>
                      Procurar Arquivo
                      <input
                        type="file"
                        accept=".csv"
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                      />
                    </label>
                  </div>
                )}
              </div>

              <div style={styles.templateDownloadBox}>
                <div>
                  <p style={{ fontWeight: '600', fontSize: '0.85rem' }}>Baixar Planilha Modelo</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Obtenha o template CSV padrão para preenchimento de múltiplos indicadores de hemodiálise.</p>
                </div>
                <button className="btn btn-secondary" onClick={handleDownloadSample} style={{ padding: '0.5rem 1rem', fontSize: '0.75rem' }}>
                  <Download size={14} />
                  <span>Modelo.csv</span>
                </button>
              </div>

              {validationErrors.length > 0 && (
                <div className="alert alert-danger" style={styles.validationBox}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600' }}>
                    <ShieldAlert size={18} />
                    <span>Inconformidades na Validação:</span>
                  </div>
                  <ul style={styles.errorList}>
                    {validationErrors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              {parsedData.length > 0 && validationErrors.length === 0 && (
                <div style={{ marginTop: '1.5rem' }}>
                  <div style={styles.previewTitle}>
                    <CheckCircle2 size={18} color="var(--success-color)" />
                    <span>Planilha validada ({parsedData.length} registros prontos para gravação)</span>
                  </div>
                  <div className="table-container" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                    <table>
                      <thead>
                        <tr>
                          <th>Setor</th>
                          <th>Indicador</th>
                          <th>Valor</th>
                          <th>Período</th>
                          <th>Meta</th>
                        </tr>
                      </thead>
                      <tbody>
                        {parsedData.map((row, i) => (
                          <tr key={i}>
                            <td style={{ textTransform: 'capitalize' }}>{row.sector}</td>
                            <td>{row.indicatorName}</td>
                            <td><strong>{row.value} {row.unit}</strong></td>
                            <td>{row.period}</td>
                            <td>{row.target} {row.unit}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div style={styles.actionBtns}>
                    <button
                      className="btn btn-secondary"
                      onClick={() => { setFile(null); setParsedData([]); }}
                      disabled={saving}
                    >
                      Cancelar
                    </button>
                    <button
                      className="btn btn-primary"
                      onClick={handleSaveSpreadsheet}
                      disabled={saving}
                    >
                      {saving ? 'Gravando dados...' : 'Gravar Indicadores no Firestore'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar History Log */}
        <div className="card" style={{ gridColumn: 'span 1' }}>
          <h2 className="card-title">
            <History size={20} color="var(--primary-color)" />
            Logs de Auditoria
          </h2>

          <div style={styles.historyList}>
            {uploadHistory.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'center', padding: '1rem 0' }}>
                Nenhum lançamento no histórico.
              </p>
            ) : (
              uploadHistory.map((item) => (
                <div key={item.id} style={styles.historyItem}>
                  <div style={styles.historyFile}>
                    {item.fileName.startsWith('Lançamento Manual') || item.fileName.startsWith('Digitação Manual') ? (
                      <FileText size={16} color="var(--secondary-color)" />
                    ) : (
                      <FileSpreadsheet size={16} color="var(--primary-color)" />
                    )}
                    <span style={styles.historyName}>{item.fileName}</span>
                  </div>
                  <div style={styles.historyMeta}>
                    <span>Alterado: <strong>{item.rowsProcessed} métrica</strong></span>
                    <span>{new Date(item.uploadedAt).toLocaleDateString()} {new Date(item.uploadedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div style={styles.instructions}>
            <p style={styles.instructionsTitle}>💡 Orientações de Lançamento:</p>
            <ul style={styles.instructionsList}>
              <li>Lançamentos manuais registram o log com o nome da métrica atualizada.</li>
              <li>Inserir valores para um mesmo indicador e período (mês) irá sobrescrever o valor anterior.</li>
              <li>Use valores numéricos separados por ponto (Ex: `1.5`).</li>
            </ul>
          </div>
        </div>
      </div>
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
  noIndicatorsHint: {
    padding: '0.875rem',
    backgroundColor: '#fffbeb',
    border: '1px solid #fef3c7',
    color: '#b45309',
    borderRadius: 'var(--border-radius-sm)',
    fontSize: '0.85rem',
  },
  dropZone: {
    border: '2px dashed var(--border-color)',
    borderRadius: 'var(--border-radius-md)',
    backgroundColor: 'var(--bg-color)',
    padding: '2rem 1rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1rem',
    cursor: 'pointer',
    transition: 'all var(--transition-normal)',
  },
  dropZoneActive: {
    borderColor: 'var(--primary-color)',
    backgroundColor: 'var(--primary-light)',
  },
  dropText: {
    fontSize: '0.9rem',
    color: 'var(--text-secondary)',
  },
  fileInfo: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  fileName: {
    fontWeight: '600',
    fontSize: '0.95rem',
    color: 'var(--text-primary)',
  },
  fileSize: {
    fontSize: '0.8rem',
    color: 'var(--text-secondary)',
  },
  templateDownloadBox: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '1rem',
    padding: '0.875rem',
    backgroundColor: 'var(--primary-light)',
    border: '1px solid #c5f2f7',
    borderRadius: 'var(--border-radius-sm)',
  },
  validationBox: {
    marginTop: '1.25rem',
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: '0.5rem',
  },
  errorList: {
    paddingLeft: '1.25rem',
    marginTop: '0.2rem',
    fontSize: '0.8rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.2rem',
  },
  previewTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '0.5rem',
    fontWeight: '600',
    color: 'var(--success-color)',
    fontSize: '0.9rem',
  },
  actionBtns: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.75rem',
    marginTop: '1rem',
  },
  historyList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    marginTop: '0.75rem',
    maxHeight: '300px',
    overflowY: 'auto',
  },
  historyItem: {
    padding: '0.75rem',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--border-radius-sm)',
    backgroundColor: '#fafafa',
  },
  historyFile: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
  },
  historyName: {
    fontSize: '0.825rem',
    fontWeight: '600',
    color: 'var(--text-primary)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  historyMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.7rem',
    color: 'var(--text-secondary)',
    marginTop: '0.375rem',
  },
  instructions: {
    marginTop: '1.5rem',
    paddingTop: '1rem',
    borderTop: '1px solid var(--border-color)',
  },
  instructionsTitle: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: 'var(--text-secondary)',
    marginBottom: '0.5rem',
  },
  instructionsList: {
    paddingLeft: '1.25rem',
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.375rem',
  }
};
