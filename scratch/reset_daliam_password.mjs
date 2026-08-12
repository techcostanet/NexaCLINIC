import admin from 'firebase-admin';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

try {
  admin.initializeApp();
  console.log("App initialized");
  
  const auth = getAuth();
  const db = getFirestore();
  
  async function resetDaliamPassword() {
    const newPassword = 'dalia123';
    
    // 1. Update in Firebase Auth
    const userAuth = await auth.getUserByEmail('daliam@nexa.com');
    await auth.updateUser(userAuth.uid, { password: newPassword });
    console.log(`Updated Firebase Auth password for daliam@nexa.com (${userAuth.uid}) to '${newPassword}'`);
    
    // 2. Update in Firestore
    await db.collection('users').doc(userAuth.uid).set({
      password: newPassword,
      authPassword: newPassword,
      role: 'financial',
      allowedSectors: ['faturamento', 'finance', 'compras', 'qualidade', 'recepcao'],
      name: 'Dália Moraes',
      status: 'active',
      updatedAt: new Date().toISOString()
    }, { merge: true });
    
    console.log("Updated Firestore user record for daliam@nexa.com");
    process.exit(0);
  }
  
  resetDaliamPassword();

} catch (e) {
  console.error("Error resetting password:", e);
  process.exit(1);
}
