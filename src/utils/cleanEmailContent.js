/**
 * Utilitários de higienização e decodificação de e-mails para o Mural (.ASSIST)
 * Converte HTML bruto de mensagens de e-mail (Titan, Outlook, Gmail, Webmail)
 * em texto clínico limpo, legível e formatado.
 */

/**
 * Decodifica entidades HTML como &nbsp;, &quot;, &#39;, &amp;, etc.
 */
export function decodeHtmlEntities(str) {
  if (!str) return '';
  let res = String(str);
  // Até 2 passagens para casos com duplo escape (ex: &amp;quot;)
  for (let pass = 0; pass < 2; pass++) {
    const prev = res;
    res = res
      .replace(/&nbsp;/gi, ' ')
      .replace(/&amp;/gi, '&')
      .replace(/&quot;/gi, '"')
      .replace(/&apos;/gi, "'")
      .replace(/&#39;/gi, "'")
      .replace(/&lt;/gi, '<')
      .replace(/&gt;/gi, '>')
      .replace(/&bull;/gi, '•')
      .replace(/&ndash;/gi, '–')
      .replace(/&mdash;/gi, '—')
      .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(Number(dec)))
      .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
    if (res === prev) break;
  }
  return res;
}

/**
 * Converte marcação HTML em texto simples mantendo a estrutura de parágrafos
 */
export function cleanHtmlToText(raw) {
  if (!raw) return '';
  let text = String(raw);

  // Se contiver tags HTML
  if (/<[a-z!][\s\S]*>/i.test(text)) {
    // 1. Remove comentários
    text = text.replace(/<!--[\s\S]*?-->/g, '');

    // 2. Remove blocos inteiros que não devem virar conteúdo visível
    text = text.replace(/<style[\s\S]*?<\/style>/gi, '');
    text = text.replace(/<script[\s\S]*?<\/script>/gi, '');
    text = text.replace(/<head[\s\S]*?<\/head>/gi, '');
    text = text.replace(/<img[\s\S]*?>/gi, '');

    // 3. Converte quebras e blocos estruturais em novas linhas
    text = text.replace(/<br\s*[\/]?>/gi, '\n');
    text = text.replace(/<\/(p|div|tr|li|h[1-6]|table|blockquote|signature)>/gi, '\n');
    text = text.replace(/<(p|div|tr|li|h[1-6]|table|blockquote|signature)[^>]*>/gi, '\n');

    // 4. Remove todas as outras tags remanescentes adicionando espaço seguro
    text = text.replace(/<[^>]+>/gi, ' ');
  }

  // 5. Decodifica entidades HTML
  text = decodeHtmlEntities(text);

  // 6. Normaliza espaços não separáveis
  text = text.replace(/\u00a0/g, ' ');

  return text;
}

/**
 * Higieniza o corpo completo do e-mail: remove HTML, assinaturas eletrônicas e ruídos
 */
export function cleanEmailBody(rawBody = '') {
  if (!rawBody) return '';

  // Converte qualquer HTML pré-existente
  const convertedText = cleanHtmlToText(rawBody);

  const rawLines = convertedText.split('\n');
  const cleanedLines = [];

  for (const line of rawLines) {
    const trimmed = line.replace(/\s+/g, ' ').trim();
    if (!trimmed) {
      // Permite no máximo uma linha em branco consecutiva entre parágrafos
      if (cleanedLines.length > 0 && cleanedLines[cleanedLines.length - 1] !== '') {
        cleanedLines.push('');
      }
      continue;
    }

    const lower = trimmed.toLowerCase();

    // Remove cabeçalhos de encaminhamento e citação
    if (
      lower.startsWith('>') || 
      lower.startsWith('de:') || 
      lower.startsWith('enviado em:') || 
      lower.startsWith('para:') || 
      lower.startsWith('assunto:')
    ) {
      continue;
    }

    // Remove despedidas formais e rodapés de dispositivos
    if (
      lower === 'atenciosamente' || 
      lower === 'atenciosamente,' || 
      lower === 'cordialmente' || 
      lower === 'cordialmente,' || 
      lower === 'obrigado' || 
      lower === 'obrigada' ||
      lower.startsWith('att,') || 
      lower.startsWith('att:') || 
      lower === 'att' || 
      lower === 'at.te,' || 
      lower === 'at.te'
    ) {
      continue;
    }

    if (
      lower.includes('enviado do meu iphone') || 
      lower.includes('enviado pelo outlook') || 
      lower.includes('enviado do meu galaxy') || 
      lower.includes('enviado pelo mail do windows') ||
      lower.includes('gentileza acusar recebimento')
    ) {
      continue;
    }

    // Linhas divisórias (ex: -----, ======)
    if (/^[-=_*]{3,}$/.test(trimmed)) {
      continue;
    }

    cleanedLines.push(trimmed);
  }

  return cleanedLines.join('\n').trim();
}
