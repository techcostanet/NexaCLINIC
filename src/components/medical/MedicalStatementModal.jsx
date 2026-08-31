import React from 'react';
import { Printer, Download, X, DollarSign, CheckCircle2 } from 'lucide-react';
import { formatDoctorDisplayName } from '../../utils/doctorFormatters';

export default function MedicalStatementModal({
  production,
  month,
  procedures = [],
  schedules = [],
  settings = {},
  onClose
}) {
  if (!production) return null;

  const docProcedures = procedures.filter(p => p.doctorId === production.doctorId);
  const docShifts = schedules.filter(s => s.doctorId === production.doctorId && (s.checkinStatus === 'Presente' || s.status === 'Confirmado'));

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        {/* Modal Controls (Not printed) */}
        <div style={styles.modalBar} className="no-print">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <DollarSign size={18} color="#8b5cf6" />
            <h4 style={{ margin: 0, fontWeight: '800', color: '#0f172a' }}>Demonstrativo de Honorários Médicos</h4>
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

        {/* Printable Document Body */}
        <div style={styles.docBody} id="medical-statement-print">
          {/* Clinic Header */}
          <div style={styles.docHeader}>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: '900', color: '#0f172a', letterSpacing: '-0.5px' }}>
                NexaCLINIC • Nefrologia & Terapia Renal Substitutiva
              </h2>
              <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.75rem', color: '#64748b' }}>
                Demonstrativo Mensal de Produção Médica & Honorários Profissionais
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={styles.monthBadge}>Competência: {month}</span>
            </div>
          </div>

          {/* Doctor Info Box */}
          <div style={styles.infoBox}>
            <div style={styles.infoCol}>
              <span style={styles.infoLabel}>Médico</span>
              <strong style={styles.infoVal}>{formatDoctorDisplayName(production.doctorName)}</strong>
            </div>
            <div style={styles.infoCol}>
              <span style={styles.infoLabel}>Vínculo</span>
              <strong style={styles.infoVal}>{production.contractType || 'PJ'}</strong>
            </div>
            <div style={styles.infoCol}>
              <span style={styles.infoLabel}>PIX</span>
              <strong style={styles.infoVal}>{production.pixKey || '-'}</strong>
            </div>
          </div>

          {/* Breakdown Table */}
          <table style={styles.statementTable}>
            <thead>
              <tr>
                <th>Descrição</th>
                <th style={{ textAlign: 'center' }}>Qtd</th>
                <th style={{ textAlign: 'right' }}>Unitário</th>
                <th style={{ textAlign: 'right' }}>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <strong>Plantões nos Salões e DP</strong>
                  <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Escala assistencial presencial auditada pela ronda da recepção.</div>
                </td>
                <td style={{ textAlign: 'center', fontWeight: '700' }}>{production.shiftsCount}</td>
                <td style={{ textAlign: 'right' }}>R$ {(settings.shiftFees?.['Manhã'] || settings.shiftFee || 726).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                <td style={{ textAlign: 'right', fontWeight: '700' }}>R$ {production.shiftsTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
              </tr>

              <tr>
                <td>
                  <strong>Consultas Ambulatoriais em Nefrologia</strong>
                  <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Atendimentos de consultório concluídos no módulo Agenda.</div>
                </td>
                <td style={{ textAlign: 'center', fontWeight: '700' }}>{production.consultationsCount}</td>
                <td style={{ textAlign: 'right' }}>R$ {(settings.consultationFees?.['Ambulatorial'] || settings.consultationFee || 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                <td style={{ textAlign: 'right', fontWeight: '700' }}>R$ {production.consultationsTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
              </tr>

              {docProcedures.length > 0 ? (
                docProcedures.map((proc, idx) => (
                  <tr key={idx}>
                    <td>
                      <strong>{proc.procedureType}</strong>
                      <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                        Paciente: {proc.patientName} • Data: {new Date(proc.date + 'T12:00:00').toLocaleDateString('pt-BR')}
                      </div>
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: '700' }}>1</td>
                    <td style={{ textAlign: 'right' }}>R$ {(parseFloat(proc.value) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    <td style={{ textAlign: 'right', fontWeight: '700' }}>R$ {(parseFloat(proc.value) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td><strong>Procedimentos Médicos</strong></td>
                  <td style={{ textAlign: 'center', fontWeight: '700' }}>0</td>
                  <td style={{ textAlign: 'right' }}>-</td>
                  <td style={{ textAlign: 'right', fontWeight: '700' }}>R$ 0,00</td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr style={styles.totalRow}>
                <td colSpan="3" style={{ textAlign: 'right', fontWeight: '800', fontSize: '0.95rem' }}>
                  TOTAL LÍQUIDO A REPASSAR:
                </td>
                <td style={{ textAlign: 'right', fontWeight: '900', fontSize: '1.15rem', color: '#059669' }}>
                  R$ {production.netTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
              </tr>
            </tfoot>
          </table>

          {/* Status and Signatures */}
          <div style={styles.footerSignatures}>
            <div style={styles.signatureCol}>
              <div style={styles.signatureLine}></div>
              <span style={{ fontSize: '0.75rem', fontWeight: '700' }}>Coordenação Médica</span>
              <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Homologado em {new Date().toLocaleDateString('pt-BR')}</span>
            </div>

            <div style={styles.signatureCol}>
              <div style={styles.signatureLine}></div>
              <span style={{ fontSize: '0.75rem', fontWeight: '700' }}>{production.doctorName}</span>
              <span style={{ fontSize: '0.7rem', color: '#64748b' }}>CRM: {production.doctorCrm}</span>
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
    zIndex: 99999,
    padding: '1rem',
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    width: '100%',
    maxWidth: '780px',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  },
  modalBar: {
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
    gap: '0.35rem',
    padding: '0.4rem 0.85rem',
    fontSize: '0.8rem',
    fontWeight: '700',
    backgroundColor: '#8b5cf6',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  closeBtn: {
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    color: '#64748b',
    padding: '0.3rem',
  },
  docBody: {
    padding: '2rem',
    backgroundColor: '#fff',
    color: '#0f172a',
  },
  docHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '2px solid #0f172a',
    paddingBottom: '1rem',
    marginBottom: '1.25rem',
  },
  monthBadge: {
    fontSize: '0.85rem',
    fontWeight: '800',
    backgroundColor: '#f1f5f9',
    color: '#0f172a',
    padding: '0.35rem 0.75rem',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
  },
  infoBox: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
    gap: '0.75rem',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '0.75rem 1rem',
    marginBottom: '1.5rem',
  },
  infoCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.15rem',
  },
  infoLabel: {
    fontSize: '0.7rem',
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
  },
  infoVal: {
    fontSize: '0.85rem',
    color: '#0f172a',
  },
  statementTable: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.85rem',
    marginBottom: '2rem',
  },
  totalRow: {
    borderTop: '2px solid #0f172a',
    backgroundColor: '#f8fafc',
  },
  footerSignatures: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '3rem',
    marginTop: '3.5rem',
    textAlign: 'center',
  },
  signatureCol: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.2rem',
  },
  signatureLine: {
    width: '80%',
    borderTop: '1px solid #94a3b8',
    marginBottom: '0.4rem',
  }
};
