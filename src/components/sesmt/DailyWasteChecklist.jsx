import React, { useState, useEffect } from 'react';
import { dbService } from '../../firebase';
import { Save, CheckCircle2, AlertTriangle, ShieldCheck, CheckCheck, Trash2, AlertOctagon, Send, Check } from 'lucide-react';
import SignaturePad from './SignaturePad';

const SECTORS = [
  'D.P',
  'Salão 1', 
  'Salão 2', 
  'Salão 3', 
  'Hemodiálise Externa', 
  'Bloco Cirúrgico', 
  'Reuso', 
  'Sala Amarela',
  'Recepção',
  'Copa',
  'Ambulatório'
];

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
    notifyAssist: true
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

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
    setFormData(prev => ({
      ...prev,
      status: newStatus,
      deviations: newStatus === 'CONFORME' ? [] : prev.deviations
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.auditor.trim()) {
      setMessage('Informe o nome do auditor responsável.');
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
      
      // Reset formulário mantendo auditor
      setFormData(prev => ({
        ...prev,
        status: 'CONFORME',
        deviations: [],
        immediateAction: '',
        signature: ''
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
            <label style={styles.label}>Hora</label>
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

        {/* Ação Imediata (se Não Conforme) */}
        {formData.status === 'NAO_CONFORME' && (
          <div style={styles.actionBox}>
            <label style={styles.label}>Ação Imediata Adotada</label>
            <input 
              type="text" 
              name="immediateAction" 
              placeholder="Ex.: Troca imediata do saco plástico, manutenção no pedal e alinhamento com a equipe"
              value={formData.immediateAction} 
              onChange={handleChange} 
              style={styles.input} 
            />

            {/* SM-016: Notificação Automática no Feed Assistencial */}
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
        )}

        {/* Identificação do Auditor e Rubrica */}
        <div style={styles.gridFooter}>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Auditor Responsável</label>
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
            <label style={styles.label}>Assinatura Digital</label>
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
            disabled={loading}
            style={{
              ...styles.submitBtn,
              opacity: loading ? 0.7 : 1
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
    marginBottom: '0.5rem'
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
  actionBox: {
    padding: '1rem',
    borderRadius: '8px',
    backgroundColor: '#fffbeb',
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
