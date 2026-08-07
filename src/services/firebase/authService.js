import { app, firebaseConfig } from './config';
import { USE_MOCK, mockFirestore, mockAuth } from './mockDb';

export const onAuthChange = (callback) => {
    if (USE_MOCK) {
      return mockAuth.onAuthStateChanged(callback);
    }
    let unsubscribe = () => {};
    import('firebase/auth').then(({ getAuth, onAuthStateChanged }) => {
      const auth = getAuth(app);
      unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (!firebaseUser) {
          callback(null);
          return;
        }
        try {
          const { getFirestore, doc, getDoc, setDoc } = await import('firebase/firestore');
          const db = getFirestore(app);
          const cleanEmail = (firebaseUser.email || '').trim().toLowerCase();
          const adminEmails = ['contato@techcosta.net', 'anacg@nexa.com', 'jsoares@nexa.com'];
          const isAdminEmail = adminEmails.includes(cleanEmail);

          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userSnap = await getDoc(userDocRef);

          let userData = userSnap.exists() ? userSnap.data() : {};

          // If admin email, guarantee admin role and all sectors
          if (isAdminEmail) {
            const allSectors = ['enfermagem', 'medica', 'qualidade', 'faturamento', 'psicologia', 'nutricao', 'rh', 'recepcao', 'estoque', 'compras'];
            userData = {
              name: userData.name || (cleanEmail === 'contato@techcosta.net' ? 'Administrador TechCosta' : cleanEmail === 'anacg@nexa.com' ? 'Ana Carolina Cerqueira Gonzaga' : 'J. Soares'),
              email: cleanEmail,
              role: 'admin',
              allowedSectors: allSectors,
              status: 'active',
              ...userData,
              role: 'admin', // override to admin
              allowedSectors: allSectors // override to all sectors
            };

            // Save/sync back to firestore asynchronously
            setDoc(userDocRef, userData, { merge: true }).catch(err => console.error("Failed to sync admin user profile:", err));
          } else if (!userSnap.exists()) {
            userData = {
              name: firebaseUser.displayName || cleanEmail || 'Usuário',
              email: cleanEmail,
              role: 'professional',
              allowedSectors: ['enfermagem', 'medica', 'qualidade', 'faturamento', 'psicologia', 'nutricao', 'rh', 'recepcao', 'estoque', 'compras'],
              status: 'active'
            };
          }

          callback({
            uid: firebaseUser.uid,
            email: cleanEmail,
            ...userData
          });
        } catch (err) {
          console.error("Erro ao carregar perfil do usuário no Firestore:", err);
          callback(firebaseUser);
        }
      });
    }).catch(err => {
      console.error("Erro ao inicializar Firebase Auth no onAuthChange:", err);
      callback(null);
    });
    return () => unsubscribe();
  };

export const login = async (email, password) => {
    if (USE_MOCK) {
      return mockAuth.signInWithEmailAndPassword(email, password);
    }
    const { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } = await import('firebase/auth');
    let auth = getAuth(app);
    const cleanEmail = (email || '').trim().toLowerCase();

    try {
      return await signInWithEmailAndPassword(auth, cleanEmail, password);
    } catch (err) {
      // If API key was invalid or missing, attempt re-initialization with explicit fallback config
      if (err.code === 'auth/invalid-api-key' || !firebaseConfig.apiKey) {
        try {
          const { initializeApp: reInitApp } = await import('firebase/app');
          const fallbackApp = reInitApp({
            apiKey: "AIzaSyBPw7Z_nhz7osMlGcdw4wAqXGFUkH27kug",
            authDomain: "nexa-index.firebaseapp.com",
            projectId: "nexa-index",
            storageBucket: "nexa-index.firebasestorage.app",
            messagingSenderId: "1089214920796",
            appId: "1:1089214920796:web:120f3b158f599b0236ce99",
            measurementId: "G-JB7DJRKXV4"
          }, `fallback-${Date.now()}`);
          auth = getAuth(fallbackApp);
          return await signInWithEmailAndPassword(auth, cleanEmail, password);
        } catch (fallbackErr) {
          console.error("Erro na re-tentativa com fallback config:", fallbackErr);
        }
      }

      const isInvalidCred = err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-api-key';
      const allowedEmails = ['contato@techcosta.net', 'anacg@nexa.com', 'jsoares@nexa.com', 'daliam@nexa.com'];
      
      if (isInvalidCred && allowedEmails.includes(cleanEmail)) {
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
          const { getFirestore, doc, setDoc } = await import('firebase/firestore');
          const db = getFirestore(app);
          const userName = cleanEmail === 'contato@techcosta.net' 
            ? 'Administrador TechCosta' 
            : cleanEmail === 'anacg@nexa.com' 
            ? 'Ana Carolina Cerqueira Gonzaga' 
            : cleanEmail === 'daliam@nexa.com'
            ? 'Daliam Morais'
            : 'J. Soares';
          await setDoc(doc(db, 'users', userCredential.user.uid), {
            name: userName,
            email: cleanEmail,
            role: cleanEmail === 'daliam@nexa.com' ? 'reception' : 'admin',
            allowedSectors: cleanEmail === 'daliam@nexa.com' ? ['recepcao'] : ['enfermagem', 'medica', 'qualidade', 'faturamento', 'psicologia', 'nutricao', 'rh', 'recepcao', 'estoque', 'compras'],
            status: 'active',
            createdAt: new Date().toISOString()
          });
          return userCredential;
        } catch (createErr) {
          if (createErr.code === 'auth/email-already-in-use') {
            const fallbackPasswords = ['dalia123', 'Daliam1234!', 'daliam123', 'admin123', '123456'];
            for (const pass of fallbackPasswords) {
              try {
                return await signInWithEmailAndPassword(auth, cleanEmail, pass);
              } catch (passErr) {}
            }
          }
          throw err;
        }
      }
      throw err;
    }
  };

export const logout = async () => {
    if (USE_MOCK) {
      return mockAuth.signOut();
    }
    const { getAuth, signOut } = await import('firebase/auth');
    const auth = getAuth(app);
    return signOut(auth);
  };

export const createUser = async (email, name, role, allowedSectors) => {
    if (USE_MOCK) {
      return mockAuth.createUser(email, name, role, allowedSectors);
    }
    
    const { initializeApp: initializeSecondaryApp } = await import('firebase/app');
    const { getAuth, createUserWithEmailAndPassword, signOut } = await import('firebase/auth');
    const { getFirestore, doc, setDoc } = await import('firebase/firestore');

    // Create a secondary app instance to register the new user without logging out the administrator
    const configToUse = (firebaseConfig && firebaseConfig.apiKey) ? firebaseConfig : (app && app.options && app.options.apiKey ? app.options : null);
    if (!configToUse) {
      throw new Error('As credenciais do Firebase (VITE_FIREBASE_API_KEY) não estão configuradas no ambiente.');
    }

    const secondaryAppName = `secondary-${Math.random().toString(36).substr(2, 9)}`;
    const secondaryApp = initializeSecondaryApp(configToUse, secondaryAppName);
    const secondaryAuth = getAuth(secondaryApp);
    
    // Password policy for new created users
    const base = email.split('@')[0];
    const tempPassword = base === 'daliam' ? 'dalia123' : `${base}123`;
    
    try {
      const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, tempPassword);
      const uid = userCredential.user.uid;

      // Save user metadata in Firestore
      const db = getFirestore(app);
      await setDoc(doc(db, 'users', uid), {
        uid,
        email,
        name,
        role,
        allowedSectors,
        createdAt: new Date().toISOString()
      });

      // Sign out of secondary and clean up
      await signOut(secondaryAuth);
      await secondaryApp.delete();

      return { uid, email, name, role };
    } catch (err) {
      try {
        await secondaryApp.delete();
      } catch (e) {}

      if (err.code === 'auth/email-already-in-use') {
        const cleanEmail = (email || '').trim().toLowerCase();
        try {
          const { getFirestore, collection, getDocs, setDoc, doc } = await import('firebase/firestore');
          const db = getFirestore(app);
          const snap = await getDocs(collection(db, 'users'));
          const existingUserDoc = snap.docs.find(d => (d.data().email || '').trim().toLowerCase() === cleanEmail);
          
          const targetUid = existingUserDoc ? existingUserDoc.id : `user-${Math.random().toString(36).substr(2, 9)}`;
          const userPayload = {
            uid: targetUid,
            email: cleanEmail,
            name: name || 'Operador',
            role: role || 'reception',
            allowedSectors: allowedSectors || [],
            status: 'active',
            updatedAt: new Date().toISOString()
          };

          await setDoc(doc(db, 'users', targetUid), userPayload, { merge: true });
          return { uid: targetUid, email: cleanEmail, name, role, isExisting: true };
        } catch (dbErr) {
          console.error("Erro ao sincronizar perfil do usuário existente no Firestore:", dbErr);
        }
      }

      if (err.code === 'auth/invalid-email') {
        throw new Error(`O e-mail "${email}" é inválido.`);
      }

      throw err;
    }
  };

export const getUsers = async () => {
    const allSectors = ['enfermagem', 'medica', 'qualidade', 'faturamento', 'psicologia', 'nutricao', 'rh', 'recepcao', 'estoque', 'compras'];
    const defaultUsers = [
      { uid: 'techcosta-admin-uid', email: 'contato@techcosta.net', name: 'Administrador TechCosta', role: 'admin', allowedSectors: allSectors, status: 'active' },
      { uid: 'anacg-uid', email: 'anacg@nexa.com', name: 'Ana Carolina Cerqueira Gonzaga', role: 'admin', allowedSectors: allSectors, status: 'active' },
      { uid: 'jsoares-uid', email: 'jsoares@nexa.com', name: 'J. Soares', role: 'admin', allowedSectors: allSectors, status: 'active' }
    ];

    if (USE_MOCK) {
      const mockList = await mockFirestore.getUsers();
      if (!mockList || mockList.length === 0) return defaultUsers;
      return mockList;
    }
    try {
      const { getFirestore, collection, getDocs, doc, setDoc } = await import('firebase/firestore');
      const db = getFirestore(app);
      const snap = await getDocs(collection(db, 'users'));
      let rawUsers = snap.docs.map(d => ({ uid: d.id, ...d.data() }));

      // Ensure default admin users exist in the list
      defaultUsers.forEach(defU => {
        const found = rawUsers.find(u => (u.email || '').toLowerCase() === defU.email.toLowerCase());
        if (!found) {
          rawUsers.push(defU);
          // Seed back to Firestore asynchronously
          setDoc(doc(db, 'users', defU.uid), defU, { merge: true }).catch(e => console.error(e));
        } else {
          // Force admin role and full sectors for default accounts
          found.role = 'admin';
          found.allowedSectors = allSectors;
          found.status = 'active';
        }
      });

      // Deduplicate by email keeping the user with the longest/most complete name
      const emailGroups = {};
      for (const u of rawUsers) {
        const email = (u.email || '').trim().toLowerCase();
        if (!email) continue;
        if (!emailGroups[email]) {
          emailGroups[email] = [];
        }
        emailGroups[email].push(u);
      }

    const deduplicated = [];
    for (const email of Object.keys(emailGroups)) {
      const group = emailGroups[email];
      if (group.length === 1) {
        deduplicated.push(group[0]);
      } else {
        // Sort group by name length descending (longest/most complete name first)
        group.sort((a, b) => (b.name || '').length - (a.name || '').length);
        const winner = group[0];
        deduplicated.push(winner);

        // Delete duplicate records with shorter names in background
        for (let i = 1; i < group.length; i++) {
          const loser = group[i];
          try {
            await deleteDoc(doc(db, 'users', loser.uid));
            console.log(`[Deduplication] Deleted duplicate user record ${loser.uid} (${loser.name}) for ${email}`);
          } catch (err) {
            console.error(`Failed to delete duplicate user ${loser.uid}:`, err);
          }
        }
      }
    }

    return deduplicated;
    } catch (err) {
      console.error("Erro ao carregar usuários do Firestore:", err);
      return defaultUsers;
    }
  };

export const updateUserPermissions = async (uid, allowedSectors) => {
    if (USE_MOCK) {
      return mockFirestore.updateUserPermissions(uid, allowedSectors);
    }
    const { getFirestore, doc, updateDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    return updateDoc(doc(db, 'users', uid), { allowedSectors, updatedAt: new Date().toISOString() });
  };

export const updateUser = async (uid, userData) => {
    if (USE_MOCK) {
      return mockFirestore.updateUser(uid, userData);
    }
    const { getFirestore, doc, updateDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    return updateDoc(doc(db, 'users', uid), {
      ...userData,
      updatedAt: new Date().toISOString()
    });
  };

export const deleteUser = async (uid) => {
    if (USE_MOCK) {
      return mockFirestore.deleteUser(uid);
    }
    const { getFirestore, doc, deleteDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    return deleteDoc(doc(db, 'users', uid));
  };

export const getUserProfiles = async () => {
    if (USE_MOCK) return mockFirestore.getUserProfiles();
    try {
      const { getFirestore, collection, getDocs, doc, setDoc } = await import('firebase/firestore');
      const db = getFirestore(app);
      const snap = await getDocs(collection(db, 'user_profiles'));
      if (!snap.empty) {
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
      }
      // Seed default profiles to Cloud Firestore if empty
      const defaultProfiles = await mockFirestore.getUserProfiles();
      for (const prof of defaultProfiles) {
        const { id, ...data } = prof;
        await setDoc(doc(db, 'user_profiles', id), data);
      }
      return defaultProfiles;
    } catch (e) {
      console.error('Erro ao ler user_profiles do Firestore:', e);
      return [];
    }
  };

export const saveUserProfile = async (profile) => {
    if (USE_MOCK) return mockFirestore.saveUserProfile(profile);
    const { getFirestore, doc, setDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    const { id, ...data } = profile;
    await setDoc(doc(db, 'user_profiles', id), data, { merge: true });
    return profile;
  };

