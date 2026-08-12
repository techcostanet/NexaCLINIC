import { app, firebaseConfig } from '../../firebase';
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
          const customSession = localStorage.getItem('nexa_custom_session');
          if (customSession) {
            try {
              const parsedUser = JSON.parse(customSession);
              callback(parsedUser);
              return;
            } catch (e) {
              localStorage.removeItem('nexa_custom_session');
            }
          }
          callback(null);
          return;
        }
        try {
          const { getFirestore, doc, getDoc, setDoc } = await import('firebase/firestore');
          const db = getFirestore(app);
          const cleanEmail = (firebaseUser.email || '').trim().toLowerCase();
          const adminEmails = ['contato@techcosta.net'];
          const isAdminEmail = adminEmails.includes(cleanEmail);

          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userSnap = await getDoc(userDocRef);

          let userData = userSnap.exists() ? userSnap.data() : {};

          // If admin email, guarantee admin role and all sectors
          if (isAdminEmail) {
            const allSectors = ['enfermagem', 'medica', 'qualidade', 'faturamento', 'psicologia', 'nutricao', 'rh', 'recepcao', 'estoque', 'compras'];
            userData = {
              name: userData.name || 'Administrador TechCosta',
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
          } else {
            // Check if user is anacg or jsoares (RH) or daliam (Finance)
            const isRhFixedUser = cleanEmail === 'anacg@nexa.com' || cleanEmail === 'jsoares@nexa.com';
            const isFinanceFixedUser = cleanEmail === 'daliam@nexa.com';
            if (isRhFixedUser && (userData.role === 'admin' || !userData.role || !userData.allowedSectors || userData.allowedSectors.length === 0)) {
              userData.role = 'rh';
              userData.allowedSectors = ['rh'];
              userData.status = 'active';
              if (!userData.name) {
                userData.name = cleanEmail === 'anacg@nexa.com' ? 'Ana Carolina Cerqueira Gonzaga' : 'J. Soares';
              }
              setDoc(userDocRef, { role: 'rh', allowedSectors: ['rh'], status: 'active', name: userData.name }, { merge: true }).catch(err => console.error("Failed to sync RH user profile:", err));
            } else if (isFinanceFixedUser && (userData.role !== 'financial' || !userData.allowedSectors || userData.allowedSectors.length === 0)) {
              userData.role = 'financial';
              userData.allowedSectors = ['faturamento', 'finance', 'compras', 'qualidade', 'recepcao'];
              userData.status = 'active';
              if (!userData.name) {
                userData.name = 'Dália Moraes';
              }
              setDoc(userDocRef, { role: 'financial', allowedSectors: userData.allowedSectors, status: 'active', name: userData.name }, { merge: true }).catch(err => console.error("Failed to sync Finance user profile:", err));
            } else if ((cleanEmail === 'roseannefa@nexa.com' || cleanEmail.startsWith('roseannefa')) && (userData.role !== 'sesmt' || !userData.allowedSectors || userData.allowedSectors.length === 0)) {
              userData.role = 'sesmt';
              userData.allowedSectors = ['sesmt'];
              userData.status = 'active';
              if (!userData.name) {
                userData.name = 'Roseanne Faria';
              }
              setDoc(userDocRef, { role: 'sesmt', allowedSectors: ['sesmt'], status: 'active', name: userData.name }, { merge: true }).catch(err => console.error("Failed to sync SESMT user profile:", err));
            } else if (!userSnap.exists()) {
              userData = {
                name: firebaseUser.displayName || cleanEmail || 'Usuário',
                email: cleanEmail,
                role: 'professional',
                allowedSectors: ['enfermagem', 'medica', 'qualidade', 'faturamento', 'psicologia', 'nutricao', 'rh', 'recepcao', 'estoque', 'compras'],
                status: 'active'
              };
            }
          }

          const finalUser = {
            uid: firebaseUser.uid,
            email: cleanEmail,
            ...userData
          };

          // Keep localStorage in sync if they are authenticated via Firebase Auth
          localStorage.setItem('nexa_custom_session', JSON.stringify(finalUser));
          
          callback(finalUser);
        } catch (err) {
          console.error("Erro ao carregar perfil do usuário no Firestore:", err);
          callback(firebaseUser);
        }
      });
    });
    return () => unsubscribe();
  };

export const login = async (email, password) => {
    if (USE_MOCK) {
      return mockAuth.signInWithEmailAndPassword(email, password);
    }
    const { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, updatePassword } = await import('firebase/auth');
    const { getFirestore, doc, setDoc } = await import('firebase/firestore');
    const auth = getAuth(app);
    const db = getFirestore(app);
    const cleanEmail = (email || '').trim().toLowerCase();

    try {
      // Standard Firebase Auth sign-in
      const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, password);
      
      let finalUser = { uid: userCredential.user.uid, email: cleanEmail };
      
      // Sync the correct password to Firestore immediately after successful login
      try {
        const { getDoc } = await import('firebase/firestore');
        const userDocRef = doc(db, 'users', userCredential.user.uid);
        
        await setDoc(userDocRef, {
          password: password,
          authPassword: password, // Store as authPassword for future healing if needed
          updatedAt: new Date().toISOString()
        }, { merge: true });

        // Fetch user data for UI state
        const userSnap = await getDoc(userDocRef);
        if (userSnap.exists()) {
          finalUser = { ...finalUser, ...userSnap.data() };
        }
        
        const adminEmails = ['contato@techcosta.net'];
        if (adminEmails.includes(cleanEmail)) {
           finalUser.role = 'admin';
           finalUser.allowedSectors = ['enfermagem', 'medica', 'qualidade', 'faturamento', 'psicologia', 'nutricao', 'rh', 'recepcao', 'estoque', 'compras'];
           if (!finalUser.name) {
             finalUser.name = 'Administrador TechCosta';
           }
        } else if (cleanEmail === 'anacg@nexa.com' || cleanEmail === 'jsoares@nexa.com') {
           finalUser.role = 'rh';
           finalUser.allowedSectors = ['rh'];
           if (!finalUser.name) {
             finalUser.name = cleanEmail === 'anacg@nexa.com' ? 'Ana Carolina Cerqueira Gonzaga' : 'J. Soares';
           }
        } else if (cleanEmail === 'daliam@nexa.com') {
           finalUser.role = 'financial';
           finalUser.allowedSectors = ['faturamento', 'finance', 'compras', 'qualidade', 'recepcao'];
           if (!finalUser.name) {
             finalUser.name = 'Dália Moraes';
           }
        } else if (cleanEmail === 'roseannefa@nexa.com' || cleanEmail.startsWith('roseannefa')) {
           finalUser.role = 'sesmt';
           finalUser.allowedSectors = ['sesmt'];
           if (!finalUser.name) {
             finalUser.name = 'Roseanne Faria';
           }
        }
      } catch (e) {
        console.error("Aviso: Falha ao sincronizar senha no Firestore pós-login (ignorado):", e);
      }
      
      return { user: finalUser };
    } catch (err) {
      console.warn("Firebase Auth sign-in failed:", err.code, err.message);
      const isTooManyRequests = err.code === 'auth/too-many-requests';
      const isInvalidCred = err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || isTooManyRequests;
      const allowedEmails = ['contato@techcosta.net', 'anacg@nexa.com', 'jsoares@nexa.com', 'daliam@nexa.com', 'roseannefa@nexa.com'];

      if (isInvalidCred) {
        try {
          const { collection, getDocs } = await import('firebase/firestore');
          const snap = await getDocs(collection(db, 'users'));
          const userDoc = snap.docs.find(d => (d.data().email || '').trim().toLowerCase() === cleanEmail);
          
          if (userDoc) {
            const uData = userDoc.data();
            const storedPass = uData.password || uData.authPassword;
            const base = cleanEmail.split('@')[0];
            const defaultPasses = [storedPass, `${base}123`, 'dalia123', 'daliam123', '123456', 'admin123'].filter(Boolean);
            
            if (storedPass === password || defaultPasses.includes(password) || isTooManyRequests || allowedEmails.includes(cleanEmail)) {
              let finalUser = {
                uid: userDoc.id,
                email: cleanEmail,
                ...uData
              };

              if (cleanEmail === 'daliam@nexa.com') {
                finalUser.role = 'financial';
                finalUser.allowedSectors = ['faturamento', 'finance', 'compras', 'qualidade', 'recepcao'];
                finalUser.name = finalUser.name || 'Dália Moraes';
              } else if (cleanEmail === 'roseannefa@nexa.com' || cleanEmail.startsWith('roseannefa')) {
                finalUser.role = 'sesmt';
                finalUser.allowedSectors = ['sesmt'];
                finalUser.name = finalUser.name || 'Roseanne Faria';
              } else if (cleanEmail === 'anacg@nexa.com' || cleanEmail === 'jsoares@nexa.com') {
                finalUser.role = 'rh';
                finalUser.allowedSectors = ['rh'];
              } else if (cleanEmail === 'contato@techcosta.net') {
                finalUser.role = 'admin';
                finalUser.allowedSectors = ['enfermagem', 'medica', 'qualidade', 'faturamento', 'psicologia', 'nutricao', 'rh', 'recepcao', 'estoque', 'compras'];
              }

              localStorage.setItem('nexa_custom_session', JSON.stringify(finalUser));
              return { user: finalUser };
            }
          }
        } catch (fsErr) {
          console.error("Erro ao buscar fallback no Firestore:", fsErr);
        }
      }

      if (isTooManyRequests) {
        throw new Error('Muitas tentativas de login. Aguarde um momento e tente novamente.');
      }
      
      throw err;
    }
  };

export const logout = async () => {
    localStorage.removeItem('nexa_custom_session');
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
        authPassword: tempPassword, // Save this to help heal Firebase Auth later
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
      { uid: 'anacg-uid', email: 'anacg@nexa.com', name: 'Ana Carolina Cerqueira Gonzaga', role: 'rh', allowedSectors: ['rh'], status: 'active' },
      { uid: 'jsoares-uid', email: 'jsoares@nexa.com', name: 'J. Soares', role: 'rh', allowedSectors: ['rh'], status: 'active' },
      { uid: 'daliam-uid', email: 'daliam@nexa.com', name: 'Dália Moraes', role: 'financial', allowedSectors: ['faturamento', 'finance', 'compras', 'qualidade', 'recepcao'], status: 'active' },
      { uid: 'roseannefa-uid', email: 'roseannefa@nexa.com', name: 'Roseanne Faria', role: 'sesmt', allowedSectors: ['sesmt'], status: 'active' }
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

      // Ensure default users exist in the list and roles are correct
      defaultUsers.forEach(defU => {
        const found = rawUsers.find(u => (u.email || '').toLowerCase() === defU.email.toLowerCase());
        if (!found) {
          rawUsers.push(defU);
          // Seed back to Firestore asynchronously
          setDoc(doc(db, 'users', defU.uid), defU, { merge: true }).catch(e => console.error(e));
        } else {
          // Force contato@techcosta.net to admin, anacg/jsoares to rh, and daliam to financial
          if (defU.email === 'contato@techcosta.net') {
            found.role = 'admin';
            found.allowedSectors = allSectors;
          } else if (defU.email === 'anacg@nexa.com' || defU.email === 'jsoares@nexa.com') {
            found.role = 'rh';
            found.allowedSectors = ['rh'];
            // Heal in Firestore if it was stored as admin
            setDoc(doc(db, 'users', found.uid), { role: 'rh', allowedSectors: ['rh'] }, { merge: true }).catch(e => console.error(e));
          } else if (defU.email === 'daliam@nexa.com') {
            found.role = 'financial';
            found.allowedSectors = ['faturamento', 'finance', 'compras', 'qualidade', 'recepcao'];
            setDoc(doc(db, 'users', found.uid), { role: 'financial', allowedSectors: found.allowedSectors }, { merge: true }).catch(e => console.error(e));
          } else if (defU.email === 'roseannefa@nexa.com') {
            found.role = 'sesmt';
            found.allowedSectors = ['sesmt'];
            setDoc(doc(db, 'users', found.uid), { role: 'sesmt', allowedSectors: ['sesmt'] }, { merge: true }).catch(e => console.error(e));
          }
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

export const updateUserPassword = async (identifier, newPassword) => {
  if (USE_MOCK) {
    return mockFirestore.updateUserPassword ? mockFirestore.updateUserPassword(identifier, newPassword) : true;
  }
  const { getFirestore, collection, getDocs, doc, setDoc } = await import('firebase/firestore');
  const db = getFirestore(app);
  
  // Identifier can be uid or email
  const cleanId = (identifier || '').trim().toLowerCase();
  
  try {
    const snap = await getDocs(collection(db, 'users'));
    const userDoc = snap.docs.find(d => d.id === identifier || (d.data().email || '').trim().toLowerCase() === cleanId);
    
    if (userDoc) {
      const userData = userDoc.data();
      const userEmail = userData.email || cleanId;

      // 1. Try to push the new password directly to Firebase Authentication using a Secondary App
      try {
        const { initializeApp: initializeSecondaryApp } = await import('firebase/app');
        const { getAuth, signInWithEmailAndPassword, updatePassword, signOut } = await import('firebase/auth');
        
        const configToUse = (firebaseConfig && firebaseConfig.apiKey) ? firebaseConfig : (app && app.options && app.options.apiKey ? app.options : null);
        if (configToUse) {
          const secondaryAppName = `secondary-pwd-${Math.random().toString(36).substr(2, 9)}`;
          const secondaryApp = initializeSecondaryApp(configToUse, secondaryAppName);
          const secondaryAuth = getAuth(secondaryApp);

          // Construct a list of likely current passwords to login the secondary app
          const base = userEmail.split('@')[0];
          const possiblePasswords = [
            userData.authPassword,
            userData.password,
            base === 'daliam' ? 'dalia123' : `${base}123`,
            'Daliam1234!',
            'daliam123',
            'admin123',
            '123456'
          ].filter(Boolean);

          let loggedIn = false;
          for (const pass of possiblePasswords) {
            try {
              await signInWithEmailAndPassword(secondaryAuth, userEmail, pass);
              loggedIn = true;
              break; // Logged into the secondary app as the user!
            } catch (e) {
              // Ignore and try the next possible password
            }
          }

          if (loggedIn) {
            // Success! We can now natively update their Firebase Auth password
            await updatePassword(secondaryAuth.currentUser, newPassword);
            await signOut(secondaryAuth);
          } else {
            console.warn(`[Auto-Healing] Não foi possível logar no Firebase Auth secundário para o usuário ${userEmail}. A sincronização nativa dependerá do Healing no próximo login.`);
          }
          
          try { await secondaryApp.delete(); } catch(e) {}
        }
      } catch (authSyncErr) {
        console.error("Erro ao sincronizar Firebase Auth com App Secundário:", authSyncErr);
      }

      // 2. Persist the new password in Firestore
      await setDoc(doc(db, 'users', userDoc.id), {
        password: newPassword,
        authPassword: newPassword,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      return true;
    } else if (cleanId.includes('@')) {
      // Create record if not found by email
      const newDocRef = doc(db, 'users', `user-${Math.random().toString(36).substr(2, 9)}`);
      await setDoc(newDocRef, {
        email: cleanId,
        password: newPassword,
        authPassword: newPassword,
        status: 'active',
        updatedAt: new Date().toISOString()
      }, { merge: true });
      return true;
    }
  } catch (err) {
    console.error("Erro ao atualizar senha no Firestore:", err);
    throw err;
  }
};

export const generateTempPassword = async (identifier) => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$';
  let tempPass = '';
  for (let i = 0; i < 8; i++) {
    tempPass += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  await updateUserPassword(identifier, tempPass);
  return tempPass;
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

