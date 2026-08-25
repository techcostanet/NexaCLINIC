import fs from 'fs';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, getDocs, doc, writeBatch } from 'firebase/firestore';

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

async function importTaguatingaSuppliers() {
  const filePath = 'C:\\Users\\administrator\\Downloads\\Relatorio-forcenedor-taguatinga.xls';
  console.log('Reading file:', filePath);

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
  const parsedSuppliers = [];
  for (let i = 1; i < supplierRows.length; i++) {
    const [name, docStr, fantasia, cityUf] = supplierRows[i];
    if (!name || name === 'Nome') continue;
    const cnpjClean = docStr ? docStr.replace(/[^\d]/g, '') : '';
    parsedSuppliers.push({
      name: name.trim(),
      cnpj: docStr.trim(),
      cnpjClean,
      fantasia: fantasia ? fantasia.trim() : name.trim(),
      city: cityUf ? cityUf.trim() : 'Brasilia/DF',
      contact: 'Taguatinga / Compras',
      phone: '(61) 9230-1001',
      email: 'contato@dialize.com.br',
      unitId: 'taguatinga',
      unit: 'Taguatinga',
      units: ['taguatinga'],
      createdAt: new Date().toISOString()
    });
  }

  console.log(`Total suppliers in file to process: ${parsedSuppliers.length}`);

  console.log('Authenticating with Firebase...');
  await signInWithEmailAndPassword(auth, 'daliam@nexa.com', 'dalia123');
  console.log('Authenticated.');

  console.log('Fetching existing suppliers in Firestore...');
  const snap = await getDocs(collection(db, 'suppliers'));
  const existingDocs = snap.docs.map(d => ({ docId: d.id, ...d.data() }));
  console.log(`Found ${existingDocs.length} suppliers in Firestore.`);

  const fsCnpjMap = new Map();
  const fsNameMap = new Map();
  existingDocs.forEach(s => {
    const cleanCnpj = s.cnpj ? String(s.cnpj).replace(/[^\d]/g, '') : '';
    if (cleanCnpj) fsCnpjMap.set(cleanCnpj, s);
    if (s.name) fsNameMap.set(s.name.toUpperCase().trim(), s);
  });

  const suppliersCol = collection(db, 'suppliers');
  let insertedCount = 0;
  let updatedCount = 0;

  // Firestore allows up to 500 writes per batch
  let currentBatch = writeBatch(db);
  let batchOpsCount = 0;

  for (const sup of parsedSuppliers) {
    const matchByCnpj = sup.cnpjClean ? fsCnpjMap.get(sup.cnpjClean) : null;
    const matchByName = fsNameMap.get(sup.name.toUpperCase().trim());
    const existing = matchByCnpj || matchByName;

    if (existing) {
      // Update existing supplier to include Taguatinga in units array
      const existingUnits = Array.isArray(existing.units) ? [...existing.units] : (existing.unitId ? [existing.unitId] : ['betim']);
      if (!existingUnits.includes('taguatinga')) {
        existingUnits.push('taguatinga');
      }

      const docRef = doc(db, 'suppliers', existing.docId);
      currentBatch.update(docRef, {
        units: existingUnits,
        // Also ensure city / fantasia are rich
        fantasia: sup.fantasia || existing.fantasia || sup.name,
        city: sup.city || existing.city || 'Taguatinga/DF',
        lastUpdated: new Date().toISOString()
      });
      updatedCount++;
    } else {
      // Insert brand new supplier
      const newDocRef = doc(suppliersCol);
      currentBatch.set(newDocRef, {
        name: sup.name,
        cnpj: sup.cnpj,
        fantasia: sup.fantasia,
        city: sup.city,
        contact: sup.contact,
        phone: sup.phone,
        email: sup.email,
        unitId: 'taguatinga',
        unit: 'Taguatinga',
        units: ['taguatinga'],
        createdAt: new Date().toISOString()
      });
      insertedCount++;
    }

    batchOpsCount++;
    if (batchOpsCount >= 400) {
      console.log(`Committing batch of ${batchOpsCount} operations...`);
      await currentBatch.commit();
      currentBatch = writeBatch(db);
      batchOpsCount = 0;
    }
  }

  if (batchOpsCount > 0) {
    console.log(`Committing final batch of ${batchOpsCount} operations...`);
    await currentBatch.commit();
  }

  console.log('\n=== IMPORT SUMMARY ===');
  console.log(`Total processed: ${parsedSuppliers.length}`);
  console.log(`Brand new suppliers inserted: ${insertedCount}`);
  console.log(`Existing suppliers updated (multi-unit tagged): ${updatedCount}`);

  // Verify total now in Firestore
  const verifySnap = await getDocs(collection(db, 'suppliers'));
  console.log(`\nVerification: Total suppliers now in Firestore: ${verifySnap.size}`);
}

importTaguatingaSuppliers().catch(console.error);
