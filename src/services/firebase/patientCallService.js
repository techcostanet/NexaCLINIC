import { app } from './config';
import { USE_MOCK } from './mockDb';

const CALLS_COLLECTION = 'patient_calls';
const STORAGE_KEY = 'sistema_pacientes_chamadas';

const getStoredCalls = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Erro ao ler chamadas locais:', e);
    return [];
  }
};

const saveStoredCalls = (calls) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(calls));
    window.dispatchEvent(new CustomEvent('patient-call-updated', { detail: calls }));
  } catch (e) {
    console.error('Erro ao salvar chamadas locais:', e);
  }
};

/**
 * Emite uma nova chamada para a TV
 * @param {Object} callData
 * @param {string} callData.patientName - Nome do paciente
 * @param {string} [callData.patientId] - ID do paciente
 * @param {string} [callData.appointmentId] - ID do agendamento
 * @param {string} callData.room - Consultório ou sala (ex: "Consultório 1")
 * @param {string} [callData.doctorName] - Nome do médico
 * @param {string} [callData.unitId] - Unidade (ex: "betim", "taguatinga")
 * @param {string} [callData.unit] - Nome da unidade
 */
export const callPatient = async (callData) => {
  const payload = {
    patientName: (callData.patientName || 'Paciente').trim(),
    patientId: callData.patientId || null,
    appointmentId: callData.appointmentId || null,
    room: (callData.room || 'Consultório').trim(),
    doctorName: (callData.doctorName || '').trim(),
    unitId: callData.unitId || 'all',
    unit: callData.unit || '',
    calledAt: new Date().toISOString(),
    status: 'active'
  };

  if (USE_MOCK) {
    const current = getStoredCalls();
    // Increment call count for same patient/appointment today
    const existingCalls = current.filter(c => 
      c.patientName.toLowerCase() === payload.patientName.toLowerCase() &&
      c.room.toLowerCase() === payload.room.toLowerCase()
    );
    const callCount = existingCalls.length + 1;
    const newCall = {
      id: 'call_' + Math.random().toString(36).substring(2, 9),
      ...payload,
      callCount
    };
    
    // Keep most recent 50 calls
    const updated = [newCall, ...current].slice(0, 50);
    saveStoredCalls(updated);
    return newCall;
  }

  try {
    const { getFirestore, collection, addDoc, getDocs, query, where } = await import('firebase/firestore');
    const db = getFirestore(app);

    // Contar chamadas prévias do mesmo agendamento/paciente hoje
    let callCount = 1;
    if (payload.appointmentId) {
      const prevQ = query(
        collection(db, CALLS_COLLECTION),
        where('appointmentId', '==', payload.appointmentId)
      );
      const prevSnap = await getDocs(prevQ);
      callCount = prevSnap.size + 1;
    }

    const docRef = await addDoc(collection(db, CALLS_COLLECTION), {
      ...payload,
      callCount,
      createdAt: new Date().toISOString()
    });

    return {
      id: docRef.id,
      ...payload,
      callCount
    };
  } catch (error) {
    console.error('Erro ao emitir chamada de paciente no Firestore:', error);
    // Fallback local se Firestore falhar
    const current = getStoredCalls();
    const fallbackCall = {
      id: 'call_fallback_' + Date.now(),
      ...payload,
      callCount: 1
    };
    saveStoredCalls([fallbackCall, ...current].slice(0, 50));
    return fallbackCall;
  }
};

/**
 * Retorna as chamadas recentes
 * @param {string} unitId - Filtro opcional por unidade
 * @param {number} maxResults - Quantidade máxima
 */
export const getRecentPatientCalls = async (unitId = 'all', maxResults = 20) => {
  if (USE_MOCK) {
    const calls = getStoredCalls();
    if (!unitId || unitId === 'all') return calls.slice(0, maxResults);
    return calls.filter(c => !c.unitId || c.unitId === 'all' || c.unitId === unitId).slice(0, maxResults);
  }

  try {
    const { getFirestore, collection, query, orderBy, limit, getDocs } = await import('firebase/firestore');
    const db = getFirestore(app);
    const q = query(
      collection(db, CALLS_COLLECTION),
      orderBy('calledAt', 'desc'),
      limit(maxResults)
    );
    const snap = await getDocs(q);
    const results = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    if (!unitId || unitId === 'all') return results;
    return results.filter(c => !c.unitId || c.unitId === 'all' || c.unitId === unitId);
  } catch (error) {
    console.error('Erro ao buscar chamadas recentes:', error);
    const calls = getStoredCalls();
    return calls.slice(0, maxResults);
  }
};

/**
 * Assina atualizações em tempo real das chamadas de pacientes
 * @param {string} unitId - Unidade a monitorar ('all', 'betim', 'taguatinga')
 * @param {Function} callback - Função que recebe a lista atualizada de chamadas
 * @returns {Function} unsubscribe
 */
export const subscribeToPatientCalls = (unitId = 'all', callback) => {
  if (USE_MOCK) {
    const handleStorageUpdate = () => {
      const calls = getStoredCalls();
      const filtered = (!unitId || unitId === 'all')
        ? calls
        : calls.filter(c => !c.unitId || c.unitId === 'all' || c.unitId === unitId);
      callback(filtered);
    };

    // Chamada inicial
    handleStorageUpdate();

    window.addEventListener('patient-call-updated', handleStorageUpdate);
    window.addEventListener('storage', handleStorageUpdate);

    return () => {
      window.removeEventListener('patient-call-updated', handleStorageUpdate);
      window.removeEventListener('storage', handleStorageUpdate);
    };
  }

  let unsubscribe = () => {};

  import('firebase/firestore')
    .then(({ getFirestore, collection, query, orderBy, limit, onSnapshot }) => {
      const db = getFirestore(app);
      const q = query(
        collection(db, CALLS_COLLECTION),
        orderBy('calledAt', 'desc'),
        limit(20)
      );

      unsubscribe = onSnapshot(
        q,
        (snap) => {
          const items = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          const filtered = (!unitId || unitId === 'all')
            ? items
            : items.filter(c => !c.unitId || c.unitId === 'all' || c.unitId === unitId);
          callback(filtered);
        },
        (error) => {
          console.error('Erro no listener real-time de chamadas de pacientes:', error);
          // Fallback para storage local
          const calls = getStoredCalls();
          callback(calls);
        }
      );
    })
    .catch((error) => {
      console.error('Erro ao inicializar listener de chamadas de pacientes:', error);
      const calls = getStoredCalls();
      callback(calls);
    });

  return () => {
    try {
      unsubscribe();
    } catch (e) {
      // noop
    }
  };
};
