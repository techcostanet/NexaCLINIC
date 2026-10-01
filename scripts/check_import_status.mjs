/**
 * NexaASSIST - Verificador de Status da Ingestão de E-mails
 * Retorna 'ENABLED' ou 'DISABLED' de acordo com as configurações do Firestore (settings/email)
 */
import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

try {
  try {
    admin.initializeApp();
  } catch (e) {
    // Já inicializado
  }
  const db = getFirestore();
  const snap = await db.collection('settings').doc('email').get();
  if (snap.exists) {
    const data = snap.data();
    if (data.muralEmailImportEnabled === false) {
      process.stdout.write('DISABLED');
      process.exit(0);
    }
  }
  process.stdout.write('ENABLED');
  process.exit(0);
} catch (err) {
  process.stdout.write('ENABLED');
  process.exit(0);
}
