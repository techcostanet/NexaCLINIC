import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, FileText, Download, FileSpreadsheet, Calendar, 
  Wrench, Activity, DollarSign, Printer, ShieldCheck,
  Clock, CheckCircle2, AlertTriangle, HardDrive,
  Laptop, Settings, RefreshCw, Search, Layers, Cpu
} from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { dbService } from '../../firebase';

export default function MaintenanceReportsModal({
  isOpen,
  onClose,
  equipments = [],
  serviceOrders = [],
  itOrders = [],
  stockItems = [],
  currentUser
}) {
  const [activeSection, setActiveSection] = useState('ALL'); // 'ALL' | 'ATIVOS' | 'PREVENTIVA' | 'CUSTOS' | 'TI'
  const [selectedReport, setSelectedReport] = useState('MAINT_CENSO_ATIVOS');

  // Filtros
  const [sectorFilter, setSectorFilter] = useState('Todos');
  const [categoryFilter, setCategoryFilter] = useState('Todas');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [searchFilter, setSearchFilter] = useState('');

  // Configurações da Clínica
  const [tenantSettings, setTenantSettings] = useState({ 
    name: 'Nexa Clínica & Nefrologia', 
    cnpj: '00.000.000/0001-00', 
    logo: '' 
  });

  useEffect(() => {
    let isMounted = true;
    const loadTenant = async () => {
      try {
        if (dbService.getTenantSettings) {
          const s = await dbService.getTenantSettings();
          if (isMounted && s) setTenantSettings(s);
        }
      } catch (err) {
        console.error('Erro ao carregar dados da clínica:', err);
      }
    };
    loadTenant();
    return () => { isMounted = false; };
  }, []);

  // Catálogo de 12 Relatórios Especializados de Manutenção
  const REPORTS = [
    // Seção Ativos
    {
      id: 'MAINT_CENSO_ATIVOS',
      section: 'ATIVOS',
      num: 1,
      title: '1. Censo Geral de Ativos & Patrimônio',
      desc: 'Inventário completo de equipamentos biomédicos, prediais e tecnológicos com marca, modelo e setor.',
      badge: 'Ativos',
      badgeColor: '#0891b2',
      icon: HardDrive
    },
    {
      id: 'MAINT_HEMODIALISE_OSMOSE',
      section: 'ATIVOS',
      num: 2,
      title: '2. Máquinas de Hemodiálise & Osmose',
      desc: 'Relação especializada dos ativos vitais de terapia renal substitutiva e tratamento de água.',
      badge: 'Crítico',
      badgeColor: '#dc2626',
      icon: Activity
    },
    {
      id: 'MAINT_INVENTARIO_TI',
      section: 'ATIVOS',
      num: 3,
      title: '3. Inventário de T.I. & Periféricos',
      desc: 'Desktops, notebooks, impressoras de prescrição, etiquetadoras térmicas e infraestrutura de rede.',
      badge: 'T.I.',
      badgeColor: '#6366f1',
      icon: Laptop
    },
    {
      id: 'MAINT_INOPERANTES_CRITICOS',
      section: 'ATIVOS',
      num: 4,
      title: '4. Ativos Inoperantes & em Risco',
      desc: 'Equipamentos fora de operação, aguardando peças ou com impacto assistencial direto.',
      badge: 'Segurança',
      badgeColor: '#b91c1c',
      icon: AlertTriangle
    },

    // Seção Preventiva
    {
      id: 'MAINT_PLANO_PREVENTIVAS',
      section: 'PREVENTIVA',
      num: 5,
      title: '5. Plano Anual de Preventivas & Cronograma',
      desc: 'Cronograma programado de manutenções preventivas, prazos de ciclo e situação de execução.',
      badge: 'Preventiva',
      badgeColor: '#10b981',
      icon: Calendar
    },
    {
      id: 'MAINT_VALIDADE_CALIBRACAO',
      section: 'PREVENTIVA',
      num: 6,
      title: '6. Validade de Calibração & Certificados',
      desc: 'Controle de calibração metrológica de balanças, monitores e equipamentos com vencimento rastreado.',
      badge: 'Qualidade',
      badgeColor: '#0d9488',
      icon: ShieldCheck
    },
    {
      id: 'MAINT_HISTORICO_INTERVENCOES',
      section: 'PREVENTIVA',
      num: 7,
      title: '7. Histórico de Intervenções por Ativo',
      desc: 'Volume acumulado de ordens de serviço e índice de confiabilidade por equipamento.',
      badge: 'Engenharia',
      badgeColor: '#4f46e5',
      icon: Clock
    },

    // Seção Custos
    {
      id: 'MAINT_EXTRATO_ORDENS',
      section: 'CUSTOS',
      num: 8,
      title: '8. Extrato Geral de Ordens de Serviço (OS)',
      desc: 'Relação detalhada de chamados abertos, em execução e finalizados com técnicos e solicitantes.',
      badge: 'Ordens',
      badgeColor: '#2563eb',
      icon: FileText
    },
    {
      id: 'MAINT_CUSTOS_SETORES',
      section: 'CUSTOS',
      num: 9,
      title: '9. Custos de Manutenção por Setor & Ativo',
      desc: 'Demonstrativo financeiro de despesas com manutenção, rateado entre mão de obra e insumos.',
      badge: 'Custos',
      badgeColor: '#059669',
      icon: DollarSign
    },
    {
      id: 'MAINT_PECA_ESTOQUE',
      section: 'CUSTOS',
      num: 10,
      title: '10. Auditoria de Peças Utilizadas do Estoque',
      desc: 'Histórico de componentes, filtros e materiais de reposição retirados do almoxarifado/farmácia.',
      badge: 'Insumos',
      badgeColor: '#f59e0b',
      icon: Layers
    },

    // Seção T.I.
    {
      id: 'MAINT_CHAMADOS_TI_SLA',
      section: 'TI',
      num: 11,
      title: '11. Extrato de Chamados de T.I. & SLA',
      desc: 'Auditoria de tickets de sistemas, redes, hardware e acessos com tempo de resolução vs SLA previsto.',
      badge: 'SLA T.I.',
      badgeColor: '#8b5cf6',
      icon: Cpu
    },
    {
      id: 'MAINT_PRODUTIVIDADE_TECNICA',
      section: 'TI',
      num: 12,
      title: '12. Produtividade & Desempenho Técnico',
      desc: 'Quantidade de ordens atendidas por técnico, média de horas por chamado e taxa de resolução.',
      badge: 'Equipe',
      badgeColor: '#3b82f6',
      icon: CheckCircle2
    }
  ];

  // Setores disponíveis
  const availableSectors = useMemo(() => {
    const s = new Set();
    equipments.forEach(e => { if (e.sector) s.add(e.sector); });
    serviceOrders.forEach(o => { if (o.sector) s.add(o.sector); if (o.requesterSector) s.add(o.requesterSector); });
    return Array.from(s).sort();
  }, [equipments, serviceOrders]);

  // Filtragem dos cartões de relatório por categoria
  const filteredReportsList = useMemo(() => {
    if (activeSection === 'ALL') return REPORTS;
    return REPORTS.filter(r => r.section === activeSection);
  }, [activeSection]);

  const currentReportMeta = useMemo(() => {
    return REPORTS.find(r => r.id === selectedReport) || REPORTS[0];
  }, [selectedReport]);

  // Auxiliares
  const formatCurrency = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(val) || 0);
  const formatDateBR = (dateStr) => {
    if (!dateStr) return '--';
    const [y, m, d] = dateStr.split('-');
    if (!d || !m || !y) {
      try {
        return new Date(dateStr).toLocaleDateString('pt-BR');
      } catch {
        return dateStr;
      }
    }
    return `${d}/${m}/${y}`;
  };

  // Processamento dos dados do relatório selecionado
  const reportData = useMemo(() => {
    let data = [];
    let cols = [];
    let kpis = [];

    const todayStr = new Date().toISOString().split('T')[0];

    // Filtro base de equipamentos
    let eqFiltered = [...equipments];
    if (sectorFilter !== 'Todos') eqFiltered = eqFiltered.filter(e => e.sector === sectorFilter);
    if (categoryFilter !== 'Todas') eqFiltered = eqFiltered.filter(e => e.category === categoryFilter);
    if (statusFilter !== 'Todos') eqFiltered = eqFiltered.filter(e => e.status === statusFilter);
    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase();
      eqFiltered = eqFiltered.filter(e => 
        (e.name || '').toLowerCase().includes(q) ||
        (e.code || '').toLowerCase().includes(q) ||
        (e.brand || '').toLowerCase().includes(q) ||
        (e.model || '').toLowerCase().includes(q) ||
        (e.serialNumber || '').toLowerCase().includes(q)
      );
    }

    // Filtro base de ordens de serviço
    let ordersFiltered = [...serviceOrders];
    if (sectorFilter !== 'Todos') ordersFiltered = ordersFiltered.filter(o => o.sector === sectorFilter || o.requesterSector === sectorFilter);
    if (categoryFilter !== 'Todas') ordersFiltered = ordersFiltered.filter(o => o.equipmentCategory === categoryFilter);
    if (statusFilter !== 'Todos') ordersFiltered = ordersFiltered.filter(o => o.status === statusFilter);
    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase();
      ordersFiltered = ordersFiltered.filter(o => 
        (o.code || '').toLowerCase().includes(q) ||
        (o.equipmentName || '').toLowerCase().includes(q) ||
        (o.description || '').toLowerCase().includes(q) ||
        (o.assignedTechnician || '').toLowerCase().includes(q)
      );
    }

    switch (selectedReport) {
      case 'MAINT_CENSO_ATIVOS': {
        cols = [
          { header: 'Patrimônio', key: 'code' },
          { header: 'Equipamento', key: 'name' },
          { header: 'Categoria', key: 'category' },
          { header: 'Marca / Modelo', key: 'brandModel' },
          { header: 'Série', key: 'serial' },
          { header: 'Setor', key: 'sector' },
          { header: 'Status', key: 'status' }
        ];

        data = eqFiltered.map(e => ({
          code: e.code || 'EQ-000',
          name: e.name || 'Sem nome',
          category: e.category || 'Biomédico',
          brandModel: `${e.brand || ''} ${e.model ? '- ' + e.model : ''}`.trim() || 'N/A',
          serial: e.serialNumber || 'N/A',
          sector: e.sector || 'Geral',
          status: e.status || 'Em Operação'
        }));

        kpis = [
          { label: 'Total de Ativos', value: data.length, color: '#0891b2' },
          { label: 'Em Operação', value: data.filter(d => d.status === 'Em Operação').length, color: '#10b981' },
          { label: 'Em Manutenção', value: data.filter(d => d.status === 'Em Manutenção').length, color: '#f59e0b' },
          { label: 'Inoperantes', value: data.filter(d => d.status === 'Inoperante').length, color: '#ef4444' }
        ];
        break;
      }

      case 'MAINT_HEMODIALISE_OSMOSE': {
        cols = [
          { header: 'Patrimônio', key: 'code' },
          { header: 'Máquina / Equipamento', key: 'name' },
          { header: 'Fabricante', key: 'brand' },
          { header: 'Série', key: 'serial' },
          { header: 'Setor / Sala', key: 'sector' },
          { header: 'Próx. Preventiva', key: 'nextPrev' },
          { header: 'Situação', key: 'status' }
        ];

        const renalList = eqFiltered.filter(e => {
          const str = `${e.name || ''} ${e.category || ''} ${e.subcategory || ''}`.toLowerCase();
          return str.includes('diálise') || str.includes('hemodiálise') || str.includes('osmose') || str.includes('cta') || str.includes('bomba');
        });

        data = renalList.map(e => ({
          code: e.code,
          name: e.name,
          brand: e.brand || 'N/A',
          serial: e.serialNumber || 'N/A',
          sector: e.sector || 'Salão',
          nextPrev: formatDateBR(e.nextPreventiveDate),
          status: e.status || 'Em Operação'
        }));

        const inop = data.filter(d => d.status === 'Inoperante' || d.status === 'Em Manutenção').length;
        kpis = [
          { label: 'Máquinas de Diálise & Osmose', value: data.length, color: '#0891b2' },
          { label: 'Disponíveis no Posto', value: data.length - inop, color: '#10b981' },
          { label: 'Máquinas Paradas / Reparo', value: inop, color: inop > 0 ? '#ef4444' : '#10b981' }
        ];
        break;
      }

      case 'MAINT_INVENTARIO_TI': {
        cols = [
          { header: 'Patrimônio', key: 'code' },
          { header: 'Dispositivo', key: 'name' },
          { header: 'Subtipo', key: 'subtype' },
          { header: 'Fabricante', key: 'brand' },
          { header: 'Local / Setor', key: 'sector' },
          { header: 'Série', key: 'serial' },
          { header: 'Status', key: 'status' }
        ];

        const itList = eqFiltered.filter(e => {
          const str = `${e.name || ''} ${e.category || ''} ${e.subcategory || ''}`.toLowerCase();
          return str.includes('t.i') || str.includes('ti') || str.includes('computador') || str.includes('desktop') || str.includes('impressora') || str.includes('zebra') || str.includes('scanner') || str.includes('leitor');
        });

        data = itList.map(e => ({
          code: e.code,
          name: e.name,
          subtype: e.subcategory || 'Hardware',
          brand: e.brand || 'N/A',
          sector: e.sector || 'Geral',
          serial: e.serialNumber || 'N/A',
          status: e.status || 'Em Operação'
        }));

        kpis = [
          { label: 'Ativos de T.I. Mapeados', value: data.length, color: '#6366f1' },
          { label: 'Operacionais', value: data.filter(d => d.status === 'Em Operação').length, color: '#10b981' },
          { label: 'Em Suporte Técnico', value: data.filter(d => d.status !== 'Em Operação').length, color: '#f59e0b' }
        ];
        break;
      }

      case 'MAINT_INOPERANTES_CRITICOS': {
        cols = [
          { header: 'Patrimônio', key: 'code' },
          { header: 'Equipamento', key: 'name' },
          { header: 'Setor Afetado', key: 'sector' },
          { header: 'Categoria', key: 'category' },
          { header: 'Criticidade', key: 'criticality' },
          { header: 'Status Atual', key: 'status' }
        ];

        const inopList = eqFiltered.filter(e => e.status === 'Inoperante' || e.status === 'Em Manutenção');

        data = inopList.map(e => ({
          code: e.code,
          name: e.name,
          sector: e.sector,
          category: e.category,
          criticality: e.criticality || 'Alta',
          status: e.status
        }));

        kpis = [
          { label: 'Total Inoperantes / Reparo', value: data.length, color: '#ef4444' },
          { label: 'Criticidade Alta/Crítica', value: data.filter(d => d.criticality === 'Alta' || d.criticality === 'Crítica').length, color: '#b91c1c' },
          { label: 'Impacto Assistencial', value: data.filter(d => (d.sector || '').includes('Salão') || (d.sector || '').includes('Hemodiálise')).length, color: '#f59e0b' }
        ];
        break;
      }

      case 'MAINT_PLANO_PREVENTIVAS': {
        cols = [
          { header: 'Patrimônio', key: 'code' },
          { header: 'Ativo', key: 'name' },
          { header: 'Setor', key: 'sector' },
          { header: 'Periodicidade', key: 'interval' },
          { header: 'Última Executada', key: 'lastDate' },
          { header: 'Próxima Preventiva', key: 'nextDate' },
          { header: 'Situação', key: 'situation' }
        ];

        data = eqFiltered.map(e => {
          const isOverdue = e.nextPreventiveDate && e.nextPreventiveDate < todayStr;
          return {
            code: e.code,
            name: e.name,
            sector: e.sector,
            interval: `${e.preventiveIntervalDays || 90} dias`,
            lastDate: formatDateBR(e.lastPreventiveDate),
            nextDate: formatDateBR(e.nextPreventiveDate),
            situation: !e.nextPreventiveDate ? 'Não Programada' : isOverdue ? 'Atrasada' : 'Em Dia'
          };
        });

        const atrasadas = data.filter(d => d.situation === 'Atrasada').length;
        const emDia = data.filter(d => d.situation === 'Em Dia').length;

        kpis = [
          { label: 'Preventivas em Dia', value: emDia, color: '#10b981' },
          { label: 'Preventivas Atrasadas', value: atrasadas, color: atrasadas > 0 ? '#ef4444' : '#10b981' },
          { label: 'Não Programadas', value: data.filter(d => d.situation === 'Não Programada').length, color: '#64748b' }
        ];
        break;
      }

      case 'MAINT_VALIDADE_CALIBRACAO': {
        cols = [
          { header: 'Patrimônio', key: 'code' },
          { header: 'Equipamento', key: 'name' },
          { header: 'Marca', key: 'brand' },
          { header: 'Setor', key: 'sector' },
          { header: 'Validade Certificado', key: 'validUntil' },
          { header: 'Status Calibração', key: 'status' }
        ];

        const calibList = eqFiltered.filter(e => e.requiresCalibration);

        data = calibList.map(e => {
          const isExpired = e.calibrationValidUntil && e.calibrationValidUntil < todayStr;
          return {
            code: e.code,
            name: e.name,
            brand: e.brand || 'N/A',
            sector: e.sector || 'Geral',
            validUntil: formatDateBR(e.calibrationValidUntil),
            status: !e.calibrationValidUntil ? 'Pendente' : isExpired ? 'Vencida' : 'Válida'
          };
        });

        const venc = data.filter(d => d.status === 'Vencida').length;
        kpis = [
          { label: 'Equipamentos com Calibração', value: data.length, color: '#0891b2' },
          { label: 'Certificados Válidos', value: data.filter(d => d.status === 'Válida').length, color: '#10b981' },
          { label: 'Certificados Vencidos', value: venc, color: venc > 0 ? '#ef4444' : '#10b981' }
        ];
        break;
      }

      case 'MAINT_HISTORICO_INTERVENCOES': {
        cols = [
          { header: 'Patrimônio', key: 'code' },
          { header: 'Equipamento', key: 'name' },
          { header: 'Setor', key: 'sector' },
          { header: 'Total de OS', key: 'osCount' },
          { header: 'Corretivas', key: 'corrective' },
          { header: 'Preventivas', key: 'preventive' },
          { header: 'Custo Acumulado', key: 'totalCost' }
        ];

        data = eqFiltered.map(e => {
          const eqOrders = serviceOrders.filter(o => o.equipmentId === e.id);
          const corr = eqOrders.filter(o => o.type === 'Corretiva').length;
          const prev = eqOrders.filter(o => o.type === 'Preventiva').length;
          const cost = eqOrders.reduce((sum, o) => sum + (Number(o.totalCost) || 0), 0);

          return {
            code: e.code,
            name: e.name,
            sector: e.sector,
            osCount: eqOrders.length,
            corrective: corr,
            preventive: prev,
            totalCost: formatCurrency(cost)
          };
        }).sort((a, b) => b.osCount - a.osCount);

        const totalInterv = data.reduce((s, d) => s + d.osCount, 0);
        kpis = [
          { label: 'Total de Intervenções', value: totalInterv, color: '#0891b2' },
          { label: 'Média OS/Equipamento', value: data.length > 0 ? (totalInterv / data.length).toFixed(1) : 0, color: '#6366f1' },
          { label: 'Ativos sem Intervenção', value: data.filter(d => d.osCount === 0).length, color: '#10b981' }
        ];
        break;
      }

      case 'MAINT_EXTRATO_ORDENS': {
        cols = [
          { header: 'Código OS', key: 'code' },
          { header: 'Data Abertura', key: 'openDate' },
          { header: 'Ativo', key: 'equipment' },
          { header: 'Tipo', key: 'type' },
          { header: 'SLA / Prioridade', key: 'priority' },
          { header: 'Solicitante', key: 'requester' },
          { header: 'Técnico', key: 'technician' },
          { header: 'Status', key: 'status' }
        ];

        data = ordersFiltered.map(o => ({
          code: o.code,
          openDate: formatDateBR(o.openDate),
          equipment: o.equipmentName || 'Geral',
          type: o.type,
          priority: o.priority,
          requester: `${o.requesterName || ''} (${o.requesterSector || ''})`,
          technician: o.assignedTechnician || 'Aguardando',
          status: o.status
        }));

        kpis = [
          { label: 'Total de Chamados', value: data.length, color: '#2563eb' },
          { label: 'Abertos / Em Andamento', value: data.filter(d => d.status !== 'Concluída').length, color: '#f59e0b' },
          { label: 'Concluídos', value: data.filter(d => d.status === 'Concluída').length, color: '#10b981' }
        ];
        break;
      }

      case 'MAINT_CUSTOS_SETORES': {
        cols = [
          { header: 'Setor', key: 'sector' },
          { header: 'OS Realizadas', key: 'orders' },
          { header: 'Mão de Obra', key: 'labor' },
          { header: 'Peças & Insumos', key: 'parts' },
          { header: 'Custo Total', key: 'total' }
        ];

        const sectorMap = {};
        ordersFiltered.forEach(o => {
          const sec = o.sector || o.requesterSector || 'Geral';
          if (!sectorMap[sec]) sectorMap[sec] = { orders: 0, labor: 0, parts: 0, total: 0 };
          sectorMap[sec].orders++;
          const lCost = Number(o.laborCost) || 0;
          const tCost = Number(o.totalCost) || 0;
          const pCost = Math.max(0, tCost - lCost);
          sectorMap[sec].labor += lCost;
          sectorMap[sec].parts += pCost;
          sectorMap[sec].total += tCost;
        });

        data = Object.keys(sectorMap).map(sec => ({
          sector: sec,
          orders: sectorMap[sec].orders,
          labor: formatCurrency(sectorMap[sec].labor),
          parts: formatCurrency(sectorMap[sec].parts),
          total: formatCurrency(sectorMap[sec].total),
          _rawTotal: sectorMap[sec].total
        })).sort((a, b) => b._rawTotal - a._rawTotal);

        const grandTotal = Object.values(sectorMap).reduce((s, v) => s + v.total, 0);
        kpis = [
          { label: 'Despesa Total Acumulada', value: formatCurrency(grandTotal), color: '#059669' },
          { label: 'Setores com Manutenção', value: data.length, color: '#0891b2' },
          { label: 'Média por Setor', value: data.length > 0 ? formatCurrency(grandTotal / data.length) : 'R$ 0,00', color: '#6366f1' }
        ];
        break;
      }

      case 'MAINT_PECA_ESTOQUE': {
        cols = [
          { header: 'Código OS', key: 'osCode' },
          { header: 'Equipamento', key: 'equipment' },
          { header: 'Item / Peça Utilizada', key: 'itemName' },
          { header: 'Qtd.', key: 'quantity' },
          { header: 'Custo Unit.', key: 'unitCost' },
          { header: 'Custo Total', key: 'totalCost' }
        ];

        const partsList = [];
        ordersFiltered.forEach(o => {
          if (o.partsUsed && Array.isArray(o.partsUsed)) {
            o.partsUsed.forEach(p => {
              partsList.push({
                osCode: o.code,
                equipment: o.equipmentName || 'Geral',
                itemName: p.name || 'Componente',
                quantity: p.quantity || 1,
                unitCost: formatCurrency(p.unitCost || 0),
                totalCost: formatCurrency((p.quantity || 1) * (p.unitCost || 0)),
                _rawCost: (p.quantity || 1) * (p.unitCost || 0)
              });
            });
          }
        });

        data = partsList;
        const totalPartsCost = data.reduce((s, p) => s + p._rawCost, 0);
        kpis = [
          { label: 'Peças Aplicadas', value: data.length, color: '#f59e0b' },
          { label: 'Custo Total em Peças', value: formatCurrency(totalPartsCost), color: '#059669' },
          { label: 'OSs com Aplicação de Peça', value: new Set(data.map(d => d.osCode)).size, color: '#0891b2' }
        ];
        break;
      }

      case 'MAINT_CHAMADOS_TI_SLA': {
        cols = [
          { header: 'Ticket T.I.', key: 'code' },
          { header: 'Título / Descrição', key: 'title' },
          { header: 'Categoria', key: 'category' },
          { header: 'Setor', key: 'sector' },
          { header: 'SLA Limite', key: 'sla' },
          { header: 'Técnico Responsável', key: 'tech' },
          { header: 'Status', key: 'status' }
        ];

        const itOrdersList = itOrders || [];
        data = itOrdersList.map(t => ({
          code: t.code || `TI-${t.id?.substring(0, 5)}`,
          title: t.title || t.description || 'Chamado de suporte',
          category: t.category || 'Hardware',
          sector: t.sector || 'Geral',
          sla: `${t.priority || 'Média'} (${t.priority === 'Crítico' ? '2h' : t.priority === 'Alta' ? '8h' : '24h'})`,
          tech: t.assignedTechnician || 'Não atribuído',
          status: t.status || 'Aberta'
        }));

        kpis = [
          { label: 'Total de Tickets T.I.', value: data.length, color: '#8b5cf6' },
          { label: 'Em Aberto / Triagem', value: data.filter(d => d.status !== 'Concluída' && d.status !== 'Encerrada').length, color: '#f59e0b' },
          { label: 'Resolvidos', value: data.filter(d => d.status === 'Concluída' || d.status === 'Encerrada').length, color: '#10b981' }
        ];
        break;
      }

      case 'MAINT_PRODUTIVIDADE_TECNICA': {
        cols = [
          { header: 'Técnico / Responsável', key: 'technician' },
          { header: 'OS Atendidas', key: 'totalOrders' },
          { header: 'Concluídas', key: 'completed' },
          { header: 'Em Andamento', key: 'inProgress' },
          { header: 'Taxa de Resolução', key: 'resolutionRate' }
        ];

        const techMap = {};
        ordersFiltered.forEach(o => {
          const tech = o.assignedTechnician || 'Não Atribuído';
          if (!techMap[tech]) techMap[tech] = { total: 0, completed: 0, inProgress: 0 };
          techMap[tech].total++;
          if (o.status === 'Concluída') techMap[tech].completed++;
          else techMap[tech].inProgress++;
        });

        data = Object.keys(techMap).map(tech => {
          const t = techMap[tech];
          const rate = t.total > 0 ? Math.round((t.completed / t.total) * 100) : 0;
          return {
            technician: tech,
            totalOrders: t.total,
            completed: t.completed,
            inProgress: t.inProgress,
            resolutionRate: `${rate}%`
          };
        }).sort((a, b) => b.totalOrders - a.totalOrders);

        const totalCompleted = data.reduce((s, d) => s + d.completed, 0);
        kpis = [
          { label: 'Técnicos Ativos', value: data.filter(d => d.technician !== 'Não Atribuído').length, color: '#3b82f6' },
          { label: 'OS Concluídas no Período', value: totalCompleted, color: '#10b981' },
          { label: 'Média de Resolução', value: data.length > 0 ? `${Math.round((totalCompleted / ordersFiltered.length || 1) * 100)}%` : '0%', color: '#0891b2' }
        ];
        break;
      }

      default:
        break;
    }

    return { cols, data, kpis };
  }, [selectedReport, equipments, serviceOrders, itOrders, sectorFilter, categoryFilter, statusFilter, searchFilter]);

  // Exportação em Excel
  const handleExportExcel = () => {
    if (!reportData.data || reportData.data.length === 0) {
      alert('Não há dados disponíveis para exportação com os filtros atuais.');
      return;
    }

    const cleanData = reportData.data.map(item => {
      const row = {};
      reportData.cols.forEach(col => {
        row[col.header] = item[col.key] || '';
      });
      return row;
    });

    const worksheet = XLSX.utils.json_to_sheet(cleanData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Relatório');

    const fileName = `${currentReportMeta.id}_${new Date().toISOString().substring(0, 10)}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  // Exportação em PDF
  const handleExportPDF = () => {
    if (!reportData.data || reportData.data.length === 0) {
      alert('Não há dados disponíveis para gerar o PDF.');
      return;
    }

    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const issueDate = new Date().toLocaleDateString('pt-BR', { 
      day: '2-digit', month: '2-digit', year: 'numeric', 
      hour: '2-digit', minute: '2-digit' 
    });

    // Cabeçalho Oficial Nex-Ai CLINIC
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(8, 145, 178); // Cyan-600
    doc.text(tenantSettings.name || 'Nex-Ai CLINIC', 14, 15);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(`CNPJ: ${tenantSettings.cnpj || '00.000.000/0001-00'} | Sistema Nex-Ai.SERVICE`, 14, 20);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text(currentReportMeta.title, 14, 28);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    doc.text(`Emissão: ${issueDate} • Setor: ${sectorFilter} • Categoria: ${categoryFilter}`, 14, 33);

    // Linha divisória
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.line(14, 36, 283, 36);

    // Tabela com autoTable
    const tableHeaders = [reportData.cols.map(c => c.header)];
    const tableBody = reportData.data.map(row => reportData.cols.map(c => String(row[c.key] || '')));

    doc.autoTable({
      head: tableHeaders,
      body: tableBody,
      startY: 40,
      theme: 'grid',
      styles: {
        fontSize: 8,
        cellPadding: 2.5,
        textColor: [30, 41, 59],
        lineColor: [226, 232, 240],
        lineWidth: 0.2
      },
      headStyles: {
        fillColor: [8, 145, 178],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8.5
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      },
      margin: { left: 14, right: 14 },
      didDrawPage: (dataHook) => {
        // Rodapé de Página
        const str = `Página ${dataHook.pageNumber} de ${doc.internal.getNumberOfPages()}`;
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text(str, 14, 202);
        doc.text('Nex-Ai CLINIC — Engenharia Clínica & Gestão de Ativos', 220, 202);
      }
    });

    const fileName = `${currentReportMeta.id}_${new Date().toISOString().substring(0, 10)}.pdf`;
    doc.save(fileName);
  };

  if (!isOpen) return null;

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modalContainer}>
        {/* Header Modal */}
        <div style={styles.modalHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={styles.headerIconBadge}>
              <Wrench size={22} color="#ffffff" />
            </div>
            <div>
              <h2 style={styles.modalTitle}>Central de Relatórios de Manutenção & T.I.</h2>
              <p style={styles.modalSubtitle}>
                Auditoria de ativos biomédicos, preventivas, chamados de T.I. e conformidade metrológica.
              </p>
            </div>
          </div>
          <button onClick={onClose} style={styles.closeBtn} title="Fechar Relatórios">
            <X size={20} />
          </button>
        </div>

        {/* Categories Bar */}
        <div style={styles.categoriesBar}>
          {[
            { id: 'ALL', label: 'Todos' },
            { id: 'ATIVOS', label: 'Ativos' },
            { id: 'PREVENTIVA', label: 'Preventiva' },
            { id: 'CUSTOS', label: 'Custos' },
            { id: 'TI', label: 'T.I.' }
          ].map(sec => (
            <button
              key={sec.id}
              onClick={() => setActiveSection(sec.id)}
              style={{
                ...styles.categoryTab,
                ...(activeSection === sec.id ? styles.categoryTabActive : {})
              }}
            >
              {sec.label}
            </button>
          ))}
        </div>

        {/* Body Grid: Left List + Right Preview */}
        <div style={styles.modalBody}>
          {/* Left Column: Report Cards */}
          <div style={styles.reportsSidebar}>
            <div style={styles.sidebarSearch}>
              <Search size={14} color="#94a3b8" />
              <input
                type="text"
                placeholder="Buscar relatório..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                style={styles.sidebarInput}
              />
            </div>

            <div style={styles.reportsCardsList}>
              {filteredReportsList.map(rep => {
                const Icon = rep.icon;
                const isSelected = rep.id === selectedReport;

                return (
                  <div
                    key={rep.id}
                    onClick={() => setSelectedReport(rep.id)}
                    style={{
                      ...styles.reportCard,
                      ...(isSelected ? styles.reportCardActive : {})
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                      <div style={{
                        ...styles.cardIconBox,
                        backgroundColor: isSelected ? '#0891b2' : '#f1f5f9',
                        color: isSelected ? '#ffffff' : '#475569'
                      }}>
                        <Icon size={16} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                          <span style={styles.cardTitle}>{rep.title}</span>
                          <span style={{ ...styles.cardBadge, backgroundColor: `${rep.badgeColor}15`, color: rep.badgeColor, borderColor: `${rep.badgeColor}35` }}>
                            {rep.badge}
                          </span>
                        </div>
                        <p style={styles.cardDesc}>{rep.desc}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Preview & Filters */}
          <div style={styles.reportPreview}>
            {/* Top Toolbar */}
            <div style={styles.previewToolbar}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
                <select
                  value={sectorFilter}
                  onChange={(e) => setSectorFilter(e.target.value)}
                  style={styles.filterSelect}
                >
                  <option value="Todos">Setor: Todos</option>
                  {availableSectors.map(sec => (
                    <option key={sec} value={sec}>{sec}</option>
                  ))}
                </select>

                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  style={styles.filterSelect}
                >
                  <option value="Todas">Categoria: Todas</option>
                  <option value="Biomédico">Biomédico</option>
                  <option value="Infraestrutura">Infraestrutura</option>
                  <option value="T.I.">T.I.</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={styles.filterSelect}
                >
                  <option value="Todos">Status: Todos</option>
                  <option value="Em Operação">Em Operação</option>
                  <option value="Em Manutenção">Em Manutenção</option>
                  <option value="Inoperante">Inoperante</option>
                  <option value="Aberta">Aberta (OS)</option>
                  <option value="Concluída">Concluída (OS)</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={handleExportExcel}
                  style={styles.btnExcel}
                  title="Exportar para Planilha Excel (.xlsx)"
                >
                  <FileSpreadsheet size={15} />
                  <span>Excel</span>
                </button>
                <button
                  type="button"
                  onClick={handleExportPDF}
                  style={styles.btnPdf}
                  title="Gerar e Baixar PDF Formatado"
                >
                  <Download size={15} />
                  <span>PDF</span>
                </button>
              </div>
            </div>

            {/* KPIs Row */}
            <div style={styles.kpiRow}>
              {reportData.kpis.map((kpi, idx) => (
                <div key={idx} style={styles.kpiCard}>
                  <span style={styles.kpiLabel}>{kpi.label}</span>
                  <span style={{ ...styles.kpiValue, color: kpi.color }}>{kpi.value}</span>
                </div>
              ))}
            </div>

            {/* Table Area */}
            <div style={styles.tableWrapper}>
              {reportData.data.length === 0 ? (
                <div style={styles.emptyTableBox}>
                  <HardDrive size={36} color="#cbd5e1" />
                  <p style={{ fontWeight: '600', color: '#475569', marginTop: '0.5rem' }}>Nenhum registro encontrado.</p>
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Ajuste os filtros de setor ou categoria para visualizar os dados.</span>
                </div>
              ) : (
                <table style={styles.table}>
                  <thead>
                    <tr>
                      {reportData.cols.map(c => (
                        <th key={c.key} style={styles.th}>{c.header}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.data.map((row, idx) => (
                      <tr key={idx} style={styles.tr}>
                        {reportData.cols.map(c => (
                          <td key={c.key} style={styles.td}>
                            {row[c.key]}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  modalOverlay: {
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
    padding: '1.25rem'
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '1240px',
    height: '92vh',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    border: '1px solid #e2e8f0'
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 1.5rem',
    borderBottom: '1px solid #e2e8f0',
    backgroundColor: '#f8fafc'
  },
  headerIconBadge: {
    width: '42px',
    height: '42px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #0891b2, #0e7490)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 10px rgba(8, 145, 178, 0.25)'
  },
  modalTitle: {
    fontSize: '1.15rem',
    fontWeight: '800',
    color: '#0f172a',
    margin: 0
  },
  modalSubtitle: {
    fontSize: '0.8rem',
    color: '#64748b',
    margin: '2px 0 0 0'
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: '#64748b',
    cursor: 'pointer',
    padding: '6px',
    borderRadius: '8px',
    transition: 'all 0.2s'
  },
  categoriesBar: {
    display: 'flex',
    gap: '0.5rem',
    padding: '0.65rem 1.5rem',
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e2e8f0'
  },
  categoryTab: {
    padding: '0.45rem 0.95rem',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    backgroundColor: '#f8fafc',
    color: '#475569',
    fontSize: '0.825rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  categoryTabActive: {
    backgroundColor: '#0891b2',
    color: '#ffffff',
    borderColor: '#0891b2',
    fontWeight: '700',
    boxShadow: '0 2px 6px rgba(8, 145, 178, 0.25)'
  },
  modalBody: {
    display: 'grid',
    gridTemplateColumns: '360px 1fr',
    flex: 1,
    overflow: 'hidden',
    backgroundColor: '#f8fafc'
  },
  reportsSidebar: {
    display: 'flex',
    flexDirection: 'column',
    borderRight: '1px solid #e2e8f0',
    backgroundColor: '#ffffff',
    overflowY: 'auto'
  },
  sidebarSearch: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.45rem',
    padding: '0.75rem 1rem',
    borderBottom: '1px solid #f1f5f9'
  },
  sidebarInput: {
    width: '100%',
    border: 'none',
    outline: 'none',
    fontSize: '0.825rem',
    color: '#1e293b'
  },
  reportsCardsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    padding: '0.75rem'
  },
  reportCard: {
    padding: '0.75rem',
    borderRadius: '10px',
    border: '1px solid #e2e8f0',
    backgroundColor: '#ffffff',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  reportCardActive: {
    borderColor: '#0891b2',
    backgroundColor: '#ecfeff',
    boxShadow: '0 2px 8px rgba(8, 145, 178, 0.15)'
  },
  cardIconBox: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  cardTitle: {
    fontSize: '0.825rem',
    fontWeight: '700',
    color: '#0f172a'
  },
  cardBadge: {
    fontSize: '0.675rem',
    fontWeight: '700',
    padding: '0.15rem 0.45rem',
    borderRadius: '4px',
    border: '1px solid'
  },
  cardDesc: {
    fontSize: '0.735rem',
    color: '#64748b',
    margin: 0,
    lineHeight: 1.3
  },
  reportPreview: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    padding: '1.25rem'
  },
  previewToolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '1rem',
    flexWrap: 'wrap'
  },
  filterSelect: {
    padding: '0.45rem 0.75rem',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    backgroundColor: '#ffffff',
    fontSize: '0.82rem',
    fontWeight: '600',
    color: '#334155',
    outline: 'none'
  },
  btnExcel: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
    padding: '0.48rem 0.85rem',
    borderRadius: '8px',
    backgroundColor: '#ecfdf5',
    color: '#047857',
    border: '1px solid #a7f3d0',
    fontSize: '0.825rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  btnPdf: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
    padding: '0.48rem 0.85rem',
    borderRadius: '8px',
    backgroundColor: '#0891b2',
    color: '#ffffff',
    border: 'none',
    fontSize: '0.825rem',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 2px 6px rgba(8, 145, 178, 0.25)',
    transition: 'all 0.2s'
  },
  kpiRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '0.75rem',
    marginBottom: '1rem'
  },
  kpiCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    padding: '0.75rem 1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.2rem'
  },
  kpiLabel: {
    fontSize: '0.75rem',
    fontWeight: '600',
    color: '#64748b'
  },
  kpiValue: {
    fontSize: '1.25rem',
    fontWeight: '800'
  },
  tableWrapper: {
    flex: 1,
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    overflow: 'auto'
  },
  emptyTableBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '240px',
    padding: '2rem'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.82rem'
  },
  th: {
    backgroundColor: '#f8fafc',
    color: '#475569',
    fontWeight: '700',
    padding: '0.65rem 0.85rem',
    textAlign: 'left',
    borderBottom: '1px solid #e2e8f0',
    position: 'sticky',
    top: 0,
    zIndex: 1
  },
  tr: {
    borderBottom: '1px solid #f1f5f9'
  },
  td: {
    padding: '0.6rem 0.85rem',
    color: '#1e293b'
  }
};
