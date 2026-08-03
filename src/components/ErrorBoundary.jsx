import React from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Atualiza o state para que a próxima renderização mostre a UI de fallback.
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Você pode registrar o erro em um serviço de relatórios de erros
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    // Opcional: redirecionar para a home
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Você pode renderizar qualquer UI de fallback
      return (
        <div style={styles.container}>
          <div style={styles.card}>
            <div style={styles.iconWrapper}>
              <AlertTriangle size={48} color="#ef4444" />
            </div>
            <h2 style={styles.title}>Oops! Algo deu errado.</h2>
            <p style={styles.message}>
              Ocorreu um erro inesperado ao tentar exibir esta tela. Os dados podem estar corrompidos ou em um formato inválido.
            </p>
            
            <div style={styles.errorDetails}>
              <p style={styles.errorName}>{this.state.error?.toString()}</p>
              <pre style={styles.errorStack}>
                {this.state.errorInfo?.componentStack}
              </pre>
            </div>

            <button onClick={this.handleReset} style={styles.button}>
              <RefreshCcw size={18} />
              Recarregar Página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children; 
  }
}

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    padding: '2rem',
    fontFamily: 'Inter, system-ui, sans-serif'
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    padding: '3rem 2rem',
    maxWidth: '600px',
    width: '100%',
    textAlign: 'center'
  },
  iconWrapper: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '1.5rem'
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: '1rem',
    margin: 0
  },
  message: {
    color: '#475569',
    fontSize: '1rem',
    lineHeight: '1.5',
    marginBottom: '2rem'
  },
  errorDetails: {
    backgroundColor: '#fef2f2',
    border: '1px solid #fee2e2',
    borderRadius: '8px',
    padding: '1rem',
    marginBottom: '2rem',
    textAlign: 'left',
    overflowX: 'auto'
  },
  errorName: {
    color: '#991b1b',
    fontWeight: '600',
    margin: '0 0 0.5rem 0',
    fontFamily: 'monospace',
    fontSize: '0.9rem'
  },
  errorStack: {
    color: '#b91c1c',
    margin: 0,
    fontSize: '0.8rem',
    fontFamily: 'monospace',
    whiteSpace: 'pre-wrap'
  },
  button: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '0.75rem 1.5rem',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s'
  }
};

export default ErrorBoundary;
