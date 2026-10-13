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

  try {
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
  } finally {
    try {
      if (pdf && typeof pdf.destroy === 'function') {
        await pdf.destroy();
      }
    } catch (_) {}
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

// Lista de termos que identificam rubricas, seções ou verbas e NUNCA devem ser aceitos como nome de colaborador
const INVALID_NAME_TERMS = [
  'NORMAIS', 'HORAS', 'DIAS', 'SALARIO', 'SALÁRIO', 'VENCIMENTOS', 'DESCONTOS', 
  'LIQUIDO', 'LÍQUIDO', 'DEMONSTRATIVO', 'FOLHA', 'RECIBO', 'PAGAMENTO', 
  'ASSINATURA', 'INSS', 'I.N.S.S', 'FGTS', 'F.G.T.S', 'IRRF', 'INSALUBRIDADE', 
  'ALIMENTACAO', 'ALIMENTAÇÃO', 'TRANSPORTE', 'EMPRESTIMO', 'EMPRÉSTIMO', 
  'VALE', 'PISO', 'EXTRAS', 'REFLEXO', 'DSR', 'TROCO', 'BASE', 'MENSAL', 'MENSALISTA',
  'COMPLEMENTO', 'CARGO', 'FUNCAO', 'FUNÇÃO'
];

export function isValidEmployeeName(name) {
  if (!name || typeof name !== 'string') return false;
  const clean = name.trim().toUpperCase();
  if (clean.length < 3) return false;
  // Deve conter ao menos uma palavra com 3 letras
  if (!/[A-ZÀ-ÿ]{3,}/.test(clean)) return false;
  // Não pode conter termos de eventos ou verbas
  for (const term of INVALID_NAME_TERMS) {
    if (clean.includes(term)) return false;
  }
  return true;
}

// Remove conectivos e preposições comuns em nomes em português (DE, DA, DO, DOS, DAS, E)
export function getNameTokens(normalizedStr) {
  const stopwords = new Set(['DE', 'DA', 'DO', 'DOS', 'DAS', 'E']);
  return (normalizedStr || '')
    .split(' ')
    .filter(t => t.length > 0 && !stopwords.has(t));
}

// Coeficiente de Dice / Bigramas para similaridade textual
export function diceCoefficient(str1, str2) {
  const s1 = (str1 || '').replace(/\s+/g, '');
  const s2 = (str2 || '').replace(/\s+/g, '');
  if (s1 === s2) return 1.0;
  if (s1.length < 2 || s2.length < 2) return 0.0;

  const getBigrams = (str) => {
    const bigrams = new Map();
    for (let i = 0; i < str.length - 1; i++) {
      const bg = str.slice(i, i + 2);
      bigrams.set(bg, (bigrams.get(bg) || 0) + 1);
    }
    return bigrams;
  };

  const bg1 = getBigrams(s1);
  const bg2 = getBigrams(s2);
  let intersection = 0;

  for (const [bg, count] of bg1.entries()) {
    if (bg2.has(bg)) {
      intersection += Math.min(count, bg2.get(bg));
    }
  }

  const total = (s1.length - 1) + (s2.length - 1);
  return total > 0 ? (2.0 * intersection) / total : 0;
}

// Distância de Levenshtein
export function levenshteinDistance(a, b) {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;

  const d = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) d[i][0] = i;
  for (let j = 0; j <= n; j++) d[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(
        d[i - 1][j] + 1,
        d[i][j - 1] + 1,
        d[i - 1][j - 1] + cost
      );
    }
  }
  return d[m][n];
}

// Similaridade combinada de nomes (Levenshtein + Dice + Token Jaccard)
export function nameSimilarity(str1, str2) {
  const n1 = normalizeName(str1);
  const n2 = normalizeName(str2);
  if (!n1 || !n2) return 0;
  if (n1 === n2) return 1.0;

  const c1 = n1.replace(/\s+/g, '');
  const c2 = n2.replace(/\s+/g, '');
  if (c1 === c2) return 1.0;

  const dice = diceCoefficient(c1, c2);
  const maxLen = Math.max(c1.length, c2.length);
  const levDist = levenshteinDistance(c1, c2);
  const levScore = maxLen > 0 ? (1.0 - levDist / maxLen) : 0;

  const tokens1 = getNameTokens(n1);
  const tokens2 = getNameTokens(n2);
  const set2 = new Set(tokens2);
  const common = tokens1.filter(t => set2.has(t)).length;
  const tokenJaccard = common / (new Set([...tokens1, ...tokens2]).size || 1);

  return (levScore * 0.4) + (dice * 0.3) + (tokenJaccard * 0.3);
}

/**
 * Analisa e extrai dados de um único PDF de contracheque
 */
export async function parseSinglePayslipPdf(arrayBuffer, fileName = '') {
  const items = await extractPdfTextItems(arrayBuffer);
  const lines = groupItemsIntoLines(items);

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

  // 1. Tentar extrair do nome do arquivo
  let filenameEmployeeName = '';
  let filenameEmployeeCode = '';

  if (fileName) {
    // Padrão Alterdata: 370-09-2026-M-5-SUILAJULIANARODRIGUESNOGUEIRA-Recibo de Pagamento.pdf
    const fnMatch = fileName.match(/(\d+)-(\d{2})-(\d{4})-[A-Za-z]+-(\d+)-([A-Za-z0-9_]+)/i);
    if (fnMatch) {
      payslip.month = fnMatch[2];
      payslip.year = fnMatch[3];
      filenameEmployeeCode = fnMatch[4];
      filenameEmployeeName = fnMatch[5].replace(/_/g, ' ').trim();
    } else {
      // Outros padrões comuns: "5 - SUILA JULIANA RODRIGUES NOGUEIRA.pdf" ou "005 - SUILA JULIANA.pdf"
      const altMatch1 = fileName.match(/^(\d+)[\s_-]+([A-Za-zÀ-ÿ\s]+?)(?:[-_.]|$)/);
      if (altMatch1) {
        filenameEmployeeCode = altMatch1[1];
        filenameEmployeeName = altMatch1[2].trim();
      } else {
        const cleanFn = fileName.replace(/\.pdf$/i, '').replace(/[-_]/g, ' ').trim();
        if (/[A-Za-zÀ-ÿ]{3,}/.test(cleanFn) && isValidEmployeeName(cleanFn)) {
          filenameEmployeeName = cleanFn;
        }
      }
    }
    if (filenameEmployeeCode) payslip.employeeCode = filenameEmployeeCode;
  }

  // 2. Pre-calcular limites verticais da tabela de verbas/rubricas
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

    // Razão Social da Empresa
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
    // Estritamente ignora tabela de verbas e linha de assinatura
    const isEmployeeHeaderLine = (
      (lineStr.includes('Nome do Funcionário') || lineStr.includes('Nome do Empregado') || lineStr.includes('Nome do Colaborador')) &&
      !lineStr.includes('Assinatura') &&
      !lineStr.includes('Vencimentos') &&
      !lineStr.includes('Descrição') &&
      !lineStr.includes('Referência')
    );

    if (isEmployeeHeaderLine && i + 1 < lines.length && !payslip.employeeName) {
      const nextLine = lines[i + 1];
      const firstItem = nextLine[0];
      if (firstItem && /^\d+$/.test(firstItem.str) && firstItem.x < 50) {
        payslip.employeeCode = firstItem.str;
        // Pega os itens de nome (entre x >= 35 e x < 360)
        const nameItems = nextLine.filter(it => it.x >= 35 && it.x < 360);
        if (nameItems.length > 0) {
          const candidateName = nameItems.map(it => it.str).join(' ').trim();
          if (isValidEmployeeName(candidateName)) {
            payslip.employeeName = candidateName;
          }
        }
        // CBO
        const cboItem = nextLine.find(it => it.x >= 350 && it.x < 420 && /^\d+$/.test(it.str));
        if (cboItem) payslip.cbo = cboItem.str;
      }
    }

    // Formato inline ("Nome: ...", "Funcionário: ...")
    if (!payslip.employeeName && (lineStr.includes('Nome:') || lineStr.includes('Funcionário:') || lineStr.includes('Empregado:'))) {
      const inlineMatch = lineStr.match(/(?:Nome|Funcionário|Empregado):\s*([A-Za-zÀ-ÿ\s]+)/i);
      if (inlineMatch && isValidEmployeeName(inlineMatch[1])) {
        payslip.employeeName = inlineMatch[1].trim();
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
        payslip.role = roleItems.map(it => it.str).join(' ').trim();
      }
    }

    // Extração das Rubricas / Verbas estritamente dentro do limite vertical da tabela
    const firstIt = line[0];
    const isWithinTableBounds = headerY && footerY ? (firstIt.y < headerY && firstIt.y > footerY) : false;

    if (isWithinTableBounds && firstIt && /^\d{1,5}$/.test(firstIt.str) && firstIt.x < 35) {
      const lineStrFull = line.map(it => it.str).join(' ');
      if (
        (!payslip.employeeName || !lineStrFull.includes(payslip.employeeName)) &&
        !lineStrFull.includes('Código') &&
        !lineStrFull.includes('Admissão') &&
        !lineStrFull.includes('Assinatura')
      ) {
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
      // Localiza a linha logo abaixo que de fato contém os valores monetários (salta texto de declaração se houver)
      let baseLine = null;
      for (let k = i + 1; k < Math.min(i + 4, lines.length); k++) {
        if (lines[k].some(it => /^\d{1,3}(?:\.\d{3})*,\d{2}$/.test(it.str))) {
          baseLine = lines[k];
          break;
        }
      }

      if (baseLine) {
        const baseSalItem = baseLine.find(it => it.x < 80);
        if (baseSalItem) payslip.baseSalary = parseCurrencyBR(baseSalItem.str);

        const inssItem = baseLine.find(it => it.x >= 80 && it.x < 180);
        if (inssItem) payslip.baseInss = parseCurrencyBR(inssItem.str);

        const fgtsItem = baseLine.find(it => it.x >= 180 && it.x < 280);
        if (fgtsItem) payslip.baseFgts = parseCurrencyBR(fgtsItem.str);

        const fgtsMonthItem = baseLine.find(it => it.x >= 280 && it.x < 360);
        if (fgtsMonthItem) payslip.fgtsValue = parseCurrencyBR(fgtsMonthItem.str);

        const irrfItem = baseLine.find(it => it.x >= 360 && it.x < 440);
        if (irrfItem) payslip.baseIrrf = parseCurrencyBR(irrfItem.str);

        const irrfRateItem = baseLine.find(it => it.x >= 440 && it.x < 520);
        if (irrfRateItem) payslip.irrfRate = parseCurrencyBR(irrfRateItem.str);
      }
    }
  }

  // Fallbacks: caso o nome ou código não tenham sido lidos do PDF, usa o nome do arquivo
  if (!payslip.employeeName && filenameEmployeeName && isValidEmployeeName(filenameEmployeeName)) {
    payslip.employeeName = filenameEmployeeName;
  }
  if (!payslip.employeeCode && filenameEmployeeCode) {
    payslip.employeeCode = filenameEmployeeCode;
  }

  // Backup para salário base caso zerado mas tenha DIAS NORMAIS
  if (!payslip.baseSalary && payslip.events.length > 0) {
    const normalDays = payslip.events.find(e => e.description.includes('NORMAIS') || e.description.includes('SALARIO'));
    if (normalDays && normalDays.earnings > 0) {
      payslip.baseSalary = normalDays.earnings;
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
 * Utiliza cascata inteligente de correspondência (Matrícula, Nome Exato, Nome Compacto, 
 * Token Overlap e Similaridade Fuzzy por Proximidade).
 */
export function matchEmployee(payslip, employeesList = []) {
  if (!employeesList || employeesList.length === 0) {
    return { isMatched: false, employee: null, confidence: 0, matchMethod: null };
  }

  const pCode = payslip.employeeCode ? String(payslip.employeeCode).trim() : '';
  const pCodeNum = pCode ? parseInt(pCode, 10) : null;
  const pName = payslip.employeeName || '';
  const pNorm = normalizeName(pName);
  const pCompact = pNorm.replace(/\s+/g, '');
  const pTokens = getNameTokens(pNorm);

  // 1. Tentar por Matrícula / Registration (exata ou comparação numérica sem zeros à esquerda)
  if (pCode) {
    const byCode = employeesList.find(emp => {
      const empReg = emp.registration || emp.code || emp.matricula;
      if (!empReg) return false;
      const cleanReg = String(empReg).trim();
      if (cleanReg === pCode) return true;
      if (pCodeNum !== null && !isNaN(pCodeNum)) {
        const empRegNum = parseInt(cleanReg, 10);
        return !isNaN(empRegNum) && empRegNum === pCodeNum;
      }
      return false;
    });
    if (byCode) {
      return { isMatched: true, employee: byCode, confidence: 100, matchMethod: 'matricula' };
    }
  }

  // 2. Tentar por Nome Completo Normalizado Exato
  if (pNorm) {
    const byExact = employeesList.find(emp => normalizeName(emp.name) === pNorm);
    if (byExact) {
      return { isMatched: true, employee: byExact, confidence: 100, matchMethod: 'nome_exato' };
    }

    // 3. Tentar por Nome Compacto (sem espaços, para nomes concatenados em arquivos como SUILAJULIANARODRIGUESNOGUEIRA)
    const byCompact = employeesList.find(emp => {
      const eNorm = normalizeName(emp.name);
      return eNorm.replace(/\s+/g, '') === pCompact;
    });
    if (byCompact) {
      return { isMatched: true, employee: byCompact, confidence: 99, matchMethod: 'nome_compacto' };
    }

    // 4. Tentar por Primeiro + Último Nome e Interseção de Tokens
    if (pTokens.length >= 2) {
      const byTokens = employeesList.find(emp => {
        const eTokens = getNameTokens(normalizeName(emp.name));
        if (eTokens.length < 2) return false;
        // Primeiro nome e último nome coincidem
        return eTokens[0] === pTokens[0] && eTokens[eTokens.length - 1] === pTokens[pTokens.length - 1];
      });
      if (byTokens) {
        return { isMatched: true, employee: byTokens, confidence: 95, matchMethod: 'primeiro_e_ultimo_nome' };
      }
    }
  }

  // 5. Tentar por Proximidade e Similaridade Máxima (Fuzzy Matching com limiar de 68%)
  if (pNorm && pNorm.length >= 3) {
    let bestMatch = null;
    let highestScore = 0;

    for (const emp of employeesList) {
      const eNorm = normalizeName(emp.name);
      if (!eNorm) continue;

      const score = nameSimilarity(pNorm, eNorm);
      if (score > highestScore) {
        highestScore = score;
        bestMatch = emp;
      }
    }

    if (bestMatch && highestScore >= 0.68) {
      return {
        isMatched: true,
        employee: bestMatch,
        confidence: Math.round(highestScore * 100),
        matchMethod: 'fuzzy_proximidade'
      };
    }
  }

  // 6. Tentativa adicional via nome do arquivo caso o PDF tenha lido texto diferente
  if (payslip.fileName) {
    const fnMatch = payslip.fileName.match(/(\d+)-(\d{2})-(\d{4})-[A-Za-z]+-(\d+)-([A-Za-z0-9_]+)/i);
    const rawFnName = fnMatch ? fnMatch[5] : '';
    if (rawFnName) {
      const fnNorm = normalizeName(rawFnName);
      const fnCompact = fnNorm.replace(/\s+/g, '');
      const byFn = employeesList.find(emp => {
        const eNorm = normalizeName(emp.name);
        return eNorm.replace(/\s+/g, '') === fnCompact;
      });
      if (byFn) {
        return { isMatched: true, employee: byFn, confidence: 95, matchMethod: 'arquivo_nome' };
      }
    }
  }

  return { isMatched: false, employee: null, confidence: 0, matchMethod: null };
}

/**
 * Processa um arquivo ZIP ou lista de arquivos PDF (suporta pacotes de até 25MB e centenas de PDFs)
 */
export async function parsePayslipsBatch(fileOrFiles, employeesList = [], onProgress = () => {}) {
  const payslips = [];
  const errors = [];

  // Validação de tamanho máximo (limite generoso de 25MB)
  const MAX_BYTES = 25 * 1024 * 1024;
  if (fileOrFiles instanceof File && fileOrFiles.size > MAX_BYTES) {
    throw new Error(`Arquivo excede o limite suportado de 25MB (tamanho atual: ${(fileOrFiles.size / (1024 * 1024)).toFixed(1)}MB).`);
  }

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
      const percent = total > 0 ? Math.round(((idx + 1) / total) * 100) : 100;
      onProgress({ current: idx + 1, total, fileName: entry.name, percent });

      // Respira o event loop para atualizar a interface
      await new Promise(r => setTimeout(r, 6));

      try {
        const arrayBuffer = await entry.async('arraybuffer');
        const parsed = await parseSinglePayslipPdf(arrayBuffer, entry.name);
        const matchRes = matchEmployee(parsed, employeesList);
        payslips.push({
          ...parsed,
          id: 'ps-' + (idx + 1),
          isMatched: matchRes.isMatched,
          matchedEmployee: matchRes.employee,
          matchConfidence: matchRes.confidence || 0,
          matchMethod: matchRes.matchMethod
        });
      } catch (err) {
        console.warn(`Erro ao processar PDF ${entry.name}:`, err);
        errors.push({ fileName: entry.name, error: err.message || 'Erro de leitura' });
      }
    }
  } else {
    // Lista de arquivos individuais (PDFs selecionados)
    const files = Array.isArray(fileOrFiles) ? fileOrFiles : [fileOrFiles];
    const total = files.length;
    for (let idx = 0; idx < total; idx++) {
      const file = files[idx];
      const percent = total > 0 ? Math.round(((idx + 1) / total) * 100) : 100;
      onProgress({ current: idx + 1, total, fileName: file.name, percent });

      await new Promise(r => setTimeout(r, 6));

      try {
        const arrayBuffer = await file.arrayBuffer();
        const parsed = await parseSinglePayslipPdf(arrayBuffer, file.name);
        const matchRes = matchEmployee(parsed, employeesList);
        payslips.push({
          ...parsed,
          id: 'ps-' + (idx + 1),
          isMatched: matchRes.isMatched,
          matchedEmployee: matchRes.employee,
          matchConfidence: matchRes.confidence || 0,
          matchMethod: matchRes.matchMethod
        });
      } catch (err) {
        console.warn(`Erro ao processar ${file.name}:`, err);
        errors.push({ fileName: file.name, error: err.message || 'Erro de leitura' });
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
      totalNet,
      errorsCount: errors.length,
      errors
    },
    items: payslips
  };
}
