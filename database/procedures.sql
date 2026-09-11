-- =============================================================================
-- MediCare — Stored Procedures & Functions
-- Encapsulates business calculations and data aggregation inside PostgreSQL
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. FUNCTION: Calculate Bill Total with Validations
-- Returns computed total = consultation + medicine + test + other - discount
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION calculate_bill_total(p_bill_id UUID)
RETURNS NUMERIC AS \$\$
DECLARE
    v_consultation NUMERIC(10, 2);
    v_medicine NUMERIC(10, 2);
    v_test NUMERIC(10, 2);
    v_other NUMERIC(10, 2);
    v_discount NUMERIC(10, 2);
    v_total NUMERIC(10, 2);
BEGIN
    SELECT consultation_charge, medicine_charge, test_charge, other_charge, discount
    INTO v_consultation, v_medicine, v_test, v_other, v_discount
    FROM billings
    WHERE bill_id = p_bill_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Bill with ID % not found', p_bill_id;
    END IF;

    v_total := (v_consultation + v_medicine + v_test + v_other) - v_discount;
    
    IF v_total < 0 THEN
        v_total := 0.00;
    END IF;

    -- Update the table record
    UPDATE billings
    SET total_amount = v_total
    WHERE bill_id = p_bill_id;

    RETURN v_total;
END;
\$\$ LANGUAGE plpgsql;

-- -----------------------------------------------------------------------------
-- 2. FUNCTION: Get Doctor Performance and Appointment Metrics
-- Returns a table with statistics for an individual doctor
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_doctor_appointment_stats(p_doctor_id UUID)
RETURNS TABLE (
    doctor_name TEXT,
    specialization VARCHAR(100),
    department VARCHAR(100),
    total_appointments BIGINT,
    scheduled_count BIGINT,
    completed_count BIGINT,
    cancelled_count BIGINT,
    total_revenue NUMERIC
) AS \$\$
BEGIN
    RETURN QUERY
    SELECT 
        CONCAT(d.first_name, ' ', d.last_name)::TEXT AS doctor_name,
        d.specialization,
        dept.department_name AS department,
        COUNT(a.appointment_id) AS total_appointments,
        COUNT(CASE WHEN a.status = 'Scheduled' THEN 1 END) AS scheduled_count,
        COUNT(CASE WHEN a.status = 'Completed' THEN 1 END) AS completed_count,
        COUNT(CASE WHEN a.status = 'Cancelled' THEN 1 END) AS cancelled_count,
        COALESCE(SUM(b.total_amount), 0.00) AS total_revenue
    FROM doctors d
    JOIN departments dept ON d.department_id = dept.department_id
    LEFT JOIN appointments a ON d.doctor_id = a.doctor_id
    LEFT JOIN billings b ON a.appointment_id = b.appointment_id AND b.payment_status = 'Paid'
    WHERE d.doctor_id = p_doctor_id
    GROUP BY d.doctor_id, d.first_name, d.last_name, d.specialization, dept.department_name;
END;
\$\$ LANGUAGE plpgsql;

-- -----------------------------------------------------------------------------
-- 3. FUNCTION: Get Patient Clinical Summary
-- Aggregates clinical history counts for medical intake
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_patient_clinical_summary(p_patient_id UUID)
RETURNS TABLE (
    patient_full_name TEXT,
    age INTEGER,
    blood_group VARCHAR(5),
    total_visits BIGINT,
    total_diagnoses BIGINT,
    total_prescriptions BIGINT,
    total_lab_tests BIGINT
) AS \$\$
BEGIN
    RETURN QUERY
    SELECT 
        CONCAT(p.first_name, ' ', p.last_name)::TEXT,
        EXTRACT(YEAR FROM AGE(CURRENT_DATE, p.date_of_birth))::INTEGER,
        p.blood_group,
        COUNT(DISTINCT a.appointment_id),
        COUNT(DISTINCT m.record_id),
        COUNT(DISTINCT pr.prescription_id),
        COUNT(DISTINCT l.patient_lab_test_id)
    FROM patients p
    LEFT JOIN appointments a ON p.patient_id = a.patient_id
    LEFT JOIN medical_records m ON p.patient_id = m.patient_id
    LEFT JOIN prescriptions pr ON p.patient_id = pr.patient_id
    LEFT JOIN patient_lab_tests l ON p.patient_id = l.patient_id
    WHERE p.patient_id = p_patient_id
    GROUP BY p.patient_id, p.first_name, p.last_name, p.date_of_birth, p.blood_group;
END;
\$\$ LANGUAGE plpgsql;
