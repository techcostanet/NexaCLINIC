import React, { useState, useEffect } from 'react';
import { 
  X, FileText, Download, Filter, FileSpreadsheet, FilePieChart,
  Calendar, CheckCircle2, TrendingUp, TrendingDown, DollarSign
} from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

export default function FinanceReportsModal({ 
  onClose, 
  payableList = [], 
  receivableList = [], 
  costCenters = [],
  tenantSettings = { name: 'Nexa Clínica', cnpj: '00.000.000/0001-00', logo: '' }
}) {
  const [selectedReport, setSelectedReport] = useState('EXTRATO_GERAL');
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().substring(0, 10);
  });
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    d.setDate(0);
    return d.toISOString().substring(0, 10);
  });
  const [unitFilter, setUnitFilter] = useState('Todas');
  const [reportData, setReportData] = useState([]);
  const [reportColumns, setReportColumns] = useState([]);

  const REPORTS = [
    { id: 'EXTRATO_GERAL', name: '1. Extrato de Mov. Gerais', icon: FileText },
    { id: 'CONTAS_PAGAR', name: '2. Contas a Pagar por Período', icon: TrendingDown },
    { id: 'CONTAS_RECEBER', name: '3. Contas a Receber', icon: TrendingUp },
    { id: 'INADIMPLENCIA', name: '4. Inadimplência (Atrasados)', icon: FileText },
    { id: 'DESPESAS_CC', name: '5. Despesas por C. Custo', icon: FilePieChart },
    { id: 'RECEITAS_CAT', name: '6. Receitas por Categoria', icon: FilePieChart },
    { id: 'DRE', name: '7. DRE Simplificado', icon: FileSpreadsheet },
    { id: 'FLUXO_CAIXA_DIARIO', name: '8. Fluxo de Caixa Diário', icon: Calendar },
    { id: 'PREVISAO_CAIXA', name: '9. Previsão de Fluxo (30/60/90)', icon: Calendar },
    { id: 'TITULOS_PAGOS', name: '10. Histórico de Pagamentos', icon: CheckCircle2 },
    { id: 'FIXO_VARIAVEL', name: '11. Despesas Fixas vs Variáveis', icon: FilePieChart },
    { id: 'MEIO_PAGAMENTO', name: '12. Entradas por Meio de Pgto.', icon: DollarSign },
    { id: 'TOP_FORNECEDORES', name: '13. Despesas por Fornecedor', icon: TrendingDown },
    { id: 'FATURAMENTO_FILIAL', name: '14. Faturamento por Filial', icon: TrendingUp },
    { id: 'AUDITORIA', name: '15. Auditoria de Lançamentos', icon: FileText }
  ];

  useEffect(() => {
    generateReport();
  }, [selectedReport, startDate, endDate, unitFilter, payableList, receivableList]);

  const generateReport = () => {
    let data = [];
    let cols = [];

    const filterByDateRange = (item, dateField) => {
      if (!item[dateField]) return false;
      return item[dateField] >= startDate && item[dateField] <= endDate;
    };
    const filterByUnit = (item) => unitFilter === 'Todas' || !item.unit || item.unit === unitFilter;

    switch (selectedReport) {
      case 'EXTRATO_GERAL': {
        const r_extrato = receivableList.filter(r => filterByDateRange(r, 'dueDate') && filterByUnit(r));
        const p_extrato = payableList.filter(p => filterByDateRange(p, 'dueDate') && filterByUnit(p));
        data = [
          ...r_extrato.map(r => ({ data: r.dueDate, tipo: 'Entrada', descricao: r.client || r.description, categoria: r.category, valor: parseFloat(r.amount)||0 })),
          ...p_extrato.map(p => ({ data: p.dueDate, tipo: 'Saída', descricao: p.supplier || p.description, categoria: p.category, valor: parseFloat(p.amount)||0 }))
        ].sort((a,b) => a.data.localeCompare(b.data));

        cols = [
          { header: 'Data', key: 'data' },
          { header: 'Tipo', key: 'tipo' },
          { header: 'Descrição', key: 'descricao' },
          { header: 'Categoria', key: 'categoria' },
          { header: 'Valor (R$)', key: 'valor', format: 'currency' }
        ];
        break;
      }
      case 'CONTAS_PAGAR': {
        data = payableList
          .filter(p => filterByDateRange(p, 'dueDate') && filterByUnit(p))
          .map(p => ({
            vencimento: p.dueDate, fornecedor: p.supplier, unidade: p.unit || 'Matriz',
            status: p.status, valor: parseFloat(p.amount)||0
          }))
          .sort((a,b) => a.vencimento.localeCompare(b.vencimento));
        cols = [
          { header: 'Vencimento', key: 'vencimento' },
          { header: 'Fornecedor', key: 'fornecedor' },
          { header: 'Unidade', key: 'unidade' },
          { header: 'Status', key: 'status' },
          { header: 'Valor (R$)', key: 'valor', format: 'currency' }
        ];
        break;
      }
      case 'CONTAS_RECEBER': {
        data = receivableList
          .filter(r => filterByDateRange(r, 'dueDate') && filterByUnit(r))
          .map(r => ({
            vencimento: r.dueDate, cliente: r.client, unidade: r.unit || 'Matriz',
            status: r.status, valor: parseFloat(r.amount)||0
          }))
          .sort((a,b) => a.vencimento.localeCompare(b.vencimento));
        cols = [
          { header: 'Vencimento', key: 'vencimento' },
          { header: 'Cliente', key: 'cliente' },
          { header: 'Unidade', key: 'unidade' },
          { header: 'Status', key: 'status' },
          { header: 'Valor (R$)', key: 'valor', format: 'currency' }
        ];
        break;
      }
      case 'INADIMPLENCIA': {
        const todayStr = new Date().toISOString().substring(0, 10);
        data = receivableList
          .filter(r => r.dueDate < todayStr && r.status !== 'Pago' && filterByUnit(r))
          .map(r => ({
            vencimento: r.dueDate, cliente: r.client, dias_atraso: Math.floor((new Date(todayStr) - new Date(r.dueDate)) / (1000 * 60 * 60 * 24)),
            valor: parseFloat(r.amount)||0
          }))
          .sort((a,b) => b.dias_atraso - a.dias_atraso);
        cols = [
          { header: 'Vencimento', key: 'vencimento' },
          { header: 'Cliente', key: 'cliente' },
          { header: 'Atraso (Dias)', key: 'dias_atraso' },
          { header: 'Valor (R$)', key: 'valor', format: 'currency' }
        ];
        break;
      }
      case 'DESPESAS_CC': {
        const despesas = payableList.filter(p => filterByDateRange(p, 'dueDate') && filterByUnit(p));
        const agg = {};
        despesas.forEach(p => {
          const ccName = costCenters.find(c => c.id === p.costCenterId)?.name || 'Sem Centro de Custo';
          agg[ccName] = (agg[ccName] || 0) + (parseFloat(p.amount) || 0);
        });
        data = Object.keys(agg).map(cc => ({ centro: cc, valor: agg[cc] })).sort((a,b) => b.valor - a.valor);
        cols = [
          { header: 'Centro de Custo', key: 'centro' },
          { header: 'Valor Total (R$)', key: 'valor', format: 'currency' }
        ];
        break;
      }
      case 'RECEITAS_CAT': {
        const receitas = receivableList.filter(r => filterByDateRange(r, 'dueDate') && filterByUnit(r));
        const aggCat = {};
        receitas.forEach(r => {
          const cat = r.category || 'Outros';
          aggCat[cat] = (aggCat[cat] || 0) + (parseFloat(r.amount) || 0);
        });
        data = Object.keys(aggCat).map(cat => ({ categoria: cat, valor: aggCat[cat] })).sort((a,b) => b.valor - a.valor);
        cols = [
          { header: 'Categoria de Receita', key: 'categoria' },
          { header: 'Valor Total (R$)', key: 'valor', format: 'currency' }
        ];
        break;
      }
      case 'DRE': {
        const isPaid = (item) => String(item?.status || '').toLowerCase() === 'pago' || String(item?.status || '').toLowerCase() === 'recebido' || ((parseFloat(item?.amountPaid) || 0) >= (parseFloat(item?.amount) || 0) && (parseFloat(item?.amount) || 0) > 0);
        const rec = receivableList.filter(r => filterByDateRange(r, 'dueDate') && filterByUnit(r) && isPaid(r));
        const des = payableList.filter(p => filterByDateRange(p, 'dueDate') && filterByUnit(p) && isPaid(p));
        const totRec = rec.reduce((acc, r) => acc + (parseFloat(r.amountPaid || r.amount) || 0), 0);
        const totDes = des.reduce((acc, p) => acc + (parseFloat(p.amountPaid || p.amount) || 0), 0);
        
        data = [
          { item: '1. Receita Bruta Realizada', valor: totRec },
          { item: '2. Despesas Realizadas', valor: totDes },
          { item: '3. Resultado Líquido (Lucro/Prejuízo)', valor: totRec - totDes }
        ];
        cols = [
          { header: 'DRE (Regime de Caixa)', key: 'item' },
          { header: 'Valor (R$)', key: 'valor', format: 'currency' }
        ];
        break;
      }
      case 'FLUXO_CAIXA_DIARIO': {
        const recDiario = receivableList.filter(r => filterByDateRange(r, 'dueDate') && filterByUnit(r));
        const desDiario = payableList.filter(p => filterByDateRange(p, 'dueDate') && filterByUnit(p));
        const mapDias = {};
        recDiario.forEach(r => {
          mapDias[r.dueDate] = mapDias[r.dueDate] || { entradas: 0, saidas: 0 };
          mapDias[r.dueDate].entradas += parseFloat(r.amount) || 0;
        });
        desDiario.forEach(p => {
          mapDias[p.dueDate] = mapDias[p.dueDate] || { entradas: 0, saidas: 0 };
          mapDias[p.dueDate].saidas += parseFloat(p.amount) || 0;
        });
        data = Object.keys(mapDias).sort().map(dia => ({
          data: dia, entradas: mapDias[dia].entradas, saidas: mapDias[dia].saidas, 
          saldo: mapDias[dia].entradas - mapDias[dia].saidas
        }));
        cols = [
          { header: 'Data', key: 'data' },
          { header: 'Entradas (R$)', key: 'entradas', format: 'currency' },
          { header: 'Saídas (R$)', key: 'saidas', format: 'currency' },
          { header: 'Saldo do Dia (R$)', key: 'saldo', format: 'currency' }
        ];
        break;
      }
      case 'PREVISAO_CAIXA': {
        const todayStr = new Date().toISOString().substring(0, 10);
        const d30 = new Date(); d30.setDate(d30.getDate() + 30); const str30 = d30.toISOString().substring(0, 10);
        const d60 = new Date(); d60.setDate(d60.getDate() + 60); const str60 = d60.toISOString().substring(0, 10);
        const d90 = new Date(); d90.setDate(d90.getDate() + 90); const str90 = d90.toISOString().substring(0, 10);
        
        const isPaid = (item) => String(item?.status || '').toLowerCase() === 'pago' || String(item?.status || '').toLowerCase() === 'recebido' || ((parseFloat(item?.amountPaid) || 0) >= (parseFloat(item?.amount) || 0) && (parseFloat(item?.amount) || 0) > 0);
        let recs = receivableList.filter(r => r.dueDate >= todayStr && filterByUnit(r) && !isPaid(r));
        let pags = payableList.filter(p => p.dueDate >= todayStr && filterByUnit(p) && !isPaid(p));
        
        const calcPeriod = (start, end) => {
          const e = recs.filter(r => r.dueDate > start && r.dueDate <= end).reduce((a,c) => a + (parseFloat(c.amount)-parseFloat(c.amountPaid||0)), 0);
          const s = pags.filter(p => p.dueDate > start && p.dueDate <= end).reduce((a,c) => a + (parseFloat(c.amount)-parseFloat(c.amountPaid||0)), 0);
          return { e, s };
        };
        const p30 = calcPeriod(todayStr, str30);
        const p60 = calcPeriod(str30, str60);
        const p90 = calcPeriod(str60, str90);

        data = [
          { periodo: 'Próximos 30 dias', entradas: p30.e, saidas: p30.s, saldo: p30.e - p30.s },
          { periodo: '31 a 60 dias', entradas: p60.e, saidas: p60.s, saldo: p60.e - p60.s },
          { periodo: '61 a 90 dias', entradas: p90.e, saidas: p90.s, saldo: p90.e - p90.s }
        ];
        cols = [
          { header: 'Período', key: 'periodo' },
          { header: 'Receitas Previstas (R$)', key: 'entradas', format: 'currency' },
          { header: 'Despesas Previstas (R$)', key: 'saidas', format: 'currency' },
          { header: 'Resultado Projetado (R$)', key: 'saldo', format: 'currency' }
        ];
        break;
      }
      case 'TITULOS_PAGOS': {
        const isPaid = (item) => String(item?.status || '').toLowerCase() === 'pago' || ((parseFloat(item?.amountPaid) || 0) >= (parseFloat(item?.amount) || 0) && (parseFloat(item?.amount) || 0) > 0);
        data = payableList
          .filter(p => filterByDateRange(p, 'dueDate') && filterByUnit(p) && isPaid(p))
          .map(p => ({
            vencimento: p.dueDate, fornecedor: p.supplier, metodo: p.paymentMethod || 'PIX', valor: parseFloat(p.amountPaid || p.amount) || 0
          })).sort((a,b) => (a.vencimento || '').localeCompare(b.vencimento || ''));
        cols = [
          { header: 'Vencimento', key: 'vencimento' },
          { header: 'Fornecedor', key: 'fornecedor' },
          { header: 'Meio de Pgto', key: 'metodo' },
          { header: 'Valor Pago (R$)', key: 'valor', format: 'currency' }
        ];
        break;
      }
      case 'FIXO_VARIAVEL': {
        const deps = payableList.filter(p => filterByDateRange(p, 'dueDate') && filterByUnit(p));
        const aggNature = { 'Fixo': 0, 'Variável': 0 };
        deps.forEach(p => {
          const nat = p.natureType && p.natureType.includes('Fixo') ? 'Fixo' : 'Variável';
          aggNature[nat] += parseFloat(p.amount) || 0;
        });
        data = [
          { natureza: 'Custos Fixos Recorrentes', valor: aggNature['Fixo'] },
          { natureza: 'Custos Variáveis / Operacionais', valor: aggNature['Variável'] }
        ];
        cols = [
          { header: 'Natureza da Despesa', key: 'natureza' },
          { header: 'Valor Total (R$)', key: 'valor', format: 'currency' }
        ];
        break;
      }
      case 'MEIO_PAGAMENTO': {
        const rets = receivableList.filter(r => filterByDateRange(r, 'dueDate') && filterByUnit(r) && r.status === 'Pago');
        const aggMet = {};
        rets.forEach(r => {
          const m = r.paymentMethod || 'PIX';
          aggMet[m] = (aggMet[m] || 0) + (parseFloat(r.amountPaid) || 0);
        });
        data = Object.keys(aggMet).map(m => ({ metodo: m, valor: aggMet[m] })).sort((a,b) => b.valor - a.valor);
        cols = [
          { header: 'Meio de Pagamento', key: 'metodo' },
          { header: 'Total Recebido (R$)', key: 'valor', format: 'currency' }
        ];
        break;
      }
      case 'TOP_FORNECEDORES': {
        const pays = payableList.filter(p => filterByDateRange(p, 'dueDate') && filterByUnit(p));
        const aggForn = {};
        pays.forEach(p => {
          const f = p.supplier || 'Não Informado';
          aggForn[f] = (aggForn[f] || 0) + (parseFloat(p.amount) || 0);
        });
        data = Object.keys(aggForn).map(f => ({ fornecedor: f, valor: aggForn[f] })).sort((a,b) => b.valor - a.valor);
        cols = [
          { header: 'Fornecedor', key: 'fornecedor' },
          { header: 'Volume Devido (R$)', key: 'valor', format: 'currency' }
        ];
        break;
      }
      case 'FATURAMENTO_FILIAL': {
        const allR = receivableList.filter(r => filterByDateRange(r, 'dueDate'));
        const aggU = {};
        allR.forEach(r => {
          const u = r.unit || 'Matriz';
          aggU[u] = (aggU[u] || 0) + (parseFloat(r.amount) || 0);
        });
        data = Object.keys(aggU).map(u => ({ unidade: u, valor: aggU[u] })).sort((a,b) => b.valor - a.valor);
        cols = [
          { header: 'Filial / Unidade', key: 'unidade' },
          { header: 'Faturamento Total (R$)', key: 'valor', format: 'currency' }
        ];
        break;
      }
      case 'AUDITORIA': {
        // Just the latest 50 records sorted by ID (which acts as a timestamp in this mock)
        data = payableList.slice(-25).map(p => ({
          tipo: 'Despesa', descricao: p.supplier, data: p.dueDate, status: p.status
        })).concat(receivableList.slice(-25).map(r => ({
          tipo: 'Receita', descricao: r.client, data: r.dueDate, status: r.status
        }))).sort((a,b) => b.data.localeCompare(a.data)); // Descending by dueDate
        cols = [
          { header: 'Tipo', key: 'tipo' },
          { header: 'Descrição', key: 'descricao' },
          { header: 'Competência', key: 'data' },
          { header: 'Status Final', key: 'status' }
        ];
        break;
      }
    }

    setReportData(data);
    setReportColumns(cols);
  };

  const getReportName = () => REPORTS.find(r => r.id === selectedReport)?.name || 'Relatório';

  const exportPDF = () => {
    const doc = new jsPDF();
    const title = getReportName();
    
    // Header
    doc.setFontSize(16);
    doc.text(tenantSettings.name, 14, 15);
    doc.setFontSize(10);
    doc.text(`CNPJ: ${tenantSettings.cnpj}`, 14, 22);
    doc.text(`Relatório: ${title}`, 14, 28);
    doc.text(`Período: ${startDate.split('-').reverse().join('/')} a ${endDate.split('-').reverse().join('/')} | Filial: ${unitFilter}`, 14, 34);

    const tableColumn = reportColumns.map(c => c.header);
    const tableRows = reportData.map(row => 
      reportColumns.map(col => {
        let val = row[col.key];
        if (col.format === 'currency') return `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
        return val;
      })
    );

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 40,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [16, 185, 129] } // emerald-500
    });

    doc.save(`${title.replace(/\s+/g, '_')}.pdf`);
  };

  const exportXLS = () => {
    const title = getReportName();
    const wsData = reportData.map(row => {
      const newRow = {};
      reportColumns.forEach(col => {
        let val = row[col.key];
        if (col.format === 'currency') val = `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
        newRow[col.header] = val;
      });
      return newRow;
    });

    const ws = XLSX.utils.json_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Relatório");
    
    XLSX.writeFile(wb, `${title.replace(/\s+/g, '_')}.xlsx`);
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem', color: '#0f172a' }}>
              <FileText size={22} color="#10b981" /> Central de Relatórios Financeiros
            </h2>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>
              Selecione, filtre e exporte análises detalhadas do financeiro.
            </p>
          </div>
          <button onClick={onClose} style={styles.closeBtn}>
            <X size={24} />
          </button>
        </div>

        <div style={styles.body}>
          {/* Sidebar */}
          <div style={styles.sidebar}>
            <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Relatórios Disponíveis</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', overflowY: 'auto', maxHeight: 'calc(100vh - 200px)', paddingRight: '0.5rem' }}>
              {REPORTS.map(r => {
                const isSelected = selectedReport === r.id;
                const Icon = r.icon;
                return (
                  <button 
                    key={r.id} 
                    onClick={() => setSelectedReport(r.id)}
                    style={{ ...styles.reportBtn, backgroundColor: isSelected ? '#ecfdf5' : 'transparent', color: isSelected ? '#047857' : '#475569', borderLeft: isSelected ? '3px solid #10b981' : '3px solid transparent' }}
                  >
                    <Icon size={16} />
                    <span style={{ fontSize: '0.85rem', fontWeight: isSelected ? '700' : '500', textAlign: 'left' }}>{r.name}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Main Area */}
          <div style={styles.main}>
            {/* Filters */}
            <div style={styles.filtersBar}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={styles.filterGroup}>
                  <label style={styles.label}>Data Inicial</label>
                  <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={styles.input} />
                </div>
                <div style={styles.filterGroup}>
                  <label style={styles.label}>Data Final</label>
                  <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={styles.input} />
                </div>
                <div style={styles.filterGroup}>
                  <label style={styles.label}>Filial / Unidade</label>
                  <select value={unitFilter} onChange={e => setUnitFilter(e.target.value)} style={styles.input}>
                    <option value="Todas">Todas as Unidades</option>
                    <option value="Matriz">Matriz</option>
                    <option value="Betim">Betim</option>
                    <option value="Contagem">Contagem</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={exportPDF} style={styles.exportPdfBtn}>
                  <Download size={16} /> Exportar PDF
                </button>
                <button onClick={exportXLS} style={styles.exportXlsBtn}>
                  <FileSpreadsheet size={16} /> Exportar Excel
                </button>
              </div>
            </div>

            {/* Table View */}
            <div style={styles.tableContainer}>
              <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', color: '#334155' }}>Pré-visualização: {getReportName()}</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {reportColumns.map(col => (
                      <th key={col.key} style={styles.th}>{col.header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {reportData.length > 0 ? reportData.map((row, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      {reportColumns.map(col => {
                        let val = row[col.key];
                        if (col.format === 'currency') {
                          val = `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
                        }
                        if (val === undefined || val === null) val = '-';
                        return <td key={col.key} style={styles.td}>{val}</td>
                      })}
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={reportColumns.length || 1} style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                        Nenhum registro encontrado para estes filtros.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    zIndex: 99999, padding: '2rem'
  },
  modal: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    width: '100%', maxWidth: '1400px',
    height: '100%', maxHeight: '90vh',
    display: 'flex', flexDirection: 'column',
    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
    overflow: 'hidden'
  },
  header: {
    padding: '1.25rem 1.5rem',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#f8fafc'
  },
  closeBtn: {
    background: 'none', border: 'none', cursor: 'pointer', color: '#64748b',
    padding: '0.5rem', borderRadius: '8px'
  },
  body: {
    display: 'flex', flex: 1, overflow: 'hidden'
  },
  sidebar: {
    width: '280px',
    borderRight: '1px solid #e2e8f0',
    backgroundColor: '#f8fafc',
    padding: '1rem',
    display: 'flex', flexDirection: 'column'
  },
  reportBtn: {
    display: 'flex', alignItems: 'center', gap: '0.75rem',
    padding: '0.75rem 1rem', borderRadius: '8px', cursor: 'pointer',
    borderTop: 'none', borderRight: 'none', borderBottom: 'none',
    transition: 'all 0.2s'
  },
  main: {
    flex: 1, display: 'flex', flexDirection: 'column',
    backgroundColor: '#ffffff'
  },
  filtersBar: {
    padding: '1.25rem 1.5rem',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem'
  },
  filterGroup: {
    display: 'flex', flexDirection: 'column', gap: '0.25rem'
  },
  label: {
    fontSize: '0.75rem', fontWeight: '700', color: '#475569', textTransform: 'uppercase'
  },
  input: {
    padding: '0.45rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1',
    fontSize: '0.85rem', color: '#0f172a', outline: 'none'
  },
  exportPdfBtn: {
    display: 'flex', alignItems: 'center', gap: '0.5rem',
    padding: '0.5rem 1rem', borderRadius: '6px',
    backgroundColor: '#ef4444', color: '#fff', border: 'none', fontWeight: '600', cursor: 'pointer'
  },
  exportXlsBtn: {
    display: 'flex', alignItems: 'center', gap: '0.5rem',
    padding: '0.5rem 1rem', borderRadius: '6px',
    backgroundColor: '#10b981', color: '#fff', border: 'none', fontWeight: '600', cursor: 'pointer'
  },
  tableContainer: {
    padding: '1.5rem', flex: 1, overflowY: 'auto'
  },
  th: {
    textAlign: 'left', padding: '0.75rem 1rem', borderBottom: '2px solid #e2e8f0',
    color: '#475569', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase'
  },
  td: {
    padding: '0.75rem 1rem', fontSize: '0.85rem', color: '#0f172a', verticalAlign: 'middle'
  }
};
