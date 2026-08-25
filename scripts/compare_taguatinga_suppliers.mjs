import fs from 'fs';
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

async function compareSuppliers() {
  const filePath = 'C:\\Users\\administrator\\Downloads\\Relatorio-forcenedor-taguatinga.xls';
  const buffer = fs.readFileSync(filePath);
  const content = buffer.toString('latin1');

  const trRegex = /<tr[\s\S]*?<\/tr>/gi;
  const tdRegex = /<td[\s\S]*?>([\s\S]*?)<\/td>/gi;

  const rawRows = [];
  let match;
  while ((match = trRegex.exec(content)) !== null) {
    const trContent = match[0];
    const cells = [];
    let tdMatch;
    while ((tdMatch = tdRegex.exec(trContent)) !== null) {
      let cellText = tdMatch[1].replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim();
      cells.push(cellText);
    }
    if (cells.length > 0) {
      rawRows.push(cells);
    }
  }

  const supplierRows = rawRows.filter(r => r.length === 4);
  const fileSuppliers = [];
  for (let i = 1; i < supplierRows.length; i++) {
    const [name, doc, fantasia, cityUf] = supplierRows[i];
    if (!name || name === 'Nome') continue;
    const cnpjClean = doc ? doc.replace(/[^\d]/g, '') : '';
    fileSuppliers.push({
      name: name.trim(),
      cnpj: doc.trim(),
      cnpjClean,
      fantasia: fantasia ? fantasia.trim() : name.trim(),
      city: cityUf ? cityUf.trim() : 'Taguatinga/DF',
      unitId: 'taguatinga',
      unit: 'Taguatinga'
    });
  }

  console.log(`Suppliers in file: ${fileSuppliers.length}`);

  await signInWithEmailAndPassword(auth, 'daliam@nexa.com', 'dalia123');
  const snap = await getDocs(collection(db, 'suppliers'));
  const firestoreSuppliers = snap.docs.map(d => ({ docId: d.id, ...d.data() }));
  console.log(`Suppliers in Firestore: ${firestoreSuppliers.length}`);

  // Build lookup maps from Firestore
  const fsCnpjMap = new Map();
  const fsNameMap = new Map();

  firestoreSuppliers.forEach(s => {
    const cleanCnpj = s.cnpj ? String(s.cnpj).replace(/[^\d]/g, '') : '';
    if (cleanCnpj) fsCnpjMap.set(cleanCnpj, s);
    if (s.name) fsNameMap.set(s.name.toUpperCase().trim(), s);
  });

  const existingInFirestore = [];
  const brandNew = [];

  fileSuppliers.forEach(s => {
    const matchByCnpj = s.cnpjClean ? fsCnpjMap.get(s.cnpjClean) : null;
    const matchByName = fsNameMap.get(s.name.toUpperCase().trim());
    const existing = matchByCnpj || matchByName;

    if (existing) {
      existingInFirestore.push({ fileSupplier: s, existing });
    } else {
      brandNew.push(s);
    }
  });

  console.log(`\nAlready in Firestore (matched by CNPJ or Name): ${existingInFirestore.length}`);
  console.log(`Brand new suppliers to insert: ${brandNew.length}`);

  if (existingInFirestore.length > 0) {
    console.log('\nSample matched existing:');
    existingInFirestore.slice(0, 5).forEach(({ fileSupplier, existing }) => {
      console.log(`- File: "${fileSupplier.name}" (${fileSupplier.cnpj}) <==> DB: "${existing.name}" (${existing.cnpj}) [Unit in DB: ${existing.unitId || existing.unit || 'none'}]`);
    });
  }
}

compareSuppliers().catch(console.error);
