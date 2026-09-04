/**
 * DANFE & NFS-e PDF Parser
 * Extrai dados estruturados de Notas Fiscais Eletrônicas em PDF (DANFE NF-e de produtos e NFS-e de serviços)
 */
import * as pdfjsLib from 'pdfjs-dist';

// Configurar o worker do PDF.js
try {
  if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
  }
} catch (e) {
  console.warn('Não foi possível configurar worker remoto do pdf.js:', e);
}

export async function parseDanfePdf(arrayBuffer) {
  try {
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    let fullText = '';
    const lines = [];

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageItems = textContent.items || [];
      
      let lastY = null;
      let currentLine = '';

      for (const item of pageItems) {
        if (lastY === null || Math.abs(item.transform[5] - lastY) < 4) {
          currentLine += (currentLine ? ' ' : '') + item.str;
        } else {
          if (currentLine.trim()) lines.push(currentLine.trim());
          currentLine = item.str;
        }
        lastY = item.transform[5];
      }
      if (currentLine.trim()) lines.push(currentLine.trim());
      
      const pageText = pageItems.map(item => item.str).join(' ');
      fullText += '\n' + pageText;
    }

    // Identificação de Tipo: Nota de Serviço (NFS-e) vs Nota de Produto (NF-e)
    let isServiceNfse = /NOTA\s+FISCAL\s+(?:DE\s+)?SERVI[ÇC]O/i.test(fullText) ||
                        /NFS-?E\b/i.test(fullText) ||
                        /DANFSE\b/i.test(fullText) ||
                        /DISCRIMINA[ÇC][ÃA]O\s+DOS\s+SERVI[ÇC]OS/i.test(fullText) ||
                        /PRESTADOR\s+(?:DE\s+)?SERVI[ÇC]OS?/i.test(fullText) ||
                        /C[ÓO]DIGO\s+DE\s+VERIFICA[ÇC][ÃA]O/i.test(fullText) ||
                        /PREFEITURA\s+MUNICIPAL/i.test(fullText) ||
                        /SECRETARIA\s+(?:MUNICIPAL\s+)?DE\s+FINAN[ÇC]AS/i.test(fullText) ||
                        /LOCA[ÇC][ÃA]O/i.test(fullText) ||
                        /M[ÁA]QUINAS/i.test(fullText) ||
                        /ISSQN\b/i.test(fullText) ||
                        /TOMADOR\s+(?:DE\s+SERVI[ÇC]OS?)?/i.test(fullText) ||
                        /VALOR\s+DOS\s+SERVI[ÇC]OS/i.test(fullText) ||
                        /FATURA\s+(?:DE\s+)?LOCA[ÇC][ÃA]O/i.test(fullText) ||
                        /RECIBO\s+(?:DE\s+)?LOCA[ÇC][ÃA]O/i.test(fullText);

    // 1. Chave de Acesso (44 dígitos para NF-e) ou Código de Verificação (NFS-e)
    let accessKey = '';
    const cleanDigits = fullText.replace(/[\s\.-]/g, '');
    const keyMatch = cleanDigits.match(/\b\d{44}\b/) || fullText.match(/(?:\d{4}\s+){10}\d{4}/);
    if (keyMatch) {
      accessKey = keyMatch[0].replace(/\s+/g, '');
    } else if (isServiceNfse) {
      const verifMatch = fullText.match(/C[ÓO]DIGO\s+(?:DE\s+)?VERIFICA[ÇC][ÃA]O[:\s]*([A-Z0-9\-_]{4,20})/i) ||
                         fullText.match(/C[ÓO]D\.?\s*VERIFICA[ÇC][ÃA]O[:\s]*([A-Z0-9\-_]{4,20})/i) ||
                         fullText.match(/AUTENTICIDADE[:\s]*([A-Z0-9\-_]{4,20})/i);
      if (verifMatch) {
        accessKey = verifMatch[1].trim();
      }
    }

    // 2. Número da Nota Fiscal (NF-e ou NFS-e)
    let number = '';
    const nfeNumMatch = fullText.match(/N[ºo°\.\s]*([0-9]{1,3}(?:\.[0-9]{3})*|[0-9]{1,9})/i) ||
                        fullText.match(/NF-e\s*N[ºo°\.\s]*([0-9\.]+)/i) ||
                        fullText.match(/NFS-?e\s*N[ºo°\.\s]*([0-9\.]+)/i) ||
                        fullText.match(/N[ÚU]MERO(?:\s+DA\s+NOTA)?[:\s]*([0-9\.]+)/i);
    if (nfeNumMatch) {
      number = nfeNumMatch[1].replace(/\./g, '');
    }

    // 3. Data de Emissão
    let issueDate = new Date().toISOString().substring(0, 10);
    const dateMatch = fullText.match(/DATA\s+(?:DA\s+)?EMISS[ÃA]O[:\s]*([0-9]{2}\/[0-9]{2}\/[0-9]{4})/i) ||
                      fullText.match(/EMISS[ÃA]O[:\s]*([0-9]{2}\/[0-9]{2}\/[0-9]{4})/i) ||
                      fullText.match(/DATA\/HORA\s+DA\s+EMISS[ÃA]O[:\s]*([0-9]{2}\/[0-9]{2}\/[0-9]{4})/i) ||
                      fullText.match(/([0-9]{2}\/[0-9]{2}\/[0-9]{4})/);
    if (dateMatch) {
      const parts = dateMatch[1].split('/');
      if (parts.length === 3) {
        issueDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
    }

    // 4. CNPJs presentes no PDF (o 1º costuma ser o prestador/emitente)
    let supplierCnpj = '';
    const cnpjMatches = fullText.match(/\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}/g) || [];
    if (cnpjMatches.length > 0) {
      supplierCnpj = cnpjMatches[0].replace(/\D/g, '');
    }

    // 5. Nome do Fornecedor / Razão Social
    let supplierName = '';
    const emitMatch = fullText.match(/RECEBEMOS\s+DE\s+([^\.,\n]+)/i) ||
                      fullText.match(/RAZ[ÃA]O\s+SOCIAL[:\s]*([^\n]+)/i) ||
                      fullText.match(/NOME\s*\/\s*RAZ[ÃA]O\s+SOCIAL[:\s]*([^\n]+)/i) ||
                      fullText.match(/PRESTADOR\s+(?:DE\s+SERVI[ÇC]OS?)?[:\s]*([^\n]+)/i);
    if (emitMatch && emitMatch[1]) {
      supplierName = emitMatch[1].trim().replace(/\s{2,}/g, ' ');
    } else {
      // Procura nas primeiras linhas antes do CNPJ
      for (const line of lines.slice(0, 15)) {
        if (line.includes('LTDA') || line.includes('S.A') || line.includes('S/A') || line.includes('COMERCIO') || line.includes('DISTRIBUIDORA') || line.includes('INDUSTRIA') || line.includes('SERVICOS') || line.includes('ENGENHARIA') || line.includes('MEDICA')) {
          supplierName = line.trim();
          break;
        }
      }
    }
    if (!supplierName) {
      supplierName = isServiceNfse ? 'Prestador Identificado via PDF (NFS-e)' : 'Fornecedor Identificado via PDF';
    }

    // 6. Valor Total da Nota
    let totalValue = 0;
    const valMatch = fullText.match(/VALOR\s+TOTAL\s+DA\s+NOTA[:\s]*R?\$?\s*([0-9\.,]+)/i) ||
                     fullText.match(/VALOR\s+(?:L[ÍI]QUIDO|DOS\s+SERVI[ÇC]OS|TOTAL|DA\s+FATURA|COBRADO|DO\s+DOCUMENTO|A\s+PAGAR)[:\s]*R?\$?\s*([0-9\.,]+)/i) ||
                     fullText.match(/V\.?\s*TOTAL\s+DA\s+NOTA[:\s]*R?\$?\s*([0-9\.,]+)/i) ||
                     fullText.match(/TOTAL\s+DA\s+NOTA[:\s]*R?\$?\s*([0-9\.,]+)/i) ||
                     fullText.match(/VALOR\s+TOTAL\s+L[ÍI]QUIDO[:\s]*R?\$?\s*([0-9\.,]+)/i) ||
                     fullText.match(/VALOR\s+L[ÍI]QUIDO\s+DA\s+NOTA[:\s]*R?\$?\s*([0-9\.,]+)/i) ||
                     fullText.match(/VALOR\s+A\s+PAGAR[:\s]*R?\$?\s*([0-9\.,]+)/i) ||
                     fullText.match(/TOTAL\s+(?:G?ERAL|FATURA|A\s+PAGAR)?[:\s]*R?\$?\s*([0-9]{1,3}(?:\.[0-9]{3})*,[0-9]{2})/i);
    if (valMatch) {
      const rawVal = valMatch[1].replace(/\./g, '').replace(',', '.');
      totalValue = parseFloat(rawVal) || 0;
    }

    // 6.1 Discriminação dos Serviços Prestados (caso NFS-e)
    let serviceDescription = '';
    const discMatch = fullText.match(/DISCRIMINA[ÇC][ÃA]O\s+DOS\s+SERVI[ÇC]OS[:\s]*([\s\S]+?)(?=VALOR|RETEN[ÇC][ÕO]ES|C[ÓO]DIGO|IMPOSTOS|BASE\s+DE\s+C[ÁA]LCULO|INFORMA[ÇC][ÕO]ES|DADOS\s+ADICIONAIS|$)/i) ||
                      fullText.match(/DESCRI[ÇC][ÃA]O\s+DOS\s+SERVI[ÇC]OS[:\s]*([\s\S]+?)(?=VALOR|RETEN[ÇC][ÕO]ES|C[ÓO]DIGO|IMPOSTOS|$)/i) ||
                      fullText.match(/DADOS\s+DO\s+SERVI[ÇC]O[:\s]*([\s\S]+?)(?=VALOR|IMPOSTO|$)/i);
    if (discMatch && discMatch[1]) {
      serviceDescription = discMatch[1].trim().replace(/\s{2,}/g, ' ').slice(0, 300);
    }
    if (!serviceDescription && isServiceNfse) {
      serviceDescription = `Prestação de serviços hospitalares/clínicos conforme NFS-e Nº ${number || 'S/N'}`;
    }

    // 7. Faturas / Duplicatas / Parcelas
    let installments = [];

    // 7.1 Busca por seção explícita de Faturas/Duplicatas (DANFE ou NFS-e)
    const faturaSectionMatch = fullText.match(/(?:FATURA|DUPLICATA|PARCELAS|DADOS\s+DA\s+FATURA|CONDI[ÇC][ÕO]ES\s+DE\s+PAGAMENTO)[\s\S]{1,600}?(?=(?:C[ÁA]LCULO\s+DO\s+IMPOSTO|DADOS\s+DO\s+PRODUTO|TRANSPORTADOR|DADOS\s+ADICIONAIS|DISCRIMINA[ÇC][ÃA]O|VALOR\s+TOTAL|$))/i);
    const textToSearchInstallments = faturaSectionMatch ? faturaSectionMatch[0] : fullText;

    // Padrão A: Número + Data + Valor (ex: 001 15/10/2026 1.500,00 ou 1 15/10/2026 R$ 1.500,00)
    const dupRegex = /(?:(\d{1,3}|\d{1,2}\/\d{1,2})\s+)?(\d{2}\/\d{2}\/\d{4})\s+(?:R\$\s*)?([0-9\.,]{3,15})/g;
    let dupMatch;
    const seenInstallments = new Set();

    while ((dupMatch = dupRegex.exec(textToSearchInstallments)) !== null) {
      const dParts = dupMatch[2].split('/');
      const year = parseInt(dParts[2], 10);
      // Validar se é um ano plausível (2020 a 2035)
      if (year >= 2020 && year <= 2035) {
        const dVenc = `${dParts[2]}-${dParts[1]}-${dParts[0]}`;
        const vVal = parseFloat(dupMatch[3].replace(/\./g, '').replace(',', '.')) || 0;
        const key = `${dVenc}_${vVal.toFixed(2)}`;
        
        // Evitar pegar a própria data de emissão com o valor total se houver duplicatas reais
        if (vVal > 0 && !seenInstallments.has(key)) {
          seenInstallments.add(key);
          installments.push({
            installmentNumber: dupMatch[1] || String(installments.length + 1),
            dueDate: dVenc,
            amount: vVal
          });
        }
      }
    }

    // Padrão B: NFS-e comum "Parcela 1: DD/MM/AAAA - R$ X.XXX,XX"
    if (installments.length === 0) {
      const nfseParcRegex = /(?:PARCELA|VENCIMENTO)\s*(?:N[º°]?\s*)?(\d{1,2})?[:\s]+(?:EM\s+)?(\d{2}\/\d{2}\/\d{4})[^\d\n\r]*?(?:R\$\s*)?([0-9\.,]{3,15})/gi;
      let nfseMatch;
      while ((nfseMatch = nfseParcRegex.exec(fullText)) !== null) {
        const dParts = nfseMatch[2].split('/');
        const year = parseInt(dParts[2], 10);
        if (year >= 2020 && year <= 2035) {
          const dVenc = `${dParts[2]}-${dParts[1]}-${dParts[0]}`;
          const vVal = parseFloat(nfseMatch[3].replace(/\./g, '').replace(',', '.')) || 0;
          const key = `${dVenc}_${vVal.toFixed(2)}`;
          if (vVal > 0 && !seenInstallments.has(key)) {
            seenInstallments.add(key);
            installments.push({
              installmentNumber: nfseMatch[1] || String(installments.length + 1),
              dueDate: dVenc,
              amount: vVal
            });
          }
        }
      }
    }

    // Padrão C: Se o texto mencionar prazo (ex: "30 / 60 / 90 DIAS" ou "28 / 56 DIAS") e valor total existe mas sem parcelas explícitas
    if (installments.length === 0 && totalValue > 0) {
      const daysPattern = fullText.match(/(\d{1,3})\s*\/\s*(\d{1,3})(?:\s*\/\s*(\d{1,3}))?(?:\s*\/\s*(\d{1,3}))?\s*(?:DIAS|DD)/i);
      if (daysPattern) {
        const days = [daysPattern[1], daysPattern[2], daysPattern[3], daysPattern[4]].filter(Boolean).map(Number);
        if (days.length > 1) {
          const baseDate = issueDate ? new Date(issueDate) : new Date();
          const partVal = Math.round((totalValue / days.length) * 100) / 100;
          let sumParts = 0;
          days.forEach((dayOffset, idx) => {
            const dueDate = new Date(baseDate);
            dueDate.setDate(dueDate.getDate() + dayOffset);
            const thisVal = (idx === days.length - 1) ? Math.round((totalValue - sumParts) * 100) / 100 : partVal;
            sumParts += thisVal;
            installments.push({
              installmentNumber: `${idx + 1}/${days.length}`,
              dueDate: dueDate.toISOString().substring(0, 10),
              amount: thisVal
            });
          });
        }
      }
    }

    // Formatar número da parcela com padrão "1/N, 2/N, 3/N" se houver mais de uma
    if (installments.length > 1) {
      installments = installments.map((inst, idx) => ({
        ...inst,
        installmentNumber: inst.installmentNumber && inst.installmentNumber.includes('/') 
          ? inst.installmentNumber 
          : `${idx + 1}/${installments.length}`
      }));
    }

    // Fallback de Valor Total: Se o cabeçalho não continha o valor total mas as parcelas foram encontradas
    const sumInstallments = installments.reduce((acc, inst) => acc + (parseFloat(inst.amount) || 0), 0);
    if (totalValue <= 0 && sumInstallments > 0) {
      totalValue = sumInstallments;
    }

    // 8. Itens / Produtos da Nota
    const items = [];
    if (!isServiceNfse) {
      // Procura linhas com padrão de produtos (Código, Descrição, Qtd, Valor)
      const itemRegex = /(?:^|\n)\s*([A-Z0-9\-_]{2,15})\s+([A-Z0-9\s\/\.,\-\(\)]+?)\s+(?:[0-9]{8}\s+)?[0-9]{3,4}\s+[A-Z0-9]{2,4}\s+([0-9\.,]+)\s+([0-9\.,]+)\s+([0-9\.,]+)/gi;
      let itemMatch;
      while ((itemMatch = itemRegex.exec(fullText)) !== null) {
        const code = itemMatch[1].trim();
        const desc = itemMatch[2].trim().replace(/\s{2,}/g, ' ');
        const qty = parseFloat(itemMatch[3].replace(/\./g, '').replace(',', '.')) || 1;
        const unitVal = parseFloat(itemMatch[4].replace(/\./g, '').replace(',', '.')) || 0;
        const totalItemVal = parseFloat(itemMatch[5].replace(/\./g, '').replace(',', '.')) || (qty * unitVal);

        if (desc.length > 2 && !desc.toUpperCase().includes('VALOR') && !desc.toUpperCase().includes('BASE')) {
          items.push({
            xmlCode: code,
            xmlName: desc,
            quantity: qty,
            price: unitVal,
            total: totalItemVal,
            batch: '',
            expiryDate: ''
          });
        }
      }

      // Se nenhum item detalhado foi encontrado e não há chave de 44 dígitos,
      // classifica como NFS-e / Serviços para não forçar mapeamento de estoque!
      if (items.length === 0 && !keyMatch) {
        isServiceNfse = true;
      }
    }

    if (isServiceNfse) {
      if (!serviceDescription) {
        serviceDescription = `Prestação de serviços conforme documento Nº ${number || 'S/N'} (${supplierName})`;
      }
    }

    const defaultDueDate = new Date();
    defaultDueDate.setDate(defaultDueDate.getDate() + 30);

    const calculatedTotal = totalValue > 0 ? totalValue : (sumInstallments > 0 ? sumInstallments : 0);

    return {
      number: number || String(Math.floor(100000 + Math.random() * 900000)),
      accessKey: accessKey || '',
      issueDate: issueDate,
      totalValue: calculatedTotal,
      supplierName: supplierName,
      supplierCnpj: supplierCnpj,
      items: isServiceNfse ? [] : items,
      installments: installments.length > 0 ? installments : [{
        installmentNumber: '1/1',
        dueDate: defaultDueDate.toISOString().substring(0, 10),
        amount: calculatedTotal
      }],
      sourceType: 'PDF',
      invoiceType: isServiceNfse ? 'service' : 'product',
      serviceDescription: serviceDescription || ''
    };
  } catch (error) {
    console.error('Erro ao fazer parse do PDF DANFE/NFS-e:', error);
    throw new Error('Não foi possível ler os dados do PDF. Verifique se é um arquivo DANFE ou NFS-e válido.');
  }
}
