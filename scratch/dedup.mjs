import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, deleteDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBPw7Z_nhz7osMlGcdw4wAqXGFUkH27kug",
  authDomain: "nexa-index.firebaseapp.com",
  projectId: "nexa-index",
  storageBucket: "nexa-index.firebasestorage.app",
  messagingSenderId: "1089214920796",
  appId: "1:1089214920796:web:120f3b158f599b0236ce99"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function runDedup() {
  console.log("Fetching accounts_payable...");
  const snap = await getDocs(collection(db, 'accounts_payable'));
  const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  
  console.log(`Found ${docs.length} total records.`);

  const seen = new Map();
  const duplicates = [];

  for (const record of docs) {
    const key = `${record.supplier}_${record.amount}_${record.dueDate}`;
    if (seen.has(key)) {
      duplicates.push(record);
    } else {
      seen.set(key, record);
    }
  }

  console.log(`Found ${duplicates.length} duplicate records.`);

  let deleted = 0;
  for (const dup of duplicates) {
    console.log(`Deleting duplicate: ${dup.id} (${dup.supplier} - ${dup.amount} - ${dup.dueDate})`);
    await deleteDoc(doc(db, 'accounts_payable', dup.id));
    deleted++;
  }

  console.log(`Done. Deleted ${deleted} duplicates.`);
  process.exit(0);
}

runDedup().catch(console.error);
