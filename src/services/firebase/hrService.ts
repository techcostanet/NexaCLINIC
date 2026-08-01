import { app } from '../../firebase';
import { USE_MOCK, mockFirestore } from './mockDb';
import type { Employee } from '../../types/index';

export const getEmployees = async (): Promise<Employee[]> => {
    if (USE_MOCK) return mockFirestore.getEmployees();
    const { getFirestore, collection, getDocs, addDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    try {
      const snap = await getDocs(collection(db, 'employees'));
      if (snap.empty) {
        // Seed initial employees into Cloud Firestore
        const mockEmps = await mockFirestore.getEmployees();
        const seeded: Employee[] = [];
        for (const emp of mockEmps) {
          const { id, ...data } = emp;
          const ref = await addDoc(collection(db, 'employees'), data);
          seeded.push({ id: ref.id, ...(data as Omit<Employee, 'id'>) } as Employee);
        }
        return seeded;
      }
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Employee));
    } catch (err) {
      console.error("Erro ao buscar funcionários do Firestore:", err);
      return [];
    }
  };

export const createEmployee = async (employeeData: Omit<Employee, 'id'>): Promise<Employee> => {
    if (USE_MOCK) return mockFirestore.createEmployee(employeeData);
    const { getFirestore, collection, addDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    const docRef = await addDoc(collection(db, 'employees'), {
      ...employeeData,
      createdAt: new Date().toISOString()
    });
    return { id: docRef.id, ...employeeData } as Employee;
  };

export const updateEmployee = async (id: string, employeeData: Partial<Employee>): Promise<Partial<Employee> & { id: string }> => {
    if (USE_MOCK) return mockFirestore.updateEmployee(id, employeeData);
    const { getFirestore, doc, updateDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    await updateDoc(doc(db, 'employees', id), employeeData);
    return { id, ...employeeData };
  };

export const deleteEmployee = async (id: string): Promise<any> => {
    if (USE_MOCK) return mockFirestore.deleteEmployee(id);
    const { getFirestore, doc, deleteDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    return deleteDoc(doc(db, 'employees', id));
  };

export const getShifts = async (): Promise<any[]> => {
    if (USE_MOCK) {
      return mockFirestore.getShifts();
    }
    const { getFirestore, collection, getDocs } = await import('firebase/firestore');
    const db = getFirestore(app);
    const snap = await getDocs(collection(db, 'shifts'));
    if (snap.empty) {
      const { writeBatch, doc } = await import('firebase/firestore');
      const batch = writeBatch(db);
      const defaults = [
        { id: 'shift_1', name: '1º Turno' },
        { id: 'shift_2', name: '2º Turno' },
        { id: 'shift_3', name: '3º Turno' }
      ];
      defaults.forEach(s => {
        batch.set(doc(db, 'shifts', s.id), s);
      });
      await batch.commit();
      return defaults;
    }
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  };

export const createShift = async (shiftData: any): Promise<any> => {
    if (USE_MOCK) {
      return mockFirestore.createShift(shiftData);
    }
    const { getFirestore, collection, addDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    const docRef = await addDoc(collection(db, 'shifts'), shiftData);
    return { id: docRef.id, ...shiftData };
  };

export const updateShift = async (id: string, shiftData: any): Promise<any> => {
    if (USE_MOCK) {
      return mockFirestore.updateShift(id, shiftData);
    }
    const { getFirestore, doc, updateDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    return updateDoc(doc(db, 'shifts', id), shiftData);
  };

export const deleteShift = async (id: string): Promise<any> => {
    if (USE_MOCK) {
      return mockFirestore.deleteShift(id);
    }
    const { getFirestore, doc, deleteDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    return deleteDoc(doc(db, 'shifts', id));
  };

export const getTransportVouchers = async (): Promise<any[]> => {
    if (USE_MOCK) return mockFirestore.getTransportVouchers();
    try {
      const { getFirestore, collection, getDocs } = await import('firebase/firestore');
      const db = getFirestore(app);
      const snap = await getDocs(collection(db, 'transport_vouchers'));
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (e) {
      console.error('Erro Firestore export const getTransportVouchers =', e);
      return [];
    }
  };

export const createTransportVoucher = async (voucherData: any): Promise<any> => {
    if (USE_MOCK) return mockFirestore.createTransportVoucher(voucherData);
    const { getFirestore, collection, addDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    const docRef = await addDoc(collection(db, 'transport_vouchers'), {
      ...voucherData,
      createdAt: new Date().toISOString()
    });
    return { id: docRef.id, ...voucherData };
  };

export const updateTransportVoucher = async (id: string, voucherData: any): Promise<any> => {
    if (USE_MOCK) return mockFirestore.updateTransportVoucher(id, voucherData);
    const { getFirestore, doc, updateDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    await updateDoc(doc(db, 'transport_vouchers', id), {
      ...voucherData,
      updatedAt: new Date().toISOString()
    });
    return { id, ...voucherData };
  };

export const deleteTransportVoucher = async (id: string): Promise<any> => {
    if (USE_MOCK) return mockFirestore.deleteTransportVoucher(id);
    const { getFirestore, doc, deleteDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    await deleteDoc(doc(db, 'transport_vouchers', id));
    return { success: true };
  };
