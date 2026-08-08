import admin from 'firebase-admin';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

try {
  admin.initializeApp();
  console.log("App initialized");
  
  const uid = 'PyS5i3gDuUSpNU1fsI3Znx0ficb2'; // giulliasp@nexa.com
  
  getAuth().deleteUser(uid)
    .then(() => {
      console.log('Successfully deleted user from Auth');
      return getAuth().createUser({
        uid: uid,
        email: 'giulliasp@nexa.com',
        password: 'giulliasp123',
        displayName: 'Giullia',
      });
    })
    .then((userRecord) => {
      console.log('Successfully created new user:', userRecord.uid);
      process.exit(0);
    })
    .catch((error) => {
      console.log('Error:', error);
      process.exit(1);
    });
} catch (e) {
  console.error("Init error:", e);
  process.exit(1);
}
