import { app } from './config';
import { USE_MOCK, mockFirestore } from './mockDb';

export const INITIAL_PROCEDURES = [
  {
    id: 'proc-1',
    name: 'AVALIAÇÃO/CONSULTA - POR MÉDICO CIRURGIÃO',
    code: '10101012',
    value: 55.0,
    active: true,
    modules: { assist: false, medical: true, clinical: true, apac: false },
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'proc-2',
    name: 'CONFECÇÃO DE FAV COM PRÓTESE - PTFE',
    code: '04.06.01.002-3',
    value: 891.0,
    active: true,
    modules: { assist: true, medical: true, clinical: true, apac: true },
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'proc-3',
    name: 'CONFECÇÃO DE FAV SIMPLES',
    code: '04.06.01.001-5',
    value: 668.25,
    active: true,
    modules: { assist: true, medical: true, clinical: true, apac: true },
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'proc-4',
    name: 'COORDENAÇÃO DP',
    code: '',
    value: 2800.0,
    active: true,
    modules: { assist: false, medical: true, clinical: false, apac: false },
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'proc-5',
    name: 'COORDENAÇÃO GERAL',
    code: '',
    value: 28000.0,
    active: true,
    modules: { assist: false, medical: true, clinical: false, apac: false },
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'proc-6',
    name: 'DUPLEX SCAN VENOSO OU ARTERIAL – DSV/DAS',
    code: '40901174',
    value: 119.79,
    active: true,
    modules: { assist: true, medical: true, clinical: true, apac: true },
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'proc-7',
    name: 'IMPLANTE DE CATETER DE HEMODIÁLISE - CDL',
    code: '04.06.01.008-2',
    value: 270.0,
    active: true,
    modules: { assist: true, medical: true, clinical: true, apac: true },
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'proc-8',
    name: 'IMPLANTE DE CATETER DE LONGA PERMCATH',
    code: '04.06.01.009-0',
    value: 668.25,
    active: true,
    modules: { assist: true, medical: true, clinical: true, apac: true },
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'proc-9',
    name: 'INTERVENÇÃO DE FAV',
    code: '04.06.01.005-8',
    value: 668.25,
    active: true,
    modules: { assist: true, medical: true, clinical: true, apac: true },
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'proc-10',
    name: 'LIGADURA FAV',
    code: '04.06.01.006-6',
    value: 668.25,
    active: true,
    modules: { assist: true, medical: true, clinical: true, apac: true },
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'proc-11',
    name: 'RETIRADA DE CATETER PERMCATH',
    code: '04.06.01.010-4',
    value: 400.0,
    active: true,
    modules: { assist: true, medical: true, clinical: true, apac: true },
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'proc-12',
    name: 'SUPERFI. BASÍLICA, LUNAR, SAFENA, CEFALICA',
    code: '04.06.01.003-1',
    value: 1217.7,
    active: true,
    modules: { assist: true, medical: true, clinical: true, apac: true },
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'proc-13',
    name: 'FAV SIMPLES COM SUPORTE ANESTESICO',
    code: '04.06.01.001-5-AN',
    value: 750.0,
    active: true,
    modules: { assist: true, medical: true, clinical: true, apac: false },
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'proc-14',
    name: 'FAV BASILICA',
    code: '04.06.01.004-0',
    value: 950.0,
    active: true,
    modules: { assist: true, medical: true, clinical: true, apac: false },
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'proc-15',
    name: 'REVISÃO DE FAV',
    code: '04.06.01.007-4',
    value: 500.0,
    active: true,
    modules: { assist: true, medical: true, clinical: true, apac: false },
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'proc-16',
    name: 'CDL DE URGENCIA',
    code: '04.06.01.008-2-URG',
    value: 350.0,
    active: true,
    modules: { assist: true, medical: true, clinical: true, apac: false },
    createdAt: '2026-01-01T00:00:00.000Z'
  }
];

export const getProcedures = async () => {
  if (USE_MOCK) return mockFirestore.getProcedures();
  try {
    const { getFirestore, collection, getDocs, setDoc, doc } = await import('firebase/firestore');
    const db = getFirestore(app);
    const snap = await getDocs(collection(db, 'clinical_procedures'));
    if (!snap.empty) {
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    }
    // Seed automático inicial se a coleção estiver vazia
    for (const proc of INITIAL_PROCEDURES) {
      await setDoc(doc(db, 'clinical_procedures', proc.id), proc);
    }
    return INITIAL_PROCEDURES;
  } catch (err) {
    console.warn('Erro ao carregar clinical_procedures do Firestore:', err);
    return INITIAL_PROCEDURES;
  }
};

export const saveProcedure = async (procData) => {
  if (USE_MOCK) return mockFirestore.saveProcedure(procData);
  const { getFirestore, collection, addDoc, updateDoc, doc } = await import('firebase/firestore');
  const db = getFirestore(app);

  const cleanData = {
    name: (procData.name || '').trim().toUpperCase(),
    code: (procData.code || '').trim(),
    value: parseFloat(procData.value) || 0,
    active: procData.active !== false,
    modules: {
      assist: !!procData.modules?.assist,
      medical: !!procData.modules?.medical,
      clinical: !!procData.modules?.clinical,
      apac: !!procData.modules?.apac
    },
    updatedAt: new Date().toISOString()
  };

  if (procData.id) {
    const ref = doc(db, 'clinical_procedures', procData.id);
    await updateDoc(ref, cleanData);
    return { id: procData.id, ...cleanData };
  } else {
    cleanData.createdAt = new Date().toISOString();
    const docRef = await addDoc(collection(db, 'clinical_procedures'), cleanData);
    return { id: docRef.id, ...cleanData };
  }
};

export const deleteProcedure = async (id) => {
  if (USE_MOCK) return mockFirestore.deleteProcedure(id);
  const { getFirestore, deleteDoc, doc } = await import('firebase/firestore');
  const db = getFirestore(app);
  return deleteDoc(doc(db, 'clinical_procedures', id));
};
