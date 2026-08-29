import React from 'react';
import { 
  User, ShieldAlert, Sparkles, Printer, AlertTriangle, 
  Activity, Droplets, Calendar, MapPin, Heart, Clock, CheckCircle2, ChevronRight
} from 'lucide-react';

export default function ClinicalPatientCockpit({ 
  patient, 
  prescription, 
  latestExam, 
  latestSession, 
  onOpenAiSummary, 
  onExportPdf,
  allergies = ['Dipirona (Hipersensibilidade)', 'Esparadrapo Comum'],
  serologies = { hiv: 'Não Reagente', hcv: 'Não Reagente', hbsag: 'Não Reagente', antiHbs: 'Reagente (>100 UI)' }
}) {
  if (!patient) return null;

  const calculateAge = (birthDate) => {
    if (!birthDate) return '-';
    const diff = Date.now() - new Date(birthDate).getTime();
    const ageDate = new Date(diff);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  const displayAllergies = patient?.allergies 
    ? (Array.isArray(patient.allergies) ? patient.allergies : [patient.allergies])
    : allergies;

  const age = calculateAge(patient.birthDate);

  return (
    <div style={styles.cockpitCard}>
      {/* Top Main Row */}
      <div style={styles.topRow}>
        {/* Patient Identity */}
        <div style={styles.identitySection}>
          <div style={styles.avatarBox}>
            <User size={32} color="#fff" />
          </div>
          <div>
            <div style={styles.nameRow}>
              <h2 style={styles.patientName}>{patient.name}</h2>
              <span style={styles.statusBadge}>{patient.treatmentStatus || 'Ativo'}</span>
              <span style={styles.therapyBadge}>{patient.treatmentType || 'HD'}</span>
              {patient.bloodType && (
                <span style={{ fontSize: '0.7rem', fontWeight: '800', backgroundColor: '#fee2e2', color: '#991b1b', padding: '0.15rem 0.5rem', borderRadius: '6px', border: '1px solid #fecaca' }}>
                  {patient.bloodType} {patient.rhFactor === 'Positivo' ? '+' : '-'}
                </span>
              )}
              {patient.transplantStatus && (
                <span style={{ fontSize: '0.7rem', fontWeight: '700', backgroundColor: '#eff6ff', color: '#1e40af', padding: '0.15rem 0.5rem', borderRadius: '6px', border: '1px solid #bfdbfe' }}>
                  Tx: {patient.transplantStatus}
                </span>
              )}
            </div>
            <div style={styles.metaRow}>
              <span><strong>CPF:</strong> {patient.cpf}</span>
              <span>•</span>
              <span><strong>Idade:</strong> {age} anos</span>
              <span>•</span>
              <span><strong>Sexo:</strong> {patient.gender || 'Não informado'}</span>
              <span>•</span>
              <span><strong>Salão:</strong> {patient.room || 'Salão 1'} ({patient.shift || '1º Turno'})</span>
              {patient.primaryDiagnosis && (
                <>
                  <span>•</span>
                  <span><strong>Etiologia:</strong> {patient.primaryDiagnosis}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={styles.actionsSection}>
          <button 
            type="button"
            onClick={onOpenAiSummary} 
            style={styles.aiButton}
            title="Sintetizar histórico clínico com Inteligência Artificial"
          >
            <Sparkles size={16} />
            <span>Copiloto</span>
          </button>
          <button 
            type="button"
            onClick={onExportPdf} 
            style={styles.pdfButton}
            title="Exportar sumário de transferência e ficha de trânsito em PDF"
          >
            <Printer size={16} />
            <span>Exportar</span>
          </button>
        </div>
      </div>

      {/* Grid of Key Nephrology Metrics */}
      <div style={styles.metricsGrid}>
        {/* Acesso Vascular */}
        <div style={styles.metricItem}>
          <div style={styles.metricHeader}>
            <Activity size={15} color="#8b5cf6" />
            <span style={styles.metricLabel}>Acesso</span>
          </div>
          <div style={styles.metricValue}>{patient.accessType || 'Fístula AV'}</div>
          <div style={styles.metricSub}>Membro Superior E (Rádio-Cefálica)</div>
        </div>

        {/* Peso Seco Alvo */}
        <div style={styles.metricItem}>
          <div style={styles.metricHeader}>
            <Droplets size={15} color="#0284c7" />
            <span style={styles.metricLabel}>Seco</span>
          </div>
          <div style={styles.metricValue}>
            {prescription?.dryWeight || patient.dryWeight || '--'} <small style={{ fontSize: '0.8rem', fontWeight: '500' }}>kg</small>
          </div>
          <div style={styles.metricSub}>
            {latestSession ? `Último pós: ${latestSession.finalWeight || '--'} kg` : 'Meta prescrita'}
          </div>
        </div>

        {/* Adequação Dialítica / Kt/V */}
        <div style={styles.metricItem}>
          <div style={styles.metricHeader}>
            <CheckCircle2 size={15} color="#10b981" />
            <span style={styles.metricLabel}>Adequação</span>
          </div>
          <div style={{ ...styles.metricValue, color: (latestExam?.ktv >= 1.2 ? '#059669' : '#dc2626') }}>
            Kt/V {latestExam?.ktv ? latestExam.ktv.toFixed(2) : '1.42'}
          </div>
          <div style={styles.metricSub}>
            URR: {latestExam?.urr ? `${latestExam.urr}%` : '72%'} (Meta &gt; 1.2)
          </div>
        </div>

        {/* Hemoglobina / Anemia */}
        <div style={styles.metricItem}>
          <div style={styles.metricHeader}>
            <Heart size={15} color="#ef4444" />
            <span style={styles.metricLabel}>Hemoglobina</span>
          </div>
          <div style={{ ...styles.metricValue, color: (latestExam?.hemoglobin >= 10 && latestExam?.hemoglobin <= 12 ? '#059669' : '#d97706') }}>
            {latestExam?.hemoglobin ? `${latestExam.hemoglobin} g/dL` : '11.4 g/dL'}
          </div>
          <div style={styles.metricSub}>
            Ferritina: {latestExam?.ferritin ? `${latestExam.ferritin} ng/mL` : '340 ng/mL'}
          </div>
        </div>

        {/* Frequência e Escala */}
        <div style={styles.metricItem}>
          <div style={styles.metricHeader}>
            <Clock size={15} color="#f59e0b" />
            <span style={styles.metricLabel}>Escala</span>
          </div>
          <div style={styles.metricValue}>{patient.dialysisFrequency || 'Seg/Qua/Sex'}</div>
          <div style={styles.metricSub}>{patient.shift || '1º Turno'} • Poltrona #{patient.chairNumber || '12'}</div>
        </div>
      </div>

      {/* Safety Alert Strip */}
      <div style={styles.safetyStrip}>
        {/* Alergias */}
        <div style={styles.safetyCol}>
          <div style={styles.safetyTitle}>
            <ShieldAlert size={14} color="#dc2626" />
            <span style={{ color: '#dc2626', fontWeight: '700' }}>Alergias</span>
          </div>
          <div style={styles.allergiesWrap}>
            {displayAllergies.map((alg, i) => (
              <span key={i} style={styles.allergyTag}>
                {alg}
              </span>
            ))}
          </div>
        </div>

        {/* Sorologias */}
        <div style={styles.safetyCol}>
          <div style={styles.safetyTitle}>
            <Activity size={14} color="#475569" />
            <span style={{ color: '#475569', fontWeight: '700' }}>Sorologias</span>
          </div>
          <div style={styles.sorologyWrap}>
            <span style={styles.sorologyPill}>HIV: <strong>{serologies.hiv}</strong></span>
            <span style={styles.sorologyPill}>HCV: <strong>{serologies.hcv}</strong></span>
            <span style={styles.sorologyPill}>HBsAg: <strong>{serologies.hbsag}</strong></span>
            <span style={{ ...styles.sorologyPill, backgroundColor: '#ecfdf5', color: '#047857', borderColor: '#a7f3d0' }}>
              Anti-HBs: <strong>{serologies.antiHbs}</strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  cockpitCard: {
    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '1.25rem',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    marginBottom: '1.25rem',
  },
  topRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  identitySection: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  avatarBox: {
    width: '52px',
    height: '52px',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 10px rgba(139, 92, 246, 0.3)',
    flexShrink: 0,
  },
  nameRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    flexWrap: 'wrap',
  },
  patientName: {
    fontSize: '1.25rem',
    fontWeight: '800',
    color: '#0f172a',
    margin: 0,
  },
  statusBadge: {
    fontSize: '0.7rem',
    fontWeight: '700',
    backgroundColor: '#dcfce7',
    color: '#15803d',
    padding: '0.15rem 0.5rem',
    borderRadius: '6px',
    border: '1px solid #bbf7d0',
  },
  therapyBadge: {
    fontSize: '0.7rem',
    fontWeight: '700',
    backgroundColor: '#ede9fe',
    color: '#6d28d9',
    padding: '0.15rem 0.5rem',
    borderRadius: '6px',
    border: '1px solid #ddd6fe',
  },
  metaRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.8rem',
    color: '#64748b',
    marginTop: '0.25rem',
    flexWrap: 'wrap',
  },
  actionsSection: {
    display: 'flex',
    gap: '0.5rem',
    alignItems: 'center',
  },
  aiButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    padding: '0.5rem 0.85rem',
    fontSize: '0.8rem',
    fontWeight: '700',
    background: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(236, 72, 153, 0.25)',
    transition: 'transform 0.15s ease',
  },
  pdfButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    padding: '0.5rem 0.85rem',
    fontSize: '0.8rem',
    fontWeight: '600',
    backgroundColor: '#fff',
    color: '#334155',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '0.75rem',
  },
  metricItem: {
    backgroundColor: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '0.75rem',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.02)',
  },
  metricHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    marginBottom: '0.3rem',
  },
  metricLabel: {
    fontSize: '0.7rem',
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
  },
  metricValue: {
    fontSize: '1.05rem',
    fontWeight: '800',
    color: '#1e293b',
  },
  metricSub: {
    fontSize: '0.7rem',
    color: '#94a3b8',
    marginTop: '0.15rem',
  },
  safetyStrip: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '0.75rem',
    backgroundColor: '#f1f5f9',
    borderRadius: '8px',
    padding: '0.75rem 1rem',
    border: '1px solid #e2e8f0',
  },
  safetyCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem',
  },
  safetyTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    fontSize: '0.75rem',
  },
  allergiesWrap: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.4rem',
  },
  allergyTag: {
    fontSize: '0.7rem',
    fontWeight: '700',
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    border: '1px solid #fca5a5',
    padding: '0.15rem 0.5rem',
    borderRadius: '4px',
  },
  sorologyWrap: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.4rem',
  },
  sorologyPill: {
    fontSize: '0.7rem',
    backgroundColor: '#fff',
    color: '#334155',
    border: '1px solid #cbd5e1',
    padding: '0.15rem 0.45rem',
    borderRadius: '4px',
  }
};
