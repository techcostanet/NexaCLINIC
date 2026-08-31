import { app } from './config';
import { USE_MOCK, mockFirestore } from './mockDb';
import { getUsers } from './authService';

export const FALLBACK_DOCTORS = [
  {
    id: 'doc-lucas-uid',
    name: 'Lucas Mendes',
    crm: '45892/MG',
    specialty: 'Nefrologia',
    email: 'lucas.mendes@nexa.com',
    phone: '(31) 98765-4321',
    contractType: 'PJ',
    pixKey: '45892000182@pix.bcb.gov.br',
    bank: 'Banco do Brasil (001) Ag 1234-5 CC 45892-1',
    active: true
  },
  {
    id: 'doc-mariana-uid',
    name: 'Mariana Ribeiro',
    crm: '51204/MG',
    specialty: 'Nefrologia',
    email: 'mariana.ribeiro@nexa.com',
    phone: '(31) 99123-4567',
    contractType: 'PJ',
    pixKey: 'mariana.med@gmail.com',
    bank: 'Itaú (341) Ag 0891 CC 32104-9',
    active: true
  },
  {
    id: 'doc-roberto-uid',
    name: 'Roberto Carvalho',
    crm: '39812/MG',
    specialty: 'Nefrologia',
    email: 'roberto.carvalho@nexa.com',
    phone: '(31) 98456-7890',
    contractType: 'PJ',
    pixKey: '39812984000192',
    bank: 'Santander (033) Ag 2201 CC 98120-4',
    active: true
  },
  {
    id: 'doc-camila-uid',
    name: 'Camila Albuquerque',
    crm: '48920/MG',
    specialty: 'Nefrologia',
    email: 'camila.albuquerque@nexa.com',
    phone: '(31) 99345-6781',
    contractType: 'CLT',
    pixKey: 'camila.albuquerque@pix.com',
    bank: 'Bradesco (237) Ag 1402 CC 89201-3',
    active: true
  },
  {
    id: 'doc-fernando-uid',
    name: 'Fernando Vasconcelos',
    crm: '55431/MG',
    specialty: 'Nefrologia',
    email: 'fernando.vasconcelos@nexa.com',
    phone: '(31) 98877-6655',
    contractType: 'PJ',
    pixKey: '5543189000109',
    bank: 'Sicoob (756) Ag 4120 CC 55431-0',
    active: true
  },
  {
    id: 'doc-jsoares-uid',
    name: 'Dr. J. Soares',
    crm: '34102/MG',
    specialty: 'Nefrologia',
    email: 'jsoares@nexa.com',
    phone: '(31) 99876-5432',
    contractType: 'PJ',
    pixKey: 'jsoares@pix.bcb.gov.br',
    bank: 'Caixa (104) Ag 0122 CC 34102-8',
    active: true
  }
];

export const getMedicalDoctors = async () => {
  if (USE_MOCK) {
    try {
      const mockList = await mockFirestore.getMedicalDoctors();
      if (mockList && mockList.length > 0) return mockList;
    } catch (e) {
      console.warn('Fallback mock getMedicalDoctors:', e);
    }
    return FALLBACK_DOCTORS;
  }

  const merged = [...FALLBACK_DOCTORS];

  try {
    const { getFirestore, collection, getDocs } = await import('firebase/firestore');
    const db = getFirestore(app);

    // 1. Check dedicated medical_doctors collection
    try {
      const medSnap = await getDocs(collection(db, 'medical_doctors'));
      if (!medSnap.empty) {
        medSnap.docs.forEach(docSnap => {
          const dData = docSnap.data();
          const docId = docSnap.id;
          const exIdx = merged.findIndex(m => m.id === docId || (m.email && dData.email && m.email.toLowerCase() === dData.email.toLowerCase()) || m.name === dData.name);
          const fullDoc = {
            id: docId,
            name: dData.name || 'Médico',
            crm: dData.crm || '',
            specialty: dData.specialty || 'Nefrologia',
            cpf: dData.cpf || '',
            susCard: dData.susCard || '',
            email: dData.email || '',
            phone: dData.phone || dData.mobile || '',
            contractType: dData.contractType || 'PJ',
            pixKey: dData.pixKey || '',
            bank: dData.bank || '',
            active: dData.active !== false
          };

          if (exIdx >= 0) {
            merged[exIdx] = { ...merged[exIdx], ...fullDoc };
          } else {
            merged.push(fullDoc);
          }
        });
      }
    } catch (e) {
      console.warn('Erro ao consultar medical_doctors no Firestore:', e);
    }

    // 2. Check users collection
    try {
      const userList = await getUsers();
      (userList || []).forEach(u => {
        const uId = u.uid || u.id;
        const isDoc = u.role === 'admin' || 
          u.role === 'doctor' ||
          u.role === 'professional' || 
          u.role === 'clinical' || 
          (u.allowedSectors && u.allowedSectors.includes('medica')) ||
          (u.name && (u.name.toLowerCase().includes('dr') || u.name.toLowerCase().includes('médic') || u.name.toLowerCase().includes('nefro')));
        
        if (isDoc) {
          const existingIdx = merged.findIndex(m => m.id === uId || (m.email && u.email && m.email.toLowerCase() === u.email.toLowerCase()) || m.name === u.name);
          const mapped = {
            id: uId,
            name: u.name || 'Médico',
            crm: u.crm || (u.name?.includes('Dr') ? '45892/MG' : ''),
            specialty: u.specialty || 'Nefrologia',
            cpf: u.cpf || '',
            susCard: u.susCard || '',
            email: u.email || '',
            phone: u.phone || '',
            contractType: u.contractType || 'PJ',
            pixKey: u.pixKey || '',
            bank: u.bank || '',
            active: u.status !== 'inactive'
          };

          if (existingIdx >= 0) {
            merged[existingIdx] = {
              ...mapped,
              ...merged[existingIdx],
              // Give precedence to non-empty fields
              crm: merged[existingIdx].crm || mapped.crm,
              specialty: merged[existingIdx].specialty || mapped.specialty,
              cpf: merged[existingIdx].cpf || mapped.cpf,
              susCard: merged[existingIdx].susCard || mapped.susCard,
              phone: merged[existingIdx].phone || mapped.phone,
              email: merged[existingIdx].email || mapped.email,
              pixKey: merged[existingIdx].pixKey || mapped.pixKey,
              bank: merged[existingIdx].bank || mapped.bank
            };
          } else {
            merged.push(mapped);
          }
        }
      });
    } catch (e) {
      console.warn('Erro ao consultar users para médicos:', e);
    }

    return merged.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  } catch (err) {
    console.warn('Fallback getMedicalDoctors:', err);
    return FALLBACK_DOCTORS;
  }
};

export const saveMedicalDoctor = async (doctorId, doctorData) => {
  if (USE_MOCK) {
    return mockFirestore.saveMedicalDoctor ? mockFirestore.saveMedicalDoctor(doctorId, doctorData) : doctorData;
  }
  const { getFirestore, doc, setDoc, updateDoc } = await import('firebase/firestore');
  const db = getFirestore(app);

  const payload = {
    ...doctorData,
    updatedAt: new Date().toISOString()
  };

  // 1. Save to medical_doctors collection
  await setDoc(doc(db, 'medical_doctors', doctorId), payload, { merge: true });

  // 2. Sync to users collection if user exists
  try {
    const userRef = doc(db, 'users', doctorId);
    await updateDoc(userRef, {
      name: doctorData.name || '',
      crm: doctorData.crm || '',
      specialty: doctorData.specialty || 'Nefrologia',
      cpf: doctorData.cpf || '',
      susCard: doctorData.susCard || '',
      phone: doctorData.phone || '',
      email: doctorData.email || '',
      contractType: doctorData.contractType || 'PJ',
      pixKey: doctorData.pixKey || '',
      bank: doctorData.bank || '',
      updatedAt: new Date().toISOString()
    });
  } catch (err) {
    // Non-fatal if user is not in users collection
  }

  return { id: doctorId, ...payload };
};

export const DEFAULT_MEDICAL_SETTINGS = {
  shiftFee: 726.0,
  shiftFees: {
    'Manhã': 726.0,
    'Tarde': 726.0,
    'Noite': 825.0
  },
  consultationFee: 100.0,
  consultationFees: {
    'Ambulatorial': 100.0,
    'Peritonial': 160.0
  },
  procedureFees: {
    'AVALIAÇÃO/CONSULTA - POR MÉDICO CIRURGIÃO': 55.00,
    'CONFECÇÃO DE FAV COM PRÓTESE - PTFE': 891.00,
    'CONFECÇÃO DE FAV SIMPLES': 668.25,
    'COORDENAÇÃO DP': 2800.00,
    'COORDENAÇÃO GERAL': 28000.00,
    'DUPLEX SCAN VENOSO OU ARTERIAL – DSV/DAS': 119.79,
    'IMPLANTE DE CATETER DE HEMODIÁLISE - CDL': 270.00,
    'IMPLANTE DE CATETER DE LONGA PERMCATH': 668.25,
    'INTERVENÇÃO DE FAV': 668.25,
    'LIGADURA FAV': 668.25,
    'RETIRADA DE CATETER PERMCATH': 400.00,
    'SUPERFI. BASÍLICA, LUNAR, SAFENA, CEFALICA': 1217.70
  },
  procedureStatus: {
    'AVALIAÇÃO/CONSULTA - POR MÉDICO CIRURGIÃO': true,
    'CONFECÇÃO DE FAV COM PRÓTESE - PTFE': true,
    'CONFECÇÃO DE FAV SIMPLES': true,
    'COORDENAÇÃO DP': true,
    'COORDENAÇÃO GERAL': true,
    'DUPLEX SCAN VENOSO OU ARTERIAL – DSV/DAS': true,
    'IMPLANTE DE CATETER DE HEMODIÁLISE - CDL': true,
    'IMPLANTE DE CATETER DE LONGA PERMCATH': true,
    'INTERVENÇÃO DE FAV': true,
    'LIGADURA FAV': true,
    'RETIRADA DE CATETER PERMCATH': true,
    'SUPERFI. BASÍLICA, LUNAR, SAFENA, CEFALICA': true
  },
  additionalEmail: '',
  defaultRecipientEmails: ['contato@techcosta.net', 'secretariabetim@dialize.com.br']
};

export const getMedicalSettings = async () => {
  if (USE_MOCK) return DEFAULT_MEDICAL_SETTINGS;
  try {
    const { getFirestore, doc, getDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    const snap = await getDoc(doc(db, 'settings', 'medical'));
    if (snap.exists()) {
      const data = snap.data();
      return {
        ...DEFAULT_MEDICAL_SETTINGS,
        ...data,
        shiftFees: { ...DEFAULT_MEDICAL_SETTINGS.shiftFees, ...(data.shiftFees || {}) },
        consultationFees: { ...DEFAULT_MEDICAL_SETTINGS.consultationFees, ...(data.consultationFees || {}) },
        procedureFees: { ...DEFAULT_MEDICAL_SETTINGS.procedureFees, ...(data.procedureFees || {}) },
        procedureStatus: { ...DEFAULT_MEDICAL_SETTINGS.procedureStatus, ...(data.procedureStatus || {}) }
      };
    }
    return DEFAULT_MEDICAL_SETTINGS;
  } catch (err) {
    console.warn('Erro ao carregar medical settings do Firestore:', err);
    return DEFAULT_MEDICAL_SETTINGS;
  }
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

export const requestMedicalSwap = createMedicalSwap;

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
