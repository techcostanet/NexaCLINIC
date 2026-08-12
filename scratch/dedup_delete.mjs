import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

try {
  admin.initializeApp();
  console.log("App initialized");
  
  const db = getFirestore();
  
  async function findAndDeleteDuplicates() {
    console.log("Fetching payables...");
    const payablesSnap = await db.collection('accounts_payable').get();
    
    const seenPayables = new Map();
    const duplicatesToDelete = [];
    
    payablesSnap.forEach(doc => {
      const p = doc.data();
      const key = `${p.supplier}_${p.amount}_${p.dueDate}`;
      if (seenPayables.has(key)) {
        duplicatesToDelete.push(doc.id);
      } else {
        seenPayables.set(key, doc.id);
      }
    });

    console.log(`Found ${duplicatesToDelete.length} duplicates. Starting deletion...`);
    
    const batchSize = 100;
    for (let i = 0; i < duplicatesToDelete.length; i += batchSize) {
      const batch = db.batch();
      const currentBatchIds = duplicatesToDelete.slice(i, i + batchSize);
      
      currentBatchIds.forEach(id => {
        const docRef = db.collection('accounts_payable').doc(id);
        batch.delete(docRef);
      });
      
      await batch.commit();
      console.log(`Deleted batch of ${currentBatchIds.length} (Total: ${i + currentBatchIds.length}/${duplicatesToDelete.length})`);
    }

    console.log("Deletion complete.");
    process.exit(0);
  }
  
  findAndDeleteDuplicates();

} catch (e) {
  console.error("Init error:", e);
  process.exit(1);
}
