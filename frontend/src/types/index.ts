export type UserRole = 'ADMIN' | 'DOCTOR' | 'RECEPTIONIST';

export interface User {
  user_id: string;
  name: string;
  email: string;
  role: UserRole;
  doctor?: Doctor | null;
}

export interface Department {
  department_id: string;
  department_name: string;
  description?: string | null;
  location: string;
  created_at: string;
  _count?: {
    doctors: number;
  };
}

export interface Doctor {
  doctor_id: string;
  first_name: string;
  last_name: string;
  specialization: string;
  department_id: string;
  department?: Department;
  phone: string;
  email: string;
  license_number: string;
  consultation_fee: number | string;
  availability_status: 'Available' | 'In Consultation' | 'On Leave' | 'Unavailable';
  created_at: string;
  _count?: {
    appointments: number;
    prescriptions: number;
    medical_records: number;
  };
}

export interface Patient {
  patient_id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: 'Male' | 'Female' | 'Other';
  blood_group: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  phone: string;
  email: string;
  address: string;
  emergency_contact: string;
  registration_date: string;
  created_at: string;
  updated_at: string;
  _count?: {
    appointments: number;
    prescriptions: number;
    medical_records: number;
    billings: number;
  };
  appointments?: Appointment[];
  medical_records?: MedicalRecord[];
  prescriptions?: Prescription[];
  patient_lab_tests?: PatientLabTest[];
  billings?: Billing[];
}

export interface Appointment {
  appointment_id: string;
  patient_id: string;
  patient?: Patient;
  doctor_id: string;
  doctor?: Doctor;
  appointment_date: string;
  appointment_time: string;
  reason: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled' | 'No Show';
  notes?: string | null;
  created_at: string;
  prescription?: Prescription | null;
  billing?: Billing | null;
}

export interface Medicine {
  medicine_id: string;
  medicine_name: string;
  category: string;
  manufacturer: string;
  unit_price: number | string;
  stock_quantity: number;
  expiry_date: string;
  description?: string | null;
  created_at: string;
}

export interface PrescriptionItem {
  prescription_item_id: string;
  prescription_id: string;
  medicine_id: string;
  medicine?: Medicine;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string | null;
}

export interface Prescription {
  prescription_id: string;
  patient_id: string;
  patient?: Patient;
  doctor_id: string;
  doctor?: Doctor;
  appointment_id?: string | null;
  appointment?: Appointment;
  prescription_date: string;
  diagnosis: string;
  notes?: string | null;
  created_at: string;
  items: PrescriptionItem[];
}

export interface Billing {
  bill_id: string;
  patient_id: string;
  patient?: Patient;
  appointment_id?: string | null;
  appointment?: Appointment;
  bill_date: string;
  consultation_charge: number | string;
  medicine_charge: number | string;
  test_charge: number | string;
  other_charge: number | string;
  discount: number | string;
  total_amount: number | string;
  payment_status: 'Paid' | 'Pending' | 'Partially Paid';
  payment_method: 'Cash' | 'Credit Card' | 'Debit Card' | 'Insurance' | 'UPI' | 'Net Banking';
  created_at: string;
}

export interface MedicalRecord {
  record_id: string;
  patient_id: string;
  patient?: Patient;
  doctor_id: string;
  doctor?: Doctor;
  appointment_id?: string | null;
  appointment?: Appointment;
  diagnosis: string;
  symptoms: string;
  treatment: string;
  notes?: string | null;
  record_date: string;
  created_at: string;
}

export interface LabTest {
  test_id: string;
  test_name: string;
  description?: string | null;
  price: number | string;
  created_at: string;
}

export interface PatientLabTest {
  patient_lab_test_id: string;
  patient_id: string;
  patient?: Patient;
  doctor_id: string;
  doctor?: Doctor;
  test_id: string;
  test?: LabTest;
  appointment_id?: string | null;
  appointment?: Appointment;
  test_date: string;
  result?: string | null;
  status: 'Ordered' | 'In Progress' | 'Completed';
  created_at: string;
}

export interface DashboardStats {
  totalPatients: number;
  totalDoctors: number;
  todayAppointments: number;
  pendingAppointments: number;
  totalRevenue: number;
  availableMedicines: number;
  lowStockMedicines: number;
  appointmentDistribution: Array<{ status: string; count: number; fill: string }>;
  patientTrend: Array<{ month: string; patients: number }>;
  revenueTrend: Array<{ month: string; billed: number; collected: number }>;
  recentAppointments: Appointment[];
  lowStockList: Medicine[];
}

export type Bill = Billing;
export type LabTestOrder = PatientLabTest;
