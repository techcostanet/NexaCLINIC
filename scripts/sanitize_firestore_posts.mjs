import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { cleanEmailBody, cleanHtmlToText } from '../src/utils/cleanEmailContent.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

try {
  admin.initializeApp();
} catch (e) {}

const db = getFirestore();

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
}

const FALSE_PATIENT_NAMES = new Set([
  'SANTOS', 'GONCALVES', 'COSTA', 'AQUINO', 'SOUZA', 
  'CARVALHO', 'PEREIRA', 'OLIVEIRA', 'DOMINGOS', 'VASCONCELOS'
]);

async function runSanitization() {
  console.log('Iniciando higienização oficial e correta da coleção assist_posts no Firestore...');

  const [postsSnap, patientsSnap] = await Promise.all([
    db.collection('assist_posts').get(),
    db.collection('patients').get()
  ]);

  const patientsList = patientsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  console.log(`Carregados ${postsSnap.size} comunicados e ${patientsList.length} pacientes.`);

  let updatedCount = 0;
  let reMatchedPatients = 0;

  for (const doc of postsSnap.docs) {
    const data = doc.data();
    const rawMsg = data.message || '';
    const rawTitle = data.title || '';

    const hasHtml = /<[a-z!][\s\S]*>/i.test(rawMsg) || 
                    /<[a-z!][\s\S]*>/i.test(rawTitle) || 
                    rawMsg.includes('&nbsp;') || 
                    rawMsg.includes('&quot;') ||
                    rawMsg.includes('&#') ||
                    rawTitle.includes('&nbsp;');

    const isBadPatientName = data.patientName && FALSE_PATIENT_NAMES.has(data.patientName.trim().toUpperCase());

    if (hasHtml || isBadPatientName) {
      const cleanedMsg = cleanEmailBody(rawMsg);
      const cleanedTitle = cleanHtmlToText(rawTitle).trim();

      const searchBlob = `${cleanedTitle} ${cleanedMsg}`;
      const { matchedPatient, confidence, matchType } = matchPatientInText(searchBlob, patientsList);

      const updatePayload = {
        message: cleanedMsg,
        title: cleanedTitle,
        sanitizedAt: new Date().toISOString()
      };

      if (matchedPatient && confidence >= 0.70) {
        updatePayload.patientId = matchedPatient.id;
        updatePayload.patientName = matchedPatient.name;
        updatePayload.room = matchedPatient.room || data.room || 'Geral';
        updatePayload.shift = matchedPatient.shift || data.shift || 'Geral';
        updatePayload.matchConfidence = confidence;
        updatePayload.matchType = matchType;
        updatePayload.status = 'published';

        if (matchedPatient.name !== data.patientName) {
          reMatchedPatients++;
          console.log(`[Revinculado Corretamente] ${doc.id}: '${data.patientName || 'Sem Vínculo'}' -> '${matchedPatient.name}' (${matchType})`);
        }
      } else if (isBadPatientName) {
        // Se tinha um sobrenome falso isolado e não achou paciente real, desvincula o sobrenome falso
        updatePayload.patientId = null;
        updatePayload.patientName = null;
        updatePayload.matchConfidence = 0;
        updatePayload.matchType = 'none';
        updatePayload.status = 'pending_link';
        console.log(`[Removido Vínculo Falso] ${doc.id}: removido sobrenome isolado '${data.patientName}'`);
      }

      await doc.ref.update(updatePayload);
      updatedCount++;
    }
  }

  console.log(`\nHigienização no Firestore concluída com sucesso!`);
  console.log(`- Comunicados higienizados / corrigidos: ${updatedCount}`);
  console.log(`- Pacientes revinculados com precisão: ${reMatchedPatients}`);

  // Re-exporta a base higienizada para backup local
  const finalSnap = await db.collection('assist_posts').get();
  const allPosts = finalSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  allPosts.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

  const backupFile = path.join(__dirname, '..', 'src', 'data', 'synced_assist_emails.json');
  fs.writeFileSync(backupFile, JSON.stringify(allPosts, null, 2), 'utf-8');
  console.log(`Backup local atualizado em ${backupFile} com ${allPosts.length} comunicados.`);
}

runSanitization().then(() => process.exit(0)).catch((err) => {
  console.error('Erro na higienização:', err);
  process.exit(1);
});
