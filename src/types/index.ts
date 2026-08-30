export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'doctor' | 'nurse' | 'nurse_tech' | 'receptionist' | 'hr' | 'finance' | string;
  createdAt?: string | Date;
}

export interface Patient {
  id: string;
  name: string;
  email?: string;
  phone: string;
  cpf: string;
  birthDate?: string | Date;
  address?: Address;
  medicalRecord?: MedicalRecord;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface Address {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  bloodType?: string;
  allergies?: string[];
  notes?: string;
}

export interface Employee {
  id: string;
  name: string;
  email?: string;
  cpf: string;
  role: string;
  departmentId?: string;
  sector?: string;
  phone?: string;
  status: 'active' | 'inactive' | 'on_leave';
  admissionDate: string;
}

export interface StockItem {
  id: string;
  name: string;
  category: string;
  currentStock: number;
  minStock: number;
  unit: string;
  price: number;
  defaultSectorId?: string;
}
