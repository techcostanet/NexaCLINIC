import React, { useState, useEffect } from 'react';
import { 
  X, FileText, Download, Filter, FileSpreadsheet, FilePieChart,
  Calendar, CheckCircle2, TrendingUp, TrendingDown, DollarSign,
  Package, Boxes, Clock, AlertTriangle, Send, Repeat, ClipboardList,
  ShieldCheck, RefreshCw, ShoppingCart, Users, Layers
} from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { dbService } from '../firebase';

export default function StockReportsModal({ 
  onClose, 
  items = [], 
  transactions = [], 
  suppliers = [], 
  sectors = [], 
  invoices = [], 
  loans = [], 
  requisitions = [], 
  stockLocations = [], 
  inventories = [], 
  transfers = [], 
  productBatches = [],
  tenantSettings = { name: 'Nexa Clínica', cnpj: '00.000.000/0001-00', logo: '' }
}) {
  const [selectedReport, setSelectedReport] = useState('POSICAO_GERAL');
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
  const [categoryFilter, setCategoryFilter] = useState('Todas');
  const [sectorFilter, setSectorFilter] = useState('Todos');
  const [reportData, setReportData] = useState([]);
  const [reportColumns, setReportColumns] = useState([]);
  const [patientDispensations, setPatientDispensations] = useState([]);
  const [loadingDispensations, setLoadingDispensations] = useState(false);

  const REPORTS = [
    { id: 'POSICAO_GERAL', name: '1. Posição Geral de Estoque', icon: Boxes },
    { id: 'CURVA_ABC', name: '2. Curva ABC de Insumos', icon: FilePieChart },
    { id: 'CONTROLE_VALIDADE', name: '3. Validades & Lotes (FEFO)', icon: Calendar },
    { id: 'ITENS_CRITICOS', name: '4. Itens Críticos & Ponto de Compra', icon: AlertTriangle },
    { id: 'KARDEX_MOVIMENTACOES', name: '5. Extrato de Movimentações (Kardex)', icon: Clock },
    { id: 'CONSUMO_PACIENTE', name: '6. Consumo por Paciente (Rastreável)', icon: Users },
    { id: 'CONSUMO_SETOR', name: '7. Consumo por Setor / Salão', icon: Layers },
    { id: 'REQUISICOES_ENFERMAGEM', name: '8. Requisições da Enfermagem', icon: Send },
    { id: 'ENTRADA_NOTAS', name: '9. Entradas de Notas Fiscais (NF-e)', icon: FileText },
    { id: 'COMPRAS_FORNECEDOR', name: '10. Compras por Fornecedor', icon: ShoppingCart },
    { id: 'DOSSIE_RECALL', name: '11. Dossiê de Recall Farmacêutico', icon: ShieldCheck },
    { id: 'TRANSFERENCIAS_LOCAIS', name: '12. Transferências entre Locais', icon: Repeat },
    { id: 'EMPRESTIMOS_PARCEIROS', name: '13. Empréstimos com Parceiros', icon: RefreshCw },
    { id: 'ACURACIA_INVENTARIO', name: '14. Acurácia de Inventário Físico', icon: ClipboardList },
    { id: 'PREVISAO_DEMANDA', name: '15. Previsão de Consumo & Giro', icon: TrendingUp }
  ];

  useEffect(() => {
    fetchDispensations();
  }, []);

  const fetchDispensations = async () => {
    if (dbService.getPatientDispensations) {
      try {
        setLoadingDispensations(true);
        const disps = await dbService.getPatientDispensations();
        setPatientDispensations(disps || []);
      } catch (err) {
        console.error('Erro ao carregar dispensações para relatórios:', err);
      } finally {
        setLoadingDispensations(false);
      }
    }
  };

  const formatDateBR = (dateStr) => {
    if (!dateStr) return '-';
    const parts = String(dateStr).substring(0, 10).split('-');
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    return String(dateStr);
  };

  const formatDateTimeBR = (dateStr) => {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return formatDateBR(dateStr);
      return d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return formatDateBR(dateStr);
    }
  };

  useEffect(() => {
    generateReport();
  }, [
    selectedReport, startDate, endDate, categoryFilter, sectorFilter,
    items, transactions, suppliers, sectors, invoices, loans,
    requisitions, stockLocations, inventories, transfers, productBatches, patientDispensations
  ]);

  const generateReport = () => {
    let data = [];
    let cols = [];

    const filterByDateRange = (item, dateField) => {
      if (!item[dateField]) return false;
      const dStr = String(item[dateField]).substring(0, 10);
      return dStr >= startDate && dStr <= endDate;
    };

    const filterItemCategory = (cat) => categoryFilter === 'Todas' || cat === categoryFilter;
    const filterItemSector = (sec) => sectorFilter === 'Todos' || sec === sectorFilter;

    switch (selectedReport) {
      // 1. POSIÇÃO GERAL DE ESTOQUE (INVENTÁRIO VALORIZADO)
      case 'POSICAO_GERAL': {
        data = items
          .filter(it => filterItemCategory(it.category || 'Geral'))
          .map(it => {
            const stockQty = parseFloat(it.currentStock) || 0;
            const unitCost = parseFloat(it.price) || 0;
            const totalValue = stockQty * unitCost;
            const minStock = parseFloat(it.minStock) || 0;
            
            let status = 'Normal';
            if (stockQty <= 0) status = 'Zerado';
            else if (stockQty <= minStock * 0.5) status = 'Crítico';
            else if (stockQty <= minStock) status = 'Mínimo';

            return {
              insumo: it.name || '-',
              categoria: it.category || 'Geral',
              setor: it.defaultSectorId || 'Principal',
              estoque: stockQty,
              unidade: it.unit || 'un',
              custo: unitCost,
              total: totalValue,
              status
            };
          })
          .sort((a, b) => b.total - a.total);

        cols = [
          { header: 'Insumo', key: 'insumo' },
          { header: 'Categoria', key: 'categoria' },
          { header: 'Setor', key: 'setor' },
          { header: 'Estoque', key: 'estoque' },
          { header: 'Unidade', key: 'unidade' },
          { header: 'Custo', key: 'custo', format: 'currency' },
          { header: 'Total', key: 'total', format: 'currency' },
          { header: 'Status', key: 'status' }
        ];
        break;
      }

      // 2. CURVA ABC DE INSUMOS
      case 'CURVA_ABC': {
        const valuedItems = items
          .filter(it => filterItemCategory(it.category || 'Geral'))
          .map(it => {
            const stockQty = parseFloat(it.currentStock) || 0;
            const unitCost = parseFloat(it.price) || 0;
            return {
              insumo: it.name || '-',
              categoria: it.category || 'Geral',
              estoque: stockQty,
              valor: stockQty * unitCost
            };
          })
          .sort((a, b) => b.valor - a.valor);

        const totalStockValue = valuedItems.reduce((acc, it) => acc + it.valor, 0) || 1;
        let cumulative = 0;

        data = valuedItems.map(it => {
          const share = (it.valor / totalStockValue) * 100;
          cumulative += share;
          let rank = 'Classe C';
          if (cumulative <= 75 || share >= 15) rank = 'Classe A';
          else if (cumulative <= 95) rank = 'Classe B';

          return {
            classificacao: rank,
            insumo: it.insumo,
            categoria: it.categoria,
            estoque: it.estoque,
            valor: it.valor,
            percentual: share.toFixed(1) + '%',
            acumulado: Math.min(100, cumulative).toFixed(1) + '%'
          };
        });

        cols = [
          { header: 'Classe', key: 'classificacao' },
          { header: 'Insumo', key: 'insumo' },
          { header: 'Categoria', key: 'categoria' },
          { header: 'Estoque', key: 'estoque' },
          { header: 'Valor', key: 'valor', format: 'currency' },
          { header: 'Participação', key: 'percentual' },
          { header: 'Acumulado', key: 'acumulado' }
        ];
        break;
      }

      // 3. CONTROLE DE VALIDADE & LOTES (FEFO)
      case 'CONTROLE_VALIDADE': {
        const today = new Date();
        data = (productBatches || [])
          .filter(b => b.expiryDate)
          .map(b => {
            const expDate = new Date(b.expiryDate);
            const diffTime = expDate - today;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            const currentQty = parseFloat(b.currentQuantity) || 0;

            let status = 'Válido';
            if (currentQty <= 0) status = 'Esgotado';
            else if (diffDays < 0) status = 'Vencido';
            else if (diffDays <= 15) status = 'Urgente';
            else if (diffDays <= 45) status = 'Atenção';

            return {
              rawExpiry: b.expiryDate,
              validade: formatDateBR(b.expiryDate),
              insumo: b.itemName || '-',
              lote: b.batchNumber || '-',
              saldo: `${currentQty} ${b.unit || 'un'}`,
              dias: diffDays,
              status,
              fornecedor: b.supplierName || '-',
              nf: b.invoiceNumber || '-'
            };
          })
          .sort((a, b) => (a.rawExpiry || '').localeCompare(b.rawExpiry || ''));

        cols = [
          { header: 'Validade', key: 'validade' },
          { header: 'Insumo', key: 'insumo' },
          { header: 'Lote', key: 'lote' },
          { header: 'Saldo', key: 'saldo' },
          { header: 'Dias', key: 'dias' },
          { header: 'Status', key: 'status' },
          { header: 'Fornecedor', key: 'fornecedor' },
          { header: 'Nota', key: 'nf' }
        ];
        break;
      }

      // 4. ITENS CRÍTICOS & PONTO DE COMPRA
      case 'ITENS_CRITICOS': {
        data = items
          .map(it => {
            const stock = parseFloat(it.currentStock) || 0;
            const min = parseFloat(it.minStock) || 0;
            const deficit = Math.max(0, min - stock);
            const suggested = deficit > 0 ? Math.ceil(min * 1.5 - stock) : 0;

            let urgency = 'Normal';
            if (stock <= 0) urgency = 'Crítico (Zerado)';
            else if (stock <= min * 0.5) urgency = 'Alta Prioridade';
            else if (stock <= min) urgency = 'Ponto de Reposição';

            return {
              insumo: it.name || '-',
              categoria: it.category || 'Geral',
              estoque: stock,
              minimo: min,
              deficit,
              sugestao: suggested,
              urgencia: urgency
            };
          })
          .filter(it => it.estoque <= it.minimo || it.deficit > 0)
          .sort((a, b) => b.deficit - a.deficit);

        cols = [
          { header: 'Insumo', key: 'insumo' },
          { header: 'Categoria', key: 'categoria' },
          { header: 'Estoque', key: 'estoque' },
          { header: 'Mínimo', key: 'minimo' },
          { header: 'Déficit', key: 'deficit' },
          { header: 'Sugestão', key: 'sugestao' },
          { header: 'Urgência', key: 'urgencia' }
        ];
        break;
      }

      // 5. EXTRATO DE MOVIMENTAÇÕES (KARDEX)
      case 'KARDEX_MOVIMENTACOES': {
        data = transactions
          .filter(t => filterByDateRange(t, 'date'))
          .sort((a, b) => (b.date || '').localeCompare(a.date || ''))
          .map(t => ({
            data: formatDateTimeBR(t.date),
            tipo: t.type || 'Movimentação',
            insumo: t.itemName || '-',
            quantidade: `${t.quantity || 0} ${t.unit || 'un'}`,
            lote: t.batch || '-',
            operador: t.operator || 'Sistema',
            motivo: t.notes || '-'
          }));

        cols = [
          { header: 'Data', key: 'data' },
          { header: 'Tipo', key: 'tipo' },
          { header: 'Insumo', key: 'insumo' },
          { header: 'Quantidade', key: 'quantidade' },
          { header: 'Lote', key: 'lote' },
          { header: 'Operador', key: 'operador' },
          { header: 'Motivo', key: 'motivo' }
        ];
        break;
      }

      // 6. CONSUMO POR PACIENTE (RASTREABILIDADE INDIVIDUAL)
      case 'CONSUMO_PACIENTE': {
        data = patientDispensations
          .filter(d => filterByDateRange(d, 'date'))
          .sort((a, b) => (b.date || '').localeCompare(a.date || ''))
          .map(d => ({
            data: formatDateTimeBR(d.date),
            paciente: d.patientName || 'Paciente',
            medicamento: d.itemName || '-',
            quantidade: `${d.quantity || 0} ${d.unit || 'un'}`,
            lote: d.batchNumber || '-',
            validade: formatDateBR(d.expiryDate),
            solicitante: d.requestedBy || 'Enfermagem',
            farmacia: d.fulfilledBy || 'Farmácia',
            requisicao: d.requisitionCode || '-'
          }));

        cols = [
          { header: 'Data', key: 'data' },
          { header: 'Paciente', key: 'paciente' },
          { header: 'Medicamento', key: 'medicamento' },
          { header: 'Quantidade', key: 'quantidade' },
          { header: 'Lote', key: 'lote' },
          { header: 'Validade', key: 'validade' },
          { header: 'Solicitante', key: 'solicitante' },
          { header: 'Farmácia', key: 'farmacia' },
          { header: 'Requisição', key: 'requisicao' }
        ];
        break;
      }

      // 7. CONSUMO POR SETOR / SALÃO
      case 'CONSUMO_SETOR': {
        const sectorGroup = {};
        transactions
          .filter(t => filterByDateRange(t, 'date') && (t.type === 'Saída' || t.type === 'Dispensação'))
          .forEach(t => {
            const sec = t.sector || t.destinationLocationName || 'Salão de Hemodiálise';
            const key = `${sec}_${t.itemName}`;
            if (!sectorGroup[key]) {
              sectorGroup[key] = {
                setor: sec,
                insumo: t.itemName || '-',
                quantidade: 0,
                unit: t.unit || 'un',
                movs: 0,
                cost: parseFloat(t.costPrice || t.price) || 0
              };
            }
            sectorGroup[key].quantidade += parseFloat(t.quantity) || 0;
            sectorGroup[key].movs += 1;
            if (!sectorGroup[key].cost && (t.costPrice || t.price)) {
              sectorGroup[key].cost = parseFloat(t.costPrice || t.price);
            }
          });

        data = Object.values(sectorGroup).map(g => {
          const itemMatch = items.find(i => i.name === g.insumo);
          const unitPrice = g.cost || (itemMatch ? parseFloat(itemMatch.price) || 0 : 0);
          return {
            setor: g.setor,
            insumo: g.insumo,
            quantidade: `${g.quantidade} ${g.unit}`,
            movimentacoes: g.movs,
            custo: unitPrice,
            total: g.quantidade * unitPrice
          };
        }).sort((a, b) => b.total - a.total);

        cols = [
          { header: 'Setor', key: 'setor' },
          { header: 'Insumo', key: 'insumo' },
          { header: 'Quantidade', key: 'quantidade' },
          { header: 'Movimentações', key: 'movimentacoes' },
          { header: 'Custo', key: 'custo', format: 'currency' },
          { header: 'Total', key: 'total', format: 'currency' }
        ];
        break;
      }

      // 8. REQUISIÇÕES DA ENFERMAGEM
      case 'REQUISICOES_ENFERMAGEM': {
        data = (requisitions || [])
          .filter(r => filterByDateRange(r, 'createdAt'))
          .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
          .map(r => ({
            codigo: r.requisitionCode || `REQ-${r.id?.substring(0, 5)}`,
            data: formatDateTimeBR(r.createdAt),
            solicitante: r.requestedBy || 'Enfermagem',
            paciente: r.patientName || 'Salão Geral',
            itens: (r.items || []).length,
            status: r.status || 'Pendente',
            atendido: r.fulfillment?.fulfilledBy || '-'
          }));

        cols = [
          { header: 'Código', key: 'codigo' },
          { header: 'Data', key: 'data' },
          { header: 'Solicitante', key: 'solicitante' },
          { header: 'Paciente', key: 'paciente' },
          { header: 'Itens', key: 'itens' },
          { header: 'Status', key: 'status' },
          { header: 'Dispensado', key: 'atendido' }
        ];
        break;
      }

      // 9. ENTRADA DE NOTAS FISCAIS
      case 'ENTRADA_NOTAS': {
        data = (invoices || [])
          .filter(inv => filterByDateRange(inv, 'issueDate') || filterByDateRange(inv, 'createdAt'))
          .sort((a, b) => (b.issueDate || '').localeCompare(a.issueDate || ''))
          .map(inv => ({
            emissao: formatDateBR(inv.issueDate || inv.createdAt),
            nf: inv.number || '-',
            serie: inv.series || '1',
            fornecedor: inv.supplier || '-',
            itens: (inv.items || []).length,
            valor: parseFloat(inv.total) || 0,
            vencimento: inv.installments && inv.installments.length > 0 ? formatDateBR(inv.installments[0].dueDate) : '-'
          }));

        cols = [
          { header: 'Emissão', key: 'emissao' },
          { header: 'Nota', key: 'nf' },
          { header: 'Série', key: 'serie' },
          { header: 'Fornecedor', key: 'fornecedor' },
          { header: 'Itens', key: 'itens' },
          { header: 'Valor', key: 'valor', format: 'currency' },
          { header: 'Vencimento', key: 'vencimento' }
        ];
        break;
      }

      // 10. COMPRAS POR FORNECEDOR
      case 'COMPRAS_FORNECEDOR': {
        const suppMap = {};
        (invoices || []).forEach(inv => {
          const sName = inv.supplier || 'Fornecedor Avulso';
          if (!suppMap[sName]) {
            suppMap[sName] = {
              fornecedor: sName,
              cnpj: inv.supplierCnpj || '-',
              notas: 0,
              totalItens: 0,
              totalGasto: 0
            };
          }
          suppMap[sName].notas += 1;
          suppMap[sName].totalGasto += parseFloat(inv.total) || 0;
          suppMap[sName].totalItens += (inv.items || []).reduce((sum, it) => sum + (parseFloat(it.quantity) || 1), 0);
        });

        data = Object.values(suppMap).map(s => ({
          fornecedor: s.fornecedor,
          cnpj: s.cnpj,
          notas: s.notas,
          itens: s.totalItens,
          total: s.totalGasto,
          ticket: s.notas > 0 ? s.totalGasto / s.notas : 0
        })).sort((a, b) => b.total - a.total);

        cols = [
          { header: 'Fornecedor', key: 'fornecedor' },
          { header: 'CNPJ', key: 'cnpj' },
          { header: 'Notas', key: 'notas' },
          { header: 'Itens', key: 'itens' },
          { header: 'Total', key: 'total', format: 'currency' },
          { header: 'Ticket', key: 'ticket', format: 'currency' }
        ];
        break;
      }

      // 11. DOSSIÊ DE RECALL FARMACÊUTICO
      case 'DOSSIE_RECALL': {
        data = (productBatches || []).map(b => {
          const dispsWithBatch = patientDispensations.filter(d => 
            (d.batchId && d.batchId === b.id) || 
            (d.batchNumber && b.batchNumber && d.batchNumber.toLowerCase() === b.batchNumber.toLowerCase())
          );
          const totalDispensed = dispsWithBatch.reduce((sum, d) => sum + (parseFloat(d.quantity) || 0), 0);
          const distinctPatients = new Set(dispsWithBatch.map(d => d.patientName)).size;

          return {
            lote: b.batchNumber || '-',
            insumo: b.itemName || '-',
            validade: formatDateBR(b.expiryDate),
            fornecedor: b.supplierName || '-',
            nf: b.invoiceNumber || '-',
            comprado: parseFloat(b.initialQuantity) || 0,
            dispensado: totalDispensed,
            saldo: parseFloat(b.currentQuantity) || 0,
            pacientes: distinctPatients
          };
        }).sort((a, b) => b.pacientes - a.pacientes);

        cols = [
          { header: 'Lote', key: 'lote' },
          { header: 'Insumo', key: 'insumo' },
          { header: 'Validade', key: 'validade' },
          { header: 'Fornecedor', key: 'fornecedor' },
          { header: 'Nota', key: 'nf' },
          { header: 'Comprado', key: 'comprado' },
          { header: 'Dispensado', key: 'dispensado' },
          { header: 'Saldo', key: 'saldo' },
          { header: 'Pacientes', key: 'pacientes' }
        ];
        break;
      }

      // 12. TRANSFERÊNCIAS ENTRE LOCAIS
      case 'TRANSFERENCIAS_LOCAIS': {
        data = (transfers || [])
          .filter(t => filterByDateRange(t, 'createdAt') || filterByDateRange(t, 'date'))
          .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
          .map(t => ({
            data: formatDateTimeBR(t.createdAt || t.date),
            origem: t.originLocationName || 'Almoxarifado Central',
            destino: t.destinationLocationName || 'Farmácia Satélite',
            insumo: t.itemName || '-',
            quantidade: `${t.quantity || 0} ${t.unit || 'un'}`,
            lote: t.batch || '-',
            operador: t.operator || 'Operador',
            status: t.status || 'Concluído'
          }));

        cols = [
          { header: 'Data', key: 'data' },
          { header: 'Origem', key: 'origem' },
          { header: 'Destino', key: 'destino' },
          { header: 'Insumo', key: 'insumo' },
          { header: 'Quantidade', key: 'quantidade' },
          { header: 'Lote', key: 'lote' },
          { header: 'Operador', key: 'operador' },
          { header: 'Status', key: 'status' }
        ];
        break;
      }

      // 13. EMPRÉSTIMOS COM PARCEIROS
      case 'EMPRESTIMOS_PARCEIROS': {
        data = (loans || [])
          .filter(l => filterByDateRange(l, 'loanDate'))
          .sort((a, b) => (b.loanDate || '').localeCompare(a.loanDate || ''))
          .map(l => ({
            tipo: l.type === 'borrowed' ? 'Tomado (Entrada)' : 'Cedido (Saída)',
            insumo: l.productName || '-',
            parceiro: l.partnerName || '-',
            quantidade: `${l.quantity || 0} ${l.unit || 'un'}`,
            emprestimo: formatDateBR(l.loanDate),
            previsao: formatDateBR(l.expectedReturnDate),
            devolucao: formatDateBR(l.returnedDate),
            status: l.status === 'returned' ? 'Devolvido' : 'Pendente'
          }));

        cols = [
          { header: 'Tipo', key: 'tipo' },
          { header: 'Insumo', key: 'insumo' },
          { header: 'Parceiro', key: 'parceiro' },
          { header: 'Quantidade', key: 'quantidade' },
          { header: 'Empréstimo', key: 'emprestimo' },
          { header: 'Previsão', key: 'previsao' },
          { header: 'Devolução', key: 'devolucao' },
          { header: 'Status', key: 'status' }
        ];
        break;
      }

      // 14. ACURÁCIA DE INVENTÁRIO FÍSICO
      case 'ACURACIA_INVENTARIO': {
        data = (inventories || []).map(inv => {
          const itemsCounted = (inv.items || []).length;
          const divCount = (inv.divergences || []).length;
          const accuracy = itemsCounted > 0 
            ? (((itemsCounted - divCount) / itemsCounted) * 100).toFixed(1) + '%' 
            : '100%';

          return {
            inventario: inv.title || 'Inventário Geral',
            data: formatDateBR(inv.finalizedAt || inv.createdAt),
            local: inv.locationName || 'Almoxarifado Central',
            contados: itemsCounted,
            divergencias: divCount,
            acuracia: accuracy,
            status: inv.status || 'Finalizado'
          };
        }).sort((a, b) => (b.data || '').localeCompare(a.data || ''));

        cols = [
          { header: 'Inventário', key: 'inventario' },
          { header: 'Data', key: 'data' },
          { header: 'Local', key: 'local' },
          { header: 'Contados', key: 'contados' },
          { header: 'Divergências', key: 'divergencias' },
          { header: 'Acurácia', key: 'acuracia' },
          { header: 'Status', key: 'status' }
        ];
        break;
      }

      // 15. PREVISÃO DE CONSUMO & GIRO
      case 'PREVISAO_DEMANDA': {
        data = items
          .filter(it => filterItemCategory(it.category || 'Geral'))
          .map(it => {
            const stock = parseFloat(it.currentStock) || 0;
            const unitPrice = parseFloat(it.price) || 0;
            const min = parseFloat(it.minStock) || 10;
            
            // Consumo estimado mensal baseado no histórico ou estoque mínimo
            const monthlyConsumption = min > 0 ? min * 2 : 20;
            const dailyConsumption = monthlyConsumption / 30;
            const daysCoverage = dailyConsumption > 0 ? Math.floor(stock / dailyConsumption) : 999;
            
            const need30d = Math.max(0, Math.ceil(monthlyConsumption - stock));
            const need60d = Math.max(0, Math.ceil((monthlyConsumption * 2) - stock));
            const estCost = need30d * unitPrice;

            return {
              insumo: it.name || '-',
              categoria: it.category || 'Geral',
              estoque: stock,
              media: `${monthlyConsumption} ${it.unit || 'un'}/mês`,
              cobertura: `${daysCoverage} dias`,
              compra_30d: `${need30d} ${it.unit || 'un'}`,
              compra_60d: `${need60d} ${it.unit || 'un'}`,
              custo_estimado: estCost
            };
          })
          .sort((a, b) => b.custo_estimado - a.custo_estimado);

        cols = [
          { header: 'Insumo', key: 'insumo' },
          { header: 'Categoria', key: 'categoria' },
          { header: 'Estoque', key: 'estoque' },
          { header: 'Consumo', key: 'media' },
          { header: 'Cobertura', key: 'cobertura' },
          { header: 'Compra 30d', key: 'compra_30d' },
          { header: 'Compra 60d', key: 'compra_60d' },
          { header: 'Investimento', key: 'custo_estimado', format: 'currency' }
        ];
        break;
      }

      default:
        break;
    }

    setReportData(data);
    setReportColumns(cols);
  };

  const getReportName = () => REPORTS.find(r => r.id === selectedReport)?.name || 'Relatório de Estoque';

  const exportPDF = () => {
    const doc = new jsPDF('landscape');
    const title = getReportName();
    
    // Header
    doc.setFontSize(14);
    doc.text(tenantSettings.name || 'Nexa Clínica - NexaSTOCK', 14, 15);
    doc.setFontSize(9);
    doc.text(`CNPJ: ${tenantSettings.cnpj || '00.000.000/0001-00'} | Módulo Estoque, Farmácia & Logística`, 14, 21);
    doc.text(`Relatório: ${title}`, 14, 27);
    doc.text(`Período: ${formatDateBR(startDate)} a ${formatDateBR(endDate)} | Categoria: ${categoryFilter} | Setor: ${sectorFilter}`, 14, 33);

    const tableColumn = reportColumns.map(c => c.header);
    const tableRows = reportData.map(row => 
      reportColumns.map(col => {
        let val = row[col.key];
        if (col.format === 'currency') {
          return typeof val === 'number'
            ? val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
            : val;
        }
        return val ?? '-';
      })
    );

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 38,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [2, 132, 199] }, // sky-600
      alternateRowStyles: { fillColor: [248, 250, 252] }
    });

    doc.save(`${title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
  };

  const exportXLS = () => {
    const title = getReportName();
    const wsData = reportData.map(row => {
      const newRow = {};
      reportColumns.forEach(col => {
        let val = row[col.key];
        if (col.format === 'currency') {
          // Export pure float number so Excel can do calculations without text R$
          val = typeof val === 'number' ? Number(val.toFixed(2)) : (parseFloat(val) || 0);
        }
        newRow[col.header] = val;
      });
      return newRow;
    });

    const ws = XLSX.utils.json_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Estoque");
    
    XLSX.writeFile(wb, `${title.replace(/[^a-zA-Z0-9]/g, '_')}.xlsx`);
  };

  const categoriesAvailable = ['Todas', ...new Set(items.map(i => i.category).filter(Boolean))];
  const sectorsAvailable = ['Todos', ...new Set((sectors || []).map(s => s.name).filter(Boolean))];

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem', color: '#0f172a' }}>
              <FileText size={22} color="#0284c7" /> Central de Relatórios de Estoque & Farmácia
            </h2>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>
              Auditorias operacionais, curva ABC, rastreabilidade de lotes, recall e projeções de compras.
            </p>
          </div>
          <button onClick={onClose} style={styles.closeBtn} title="Fechar">
            <X size={24} />
          </button>
        </div>

        <div style={styles.body}>
          {/* Sidebar */}
          <div style={styles.sidebar}>
            <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              15 Relatórios Clínicos & Físicos
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', overflowY: 'auto', maxHeight: 'calc(100vh - 200px)', paddingRight: '0.5rem' }}>
              {REPORTS.map(r => {
                const isSelected = selectedReport === r.id;
                const Icon = r.icon;
                return (
                  <button 
                    key={r.id} 
                    onClick={() => setSelectedReport(r.id)}
                    style={{ 
                      ...styles.reportBtn, 
                      backgroundColor: isSelected ? '#e0f2fe' : 'transparent', 
                      color: isSelected ? '#0369a1' : '#475569', 
                      borderLeft: isSelected ? '3px solid #0284c7' : '3px solid transparent' 
                    }}
                  >
                    <Icon size={16} />
                    <span style={{ fontSize: '0.85rem', fontWeight: isSelected ? '700' : '500', textAlign: 'left' }}>{r.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Area */}
          <div style={styles.main}>
            {/* Filters */}
            <div style={styles.filtersBar}>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={styles.filterGroup}>
                  <label style={styles.label}>Data Inicial</label>
                  <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={styles.input} />
                </div>
                <div style={styles.filterGroup}>
                  <label style={styles.label}>Data Final</label>
                  <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={styles.input} />
                </div>
                <div style={styles.filterGroup}>
                  <label style={styles.label}>Categoria</label>
                  <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} style={styles.input}>
                    {categoriesAvailable.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div style={styles.filterGroup}>
                  <label style={styles.label}>Setor</label>
                  <select value={sectorFilter} onChange={e => setSectorFilter(e.target.value)} style={styles.input}>
                    {sectorsAvailable.map(sec => (
                      <option key={sec} value={sec}>{sec}</option>
                    ))}
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#0f172a', fontWeight: '800' }}>
                  {getReportName()}
                </h3>
                <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>
                  {reportData.length} registro(s) encontrado(s)
                </span>
              </div>

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
                          val = typeof val === 'number' 
                            ? `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` 
                            : val;
                        }
                        if (val === undefined || val === null) val = '-';
                        return <td key={col.key} style={styles.td}>{val}</td>;
                      })}
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={reportColumns.length || 1} style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                        Nenhum registro localizado para os filtros selecionados.
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
    width: '100%', maxWidth: '1440px',
    height: '100%', maxHeight: '92vh',
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
    width: '300px',
    borderRight: '1px solid #e2e8f0',
    backgroundColor: '#f8fafc',
    padding: '1rem',
    display: 'flex', flexDirection: 'column'
  },
  reportBtn: {
    display: 'flex', alignItems: 'center', gap: '0.65rem',
    padding: '0.7rem 0.85rem', borderRadius: '8px', cursor: 'pointer',
    borderTop: 'none', borderRight: 'none', borderBottom: 'none',
    transition: 'all 0.2s'
  },
  main: {
    flex: 1, display: 'flex', flexDirection: 'column',
    backgroundColor: '#ffffff'
  },
  filtersBar: {
    padding: '1rem 1.5rem',
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
    padding: '0.45rem 0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1',
    fontSize: '0.85rem', color: '#0f172a', outline: 'none', minWidth: '130px'
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
    textAlign: 'left', padding: '0.75rem 0.85rem', borderBottom: '2px solid #e2e8f0',
    color: '#475569', fontSize: '0.78rem', fontWeight: '700', textTransform: 'uppercase'
  },
  td: {
    padding: '0.7rem 0.85rem', fontSize: '0.85rem', color: '#0f172a', verticalAlign: 'middle'
  }
};
