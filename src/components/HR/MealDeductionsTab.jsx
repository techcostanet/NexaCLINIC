import React, { useState, useEffect, useMemo } from 'react';
import {
  Utensils,
  Search,
  Calendar,
  Download,
  RefreshCw,
  Eye,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Plus,
  Printer,
  Settings,
  Ticket,
  XCircle
} from 'lucide-react';
import {
  getMonthlyMealSummary,
  resetEmployeeMealPassword,
  getTodayDateStr,
  getMealSettings,
  updateMealSettings,
  getMealPackages,
  createMealPackage,
  cancelMealPackage,
  MEAL_PACKAGE_SIZES
} from '../../services/firebase/mealService';
import { getEmployees } from '../../services/firebase/hrService';
import { formatCurrency, formatDateBR } from '../../services/firebase/foodWasteService';
import SearchableEmployeeSelect from './SearchableEmployeeSelect';

export default function MealDeductionsTab({ employees: propEmployees = [], currentUser = null }) {
  const currentMonth = getTodayDateStr().slice(0, 7);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [subTab, setSubTab] = useState('pacotes'); // 'pacotes' | 'fechamento'
  const [summaryData, setSummaryData] = useState([]);
  const [packagesData, setPackagesData] = useState([]);
  const [employeesList, setEmployeesList] = useState(propEmployees || []);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal de Detalhes
  const [selectedEmployeeOrders, setSelectedEmployeeOrders] = useState(null);

  // Modal de Liberação de Pacote
  const [showPackageModal, setShowPackageModal] = useState(false);
  const [pkgEmployeeId, setPkgEmployeeId] = useState('');
  const [pkgQuantity, setPkgQuantity] = useState(22);
  const [pkgMonth, setPkgMonth] = useState(currentMonth);
  const [pkgNotes, setPkgNotes] = useState('');
  const [savingPkg, setSavingPkg] = useState(false);

  // Modal de Configuração de Valores
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [configForm, setConfigForm] = useState({
    packageMealPrice: 2.00,
    requirePackage: true
  });
  const [savingConfig, setSavingConfig] = useState(false);

  // Estado de Reset de Senha / Toast
  const [resettingId, setResettingId] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);

  useEffect(() => {
    if (propEmployees && propEmployees.length > 0) {
      setEmployeesList(propEmployees);
    } else {
      getEmployees().then(list => setEmployeesList(list || [])).catch(() => {});
    }
  }, [propEmployees]);

  const activeEmployees = useMemo(() => {
    return (employeesList || [])
      .filter(e => e.status !== 'Inativo' && e.status !== 'inactive')
      .sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }, [employeesList]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [summary, pkgs, sets] = await Promise.all([
        getMonthlyMealSummary(selectedMonth),
        getMealPackages(selectedMonth),
        getMealSettings()
      ]);
      setSummaryData(summary);
      setPackagesData(pkgs);
      setSettings(sets);
      setConfigForm({
        packageMealPrice: Number(sets?.packageMealPrice ?? 2.00),
        requirePackage: sets?.requirePackage !== false
      });
    } catch (err) {
      console.error('Erro ao buscar dados de marmitas no RH:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    setPkgMonth(selectedMonth);
  }, [selectedMonth]);

  const unitPrice = Number(settings?.packageMealPrice ?? 2.00);

  // Estatísticas globais do mês
  const stats = useMemo(() => {
    const activePkgs = packagesData.filter(p => p.status !== 'cancelado');
    const totalPackages = activePkgs.length;
    const totalMealsBought = activePkgs.reduce((sum, p) => sum + (Number(p.quantity) || 0), 0);
    const totalMarmitas = summaryData.reduce((sum, d) => sum + d.totalOrders, 0);
    const totalDiscount = summaryData.reduce((sum, d) => sum + d.totalDiscount, 0);

    return {
      pacotes: totalPackages,
      creditos: totalMealsBought,
      marmitas: totalMarmitas,
      desconto: totalDiscount
    };
  }, [summaryData, packagesData]);

  // Filtro de pacotes
  const filteredPackages = useMemo(() => {
    if (!search) return packagesData;
    const q = search.toLowerCase();
    return packagesData.filter(p => {
      const name = (p.employeeName || '').toLowerCase();
      const cpf = (p.employeeCpf || '').replace(/\D/g, '');
      const sector = (p.sector || '').toLowerCase();
      return name.includes(q) || cpf.includes(q.replace(/\D/g, '')) || sector.includes(q);
    });
  }, [packagesData, search]);

  // Filtro de colaboradores no fechamento
  const filteredList = useMemo(() => {
    if (!search) return summaryData;
    const q = search.toLowerCase();
    return summaryData.filter(d => {
      const name = (d.employeeName || '').toLowerCase();
      const cpf = (d.employeeCpf || '').replace(/\D/g, '');
      const sector = (d.sector || '').toLowerCase();
      return name.includes(q) || cpf.includes(q.replace(/\D/g, '')) || sector.includes(q);
    });
  }, [summaryData, search]);

  // Impressão do Termo de Autorização de Desconto em Folha (Contabilidade)
  const printPackageTerm = (pkg) => {
    const win = window.open('', '_blank', 'width=820,height=900');
    if (!win) {
      setToastMsg({ type: 'error', text: 'Permita pop-ups no navegador para imprimir o termo de assinatura.' });
      return;
    }

    const refParts = String(pkg.referenceMonth || selectedMonth).split('-');
    const refFormatted = refParts.length === 2 ? `${refParts[1]}/${refParts[0]}` : pkg.referenceMonth;
    const issuedDate = pkg.createdAt ? new Date(pkg.createdAt).toLocaleString('pt-BR') : new Date().toLocaleString('pt-BR');

    win.document.write(`
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8" />
        <title>Termo de Vale Refeição - ${pkg.employeeName}</title>
        <style>
          @page { size: A4; margin: 18mm; }
          body { font-family: 'Segoe UI', Arial, sans-serif; color: #0f172a; margin: 0; padding: 20px; line-height: 1.5; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #0284c7; padding-bottom: 12px; margin-bottom: 20px; }
          .brand { font-size: 20px; font-weight: 800; color: #0f172a; }
          .brand span { color: #0284c7; }
          .doc-title { font-size: 16px; font-weight: 700; text-transform: uppercase; text-align: center; background: #f1f5f9; padding: 10px; border-radius: 6px; margin-bottom: 20px; letter-spacing: 0.03em; }
          .box { border: 1px solid #cbd5e1; border-radius: 8px; padding: 14px 18px; margin-bottom: 18px; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px 20px; font-size: 13px; }
          .field-label { font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700; display: block; }
          .field-val { font-size: 14px; font-weight: 600; color: #0f172a; }
          .highlight-box { background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 14px 18px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
          .declaration { font-size: 13px; text-align: justify; margin-bottom: 42px; color: #1e293b; }
          .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 50px; }
          .sig-line { border-top: 1px solid #334155; padding-top: 6px; text-align: center; font-size: 12px; color: #334155; }
          .footer { margin-top: 36px; font-size: 11px; color: #64748b; border-top: 1px dashed #cbd5e1; padding-top: 8px; display: flex; justify-content: space-between; }
          .cut-line { border-top: 1px dashed #94a3b8; margin: 32px 0; text-align: center; font-size: 10px; color: #94a3b8; }
          @media print { .no-print { display: none; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="brand">Nex-Ai <span>CLINIC</span></div>
          <div style="font-size: 12px; color: #475569; text-align: right;">
            <strong>Recursos Humanos & Contabilidade</strong><br/>
            Protocolo: ${pkg.id}
          </div>
        </div>

        <div class="doc-title">Termo de Liberação de Pacote de Vale Refeição e Autorização de Desconto em Folha</div>

        <div class="box">
          <div class="grid">
            <div>
              <span class="field-label">Colaborador</span>
              <span class="field-val">${pkg.employeeName}</span>
            </div>
            <div>
              <span class="field-label">CPF</span>
              <span class="field-val">${pkg.employeeCpf || 'Não informado'}</span>
            </div>
            <div>
              <span class="field-label">Setor</span>
              <span class="field-val">${pkg.sector || 'Geral'}</span>
            </div>
            <div>
              <span class="field-label">Competência (Folha)</span>
              <span class="field-val">${refFormatted}</span>
            </div>
          </div>
        </div>

        <div class="highlight-box">
          <div>
            <span class="field-label">Pacote Adquirido</span>
            <span style="font-size: 18px; font-weight: 800; color: #0284c7;">${pkg.quantity} Refeições (Almoço)</span>
          </div>
          <div>
            <span class="field-label">Valor Unitário</span>
            <span class="field-val">${formatCurrency(pkg.unitPrice)}</span>
          </div>
          <div style="text-align: right;">
            <span class="field-label">Total a Descontar em Folha</span>
            <span style="font-size: 20px; font-weight: 800; color: #dc2626;">${formatCurrency(pkg.totalValue)}</span>
          </div>
        </div>

        <div class="declaration">
          Declaro para os devidos fins contábeis e trabalhistas que recebi a liberação do pacote com <strong>${pkg.quantity} (refeições)</strong> no sistema de marmitas da clínica, pelo valor unitário subsidiado de <strong>${formatCurrency(pkg.unitPrice)}</strong> por refeição, totalizando <strong>${formatCurrency(pkg.totalValue)}</strong>. Autorizo expressamente o desconto integral deste valor na minha folha de pagamento referente à competência <strong>${refFormatted}</strong>, estando ciente de que a utilização das refeições deve ser solicitada diariamente através do Portal do Colaborador dentro dos horários limite estabelecidos.
          ${pkg.notes ? `<br/><br/><strong>Observação:</strong> ${pkg.notes}` : ''}
        </div>

        <div style="font-size: 13px; margin-bottom: 12px;">
          Emitido em: ${issuedDate} &nbsp;|&nbsp; Liberado por: ${pkg.createdBy || 'RH'}
        </div>

        <div class="signatures">
          <div class="sig-line">
            <strong>${pkg.employeeName}</strong><br/>
            CPF: ${pkg.employeeCpf || '___.___.___-__'}<br/>
            Assinatura do Colaborador
          </div>
          <div class="sig-line">
            <strong>Recursos Humanos</strong><br/>
            Responsável pela Liberação<br/>
            Assinatura / Carimbo
          </div>
        </div>

        <div class="footer">
          <span>Via Contabilidade / RH — Arquivar junto ao fechamento da folha</span>
          <span>Nex-Ai CLINIC • Gestão de Benefícios</span>
        </div>

        <script>
          window.onload = function() { window.print(); };
        </script>
      </body>
      </html>
    `);
    win.document.close();
  };

  // Liberar novo pacote
  const handleCreatePackage = async (e) => {
    e.preventDefault();
    const emp = activeEmployees.find(item => item.id === pkgEmployeeId);
    if (!emp) {
      setToastMsg({ type: 'error', text: 'Selecione um colaborador para liberar o pacote.' });
      return;
    }

    setSavingPkg(true);
    try {
      const created = await createMealPackage({
        employee: emp,
        quantity: pkgQuantity,
        referenceMonth: pkgMonth,
        createdBy: currentUser?.name || currentUser?.email || 'RH',
        notes: pkgNotes
      });

      setShowPackageModal(false);
      setPkgEmployeeId('');
      setPkgNotes('');
      setToastMsg({
        type: 'success',
        text: `Pacote de ${created.quantity} refeições (${formatCurrency(created.totalValue)}) liberado para ${created.employeeName}!`
      });
      await loadData();
      printPackageTerm(created);
    } catch (err) {
      setToastMsg({ type: 'error', text: err.message || 'Erro ao liberar pacote.' });
    } finally {
      setSavingPkg(false);
    }
  };

  // Cancelar pacote (apenas sem uso)
  const handleCancelPackage = async (pkg) => {
    if (!window.confirm(`Deseja cancelar o pacote de ${pkg.quantity} refeições de ${pkg.employeeName}?`)) {
      return;
    }
    try {
      await cancelMealPackage(pkg.id);
      setToastMsg({ type: 'success', text: `Pacote de ${pkg.employeeName} cancelado.` });
      await loadData();
    } catch (err) {
      setToastMsg({ type: 'error', text: err.message || 'Não foi possível cancelar o pacote.' });
    }
  };

  // Salvar configuração do valor unitário
  const handleSaveConfig = async (e) => {
    e.preventDefault();
    setSavingConfig(true);
    try {
      const updated = await updateMealSettings({
        packageMealPrice: Number(configForm.packageMealPrice) || 0,
        requirePackage: Boolean(configForm.requirePackage)
      });
      setSettings(updated);
      setShowConfigModal(false);
      setToastMsg({
        type: 'success',
        text: `Valor unitário atualizado para ${formatCurrency(updated.packageMealPrice)}.`
      });
    } catch (err) {
      setToastMsg({ type: 'error', text: 'Erro ao salvar configuração: ' + err.message });
    } finally {
      setSavingConfig(false);
    }
  };

  // Ação de Reset de Senha pelo RH
  const handleResetPassword = async (emp) => {
    if (!window.confirm(`Deseja resetar a senha de marmitas do colaborador ${emp.employeeName}? A nova senha voltará a ser os 4 primeiros dígitos do CPF.`)) {
      return;
    }

    setResettingId(emp.employeeId);
    try {
      await resetEmployeeMealPassword(emp.employeeId);
      setToastMsg({ type: 'success', text: `Senha de ${emp.employeeName} resetada com sucesso para o padrão do CPF.` });
    } catch (err) {
      setToastMsg({ type: 'error', text: 'Erro ao resetar senha: ' + err.message });
    } finally {
      setResettingId(null);
    }
  };

  // Exportar relatório em CSV para folha
  const handleExportCsv = () => {
    if (summaryData.length === 0) return;
    const headers = ['Colaborador', 'CPF', 'Setor', 'Pacotes', 'Creditos', 'Consumo', 'Desconto'];
    const rows = summaryData.map(d => [
      `"${d.employeeName}"`,
      `"${d.employeeCpf}"`,
      `"${d.sector}"`,
      d.totalPackages || 0,
      d.packageMealsBought || 0,
      d.totalOrders,
      d.totalDiscount.toFixed(2)
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `desconto_marmitas_rh_${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={styles.container}>
      {toastMsg && (
        <div style={{
          ...styles.toast,
          backgroundColor: toastMsg.type === 'success' ? '#dcfce7' : '#fee2e2',
          color: toastMsg.type === 'success' ? '#166534' : '#991b1b',
          borderColor: toastMsg.type === 'success' ? '#86efac' : '#fca5a5'
        }}>
          {toastMsg.type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
          <span style={{ flex: 1, fontSize: '0.85rem' }}>{toastMsg.text}</span>
          <button onClick={() => setToastMsg(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>×</button>
        </div>
      )}

      {/* BARRA SUPERIOR DE CONTROLES */}
      <div style={styles.topBar}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={styles.monthSelector}>
            <Calendar size={18} color="#0284c7" />
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              style={styles.monthInput}
            />
          </div>

          <div style={styles.subTabSwitch}>
            <button
              type="button"
              onClick={() => setSubTab('pacotes')}
              style={{
                ...styles.subTabBtn,
                backgroundColor: subTab === 'pacotes' ? '#0284c7' : 'transparent',
                color: subTab === 'pacotes' ? '#ffffff' : '#475569'
              }}
            >
              <Ticket size={14} />
              Pacotes
            </button>
            <button
              type="button"
              onClick={() => setSubTab('fechamento')}
              style={{
                ...styles.subTabBtn,
                backgroundColor: subTab === 'fechamento' ? '#0284c7' : 'transparent',
                color: subTab === 'fechamento' ? '#ffffff' : '#475569'
              }}
            >
              <Utensils size={14} />
              Fechamento
            </button>
          </div>
        </div>

        <div style={styles.topActions}>
          <button
            onClick={() => setShowPackageModal(true)}
            style={styles.actionBtnSuccess}
            title="Liberar pacote de vale refeição para colaborador"
          >
            <Plus size={15} />
            Liberar
          </button>

          <button
            onClick={() => setShowConfigModal(true)}
            style={styles.actionBtnOutline}
            title="Configurar valor unitário da refeição"
          >
            <Settings size={15} />
            Configuração
          </button>

          <button
            onClick={loadData}
            style={styles.actionBtnOutline}
            title="Atualizar dados"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            Atualizar
          </button>

          <button
            onClick={handleExportCsv}
            disabled={summaryData.length === 0}
            style={styles.actionBtnPrimary}
            title="Exportar planilha para folha de pagamento"
          >
            <Download size={15} />
            Exportar
          </button>
        </div>
      </div>

      {/* STAT CARDS */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <span style={styles.statTitle}>Pacotes</span>
          <strong style={{ ...styles.statNumber, color: '#0284c7' }}>{stats.pacotes}</strong>
          <span style={styles.statSub}>liberados no mês ({formatCurrency(unitPrice)}/ref)</span>
        </div>

        <div style={styles.statCard}>
          <span style={styles.statTitle}>Créditos</span>
          <strong style={{ ...styles.statNumber, color: '#059669' }}>{stats.creditos}</strong>
          <span style={styles.statSub}>refeições liberadas</span>
        </div>

        <div style={styles.statCard}>
          <span style={styles.statTitle}>Consumo</span>
          <strong style={styles.statNumber}>{stats.marmitas}</strong>
          <span style={styles.statSub}>almoços solicitados</span>
        </div>

        <div style={styles.statCard}>
          <span style={styles.statTitle}>Desconto</span>
          <strong style={{ ...styles.statNumber, color: '#dc2626' }}>
            {formatCurrency(stats.desconto)}
          </strong>
          <span style={styles.statSub}>total a descontar em folha</span>
        </div>
      </div>

      {/* BARRA DE PESQUISA */}
      <div style={styles.filterBar}>
        <div style={styles.searchWrapper}>
          <Search size={16} style={styles.searchIcon} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Pesquisar por colaborador, CPF ou setor..."
            style={styles.searchInput}
          />
        </div>
      </div>

      {/* SUB-ABA: PACOTES DE VALE REFEIÇÃO */}
      {subTab === 'pacotes' && (
        <div style={styles.tableCard}>
          {loading ? (
            <div style={styles.loadingBox}>
              <RefreshCw size={24} className="animate-spin" color="#0284c7" />
              <span>Carregando pacotes de vale refeição...</span>
            </div>
          ) : filteredPackages.length === 0 ? (
            <div style={styles.emptyBox}>
              <Ticket size={36} color="#cbd5e1" style={{ marginBottom: '8px' }} />
              <p style={{ margin: '0 0 12px 0', fontWeight: 600, color: '#64748b' }}>
                Nenhum pacote liberado neste mês.
              </p>
              <button onClick={() => setShowPackageModal(true)} style={{ ...styles.actionBtnSuccess, margin: '0 auto' }}>
                <Plus size={15} />
                Liberar
              </button>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Data</th>
                    <th style={styles.th}>Colaborador</th>
                    <th style={styles.th}>Setor</th>
                    <th style={styles.th}>Pacote</th>
                    <th style={styles.th}>Usadas</th>
                    <th style={styles.th}>Saldo</th>
                    <th style={styles.th}>Valor</th>
                    <th style={styles.th}>Status</th>
                    <th style={{ ...styles.th, textAlign: 'center' }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPackages.map(pkg => {
                    const isCancelled = pkg.status === 'cancelado';
                    const isCompleted = pkg.status === 'concluido' || (Number(pkg.remainingMeals) || 0) === 0;
                    return (
                      <tr key={pkg.id} style={{ ...styles.tr, opacity: isCancelled ? 0.6 : 1 }}>
                        <td style={styles.td}>{formatDateBR(String(pkg.createdAt || '').slice(0, 10))}</td>
                        <td style={{ ...styles.td, fontWeight: 600 }}>
                          <div>{pkg.employeeName}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 400 }}>{pkg.employeeCpf || '—'}</div>
                        </td>
                        <td style={styles.td}>{pkg.sector}</td>
                        <td style={{ ...styles.td, fontWeight: 700, color: '#0284c7' }}>{pkg.quantity} ref.</td>
                        <td style={styles.td}>{pkg.usedMeals || 0}</td>
                        <td style={{ ...styles.td, fontWeight: 700, color: isCompleted ? '#64748b' : '#059669' }}>
                          {pkg.remainingMeals ?? 0}
                        </td>
                        <td style={{ ...styles.td, fontWeight: 700, color: '#dc2626' }}>
                          {formatCurrency(pkg.totalValue)}
                        </td>
                        <td style={styles.td}>
                          <span style={{
                            ...styles.statusBadge,
                            backgroundColor: isCancelled ? '#fee2e2' : isCompleted ? '#f1f5f9' : '#dcfce7',
                            color: isCancelled ? '#991b1b' : isCompleted ? '#475569' : '#166534'
                          }}>
                            {isCancelled ? 'Cancelado' : isCompleted ? 'Concluído' : 'Ativo'}
                          </span>
                        </td>
                        <td style={{ ...styles.td, textAlign: 'center' }}>
                          <div style={{ display: 'inline-flex', gap: '6px' }}>
                            <button
                              onClick={() => printPackageTerm(pkg)}
                              title="Imprimir Termo de Autorização de Desconto em Folha"
                              style={styles.detailBtn}
                            >
                              <Printer size={14} />
                              Termo
                            </button>

                            {!isCancelled && (Number(pkg.usedMeals) || 0) === 0 && (
                              <button
                                onClick={() => handleCancelPackage(pkg)}
                                title="Cancelar pacote não utilizado"
                                style={styles.cancelBtn}
                              >
                                <XCircle size={14} />
                                Cancelar
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* SUB-ABA: TABELA DE DESCONTOS CONSOLIDADA (FECHAMENTO) */}
      {subTab === 'fechamento' && (
        <div style={styles.tableCard}>
          {loading ? (
            <div style={styles.loadingBox}>
              <RefreshCw size={24} className="animate-spin" color="#0284c7" />
              <span>Processando fechamento mensal de marmitas...</span>
            </div>
          ) : filteredList.length === 0 ? (
            <div style={styles.emptyBox}>
              <Utensils size={36} color="#cbd5e1" style={{ marginBottom: '8px' }} />
              <p style={{ margin: 0, fontWeight: 600, color: '#64748b' }}>Nenhum consumo ou pacote registrado neste mês.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Colaborador</th>
                    <th style={styles.th}>CPF</th>
                    <th style={styles.th}>Setor</th>
                    <th style={styles.th}>Pacotes</th>
                    <th style={styles.th}>Consumo</th>
                    <th style={styles.th}>Desconto</th>
                    <th style={{ ...styles.th, textAlign: 'center' }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredList.map(item => (
                    <tr key={item.employeeId} style={styles.tr}>
                      <td style={{ ...styles.td, fontWeight: 600 }}>{item.employeeName}</td>
                      <td style={styles.td}>{item.employeeCpf || '—'}</td>
                      <td style={styles.td}>{item.sector}</td>
                      <td style={{ ...styles.td, fontWeight: 600, color: '#059669' }}>
                        {item.packageMealsBought ? `${item.packageMealsBought} ref.` : '—'}
                      </td>
                      <td style={{ ...styles.td, fontWeight: 700, color: '#0284c7' }}>
                        {item.totalOrders}
                      </td>
                      <td style={{ ...styles.td, fontWeight: 700, color: '#dc2626' }}>
                        {formatCurrency(item.totalDiscount)}
                      </td>
                      <td style={{ ...styles.td, textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          <button
                            onClick={() => setSelectedEmployeeOrders(item)}
                            title="Visualizar histórico de datas"
                            style={styles.detailBtn}
                          >
                            <Eye size={14} />
                            Detalhes
                          </button>

                          <button
                            onClick={() => handleResetPassword(item)}
                            disabled={resettingId === item.employeeId}
                            title="Resetar senha para os 4 primeiros dígitos do CPF"
                            style={styles.resetBtn}
                          >
                            <RotateCcw size={14} />
                            Resetar
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
      )}

      {/* MODAL LIBERAR PACOTE DE VALE REFEIÇÃO */}
      {showPackageModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Pacote</h3>
              <button onClick={() => setShowPackageModal(false)} style={styles.modalCloseBtn}>×</button>
            </div>

            <form onSubmit={handleCreatePackage}>
              <div style={styles.modalBody}>
                <div style={styles.formGroup}>
                  <label style={styles.fieldLabel}>Colaborador</label>
                  <SearchableEmployeeSelect
                    employees={activeEmployees}
                    value={pkgEmployeeId}
                    onChange={setPkgEmployeeId}
                    placeholder="Selecionar colaborador..."
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.fieldLabel}>Quantidade</label>
                  <div style={styles.packageGrid}>
                    {MEAL_PACKAGE_SIZES.map((size) => {
                      const selected = pkgQuantity === size;
                      const total = size * unitPrice;
                      return (
                        <button
                          key={size}
                          type="button"
                          onClick={() => setPkgQuantity(size)}
                          style={{
                            ...styles.packageOptionBtn,
                            borderColor: selected ? '#0284c7' : '#cbd5e1',
                            backgroundColor: selected ? '#f0f9ff' : '#ffffff',
                            color: selected ? '#0369a1' : '#334155'
                          }}
                        >
                          <span style={{ fontSize: '1.35rem', fontWeight: 800 }}>{size}</span>
                          <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>refeições</span>
                          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#059669', marginTop: '4px' }}>
                            {formatCurrency(total)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div style={styles.formGroup}>
                    <label style={styles.fieldLabel}>Competência</label>
                    <input
                      type="month"
                      value={pkgMonth}
                      onChange={(e) => setPkgMonth(e.target.value)}
                      required
                      style={styles.modalInput}
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.fieldLabel}>Unitário</label>
                    <input
                      type="text"
                      readOnly
                      value={formatCurrency(unitPrice)}
                      style={{ ...styles.modalInput, backgroundColor: '#f8fafc', color: '#475569' }}
                    />
                  </div>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.fieldLabel}>Observação</label>
                  <input
                    type="text"
                    value={pkgNotes}
                    onChange={(e) => setPkgNotes(e.target.value)}
                    placeholder="Opcional..."
                    style={styles.modalInput}
                  />
                </div>

                <div style={styles.pkgSummaryBox}>
                  <span>Desconto em folha ({pkgQuantity} × {formatCurrency(unitPrice)})</span>
                  <strong style={{ fontSize: '1.1rem', color: '#dc2626' }}>
                    {formatCurrency(pkgQuantity * unitPrice)}
                  </strong>
                </div>
              </div>

              <div style={styles.modalFooter}>
                <button type="button" onClick={() => setShowPackageModal(false)} style={styles.actionBtnOutline}>
                  Cancelar
                </button>
                <button type="submit" disabled={savingPkg || !pkgEmployeeId} style={styles.actionBtnSuccess}>
                  <Printer size={15} />
                  {savingPkg ? 'Liberando...' : 'Liberar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CONFIGURAÇÃO DO VALOR UNITÁRIO */}
      {showConfigModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Configuração</h3>
              <button onClick={() => setShowConfigModal(false)} style={styles.modalCloseBtn}>×</button>
            </div>

            <form onSubmit={handleSaveConfig}>
              <div style={styles.modalBody}>
                <div style={styles.formGroup}>
                  <label style={styles.fieldLabel}>Unitário</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={configForm.packageMealPrice}
                    onChange={(e) => setConfigForm({ ...configForm, packageMealPrice: e.target.value })}
                    required
                    style={styles.modalInput}
                  />
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    Valor cobrado por refeição nos pacotes de 15, 22 e 26 (padrão R$ 2,00)
                  </span>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.fieldLabel}>Bloqueio</label>
                  <select
                    value={configForm.requirePackage ? 'true' : 'false'}
                    onChange={(e) => setConfigForm({ ...configForm, requirePackage: e.target.value === 'true' })}
                    style={styles.modalInput}
                  >
                    <option value="true">Exigir saldo de pacote liberado pelo RH</option>
                    <option value="false">Permitir pedido avulso mesmo sem pacote</option>
                  </select>
                </div>
              </div>

              <div style={styles.modalFooter}>
                <button type="button" onClick={() => setShowConfigModal(false)} style={styles.actionBtnOutline}>
                  Cancelar
                </button>
                <button type="submit" disabled={savingConfig} style={styles.actionBtnPrimary}>
                  {savingConfig ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DETALHES DAS MARMITAS DO COLABORADOR */}
      {selectedEmployeeOrders && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <div style={styles.modalHeader}>
              <div>
                <h3 style={styles.modalTitle}>Histórico</h3>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  {selectedEmployeeOrders.employeeName} ({selectedEmployeeOrders.sector})
                </span>
              </div>
              <button onClick={() => setSelectedEmployeeOrders(null)} style={styles.modalCloseBtn}>×</button>
            </div>

            <div style={styles.modalBody}>
              <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Data</th>
                      <th style={styles.th}>Origem</th>
                      <th style={styles.th}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedEmployeeOrders.orders.map(o => (
                      <tr key={o.id} style={styles.tr}>
                        <td style={styles.td}>{formatDateBR(o.date)}</td>
                        <td style={styles.td}>
                          {o.paymentSource === 'pacote' ? 'Pacote' : formatCurrency(o.discountValue)}
                        </td>
                        <td style={styles.td}>
                          <span style={{
                            ...styles.statusBadge,
                            backgroundColor: o.status === 'entregue' ? '#dcfce7' : '#e0f2fe',
                            color: o.status === 'entregue' ? '#166534' : '#0369a1'
                          }}>
                            {o.status === 'entregue' ? 'Entregue' : 'Solicitado'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div style={styles.modalFooter}>
              <div style={{ flex: 1, fontWeight: 700, fontSize: '0.9rem' }}>
                Total: {selectedEmployeeOrders.totalOrders} marmitas ({formatCurrency(selectedEmployeeOrders.totalDiscount)})
              </div>
              <button onClick={() => setSelectedEmployeeOrders(null)} style={styles.actionBtnPrimary}>
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
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem'
  },
  toast: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1px solid'
  },
  topBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '12px',
    backgroundColor: '#ffffff',
    padding: '12px 18px',
    borderRadius: '12px',
    border: '1px solid #e2e8f0'
  },
  monthSelector: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  monthInput: {
    padding: '8px 12px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    fontSize: '0.9rem',
    fontWeight: 600,
    outline: 'none'
  },
  subTabSwitch: {
    display: 'inline-flex',
    backgroundColor: '#f1f5f9',
    padding: '3px',
    borderRadius: '8px',
    gap: '4px'
  },
  subTabBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    borderRadius: '6px',
    border: 'none',
    fontSize: '0.82rem',
    fontWeight: 600,
    cursor: 'pointer'
  },
  topActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap'
  },
  actionBtnOutline: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 14px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    backgroundColor: '#ffffff',
    color: '#334155',
    fontWeight: 600,
    fontSize: '0.85rem',
    cursor: 'pointer'
  },
  actionBtnPrimary: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 14px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#0284c7',
    color: '#ffffff',
    fontWeight: 600,
    fontSize: '0.85rem',
    cursor: 'pointer'
  },
  actionBtnSuccess: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 14px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#059669',
    color: '#ffffff',
    fontWeight: 600,
    fontSize: '0.85rem',
    cursor: 'pointer'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '12px'
  },
  statCard: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  statTitle: {
    fontSize: '0.75rem',
    fontWeight: 700,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.04em'
  },
  statNumber: {
    fontSize: '1.6rem',
    fontWeight: 800,
    color: '#0f172a'
  },
  statSub: {
    fontSize: '0.75rem',
    color: '#94a3b8'
  },
  filterBar: {
    backgroundColor: '#ffffff',
    padding: '12px 18px',
    borderRadius: '12px',
    border: '1px solid #e2e8f0'
  },
  searchWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },
  searchIcon: {
    position: 'absolute',
    left: '10px',
    color: '#94a3b8'
  },
  searchInput: {
    width: '100%',
    padding: '8px 12px 8px 34px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    fontSize: '0.85rem',
    outline: 'none'
  },
  tableCard: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    overflow: 'hidden'
  },
  loadingBox: {
    padding: '3rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    color: '#64748b',
    fontSize: '0.9rem'
  },
  emptyBox: {
    padding: '3.5rem 1rem',
    textAlign: 'center'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.85rem'
  },
  th: {
    textAlign: 'left',
    padding: '10px 14px',
    backgroundColor: '#f8fafc',
    color: '#475569',
    fontWeight: 700,
    borderBottom: '1px solid #e2e8f0',
    fontSize: '0.75rem',
    textTransform: 'uppercase',
    letterSpacing: '0.04em'
  },
  tr: {
    borderBottom: '1px solid #f1f5f9'
  },
  td: {
    padding: '12px 14px',
    color: '#334155',
    verticalAlign: 'middle'
  },
  statusBadge: {
    display: 'inline-block',
    padding: '3px 8px',
    borderRadius: '999px',
    fontSize: '0.75rem',
    fontWeight: 700,
    textTransform: 'uppercase'
  },
  detailBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '5px 9px',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    backgroundColor: '#ffffff',
    color: '#334155',
    fontSize: '0.75rem',
    fontWeight: 600,
    cursor: 'pointer'
  },
  resetBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '5px 9px',
    borderRadius: '6px',
    border: '1px solid #fed7aa',
    backgroundColor: '#fff7ed',
    color: '#ea580c',
    fontSize: '0.75rem',
    fontWeight: 600,
    cursor: 'pointer'
  },
  cancelBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '5px 9px',
    borderRadius: '6px',
    border: '1px solid #fecaca',
    backgroundColor: '#fef2f2',
    color: '#dc2626',
    fontSize: '0.75rem',
    fontWeight: 600,
    cursor: 'pointer'
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
    zIndex: 100,
    padding: '1rem'
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderRadius: '14px',
    width: '100%',
    maxWidth: '540px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.25)',
    overflow: 'hidden'
  },
  modalHeader: {
    padding: '14px 18px',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc'
  },
  modalTitle: {
    margin: 0,
    fontSize: '1.05rem',
    fontWeight: 700,
    color: '#0f172a'
  },
  modalCloseBtn: {
    background: 'none',
    border: 'none',
    fontSize: '1.4rem',
    color: '#64748b',
    cursor: 'pointer'
  },
  modalBody: {
    padding: '16px 18px',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px'
  },
  modalFooter: {
    padding: '12px 18px',
    borderTop: '1px solid #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '8px',
    backgroundColor: '#f8fafc'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  fieldLabel: {
    fontSize: '0.8rem',
    fontWeight: 700,
    color: '#334155'
  },
  modalInput: {
    padding: '8px 12px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    fontSize: '0.9rem',
    outline: 'none'
  },
  packageGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '10px'
  },
  packageOptionBtn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '12px 8px',
    borderRadius: '10px',
    border: '2px solid',
    cursor: 'pointer',
    transition: 'all 0.15s ease'
  },
  pkgSummaryBox: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 14px',
    backgroundColor: '#f8fafc',
    borderRadius: '10px',
    border: '1px solid #e2e8f0',
    fontSize: '0.85rem',
    fontWeight: 600,
    color: '#334155'
  }
};
