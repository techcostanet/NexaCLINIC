import React, { useState, useEffect } from 'react';
import {
  Utensils,
  Sun,
  CheckCircle2,
  Clock,
  AlertTriangle,
  LogOut,
  User,
  Calendar,
  Lock,
  Eye,
  EyeOff,
  RefreshCw,
  FileText,
  DollarSign,
  ArrowRight,
  XCircle,
  HelpCircle,
  Smartphone,
  Share,
  PlusSquare,
  ChevronRight,
  Download
} from 'lucide-react';
import {
  getMealSettings,
  employeeMealLogin,
  createMealOrder,
  cancelMealOrder,
  getEmployeeOrders,
  isTimeCutoffPassed,
  getTodayDateStr,
  getTomorrowDateStr
} from '../../../services/firebase/mealService';
import { formatCurrency, formatDateBR } from '../../../services/firebase/foodWasteService';

export default function EmployeeMealPortal({ onExitPortal }) {
  const [session, setSession] = useState(() => {
    try {
      const saved = localStorage.getItem('nexai_meal_session');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Login form state
  const [cpf, setCpf] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Portal dashboard state
  const [settings, setSettings] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [actionLoading, setActionLoading] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState(null);

  // Seleção de data do pedido: 'hoje' | 'amanha'
  const [targetTab, setTargetTab] = useState('hoje');

  // PWA / Instalação no Celular
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isIos, setIsIos] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showIosInstallModal, setShowIosInstallModal] = useState(false);
  const [showInstallBanner, setShowInstallBanner] = useState(true);

  useEffect(() => {
    // Detecta modo Standalone (já instalado como App)
    const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;
    setIsStandalone(isStandaloneMode);

    // Detecta iOS (iPhone / iPad / iPod)
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent) && !window.MSStream;
    setIsIos(isIosDevice);

    // Captura evento de instalação PWA do Chrome / Android
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallApp = async () => {
    if (isIos) {
      setShowIosInstallModal(true);
      return;
    }

    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowInstallBanner(false);
      }
      setDeferredPrompt(null);
    } else {
      setShowIosInstallModal(true);
    }
  };

  // Máscara de CPF automática
  const maskCpf = (val) => {
    const digits = val.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
    if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
  };

  const handleCpfChange = (e) => {
    setCpf(maskCpf(e.target.value));
    setLoginError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    try {
      const res = await employeeMealLogin(cpf, password);
      if (!res.success) {
        setLoginError(res.error || 'Credenciais inválidas.');
        setLoginLoading(false);
        return;
      }

      setSession(res.employee);
      try {
        localStorage.setItem('nexai_meal_session', JSON.stringify(res.employee));
      } catch (_) {}
    } catch (err) {
      setLoginError('Falha ao autenticar. Verifique sua conexão e tente novamente.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    setSession(null);
    setPassword('');
    try {
      localStorage.removeItem('nexai_meal_session');
    } catch (_) {}
  };

  const loadData = async () => {
    if (!session?.id) return;
    setLoadingOrders(true);
    try {
      const [sets, ords] = await Promise.all([
        getMealSettings(),
        getEmployeeOrders(session.id)
      ]);
      setSettings(sets);
      setOrders(ords);
    } catch (err) {
      console.error('Erro ao carregar dados do portal:', err);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    if (session?.id) {
      loadData();
    }
  }, [session?.id]);

  const todayStr = getTodayDateStr();
  const tomorrowStr = getTomorrowDateStr();

  // Pedidos ativos
  const todayOrder = orders.find(o => o.date === todayStr && o.status !== 'cancelado');
  const tomorrowOrder = orders.find(o => o.date === tomorrowStr && o.status !== 'cancelado');

  // Cálculos do mês atual
  const currentYearMonth = todayStr.slice(0, 7);
  const currentMonthOrders = orders.filter(o => o.status !== 'cancelado' && String(o.date || '').startsWith(currentYearMonth));
  const totalMonthDiscount = currentMonthOrders.reduce((sum, o) => sum + (Number(o.discountValue) || 0), 0);

  // Validação de horário de corte
  const isTodayCutoff = isTimeCutoffPassed(settings?.lunchCutoff || '09:30');
  const isAdvanceCutoff = isTimeCutoffPassed(settings?.advanceCutoff || '16:00');

  const handleOrderMeal = async (targetDate) => {
    if (!session || !settings) return;
    setActionLoading(`order_${targetDate}`);
    setFeedbackMsg(null);

    try {
      await createMealOrder({
        employee: session,
        targetDate
      });
      const dayLabel = targetDate === todayStr ? 'hoje' : 'amanhã';
      setFeedbackMsg({ type: 'success', text: `Almoço de ${dayLabel} solicitado com sucesso!` });
      await loadData();
    } catch (err) {
      setFeedbackMsg({ type: 'error', text: err.message || 'Erro ao registrar pedido.' });
    } finally {
      setActionLoading('');
    }
  };

  const handleCancelMeal = async (orderId, targetDate) => {
    if (!window.confirm('Deseja realmente cancelar este pedido de almoço?')) return;
    setActionLoading(`cancel_${orderId}`);
    setFeedbackMsg(null);

    try {
      await cancelMealOrder(orderId, session.id);
      setFeedbackMsg({ type: 'info', text: 'Pedido de almoço cancelado.' });
      await loadData();
    } catch (err) {
      setFeedbackMsg({ type: 'error', text: err.message || 'Não foi possível cancelar o pedido.' });
    } finally {
      setActionLoading('');
    }
  };

  // Se não estiver logado, exibe tela de login mobile-first
  if (!session) {
    return (
      <div style={styles.loginContainer}>
        {/* BANNER DE INSTALAÇÃO NO CELULAR */}
        {!isStandalone && showInstallBanner && (
          <div style={styles.topInstallBar}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Smartphone size={18} color="#0284c7" />
              <span style={{ fontSize: '0.8rem', color: '#0f172a', fontWeight: 600 }}>
                {isIos ? 'Instalar no iPhone' : 'Instalar no Celular'}
              </span>
            </div>
            <button onClick={handleInstallApp} style={styles.installMiniBtn}>
              Instalar
            </button>
          </div>
        )}

        <div style={styles.loginCard}>
          <div style={styles.brandHeader}>
            <div style={styles.brandIcon}>
              <Utensils size={32} color="#fff" />
            </div>
            <h1 style={styles.brandTitle}>NexAi <span style={{ color: '#0ea5e9' }}>MARMITAS</span></h1>
            <p style={styles.brandSubtitle}>Solicitação e Reserva de Almoço</p>
          </div>

          <form onSubmit={handleLogin} style={styles.form}>
            {loginError && (
              <div style={styles.alertError}>
                <AlertTriangle size={18} style={{ flexShrink: 0 }} />
                <span>{loginError}</span>
              </div>
            )}

            <div style={styles.formGroup}>
              <label style={styles.label}>CPF</label>
              <div style={styles.inputWrapper}>
                <User size={18} style={styles.inputIcon} />
                <input
                  type="text"
                  value={cpf}
                  onChange={handleCpfChange}
                  placeholder="000.000.000-00"
                  required
                  autoFocus
                  inputMode="numeric"
                  style={styles.input}
                />
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Senha</label>
              <div style={styles.inputWrapper}>
                <Lock size={18} style={styles.inputIcon} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="4 primeiros dígitos do CPF"
                  required
                  style={{ ...styles.input, paddingRight: '42px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={styles.showPassBtn}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <span style={styles.helpText}>
                <HelpCircle size={13} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                Senha padrão: primeiros 4 dígitos do seu CPF. Para resetar, contate o RH.
              </span>
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              style={{ ...styles.submitBtn, opacity: loginLoading ? 0.7 : 1 }}
            >
              {loginLoading ? (
                <>
                  <RefreshCw size={18} className="animate-spin" style={{ marginRight: '8px' }} />
                  Entrando...
                </>
              ) : (
                <>
                  Entrar
                  <ArrowRight size={18} style={{ marginLeft: '8px' }} />
                </>
              )}
            </button>
          </form>

          {onExitPortal && (
            <button onClick={onExitPortal} style={styles.exitBtn}>
              Voltar ao sistema
            </button>
          )}
        </div>

        {/* MODAL DE INSTRUÇÃO PARA IPHONE */}
        {showIosInstallModal && (
          <div style={styles.modalOverlay}>
            <div style={styles.modalCard}>
              <div style={styles.modalHeader}>
                <h3 style={styles.modalTitle}>Instalar no iPhone</h3>
                <button onClick={() => setShowIosInstallModal(false)} style={styles.modalCloseBtn}>×</button>
              </div>
              <div style={styles.modalBody}>
                <p style={{ margin: '0 0 12px 0', fontSize: '0.85rem', color: '#475569' }}>
                  Para ter o aplicativo direto na tela de início do seu iPhone:
                </p>
                <div style={styles.stepItem}>
                  <div style={styles.stepNum}>1</div>
                  <div style={{ flex: 1, fontSize: '0.85rem' }}>
                    No navegador <strong>Safari</strong>, toque no ícone <strong>Compartilhar</strong> (quadrado com seta para cima <Share size={15} style={{ verticalAlign: 'middle' }} />) na barra inferior.
                  </div>
                </div>
                <div style={styles.stepItem}>
                  <div style={styles.stepNum}>2</div>
                  <div style={{ flex: 1, fontSize: '0.85rem' }}>
                    Role as opções para baixo e selecione <strong>"Adicionar à Tela de Início"</strong> (<PlusSquare size={15} style={{ verticalAlign: 'middle' }} />).
                  </div>
                </div>
                <div style={styles.stepItem}>
                  <div style={styles.stepNum}>3</div>
                  <div style={{ flex: 1, fontSize: '0.85rem' }}>
                    Toque em <strong>"Adicionar"</strong> no canto superior direito.
                  </div>
                </div>
              </div>
              <div style={styles.modalFooter}>
                <button onClick={() => setShowIosInstallModal(false)} style={styles.btnPrimary}>
                  Entendido
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // DASHBOARD PRINCIPAL DO COLABORADOR
  return (
    <div style={styles.dashboardContainer}>
      {/* BANNER INSTALAR APP SE NÃO ESTIVER EM MODO APP */}
      {!isStandalone && showInstallBanner && (
        <div style={styles.topInstallBar}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Smartphone size={18} color="#0284c7" />
            <span style={{ fontSize: '0.8rem', color: '#0f172a', fontWeight: 600 }}>
              Instale este portal como aplicativo no seu celular
            </span>
          </div>
          <button onClick={handleInstallApp} style={styles.installMiniBtn}>
            Instalar
          </button>
        </div>
      )}

      {/* HEADER DA APLICAÇÃO */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.headerLeft}>
            <div style={styles.smallBrandIcon}>
              <Utensils size={20} color="#fff" />
            </div>
            <div>
              <h2 style={styles.headerTitle}>NexAi Marmitas</h2>
              <div style={styles.headerUser}>
                <strong>{session.name}</strong> • <span>{session.sector}</span>
              </div>
            </div>
          </div>
          <div style={styles.headerRight}>
            <button onClick={loadData} title="Atualizar" style={styles.refreshBtn}>
              <RefreshCw size={16} className={loadingOrders ? 'animate-spin' : ''} />
            </button>
            <button onClick={handleLogout} style={styles.logoutBtn}>
              <LogOut size={16} />
              Sair
            </button>
          </div>
        </div>
      </header>

      <main style={styles.mainContent}>
        {feedbackMsg && (
          <div style={{
            ...styles.alertBanner,
            backgroundColor: feedbackMsg.type === 'success' ? '#dcfce7' : feedbackMsg.type === 'error' ? '#fee2e2' : '#e0f2fe',
            color: feedbackMsg.type === 'success' ? '#166534' : feedbackMsg.type === 'error' ? '#991b1b' : '#075985',
            borderColor: feedbackMsg.type === 'success' ? '#86efac' : feedbackMsg.type === 'error' ? '#fca5a5' : '#7dd3fc'
          }}>
            {feedbackMsg.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
            <span style={{ flex: 1, fontSize: '0.9rem' }}>{feedbackMsg.text}</span>
            <button onClick={() => setFeedbackMsg(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem' }}>×</button>
          </div>
        )}

        {/* NAVEGAÇÃO DE DIAS: HOJE vs AMANHÃ (RESERVA ANTECIPADA) */}
        <div style={styles.daySelectorContainer}>
          <button
            type="button"
            onClick={() => setTargetTab('hoje')}
            style={{
              ...styles.dayTabBtn,
              backgroundColor: targetTab === 'hoje' ? '#0284c7' : '#ffffff',
              color: targetTab === 'hoje' ? '#ffffff' : '#475569',
              borderColor: targetTab === 'hoje' ? '#0284c7' : '#cbd5e1'
            }}
          >
            <Calendar size={16} />
            <span>Hoje ({formatDateBR(todayStr)})</span>
            {todayOrder && (
              <span style={{
                ...styles.miniBadge,
                backgroundColor: targetTab === 'hoje' ? '#ffffff' : '#10b981',
                color: targetTab === 'hoje' ? '#0284c7' : '#ffffff'
              }}>
                ✓
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setTargetTab('amanha')}
            style={{
              ...styles.dayTabBtn,
              backgroundColor: targetTab === 'amanha' ? '#0284c7' : '#ffffff',
              color: targetTab === 'amanha' ? '#ffffff' : '#475569',
              borderColor: targetTab === 'amanha' ? '#0284c7' : '#cbd5e1'
            }}
          >
            <Clock size={16} />
            <span>Amanhã ({formatDateBR(tomorrowStr)})</span>
            {tomorrowOrder && (
              <span style={{
                ...styles.miniBadge,
                backgroundColor: targetTab === 'amanha' ? '#ffffff' : '#10b981',
                color: targetTab === 'amanha' ? '#0284c7' : '#ffffff'
              }}>
                ✓
              </span>
            )}
          </button>
        </div>

        {/* CONTEÚDO: PEDIDO DE HOJE */}
        {targetTab === 'hoje' && (
          <section style={{
            ...styles.mealCard,
            borderColor: todayOrder ? '#10b981' : '#e2e8f0',
            backgroundColor: todayOrder ? '#f0fdf4' : '#ffffff'
          }}>
            <div style={styles.mealCardHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ ...styles.mealIconBox, backgroundColor: '#fef3c7', color: '#d97706' }}>
                  <Sun size={24} />
                </div>
                <div>
                  <h3 style={styles.mealTitle}>Almoço de Hoje</h3>
                  <span style={styles.mealCutoff}>
                    <Clock size={13} style={{ marginRight: '4px' }} />
                    Limite para hoje: até {settings?.lunchCutoff || '09:30'}
                  </span>
                </div>
              </div>

              {todayOrder ? (
                <span style={{
                  ...styles.badge,
                  backgroundColor: todayOrder.status === 'entregue' ? '#dcfce7' : '#e0f2fe',
                  color: todayOrder.status === 'entregue' ? '#166534' : '#0369a1'
                }}>
                  {todayOrder.status === 'entregue' ? 'Entregue' : 'Solicitado'}
                </span>
              ) : isTodayCutoff ? (
                <span style={{ ...styles.badge, backgroundColor: '#f1f5f9', color: '#64748b' }}>
                  Encerrado
                </span>
              ) : (
                <span style={{ ...styles.badge, backgroundColor: '#ecfdf5', color: '#047857' }}>
                  Disponível
                </span>
              )}
            </div>

            <div style={styles.mealCardBody}>
              {todayOrder ? (
                <div style={styles.confirmedBox}>
                  <CheckCircle2 size={24} color="#10b981" />
                  <div>
                    <div style={{ fontWeight: 700, color: '#065f46', fontSize: '0.95rem' }}>Almoço Confirmado</div>
                    <div style={{ fontSize: '0.8rem', color: '#047857' }}>
                      {todayOrder.status === 'entregue'
                        ? 'Refeição entregue/retirada na cozinha.'
                        : 'Aguardando entrega na cozinha no horário de almoço.'}
                    </div>
                  </div>
                </div>
              ) : (
                <p style={styles.mealDesc}>
                  Solicite sua marmita de almoço para hoje. O pedido será encaminhado ao fornecedor terceirizado.
                </p>
              )}
            </div>

            <div style={styles.mealCardFooter}>
              {todayOrder ? (
                todayOrder.status !== 'entregue' && !isTodayCutoff ? (
                  <button
                    onClick={() => handleCancelMeal(todayOrder.id, todayStr)}
                    disabled={actionLoading === `cancel_${todayOrder.id}`}
                    style={styles.cancelBtn}
                  >
                    {actionLoading === `cancel_${todayOrder.id}` ? 'Cancelando...' : 'Cancelar Almoço'}
                  </button>
                ) : (
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    {todayOrder.status === 'entregue' ? 'Refeição entregue' : `Horário limite expirado (${settings?.lunchCutoff || '09:30'})`}
                  </span>
                )
              ) : (
                <button
                  onClick={() => handleOrderMeal(todayStr)}
                  disabled={isTodayCutoff || actionLoading === `order_${todayStr}`}
                  style={{
                    ...styles.orderBtn,
                    backgroundColor: isTodayCutoff ? '#94a3b8' : '#0284c7',
                    cursor: isTodayCutoff ? 'not-allowed' : 'pointer'
                  }}
                >
                  {actionLoading === `order_${todayStr}` ? (
                    'Solicitando...'
                  ) : isTodayCutoff ? (
                    `Encerrado hoje às ${settings?.lunchCutoff || '09:30'}`
                  ) : (
                    'Solicitar Almoço de Hoje'
                  )}
                </button>
              )}
            </div>
          </section>
        )}

        {/* CONTEÚDO: RESERVA DE AMANHÃ */}
        {targetTab === 'amanha' && (
          <section style={{
            ...styles.mealCard,
            borderColor: tomorrowOrder ? '#10b981' : '#e2e8f0',
            backgroundColor: tomorrowOrder ? '#f0fdf4' : '#ffffff'
          }}>
            <div style={styles.mealCardHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ ...styles.mealIconBox, backgroundColor: '#e0f2fe', color: '#0284c7' }}>
                  <Calendar size={24} />
                </div>
                <div>
                  <h3 style={styles.mealTitle}>Almoço de Amanhã</h3>
                  <span style={styles.mealCutoff}>
                    <Clock size={13} style={{ marginRight: '4px' }} />
                    Reserva prévia até as {settings?.advanceCutoff || '16:00'} de hoje
                  </span>
                </div>
              </div>

              {tomorrowOrder ? (
                <span style={{ ...styles.badge, backgroundColor: '#dcfce7', color: '#166534' }}>
                  Reservado
                </span>
              ) : isAdvanceCutoff ? (
                <span style={{ ...styles.badge, backgroundColor: '#f1f5f9', color: '#64748b' }}>
                  Encerrado
                </span>
              ) : (
                <span style={{ ...styles.badge, backgroundColor: '#ecfdf5', color: '#047857' }}>
                  Disponível
                </span>
              )}
            </div>

            <div style={styles.mealCardBody}>
              {tomorrowOrder ? (
                <div style={styles.confirmedBox}>
                  <CheckCircle2 size={24} color="#10b981" />
                  <div>
                    <div style={{ fontWeight: 700, color: '#065f46', fontSize: '0.95rem' }}>Reserva Confirmada</div>
                    <div style={{ fontSize: '0.8rem', color: '#047857' }}>
                      Sua marmita já está garantida no lote de compras de amanhã.
                    </div>
                  </div>
                </div>
              ) : (
                <p style={styles.mealDesc}>
                  Reserve com antecedência o almoço para amanhã ({formatDateBR(tomorrowStr)}). A cozinha fechará os pedidos do fornecedor às {settings?.advanceCutoff || '16:00'} de hoje.
                </p>
              )}
            </div>

            <div style={styles.mealCardFooter}>
              {tomorrowOrder ? (
                !isAdvanceCutoff ? (
                  <button
                    onClick={() => handleCancelMeal(tomorrowOrder.id, tomorrowStr)}
                    disabled={actionLoading === `cancel_${tomorrowOrder.id}`}
                    style={styles.cancelBtn}
                  >
                    {actionLoading === `cancel_${tomorrowOrder.id}` ? 'Cancelando...' : 'Cancelar Reserva'}
                  </button>
                ) : (
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    Reserva confirmada. Cancelamento encerrado às {settings?.advanceCutoff || '16:00'}.
                  </span>
                )
              ) : (
                <button
                  onClick={() => handleOrderMeal(tomorrowStr)}
                  disabled={isAdvanceCutoff || actionLoading === `order_${tomorrowStr}`}
                  style={{
                    ...styles.orderBtn,
                    backgroundColor: isAdvanceCutoff ? '#94a3b8' : '#059669',
                    cursor: isAdvanceCutoff ? 'not-allowed' : 'pointer'
                  }}
                >
                  {actionLoading === `order_${tomorrowStr}` ? (
                    'Reservando...'
                  ) : isAdvanceCutoff ? (
                    `Reserva encerrada às ${settings?.advanceCutoff || '16:00'}`
                  ) : (
                    'Reservar Almoço para Amanhã'
                  )}
                </button>
              )}
            </div>
          </section>
        )}

        {/* RESUMO MENSAL DO COLABORADOR */}
        <section style={styles.summarySection}>
          <div style={styles.summaryGrid}>
            <div style={styles.summaryCard}>
              <span style={styles.summaryLabel}>Marmitas no Mês</span>
              <strong style={styles.summaryValue}>{currentMonthOrders.length}</strong>
              <span style={styles.summarySub}>almoços solicitados</span>
            </div>
            <div style={styles.summaryCard}>
              <span style={styles.summaryLabel}>Previsão de Desconto</span>
              <strong style={{ ...styles.summaryValue, color: '#dc2626' }}>
                {formatCurrency(totalMonthDiscount)}
              </strong>
              <span style={styles.summarySub}>a lançar em folha</span>
            </div>
          </div>
        </section>

        {/* HISTÓRICO DE PEDIDOS */}
        <section style={styles.historySection}>
          <h3 style={styles.sectionTitle}>
            <FileText size={18} />
            Histórico Recente
          </h3>

          {orders.length === 0 ? (
            <div style={styles.emptyHistory}>
              <Utensils size={32} color="#cbd5e1" style={{ marginBottom: '8px' }} />
              <p>Nenhum pedido de marmita encontrado.</p>
            </div>
          ) : (
            <div style={styles.historyList}>
              {orders.slice(0, 15).map(o => (
                <div key={o.id} style={styles.historyItem}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={styles.historyIconBox}>
                      <Sun size={16} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                        Almoço • {formatDateBR(o.date)}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        Solicitado às {new Date(o.requestedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>
                      {formatCurrency(o.discountValue)}
                    </span>
                    <span style={{
                      ...styles.badge,
                      backgroundColor: o.status === 'cancelado' ? '#fee2e2' : o.status === 'entregue' ? '#dcfce7' : '#e0f2fe',
                      color: o.status === 'cancelado' ? '#991b1b' : o.status === 'entregue' ? '#166534' : '#0369a1'
                    }}>
                      {o.status === 'cancelado' ? 'Cancelado' : o.status === 'entregue' ? 'Entregue' : 'Solicitado'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* MODAL DE INSTRUÇÃO PARA IPHONE */}
      {showIosInstallModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Instalar no iPhone</h3>
              <button onClick={() => setShowIosInstallModal(false)} style={styles.modalCloseBtn}>×</button>
            </div>
            <div style={styles.modalBody}>
              <p style={{ margin: '0 0 12px 0', fontSize: '0.85rem', color: '#475569' }}>
                Para ter o aplicativo direto na tela de início do seu iPhone:
              </p>
              <div style={styles.stepItem}>
                <div style={styles.stepNum}>1</div>
                <div style={{ flex: 1, fontSize: '0.85rem' }}>
                  No navegador <strong>Safari</strong>, toque no ícone <strong>Compartilhar</strong> (quadrado com seta para cima <Share size={15} style={{ verticalAlign: 'middle' }} />) na barra inferior.
                </div>
              </div>
              <div style={styles.stepItem}>
                <div style={styles.stepNum}>2</div>
                <div style={{ flex: 1, fontSize: '0.85rem' }}>
                  Role as opções para baixo e selecione <strong>"Adicionar à Tela de Início"</strong> (<PlusSquare size={15} style={{ verticalAlign: 'middle' }} />).
                </div>
              </div>
              <div style={styles.stepItem}>
                <div style={styles.stepNum}>3</div>
                <div style={{ flex: 1, fontSize: '0.85rem' }}>
                  Toque em <strong>"Adicionar"</strong> no canto superior direito.
                </div>
              </div>
            </div>
            <div style={styles.modalFooter}>
              <button onClick={() => setShowIosInstallModal(false)} style={styles.btnPrimary}>
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  loginContainer: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0f172a',
    padding: '1rem',
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
    boxSizing: 'border-box'
  },
  topInstallBar: {
    width: '100%',
    maxWidth: '420px',
    backgroundColor: '#f0f9ff',
    border: '1px solid #bae6fd',
    borderRadius: '12px',
    padding: '10px 14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '1rem',
    boxSizing: 'border-box'
  },
  installMiniBtn: {
    padding: '6px 12px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#0284c7',
    color: '#ffffff',
    fontWeight: 700,
    fontSize: '0.75rem',
    cursor: 'pointer'
  },
  loginCard: {
    backgroundColor: '#ffffff',
    borderRadius: '18px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
    padding: '2rem 1.5rem',
    maxWidth: '420px',
    width: '100%',
    boxSizing: 'border-box'
  },
  brandHeader: {
    textAlign: 'center',
    marginBottom: '1.75rem'
  },
  brandIcon: {
    width: '56px',
    height: '56px',
    borderRadius: '14px',
    background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 10px',
    boxShadow: '0 4px 12px rgba(2, 132, 199, 0.35)'
  },
  brandTitle: {
    fontSize: '1.45rem',
    fontWeight: 800,
    color: '#0f172a',
    margin: 0,
    letterSpacing: '-0.02em'
  },
  brandSubtitle: {
    fontSize: '0.85rem',
    color: '#64748b',
    marginTop: '4px'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.15rem'
  },
  alertError: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    padding: '10px 14px',
    borderRadius: '8px',
    fontSize: '0.85rem',
    border: '1px solid #fca5a5'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px'
  },
  label: {
    fontSize: '0.85rem',
    fontWeight: 600,
    color: '#334155'
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },
  inputIcon: {
    position: 'absolute',
    left: '12px',
    color: '#94a3b8'
  },
  input: {
    width: '100%',
    minHeight: '44px',
    padding: '10px 12px 10px 38px',
    borderRadius: '10px',
    border: '1px solid #cbd5e1',
    fontSize: '1rem',
    outline: 'none',
    boxSizing: 'border-box'
  },
  showPassBtn: {
    position: 'absolute',
    right: '8px',
    background: 'none',
    border: 'none',
    color: '#64748b',
    cursor: 'pointer',
    padding: '6px'
  },
  helpText: {
    fontSize: '0.75rem',
    color: '#64748b',
    marginTop: '2px',
    lineHeight: '1.3'
  },
  submitBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '48px',
    padding: '12px',
    borderRadius: '10px',
    border: 'none',
    background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
    color: '#fff',
    fontWeight: 700,
    fontSize: '1rem',
    cursor: 'pointer',
    boxShadow: '0 4px 10px rgba(2, 132, 199, 0.3)',
    marginTop: '0.25rem'
  },
  exitBtn: {
    width: '100%',
    padding: '10px',
    background: 'none',
    border: 'none',
    color: '#64748b',
    fontSize: '0.85rem',
    cursor: 'pointer',
    marginTop: '1rem',
    textDecoration: 'underline'
  },

  // Dashboard styles
  dashboardContainer: {
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
    paddingBottom: 'env(safe-area-inset-bottom, 2rem)'
  },
  header: {
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e2e8f0',
    padding: '0.75rem 1rem',
    position: 'sticky',
    top: 0,
    zIndex: 20
  },
  headerContent: {
    maxWidth: '700px',
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  smallBrandIcon: {
    width: '38px',
    height: '38px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  headerTitle: {
    margin: 0,
    fontSize: '1rem',
    fontWeight: 800,
    color: '#0f172a'
  },
  headerUser: {
    fontSize: '0.75rem',
    color: '#64748b'
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  refreshBtn: {
    padding: '8px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    backgroundColor: '#fff',
    color: '#475569',
    cursor: 'pointer'
  },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '8px 12px',
    borderRadius: '8px',
    border: '1px solid #fee2e2',
    backgroundColor: '#fff',
    color: '#dc2626',
    fontWeight: 600,
    fontSize: '0.85rem',
    cursor: 'pointer'
  },
  mainContent: {
    maxWidth: '700px',
    margin: '0 auto',
    padding: '1.25rem 1rem 3rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem'
  },
  alertBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 14px',
    borderRadius: '10px',
    border: '1px solid'
  },
  daySelectorContainer: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px'
  },
  dayTabBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    minHeight: '48px',
    padding: '10px',
    borderRadius: '12px',
    border: '1.5px solid',
    fontSize: '0.9rem',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  miniBadge: {
    padding: '2px 6px',
    borderRadius: '999px',
    fontSize: '0.7rem',
    fontWeight: 800
  },
  mealCard: {
    borderRadius: '16px',
    border: '1.5px solid #e2e8f0',
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)'
  },
  mealCardHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '8px'
  },
  mealIconBox: {
    width: '46px',
    height: '46px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  mealTitle: {
    margin: 0,
    fontSize: '1.2rem',
    fontWeight: 800,
    color: '#0f172a'
  },
  mealCutoff: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '0.75rem',
    color: '#64748b',
    marginTop: '3px'
  },
  badge: {
    padding: '4px 10px',
    borderRadius: '999px',
    fontSize: '0.75rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.04em'
  },
  mealCardBody: {
    flex: 1
  },
  confirmedBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 14px',
    backgroundColor: '#ecfdf5',
    borderRadius: '10px',
    border: '1px solid #a7f3d0'
  },
  mealDesc: {
    margin: 0,
    fontSize: '0.9rem',
    color: '#64748b',
    lineHeight: '1.4'
  },
  mealCardFooter: {
    marginTop: 'auto'
  },
  orderBtn: {
    width: '100%',
    minHeight: '48px',
    padding: '12px',
    borderRadius: '10px',
    border: 'none',
    color: '#ffffff',
    fontWeight: 700,
    fontSize: '1rem',
    boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
  },
  cancelBtn: {
    width: '100%',
    minHeight: '44px',
    padding: '10px',
    borderRadius: '10px',
    border: '1px solid #fca5a5',
    backgroundColor: '#fff',
    color: '#dc2626',
    fontWeight: 700,
    fontSize: '0.9rem',
    cursor: 'pointer'
  },
  summarySection: {
    marginTop: '0.25rem'
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '10px'
  },
  summaryCard: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    padding: '1.15rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  summaryLabel: {
    fontSize: '0.75rem',
    fontWeight: 700,
    color: '#64748b',
    textTransform: 'uppercase'
  },
  summaryValue: {
    fontSize: '1.75rem',
    fontWeight: 800,
    color: '#0f172a'
  },
  summarySub: {
    fontSize: '0.75rem',
    color: '#94a3b8'
  },
  historySection: {
    backgroundColor: '#ffffff',
    borderRadius: '14px',
    border: '1px solid #e2e8f0',
    padding: '1.25rem'
  },
  sectionTitle: {
    margin: '0 0 1rem 0',
    fontSize: '1rem',
    fontWeight: 700,
    color: '#0f172a',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  emptyHistory: {
    textAlign: 'center',
    padding: '2.5rem 1rem',
    color: '#94a3b8',
    fontSize: '0.9rem'
  },
  historyList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  historyItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 12px',
    borderRadius: '10px',
    backgroundColor: '#f8fafc',
    border: '1px solid #f1f5f9'
  },
  historyIconBox: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    backgroundColor: '#fef3c7',
    color: '#d97706',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },

  // Modal
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
    padding: '1rem'
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '420px',
    overflow: 'hidden',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)'
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
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  stepItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    backgroundColor: '#f8fafc',
    padding: '10px',
    borderRadius: '10px',
    border: '1px solid #e2e8f0'
  },
  stepNum: {
    width: '24px',
    height: '24px',
    borderRadius: '999px',
    backgroundColor: '#0284c7',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.75rem',
    fontWeight: 800,
    flexShrink: 0
  },
  modalFooter: {
    padding: '12px 18px',
    borderTop: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'flex-end',
    backgroundColor: '#f8fafc'
  },
  btnPrimary: {
    padding: '8px 18px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#0284c7',
    color: '#ffffff',
    fontWeight: 700,
    fontSize: '0.9rem',
    cursor: 'pointer'
  }
};
