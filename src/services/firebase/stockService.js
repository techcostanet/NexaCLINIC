import { app } from './config';
import { USE_MOCK, mockFirestore } from './mockDb';

import initialProducts from '../../data/initialProducts.json';

export const getInventoryItems = async () => {
    if (USE_MOCK) return mockFirestore.getInventoryItems();
    try {
      const { getFirestore, collection, getDocs, doc, writeBatch } = await import('firebase/firestore');
      const db = getFirestore(app);
      const snap = await getDocs(collection(db, 'inventory_items'));
      const existing = snap.docs.map(d => ({ id: d.id, ...d.data() }));

      if (existing.length < 10 && Array.isArray(initialProducts) && initialProducts.length > 0) {
        console.log("Seeding 1221 products to Firestore...");
        try {
          const chunkSize = 400;
          const itemsCol = collection(db, 'inventory_items');
          for (let i = 0; i < initialProducts.length; i += chunkSize) {
            const chunk = initialProducts.slice(i, i + chunkSize);
            const batch = writeBatch(db);
            for (const item of chunk) {
              const newDocRef = doc(itemsCol);
              batch.set(newDocRef, { ...item, createdAt: new Date().toISOString() });
            }
            await batch.commit();
          }
          const newSnap = await getDocs(collection(db, 'inventory_items'));
          return newSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        } catch (err) {
          console.error("Erro ao popular batch de produtos no Firestore:", err);
          return initialProducts;
        }
      }

      return existing.length > 0 ? existing : initialProducts;
    } catch (e) {
      console.error("Erro ao carregar inventory_items do Firestore:", e);
      return initialProducts;
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
      const { getFirestore, collection, getDocs, doc, setDoc } = await import('firebase/firestore');
      const db = getFirestore(app);
      const snap = await getDocs(collection(db, 'product_categories'));
      if (snap.empty) {
        const defaults = [
          { id: 'cat-matmed', name: 'MatMed', module: 'Estoque', description: 'Insumos hospitalares, materiais médicos e de enfermagem' },
          { id: 'cat-medicamento', name: 'Medicamento', module: 'Estoque', description: 'Medicamentos orais e parenterais' },
          { id: 'cat-controlado', name: 'Controlado', module: 'Estoque', description: 'Medicamentos sujeitos a controle especial (Portaria 344)' },
          { id: 'cat-concentrado', name: 'Concentrado', module: 'Estoque', description: 'Soluções ácidas e bicarbonato para hemodiálise' },
          { id: 'cat-capilar', name: 'Dialisador', module: 'Estoque', description: 'Capilares e dialisadores de baixo e alto fluxo' },
          { id: 'cat-linhas', name: 'Linhas', module: 'Estoque', description: 'Linhas de sangue arterial e venosa, equipos e extensores' },
          { id: 'cat-fistula', name: 'Acesso', module: 'Estoque', description: 'Agulhas de fístula, cateteres de duplo lúmen e permcath' },
          { id: 'cat-curativo', name: 'Curativo', module: 'Estoque', description: 'Fitas, micropore, gazes, compressas e curativos estéreis' },
          { id: 'cat-opme', name: 'OPME', module: 'Estoque', description: 'Órteses, próteses e materiais especiais cirúrgicos' },
          { id: 'cat-fios', name: 'Sutura', module: 'Estoque', description: 'Fios cirúrgicos e agulhados' },
          { id: 'cat-descartaveis', name: 'Descartáveis', module: 'Estoque', description: 'Seringas, agulhas, luvas e descartáveis em geral' },
          { id: 'cat-epi', name: 'EPI', module: 'Estoque', description: 'Equipamentos de proteção individual (máscaras, aventais, óculos)' },
          { id: 'cat-limpeza', name: 'Higiene', module: 'Estoque', description: 'Materiais de assepsia, desinfecção e limpeza hospitalar' },
          { id: 'cat-osmose', name: 'Osmose', module: 'Estoque', description: 'Tratamento de água e produtos de osmose reversa' },
          { id: 'cat-peritoneal', name: 'Peritoneal', module: 'Estoque', description: 'Bolsas e insumos para diálise peritoneal contínua' },
          { id: 'cat-nutricao', name: 'Nutrição', module: 'Estoque', description: 'Suplementos nutricionais e alimentação clínica' },
          { id: 'cat-ti', name: 'Tecnologia', module: 'Estoque', description: 'Equipamentos e insumos de tecnologia e conectividade' },
          { id: 'cat-manutencao', name: 'Manutenção', module: 'Estoque', description: 'Peças e insumos para engenharia clínica e manutenção' },
          { id: 'cat-escritorio', name: 'Escritório', module: 'Estoque', description: 'Papelaria e suprimentos administrativos' },
          { id: 'cat-patrimonio', name: 'Patrimônio', module: 'Estoque', description: 'Bens duráveis e equipamentos permanentes' }
        ];
        try {
          for (const cat of defaults) {
            const { id, ...data } = cat;
            await setDoc(doc(db, 'product_categories', id), data);
          }
          return defaults;
        } catch (seedErr) {
          console.error('Erro ao semear categorias:', seedErr);
          return defaults;
        }
      }
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

export const getProductKits = async () => {
    if (USE_MOCK) return mockFirestore.getProductKits ? mockFirestore.getProductKits() : [];
    try {
      const { getFirestore, collection, getDocs, doc, setDoc } = await import('firebase/firestore');
      const db = getFirestore(app);
      const snap = await getDocs(collection(db, 'product_kits'));
      if (snap.empty) {
        const defaultKits = [
          {
            id: 'kit-hemo-01',
            code: 'KIT-HEMO-01',
            name: 'Punção FAV',
            category: 'Hemodiálise',
            suggestedLocation: 'Salão 1',
            description: 'Kit para punção segura de fístula arteriovenosa no início da sessão.',
            items: [
              { itemId: 'prod-hosp-38', itemName: 'AGULHA FISTULA 16G', quantity: 2, unit: 'unidades', price: 10 },
              { itemId: 'prod-hosp-12', itemName: 'LUVA DE TOQUE', quantity: 1, unit: 'unidades', price: 10 },
              { itemId: 'prod-hosp-53', itemName: 'CLOREXIDINA 0,5% SOLUÇÃO ALCOOLICA', quantity: 1, unit: 'unidades', price: 10 },
              { itemId: 'prod-hosp-125', itemName: 'CAMPO OPERATORIO (25X28) COMPRESSA CIRÚRGICA', quantity: 1, unit: 'unidades', price: 10 },
              { itemId: 'prod-hosp-26', itemName: 'MICROPORE 25MMX10M', quantity: 1, unit: 'unidades', price: 10 },
              { itemId: 'prod-hosp-35', itemName: 'SERINGA 1ML COM AGULHA', quantity: 1, unit: 'unidades', price: 10 }
            ],
            totalCost: 70
          },
          {
            id: 'kit-hemo-02',
            code: 'KIT-HEMO-02',
            name: 'Curativo Cateter',
            category: 'Hemodiálise',
            suggestedLocation: 'Farmácia da Diálise',
            description: 'Kit para higienização e curativo estéril de cateter venoso central (CDL ou Permcath).',
            items: [
              { itemId: 'prod-hosp-53', itemName: 'CLOREXIDINA 0,5% SOLUÇÃO ALCOOLICA', quantity: 1, unit: 'unidades', price: 10 },
              { itemId: 'prod-hosp-2', itemName: 'MASCARA DESCARTAVEL', quantity: 2, unit: 'unidades', price: 10 },
              { itemId: 'prod-hosp-23', itemName: 'LUVA CIRURGICA 7,5', quantity: 1, unit: 'unidades', price: 10 },
              { itemId: 'prod-hosp-125', itemName: 'CAMPO OPERATORIO (25X28) COMPRESSA CIRÚRGICA', quantity: 1, unit: 'unidades', price: 10 },
              { itemId: 'prod-hosp-41', itemName: 'MICROPORE 50MMX10M', quantity: 1, unit: 'unidades', price: 10 },
              { itemId: 'prod-hosp-71', itemName: 'HEPARINA 5.000 UI', quantity: 1, unit: 'unidades', price: 10, isControlled: true },
              { itemId: 'prod-hosp-35', itemName: 'SERINGA 1ML COM AGULHA', quantity: 2, unit: 'unidades', price: 10 }
            ],
            totalCost: 90
          },
          {
            id: 'kit-hemo-03',
            code: 'KIT-HEMO-03',
            name: 'Conexão Hemodiálise',
            category: 'Hemodiálise',
            suggestedLocation: 'Salão 1',
            description: 'Kit completo de linhas e dialisador para conexão do paciente à máquina de hemodiálise.',
            items: [
              { itemId: 'prod-hosp-184', itemName: 'KIT DE LINHA ARTERIAL E VENOSA', quantity: 1, unit: 'unidades', price: 10 },
              { itemId: 'prod-hosp-101', itemName: 'CAPILAR B-20HF- ALTO FLUXO- USO UNICO', quantity: 1, unit: 'unidades', price: 10 },
              { itemId: 'prod-hosp-87', itemName: 'SORO FISIOLOGICO 0,9% FRASCO 1000ML', quantity: 2, unit: 'unidades', price: 10 },
              { itemId: 'prod-hosp-203', itemName: 'SOLUÇÃO ACIDA CALCIO 3,0 MEQ/L/K 2.0 MEQ/L 1:44', quantity: 1, unit: 'unidades', price: 10 },
              { itemId: 'prod-hosp-147', itemName: 'EXTENSOR DE EQUIPO 40CM', quantity: 1, unit: 'unidades', price: 10 },
              { itemId: 'prod-hosp-71', itemName: 'HEPARINA 5.000 UI', quantity: 1, unit: 'unidades', price: 10, isControlled: true }
            ],
            totalCost: 70
          },
          {
            id: 'kit-hemo-04',
            code: 'KIT-HEMO-04',
            name: 'Desconexão Hemodiálise',
            category: 'Hemodiálise',
            suggestedLocation: 'Salão 1',
            description: 'Kit para devolução de sangue e curativo compressivo pós-sessão de hemodiálise.',
            items: [
              { itemId: 'prod-hosp-87', itemName: 'SORO FISIOLOGICO 0,9% FRASCO 1000ML', quantity: 1, unit: 'unidades', price: 10 },
              { itemId: 'prod-hosp-125', itemName: 'CAMPO OPERATORIO (25X28) COMPRESSA CIRÚRGICA', quantity: 2, unit: 'unidades', price: 10 },
              { itemId: 'prod-hosp-74', itemName: 'ESPARADRAPO 10CM X 4,5M', quantity: 1, unit: 'unidades', price: 10 },
              { itemId: 'prod-hosp-26', itemName: 'MICROPORE 25MMX10M', quantity: 1, unit: 'unidades', price: 10 },
              { itemId: 'prod-hosp-12', itemName: 'LUVA DE TOQUE', quantity: 1, unit: 'unidades', price: 10 },
              { itemId: 'prod-hosp-336', itemName: 'ALCOOL ETILICO 70% ALMOTOLIA 100ML', quantity: 1, unit: 'unidades', price: 10 }
            ],
            totalCost: 70
          },
          {
            id: 'kit-hemo-05',
            code: 'KIT-HEMO-05',
            name: 'Prime Circuito',
            category: 'Hemodiálise',
            suggestedLocation: 'Almoxarifado Central',
            description: 'Kit para preenchimento (prime), heparinização e lavagem do circuito extracorpóreo.',
            items: [
              { itemId: 'prod-hosp-87', itemName: 'SORO FISIOLOGICO 0,9% FRASCO 1000ML', quantity: 2, unit: 'unidades', price: 10 },
              { itemId: 'prod-hosp-184', itemName: 'KIT DE LINHA ARTERIAL E VENOSA', quantity: 1, unit: 'unidades', price: 10 },
              { itemId: 'prod-hosp-101', itemName: 'CAPILAR B-20HF- ALTO FLUXO- USO UNICO', quantity: 1, unit: 'unidades', price: 10 },
              { itemId: 'prod-hosp-147', itemName: 'EXTENSOR DE EQUIPO 40CM', quantity: 1, unit: 'unidades', price: 10 },
              { itemId: 'prod-hosp-47', itemName: 'AGULHA DESCARTAVEL 25X8', quantity: 2, unit: 'unidades', price: 10 }
            ],
            totalCost: 70
          },
          {
            id: 'kit-hemo-06',
            code: 'KIT-HEMO-06',
            name: 'Emergência Hemodiálise',
            category: 'Hemodiálise',
            suggestedLocation: 'Posto de Enfermagem',
            description: 'Kit para resposta imediata a hipotensão arterial, coagulação de circuito ou reação alérgica.',
            items: [
              { itemId: 'prod-hosp-87', itemName: 'SORO FISIOLOGICO 0,9% FRASCO 1000ML', quantity: 2, unit: 'unidades', price: 10 },
              { itemId: 'prod-hosp-147', itemName: 'EXTENSOR DE EQUIPO 40CM', quantity: 1, unit: 'unidades', price: 10 },
              { itemId: 'prod-hosp-28', itemName: 'CATETER NASAL TIPO OCULOS', quantity: 1, unit: 'unidades', price: 10 },
              { itemId: 'prod-hosp-71', itemName: 'HEPARINA 5.000 UI', quantity: 1, unit: 'unidades', price: 10, isControlled: true },
              { itemId: 'prod-hosp-48', itemName: 'AGULHA DESCARTAVEL 25X7', quantity: 2, unit: 'unidades', price: 10 },
              { itemId: 'prod-hosp-35', itemName: 'SERINGA 1ML COM AGULHA', quantity: 2, unit: 'unidades', price: 10 }
            ],
            totalCost: 90
          }
        ];
        try {
          for (const kit of defaultKits) {
            const { id, ...data } = kit;
            await setDoc(doc(db, 'product_kits', id), { ...data, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
          }
          return defaultKits;
        } catch (seedErr) {
          console.error('Erro ao semear kits:', seedErr);
          return defaultKits;
        }
      }
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (e) {
      console.error('Erro Firestore getProductKits:', e);
      return [];
    }
  };

export const saveProductKit = async (kitData) => {
    if (USE_MOCK) return mockFirestore.saveProductKit ? mockFirestore.saveProductKit(kitData) : kitData;
    const { getFirestore, collection, addDoc, doc, setDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    if (kitData.id) {
      await setDoc(doc(db, 'product_kits', kitData.id), { ...kitData, updatedAt: new Date().toISOString() }, { merge: true });
      return kitData;
    }
    const ref = await addDoc(collection(db, 'product_kits'), { ...kitData, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    return { id: ref.id, ...kitData };
  };

export const deleteProductKit = async (id) => {
    if (USE_MOCK) return mockFirestore.deleteProductKit ? mockFirestore.deleteProductKit(id) : { success: true };
    const { getFirestore, doc, deleteDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    await deleteDoc(doc(db, 'product_kits', id));
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

export const getProductBatches = async (itemId = null) => {
    if (USE_MOCK) return mockFirestore.getProductBatches ? mockFirestore.getProductBatches(itemId) : [];
    try {
      const { getFirestore, collection, getDocs, query, where } = await import('firebase/firestore');
      const db = getFirestore(app);
      let q = collection(db, 'product_batches');
      if (itemId) {
        q = query(collection(db, 'product_batches'), where('itemId', '==', itemId));
      }
      const snap = await getDocs(q);
      const batches = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Sort by expiry date (FEFO)
      return batches.sort((a, b) => {
        if (!a.expiryDate) return 1;
        if (!b.expiryDate) return -1;
        return new Date(a.expiryDate) - new Date(b.expiryDate);
      });
    } catch (e) {
      console.error('Erro Firestore getProductBatches:', e);
      return [];
    }
  };

export const saveProductBatch = async (batchData) => {
    if (USE_MOCK) return mockFirestore.saveProductBatch ? mockFirestore.saveProductBatch(batchData) : batchData;
    const { getFirestore, collection, addDoc, doc, setDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    
    // Auto status determination
    const currentQty = parseFloat(batchData.currentQuantity) || 0;
    let status = 'Ativo';
    if (currentQty <= 0) {
      status = 'Esgotado';
    } else if (batchData.expiryDate && new Date(batchData.expiryDate) < new Date()) {
      status = 'Vencido';
    } else if (batchData.status) {
      status = batchData.status;
    }

    const payload = {
      ...batchData,
      currentQuantity: currentQty,
      status,
      updatedAt: new Date().toISOString()
    };

    if (batchData.id) {
      await setDoc(doc(db, 'product_batches', batchData.id), payload, { merge: true });
      return { id: batchData.id, ...payload };
    }
    const ref = await addDoc(collection(db, 'product_batches'), {
      ...payload,
      createdAt: new Date().toISOString()
    });
    return { id: ref.id, ...payload };
  };

export const deleteProductBatch = async (id) => {
    if (USE_MOCK) return mockFirestore.deleteProductBatch ? mockFirestore.deleteProductBatch(id) : { success: true };
    const { getFirestore, doc, deleteDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    await deleteDoc(doc(db, 'product_batches', id));
    return { success: true };
  };

export const upsertProductBatchOnEntry = async (entryData) => {
    if (USE_MOCK) return mockFirestore.upsertProductBatchOnEntry ? mockFirestore.upsertProductBatchOnEntry(entryData) : entryData;
    try {
      const { getFirestore, collection, getDocs, query, where, addDoc, doc, updateDoc } = await import('firebase/firestore');
      const db = getFirestore(app);
      const batchNumber = (entryData.batchNumber || '').trim();
      const qty = parseFloat(entryData.quantity) || 0;

      if (!batchNumber) {
        return null;
      }

      // Check if this batch already exists for this itemId
      const q = query(
        collection(db, 'product_batches'),
        where('itemId', '==', entryData.itemId),
        where('batchNumber', '==', batchNumber)
      );
      const snap = await getDocs(q);

      if (!snap.empty) {
        const existingDoc = snap.docs[0];
        const existingData = existingDoc.data();
        const newCurrentQty = (parseFloat(existingData.currentQuantity) || 0) + qty;
        const newInitialQty = (parseFloat(existingData.initialQuantity) || 0) + qty;
        
        let status = 'Ativo';
        if (existingData.expiryDate && new Date(existingData.expiryDate) < new Date()) {
          status = 'Vencido';
        }

        await updateDoc(doc(db, 'product_batches', existingDoc.id), {
          currentQuantity: newCurrentQty,
          initialQuantity: newInitialQty,
          status,
          updatedAt: new Date().toISOString()
        });

        return { id: existingDoc.id, ...existingData, currentQuantity: newCurrentQty, initialQuantity: newInitialQty, status };
      } else {
        // Create new batch doc
        let status = 'Ativo';
        if (entryData.expiryDate && new Date(entryData.expiryDate) < new Date()) {
          status = 'Vencido';
        }

        const newBatch = {
          itemId: entryData.itemId,
          itemName: entryData.itemName || '',
          batchNumber: batchNumber,
          expiryDate: entryData.expiryDate || '',
          initialQuantity: qty,
          currentQuantity: qty,
          unit: entryData.unit || 'unidades',
          costPrice: parseFloat(entryData.costPrice) || 0,
          supplierName: entryData.supplierName || '',
          invoiceNumber: entryData.invoiceNumber || '',
          status,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        const ref = await addDoc(collection(db, 'product_batches'), newBatch);
        return { id: ref.id, ...newBatch };
      }
    } catch (e) {
      console.error('Erro ao registrar lote no estoque:', e);
      return null;
    }
  };

export const deductProductBatch = async (batchId, quantityToDeduct) => {
    if (!batchId) return null;
    const qty = parseFloat(quantityToDeduct) || 0;
    if (qty <= 0) return null;

    if (USE_MOCK) return mockFirestore.deductProductBatch ? mockFirestore.deductProductBatch(batchId, qty) : null;

    try {
      const { getFirestore, doc, getDoc, updateDoc } = await import('firebase/firestore');
      const db = getFirestore(app);
      const batchRef = doc(db, 'product_batches', batchId);
      const snap = await getDoc(batchRef);
      if (!snap.exists()) return null;

      const data = snap.data();
      const currentQty = parseFloat(data.currentQuantity) || 0;
      const newQty = Math.max(0, currentQty - qty);

      let status = 'Ativo';
      if (newQty <= 0) {
        status = 'Esgotado';
      } else if (data.expiryDate && new Date(data.expiryDate) < new Date()) {
        status = 'Vencido';
      }

      await updateDoc(batchRef, {
        currentQuantity: newQty,
        status,
        updatedAt: new Date().toISOString()
      });

      return { id: batchId, ...data, currentQuantity: newQty, status };
    } catch (e) {
      console.error('Erro ao abater lote:', e);
      return null;
    }
  };

export const getPatientDispensations = async (patientId = null) => {
    if (USE_MOCK) return mockFirestore.getPatientDispensations ? mockFirestore.getPatientDispensations(patientId) : [];
    try {
      const { getFirestore, collection, getDocs, query, where, orderBy } = await import('firebase/firestore');
      const db = getFirestore(app);
      
      let snap;
      if (patientId) {
        const q = query(
          collection(db, 'patient_dispensations'),
          where('patientId', '==', patientId)
        );
        snap = await getDocs(q);
      } else {
        snap = await getDocs(collection(db, 'patient_dispensations'));
      }

      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      list.sort((a, b) => new Date(b.date || b.createdAt || 0) - new Date(a.date || a.createdAt || 0));
      return list;
    } catch (e) {
      console.error('Erro ao buscar dispensações do paciente:', e);
      return [];
    }
  };

export const savePatientDispensation = async (dispData) => {
    if (USE_MOCK) return mockFirestore.savePatientDispensation ? mockFirestore.savePatientDispensation(dispData) : dispData;
    try {
      const { getFirestore, collection, addDoc } = await import('firebase/firestore');
      const db = getFirestore(app);
      
      const payload = {
        ...dispData,
        date: dispData.date || new Date().toISOString(),
        createdAt: new Date().toISOString()
      };

      const ref = await addDoc(collection(db, 'patient_dispensations'), payload);
      return { id: ref.id, ...payload };
    } catch (e) {
      console.error('Erro ao registrar dispensação do paciente:', e);
      return null;
    }
  };

export const getBatchTraceability = async (searchTerm) => {
    if (!searchTerm) return { batches: [], dispensations: [] };
    const term = String(searchTerm).trim().toLowerCase();

    if (USE_MOCK) return mockFirestore.getBatchTraceability ? mockFirestore.getBatchTraceability(term) : { batches: [], dispensations: [] };

    try {
      const { getFirestore, collection, getDocs } = await import('firebase/firestore');
      const db = getFirestore(app);

      // 1. Fetch batches
      const batchSnap = await getDocs(collection(db, 'product_batches'));
      const allBatches = batchSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      
      const matchingBatches = allBatches.filter(b => 
        (b.batchNumber && b.batchNumber.toLowerCase().includes(term)) ||
        (b.itemName && b.itemName.toLowerCase().includes(term)) ||
        (b.invoiceNumber && b.invoiceNumber.toLowerCase().includes(term)) ||
        (b.id && b.id.toLowerCase() === term)
      );

      const batchNumbers = new Set(matchingBatches.map(b => (b.batchNumber || '').toLowerCase()).filter(Boolean));
      const batchIds = new Set(matchingBatches.map(b => b.id));

      // 2. Fetch dispensations
      const dispSnap = await getDocs(collection(db, 'patient_dispensations'));
      const allDispensations = dispSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      const matchingDispensations = allDispensations.filter(d => 
        (d.batchNumber && (batchNumbers.has(d.batchNumber.toLowerCase()) || d.batchNumber.toLowerCase().includes(term))) ||
        (d.batchId && batchIds.has(d.batchId)) ||
        (d.itemName && d.itemName.toLowerCase().includes(term)) ||
        (d.patientName && d.patientName.toLowerCase().includes(term))
      );

      matchingDispensations.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

      return {
        batches: matchingBatches,
        dispensations: matchingDispensations
      };
    } catch (e) {
      console.error('Erro ao buscar rastreabilidade de lote:', e);
      return { batches: [], dispensations: [] };
    }
  };



