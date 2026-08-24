import { app } from './config';
import { USE_MOCK } from './mockDb';
import initialDialysisSchedule from '../../data/initialDialysisSchedule.json';

const STORAGE_KEY = 'nexa_dialysis_schedules';

// Helper to get local state
const getLocalSchedules = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.warn('Erro ao carregar escalas do localStorage:', e);
  }
  return JSON.parse(JSON.stringify(initialDialysisSchedule));
};

const saveLocalSchedules = (schedules) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(schedules));
  } catch (e) {
    console.warn('Erro ao salvar escalas no localStorage:', e);
  }
};

export const getDialysisSchedule = async (salao = 'Salão 01', turno = '1º Turno') => {
  if (USE_MOCK) {
    const all = getLocalSchedules();
    return (all[salao] && all[salao][turno]) ? all[salao][turno] : { salao, turno, points: [] };
  }

  try {
    const { getFirestore, doc, getDoc, setDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    const docId = `${salao.replace(/\s+/g, '')}_${turno.replace(/\s+/g, '')}`;
    const docRef = doc(db, 'dialysis_schedules', docId);
    const snap = await getDoc(docRef);

    if (snap.exists()) {
      return snap.data();
    } else {
      // Seed from initial data
      const all = getLocalSchedules();
      const initialData = (all[salao] && all[salao][turno]) ? all[salao][turno] : { salao, turno, points: [] };
      await setDoc(docRef, initialData);
      return initialData;
    }
  } catch (err) {
    console.warn('Firestore fallback to local schedules:', err);
    const all = getLocalSchedules();
    return (all[salao] && all[salao][turno]) ? all[salao][turno] : { salao, turno, points: [] };
  }
};

export const getAllDialysisSchedules = async () => {
  if (USE_MOCK) {
    return getLocalSchedules();
  }

  try {
    const { getFirestore, collection, getDocs } = await import('firebase/firestore');
    const db = getFirestore(app);
    const snap = await getDocs(collection(db, 'dialysis_schedules'));

    if (snap.empty) {
      return getLocalSchedules();
    }

    const result = {};
    snap.docs.forEach(doc => {
      const data = doc.data();
      if (data.salao && data.turno) {
        if (!result[data.salao]) result[data.salao] = {};
        result[data.salao][data.turno] = data;
      }
    });
    return result;
  } catch (err) {
    console.warn('Firestore fallback to local for all schedules:', err);
    return getLocalSchedules();
  }
};

export const updatePointPatient = async (salao, turno, pointId, cadence, patientData) => {
  const all = getLocalSchedules();
  if (all[salao] && all[salao][turno]) {
    const pIdx = all[salao][turno].points.findIndex(p => p.id === pointId || p.ponto === pointId);
    if (pIdx !== -1) {
      if (cadence === 'SQS') {
        all[salao][turno].points[pIdx].sqs = {
          segunda: patientData,
          quarta: patientData,
          sexta: patientData,
          mainPatient: patientData
        };
      } else if (cadence === 'TQS') {
        all[salao][turno].points[pIdx].tqs = {
          terca: patientData,
          quinta: patientData,
          sabado: patientData,
          mainPatient: patientData
        };
      }
      saveLocalSchedules(all);
    }
  }

  if (!USE_MOCK) {
    try {
      const { getFirestore, doc, setDoc } = await import('firebase/firestore');
      const db = getFirestore(app);
      const docId = `${salao.replace(/\s+/g, '')}_${turno.replace(/\s+/g, '')}`;
      await setDoc(doc(db, 'dialysis_schedules', docId), all[salao][turno]);
    } catch (e) {
      console.warn('Erro ao atualizar Firestore:', e);
    }
  }

  return all[salao][turno];
};

export const swapPoints = async ({
  salaoA, turnoA, pointIdA, cadenceA,
  salaoB, turnoB, pointIdB, cadenceB
}) => {
  const all = getLocalSchedules();
  
  const roomA = all[salaoA]?.[turnoA];
  const roomB = all[salaoB]?.[turnoB];

  if (!roomA || !roomB) throw new Error('Salões ou turnos inválidos');

  const pIdxA = roomA.points.findIndex(p => p.id === pointIdA || p.ponto === pointIdA);
  const pIdxB = roomB.points.findIndex(p => p.id === pointIdB || p.ponto === pointIdB);

  if (pIdxA === -1 || pIdxB === -1) throw new Error('Pontos não encontrados');

  const patA = cadenceA === 'SQS' ? roomA.points[pIdxA].sqs.mainPatient : roomA.points[pIdxA].tqs.mainPatient;
  const patB = cadenceB === 'SQS' ? roomB.points[pIdxB].sqs.mainPatient : roomB.points[pIdxB].tqs.mainPatient;

  // Swap
  if (cadenceA === 'SQS') {
    roomA.points[pIdxA].sqs = { segunda: patB, quarta: patB, sexta: patB, mainPatient: patB };
  } else {
    roomA.points[pIdxA].tqs = { terca: patB, quinta: patB, sabado: patB, mainPatient: patB };
  }

  if (cadenceB === 'SQS') {
    roomB.points[pIdxB].sqs = { segunda: patA, quarta: patA, sexta: patA, mainPatient: patA };
  } else {
    roomB.points[pIdxB].tqs = { terca: patA, quinta: patA, sabado: patA, mainPatient: patA };
  }

  saveLocalSchedules(all);

  if (!USE_MOCK) {
    try {
      const { getFirestore, doc, setDoc } = await import('firebase/firestore');
      const db = getFirestore(app);
      const docIdA = `${salaoA.replace(/\s+/g, '')}_${turnoA.replace(/\s+/g, '')}`;
      const docIdB = `${salaoB.replace(/\s+/g, '')}_${turnoB.replace(/\s+/g, '')}`;
      await Promise.all([
        setDoc(doc(db, 'dialysis_schedules', docIdA), roomA),
        setDoc(doc(db, 'dialysis_schedules', docIdB), roomB),
      ]);
    } catch (e) {
      console.warn('Erro ao atualizar troca no Firestore:', e);
    }
  }

  return { roomA, roomB };
};

export const searchPatientInSchedule = (searchTerm, allSchedules) => {
  if (!searchTerm || !searchTerm.trim()) return [];
  const term = searchTerm.toLowerCase().trim();
  const schedules = allSchedules || getLocalSchedules();

  const results = [];

  Object.entries(schedules).forEach(([salaoName, turnos]) => {
    Object.entries(turnos).forEach(([turnoName, turnoData]) => {
      (turnoData.points || []).forEach(point => {
        // Check SQS
        const pSQS = point.sqs?.mainPatient;
        if (pSQS && pSQS.name && pSQS.name.toLowerCase().includes(term)) {
          results.push({
            patient: pSQS,
            cadence: 'Segunda, Quarta e Sexta',
            cadenceCode: 'SQS',
            salao: salaoName,
            turno: turnoName,
            box: point.box,
            ponto: point.ponto,
            serialNumber: point.serialNumber,
            pointId: point.id
          });
        }
        // Check TQS
        const pTQS = point.tqs?.mainPatient;
        if (pTQS && pTQS.name && pTQS.name.toLowerCase().includes(term)) {
          results.push({
            patient: pTQS,
            cadence: 'Terça, Quinta e Sábado',
            cadenceCode: 'TQS',
            salao: salaoName,
            turno: turnoName,
            box: point.box,
            ponto: point.ponto,
            serialNumber: point.serialNumber,
            pointId: point.id
          });
        }
      });
    });
  });

  return results;
};

export const calculateScheduleMetrics = (scheduleData, cadence = 'all') => {
  if (!scheduleData || !scheduleData.points) {
    return {
      totalMachines: 0,
      occupiedSlots: 0,
      vacantSlots: 0,
      favCount: 0,
      needle15: 0,
      needle16: 0,
      needle17: 0,
      cdlCount: 0,
      permcathCount: 0,
      isolationCount: 0
    };
  }

  const points = scheduleData.points;
  let totalMachines = points.length;
  let occupiedSlots = 0;
  let vacantSlots = 0;
  let favCount = 0;
  let needle15 = 0;
  let needle16 = 0;
  let needle17 = 0;
  let cdlCount = 0;
  let permcathCount = 0;
  let isolationCount = 0;

  const countPatient = (p) => {
    if (!p || !p.name) {
      vacantSlots++;
      return;
    }
    occupiedSlots++;

    if (p.accessType === 'Cateter Duplo Lúmen' || (p.accessRaw && p.accessRaw.toUpperCase().includes('CDL'))) {
      cdlCount++;
    } else if (p.accessType === 'Permcath' || (p.accessRaw && p.accessRaw.toUpperCase().includes('PERM'))) {
      permcathCount++;
    } else {
      favCount++;
      const nSize = p.needleSize || (p.accessRaw && p.accessRaw.match(/AG\s*\.?\s*(\d+)/i)?.[1]) || '16';
      if (nSize === '15') needle15++;
      else if (nSize === '17') needle17++;
      else needle16++;
    }

    if (p.isolation || (p.accessRaw && (p.accessRaw.toUpperCase().includes('HIV') || p.accessRaw.toUpperCase().includes('ÚNICO') || p.accessRaw.toUpperCase().includes('UNICO')))) {
      isolationCount++;
    }
  };

  points.forEach(pt => {
    if (cadence === 'SQS' || cadence === 'all') {
      countPatient(pt.sqs?.mainPatient);
    }
    if (cadence === 'TQS' || cadence === 'all') {
      countPatient(pt.tqs?.mainPatient);
    }
  });

  return {
    totalMachines,
    occupiedSlots,
    vacantSlots,
    favCount,
    needle15,
    needle16,
    needle17,
    cdlCount,
    permcathCount,
    isolationCount,
    occupancyRate: (occupiedSlots + vacantSlots) > 0 ? Math.round((occupiedSlots / (occupiedSlots + vacantSlots)) * 100) : 0
  };
};
