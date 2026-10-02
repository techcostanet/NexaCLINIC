// Minimal WhatsApp Cloud API (Meta) client using Node 18+ native fetch.
// Requires WHATSAPP_TOKEN, WHATSAPP_PHONE_NUMBER_ID, WHATSAPP_TO_NUMBER and
// WHATSAPP_TEMPLATE_NAME. Missing config logs and skips (never throws), so a
// notification problem never breaks the job that triggered it.

const API_VERSION = process.env.WHATSAPP_API_VERSION || 'v21.0';
const urlGraph = (caminho) => `https://graph.facebook.com/${API_VERSION}/${caminho}`;

/** Uploads a file to Meta's media endpoint and returns its media id (or null). */
async function subirMidia(buffer, nomeArquivo, mimeType) {
  const form = new FormData();
  form.append('messaging_product', 'whatsapp');
  form.append('file', new Blob([buffer], { type: mimeType }), nomeArquivo);

  const resposta = await fetch(urlGraph(`${process.env.WHATSAPP_PHONE_NUMBER_ID}/media`), {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}` },
    body: form,
  });

  const dados = await resposta.json();
  if (!resposta.ok) {
    console.error(`[WhatsApp] Media upload failed (${resposta.status}):`, JSON.stringify(dados));
    return null;
  }
  return dados.id;
}

/**
 * Sends an approved template with a PDF in the header and a one-line body
 * parameter ({{1}}). Business-initiated messages outside the 24h window must
 * use an approved template.
 */
async function enviarTemplateComDocumento({ textoCorpo, pdfBuffer, nomeArquivo }) {
  const { WHATSAPP_TOKEN, WHATSAPP_PHONE_NUMBER_ID, WHATSAPP_TO_NUMBER, WHATSAPP_TEMPLATE_NAME } = process.env;
  if (!WHATSAPP_TOKEN || !WHATSAPP_PHONE_NUMBER_ID || !WHATSAPP_TO_NUMBER || !WHATSAPP_TEMPLATE_NAME) {
    console.error('[WhatsApp] Not configured. Message skipped.');
    return false;
  }

  const mediaId = await subirMidia(pdfBuffer, nomeArquivo, 'application/pdf');
  if (!mediaId) return false;

  const resposta = await fetch(urlGraph(`${WHATSAPP_PHONE_NUMBER_ID}/messages`), {
    method: 'POST',
    headers: { Authorization: `Bearer ${WHATSAPP_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: WHATSAPP_TO_NUMBER,
      type: 'template',
      template: {
        name: WHATSAPP_TEMPLATE_NAME,
        language: { code: process.env.WHATSAPP_TEMPLATE_LANG || 'pt_BR' },
        components: [
          { type: 'header', parameters: [{ type: 'document', document: { id: mediaId, filename: nomeArquivo } }] },
          { type: 'body', parameters: [{ type: 'text', text: textoCorpo }] },
        ],
      },
    }),
  });

  if (!resposta.ok) {
    console.error(`[WhatsApp] Send failed (${resposta.status}):`, await resposta.text());
    return false;
  }
  return true;
}

module.exports = { enviarTemplateComDocumento };
