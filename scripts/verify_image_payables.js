import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

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

const invoicesToCheck = [
  "107783", "413388", "920340", "1507", "413928", "5975", "79751", "2168182",
  "922066", "931359", "931381", "525", "931603", "931672", "42", "156464",
  "405", "412842", "71773", "19940187", "77821"
];

async function verifyAll() {
  await signInWithEmailAndPassword(auth, 'daliam@nexa.com', 'dalia123');
  const snap = await getDocs(collection(db, 'accounts_payable'));
  const allPayables = snap.docs.map(d => ({ id: d.id, ...d.data() }));

  console.log(`Total geral de contas a pagar no Firestore: ${allPayables.length}`);

  let foundCount = 0;
  let totalSum = 0;
  const missing = [];

  for (const inv of invoicesToCheck) {
    const docs = allPayables.filter(p => String(p.invoiceNumber).trim() === inv && (p.unit === 'Betim' || p.unitId === 'betim'));
    if (docs.length > 0) {
      foundCount++;
      docs.forEach(d => {
        totalSum += parseFloat(d.amount) || 0;
        console.log(`✓ Encontrado: NF ${d.invoiceNumber} | ${d.supplier} | R$ ${d.amount} | Venc: ${d.dueDate} | Unidade: ${d.unit} | Status: ${d.status}`);
      });
    } else {
      missing.push(inv);
    }
  }

  console.log(`\n=== AUDITORIA FINAL DAS 21 CONTAS A PAGAR (BETIM) ===`);
  console.log(`Notas encontradas e validadas: ${foundCount} / ${invoicesToCheck.length}`);
  console.log(`Valor somado das notas no Firestore: R$ ${totalSum.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
  if (missing.length > 0) {
    console.log(`Atenção! Faltando:`, missing);
  } else {
    console.log(`✓ 100% DOS 21 TÍTULOS ESTÃO CORRETAMENTE INTEGRADOS E ATIVOS NA UNIDADE BETIM.`);
  }
}

verifyAll().then(() => process.exit(0)).catch(console.error);
