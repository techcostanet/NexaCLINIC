import { app } from '../../firebase';
import { USE_MOCK, mockFirestore } from './mockDb';

export const getInventoryItems = async () => {
    if (USE_MOCK) return mockFirestore.getInventoryItems();
    try {
      const { getFirestore, collection, getDocs } = await import('firebase/firestore');
      const db = getFirestore(app);
      const snap = await getDocs(collection(db, 'inventory_items'));
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (e) {
      console.error("Erro ao carregar inventory_items do Firestore:", e);
      return [];
    }
  };

export const createInventoryItem = async (itemData) => {
    if (USE_MOCK) return mockFirestore.createInventoryItem(itemData);
    const { getFirestore, collection, addDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    const docRef = await addDoc(collection(db, 'inventory_items'), itemData);
    return { id: docRef.id, ...itemData };
  };

export const updateInventoryItem = async (id, itemData) => {
    if (USE_MOCK) return mockFirestore.updateInventoryItem(id, itemData);
    const { getFirestore, doc, updateDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    await updateDoc(doc(db, 'inventory_items', id), itemData);
    return { id, ...itemData };
  };

export const deleteInventoryItem = async (id) => {
    if (USE_MOCK) return mockFirestore.deleteInventoryItem(id);
    const { getFirestore, doc, deleteDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    await deleteDoc(doc(db, 'inventory_items', id));
    return { success: true };
  };

export const getStockTransactions = async () => {
    if (USE_MOCK) return mockFirestore.getStockTransactions();
    try {
      const { getFirestore, collection, getDocs } = await import('firebase/firestore');
      const db = getFirestore(app);
      const snap = await getDocs(collection(db, 'stock_transactions'));
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (e) {
      console.error("Erro ao carregar stock_transactions do Firestore:", e);
      return [];
    }
  };

export const createStockTransaction = async (txData) => {
    if (USE_MOCK) return mockFirestore.createStockTransaction(txData);
    const { getFirestore, collection, addDoc, doc, getDoc, updateDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    const docRef = await addDoc(collection(db, 'stock_transactions'), {
      ...txData,
      date: new Date().toISOString()
    });
    
    // Update inventory item stock level in Firestore
    const itemRef = doc(db, 'inventory_items', txData.itemId);
    const itemSnap = await getDoc(itemRef);
    if (itemSnap.exists()) {
      const current = parseFloat(itemSnap.data().currentStock) || 0;
      const change = parseFloat(txData.quantity) || 0;
      const newStock = txData.type === 'Entrada' ? current + change : Math.max(0, current - change);
      await updateDoc(itemRef, { currentStock: newStock });
    }

    return { id: docRef.id, ...txData, date: new Date().toISOString() };
  };

import initialSuppliers from '../../data/initialSuppliers.json';

export const getSuppliers = async () => {
    if (USE_MOCK) return mockFirestore.getSuppliers();
    try {
      const { getFirestore, collection, getDocs, doc, writeBatch } = await import('firebase/firestore');
      const db = getFirestore(app);
      const snap = await getDocs(collection(db, 'suppliers'));
      const existing = snap.docs.map(d => ({ id: d.id, ...d.data() }));

      if (existing.length < 10 && Array.isArray(initialSuppliers) && initialSuppliers.length > 0) {
        console.log("Seeding 358 suppliers to Firestore...");
        try {
          const batch = writeBatch(db);
          const suppliersCol = collection(db, 'suppliers');
          for (const sup of initialSuppliers) {
            const newDocRef = doc(suppliersCol);
            batch.set(newDocRef, { ...sup, createdAt: new Date().toISOString() });
          }
          await batch.commit();
          const newSnap = await getDocs(collection(db, 'suppliers'));
          return newSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        } catch (err) {
          console.error("Erro ao popular batch de fornecedores:", err);
          return initialSuppliers;
        }
      }

      return existing.length > 0 ? existing : initialSuppliers;
    } catch (e) {
      console.error("Erro ao carregar suppliers do Firestore:", e);
      return initialSuppliers;
    }
  };

export const createSupplier = async (supplierData) => {
    if (USE_MOCK) return mockFirestore.createSupplier(supplierData);
    const { getFirestore, collection, addDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    const docRef = await addDoc(collection(db, 'suppliers'), supplierData);
    return { id: docRef.id, ...supplierData };
  };

export const updateSupplier = async (id, supplierData) => {
    if (USE_MOCK) return mockFirestore.updateSupplier(id, supplierData);
    const { getFirestore, doc, updateDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    await updateDoc(doc(db, 'suppliers', id), supplierData);
    return { id, ...supplierData };
  };

export const deleteSupplier = async (id) => {
    if (USE_MOCK) return mockFirestore.deleteSupplier(id);
    const { getFirestore, doc, deleteDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    await deleteDoc(doc(db, 'suppliers', id));
    return { success: true };
  };

export const getStockSectors = async () => {
    if (USE_MOCK) return mockFirestore.getStockSectors();
    try {
      const { getFirestore, collection, getDocs } = await import('firebase/firestore');
      const db = getFirestore(app);
      const snap = await getDocs(collection(db, 'stock_sectors'));
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (e) {
      console.error("Erro ao carregar stock_sectors do Firestore:", e);
      return [];
    }
  };

export const createStockSector = async (sectorData) => {
    if (USE_MOCK) return mockFirestore.createStockSector(sectorData);
    const { getFirestore, collection, addDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    const docRef = await addDoc(collection(db, 'stock_sectors'), sectorData);
    return { id: docRef.id, ...sectorData };
  };

export const updateStockSector = async (id, sectorData) => {
    if (USE_MOCK) return mockFirestore.updateStockSector(id, sectorData);
    const { getFirestore, doc, updateDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    await updateDoc(doc(db, 'stock_sectors', id), sectorData);
    return { id, ...sectorData };
  };

export const deleteStockSector = async (id) => {
    if (USE_MOCK) return mockFirestore.deleteStockSector(id);
    const { getFirestore, doc, deleteDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    await deleteDoc(doc(db, 'stock_sectors', id));
    return { success: true };
  };

export const getProductCategories = async () => {
    if (USE_MOCK) return mockFirestore.getProductCategories();
    try {
      const { getFirestore, collection, getDocs } = await import('firebase/firestore');
      const db = getFirestore(app);
      const snap = await getDocs(collection(db, 'product_categories'));
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (e) {
      console.error('Erro Firestore export const getProductCategories =', e);
      return [];
    }
  };

export const saveProductCategory = async (catData) => {
    if (USE_MOCK) return mockFirestore.saveProductCategory(catData);
    const { getFirestore, collection, addDoc, doc, setDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    if (catData.id) {
      await setDoc(doc(db, 'product_categories', catData.id), catData, { merge: true });
      return catData;
    }
    const ref = await addDoc(collection(db, 'product_categories'), { ...catData, createdAt: new Date().toISOString() });
    return { id: ref.id, ...catData };
  };

export const deleteProductCategory = async (id) => {
    if (USE_MOCK) return mockFirestore.deleteProductCategory(id);
    const { getFirestore, doc, deleteDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    await deleteDoc(doc(db, 'product_categories', id));
    return { success: true };
  };

export const getStockLoans = async () => {
    if (USE_MOCK) return mockFirestore.getStockLoans();
    try {
      const { getFirestore, collection, getDocs } = await import('firebase/firestore');
      const db = getFirestore(app);
      const snap = await getDocs(collection(db, 'stock_loans'));
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (e) {
      console.error('Erro Firestore export const getStockLoans =', e);
      return [];
    }
  };

export const saveStockLoan = async (loanData) => {
    if (USE_MOCK) return mockFirestore.saveStockLoan(loanData);
    const { getFirestore, collection, addDoc, doc, setDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    if (loanData.id) {
      await setDoc(doc(db, 'stock_loans', loanData.id), loanData, { merge: true });
      return loanData;
    }
    const ref = await addDoc(collection(db, 'stock_loans'), { ...loanData, createdAt: new Date().toISOString() });
    return { id: ref.id, ...loanData };
  };

export const returnStockLoan = async (id) => {
    if (USE_MOCK) return mockFirestore.returnStockLoan(id);
    const { getFirestore, doc, updateDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    await updateDoc(doc(db, 'stock_loans', id), {
      status: 'Devolvido',
      returnDate: new Date().toISOString().substring(0, 10)
    });
    return { success: true };
  };

export const deleteStockLoan = async (id) => {
    if (USE_MOCK) return mockFirestore.deleteStockLoan(id);
    const { getFirestore, doc, deleteDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    await deleteDoc(doc(db, 'stock_loans', id));
    return { success: true };
  };

export const getMaterialRequisitions = async () => {
    if (USE_MOCK) return mockFirestore.getMaterialRequisitions();
    try {
      const { getFirestore, collection, getDocs } = await import('firebase/firestore');
      const db = getFirestore(app);
      const snap = await getDocs(collection(db, 'material_requisitions'));
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (e) {
      console.error('Erro Firestore export const getMaterialRequisitions =', e);
      return [];
    }
  };

export const saveMaterialRequisition = async (reqData) => {
    if (USE_MOCK) return mockFirestore.saveMaterialRequisition(reqData);
    const { getFirestore, collection, addDoc, doc, setDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    if (reqData.id) {
      await setDoc(doc(db, 'material_requisitions', reqData.id), { ...reqData, updatedAt: new Date().toISOString() }, { merge: true });
      return reqData;
    }
    const ref = await addDoc(collection(db, 'material_requisitions'), { ...reqData, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    return { id: ref.id, ...reqData };
  };

export const deleteMaterialRequisition = async (id) => {
    if (USE_MOCK) return mockFirestore.deleteMaterialRequisition(id);
    const { getFirestore, doc, deleteDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    await deleteDoc(doc(db, 'material_requisitions', id));
    return { success: true };
  };

export const getStockLocations = async () => {
    if (USE_MOCK) return mockFirestore.getStockLocations ? mockFirestore.getStockLocations() : [];
    try {
      const { getFirestore, collection, getDocs, doc, setDoc } = await import('firebase/firestore');
      const db = getFirestore(app);
      const snap = await getDocs(collection(db, 'stock_locations'));
      if (snap.empty) {
        const defaults = [
          { id: 'loc_central', name: 'Almoxarifado Central', description: 'Estoque principal da clínica', responsible: 'João Almoxarife', status: 'Ativo' },
          { id: 'loc_dialise', name: 'Farmácia da Diálise', description: 'Salão principal de hemodiálise', responsible: 'Enf. Ana Paula', status: 'Ativo' },
          { id: 'loc_enfermagem', name: 'Posto de Enfermagem', description: 'Atendimento ambulatorial e emergência', responsible: 'Supervisão Enfermagem', status: 'Ativo' },
          { id: 'loc_ti', name: 'Almoxarifado T.I / Manutenção', description: 'Peças, suprimentos de TI e manutenção', responsible: 'Equipe T.I', status: 'Ativo' }
        ];
        for (const loc of defaults) {
          const { id, ...data } = loc;
          await setDoc(doc(db, 'stock_locations', id), data);
        }
        return defaults;
      }
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (e) {
      console.error('Erro Firestore export const getStockLocations =', e);
      return [];
    }
  };

export const saveStockLocation = async (locationData) => {
    if (USE_MOCK) return mockFirestore.saveStockLocation ? mockFirestore.saveStockLocation(locationData) : locationData;
    const { getFirestore, collection, addDoc, doc, setDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    if (locationData.id) {
      const { id, ...data } = locationData;
      await setDoc(doc(db, 'stock_locations', id), { ...data, updatedAt: new Date().toISOString() }, { merge: true });
      return locationData;
    }
    const ref = await addDoc(collection(db, 'stock_locations'), { ...locationData, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    return { id: ref.id, ...locationData };
  };

export const deleteStockLocation = async (id) => {
    if (USE_MOCK) return mockFirestore.deleteStockLocation ? mockFirestore.deleteStockLocation(id) : { success: true };
    const { getFirestore, doc, deleteDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    await deleteDoc(doc(db, 'stock_locations', id));
    return { success: true };
  };

export const getInventories = async () => {
    if (USE_MOCK) return mockFirestore.getInventories ? mockFirestore.getInventories() : [];
    try {
      const { getFirestore, collection, getDocs } = await import('firebase/firestore');
      const db = getFirestore(app);
      const snap = await getDocs(collection(db, 'inventories'));
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (e) {
      console.error('Erro Firestore export const getInventories =', e);
      return [];
    }
  };

export const saveInventory = async (invData) => {
    if (USE_MOCK) return mockFirestore.saveInventory ? mockFirestore.saveInventory(invData) : invData;
    const { getFirestore, collection, addDoc, doc, setDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    if (invData.id) {
      const { id, ...data } = invData;
      await setDoc(doc(db, 'inventories', id), { ...data, updatedAt: new Date().toISOString() }, { merge: true });
      return invData;
    }
    const ref = await addDoc(collection(db, 'inventories'), {
      ...invData,
      status: invData.status || 'Em Andamento',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    return { id: ref.id, ...invData };
  };

export const finalizeInventory = async (inventoryId, itemsList, operatorName) => {
    if (USE_MOCK) return mockFirestore.finalizeInventory ? mockFirestore.finalizeInventory(inventoryId, itemsList, operatorName) : { success: true };
    const { getFirestore, doc, setDoc, updateDoc, collection, addDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    
    // 1. Update each item's currentStock and create an audit stock transaction
    for (const item of itemsList) {
      if (item.itemId && item.physicalCount !== undefined && item.physicalCount !== null && item.physicalCount !== '') {
        const physicalVal = parseFloat(item.physicalCount) || 0;
        const systemVal = parseFloat(item.systemCount) || 0;
        const diff = physicalVal - systemVal;

        // Update product stock level in Firestore
        await setDoc(doc(db, 'inventory_items', item.itemId), { currentStock: physicalVal, updatedAt: new Date().toISOString() }, { merge: true });

        // Log transaction for audit log if there is a divergence
        if (diff !== 0) {
          await addDoc(collection(db, 'stock_transactions'), {
            itemId: item.itemId,
            itemName: item.itemName || 'Produto',
            quantity: Math.abs(diff),
            type: diff > 0 ? 'Entrada' : 'Saída',
            batch: item.batch || 'AJUSTE-INVENTARIO',
            operator: operatorName || 'Auditor de Estoque',
            date: new Date().toISOString(),
            notes: `Ajuste Automático por Inventário Físico (Divergência: ${diff > 0 ? '+' : ''}${diff})`
          });
        }
      }
    }

    // 2. Mark inventory as Finalized
    await updateDoc(doc(db, 'inventories', inventoryId), {
      status: 'Concluído',
      items: itemsList,
      finalizedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    return { success: true };
  };

export const deleteInventory = async (id) => {
    if (USE_MOCK) return mockFirestore.deleteInventory ? mockFirestore.deleteInventory(id) : { success: true };
    const { getFirestore, doc, deleteDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    await deleteDoc(doc(db, 'inventories', id));
    return { success: true };
  };

export const getStockTransfers = async () => {
    if (USE_MOCK) return mockFirestore.getStockTransfers ? mockFirestore.getStockTransfers() : [];
    try {
      const { getFirestore, collection, getDocs } = await import('firebase/firestore');
      const db = getFirestore(app);
      const snap = await getDocs(collection(db, 'stock_transfers'));
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (e) {
      console.error('Erro Firestore export const getStockTransfers =', e);
      return [];
    }
  };

export const saveStockTransfer = async (transferData) => {
    if (USE_MOCK) return mockFirestore.saveStockTransfer ? mockFirestore.saveStockTransfer(transferData) : transferData;
    const { getFirestore, collection, addDoc, doc, setDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    
    // Save transfer document
    const ref = await addDoc(collection(db, 'stock_transfers'), {
      ...transferData,
      status: 'Concluída',
      createdAt: new Date().toISOString()
    });

    // Register transaction log in stock_transactions
    await addDoc(collection(db, 'stock_transactions'), {
      itemId: transferData.itemId,
      itemName: transferData.itemName,
      quantity: parseFloat(transferData.quantity) || 0,
      type: 'Saída',
      batch: transferData.batch || 'TRANSFERENCIA',
      expiryDate: transferData.expiryDate || '',
      operator: transferData.operator || 'Almoxarife',
      date: new Date().toISOString(),
      notes: `Transferência de ${transferData.originLocationName} para ${transferData.destinationLocationName}`
    });

    return { id: ref.id, ...transferData };
  };

