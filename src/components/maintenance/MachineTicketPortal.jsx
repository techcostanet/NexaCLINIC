import React, { useState, useEffect } from 'react';
import { dbService, authService } from '../../firebase';
import { 
  Wrench, CheckCircle2, AlertTriangle, Clock, Send, 
  HardDrive, ChevronLeft, ShieldCheck, Activity, AlertCircle, RefreshCw
} from 'lucide-react';

export default function MachineTicketPortal({ equipmentId, onExitPortal }) {
  const [equipment, setEquipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submittedOS, setSubmittedOS] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [existingOrders, setExistingOrders] = useState([]);

  // Form state (Padrão conciso de rótulos: 1 termo)
  const [requesterName, setRequesterName] = useState('');
  const [requesterPhone, setRequesterPhone] = useState('');
  const [requesterEmail, setRequesterEmail] = useState('');
  const [sector, setSector] = useState('');
  const [priority, setPriority] = useState('Alta');
  const [description, setDescription] = useState('');

  useEffect(() => {
    // Se o usuário atual já estiver logado no navegador, pré-preenche seus dados
    try {
      const currentUser = authService.getCurrentUser ? authService.getCurrentUser() : null;
      if (currentUser) {
        if (currentUser.name) setRequesterName(currentUser.name);
        if (currentUser.email) setRequesterEmail(currentUser.email);
      }
    } catch (e) {
      console.warn('Não foi possível recuperar usuário atual:', e);
    }

    loadEquipmentData();
  }, [equipmentId]);

  const loadEquipmentData = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const eq = await dbService.getEquipmentById(equipmentId);
      if (eq) {
        setEquipment(eq);
        setSector(eq.sector || '');
        
        // Verifica se já existem ordens abertas para esta máquina
        try {
          const allOrders = await dbService.getServiceOrders();
          const openForThisEq = (allOrders || []).filter(o => 
            (o.equipmentId === eq.id || o.equipmentCode === eq.code) &&
            ['Aberta', 'Em Diagnóstico', 'Em Execução', 'Aguardando Peça'].includes(o.status)
          );
          setExistingOrders(openForThisEq);
        } catch (e) {
          console.warn('Erro ao verificar ordens abertas:', e);
        }
      } else {
        setErrorMsg(`Equipamento com identificador "${equipmentId}" não foi localizado no cadastro.`);
      }
    } catch (err) {
      console.error('Erro ao buscar dados do equipamento:', err);
      setErrorMsg('Erro ao conectar ao sistema para buscar informações do equipamento.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) {
      alert('Por favor, informe a descrição do problema ou falha observada.');
      return;
    }
    if (!requesterName.trim()) {
      alert('Por favor, informe seu nome para contato da equipe técnica.');
      return;
    }

    setSubmitting(true);
    try {
      const ticketPayload = {
        equipmentId: equipment ? equipment.id : equipmentId,
        equipmentCode: equipment ? equipment.code : equipmentId,
        equipmentName: equipment ? equipment.name : 'Equipamento via QR Code',
        equipmentCategory: equipment ? equipment.category : 'Biomédico',
        sector: sector || equipment?.sector || 'Geral',
        unitId: equipment?.unitId || 'betim',
        unit: equipment?.unit || 'Betim',
        requesterName: requesterName.trim(),
        requesterPhone: requesterPhone.trim(),
        requesterEmail: requesterEmail.trim() || undefined,
        requesterSector: sector || equipment?.sector || 'Geral',
        priority,
        type: 'Corretiva',
        description: description.trim()
      };

      const savedOS = await dbService.createPublicMaintenanceTicket(ticketPayload);
      setSubmittedOS(savedOS);
    } catch (err) {
      console.error('Erro ao enviar chamado:', err);
      alert('Houve uma falha ao registrar o chamado. Por favor, tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetForNewTicket = () => {
    setSubmittedOS(null);
    setDescription('');
    loadEquipmentData();
  };

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.brandBox}>
            <div style={styles.logoIcon}>
              <Wrench size={22} color="#ffffff" />
            </div>
            <div>
              <h1 style={styles.brandTitle}>NexaCLINIC</h1>
              <span style={styles.brandSubtitle}>Central de Manutenção & Engenharia</span>
            </div>
          </div>
          {onExitPortal && (
            <button onClick={onExitPortal} style={styles.btnExit}>
              Acessar Sistema
            </button>
          )}
        </div>
      </header>

      <main style={styles.main}>
        {loading ? (
          <div style={styles.cardCenter}>
            <RefreshCw size={36} className="spin" color="#0891b2" />
            <p style={{ marginTop: '1rem', color: '#475569', fontWeight: '600' }}>
              Identificando equipamento...
            </p>
          </div>
        ) : errorMsg ? (
          <div style={styles.cardCenter}>
            <AlertCircle size={44} color="#ef4444" />
            <h2 style={{ fontSize: '1.2rem', color: '#0f172a', margin: '0.75rem 0 0.5rem' }}>
              Equipamento não localizado
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem', maxWidth: '420px', marginBottom: '1.5rem' }}>
              {errorMsg}
            </p>
            {onExitPortal && (
              <button onClick={onExitPortal} style={styles.btnPrimary}>
                Voltar ao Sistema
              </button>
            )}
          </div>
        ) : submittedOS ? (
          /* TELA DE SUCESSO / COMPROVANTE DO CHAMADO */
          <div style={styles.successCard}>
            <div style={styles.successIconBox}>
              <CheckCircle2 size={56} color="#10b981" />
            </div>
            <span style={styles.successBadge}>Chamado Aberto</span>
            <h2 style={styles.successTitle}>Ordem de Serviço Registrada!</h2>
            <p style={styles.successSub}>
              A equipe técnica de manutenção e engenharia clínica já foi notificada.
            </p>

            <div style={styles.protocolBox}>
              <span style={styles.protocolLabel}>Protocolo de Atendimento</span>
              <div style={styles.protocolNumber}>{submittedOS.code || 'OS Registrada'}</div>
              <span style={styles.protocolDate}>
                {new Date().toLocaleString('pt-BR')}
              </span>
            </div>

            <div style={styles.detailsList}>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Patrimônio:</span>
                <span style={styles.detailVal}>{equipment?.code}</span>
              </div>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Equipamento:</span>
                <span style={styles.detailVal}>{equipment?.name}</span>
              </div>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Setor:</span>
                <span style={styles.detailVal}>{submittedOS.sector || equipment?.sector}</span>
              </div>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Solicitante:</span>
                <span style={styles.detailVal}>{submittedOS.requesterName}</span>
              </div>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Prioridade:</span>
                <span style={{ 
                  fontWeight: '700', 
                  color: submittedOS.priority === 'Crítico' || submittedOS.priority === 'Urgente' ? '#ef4444' : '#0891b2' 
                }}>
                  {submittedOS.priority}
                </span>
              </div>
              <div style={{ ...styles.detailRow, flexDirection: 'column', alignItems: 'flex-start', gap: '0.2rem' }}>
                <span style={styles.detailLabel}>Descrição:</span>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#1e293b', fontStyle: 'italic', background: '#f8fafc', padding: '0.5rem', borderRadius: '6px', width: '100%', boxSizing: 'border-box' }}>
                  "{submittedOS.description}"
                </p>
              </div>
            </div>

            <div style={styles.actionsBox}>
              <button onClick={handleResetForNewTicket} style={styles.btnSecondary}>
                Abrir Outro Chamado
              </button>
              {onExitPortal && (
                <button onClick={onExitPortal} style={styles.btnPrimary}>
                  Ir para o Sistema
                </button>
              )}
            </div>
          </div>
        ) : (
          /* FORMULÁRIO DE ABERTURA DE CHAMADO */
          <div style={styles.formContainer}>
            {/* CARTÃO DE IDENTIFICAÇÃO DA MÁQUINA */}
            <div style={styles.machineCard}>
              <div style={styles.machineCardTop}>
                <div style={styles.machineCodeTag}>
                  <HardDrive size={14} />
                  <span>Patrimônio: {equipment.code}</span>
                </div>
                <span style={{
                  ...styles.statusBadge,
                  backgroundColor: equipment.status === 'Em Manutenção' ? '#fef3c7' : '#dcfce7',
                  color: equipment.status === 'Em Manutenção' ? '#92400e' : '#166534',
                  borderColor: equipment.status === 'Em Manutenção' ? '#fde68a' : '#bbf7d0'
                }}>
                  {equipment.status}
                </span>
              </div>

              <h2 style={styles.machineName}>{equipment.name}</h2>
              
              <div style={styles.machineMetaGrid}>
                <div>
                  <span style={styles.metaLabel}>Setor</span>
                  <span style={styles.metaValue}>{equipment.sector || 'Geral'}</span>
                </div>
                <div>
                  <span style={styles.metaLabel}>Modelo</span>
                  <span style={styles.metaValue}>{equipment.brand ? `${equipment.brand} ${equipment.model || ''}` : (equipment.model || 'N/A')}</span>
                </div>
                <div>
                  <span style={styles.metaLabel}>Série</span>
                  <span style={styles.metaValue}>{equipment.serialNumber || 'N/A'}</span>
                </div>
              </div>

              {existingOrders.length > 0 && (
                <div style={styles.existingOrderNotice}>
                  <AlertTriangle size={16} color="#d97706" />
                  <div style={{ fontSize: '0.8rem', color: '#92400e' }}>
                    <strong>Atenção:</strong> Esta máquina já possui <strong>{existingOrders.length} chamado(s) aberto(s)</strong> em andamento. Você ainda pode abrir uma nova solicitação se o sintoma for diferente.
                  </div>
                </div>
              )}
            </div>

            {/* FORMULÁRIO DE OCORRÊNCIA */}
            <form onSubmit={handleSubmit} style={styles.formCard}>
              <div style={styles.formCardHeader}>
                <h3 style={styles.formCardTitle}>Reportar Problema</h3>
                <p style={styles.formCardSub}>
                  Preencha os detalhes para que a equipe técnica seja acionada imediatamente.
                </p>
              </div>

              <div style={styles.formFields}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Solicitante *</label>
                  <input 
                    type="text"
                    required
                    placeholder="Seu nome completo"
                    value={requesterName}
                    onChange={(e) => setRequesterName(e.target.value)}
                    style={styles.input}
                  />
                </div>

                <div style={styles.inputRow}>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Contato</label>
                    <input 
                      type="text"
                      placeholder="WhatsApp ou Ramal"
                      value={requesterPhone}
                      onChange={(e) => setRequesterPhone(e.target.value)}
                      style={styles.input}
                    />
                  </div>

                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Prioridade *</label>
                    <select 
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      style={styles.select}
                    >
                      <option value="Baixa">Baixa (Ajuste / Observação)</option>
                      <option value="Média">Média (Dificulta o uso)</option>
                      <option value="Alta">Alta (Interrompe atendimento)</option>
                      <option value="Urgente">Urgente (Parada de Máquina)</option>
                    </select>
                  </div>
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Setor</label>
                  <input 
                    type="text"
                    placeholder="Localização da máquina"
                    value={sector}
                    onChange={(e) => setSector(e.target.value)}
                    style={styles.input}
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Descrição *</label>
                  <textarea 
                    rows={4}
                    required
                    placeholder="Descreva o que está ocorrendo: alarme sonoro, erro na tela, vazamento de água/dialisato, problema de condutividade ou peça danificada..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    style={styles.textarea}
                  />
                </div>

                <div style={styles.securityNote}>
                  <ShieldCheck size={18} color="#0891b2" />
                  <span>
                    Chamado integrado ao sistema da clínica. Um protocolo de rastreamento será gerado imediatamente.
                  </span>
                </div>

                <button 
                  type="submit" 
                  disabled={submitting} 
                  style={{
                    ...styles.btnSubmit,
                    opacity: submitting ? 0.7 : 1,
                    cursor: submitting ? 'not-allowed' : 'pointer'
                  }}
                >
                  {submitting ? (
                    <>
                      <RefreshCw size={18} className="spin" />
                      <span>Registrando Chamado...</span>
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      <span>Enviar Chamado</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#f1f5f9',
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
    display: 'flex',
    flexDirection: 'column'
  },
  header: {
    backgroundColor: '#0f172a',
    color: '#ffffff',
    padding: '0.85rem 1.25rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
  },
  headerContent: {
    maxWidth: '720px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  brandBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem'
  },
  logoIcon: {
    width: '38px',
    height: '38px',
    borderRadius: '10px',
    backgroundColor: '#0891b2',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  brandTitle: {
    fontSize: '1.15rem',
    fontWeight: '800',
    margin: 0,
    letterSpacing: '-0.3px',
    color: '#ffffff'
  },
  brandSubtitle: {
    fontSize: '0.75rem',
    color: '#94a3b8',
    display: 'block'
  },
  btnExit: {
    background: 'rgba(255,255,255,0.1)',
    color: '#ffffff',
    border: '1px solid rgba(255,255,255,0.2)',
    padding: '0.45rem 0.85rem',
    borderRadius: '6px',
    fontSize: '0.8rem',
    fontWeight: '600',
    cursor: 'pointer'
  },
  main: {
    flex: 1,
    padding: '1.25rem 1rem 2rem',
    maxWidth: '680px',
    width: '100%',
    margin: '0 auto',
    boxSizing: 'border-box'
  },
  cardCenter: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '3rem 1.5rem',
    textAlign: 'center',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: '2rem'
  },
  formContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem'
  },
  machineCard: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '1.25rem',
    border: '1px solid #cbd5e1',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
  },
  machineCardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.6rem'
  },
  machineCodeTag: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    backgroundColor: '#f1f5f9',
    color: '#0f172a',
    fontSize: '0.8rem',
    fontWeight: '700',
    padding: '0.25rem 0.6rem',
    borderRadius: '6px',
    border: '1px solid #e2e8f0'
  },
  statusBadge: {
    fontSize: '0.75rem',
    fontWeight: '700',
    padding: '0.25rem 0.6rem',
    borderRadius: '20px',
    border: '1px solid transparent'
  },
  machineName: {
    fontSize: '1.25rem',
    fontWeight: '800',
    color: '#0f172a',
    margin: '0 0 0.85rem',
    lineHeight: 1.3
  },
  machineMetaGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '0.75rem',
    backgroundColor: '#f8fafc',
    padding: '0.75rem',
    borderRadius: '8px',
    border: '1px solid #e2e8f0'
  },
  metaLabel: {
    fontSize: '0.7rem',
    fontWeight: '700',
    textTransform: 'uppercase',
    color: '#64748b',
    display: 'block',
    marginBottom: '0.15rem'
  },
  metaValue: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#1e293b',
    display: 'block'
  },
  existingOrderNotice: {
    marginTop: '0.85rem',
    padding: '0.6rem 0.8rem',
    backgroundColor: '#fffbeb',
    border: '1px solid #fde68a',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '1.25rem',
    border: '1px solid #cbd5e1',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
  },
  formCardHeader: {
    marginBottom: '1.25rem',
    borderBottom: '1px solid #f1f5f9',
    paddingBottom: '0.75rem'
  },
  formCardTitle: {
    fontSize: '1.1rem',
    fontWeight: '800',
    color: '#0f172a',
    margin: '0 0 0.25rem'
  },
  formCardSub: {
    fontSize: '0.82rem',
    color: '#64748b',
    margin: 0
  },
  formFields: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem',
    flex: 1
  },
  inputRow: {
    display: 'flex',
    gap: '0.75rem',
    flexWrap: 'wrap'
  },
  label: {
    fontSize: '0.85rem',
    fontWeight: '700',
    color: '#334155'
  },
  input: {
    padding: '0.65rem 0.85rem',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    fontSize: '0.95rem',
    color: '#0f172a',
    outline: 'none',
    boxSizing: 'border-box',
    width: '100%'
  },
  select: {
    padding: '0.65rem 0.85rem',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    fontSize: '0.95rem',
    color: '#0f172a',
    backgroundColor: '#ffffff',
    outline: 'none',
    boxSizing: 'border-box',
    width: '100%'
  },
  textarea: {
    padding: '0.65rem 0.85rem',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    fontSize: '0.95rem',
    color: '#0f172a',
    outline: 'none',
    resize: 'vertical',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
    width: '100%'
  },
  securityNote: {
    padding: '0.6rem 0.8rem',
    backgroundColor: '#ecfeff',
    border: '1px solid #a5f3fc',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    fontSize: '0.78rem',
    color: '#0e7490'
  },
  btnSubmit: {
    backgroundColor: '#0891b2',
    color: '#ffffff',
    border: 'none',
    padding: '0.85rem 1.25rem',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    boxShadow: '0 4px 12px rgba(8,145,178,0.25)',
    transition: 'all 0.2s ease',
    marginTop: '0.5rem'
  },
  successCard: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '2rem 1.5rem',
    textAlign: 'center',
    boxShadow: '0 6px 20px rgba(0,0,0,0.06)',
    border: '1px solid #e2e8f0',
    marginTop: '1rem'
  },
  successIconBox: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '0.75rem'
  },
  successBadge: {
    display: 'inline-block',
    fontSize: '0.75rem',
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    backgroundColor: '#dcfce7',
    color: '#15803d',
    padding: '0.25rem 0.75rem',
    borderRadius: '20px',
    marginBottom: '0.5rem'
  },
  successTitle: {
    fontSize: '1.4rem',
    fontWeight: '800',
    color: '#0f172a',
    margin: '0 0 0.5rem'
  },
  successSub: {
    fontSize: '0.9rem',
    color: '#64748b',
    margin: '0 0 1.5rem'
  },
  protocolBox: {
    backgroundColor: '#f0fdf4',
    border: '2px dashed #86efac',
    borderRadius: '12px',
    padding: '1rem',
    marginBottom: '1.5rem'
  },
  protocolLabel: {
    fontSize: '0.75rem',
    fontWeight: '700',
    color: '#166534',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  protocolNumber: {
    fontSize: '1.8rem',
    fontWeight: '900',
    color: '#15803d',
    margin: '0.25rem 0'
  },
  protocolDate: {
    fontSize: '0.75rem',
    color: '#64748b'
  },
  detailsList: {
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    padding: '1rem',
    marginBottom: '1.5rem',
    border: '1px solid #e2e8f0',
    textAlign: 'left',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
  },
  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.85rem'
  },
  detailLabel: {
    color: '#64748b',
    fontWeight: '600'
  },
  detailVal: {
    color: '#0f172a',
    fontWeight: '700'
  },
  actionsBox: {
    display: 'flex',
    gap: '0.75rem',
    justifyContent: 'center',
    flexWrap: 'wrap'
  },
  btnPrimary: {
    backgroundColor: '#0891b2',
    color: '#ffffff',
    border: 'none',
    padding: '0.7rem 1.25rem',
    borderRadius: '8px',
    fontSize: '0.9rem',
    fontWeight: '700',
    cursor: 'pointer'
  },
  btnSecondary: {
    backgroundColor: '#f1f5f9',
    color: '#334155',
    border: '1px solid #cbd5e1',
    padding: '0.7rem 1.25rem',
    borderRadius: '8px',
    fontSize: '0.9rem',
    fontWeight: '700',
    cursor: 'pointer'
  }
};
