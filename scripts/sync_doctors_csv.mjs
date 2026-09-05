import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import fs from 'fs';
import path from 'path';

// Clean Name Helper
function formatDoctorDisplayName(rawName) {
  if (!rawName || typeof rawName !== 'string') return '';
  let clean = rawName;
  clean = clean.replace(/\s*\([^)]*\)/g, '');
  clean = clean.replace(/\s*-\s*CRM\s*[\d./A-Z-]+/gi, '');
  clean = clean.replace(/\s+CRM\s*[\d./A-Z-]+/gi, '');
  clean = clean.replace(/^(dr[a]?\.?|doutor[a]?|nutricionista|psic[oó]log[oa](\(a\))?|enfermeir[oa]|administrador)\s+/i, '');
  clean = clean.replace(/\s{2,}/g, ' ').trim();
  return clean || rawName;
}

admin.initializeApp();
const db = getFirestore();
const auth = getAuth();

async function syncDoctors() {
  console.log('Iniciando sincronização de médicos a partir de prodissionais.CSV...');
  
  const csvPath = fs.existsSync('docs/prodissionais.CSV') ? 'docs/prodissionais.CSV' : 'prodissionais.CSV';
  const csvBuffer = fs.readFileSync(csvPath);
  const csvText = csvBuffer.toString('latin1');
  const lines = csvText.split('\n').map(l => l.trim()).filter(Boolean);
  
  const parsedRows = [];
  for (let i = 4; i < lines.length; i++) {
    const parts = lines[i].split(';');
    if (parts.length >= 2 && parts[0] && parts[1]) {
      parsedRows.push({
        nome: parts[0].trim(),
        login: parts[1].trim().toLowerCase(),
        fone: (parts[2] || '').trim(),
        emailOriginal: (parts[3] || '').trim(),
        cargo: (parts[4] || '').trim(),
        setor: (parts[5] || '').trim(),
        crm: (parts[6] || '').trim(),
        ativo: (parts[7] || '').trim()
      });
    }
  }

  console.log(`Encontrados ${parsedRows.length} profissionais no CSV.`);

  const summary = {
    createdAuth: 0,
    updatedAuth: 0,
    syncedFirestore: 0,
    details: []
  };

  // 1. Process each doctor / professional from CSV
  for (const row of parsedRows) {
    const cleanName = formatDoctorDisplayName(row.nome);
    const email = `${row.login}@nexa.com`;
    const password = `${row.login}123`;
    const crmClean = row.crm.replace(/[^\d/A-Za-z]/g, '');

    let authUser = null;
    let authCreated = false;

    // Check Firebase Auth
    try {
      authUser = await auth.getUserByEmail(email);
      // Update password & displayName
      await auth.updateUser(authUser.uid, {
        password: password,
        displayName: cleanName
      });
      summary.updatedAuth++;
    } catch (err) {
      if (err.code === 'auth/user-not-found') {
        authUser = await auth.createUser({
          email: email,
          password: password,
          displayName: cleanName,
          emailVerified: true
        });
        authCreated = true;
        summary.createdAuth++;
      } else {
        console.error(`Erro ao verificar Auth para ${email}:`, err);
        continue;
      }
    }

    const uid = authUser.uid;

    // Payload for Firestore
    const userPayload = {
      uid: uid,
      name: cleanName,
      email: email,
      login: row.login,
      password: password,
      authPassword: password,
      role: 'doctor',
      allowedSectors: ['medica', 'clinica', 'consultorio'],
      primaryUnit: 'betim',
      allowedUnits: ['betim'],
      status: row.ativo === 'N' ? 'inactive' : 'active',
      crm: crmClean || row.crm || '',
      phone: row.fone || '',
      specialty: row.cargo || 'Médico',
      cargo: row.cargo || 'Médico',
      setor: row.setor || 'Consultório',
      updatedAt: new Date().toISOString()
    };

    // Save to Firestore under user's Auth UID
    await db.collection('users').doc(uid).set(userPayload, { merge: true });
    summary.syncedFirestore++;

    summary.details.push({
      nome: cleanName,
      login: row.login,
      email: email,
      senha: password,
      crm: crmClean || 'N/A',
      authStatus: authCreated ? 'Criado no Auth' : 'Atualizado no Auth'
    });

    console.log(`[OK] ${cleanName} | ${email} | ${password} | CRM: ${crmClean} -> UID: ${uid}`);
  }

  // 2. Clean up any legacy mock or duplicate user docs in Firestore
  console.log('\nLimpando e formatando nomes nos documentos legados do Firestore...');
  const allUsersSnap = await db.collection('users').get();
  for (const doc of allUsersSnap.docs) {
    const data = doc.data();
    const currentName = data.name || '';
    const cleanName = formatDoctorDisplayName(currentName);
    
    // If name had CRM, Dr., Dra., etc., update it in Firestore
    if (currentName !== cleanName) {
      console.log(`[Atualizando Nome Legado] ${doc.id}: "${currentName}" -> "${cleanName}"`);
      await doc.ref.update({
        name: cleanName,
        updatedAt: new Date().toISOString()
      });
    }

    // If legacy doc had old @dialize.com.br or @nexaclinic.med.br but matches a login, let's ensure it has role: 'doctor'
    if (data.role === 'professional') {
      await doc.ref.update({
        role: 'doctor'
      });
    }
  }

  console.log('\n--- RESUMO DA OPERAÇÃO ---');
  console.log(`Total de profissionais processados: ${parsedRows.length}`);
  console.log(`Usuários criados no Firebase Auth: ${summary.createdAuth}`);
  console.log(`Usuários atualizados no Firebase Auth: ${summary.updatedAuth}`);
  console.log(`Documentos sincronizados no Firestore: ${summary.syncedFirestore}`);
  
  process.exit(0);
}

syncDoctors().catch(err => {
  console.error('Falha geral na sincronização:', err);
  process.exit(1);
});
