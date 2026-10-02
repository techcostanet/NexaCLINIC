// Express app (routes + middleware) without listen() or schedulers, so it
// can be mounted by src/server.js (long-running) or api/index.js (Vercel).
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const { HttpErro, rotaNaoEncontrada, tratadorDeErros } = require('./middleware/erros');
const alertasRoutes = require('./routes/alertasRoutes');

const app = express();

// Real client IP behind a reverse proxy (needed by the login rate limiter).
app.set('trust proxy', 1);
app.use(helmet());

// Browser access is restricted to FRONTEND_URL (comma-separated list).
// Requests without Origin (server-to-server, curl) are not a CORS concern.
const origensPermitidas = (process.env.FRONTEND_URL || 'http://localhost:5173')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || origensPermitidas.includes(origin)) return callback(null, true);
      callback(new HttpErro(403, 'Origem não permitida.'));
    },
  })
);
app.use(express.json());

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/pacientes', require('./routes/pacientesRoutes'));
app.use('/api/sessoes', require('./routes/sessoesRoutes'));
app.use('/api/trocas', require('./routes/trocasRoutes'));
app.use('/api/relatorios', require('./routes/relatoriosRoutes'));
app.use('/api/whatsapp', alertasRoutes.whatsapp);
app.use('/api/email', alertasRoutes.email);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', servico: 'ReusoPro API', horario_servidor: new Date().toISOString() });
});

app.use(rotaNaoEncontrada);
app.use(tratadorDeErros);

module.exports = app;
