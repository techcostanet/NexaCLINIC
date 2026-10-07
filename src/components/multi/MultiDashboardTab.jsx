import React, { useState, useEffect, useMemo } from 'react';
import { 
  HeartHandshake, Brain, Apple, AlertTriangle, Users, 
  TrendingUp, CheckCircle2, ShieldAlert, Home, Bus, DollarSign 
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { 
  getSocialAnamneses, getPsychologyRecords, getNutritionRecords 
} from '../../services/firebase/multiService';
import { calcularAlertasVulnerabilidade } from '../../utils/socialAnamnesisQuestions';

const COLORS = ['#7c3aed', '#0284c7', '#16a34a', '#ea580c', '#e11d48', '#8b5cf6'];

export default function MultiDashboardTab({ unitId = 'betim', onSelectTab }) {
  const [socialList, setSocialList] = useState([]);
  const [psyList, setPsyList] = useState([]);
  const [nutriList, setNutriList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAll();
  }, [unitId]);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [soc, psy, nut] = await Promise.all([
        getSocialAnamneses(unitId),
        getPsychologyRecords(unitId),
        getNutritionRecords(unitId)
      ]);
      setSocialList(soc || []);
      setPsyList(psy || []);
      setNutriList(nut || []);
    } catch (e) {
      console.warn('Erro ao carregar dados do dashboard multi:', e);
    } finally {
      setLoading(false);
    }
  };

  // Análise de Moradia
  const moradiaData = useMemo(() => {
    const counts = {};
    socialList.forEach(a => {
      const m = a.situacaoMoradia || 'Não inf.';
      counts[m] = (counts[m] || 0) + 1;
    });
    return Object.keys(counts).map(k => ({ name: k, total: counts[k] }));
  }, [socialList]);

  // Análise de Benefícios
  const beneficioData = useMemo(() => {
    const counts = {};
    socialList.forEach(a => {
      const b = a.recebeBeneficio || 'Não inf.';
      counts[b] = (counts[b] || 0) + 1;
    });
    return Object.keys(counts).map(k => ({ name: k, total: counts[k] }));
  }, [socialList]);

  // Pacientes em Alerta Crítico
  const prioritarios = useMemo(() => {
    return socialList.filter(a => {
      const als = calcularAlertasVulnerabilidade(a);
      return a.statusAcompanhamento === 'Prioritário' || als.some(x => x.gravidade === 'critica' || x.gravidade === 'alta');
    }).slice(0, 6);
  }, [socialList]);

  return (
    <div style={styles.container}>
      {/* 4 CARDS ESTRATÉGICOS */}
      <div style={styles.kpiGrid}>
        <div style={styles.kpiCard} onClick={() => onSelectTab && onSelectTab('social')}>
          <div style={{ ...styles.kpiIcon, backgroundColor: '#ede9fe', color: '#7c3aed' }}>
            <HeartHandshake size={22} />
          </div>
          <div>
            <div style={styles.kpiVal}>{socialList.length}</div>
            <div style={styles.kpiLabel}>Serviço Social</div>
            <div style={styles.kpiSub}>Anamneses cadastradas</div>
          </div>
        </div>

        <div style={styles.kpiCard} onClick={() => onSelectTab && onSelectTab('psicologia')}>
          <div style={{ ...styles.kpiIcon, backgroundColor: '#e0f2fe', color: '#0284c7' }}>
            <Brain size={22} />
          </div>
          <div>
            <div style={styles.kpiVal}>{psyList.length}</div>
            <div style={styles.kpiLabel}>Psicologia</div>
            <div style={styles.kpiSub}>Evoluções clínicas</div>
          </div>
        </div>

        <div style={styles.kpiCard} onClick={() => onSelectTab && onSelectTab('nutricao')}>
          <div style={{ ...styles.kpiIcon, backgroundColor: '#dcfce7', color: '#16a34a' }}>
            <Apple size={22} />
          </div>
          <div>
            <div style={styles.kpiVal}>{nutriList.length}</div>
            <div style={styles.kpiLabel}>Nutrição</div>
            <div style={styles.kpiSub}>Avaliações renais</div>
          </div>
        </div>

        <div style={styles.kpiCard}>
          <div style={{ ...styles.kpiIcon, backgroundColor: '#fee2e2', color: '#dc2626' }}>
            <ShieldAlert size={22} />
          </div>
          <div>
            <div style={styles.kpiVal}>{prioritarios.length}</div>
            <div style={styles.kpiLabel}>Vulnerabilidade</div>
            <div style={styles.kpiSub}>Casos prioritários</div>
          </div>
        </div>
      </div>

      {/* GRÁFICOS ANALÍTICOS */}
      <div style={styles.chartsGrid}>
        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>Censo Habitacional dos Pacientes</h3>
          <p style={styles.chartSubtitle}>Distribuição da situação de moradia declarada</p>
          <div style={{ height: '240px', marginTop: '1rem' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={moradiaData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color, #e2e8f0)" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-15} textAnchor="end" />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="total" name="Pacientes" fill="#7c3aed" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>Benefícios Sociais & Previdência</h3>
          <p style={styles.chartSubtitle}>Acesso a auxílios (BPC, aposentadoria, bolsa família)</p>
          <div style={{ height: '240px', marginTop: '1rem' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={beneficioData}
                  dataKey="total"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percent }) => `${name.substring(0, 10)}... ${(percent * 100).toFixed(0)}%`}
                >
                  {beneficioData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* PAINEL DE CASOS PRIORITÁRIOS */}
      <div style={styles.priorityCard}>
        <div style={styles.priorityHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertTriangle size={18} color="#dc2626" />
            <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-primary)' }}>
              Casos Prioritários para Intervenção Multidisciplinar
            </h3>
          </div>
          <button 
            type="button" 
            onClick={() => onSelectTab && onSelectTab('social')} 
            style={styles.linkButton}
          >
            Ver Todos
          </button>
        </div>

        {prioritarios.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Nenhum paciente com indicador de vulnerabilidade crítica no momento.
          </div>
        ) : (
          <div style={styles.priorityList}>
            {prioritarios.map(p => {
              const als = calcularAlertasVulnerabilidade(p);
              return (
                <div key={p.id} style={styles.priorityItem}>
                  <div>
                    <div style={{ fontWeight: '700', color: 'var(--text-primary)' }}>
                      {p.nomeCompleto}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                      {p.cidade || 'Betim'} • {p.escalaTurno ? p.escalaTurno.split('–')[0].trim() : 'HD'} • Tel: {p.telefonePrincipal || '-'}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                    {als.map((a, i) => (
                      <span key={i} style={{
                        ...styles.badgeAlert,
                        backgroundColor: a.gravidade === 'critica' ? '#fee2e2' : '#ffedd5',
                        color: a.gravidade === 'critica' ? '#991b1b' : '#9a3412'
                      }}>
                        {a.rotulo}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { display: 'flex', flexDirection: 'column', gap: '1.25rem' },
  kpiGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1rem' },
  kpiCard: {
    backgroundColor: 'var(--bg-card, #ffffff)',
    borderRadius: '12px',
    padding: '1.25rem',
    border: '1px solid var(--border-color, #e2e8f0)',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    cursor: 'pointer',
    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
    boxShadow: '0 1px 3px 0 rgba(0,0,0,0.05)'
  },
  kpiIcon: { width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  kpiVal: { fontSize: '1.6rem', fontWeight: '800', color: 'var(--text-primary)', lineHeight: 1.1 },
  kpiLabel: { fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-primary)', marginTop: '0.15rem' },
  kpiSub: { fontSize: '0.72rem', color: 'var(--text-secondary)' },
  chartsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' },
  chartCard: {
    backgroundColor: 'var(--bg-card, #ffffff)',
    borderRadius: '12px',
    padding: '1.25rem',
    border: '1px solid var(--border-color, #e2e8f0)',
    boxShadow: '0 1px 3px 0 rgba(0,0,0,0.05)'
  },
  chartTitle: { margin: 0, fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-primary)' },
  chartSubtitle: { margin: '0.2rem 0 0 0', fontSize: '0.78rem', color: 'var(--text-secondary)' },
  priorityCard: {
    backgroundColor: 'var(--bg-card, #ffffff)',
    borderRadius: '12px',
    border: '1px solid var(--border-color, #e2e8f0)',
    overflow: 'hidden',
    boxShadow: '0 1px 3px 0 rgba(0,0,0,0.05)'
  },
  priorityHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 1.25rem',
    backgroundColor: 'var(--bg-surface, #f8fafc)',
    borderBottom: '1px solid var(--border-color, #e2e8f0)'
  },
  linkButton: {
    background: 'none',
    border: 'none',
    color: '#7c3aed',
    fontSize: '0.825rem',
    fontWeight: '700',
    cursor: 'pointer'
  },
  priorityList: { display: 'flex', flexDirection: 'column' },
  priorityItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.85rem 1.25rem',
    borderBottom: '1px solid var(--border-color, #f1f5f9)',
    flexWrap: 'wrap',
    gap: '0.5rem'
  },
  badgeAlert: { fontSize: '0.7rem', fontWeight: '700', padding: '0.2rem 0.5rem', borderRadius: '6px' }
};
