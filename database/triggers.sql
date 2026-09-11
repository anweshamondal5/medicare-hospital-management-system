-- =============================================================================
-- MediCare — Database Triggers
-- Automates inventory updates, audit timestamps, and conflict prevention
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. TRIGGER: Decrement Medicine Inventory on Prescription Item Creation
-- Ensures stock integrity and raises exception if quantity is insufficient
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_deduct_medicine_inventory()
RETURNS TRIGGER AS \$\$
DECLARE
    v_current_stock INTEGER;
    v_med_name VARCHAR(100);
BEGIN
    -- Query current stock and name
    SELECT stock_quantity, medicine_name 
    INTO v_current_stock, v_med_name
    FROM medicines 
    WHERE medicine_id = NEW.medicine_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Medicine ID % does not exist in inventory', NEW.medicine_id;
    END IF;

    -- Assume each prescribed item dispensation deducts standard dosage units (default 1 package/unit)
    IF v_current_stock < 1 THEN
        RAISE EXCEPTION 'Insufficient stock for medicine "%". Current stock: %, Required: 1', v_med_name, v_current_stock;
    END IF;

    -- Decrement stock
    UPDATE medicines
    SET stock_quantity = stock_quantity - 1
    WHERE medicine_id = NEW.medicine_id;

    RETURN NEW;
END;
\$\$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_deduct_medicine_inventory ON prescription_items;
CREATE TRIGGER trg_deduct_medicine_inventory
AFTER INSERT ON prescription_items
FOR EACH ROW
EXECUTE FUNCTION fn_deduct_medicine_inventory();

-- -----------------------------------------------------------------------------
-- 2. TRIGGER: Maintain updated_at Timestamp on Patients Table
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_update_patient_timestamp()
RETURNS TRIGGER AS \$\$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
\$\$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_patient_timestamp ON patients;
CREATE TRIGGER trg_update_patient_timestamp
BEFORE UPDATE ON patients
FOR EACH ROW
EXECUTE FUNCTION fn_update_patient_timestamp();

-- -----------------------------------------------------------------------------
-- 3. TRIGGER: Prevent Double-Booking Doctor Appointments
-- Checks for existing active appointments at the same date and time slot
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_check_appointment_conflict()
RETURNS TRIGGER AS \$\$
DECLARE
    v_conflict_count INTEGER;
    v_doctor_name VARCHAR(100);
BEGIN
    -- Only check active scheduled appointments
    IF NEW.status = 'Scheduled' THEN
        SELECT COUNT(*)
        INTO v_conflict_count
        FROM appointments
        WHERE doctor_id = NEW.doctor_id
          AND appointment_date = NEW.appointment_date
          AND appointment_time = NEW.appointment_time
          AND appointment_id <> COALESCE(NEW.appointment_id, '00000000-0000-0000-0000-000000000000'::uuid)
          AND status = 'Scheduled';

        IF v_conflict_count > 0 THEN
            SELECT CONCAT(first_name, ' ', last_name) INTO v_doctor_name FROM doctors WHERE doctor_id = NEW.doctor_id;
            RAISE EXCEPTION 'Scheduling Conflict: Dr. % already has an active appointment on % at %', 
                v_doctor_name, NEW.appointment_date, NEW.appointment_time;
        END IF;
    END IF;

    RETURN NEW;
END;
\$\$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_check_appointment_conflict ON appointments;
CREATE TRIGGER trg_check_appointment_conflict
BEFORE INSERT OR UPDATE ON appointments
FOR EACH ROW
EXECUTE FUNCTION fn_check_appointment_conflict();
