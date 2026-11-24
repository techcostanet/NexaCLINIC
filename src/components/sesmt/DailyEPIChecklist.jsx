import React, { useState, useEffect, useRef } from 'react';
import { dbService } from '../../firebase';
import { 
  Save, 
  CheckCircle2, 
  AlertTriangle, 
  LayoutGrid, 
  Table, 
  ShieldCheck, 
  CheckCheck,
  Camera,
  Paperclip,
  X,
  Mail,
  RotateCcw,
  Loader2
} from 'lucide-react';
import SignaturePad from './SignaturePad';
import { SESMT_SECTORS, getSectorDefaultEmails } from '../../data/sesmtConstants';
import { compressImage } from '../../utils/imageCompressor';

const SECTORS = SESMT_SECTORS;

const SHIFTS = [
  '1º Turno (Manhã)',
  '2º Turno (Tarde)',
  '3º Turno (Noite)'
];

const ITEMS = [
  { id: 'uso_epi', label: 'Uso adequado do EPI' },
  { id: 'higienizacao', label: 'Higienização das mãos' },
  { id: 'descarte', label: 'Descarte de resíduos' },
  { id: 'conservacao', label: 'Conservação e armazenamento de EPI' },
  { id: 'limpeza_ralos', label: 'Condições e limpeza dos ralos' },
  { id: 'ausencia_adornos', label: 'Ausência de adornos durante as atividades' },
  { id: 'uso_cilios', label: 'Uso adequado de cílios, sem comprometer as condições de higiene e segurança' },
  { id: 'bancadas_superficies', label: 'Bancadas e superfícies limpas e organizadas' },
  { id: 'produtos_quimicos', label: 'Produtos químicos identificados e armazenados corretamente' },
  { id: 'fds_quimicos', label: 'FDS disponíveis para os produtos químicos aplicáveis' },
  { id: 'condicoes_unhas', label: 'Condições e comprimento das unhas, conforme os requisitos de higiene' }
];

export default function DailyEPIChecklist({ onSuccess }) {
  const initialEmails = getSectorDefaultEmails(SECTORS[0]);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().substring(0, 5),
    shift: SHIFTS[0],
    sector: SECTORS[0],
    enfermeiro: '',
    tecnicoSeguranca: '',
    signature: '',
    photo: '',
    photoSize: 0,
    email1: initialEmails.email1 || '',
    email2: initialEmails.email2 || '',
    sendEmailAlert: true,
    evaluations: ITEMS.reduce((acc, item) => ({
      ...acc,
      [item.id]: { status: 'C', observation: '' }
    }), {})
  });

  const [loading, setLoading] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [message, setMessage] = useState('');
  const [viewMode, setViewMode] = useState('cards');

  const cameraInputRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (window.innerWidth >= 1024) {
      setViewMode('table');
    } else {
      setViewMode('cards');
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'sector') {
      const defEmails = getSectorDefaultEmails(value);
      setFormData(prev => ({
        ...prev,
        sector: value,
        email1: defEmails.email1 || '',
        email2: defEmails.email2 || ''
      }));
      return;
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEvaluationChange = (itemId, field, value) => {
    setFormData(prev => ({
      ...prev,
      evaluations: {
        ...prev.evaluations,
        [itemId]: {
          ...prev.evaluations[itemId],
          [field]: value
        }
      }
    }));
  };

  // Marcar todos os itens como Conforme
  const handleSetAllConform = () => {
    setFormData(prev => ({
      ...prev,
      evaluations: ITEMS.reduce((acc, item) => ({
        ...acc,
        [item.id]: { ...prev.evaluations[item.id], status: 'C' }
      }), {})
    }));
  };

  const handleResetEmails = () => {
    const defEmails = getSectorDefaultEmails(formData.sector);
    setFormData(prev => ({
      ...prev,
      email1: defEmails.email1 || '',
      email2: defEmails.email2 || ''
    }));
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCompressing(true);
    setMessage('');
    try {
      const compressed = await compressImage(file, 1280, 1280, 0.75);
      setFormData(prev => ({
        ...prev,
        photo: compressed.dataUrl,
        photoSize: compressed.sizeBytes
      }));
    } catch (err) {
      console.error('Erro ao processar imagem de EPI:', err);
      setMessage('Falha ao processar a foto. Tente novamente.');
    } finally {
      setCompressing(false);
      if (cameraInputRef.current) cameraInputRef.current.value = '';
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemovePhoto = () => {
    setFormData(prev => ({
      ...prev,
      photo: '',
      photoSize: 0
    }));
  };

  let totalNC = 0;
  Object.values(formData.evaluations || {}).forEach(ev => {
    if (ev.status === 'NC') totalNC++;
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validação obrigatória: Foto se houver Não Conformidade
    if (totalNC > 0 && !formData.photo) {
      setMessage('Para registrar itens Não Conformes, é obrigatório anexar uma foto comprobatória.');
      return;
    }

    setLoading(true);
    setMessage('');
    try {
      await dbService.saveEpiInspection({
        ...formData,
        createdAt: new Date().toISOString()
      });
      setMessage('Checklist de EPI salvo com sucesso!');
      
      // Reset
      const defEmails = getSectorDefaultEmails(formData.sector);
      setFormData(prev => ({
        ...prev,
        photo: '',
        photoSize: 0,
        email1: defEmails.email1 || '',
        email2: defEmails.email2 || '',
        signature: ''
      }));

      if (onSuccess) onSuccess();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error(error);
      setMessage('Erro ao salvar checklist.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.card}>
      {/* Cabeçalho */}
      <div style={styles.header}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldCheck size={20} color="#0891b2" />
            <h2 style={styles.cardTitle}>Checklist Diário de EPI</h2>
          </div>
          <p style={styles.cardSubtitle}>
            Verificação diária de conformidade e segurança em setores clínicos.
          </p>
        </div>

        <div style={styles.headerActions}>
          <div style={styles.viewToggleGroup}>
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              style={{ ...styles.viewToggleBtn, ...(viewMode === 'cards' ? styles.viewToggleBtnActive : {}) }}
              title="Modo Cartões (ideal para celular e tablet)"
            >
              <LayoutGrid size={15} /> Cartões
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              style={{ ...styles.viewToggleBtn, ...(viewMode === 'table' ? styles.viewToggleBtnActive : {}) }}
              title="Modo Tabela (ideal para computador)"
            >
              <Table size={15} /> Tabela
            </button>
          </div>
        </div>
      </div>
      
      {message && (
        <div style={{ ...styles.alert, backgroundColor: message.includes('Erro') || message.includes('obrigatório') ? '#fef2f2' : '#f0fdf4', color: message.includes('Erro') || message.includes('obrigatório') ? '#991b1b' : '#166534', border: `1px solid ${message.includes('Erro') || message.includes('obrigatório') ? '#f87171' : '#4ade80'}` }}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} style={styles.form}>
        {/* Dados Básicos */}
        <div style={styles.grid4}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Data</label>
            <input 
              type="date" 
              name="date"
              value={formData.date}
              onChange={handleChange}
              style={styles.input}
              required 
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Horário</label>
            <input 
              type="time" 
              name="time"
              value={formData.time}
              onChange={handleChange}
              style={styles.input}
              required 
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Turno</label>
            <select 
              name="shift"
              value={formData.shift}
              onChange={handleChange}
              style={styles.input}
            >
              {SHIFTS.map(shift => (
                <option key={shift} value={shift}>{shift}</option>
              ))}
            </select>
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Setor</label>
            <select 
              name="sector"
              value={formData.sector}
              onChange={handleChange}
              style={styles.input}
            >
              {SECTORS.map(sector => (
                <option key={sector} value={sector}>{sector}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Barra de ação rápida */}
        <div style={styles.quickBar}>
          <button
            type="button"
            onClick={handleSetAllConform}
            style={styles.quickConformBtn}
          >
            <CheckCheck size={16} /> Conformes
          </button>
          <span style={styles.quickStatText}>
            {totalNC === 0 ? '✓ 100% Conforme' : `⚠ ${totalNC} item(ns) não conforme(s)`}
          </span>
        </div>

        {/* 1. Modo Cartões Touch (Mobile / Tablet) */}
        {viewMode === 'cards' && (
          <div style={styles.cardsGrid}>
            {ITEMS.map(item => {
              const evalData = formData.evaluations[item.id] || { status: 'C', observation: '' };
              const isC = evalData.status === 'C';
              const isNC = evalData.status === 'NC';
              const isNA = evalData.status === 'NA';

              return (
                <div 
                  key={item.id} 
                  style={{
                    ...styles.itemCard,
                    borderColor: isNC ? '#fca5a5' : '#e2e8f0',
                    backgroundColor: isNC ? '#fffaf0' : '#ffffff'
                  }}
                >
                  <div style={styles.itemCardHeader}>
                    <span style={styles.itemLabel}>{item.label}</span>
                    <span style={{
                      ...styles.statusBadge,
                      backgroundColor: isC ? '#dcfce7' : isNC ? '#fee2e2' : '#f1f5f9',
                      color: isC ? '#15803d' : isNC ? '#b91c1c' : '#475569'
                    }}>
                      {isC ? 'Conforme' : isNC ? 'Não Conforme' : 'Não Avaliado'}
                    </span>
                  </div>

                  {/* Botões Touch Segmentados */}
                  <div style={styles.touchButtonsRow}>
                    <button
                      type="button"
                      onClick={() => handleEvaluationChange(item.id, 'status', 'C')}
                      style={{
                        ...styles.touchPill,
                        ...(isC ? styles.touchPillCActive : styles.touchPillInactive)
                      }}
                    >
                      <CheckCircle2 size={15} /> Conforme (C)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleEvaluationChange(item.id, 'status', 'NC')}
                      style={{
                        ...styles.touchPill,
                        ...(isNC ? styles.touchPillNCActive : styles.touchPillInactive)
                      }}
                    >
                      <AlertTriangle size={15} /> Não Conforme (NC)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleEvaluationChange(item.id, 'status', 'NA')}
                      style={{
                        ...styles.touchPill,
                        ...(isNA ? styles.touchPillNAActive : styles.touchPillInactive)
                      }}
                    >
                      Não Avaliado (NA)
                    </button>
                  </div>

                  {/* Observações */}
                  <div style={{ marginTop: '0.25rem' }}>
                    <input 
                      type="text" 
                      value={evalData.observation}
                      onChange={(e) => handleEvaluationChange(item.id, 'observation', e.target.value)}
                      placeholder="Observações do item (se houver)..."
                      style={styles.inputObservation}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 2. Modo Tabela (Desktop) */}
        {viewMode === 'table' && (
          <div style={styles.tableResponsive}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Item</th>
                  <th style={{ ...styles.th, textAlign: 'center', width: '220px' }}>Avaliação</th>
                  <th style={styles.th}>Observações</th>
                </tr>
              </thead>
              <tbody>
                {ITEMS.map(item => (
                  <tr key={item.id} style={styles.tr}>
                    <td style={styles.td}>
                      <strong>{item.label}</strong>
                    </td>
                    <td style={{ ...styles.td, textAlign: 'center' }}>
                      <div style={styles.radioGroup}>
                        <label style={styles.radioLabel}>
                          <input 
                            type="radio" 
                            name={`status_${item.id}`} 
                            value="C"
                            checked={formData.evaluations[item.id].status === 'C'}
                            onChange={(e) => handleEvaluationChange(item.id, 'status', e.target.value)}
                          />
                          <span style={{ color: '#16a34a', fontWeight: 'bold' }} title="Conforme">C</span>
                        </label>
                        <label style={styles.radioLabel}>
                          <input 
                            type="radio" 
                            name={`status_${item.id}`} 
                            value="NC"
                            checked={formData.evaluations[item.id].status === 'NC'}
                            onChange={(e) => handleEvaluationChange(item.id, 'status', e.target.value)}
                          />
                          <span style={{ color: '#dc2626', fontWeight: 'bold' }} title="Não Conforme">NC</span>
                        </label>
                        <label style={styles.radioLabel}>
                          <input 
                            type="radio" 
                            name={`status_${item.id}`} 
                            value="NA"
                            checked={formData.evaluations[item.id].status === 'NA'}
                            onChange={(e) => handleEvaluationChange(item.id, 'status', e.target.value)}
                          />
                          <span style={{ color: '#6b7280', fontWeight: 'bold' }} title="Não Avaliado">NA</span>
                        </label>
                      </div>
                    </td>
                    <td style={styles.td}>
                      <input 
                        type="text" 
                        value={formData.evaluations[item.id].observation}
                        onChange={(e) => handleEvaluationChange(item.id, 'observation', e.target.value)}
                        placeholder="Observações..."
                        style={styles.input}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Bloco de Não Conformidade (Exibido se houver ao menos 1 item NC) */}
        {totalNC > 0 && (
          <div style={styles.ncContainer}>
            {/* Foto Obrigatória */}
            <div style={styles.photoSection}>
              <div style={styles.photoHeader}>
                <div>
                  <label style={styles.labelSection}>Evidência Fotográfica</label>
                  <span style={styles.photoSubtext}>
                    Obrigatório no registro de Não Conformidade ({totalNC} item(ns) reprovado(s)).
                  </span>
                </div>
                <input 
                  type="file" 
                  ref={cameraInputRef} 
                  accept="image/*" 
                  capture="environment" 
                  style={{ display: 'none' }} 
                  onChange={handlePhotoUpload} 
                />
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  accept="image/*" 
                  style={{ display: 'none' }} 
                  onChange={handlePhotoUpload} 
                />
                <div style={styles.iconButtonsGroup}>
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    disabled={compressing}
                    style={styles.iconActionBtn}
                    title="Tirar foto com a câmera do tablet"
                  >
                    <Camera size={22} color="#0891b2" />
                  </button>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={compressing}
                    style={styles.iconActionBtn}
                    title="Anexar foto da galeria"
                  >
                    <Paperclip size={22} color="#0284c7" />
                  </button>
                </div>
              </div>

              {compressing && (
                <div style={styles.compressingBox}>
                  <Loader2 size={18} className="animate-spin" color="#0891b2" />
                  <span>Otimizando imagem para alta velocidade...</span>
                </div>
              )}

              {formData.photo ? (
                <div style={styles.photoPreviewCard}>
                  <div style={styles.photoWrapper}>
                    <img src={formData.photo} alt="Foto da Evidência EPI" style={styles.photoImg} />
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      style={styles.photoRemoveBtn}
                      title="Excluir foto"
                    >
                      <X size={16} color="#ffffff" />
                    </button>
                  </div>
                  <div style={styles.photoMeta}>
                    <span style={styles.photoBadgeSuccess}>✓ Evidência Anexada</span>
                    <span style={styles.photoSizeText}>
                      Tamanho otimizado: {Math.round((formData.photoSize || 0) / 1024)} KB
                    </span>
                  </div>
                </div>
              ) : (
                <div style={styles.photoRequiredAlert}>
                  <AlertTriangle size={18} color="#dc2626" />
                  <span>Foto comprobatória pendente. Clique na <strong>Câmera</strong> ou no <strong>Anexo</strong> acima.</span>
                </div>
              )}
            </div>

            {/* Notificação por E-mail */}
            <div style={styles.emailBox}>
              <div style={styles.emailHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Mail size={18} color="#0284c7" />
                  <label style={{ ...styles.labelSection, margin: 0 }}>Notificação por E-mail</label>
                </div>
                <button
                  type="button"
                  onClick={handleResetEmails}
                  style={styles.resetEmailBtn}
                  title="Restaurar e-mails sugeridos para este setor"
                >
                  <RotateCcw size={13} />
                  <span>Restaurar</span>
                </button>
              </div>
              <span style={styles.emailSubtext}>
                E-mails sugeridos automaticamente para o setor <strong>{formData.sector}</strong>.
              </span>
              <div style={styles.emailGrid}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>E-mail 1</label>
                  <input 
                    type="email" 
                    name="email1" 
                    placeholder="ex.: lideranca@dialize.com.br"
                    value={formData.email1} 
                    onChange={handleChange} 
                    style={styles.input} 
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>E-mail 2</label>
                  <input 
                    type="email" 
                    name="email2" 
                    placeholder="ex.: sesmt@dialize.com.br"
                    value={formData.email2} 
                    onChange={handleChange} 
                    style={styles.input} 
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Responsáveis e Assinatura Touch */}
        <div style={styles.signaturesSection}>
          <div style={styles.grid2}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Enfermeiro</label>
              <input 
                type="text" 
                name="enfermeiro"
                value={formData.enfermeiro}
                onChange={handleChange}
                style={styles.input}
                placeholder="Nome do enfermeiro"
                required 
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Técnico</label>
              <input 
                type="text" 
                name="tecnicoSeguranca"
                value={formData.tecnicoSeguranca}
                onChange={handleChange}
                style={styles.input}
                placeholder="Nome do técnico"
                required 
              />
            </div>
          </div>

          {/* Assinatura Digital Touch */}
          <SignaturePad 
            value={formData.signature}
            onChange={(sig) => setFormData(prev => ({ ...prev, signature: sig }))}
            label="Assinatura"
            placeholder="Assine com o dedo ou caneta touch no celular ou tablet"
          />
        </div>

        <div style={styles.actions}>
          <button 
            type="submit" 
            disabled={loading || compressing}
            style={(loading || compressing) ? {...styles.btnPrimary, opacity: 0.7} : styles.btnPrimary}
          >
            <Save size={18} />
            <span>{loading ? 'Salvando...' : 'Salvar'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

const styles = {
  card: {
    backgroundColor: '#ffffff',
    padding: '1.25rem',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    border: '1px solid #e2e8f0',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.25rem',
    flexWrap: 'wrap',
    gap: '0.75rem'
  },
  cardTitle: {
    fontSize: '1.2rem',
    fontWeight: '800',
    color: '#0f172a',
    margin: 0
  },
  cardSubtitle: {
    margin: 0,
    fontSize: '0.82rem',
    color: '#64748b'
  },
  headerActions: {
    display: 'flex',
    gap: '0.75rem'
  },
  viewToggleGroup: {
    display: 'flex',
    backgroundColor: '#f1f5f9',
    borderRadius: '8px',
    padding: '3px',
    border: '1px solid #e2e8f0'
  },
  viewToggleBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    padding: '0.4rem 0.75rem',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: 'transparent',
    color: '#64748b',
    fontSize: '0.8rem',
    fontWeight: '600',
    cursor: 'pointer'
  },
  viewToggleBtnActive: {
    backgroundColor: '#ffffff',
    color: '#0891b2',
    boxShadow: '0 1px 2px rgba(0,0,0,0.08)'
  },
  alert: {
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    marginBottom: '1.25rem',
    fontSize: '0.85rem',
    fontWeight: '600'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem'
  },
  grid4: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '1rem'
  },
  grid2: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '1rem'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem'
  },
  label: {
    fontSize: '0.8rem',
    fontWeight: '600',
    color: '#475569'
  },
  labelSection: {
    fontSize: '0.875rem',
    fontWeight: '700',
    color: '#0f172a',
    display: 'block',
    marginBottom: '0.35rem'
  },
  input: {
    padding: '0.55rem 0.75rem',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    backgroundColor: '#f8fafc',
    color: '#0f172a',
    fontSize: '0.85rem'
  },
  quickBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.65rem 1rem',
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    flexWrap: 'wrap',
    gap: '0.5rem'
  },
  quickConformBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    padding: '0.45rem 0.85rem',
    borderRadius: '6px',
    backgroundColor: '#dcfce7',
    color: '#15803d',
    border: '1px solid #bbf7d0',
    fontSize: '0.8rem',
    fontWeight: '700',
    cursor: 'pointer'
  },
  quickStatText: {
    fontSize: '0.82rem',
    fontWeight: '700',
    color: '#0f172a'
  },
  cardsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '0.85rem'
  },
  itemCard: {
    padding: '0.85rem',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.65rem',
    transition: 'all 0.15s ease'
  },
  itemCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '0.5rem'
  },
  itemLabel: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#0f172a',
    lineHeight: '1.3'
  },
  statusBadge: {
    fontSize: '0.72rem',
    fontWeight: '700',
    padding: '0.2rem 0.5rem',
    borderRadius: '4px',
    flexShrink: 0
  },
  touchButtonsRow: {
    display: 'flex',
    gap: '0.4rem'
  },
  touchPill: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.35rem',
    padding: '0.5rem 0.35rem',
    borderRadius: '6px',
    border: '1px solid',
    fontSize: '0.75rem',
    fontWeight: '700',
    cursor: 'pointer'
  },
  touchPillInactive: {
    backgroundColor: '#f8fafc',
    borderColor: '#e2e8f0',
    color: '#64748b'
  },
  touchPillCActive: {
    backgroundColor: '#dcfce7',
    borderColor: '#86efac',
    color: '#15803d'
  },
  touchPillNCActive: {
    backgroundColor: '#fee2e2',
    borderColor: '#fca5a5',
    color: '#b91c1c'
  },
  touchPillNAActive: {
    backgroundColor: '#f1f5f9',
    borderColor: '#cbd5e1',
    color: '#475569'
  },
  inputObservation: {
    width: '100%',
    padding: '0.45rem 0.65rem',
    borderRadius: '4px',
    border: '1px solid #cbd5e1',
    fontSize: '0.8rem',
    backgroundColor: '#ffffff',
    color: '#0f172a',
    boxSizing: 'border-box'
  },
  tableResponsive: {
    overflowX: 'auto',
    border: '1px solid #e2e8f0',
    borderRadius: '8px'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.85rem'
  },
  th: {
    backgroundColor: '#f8fafc',
    padding: '0.75rem 1rem',
    textAlign: 'left',
    fontWeight: '700',
    color: '#475569',
    borderBottom: '1px solid #e2e8f0'
  },
  tr: {
    borderBottom: '1px solid #f1f5f9'
  },
  td: {
    padding: '0.65rem 1rem'
  },
  radioGroup: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'center'
  },
  radioLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    cursor: 'pointer'
  },
  ncContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    padding: '1rem',
    backgroundColor: '#fffaf0',
    borderRadius: '10px',
    border: '1px solid #fed7aa'
  },
  photoSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    padding: '1rem',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    border: '1px solid #fecaca'
  },
  photoHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '0.75rem'
  },
  photoSubtext: {
    fontSize: '0.75rem',
    color: '#64748b',
    display: 'block'
  },
  iconButtonsGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  iconActionBtn: {
    width: '46px',
    height: '46px',
    borderRadius: '10px',
    border: '1.5px solid #cbd5e1',
    backgroundColor: '#f8fafc',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.15s ease'
  },
  compressingBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 0.75rem',
    backgroundColor: '#ecfeff',
    color: '#0891b2',
    borderRadius: '6px',
    fontSize: '0.8rem'
  },
  photoPreviewCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '0.75rem',
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    flexWrap: 'wrap'
  },
  photoWrapper: {
    position: 'relative',
    width: '120px',
    height: '90px',
    borderRadius: '8px',
    overflow: 'hidden',
    border: '1px solid #cbd5e1',
    flexShrink: 0
  },
  photoImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  photoRemoveBtn: {
    position: 'absolute',
    top: '4px',
    right: '4px',
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    backgroundColor: '#ef4444',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    boxShadow: '0 1px 4px rgba(0,0,0,0.3)'
  },
  photoMeta: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem'
  },
  photoBadgeSuccess: {
    fontSize: '0.75rem',
    fontWeight: '700',
    color: '#15803d',
    backgroundColor: '#dcfce7',
    padding: '0.2rem 0.5rem',
    borderRadius: '4px',
    alignSelf: 'flex-start'
  },
  photoSizeText: {
    fontSize: '0.75rem',
    color: '#64748b'
  },
  photoRequiredAlert: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.65rem 0.85rem',
    backgroundColor: '#fef2f2',
    border: '1px dashed #ef4444',
    borderRadius: '6px',
    color: '#b91c1c',
    fontSize: '0.8rem',
    fontWeight: '600'
  },
  emailBox: {
    padding: '1rem',
    borderRadius: '8px',
    backgroundColor: '#ffffff',
    border: '1px solid #bae6fd',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem'
  },
  emailHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  resetEmailBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    border: '1px solid #cbd5e1',
    backgroundColor: '#f8fafc',
    color: '#475569',
    fontSize: '0.75rem',
    fontWeight: '600',
    cursor: 'pointer'
  },
  emailSubtext: {
    fontSize: '0.75rem',
    color: '#64748b'
  },
  emailGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '0.75rem'
  },
  signaturesSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    paddingTop: '0.5rem'
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    paddingTop: '0.5rem'
  },
  btnPrimary: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem 1.75rem',
    borderRadius: '8px',
    backgroundColor: '#0891b2',
    color: '#ffffff',
    border: 'none',
    fontWeight: '700',
    fontSize: '0.9rem',
    cursor: 'pointer',
    boxShadow: '0 2px 6px rgba(8, 145, 178, 0.25)'
  }
};
