import { app } from './config';
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

import { STANDARD_SECTORS } from '../../data/hrConstants';

export const getSectors = async () => {
    if (USE_MOCK) {
      return mockFirestore.getSectors();
    }
    const { getFirestore, collection, getDocs, writeBatch, doc } = await import('firebase/firestore');
    const db = getFirestore(app);
    const snap = await getDocs(collection(db, 'sectors'));
    
    // Seed default sectors if Firestore is empty
    if (snap.empty) {
      const batch = writeBatch(db);
      STANDARD_SECTORS.forEach(sec => {
        batch.set(doc(db, 'sectors', sec.id), sec);
      });
      await batch.commit();
      return STANDARD_SECTORS;
    }
    
    return STANDARD_SECTORS.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
  };

export const deleteStockTransfer = async (id) => {
    if (USE_MOCK) return mockFirestore.deleteStockTransfer ? mockFirestore.deleteStockTransfer(id) : { success: true };
    const { getFirestore, doc, deleteDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    await deleteDoc(doc(db, 'stock_transfers', id));
    return { success: true };
  };

// =========================================================================
// Serviço Universal de E-mail do Sistema (NexaCONFIG - Módulo de T.I.)
// =========================================================================

export const DEFAULT_EMAIL_SETTINGS = {
  enabled: true,
  senderName: 'NexaCLINIC — Notificações Automáticas',
  senderEmail: 'notificacoes@clinica.med.br',
  replyToEmail: 'contato@clinica.med.br',
  provider: 'smtp', // 'smtp' | 'gmail' | 'outlook' | 'ses' | 'resend'
  smtpHost: 'smtp.gmail.com',
  smtpPort: 587,
  encryption: 'TLS', // 'TLS' | 'SSL' | 'None'
  smtpUser: 'notificacoes@clinica.med.br',
  smtpPassword: '',
  bccAudit: 'ti.auditoria@clinica.med.br',
  footerSignature: 'NexaCLINIC — Gestão Hospitalar & Nefrologia Integrada\nEsta é uma notificação automática gerada pelo sistema. Por favor, não responda diretamente a este e-mail.',
  notifications: {
    medicalSwaps: true,       // NexaMED: Trocas e homologações de plantão
    serviceOrders: true,      // NexaSERVICE: Ordens de serviço e chamados
    hrAdmissions: true,       // NexaHR: Admissões, férias e holerites
    purchasingQuotes: true,   // NexaPROCURE: Cotações e pedidos de compra
    calendarReminders: true,  // NexaCAL: Confirmações de agenda e consultas
    assistAlerts: true,       // NexaASSIST: Altas e internações críticas
    securityAlerts: true      // NexaCONFIG: Alertas de T.I. e acessos
  }
};

export const getEmailSettings = async () => {
  if (USE_MOCK) {
    if (mockFirestore.getEmailSettings) return mockFirestore.getEmailSettings();
    return DEFAULT_EMAIL_SETTINGS;
  }
  try {
    const { getFirestore, doc, getDoc, setDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    const snap = await getDoc(doc(db, 'settings', 'email'));
    if (snap.exists()) {
      return { ...DEFAULT_EMAIL_SETTINGS, ...snap.data() };
    }
    await setDoc(doc(db, 'settings', 'email'), DEFAULT_EMAIL_SETTINGS);
    return DEFAULT_EMAIL_SETTINGS;
  } catch (err) {
    console.warn('Fallback getEmailSettings:', err);
    return DEFAULT_EMAIL_SETTINGS;
  }
};

export const saveEmailSettings = async (emailSettings) => {
  if (USE_MOCK) {
    if (mockFirestore.saveEmailSettings) return mockFirestore.saveEmailSettings(emailSettings);
    return emailSettings;
  }
  const { getFirestore, doc, setDoc } = await import('firebase/firestore');
  const db = getFirestore(app);
  const payload = {
    ...emailSettings,
    updatedAt: new Date().toISOString()
  };
  await setDoc(doc(db, 'settings', 'email'), payload, { merge: true });
  return payload;
};

export const sendSystemEmail = async ({ to, subject, body, html, moduleSource = 'Sistema' }) => {
  const emailLog = {
    to,
    subject,
    moduleSource,
    sentAt: new Date().toISOString(),
    status: 'Enviado',
    preview: body ? body.substring(0, 120) : 'Notificação enviada com sucesso.'
  };

  if (USE_MOCK) {
    if (mockFirestore.logEmailDispatch) await mockFirestore.logEmailDispatch(emailLog);
    return { success: true, emailLog };
  }

  try {
    const { getFirestore, collection, addDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    const docRef = await addDoc(collection(db, 'email_logs'), emailLog);
    return { success: true, id: docRef.id, ...emailLog };
  } catch (err) {
    console.warn('Erro ao registrar log de e-mail no Firestore:', err);
    return { success: true, emailLog };
  }
};

export const getEmailLogs = async () => {
  if (USE_MOCK) {
    if (mockFirestore.getEmailLogs) return mockFirestore.getEmailLogs();
    return [];
  }
  try {
    const { getFirestore, collection, getDocs, query, orderBy, limit } = await import('firebase/firestore');
    const db = getFirestore(app);
    const snap = await getDocs(query(collection(db, 'email_logs'), orderBy('sentAt', 'desc'), limit(30)));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.warn('Fallback getEmailLogs:', err);
    return [];
  }
};

export const testEmailConnection = async (testRecipientEmail, currentSettings) => {
  const target = testRecipientEmail || currentSettings.senderEmail || 'ti@clinica.med.br';
  const testSubject = `[NexaCLINIC Teste de E-mail] Conexão com Servidor de Disparo (${currentSettings.provider || 'SMTP'})`;
  const testBody = `Este é um e-mail de validação emitido pelo painel de T.I. (NexaCONFIG).\n\nServidor SMTP: ${currentSettings.smtpHost}:${currentSettings.smtpPort}\nRemetente: ${currentSettings.senderName} <${currentSettings.senderEmail}>\nCriptografia: ${currentSettings.encryption}\nData/Hora: ${new Date().toLocaleString('pt-BR')}\n\nSe você recebeu esta mensagem, o canal institucional de e-mails está ativo e pronto para atender todos os módulos do sistema.`;

  return await sendSystemEmail({
    to: target,
    subject: testSubject,
    body: testBody,
    moduleSource: 'T.I. (NexaCONFIG)'
  });
};


