const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const pool = require('../db/pool');

// Never fall back to a hardcoded secret: anyone reading the code could forge
// admin tokens. Without JWT_SECRET, a random per-instance secret is used
// (tokens stop validating across restarts/instances, which is the safe failure).
if (!process.env.JWT_SECRET) {
  console.error('SECURITY WARNING: JWT_SECRET is not set. Using a random per-instance secret.');
}
const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(32).toString('hex');
const JWT_EXPIRA_EM = '12h';

// Short per-instance cache of the user's "ativo" flag so deactivation takes
// effect within TTL without one extra query per request.
const TTL_CACHE_MS = 60_000;
const cacheAtivo = new Map(); // userId -> { ativo, expiraEm }

async function usuarioEstaAtivo(userId) {
  const agora = Date.now();
  const emCache = cacheAtivo.get(userId);
  if (emCache && emCache.expiraEm > agora) return emCache.ativo;

  const { rows } = await pool.query('SELECT ativo FROM users WHERE id = $1', [userId]);
  const ativo = !!rows[0]?.ativo;
  cacheAtivo.set(userId, { ativo, expiraEm: agora + TTL_CACHE_MS });
  return ativo;
}

function invalidarCacheAtivo(userId) {
  cacheAtivo.delete(userId);
}

function gerarToken(usuario) {
  return jwt.sign(
    { id: usuario.id, username: usuario.username, role: usuario.role, nome: usuario.nome },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRA_EM }
  );
}

/** Requires a valid Bearer token from an active user; sets req.usuario. */
async function autenticar(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ erro: 'Token não informado. Faça login novamente.' });
  }

  let payload;
  try {
    payload = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
  } catch {
    return res.status(401).json({ erro: 'Sessão expirada ou inválida. Faça login novamente.' });
  }

  try {
    if (!(await usuarioEstaAtivo(payload.id))) {
      return res.status(401).json({ erro: 'Sessão inválida. Faça login novamente.' });
    }
  } catch (err) {
    return next(err);
  }

  req.usuario = payload; // { id, username, role, nome }
  next();
}

function somenteAdmin(req, res, next) {
  if (req.usuario?.role !== 'admin') {
    return res.status(403).json({ erro: 'Apenas administradores podem realizar essa ação.' });
  }
  next();
}

module.exports = { autenticar, somenteAdmin, gerarToken, invalidarCacheAtivo };
