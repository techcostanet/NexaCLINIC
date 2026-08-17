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

const allRelatedCollections = [
  'accounts_payable',
  'accounts_receivable',
  'debts',
  'bank_statements',
  'budget_plans',
  'agreements',
  'xml_imports',
  'purchases',
  'purchase_invoices'
];

async function main() {
  await signInWithEmailAndPassword(auth, 'daliam@nexa.com', 'dalia123');
  console.log('Autenticado no Firestore.');

  for (const colName of allRelatedCollections) {
    const snap = await getDocs(collection(db, colName));
    console.log(`Coleção [${colName}]: ${snap.docs.length} documentos`);
  }
}

main().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});
