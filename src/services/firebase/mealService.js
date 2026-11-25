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
const PACKAGES_COL = 'meal_packages';
const EMPLOYEES_COL = 'employees';

export const MEAL_PACKAGE_SIZES = [15, 22, 26];

export const DEFAULT_MEAL_SETTINGS = {
  lunchCutoff: '09:30',          // Horário limite para pedir para HOJE (padrão 09:30)
  advanceCutoff: '16:00',        // Horário limite na véspera para reservar AMANHÃ (padrão 16:00)
  chargeMode: 'coparticipation', // 'coparticipation' | 'integral'
  employeeCost: 5.00,
  supplierCost: 18.00,
  packageMealPrice: 2.00,        // Valor unitário da refeição nos pacotes de vale refeição (R$ 2,00)
  requirePackage: true,          // Exige saldo de pacote liberado pelo RH para pedir almoço
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
  const current = await getMealSettings();
  const data = {
    ...DEFAULT_MEAL_SETTINGS,
    ...current,
    ...newSettings,
    lunchCutoff: String(newSettings.lunchCutoff ?? current.lunchCutoff ?? '09:30').trim(),
    advanceCutoff: String(newSettings.advanceCutoff ?? current.advanceCutoff ?? '16:00').trim(),
    chargeMode: (newSettings.chargeMode ?? current.chargeMode) === 'integral' ? 'integral' : 'coparticipation',
    employeeCost: Number(newSettings.employeeCost ?? current.employeeCost ?? 5.00) || 0,
    supplierCost: Number(newSettings.supplierCost ?? current.supplierCost ?? 18.00) || 0,
    packageMealPrice: Number(newSettings.packageMealPrice ?? current.packageMealPrice ?? 2.00) || 0,
    requirePackage: typeof newSettings.requirePackage === 'boolean'
      ? newSettings.requirePackage
      : (current.requirePackage !== false),
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

  // Verifica saldo de pacote de vale refeição do colaborador
  const empPackages = await getEmployeeMealPackages(employee.id);
  const activePkg = empPackages
    .filter(p => p.status === 'ativo' && (Number(p.remainingMeals) || 0) > 0)
    .sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime())[0];

  if (!activePkg && settings.requirePackage !== false) {
    throw new Error('Você não possui saldo de refeições disponível. Procure o RH para liberar um pacote de vale refeição.');
  }

  // Define os valores conforme o modo de cobrança configurado
  const supplierCost = Number(settings.supplierCost) || 0;
  let discountValue = settings.chargeMode === 'integral'
    ? supplierCost
    : (Number(settings.employeeCost) || 0);
  let paymentSource = 'avulso';
  let packageId = null;
  let packageUnitPrice = null;

  if (activePkg) {
    paymentSource = 'pacote';
    packageId = activePkg.id;
    packageUnitPrice = Number(activePkg.unitPrice) || 0;
    discountValue = 0; // Já cobrado na liberação do pacote em folha

    const newUsed = (Number(activePkg.usedMeals) || 0) + 1;
    const newRemaining = Math.max(0, (Number(activePkg.remainingMeals) || 0) - 1);
    await updateDoc(doc(db, PACKAGES_COL, activePkg.id), {
      usedMeals: newUsed,
      remainingMeals: newRemaining,
      status: newRemaining === 0 ? 'concluido' : 'ativo',
      updatedAt: new Date().toISOString()
    });
  }

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
    paymentSource,
    packageId,
    packageUnitPrice,
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

  if (order.status === 'cancelado') {
    throw new Error('Este pedido já foi cancelado.');
  }

  // Estorna 1 refeição para o pacote caso o pedido tenha utilizado saldo de pacote
  if (order.paymentSource === 'pacote' && order.packageId) {
    try {
      const pkgRef = doc(db, PACKAGES_COL, order.packageId);
      const pkgSnap = await getDoc(pkgRef);
      if (pkgSnap.exists()) {
        const pkg = pkgSnap.data();
        if (pkg.status !== 'cancelado') {
          const newUsed = Math.max(0, (Number(pkg.usedMeals) || 0) - 1);
          const newRemaining = Math.min(Number(pkg.quantity) || 999, (Number(pkg.remainingMeals) || 0) + 1);
          await updateDoc(pkgRef, {
            usedMeals: newUsed,
            remainingMeals: newRemaining,
            status: newRemaining > 0 ? 'ativo' : 'concluido',
            updatedAt: new Date().toISOString()
          });
        }
      }
    } catch (pkgErr) {
      console.warn('Erro ao estornar refeição para o pacote:', pkgErr);
    }
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

// ---------------------------------------------------------------------------
// PACOTES DE VALE REFEIÇÃO (LIBERAÇÃO PELO RH / DESCONTO EM FOLHA)
// ---------------------------------------------------------------------------
export async function createMealPackage({ employee, quantity, referenceMonth, createdBy, notes = '' }) {
  if (!employee || !employee.id) {
    throw new Error('Selecione um colaborador válido.');
  }
  const qty = Number(quantity);
  if (!qty || qty <= 0) {
    throw new Error('Selecione um pacote de refeições válido.');
  }

  const settings = await getMealSettings();
  const unitPrice = Number(settings.packageMealPrice ?? 2.00);
  const totalValue = Number((qty * unitPrice).toFixed(2));
  const refMonth = referenceMonth || getTodayDateStr().slice(0, 7);

  const pkgId = `pkg-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const pkgData = {
    id: pkgId,
    employeeId: employee.id,
    employeeName: employee.name || 'Colaborador',
    employeeCpf: employee.cpf || '',
    sector: employee.sector || employee.role || 'Geral',
    unitId: employee.unitId || 'all',
    quantity: qty,
    usedMeals: 0,
    remainingMeals: qty,
    unitPrice,
    totalValue,
    referenceMonth: refMonth,
    status: 'ativo', // 'ativo' | 'concluido' | 'cancelado'
    createdBy: createdBy || 'RH',
    notes: String(notes || '').trim(),
    createdAt: new Date().toISOString()
  };

  await setDoc(doc(db, PACKAGES_COL, pkgId), pkgData);
  return pkgData;
}

export async function getMealPackages(yearMonthStr = null) {
  try {
    const snap = await getDocs(collection(db, PACKAGES_COL));
    let list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    if (yearMonthStr) {
      list = list.filter(p => String(p.referenceMonth || String(p.createdAt || '').slice(0, 7)) === yearMonthStr);
    }
    return list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  } catch (err) {
    console.error('Erro ao buscar pacotes de vale refeição:', err);
    return [];
  }
}

export async function getEmployeeMealPackages(employeeId) {
  if (!employeeId) return [];
  try {
    const q = query(
      collection(db, PACKAGES_COL),
      where('employeeId', '==', employeeId)
    );
    const snap = await getDocs(q);
    return snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .filter(p => p.status !== 'cancelado')
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  } catch (err) {
    console.error('Erro ao buscar pacotes do colaborador:', err);
    return [];
  }
}

export async function cancelMealPackage(packageId) {
  const pkgRef = doc(db, PACKAGES_COL, packageId);
  const snap = await getDoc(pkgRef);
  if (!snap.exists()) {
    throw new Error('Pacote não encontrado.');
  }
  const pkg = snap.data();
  if ((Number(pkg.usedMeals) || 0) > 0) {
    throw new Error('Não é possível cancelar um pacote que já possui refeições consumidas.');
  }
  await updateDoc(pkgRef, {
    status: 'cancelado',
    cancelledAt: new Date().toISOString()
  });
  return { success: true };
}

// Relatório mensal consolidado para o RH (Desconto em Folha: Pacotes + Avulsos)
export async function getMonthlyMealSummary(yearMonthStr) {
  try {
    const [ordersSnap, packagesList] = await Promise.all([
      getDocs(collection(db, ORDERS_COL)),
      getMealPackages(yearMonthStr)
    ]);

    const allOrders = ordersSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    const filteredOrders = allOrders.filter(o => {
      if (o.status === 'cancelado') return false;
      const orderDate = String(o.date || '');
      return orderDate.startsWith(yearMonthStr);
    });

    const activePackages = packagesList.filter(p => p.status !== 'cancelado');

    // Agrupamento por Colaborador
    const map = {};
    const ensureEntry = (item) => {
      const empId = item.employeeId || item.employeeCpf || 'desconhecido';
      if (!map[empId]) {
        map[empId] = {
          employeeId: item.employeeId,
          employeeName: item.employeeName || 'Colaborador',
          employeeCpf: item.employeeCpf || '',
          sector: item.sector || 'Geral',
          unitId: item.unitId || 'all',
          totalOrders: 0,
          totalDiscount: 0,
          totalCost: 0,
          totalPackages: 0,
          packageMealsBought: 0,
          packageDiscount: 0,
          orders: [],
          packages: []
        };
      }
      return map[empId];
    };

    filteredOrders.forEach(o => {
      const entry = ensureEntry(o);
      entry.totalOrders += 1;
      entry.totalDiscount += Number(o.discountValue) || 0;
      entry.totalCost += Number(o.price) || 0;
      entry.orders.push(o);
    });

    activePackages.forEach(p => {
      const entry = ensureEntry(p);
      entry.totalPackages += 1;
      entry.packageMealsBought += Number(p.quantity) || 0;
      entry.packageDiscount += Number(p.totalValue) || 0;
      entry.totalDiscount += Number(p.totalValue) || 0;
      entry.packages.push(p);
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
