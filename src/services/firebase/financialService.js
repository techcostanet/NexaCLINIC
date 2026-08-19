import { app } from './config';
import { USE_MOCK, mockFirestore } from './mockDb';

export const getAccountsPayable = async () => {
    if (USE_MOCK) return mockFirestore.getAccountsPayable();
    try {
      const { getFirestore, collection, getDocs } = await import('firebase/firestore');
      const db = getFirestore(app);
      const snap = await getDocs(collection(db, 'accounts_payable'));
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (e) {
      console.error('Erro Firestore export const getAccountsPayable =', e);
      return [];
    }
  };

export const saveAccountsPayable = async (item) => {
    if (USE_MOCK) return mockFirestore.saveAccountsPayable(item);
    const { getFirestore, collection, addDoc, doc, setDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    if (item.id) {
      await setDoc(doc(db, 'accounts_payable', item.id), item, { merge: true });
      return item;
    }
    const ref = await addDoc(collection(db, 'accounts_payable'), { ...item, createdAt: new Date().toISOString() });
    return { id: ref.id, ...item };
  };

export const deleteAccountsPayable = async (id) => {
    if (USE_MOCK) return mockFirestore.deleteAccountsPayable(id);
    const { getFirestore, doc, deleteDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    await deleteDoc(doc(db, 'accounts_payable', id));
    return { success: true };
  };

export const getAccountsReceivable = async () => {
    if (USE_MOCK) return mockFirestore.getAccountsReceivable();
    try {
      const { getFirestore, collection, getDocs } = await import('firebase/firestore');
      const db = getFirestore(app);
      const snap = await getDocs(collection(db, 'accounts_receivable'));
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (e) {
      console.error('Erro Firestore export const getAccountsReceivable =', e);
      return [];
    }
  };

export const saveAccountsReceivable = async (item) => {
    if (USE_MOCK) return mockFirestore.saveAccountsReceivable(item);
    const { getFirestore, collection, addDoc, doc, setDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    if (item.id) {
      await setDoc(doc(db, 'accounts_receivable', item.id), item, { merge: true });
      return item;
    }
    const ref = await addDoc(collection(db, 'accounts_receivable'), { ...item, createdAt: new Date().toISOString() });
    return { id: ref.id, ...item };
  };

export const deleteAccountsReceivable = async (id) => {
    if (USE_MOCK) return mockFirestore.deleteAccountsReceivable(id);
    const { getFirestore, doc, deleteDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    await deleteDoc(doc(db, 'accounts_receivable', id));
    return { success: true };
  };

export const getBankStatements = async () => {
    if (USE_MOCK) return mockFirestore.getBankStatements();
    try {
      const { getFirestore, collection, getDocs } = await import('firebase/firestore');
      const db = getFirestore(app);
      const snap = await getDocs(collection(db, 'bank_statements'));
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (e) {
      console.error('Erro Firestore export const getBankStatements =', e);
      return [];
    }
  };

export const saveBankStatement = async (statementData) => {
    if (USE_MOCK) return mockFirestore.saveBankStatement(statementData);
    const { getFirestore, collection, addDoc, doc, setDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    if (statementData.id) {
      await setDoc(doc(db, 'bank_statements', statementData.id), statementData, { merge: true });
      return statementData;
    }
    const ref = await addDoc(collection(db, 'bank_statements'), { ...statementData, createdAt: new Date().toISOString() });
    return { id: ref.id, ...statementData };
  };

export const getDebts = async () => {
    if (USE_MOCK) return mockFirestore.getDebts();
    try {
      const { getFirestore, collection, getDocs } = await import('firebase/firestore');
      const db = getFirestore(app);
      const snap = await getDocs(collection(db, 'debts'));
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (e) {
      console.error('Erro Firestore export const getDebts =', e);
      return [];
    }
  };

export const saveDebt = async (debtData) => {
    if (USE_MOCK) return mockFirestore.saveDebt(debtData);
    const { getFirestore, collection, addDoc, doc, setDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    if (debtData.id) {
      await setDoc(doc(db, 'debts', debtData.id), debtData, { merge: true });
      return debtData;
    }
    const ref = await addDoc(collection(db, 'debts'), { ...debtData, createdAt: new Date().toISOString() });
    return { id: ref.id, ...debtData };
  };

export const deleteDebt = async (id) => {
    if (USE_MOCK) return mockFirestore.deleteDebt(id);
    const { getFirestore, doc, deleteDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    await deleteDoc(doc(db, 'debts', id));
    return { success: true };
  };

export const getPurchases = async () => {
    if (USE_MOCK) {
      const data = localStorage.getItem('sistema_indicadores_purchases');
      return data ? JSON.parse(data) : [];
    }
    try {
      const { getFirestore, collection, getDocs } = await import('firebase/firestore');
      const db = getFirestore(app);
      const snap = await getDocs(collection(db, 'purchases'));
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (e) {
      console.error("Erro ao ler purchases do Firestore:", e);
      return [];
    }
  };

export const createPurchase = async (purchaseData) => {
    if (USE_MOCK) {
      const data = localStorage.getItem('sistema_indicadores_purchases');
      const list = data ? JSON.parse(data) : [];
      const newPurchase = { id: 'pur_' + Math.random().toString(36).substr(2, 9), ...purchaseData, createdAt: new Date().toISOString() };
      list.push(newPurchase);
      localStorage.setItem('sistema_indicadores_purchases', JSON.stringify(list));
      return newPurchase;
    }
    const { getFirestore, collection, addDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    const docRef = await addDoc(collection(db, 'purchases'), {
      ...purchaseData,
      createdAt: new Date().toISOString()
    });
    return { id: docRef.id, ...purchaseData };
  };

export const updatePurchase = async (id, purchaseData) => {
    if (USE_MOCK) {
      const data = localStorage.getItem('sistema_indicadores_purchases');
      let list = data ? JSON.parse(data) : [];
      list = list.map(item => item.id === id ? { ...item, ...purchaseData, updatedAt: new Date().toISOString() } : item);
      localStorage.setItem('sistema_indicadores_purchases', JSON.stringify(list));
      return { id, ...purchaseData };
    }
    const { getFirestore, doc, updateDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    await updateDoc(doc(db, 'purchases', id), {
      ...purchaseData,
      updatedAt: new Date().toISOString()
    });
    return { id, ...purchaseData };
  };

export const getPurchaseInvoices = async () => {
    if (USE_MOCK) return mockFirestore.getPurchaseInvoices();
    try {
      const { getFirestore, collection, getDocs } = await import('firebase/firestore');
      const db = getFirestore(app);
      const snap = await getDocs(collection(db, 'purchase_invoices'));
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (e) {
      console.error("Erro ao carregar purchase_invoices do Firestore:", e);
      return [];
    }
  };

export const createPurchaseInvoice = async (invoiceData) => {
    if (USE_MOCK) return mockFirestore.createPurchaseInvoice(invoiceData);
    const { getFirestore, collection, doc, writeBatch, getDoc, updateDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    const batch = writeBatch(db);
    
    const invoiceRef = doc(collection(db, 'purchase_invoices'));
    const entryDate = new Date().toISOString().substring(0, 10);
    const invoiceRecord = {
      ...invoiceData,
      id: invoiceRef.id,
      entryDate,
      status: 'Processada'
    };
    batch.set(invoiceRef, invoiceRecord);

    for (const item of (invoiceData.items || [])) {
      if (!item.itemId) continue;
      const txRef = doc(collection(db, 'stock_transactions'));
      batch.set(txRef, {
        id: txRef.id,
        itemId: item.itemId,
        itemName: item.name,
        quantity: parseFloat(item.quantity) || 0,
        type: 'Entrada',
        batch: item.batch || 'NF-IMPORT',
        expiryDate: item.expiryDate || '',
        operator: 'Importador de Notas',
        date: new Date().toISOString(),
        notes: `Entrada via NF-e ${invoiceData.number}`
      });
    }
    await batch.commit();

    // Abastece efetivamente o estoque dos produtos no Firestore
    for (const item of (invoiceData.items || [])) {
      if (!item.itemId) continue;
      try {
        const itemRef = doc(db, 'inventory_items', item.itemId);
        const itemSnap = await getDoc(itemRef);
        if (itemSnap.exists()) {
          const current = parseFloat(itemSnap.data().currentStock) || 0;
          const added = parseFloat(item.quantity) || 0;
          await updateDoc(itemRef, { currentStock: current + added });
        }
      } catch (err) {
        console.error(`Erro ao atualizar saldo de ${item.itemId}:`, err);
      }
    }

    return invoiceRecord;
  };

export const getXmlImports = async () => {
    if (USE_MOCK) return mockFirestore.getXmlImports();
    try {
      const { getFirestore, collection, getDocs } = await import('firebase/firestore');
      const db = getFirestore(app);
      const snap = await getDocs(collection(db, 'xml_imports'));
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (e) {
      console.error('Erro Firestore export const getXmlImports =', e);
      return [];
    }
  };

export const saveXmlImport = async (xmlData) => {
    if (USE_MOCK) return mockFirestore.saveXmlImport(xmlData);
    const { getFirestore, collection, addDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    const ref = await addDoc(collection(db, 'xml_imports'), { ...xmlData, importDate: new Date().toISOString() });
    return { id: ref.id, ...xmlData };
  };

export const getCostCenters = async () => {
    if (USE_MOCK || !mockFirestore) return mockFirestore.getCostCenters();
    try {
      const { getFirestore, collection, getDocs } = await import('firebase/firestore');
      const db = getFirestore(app);
      const snap = await getDocs(collection(db, 'cost_centers'));
      if (snap.empty) return mockFirestore.getCostCenters();
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (e) {
      return mockFirestore.getCostCenters();
    }
  };

export const getBudgetPlans = async () => {
    if (USE_MOCK || !mockFirestore) return mockFirestore.getBudgetPlans();
    try {
      const { getFirestore, collection, getDocs } = await import('firebase/firestore');
      const db = getFirestore(app);
      const snap = await getDocs(collection(db, 'budget_plans'));
      if (snap.empty) return [];
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (e) {
      console.error('Erro ao ler budget_plans do Firestore:', e);
      return [];
    }
  };

export const saveBudgetPlan = async (plan) => {
    if (USE_MOCK || !mockFirestore) return mockFirestore.saveBudgetPlan(plan);
    const { getFirestore, collection, addDoc, doc, setDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    if (plan.id) {
      await setDoc(doc(db, 'budget_plans', plan.id), plan, { merge: true });
      return plan;
    }
    const ref = await addDoc(collection(db, 'budget_plans'), { ...plan, createdAt: new Date().toISOString() });
    return { id: ref.id, ...plan };
  };

export const getAgreements = async () => {
    if (USE_MOCK || !mockFirestore) return mockFirestore.getAgreements();
    try {
      const { getFirestore, collection, getDocs } = await import('firebase/firestore');
      const db = getFirestore(app);
      const snap = await getDocs(collection(db, 'agreements'));
      if (snap.empty) return [];
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (e) {
      console.error('Erro ao ler agreements do Firestore:', e);
      return [];
    }
  };

export const saveAgreement = async (agr) => {
    if (USE_MOCK || !mockFirestore) return mockFirestore.saveAgreement(agr);
    const { getFirestore, collection, addDoc, doc, setDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    if (agr.id) {
      await setDoc(doc(db, 'agreements', agr.id), agr, { merge: true });
      return agr;
    }
    const ref = await addDoc(collection(db, 'agreements'), { ...agr, createdAt: new Date().toISOString() });
    return { id: ref.id, ...agr };
  };

export const deleteBudgetPlan = async (id) => {
    if (USE_MOCK) return { success: true };
    const { getFirestore, doc, deleteDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    await deleteDoc(doc(db, 'budget_plans', id));
    return { success: true };
  };

export const deleteAgreement = async (id) => {
    if (USE_MOCK) return { success: true };
    const { getFirestore, doc, deleteDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    await deleteDoc(doc(db, 'agreements', id));
    return { success: true };
  };

export const deleteBankStatement = async (id) => {
    if (USE_MOCK) return { success: true };
    const { getFirestore, doc, deleteDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    await deleteDoc(doc(db, 'bank_statements', id));
    return { success: true };
  };

export const clearAllFinanceData = async () => {
    if (USE_MOCK) return { success: true };
    const { getFirestore, collection, getDocs, writeBatch, doc } = await import('firebase/firestore');
    const db = getFirestore(app);
    const cols = ['accounts_payable', 'accounts_receivable', 'debts', 'bank_statements', 'budget_plans', 'agreements', 'xml_imports'];
    
    for (const colName of cols) {
      const snap = await getDocs(collection(db, colName));
      if (snap.docs.length > 0) {
        const chunkSize = 400;
        for (let i = 0; i < snap.docs.length; i += chunkSize) {
          const chunk = snap.docs.slice(i, i + chunkSize);
          const batch = writeBatch(db);
          for (const d of chunk) {
            batch.delete(doc(db, colName, d.id));
          }
          await batch.commit();
        }
      }
    }
    return { success: true };
  };
