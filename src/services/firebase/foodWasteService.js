import { app } from './config';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot
} from 'firebase/firestore';

// Instância oficial do Firestore do NexAi-CLINIC (100% Cloud em nexa-index)
export const foodDb = getFirestore(app);

const CACHE_PREFIX = 'controle_sobras_fs_cache';

// Coleções oficiais no Firestore do NexAi-CLINIC
const COL_PRODUCTS = 'food_products';
const COL_ENTRIES = 'food_entries';
const COL_WASTE = 'food_waste';
const COL_AREAS = 'food_areas';

// Áreas padrão de produção da cozinha / nutrição
export const DEFAULT_AREAS = [
  { id: 'area-1', nome: 'Cozinha Quente' },
  { id: 'area-2', nome: 'Saladas' },
  { id: 'area-3', nome: 'Buffet' },
  { id: 'area-4', nome: 'Padaria' },
  { id: 'area-5', nome: 'Bebidas' },
];

function getLocalCache(key, fallback) {
  try {
    const raw = localStorage.getItem(`${CACHE_PREFIX}_${key}`);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function setLocalCache(key, data) {
  try {
    localStorage.setItem(`${CACHE_PREFIX}_${key}`, JSON.stringify(data));
  } catch (e) {
    console.error('Food cache write error:', e);
  }
}

// ---------------------------------------------------------------------------
// SINCRONIZAÇÃO EM TEMPO REAL & EVENTOS
// ---------------------------------------------------------------------------
const activeListeners = {};
const memoryCache = {};
const initPromises = {};

function notifySync() {
  window.dispatchEvent(new CustomEvent('food:sync'));
}

async function ensureFoodListener(colName, cacheKey, fallbackData = []) {
  if (!activeListeners[colName]) {
    activeListeners[colName] = true;

    initPromises[colName] = new Promise((resolve) => {
      let isResolved = false;

      const timeout = setTimeout(() => {
        if (!isResolved) {
          isResolved = true;
          if (!memoryCache[colName]) {
            memoryCache[colName] = getLocalCache(cacheKey, fallbackData);
          }
          resolve();
        }
      }, 3500);

      onSnapshot(collection(foodDb, colName), (snap) => {
        const items = [];
        snap.forEach((docSnap) => {
          items.push({ id: docSnap.id, ...docSnap.data() });
        });

        memoryCache[colName] = items;
        setLocalCache(cacheKey, items);
        notifySync();

        if (!isResolved) {
          isResolved = true;
          clearTimeout(timeout);
          resolve();
        }
      }, (err) => {
        console.error(`Erro no onSnapshot de ${colName}:`, err);
        if (!isResolved) {
          isResolved = true;
          clearTimeout(timeout);
          if (!memoryCache[colName]) {
            memoryCache[colName] = getLocalCache(cacheKey, fallbackData);
          }
          resolve();
        }
      });
    });
  }

  if (initPromises[colName]) {
    await initPromises[colName];
  }

  return memoryCache[colName] || getLocalCache(cacheKey, fallbackData);
}

// ---------------------------------------------------------------------------
// PRODUTOS ALIMENTÍCIOS
// ---------------------------------------------------------------------------
export async function getFoodProducts() {
  const items = await ensureFoodListener(COL_PRODUCTS, 'products', []);
  return items.map(p => ({
    ...p,
    custo_unitario: Number(p.custo_unitario) || 0,
    ativo: p.ativo !== false
  })).sort((a, b) => (a.nome || '').localeCompare(b.nome || ''));
}

export async function createFoodProduct(prodData) {
  const id = prodData.id || `prod-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const item = {
    id,
    nome: String(prodData.nome || '').trim(),
    unidade: String(prodData.unidade || 'un').trim(),
    custo_unitario: Number(prodData.custo_unitario) || 0,
    ativo: prodData.ativo !== false,
    criado_em: prodData.criado_em || new Date().toISOString()
  };

  await setDoc(doc(foodDb, COL_PRODUCTS, id), item);

  const current = memoryCache[COL_PRODUCTS] || [];
  const updated = [...current.filter(p => p.id !== id), item];
  memoryCache[COL_PRODUCTS] = updated;
  setLocalCache('products', updated);
  notifySync();
  return item;
}

export async function updateFoodProduct(id, prodData) {
  const current = memoryCache[COL_PRODUCTS] || [];
  const existing = current.find(p => p.id === id) || {};
  const item = {
    ...existing,
    ...prodData,
    id,
    custo_unitario: Number(prodData.custo_unitario !== undefined ? prodData.custo_unitario : existing.custo_unitario) || 0,
    ativo: prodData.ativo !== undefined ? prodData.ativo : existing.ativo !== false,
    atualizado_em: new Date().toISOString()
  };

  await setDoc(doc(foodDb, COL_PRODUCTS, id), item, { merge: true });

  const updated = current.map(p => p.id === id ? item : p);
  memoryCache[COL_PRODUCTS] = updated;
  setLocalCache('products', updated);
  notifySync();
  return item;
}

export async function toggleFoodProductActive(id) {
  const prods = await getFoodProducts();
  const prod = prods.find(p => p.id === id);
  if (!prod) return;
  return updateFoodProduct(id, { ativo: !prod.ativo });
}

export async function deleteFoodProduct(id) {
  await deleteDoc(doc(foodDb, COL_PRODUCTS, id));
  const current = memoryCache[COL_PRODUCTS] || [];
  const updated = current.filter(p => p.id !== id);
  memoryCache[COL_PRODUCTS] = updated;
  setLocalCache('products', updated);
  notifySync();
}

// ---------------------------------------------------------------------------
// ENTRADAS DE ALIMENTOS
// ---------------------------------------------------------------------------
export async function getFoodEntries() {
  const [entries, products] = await Promise.all([
    ensureFoodListener(COL_ENTRIES, 'entries', []),
    getFoodProducts()
  ]);

  const prodMap = {};
  products.forEach(p => { prodMap[p.id] = p; });

  return entries.map(e => ({
    ...e,
    quantidade: Number(e.quantidade) || 0,
    custo_unitario: Number(e.custo_unitario) || 0,
    custo_total: Number(e.custo_total) || 0,
    produto: prodMap[e.produto_id] || e.produto || { nome: 'Insumo', unidade: 'un', custo_unitario: 0 }
  })).sort((a, b) => {
    const da = parseLocalDate(a.data_entrada || a.criado_em).getTime();
    const db = parseLocalDate(b.data_entrada || b.criado_em).getTime();
    return db - da;
  });
}

export async function createFoodEntry(entryData) {
  const id = entryData.id || `ent-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const item = {
    id,
    produto_id: entryData.produto_id,
    quantidade: Number(entryData.quantidade) || 0,
    custo_unitario: Number(entryData.custo_unitario) || 0,
    custo_total: Number(entryData.custo_total) || 0,
    observacao: entryData.observacao ? String(entryData.observacao).trim() : '',
    data_entrada: entryData.data_entrada || formatDateInput(new Date()),
    criado_em: entryData.criado_em || new Date().toISOString()
  };

  await setDoc(doc(foodDb, COL_ENTRIES, id), item);

  const current = memoryCache[COL_ENTRIES] || [];
  const updated = [item, ...current.filter(e => e.id !== id)];
  memoryCache[COL_ENTRIES] = updated;
  setLocalCache('entries', updated);
  notifySync();
  return item;
}

export async function updateFoodEntry(id, entryData) {
  const current = memoryCache[COL_ENTRIES] || [];
  const existing = current.find(e => e.id === id) || {};
  const item = {
    ...existing,
    ...entryData,
    id,
    quantidade: Number(entryData.quantidade !== undefined ? entryData.quantidade : existing.quantidade) || 0,
    custo_unitario: Number(entryData.custo_unitario !== undefined ? entryData.custo_unitario : existing.custo_unitario) || 0,
    custo_total: Number(entryData.custo_total !== undefined ? entryData.custo_total : existing.custo_total) || 0,
    atualizado_em: new Date().toISOString()
  };

  await setDoc(doc(foodDb, COL_ENTRIES, id), item, { merge: true });

  const updated = current.map(e => e.id === id ? item : e);
  memoryCache[COL_ENTRIES] = updated;
  setLocalCache('entries', updated);
  notifySync();
  return item;
}

export async function deleteFoodEntry(id) {
  await deleteDoc(doc(foodDb, COL_ENTRIES, id));
  const current = memoryCache[COL_ENTRIES] || [];
  const updated = current.filter(e => e.id !== id);
  memoryCache[COL_ENTRIES] = updated;
  setLocalCache('entries', updated);
  notifySync();
}

// ---------------------------------------------------------------------------
// SOBRAS & DESPERDÍCIO DE ALIMENTOS
// ---------------------------------------------------------------------------
export async function getFoodWaste() {
  const [waste, products, areas] = await Promise.all([
    ensureFoodListener(COL_WASTE, 'waste', []),
    getFoodProducts(),
    getFoodAreas()
  ]);

  const prodMap = {};
  products.forEach(p => { prodMap[p.id] = p; });

  const areaMap = {};
  areas.forEach(a => { areaMap[a.id] = a; });

  return waste.map(w => ({
    ...w,
    quantidade: Number(w.quantidade) || 0,
    valor_perda: Number(w.valor_perda) || 0,
    produto: prodMap[w.produto_id] || w.produto || { nome: 'Insumo', unidade: 'un', custo_unitario: 0 },
    area: areaMap[w.area_id] || w.area || { nome: 'Produção' }
  })).sort((a, b) => {
    const da = parseLocalDate(a.data_sobra || a.criado_em).getTime();
    const db = parseLocalDate(b.data_sobra || b.criado_em).getTime();
    return db - da;
  });
}

export async function createFoodWaste(wasteData) {
  const id = wasteData.id || `sob-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const item = {
    id,
    produto_id: wasteData.produto_id,
    area_id: wasteData.area_id || 'area-1',
    quantidade: Number(wasteData.quantidade) || 0,
    valor_perda: Number(wasteData.valor_perda) || 0,
    motivo: wasteData.motivo ? String(wasteData.motivo).trim() : 'Outros',
    data_sobra: wasteData.data_sobra || formatDateInput(new Date()),
    criado_em: wasteData.criado_em || new Date().toISOString()
  };

  await setDoc(doc(foodDb, COL_WASTE, id), item);

  const current = memoryCache[COL_WASTE] || [];
  const updated = [item, ...current.filter(w => w.id !== id)];
  memoryCache[COL_WASTE] = updated;
  setLocalCache('waste', updated);
  notifySync();
  return item;
}

export async function updateFoodWaste(id, wasteData) {
  const current = memoryCache[COL_WASTE] || [];
  const existing = current.find(w => w.id === id) || {};
  const item = {
    ...existing,
    ...wasteData,
    id,
    quantidade: Number(wasteData.quantidade !== undefined ? wasteData.quantidade : existing.quantidade) || 0,
    valor_perda: Number(wasteData.valor_perda !== undefined ? wasteData.valor_perda : existing.valor_perda) || 0,
    atualizado_em: new Date().toISOString()
  };

  await setDoc(doc(foodDb, COL_WASTE, id), item, { merge: true });

  const updated = current.map(w => w.id === id ? item : w);
  memoryCache[COL_WASTE] = updated;
  setLocalCache('waste', updated);
  notifySync();
  return item;
}

export async function deleteFoodWaste(id) {
  await deleteDoc(doc(foodDb, COL_WASTE, id));
  const current = memoryCache[COL_WASTE] || [];
  const updated = current.filter(w => w.id !== id);
  memoryCache[COL_WASTE] = updated;
  setLocalCache('waste', updated);
  notifySync();
}

// ---------------------------------------------------------------------------
// ÁREAS DA COZINHA
// ---------------------------------------------------------------------------
export async function getFoodAreas() {
  const items = await ensureFoodListener(COL_AREAS, 'areas', DEFAULT_AREAS);
  if (!items || items.length === 0) {
    return DEFAULT_AREAS;
  }
  return items;
}

export async function createFoodArea(areaData) {
  const id = areaData.id || `area-${Date.now()}`;
  const item = {
    id,
    nome: String(areaData.nome || '').trim(),
    criado_em: new Date().toISOString()
  };
  await setDoc(doc(foodDb, COL_AREAS, id), item);
  const current = memoryCache[COL_AREAS] || DEFAULT_AREAS;
  const updated = [...current.filter(a => a.id !== id), item];
  memoryCache[COL_AREAS] = updated;
  setLocalCache('areas', updated);
  notifySync();
  return item;
}

// ---------------------------------------------------------------------------
// UTILITÁRIOS DE DATA E FORMATAÇÃO (SEM BUG DE FUSO GMT-3)
// ---------------------------------------------------------------------------
export function parseLocalDate(dateInput) {
  if (!dateInput) return new Date();

  if (typeof dateInput === 'object' && dateInput !== null) {
    if (typeof dateInput.toDate === 'function') {
      dateInput = dateInput.toDate();
    } else if (typeof dateInput.seconds === 'number') {
      dateInput = new Date(dateInput.seconds * 1000);
    }
  }

  if (dateInput instanceof Date) {
    if (isNaN(dateInput.getTime())) return new Date();
    return new Date(dateInput.getFullYear(), dateInput.getMonth(), dateInput.getDate(), 12, 0, 0);
  }

  const clean = String(dateInput).trim();
  if (!clean) return new Date();

  const datePart = clean.split('T')[0].split(' ')[0];

  if (datePart.includes('-')) {
    const parts = datePart.split('-');
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
          return new Date(year, month, day, 12, 0, 0);
        }
      } else if (parts[2].length === 4) {
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const year = parseInt(parts[2], 10);
        if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
          return new Date(year, month, day, 12, 0, 0);
        }
      }
    }
  }

  if (datePart.includes('/')) {
    const parts = datePart.split('/');
    if (parts.length === 3) {
      if (parts[2].length === 4) {
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const year = parseInt(parts[2], 10);
        if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
          return new Date(year, month, day, 12, 0, 0);
        }
      } else if (parts[0].length === 4) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
          return new Date(year, month, day, 12, 0, 0);
        }
      }
    }
  }

  const d = new Date(clean);
  if (!isNaN(d.getTime())) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12, 0, 0);
  }

  return new Date();
}

export function formatDateBR(dateInput) {
  if (!dateInput) return '—';
  const d = parseLocalDate(dateInput);
  if (isNaN(d.getTime())) return String(dateInput);
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

export function formatDateInput(dateInput) {
  const d = parseLocalDate(dateInput);
  const year = d.getFullYear();
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatCurrency(value) {
  const num = typeof value === 'string' ? parseFloat(value) : typeof value === 'number' ? value : 0;
  if (isNaN(num)) return 'R$ 0,00';
  return `R$ ${num.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatNumber(value, decimals = 2) {
  const num = typeof value === 'string' ? parseFloat(value) : typeof value === 'number' ? value : 0;
  if (isNaN(num)) return '0,00';
  return num.toLocaleString('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatQuantity(value, unit) {
  const num = typeof value === 'string' ? parseFloat(value) : typeof value === 'number' ? value : 0;
  const formatted = num.toLocaleString('pt-BR', {
    minimumFractionDigits: num % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });
  return unit ? `${formatted} ${unit}` : formatted;
}
