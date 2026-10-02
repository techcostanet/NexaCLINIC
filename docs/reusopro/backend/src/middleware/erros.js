// Centralized error handling. Services throw HttpErro for expected failures
// (validation, not found, conflicts); anything else becomes a generic 500
// so internal details never leak to the client.

class HttpErro extends Error {
  constructor(status, mensagem) {
    super(mensagem);
    this.status = status;
  }
}

/** Wraps an async route handler so rejected promises reach the error middleware. */
const capturar = (handler) => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);

function rotaNaoEncontrada(req, res) {
  res.status(404).json({ erro: 'Rota não encontrada.' });
}

// eslint-disable-next-line no-unused-vars
function tratadorDeErros(err, req, res, next) {
  if (err instanceof HttpErro) {
    return res.status(err.status).json({ erro: err.message });
  }
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ erro: 'JSON inválido.' });
  }
  if (err.code === '22P02') {
    // Postgres invalid_text_representation, e.g. a malformed UUID in the URL.
    return res.status(400).json({ erro: 'Identificador inválido.' });
  }
  console.error('Unhandled error:', err);
  return res.status(500).json({ erro: 'Erro interno.' });
}

module.exports = { HttpErro, capturar, rotaNaoEncontrada, tratadorDeErros };
