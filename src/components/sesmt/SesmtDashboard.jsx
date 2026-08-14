import React, { useState, useEffect } from 'react';
import { dbService } from '../../firebase';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Activity, 
  AlertTriangle, 
  FileText, 
  CheckCircle2, 
  Shield, 
  Calendar, 
  Filter, 
  ClipboardList, 
  RotateCcw,
  Clock,
  Building2,
  Flame,
  Droplet,
  Settings
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import DailyEPIChecklist from './DailyEPIChecklist';
import WeeklyFireExtinguisherForm from './WeeklyFireExtinguisherForm';
import WeeklyFireHydrantForm from './WeeklyFireHydrantForm';
import SesmtHistory from './SesmtHistory';
import SesmtEquipmentManager from './SesmtEquipmentManager';

const COLORS = ['#10b981', '#f59e0b', '#ef4444'];

const SECTOR_OPTIONS = [
  'TODOS',
  'Salão-1', 
  'Salão-2', 
  'Salão-3', 
  'Diálise Peritoneal', 
  'Hemodiálise Externa', 
  'Bloco Cirúrgico', 
  'Reuso', 
  'Sala Amarela'
];

const SHIFT_OPTIONS = [
  'TODOS',
  '1º Turno (Manhã)',
  '2º Turno (Tarde)',
  '3º Turno (Noite)'
];

export default function SesmtDashboard({ currentUser }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [epiData, setEpiData] = useState([]);
  const [extinguisherData, setExtinguisherData] = useState([]);
  const [hydrantData, setHydrantData] = useState([]);
  const [equipmentData, setEquipmentData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filtros de Período do Dashboard
  const [periodPreset, setPeriodPreset] = useState('MES_ATUAL');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [selectedSector, setSelectedSector] = useState('TODOS');
  const [selectedShift, setSelectedShift] = useState('TODOS');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [epis, extinguishers, hydrants, equipment] = await Promise.all([
        dbService.getEpiInspections(),
        dbService.getFireExtinguisherInspections(),
        dbService.getFireHydrantInspections(),
        dbService.getEquipment()
      ]);
      
      setEpiData(epis || []);
      setExtinguisherData(extinguishers || []);
      setHydrantData(hydrants || []);
      setEquipmentData(equipment || []);
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

  // Dados filtrados conforme período e seletores
  const filteredEpiData = epiData.filter(item => {
    if (!isDateInPeriod(item.date)) return false;
    if (selectedSector !== 'TODOS' && item.sector !== selectedSector) return false;
    if (selectedShift !== 'TODOS' && item.shift !== selectedShift) return false;
    return true;
  });

  // 1. Taxa de Conformidade EPI
  let totalEvaluations = 0;
  let conformEvaluations = 0;
  let sectorNC = {};
  
  filteredEpiData.forEach(inspection => {
    Object.values(inspection.evaluations || {}).forEach(evalData => {
      if (evalData.status !== 'NA') totalEvaluations++;
      if (evalData.status === 'C') conformEvaluations++;
      if (evalData.status === 'NC') {
        sectorNC[inspection.sector] = (sectorNC[inspection.sector] || 0) + 1;
      }
    });
  });

  const complianceRate = totalEvaluations > 0 ? Math.round((conformEvaluations / totalEvaluations) * 100) : 100;
  
  const sectorData = Object.keys(sectorNC).map(sector => ({
    name: sector,
    'Não Conforme': sectorNC[sector]
  })).sort((a, b) => b['Não Conforme'] - a['Não Conforme']);

  const displaySectorData = sectorData.length > 0 ? sectorData : (
    filteredEpiData.length > 0 ? [] : [
      { name: 'Bloco Cirúrgico', 'Não Conforme': 0 },
      { name: 'Salão-1', 'Não Conforme': 0 },
      { name: 'Reuso', 'Não Conforme': 0 }
    ]
  );

  // 2. Status de Validade dos Extintores (Monitoramento dinâmico do cadastro ativo)
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
    // Valores de referência caso ainda não haja cadastro
    extValid = 18;
    extExpiring = 2;
    extExpired = 1;
  }

  const pieData = [
    { name: 'Na Validade', value: extValid },
    { name: 'A Vencer (60d)', value: extExpiring },
    { name: 'Vencidos', value: extExpired }
  ];

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerTitleBox}>
          <div style={styles.headerIcon}>
            <Shield size={24} color="#fff" />
          </div>
          <div>
            <h1 style={styles.title}>SESMT - Segurança do Trabalho</h1>
            <p style={styles.subtitle}>Gestão de Equipamentos, Auditorias, Prevenção de Incêndios e Indicadores</p>
          </div>
        </div>
      </div>

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
          <Shield size={16} /> Cadastro de Equipamentos ({equipmentData.length})
        </button>
        <button 
          style={{ ...styles.tabButton, ...(activeTab === 'epi' ? styles.tabActive : {}) }}
          onClick={() => setActiveTab('epi')}
        >
          <CheckCircle2 size={16} /> Formulário EPI
        </button>
        <button 
          style={{ ...styles.tabButton, ...(activeTab === 'extintores' ? styles.tabActive : {}) }}
          onClick={() => setActiveTab('extintores')}
        >
          <Flame size={16} /> Inspeção Extintores
        </button>
        <button 
          style={{ ...styles.tabButton, ...(activeTab === 'hidrantes' ? styles.tabActive : {}) }}
          onClick={() => setActiveTab('hidrantes')}
        >
          <Droplet size={16} /> Inspeção Hidrantes
        </button>
        <button 
          style={{ ...styles.tabButton, ...(activeTab === 'historico' ? styles.tabActive : {}) }}
          onClick={() => setActiveTab('historico')}
        >
          <ClipboardList size={16} /> Histórico de Registros
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

          <div style={styles.kpiGrid}>
            <div style={{...styles.kpiCard, borderLeft: '4px solid #10b981'}}>
              <div style={styles.kpiHeader}>
                <span style={styles.kpiLabel}>Taxa de Conformidade EPI</span>
                <ShieldCheck size={18} color="#10b981" />
              </div>
              <div style={styles.kpiValue}>{complianceRate}%</div>
              <span style={styles.kpiSub}>No período selecionado</span>
            </div>
            
            <div style={{...styles.kpiCard, borderLeft: '4px solid #3b82f6'}}>
              <div style={styles.kpiHeader}>
                <span style={styles.kpiLabel}>Inspeções Realizadas (EPI)</span>
                <Activity size={18} color="#3b82f6" />
              </div>
              <div style={styles.kpiValue}>{filteredEpiData.length}</div>
              <span style={styles.kpiSub}>Formulários no período</span>
            </div>

            <div style={{...styles.kpiCard, borderLeft: '4px solid #f59e0b'}}>
              <div style={styles.kpiHeader}>
                <span style={styles.kpiLabel}>Extintores a Vencer</span>
                <AlertTriangle size={18} color="#f59e0b" />
              </div>
              <div style={styles.kpiValue}>{extExpiring}</div>
              <span style={styles.kpiSub}>Vencimento nos próximos 60 dias</span>
            </div>

            <div style={{...styles.kpiCard, borderLeft: '4px solid #ef4444'}}>
              <div style={styles.kpiHeader}>
                <span style={styles.kpiLabel}>Extintores Vencidos</span>
                <ShieldAlert size={18} color="#ef4444" />
              </div>
              <div style={styles.kpiValue}>{extExpired}</div>
              <span style={styles.kpiSub}>Necessitam recarga imediata</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
            <div style={styles.kpiCard}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>Inconformidades de EPI por Setor</h3>
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '500' }}>({filteredEpiData.length} inspeções)</span>
              </div>
              {filteredEpiData.length === 0 ? (
                <div style={styles.emptyChartBox}>
                  <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.85rem' }}>Nenhum checklist registrado no período selecionado.</p>
                </div>
              ) : displaySectorData.length === 0 ? (
                <div style={styles.emptyChartBox}>
                  <CheckCircle2 size={32} color="#10b981" style={{ marginBottom: '0.5rem' }} />
                  <p style={{ margin: 0, color: '#15803d', fontWeight: '600', fontSize: '0.9rem' }}>100% de Conformidade!</p>
                  <span style={{ color: '#64748b', fontSize: '0.75rem' }}>Nenhuma não-conformidade registrada no período.</span>
                </div>
              ) : (
                <div style={{ height: '300px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={displaySectorData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={120} tick={{fontSize: 12}} />
                      <Tooltip />
                      <Bar dataKey="Não Conforme" fill="#ef4444" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            <div style={styles.kpiCard}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>Status de Validade dos Extintores</h3>
                <button 
                  onClick={() => setActiveTab('equipamentos')} 
                  style={{ background: 'none', border: 'none', color: '#0891b2', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer' }}
                >
                  Gerenciar Equipamentos →
                </button>
              </div>
              <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
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
      {activeTab === 'extintores' && <WeeklyFireExtinguisherForm onSuccess={fetchData} />}
      {activeTab === 'hidrantes' && <WeeklyFireHydrantForm onSuccess={fetchData} />}
      {activeTab === 'historico' && (
        <SesmtHistory 
          epiData={epiData} 
          extinguisherData={extinguisherData} 
          hydrantData={hydrantData} 
          onRefresh={fetchData} 
        />
      )}
    </div>
  );
}
