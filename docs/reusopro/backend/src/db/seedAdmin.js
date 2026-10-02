/**
 * Creates the first admin user. Run once after `npm run migrate`.
 * Reads ADMIN_NOME / ADMIN_USERNAME / ADMIN_SENHA from the environment;
 * without ADMIN_SENHA a random password is generated and printed once.
 */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const pool = require('./pool');

async function seed() {
  const nome = process.env.ADMIN_NOME || 'Administrador';
  const username = (process.env.ADMIN_USERNAME || 'admin').toLowerCase();
  const senha = process.env.ADMIN_SENHA || crypto.randomBytes(9).toString('base64url');

  try {
    const existente = await pool.query('SELECT id FROM users WHERE username = $1', [username]);
    if (existente.rows[0]) {
      console.log(`User "${username}" already exists. Nothing to do.`);
      process.exit(0);
    }

    const senhaHash = await bcrypt.hash(senha, 10);
    await pool.query(
      `INSERT INTO users (nome, username, senha_hash, role) VALUES ($1, $2, $3, 'admin')`,
      [nome, username, senhaHash]
    );

    console.log(`Admin created.\nLogin: ${username}\nPassword: ${senha}`);
    console.log('Change this password after the first login.');
    process.exit(0);
  } catch (err) {
    console.error('Failed to create admin user:', err);
    process.exit(1);
  }
}

seed();
