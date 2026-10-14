/**
 * payslipPdfGenerator.js
 * Gerador de documentos PDF para a rotina de Folha de Pagamento do Nexa CLINIC.
 * Oferece duas modalidades oficiais:
 * 1. PDF Unificado de Contracheques / Recibos (1 página por colaborador, formato Recibo de Pagamento com CPF enriquecido para upload no Youk Manager)
 * 2. PDF de Relatório Tabular Consolidado (formato paisagem executivo com resumo de proventos, descontos e líquidos)
 */

import jsPDFModule from 'jspdf';
import autoTablePlugin from 'jspdf-autotable';
import { formatCurrencyBR, formatDateBR } from './youkExcelGenerator.js';

const jsPDF = jsPDFModule.jsPDF || jsPDFModule.default || jsPDFModule;
const autoTable = autoTablePlugin.default || autoTablePlugin;

/**
 * Mapeia o número do mês para o nome por extenso
 */
function getMonthNameBR(monthVal) {
  const m = parseInt(monthVal, 10);
  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  return months[m - 1] || 'Mês ' + monthVal;
}

/**
 * 1. Exporta PDF Unificado de Contracheques / Recibos (1 página A4 por colaborador)
 * Ideal para distribuição individual ou importação no Youk Manager.
 */
export function exportUnifiedPayslipsPdf(payslips, customFileName = '', clinicInfo = {}) {
  if (!payslips || payslips.length === 0) {
    throw new Error('Nenhum holerite disponível para gerar o PDF.');
  }

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const marginX = 12;
  const contentWidth = pageWidth - (marginX * 2); // 186mm

  payslips.forEach((ps, idx) => {
    if (idx > 0) {
      doc.addPage();
    }

    const emp = ps.matchedEmployee || {};
    const mes = String(ps.month || '09').padStart(2, '0');
    const ano = String(ps.year || new Date().getFullYear());
    const mesNome = getMonthNameBR(mes);

    const razaoSocial = clinicInfo.name || ps.companyName || ps.companySocialReason || emp.companyName || 'DIALIZE BETIM SOLUCOES MEDICAS LTDA';
    const cnpj = clinicInfo.cnpj || ps.companyCnpj || '58.476.786/0001-06';
    const filial = '1';
    const cbo = ps.cbo || emp.cbo || '322205';
    const matricula = String(emp.registration || ps.employeeCode || emp.code || '000001').padStart(6, '0');
    const nome = emp.name || ps.employeeName || 'Colaborador';
    const cpf = emp.cpf || ps.cpf || 'Não informado';
    const cargo = ps.role || emp.role || 'Cargo não informado';
    const admissao = formatDateBR(ps.admissionDate || emp.admissionDate || '');
    const departamento = ps.department || emp.sectorId || '1';

    let currentY = 12;

    // --- MOLDURA GERAL DA FOLHA ---
    doc.setDrawColor(203, 213, 225); // slate-300
    doc.setLineWidth(0.3);
    doc.rect(marginX, currentY, contentWidth, pageHeight - 24, 'S');

    // --- CABEÇALHO DA EMPRESA ---
    doc.setFillColor(248, 250, 252); // slate-50
    doc.rect(marginX, currentY, contentWidth, 18, 'F');
    doc.line(marginX, currentY + 18, marginX + contentWidth, currentY + 18);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text(razaoSocial, marginX + 3, currentY + 5.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105); // slate-600
    doc.text(`CNPJ: ${cnpj}`, marginX + 3, currentY + 10.5);
    doc.text(`Filial: ${filial}   •   Depto: ${departamento}   •   C.Custo: Mensalista`, marginX + 3, currentY + 15);

    // Lado direito do cabeçalho: Competência e Título
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(5, 150, 105); // emerald-600
    doc.text('RECIBO DE PAGAMENTO', marginX + contentWidth - 3, currentY + 5.5, { align: 'right' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(30, 41, 59);
    doc.text(`Folha Mensal - ${mesNome} / ${ano}`, marginX + contentWidth - 3, currentY + 10.5, { align: 'right' });
    doc.text(`Emissão: ${new Date().toLocaleDateString('pt-BR')}`, marginX + contentWidth - 3, currentY + 15, { align: 'right' });

    currentY += 18;

    // --- BLOCO DADOS DO COLABORADOR ---
    doc.setFillColor(255, 255, 255);
    doc.rect(marginX, currentY, contentWidth, 17, 'F');
    doc.line(marginX, currentY + 17, marginX + contentWidth, currentY + 17);

    // Linha 1: Matrícula, Nome, CBO
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text('CÓDIGO', marginX + 3, currentY + 4.5);
    doc.text('NOME DO FUNCIONÁRIO', marginX + 24, currentY + 4.5);
    doc.text('CBO', marginX + 130, currentY + 4.5);
    doc.text('ADMISSÃO', marginX + 158, currentY + 4.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text(matricula, marginX + 3, currentY + 8.5);
    doc.text(nome.substring(0, 52), marginX + 24, currentY + 8.5);
    doc.text(cbo, marginX + 130, currentY + 8.5);
    doc.text(admissao || '-', marginX + 158, currentY + 8.5);

    // Linha 2: Cargo e CPF destacado
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text('FUNÇÃO / CARGO', marginX + 3, currentY + 12.5);
    doc.text('CPF (VALIDAÇÃO YOUK)', marginX + 115, currentY + 12.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(30, 41, 59);
    doc.text(cargo.substring(0, 55), marginX + 3, currentY + 16);

    // CPF com destaque sutil
    doc.setTextColor(37, 99, 235); // blue-600
    doc.text(cpf, marginX + 115, currentY + 16);

    currentY += 17;

    // --- TABELA DE RUBRICAS / EVENTOS ---
    const events = ps.events && ps.events.length > 0 ? ps.events : [{
      code: '8781',
      description: 'SALARIO BASE',
      reference: '30,00',
      earnings: ps.grossEarnings || ps.baseSalary || 0,
      discounts: 0
    }];

    const tableRows = events.map(ev => [
      String(ev.code || '').trim(),
      String(ev.description || '').trim(),
      String(ev.reference || '').trim(),
      ev.earnings && ev.earnings > 0 ? formatCurrencyBR(ev.earnings) : '',
      ev.discounts && ev.discounts > 0 ? formatCurrencyBR(ev.discounts) : ''
    ]);

    autoTable(doc, {
      startY: currentY,
      margin: { left: marginX, right: marginX },
      tableWidth: contentWidth,
      head: [['CÓD.', 'DESCRIÇÃO DA VERBA / EVENTO', 'REF.', 'VENCIMENTOS', 'DESCONTOS']],
      body: tableRows,
      theme: 'plain',
      styles: {
        font: 'helvetica',
        fontSize: 7.5,
        cellPadding: 1.5,
        lineColor: [226, 232, 240],
        lineWidth: 0.15,
        textColor: [30, 41, 59]
      },
      headStyles: {
        fillColor: [241, 245, 249],
        textColor: [15, 23, 42],
        fontStyle: 'bold',
        fontSize: 7.5,
        halign: 'left',
        lineWidth: 0.2,
        lineColor: [203, 213, 225]
      },
      columnStyles: {
        0: { cellWidth: 16, halign: 'center' },
        1: { cellWidth: 'auto', halign: 'left' },
        2: { cellWidth: 22, halign: 'center' },
        3: { cellWidth: 32, halign: 'right' },
        4: { cellWidth: 32, halign: 'right' }
      }
    });

    currentY = doc.lastAutoTable.finalY;

    // Garante posição fixa dos blocos finais na parte inferior da página
    const bottomBlockStartY = 208; // Deixa 65mm para totais, bases e assinatura

    // Linha divisória se a tabela terminou antes
    if (currentY < bottomBlockStartY) {
      doc.setDrawColor(226, 232, 240);
      doc.line(marginX, bottomBlockStartY, marginX + contentWidth, bottomBlockStartY);
      currentY = bottomBlockStartY;
    }

    // --- BLOCO TOTAIS (VENCIMENTOS, DESCONTOS, LÍQUIDO) ---
    doc.setFillColor(248, 250, 252);
    doc.rect(marginX, currentY, contentWidth, 14, 'F');
    doc.line(marginX, currentY + 14, marginX + contentWidth, currentY + 14);

    // Vencimentos
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text('TOTAL DE VENCIMENTOS', marginX + 3, currentY + 4.5);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(5, 150, 105); // emerald-600
    doc.text(`R$ ${formatCurrencyBR(ps.grossEarnings)}`, marginX + 3, currentY + 10);

    // Descontos
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text('TOTAL DE DESCONTOS', marginX + 65, currentY + 4.5);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(220, 38, 38); // red-600
    doc.text(`R$ ${formatCurrencyBR(ps.totalDiscounts)}`, marginX + 65, currentY + 10);

    // Valor Líquido (Caixa de Destaque)
    doc.setFillColor(239, 246, 255); // blue-50
    doc.rect(marginX + 120, currentY + 1, 64, 12, 'F');
    doc.setDrawColor(191, 219, 254); // blue-200
    doc.rect(marginX + 120, currentY + 1, 64, 12, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(30, 64, 175); // blue-800
    doc.text('VALOR LÍQUIDO A RECEBER =>', marginX + 123, currentY + 5.5);

    doc.setFontSize(10.5);
    doc.setTextColor(29, 78, 216); // blue-700
    doc.text(`R$ ${formatCurrencyBR(ps.netSalary)}`, marginX + 181, currentY + 10.5, { align: 'right' });

    currentY += 14;

    // --- BLOCO BASES LEGAIS ---
    doc.setFillColor(255, 255, 255);
    doc.rect(marginX, currentY, contentWidth, 14, 'F');
    doc.line(marginX, currentY + 14, marginX + contentWidth, currentY + 14);

    const baseColW = contentWidth / 6;
    const bases = [
      { label: 'SALÁRIO BASE', val: formatCurrencyBR(ps.baseSalary) },
      { label: 'BASE CÁLC. INSS', val: formatCurrencyBR(ps.baseInss) },
      { label: 'BASE CÁLC. FGTS', val: formatCurrencyBR(ps.baseFgts) },
      { label: 'F.G.T.S DO MÊS', val: formatCurrencyBR(ps.fgtsValue) },
      { label: 'BASE CÁLC. IRRF', val: formatCurrencyBR(ps.baseIrrf) },
      { label: 'FAIXA IRRF', val: ps.irrfRate ? `${ps.irrfRate}%` : '15,00%' }
    ];

    bases.forEach((b, bIdx) => {
      const bx = marginX + (bIdx * baseColW);
      if (bIdx > 0) {
        doc.setDrawColor(226, 232, 240);
        doc.line(bx, currentY, bx, currentY + 14);
      }
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.8);
      doc.setTextColor(100, 116, 139);
      doc.text(b.label, bx + (baseColW / 2), currentY + 4.5, { align: 'center' });

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(30, 41, 59);
      doc.text(b.val, bx + (baseColW / 2), currentY + 10, { align: 'center' });
    });

    currentY += 14;

    // --- DECLARAÇÃO DE RECEBIMENTO E ASSINATURA ---
    doc.setFillColor(250, 250, 250);
    doc.rect(marginX, currentY, contentWidth, pageHeight - 12 - currentY, 'F');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(71, 85, 105);
    doc.text(
      'DECLARO TER RECEBIDO A IMPORTÂNCIA LÍQUIDA DISCRIMINADA NESTE RECIBO, CORRESPONDENTE AOS MEUS SERVIÇOS PRESTADOS.',
      marginX + 3,
      currentY + 5
    );

    // Campo Data
    doc.text('DATA:', marginX + 3, currentY + 15);
    doc.text('____ / ____ / ________', marginX + 16, currentY + 15);

    // Linha de Assinatura
    const signX = marginX + 80;
    const signW = 100;
    doc.setDrawColor(148, 163, 184);
    doc.setLineWidth(0.3);
    doc.line(signX, currentY + 14, signX + signW, currentY + 14);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(15, 23, 42);
    doc.text(nome, signX + (signW / 2), currentY + 18, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.8);
    doc.setTextColor(100, 116, 139);
    doc.text(`CPF: ${cpf}   •   Assinatura do Funcionário / Youk Manager`, signX + (signW / 2), currentY + 22, { align: 'center' });

    // Rodapé de segurança do sistema
    doc.setFontSize(6.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Nex-Ai CLINIC (.RH) — Documento oficial pronto para assinatura digital | Página ${idx + 1} de ${payslips.length}`,
      marginX + (contentWidth / 2),
      pageHeight - 14,
      { align: 'center' }
    );
  });

  const sample = payslips[0] || {};
  const mes = sample.month || '09';
  const ano = sample.year || new Date().getFullYear();
  const fileName = customFileName || `Recibos_Folha_${mes}_${ano}.pdf`;

  if (typeof doc.save === 'function') {
    try {
      doc.save(fileName);
    } catch (e) {
      if (typeof window !== 'undefined') console.error('Erro ao salvar PDF:', e);
    }
  }
  return fileName;
}

/**
 * 2. Exporta PDF de Relatório Tabular Consolidado (A4 Paisagem)
 * Ideal para conferência executiva, auditoria e controle do setor financeiro/contabilidade.
 */
export function exportTabularPayrollPdf(payslips, summary = {}, customFileName = '', clinicInfo = {}) {
  if (!payslips || payslips.length === 0) {
    throw new Error('Nenhum holerite disponível para gerar o relatório.');
  }

  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = 297;
  const marginX = 14;
  const contentWidth = pageWidth - (marginX * 2); // 269mm

  const sample = payslips[0] || {};
  const mes = String(sample.month || '09').padStart(2, '0');
  const ano = String(sample.year || new Date().getFullYear());
  const mesNome = getMonthNameBR(mes);

  const razaoSocial = clinicInfo.name || sample.companyName || sample.companySocialReason || 'DIALIZE BETIM SOLUCOES MEDICAS LTDA';
  const cnpj = clinicInfo.cnpj || sample.companyCnpj || '58.476.786/0001-06';

  // Cabeçalho Executivo
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text(razaoSocial, marginX, 15);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`CNPJ: ${cnpj}   •   Módulo Nex-Ai.RH   •   Relatório Consolidado de Folha`, marginX, 21);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(5, 150, 105);
  doc.text(`Competência: ${mesNome} / ${ano}`, pageWidth - marginX, 15, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`, pageWidth - marginX, 21, { align: 'right' });

  // 4 Cards de Resumo Estatístico
  const totCount = summary.totalCount || payslips.length;
  const totEarn = summary.totalEarnings || payslips.reduce((acc, p) => acc + (p.grossEarnings || 0), 0);
  const totDisc = summary.totalDiscounts || payslips.reduce((acc, p) => acc + (p.totalDiscounts || 0), 0);
  const totNet = summary.totalNet || payslips.reduce((acc, p) => acc + (p.netSalary || 0), 0);

  const cardW = (contentWidth - 9) / 4;
  const cardY = 25;
  const cardH = 15;

  const kpis = [
    { label: 'HOLERITES', val: `${totCount}`, color: [15, 23, 42] },
    { label: 'TOTAL PROVENTOS', val: `R$ ${formatCurrencyBR(totEarn)}`, color: [5, 150, 105] },
    { label: 'TOTAL DESCONTOS', val: `R$ ${formatCurrencyBR(totDisc)}`, color: [220, 38, 38] },
    { label: 'LÍQUIDO TOTAL', val: `R$ ${formatCurrencyBR(totNet)}`, color: [37, 99, 235] }
  ];

  kpis.forEach((k, kIdx) => {
    const kx = marginX + (kIdx * (cardW + 3));
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.rect(kx, cardY, cardW, cardH, 'FD');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(k.label, kx + 4, cardY + 5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(k.color[0], k.color[1], k.color[2]);
    doc.text(k.val, kx + 4, cardY + 11.5);
  });

  // Tabela de Dados Tabulares
  const tableRows = payslips.map(ps => {
    const emp = ps.matchedEmployee || {};
    const matricula = String(emp.registration || ps.employeeCode || emp.code || '-').padStart(6, '0');
    const nome = emp.name || ps.employeeName || 'Colaborador';
    const cpf = emp.cpf || ps.cpf || '-';
    const cargo = ps.role || emp.role || '-';
    const baseSal = ps.baseSalary ? `R$ ${formatCurrencyBR(ps.baseSalary)}` : '-';
    const proventos = `R$ ${formatCurrencyBR(ps.grossEarnings)}`;
    const descontos = `R$ ${formatCurrencyBR(ps.totalDiscounts)}`;
    const liquido = `R$ ${formatCurrencyBR(ps.netSalary)}`;
    const hasCpf = !!(emp.cpf || ps.cpf);
    const status = (ps.isMatched && hasCpf) ? 'Pronto' : 'Pendente';

    return [
      matricula,
      nome,
      cpf,
      cargo,
      baseSal,
      proventos,
      descontos,
      liquido,
      status
    ];
  });

  // Linha final com totais consolidados
  tableRows.push([
    'TOTAIS',
    `${totCount} colaboradores listados`,
    '',
    '',
    '',
    `R$ ${formatCurrencyBR(totEarn)}`,
    `R$ ${formatCurrencyBR(totDisc)}`,
    `R$ ${formatCurrencyBR(totNet)}`,
    ''
  ]);

  autoTable(doc, {
    startY: cardY + cardH + 5,
    margin: { left: marginX, right: marginX },
    tableWidth: contentWidth,
    head: [['MATRÍCULA', 'COLABORADOR', 'CPF', 'CARGO / FUNÇÃO', 'SALÁRIO BASE', 'PROVENTOS', 'DESCONTOS', 'LÍQUIDO', 'STATUS']],
    body: tableRows,
    theme: 'grid',
    styles: {
      font: 'helvetica',
      fontSize: 7.5,
      cellPadding: 2,
      lineColor: [226, 232, 240],
      lineWidth: 0.15,
      textColor: [30, 41, 59]
    },
    headStyles: {
      fillColor: [15, 23, 42], // slate-900
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 7.5,
      halign: 'left'
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    columnStyles: {
      0: { halign: 'center' },
      1: { halign: 'left' },
      2: { halign: 'center' },
      3: { halign: 'left' },
      4: { halign: 'right' },
      5: { halign: 'right' },
      6: { halign: 'right' },
      7: { halign: 'right', fontStyle: 'bold' },
      8: { halign: 'center' }
    },
    didParseCell: (data) => {
      // Destaca a linha de totais
      if (data.row.index === tableRows.length - 1) {
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fillColor = [241, 245, 249];
        if (data.column.index === 7) {
          data.cell.styles.textColor = [37, 99, 235];
        }
      }
      // Cor de status
      if (data.column.index === 8 && data.section === 'body' && data.row.index < tableRows.length - 1) {
        if (data.cell.raw === 'Pronto') {
          data.cell.styles.textColor = [5, 150, 105];
          data.cell.styles.fontStyle = 'bold';
        } else if (data.cell.raw === 'Pendente') {
          data.cell.styles.textColor = [217, 119, 6];
          data.cell.styles.fontStyle = 'bold';
        }
      }
    }
  });

  // Numeração de páginas
  const pageCount = doc.getNumberOfPages();
  for (let p = 1; p <= pageCount; p++) {
    doc.setPage(p);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Nex-Ai CLINIC (.RH) — Relatório de Folha de Pagamento | Página ${p} de ${pageCount}`,
      pageWidth / 2,
      205,
      { align: 'center' }
    );
  }

  const fileName = customFileName || `Relatorio_Folha_${mes}_${ano}.pdf`;
  if (typeof doc.save === 'function') {
    try {
      doc.save(fileName);
    } catch (e) {
      if (typeof window !== 'undefined') console.error('Erro ao salvar PDF:', e);
    }
  }
  return fileName;
}
