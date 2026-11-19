import React, { useState, useEffect } from 'react';
import {
  Utensils,
  Sun,
  Moon,
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
  HelpCircle
} from 'lucide-react';
import {
  getMealSettings,
  employeeMealLogin,
  createMealOrder,
  cancelMealOrder,
  getEmployeeOrders,
  isMealCutoffPassed,
  getTodayDateStr
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

  // Carrega configurações e pedidos do colaborador
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

  // Pedidos de hoje por refeição
  const todayAlmoco = orders.find(o => o.date === todayStr && o.mealType === 'almoco' && o.status !== 'cancelado');
  const todayJantar = orders.find(o => o.date === todayStr && o.mealType === 'jantar' && o.status !== 'cancelado');

  // Cálculos do mês atual
  const currentYearMonth = todayStr.slice(0, 7);
  const currentMonthOrders = orders.filter(o => o.status !== 'cancelado' && String(o.date || '').startsWith(currentYearMonth));
  const totalMonthDiscount = currentMonthOrders.reduce((sum, o) => sum + (Number(o.discountValue) || 0), 0);

  const handleOrderMeal = async (mealType) => {
    if (!session || !settings) return;
    setActionLoading(`order_${mealType}`);
    setFeedbackMsg(null);

    try {
      await createMealOrder({
        employee: session,
        mealType,
        targetDate: todayStr
      });
      const mealName = mealType === 'almoco' ? 'Almoço' : 'Jantar';
      setFeedbackMsg({ type: 'success', text: `Pedido de ${mealName} confirmado com sucesso!` });
      await loadData();
    } catch (err) {
      setFeedbackMsg({ type: 'error', text: err.message || 'Erro ao registrar pedido.' });
    } finally {
      setActionLoading('');
    }
  };

  const handleCancelMeal = async (orderId, mealType) => {
    if (!window.confirm('Deseja realmente cancelar este pedido de marmita?')) return;
    setActionLoading(`cancel_${mealType}`);
    setFeedbackMsg(null);

    try {
      await cancelMealOrder(orderId, session.id);
      const mealName = mealType === 'almoco' ? 'Almoço' : 'Jantar';
      setFeedbackMsg({ type: 'info', text: `Pedido de ${mealName} cancelado.` });
      await loadData();
    } catch (err) {
      setFeedbackMsg({ type: 'error', text: err.message || 'Não foi possível cancelar o pedido.' });
    } finally {
      setActionLoading('');
    }
  };

  // Se não estiver logado, exibe tela de login
  if (!session) {
    return (
      <div style={styles.loginContainer}>
        <div style={styles.loginCard}>
          <div style={styles.brandHeader}>
            <div style={styles.brandIcon}>
              <Utensils size={32} color="#fff" />
            </div>
            <h1 style={styles.brandTitle}>NexAi <span style={{ color: '#0ea5e9' }}>REFEIÇÕES</span></h1>
            <p style={styles.brandSubtitle}>Solicitação de Marmita para Colaboradores</p>
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
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <span style={styles.helpText}>
                <HelpCircle size={13} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                Senha inicial: primeiros 4 números do seu CPF. Para resetar, procure o RH.
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
      </div>
    );
  }

  // Dashboard do Colaborador Logado
  const isAlmocoCutoff = isMealCutoffPassed('almoco', settings?.lunchCutoff || '09:30');
  const isJantarCutoff = isMealCutoffPassed('jantar', settings?.dinnerCutoff || '15:30');

  return (
    <div style={styles.dashboardContainer}>
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.headerLeft}>
            <div style={styles.smallBrandIcon}>
              <Utensils size={20} color="#fff" />
            </div>
            <div>
              <h2 style={styles.headerTitle}>NexAi Refeições</h2>
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
            <button onClick={() => setFeedbackMsg(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>×</button>
          </div>
        )}

        <div style={styles.dateBanner}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={18} color="#0ea5e9" />
            <span style={{ fontWeight: 600 }}>Data:</span>
            <span>{formatDateBR(todayStr)}</span>
          </div>
          <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
            {settings?.chargeMode === 'integral' ? (
              <span>Cobrança: <strong>Integral ({formatCurrency(settings?.supplierCost || 18)})</strong></span>
            ) : (
              <span>Coparticipação: <strong>{formatCurrency(settings?.employeeCost || 5)}</strong> por refeição</span>
            )}
          </div>
        </div>

        {/* CARDS DE SOLICITAÇÃO HOJE */}
        <section style={styles.cardsGrid}>
          {/* CARD ALMOÇO */}
          <div style={{
            ...styles.mealCard,
            borderColor: todayAlmoco ? '#10b981' : '#e2e8f0',
            backgroundColor: todayAlmoco ? '#f0fdf4' : '#ffffff'
          }}>
            <div style={styles.mealCardHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ ...styles.mealIconBox, backgroundColor: '#fef3c7', color: '#d97706' }}>
                  <Sun size={22} />
                </div>
                <div>
                  <h3 style={styles.mealTitle}>Almoço</h3>
                  <span style={styles.mealCutoff}>
                    <Clock size={12} style={{ marginRight: '4px' }} />
                    Limite: {settings?.lunchCutoff || '09:30'}
                  </span>
                </div>
              </div>

              {todayAlmoco ? (
                <span style={{ ...styles.badge, backgroundColor: todayAlmoco.status === 'entregue' ? '#dcfce7' : '#e0f2fe', color: todayAlmoco.status === 'entregue' ? '#166534' : '#0369a1' }}>
                  {todayAlmoco.status === 'entregue' ? 'Entregue' : 'Solicitado'}
                </span>
              ) : isAlmocoCutoff ? (
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
              {todayAlmoco ? (
                <div style={styles.confirmedBox}>
                  <CheckCircle2 size={24} color="#10b981" />
                  <div>
                    <div style={{ fontWeight: 600, color: '#065f46' }}>Marmita Confirmada</div>
                    <div style={{ fontSize: '0.8rem', color: '#047857' }}>
                      Status: {todayAlmoco.status === 'entregue' ? 'Retirada efetuada' : 'Aguardando entrega na cozinha'}
                    </div>
                  </div>
                </div>
              ) : (
                <p style={styles.mealDesc}>
                  Solicite sua refeição de almoço. O pedido será encaminhado ao fornecedor terceirizado.
                </p>
              )}
            </div>

            <div style={styles.mealCardFooter}>
              {todayAlmoco ? (
                todayAlmoco.status !== 'entregue' && !isAlmocoCutoff ? (
                  <button
                    onClick={() => handleCancelMeal(todayAlmoco.id, 'almoco')}
                    disabled={actionLoading === 'cancel_almoco'}
                    style={styles.cancelBtn}
                  >
                    {actionLoading === 'cancel_almoco' ? 'Cancelando...' : 'Cancelar Marmita'}
                  </button>
                ) : (
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    {todayAlmoco.status === 'entregue' ? 'Entregue' : `Horário limite expirado (${settings?.lunchCutoff || '09:30'})`}
                  </span>
                )
              ) : (
                <button
                  onClick={() => handleOrderMeal('almoco')}
                  disabled={isAlmocoCutoff || actionLoading === 'order_almoco'}
                  style={{
                    ...styles.orderBtn,
                    backgroundColor: isAlmocoCutoff ? '#94a3b8' : '#0284c7',
                    cursor: isAlmocoCutoff ? 'not-allowed' : 'pointer'
                  }}
                >
                  {actionLoading === 'order_almoco' ? (
                    'Solicitando...'
                  ) : isAlmocoCutoff ? (
                    `Encerrado às ${settings?.lunchCutoff || '09:30'}`
                  ) : (
                    'Solicitar Almoço'
                  )}
                </button>
              )}
            </div>
          </div>

          {/* CARD JANTAR */}
          <div style={{
            ...styles.mealCard,
            borderColor: todayJantar ? '#10b981' : '#e2e8f0',
            backgroundColor: todayJantar ? '#f0fdf4' : '#ffffff'
          }}>
            <div style={styles.mealCardHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ ...styles.mealIconBox, backgroundColor: '#ede9fe', color: '#7c3aed' }}>
                  <Moon size={22} />
                </div>
                <div>
                  <h3 style={styles.mealTitle}>Jantar</h3>
                  <span style={styles.mealCutoff}>
                    <Clock size={12} style={{ marginRight: '4px' }} />
                    Limite: {settings?.dinnerCutoff || '15:30'}
                  </span>
                </div>
              </div>

              {todayJantar ? (
                <span style={{ ...styles.badge, backgroundColor: todayJantar.status === 'entregue' ? '#dcfce7' : '#e0f2fe', color: todayJantar.status === 'entregue' ? '#166534' : '#0369a1' }}>
                  {todayJantar.status === 'entregue' ? 'Entregue' : 'Solicitado'}
                </span>
              ) : isJantarCutoff ? (
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
              {todayJantar ? (
                <div style={styles.confirmedBox}>
                  <CheckCircle2 size={24} color="#10b981" />
                  <div>
                    <div style={{ fontWeight: 600, color: '#065f46' }}>Marmita Confirmada</div>
                    <div style={{ fontSize: '0.8rem', color: '#047857' }}>
                      Status: {todayJantar.status === 'entregue' ? 'Retirada efetuada' : 'Aguardando entrega na cozinha'}
                    </div>
                  </div>
                </div>
              ) : (
                <p style={styles.mealDesc}>
                  Solicite sua refeição de jantar para o turno noturno.
                </p>
              )}
            </div>

            <div style={styles.mealCardFooter}>
              {todayJantar ? (
                todayJantar.status !== 'entregue' && !isJantarCutoff ? (
                  <button
                    onClick={() => handleCancelMeal(todayJantar.id, 'jantar')}
                    disabled={actionLoading === 'cancel_jantar'}
                    style={styles.cancelBtn}
                  >
                    {actionLoading === 'cancel_jantar' ? 'Cancelando...' : 'Cancelar Marmita'}
                  </button>
                ) : (
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    {todayJantar.status === 'entregue' ? 'Entregue' : `Horário limite expirado (${settings?.dinnerCutoff || '15:30'})`}
                  </span>
                )
              ) : (
                <button
                  onClick={() => handleOrderMeal('jantar')}
                  disabled={isJantarCutoff || actionLoading === 'order_jantar'}
                  style={{
                    ...styles.orderBtn,
                    backgroundColor: isJantarCutoff ? '#94a3b8' : '#7c3aed',
                    cursor: isJantarCutoff ? 'not-allowed' : 'pointer'
                  }}
                >
                  {actionLoading === 'order_jantar' ? (
                    'Solicitando...'
                  ) : isJantarCutoff ? (
                    `Encerrado às ${settings?.dinnerCutoff || '15:30'}`
                  ) : (
                    'Solicitar Jantar'
                  )}
                </button>
              )}
            </div>
          </div>
        </section>

        {/* RESUMO MENSAL DO COLABORADOR */}
        <section style={styles.summarySection}>
          <div style={styles.summaryGrid}>
            <div style={styles.summaryCard}>
              <span style={styles.summaryLabel}>Marmitas no Mês</span>
              <strong style={styles.summaryValue}>{currentMonthOrders.length}</strong>
              <span style={styles.summarySub}>refeições solicitadas</span>
            </div>
            <div style={styles.summaryCard}>
              <span style={styles.summaryLabel}>Previsão de Desconto</span>
              <strong style={{ ...styles.summaryValue, color: '#dc2626' }}>
                {formatCurrency(totalMonthDiscount)}
              </strong>
              <span style={styles.summarySub}>a lançar em folha de pagamento</span>
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
                    <div style={{
                      ...styles.historyIconBox,
                      backgroundColor: o.mealType === 'jantar' ? '#ede9fe' : '#fef3c7',
                      color: o.mealType === 'jantar' ? '#7c3aed' : '#d97706'
                    }}>
                      {o.mealType === 'jantar' ? <Moon size={16} /> : <Sun size={16} />}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                        {o.mealType === 'jantar' ? 'Jantar' : 'Almoço'} • {formatDateBR(o.date)}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        Solicitado às {new Date(o.requestedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
    </div>
  );
}

const styles = {
  loginContainer: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0f172a',
    padding: '1rem',
    fontFamily: 'Inter, system-ui, sans-serif'
  },
  loginCard: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.2)',
    padding: '2.5rem 2rem',
    maxWidth: '420px',
    width: '100%'
  },
  brandHeader: {
    textAlign: 'center',
    marginBottom: '2rem'
  },
  brandIcon: {
    width: '56px',
    height: '56px',
    borderRadius: '14px',
    background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 12px',
    boxShadow: '0 4px 12px rgba(2, 132, 199, 0.35)'
  },
  brandTitle: {
    fontSize: '1.5rem',
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
    gap: '1.25rem'
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
    gap: '6px'
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
    padding: '10px 12px 10px 38px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    fontSize: '0.95rem',
    outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box'
  },
  showPassBtn: {
    position: 'absolute',
    right: '10px',
    background: 'none',
    border: 'none',
    color: '#64748b',
    cursor: 'pointer',
    padding: '4px'
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
    padding: '12px',
    borderRadius: '8px',
    border: 'none',
    background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
    color: '#fff',
    fontWeight: 700,
    fontSize: '1rem',
    cursor: 'pointer',
    boxShadow: '0 4px 10px rgba(2, 132, 199, 0.3)',
    marginTop: '0.5rem'
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
    fontFamily: 'Inter, system-ui, sans-serif'
  },
  header: {
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e2e8f0',
    padding: '0.75rem 1.25rem',
    position: 'sticky',
    top: 0,
    zIndex: 20
  },
  headerContent: {
    maxWidth: '900px',
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
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
    fontSize: '1.05rem',
    fontWeight: 700,
    color: '#0f172a'
  },
  headerUser: {
    fontSize: '0.8rem',
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
    gap: '6px',
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
    maxWidth: '900px',
    margin: '0 auto',
    padding: '1.5rem 1rem 3rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem'
  },
  alertBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 16px',
    borderRadius: '8px',
    border: '1px solid'
  },
  dateBanner: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    padding: '12px 18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '10px'
  },
  cardsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '1.25rem'
  },
  mealCard: {
    borderRadius: '14px',
    border: '1.5px solid #e2e8f0',
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
  },
  mealCardHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between'
  },
  mealIconBox: {
    width: '42px',
    height: '42px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  mealTitle: {
    margin: 0,
    fontSize: '1.15rem',
    fontWeight: 700,
    color: '#0f172a'
  },
  mealCutoff: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '0.75rem',
    color: '#64748b',
    marginTop: '2px'
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
    gap: '10px',
    padding: '10px 12px',
    backgroundColor: '#ecfdf5',
    borderRadius: '8px',
    border: '1px solid #a7f3d0'
  },
  mealDesc: {
    margin: 0,
    fontSize: '0.85rem',
    color: '#64748b',
    lineHeight: '1.4'
  },
  mealCardFooter: {
    marginTop: 'auto'
  },
  orderBtn: {
    width: '100%',
    padding: '11px',
    borderRadius: '8px',
    border: 'none',
    color: '#ffffff',
    fontWeight: 700,
    fontSize: '0.95rem'
  },
  cancelBtn: {
    width: '100%',
    padding: '10px',
    borderRadius: '8px',
    border: '1px solid #fca5a5',
    backgroundColor: '#fff',
    color: '#dc2626',
    fontWeight: 600,
    fontSize: '0.85rem',
    cursor: 'pointer'
  },
  summarySection: {
    marginTop: '0.5rem'
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '1rem'
  },
  summaryCard: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  summaryLabel: {
    fontSize: '0.8rem',
    fontWeight: 600,
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
    borderRadius: '8px',
    backgroundColor: '#f8fafc',
    border: '1px solid #f1f5f9'
  },
  historyIconBox: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }
};
