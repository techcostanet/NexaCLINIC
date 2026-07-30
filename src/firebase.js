// Firebase config and connection setup
// Toggle USE_MOCK to true to run fully in-memory/localStorage.
// Change to false to connect to your real Google Firebase instance.

import { mockAuth, mockFirestore } from './mockFirebase';
import { initializeApp, getApps, getApp } from 'firebase/app';

const USE_MOCK = false;

// Real Firebase credentials supplied by the user
const firebaseConfig = {
  apiKey: "AIzaSyBPw7Z_nhz7osMlGcdw4wAqXGFUkH27kug",
  authDomain: "nexa-index.firebaseapp.com",
  projectId: "nexa-index",
  storageBucket: "nexa-index.firebasestorage.app",
  messagingSenderId: "1089214920796",
  appId: "1:1089214920796:web:120f3b158f599b0236ce99",
  measurementId: "G-JB7DJRKXV4"
};

// Initialize Firebase App
let app;
if (!USE_MOCK) {
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
  }
}

// Standard exports for the rest of the application
export const authService = {
  login: async (email, password) => {
    if (USE_MOCK) {
      return mockAuth.signInWithEmailAndPassword(email, password);
    }
    const { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } = await import('firebase/auth');
    const auth = getAuth(app);
    const cleanEmail = (email || '').trim().toLowerCase();
    try {
      return await signInWithEmailAndPassword(auth, cleanEmail, password);
    } catch (err) {
      const isInvalidCred = err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found';
      const allowedEmails = ['contato@techcosta.net', 'anacg@nexa.com', 'jsoares@nexa.com'];
      
      if (isInvalidCred && allowedEmails.includes(cleanEmail)) {
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
          const { getFirestore, doc, setDoc } = await import('firebase/firestore');
          const db = getFirestore(app);
          const isRH = cleanEmail === 'anacg@nexa.com';
          const userName = cleanEmail === 'contato@techcosta.net' 
            ? 'Administrador TechCosta' 
            : cleanEmail === 'anacg@nexa.com' 
            ? 'Ana Carolina Cerqueira Gonzaga' 
            : 'J. Soares';
          await setDoc(doc(db, 'users', userCredential.user.uid), {
            name: userName,
            email: cleanEmail,
            role: isRH ? 'rh' : 'admin',
            allowedSectors: isRH ? ['rh'] : ['enfermagem', 'medica', 'qualidade', 'faturamento', 'psicologia', 'nutricao', 'rh', 'recepcao', 'estoque', 'compras'],
            status: 'active',
            createdAt: new Date().toISOString()
          });
          return userCredential;
        } catch (createErr) {
          console.error("Auto-creation of user failed:", createErr);
          throw err;
        }
      }
      throw err;
    }
  },

  logout: async () => {
    if (USE_MOCK) {
      return mockAuth.signOut();
    }
    const { getAuth, signOut } = await import('firebase/auth');
    const auth = getAuth(app);
    return signOut(auth);
  },

  onAuthChange: (callback) => {
    if (USE_MOCK) {
      return mockAuth.onAuthStateChanged(callback);
    }
    
    let unsubscribe = () => {};
    import('firebase/auth').then(({ getAuth, onAuthStateChanged }) => {
      const auth = getAuth(app);
      unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          const { getFirestore, doc, getDoc, setDoc } = await import('firebase/firestore');
          const db = getFirestore(app);
          const cleanEmail = (firebaseUser.email || '').trim().toLowerCase();
          const isOfficialUser = ['contato@techcosta.net', 'anacg@nexa.com', 'jsoares@nexa.com'].includes(cleanEmail);
          const isRH = cleanEmail === 'anacg@nexa.com';
          const expectedRole = isRH ? 'rh' : 'admin';
          const expectedSectors = isRH ? ['rh'] : ['enfermagem', 'medica', 'qualidade', 'faturamento', 'psicologia', 'nutricao', 'rh', 'recepcao', 'estoque', 'compras'];

          let userData = null;
          let profileExists = false;

          try {
            const userRef = doc(db, 'users', firebaseUser.uid);
            const userDoc = await getDoc(userRef);
            
            if (userDoc.exists()) {
              userData = userDoc.data();
              profileExists = true;
            }
          } catch (readErr) {
            console.error('Erro ao ler perfil do Firestore:', readErr);
            // If we can't even read, fallback
            callback({ uid: firebaseUser.uid, email: firebaseUser.email, role: 'professional', allowedSectors: [] });
            return;
          }

          if (profileExists) {
            if (userData.status === 'inactive' && !isOfficialUser) {
              const { signOut } = await import('firebase/auth');
              await signOut(auth);
              callback(null);
              return;
            }
            // Guarantee official users have active status and correct roles in cloud profile
            if (isOfficialUser && (userData.role !== expectedRole || userData.status !== 'active')) {
              const updatedProfile = {
                ...userData,
                role: expectedRole,
                status: 'active',
                allowedSectors: expectedSectors
              };
              
              try {
                const userRef = doc(db, 'users', firebaseUser.uid);
                await setDoc(userRef, updatedProfile, { merge: true });
              } catch (writeErr) {
                console.error('Erro ao atualizar perfil oficial:', writeErr);
              }
              
              callback({ uid: firebaseUser.uid, email: firebaseUser.email, ...updatedProfile });
              return;
            }
            callback({ uid: firebaseUser.uid, email: firebaseUser.email, ...userData });
          } else {
            // If user is authenticated but no profile document exists in Cloud Firestore, create it
            const userName = cleanEmail === 'contato@techcosta.net' 
              ? 'Administrador TechCosta' 
              : cleanEmail === 'anacg@nexa.com' 
              ? 'Ana Carolina Cerqueira Gonzaga' 
              : cleanEmail === 'jsoares@nexa.com' 
              ? 'J. Soares' 
              : (firebaseUser.displayName || 'Usuário Nexa');
            
            const newProfile = {
              name: userName,
              email: firebaseUser.email,
              role: expectedRole,
              allowedSectors: expectedSectors,
              status: 'active',
              createdAt: new Date().toISOString()
            };
            
            try {
              const userRef = doc(db, 'users', firebaseUser.uid);
              await setDoc(userRef, newProfile);
            } catch (writeErr) {
              console.error('Erro ao criar novo perfil:', writeErr);
            }
            
            callback({ uid: firebaseUser.uid, email: firebaseUser.email, ...newProfile });
          }
        } else {
          callback(null);
        }
      });
    });
    return () => unsubscribe();
  },

  createUser: async (email, name, role, allowedSectors) => {
    if (USE_MOCK) {
      return mockAuth.createUser(email, name, role, allowedSectors);
    }
    
    const { initializeApp: initializeSecondaryApp } = await import('firebase/app');
    const { getAuth, createUserWithEmailAndPassword, signOut } = await import('firebase/auth');
    const { getFirestore, doc, setDoc } = await import('firebase/firestore');

    // Create a secondary app instance to register the new user without logging out the administrator
    const secondaryAppName = `secondary-${Math.random().toString(36).substr(2, 9)}`;
    const secondaryApp = initializeSecondaryApp(firebaseConfig, secondaryAppName);
    const secondaryAuth = getAuth(secondaryApp);
    
    const tempPassword = email.split('@')[0] + '123';
    
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
      throw err;
    }
  }
};

export const dbService = {
  getSectors: async () => {
    if (USE_MOCK) {
      return mockFirestore.getSectors();
    }
    const { getFirestore, collection, getDocs } = await import('firebase/firestore');
    const db = getFirestore(app);
    const snap = await getDocs(collection(db, 'sectors'));
    
    // Seed default sectors if Firestore is empty
    if (snap.empty) {
      const { writeBatch, doc } = await import('firebase/firestore');
      const batch = writeBatch(db);
      const defaults = [
        { id: 'enfermagem', name: 'Enfermagem', description: 'Métricas assistenciais da equipe de enfermagem' },
        { id: 'medica', name: 'Equipe Médica', description: 'Indicadores clínicos e mortalidade' },
        { id: 'qualidade', name: 'Qualidade', description: 'Satisfação do paciente e auditorias' },
        { id: 'faturamento', name: 'Faturamento', description: 'Glosas, custos e faturamento de diálise' },
        { id: 'psicologia', name: 'Psicologia', description: 'Métricas de cobertura de atendimento psicológico, risco emocional e encaminhamentos à rede.' },
        { id: 'nutricao', name: 'Nutrição', description: 'Métricas de cobertura de atendimento nutricional, adequação metabólica e controle de peso.' }
      ];
      defaults.forEach(sec => {
        batch.set(doc(db, 'sectors', sec.id), sec);
      });
      await batch.commit();
      return defaults;
    }
    
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  getIndicators: async () => {
    if (USE_MOCK) {
      return mockFirestore.getIndicators();
    }
    const { getFirestore, collection, getDocs } = await import('firebase/firestore');
    const db = getFirestore(app);
    const snap = await getDocs(collection(db, 'indicators'));
    
    // Seed default indicators if empty
    if (snap.empty) {
      const { writeBatch, doc } = await import('firebase/firestore');
      const batch = writeBatch(db);
      const defaults = [
        { id: 'taxa_infeccao_cateter', name: 'Taxa de Infecção por Cateter', sectorId: 'enfermagem', unit: '%', target: 1.5, description: 'Percentual de pacientes com infecção de acesso vascular (cateter)' },
        { id: 'reuso_capilares', name: 'Média de Reuso de Dialisadores', sectorId: 'enfermagem', unit: 'reusos', target: 12, description: 'Número médio de vezes que um dialisador (capilar) é reusado' },
        { id: 'mortalidade_mensal', name: 'Taxa de Mortalidade Mensal', sectorId: 'medica', unit: '%', target: 5.0, description: 'Percentual de óbitos de pacientes em tratamento no mês' },
        { id: 'taxa_internacao', name: 'Taxa de Internação Hospitalar', sectorId: 'medica', unit: '%', target: 10.0, description: 'Porcentagem de pacientes que necessitaram de internação no período' },
        { id: 'satisfacao_paciente', name: 'Satisfação do Paciente (NPS)', sectorId: 'qualidade', unit: 'pontos', target: 80.0, description: 'Net Promoter Score aferido na pesquisa trimestral' },
        { id: 'glosas_faturamento', name: 'Percentual de Glosas', sectorId: 'faturamento', unit: '%', target: 2.0, description: 'Porcentagem de faturamento glosado pelo SUS/Convênios' },
        { id: 'taxa_atendimento_psico', name: 'Taxa de Atendimento Psicológico', sectorId: 'psicologia', unit: '%', target: 40.0, description: 'Percentual de pacientes atendidos no mês sobre o total em diálise (DP + HD).' },
        { id: 'taxa_risco_psico', name: 'Taxa de Risco Psicológico', sectorId: 'psicologia', unit: '%', target: 25.0, description: 'Percentual de pacientes identificados com ansiedade, depressão ou risco emocional.' },
        { id: 'taxa_encaminhamento_rede', name: 'Taxa de Encaminhamento à Rede', sectorId: 'psicologia', unit: '%', target: 5.0, description: 'Percentual de encaminhamentos para acompanhamento externo ou avaliação de transplante.' },
        { id: 'taxa_atendimento_nutri', name: 'Taxa de Atendimento Nutricional', sectorId: 'nutricao', unit: '%', target: 15.0, description: 'Percentual de pacientes atendidos no mês pela equipe de Nutrição.' },
        { id: 'potassio_baixo', name: 'Potássio Sérico Baixo (< 3,5 mEq/L)', sectorId: 'nutricao', unit: '%', target: 5.0, description: 'Percentual de pacientes com nível de Potássio sérico baixo (< 3,5 mEq/L).' },
        { id: 'controle_potassio', name: 'Potássio Sérico Adequado (3,5 a 5,5 mEq/L)', sectorId: 'nutricao', unit: '%', target: 50.0, description: 'Percentual de pacientes com nível de Potássio sérico adequado (entre 3,5 e 5,5 mEq/L).' },
        { id: 'potassio_alto', name: 'Potássio Sérico Alto (> 5,5 mEq/L)', sectorId: 'nutricao', unit: '%', target: 15.0, description: 'Percentual de pacientes com nível de Potássio sérico alto (> 5,5 mEq/L).' },
        { id: 'fosforo_baixo', name: 'Fósforo Sérico Baixo (< 3,5 mg/dL)', sectorId: 'nutricao', unit: '%', target: 10.0, description: 'Percentual de pacientes com nível de Fósforo sérico baixo (< 3,5 mg/dL).' },
        { id: 'controle_fosforo', name: 'Fósforo Sérico Adequado (3,5 a 5,5 mg/dL)', sectorId: 'nutricao', unit: '%', target: 50.0, description: 'Percentual de pacientes com nível de Fósforo sérico adequado (entre 3,5 e 5,5 mg/dL).' },
        { id: 'fosforo_alto', name: 'Fósforo Sérico Alto (> 5,5 mg/dL)', sectorId: 'nutricao', unit: '%', target: 20.0, description: 'Percentual de pacientes com nível de Fósforo sérico alto (> 5,5 mg/dL).' },
        { id: 'nutri_baixo_peso', name: 'Taxa de Pacientes com Baixo Peso (IMC < 18,5)', sectorId: 'nutricao', unit: '%', target: 20.0, description: 'Percentual de pacientes classificados com baixo peso (IMC < 18,5).' },
        { id: 'nutri_peso_adequado', name: 'Taxa de Pacientes com Peso Adequado (IMC 18,5 - 24,9)', sectorId: 'nutricao', unit: '%', target: 50.0, description: 'Percentual de pacientes classificados com peso adequado (IMC 18,5 a 24,9).' },
        { id: 'nutri_obesidade', name: 'Taxa de Pacientes com Obesidade (IMC ≥ 30)', sectorId: 'nutricao', unit: '%', target: 15.0, description: 'Percentual de pacientes classificados com obesidade (IMC ≥ 30).' },
        { id: 'controle_gpid', name: 'Controle de Peso Interdialítico (GPID)', sectorId: 'nutricao', unit: '%', target: 70.0, description: 'Percentual de pacientes com ganho de peso interdialítico adequado (≤ 5% do peso seco).' },
        { id: 'controle_albumina', name: 'Adequação de Albumina Sérica', sectorId: 'nutricao', unit: '%', target: 70.0, description: 'Percentual de pacientes com nível de Albumina sérica adequado (> 3.0 g/dL).' }
      ];
      defaults.forEach(ind => {
        batch.set(doc(db, 'indicators', ind.id), ind);
      });
      await batch.commit();
      return defaults;
    }

    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  getUsers: async () => {
    if (USE_MOCK) {
      return mockFirestore.getUsers();
    }
    const { getFirestore, collection, getDocs, doc, deleteDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    const snap = await getDocs(collection(db, 'users'));
    const rawUsers = snap.docs.map(d => ({ uid: d.id, ...d.data() }));

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
  },

  updateUserPermissions: async (uid, allowedSectors) => {
    if (USE_MOCK) {
      return mockFirestore.updateUserPermissions(uid, allowedSectors);
    }
    const { getFirestore, doc, updateDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    return updateDoc(doc(db, 'users', uid), { allowedSectors, updatedAt: new Date().toISOString() });
  },

  updateUser: async (uid, userData) => {
    if (USE_MOCK) {
      return mockFirestore.updateUser(uid, userData);
    }
    const { getFirestore, doc, updateDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    return updateDoc(doc(db, 'users', uid), {
      ...userData,
      updatedAt: new Date().toISOString()
    });
  },

  deleteUser: async (uid) => {
    if (USE_MOCK) {
      return mockFirestore.deleteUser(uid);
    }
    const { getFirestore, doc, deleteDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    return deleteDoc(doc(db, 'users', uid));
  },

  getIndicatorData: async (allowedSectors, isAll = false) => {
    if (USE_MOCK) {
      return mockFirestore.getIndicatorData(allowedSectors, isAll);
    }
    const { getFirestore, collection, getDocs, query, where, writeBatch, doc } = await import('firebase/firestore');
    const db = getFirestore(app);
    const collectionRef = collection(db, 'indicator_data');
    
    if (!isAll && (!allowedSectors || allowedSectors.length === 0)) {
      return [];
    }

    let q;
    if (isAll) {
      q = query(collectionRef);
    } else {
      q = query(collectionRef, where('sectorId', 'in', allowedSectors));
    }
    
    const snap = await getDocs(q);
    
    // Seed default indicator data on first run if database has no data
    if (snap.empty && isAll) {
      const batch = writeBatch(db);
      const defaults = [
        // Enfermagem - Cateter
        { indicatorId: 'taxa_infeccao_cateter', sectorId: 'enfermagem', value: 1.8, period: '2026-04', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_infeccao_cateter', sectorId: 'enfermagem', value: 1.4, period: '2026-05', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_infeccao_cateter', sectorId: 'enfermagem', value: 1.2, period: '2026-06', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_infeccao_cateter', sectorId: 'enfermagem', value: 1.6, period: '2026-07', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        // Enfermagem - Reuso
        { indicatorId: 'reuso_capilares', sectorId: 'enfermagem', value: 11.2, period: '2026-04', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'reuso_capilares', sectorId: 'enfermagem', value: 11.8, period: '2026-05', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'reuso_capilares', sectorId: 'enfermagem', value: 12.3, period: '2026-06', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'reuso_capilares', sectorId: 'enfermagem', value: 12.1, period: '2026-07', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        // Médica - Mortalidade
        { indicatorId: 'mortalidade_mensal', sectorId: 'medica', value: 4.2, period: '2026-05', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'mortalidade_mensal', sectorId: 'medica', value: 5.1, period: '2026-06', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'mortalidade_mensal', sectorId: 'medica', value: 4.8, period: '2026-07', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        // Médica - Internação
        { indicatorId: 'taxa_internacao', sectorId: 'medica', value: 9.5, period: '2026-05', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_internacao', sectorId: 'medica', value: 11.2, period: '2026-06', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_internacao', sectorId: 'medica', value: 8.9, period: '2026-07', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        // Qualidade
        { indicatorId: 'satisfacao_paciente', sectorId: 'qualidade', value: 78, period: '2026-05', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'satisfacao_paciente', sectorId: 'qualidade', value: 82, period: '2026-06', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'satisfacao_paciente', sectorId: 'qualidade', value: 84, period: '2026-07', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        // Psicologia - Cobertura
        { indicatorId: 'taxa_atendimento_psico', sectorId: 'psicologia', value: 49.04, period: '2026-01', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_atendimento_psico', sectorId: 'psicologia', value: 29.01, period: '2026-02', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_atendimento_psico', sectorId: 'psicologia', value: 6.79, period: '2026-03', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_atendimento_psico', sectorId: 'psicologia', value: 28.27, period: '2026-04', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_atendimento_psico', sectorId: 'psicologia', value: 36.96, period: '2026-05', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_atendimento_psico', sectorId: 'psicologia', value: 40.58, period: '2026-06', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        // Psicologia - Risco
        { indicatorId: 'taxa_risco_psico', sectorId: 'psicologia', value: 28.00, period: '2026-01', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_risco_psico', sectorId: 'psicologia', value: 26.00, period: '2026-02', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_risco_psico', sectorId: 'psicologia', value: 15.00, period: '2026-03', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_risco_psico', sectorId: 'psicologia', value: 14.56, period: '2026-04', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_risco_psico', sectorId: 'psicologia', value: 34.43, period: '2026-05', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_risco_psico', sectorId: 'psicologia', value: 21.79, period: '2026-06', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        // Psicologia - Encaminhamento
        { indicatorId: 'taxa_encaminhamento_rede', sectorId: 'psicologia', value: 5.92, period: '2026-01', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_encaminhamento_rede', sectorId: 'psicologia', value: 3.21, period: '2026-02', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_encaminhamento_rede', sectorId: 'psicologia', value: 9.30, period: '2026-03', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_encaminhamento_rede', sectorId: 'psicologia', value: 8.47, period: '2026-04', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_encaminhamento_rede', sectorId: 'psicologia', value: 1.30, period: '2026-05', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_encaminhamento_rede', sectorId: 'psicologia', value: 4.97, period: '2026-06', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        // Nutrição - Cobertura
        { indicatorId: 'taxa_atendimento_nutri', sectorId: 'nutricao', value: 16.88, period: '2026-01', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_atendimento_nutri', sectorId: 'nutricao', value: 15.87, period: '2026-02', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_atendimento_nutri', sectorId: 'nutricao', value: 10.27, period: '2026-03', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_atendimento_nutri', sectorId: 'nutricao', value: 12.46, period: '2026-04', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_atendimento_nutri', sectorId: 'nutricao', value: 4.32, period: '2026-05', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_atendimento_nutri', sectorId: 'nutricao', value: 18.04, period: '2026-06', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        // Nutrição - Potássio Baixo
        { indicatorId: 'potassio_baixo', sectorId: 'nutricao', value: 25.66, period: '2026-01', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'potassio_baixo', sectorId: 'nutricao', value: 1.27, period: '2026-02', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'potassio_baixo', sectorId: 'nutricao', value: 1.87, period: '2026-03', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'potassio_baixo', sectorId: 'nutricao', value: 0.00, period: '2026-04', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'potassio_baixo', sectorId: 'nutricao', value: 0.00, period: '2026-05', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'potassio_baixo', sectorId: 'nutricao', value: 1.02, period: '2026-06', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        // Nutrição - Potássio Adequado
        { indicatorId: 'controle_potassio', sectorId: 'nutricao', value: 66.03, period: '2026-01', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'controle_potassio', sectorId: 'nutricao', value: 60.09, period: '2026-02', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'controle_potassio', sectorId: 'nutricao', value: 61.39, period: '2026-03', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'controle_potassio', sectorId: 'nutricao', value: 50.00, period: '2026-04', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'controle_potassio', sectorId: 'nutricao', value: 63.82, period: '2026-05', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'controle_potassio', sectorId: 'nutricao', value: 68.36, period: '2026-06', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        // Nutrição - Potássio Alto
        { indicatorId: 'potassio_alto', sectorId: 'nutricao', value: 8.30, period: '2026-01', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'potassio_alto', sectorId: 'nutricao', value: 38.63, period: '2026-02', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'potassio_alto', sectorId: 'nutricao', value: 36.73, period: '2026-03', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'potassio_alto', sectorId: 'nutricao', value: 50.00, period: '2026-04', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'potassio_alto', sectorId: 'nutricao', value: 36.17, period: '2026-05', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'potassio_alto', sectorId: 'nutricao', value: 30.61, period: '2026-06', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        // Nutrição - Fósforo Baixo
        { indicatorId: 'fosforo_baixo', sectorId: 'nutricao', value: 7.69, period: '2026-01', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'fosforo_baixo', sectorId: 'nutricao', value: 13.27, period: '2026-02', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'fosforo_baixo', sectorId: 'nutricao', value: 15.52, period: '2026-03', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'fosforo_baixo', sectorId: 'nutricao', value: 29.73, period: '2026-04', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'fosforo_baixo', sectorId: 'nutricao', value: 19.31, period: '2026-05', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'fosforo_baixo', sectorId: 'nutricao', value: 20.41, period: '2026-06', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        // Nutrição - Fósforo Adequado
        { indicatorId: 'controle_fosforo', sectorId: 'nutricao', value: 48.44, period: '2026-01', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'controle_fosforo', sectorId: 'nutricao', value: 57.18, period: '2026-02', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'controle_fosforo', sectorId: 'nutricao', value: 34.72, period: '2026-03', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'controle_fosforo', sectorId: 'nutricao', value: 62.16, period: '2026-04', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'controle_fosforo', sectorId: 'nutricao', value: 61.37, period: '2026-05', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'controle_fosforo', sectorId: 'nutricao', value: 58.84, period: '2026-06', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        // Nutrição - Fósforo Alto
        { indicatorId: 'fosforo_alto', sectorId: 'nutricao', value: 43.86, period: '2026-01', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'fosforo_alto', sectorId: 'nutricao', value: 29.54, period: '2026-02', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'fosforo_alto', sectorId: 'nutricao', value: 49.74, period: '2026-03', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'fosforo_alto', sectorId: 'nutricao', value: 8.11, period: '2026-04', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'fosforo_alto', sectorId: 'nutricao', value: 19.31, period: '2026-05', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'fosforo_alto', sectorId: 'nutricao', value: 20.75, period: '2026-06', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        // Nutrição - Baixo Peso
        { indicatorId: 'nutri_baixo_peso', sectorId: 'nutricao', value: 56.52, period: '2026-01', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'nutri_baixo_peso', sectorId: 'nutricao', value: 38.88, period: '2026-02', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'nutri_baixo_peso', sectorId: 'nutricao', value: 0.00, period: '2026-03', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'nutri_baixo_peso', sectorId: 'nutricao', value: 41.17, period: '2026-04', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'nutri_baixo_peso', sectorId: 'nutricao', value: 44.44, period: '2026-05', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'nutri_baixo_peso', sectorId: 'nutricao', value: 45.45, period: '2026-06', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        // Nutrição - Peso Adequado
        { indicatorId: 'nutri_peso_adequado', sectorId: 'nutricao', value: 34.78, period: '2026-01', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'nutri_peso_adequado', sectorId: 'nutricao', value: 38.88, period: '2026-02', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'nutri_peso_adequado', sectorId: 'nutricao', value: 80.00, period: '2026-03', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'nutri_peso_adequado', sectorId: 'nutricao', value: 47.05, period: '2026-04', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'nutri_peso_adequado', sectorId: 'nutricao', value: 44.44, period: '2026-05', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'nutri_peso_adequado', sectorId: 'nutricao', value: 18.18, period: '2026-06', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        // Nutrição - Obesidade
        { indicatorId: 'nutri_obesidade', sectorId: 'nutricao', value: 8.69, period: '2026-01', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'nutri_obesidade', sectorId: 'nutricao', value: 22.22, period: '2026-02', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'nutri_obesidade', sectorId: 'nutricao', value: 20.00, period: '2026-03', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'nutri_obesidade', sectorId: 'nutricao', value: 11.76, period: '2026-04', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'nutri_obesidade', sectorId: 'nutricao', value: 11.11, period: '2026-05', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'nutri_obesidade', sectorId: 'nutricao', value: 36.36, period: '2026-06', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        // Nutrição - GPID
        { indicatorId: 'controle_gpid', sectorId: 'nutricao', value: 68.00, period: '2026-01', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'controle_gpid', sectorId: 'nutricao', value: 72.72, period: '2026-02', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'controle_gpid', sectorId: 'nutricao', value: 66.23, period: '2026-03', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'controle_gpid', sectorId: 'nutricao', value: 55.69, period: '2026-04', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'controle_gpid', sectorId: 'nutricao', value: 58.75, period: '2026-05', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'controle_gpid', sectorId: 'nutricao', value: 54.43, period: '2026-06', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        // Nutrição - Albumina
        { indicatorId: 'controle_albumina', sectorId: 'nutricao', value: 97.40, period: '2026-01', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'controle_albumina', sectorId: 'nutricao', value: 96.10, period: '2026-02', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'controle_albumina', sectorId: 'nutricao', value: 95.50, period: '2026-03', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'controle_albumina', sectorId: 'nutricao', value: 94.73, period: '2026-04', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'controle_albumina', sectorId: 'nutricao', value: 95.80, period: '2026-05', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'controle_albumina', sectorId: 'nutricao', value: 96.50, period: '2026-06', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() }
      ];
      defaults.forEach(d => {
        const docId = `${d.indicatorId}_${d.period}`;
        batch.set(doc(db, 'indicator_data', docId), d);
      });
      await batch.commit();
      return defaults;
    }
    
    return snap.docs.map(doc => doc.data());
  },

  saveIndicatorDataBatch: async (records, fileName, uploaderUid) => {
    if (USE_MOCK) {
      return mockFirestore.saveIndicatorDataBatch(records, fileName, uploaderUid);
    }
    
    const { getFirestore, writeBatch, doc, collection, getDocs } = await import('firebase/firestore');
    const db = getFirestore(app);
    const batch = writeBatch(db);

    // Fetch existing sectors and indicators to map names to IDs
    const sectorsSnap = await getDocs(collection(db, 'sectors'));
    const sectorsList = sectorsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

    const indicatorsSnap = await getDocs(collection(db, 'indicators'));
    const indicatorsList = indicatorsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

    let rowsProcessed = 0;

    for (const rec of records) {
      const sector = sectorsList.find(s => s.name.toLowerCase() === rec.sector.toLowerCase() || s.id === rec.sector.toLowerCase());
      if (!sector) continue;

      let indicator = indicatorsList.find(ind => ind.name.toLowerCase() === rec.indicatorName.toLowerCase() && ind.sectorId === sector.id);

      let indicatorId;
      if (!indicator) {
        // Auto create indicator in batch if not exists
        indicatorId = rec.indicatorName.toLowerCase().replace(/[^a-z0-9]/g, '_').substring(0, 30);
        const newIndicatorRef = doc(db, 'indicators', indicatorId);
        batch.set(newIndicatorRef, {
          id: indicatorId,
          name: rec.indicatorName,
          sectorId: sector.id,
          unit: rec.unit || '%',
          target: parseFloat(rec.target) || 0,
          description: 'Criado via importação de arquivo'
        });
      } else {
        indicatorId = indicator.id;
      }

      // Generate a document ID for the metric (e.g. indicatorId_period)
      const dataId = `${indicatorId}_${rec.period}`;
      const dataRef = doc(db, 'indicator_data', dataId);

      batch.set(dataRef, {
        indicatorId,
        sectorId: sector.id,
        value: parseFloat(rec.value),
        period: rec.period,
        uploadedBy: uploaderUid,
        uploadedAt: new Date().toISOString()
      });

      rowsProcessed++;
    }

    // Add upload to history
    const uploadId = 'upload_' + Math.random().toString(36).substr(2, 9);
    const uploadRef = doc(db, 'uploads_history', uploadId);
    const uploadRecord = {
      fileName,
      uploadedBy: uploaderUid,
      uploadedAt: new Date().toISOString(),
      status: 'success',
      rowsProcessed
    };
    batch.set(uploadRef, uploadRecord);

    await batch.commit();
    return { id: uploadId, ...uploadRecord };
  },

  getUploadsHistory: async () => {
    if (USE_MOCK) {
      return mockFirestore.getUploadsHistory();
    }
    const { getFirestore, collection, getDocs, query, orderBy } = await import('firebase/firestore');
    const db = getFirestore(app);
    const snap = await getDocs(query(collection(db, 'uploads_history'), orderBy('uploadedAt', 'desc')));
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  getPatients: async () => {
    if (USE_MOCK) {
      return mockFirestore.getPatients();
    }
    const { getFirestore, collection, getDocs } = await import('firebase/firestore');
    const db = getFirestore(app);
    const snap = await getDocs(collection(db, 'patients'));
    
    // Seed default patients if Firestore is empty
    if (snap.empty) {
      const { writeBatch, doc } = await import('firebase/firestore');
      const batch = writeBatch(db);
      const patientsList = await mockFirestore.getPatients();
      patientsList.forEach(pat => {
        batch.set(doc(db, 'patients', pat.id), pat);
      });
      await batch.commit();
      return patientsList;
    }

    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  createPatient: async (patientData) => {
    if (USE_MOCK) {
      return mockFirestore.createPatient(patientData);
    }
    const { getFirestore, collection, addDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    const docRef = await addDoc(collection(db, 'patients'), {
      ...patientData,
      createdAt: new Date().toISOString()
    });
    return { id: docRef.id, ...patientData };
  },

  updatePatient: async (id, patientData) => {
    if (USE_MOCK) {
      return mockFirestore.updatePatient(id, patientData);
    }
    const { getFirestore, doc, updateDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    return updateDoc(doc(db, 'patients', id), {
      ...patientData,
      updatedAt: new Date().toISOString()
    });
  },

  deletePatient: async (id) => {
    if (USE_MOCK) {
      return mockFirestore.deletePatient(id);
    }
    const { getFirestore, doc, deleteDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    return deleteDoc(doc(db, 'patients', id));
  },

  createIndicator: async (indicatorData) => {
    if (USE_MOCK) {
      return mockFirestore.createIndicator(indicatorData);
    }
    const { getFirestore, doc, setDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    const id = indicatorData.name.toLowerCase().replace(/[^a-z0-9]/g, '_').substring(0, 30) + '_' + Math.random().toString(36).substr(2, 5);
    await setDoc(doc(db, 'indicators', id), { id, ...indicatorData });
    return { id, ...indicatorData };
  },

  updateIndicator: async (id, indicatorData) => {
    if (USE_MOCK) {
      return mockFirestore.updateIndicator(id, indicatorData);
    }
    const { getFirestore, doc, updateDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    return updateDoc(doc(db, 'indicators', id), indicatorData);
  },

  deleteIndicator: async (id) => {
    if (USE_MOCK) {
      return mockFirestore.deleteIndicator(id);
    }
    const { getFirestore, doc, deleteDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    return deleteDoc(doc(db, 'indicators', id));
  },

  saveSingleIndicatorRecord: async (record, uploaderUid) => {
    if (USE_MOCK) {
      return mockFirestore.saveSingleIndicatorRecord(record, uploaderUid);
    }
    const { getFirestore, doc, setDoc, getDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    const dataId = `${record.indicatorId}_${record.period}`;
    const dataRef = doc(db, 'indicator_data', dataId);
    
    const dataPoint = {
      indicatorId: record.indicatorId,
      sectorId: record.sectorId,
      value: parseFloat(record.value),
      period: record.period,
      uploadedBy: uploaderUid,
      uploadedAt: new Date().toISOString()
    };
    await setDoc(dataRef, dataPoint);

    // Save history audit log
    const uploadId = 'upload_' + Math.random().toString(36).substr(2, 9);
    const indDoc = await getDoc(doc(db, 'indicators', record.indicatorId));
    const indName = indDoc.exists() ? indDoc.data().name : 'Indicador';

    await setDoc(doc(db, 'uploads_history', uploadId), {
      fileName: `Lançamento Manual: ${indName}`,
      uploadedBy: uploaderUid,
      uploadedAt: new Date().toISOString(),
      status: 'success',
      rowsProcessed: 1
    });

    return dataPoint;
  },

  getShifts: async () => {
    if (USE_MOCK) {
      return mockFirestore.getShifts();
    }
    const { getFirestore, collection, getDocs } = await import('firebase/firestore');
    const db = getFirestore(app);
    const snap = await getDocs(collection(db, 'shifts'));
    if (snap.empty) {
      const { writeBatch, doc } = await import('firebase/firestore');
      const batch = writeBatch(db);
      const defaults = [
        { id: 'shift_1', name: '1º Turno' },
        { id: 'shift_2', name: '2º Turno' },
        { id: 'shift_3', name: '3º Turno' }
      ];
      defaults.forEach(s => {
        batch.set(doc(db, 'shifts', s.id), s);
      });
      await batch.commit();
      return defaults;
    }
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  createShift: async (shiftData) => {
    if (USE_MOCK) {
      return mockFirestore.createShift(shiftData);
    }
    const { getFirestore, collection, addDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    const docRef = await addDoc(collection(db, 'shifts'), shiftData);
    return { id: docRef.id, ...shiftData };
  },

  updateShift: async (id, shiftData) => {
    if (USE_MOCK) {
      return mockFirestore.updateShift(id, shiftData);
    }
    const { getFirestore, doc, updateDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    return updateDoc(doc(db, 'shifts', id), shiftData);
  },

  deleteShift: async (id) => {
    if (USE_MOCK) {
      return mockFirestore.deleteShift(id);
    }
    const { getFirestore, doc, deleteDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    return deleteDoc(doc(db, 'shifts', id));
  },

  getRooms: async () => {
    if (USE_MOCK) {
      return mockFirestore.getRooms();
    }
    const { getFirestore, collection, getDocs } = await import('firebase/firestore');
    const db = getFirestore(app);
    const snap = await getDocs(collection(db, 'rooms'));
    if (snap.empty) {
      const { writeBatch, doc } = await import('firebase/firestore');
      const batch = writeBatch(db);
      const defaults = [
        { id: 'room_1', name: 'Salão 1' },
        { id: 'room_2', name: 'Salão 2' },
        { id: 'room_3', name: 'Salão 3' }
      ];
      defaults.forEach(r => {
        batch.set(doc(db, 'rooms', r.id), r);
      });
      await batch.commit();
      return defaults;
    }
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  createRoom: async (roomData) => {
    if (USE_MOCK) {
      return mockFirestore.createRoom(roomData);
    }
    const { getFirestore, collection, addDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    const docRef = await addDoc(collection(db, 'rooms'), roomData);
    return { id: docRef.id, ...roomData };
  },

  updateRoom: async (id, roomData) => {
    if (USE_MOCK) {
      return mockFirestore.updateRoom(id, roomData);
    }
    const { getFirestore, doc, updateDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    return updateDoc(doc(db, 'rooms', id), roomData);
  },

  deleteRoom: async (id) => {
    if (USE_MOCK) {
      return mockFirestore.deleteRoom(id);
    }
    const { getFirestore, doc, deleteDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    return deleteDoc(doc(db, 'rooms', id));
  },

  createSector: async (sectorData) => {
    if (USE_MOCK) {
      return mockFirestore.createSector(sectorData);
    }
    const { getFirestore, doc, setDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    const id = sectorData.name.toLowerCase().replace(/[^a-z0-9]/g, '_').substring(0, 20) + '_' + Math.random().toString(36).substr(2, 4);
    await setDoc(doc(db, 'sectors', id), { id, ...sectorData });
    return { id, ...sectorData };
  },

  updateSector: async (id, sectorData) => {
    if (USE_MOCK) {
      return mockFirestore.updateSector(id, sectorData);
    }
    const { getFirestore, doc, updateDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    return updateDoc(doc(db, 'sectors', id), sectorData);
  },

  deleteSector: async (id) => {
    if (USE_MOCK) {
      return mockFirestore.deleteSector(id);
    }
    const { getFirestore, doc, deleteDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    return deleteDoc(doc(db, 'sectors', id));
  },

  getAccessTypes: async () => {
    if (USE_MOCK) {
      return mockFirestore.getAccessTypes();
    }
    const { getFirestore, collection, getDocs } = await import('firebase/firestore');
    const db = getFirestore(app);
    const snap = await getDocs(collection(db, 'access_types'));
    if (snap.empty) {
      const { writeBatch, doc } = await import('firebase/firestore');
      const batch = writeBatch(db);
      const defaults = [
        { id: 'access_1', name: 'Fístula Arteriovenosa' },
        { id: 'access_2', name: 'Cateter Duplo Lúmen' },
        { id: 'access_3', name: 'Prótese' }
      ];
      defaults.forEach(a => {
        batch.set(doc(db, 'access_types', a.id), a);
      });
      await batch.commit();
      return defaults;
    }
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  createAccessType: async (accessData) => {
    if (USE_MOCK) {
      return mockFirestore.createAccessType(accessData);
    }
    const { getFirestore, collection, addDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    const docRef = await addDoc(collection(db, 'access_types'), accessData);
    return { id: docRef.id, ...accessData };
  },

  updateAccessType: async (id, accessData) => {
    if (USE_MOCK) {
      return mockFirestore.updateAccessType(id, accessData);
    }
    const { getFirestore, doc, updateDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    return updateDoc(doc(db, 'access_types', id), accessData);
  },

  deleteAccessType: async (id) => {
    if (USE_MOCK) {
      return mockFirestore.deleteAccessType(id);
    }
    const { getFirestore, doc, deleteDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    return deleteDoc(doc(db, 'access_types', id));
  },

  getDialysisFrequencies: async () => {
    if (USE_MOCK) {
      return mockFirestore.getDialysisFrequencies();
    }
    const { getFirestore, collection, getDocs } = await import('firebase/firestore');
    const db = getFirestore(app);
    const snap = await getDocs(collection(db, 'dialysis_frequencies'));
    if (snap.empty) {
      const { writeBatch, doc } = await import('firebase/firestore');
      const batch = writeBatch(db);
      const defaults = [
        { id: 'freq_1', name: '3x por semana (Seg/Qua/Sex)' },
        { id: 'freq_2', name: '3x por semana (Ter/Qui/Sáb)' },
        { id: 'freq_3', name: '2x por semana' },
        { id: 'freq_4', name: 'Diário' }
      ];
      defaults.forEach(d => {
        batch.set(doc(db, 'dialysis_frequencies', d.id), d);
      });
      await batch.commit();
      return defaults;
    }
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  createDialysisFrequency: async (frequencyData) => {
    if (USE_MOCK) {
      return mockFirestore.createDialysisFrequency(frequencyData);
    }
    const { getFirestore, collection, addDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    const docRef = await addDoc(collection(db, 'dialysis_frequencies'), frequencyData);
    return { id: docRef.id, ...frequencyData };
  },

  updateDialysisFrequency: async (id, frequencyData) => {
    if (USE_MOCK) {
      return mockFirestore.updateDialysisFrequency(id, frequencyData);
    }
    const { getFirestore, doc, updateDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    return updateDoc(doc(db, 'dialysis_frequencies', id), frequencyData);
  },

  deleteDialysisFrequency: async (id) => {
    if (USE_MOCK) {
      return mockFirestore.deleteDialysisFrequency(id);
    }
    const { getFirestore, doc, deleteDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    return deleteDoc(doc(db, 'dialysis_frequencies', id));
  },

  getCheckins: async () => {
    if (USE_MOCK) {
      return mockFirestore.getCheckins();
    }
    const { getFirestore, collection, getDocs } = await import('firebase/firestore');
    const db = getFirestore(app);
    const snap = await getDocs(collection(db, 'checkins'));
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  saveCheckin: async (checkinData) => {
    if (USE_MOCK) {
      return mockFirestore.saveCheckin(checkinData);
    }
    const { getFirestore, collection, addDoc, query, where, getDocs, deleteDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    
    // Clear duplicates in Firestore for same patient and same day
    const q = query(
      collection(db, 'checkins'),
      where('patientId', '==', checkinData.patientId),
      where('date', '==', checkinData.date)
    );
    const snap = await getDocs(q);
    const deletePromises = snap.docs.map(d => deleteDoc(d.ref));
    await Promise.all(deletePromises);

    const docRef = await addDoc(collection(db, 'checkins'), {
      ...checkinData,
      timestamp: new Date().toISOString()
    });
    return { id: docRef.id, ...checkinData };
  },

  deleteCheckin: async (id) => {
    if (USE_MOCK) {
      return mockFirestore.deleteCheckin(id);
    }
    const { getFirestore, doc, deleteDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    return deleteDoc(doc(db, 'checkins', id));
  },

  // Prescriptions
  getPrescriptions: async () => {
    if (USE_MOCK) return mockFirestore.getPrescriptions();
    const { getFirestore, collection, getDocs } = await import('firebase/firestore');
    const db = getFirestore(app);
    const snap = await getDocs(collection(db, 'prescriptions'));
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  savePrescription: async (prescData) => {
    if (USE_MOCK) return mockFirestore.savePrescription(prescData);
    const { getFirestore, collection, addDoc, query, where, getDocs, updateDoc, doc } = await import('firebase/firestore');
    const db = getFirestore(app);
    const q = query(collection(db, 'prescriptions'), where('patientId', '==', prescData.patientId));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const docId = snap.docs[0].id;
      await updateDoc(doc(db, 'prescriptions', docId), { ...prescData, updatedAt: new Date().toISOString() });
      return { id: docId, ...prescData };
    } else {
      const docRef = await addDoc(collection(db, 'prescriptions'), { ...prescData, updatedAt: new Date().toISOString() });
      return { id: docRef.id, ...prescData };
    }
  },

  // Sessions Logs
  getSessionsLogs: async () => {
    if (USE_MOCK) return mockFirestore.getSessionsLogs();
    const { getFirestore, collection, getDocs } = await import('firebase/firestore');
    const db = getFirestore(app);
    const snap = await getDocs(collection(db, 'sessions_logs'));
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  saveSessionLog: async (logData) => {
    if (USE_MOCK) return mockFirestore.saveSessionLog(logData);
    const { getFirestore, collection, addDoc, query, where, getDocs, updateDoc, doc } = await import('firebase/firestore');
    const db = getFirestore(app);
    const q = query(collection(db, 'sessions_logs'), where('patientId', '==', logData.patientId), where('date', '==', logData.date));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const docId = snap.docs[0].id;
      await updateDoc(doc(db, 'sessions_logs', docId), { ...logData, updatedAt: new Date().toISOString() });
      return { id: docId, ...logData };
    } else {
      const docRef = await addDoc(collection(db, 'sessions_logs'), { ...logData, updatedAt: new Date().toISOString() });
      return { id: docRef.id, ...logData };
    }
  },

  // Clinical Notes
  getClinicalNotes: async () => {
    if (USE_MOCK) return mockFirestore.getClinicalNotes();
    const { getFirestore, collection, getDocs } = await import('firebase/firestore');
    const db = getFirestore(app);
    const snap = await getDocs(collection(db, 'clinical_notes'));
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  createClinicalNote: async (noteData) => {
    if (USE_MOCK) return mockFirestore.createClinicalNote(noteData);
    const { getFirestore, collection, addDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    const docRef = await addDoc(collection(db, 'clinical_notes'), {
      ...noteData,
      date: new Date().toISOString().substring(0, 10)
    });
    return { id: docRef.id, ...noteData, date: new Date().toISOString().substring(0, 10) };
  },

  deleteClinicalNote: async (id) => {
    if (USE_MOCK) return mockFirestore.deleteClinicalNote(id);
    const { getFirestore, doc, deleteDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    return deleteDoc(doc(db, 'clinical_notes', id));
  },

  // Inventory Items
  getInventoryItems: async () => {
    if (USE_MOCK) return mockFirestore.getInventoryItems();
    try {
      const { getFirestore, collection, getDocs } = await import('firebase/firestore');
      const db = getFirestore(app);
      const snap = await getDocs(collection(db, 'inventory_items'));
      if (snap.empty) return mockFirestore.getInventoryItems();
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (e) {
      console.error("Erro ao carregar inventory_items do Firestore:", e);
      return mockFirestore.getInventoryItems();
    }
  },

  createInventoryItem: async (itemData) => {
    if (USE_MOCK) return mockFirestore.createInventoryItem(itemData);
    const { getFirestore, collection, addDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    const docRef = await addDoc(collection(db, 'inventory_items'), itemData);
    return { id: docRef.id, ...itemData };
  },

  updateInventoryItem: async (id, itemData) => {
    if (USE_MOCK) return mockFirestore.updateInventoryItem(id, itemData);
    const { getFirestore, doc, updateDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    await updateDoc(doc(db, 'inventory_items', id), itemData);
    return { id, ...itemData };
  },

  // Stock Transactions
  getStockTransactions: async () => {
    if (USE_MOCK) return mockFirestore.getStockTransactions();
    try {
      const { getFirestore, collection, getDocs } = await import('firebase/firestore');
      const db = getFirestore(app);
      const snap = await getDocs(collection(db, 'stock_transactions'));
      if (snap.empty) return mockFirestore.getStockTransactions();
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (e) {
      console.error("Erro ao carregar stock_transactions do Firestore:", e);
      return mockFirestore.getStockTransactions();
    }
  },

  createStockTransaction: async (txData) => {
    if (USE_MOCK) return mockFirestore.createStockTransaction(txData);
    const { getFirestore, collection, addDoc, doc, getDoc, updateDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    const docRef = await addDoc(collection(db, 'stock_transactions'), {
      ...txData,
      date: new Date().toISOString()
    });
    
    // Update inventory item stock level in Firestore
    const itemRef = doc(db, 'inventory_items', txData.itemId);
    const itemSnap = await getDoc(itemRef);
    if (itemSnap.exists()) {
      const current = parseFloat(itemSnap.data().currentStock) || 0;
      const change = parseFloat(txData.quantity) || 0;
      const newStock = txData.type === 'Entrada' ? current + change : Math.max(0, current - change);
      await updateDoc(itemRef, { currentStock: newStock });
    }

    return { id: docRef.id, ...txData, date: new Date().toISOString() };
  },

  // Suppliers
  getSuppliers: async () => {
    if (USE_MOCK) return mockFirestore.getSuppliers();
    try {
      const { getFirestore, collection, getDocs } = await import('firebase/firestore');
      const db = getFirestore(app);
      const snap = await getDocs(collection(db, 'suppliers'));
      if (snap.empty) return mockFirestore.getSuppliers();
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (e) {
      console.error("Erro ao carregar suppliers do Firestore:", e);
      return mockFirestore.getSuppliers();
    }
  },
  createSupplier: async (supplierData) => {
    if (USE_MOCK) return mockFirestore.createSupplier(supplierData);
    const { getFirestore, collection, addDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    const docRef = await addDoc(collection(db, 'suppliers'), supplierData);
    return { id: docRef.id, ...supplierData };
  },
  updateSupplier: async (id, supplierData) => {
    if (USE_MOCK) return mockFirestore.updateSupplier(id, supplierData);
    const { getFirestore, doc, updateDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    await updateDoc(doc(db, 'suppliers', id), supplierData);
    return { id, ...supplierData };
  },

  // Stock Sectors
  getStockSectors: async () => {
    if (USE_MOCK) return mockFirestore.getStockSectors();
    try {
      const { getFirestore, collection, getDocs } = await import('firebase/firestore');
      const db = getFirestore(app);
      const snap = await getDocs(collection(db, 'stock_sectors'));
      if (snap.empty) return mockFirestore.getStockSectors();
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (e) {
      console.error("Erro ao carregar stock_sectors do Firestore:", e);
      return mockFirestore.getStockSectors();
    }
  },
  createStockSector: async (sectorData) => {
    if (USE_MOCK) return mockFirestore.createStockSector(sectorData);
    const { getFirestore, collection, addDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    const docRef = await addDoc(collection(db, 'stock_sectors'), sectorData);
    return { id: docRef.id, ...sectorData };
  },
  updateStockSector: async (id, sectorData) => {
    if (USE_MOCK) return mockFirestore.updateStockSector(id, sectorData);
    const { getFirestore, doc, updateDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    await updateDoc(doc(db, 'stock_sectors', id), sectorData);
    return { id, ...sectorData };
  },

  // Purchase Invoices
  getPurchaseInvoices: async () => {
    if (USE_MOCK) return mockFirestore.getPurchaseInvoices();
    try {
      const { getFirestore, collection, getDocs } = await import('firebase/firestore');
      const db = getFirestore(app);
      const snap = await getDocs(collection(db, 'purchase_invoices'));
      if (snap.empty) return mockFirestore.getPurchaseInvoices();
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (e) {
      console.error("Erro ao carregar purchase_invoices do Firestore:", e);
      return mockFirestore.getPurchaseInvoices();
    }
  },
  createPurchaseInvoice: async (invoiceData) => {
    if (USE_MOCK) return mockFirestore.createPurchaseInvoice(invoiceData);
    const { getFirestore, collection, doc, writeBatch } = await import('firebase/firestore');
    const db = getFirestore(app);
    const batch = writeBatch(db);
    
    const invoiceRef = doc(collection(db, 'purchase_invoices'));
    const entryDate = new Date().toISOString().substring(0, 10);
    const invoiceRecord = {
      ...invoiceData,
      id: invoiceRef.id,
      entryDate,
      status: 'Processada'
    };
    batch.set(invoiceRef, invoiceRecord);

    for (const item of (invoiceData.items || [])) {
      const txRef = doc(collection(db, 'stock_transactions'));
      batch.set(txRef, {
        id: txRef.id,
        itemId: item.itemId,
        itemName: item.name,
        quantity: parseFloat(item.quantity) || 0,
        type: 'Entrada',
        batch: item.batch || 'XML-IMPORT',
        expiryDate: item.expiryDate || '',
        operator: 'Importador XML',
        date: new Date().toISOString(),
        notes: `Entrada via NF-e ${invoiceData.number}`
      });
    }
    await batch.commit();
    return invoiceRecord;
  },

  // Employees
  getEmployees: async () => {
    if (USE_MOCK) return mockFirestore.getEmployees();
    const { getFirestore, collection, getDocs, addDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    try {
      const snap = await getDocs(collection(db, 'employees'));
      if (snap.empty) {
        // Seed initial employees into Cloud Firestore
        const mockEmps = await mockFirestore.getEmployees();
        const seeded = [];
        for (const emp of mockEmps) {
          const { id, ...data } = emp;
          const ref = await addDoc(collection(db, 'employees'), data);
          seeded.push({ id: ref.id, ...data });
        }
        return seeded;
      }
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (err) {
      console.error("Erro ao buscar funcionários do Firestore, executando fallback:", err);
      return mockFirestore.getEmployees();
    }
  },
  createEmployee: async (employeeData) => {
    if (USE_MOCK) return mockFirestore.createEmployee(employeeData);
    const { getFirestore, collection, addDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    const docRef = await addDoc(collection(db, 'employees'), {
      ...employeeData,
      createdAt: new Date().toISOString()
    });
    return { id: docRef.id, ...employeeData };
  },
  updateEmployee: async (id, employeeData) => {
    if (USE_MOCK) return mockFirestore.updateEmployee(id, employeeData);
    const { getFirestore, doc, updateDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    await updateDoc(doc(db, 'employees', id), employeeData);
    return { id, ...employeeData };
  },
  deleteEmployee: async (id) => {
    if (USE_MOCK) return mockFirestore.deleteEmployee(id);
    const { getFirestore, doc, deleteDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    return deleteDoc(doc(db, 'employees', id));
  },

  // Audit Logs
  getAuditLogs: async () => {
    if (USE_MOCK) return mockFirestore.getAuditLogs();
    const { getFirestore, collection, getDocs } = await import('firebase/firestore');
    const db = getFirestore(app);
    const snap = await getDocs(collection(db, 'audit_logs'));
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },
  createAuditLog: async (logData) => {
    if (USE_MOCK) return mockFirestore.createAuditLog(logData);
    const { getFirestore, collection, addDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    const docRef = await addDoc(collection(db, 'audit_logs'), {
      ...logData,
      date: new Date().toISOString()
    });
    return { id: docRef.id, ...logData };
  },

  // Financial management
  getAccountsPayable: async () => {
    if (USE_MOCK) return mockFirestore.getAccountsPayable();
    return mockFirestore.getAccountsPayable();
  },
  saveAccountsPayable: async (item) => {
    if (USE_MOCK) return mockFirestore.saveAccountsPayable(item);
    return mockFirestore.saveAccountsPayable(item);
  },
  deleteAccountsPayable: async (id) => {
    if (USE_MOCK) return mockFirestore.deleteAccountsPayable(id);
    return mockFirestore.deleteAccountsPayable(id);
  },
  getAccountsReceivable: async () => {
    if (USE_MOCK) return mockFirestore.getAccountsReceivable();
    return mockFirestore.getAccountsReceivable();
  },
  saveAccountsReceivable: async (item) => {
    if (USE_MOCK) return mockFirestore.saveAccountsReceivable(item);
    return mockFirestore.saveAccountsReceivable(item);
  },
  deleteAccountsReceivable: async (id) => {
    if (USE_MOCK) return mockFirestore.deleteAccountsReceivable(id);
    return mockFirestore.deleteAccountsReceivable(id);
  },
  getXmlImports: async () => {
    if (USE_MOCK) return mockFirestore.getXmlImports();
    return mockFirestore.getXmlImports();
  },
  saveXmlImport: async (xmlData) => {
    if (USE_MOCK) return mockFirestore.saveXmlImport(xmlData);
    return mockFirestore.saveXmlImport(xmlData);
  },
  
  // Transport Vouchers
  getTransportVouchers: async () => {
    if (USE_MOCK) return mockFirestore.getTransportVouchers();
    return mockFirestore.getTransportVouchers();
  },
  createTransportVoucher: async (voucherData) => {
    if (USE_MOCK) return mockFirestore.createTransportVoucher(voucherData);
    return mockFirestore.createTransportVoucher(voucherData);
  },
  updateTransportVoucher: async (id, voucherData) => {
    if (USE_MOCK) return mockFirestore.updateTransportVoucher(id, voucherData);
    return mockFirestore.updateTransportVoucher(id, voucherData);
  },
  deleteTransportVoucher: async (id) => {
    if (USE_MOCK) return mockFirestore.deleteTransportVoucher(id);
    return mockFirestore.deleteTransportVoucher(id);
  },
  
  // Tenant Settings (SaaS Configurations)
  getTenantSettings: async () => {
    if (USE_MOCK) return mockFirestore.getTenantSettings();
    try {
      const { getFirestore, doc, getDoc } = await import('firebase/firestore');
      const db = getFirestore(app);
      const snap = await getDoc(doc(db, 'tenant_settings', 'main'));
      if (snap.exists()) {
        return snap.data();
      }
      return mockFirestore.getTenantSettings();
    } catch (e) {
      console.error('Erro ao ler tenant_settings do Firestore:', e);
      return mockFirestore.getTenantSettings();
    }
  },
  saveTenantSettings: async (settings) => {
    if (USE_MOCK) return mockFirestore.saveTenantSettings(settings);
    try {
      const { getFirestore, doc, setDoc } = await import('firebase/firestore');
      const db = getFirestore(app);
      await setDoc(doc(db, 'tenant_settings', 'main'), settings, { merge: true });
      return settings;
    } catch (e) {
      console.error('Erro ao salvar tenant_settings no Firestore:', e);
      return mockFirestore.saveTenantSettings(settings);
    }
  },

  // User Profiles (RBAC Roles)
  getUserProfiles: async () => {
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
      return mockFirestore.getUserProfiles();
    }
  },
  saveUserProfile: async (profile) => {
    if (USE_MOCK) return mockFirestore.saveUserProfile(profile);
    try {
      const { getFirestore, doc, setDoc } = await import('firebase/firestore');
      const db = getFirestore(app);
      const { id, ...data } = profile;
      await setDoc(doc(db, 'user_profiles', id), data, { merge: true });
      return profile;
    } catch (e) {
      console.error('Erro ao salvar user_profile no Firestore:', e);
      return mockFirestore.saveUserProfile(profile);
    }
  },

  // Backup and Restore
  exportBackup: async () => {
    if (USE_MOCK) return mockFirestore.exportBackup();
    return mockFirestore.exportBackup();
  },
  importBackup: async (backupJson) => {
    if (USE_MOCK) return mockFirestore.importBackup(backupJson);
    return mockFirestore.importBackup(backupJson);
  },

  // Purchases Module
  getPurchases: async () => {
    if (USE_MOCK) {
      const data = localStorage.getItem('sistema_indicadores_purchases');
      return data ? JSON.parse(data) : [];
    }
    const { getFirestore, collection, getDocs } = await import('firebase/firestore');
    const db = getFirestore(app);
    const snap = await getDocs(collection(db, 'purchases'));
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },
  createPurchase: async (purchaseData) => {
    if (USE_MOCK) {
      const data = localStorage.getItem('sistema_indicadores_purchases');
      const list = data ? JSON.parse(data) : [];
      const newPurchase = { id: 'pur_' + Math.random().toString(36).substr(2, 9), ...purchaseData, createdAt: new Date().toISOString() };
      list.push(newPurchase);
      localStorage.setItem('sistema_indicadores_purchases', JSON.stringify(list));
      return newPurchase;
    }
    const { getFirestore, collection, addDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    const docRef = await addDoc(collection(db, 'purchases'), {
      ...purchaseData,
      createdAt: new Date().toISOString()
    });
    return { id: docRef.id, ...purchaseData };
  },
  updatePurchase: async (id, purchaseData) => {
    if (USE_MOCK) {
      const data = localStorage.getItem('sistema_indicadores_purchases');
      let list = data ? JSON.parse(data) : [];
      list = list.map(item => item.id === id ? { ...item, ...purchaseData, updatedAt: new Date().toISOString() } : item);
      localStorage.setItem('sistema_indicadores_purchases', JSON.stringify(list));
      return { id, ...purchaseData };
    }
    const { getFirestore, doc, updateDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    await updateDoc(doc(db, 'purchases', id), {
      ...purchaseData,
      updatedAt: new Date().toISOString()
    });
    return { id, ...purchaseData };
  },

  // Appointments (NexaCAL) Module
  getAppointments: async () => {
    if (USE_MOCK) {
      const data = localStorage.getItem('sistema_indicadores_appointments');
      return data ? JSON.parse(data) : [];
    }
    const { getFirestore, collection, getDocs } = await import('firebase/firestore');
    const db = getFirestore(app);
    const snap = await getDocs(collection(db, 'appointments'));
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },
  createAppointment: async (appointmentData) => {
    if (USE_MOCK) {
      const data = localStorage.getItem('sistema_indicadores_appointments');
      const list = data ? JSON.parse(data) : [];
      const newApt = { id: 'apt_' + Math.random().toString(36).substr(2, 9), ...appointmentData, createdAt: new Date().toISOString() };
      list.push(newApt);
      localStorage.setItem('sistema_indicadores_appointments', JSON.stringify(list));
      return newApt;
    }
    const { getFirestore, collection, addDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    const docRef = await addDoc(collection(db, 'appointments'), {
      ...appointmentData,
      createdAt: new Date().toISOString()
    });
    return { id: docRef.id, ...appointmentData };
  },
  updateAppointment: async (id, appointmentData) => {
    if (USE_MOCK) {
      const data = localStorage.getItem('sistema_indicadores_appointments');
      let list = data ? JSON.parse(data) : [];
      list = list.map(item => item.id === id ? { ...item, ...appointmentData, updatedAt: new Date().toISOString() } : item);
      localStorage.setItem('sistema_indicadores_appointments', JSON.stringify(list));
      return { id, ...appointmentData };
    }
    const { getFirestore, doc, updateDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    await updateDoc(doc(db, 'appointments', id), {
      ...appointmentData,
      updatedAt: new Date().toISOString()
    });
    return { id, ...appointmentData };
  }
};
