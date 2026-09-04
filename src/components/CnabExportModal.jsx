import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, Download, CheckCircle2, AlertTriangle, Building2, 
  Search, ShieldCheck, Check, Settings, FileText, ChevronDown, ChevronUp, Edit3
} from 'lucide-react';
import { generateSicoobCnab240, downloadCnabFile, convertDigitableLineToBarcode } from '../utils/sicoobCnab240';
import { dbService } from '../firebase';

export default function CnabExportModal({
  onClose,
  payableList = [],
  tenantSettings = {},
  onSaveTenantSettings
}) {
  // Sicoob Account Settings state
  const [showConfig, setShowConfig] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [companyCnpj, setCompanyCnpj] = useState('');
  const [convenio, setConvenio] = useState('');
  const [agency, setAgency] = useState('');
  const [agencyDv, setAgencyDv] = useState('');
  const [account, setAccount] = useState('');
  const [accountDv, setAccountDv] = useState('');
  const [agAccountDv, setAgAccountDv] = useState('0');
  const [nsa, setNsa] = useState(1);
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [configSavedToast, setConfigSavedToast] = useState(false);

  // Filters & Selection
  const [searchTerm, setSearchTerm] = useState('');
  const [onlyWithBarcode, setOnlyWithBarcode] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [editingBarcodeId, setEditingBarcodeId] = useState(null);
  const [tempBarcodeValue, setTempBarcodeValue] = useState('');
  const [localPayableList, setLocalPayableList] = useState([]);
  const [exportError, setExportError] = useState('');
  const [exportSuccess, setExportSuccess] = useState(null);

  // Initialize data
  useEffect(() => {
    // Load config from tenantSettings or localStorage
    const savedLocal = (() => {
      try {
        return JSON.parse(localStorage.getItem('sicoob_cnab_config') || '{}');
      } catch {
        return {};
      }
    })();

    const cnabCfg = tenantSettings?.sicoobCnab || savedLocal;

    setCompanyName(cnabCfg.companyName || tenantSettings?.name || 'Nexa Clínica');
    setCompanyCnpj(cnabCfg.companyCnpj || tenantSettings?.cnpj || '');
    setConvenio(cnabCfg.convenio || '');
    setAgency(cnabCfg.agency || '');
    setAgencyDv(cnabCfg.agencyDv || '');
    setAccount(cnabCfg.account || '');
    setAccountDv(cnabCfg.accountDv || '');
    setAgAccountDv(cnabCfg.agAccountDv || '0');
    setNsa(Number(cnabCfg.lastNsa || 1));

    // If never configured, open configuration by default
    if (!cnabCfg.convenio || !cnabCfg.account) {
      setShowConfig(true);
    }
  }, [tenantSettings]);

  // Sync local payable list with only unpaid titles
  useEffect(() => {
    const pending = (payableList || []).filter(p => {
      const isPaid = p.status === 'Pago' || p.status === 'PAGO' || p.status === 'pago';
      return !isPaid;
    });
    setLocalPayableList(pending);

    // Auto-select items that already have a digitable line or barcode
    const preSelected = new Set();
    pending.forEach(p => {
      if (p.digitableLine || p.codigoBarras) {
        preSelected.add(p.id);
      }
    });
    setSelectedIds(preSelected);
  }, [payableList]);

  // Save Sicoob config
  const handleSaveConfig = async () => {
    setIsSavingConfig(true);
    const updated = {
      companyName,
      companyCnpj,
      convenio,
      agency,
      agencyDv,
      account,
      accountDv,
      agAccountDv,
      lastNsa: nsa
    };

    try {
      localStorage.setItem('sicoob_cnab_config', JSON.stringify(updated));
      if (dbService?.saveTenantSettings) {
        await dbService.saveTenantSettings({
          ...tenantSettings,
          sicoobCnab: updated
        });
      }
      if (onSaveTenantSettings) {
        onSaveTenantSettings({ ...tenantSettings, sicoobCnab: updated });
      }
      setConfigSavedToast(true);
      setTimeout(() => setConfigSavedToast(false), 3000);
      setShowConfig(false);
    } catch (e) {
      console.error('Erro ao salvar configuração CNAB:', e);
    } finally {
      setIsSavingConfig(false);
    }
  };

  // Toggle selection
  const handleToggleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Select all or deselect all
  const handleSelectAll = (filtered) => {
    const allFilteredIds = filtered.map(item => item.id);
    const isAllSelected = allFilteredIds.every(id => selectedIds.has(id));
    if (isAllSelected) {
      setSelectedIds(prev => {
        const next = new Set(prev);
        allFilteredIds.forEach(id => next.delete(id));
        return next;
      });
    } else {
      setSelectedIds(prev => {
        const next = new Set(prev);
        allFilteredIds.forEach(id => next.add(id));
        return next;
      });
    }
  };

  // Inline update barcode
  const handleSaveTempBarcode = async (item) => {
    const cleaned = tempBarcodeValue.replace(/\D/g, '');
    const updatedList = localPayableList.map(p => {
      if (p.id === item.id) {
        return { ...p, digitableLine: cleaned };
      }
      return p;
    });
    setLocalPayableList(updatedList);
    setEditingBarcodeId(null);
    setTempBarcodeValue('');

    // If Firestore service is available, persist the barcode in accounts_payable
    try {
      if (dbService?.saveAccountsPayable) {
        await dbService.saveAccountsPayable({
          ...item,
          digitableLine: cleaned
        });
      }
    } catch (err) {
      console.warn('Erro ao atualizar linha digitável no banco:', err);
    }
  };

  // Filtered titles
  const filteredPayables = useMemo(() => {
    return localPayableList.filter(p => {
      const line = (p.digitableLine || p.codigoBarras || '').trim();
      if (onlyWithBarcode && !line) return false;

      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      const sup = String(p.supplier || '').toLowerCase();
      const nf = String(p.invoiceNumber || '').toLowerCase();
      return sup.includes(term) || nf.includes(term) || line.includes(term);
    });
  }, [localPayableList, onlyWithBarcode, searchTerm]);

  // Selected totals
  const selectedItems = useMemo(() => {
    return localPayableList.filter(p => selectedIds.has(p.id));
  }, [localPayableList, selectedIds]);

  const totalAmountSelected = useMemo(() => {
    return selectedItems.reduce((acc, p) => acc + (parseFloat(p.amount) || 0), 0);
  }, [selectedItems]);

  // Execute Export
  const handleExportRemessa = async () => {
    setExportError('');
    setExportSuccess(null);

    if (selectedItems.length === 0) {
      setExportError('Selecione pelo menos um título para gerar a remessa.');
      return;
    }

    if (!convenio || !agency || !account) {
      setShowConfig(true);
      setExportError('Preencha os dados bancários do Sicoob (Convênio, Agência e Conta).');
      return;
    }

    // Validate barcodes
    const invalidItems = selectedItems.filter(p => {
      const line = p.digitableLine || p.codigoBarras || '';
      const barcode = convertDigitableLineToBarcode(line);
      return barcode.length !== 44;
    });

    if (invalidItems.length > 0) {
      setExportError(`Existem ${invalidItems.length} título(s) selecionado(s) sem código de barras válido de 44 dígitos.`);
      return;
    }

    try {
      const result = generateSicoobCnab240({
        company: {
          name: companyName,
          cnpj: companyCnpj,
          address: tenantSettings?.address || '',
          addressNumber: tenantSettings?.addressNumber || '',
          city: tenantSettings?.city || '',
          cep: tenantSettings?.cep || '',
          state: tenantSettings?.state || 'MG'
        },
        bankAccount: {
          convenio: convenio,
          agency: agency,
          agencyDv: agencyDv,
          account: account,
          accountDv: accountDv,
          agAccountDv: agAccountDv
        },
        payments: selectedItems.map(p => ({
          digitableLine: p.digitableLine || p.codigoBarras,
          amount: parseFloat(p.amount) || 0,
          dueDate: p.dueDate,
          paymentDate: p.paymentDate || p.dueDate,
          supplier: p.supplier || 'FORNECEDOR',
          cnpj: p.cnpj || p.supplierCnpj || '',
          invoiceNumber: p.invoiceNumber || ''
        })),
        fileSequence: nsa,
        generationDate: new Date()
      });

      // Download file in browser
      downloadCnabFile(result.cnabContent, result.fileName);

      // Increment NSA and save
      const nextNsa = nsa + 1;
      setNsa(nextNsa);
      const updatedConfig = {
        companyName,
        companyCnpj,
        convenio,
        agency,
        agencyDv,
        account,
        accountDv,
        agAccountDv,
        lastNsa: nextNsa
      };
      localStorage.setItem('sicoob_cnab_config', JSON.stringify(updatedConfig));
      if (dbService?.saveTenantSettings) {
        dbService.saveTenantSettings({
          ...tenantSettings,
          sicoobCnab: updatedConfig
        }).catch(e => console.warn('Erro ao salvar NSA no Firestore:', e));
      }

      setExportSuccess({
        fileName: result.fileName,
        totalTitles: result.totalTitles,
        totalAmount: result.totalAmount
      });
    } catch (err) {
      console.error('Erro na exportação CNAB 240:', err);
      setExportError(err.message || 'Erro ao gerar arquivo de remessa.');
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '1rem'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '960px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        overflow: 'hidden'
      }}>
        {/* Header Modal */}
        <div style={{
          padding: '1rem 1.5rem',
          borderBottom: '1px solid #e2e8f0',
          backgroundColor: '#f8fafc',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: '#0284c7',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '700',
              fontSize: '1rem'
            }}>
              756
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', color: '#0f172a' }}>
                  Remessa
                </h3>
                <span style={{
                  fontSize: '0.7rem',
                  fontWeight: '700',
                  padding: '0.15rem 0.45rem',
                  borderRadius: '4px',
                  backgroundColor: '#e0f2fe',
                  color: '#0369a1',
                  border: '1px solid #bae6fd'
                }}>
                  SICOOB CNAB 240
                </span>
              </div>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                Pagamento de títulos e boletos bancários via Internet Banking
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => setShowConfig(!showConfig)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.4rem 0.75rem',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                backgroundColor: showConfig ? '#f1f5f9' : '#ffffff',
                color: '#334155',
                fontSize: '0.8rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              <Settings size={14} />
              <span>Configuração</span>
              {showConfig ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: '0.4rem',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Configuration Section (Collapsible) */}
        {showConfig && (
          <div style={{
            padding: '1.25rem 1.5rem',
            backgroundColor: '#f1f5f9',
            borderBottom: '1px solid #e2e8f0'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <strong style={{ fontSize: '0.85rem', color: '#1e293b' }}>
                Parâmetros Bancários Sicoob (Banco 756)
              </strong>
              {configSavedToast && (
                <span style={{ fontSize: '0.75rem', color: '#166534', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <CheckCircle2 size={14} /> Salvo com sucesso!
                </span>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem' }}>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', marginBottom: '0.2rem' }}>
                  Empresa
                </label>
                <input
                  type="text"
                  className="form-control"
                  style={{ padding: '0.35rem 0.5rem', fontSize: '0.85rem' }}
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                  placeholder="Razão Social"
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', marginBottom: '0.2rem' }}>
                  CNPJ
                </label>
                <input
                  type="text"
                  className="form-control"
                  style={{ padding: '0.35rem 0.5rem', fontSize: '0.85rem' }}
                  value={companyCnpj}
                  onChange={e => setCompanyCnpj(e.target.value)}
                  placeholder="00.000.000/0001-00"
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', marginBottom: '0.2rem' }}>
                  Convênio
                </label>
                <input
                  type="text"
                  className="form-control"
                  style={{ padding: '0.35rem 0.5rem', fontSize: '0.85rem' }}
                  value={convenio}
                  onChange={e => setConvenio(e.target.value)}
                  placeholder="Ex: 1234567"
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', marginBottom: '0.2rem' }}>
                  Agência
                </label>
                <input
                  type="text"
                  className="form-control"
                  style={{ padding: '0.35rem 0.5rem', fontSize: '0.85rem' }}
                  value={agency}
                  onChange={e => setAgency(e.target.value)}
                  placeholder="4 dígitos"
                  maxLength={4}
                />
              </div>
              <div style={{ width: '60px' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', marginBottom: '0.2rem' }}>
                  DV
                </label>
                <input
                  type="text"
                  className="form-control"
                  style={{ padding: '0.35rem 0.5rem', fontSize: '0.85rem' }}
                  value={agencyDv}
                  onChange={e => setAgencyDv(e.target.value)}
                  placeholder="0"
                  maxLength={1}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', marginBottom: '0.2rem' }}>
                  Conta
                </label>
                <input
                  type="text"
                  className="form-control"
                  style={{ padding: '0.35rem 0.5rem', fontSize: '0.85rem' }}
                  value={account}
                  onChange={e => setAccount(e.target.value)}
                  placeholder="Número da conta"
                />
              </div>
              <div style={{ width: '60px' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', marginBottom: '0.2rem' }}>
                  DV
                </label>
                <input
                  type="text"
                  className="form-control"
                  style={{ padding: '0.35rem 0.5rem', fontSize: '0.85rem' }}
                  value={accountDv}
                  onChange={e => setAccountDv(e.target.value)}
                  placeholder="0"
                  maxLength={1}
                />
              </div>
              <div style={{ width: '90px' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', marginBottom: '0.2rem' }}>
                  Sequencial
                </label>
                <input
                  type="number"
                  className="form-control"
                  style={{ padding: '0.35rem 0.5rem', fontSize: '0.85rem' }}
                  value={nsa}
                  onChange={e => setNsa(Math.max(1, parseInt(e.target.value) || 1))}
                  placeholder="1"
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.75rem' }}>
              <button
                type="button"
                onClick={handleSaveConfig}
                disabled={isSavingConfig}
                style={{
                  padding: '0.35rem 0.85rem',
                  borderRadius: '6px',
                  backgroundColor: '#0284c7',
                  color: '#ffffff',
                  fontSize: '0.8rem',
                  fontWeight: '700',
                  border: 'none',
                  cursor: isSavingConfig ? 'not-allowed' : 'pointer'
                }}
              >
                {isSavingConfig ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        )}

        {/* Feedback Alerts */}
        {exportError && (
          <div style={{
            margin: '0.75rem 1.5rem 0 1.5rem',
            padding: '0.65rem 1rem',
            borderRadius: '6px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#991b1b',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <AlertTriangle size={16} />
            <span>{exportError}</span>
          </div>
        )}

        {exportSuccess && (
          <div style={{
            margin: '0.75rem 1.5rem 0 1.5rem',
            padding: '0.65rem 1rem',
            borderRadius: '6px',
            backgroundColor: '#f0fdf4',
            border: '1px solid #bbf7d0',
            color: '#166534',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.5rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle2 size={16} color="#166534" />
              <span>
                Arquivo <strong>{exportSuccess.fileName}</strong> gerado com sucesso ({exportSuccess.totalTitles} títulos | R$ {exportSuccess.totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })})!
              </span>
            </div>
            <button
              type="button"
              onClick={() => setExportSuccess(null)}
              style={{ background: 'none', border: 'none', color: '#166534', cursor: 'pointer' }}
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Filters Bar */}
        <div style={{
          padding: '0.75rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          flexWrap: 'wrap',
          borderBottom: '1px solid #f1f5f9'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: '240px' }}>
            <div style={{ position: 'relative', width: '100%' }}>
              <Search size={14} color="#94a3b8" style={{ position: 'absolute', left: '0.65rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                className="form-control"
                style={{ paddingLeft: '2rem', paddingRight: '0.5rem', fontSize: '0.85rem', height: '32px' }}
                placeholder="Buscar fornecedor ou nota..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: '#475569', cursor: 'pointer', userSelect: 'none' }}>
              <input
                type="checkbox"
                checked={onlyWithBarcode}
                onChange={e => setOnlyWithBarcode(e.target.checked)}
              />
              <span>Com código</span>
            </label>

            <button
              type="button"
              onClick={() => handleSelectAll(filteredPayables)}
              style={{
                padding: '0.25rem 0.65rem',
                borderRadius: '4px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                fontSize: '0.75rem',
                fontWeight: '600',
                color: '#334155',
                cursor: 'pointer'
              }}
            >
              {filteredPayables.every(p => selectedIds.has(p.id)) && filteredPayables.length > 0 ? 'Desmarcar' : 'Todos'}
            </button>
          </div>
        </div>

        {/* Titles Table */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '0.5rem 1.5rem',
          maxHeight: '400px'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead style={{ position: 'sticky', top: 0, backgroundColor: '#ffffff', borderBottom: '2px solid #e2e8f0', zIndex: 5 }}>
              <tr>
                <th style={{ padding: '0.5rem 0.5rem', width: '36px', textAlign: 'center' }}>
                  <input
                    type="checkbox"
                    checked={filteredPayables.length > 0 && filteredPayables.every(p => selectedIds.has(p.id))}
                    onChange={() => handleSelectAll(filteredPayables)}
                  />
                </th>
                <th style={{ padding: '0.5rem 0.75rem', textAlign: 'left' }}>Fornecedor</th>
                <th style={{ padding: '0.5rem 0.75rem', textAlign: 'left', width: '110px' }}>Nota</th>
                <th style={{ padding: '0.5rem 0.75rem', textAlign: 'left', width: '110px' }}>Vencimento</th>
                <th style={{ padding: '0.5rem 0.75rem', textAlign: 'right', width: '120px' }}>Valor</th>
                <th style={{ padding: '0.5rem 0.75rem', textAlign: 'left' }}>Código</th>
                <th style={{ padding: '0.5rem 0.75rem', textAlign: 'center', width: '80px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayables.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                    Nenhum título pendente encontrado para os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredPayables.map(item => {
                  const isSelected = selectedIds.has(item.id);
                  const rawLine = (item.digitableLine || item.codigoBarras || '').trim();
                  const barcode = convertDigitableLineToBarcode(rawLine);
                  const isValidBarcode = barcode.length === 44;
                  const amt = parseFloat(item.amount) || 0;

                  return (
                    <tr
                      key={item.id}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        backgroundColor: isSelected ? '#f0f9ff' : 'transparent',
                        transition: 'background-color 0.15s'
                      }}
                    >
                      <td style={{ padding: '0.5rem 0.5rem', textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(item.id)}
                        />
                      </td>
                      <td style={{ padding: '0.5rem 0.75rem' }}>
                        <strong style={{ display: 'block', color: '#0f172a' }}>
                          {item.supplier}
                        </strong>
                        {item.description && (
                          <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                            {item.description}
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '0.5rem 0.75rem', whiteSpace: 'nowrap', color: '#334155' }}>
                        {item.invoiceNumber ? `NF ${item.invoiceNumber}` : '-'}
                      </td>
                      <td style={{ padding: '0.5rem 0.75rem', whiteSpace: 'nowrap', color: '#334155' }}>
                        {item.dueDate ? item.dueDate.split('-').reverse().join('/') : '-'}
                      </td>
                      <td style={{ padding: '0.5rem 0.75rem', textAlign: 'right', fontWeight: '700', color: '#0284c7', whiteSpace: 'nowrap' }}>
                        R$ {amt.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td style={{ padding: '0.5rem 0.75rem' }}>
                        {editingBarcodeId === item.id ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <input
                              type="text"
                              className="form-control"
                              style={{ padding: '0.2rem 0.4rem', fontSize: '0.75rem', fontFamily: 'monospace' }}
                              value={tempBarcodeValue}
                              onChange={e => setTempBarcodeValue(e.target.value)}
                              placeholder="Cole o código"
                              autoFocus
                            />
                            <button
                              type="button"
                              onClick={() => handleSaveTempBarcode(item)}
                              style={{ padding: '0.2rem 0.4rem', borderRadius: '4px', backgroundColor: '#16a34a', color: '#fff', border: 'none', cursor: 'pointer' }}
                              title="Salvar"
                            >
                              <Check size={12} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingBarcodeId(null)}
                              style={{ padding: '0.2rem 0.4rem', borderRadius: '4px', backgroundColor: '#94a3b8', color: '#fff', border: 'none', cursor: 'pointer' }}
                              title="Cancelar"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            {rawLine ? (
                              <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#334155' }} title={rawLine}>
                                {rawLine.length > 25 ? `${rawLine.substring(0, 22)}...` : rawLine}
                              </span>
                            ) : (
                              <span style={{ fontSize: '0.75rem', color: '#dc2626', fontStyle: 'italic' }}>
                                Sem código
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                setEditingBarcodeId(item.id);
                                setTempBarcodeValue(rawLine);
                              }}
                              style={{ background: 'none', border: 'none', color: '#0284c7', cursor: 'pointer', padding: '0.1rem' }}
                              title="Editar código"
                            >
                              <Edit3 size={12} />
                            </button>
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '0.5rem 0.75rem', textAlign: 'center' }}>
                        {isValidBarcode ? (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '2px',
                            fontSize: '0.7rem',
                            fontWeight: '700',
                            padding: '0.1rem 0.35rem',
                            borderRadius: '4px',
                            backgroundColor: '#dcfce7',
                            color: '#166534'
                          }}>
                            <CheckCircle2 size={11} /> Pronto
                          </span>
                        ) : (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '2px',
                            fontSize: '0.7rem',
                            fontWeight: '700',
                            padding: '0.1rem 0.35rem',
                            borderRadius: '4px',
                            backgroundColor: '#fee2e2',
                            color: '#991b1b'
                          }}>
                            Pendente
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer & Totalizer */}
        <div style={{
          padding: '1rem 1.5rem',
          backgroundColor: '#f8fafc',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'block' }}>
              Selecionados: <strong>{selectedItems.length} título(s)</strong>
            </span>
            <span style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a' }}>
              Total: R$ {totalAmountSelected.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                color: '#475569',
                fontSize: '0.85rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleExportRemessa}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.5rem 1.25rem',
                borderRadius: '6px',
                backgroundColor: '#0284c7',
                color: '#ffffff',
                fontSize: '0.85rem',
                fontWeight: '700',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
              }}
            >
              <Download size={16} />
              <span>Exportar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
