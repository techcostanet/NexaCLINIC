import React, { useState } from 'react';
import { 
  X, Search, BookOpen, ChevronRight, ChevronDown, 
  Printer, Wifi, QrCode, ShieldCheck, CheckCircle2, Copy, Check
} from 'lucide-react';
import { INITIAL_IT_WIKI_ARTICLES } from '../../services/firebase/maintenanceService';

const CATEGORIES = ['Todos', 'Impressoras', 'Rede', 'Periféricos', 'Sistemas'];

export default function ITWikiModal({ isOpen, onClose }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCat, setSelectedCat] = useState('Todos');
  const [expandedArticleId, setExpandedArticleId] = useState(INITIAL_IT_WIKI_ARTICLES[0]?.id || null);
  const [copiedId, setCopiedId] = useState(null);

  if (!isOpen) return null;

  const filteredArticles = INITIAL_IT_WIKI_ARTICLES.filter(art => {
    const term = searchTerm.toLowerCase();
    const matchSearch = 
      !term ||
      art.title.toLowerCase().includes(term) ||
      art.summary.toLowerCase().includes(term) ||
      art.steps.some(s => s.toLowerCase().includes(term));

    const matchCat = selectedCat === 'Todos' || art.category === selectedCat;
    return matchSearch && matchCat;
  });

  const getCatIcon = (cat) => {
    switch (cat) {
      case 'Impressoras': return Printer;
      case 'Rede': return Wifi;
      case 'Periféricos': return QrCode;
      case 'Sistemas': return ShieldCheck;
      default: return BookOpen;
    }
  };

  const handleCopySteps = (art) => {
    const text = `${art.title}\n\n${art.steps.map((s, idx) => `${idx + 1}. ${s}`).join('\n')}`;
    navigator.clipboard.writeText(text);
    setCopiedId(art.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        {/* Header */}
        <div style={styles.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={styles.iconBox}>
              <BookOpen size={22} color="#059669" />
            </div>
            <div>
              <h2 style={styles.title}>Base de Conhecimento</h2>
              <p style={styles.subtitle}>Procedimentos operacionais padrão e soluções técnicas rápidas</p>
            </div>
          </div>
          <button type="button" onClick={onClose} style={styles.closeBtn}>
            <X size={18} />
          </button>
        </div>

        {/* Search & Categories */}
        <div style={styles.filterBar}>
          <div style={styles.searchBox}>
            <Search size={15} color="#94a3b8" />
            <input 
              type="text" 
              placeholder="Buscar solução rápida (ex: zebra, internet, leitor, certificado)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
              autoFocus
            />
          </div>

          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto' }}>
            {CATEGORIES.map(c => (
              <button
                key={c}
                type="button"
                onClick={() => setSelectedCat(c)}
                style={{
                  ...styles.catBtn,
                  backgroundColor: selectedCat === c ? '#059669' : '#f8fafc',
                  color: selectedCat === c ? '#ffffff' : '#64748b',
                  borderColor: selectedCat === c ? '#047857' : '#cbd5e1'
                }}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Articles List */}
        <div style={styles.articlesList}>
          {filteredArticles.length === 0 ? (
            <div style={styles.emptyBox}>
              Nenhum procedimento encontrado com o termo pesquisado.
            </div>
          ) : (
            filteredArticles.map(art => {
              const IconComp = getCatIcon(art.category);
              const isExpanded = expandedArticleId === art.id;

              return (
                <div key={art.id} style={{ ...styles.articleCard, borderColor: isExpanded ? '#a7f3d0' : '#e2e8f0' }}>
                  <div 
                    onClick={() => setExpandedArticleId(isExpanded ? null : art.id)}
                    style={styles.articleHeader}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                      <div style={styles.articleIconBox}>
                        <IconComp size={16} color="#059669" />
                      </div>
                      <div>
                        <div style={styles.articleTitle}>{art.title}</div>
                        <div style={styles.articleSummary}>{art.summary}</div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={styles.catBadge}>{art.category}</span>
                      {isExpanded ? <ChevronDown size={18} color="#059669" /> : <ChevronRight size={18} color="#94a3b8" />}
                    </div>
                  </div>

                  {isExpanded && (
                    <div style={styles.articleBody}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: '#047857', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                          Passo a Passo
                        </span>
                        <button 
                          type="button"
                          onClick={() => handleCopySteps(art)}
                          style={styles.copyBtn}
                        >
                          {copiedId === art.id ? <Check size={13} color="#059669" /> : <Copy size={13} />}
                          {copiedId === art.id ? 'Copiado' : 'Copiar'}
                        </button>
                      </div>

                      <div style={styles.stepsContainer}>
                        {art.steps.map((step, idx) => (
                          <div key={idx} style={styles.stepRow}>
                            <div style={styles.stepNumber}>{idx + 1}</div>
                            <div style={styles.stepText}>{step}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <button type="button" onClick={onClose} style={styles.btnSecondary}>
            Fechar
          </button>
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
    padding: '20px'
  },
  modal: {
    background: '#ffffff',
    borderRadius: '14px',
    width: '100%',
    maxWidth: '780px',
    maxHeight: '90vh',
    overflowY: 'auto',
    padding: '22px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    border: '1px solid #e2e8f0',
    display: 'flex',
    flexDirection: 'column'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #f1f5f9',
    paddingBottom: '14px',
    marginBottom: '14px'
  },
  iconBox: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    background: '#ecfdf5',
    border: '1px solid #a7f3d0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  title: {
    margin: 0,
    fontSize: '16px',
    fontWeight: 700,
    color: '#0f172a'
  },
  subtitle: {
    margin: 0,
    fontSize: '12px',
    color: '#64748b'
  },
  closeBtn: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    color: '#94a3b8',
    padding: '4px'
  },
  filterBar: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginBottom: '14px'
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: '#f8fafc',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    padding: '7px 12px'
  },
  searchInput: {
    border: 'none',
    background: 'transparent',
    outline: 'none',
    width: '100%',
    fontSize: '13px',
    color: '#0f172a'
  },
  catBtn: {
    padding: '4px 10px',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    fontSize: '11px',
    fontWeight: 600,
    cursor: 'pointer',
    whiteSpace: 'nowrap'
  },
  articlesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    maxHeight: '440px',
    overflowY: 'auto',
    paddingRight: '4px'
  },
  articleCard: {
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    overflow: 'hidden',
    transition: 'all 0.15s ease'
  },
  articleHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 14px',
    cursor: 'pointer',
    backgroundColor: '#ffffff'
  },
  articleIconBox: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    background: '#ecfdf5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  articleTitle: {
    fontSize: '13px',
    fontWeight: 700,
    color: '#0f172a'
  },
  articleSummary: {
    fontSize: '11px',
    color: '#64748b',
    marginTop: '2px'
  },
  catBadge: {
    fontSize: '10px',
    fontWeight: 700,
    background: '#f1f5f9',
    color: '#475569',
    padding: '2px 6px',
    borderRadius: '4px'
  },
  articleBody: {
    padding: '12px 14px',
    backgroundColor: '#f8fafc',
    borderTop: '1px solid #f1f5f9'
  },
  copyBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    background: '#ffffff',
    border: '1px solid #cbd5e1',
    borderRadius: '4px',
    padding: '2px 6px',
    fontSize: '10px',
    fontWeight: 600,
    color: '#475569',
    cursor: 'pointer'
  },
  stepsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  stepRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px'
  },
  stepNumber: {
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    background: '#059669',
    color: '#ffffff',
    fontSize: '11px',
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: '1px'
  },
  stepText: {
    fontSize: '12px',
    color: '#1e293b',
    lineHeight: 1.4,
    flex: 1
  },
  emptyBox: {
    padding: '30px',
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: '13px'
  },
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    borderTop: '1px solid #f1f5f9',
    paddingTop: '14px',
    marginTop: '14px'
  },
  btnSecondary: {
    padding: '7px 16px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    background: '#ffffff',
    color: '#475569',
    fontWeight: 600,
    fontSize: '12px',
    cursor: 'pointer'
  }
};
