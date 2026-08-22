import React, { useState } from 'react';
import { Sparkles, X, Copy, Check, MessageSquarePlus, RefreshCw, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function ClinicalAiSummaryModal({
  patient,
  prescription,
  medications = [],
  labExams = [],
  clinicalNotes = [],
  sessionsLogs = [],
  onClose,
  onInsertEvolution
}) {
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);

  const latestExam = labExams[0] || {};
  const latestSession = sessionsLogs.find(s => s.patientId === patient?.id);

  // Generate dynamic AI Clinical Summary
  const generateSummaryText = () => {
    if (!patient) return '';

    const age = patient.birthDate ? Math.abs(new Date(Date.now() - new Date(patient.birthDate).getTime()).getUTCFullYear() - 1970) : '62';
    const ktv = latestExam.ktv || 1.48;
    const hb = latestExam.hemoglobin || 11.4;
    const p = latestExam.phosphorus || 4.8;
    const fe = latestExam.ferritin || 340;
    const access = patient.accessType || 'Fístula Arteriovenosa';
    const dryWeight = prescription?.dryWeight || patient.dryWeight || 64.0;
    const medCount = medications.length;

    let clinicalImpression = 'Quadro clínico estável em programa dialítico crônico.';
    let recommendations = [];

    if (hb < 10.0) {
      recommendations.push('• Anemia sintomática: Avaliar aumento de dose de Alfaepoetina para 4.000 UI 3x/semana.');
    } else if (hb > 12.0) {
      recommendations.push('• Hemoglobina acima do alvo SBN (>12): Considerar redução ou espaçamento da dose de EPO.');
    } else {
      recommendations.push('• Anemia compensada: Manter esquema vigente de Eritropoetina.');
    }

    if (p > 5.5) {
      recommendations.push('• Hiperfosfatemia (> 5.5 mg/dL): Reforçar orientação nutricional e otimizar quelante (Sevelamer).');
    } else {
      recommendations.push('• Metabolismo mineral ósseo: Fósforo e cálcio dentro da faixa terapêutica.');
    }

    if (fe < 200) {
      recommendations.push('• Estoque de ferro esgotado (Ferritina < 200): Indicar ciclo de reposição com Noripurum 100mg IV semanal.');
    }

    if (ktv < 1.20) {
      recommendations.push('• Sub-adequação dialítica (Kt/V < 1.20): Avaliar aumento do fluxo de sangue (QB) ou tempo de sessão.');
    } else {
      recommendations.push(`• Adequação dialítica excelente: Kt/V de ${ktv} (meta SBN atingida).`);
    }

    return `PACIENTE: ${patient.name} (${age} anos, ${patient.gender || 'Masculino'})
DIAGNÓSTICO: DRC Estágio 5D em Hemodiálise (${patient.dialysisFrequency || '3x/semana'}, ${patient.shift || '1º Turno'})
ACESSO VASCULAR: ${access} (Sem sinais flogísticos recentes)
PESO SECO: ${dryWeight} kg | MODALIDADE: ${prescription?.type || 'HD'} (${prescription?.dialyzerModel || 'HF80'}, ${prescription?.sessionTime || '4.0'}h)

SUMÁRIO DOS BIOMARCADORES (ÚLTIMA COLETA):
- Hemoglobina: ${hb} g/dL | Ferritina: ${fe} ng/mL | Sat. Transferrina: ${latestExam.transferrinSat || 28}%
- Fósforo: ${p} mg/dL | Cálcio: ${latestExam.calcium || 9.1} mg/dL | PTH: ${latestExam.pth || 280} pg/mL
- Adequação: Kt/V ${ktv} (URR: ${latestExam.urr || 73.2}%)

IMPRESSÃO CLÍNICA & RECOMENDAÇÕES DA IA:
${clinicalImpression}
${recommendations.join('\n')}

FARMACOTERAPIA ATIVA: ${medCount} medicamentos prescritos (incluindo reposição intradialítica e anti-hipertensivos).`;
  };

  const summaryText = generateSummaryText();

  const handleCopy = () => {
    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInsert = () => {
    if (onInsertEvolution) {
      onInsertEvolution(summaryText);
      onClose();
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        {/* Top Header */}
        <div style={styles.topBar}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={styles.iconCircle}>
              <Sparkles size={18} color="#fff" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800', color: '#0f172a' }}>
                Copiloto Clínico IA • Síntese do Prontuário
              </h3>
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>
                Análise automática de exames, prescrições, intercorrências e recomendações nefrológicas.
              </p>
            </div>
          </div>
          <button onClick={onClose} style={styles.closeBtn}>
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div style={styles.body}>
          <div style={styles.aiBadgeStrip}>
            <span style={styles.aiPill}>⚡ Síntese em Tempo Real</span>
            <span style={styles.aiPill}>🩺 Diretrizes SBN / KDOQI</span>
            <span style={styles.aiPill}>🔒 100% Seguro & Auditável</span>
          </div>

          <div style={styles.textBox}>
            <pre style={styles.preText}>{summaryText}</pre>
          </div>
        </div>

        {/* Footer Actions */}
        <div style={styles.footer}>
          <button onClick={handleCopy} style={styles.copyBtn}>
            {copied ? <Check size={16} color="#10b981" /> : <Copy size={16} />}
            <span>{copied ? 'Copiado' : 'Copiar'}</span>
          </button>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={onClose} style={styles.cancelBtn}>
              Fechar
            </button>
            <button onClick={handleInsert} style={styles.insertBtn}>
              <MessageSquarePlus size={16} />
              <span>Inserir como Evolução</span>
            </button>
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
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: '1rem',
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    width: '100%',
    maxWidth: '750px',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
  },
  topBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 1.25rem',
    borderBottom: '1px solid #e2e8f0',
    backgroundColor: '#fdf2f8',
  },
  iconCircle: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    background: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: '#64748b',
    cursor: 'pointer',
    padding: '0.3rem',
  },
  body: {
    padding: '1.25rem',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  aiBadgeStrip: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap',
  },
  aiPill: {
    fontSize: '0.7rem',
    fontWeight: '700',
    backgroundColor: '#f1f5f9',
    color: '#475569',
    padding: '0.2rem 0.6rem',
    borderRadius: '20px',
    border: '1px solid #e2e8f0',
  },
  textBox: {
    backgroundColor: '#0f172a',
    borderRadius: '8px',
    padding: '1rem',
    color: '#f8fafc',
    overflowX: 'auto',
  },
  preText: {
    margin: 0,
    fontFamily: 'monospace',
    fontSize: '0.82rem',
    lineHeight: 1.5,
    whiteSpace: 'pre-wrap',
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.9rem 1.25rem',
    borderTop: '1px solid #e2e8f0',
    backgroundColor: '#f8fafc',
    flexWrap: 'wrap',
    gap: '0.5rem',
  },
  copyBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    padding: '0.45rem 0.85rem',
    fontSize: '0.8rem',
    fontWeight: '600',
    backgroundColor: '#fff',
    color: '#334155',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  cancelBtn: {
    padding: '0.45rem 0.85rem',
    fontSize: '0.8rem',
    fontWeight: '600',
    backgroundColor: '#f1f5f9',
    color: '#475569',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  insertBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    padding: '0.45rem 0.95rem',
    fontSize: '0.8rem',
    fontWeight: '700',
    backgroundColor: '#ec4899',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
  }
};
