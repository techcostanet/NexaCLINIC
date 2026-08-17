import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, getDocs, writeBatch, doc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || "AIzaSyBPw7Z_nhz7osMlGcdw4wAqXGFUkH27kug",
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || "nexa-index.firebaseapp.com",
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || "nexa-index",
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || "nexa-index.firebasestorage.app",
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1089214920796",
  appId: process.env.VITE_FIREBASE_APP_ID || "1:1089214920796:web:120f3b158f599b0236ce99",
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID || "G-JB7DJRKXV4"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const financialCollections = [
  'accounts_payable',
  'accounts_receivable',
  'debts',
  'bank_statements',
  'budget_plans',
  'agreements',
  'xml_imports'
];

async function wipeCollection(colName) {
  const snap = await getDocs(collection(db, colName));
  const total = snap.docs.length;
  if (total === 0) {
    console.log(`[${colName}] Já está vazia (0 registros).`);
    return 0;
  }

  console.log(`[${colName}] Excluindo ${total} documentos...`);
  const docs = snap.docs;
  const chunkSize = 400; // Firestore batch max limit is 500

  for (let i = 0; i < docs.length; i += chunkSize) {
    const chunk = docs.slice(i, i + chunkSize);
    const batch = writeBatch(db);
    for (const d of chunk) {
      batch.delete(doc(db, colName, d.id));
    }
    await batch.commit();
    console.log(`  Progresso: ${Math.min(i + chunkSize, total)} / ${total} registros apagados.`);
  }

  console.log(`[${colName}] Exclusão concluída com sucesso (${total} registros apagados).`);
  return total;
}

async function main() {
  console.log('=== LIMPEZA TOTAL DO MÓDULO FINANCEIRO (FIRESTORE CLOUD) ===');
  await signInWithEmailAndPassword(auth, 'daliam@nexa.com', 'dalia123');
  console.log('Autenticado com sucesso no Firebase.\n');

  let grandTotal = 0;
  for (const colName of financialCollections) {
    const deletedCount = await wipeCollection(colName);
    grandTotal += deletedCount;
  }

  console.log(`\n=== LIMPEZA FINALIZADA: Total de ${grandTotal} documentos excluídos do Financeiro. ===`);
}

main().then(() => process.exit(0)).catch(err => {
  console.error('Erro durante a exclusão:', err);
  process.exit(1);
});
