import admin from 'firebase-admin';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

try {
  admin.initializeApp();
  console.log("App initialized");
  
  const uid = 'PyS5i3gDuUSpNU1fsI3Znx0ficb2'; // giulliasp@nexa.com
  
  const db = getFirestore();
  db.collection('users').doc(uid).set({
    password: 'giulliasp123',
    authPassword: 'giulliasp123'
  }, { merge: true })
  .then(() => {
    console.log('Successfully updated Firestore user');
    process.exit(0);
  })
  .catch((error) => {
    console.log('Error updating Firestore:', error);
    process.exit(1);
  });
} catch (e) {
  console.error("Init error:", e);
  process.exit(1);
}
