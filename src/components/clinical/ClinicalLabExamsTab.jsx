import React, { useState } from 'react';
import { Activity, Plus, Trash2, CheckCircle, AlertTriangle, XCircle, TrendingUp, Calendar, Info } from 'lucide-react';

export default function ClinicalLabExamsTab({
  patient,
  labExams = [],
  onSaveLabExam,
  onDeleteLabExam,
  loading = false
}) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().substring(0, 10),
    month: new Date().toISOString().substring(0, 7),
    hemoglobin: '',
    hematocrit: '',
    ferritin: '',
    transferrinSat: '',
    phosphorus: '',
    calcium: '',
    pth: '',
    potassium: '',
    ureaPre: '',
    ureaPost: '',
    ktv: '',
    urr: '',
    albumin: '',
    hiv: 'Não Reagente',
    hcv: 'Não Reagente',
    hbsag: 'Não Reagente',
    antiHbs: 'Reagente (>100 UI/mL)',
    notes: ''
  });

  // Calculate automatic Kt/V and URR when ureaPre and ureaPost are filled
  const handleUreaChange = (field, val) => {
    const nextForm = { ...formData, [field]: val };
    const pre = parseFloat(field === 'ureaPre' ? val : formData.ureaPre);
    const post = parseFloat(field === 'ureaPost' ? val : formData.ureaPost);
    if (pre > 0 && post > 0 && pre > post) {
      const urrVal = ((pre - post) / pre) * 100;
      nextForm.urr = urrVal.toFixed(1);
      // Daugirdas single-pool approximation: -ln(R - 0.008*t) + (4 - 3.5*R) * 0.55 * UF/W
      const R = post / pre;
      const approxKtv = -Math.log(R - 0.008 * 4) + (4 - 3.5 * R) * 0.1;
      if (approxKtv > 0) {
        nextForm.ktv = approxKtv.toFixed(2);
      }
    }
    setFormData(nextForm);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveLabExam({
      patientId: patient.id,
      ...formData,
      hemoglobin: parseFloat(formData.hemoglobin) || 0,
      hematocrit: parseFloat(formData.hematocrit) || 0,
      ferritin: parseFloat(formData.ferritin) || 0,
      transferrinSat: parseFloat(formData.transferrinSat) || 0,
      phosphorus: parseFloat(formData.phosphorus) || 0,
      calcium: parseFloat(formData.calcium) || 0,
      pth: parseFloat(formData.pth) || 0,
      potassium: parseFloat(formData.potassium) || 0,
      ureaPre: parseFloat(formData.ureaPre) || 0,
      ureaPost: parseFloat(formData.ureaPost) || 0,
      ktv: parseFloat(formData.ktv) || 0,
      urr: parseFloat(formData.urr) || 0,
      albumin: parseFloat(formData.albumin) || 0
    });
    setShowForm(false);
  };

  // Helper for SBN Meta Status
  const getExamStatus = (key, val) => {
    const num = parseFloat(val);
    if (isNaN(num) || num <= 0) return { status: 'none', label: '-' };
    switch (key) {
      case 'hemoglobin':
        if (num >= 10 && num <= 12) return { status: 'good', label: 'Meta SBN (10-12)' };
        if (num < 10) return { status: 'bad', label: 'Abaixo (< 10)' };
        return { status: 'warn', label: 'Acima (> 12)' };
      case 'ferritin':
        if (num >= 200 && num <= 800) return { status: 'good', label: 'Adequado (200-800)' };
        if (num < 200) return { status: 'bad', label: 'Déficit Ferro (< 200)' };
        return { status: 'warn', label: 'Sobrecarga (> 800)' };
      case 'transferrinSat':
        if (num >= 20 && num <= 50) return { status: 'good', label: 'Adequado (20-50%)' };
        if (num < 20) return { status: 'bad', label: 'Déficit Sat (< 20%)' };
        return { status: 'warn', label: 'Elevado (> 50%)' };
      case 'phosphorus':
        if (num >= 3.5 && num <= 5.5) return { status: 'good', label: 'Controlado (3.5-5.5)' };
        if (num > 5.5) return { status: 'bad', label: 'Hiperfosfatemia (> 5.5)' };
        return { status: 'warn', label: 'Baixo (< 3.5)' };
      case 'calcium':
        if (num >= 8.5 && num <= 10.2) return { status: 'good', label: 'Normal (8.5-10.2)' };
        return { status: 'bad', label: num > 10.2 ? 'Hipercalcemia' : 'Hipocalcemia' };
      case 'potassium':
        if (num >= 3.5 && num <= 5.5) return { status: 'good', label: 'Normal (3.5-5.5)' };
        if (num > 5.5) return { status: 'bad', label: 'Risco Hipercalemia (> 5.5)' };
        return { status: 'warn', label: 'Hipocalemia (< 3.5)' };
      case 'ktv':
        if (num >= 1.2) return { status: 'good', label: 'Adequado (≥ 1.2)' };
        return { status: 'bad', label: 'Sub-diálise (< 1.2)' };
      case 'pth':
        if (num >= 150 && num <= 600) return { status: 'good', label: 'Alvo DRC (150-600)' };
        if (num > 600) return { status: 'bad', label: 'HPTS Severo (> 600)' };
        return { status: 'warn', label: 'Adinâmica (< 150)' };
      default:
        return { status: 'none', label: '-' };
    }
  };

  const renderStatusBadge = (key, val) => {
    const res = getExamStatus(key, val);
    if (res.status === 'good') {
      return (
        <span style={{ fontSize: '0.7rem', fontWeight: '700', color: '#166534', backgroundColor: '#dcfce7', padding: '0.1rem 0.35rem', borderRadius: '4px' }}>
          ✓ {val}
        </span>
      );
    }
    if (res.status === 'bad') {
      return (
        <span style={{ fontSize: '0.7rem', fontWeight: '800', color: '#991b1b', backgroundColor: '#fee2e2', padding: '0.1rem 0.35rem', borderRadius: '4px' }}>
          ⚠ {val}
        </span>
      );
    }
    if (res.status === 'warn') {
      return (
        <span style={{ fontSize: '0.7rem', fontWeight: '700', color: '#854d0e', backgroundColor: '#fef9c3', padding: '0.1rem 0.35rem', borderRadius: '4px' }}>
          • {val}
        </span>
      );
    }
    return <span>{val || '-'}</span>;
  };

  const latest = labExams[0] || {};

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h3 style={styles.title}>Painel Laboratorial & Metas SBN</h3>
          <p style={styles.subtitle}>Acompanhamento mensal de anemia, metabolismo mineral ósseo e adequação dialítica.</p>
        </div>
        <button 
          type="button" 
          onClick={() => setShowForm(!showForm)} 
          style={styles.addBtn}
        >
          <Plus size={15} />
          <span>{showForm ? 'Fechar' : 'Lançar'}</span>
        </button>
      </div>

      {/* Overview Cards (Latest Results vs Target) */}
      <div style={styles.kpiGrid}>
        <div style={styles.kpiCard}>
          <span style={styles.kpiLabel}>Hemoglobina</span>
          <div style={styles.kpiValue}>{renderStatusBadge('hemoglobin', latest.hemoglobin)}</div>
          <span style={styles.kpiTarget}>Meta: 10 - 12 g/dL</span>
        </div>

        <div style={styles.kpiCard}>
          <span style={styles.kpiLabel}>Adequação (Kt/V)</span>
          <div style={styles.kpiValue}>{renderStatusBadge('ktv', latest.ktv)}</div>
          <span style={styles.kpiTarget}>Meta: &gt; 1.20</span>
        </div>

        <div style={styles.kpiCard}>
          <span style={styles.kpiLabel}>Fósforo</span>
          <div style={styles.kpiValue}>{renderStatusBadge('phosphorus', latest.phosphorus)}</div>
          <span style={styles.kpiTarget}>Meta: 3.5 - 5.5 mg/dL</span>
        </div>

        <div style={styles.kpiCard}>
          <span style={styles.kpiLabel}>Ferritina</span>
          <div style={styles.kpiValue}>{renderStatusBadge('ferritin', latest.ferritin)}</div>
          <span style={styles.kpiTarget}>Meta: 200 - 800 ng/mL</span>
        </div>

        <div style={styles.kpiCard}>
          <span style={styles.kpiLabel}>Potássio</span>
          <div style={styles.kpiValue}>{renderStatusBadge('potassium', latest.potassium)}</div>
          <span style={styles.kpiTarget}>Meta: 3.5 - 5.5 mEq/L</span>
        </div>

        <div style={styles.kpiCard}>
          <span style={styles.kpiLabel}>PTH Intacto</span>
          <div style={styles.kpiValue}>{renderStatusBadge('pth', latest.pth)}</div>
          <span style={styles.kpiTarget}>Meta: 150 - 600 pg/mL</span>
        </div>
      </div>

      {/* Lab Form */}
      {showForm && (
        <form onSubmit={handleSubmit} style={styles.formCard}>
          <h4 style={{ margin: '0 0 1rem 0', color: '#0f172a', fontSize: '1rem', fontWeight: '800' }}>
            Lançamento de Resultados Laboratoriais
          </h4>

          <div style={styles.formGrid}>
            <div className="form-group">
              <label>Data *</label>
              <input 
                type="date" 
                className="form-control" 
                value={formData.date} 
                onChange={e => setFormData({ ...formData, date: e.target.value, month: e.target.value.substring(0, 7) })} 
                required 
              />
            </div>

            <div className="form-group">
              <label>Hemoglobina (g/dL)</label>
              <input 
                type="number" 
                step="0.1" 
                className="form-control" 
                placeholder="Ex: 11.2" 
                value={formData.hemoglobin} 
                onChange={e => setFormData({ ...formData, hemoglobin: e.target.value })} 
              />
            </div>

            <div className="form-group">
              <label>Hematócrito (%)</label>
              <input 
                type="number" 
                step="0.1" 
                className="form-control" 
                placeholder="Ex: 34.0" 
                value={formData.hematocrit} 
                onChange={e => setFormData({ ...formData, hematocrit: e.target.value })} 
              />
            </div>

            <div className="form-group">
              <label>Ferritina (ng/mL)</label>
              <input 
                type="number" 
                className="form-control" 
                placeholder="Ex: 350" 
                value={formData.ferritin} 
                onChange={e => setFormData({ ...formData, ferritin: e.target.value })} 
              />
            </div>

            <div className="form-group">
              <label>Sat. Transferrina (%)</label>
              <input 
                type="number" 
                step="0.1" 
                className="form-control" 
                placeholder="Ex: 28.0" 
                value={formData.transferrinSat} 
                onChange={e => setFormData({ ...formData, transferrinSat: e.target.value })} 
              />
            </div>

            <div className="form-group">
              <label>Fósforo (mg/dL)</label>
              <input 
                type="number" 
                step="0.1" 
                className="form-control" 
                placeholder="Ex: 4.8" 
                value={formData.phosphorus} 
                onChange={e => setFormData({ ...formData, phosphorus: e.target.value })} 
              />
            </div>

            <div className="form-group">
              <label>Cálcio (mg/dL)</label>
              <input 
                type="number" 
                step="0.1" 
                className="form-control" 
                placeholder="Ex: 9.2" 
                value={formData.calcium} 
                onChange={e => setFormData({ ...formData, calcium: e.target.value })} 
              />
            </div>

            <div className="form-group">
              <label>PTH (pg/mL)</label>
              <input 
                type="number" 
                className="form-control" 
                placeholder="Ex: 290" 
                value={formData.pth} 
                onChange={e => setFormData({ ...formData, pth: e.target.value })} 
              />
            </div>

            <div className="form-group">
              <label>Potássio (mEq/L)</label>
              <input 
                type="number" 
                step="0.1" 
                className="form-control" 
                placeholder="Ex: 5.2" 
                value={formData.potassium} 
                onChange={e => setFormData({ ...formData, potassium: e.target.value })} 
              />
            </div>

            <div className="form-group">
              <label>Ureia Pré (mg/dL)</label>
              <input 
                type="number" 
                className="form-control" 
                placeholder="Ex: 140" 
                value={formData.ureaPre} 
                onChange={e => handleUreaChange('ureaPre', e.target.value)} 
              />
            </div>

            <div className="form-group">
              <label>Ureia Pós (mg/dL)</label>
              <input 
                type="number" 
                className="form-control" 
                placeholder="Ex: 38" 
                value={formData.ureaPost} 
                onChange={e => handleUreaChange('ureaPost', e.target.value)} 
              />
            </div>

            <div className="form-group">
              <label>Kt/V (Calculado)</label>
              <input 
                type="number" 
                step="0.01" 
                className="form-control" 
                placeholder="Ex: 1.42" 
                value={formData.ktv} 
                onChange={e => setFormData({ ...formData, ktv: e.target.value })} 
              />
            </div>

            <div className="form-group">
              <label>URR (%)</label>
              <input 
                type="number" 
                step="0.1" 
                className="form-control" 
                placeholder="Ex: 72.5" 
                value={formData.urr} 
                onChange={e => setFormData({ ...formData, urr: e.target.value })} 
              />
            </div>

            <div className="form-group">
              <label>Albumina (g/dL)</label>
              <input 
                type="number" 
                step="0.1" 
                className="form-control" 
                placeholder="Ex: 3.9" 
                value={formData.albumin} 
                onChange={e => setFormData({ ...formData, albumin: e.target.value })} 
              />
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '0.75rem' }}>
            <label>Laudo / Observações</label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="Ex: Boa adequação dialítica, anemia controlada..." 
              value={formData.notes} 
              onChange={e => setFormData({ ...formData, notes: e.target.value })} 
            />
          </div>

          <div style={styles.formActions}>
            <button type="button" onClick={() => setShowForm(false)} className="btn btn-secondary">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="btn btn-primary" style={{ backgroundColor: '#10b981' }}>
              {loading ? 'Salvando...' : 'Salvar Resultados'}
            </button>
          </div>
        </form>
      )}

      {/* Historical Matrix Table */}
      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th>Mês</th>
              <th>Hb (g/dL)</th>
              <th>Ferritina</th>
              <th>Sat. Transf.</th>
              <th>Fósforo</th>
              <th>Cálcio</th>
              <th>PTH</th>
              <th>Potássio</th>
              <th>Kt/V</th>
              <th>URR</th>
              <th>Albumina</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {labExams.length === 0 ? (
              <tr>
                <td colSpan="12" style={styles.noDataCell}>
                  Nenhum exame laboratorial lançado para este paciente.
                </td>
              </tr>
            ) : (
              labExams.map(exam => (
                <tr key={exam.id}>
                  <td>
                    <div style={{ fontWeight: '700', color: '#0f172a' }}>
                      {exam.date ? new Date(exam.date).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }) : exam.month}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                      {exam.date ? new Date(exam.date).toLocaleDateString('pt-BR') : ''}
                    </div>
                  </td>
                  <td>{renderStatusBadge('hemoglobin', exam.hemoglobin)}</td>
                  <td>{renderStatusBadge('ferritin', exam.ferritin)}</td>
                  <td>{renderStatusBadge('transferrinSat', exam.transferrinSat ? `${exam.transferrinSat}%` : '')}</td>
                  <td>{renderStatusBadge('phosphorus', exam.phosphorus)}</td>
                  <td>{renderStatusBadge('calcium', exam.calcium)}</td>
                  <td>{renderStatusBadge('pth', exam.pth)}</td>
                  <td>{renderStatusBadge('potassium', exam.potassium)}</td>
                  <td>{renderStatusBadge('ktv', exam.ktv)}</td>
                  <td>{exam.urr ? `${exam.urr}%` : '-'}</td>
                  <td>{exam.albumin || '-'}</td>
                  <td>
                    <button
                      type="button"
                      onClick={() => onDeleteLabExam(exam.id)}
                      style={styles.deleteBtn}
                      title="Excluir exame"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #e2e8f0',
    paddingBottom: '0.75rem',
    flexWrap: 'wrap',
    gap: '0.75rem',
  },
  title: {
    fontSize: '1.15rem',
    fontWeight: '800',
    color: '#0f172a',
    margin: 0,
  },
  subtitle: {
    fontSize: '0.8rem',
    color: '#64748b',
    margin: 0,
    marginTop: '0.2rem',
  },
  addBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    padding: '0.5rem 0.9rem',
    fontSize: '0.8rem',
    fontWeight: '700',
    backgroundColor: '#10b981',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '0.75rem',
  },
  kpiCard: {
    backgroundColor: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '0.75rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: '0.25rem',
    boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
  },
  kpiLabel: {
    fontSize: '0.7rem',
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
  },
  kpiValue: {
    margin: '0.2rem 0',
  },
  kpiTarget: {
    fontSize: '0.65rem',
    color: '#94a3b8',
  },
  formCard: {
    backgroundColor: '#f8fafc',
    border: '1px solid #cbd5e1',
    borderRadius: '10px',
    padding: '1.25rem',
    boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
    gap: '0.75rem',
  },
  formActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.5rem',
    marginTop: '1rem',
    borderTop: '1px solid #e2e8f0',
    paddingTop: '0.75rem',
  },
  tableWrapper: {
    overflowX: 'auto',
    backgroundColor: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.85rem',
    textAlign: 'left',
  },
  noDataCell: {
    textAlign: 'center',
    padding: '2.5rem 1rem',
    color: '#94a3b8',
    fontStyle: 'italic',
  },
  deleteBtn: {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#ef4444',
    cursor: 'pointer',
    padding: '0.3rem',
  }
};
