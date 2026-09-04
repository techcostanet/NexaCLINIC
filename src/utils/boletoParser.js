/**
 * Utilitário de Leitura e Validação de Boletos Bancários
 * Suporta extração de texto via PDF.js, identificação de Linha Digitável (47/48 dígitos),
 * cálculo/extração de vencimento, valor e formatação padrão FEBRABAN.
 */
import * as pdfjsLib from 'pdfjs-dist';

// Configuração do worker remoto seguro para PDF.js
try {
  if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
  }
} catch (e) {
  console.warn('Não foi possível configurar worker remoto do pdf.js:', e);
}

/**
 * Remove qualquer caractere que não seja número
 */
export function cleanDigitableLine(value) {
  if (!value) return '';
  return String(value).replace(/\D/g, '');
}

/**
 * Formata uma linha digitável de acordo com o padrão FEBRABAN
 * - 47 dígitos (Cobrança Bancária): 00000.00000 00000.000000 00000.000000 0 00000000000000
 * - 48 dígitos (Concessionárias/Tributos): 00000000000-0 00000000000-0 00000000000-0 00000000000-0
 */
export function formatDigitableLine(value) {
  const digits = cleanDigitableLine(value);
  
  if (digits.length === 47) {
    return `${digits.slice(0, 5)}.${digits.slice(5, 10)} ${digits.slice(10, 15)}.${digits.slice(15, 21)} ${digits.slice(21, 26)}.${digits.slice(26, 32)} ${digits.slice(32, 33)} ${digits.slice(33, 47)}`;
  }

  if (digits.length === 48) {
    return `${digits.slice(0, 12)} ${digits.slice(12, 24)} ${digits.slice(24, 36)} ${digits.slice(36, 48)}`;
  }

  return value || '';
}

/**
 * Valida se uma string é uma linha digitável válida (47 ou 48 dígitos)
 */
export function isValidDigitableLine(value) {
  const digits = cleanDigitableLine(value);
  return digits.length === 47 || digits.length === 48;
}

/**
 * Extrai valor em reais a partir dos dígitos da linha digitável (últimos 10 dígitos para boletos de cobrança)
 */
export function extractAmountFromDigitableLine(digits) {
  if (!digits || digits.length !== 47) return null;
  const rawValue = digits.slice(37, 47);
  const numericVal = parseInt(rawValue, 10);
  if (isNaN(numericVal) || numericVal <= 0) return null;
  return numericVal / 100;
}

/**
 * Extrai dados estruturados de um arquivo PDF de Boleto Bancário
 * @param {ArrayBuffer} arrayBuffer - Buffer do arquivo PDF
 * @returns {Promise<{ digitableLine: string, formattedLine: string, dueDate: string|null, amount: number|null, rawText: string }>}
 */
export async function parseBoletoPdf(arrayBuffer) {
  try {
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    let fullText = '';
    const textItems = [];

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageItems = textContent.items || [];
      
      for (const item of pageItems) {
        if (item.str) {
          textItems.push(item.str.trim());
        }
      }
      
      const pageText = pageItems.map(item => item.str).join(' ');
      fullText += '\n' + pageText;
    }

    // 1. Busca por Linha Digitável
    let digitableLine = '';

    // Tentativa 1: Regex para linha digitável formatada de 47 dígitos
    // Ex: 34191.79001 01043.510047 91020.150008 5 91230000015025
    const regex47Format = /(\d{5}\.\d{5}\s+\d{5}\.\d{6}\s+\d{5}\.\d{6}\s+\d\s+\d{14})/;
    const match47Format = fullText.match(regex47Format);
    if (match47Format) {
      digitableLine = cleanDigitableLine(match47Format[1]);
    }

    // Tentativa 2: Busca por sequência de blocos numéricos agrupados
    if (!digitableLine) {
      const regexBlocks = /(\d{5}[\.\s]?\d{5}\s+\d{5}[\.\s]?\d{6}\s+\d{5}[\.\s]?\d{6}\s+\d\s+\d{14})/;
      const matchBlocks = fullText.match(regexBlocks);
      if (matchBlocks) {
        digitableLine = cleanDigitableLine(matchBlocks[1]);
      }
    }

    // Tentativa 3: Linha de Concessionária / Arrecadação (48 dígitos, começa com 8)
    if (!digitableLine) {
      const regex48Format = /(8\d{11}[\s\-]?\d?\s+\d{11}[\s\-]?\d?\s+\d{11}[\s\-]?\d?\s+\d{11}[\s\-]?\d?)/;
      const match48Format = fullText.match(regex48Format);
      if (match48Format) {
        const cleaned = cleanDigitableLine(match48Format[1]);
        if (cleaned.length === 48) {
          digitableLine = cleaned;
        }
      }
    }

    // Tentativa 4: Varredura de números contínuos nos textos das páginas
    if (!digitableLine) {
      for (const item of textItems) {
        const cleaned = cleanDigitableLine(item);
        if (cleaned.length === 47 || cleaned.length === 48) {
          digitableLine = cleaned;
          break;
        }
      }
    }

    // Tentativa 5: Junta sequências numéricas adjacentes caso o PDF divida a linha em múltiplos spans
    if (!digitableLine) {
      const allDigitsOnly = fullText.replace(/[^\d\s]/g, '');
      const candidateMatches = allDigitsOnly.match(/(?:\d[\s\n]*){47,48}/g);
      if (candidateMatches && candidateMatches.length > 0) {
        for (const cand of candidateMatches) {
          const candClean = cleanDigitableLine(cand);
          if (candClean.length === 47 || candClean.length === 48) {
            digitableLine = candClean;
            break;
          }
        }
      }
    }

    // 2. Busca por Data de Vencimento
    let dueDate = '';
    const dueDateMatch = fullText.match(/(?:vencimento|data\s+de\s+vencimento|venc)[:\s]*([0-9]{2}[\/\.-][0-9]{2}[\/\.-][0-9]{4})/i) ||
                         fullText.match(/([0-9]{2}\/[0-9]{2}\/[0-9]{4})/);
    if (dueDateMatch) {
      const rawDate = dueDateMatch[1].replace(/[\.-]/g, '/');
      const parts = rawDate.split('/');
      if (parts.length === 3 && parts[2].length === 4) {
        dueDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
      }
    }

    // 3. Busca por Valor
    let amount = 0;
    // Tenta primeiro extrair diretamente da linha digitável de 47 dígitos
    if (digitableLine && digitableLine.length === 47) {
      const calculatedAmount = extractAmountFromDigitableLine(digitableLine);
      if (calculatedAmount && calculatedAmount > 0) {
        amount = calculatedAmount;
      }
    }

    // Se não obteve via linha digitável, procura no texto do PDF
    if (!amount) {
      const valMatch = fullText.match(/(?:valor\s+do\s+documento|valor\s+cobrado|valor|total\s+a\s+pagar)[:\s]*R?\$?\s*([0-9\.,]+)/i);
      if (valMatch) {
        const rawVal = valMatch[1].replace(/\./g, '').replace(',', '.');
        amount = parseFloat(rawVal) || 0;
      }
    }

    return {
      digitableLine,
      formattedLine: formatDigitableLine(digitableLine),
      dueDate: dueDate || null,
      amount: amount || null,
      rawText: fullText
    };
  } catch (error) {
    console.error('Erro ao processar boleto em PDF:', error);
    return {
      digitableLine: '',
      formattedLine: '',
      dueDate: null,
      amount: null,
      rawText: ''
    };
  }
}

/**
 * Tenta ler o código de barras de uma imagem de boleto usando BarcodeDetector do navegador
 * @param {File|Blob} imageFile 
 * @returns {Promise<{ digitableLine: string, formattedLine: string }>}
 */
export async function parseBoletoImage(imageFile) {
  try {
    if (typeof window !== 'undefined' && 'BarcodeDetector' in window) {
      // @ts-ignore
      const detector = new window.BarcodeDetector({ formats: ['itf', 'code_128', 'codabar', 'qr_code'] });
      const imageBitmap = await createImageBitmap(imageFile);
      const barcodes = await detector.detect(imageBitmap);

      if (barcodes && barcodes.length > 0) {
        for (const b of barcodes) {
          const raw = cleanDigitableLine(b.rawValue);
          if (raw.length === 44 || raw.length === 47 || raw.length === 48) {
            return {
              digitableLine: raw,
              formattedLine: formatDigitableLine(raw)
            };
          }
        }
      }
    }
  } catch (err) {
    console.warn('BarcodeDetector não suportado ou falhou na imagem:', err);
  }

  return {
    digitableLine: '',
    formattedLine: ''
  };
}
