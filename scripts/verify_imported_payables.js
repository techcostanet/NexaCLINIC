import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';

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

const requestedInvoices = [
  "123594", "123595", "127070", "128153", "126018", "126021", "130642", "126579",
  "128154", "127071", "126022", "127069", "129483", "127059", "125517", "125527",
  "123597", "126020", "124899", "129485", "123602", "124068", "124070", "129942",
  "129487", "123592", "128152", "123601", "123596", "125522", "124071", "125519",
  "129486", "124897", "128525", "129943", "124896", "124067"
];

async function verify() {
  await signInWithEmailAndPassword(auth, 'daliam@nexa.com', 'dalia123');
  const snap = await getDocs(collection(db, 'accounts_payable'));
  const allPayables = snap.docs.map(d => ({ id: d.id, ...d.data() }));

  console.log(`Total geral de contas a pagar no Firestore: ${allPayables.length}`);

  let foundCount = 0;
  let totalSum = 0;
  const missing = [];

  for (const inv of requestedInvoices) {
    const doc = allPayables.find(p => p.invoiceNumber === inv && p.supplier === 'VANTIVE HEALT BRASIL LTDA');
    if (doc) {
      foundCount++;
      totalSum += parseFloat(doc.amount) || 0;
    } else {
      missing.push(inv);
    }
  }

  console.log(`\n=== RELATÓRIO DE AUDITORIA DAS 38 NOTAS ===`);
  console.log(`Notas solicitadas encontradas: ${foundCount} / ${requestedInvoices.length}`);
  console.log(`Valor somado das 38 notas no Firestore: R$ ${totalSum.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
  if (missing.length > 0) {
    console.log(`Notas faltantes:`, missing);
  } else {
    console.log(`✓ 100% DAS 38 NOTAS ESTÃO SALVAS E CONFIRMADAS NO FIRESTORE CLOUD!`);
  }
}

verify().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});
