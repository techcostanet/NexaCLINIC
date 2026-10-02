const { Pool, types } = require('pg');

// Return DATE columns as plain 'YYYY-MM-DD' strings instead of JS Dates at
// server-local midnight, which can shift the day depending on the host TZ.
const OID_DATE = 1082;
types.setTypeParser(OID_DATE, (valor) => valor);

const urlBanco = process.env.DATABASE_URL || '';
const ehBancoLocal = /localhost|127\.0\.0\.1/.test(urlBanco);

// Hosted Postgres (Supabase, Railway...) requires SSL. Without a CA cert the
// connection is still encrypted but the server identity is not verified;
// set DATABASE_CA_CERT to enable full verification.
const certificadoCA = process.env.DATABASE_CA_CERT
  ? process.env.DATABASE_CA_CERT.replace(/\\n/g, '\n')
  : null;

const configSsl = ehBancoLocal
  ? false
  : certificadoCA
    ? { rejectUnauthorized: true, ca: certificadoCA }
    : { rejectUnauthorized: false };

const pool = new Pool({ connectionString: urlBanco, ssl: configSsl });

pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL pool error:', err);
});

/**
 * Runs `fn(client)` inside a transaction. Commits on success, rolls back on
 * any thrown error (which is re-thrown to the caller).
 */
async function comTransacao(fn) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const resultado = await fn(client);
    await client.query('COMMIT');
    return resultado;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

module.exports = pool;
module.exports.comTransacao = comTransacao;
