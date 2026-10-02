const relatoriosService = require('../services/relatoriosService');

// GET /api/relatorios
async function listar(req, res) {
  res.json(await relatoriosService.listar());
}

// GET /api/relatorios/:id/download
async function baixar(req, res) {
  const { nomeArquivo, buffer } = await relatoriosService.obterArquivo(req.params.id);
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${nomeArquivo}"`);
  res.send(buffer);
}

// POST /api/relatorios/gerar (admin)  body: { tipo: 'SEMANAL'|'MENSAL', inicio, fim }
async function gerarManual(req, res) {
  const { tipo, inicio, fim } = req.body;
  const arquivo = await relatoriosService.gerarESalvar(tipo, inicio, fim);
  res.json({ mensagem: 'Relatório gerado com sucesso.', arquivo });
}

module.exports = { listar, baixar, gerarManual };
