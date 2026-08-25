import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

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

async function checkDoc() {
  await signInWithEmailAndPassword(auth, 'daliam@nexa.com', 'dalia123');
  const d1 = await getDoc(doc(db, 'accounts_payable', 'VLuGac4DMFzH41rjQrVC'));
  const d2 = await getDoc(doc(db, 'accounts_payable', 'hO3CbTVuAxvelrE0Xsus'));

  console.log('Doc VLuGac4DMFzH41rjQrVC:', d1.data());
  console.log('Doc hO3CbTVuAxvelrE0Xsus:', d2.data());
}

checkDoc().then(() => process.exit(0)).catch(console.error);
