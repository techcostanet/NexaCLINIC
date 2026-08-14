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

// ==========================================
// CADASTRO DE EQUIPAMENTOS (Extintores / Hidrantes)
// ==========================================

export const getEquipment = async (category = null) => {
    if (USE_MOCK && mockFirestore.getEquipment) return mockFirestore.getEquipment(category);
    try {
        const { getFirestore, collection, getDocs, orderBy, query, where } = await import('firebase/firestore');
        const db = getFirestore(app);
        
        let q;
        if (category) {
            q = query(collection(db, 'sesmt_equipment'), where('category', '==', category));
        } else {
            q = query(collection(db, 'sesmt_equipment'), orderBy('code', 'asc'));
        }
        
        const snap = await getDocs(q);
        const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Se a lista estiver vazia, faz o seed automático e busca novamente
        if (list.length === 0) {
            await seedDefaultEquipmentIfEmpty();
            const snap2 = await getDocs(q);
            return snap2.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        }

        // Ordenar por número/código
        return list.sort((a, b) => {
            const numA = parseInt(a.code?.replace(/\D/g, '') || '0', 10);
            const numB = parseInt(b.code?.replace(/\D/g, '') || '0', 10);
            return numA - numB;
        });
    } catch (e) {
        console.error('Erro Firestore getEquipment =', e);
        return [];
    }
};

export const saveEquipment = async (item) => {
    if (USE_MOCK && mockFirestore.saveEquipment) return mockFirestore.saveEquipment(item);
    try {
        const { getFirestore, collection, addDoc, doc, updateDoc } = await import('firebase/firestore');
        const db = getFirestore(app);
        
        const dataToSave = {
            ...item,
            updatedAt: new Date().toISOString()
        };

        if (item.id) {
            const docRef = doc(db, 'sesmt_equipment', item.id);
            await updateDoc(docRef, dataToSave);
            return { ...dataToSave };
        } else {
            dataToSave.createdAt = new Date().toISOString();
            dataToSave.status = dataToSave.status || 'ATIVO';
            const docRef = await addDoc(collection(db, 'sesmt_equipment'), dataToSave);
            return { id: docRef.id, ...dataToSave };
        }
    } catch (e) {
        console.error('Erro Firestore saveEquipment =', e);
        throw e;
    }
};

export const deleteEquipment = async (id) => {
    if (USE_MOCK && mockFirestore.deleteEquipment) return mockFirestore.deleteEquipment(id);
    try {
        const { getFirestore, doc, deleteDoc } = await import('firebase/firestore');
        const db = getFirestore(app);
        await deleteDoc(doc(db, 'sesmt_equipment', id));
        return true;
    } catch (e) {
        console.error('Erro Firestore deleteEquipment =', e);
        throw e;
    }
};

export const seedDefaultEquipmentIfEmpty = async () => {
    try {
        const { getFirestore, collection, getDocs, addDoc } = await import('firebase/firestore');
        const db = getFirestore(app);
        const snap = await getDocs(collection(db, 'sesmt_equipment'));
        if (!snap.empty) return; // Já existem equipamentos cadastrados

        const nextYear = new Date();
        nextYear.setFullYear(nextYear.getFullYear() + 1);
        const defaultValidity = nextYear.toISOString().split('T')[0];

        const hydroDate = new Date();
        hydroDate.setFullYear(hydroDate.getFullYear() + 5);
        const defaultHydro = hydroDate.toISOString().split('T')[0];

        const defaultExtinguishers = [
            { code: 'EXT-01', type: 'CO2', sector: 'Bloco Cirúrgico', capacity: '6 kg' },
            { code: 'EXT-02', type: 'AP (Água Pressurizada)', sector: 'Bloco Cirúrgico', capacity: '10 L' },
            { code: 'EXT-03', type: 'PQS (Pó Químico Seco)', sector: 'Salão-1', capacity: '4 kg' },
            { code: 'EXT-04', type: 'AP (Água Pressurizada)', sector: 'Salão-1', capacity: '10 L' },
            { code: 'EXT-05', type: 'PQS (Pó Químico Seco)', sector: 'Salão-2', capacity: '4 kg' },
            { code: 'EXT-06', type: 'AP (Água Pressurizada)', sector: 'Salão-2', capacity: '10 L' },
            { code: 'EXT-07', type: 'PQS (Pó Químico Seco)', sector: 'Salão-3', capacity: '4 kg' },
            { code: 'EXT-08', type: 'AP (Água Pressurizada)', sector: 'Salão-3', capacity: '10 L' },
            { code: 'EXT-09', type: 'PQS (Pó Químico Seco)', sector: 'Diálise Peritoneal', capacity: '4 kg' },
            { code: 'EXT-10', type: 'PQS (Pó Químico Seco)', sector: 'Hemodiálise Externa', capacity: '4 kg' },
            { code: 'EXT-11', type: 'AP (Água Pressurizada)', sector: 'Reuso', capacity: '10 L' },
            { code: 'EXT-12', type: 'PQS (Pó Químico Seco)', sector: 'Reuso', capacity: '4 kg' },
            { code: 'EXT-13', type: 'PQS (Pó Químico Seco)', sector: 'Sala Amarela', capacity: '4 kg' },
            { code: 'EXT-14', type: 'AP (Água Pressurizada)', sector: 'Recepção Principal', capacity: '10 L' },
            { code: 'EXT-15', type: 'PQS (Pó Químico Seco)', sector: 'Recepção Principal', capacity: '4 kg' },
            { code: 'EXT-16', type: 'AP (Água Pressurizada)', sector: 'Corredor Central', capacity: '10 L' },
            { code: 'EXT-17', type: 'PQS (Pó Químico Seco)', sector: 'Farmácia / Almoxarifado', capacity: '4 kg' },
            { code: 'EXT-18', type: 'CO2', sector: 'CPD / Servidores', capacity: '6 kg' },
            { code: 'EXT-19', type: 'CO2', sector: 'Sala de Máquinas', capacity: '6 kg' },
            { code: 'EXT-20', type: 'AP (Água Pressurizada)', sector: 'DML / Limpeza', capacity: '10 L' },
            { code: 'EXT-21', type: 'PQS (Pó Químico Seco)', sector: 'Copa / Refeitório', capacity: '4 kg' }
        ];

        const defaultHydrants = [
            { code: 'HID-01', type: 'Hidrante de Parede', sector: 'Corredor Salão 1', capacity: 'Mangueira 30m' },
            { code: 'HID-02', type: 'Hidrante de Parede', sector: 'Corredor Bloco Cirúrgico', capacity: 'Mangueira 30m' },
            { code: 'HID-03', type: 'Hidrante de Parede', sector: 'Hall da Recepção', capacity: 'Mangueira 30m' },
            { code: 'HID-04', type: 'Hidrante de Parede', sector: 'Corredor Reuso', capacity: 'Mangueira 30m' },
            { code: 'HID-05', type: 'Hidrante Externo', sector: 'Acesso Externo / Estacionamento', capacity: 'Mangueira 30m' },
            { code: 'HID-06', type: 'Hidrante de Parede', sector: 'Sala de Máquinas', capacity: 'Mangueira 30m' }
        ];

        const colRef = collection(db, 'sesmt_equipment');

        for (const ext of defaultExtinguishers) {
            await addDoc(colRef, {
                category: 'EXTINGUISHER',
                code: ext.code,
                type: ext.type,
                sector: ext.sector,
                capacity: ext.capacity,
                rechargeDate: new Date().toISOString().split('T')[0],
                validityDate: defaultValidity,
                hydrostaticTestDate: defaultHydro,
                status: 'ATIVO',
                createdAt: new Date().toISOString()
            });
        }

        for (const hyd of defaultHydrants) {
            await addDoc(colRef, {
                category: 'HYDRANT',
                code: hyd.code,
                type: hyd.type,
                sector: hyd.sector,
                capacity: hyd.capacity,
                rechargeDate: new Date().toISOString().split('T')[0],
                validityDate: defaultValidity,
                hydrostaticTestDate: defaultHydro,
                status: 'ATIVO',
                createdAt: new Date().toISOString()
            });
        }
    } catch (e) {
        console.error('Erro ao popular equipamentos padrão =', e);
    }
};

