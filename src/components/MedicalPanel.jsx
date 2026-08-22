import React, { useState, useEffect } from 'react';
import { 
  Calendar, UserCheck, RefreshCw, Activity, DollarSign, 
  Settings, Users, ShieldAlert, Sparkles, AlertCircle, ArrowLeft, Stethoscope
} from 'lucide-react';
import { dbService } from '../firebase';

import MedicalScheduleTab from './medical/MedicalScheduleTab';
import MedicalMyShiftsTab from './medical/MedicalMyShiftsTab';
import MedicalSwapsTab from './medical/MedicalSwapsTab';
import MedicalProceduresTab from './medical/MedicalProceduresTab';
import MedicalProductionTab from './medical/MedicalProductionTab';
import MedicalSettingsTab from './medical/MedicalSettingsTab';
import MedicalStatementModal from './medical/MedicalStatementModal';

export default function MedicalPanel({ onBack }) {
  const [activeTab, setActiveTab] = useState('Escala');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().substring(0, 7));
  const [loading, setLoading] = useState(false);

  // View switch: Coordination vs specific doctor portal
  const [currentDoctorId, setCurrentDoctorId] = useState('doc-1');
  const [viewMode, setViewMode] = useState('coordination'); // 'coordination' | 'doctor'

  // Data states
  const [doctors, setDoctors] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [swaps, setSwaps] = useState([]);
  const [procedures, setProcedures] = useState([]);
  const [productions, setProductions] = useState([]);
  const [settings, setSettings] = useState({});
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);

  // Statement modal
  const [statementData, setStatementData] = useState(null);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [
        docsData,
        userList,
        settingsData,
        schedsData,
        swapsData,
        procsData,
        prodsData,
        patsData,
        apptsData
      ] = await Promise.all([
        dbService.getMedicalDoctors ? dbService.getMedicalDoctors() : [],
        dbService.getUsers ? dbService.getUsers() : [],
        dbService.getMedicalSettings ? dbService.getMedicalSettings() : {},
        dbService.getMedicalSchedules ? dbService.getMedicalSchedules(selectedMonth) : [],
        dbService.getMedicalSwaps ? dbService.getMedicalSwaps() : [],
        dbService.getMedicalProcedures ? dbService.getMedicalProcedures() : [],
        dbService.getMedicalProductions ? dbService.getMedicalProductions(selectedMonth) : [],
        dbService.getPatients ? dbService.getPatients() : [],
        dbService.getAppointments ? dbService.getAppointments() : []
      ]);

      // Unify doctors from medicalService and users (from Agenda)
      const unifiedDocs = [...(docsData || [])];
      (userList || []).forEach(u => {
        const uId = u.uid || u.id;
        const exists = unifiedDocs.some(d => d.id === uId || (d.email && u.email && d.email.toLowerCase() === u.email.toLowerCase()) || d.name === u.name);
        if (!exists) {
          unifiedDocs.push({
            id: uId,
            name: u.name || 'Profissional',
            crm: u.crm || (u.name?.includes('Dr') ? '45892/MG' : 'CRM Ativo'),
            specialty: u.specialty || 'Nefrologia',
            email: u.email || '',
            phone: u.phone || '',
            contractType: u.contractType || 'PJ',
            pixKey: u.pixKey || u.email || '',
            bank: u.bank || 'Banco Principal'
          });
        }
      });

      setDoctors(unifiedDocs);
      if (unifiedDocs.length > 0 && (!currentDoctorId || !unifiedDocs.some(d => d.id === currentDoctorId))) {
        setCurrentDoctorId(unifiedDocs[0].id);
      }

      setSettings(settingsData || {});
      setSchedules(schedsData || []);
      setSwaps(swapsData || []);
      setProcedures(procsData || []);
      setProductions(prodsData || []);
      setPatients(patsData || []);
      setAppointments(apptsData || []);
    } catch (err) {
      console.error('Erro ao carregar dados do NexaMED:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, [selectedMonth]);

  const currentDoctor = doctors.find(d => d.id === currentDoctorId) || doctors[0];

  // Schedule Actions
  const handleSaveSchedule = async (shiftData) => {
    try {
      setLoading(true);
      await dbService.saveMedicalSchedule(shiftData);
      showToast('Plantão salvo na escala com sucesso!');
      await loadAllData();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSchedule = async (id) => {
    if (!window.confirm('Deseja realmente remover este plantão da escala?')) return;
    try {
      setLoading(true);
      await dbService.deleteMedicalSchedule(id);
      showToast('Plantão removido com sucesso!');
      await loadAllData();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Swap Actions
  const handleRequestSwap = async (swapData) => {
    try {
      setLoading(true);
      await dbService.requestMedicalSwap(swapData);
      showToast('Solicitação de troca enviada! E-mails disparados com sucesso.');
      await loadAllData();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRespondSwap = async (swapId, accepted, reason = '') => {
    try {
      setLoading(true);
      await dbService.respondMedicalSwap(swapId, accepted, reason);
      showToast(accepted ? 'Troca aceita! Encaminhada para homologação da coordenação.' : 'Troca recusada.');
      await loadAllData();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleHomologateSwap = async (swapId) => {
    try {
      setLoading(true);
      await dbService.homologateMedicalSwap(swapId, 'Coordenação Médica');
      showToast('Troca homologada! Escala atualizada e médicos notificados.');
      await loadAllData();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Procedure Actions
  const handleSaveProcedure = async (procedureData) => {
    try {
      setLoading(true);
      await dbService.saveMedicalProcedure(procedureData);
      showToast('Procedimento lançado com sucesso!');
      await loadAllData();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProcedure = async (id) => {
    if (!window.confirm('Deseja realmente excluir este procedimento?')) return;
    try {
      setLoading(true);
      await dbService.deleteMedicalProcedure(id);
      showToast('Procedimento excluído com sucesso!');
      await loadAllData();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Settings Actions
  const handleSaveSettings = async (settingsData) => {
    try {
      setLoading(true);
      await dbService.saveMedicalSettings(settingsData);
      setSettings(settingsData);
      showToast('Tabela de honorários e parâmetros salvos!');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Production Homologation
  const handleHomologateProduction = async (productionData) => {
    try {
      setLoading(true);
      const res = await dbService.homologateMedicalProduction(productionData);
      showToast(`Repasse do ${productionData.doctorName} homologado e lançado no Contas a Pagar do Financeiro!`);
      await loadAllData();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'Escala', label: 'Escala', icon: Calendar },
    { id: 'Plantões', label: 'Plantões', icon: UserCheck },
    { id: 'Trocas', label: 'Trocas', icon: RefreshCw },
    { id: 'Procedimentos', label: 'Procedimentos', icon: Activity },
    { id: 'Produção', label: 'Produção', icon: DollarSign },
    { id: 'Honorários', label: 'Honorários', icon: Settings },
  ];

  return (
    <div style={styles.container}>
      {/* Toast Notification */}
      {toastMessage && (
        <div style={styles.toast}>
          <Sparkles size={16} color="#10b981" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header / Hero Section (Design Padrão Nexa) */}
      <div style={styles.heroSection}>
        <div style={styles.heroLeft}>
          <div style={styles.heroIconBadge}>
            <Stethoscope size={28} color="#fff" />
          </div>
          <div>
            <h1 style={styles.heroTitle}>NexaMED — Gestão Médica & Escalas</h1>
            <p style={styles.heroSubtitle}>
              Escala de plantões nos salões/DP, produção ambulatorial, bolsa de trocas e repasse financeiro.
            </p>
          </div>
        </div>

        <div style={styles.heroActions}>
          {onBack && (
            <button onClick={onBack} style={styles.backBtn}>
              <ArrowLeft size={16} />
              <span>Voltar</span>
            </button>
          )}

          <div style={styles.modeControlBox}>
            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b' }}>Acesso:</span>
            <select
              className="form-control"
              value={currentDoctorId}
              onChange={e => setCurrentDoctorId(e.target.value)}
              style={{ width: '230px', fontSize: '0.82rem', backgroundColor: '#fff', color: '#0f172a', borderColor: '#cbd5e1', fontWeight: '600' }}
            >
              {doctors.map(doc => (
                <option key={doc.id || doc.uid} value={doc.id || doc.uid}>{doc.name} (Médico)</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div style={styles.tabsBar}>
        {tabs.map(t => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id)}
              style={{
                ...styles.tabBtn,
                ...(isActive ? styles.tabBtnActive : {})
              }}
            >
              <Icon size={15} />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      <div style={styles.contentArea}>
        {activeTab === 'Escala' && (
          <MedicalScheduleTab
            schedules={schedules}
            doctors={doctors}
            selectedMonth={selectedMonth}
            onChangeMonth={setSelectedMonth}
            onSaveSchedule={handleSaveSchedule}
            onDeleteSchedule={handleDeleteSchedule}
            loading={loading}
          />
        )}

        {activeTab === 'Plantões' && (
          <MedicalMyShiftsTab
            doctor={currentDoctor}
            doctors={doctors}
            patients={patients}
            schedules={schedules}
            procedures={procedures}
            onRequestSwap={handleRequestSwap}
            onSaveProcedure={handleSaveProcedure}
            loading={loading}
          />
        )}

        {activeTab === 'Trocas' && (
          <MedicalSwapsTab
            swaps={swaps}
            currentDoctor={currentDoctor}
            isCoordination={true}
            onRespondSwap={handleRespondSwap}
            onHomologateSwap={handleHomologateSwap}
            loading={loading}
          />
        )}

        {activeTab === 'Procedimentos' && (
          <MedicalProceduresTab
            procedures={procedures}
            doctors={doctors}
            patients={patients}
            settings={settings}
            onSaveProcedure={handleSaveProcedure}
            onDeleteProcedure={handleDeleteProcedure}
            loading={loading}
          />
        )}

        {activeTab === 'Produção' && (
          <MedicalProductionTab
            selectedMonth={selectedMonth}
            doctors={doctors}
            schedules={schedules}
            procedures={procedures}
            appointments={appointments}
            productions={productions}
            settings={settings}
            onHomologateProduction={handleHomologateProduction}
            onOpenStatement={setStatementData}
            loading={loading}
          />
        )}

        {activeTab === 'Honorários' && (
          <MedicalSettingsTab
            settings={settings}
            doctors={doctors}
            onSaveSettings={handleSaveSettings}
            loading={loading}
          />
        )}
      </div>

      {/* Extrato / Statement Modal */}
      {statementData && (
        <MedicalStatementModal
          production={statementData}
          month={selectedMonth}
          procedures={procedures}
          schedules={schedules}
          settings={settings}
          onClose={() => setStatementData(null)}
        />
      )}
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
    padding: '1.5rem',
    maxWidth: '1600px',
    margin: '0 auto',
  },
  toast: {
    position: 'fixed',
    top: '1.5rem',
    right: '1.5rem',
    backgroundColor: '#0f172a',
    color: '#fff',
    padding: '0.75rem 1.25rem',
    borderRadius: '8px',
    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.2)',
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    zIndex: 99999,
    fontSize: '0.85rem',
    fontWeight: '700',
  },
  heroSection: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1.5rem',
    backgroundColor: '#fff',
    padding: '1.5rem 2rem',
    borderRadius: '16px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    border: '1px solid var(--border-color, #e2e8f0)',
    marginBottom: '0.25rem'
  },
  heroLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.25rem'
  },
  heroIconBadge: {
    width: '56px',
    height: '56px',
    borderRadius: '14px',
    background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 8px 16px rgba(2, 132, 199, 0.25)',
    flexShrink: 0
  },
  heroTitle: {
    fontSize: '1.6rem',
    fontWeight: '800',
    color: 'var(--text-primary, #0f172a)',
    margin: 0
  },
  heroSubtitle: {
    fontSize: '0.9rem',
    color: 'var(--text-secondary, #64748b)',
    margin: '0.25rem 0 0 0'
  },
  heroActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    flexWrap: 'wrap'
  },
  backBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
    padding: '0.5rem 0.9rem',
    fontSize: '0.82rem',
    fontWeight: '700',
    backgroundColor: '#f1f5f9',
    color: '#334155',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  modeControlBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    backgroundColor: '#f8fafc',
    padding: '0.45rem 0.85rem',
    borderRadius: '10px',
    border: '1px solid #e2e8f0',
  },
  tabsBar: {
    display: 'flex',
    gap: '0.4rem',
    borderBottom: '2px solid #e2e8f0',
    paddingBottom: '0.25rem',
    overflowX: 'auto',
  },
  tabBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    padding: '0.55rem 1.1rem',
    fontSize: '0.85rem',
    fontWeight: '700',
    backgroundColor: 'transparent',
    color: '#64748b',
    border: 'none',
    borderBottom: '2px solid transparent',
    cursor: 'pointer',
    borderRadius: '6px 6px 0 0',
    transition: 'all 0.2s ease',
  },
  tabBtnActive: {
    color: '#8b5cf6',
    backgroundColor: '#fff',
    borderBottom: '2px solid #8b5cf6',
  },
  contentArea: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '1.5rem',
    border: '1px solid #e2e8f0',
    boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
  }
};
