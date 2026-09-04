/**
 * Utilitário de Geração de Arquivo de Remessa CNAB 240 — Banco SICOOB (756)
 * Em estrita conformidade com o "Guia de Importação de Arquivos CNAB 240 - Pagamentos e Transferências (Versão 3.3)"
 * - Header de Arquivo (Versão Layout 087)
 * - Header de Lote para Pagamento de Títulos de Cobrança / Boletos (Versão Layout 040)
 * - Registros de Detalhe: Segmento J e Segmento J-52 (Obrigatório SICOOB)
 * - Trailer de Lote e Trailer de Arquivo
 * Cada linha possui RIGOROSAMENTE 240 caracteres, com quebra de linha \r\n padrão FEBRABAN.
 */

/**
 * Remove acentos e caracteres especiais, mantendo apenas caracteres ASCII limpos
 */
export function sanitizeText(str) {
  if (!str) return '';
  return String(str)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9\s._-]/g, ' ')
    .toUpperCase();
}

/**
 * Preenche campo numérico com zeros à esquerda
 */
export function padNum(val, len) {
  const digits = String(val || '').replace(/\D/g, '');
  if (digits.length >= len) return digits.slice(-len);
  return digits.padStart(len, '0');
}

/**
 * Preenche campo alfanumérico com espaços à direita
 */
export function padAlfa(val, len) {
  const clean = sanitizeText(val);
  if (clean.length >= len) return clean.slice(0, len);
  return clean.padEnd(len, ' ');
}

/**
 * Formata data no padrão DDMMAAAA
 */
export function formatDateDDMMAAAA(dateVal) {
  if (!dateVal) {
    const now = new Date();
    const d = String(now.getDate()).padStart(2, '0');
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const y = String(now.getFullYear());
    return `${d}${m}${y}`;
  }

  // Se já estiver em formato YYYY-MM-DD
  if (typeof dateVal === 'string' && dateVal.includes('-')) {
    const parts = dateVal.split('T')[0].split('-');
    if (parts.length === 3) {
      return `${parts[2].padStart(2, '0')}${parts[1].padStart(2, '0')}${parts[0]}`;
    }
  }

  const dt = new Date(dateVal);
  if (isNaN(dt.getTime())) {
    const now = new Date();
    return `${String(now.getDate()).padStart(2, '0')}${String(now.getMonth() + 1).padStart(2, '0')}${now.getFullYear()}`;
  }
  const d = String(dt.getDate()).padStart(2, '0');
  const m = String(dt.getMonth() + 1).padStart(2, '0');
  const y = String(dt.getFullYear());
  return `${d}${m}${y}`;
}

/**
 * Formata hora no padrão HHMMSS
 */
export function formatTimeHHMMSS(dateObj = new Date()) {
  const h = String(dateObj.getHours()).padStart(2, '0');
  const m = String(dateObj.getMinutes()).padStart(2, '0');
  const s = String(dateObj.getSeconds()).padStart(2, '0');
  return `${h}${m}${s}`;
}

/**
 * Formata valor em centavos com tamanho fixo
 */
export function formatAmountCents(amount, len) {
  const num = parseFloat(amount) || 0;
  const cents = Math.round(num * 100);
  return padNum(cents, len);
}

/**
 * Converte Linha Digitável (47 ou 48 dígitos) no Código de Barras de 44 dígitos
 * Especificação FEBRABAN e Sicoob (campo G063 / N001)
 */
export function convertDigitableLineToBarcode(line) {
  if (!line) return '';
  const digits = String(line).replace(/\D/g, '');

  // Se já possui 44 posições, já é o código de barras
  if (digits.length === 44) {
    return digits;
  }

  // Boletos de Cobrança Bancária (47 dígitos)
  // Estrutura da Linha Digitável:
  // Campo 1: BBBMC.CCCCX (pos 0..8 dados + pos 9 DV1)
  // Campo 2: CCCCC.CCCCCCY (pos 10..19 dados + pos 20 DV2)
  // Campo 3: CCCCC.CCCCCCZ (pos 21..30 dados + pos 31 DV3)
  // Campo 4: K (pos 32 DV Geral do código de barras)
  // Campo 5: UUUUVVVVVVVVVV (pos 33..36 Fator Venc. + pos 37..46 Valor)
  if (digits.length === 47) {
    const banco = digits.slice(0, 3);
    const moeda = digits.slice(3, 4);
    const campoLivre1 = digits.slice(4, 9);
    // descarta digito 9 (DV1)
    const campoLivre2 = digits.slice(10, 20);
    // descarta digito 20 (DV2)
    const campoLivre3 = digits.slice(21, 31);
    // descarta digito 31 (DV3)
    const dvGeral = digits.slice(32, 33);
    const fatorVencimento = digits.slice(33, 37);
    const valor = digits.slice(37, 47);

    // Código de barras (44 posições):
    // 01-03: Banco (3)
    // 04-04: Moeda (1)
    // 05-05: DV Geral (1)
    // 06-09: Fator de Vencimento (4)
    // 10-19: Valor Nominal (10)
    // 20-24: Campo Livre parte 1 (5)
    // 25-34: Campo Livre parte 2 (10)
    // 35-44: Campo Livre parte 3 (10)
    const barcode = `${banco}${moeda}${dvGeral}${fatorVencimento}${valor}${campoLivre1}${campoLivre2}${campoLivre3}`;
    return barcode.length === 44 ? barcode : '';
  }

  // Boletos de Concessionárias / Tributos com Código de Barras (48 dígitos)
  if (digits.length === 48) {
    const campo1 = digits.slice(0, 11); // descarta pos 11 (DV)
    const campo2 = digits.slice(12, 23); // descarta pos 23 (DV)
    const campo3 = digits.slice(24, 35); // descarta pos 35 (DV)
    const campo4 = digits.slice(36, 47); // descarta pos 47 (DV)
    const barcode = `${campo1}${campo2}${campo3}${campo4}`;
    return barcode.length === 44 ? barcode : '';
  }

  return '';
}

/**
 * Constrói o Header do Arquivo (Registro Tipo 0)
 * Manual Sicoob página 10 (Layout Versão 087)
 */
export function buildHeaderArquivo({
  companyName,
  companyCnpj,
  sicoobConvenio,
  agencyNumber,
  agencyDv = '',
  accountNumber,
  accountDv = '',
  agAccountDv = '',
  fileSequence = 1,
  generationDate = new Date()
}) {
  let line = '';
  line += '756'; // 01.0 Banco (3)
  line += '0000'; // 02.0 Lote (4)
  line += '0'; // 03.0 Tipo Registro (1)
  line += ''.padEnd(9, ' '); // 04.0 CNAB (9)
  line += '2'; // 05.0 Tipo Inscrição (2 = CNPJ) (1)
  line += padNum(companyCnpj, 14); // 06.0 Número Inscrição (14)
  line += padAlfa(sicoobConvenio, 20); // 07.0 Convênio no Banco (20)
  line += padNum(agencyNumber, 5); // 08.0 Agência (5)
  line += padAlfa(agencyDv, 1); // 09.0 DV Agência (1)
  line += padNum(accountNumber, 12); // 10.0 Conta Corrente (12)
  line += padNum(accountDv, 1); // 11.0 DV Conta (1)
  line += padAlfa(agAccountDv, 1); // 12.0 DV Ag/Conta (1)
  line += padAlfa(companyName, 30); // 13.0 Nome da Empresa (30)
  line += padAlfa('SICOOB', 30); // 14.0 Nome do Banco (30)
  line += ''.padEnd(10, ' '); // 15.0 CNAB (10)
  line += '1'; // 16.0 Código Remessa (1 = Remessa) (1)
  line += formatDateDDMMAAAA(generationDate); // 17.0 Data Geração (8)
  line += formatTimeHHMMSS(generationDate); // 18.0 Hora Geração (6)
  line += padNum(fileSequence, 6); // 19.0 Sequência Arquivo NSA (6)
  line += '087'; // 20.0 Versão Layout Arquivo (3)
  line += '00000'; // 21.0 Densidade (5)
  line += ''.padEnd(20, ' '); // 22.0 Reservado Banco (20)
  line += ''.padEnd(20, ' '); // 23.0 Reservado Empresa (20)
  line += ''.padEnd(29, ' '); // 24.0 CNAB (29)

  if (line.length !== 240) {
    throw new Error(`Erro ao gerar Header do Arquivo: tamanho ${line.length} diferente de 240 caracteres.`);
  }
  return line;
}

/**
 * Constrói o Header do Lote de Pagamento de Títulos de Cobrança (Registro Tipo 1)
 * Manual Sicoob página 20 (Layout Versão 040)
 */
export function buildHeaderLoteTitulos({
  lotNumber = 1,
  companyName,
  companyCnpj,
  sicoobConvenio,
  agencyNumber,
  agencyDv = '',
  accountNumber,
  accountDv = '',
  agAccountDv = '',
  companyAddress = '',
  companyAddressNumber = '',
  companyComplement = '',
  companyCity = '',
  companyCep = '',
  companyState = 'MG'
}) {
  let line = '';
  line += '756'; // 01.1 Banco (3)
  line += padNum(lotNumber, 4); // 02.1 Lote de Serviço (4)
  line += '1'; // 03.1 Tipo Registro (1)
  line += 'C'; // 04.1 Operação (1)
  line += '20'; // 05.1 Tipo Serviço (20 = Pagamento Fornecedor) (2)
  line += '31'; // 06.1 Forma Lançamento (31 = Títulos de Outros Bancos / Geral) (2)
  line += '040'; // 07.1 Layout do Lote (3)
  line += ' '; // 08.1 CNAB (1)
  line += '2'; // 09.1 Tipo Inscrição (2 = CNPJ) (1)
  line += padNum(companyCnpj, 14); // 10.1 Número Inscrição (14)
  line += padAlfa(sicoobConvenio, 20); // 11.1 Convênio (20)
  line += padNum(agencyNumber, 5); // 12.1 Agência (5)
  line += padAlfa(agencyDv, 1); // 13.1 DV Agência (1)
  line += padNum(accountNumber, 12); // 14.1 Conta Corrente (12)
  line += padNum(accountDv, 1); // 15.1 DV Conta (1)
  line += padAlfa(agAccountDv, 1); // 16.1 DV Ag/Conta (1)
  line += padAlfa(companyName, 30); // 17.1 Nome da Empresa (30)
  line += ''.padEnd(40, ' '); // 18.1 Mensagem / Informação 1 (40)
  line += padAlfa(companyAddress || 'AVENIDA PRINCIPAL', 30); // 19.1 Logradouro (30)
  line += padNum(companyAddressNumber || '100', 5); // 20.1 Número (5)
  line += padAlfa(companyComplement || '', 15); // 21.1 Complemento (15)
  line += padAlfa(companyCity || 'BETIM', 20); // 22.1 Cidade (20)
  
  const cepDigits = String(companyCep || '32600000').replace(/\D/g, '').padEnd(8, '0');
  line += cepDigits.slice(0, 5); // 23.1 CEP (5)
  line += cepDigits.slice(5, 8); // 24.1 Complemento CEP (3)
  line += padAlfa(companyState || 'MG', 2); // 25.1 Estado UF (2)
  line += ''.padEnd(8, ' '); // 26.1 CNAB (8)
  line += ''.padEnd(10, ' '); // 27.1 Ocorrências Retorno (10)

  if (line.length !== 240) {
    throw new Error(`Erro ao gerar Header do Lote: tamanho ${line.length} diferente de 240 caracteres.`);
  }
  return line;
}

/**
 * Constrói o Segmento J (Registro Detalhe Tipo 3)
 * Manual Sicoob página 22
 */
export function buildSegmentoJ({
  lotNumber = 1,
  recordSequence,
  barcode,
  supplierName,
  dueDate,
  paymentDate,
  amount,
  documentNumber = ''
}) {
  let line = '';
  line += '756'; // 01.3J Banco (3)
  line += padNum(lotNumber, 4); // 02.3J Lote (4)
  line += '3'; // 03.3J Tipo Registro (1)
  line += padNum(recordSequence, 5); // 04.3J Nº Sequencial no Lote (5)
  line += 'J'; // 05.3J Código Segmento (1)
  line += '0'; // 06.3J Tipo Movimento (0 = Inclusão) (1)
  line += '00'; // 07.3J Código Instrução Movimento (00 = Liberado) (2)
  line += padNum(barcode, 44); // 08.3J Código de Barras (44)
  line += padAlfa(supplierName, 30); // 09.3J Nome do Cedente (30)
  line += formatDateDDMMAAAA(dueDate); // 10.3J Data Vencimento (8)
  line += formatAmountCents(amount, 15); // 11.3J Valor Nominal do Título (15)
  line += padNum(0, 15); // 12.3J Valor Desconto / Abatimento (15)
  line += padNum(0, 15); // 13.3J Valor Mora / Multa (15)
  line += formatDateDDMMAAAA(paymentDate || dueDate); // 14.3J Data do Pagamento (8)
  line += formatAmountCents(amount, 15); // 15.3J Valor do Pagamento (15)
  line += padNum(0, 15); // 16.3J Quantidade da Moeda (15)
  line += padAlfa(documentNumber || '', 20); // 17.3J Referência Sacado / Seu Número (20)
  line += ''.padEnd(20, ' '); // 18.3J Nosso Número (20)
  line += '09'; // 19.3J Código de Moeda (09 = Real) (2)
  line += ''.padEnd(6, ' '); // 20.3J CNAB (6)
  line += ''.padEnd(10, ' '); // 21.3J Ocorrências Retorno (10)

  if (line.length !== 240) {
    throw new Error(`Erro ao gerar Segmento J: tamanho ${line.length} diferente de 240 caracteres.`);
  }
  return line;
}

/**
 * Constrói o Segmento J-52 (Registro Detalhe Tipo 3 - Obrigatório Sicoob)
 * Manual Sicoob página 23
 */
export function buildSegmentoJ52({
  lotNumber = 1,
  recordSequence,
  companyCnpj,
  companyName,
  supplierCnpj,
  supplierName
}) {
  let line = '';
  line += '756'; // 01.4.J52 Banco (3)
  line += padNum(lotNumber, 4); // 02.4.J52 Lote (4)
  line += '3'; // 03.4.J52 Tipo Registro (1)
  line += padNum(recordSequence, 5); // 04.4.J52 Nº Sequencial no Lote (5)
  line += 'J'; // 05.4.J52 Código Segmento (1)
  line += ' '; // 06.4.J52 CNAB (1)
  line += '00'; // 07.4.J52 Código Movimento Remessa (2)
  line += '52'; // 08.4.J52 Identificação Registro Opcional (52) (2)
  
  // Dados do Sacado / Devedor (Empresa Pagadora / Clínica)
  line += '2'; // 09.4.J52 Tipo Inscrição Sacado (2 = CNPJ) (1)
  line += padNum(companyCnpj, 15); // 10.4.J52 Número Inscrição Sacado (15)
  line += padAlfa(companyName, 40); // 11.4.J52 Nome do Sacado (40)

  // Dados do Cedente / Beneficiário (Fornecedor)
  const cleanSupDoc = String(supplierCnpj || '').replace(/\D/g, '');
  const supDocType = cleanSupDoc.length <= 11 ? '1' : '2';
  line += supDocType; // 12.4.J52 Tipo Inscrição Cedente (1)
  line += padNum(cleanSupDoc, 15); // 13.4.J52 Número Inscrição Cedente (15)
  line += padAlfa(supplierName, 40); // 14.4.J52 Nome do Cedente (40)

  // Dados do Sacador / Avalista (Não se aplica - zeros e brancos)
  line += '0'; // 15.4.J52 Tipo Inscrição Sacador (1)
  line += padNum(0, 15); // 16.4.J52 Número Inscrição Sacador (15)
  line += ''.padEnd(40, ' '); // 17.4.J52 Nome do Sacador (40)
  line += ''.padEnd(53, ' '); // 18.4.J52 CNAB (53)

  if (line.length !== 240) {
    throw new Error(`Erro ao gerar Segmento J-52: tamanho ${line.length} diferente de 240 caracteres.`);
  }
  return line;
}

/**
 * Constrói o Trailer do Lote (Registro Tipo 5)
 * Manual Sicoob página 25
 */
export function buildTrailerLote({
  lotNumber = 1,
  totalRecordsInLot,
  totalAmount
}) {
  let line = '';
  line += '756'; // 01.5 Banco (3)
  line += padNum(lotNumber, 4); // 02.5 Lote (4)
  line += '5'; // 03.5 Tipo Registro (1)
  line += ''.padEnd(9, ' '); // 04.5 CNAB (9)
  line += padNum(totalRecordsInLot, 6); // 05.5 Quantidade de Registros do Lote (6)
  line += formatAmountCents(totalAmount, 18); // 06.5 Somatória dos Valores do Lote (18)
  line += padNum(0, 18); // 07.5 Somatória Quantidade de Moedas (18)
  line += padNum(0, 6); // 08.5 Número Aviso de Débito (6)
  line += ''.padEnd(165, ' '); // 09.5 CNAB (165)
  line += ''.padEnd(10, ' '); // 10.5 Ocorrências Retorno (10)

  if (line.length !== 240) {
    throw new Error(`Erro ao gerar Trailer do Lote: tamanho ${line.length} diferente de 240 caracteres.`);
  }
  return line;
}

/**
 * Constrói o Trailer do Arquivo (Registro Tipo 9)
 * Manual Sicoob página 13
 */
export function buildTrailerArquivo({
  totalLots = 1,
  totalRecordsInFile
}) {
  let line = '';
  line += '756'; // 01.9 Banco (3)
  line += '9999'; // 02.9 Lote (4)
  line += '9'; // 03.9 Tipo Registro (1)
  line += ''.padEnd(9, ' '); // 04.9 CNAB (9)
  line += padNum(totalLots, 6); // 05.9 Quantidade de Lotes (6)
  line += padNum(totalRecordsInFile, 6); // 06.9 Quantidade Total de Registros (6)
  line += padNum(0, 6); // 07.9 Quantidade de Contas para Conciliação (6)
  line += ''.padEnd(205, ' '); // 08.9 CNAB (205)

  if (line.length !== 240) {
    throw new Error(`Erro ao gerar Trailer do Arquivo: tamanho ${line.length} diferente de 240 caracteres.`);
  }
  return line;
}

/**
 * Função principal: Gera o arquivo CNAB 240 Sicoob completo para pagamento de boletos
 * @param {Object} params
 * @param {Object} params.company - { name, cnpj, address, addressNumber, complement, city, cep, state }
 * @param {Object} params.bankAccount - { convenio, agency, agencyDv, account, accountDv, agAccountDv }
 * @param {Array} params.payments - Lista de pagamentos com { id, supplier, cnpj, amount, dueDate, paymentDate, digitableLine, invoiceNumber }
 * @param {number} [params.fileSequence=1] - Sequencial do arquivo remessa
 * @param {Date} [params.generationDate=new Date()] - Data de geração
 * @returns {{ cnabContent: string, fileName: string, totalAmount: number, totalTitles: number, totalLines: number }}
 */
export function generateSicoobCnab240({
  company,
  bankAccount,
  payments = [],
  fileSequence = 1,
  generationDate = new Date()
}) {
  if (!company || !company.name || !company.cnpj) {
    throw new Error('Dados da empresa pagadora incompletos (Razão Social e CNPJ são obrigatórios).');
  }
  if (!bankAccount || !bankAccount.convenio || !bankAccount.agency || !bankAccount.account) {
    throw new Error('Dados bancários Sicoob incompletos (Convênio, Agência e Conta são obrigatórios).');
  }

  const validPayments = payments.filter(p => {
    const rawLine = p.digitableLine || '';
    const barcode = convertDigitableLineToBarcode(rawLine);
    return barcode && barcode.length === 44 && parseFloat(p.amount) > 0;
  });

  if (validPayments.length === 0) {
    throw new Error('Nenhum pagamento selecionado possui Linha Digitável / Código de Barras válido de 44 ou 47 dígitos.');
  }

  const lines = [];

  // 1. Header do Arquivo (Tipo 0)
  const headerArquivo = buildHeaderArquivo({
    companyName: company.name,
    companyCnpj: company.cnpj,
    sicoobConvenio: bankAccount.convenio,
    agencyNumber: bankAccount.agency,
    agencyDv: bankAccount.agencyDv || '',
    accountNumber: bankAccount.account,
    accountDv: bankAccount.accountDv || '',
    agAccountDv: bankAccount.agAccountDv || '',
    fileSequence: fileSequence,
    generationDate: generationDate
  });
  lines.push(headerArquivo);

  // 2. Header do Lote de Títulos (Tipo 1)
  const lotNumber = 1;
  const headerLote = buildHeaderLoteTitulos({
    lotNumber: lotNumber,
    companyName: company.name,
    companyCnpj: company.cnpj,
    sicoobConvenio: bankAccount.convenio,
    agencyNumber: bankAccount.agency,
    agencyDv: bankAccount.agencyDv || '',
    accountNumber: bankAccount.account,
    accountDv: bankAccount.accountDv || '',
    agAccountDv: bankAccount.agAccountDv || '',
    companyAddress: company.address || '',
    companyAddressNumber: company.addressNumber || '',
    companyComplement: company.complement || '',
    companyCity: company.city || '',
    companyCep: company.cep || '',
    companyState: company.state || 'MG'
  });
  lines.push(headerLote);

  // 3. Detalhes: Segmentos J e J-52 para cada pagamento
  let recordInLot = 1; // 1 é o Header do lote
  let totalLotAmount = 0;

  validPayments.forEach((pay, idx) => {
    const barcode = convertDigitableLineToBarcode(pay.digitableLine);
    const amountVal = parseFloat(pay.amount) || 0;
    totalLotAmount += amountVal;

    // Segmento J
    recordInLot++;
    const segJ = buildSegmentoJ({
      lotNumber: lotNumber,
      recordSequence: recordInLot,
      barcode: barcode,
      supplierName: pay.supplier || 'FORNECEDOR',
      dueDate: pay.dueDate,
      paymentDate: pay.paymentDate || pay.dueDate,
      amount: amountVal,
      documentNumber: pay.invoiceNumber ? `NF ${pay.invoiceNumber}` : `TIT-${idx + 1}`
    });
    lines.push(segJ);

    // Segmento J-52 (Obrigatório Sicoob)
    recordInLot++;
    const segJ52 = buildSegmentoJ52({
      lotNumber: lotNumber,
      recordSequence: recordInLot,
      companyCnpj: company.cnpj,
      companyName: company.name,
      supplierCnpj: pay.cnpj || pay.supplierCnpj || '',
      supplierName: pay.supplier || 'FORNECEDOR'
    });
    lines.push(segJ52);
  });

  // 4. Trailer do Lote (Tipo 5)
  recordInLot++; // Conta o próprio trailer do lote
  const trailerLote = buildTrailerLote({
    lotNumber: lotNumber,
    totalRecordsInLot: recordInLot,
    totalAmount: totalLotAmount
  });
  lines.push(trailerLote);

  // 5. Trailer do Arquivo (Tipo 9)
  const totalRecordsInFile = lines.length + 1; // +1 para o próprio trailer de arquivo
  const trailerArquivo = buildTrailerArquivo({
    totalLots: 1,
    totalRecordsInFile: totalRecordsInFile
  });
  lines.push(trailerArquivo);

  // Formata o nome do arquivo conforme padrão FEBRABAN / Sicoob (ex: SICOOB_REM_20260904_000001.REM)
  const dStr = formatDateDDMMAAAA(generationDate);
  const fileName = `SICOOB_REM_${dStr}_${padNum(fileSequence, 3)}.REM`;
  const cnabContent = lines.join('\r\n') + '\r\n';

  return {
    cnabContent,
    fileName,
    totalAmount: totalLotAmount,
    totalTitles: validPayments.length,
    totalLines: lines.length
  };
}

/**
 * Dispara o download automático do arquivo CNAB .REM no navegador do usuário
 */
export function downloadCnabFile(content, fileName) {
  const blob = new Blob([content], { type: 'text/plain;charset=iso-8859-1' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

