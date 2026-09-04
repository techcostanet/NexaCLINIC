import React, { useState, useEffect } from 'react';
import { 
  Calendar, UserCheck, RefreshCw, Activity, DollarSign, 
  Settings, Users, ShieldAlert, Sparkles, AlertCircle, Stethoscope
} from 'lucide-react';
import { dbService } from '../firebase';
import { FALLBACK_DOCTORS } from '../services/firebase/medicalService';
import { formatDoctorDisplayName, sortDoctorsByName } from '../utils/doctorFormatters';

import MedicalScheduleTab from './medical/MedicalScheduleTab';
import MedicalMyShiftsTab from './medical/MedicalMyShiftsTab';
import MedicalSwapsTab from './medical/MedicalSwapsTab';
import MedicalProceduresTab from './medical/MedicalProceduresTab';
import MedicalProductionTab from './medical/MedicalProductionTab';
import MedicalDoctorsTab from './medical/MedicalDoctorsTab';
import MedicalSettingsTab from './medical/MedicalSettingsTab';
import MedicalStatementModal from './medical/MedicalStatementModal';
import { useUnit } from '../contexts/UnitContext';
import UnitSelector from './common/UnitSelector';

export default function MedicalPanel({ currentUser, onBack }) {
  const { activeUnitId, filterByActiveUnit, matchItemUnit } = useUnit();

  // Role check: Clinical Director / Admin vs Regular Doctor
  const isClinicalDirector = Boolean(
    currentUser?.role === 'admin' ||
    currentUser?.role === 'director' ||
    currentUser?.role === 'coordenador' ||
    currentUser?.isDirector === true ||
    currentUser?.isClinicalDirector === true ||
    currentUser?.allowedSectors?.includes('admin') ||
    currentUser?.email === 'contato@techcosta.net' ||
    currentUser?.email === 'secretariabetim@dialize.com.br'
  );

  const [activeTab, setActiveTab] = useState(isClinicalDirector ? 'Escala' : 'Plantões');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().substring(0, 7));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isClinicalDirector && (activeTab === 'Escala' || activeTab === 'Profissionais' || activeTab === 'Honorários')) {
      setActiveTab('Plantões');
    }
  }, [isClinicalDirector, activeTab]);

  // View switch: Coordination vs specific doctor portal
  const [currentDoctorId, setCurrentDoctorId] = useState('doc-lucas-uid');
  const [viewMode, setViewMode] = useState('coordination'); // 'coordination' | 'doctor'

  // Data states (initialized with FALLBACK_DOCTORS to prevent blank dropdowns)
  const [doctors, setDoctors] = useState(FALLBACK_DOCTORS);
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
        dbService.getMedicalDoctors ? dbService.getMedicalDoctors().catch(() => FALLBACK_DOCTORS) : Promise.resolve(FALLBACK_DOCTORS),
        dbService.getUsers ? dbService.getUsers().catch(() => []) : Promise.resolve([]),
        dbService.getMedicalSettings ? dbService.getMedicalSettings().catch(() => ({})) : Promise.resolve({}),
        dbService.getMedicalSchedules ? dbService.getMedicalSchedules(selectedMonth).catch(() => []) : Promise.resolve([]),
        dbService.getMedicalSwaps ? dbService.getMedicalSwaps().catch(() => []) : Promise.resolve([]),
        dbService.getMedicalProcedures ? dbService.getMedicalProcedures().catch(() => []) : Promise.resolve([]),
        dbService.getMedicalProductions ? dbService.getMedicalProductions(selectedMonth).catch(() => []) : Promise.resolve([]),
        dbService.getPatients ? dbService.getPatients().catch(() => []) : Promise.resolve([]),
        dbService.getAppointments ? dbService.getAppointments().catch(() => []) : Promise.resolve([])
      ]);

      // Unify doctors from medicalService and users (from Agenda)
      const unifiedDocs = Array.isArray(docsData) && docsData.length > 0 ? docsData.map(d => ({ ...d, name: formatDoctorDisplayName(d.name) })) : FALLBACK_DOCTORS.map(d => ({ ...d, name: formatDoctorDisplayName(d.name) }));
      (userList || []).forEach(u => {
        const uId = u.uid || u.id;
        const exists = unifiedDocs.some(d => d.id === uId || (d.email && u.email && d.email.toLowerCase() === u.email.toLowerCase()) || d.name === u.name);
        if (!exists) {
          const isDoc = u.role === 'doctor' ||
            u.role === 'admin' || 
            u.role === 'professional' || 
            u.role === 'clinical' || 
            (u.allowedSectors && u.allowedSectors.includes('medica')) ||
            (u.name && (u.name.toLowerCase().includes('dr') || u.name.toLowerCase().includes('médic') || u.name.toLowerCase().includes('nefro')));
          
          if (isDoc) {
            unifiedDocs.push({
              id: uId,
              name: formatDoctorDisplayName(u.name) || 'Profissional',
              crm: u.crm || (u.name?.includes('Dr') ? '45892/MG' : 'CRM Ativo'),
              specialty: u.specialty || 'Nefrologia',
              email: u.email || '',
              phone: u.phone || '',
              contractType: u.contractType || 'PJ',
              pixKey: u.pixKey || u.email || '',
              bank: u.bank || 'Banco Principal'
            });
          }
        }
      });

      const sortedDocs = sortDoctorsByName(unifiedDocs);
      setDoctors(sortedDocs);

      // Select doctor based on current logged user if available, or maintain selection
      if (currentUser && currentUser.email) {
        const matchedDoc = sortedDocs.find(d => 
          (d.email && d.email.toLowerCase() === currentUser.email.toLowerCase()) || 
          d.id === currentUser.uid ||
          (d.name && currentUser.name && d.name.toLowerCase() === currentUser.name.toLowerCase())
        );
        if (matchedDoc) {
          setCurrentDoctorId(matchedDoc.id || matchedDoc.uid);
        } else if (sortedDocs.length > 0 && !sortedDocs.some(d => d.id === currentDoctorId)) {
          setCurrentDoctorId(sortedDocs[0].id || sortedDocs[0].uid);
        }
      } else if (sortedDocs.length > 0 && (!currentDoctorId || !sortedDocs.some(d => d.id === currentDoctorId))) {
        setCurrentDoctorId(sortedDocs[0].id || sortedDocs[0].uid);
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
      if (Array.isArray(shiftData)) {
        if (dbService.saveMedicalSchedulesBatch) {
          await dbService.saveMedicalSchedulesBatch(shiftData);
        } else {
          for (const s of shiftData) {
            await dbService.saveMedicalSchedule(s);
          }
        }
        showToast(`${shiftData.length} plantões salvos na escala com sucesso!`);
      } else {
        await dbService.saveMedicalSchedule(shiftData);
        showToast('Plantão salvo na escala com sucesso!');
      }
      await loadAllData();
    } catch (err) {
      console.error(err);
      showToast('Erro ao salvar escala.');
    } finally {
      setLoading(false);
    }
  };

  const handleClearMonthSchedule = async (month) => {
    if (!window.confirm(`Deseja realmente apagar todos os plantões do mês ${month}? Esta ação é irreversível.`)) return;
    try {
      setLoading(true);
      if (dbService.clearMedicalSchedulesMonth) {
        await dbService.clearMedicalSchedulesMonth(month);
      } else {
        const toDelete = schedules.filter(s => s.month === month);
        for (const s of toDelete) {
          await dbService.deleteMedicalSchedule(s.id);
        }
      }
      showToast(`Escala de ${month} limpa com sucesso!`);
      await loadAllData();
    } catch (err) {
      console.error(err);
      showToast('Erro ao limpar escala do mês.');
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

  const handleSaveDoctor = async (doctorId, doctorData) => {
    try {
      setLoading(true);
      await dbService.saveMedicalDoctor(doctorId, doctorData);
      showToast(`Dados de "${doctorData.name}" salvos na nuvem com sucesso!`);
      await loadAllData();
    } catch (err) {
      console.error(err);
      showToast('Erro ao salvar dados do médico.');
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

  const currentDoctors = React.useMemo(() => {
    if (!doctors || doctors.length === 0) return [];
    return doctors;
  }, [doctors]);
  const currentSchedules = React.useMemo(() => filterByActiveUnit(schedules), [schedules, activeUnitId]);
  const currentSwaps = React.useMemo(() => filterByActiveUnit(swaps), [swaps, activeUnitId]);
  const currentProcedures = React.useMemo(() => filterByActiveUnit(procedures), [procedures, activeUnitId]);
  const currentProductions = React.useMemo(() => filterByActiveUnit(productions), [productions, activeUnitId]);
  const currentPatients = React.useMemo(() => {
    const list = filterByActiveUnit(patients);
    return list.length > 0 ? list : (patients || []);
  }, [patients, activeUnitId]);
  const currentAppointments = React.useMemo(() => filterByActiveUnit(appointments), [appointments, activeUnitId]);

  const tabs = [
    ...(isClinicalDirector ? [{ id: 'Escala', label: 'Escala', icon: Calendar }] : []),
    { id: 'Plantões', label: 'Plantões', icon: UserCheck },
    ...(isClinicalDirector ? [{ id: 'Trocas', label: 'Trocas', icon: RefreshCw }] : []),
    { id: 'Procedimentos', label: 'Procedimentos', icon: Activity },
    ...(isClinicalDirector ? [
      { id: 'Produção', label: 'Produção', icon: DollarSign },
      { id: 'Profissionais', label: 'Profissionais', icon: Users },
      { id: 'Honorários', label: 'Honorários', icon: Settings }
    ] : [])
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <UnitSelector compact showLabel={false} />
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
        {isClinicalDirector && activeTab === 'Escala' && (
          <MedicalScheduleTab
            schedules={currentSchedules}
            doctors={currentDoctors}
            swaps={currentSwaps}
            selectedMonth={selectedMonth}
            onChangeMonth={setSelectedMonth}
            onSaveSchedule={handleSaveSchedule}
            onDeleteSchedule={handleDeleteSchedule}
            onClearMonth={handleClearMonthSchedule}
            loading={loading}
          />
        )}

        {activeTab === 'Plantões' && (
          <MedicalMyShiftsTab
            doctor={currentDoctor}
            doctors={currentDoctors}
            patients={currentPatients}
            schedules={currentSchedules}
            procedures={currentProcedures}
            appointments={currentAppointments}
            settings={settings}
            onRequestSwap={handleRequestSwap}
            onSaveSettings={handleSaveSettings}
            loading={loading}
          />
        )}

        {isClinicalDirector && activeTab === 'Trocas' && (
          <MedicalSwapsTab
            swaps={currentSwaps}
            currentDoctor={currentDoctor}
            doctors={currentDoctors}
            schedules={currentSchedules}
            isCoordination={isClinicalDirector}
            onRequestSwap={handleRequestSwap}
            onRespondSwap={handleRespondSwap}
            onHomologateSwap={handleHomologateSwap}
            loading={loading}
          />
        )}

        {activeTab === 'Procedimentos' && (
          <MedicalProceduresTab
            procedures={currentProcedures}
            doctors={currentDoctors}
            patients={currentPatients}
            settings={settings}
            onSaveProcedure={handleSaveProcedure}
            onDeleteProcedure={handleDeleteProcedure}
            loading={loading}
          />
        )}

        {isClinicalDirector && activeTab === 'Produção' && (
          <MedicalProductionTab
            selectedMonth={selectedMonth}
            doctors={currentDoctors}
            schedules={currentSchedules}
            procedures={currentProcedures}
            appointments={currentAppointments}
            productions={currentProductions}
            settings={settings}
            onHomologateProduction={handleHomologateProduction}
            onOpenStatement={setStatementData}
            onSaveSettings={handleSaveSettings}
            loading={loading}
          />
        )}

        {isClinicalDirector && activeTab === 'Profissionais' && (
          <MedicalDoctorsTab
            doctors={currentDoctors}
            onSaveDoctor={handleSaveDoctor}
            loading={loading}
          />
        )}

        {isClinicalDirector && activeTab === 'Honorários' && (
          <MedicalSettingsTab
            settings={settings}
            doctors={currentDoctors}
            onSaveSettings={handleSaveSettings}
            onSaveDoctor={handleSaveDoctor}
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
