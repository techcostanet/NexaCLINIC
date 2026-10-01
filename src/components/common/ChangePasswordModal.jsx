import React, { useState, useEffect } from 'react';
import { 
  X, KeyRound, Eye, EyeOff, CheckCircle2, ShieldCheck, 
  AlertCircle, Lock, Sparkles, UserCheck, LogOut, Clock, ShieldAlert 
} from 'lucide-react';
import { authService, dbService } from '../../firebase';
import { getEffectivePasswordPolicy, validatePasswordAgainstPolicy } from '../../utils/passwordPolicy';

export default function ChangePasswordModal({ isOpen, onClose, currentUser, isForced = false, forcedReason = '', onSuccess }) {
  if (!isOpen) return null;

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [policy, setPolicy] = useState(getEffectivePasswordPolicy());
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Carrega política da clínica
  useEffect(() => {
    let isMounted = true;
    async function loadClinicPolicy() {
      try {
        if (dbService.getTenantSettings) {
          const tenant = await dbService.getTenantSettings();
          if (isMounted && tenant) {
            setPolicy(getEffectivePasswordPolicy(tenant));
          }
        }
      } catch (err) {
        console.error('Erro ao carregar política de senha da clínica:', err);
      }
    }
    loadClinicPolicy();
    return () => { isMounted = false; };
  }, []);

  const validation = validatePasswordAgainstPolicy(newPassword, policy);
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;
  const isMatchError = confirmPassword.length > 0 && newPassword !== confirmPassword;
  const canSubmit = validation.isValid && passwordsMatch && !loading;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      await authService.changeCurrentUserPassword(currentUser, currentPassword, newPassword, policy);
      
      // Registra log de auditoria
      if (dbService.createAuditLog) {
        dbService.createAuditLog({
          operator: currentUser?.email || 'usuario@clinica.com',
          action: 'Troca de Senha',
          details: `Usuário ${currentUser?.name || currentUser?.email} alterou sua senha de acesso com sucesso.`
        }).catch(() => {});
      }

      setSuccessMsg('Senha alterada com sucesso!');
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 1400);
    } catch (err) {
      console.error('Falha ao alterar senha:', err);
      setErrorMsg(err.message || 'Erro ao alterar senha. Verifique os dados informados.');
    } finally {
      setLoading(false);
    }
  };

  const handleForcedLogout = async () => {
    try {
      await authService.logout();
      window.location.reload();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div style={styles.overlay} onClick={() => { if (!isForced) onClose(); }}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={styles.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ ...styles.iconBadge, backgroundColor: `${policy.color || '#0284c7'}15`, color: policy.color || '#0284c7' }}>
              <KeyRound size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h2 style={styles.title}>Senha</h2>
                <span style={{ ...styles.policyBadge, backgroundColor: `${policy.color || '#0284c7'}18`, color: policy.color || '#0284c7', borderColor: `${policy.color || '#0284c7'}40` }}>
                  Regra: {policy.name}
                </span>
              </div>
              <p style={styles.subtitle}>
                {isForced
                  ? (forcedReason === 'first_login' ? 'Definição obrigatória de senha pessoal' : 'Renovação periódica obrigatória')
                  : 'Altere sua credencial de acesso ao sistema'}
              </p>
            </div>
          </div>
          {!isForced && (
            <button onClick={onClose} style={styles.closeBtn} title="Fechar">
              <X size={18} />
            </button>
          )}
        </div>

        {/* Forced Change Banner */}
        {isForced && (
          <div style={{
            margin: '0.75rem 1.5rem 0 1.5rem',
            padding: '0.75rem 1rem',
            borderRadius: '10px',
            backgroundColor: forcedReason === 'first_login' ? '#eff6ff' : '#fffbeb',
            border: `1px solid ${forcedReason === 'first_login' ? '#bfdbfe' : '#fde68a'}`,
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.65rem'
          }}>
            {forcedReason === 'first_login' ? (
              <ShieldCheck size={18} color="#2563eb" style={{ flexShrink: 0, marginTop: '2px' }} />
            ) : (
              <Clock size={18} color="#d97706" style={{ flexShrink: 0, marginTop: '2px' }} />
            )}
            <div style={{ fontSize: '0.8rem', lineHeight: '1.4' }}>
              <strong style={{ color: forcedReason === 'first_login' ? '#1e40af' : '#92400e', display: 'block', marginBottom: '2px' }}>
                {forcedReason === 'first_login' ? 'Primeiro Acesso' : 'Senha Expirada'}
              </strong>
              <span style={{ color: forcedReason === 'first_login' ? '#1e3a8a' : '#78350f' }}>
                {forcedReason === 'first_login'
                  ? 'Por segurança e conformidade da clínica, cadastre sua nova senha pessoal antes de continuar.'
                  : 'O prazo de validade da sua credencial expirou. Cadastre uma nova senha para restabelecer o acesso.'}
              </span>
            </div>
          </div>
        )}

        {/* User identification strip */}
        <div style={styles.userStrip}>
          <div style={styles.userAvatar}>
            {(currentUser?.name || currentUser?.email || 'U').charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={styles.userName}>{currentUser?.name || 'Usuário'}</div>
            <div style={styles.userEmail}>{currentUser?.email || ''}</div>
          </div>
          <span style={styles.roleTag}>
            {currentUser?.role === 'admin' ? 'Administrador' : 'Colaborador'}
          </span>
        </div>

        {/* Alerts */}
        {errorMsg && (
          <div style={styles.alertError}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div style={styles.alertSuccess}>
            <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Senha Atual */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Atual</label>
            <div style={styles.inputWrap}>
              <input
                type={showCurrent ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Sua senha atual"
                style={styles.input}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                style={styles.eyeBtn}
                title={showCurrent ? 'Ocultar' : 'Exibir'}
              >
                {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <span style={styles.hint}>Opcional caso esteja em sessão ativa recente</span>
          </div>

          {/* Nova Senha */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Nova</label>
            <div style={styles.inputWrap}>
              <input
                type={showNew ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder={`Mínimo de ${policy.minLength} caracteres`}
                style={{
                  ...styles.input,
                  borderColor: newPassword.length > 0
                    ? (validation.isValid ? '#10b981' : '#f59e0b')
                    : 'var(--border-color, #e2e8f0)'
                }}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                style={styles.eyeBtn}
                title={showNew ? 'Ocultar' : 'Exibir'}
              >
                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Medidor de Força em tempo real */}
            {newPassword.length > 0 && (
              <div style={styles.meterContainer}>
                <div style={styles.meterTrack}>
                  <div 
                    style={{
                      ...styles.meterFill,
                      width: `${validation.score}%`,
                      backgroundColor: validation.strengthColor
                    }} 
                  />
                </div>
                <div style={styles.meterInfo}>
                  <span style={{ color: validation.strengthColor, fontWeight: '700' }}>
                    {validation.strengthLabel}
                  </span>
                  <span style={{ color: '#64748b' }}>{validation.score}%</span>
                </div>
              </div>
            )}
          </div>

          {/* Checklist de requisitos da clínica */}
          <div style={styles.checklistCard}>
            <div style={styles.checklistTitle}>
              <ShieldCheck size={14} color={policy.color || '#0284c7'} />
              <span>Critérios da Clínica ({policy.name})</span>
            </div>
            <div style={styles.checklistGrid}>
              {validation.checks.map((chk) => (
                <div key={chk.id} style={{
                  ...styles.checkItem,
                  color: chk.met ? '#059669' : '#64748b',
                  backgroundColor: chk.met ? '#ecfdf5' : '#f8fafc'
                }}>
                  <CheckCircle2 size={13} color={chk.met ? '#10b981' : '#94a3b8'} />
                  <span>{chk.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Confirmação de Senha */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Confirmação</label>
            <div style={styles.inputWrap}>
              <input
                type={showConfirm ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repita a nova senha"
                style={{
                  ...styles.input,
                  borderColor: confirmPassword.length > 0
                    ? (passwordsMatch ? '#10b981' : '#ef4444')
                    : 'var(--border-color, #e2e8f0)'
                }}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                style={styles.eyeBtn}
                title={showConfirm ? 'Ocultar' : 'Exibir'}
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {passwordsMatch && (
              <span style={{ fontSize: '0.75rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.25rem', fontWeight: '600' }}>
                <CheckCircle2 size={13} /> Senhas conferem
              </span>
            )}
            {isMatchError && (
              <span style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '0.25rem', display: 'block', fontWeight: '600' }}>
                As senhas não coincidem
              </span>
            )}
          </div>

          {/* Footer buttons */}
          <div style={styles.footer}>
            {isForced ? (
              <button
                type="button"
                onClick={handleForcedLogout}
                style={{ ...styles.cancelBtn, display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#ef4444' }}
                title="Sair do sistema"
              >
                <LogOut size={15} /> Sair
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                style={styles.cancelBtn}
              >
                Cancelar
              </button>
            )}
            <button
              type="submit"
              disabled={!canSubmit}
              style={{
                ...styles.submitBtn,
                backgroundColor: canSubmit ? (policy.color || '#0284c7') : '#94a3b8',
                cursor: canSubmit ? 'pointer' : 'not-allowed'
              }}
            >
              {loading ? 'Salvando...' : 'Salvar'}
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
    padding: '1rem',
    animation: 'fadeIn 0.2s ease-out'
  },
  modal: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '460px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    overflow: 'hidden',
    border: '1px solid rgba(226, 232, 240, 0.8)',
    display: 'flex',
    flexDirection: 'column'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1.25rem 1.5rem',
    borderBottom: '1px solid #f1f5f9'
  },
  iconBadge: {
    width: '42px',
    height: '42px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  title: {
    fontSize: '1.15rem',
    fontWeight: '700',
    color: '#0f172a',
    margin: 0
  },
  policyBadge: {
    fontSize: '0.7rem',
    fontWeight: '700',
    padding: '0.15rem 0.5rem',
    borderRadius: '6px',
    border: '1px solid'
  },
  subtitle: {
    fontSize: '0.8rem',
    color: '#64748b',
    margin: '0.15rem 0 0 0'
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: '#94a3b8',
    cursor: 'pointer',
    padding: '0.4rem',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  userStrip: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem 1.5rem',
    backgroundColor: '#f8fafc',
    borderBottom: '1px solid #f1f5f9'
  },
  userAvatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: '#0284c7',
    color: '#ffffff',
    fontWeight: '700',
    fontSize: '0.85rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  userName: {
    fontSize: '0.85rem',
    fontWeight: '700',
    color: '#1e293b',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  userEmail: {
    fontSize: '0.75rem',
    color: '#64748b',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  roleTag: {
    fontSize: '0.7rem',
    fontWeight: '600',
    color: '#475569',
    backgroundColor: '#e2e8f0',
    padding: '0.2rem 0.5rem',
    borderRadius: '6px'
  },
  alertError: {
    margin: '1rem 1.5rem 0',
    padding: '0.65rem 0.85rem',
    borderRadius: '8px',
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    color: '#991b1b',
    fontSize: '0.8rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  alertSuccess: {
    margin: '1rem 1.5rem 0',
    padding: '0.65rem 0.85rem',
    borderRadius: '8px',
    backgroundColor: '#ecfdf5',
    border: '1px solid #a7f3d0',
    color: '#065f46',
    fontSize: '0.8rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  form: {
    padding: '1.25rem 1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column'
  },
  label: {
    fontSize: '0.8rem',
    fontWeight: '700',
    color: '#334155',
    marginBottom: '0.35rem'
  },
  inputWrap: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },
  input: {
    width: '100%',
    padding: '0.6rem 2.4rem 0.6rem 0.75rem',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    fontSize: '0.875rem',
    backgroundColor: '#ffffff',
    color: '#0f172a',
    outline: 'none',
    transition: 'border-color 0.2s'
  },
  eyeBtn: {
    position: 'absolute',
    right: '0.6rem',
    background: 'none',
    border: 'none',
    color: '#94a3b8',
    cursor: 'pointer',
    padding: '0.25rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  hint: {
    fontSize: '0.7rem',
    color: '#94a3b8',
    marginTop: '0.25rem'
  },
  meterContainer: {
    marginTop: '0.45rem'
  },
  meterTrack: {
    width: '100%',
    height: '5px',
    backgroundColor: '#e2e8f0',
    borderRadius: '999px',
    overflow: 'hidden'
  },
  meterFill: {
    height: '100%',
    transition: 'width 0.3s ease, background-color 0.3s ease'
  },
  meterInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.7rem',
    marginTop: '0.2rem'
  },
  checklistCard: {
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    padding: '0.75rem'
  },
  checklistTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    fontSize: '0.75rem',
    fontWeight: '700',
    color: '#334155',
    marginBottom: '0.5rem'
  },
  checklistGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '0.35rem'
  },
  checkItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    fontSize: '0.72rem',
    fontWeight: '600',
    padding: '0.3rem 0.5rem',
    borderRadius: '6px',
    transition: 'all 0.15s ease'
  },
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.75rem',
    marginTop: '0.5rem',
    paddingTop: '1rem',
    borderTop: '1px solid #f1f5f9'
  },
  cancelBtn: {
    padding: '0.6rem 1.1rem',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    backgroundColor: '#ffffff',
    color: '#475569',
    fontSize: '0.85rem',
    fontWeight: '600',
    cursor: 'pointer'
  },
  submitBtn: {
    padding: '0.6rem 1.4rem',
    borderRadius: '8px',
    border: 'none',
    color: '#ffffff',
    fontSize: '0.85rem',
    fontWeight: '700',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.08)',
    transition: 'all 0.2s ease'
  }
};
