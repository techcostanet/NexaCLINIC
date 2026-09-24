import React, { useState } from 'react';
import { Zap, X, AlertTriangle, Send, CheckCircle2, Clock, Users } from 'lucide-react';

const QUICK_REASONS = [
  {
    id: 'setor_parado',
    title: 'Setor Parado',
    desc: 'Atendimento e rotinas travadas aguardando T.I.',
    icon: '⚡'
  },
  {
    id: 'prazo_vencido',
    title: 'Prazo Excedido',
    desc: 'Tempo limite do chamado atingido sem retorno.',
    icon: '⏳'
  },
  {
    id: 'impacto_paciente',
    title: 'Impacto Assistencial',
    desc: 'Interferência direta no cuidado ao paciente.',
    icon: '🚨'
  },
  {
    id: 'impressao_parada',
    title: 'Impressão Travada',
    desc: 'Sem emissão de etiquetas de tubos ou prescrições.',
    icon: '🏷️'
  }
];

export default function ITUrgencyModal({
  isOpen,
  onClose,
  order,
  onConfirm,
  onConfirmCobrança,
  currentUser
}) {
  const [selectedReasonId, setSelectedReasonId] = useState(QUICK_REASONS[0].id);
  const [customNote, setCustomNote] = useState('');
  const [sending, setSending] = useState(false);

  if (!isOpen || !order) return null;

  const selectedReasonObj = QUICK_REASONS.find(r => r.id === selectedReasonId) || QUICK_REASONS[0];

  const handleSend = async () => {
    setSending(true);
    try {
      const callback = onConfirm || onConfirmCobrança;
      if (typeof callback === 'function') {
        await callback(selectedReasonObj.title, customNote.trim());
      }
      onClose();
    } catch (err) {
      console.error('Erro ao registrar cobrança de agilidade:', err);
      alert('Não foi possível registrar a cobrança.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <div style={styles.iconBox}>
              <Zap size={22} color="#d97706" fill="#fef3c7" />
            </div>
            <div>
              <h2 style={styles.title}>Cobrança de Agilidade</h2>
              <p style={styles.subtitle}>Notificar a equipe de T.I. com prioridade de atendimento</p>
            </div>
          </div>
          <button onClick={onClose} style={styles.closeBtn} title="Fechar">
            <X size={18} />
          </button>
        </div>

        {/* Order Info */}
        <div style={styles.orderInfo}>
          <div style={styles.orderBadge}>{order.code}</div>
          <div style={styles.orderTitleText}>{order.title}</div>
          <div style={styles.orderSector}>{order.sector}</div>
        </div>

        {/* Content */}
        <div style={styles.body}>
          <label style={styles.sectionLabel}>Motivo da Cobrança</label>
          <div style={styles.reasonsGrid}>
            {QUICK_REASONS.map(reason => {
              const isSelected = selectedReasonId === reason.id;
              return (
                <div
                  key={reason.id}
                  onClick={() => setSelectedReasonId(reason.id)}
                  style={{
                    ...styles.reasonCard,
                    ...(isSelected ? styles.reasonCardActive : {})
                  }}
                >
                  <div style={styles.reasonTop}>
                    <span style={styles.reasonIcon}>{reason.icon}</span>
                    <span style={styles.reasonTitle}>{reason.title}</span>
                  </div>
                  <div style={styles.reasonDesc}>{reason.desc}</div>
                </div>
              );
            })}
          </div>

          <div>
            <label style={styles.sectionLabel}>Observações</label>
            <textarea
              rows="3"
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              placeholder="Descreva o impacto atual no setor ou informações adicionais..."
              style={styles.textarea}
            />
          </div>

          <div style={styles.noticeBox}>
            <AlertTriangle size={16} color="#d97706" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={styles.noticeText}>
              Esta ação adiciona uma marcação de urgência no chamado, sinaliza a equipe técnica em tempo real e registra o pedido na linha do tempo.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <button
            type="button"
            onClick={onClose}
            disabled={sending}
            style={styles.btnSecondary}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSend}
            disabled={sending}
            style={styles.btnCobrar}
          >
            <Zap size={16} fill="#ffffff" /> {sending ? 'Enviando...' : 'Cobrar Agilidade'}
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
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: '20px'
  },
  modal: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '560px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    animation: 'fadeIn 0.2s ease-out'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '18px 24px',
    borderBottom: '1px solid #fef3c7',
    backgroundColor: '#fffbeb'
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  iconBox: {
    width: '42px',
    height: '42px',
    borderRadius: '12px',
    backgroundColor: '#fef3c7',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  title: {
    margin: 0,
    fontSize: '17px',
    fontWeight: '700',
    color: '#92400e'
  },
  subtitle: {
    margin: '2px 0 0 0',
    fontSize: '12px',
    color: '#b45309'
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: '#92400e',
    cursor: 'pointer',
    padding: '6px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  orderInfo: {
    padding: '12px 24px',
    backgroundColor: '#f8fafc',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  orderBadge: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#4f46e5',
    backgroundColor: '#ede9fe',
    padding: '3px 8px',
    borderRadius: '6px'
  },
  orderTitleText: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#1e293b',
    flex: 1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  orderSector: {
    fontSize: '11px',
    color: '#64748b'
  },
  body: {
    padding: '20px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  sectionLabel: {
    display: 'block',
    fontSize: '11px',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    color: '#475569',
    marginBottom: '8px'
  },
  reasonsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '10px'
  },
  reasonCard: {
    padding: '12px',
    borderRadius: '10px',
    border: '1.5px solid #e2e8f0',
    backgroundColor: '#ffffff',
    cursor: 'pointer',
    transition: 'all 0.15s ease'
  },
  reasonCardActive: {
    borderColor: '#d97706',
    backgroundColor: '#fffbeb',
    boxShadow: '0 0 0 1px #d97706'
  },
  reasonTop: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginBottom: '4px'
  },
  reasonIcon: {
    fontSize: '15px'
  },
  reasonTitle: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#1e293b'
  },
  reasonDesc: {
    fontSize: '11px',
    color: '#64748b',
    lineHeight: 1.3
  },
  textarea: {
    width: '100%',
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    fontSize: '13px',
    color: '#1e293b',
    backgroundColor: '#ffffff',
    outline: 'none',
    resize: 'vertical',
    boxSizing: 'border-box',
    fontFamily: 'inherit'
  },
  noticeBox: {
    backgroundColor: '#fef3c7',
    border: '1px solid #fde68a',
    borderRadius: '8px',
    padding: '10px 12px',
    display: 'flex',
    gap: '8px',
    alignItems: 'flex-start'
  },
  noticeText: {
    fontSize: '11px',
    color: '#92400e',
    lineHeight: 1.4
  },
  footer: {
    padding: '16px 24px',
    borderTop: '1px solid #f1f5f9',
    backgroundColor: '#f8fafc',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px'
  },
  btnSecondary: {
    padding: '9px 18px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    backgroundColor: '#ffffff',
    color: '#475569',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  btnCobrar: {
    padding: '9px 18px',
    borderRadius: '8px',
    border: 'none',
    background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
    color: '#ffffff',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    boxShadow: '0 2px 6px rgba(217, 119, 6, 0.35)'
  }
};
