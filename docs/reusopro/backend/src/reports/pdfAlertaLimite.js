const PDFDocument = require('pdfkit');
const { MAX_REUSO } = require('../domain/regrasNegocio');
const { formatarDataBR } = require('../utils/datas');
const { agruparPorSalaoETurno, nomeTurno } = require('./mensagensLimite');

/**
 * PDF attached to the daily WhatsApp alert: patients at the reuse limit,
 * grouped by room and shift. Resolves to { nomeArquivo, buffer }.
 */
function gerarPdfAlertaLimite({ pacientes, dataISO }) {
  return new Promise((resolve, reject) => {
    const nomeArquivo = `alerta_limite_${dataISO}.pdf`;
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const pedacos = [];
    doc.on('data', (p) => pedacos.push(p));
    doc.on('end', () => resolve({ nomeArquivo, buffer: Buffer.concat(pedacos) }));
    doc.on('error', reject);

    doc.fillColor('#dc2626').fontSize(18).font('Helvetica-Bold').text(`Alerta de Reuso — ${MAX_REUSO} usos`);
    doc.fillColor('#525252').fontSize(11).font('Helvetica').text(`Data: ${formatarDataBR(dataISO)}`);
    doc.moveDown(1);

    if (pacientes.length === 0) {
      doc.fontSize(12).fillColor('#0a0a0a').text(`Nenhum paciente no limite de ${MAX_REUSO} usos hoje.`);
      doc.end();
      return;
    }

    for (const [salao, porTurno] of agruparPorSalaoETurno(pacientes)) {
      doc.fontSize(14).font('Helvetica-Bold').fillColor('#0f766e').text(`Salão ${salao || '—'}`);
      doc.moveDown(0.3);

      for (const [turno, lista] of porTurno) {
        doc.fontSize(11).font('Helvetica-Bold').fillColor('#0a0a0a').text(nomeTurno(turno));
        doc.font('Helvetica').fontSize(10.5).fillColor('#1c1c1c');
        for (const p of lista) {
          doc.text(`•  ${p.nome}   |   DN: ${p.dn_formatada || '-'}   |   ${p.capilar} atingiu ${MAX_REUSO} usos. Favor trocar!`);
        }
        doc.moveDown(0.4);
      }
      doc.moveDown(0.3);
    }

    doc.end();
  });
}

module.exports = { gerarPdfAlertaLimite };
