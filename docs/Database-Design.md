# MediCare — Relational Database Design & Normalization Specification

## 1. Relational Database Architecture Overview
The database architecture for **MediCare — Hospital Management System** is designed using rigorous relational database management principles. It models full clinical, administrative, inventory, and financial workflows in an enterprise hospital setting.

The database is implemented in **PostgreSQL 16+** and managed through **Prisma ORM**, strictly adhering to **Third Normal Form (3NF)** with zero update, insertion, or deletion anomalies.

---

## 2. Formal Normalization Proof (1NF $\rightarrow$ 2NF $\rightarrow$ 3NF)

### 2.1 First Normal Form (1NF)
**Definition**: A relation $R$ is in 1NF if and only if all underlying domains contain only atomic (indivisible) values, and there are no repeating groups or multivalued attributes.

**Application in MediCare**:
1. **Atomicity**:
   - Patient names are decomposed into `first_name` and `last_name` rather than a composite `full_name`.
   - Doctor names are decomposed into `first_name` and `last_name`.
   - Contact numbers and emails are unique individual attributes.
   - Diagnostic and clinical notes are stored as scalar text attributes.
2. **Elimination of Repeating Groups**:
   - In a naive hospital record, a single prescription might contain multiple medicines in a comma-separated list (`"Paracetamol 500mg, Amoxicillin 250mg"`).
   - In MediCare, repeating medicine prescriptions are separated into a distinct relation: `PRESCRIPTION_ITEMS`, where each row represents exactly one prescribed medicine line-item referencing `PRESCRIPTIONS` via a foreign key `prescription_id`.
   - Similarly, multiple diagnostic tests per encounter are modeled via individual tuples in `PATIENT_LAB_TESTS`.

$$\therefore \text{All relations in MediCare satisfy 1NF.}$$

---

### 2.2 Second Normal Form (2NF)
**Definition**: A relation $R$ is in 2NF if and only if it is in 1NF and every non-prime attribute is **fully functionally dependent** on the entire primary key (i.e., no partial dependency on a proper subset of any candidate key).

**Application in MediCare**:
- Consider candidate relations with composite keys:
  - In `PRESCRIPTION_ITEMS`, the natural key is composite: `(prescription_id, medicine_id)`.
  - Attributes: `dosage`, `frequency`, `duration`, `instructions`.
  - **Functional Dependencies**:
    $$\{prescription\_id, medicine\_id\} \rightarrow dosage$$
    $$\{prescription\_id, medicine\_id\} \rightarrow frequency$$
    $$\{prescription\_id, medicine\_id\} \rightarrow duration$$
    $$\{prescription\_id, medicine\_id\} \rightarrow instructions$$
  - None of these attributes depend solely on `prescription_id` (since a prescription contains multiple drugs with differing instructions).
  - None of these attributes depend solely on `medicine_id` (since different patients receive different dosages and durations for the same drug).
  - Pharmaceutical specifications such as `medicine_name`, `category`, `unit_price`, and `stock_quantity` depend **only** on `medicine_id` ($medicine\_id \rightarrow unit\_price$).
  - If medicine details were kept inside `PRESCRIPTION_ITEMS`, there would be a partial dependency: $\{prescription\_id, medicine\_id\} \rightarrow unit\_price$ where $medicine\_id \subset \{prescription\_id, medicine\_id\}$.
  - **Resolution**: Medicine details are isolated in the `MEDICINES` relation ($PK = medicine\_id$). `PRESCRIPTION_ITEMS` contains only attributes that depend on the complete composite pair, augmented with a surrogate key `prescription_item_id`.

$$\therefore \text{No partial dependencies exist; all relations satisfy 2NF.}$$

---

### 2.3 Third Normal Form (3NF)
**Definition**: A relation $R$ is in 3NF if and only if it is in 2NF and for every non-trivial functional dependency $X \rightarrow Y$, either:
1. $X$ is a superkey of $R$, or
2. $Y$ is a prime attribute of $R$ (i.e., $Y$ is part of a candidate key).
*(Equivalently: No non-prime attribute is transitively dependent on the primary key.)*

**Application in MediCare**:
- **Case 1: Doctor and Department Relationship**:
  - In `DOCTORS`:
    $$doctor\_id \rightarrow department\_id$$
    $$department\_id \rightarrow department\_name, location$$
  - If `department_name` and `location` were stored directly in `DOCTORS`, the dependency $doctor\_id \rightarrow department\_name$ would be **transitive** through $department\_id$, violating 3NF.
  - **Decomposition**: Extracted into a separate entity `DEPARTMENTS` ($PK = department\_id$). `DOCTORS` stores only the foreign key `department_id`.
- **Case 2: Appointments and Billing**:
  - In naive billing tables, one might store doctor consultation fee alongside patient billing.
  - However, $bill\_id \rightarrow doctor\_id$ and $doctor\_id \rightarrow consultation\_fee$.
  - Storing doctor metadata in billing would introduce transitive dependency. In MediCare, `BILLINGS` records only the snapshot monetary figures (`consultation_charge`, `medicine_charge`, `test_charge`, `discount`, `total_amount`), while doctor details are resolved dynamically through the relational link `appointment_id` or explicit FK.
- **Case 3: Lab Test Pricing**:
  - In `PATIENT_LAB_TESTS`, we store `test_id`, `test_date`, `result`, and `status`.
  - Test pricing and description are governed by `LAB_TESTS` where $test\_id \rightarrow test\_name, price$.
  - Storing `test_name` in `PATIENT_LAB_TESTS` would be transitive: $patient\_lab\_test\_id \rightarrow test\_id \rightarrow test\_name$. Hence separated into `LAB_TESTS`.

$$\therefore \text{No transitive dependencies exist; all relations satisfy 3NF.}$$

---

## 3. Complete Data Dictionary (12 Relational Entities)

### Table 1: `users`
Authentication credentials and Role-Based Access Control (RBAC) security principals.
| Column | Type | Constraints | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `user_id` | UUID | PRIMARY KEY | `gen_random_uuid()` | Unique surrogate identifier for security account. |
| `email` | VARCHAR(120) | UNIQUE, NOT NULL | - | System login email address. |
| `password_hash` | VARCHAR(255) | NOT NULL | - | Bcrypt-hashed salted password string. |
| `name` | VARCHAR(100) | NOT NULL | - | Full human name of the system operator. |
| `role` | VARCHAR(20) | NOT NULL, CHECK (`role IN ('ADMIN', 'DOCTOR', 'RECEPTIONIST')`) | `'RECEPTIONIST'` | System access privilege role. |
| `created_at` | TIMESTAMPTZ | NOT NULL | `CURRENT_TIMESTAMP` | Account creation audit timestamp. |
| `updated_at` | TIMESTAMPTZ | NOT NULL | `CURRENT_TIMESTAMP` | Last profile change timestamp (trigger-managed). |

### Table 2: `departments`
Clinical, medical, and administrative hospital departments.
| Column | Type | Constraints | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `department_id` | UUID | PRIMARY KEY | `gen_random_uuid()` | Unique department ID. |
| `department_name` | VARCHAR(100) | UNIQUE, NOT NULL | - | Clinical specialty (e.g. Cardiology, Neurology). |
| `description` | TEXT | NULL | NULL | Overview of services and facilities. |
| `location` | VARCHAR(100) | NOT NULL | - | Physical location (e.g. Building A, Floor 3). |
| `created_at` | TIMESTAMPTZ | NOT NULL | `CURRENT_TIMESTAMP` | Registration timestamp. |

### Table 3: `doctors`
Medical practitioners and specialists on medical staff.
| Column | Type | Constraints | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `doctor_id` | UUID | PRIMARY KEY | `gen_random_uuid()` | Unique physician identifier. |
| `user_id` | UUID | UNIQUE, NULL, FK $\rightarrow$ `users(user_id)` ON DELETE SET NULL | NULL | Linked login user account. |
| `first_name` | VARCHAR(50) | NOT NULL | - | Doctor given name. |
| `last_name` | VARCHAR(50) | NOT NULL | - | Doctor family name. |
| `specialization`| VARCHAR(100) | NOT NULL | - | Medical specialty area. |
| `department_id` | UUID | NOT NULL, FK $\rightarrow$ `departments(department_id)` ON DELETE RESTRICT | - | Assigned clinical department. |
| `phone` | VARCHAR(20) | NOT NULL | - | Work telephone number. |
| `email` | VARCHAR(120) | UNIQUE, NOT NULL | - | Official hospital email. |
| `license_number`| VARCHAR(50) | UNIQUE, NOT NULL | - | Medical board registration license number. |
| `consultation_fee` | DECIMAL(10,2)| NOT NULL, CHECK (`consultation_fee >= 0.00`) | `500.00` | Standard out-patient consultation rate. |
| `availability_status` | VARCHAR(30) | NOT NULL, CHECK (`availability_status IN ('Available', 'In Consultation', 'On Leave', 'Unavailable')`) | `'Available'` | Real-time duty status. |
| `created_at` | TIMESTAMPTZ | NOT NULL | `CURRENT_TIMESTAMP` | Staff enrollment timestamp. |

### Table 4: `patients`
Registered hospital out-patients and in-patients.
| Column | Type | Constraints | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `patient_id` | UUID | PRIMARY KEY | `gen_random_uuid()` | Unique patient identifier. |
| `first_name` | VARCHAR(50) | NOT NULL | - | Patient given name. |
| `last_name` | VARCHAR(50) | NOT NULL | - | Patient family name. |
| `date_of_birth` | DATE | NOT NULL, CHECK (`date_of_birth <= CURRENT_DATE`) | - | Date of birth. |
| `gender` | VARCHAR(10) | NOT NULL, CHECK (`gender IN ('Male', 'Female', 'Other')`) | - | Biological/legal gender. |
| `blood_group` | VARCHAR(5) | NOT NULL, CHECK (`blood_group IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')`) | - | Blood group ABO & Rh type. |
| `phone` | VARCHAR(20) | NOT NULL | - | Contact telephone number. |
| `email` | VARCHAR(120) | UNIQUE, NOT NULL | - | Electronic notification address. |
| `address` | TEXT | NOT NULL | - | Residential street address. |
| `emergency_contact` | VARCHAR(20) | NOT NULL | - | Relative/guardian emergency phone. |
| `registration_date` | TIMESTAMPTZ | NOT NULL | `CURRENT_TIMESTAMP` | Initial hospital registration date. |
| `created_at` | TIMESTAMPTZ | NOT NULL | `CURRENT_TIMESTAMP` | Creation audit timestamp. |
| `updated_at` | TIMESTAMPTZ | NOT NULL | `CURRENT_TIMESTAMP` | Last updated timestamp (trigger-managed). |

### Table 5: `appointments`
Outpatient clinical appointment scheduling and status tracking.
| Column | Type | Constraints | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `appointment_id`| UUID | PRIMARY KEY | `gen_random_uuid()` | Unique booking identifier. |
| `patient_id` | UUID | NOT NULL, FK $\rightarrow$ `patients(patient_id)` ON DELETE CASCADE | - | Attending patient. |
| `doctor_id` | UUID | NOT NULL, FK $\rightarrow$ `doctors(doctor_id)` ON DELETE RESTRICT | - | Assigned doctor. |
| `appointment_date` | DATE | NOT NULL | - | Consultation date. |
| `appointment_time` | VARCHAR(20) | NOT NULL | - | Time slot (e.g. 10:00 AM). |
| `reason` | TEXT | NOT NULL | - | Primary complaint / purpose of visit. |
| `status` | VARCHAR(20) | NOT NULL, CHECK (`status IN ('Scheduled', 'Completed', 'Cancelled', 'No Show')`) | `'Scheduled'` | Current visit status. |
| `notes` | TEXT | NULL | NULL | Pre-consultation remarks. |
| `created_at` | TIMESTAMPTZ | NOT NULL | `CURRENT_TIMESTAMP` | Scheduling timestamp. |
| *Composite Unique* | - | `UNIQUE (doctor_id, appointment_date, appointment_time)` | - | Prevents double-booking doctor slots. |

### Table 6: `medicines`
Pharmaceutical inventory catalog, unit pricing, and real-time stock balances.
| Column | Type | Constraints | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `medicine_id` | UUID | PRIMARY KEY | `gen_random_uuid()` | Unique pharmaceutical code. |
| `medicine_name` | VARCHAR(120) | UNIQUE, NOT NULL | - | Brand & generic chemical name. |
| `category` | VARCHAR(50) | NOT NULL | - | Drug therapeutic category. |
| `manufacturer` | VARCHAR(100) | NOT NULL | - | Pharmaceutical manufacturing company. |
| `unit_price` | DECIMAL(10,2)| NOT NULL, CHECK (`unit_price >= 0.00`) | - | Price per retail unit/tablet. |
| `stock_quantity` | INTEGER | NOT NULL, CHECK (`stock_quantity >= 0`) | `0` | Available warehouse stock units. |
| `expiry_date` | DATE | NOT NULL | - | Batch expiry date. |
| `description` | TEXT | NULL | NULL | Indications, contraindications. |
| `created_at` | TIMESTAMPTZ | NOT NULL | `CURRENT_TIMESTAMP` | Catalog entry timestamp. |

### Table 7: `prescriptions`
Clinical prescriptions issued by licensed doctors during consultations.
| Column | Type | Constraints | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `prescription_id`| UUID | PRIMARY KEY | `gen_random_uuid()` | Unique prescription reference. |
| `patient_id` | UUID | NOT NULL, FK $\rightarrow$ `patients(patient_id)` ON DELETE CASCADE | - | Patient receiving therapy. |
| `doctor_id` | UUID | NOT NULL, FK $\rightarrow$ `doctors(doctor_id)` ON DELETE RESTRICT | - | Prescribing physician. |
| `appointment_id`| UUID | UNIQUE, NULL, FK $\rightarrow$ `appointments(appointment_id)` ON DELETE SET NULL | NULL | Linked encounter. |
| `prescription_date`| TIMESTAMPTZ | NOT NULL | `CURRENT_TIMESTAMP` | Prescription issue timestamp. |
| `diagnosis` | TEXT | NOT NULL | - | Working medical diagnosis. |
| `notes` | TEXT | NULL | NULL | General physician guidance. |
| `created_at` | TIMESTAMPTZ | NOT NULL | `CURRENT_TIMESTAMP` | Audit creation timestamp. |

### Table 8: `prescription_items`
Itemized drug line-items belonging to a clinical prescription.
| Column | Type | Constraints | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `prescription_item_id` | UUID | PRIMARY KEY | `gen_random_uuid()` | Unique line item reference. |
| `prescription_id` | UUID | NOT NULL, FK $\rightarrow$ `prescriptions(prescription_id)` ON DELETE CASCADE | - | Parent prescription master. |
| `medicine_id` | UUID | NOT NULL, FK $\rightarrow$ `medicines(medicine_id)` ON DELETE RESTRICT | - | Prescribed pharmaceutical. |
| `dosage` | VARCHAR(50) | NOT NULL | - | Dosage strength (e.g. 500mg). |
| `frequency` | VARCHAR(50) | NOT NULL | - | Administration frequency (e.g. TID). |
| `duration` | VARCHAR(50) | NOT NULL | - | Regimen length (e.g. 7 days). |
| `instructions` | TEXT | NULL | NULL | Special instructions (e.g. with meals). |

### Table 9: `medical_records`
Confidential electronic health records, diagnostic assessments, and treatment plans.
| Column | Type | Constraints | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `record_id` | UUID | PRIMARY KEY | `gen_random_uuid()` | Unique clinical record entry. |
| `patient_id` | UUID | NOT NULL, FK $\rightarrow$ `patients(patient_id)` ON DELETE CASCADE | - | Patient undergoing evaluation. |
| `doctor_id` | UUID | NOT NULL, FK $\rightarrow$ `doctors(doctor_id)` ON DELETE RESTRICT | - | Evaluating physician. |
| `appointment_id`| UUID | NULL, FK $\rightarrow$ `appointments(appointment_id)` ON DELETE SET NULL | NULL | Associated clinical visit. |
| `diagnosis` | TEXT | NOT NULL | - | Verified clinical diagnosis. |
| `symptoms` | TEXT | NOT NULL | - | Patient-reported physical symptoms. |
| `treatment` | TEXT | NOT NULL | - | Therapeutic action plan. |
| `notes` | TEXT | NULL | NULL | Confidential clinical remarks. |
| `record_date` | TIMESTAMPTZ | NOT NULL | `CURRENT_TIMESTAMP` | Examination timestamp. |
| `created_at` | TIMESTAMPTZ | NOT NULL | `CURRENT_TIMESTAMP` | Audit creation timestamp. |

### Table 10: `lab_tests`
Diagnostic test master catalog, pricing, and specimen guidelines.
| Column | Type | Constraints | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `test_id` | UUID | PRIMARY KEY | `gen_random_uuid()` | Unique diagnostic assay code. |
| `test_name` | VARCHAR(120) | UNIQUE, NOT NULL | - | Clinical test title (e.g. Lipid Profile). |
| `description` | TEXT | NULL | NULL | Specimen type, method, reference values. |
| `price` | DECIMAL(10,2)| NOT NULL, CHECK (`price >= 0.00`) | - | Standard charge for diagnostic assay. |
| `created_at` | TIMESTAMPTZ | NOT NULL | `CURRENT_TIMESTAMP` | Catalog addition timestamp. |

### Table 11: `patient_lab_tests`
Patient diagnostic lab orders, specimen collection, and results tracking.
| Column | Type | Constraints | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `patient_lab_test_id` | UUID | PRIMARY KEY | `gen_random_uuid()` | Unique lab requisition ID. |
| `patient_id` | UUID | NOT NULL, FK $\rightarrow$ `patients(patient_id)` ON DELETE CASCADE | - | Patient tested. |
| `doctor_id` | UUID | NOT NULL, FK $\rightarrow$ `doctors(doctor_id)` ON DELETE RESTRICT | - | Ordering physician. |
| `test_id` | UUID | NOT NULL, FK $\rightarrow$ `lab_tests(test_id)` ON DELETE RESTRICT | - | Ordered assay catalog reference. |
| `appointment_id`| UUID | NULL, FK $\rightarrow$ `appointments(appointment_id)` ON DELETE SET NULL | NULL | Associated clinical appointment. |
| `test_date` | TIMESTAMPTZ | NOT NULL | `CURRENT_TIMESTAMP` | Requisition / collection timestamp. |
| `result` | TEXT | NULL | NULL | Lab findings / qualitative observations. |
| `status` | VARCHAR(20) | NOT NULL, CHECK (`status IN ('Ordered', 'In Progress', 'Completed')`) | `'Ordered'` | Test processing status. |
| `created_at` | TIMESTAMPTZ | NOT NULL | `CURRENT_TIMESTAMP` | Creation audit timestamp. |

### Table 12: `billings`
Itemized patient invoices, payment status, discount deductions, and settlement records.
| Column | Type | Constraints | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `bill_id` | UUID | PRIMARY KEY | `gen_random_uuid()` | Unique invoice number. |
| `patient_id` | UUID | NOT NULL, FK $\rightarrow$ `patients(patient_id)` ON DELETE RESTRICT | - | Billed patient party. |
| `appointment_id`| UUID | UNIQUE, NULL, FK $\rightarrow$ `appointments(appointment_id)` ON DELETE SET NULL | NULL | Settled consultation visit. |
| `bill_date` | TIMESTAMPTZ | NOT NULL | `CURRENT_TIMESTAMP` | Invoicing date. |
| `consultation_charge` | DECIMAL(10,2) | NOT NULL, CHECK (`consultation_charge >= 0.00`) | `0.00` | Physician fee component. |
| `medicine_charge` | DECIMAL(10,2) | NOT NULL, CHECK (`medicine_charge >= 0.00`) | `0.00` | Pharmacy dispensation charge. |
| `test_charge` | DECIMAL(10,2) | NOT NULL, CHECK (`test_charge >= 0.00`) | `0.00` | Laboratory tests component. |
| `other_charge` | DECIMAL(10,2) | NOT NULL, CHECK (`other_charge >= 0.00`) | `0.00` | Facility / nursing charges. |
| `discount` | DECIMAL(10,2) | NOT NULL, CHECK (`discount >= 0.00`) | `0.00` | Concession rebate. |
| `total_amount` | DECIMAL(10,2) | NOT NULL, CHECK (`total_amount >= 0.00`) | `0.00` | Net payable balance. |
| `payment_status` | VARCHAR(20) | NOT NULL, CHECK (`payment_status IN ('Paid', 'Pending', 'Partially Paid')`) | `'Pending'` | Settlement state. |
| `payment_method` | VARCHAR(20) | NOT NULL, CHECK (`payment_method IN ('Cash', 'Credit Card', 'Debit Card', 'Insurance', 'UPI', 'Net Banking')`) | `'Cash'` | Mode of remittance. |
| `created_at` | TIMESTAMPTZ | NOT NULL | `CURRENT_TIMESTAMP` | Generation timestamp. |

---

## 4. Advanced Database Mechanisms

### 4.1 Production Views
1. **`patient_appointment_view`**: Denormalized join of patient, doctor, and department details for rapid schedule retrieval.
2. **`doctor_schedule_view`**: Aggregates appointment metrics grouped by doctor, date, and completion status.
3. **`low_stock_medicines_view`**: Identifies medicines with inventory below the reorder threshold ($\le 25$ units) or expiring within 90 days.
4. **`monthly_revenue_view`**: Aggregates monthly billings, discounts, collected revenue, and outstanding accounts receivable.
5. **`patient_billing_summary_view`**: Cumulative lifetime patient charges, total paid balances, and outstanding financial risk.

### 4.2 Database Triggers
1. **`trg_deduct_medicine_stock`**: Automatically executes after `INSERT` on `prescription_items`, decrementing `stock_quantity` in `medicines` and raising an exception if stock is insufficient.
2. **`trg_update_patients_timestamp`**: Updates `patients.updated_at = CURRENT_TIMESTAMP` before any `UPDATE`.
3. **`trg_update_users_timestamp`**: Updates `users.updated_at = CURRENT_TIMESTAMP` before any `UPDATE`.
4. **`trg_check_appointment_conflict`**: Validates before `INSERT` or `UPDATE` on `appointments` that the designated doctor does not have another overlapping active appointment.

### 4.3 Stored Procedures & User-Defined Functions
1. **`calculate_bill_total(p_consultation, p_medicine, p_test, p_other, p_discount)`**: Deterministic stored function computing net payable amount:
   $$\text{Total} = \max(0.00, (\text{Consultation} + \text{Medicine} + \text{Test} + \text{Other}) - \text{Discount})$$
2. **`get_doctor_appointment_stats(p_doctor_id)`**: Returns total, scheduled, completed, and cancelled appointments for a given doctor.
3. **`get_patient_clinical_summary(p_patient_id)`**: Aggregates total visits, active prescriptions, lab test orders, and outstanding dues.
