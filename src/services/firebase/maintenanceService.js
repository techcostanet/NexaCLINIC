import { app } from '../../firebase';
import { USE_MOCK } from './mockDb';

const LOCAL_STORAGE_EQUIPMENTS_KEY = 'nexa_maintenance_equipments';
const LOCAL_STORAGE_ORDERS_KEY = 'nexa_maintenance_service_orders';

// Initial Seed Data for Clinic & Hospital Equipments (Biomedical, Predial, TI Hardware, TI Software)
const INITIAL_EQUIPMENTS = [
  {
    id: 'EQP-BIO-001',
    code: 'PAT-00101',
    name: 'Máquina de Hemodiálise Fresenius 4008S',
    category: 'Biomédico',
    subcategory: 'Hemodiálise',
    brand: 'Fresenius Medical Care',
    model: '4008S Classic',
    serialNumber: 'SN-4008S-9921',
    sector: 'Salão A de Hemodiálise',
    criticality: 'Alta',
    status: 'Em Operação',
    acquisitionDate: '2023-01-15',
    acquisitionValue: 125000.00,
    warrantyUntil: '2026-01-15',
    preventiveIntervalDays: 90,
    lastPreventiveDate: '2026-05-10',
    nextPreventiveDate: '2026-08-10',
    requiresCalibration: true,
    calibrationValidUntil: '2026-11-20',
    notes: 'Equipamento principal de diálise. Calibração de condutividade e fluxo em dia.'
  },
  {
    id: 'EQP-BIO-002',
    code: 'PAT-00102',
    name: 'Sistema de Osmose Reversa Duplo Passo 1500L/h',
    category: 'Biomédico',
    subcategory: 'Tratamento de Água',
    brand: 'PermeaTech',
    model: 'OSMO-DUO-1500',
    serialNumber: 'SN-OSM-2022-88',
    sector: 'Central de Tratamento de Água (CTA)',
    criticality: 'Alta',
    status: 'Em Operação',
    acquisitionDate: '2022-06-10',
    acquisitionValue: 280000.00,
    warrantyUntil: '2025-06-10',
    preventiveIntervalDays: 30,
    lastPreventiveDate: '2026-07-05',
    nextPreventiveDate: '2026-08-05',
    requiresCalibration: true,
    calibrationValidUntil: '2026-12-01',
    notes: 'Controle contínuo de condutividade e teste bacteriológico semanal.'
  },
  {
    id: 'EQP-TI-001',
    code: 'PAT-TI-001',
    name: 'Servidor Principal Dell PowerEdge R750',
    category: 'TI Hardware',
    subcategory: 'Servidor',
    brand: 'Dell Technologies',
    model: 'PowerEdge R750 Xeon Silver',
    serialNumber: 'DELL-R750-77X92',
    sector: 'TI Data Center',
    criticality: 'Alta',
    status: 'Em Operação',
    acquisitionDate: '2024-03-01',
    acquisitionValue: 45000.00,
    warrantyUntil: '2027-03-01',
    preventiveIntervalDays: 180,
    lastPreventiveDate: '2026-03-15',
    nextPreventiveDate: '2026-09-15',
    requiresCalibration: false,
    calibrationValidUntil: '',
    notes: 'Hospeda o banco de dados NexaCLINIC e serviços de aplicação. RAID 10 configurado.'
  },
  {
    id: 'EQP-SW-001',
    code: 'PAT-SW-001',
    name: 'Licença NexaCLINIC Enterprise v3.0',
    category: 'TI Software',
    subcategory: 'ERP / Sistema Clínico',
    brand: 'NexaAI Tech',
    model: 'CLINIC v3.0',
    serialNumber: 'LIC-NEXA-2026-ENT',
    sector: 'TI Data Center',
    criticality: 'Alta',
    status: 'Em Operação',
    acquisitionDate: '2025-01-01',
    acquisitionValue: 18000.00,
    warrantyUntil: '2027-01-01',
    preventiveIntervalDays: 90,
    lastPreventiveDate: '2026-06-01',
    nextPreventiveDate: '2026-09-01',
    requiresCalibration: false,
    calibrationValidUntil: '',
    notes: 'Suporta múltiplos módulos: Clínico, Recepção, Estoque, Financeiro e Manutenção.'
  },
  {
    id: 'EQP-PRED-001',
    code: 'PAT-PRD-001',
    name: 'Grupo Gerador Stemac 250kVA CUMMINS',
    category: 'Infraestrutura',
    subcategory: 'Energia',
    brand: 'Stemac / Cummins',
    model: 'ST-250KVA-SILENT',
    serialNumber: 'GEN-250-8891',
    sector: 'Área Técnica Externa',
    criticality: 'Alta',
    status: 'Em Operação',
    acquisitionDate: '2021-11-20',
    acquisitionValue: 195000.00,
    warrantyUntil: '2024-11-20',
    preventiveIntervalDays: 30,
    lastPreventiveDate: '2026-07-15',
    nextPreventiveDate: '2026-08-15',
    requiresCalibration: true,
    calibrationValidUntil: '2027-01-10',
    notes: 'Teste de transferência automática de carga semanal realizado às terças-feiras.'
  },
  {
    id: 'EQP-TI-002',
    code: 'PAT-TI-002',
    name: 'Impressora Térmica de Pulseiras e Receitas Zebra ZD421',
    category: 'TI Hardware',
    subcategory: 'Impressora',
    brand: 'Zebra Technologies',
    model: 'ZD421 Direct Thermal',
    serialNumber: 'ZEB-ZD421-5512',
    sector: 'Recepção 01',
    criticality: 'Média',
    status: 'Em Operação',
    acquisitionDate: '2024-05-10',
    acquisitionValue: 3200.00,
    warrantyUntil: '2026-05-10',
    preventiveIntervalDays: 120,
    lastPreventiveDate: '2026-05-20',
    nextPreventiveDate: '2026-09-20',
    requiresCalibration: false,
    calibrationValidUntil: '',
    notes: 'Impressão de etiquetas de identificação de pacientes e amostras laboratoriais.'
  }
];

const INITIAL_SERVICE_ORDERS = [
  {
    id: 'OS-2026-0001',
    code: 'OS-2026-0001',
    equipmentId: 'EQP-BIO-001',
    equipmentName: 'Máquina de Hemodiálise Fresenius 4008S',
    equipmentCategory: 'Biomédico',
    sector: 'Salão A de Hemodiálise',
    type: 'Corretiva',
    priority: 'Alta',
    status: 'Concluída',
    requesterName: 'Dra. Márcia Oliveira',
    requesterSector: 'Enfermagem / Salão A',
    assignedTechnician: 'Eng. Roberto Lima (Engenharia Clínica)',
    description: 'Alarme sonoro intermitente de baixa pressão de fluxo de diassat durante a sessão.',
    diagnostic: 'Substituído filtro da válvula de entrada e limpo o sensor de pressão. Testes de estanqueidade e fluxo aprovados.',
    openDate: '2026-07-28T08:30:00.000Z',
    completionDate: '2026-07-28T11:45:00.000Z',
    partsUsed: [
      { itemId: 'PROD-VLV-01', name: 'Filtro da Válvula de Entrada 4008S', quantity: 1, unitCost: 180.00 }
    ],
    laborCost: 250.00,
    totalCost: 430.00
  },
  {
    id: 'OS-2026-0002',
    code: 'OS-2026-0002',
    equipmentId: 'EQP-TI-001',
    equipmentName: 'Servidor Principal Dell PowerEdge R750',
    equipmentCategory: 'TI Hardware',
    sector: 'TI Data Center',
    type: 'Preventiva',
    priority: 'Média',
    status: 'Concluída',
    requesterName: 'Rodrigo TI',
    requesterSector: 'T.I. & Sistemas',
    assignedTechnician: 'Rodrigo TI',
    description: 'Manutenção preventiva periódica do servidor de aplicação e atualização do firmware da controladora PERC.',
    diagnostic: 'Limpeza interna de poeira nos coolers, verificação de integridade dos discos RAID 10 e atualização de firmware concluída sem downtime.',
    openDate: '2026-07-15T19:00:00.000Z',
    completionDate: '2026-07-15T21:30:00.000Z',
    partsUsed: [],
    laborCost: 0.00,
    totalCost: 0.00
  },
  {
    id: 'OS-2026-0003',
    code: 'OS-2026-0003',
    equipmentId: 'EQP-TI-002',
    equipmentName: 'Impressora Térmica de Pulseiras e Receitas Zebra ZD421',
    equipmentCategory: 'TI Hardware',
    sector: 'Recepção 01',
    type: 'TI - Hardware',
    priority: 'Média',
    status: 'Em Execução',
    requesterName: 'Ana Paula (Recepção)',
    requesterSector: 'Recepção',
    assignedTechnician: 'Lucas TI',
    description: 'Falha no tracionamento da fita/pulseira e impressão borrada na recepção principal.',
    diagnostic: 'Alinhamento do rolo tracionador e ajuste da temperatura do cabeçote de impressão.',
    openDate: '2026-08-07T09:15:00.000Z',
    completionDate: null,
    partsUsed: [],
    laborCost: 0.00,
    totalCost: 0.00
  }
];

const getStoredEquipments = () => {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_EQUIPMENTS_KEY);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.warn('Erro ao ler equipments do localStorage:', e);
  }
  localStorage.setItem(LOCAL_STORAGE_EQUIPMENTS_KEY, JSON.stringify(INITIAL_EQUIPMENTS));
  return INITIAL_EQUIPMENTS;
};

const saveStoredEquipments = (equipments) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_EQUIPMENTS_KEY, JSON.stringify(equipments));
  } catch (e) {
    console.warn('Erro ao salvar equipments no localStorage:', e);
  }
};

const getStoredOrders = () => {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_ORDERS_KEY);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.warn('Erro ao ler service orders do localStorage:', e);
  }
  localStorage.setItem(LOCAL_STORAGE_ORDERS_KEY, JSON.stringify(INITIAL_SERVICE_ORDERS));
  return INITIAL_SERVICE_ORDERS;
};

const saveStoredOrders = (orders) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_ORDERS_KEY, JSON.stringify(orders));
  } catch (e) {
    console.warn('Erro ao salvar service orders no localStorage:', e);
  }
};

// ----------------------------------------------------------------------
// EQUIPMENT / ATIVOS APIS
// ----------------------------------------------------------------------

export const getEquipments = async () => {
  if (USE_MOCK) return getStoredEquipments();
  try {
    const { getFirestore, collection, getDocs } = await import('firebase/firestore');
    const db = getFirestore(app);
    const snap = await getDocs(collection(db, 'equipments'));
    const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    if (items.length === 0) {
      const { doc, writeBatch } = await import('firebase/firestore');
      const batch = writeBatch(db);
      const colRef = collection(db, 'equipments');
      for (const eq of INITIAL_EQUIPMENTS) {
        const newRef = doc(colRef);
        batch.set(newRef, { ...eq, createdAt: new Date().toISOString() });
      }
      await batch.commit();
      const newSnap = await getDocs(collection(db, 'equipments'));
      return newSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    }
    return items;
  } catch (err) {
    console.error('Erro ao carregar equipments do Firestore:', err);
    return getStoredEquipments();
  }
};

export const saveEquipment = async (equipmentData) => {
  if (USE_MOCK) {
    const list = getStoredEquipments();
    if (equipmentData.id) {
      const idx = list.findIndex(e => e.id === equipmentData.id);
      if (idx >= 0) list[idx] = { ...list[idx], ...equipmentData, updatedAt: new Date().toISOString() };
      else list.push({ ...equipmentData, createdAt: new Date().toISOString() });
    } else {
      const newId = `EQP-${Date.now().toString(36).toUpperCase()}`;
      equipmentData = { id: newId, ...equipmentData, createdAt: new Date().toISOString() };
      list.push(equipmentData);
    }
    saveStoredEquipments(list);
    return equipmentData;
  }

  try {
    const { getFirestore, collection, doc, setDoc, addDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    if (equipmentData.id) {
      await setDoc(doc(db, 'equipments', equipmentData.id), {
        ...equipmentData,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      return equipmentData;
    } else {
      const docRef = await addDoc(collection(db, 'equipments'), {
        ...equipmentData,
        createdAt: new Date().toISOString()
      });
      return { id: docRef.id, ...equipmentData };
    }
  } catch (err) {
    console.error('Erro ao salvar equipamento no Firestore:', err);
    return saveEquipment({ ...equipmentData });
  }
};

export const deleteEquipment = async (id) => {
  if (USE_MOCK) {
    const list = getStoredEquipments().filter(e => e.id !== id);
    saveStoredEquipments(list);
    return { success: true, id };
  }
  try {
    const { getFirestore, doc, deleteDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    await deleteDoc(doc(db, 'equipments', id));
    return { success: true, id };
  } catch (err) {
    console.error('Erro ao deletar equipamento no Firestore:', err);
    const list = getStoredEquipments().filter(e => e.id !== id);
    saveStoredEquipments(list);
    return { success: true, id };
  }
};

// ----------------------------------------------------------------------
// SERVICE ORDERS (ORDENS DE SERVIÇO) APIS
// ----------------------------------------------------------------------

export const getServiceOrders = async () => {
  if (USE_MOCK) return getStoredOrders();
  try {
    const { getFirestore, collection, getDocs } = await import('firebase/firestore');
    const db = getFirestore(app);
    const snap = await getDocs(collection(db, 'service_orders'));
    const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    if (items.length === 0) {
      const { doc, writeBatch } = await import('firebase/firestore');
      const batch = writeBatch(db);
      const colRef = collection(db, 'service_orders');
      for (const os of INITIAL_SERVICE_ORDERS) {
        const newRef = doc(colRef);
        batch.set(newRef, { ...os, createdAt: new Date().toISOString() });
      }
      await batch.commit();
      const newSnap = await getDocs(collection(db, 'service_orders'));
      return newSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    }
    return items;
  } catch (err) {
    console.error('Erro ao carregar service_orders do Firestore:', err);
    return getStoredOrders();
  }
};

export const saveServiceOrder = async (orderData) => {
  const isNew = !orderData.id;
  const now = new Date().toISOString();

  if (isNew) {
    const dateStr = new Date().getFullYear();
    const count = getStoredOrders().length + 1;
    const seqStr = String(count).padStart(4, '0');
    orderData.code = orderData.code || `OS-${dateStr}-${seqStr}`;
    orderData.openDate = orderData.openDate || now;
    orderData.status = orderData.status || 'Aberta';
    orderData.partsUsed = orderData.partsUsed || [];
    orderData.laborCost = Number(orderData.laborCost || 0);
    orderData.totalCost = Number(orderData.totalCost || 0);
  }

  if (USE_MOCK) {
    const list = getStoredOrders();
    if (!isNew) {
      const idx = list.findIndex(o => o.id === orderData.id);
      if (idx >= 0) list[idx] = { ...list[idx], ...orderData, updatedAt: now };
      else list.push({ ...orderData, createdAt: now });
    } else {
      const newId = `OS-${Date.now().toString(36).toUpperCase()}`;
      orderData = { id: newId, ...orderData, createdAt: now };
      list.push(orderData);
    }
    saveStoredOrders(list);
    return orderData;
  }

  try {
    const { getFirestore, collection, doc, setDoc, addDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    if (!isNew) {
      await setDoc(doc(db, 'service_orders', orderData.id), {
        ...orderData,
        updatedAt: now
      }, { merge: true });
      return orderData;
    } else {
      const docRef = await addDoc(collection(db, 'service_orders'), {
        ...orderData,
        createdAt: now
      });
      return { id: docRef.id, ...orderData };
    }
  } catch (err) {
    console.error('Erro ao salvar service order no Firestore:', err);
    return saveServiceOrder({ ...orderData });
  }
};

export const deleteServiceOrder = async (id) => {
  if (USE_MOCK) {
    const list = getStoredOrders().filter(o => o.id !== id);
    saveStoredOrders(list);
    return { success: true, id };
  }
  try {
    const { getFirestore, doc, deleteDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    await deleteDoc(doc(db, 'service_orders', id));
    return { success: true, id };
  } catch (err) {
    console.error('Erro ao deletar service order no Firestore:', err);
    const list = getStoredOrders().filter(o => o.id !== id);
    saveStoredOrders(list);
    return { success: true, id };
  }
};
