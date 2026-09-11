# MediCare HMS — RESTful API Specification

## 1. Overview
The MediCare Hospital Management System backend exposes an enterprise RESTful API built with **Express.js**, **TypeScript**, and **Prisma ORM**. All responses follow a standardized JSON envelope format.

### Standard Response Envelopes
#### Success Response (`200 OK`, `201 Created`):
```json
{
  "success": true,
  "message": "Operation completed successfully.",
  "data": { ... }
}
```

#### Error Response (`400`, `401`, `403`, `404`, `409`, `500`):
```json
{
  "success": false,
  "message": "Detailed error or validation message.",
  "errors": [ ... ]
}
```

### Authentication Header
Protected endpoints require an HTTP `Authorization` header containing the Bearer JWT token:
```http
Authorization: Bearer <jwt_token>
```

---

## 2. API Endpoints Catalog

### 2.1 Authentication & Profile (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Public | Authenticates user credentials (`email`, `password`) and returns JWT token + user profile. |
| `GET` | `/api/auth/profile` | Authenticated | Returns current authenticated user profile and permissions. |

---

### 2.2 Departments (`/api/departments`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/departments` | Authenticated | Lists all hospital clinical departments with doctor headcount counts. |
| `POST` | `/api/departments` | ADMIN | Creates a new hospital department. |
| `GET` | `/api/departments/:id`| Authenticated | Retrieves single department details along with its affiliated doctors. |

---

### 2.3 Doctors (`/api/doctors`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/doctors` | Authenticated | Retrieves all doctors with optional filters (`department_id`, `specialization`, `search`). |
| `POST` | `/api/doctors` | ADMIN | Enrolls a new medical doctor into the hospital staff directory. |
| `GET` | `/api/doctors/:id` | Authenticated | Returns doctor profile, department details, and appointment statistics. |
| `PUT` | `/api/doctors/:id` | ADMIN / DOCTOR | Updates doctor contact info, consultation fees, or availability status. |

---

### 2.4 Patients (`/api/patients`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/patients` | Authenticated | Retrieves paginated patient directory with search (by name, phone, email, blood group). |
| `POST` | `/api/patients` | ADMIN / RECEPTIONIST | Registers a new patient into the hospital management system. |
| `GET` | `/api/patients/:id` | Authenticated | Full 360-degree patient profile with chronological clinical timeline (appointments, records, prescriptions, lab tests, bills). |
| `PUT` | `/api/patients/:id` | ADMIN / RECEPTIONIST | Updates patient demographic or emergency contact information. |
| `DELETE` | `/api/patients/:id` | ADMIN | Soft/hard deletes patient record (guarded by foreign key cascading rules). |

---

### 2.5 Appointments (`/api/appointments`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/appointments` | Authenticated | Lists appointments with filters (`date`, `doctor_id`, `patient_id`, `status`). |
| `POST` | `/api/appointments` | Authenticated | Schedules an appointment with conflict detection (returns `409 Conflict` on double booking). |
| `GET` | `/api/appointments/:id`| Authenticated | Retrieves single appointment details. |
| `PUT` | `/api/appointments/:id`| Authenticated | Updates appointment status (`Scheduled`, `Completed`, `Cancelled`, `No Show`) or reschedule slot. |

---

### 2.6 Prescriptions (`/api/prescriptions`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/prescriptions` | Authenticated | Lists prescriptions with line-item medicines, patient, and doctor details. |
| `POST` | `/api/prescriptions` | ADMIN / DOCTOR | Transactional prescription issuance with multi-item medicines and automatic inventory decrement. |
| `GET` | `/api/prescriptions/:id`| Authenticated | Retrieves complete prescription details with pharmacy items. |

---

### 2.7 Medicines & Pharmacy Inventory (`/api/medicines`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/medicines` | Authenticated | Lists pharmacy inventory with search, category filtering, and stock counts. |
| `GET` | `/api/medicines/low-stock` | Authenticated | Queries `low_stock_medicines_view` for drugs with stock $\le 25$ or expiring within 90 days. |
| `POST` | `/api/medicines` | ADMIN | Adds new medicine catalog entry with initial batch stock. |
| `PUT` | `/api/medicines/:id` | ADMIN | Updates medicine stock quantity, unit price, or batch expiration date. |

---

### 2.8 Billings & Invoicing (`/api/billing`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/billing` | Authenticated | Lists invoices with payment status filters (`Paid`, `Pending`, `Partially Paid`). |
| `POST` | `/api/billing` | ADMIN / RECEPTIONIST | Creates an itemized bill, computing: `total = (consultation + medicine + test + other) - discount`. |
| `GET` | `/api/billing/:id` | Authenticated | Retrieves single invoice record for printing or viewing. |
| `PUT` | `/api/billing/:id/payment`| ADMIN / RECEPTIONIST | Updates payment status and recorded payment method. |

---

### 2.9 Medical Records (`/api/medical-records`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/medical-records` | Authenticated | Retrieves electronic medical records filtered by patient or doctor. |
| `POST` | `/api/medical-records` | ADMIN / DOCTOR | Records patient diagnosis, symptoms, clinical findings, and treatment pathway. |
| `GET` | `/api/medical-records/:id`| Authenticated | Retrieves specific clinical consultation record. |

---

### 2.10 Diagnostic Lab Tests (`/api/lab-tests`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/lab-tests` | Authenticated | Retrieves lab test catalog (`test_name`, `description`, `price`). |
| `GET` | `/api/lab-tests/orders`| Authenticated | Lists ordered patient laboratory tests with status (`Ordered`, `In Progress`, `Completed`). |
| `POST` | `/api/lab-tests/orders`| ADMIN / DOCTOR | Orders a diagnostic test for a patient encounter. |
| `PUT` | `/api/lab-tests/orders/:id`| ADMIN / DOCTOR | Records lab findings/results and marks test as Completed. |

---

### 2.11 Dashboard & Analytics (`/api/dashboard`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/dashboard/stats` | Authenticated | Aggregates high-level metrics, monthly revenue trends, patient intake trends, appointment statuses, and inventory warnings. |

---

### 2.12 DBMS Explorer & Live SQL Runner (`/api/dbms-explorer`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/dbms-explorer/presets` | Authenticated | Returns catalog of 10+ pre-built advanced DBMS queries with educational descriptions. |
| `POST` | `/api/dbms-explorer/execute` | ADMIN | Executes raw read-only SQL queries (`SELECT`, `EXPLAIN ANALYZE`) against PostgreSQL and returns execution metrics (timing, row count, column metadata). Rejects destructive write operations. |
