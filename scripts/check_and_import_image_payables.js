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

export const imageRecords = [
  {
    status: 'Atrasado',
    dueDate: '2026-07-26',
    installment: 1,
    installmentNumber: 1,
    installmentCount: 1,
    supplier: 'DCB DISTRIBUIDORA CIRURGICA BRASILEIRA LTDA',
    invoiceNumber: '107783',
    amount: 1302.00,
    unit: 'Betim',
    unitId: 'betim',
    category: 'Material Médico-Hospitalar (MatMed)',
    costCenterId: '1.1.0',
    description: 'Entrada nota fiscal 107783 - DCB DISTRIBUIDORA CIRURGICA BRASILEIRA LTDA'
  },
  {
    status: 'Atrasado',
    dueDate: '2026-07-26',
    installment: 1,
    installmentNumber: 1,
    installmentCount: 1,
    supplier: 'INTENSIVEMED IMPORTAÇÃO E COMERCIO LTDA',
    invoiceNumber: '413388',
    amount: 350.00,
    unit: 'Betim',
    unitId: 'betim',
    category: 'Material Médico-Hospitalar (MatMed)',
    costCenterId: '1.1.0',
    description: 'Entrada nota fiscal 413388 - INTENSIVEMED IMPORTAÇÃO E COMERCIO LTDA'
  },
  {
    status: 'Atrasado',
    dueDate: '2026-07-26',
    installment: 2,
    installmentNumber: 2,
    installmentCount: 2,
    supplier: 'COMERCIAL CIRURGICA RIOCLARENSE LTDA',
    invoiceNumber: '920340',
    amount: 22700.13,
    unit: 'Betim',
    unitId: 'betim',
    category: 'Material Médico-Hospitalar (MatMed)',
    costCenterId: '1.1.0',
    description: 'Entrada nota fiscal 920340 (Parc. 2) - COMERCIAL CIRURGICA RIOCLARENSE LTDA'
  },
  {
    status: 'Atrasado',
    dueDate: '2026-07-26',
    installment: 1,
    installmentNumber: 1,
    installmentCount: 1,
    supplier: 'ANCHIETA PULVERIZACOES LTDA',
    invoiceNumber: '1507',
    amount: 750.71,
    unit: 'Betim',
    unitId: 'betim',
    category: 'Serviço/Utilidades',
    costCenterId: '2.1.0',
    description: 'Entrada nota fiscal 1507 - ANCHIETA PULVERIZACOES LTDA'
  },
  {
    status: 'Atrasado',
    dueDate: '2026-07-26',
    installment: 1,
    installmentNumber: 1,
    installmentCount: 1,
    supplier: 'INTENSIVEMED IMPORTAÇÃO E COMERCIO LTDA',
    invoiceNumber: '413928',
    amount: 3011.20,
    unit: 'Betim',
    unitId: 'betim',
    category: 'Material Médico-Hospitalar (MatMed)',
    costCenterId: '1.1.0',
    description: 'Entrada nota fiscal 413928 - INTENSIVEMED IMPORTAÇÃO E COMERCIO LTDA'
  },
  {
    status: 'Atrasado',
    dueDate: '2026-07-26',
    installment: 1,
    installmentNumber: 1,
    installmentCount: 1,
    supplier: 'GERAIS COM. E IMP. DE MAT. E EQUIP. MEDICOS LTDA',
    invoiceNumber: '5975',
    amount: 5960.00,
    unit: 'Betim',
    unitId: 'betim',
    category: 'Material Médico-Hospitalar (MatMed)',
    costCenterId: '1.1.0',
    description: 'Entrada nota fiscal 5975 - GERAIS COM. E IMP. DE MAT. E EQUIP. MEDICOS LTDA'
  },
  {
    status: 'Atrasado',
    dueDate: '2026-07-26',
    installment: 1,
    installmentNumber: 1,
    installmentCount: 1,
    supplier: 'BIOCOMPANY COMERCIO E SERVIÇOS LTDA',
    invoiceNumber: '79751',
    amount: 8255.00,
    unit: 'Betim',
    unitId: 'betim',
    category: 'Material Médico-Hospitalar (MatMed)',
    costCenterId: '1.1.0',
    description: 'Entrada nota fiscal 79751 - BIOCOMPANY COMERCIO E SERVIÇOS LTDA'
  },
  {
    status: 'Atrasado',
    dueDate: '2026-07-26',
    installment: 1,
    installmentNumber: 1,
    installmentCount: 1,
    supplier: 'COMERCIAL CIRURGICA RIOCLARENSE LTDA',
    invoiceNumber: '2168182',
    amount: 10760.00,
    unit: 'Betim',
    unitId: 'betim',
    category: 'Material Médico-Hospitalar (MatMed)',
    costCenterId: '1.1.0',
    description: 'Entrada nota fiscal 2168182 - COMERCIAL CIRURGICA RIOCLARENSE LTDA'
  },
  {
    status: 'Atrasado',
    dueDate: '2026-07-26',
    installment: 2,
    installmentNumber: 2,
    installmentCount: 2,
    supplier: 'COMERCIAL CIRURGICA RIOCLARENSE LTDA',
    invoiceNumber: '922066',
    amount: 6649.93,
    unit: 'Betim',
    unitId: 'betim',
    category: 'Material Médico-Hospitalar (MatMed)',
    costCenterId: '1.1.0',
    description: 'Entrada nota fiscal 922066 (Parc. 2) - COMERCIAL CIRURGICA RIOCLARENSE LTDA'
  },
  {
    status: 'Atrasado',
    dueDate: '2026-07-28',
    installment: 1,
    installmentNumber: 1,
    installmentCount: 1,
    supplier: 'COMERCIAL CIRURGICA RIOCLARENSE LTDA',
    invoiceNumber: '931359',
    amount: 3751.80,
    unit: 'Betim',
    unitId: 'betim',
    category: 'Material Médico-Hospitalar (MatMed)',
    costCenterId: '1.1.0',
    description: 'Entrada nota fiscal 931359 - COMERCIAL CIRURGICA RIOCLARENSE LTDA'
  },
  {
    status: 'Atrasado',
    dueDate: '2026-07-28',
    installment: 1,
    installmentNumber: 1,
    installmentCount: 1,
    supplier: 'COMERCIAL CIRURGICA RIOCLARENSE LTDA',
    invoiceNumber: '931381',
    amount: 1250.50,
    unit: 'Betim',
    unitId: 'betim',
    category: 'Material Médico-Hospitalar (MatMed)',
    costCenterId: '1.1.0',
    description: 'Entrada nota fiscal 931381 - COMERCIAL CIRURGICA RIOCLARENSE LTDA'
  },
  {
    status: 'Atrasado',
    dueDate: '2026-07-30',
    installment: 1,
    installmentNumber: 1,
    installmentCount: 1,
    supplier: 'MG ESCAL LTDA - ME',
    invoiceNumber: '525',
    amount: 520.00,
    unit: 'Betim',
    unitId: 'betim',
    category: 'Serviço/Utilidades',
    costCenterId: '2.1.0',
    description: 'Entrada nota fiscal 525 - MG ESCAL LTDA - ME'
  },
  {
    status: 'Atrasado',
    dueDate: '2026-07-30',
    installment: 1,
    installmentNumber: 1,
    installmentCount: 1,
    supplier: 'COMERCIAL CIRURGICA RIOCLARENSE LTDA',
    invoiceNumber: '931603',
    amount: 4014.00,
    unit: 'Betim',
    unitId: 'betim',
    category: 'Material Médico-Hospitalar (MatMed)',
    costCenterId: '1.1.0',
    description: 'Entrada nota fiscal 931603 - COMERCIAL CIRURGICA RIOCLARENSE LTDA'
  },
  {
    status: 'Atrasado',
    dueDate: '2026-07-30',
    installment: 1,
    installmentNumber: 1,
    installmentCount: 1,
    supplier: 'COMERCIAL CIRURGICA RIOCLARENSE LTDA',
    invoiceNumber: '931672',
    amount: 11250.00,
    unit: 'Betim',
    unitId: 'betim',
    category: 'Material Médico-Hospitalar (MatMed)',
    costCenterId: '1.1.0',
    description: 'Entrada nota fiscal 931672 - COMERCIAL CIRURGICA RIOCLARENSE LTDA'
  },
  {
    status: 'Atrasado',
    dueDate: '2026-07-30',
    installment: 1,
    installmentNumber: 1,
    installmentCount: 1,
    supplier: 'KOR3 LOGISTICA INTELIGENTE PARA A SAUDE LTDA',
    invoiceNumber: '42',
    amount: 30789.22,
    unit: 'Betim',
    unitId: 'betim',
    category: 'Serviço/Utilidades',
    costCenterId: '2.1.0',
    description: 'Entrada nota fiscal 42 - KOR3 LOGISTICA INTELIGENTE PARA A SAUDE LTDA'
  },
  {
    status: 'Atrasado',
    dueDate: '2026-07-30',
    installment: 2,
    installmentNumber: 2,
    installmentCount: 2,
    supplier: 'PERICOM COMERCIO DE EQUIPAMENTO DE SEGURANÇA',
    invoiceNumber: '156464',
    amount: 1338.92,
    unit: 'Betim',
    unitId: 'betim',
    category: 'Serviço/Utilidades',
    costCenterId: '2.1.0',
    description: 'Entrada nota fiscal 156464 (Parc. 2) - PERICOM COMERCIO DE EQUIPAMENTO DE SEGURANÇA'
  },
  {
    status: 'Atrasado',
    dueDate: '2026-07-31',
    installment: 1,
    installmentNumber: 1,
    installmentCount: 1,
    supplier: 'CONTMEDI & ESTRUTURAR CONTABILIDADE E FINANCAS LTD',
    invoiceNumber: '405',
    amount: 7539.68,
    unit: 'Betim',
    unitId: 'betim',
    category: 'Jurídico, Contabilidade & Taxas Regulatórias',
    costCenterId: '3.2.0',
    description: 'Entrada nota fiscal 405 - CONTMEDI & ESTRUTURAR CONTABILIDADE E FINANCAS LTD'
  },
  {
    status: 'Atrasado',
    dueDate: '2026-07-31',
    installment: 1,
    installmentNumber: 1,
    installmentCount: 1,
    supplier: 'INTENSIVEMED IMPORTAÇÃO E COMERCIO LTDA',
    invoiceNumber: '412842',
    amount: 4032.00,
    unit: 'Betim',
    unitId: 'betim',
    category: 'Material Médico-Hospitalar (MatMed)',
    costCenterId: '1.1.0',
    description: 'Entrada nota fiscal 412842 - INTENSIVEMED IMPORTAÇÃO E COMERCIO LTDA'
  },
  {
    status: 'Atrasado',
    dueDate: '2026-07-31',
    installment: 1,
    installmentNumber: 1,
    installmentCount: 1,
    supplier: 'EVERLIMP COMERCIO E DISTRIBUIDORA LTDA',
    invoiceNumber: '71773',
    amount: 1238.00,
    unit: 'Betim',
    unitId: 'betim',
    category: 'Serviço/Utilidades',
    costCenterId: '2.1.0',
    description: 'Entrada nota fiscal 71773 - EVERLIMP COMERCIO E DISTRIBUIDORA LTDA'
  },
  {
    status: 'Atrasado',
    dueDate: '2026-07-31',
    installment: 1,
    installmentNumber: 1,
    installmentCount: 1,
    supplier: 'CONSELHO REGIONAL DE ENFERMAGEM DE MINAS GERAIS',
    invoiceNumber: '19940187',
    amount: 202.43,
    unit: 'Betim',
    unitId: 'betim',
    category: 'Jurídico, Contabilidade & Taxas Regulatórias',
    costCenterId: '3.2.0',
    description: 'Entrada nota fiscal 19940187 - CONSELHO REGIONAL DE ENFERMAGEM DE MINAS GERAIS'
  },
  {
    status: 'Atrasado',
    dueDate: '2026-07-31',
    installment: 1,
    installmentNumber: 1,
    installmentCount: 1,
    supplier: 'FORTECARE INDUSTRIA DE PRODUTOS MEDICOS LTDA',
    invoiceNumber: '77821',
    amount: 27891.95,
    unit: 'Betim',
    unitId: 'betim',
    category: 'Material Médico-Hospitalar (MatMed)',
    costCenterId: '1.1.0',
    description: 'Entrada nota fiscal 77821 - FORTECARE INDUSTRIA DE PRODUTOS MEDICOS LTDA'
  }
];

async function checkDuplicates() {
  console.log('=== VERIFICAÇÃO DE DUPLICIDADES (IMAGEM vs BANCO DE DADOS) ===\n');

  // 1. Verificar duplicidades internas na imagem
  console.log('1. Verificação interna na imagem:');
  const seenInImage = new Map();
  let imageDuplicates = 0;
  imageRecords.forEach((rec, idx) => {
    const key = `${rec.supplier}__${rec.invoiceNumber}__${rec.installment}__${rec.amount}`;
    if (seenInImage.has(key)) {
      console.log(`  [ALERTA] Duplicado na imagem: Linha ${idx + 1} com Linha ${seenInImage.get(key) + 1} (${rec.supplier} - NF ${rec.invoiceNumber})`);
      imageDuplicates++;
    } else {
      seenInImage.set(key, idx);
    }
  });
  if (imageDuplicates === 0) {
    console.log('  ✓ Nenhum registro duplicado dentro da imagem analisada. Todos os 21 registros são únicos.\n');
  }

  // 2. Conectar ao Firestore e buscar registros existentes
  console.log('2. Conectando ao Firestore...');
  await signInWithEmailAndPassword(auth, 'daliam@nexa.com', 'dalia123');
  console.log('  ✓ Autenticado.');

  const snap = await getDocs(collection(db, 'accounts_payable'));
  const dbRecords = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  console.log(`  ✓ Total de lançamentos existentes no Firestore: ${dbRecords.length}\n`);

  // 3. Comparar com registros existentes no banco
  console.log('3. Comparando registros da imagem com o Firestore:');
  const duplicatesInDb = [];
  const readyToImport = [];

  imageRecords.forEach((rec, idx) => {
    const matched = dbRecords.filter(dbItem => {
      const sameInvoice = String(dbItem.invoiceNumber || '').trim() === String(rec.invoiceNumber).trim();
      const sameSupplier = String(dbItem.supplier || '').trim().toLowerCase() === String(rec.supplier).trim().toLowerCase();
      const sameAmount = Math.abs((Number(dbItem.amount) || 0) - rec.amount) < 0.01;
      const sameDueDate = String(dbItem.dueDate || '').trim() === rec.dueDate;
      
      // Consider duplicate if same invoice and same supplier OR same supplier + amount + dueDate
      return (sameInvoice && sameSupplier) || (sameSupplier && sameAmount && sameDueDate);
    });

    if (matched.length > 0) {
      duplicatesInDb.push({
        imageRecord: rec,
        matchedInDb: matched
      });
      console.log(`  [DUPLICADO NO BANCO] NF ${rec.invoiceNumber} - ${rec.supplier} (R$ ${rec.amount.toFixed(2)})`);
      matched.forEach(m => {
        console.log(`     -> Match no DB: ID ${m.id} | NF: ${m.invoiceNumber} | Venc: ${m.dueDate} | Valor: R$ ${m.amount} | Status: ${m.status} | Unidade: ${m.unit || m.unitId}`);
      });
    } else {
      readyToImport.push(rec);
      console.log(`  [NOVO / APTO] NF ${rec.invoiceNumber} - ${rec.supplier} | R$ ${rec.amount.toFixed(2)} | Venc: ${rec.dueDate}`);
    }
  });

  console.log('\n=== RESUMO DO DIAGNÓSTICO ===');
  console.log(`Total de itens na imagem: ${imageRecords.length}`);
  console.log(`Itens duplicados no banco: ${duplicatesInDb.length}`);
  console.log(`Itens novos prontos para importação: ${readyToImport.length}`);
  
  const totalAmount = imageRecords.reduce((acc, r) => acc + r.amount, 0);
  console.log(`Valor total da imagem: R$ ${totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
}

checkDuplicates().then(() => process.exit(0)).catch(err => {
  console.error('Erro na verificação:', err);
  process.exit(1);
});
