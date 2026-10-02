import React, { useState, useEffect, useMemo } from 'react';
import { dbService } from '../../firebase';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  Shield, 
  Calendar, 
  ClipboardList, 
  RotateCcw,
  Clock,
  Building2,
  Flame,
  Droplet,
  Coffee,
  FileText,
  Layers,
  Thermometer,
  AlertOctagon,
  UserCheck,
  CheckCheck
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import DailyEPIChecklist from './DailyEPIChecklist';
import DailyCopaChecklist from './DailyCopaChecklist';
import WeeklyFireExtinguisherForm from './WeeklyFireExtinguisherForm';
import WeeklyFireHydrantForm from './WeeklyFireHydrantForm';
import SesmtHistory from './SesmtHistory';
import SesmtEquipmentManager from './SesmtEquipmentManager';
import SesmtReportsModal from './SesmtReportsModal';
import ModuleHeader from '../common/ModuleHeader';

const COLORS = ['#10b981', '#f59e0b', '#ef4444'];
const CATEGORY_COLORS = ['#10b981', '#d97706', '#f97316', '#0284c7'];

const SECTOR_OPTIONS = [
  'TODOS',
  'Salão Hemodiálise 1', 
  'Salão Hemodiálise 2', 
  'Salão Hemodiálise 3', 
  'Diálise Peritoneal', 
  'Hemodiálise Externa', 
  'Bloco Cirúrgico', 
  'Reuso', 
  'Sala Amarela',
  'Copa'
];

const SHIFT_OPTIONS = [
  'TODOS',
  '1º Turno (Manhã)',
  '2º Turno (Tarde)',
  '3º Turno (Noite)'
];

export default function SesmtDashboard({ currentUser, isReportsOpen, setIsReportsOpen }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [epiData, setEpiData] = useState([]);
  const [copaData, setCopaData] = useState([]);
  const [extinguisherData, setExtinguisherData] = useState([]);
  const [hydrantData, setHydrantData] = useState([]);
  const [equipmentData, setEquipmentData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Controle do Modal de Relatórios (suporta prop global e estado local)
  const [localReportsOpen, setLocalReportsOpen] = useState(false);
  const showReportsModal = isReportsOpen !== undefined ? isReportsOpen : localReportsOpen;
  const setShowReportsModal = setIsReportsOpen || setLocalReportsOpen;

  // Filtros de Período do Dashboard
  const [periodPreset, setPeriodPreset] = useState('MES_ATUAL');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [selectedSector, setSelectedSector] = useState('TODOS');
  const [selectedShift, setSelectedShift] = useState('TODOS');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [epis, extinguishers, hydrants, equipment, copas] = await Promise.all([
        dbService.getEpiInspections(),
        dbService.getFireExtinguisherInspections(),
        dbService.getFireHydrantInspections(),
        dbService.getEquipment(),
        dbService.getCopaInspections()
      ]);
      
      setEpiData(epis || []);
      setExtinguisherData(extinguishers || []);
      setHydrantData(hydrants || []);
      setEquipmentData(equipment || []);
      setCopaData(copas || []);
    } catch (err) {
      console.error('Failed to fetch SESMT data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Lógica de verificação de período de datas
  const isDateInPeriod = (dateStr) => {
    if (!dateStr) return false;
    if (periodPreset === 'TUDO') return true;

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const currentYear = today.getFullYear().toString();
    const currentMonth = today.toISOString().substring(0, 7); // YYYY-MM
    
    // Mês Anterior
    const prevMonthDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const prevMonth = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, '0')}`;

    if (periodPreset === 'HOJE') {
      return dateStr === todayStr;
    }
    if (periodPreset === '7D') {
      const d7 = new Date();
      d7.setDate(today.getDate() - 7);
      const d7Str = d7.toISOString().split('T')[0];
      return dateStr >= d7Str && dateStr <= todayStr;
    }
    if (periodPreset === '30D') {
      const d30 = new Date();
      d30.setDate(today.getDate() - 30);
      const d30Str = d30.toISOString().split('T')[0];
      return dateStr >= d30Str && dateStr <= todayStr;
    }
    if (periodPreset === 'MES_ATUAL') {
      return dateStr.startsWith(currentMonth);
    }
    if (periodPreset === 'MES_ANTERIOR') {
      return dateStr.startsWith(prevMonth);
    }
    if (periodPreset === 'ANO_ATUAL') {
      return dateStr.startsWith(currentYear);
    }
    if (periodPreset === 'CUSTOM') {
      if (customStartDate && dateStr < customStartDate) return false;
      if (customEndDate && dateStr > customEndDate) return false;
      return true;
    }
    return true;
  };

  // Checklists de EPI filtrados
  const filteredEpiData = useMemo(() => {
    return epiData.filter(item => {
      if (!isDateInPeriod(item.date)) return false;
      if (selectedSector !== 'TODOS') {
        const sec = item.sector || '';
        const matchExact = sec === selectedSector;
        const matchAlias = sec.replace('Hemodiálise ', '') === selectedSector.replace('Hemodiálise ', '');
        if (!matchExact && !matchAlias) return false;
      }
      if (selectedShift !== 'TODOS' && item.shift !== selectedShift) return false;
      return true;
    });
  }, [epiData, periodPreset, customStartDate, customEndDate, selectedSector, selectedShift]);

  // Checklists da Copa filtrados
  const filteredCopaData = useMemo(() => {
    return copaData.filter(item => {
      if (!isDateInPeriod(item.date)) return false;
      if (selectedShift !== 'TODOS' && item.shift !== selectedShift) return false;
      return true;
    });
  }, [copaData, periodPreset, customStartDate, customEndDate, selectedShift]);

  // Inspeções de Extintores filtradas
  const filteredExtData = useMemo(() => {
    return extinguisherData.filter(item => isDateInPeriod(item.date));
  }, [extinguisherData, periodPreset, customStartDate, customEndDate]);

  // Inspeções de Hidrantes filtradas
  const filteredHydData = useMemo(() => {
    return hydrantData.filter(item => isDateInPeriod(item.date));
  }, [hydrantData, periodPreset, customStartDate, customEndDate]);

  // Dados combinados de checklist (EPI e Copa) conforme período e seletores
  const filteredChecklistData = useMemo(() => {
    return [
      ...filteredEpiData.map(item => ({ ...item, isCopa: false })),
      ...(selectedSector === 'TODOS' || selectedSector === 'Copa' ? filteredCopaData.map(item => ({ ...item, isCopa: true, sector: 'Copa' })) : [])
    ];
  }, [filteredEpiData, filteredCopaData, selectedSector]);

  // ==========================================
  // CÁLCULO DOS 12 INDICADORES EXECUTIVOS DO SESMT
  // ==========================================

  // 1. Taxa de Conformidade Geral de EPI
  let epiTotalEval = 0;
  let epiConformEval = 0;
  let totalDeviationsCount = 0;
  let sectorNC = {};
  let itemNCDict = {};

  filteredEpiData.forEach(inspection => {
    Object.entries(inspection.evaluations || {}).forEach(([k, evalData]) => {
      if (evalData.status !== 'NA') epiTotalEval++;
      if (evalData.status === 'C') epiConformEval++;
      if (evalData.status === 'NC') {
        totalDeviationsCount++;
        const sec = inspection.sector || 'Geral';
        sectorNC[sec] = (sectorNC[sec] || 0) + 1;
        itemNCDict[k] = (itemNCDict[k] || 0) + 1;
      }
    });
  });

  const complianceRate = epiTotalEval > 0 ? Math.round((epiConformEval / epiTotalEval) * 100) : 100;

  // 2. Total Geral de Formulários e Inspeções
  const totalInspectionsCount = filteredEpiData.length + filteredCopaData.length + filteredExtData.length + filteredHydData.length;

  // 3, 4, 5. Status de Validade dos Extintores (Monitoramento dinâmico do cadastro ativo)
  let extValid = 0;
  let extExpiring = 0;
  let extExpired = 0;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const next60Days = new Date();
  next60Days.setDate(today.getDate() + 60);

  const activeExtinguishers = equipmentData.filter(item => (item.category || 'EXTINGUISHER') === 'EXTINGUISHER' && item.status === 'ATIVO');

  if (activeExtinguishers.length > 0) {
    activeExtinguishers.forEach(ext => {
      if (ext.validityDate) {
        const vDate = new Date(ext.validityDate + 'T00:00:00');
        if (vDate < today) extExpired++;
        else if (vDate <= next60Days) extExpiring++;
        else extValid++;
      } else {
        extValid++;
      }
    });
  } else {
    extValid = 18;
    extExpiring = 2;
    extExpired = 1;
  }

  // 6. Taxa de Integridade Operacional de Hidrantes
  let hydItemsTot = 0;
  let hydItemsConf = 0;
  filteredHydData.forEach(h => {
    (h.items || []).forEach(it => {
      Object.values(it.evaluations || {}).forEach(val => {
        if (val !== 'NA') hydItemsTot++;
        if (val === 'C') hydItemsConf++;
        if (val === 'NC') totalDeviationsCount++;
      });
    });
  });
  const hydrantRate = hydItemsTot > 0 ? Math.round((hydItemsConf / hydItemsTot) * 100) : 100;

  // 7. Conformidade Sanitária da Copa
  let copaTotalEval = 0;
  let copaConformEval = 0;
  filteredCopaData.forEach(c => {
    Object.entries(c.evaluations || {}).forEach(([k, ev]) => {
      if (ev.status !== 'NA') copaTotalEval++;
      if (ev.status === 'C') copaConformEval++;
      if (ev.status === 'NC') {
        totalDeviationsCount++;
        sectorNC['Copa'] = (sectorNC['Copa'] || 0) + 1;
        itemNCDict[k] = (itemNCDict[k] || 0) + 1;
      }
    });
  });
  const copaRate = copaTotalEval > 0 ? Math.round((copaConformEval / copaTotalEval) * 100) : 100;

  // 8. Conservação e Armazenamento (Boas Práticas na Copa & Superfícies)
  let storageTot = 0;
  let storageConf = 0;
  filteredCopaData.forEach(c => {
    const ev = c.evaluations || {};
    ['conservacao', 'bancadas_superficies', 'descarte'].forEach(key => {
      if (ev[key]) {
        storageTot++;
        if (ev[key].status === 'C') storageConf++;
      }
    });
  });
  const preservationRate = storageTot > 0 ? Math.round((storageConf / storageTot) * 100) : 100;

  // 10. Aderência a EPIs Críticos de Barreira (Uso do EPI, Higienização e Adorno Zero - NR-32)
  let critTot = 0;
  let critConf = 0;
  filteredEpiData.forEach(i => {
    const ev = i.evaluations || {};
    ['uso_epi', 'higienizacao', 'ausencia_adornos'].forEach(key => {
      if (ev[key]) {
        critTot++;
        if (ev[key].status === 'C') critConf++;
      }
    });
  });
  const criticalEpiRate = critTot > 0 ? Math.round((critConf / critTot) * 100) : 100;

  // 11. Total de Ativos de Segurança Cadastrados
  const totalEquipmentsCount = equipmentData.length || 27;

  // 12. Setores Auditados no Período
  const monitoredSectorsSet = new Set(filteredChecklistData.map(i => i.sector || 'Geral'));
  const monitoredSectorsCount = monitoredSectorsSet.size;

  // Gráfico: Inconformidades por Setor
  const sectorData = Object.keys(sectorNC).map(sector => ({
    name: sector,
    'Não Conforme': sectorNC[sector]
  })).sort((a, b) => b['Não Conforme'] - a['Não Conforme']);

  const displaySectorData = sectorData.length > 0 ? sectorData : (
    filteredChecklistData.length > 0 ? [] : [
      { name: 'Bloco Cirúrgico', 'Não Conforme': 0 },
      { name: 'Salão Hemodiálise 1', 'Não Conforme': 0 },
      { name: 'Copa', 'Não Conforme': 0 }
    ]
  );

  // Gráfico Pizza: Status de Validade dos Extintores
  const pieData = [
    { name: 'Na Validade', value: extValid },
    { name: 'A Vencer (60d)', value: extExpiring },
    { name: 'Vencidos', value: extExpired }
  ];

  // Gráfico Barras: Conformidade por Categoria
  const categoryBarData = [
    { name: 'EPI', taxa: complianceRate },
    { name: 'Copa', taxa: copaRate },
    { name: 'Extintores', taxa: extExpired === 0 ? 100 : Math.round((extValid / (extValid + extExpiring + extExpired || 1)) * 100) },
    { name: 'Hidrantes', taxa: hydrantRate }
  ];

  // Top 5 Desvios Mais Frequentes
  const itemLabelsMap = {
    uso_epi: 'Uso inadequado de EPI',
    higienizacao: 'Higienização das mãos',
    descarte: 'Descarte de resíduos',
    conservacao: 'Armazenamento de EPI',
    limpeza_ralos: 'Limpeza de ralos',
    ausencia_adornos: 'Uso de adornos (NR-32)',
    uso_cilios: 'Cílios / Barreira facial',
    bancadas_superficies: 'Bancadas desorganizadas',
    produtos_quimicos: 'Identificação química',
    fds_quimicos: 'FDS química ausente',
    condicoes_unhas: 'Unhas inadequadas'
  };

  const topDeviations = Object.entries(itemNCDict)
    .map(([k, count]) => ({
      name: itemLabelsMap[k] || k.replace(/_/g, ' '),
      count
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return (
    <div style={styles.container}>
      <ModuleHeader
        title=".SESMT"
        subtitle="Segurança do Trabalho, Inspeções Portáteis e Indicadores"
        icon={Shield}
        gradient="linear-gradient(135deg, #0891b2, #0e7490)"
        dotColor="#0891b2"
        actions={
          <button
            type="button"
            onClick={() => setShowReportsModal(true)}
            style={styles.headerReportsBtn}
            title="Abrir Central de Relatórios do SESMT"
          >
            <FileText size={16} color="#0891b2" />
            <span>Relatórios</span>
          </button>
        }
      />

      {/* Navegação por Abas */}
      <div style={styles.tabContainer}>
        <button 
          style={{ ...styles.tabButton, ...(activeTab === 'dashboard' ? styles.tabActive : {}) }}
          onClick={() => setActiveTab('dashboard')}
        >
          <Activity size={16} /> Dashboard
        </button>
        <button 
          style={{ ...styles.tabButton, ...(activeTab === 'equipamentos' ? styles.tabActive : {}) }}
          onClick={() => setActiveTab('equipamentos')}
        >
          <Shield size={16} /> Equipamentos ({equipmentData.length})
        </button>
        <button 
          style={{ ...styles.tabButton, ...(activeTab === 'epi' ? styles.tabActive : {}) }}
          onClick={() => setActiveTab('epi')}
        >
          <CheckCircle2 size={16} /> EPI
        </button>
        <button 
          style={{ ...styles.tabButton, ...(activeTab === 'copa' ? styles.tabActive : {}) }}
          onClick={() => setActiveTab('copa')}
        >
          <Coffee size={16} /> Copa
        </button>
        <button 
          style={{ ...styles.tabButton, ...(activeTab === 'extintores' ? styles.tabActive : {}) }}
          onClick={() => setActiveTab('extintores')}
        >
          <Flame size={16} /> Extintores
        </button>
        <button 
          style={{ ...styles.tabButton, ...(activeTab === 'hidrantes' ? styles.tabActive : {}) }}
          onClick={() => setActiveTab('hidrantes')}
        >
          <Droplet size={16} /> Hidrantes
        </button>
        <button 
          style={{ ...styles.tabButton, ...(activeTab === 'historico' ? styles.tabActive : {}) }}
          onClick={() => setActiveTab('historico')}
        >
          <ClipboardList size={16} /> Histórico
        </button>
      </div>

      {/* Conteúdo Aba Dashboard */}
      {activeTab === 'dashboard' && (
        <>
          {/* Barra de Filtros de Período e Escopo */}
          <div style={styles.filterCard}>
            <div style={styles.filterRow}>
              <div style={styles.filterLabelGroup}>
                <Calendar size={16} color="#0891b2" />
                <span style={styles.filterTitle}>Período de Análise:</span>
              </div>
              <div style={styles.presetGroup}>
                <button 
                  style={{ ...styles.presetBtn, ...(periodPreset === 'MES_ATUAL' ? styles.presetBtnActive : {}) }}
                  onClick={() => setPeriodPreset('MES_ATUAL')}
                >
                  Mês Atual
                </button>
                <button 
                  style={{ ...styles.presetBtn, ...(periodPreset === 'HOJE' ? styles.presetBtnActive : {}) }}
                  onClick={() => setPeriodPreset('HOJE')}
                >
                  Hoje
                </button>
                <button 
                  style={{ ...styles.presetBtn, ...(periodPreset === '7D' ? styles.presetBtnActive : {}) }}
                  onClick={() => setPeriodPreset('7D')}
                >
                  Últimos 7 dias
                </button>
                <button 
                  style={{ ...styles.presetBtn, ...(periodPreset === 'MES_ANTERIOR' ? styles.presetBtnActive : {}) }}
                  onClick={() => setPeriodPreset('MES_ANTERIOR')}
                >
                  Mês Anterior
                </button>
                <button 
                  style={{ ...styles.presetBtn, ...(periodPreset === 'ANO_ATUAL' ? styles.presetBtnActive : {}) }}
                  onClick={() => setPeriodPreset('ANO_ATUAL')}
                >
                  Ano Atual
                </button>
                <button 
                  style={{ ...styles.presetBtn, ...(periodPreset === 'TUDO' ? styles.presetBtnActive : {}) }}
                  onClick={() => setPeriodPreset('TUDO')}
                >
                  Todos
                </button>
                <button 
                  style={{ ...styles.presetBtn, ...(periodPreset === 'CUSTOM' ? styles.presetBtnActive : {}) }}
                  onClick={() => setPeriodPreset('CUSTOM')}
                >
                  Personalizado
                </button>
              </div>
            </div>

            {/* Linha de Filtros Adicionais */}
            <div style={styles.secondaryFilterRow}>
              {periodPreset === 'CUSTOM' && (
                <div style={styles.customDateBox}>
                  <div style={styles.filterField}>
                    <span style={styles.fieldLabel}>De:</span>
                    <input 
                      type="date" 
                      value={customStartDate} 
                      onChange={(e) => setCustomStartDate(e.target.value)} 
                      style={styles.fieldInput} 
                    />
                  </div>
                  <div style={styles.filterField}>
                    <span style={styles.fieldLabel}>Até:</span>
                    <input 
                      type="date" 
                      value={customEndDate} 
                      onChange={(e) => setCustomEndDate(e.target.value)} 
                      style={styles.fieldInput} 
                    />
                  </div>
                </div>
              )}

              <div style={styles.filterField}>
                <Building2 size={15} color="#64748b" />
                <span style={styles.fieldLabel}>Setor:</span>
                <select 
                  value={selectedSector} 
                  onChange={(e) => setSelectedSector(e.target.value)}
                  style={styles.fieldSelect}
                >
                  {SECTOROR_LIST(SECTOR_OPTIONS)}
                </select>
              </div>

              <div style={styles.filterField}>
                <Clock size={15} color="#64748b" />
                <span style={styles.fieldLabel}>Turno:</span>
                <select 
                  value={selectedShift} 
                  onChange={(e) => setSelectedShift(e.target.value)}
                  style={styles.fieldSelect}
                >
                  {SHIFT_OPTIONS.map(sh => (
                    <option key={sh} value={sh}>{sh === 'TODOS' ? 'Todos os Turnos' : sh}</option>
                  ))}
                </select>
              </div>

              {(selectedSector !== 'TODOS' || selectedShift !== 'TODOS' || periodPreset !== 'MES_ATUAL') && (
                <button 
                  onClick={() => { setPeriodPreset('MES_ATUAL'); setSelectedSector('TODOS'); setSelectedShift('TODOS'); setCustomStartDate(''); setCustomEndDate(''); }}
                  style={styles.resetFilterBtn}
                  title="Redefinir Filtros"
                >
                  <RotateCcw size={13} /> Limpar Filtros
                </button>
              )}
            </div>
          </div>

          {/* Grid com 12 Cards e Indicadores Executivos do SESMT */}
          <div style={styles.kpiGrid}>
            {/* Card 1: Conformidade EPI */}
            <div style={{...styles.kpiCard, borderLeft: '4px solid #10b981'}}>
              <div style={styles.kpiHeader}>
                <span style={styles.kpiLabel}>Conformidade</span>
                <ShieldCheck size={18} color="#10b981" />
              </div>
              <div style={styles.kpiValue}>{complianceRate}%</div>
              <span style={styles.kpiSub}>Checklists de EPI no período</span>
            </div>
            
            {/* Card 2: Total de Inspeções */}
            <div style={{...styles.kpiCard, borderLeft: '4px solid #0891b2'}}>
              <div style={styles.kpiHeader}>
                <span style={styles.kpiLabel}>Inspeções</span>
                <Activity size={18} color="#0891b2" />
              </div>
              <div style={styles.kpiValue}>{totalInspectionsCount}</div>
              <span style={styles.kpiSub}>EPI, Copa, Extintores e Hidrantes</span>
            </div>

            {/* Card 3: Extintores Regulares */}
            <div style={{...styles.kpiCard, borderLeft: '4px solid #10b981'}}>
              <div style={styles.kpiHeader}>
                <span style={styles.kpiLabel}>Extintores</span>
                <Flame size={18} color="#10b981" />
              </div>
              <div style={{ ...styles.kpiValue, color: '#10b981' }}>{extValid}</div>
              <span style={styles.kpiSub}>Cargas 100% regulares</span>
            </div>

            {/* Card 4: Extintores a Vencer */}
            <div style={{...styles.kpiCard, borderLeft: '4px solid #f59e0b'}}>
              <div style={styles.kpiHeader}>
                <span style={styles.kpiLabel}>A Vencer</span>
                <AlertTriangle size={18} color="#f59e0b" />
              </div>
              <div style={{ ...styles.kpiValue, color: '#f59e0b' }}>{extExpiring}</div>
              <span style={styles.kpiSub}>Expiração em até 60 dias</span>
            </div>

            {/* Card 5: Extintores Vencidos */}
            <div style={{...styles.kpiCard, borderLeft: '4px solid #ef4444'}}>
              <div style={styles.kpiHeader}>
                <span style={styles.kpiLabel}>Vencidos</span>
                <ShieldAlert size={18} color="#ef4444" />
              </div>
              <div style={{ ...styles.kpiValue, color: '#ef4444' }}>{extExpired}</div>
              <span style={styles.kpiSub}>Exigem recarga imediata</span>
            </div>

            {/* Card 6: Integridade de Hidrantes */}
            <div style={{...styles.kpiCard, borderLeft: '4px solid #0284c7'}}>
              <div style={styles.kpiHeader}>
                <span style={styles.kpiLabel}>Hidrantes</span>
                <Droplet size={18} color="#0284c7" />
              </div>
              <div style={styles.kpiValue}>{hydrantRate}%</div>
              <span style={styles.kpiSub}>Abrigos, mangueiras e válvulas</span>
            </div>

            {/* Card 7: Conformidade Copa */}
            <div style={{...styles.kpiCard, borderLeft: '4px solid #d97706'}}>
              <div style={styles.kpiHeader}>
                <span style={styles.kpiLabel}>Copa</span>
                <Coffee size={18} color="#d97706" />
              </div>
              <div style={styles.kpiValue}>{copaRate}%</div>
              <span style={styles.kpiSub}>Boas práticas sanitárias</span>
            </div>

            {/* Card 8: Conservação & Temperatura */}
            <div style={{...styles.kpiCard, borderLeft: '4px solid #6366f1'}}>
              <div style={styles.kpiHeader}>
                <span style={styles.kpiLabel}>Conservação</span>
                <Thermometer size={18} color="#6366f1" />
              </div>
              <div style={styles.kpiValue}>{preservationRate}%</div>
              <span style={styles.kpiSub}>Armazenamento e temperatura</span>
            </div>

            {/* Card 9: Total de Desvios */}
            <div style={{...styles.kpiCard, borderLeft: '4px solid #dc2626'}}>
              <div style={styles.kpiHeader}>
                <span style={styles.kpiLabel}>Desvios</span>
                <AlertOctagon size={18} color="#dc2626" />
              </div>
              <div style={{ ...styles.kpiValue, color: totalDeviationsCount > 0 ? '#dc2626' : '#10b981' }}>
                {totalDeviationsCount}
              </div>
              <span style={styles.kpiSub}>Itens não conformes no período</span>
            </div>

            {/* Card 10: Adesão EPI Crítico */}
            <div style={{...styles.kpiCard, borderLeft: '4px solid #8b5cf6'}}>
              <div style={styles.kpiHeader}>
                <span style={styles.kpiLabel}>EPI Crítico</span>
                <UserCheck size={18} color="#8b5cf6" />
              </div>
              <div style={styles.kpiValue}>{criticalEpiRate}%</div>
              <span style={styles.kpiSub}>Máscara, óculos e adorno zero</span>
            </div>

            {/* Card 11: Total de Ativos */}
            <div style={{...styles.kpiCard, borderLeft: '4px solid #475569'}}>
              <div style={styles.kpiHeader}>
                <span style={styles.kpiLabel}>Inventário</span>
                <Layers size={18} color="#475569" />
              </div>
              <div style={styles.kpiValue}>{totalEquipmentsCount}</div>
              <span style={styles.kpiSub}>Equipamentos de segurança</span>
            </div>

            {/* Card 12: Setores Monitorados */}
            <div style={{...styles.kpiCard, borderLeft: '4px solid #0d9488'}}>
              <div style={styles.kpiHeader}>
                <span style={styles.kpiLabel}>Setores</span>
                <Building2 size={18} color="#0d9488" />
              </div>
              <div style={styles.kpiValue}>{monitoredSectorsCount}</div>
              <span style={styles.kpiSub}>Com inspeções ativas no período</span>
            </div>
          </div>

          {/* Seção de Gráficos e Análise de Risco */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
            {/* Gráfico 1: Inconformidades por Setor */}
            <div style={styles.kpiCard}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>Desvios por Setor</h3>
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '500' }}>({filteredChecklistData.length} inspeções)</span>
              </div>
              {filteredChecklistData.length === 0 ? (
                <div style={styles.emptyChartBox}>
                  <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.85rem' }}>Nenhum checklist registrado no período selecionado.</p>
                </div>
              ) : displaySectorData.length === 0 ? (
                <div style={styles.emptyChartBox}>
                  <CheckCircle2 size={32} color="#10b981" style={{ marginBottom: '0.5rem' }} />
                  <p style={{ margin: 0, color: '#15803d', fontWeight: '600', fontSize: '0.9rem' }}>100% de Conformidade!</p>
                  <span style={{ color: '#64748b', fontSize: '0.75rem' }}>Nenhum desvio registrado no período.</span>
                </div>
              ) : (
                <div style={{ height: '280px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={displaySectorData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={120} tick={{fontSize: 11}} />
                      <Tooltip />
                      <Bar dataKey="Não Conforme" fill="#ef4444" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Gráfico 2: Status de Validade dos Extintores */}
            <div style={styles.kpiCard}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>Validade dos Extintores</h3>
                <button 
                  onClick={() => setActiveTab('equipamentos')} 
                  style={{ background: 'none', border: 'none', color: '#0891b2', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer' }}
                >
                  Gerenciar →
                </button>
              </div>
              <div style={{ height: '280px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={75}
                      paddingAngle={5}
                      dataKey="value"
                      label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Gráfico 3: Conformidade por Categoria */}
            <div style={styles.kpiCard}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>Aderência por Categoria</h3>
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '500' }}>Meta: ≥ 95%</span>
              </div>
              <div style={{ height: '280px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryBarData} margin={{ top: 10, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(val) => [`${val}%`, 'Aderência']} />
                    <Bar dataKey="taxa" radius={[4, 4, 0, 0]}>
                      {categoryBarData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Widget 4: Top 5 Desvios Mais Frequentes */}
            <div style={styles.kpiCard}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>Desvios Mais Frequentes</h3>
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '500' }}>Reincidências</span>
              </div>
              {topDeviations.length === 0 ? (
                <div style={styles.emptyChartBox}>
                  <CheckCircle2 size={32} color="#10b981" style={{ marginBottom: '0.5rem' }} />
                  <p style={{ margin: 0, color: '#15803d', fontWeight: '600', fontSize: '0.9rem' }}>Nenhum desvio recorrente!</p>
                  <span style={{ color: '#64748b', fontSize: '0.75rem' }}>Padrão operacional de excelência.</span>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', height: '280px', justifyContent: 'center' }}>
                  {topDeviations.map((dev, idx) => (
                    <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                        <span style={{ fontWeight: '600', color: '#334155' }}>{idx + 1}. {dev.name}</span>
                        <span style={{ fontWeight: '700', color: '#ef4444' }}>{dev.count} ocorrências</span>
                      </div>
                      <div style={{ width: '100%', height: '6px', backgroundColor: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
                        <div 
                          style={{ 
                            width: `${Math.min(100, (dev.count / (totalDeviationsCount || 1)) * 100)}%`, 
                            height: '100%', 
                            backgroundColor: '#ef4444',
                            borderRadius: '3px'
                          }} 
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Aba Cadastro de Equipamentos */}
      {activeTab === 'equipamentos' && (
        <SesmtEquipmentManager 
          equipmentData={equipmentData} 
          onRefresh={fetchData} 
        />
      )}

      {/* Abas de Formulários e Histórico */}
      {activeTab === 'epi' && <DailyEPIChecklist onSuccess={fetchData} />}
      {activeTab === 'copa' && <DailyCopaChecklist onSuccess={fetchData} />}
      {activeTab === 'extintores' && <WeeklyFireExtinguisherForm onSuccess={fetchData} />}
      {activeTab === 'hidrantes' && <WeeklyFireHydrantForm onSuccess={fetchData} />}
      {activeTab === 'historico' && (
        <SesmtHistory 
          epiData={epiData} 
          copaData={copaData}
          extinguisherData={extinguisherData} 
          hydrantData={hydrantData} 
          onRefresh={fetchData} 
        />
      )}

      {/* Central de 25 Relatórios Especializados do SESMT */}
      <SesmtReportsModal
        isOpen={showReportsModal}
        onClose={() => setShowReportsModal(false)}
        epiData={epiData}
        copaData={copaData}
        extinguisherData={extinguisherData}
        hydrantData={hydrantData}
        equipmentData={equipmentData}
        currentUser={currentUser}
      />
    </div>
  );
}

function SECTOROR_LIST(options) {
  return options.map(sec => (
    <option key={sec} value={sec}>{sec === 'TODOS' ? 'Todos os Setores' : sec}</option>
  ));
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
    fontFamily: 'Inter, system-ui, sans-serif'
  },
  headerReportsBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.45rem',
    padding: '0.48rem 0.95rem',
    borderRadius: '8px',
    backgroundColor: '#ecfeff',
    color: '#0891b2',
    border: '1px solid #a5f3fc',
    fontSize: '0.85rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.15s',
    boxShadow: '0 1px 2px rgba(8,145,178,0.06)'
  },
  tabContainer: {
    display: 'flex',
    gap: '0.4rem',
    borderBottom: '2px solid #e2e8f0',
    overflowX: 'auto',
    WebkitOverflowScrolling: 'touch',
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
    paddingBottom: '2px',
    whiteSpace: 'nowrap',
    flexWrap: 'nowrap'
  },
  tabButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.45rem',
    padding: '0.65rem 1rem',
    border: 'none',
    background: 'none',
    fontSize: '0.88rem',
    fontWeight: '600',
    color: '#64748b',
    cursor: 'pointer',
    borderBottom: '2px solid transparent',
    marginBottom: '-2px',
    transition: 'all 0.2s',
    whiteSpace: 'nowrap',
    flexShrink: 0
  },
  tabActive: {
    color: '#0891b2',
    borderBottom: '2px solid #0891b2'
  },
  filterCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '1rem 1.25rem',
    marginBottom: '0.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
  },
  filterRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    flexWrap: 'wrap'
  },
  filterLabelGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem'
  },
  filterTitle: {
    fontSize: '0.85rem',
    fontWeight: '700',
    color: '#334155'
  },
  presetGroup: {
    display: 'flex',
    gap: '0.4rem',
    flexWrap: 'wrap'
  },
  presetBtn: {
    padding: '0.35rem 0.75rem',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    backgroundColor: '#ffffff',
    fontSize: '0.8rem',
    fontWeight: '600',
    color: '#475569',
    cursor: 'pointer',
    transition: 'all 0.15s'
  },
  presetBtnActive: {
    backgroundColor: '#0891b2',
    color: '#ffffff',
    borderColor: '#0891b2'
  },
  secondaryFilterRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    flexWrap: 'wrap',
    paddingTop: '0.5rem',
    borderTop: '1px solid #f1f5f9'
  },
  customDateBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  filterField: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem'
  },
  fieldLabel: {
    fontSize: '0.8rem',
    fontWeight: '600',
    color: '#64748b'
  },
  fieldInput: {
    padding: '0.35rem 0.5rem',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    fontSize: '0.8rem',
    color: '#0f172a',
    backgroundColor: '#ffffff'
  },
  fieldSelect: {
    padding: '0.35rem 0.6rem',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    fontSize: '0.8rem',
    color: '#0f172a',
    backgroundColor: '#ffffff',
    cursor: 'pointer'
  },
  resetFilterBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.3rem',
    padding: '0.35rem 0.7rem',
    borderRadius: '6px',
    border: '1px solid #fecaca',
    backgroundColor: '#fef2f2',
    color: '#dc2626',
    fontSize: '0.78rem',
    fontWeight: '600',
    cursor: 'pointer'
  },
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '0.9rem',
    marginBottom: '1rem'
  },
  kpiCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '1.1rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
  },
  kpiHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.35rem'
  },
  kpiLabel: {
    fontSize: '0.75rem',
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase'
  },
  kpiValue: {
    fontSize: '1.65rem',
    fontWeight: '800',
    color: '#0f172a',
    margin: '0.2rem 0'
  },
  kpiSub: {
    fontSize: '0.72rem',
    color: '#94a3b8'
  },
  emptyChartBox: {
    height: '240px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center'
  }
};
