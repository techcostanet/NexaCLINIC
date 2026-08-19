/**
 * DANFE PDF Parser
 * Extrai dados estruturados de Notas Fiscais Eletrônicas em PDF (DANFE)
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

    // 1. Chave de Acesso (44 dígitos)
    let accessKey = '';
    const cleanDigits = fullText.replace(/[\s\.-]/g, '');
    const keyMatch = cleanDigits.match(/\b\d{44}\b/) || fullText.match(/(?:\d{4}\s+){10}\d{4}/);
    if (keyMatch) {
      accessKey = keyMatch[0].replace(/\s+/g, '');
    }

    // 2. Número da Nota Fiscal (NF-e Nº)
    let number = '';
    const nfeNumMatch = fullText.match(/N[ºo°\.\s]*([0-9]{1,3}(?:\.[0-9]{3})*|[0-9]{1,9})/i) ||
                        fullText.match(/NF-e\s*N[ºo°\.\s]*([0-9\.]+)/i) ||
                        fullText.match(/N[ÚU]MERO[:\s]*([0-9\.]+)/i);
    if (nfeNumMatch) {
      number = nfeNumMatch[1].replace(/\./g, '');
    }

    // 3. Data de Emissão
    let issueDate = new Date().toISOString().substring(0, 10);
    const dateMatch = fullText.match(/DATA\s+(?:DA\s+)?EMISS[ÃA]O[:\s]*([0-9]{2}\/[0-9]{2}\/[0-9]{4})/i) ||
                      fullText.match(/EMISS[ÃA]O[:\s]*([0-9]{2}\/[0-9]{2}\/[0-9]{4})/i) ||
                      fullText.match(/([0-9]{2}\/[0-9]{2}\/[0-9]{4})/);
    if (dateMatch) {
      const parts = dateMatch[1].split('/');
      if (parts.length === 3) {
        issueDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
    }

    // 4. CNPJs presentes no PDF (o 1º costuma ser o emitente)
    let supplierCnpj = '';
    const cnpjMatches = fullText.match(/\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}/g) || [];
    if (cnpjMatches.length > 0) {
      supplierCnpj = cnpjMatches[0].replace(/\D/g, '');
    }

    // 5. Nome do Fornecedor / Razão Social
    let supplierName = '';
    const emitMatch = fullText.match(/RECEBEMOS\s+DE\s+([^\.,\n]+)/i) ||
                      fullText.match(/RAZ[ÃA]O\s+SOCIAL[:\s]*([^\n]+)/i);
    if (emitMatch && emitMatch[1]) {
      supplierName = emitMatch[1].trim().replace(/\s{2,}/g, ' ');
    } else {
      // Procura nas primeiras linhas antes do CNPJ
      for (const line of lines.slice(0, 15)) {
        if (line.includes('LTDA') || line.includes('S.A') || line.includes('S/A') || line.includes('COMERCIO') || line.includes('DISTRIBUIDORA') || line.includes('INDUSTRIA')) {
          supplierName = line.trim();
          break;
        }
      }
    }
    if (!supplierName) {
      supplierName = 'Fornecedor Identificado via PDF';
    }

    // 6. Valor Total da Nota
    let totalValue = 0;
    const valMatch = fullText.match(/VALOR\s+TOTAL\s+DA\s+NOTA[:\s]*R?\$?\s*([0-9\.,]+)/i) ||
                     fullText.match(/V\.?\s*TOTAL\s+DA\s+NOTA[:\s]*R?\$?\s*([0-9\.,]+)/i) ||
                     fullText.match(/TOTAL\s+DA\s+NOTA[:\s]*R?\$?\s*([0-9\.,]+)/i);
    if (valMatch) {
      const rawVal = valMatch[1].replace(/\./g, '').replace(',', '.');
      totalValue = parseFloat(rawVal) || 0;
    }

    // 7. Faturas / Duplicatas
    const installments = [];
    const dupRegex = /(?:(\d{3}|\d{1,2}\/\d{1,2}|\d+)\s+)?(\d{2}\/\d{2}\/\d{4})\s+(?:R\$\s*)?([0-9\.,]+)/g;
    let dupMatch;
    let instIndex = 1;
    while ((dupMatch = dupRegex.exec(fullText)) !== null) {
      const dParts = dupMatch[2].split('/');
      const dVenc = `${dParts[2]}-${dParts[1]}-${dParts[0]}`;
      const vVal = parseFloat(dupMatch[3].replace(/\./g, '').replace(',', '.')) || 0;
      if (vVal > 0 && vVal <= (totalValue * 1.05 || 1000000)) {
        installments.push({
          installmentNumber: dupMatch[1] || String(instIndex),
          dueDate: dVenc,
          amount: vVal
        });
        instIndex++;
      }
    }

    // 8. Itens / Produtos da Nota
    const items = [];
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

    // Se nenhum item detalhado foi capturado por regex estrita, cria um item consolidado com o valor total
    if (items.length === 0 && totalValue > 0) {
      items.push({
        xmlCode: 'PDF-01',
        xmlName: `Insumos Conforme DANFE NF-e Nº ${number || 'S/N'} (${supplierName})`,
        quantity: 1,
        price: totalValue,
        total: totalValue,
        batch: '',
        expiryDate: ''
      });
    }

    return {
      number: number || String(Math.floor(100000 + Math.random() * 900000)),
      accessKey: accessKey || '',
      issueDate: issueDate,
      totalValue: totalValue || items.reduce((acc, it) => acc + (it.total || 0), 0),
      supplierName: supplierName,
      supplierCnpj: supplierCnpj,
      items: items,
      installments: installments.length > 0 ? installments : [{
        installmentNumber: '1/1',
        dueDate: issueDate,
        amount: totalValue
      }],
      sourceType: 'PDF'
    };
  } catch (error) {
    console.error('Erro ao fazer parse do PDF DANFE:', error);
    throw new Error('Não foi possível ler os dados do PDF. Verifique se é um arquivo DANFE válido.');
  }
}
