// Minimal SMTP client (nodemailer). Requires SMTP_HOST, SMTP_USER, SMTP_PASS
// and EMAIL_TO. Missing config logs and skips (never throws).
// Gmail: SMTP_HOST=smtp.gmail.com, SMTP_PORT=465 and an App Password.

const nodemailer = require('nodemailer');

let transportador = null;

function obterTransportador() {
  if (transportador) return transportador;

  const { SMTP_HOST, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return null;

  const porta = Number(process.env.SMTP_PORT || 465);
  transportador = nodemailer.createTransport({
    host: SMTP_HOST,
    port: porta,
    secure: porta === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
  return transportador;
}

async function enviarEmail({ assunto, html }) {
  const destino = process.env.EMAIL_TO;
  const transporte = obterTransportador();
  if (!destino || !transporte) {
    console.error('[E-mail] SMTP_* / EMAIL_TO not configured. E-mail skipped.');
    return false;
  }

  try {
    await transporte.sendMail({
      from: process.env.EMAIL_FROM || process.env.SMTP_USER,
      to: destino,
      subject: assunto,
      html,
    });
    return true;
  } catch (err) {
    console.error('[E-mail] Send failed:', err.message);
    return false;
  }
}

module.exports = { enviarEmail };
