const PDFDocument = require('pdfkit');
const { formatarDataBR, dataISODoMomento, hojeISO } = require('../utils/datas');

const COR_DESTAQUE = '#2dd4bf';
const COR_CABECALHO = '#0f766e';
const COR_TEXTO = '#0a0a0a';
const COR_CINZA = '#525252';

const ROTULO_MOTIVO = {
  LIMITE_20_USOS: 'Limite (20 usos)',
  DESPREZADO_MANUAL: 'Desprezo manual',
};

/**
 * Weekly/monthly PDF listing every dialyzer swap in the period.
 * Resolves to { nomeArquivo, buffer }; the caller decides where to store it.
 */
function gerarRelatorioTrocas({ trocas, tipo, periodoInicio, periodoFim }) {
  return new Promise((resolve, reject) => {
    const nomeArquivo = `relatorio_${tipo.toLowerCase()}_${periodoFim}.pdf`;
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const pedacos = [];
    doc.on('data', (p) => pedacos.push(p));
    doc.on('end', () => resolve({ nomeArquivo, buffer: Buffer.concat(pedacos) }));
    doc.on('error', reject);

    doc.fillColor(COR_DESTAQUE).fontSize(22).font('Helvetica-Bold').text('ReusoPro');
    doc
      .fillColor(COR_CINZA)
      .fontSize(11)
      .font('Helvetica')
      .text(`Relatório ${tipo === 'SEMANAL' ? 'Semanal' : 'Mensal'} de Trocas de Capilar`)
      .text(`Período: ${formatarDataBR(periodoInicio)} a ${formatarDataBR(periodoFim)}`)
      .text(`Gerado em: ${formatarDataBR(hojeISO())}`);
    doc.moveDown(1.5);

    const totalLimite = trocas.filter((t) => t.motivo === 'LIMITE_20_USOS').length;
    const totalDesprezo = trocas.filter((t) => t.motivo === 'DESPREZADO_MANUAL').length;

    doc.fillColor(COR_TEXTO).fontSize(13).font('Helvetica-Bold').text('Resumo');
    doc
      .fontSize(11)
      .font('Helvetica')
      .text(`Total de trocas no período: ${trocas.length}`)
      .text(`Trocas por limite de 20 usos: ${totalLimite}`)
      .text(`Trocas por desprezo manual (defeito/qualidade): ${totalDesprezo}`);
    doc.moveDown(1);

    if (trocas.length === 0) {
      doc.fontSize(11).fillColor(COR_CINZA).text('Nenhuma troca registrada neste período.');
    } else {
      desenharTabela(doc, trocas);
    }
    doc.end();
  });
}

function desenharTabela(doc, trocas) {
  const larguras = [80, 90, 45, 65, 65, 100, 70];
  const cabecalhos = ['Data', 'Paciente', 'Salão', 'Capilar Ant.', 'Capilar Novo', 'Motivo', 'Usos'];
  const larguraTotal = larguras.reduce((a, b) => a + b, 0);
  const inicioX = doc.page.margins.left;
  let y = doc.y;

  doc.fontSize(13).font('Helvetica-Bold').fillColor(COR_TEXTO).text('Detalhamento', inicioX, y);
  y += 22;

  doc.rect(inicioX, y, larguraTotal, 20).fill(COR_CABECALHO);
  doc.fontSize(9).font('Helvetica-Bold').fillColor('#ffffff');
  let x = inicioX;
  cabecalhos.forEach((h, i) => {
    doc.text(h, x + 4, y + 6, { width: larguras[i] - 8 });
    x += larguras[i];
  });
  y += 20;

  doc.font('Helvetica').fontSize(8.5);

  trocas.forEach((troca, idx) => {
    if (y > 750) {
      doc.addPage();
      y = doc.page.margins.top;
    }

    doc.rect(inicioX, y, larguraTotal, 22).fill(idx % 2 === 0 ? '#f0fdfa' : '#ffffff');
    doc.fillColor('#1c1c1c');

    const valores = [
      formatarDataBR(dataISODoMomento(troca.criado_em)),
      troca.paciente_nome,
      troca.paciente_salao ? String(troca.paciente_salao) : '-',
      troca.capilar_anterior || '-',
      troca.capilar_novo,
      ROTULO_MOTIVO[troca.motivo] || troca.motivo,
      String(troca.reuso_no_momento),
    ];

    x = inicioX;
    valores.forEach((v, i) => {
      doc.text(v, x + 4, y + 6, { width: larguras[i] - 8, height: 18, ellipsis: true });
      x += larguras[i];
    });
    y += 22;

    if (troca.motivo === 'DESPREZADO_MANUAL' && troca.motivo_detalhe) {
      doc.fontSize(7.5).fillColor(COR_CINZA).text(`Obs: ${troca.motivo_detalhe}`, inicioX + 4, y, { width: larguraTotal - 8 });
      y += 14;
      doc.fontSize(8.5).fillColor('#1c1c1c');
    }
  });

  doc.y = y + 10;
}

module.exports = { gerarRelatorioTrocas };
