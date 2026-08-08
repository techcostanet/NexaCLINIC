import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

try {
  admin.initializeApp();
  console.log("App initialized");
  
  const db = getFirestore();
  db.collection('users').where('email', '==', 'contato@techcosta.net').get()
  .then((snapshot) => {
    if (snapshot.empty) {
      console.log('No matching documents.');
      process.exit(0);
    }  

    snapshot.forEach(doc => {
      console.log(doc.id, '=>', doc.data());
    });
    process.exit(0);
  })
  .catch((error) => {
    console.log('Error getting documents', error);
    process.exit(1);
  });
} catch (e) {
  console.error("Init error:", e);
  process.exit(1);
}
