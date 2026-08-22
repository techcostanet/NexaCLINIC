import React, { useState } from 'react';
import { FileText, Calendar, CheckCircle2, AlertTriangle, Printer, Clock, ShieldCheck, UserCheck } from 'lucide-react';

export default function ClinicalApacTab({
  patient,
  prescription,
  latestExam,
  apacRecord,
  onSaveApacRecord,
  loading = false
}) {
  const [showEdit, setShowEdit] = useState(false);
  const [formData, setFormData] = useState({
    apacNumber: apacRecord?.apacNumber || '31260049281-9',
    procedureCode: apacRecord?.procedureCode || '03.05.01.010-7',
    procedureName: apacRecord?.procedureName || 'Hemodiálise (máximo 3 sessões por semana)',
    cid: apacRecord?.cid || 'N18.0 - Doença Renal Crônica Estágio 5',
    status: apacRecord?.status || 'Ativo',
    startDate: apacRecord?.startDate || '2026-06-01',
    expiryDate: apacRecord?.expiryDate || '2026-08-31',
    prescribingDoctor: apacRecord?.prescribingDoctor || 'Dr. Lucas (CRM/MG 45892)',
    cnsDoctor: apacRecord?.cnsDoctor || '704209123849102',
    clinicCnes: apacRecord?.clinicCnes || '2158941',
    laudoDate: apacRecord?.laudoDate || '2026-05-25',
    renalEtiology: apacRecord?.renalEtiology || 'Nefropatia Diabética e Hipertensiva',
    vascularAccess: apacRecord?.vascularAccess || patient?.accessType || 'Fístula Arteriovenosa Rádio-Cefálica E',
    hepatitisBStatus: apacRecord?.hepatitisBStatus || 'Imunizado (Anti-HBs > 100 UI)',
    hivStatus: apacRecord?.hivStatus || 'Não Reagente',
    hcvStatus: apacRecord?.hcvStatus || 'Não Reagente'
  });

  const getDaysToExpiry = (expiryDate) => {
    if (!expiryDate) return null;
    const diff = new Date(expiryDate).getTime() - Date.now();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const daysToExpiry = getDaysToExpiry(formData.expiryDate);
  const isExpiringSoon = daysToExpiry !== null && daysToExpiry <= 30 && daysToExpiry >= 0;
  const isExpired = daysToExpiry !== null && daysToExpiry < 0;

  const handleSave = (e) => {
    e.preventDefault();
    onSaveApacRecord({
      patientId: patient.id,
      ...formData
    });
    setShowEdit(false);
  };

  const handlePrintLaudo = () => {
    window.print();
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h3 style={styles.title}>Central de Laudos & Regulação APAC (SUS)</h3>
          <p style={styles.subtitle}>Acompanhamento de validade de autorizações e emissão de laudo LME para faturamento.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            type="button" 
            onClick={handlePrintLaudo} 
            style={styles.printBtn}
          >
            <Printer size={15} />
            <span>Imprimir</span>
          </button>
          <button 
            type="button" 
            onClick={() => setShowEdit(!showEdit)} 
            style={styles.editBtn}
          >
            <span>{showEdit ? 'Fechar' : 'Editar'}</span>
          </button>
        </div>
      </div>

      {/* Expiry Banner */}
      {isExpired ? (
        <div style={{ ...styles.alertBanner, backgroundColor: '#fee2e2', borderColor: '#fca5a5', color: '#991b1b' }}>
          <AlertTriangle size={20} color="#dc2626" />
          <div>
            <strong>APAC Vencida!</strong> A autorização de diálise deste paciente expirou. Risco imediato de glosa no BPA/SUS.
          </div>
        </div>
      ) : isExpiringSoon ? (
        <div style={{ ...styles.alertBanner, backgroundColor: '#fef9c3', borderColor: '#fde047', color: '#854d0e' }}>
          <Clock size={20} color="#d97706" />
          <div>
            <strong>Renovação Necessária:</strong> A APAC vence em <strong>{daysToExpiry} dias</strong> ({new Date(formData.expiryDate).toLocaleDateString('pt-BR')}). Emita o laudo abaixo para assinatura médica.
          </div>
        </div>
      ) : (
        <div style={{ ...styles.alertBanner, backgroundColor: '#ecfdf5', borderColor: '#a7f3d0', color: '#065f46' }}>
          <CheckCircle2 size={20} color="#059669" />
          <div>
            <strong>APAC Regular:</strong> Válida até {new Date(formData.expiryDate).toLocaleDateString('pt-BR')} ({daysToExpiry} dias restantes).
          </div>
        </div>
      )}

      {/* Edit Form */}
      {showEdit && (
        <form onSubmit={handleSave} style={styles.formCard}>
          <h4 style={{ margin: '0 0 1rem 0', color: '#0f172a', fontWeight: '800' }}>
            Atualizar Dados da APAC
          </h4>
          <div style={styles.formGrid}>
            <div className="form-group">
              <label>Número APAC *</label>
              <input 
                type="text" className="form-control" 
                value={formData.apacNumber} 
                onChange={e => setFormData({ ...formData, apacNumber: e.target.value })} 
                required 
              />
            </div>
            <div className="form-group">
              <label>Código Procedimento</label>
              <input 
                type="text" className="form-control" 
                value={formData.procedureCode} 
                onChange={e => setFormData({ ...formData, procedureCode: e.target.value })} 
              />
            </div>
            <div className="form-group">
              <label>Procedimento</label>
              <input 
                type="text" className="form-control" 
                value={formData.procedureName} 
                onChange={e => setFormData({ ...formData, procedureName: e.target.value })} 
              />
            </div>
            <div className="form-group">
              <label>CID Principal *</label>
              <input 
                type="text" className="form-control" 
                value={formData.cid} 
                onChange={e => setFormData({ ...formData, cid: e.target.value })} 
                required 
              />
            </div>
            <div className="form-group">
              <label>Validade Início</label>
              <input 
                type="date" className="form-control" 
                value={formData.startDate} 
                onChange={e => setFormData({ ...formData, startDate: e.target.value })} 
              />
            </div>
            <div className="form-group">
              <label>Validade Fim *</label>
              <input 
                type="date" className="form-control" 
                value={formData.expiryDate} 
                onChange={e => setFormData({ ...formData, expiryDate: e.target.value })} 
                required 
              />
            </div>
            <div className="form-group">
              <label>Médico Solicitante</label>
              <input 
                type="text" className="form-control" 
                value={formData.prescribingDoctor} 
                onChange={e => setFormData({ ...formData, prescribingDoctor: e.target.value })} 
              />
            </div>
            <div className="form-group">
              <label>Etiologia Renal</label>
              <input 
                type="text" className="form-control" 
                value={formData.renalEtiology} 
                onChange={e => setFormData({ ...formData, renalEtiology: e.target.value })} 
              />
            </div>
          </div>
          <div style={styles.formActions}>
            <button type="button" onClick={() => setShowEdit(false)} className="btn btn-secondary">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="btn btn-primary" style={{ backgroundColor: '#ef4444' }}>
              {loading ? 'Salvando...' : 'Salvar APAC'}
            </button>
          </div>
        </form>
      )}

      {/* Official LME / APAC Report View */}
      <div style={styles.laudoDoc} className="printable-laudo">
        <div style={styles.docHeader}>
          <div style={{ textAlign: 'center', width: '100%' }}>
            <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Ministério da Saúde • Sistema Único de Saúde (SUS)
            </h4>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800', color: '#1e293b' }}>
              Laudo para Solicitação de Procedimentos de Alta Complexidade (APAC / Nefrologia)
            </h3>
            <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.75rem', color: '#64748b' }}>
              CNES da Unidade: {formData.clinicCnes} | Data de Emissão: {new Date().toLocaleDateString('pt-BR')}
            </p>
          </div>
        </div>

        {/* Section 1: Identificação */}
        <div style={styles.docSection}>
          <div style={styles.sectionTitle}>1. Identificação do Paciente</div>
          <div style={styles.grid4}>
            <div>
              <span style={styles.fieldLabel}>Nome do Paciente:</span>
              <div style={styles.fieldVal}>{patient.name}</div>
            </div>
            <div>
              <span style={styles.fieldLabel}>CPF:</span>
              <div style={styles.fieldVal}>{patient.cpf}</div>
            </div>
            <div>
              <span style={styles.fieldLabel}>Data de Nascimento:</span>
              <div style={styles.fieldVal}>{patient.birthDate ? new Date(patient.birthDate).toLocaleDateString('pt-BR') : '-'}</div>
            </div>
            <div>
              <span style={styles.fieldLabel}>Sexo:</span>
              <div style={styles.fieldVal}>{patient.gender}</div>
            </div>
          </div>
        </div>

        {/* Section 2: Diagnóstico e Justificativa */}
        <div style={styles.docSection}>
          <div style={styles.sectionTitle}>2. Dados Clínicos e Procedimento Solicitado</div>
          <div style={styles.grid3}>
            <div>
              <span style={styles.fieldLabel}>Procedimento SUS:</span>
              <div style={styles.fieldVal}><strong>{formData.procedureCode}</strong> - {formData.procedureName}</div>
            </div>
            <div>
              <span style={styles.fieldLabel}>CID-10 Principal:</span>
              <div style={styles.fieldVal}><strong>{formData.cid}</strong></div>
            </div>
            <div>
              <span style={styles.fieldLabel}>Etiologia da DRC:</span>
              <div style={styles.fieldVal}>{formData.renalEtiology}</div>
            </div>
          </div>
        </div>

        {/* Section 3: Parâmetros e Exames */}
        <div style={styles.docSection}>
          <div style={styles.sectionTitle}>3. Condições Atuais do Tratamento Dialítico</div>
          <div style={styles.grid4}>
            <div>
              <span style={styles.fieldLabel}>Acesso Vascular:</span>
              <div style={styles.fieldVal}>{formData.vascularAccess}</div>
            </div>
            <div>
              <span style={styles.fieldLabel}>Peso Seco Alvo:</span>
              <div style={styles.fieldVal}>{prescription?.dryWeight || patient?.dryWeight || '--'} kg</div>
            </div>
            <div>
              <span style={styles.fieldLabel}>Dialisador (Capilar):</span>
              <div style={styles.fieldVal}>{prescription?.dialyzerModel || 'HF80 (Alto Fluxo)'}</div>
            </div>
            <div>
              <span style={styles.fieldLabel}>Duração / Fluxo:</span>
              <div style={styles.fieldVal}>{prescription?.sessionTime || '4.0'}h • QB: {prescription?.bloodFlow || '300'} mL/min</div>
            </div>
          </div>
          <div style={{ ...styles.grid4, marginTop: '0.5rem' }}>
            <div>
              <span style={styles.fieldLabel}>Última Hemoglobina:</span>
              <div style={styles.fieldVal}>{latestExam?.hemoglobin ? `${latestExam.hemoglobin} g/dL` : '11.4 g/dL'}</div>
            </div>
            <div>
              <span style={styles.fieldLabel}>Último Kt/V:</span>
              <div style={styles.fieldVal}>{latestExam?.ktv ? latestExam.ktv : '1.42'} (URR {latestExam?.urr || '72'}%)</div>
            </div>
            <div>
              <span style={styles.fieldLabel}>Hepatite B (Anti-HBs):</span>
              <div style={styles.fieldVal}>{formData.hepatitisBStatus}</div>
            </div>
            <div>
              <span style={styles.fieldLabel}>Sorologias (HIV/HCV):</span>
              <div style={styles.fieldVal}>Não Reagente</div>
            </div>
          </div>
        </div>

        {/* Section 4: Assinatura e Carimbo Médico */}
        <div style={styles.docFooter}>
          <div style={styles.sigBox}>
            <div style={styles.sigLine}></div>
            <div style={{ fontWeight: '700', fontSize: '0.85rem' }}>{formData.prescribingDoctor}</div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Assinatura e Carimbo do Médico Solicitante</div>
          </div>
          <div style={styles.sigBox}>
            <div style={styles.sigLine}></div>
            <div style={{ fontWeight: '700', fontSize: '0.85rem' }}>{patient.name}</div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Assinatura do Paciente ou Responsável Legal</div>
          </div>
        </div>
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
  printBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    padding: '0.5rem 0.9rem',
    fontSize: '0.8rem',
    fontWeight: '700',
    backgroundColor: '#fff',
    color: '#334155',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  editBtn: {
    padding: '0.5rem 0.9rem',
    fontSize: '0.8rem',
    fontWeight: '700',
    backgroundColor: '#ef4444',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  alertBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.9rem 1.25rem',
    borderRadius: '8px',
    border: '1px solid transparent',
    fontSize: '0.85rem',
  },
  formCard: {
    backgroundColor: '#f8fafc',
    border: '1px solid #cbd5e1',
    borderRadius: '10px',
    padding: '1.25rem',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
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
  laudoDoc: {
    backgroundColor: '#fff',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    padding: '1.75rem',
    boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  docHeader: {
    borderBottom: '2px solid #0f172a',
    paddingBottom: '0.75rem',
  },
  docSection: {
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    padding: '0.9rem 1rem',
  },
  sectionTitle: {
    fontSize: '0.8rem',
    fontWeight: '800',
    color: '#475569',
    textTransform: 'uppercase',
    marginBottom: '0.6rem',
    borderBottom: '1px solid #f1f5f9',
    paddingBottom: '0.25rem',
  },
  grid3: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '0.75rem',
  },
  grid4: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
    gap: '0.75rem',
  },
  fieldLabel: {
    fontSize: '0.7rem',
    color: '#64748b',
    display: 'block',
    marginBottom: '0.15rem',
  },
  fieldVal: {
    fontSize: '0.85rem',
    color: '#0f172a',
  },
  docFooter: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '2rem',
    marginTop: '1.5rem',
    paddingTop: '1rem',
  },
  sigBox: {
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.25rem',
  },
  sigLine: {
    width: '80%',
    height: '1px',
    backgroundColor: '#94a3b8',
    marginBottom: '0.5rem',
  }
};
