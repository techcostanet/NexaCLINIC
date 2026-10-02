// Long-running entry point (local dev or a traditional host such as Railway,
// Render, a VM). Starts the API and the in-process scheduler. On Vercel this
// file is unused: api/index.js serves requests and vercel.json runs the jobs.
const app = require('./app');
const { iniciarAgendador } = require('./jobs/agendador');

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`ReusoPro API listening on port ${PORT}`);
  if (process.env.DISABLE_SCHEDULER !== 'true') iniciarAgendador();
});
