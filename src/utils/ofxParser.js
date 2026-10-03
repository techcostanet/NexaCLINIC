/**
 * Utilitário de Leitura e Processamento de Extratos Bancários OFX / CSV
 * Suporta formatos SGML e XML de bancos brasileiros (Sicoob, Itaú, BB, Santander, Caixa, Bradesco, etc.)
 */

/**
 * Converte data no formato OFX (YYYYMMDDHHMMSS...) para formato ISO YYYY-MM-DD
 */
export const parseOfxDate = (dateStr) => {
  if (!dateStr) return new Date().toISOString().substring(0, 10);
  const clean = String(dateStr).trim().replace(/[^0-9]/g, '');
  if (clean.length >= 8) {
    const year = clean.substring(0, 4);
    const month = clean.substring(4, 6);
    const day = clean.substring(6, 8);
    return `${year}-${month}-${day}`;
  }
  return new Date().toISOString().substring(0, 10);
};

/**
 * Extrai o valor de uma tag específica tanto em formato OFX 1.x (sem tag de fechamento) quanto 2.x (com tag de fechamento)
 */
const getTagValue = (block, tagName) => {
  const regexWithClose = new RegExp(`<${tagName}>([\\s\\S]*?)</${tagName}>`, 'i');
  const matchClose = block.match(regexWithClose);
  if (matchClose) return matchClose[1].trim();

  const regexOpenOnly = new RegExp(`<${tagName}>([^<\\r\\n]+)`, 'i');
  const matchOpen = block.match(regexOpenOnly);
  if (matchOpen) return matchOpen[1].trim();

  return '';
};

/**
 * Faz o parse completo do conteúdo de texto de um arquivo OFX
 */
export const parseOfxContent = (content) => {
  if (!content || typeof content !== 'string') {
    throw new Error('Conteúdo do arquivo OFX vazio ou inválido.');
  }

  // 1. Extração de informações do Banco / Conta
  const bankId = getTagValue(content, 'BANKID') || getTagValue(content, 'FID') || '';
  const accountId = getTagValue(content, 'ACCTID') || '';
  const org = getTagValue(content, 'ORG') || '';

  let bankName = 'Banco';
  if (org) {
    bankName = org;
  } else if (bankId === '756' || bankId.includes('SICOOB')) {
    bankName = 'Sicoob';
  } else if (bankId === '341' || bankId.includes('ITAU')) {
    bankName = 'Itaú Unibanco';
  } else if (bankId === '001' || bankId.includes('BRASIL')) {
    bankName = 'Banco do Brasil';
  } else if (bankId === '033' || bankId.includes('SANTANDER')) {
    bankName = 'Santander';
  } else if (bankId === '104' || bankId.includes('CAIXA')) {
    bankName = 'Caixa Econômica';
  } else if (bankId === '237' || bankId.includes('BRADESCO')) {
    bankName = 'Bradesco';
  } else if (bankId === '077' || bankId.includes('INTER')) {
    bankName = 'Banco Inter';
  }

  // 2. Extração de blocos de transações <STMTTRN>
  const trnBlocks = content.split(/<STMTTRN>/i);
  // O primeiro elemento é o cabeçalho anterior ao primeiro <STMTTRN>
  trnBlocks.shift();

  const transactions = [];

  for (let i = 0; i < trnBlocks.length; i++) {
    const rawBlock = trnBlocks[i];
    // Corta até o fechamento </STMTTRN> ou início do próximo
    const blockEndIdx = rawBlock.search(/<\/STMTTRN>/i);
    const block = blockEndIdx !== -1 ? rawBlock.substring(0, blockEndIdx) : rawBlock;

    const trnType = getTagValue(block, 'TRNTYPE').toUpperCase();
    const dtPosted = getTagValue(block, 'DTPOSTED');
    const trnAmtRaw = getTagValue(block, 'TRNAMT').replace(',', '.');
    const fitId = getTagValue(block, 'FITID') || `OFX-${Date.now()}-${i}`;
    const memo = getTagValue(block, 'MEMO') || getTagValue(block, 'NAME') || 'Transação Bancária';
    const checkNum = getTagValue(block, 'CHECKNUM') || '';

    const numAmt = parseFloat(trnAmtRaw) || 0;
    const isCredit = numAmt > 0 || ['CREDIT', 'DEP', 'INT', 'DIV'].includes(trnType);

    const dateFormatted = parseOfxDate(dtPosted);

    transactions.push({
      id: fitId,
      fitid: fitId,
      date: dateFormatted,
      bankName: bankName + (accountId ? ` (${accountId})` : ''),
      description: memo,
      checkNum,
      type: isCredit ? 'Crédito' : 'Débito',
      amount: Math.abs(numAmt),
      rawAmount: numAmt,
      status: 'Pendente',
      note: 'Importado de extrato bancário OFX',
      origin: 'ofx_import'
    });
  }

  return {
    bankId,
    accountId,
    bankName,
    transactionsCount: transactions.length,
    transactions
  };
};

/**
 * Parser alternativo para extratos bancários em formato CSV
 */
export const parseCsvStatement = (csvText) => {
  if (!csvText) return [];
  const lines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length < 2) return [];

  const transactions = [];
  const separator = lines[0].includes(';') ? ';' : ',';

  // Ignora cabeçalho
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(separator).map(c => c.trim().replace(/^"|"$/g, ''));
    if (cols.length < 3) continue;

    // Detecta colunas básicas: Data, Histórico/Descrição, Valor
    const dateStr = cols[0];
    const desc = cols[1] || 'Lançamento Extrato';
    const valRaw = cols[cols.length - 1] || cols[2];
    const cleanVal = String(valRaw).replace('R$', '').replace(/\./g, '').replace(',', '.').trim();
    const numAmt = parseFloat(cleanVal) || 0;

    if (numAmt === 0 && !dateStr) continue;

    // Converte DD/MM/YYYY para YYYY-MM-DD
    let isoDate = dateStr;
    if (dateStr.includes('/')) {
      const parts = dateStr.split('/');
      if (parts.length === 3) {
        isoDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
      }
    }

    transactions.push({
      id: `CSV-${Date.now()}-${i}`,
      fitid: `CSV-${Date.now()}-${i}`,
      date: isoDate,
      bankName: 'Extrato Bancário',
      description: desc,
      type: numAmt >= 0 ? 'Crédito' : 'Débito',
      amount: Math.abs(numAmt),
      rawAmount: numAmt,
      status: 'Pendente',
      note: 'Importado via arquivo CSV',
      origin: 'csv_import'
    });
  }

  return transactions;
};

/**
 * Realiza o cruzamento inteligente (Auto-Matching) entre uma transação bancária e os títulos do sistema
 */
export const matchStatementWithTitles = (statementItem, payableList = [], receivableList = []) => {
  const isDebit = statementItem.type === 'Débito';
  const targetList = isDebit ? payableList : receivableList;
  const targetAmount = Math.abs(statementItem.amount);
  const stmtDate = new Date(statementItem.date);

  let bestMatch = null;
  let highestScore = 0;
  let matchReason = '';

  for (const item of targetList) {
    // Apenas títulos pendentes ou em aberto podem dar match
    const isAlreadyPaid = item.status === 'Pago' || item.status === 'PAGO';
    const itemAmount = Math.abs(parseFloat(item.amount || item.totalValue || item.valorTotal) || 0);
    const amountDiff = Math.abs(targetAmount - itemAmount);

    // 1. Verificação de Valor
    let valueScore = 0;
    if (amountDiff === 0) {
      valueScore = 50; // Valor exato
    } else if (amountDiff <= 0.10) {
      valueScore = 40; // Diferença de centavos
    } else if (amountDiff <= 1.50) {
      valueScore = 20; // Diferença pequena (possível tarifa ou desconto)
    } else {
      continue; // Valor muito distante, descarta
    }

    // 2. Verificação de Data (tolerância de até 7 dias entre vencimento e efetivação no extrato)
    const itemDateStr = item.dueDate || item.vencimento || item.date || item.dataVencimento;
    let dateScore = 0;
    if (itemDateStr) {
      const itemDate = new Date(itemDateStr);
      const diffDays = Math.abs((stmtDate - itemDate) / (1000 * 60 * 60 * 24));
      if (diffDays <= 1) {
        dateScore = 30;
      } else if (diffDays <= 3) {
        dateScore = 20;
      } else if (diffDays <= 7) {
        dateScore = 10;
      }
    }

    // 3. Verificação Textual (Fornecedor / Cliente / Descrição / Número NF)
    let textScore = 0;
    const cleanStmtDesc = (statementItem.description || '').toLowerCase();
    const itemName = (item.supplier || item.client || item.fornecedor || item.description || item.descricao || '').toLowerCase();
    const invoiceNum = String(item.invoiceNumber || item.number || '').toLowerCase();

    if (itemName && itemName.length > 3 && cleanStmtDesc.includes(itemName)) {
      textScore = 30;
    } else if (invoiceNum && invoiceNum.length > 2 && cleanStmtDesc.includes(invoiceNum)) {
      textScore = 35;
    } else {
      // Comparação por palavras-chave
      const words = itemName.split(/\s+/).filter(w => w.length > 3);
      for (const w of words) {
        if (cleanStmtDesc.includes(w)) {
          textScore += 10;
          break;
        }
      }
    }

    const totalScore = valueScore + dateScore + textScore;

    if (totalScore > highestScore && totalScore >= 50) {
      highestScore = totalScore;
      bestMatch = item;
      
      if (valueScore === 50 && textScore > 0) {
        matchReason = `Valor exato (R$ ${targetAmount.toFixed(2)}) e correspondência de fornecedor/documento`;
      } else if (valueScore === 50 && dateScore >= 20) {
        matchReason = `Valor exato com data compatível (±${Math.round((stmtDate - new Date(itemDateStr)) / (1000*60*60*24))}d)`;
      } else {
        matchReason = `Valor aproximado com dados compatíveis`;
      }
    }
  }

  return {
    hasMatch: !!bestMatch,
    matchedTitle: bestMatch,
    score: highestScore,
    confidence: highestScore >= 70 ? 'high' : (highestScore >= 50 ? 'medium' : 'low'),
    reason: matchReason
  };
};
