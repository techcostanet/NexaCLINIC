const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

admin.initializeApp();
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
