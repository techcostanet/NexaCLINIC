import React, { useState, useEffect } from 'react';
import { Edit, X, Save, AlertTriangle, Layers, Tag, User, MapPin } from 'lucide-react';

const CATEGORIES = [
  { id: 'Hardware', name: 'Hardware', subcategories: ['Desktop', 'Notebook', 'Monitor', 'Nobreak', 'Periféricos', 'Cabos', 'Outro'] },
  { id: 'Sistemas', name: 'Sistemas', subcategories: ['Nex-Ai CLINIC', 'Windows', 'Microsoft 365', 'Antivírus', 'Certificado Digital', 'Navegador', 'Outro'] },
  { id: 'Rede', name: 'Rede', subcategories: ['Wi-Fi', 'Cabo Desconectado', 'Lentidão', 'Queda de Link', 'Switch', 'Outro'] },
  { id: 'Impressoras', name: 'Impressoras', subcategories: ['Zebra', 'Laser', 'Leitor de Barras', 'Scanner', 'Outro'] },
  { id: 'Acessos', name: 'Acessos', subcategories: ['Novo Usuário', 'Redefinição de Senha', 'Permissão de Módulo', 'E-mail Corporativo', 'Outro'] },
  { id: 'Telefonia', name: 'Telefonia', subcategories: ['Ramal VoIP', 'Aparelho Físico', 'Linha Muda', 'Outro'] },
  { id: 'Segurança', name: 'Segurança', subcategories: ['Arquivo Deletado', 'Suspeita de Vírus', 'Bloqueio de Segurança', 'Outro'] },
  { id: 'Servidores', name: 'Servidores', subcategories: ['Servidor Local', 'Banco de Dados', 'Backup', 'Outro'] },
  { id: 'Outros', name: 'Outros', subcategories: ['Dúvida Operacional', 'Treinamento', 'Melhoria', 'Geral'] }
];

const SECTORS = [
  "Recepção",
  "Salão A de Hemodiálise",
  "Salão B de Hemodiálise",
  "Salão C de Hemodiálise",
  "Posto de Enfermagem",
  "Consultório Médico",
  "Farmácia Clínica",
  "Laboratório",
  "CTA",
  "Reúso de Dialisadores",
  "CME",
  "Faturamento",
  "Financeiro",
  "RH",
  "Compras",
  "SESMT",
  "Diretoria",
  "Sala de Servidores",
  "Copa",
  "Geral"
];

const TASK_TYPES = ['Preventiva', 'Corretiva', 'Infraestrutura', 'Segurança', 'Melhoria', 'Servidor', 'Backup', 'Rede', 'Antivírus', 'Outro'];

export default function ITEditModal({
  isOpen,
  onClose,
  order,
  onSave,
  currentUser
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Hardware');
  const [subcategory, setSubcategory] = useState('Desktop');
  const [sector, setSector] = useState('Recepção');
  const [priority, setPriority] = useState('Média');
  const [assignedTechnician, setAssignedTechnician] = useState('');
  const [status, setStatus] = useState('Aberta');
  const [origin, setOrigin] = useState('user');
  const [taskType, setTaskType] = useState('Preventiva');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (order && isOpen) {
      setTitle(order.title || '');
      setDescription(order.description || '');
      setCategory(order.category || 'Hardware');
      setSubcategory(order.subcategory || 'Desktop');
      setSector(order.sector || 'Recepção');
      setPriority(order.priority || 'Média');
      setAssignedTechnician(order.assignedTechnician || '');
      setStatus(order.status || 'Aberta');
      setOrigin(order.origin || 'user');
      setTaskType(order.taskType || 'Preventiva');
    }
  }, [order, isOpen]);

  // Hook unconditional check - only return null AFTER all hooks
  if (!isOpen || !order) return null;

  const currentCategoryObj = CATEGORIES.find(c => c.id === category) || CATEGORIES[0];
  const isInternal = origin === 'internal';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      alert('Preencha o título e a descrição.');
      return;
    }

    setSaving(true);
    try {
      const updatedOrder = {
        ...order,
        title: title.trim(),
        description: description.trim(),
        category,
        subcategory,
        sector,
        priority,
        assignedTechnician: assignedTechnician.trim(),
        status,
        origin,
        taskType: isInternal ? taskType : null,
        lastUpdatedBy: currentUser?.name || 'Técnico T.I.'
      };

      await onSave(updatedOrder);
      onClose();
    } catch (err) {
      console.error('Erro ao editar chamado/tarefa:', err);
      alert('Não foi possível salvar as alterações.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <div style={styles.iconBox}>
              <Edit size={20} color="#4f46e5" />
            </div>
            <div>
              <h2 style={styles.title}>Editar {isInternal ? 'Tarefa' : 'Chamado'} {order.code}</h2>
              <p style={styles.subtitle}>Edição de dados cadastrais e parâmetros operacionais</p>
            </div>
          </div>
          <button onClick={onClose} style={styles.closeBtn} title="Fechar">
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.body}>
            {/* Origin & Type Selection */}
            <div style={styles.row}>
              <div style={styles.col}>
                <label style={styles.label}>Origem</label>
                <select
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  style={styles.select}
                >
                  <option value="user">Chamado</option>
                  <option value="internal">Tarefa Interna</option>
                </select>
              </div>

              {isInternal && (
                <div style={styles.col}>
                  <label style={styles.label}>Tipo</label>
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
              )}

              <div style={styles.col}>
                <label style={styles.label}>Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  style={styles.select}
                >
                  <option value="Aberta">Aberta</option>
                  <option value="Em Triagem">Em Triagem</option>
                  <option value="Em Atendimento">Em Atendimento</option>
                  <option value="Aguardando Usuário">Aguardando Usuário</option>
                  <option value="Aguardando Peça">Aguardando Peça</option>
                  <option value="Resolvida">Resolvida</option>
                  <option value="Cancelada">Cancelada</option>
                </select>
              </div>
            </div>

            {/* Title */}
            <div>
              <label style={styles.label}>Assunto</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Título claro e direto da demanda..."
                required
                style={styles.input}
              />
            </div>

            {/* Category & Subcategory */}
            <div style={styles.row}>
              <div style={styles.col}>
                <label style={styles.label}>Categoria</label>
                <select
                  value={category}
                  onChange={(e) => {
                    const newCat = e.target.value;
                    setCategory(newCat);
                    const catObj = CATEGORIES.find(c => c.id === newCat);
                    if (catObj && catObj.subcategories.length > 0) {
                      setSubcategory(catObj.subcategories[0]);
                    }
                  }}
                  style={styles.select}
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div style={styles.col}>
                <label style={styles.label}>Subcategoria</label>
                <select
                  value={subcategory}
                  onChange={(e) => setSubcategory(e.target.value)}
                  style={styles.select}
                >
                  {currentCategoryObj.subcategories.map(sub => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Sector, Priority & Tech */}
            <div style={styles.row}>
              <div style={styles.col}>
                <label style={styles.label}>Setor</label>
                <select
                  value={sector}
                  onChange={(e) => setSector(e.target.value)}
                  style={styles.select}
                >
                  {SECTORS.map(sec => (
                    <option key={sec} value={sec}>{sec}</option>
                  ))}
                </select>
              </div>

              <div style={styles.col}>
                <label style={styles.label}>Prioridade</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  style={styles.select}
                >
                  <option value="Baixa">Baixa (48h)</option>
                  <option value="Média">Média (24h)</option>
                  <option value="Alta">Alta (8h)</option>
                  <option value="Crítico">Crítico (2h)</option>
                </select>
              </div>

              <div style={styles.col}>
                <label style={styles.label}>Técnico</label>
                <input
                  type="text"
                  value={assignedTechnician}
                  onChange={(e) => setAssignedTechnician(e.target.value)}
                  placeholder="Nome do analista..."
                  style={styles.input}
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label style={styles.label}>Descrição</label>
              <textarea
                rows="4"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detalhes completos do problema ou escopo da tarefa..."
                required
                style={styles.textarea}
              />
            </div>
          </div>

          {/* Footer */}
          <div style={styles.footer}>
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              style={styles.btnSecondary}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              style={styles.btnPrimary}
            >
              <Save size={15} /> {saving ? 'Salvando...' : 'Salvar'}
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
    maxWidth: '720px',
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
    borderBottom: '1px solid #f1f5f9',
    backgroundColor: '#faf5ff'
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
    backgroundColor: '#ede9fe',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  title: {
    margin: 0,
    fontSize: '17px',
    fontWeight: '700',
    color: '#3b0764'
  },
  subtitle: {
    margin: '2px 0 0 0',
    fontSize: '12px',
    color: '#6b21a8'
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: '#64748b',
    cursor: 'pointer',
    padding: '6px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s'
  },
  form: {
    display: 'flex',
    flexDirection: 'column'
  },
  body: {
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    maxHeight: 'calc(85vh - 140px)',
    overflowY: 'auto'
  },
  row: {
    display: 'flex',
    gap: '14px'
  },
  col: {
    flex: 1
  },
  label: {
    display: 'block',
    fontSize: '11px',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    color: '#475569',
    marginBottom: '6px'
  },
  input: {
    width: '100%',
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    fontSize: '13px',
    color: '#1e293b',
    backgroundColor: '#ffffff',
    outline: 'none',
    boxSizing: 'border-box'
  },
  select: {
    width: '100%',
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    fontSize: '13px',
    color: '#1e293b',
    backgroundColor: '#ffffff',
    outline: 'none',
    boxSizing: 'border-box'
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
  btnPrimary: {
    padding: '9px 18px',
    borderRadius: '8px',
    border: 'none',
    background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)',
    color: '#ffffff',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    boxShadow: '0 2px 4px rgba(79, 70, 229, 0.25)'
  }
};
