import React, { useState, useEffect, useMemo } from 'react';
import { 
  Apple, Plus, Search, Save, X, Activity,
  LayoutDashboard, Trash2, PackagePlus, TrendingUp, Sparkles, Package, Users, Utensils
} from 'lucide-react';
import { dbService } from '../../firebase';
import { getNutritionRecords, saveNutritionRecord } from '../../services/firebase/multiService';
import FoodDashboard from './food/FoodDashboard';
import FoodMealsTab from './food/FoodMealsTab';
import FoodWasteTab from './food/FoodWasteTab';
import FoodEntriesTab from './food/FoodEntriesTab';
import FoodAproveitamentoTab from './food/FoodAproveitamentoTab';
import FoodPredictionTab from './food/FoodPredictionTab';
import FoodProductsTab from './food/FoodProductsTab';

export default function MultiNutritionTab({ unitId = 'betim', currentUser = null }) {
  // Sub-abas de Nutrição (Padrão rigoroso de 1 palavra)
  const [subTab, setSubTab] = useState('painel'); // 'painel' | 'marmitas' | 'sobras' | 'entradas' | 'aproveitamento' | 'previsao' | 'produtos' | 'pacientes'

  const subAbas = [
    { id: 'painel', rotulo: 'Painel', icone: LayoutDashboard },
    { id: 'marmitas', rotulo: 'Marmitas', icone: Utensils },
    { id: 'sobras', rotulo: 'Sobras', icone: Trash2 },
    { id: 'entradas', rotulo: 'Entradas', icone: PackagePlus },
    { id: 'aproveitamento', rotulo: 'Aproveitamento', icone: TrendingUp },
    { id: 'previsao', rotulo: 'Previsão', icone: Sparkles },
    { id: 'produtos', rotulo: 'Produtos', icone: Package },
    { id: 'pacientes', rotulo: 'Pacientes', icone: Users },
  ];

  const [records, setRecords] = useState([]);
  const [clinicPatients, setClinicPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [patientSearch, setPatientSearch] = useState('');
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);

  // Labs Integration
  const [patientRecentLabs, setPatientRecentLabs] = useState([]);
  const [loadingPatientLabs, setLoadingPatientLabs] = useState(false);
  const [viewLabsPatient, setViewLabsPatient] = useState(null);
  const [viewLabsList, setViewLabsList] = useState([]);
  const [showLabsViewer, setShowLabsViewer] = useState(false);
  const [loadingViewerLabs, setLoadingViewerLabs] = useState(false);

  const [formData, setFormData] = useState({
    id: '',
    patientId: '',
    nomePaciente: '',
    data: new Date().toISOString().substring(0, 10),
    pesoSeco: '',
    altura: '',
    imc: '',
    apetite: 'Bom',
    ingestaoHidrica: 'Adequada (<1L)',
    controleFosforo: 'Na Meta (<5.5 mg/dL)',
    controlePotassio: 'Na Meta (3.5-5.5 mEq/L)',
    condutaNutricional: '',
    responsavel: currentUser?.name || 'Nutrição',
    crn: ''
  });

  useEffect(() => {
    loadData();
  }, [unitId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [recs, pats] = await Promise.all([
        getNutritionRecords(unitId),
        dbService.getPatients(unitId)
      ]);
      setRecords(recs || []);
      setClinicPatients(pats || []);
    } catch (e) {
      console.warn('Erro ao carregar dados de nutrição:', e);
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = useMemo(() => {
    if (!patientSearch || patientSearch.length < 2) return [];
    const s = patientSearch.toLowerCase();
    return clinicPatients.filter(p => (p.name || p.nome || '').toLowerCase().includes(s)).slice(0, 8);
  }, [clinicPatients, patientSearch]);

  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      if (!searchTerm) return true;
      const s = searchTerm.toLowerCase();
      return (r.nomePaciente || '').toLowerCase().includes(s);
    });
  }, [records, searchTerm]);

  const handleSelectPatient = async (p) => {
    setFormData(prev => ({
      ...prev,
      patientId: p.id,
      nomePaciente: p.name || p.nome,
      pesoSeco: p.dryWeight || p.pesoSeco || ''
    }));
    setPatientSearch(p.name || p.nome);
    setShowPatientDropdown(false);
    setLoadingPatientLabs(true);
    try {
      const exams = await dbService.getPatientLabExams(p.id || p.name || p.nome);
      setPatientRecentLabs(exams || []);
      if (exams && exams.length > 0) {
        const latest = exams[0];
        // Auto-sugestão baseada nos exames reais do laboratório
        let autoFosf = 'Na Meta (<5.5 mg/dL)';
        if (latest.phosphorus !== null && latest.phosphorus !== undefined) {
          if (latest.phosphorus > 7.0) autoFosf = 'Muito Alto (>7.0 mg/dL)';
          else if (latest.phosphorus > 5.5) autoFosf = 'Elevado (5.5 - 7.0 mg/dL)';
        }
        let autoPot = 'Na Meta (3.5-5.5 mEq/L)';
        if (latest.potassium !== null && latest.potassium !== undefined) {
          if (latest.potassium > 6.5) autoPot = 'Crítico (>6.5 mEq/L)';
          else if (latest.potassium > 5.5) autoPot = 'Elevado (5.6 - 6.5 mEq/L)';
        }
        setFormData(prev => ({
          ...prev,
          controleFosforo: autoFosf,
          controlePotassio: autoPot
        }));
      }
    } catch (err) {
      console.warn('Erro ao carregar exames laboratoriais na nutrição:', err);
    } finally {
      setLoadingPatientLabs(false);
    }
  };

  const calculateImc = (peso, alt) => {
    if (!peso || !alt) return '';
    const h = parseFloat(alt);
    const w = parseFloat(peso);
    if (h > 0 && w > 0) {
      const hM = h > 3 ? h / 100 : h;
      return (w / (hM * hM)).toFixed(1);
    }
    return '';
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    if (!formData.nomePaciente) {
      alert('Selecione ou informe o paciente.');
      return;
    }
    try {
      await saveNutritionRecord(formData, currentUser);
      setShowModal(false);
      loadData();
    } catch (e) {
      alert('Erro ao salvar avaliação nutricional.');
    }
  };

  return (
    <div style={styles.container}>
      {/* NAVEGAÇÃO DE SUB-ABAS DA NUTRIÇÃO (1 PALAVRA) */}
      <div style={styles.subTabsContainer}>
        {subAbas.map((tab) => {
          const Icon = tab.icone;
          const isActive = subTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSubTab(tab.id)}
              style={{
                ...styles.subTabButton,
                backgroundColor: isActive ? 'var(--bg-card, #ffffff)' : 'transparent',
                color: isActive ? '#059669' : 'var(--text-secondary, #64748b)',
                borderBottom: isActive ? '2px solid #059669' : '2px solid transparent',
                fontWeight: isActive ? 700 : 500,
                boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.04)' : 'none'
              }}
            >
              <Icon size={15} />
              <span>{tab.rotulo}</span>
            </button>
          );
        })}
      </div>

      {/* 1. PAINEL DE SOBRAS & DESPERDÍCIO */}
      {subTab === 'painel' && <FoodDashboard />}

      {/* 2. CONTROLE DE MARMITAS DE FUNCIONÁRIOS */}
      {subTab === 'marmitas' && <FoodMealsTab />}

      {/* 3. REGISTRO DE SOBRAS */}
      {subTab === 'sobras' && <FoodWasteTab currentUser={currentUser} />}

      {/* 3. ENTRADAS DE ALIMENTOS */}
      {subTab === 'entradas' && <FoodEntriesTab currentUser={currentUser} />}

      {/* 4. APROVEITAMENTO & CONSUMO REAL */}
      {subTab === 'aproveitamento' && <FoodAproveitamentoTab />}

      {/* 5. PREVISÃO PREDITIVA COM IA */}
      {subTab === 'previsao' && <FoodPredictionTab />}

      {/* 6. CATÁLOGO DE PRODUTOS */}
      {subTab === 'produtos' && <FoodProductsTab currentUser={currentUser} />}

      {/* 7. PACIENTES / AVALIAÇÃO CLÍNICA RENAL */}
      {subTab === 'pacientes' && (
        <>
          {/* BARRA DE AÇÕES */}
          <div style={styles.actionsBar}>
        <div style={styles.searchBox}>
          <Search size={16} color="var(--text-secondary)" />
          <input
            type="text"
            placeholder="Buscar paciente avaliado na nutrição..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
        </div>

        <button
          type="button"
          onClick={() => {
            setFormData({
              id: '',
              patientId: '',
              nomePaciente: '',
              data: new Date().toISOString().substring(0, 10),
              pesoSeco: '',
              altura: '',
              imc: '',
              apetite: 'Bom',
              ingestaoHidrica: 'Adequada (<1L)',
              controleFosforo: 'Na Meta (<5.5 mg/dL)',
              controlePotassio: 'Na Meta (3.5-5.5 mEq/L)',
              condutaNutricional: '',
              responsavel: currentUser?.name || 'Nutrição',
              crn: ''
            });
            setPatientSearch('');
            setShowModal(true);
          }}
          style={styles.btnPrimary}
        >
          <Plus size={16} />
          Avaliação
        </button>
      </div>

      {/* TABELA DE REGISTROS */}
      <div style={styles.tableCard}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Carregando avaliações da Nutrição...
          </div>
        ) : filteredRecords.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Nenhuma avaliação nutricional cadastrada. Clique em "+ Avaliação" para registrar a primeira consulta.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.trHead}>
                  <th style={styles.th}>Data</th>
                  <th style={styles.th}>Paciente</th>
                  <th style={styles.th}>Peso</th>
                  <th style={styles.th}>IMC</th>
                  <th style={styles.th}>Fósforo</th>
                  <th style={styles.th}>Potássio</th>
                  <th style={styles.th}>Responsável</th>
                  <th style={styles.th}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((item) => (
                  <tr key={item.id} style={styles.trBody}>
                    <td style={styles.td}>
                      {item.data ? new Date(item.data).toLocaleDateString('pt-BR') : 'Hoje'}
                    </td>
                    <td style={styles.td}>
                      <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                        {item.nomePaciente}
                      </div>
                    </td>
                    <td style={styles.td}>{item.pesoSeco ? `${item.pesoSeco} kg` : '-'}</td>
                    <td style={styles.td}>{item.imc || '-'}</td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.badge,
                        backgroundColor: item.controleFosforo?.includes('Meta') ? '#dcfce7' : '#fee2e2',
                        color: item.controleFosforo?.includes('Meta') ? '#166534' : '#991b1b'
                      }}>
                        {item.controleFosforo}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.badge,
                        backgroundColor: item.controlePotassio?.includes('Meta') ? '#dcfce7' : '#fee2e2',
                        color: item.controlePotassio?.includes('Meta') ? '#166534' : '#991b1b'
                      }}>
                        {item.controlePotassio}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {item.responsavel}
                      </div>
                    </td>
                    <td style={styles.td}>
                      <button
                        type="button"
                        onClick={async () => {
                          setViewLabsPatient({ name: item.nomePaciente, patientId: item.patientId });
                          setShowLabsViewer(true);
                          setLoadingViewerLabs(true);
                          try {
                            const ex = await dbService.getPatientLabExams(item.patientId || item.nomePaciente);
                            setViewLabsList(ex || []);
                          } catch (err) {
                            setViewLabsList([]);
                          } finally {
                            setLoadingViewerLabs(false);
                          }
                        }}
                        style={{
                          padding: '4px 8px',
                          borderRadius: '6px',
                          border: '1px solid #0891b2',
                          backgroundColor: '#f0fdfa',
                          color: '#0891b2',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                        title="Consultar histórico de exames laboratoriais do paciente"
                      >
                        <Activity size={12} />
                        <span>Exames</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL DE AVALIAÇÃO NUTRICIONAL */}
      {showModal && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Apple size={22} color="#16a34a" />
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '700' }}>
                  Avaliação Nutricional Renal
                </h3>
              </div>
              <button type="button" onClick={() => setShowModal(false)} style={styles.btnClose}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ position: 'relative' }}>
                <label style={styles.label}>Paciente *</label>
                <input
                  type="text"
                  required
                  placeholder="Buscar paciente..."
                  value={patientSearch}
                  onChange={(e) => {
                    setPatientSearch(e.target.value);
                    setShowPatientDropdown(true);
                  }}
                  onFocus={() => setShowPatientDropdown(true)}
                  style={styles.input}
                />
                {showPatientDropdown && filteredPatients.length > 0 && (
                  <div style={styles.dropdown}>
                    {filteredPatients.map(p => (
                      <div
                        key={p.id}
                        onClick={() => handleSelectPatient(p)}
                        style={styles.dropdownItem}
                      >
                        {p.name || p.nome}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Card de Exames Laboratoriais Integrados da Clínica */}
              {loadingPatientLabs ? (
                <div style={{ padding: '0.75rem', backgroundColor: '#f0fdfa', borderRadius: '8px', border: '1px solid #ccfbf1', fontSize: '0.8rem', color: '#0f766e', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Activity size={14} className="spin" />
                  <span>Consultando exames laboratoriais do paciente no LIS...</span>
                </div>
              ) : patientRecentLabs.length > 0 ? (() => {
                const latest = patientRecentLabs[0];
                return (
                  <div style={{
                    padding: '0.85rem 1rem',
                    backgroundColor: '#f8fafc',
                    borderRadius: '10px',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0891b2', fontWeight: '700', fontSize: '0.82rem' }}>
                        <Activity size={15} />
                        <span>Laboratório Integrado (Coleta: {latest.date ? latest.date.split('-').reverse().join('/') : '-'})</span>
                      </div>
                      <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                        Sugerido do LIS
                      </span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '6px', marginTop: '2px' }}>
                      <div style={{ padding: '6px 8px', borderRadius: '6px', backgroundColor: latest.phosphorus > 5.5 ? '#fee2e2' : '#ffffff', border: '1px solid #cbd5e1' }}>
                        <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '600' }}>Fósforo</div>
                        <div style={{ fontSize: '0.95rem', fontWeight: '800', color: latest.phosphorus > 5.5 ? '#991b1b' : '#0f172a' }}>
                          {latest.phosphorus !== null && latest.phosphorus !== undefined ? `${latest.phosphorus} mg/dL` : '-'}
                        </div>
                      </div>
                      <div style={{ padding: '6px 8px', borderRadius: '6px', backgroundColor: latest.potassium > 5.5 ? '#fee2e2' : '#ffffff', border: '1px solid #cbd5e1' }}>
                        <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '600' }}>Potássio</div>
                        <div style={{ fontSize: '0.95rem', fontWeight: '800', color: latest.potassium > 5.5 ? '#991b1b' : '#0f172a' }}>
                          {latest.potassium !== null && latest.potassium !== undefined ? `${latest.potassium} mEq/L` : '-'}
                        </div>
                      </div>
                      <div style={{ padding: '6px 8px', borderRadius: '6px', backgroundColor: '#ffffff', border: '1px solid #cbd5e1' }}>
                        <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '600' }}>Cálcio</div>
                        <div style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0f172a' }}>
                          {latest.calcium !== null && latest.calcium !== undefined ? `${latest.calcium} mg/dL` : '-'}
                        </div>
                      </div>
                      <div style={{ padding: '6px 8px', borderRadius: '6px', backgroundColor: latest.albumin && latest.albumin < 3.8 ? '#fef3c7' : '#ffffff', border: '1px solid #cbd5e1' }}>
                        <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '600' }}>Albumina</div>
                        <div style={{ fontSize: '0.95rem', fontWeight: '800', color: latest.albumin && latest.albumin < 3.8 ? '#92400e' : '#0f172a' }}>
                          {latest.albumin !== null && latest.albumin !== undefined ? `${latest.albumin} g/dL` : '-'}
                        </div>
                      </div>
                      <div style={{ padding: '6px 8px', borderRadius: '6px', backgroundColor: '#ffffff', border: '1px solid #cbd5e1' }}>
                        <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '600' }}>Kt/V</div>
                        <div style={{ fontSize: '0.95rem', fontWeight: '800', color: latest.ktv >= 1.20 ? '#166534' : '#b45309' }}>
                          {latest.ktv !== null && latest.ktv !== undefined ? `${latest.ktv}` : '-'}
                        </div>
                      </div>
                      <div style={{ padding: '6px 8px', borderRadius: '6px', backgroundColor: '#ffffff', border: '1px solid #cbd5e1' }}>
                        <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '600' }}>Ureia Pré/Pós</div>
                        <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#334155' }}>
                          {latest.ureaPre || '-'} / {latest.ureaPost || '-'}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })() : null}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                <div>
                  <label style={styles.label}>Peso (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.pesoSeco}
                    onChange={(e) => {
                      const w = e.target.value;
                      setFormData(prev => ({
                        ...prev,
                        pesoSeco: w,
                        imc: calculateImc(w, prev.altura)
                      }));
                    }}
                    style={styles.input}
                    placeholder="70.5"
                  />
                </div>
                <div>
                  <label style={styles.label}>Altura (m)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.altura}
                    onChange={(e) => {
                      const h = e.target.value;
                      setFormData(prev => ({
                        ...prev,
                        altura: h,
                        imc: calculateImc(prev.pesoSeco, h)
                      }));
                    }}
                    style={styles.input}
                    placeholder="1.72"
                  />
                </div>
                <div>
                  <label style={styles.label}>IMC</label>
                  <input
                    type="text"
                    readOnly
                    value={formData.imc}
                    style={{ ...styles.input, backgroundColor: '#f1f5f9' }}
                    placeholder="Auto"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={styles.label}>Fósforo</label>
                  <select
                    value={formData.controleFosforo}
                    onChange={(e) => setFormData(prev => ({ ...prev, controleFosforo: e.target.value }))}
                    style={styles.select}
                  >
                    <option value="Na Meta (<5.5 mg/dL)">Na Meta (&lt;5.5 mg/dL)</option>
                    <option value="Elevado (5.5 - 7.0 mg/dL)">Elevado (5.5 - 7.0 mg/dL)</option>
                    <option value="Muito Alto (>7.0 mg/dL)">Muito Alto (&gt;7.0 mg/dL)</option>
                  </select>
                </div>
                <div>
                  <label style={styles.label}>Potássio</label>
                  <select
                    value={formData.controlePotassio}
                    onChange={(e) => setFormData(prev => ({ ...prev, controlePotassio: e.target.value }))}
                    style={styles.select}
                  >
                    <option value="Na Meta (3.5-5.5 mEq/L)">Na Meta (3.5-5.5 mEq/L)</option>
                    <option value="Elevado (5.6 - 6.5 mEq/L)">Elevado (5.6 - 6.5 mEq/L)</option>
                    <option value="Crítico (>6.5 mEq/L)">Crítico (&gt;6.5 mEq/L)</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={styles.label}>Conduta</label>
                <textarea
                  rows={4}
                  placeholder="Orientações de ingesta hídrica, alimentos ricos em potássio/fósforo, quelantes e dieta renal..."
                  value={formData.condutaNutricional}
                  onChange={(e) => setFormData(prev => ({ ...prev, condutaNutricional: e.target.value }))}
                  style={styles.textarea}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setPatientRecentLabs([]);
                  }}
                  style={styles.btnSecondary}
                >
                  Cancelar
                </button>
                <button type="submit" style={styles.btnPrimary}>
                  <Save size={16} /> Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE HISTÓRICO DE EXAMES LABORATORIAIS (CONSULTA RÁPIDA) */}
      {showLabsViewer && viewLabsPatient && (
        <div style={styles.overlay} onClick={() => setShowLabsViewer(false)}>
          <div
            style={{
              ...styles.modal,
              maxWidth: '850px',
              maxHeight: '85vh',
              display: 'flex',
              flexDirection: 'column'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={styles.modalHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Activity size={22} color="#0891b2" />
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700' }}>
                    {viewLabsPatient.name ? viewLabsPatient.name.toUpperCase() : 'PACIENTE'}
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    Histórico Laboratorial dos Últimos Meses
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowLabsViewer(false);
                  setViewLabsPatient(null);
                  setViewLabsList([]);
                }}
                style={styles.btnClose}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '1.25rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {loadingViewerLabs ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                  Carregando exames...
                </div>
              ) : viewLabsList.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                  Nenhum exame laboratorial registrado para este paciente nos últimos 4 meses.
                </div>
              ) : (
                <div style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid var(--border-color, #e2e8f0)' }}>
                  <table style={styles.table}>
                    <thead>
                      <tr style={styles.trHead}>
                        <th style={styles.th}>Mês</th>
                        <th style={styles.th}>Data</th>
                        <th style={styles.th}>Fósforo</th>
                        <th style={styles.th}>Potássio</th>
                        <th style={styles.th}>Cálcio</th>
                        <th style={styles.th}>Albumina</th>
                        <th style={styles.th}>Kt/V</th>
                        <th style={styles.th}>Ureia Pré</th>
                        <th style={styles.th}>Ureia Pós</th>
                        <th style={styles.th}>Hb</th>
                      </tr>
                    </thead>
                    <tbody>
                      {viewLabsList.map(row => {
                        const [y, m] = (row.month || '').split('-');
                        const monthNames = { '08': 'Agosto', '09': 'Setembro', '10': 'Outubro', '11': 'Novembro' };
                        const monthLabel = `${monthNames[m] || m}/${y ? y.substring(2) : ''}`;
                        return (
                          <tr key={row.id} style={styles.trBody}>
                            <td style={styles.td}><strong>{monthLabel}</strong></td>
                            <td style={styles.td}>{row.date ? row.date.split('-').reverse().join('/') : '-'}</td>
                            <td style={{
                              ...styles.td,
                              fontWeight: '700',
                              color: row.phosphorus > 5.5 ? '#b91c1c' : '#166534'
                            }}>
                              {row.phosphorus ? `${row.phosphorus} mg/dL` : '-'}
                            </td>
                            <td style={{
                              ...styles.td,
                              fontWeight: '700',
                              color: row.potassium > 5.5 ? '#b91c1c' : row.potassium < 3.5 ? '#b45309' : '#166534'
                            }}>
                              {row.potassium ? `${row.potassium} mEq/L` : '-'}
                            </td>
                            <td style={styles.td}>{row.calcium ? `${row.calcium} mg/dL` : '-'}</td>
                            <td style={{
                              ...styles.td,
                              fontWeight: '700',
                              color: row.albumin && row.albumin < 3.8 ? '#b45309' : '#166534'
                            }}>
                              {row.albumin ? `${row.albumin} g/dL` : '-'}
                            </td>
                            <td style={{
                              ...styles.td,
                              fontWeight: '700',
                              color: row.ktv >= 1.20 ? '#166534' : row.ktv ? '#b45309' : '#64748b'
                            }}>
                              {row.ktv || '-'}
                            </td>
                            <td style={styles.td}>{row.ureaPre || '-'}</td>
                            <td style={styles.td}>{row.ureaPost || '-'}</td>
                            <td style={styles.td}>{row.hemoglobin || '-'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div style={{ padding: '0.85rem 1.25rem', borderTop: '1px solid var(--border-color, #e2e8f0)', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => {
                  setShowLabsViewer(false);
                  setViewLabsPatient(null);
                  setViewLabsList([]);
                }}
                style={styles.btnSecondary}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
}

const styles = {
  container: { display: 'flex', flexDirection: 'column', gap: '1.25rem' },
  subTabsContainer: {
    display: 'flex',
    gap: '0.35rem',
    backgroundColor: 'var(--bg-surface, #f8fafc)',
    padding: '0.35rem',
    borderRadius: '12px',
    border: '1px solid var(--border-color, #e2e8f0)',
    overflowX: 'auto',
    flexWrap: 'nowrap'
  },
  subTabButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.45rem',
    padding: '0.55rem 0.95rem',
    borderRadius: '8px',
    border: 'none',
    fontSize: '0.825rem',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    whiteSpace: 'nowrap'
  },
  actionsBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '0.75rem',
    backgroundColor: 'var(--bg-card, #ffffff)',
    padding: '0.85rem 1.25rem',
    borderRadius: '12px',
    border: '1px solid var(--border-color, #e2e8f0)'
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    backgroundColor: 'var(--bg-surface, #f8fafc)',
    padding: '0.5rem 0.85rem',
    borderRadius: '8px',
    border: '1px solid var(--border-color, #e2e8f0)',
    flex: '1 1 260px',
    maxWidth: '420px'
  },
  searchInput: {
    background: 'none',
    border: 'none',
    outline: 'none',
    width: '100%',
    color: 'var(--text-primary, #0f172a)',
    fontSize: '0.85rem'
  },
  btnPrimary: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    padding: '0.55rem 1rem',
    borderRadius: '8px',
    backgroundColor: '#16a34a',
    color: '#ffffff',
    border: 'none',
    fontWeight: '600',
    fontSize: '0.825rem',
    cursor: 'pointer'
  },
  btnSecondary: {
    padding: '0.5rem 0.85rem',
    borderRadius: '8px',
    border: '1px solid var(--border-color, #cbd5e1)',
    backgroundColor: 'var(--bg-card, #ffffff)',
    color: 'var(--text-primary, #1e293b)',
    fontWeight: '500',
    fontSize: '0.825rem',
    cursor: 'pointer'
  },
  tableCard: {
    backgroundColor: 'var(--bg-card, #ffffff)',
    borderRadius: '12px',
    border: '1px solid var(--border-color, #e2e8f0)',
    overflow: 'hidden'
  },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
  trHead: { backgroundColor: 'var(--bg-surface, #f8fafc)', borderBottom: '1px solid var(--border-color, #e2e8f0)' },
  th: { padding: '0.75rem 1rem', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-secondary, #64748b)' },
  trBody: { borderBottom: '1px solid var(--border-color, #f1f5f9)' },
  td: { padding: '0.85rem 1rem', fontSize: '0.85rem', verticalAlign: 'middle' },
  badge: { fontSize: '0.72rem', fontWeight: '600', padding: '0.15rem 0.5rem', borderRadius: '6px', backgroundColor: '#f1f5f9', color: '#334155' },
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    backdropFilter: 'blur(3px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000,
    padding: '1rem'
  },
  modal: {
    backgroundColor: 'var(--bg-card, #ffffff)',
    borderRadius: '14px',
    width: '100%',
    maxWidth: '640px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15)',
    border: '1px solid var(--border-color, #e2e8f0)',
    overflow: 'hidden'
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 1.25rem',
    borderBottom: '1px solid var(--border-color, #e2e8f0)',
    backgroundColor: 'var(--bg-surface, #f8fafc)'
  },
  btnClose: { background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' },
  label: { fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '0.35rem', display: 'block' },
  input: { width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid var(--border-color, #cbd5e1)', fontSize: '0.875rem' },
  select: { width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid var(--border-color, #cbd5e1)', fontSize: '0.875rem' },
  textarea: { width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid var(--border-color, #cbd5e1)', fontSize: '0.875rem', fontFamily: 'inherit' },
  dropdown: { position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '0.25rem', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', zIndex: 20, maxHeight: '180px', overflowY: 'auto' },
  dropdownItem: { padding: '0.6rem 0.8rem', cursor: 'pointer', borderBottom: '1px solid #f1f5f9', fontSize: '0.85rem' }
};
