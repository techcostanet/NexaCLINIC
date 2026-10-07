import React, { useState, useEffect } from 'react';
import { X, FileText, Download, Printer, CheckCircle2, HeartHandshake } from 'lucide-react';
import { 
  getSocialAnamneses, exportSocialAnamnesesToExcel 
} from '../../services/firebase/multiService';

export default function MultiReportsModal({ isOpen, onClose, unitId = 'betim' }) {
  const [selectedReport, setSelectedReport] = useState('1');
  const [anamneses, setAnamneses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, unitId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getSocialAnamneses(unitId);
      setAnamneses(data || []);
    } catch (e) {
      console.warn('Erro ao carregar dados:', e);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleExportExcel = () => {
    let filtered = anamneses;
    if (selectedReport === '2') {
      filtered = anamneses.filter(a => a.dificuldadeAlimentos === 'Sim' || a.dificuldadeAlimentos === 'Às vezes' || a.rendaFamiliar?.includes('não possui'));
    } else if (selectedReport === '3') {
      filtered = anamneses.filter(a => a.dificuldadeTransporte === 'Sim' || a.dificuldadeTransporte === 'Às vezes');
    }
    exportSocialAnamnesesToExcel(filtered, `Relatorio_Multi_${selectedReport}_${unitId}.xlsx`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        {/* CABEÇALHO */}
        <div style={styles.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={styles.headerIcon}>
              <HeartHandshake size={22} color="#7c3aed" />
            </div>
            <div>
              <h3 style={styles.title}>Relatórios Multiprofissionais</h3>
              <p style={styles.subtitle}>Serviço Social, Psicologia & Nutrição</p>
            </div>
          </div>
          <button type="button" onClick={onClose} style={styles.btnClose}>
            <X size={20} />
          </button>
        </div>

        {/* CONTEÚDO */}
        <div style={styles.body}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <label style={styles.label}>Selecione o Relatório:</label>
            <div style={styles.reportOption} onClick={() => setSelectedReport('1')}>
              <input type="radio" checked={selectedReport === '1'} onChange={() => setSelectedReport('1')} />
              <div>
                <div style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                  1. Censo Geral de Anamneses Sociais
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Listagem completa com moradia, renda, transporte e vínculo clínico
                </div>
              </div>
            </div>

            <div style={styles.reportOption} onClick={() => setSelectedReport('2')}>
              <input type="radio" checked={selectedReport === '2'} onChange={() => setSelectedReport('2')} />
              <div>
                <div style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                  2. Vulnerabilidade Alimentar e Renda
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Pacientes com dificuldade para comprar alimentos e extrema pobreza
                </div>
              </div>
            </div>

            <div style={styles.reportOption} onClick={() => setSelectedReport('3')}>
              <input type="radio" checked={selectedReport === '3'} onChange={() => setSelectedReport('3')} />
              <div>
                <div style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                  3. Transporte Sanitário e Acesso à Clínica
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Dificuldades de deslocamento, transporte da prefeitura e faltas
                </div>
              </div>
            </div>
          </div>

          <div style={styles.previewBox}>
            <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#475569' }}>
              Registros no Período Atual:
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#7c3aed', marginTop: '0.25rem' }}>
              {loading ? '...' : `${anamneses.length} pacientes cadastrados`}
            </div>
          </div>
        </div>

        {/* RODAPÉ COM AÇÕES */}
        <div style={styles.footer}>
          <button type="button" onClick={onClose} style={styles.btnSecondary}>
            Fechar
          </button>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="button" onClick={handlePrint} style={styles.btnSecondary}>
              <Printer size={15} /> Imprimir
            </button>
            <button type="button" onClick={handleExportExcel} style={styles.btnPrimary}>
              <Download size={15} /> Exportar Excel
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
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    backdropFilter: 'blur(3px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000,
    padding: '1rem'
  },
  modal: {
    backgroundColor: 'var(--bg-card, #ffffff)',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '560px',
    border: '1px solid var(--border-color, #e2e8f0)',
    overflow: 'hidden',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15)'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.25rem 1.5rem',
    borderBottom: '1px solid var(--border-color, #e2e8f0)',
    backgroundColor: 'var(--bg-surface, #f8fafc)'
  },
  headerIcon: {
    width: '38px',
    height: '38px',
    borderRadius: '10px',
    backgroundColor: '#ede9fe',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  title: { margin: 0, fontSize: '1.15rem', fontWeight: '700', color: 'var(--text-primary)' },
  subtitle: { margin: '0.15rem 0 0 0', fontSize: '0.78rem', color: 'var(--text-secondary)' },
  btnClose: { background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' },
  body: { padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' },
  label: { fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-primary)' },
  reportOption: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.85rem 1rem',
    borderRadius: '10px',
    border: '1.5px solid var(--border-color, #e2e8f0)',
    backgroundColor: 'var(--bg-card, #ffffff)',
    cursor: 'pointer'
  },
  previewBox: {
    padding: '1rem',
    borderRadius: '10px',
    backgroundColor: 'var(--bg-surface, #f8fafc)',
    border: '1px solid var(--border-color, #e2e8f0)',
    textAlign: 'center'
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 1.5rem',
    borderTop: '1px solid var(--border-color, #e2e8f0)',
    backgroundColor: 'var(--bg-surface, #f8fafc)'
  },
  btnPrimary: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    padding: '0.6rem 1.15rem',
    borderRadius: '8px',
    backgroundColor: '#7c3aed',
    color: '#ffffff',
    border: 'none',
    fontWeight: '700',
    fontSize: '0.825rem',
    cursor: 'pointer'
  },
  btnSecondary: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    padding: '0.55rem 0.9rem',
    borderRadius: '8px',
    border: '1px solid var(--border-color, #cbd5e1)',
    backgroundColor: 'var(--bg-card, #ffffff)',
    color: 'var(--text-primary, #1e293b)',
    fontWeight: '500',
    fontSize: '0.825rem',
    cursor: 'pointer'
  }
};
