import React, { useState, useEffect, useMemo } from 'react';
import { 
  Activity, Plus, Search, Filter, Download, Printer, 
  Edit3, Trash2, CheckCircle2, AlertTriangle, User,
  Calendar, Check, X, ShieldAlert, HeartPulse, Sparkles, TrendingUp
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, PieChart, Pie, Cell, LineChart, Line, Legend 
} from 'recharts';
import { dbService } from '../../firebase';
import { 
  getPhysiotherapyRecords, savePhysiotherapyRecord, 
  deletePhysiotherapyRecord, exportPhysiotherapyToExcel 
} from '../../services/firebase/multiService';

// Paleta de cores para gráficos clínicos
const CHART_COLORS = {
  dor: '#ef4444',
  mobilidade: '#f59e0b',
  fraqueza: '#8b5cf6',
  incapacidade: '#ec4899',
  outros: '#64748b',
  aderente: '#10b981',
  naoAderente: '#f43f5e',
  bom: '#06b6d4',
  regular: '#eab308'
};

const PERIODS = [
  { id: '2026-10', label: 'Outubro' },
  { id: '2026-09', label: 'Setembro' },
  { id: '2026-08', label: 'Agosto' },
  { id: '2026-07', label: 'Julho' },
  { id: '2026-06', label: 'Junho' },
  { id: 'all', label: 'Todos' }
];

export default function MultiPhysiotherapyTab({ unitId = 'betim', currentUser = null }) {
  const [records, setRecords] = useState([]);
  const [clinicPatients, setClinicPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('2026-10');
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTurno, setFilterTurno] = useState('all');
  const [filterSalao, setFilterSalao] = useState('all');
  const [filterAderencia, setFilterAderencia] = useState('all');
  const [filterEstado, setFilterEstado] = useState('all');
  const [filterDemanda, setFilterDemanda] = useState('all');

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [patientSearch, setPatientSearch] = useState('');
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);

  // Form State
  const initialForm = {
    id: '',
    numero: '',
    period: selectedPeriod === 'all' ? '2026-10' : selectedPeriod,
    monthName: selectedPeriod === '2026-10' ? 'OUTUBRO' : 'SETEMBRO',
    unitId: unitId || 'betim',
    patientId: '',
    patientName: '',
    patientCpf: '',
    patientCns: '',
    patientRecord: '',
    tratamento: 'HD',
    genero: 'M',
    sessoes: 1,
    turno: '1º Turno - T/Q/S',
    salao: '1',
    estadoGeral: 'Bom',
    aderente: true,
    demandas: {
      dor: false,
      mobilidade: false,
      fraqueza: false,
      incapacidade: false,
      outros: false
    },
    tipoAtendimento: 'Demanda Espontânea',
    buscaAtiva: false,
    demandaEspontanea: true,
    profissionalResponsavel: currentUser?.name || 'CAMILA',
    observacoes: ''
  };

  const [formData, setFormData] = useState(initialForm);

  // Carrega pacientes do motor central do sistema e registros
  useEffect(() => {
    loadData();
  }, [unitId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [recs, pats] = await Promise.all([
        getPhysiotherapyRecords(unitId),
        dbService.getPatients(unitId)
      ]);
      setRecords(recs || []);
      setClinicPatients(pats || []);
    } catch (e) {
      console.warn('Erro ao carregar dados de fisioterapia:', e);
    } finally {
      setLoading(false);
    }
  };

  // Motor de Autocomplete e Pesquisa de Pacientes
  const searchResultsPatients = useMemo(() => {
    if (!patientSearch || patientSearch.trim().length < 2) return [];
    const term = patientSearch.toLowerCase().trim();
    const cleanDigits = term.replace(/\D/g, '');
    return clinicPatients.filter(p => {
      const name = (p.name || p.nome || '').toLowerCase();
      const cpf = (p.cpf || '').replace(/\D/g, '');
      const cns = (p.cns || '').replace(/\D/g, '');
      const chart = (p.chartNumber || p.prontuario || '').toLowerCase();
      return name.includes(term) || (cleanDigits && (cpf.includes(cleanDigits) || cns.includes(cleanDigits))) || chart.includes(term);
    }).slice(0, 8);
  }, [clinicPatients, patientSearch]);

  const handleSelectPatient = (p) => {
    setFormData(prev => ({
      ...prev,
      patientId: p.id || '',
      patientName: p.name || p.nome || '',
      patientCpf: p.cpf || '',
      patientCns: p.cns || '',
      patientRecord: p.chartNumber || p.prontuario || '',
      genero: p.gender || p.genero || 'M',
      turno: p.shift || p.escalaTurno || prev.turno || '1º Turno - T/Q/S',
      salao: p.room ? String(p.room).replace(/\D/g, '') : prev.salao || '1',
      tratamento: p.tipoTratamento || 'HD'
    }));
    setPatientSearch(p.name || p.nome || '');
    setShowPatientDropdown(false);
  };

  const handleOpenAdd = () => {
    setEditingRecord(null);
    setFormData({
      ...initialForm,
      period: selectedPeriod === 'all' ? '2026-10' : selectedPeriod,
      profissionalResponsavel: currentUser?.name || 'CAMILA'
    });
    setPatientSearch('');
    setShowModal(true);
  };

  const handleOpenEdit = (rec) => {
    setEditingRecord(rec);
    setFormData({
      ...rec,
      demandas: rec.demandas || { dor: false, mobilidade: false, fraqueza: false, incapacidade: false, outros: false }
    });
    setPatientSearch(rec.patientName || '');
    setShowModal(true);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Deseja remover o registro de fisioterapia de "${name}"?`)) return;
    try {
      await deletePhysiotherapyRecord(id, currentUser);
      setRecords(prev => prev.filter(r => r.id !== id));
    } catch (e) {
      alert('Erro ao excluir registro.');
    }
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    if (!formData.patientName) {
      alert('Selecione ou informe o nome do paciente.');
      return;
    }

    try {
      const saved = await savePhysiotherapyRecord(formData, currentUser);
      setRecords(prev => {
        const idx = prev.findIndex(r => r.id === saved.id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = saved;
          return next;
        }
        return [saved, ...prev];
      });
      setShowModal(false);
    } catch (e) {
      alert('Erro ao salvar registro de fisioterapia.');
    }
  };

  // Registros do Período Selecionado
  const periodRecords = useMemo(() => {
    if (selectedPeriod === 'all') return records;
    return records.filter(r => r.period === selectedPeriod);
  }, [records, selectedPeriod]);

  // Registros Filtrados para a Tabela
  const filteredRecords = useMemo(() => {
    return periodRecords.filter(r => {
      // Busca
      if (searchTerm.trim()) {
        const s = searchTerm.toLowerCase().trim();
        const nome = (r.patientName || '').toLowerCase();
        const cpf = (r.patientCpf || '').toLowerCase();
        const pront = (r.patientRecord || '').toLowerCase();
        if (!nome.includes(s) && !cpf.includes(s) && !pront.includes(s)) return false;
      }
      // Turno
      if (filterTurno !== 'all' && !r.turno?.toLowerCase().includes(filterTurno.toLowerCase())) {
        return false;
      }
      // Salão
      if (filterSalao !== 'all' && String(r.salao) !== String(filterSalao)) {
        return false;
      }
      // Aderência
      if (filterAderencia === 'aderente' && !r.aderente) return false;
      if (filterAderencia === 'naoAderente' && r.aderente) return false;
      // Estado
      if (filterEstado !== 'all' && r.estadoGeral !== filterEstado) return false;
      // Demanda
      if (filterDemanda !== 'all' && !r.demandas?.[filterDemanda]) return false;

      return true;
    });
  }, [periodRecords, searchTerm, filterTurno, filterSalao, filterAderencia, filterEstado, filterDemanda]);

  // KPIs Estratégicos do Período
  const kpis = useMemo(() => {
    const total = periodRecords.length;
    if (total === 0) {
      return { total: 0, sessoes: 0, aderenciaTaxa: '0.0', bomTaxa: '0.0', dorTaxa: '0.0', fraquezaTaxa: '0.0' };
    }
    const sessoes = periodRecords.reduce((sum, r) => sum + (Number(r.sessoes) || 0), 0);
    const aderentes = periodRecords.filter(r => r.aderente).length;
    const bom = periodRecords.filter(r => r.estadoGeral === 'Bom').length;
    const dor = periodRecords.filter(r => r.demandas?.dor).length;
    const fraqueza = periodRecords.filter(r => r.demandas?.fraqueza).length;

    return {
      total,
      sessoes,
      aderenciaTaxa: ((aderentes / total) * 100).toFixed(1),
      bomTaxa: ((bom / total) * 100).toFixed(1),
      dorTaxa: ((dor / total) * 100).toFixed(1),
      fraquezaTaxa: ((fraqueza / total) * 100).toFixed(1)
    };
  }, [periodRecords]);

  // Gráfico: Demandas Clínicas
  const demandasChartData = useMemo(() => {
    let dor = 0, mobilidade = 0, fraqueza = 0, incapacidade = 0, outros = 0;
    periodRecords.forEach(r => {
      if (r.demandas?.dor) dor++;
      if (r.demandas?.mobilidade) mobilidade++;
      if (r.demandas?.fraqueza) fraqueza++;
      if (r.demandas?.incapacidade) incapacidade++;
      if (r.demandas?.outros) outros++;
    });
    return [
      { name: 'Dor', total: dor, fill: CHART_COLORS.dor },
      { name: 'Mobilidade', total: mobilidade, fill: CHART_COLORS.mobilidade },
      { name: 'Fraqueza', total: fraqueza, fill: CHART_COLORS.fraqueza },
      { name: 'Incapacidade', total: incapacidade, fill: CHART_COLORS.incapacidade },
      { name: 'Outros', total: outros, fill: CHART_COLORS.outros }
    ];
  }, [periodRecords]);

  // Gráfico: Distribuição por Turno e Salão
  const turnoSalaoData = useMemo(() => {
    const map = {};
    periodRecords.forEach(r => {
      const turnoKey = r.turno?.includes('1º') ? '1º Turno' : (r.turno?.includes('2º') ? '2º Turno' : (r.turno?.includes('3º') ? '3º Turno' : 'Outro'));
      map[turnoKey] = (map[turnoKey] || 0) + 1;
    });
    return Object.keys(map).map(k => ({ name: k, total: map[k] }));
  }, [periodRecords]);

  // Gráfico: Aderência (Pizza)
  const aderenciaPieData = useMemo(() => {
    const aderentes = periodRecords.filter(r => r.aderente).length;
    const naoAderentes = periodRecords.length - aderentes;
    return [
      { name: 'Aderente', value: aderentes, color: CHART_COLORS.aderente },
      { name: 'Não Aderente', value: naoAderentes, color: CHART_COLORS.naoAderente }
    ];
  }, [periodRecords]);

  // Gráfico: Evolução Mensal Histórica (Junho a Outubro)
  const monthlyTrendData = useMemo(() => {
    const mKeys = ['2026-06', '2026-07', '2026-08', '2026-09', '2026-10'];
    const labels = {
      '2026-06': 'Jun',
      '2026-07': 'Jul',
      '2026-08': 'Ago',
      '2026-09': 'Set',
      '2026-10': 'Out'
    };
    return mKeys.map(k => {
      const mRecs = records.filter(r => r.period === k);
      const mTotal = mRecs.length || 1;
      const mAd = mRecs.filter(r => r.aderente).length;
      const mDor = mRecs.filter(r => r.demandas?.dor).length;
      const mSess = mRecs.reduce((sum, r) => sum + (Number(r.sessoes) || 0), 0);
      return {
        month: labels[k] || k,
        aderencia: Number(((mAd / mTotal) * 100).toFixed(1)),
        dor: Number(((mDor / mTotal) * 100).toFixed(1)),
        sessoes: mSess
      };
    });
  }, [records]);

  const handleExport = () => {
    exportPhysiotherapyToExcel(filteredRecords, `Indicadores_Fisioterapia_${selectedPeriod}_${unitId}.xlsx`);
  };

  return (
    <div style={styles.container}>
      {/* SELETOR DE PERÍODO & AÇÕES DE TOPO */}
      <div style={styles.topBar}>
        <div style={styles.periodTabs}>
          {PERIODS.map(p => {
            const active = selectedPeriod === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelectedPeriod(p.id)}
                style={{
                  ...styles.periodTab,
                  ...(active ? styles.periodTabActive : {})
                }}
              >
                <span>{p.label}</span>
              </button>
            );
          })}
        </div>

        <div style={styles.topActions}>
          <button type="button" onClick={handleExport} style={styles.btnSecondary}>
            <Download size={15} color="#0d9488" />
            <span>Exportar</span>
          </button>
          <button type="button" onClick={handleOpenAdd} style={styles.btnPrimary}>
            <Plus size={16} />
            <span>Adicionar</span>
          </button>
        </div>
      </div>

      {/* GRADE DE CARDS KPIS */}
      <div style={styles.kpiGrid}>
        <div style={styles.kpiCard}>
          <div style={{ ...styles.kpiIcon, backgroundColor: '#ccfbf1', color: '#0d9488' }}>
            <Activity size={20} />
          </div>
          <div>
            <div style={styles.kpiVal}>{kpis.total}</div>
            <div style={styles.kpiLabel}>Avaliados</div>
            <div style={styles.kpiSub}>Pacientes no mês</div>
          </div>
        </div>

        <div style={styles.kpiCard}>
          <div style={{ ...styles.kpiIcon, backgroundColor: '#e0f2fe', color: '#0284c7' }}>
            <HeartPulse size={20} />
          </div>
          <div>
            <div style={styles.kpiVal}>{kpis.sessoes}</div>
            <div style={styles.kpiLabel}>Sessões</div>
            <div style={styles.kpiSub}>Atendimentos executados</div>
          </div>
        </div>

        <div style={styles.kpiCard}>
          <div style={{ ...styles.kpiIcon, backgroundColor: '#dcfce7', color: '#16a34a' }}>
            <CheckCircle2 size={20} />
          </div>
          <div>
            <div style={styles.kpiVal}>{kpis.aderenciaTaxa}%</div>
            <div style={styles.kpiLabel}>Aderência</div>
            <div style={styles.kpiSub}>Aderentes ao tratamento</div>
          </div>
        </div>

        <div style={styles.kpiCard}>
          <div style={{ ...styles.kpiIcon, backgroundColor: '#cffafe', color: '#0891b2' }}>
            <Sparkles size={20} />
          </div>
          <div>
            <div style={styles.kpiVal}>{kpis.bomTaxa}%</div>
            <div style={styles.kpiLabel}>Estado</div>
            <div style={styles.kpiSub}>Estado geral funcional bom</div>
          </div>
        </div>

        <div style={styles.kpiCard}>
          <div style={{ ...styles.kpiIcon, backgroundColor: '#fee2e2', color: '#dc2626' }}>
            <AlertTriangle size={20} />
          </div>
          <div>
            <div style={styles.kpiVal}>{kpis.dorTaxa}%</div>
            <div style={styles.kpiLabel}>Dor</div>
            <div style={styles.kpiSub}>Queixas álgicas ativas</div>
          </div>
        </div>

        <div style={styles.kpiCard}>
          <div style={{ ...styles.kpiIcon, backgroundColor: '#f3e8ff', color: '#7c3aed' }}>
            <ShieldAlert size={20} />
          </div>
          <div>
            <div style={styles.kpiVal}>{kpis.fraquezaTaxa}%</div>
            <div style={styles.kpiLabel}>Fraqueza</div>
            <div style={styles.kpiSub}>Déficit motor detectado</div>
          </div>
        </div>
      </div>

      {/* SEÇÃO DE GRÁFICOS & ANÁLISES CLÍNICAS */}
      <div style={styles.chartsGrid}>
        {/* Gráfico 1: Principais Demandas */}
        <div style={styles.chartCard}>
          <div style={styles.chartHeader}>
            <h4 style={styles.chartTitle}>Demandas</h4>
            <span style={styles.chartBadge}>Perfil Clínico</span>
          </div>
          <div style={{ width: '100%', height: 230 }}>
            <ResponsiveContainer>
              <BarChart data={demandasChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color, #e2e8f0)" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-card, #fff)', borderRadius: '8px', border: '1px solid #cbd5e1' }} 
                  formatter={(val) => [`${val} pacientes`, 'Total']}
                />
                <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                  {demandasChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico 2: Evolução Histórica dos Meses */}
        <div style={styles.chartCard}>
          <div style={styles.chartHeader}>
            <h4 style={styles.chartTitle}>Tendência</h4>
            <span style={styles.chartBadge}>Histórico</span>
          </div>
          <div style={{ width: '100%', height: 230 }}>
            <ResponsiveContainer>
              <LineChart data={monthlyTrendData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color, #e2e8f0)" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis unit="%" tick={{ fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-card, #fff)', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  formatter={(val, name) => [`${val}%`, name === 'aderencia' ? 'Aderência' : 'Dor']}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
                <Line type="monotone" dataKey="aderencia" name="Aderência" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="dor" name="Dor" stroke="#ef4444" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico 3: Aderência (Pizza) */}
        <div style={styles.chartCard}>
          <div style={styles.chartHeader}>
            <h4 style={styles.chartTitle}>Aderência</h4>
            <span style={styles.chartBadge}>Proporção</span>
          </div>
          <div style={{ width: '100%', height: 230, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie 
                  data={aderenciaPieData} 
                  dataKey="value" 
                  nameKey="name" 
                  cx="50%" 
                  cy="50%" 
                  innerRadius={50} 
                  outerRadius={80} 
                  paddingAngle={4}
                >
                  {aderenciaPieData.map((entry, index) => (
                    <Cell key={`pie-cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card, #fff)', borderRadius: '8px' }} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* BARRA DE FILTROS DA TABELA */}
      <div style={styles.filterBar}>
        <div style={styles.searchBox}>
          <Search size={16} color="var(--text-secondary, #64748b)" />
          <input 
            type="text" 
            placeholder="Buscar por paciente ou prontuário..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
          {searchTerm && (
            <button type="button" onClick={() => setSearchTerm('')} style={styles.clearBtn}>
              <X size={14} />
            </button>
          )}
        </div>

        <div style={styles.selectGroup}>
          <select 
            value={filterTurno} 
            onChange={(e) => setFilterTurno(e.target.value)}
            style={styles.selectFilter}
          >
            <option value="all">Turno</option>
            <option value="1º">1º Turno</option>
            <option value="2º">2º Turno</option>
            <option value="3º">3º Turno</option>
          </select>

          <select 
            value={filterSalao} 
            onChange={(e) => setFilterSalao(e.target.value)}
            style={styles.selectFilter}
          >
            <option value="all">Salão</option>
            <option value="1">Salão 1</option>
            <option value="2">Salão 2</option>
            <option value="3">Salão 3</option>
          </select>

          <select 
            value={filterAderencia} 
            onChange={(e) => setFilterAderencia(e.target.value)}
            style={styles.selectFilter}
          >
            <option value="all">Aderência</option>
            <option value="aderente">Aderente</option>
            <option value="naoAderente">Não aderente</option>
          </select>

          <select 
            value={filterEstado} 
            onChange={(e) => setFilterEstado(e.target.value)}
            style={styles.selectFilter}
          >
            <option value="all">Estado</option>
            <option value="Bom">Bom</option>
            <option value="Regular">Regular</option>
          </select>

          <select 
            value={filterDemanda} 
            onChange={(e) => setFilterDemanda(e.target.value)}
            style={styles.selectFilter}
          >
            <option value="all">Demanda</option>
            <option value="dor">Dor</option>
            <option value="mobilidade">Mobilidade</option>
            <option value="fraqueza">Fraqueza</option>
            <option value="incapacidade">Incapacidade</option>
            <option value="outros">Outros</option>
          </select>
        </div>
      </div>

      {/* TABELA DE REGISTROS DE FISIOTERAPIA */}
      <div style={styles.tableCard}>
        <div style={styles.tableHeader}>
          <span style={styles.tableCount}>
            {filteredRecords.length} {filteredRecords.length === 1 ? 'paciente' : 'pacientes'}
          </span>
          <span style={styles.tableLegend}>
            Profissional: <strong>CAMILA</strong>
          </span>
        </div>

        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.theadRow}>
                <th style={styles.th}>Nº</th>
                <th style={styles.th}>Paciente</th>
                <th style={styles.th}>Gênero</th>
                <th style={styles.th}>Turno</th>
                <th style={styles.th}>Salão</th>
                <th style={styles.th}>Sessões</th>
                <th style={styles.th}>Estado</th>
                <th style={styles.th}>Aderência</th>
                <th style={styles.th}>Demandas</th>
                <th style={styles.th}>Atendimento</th>
                <th style={styles.th}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={11} style={styles.emptyTd}>Carregando registros de fisioterapia...</td>
                </tr>
              ) : filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={11} style={styles.emptyTd}>Nenhum registro encontrado para os filtros selecionados.</td>
                </tr>
              ) : (
                filteredRecords.map((r, idx) => (
                  <tr key={r.id || idx} style={styles.tr}>
                    <td style={styles.tdNum}>{r.numero || idx + 1}</td>
                    <td style={styles.tdPatient}>
                      <div style={styles.patientName}>{r.patientName}</div>
                      {r.patientId && (
                        <span style={styles.linkedBadge} title="Atrelado ao cadastro do paciente">
                          <Check size={11} /> Vinculado
                        </span>
                      )}
                    </td>
                    <td style={styles.tdCenter}>
                      <span style={styles.genderBadge}>{r.genero}</span>
                    </td>
                    <td style={styles.tdText}>{r.turno}</td>
                    <td style={styles.tdCenter}>
                      <span style={styles.roomBadge}>S{r.salao}</span>
                    </td>
                    <td style={styles.tdCenter}>
                      <span style={{ ...styles.sessionBadge, backgroundColor: Number(r.sessoes) > 0 ? '#ccfbf1' : '#f1f5f9', color: Number(r.sessoes) > 0 ? '#0f766e' : '#64748b' }}>
                        {r.sessoes ?? 0}
                      </span>
                    </td>
                    <td style={styles.tdCenter}>
                      <span style={r.estadoGeral === 'Bom' ? styles.badgeBom : styles.badgeRegular}>
                        {r.estadoGeral}
                      </span>
                    </td>
                    <td style={styles.tdCenter}>
                      <span style={r.aderente ? styles.badgeAderente : styles.badgeNaoAderente}>
                        {r.aderente ? 'Aderente' : 'Não aderente'}
                      </span>
                    </td>
                    <td style={styles.tdDemandas}>
                      <div style={styles.demandasTags}>
                        {r.demandas?.dor && <span style={styles.tagDor}>Dor</span>}
                        {r.demandas?.mobilidade && <span style={styles.tagMob}>Mobilidade</span>}
                        {r.demandas?.fraqueza && <span style={styles.tagFraq}>Fraqueza</span>}
                        {r.demandas?.incapacidade && <span style={styles.tagIncap}>Incapacidade</span>}
                        {r.demandas?.outros && <span style={styles.tagOutros}>Outros</span>}
                        {!r.demandas?.dor && !r.demandas?.mobilidade && !r.demandas?.fraqueza && !r.demandas?.incapacidade && !r.demandas?.outros && (
                          <span style={styles.tagNone}>—</span>
                        )}
                      </div>
                    </td>
                    <td style={styles.tdText}>
                      <span style={styles.atendimentoBadge}>
                        {r.buscaAtiva && r.demandaEspontanea ? 'Misto' : (r.buscaAtiva ? 'Busca Ativa' : 'Espontânea')}
                      </span>
                    </td>
                    <td style={styles.tdActions}>
                      <button 
                        type="button" 
                        onClick={() => handleOpenEdit(r)}
                        style={styles.actionBtnEdit}
                        title="Editar registro"
                      >
                        <Edit3 size={15} />
                      </button>
                      <button 
                        type="button" 
                        onClick={() => handleDelete(r.id, r.patientName)}
                        style={styles.actionBtnDelete}
                        title="Remover registro"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DE CADASTRO / EDIÇÃO */}
      {showModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={styles.modalHeaderIcon}>
                  <Activity size={20} color="#0d9488" />
                </div>
                <div>
                  <h3 style={styles.modalTitle}>
                    {editingRecord ? 'Editar' : 'Registro'}
                  </h3>
                  <p style={styles.modalSubtitle}>Fisioterapia e Reabilitação Motora</p>
                </div>
              </div>
              <button type="button" onClick={() => setShowModal(false)} style={styles.modalCloseBtn}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} style={styles.modalForm}>
              {/* CAMPO PACIENTE COM MOTOR DE BUSCA DO SISTEMA */}
              <div style={styles.formGroupRelative}>
                <label style={styles.label}>Paciente</label>
                <div style={styles.patientInputContainer}>
                  <input
                    type="text"
                    required
                    placeholder="Digite o nome do paciente para buscar no sistema..."
                    value={patientSearch}
                    onChange={(e) => {
                      setPatientSearch(e.target.value);
                      setShowPatientDropdown(true);
                      setFormData(prev => ({ ...prev, patientName: e.target.value }));
                    }}
                    onFocus={() => setShowPatientDropdown(true)}
                    style={styles.input}
                  />
                  {formData.patientId && (
                    <span style={styles.inputLinkedBadge}>
                      <Check size={12} /> Vinculado
                    </span>
                  )}
                </div>

                {/* Dropdown com resultados do motor de pacientes */}
                {showPatientDropdown && searchResultsPatients.length > 0 && (
                  <div style={styles.dropdownResults}>
                    {searchResultsPatients.map(p => (
                      <div 
                        key={p.id}
                        onClick={() => handleSelectPatient(p)}
                        style={styles.dropdownItem}
                      >
                        <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{p.name || p.nome}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          CPF: {p.cpf || '—'} | Turno: {p.shift || '—'} | Salão: {p.room || '—'}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* LINHA: TRATAMENTO, GÊNERO, TURNO, SALÃO */}
              <div style={styles.formRow4}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Tratamento</label>
                  <select 
                    value={formData.tratamento}
                    onChange={(e) => setFormData(prev => ({ ...prev, tratamento: e.target.value }))}
                    style={styles.input}
                  >
                    <option value="HD">HD</option>
                    <option value="DP">DP</option>
                  </select>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Gênero</label>
                  <select 
                    value={formData.genero}
                    onChange={(e) => setFormData(prev => ({ ...prev, genero: e.target.value }))}
                    style={styles.input}
                  >
                    <option value="M">M</option>
                    <option value="F">F</option>
                  </select>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Turno</label>
                  <select 
                    value={formData.turno}
                    onChange={(e) => setFormData(prev => ({ ...prev, turno: e.target.value }))}
                    style={styles.input}
                  >
                    <option value="1º Turno - T/Q/S">1º Turno - T/Q/S</option>
                    <option value="1º Turno - S/Q/S">1º Turno - S/Q/S</option>
                    <option value="2º Turno - T/Q/S">2º Turno - T/Q/S</option>
                    <option value="2º Turno - S/Q/S">2º Turno - S/Q/S</option>
                    <option value="3º Turno - T/Q/S">3º Turno - T/Q/S</option>
                    <option value="3º Turno - S/Q/S">3º Turno - S/Q/S</option>
                  </select>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Salão</label>
                  <select 
                    value={formData.salao}
                    onChange={(e) => setFormData(prev => ({ ...prev, salao: e.target.value }))}
                    style={styles.input}
                  >
                    <option value="1">Salão 1</option>
                    <option value="2">Salão 2</option>
                    <option value="3">Salão 3</option>
                  </select>
                </div>
              </div>

              {/* LINHA: SESSÕES, ESTADO GERAL, ADERÊNCIA */}
              <div style={styles.formRow3}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Sessões</label>
                  <input 
                    type="number"
                    min="0"
                    max="31"
                    value={formData.sessoes}
                    onChange={(e) => setFormData(prev => ({ ...prev, sessoes: parseInt(e.target.value) || 0 }))}
                    style={styles.input}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Estado</label>
                  <select 
                    value={formData.estadoGeral}
                    onChange={(e) => setFormData(prev => ({ ...prev, estadoGeral: e.target.value }))}
                    style={styles.input}
                  >
                    <option value="Bom">Bom</option>
                    <option value="Regular">Regular</option>
                  </select>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Aderência</label>
                  <select 
                    value={formData.aderente ? 'sim' : 'nao'}
                    onChange={(e) => setFormData(prev => ({ ...prev, aderente: e.target.value === 'sim' }))}
                    style={styles.input}
                  >
                    <option value="sim">Aderente</option>
                    <option value="nao">Não aderente</option>
                  </select>
                </div>
              </div>

              {/* DEMANDAS (CHECKBOXES) */}
              <div style={styles.formGroup}>
                <label style={styles.label}>Demandas</label>
                <div style={styles.checkboxGrid}>
                  <label style={styles.checkboxLabel}>
                    <input 
                      type="checkbox"
                      checked={formData.demandas?.dor}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        demandas: { ...prev.demandas, dor: e.target.checked } 
                      }))}
                    />
                    <span>Dor</span>
                  </label>

                  <label style={styles.checkboxLabel}>
                    <input 
                      type="checkbox"
                      checked={formData.demandas?.mobilidade}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        demandas: { ...prev.demandas, mobilidade: e.target.checked } 
                      }))}
                    />
                    <span>Mobilidade</span>
                  </label>

                  <label style={styles.checkboxLabel}>
                    <input 
                      type="checkbox"
                      checked={formData.demandas?.fraqueza}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        demandas: { ...prev.demandas, fraqueza: e.target.checked } 
                      }))}
                    />
                    <span>Fraqueza</span>
                  </label>

                  <label style={styles.checkboxLabel}>
                    <input 
                      type="checkbox"
                      checked={formData.demandas?.incapacidade}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        demandas: { ...prev.demandas, incapacidade: e.target.checked } 
                      }))}
                    />
                    <span>Incapacidade</span>
                  </label>

                  <label style={styles.checkboxLabel}>
                    <input 
                      type="checkbox"
                      checked={formData.demandas?.outros}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        demandas: { ...prev.demandas, outros: e.target.checked } 
                      }))}
                    />
                    <span>Outros</span>
                  </label>
                </div>
              </div>

              {/* ATENDIMENTO & PROFISSIONAL */}
              <div style={styles.formRow2}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Atendimento</label>
                  <div style={styles.checkboxGrid}>
                    <label style={styles.checkboxLabel}>
                      <input 
                        type="checkbox"
                        checked={formData.demandaEspontanea}
                        onChange={(e) => setFormData(prev => ({ ...prev, demandaEspontanea: e.target.checked }))}
                      />
                      <span>Demanda Espontânea</span>
                    </label>
                    <label style={styles.checkboxLabel}>
                      <input 
                        type="checkbox"
                        checked={formData.buscaAtiva}
                        onChange={(e) => setFormData(prev => ({ ...prev, buscaAtiva: e.target.checked }))}
                      />
                      <span>Busca Ativa</span>
                    </label>
                  </div>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Profissional</label>
                  <input 
                    type="text"
                    value={formData.profissionalResponsavel}
                    onChange={(e) => setFormData(prev => ({ ...prev, profissionalResponsavel: e.target.value }))}
                    style={styles.input}
                  />
                </div>
              </div>

              {/* BOTÕES DO MODAL */}
              <div style={styles.modalActions}>
                <button type="button" onClick={() => setShowModal(false)} style={styles.btnSecondary}>
                  Cancelar
                </button>
                <button type="submit" style={styles.btnPrimary}>
                  Salvar
                </button>
              </div>
            </form>
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
    gap: '1.25rem',
    fontFamily: 'Inter, system-ui, sans-serif'
  },
  topBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '0.75rem',
    backgroundColor: 'var(--bg-card, #ffffff)',
    padding: '0.75rem 1rem',
    borderRadius: '12px',
    border: '1px solid var(--border-color, #e2e8f0)',
    boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
  },
  periodTabs: {
    display: 'flex',
    gap: '0.35rem',
    overflowX: 'auto',
    paddingBottom: '2px'
  },
  periodTab: {
    padding: '0.45rem 0.85rem',
    borderRadius: '8px',
    border: '1px solid var(--border-color, #e2e8f0)',
    backgroundColor: 'transparent',
    color: 'var(--text-secondary, #64748b)',
    fontSize: '0.8rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.15s ease'
  },
  periodTabActive: {
    backgroundColor: '#0d9488',
    borderColor: '#0d9488',
    color: '#ffffff'
  },
  topActions: {
    display: 'flex',
    gap: '0.5rem',
    alignItems: 'center'
  },
  btnPrimary: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    backgroundColor: '#0d9488',
    color: '#ffffff',
    border: 'none',
    fontSize: '0.85rem',
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 2px 4px rgba(13,148,136,0.2)'
  },
  btnSecondary: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    padding: '0.5rem 0.9rem',
    borderRadius: '8px',
    backgroundColor: 'var(--bg-card, #ffffff)',
    color: 'var(--text-primary, #0f172a)',
    border: '1px solid var(--border-color, #cbd5e1)',
    fontSize: '0.85rem',
    fontWeight: 600,
    cursor: 'pointer'
  },
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
    gap: '0.85rem'
  },
  kpiCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.85rem',
    padding: '1rem',
    borderRadius: '12px',
    backgroundColor: 'var(--bg-card, #ffffff)',
    border: '1px solid var(--border-color, #e2e8f0)',
    boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
  },
  kpiIcon: {
    width: '42px',
    height: '42px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  kpiVal: {
    fontSize: '1.35rem',
    fontWeight: 800,
    color: 'var(--text-primary, #0f172a)',
    lineHeight: 1.1
  },
  kpiLabel: {
    fontSize: '0.8rem',
    fontWeight: 700,
    color: 'var(--text-secondary, #64748b)',
    marginTop: '0.2rem'
  },
  kpiSub: {
    fontSize: '0.7rem',
    color: 'var(--text-secondary, #94a3b8)'
  },
  chartsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '1rem'
  },
  chartCard: {
    backgroundColor: 'var(--bg-card, #ffffff)',
    padding: '1rem',
    borderRadius: '12px',
    border: '1px solid var(--border-color, #e2e8f0)',
    boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
  },
  chartHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.75rem'
  },
  chartTitle: {
    margin: 0,
    fontSize: '0.95rem',
    fontWeight: 800,
    color: 'var(--text-primary, #0f172a)'
  },
  chartBadge: {
    fontSize: '0.7rem',
    fontWeight: 700,
    padding: '0.2rem 0.5rem',
    borderRadius: '6px',
    backgroundColor: '#f0fdfa',
    color: '#0d9488'
  },
  filterBar: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.75rem',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'var(--bg-card, #ffffff)',
    padding: '0.75rem 1rem',
    borderRadius: '12px',
    border: '1px solid var(--border-color, #e2e8f0)'
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    backgroundColor: 'var(--bg-secondary, #f8fafc)',
    padding: '0.45rem 0.75rem',
    borderRadius: '8px',
    border: '1px solid var(--border-color, #cbd5e1)',
    minWidth: '260px',
    flex: '1 1 300px'
  },
  searchInput: {
    border: 'none',
    outline: 'none',
    backgroundColor: 'transparent',
    fontSize: '0.85rem',
    width: '100%',
    color: 'var(--text-primary, #0f172a)'
  },
  clearBtn: {
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    color: '#94a3b8',
    padding: '2px'
  },
  selectGroup: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.45rem'
  },
  selectFilter: {
    padding: '0.45rem 0.7rem',
    borderRadius: '8px',
    border: '1px solid var(--border-color, #cbd5e1)',
    backgroundColor: 'var(--bg-card, #ffffff)',
    fontSize: '0.8rem',
    fontWeight: 600,
    color: 'var(--text-primary, #0f172a)',
    cursor: 'pointer'
  },
  tableCard: {
    backgroundColor: 'var(--bg-card, #ffffff)',
    borderRadius: '12px',
    border: '1px solid var(--border-color, #e2e8f0)',
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
  },
  tableHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.75rem 1rem',
    borderBottom: '1px solid var(--border-color, #e2e8f0)',
    backgroundColor: 'var(--bg-secondary, #f8fafc)'
  },
  tableCount: {
    fontSize: '0.85rem',
    fontWeight: 700,
    color: 'var(--text-primary, #0f172a)'
  },
  tableLegend: {
    fontSize: '0.8rem',
    color: 'var(--text-secondary, #64748b)'
  },
  tableWrapper: {
    overflowX: 'auto'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
    fontSize: '0.85rem'
  },
  theadRow: {
    backgroundColor: 'var(--bg-secondary, #f8fafc)',
    borderBottom: '1px solid var(--border-color, #e2e8f0)'
  },
  th: {
    padding: '0.65rem 0.85rem',
    fontSize: '0.75rem',
    fontWeight: 800,
    color: 'var(--text-secondary, #475569)',
    textTransform: 'uppercase',
    letterSpacing: '0.03em'
  },
  tr: {
    borderBottom: '1px solid var(--border-color, #f1f5f9)',
    transition: 'background-color 0.1s'
  },
  tdNum: {
    padding: '0.65rem 0.85rem',
    color: '#94a3b8',
    fontWeight: 600,
    width: '40px'
  },
  tdPatient: {
    padding: '0.65rem 0.85rem',
    minWidth: '220px'
  },
  patientName: {
    fontWeight: 700,
    color: 'var(--text-primary, #0f172a)',
    fontSize: '0.85rem'
  },
  linkedBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '3px',
    fontSize: '0.65rem',
    fontWeight: 700,
    color: '#0d9488',
    backgroundColor: '#f0fdfa',
    padding: '1px 5px',
    borderRadius: '4px',
    marginTop: '2px'
  },
  tdCenter: {
    padding: '0.65rem 0.85rem',
    textAlign: 'center'
  },
  tdText: {
    padding: '0.65rem 0.85rem',
    color: 'var(--text-primary, #334155)',
    whiteSpace: 'nowrap'
  },
  genderBadge: {
    fontSize: '0.75rem',
    fontWeight: 700,
    padding: '2px 6px',
    borderRadius: '4px',
    backgroundColor: '#f1f5f9',
    color: '#475569'
  },
  roomBadge: {
    fontSize: '0.75rem',
    fontWeight: 700,
    padding: '2px 7px',
    borderRadius: '6px',
    backgroundColor: '#e0f2fe',
    color: '#0369a1'
  },
  sessionBadge: {
    fontSize: '0.8rem',
    fontWeight: 800,
    padding: '2px 8px',
    borderRadius: '6px'
  },
  badgeBom: {
    fontSize: '0.75rem',
    fontWeight: 700,
    padding: '3px 8px',
    borderRadius: '6px',
    backgroundColor: '#f0fdfa',
    color: '#0d9488',
    border: '1px solid #ccfbf1'
  },
  badgeRegular: {
    fontSize: '0.75rem',
    fontWeight: 700,
    padding: '3px 8px',
    borderRadius: '6px',
    backgroundColor: '#fefce8',
    color: '#a16207',
    border: '1px solid #fef08a'
  },
  badgeAderente: {
    fontSize: '0.75rem',
    fontWeight: 700,
    padding: '3px 8px',
    borderRadius: '6px',
    backgroundColor: '#ecfdf5',
    color: '#059669',
    border: '1px solid #a7f3d0'
  },
  badgeNaoAderente: {
    fontSize: '0.75rem',
    fontWeight: 700,
    padding: '3px 8px',
    borderRadius: '6px',
    backgroundColor: '#fff1f2',
    color: '#e11d48',
    border: '1px solid #fecdd3'
  },
  tdDemandas: {
    padding: '0.65rem 0.85rem'
  },
  demandasTags: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '3px'
  },
  tagDor: {
    fontSize: '0.68rem',
    fontWeight: 700,
    padding: '2px 6px',
    borderRadius: '4px',
    backgroundColor: '#fee2e2',
    color: '#dc2626'
  },
  tagMob: {
    fontSize: '0.68rem',
    fontWeight: 700,
    padding: '2px 6px',
    borderRadius: '4px',
    backgroundColor: '#fef3c7',
    color: '#d97706'
  },
  tagFraq: {
    fontSize: '0.68rem',
    fontWeight: 700,
    padding: '2px 6px',
    borderRadius: '4px',
    backgroundColor: '#f3e8ff',
    color: '#7c3aed'
  },
  tagIncap: {
    fontSize: '0.68rem',
    fontWeight: 700,
    padding: '2px 6px',
    borderRadius: '4px',
    backgroundColor: '#fce7f3',
    color: '#db2777'
  },
  tagOutros: {
    fontSize: '0.68rem',
    fontWeight: 700,
    padding: '2px 6px',
    borderRadius: '4px',
    backgroundColor: '#f1f5f9',
    color: '#475569'
  },
  tagNone: {
    color: '#94a3b8'
  },
  atendimentoBadge: {
    fontSize: '0.72rem',
    fontWeight: 600,
    color: '#475569'
  },
  tdActions: {
    padding: '0.65rem 0.85rem',
    textAlign: 'center',
    whiteSpace: 'nowrap'
  },
  actionBtnEdit: {
    border: 'none',
    backgroundColor: 'transparent',
    color: '#0d9488',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '4px'
  },
  actionBtnDelete: {
    border: 'none',
    backgroundColor: 'transparent',
    color: '#ef4444',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '4px'
  },
  emptyTd: {
    padding: '2rem',
    textAlign: 'center',
    color: '#94a3b8'
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    backdropFilter: 'blur(3px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: '1rem'
  },
  modalContent: {
    backgroundColor: 'var(--bg-card, #ffffff)',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '580px',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
    border: '1px solid var(--border-color, #e2e8f0)'
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.1rem 1.25rem',
    borderBottom: '1px solid var(--border-color, #e2e8f0)'
  },
  modalHeaderIcon: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    backgroundColor: '#f0fdfa',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  modalTitle: {
    margin: 0,
    fontSize: '1.05rem',
    fontWeight: 800,
    color: 'var(--text-primary, #0f172a)'
  },
  modalSubtitle: {
    margin: 0,
    fontSize: '0.75rem',
    color: 'var(--text-secondary, #64748b)'
  },
  modalCloseBtn: {
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    color: '#64748b'
  },
  modalForm: {
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem'
  },
  formGroupRelative: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem',
    position: 'relative'
  },
  label: {
    fontSize: '0.8rem',
    fontWeight: 700,
    color: 'var(--text-primary, #1e293b)'
  },
  input: {
    padding: '0.55rem 0.8rem',
    borderRadius: '8px',
    border: '1px solid var(--border-color, #cbd5e1)',
    backgroundColor: 'var(--bg-secondary, #f8fafc)',
    fontSize: '0.85rem',
    color: 'var(--text-primary, #0f172a)',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box'
  },
  patientInputContainer: {
    position: 'relative'
  },
  inputLinkedBadge: {
    position: 'absolute',
    right: '8px',
    top: '50%',
    transform: 'translateY(-50%)',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '3px',
    fontSize: '0.7rem',
    fontWeight: 700,
    color: '#0d9488',
    backgroundColor: '#f0fdfa',
    padding: '2px 6px',
    borderRadius: '4px'
  },
  dropdownResults: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: 'var(--bg-card, #ffffff)',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
    zIndex: 10,
    maxHeight: '200px',
    overflowY: 'auto'
  },
  dropdownItem: {
    padding: '0.6rem 0.85rem',
    cursor: 'pointer',
    borderBottom: '1px solid #f1f5f9',
    transition: 'background-color 0.1s'
  },
  formRow4: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '0.65rem'
  },
  formRow3: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '0.65rem'
  },
  formRow2: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '0.75rem'
  },
  checkboxGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.85rem',
    padding: '0.5rem 0'
  },
  checkboxLabel: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    fontSize: '0.82rem',
    fontWeight: 600,
    cursor: 'pointer',
    color: 'var(--text-primary, #334155)'
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.75rem',
    paddingTop: '0.5rem',
    borderTop: '1px solid var(--border-color, #e2e8f0)'
  }
};
