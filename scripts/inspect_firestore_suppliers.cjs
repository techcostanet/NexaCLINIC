const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'nexa-index'
  });
}

const db = admin.firestore();

async function inspectSuppliers() {
  const snap = await db.collection('suppliers').get();
  console.log('Total suppliers in Firestore:', snap.size);
  if (snap.size > 0) {
    console.log('Sample 3 suppliers:');
    snap.docs.slice(0, 3).forEach(d => {
      console.log(d.id, d.data());
    });
  }
}

inspectSuppliers().catch(console.error);
