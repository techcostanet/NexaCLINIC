import React, { useState } from 'react';
import { X, Check, Wrench, Calendar, Tag, User, MapPin, AlertTriangle } from 'lucide-react';

const TASK_TYPES = [
  'Preventiva',
  'Melhoria',
  'Infraestrutura',
  'Ronda',
  'Correção'
];

const CLINIC_SECTORS = [
  "Recepção",
  "Salão A de Hemodiálise",
  "Salão B de Hemodiálise",
  "Salão C de Hemodiálise",
  "Posto de Enfermagem",
  "Consultório Médico",
  "Farmácia Clínica",
  "Laboratório",
  "Tratamento de Água (CTA)",
  "Reúso de Dialisadores",
  "Expurgo / CME",
  "Faturamento / APAC",
  "Financeiro",
  "Recursos Humanos (RH)",
  "Compras",
  "SESMT",
  "Diretoria",
  "Sala de Servidores",
  "Copa",
  "Geral"
];

export default function ITNewTaskModal({ isOpen, onClose, onSave, currentUser }) {
  const [title, setTitle] = useState('');
  const [taskType, setTaskType] = useState('Preventiva');
  const [sector, setSector] = useState('Sala de Servidores');
  const [priority, setPriority] = useState('Média');
  const [deadlineDays, setDeadlineDays] = useState('3');
  const [assignedTechnician, setAssignedTechnician] = useState(currentUser?.name || 'Técnico T.I.');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Hardware');
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setSaving(true);
    try {
      const now = new Date();
      const targetDate = new Date(now.getTime() + parseInt(deadlineDays, 10) * 24 * 60 * 60 * 1000);

      const taskPayload = {
        title: title.trim(),
        origin: 'internal',
        taskType,
        sector,
        priority,
        category,
        subcategory: taskType,
        slaDeadline: targetDate.toISOString(),
        assignedTechnician: assignedTechnician.trim() || 'Equipe T.I.',
        description: description.trim() || `Tarefa preventiva/proativa cadastrada pela equipe de T.I. para atuação no setor ${sector}.`,
        requesterName: 'Equipe T.I.',
        requesterSector: 'T.I.',
        requesterEmail: 'suporte@techcosta.net',
        status: 'Aberta',
        notifyEmail: false
      };

      await onSave(taskPayload);
      onClose();
    } catch (err) {
      console.error('Erro ao cadastrar tarefa interna de T.I.:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        {/* Header */}
        <div style={styles.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={styles.iconBox}>
              <Wrench size={20} color="#7c3aed" />
            </div>
            <div>
              <h2 style={styles.title}>Nova Tarefa de T.I.</h2>
              <p style={styles.subtitle}>Atuação proativa e rotinas internas da equipe técnica</p>
            </div>
          </div>
          <button type="button" onClick={onClose} style={styles.closeBtn}>
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={styles.form}>
          <div>
            <label style={styles.label}>Título</label>
            <input 
              type="text" 
              required
              placeholder="Ex: Troca preventiva de baterias do nobreak / Organização de patch cords"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={styles.input}
              autoFocus
            />
          </div>

          <div style={styles.row}>
            <div style={{ flex: 1 }}>
              <label style={styles.label}>Atuação</label>
              <select 
                value={taskType} 
                onChange={(e) => setTaskType(e.target.value)}
                style={styles.select}
              >
                {TASK_TYPES.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div style={{ flex: 1 }}>
              <label style={styles.label}>Categoria</label>
              <select 
                value={category} 
                onChange={(e) => setCategory(e.target.value)}
                style={styles.select}
              >
                <option value="Hardware">Hardware</option>
                <option value="Rede">Rede</option>
                <option value="Sistemas">Sistemas</option>
                <option value="Impressoras">Impressoras</option>
                <option value="Servidores">Servidores</option>
                <option value="Segurança">Segurança</option>
                <option value="Outros">Outros</option>
              </select>
            </div>

            <div style={{ flex: 1 }}>
              <label style={styles.label}>Setor</label>
              <select 
                value={sector} 
                onChange={(e) => setSector(e.target.value)}
                style={styles.select}
              >
                {CLINIC_SECTORS.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={styles.row}>
            <div style={{ flex: 1 }}>
              <label style={styles.label}>Prioridade</label>
              <select 
                value={priority} 
                onChange={(e) => setPriority(e.target.value)}
                style={styles.select}
              >
                <option value="Baixa">Baixa (Rotina)</option>
                <option value="Média">Média (Padrão)</option>
                <option value="Alta">Alta (Importante)</option>
                <option value="Crítico">Crítico (Imediato)</option>
              </select>
            </div>

            <div style={{ flex: 1 }}>
              <label style={styles.label}>Prazo</label>
              <select 
                value={deadlineDays} 
                onChange={(e) => setDeadlineDays(e.target.value)}
                style={styles.select}
              >
                <option value="1">Hoje / 24h</option>
                <option value="2">Até 2 Dias</option>
                <option value="3">Até 3 Dias</option>
                <option value="7">1 Semana</option>
                <option value="15">15 Dias</option>
                <option value="30">1 Mês</option>
              </select>
            </div>

            <div style={{ flex: 1 }}>
              <label style={styles.label}>Responsável</label>
              <input 
                type="text" 
                placeholder="Técnico designado"
                value={assignedTechnician}
                onChange={(e) => setAssignedTechnician(e.target.value)}
                style={styles.input}
              />
            </div>
          </div>

          <div>
            <label style={styles.label}>Descrição</label>
            <textarea 
              rows="3"
              placeholder="Detalhes da intervenção, peças necessárias, horários convenientes para execução..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={styles.textarea}
            />
          </div>

          {/* Footer */}
          <div style={styles.footer}>
            <button type="button" onClick={onClose} style={styles.btnSecondary}>
              Cancelar
            </button>
            <button type="submit" disabled={saving} style={styles.btnPrimary}>
              <Check size={16} /> {saving ? 'Salvando...' : 'Cadastrar'}
            </button>
          </div>
        </form>
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
    maxWidth: '620px',
    maxHeight: '90vh',
    overflowY: 'auto',
    padding: '22px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    border: '1px solid #e2e8f0'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #f1f5f9',
    paddingBottom: '14px',
    marginBottom: '16px'
  },
  iconBox: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    background: '#f5f3ff',
    border: '1px solid #ddd6fe',
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
    padding: '4px',
    borderRadius: '6px'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  row: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap'
  },
  label: {
    display: 'block',
    fontSize: '11px',
    fontWeight: 700,
    color: '#475569',
    marginBottom: '4px',
    textTransform: 'uppercase',
    letterSpacing: '0.4px'
  },
  input: {
    width: '100%',
    padding: '9px 12px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    fontSize: '13px',
    color: '#0f172a',
    backgroundColor: '#ffffff',
    outline: 'none',
    boxSizing: 'border-box'
  },
  select: {
    width: '100%',
    padding: '9px 12px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    fontSize: '13px',
    color: '#0f172a',
    backgroundColor: '#ffffff',
    outline: 'none',
    boxSizing: 'border-box'
  },
  textarea: {
    width: '100%',
    padding: '9px 12px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    fontSize: '13px',
    color: '#0f172a',
    backgroundColor: '#ffffff',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    resize: 'vertical'
  },
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    borderTop: '1px solid #f1f5f9',
    paddingTop: '16px',
    marginTop: '6px'
  },
  btnSecondary: {
    padding: '8px 16px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    background: '#ffffff',
    color: '#475569',
    fontWeight: 600,
    fontSize: '13px',
    cursor: 'pointer'
  },
  btnPrimary: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 18px',
    borderRadius: '8px',
    border: 'none',
    background: '#7c3aed',
    color: '#ffffff',
    fontWeight: 600,
    fontSize: '13px',
    cursor: 'pointer',
    boxShadow: '0 2px 4px rgba(124, 58, 237, 0.2)'
  }
};
