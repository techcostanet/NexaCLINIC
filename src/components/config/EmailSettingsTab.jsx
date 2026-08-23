import React, { useState } from 'react';
import { 
  Mail, Send, Server, Eye, EyeOff, CheckCircle2, AlertCircle, 
  ShieldCheck, RefreshCw, Save, Sparkles, Check, Clock, Stethoscope,
  Wrench, Users, ShoppingCart, Calendar, Megaphone, Lock
} from 'lucide-react';

export default function EmailSettingsTab({
  emailSettings,
  setEmailSettings,
  onSave,
  onTest,
  testing = false,
  testResult = null,
  actionLoading = false,
  emailLogs = [],
  themeColor = '#8b5cf6'
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [testEmailInput, setTestEmailInput] = useState('');
  const [activePreset, setActivePreset] = useState(emailSettings.provider || 'smtp');

  const presets = [
    { id: 'gmail', name: 'Google / Gmail', host: 'smtp.gmail.com', port: 587, enc: 'TLS', tip: 'Use uma Senha de Aplicativo de 16 dígitos gerada na Conta Google.' },
    { id: 'outlook', name: 'Microsoft 365 / Outlook', host: 'smtp.office365.com', port: 587, enc: 'TLS', tip: 'Requer autenticação SMTP com e-mail corporativo ou App Password.' },
    { id: 'ses', name: 'Amazon SES', host: 'email-smtp.us-east-1.amazonaws.com', port: 587, enc: 'TLS', tip: 'Utilize as credenciais SMTP geradas no console da AWS SES.' },
    { id: 'resend', name: 'Resend / Mailgun', host: 'smtp.resend.com', port: 587, enc: 'TLS', tip: 'Usuário padrão "resend" e chave API como senha.' },
    { id: 'smtp', name: 'SMTP Personalizado', host: emailSettings.smtpHost || '', port: emailSettings.smtpPort || 587, enc: emailSettings.encryption || 'TLS', tip: 'Configuração manual para servidor dedicado de correio eletrônico.' }
  ];

  const handleSelectPreset = (preset) => {
    setActivePreset(preset.id);
    setEmailSettings(prev => ({
      ...prev,
      provider: preset.id,
      smtpHost: preset.id === 'smtp' ? prev.smtpHost : preset.host,
      smtpPort: preset.id === 'smtp' ? prev.smtpPort : preset.port,
      encryption: preset.id === 'smtp' ? prev.encryption : preset.enc
    }));
  };

  const handleToggleNotification = (moduleKey) => {
    setEmailSettings(prev => ({
      ...prev,
      notifications: {
        ...(prev.notifications || {}),
        [moduleKey]: !prev.notifications?.[moduleKey]
      }
    }));
  };

  const handleTestSubmit = (e) => {
    e.preventDefault();
    onTest(testEmailInput || emailSettings.senderEmail);
  };

  const currentPresetInfo = presets.find(p => p.id === activePreset) || presets[4];

  return (
    <div style={styles.container}>
      {/* Top Banner / Presets */}
      <div style={styles.presetCard}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Server size={20} color={themeColor} />
              <h3 style={{ margin: 0, fontSize: '1.05rem', color: 'var(--text-primary)' }}>Provedor de E-mail</h3>
            </div>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Selecione um provedor pré-configurado para preenchimento ágil de portas e protocolos SMTP.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.35rem 0.75rem',
              borderRadius: '20px',
              fontSize: '0.8rem',
              fontWeight: '700',
              backgroundColor: emailSettings.enabled ? '#dcfce7' : '#fee2e2',
              color: emailSettings.enabled ? '#166534' : '#991b1b'
            }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: emailSettings.enabled ? '#16a34a' : '#dc2626' }}></span>
              {emailSettings.enabled ? 'Servidor Ativo' : 'Servidor Inativo'}
            </span>
          </div>
        </div>

        {/* Preset Buttons Grid */}
        <div style={styles.presetsGrid}>
          {presets.map(p => {
            const isSelected = (emailSettings.provider || 'smtp') === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => handleSelectPreset(p)}
                style={{
                  ...styles.presetBtn,
                  borderColor: isSelected ? themeColor : 'var(--border-color)',
                  backgroundColor: isSelected ? `${themeColor}12` : '#ffffff',
                  color: isSelected ? themeColor : 'var(--text-secondary)',
                  fontWeight: isSelected ? '700' : '600'
                }}
              >
                {isSelected && <Check size={14} style={{ marginRight: '4px' }} />}
                {p.name}
              </button>
            );
          })}
        </div>

        {currentPresetInfo?.tip && (
          <div style={styles.presetTipBox}>
            <Sparkles size={14} color={themeColor} style={{ flexShrink: 0 }} />
            <span><strong>Dica do Provedor:</strong> {currentPresetInfo.tip}</span>
          </div>
        )}
      </div>

      {/* Main Grid: Form Left, Test & Triggers Right */}
      <div style={styles.grid2}>
        {/* Left Column: SMTP Configuration Form */}
        <form onSubmit={onSave} style={styles.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
            <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Mail size={16} color={themeColor} /> Parâmetros de Disparo
            </h4>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-primary)' }}>
              <input
                type="checkbox"
                checked={!!emailSettings.enabled}
                onChange={e => setEmailSettings({ ...emailSettings, enabled: e.target.checked })}
                style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: themeColor }}
              />
              Ativar Disparos
            </label>
          </div>

          <div style={styles.formSection}>
            <div style={styles.formRow}>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Remetente *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ex: NexaCLINIC — Notificações"
                  value={emailSettings.senderName || ''}
                  onChange={e => setEmailSettings({ ...emailSettings, senderName: e.target.value })}
                  required
                />
              </div>

              <div className="form-group" style={{ flex: 1 }}>
                <label>E-mail *</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="notificacoes@clinica.med.br"
                  value={emailSettings.senderEmail || ''}
                  onChange={e => setEmailSettings({ ...emailSettings, senderEmail: e.target.value })}
                  required
                />
              </div>
            </div>

            <div style={styles.formRow}>
              <div className="form-group" style={{ flex: 2 }}>
                <label>Host *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="smtp.gmail.com"
                  value={emailSettings.smtpHost || ''}
                  onChange={e => setEmailSettings({ ...emailSettings, smtpHost: e.target.value })}
                  required
                />
              </div>

              <div className="form-group" style={{ flex: 1 }}>
                <label>Porta *</label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="587"
                  value={emailSettings.smtpPort || 587}
                  onChange={e => setEmailSettings({ ...emailSettings, smtpPort: parseInt(e.target.value) || 587 })}
                  required
                />
              </div>

              <div className="form-group" style={{ flex: 1 }}>
                <label>Segurança *</label>
                <select
                  className="form-control"
                  value={emailSettings.encryption || 'TLS'}
                  onChange={e => setEmailSettings({ ...emailSettings, encryption: e.target.value })}
                >
                  <option value="TLS">TLS (587)</option>
                  <option value="SSL">SSL (465)</option>
                  <option value="None">Nenhuma (25)</option>
                </select>
              </div>
            </div>

            <div style={styles.formRow}>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Usuário *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="usuario@clinica.med.br"
                  value={emailSettings.smtpUser || ''}
                  onChange={e => setEmailSettings({ ...emailSettings, smtpUser: e.target.value })}
                  required
                />
              </div>

              <div className="form-group" style={{ flex: 1 }}>
                <label>Senha *</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-control"
                    placeholder="••••••••••••••••"
                    value={emailSettings.smtpPassword || ''}
                    onChange={e => setEmailSettings({ ...emailSettings, smtpPassword: e.target.value })}
                    style={{ paddingRight: '2.5rem' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={styles.eyeBtn}
                    title={showPassword ? 'Ocultar senha' : 'Ver senha'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>

            <div style={styles.formRow}>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Resposta</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="contato@clinica.med.br (Reply-To)"
                  value={emailSettings.replyToEmail || ''}
                  onChange={e => setEmailSettings({ ...emailSettings, replyToEmail: e.target.value })}
                />
              </div>

              <div className="form-group" style={{ flex: 1 }}>
                <label>Cópia</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="ti.auditoria@clinica.med.br (BCC)"
                  value={emailSettings.bccAudit || ''}
                  onChange={e => setEmailSettings({ ...emailSettings, bccAudit: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Assinatura</label>
              <textarea
                className="form-control"
                rows={3}
                placeholder="Texto padrão inserido no rodapé de todas as notificações..."
                value={emailSettings.footerSignature || ''}
                onChange={e => setEmailSettings({ ...emailSettings, footerSignature: e.target.value })}
                style={{ fontSize: '0.8rem', resize: 'vertical' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <button
              type="submit"
              disabled={actionLoading}
              className="btn btn-primary"
              style={{ backgroundColor: themeColor, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Save size={16} />
              {actionLoading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>

        {/* Right Column: Live Testing & Module Permissions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Card: Live Email Testing */}
          <div style={styles.card}>
            <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              <Send size={16} color={themeColor} /> Testar Disparo
            </h4>
            <p style={{ margin: '0.5rem 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Envie um e-mail de teste imediato para validar se os parâmetros SMTP estão respondendo sem erros.
            </p>

            <form onSubmit={handleTestSubmit} style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              <input
                type="email"
                className="form-control"
                placeholder="Digite o e-mail de destino..."
                value={testEmailInput}
                onChange={e => setTestEmailInput(e.target.value)}
                required
                style={{ fontSize: '0.85rem' }}
              />
              <button
                type="submit"
                disabled={testing}
                className="btn btn-primary"
                style={{
                  backgroundColor: '#0284c7',
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}
              >
                {testing ? <RefreshCw size={15} className="spin" /> : <Send size={15} />}
                {testing ? 'Testando...' : 'Testar'}
              </button>
            </form>

            {testResult && (
              <div style={{
                marginTop: '0.75rem',
                padding: '0.75rem',
                borderRadius: '8px',
                backgroundColor: testResult.success ? '#f0fdf4' : '#fef2f2',
                border: `1px solid ${testResult.success ? '#bbf7d0' : '#fecaca'}`,
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.5rem'
              }}>
                {testResult.success ? (
                  <CheckCircle2 size={18} color="#16a34a" style={{ flexShrink: 0, marginTop: '2px' }} />
                ) : (
                  <AlertCircle size={18} color="#dc2626" style={{ flexShrink: 0, marginTop: '2px' }} />
                )}
                <div>
                  <strong style={{ display: 'block', fontSize: '0.82rem', color: testResult.success ? '#166534' : '#991b1b' }}>
                    {testResult.success ? 'Conexão Estabelecida com Sucesso!' : 'Falha no Envio de Teste'}
                  </strong>
                  <span style={{ fontSize: '0.75rem', color: testResult.success ? '#15803d' : '#b91c1c' }}>
                    {testResult.message} ({testResult.timestamp})
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Card: Connected Modules & Trigger Permissions */}
          <div style={styles.card}>
            <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              <ShieldCheck size={16} color={themeColor} /> Módulos Conectados
            </h4>
            <p style={{ margin: '0.5rem 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Módulos autorizados a emitir notificações eletrônicas através deste servidor:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
              {[
                { key: 'medicalSwaps', label: 'NexaMED', desc: 'Trocas e escalas médicas', icon: Stethoscope, color: '#0284c7' },
                { key: 'serviceOrders', label: 'NexaSERVICE', desc: 'Ordens de serviço e chamados', icon: Wrench, color: '#0891b2' },
                { key: 'hrAdmissions', label: 'NexaHR', desc: 'Avisos de admissão e férias', icon: Users, color: '#ec4899' },
                { key: 'purchasingQuotes', label: 'NexaPROCURE', desc: 'Cotações para fornecedores', icon: ShoppingCart, color: '#f59e0b' },
                { key: 'calendarReminders', label: 'NexaCAL', desc: 'Lembretes de consultas', icon: Calendar, color: '#06b6d4' },
                { key: 'assistAlerts', label: 'NexaASSIST', desc: 'Alertas críticos de pacientes', icon: Megaphone, color: '#ec4899' },
                { key: 'securityAlerts', label: 'NexaCONFIG', desc: 'Alertas de segurança e auditoria', icon: Lock, color: '#8b5cf6' }
              ].map(mod => {
                const isEnabled = emailSettings.notifications?.[mod.key] !== false;
                const IconComponent = mod.icon;
                return (
                  <div
                    key={mod.key}
                    onClick={() => handleToggleNotification(mod.key)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.5rem 0.75rem',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      backgroundColor: isEnabled ? 'var(--bg-card)' : 'var(--bg-body)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: `${mod.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <IconComponent size={15} color={mod.color} />
                      </div>
                      <div>
                        <strong style={{ fontSize: '0.82rem', color: isEnabled ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                          {mod.label}
                        </strong>
                        <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          {mod.desc}
                        </span>
                      </div>
                    </div>

                    <input
                      type="checkbox"
                      checked={isEnabled}
                      onChange={() => {}} // Handled by outer click
                      style={{ width: '16px', height: '16px', accentColor: themeColor, cursor: 'pointer' }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Dispatches Logs Table */}
      <div style={styles.tableCard}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-color)' }}>
          <div>
            <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Clock size={16} color={themeColor} /> Histórico de Disparos
            </h4>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Últimos e-mails gerados e disparados pelos módulos do sistema.
            </span>
          </div>
        </div>

        <table style={styles.table}>
          <thead>
            <tr>
              <th>Data</th>
              <th>Módulo</th>
              <th>Destinatário</th>
              <th>Assunto</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {emailLogs.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  Nenhum disparo de e-mail registrado recentemente. Utilize o botão "Testar" acima para executar o primeiro envio de validação.
                </td>
              </tr>
            ) : (
              emailLogs.map((log, index) => (
                <tr key={log.id || index}>
                  <td style={{ whiteSpace: 'nowrap', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {log.sentAt ? new Date(log.sentAt).toLocaleString('pt-BR') : '-'}
                  </td>
                  <td>
                    <span style={{
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.72rem',
                      fontWeight: '700',
                      backgroundColor: '#e0f2fe',
                      color: '#0369a1'
                    }}>
                      {log.moduleSource || 'Sistema'}
                    </span>
                  </td>
                  <td style={{ fontWeight: '600', fontSize: '0.82rem' }}>{log.to}</td>
                  <td style={{ fontSize: '0.82rem', color: 'var(--text-primary)' }}>{log.subject}</td>
                  <td>
                    <span style={{
                      padding: '0.2rem 0.5rem',
                      borderRadius: '12px',
                      fontSize: '0.72rem',
                      fontWeight: '700',
                      backgroundColor: '#dcfce7',
                      color: '#166534'
                    }}>
                      {log.status || 'Enviado'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem'
  },
  presetCard: {
    backgroundColor: 'var(--bg-card)',
    borderRadius: '10px',
    border: '1px solid var(--border-color)',
    padding: '1.25rem',
    boxShadow: '0 2px 4px rgba(0,0,0,0.03)'
  },
  presetsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '0.6rem',
    marginTop: '1rem'
  },
  presetBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0.65rem 0.75rem',
    borderRadius: '8px',
    border: '1.5px solid',
    fontSize: '0.82rem',
    cursor: 'pointer',
    transition: 'all 0.15s ease'
  },
  presetTipBox: {
    marginTop: '0.85rem',
    padding: '0.6rem 0.85rem',
    borderRadius: '6px',
    backgroundColor: 'var(--bg-body)',
    border: '1px solid var(--border-color)',
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  grid2: {
    display: 'grid',
    gridTemplateColumns: '1.4fr 1fr',
    gap: '1.25rem'
  },
  card: {
    backgroundColor: 'var(--bg-card)',
    borderRadius: '10px',
    border: '1px solid var(--border-color)',
    padding: '1.25rem',
    boxShadow: '0 2px 4px rgba(0,0,0,0.03)'
  },
  formSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    marginTop: '0.85rem'
  },
  formRow: {
    display: 'flex',
    gap: '0.75rem'
  },
  eyeBtn: {
    position: 'absolute',
    right: '8px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--text-muted)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4px'
  },
  tableCard: {
    backgroundColor: 'var(--bg-card)',
    borderRadius: '10px',
    border: '1px solid var(--border-color)',
    boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
    overflow: 'hidden'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.85rem'
  }
};
