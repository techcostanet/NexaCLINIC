import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc } from 'firebase/firestore';

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

const payablesToImport = [
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
    costCenterId: '1.1',
    description: 'Entrada nota fiscal 107783',
    bankAccount: 'Itaú Unibanco (PJ)',
    paymentMethod: 'Boleto Bancário',
    natureType: 'Custo Variável / Operacional'
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
    costCenterId: '1.1',
    description: 'Entrada nota fiscal 413388',
    bankAccount: 'Itaú Unibanco (PJ)',
    paymentMethod: 'Boleto Bancário',
    natureType: 'Custo Variável / Operacional'
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
    costCenterId: '1.1',
    description: 'Entrada nota fiscal 920340 (Parc. 2)',
    bankAccount: 'Itaú Unibanco (PJ)',
    paymentMethod: 'Boleto Bancário',
    natureType: 'Custo Variável / Operacional'
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
    costCenterId: '2.1',
    description: 'Entrada nota fiscal 1507',
    bankAccount: 'Itaú Unibanco (PJ)',
    paymentMethod: 'Boleto Bancário',
    natureType: 'Custo Operacional'
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
    costCenterId: '1.1',
    description: 'Entrada nota fiscal 413928',
    bankAccount: 'Itaú Unibanco (PJ)',
    paymentMethod: 'Boleto Bancário',
    natureType: 'Custo Variável / Operacional'
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
    costCenterId: '1.1',
    description: 'Entrada nota fiscal 5975',
    bankAccount: 'Itaú Unibanco (PJ)',
    paymentMethod: 'Boleto Bancário',
    natureType: 'Custo Variável / Operacional'
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
    costCenterId: '1.1',
    description: 'Entrada nota fiscal 79751',
    bankAccount: 'Itaú Unibanco (PJ)',
    paymentMethod: 'Boleto Bancário',
    natureType: 'Custo Variável / Operacional'
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
    costCenterId: '1.1',
    description: 'Entrada nota fiscal 2168182',
    bankAccount: 'Itaú Unibanco (PJ)',
    paymentMethod: 'Boleto Bancário',
    natureType: 'Custo Variável / Operacional'
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
    costCenterId: '1.1',
    description: 'Entrada nota fiscal 922066 (Parc. 2)',
    bankAccount: 'Itaú Unibanco (PJ)',
    paymentMethod: 'Boleto Bancário',
    natureType: 'Custo Variável / Operacional'
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
    costCenterId: '1.1',
    description: 'Entrada nota fiscal 931359',
    bankAccount: 'Itaú Unibanco (PJ)',
    paymentMethod: 'Boleto Bancário',
    natureType: 'Custo Variável / Operacional'
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
    costCenterId: '1.1',
    description: 'Entrada nota fiscal 931381',
    bankAccount: 'Itaú Unibanco (PJ)',
    paymentMethod: 'Boleto Bancário',
    natureType: 'Custo Variável / Operacional'
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
    category: 'Engenharia Clínica & Manutenção de Equipamentos',
    costCenterId: '2.1',
    description: 'Entrada nota fiscal 525',
    bankAccount: 'Itaú Unibanco (PJ)',
    paymentMethod: 'Boleto Bancário',
    natureType: 'Custo Operacional'
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
    costCenterId: '1.1',
    description: 'Entrada nota fiscal 931603',
    bankAccount: 'Itaú Unibanco (PJ)',
    paymentMethod: 'Boleto Bancário',
    natureType: 'Custo Variável / Operacional'
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
    costCenterId: '1.1',
    description: 'Entrada nota fiscal 931672',
    bankAccount: 'Itaú Unibanco (PJ)',
    paymentMethod: 'Boleto Bancário',
    natureType: 'Custo Variável / Operacional'
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
    category: 'Serviços Médicos & Honorários PJ',
    costCenterId: '2.1',
    description: 'Entrada nota fiscal 42',
    bankAccount: 'Itaú Unibanco (PJ)',
    paymentMethod: 'Boleto Bancário',
    natureType: 'Custo Operacional'
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
    category: 'Despesas Gerais & Administrativas',
    costCenterId: '2.1',
    description: 'Entrada nota fiscal 156464 (Parc. 2)',
    bankAccount: 'Itaú Unibanco (PJ)',
    paymentMethod: 'Boleto Bancário',
    natureType: 'Custo Operacional'
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
    costCenterId: '3.2',
    description: 'Entrada nota fiscal 405',
    bankAccount: 'Itaú Unibanco (PJ)',
    paymentMethod: 'Boleto Bancário',
    natureType: 'Despesa Administrativa'
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
    costCenterId: '1.1',
    description: 'Entrada nota fiscal 412842',
    bankAccount: 'Itaú Unibanco (PJ)',
    paymentMethod: 'Boleto Bancário',
    natureType: 'Custo Variável / Operacional'
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
    category: 'Lavanderia & Higienização Hospitalar',
    costCenterId: '2.1',
    description: 'Entrada nota fiscal 71773',
    bankAccount: 'Itaú Unibanco (PJ)',
    paymentMethod: 'Boleto Bancário',
    natureType: 'Custo Operacional'
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
    costCenterId: '3.2',
    description: 'Entrada nota fiscal 19940187',
    bankAccount: 'Itaú Unibanco (PJ)',
    paymentMethod: 'Boleto Bancário',
    natureType: 'Despesa Administrativa'
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
    costCenterId: '1.1',
    description: 'Entrada nota fiscal 77821',
    bankAccount: 'Itaú Unibanco (PJ)',
    paymentMethod: 'Boleto Bancário',
    natureType: 'Custo Variável / Operacional'
  }
];

async function runImport() {
  console.log('=== EXECUÇÃO DA IMPORTAÇÃO PARA A UNIDADE BETIM ===\n');
  await signInWithEmailAndPassword(auth, 'daliam@nexa.com', 'dalia123');
  console.log('✓ Autenticado com sucesso no Firebase.');

  const colRef = collection(db, 'accounts_payable');
  const snap = await getDocs(colRef);
  const existingPayables = snap.docs.map(d => ({ id: d.id, ...d.data() }));

  let insertedCount = 0;
  let updatedCount = 0;
  let skippedCount = 0;
  let totalImportedAmount = 0;

  for (const item of payablesToImport) {
    // Check if exactly matches an existing record in DB
    const exactMatch = existingPayables.find(p => {
      const sameInvoice = String(p.invoiceNumber || '').trim() === String(item.invoiceNumber).trim();
      const sameSupplier = String(p.supplier || '').trim().toLowerCase() === String(item.supplier).trim().toLowerCase();
      const sameAmount = Math.abs((Number(p.amount) || 0) - item.amount) < 0.01;
      const sameDueDate = String(p.dueDate || '').trim() === item.dueDate;
      return sameInvoice && sameSupplier && sameAmount && sameDueDate;
    });

    if (exactMatch) {
      console.log(`[EXISTENTE] NF ${item.invoiceNumber} - ${item.supplier} já existe (ID: ${exactMatch.id}).`);
      // Update unit and status if necessary
      if (exactMatch.unit !== 'Betim' || exactMatch.unitId !== 'betim' || exactMatch.status !== 'Atrasado') {
        await updateDoc(doc(db, 'accounts_payable', exactMatch.id), {
          unit: 'Betim',
          unitId: 'betim',
          status: 'Atrasado'
        });
        console.log(`   -> Atualizada unidade e status para Betim / Atrasado no documento existente.`);
        updatedCount++;
      } else {
        skippedCount++;
      }
      totalImportedAmount += item.amount;
      continue;
    }

    // Insert new document
    const payload = {
      ...item,
      cnpj: item.cnpj || '00.000.000/0001-00',
      createdAt: new Date().toISOString()
    };

    const newDoc = await addDoc(colRef, payload);
    insertedCount++;
    totalImportedAmount += item.amount;
    console.log(`[INSERIDO ${insertedCount}/20] NF ${item.invoiceNumber} | ${item.supplier} | R$ ${item.amount.toFixed(2)} | Venc: ${item.dueDate} (ID: ${newDoc.id})`);
  }

  console.log('\n=== AUDITORIA E RESUMO FINAL ===');
  console.log(`Total de lançamentos processados: ${payablesToImport.length}`);
  console.log(`Lançamentos novos inseridos: ${insertedCount}`);
  console.log(`Lançamentos existentes atualizados: ${updatedCount}`);
  console.log(`Lançamentos ignorados (já idênticos): ${skippedCount}`);
  console.log(`Valor total consolidado importado: R$ ${totalImportedAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
}

runImport().then(() => process.exit(0)).catch(err => {
  console.error('Erro na importação:', err);
  process.exit(1);
});
