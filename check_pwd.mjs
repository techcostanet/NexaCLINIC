import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, setDoc } from "firebase/firestore";
import fs from 'fs';
import path from 'path';

async function check() {
  const envContent = fs.readFileSync(path.join(process.cwd(), '.env'), 'utf8');
  const env = {};
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      env[match[1].trim()] = match[2].trim().replace(/^['"](.*)['"]$/, '$1');
    }
  });
  
  const config = {
    apiKey: env.VITE_FIREBASE_API_KEY,
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: env.VITE_FIREBASE_APP_ID,
    measurementId: env.VITE_FIREBASE_MEASUREMENT_ID
  };

  if (!config.apiKey) {
    console.error("Missing config!");
    return;
  }

  const app = initializeApp(config);
  const db = getFirestore(app);
  const snap = await getDocs(collection(db, "users"));
  
  snap.forEach(doc => {
    const data = doc.data();
    if (data.email === 'giulliasp@nexa.com') {
      console.log('Found user:', doc.id);
      console.log('Stored password:', data.password);
      console.log('Stored authPassword:', data.authPassword);
    }
  });

  // Let's also reset it to 'giulliasp123' if it's not that, 
  // or maybe the user just needs to know it. 
  // But they are getting auth/too-many-requests.
  console.log("Done");
  process.exit(0);
}

check();
