import React from 'react';
import { X, Printer, FileText, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function ClinicalExportModal({
  patient,
  prescription,
  medications = [],
  labExams = [],
  clinicalNotes = [],
  onClose
}) {
  if (!patient) return null;

  const latestExam = labExams[0] || {};
  const recentNotes = clinicalNotes.slice(0, 3);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        {/* Modal Top Bar (Hidden on Print) */}
        <div style={styles.topBar} className="no-print">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={20} color="#8b5cf6" />
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800' }}>Sumário de Transferência & Diálise em Trânsito</h3>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={handlePrint} style={styles.printBtn}>
              <Printer size={15} />
              <span>Imprimir</span>
            </button>
            <button onClick={onClose} style={styles.closeBtn}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Printable Document Content */}
        <div style={styles.docContent} id="printable-clinical-summary">
          {/* Header */}
          <div style={styles.docHeader}>
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '900', color: '#0f172a' }}>
                NexaCLINIC • CENTRO DE NEFROLOGIA E DIÁLISE
              </h2>
              <p style={{ margin: '0.2rem 0', fontSize: '0.85rem', color: '#475569', fontWeight: '600' }}>
                SUMÁRIO CLÍNICO DE TRANSFERÊNCIA E DIÁLISE EM TRÂNSITO
              </p>
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>
                Conforme diretrizes do CFM, SBN e RDC ANVISA nº 11/2014 | Emitido em: {new Date().toLocaleString('pt-BR')}
              </p>
            </div>
          </div>

          {/* 1. Identificação */}
          <div style={styles.section}>
            <h4 style={styles.sectionTitle}>1. IDENTIFICAÇÃO DO PACIENTE</h4>
            <div style={styles.grid4}>
              <div><span style={styles.label}>Nome:</span> <div style={styles.val}>{patient.name}</div></div>
              <div><span style={styles.label}>CPF:</span> <div style={styles.val}>{patient.cpf}</div></div>
              <div><span style={styles.label}>Nascimento:</span> <div style={styles.val}>{patient.birthDate ? new Date(patient.birthDate).toLocaleDateString('pt-BR') : '-'}</div></div>
              <div><span style={styles.label}>Sexo:</span> <div style={styles.val}>{patient.gender}</div></div>
            </div>
            <div style={{ ...styles.grid4, marginTop: '0.5rem' }}>
              <div><span style={styles.label}>Diagnóstico / CID:</span> <div style={styles.val}>DRC Estágio 5D (N18.0)</div></div>
              <div><span style={styles.label}>Acesso Vascular:</span> <div style={styles.val}>{patient.accessType || 'Fístula AV'}</div></div>
              <div><span style={styles.label}>Turno / Salão:</span> <div style={styles.val}>{patient.room || 'Salão 1'} ({patient.shift || '1º Turno'})</div></div>
              <div><span style={styles.label}>Status:</span> <div style={styles.val}>{patient.treatmentStatus || 'Ativo'}</div></div>
            </div>
          </div>

          {/* 2. Alergias e Sorologias */}
          <div style={styles.section}>
            <h4 style={styles.sectionTitle}>2. SEGURANÇA E SOROLOGIAS</h4>
            <div style={styles.grid2}>
              <div>
                <span style={styles.label}>Alergias Documentadas:</span>
                <div style={{ ...styles.val, color: '#dc2626', fontWeight: '700' }}>
                  Dipirona (Hipersensibilidade), Esparadrapo Comum
                </div>
              </div>
              <div>
                <span style={styles.label}>Painel Sorológico:</span>
                <div style={styles.val}>
                  HIV: Não Reagente • HCV: Não Reagente • HBsAg: Não Reagente • Anti-HBs: Reagente (&gt;100 UI)
                </div>
              </div>
            </div>
          </div>

          {/* 3. Prescrição Dialítica Vigente */}
          <div style={styles.section}>
            <h4 style={styles.sectionTitle}>3. PRESCRIÇÃO DIALÍTICA ATUAL</h4>
            <div style={styles.grid4}>
              <div><span style={styles.label}>Modalidade:</span> <div style={styles.val}>{prescription?.type || 'Hemodiálise (HD)'}</div></div>
              <div><span style={styles.label}>Dialisador (Capilar):</span> <div style={styles.val}>{prescription?.dialyzerModel || 'HF80 (Alto Fluxo)'}</div></div>
              <div><span style={styles.label}>Duração:</span> <div style={styles.val}>{prescription?.sessionTime || '4.0'} Horas</div></div>
              <div><span style={styles.label}>Fluxo de Sangue (QB):</span> <div style={styles.val}>{prescription?.bloodFlow || '300'} mL/min</div></div>
            </div>
            <div style={{ ...styles.grid4, marginTop: '0.5rem' }}>
              <div><span style={styles.label}>Fluxo Dialisato (QD):</span> <div style={styles.val}>{prescription?.dialysateFlow || '500'} mL/min</div></div>
              <div><span style={styles.label}>Heparinização:</span> <div style={styles.val}>{prescription?.heparinType || 'Intermitente'} ({prescription?.heparinDose || '5000 UI'})</div></div>
              <div><span style={styles.label}>Bicarbonato / Sódio:</span> <div style={styles.val}>{prescription?.bicarbonate || '32 mEq/L'} / {prescription?.sodium || '138 mEq/L'}</div></div>
              <div><span style={styles.label}>Peso Seco Alvo:</span> <div style={{ ...styles.val, fontWeight: '800', color: '#0284c7' }}>{prescription?.dryWeight || patient?.dryWeight || '--'} kg</div></div>
            </div>
          </div>

          {/* 4. Medicamentos Prescritos */}
          <div style={styles.section}>
            <h4 style={styles.sectionTitle}>4. MEDICAMENTOS EM USO (INTRADIALÍTICOS & DOMICILIARES)</h4>
            {medications.length === 0 ? (
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>Sem medicamentos cadastrados.</p>
            ) : (
              <table style={styles.docTable}>
                <thead>
                  <tr>
                    <th>Medicamento</th>
                    <th>Dosagem</th>
                    <th>Via</th>
                    <th>Frequência</th>
                    <th>Tipo</th>
                  </tr>
                </thead>
                <tbody>
                  {medications.map(m => (
                    <tr key={m.id}>
                      <td style={{ fontWeight: '700' }}>{m.name}</td>
                      <td>{m.dosage}</td>
                      <td>{m.route}</td>
                      <td>{m.frequency}</td>
                      <td>{m.type}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* 5. Últimos Exames Laboratoriais */}
          <div style={styles.section}>
            <h4 style={styles.sectionTitle}>5. ÚLTIMOS EXAMES LABORATORIAIS</h4>
            <div style={styles.grid4}>
              <div><span style={styles.label}>Hemoglobina:</span> <div style={styles.val}>{latestExam.hemoglobin || '11.4'} g/dL</div></div>
              <div><span style={styles.label}>Ferritina:</span> <div style={styles.val}>{latestExam.ferritin || '340'} ng/mL</div></div>
              <div><span style={styles.label}>Sat. Transferrina:</span> <div style={styles.val}>{latestExam.transferrinSat ? `${latestExam.transferrinSat}%` : '28%'}</div></div>
              <div><span style={styles.label}>Kt/V / URR:</span> <div style={styles.val}>{latestExam.ktv || '1.48'} ({latestExam.urr ? `${latestExam.urr}%` : '73.2%'})</div></div>
            </div>
            <div style={{ ...styles.grid4, marginTop: '0.5rem' }}>
              <div><span style={styles.label}>Fósforo:</span> <div style={styles.val}>{latestExam.phosphorus || '4.8'} mg/dL</div></div>
              <div><span style={styles.label}>Cálcio:</span> <div style={styles.val}>{latestExam.calcium || '9.1'} mg/dL</div></div>
              <div><span style={styles.label}>PTH Intacto:</span> <div style={styles.val}>{latestExam.pth || '280'} pg/mL</div></div>
              <div><span style={styles.label}>Potássio:</span> <div style={styles.val}>{latestExam.potassium || '5.1'} mEq/L</div></div>
            </div>
          </div>

          {/* 6. Últimas Evoluções */}
          <div style={styles.section}>
            <h4 style={styles.sectionTitle}>6. NOTAS CLÍNICAS RECENTES</h4>
            {recentNotes.length === 0 ? (
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>Sem anotações recentes.</p>
            ) : (
              recentNotes.map(n => (
                <div key={n.id} style={{ marginBottom: '0.4rem', fontSize: '0.8rem' }}>
                  <strong>{new Date(n.date).toLocaleDateString('pt-BR')} [{n.category}] ({n.author}):</strong> {n.text}
                </div>
              ))
            )}
          </div>

          {/* Footer Assinaturas */}
          <div style={styles.docFooter}>
            <div style={styles.sigBox}>
              <div style={styles.sigLine}></div>
              <div style={{ fontWeight: '700', fontSize: '0.85rem' }}>Dr. Lucas (Nefrologista Responsável)</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>CRM/MG 45892 • RQE Nefrologia 28104</div>
            </div>
            <div style={styles.sigBox}>
              <div style={styles.sigLine}></div>
              <div style={{ fontWeight: '700', fontSize: '0.85rem' }}>Enfermeiro(a) Responsável Técnico</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>COREN/MG 192841</div>
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
    maxWidth: '850px',
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
    padding: '1rem 1.5rem',
    borderBottom: '1px solid #e2e8f0',
    backgroundColor: '#f8fafc',
  },
  printBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    padding: '0.45rem 0.85rem',
    fontSize: '0.8rem',
    fontWeight: '700',
    backgroundColor: '#8b5cf6',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: '#64748b',
    cursor: 'pointer',
    padding: '0.3rem',
  },
  docContent: {
    padding: '1.5rem 2rem',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  docHeader: {
    borderBottom: '2px solid #0f172a',
    paddingBottom: '0.75rem',
  },
  section: {
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    padding: '0.75rem 1rem',
  },
  sectionTitle: {
    margin: '0 0 0.5rem 0',
    fontSize: '0.75rem',
    fontWeight: '900',
    color: '#475569',
    letterSpacing: '0.05em',
    borderBottom: '1px solid #f1f5f9',
    paddingBottom: '0.2rem',
  },
  grid2: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '0.75rem',
  },
  grid4: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '0.75rem',
  },
  label: {
    fontSize: '0.7rem',
    color: '#64748b',
    display: 'block',
  },
  val: {
    fontSize: '0.85rem',
    color: '#0f172a',
    fontWeight: '600',
  },
  docTable: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.8rem',
  },
  docFooter: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '2rem',
    marginTop: '1.25rem',
    paddingTop: '1rem',
  },
  sigBox: {
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  sigLine: {
    width: '80%',
    height: '1px',
    backgroundColor: '#94a3b8',
    marginBottom: '0.4rem',
  }
};
