-- =============================================================================
-- MediCare — Database Views
-- Provides abstracted reporting views for clinical and administrative queries
-- =============================================================================

-- 1. Patient Appointment Overview View
-- Joins Patients, Appointments, Doctors, and Departments for rapid schedule reporting
CREATE OR REPLACE VIEW patient_appointment_view AS
SELECT 
    a.appointment_id,
    a.appointment_date,
    a.appointment_time,
    a.status AS appointment_status,
    a.reason,
    p.patient_id,
    CONCAT(p.first_name, ' ', p.last_name) AS patient_name,
    p.phone AS patient_phone,
    p.email AS patient_email,
    p.blood_group,
    d.doctor_id,
    CONCAT(d.first_name, ' ', d.last_name) AS doctor_name,
    d.specialization,
    dept.department_name,
    dept.location AS department_location
FROM appointments a
JOIN patients p ON a.patient_id = p.patient_id
JOIN doctors d ON a.doctor_id = d.doctor_id
JOIN departments dept ON d.department_id = dept.department_id;

-- 2. Doctor Schedule and Workload View
-- Aggregates total, scheduled, and completed appointments per doctor
CREATE OR REPLACE VIEW doctor_schedule_view AS
SELECT 
    d.doctor_id,
    CONCAT(d.first_name, ' ', d.last_name) AS doctor_name,
    d.specialization,
    d.availability_status,
    dept.department_name,
    COUNT(a.appointment_id) AS total_appointments,
    COUNT(CASE WHEN a.status = 'Scheduled' THEN 1 END) AS pending_appointments,
    COUNT(CASE WHEN a.status = 'Completed' THEN 1 END) AS completed_appointments,
    COALESCE(SUM(b.total_amount), 0.00) AS revenue_generated
FROM doctors d
JOIN departments dept ON d.department_id = dept.department_id
LEFT JOIN appointments a ON d.doctor_id = a.doctor_id
LEFT JOIN billings b ON a.appointment_id = b.appointment_id AND b.payment_status = 'Paid'
GROUP BY d.doctor_id, d.first_name, d.last_name, d.specialization, d.availability_status, dept.department_name;

-- 3. Low Stock and Expiring Medicines View
-- Administrative alert view identifying medicines with inventory <= 25 or expiring in 90 days
CREATE OR REPLACE VIEW low_stock_medicines_view AS
SELECT 
    m.medicine_id,
    m.medicine_name,
    m.category,
    m.manufacturer,
    m.unit_price,
    m.stock_quantity,
    m.expiry_date,
    CASE 
        WHEN m.stock_quantity <= 10 THEN 'CRITICAL_LOW'
        WHEN m.stock_quantity <= 25 THEN 'LOW_STOCK'
        ELSE 'ADEQUATE'
    END AS stock_alert_level,
    CASE 
        WHEN m.expiry_date < CURRENT_DATE THEN 'EXPIRED'
        WHEN m.expiry_date <= (CURRENT_DATE + INTERVAL '60 days') THEN 'EXPIRING_SOON'
        ELSE 'VALID'
    END AS expiry_alert_level
FROM medicines m
WHERE m.stock_quantity <= 25 OR m.expiry_date <= (CURRENT_DATE + INTERVAL '60 days');

-- 4. Monthly Revenue Reporting View
-- Aggregates hospital billing by year and month
CREATE OR REPLACE VIEW monthly_revenue_view AS
SELECT 
    TO_CHAR(bill_date, 'YYYY-MM') AS billing_month,
    COUNT(bill_id) AS total_bills_issued,
    COUNT(CASE WHEN payment_status = 'Paid' THEN 1 END) AS paid_bills_count,
    COUNT(CASE WHEN payment_status = 'Pending' THEN 1 END) AS pending_bills_count,
    SUM(consultation_charge) AS total_consultation_revenue,
    SUM(medicine_charge) AS total_medicine_revenue,
    SUM(test_charge) AS total_lab_revenue,
    SUM(discount) AS total_discounts_given,
    SUM(total_amount) AS gross_revenue,
    SUM(CASE WHEN payment_status = 'Paid' THEN total_amount ELSE 0 END) AS collected_revenue
FROM billings
GROUP BY TO_CHAR(bill_date, 'YYYY-MM')
ORDER BY billing_month DESC;

-- 5. Patient Billing Summary View
-- Calculates total billing, payments, and outstanding balances per patient
CREATE OR REPLACE VIEW patient_billing_summary_view AS
SELECT 
    p.patient_id,
    CONCAT(p.first_name, ' ', p.last_name) AS patient_name,
    p.phone,
    COUNT(b.bill_id) AS total_invoices,
    COALESCE(SUM(b.total_amount), 0.00) AS total_billed_amount,
    COALESCE(SUM(CASE WHEN b.payment_status = 'Paid' THEN b.total_amount ELSE 0 END), 0.00) AS total_paid_amount,
    COALESCE(SUM(CASE WHEN b.payment_status = 'Pending' THEN b.total_amount ELSE 0 END), 0.00) AS total_pending_amount
FROM patients p
LEFT JOIN billings b ON p.patient_id = b.patient_id
GROUP BY p.patient_id, p.first_name, p.last_name, p.phone;
