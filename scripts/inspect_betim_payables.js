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

async function inspectBetimPayables() {
  await signInWithEmailAndPassword(auth, 'daliam@nexa.com', 'dalia123');
  console.log('Autenticado com sucesso.');

  const snap = await getDocs(collection(db, 'accounts_payable'));
  const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));

  console.log(`Total de documentos em accounts_payable: ${docs.length}`);

  const betimDocs = docs.filter(d => 
    String(d.unit || d.unitId || '').toLowerCase().includes('betim')
  );
  console.log(`Documentos de Betim: ${betimDocs.length}`);

  const sample = betimDocs.slice(0, 5);
  console.log('\n--- Exemplo de Estrutura de Documentos de Betim ---');
  console.log(JSON.stringify(sample, null, 2));

  // Check Nipro, Vantive, FGTS, etc. in Betim
  const nipro = betimDocs.filter(d => String(d.supplier || '').toUpperCase().includes('NIPRO'));
  console.log(`\nNipro em Betim: ${nipro.length} docs`);
  nipro.forEach(n => console.log(`  -> NF: ${n.invoiceNumber} | Valor: ${n.amount || n.value} | Venc: ${n.dueDate} | Status: ${n.status}`));

  const sicoob = betimDocs.filter(d => String(d.supplier || '').toUpperCase().includes('SICOOB'));
  console.log(`\nSicoob em Betim: ${sicoob.length} docs`);
  sicoob.forEach(s => console.log(`  -> NF: ${s.invoiceNumber} | Valor: ${s.amount || s.value} | Venc: ${s.dueDate} | Status: ${s.status}`));

  const jul2026 = betimDocs.filter(d => String(d.dueDate || '').includes('2026-07'));
  console.log(`\nLançamentos em Betim com dueDate em Julho/2026: ${jul2026.length} docs`);

  const statusCount = {};
  betimDocs.forEach(d => {
    statusCount[d.status] = (statusCount[d.status] || 0) + 1;
  });
  console.log('\nStatus dos documentos de Betim:', statusCount);
}

inspectBetimPayables().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});
