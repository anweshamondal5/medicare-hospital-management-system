-- =============================================================================
-- MediCare — Academic DBMS Queries Showcase
-- Demonstrating relational algebra, multi-table joins, subqueries, grouping,
-- aggregate functions, filtering, and set operations.
-- =============================================================================

-- 1. INNER JOIN: Retrieve upcoming appointments with doctor and patient details
SELECT 
    a.appointment_id,
    a.appointment_date,
    a.appointment_time,
    a.status,
    p.first_name || ' ' || p.last_name AS patient_name,
    p.phone AS patient_contact,
    d.first_name || ' ' || d.last_name AS doctor_name,
    d.specialization,
    dept.department_name
FROM appointments a
INNER JOIN patients p ON a.patient_id = p.patient_id
INNER JOIN doctors d ON a.doctor_id = d.doctor_id
INNER JOIN departments dept ON d.department_id = dept.department_id
WHERE a.status = 'Scheduled' AND a.appointment_date >= CURRENT_DATE
ORDER BY a.appointment_date ASC, a.appointment_time ASC;

-- 2. LEFT JOIN: All doctors with their associated department and total appointment counts
SELECT 
    d.doctor_id,
    d.first_name || ' ' || d.last_name AS doctor_name,
    d.specialization,
    d.consultation_fee,
    dept.department_name,
    COUNT(a.appointment_id) AS total_appointments_handled
FROM doctors d
LEFT JOIN departments dept ON d.department_id = dept.department_id
LEFT JOIN appointments a ON d.doctor_id = a.doctor_id
GROUP BY d.doctor_id, d.first_name, d.last_name, d.specialization, d.consultation_fee, dept.department_name
ORDER BY total_appointments_handled DESC;

-- 3. GROUP BY & HAVING: Departments with more than 3 appointments
SELECT 
    dept.department_id,
    dept.department_name,
    dept.location,
    COUNT(a.appointment_id) AS appointment_volume
FROM departments dept
INNER JOIN doctors d ON dept.department_id = d.department_id
INNER JOIN appointments a ON d.doctor_id = a.doctor_id
GROUP BY dept.department_id, dept.department_name, dept.location
HAVING COUNT(a.appointment_id) >= 3
ORDER BY appointment_volume DESC;

-- 4. SUBQUERY (Scalar): Doctors charging above average consultation fee
SELECT 
    doctor_id,
    first_name || ' ' || last_name AS doctor_name,
    specialization,
    consultation_fee
FROM doctors
WHERE consultation_fee > (
    SELECT AVG(consultation_fee) 
    FROM doctors
)
ORDER BY consultation_fee DESC;

-- 5. CORRELATED SUBQUERY with EXISTS: Patients who have pending bills
SELECT 
    p.patient_id,
    p.first_name || ' ' || p.last_name AS patient_name,
    p.phone,
    p.email
FROM patients p
WHERE EXISTS (
    SELECT 1 
    FROM billings b 
    WHERE b.patient_id = p.patient_id 
      AND b.payment_status = 'Pending'
);

-- 6. MULTI-TABLE JOIN: Comprehensive Prescription Details with Medicines
SELECT 
    pr.prescription_id,
    pr.prescription_date,
    pr.diagnosis,
    p.first_name || ' ' || p.last_name AS patient_name,
    d.first_name || ' ' || d.last_name AS doctor_name,
    m.medicine_name,
    m.category,
    pi.dosage,
    pi.frequency,
    pi.duration,
    pi.instructions
FROM prescriptions pr
INNER JOIN patients p ON pr.patient_id = p.patient_id
INNER JOIN doctors d ON pr.doctor_id = d.doctor_id
INNER JOIN prescription_items pi ON pr.prescription_id = pi.prescription_id
INNER JOIN medicines m ON pi.medicine_id = m.medicine_id
ORDER BY pr.prescription_date DESC;

-- 7. AGGREGATE FUNCTION: Most frequently prescribed medicines
SELECT 
    m.medicine_id,
    m.medicine_name,
    m.category,
    m.stock_quantity,
    COUNT(pi.prescription_item_id) AS times_prescribed
FROM medicines m
INNER JOIN prescription_items pi ON m.medicine_id = pi.medicine_id
GROUP BY m.medicine_id, m.medicine_name, m.category, m.stock_quantity
ORDER BY times_prescribed DESC
LIMIT 10;

-- 8. AGGREGATION & DATE ARITHMETIC: Total revenue collected by payment method
SELECT 
    payment_method,
    COUNT(bill_id) AS transaction_count,
    SUM(total_amount) AS gross_total,
    SUM(discount) AS total_discounts,
    AVG(total_amount) AS average_bill_amount
FROM billings
WHERE payment_status = 'Paid'
GROUP BY payment_method
ORDER BY gross_total DESC;

-- 9. SUBQUERY with NOT EXISTS: Medicines that have never been prescribed
SELECT 
    medicine_id,
    medicine_name,
    category,
    manufacturer,
    stock_quantity
FROM medicines m
WHERE NOT EXISTS (
    SELECT 1 
    FROM prescription_items pi 
    WHERE pi.medicine_id = m.medicine_id
);

-- 10. COMPLEX MULTI-ENTITY SUMMARY: Patient Chronological Medical Journey
SELECT 
    p.patient_id,
    p.first_name || ' ' || p.last_name AS patient_name,
    a.appointment_date,
    d.first_name || ' ' || d.last_name AS doctor_name,
    mr.diagnosis AS medical_diagnosis,
    mr.treatment,
    b.total_amount AS invoice_amount,
    b.payment_status
FROM patients p
INNER JOIN appointments a ON p.patient_id = a.patient_id
INNER JOIN doctors d ON a.doctor_id = d.doctor_id
LEFT JOIN medical_records mr ON a.appointment_id = mr.appointment_id
LEFT JOIN billings b ON a.appointment_id = b.appointment_id
ORDER BY a.appointment_date DESC;
