import { app } from './config';
import { USE_MOCK, mockFirestore } from './mockDb';
import type { Employee } from '../../types/index';

const DEFAULT_EMPLOYEES: Employee[] = [
  {
    id: 'emp-1',
    name: 'Ana Carolina Cerqueira Gonzaga',
    email: 'anacg@nexa.com',
    role: 'Supervisora de Enfermagem',
    sector: 'rh',
    status: 'active',
    admissionDate: '2023-01-15',
    phone: '(31) 98765-4321',
    cpf: '123.456.789-00'
  },
  {
    id: 'emp-2',
    name: 'Dr. J. Soares',
    email: 'jsoares@nexa.com',
    role: 'Médico Nefrologista / RT',
    sector: 'medica',
    status: 'active',
    admissionDate: '2022-05-10',
    phone: '(31) 99876-5432',
    cpf: '987.654.321-11'
  },
  {
    id: 'emp-3',
    name: 'Administrador TechCosta',
    email: 'contato@techcosta.net',
    role: 'Gestor de TI & Sistemas',
    sector: 'rh',
    status: 'active',
    admissionDate: '2022-01-01',
    phone: '(31) 99999-8888',
    cpf: '000.111.222-33'
  },
  {
    id: 'emp-4',
    name: 'Maria Clara Santos',
    email: 'mclara@nexa.com',
    role: 'Técnica de Enfermagem',
    sector: 'enfermagem',
    status: 'active',
    admissionDate: '2023-06-20',
    phone: '(31) 97777-6666',
    cpf: '444.555.666-77'
  },
  {
    id: 'emp-5',
    name: 'João Almoxarife',
    email: 'joao.estoque@nexa.com',
    role: 'Gestor de Estoque',
    sector: 'estoque',
    status: 'active',
    admissionDate: '2023-03-01',
    phone: '(31) 96666-5555',
    cpf: '888.999.000-11'
  }
];

export const getEmployees = async (): Promise<Employee[]> => {
    if (USE_MOCK) return DEFAULT_EMPLOYEES;
    try {
      const { getFirestore, collection, getDocs, doc, setDoc } = await import('firebase/firestore');
      const db = getFirestore(app);
      const snap = await getDocs(collection(db, 'employees'));
      if (snap.empty) {
        // Seed initial employees into Cloud Firestore
        for (const emp of DEFAULT_EMPLOYEES) {
          const { id, ...data } = emp;
          await setDoc(doc(db, 'employees', id), data);
        }
        return DEFAULT_EMPLOYEES;
      }
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as Employee));
    } catch (err) {
      console.error("Erro ao buscar funcionários do Firestore:", err);
      return DEFAULT_EMPLOYEES;
    }
  };

export const createEmployee = async (employeeData: Omit<Employee, 'id'>): Promise<Employee> => {
    if (USE_MOCK) return mockFirestore.createEmployee(employeeData);
    const { getFirestore, collection, addDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    const docRef = await addDoc(collection(db, 'employees'), {
      ...employeeData,
      createdAt: new Date().toISOString()
    });
    return { id: docRef.id, ...employeeData } as Employee;
  };

export const updateEmployee = async (id: string, employeeData: Partial<Employee>): Promise<Partial<Employee> & { id: string }> => {
    if (USE_MOCK) return mockFirestore.updateEmployee(id, employeeData);
    const { getFirestore, doc, updateDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    await updateDoc(doc(db, 'employees', id), employeeData);
    return { id, ...employeeData };
  };

export const deleteEmployee = async (id: string): Promise<any> => {
    if (USE_MOCK) return mockFirestore.deleteEmployee(id);
    const { getFirestore, doc, deleteDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    return deleteDoc(doc(db, 'employees', id));
  };

export const getShifts = async (): Promise<any[]> => {
    if (USE_MOCK) {
      return mockFirestore.getShifts();
    }
    const { getFirestore, collection, getDocs } = await import('firebase/firestore');
    const db = getFirestore(app);
    const snap = await getDocs(collection(db, 'shifts'));
    if (snap.empty) {
      const { writeBatch, doc } = await import('firebase/firestore');
      const batch = writeBatch(db);
      const defaults = [
        { id: 'shift_1', name: '1º Turno' },
        { id: 'shift_2', name: '2º Turno' },
        { id: 'shift_3', name: '3º Turno' }
      ];
      defaults.forEach(s => {
        batch.set(doc(db, 'shifts', s.id), s);
      });
      await batch.commit();
      return defaults;
    }
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  };

export const createShift = async (shiftData: any): Promise<any> => {
    if (USE_MOCK) {
      return mockFirestore.createShift(shiftData);
    }
    const { getFirestore, collection, addDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    const docRef = await addDoc(collection(db, 'shifts'), shiftData);
    return { id: docRef.id, ...shiftData };
  };

export const updateShift = async (id: string, shiftData: any): Promise<any> => {
    if (USE_MOCK) {
      return mockFirestore.updateShift(id, shiftData);
    }
    const { getFirestore, doc, updateDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    return updateDoc(doc(db, 'shifts', id), shiftData);
  };

export const deleteShift = async (id: string): Promise<any> => {
    if (USE_MOCK) {
      return mockFirestore.deleteShift(id);
    }
    const { getFirestore, doc, deleteDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    return deleteDoc(doc(db, 'shifts', id));
  };

export const getTransportVouchers = async (): Promise<any[]> => {
    if (USE_MOCK) return mockFirestore.getTransportVouchers();
    try {
      const { getFirestore, collection, getDocs } = await import('firebase/firestore');
      const db = getFirestore(app);
      const snap = await getDocs(collection(db, 'transport_vouchers'));
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (e) {
      console.error('Erro Firestore export const getTransportVouchers =', e);
      return [];
    }
  };

export const createTransportVoucher = async (voucherData: any): Promise<any> => {
    if (USE_MOCK) return mockFirestore.createTransportVoucher(voucherData);
    const { getFirestore, collection, addDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    const docRef = await addDoc(collection(db, 'transport_vouchers'), {
      ...voucherData,
      createdAt: new Date().toISOString()
    });
    return { id: docRef.id, ...voucherData };
  };

export const updateTransportVoucher = async (id: string, voucherData: any): Promise<any> => {
    if (USE_MOCK) return mockFirestore.updateTransportVoucher(id, voucherData);
    const { getFirestore, doc, updateDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    await updateDoc(doc(db, 'transport_vouchers', id), {
      ...voucherData,
      updatedAt: new Date().toISOString()
    });
    return { id, ...voucherData };
  };

export const deleteTransportVoucher = async (id: string): Promise<any> => {
    if (USE_MOCK) return mockFirestore.deleteTransportVoucher(id);
    const { getFirestore, doc, deleteDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    await deleteDoc(doc(db, 'transport_vouchers', id));
    return { success: true };
  };

export const importTransportVouchersBatch = async (period: string, vouchersList: any[]): Promise<any> => {
    if (USE_MOCK) return mockFirestore.importTransportVouchersBatch(period, vouchersList);
    const { getFirestore, collection, addDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    const results = [];
    for (const item of vouchersList) {
      const docRef = await addDoc(collection(db, 'transport_vouchers'), {
        ...item,
        period,
        createdAt: new Date().toISOString()
      });
      results.push({ id: docRef.id, ...item, period });
    }
    return results;
  };

// ----------------------------------------------------
// Occupational Exams / ASO (Exames Ocupacionais & Periódicos)
// ----------------------------------------------------
export interface OccupationalExam {
  id?: string;
  employeeId: string;
  employeeName: string;
  cpf?: string;
  role?: string;
  contractType?: 'CLT' | 'PJ' | 'Estagiário' | 'Temporário';
  examType: 'Admissional' | 'Periódico' | 'Demissional' | 'Mudança de Função' | 'Retorno ao Trabalho';
  examDate: string; // YYYY-MM-DD
  nextDueDate?: string; // YYYY-MM-DD
  result?: 'Apto' | 'Inapto' | 'Apto com Restrições';
  doctorName?: string;
  clinicName?: string;
  docUrl?: string;
  fileName?: string;
  fileSize?: number;
  notes?: string;
  unitId?: string;
  unit?: string;
  units?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export const getOccupationalExams = async (): Promise<OccupationalExam[]> => {
  if (USE_MOCK) return [];
  try {
    const { getFirestore, collection, getDocs, orderBy, query } = await import('firebase/firestore');
    const db = getFirestore(app);
    const q = query(collection(db, 'occupational_exams'), orderBy('examDate', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as OccupationalExam));
  } catch (e) {
    try {
      // Fallback without ordering if index is not ready
      const { getFirestore, collection, getDocs } = await import('firebase/firestore');
      const db = getFirestore(app);
      const snap = await getDocs(collection(db, 'occupational_exams'));
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as OccupationalExam));
    } catch (err) {
      console.error('Erro ao buscar occupational_exams do Firestore:', err);
      return [];
    }
  }
};

export const createOccupationalExam = async (examData: Omit<OccupationalExam, 'id'>): Promise<OccupationalExam> => {
  const { getFirestore, collection, addDoc } = await import('firebase/firestore');
  const db = getFirestore(app);
  const dataToSave = {
    ...examData,
    createdAt: new Date().toISOString()
  };
  const docRef = await addDoc(collection(db, 'occupational_exams'), dataToSave);
  return { id: docRef.id, ...dataToSave } as OccupationalExam;
};

export const updateOccupationalExam = async (id: string, examData: Partial<OccupationalExam>): Promise<Partial<OccupationalExam> & { id: string }> => {
  const { getFirestore, doc, updateDoc } = await import('firebase/firestore');
  const db = getFirestore(app);
  const dataToUpdate = {
    ...examData,
    updatedAt: new Date().toISOString()
  };
  await updateDoc(doc(db, 'occupational_exams', id), dataToUpdate);
  return { id, ...dataToUpdate };
};

export const deleteOccupationalExam = async (id: string): Promise<any> => {
  const { getFirestore, doc, deleteDoc } = await import('firebase/firestore');
  const db = getFirestore(app);
  await deleteDoc(doc(db, 'occupational_exams', id));
  return { success: true };
};

// ----------------------------------------------------
// Gestão de Treinamentos, Pré/Pós-Testes e Certificados
// ----------------------------------------------------

export interface TrainingQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}

export interface Training {
  id?: string;
  title: string;
  description: string;
  sector: string; // 'Geral' ou setor específico (ex: 'Enfermagem', 'Recepção')
  targetSectors?: string[];
  workloadHours: number; // Carga horária (ex: 2, 4)
  validityMonths: number; // Validade da reciclagem em meses (ex: 12 = anual)
  minPassingScore: number; // Nota mínima em % (ex: 70)
  minDurationMinutes: number; // Tempo mínimo no conteúdo (ex: 5)
  status: 'Ativo' | 'Rascunho' | 'Arquivado';
  contentType: 'video' | 'text' | 'document';
  videoUrl?: string;
  documentUrl?: string;
  textContent?: string;
  preTestQuestions: TrainingQuestion[];
  postTestQuestions: TrainingQuestion[];
  instructorName?: string;
  instructorRole?: string;
  unitId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TrainingSubmission {
  id?: string;
  trainingId: string;
  trainingTitle: string;
  employeeId?: string;
  employeeName: string;
  cpf: string;
  role?: string;
  sector?: string;
  unitId?: string;
  unit?: string;
  preScore: number; // % (0 a 100)
  postScore: number; // % (0 a 100)
  gainEfficacy: number; // postScore - preScore
  passed: boolean;
  completedAt: string; // ISO
  expiresAt?: string; // ISO
  certificateId: string; // Ex: NEXA-TRN-2026-XXXX
  status: 'Aprovado' | 'Reprovado';
  timeSpentSeconds?: number;
  answers?: {
    preAnswers?: Record<string, number>;
    postAnswers?: Record<string, number>;
  };
  createdAt?: string;
}

export const DEFAULT_TRAININGS: Training[] = [
  {
    id: 'trn-nr32',
    title: 'NR-32 & Biossegurança Hospitalar',
    description: 'Capacitação obrigatória sobre prevenção de acidentes com perfurocortantes, uso correto de EPIs e proteção biológica.',
    sector: 'Geral',
    workloadHours: 4,
    validityMonths: 12,
    minPassingScore: 70,
    minDurationMinutes: 5,
    status: 'Ativo',
    contentType: 'text',
    instructorName: 'Enfª Ana Carolina Cerqueira Gonzaga',
    instructorRole: 'Supervisora de Enfermagem / CCIH',
    textContent: `### 1. Objetivo e Campo de Aplicação
A Norma Regulamentadora NR-32 tem por finalidade estabelecer as diretrizes básicas para a implementação de medidas de proteção à segurança e à saúde dos trabalhadores dos serviços de saúde.

### 2. Riscos Biológicos e Perfurocortantes
- É terminantemente proibido o reencape manual de agulhas e dispositivos perfurocortantes após o uso.
- O descarte de perfurocortantes deve ser feito imediatamente após o uso em caixas rígidas de descarte (Descarpack) identificadas, respeitando o limite máximo de preenchimento (linha pontilhada de segurança).
- Todo colaborador com risco biológico deve manter o esquema vacinal completo e atualizado (Hepatite B, Tétano/Difteria e Tríplice Viral).

### 3. Equipamentos de Proteção Individual (EPI)
- Uso obrigatório de luvas, máscara cirúrgica/PFF2, avental impermeável e óculos de proteção conforme o procedimento.
- Os EPIs devem ser retirados antes de sair da área de assistência e nunca utilizados em refeitórios ou áreas administrativas.
- É vedado o uso de adornos (anéis, pulseiras, relógios, cordões, brincos compridos) nos postos de trabalho assistenciais e setores críticos.`,
    preTestQuestions: [
      {
        id: 'pre-1',
        question: 'Segundo a NR-32, é permitido reencapar agulhas após a punção?',
        options: ['Sim, utilizando ambas as mãos com cuidado', 'Sim, se a agulha for estéril', 'Não, é expressamente proibido o reencape manual de agulhas', 'Apenas com autorização da supervisão'],
        correctIndex: 2
      },
      {
        id: 'pre-2',
        question: 'Qual o limite correto de preenchimento da caixa coletora de perfurocortantes (Descarpack)?',
        options: ['Até a borda superior transbordar', 'Até a linha pontilhada de segurança indicada pelo fabricante', 'Metade da capacidade apenas', 'Não há limite estipulado'],
        correctIndex: 1
      },
      {
        id: 'pre-3',
        question: 'O uso de adornos (anéis, pulseiras, alianças) é permitido na assistência?',
        options: ['Sim, sem restrições', 'Apenas alianças de casamento', 'Não, a NR-32 veda o uso de adornos no ambiente assistencial', 'Permitido mediante higienização prévia'],
        correctIndex: 2
      }
    ],
    postTestQuestions: [
      {
        id: 'post-1',
        question: 'Em relação ao descarte de agulhas e bisturis usados, qual a conduta obrigatória?',
        options: ['Reencapar com cuidado e descartar no lixo comum', 'Descartar imediatamente sem reencapar no recipiente rígido de perfurocortantes', 'Quebrar a ponta da agulha antes de jogar fora', 'Guardar na bandeja para descarte ao final do plantão'],
        correctIndex: 1,
        explanation: 'O reencape e a quebra manual de agulhas são as principais causas de acidentes biológicos graves.'
      },
      {
        id: 'post-2',
        question: 'Por que a NR-32 veda o uso de adornos (anéis, relógios, pulseiras) durante a assistência?',
        options: ['Por motivos estéticos da clínica', 'Porque acumulam microrganismos e dificultam a higienização eficaz das mãos', 'Apenas para evitar perdas de joias', 'Para facilitar o registro de ponto'],
        correctIndex: 1,
        explanation: 'Adornos atuam como reservatórios de patógenos e impedem a correta fricção antisséptica da pele.'
      },
      {
        id: 'post-3',
        question: 'Qual das vacinas a seguir é exigência regulamentar indispensável pela NR-32 para trabalhadores de saúde?',
        options: ['Febre Amarela apenas', 'Vacina contra Hepatite B com confirmação por Anti-HBs', 'Vacina contra Varíola', 'Vacina contra Caxumba'],
        correctIndex: 1,
        explanation: 'A imunização contra Hepatite B é mandatória com acompanhamento do título de anticorpos protetores.'
      }
    ]
  },
  {
    id: 'trn-pgrss',
    title: 'PGRSS & Gerenciamento de Resíduos de Serviços de Saúde',
    description: 'Classificação, segregação na fonte, acondicionamento e descarte correto de resíduos dos Grupos A, B, D e E (ANVISA RDC 222/2018).',
    sector: 'Geral',
    workloadHours: 2,
    validityMonths: 12,
    minPassingScore: 70,
    minDurationMinutes: 4,
    status: 'Ativo',
    contentType: 'text',
    instructorName: 'Dra. Maria Fernanda Costa',
    instructorRole: 'Responsável Técnica / Gerência da Qualidade',
    textContent: `### 1. Importância da Segregação na Fonte
A separação dos resíduos no exato momento e local de sua geração é a etapa mais crítica do PGRSS. A segregação incorreta contamina resíduos comuns e eleva os custos e riscos sanitários.

### 2. Classificação dos Grupos (RDC 222/2018)
- **Grupo A (Biológico / Infectante):** Sacos plásticos brancos leitosos com símbolo internacional de risco biológico (ex: gazes com sangue, dialisadores, linhas de sangue, luvas contaminadas).
- **Grupo B (Químico):** Frascos rígidos identificados (ex: medicamentos vencidos, desinfetantes, reagentes químicos).
- **Grupo D (Comum / Reciclável):** Sacos pretos ou azuis para lixo comum (ex: papéis de escritório, restos de alimentos de refeitório, copos descartáveis sem contato biológico).
- **Grupo E (Perfurocortantes):** Recipientes rígidos estanques e resistentes à punctura (Descarpack).`,
    preTestQuestions: [
      {
        id: 'pgrss-pre-1',
        question: 'Em qual cor de saco plástico devem ser descartados resíduos biológicos com sangue (Grupo A)?',
        options: ['Saco preto', 'Saco branco leitoso identificado com símbolo de risco biológico', 'Saco transparente comum', 'Saco azul'],
        correctIndex: 1
      },
      {
        id: 'pgrss-pre-2',
        question: 'Um papel de escritório ou copo de água descartável deve ser descartado em qual grupo de resíduo?',
        options: ['Grupo A (Infectante)', 'Grupo B (Químico)', 'Grupo D (Resíduo Comum / Reciclável)', 'Grupo E (Perfurocortante)'],
        correctIndex: 2
      }
    ],
    postTestQuestions: [
      {
        id: 'pgrss-post-1',
        question: 'O que caracteriza a segregação de resíduos de saúde e onde ela deve ser feita?',
        options: ['Na central de expurgo no fim do dia', 'No momento e no próprio local onde o resíduo é gerado', 'Pela equipe da coleta externa terceirizada', 'No caminhão de transporte'],
        correctIndex: 1,
        explanation: 'A segregação imediata na fonte evita acidentes e impede a contaminação cruzada.'
      },
      {
        id: 'pgrss-post-2',
        question: 'Linhas arteriais e venosas de hemodiálise com presença de sangue residual pertencem a qual grupo?',
        options: ['Grupo D (Comum)', 'Grupo A (Infectante/Biológico)', 'Grupo B (Químico)', 'Não são resíduos de saúde'],
        correctIndex: 1,
        explanation: 'Materiais com sangue e secreções humanas são classificados no Grupo A (Infectante).'
      }
    ]
  },
  {
    id: 'trn-maos',
    title: 'Higienização das Mãos & Precauções Padrão',
    description: 'Técnica correta dos 5 momentos da OMS, uso de álcool em gel 70% e lavagem com água e sabonete.',
    sector: 'Geral',
    workloadHours: 2,
    validityMonths: 12,
    minPassingScore: 70,
    minDurationMinutes: 3,
    status: 'Ativo',
    contentType: 'text',
    instructorName: 'Enfª Ana Carolina Cerqueira Gonzaga',
    instructorRole: 'Supervisora de Enfermagem / CCIH',
    textContent: `### Os 5 Momentos da OMS para a Higienização das Mãos
1. Antes do contato com o paciente.
2. Antes da realização de procedimento asséptico / limpo.
3. Após risco de exposição a fluidos corporais.
4. Após o contato com o paciente.
5. Após o contato com as áreas próximas ou superfícies do paciente.

### Fricção com Álcool 70% vs. Água e Sabonete
- Se as mãos **não apresentarem sujidade visível**, a fricção alcoólica por 20 a 30 segundos é a técnica de escolha prioritária por ser mais rápida e eficaz.
- Se as mãos estiverem **visivelmente sujas ou após contato com fluidos**, a lavagem com água e sabonete líquido por 40 a 60 segundos é obrigatória.`,
    preTestQuestions: [
      {
        id: 'm-pre-1',
        question: 'Quantos são os momentos recomendados pela OMS para higienização das mãos na assistência à saúde?',
        options: ['2 momentos', '3 momentos', '5 momentos', '7 momentos'],
        correctIndex: 2
      }
    ],
    postTestQuestions: [
      {
        id: 'm-post-1',
        question: 'Quando as mãos NÃO apresentam sujidade visível, qual a alternativa recomendada pela OMS?',
        options: ['Fricção antisséptica com solução alcoólica a 70% (20 a 30 segundos)', 'Apenas enxaguar com água fria sem sabão', 'Secar com toalha de pano comum', 'Não há necessidade de higienizar'],
        correctIndex: 0,
        explanation: 'O álcool a 70% é o padrão ouro na ausência de sujidade visível.'
      },
      {
        id: 'm-post-2',
        question: 'O uso de luvas de procedimento dispensa a higienização das mãos?',
        options: ['Sim, porque a luva protege totalmente', 'Não. As mãos devem ser higienizadas antes de calçar e logo após retirar as luvas', 'Apenas se a luva for estéril cirúrgica', 'Sim, se a luva for descartada'],
        correctIndex: 1,
        explanation: 'Luvas possuem microporosidades e podem sofrer contaminação na retirada, logo não substituem a higienização.'
      }
    ]
  }
];

export const getTrainings = async (): Promise<Training[]> => {
  try {
    const { getFirestore, collection, getDocs } = await import('firebase/firestore');
    const db = getFirestore(app);
    const snap = await getDocs(collection(db, 'hr_trainings'));
    if (snap.empty) {
      // Seed initial clinical trainings into Firestore
      const { setDoc, doc } = await import('firebase/firestore');
      for (const t of DEFAULT_TRAININGS) {
        const { id, ...data } = t;
        await setDoc(doc(db, 'hr_trainings', id!), {
          ...data,
          createdAt: new Date().toISOString()
        });
      }
      return DEFAULT_TRAININGS;
    }
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Training));
  } catch (err) {
    console.warn('Fallback para DEFAULT_TRAININGS:', err);
    try {
      const local = localStorage.getItem('nexa_trainings_cache');
      if (local) return JSON.parse(local);
    } catch (_) {}
    return DEFAULT_TRAININGS;
  }
};

export const getTrainingById = async (id: string): Promise<Training | null> => {
  try {
    const { getFirestore, doc, getDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    const snap = await getDoc(doc(db, 'hr_trainings', id));
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() } as Training;
    }
  } catch (e) {
    console.warn('Erro ao buscar treinamento no Firestore:', e);
  }
  const defaults = DEFAULT_TRAININGS.find(t => t.id === id);
  if (defaults) return defaults;
  try {
    const local = localStorage.getItem('nexa_trainings_cache');
    if (local) {
      const parsed: Training[] = JSON.parse(local);
      const found = parsed.find(t => t.id === id);
      if (found) return found;
    }
  } catch (_) {}
  return null;
};

export const createTraining = async (trainingData: Omit<Training, 'id'>): Promise<Training> => {
  try {
    const { getFirestore, collection, addDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    const dataToSave = {
      ...trainingData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const docRef = await addDoc(collection(db, 'hr_trainings'), dataToSave);
    const newTraining = { id: docRef.id, ...dataToSave } as Training;
    
    try {
      const current = await getTrainings();
      localStorage.setItem('nexa_trainings_cache', JSON.stringify([newTraining, ...current]));
    } catch (_) {}
    
    return newTraining;
  } catch (err) {
    const fallbackId = 'trn-' + Date.now();
    const fallback = { id: fallbackId, ...trainingData, createdAt: new Date().toISOString() } as Training;
    try {
      const local = JSON.parse(localStorage.getItem('nexa_trainings_cache') || '[]');
      localStorage.setItem('nexa_trainings_cache', JSON.stringify([fallback, ...local]));
    } catch (_) {}
    return fallback;
  }
};

export const updateTraining = async (id: string, trainingData: Partial<Training>): Promise<Training> => {
  try {
    const { getFirestore, doc, updateDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    const dataToUpdate = {
      ...trainingData,
      updatedAt: new Date().toISOString()
    };
    await updateDoc(doc(db, 'hr_trainings', id), dataToUpdate);
  } catch (e) {
    console.warn('Erro ao atualizar treinamento no Firestore:', e);
  }
  return { id, ...trainingData } as Training;
};

export const deleteTraining = async (id: string): Promise<boolean> => {
  try {
    const { getFirestore, doc, deleteDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    await deleteDoc(doc(db, 'hr_trainings', id));
  } catch (e) {
    console.warn('Erro ao deletar treinamento no Firestore:', e);
  }
  return true;
};

export const getTrainingSubmissions = async (trainingId?: string): Promise<TrainingSubmission[]> => {
  try {
    const { getFirestore, collection, getDocs } = await import('firebase/firestore');
    const db = getFirestore(app);
    let q = collection(db, 'hr_training_submissions');
    const snap = await getDocs(q);
    let list = snap.docs.map(d => ({ id: d.id, ...d.data() } as TrainingSubmission));
    if (trainingId) {
      list = list.filter(item => item.trainingId === trainingId);
    }
    return list.sort((a, b) => (b.completedAt || '').localeCompare(a.completedAt || ''));
  } catch (e) {
    console.warn('Recuperando submissões do cache local:', e);
    try {
      const local = localStorage.getItem('nexa_training_submissions');
      if (local) {
        let parsed: TrainingSubmission[] = JSON.parse(local);
        if (trainingId) parsed = parsed.filter(s => s.trainingId === trainingId);
        return parsed;
      }
    } catch (_) {}
    return [];
  }
};

export const createTrainingSubmission = async (data: Omit<TrainingSubmission, 'id'>): Promise<TrainingSubmission> => {
  const payload = {
    ...data,
    createdAt: new Date().toISOString()
  };
  try {
    const { getFirestore, collection, addDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    const docRef = await addDoc(collection(db, 'hr_training_submissions'), payload);
    const created = { id: docRef.id, ...payload };
    
    try {
      const local = JSON.parse(localStorage.getItem('nexa_training_submissions') || '[]');
      localStorage.setItem('nexa_training_submissions', JSON.stringify([created, ...local]));
    } catch (_) {}
    
    return created;
  } catch (err) {
    console.warn('Salvando submissão em cache local offline:', err);
    const fallbackId = 'sub-' + Date.now();
    const created = { id: fallbackId, ...payload };
    try {
      const local = JSON.parse(localStorage.getItem('nexa_training_submissions') || '[]');
      localStorage.setItem('nexa_training_submissions', JSON.stringify([created, ...local]));
    } catch (_) {}
    return created;
  }
};

export const getTrainingSubmissionByCertificateId = async (certId: string): Promise<TrainingSubmission | null> => {
  try {
    const { getFirestore, collection, getDocs, query, where } = await import('firebase/firestore');
    const db = getFirestore(app);
    const q = query(collection(db, 'hr_training_submissions'), where('certificateId', '==', certId));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const doc = snap.docs[0];
      return { id: doc.id, ...doc.data() } as TrainingSubmission;
    }
  } catch (e) {
    console.warn('Erro ao buscar certificado no Firestore:', e);
  }
  try {
    const local = localStorage.getItem('nexa_training_submissions');
    if (local) {
      const list: TrainingSubmission[] = JSON.parse(local);
      const found = list.find(s => s.certificateId === certId);
      if (found) return found;
    }
  } catch (_) {}
  return null;
};

export const validateEmployeeCpf = async (rawCpf: string): Promise<{ found: boolean; employee?: any }> => {
  const cleanCpf = (rawCpf || '').replace(/\D/g, '');
  if (!cleanCpf || cleanCpf.length !== 11) {
    return { found: false };
  }
  try {
    const employees = await getEmployees();
    const match = employees.find(e => {
      const empCpfClean = (e.cpf || '').replace(/\D/g, '');
      return empCpfClean === cleanCpf;
    });
    if (match) {
      return { found: true, employee: match };
    }
  } catch (e) {
    console.warn('Erro ao validar CPF de funcionário:', e);
  }
  return { found: false };
};



