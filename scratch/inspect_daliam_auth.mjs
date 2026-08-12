import admin from 'firebase-admin';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

try {
  admin.initializeApp();
  console.log("App initialized");
  
  const auth = getAuth();
  const db = getFirestore();
  
  async function checkDaliamData() {
    try {
      const userAuth = await auth.getUserByEmail('daliam@nexa.com');
      console.log("DALIAM AUTH USER:", userAuth.uid, userAuth.email, userAuth.disabled);
    } catch (authErr) {
      console.log("Auth user error:", authErr.message);
    }
    
    process.exit(0);
  }
  
  checkDaliamData();

} catch (e) {
  console.error("Init error:", e);
  process.exit(1);
}
