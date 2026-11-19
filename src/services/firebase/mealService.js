import { app } from './config';
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot
} from 'firebase/firestore';

const db = getFirestore(app);

const SETTINGS_DOC_ID = 'default';
const SETTINGS_COL = 'meal_settings';
const ORDERS_COL = 'meal_orders';
const EMPLOYEES_COL = 'employees';

export const DEFAULT_MEAL_SETTINGS = {
  lunchCutoff: '09:30',          // Horário limite para pedir para HOJE (padrão 09:30)
  advanceCutoff: '16:00',        // Horário limite na véspera para reservar AMANHÃ (padrão 16:00)
  chargeMode: 'coparticipation', // 'coparticipation' | 'integral'
  employeeCost: 5.00,
  supplierCost: 18.00,
  updatedAt: new Date().toISOString()
};

// ---------------------------------------------------------------------------
// CONFIGURAÇÕES DE REFEIÇÃO / MARMITAS
// ---------------------------------------------------------------------------
export async function getMealSettings() {
  try {
    const docRef = doc(db, SETTINGS_COL, SETTINGS_DOC_ID);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { ...DEFAULT_MEAL_SETTINGS, ...snap.data() };
    }
    // Inicializa configurações padrão se ainda não existirem
    await setDoc(docRef, DEFAULT_MEAL_SETTINGS);
    return DEFAULT_MEAL_SETTINGS;
  } catch (err) {
    console.warn('Erro ao carregar meal_settings do Firestore:', err);
    return DEFAULT_MEAL_SETTINGS;
  }
}

export async function updateMealSettings(newSettings) {
  const docRef = doc(db, SETTINGS_COL, SETTINGS_DOC_ID);
  const data = {
    ...DEFAULT_MEAL_SETTINGS,
    ...newSettings,
    lunchCutoff: String(newSettings.lunchCutoff || '09:30').trim(),
    advanceCutoff: String(newSettings.advanceCutoff || '16:00').trim(),
    chargeMode: newSettings.chargeMode === 'integral' ? 'integral' : 'coparticipation',
    employeeCost: Number(newSettings.employeeCost) || 0,
    supplierCost: Number(newSettings.supplierCost) || 0,
    updatedAt: new Date().toISOString()
  };
  await setDoc(docRef, data, { merge: true });
  return data;
}

// ---------------------------------------------------------------------------
// AUTENTICAÇÃO E CONTROLE DE SENHA DO COLABORADOR
// ---------------------------------------------------------------------------
export async function employeeMealLogin(rawCpf, password) {
  const cleanCpf = String(rawCpf || '').replace(/\D/g, '');
  if (!cleanCpf || cleanCpf.length !== 11) {
    return { success: false, error: 'CPF inválido. Digite os 11 números do documento.' };
  }

  const cleanPass = String(password || '').trim();
  if (!cleanPass) {
    return { success: false, error: 'Digite sua senha de acesso.' };
  }

  try {
    const snap = await getDocs(collection(db, EMPLOYEES_COL));
    let matchedEmp = null;

    snap.forEach((d) => {
      const data = d.data();
      const empCpfClean = String(data.cpf || '').replace(/\D/g, '');
      if (empCpfClean === cleanCpf) {
        matchedEmp = { id: d.id, ...data };
      }
    });

    if (!matchedEmp) {
      return { success: false, error: 'Colaborador não encontrado no quadro de funcionários do RH.' };
    }

    if (matchedEmp.status === 'Inativo') {
      return { success: false, error: 'Colaborador com cadastro inativo no RH.' };
    }

    // Regra de Senha:
    // Se o colaborador possui mealPassword salvo, compara diretamente.
    // Se não possui, a senha padrão são os primeiros 4 dígitos do CPF!
    const expectedPassword = matchedEmp.mealPassword
      ? String(matchedEmp.mealPassword).trim()
      : cleanCpf.slice(0, 4);

    if (cleanPass !== expectedPassword) {
      return {
        success: false,
        error: 'Senha incorreta. A senha inicial padrão corresponde aos 4 primeiros dígitos do seu CPF.'
      };
    }

    return {
      success: true,
      employee: {
        id: matchedEmp.id,
        name: matchedEmp.name,
        cpf: matchedEmp.cpf || cleanCpf,
        sector: matchedEmp.sector || matchedEmp.role || 'Geral',
        role: matchedEmp.role || 'Colaborador',
        unitId: matchedEmp.unitId || 'all'
      }
    };
  } catch (err) {
    console.error('Erro no login de marmitas:', err);
    return { success: false, error: 'Erro ao conectar ao servidor. Tente novamente.' };
  }
}

// Reseta a senha para o padrão (4 primeiros dígitos do CPF)
export async function resetEmployeeMealPassword(employeeId) {
  try {
    const docRef = doc(db, EMPLOYEES_COL, employeeId);
    await updateDoc(docRef, {
      mealPassword: null,
      mealPasswordResetAt: new Date().toISOString()
    });
    return { success: true };
  } catch (err) {
    console.error('Erro ao resetar senha de marmita:', err);
    throw err;
  }
}

// ---------------------------------------------------------------------------
// GESTÃO DE PEDIDOS E RESERVAS DE MARMITAS (EXCLUSIVO ALMOÇO)
// ---------------------------------------------------------------------------

// Verifica se o horário atual ultrapassou o horário limite (HH:mm)
export function isTimeCutoffPassed(cutoffTimeStr) {
  if (!cutoffTimeStr) return false;
  const now = new Date();
  const [cutHours, cutMinutes] = cutoffTimeStr.split(':').map(v => parseInt(v, 10));
  if (isNaN(cutHours) || isNaN(cutMinutes)) return false;

  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const limitMinutes = cutHours * 60 + cutMinutes;

  return currentMinutes > limitMinutes;
}

export async function createMealOrder({ employee, targetDate }) {
  const settings = await getMealSettings();
  const todayStr = getTodayDateStr();
  const tomorrowStr = getTomorrowDateStr();
  const orderDate = targetDate || todayStr;

  if (orderDate < todayStr) {
    throw new Error('Não é possível solicitar refeições para datas passadas.');
  }

  // Se o pedido for para hoje, valida o horário de corte do mesmo dia (padrão 09:30)
  if (orderDate === todayStr) {
    if (isTimeCutoffPassed(settings.lunchCutoff || '09:30')) {
      throw new Error(`Horário limite para solicitar almoço para hoje encerrou às ${settings.lunchCutoff || '09:30'}.`);
    }
  }

  // Se o pedido for reserva para amanhã, valida o horário de corte da véspera (padrão 16:00)
  if (orderDate === tomorrowStr) {
    if (isTimeCutoffPassed(settings.advanceCutoff || '16:00')) {
      throw new Error(`Horário limite para reservar o almoço de amanhã encerrou hoje às ${settings.advanceCutoff || '16:00'}.`);
    }
  }

  // Verifica se já existe pedido ativo para o mesmo funcionário na mesma data
  const q = query(
    collection(db, ORDERS_COL),
    where('employeeId', '==', employee.id),
    where('date', '==', orderDate)
  );

  const existingSnap = await getDocs(q);
  const activeExisting = existingSnap.docs
    .map(d => d.data())
    .find(o => o.status !== 'cancelado');

  if (activeExisting) {
    throw new Error(`Você já possui um pedido de almoço registrado para esta data.`);
  }

  // Define os valores conforme o modo de cobrança configurado
  const supplierCost = Number(settings.supplierCost) || 0;
  const discountValue = settings.chargeMode === 'integral'
    ? supplierCost
    : (Number(settings.employeeCost) || 0);

  const orderId = `ord-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const orderData = {
    id: orderId,
    employeeId: employee.id,
    employeeName: employee.name,
    employeeCpf: employee.cpf || '',
    sector: employee.sector || 'Geral',
    unitId: employee.unitId || 'all',
    date: orderDate,
    mealType: 'almoco',
    status: 'solicitado', // 'solicitado' | 'entregue' | 'cancelado'
    price: supplierCost,
    discountValue,
    chargeMode: settings.chargeMode,
    requestedAt: new Date().toISOString()
  };

  await setDoc(doc(db, ORDERS_COL, orderId), orderData);
  return orderData;
}

export async function cancelMealOrder(orderId, employeeId) {
  const orderRef = doc(db, ORDERS_COL, orderId);
  const snap = await getDoc(orderRef);
  if (!snap.exists()) {
    throw new Error('Pedido não localizado.');
  }

  const order = snap.data();
  if (employeeId && order.employeeId !== employeeId) {
    throw new Error('Permissão negada para cancelar este pedido.');
  }

  const settings = await getMealSettings();
  const todayStr = getTodayDateStr();
  const tomorrowStr = getTomorrowDateStr();

  if (order.date === todayStr) {
    if (isTimeCutoffPassed(settings.lunchCutoff || '09:30')) {
      throw new Error(`Cancelamento encerrado para o almoço de hoje após o horário de corte (${settings.lunchCutoff || '09:30'}).`);
    }
  } else if (order.date === tomorrowStr) {
    if (isTimeCutoffPassed(settings.advanceCutoff || '16:00')) {
      throw new Error(`Cancelamento da reserva de amanhã encerrado após as ${settings.advanceCutoff || '16:00'}.`);
    }
  }

  if (order.status === 'entregue') {
    throw new Error('Não é possível cancelar uma refeição que já foi entregue.');
  }

  await updateDoc(orderRef, {
    status: 'cancelado',
    cancelledAt: new Date().toISOString()
  });

  return { success: true };
}

export async function updateMealOrderStatus(orderId, newStatus) {
  const orderRef = doc(db, ORDERS_COL, orderId);
  const updatePayload = {
    status: newStatus,
    updatedAt: new Date().toISOString()
  };
  if (newStatus === 'entregue') {
    updatePayload.deliveredAt = new Date().toISOString();
  }
  await updateDoc(orderRef, updatePayload);
  return { success: true };
}

export async function deleteMealOrder(orderId) {
  await deleteDoc(doc(db, ORDERS_COL, orderId));
  return { success: true };
}

// Histórico de pedidos do colaborador logado
export async function getEmployeeOrders(employeeId) {
  try {
    const q = query(
      collection(db, ORDERS_COL),
      where('employeeId', '==', employeeId)
    );
    const snap = await getDocs(q);
    const orders = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    return orders.sort((a, b) => new Date(b.date || b.requestedAt).getTime() - new Date(a.date || a.requestedAt).getTime());
  } catch (err) {
    console.error('Erro ao buscar pedidos do funcionário:', err);
    return [];
  }
}

// Inscrição em tempo real para os pedidos de uma data específica (Painel da Nutrição)
export function subscribeDateMealOrders(dateStr, callback) {
  const q = query(
    collection(db, ORDERS_COL),
    where('date', '==', dateStr)
  );

  return onSnapshot(q, (snap) => {
    const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    list.sort((a, b) => (a.employeeName || '').localeCompare(b.employeeName || ''));
    callback(list);
  }, (err) => {
    console.error('Erro no listener de pedidos de marmitas:', err);
    callback([]);
  });
}

// Relatório mensal consolidado para o RH (Desconto em Folha)
export async function getMonthlyMealSummary(yearMonthStr) {
  try {
    const snap = await getDocs(collection(db, ORDERS_COL));
    const allOrders = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    const filtered = allOrders.filter(o => {
      if (o.status === 'cancelado') return false;
      const orderDate = String(o.date || '');
      return orderDate.startsWith(yearMonthStr);
    });

    // Agrupamento por Colaborador
    const map = {};
    filtered.forEach(o => {
      const empId = o.employeeId || o.employeeCpf || 'desconhecido';
      if (!map[empId]) {
        map[empId] = {
          employeeId: o.employeeId,
          employeeName: o.employeeName || 'Colaborador',
          employeeCpf: o.employeeCpf || '',
          sector: o.sector || 'Geral',
          unitId: o.unitId || 'all',
          totalOrders: 0,
          totalDiscount: 0,
          totalCost: 0,
          orders: []
        };
      }

      map[empId].totalOrders += 1;
      map[empId].totalDiscount += Number(o.discountValue) || 0;
      map[empId].totalCost += Number(o.price) || 0;
      map[empId].orders.push(o);
    });

    return Object.values(map).sort((a, b) => a.employeeName.localeCompare(b.employeeName));
  } catch (err) {
    console.error('Erro ao gerar resumo mensal de marmitas para o RH:', err);
    return [];
  }
}

export function getTodayDateStr() {
  const d = new Date();
  const year = d.getFullYear();
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getTomorrowDateStr() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  const year = d.getFullYear();
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}
