import { app } from '../../firebase';
import { USE_MOCK, mockFirestore } from './mockDb';

export const getTenantSettings = async () => {
    if (USE_MOCK) return mockFirestore.getTenantSettings();
    try {
      const { getFirestore, doc, getDoc } = await import('firebase/firestore');
      const db = getFirestore(app);
      const snap = await getDoc(doc(db, 'tenant_settings', 'main'));
      if (snap.exists()) {
        return snap.data();
      }
      const defaultSettings = await mockFirestore.getTenantSettings();
      const { setDoc } = await import('firebase/firestore');
      await setDoc(doc(db, 'tenant_settings', 'main'), defaultSettings);
      return defaultSettings;
    } catch (e) {
      console.error('Erro ao ler tenant_settings do Firestore:', e);
      return {};
    }
  };

export const saveTenantSettings = async (settings) => {
    if (USE_MOCK) return mockFirestore.saveTenantSettings(settings);
    const { getFirestore, doc, setDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    await setDoc(doc(db, 'tenant_settings', 'main'), settings, { merge: true });
    return settings;
  };

export const getAuditLogs = async () => {
    if (USE_MOCK) return mockFirestore.getAuditLogs();
    const { getFirestore, collection, getDocs } = await import('firebase/firestore');
    const db = getFirestore(app);
    const snap = await getDocs(collection(db, 'audit_logs'));
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  };

export const createAuditLog = async (logData) => {
    if (USE_MOCK) return mockFirestore.createAuditLog(logData);
    const { getFirestore, collection, addDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    const docRef = await addDoc(collection(db, 'audit_logs'), {
      ...logData,
      date: new Date().toISOString()
    });
    return { id: docRef.id, ...logData };
  };

export const exportBackup = async () => {
    if (USE_MOCK) return mockFirestore.exportBackup();
    const { getFirestore, collection, getDocs } = await import('firebase/firestore');
    const db = getFirestore(app);
    const collectionsToBackup = [
      'users', 'patients', 'sectors', 'indicators', 'indicator_data',
      'inventory_items', 'stock_transactions', 'suppliers', 'stock_sectors',
      'purchase_invoices', 'employees', 'prescriptions', 'sessions_logs',
      'clinical_notes', 'shifts', 'rooms', 'access_types', 'dialysis_frequencies',
      'checkins', 'audit_logs', 'accounts_payable', 'accounts_receivable',
      'xml_imports', 'transport_vouchers', 'purchases', 'appointments',
      'debts', 'bank_statements', 'stock_loans', 'product_categories', 'material_requisitions'
    ];
    const backupData = { exportedAt: new Date().toISOString() };
    for (const colName of collectionsToBackup) {
      try {
        const snap = await getDocs(collection(db, colName));
        backupData[colName] = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } catch (err) {
        console.error(`Erro exportando coleção ${colName}:`, err);
        backupData[colName] = [];
      }
    }
    return JSON.stringify(backupData, null, 2);
  };

export const importBackup = async (backupJson) => {
    if (USE_MOCK) return mockFirestore.importBackup(backupJson);
    const { getFirestore, doc, setDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    const data = typeof backupJson === 'string' ? JSON.parse(backupJson) : backupJson;
    for (const [colName, records] of Object.entries(data)) {
      if (colName === 'exportedAt' || !Array.isArray(records)) continue;
      for (const record of records) {
        const docId = record.id || `${Math.random().toString(36).substr(2, 9)}`;
        const { id, ...cleanData } = record;
        await setDoc(doc(db, colName, docId), cleanData, { merge: true });
      }
    }
    return { success: true };
  };

export const getUploadsHistory = async () => {
    if (USE_MOCK) {
      return mockFirestore.getUploadsHistory();
    }
    const { getFirestore, collection, getDocs, query, orderBy } = await import('firebase/firestore');
    const db = getFirestore(app);
    const snap = await getDocs(query(collection(db, 'uploads_history'), orderBy('uploadedAt', 'desc')));
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  };

export const getSectors = async () => {
    if (USE_MOCK) {
      return mockFirestore.getSectors();
    }
    const { getFirestore, collection, getDocs } = await import('firebase/firestore');
    const db = getFirestore(app);
    const snap = await getDocs(collection(db, 'sectors'));
    
    // Seed default sectors if Firestore is empty
    if (snap.empty) {
      const { writeBatch, doc } = await import('firebase/firestore');
      const batch = writeBatch(db);
      const defaults = [
        { id: 'enfermagem', name: 'Enfermagem', description: 'Métricas assistenciais da equipe de enfermagem' },
        { id: 'medica', name: 'Equipe Médica', description: 'Indicadores clínicos e mortalidade' },
        { id: 'qualidade', name: 'Qualidade', description: 'Satisfação do paciente e auditorias' },
        { id: 'faturamento', name: 'Faturamento', description: 'Glosas, custos e faturamento de diálise' },
        { id: 'psicologia', name: 'Psicologia', description: 'Métricas de cobertura de atendimento psicológico, risco emocional e encaminhamentos à rede.' },
        { id: 'nutricao', name: 'Nutrição', description: 'Métricas de cobertura de atendimento nutricional, adequação metabólica e controle de peso.' }
      ];
      defaults.forEach(sec => {
        batch.set(doc(db, 'sectors', sec.id), sec);
      });
      await batch.commit();
      return defaults;
    }
    
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  };

export const deleteStockTransfer = async (id) => {
    if (USE_MOCK) return mockFirestore.deleteStockTransfer ? mockFirestore.deleteStockTransfer(id) : { success: true };
    const { getFirestore, doc, deleteDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    await deleteDoc(doc(db, 'stock_transfers', id));
    return { success: true };
  };

