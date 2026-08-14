import { app } from './config';
import { USE_MOCK, mockFirestore } from './mockDb';

export const getEpiInspections = async () => {
    if (USE_MOCK && mockFirestore.getEpiInspections) return mockFirestore.getEpiInspections();
    try {
      const { getFirestore, collection, getDocs, orderBy, query } = await import('firebase/firestore');
      const db = getFirestore(app);
      const q = query(collection(db, 'sesmt_epi_inspections'), orderBy('date', 'desc'));
      const snap = await getDocs(q);
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (e) {
      console.error('Erro Firestore getEpiInspections =', e);
      return [];
    }
};

export const saveEpiInspection = async (item) => {
    if (USE_MOCK && mockFirestore.saveEpiInspection) return mockFirestore.saveEpiInspection(item);
    try {
        const { getFirestore, collection, addDoc, doc, updateDoc } = await import('firebase/firestore');
        const db = getFirestore(app);
        if (item.id) {
            const docRef = doc(db, 'sesmt_epi_inspections', item.id);
            await updateDoc(docRef, item);
            return item;
        } else {
            const docRef = await addDoc(collection(db, 'sesmt_epi_inspections'), item);
            return { id: docRef.id, ...item };
        }
    } catch (e) {
        console.error('Erro Firestore saveEpiInspection =', e);
        throw e;
    }
};

export const getFireExtinguisherInspections = async () => {
    if (USE_MOCK && mockFirestore.getFireExtinguisherInspections) return mockFirestore.getFireExtinguisherInspections();
    try {
      const { getFirestore, collection, getDocs, orderBy, query } = await import('firebase/firestore');
      const db = getFirestore(app);
      const q = query(collection(db, 'sesmt_extinguisher_inspections'), orderBy('date', 'desc'));
      const snap = await getDocs(q);
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (e) {
      console.error('Erro Firestore getFireExtinguisherInspections =', e);
      return [];
    }
};

export const saveFireExtinguisherInspection = async (item) => {
    if (USE_MOCK && mockFirestore.saveFireExtinguisherInspection) return mockFirestore.saveFireExtinguisherInspection(item);
    try {
        const { getFirestore, collection, addDoc, doc, updateDoc } = await import('firebase/firestore');
        const db = getFirestore(app);
        if (item.id) {
            const docRef = doc(db, 'sesmt_extinguisher_inspections', item.id);
            await updateDoc(docRef, item);
            return item;
        } else {
            const docRef = await addDoc(collection(db, 'sesmt_extinguisher_inspections'), item);
            return { id: docRef.id, ...item };
        }
    } catch (e) {
        console.error('Erro Firestore saveFireExtinguisherInspection =', e);
        throw e;
    }
};

export const getFireHydrantInspections = async () => {
    if (USE_MOCK && mockFirestore.getFireHydrantInspections) return mockFirestore.getFireHydrantInspections();
    try {
      const { getFirestore, collection, getDocs, orderBy, query } = await import('firebase/firestore');
      const db = getFirestore(app);
      const q = query(collection(db, 'sesmt_hydrant_inspections'), orderBy('date', 'desc'));
      const snap = await getDocs(q);
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (e) {
      console.error('Erro Firestore getFireHydrantInspections =', e);
      return [];
    }
};

export const saveFireHydrantInspection = async (item) => {
    if (USE_MOCK && mockFirestore.saveFireHydrantInspection) return mockFirestore.saveFireHydrantInspection(item);
    try {
        const { getFirestore, collection, addDoc, doc, updateDoc } = await import('firebase/firestore');
        const db = getFirestore(app);
        if (item.id) {
            const docRef = doc(db, 'sesmt_hydrant_inspections', item.id);
            await updateDoc(docRef, item);
            return item;
        } else {
            const docRef = await addDoc(collection(db, 'sesmt_hydrant_inspections'), item);
            return { id: docRef.id, ...item };
        }
    } catch (e) {
        console.error('Erro Firestore saveFireHydrantInspection =', e);
        throw e;
    }
};

export const deleteEpiInspection = async (id) => {
    if (USE_MOCK && mockFirestore.deleteEpiInspection) return mockFirestore.deleteEpiInspection(id);
    try {
        const { getFirestore, doc, deleteDoc } = await import('firebase/firestore');
        const db = getFirestore(app);
        await deleteDoc(doc(db, 'sesmt_epi_inspections', id));
        return true;
    } catch (e) {
        console.error('Erro Firestore deleteEpiInspection =', e);
        throw e;
    }
};

export const deleteFireExtinguisherInspection = async (id) => {
    if (USE_MOCK && mockFirestore.deleteFireExtinguisherInspection) return mockFirestore.deleteFireExtinguisherInspection(id);
    try {
        const { getFirestore, doc, deleteDoc } = await import('firebase/firestore');
        const db = getFirestore(app);
        await deleteDoc(doc(db, 'sesmt_extinguisher_inspections', id));
        return true;
    } catch (e) {
        console.error('Erro Firestore deleteFireExtinguisherInspection =', e);
        throw e;
    }
};

export const deleteFireHydrantInspection = async (id) => {
    if (USE_MOCK && mockFirestore.deleteFireHydrantInspection) return mockFirestore.deleteFireHydrantInspection(id);
    try {
        const { getFirestore, doc, deleteDoc } = await import('firebase/firestore');
        const db = getFirestore(app);
        await deleteDoc(doc(db, 'sesmt_hydrant_inspections', id));
        return true;
    } catch (e) {
        console.error('Erro Firestore deleteFireHydrantInspection =', e);
        throw e;
    }
};
