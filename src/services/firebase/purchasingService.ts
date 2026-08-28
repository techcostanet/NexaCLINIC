import { app } from './config';
import { USE_MOCK } from './mockDb';
import { uploadFileToStorage } from './storageService';

export interface QuotedItem {
  id: string;
  productId?: string;
  productName: string;
  quantity: number;
  unit: string;
  specification?: string;
  lastPricePaid?: number;
}

export interface InvitedSupplier {
  supplierId?: string;
  name: string;
  tradeName?: string;
  cnpj?: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  token: string;
  status: 'Pendente' | 'Visualizada' | 'Respondida' | 'Declinada';
  respondedAt?: string;
}

export interface WebQuotation {
  id?: string;
  code: string;
  title: string;
  unitId: string;
  unit: string;
  buyerName: string;
  buyerEmail?: string;
  status: 'Aberta' | 'Em Análise' | 'Homologada' | 'Cancelada' | 'Expirada';
  deadline: string; // ISO string or YYYY-MM-DDTHH:mm
  notes?: string;
  items: QuotedItem[];
  suppliers: InvitedSupplier[];
  winningSupplierId?: string;
  winningSupplierName?: string;
  winningSplits?: Record<string, string>; // itemId -> supplierId
  createdAt?: string;
  updatedAt?: string;
}

export interface SupplierItemOffer {
  itemId: string;
  productName: string;
  available: boolean;
  brand?: string;
  packaging?: string;
  unitPrice: number;
  totalPrice: number;
  itemNotes?: string;
}

export interface QuoteResponse {
  id?: string;
  quotationId: string;
  quotationCode?: string;
  token: string;
  supplierId?: string;
  supplierName: string;
  cnpj?: string;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  freightType: 'CIF' | 'FOB';
  freightValue?: number;
  minBillingValue?: number;
  paymentTerm: string;
  proposalValidityDays: number;
  leadTimeDays: number;
  proposalDocUrl?: string;
  proposalFileName?: string;
  observations?: string;
  items: SupplierItemOffer[];
  totalItemsAmount: number;
  totalGrandAmount: number;
  submittedAt: string;
}

// Generate random secure token
export const generateQuoteToken = (): string => {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let token = 'tok_';
  for (let i = 0; i < 16; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
};

// Generate friendly quotation code (e.g. COT-2026-001)
export const generateQuotationCode = (existingCount: number = 0): string => {
  const year = new Date().getFullYear();
  const seq = String(existingCount + 1).padStart(3, '0');
  return `COT-${year}-${seq}`;
};

/**
 * Busca todas as cotações web cadastradas
 */
export const getWebQuotations = async (): Promise<WebQuotation[]> => {
  if (USE_MOCK) {
    const local = localStorage.getItem('nexa_web_quotations');
    return local ? JSON.parse(local) : [];
  }

  try {
    const { getFirestore, collection, getDocs, orderBy, query } = await import('firebase/firestore');
    const db = getFirestore(app);
    const q = query(collection(db, 'web_quotations'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as WebQuotation));
  } catch (e) {
    try {
      const { getFirestore, collection, getDocs } = await import('firebase/firestore');
      const db = getFirestore(app);
      const snap = await getDocs(collection(db, 'web_quotations'));
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as WebQuotation));
    } catch (err) {
      console.error('Erro ao buscar cotações web:', err);
      const local = localStorage.getItem('nexa_web_quotations');
      return local ? JSON.parse(local) : [];
    }
  }
};

/**
 * Busca cotação específica por ID
 */
export const getWebQuotationById = async (id: string): Promise<WebQuotation | null> => {
  if (USE_MOCK) {
    const list = await getWebQuotations();
    return list.find(q => q.id === id) || null;
  }

  try {
    const { getFirestore, doc, getDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    const snap = await getDoc(doc(db, 'web_quotations', id));
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() } as WebQuotation;
    }
    return null;
  } catch (err) {
    console.error('Erro ao buscar cotação por ID:', err);
    return null;
  }
};

/**
 * Busca cotação por token do fornecedor (Acesso Público)
 */
export const getWebQuotationByToken = async (token: string): Promise<{ quotation: WebQuotation; supplier: InvitedSupplier } | null> => {
  if (!token) return null;

  try {
    const { getFirestore, collection, getDocs } = await import('firebase/firestore');
    const db = getFirestore(app);
    const snap = await getDocs(collection(db, 'web_quotations'));
    
    for (const d of snap.docs) {
      const qData = { id: d.id, ...d.data() } as WebQuotation;
      if (qData.suppliers && Array.isArray(qData.suppliers)) {
        const foundSupplier = qData.suppliers.find(s => s.token === token);
        if (foundSupplier) {
          return { quotation: qData, supplier: foundSupplier };
        }
      }
    }

    // Fallback local
    const local = localStorage.getItem('nexa_web_quotations');
    if (local) {
      const list = JSON.parse(local) as WebQuotation[];
      for (const qData of list) {
        const foundSupplier = qData.suppliers?.find(s => s.token === token);
        if (foundSupplier) {
          return { quotation: qData, supplier: foundSupplier };
        }
      }
    }

    return null;
  } catch (err) {
    console.error('Erro ao buscar cotação por token:', err);
    return null;
  }
};

/**
 * Cria nova cotação web
 */
export const createWebQuotation = async (quoteData: Omit<WebQuotation, 'id'>): Promise<WebQuotation> => {
  const dataToSave = {
    ...quoteData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  if (USE_MOCK) {
    const list = await getWebQuotations();
    const newQuote = { id: 'quote_' + Date.now(), ...dataToSave };
    list.unshift(newQuote);
    localStorage.setItem('nexa_web_quotations', JSON.stringify(list));
    return newQuote;
  }

  try {
    const { getFirestore, collection, addDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    const docRef = await addDoc(collection(db, 'web_quotations'), dataToSave);
    return { id: docRef.id, ...dataToSave };
  } catch (err) {
    console.error('Erro ao criar cotação no Firestore, salvando localmente:', err);
    const list = await getWebQuotations();
    const newQuote = { id: 'quote_' + Date.now(), ...dataToSave };
    list.unshift(newQuote);
    localStorage.setItem('nexa_web_quotations', JSON.stringify(list));
    return newQuote;
  }
};

/**
 * Atualiza cotação web
 */
export const updateWebQuotation = async (id: string, quoteData: Partial<WebQuotation>): Promise<void> => {
  const dataToUpdate = {
    ...quoteData,
    updatedAt: new Date().toISOString()
  };

  try {
    const { getFirestore, doc, updateDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    await updateDoc(doc(db, 'web_quotations', id), dataToUpdate);
  } catch (err) {
    console.error('Erro ao atualizar cotação no Firestore:', err);
  }

  // Sincroniza localmente
  const list = await getWebQuotations();
  const idx = list.findIndex(q => q.id === id);
  if (idx !== -1) {
    list[idx] = { ...list[idx], ...dataToUpdate };
    localStorage.setItem('nexa_web_quotations', JSON.stringify(list));
  }
};

/**
 * Salva a proposta comercial do fornecedor (Acesso Público via Portal)
 */
export const submitSupplierQuote = async (
  token: string,
  quotationId: string,
  supplierOffer: Omit<QuoteResponse, 'id' | 'submittedAt'>
): Promise<QuoteResponse> => {
  const responseData: QuoteResponse = {
    ...supplierOffer,
    quotationId,
    token,
    submittedAt: new Date().toISOString()
  };

  try {
    const { getFirestore, collection, addDoc, doc, updateDoc, getDoc } = await import('firebase/firestore');
    const db = getFirestore(app);

    // 1. Grava a resposta na coleção quote_responses
    const docRef = await addDoc(collection(db, 'quote_responses'), responseData);
    responseData.id = docRef.id;

    // 2. Atualiza o status do fornecedor dentro da cotação
    const quoteSnap = await getDoc(doc(db, 'web_quotations', quotationId));
    if (quoteSnap.exists()) {
      const q = quoteSnap.data() as WebQuotation;
      const updatedSuppliers = (q.suppliers || []).map(s => {
        if (s.token === token) {
          return {
            ...s,
            status: 'Respondida' as const,
            respondedAt: new Date().toISOString()
          };
        }
        return s;
      });

      // Se houver status Aberta e receber resposta, passa para Em Análise
      const newStatus = q.status === 'Aberta' ? 'Em Análise' : q.status;

      await updateDoc(doc(db, 'web_quotations', quotationId), {
        suppliers: updatedSuppliers,
        status: newStatus,
        updatedAt: new Date().toISOString()
      });
    }
  } catch (err) {
    console.error('Erro ao salvar proposta no Firestore, salvando localmente:', err);
    const localResp = localStorage.getItem('nexa_quote_responses') || '[]';
    const parsedResp = JSON.parse(localResp);
    responseData.id = 'resp_' + Date.now();
    parsedResp.push(responseData);
    localStorage.setItem('nexa_quote_responses', JSON.stringify(parsedResp));
  }

  return responseData;
};

/**
 * Busca todas as propostas recebidas para uma cotação específica
 */
export const getQuoteResponses = async (quotationId: string): Promise<QuoteResponse[]> => {
  try {
    const { getFirestore, collection, getDocs, query, where } = await import('firebase/firestore');
    const db = getFirestore(app);
    const q = query(collection(db, 'quote_responses'), where('quotationId', '==', quotationId));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as QuoteResponse));
  } catch (e) {
    try {
      const { getFirestore, collection, getDocs } = await import('firebase/firestore');
      const db = getFirestore(app);
      const snap = await getDocs(collection(db, 'quote_responses'));
      const all = snap.docs.map(d => ({ id: d.id, ...d.data() } as QuoteResponse));
      return all.filter(r => r.quotationId === quotationId);
    } catch (err) {
      console.error('Erro ao buscar propostas do Firestore:', err);
      const local = localStorage.getItem('nexa_quote_responses') || '[]';
      const list = JSON.parse(local) as QuoteResponse[];
      return list.filter(r => r.quotationId === quotationId);
    }
  }
};

/**
 * Upload de anexo de proposta formal de fornecedor (PDF / Catálogo)
 */
export const uploadSupplierProposalDoc = async (
  file: File,
  quotationCode: string,
  supplierName: string
): Promise<string> => {
  const cleanCode = (quotationCode || 'cotacao').replace(/[^a-zA-Z0-9_-]/g, '_');
  const cleanSupplier = (supplierName || 'fornecedor').replace(/[^a-zA-Z0-9_-]/g, '_');
  const timestamp = Date.now();
  const cleanFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const path = `quotation_proposals/${cleanCode}/${cleanSupplier}_${timestamp}_${cleanFileName}`;

  return uploadFileToStorage(file, path);
};
