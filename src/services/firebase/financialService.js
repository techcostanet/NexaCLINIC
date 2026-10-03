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

export const deletePurchase = async (id) => {
    if (USE_MOCK) {
      const data = localStorage.getItem('sistema_indicadores_purchases');
      let list = data ? JSON.parse(data) : [];
      list = list.filter(item => item.id !== id);
      localStorage.setItem('sistema_indicadores_purchases', JSON.stringify(list));
      return { id, success: true };
    }
    const { getFirestore, doc, deleteDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    await deleteDoc(doc(db, 'purchases', id));
    return { id, success: true };
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
    const { getFirestore, collection, doc, writeBatch, getDoc, updateDoc, addDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    const batch = writeBatch(db);
    
    const invoiceRef = doc(collection(db, 'purchase_invoices'));
    const now = new Date();
    const localToday = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const entryDate = invoiceData.entryDate || localToday;
    const targetUnitId = invoiceData.unitId || 'betim';
    const targetUnit = targetUnitId === 'taguatinga' ? 'Taguatinga' : 'Betim';
    const isService = invoiceData.invoiceType === 'service';
    const invoiceRecord = {
      ...invoiceData,
      id: invoiceRef.id,
      entryDate,
      status: 'Processada',
      unitId: targetUnitId,
      unit: targetUnit
    };
    batch.set(invoiceRef, invoiceRecord);

    if (!isService) {
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
          notes: `Entrada via NF-e ${invoiceData.number}`,
          unitId: targetUnitId,
          unit: targetUnit
        });
      }
    }
    await batch.commit();

    // Abastece efetivamente o estoque dos produtos no Firestore se for produto físico
    if (!isService) {
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
    }

    // Geração Automática no Contas a Pagar (Integração Estoque -> Financeiro)
    try {
      const finalTotal = parseFloat(invoiceData.totalValue || invoiceData.totalAmount) || 0;
      const instList = (invoiceData.installments && invoiceData.installments.length > 0)
        ? invoiceData.installments
        : [{ installmentNumber: '1/1', dueDate: invoiceData.issueDate || entryDate, amount: finalTotal }];

      for (const inst of instList) {
        const instAmount = parseFloat(inst.amount) || finalTotal || 0;
        if (instAmount > 0) {
          const defaultDueDate = new Date();
          defaultDueDate.setDate(defaultDueDate.getDate() + 30);
          const finalDueDate = inst.dueDate || defaultDueDate.toISOString().substring(0, 10);

          await addDoc(collection(db, 'accounts_payable'), {
            supplier: invoiceData.supplierName || invoiceData.supplier || 'Fornecedor NF-e',
            cnpj: invoiceData.supplierCnpj || invoiceData.cnpj || '00.000.000/0001-00',
            description: `Entrada ${isService ? 'NFS-e' : 'NF-e'} Nº ${invoiceData.number}${inst.installmentNumber ? ` (Parc. ${inst.installmentNumber})` : ''}`,
            amount: instAmount,
            dueDate: finalDueDate,
            category: isService ? 'Serviço/Utilidades' : 'Insumo Clínico',
            invoiceNumber: invoiceData.number,
            accessKey: invoiceData.accessKey || '',
            documentType: isService ? 'NFS-e' : 'NF-e',
            status: 'Pendente',
            unitId: targetUnitId,
            unit: targetUnit,
            invoiceId: invoiceRef.id,
            origin: 'stock_invoice',
            boletoUrl: inst.boletoUrl || invoiceData.boletoUrl || '',
            digitableLine: inst.digitableLine || invoiceData.digitableLine || '',
            createdAt: new Date().toISOString()
          });
        }
      }
    } catch (payErr) {
      console.error('Erro ao gerar contas a pagar automático para a NF:', payErr);
    }

    return invoiceRecord;
  };

export const deletePurchaseInvoice = async (id) => {
    if (USE_MOCK) return mockFirestore.deletePurchaseInvoice(id);
    const { getFirestore, doc, deleteDoc, collection, query, where, getDocs } = await import('firebase/firestore');
    const db = getFirestore(app);
    
    // 1. Remove títulos vinculados no Contas a Pagar se ainda estiverem pendentes
    try {
      const q = query(collection(db, 'accounts_payable'), where('invoiceId', '==', id));
      const paySnaps = await getDocs(q);
      for (const payDoc of paySnaps.docs) {
        if (payDoc.data().status === 'Pendente') {
          await deleteDoc(doc(db, 'accounts_payable', payDoc.id));
        }
      }
    } catch (e) {
      console.warn('Erro ao limpar contas a pagar vinculadas:', e);
    }

    await deleteDoc(doc(db, 'purchase_invoices', id));
    return { success: true };
  };

export const updatePurchaseInvoice = async (id, updateData) => {
    if (USE_MOCK) return mockFirestore.updatePurchaseInvoice(id, updateData);
    const { getFirestore, doc, updateDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    await updateDoc(doc(db, 'purchase_invoices', id), updateData);
    return { id, ...updateData };
  };

/**
 * Sincroniza todas as notas fiscais do estoque com o Contas a Pagar do Financeiro
 */
export const syncStockInvoicesToPayables = async () => {
    if (USE_MOCK) return mockFirestore.syncStockInvoicesToPayables ? mockFirestore.syncStockInvoicesToPayables() : { created: 0 };
    try {
      const invoices = await getPurchaseInvoices();
      const payables = await getAccountsPayable();
      const { getFirestore, collection, addDoc } = await import('firebase/firestore');
      const db = getFirestore(app);

      let createdCount = 0;

      for (const inv of invoices) {
        if (!inv.number) continue;
        const total = parseFloat(inv.totalValue || inv.totalAmount) || 0;
        if (total <= 0) continue;

        // Verifica se já existem lançamentos para este número de NF
        const exists = payables.some(p => 
          String(p.invoiceNumber) === String(inv.number) ||
          (p.invoiceId && p.invoiceId === inv.id) ||
          (p.accessKey && inv.accessKey && p.accessKey === inv.accessKey)
        );

        if (!exists) {
          const instList = (inv.installments && inv.installments.length > 0)
            ? inv.installments
            : [{ installmentNumber: '1/1', dueDate: inv.issueDate || inv.entryDate || new Date().toISOString().substring(0, 10), amount: total }];

          for (const inst of instList) {
            const instVal = parseFloat(inst.amount) || total;
            await addDoc(collection(db, 'accounts_payable'), {
              supplier: inv.supplierName || inv.supplier || 'Fornecedor Importado',
              cnpj: inv.supplierCnpj || inv.cnpj || '00.000.000/0001-00',
              description: `Entrada ${inv.invoiceType === 'service' ? 'NFS-e' : 'NF-e'} Nº ${inv.number}${inst.installmentNumber ? ` (Parc. ${inst.installmentNumber})` : ''}`,
              amount: instVal,
              dueDate: inst.dueDate || inv.entryDate || new Date().toISOString().substring(0, 10),
              category: inv.invoiceType === 'service' ? 'Serviço/Utilidades' : 'Insumo Clínico',
              invoiceNumber: inv.number,
              accessKey: inv.accessKey || '',
              documentType: inv.invoiceType === 'service' ? 'NFS-e' : 'NF-e',
              status: 'Pendente',
              unitId: inv.unitId || 'betim',
              unit: inv.unit || 'Betim',
              invoiceId: inv.id,
              origin: 'stock_invoice',
              createdAt: new Date().toISOString()
            });
            createdCount++;
          }
        }
      }

      return { createdCount };
    } catch (err) {
      console.error('Erro ao sincronizar notas do estoque:', err);
      throw err;
    }
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
