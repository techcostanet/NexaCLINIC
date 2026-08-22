import { app } from './config';
import { USE_MOCK, mockFirestore } from './mockDb';
import { getUsers } from './authService';

export const getMedicalDoctors = async () => {
  const fallbackDocs = [
    {
      id: 'doc-lucas-uid',
      name: 'Dr. Lucas Mendes',
      crm: '45892/MG',
      specialty: 'Nefrologia',
      email: 'lucas.mendes@nexaclinic.med.br',
      phone: '(31) 98765-4321',
      contractType: 'PJ',
      pixKey: '45892000182@pix.bcb.gov.br',
      bank: 'Banco do Brasil (001) Ag 1234-5 CC 45892-1',
      active: true
    },
    {
      id: 'doc-mariana-uid',
      name: 'Dra. Mariana Ribeiro',
      crm: '51204/MG',
      specialty: 'Nefrologia',
      email: 'mariana.ribeiro@nexaclinic.med.br',
      phone: '(31) 99123-4567',
      contractType: 'PJ',
      pixKey: 'mariana.med@gmail.com',
      bank: 'Itaú (341) Ag 0891 CC 32104-9',
      active: true
    },
    {
      id: 'doc-roberto-uid',
      name: 'Dr. Roberto Carvalho',
      crm: '39812/MG',
      specialty: 'Nefrologia',
      email: 'roberto.carvalho@nexaclinic.med.br',
      phone: '(31) 98456-7890',
      contractType: 'PJ',
      pixKey: '39812984000192',
      bank: 'Santander (033) Ag 2201 CC 98120-4',
      active: true
    },
    {
      id: 'doc-camila-uid',
      name: 'Dra. Camila Albuquerque',
      crm: '48920/MG',
      specialty: 'Nefrologia',
      email: 'camila.albuquerque@nexaclinic.med.br',
      phone: '(31) 99345-6781',
      contractType: 'CLT',
      pixKey: 'camila.albuquerque@pix.com',
      bank: 'Bradesco (237) Ag 1402 CC 89201-3',
      active: true
    },
    {
      id: 'doc-fernando-uid',
      name: 'Dr. Fernando Vasconcelos',
      crm: '55431/MG',
      specialty: 'Nefrologia',
      email: 'fernando.vasconcelos@nexaclinic.med.br',
      phone: '(31) 98877-6655',
      contractType: 'PJ',
      pixKey: '5543189000109',
      bank: 'Sicoob (756) Ag 4120 CC 55431-0',
      active: true
    }
  ];

  try {
    const userList = await getUsers();
    const docUsers = (userList || []).filter(u => 
      u.role === 'admin' || 
      u.role === 'professional' || 
      u.role === 'clinical' || 
      (u.allowedSectors && u.allowedSectors.includes('medica')) ||
      (u.name && (u.name.toLowerCase().includes('dr') || u.name.toLowerCase().includes('médic') || u.name.toLowerCase().includes('nefro')))
    );

    const merged = [...fallbackDocs];

    (docUsers.length > 0 ? docUsers : userList || []).forEach(u => {
      const uId = u.uid || u.id;
      const existingIdx = merged.findIndex(m => m.id === uId || (m.email && u.email && m.email.toLowerCase() === u.email.toLowerCase()) || m.name === u.name);
      const mapped = {
        id: uId,
        name: u.name || 'Médico',
        crm: u.crm || (u.name?.includes('Dr') ? '45892/MG' : 'CRM Ativo'),
        specialty: u.specialty || 'Nefrologia',
        email: u.email || '',
        phone: u.phone || '',
        contractType: u.contractType || 'PJ',
        pixKey: u.pixKey || u.email || '',
        bank: u.bank || 'Banco Principal',
        active: u.status !== 'inactive'
      };

      if (existingIdx >= 0) {
        merged[existingIdx] = { ...merged[existingIdx], ...mapped };
      } else {
        merged.push(mapped);
      }
    });

    return merged;
  } catch (err) {
    console.warn('Fallback getMedicalDoctors:', err);
    return fallbackDocs;
  }
};

export const getMedicalSettings = async () => {
  if (USE_MOCK) return mockFirestore.getMedicalSettings();
  const { getFirestore, doc, getDoc } = await import('firebase/firestore');
  const db = getFirestore(app);
  const snap = await getDoc(doc(db, 'settings', 'medical'));
  return snap.exists() ? snap.data() : {};
};

export const saveMedicalSettings = async (settingsData) => {
  if (USE_MOCK) return mockFirestore.saveMedicalSettings(settingsData);
  const { getFirestore, doc, setDoc } = await import('firebase/firestore');
  const db = getFirestore(app);
  await setDoc(doc(db, 'settings', 'medical'), settingsData, { merge: true });
  return settingsData;
};

export const getMedicalSchedules = async (month) => {
  if (USE_MOCK) return mockFirestore.getMedicalSchedules(month);
  const { getFirestore, collection, getDocs } = await import('firebase/firestore');
  const db = getFirestore(app);
  const snap = await getDocs(collection(db, 'medical_schedules'));
  const all = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  return all.filter(s => !month || s.month === month);
};

export const saveMedicalSchedule = async (shiftData) => {
  if (USE_MOCK) return mockFirestore.saveMedicalSchedule(shiftData);
  const { getFirestore, collection, addDoc, doc, updateDoc } = await import('firebase/firestore');
  const db = getFirestore(app);
  if (shiftData.id) {
    await updateDoc(doc(db, 'medical_schedules', shiftData.id), { ...shiftData, updatedAt: new Date().toISOString() });
    return shiftData;
  } else {
    const docRef = await addDoc(collection(db, 'medical_schedules'), { ...shiftData, createdAt: new Date().toISOString() });
    return { id: docRef.id, ...shiftData };
  }
};

export const deleteMedicalSchedule = async (id) => {
  if (USE_MOCK) return mockFirestore.deleteMedicalSchedule(id);
  const { getFirestore, doc, deleteDoc } = await import('firebase/firestore');
  const db = getFirestore(app);
  return deleteDoc(doc(db, 'medical_schedules', id));
};

export const recordMedicalCheckin = async (scheduleId, checkinStatus, checkedBy, notes = '') => {
  if (USE_MOCK) return mockFirestore.recordMedicalCheckin(scheduleId, checkinStatus, checkedBy, notes);
  const { getFirestore, doc, updateDoc } = await import('firebase/firestore');
  const db = getFirestore(app);
  const now = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const updateData = {
    checkinStatus,
    checkinTime: checkinStatus === 'Presente' || checkinStatus === 'Atraso' ? now : null,
    checkedBy: checkedBy || 'Recepção Central',
    notes,
    updatedAt: new Date().toISOString()
  };
  await updateDoc(doc(db, 'medical_schedules', scheduleId), updateData);
  return { id: scheduleId, ...updateData };
};

export const getMedicalSwaps = async () => {
  if (USE_MOCK) return mockFirestore.getMedicalSwaps();
  const { getFirestore, collection, getDocs } = await import('firebase/firestore');
  const db = getFirestore(app);
  const snap = await getDocs(collection(db, 'medical_swaps'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const createMedicalSwap = async (swapData) => {
  if (USE_MOCK) return mockFirestore.createMedicalSwap(swapData);
  const { getFirestore, collection, addDoc } = await import('firebase/firestore');
  const db = getFirestore(app);
  const docRef = await addDoc(collection(db, 'medical_swaps'), {
    ...swapData,
    status: 'Pendente',
    requestedAt: new Date().toISOString()
  });
  return { id: docRef.id, ...swapData, status: 'Pendente' };
};

export const respondMedicalSwap = async (swapId, accepted) => {
  if (USE_MOCK) return mockFirestore.respondMedicalSwap(swapId, accepted);
  const { getFirestore, doc, updateDoc } = await import('firebase/firestore');
  const db = getFirestore(app);
  const newStatus = accepted ? 'Aceito' : 'Recusado';
  await updateDoc(doc(db, 'medical_swaps', swapId), {
    status: newStatus,
    respondedAt: new Date().toISOString()
  });
  return { id: swapId, status: newStatus };
};

export const homologateMedicalSwap = async (swapId, approved, homologatedBy) => {
  if (USE_MOCK) return mockFirestore.homologateMedicalSwap(swapId, approved, homologatedBy);
  const { getFirestore, doc, updateDoc } = await import('firebase/firestore');
  const db = getFirestore(app);
  const newStatus = approved ? 'Homologado' : 'Cancelado';
  await updateDoc(doc(db, 'medical_swaps', swapId), {
    status: newStatus,
    homologatedAt: new Date().toISOString(),
    homologatedBy: homologatedBy || 'Coordenação Médica'
  });
  return { id: swapId, status: newStatus };
};

export const getMedicalProcedures = async (doctorId) => {
  if (USE_MOCK) return mockFirestore.getMedicalProcedures(doctorId);
  const { getFirestore, collection, getDocs } = await import('firebase/firestore');
  const db = getFirestore(app);
  const snap = await getDocs(collection(db, 'medical_procedures'));
  const all = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  return all.filter(p => !doctorId || p.doctorId === doctorId);
};

export const saveMedicalProcedure = async (procData) => {
  if (USE_MOCK) return mockFirestore.saveMedicalProcedure(procData);
  const { getFirestore, collection, addDoc, doc, updateDoc } = await import('firebase/firestore');
  const db = getFirestore(app);
  if (procData.id) {
    await updateDoc(doc(db, 'medical_procedures', procData.id), { ...procData, updatedAt: new Date().toISOString() });
    return procData;
  } else {
    const docRef = await addDoc(collection(db, 'medical_procedures'), { ...procData, createdAt: new Date().toISOString() });
    return { id: docRef.id, ...procData };
  }
};

export const deleteMedicalProcedure = async (id) => {
  if (USE_MOCK) return mockFirestore.deleteMedicalProcedure(id);
  const { getFirestore, doc, deleteDoc } = await import('firebase/firestore');
  const db = getFirestore(app);
  return deleteDoc(doc(db, 'medical_procedures', id));
};

export const getMedicalProductions = async (month) => {
  if (USE_MOCK) return mockFirestore.getMedicalProductions(month);
  const { getFirestore, collection, getDocs } = await import('firebase/firestore');
  const db = getFirestore(app);
  const snap = await getDocs(collection(db, 'medical_productions'));
  const all = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  return all.filter(p => !month || p.month === month);
};

export const homologateMedicalProduction = async (productionData) => {
  if (USE_MOCK) return mockFirestore.homologateMedicalProduction(productionData);
  const { getFirestore, collection, addDoc } = await import('firebase/firestore');
  const db = getFirestore(app);
  const docRef = await addDoc(collection(db, 'medical_productions'), {
    ...productionData,
    status: 'Homologado',
    homologatedAt: new Date().toISOString()
  });
  return { id: docRef.id, ...productionData, status: 'Homologado' };
};
