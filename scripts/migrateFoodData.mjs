import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, writeBatch, doc } from 'firebase/firestore';

const FOOD_CONFIG = {
  apiKey: "AIzaSyB8GxQB7iayGlwCPfnqtuLS11YjREK8YLI",
  authDomain: "nexai-food.firebaseapp.com",
  projectId: "nexai-food",
  storageBucket: "nexai-food.firebasestorage.app",
  messagingSenderId: "704351369612",
  appId: "1:704351369612:web:fdf626b69d38c601cbfea9"
};

const CLINIC_CONFIG = {
  apiKey: "AIzaSyBPw7Z_nhz7osMlGcdw4wAqXGFUkH27kug",
  authDomain: "nexa-index.firebaseapp.com",
  projectId: "nexa-index",
  storageBucket: "nexa-index.firebasestorage.app",
  messagingSenderId: "1089214920796",
  appId: "1:1089214920796:web:120f3b158f599b0236ce99"
};

const foodApp = initializeApp(FOOD_CONFIG, 'src-food');
const clinicApp = initializeApp(CLINIC_CONFIG, 'dst-clinic');

const foodDb = getFirestore(foodApp);
const clinicDb = getFirestore(clinicApp);

async function copyCollection(srcColName, dstColName) {
  console.log(`\n--- Iniciando cópia de '${srcColName}' -> '${dstColName}' ---`);
  const srcSnap = await getDocs(collection(foodDb, srcColName));
  const docs = srcSnap.docs;
  console.log(`Encontrados ${docs.length} documentos em '${srcColName}'.`);

  if (docs.length === 0) return { srcCount: 0, dstCount: 0 };

  const BATCH_SIZE = 400;
  let batch = writeBatch(clinicDb);
  let batchCount = 0;
  let totalCommitted = 0;

  for (let i = 0; i < docs.length; i++) {
    const d = docs[i];
    const data = d.data();
    const dstRef = doc(clinicDb, dstColName, d.id);
    batch.set(dstRef, data);
    batchCount++;

    if (batchCount >= BATCH_SIZE) {
      await batch.commit();
      totalCommitted += batchCount;
      console.log(`  Gravados ${totalCommitted}/${docs.length} em '${dstColName}'...`);
      batch = writeBatch(clinicDb);
      batchCount = 0;
    }
  }

  if (batchCount > 0) {
    await batch.commit();
    totalCommitted += batchCount;
    console.log(`  Gravados ${totalCommitted}/${docs.length} em '${dstColName}' (finalizado).`);
  }

  // Validação
  const dstSnap = await getDocs(collection(clinicDb, dstColName));
  console.log(`✓ Verificação: '${dstColName}' no nexa-index possui ${dstSnap.docs.length} documentos.`);

  return { srcCount: docs.length, dstCount: dstSnap.docs.length };
}

async function run() {
  console.log('Iniciando migração 100% cloud de nexai-food para nexa-index...');
  const t0 = Date.now();

  const resProducts = await copyCollection('products', 'food_products');
  const resAreas = await copyCollection('areas', 'food_areas');
  const resEntries = await copyCollection('entries', 'food_entries');
  const resWaste = await copyCollection('waste', 'food_waste');

  const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
  console.log('\n=============================================');
  console.log(`MIGRAÇÃO CONCLUÍDA EM ${elapsed}s:`);
  console.log(`- Produtos: ${resProducts.dstCount}/${resProducts.srcCount}`);
  console.log(`- Áreas: ${resAreas.dstCount}/${resAreas.srcCount}`);
  console.log(`- Entradas: ${resEntries.dstCount}/${resEntries.srcCount}`);
  console.log(`- Sobras: ${resWaste.dstCount}/${resWaste.srcCount}`);
  console.log('=============================================\n');

  process.exit(0);
}

run().catch(err => {
  console.error('Erro fatal na migração:', err);
  process.exit(1);
});
