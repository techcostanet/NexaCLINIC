import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, addDoc, getDocs, query, where } from 'firebase/firestore';

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

const payablesData = [
  { invoiceNumber: "123594", amount: 2354.17 },
  { invoiceNumber: "123595", amount: 2354.17 },
  { invoiceNumber: "127070", amount: 2984.56 },
  { invoiceNumber: "128153", amount: 2984.56 },
  { invoiceNumber: "126018", amount: 2984.56 },
  { invoiceNumber: "126021", amount: 2984.56 },
  { invoiceNumber: "130642", amount: 2984.56 },
  { invoiceNumber: "126579", amount: 2984.56 },
  { invoiceNumber: "128154", amount: 2984.56 },
  { invoiceNumber: "127071", amount: 2984.56 },
  { invoiceNumber: "126022", amount: 2984.56 },
  { invoiceNumber: "127069", amount: 2354.17 },
  { invoiceNumber: "129483", amount: 2984.56 },
  { invoiceNumber: "127059", amount: 2354.17 },
  { invoiceNumber: "125517", amount: 2984.56 },
  { invoiceNumber: "125527", amount: 2984.56 },
  { invoiceNumber: "123597", amount: 2984.56 },
  { invoiceNumber: "126020", amount: 2984.56 },
  { invoiceNumber: "124899", amount: 2984.56 },
  { invoiceNumber: "129485", amount: 2984.56 },
  { invoiceNumber: "123602", amount: 2984.56 },
  { invoiceNumber: "124068", amount: 2984.56 },
  { invoiceNumber: "124070", amount: 2984.56 },
  { invoiceNumber: "129942", amount: 2984.56 },
  { invoiceNumber: "129487", amount: 2984.56 },
  { invoiceNumber: "123592", amount: 2984.56 },
  { invoiceNumber: "128152", amount: 2984.56 },
  { invoiceNumber: "123601", amount: 2984.56 },
  { invoiceNumber: "123596", amount: 2984.56 },
  { invoiceNumber: "125522", amount: 2984.56 },
  { invoiceNumber: "124071", amount: 2984.56 },
  { invoiceNumber: "125519", amount: 2984.56 },
  { invoiceNumber: "129486", amount: 2984.56 },
  { invoiceNumber: "124897", amount: 2984.56 },
  { invoiceNumber: "128525", amount: 2984.56 },
  { invoiceNumber: "129943", amount: 2984.56 },
  { invoiceNumber: "124896", amount: 2984.56 },
  { invoiceNumber: "124067", amount: 2984.56 }
];

async function main() {
  console.log('=== IMPORTAÇÃO DE CONTAS A PAGAR - VANTIVE HEALTH (FIRESTORE) ===');
  await signInWithEmailAndPassword(auth, 'daliam@nexa.com', 'dalia123');
  console.log('✓ Autenticado com sucesso no Firebase.');

  const colRef = collection(db, 'accounts_payable');

  // Check existing docs to prevent duplicate imports
  const existingSnap = await getDocs(query(colRef, where('supplier', '==', 'VANTIVE HEALT BRASIL LTDA')));
  const existingInvoices = new Set(existingSnap.docs.map(d => d.data().invoiceNumber));
  console.log(`Encontrados ${existingInvoices.size} lançamentos prévios da Vantive no Firestore.`);

  let insertedCount = 0;
  let totalImportedAmount = 0;

  for (const item of payablesData) {
    if (existingInvoices.has(item.invoiceNumber)) {
      console.log(`[PULADO] NF ${item.invoiceNumber} já existe no banco.`);
      continue;
    }

    const docPayload = {
      supplier: 'VANTIVE HEALT BRASIL LTDA',
      description: 'Entrada nota fiscal',
      invoiceNumber: item.invoiceNumber,
      amount: item.amount,
      dueDate: '2026-08-10',
      status: 'Pendente',
      category: 'Material Médico-Hospitalar (MatMed)',
      costCenterId: '1.9', // Diálise Peritoneal (DP / DPA)
      unit: 'Betim',
      paymentMethod: 'Boleto',
      bankAccount: 'Itaú Unibanco (PJ)',
      natureType: 'Custo Variável / Operacional',
      createdAt: new Date().toISOString()
    };

    const docRef = await addDoc(colRef, docPayload);
    insertedCount++;
    totalImportedAmount += item.amount;
    console.log(`[${insertedCount}/${payablesData.length}] Inserida NF ${item.invoiceNumber} - R$ ${item.amount.toFixed(2)} (ID: ${docRef.id})`);
  }

  console.log('\n=== VERIFICAÇÃO FINAL NA NUVEM ===');
  const verifySnap = await getDocs(query(colRef, where('supplier', '==', 'VANTIVE HEALT BRASIL LTDA')));
  console.log(`✓ Total de documentos da Vantive no Firestore: ${verifySnap.docs.length}`);
  
  let totalCloudSum = 0;
  verifySnap.docs.forEach(d => {
    totalCloudSum += parseFloat(d.data().amount) || 0;
  });
  console.log(`✓ Soma total dos valores da Vantive na nuvem: R$ ${totalCloudSum.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
  console.log(`✓ Lançamentos novos importados nesta execução: ${insertedCount}`);
}

main().then(() => process.exit(0)).catch(err => {
  console.error('Erro na importação:', err);
  process.exit(1);
});
