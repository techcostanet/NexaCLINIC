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
  lunchCutoff: '09:30',
  dinnerCutoff: '15:30',
  chargeMode: 'coparticipation', // 'coparticipation' | 'integral'
  employeeCost: 5.00,
  supplierCost: 18.00,
  activeMeals: ['almoco', 'jantar'],
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
    dinnerCutoff: String(newSettings.dinnerCutoff || '15:30').trim(),
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
// GESTÃO DE PEDIDOS DE MARMITAS
// ---------------------------------------------------------------------------

// Verifica se o horário atual ultrapassou o horário de corte
export function isMealCutoffPassed(mealType, cutoffTimeStr) {
  if (!cutoffTimeStr) return false;
  const now = new Date();
  const [cutHours, cutMinutes] = cutoffTimeStr.split(':').map(v => parseInt(v, 10));
  if (isNaN(cutHours) || isNaN(cutMinutes)) return false;

  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const limitMinutes = cutHours * 60 + cutMinutes;

  return currentMinutes > limitMinutes;
}

export async function createMealOrder({ employee, mealType = 'almoco', targetDate }) {
  const settings = await getMealSettings();
  const todayStr = getTodayDateStr();
  const orderDate = targetDate || todayStr;

  // Validação de horário limite se o pedido for para hoje
  if (orderDate === todayStr) {
    const cutoff = mealType === 'jantar' ? settings.dinnerCutoff : settings.lunchCutoff;
    if (isMealCutoffPassed(mealType, cutoff)) {
      const mealLabel = mealType === 'jantar' ? 'Jantar' : 'Almoço';
      throw new Error(`Horário limite para solicitar ${mealLabel} foi encerrado hoje às ${cutoff}.`);
    }
  }

  // Verifica se já existe pedido ativo para o mesmo funcionário, data e tipo de refeição
  const q = query(
    collection(db, ORDERS_COL),
    where('employeeId', '==', employee.id),
    where('date', '==', orderDate),
    where('mealType', '==', mealType)
  );

  const existingSnap = await getDocs(q);
  const activeExisting = existingSnap.docs
    .map(d => d.data())
    .find(o => o.status !== 'cancelado');

  if (activeExisting) {
    const mealLabel = mealType === 'jantar' ? 'Jantar' : 'Almoço';
    throw new Error(`Você já possui um pedido de ${mealLabel} registrado para esta data.`);
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
    mealType,
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

  if (order.date === todayStr) {
    const cutoff = order.mealType === 'jantar' ? settings.dinnerCutoff : settings.lunchCutoff;
    if (isMealCutoffPassed(order.mealType, cutoff)) {
      const mealLabel = order.mealType === 'jantar' ? 'Jantar' : 'Almoço';
      throw new Error(`Cancelamento encerrado para ${mealLabel} após o horário de corte (${cutoff}).`);
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
    return orders.sort((a, b) => new Date(b.requestedAt || b.date).getTime() - new Date(a.requestedAt || a.date).getTime());
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
          totalAlmoco: 0,
          totalJantar: 0,
          totalDiscount: 0,
          totalCost: 0,
          orders: []
        };
      }

      map[empId].totalOrders += 1;
      if (o.mealType === 'jantar') {
        map[empId].totalJantar += 1;
      } else {
        map[empId].totalAlmoco += 1;
      }
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
