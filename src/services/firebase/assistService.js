import { app } from './config';
import { USE_MOCK, mockFirestore } from './mockDb';

/**
 * Normaliza strings para comparação (remove acentos, pontuação e converte para minúsculas)
 */
export const normalizeText = (text) => {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Motor Inteligente de correspondência (Fuzzy Match) de paciente no texto
 */
export const matchPatientInText = (text, patientsList = []) => {
  if (!text || !patientsList || patientsList.length === 0) {
    return { matchedPatient: null, confidence: 0 };
  }

  const normalizedInput = normalizeText(text);
  let bestMatch = null;
  let highestScore = 0;

  for (const patient of patientsList) {
    if (!patient.name) continue;
    const normalizedPatName = normalizeText(patient.name);
    const patParts = normalizedPatName.split(' ').filter(p => p.length > 2);

    // 1. Match exato do nome completo
    if (normalizedInput.includes(normalizedPatName)) {
      return { matchedPatient: patient, confidence: 1.0, matchType: 'exact_full_name' };
    }

    // 2. Match por CPF (se citado no texto)
    if (patient.cpf) {
      const cleanCpf = patient.cpf.replace(/\D/g, '');
      const cleanInputDigits = text.replace(/\D/g, '');
      if (cleanCpf.length >= 9 && cleanInputDigits.includes(cleanCpf)) {
        return { matchedPatient: patient, confidence: 1.0, matchType: 'exact_cpf' };
      }
    }

    // 3. Match por Primeiro e Último Nome
    if (patParts.length >= 2) {
      const firstAndLast = `${patParts[0]} ${patParts[patParts.length - 1]}`;
      if (normalizedInput.includes(firstAndLast)) {
        const score = 0.92;
        if (score > highestScore) {
          highestScore = score;
          bestMatch = { matchedPatient: patient, confidence: score, matchType: 'first_last_name' };
        }
      }
    }

    // 4. Match por contagem de tokens do nome no texto
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
};

/**
 * Classificador de Categoria e Urgência com base em palavras-chave clínicas
 */
export const classifyEmailContent = (subject = '', body = '') => {
  const fullText = normalizeText(`${subject} ${body}`);

  // Categoria e Urgência com prioridade clínica
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

  // Se houver termos críticos de urgência explícita
  if (fullText.includes('urgente') || fullText.includes('emergencia') || fullText.includes('grave') || fullText.includes('critico') || fullText.includes('cti') || fullText.includes('uti')) {
    urgency = 'Urgente';
  }

  return { category, urgency };
};

/**
 * Limpa o corpo do e-mail removendo saudações, assinaturas e cabeçalhos
 */
export const cleanEmailBody = (rawBody = '') => {
  if (!rawBody) return '';
  let lines = rawBody.split('\n');
  
  // Remove linhas típicas de assinaturas e cabeçalhos de encaminhamento
  const cleaned = lines.filter(line => {
    const trimmed = line.trim();
    if (!trimmed) return true;
    if (trimmed.startsWith('>') || trimmed.startsWith('De:') || trimmed.startsWith('Enviado em:') || trimmed.startsWith('Para:') || trimmed.startsWith('Assunto:')) return false;
    if (trimmed.toLowerCase().startsWith('atenciosamente') || trimmed.toLowerCase().startsWith('cordialmente') || trimmed.toLowerCase().startsWith('obrigado')) return false;
    if (trimmed.toLowerCase().includes('enviado do meu iphone') || trimmed.toLowerCase().includes('enviado pelo outlook')) return false;
    return true;
  });

  return cleaned.join('\n').trim();
};

/**
 * Processa um e-mail bruto recebido e gera o modelo de comunicado estruturado
 */
export const parseIncomingEmail = (emailData, patientsList = []) => {
  const { from = 'Equipe Assistencial', subject = '', body = '', date = new Date().toISOString() } = emailData;
  
  const cleanedBody = cleanEmailBody(body);
  const { matchedPatient, confidence, matchType } = matchPatientInText(`${subject} ${cleanedBody}`, patientsList);
  const { category, urgency } = classifyEmailContent(subject, cleanedBody);

  const isLinked = matchedPatient && confidence >= 0.75;

  return {
    source: 'email',
    originalFrom: from,
    originalSubject: subject,
    rawText: cleanedBody,
    title: subject || `Comunicado Assistencial - ${category}`,
    message: cleanedBody,
    category,
    urgency,
    patientId: isLinked ? matchedPatient.id : null,
    patientName: isLinked ? matchedPatient.name : null,
    room: isLinked ? (matchedPatient.room || 'Geral') : 'Geral',
    shift: isLinked ? (matchedPatient.shift || 'Geral') : 'Geral',
    matchConfidence: confidence,
    matchType: matchType || 'none',
    status: isLinked ? 'published' : 'pending_link',
    author: from.split('<')[0].replace(/"/g, '').trim() || 'Assistência Clínica',
    authorRole: 'Equipe Assistencial (E-mail)',
    createdAt: date || new Date().toISOString(),
    readBy: []
  };
};

/**
 * Executa varredura e vinculação automática inteligente em comunicados pendentes de paciente
 */
export const autoLinkAssistPosts = (posts = [], patientsList = []) => {
  if (!posts || !Array.isArray(posts) || posts.length === 0) return posts || [];
  if (!patientsList || !Array.isArray(patientsList) || patientsList.length === 0) return posts;

  return posts.map(post => {
    // Se o comunicado já possui paciente vinculado, mantém sem alterar
    if (post.patientId && post.status === 'published') return post;

    const searchBlob = `${post.title || ''} ${post.message || ''} ${post.patientName || ''} ${post.originalSubject || ''}`;
    const { matchedPatient, confidence, matchType } = matchPatientInText(searchBlob, patientsList);

    if (matchedPatient && confidence >= 0.70) {
      return {
        ...post,
        patientId: matchedPatient.id,
        patientName: matchedPatient.name,
        room: matchedPatient.room || post.room || 'Geral',
        shift: matchedPatient.shift || post.shift || 'Geral',
        matchConfidence: confidence,
        matchType: matchType,
        status: 'published'
      };
    }
    return post;
  });
};

/**
 * Busca todos os comunicados assistenciais
 */
export const getAssistPosts = async () => {
  if (USE_MOCK) {
    return mockFirestore.getAssistPosts ? mockFirestore.getAssistPosts() : [];
  }
  const { getFirestore, collection, getDocs, query, orderBy } = await import('firebase/firestore');
  const db = getFirestore(app);
  
  try {
    const q = query(collection(db, 'assist_posts'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    
    if (snap.empty) {
      // Retorna seed inicial se vazio
      if (mockFirestore.getAssistPosts) {
        return mockFirestore.getAssistPosts();
      }
      return [];
    }

    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (err) {
    console.warn('Erro ao buscar assist_posts no Firestore, tentando fallback sem ordenação:', err);
    try {
      const snap = await getDocs(collection(db, 'assist_posts'));
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } catch (e) {
      console.error('Falha ao recuperar assist_posts:', e);
      if (mockFirestore.getAssistPosts) return mockFirestore.getAssistPosts();
      return [];
    }
  }
};

/**
 * Cria um novo comunicado assistencial
 */
export const createAssistPost = async (postData) => {
  if (USE_MOCK) {
    if (mockFirestore.createAssistPost) {
      return mockFirestore.createAssistPost(postData);
    }
    return { id: 'mock-' + Date.now(), ...postData, createdAt: new Date().toISOString(), readBy: [] };
  }

  const { getFirestore, collection, addDoc } = await import('firebase/firestore');
  const db = getFirestore(app);

  const newPost = {
    ...postData,
    readBy: postData.readBy || [],
    createdAt: postData.createdAt || new Date().toISOString()
  };

  const docRef = await addDoc(collection(db, 'assist_posts'), newPost);
  return { id: docRef.id, ...newPost };
};

/**
 * Atualiza um comunicado
 */
export const updateAssistPost = async (id, postData) => {
  if (USE_MOCK) {
    if (mockFirestore.updateAssistPost) {
      return mockFirestore.updateAssistPost(id, postData);
    }
    return { id, ...postData };
  }

  const { getFirestore, doc, updateDoc } = await import('firebase/firestore');
  const db = getFirestore(app);
  
  await updateDoc(doc(db, 'assist_posts', id), {
    ...postData,
    updatedAt: new Date().toISOString()
  });

  return { id, ...postData };
};

/**
 * Exclui um comunicado
 */
export const deleteAssistPost = async (id) => {
  if (USE_MOCK) {
    if (mockFirestore.deleteAssistPost) {
      return mockFirestore.deleteAssistPost(id);
    }
    return true;
  }

  const { getFirestore, doc, deleteDoc } = await import('firebase/firestore');
  const db = getFirestore(app);
  return deleteDoc(doc(db, 'assist_posts', id));
};

/**
 * Alterna o status de "Ciente" de um usuário em um comunicado
 */
export const toggleAssistPostRead = async (postId, user) => {
  if (!postId || !user) return null;

  const userIdentifier = user.name || user.email || user.username || 'Profissional';
  const userId = user.id || user.uid || user.email || 'user';
  
  if (USE_MOCK) {
    if (mockFirestore.toggleAssistPostRead) {
      return mockFirestore.toggleAssistPostRead(postId, user);
    }
    return true;
  }

  const { getFirestore, doc, getDoc, updateDoc } = await import('firebase/firestore');
  const db = getFirestore(app);
  const docRef = doc(db, 'assist_posts', postId);
  
  const snap = await getDoc(docRef);
  if (!snap.exists()) return null;

  const data = snap.data();
  let readBy = Array.isArray(data.readBy) ? [...data.readBy] : [];

  const existingIndex = readBy.findIndex(r => r.userId === userId || r.name === userIdentifier);

  if (existingIndex >= 0) {
    // Remove o ciente
    readBy.splice(existingIndex, 1);
  } else {
    // Adiciona o ciente
    readBy.push({
      userId,
      name: userIdentifier,
      role: user.role || 'Profissional',
      readAt: new Date().toISOString()
    });
  }

  await updateDoc(docRef, { readBy });
  return readBy;
};

/**
 * Vincula um paciente manualmente a um comunicado pendente de vínculo
 */
export const linkPatientToPost = async (postId, patient) => {
  if (!postId || !patient) return null;

  const updateData = {
    patientId: patient.id,
    patientName: patient.name,
    room: patient.room || 'Geral',
    shift: patient.shift || 'Geral',
    status: 'published',
    matchConfidence: 1.0,
    matchType: 'manual_linked'
  };

  return updateAssistPost(postId, updateData);
};

/**
 * Configuração da Ingestão de E-mails
 */
export const getAssistEmailConfig = async () => {
  if (USE_MOCK) {
    return {
      emailAddress: 'assistencia@nexaclinic.med.br',
      mirrorInbox: 'assistencia.leitura@nexaclinic.med.br',
      syncIntervalMinutes: 5,
      autoLinkThreshold: 80,
      notifyUrgent: true,
      lastSyncAt: new Date().toISOString()
    };
  }

  const { getFirestore, doc, getDoc } = await import('firebase/firestore');
  const db = getFirestore(app);
  try {
    const snap = await getDoc(doc(db, 'system_configs', 'assist_email'));
    if (snap.exists()) {
      return snap.data();
    }
  } catch (err) {
    console.warn('Erro ao carregar assist_email config:', err);
  }

  return {
    emailAddress: 'assistencia@nexaclinic.med.br',
    mirrorInbox: 'assistencia.leitura@nexaclinic.med.br',
    syncIntervalMinutes: 5,
    autoLinkThreshold: 80,
    notifyUrgent: true,
    lastSyncAt: new Date().toISOString()
  };
};

export const saveAssistEmailConfig = async (config) => {
  if (USE_MOCK) return config;

  const { getFirestore, doc, setDoc } = await import('firebase/firestore');
  const db = getFirestore(app);
  await setDoc(doc(db, 'system_configs', 'assist_email'), {
    ...config,
    updatedAt: new Date().toISOString()
  });
  return config;
};
