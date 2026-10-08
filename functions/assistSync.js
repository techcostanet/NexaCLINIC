const { ImapFlow } = require('imapflow');
const { simpleParser } = require('mailparser');

/**
 * Normaliza textos para comparação removendo acentos e caracteres especiais
 */
function normalizeText(text) {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Localiza paciente no texto por nome completo, primeiro/último nome ou CPF
 */
function matchPatientInText(text, patientsList = []) {
  if (!text || !patientsList || patientsList.length === 0) {
    return { matchedPatient: null, confidence: 0 };
  }

  const normalizedInput = normalizeText(text);
  let bestMatch = null;
  let highestScore = 0;
  let longestMatchedNameLen = 0;

  for (const patient of patientsList) {
    if (!patient.name) continue;
    const normalizedPatName = normalizeText(patient.name);
    const patParts = normalizedPatName.split(' ').filter(p => p.length > 2);

    // Pacientes válidos devem ter ao menos nome e sobrenome (mínimo 2 partes válidas de >2 letras)
    if (patParts.length < 2 || normalizedPatName.length < 6) continue;

    // 1. Match por CPF (se citado no texto) - prioridade máxima
    if (patient.cpf) {
      const cleanCpf = patient.cpf.replace(/\D/g, '');
      const cleanInputDigits = text.replace(/\D/g, '');
      if (cleanCpf.length >= 9 && cleanInputDigits.includes(cleanCpf)) {
        return { matchedPatient: patient, confidence: 1.0, matchType: 'exact_cpf' };
      }
    }

    // 2. Match exato do nome completo (prioriza o nome mais longo/específico)
    if (normalizedInput.includes(normalizedPatName)) {
      const score = 1.0;
      if (score > highestScore || (score === highestScore && normalizedPatName.length > longestMatchedNameLen)) {
        highestScore = score;
        longestMatchedNameLen = normalizedPatName.length;
        bestMatch = { matchedPatient: patient, confidence: score, matchType: 'exact_full_name' };
      }
      continue;
    }

    // 3. Match por Primeiro e Último Nome
    if (patParts.length >= 2) {
      const firstAndLast = `${patParts[0]} ${patParts[patParts.length - 1]}`;
      if (normalizedInput.includes(firstAndLast)) {
        const score = 0.90;
        if (score > highestScore || (score === highestScore && firstAndLast.length > longestMatchedNameLen)) {
          highestScore = score;
          longestMatchedNameLen = firstAndLast.length;
          bestMatch = { matchedPatient: patient, confidence: score, matchType: 'first_last_name' };
        }
        continue;
      }
    }

    // 4. Match por contagem de partes do nome
    let matchedTokens = 0;
    for (const part of patParts) {
      if (normalizedInput.includes(part)) {
        matchedTokens++;
      }
    }

    const tokenRatio = patParts.length > 0 ? matchedTokens / patParts.length : 0;
    if (matchedTokens >= 2 && tokenRatio >= 0.6) {
      const score = 0.75 + (tokenRatio * 0.15);
      if (score > highestScore) {
        highestScore = score;
        bestMatch = { matchedPatient: patient, confidence: score, matchType: 'token_overlap' };
      }
    }
  }

  return bestMatch || { matchedPatient: null, confidence: 0 };
}

/**
 * Classifica a categoria e urgência com base em palavras-chave clínicas
 */
function classifyEmailContent(subject = '', body = '') {
  const fullText = normalizeText(`${subject} ${body}`);

  let category = 'Geral';
  let urgency = 'Informativo';

  if (fullText.includes('infeccao') || fullText.includes('infecc') || fullText.includes('atb') || fullText.includes('permcath') || fullText.includes('vancomicina') || fullText.includes('ceftazidima') || fullText.includes('hemocultura')) {
    category = 'Intercorrência';
    urgency = 'Urgente';
  } else if (fullText.includes('alta') || fullText.includes('desospitaliz')) {
    category = 'Alta';
    urgency = 'Atenção';
  } else if (fullText.includes('admissao') || fullText.includes('admitid') || fullText.includes('internad') || fullText.includes('internacao') || fullText.includes('cti') || fullText.includes('uti') || fullText.includes('hospitalizad') || fullText.includes('hospitalizacao')) {
    category = 'Internação';
    urgency = 'Urgente';
  } else if (fullText.includes('transfer') || fullText.includes('transferencia') || fullText.includes('vaga')) {
    category = 'Transferência';
    urgency = 'Atenção';
  } else if (fullText.includes('soroteca') || fullText.includes('recoleta') || fullText.includes('swab') || fullText.includes('hemograma')) {
    category = 'Exames';
    urgency = 'Informativo';
  } else if (fullText.includes('intercorrencia') || fullText.includes('pressao') || fullText.includes('hipotens') || fullText.includes('sangramento') || fullText.includes('febre') || fullText.includes('dor')) {
    category = 'Intercorrência';
    urgency = 'Urgente';
  } else if (fullText.includes('nutri') || fullText.includes('dieta') || fullText.includes('suplement') || fullText.includes('potassio') || fullText.includes('fosforo') || fullText.includes('peso seco')) {
    category = 'Nutrição';
    urgency = 'Informativo';
  } else if (fullText.includes('psicolog') || fullText.includes('emocional') || fullText.includes('ansiedad') || fullText.includes('depress') || fullText.includes('familiar')) {
    category = 'Psicologia';
    urgency = 'Informativo';
  } else if (fullText.includes('social') || fullText.includes('transporte') || fullText.includes('beneficio') || fullText.includes('tfd') || fullText.includes('laudo')) {
    category = 'Serviço Social';
    urgency = 'Informativo';
  } else if (fullText.includes('obito') || fullText.includes('falec')) {
    category = 'Óbito';
    urgency = 'Urgente';
  }

  if (fullText.includes('urgente') || fullText.includes('emergencia') || fullText.includes('grave') || fullText.includes('critico') || fullText.includes('cti') || fullText.includes('uti')) {
    urgency = 'Urgente';
  }

  return { category, urgency };
}

/**
 * Decodifica entidades HTML como &nbsp;, &quot;, &#39;, &amp;, etc.
 */
function decodeHtmlEntities(str) {
  if (!str) return '';
  let res = String(str);
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
function cleanHtmlToText(raw) {
  if (!raw) return '';
  let text = String(raw);

  // Se contiver tags HTML
  if (/<[a-z!][\s\S]*>/i.test(text)) {
    text = text.replace(/<!--[\s\S]*?-->/g, '');
    text = text.replace(/<style[\s\S]*?<\/style>/gi, '');
    text = text.replace(/<script[\s\S]*?<\/script>/gi, '');
    text = text.replace(/<head[\s\S]*?<\/head>/gi, '');
    text = text.replace(/<img[\s\S]*?>/gi, '');

    text = text.replace(/<br\s*[\/]?>/gi, '\n');
    text = text.replace(/<\/(p|div|tr|li|h[1-6]|table|blockquote|signature)>/gi, '\n');
    text = text.replace(/<(p|div|tr|li|h[1-6]|table|blockquote|signature)[^>]*>/gi, '\n');

    text = text.replace(/<[^>]+>/gi, ' ');
  }

  text = decodeHtmlEntities(text);
  text = text.replace(/\u00a0/g, ' ');

  return text;
}

/**
 * Remove assinaturas e cabeçalhos desnecessários do texto
 */
function cleanEmailBody(rawBody = '') {
  if (!rawBody) return '';
  const convertedText = cleanHtmlToText(rawBody);
  const rawLines = convertedText.split('\n');
  const cleanedLines = [];

  for (const line of rawLines) {
    const trimmed = line.replace(/\s+/g, ' ').trim();
    if (!trimmed) {
      if (cleanedLines.length > 0 && cleanedLines[cleanedLines.length - 1] !== '') {
        cleanedLines.push('');
      }
      continue;
    }

    const lower = trimmed.toLowerCase();
    if (lower.startsWith('>') || lower.startsWith('de:') || lower.startsWith('enviado em:') || lower.startsWith('para:') || lower.startsWith('assunto:')) {
      continue;
    }
    if (
      lower === 'atenciosamente' || lower === 'atenciosamente,' || 
      lower === 'cordialmente' || lower === 'cordialmente,' || 
      lower === 'obrigado' || lower === 'obrigada' ||
      lower.startsWith('att,') || lower.startsWith('att:') || lower === 'att' ||
      lower === 'at.te,' || lower === 'at.te'
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
    if (/^[-=_*]{3,}$/.test(trimmed)) {
      continue;
    }

    cleanedLines.push(trimmed);
  }

  return cleanedLines.join('\n').trim();
}

/**
 * Executa a sincronização de e-mails IMAP do Titan na nuvem para o Firestore
 */
async function syncTitanEmailsToFirestore(db) {
  // 1. Verifica se a importação está ativa nas configurações
  const emailSettingsSnap = await db.doc('settings/email').get();
  const emailSettings = emailSettingsSnap.exists ? emailSettingsSnap.data() : {};
  if (emailSettings.muralEmailImportEnabled === false) {
    console.log('[syncTitanEmails] Importação de e-mails desativada no NexaCONFIG.');
    return { skipped: true, reason: 'disabled' };
  }

  // 2. Credenciais IMAP
  const imapHost = emailSettings.imapHost || 'imap.titan.email';
  const imapPort = Number(emailSettings.imapPort) || 993;
  const imapUser = emailSettings.smtpUser || emailSettings.senderEmail || 'integracao@dialize.com.br';
  const imapPass = emailSettings.smtpPassword || 'Dialize@#3344';

  const client = new ImapFlow({
    host: imapHost,
    port: imapPort,
    secure: true,
    auth: {
      user: imapUser,
      pass: imapPass
    },
    logger: false
  });

  try {
    await client.connect();
    const lock = await client.getMailboxLock('INBOX');

    try {
      const status = await client.status('INBOX', { messages: true });
      if (!status.messages || status.messages === 0) {
        console.log('[syncTitanEmails] Caixa INBOX vazia.');
        return { totalSynced: 0 };
      }

      // Consulta o último UID processado
      const configDocRef = db.doc('system_configs/assist_email');
      const configSnap = await configDocRef.get();
      const lastProcessedUid = configSnap.exists ? (Number(configSnap.data().lastProcessedUid) || 0) : 0;

      // Se nunca sincronizou pelo Cloud Function, busca a partir dos últimos 50 ou UID > lastProcessedUid
      let range = '1:*';
      if (lastProcessedUid > 0) {
        range = `${lastProcessedUid + 1}:*`;
      } else {
        const startSeq = Math.max(1, status.messages - 40);
        range = `${startSeq}:*`;
      }

      // Carrega pacientes do Firestore para vinculação inteligente
      const patientsSnap = await db.collection('patients').get();
      const patientsList = patientsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      const messagesToProcess = [];
      for await (const message of client.fetch(range, { uid: true, source: true, envelope: true })) {
        if (lastProcessedUid > 0 && message.uid <= lastProcessedUid) {
          continue; // Já processado
        }
        messagesToProcess.push(message);
      }

      console.log(`[syncTitanEmails] Mensagens novas identificadas no IMAP: ${messagesToProcess.length}`);

      let highestUid = lastProcessedUid;
      let insertedCount = 0;

      for (const msg of messagesToProcess) {
        if (msg.uid > highestUid) {
          highestUid = msg.uid;
        }

        try {
          const parsed = await simpleParser(msg.source);
          const rawSubject = cleanHtmlToText(parsed.subject || msg.envelope?.subject || 'Comunicado Assistencial').trim();
          const candidateBody = (parsed.text && !/<[a-z!][\s\S]*>/i.test(parsed.text)) ? parsed.text : (parsed.html || parsed.text || '');
          const cleanedText = cleanEmailBody(candidateBody);

          const fromAddress = parsed.from?.text || (msg.envelope?.from ? msg.envelope.from.map(f => f.name || f.address).join(', ') : 'Equipe Assistencial');
          const authorName = parsed.from?.value?.[0]?.name || fromAddress.split('<')[0].replace(/"/g, '').trim() || 'Equipe Assistencial';
          const authorEmail = parsed.from?.value?.[0]?.address || 'integracao@dialize.com.br';
          const emailDate = parsed.date ? parsed.date.toISOString() : (msg.envelope?.date ? new Date(msg.envelope.date).toISOString() : new Date().toISOString());

          const searchBlob = `${rawSubject} ${cleanedText}`;
          const { matchedPatient, confidence, matchType } = matchPatientInText(searchBlob, patientsList);
          const { category, urgency } = classifyEmailContent(rawSubject, cleanedText);

          const isLinked = matchedPatient && confidence >= 0.75;
          const postId = `email-titan-${msg.uid}`;

          const postData = {
            id: postId,
            source: 'email',
            uid: msg.uid,
            originalFrom: fromAddress,
            originalSubject: rawSubject,
            title: rawSubject,
            message: cleanedText,
            category,
            urgency,
            patientId: isLinked ? matchedPatient.id : null,
            patientName: isLinked ? matchedPatient.name : null,
            room: isLinked ? (matchedPatient.room || 'Geral') : 'Geral',
            shift: isLinked ? (matchedPatient.shift || 'Geral') : 'Geral',
            matchConfidence: confidence,
            matchType: matchType || 'none',
            status: isLinked ? 'published' : 'pending_link',
            author: authorName,
            authorEmail,
            authorRole: 'Equipe Assistencial (E-mail)',
            createdAt: emailDate,
            syncedAt: new Date().toISOString(),
            readBy: []
          };

          // Salva no Firestore garantindo idempotência
          const postDocRef = db.collection('assist_posts').doc(postId);
          await postDocRef.set(postData, { merge: true });
          insertedCount++;
        } catch (msgErr) {
          console.error(`[syncTitanEmails] Erro ao processar mensagem UID ${msg.uid}:`, msgErr);
        }
      }

      // Atualiza o documento de controle
      await configDocRef.set({
        lastProcessedUid: highestUid,
        lastSyncAt: new Date().toISOString(),
        lastSyncCount: insertedCount,
        status: 'SUCCESS'
      }, { merge: true });

      console.log(`[syncTitanEmails] Concluído com sucesso. Inseridos: ${insertedCount}, Maior UID: ${highestUid}`);
      return { totalSynced: insertedCount, highestUid };
    } finally {
      lock.release();
    }
  } finally {
    await client.logout().catch(() => {});
  }
}

module.exports = {
  syncTitanEmailsToFirestore,
  normalizeText,
  matchPatientInText,
  classifyEmailContent,
  cleanEmailBody,
  cleanHtmlToText,
  decodeHtmlEntities
};
