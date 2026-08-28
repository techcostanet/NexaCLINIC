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

async function inspectTaguatinga() {
  await signInWithEmailAndPassword(auth, 'daliam@nexa.com', 'dalia123');
  console.log('Autenticado com sucesso.');

  const snap = await getDocs(collection(db, 'accounts_payable'));
  const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));

  console.log(`Total de documentos em accounts_payable: ${docs.length}`);

  const tagDocs = docs.filter(d => 
    String(d.unit || d.unitId || '').toLowerCase().includes('tag') ||
    String(d.unit || d.unitId || '').toLowerCase().includes('taguatinga')
  );
  console.log(`Documentos de Taguatinga no banco: ${tagDocs.length}`);

  const statusCount = {};
  tagDocs.forEach(d => {
    statusCount[d.status] = (statusCount[d.status] || 0) + 1;
  });
  console.log('Status dos documentos de Taguatinga:', statusCount);

  if (tagDocs.length > 0) {
    console.log('\n--- Exemplo de 5 documentos de Taguatinga ---');
    console.log(JSON.stringify(tagDocs.slice(0, 5), null, 2));
  }
}

inspectTaguatinga().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});
