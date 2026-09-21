import React, { useEffect, useState } from 'react';
import { getTrainingSubmissionByCertificateId, getTrainingById } from '../../services/firebase/hrService';
import { CheckCircle2, ShieldAlert, Award, Calendar, Clock, User, FileText, ArrowLeft, ExternalLink } from 'lucide-react';
import CertificateView from './CertificateView';

export default function CertificateVerifyPortal({ certificateId, onExitPortal }) {
  const [loading, setLoading] = useState(true);
  const [submission, setSubmission] = useState(null);
  const [training, setTraining] = useState(null);
  const [showFullCert, setShowFullCert] = useState(false);

  useEffect(() => {
    async function verify() {
      setLoading(true);
      try {
        const sub = await getTrainingSubmissionByCertificateId(certificateId);
        if (sub) {
          setSubmission(sub);
          const trn = await getTrainingById(sub.trainingId);
          setTraining(trn);
        }
      } catch (err) {
        console.error('Erro na verificação de autenticidade:', err);
      } finally {
        setLoading(false);
      }
    }
    if (certificateId) {
      verify();
    } else {
      setLoading(false);
    }
  }, [certificateId]);

  const formatDate = (iso) => {
    if (!iso) return '-';
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('pt-BR') + ' às ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return iso;
    }
  };

  const maskCpf = (cpf) => {
    if (!cpf) return '***.***.***-**';
    const clean = cpf.replace(/\D/g, '');
    if (clean.length === 11) {
      return `${clean.slice(0, 3)}.***.***-${clean.slice(9, 11)}`;
    }
    return '***.***.***-**';
  };

  if (loading) {
    return (
      <div style={styles.centerBox}>
        <div style={styles.spinner}></div>
        <p style={{ marginTop: '1rem', color: '#64748b', fontWeight: 600 }}>
          Consultando registros oficiais do NexaCLINIC...
        </p>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      {/* Topo institucional */}
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={styles.headerIcon}>
              <Award size={22} color="#ffffff" />
            </div>
            <div>
              <span style={styles.headerBrand}>NexaCLINIC</span>
              <span style={styles.headerSub}>Validador Oficial de Certificados</span>
            </div>
          </div>
          {onExitPortal && (
            <button onClick={onExitPortal} style={styles.exitBtn}>
              <ArrowLeft size={16} />
              <span>Início</span>
            </button>
          )}
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main style={styles.main}>
        {submission ? (
          <div style={styles.cardSuccess}>
            <div style={styles.badgeSuccess}>
              <CheckCircle2 size={36} color="#10b981" />
              <div>
                <h2 style={styles.successTitle}>Certificado Autêntico & Válido</h2>
                <p style={styles.successDesc}>
                  Este documento foi emitido e registrado eletronicamente pelo sistema oficial do NexaCLINIC.
                </p>
              </div>
            </div>

            <div style={styles.infoGrid}>
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Colaborador</span>
                <span style={styles.infoValHighlight}>{submission.employeeName}</span>
              </div>
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>CPF</span>
                <span style={styles.infoVal}>{maskCpf(submission.cpf)}</span>
              </div>
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Treinamento</span>
                <span style={styles.infoValBold}>{submission.trainingTitle}</span>
              </div>
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Carga Horária</span>
                <span style={styles.infoVal}>{training?.workloadHours || 2} hora(s)</span>
              </div>
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Data de Conclusão</span>
                <span style={styles.infoVal}>{formatDate(submission.completedAt)}</span>
              </div>
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Aproveitamento</span>
                <span style={styles.infoValBadge}>{submission.postScore}% (Aprovado)</span>
              </div>
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Código Registrado</span>
                <span style={styles.infoValMono}>{submission.certificateId || submission.id}</span>
              </div>
            </div>

            <div style={styles.cardActions}>
              <button 
                onClick={() => setShowFullCert(true)} 
                style={styles.viewCertBtn}
              >
                <Award size={18} />
                <span>Visualizar / Baixar Certificado Completo</span>
              </button>
            </div>
          </div>
        ) : (
          <div style={styles.cardNotFound}>
            <ShieldAlert size={48} color="#ef4444" />
            <h2 style={styles.notFoundTitle}>Certificado Não Encontrado</h2>
            <p style={styles.notFoundDesc}>
              Não foi localizado nenhum registro ativo com o código <strong>"{certificateId}"</strong>.
              Verifique se o link foi digitado corretamente ou contate o departamento de Recursos Humanos.
            </p>
          </div>
        )}
      </main>

      {/* Modal de visualização do certificado completo */}
      {showFullCert && submission && (
        <CertificateView 
          submission={submission} 
          training={training} 
          onClose={() => setShowFullCert(false)} 
        />
      )}
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
  },
  header: {
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e2e8f0',
    padding: '0.85rem 1.5rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
  },
  headerInner: {
    maxWidth: '800px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  headerIcon: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    backgroundColor: '#4f46e5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  headerBrand: {
    display: 'block',
    fontSize: '1rem',
    fontWeight: 800,
    color: '#0f172a',
    lineHeight: 1.1
  },
  headerSub: {
    display: 'block',
    fontSize: '0.72rem',
    color: '#64748b',
    fontWeight: 500
  },
  exitBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    backgroundColor: '#f1f5f9',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    padding: '0.4rem 0.8rem',
    fontSize: '0.8rem',
    color: '#334155',
    fontWeight: 600,
    cursor: 'pointer'
  },
  main: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    padding: '2rem 1rem'
  },
  cardSuccess: {
    maxWidth: '680px',
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
    padding: '2rem',
    overflow: 'hidden'
  },
  badgeSuccess: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    backgroundColor: '#f0fdf4',
    border: '1px solid #bbf7d0',
    borderRadius: '12px',
    padding: '1.25rem',
    marginBottom: '1.5rem'
  },
  successTitle: {
    margin: 0,
    fontSize: '1.2rem',
    fontWeight: 800,
    color: '#15803d'
  },
  successDesc: {
    margin: '0.2rem 0 0 0',
    fontSize: '0.82rem',
    color: '#166534'
  },
  infoGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.85rem',
    borderBottom: '1px solid #f1f5f9',
    paddingBottom: '1.5rem'
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '0.5rem'
  },
  infoLabel: {
    fontSize: '0.82rem',
    color: '#64748b',
    fontWeight: 600
  },
  infoVal: {
    fontSize: '0.88rem',
    color: '#1e293b',
    fontWeight: 500
  },
  infoValHighlight: {
    fontSize: '1.05rem',
    color: '#0f172a',
    fontWeight: 800
  },
  infoValBold: {
    fontSize: '0.95rem',
    color: '#1e293b',
    fontWeight: 700
  },
  infoValBadge: {
    fontSize: '0.85rem',
    color: '#15803d',
    backgroundColor: '#dcfce7',
    padding: '0.2rem 0.6rem',
    borderRadius: '20px',
    fontWeight: 700
  },
  infoValMono: {
    fontSize: '0.8rem',
    fontFamily: 'monospace',
    color: '#4f46e5',
    backgroundColor: '#eef2ff',
    padding: '0.15rem 0.5rem',
    borderRadius: '4px'
  },
  cardActions: {
    marginTop: '1.5rem',
    display: 'flex',
    justifyContent: 'center'
  },
  viewCertBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    backgroundColor: '#4f46e5',
    color: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    padding: '0.75rem 1.4rem',
    fontSize: '0.9rem',
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)'
  },
  cardNotFound: {
    maxWidth: '520px',
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    border: '1px solid #fee2e2',
    boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
    padding: '2.5rem 2rem',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  notFoundTitle: {
    margin: '1rem 0 0.5rem 0',
    fontSize: '1.25rem',
    fontWeight: 800,
    color: '#991b1b'
  },
  notFoundDesc: {
    margin: 0,
    fontSize: '0.85rem',
    color: '#64748b',
    lineHeight: 1.5
  },
  centerBox: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc'
  },
  spinner: {
    width: '36px',
    height: '36px',
    border: '3px solid #e2e8f0',
    borderTopColor: '#4f46e5',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  }
};
