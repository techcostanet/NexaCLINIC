import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

try {
  admin.initializeApp();
  console.log("App initialized");
  
  const db = getFirestore();
  
  async function findDuplicates() {
    const payablesSnap = await db.collection('accounts_payable').get();
    const receivablesSnap = await db.collection('accounts_receivable').get();
    
    const seenPayables = new Map();
    const duplicatePayables = [];
    
    payablesSnap.forEach(doc => {
      const p = doc.data();
      const key = `${p.supplier}_${p.amount}_${p.dueDate}`;
      if (seenPayables.has(key)) {
        duplicatePayables.push({ id: doc.id, ...p });
      } else {
        seenPayables.set(key, { id: doc.id, ...p });
      }
    });

    const seenReceivables = new Map();
    const duplicateReceivables = [];

    receivablesSnap.forEach(doc => {
      const r = doc.data();
      const key = `${r.client}_${r.amount}_${r.dueDate}`;
      if (seenReceivables.has(key)) {
        duplicateReceivables.push({ id: doc.id, ...r });
      } else {
        seenReceivables.set(key, { id: doc.id, ...r });
      }
    });
    
    console.log(JSON.stringify({
      payables: duplicatePayables.map(d => ({id: d.id, supplier: d.supplier, amount: d.amount, dueDate: d.dueDate})),
      receivables: duplicateReceivables.map(d => ({id: d.id, client: d.client, amount: d.amount, dueDate: d.dueDate}))
    }, null, 2));
    
    process.exit(0);
  }
  
  findDuplicates();

} catch (e) {
  console.error("Init error:", e);
  process.exit(1);
}
