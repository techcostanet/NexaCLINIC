import React, { useState, useEffect } from 'react';
import { authService } from './firebase';
import Login from './components/Login';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import UploadData from './components/UploadData';
import AdminPanel from './components/AdminPanel';
import ModuleSelector from './components/ModuleSelector';
import ReceptionPanel from './components/ReceptionPanel';
import ClinicalPanel from './components/ClinicalPanel';
import StockPanel from './components/StockPanel';
import HRPanel from './components/HRPanel';
import FinancePanel from './components/FinancePanel';
import ConfigPanel from './components/ConfigPanel';
import PurchasingPanel from './components/PurchasingPanel';
import CalendarPanel from './components/CalendarPanel';
import TechnicianPanel from './components/TechnicianPanel';
import ApacBillingPanel from './components/ApacBillingPanel';
import MaintenancePanel from './components/MaintenancePanel';
import SesmtDashboard from './components/sesmt/SesmtDashboard';
import AssistPanel from './components/AssistPanel';
import ErrorBoundary from './components/ErrorBoundary';
import ModuleGuideModal from './components/common/ModuleGuideModal';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentModule, setCurrentModule] = useState('selector'); // 'selector' | 'quality' | 'reception'
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isReportsOpen, setIsReportsOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    
    // Safety fallback: Release loading screen after 3.5s if Auth is delayed/offline
    const authTimer = setTimeout(() => {
      if (isMounted) {
        setLoading(prev => {
          if (prev) {
            console.warn('Auth loading timeout reached - unlocking UI screen.');
            return false;
          }
          return prev;
        });
      }
    }, 3500);

    // Listen to Auth changes (Mock or Firebase real)
    const unsubscribe = authService.onAuthChange((currentUser) => {
      if (isMounted) {
        clearTimeout(authTimer);
        setUser(currentUser);
        setLoading(false);
        
        // If user logs out, reset states
        if (!currentUser) {
          setCurrentModule('selector');
          setCurrentPage('dashboard');
        }
      }
    });

    const loadBranding = async () => {
      try {
        const { dbService } = await import('./firebase');
        const settings = await dbService.getTenantSettings();
        if (settings && settings.themeColor) {
          document.documentElement.style.setProperty('--primary-color', settings.themeColor);
        }
      } catch (err) {
        console.error(err);
      }
    };
    loadBranding();

    window.addEventListener('tenant-branding-changed', loadBranding);

    return () => {
      isMounted = false;
      clearTimeout(authTimer);
      unsubscribe();
      window.removeEventListener('tenant-branding-changed', loadBranding);
    };
  }, []);

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={{ marginTop: '1rem', color: 'var(--text-secondary)', fontWeight: '500' }}>
          Carregando NexaCLINIC...
        </p>
      </div>
    );
  }

  // Auth Guard Guard
  if (!user) {
    return <Login onLoginSuccess={(loggedInUser) => setUser(loggedInUser)} />;
  }

  // If authenticated but no module selected, show selector
  if (currentModule === 'selector') {
    return <ModuleSelector user={user} onSelectModule={setCurrentModule} />;
  }

  // Simple Router based on state
  const renderContent = () => {
    switch (currentModule) {
      case 'assist':
        return <ErrorBoundary><AssistPanel currentUser={user} /></ErrorBoundary>;
      case 'reception':
        return <ErrorBoundary><ReceptionPanel currentUser={user} /></ErrorBoundary>;
      case 'clinical':
        return <ErrorBoundary><ClinicalPanel currentUser={user} /></ErrorBoundary>;
      case 'stock':
        return <ErrorBoundary><StockPanel currentUser={user} /></ErrorBoundary>;
      case 'maintenance':
        return <ErrorBoundary><MaintenancePanel currentUser={user} /></ErrorBoundary>;
      case 'hr':
        return <ErrorBoundary><HRPanel currentUser={user} /></ErrorBoundary>;
      case 'finance':
        return <ErrorBoundary><FinancePanel currentUser={user} isReportsOpen={isReportsOpen} setIsReportsOpen={setIsReportsOpen} /></ErrorBoundary>;
      case 'purchasing':
        return <ErrorBoundary><PurchasingPanel currentUser={user} /></ErrorBoundary>;
      case 'calendar':
        return <ErrorBoundary><CalendarPanel currentUser={user} /></ErrorBoundary>;
      case 'config':
        return <ErrorBoundary><ConfigPanel currentUser={user} /></ErrorBoundary>;
      case 'requisitions':
        return <ErrorBoundary><TechnicianPanel currentUser={user} /></ErrorBoundary>;
      case 'apac':
        return <ErrorBoundary><ApacBillingPanel currentUser={user} /></ErrorBoundary>;
      case 'sesmt':
        return <ErrorBoundary><SesmtDashboard currentUser={user} /></ErrorBoundary>;
      default:
        return renderQualityPage();
    }
  };

  const renderQualityPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard currentUser={user} />;
      case 'upload':
        return <UploadData currentUser={user} />;
      case 'admin':
        // Guard for Admin Panel
        if (user.role === 'admin') {
          return <AdminPanel currentUser={user} />;
        }
        setCurrentPage('dashboard');
        return <Dashboard currentUser={user} />;
      default:
        return <Dashboard currentUser={user} />;
    }
  };

  return (
    <div className="app-container">
      {/* Navigation bar */}
      <Navbar 
        user={user} 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage} 
        currentModule={currentModule}
        setCurrentModule={setCurrentModule}
        setIsReportsOpen={setIsReportsOpen}
        setIsGuideOpen={setIsGuideOpen}
      />

      {/* Main body content area */}
      <main className="main-content">
        {renderContent()}
      </main>

      {/* Module Guide Modal */}
      {isGuideOpen && (
        <ModuleGuideModal 
          moduleId={currentModule} 
          onClose={() => setIsGuideOpen(false)} 
        />
      )}

      {/* Footer copyright */}
      <footer style={styles.footer}>
        <div style={styles.footerContainer}>
          <span>© {new Date().getFullYear()} NexaCLINIC & NexaINDEX. Plataforma Integrada de Gestão Hospitalar.</span>
          <span style={styles.footerVersion}>v{typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '1.0.0'}</span>
        </div>
      </footer>
    </div>
  );
}

const styles = {
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: 'var(--bg-color)',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid var(--border-color)',
    borderTopColor: 'var(--primary-color)',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  footer: {
    backgroundColor: '#ffffff',
    borderTop: '1px solid var(--border-color)',
    padding: '1.25rem 0',
    marginTop: 'auto',
  },
  footerContainer: {
    maxWidth: 'var(--max-width)',
    margin: '0 auto',
    padding: '0 1.5rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    flexWrap: 'wrap',
    gap: '0.5rem',
  },
  footerVersion: {
    fontStyle: 'italic',
    fontWeight: '500',
  }
};

// Add raw keyframe animations
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.type = 'text/css';
  style.innerHTML = `
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
}
