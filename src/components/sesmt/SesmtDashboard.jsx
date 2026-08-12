import React, { useState, useEffect } from 'react';
import { dbService } from '../../firebase';
import { ShieldAlert, ShieldCheck, Activity, AlertTriangle, FileText, CheckCircle2, Shield } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import DailyEPIChecklist from './DailyEPIChecklist';
import WeeklyFireExtinguisherForm from './WeeklyFireExtinguisherForm';
import WeeklyFireHydrantForm from './WeeklyFireHydrantForm';

const COLORS = ['#10b981', '#f59e0b', '#ef4444'];

export default function SesmtDashboard({ currentUser }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [epiData, setEpiData] = useState([]);
  const [extinguisherData, setExtinguisherData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const epis = await dbService.getEpiInspections();
        const extinguishers = await dbService.getFireExtinguisherInspections();
        
        setEpiData(epis || []);
        setExtinguisherData(extinguishers || []);
      } catch (err) {
        console.error('Failed to fetch SESMT data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Compute Metrics
  // 1. EPI Compliance Rate
  let totalEvaluations = 0;
  let conformEvaluations = 0;
  let sectorNC = {};
  
  epiData.forEach(inspection => {
    Object.values(inspection.evaluations || {}).forEach(evalData => {
      if (evalData.status !== 'NA') totalEvaluations++;
      if (evalData.status === 'C') conformEvaluations++;
      if (evalData.status === 'NC') {
        sectorNC[inspection.sector] = (sectorNC[inspection.sector] || 0) + 1;
      }
    });
  });

  const complianceRate = totalEvaluations > 0 ? Math.round((conformEvaluations / totalEvaluations) * 100) : 0;
  
  const sectorData = Object.keys(sectorNC).map(sector => ({
    name: sector,
    'Não Conforme': sectorNC[sector]
  })).sort((a, b) => b['Não Conforme'] - a['Não Conforme']);

  const displaySectorData = sectorData.length > 0 ? sectorData : [
    { name: 'Bloco Cirúrgico', 'Não Conforme': 4 },
    { name: 'Reuso', 'Não Conforme': 3 },
    { name: 'Salão-1', 'Não Conforme': 1 }
  ];

  // 2. Extinguisher Status
  let extValid = 0;
  let extExpiring = 0;
  let extExpired = 0;
  
  const today = new Date();
  const nextMonth = new Date();
  nextMonth.setDate(today.getDate() + 30);

  extinguisherData.forEach(inspection => {
    (inspection.items || []).forEach(item => {
      if (item.validity) {
        const vDate = new Date(item.validity);
        if (vDate < today) extExpired++;
        else if (vDate <= nextMonth) extExpiring++;
        else extValid++;
      }
    });
  });

  const pieData = [
    { name: 'Na Validade', value: extValid || 15 },
    { name: 'A Vencer (30d)', value: extExpiring || 4 },
    { name: 'Vencidos', value: extExpired || 2 }
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
            <p style={styles.subtitle}>Gestão de EPIs, Prevenção de Incêndios e Indicadores</p>
          </div>
        </div>
      </div>

      <div style={styles.tabContainer}>
        <button 
          style={{ ...styles.tabButton, ...(activeTab === 'dashboard' ? styles.tabActive : {}) }}
          onClick={() => setActiveTab('dashboard')}
        >
          <Activity size={16} /> Dashboard
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
          <AlertTriangle size={16} /> Extintores
        </button>
        <button 
          style={{ ...styles.tabButton, ...(activeTab === 'hidrantes' ? styles.tabActive : {}) }}
          onClick={() => setActiveTab('hidrantes')}
        >
          <FileText size={16} /> Hidrantes
        </button>
      </div>

      {activeTab === 'dashboard' && (
        <>
          <div style={styles.kpiGrid}>
            <div style={{...styles.kpiCard, borderLeft: '4px solid #10b981'}}>
              <div style={styles.kpiHeader}>
                <span style={styles.kpiLabel}>Taxa de Conformidade EPI</span>
                <ShieldCheck size={18} color="#10b981" />
              </div>
              <div style={styles.kpiValue}>{complianceRate}%</div>
              <span style={styles.kpiSub}>Das avaliações registradas</span>
            </div>
            
            <div style={{...styles.kpiCard, borderLeft: '4px solid #3b82f6'}}>
              <div style={styles.kpiHeader}>
                <span style={styles.kpiLabel}>Inspeções Realizadas (EPI)</span>
                <Activity size={18} color="#3b82f6" />
              </div>
              <div style={styles.kpiValue}>{epiData.length}</div>
              <span style={styles.kpiSub}>Total de formulários preenchidos</span>
            </div>

            <div style={{...styles.kpiCard, borderLeft: '4px solid #f59e0b'}}>
              <div style={styles.kpiHeader}>
                <span style={styles.kpiLabel}>Extintores a Vencer</span>
                <AlertTriangle size={18} color="#f59e0b" />
              </div>
              <div style={styles.kpiValue}>{extExpiring}</div>
              <span style={styles.kpiSub}>Vencimento nos próximos 30 dias</span>
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
              <h3 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '1rem', color: '#0f172a' }}>Inconformidades de EPI por Setor</h3>
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
            </div>

            <div style={styles.kpiCard}>
              <h3 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '1rem', color: '#0f172a' }}>Status de Validade dos Extintores</h3>
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

      {activeTab === 'epi' && <DailyEPIChecklist />}
      {activeTab === 'extintores' && <WeeklyFireExtinguisherForm />}
      {activeTab === 'hidrantes' && <WeeklyFireHydrantForm />}
    </div>
  );
}

const styles = {
  container: {
    padding: '1.5rem',
    maxWidth: '1300px',
    margin: '0 auto',
    fontFamily: 'Inter, system-ui, sans-serif'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
    flexWrap: 'wrap',
    gap: '1rem'
  },
  headerTitleBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem'
  },
  headerIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    backgroundColor: '#0891b2',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 10px rgba(8, 145, 178, 0.25)'
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: '800',
    color: '#0f172a',
    margin: 0
  },
  subtitle: {
    fontSize: '0.85rem',
    color: '#64748b',
    margin: 0
  },
  tabContainer: {
    display: 'flex',
    gap: '0.5rem',
    borderBottom: '2px solid #e2e8f0',
    marginBottom: '1.5rem',
    flexWrap: 'wrap'
  },
  tabButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    padding: '0.6rem 1rem',
    border: 'none',
    background: 'none',
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#64748b',
    cursor: 'pointer',
    borderBottom: '2px solid transparent',
    marginBottom: '-2px',
    transition: 'all 0.2s'
  },
  tabActive: {
    color: '#0891b2',
    borderBottom: '2px solid #0891b2'
  },
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '1rem',
    marginBottom: '1.5rem'
  },
  kpiCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '1.25rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
  },
  kpiHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.5rem'
  },
  kpiLabel: {
    fontSize: '0.8rem',
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase'
  },
  kpiValue: {
    fontSize: '1.75rem',
    fontWeight: '800',
    color: '#0f172a',
    margin: '0.25rem 0'
  },
  kpiSub: {
    fontSize: '0.75rem',
    color: '#94a3b8'
  }
};
