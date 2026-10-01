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
    let fullText = '';
    const lines = [];

    // 1. Extração via PDF.js com timeout de 3.5 segundos para evitar qualquer travamento
    try {
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout no PDF.js')), 3500)
      );
      const pdf = await Promise.race([loadingTask.promise, timeoutPromise]);
      
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
    } catch (loadErr) {
      console.warn('PDF.js expirou ou falhou, acionando fallback de decodificação direta:', loadErr);
      try {
        const decoder = new TextDecoder('latin1');
        fullText = decoder.decode(arrayBuffer);
        lines.push(...fullText.split(/[\r\n]+/).map(l => l.trim()).filter(Boolean));
      } catch (decErr) {
        console.error('Falha no fallback:', decErr);
      }
    }

    // 2. Identificação de Tipo: Nota de Serviço (NFS-e / Fatura / Conta Azul) vs Nota de Produto (NF-e)
    let isServiceNfse = /NOTA\s+FISCAL\s+(?:DE\s+)?SERVI[ÇC]O/i.test(fullText) ||
                        /NFS-?E\b/i.test(fullText) ||
                        /DANFSE\b/i.test(fullText) ||
                        /FATURA\b/i.test(fullText) ||
                        /CONTA\s*AZUL/i.test(fullText) ||
                        /COBRAN[ÇC]A/i.test(fullText) ||
                        /CONSULTORIA/i.test(fullText) ||
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
                        /RECIBO\s+(?:DE\s+)?(?:LOCA[ÇC][ÃA]O|SERVI[ÇC]O)/i.test(fullText);

    // 3. Chave de Acesso (44 dígitos para NF-e) ou Código de Verificação (NFS-e)
    let accessKey = '';
    const cleanDigits = fullText.replace(/[\s\.-]/g, '');
    const keyMatch = cleanDigits.match(/\b\d{44}\b/) || fullText.match(/(?:\d{4}\s+){10}\d{4}/);
    if (keyMatch) {
      accessKey = keyMatch[0].replace(/\s+/g, '');
    } else if (isServiceNfse) {
      const verifMatch = fullText.match(/(?:C[ÓO]DIGO|C[ÓO]D\.?)\s+(?:DE\s+)?VERIFICA[ÇC][ÃA]O[:\s]*([A-Z0-9\-_]{4,25})/i) ||
                         fullText.match(/AUTENTICIDADE[:\s]*([A-Z0-9\-_]{4,25})/i);
      if (verifMatch) {
        accessKey = verifMatch[1].trim();
      }
    }

    // 4. Número do Documento Fiscal (prioriza campos formais de Fatura/Venda/NFS-e)
    let number = '';
    const vendaMatch = fullText.match(/VENDA\s*[:\s]*([0-9]{3,9})/i);
    const faturaNumMatch = fullText.match(/(?:FATURA|DUPLICATA|RECIBO)\s*(?:N[ºo°\.\s:]*|NUMERO[:\s]*)([0-9]{1,9})/i);
    const nfseNumMatch = fullText.match(/NFS-?e\s*(?:N[ºo°\.\s:]*|NUMERO[:\s]*)([0-9\.]+)/i);
    const nfeNumMatch = fullText.match(/NF-?e\s*(?:N[ºo°\.\s:]*|NUMERO[:\s]*)([0-9\.]+)/i);
    const nossoNumMatch = fullText.match(/NOSSO\s+N[ÚU]MERO[:\s]*([0-9]{1,15})/i);
    const docNumMatch = fullText.match(/N[ÚU]MERO(?:\s+DA\s+NOTA|\s+DA\s+FATURA|\s+DO\s+DOC(?:UMENTO)?)?[:\s]*([0-9\.]+)/i);

    if (vendaMatch) {
      number = vendaMatch[1];
    } else if (faturaNumMatch) {
      number = faturaNumMatch[1];
    } else if (nfseNumMatch) {
      number = nfseNumMatch[1].replace(/\./g, '');
    } else if (nossoNumMatch) {
      number = String(parseInt(nossoNumMatch[1], 10));
    } else if (nfeNumMatch) {
      number = nfeNumMatch[1].replace(/\./g, '');
    } else if (docNumMatch) {
      number = docNumMatch[1].replace(/\./g, '');
    }

    // 5. Data de Emissão (suporta "Emissão em DD/MM/AAAA" e variações)
    const nowLocal = new Date();
    const todayLocalStr = `${nowLocal.getFullYear()}-${String(nowLocal.getMonth() + 1).padStart(2, '0')}-${String(nowLocal.getDate()).padStart(2, '0')}`;
    let issueDate = todayLocalStr;

    const emissaoMatch = fullText.match(/EMISS[ÃA]O\s*(?:EM|DE|:)?\s*([0-9]{2}[\/\.-][0-9]{2}[\/\.-][0-9]{4})/i) ||
                         fullText.match(/DATA\s+(?:DA\s+)?EMISS[ÃA]O[:\s]*([0-9]{2}[\/\.-][0-9]{2}[\/\.-][0-9]{4})/i) ||
                         fullText.match(/DATA\/HORA\s+DA\s+EMISS[ÃA]O[:\s]*([0-9]{2}[\/\.-][0-9]{2}[\/\.-][0-9]{4})/i) ||
                         fullText.match(/([0-9]{2}\/[0-9]{2}\/[0-9]{4})/);
    if (emissaoMatch) {
      const parts = emissaoMatch[1].replace(/[\.-]/g, '/').split('/');
      if (parts.length === 3) {
        issueDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
      }
    }

    // 6. CNPJ do Fornecedor / Prestador (exclui tomador e intermediadores de pagamento)
    let supplierCnpj = '';
    const cnpjMatches = fullText.match(/\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}/g) || [];
    const nonDializeCnpjs = cnpjMatches.filter(c => !c.includes('58.476.786') && !c.includes('05.206.246'));
    if (nonDializeCnpjs.length > 0) {
      supplierCnpj = nonDializeCnpjs[0].replace(/\D/g, '');
    } else if (cnpjMatches.length > 0) {
      supplierCnpj = cnpjMatches[0].replace(/\D/g, '');
    }

    // 7. Nome do Fornecedor / Razão Social
    let supplierName = '';
    const emitMatch = fullText.match(/SACADOR\s*\/\s*AVALISTA[:\s]*([^\n\r]+)/i) ||
                      fullText.match(/PRESTADOR\s+(?:DE\s+SERVI[ÇC]OS?)?[:\s]*([^\n\r]+)/i) ||
                      fullText.match(/RECEBEMOS\s+DE\s+([^\.,\n]+)/i) ||
                      fullText.match(/RAZ[ÃA]O\s+SOCIAL[:\s]*([^\n]+)/i) ||
                      fullText.match(/NOME\s*\/\s*RAZ[ÃA]O\s+SOCIAL[:\s]*([^\n]+)/i);
    if (emitMatch && emitMatch[1]) {
      supplierName = emitMatch[1].trim().replace(/\s{2,}/g, ' ');
    } else {
      for (const line of lines.slice(0, 15)) {
        const uLine = line.toUpperCase();
        if ((uLine.includes('LTDA') || uLine.includes('S.A') || uLine.includes('S/A') || uLine.includes('CONSULTORIA') || uLine.includes('COMERCIO') || uLine.includes('DISTRIBUIDORA') || uLine.includes('INDUSTRIA') || uLine.includes('SERVICOS') || uLine.includes('ENGENHARIA') || uLine.includes('MEDICA')) &&
            !uLine.includes('DIALIZE') && !uLine.includes('CONTA AZUL INSTITUICAO')) {
          supplierName = line.trim();
          break;
        }
      }
    }
    if (!supplierName) {
      supplierName = isServiceNfse ? 'Prestador Identificado via PDF (NFS-e)' : 'Fornecedor Identificado via PDF';
    }

    // 8. Valor Total do Documento
    let totalValue = 0;
    const valMatch = fullText.match(/VALOR\s+(?:DO\s+DOC(?:UMENTO)?|A\s+PAGAR|DA\s+FATURA|DOS\s+SERVI[ÇC]OS|TOTAL)[:\s]*R?\$?\s*([0-9\.,]+)/i) ||
                     fullText.match(/VALOR\s+TOTAL\s+DA\s+NOTA[:\s]*R?\$?\s*([0-9\.,]+)/i) ||
                     fullText.match(/VALOR\s+(?:L[ÍI]QUIDO|COBRADO)[:\s]*R?\$?\s*([0-9\.,]+)/i) ||
                     fullText.match(/TOTAL\s+DA\s+NOTA[:\s]*R?\$?\s*([0-9\.,]+)/i) ||
                     fullText.match(/VALOR\s+TOTAL\s+L[ÍI]QUIDO[:\s]*R?\$?\s*([0-9\.,]+)/i) ||
                     fullText.match(/(?:VALOR|FATURA|TOTAL)\s*[:\s]*R\$\s*([0-9\.,]+)/i) ||
                     fullText.match(/R\$\s*([0-9]{1,3}(?:\.[0-9]{3})*,[0-9]{2})/);
    if (valMatch) {
      const rawVal = valMatch[1].replace(/\./g, '').replace(',', '.');
      totalValue = parseFloat(rawVal) || 0;
    }

    // 8.1 Discriminação dos Serviços
    let serviceDescription = '';
    const discMatch = fullText.match(/DISCRIMINA[ÇC][ÃA]O\s+DOS\s+SERVI[ÇC]OS[:\s]*([\s\S]+?)(?=VALOR|RETEN[ÇC][ÕO]ES|C[ÓO]DIGO|IMPOSTOS|BASE\s+DE\s+C[ÁA]LCULO|INFORMA[ÇC][ÕO]ES|DADOS\s+ADICIONAIS|$)/i) ||
                      fullText.match(/DESCRI[ÇC][ÃA]O\s+DOS\s+SERVI[ÇC]OS[:\s]*([\s\S]+?)(?=VALOR|RETEN[ÇC][ÕO]ES|C[ÓO]DIGO|IMPOSTOS|$)/i) ||
                      fullText.match(/DADOS\s+DO\s+SERVI[ÇC]O[:\s]*([\s\S]+?)(?=VALOR|IMPOSTO|$)/i);
    if (discMatch && discMatch[1]) {
      serviceDescription = discMatch[1].trim().replace(/\s{2,}/g, ' ').slice(0, 300);
    }
    if (!serviceDescription && isServiceNfse) {
      serviceDescription = `Prestação de serviços conforme documento Nº ${number || 'S/N'} (${supplierName})`;
    }

    // 8.2 Linha Digitável do Boleto Embutido (se presente no próprio PDF da nota/fatura)
    let embeddedDigitableLine = '';
    const boletoMatch = fullText.match(/(\d{5}[\.\s]?\d{5}\s+\d{5}[\.\s]?\d{6}\s+\d{5}[\.\s]?\d{6}\s+\d\s+\d{14})/) ||
                        fullText.match(/\b(7759\d{43})\b/) ||
                        fullText.match(/\b(\d{47,48})\b/);
    if (boletoMatch) {
      embeddedDigitableLine = boletoMatch[1].replace(/\D/g, '');
    }

    // 9. Faturas / Duplicatas / Parcelas
    let installments = [];
    const faturaSectionMatch = fullText.match(/(?:FATURA|DUPLICATA|PARCELAS|DADOS\s+DA\s+FATURA|CONDI[ÇC][ÕO]ES\s+DE\s+PAGAMENTO)[\s\S]{1,600}?(?=(?:C[ÁA]LCULO\s+DO\s+IMPOSTO|DADOS\s+DO\s+PRODUTO|TRANSPORTADOR|DADOS\s+ADICIONAIS|DISCRIMINA[ÇC][ÃA]O|VALOR\s+TOTAL|$))/i);
    const textToSearchInstallments = faturaSectionMatch ? faturaSectionMatch[0] : fullText;

    const dupRegex = /(?:(\d{1,3}|\d{1,2}\/\d{1,2})\s+)?(\d{2}\/\d{2}\/\d{4})\s+(?:R\$\s*)?([0-9\.,]{3,15})/g;
    let dupMatch;
    const seenInstallments = new Set();

    while ((dupMatch = dupRegex.exec(textToSearchInstallments)) !== null) {
      const dParts = dupMatch[2].split('/');
      const year = parseInt(dParts[2], 10);
      if (year >= 2020 && year <= 2035) {
        const dVenc = `${dParts[2]}-${dParts[1].padStart(2, '0')}-${dParts[0].padStart(2, '0')}`;
        const vVal = parseFloat(dupMatch[3].replace(/\./g, '').replace(',', '.')) || 0;
        const key = `${dVenc}_${vVal.toFixed(2)}`;
        
        if (vVal > 0 && !seenInstallments.has(key)) {
          seenInstallments.add(key);
          installments.push({
            installmentNumber: dupMatch[1] || String(installments.length + 1),
            dueDate: dVenc,
            amount: vVal,
            digitableLine: embeddedDigitableLine || ''
          });
        }
      }
    }

    // Padrão B: NFS-e / Fatura "Vencimento em DD/MM/AAAA"
    if (installments.length === 0) {
      const singleVencMatch = fullText.match(/VENCIMENTO\s*(?:EM|DE|:)?\s*([0-9]{2}[\/\.-][0-9]{2}[\/\.-][0-9]{4})/i) ||
                              fullText.match(/DATA\s+(?:DE\s+)?VENCIMENTO[:\s]*([0-9]{2}[\/\.-][0-9]{2}[\/\.-][0-9]{4})/i);
      if (singleVencMatch) {
        const dParts = singleVencMatch[1].replace(/[\.-]/g, '/').split('/');
        const year = parseInt(dParts[2], 10);
        if (year >= 2020 && year <= 2035) {
          const dVenc = `${dParts[2]}-${dParts[1].padStart(2, '0')}-${dParts[0].padStart(2, '0')}`;
          installments.push({
            installmentNumber: '1/1',
            dueDate: dVenc,
            amount: totalValue,
            digitableLine: embeddedDigitableLine || ''
          });
        }
      }
    }

    // Formatar número da parcela com padrão "1/N, 2/N, 3/N"
    if (installments.length > 1) {
      installments = installments.map((inst, idx) => ({
        ...inst,
        installmentNumber: inst.installmentNumber && inst.installmentNumber.includes('/') 
          ? inst.installmentNumber 
          : `${idx + 1}/${installments.length}`
      }));
    }

    const sumInstallments = installments.reduce((acc, inst) => acc + (parseFloat(inst.amount) || 0), 0);
    if (totalValue <= 0 && sumInstallments > 0) {
      totalValue = sumInstallments;
    }

    // 10. Itens de Produtos (apenas para notas físicas de produto)
    const items = [];
    if (!isServiceNfse) {
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

      if (items.length === 0 && !keyMatch) {
        isServiceNfse = true;
      }
    }

    if (isServiceNfse && !serviceDescription) {
      serviceDescription = `Prestação de serviços conforme documento Nº ${number || 'S/N'} (${supplierName})`;
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
        amount: calculatedTotal,
        digitableLine: embeddedDigitableLine || ''
      }],
      sourceType: 'PDF',
      invoiceType: isServiceNfse ? 'service' : 'product',
      serviceDescription: serviceDescription || '',
      digitableLine: embeddedDigitableLine || ''
    };
  } catch (error) {
    console.error('Erro ao fazer parse do PDF DANFE/NFS-e:', error);
    throw new Error('Não foi possível ler os dados do PDF. Verifique se é um arquivo DANFE ou NFS-e válido.');
  }
}
