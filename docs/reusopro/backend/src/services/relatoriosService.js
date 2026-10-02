const pool = require('../db/pool');
const { HttpErro } = require('../middleware/erros');
const trocasService = require('./trocasService');
const { gerarRelatorioTrocas } = require('../reports/pdfRelatorioTrocas');
const { salvarPdf, baixarPdf } = require('../integrations/storage');
const { ehDataISO } = require('../utils/datas');

const TIPOS = ['SEMANAL', 'MENSAL'];

async function listar() {
  const { rows } = await pool.query('SELECT * FROM relatorios ORDER BY criado_em DESC');
  return rows;
}

/** Returns { nomeArquivo, buffer } of a stored report. */
async function obterArquivo(id) {
  const { rows: [relatorio] } = await pool.query('SELECT * FROM relatorios WHERE id = $1', [id]);
  if (!relatorio) throw new HttpErro(404, 'Relatório não encontrado.');
  return { nomeArquivo: relatorio.arquivo_path, buffer: await baixarPdf(relatorio.arquivo_path) };
}

/**
 * Builds the swap report for [inicio, fim], uploads the PDF and logs it.
 * Used by both the scheduled jobs and the manual "generate now" action.
 */
async function gerarESalvar(tipo, inicio, fim) {
  if (!TIPOS.includes(tipo)) throw new HttpErro(400, 'Informe tipo (SEMANAL/MENSAL), inicio e fim.');
  // Dates end up in the file name, so only a strict format is accepted.
  if (!ehDataISO(inicio) || !ehDataISO(fim)) {
    throw new HttpErro(400, 'inicio e fim devem estar no formato AAAA-MM-DD.');
  }

  const trocas = (await trocasService.listar({ inicio, fim })).reverse(); // oldest first
  const { nomeArquivo, buffer } = await gerarRelatorioTrocas({ trocas, tipo, periodoInicio: inicio, periodoFim: fim });

  await salvarPdf(nomeArquivo, buffer);
  await pool.query(
    `INSERT INTO relatorios (tipo, periodo_inicio, periodo_fim, arquivo_path, total_trocas) VALUES ($1, $2, $3, $4, $5)`,
    [tipo, inicio, fim, nomeArquivo, trocas.length]
  );
  return nomeArquivo;
}

module.exports = { listar, obterArquivo, gerarESalvar };
