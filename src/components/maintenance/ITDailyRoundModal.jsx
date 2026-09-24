import React, { useState, useEffect } from 'react';
import { 
  X, Check, ShieldCheck, AlertTriangle, AlertCircle, 
  Wifi, Server, Printer, QrCode, Cpu, Clock, History, Calendar, CheckCircle2
} from 'lucide-react';
import { dbService } from '../../firebase';

const ROUND_ITEMS = [
  { id: 'internetPrimary', label: 'Link Principal', sub: 'Fibra Óptica / Provedor Primário', icon: Wifi },
  { id: 'internetSecondary', label: 'Link Reserva', sub: 'Modem 4G/5G / Provedor Secundário', icon: Wifi },
  { id: 'serverRoomTemp', label: 'CPD Climatização', sub: 'Ar-condicionado 18°C a 20°C', icon: Server },
  { id: 'nightlyBackup', label: 'Backup Noturno', sub: 'Integridade dos dados NexaCLINIC', icon: ShieldCheck },
  { id: 'nobreaks', label: 'Nobreaks', sub: 'Baterias e ausência de alarmes', icon: Cpu },
  { id: 'zebraPrinters', label: 'Impressoras Zebra', sub: 'Calibração e ribbon dos dialisadores', icon: Printer },
  { id: 'barcodeScanners', label: 'Leitores Barcode', sub: 'Leitura rápida nos postos de diálise', icon: QrCode },
  { id: 'receptionTerminals', label: 'Terminais', sub: 'Recepção, triagem e consultórios', icon: Cpu }
];

export default function ITDailyRoundModal({ isOpen, onClose, currentUser, onRoundSaved }) {
  const [activeSubTab, setActiveSubTab] = useState('checklist'); // 'checklist' | 'history'
  const [roundsHistory, setRoundsHistory] = useState([]);
  const [technician, setTechnician] = useState(currentUser?.name || 'Lucas T.I.');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const [itemsStatus, setItemsStatus] = useState({
    internetPrimary: 'conforme',
    internetSecondary: 'conforme',
    serverRoomTemp: 'conforme',
    nightlyBackup: 'conforme',
    nobreaks: 'conforme',
    zebraPrinters: 'conforme',
    barcodeScanners: 'conforme',
    receptionTerminals: 'conforme'
  });

  useEffect(() => {
    if (isOpen) {
      loadHistory();
    }
  }, [isOpen]);

  const loadHistory = async () => {
    setLoadingHistory(true);
    try {
      if (dbService.getITDailyRounds) {
        const data = await dbService.getITDailyRounds();
        setRoundsHistory(data || []);
      }
    } catch (e) {
      console.warn('Erro ao carregar histórico de rondas:', e);
    } finally {
      setLoadingHistory(false);
    }
  };

  if (!isOpen) return null;

  const setItemValue = (id, val) => {
    setItemsStatus(prev => ({ ...prev, [id]: val }));
  };

  const calculateOverallStatus = () => {
    const vals = Object.values(itemsStatus);
    if (vals.includes('falha')) return 'Crítico';
    if (vals.includes('atencao')) return 'Atenção';
    return 'Conforme';
  };

  const handleSaveRound = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const overall = calculateOverallStatus();
      const roundPayload = {
        date: new Date().toISOString(),
        technician: technician.trim() || 'Equipe T.I.',
        status: overall,
        items: itemsStatus,
        notes: notes.trim(),
        summary: overall === 'Conforme' 
          ? 'Ronda matinal 100% conforme. Todos os sistemas e links validados.'
          : overall === 'Atenção'
          ? 'Ronda concluída com alertas pontuais em observação.'
          : 'Ronda identificou falha crítica com atuação imediata necessária.'
      };

      if (dbService.saveITDailyRound) {
        await dbService.saveITDailyRound(roundPayload);
      }
      if (typeof onRoundSaved === 'function') {
        onRoundSaved(roundPayload);
      }
      onClose();
    } catch (err) {
      console.error('Erro ao salvar ronda diária:', err);
    } finally {
      setSaving(false);
    }
  };

  const overall = calculateOverallStatus();

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        {/* Header */}
        <div style={styles.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={styles.iconBox}>
              <ShieldCheck size={22} color="#0284c7" />
            </div>
            <div>
              <h2 style={styles.title}>Ronda Diária</h2>
              <p style={styles.subtitle}>Checklist de rotina matinal da infraestrutura de T.I.</p>
            </div>
          </div>
          <button type="button" onClick={onClose} style={styles.closeBtn}>
            <X size={18} />
          </button>
        </div>

        {/* Tab switcher */}
        <div style={styles.tabBar}>
          <button 
            type="button"
            onClick={() => setActiveSubTab('checklist')}
            style={{ ...styles.tabBtn, ...(activeSubTab === 'checklist' ? styles.tabBtnActive : {}) }}
          >
            <CheckCircle2 size={15} /> Checklist
          </button>
          <button 
            type="button"
            onClick={() => setActiveSubTab('history')}
            style={{ ...styles.tabBtn, ...(activeSubTab === 'history' ? styles.tabBtnActive : {}) }}
          >
            <History size={15} /> Histórico ({roundsHistory.length})
          </button>
        </div>

        {activeSubTab === 'checklist' ? (
          <form onSubmit={handleSaveRound} style={styles.content}>
            {/* Status Preview Card */}
            <div style={{
              ...styles.statusBanner,
              backgroundColor: overall === 'Conforme' ? '#f0fdf4' : overall === 'Atenção' ? '#fffbeb' : '#fef2f2',
              borderColor: overall === 'Conforme' ? '#bbf7d0' : overall === 'Atenção' ? '#fde68a' : '#fecaca'
            }}>
              <div>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: overall === 'Conforme' ? '#166534' : overall === 'Atenção' ? '#92400e' : '#991b1b'
                }}>
                  Avaliação Geral
                </span>
                <div style={{
                  fontSize: '16px',
                  fontWeight: 800,
                  color: overall === 'Conforme' ? '#15803d' : overall === 'Atenção' ? '#b45309' : '#b91c1c'
                }}>
                  {overall}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '11px', color: '#64748b' }}>Data</span>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>
                  {new Date().toLocaleDateString('pt-BR')} (Hoje)
                </div>
              </div>
            </div>

            {/* Checklist items */}
            <div style={styles.itemsList}>
              {ROUND_ITEMS.map((item) => {
                const ItemIcon = item.icon;
                const currentVal = itemsStatus[item.id];

                return (
                  <div key={item.id} style={styles.itemRow}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                      <div style={styles.itemIcon}>
                        <ItemIcon size={16} color="#475569" />
                      </div>
                      <div>
                        <div style={styles.itemTitle}>{item.label}</div>
                        <div style={styles.itemSub}>{item.sub}</div>
                      </div>
                    </div>

                    <div style={styles.toggleGroup}>
                      <button
                        type="button"
                        onClick={() => setItemValue(item.id, 'conforme')}
                        style={{
                          ...styles.toggleBtn,
                          backgroundColor: currentVal === 'conforme' ? '#16a34a' : '#f1f5f9',
                          color: currentVal === 'conforme' ? '#ffffff' : '#64748b',
                          borderColor: currentVal === 'conforme' ? '#15803d' : '#cbd5e1'
                        }}
                      >
                        Conforme
                      </button>

                      <button
                        type="button"
                        onClick={() => setItemValue(item.id, 'atencao')}
                        style={{
                          ...styles.toggleBtn,
                          backgroundColor: currentVal === 'atencao' ? '#f59e0b' : '#f1f5f9',
                          color: currentVal === 'atencao' ? '#ffffff' : '#64748b',
                          borderColor: currentVal === 'atencao' ? '#d97706' : '#cbd5e1'
                        }}
                      >
                        Atenção
                      </button>

                      <button
                        type="button"
                        onClick={() => setItemValue(item.id, 'falha')}
                        style={{
                          ...styles.toggleBtn,
                          backgroundColor: currentVal === 'falha' ? '#dc2626' : '#f1f5f9',
                          color: currentVal === 'falha' ? '#ffffff' : '#64748b',
                          borderColor: currentVal === 'falha' ? '#b91c1c' : '#cbd5e1'
                        }}
                      >
                        Falha
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Technician and Notes */}
            <div style={styles.metaRow}>
              <div style={{ flex: 1 }}>
                <label style={styles.label}>Técnico</label>
                <input 
                  type="text" 
                  value={technician}
                  onChange={(e) => setTechnician(e.target.value)}
                  style={styles.input}
                  required
                />
              </div>
              <div style={{ flex: 2 }}>
                <label style={styles.label}>Observações</label>
                <input 
                  type="text" 
                  placeholder="Anotações técnicas da ronda matinal..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  style={styles.input}
                />
              </div>
            </div>

            {/* Footer */}
            <div style={styles.footer}>
              <button type="button" onClick={onClose} style={styles.btnSecondary}>
                Cancelar
              </button>
              <button type="submit" disabled={saving} style={styles.btnPrimary}>
                <Check size={16} /> {saving ? 'Salvando...' : 'Concluir'}
              </button>
            </div>
          </form>
        ) : (
          <div style={styles.historyContainer}>
            {loadingHistory ? (
              <div style={styles.emptyBox}>Carregando histórico de rondas...</div>
            ) : roundsHistory.length === 0 ? (
              <div style={styles.emptyBox}>Nenhuma ronda registrada até o momento.</div>
            ) : (
              roundsHistory.map((round) => (
                <div key={round.id} style={styles.historyCard}>
                  <div style={styles.historyHeader}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Calendar size={15} color="#64748b" />
                      <span style={{ fontWeight: 700, fontSize: '13px', color: '#1e293b' }}>
                        {new Date(round.date).toLocaleString('pt-BR')}
                      </span>
                    </div>
                    <span style={{
                      padding: '3px 8px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 700,
                      backgroundColor: round.status === 'Conforme' ? '#dcfce7' : round.status === 'Atenção' ? '#fef3c7' : '#fee2e2',
                      color: round.status === 'Conforme' ? '#166534' : round.status === 'Atenção' ? '#92400e' : '#991b1b',
                      border: `1px solid ${round.status === 'Conforme' ? '#bbf7d0' : round.status === 'Atenção' ? '#fde68a' : '#fca5a5'}`
                    }}>
                      {round.status}
                    </span>
                  </div>

                  <p style={{ margin: '6px 0', fontSize: '12px', color: '#475569' }}>
                    {round.summary || 'Ronda de infraestrutura executada com sucesso.'}
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#94a3b8', borderTop: '1px solid #f1f5f9', paddingTop: '6px', marginTop: '6px' }}>
                    <span>Técnico: <strong style={{ color: '#475569' }}>{round.technician}</strong></span>
                    {round.notes && <span>Obs: {round.notes}</span>}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
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
    maxWidth: '680px',
    maxHeight: '90vh',
    overflowY: 'auto',
    padding: '22px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    border: '1px solid #e2e8f0',
    display: 'flex',
    flexDirection: 'column'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #f1f5f9',
    paddingBottom: '14px',
    marginBottom: '14px'
  },
  iconBox: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    background: '#f0f9ff',
    border: '1px solid #bae6fd',
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
    padding: '4px'
  },
  tabBar: {
    display: 'flex',
    gap: '6px',
    marginBottom: '14px',
    background: '#f8fafc',
    padding: '4px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0'
  },
  tabBtn: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    padding: '7px 12px',
    borderRadius: '6px',
    border: 'none',
    background: 'transparent',
    color: '#64748b',
    fontSize: '12px',
    fontWeight: 600,
    cursor: 'pointer'
  },
  tabBtnActive: {
    background: '#0284c7',
    color: '#ffffff'
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  statusBanner: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 14px',
    borderRadius: '10px',
    border: '1px solid #bbf7d0'
  },
  itemsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    maxHeight: '340px',
    overflowY: 'auto',
    paddingRight: '4px'
  },
  itemRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 12px',
    borderRadius: '8px',
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    gap: '10px'
  },
  itemIcon: {
    width: '28px',
    height: '28px',
    borderRadius: '6px',
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  itemTitle: {
    fontSize: '12px',
    fontWeight: 700,
    color: '#1e293b'
  },
  itemSub: {
    fontSize: '10px',
    color: '#94a3b8'
  },
  toggleGroup: {
    display: 'flex',
    gap: '4px'
  },
  toggleBtn: {
    padding: '4px 8px',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    fontSize: '11px',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.15s ease'
  },
  metaRow: {
    display: 'flex',
    gap: '10px',
    marginTop: '6px'
  },
  label: {
    display: 'block',
    fontSize: '11px',
    fontWeight: 700,
    color: '#475569',
    marginBottom: '3px',
    textTransform: 'uppercase',
    letterSpacing: '0.4px'
  },
  input: {
    width: '100%',
    padding: '8px 10px',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    fontSize: '12px',
    color: '#0f172a',
    backgroundColor: '#ffffff',
    outline: 'none',
    boxSizing: 'border-box'
  },
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    borderTop: '1px solid #f1f5f9',
    paddingTop: '14px',
    marginTop: '8px'
  },
  btnSecondary: {
    padding: '8px 14px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    background: '#ffffff',
    color: '#475569',
    fontWeight: 600,
    fontSize: '12px',
    cursor: 'pointer'
  },
  btnPrimary: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    borderRadius: '8px',
    border: 'none',
    background: '#0284c7',
    color: '#ffffff',
    fontWeight: 600,
    fontSize: '12px',
    cursor: 'pointer'
  },
  historyContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    maxHeight: '400px',
    overflowY: 'auto'
  },
  historyCard: {
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    padding: '12px',
    boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
  },
  historyHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  emptyBox: {
    padding: '30px',
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: '13px'
  }
};
