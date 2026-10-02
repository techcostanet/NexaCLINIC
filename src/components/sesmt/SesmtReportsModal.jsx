import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, FileText, Download, FileSpreadsheet, Calendar, 
  ShieldCheck, Activity, Printer, CheckCircle2, AlertTriangle, 
  Clock, Flame, Droplet, Coffee, Shield, Search, Layers,
  Thermometer, UserCheck, AlertOctagon, CheckCheck, RefreshCw,
  Trash2
} from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { dbService } from '../../firebase';

export default function SesmtReportsModal({
  isOpen,
  onClose,
  epiData = [],
  copaData = [],
  wasteData = [],
  extinguisherData = [],
  hydrantData = [],
  equipmentData = [],
  currentUser
}) {
  if (!isOpen) return null;

  // Filtros de Categoria e Relatório Selecionado
  const [activeSection, setActiveSection] = useState('ALL'); // 'ALL' | 'EPI' | 'EXTINTORES' | 'HIDRANTES' | 'COPA' | 'ATIVOS'
  const [selectedReport, setSelectedReport] = useState('SESMT_EPI_CONFORMIDADE_GERAL');

  // Filtros Globais do Relatório
  const [periodPreset, setPeriodPreset] = useState('MES_ATUAL');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [sectorFilter, setSectorFilter] = useState('TODOS');
  const [shiftFilter, setShiftFilter] = useState('TODOS');
  const [searchFilter, setSearchFilter] = useState('');

  // Configurações Institucionais da Clínica
  const [tenantSettings, setTenantSettings] = useState({ 
    name: 'NexaCLINIC • Medicina & Segurança do Trabalho', 
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

  // Catálogo Oficial dos 25 Relatórios Especializados do SESMT (5 por assunto)
  const REPORTS = [
    // ----------------------------------------------------
    // ASSUNTO 1: EPI (Equipamento de Proteção Individual)
    // ----------------------------------------------------
    {
      id: 'SESMT_EPI_CONFORMIDADE_GERAL',
      section: 'EPI',
      num: 1,
      title: '1. Censo de Conformidade Diária de EPIs',
      desc: 'Demonstrativo diário de inspeções de EPI com taxa de conformidade, total checado e status.',
      badge: 'EPI',
      badgeColor: '#10b981',
      icon: ShieldCheck
    },
    {
      id: 'SESMT_EPI_AUDITORIA_ITENS',
      section: 'EPI',
      num: 2,
      title: '2. Auditoria de Itens Críticos de EPI',
      desc: 'Aderência item a item: máscaras N95/cirúrgica, óculos, avental, luvas, unhas e higienização.',
      badge: 'EPI',
      badgeColor: '#10b981',
      icon: UserCheck
    },
    {
      id: 'SESMT_EPI_DESVIOS_SETOR',
      section: 'EPI',
      num: 3,
      title: '3. Desvios e Não Conformidades por Setor',
      desc: 'Mapeamento detalhado das ocorrências e observações de desvios em hemodiálise e cirúrgico.',
      badge: 'EPI',
      badgeColor: '#10b981',
      icon: AlertTriangle
    },
    {
      id: 'SESMT_EPI_TURNO',
      section: 'EPI',
      num: 4,
      title: '4. Aderência de EPI por Turno',
      desc: 'Comparativo de adesão às normas de biossegurança entre os turnos Manhã, Tarde e Noite.',
      badge: 'EPI',
      badgeColor: '#10b981',
      icon: Clock
    },
    {
      id: 'SESMT_EPI_RASTREAMENTO_RESPONSAVEIS',
      section: 'EPI',
      num: 5,
      title: '5. Rastreabilidade de Vistos e Responsáveis',
      desc: 'Histórico de checklists com registro de enfermeiro, técnico SESMT e assinatura digital.',
      badge: 'EPI',
      badgeColor: '#10b981',
      icon: CheckCheck
    },

    // ----------------------------------------------------
    // ASSUNTO 2: EXTINTORES DE INCÊNDIO
    // ----------------------------------------------------
    {
      id: 'SESMT_EXT_CENSO_INVENTARIO',
      section: 'EXTINTORES',
      num: 6,
      title: '6. Censo Cadastral e Localização de Extintores',
      desc: 'Inventário completo dos extintores portáteis com tipo químico, capacidade, setor e andar.',
      badge: 'Extintores',
      badgeColor: '#f97316',
      icon: Flame
    },
    {
      id: 'SESMT_EXT_CRONOGRAMA_RECARGAS',
      section: 'EXTINTORES',
      num: 7,
      title: '7. Cronograma de Vencimento de Cargas',
      desc: 'Semáforo de validade anual de carga com status: regular, a vencer em 60 dias e vencidos.',
      badge: 'Extintores',
      badgeColor: '#f97316',
      icon: Calendar
    },
    {
      id: 'SESMT_EXT_TESTE_HIDROSTATICO',
      section: 'EXTINTORES',
      num: 8,
      title: '8. Histórico de Testes Hidrostáticos',
      desc: 'Controle de reteste quinquenal (5 anos) do cilindro com selo INMETRO e validade estrutural.',
      badge: 'Extintores',
      badgeColor: '#f97316',
      icon: Shield
    },
    {
      id: 'SESMT_EXT_AUDITORIA_SEMANAL',
      section: 'EXTINTORES',
      num: 9,
      title: '9. Auditoria de Inspeções Semanais',
      desc: 'Checagem física semanal de manômetro/pressão, pino, lacre, mangueira, bico e sinalização.',
      badge: 'Extintores',
      badgeColor: '#f97316',
      icon: CheckCircle2
    },
    {
      id: 'SESMT_EXT_INOPERANTES_AVARIADOS',
      section: 'EXTINTORES',
      num: 10,
      title: '10. Extintores Inoperantes e em Manutenção',
      desc: 'Equipamentos despressurizados, avariados ou enviados para recarga e manutenção externa.',
      badge: 'Extintores',
      badgeColor: '#f97316',
      icon: AlertOctagon
    },

    // ----------------------------------------------------
    // ASSUNTO 3: HIDRANTES & MANGUEIRAS
    // ----------------------------------------------------
    {
      id: 'SESMT_HID_INVENTARIO_ABRIGOS',
      section: 'HIDRANTES',
      num: 11,
      title: '11. Inventário Físico dos Abrigos de Hidrantes',
      desc: 'Relação cadastral dos pontos de hidrantes de parede e externos com localização exata.',
      badge: 'Hidrantes',
      badgeColor: '#0284c7',
      icon: Droplet
    },
    {
      id: 'SESMT_HID_INSPECAO_INTEGRIDADE',
      section: 'HIDRANTES',
      num: 12,
      title: '12. Inspeção Semanal de Integridade dos Abrigos',
      desc: 'Auditoria de desobstrução, vidro/visor, tranca, chave Storz, esguicho e integridade da caixa.',
      badge: 'Hidrantes',
      badgeColor: '#0284c7',
      icon: ShieldCheck
    },
    {
      id: 'SESMT_HID_CENSO_MANGUEIRAS',
      section: 'HIDRANTES',
      num: 13,
      title: '13. Censo de Mangueiras e Esguichos',
      desc: 'Inventário de lances de mangueiras (15m/30m, tipo 1 e 2), esguichos reguláveis e engates.',
      badge: 'Hidrantes',
      badgeColor: '#0284c7',
      icon: Layers
    },
    {
      id: 'SESMT_HID_TESTE_HIDROSTATICO',
      section: 'HIDRANTES',
      num: 14,
      title: '14. Cronograma de Teste Hidrostático de Mangueiras',
      desc: 'Controle de ensaio hidrostático anual de mangueiras conforme requisitos da NBR 12779.',
      badge: 'Hidrantes',
      badgeColor: '#0284c7',
      icon: Calendar
    },
    {
      id: 'SESMT_HID_OCORRENCIAS_DESVIOS',
      section: 'HIDRANTES',
      num: 15,
      title: '15. Ocorrências e Desvios em Hidrantes',
      desc: 'Registro de não conformidades: vazamentos em válvulas, mangueiras molhadas ou peças ausentes.',
      badge: 'Hidrantes',
      badgeColor: '#0284c7',
      icon: AlertTriangle
    },

    // ----------------------------------------------------
    // ASSUNTO 4: COPA & HIGIENE ALIMENTAR
    // ----------------------------------------------------
    {
      id: 'SESMT_COPA_CHECKLIST_SANITARIO',
      section: 'COPA',
      num: 16,
      title: '16. Checklist Sanitário Diário da Copa',
      desc: 'Relação das inspeções diárias de boas práticas, higiene e conservação da copa hospitalar.',
      badge: 'Copa',
      badgeColor: '#d97706',
      icon: Coffee
    },
    {
      id: 'SESMT_COPA_CONTROLE_TEMPERATURA',
      section: 'COPA',
      num: 17,
      title: '17. Controle Térmico de Geladeiras e Equipamentos',
      desc: 'Monitoramento térmico diário dos refrigeradores (faixa 2°C a 8°C) e estufas de alimentos.',
      badge: 'Copa',
      badgeColor: '#d97706',
      icon: Thermometer
    },
    {
      id: 'SESMT_COPA_VALIDADES_INSUMOS',
      section: 'COPA',
      num: 18,
      title: '18. Controle de Validades e Manipulação (PVPS)',
      desc: 'Auditoria de etiquetas de manipulação, critério primeiro que vence primeiro que sai (PVPS/FEFO).',
      badge: 'Copa',
      badgeColor: '#d97706',
      icon: Calendar
    },
    {
      id: 'SESMT_COPA_BOAS_PRATICAS_MANIPULADORES',
      section: 'COPA',
      num: 19,
      title: '19. Boas Práticas dos Manipuladores',
      desc: 'Verificação do uso de touca, avental, higienização de mãos, unhas e ausência de adornos.',
      badge: 'Copa',
      badgeColor: '#d97706',
      icon: UserCheck
    },
    {
      id: 'SESMT_COPA_HIGIENIZACAO_RESIDUOS',
      section: 'COPA',
      num: 20,
      title: '20. Higienização de Ambientes e Descarte',
      desc: 'Limpeza de bancadas, acionamento por pedal das lixeiras e identificação de químicos com FDS.',
      badge: 'Copa',
      badgeColor: '#d97706',
      icon: CheckCircle2
    },

    // ----------------------------------------------------
    // ASSUNTO 5: ATIVOS & GESTÃO ESTRATÉGICA SESMT
    // ----------------------------------------------------
    {
      id: 'SESMT_ATIVOS_INVENTARIO_GERAL',
      section: 'ATIVOS',
      num: 21,
      title: '21. Inventário Geral de Ativos de Segurança',
      desc: 'Censo patrimonial unificado de extintores, hidrantes, sinalização e equipamentos de emergência.',
      badge: 'Ativos',
      badgeColor: '#0891b2',
      icon: Shield
    },
    {
      id: 'SESMT_ATIVOS_MAPA_DISTRIBUICAO',
      section: 'ATIVOS',
      num: 22,
      title: '22. Mapa de Distribuição Setorial de Ativos',
      desc: 'Densidade de equipamentos de proteção e combate a incêndio por setor da clínica.',
      badge: 'Ativos',
      badgeColor: '#0891b2',
      icon: Layers
    },
    {
      id: 'SESMT_ATIVOS_PREVISAO_RECARGAS',
      section: 'ATIVOS',
      num: 23,
      title: '23. Previsão Orçamentária de Recargas e Ensaios',
      desc: 'Cronograma anual de despesas previstas com recarga de extintores e testes hidrostáticos.',
      badge: 'Ativos',
      badgeColor: '#0891b2',
      icon: Activity
    },
    {
      id: 'SESMT_ATIVOS_PAINEL_DESVIOS_CRITICOS',
      section: 'ATIVOS',
      num: 24,
      title: '24. Painel Geral de Não Conformidades Críticas',
      desc: 'Consolidação de todos os desvios registrados com alerta de risco potencial e prioridade.',
      badge: 'Ativos',
      badgeColor: '#0891b2',
      icon: AlertOctagon
    },
    {
      id: 'SESMT_ATIVOS_AUDITORIA_NORMATIVA',
      section: 'ATIVOS',
      num: 25,
      title: '25. Auditoria de Conformidade com NRs (06, 23, 32)',
      desc: 'Demonstrativo de aderência aos requisitos normativos legais fiscalizáveis pelo MTE e Anvisa.',
      badge: 'Ativos',
      badgeColor: '#0891b2',
      icon: FileText
    },

    // ----------------------------------------------------
    // ASSUNTO 6: RESÍDUOS & BIOSSEGURANÇA (RDC 222 / NR-32)
    // ----------------------------------------------------
    {
      id: 'SESMT_RESIDUOS_DESCARTE_INFECTANTE',
      section: 'RESIDUOS',
      num: 26,
      title: '26. Descarte de Lixo Infectante por Local',
      desc: 'Demonstrativo estatístico e analítico de vistorias de descarte com quantitativo e percentual por setor.',
      badge: 'Resíduos',
      badgeColor: '#059669',
      icon: Trash2
    }
  ];

  // Filtro de Relatórios por Categoria
  const filteredReportsList = useMemo(() => {
    let list = REPORTS;
    if (activeSection !== 'ALL') {
      list = list.filter(r => r.section === activeSection);
    }
    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase();
      list = list.filter(r => r.title.toLowerCase().includes(q) || r.desc.toLowerCase().includes(q));
    }
    return list;
  }, [activeSection, searchFilter]);

  // Formatação de data em padrão brasileiro
  const formatDateBR = (dateStr) => {
    if (!dateStr) return '-';
    try {
      const parts = dateStr.substring(0, 10).split('-');
      if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
      return new Date(dateStr).toLocaleDateString('pt-BR');
    } catch {
      return dateStr;
    }
  };

  // Verificação de Período
  const isDateInPeriod = (dateStr) => {
    if (!dateStr) return false;
    if (periodPreset === 'TUDO') return true;

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const currentYear = today.getFullYear().toString();
    const currentMonth = today.toISOString().substring(0, 7); // YYYY-MM
    
    const prevMonthDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const prevMonth = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, '0')}`;

    if (periodPreset === 'HOJE') return dateStr === todayStr;
    if (periodPreset === '7D') {
      const d7 = new Date();
      d7.setDate(today.getDate() - 7);
      return dateStr >= d7.toISOString().split('T')[0] && dateStr <= todayStr;
    }
    if (periodPreset === 'MES_ATUAL') return dateStr.startsWith(currentMonth);
    if (periodPreset === 'MES_ANTERIOR') return dateStr.startsWith(prevMonth);
    if (periodPreset === 'ANO_ATUAL') return dateStr.startsWith(currentYear);
    if (periodPreset === 'CUSTOM') {
      if (customStartDate && dateStr < customStartDate) return false;
      if (customEndDate && dateStr > customEndDate) return false;
      return true;
    }
    return true;
  };

  // Motor de Processamento Dinâmico dos 25 Relatórios
  const { reportData, reportColumns, reportKpis, currentReportMeta } = useMemo(() => {
    const meta = REPORTS.find(r => r.id === selectedReport) || REPORTS[0];
    let data = [];
    let cols = [];
    let kpis = [];

    // Bases filtradas pelo período
    const filteredEpis = epiData.filter(i => {
      if (!isDateInPeriod(i.date)) return false;
      if (sectorFilter !== 'TODOS' && i.sector !== sectorFilter) return false;
      if (shiftFilter !== 'TODOS' && i.shift !== shiftFilter) return false;
      return true;
    });

    const filteredCopas = copaData.filter(i => {
      if (!isDateInPeriod(i.date)) return false;
      if (shiftFilter !== 'TODOS' && i.shift !== shiftFilter) return false;
      return true;
    });

    const filteredExtInspections = extinguisherData.filter(i => isDateInPeriod(i.date));
    const filteredHydInspections = hydrantData.filter(i => isDateInPeriod(i.date));

    const filteredWastes = wasteData.filter(i => {
      if (!isDateInPeriod(i.date)) return false;
      if (sectorFilter !== 'TODOS' && i.sector !== sectorFilter) return false;
      if (shiftFilter !== 'TODOS' && i.shift !== shiftFilter) return false;
      return true;
    });

    const activeExtinguishers = equipmentData.filter(e => (e.category || 'EXTINGUISHER') === 'EXTINGUISHER');
    const activeHydrants = equipmentData.filter(e => e.category === 'HYDRANT');

    switch (selectedReport) {
      // 1. Censo de Conformidade Diária de EPIs
      case 'SESMT_EPI_CONFORMIDADE_GERAL': {
        cols = [
          { header: 'Data', key: 'date' },
          { header: 'Horário', key: 'time' },
          { header: 'Setor', key: 'sector' },
          { header: 'Turno', key: 'shift' },
          { header: 'Conformes', key: 'cCount' },
          { header: 'Não Conformes', key: 'ncCount' },
          { header: 'Conformidade', key: 'rate' },
          { header: 'Responsável', key: 'resp' },
          { header: 'Status', key: 'status' }
        ];

        data = filteredEpis.map(item => {
          let c = 0;
          let nc = 0;
          Object.values(item.evaluations || {}).forEach(ev => {
            if (ev.status === 'C') c++;
            if (ev.status === 'NC') nc++;
          });
          const total = c + nc;
          const rateNum = total > 0 ? Math.round((c / total) * 100) : 100;
          return {
            date: formatDateBR(item.date),
            time: item.time || '-',
            sector: item.sector || 'Geral',
            shift: item.shift || '1º Turno',
            cCount: c,
            ncCount: nc,
            rate: `${rateNum}%`,
            resp: item.tecnicoSeguranca || item.enfermeiro || 'Técnico SESMT',
            status: rateNum === 100 ? 'Conforme' : rateNum >= 85 ? 'Alerta' : 'Crítico'
          };
        });

        const totalInsp = data.length;
        const totalNC = data.reduce((acc, d) => acc + d.ncCount, 0);
        const avgRate = totalInsp > 0 ? Math.round(data.reduce((acc, d) => acc + parseInt(d.rate), 0) / totalInsp) : 100;

        kpis = [
          { label: 'Inspeções', value: totalInsp, color: '#0891b2' },
          { label: 'Conformidade Média', value: `${avgRate}%`, color: avgRate >= 95 ? '#10b981' : '#f59e0b' },
          { label: 'Total de Desvios', value: totalNC, color: totalNC > 0 ? '#ef4444' : '#10b981' },
          { label: 'Meta SESMT', value: '≥ 95%', color: '#6366f1' }
        ];
        break;
      }

      // 2. Auditoria de Itens Críticos de EPI
      case 'SESMT_EPI_AUDITORIA_ITENS': {
        cols = [
          { header: 'Item Auditado', key: 'item' },
          { header: 'Norma', key: 'norm' },
          { header: 'Avaliações', key: 'total' },
          { header: 'Conformes', key: 'c' },
          { header: 'Não Conformes', key: 'nc' },
          { header: 'Adesão', key: 'rate' },
          { header: 'Situação', key: 'status' }
        ];

        const itemLabels = [
          { id: 'uso_epi', label: 'Uso adequado do EPI', norm: 'NR-06' },
          { id: 'higienizacao', label: 'Higienização das mãos', norm: 'NR-32' },
          { id: 'descarte', label: 'Descarte de resíduos infectantes', norm: 'RDC 222' },
          { id: 'conservacao', label: 'Conservação e guarda de EPI', norm: 'NR-06' },
          { id: 'limpeza_ralos', label: 'Condições e limpeza dos ralos', norm: 'NR-32' },
          { id: 'ausencia_adornos', label: 'Ausência de adornos (adorno zero)', norm: 'NR-32' },
          { id: 'uso_cilios', label: 'Uso de cílios / Higiene facial', norm: 'Biossegurança' },
          { id: 'bancadas_superficies', label: 'Bancadas e superfícies limpas', norm: 'NR-32' },
          { id: 'produtos_quimicos', label: 'Produtos químicos identificados', norm: 'NR-20 / NR-32' },
          { id: 'fds_quimicos', label: 'Fichas FDS disponíveis', norm: 'NR-26' },
          { id: 'condicoes_unhas', label: 'Unhas limpas e aparadas', norm: 'NR-32' }
        ];

        data = itemLabels.map(it => {
          let c = 0;
          let nc = 0;
          filteredEpis.forEach(insp => {
            const ev = (insp.evaluations || {})[it.id];
            if (ev?.status === 'C') c++;
            if (ev?.status === 'NC') nc++;
          });
          const tot = c + nc;
          const rateNum = tot > 0 ? Math.round((c / tot) * 100) : 100;
          return {
            item: it.label,
            norm: it.norm,
            total: tot,
            c,
            nc,
            rate: `${rateNum}%`,
            status: rateNum >= 95 ? 'Excelente' : rateNum >= 85 ? 'Adequado' : 'Atenção'
          };
        });

        const totalItensNC = data.reduce((acc, d) => acc + d.nc, 0);
        kpis = [
          { label: 'Itens Monitorados', value: 11, color: '#0891b2' },
          { label: 'Itens 100% Conformes', value: data.filter(d => d.rate === '100%').length, color: '#10b981' },
          { label: 'Total Desvios', value: totalItensNC, color: totalItensNC > 0 ? '#ef4444' : '#10b981' }
        ];
        break;
      }

      // 3. Desvios e Não Conformidades por Setor
      case 'SESMT_EPI_DESVIOS_SETOR': {
        cols = [
          { header: 'Data', key: 'date' },
          { header: 'Setor', key: 'sector' },
          { header: 'Turno', key: 'shift' },
          { header: 'Item Não Conforme', key: 'item' },
          { header: 'Observação Anotada', key: 'obs' },
          { header: 'Avaliador', key: 'evaluator' }
        ];

        filteredEpis.forEach(insp => {
          Object.entries(insp.evaluations || {}).forEach(([itemId, ev]) => {
            if (ev?.status === 'NC') {
              data.push({
                date: formatDateBR(insp.date),
                sector: insp.sector || 'Geral',
                shift: insp.shift || '1º Turno',
                item: itemId.replace(/_/g, ' ').toUpperCase(),
                obs: ev.observation || 'Não especificada pelo avaliador',
                evaluator: insp.tecnicoSeguranca || insp.enfermeiro || 'Técnico SESMT'
              });
            }
          });
        });

        if (data.length === 0) {
          data = [{
            date: formatDateBR(new Date().toISOString().split('T')[0]),
            sector: 'Todos os Setores',
            shift: 'Todos',
            item: 'Nenhum desvio registrado',
            obs: 'Excelente! Todos os itens em conformidade no período.',
            evaluator: 'SESMT'
          }];
        }

        kpis = [
          { label: 'Desvios Registrados', value: data[0].item === 'Nenhum desvio registrado' ? 0 : data.length, color: '#ef4444' },
          { label: 'Setores com Desvio', value: new Set(data.map(d => d.sector)).size, color: '#f59e0b' },
          { label: 'Status Geral', value: data[0].item === 'Nenhum desvio registrado' ? 'Conforme' : 'Ação Requerida', color: '#10b981' }
        ];
        break;
      }

      // 4. Aderência de EPI por Turno
      case 'SESMT_EPI_TURNO': {
        cols = [
          { header: 'Turno', key: 'shift' },
          { header: 'Inspeções', key: 'count' },
          { header: 'Itens Auditados', key: 'totalItems' },
          { header: 'Conformes', key: 'c' },
          { header: 'Não Conformes', key: 'nc' },
          { header: 'Aderência', key: 'rate' },
          { header: 'Classificação', key: 'status' }
        ];

        const shifts = ['1º Turno (Manhã)', '2º Turno (Tarde)', '3º Turno (Noite)'];
        data = shifts.map(sh => {
          const list = filteredEpis.filter(i => i.shift === sh);
          let c = 0;
          let nc = 0;
          list.forEach(i => {
            Object.values(i.evaluations || {}).forEach(ev => {
              if (ev.status === 'C') c++;
              if (ev.status === 'NC') nc++;
            });
          });
          const tot = c + nc;
          const rateNum = tot > 0 ? Math.round((c / tot) * 100) : 100;
          return {
            shift: sh,
            count: list.length,
            totalItems: tot,
            c,
            nc,
            rate: `${rateNum}%`,
            status: rateNum >= 95 ? 'Excelente' : rateNum >= 85 ? 'Adequado' : 'Crítico'
          };
        });

        kpis = [
          { label: 'Turnos Monitorados', value: 3, color: '#0891b2' },
          { label: 'Turno Mais Conforme', value: data.reduce((prev, curr) => parseInt(curr.rate) > parseInt(prev.rate) ? curr : prev).shift, color: '#10b981' },
          { label: 'Total Formulários', value: filteredEpis.length, color: '#6366f1' }
        ];
        break;
      }

      // 5. Rastreabilidade de Vistos e Responsáveis
      case 'SESMT_EPI_RASTREAMENTO_RESPONSAVEIS': {
        cols = [
          { header: 'Data', key: 'date' },
          { header: 'Horário', key: 'time' },
          { header: 'Setor', key: 'sector' },
          { header: 'Turno', key: 'shift' },
          { header: 'Enfermeiro', key: 'nurse' },
          { header: 'Técnico SESMT', key: 'technician' },
          { header: 'Assinatura', key: 'sigStatus' },
          { header: 'Conformidade', key: 'rate' }
        ];

        data = filteredEpis.map(i => {
          let c = 0;
          let nc = 0;
          Object.values(i.evaluations || {}).forEach(ev => {
            if (ev.status === 'C') c++;
            if (ev.status === 'NC') nc++;
          });
          const tot = c + nc;
          const rateNum = tot > 0 ? Math.round((c / tot) * 100) : 100;
          return {
            date: formatDateBR(i.date),
            time: i.time || '-',
            sector: i.sector || 'Geral',
            shift: i.shift || '1º Turno',
            nurse: i.enfermeiro || 'Não informado',
            technician: i.tecnicoSeguranca || 'Não informado',
            sigStatus: i.signature ? 'Coletada' : 'Pendente',
            rate: `${rateNum}%`
          };
        });

        const signedCount = data.filter(d => d.sigStatus === 'Coletada').length;
        kpis = [
          { label: 'Total Vistorias', value: data.length, color: '#0891b2' },
          { label: 'Assinaturas Coletadas', value: signedCount, color: '#10b981' },
          { label: 'Assinaturas Pendentes', value: data.length - signedCount, color: data.length - signedCount > 0 ? '#ef4444' : '#10b981' }
        ];
        break;
      }

      // 6. Censo Cadastral e Localização de Extintores
      case 'SESMT_EXT_CENSO_INVENTARIO': {
        cols = [
          { header: 'Código', key: 'code' },
          { header: 'Tipo', key: 'type' },
          { header: 'Capacidade', key: 'capacity' },
          { header: 'Setor', key: 'sector' },
          { header: 'Vencimento Carga', key: 'valDate' },
          { header: 'Reteste Quinquenal', key: 'hydroDate' },
          { header: 'Selo INMETRO', key: 'seal' },
          { header: 'Status', key: 'status' }
        ];

        data = activeExtinguishers.map((ext, idx) => ({
          code: ext.code || `EXT-${String(idx + 1).padStart(2, '0')}`,
          type: ext.type || 'Pó Químico ABC',
          capacity: ext.capacity || (ext.type?.includes('CO2') ? '6 kg' : '4 kg / 10L'),
          sector: ext.sector || 'Geral',
          valDate: formatDateBR(ext.validityDate),
          hydroDate: formatDateBR(ext.hydrostaticTestDate),
          seal: ext.inmetroSeal || `INM-${7400 + idx}`,
          status: ext.status || 'ATIVO'
        }));

        kpis = [
          { label: 'Total Extintores', value: data.length, color: '#0891b2' },
          { label: 'PQS / ABC', value: data.filter(d => d.type.includes('Pó') || d.type.includes('ABC') || d.type.includes('PQS')).length, color: '#10b981' },
          { label: 'CO2', value: data.filter(d => d.type.includes('CO2')).length, color: '#6366f1' },
          { label: 'Água Pressurizada', value: data.filter(d => d.type.includes('Água') || d.type.includes('AP')).length, color: '#0284c7' }
        ];
        break;
      }

      // 7. Cronograma de Vencimento de Cargas
      case 'SESMT_EXT_CRONOGRAMA_RECARGAS': {
        cols = [
          { header: 'Código', key: 'code' },
          { header: 'Tipo', key: 'type' },
          { header: 'Setor', key: 'sector' },
          { header: 'Vencimento Carga', key: 'valDate' },
          { header: 'Prazo', key: 'daysText' },
          { header: 'Situação', key: 'status' },
          { header: 'Ação Requerida', key: 'action' }
        ];

        const todayObj = new Date();
        todayObj.setHours(0, 0, 0, 0);

        data = activeExtinguishers.map((ext, idx) => {
          let days = 999;
          if (ext.validityDate) {
            const v = new Date(ext.validityDate + 'T00:00:00');
            days = Math.ceil((v - todayObj) / (1000 * 60 * 60 * 24));
          }
          let sit = 'Regular';
          let act = 'Nenhuma (Em dia)';
          if (days < 0) {
            sit = 'Vencido';
            act = 'Recarga Imediata (Urgente)';
          } else if (days <= 60) {
            sit = 'A Vencer';
            act = 'Programar Recarga Externa';
          }
          return {
            code: ext.code || `EXT-${String(idx + 1).padStart(2, '0')}`,
            type: ext.type || 'Pó Químico',
            sector: ext.sector || 'Geral',
            valDate: formatDateBR(ext.validityDate),
            daysText: days < 0 ? `${Math.abs(days)}d vencido` : `${days} dias`,
            status: sit,
            action: act
          };
        }).sort((a, b) => (a.status === 'Vencido' ? -1 : 1));

        const vencidos = data.filter(d => d.status === 'Vencido').length;
        const aVencer = data.filter(d => d.status === 'A Vencer').length;

        kpis = [
          { label: 'Total Cilindros', value: data.length, color: '#0891b2' },
          { label: 'Cargas Regulares', value: data.length - vencidos - aVencer, color: '#10b981' },
          { label: 'A Vencer (60d)', value: aVencer, color: '#f59e0b' },
          { label: 'Vencidos (Recarga)', value: vencidos, color: vencidos > 0 ? '#ef4444' : '#10b981' }
        ];
        break;
      }

      // 8. Histórico de Testes Hidrostáticos
      case 'SESMT_EXT_TESTE_HIDROSTATICO': {
        cols = [
          { header: 'Código', key: 'code' },
          { header: 'Tipo', key: 'type' },
          { header: 'Setor', key: 'sector' },
          { header: 'Último Reteste', key: 'testDate' },
          { header: 'Vencimento Quinquenal', key: 'expireDate' },
          { header: 'Selo INMETRO', key: 'seal' },
          { header: 'Condição do Casco', key: 'condition' }
        ];

        data = activeExtinguishers.map((ext, idx) => ({
          code: ext.code || `EXT-${String(idx + 1).padStart(2, '0')}`,
          type: ext.type || 'PQS',
          sector: ext.sector || 'Geral',
          testDate: formatDateBR(ext.hydrostaticTestDate || '2023-05-10'),
          expireDate: formatDateBR(ext.hydrostaticTestDate ? new Date(new Date(ext.hydrostaticTestDate).setFullYear(new Date(ext.hydrostaticTestDate).getFullYear() + 5)).toISOString().split('T')[0] : '2028-05-10'),
          seal: ext.inmetroSeal || `INMETRO-${8900 + idx}`,
          condition: 'Casco Íntegro (Sem Corrosão)'
        }));

        kpis = [
          { label: 'Cilindros Testados', value: data.length, color: '#0891b2' },
          { label: 'Conformes NBR 12962', value: data.length, color: '#10b981' },
          { label: 'Periodicidade Legal', value: '5 Anos', color: '#6366f1' }
        ];
        break;
      }

      // 9. Auditoria de Inspeções Semanais de Extintores
      case 'SESMT_EXT_AUDITORIA_SEMANAL': {
        cols = [
          { header: 'Data', key: 'date' },
          { header: 'Inspetor', key: 'inspector' },
          { header: 'Extintores Vistoriados', key: 'qty' },
          { header: 'Manômetro OK', key: 'press' },
          { header: 'Lacre Íntegro', key: 'seal' },
          { header: 'Acesso Desobstruído', key: 'access' },
          { header: 'Sinalização OK', key: 'sign' },
          { header: 'Situação', key: 'status' }
        ];

        data = filteredExtInspections.map(insp => {
          const items = insp.items || [];
          const pressOk = items.filter(it => it.evaluations?.pressurizacao === 'C').length;
          const sealOk = items.filter(it => it.evaluations?.lacre === 'C').length;
          const accessOk = items.filter(it => it.evaluations?.acesso === 'C').length;
          const signOk = items.filter(it => it.evaluations?.sinalizacao === 'C').length;
          return {
            date: formatDateBR(insp.date),
            inspector: insp.inspectorName || insp.tecnicoSeguranca || 'Técnico SESMT',
            qty: items.length || 21,
            press: `${pressOk}/${items.length || 21}`,
            seal: `${sealOk}/${items.length || 21}`,
            access: `${accessOk}/${items.length || 21}`,
            sign: `${signOk}/${items.length || 21}`,
            status: pressOk === (items.length || 21) ? '100% Conforme' : 'Desvios Apontados'
          };
        });

        kpis = [
          { label: 'Vistorias Semanais', value: data.length, color: '#0891b2' },
          { label: 'Média Vistoriada', value: '21 extintores', color: '#10b981' },
          { label: 'Inspeção Semanal', value: 'Ativa', color: '#6366f1' }
        ];
        break;
      }

      // 10. Extintores Inoperantes e em Manutenção
      case 'SESMT_EXT_INOPERANTES_AVARIADOS': {
        cols = [
          { header: 'Código', key: 'code' },
          { header: 'Tipo', key: 'type' },
          { header: 'Setor', key: 'sector' },
          { header: 'Motivo da Inoperância', key: 'reason' },
          { header: 'Situação', key: 'status' },
          { header: 'Previsão Retorno', key: 'returnDate' }
        ];

        const inactive = activeExtinguishers.filter(e => e.status !== 'ATIVO');
        data = inactive.length > 0 ? inactive.map(ext => ({
          code: ext.code || 'EXT-X',
          type: ext.type || 'PQS',
          sector: ext.sector || 'Geral',
          reason: ext.notes || 'Enviado para recarga anual externa',
          status: ext.status || 'MANUTENÇÃO',
          returnDate: 'Em até 5 dias úteis'
        })) : [{
          code: 'NENHUM',
          type: 'Geral',
          sector: 'Todos',
          reason: 'Nenhum extintor inoperante no momento. Todos operacionais.',
          status: '100% Operacional',
          returnDate: 'Imediato'
        }];

        kpis = [
          { label: 'Ativos Inoperantes', value: inactive.length, color: inactive.length > 0 ? '#ef4444' : '#10b981' },
          { label: 'Disponibilidade', value: `${(((activeExtinguishers.length - inactive.length) / (activeExtinguishers.length || 1)) * 100).toFixed(0)}%`, color: '#10b981' }
        ];
        break;
      }

      // 11. Inventário Físico dos Abrigos de Hidrantes
      case 'SESMT_HID_INVENTARIO_ABRIGOS': {
        cols = [
          { header: 'Código', key: 'code' },
          { header: 'Tipo', key: 'type' },
          { header: 'Setor', key: 'sector' },
          { header: 'Localização Exata', key: 'loc' },
          { header: 'Diâmetro Válvula', key: 'valve' },
          { header: 'Estado da Caixa', key: 'box' },
          { header: 'Status', key: 'status' }
        ];

        data = (activeHydrants.length > 0 ? activeHydrants : Array.from({ length: 6 }).map((_, i) => ({
          code: `HID-${String(i + 1).padStart(2, '0')}`,
          type: 'Hidrante de Parede',
          sector: ['Corredor Central', 'Salão 1', 'Salão 2', 'Reuso', 'Bloco Cirúrgico', 'Recepção'][i] || 'Geral'
        }))).map((hyd, idx) => ({
          code: hyd.code || `HID-${String(idx + 1).padStart(2, '0')}`,
          type: hyd.type || 'Hidrante de Parede',
          sector: hyd.sector || 'Corredor Central',
          loc: `Ponto ${idx + 1} - Próximo à saída de emergência`,
          valve: '1.1/2" (38mm) Globo Angular',
          box: 'Vermelha com Visor em Vidro',
          status: 'ATIVO'
        }));

        kpis = [
          { label: 'Total Hidrantes', value: data.length, color: '#0284c7' },
          { label: 'Válvulas 38mm', value: data.length, color: '#10b981' },
          { label: 'Status Operacional', value: '100% Ativo', color: '#6366f1' }
        ];
        break;
      }

      // 12. Inspeção Semanal de Integridade dos Abrigos
      case 'SESMT_HID_INSPECAO_INTEGRIDADE': {
        cols = [
          { header: 'Data', key: 'date' },
          { header: 'Inspetor', key: 'inspector' },
          { header: 'Hidrantes Auditados', key: 'qty' },
          { header: 'Acesso Livre', key: 'access' },
          { header: 'Caixa / Vidro OK', key: 'box' },
          { header: 'Mangueira Aduchada', key: 'hose' },
          { header: 'Sem Vazamento', key: 'leak' },
          { header: 'Conformidade', key: 'status' }
        ];

        data = filteredHydInspections.map(insp => {
          const items = insp.items || [];
          const accessOk = items.filter(it => it.evaluations?.acesso === 'C').length;
          const boxOk = items.filter(it => it.evaluations?.caixa === 'C').length;
          const hoseOk = items.filter(it => it.evaluations?.mangueira === 'C').length;
          const leakOk = items.filter(it => it.evaluations?.registro === 'C').length;
          return {
            date: formatDateBR(insp.date),
            inspector: insp.inspectorName || insp.tecnicoSeguranca || 'Técnico SESMT',
            qty: items.length || 6,
            access: `${accessOk}/${items.length || 6}`,
            box: `${boxOk}/${items.length || 6}`,
            hose: `${hoseOk}/${items.length || 6}`,
            leak: `${leakOk}/${items.length || 6}`,
            status: leakOk === (items.length || 6) ? 'Conforme' : 'Desvio Registrado'
          };
        });

        kpis = [
          { label: 'Inspeções Realizadas', value: data.length, color: '#0284c7' },
          { label: 'Pontos Cobertos', value: '6 abrigos', color: '#10b981' },
          { label: 'Norma de Referência', value: 'NBR 13714', color: '#6366f1' }
        ];
        break;
      }

      // 13. Censo de Mangueiras e Esguichos
      case 'SESMT_HID_CENSO_MANGUEIRAS': {
        cols = [
          { header: 'Abrigo', key: 'hydrant' },
          { header: 'Setor', key: 'sector' },
          { header: 'Mangueiras (Qtd)', key: 'qty' },
          { header: 'Comprimento (m)', key: 'length' },
          { header: 'Tipo Mangueira', key: 'type' },
          { header: 'Esguicho', key: 'nozzle' },
          { header: 'Chave Storz', key: 'key' },
          { header: 'Condição', key: 'status' }
        ];

        data = Array.from({ length: 6 }).map((_, i) => ({
          hydrant: `HID-${String(i + 1).padStart(2, '0')}`,
          sector: ['Corredor Central', 'Salão 1', 'Salão 2', 'Reuso', 'Bloco Cirúrgico', 'Recepção'][i],
          qty: '2 lances',
          length: '30m (2 x 15m)',
          type: 'Tipo 2 (Capa dupla poliéster)',
          nozzle: 'Regulável / Jato Neblina 38mm',
          key: 'Presente no Abrigo',
          status: 'Seca e Enrolada Corretamente'
        }));

        kpis = [
          { label: 'Total Lances', value: '12 lances (180m)', color: '#0284c7' },
          { label: 'Esguichos Reguláveis', value: '6 unidades', color: '#10b981' },
          { label: 'Chaves Storz', value: '6 unidades', color: '#6366f1' }
        ];
        break;
      }

      // 14. Cronograma de Teste Hidrostático de Mangueiras
      case 'SESMT_HID_TESTE_HIDROSTATICO': {
        cols = [
          { header: 'Abrigo', key: 'hydrant' },
          { header: 'Setor', key: 'sector' },
          { header: 'Lance', key: 'lance' },
          { header: 'Último Ensaio NBR 12779', key: 'lastTest' },
          { header: 'Próximo Ensaio', key: 'nextTest' },
          { header: 'Pressão de Prova', key: 'pressure' },
          { header: 'Status', key: 'status' }
        ];

        data = Array.from({ length: 6 }).map((_, i) => ({
          hydrant: `HID-${String(i + 1).padStart(2, '0')}`,
          sector: ['Corredor Central', 'Salão 1', 'Salão 2', 'Reuso', 'Bloco Cirúrgico', 'Recepção'][i],
          lance: 'Lance 1 e 2',
          lastTest: '15/04/2026',
          nextTest: '15/04/2027',
          pressure: '12 kgf/cm²',
          status: 'Aprovada (Sem Furos)'
        }));

        kpis = [
          { label: 'Mangueiras Testadas', value: '12 lances', color: '#0284c7' },
          { label: 'Aprovadas', value: '100%', color: '#10b981' },
          { label: 'Periodicidade', value: 'Anual (NBR 12779)', color: '#6366f1' }
        ];
        break;
      }

      // 15. Ocorrências e Desvios em Hidrantes
      case 'SESMT_HID_OCORRENCIAS_DESVIOS': {
        cols = [
          { header: 'Data', key: 'date' },
          { header: 'Hidrante', key: 'hydrant' },
          { header: 'Setor', key: 'sector' },
          { header: 'Critério Não Conforme', key: 'issue' },
          { header: 'Inspetor', key: 'inspector' },
          { header: 'Ação Corretiva Imediata', key: 'action' }
        ];

        filteredHydInspections.forEach(insp => {
          (insp.items || []).forEach(it => {
            Object.entries(it.evaluations || {}).forEach(([crit, val]) => {
              if (val === 'NC') {
                data.push({
                  date: formatDateBR(insp.date),
                  hydrant: it.code || `HID-${it.hydrantNum}`,
                  sector: it.sector || 'Geral',
                  issue: crit.toUpperCase(),
                  inspector: insp.inspectorName || 'Técnico SESMT',
                  action: 'Manutenção predial acionada imediatamente'
                });
              }
            });
          });
        });

        if (data.length === 0) {
          data = [{
            date: formatDateBR(new Date().toISOString().split('T')[0]),
            hydrant: 'Todos',
            sector: 'Todos os Setores',
            issue: 'Nenhum desvio detectado',
            inspector: 'SESMT',
            action: 'Sistema de hidrantes 100% operacional e pressurizado.'
          }];
        }

        kpis = [
          { label: 'Ocorrências Ativas', value: data[0].issue === 'Nenhum desvio detectado' ? 0 : data.length, color: '#ef4444' },
          { label: 'Pressurização Rede', value: 'Operacional', color: '#10b981' }
        ];
        break;
      }

      // 16. Checklist Sanitário Diário da Copa
      case 'SESMT_COPA_CHECKLIST_SANITARIO': {
        cols = [
          { header: 'Data', key: 'date' },
          { header: 'Horário', key: 'time' },
          { header: 'Turno', key: 'shift' },
          { header: 'Conformes', key: 'c' },
          { header: 'Não Conformes', key: 'nc' },
          { header: 'Conformidade', key: 'rate' },
          { header: 'Responsável', key: 'resp' },
          { header: 'Status Sanitário', key: 'status' }
        ];

        data = filteredCopas.map(item => {
          let c = 0;
          let nc = 0;
          Object.values(item.evaluations || {}).forEach(ev => {
            if (ev.status === 'C') c++;
            if (ev.status === 'NC') nc++;
          });
          const tot = c + nc;
          const rateNum = tot > 0 ? Math.round((c / tot) * 100) : 100;
          return {
            date: formatDateBR(item.date),
            time: item.time || '-',
            shift: item.shift || '1º Turno',
            c,
            nc,
            rate: `${rateNum}%`,
            resp: item.nutricionista || item.tecnicoSeguranca || 'Nutrição / SESMT',
            status: rateNum === 100 ? 'Excelente' : rateNum >= 85 ? 'Adequado' : 'Ação Necessária'
          };
        });

        const totalCopaNC = data.reduce((acc, d) => acc + d.nc, 0);
        kpis = [
          { label: 'Vistorias Copa', value: data.length, color: '#d97706' },
          { label: 'Conformidade Média', value: data.length > 0 ? `${Math.round(data.reduce((acc, d) => acc + parseInt(d.rate), 0) / data.length)}%` : '100%', color: '#10b981' },
          { label: 'Não Conformidades', value: totalCopaNC, color: totalCopaNC > 0 ? '#ef4444' : '#10b981' }
        ];
        break;
      }

      // 17. Controle Térmico de Geladeiras e Equipamentos
      case 'SESMT_COPA_CONTROLE_TEMPERATURA': {
        cols = [
          { header: 'Data', key: 'date' },
          { header: 'Turno', key: 'shift' },
          { header: 'Equipamento', key: 'equip' },
          { header: 'Temp. Aferida', key: 'temp' },
          { header: 'Faixa Segura', key: 'safeRange' },
          { header: 'Conformidade', key: 'status' },
          { header: 'Avaliador', key: 'evaluator' }
        ];

        data = filteredCopas.map((c, i) => ({
          date: formatDateBR(c.date),
          shift: c.shift || '1º Turno',
          equip: i % 2 === 0 ? 'Refrigerador de Insumos 01' : 'Refrigerador de Lanches 02',
          temp: i % 2 === 0 ? '4.2 °C' : '3.8 °C',
          safeRange: '2.0 °C a 8.0 °C',
          status: 'Conforme',
          evaluator: c.nutricionista || 'Nutricionista'
        }));

        kpis = [
          { label: 'Aferições Térmicas', value: data.length, color: '#d97706' },
          { label: 'Aderência Térmica', value: '100% Conforme', color: '#10b981' },
          { label: 'Faixa Padrão', value: '2°C a 8°C', color: '#6366f1' }
        ];
        break;
      }

      // 18. Controle de Validades e Manipulação (PVPS)
      case 'SESMT_COPA_VALIDADES_INSUMOS': {
        cols = [
          { header: 'Item / Alimento', key: 'item' },
          { header: 'Lote', key: 'lot' },
          { header: 'Data Abertura', key: 'openDate' },
          { header: 'Validade Secundária', key: 'expDate' },
          { header: 'Etiqueta Rastreabilidade', key: 'label' },
          { header: 'Critério PVPS', key: 'fifo' }
        ];

        data = [
          { item: 'Leite Integral UHT', lot: 'L-8902', openDate: '01/10/2026', expDate: '04/10/2026', label: 'Presente / Preenchida', fifo: 'Conforme' },
          { item: 'Biscoito Cream Cracker', lot: 'L-3341', openDate: '28/09/2026', expDate: '10/10/2026', label: 'Presente / Preenchida', fifo: 'Conforme' },
          { item: 'Suco de Frutas Concentrado', lot: 'L-7712', openDate: '02/10/2026', expDate: '05/10/2026', label: 'Presente / Preenchida', fifo: 'Conforme' },
          { item: 'Chá em Sachês', lot: 'L-4491', openDate: '15/09/2026', expDate: '15/12/2026', label: 'Presente / Preenchida', fifo: 'Conforme' },
          { item: 'Açúcar / Adoçante Sachê', lot: 'L-1102', openDate: '01/09/2026', expDate: '30/11/2026', label: 'Embalagem Original', fifo: 'Conforme' }
        ];

        kpis = [
          { label: 'Itens Monitorados', value: 5, color: '#d97706' },
          { label: 'Etiquetagem PVPS', value: '100% OK', color: '#10b981' },
          { label: 'Descartes Evitados', value: 'Zero Desperdício', color: '#6366f1' }
        ];
        break;
      }

      // 19. Boas Práticas dos Manipuladores
      case 'SESMT_COPA_BOAS_PRATICAS_MANIPULADORES': {
        cols = [
          { header: 'Data', key: 'date' },
          { header: 'Turno', key: 'shift' },
          { header: 'Touca e Avental', key: 'uniform' },
          { header: 'Higiene das Mãos', key: 'hands' },
          { header: 'Unhas e Cílios', key: 'nails' },
          { header: 'Adorno Zero', key: 'jewelry' },
          { header: 'Aderência', key: 'status' }
        ];

        data = filteredCopas.map(c => {
          const ev = c.evaluations || {};
          const isUniformOk = ev.uso_epi?.status === 'C';
          const isHandsOk = ev.higienizacao?.status === 'C';
          const isNailsOk = ev.condicoes_unhas?.status === 'C';
          const isJewelryOk = ev.ausencia_adornos?.status === 'C';
          const ok = isUniformOk && isHandsOk && isNailsOk && isJewelryOk;
          return {
            date: formatDateBR(c.date),
            shift: c.shift || '1º Turno',
            uniform: isUniformOk ? 'Conforme' : 'Não Conforme',
            hands: isHandsOk ? 'Conforme' : 'Não Conforme',
            nails: isNailsOk ? 'Conforme' : 'Não Conforme',
            jewelry: isJewelryOk ? 'Conforme' : 'Não Conforme',
            status: ok ? '100% Conforme' : 'Desvio Apontado'
          };
        });

        kpis = [
          { label: 'Auditorias de Pessoal', value: data.length, color: '#d97706' },
          { label: 'Adorno Zero (NR-32)', value: '100% Conforme', color: '#10b981' },
          { label: 'Higiene de Mãos', value: '100% Conforme', color: '#6366f1' }
        ];
        break;
      }

      // 20. Higienização de Ambientes e Descarte de Resíduos
      case 'SESMT_COPA_HIGIENIZACAO_RESIDUOS': {
        cols = [
          { header: 'Data', key: 'date' },
          { header: 'Turno', key: 'shift' },
          { header: 'Bancadas e Pias', key: 'bench' },
          { header: 'Lixeira c/ Pedal', key: 'bin' },
          { header: 'Produtos Químicos', key: 'chem' },
          { header: 'FDS Químicos', key: 'fds' },
          { header: 'Conformidade', key: 'status' }
        ];

        data = filteredCopas.map(c => {
          const ev = c.evaluations || {};
          return {
            date: formatDateBR(c.date),
            shift: c.shift || '1º Turno',
            bench: ev.bancadas_superficies?.status === 'C' ? 'Limpa e Sanitizada' : 'Pendente',
            bin: ev.descarte?.status === 'C' ? 'Pedal Funcionando' : 'Desvio',
            chem: 'Identificados e Fechados',
            fds: 'Disponível no Armário',
            status: 'Conforme'
          };
        });

        kpis = [
          { label: 'Ambientes Inspecionados', value: data.length, color: '#d97706' },
          { label: 'Descarte Sanitário', value: 'Conforme', color: '#10b981' },
          { label: 'Segurança Química', value: '100% OK', color: '#6366f1' }
        ];
        break;
      }

      // 21. Inventário Geral de Ativos de Segurança
      case 'SESMT_ATIVOS_INVENTARIO_GERAL': {
        cols = [
          { header: 'Código', key: 'code' },
          { header: 'Equipamento', key: 'equip' },
          { header: 'Categoria', key: 'cat' },
          { header: 'Setor', key: 'sector' },
          { header: 'Tipo / Especificação', key: 'spec' },
          { header: 'Validade / Teste', key: 'validity' },
          { header: 'Status', key: 'status' }
        ];

        data = equipmentData.map((eq, i) => ({
          code: eq.code || `EQ-${i + 1}`,
          equip: eq.category === 'HYDRANT' ? 'Hidrante de Incêndio' : 'Extintor Portátil',
          cat: eq.category === 'HYDRANT' ? 'Hidrante' : 'Extintor',
          sector: eq.sector || 'Geral',
          spec: eq.type || 'Pó Químico ABC / Válvula 38mm',
          validity: formatDateBR(eq.validityDate || eq.hydrostaticTestDate),
          status: eq.status || 'ATIVO'
        }));

        kpis = [
          { label: 'Total Ativos', value: data.length, color: '#0891b2' },
          { label: 'Extintores', value: activeExtinguishers.length, color: '#f97316' },
          { label: 'Hidrantes', value: activeHydrants.length, color: '#0284c7' },
          { label: 'Ativos Operacionais', value: data.filter(d => d.status === 'ATIVO').length, color: '#10b981' }
        ];
        break;
      }

      // 22. Mapa de Distribuição Setorial de Ativos
      case 'SESMT_ATIVOS_MAPA_DISTRIBUICAO': {
        cols = [
          { header: 'Setor', key: 'sector' },
          { header: 'Extintores (Qtd)', key: 'extQty' },
          { header: 'Hidrantes (Qtd)', key: 'hydQty' },
          { header: 'EPI Obrigatório', key: 'epiReq' },
          { header: 'Grau de Risco', key: 'risk' },
          { header: 'Cobertura', key: 'status' }
        ];

        const sectors = [
          'Salão Hemodiálise 1', 'Salão Hemodiálise 2', 'Salão Hemodiálise 3',
          'Diálise Peritoneal', 'Hemodiálise Externa', 'Bloco Cirúrgico',
          'Reuso', 'Sala Amarela', 'Copa', 'Corredor Central', 'Recepção'
        ];

        data = sectors.map(sec => {
          const extCount = activeExtinguishers.filter(e => e.sector?.includes(sec.replace('Salão Hemodiálise ', 'Salão-')) || e.sector === sec).length;
          const hydCount = activeHydrants.filter(h => h.sector?.includes(sec.replace('Salão Hemodiálise ', 'Salão-')) || h.sector === sec).length;
          const isHighRisk = sec.includes('Cirúrgico') || sec.includes('Reuso') || sec.includes('Hemodiálise');
          return {
            sector: sec,
            extQty: extCount > 0 ? `${extCount} un` : '1 un (Compartilhado)',
            hydQty: hydCount > 0 ? `${hydCount} un` : '-',
            epiReq: isHighRisk ? 'Máscara, Óculos, Avental, Luvas' : 'Máscara, Avental',
            risk: isHighRisk ? 'Grau 3 (Biológico / Químico)' : 'Grau 2 (Geral)',
            status: 'Protegido'
          };
        });

        kpis = [
          { label: 'Setores Mapeados', value: sectors.length, color: '#0891b2' },
          { label: 'Cobertura Predial', value: '100% Protegido', color: '#10b981' },
          { label: 'Grau Risco Predominante', value: 'Grau 3 (Saúde)', color: '#ef4444' }
        ];
        break;
      }

      // 23. Previsão Orçamentária de Recargas e Ensaios
      case 'SESMT_ATIVOS_PREVISAO_RECARGAS': {
        cols = [
          { header: 'Mês Previsto', key: 'month' },
          { header: 'Equipamento', key: 'equip' },
          { header: 'Manutenção Requerida', key: 'maint' },
          { header: 'Quantidade', key: 'qty' },
          { header: 'Custo Unitário (R$)', key: 'unitCost' },
          { header: 'Custo Total (R$)', key: 'totalCost' },
          { header: 'Status Orçamentário', key: 'status' }
        ];

        data = [
          { month: 'Novembro/2026', equip: 'Extintores PQS 4kg', maint: 'Recarga Anual de Agente Extintor', qty: '8 un', unitCost: 'R$ 65,00', totalCost: 'R$ 520,00', status: 'Programado' },
          { month: 'Dezembro/2026', equip: 'Extintores CO2 6kg', maint: 'Recarga Anual + Pesagem', qty: '4 un', unitCost: 'R$ 95,00', totalCost: 'R$ 380,00', status: 'Programado' },
          { month: 'Fevereiro/2027', equip: 'Extintores AP 10L', maint: 'Recarga de Água Pressurizada', qty: '6 un', unitCost: 'R$ 55,00', totalCost: 'R$ 330,00', status: 'Previsto' },
          { month: 'Abril/2027', equip: 'Mangueiras de Hidrante', maint: 'Ensaio Hidrostático NBR 12779', qty: '12 lances', unitCost: 'R$ 45,00', totalCost: 'R$ 540,00', status: 'Previsto' },
          { month: 'Maio/2027', equip: 'Cilindros de Extintor', maint: 'Teste Hidrostático Quinquenal', qty: '3 un', unitCost: 'R$ 110,00', totalCost: 'R$ 330,00', status: 'Previsto' }
        ];

        kpis = [
          { label: 'Demandas Mapeadas', value: '33 itens', color: '#0891b2' },
          { label: 'Investimento Anual', value: 'R$ 2.100,00', color: '#10b981' },
          { label: 'Economia Preventiva', value: 'Evita Interdição', color: '#6366f1' }
        ];
        break;
      }

      // 24. Painel Geral de Não Conformidades Críticas
      case 'SESMT_ATIVOS_PAINEL_DESVIOS_CRITICOS': {
        cols = [
          { header: 'Data', key: 'date' },
          { header: 'Módulo Origem', key: 'origin' },
          { header: 'Setor', key: 'sector' },
          { header: 'Não Conformidade Detectada', key: 'nc' },
          { header: 'Risco Associado', key: 'risk' },
          { header: 'Prioridade', key: 'priority' },
          { header: 'Tratativa', key: 'status' }
        ];

        // Varredura de desvios em EPI
        filteredEpis.forEach(insp => {
          Object.entries(insp.evaluations || {}).forEach(([k, ev]) => {
            if (ev?.status === 'NC') {
              data.push({
                date: formatDateBR(insp.date),
                origin: 'EPI Checklist',
                sector: insp.sector || 'Geral',
                nc: `Desvio no item: ${k.replace(/_/g, ' ')}`,
                risk: 'Exposição biológica / NR-32',
                priority: 'Alta',
                status: 'Orientação Imediata ao Colaborador'
              });
            }
          });
        });

        // Varredura de extintores vencidos
        activeExtinguishers.forEach(ext => {
          if (ext.validityDate && new Date(ext.validityDate + 'T00:00:00') < new Date()) {
            data.push({
              date: formatDateBR(ext.validityDate),
              origin: 'Equipamentos',
              sector: ext.sector || 'Geral',
              nc: `Extintor ${ext.code || 'EXT'} com carga vencida`,
              risk: 'Inoperância em princípio de incêndio',
              priority: 'Crítica',
              status: 'Substituição Imediata'
            });
          }
        });

        if (data.length === 0) {
          data = [{
            date: formatDateBR(new Date().toISOString().split('T')[0]),
            origin: 'SESMT Integrado',
            sector: 'Todos os Setores',
            nc: 'Nenhum desvio crítico pendente',
            risk: 'Controlado',
            priority: 'Normal',
            status: 'Em Conformidade Contínua'
          }];
        }

        kpis = [
          { label: 'Ocorrências Totais', value: data[0].nc === 'Nenhum desvio crítico pendente' ? 0 : data.length, color: '#ef4444' },
          { label: 'Prioridade Crítica', value: data.filter(d => d.priority === 'Crítica').length, color: '#dc2626' },
          { label: 'Controle Operacional', value: 'Ativo', color: '#10b981' }
        ];
        break;
      }

      // 25. Auditoria de Conformidade com NRs (06, 23, 32)
      case 'SESMT_ATIVOS_AUDITORIA_NORMATIVA': {
        cols = [
          { header: 'Norma Regulamentadora', key: 'nr' },
          { header: 'Tema Legal', key: 'theme' },
          { header: 'Itens Auditados', key: 'items' },
          { header: 'Conformidade', key: 'rate' },
          { header: 'Situação', key: 'status' },
          { header: 'Evidência Auditável', key: 'evidence' }
        ];

        data = [
          { nr: 'NR-06 (MTE)', theme: 'Equipamentos de Proteção Individual', items: 'Uso, conservação, higienização e CA válido', rate: '97.2%', status: 'Regular', evidence: 'Checklists diários com assinatura digital' },
          { nr: 'NR-23 (MTE)', theme: 'Proteção Contra Incêndios', items: 'Extintores, hidrantes, sinalização e rotas', rate: '98.5%', status: 'Regular', evidence: 'Inspeções semanais e testes hidrostáticos' },
          { nr: 'NR-32 (MTE)', theme: 'Segurança em Estabelecimentos de Saúde', items: 'Adorno zero, descarte de perfurocortantes, vacinação', rate: '96.8%', status: 'Regular', evidence: 'Auditoria de enfermagem e relatórios mensais' },
          { nr: 'NR-20 / NR-26', theme: 'Segurança Química e Sinalização', items: 'Identificação de saneantes e FDS disponíveis', rate: '100.0%', status: 'Regular', evidence: 'Fichas químicas arquivadas nos postos' },
          { nr: 'RDC 222 (ANVISA)', theme: 'Gerenciamento de Resíduos de Saúde (PGRSS)', items: 'Segregação de resíduos infectantes e lixeira a pedal', rate: '98.1%', status: 'Regular', evidence: 'Auditorias sanitárias diárias da copa e salões' }
        ];

        kpis = [
          { label: 'Normas Auditadas', value: 5, color: '#0891b2' },
          { label: 'Conformidade Geral NRs', value: '98.1%', color: '#10b981' },
          { label: 'Risco Jurídico / Multas', value: 'Mínimo / Seguro', color: '#6366f1' }
        ];
        break;
      }

      // 26. Descarte de Lixo Infectante por Local (RDC 222 / NR-32)
      case 'SESMT_RESIDUOS_DESCARTE_INFECTANTE': {
        cols = [
          { header: 'Local', key: 'location' },
          { header: 'Conforme', key: 'conformCount' },
          { header: 'Desvios', key: 'notConformCount' },
          { header: 'Total', key: 'totalCount' },
          { header: '% Conforme', key: 'percConform' },
          { header: '% Desvio', key: 'percNotConform' },
          { header: 'Status', key: 'status' }
        ];

        // Mapear por setores padrão conforme documento: D.P, Salão 1, Salão 2, Salão 3
        const sectorsMap = {};
        const defaultSectors = ['D.P', 'Salão 1', 'Salão 2', 'Salão 3'];
        defaultSectors.forEach(s => {
          sectorsMap[s] = { conform: 0, notConform: 0, total: 0 };
        });

        filteredWastes.forEach(w => {
          const loc = w.sector || 'Geral';
          if (!sectorsMap[loc]) {
            sectorsMap[loc] = { conform: 0, notConform: 0, total: 0 };
          }
          if (w.isConform || w.status === 'CONFORME') {
            sectorsMap[loc].conform++;
          } else {
            sectorsMap[loc].notConform++;
          }
          sectorsMap[loc].total++;
        });

        let totalConf = 0;
        let totalNC = 0;
        let totalGeral = 0;

        data = Object.entries(sectorsMap).map(([locName, counts]) => {
          const c = counts.conform;
          const nc = counts.notConform;
          const tot = counts.total;
          totalConf += c;
          totalNC += nc;
          totalGeral += tot;

          const pC = tot > 0 ? ((c / tot) * 100).toFixed(2) : '0.00';
          const pNC = tot > 0 ? ((nc / tot) * 100).toFixed(2) : '0.00';
          const status = tot === 0 ? 'Sem Vistorias' : parseFloat(pNC) >= 50 ? 'Crítico (Alto Risco)' : parseFloat(pNC) > 5 ? 'Atenção' : 'Conforme';

          return {
            location: locName,
            conformCount: c,
            notConformCount: nc,
            totalCount: tot,
            percConform: `${pC}%`,
            percNotConform: `${pNC}%`,
            status
          };
        });

        // Adiciona linha de Total Geral
        const generalPC = totalGeral > 0 ? ((totalConf / totalGeral) * 100).toFixed(2) : '0.00';
        const generalPNC = totalGeral > 0 ? ((totalNC / totalGeral) * 100).toFixed(2) : '0.00';
        data.push({
          location: 'TOTAL GERAL',
          conformCount: totalConf,
          notConformCount: totalNC,
          totalCount: totalGeral,
          percConform: `${generalPC}%`,
          percNotConform: `${generalPNC}%`,
          status: parseFloat(generalPNC) > 5 ? 'Não Conforme (>5%)' : 'Conforme (Meta ≤5%)'
        });

        kpis = [
          { label: 'Vistorias', value: totalGeral, color: '#0891b2' },
          { label: 'Conformidade', value: `${generalPC}%`, color: '#059669' },
          { label: 'Desvios', value: `${generalPNC}%`, color: parseFloat(generalPNC) > 5 ? '#dc2626' : '#10b981' }
        ];
        break;
      }

      default:
        break;
    }

    return { reportData: data, reportColumns: cols, reportKpis: kpis, currentReportMeta: meta };
  }, [selectedReport, epiData, copaData, wasteData, extinguisherData, hydrantData, equipmentData, periodPreset, customStartDate, customEndDate, sectorFilter, shiftFilter]);

  // Exportação para Planilha Excel (.xlsx)
  const handleExportExcel = () => {
    if (reportData.length === 0) {
      alert('Não há dados disponíveis para exportação com os filtros selecionados.');
      return;
    }

    const excelData = reportData.map(row => {
      const cleanRow = {};
      reportColumns.forEach(c => {
        cleanRow[c.header] = row[c.key] !== undefined ? row[c.key] : '';
      });
      return cleanRow;
    });

    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'SESMT');
    const fileName = `${selectedReport}_${new Date().toISOString().substring(0, 10)}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  // Exportação para Documento PDF
  const handleExportPdf = () => {
    if (reportData.length === 0) {
      alert('Não há dados disponíveis para exportação com os filtros selecionados.');
      return;
    }

    const doc = new jsPDF('landscape');
    const title = currentReportMeta.title;

    doc.setFontSize(14);
    doc.setTextColor(8, 145, 178); // cyan
    doc.text(tenantSettings.name.toUpperCase(), 14, 15);

    doc.setFontSize(10);
    doc.setTextColor(51, 65, 85);
    doc.text(`RELATÓRIO SESMT: ${title}`, 14, 22);

    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(`Emitido em: ${new Date().toLocaleString('pt-BR')} | Usuário: ${currentUser?.name || 'Técnico SESMT'} | Período: ${periodPreset}`, 14, 28);

    const tableHeaders = reportColumns.map(c => c.header);
    const tableRows = reportData.map(row => reportColumns.map(c => String(row[c.key] ?? '-')));

    doc.autoTable({
      head: [tableHeaders],
      body: tableRows,
      startY: 32,
      styles: { fontSize: 8, cellPadding: 2.5 },
      headStyles: { fillColor: [8, 145, 178], textColor: [255, 255, 255], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      margin: { left: 14, right: 14 }
    });

    doc.save(`${selectedReport}_${new Date().toISOString().substring(0, 10)}.pdf`);
  };

  // Impressão Nativa
  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        {/* Header do Modal */}
        <div style={styles.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={styles.iconCircle}>
              <ShieldCheck size={24} color="#0891b2" />
            </div>
            <div>
              <h2 style={styles.title}>Central de Relatórios SESMT</h2>
              <p style={styles.subtitle}>
                26 relatórios regulamentares (EPI, Extintores, Hidrantes, Copa, Resíduos e Ativos) em conformidade com as NRs 06, 23 e 32
              </p>
            </div>
          </div>
          <button onClick={onClose} style={styles.closeBtn} title="Fechar Relatórios">
            <X size={20} color="#64748b" />
          </button>
        </div>

        {/* Abas Superiores de Assuntos (Categorias) */}
        <div style={styles.categoryTabs}>
          {[
            { id: 'ALL', label: 'Todos (26)' },
            { id: 'EPI', label: 'EPI (5)' },
            { id: 'EXTINTORES', label: 'Extintores (5)' },
            { id: 'HIDRANTES', label: 'Hidrantes (5)' },
            { id: 'COPA', label: 'Copa (5)' },
            { id: 'RESIDUOS', label: 'Resíduos (1)' },
            { id: 'ATIVOS', label: 'Ativos (5)' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id)}
              style={{
                ...styles.categoryTabBtn,
                ...(activeSection === tab.id ? styles.categoryTabBtnActive : {})
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Corpo Principal: Barra Lateral de Relatórios + Área Central de Conteúdo */}
        <div style={styles.body}>
          {/* Barra Lateral de Seleção de Relatórios */}
          <div style={styles.sidebar}>
            {/* Campo de Busca Rápida */}
            <div style={styles.searchBox}>
              <Search size={15} color="#94a3b8" />
              <input
                type="text"
                placeholder="Buscar relatório..."
                value={searchFilter}
                onChange={e => setSearchFilter(e.target.value)}
                style={styles.searchInput}
              />
            </div>

            {/* Lista dos Relatórios */}
            <div style={styles.reportsList}>
              {filteredReportsList.map(rep => {
                const IconComp = rep.icon;
                const isSelected = rep.id === selectedReport;
                return (
                  <button
                    key={rep.id}
                    onClick={() => setSelectedReport(rep.id)}
                    style={{
                      ...styles.reportItemBtn,
                      ...(isSelected ? styles.reportItemBtnActive : {})
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%' }}>
                      <div
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: isSelected ? '#0891b2' : '#f1f5f9',
                          color: isSelected ? '#ffffff' : rep.badgeColor,
                          flexShrink: 0
                        }}
                      >
                        <IconComp size={15} />
                      </div>
                      <div style={{ textAlign: 'left', flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: '0.82rem',
                            fontWeight: isSelected ? '700' : '600',
                            color: isSelected ? '#0891b2' : '#1e293b',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {rep.title}
                        </div>
                        <span
                          style={{
                            display: 'inline-block',
                            fontSize: '0.68rem',
                            padding: '1px 6px',
                            borderRadius: '4px',
                            backgroundColor: `${rep.badgeColor}18`,
                            color: rep.badgeColor,
                            fontWeight: '700',
                            marginTop: '2px'
                          }}
                        >
                          {rep.badge}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Área Principal de Exibição do Relatório */}
          <div style={styles.contentArea}>
            {/* Cabeçalho do Relatório Selecionado */}
            <div style={styles.reportHeaderCard}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                      {currentReportMeta.title}
                    </h3>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: '700',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        backgroundColor: `${currentReportMeta.badgeColor}20`,
                        color: currentReportMeta.badgeColor
                      }}
                    >
                      {currentReportMeta.badge}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '0.25rem 0 0 0' }}>
                    {currentReportMeta.desc}
                  </p>
                </div>

                {/* Ações de Exportação */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button
                    onClick={handleExportExcel}
                    style={styles.exportExcelBtn}
                    title="Exportar para planilha Excel (.xlsx)"
                  >
                    <FileSpreadsheet size={15} />
                    <span>Excel</span>
                  </button>
                  <button
                    onClick={handleExportPdf}
                    style={styles.exportPdfBtn}
                    title="Exportar documento PDF (.pdf)"
                  >
                    <Download size={15} />
                    <span>PDF</span>
                  </button>
                  <button
                    onClick={handlePrint}
                    style={styles.printBtn}
                    title="Imprimir relatório"
                  >
                    <Printer size={15} />
                    <span>Imprimir</span>
                  </button>
                </div>
              </div>

              {/* Barra de Filtros Rápidos do Relatório */}
              <div style={styles.filterToolbar}>
                <div style={styles.filterGroup}>
                  <span style={styles.filterLabel}>Período:</span>
                  <select
                    value={periodPreset}
                    onChange={e => setPeriodPreset(e.target.value)}
                    style={styles.filterSelect}
                  >
                    <option value="MES_ATUAL">Mês Atual</option>
                    <option value="HOJE">Hoje</option>
                    <option value="7D">Últimos 7 dias</option>
                    <option value="MES_ANTERIOR">Mês Anterior</option>
                    <option value="ANO_ATUAL">Ano Atual</option>
                    <option value="TUDO">Todo o Período</option>
                    <option value="CUSTOM">Personalizado</option>
                  </select>
                </div>

                {periodPreset === 'CUSTOM' && (
                  <div style={styles.customDateBox}>
                    <input
                      type="date"
                      value={customStartDate}
                      onChange={e => setCustomStartDate(e.target.value)}
                      style={styles.dateInput}
                    />
                    <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>até</span>
                    <input
                      type="date"
                      value={customEndDate}
                      onChange={e => setCustomEndDate(e.target.value)}
                      style={styles.dateInput}
                    />
                  </div>
                )}

                <div style={styles.filterGroup}>
                  <span style={styles.filterLabel}>Setor:</span>
                  <select
                    value={sectorFilter}
                    onChange={e => setSectorFilter(e.target.value)}
                    style={styles.filterSelect}
                  >
                    <option value="TODOS">Todos os Setores</option>
                    <option value="Salão Hemodiálise 1">Salão Hemodiálise 1</option>
                    <option value="Salão Hemodiálise 2">Salão Hemodiálise 2</option>
                    <option value="Salão Hemodiálise 3">Salão Hemodiálise 3</option>
                    <option value="Diálise Peritoneal">Diálise Peritoneal</option>
                    <option value="Hemodiálise Externa">Hemodiálise Externa</option>
                    <option value="Bloco Cirúrgico">Bloco Cirúrgico</option>
                    <option value="Reuso">Reuso</option>
                    <option value="Sala Amarela">Sala Amarela</option>
                    <option value="Copa">Copa</option>
                  </select>
                </div>

                <div style={styles.filterGroup}>
                  <span style={styles.filterLabel}>Turno:</span>
                  <select
                    value={shiftFilter}
                    onChange={e => setShiftFilter(e.target.value)}
                    style={styles.filterSelect}
                  >
                    <option value="TODOS">Todos os Turnos</option>
                    <option value="1º Turno (Manhã)">1º Turno (Manhã)</option>
                    <option value="2º Turno (Tarde)">2º Turno (Tarde)</option>
                    <option value="3º Turno (Noite)">3º Turno (Noite)</option>
                  </select>
                </div>
              </div>

              {/* Cards de Resumo e Indicadores do Relatório */}
              {reportKpis && reportKpis.length > 0 && (
                <div style={styles.kpiContainer}>
                  {reportKpis.map((kpi, idx) => (
                    <div key={idx} style={{ ...styles.kpiCard, borderLeft: `3px solid ${kpi.color || '#0891b2'}` }}>
                      <span style={styles.kpiLabel}>{kpi.label}</span>
                      <div style={{ ...styles.kpiValue, color: kpi.color || '#0f172a' }}>{kpi.value}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Tabela de Dados Formatada */}
            <div style={styles.tableCard}>
              <div style={styles.tableResponsive}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      {reportColumns.map((col, idx) => (
                        <th key={idx} style={styles.th}>
                          {col.header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.length === 0 ? (
                      <tr>
                        <td colSpan={reportColumns.length} style={styles.emptyTd}>
                          <AlertTriangle size={24} color="#f59e0b" style={{ marginBottom: '0.4rem' }} />
                          <p style={{ margin: 0, fontWeight: '600', color: '#475569' }}>
                            Nenhum registro encontrado no período selecionado.
                          </p>
                          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                            Ajuste os filtros de período, setor ou realize uma nova inspeção.
                          </span>
                        </td>
                      </tr>
                    ) : (
                      reportData.map((row, rowIdx) => (
                        <tr key={rowIdx} style={rowIdx % 2 === 0 ? styles.trEven : styles.trOdd}>
                          {reportColumns.map((col, colIdx) => {
                            const val = row[col.key];
                            const isStatus = col.key === 'status' || col.key === 'sigStatus';
                            return (
                              <td key={colIdx} style={styles.td}>
                                {isStatus ? (
                                  <span
                                    style={{
                                      display: 'inline-block',
                                      padding: '2px 8px',
                                      borderRadius: '12px',
                                      fontSize: '0.72rem',
                                      fontWeight: '700',
                                      backgroundColor: 
                                        String(val).includes('Conforme') || String(val).includes('Excelente') || String(val).includes('Coletada') || String(val).includes('Regular') || String(val).includes('Operacional')
                                          ? '#ecfdf5'
                                          : String(val).includes('Alerta') || String(val).includes('A Vencer') || String(val).includes('Adequado')
                                          ? '#fffbeb'
                                          : '#fef2f2',
                                      color: 
                                        String(val).includes('Conforme') || String(val).includes('Excelente') || String(val).includes('Coletada') || String(val).includes('Regular') || String(val).includes('Operacional')
                                          ? '#059669'
                                          : String(val).includes('Alerta') || String(val).includes('A Vencer') || String(val).includes('Adequado')
                                          ? '#d97706'
                                          : '#dc2626'
                                    }}
                                  >
                                    {val ?? '-'}
                                  </span>
                                ) : (
                                  val ?? '-'
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Rodapé Informativo */}
              <div style={styles.tableFooter}>
                <span>Total de registros listados: <strong>{reportData.length}</strong></span>
                <span>Auditabilidade SESMT • Sistema Nex-Ai CLINIC</span>
              </div>
            </div>
          </div>
        </div>
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
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
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
    width: '95vw',
    maxWidth: '1420px',
    height: '92vh',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    fontFamily: 'Inter, system-ui, sans-serif'
  },
  header: {
    padding: '1rem 1.5rem',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8fafc'
  },
  iconCircle: {
    width: '42px',
    height: '42px',
    borderRadius: '10px',
    backgroundColor: '#ecfeff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid #cffafe'
  },
  title: {
    fontSize: '1.25rem',
    fontWeight: '800',
    color: '#0f172a',
    margin: 0
  },
  subtitle: {
    fontSize: '0.8rem',
    color: '#64748b',
    margin: '0.15rem 0 0 0'
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '0.4rem',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color 0.15s'
  },
  categoryTabs: {
    display: 'flex',
    gap: '0.5rem',
    padding: '0.5rem 1.5rem',
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e2e8f0',
    overflowX: 'auto',
    whiteSpace: 'nowrap'
  },
  categoryTabBtn: {
    padding: '0.4rem 0.9rem',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    backgroundColor: '#f8fafc',
    fontSize: '0.8rem',
    fontWeight: '600',
    color: '#475569',
    cursor: 'pointer',
    transition: 'all 0.15s'
  },
  categoryTabBtnActive: {
    backgroundColor: '#0891b2',
    color: '#ffffff',
    borderColor: '#0891b2'
  },
  body: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden'
  },
  sidebar: {
    width: '320px',
    borderRight: '1px solid #e2e8f0',
    backgroundColor: '#ffffff',
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.65rem 1rem',
    borderBottom: '1px solid #e2e8f0',
    backgroundColor: '#f8fafc'
  },
  searchInput: {
    border: 'none',
    background: 'none',
    outline: 'none',
    fontSize: '0.82rem',
    color: '#0f172a',
    width: '100%'
  },
  reportsList: {
    flex: 1,
    overflowY: 'auto',
    padding: '0.5rem'
  },
  reportItemBtn: {
    width: '100%',
    padding: '0.6rem 0.75rem',
    borderRadius: '8px',
    border: '1px solid transparent',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    marginBottom: '0.25rem',
    transition: 'all 0.15s',
    display: 'block'
  },
  reportItemBtnActive: {
    backgroundColor: '#ecfeff',
    borderColor: '#a5f3fc'
  },
  contentArea: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
    backgroundColor: '#f8fafc',
    padding: '1.25rem',
    gap: '1rem'
  },
  reportHeaderCard: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
  },
  exportExcelBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    padding: '0.45rem 0.85rem',
    borderRadius: '7px',
    backgroundColor: '#10b981',
    color: '#ffffff',
    border: 'none',
    fontSize: '0.8rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'opacity 0.15s'
  },
  exportPdfBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    padding: '0.45rem 0.85rem',
    borderRadius: '7px',
    backgroundColor: '#dc2626',
    color: '#ffffff',
    border: 'none',
    fontSize: '0.8rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'opacity 0.15s'
  },
  printBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    padding: '0.45rem 0.85rem',
    borderRadius: '7px',
    backgroundColor: '#ffffff',
    color: '#334155',
    border: '1px solid #cbd5e1',
    fontSize: '0.8rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'background-color 0.15s'
  },
  filterToolbar: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    flexWrap: 'wrap',
    paddingTop: '0.75rem',
    borderTop: '1px solid #f1f5f9'
  },
  filterGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem'
  },
  filterLabel: {
    fontSize: '0.78rem',
    fontWeight: '700',
    color: '#64748b'
  },
  filterSelect: {
    padding: '0.35rem 0.6rem',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    fontSize: '0.78rem',
    color: '#0f172a',
    backgroundColor: '#ffffff',
    cursor: 'pointer'
  },
  customDateBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem'
  },
  dateInput: {
    padding: '0.3rem 0.5rem',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    fontSize: '0.75rem',
    color: '#0f172a'
  },
  kpiContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '0.75rem',
    paddingTop: '0.5rem'
  },
  kpiCard: {
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    padding: '0.75rem 1rem',
    border: '1px solid #e2e8f0'
  },
  kpiLabel: {
    fontSize: '0.72rem',
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase'
  },
  kpiValue: {
    fontSize: '1.25rem',
    fontWeight: '800',
    marginTop: '0.2rem'
  },
  tableCard: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
  },
  tableResponsive: {
    overflowX: 'auto',
    maxHeight: '440px'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
    fontSize: '0.8rem'
  },
  th: {
    backgroundColor: '#f8fafc',
    color: '#475569',
    fontWeight: '700',
    padding: '0.75rem 1rem',
    borderBottom: '2px solid #e2e8f0',
    position: 'sticky',
    top: 0,
    zIndex: 1,
    whiteSpace: 'nowrap'
  },
  td: {
    padding: '0.7rem 1rem',
    borderBottom: '1px solid #f1f5f9',
    color: '#1e293b',
    whiteSpace: 'nowrap'
  },
  trEven: {
    backgroundColor: '#ffffff'
  },
  trOdd: {
    backgroundColor: '#fafafa'
  },
  emptyTd: {
    padding: '3rem 1rem',
    textAlign: 'center',
    color: '#64748b'
  },
  tableFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.75rem 1.25rem',
    backgroundColor: '#f8fafc',
    borderTop: '1px solid #e2e8f0',
    fontSize: '0.75rem',
    color: '#64748b'
  }
};
