-- =============================================================================
-- MediCare — Hospital Management System (HMS)
-- Database Relational Schema (PostgreSQL DDL)
-- Academic DBMS Capstone Project (3rd Normal Form Compliant)
-- =============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Clean existing schema if re-running
DROP TABLE IF EXISTS patient_lab_tests CASCADE;
DROP TABLE IF EXISTS lab_tests CASCADE;
DROP TABLE IF EXISTS medical_records CASCADE;
DROP TABLE IF EXISTS billings CASCADE;
DROP TABLE IF EXISTS prescription_items CASCADE;
DROP TABLE IF EXISTS prescriptions CASCADE;
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS medicines CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS doctors CASCADE;
DROP TABLE IF EXISTS departments CASCADE;
DROP TABLE IF EXISTS patients CASCADE;

-- -----------------------------------------------------------------------------
-- 1. DEPARTMENT ENTITY
-- -----------------------------------------------------------------------------
CREATE TABLE departments (
    department_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    department_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    location VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- 2. DOCTOR ENTITY
-- -----------------------------------------------------------------------------
CREATE TABLE doctors (
    doctor_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    specialization VARCHAR(100) NOT NULL,
    department_id UUID NOT NULL REFERENCES departments(department_id) ON DELETE RESTRICT,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    license_number VARCHAR(50) NOT NULL UNIQUE,
    consultation_fee NUMERIC(10, 2) NOT NULL CHECK (consultation_fee >= 0),
    availability_status VARCHAR(20) NOT NULL DEFAULT 'Available' 
        CHECK (availability_status IN ('Available', 'In Consultation', 'On Leave', 'Unavailable')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- 3. PATIENT ENTITY
-- -----------------------------------------------------------------------------
CREATE TABLE patients (
    patient_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender VARCHAR(10) NOT NULL CHECK (gender IN ('Male', 'Female', 'Other')),
    blood_group VARCHAR(5) NOT NULL CHECK (blood_group IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
    phone VARCHAR(20) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    address TEXT NOT NULL,
    emergency_contact VARCHAR(50) NOT NULL,
    registration_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- 4. USER AUTHENTICATION & ROLE-BASED ACCESS ENTITY
-- -----------------------------------------------------------------------------
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('ADMIN', 'DOCTOR', 'RECEPTIONIST')),
    doctor_id UUID UNIQUE REFERENCES doctors(doctor_id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- 5. APPOINTMENT ENTITY
-- -----------------------------------------------------------------------------
CREATE TABLE appointments (
    appointment_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(patient_id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES doctors(doctor_id) ON DELETE RESTRICT,
    appointment_date DATE NOT NULL,
    appointment_time VARCHAR(10) NOT NULL,
    reason TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Scheduled' 
        CHECK (status IN ('Scheduled', 'Completed', 'Cancelled', 'No Show')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    -- Business Constraint: Prevent double booking of the same doctor at the same slot
    CONSTRAINT uq_doctor_appointment_slot UNIQUE (doctor_id, appointment_date, appointment_time)
);

-- -----------------------------------------------------------------------------
-- 6. MEDICINE INVENTORY ENTITY
-- -----------------------------------------------------------------------------
CREATE TABLE medicines (
    medicine_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    medicine_name VARCHAR(100) NOT NULL UNIQUE,
    category VARCHAR(50) NOT NULL,
    manufacturer VARCHAR(100) NOT NULL,
    unit_price NUMERIC(10, 2) NOT NULL CHECK (unit_price >= 0),
    stock_quantity INTEGER NOT NULL CHECK (stock_quantity >= 0),
    expiry_date DATE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- 7. PRESCRIPTION ENTITY
-- -----------------------------------------------------------------------------
CREATE TABLE prescriptions (
    prescription_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(patient_id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES doctors(doctor_id) ON DELETE RESTRICT,
    appointment_id UUID UNIQUE REFERENCES appointments(appointment_id) ON DELETE SET NULL,
    prescription_date DATE NOT NULL DEFAULT CURRENT_DATE,
    diagnosis TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- 8. PRESCRIPTION ITEM ENTITY (Many-to-Many Bridge between Prescriptions & Medicines)
-- -----------------------------------------------------------------------------
CREATE TABLE prescription_items (
    prescription_item_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prescription_id UUID NOT NULL REFERENCES prescriptions(prescription_id) ON DELETE CASCADE,
    medicine_id UUID NOT NULL REFERENCES medicines(medicine_id) ON DELETE RESTRICT,
    dosage VARCHAR(50) NOT NULL,
    frequency VARCHAR(50) NOT NULL,
    duration VARCHAR(50) NOT NULL,
    instructions TEXT
);

-- -----------------------------------------------------------------------------
-- 9. BILLING ENTITY
-- -----------------------------------------------------------------------------
CREATE TABLE billings (
    bill_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(patient_id) ON DELETE CASCADE,
    appointment_id UUID UNIQUE REFERENCES appointments(appointment_id) ON DELETE SET NULL,
    bill_date DATE NOT NULL DEFAULT CURRENT_DATE,
    consultation_charge NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (consultation_charge >= 0),
    medicine_charge NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (medicine_charge >= 0),
    test_charge NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (test_charge >= 0),
    other_charge NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (other_charge >= 0),
    discount NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (discount >= 0),
    total_amount NUMERIC(10, 2) NOT NULL CHECK (total_amount >= 0),
    payment_status VARCHAR(20) NOT NULL DEFAULT 'Pending' 
        CHECK (payment_status IN ('Paid', 'Pending', 'Partially Paid')),
    payment_method VARCHAR(30) NOT NULL DEFAULT 'Cash' 
        CHECK (payment_method IN ('Cash', 'Credit Card', 'Debit Card', 'Insurance', 'UPI', 'Net Banking')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- 10. MEDICAL RECORD ENTITY
-- -----------------------------------------------------------------------------
CREATE TABLE medical_records (
    record_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(patient_id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES doctors(doctor_id) ON DELETE RESTRICT,
    appointment_id UUID REFERENCES appointments(appointment_id) ON DELETE SET NULL,
    diagnosis TEXT NOT NULL,
    symptoms TEXT NOT NULL,
    treatment TEXT NOT NULL,
    notes TEXT,
    record_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- 11. LAB TEST CATALOG ENTITY
-- -----------------------------------------------------------------------------
CREATE TABLE lab_tests (
    test_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    test_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- 12. PATIENT LAB TEST ORDERS ENTITY
-- -----------------------------------------------------------------------------
CREATE TABLE patient_lab_tests (
    patient_lab_test_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(patient_id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES doctors(doctor_id) ON DELETE RESTRICT,
    test_id UUID NOT NULL REFERENCES lab_tests(test_id) ON DELETE RESTRICT,
    appointment_id UUID REFERENCES appointments(appointment_id) ON DELETE SET NULL,
    test_date DATE NOT NULL DEFAULT CURRENT_DATE,
    result TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'Ordered' 
        CHECK (status IN ('Ordered', 'In Progress', 'Completed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- INDEXES FOR PERFORMANCE OPTIMIZATION
-- -----------------------------------------------------------------------------
CREATE INDEX idx_appointments_patient ON appointments(patient_id);
CREATE INDEX idx_appointments_doctor ON appointments(doctor_id);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_prescriptions_patient ON prescriptions(patient_id);
CREATE INDEX idx_prescription_items_prescription ON prescription_items(prescription_id);
CREATE INDEX idx_billings_patient ON billings(patient_id);
CREATE INDEX idx_billings_status ON billings(payment_status);
CREATE INDEX idx_medical_records_patient ON medical_records(patient_id);
CREATE INDEX idx_patient_lab_tests_patient ON patient_lab_tests(patient_id);
CREATE INDEX idx_medicines_stock ON medicines(stock_quantity);
