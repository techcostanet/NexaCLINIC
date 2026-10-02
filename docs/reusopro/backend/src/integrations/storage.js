// PDF storage on Supabase Storage (local disk does not persist on serverless
// hosts). Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY. To use another
// provider (S3, GCS, disk), reimplement these two functions with the same API.

const { createClient } = require('@supabase/supabase-js');

const BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'relatorios';

let cliente = null;
function obterCliente() {
  if (!cliente) {
    const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be configured.');
    }
    cliente = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  }
  return cliente;
}

/** Stores a PDF and returns its path inside the bucket. */
async function salvarPdf(nomeArquivo, buffer) {
  const { error } = await obterCliente()
    .storage.from(BUCKET)
    .upload(nomeArquivo, buffer, { contentType: 'application/pdf', upsert: true });
  if (error) throw error;
  return nomeArquivo;
}

async function baixarPdf(nomeArquivo) {
  const { data, error } = await obterCliente().storage.from(BUCKET).download(nomeArquivo);
  if (error) throw error;
  return Buffer.from(await data.arrayBuffer());
}

module.exports = { salvarPdf, baixarPdf };
