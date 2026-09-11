# MediCare — Hospital Management System
### *A Full-Stack Database Management System for Hospital Operations*

[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16%2B-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20%2B-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.19-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-5.22-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

---

## 🏥 About MediCare

**MediCare** is a production-grade, enterprise Hospital Management System built from the ground up for a university **Database Management Systems (DBMS)** project. 

Unlike toy mock applications, **MediCare is backed 100% by a real relational PostgreSQL database**. Every clinical encounter, inventory change, appointment booking, diagnostic test, and invoice settlement is managed through strictly enforced relational schemas in **Third Normal Form (3NF)** with zero data anomalies.

### Key Highlights
- **12 Relational Entities**: Strongly typed schemas with check constraints, foreign keys, and unique indexes.
- **True 3NF Normalization**: Rigorously decomposed to eliminate insertion, deletion, and update anomalies.
- **Automated Inventory Decrement**: PostgreSQL triggers automatically reduce pharmacy stock when prescriptions are issued.
- **Double-Booking Conflict Prevention**: Multi-column uniqueness constraints (`doctor_id, appointment_date, appointment_time`) stop scheduling collisions.
- **Itemized Billing Calculator**: Computes doctor consultation fees, pharmacy drugs, and diagnostic tests with print-ready receipts.
- **Interactive DBMS Explorer**: An in-browser query workbench built for professors and examiners during project viva examinations.
- **One-Click Role Switching**: Instant demonstration of `ADMIN`, `DOCTOR`, and `RECEPTIONIST` security contexts.

---

## 👥 Demo Access & Roles

MediCare includes pre-seeded accounts for instant evaluation:

| Role | Email | Password | Access Highlights |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@medicare.demo` | `Admin@123` | Full administrative control, inventory editing, DBMS explorer query runner. |
| **Doctor** | `doctor@medicare.demo` | `Doctor@123` | Clinical consults, prescribing medications, recording diagnostic records. |
| **Receptionist** | `reception@medicare.demo` | `Reception@123` | Patient registration, scheduling appointments, invoice settlement. |

*(You can also use the 1-click **Quick Demo Login** buttons on the login page to switch roles instantly!)*

---

## 🗄️ Relational Database Architecture

```
                                  +---------------+
                                  |     USERS     |
                                  +-------+-------+
                                          | 1:1
                                          v
+---------------+ 1:N             +-------+-------+
|  DEPARTMENTS  +---------------->|    DOCTORS    |
+---------------+                 +-------+-------+
                                          |
                     +--------------------+--------------------+
                     | 1:N                | 1:N                | 1:N
                     v                    v                    v
+---------------+ 1:N|            +-------+-------+    +-------+-------+
|   PATIENTS    +----+----------->|  APPOINTMENTS |    |MEDICAL_RECORDS|
+-------+-------+                 +-------+-------+    +---------------+
        |                                 |
        | 1:N                             | 1:1 (optional)
        +--------------------+------------+--------------------+
        |                    |                                 |
        v                    v                                 v
+-------+-------+    +-------+-------+ 1:N             +-------+-------+
|   BILLINGS    |    | PRESCRIPTIONS +---------------->| PRESCRIP_ITEMS|
+---------------+    +---------------+                 +-------+-------+
        ^                                                      | N:1
        | 1:N                                                  v
+-------+-------+ 1:N             +---------------+    +-------+-------+
|PAT_LAB_TESTS  |<----------------+   LAB_TESTS   |    |   MEDICINES   |
+---------------+                 +---------------+    +---------------+
```

### Relational Schema (12 Tables)
1. **`users`**: Authentication credentials, password salts, and role-based permissions.
2. **`departments`**: Clinical departments (Cardiology, Neurology, Pediatrics, Orthopedics, etc.).
3. **`doctors`**: Staff physicians, licensing numbers, consultation rates, and real-time duty status.
4. **`patients`**: Master demographic records, DOB, blood group, and emergency contact details.
5. **`appointments`**: Patient visits with conflict-prevention unique slots.
6. **`medicines`**: Pharmacy inventory with real-time stock counts and expiry dates.
7. **`prescriptions`**: Master prescription records with doctor diagnoses and advice.
8. **`prescription_items`**: Composition table of prescribed drugs, dosages, and regimens.
9. **`medical_records`**: Electronic health records with clinical findings and treatment plans.
10. **`lab_tests`**: Catalog of diagnostic laboratory assays and standard prices.
11. **`patient_lab_tests`**: Patient diagnostic test orders, specimen tracking, and findings.
12. **`billings`**: Invoices with automatic calculation of consultation, pharmacy, and test charges.

---

## 🧪 Advanced DBMS Concepts Implemented

1. **Third Normal Form (3NF)**:
   - Decomposed to ensure every non-prime attribute is non-transitively and fully dependent on candidate keys.
2. **Integrity Constraints**:
   - `PRIMARY KEY` (UUIDs), `FOREIGN KEY` (with `ON DELETE CASCADE` / `RESTRICT`).
   - Domain `CHECK` constraints on non-negative pricing and valid enumerated types.
3. **Relational Views**:
   - `patient_appointment_view`: Multi-table joins for appointment scheduling.
   - `doctor_schedule_view`: Grouped doctor workloads.
   - `low_stock_medicines_view`: Automated reorder alerts ($\le 25$ units or $<90$ days to expiry).
   - `monthly_revenue_view`: Real-time financial revenue rollups.
   - `patient_billing_summary_view`: Lifetime patient billing accounts.
4. **Database Triggers**:
   - `trg_deduct_medicine_stock`: Decrements pharmacy inventory automatically when prescription items are inserted.
   - `trg_update_patients_timestamp`: Auto-manages `updated_at` timestamps on row mutation.
5. **Stored Procedures & Functions**:
   - `calculate_bill_total`: Procedural billing calculation inside PostgreSQL.
   - `get_doctor_appointment_stats`: Workload analytics for clinicians.
   - `get_patient_clinical_summary`: Aggregated lifetime patient visits and balances.
6. **ACID Transactions**:
   - Multi-item prescription issuance and inventory decrements wrapped in `prisma.$transaction`.

---

## 🚀 Quick Start (Local Setup)

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0.0 or higher)
- [PostgreSQL](https://www.postgresql.org/) (v14.0 or higher) or run the embedded postgres utility provided.

### 1. Clone the Repository
```bash
git clone https://github.com/anweshamondal5/medicare-hospital-management-system.git
cd medicare-hospital-management-system
```

### 2. Configure Environment Variables
Inside `backend/.env`:
```env
PORT=5000
DATABASE_URL="postgresql://postgres:password@localhost:5432/medicare_db"
JWT_SECRET="medicare_super_secret_jwt_key_2026"
CORS_ORIGIN="http://localhost:5173"
NODE_ENV="development"
```

Inside `frontend/.env`:
```env
VITE_API_URL="http://localhost:5000/api"
```

### 3. Setup Backend & Seed Database
```bash
cd backend
npm install

# Push schema to PostgreSQL & generate Prisma Client
npx prisma db push

# Install database views, triggers, and stored procedures
npx tsx src/db/setupViews.ts

# Seed realistic hospital dataset (30+ patients, 10 doctors, 50+ appointments)
npx tsx src/db/seed.ts

# Start backend server
npm run dev
```

### 4. Setup Frontend
```bash
cd ../frontend
npm install
npm run dev
```

Visit **`http://localhost:5173`** in your browser!

---

## 🔍 Running Automated Integration Tests

MediCare includes an automated integration test suite verifying authentication, patient flows, scheduling conflicts, transactional stock decrement, and billing calculations:

```bash
cd backend
npm test
```

Expected output:
```text
PASS tests/api.test.ts
  MediCare HMS — Backend Integration Tests
    ✓ Authentication & Role Authorization (5 tests)
    ✓ Patient Management (3 tests)
    ✓ Doctor Management & Appointment Conflicts (3 tests)
    ✓ Medicine Inventory & Transactional Prescriptions (2 tests)
    ✓ Billing Calculations (1 test)
    ✓ Role-Based Access Guards (RBAC) (2 tests)

Test Suites: 1 passed, 1 total
Tests:       16 passed, 16 total
```

---

## 📚 Academic Documentation

Complete academic reports and database specifications are available in the [`docs/`](docs/) directory:
- [**Comprehensive DBMS Project Report**](docs/DBMS-Project-Report.md) — 15-chapter formal university project report.
- [**Entity-Relationship (ER) Diagram**](docs/ER-Diagram.md) — Full Mermaid ER diagram and relationship catalog.
- [**Relational Database Design & Normalization**](docs/Database-Design.md) — 1NF, 2NF, 3NF mathematical proofs & Data Dictionary.
- [**RESTful API Specification**](docs/API.md) — Complete endpoint documentation and JSON payloads.

---

## 📄 License
This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
