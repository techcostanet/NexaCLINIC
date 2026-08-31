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
  },
  {
    id: 'doc-georgia-uid',
    name: 'Georgia Abaurre Dutra de Rezende',
    crm: '82485/MG',
    specialty: 'Nefrologia',
    email: 'georgiaar@nexa.com',
    phone: '(31) 98711-2233',
    contractType: 'PJ',
    pixKey: 'georgiaar@nexa.com',
    bank: 'Banco do Brasil (001) Ag 3201 CC 82485-9',
    active: true
  }
];

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
    'AVALIAÇÃO/CONSULTA - POR MÉDICO CIRURGIÃO': 55.0,
    'CONFECÇÃO DE FAV COM PRÓTESE - PTFE': 891.0,
    'CONFECÇÃO DE FAV SIMPLES': 668.25,
    'COORDENAÇÃO DP': 2800.0,
    'COORDENAÇÃO GERAL': 28000.0,
    'DUPLEX SCAN VENOSO OU ARTERIAL – DSV/DAS': 119.79,
    'IMPLANTE DE CATETER DE HEMODIÁLISE - CDL': 270.0,
    'IMPLANTE DE CATETER DE LONGA PERMCATH': 668.25,
    'INTERVENÇÃO DE FAV': 668.25,
    'LIGADURA FAV': 668.25,
    'RETIRADA DE CATETER PERMCATH': 400.0,
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
  additionalEmail: ''
};

// Realistic mock schedules generator covering current and surrounding months
export const generateFallbackSchedules = (targetMonth) => {
  const currentYM = targetMonth || new Date().toISOString().substring(0, 7);
  const [yearStr, monthStr] = currentYM.split('-');
  const year = parseInt(yearStr, 10);
  const monthIdx = parseInt(monthStr, 10) - 1;

  const sectors = ['Salão 1', 'Salão 2', 'Salão 3', 'Diálise Peritoneal (DP)'];
  const shifts = ['Manhã', 'Tarde', 'Noite'];
  const doctors = FALLBACK_DOCTORS;

  const list = [];
  const today = new Date();

  for (let day = 1; day <= 28; day++) {
    const dateStr = `${year}-${String(monthIdx + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dateObj = new Date(`${dateStr}T12:00:00`);
    const dayOfWeek = dateObj.getDay(); // 0 is Sunday

    if (dayOfWeek === 0) continue; // No regular hemodialysis on Sunday

    sectors.forEach((sec, sIdx) => {
      // DP only runs morning/afternoon, Salões run 3 shifts
      const applicableShifts = sec.includes('DP') ? ['Manhã', 'Tarde'] : shifts;

      applicableShifts.forEach((sh, shIdx) => {
        const docIdx = (day * 3 + sIdx * 2 + shIdx) % doctors.length;
        const doc = doctors[docIdx];
        const isPast = dateObj < today;
        const isToday = dateObj.toDateString() === today.toDateString();

        let checkinStatus = 'Pendente';
        let checkinTime = null;
        let checkedBy = null;

        if (isPast) {
          if ((day + sIdx) % 7 === 0) {
            checkinStatus = 'Atraso';
            checkinTime = sh === 'Manhã' ? '06:25' : sh === 'Tarde' ? '12:20' : '18:15';
            checkedBy = 'Recepção Central';
          } else {
            checkinStatus = 'Presente';
            checkinTime = sh === 'Manhã' ? '05:55' : sh === 'Tarde' ? '11:50' : '17:50';
            checkedBy = 'Recepção Central';
          }
        } else if (isToday) {
          if (sh === 'Manhã') {
            checkinStatus = 'Presente';
            checkinTime = '06:02';
            checkedBy = 'Recepção Central';
          }
        }

        list.push({
          id: `sch-${dateStr}-${sec.replace(/[^a-zA-Z0-9]/g, '')}-${sh}`,
          month: currentYM,
          date: dateStr,
          sector: sec,
          shift: sh,
          doctorId: doc.id,
          doctorName: doc.name,
          doctorCrm: doc.crm,
          unitId: 'betim',
          status: 'Confirmado',
          checkinStatus,
          checkinTime,
          checkedBy,
          notes: ''
        });
      });
    });
  }

  return list;
};

// Realistic mock swaps generator
export const generateFallbackSwaps = () => {
  const todayStr = new Date().toISOString().substring(0, 10);
  return [
    {
      id: 'swap-1',
      shiftId: 'sch-swap-1',
      shiftDate: todayStr,
      sector: 'Salão 1',
      shift: 'Manhã',
      requestingDoctorId: 'doc-lucas-uid',
      requestingDoctorName: 'Dr. Lucas Mendes',
      requestingDoctorEmail: 'lucas.mendes@nexa.com',
      targetDoctorId: 'doc-mariana-uid',
      targetDoctorName: 'Dra. Mariana Ribeiro',
      targetDoctorEmail: 'mariana.ribeiro@nexa.com',
      reason: 'Participação no Congresso Brasileiro de Nefrologia',
      status: 'Homologado',
      requestedAt: '2026-08-28T09:15:00.000Z',
      respondedAt: '2026-08-28T10:30:00.000Z',
      homologatedAt: '2026-08-28T14:00:00.000Z',
      homologatedBy: 'Dr. Roberto Carvalho (Coordenação)',
      emailLogs: [
        { to: 'mariana.ribeiro@nexa.com', subject: '[NexaMED] Solicitação de Troca de Plantão — Dr. Lucas Mendes', date: '28/08/2026 09:15' },
        { to: 'lucas.mendes@nexa.com', subject: '[NexaMED] Troca Aceita por Dra. Mariana Ribeiro', date: '28/08/2026 10:30' },
        { to: 'ambos', subject: '[NexaMED] Homologação de Troca Concluída pela Coordenação Médica', date: '28/08/2026 14:00' }
      ]
    },
    {
      id: 'swap-2',
      shiftId: 'sch-swap-2',
      shiftDate: '2026-08-30',
      sector: 'Salão 2',
      shift: 'Tarde',
      requestingDoctorId: 'doc-roberto-uid',
      requestingDoctorName: 'Dr. Roberto Carvalho',
      requestingDoctorEmail: 'roberto.carvalho@nexa.com',
      targetDoctorId: 'doc-camila-uid',
      targetDoctorName: 'Dra. Camila Albuquerque',
      targetDoctorEmail: 'camila.albuquerque@nexa.com',
      reason: 'Procedimento cirúrgico de emergência em outro hospital',
      status: 'Aceito',
      requestedAt: '2026-08-29T14:20:00.000Z',
      respondedAt: '2026-08-29T15:00:00.000Z',
      homologatedAt: null,
      emailLogs: [
        { to: 'camila.albuquerque@nexa.com', subject: '[NexaMED] Solicitação de Troca de Plantão — Dr. Roberto Carvalho', date: '29/08/2026 14:20' },
        { to: 'roberto.carvalho@nexa.com', subject: '[NexaMED] Troca Aceita por Dra. Camila Albuquerque', date: '29/08/2026 15:00' }
      ]
    },
    {
      id: 'swap-3',
      shiftId: 'sch-swap-3',
      shiftDate: '2026-08-31',
      sector: 'Diálise Peritoneal (DP)',
      shift: 'Manhã',
      requestingDoctorId: 'doc-fernando-uid',
      requestingDoctorName: 'Dr. Fernando Vasconcelos',
      requestingDoctorEmail: 'fernando.vasconcelos@nexa.com',
      targetDoctorId: 'doc-jsoares-uid',
      targetDoctorName: 'Dr. J. Soares',
      targetDoctorEmail: 'jsoares@nexa.com',
      reason: 'Compromisso acadêmico e mentoria de residência médica',
      status: 'Pendente',
      requestedAt: '2026-08-30T18:00:00.000Z',
      respondedAt: null,
      emailLogs: [
        { to: 'jsoares@nexa.com', subject: '[NexaMED] Solicitação de Troca de Plantão — Dr. Fernando Vasconcelos', date: '30/08/2026 18:00' }
      ]
    }
  ];
};

// Realistic mock procedures generator covering all doctors and 12 procedures
export const generateFallbackProcedures = () => {
  return [
    {
      id: 'proc-1',
      doctorId: 'doc-lucas-uid',
      doctorName: 'Dr. Lucas Mendes',
      patientId: 'pat-1',
      patientName: 'ADAIR PRAXEDES MORENO',
      date: '2026-08-05',
      procedureType: 'IMPLANTE DE CATETER DE HEMODIÁLISE - CDL',
      value: 270.0,
      status: 'Realizado',
      notes: 'Implante em Veia Jugular Interna Direita guiado por ultrassom.'
    },
    {
      id: 'proc-2',
      doctorId: 'doc-lucas-uid',
      doctorName: 'Dr. Lucas Mendes',
      patientId: 'pat-2',
      patientName: 'ADAO LUCIANO DIAS',
      date: '2026-08-12',
      procedureType: 'DUPLEX SCAN VENOSO OU ARTERIAL – DSV/DAS',
      value: 119.79,
      status: 'Realizado',
      notes: 'Mapeamento de leito vascular para confecção de FAV em membro superior esquerdo.'
    },
    {
      id: 'proc-3',
      doctorId: 'doc-mariana-uid',
      doctorName: 'Dra. Mariana Ribeiro',
      patientId: 'pat-3',
      patientName: 'ADCELIO BARBOSA DE OLIVEIRA',
      date: '2026-08-08',
      procedureType: 'IMPLANTE DE CATETER DE LONGA PERMCATH',
      value: 668.25,
      status: 'Realizado',
      notes: 'Permcath tunelizado em jugular direita, raio-x de controle com ponta em átrio direito.'
    },
    {
      id: 'proc-4',
      doctorId: 'doc-mariana-uid',
      doctorName: 'Dra. Mariana Ribeiro',
      patientId: 'pat-4',
      patientName: 'ADELSON DIAS FERREIRA',
      date: '2026-08-15',
      procedureType: 'CONFECÇÃO DE FAV SIMPLES',
      value: 668.25,
      status: 'Realizado',
      notes: 'Anastomose rádio-cefálica término-lateral em punho esquerdo com bom frêmito imediato.'
    },
    {
      id: 'proc-5',
      doctorId: 'doc-roberto-uid',
      doctorName: 'Dr. Roberto Carvalho',
      patientId: 'pat-5',
      patientName: 'AFONSO DIAS GOMES',
      date: '2026-08-03',
      procedureType: 'COORDENAÇÃO DP',
      value: 2800.0,
      status: 'Realizado',
      notes: 'Supervisão técnica, auditoria de prescrições e visitas a pacientes em Diálise Peritoneal.'
    },
    {
      id: 'proc-6',
      doctorId: 'doc-roberto-uid',
      doctorName: 'Dr. Roberto Carvalho',
      patientId: 'pat-6',
      patientName: 'AGLAIR FERREIRA SILVA',
      date: '2026-08-18',
      procedureType: 'INTERVENÇÃO DE FAV',
      value: 668.25,
      status: 'Realizado',
      notes: 'Angioplastia transluminal de estenose justa-anastomótica de fístula arteriovenosa.'
    },
    {
      id: 'proc-7',
      doctorId: 'doc-camila-uid',
      doctorName: 'Dra. Camila Albuquerque',
      patientId: 'pat-7',
      patientName: 'AIRTON DE ASSIS',
      date: '2026-08-10',
      procedureType: 'RETIRADA DE CATETER PERMCATH',
      value: 400.0,
      status: 'Realizado',
      notes: 'Retirada de cateter de longa permanência após maturação completa e uso de FAV.'
    },
    {
      id: 'proc-8',
      doctorId: 'doc-camila-uid',
      doctorName: 'Dra. Camila Albuquerque',
      patientId: 'pat-8',
      patientName: 'ALCINO MARIANO',
      date: '2026-08-22',
      procedureType: 'SUPERFI. BASÍLICA, LUNAR, SAFENA, CEFALICA',
      value: 1217.70,
      status: 'Realizado',
      notes: 'Transposição e superficialização de veia basílica em braço direito.'
    },
    {
      id: 'proc-9',
      doctorId: 'doc-fernando-uid',
      doctorName: 'Dr. Fernando Vasconcelos',
      patientId: 'pat-9',
      patientName: 'ALESSANDRO GONCALVES DA SILVA',
      date: '2026-08-01',
      procedureType: 'COORDENAÇÃO GERAL',
      value: 28000.0,
      status: 'Realizado',
      notes: 'Diretoria clínica, gestão técnica do corpo médico, protocolos clínicos e auditorias nefrológicas.'
    },
    {
      id: 'proc-10',
      doctorId: 'doc-fernando-uid',
      doctorName: 'Dr. Fernando Vasconcelos',
      patientId: 'pat-10',
      patientName: 'ALEXANDRE DE JESUS LOPES',
      date: '2026-08-14',
      procedureType: 'CONFECÇÃO DE FAV COM PRÓTESE - PTFE',
      value: 891.0,
      status: 'Realizado',
      notes: 'Enxerto vascular com prótese PTFE em alça braquio-axilar esquerda.'
    },
    {
      id: 'proc-11',
      doctorId: 'doc-jsoares-uid',
      doctorName: 'Dr. J. Soares',
      patientId: 'pat-11',
      patientName: 'ALEXANDRE HENRIQUE SANTOS',
      date: '2026-08-11',
      procedureType: 'AVALIAÇÃO/CONSULTA - POR MÉDICO CIRURGIÃO',
      value: 55.0,
      status: 'Realizado',
      notes: 'Avaliação pré-operatória de leito vascular para planejamento de novo acesso.'
    },
    {
      id: 'proc-12',
      doctorId: 'doc-jsoares-uid',
      doctorName: 'Dr. J. Soares',
      patientId: 'pat-12',
      patientName: 'ALICE PEREIRA GOMES',
      date: '2026-08-19',
      procedureType: 'LIGADURA FAV',
      value: 668.25,
      status: 'Realizado',
      notes: 'Ligadura de fístula arteriovenosa não funcionante por síndrome de hiperfluxo.'
    }
  ];
};

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

    // 2. Discover doctors from users collection
    try {
      const userList = await getUsers();
      if (userList && userList.length > 0) {
        userList.forEach(u => {
          const uId = u.uid || u.id;
          const exists = merged.some(d => d.id === uId || (d.email && u.email && d.email.toLowerCase() === u.email.toLowerCase()) || d.name === u.name);
          if (!exists) {
            const isDoc = u.role === 'admin' || 
              u.role === 'doctor' || 
              u.role === 'professional' || 
              u.role === 'clinical' || 
              (u.allowedSectors && u.allowedSectors.includes('medica')) ||
              (u.name && (u.name.toLowerCase().includes('dr') || u.name.toLowerCase().includes('médic') || u.name.toLowerCase().includes('nefro')));
            
            if (isDoc) {
              merged.push({
                id: uId,
                name: u.name || 'Profissional',
                crm: u.crm || (u.name?.includes('Dr') ? '45892/MG' : 'CRM Ativo'),
                specialty: u.specialty || 'Nefrologia',
                cpf: u.cpf || '',
                susCard: u.susCard || '',
                email: u.email || '',
                phone: u.phone || '',
                contractType: u.contractType || 'PJ',
                pixKey: u.pixKey || u.email || '',
                bank: u.bank || 'Banco Principal',
                active: true
              });
            }
          }
        });
      }
    } catch (e) {
      console.warn('Erro ao consultar users no Firestore para médicos:', e);
    }
  } catch (err) {
    console.warn('Erro geral ao buscar médicos:', err);
  }

  return merged;
};

export const saveMedicalDoctor = async (doctorId, doctorData) => {
  if (USE_MOCK) return mockFirestore.saveMedicalDoctor(doctorId, doctorData);
  const { getFirestore, doc, setDoc } = await import('firebase/firestore');
  const db = getFirestore(app);
  await setDoc(doc(db, 'medical_doctors', doctorId), {
    ...doctorData,
    updatedAt: new Date().toISOString()
  }, { merge: true });
  return { id: doctorId, ...doctorData };
};

export const getMedicalSettings = async () => {
  if (USE_MOCK) return mockFirestore.getMedicalSettings();
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
  try {
    const { getFirestore, collection, getDocs } = await import('firebase/firestore');
    const db = getFirestore(app);
    const snap = await getDocs(collection(db, 'medical_schedules'));
    const all = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    if (all.length > 0) {
      return all.filter(s => !month || s.month === month);
    }
  } catch (err) {
    console.warn('Erro ao ler medical_schedules do Firestore:', err);
  }
  return generateFallbackSchedules(month);
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
  try {
    const { getFirestore, collection, getDocs } = await import('firebase/firestore');
    const db = getFirestore(app);
    const snap = await getDocs(collection(db, 'medical_swaps'));
    const all = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    if (all.length > 0) return all;
  } catch (err) {
    console.warn('Erro ao ler medical_swaps do Firestore:', err);
  }
  return generateFallbackSwaps();
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
  let all = [];
  try {
    const { getFirestore, collection, getDocs } = await import('firebase/firestore');
    const db = getFirestore(app);
    const snap = await getDocs(collection(db, 'medical_procedures'));
    all = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.warn('Erro ao ler medical_procedures do Firestore:', err);
  }
  if (!all || all.length === 0) {
    all = generateFallbackProcedures();
  }
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
  try {
    const { getFirestore, collection, getDocs } = await import('firebase/firestore');
    const db = getFirestore(app);
    const snap = await getDocs(collection(db, 'medical_productions'));
    const all = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    return all.filter(p => !month || p.month === month);
  } catch (err) {
    console.warn('Erro ao ler medical_productions do Firestore:', err);
    return [];
  }
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
