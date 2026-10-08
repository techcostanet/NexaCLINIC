const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');
const { syncTitanEmailsToFirestore } = require('./assistSync');

if (admin.apps.length === 0) {
  admin.initializeApp();
}
const db = admin.firestore();

/**
 * Obtém transportador Nodemailer com base nas configurações em settings/email
 */
async function getTransporter() {
  const settingsSnap = await db.doc('settings/email').get();
  if (!settingsSnap.exists) {
    throw new Error('Configurações de e-mail (settings/email) não encontradas no Firestore.');
  }
  const s = settingsSnap.data();
  if (!s.smtpHost || !s.smtpUser) {
    throw new Error('Parâmetros SMTP incompletos em settings/email.');
  }

  const port = Number(s.smtpPort) || 465;
  return {
    transporter: nodemailer.createTransport({
      host: s.smtpHost,
      port: port,
      secure: port === 465,
      auth: {
        user: s.smtpUser,
        pass: s.smtpPassword
      }
    }),
    settings: s
  };
}

/**
 * Gatilho automático ao adicionar documento na coleção 'mail'
 */
exports.processMailQueue = functions.firestore
  .document('mail/{mailId}')
  .onCreate(async (snap, context) => {
    const data = snap.data();
    if (data.delivery && data.delivery.state === 'SUCCESS') {
      return null;
    }

    try {
      const { transporter, settings } = await getTransporter();
      const recipients = Array.isArray(data.to) ? data.to.join(', ') : data.to;
      const msg = data.message || {};

      const senderAddress = settings.senderEmail || settings.smtpUser;
      const senderName = settings.senderName || 'Nex-Ai CLINIC';

      const mailOptions = {
        from: `"${senderName}" <${senderAddress}>`,
        to: recipients,
        subject: msg.subject || data.subject || 'Notificação Nex-Ai CLINIC',
        text: msg.text || data.text || '',
        html: msg.html || data.html || ''
      };

      if (settings.replyToEmail) {
        mailOptions.replyTo = settings.replyToEmail;
      }
      if (settings.bccAudit) {
        mailOptions.bcc = settings.bccAudit;
      }

      const info = await transporter.sendMail(mailOptions);
      console.log(`E-mail enviado com sucesso para ${recipients}. MessageId: ${info.messageId}`);

      return snap.ref.set({
        delivery: {
          state: 'SUCCESS',
          attempts: 1,
          endTime: admin.firestore.FieldValue.serverTimestamp(),
          info: { messageId: info.messageId, response: info.response }
        }
      }, { merge: true });
    } catch (err) {
      console.error('Erro no processMailQueue:', err);
      return snap.ref.set({
        delivery: {
          state: 'ERROR',
          error: err.message,
          endTime: admin.firestore.FieldValue.serverTimestamp()
        }
      }, { merge: true });
    }
  });

/**
 * Gatilho reativo no Firestore para novos comunicados criados no Mural (.ASSIST)
 * Dispara e-mail de notificação na nuvem para os destinatários cadastrados em settings/email
 */
exports.onAssistPostCreated = functions.firestore
  .document('assist_posts/{postId}')
  .onCreate(async (snap, context) => {
    const post = snap.data();
    if (!post) return null;

    // Ignora e-mails importados para evitar loop de reenvio
    if (post.source === 'email') {
      return null;
    }

    try {
      const settingsSnap = await db.doc('settings/email').get();
      if (!settingsSnap.exists) return null;
      const settings = settingsSnap.data();

      // Verifica se o encaminhamento do mural está habilitado
      if (!settings.muralForwardingEnabled || !settings.muralRecipientEmail) {
        console.log('[onAssistPostCreated] Encaminhamento desativado ou destinatário em branco.');
        return null;
      }

      const recipients = String(settings.muralRecipientEmail)
        .split(/[,;]+/)
        .map(e => e.trim())
        .filter(e => e.length > 0 && e.includes('@'));

      if (recipients.length === 0) {
        return null;
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

Autor: ${post.author || 'Equipe Assistencial'} (${post.authorRole || 'Enfermagem'})
Data/Hora: ${new Date(post.createdAt || Date.now()).toLocaleString('pt-BR')}

MENSAGEM:
${post.message || ''}
${post.attachmentUrl ? `\nANEXO: ${post.attachmentName || 'Arquivo'} (${post.attachmentUrl})` : ''}

----------------------------------------------------------------------
Notificação automática emitida pelo módulo NexaASSIST (.ASSIST).
Para gerenciar o encaminhamento, acesse NexaCONFIG > E-mail.`;

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

            <div style="background: #f8fafc; border-left: 4px solid #ec4899; padding: 16px 20px; border-radius: 0 10px 10px 0; margin-top: 12px; border: 1px solid #f1f5f9;">
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

      // Enfileira disparo na coleção 'mail' e registra log
      for (const recipient of recipients) {
        await db.collection('mail').add({
          to: [recipient],
          message: {
            subject,
            text: textBody,
            html: htmlBody
          },
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });

        await db.collection('email_logs').add({
          to: recipient,
          subject,
          moduleSource: 'Mural Assistencial (.ASSIST)',
          sentAt: new Date().toISOString(),
          status: 'Enviado',
          preview: post.message ? post.message.substring(0, 120) : 'Post do Mural encaminhado'
        });
      }

      console.log(`[onAssistPostCreated] Encaminhado post ${context.params.postId} com sucesso para ${recipients.join(', ')}`);
      return { success: true, count: recipients.length };
    } catch (err) {
      console.error('[onAssistPostCreated] Erro ao encaminhar post do mural por e-mail:', err);
      return null;
    }
  });

/**
 * Função Agendada no Cloud Scheduler (Google Cloud)
 * Executa a cada 5 minutos na nuvem e importa os novos e-mails da caixa integracao@dialize.com.br
 */
exports.syncAssistEmailsScheduled = functions.pubsub
  .schedule('every 5 minutes')
  .timeZone('America/Sao_Paulo')
  .onRun(async (context) => {
    console.log('[syncAssistEmailsScheduled] Iniciando varredura IMAP na nuvem...');
    try {
      const result = await syncTitanEmailsToFirestore(db);
      console.log('[syncAssistEmailsScheduled] Varredura concluída:', result);
      return result;
    } catch (err) {
      console.error('[syncAssistEmailsScheduled] Erro na execução agendada:', err);
      return null;
    }
  });

/**
 * Endpoint Callable para teste direto de conexão SMTP
 */
exports.testSmtpConnection = functions.https.onCall(async (data, context) => {
  const targetEmail = data.targetEmail;
  if (!targetEmail) {
    throw new functions.https.HttpsError('invalid-argument', 'targetEmail é obrigatório');
  }

  try {
    const { transporter, settings } = await getTransporter();
    await transporter.verify();

    const senderAddress = settings.senderEmail || settings.smtpUser;
    const senderName = settings.senderName || 'Nex-Ai CLINIC';

    const info = await transporter.sendMail({
      from: `"${senderName}" <${senderAddress}>`,
      to: targetEmail,
      subject: '[Nex-Ai CLINIC] Teste de Conexão SMTP',
      text: `Validação de conectividade SMTP com ${settings.smtpHost}:${settings.smtpPort}. Enviado com sucesso em ${new Date().toLocaleString('pt-BR')}.`,
      html: `<h3>Nex-Ai CLINIC</h3><p>Validação de conectividade SMTP com <b>${settings.smtpHost}:${settings.smtpPort}</b>.</p><p>Enviado com sucesso em <b>${new Date().toLocaleString('pt-BR')}</b>.</p>`
    });

    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error('Erro ao testar SMTP:', err);
    throw new functions.https.HttpsError('internal', err.message);
  }
});
