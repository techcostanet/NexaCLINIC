import React, { useState, useEffect, useMemo } from 'react';
import {
  Utensils,
  Sun,
  Moon,
  Clock,
  Settings,
  Share2,
  Copy,
  Check,
  CheckCircle2,
  XCircle,
  Calendar,
  Search,
  Filter,
  DollarSign,
  Users,
  FileText,
  Printer,
  RefreshCw,
  QrCode,
  AlertTriangle
} from 'lucide-react';
import QRCode from 'qrcode';
import {
  getMealSettings,
  updateMealSettings,
  subscribeDateMealOrders,
  updateMealOrderStatus,
  cancelMealOrder,
  deleteMealOrder,
  getTodayDateStr
} from '../../../services/firebase/mealService';
import { formatCurrency, formatDateBR } from '../../../services/firebase/foodWasteService';

export default function FoodMealsTab() {
  const [selectedDate, setSelectedDate] = useState(getTodayDateStr());
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState(null);

  // Filtros
  const [filterMeal, setFilterMeal] = useState('todos'); // 'todos' | 'almoco' | 'jantar'
  const [filterStatus, setFilterStatus] = useState('todos'); // 'todos' | 'solicitado' | 'entregue' | 'cancelado'
  const [search, setSearch] = useState('');

  // Modais
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  // Form de Configuração
  const [configForm, setConfigForm] = useState({
    lunchCutoff: '09:30',
    dinnerCutoff: '15:30',
    chargeMode: 'coparticipation',
    employeeCost: 5.00,
    supplierCost: 18.00
  });
  const [savingConfig, setSavingConfig] = useState(false);

  // Link & QR Code
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedWhatsapp, setCopiedWhatsapp] = useState(false);

  const publicMealUrl = `${window.location.origin}/#/marmitas`;

  // Carrega configurações iniciais
  useEffect(() => {
    getMealSettings().then(res => {
      setSettings(res);
      setConfigForm({
        lunchCutoff: res.lunchCutoff || '09:30',
        dinnerCutoff: res.dinnerCutoff || '15:30',
        chargeMode: res.chargeMode || 'coparticipation',
        employeeCost: Number(res.employeeCost) || 5.00,
        supplierCost: Number(res.supplierCost) || 18.00
      });
    });
  }, []);

  // Assina pedidos em tempo real para a data selecionada
  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeDateMealOrders(selectedDate, (list) => {
      setOrders(list);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [selectedDate]);

  // Gera QR Code quando o modal de link abre
  useEffect(() => {
    if (showLinkModal) {
      QRCode.toDataURL(publicMealUrl, { width: 220, margin: 2 }, (err, url) => {
        if (!err) setQrCodeUrl(url);
      });
    }
  }, [showLinkModal, publicMealUrl]);

  // Cálculos e Estatísticas do Dia
  const stats = useMemo(() => {
    const activeOrders = orders.filter(o => o.status !== 'cancelado');
    const almocoCount = activeOrders.filter(o => o.mealType === 'almoco').length;
    const jantarCount = activeOrders.filter(o => o.mealType === 'jantar').length;
    const deliveredCount = activeOrders.filter(o => o.status === 'entregue').length;
    const supplierTotal = activeOrders.reduce((sum, o) => sum + (Number(o.price) || 0), 0);
    const discountTotal = activeOrders.reduce((sum, o) => sum + (Number(o.discountValue) || 0), 0);

    return {
      total: activeOrders.length,
      almoco: almocoCount,
      jantar: jantarCount,
      entregues: deliveredCount,
      fornecedor: supplierTotal,
      desconto: discountTotal
    };
  }, [orders]);

  // Filtro de lista
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      if (filterMeal !== 'todos' && o.mealType !== filterMeal) return false;
      if (filterStatus !== 'todos' && o.status !== filterStatus) return false;
      if (search) {
        const q = search.toLowerCase();
        const nameMatch = (o.employeeName || '').toLowerCase().includes(q);
        const cpfMatch = (o.employeeCpf || '').replace(/\D/g, '').includes(q.replace(/\D/g, ''));
        const sectorMatch = (o.sector || '').toLowerCase().includes(q);
        if (!nameMatch && !cpfMatch && !sectorMatch) return false;
      }
      return true;
    });
  }, [orders, filterMeal, filterStatus, search]);

  // Ações de pedido
  const handleToggleDelivered = async (order) => {
    const newStatus = order.status === 'entregue' ? 'solicitado' : 'entregue';
    try {
      await updateMealOrderStatus(order.id, newStatus);
    } catch (err) {
      alert('Erro ao atualizar status: ' + err.message);
    }
  };

  const handleCancel = async (orderId) => {
    if (!window.confirm('Deseja realmente cancelar este pedido?')) return;
    try {
      await cancelMealOrder(orderId);
    } catch (err) {
      alert('Erro ao cancelar: ' + err.message);
    }
  };

  // Salvar Configurações
  const handleSaveConfig = async (e) => {
    e.preventDefault();
    setSavingConfig(true);
    try {
      const updated = await updateMealSettings(configForm);
      setSettings(updated);
      setShowSettingsModal(false);
    } catch (err) {
      alert('Erro ao salvar configurações: ' + err.message);
    } finally {
      setSavingConfig(false);
    }
  };

  const copyToClipboard = (text, setter) => {
    navigator.clipboard.writeText(text);
    setter(true);
    setTimeout(() => setter(false), 2000);
  };

  // Texto formatado para o Fornecedor
  const whatsappText = useMemo(() => {
    const active = orders.filter(o => o.status !== 'cancelado');
    const almocoList = active.filter(o => o.mealType === 'almoco');
    const jantarList = active.filter(o => o.mealType === 'jantar');

    return `🍱 *PEDIDO DE MARMITAS - NEXA CLINIC*\n` +
      `📅 *Data:* ${formatDateBR(selectedDate)}\n\n` +
      `📊 *TOTAL GERAL: ${active.length} marmitas*\n` +
      `☀️ *Almoço:* ${almocoList.length} marmitas\n` +
      `🌙 *Jantar:* ${jantarList.length} marmitas\n\n` +
      `_Gerado automaticamente pelo NexAi CLINIC em ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}._`;
  }, [orders, selectedDate]);

  return (
    <div style={styles.container}>
      {/* BARRA SUPERIOR DE AÇÕES & CONTROLES */}
      <div style={styles.topBar}>
        <div style={styles.dateSelector}>
          <Calendar size={18} color="#0284c7" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={styles.dateInput}
          />
        </div>

        <div style={styles.topActions}>
          <button
            onClick={() => setShowExportModal(true)}
            style={styles.actionBtnOutline}
            title="Exportar lista para o fornecedor"
          >
            <Share2 size={16} />
            Exportar
          </button>

          <button
            onClick={() => setShowLinkModal(true)}
            style={styles.actionBtnOutline}
            title="Link e QR Code para colaboradores"
          >
            <QrCode size={16} />
            Link
          </button>

          <button
            onClick={() => setShowSettingsModal(true)}
            style={styles.actionBtnPrimary}
            title="Configurações de horários e valores"
          >
            <Settings size={16} />
            Configuração
          </button>
        </div>
      </div>

      {/* STAT CARDS RESUMO DO DIA */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <span style={styles.statTitle}>Pedidos</span>
          <strong style={styles.statNumber}>{stats.total}</strong>
          <span style={styles.statSub}>refeições solicitadas</span>
        </div>

        <div style={styles.statCard}>
          <span style={styles.statTitle}>Almoço</span>
          <strong style={{ ...styles.statNumber, color: '#d97706' }}>{stats.almoco}</strong>
          <span style={styles.statSub}>corte às {settings?.lunchCutoff || '09:30'}</span>
        </div>

        <div style={styles.statCard}>
          <span style={styles.statTitle}>Jantar</span>
          <strong style={{ ...styles.statNumber, color: '#7c3aed' }}>{stats.jantar}</strong>
          <span style={styles.statSub}>corte às {settings?.dinnerCutoff || '15:30'}</span>
        </div>

        <div style={styles.statCard}>
          <span style={styles.statTitle}>Entregues</span>
          <strong style={{ ...styles.statNumber, color: '#059669' }}>{stats.entregues}</strong>
          <span style={styles.statSub}>check-in concluído</span>
        </div>

        <div style={styles.statCard}>
          <span style={styles.statTitle}>Fornecedor</span>
          <strong style={styles.statNumber}>{formatCurrency(stats.fornecedor)}</strong>
          <span style={styles.statSub}>custo total do lote</span>
        </div>

        <div style={styles.statCard}>
          <span style={styles.statTitle}>Desconto</span>
          <strong style={{ ...styles.statNumber, color: '#dc2626' }}>{formatCurrency(stats.desconto)}</strong>
          <span style={styles.statSub}>desconto em folha</span>
        </div>
      </div>

      {/* FILTROS E BARRA DE PESQUISA */}
      <div style={styles.filterBar}>
        <div style={styles.searchWrapper}>
          <Search size={16} style={styles.searchIcon} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Pesquisar por colaborador, CPF ou setor..."
            style={styles.searchInput}
          />
        </div>

        <div style={styles.selectWrapper}>
          <label style={styles.filterLabel}>Refeição</label>
          <select
            value={filterMeal}
            onChange={(e) => setFilterMeal(e.target.value)}
            style={styles.selectInput}
          >
            <option value="todos">Todos</option>
            <option value="almoco">Almoço</option>
            <option value="jantar">Jantar</option>
          </select>
        </div>

        <div style={styles.selectWrapper}>
          <label style={styles.filterLabel}>Status</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={styles.selectInput}
          >
            <option value="todos">Todos</option>
            <option value="solicitado">Solicitado</option>
            <option value="entregue">Entregue</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>
      </div>

      {/* TABELA DE PEDIDOS */}
      <div style={styles.tableCard}>
        {loading ? (
          <div style={styles.loadingBox}>
            <RefreshCw size={24} className="animate-spin" color="#0284c7" />
            <span>Carregando pedidos de marmitas...</span>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div style={styles.emptyBox}>
            <Utensils size={36} color="#cbd5e1" style={{ marginBottom: '8px' }} />
            <p style={{ margin: 0, fontWeight: 600, color: '#64748b' }}>Nenhum pedido registrado para este filtro.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Data</th>
                  <th style={styles.th}>Colaborador</th>
                  <th style={styles.th}>CPF</th>
                  <th style={styles.th}>Setor</th>
                  <th style={styles.th}>Refeição</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Desconto</th>
                  <th style={{ ...styles.th, textAlign: 'center' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map(order => {
                  const isDelivered = order.status === 'entregue';
                  const isCancelled = order.status === 'cancelado';

                  return (
                    <tr key={order.id} style={{
                      ...styles.tr,
                      backgroundColor: isCancelled ? '#fff5f5' : isDelivered ? '#f0fdf4' : '#ffffff'
                    }}>
                      <td style={styles.td}>{formatDateBR(order.date)}</td>
                      <td style={{ ...styles.td, fontWeight: 600 }}>{order.employeeName}</td>
                      <td style={styles.td}>{order.employeeCpf || '—'}</td>
                      <td style={styles.td}>{order.sector}</td>
                      <td style={styles.td}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          color: order.mealType === 'jantar' ? '#7c3aed' : '#d97706'
                        }}>
                          {order.mealType === 'jantar' ? <Moon size={14} /> : <Sun size={14} />}
                          {order.mealType === 'jantar' ? 'Jantar' : 'Almoço'}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <span style={{
                          ...styles.statusBadge,
                          backgroundColor: isCancelled ? '#fee2e2' : isDelivered ? '#dcfce7' : '#e0f2fe',
                          color: isCancelled ? '#991b1b' : isDelivered ? '#166534' : '#0369a1'
                        }}>
                          {isCancelled ? 'Cancelado' : isDelivered ? 'Entregue' : 'Solicitado'}
                        </span>
                      </td>
                      <td style={{ ...styles.td, fontWeight: 600 }}>
                        {formatCurrency(order.discountValue)}
                      </td>
                      <td style={{ ...styles.td, textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          {!isCancelled && (
                            <button
                              onClick={() => handleToggleDelivered(order)}
                              title={isDelivered ? 'Desmarcar entrega' : 'Confirmar entrega'}
                              style={{
                                ...styles.tableActionBtn,
                                backgroundColor: isDelivered ? '#e2e8f0' : '#10b981',
                                color: isDelivered ? '#475569' : '#ffffff'
                              }}
                            >
                              <Check size={14} />
                              {isDelivered ? 'Entregue' : 'Entregar'}
                            </button>
                          )}
                          {!isCancelled && (
                            <button
                              onClick={() => handleCancel(order.id)}
                              title="Cancelar pedido"
                              style={{
                                ...styles.tableActionBtn,
                                backgroundColor: '#fee2e2',
                                color: '#dc2626'
                              }}
                            >
                              <XCircle size={14} />
                              Cancelar
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL CONFIGURAÇÃO */}
      {showSettingsModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Configuração</h3>
              <button onClick={() => setShowSettingsModal(false)} style={styles.modalCloseBtn}>×</button>
            </div>

            <form onSubmit={handleSaveConfig} style={styles.modalBody}>
              <div style={styles.formSection}>
                <h4 style={styles.sectionHeading}>Horários</h4>
                <div style={styles.formRow}>
                  <div style={styles.formGroup}>
                    <label style={styles.inputLabel}>Almoço</label>
                    <input
                      type="time"
                      value={configForm.lunchCutoff}
                      onChange={(e) => setConfigForm({ ...configForm, lunchCutoff: e.target.value })}
                      required
                      style={styles.modalInput}
                    />
                    <span style={styles.subText}>Horário limite para pedidos</span>
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.inputLabel}>Jantar</label>
                    <input
                      type="time"
                      value={configForm.dinnerCutoff}
                      onChange={(e) => setConfigForm({ ...configForm, dinnerCutoff: e.target.value })}
                      required
                      style={styles.modalInput}
                    />
                    <span style={styles.subText}>Horário limite para pedidos</span>
                  </div>
                </div>
              </div>

              <div style={styles.formSection}>
                <h4 style={styles.sectionHeading}>Cobrança</h4>
                <div style={styles.formGroup}>
                  <label style={styles.inputLabel}>Modalidade</label>
                  <select
                    value={configForm.chargeMode}
                    onChange={(e) => setConfigForm({ ...configForm, chargeMode: e.target.value })}
                    style={styles.modalInput}
                  >
                    <option value="coparticipation">Coparticipação (Valor fixo subsidiado)</option>
                    <option value="integral">Integral (Desconto de 100% do custo)</option>
                  </select>
                </div>

                <div style={styles.formRow}>
                  <div style={styles.formGroup}>
                    <label style={styles.inputLabel}>Fornecedor</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={configForm.supplierCost}
                      onChange={(e) => setConfigForm({ ...configForm, supplierCost: e.target.value })}
                      required
                      style={styles.modalInput}
                    />
                    <span style={styles.subText}>Custo pago à fornecedora (R$)</span>
                  </div>

                  {configForm.chargeMode === 'coparticipation' && (
                    <div style={styles.formGroup}>
                      <label style={styles.inputLabel}>Colaborador</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={configForm.employeeCost}
                        onChange={(e) => setConfigForm({ ...configForm, employeeCost: e.target.value })}
                        required
                        style={styles.modalInput}
                      />
                      <span style={styles.subText}>Valor a descontar em folha (R$)</span>
                    </div>
                  )}
                </div>
              </div>

              <div style={styles.modalFooter}>
                <button
                  type="button"
                  onClick={() => setShowSettingsModal(false)}
                  style={styles.btnSecondary}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingConfig}
                  style={styles.btnPrimary}
                >
                  {savingConfig ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL LINK & QR CODE */}
      {showLinkModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Link</h3>
              <button onClick={() => setShowLinkModal(false)} style={styles.modalCloseBtn}>×</button>
            </div>

            <div style={styles.modalBody}>
              <p style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: '#64748b' }}>
                Compartilhe este link ou QR Code com os colaboradores da clínica para solicitar as marmitas:
              </p>

              {qrCodeUrl && (
                <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
                  <img src={qrCodeUrl} alt="QR Code Marmitas" style={{ borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                  <p style={{ margin: '6px 0 0 0', fontSize: '0.75rem', color: '#94a3b8' }}>Aponte a câmera do celular</p>
                </div>
              )}

              <div style={styles.linkCopyBox}>
                <input
                  type="text"
                  readOnly
                  value={publicMealUrl}
                  style={styles.linkInput}
                />
                <button
                  onClick={() => copyToClipboard(publicMealUrl, setCopiedLink)}
                  style={styles.copyBtn}
                >
                  {copiedLink ? <Check size={16} /> : <Copy size={16} />}
                  {copiedLink ? 'Copiado' : 'Copiar'}
                </button>
              </div>
            </div>

            <div style={styles.modalFooter}>
              <button onClick={() => setShowLinkModal(false)} style={styles.btnPrimary}>
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EXPORTAR PARA FORNECEDOR */}
      {showExportModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Exportar</h3>
              <button onClick={() => setShowExportModal(false)} style={styles.modalCloseBtn}>×</button>
            </div>

            <div style={styles.modalBody}>
              <p style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', color: '#64748b' }}>
                Copie o texto resumido para enviar ao fornecedor via WhatsApp ou clique em imprimir:
              </p>

              <textarea
                readOnly
                value={whatsappText}
                rows={8}
                style={styles.exportTextarea}
              />
            </div>

            <div style={styles.modalFooter}>
              <button
                onClick={() => window.print()}
                style={styles.btnSecondary}
              >
                <Printer size={16} />
                Imprimir
              </button>
              <button
                onClick={() => copyToClipboard(whatsappText, setCopiedWhatsapp)}
                style={styles.btnPrimary}
              >
                {copiedWhatsapp ? <Check size={16} /> : <Copy size={16} />}
                {copiedWhatsapp ? 'Copiado!' : 'Copiar WhatsApp'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem'
  },
  topBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '12px',
    backgroundColor: '#ffffff',
    padding: '12px 18px',
    borderRadius: '12px',
    border: '1px solid #e2e8f0'
  },
  dateSelector: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  dateInput: {
    padding: '8px 12px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    fontSize: '0.9rem',
    fontWeight: 600,
    outline: 'none'
  },
  topActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  actionBtnOutline: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 14px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    backgroundColor: '#ffffff',
    color: '#334155',
    fontWeight: 600,
    fontSize: '0.85rem',
    cursor: 'pointer'
  },
  actionBtnPrimary: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 14px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#0284c7',
    color: '#ffffff',
    fontWeight: 600,
    fontSize: '0.85rem',
    cursor: 'pointer'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '12px'
  },
  statCard: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  statTitle: {
    fontSize: '0.75rem',
    fontWeight: 700,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.04em'
  },
  statNumber: {
    fontSize: '1.6rem',
    fontWeight: 800,
    color: '#0f172a'
  },
  statSub: {
    fontSize: '0.75rem',
    color: '#94a3b8'
  },
  filterBar: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '12px',
    backgroundColor: '#ffffff',
    padding: '12px 18px',
    borderRadius: '12px',
    border: '1px solid #e2e8f0'
  },
  searchWrapper: {
    flex: 1,
    minWidth: '220px',
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },
  searchIcon: {
    position: 'absolute',
    left: '10px',
    color: '#94a3b8'
  },
  searchInput: {
    width: '100%',
    padding: '8px 12px 8px 34px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    fontSize: '0.85rem',
    outline: 'none'
  },
  selectWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  filterLabel: {
    fontSize: '0.8rem',
    fontWeight: 600,
    color: '#64748b'
  },
  selectInput: {
    padding: '7px 10px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    fontSize: '0.85rem',
    outline: 'none'
  },
  tableCard: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    overflow: 'hidden'
  },
  loadingBox: {
    padding: '3rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    color: '#64748b',
    fontSize: '0.9rem'
  },
  emptyBox: {
    padding: '3.5rem 1rem',
    textAlign: 'center'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.85rem'
  },
  th: {
    textAlign: 'left',
    padding: '10px 14px',
    backgroundColor: '#f8fafc',
    color: '#475569',
    fontWeight: 700,
    borderBottom: '1px solid #e2e8f0',
    fontSize: '0.75rem',
    textTransform: 'uppercase',
    letterSpacing: '0.04em'
  },
  tr: {
    borderBottom: '1px solid #f1f5f9',
    transition: 'background-color 0.15s'
  },
  td: {
    padding: '12px 14px',
    color: '#334155',
    verticalAlign: 'middle'
  },
  statusBadge: {
    display: 'inline-block',
    padding: '3px 8px',
    borderRadius: '999px',
    fontSize: '0.75rem',
    fontWeight: 700,
    textTransform: 'uppercase'
  },
  tableActionBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '5px 9px',
    borderRadius: '6px',
    border: 'none',
    fontSize: '0.75rem',
    fontWeight: 600,
    cursor: 'pointer'
  },

  // Modais
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
    padding: '1rem'
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderRadius: '14px',
    width: '100%',
    maxWidth: '520px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.25)',
    overflow: 'hidden'
  },
  modalHeader: {
    padding: '14px 18px',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc'
  },
  modalTitle: {
    margin: 0,
    fontSize: '1.05rem',
    fontWeight: 700,
    color: '#0f172a'
  },
  modalCloseBtn: {
    background: 'none',
    border: 'none',
    fontSize: '1.4rem',
    color: '#64748b',
    cursor: 'pointer'
  },
  modalBody: {
    padding: '18px',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem'
  },
  formSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  sectionHeading: {
    margin: 0,
    fontSize: '0.85rem',
    fontWeight: 700,
    color: '#0f172a',
    textTransform: 'uppercase',
    letterSpacing: '0.04em'
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  inputLabel: {
    fontSize: '0.8rem',
    fontWeight: 600,
    color: '#334155'
  },
  modalInput: {
    padding: '8px 10px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    fontSize: '0.85rem',
    outline: 'none'
  },
  subText: {
    fontSize: '0.7rem',
    color: '#94a3b8'
  },
  modalFooter: {
    padding: '12px 18px',
    borderTop: '1px solid #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '8px',
    backgroundColor: '#f8fafc'
  },
  btnSecondary: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 14px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    backgroundColor: '#ffffff',
    color: '#334155',
    fontWeight: 600,
    fontSize: '0.85rem',
    cursor: 'pointer'
  },
  btnPrimary: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#0284c7',
    color: '#ffffff',
    fontWeight: 600,
    fontSize: '0.85rem',
    cursor: 'pointer'
  },
  linkCopyBox: {
    display: 'flex',
    gap: '8px'
  },
  linkInput: {
    flex: 1,
    padding: '8px 10px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    backgroundColor: '#f8fafc',
    fontSize: '0.85rem'
  },
  copyBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 14px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#0284c7',
    color: '#ffffff',
    fontWeight: 600,
    fontSize: '0.85rem',
    cursor: 'pointer'
  },
  exportTextarea: {
    width: '100%',
    padding: '10px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    fontFamily: 'monospace',
    fontSize: '0.85rem',
    boxSizing: 'border-box',
    resize: 'vertical'
  }
};
