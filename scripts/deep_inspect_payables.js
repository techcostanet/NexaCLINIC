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

async function deepInspect() {
  await signInWithEmailAndPassword(auth, 'daliam@nexa.com', 'dalia123');
  const snap = await getDocs(collection(db, 'accounts_payable'));
  const dbRecords = snap.docs.map(d => ({ id: d.id, ...d.data() }));

  console.log('--- DETALHES DE DCB DISTRIBUIDORA CIRURGICA NO DB ---');
  const dcbList = dbRecords.filter(d => 
    String(d.supplier).toUpperCase().includes('DCB') || 
    String(d.invoiceNumber).includes('107783')
  );
  console.log(JSON.stringify(dcbList, null, 2));

  console.log('\n--- VERIFICAÇÃO DE VALORES E FORNECEDORES DA IMAGEM NO BANCO ---');
  const imageSuppliers = [
    'INTENSIVEMED',
    'RIOCLARENSE',
    'ANCHIETA',
    'GERAIS',
    'BIOCOMPANY',
    'MG ESCAL',
    'KOR3',
    'PERICOM',
    'CONTMEDI',
    'EVERLIMP',
    'ENFERMAGEM',
    'FORTECARE'
  ];

  for (const s of imageSuppliers) {
    const found = dbRecords.filter(d => String(d.supplier || '').toUpperCase().includes(s));
    console.log(`Fornecedor contendo "${s}": ${found.length} registros no DB.`);
    if (found.length > 0) {
      found.forEach(f => {
        console.log(`   -> ID: ${f.id} | NF: ${f.invoiceNumber} | Venc: ${f.dueDate} | Valor: ${f.amount} | Unit: ${f.unit || f.unitId}`);
      });
    }
  }
}

deepInspect().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});
