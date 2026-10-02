// Vercel entry point: vercel.json rewrites every /api/* request (except
// /api/cron/*) here, and Express routes on the full path.
module.exports = require('../src/app');
