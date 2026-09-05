import React, { useState } from 'react';
import { 
  X, BookOpen, CheckCircle2, HelpCircle, ListOrdered, Sparkles, 
  Search, Info, ArrowRight, ShieldCheck, ChevronRight
} from 'lucide-react';
import { MODULE_GUIDES } from '../../data/moduleGuidesData';

export default function ModuleGuideModal({ moduleId, onClose }) {
  const [activeTab, setActiveTab] = useState('recursos'); // 'recursos' | 'tutorial' | 'duvidas'
  const [searchTerm, setSearchTerm] = useState('');

  const guide = MODULE_GUIDES[moduleId] || {
    id: moduleId,
    name: 'Guia do Módulo',
    subtitle: 'Nex-Ai CLINIC — Manual Operacional',
    color: '#10b981',
    recursos: [],
    tutorial: [],
    duvidas: []
  };

  const filteredRecursos = (guide.recursos || []).filter(r => 
    r.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.desc.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTutorial = (guide.tutorial || []).filter(t => 
    t.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (t.steps || []).some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredDuvidas = (guide.duvidas || []).filter(d => 
    d.pergunta.toLowerCase().includes(searchTerm.toLowerCase()) || 
    d.resposta.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        {/* Header */}
        <div style={styles.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              backgroundColor: `${guide.color || '#10b981'}15`,
              color: guide.color || '#10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <BookOpen size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a', fontWeight: '700' }}>
                  {guide.name}
                </h2>
                <span style={{
                  fontSize: '0.72rem',
                  fontWeight: '700',
                  padding: '0.15rem 0.5rem',
                  borderRadius: '999px',
                  backgroundColor: '#ecfdf5',
                  color: '#047857',
                  border: '1px solid #a7f3d0'
                }}>
                  Manual
                </span>
              </div>
              <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                {guide.subtitle}
              </p>
            </div>
          </div>

          <button onClick={onClose} style={styles.closeBtn} title="Fechar manual">
            <X size={22} />
          </button>
        </div>

        {/* Navigation & Search Bar */}
        <div style={styles.navBar}>
          <div style={styles.tabGroup}>
            <button 
              onClick={() => setActiveTab('recursos')}
              style={{
                ...styles.tabBtn,
                ...(activeTab === 'recursos' ? styles.tabBtnActive : {})
              }}
            >
              <Sparkles size={16} />
              <span>Recursos</span>
              <span style={styles.tabBadge}>{guide.recursos?.length || 0}</span>
            </button>

            <button 
              onClick={() => setActiveTab('tutorial')}
              style={{
                ...styles.tabBtn,
                ...(activeTab === 'tutorial' ? styles.tabBtnActive : {})
              }}
            >
              <ListOrdered size={16} />
              <span>Tutorial</span>
              <span style={styles.tabBadge}>{guide.tutorial?.length || 0}</span>
            </button>

            <button 
              onClick={() => setActiveTab('duvidas')}
              style={{
                ...styles.tabBtn,
                ...(activeTab === 'duvidas' ? styles.tabBtnActive : {})
              }}
            >
              <HelpCircle size={16} />
              <span>Dúvidas</span>
              <span style={styles.tabBadge}>{guide.duvidas?.length || 0}</span>
            </button>
          </div>

          <div style={styles.searchWrapper}>
            <Search size={16} color="#94a3b8" />
            <input 
              type="text"
              placeholder="Buscar no manual..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} style={styles.clearSearchBtn}>
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div style={styles.body}>
          {/* TAB 1: RECURSOS */}
          {activeTab === 'recursos' && (
            <div style={styles.gridContainer}>
              {filteredRecursos.length > 0 ? (
                filteredRecursos.map((rec, i) => (
                  <div key={i} style={styles.resourceCard}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                      <div style={styles.iconCircle}>
                        <CheckCircle2 size={18} color="#10b981" />
                      </div>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ margin: '0 0 0.35rem 0', fontSize: '0.95rem', color: '#1e293b', fontWeight: '700' }}>
                          {rec.title}
                        </h4>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', lineHeight: '1.45' }}>
                          {rec.desc}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div style={styles.emptyState}>
                  <Info size={32} color="#94a3b8" />
                  <p style={{ margin: '0.5rem 0 0 0', color: '#64748b', fontSize: '0.9rem' }}>
                    Nenhum recurso encontrado para o termo pesquisado.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: TUTORIAL */}
          {activeTab === 'tutorial' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {filteredTutorial.length > 0 ? (
                filteredTutorial.map((tut, idx) => (
                  <div key={idx} style={styles.tutorialCard}>
                    <div style={styles.tutorialHeader}>
                      <div style={styles.stepIndexBadge}>{idx + 1}</div>
                      <h4 style={{ margin: 0, fontSize: '1rem', color: '#0f172a', fontWeight: '700' }}>
                        {tut.title}
                      </h4>
                    </div>

                    <div style={styles.stepsList}>
                      {(tut.steps || []).map((step, sIdx) => (
                        <div key={sIdx} style={styles.stepItem}>
                          <div style={styles.stepSubBadge}>{sIdx + 1}</div>
                          <span style={{ fontSize: '0.875rem', color: '#334155', lineHeight: '1.5' }}>
                            {step}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div style={styles.emptyState}>
                  <Info size={32} color="#94a3b8" />
                  <p style={{ margin: '0.5rem 0 0 0', color: '#64748b', fontSize: '0.9rem' }}>
                    Nenhum tutorial encontrado para o termo pesquisado.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: DÚVIDAS */}
          {activeTab === 'duvidas' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {filteredDuvidas.length > 0 ? (
                filteredDuvidas.map((faq, fIdx) => (
                  <div key={fIdx} style={styles.faqCard}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                      <div style={styles.faqIconCircle}>
                        <HelpCircle size={18} color="#0284c7" />
                      </div>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ margin: '0 0 0.4rem 0', fontSize: '0.95rem', color: '#0f172a', fontWeight: '700' }}>
                          {faq.pergunta}
                        </h4>
                        <div style={styles.faqAnswerBox}>
                          <p style={{ margin: 0, fontSize: '0.85rem', color: '#334155', lineHeight: '1.5' }}>
                            {faq.resposta}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div style={styles.emptyState}>
                  <Info size={32} color="#94a3b8" />
                  <p style={{ margin: '0.5rem 0 0 0', color: '#64748b', fontSize: '0.9rem' }}>
                    Nenhuma dúvida encontrada para o termo pesquisado.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#64748b' }}>
            <ShieldCheck size={16} color="#10b981" />
            <span>Documentação oficial Nex-Ai CLINIC — Sempre atualizada a cada versão.</span>
          </div>
          <button onClick={onClose} style={styles.confirmBtn}>
            Entendi
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
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 99999,
    padding: '1.5rem',
    backdropFilter: 'blur(4px)'
  },
  modal: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '1050px',
    height: '100%',
    maxHeight: '88vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
    overflow: 'hidden'
  },
  header: {
    padding: '1.25rem 1.5rem',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8fafc'
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#64748b',
    padding: '0.5rem',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color 0.15s'
  },
  navBar: {
    padding: '0.75rem 1.5rem',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    flexWrap: 'wrap',
    gap: '0.75rem'
  },
  tabGroup: {
    display: 'flex',
    gap: '0.5rem'
  },
  tabBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    padding: '0.5rem 0.9rem',
    borderRadius: '8px',
    border: '1px solid transparent',
    backgroundColor: '#f1f5f9',
    color: '#475569',
    fontSize: '0.85rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.15s'
  },
  tabBtnActive: {
    backgroundColor: '#ecfdf5',
    color: '#047857',
    border: '1px solid #10b981'
  },
  tabBadge: {
    fontSize: '0.7rem',
    padding: '0.1rem 0.4rem',
    borderRadius: '999px',
    backgroundColor: 'rgba(0,0,0,0.06)',
    fontWeight: '700'
  },
  searchWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    backgroundColor: '#f8fafc',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    padding: '0.35rem 0.75rem',
    width: '260px'
  },
  searchInput: {
    border: 'none',
    outline: 'none',
    backgroundColor: 'transparent',
    fontSize: '0.85rem',
    color: '#0f172a',
    width: '100%'
  },
  clearSearchBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#94a3b8',
    padding: 0,
    display: 'flex',
    alignItems: 'center'
  },
  body: {
    padding: '1.5rem',
    flex: 1,
    overflowY: 'auto',
    backgroundColor: '#f8fafc'
  },
  gridContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '1rem'
  },
  resourceCard: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '1.1rem',
    border: '1px solid #e2e8f0',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
  },
  iconCircle: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    backgroundColor: '#ecfdf5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  tutorialCard: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '1.25rem',
    border: '1px solid #e2e8f0',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
  },
  tutorialHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    marginBottom: '1rem',
    paddingBottom: '0.75rem',
    borderBottom: '1px solid #f1f5f9'
  },
  stepIndexBadge: {
    width: '26px',
    height: '26px',
    borderRadius: '6px',
    backgroundColor: '#10b981',
    color: '#ffffff',
    fontSize: '0.8rem',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  stepsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.65rem'
  },
  stepItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.6rem'
  },
  stepSubBadge: {
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    backgroundColor: '#f1f5f9',
    color: '#64748b',
    fontSize: '0.72rem',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: '2px'
  },
  faqCard: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '1.1rem 1.25rem',
    border: '1px solid #e2e8f0',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
  },
  faqIconCircle: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    backgroundColor: '#f0f9ff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  faqAnswerBox: {
    backgroundColor: '#f8fafc',
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    border: '1px solid #f1f5f9'
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '3rem 1rem',
    textAlign: 'center'
  },
  footer: {
    padding: '1rem 1.5rem',
    borderTop: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff'
  },
  confirmBtn: {
    padding: '0.5rem 1.25rem',
    borderRadius: '8px',
    backgroundColor: '#10b981',
    color: '#ffffff',
    border: 'none',
    fontWeight: '600',
    fontSize: '0.85rem',
    cursor: 'pointer'
  }
};
