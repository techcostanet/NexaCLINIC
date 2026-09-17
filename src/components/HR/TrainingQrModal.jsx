import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { X, QrCode, Copy, Check, Printer, ExternalLink, ShieldCheck } from 'lucide-react';

export default function TrainingQrModal({ training, onClose }) {
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const printRef = useRef(null);

  const trainingUrl = `${window.location.origin}?treinamento=${training.id}`;

  useEffect(() => {
    QRCode.toDataURL(trainingUrl, {
      width: 260,
      margin: 2,
      color: {
        dark: '#1e293b',
        light: '#ffffff'
      }
    })
      .then(url => setQrDataUrl(url))
      .catch(err => console.error('Erro ao gerar QR Code:', err));
  }, [trainingUrl]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(trainingUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrintPlacard = () => {
    window.print();
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        {/* Cabeçalho */}
        <div style={styles.header} className="no-print">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <QrCode size={20} color="#4f46e5" />
            <h3 style={styles.headerTitle}>Divulgação do Treinamento</h3>
          </div>
          <button onClick={onClose} style={styles.closeBtn}>
            <X size={20} />
          </button>
        </div>

        {/* Cartaz para impressão / mural do setor */}
        <div ref={printRef} style={styles.placard} className="printable-placard">
          <div style={styles.placardInner}>
            <div style={styles.clinicHeader}>
              <span style={styles.clinicTag}>PROGRAMA DE CAPACITAÇÃO CONTINUADA</span>
              <h2 style={styles.clinicTitle}>NEXA CLÍNICA DE NEFROLOGIA</h2>
            </div>

            <div style={styles.trainingBadge}>
              <span style={styles.sectorText}>Setor: {training.sector || 'Geral'}</span>
            </div>

            <h1 style={styles.placardTitle}>{training.title}</h1>
            <p style={styles.placardDesc}>{training.description}</p>

            <div style={styles.qrContainer}>
              {qrDataUrl ? (
                <img src={qrDataUrl} alt="QR Code" style={styles.qrImage} />
              ) : (
                <div style={styles.qrPlaceholder}>Gerando QR Code...</div>
              )}
            </div>

            <div style={styles.instructionsBox}>
              <p style={styles.instStep}>
                📱 <strong>Aponte a câmera do seu celular</strong> para o QR Code acima.
              </p>
              <p style={styles.instStep}>
                ✍️ <strong>Digite seu CPF</strong> para acessar o conteúdo e responder ao questionário.
              </p>
              <p style={styles.instStep}>
                🎓 <strong>Receba seu certificado oficial</strong> imediatamente após a aprovação!
              </p>
            </div>

            <div style={styles.placardFooter}>
              <span>Carga Horária: <strong>{training.workloadHours || 2}h</strong></span>
              <span>•</span>
              <span>Nota Mínima: <strong>{training.minPassingScore || 70}%</strong></span>
              <span>•</span>
              <span>Validade: <strong>{training.validityMonths || 12} meses</strong></span>
            </div>
          </div>
        </div>

        {/* Rodapé de Ações na tela */}
        <div style={styles.footer} className="no-print">
          <div style={styles.linkContainer}>
            <input 
              type="text" 
              readOnly 
              value={trainingUrl} 
              style={styles.linkInput} 
            />
            <button 
              onClick={handleCopyLink} 
              style={styles.copyBtn}
            >
              {copied ? <Check size={16} color="#15803d" /> : <Copy size={16} />}
              <span>{copied ? 'Copiado!' : 'Copiar'}</span>
            </button>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '0.75rem' }}>
            <button 
              onClick={() => window.open(trainingUrl, '_blank')} 
              style={styles.secondaryBtn}
            >
              <ExternalLink size={15} />
              <span>Testar Acesso</span>
            </button>
            <button 
              onClick={handlePrintPlacard} 
              style={styles.primaryBtn}
            >
              <Printer size={15} />
              <span>Imprimir Cartaz</span>
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .printable-placard, .printable-placard * {
            visibility: visible;
          }
          .printable-placard {
            position: absolute;
            left: 0;
            top: 0;
            width: 100vw;
            height: 100vh;
            border: none !important;
            padding: 2rem !important;
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
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    zIndex: 9999,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '1rem'
  },
  modal: {
    maxWidth: '560px',
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    maxHeight: '92vh'
  },
  header: {
    padding: '1rem 1.25rem',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8fafc'
  },
  headerTitle: {
    margin: 0,
    fontSize: '1rem',
    fontWeight: 700,
    color: '#0f172a'
  },
  closeBtn: {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#64748b',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  placard: {
    padding: '1.5rem',
    backgroundColor: '#ffffff',
    overflowY: 'auto'
  },
  placardInner: {
    border: '2px dashed #cbd5e1',
    borderRadius: '12px',
    padding: '1.75rem 1.25rem',
    textAlign: 'center',
    backgroundColor: '#fcfdff'
  },
  clinicHeader: {
    marginBottom: '0.75rem'
  },
  clinicTag: {
    fontSize: '0.68rem',
    fontWeight: 800,
    color: '#4f46e5',
    letterSpacing: '0.08em',
    textTransform: 'uppercase'
  },
  clinicTitle: {
    margin: '0.2rem 0 0 0',
    fontSize: '1.05rem',
    fontWeight: 800,
    color: '#1e293b'
  },
  trainingBadge: {
    margin: '0.75rem 0'
  },
  sectorText: {
    backgroundColor: '#eef2ff',
    color: '#4f46e5',
    fontSize: '0.75rem',
    fontWeight: 700,
    padding: '0.2rem 0.6rem',
    borderRadius: '20px'
  },
  placardTitle: {
    fontSize: '1.35rem',
    fontWeight: 900,
    color: '#0f172a',
    margin: '0.5rem 0',
    lineHeight: 1.25
  },
  placardDesc: {
    fontSize: '0.82rem',
    color: '#64748b',
    margin: '0 0 1.25rem 0',
    lineHeight: 1.4
  },
  qrContainer: {
    display: 'flex',
    justifyContent: 'center',
    margin: '1rem 0'
  },
  qrImage: {
    width: '180px',
    height: '180px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 4px 10px rgba(0,0,0,0.06)'
  },
  qrPlaceholder: {
    width: '180px',
    height: '180px',
    backgroundColor: '#f1f5f9',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.8rem',
    color: '#94a3b8'
  },
  instructionsBox: {
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '0.85rem',
    textAlign: 'left',
    margin: '1rem 0',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem'
  },
  instStep: {
    margin: 0,
    fontSize: '0.78rem',
    color: '#334155',
    lineHeight: 1.35
  },
  placardFooter: {
    display: 'flex',
    justifyContent: 'center',
    gap: '0.5rem',
    fontSize: '0.72rem',
    color: '#64748b',
    marginTop: '0.75rem',
    flexWrap: 'wrap'
  },
  footer: {
    padding: '1rem 1.25rem',
    borderTop: '1px solid #e2e8f0',
    backgroundColor: '#f8fafc'
  },
  linkContainer: {
    display: 'flex',
    gap: '0.5rem'
  },
  linkInput: {
    flex: 1,
    backgroundColor: '#ffffff',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    padding: '0.5rem 0.75rem',
    fontSize: '0.8rem',
    color: '#334155',
    outline: 'none'
  },
  copyBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    backgroundColor: '#ffffff',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    padding: '0.5rem 0.85rem',
    fontSize: '0.8rem',
    fontWeight: 600,
    color: '#334155',
    cursor: 'pointer'
  },
  primaryBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    backgroundColor: '#4f46e5',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '0.55rem 1rem',
    fontSize: '0.82rem',
    fontWeight: 700,
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
    padding: '0.55rem 0.9rem',
    fontSize: '0.82rem',
    fontWeight: 600,
    cursor: 'pointer'
  }
};
