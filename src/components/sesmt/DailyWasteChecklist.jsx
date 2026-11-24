import React, { useState, useEffect, useRef } from 'react';
import { dbService } from '../../firebase';
import { 
  Save, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Trash2, 
  AlertOctagon, 
  Send, 
  Check, 
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

const WASTE_ITEMS = [
  { id: 'saco_branco', label: 'Saco branco regulamentar com identificação de risco infectante' },
  { id: 'lixeira_pedal', label: 'Lixeira íntegra acionada por pedal funcionando e tampa vedando' },
  { id: 'limite_dois_tercos', label: 'Limite máximo de preenchimento até 2/3 (sem transbordo)' },
  { id: 'perfuro_segregado', label: 'Ausência de perfurocortantes soltos no saco de lixo' },
  { id: 'sem_lixo_comum', label: 'Ausência de resíduo comum misturado ao lixo infectante' },
  { id: 'sem_extravasamento', label: 'Ausência de linhas ou dialisadores vazando no piso/bancada' },
  { id: 'higienizacao_lixeira', label: 'Higienização e desinfecção periódica do recipiente' }
];

export default function DailyWasteChecklist({ onSuccess, existingInspections = [] }) {
  const initialEmails = getSectorDefaultEmails(SECTORS[0]);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().substring(0, 5),
    shift: SHIFTS[0],
    sector: SECTORS[0],
    status: 'CONFORME', // 'CONFORME' | 'NAO_CONFORME'
    auditor: '',
    signature: '',
    deviations: [],
    immediateAction: '',
    notifyAssist: true,
    photo: '',
    photoSize: 0,
    email1: initialEmails.email1 || '',
    email2: initialEmails.email2 || '',
    sendEmailAlert: true
  });

  const [loading, setLoading] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [message, setMessage] = useState('');

  const cameraInputRef = useRef(null);
  const fileInputRef = useRef(null);

  // Calcula estatística do setor selecionado no mês da data atual (SM-015)
  const currentMonth = (formData.date || '').substring(0, 7);
  const sectorMonthInspections = (existingInspections || []).filter(i => 
    (i.date || '').startsWith(currentMonth) && 
    (i.sector || '').toLowerCase() === (formData.sector || '').toLowerCase()
  );
  const sectorTotal = sectorMonthInspections.length;
  const sectorNC = sectorMonthInspections.filter(i => i.status === 'NAO_CONFORME').length;
  const sectorNCRate = sectorTotal > 0 ? Math.round((sectorNC / sectorTotal) * 100) : 0;
  const isHighRisk = sectorTotal >= 3 && sectorNCRate >= 50;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
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

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const toggleDeviation = (label) => {
    setFormData(prev => {
      const exists = prev.deviations.includes(label);
      const updated = exists 
        ? prev.deviations.filter(d => d !== label)
        : [...prev.deviations, label];
      return {
        ...prev,
        deviations: updated,
        status: updated.length > 0 ? 'NAO_CONFORME' : prev.status
      };
    });
  };

  const setStatus = (newStatus) => {
    setFormData(prev => {
      const defEmails = getSectorDefaultEmails(prev.sector);
      return {
        ...prev,
        status: newStatus,
        deviations: newStatus === 'CONFORME' ? [] : prev.deviations,
        email1: prev.email1 || defEmails.email1 || '',
        email2: prev.email2 || defEmails.email2 || ''
      };
    });
  };

  const handleResetEmails = () => {
    const defEmails = getSectorDefaultEmails(formData.sector);
    setFormData(prev => ({
      ...prev,
      email1: defEmails.email1 || '',
      email2: defEmails.email2 || ''
    }));
  };

  // Captura e compressão de foto otimizada para tablet
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
      console.error('Erro ao processar imagem:', err);
      setMessage('Falha ao processar a foto. Tente novamente.');
    } finally {
      setCompressing(false);
      // Limpa os inputs para permitir nova seleção do mesmo arquivo se necessário
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.auditor.trim()) {
      setMessage('Informe o nome do auditor responsável.');
      return;
    }

    // Regra Obrigatória: Foto comprovatória exigida para Não Conformidade
    if (formData.status === 'NAO_CONFORME' && !formData.photo) {
      setMessage('Para registrar uma Não Conformidade, é obrigatório anexar uma foto comprobatória.');
      return;
    }

    setLoading(true);
    setMessage('');
    try {
      await dbService.saveWasteInspection({
        ...formData,
        unitId: 'betim'
      });
      setMessage('Vistoria de resíduos infectantes gravada com sucesso!');
      
      // Reset formulário mantendo auditor e restaurando e-mails padrão
      const defEmails = getSectorDefaultEmails(formData.sector);
      setFormData(prev => ({
        ...prev,
        status: 'CONFORME',
        deviations: [],
        immediateAction: '',
        signature: '',
        photo: '',
        photoSize: 0,
        email1: defEmails.email1 || '',
        email2: defEmails.email2 || ''
      }));

      if (onSuccess) onSuccess();
      setTimeout(() => setMessage(''), 3500);
    } catch (error) {
      console.error('Erro ao salvar vistoria de resíduos:', error);
      setMessage('Erro ao gravar vistoria no sistema.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.card}>
      {/* Cabeçalho */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.iconCircle}>
            <Trash2 size={24} color="#059669" />
          </div>
          <div>
            <h2 style={styles.title}>Vistoria de Resíduos</h2>
            <p style={styles.subtitle}>Auditoria técnica de segregação e descarte de lixo infectante (RDC 222 / NR-32)</p>
          </div>
        </div>
        <div style={styles.badgeNorma}>
          <ShieldCheck size={14} color="#059669" />
          <span>PGRSS</span>
        </div>
      </div>

      {/* SM-015: Card de Alerta Crítico para Setores com Não Conformidade > 50% */}
      {isHighRisk && (
        <div style={styles.alertCritical}>
          <AlertOctagon size={20} color="#b91c1c" />
          <div style={{ flex: 1 }}>
            <strong style={{ color: '#991b1b', display: 'block', fontSize: '0.875rem' }}>
              Alerta Crítico: {formData.sector} com {sectorNCRate}% de Não Conformidade neste mês!
            </strong>
            <span style={{ color: '#7f1d1d', fontSize: '0.8rem' }}>
              Foram registradas {sectorNC} não conformidades em {sectorTotal} vistorias. Recomenda-se orientação emergencial e reciclagem da equipe deste salão/turno.
            </span>
          </div>
        </div>
      )}

      {message && (
        <div style={{
          ...styles.messageBox,
          backgroundColor: message.includes('sucesso') ? '#ecfdf5' : '#fef2f2',
          borderColor: message.includes('sucesso') ? '#10b981' : '#ef4444',
          color: message.includes('sucesso') ? '#065f46' : '#991b1b'
        }}>
          {message.includes('sucesso') ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
          <span>{message}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} style={styles.form}>
        {/* Metadados da Vistoria */}
        <div style={styles.gridFields}>
          <div style={styles.fieldGroup}>
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

          <div style={styles.fieldGroup}>
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

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Turno</label>
            <select 
              name="shift" 
              value={formData.shift} 
              onChange={handleChange} 
              style={styles.select}
            >
              {SHIFTS.map(sh => (
                <option key={sh} value={sh}>{sh}</option>
              ))}
            </select>
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Local</label>
            <select 
              name="sector" 
              value={formData.sector} 
              onChange={handleChange} 
              style={styles.select}
            >
              {SECTORS.map(sec => (
                <option key={sec} value={sec}>{sec}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Seletor de Resultado Principal (Conforme vs Não Conforme) */}
        <div style={styles.resultBox}>
          <label style={styles.labelSection}>Resultado da Vistoria</label>
          <div style={styles.resultButtons}>
            <button
              type="button"
              onClick={() => setStatus('CONFORME')}
              style={{
                ...styles.resultBtn,
                ...(formData.status === 'CONFORME' ? styles.resultBtnConformActive : {})
              }}
            >
              <CheckCircle2 size={18} />
              <span>Conforme</span>
            </button>

            <button
              type="button"
              onClick={() => setStatus('NAO_CONFORME')}
              style={{
                ...styles.resultBtn,
                ...(formData.status === 'NAO_CONFORME' ? styles.resultBtnNotConformActive : {})
              }}
            >
              <AlertTriangle size={18} />
              <span>Não Conforme</span>
            </button>
          </div>
        </div>

        {/* Itens de Checagem RDC 222 / NR-32 */}
        <div style={styles.itemsCard}>
          <div style={styles.itemsCardHeader}>
            <label style={{ ...styles.labelSection, marginBottom: 0 }}>
              {formData.status === 'NAO_CONFORME' ? 'Desvios Identificados (Selecione)' : 'Requisitos Inspecionados'}
            </label>
            {formData.status === 'NAO_CONFORME' && (
              <span style={styles.subtextWarning}>Marque os itens reprovados na vistoria</span>
            )}
          </div>

          <div style={styles.itemsList}>
            {WASTE_ITEMS.map((item) => {
              const isChecked = formData.deviations.includes(item.label);
              return (
                <div 
                  key={item.id} 
                  onClick={() => toggleDeviation(item.label)}
                  style={{
                    ...styles.itemRow,
                    ...(isChecked ? styles.itemRowActive : {})
                  }}
                >
                  <div style={{
                    ...styles.checkboxCustom,
                    backgroundColor: isChecked ? '#ef4444' : (formData.status === 'CONFORME' ? '#ecfdf5' : '#f8fafc'),
                    borderColor: isChecked ? '#ef4444' : (formData.status === 'CONFORME' ? '#10b981' : '#cbd5e1')
                  }}>
                    {isChecked ? (
                      <AlertTriangle size={13} color="#ffffff" />
                    ) : (
                      formData.status === 'CONFORME' && <Check size={13} color="#10b981" />
                    )}
                  </div>
                  <span style={{
                    ...styles.itemLabel,
                    color: isChecked ? '#991b1b' : 'var(--text-primary)',
                    fontWeight: isChecked ? '600' : '500'
                  }}>
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bloco Exclusivo de Não Conformidade (Foto Obrigatória, Ação e E-mails) */}
        {formData.status === 'NAO_CONFORME' && (
          <div style={styles.ncContainer}>
            {/* 1. Registro Fotográfico Obrigatório */}
            <div style={styles.photoSection}>
              <div style={styles.photoHeader}>
                <div>
                  <label style={styles.labelSection}>Evidência Fotográfica</label>
                  <span style={styles.photoSubtext}>
                    Obrigatório no registro de Não Conformidade. Utilize a câmera do tablet ou anexe da galeria.
                  </span>
                </div>
                {/* Inputs Ocultos */}
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

                {/* Botões de Ação Touch (Somente Ícones com Tooltip para Tablet) */}
                <div style={styles.iconButtonsGroup}>
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    disabled={compressing}
                    style={styles.iconActionBtn}
                    title="Tirar foto com a câmera do tablet"
                  >
                    <Camera size={22} color="#059669" />
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
                  <Loader2 size={18} className="animate-spin" color="#059669" />
                  <span>Otimizando imagem para alta velocidade...</span>
                </div>
              )}

              {/* Preview da Foto Capturada */}
              {formData.photo ? (
                <div style={styles.photoPreviewCard}>
                  <div style={styles.photoWrapper}>
                    <img 
                      src={formData.photo} 
                      alt="Evidência Fotográfica da Não Conformidade" 
                      style={styles.photoImg} 
                    />
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      style={styles.photoRemoveBtn}
                      title="Excluir foto para tirar outra"
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
                  <span>Foto comprobatória pendente. Clique na <strong>Câmera</strong> ou no <strong>Anexo</strong> acima para registrar.</span>
                </div>
              )}
            </div>

            {/* 2. Ação Imediata Adotada */}
            <div style={styles.actionBox}>
              <label style={styles.label}>Ação Imediata</label>
              <input 
                type="text" 
                name="immediateAction" 
                placeholder="Ex.: Troca imediata do saco plástico, manutenção no pedal e alinhamento com a equipe"
                value={formData.immediateAction} 
                onChange={handleChange} 
                style={styles.input} 
              />

              {/* Notificação Automática no Feed Assistencial (.ASSIST) */}
              <div style={styles.notifyRow}>
                <label style={styles.notifyLabel}>
                  <input 
                    type="checkbox" 
                    name="notifyAssist" 
                    checked={formData.notifyAssist} 
                    onChange={handleChange} 
                    style={{ accentColor: '#059669', width: '16px', height: '16px' }}
                  />
                  <Send size={15} color="#059669" />
                  <span>Notificar equipe do setor no mural do <strong>.ASSIST</strong></span>
                </label>
              </div>
            </div>

            {/* 3. Disparo Imediato por E-mail (Sugestão 1: Preenchimento Automático por Setor) */}
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
                E-mails sugeridos automaticamente para o setor <strong>{formData.sector}</strong>. Você pode alterar ou informar novos destinatários.
              </span>

              <div style={styles.emailGrid}>
                <div style={styles.fieldGroup}>
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
                <div style={styles.fieldGroup}>
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

        {/* Identificação do Auditor e Rubrica */}
        <div style={styles.gridFooter}>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Auditor</label>
            <input 
              type="text" 
              name="auditor" 
              placeholder="Nome do Auditor ou Técnico de Segurança"
              value={formData.auditor} 
              onChange={handleChange} 
              style={styles.input} 
              required 
            />
          </div>

          <div style={styles.signatureBox}>
            <label style={styles.label}>Assinatura</label>
            <SignaturePad 
              value={formData.signature}
              onChange={(sig) => setFormData(prev => ({ ...prev, signature: sig }))}
            />
          </div>
        </div>

        {/* Botão de Envio */}
        <div style={styles.submitContainer}>
          <button 
            type="submit" 
            disabled={loading || compressing}
            style={{
              ...styles.submitBtn,
              opacity: (loading || compressing) ? 0.7 : 1
            }}
          >
            <Save size={18} />
            <span>{loading ? 'Gravando...' : 'Salvar Vistoria'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

const styles = {
  card: {
    backgroundColor: 'var(--bg-surface, #ffffff)',
    borderRadius: '12px',
    border: '1px solid var(--border-color, #e2e8f0)',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: '1rem',
    borderBottom: '1px solid var(--border-color, #e2e8f0)',
    flexWrap: 'wrap',
    gap: '0.75rem'
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.875rem'
  },
  iconCircle: {
    width: '44px',
    height: '44px',
    borderRadius: '10px',
    backgroundColor: '#ecfdf5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid #a7f3d0'
  },
  title: {
    margin: 0,
    fontSize: '1.15rem',
    fontWeight: '700',
    color: 'var(--text-primary, #0f172a)'
  },
  subtitle: {
    margin: '2px 0 0',
    fontSize: '0.8rem',
    color: 'var(--text-secondary, #64748b)'
  },
  badgeNorma: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    padding: '0.3rem 0.65rem',
    borderRadius: '6px',
    backgroundColor: '#ecfdf5',
    color: '#059669',
    fontSize: '0.75rem',
    fontWeight: '700',
    border: '1px solid #a7f3d0'
  },
  alertCritical: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem',
    padding: '0.875rem 1rem',
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '8px'
  },
  messageBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    border: '1px solid',
    fontSize: '0.85rem',
    fontWeight: '600'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem'
  },
  gridFields: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '1rem'
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem'
  },
  label: {
    fontSize: '0.8rem',
    fontWeight: '600',
    color: 'var(--text-secondary, #475569)'
  },
  labelSection: {
    fontSize: '0.875rem',
    fontWeight: '700',
    color: 'var(--text-primary, #1e293b)',
    display: 'block',
    marginBottom: '0.35rem'
  },
  input: {
    padding: '0.55rem 0.75rem',
    borderRadius: '6px',
    border: '1px solid var(--border-color, #cbd5e1)',
    backgroundColor: 'var(--bg-body, #f8fafc)',
    color: 'var(--text-primary, #0f172a)',
    fontSize: '0.85rem'
  },
  select: {
    padding: '0.55rem 0.75rem',
    borderRadius: '6px',
    border: '1px solid var(--border-color, #cbd5e1)',
    backgroundColor: 'var(--bg-body, #f8fafc)',
    color: 'var(--text-primary, #0f172a)',
    fontSize: '0.85rem'
  },
  resultBox: {
    padding: '1rem',
    borderRadius: '8px',
    backgroundColor: 'var(--bg-body, #f8fafc)',
    border: '1px solid var(--border-color, #e2e8f0)'
  },
  resultButtons: {
    display: 'flex',
    gap: '1rem'
  },
  resultBtn: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    border: '2px solid var(--border-color, #cbd5e1)',
    backgroundColor: '#ffffff',
    color: '#64748b',
    fontWeight: '700',
    fontSize: '0.9rem',
    cursor: 'pointer',
    transition: 'all 0.15s ease'
  },
  resultBtnConformActive: {
    borderColor: '#10b981',
    backgroundColor: '#ecfdf5',
    color: '#065f46',
    boxShadow: '0 2px 6px rgba(16, 185, 129, 0.2)'
  },
  resultBtnNotConformActive: {
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2',
    color: '#991b1b',
    boxShadow: '0 2px 6px rgba(239, 68, 68, 0.2)'
  },
  itemsCard: {
    border: '1px solid var(--border-color, #e2e8f0)',
    borderRadius: '8px',
    padding: '1rem'
  },
  itemsCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.75rem',
    flexWrap: 'wrap',
    gap: '0.5rem'
  },
  subtextWarning: {
    fontSize: '0.75rem',
    color: '#ef4444',
    fontWeight: '600'
  },
  itemsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
  },
  itemRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.6rem 0.8rem',
    borderRadius: '6px',
    backgroundColor: 'var(--bg-body, #f8fafc)',
    border: '1px solid transparent',
    cursor: 'pointer',
    transition: 'all 0.15s ease'
  },
  itemRowActive: {
    backgroundColor: '#fef2f2',
    borderColor: '#fca5a5'
  },
  checkboxCustom: {
    width: '20px',
    height: '20px',
    borderRadius: '4px',
    border: '1.5px solid',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  itemLabel: {
    fontSize: '0.85rem'
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
    backgroundColor: '#ecfdf5',
    color: '#065f46',
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
  actionBox: {
    padding: '1rem',
    borderRadius: '8px',
    backgroundColor: '#ffffff',
    border: '1px solid #fde68a',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem'
  },
  notifyRow: {
    display: 'flex',
    alignItems: 'center',
    marginTop: '0.25rem'
  },
  notifyLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.8rem',
    color: '#92400e',
    cursor: 'pointer'
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
  gridFooter: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: '1rem',
    alignItems: 'start'
  },
  signatureBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem'
  },
  submitContainer: {
    display: 'flex',
    justifyContent: 'flex-end',
    paddingTop: '0.5rem'
  },
  submitBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem 1.75rem',
    borderRadius: '8px',
    backgroundColor: '#059669',
    color: '#ffffff',
    border: 'none',
    fontWeight: '700',
    fontSize: '0.9rem',
    cursor: 'pointer',
    boxShadow: '0 2px 6px rgba(5, 150, 105, 0.25)',
    transition: 'background-color 0.2s'
  }
};
