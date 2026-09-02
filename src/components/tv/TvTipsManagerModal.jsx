import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, Plus, Edit2, Trash2, Check, Search, RotateCcw, 
  Sparkles, CheckCircle2, AlertCircle, Eye, EyeOff
} from 'lucide-react';
import { dbService } from '../../firebase';
import { TIP_CATEGORIES } from '../../services/firebase/tvTipsService';

export default function TvTipsManagerModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const [tips, setTips] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingTip, setEditingTip] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [feedback, setFeedback] = useState({ text: '', type: '' });

  const [form, setForm] = useState({
    title: '',
    category: 'nutricao',
    text: '',
    duration: 14,
    active: true
  });

  const showFeedback = (text, type = 'success') => {
    setFeedback({ text, type });
    setTimeout(() => setFeedback({ text: '', type: '' }), 4000);
  };

  const loadTips = async () => {
    setLoading(true);
    try {
      if (dbService.getTvTips) {
        const data = await dbService.getTvTips();
        setTips(data || []);
      }
    } catch (e) {
      console.error(e);
      showFeedback('Erro ao carregar dicas.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTips();
  }, []);

  const handleStartCreate = () => {
    setEditingTip(null);
    setIsCreating(true);
    setForm({
      title: '',
      category: selectedCategory !== 'all' ? selectedCategory : 'nutricao',
      text: '',
      duration: 14,
      active: true
    });
  };

  const handleStartEdit = (tip) => {
    setIsCreating(false);
    setEditingTip(tip);
    setForm({
      title: tip.title || '',
      category: tip.category || 'nutricao',
      text: tip.text || '',
      duration: tip.duration || 14,
      active: tip.active !== false
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.text.trim()) {
      return showFeedback('Preencha título e texto.', 'danger');
    }

    try {
      if (editingTip) {
        if (dbService.updateTvTip) {
          await dbService.updateTvTip(editingTip.id, form);
        }
        setTips(prev => prev.map(t => t.id === editingTip.id ? { ...t, ...form } : t));
        showFeedback('Dica atualizada com sucesso!');
      } else {
        if (dbService.createTvTip) {
          const created = await dbService.createTvTip(form);
          setTips(prev => [created, ...prev]);
        }
        showFeedback('Nova dica criada com sucesso!');
      }
      setIsCreating(false);
      setEditingTip(null);
    } catch (e) {
      console.error(e);
      showFeedback('Erro ao salvar dica.', 'danger');
    }
  };

  const handleDelete = async (tip) => {
    if (!window.confirm(`Excluir permanentemente a dica "${tip.title}"?`)) return;
    try {
      if (dbService.deleteTvTip) {
        await dbService.deleteTvTip(tip.id);
      }
      setTips(prev => prev.filter(t => t.id !== tip.id));
      showFeedback('Dica excluída.');
      if (editingTip?.id === tip.id) {
        setEditingTip(null);
        setIsCreating(false);
      }
    } catch (e) {
      console.error(e);
      showFeedback('Erro ao excluir dica.', 'danger');
    }
  };

  const handleToggleActive = async (tip) => {
    try {
      const newActive = !tip.active;
      if (dbService.updateTvTip) {
        await dbService.updateTvTip(tip.id, { active: newActive });
      }
      setTips(prev => prev.map(t => t.id === tip.id ? { ...t, active: newActive } : t));
      showFeedback(`Dica ${newActive ? 'ativada' : 'desativada'}.`);
    } catch (e) {
      console.error(e);
    }
  };

  const handleResetDefaults = async () => {
    if (!window.confirm('Restaurar a base original completa de 70 dicas de nefrologia?')) return;
    try {
      if (dbService.resetTvTipsToDefaults) {
        const defs = await dbService.resetTvTipsToDefaults();
        setTips(defs || []);
        showFeedback('Base de 70 dicas restaurada com sucesso!');
      }
    } catch (e) {
      console.error(e);
      showFeedback('Erro ao restaurar dicas.', 'danger');
    }
  };

  const filteredTips = useMemo(() => {
    return tips.filter(t => {
      if (selectedCategory !== 'all' && t.category !== selectedCategory) return false;
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase().trim();
        const mTitle = (t.title || '').toLowerCase().includes(term);
        const mText = (t.text || '').toLowerCase().includes(term);
        return mTitle || mText;
      }
      return true;
    });
  }, [tips, selectedCategory, searchTerm]);

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        {/* Header */}
        <div style={styles.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={styles.headerIconBox}>
              <Sparkles size={20} color="#ffffff" />
            </div>
            <div>
              <h2 style={styles.headerTitle}>Dicas da TV</h2>
              <p style={styles.headerSubtitle}>
                Gerencie os conteúdos educativos exibidos no carrossel da TV durante a espera
              </p>
            </div>
          </div>
          <button onClick={onClose} style={styles.closeBtn}>
            <X size={20} />
          </button>
        </div>

        {/* Feedback Alert */}
        {feedback.text && (
          <div style={{
            ...styles.alertBanner,
            backgroundColor: feedback.type === 'danger' ? '#fee2e2' : '#dcfce7',
            color: feedback.type === 'danger' ? '#991b1b' : '#166534',
            borderColor: feedback.type === 'danger' ? '#fca5a5' : '#bbf7d0'
          }}>
            {feedback.type === 'danger' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
            <span>{feedback.text}</span>
          </div>
        )}

        {/* Toolbar: Category Filters & Search */}
        <div style={styles.toolbar}>
          <div style={styles.categoryPills}>
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              style={{
                ...styles.pillBtn,
                backgroundColor: selectedCategory === 'all' ? '#0891b2' : '#f1f5f9',
                color: selectedCategory === 'all' ? '#ffffff' : '#475569'
              }}
            >
              Todas ({tips.length})
            </button>
            {Object.keys(TIP_CATEGORIES).map(catKey => {
              const cat = TIP_CATEGORIES[catKey];
              const count = tips.filter(t => t.category === catKey).length;
              const isSel = selectedCategory === catKey;
              return (
                <button
                  key={catKey}
                  type="button"
                  onClick={() => setSelectedCategory(catKey)}
                  style={{
                    ...styles.pillBtn,
                    backgroundColor: isSel ? cat.color : '#f1f5f9',
                    color: isSel ? '#ffffff' : '#334155',
                    border: isSel ? `1px solid ${cat.color}` : '1px solid #e2e8f0'
                  }}
                >
                  {cat.label} ({count})
                </button>
              );
            })}
          </div>

          <div style={styles.toolbarActions}>
            <div style={styles.searchBox}>
              <Search size={16} color="#94a3b8" />
              <input
                type="text"
                placeholder="Pesquisar..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={styles.searchInput}
              />
            </div>
            <button 
              type="button" 
              onClick={handleStartCreate} 
              style={styles.btnPrimary}
              title="Nova Dica"
            >
              <Plus size={16} />
              <span>Novo</span>
            </button>
            <button 
              type="button" 
              onClick={handleResetDefaults} 
              style={styles.btnSecondary}
              title="Restaurar as 70 dicas padrões de nefrologia"
            >
              <RotateCcw size={15} />
              <span>Restaurar</span>
            </button>
          </div>
        </div>

        {/* Content Body: Grid / List and Form */}
        <div style={styles.bodyGrid}>
          {/* Left Column: Tips List */}
          <div style={styles.listCol}>
            {loading ? (
              <div style={styles.loadingBox}>Carregando dicas...</div>
            ) : filteredTips.length === 0 ? (
              <div style={styles.emptyBox}>Nenhuma dica encontrada neste filtro.</div>
            ) : (
              <div style={styles.tipsList}>
                {filteredTips.map(item => {
                  const catCfg = TIP_CATEGORIES[item.category] || TIP_CATEGORIES.nutricao;
                  const isSelected = editingTip?.id === item.id;
                  return (
                    <div 
                      key={item.id} 
                      style={{
                        ...styles.tipItemCard,
                        borderColor: isSelected ? catCfg.color : item.active === false ? '#cbd5e1' : '#e2e8f0',
                        backgroundColor: isSelected ? 'rgba(56, 189, 248, 0.06)' : item.active === false ? '#f8fafc' : '#ffffff',
                        opacity: item.active === false ? 0.65 : 1
                      }}
                    >
                      <div style={styles.tipItemTop}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                          <span style={{
                            ...styles.categoryBadge,
                            backgroundColor: `${catCfg.color}18`,
                            color: catCfg.color,
                            borderColor: `${catCfg.color}40`
                          }}>
                            {catCfg.label}
                          </span>
                          <span style={styles.durationBadge}>{item.duration || 14}s</span>
                          {item.active === false && (
                            <span style={styles.inactiveBadge}>Inativo</span>
                          )}
                        </div>
                        <div style={styles.itemActionGroup}>
                          <button
                            type="button"
                            onClick={() => handleToggleActive(item)}
                            style={styles.iconBtn}
                            title={item.active === false ? 'Ativar' : 'Desativar'}
                          >
                            {item.active === false ? <EyeOff size={14} color="#64748b" /> : <Eye size={14} color="#10b981" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStartEdit(item)}
                            style={styles.iconBtn}
                            title="Editar"
                          >
                            <Edit2 size={14} color="#0284c7" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(item)}
                            style={{ ...styles.iconBtn, backgroundColor: '#fee2e2' }}
                            title="Excluir"
                          >
                            <Trash2 size={14} color="#dc2626" />
                          </button>
                        </div>
                      </div>

                      <strong style={styles.tipItemTitle}>{item.title}</strong>
                      <p style={styles.tipItemText}>{item.text}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Form Panel (Create or Edit) */}
          <div style={styles.formCol}>
            {(isCreating || editingTip) ? (
              <form onSubmit={handleSave} style={styles.formCard}>
                <div style={styles.formHeader}>
                  <strong style={{ fontSize: '1.05rem', color: '#0f172a' }}>
                    {editingTip ? 'Editar' : 'Nova'}
                  </strong>
                  <button 
                    type="button" 
                    onClick={() => { setIsCreating(false); setEditingTip(null); }}
                    style={styles.closeBtn}
                  >
                    <X size={16} />
                  </button>
                </div>

                <div style={styles.formBody}>
                  <div>
                    <label style={styles.label}>Categoria</label>
                    <select
                      value={form.category}
                      onChange={e => setForm({ ...form, category: e.target.value })}
                      style={styles.select}
                    >
                      {Object.keys(TIP_CATEGORIES).map(catKey => (
                        <option key={catKey} value={catKey}>
                          {TIP_CATEGORIES[catKey].label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={styles.label}>Título</label>
                    <input
                      type="text"
                      placeholder="Ex: Potássio sob Controle"
                      value={form.title}
                      onChange={e => setForm({ ...form, title: e.target.value })}
                      style={styles.input}
                      required
                    />
                  </div>

                  <div>
                    <label style={styles.label}>Texto</label>
                    <textarea
                      rows={5}
                      placeholder="Orientações e dicas práticas para o paciente ler na TV..."
                      value={form.text}
                      onChange={e => setForm({ ...form, text: e.target.value })}
                      style={styles.textarea}
                      required
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={styles.label}>Segundos</label>
                      <input
                        type="number"
                        min={8}
                        max={60}
                        value={form.duration}
                        onChange={e => setForm({ ...form, duration: e.target.value })}
                        style={styles.input}
                      />
                    </div>
                    <div>
                      <label style={styles.label}>Status</label>
                      <select
                        value={form.active ? 'true' : 'false'}
                        onChange={e => setForm({ ...form, active: e.target.value === 'true' })}
                        style={styles.select}
                      >
                        <option value="true">Ativo</option>
                        <option value="false">Inativo</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div style={styles.formFooter}>
                  <button 
                    type="button" 
                    onClick={() => { setIsCreating(false); setEditingTip(null); }} 
                    style={styles.btnSecondary}
                  >
                    Cancelar
                  </button>
                  <button type="submit" style={styles.btnPrimary}>
                    <Check size={16} />
                    <span>Salvar</span>
                  </button>
                </div>
              </form>
            ) : (
              <div style={styles.emptyFormState}>
                <Sparkles size={36} color="#0284c7" />
                <h4 style={{ margin: '0.75rem 0 0.25rem 0', color: '#0f172a' }}>Gerenciador de Dicas</h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', textAlign: 'center' }}>
                  Selecione uma dica para editar seu conteúdo ou clique em <strong>Novo</strong> para adicionar uma recomendação personalizada.
                </p>
                <button type="button" onClick={handleStartCreate} style={{ ...styles.btnPrimary, marginTop: '1rem' }}>
                  <Plus size={16} />
                  <span>Nova Dica</span>
                </button>
              </div>
            )}
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
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000,
    padding: '1.5rem'
  },
  modal: {
    width: '100%',
    maxWidth: '1200px',
    height: '90vh',
    backgroundColor: '#ffffff',
    borderRadius: '20px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    border: '1px solid #cbd5e1'
  },
  header: {
    padding: '1.25rem 1.75rem',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc'
  },
  headerIconBox: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    backgroundColor: '#0284c7',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 10px rgba(2, 132, 199, 0.3)'
  },
  headerTitle: {
    margin: 0,
    fontSize: '1.25rem',
    fontWeight: '800',
    color: '#0f172a'
  },
  headerSubtitle: {
    margin: 0,
    fontSize: '0.8rem',
    color: '#64748b'
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: '#64748b',
    cursor: 'pointer',
    padding: '0.4rem',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  alertBanner: {
    padding: '0.65rem 1.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    fontSize: '0.85rem',
    fontWeight: '700',
    borderBottom: '1px solid transparent'
  },
  toolbar: {
    padding: '1rem 1.75rem',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.85rem'
  },
  categoryPills: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    flexWrap: 'wrap'
  },
  pillBtn: {
    padding: '0.35rem 0.75rem',
    borderRadius: '100px',
    fontSize: '0.8rem',
    fontWeight: '700',
    cursor: 'pointer',
    border: 'none',
    transition: 'all 0.15s ease'
  },
  toolbarActions: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '1rem',
    flexWrap: 'wrap'
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    backgroundColor: '#f8fafc',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    padding: '0.45rem 0.8rem',
    flex: '1',
    maxWidth: '380px'
  },
  searchInput: {
    border: 'none',
    outline: 'none',
    backgroundColor: 'transparent',
    fontSize: '0.85rem',
    color: '#1e293b',
    width: '100%'
  },
  btnPrimary: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    backgroundColor: '#0284c7',
    color: '#ffffff',
    border: 'none',
    fontSize: '0.85rem',
    fontWeight: '700',
    cursor: 'pointer'
  },
  btnSecondary: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    padding: '0.5rem 0.9rem',
    borderRadius: '8px',
    backgroundColor: '#f1f5f9',
    color: '#334155',
    border: '1px solid #cbd5e1',
    fontSize: '0.85rem',
    fontWeight: '700',
    cursor: 'pointer'
  },
  bodyGrid: {
    flex: 1,
    display: 'grid',
    gridTemplateColumns: '1.25fr 1fr',
    overflow: 'hidden'
  },
  listCol: {
    borderRight: '1px solid #e2e8f0',
    overflowY: 'auto',
    padding: '1.25rem'
  },
  tipsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.85rem'
  },
  tipItemCard: {
    borderRadius: '12px',
    border: '1.5px solid #e2e8f0',
    padding: '1rem 1.15rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem',
    transition: 'all 0.2s ease'
  },
  tipItemTop: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '0.5rem'
  },
  categoryBadge: {
    fontSize: '0.72rem',
    fontWeight: '800',
    padding: '0.15rem 0.5rem',
    borderRadius: '6px',
    border: '1px solid transparent',
    textTransform: 'uppercase',
    letterSpacing: '0.04em'
  },
  durationBadge: {
    fontSize: '0.72rem',
    fontWeight: '700',
    color: '#64748b',
    backgroundColor: '#f1f5f9',
    padding: '0.15rem 0.45rem',
    borderRadius: '6px'
  },
  inactiveBadge: {
    fontSize: '0.72rem',
    fontWeight: '800',
    color: '#dc2626',
    backgroundColor: '#fee2e2',
    padding: '0.15rem 0.45rem',
    borderRadius: '6px'
  },
  itemActionGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.3rem'
  },
  iconBtn: {
    padding: '0.35rem',
    borderRadius: '6px',
    backgroundColor: '#f1f5f9',
    border: '1px solid #e2e8f0',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  tipItemTitle: {
    fontSize: '0.95rem',
    color: '#0f172a',
    margin: 0
  },
  tipItemText: {
    fontSize: '0.82rem',
    color: '#475569',
    margin: 0,
    lineHeight: 1.5
  },
  formCol: {
    padding: '1.5rem',
    overflowY: 'auto',
    backgroundColor: '#fafafa'
  },
  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: '14px',
    border: '1px solid #cbd5e1',
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
  },
  formHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: '0.75rem',
    borderBottom: '1px solid #e2e8f0'
  },
  formBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.85rem'
  },
  label: {
    display: 'block',
    fontSize: '0.78rem',
    fontWeight: '800',
    color: '#334155',
    marginBottom: '0.3rem',
    textTransform: 'uppercase',
    letterSpacing: '0.04em'
  },
  input: {
    width: '100%',
    padding: '0.55rem 0.8rem',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    fontSize: '0.85rem',
    color: '#0f172a',
    outline: 'none',
    boxSizing: 'border-box'
  },
  textarea: {
    width: '100%',
    padding: '0.55rem 0.8rem',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    fontSize: '0.85rem',
    color: '#0f172a',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    lineHeight: 1.5
  },
  select: {
    width: '100%',
    padding: '0.55rem 0.8rem',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    fontSize: '0.85rem',
    color: '#0f172a',
    outline: 'none',
    backgroundColor: '#ffffff',
    boxSizing: 'border-box'
  },
  formFooter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '0.6rem',
    paddingTop: '0.75rem',
    borderTop: '1px solid #e2e8f0'
  },
  emptyFormState: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem'
  },
  loadingBox: {
    textAlign: 'center',
    padding: '3rem',
    color: '#64748b'
  },
  emptyBox: {
    textAlign: 'center',
    padding: '3rem',
    color: '#94a3b8',
    fontSize: '0.9rem'
  }
};
