import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

try {
  admin.initializeApp();
  console.log("App initialized");
  
  const db = getFirestore();
  
  async function fixDaliam() {
    const snap = await db.collection('users').get();
    let updated = 0;
    for (const doc of snap.docs) {
      const u = doc.data();
      if ((u.email || '').toLowerCase().includes('daliam')) {
        await db.collection('users').doc(doc.id).set({
          role: 'financial',
          allowedSectors: ['faturamento', 'finance', 'compras', 'qualidade', 'recepcao'],
          status: 'active',
          name: u.name || 'Dália Moraes',
          updatedAt: new Date().toISOString()
        }, { merge: true });
        console.log(`Successfully updated user ${doc.id} (${u.email}) to role=financial and allowedSectors=['faturamento', 'finance', 'compras', 'qualidade', 'recepcao']`);
        updated++;
      }
    }
    if (updated === 0) {
      console.log("No daliam user found to update.");
    }
    process.exit(0);
  }
  
  fixDaliam();

} catch (e) {
  console.error("Init error:", e);
  process.exit(1);
}
