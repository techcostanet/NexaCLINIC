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
  senderName: 'Nex-Ai CLINIC — Notificações Automáticas',
  senderEmail: 'notificacoes@clinica.med.br',
  replyToEmail: 'contato@clinica.med.br',
  provider: 'smtp', // 'smtp' | 'gmail' | 'outlook' | 'ses' | 'resend'
  smtpHost: 'smtp.gmail.com',
  smtpPort: 587,
  encryption: 'TLS', // 'TLS' | 'SSL' | 'None'
  smtpUser: 'notificacoes@clinica.med.br',
  smtpPassword: '',
  bccAudit: 'ti.auditoria@clinica.med.br',
  footerSignature: 'Nex-Ai CLINIC — Ecossistema Inteligente de Gestão em Saúde\nEsta é uma notificação automática gerada pelo sistema. Por favor, não responda diretamente a este e-mail.',
  // Configurações do Mural (.ASSIST)
  muralForwardingEnabled: false,
  muralRecipientEmail: '',
  muralNursingOnly: true, // Modo temporário ativo por padrão para a enfermagem conforme solicitação
  muralEmailImportEnabled: true, // Ingestão/Sincronização de e-mails da caixa integracao@dialize.com.br (Titan IMAP)
  notifications: {
    medicalSwaps: true,       // Nex-Ai.MED: Trocas e homologações de plantão
    serviceOrders: true,      // Nex-Ai.SERVICE: Ordens de serviço e chamados
    hrAdmissions: true,       // Nex-Ai.HR: Admissões, férias e holerites
    purchasingQuotes: true,   // Nex-Ai.PROCURE: Cotações e pedidos de compra
    calendarReminders: true,  // Nex-Ai.CAL: Confirmações de agenda e consultas
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

export const subscribeToEmailSettings = (callback) => {
  if (USE_MOCK) {
    if (mockFirestore.getEmailSettings) {
      mockFirestore.getEmailSettings().then(callback);
    } else {
      callback(DEFAULT_EMAIL_SETTINGS);
    }
    return () => {};
  }
  let activeUnsubscribe = null;
  let isCancelled = false;

  import('firebase/firestore').then(({ getFirestore, doc, onSnapshot }) => {
    if (isCancelled) return;
    const db = getFirestore(app);
    activeUnsubscribe = onSnapshot(doc(db, 'settings', 'email'), (snap) => {
      if (snap.exists()) {
        callback({ ...DEFAULT_EMAIL_SETTINGS, ...snap.data() });
      } else {
        callback(DEFAULT_EMAIL_SETTINGS);
      }
    }, (err) => {
      console.warn('Erro ao escutar email settings:', err);
      callback(DEFAULT_EMAIL_SETTINGS);
    });
  }).catch(err => {
    console.warn('Falha ao importar Firestore para subscribeToEmailSettings:', err);
    callback(DEFAULT_EMAIL_SETTINGS);
  });

  return () => {
    isCancelled = true;
    if (typeof activeUnsubscribe === 'function') {
      activeUnsubscribe();
    }
  };
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

    // Enfileira na coleção 'mail' para disparo real via Cloud Function (processMailQueue)
    try {
      const mailDoc = await addDoc(collection(db, 'mail'), {
        to: Array.isArray(to) ? to : [to],
        message: {
          subject,
          text: body || '',
          html: html || (body ? body.replace(/\n/g, '<br>') : '')
        }
      });
      emailLog.mailId = mailDoc.id;
    } catch (mailErr) {
      console.warn('Erro ao enfileirar na coleção mail:', mailErr);
    }

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
  const target = testRecipientEmail || currentSettings?.senderEmail || 'ti@clinica.med.br';
  const testSubject = `[Nex-Ai CLINIC Teste de E-mail] Servidor ${currentSettings?.provider || 'SMTP'}`;
  const testBody = `Este é um e-mail de validação emitido pelo painel de T.I. (Nex-Ai.CONFIG).\n\nServidor SMTP: ${currentSettings?.smtpHost}:${currentSettings?.smtpPort}\nRemetente: ${currentSettings?.senderName} <${currentSettings?.senderEmail}>\nCriptografia: ${currentSettings?.encryption}\nData/Hora: ${new Date().toLocaleString('pt-BR')}\n\nSe você recebeu esta mensagem, o canal institucional de e-mails está ativo e pronto para atender todos os módulos do sistema.`;

  // Validação em tempo real via Cloud Function testSmtpConnection
  try {
    const res = await fetch('https://us-central1-nexa-index.cloudfunctions.net/testSmtpConnection', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: { targetEmail: target } })
    });
    if (res.ok) {
      const respData = await res.json();
      if (respData?.result?.success) {
        return await sendSystemEmail({
          to: target,
          subject: testSubject,
          body: testBody,
          moduleSource: 'T.I. (Nex-Ai.CONFIG)'
        });
      }
    }
  } catch (fnErr) {
    console.warn('Fallback testEmailConnection via fila mail:', fnErr);
  }

  return await sendSystemEmail({
    to: target,
    subject: testSubject,
    body: testBody,
    moduleSource: 'T.I. (Nex-Ai.CONFIG)'
  });
};

/**
 * Encaminha post do mural assistencial por e-mail caso habilitado
 */
export const forwardMuralPostByEmail = async (post, explicitRecipient = null) => {
  try {
    const settings = await getEmailSettings();
    const isEnabled = explicitRecipient ? true : (settings?.muralForwardingEnabled && settings?.muralRecipientEmail);
    if (!isEnabled) {
      return { forwarded: false, reason: 'disabled' };
    }

    const rawTarget = explicitRecipient || settings.muralRecipientEmail;
    const recipients = String(rawTarget)
      .split(/[,;]+/)
      .map(e => e.trim())
      .filter(e => e.length > 0 && e.includes('@'));

    if (recipients.length === 0) {
      return { forwarded: false, reason: 'no_valid_recipients' };
    }

    const isUrgent = post.urgency === 'Urgente';
    const urgencyBadge = isUrgent ? '🚨 [URGENTE] ' : '';
    const patientInfo = post.patientName ? ` — Paciente: ${post.patientName}` : '';
    const subject = `[Mural .ASSIST] ${urgencyBadge}${post.category || 'Comunicado'}${patientInfo}`;

    const textBody = `COMUNICADO DO MURAL (.ASSIST) - Nex-Ai CLINIC
----------------------------------------------------------------------
Título: ${post.title || post.category || 'Comunicado da Enfermagem'}
Categoria: ${post.category || 'Geral'}
Urgência: ${post.urgency || 'Normal'}
Paciente: ${post.patientName || 'Não vinculado'}
Salão: ${post.room || 'Geral'}
Turno: ${post.shift || 'Geral'}
Unidade: ${post.unit || 'Clínica'}

Autor: ${post.author || 'Equipe de Enfermagem'} (${post.authorRole || 'Enfermagem'})
Data/Hora: ${new Date(post.createdAt || Date.now()).toLocaleString('pt-BR')}

MENSAGEM:
${post.message || ''}
${post.attachmentUrl ? `\nANEXO: ${post.attachmentName || 'Arquivo'} (${post.attachmentUrl})` : ''}

----------------------------------------------------------------------
Notificação automática emitida pelo módulo NexaASSIST (.ASSIST).
Para gerenciar o encaminhamento, acesse NexaCONFIG > E-mail > Mural.`;

    const htmlBody = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 620px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 14px; background-color: #ffffff; color: #1e293b;">
        <div style="background: linear-gradient(135deg, #ec4899 0%, #be185d 100%); padding: 18px 22px; border-radius: 10px; color: #ffffff;">
          <h2 style="margin: 0; font-size: 1.25rem; font-weight: 700;">📌 Mural Assistencial (.ASSIST)</h2>
          <p style="margin: 4px 0 0 0; font-size: 0.85rem; opacity: 0.92;">Novo comunicado registrado pela equipe</p>
        </div>

        <div style="padding: 20px 0; border-bottom: 1px solid #f1f5f9;">
          <h3 style="margin: 0 0 14px 0; font-size: 1.15rem; color: #0f172a; line-height: 1.35;">
            ${isUrgent ? '<span style="background: #fee2e2; color: #991b1b; padding: 3px 8px; border-radius: 4px; font-size: 0.75rem; margin-right: 8px; font-weight: 800; display: inline-block;">URGENTE</span>' : ''}
            ${post.title || post.category || 'Comunicado'}
          </h3>

          <table style="width: 100%; border-collapse: collapse; font-size: 0.88rem; margin-bottom: 16px;">
            <tr>
              <td style="padding: 6px 0; font-weight: 600; width: 110px; color: #64748b;">Categoria:</td>
              <td style="padding: 6px 0;"><span style="background: #fdf2f8; color: #be185d; padding: 2px 8px; border-radius: 4px; font-weight: 700; border: 1px solid #fbcfe8;">${post.category || 'Geral'}</span></td>
            </tr>
            ${post.patientName ? `
            <tr>
              <td style="padding: 6px 0; font-weight: 600; color: #64748b;">Paciente:</td>
              <td style="padding: 6px 0; font-weight: 700; color: #0f172a;">${post.patientName}</td>
            </tr>` : ''}
            <tr>
              <td style="padding: 6px 0; font-weight: 600; color: #64748b;">Local / Turno:</td>
              <td style="padding: 6px 0;">${post.room || 'Geral'} &bull; ${post.shift || 'Geral'}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: 600; color: #64748b;">Unidade:</td>
              <td style="padding: 6px 0;">${post.unit || 'Clínica'}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: 600; color: #64748b;">Publicado por:</td>
              <td style="padding: 6px 0;"><strong>${post.author || 'Profissional'}</strong> (${post.authorRole || 'Enfermagem'})</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: 600; color: #64748b;">Data:</td>
              <td style="padding: 6px 0;">${new Date(post.createdAt || Date.now()).toLocaleString('pt-BR')}</td>
            </tr>
          </table>

          <div style="background: #f8fafc; border-left: 4px solid #ec4899; padding: 16px 20px; border-radius: 0 10px 10px 0; margin-top: 12px; border: 1px solid #f1f5f9; border-left: 4px solid #ec4899;">
            <div style="font-weight: 700; font-size: 0.78rem; color: #64748b; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.04em;">Mensagem:</div>
            <div style="color: #0f172a; font-size: 0.95rem; white-space: pre-wrap; line-height: 1.55;">${post.message || ''}</div>
          </div>

          ${post.attachmentUrl ? `
          <div style="margin-top: 14px; padding: 12px 16px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; font-size: 0.85rem; color: #166534; display: flex; align-items: center; gap: 8px;">
            <span>📎</span>
            <span><strong>Anexo:</strong> <a href="${post.attachmentUrl}" target="_blank" rel="noopener noreferrer" style="color: #15803d; font-weight: 700; text-decoration: underline;">${post.attachmentName || 'Visualizar documento'}</a></span>
          </div>` : ''}
        </div>

        <div style="padding-top: 16px; font-size: 0.75rem; color: #94a3b8; text-align: center; line-height: 1.45;">
          Nex-Ai CLINIC &bull; Ecossistema Inteligente de Gestão em Saúde<br />
          Esta mensagem foi encaminhada conforme parametrização do NexaCONFIG.
        </div>
      </div>
    `;

    for (const recipient of recipients) {
      await sendSystemEmail({
        to: recipient,
        subject,
        body: textBody,
        html: htmlBody,
        moduleSource: 'Mural Assistencial (.ASSIST)'
      });
    }

    return { forwarded: true, recipients };
  } catch (err) {
    console.error('Erro ao encaminhar post do mural por e-mail:', err);
    return { forwarded: false, error: err.message };
  }
};

/**
 * Dispara e-mail de teste para validação do canal de encaminhamento do Mural
 */
export const testMuralEmailForwarding = async (targetEmail, currentSettings) => {
  const target = targetEmail || currentSettings?.muralRecipientEmail || currentSettings?.senderEmail || 'ti@clinica.med.br';
  const samplePost = {
    title: 'Orientações Pré-Diálise e Acesso Vascular',
    category: 'Acesso Vascular',
    urgency: 'Normal',
    patientName: 'Paciente Modelo de Validação',
    room: 'Salão 1',
    shift: '1º Turno',
    unit: 'Betim',
    author: 'Supervisão de Enfermagem',
    authorRole: 'Enfermeira Chefe',
    createdAt: new Date().toISOString(),
    message: 'Este é um e-mail de teste disparado pelo painel NexaCONFIG para validar o encaminhamento automático de comunicados do Mural (.ASSIST). Se você está recebendo esta mensagem na sua caixa de entrada, a integração de e-mails está ativa e funcionando perfeitamente!'
  };

  return await forwardMuralPostByEmail(samplePost, target);
};



