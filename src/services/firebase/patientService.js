import { app } from './config';
import { USE_MOCK, mockFirestore } from './mockDb';

export const getPatients = async (unitId = null) => {
    if (USE_MOCK) {
      return mockFirestore.getPatients(unitId);
    }
    try {
      const { getFirestore, collection, getDocs, query, where, writeBatch, doc } = await import('firebase/firestore');
      const db = getFirestore(app);
      
      let snap;
      if (unitId && unitId !== 'all') {
        const q = query(collection(db, 'patients'), where('unitId', '==', unitId));
        snap = await getDocs(q);
      } else {
        snap = await getDocs(collection(db, 'patients'));
      }
      
      // Seed default patients if Firestore is empty
      if (snap.empty && (!unitId || unitId === 'all')) {
        const patientsList = await mockFirestore.getPatients();
        const chunkSize = 400;
        for (let i = 0; i < patientsList.length; i += chunkSize) {
          const chunk = patientsList.slice(i, i + chunkSize);
          const batch = writeBatch(db);
          chunk.forEach(pat => {
            batch.set(doc(db, 'patients', pat.id), pat);
          });
          await batch.commit();
        }
        return patientsList;
      }

      const rawList = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      if (rawList.length === 0) {
        return mockFirestore.getPatients(unitId);
      }

      // Deduplicate by clean CPF (if valid 11 digits) or by id/normalized name
      const seen = new Set();
      const deduplicated = [];
      for (const pat of rawList) {
        if (!pat || !pat.name) continue;
        pat.name = pat.name.trim().toUpperCase();
        const cleanCpf = pat.cpf ? String(pat.cpf).replace(/\D/g, '') : '';
        const normName = pat.name.toLowerCase();
        const key = cleanCpf && cleanCpf.length === 11 ? `cpf_${cleanCpf}` : `id_${pat.id || normName}`;
        if (!seen.has(key)) {
          seen.add(key);
          deduplicated.push(pat);
        }
      }

      // Sort alphabetically by patient name (ignoring accents and case)
      deduplicated.sort((a, b) => {
        const nameA = (a.name || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const nameB = (b.name || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        return nameA.localeCompare(nameB, 'pt-BR', { sensitivity: 'base' });
      });

      return deduplicated;
    } catch (err) {
      console.warn('Erro ao consultar Firestore patients, utilizando base mestre local:', err);
      const fallbackList = await mockFirestore.getPatients(unitId);
      return fallbackList.map(p => ({ ...p, name: (p.name || '').trim().toUpperCase() }));
    }
  };

export const getPatientById = async (id) => {
    if (!id) return null;
    if (USE_MOCK) {
      return mockFirestore.getPatientById(id);
    }
    const { getFirestore, doc, getDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    const snap = await getDoc(doc(db, 'patients', id));
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() };
    }
    return null;
  };

export const searchPatients = async (term = '', unitId = null) => {
    if (USE_MOCK) {
      return mockFirestore.searchPatients(term, unitId);
    }
    const all = await getPatients(unitId);
    if (!term || !term.trim()) return all;
    const clean = term.toLowerCase().trim();
    return all.filter(p => 
      (p.name && p.name.toLowerCase().includes(clean)) ||
      (p.cpf && p.cpf.replace(/\D/g, '').includes(clean.replace(/\D/g, ''))) ||
      (p.chartNumber && p.chartNumber.toLowerCase().includes(clean)) ||
      (p.cns && p.cns.includes(clean))
    );
  };

export const createPatient = async (patientData) => {
    if (USE_MOCK) {
      return mockFirestore.createPatient(patientData);
    }
    const { getFirestore, collection, addDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    const docRef = await addDoc(collection(db, 'patients'), {
      ...patientData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
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

export const bulkSyncPatients = async (patientsList) => {
    if (USE_MOCK) {
      return mockFirestore.bulkSyncPatients(patientsList);
    }
    try {
      const { getFirestore, writeBatch, doc } = await import('firebase/firestore');
      const db = getFirestore(app);
      const chunkSize = 400;
      for (let i = 0; i < patientsList.length; i += chunkSize) {
        const chunk = patientsList.slice(i, i + chunkSize);
        const batch = writeBatch(db);
        chunk.forEach(pat => {
          batch.set(doc(db, 'patients', pat.id), { ...pat, updatedAt: new Date().toISOString() }, { merge: true });
        });
        await batch.commit();
      }
      return { count: patientsList.length };
    } catch (err) {
      console.warn('Erro no bulkSync Firestore, utilizando mock:', err);
      return mockFirestore.bulkSyncPatients(patientsList);
    }
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

// Patient Medications (Intradialytic & Continuous)
export const getPatientMedications = async (patientId) => {
  if (USE_MOCK) return mockFirestore.getPatientMedications(patientId);
  const { getFirestore, collection, getDocs } = await import('firebase/firestore');
  const db = getFirestore(app);
  const snap = await getDocs(collection(db, 'patient_medications'));
  const all = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  return all.filter(m => !patientId || m.patientId === patientId);
};

export const savePatientMedication = async (medData) => {
  if (USE_MOCK) return mockFirestore.savePatientMedication(medData);
  const { getFirestore, collection, addDoc, doc, updateDoc } = await import('firebase/firestore');
  const db = getFirestore(app);
  if (medData.id) {
    const docRef = doc(db, 'patient_medications', medData.id);
    await updateDoc(docRef, { ...medData, updatedAt: new Date().toISOString() });
    return medData;
  } else {
    const docRef = await addDoc(collection(db, 'patient_medications'), { ...medData, createdAt: new Date().toISOString() });
    return { id: docRef.id, ...medData };
  }
};

export const deletePatientMedication = async (id) => {
  if (USE_MOCK) return mockFirestore.deletePatientMedication(id);
  const { getFirestore, doc, deleteDoc } = await import('firebase/firestore');
  const db = getFirestore(app);
  return deleteDoc(doc(db, 'patient_medications', id));
};

// Patient Lab Exams
export const getPatientLabExams = async (patientId) => {
  if (USE_MOCK) return mockFirestore.getPatientLabExams(patientId);
  const { getFirestore, collection, getDocs } = await import('firebase/firestore');
  const db = getFirestore(app);
  const snap = await getDocs(collection(db, 'patient_lab_exams'));
  const all = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  return all.filter(e => !patientId || e.patientId === patientId).sort((a, b) => b.date.localeCompare(a.date));
};

export const savePatientLabExam = async (examData) => {
  if (USE_MOCK) return mockFirestore.savePatientLabExam(examData);
  const { getFirestore, collection, addDoc, doc, updateDoc } = await import('firebase/firestore');
  const db = getFirestore(app);
  if (examData.id) {
    const docRef = doc(db, 'patient_lab_exams', examData.id);
    await updateDoc(docRef, { ...examData, updatedAt: new Date().toISOString() });
    return examData;
  } else {
    const docRef = await addDoc(collection(db, 'patient_lab_exams'), { ...examData, createdAt: new Date().toISOString() });
    return { id: docRef.id, ...examData };
  }
};

export const deletePatientLabExam = async (id) => {
  if (USE_MOCK) return mockFirestore.deletePatientLabExam(id);
  const { getFirestore, doc, deleteDoc } = await import('firebase/firestore');
  const db = getFirestore(app);
  return deleteDoc(doc(db, 'patient_lab_exams', id));
};

// Patient APAC Records
export const getPatientApacRecords = async (patientId) => {
  if (USE_MOCK) return mockFirestore.getPatientApacRecords(patientId);
  const { getFirestore, collection, getDocs } = await import('firebase/firestore');
  const db = getFirestore(app);
  const snap = await getDocs(collection(db, 'patient_apac_records'));
  const all = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  return all.filter(a => !patientId || a.patientId === patientId);
};

export const savePatientApacRecord = async (apacData) => {
  if (USE_MOCK) return mockFirestore.savePatientApacRecord(apacData);
  const { getFirestore, collection, addDoc, doc, updateDoc } = await import('firebase/firestore');
  const db = getFirestore(app);
  if (apacData.id) {
    const docRef = doc(db, 'patient_apac_records', apacData.id);
    await updateDoc(docRef, { ...apacData, updatedAt: new Date().toISOString() });
    return apacData;
  } else {
    const docRef = await addDoc(collection(db, 'patient_apac_records'), { ...apacData, createdAt: new Date().toISOString() });
    return { id: docRef.id, ...apacData };
  }
};


