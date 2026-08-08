import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, query, where, getDocs, updateDoc, doc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBPw7Z_nhz7osMlGcdw4wAqXGFUkH27kug",
  authDomain: "nexa-index.firebaseapp.com",
  projectId: "nexa-index",
  storageBucket: "nexa-index.firebasestorage.app",
  messagingSenderId: "1089214920796",
  appId: "1:1089214920796:web:120f3b158f599b0236ce99",
  measurementId: "G-JB7DJRKXV4"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function run() {
  try {
    const cred = await signInWithEmailAndPassword(auth, 'contato@techcosta.net', 'Techcosta123!');
    console.log("Logged in as admin");
    
    // First, let's just see if she is in Firestore
    const q = query(collection(db, 'users'), where('email', '==', 'giulliasp@nexa.com'));
    const snap = await getDocs(q);
    if (!snap.empty) {
      snap.forEach(d => {
        console.log("Found User in Firestore:", d.id, d.data());
      });
      // We will also set the authPassword in Firestore to giulliasp123 so auto-healing can pick it up if needed? 
      // Actually, if we just want her to log in with giulliasp123, we can't change Auth without the old password.
      // But wait, what if I delete her from Firebase Auth? (Requires Admin SDK)
    } else {
      console.log("User not found in Firestore either.");
    }
    
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
run();
