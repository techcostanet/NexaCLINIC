/**
 * payslipPdfParser.js
 * Extrator especializado em Holerites / Recibos de Pagamento (PDF) e pacotes compactados (.ZIP).
 * Extrai dados cadastrais, bases, totais e rubricas detalhadas (proventos e descontos)
 * para integração com o Youk Manager e o módulo RH do Nexa CLINIC.
 */

import * as pdfjsLib from 'pdfjs-dist';
import JSZip from 'jszip';

// Configuração do Worker do PDF.js
try {
  if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
  }
} catch (e) {
  console.warn('Configuração de worker do PDF.js:', e);
}

// Utilitários de parsing de valores monetários e números em PT-BR
export function parseCurrencyBR(valStr) {
  if (!valStr) return 0;
  if (typeof valStr === 'number') return valStr;
  const clean = String(valStr)
    .replace(/[^\d,-]/g, '')
    .replace(',', '.');
  const num = parseFloat(clean);
  return isNaN(num) ? 0 : num;
}

export function formatCurrencyBR(num) {
  if (num === null || num === undefined) return '0,00';
  return Number(num).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Normalizador de texto para comparação de nomes (remove acentos e espaços extras)
export function normalizeName(str) {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extrai texto posicional com coordenadas de um PDF
 */
export async function extractPdfTextItems(arrayBuffer) {
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  const allItems = [];

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();
    const items = (textContent.items || [])
      .map(it => ({
        str: (it.str || '').trim(),
        x: Math.round(it.transform[4]),
        y: Math.round(it.transform[5]),
        w: Math.round(it.width || 0),
        h: Math.round(it.height || 0),
        page: pageNum
      }))
      .filter(it => it.str.length > 0);

    allItems.push(...items);
  }

  return allItems;
}

/**
 * Agrupa itens do PDF em linhas baseadas na coordenada Y (tolerância de +- 3px)
 */
export function groupItemsIntoLines(items) {
  // Ordena prioritariamente por página, depois por Y decrescente (topo para baixo) e X crescente (esquerda para direita)
  const sorted = [...items].sort((a, b) => {
    if (a.page !== b.page) return a.page - b.page;
    if (Math.abs(b.y - a.y) > 3) return b.y - a.y;
    return a.x - b.x;
  });

  const lines = [];
  let curLine = [];
  let lastY = null;
  let lastPage = null;

  for (const it of sorted) {
    if (lastY === null || (it.page === lastPage && Math.abs(it.y - lastY) <= 3)) {
      curLine.push(it);
      lastY = it.y;
      lastPage = it.page;
    } else {
      curLine.sort((a, b) => a.x - b.x);
      lines.push(curLine);
      curLine = [it];
      lastY = it.y;
      lastPage = it.page;
    }
  }

  if (curLine.length) {
    curLine.sort((a, b) => a.x - b.x);
    lines.push(curLine);
  }

  return lines;
}

/**
 * Analisa e extrai dados de um único PDF de contracheque
 */
export async function parseSinglePayslipPdf(arrayBuffer, fileName = '') {
  const items = await extractPdfTextItems(arrayBuffer);
  const lines = groupItemsIntoLines(items);

  const fullText = lines.map(line => line.map(it => it.str).join(' ')).join('\n');

  // Metadados iniciais
  const payslip = {
    fileName,
    companyName: 'DIALIZE BETIM SOLUCOES MEDICAS LTDA',
    companyCnpj: '58.476.786/0001-06',
    receiptType: 'Demonstrativo de Pagamento',
    month: '',
    year: '',
    periodLabel: '',
    employeeCode: '',
    employeeName: '',
    role: '',
    cbo: '',
    admissionDate: '',
    department: '1',
    branch: '1',
    contractType: 'Mensalista',
    baseSalary: 0,
    grossEarnings: 0,
    totalDiscounts: 0,
    netSalary: 0,
    baseInss: 0,
    baseFgts: 0,
    fgtsValue: 0,
    baseIrrf: 0,
    irrfRate: 0,
    events: [],
    rawLines: lines
  };

  // 1. Tentar extrair do nome do arquivo (ex: 370-09-2026-M-5-SUILAJULIANARODRIGUESNOGUEIRA-Recibo de Pagamento.pdf)
  if (fileName) {
    const fnMatch = fileName.match(/(\d+)-(\d{2})-(\d{4})-[A-Z]+-(\d+)-([A-Za-z0-9_]+)/i);
    if (fnMatch) {
      payslip.month = fnMatch[2];
      payslip.year = fnMatch[3];
      payslip.employeeCode = fnMatch[4];
    }
  }

  // 2. Pre-calcular limites da tabela de verbas
  let headerY = null;
  let footerY = null;
  for (const l of lines) {
    const text = l.map(it => it.str).join(' ');
    if (text.includes('Código') && text.includes('Descrição') && text.includes('Vencimentos')) {
      headerY = l[0].y;
    }
    if (text.includes('Total de Vencimentos') || text.includes('Salário Base') || text.includes('Valor Líquido')) {
      if (footerY === null || l[0].y < footerY) {
        footerY = l[0].y;
      }
    }
  }

  // 3. Extração linha a linha das informações estruturais
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineStr = line.map(it => it.str).join(' ');

    // Razão Social da Empresa (normalmente primeira linha ou linha de topo)
    if (lineStr.includes('DIALIZE') || lineStr.includes('SOLUCOES MEDICAS') || (i === 0 && lineStr.length > 5)) {
      payslip.companyName = lineStr;
    }

    // CNPJ da Empresa
    const cnpjMatch = lineStr.match(/(\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2})/);
    if (cnpjMatch) {
      payslip.companyCnpj = cnpjMatch[1];
    }

    // Competência / Mês e Ano (ex: "Setembro de 2026")
    const monthYearMatch = lineStr.match(/(Janeiro|Fevereiro|Março|Marco|Abril|Maio|Junho|Julho|Agosto|Setembro|Outubro|Novembro|Dezembro)\s+de\s+(\d{4})/i);
    if (monthYearMatch) {
      const monthMap = {
        'janeiro': '01', 'fevereiro': '02', 'março': '03', 'marco': '03', 'abril': '04',
        'maio': '05', 'junho': '06', 'julho': '07', 'agosto': '08', 'setembro': '09',
        'outubro': '10', 'novembro': '11', 'dezembro': '12'
      };
      payslip.month = monthMap[monthYearMatch[1].toLowerCase()] || payslip.month || '01';
      payslip.year = monthYearMatch[2];
      payslip.periodLabel = `${monthYearMatch[1]} de ${monthYearMatch[2]}`;
    }

    // Tipo do Recibo
    if (lineStr.includes('Folha Mensal') || lineStr.includes('Mensalista')) {
      payslip.receiptType = 'Demonstrativo de Pagamento';
      payslip.contractType = 'Mensalista';
    }

    // Identificação do Funcionário (Linha de Código, Nome, CBO, Depto, Filial)
    // No PDF: [Código (x~23)] [Nome (x~51)] [CBO (x~366)] [Depto (x~443)] [Filial (x~492)]
    const hasNomeFuncionarioLabel = lineStr.includes('Nome do Funcionário') || lineStr.includes('Código');
    if (hasNomeFuncionarioLabel && i + 1 < lines.length) {
      const nextLine = lines[i + 1];
      // Verifica se a próxima linha possui código numérico no início e texto
      const firstItem = nextLine[0];
      if (firstItem && /^\d+$/.test(firstItem.str) && firstItem.x < 50) {
        payslip.employeeCode = firstItem.str;
        // Pega os itens de nome (entre x > 40 e x < 350)
        const nameItems = nextLine.filter(it => it.x >= 40 && it.x < 350);
        if (nameItems.length > 0) {
          payslip.employeeName = nameItems.map(it => it.str).join(' ');
        }
        // CBO
        const cboItem = nextLine.find(it => it.x >= 350 && it.x < 420 && /^\d+$/.test(it.str));
        if (cboItem) payslip.cbo = cboItem.str;
      }
    }

    // Cargo e Admissão (normalmente linha logo abaixo do nome)
    if (lineStr.includes('Admissão:') || lineStr.includes('Técnico') || lineStr.includes('Enfermeir') || lineStr.includes('Médic')) {
      const admMatch = lineStr.match(/(\d{2}\/\d{2}\/\d{4})/);
      if (admMatch) {
        payslip.admissionDate = admMatch[1];
      }
      // O cargo fica nos itens da esquerda (x < 350)
      const roleItems = line.filter(it => it.x < 350 && !it.str.includes('Admissão'));
      if (roleItems.length > 0 && !payslip.role) {
        payslip.role = roleItems.map(it => it.str).join(' ');
      }
    }


    // Extração das Rubricas / Verbas estritamente dentro do limite vertical da tabela
    const firstIt = line[0];
    const isWithinTableBounds = headerY && footerY ? (firstIt.y < headerY && firstIt.y > footerY) : true;

    if (isWithinTableBounds && firstIt && /^\d{1,5}$/.test(firstIt.str) && firstIt.x < 35) {
      // Ignora se for a linha do próprio funcionário (que fica acima do cabeçalho da tabela)
      const lineStrFull = line.map(it => it.str).join(' ');
      if (!lineStrFull.includes(payslip.employeeName) && !lineStrFull.includes('Código') && !lineStrFull.includes('Admissão')) {
        const code = firstIt.str;
        const descItems = line.filter(it => it.x >= 35 && it.x < 300);
        const refItem = line.find(it => it.x >= 300 && it.x < 360);
        const earnItem = line.find(it => it.x >= 360 && it.x < 440);
        const discItem = line.find(it => it.x >= 440 && it.x < 530);

        const description = descItems.map(it => it.str).join(' ');
        const reference = refItem ? refItem.str : '0';
        const earnings = earnItem ? parseCurrencyBR(earnItem.str) : 0;
        const discounts = discItem ? parseCurrencyBR(discItem.str) : 0;

        if (description && (earnings > 0 || discounts > 0 || code)) {
          payslip.events.push({
            code,
            description,
            reference,
            earnings,
            discounts
          });
        }
      }
    }

    // Totais de Vencimentos e Descontos
    // Ex: "Total de Vencimentos" e "Total de Descontos"
    if (lineStr.includes('Total de Vencimentos') || lineStr.includes('Total de Descontos')) {
      if (i + 1 < lines.length) {
        const nextLine = lines[i + 1];
        const earnVal = nextLine.find(it => it.x >= 360 && it.x < 440);
        const discVal = nextLine.find(it => it.x >= 440 && it.x < 520);
        if (earnVal) payslip.grossEarnings = parseCurrencyBR(earnVal.str);
        if (discVal) payslip.totalDiscounts = parseCurrencyBR(discVal.str);
      }
    }

    // Valor Líquido
    if (lineStr.includes('Valor Líquido')) {
      const netValItem = line.find(it => it.x >= 420 && it.x < 520 && /[\d.,]+/.test(it.str));
      if (netValItem) {
        payslip.netSalary = parseCurrencyBR(netValItem.str);
      } else if (i + 1 < lines.length) {
        const nextLine = lines[i + 1];
        const nextNetVal = nextLine.find(it => it.x >= 420 && it.x < 520 && /[\d.,]+/.test(it.str));
        if (nextNetVal) payslip.netSalary = parseCurrencyBR(nextNetVal.str);
      }
    }

    // Linha de Bases (Salário Base, Sal. Contr. INSS, Base Cálc. FGTS, F.G.T.S do Mês, Base Cálc. IRRF, Faixa IRRF)
    if (lineStr.includes('Salário Base') || lineStr.includes('Sal. Contr. INSS') || lineStr.includes('Base Cálc. FGTS')) {
      if (i + 1 < lines.length) {
        const nextLine = lines[i + 1];
        // x ~ 26: Salário Base
        const baseSalItem = nextLine.find(it => it.x < 80);
        if (baseSalItem) payslip.baseSalary = parseCurrencyBR(baseSalItem.str);

        // x ~ 116: Sal. Contr. INSS
        const inssItem = nextLine.find(it => it.x >= 80 && it.x < 180);
        if (inssItem) payslip.baseInss = parseCurrencyBR(inssItem.str);

        // x ~ 206: Base FGTS
        const fgtsItem = nextLine.find(it => it.x >= 180 && it.x < 280);
        if (fgtsItem) payslip.baseFgts = parseCurrencyBR(fgtsItem.str);

        // x ~ 301: FGTS do Mês
        const fgtsMonthItem = nextLine.find(it => it.x >= 280 && it.x < 360);
        if (fgtsMonthItem) payslip.fgtsValue = parseCurrencyBR(fgtsMonthItem.str);

        // x ~ 384: Base IRRF
        const irrfItem = nextLine.find(it => it.x >= 360 && it.x < 440);
        if (irrfItem) payslip.baseIrrf = parseCurrencyBR(irrfItem.str);

        // x ~ 467: Faixa IRRF
        const irrfRateItem = nextLine.find(it => it.x >= 440 && it.x < 520);
        if (irrfRateItem) payslip.irrfRate = parseCurrencyBR(irrfRateItem.str);
      }
    }
  }

  // Backup para valor líquido e totais caso não tenham sido encontrados por linha específica
  if (!payslip.grossEarnings && payslip.events.length > 0) {
    payslip.grossEarnings = payslip.events.reduce((acc, ev) => acc + (ev.earnings || 0), 0);
  }
  if (!payslip.totalDiscounts && payslip.events.length > 0) {
    payslip.totalDiscounts = payslip.events.reduce((acc, ev) => acc + (ev.discounts || 0), 0);
  }
  if (!payslip.netSalary) {
    payslip.netSalary = Math.round((payslip.grossEarnings - payslip.totalDiscounts) * 100) / 100;
  }

  return payslip;
}

/**
 * Cruza o holerite lido com a base de colaboradores do Nexa CLINIC
 */
export function matchEmployee(payslip, employeesList = []) {
  if (!employeesList || employeesList.length === 0) {
    return { isMatched: false, employee: null };
  }

  const pCode = payslip.employeeCode ? String(payslip.employeeCode).trim() : '';
  const pNameNorm = normalizeName(payslip.employeeName);

  // 1. Tentar por Matrícula / Registration
  if (pCode) {
    const byCode = employeesList.find(emp => {
      const empReg = emp.registration || emp.code || emp.matricula;
      return empReg && String(empReg).trim() === pCode;
    });
    if (byCode) return { isMatched: true, employee: byCode, matchMethod: 'registration' };
  }

  // 2. Tentar por Nome Completo Normalizado
  if (pNameNorm) {
    const byExactName = employeesList.find(emp => normalizeName(emp.name) === pNameNorm);
    if (byExactName) return { isMatched: true, employee: byExactName, matchMethod: 'name' };

    // 3. Tentar por Primeiro + Último Nome
    const pTokens = pNameNorm.split(' ');
    if (pTokens.length >= 2) {
      const pFirst = pTokens[0];
      const pLast = pTokens[pTokens.length - 1];
      const byFuzzy = employeesList.find(emp => {
        const empNorm = normalizeName(emp.name);
        const eTokens = empNorm.split(' ');
        return eTokens.length >= 2 && eTokens[0] === pFirst && eTokens[eTokens.length - 1] === pLast;
      });
      if (byFuzzy) return { isMatched: true, employee: byFuzzy, matchMethod: 'fuzzy' };
    }
  }

  return { isMatched: false, employee: null, matchMethod: null };
}

/**
 * Processa um arquivo ZIP ou lista de arquivos PDF
 */
export async function parsePayslipsBatch(fileOrFiles, employeesList = [], onProgress = () => {}) {
  const payslips = [];

  // Se for um único arquivo ZIP
  if (fileOrFiles instanceof File && (fileOrFiles.name.endsWith('.zip') || fileOrFiles.type.includes('zip'))) {
    const zip = new JSZip();
    const contents = await zip.loadAsync(fileOrFiles);
    const pdfEntries = [];

    contents.forEach((relativePath, zipEntry) => {
      if (!zipEntry.dir && relativePath.toLowerCase().endsWith('.pdf') && !relativePath.includes('__MACOSX')) {
        pdfEntries.push(zipEntry);
      }
    });

    const total = pdfEntries.length;
    for (let idx = 0; idx < total; idx++) {
      const entry = pdfEntries[idx];
      onProgress({ current: idx + 1, total, fileName: entry.name });
      const arrayBuffer = await entry.async('arraybuffer');
      try {
        const parsed = await parseSinglePayslipPdf(arrayBuffer, entry.name);
        const matchRes = matchEmployee(parsed, employeesList);
        payslips.push({
          ...parsed,
          id: 'ps-' + (idx + 1),
          isMatched: matchRes.isMatched,
          matchedEmployee: matchRes.employee,
          matchMethod: matchRes.matchMethod
        });
      } catch (err) {
        console.error(`Erro ao processar ${entry.name}:`, err);
      }
    }
  } else {
    // Lista de arquivos individuais (PDFs selecionados)
    const files = Array.isArray(fileOrFiles) ? fileOrFiles : [fileOrFiles];
    const total = files.length;
    for (let idx = 0; idx < total; idx++) {
      const file = files[idx];
      onProgress({ current: idx + 1, total, fileName: file.name });
      const arrayBuffer = await file.arrayBuffer();
      try {
        const parsed = await parseSinglePayslipPdf(arrayBuffer, file.name);
        const matchRes = matchEmployee(parsed, employeesList);
        payslips.push({
          ...parsed,
          id: 'ps-' + (idx + 1),
          isMatched: matchRes.isMatched,
          matchedEmployee: matchRes.employee,
          matchMethod: matchRes.matchMethod
        });
      } catch (err) {
        console.error(`Erro ao processar ${file.name}:`, err);
      }
    }
  }

  // Resumo
  const totalCount = payslips.length;
  const matchedCount = payslips.filter(p => p.isMatched && (p.matchedEmployee?.cpf || p.cpf)).length;
  const unmatchedCount = totalCount - matchedCount;
  const totalEarnings = payslips.reduce((acc, p) => acc + (p.grossEarnings || 0), 0);
  const totalDiscounts = payslips.reduce((acc, p) => acc + (p.totalDiscounts || 0), 0);
  const totalNet = payslips.reduce((acc, p) => acc + (p.netSalary || 0), 0);

  return {
    summary: {
      totalCount,
      matchedCount,
      unmatchedCount,
      totalEarnings,
      totalDiscounts,
      totalNet
    },
    items: payslips
  };
}
