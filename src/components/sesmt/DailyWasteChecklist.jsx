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
    itemPhotos: {}, // { [itemId]: { photo: string, photoSize: number } }
    immediateAction: '',
    notifyAssist: true,
    email1: initialEmails.email1 || '',
    email2: initialEmails.email2 || '',
    sendEmailAlert: true
  });

  const [loading, setLoading] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [activePhotoItemId, setActivePhotoItemId] = useState(null);
  const [message, setMessage] = useState('');
  const [emailFallbackUrl, setEmailFallbackUrl] = useState('');

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

  const toggleDeviation = (label, itemId) => {
    setFormData(prev => {
      const exists = prev.deviations.includes(label);
      const updated = exists 
        ? prev.deviations.filter(d => d !== label)
        : [...prev.deviations, label];

      // Se desmarcou, remove a foto atrelada ao item
      const updatedPhotos = { ...prev.itemPhotos };
      if (exists && updatedPhotos[itemId]) {
        delete updatedPhotos[itemId];
      }

      return {
        ...prev,
        deviations: updated,
        itemPhotos: updatedPhotos,
        status: updated.length > 0 ? 'NAO_CONFORME' : 'CONFORME'
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
        itemPhotos: newStatus === 'CONFORME' ? {} : prev.itemPhotos,
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

  const triggerCamera = (itemId) => {
    setActivePhotoItemId(itemId);
    setTimeout(() => {
      if (cameraInputRef.current) cameraInputRef.current.click();
    }, 50);
  };

  const triggerGallery = (itemId) => {
    setActivePhotoItemId(itemId);
    setTimeout(() => {
      if (fileInputRef.current) fileInputRef.current.click();
    }, 50);
  };

  // Captura e compressão de foto atrelada a cada item não conforme
  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    const targetItemId = activePhotoItemId;
    if (!file || !targetItemId) return;

    setCompressing(true);
    setMessage('');
    try {
      const compressed = await compressImage(file, 1280, 1280, 0.75);
      setFormData(prev => ({
        ...prev,
        itemPhotos: {
          ...prev.itemPhotos,
          [targetItemId]: {
            photo: compressed.dataUrl,
            photoSize: compressed.sizeBytes
          }
        }
      }));
    } catch (err) {
      console.error('Erro ao processar imagem:', err);
      setMessage('Falha ao processar a foto. Tente novamente.');
    } finally {
      setCompressing(false);
      if (cameraInputRef.current) cameraInputRef.current.value = '';
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveItemPhoto = (itemId) => {
    setFormData(prev => {
      const updatedPhotos = { ...prev.itemPhotos };
      delete updatedPhotos[itemId];
      return {
        ...prev,
        itemPhotos: updatedPhotos
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.auditor.trim()) {
      setMessage('Informe o nome do auditor responsável.');
      return;
    }

    // Regra Obrigatória: Foto comprovatória exigida para CADA item de Não Conformidade
    if (formData.status === 'NAO_CONFORME' || formData.deviations.length > 0) {
      if (formData.deviations.length === 0) {
        setMessage('Selecione ao menos um item reprovado para registrar a Não Conformidade.');
        return;
      }

      const missingPhotos = WASTE_ITEMS.filter(it => 
        formData.deviations.includes(it.label) && (!formData.itemPhotos?.[it.id]?.photo)
      );

      if (missingPhotos.length > 0) {
        const itemNames = missingPhotos.map(it => `"${it.label}"`).join(', ');
        setMessage(`Foto pendente nos itens não conformes: ${itemNames}. Anexe uma foto para cada desvio antes de salvar.`);
        return;
      }
    }

    setLoading(true);
    setMessage('');
    try {
      // Mapeia os itens avaliados com as fotos específicas de cada um
      const itemsData = WASTE_ITEMS.map(it => {
        const isNC = formData.deviations.includes(it.label);
        const pData = formData.itemPhotos?.[it.id];
        return {
          id: it.id,
          label: it.label,
          status: isNC ? 'NC' : 'C',
          photo: isNC ? (pData?.photo || '') : '',
          photoSize: isNC ? (pData?.photoSize || 0) : 0
        };
      });

      // Foto principal (primeira encontrada) para compatibilidade com visualizadores legados
      const firstPhoto = Object.values(formData.itemPhotos || {}).find(p => p?.photo)?.photo || '';

      const res = await dbService.saveWasteInspection({
        ...formData,
        items: itemsData,
        photo: firstPhoto,
        unitId: 'betim'
      });

      setEmailFallbackUrl('');
      let timeoutMs = 6000;
      if (res?.emailSent && res?.emailRecipients?.length > 0) {
        setMessage(`Vistoria gravada com sucesso! Alerta de Não Conformidade enviado por e-mail para: ${res.emailRecipients.join(', ')}.`);
      } else if (res?.emailQueuedPending || res?.emailError) {
        const recipientsStr = (res.emailRecipients || []).join(', ');
        if (res.emailMailto?.to?.length > 0) {
          const mailto = `mailto:${res.emailMailto.to.join(',')}?subject=${encodeURIComponent(res.emailMailto.subject)}&body=${encodeURIComponent(res.emailMailto.body)}`;
          setEmailFallbackUrl(mailto);
        }
        if (res.emailError) {
          setMessage(`Vistoria gravada com sucesso! Porém houve falha ao enviar e-mail (${res.emailError}). Destinatários: ${recipientsStr}.`);
        } else {
          setMessage(`Vistoria gravada com sucesso! O alerta entrou na fila (${recipientsStr}), mas o servidor de e-mail em nuvem está pausado (Plano Blaze inativo).`);
        }
        timeoutMs = 12000;
      } else {
        setMessage('Vistoria de resíduos infectantes gravada com sucesso!');
      }
      
      // Reset formulário mantendo auditor e restaurando e-mails padrão
      const defEmails = getSectorDefaultEmails(formData.sector);
      setFormData(prev => ({
        ...prev,
        status: 'CONFORME',
        deviations: [],
        itemPhotos: {},
        immediateAction: '',
        signature: '',
        email1: defEmails.email1 || '',
        email2: defEmails.email2 || ''
      }));

      if (onSuccess) onSuccess();
      setTimeout(() => { setMessage(''); setEmailFallbackUrl(''); }, timeoutMs);
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
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          backgroundColor: (message.includes('pausado') || message.includes('falha')) ? '#fffbeb' : message.includes('sucesso') ? '#ecfdf5' : '#fef2f2',
          borderColor: (message.includes('pausado') || message.includes('falha')) ? '#f59e0b' : message.includes('sucesso') ? '#10b981' : '#ef4444',
          color: (message.includes('pausado') || message.includes('falha')) ? '#92400e' : message.includes('sucesso') ? '#065f46' : '#991b1b'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
            {message.includes('sucesso') && !message.includes('pausado') && !message.includes('falha') ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
            <span>{message}</span>
          </div>
          {emailFallbackUrl && (
            <a
              href={emailFallbackUrl}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.4rem 0.75rem',
                borderRadius: '6px',
                backgroundColor: '#b45309',
                color: '#ffffff',
                fontSize: '0.8rem',
                fontWeight: '700',
                textDecoration: 'none'
              }}
            >
              <Mail size={14} /> E-mail
            </a>
          )}
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

        {/* Inputs Ocultos de Foto para Tablet */}
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

        {/* Itens de Checagem RDC 222 / NR-32 */}
        <div style={styles.itemsCard}>
          <div style={styles.itemsCardHeader}>
            <label style={{ ...styles.labelSection, marginBottom: 0 }}>
              {formData.status === 'NAO_CONFORME' ? 'Desvios Identificados (Selecione)' : 'Requisitos Inspecionados'}
            </label>
            {formData.status === 'NAO_CONFORME' && (
              <span style={styles.subtextWarning}>Marque os itens reprovados. Cada item reprovado exige sua foto.</span>
            )}
          </div>

          <div style={styles.itemsList}>
            {WASTE_ITEMS.map((item) => {
              const isChecked = formData.deviations.includes(item.label);
              const itemPhotoData = formData.itemPhotos?.[item.id];
              const hasPhoto = !!itemPhotoData?.photo;

              return (
                <div 
                  key={item.id} 
                  style={{
                    ...styles.itemContainerBox,
                    borderColor: isChecked ? '#fca5a5' : '#e2e8f0',
                    backgroundColor: isChecked ? '#fffaf0' : '#ffffff'
                  }}
                >
                  <div 
                    onClick={() => toggleDeviation(item.label, item.id)}
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
                      fontWeight: isChecked ? '600' : '500',
                      flex: 1
                    }}>
                      {item.label}
                    </span>
                    {isChecked && (
                      <span style={{
                        ...styles.badgeItemStatus,
                        backgroundColor: hasPhoto ? '#dcfce7' : '#fee2e2',
                        color: hasPhoto ? '#15803d' : '#b91c1c'
                      }}>
                        {hasPhoto ? '✓ Foto Anexada' : '⚠️ Foto Obrigatória'}
                      </span>
                    )}
                  </div>

                  {/* Bloco de Foto Específico deste Item Não Conforme */}
                  {isChecked && (
                    <div style={styles.itemPhotoCard}>
                      <div style={styles.itemPhotoHeader}>
                        <span style={styles.itemPhotoTitle}>
                          Evidência Fotográfica do Desvio:
                        </span>
                        <div style={styles.iconButtonsGroup}>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); triggerCamera(item.id); }}
                            disabled={compressing}
                            style={styles.iconActionBtn}
                            title="Tirar foto deste desvio com a câmera do tablet"
                          >
                            <Camera size={20} color="#059669" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); triggerGallery(item.id); }}
                            disabled={compressing}
                            style={styles.iconActionBtn}
                            title="Anexar foto deste desvio da galeria"
                          >
                            <Paperclip size={20} color="#0284c7" />
                          </button>
                        </div>
                      </div>

                      {compressing && activePhotoItemId === item.id && (
                        <div style={styles.compressingBox}>
                          <Loader2 size={16} className="animate-spin" color="#059669" />
                          <span>Otimizando imagem para alta velocidade...</span>
                        </div>
                      )}

                      {hasPhoto ? (
                        <div style={styles.photoPreviewCard}>
                          <div style={styles.photoWrapper}>
                            <img 
                              src={itemPhotoData.photo} 
                              alt={item.label} 
                              style={styles.photoImg} 
                            />
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); handleRemoveItemPhoto(item.id); }}
                              style={styles.photoRemoveBtn}
                              title="Excluir foto deste item"
                            >
                              <X size={14} color="#ffffff" />
                            </button>
                          </div>
                          <div style={styles.photoMeta}>
                            <span style={styles.photoBadgeSuccess}>✓ Evidência Registrada</span>
                            <span style={styles.photoSizeText}>
                              Tamanho: {Math.round((itemPhotoData.photoSize || 0) / 1024)} KB
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div style={styles.photoRequiredAlert}>
                          <AlertTriangle size={16} color="#dc2626" />
                          <span>Foto comprobatória deste item pendente. Clique na <strong>Câmera</strong> ou no <strong>Anexo</strong> para cumprir o requisito.</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Bloco Exclusivo de Não Conformidade (Ação Imediata e E-mails) */}
        {formData.status === 'NAO_CONFORME' && (
          <div style={styles.ncContainer}>
            {/* 1. Ação Imediata Adotada */}
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

            {/* 2. Disparo Imediato por E-mail (Preenchimento Automático por Setor) */}
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
    gap: '0.65rem'
  },
  itemContainerBox: {
    display: 'flex',
    flexDirection: 'column',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    backgroundColor: '#ffffff',
    overflow: 'hidden',
    transition: 'all 0.15s ease'
  },
  itemRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.65rem 0.85rem',
    cursor: 'pointer',
    userSelect: 'none',
    transition: 'all 0.15s ease'
  },
  badgeItemStatus: {
    fontSize: '0.75rem',
    fontWeight: '700',
    padding: '0.2rem 0.5rem',
    borderRadius: '4px',
    flexShrink: 0
  },
  itemPhotoCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    padding: '0.65rem 0.85rem',
    backgroundColor: '#ffffff',
    borderTop: '1px dashed #fca5a5'
  },
  itemPhotoHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '0.5rem'
  },
  itemPhotoTitle: {
    fontSize: '0.75rem',
    fontWeight: '600',
    color: '#991b1b'
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
