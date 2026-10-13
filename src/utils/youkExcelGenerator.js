/**
 * youkExcelGenerator.js
 * Gera a planilha no formato exato esperado pelo sistema YOUK (Layout ReciboPgAlterdata_Youk_9.0)
 * Baseado na especificação oficial de 79 colunas.
 */

import * as XLSX from 'xlsx';

// Cabeçalhos exatos com a mesma quantidade de espaços que a planilha de homologação do Youk
export const YOUK_HEADERS = [
  'MES      ',
  'ANO      ',
  'TIPO_RECIBO       ',
  'CNPJ',
  'EMPRESA_RAZAO_SOCIAL',
  'NOME_COMPLETO_TRABALHADOR',
  'CPF',
  'CELULAR      ',
  'EMAIL     ',
  'DATA_NASCIMENTO',
  'DATA_PAGAMENTO',
  'VALOR_SALARIO',
  'FILIAL',
  'REGIME_CONTRATAÇÃO',
  'APRENDIZ',
  'DEFICIENCIA',
  'CARGO_FUNCAO',
  'CBO',
  'CARGA_HORARIA',
  'DATA_ADMISSAO',
  'MENSAGEM_HOLERITE',
  'NOME_BANCO',
  'NUMERO_AGENCIA',
  'NUMERO_CONTA',
  'FORMA_PAGAMENTO',
  'TIPO_CONTA ',
  'MATRICULA',
  'DATA_INICIO_FERIAS_GOZADAS',
  'DATA_FIM_FERIAS_GOZADAS',
  'DATA_RESCISAO',
  'TIPO_AFASTAMENTO',
  'DIAS_AFASTAMENTO',
  'DATA_INICIO_AFASTAMENTO',
  'DATA_FIM_AFASTAMENTO',
  'NATURALIDADE',
  'PIS              ',
  'CTPS      ',
  'SERIE_CTPS',
  'CTPS_UF',
  'RG       ',
  'RG_UF     ',
  'ESTADO_CIVIL      ',
  'SEXO       ',
  'NOME_COMPLETO_MAE',
  'NOME_COMPLETO_PAI',
  'MUNICIPIO',
  'MUNICIPIO_UF',
  'CEP          ',
  'LOGRADOURO',
  'LOGRADOURO_NUMERO',
  'BAIRRO',
  'TELEFONE_RESIDENCIA',
  'MUNICIPIO_EMPRESA',
  'MUNICIPIO_UF_EMPRESA',
  'CEP_EMPRESA',
  'LOGRADOURO_EMPRESA       ',
  'LOGRADOURO_NUMERO_EMPRESA',
  'BAIRRO_EMPRESA     ',
  'LOTACAO_DEPARTAMENTO',
  'CNPJ TOMADOR_SERVICO',
  'TOMADOR_SERVICO    ',
  'REGIME_JURIDICO    ',
  'CLASSE_NIVEL    ',
  'VALOR_BASE_FGTS',
  'VALOR_INSS',
  'VALOR_BASE_INSS',
  'VALOR_FGTS',
  'BASE_IRRF',
  'QTD_DEPENDENTES_IRRF',
  'QTD_DEPENDENTES_SALARIO_FAMILIA',
  'CODIGO_VERBA',
  'DESCRICAO_VERBA',
  'PERCENTUAL_VERBA',
  'QUANTIDADE_REFERENCIA',
  'VALOR_PROVENTOS',
  'VALOR_DESCONTOS',
  'VALOR_TOTAL_VERBA_PROVENTOS',
  'VALOR_TOTAL_VERBA_DESCONTOS',
  'VALOR_LIQUIDO'
];

export function formatCurrencyBR(val) {
  if (val === null || val === undefined || val === '') return '0,00';
  const num = typeof val === 'number' ? val : parseFloat(String(val).replace(/[^\d.-]/g, '').replace(',', '.')) || 0;
  return num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function formatDateBR(dateVal) {
  if (!dateVal) return '';
  if (typeof dateVal === 'string') {
    const cleanStr = dateVal.trim();
    if (/^\d{4}-\d{2}-\d{2}/.test(cleanStr)) {
      const [year, month, day] = cleanStr.substring(0, 10).split('-');
      return `${day}/${month}/${year}`;
    }
    if (/^\d{2}\/\d{2}\/\d{4}/.test(cleanStr)) {
      return cleanStr;
    }
  }
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('pt-BR');
}

/**
 * Converte os itens de holerite processados na matriz de dados para exportação no Youk
 */
export function buildYoukSpreadsheetRows(payslips) {
  const rows = [];

  for (const ps of payslips) {
    const emp = ps.matchedEmployee || {};

    const mes = String(ps.month || '01').padStart(2, '0');
    const ano = String(ps.year || new Date().getFullYear());
    const tipoRecibo = ps.receiptType || 'Demonstrativo de Pagamento';
    const cnpj = ps.companyCnpj || '58.476.786/0001-06';
    const nomeTrabalhador = emp.name || ps.employeeName || '';
    const cpf = emp.cpf || ps.cpf || '';
    const celular = emp.phone || '';
    const email = emp.email || '';
    const dataNasc = formatDateBR(emp.birthDate || '');
    const dataPagto = formatDateBR(ps.paymentDate || new Date());
    const salarioBase = formatCurrencyBR(ps.baseSalary || emp.salary || 0);
    const filial = '1';
    const regimeContratacao = emp.contractType || ps.contractType || 'Empregado';
    const aprendiz = 'Não';
    const deficiencia = 'Não';
    const cargoFuncao = ps.role || emp.role || '';
    const cbo = ps.cbo || '322205';
    const cargaHoraria = emp.workSchedule?.includes('12X36') ? '180' : '220';
    const dataAdmissao = formatDateBR(ps.admissionDate || emp.admissionDate || '');
    const msgHolerite = '';
    const nomeBanco = emp.bankName || '';
    const agencia = emp.bankAgency || '';
    const conta = emp.bankAccount || '';
    const formaPagto = emp.bankAccount ? 'Crédito em Conta' : '';
    const tipoConta = emp.bankAccount ? 'Corrente' : '';
    const matricula = String(ps.employeeCode || emp.registration || emp.code || '000001').padStart(6, '0');
    
    // Dados de endereço e empresa
    const municipio = emp.city || 'Betim';
    const municipioUf = emp.state || 'MG';
    const cep = emp.cep || '';
    const logradouro = emp.address || '';
    const logradouroNum = '';
    const bairro = '';
    const municipioEmpresa = 'Betim';
    const municipioUfEmpresa = 'MG';
    const cepEmpresa = '32600-000';
    const logradouroEmpresa = 'Avenida Governador Valadares, 100';
    const bairroEmpresa = 'Centro';
    const departamento = ps.department || emp.sectorId || '1';

    // Bases e Totais
    const valorBaseFgts = ps.baseFgts || 0;
    const inssVerba = ps.events.find(ev => ev.code === '998' || ev.description.includes('INSS'));
    const valorInss = inssVerba ? inssVerba.discounts : 0;
    const valorBaseInss = ps.baseInss || 0;
    const valorFgts = ps.fgtsValue || 0;
    const baseIrrf = ps.baseIrrf || 0;
    const totalVencimentos = ps.grossEarnings || 0;
    const totalDescontos = ps.totalDiscounts || 0;
    const valorLiquido = ps.netSalary || 0;

    // Se o holerite tiver eventos/verbas, gera uma linha para cada verba
    const events = ps.events && ps.events.length > 0 ? ps.events : [{
      code: '8781',
      description: 'SALARIO BASE',
      reference: '30,00',
      earnings: ps.grossEarnings,
      discounts: 0
    }];

    for (const ev of events) {
      const row = [
        mes,                              // 0: MES
        ano,                              // 1: ANO
        tipoRecibo,                       // 2: TIPO_RECIBO
        cnpj,                             // 3: CNPJ
        razaoSocial,                      // 4: EMPRESA_RAZAO_SOCIAL
        nomeTrabalhador,                  // 5: NOME_COMPLETO_TRABALHADOR
        cpf,                              // 6: CPF
        celular,                          // 7: CELULAR
        email,                            // 8: EMAIL
        dataNasc,                         // 9: DATA_NASCIMENTO
        dataPagto,                        // 10: DATA_PAGAMENTO
        salarioBase,                      // 11: VALOR_SALARIO
        filial,                           // 12: FILIAL
        regimeContratacao,                // 13: REGIME_CONTRATAÇÃO
        aprendiz,                         // 14: APRENDIZ
        deficiencia,                      // 15: DEFICIENCIA
        cargoFuncao,                      // 16: CARGO_FUNCAO
        cbo,                              // 17: CBO
        cargaHoraria,                     // 18: CARGA_HORARIA
        dataAdmissao,                     // 19: DATA_ADMISSAO
        msgHolerite,                      // 20: MENSAGEM_HOLERITE
        nomeBanco,                        // 21: NOME_BANCO
        agencia,                          // 22: NUMERO_AGENCIA
        conta,                            // 23: NUMERO_CONTA
        formaPagto,                       // 24: FORMA_PAGAMENTO
        tipoConta,                        // 25: TIPO_CONTA
        matricula,                        // 26: MATRICULA
        '',                               // 27: DATA_INICIO_FERIAS_GOZADAS
        '',                               // 28: DATA_FIM_FERIAS_GOZADAS
        '',                               // 29: DATA_RESCISAO
        '',                               // 30: TIPO_AFASTAMENTO
        '',                               // 31: DIAS_AFASTAMENTO
        '',                               // 32: DATA_INICIO_AFASTAMENTO
        '',                               // 33: DATA_FIM_AFASTAMENTO
        '',                               // 34: NATURALIDADE
        emp.pis || '',                    // 35: PIS
        emp.ctps || '',                   // 36: CTPS
        emp.serieCtps || '',              // 37: SERIE_CTPS
        'MG',                             // 38: CTPS_UF
        emp.rg || '',                     // 39: RG
        'MG',                             // 40: RG_UF
        emp.maritalStatus || '',          // 41: ESTADO_CIVIL
        emp.gender || '',                 // 42: SEXO
        emp.motherName || '',             // 43: NOME_COMPLETO_MAE
        '',                               // 44: NOME_COMPLETO_PAI
        municipio,                        // 45: MUNICIPIO
        municipioUf,                      // 46: MUNICIPIO_UF
        cep,                              // 47: CEP
        logradouro,                       // 48: LOGRADOURO
        logradouroNum,                    // 49: LOGRADOURO_NUMERO
        bairro,                           // 50: BAIRRO
        '',                               // 51: TELEFONE_RESIDENCIA
        municipioEmpresa,                 // 52: MUNICIPIO_EMPRESA
        municipioUfEmpresa,               // 53: MUNICIPIO_UF_EMPRESA
        cepEmpresa,                       // 54: CEP_EMPRESA
        logradouroEmpresa,                // 55: LOGRADOURO_EMPRESA
        '100',                            // 56: LOGRADOURO_NUMERO_EMPRESA
        bairroEmpresa,                    // 57: BAIRRO_EMPRESA
        departamento,                     // 58: LOTACAO_DEPARTAMENTO
        '',                               // 59: CNPJ TOMADOR_SERVICO
        '',                               // 60: TOMADOR_SERVICO
        'CLT',                            // 61: REGIME_JURIDICO
        '',                               // 62: CLASSE_NIVEL
        valorBaseFgts,                    // 63: VALOR_BASE_FGTS
        valorInss,                        // 64: VALOR_INSS
        valorBaseInss,                    // 65: VALOR_BASE_INSS
        valorFgts,                        // 66: VALOR_FGTS
        baseIrrf,                         // 67: BASE_IRRF
        emp.dependents?.length || 0,      // 68: QTD_DEPENDENTES_IRRF
        0,                                // 69: QTD_DEPENDENTES_SALARIO_FAMILIA
        String(ev.code || '').trim(),     // 70: CODIGO_VERBA
        String(ev.description || '').trim(), // 71: DESCRICAO_VERBA
        '0',                              // 72: PERCENTUAL_VERBA
        ev.reference || 0,                // 73: QUANTIDADE_REFERENCIA
        ev.earnings ? formatCurrencyBR(ev.earnings) : '0,00', // 74: VALOR_PROVENTOS
        ev.discounts ? formatCurrencyBR(ev.discounts) : '0,00', // 75: VALOR_DESCONTOS
        totalVencimentos,                 // 76: VALOR_TOTAL_VERBA_PROVENTOS
        totalDescontos,                   // 77: VALOR_TOTAL_VERBA_DESCONTOS
        valorLiquido                      // 78: VALOR_LIQUIDO
      ];

      rows.push(row);
    }
  }

  return rows;
}

/**
 * Cria o arquivo XLSX e realiza o download direto no navegador
 */
export function exportYoukExcelFile(payslips, customFileName = '') {
  const dataRows = buildYoukSpreadsheetRows(payslips);

  // Matriz completa: Cabeçalho na linha 1 + Dados nas linhas seguintes
  const sheetData = [YOUK_HEADERS, ...dataRows];

  // Cria a planilha e o workbook
  const worksheet = XLSX.utils.aoa_to_sheet(sheetData);

  // Ajuste automático de largura das colunas
  const colWidths = YOUK_HEADERS.map((h, i) => {
    let maxLen = h.length;
    for (let r = 0; r < Math.min(dataRows.length, 50); r++) {
      const val = dataRows[r][i];
      if (val !== null && val !== undefined) {
        maxLen = Math.max(maxLen, String(val).length);
      }
    }
    return { wch: Math.min(maxLen + 2, 40) };
  });
  worksheet['!cols'] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'ReciboPgAlterdata_Youk_9.0');

  // Nome do arquivo padrão: ReciboPg_Youk_MM_AAAA.xlsx
  const sample = payslips[0] || {};
  const mes = sample.month || '09';
  const ano = sample.year || new Date().getFullYear();
  const fileName = customFileName || `ReciboPg_Youk_${mes}_${ano}.xlsx`;

  // Dispara o download
  XLSX.writeFile(workbook, fileName);
  return fileName;
}
