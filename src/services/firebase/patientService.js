import { app } from './config';
import { USE_MOCK, mockFirestore } from './mockDb';

export const getPatients = async () => {
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
  };

export const createPatient = async (patientData) => {
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
  };

export const updatePatient = async (id, patientData) => {
    if (USE_MOCK) {
      return mockFirestore.updatePatient(id, patientData);
    }
    const { getFirestore, doc, updateDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    return updateDoc(doc(db, 'patients', id), {
      ...patientData,
      updatedAt: new Date().toISOString()
    });
  };

export const deletePatient = async (id) => {
    if (USE_MOCK) {
      return mockFirestore.deletePatient(id);
    }
    const { getFirestore, doc, deleteDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    return deleteDoc(doc(db, 'patients', id));
  };

export const getPrescriptions = async () => {
    if (USE_MOCK) return mockFirestore.getPrescriptions();
    const { getFirestore, collection, getDocs } = await import('firebase/firestore');
    const db = getFirestore(app);
    const snap = await getDocs(collection(db, 'prescriptions'));
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  };

export const savePrescription = async (prescData) => {
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
  };

export const getSessionsLogs = async () => {
    if (USE_MOCK) return mockFirestore.getSessionsLogs();
    const { getFirestore, collection, getDocs } = await import('firebase/firestore');
    const db = getFirestore(app);
    const snap = await getDocs(collection(db, 'sessions_logs'));
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  };

export const saveSessionLog = async (logData) => {
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
  };

export const getClinicalNotes = async () => {
    if (USE_MOCK) return mockFirestore.getClinicalNotes();
    const { getFirestore, collection, getDocs } = await import('firebase/firestore');
    const db = getFirestore(app);
    const snap = await getDocs(collection(db, 'clinical_notes'));
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  };

export const createClinicalNote = async (noteData) => {
    if (USE_MOCK) return mockFirestore.createClinicalNote(noteData);
    const { getFirestore, collection, addDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    const docRef = await addDoc(collection(db, 'clinical_notes'), {
      ...noteData,
      date: new Date().toISOString().substring(0, 10)
    });
    return { id: docRef.id, ...noteData, date: new Date().toISOString().substring(0, 10) };
  };

export const deleteClinicalNote = async (id) => {
    if (USE_MOCK) return mockFirestore.deleteClinicalNote(id);
    const { getFirestore, doc, deleteDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    return deleteDoc(doc(db, 'clinical_notes', id));
  };

export const getCheckins = async () => {
    if (USE_MOCK) {
      return mockFirestore.getCheckins();
    }
    const { getFirestore, collection, getDocs } = await import('firebase/firestore');
    const db = getFirestore(app);
    const snap = await getDocs(collection(db, 'checkins'));
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  };

export const saveCheckin = async (checkinData) => {
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
  };

export const deleteCheckin = async (id) => {
    if (USE_MOCK) {
      return mockFirestore.deleteCheckin(id);
    }
    const { getFirestore, doc, deleteDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    return deleteDoc(doc(db, 'checkins', id));
  };

