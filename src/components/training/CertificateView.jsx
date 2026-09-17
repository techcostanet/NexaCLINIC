import React, { useEffect, useState, useRef } from 'react';
import QRCode from 'qrcode';
import jsPDF from 'jspdf';
import { Award, Download, Printer, CheckCircle2, ShieldCheck, Calendar, Clock, X, ExternalLink } from 'lucide-react';

export default function CertificateView({ submission, training, onClose }) {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [downloading, setDownloading] = useState(false);
  const certRef = useRef(null);

  const verificationUrl = `${window.location.origin}?certificado=${submission.certificateId || submission.id}`;

  useEffect(() => {
    QRCode.toDataURL(verificationUrl, {
      width: 160,
      margin: 1,
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      }
    })
      .then(url => setQrCodeDataUrl(url))
      .catch(err => console.error('Erro ao gerar QR Code do certificado:', err));
  }, [verificationUrl, submission]);

  const formatDate = (isoDate) => {
    if (!isoDate) return '-';
    try {
      const d = new Date(isoDate);
      return d.toLocaleDateString('pt-BR');
    } catch {
      return isoDate;
    }
  };

  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = 297;
      const pageHeight = 210;

      // Fundo elegante
      doc.setFillColor(252, 253, 255);
      doc.rect(0, 0, pageWidth, pageHeight, 'F');

      // Borda Externa Dupla (Ouro / Azul Marinho)
      doc.setDrawColor(203, 213, 225); // Slate 300
      doc.setLineWidth(1.5);
      doc.rect(8, 8, pageWidth - 16, pageHeight - 16);

      doc.setDrawColor(79, 70, 229); // Indigo 600
      doc.setLineWidth(0.8);
      doc.rect(11, 11, pageWidth - 22, pageHeight - 22);

      // Cantoneiras decorativas
      doc.setFillColor(79, 70, 229);
      doc.circle(11, 11, 2, 'F');
      doc.circle(pageWidth - 11, 11, 2, 'F');
      doc.circle(11, pageHeight - 11, 2, 'F');
      doc.circle(pageWidth - 11, pageHeight - 11, 2, 'F');

      // Topo Institucional
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(30, 41, 59); // Slate 800
      doc.text('NEXA CLÍNICA DE NEFROLOGIA & ASSISTÊNCIA INTEGRADA', pageWidth / 2, 26, { align: 'center' });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text('PROGRAMA DE CAPACITAÇÃO CONTINUADA & CONFORMIDADE SANITÁRIA (ANVISA / NR-32)', pageWidth / 2, 32, { align: 'center' });

      // Faixa Título "CERTIFICADO DE CONCLUSÃO"
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(26);
      doc.setTextColor(79, 70, 229);
      doc.text('CERTIFICADO DE CAPACITAÇÃO', pageWidth / 2, 52, { align: 'center' });

      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.5);
      doc.line(70, 56, pageWidth - 70, 56);

      // Texto de Atestado
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(12);
      doc.setTextColor(71, 85, 105);
      doc.text('Certificamos para os devidos fins de registro e comprovação sanitária que', pageWidth / 2, 70, { align: 'center' });

      // Nome do Colaborador
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.setTextColor(15, 23, 42);
      doc.text((submission.employeeName || 'Colaborador').toUpperCase(), pageWidth / 2, 84, { align: 'center' });

      // CPF e Função
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.setTextColor(71, 85, 105);
      const roleText = submission.role ? ` — ${submission.role}` : '';
      const sectorText = submission.sector ? ` (${submission.sector})` : '';
      doc.text(`Inscrito(a) sob o CPF nº ${submission.cpf || '***.***.***-**'}${roleText}${sectorText}`, pageWidth / 2, 92, { align: 'center' });

      // Descrição do Treinamento
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11.5);
      doc.setTextColor(51, 65, 85);
      const courseDesc = `concluiu com êxito o treinamento institucional e prático de:`;
      doc.text(courseDesc, pageWidth / 2, 105, { align: 'center' });

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(30, 41, 59);
      doc.text(submission.trainingTitle || training?.title || 'Treinamento Institucional', pageWidth / 2, 116, { align: 'center' });

      // Detalhes: Carga Horária, Aproveitamento e Eficácia
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10.5);
      doc.setTextColor(71, 85, 105);
      const hours = training?.workloadHours || 2;
      const score = submission.postScore || 100;
      const gain = submission.gainEfficacy !== undefined ? submission.gainEfficacy : 0;
      const metricsText = `com carga horária de ${hours} hora(s), atingindo nota final de ${score}% no pós-teste (evolução de eficácia: +${gain}%).`;
      doc.text(metricsText, pageWidth / 2, 126, { align: 'center' });

      // Linhas de Assinatura
      const lineY = 162;
      doc.setDrawColor(148, 163, 184);
      doc.setLineWidth(0.4);

      // Assinatura 1: Instrutor / RT
      doc.line(35, lineY, 115, lineY);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(30, 41, 59);
      const instName = training?.instructorName || 'Supervisão de Enfermagem / Qualidade';
      const instRole = training?.instructorRole || 'Responsável Técnico / CCIH';
      doc.text(instName, 75, lineY + 5, { align: 'center' });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(instRole, 75, lineY + 9, { align: 'center' });

      // Assinatura 2: Colaborador
      doc.line(135, lineY, 215, lineY);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(30, 41, 59);
      doc.text(submission.employeeName || 'Assinatura do Colaborador', 175, lineY + 5, { align: 'center' });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(`Data de Emissão: ${formatDate(submission.completedAt)}`, 175, lineY + 9, { align: 'center' });

      // QR Code no canto inferior direito
      if (qrCodeDataUrl) {
        doc.addImage(qrCodeDataUrl, 'PNG', 242, 140, 28, 28);
        doc.setFontSize(6.5);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 116, 139);
        doc.text('Valide a autenticidade', 256, 171, { align: 'center' });
        doc.text(`Cód: ${submission.certificateId || submission.id}`, 256, 174, { align: 'center' });
      }

      // Rodapé Técnico
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(148, 163, 184);
      doc.text(`Registro Digital: ${submission.certificateId || submission.id} | Emitido pelo NexaCLINIC — Sistema Integrado de Gestão em Saúde`, pageWidth / 2, 198, { align: 'center' });

      const safeName = (submission.employeeName || 'Certificado').replace(/[^a-zA-Z0-9]/g, '_');
      doc.save(`Certificado_${safeName}.pdf`);
    } catch (err) {
      console.error('Erro ao gerar PDF do certificado:', err);
      alert('Houve um problema ao gerar o PDF. Tente imprimir pela tela.');
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.container}>
        {/* Barra Superior de Ações */}
        <div style={styles.actionBar} className="no-print">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Award size={20} color="#4f46e5" />
            <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '1rem' }}>
              Certificado Digital de Capacitação
            </span>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button 
              onClick={handleDownloadPDF} 
              disabled={downloading}
              style={styles.primaryBtn}
            >
              <Download size={15} />
              <span>{downloading ? 'Gerando...' : 'Baixar PDF'}</span>
            </button>
            <button 
              onClick={handlePrint} 
              style={styles.secondaryBtn}
            >
              <Printer size={15} />
              <span>Imprimir</span>
            </button>
            {onClose && (
              <button onClick={onClose} style={styles.closeBtn}>
                <X size={20} />
              </button>
            )}
          </div>
        </div>

        {/* Certificado Visual (Pronto para Visualização e Impressão) */}
        <div ref={certRef} style={styles.certCard} className="printable-certificate">
          <div style={styles.certInnerBorder}>
            {/* Cabeçalho */}
            <div style={styles.certHeader}>
              <div style={styles.sealBadge}>
                <ShieldCheck size={28} color="#4f46e5" />
              </div>
              <h2 style={styles.clinicName}>NEXA CLÍNICA DE NEFROLOGIA</h2>
              <p style={styles.clinicSub}>PROGRAMA DE EDUCAÇÃO CONTINUADA & QUALIDADE EM SAÚDE</p>
            </div>

            {/* Título */}
            <div style={styles.titleSection}>
              <h1 style={styles.certTitle}>CERTIFICADO DE CAPACITAÇÃO</h1>
              <div style={styles.titleDivider}></div>
            </div>

            {/* Corpo de Texto */}
            <div style={styles.certBody}>
              <p style={styles.certText}>
                Certificamos para os devidos fins de comprovação sanitária e curricular que
              </p>
              <h3 style={styles.empName}>
                {submission.employeeName || 'Colaborador'}
              </h3>
              <p style={styles.empSub}>
                Inscrito(a) no CPF nº <strong>{submission.cpf || '***.***.***-**'}</strong>
                {submission.role ? ` — Cargo: ${submission.role}` : ''}
                {submission.sector ? ` (Setor: ${submission.sector})` : ''}
              </p>
              <p style={styles.certText}>
                concluiu com aproveitamento satisfatório o treinamento institucional:
              </p>
              <h4 style={styles.trainingTitle}>
                {submission.trainingTitle || training?.title || 'Treinamento'}
              </h4>
              <p style={styles.metricsSummary}>
                Carga horária: <strong>{training?.workloadHours || 2} hora(s)</strong> • Aproveitamento final: <strong>{submission.postScore || 100}%</strong>
                {submission.gainEfficacy !== undefined && ` • Ganho de eficácia: +${submission.gainEfficacy}%`}
              </p>
            </div>

            {/* Rodapé e Assinaturas */}
            <div style={styles.certFooter}>
              <div style={styles.signBox}>
                <div style={styles.signLine}></div>
                <span style={styles.signName}>{training?.instructorName || 'Supervisão de Enfermagem / RT'}</span>
                <span style={styles.signRole}>{training?.instructorRole || 'Responsável Técnico / CCIH'}</span>
              </div>

              <div style={styles.signBox}>
                <div style={styles.signLine}></div>
                <span style={styles.signName}>{submission.employeeName}</span>
                <span style={styles.signRole}>Concluído em {formatDate(submission.completedAt)}</span>
              </div>

              <div style={styles.qrSection}>
                {qrCodeDataUrl ? (
                  <img src={qrCodeDataUrl} alt="QR Code" style={styles.qrImg} />
                ) : (
                  <div style={styles.qrPlaceholder}>QR Code</div>
                )}
                <span style={styles.qrLabel}>Autenticidade</span>
                <span style={styles.certCode}>{submission.certificateId || submission.id}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .printable-certificate, .printable-certificate * {
            visibility: visible;
          }
          .printable-certificate {
            position: absolute;
            left: 0;
            top: 0;
            width: 100vw;
            height: 100vh;
            border: none !important;
            box-shadow: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
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
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    zIndex: 9999,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '1rem',
    overflowY: 'auto'
  },
  container: {
    maxWidth: '960px',
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column'
  },
  actionBar: {
    padding: '0.85rem 1.25rem',
    backgroundColor: '#f8fafc',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '0.75rem'
  },
  primaryBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    backgroundColor: '#4f46e5',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '0.5rem 0.9rem',
    fontSize: '0.85rem',
    fontWeight: 600,
    cursor: 'pointer'
  },
  secondaryBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    backgroundColor: '#ffffff',
    color: '#334155',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    padding: '0.5rem 0.9rem',
    fontSize: '0.85rem',
    fontWeight: 600,
    cursor: 'pointer'
  },
  closeBtn: {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#64748b',
    cursor: 'pointer',
    padding: '0.35rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  certCard: {
    padding: '1.5rem',
    backgroundColor: '#fcfdff'
  },
  certInnerBorder: {
    border: '2px solid #4f46e5',
    outline: '4px solid #e2e8f0',
    outlineOffset: '4px',
    borderRadius: '8px',
    padding: '2.5rem 2rem',
    textAlign: 'center',
    position: 'relative',
    backgroundColor: '#ffffff'
  },
  certHeader: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: '1rem'
  },
  sealBadge: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    backgroundColor: '#eef2ff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '0.5rem'
  },
  clinicName: {
    fontSize: '1.15rem',
    fontWeight: 800,
    color: '#1e293b',
    letterSpacing: '0.05em',
    margin: 0
  },
  clinicSub: {
    fontSize: '0.72rem',
    color: '#64748b',
    letterSpacing: '0.08em',
    fontWeight: 600,
    margin: '0.2rem 0 0 0'
  },
  titleSection: {
    margin: '1.2rem 0'
  },
  certTitle: {
    fontSize: '1.8rem',
    fontWeight: 900,
    color: '#4f46e5',
    letterSpacing: '-0.02em',
    margin: 0
  },
  titleDivider: {
    width: '120px',
    height: '3px',
    backgroundColor: '#4f46e5',
    margin: '0.5rem auto 0 auto',
    borderRadius: '2px'
  },
  certBody: {
    margin: '1.5rem 0'
  },
  certText: {
    fontSize: '0.95rem',
    color: '#64748b',
    margin: '0.4rem 0'
  },
  empName: {
    fontSize: '1.7rem',
    fontWeight: 800,
    color: '#0f172a',
    margin: '0.4rem 0'
  },
  empSub: {
    fontSize: '0.88rem',
    color: '#475569',
    margin: '0 0 0.8rem 0'
  },
  trainingTitle: {
    fontSize: '1.35rem',
    fontWeight: 800,
    color: '#1e293b',
    margin: '0.4rem 0'
  },
  metricsSummary: {
    fontSize: '0.85rem',
    color: '#475569',
    margin: '0.5rem 0'
  },
  certFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: '2.5rem',
    paddingTop: '1rem',
    borderTop: '1px solid #f1f5f9',
    flexWrap: 'wrap',
    gap: '1.5rem'
  },
  signBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    flex: 1,
    minWidth: '180px'
  },
  signLine: {
    width: '100%',
    maxWidth: '220px',
    height: '1px',
    backgroundColor: '#94a3b8',
    marginBottom: '0.4rem'
  },
  signName: {
    fontSize: '0.85rem',
    fontWeight: 700,
    color: '#1e293b'
  },
  signRole: {
    fontSize: '0.72rem',
    color: '#64748b'
  },
  qrSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minWidth: '100px'
  },
  qrImg: {
    width: '76px',
    height: '76px',
    borderRadius: '4px',
    border: '1px solid #cbd5e1'
  },
  qrPlaceholder: {
    width: '76px',
    height: '76px',
    backgroundColor: '#f1f5f9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.65rem',
    color: '#94a3b8'
  },
  qrLabel: {
    fontSize: '0.65rem',
    fontWeight: 700,
    color: '#475569',
    marginTop: '0.2rem'
  },
  certCode: {
    fontSize: '0.6rem',
    color: '#94a3b8',
    fontFamily: 'monospace'
  }
};
