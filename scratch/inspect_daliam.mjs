import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

try {
  admin.initializeApp();
  console.log("App initialized");
  
  const db = getFirestore();
  
  async function checkDaliamData() {
    const snap = await db.collection('users').get();
    snap.forEach(doc => {
      const u = doc.data();
      if ((u.email || '').toLowerCase().includes('daliam')) {
        console.log("DALIAM USER DOC:", doc.id, JSON.stringify(u, null, 2));
      }
    });
    
    // Check Firebase Auth user
    try {
      const userAuth = await admin.auth().getUserByEmail('daliam@nexa.com');
      console.log("DALIAM AUTH USER:", JSON.stringify(userAuth, null, 2));
    } catch (authErr) {
      console.log("Auth user not found or error:", authErr.message);
    }
    
    process.exit(0);
  }
  
  checkDaliamData();

} catch (e) {
  console.error("Init error:", e);
  process.exit(1);
}
