import React, { useState } from 'react';
import { authService } from '../firebase';
import { Activity, Mail, Lock, ShieldAlert } from 'lucide-react';

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await authService.login(email, password);
      if (res && res.user && onLoginSuccess) {
        onLoginSuccess(res.user);
      }
    } catch (err) {
      console.error("Erro no login:", err);
      let msg = 'Falha ao autenticar no sistema.';
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        msg = 'E-mail ou senha incorretos. Por favor, verifique suas credenciais.';
      } else if (err.code === 'auth/invalid-api-key') {
        msg = 'Chave de API do Firebase não configurada. Re-tentativa automática em andamento.';
      } else if (err.message) {
        msg = err.message.replace(/^Firebase:\s*/, '');
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div className="card" style={styles.card}>
        <div style={styles.header}>
          <div style={styles.logoContainer}>
            <img src="/logo.png" alt="Costa Systems Logo" style={styles.logoImg} />
          </div>
          <h1 style={styles.title}>NexaCLINIC</h1>
          <p style={styles.subtitle}>Sistema de Gestão de Clínicas e Hospitais</p>
          <span style={styles.versionLabel}>v{typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '1.0.0'}</span>
        </div>

        {error && (
          <div className="alert alert-danger">
            <ShieldAlert size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">E-mail funcional</label>
            <div style={styles.inputWrapper}>
              <Mail size={18} style={styles.inputIcon} />
              <input
                id="email"
                type="email"
                className="form-control"
                placeholder="usuario@nexa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                style={styles.input}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Senha</label>
            <div style={styles.inputWrapper}>
              <Lock size={18} style={styles.inputIcon} />
              <input
                id="password"
                type="password"
                className="form-control"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                style={styles.input}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={styles.submitBtn}
          >
            {loading ? 'Autenticando...' : 'Entrar no Sistema'}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    padding: '1rem',
    background: 'linear-gradient(135deg, #f0fdfa 0%, #f8fafc 100%)',
  },
  card: {
    width: '100%',
    maxWidth: '420px',
    padding: '2.5rem 2rem',
    borderRadius: 'var(--border-radius-lg)',
  },
  header: {
    textAlign: 'center',
    marginBottom: '2rem',
  },
  logoContainer: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '75px',
    height: '75px',
    borderRadius: '50%',
    backgroundColor: 'var(--primary-light)',
    marginBottom: '1rem',
    overflow: 'hidden',
  },
  logoImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  title: {
    fontSize: '1.75rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
    marginBottom: '0.25rem',
  },
  subtitle: {
    fontSize: '0.875rem',
    color: 'var(--text-secondary)',
  },
  versionLabel: {
    fontSize: '0.725rem',
    color: 'var(--text-muted)',
    display: 'inline-block',
    marginTop: '0.5rem',
    backgroundColor: 'var(--bg-color)',
    padding: '0.15rem 0.5rem',
    borderRadius: '4px',
    fontWeight: '600',
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: '0.75rem',
    color: 'var(--text-muted)',
  },
  input: {
    paddingLeft: '2.5rem',
  },
  submitBtn: {
    width: '100%',
    marginTop: '0.5rem',
    padding: '0.75rem',
    fontSize: '0.95rem',
  },
  demoBox: {
    marginTop: '2rem',
    padding: '1rem',
    backgroundColor: 'var(--bg-color)',
    border: '1px dashed var(--border-color)',
    borderRadius: 'var(--border-radius-sm)',
    fontSize: '0.8rem',
  },
  demoTitle: {
    fontWeight: '600',
    color: 'var(--text-secondary)',
    marginBottom: '0.5rem',
  },
  demoUser: {
    marginBottom: '0.25rem',
    color: 'var(--text-secondary)',
    display: 'flex',
    justifyContent: 'space-between',
  }
};
