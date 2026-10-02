const bcrypt = require('bcryptjs');
const pool = require('../db/pool');
const { HttpErro } = require('../middleware/erros');
const { gerarToken, invalidarCacheAtivo } = require('../middleware/auth');

const TAMANHO_MINIMO_SENHA = 8;
const BCRYPT_ROUNDS = 10;

/** Validates credentials and returns { token, usuario }. Same error for unknown user and wrong password. */
async function login(username, senha) {
  if (!username || !senha) throw new HttpErro(400, 'Usuário e senha são obrigatórios.');

  const { rows: [usuario] } = await pool.query(
    'SELECT id, nome, username, senha_hash, role, ativo FROM users WHERE username = $1',
    [username.trim().toLowerCase()]
  );

  const senhaCorreta = usuario?.ativo && (await bcrypt.compare(senha, usuario.senha_hash));
  if (!senhaCorreta) throw new HttpErro(401, 'Usuário ou senha inválidos.');

  return {
    token: gerarToken(usuario),
    usuario: { id: usuario.id, nome: usuario.nome, username: usuario.username, role: usuario.role },
  };
}

async function criar({ nome, username, senha, role }) {
  if (!nome || !username || !senha) throw new HttpErro(400, 'Nome, usuário e senha são obrigatórios.');
  if (senha.length < TAMANHO_MINIMO_SENHA) {
    throw new HttpErro(400, `A senha deve ter ao menos ${TAMANHO_MINIMO_SENHA} caracteres.`);
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO users (nome, username, senha_hash, role) VALUES ($1, $2, $3, $4)
       RETURNING id, nome, username, role, criado_em`,
      [nome, username.trim().toLowerCase(), await bcrypt.hash(senha, BCRYPT_ROUNDS), role === 'admin' ? 'admin' : 'operador']
    );
    return rows[0];
  } catch (err) {
    if (err.code === '23505') throw new HttpErro(409, 'Esse nome de usuário já existe.');
    throw err;
  }
}

async function trocarSenha(usuarioId, { senhaAtual, novaSenha }) {
  if (!senhaAtual || !novaSenha) throw new HttpErro(400, 'Informe a senha atual e a nova senha.');
  if (novaSenha.length < TAMANHO_MINIMO_SENHA) {
    throw new HttpErro(400, `A nova senha deve ter ao menos ${TAMANHO_MINIMO_SENHA} caracteres.`);
  }

  const { rows: [usuario] } = await pool.query('SELECT senha_hash FROM users WHERE id = $1', [usuarioId]);
  if (!usuario) throw new HttpErro(404, 'Usuário não encontrado.');

  // 400 (not 401): the frontend treats any 401 as an expired session and logs out.
  if (!(await bcrypt.compare(senhaAtual, usuario.senha_hash))) {
    throw new HttpErro(400, 'Senha atual incorreta.');
  }

  await pool.query('UPDATE users SET senha_hash = $1 WHERE id = $2', [await bcrypt.hash(novaSenha, BCRYPT_ROUNDS), usuarioId]);
}

async function listar() {
  const { rows } = await pool.query('SELECT id, nome, username, role, ativo, criado_em FROM users ORDER BY criado_em DESC');
  return rows;
}

/** Toggles a user's access. Takes effect immediately on new requests (cache invalidated). */
async function alternarAtivo(id) {
  const { rows: [usuario] } = await pool.query(
    'UPDATE users SET ativo = NOT ativo WHERE id = $1 RETURNING id, nome, ativo',
    [id]
  );
  if (!usuario) throw new HttpErro(404, 'Usuário não encontrado.');
  invalidarCacheAtivo(id);
  return usuario;
}

module.exports = { login, criar, trocarSenha, listar, alternarAtivo };
