import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

try {
  admin.initializeApp();
  console.log("App initialized");
  
  const db = getFirestore();
  
  async function checkUser() {
    const snap = await db.collection('users').get();
    snap.forEach(doc => {
      const u = doc.data();
      if ((u.email || '').toLowerCase().includes('daliam')) {
        console.log("USER FOUND:", doc.id, JSON.stringify(u, null, 2));
      }
    });
    process.exit(0);
  }
  
  checkUser();

} catch (e) {
  console.error("Init error:", e);
  process.exit(1);
}
