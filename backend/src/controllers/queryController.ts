import { Request, Response } from 'express';
import { prisma } from '../db/prisma.js';

export async function executeNamedQuery(req: Request, res: Response) {
  try {
    const { queryKey } = req.params;
    const startTime = Date.now();

    let sqlQuery = '';
    let description = '';
    let dbmsConcept = '';
    let results: any[] = [];

    switch (queryKey) {
      case 'inner-join-appointments':
        dbmsConcept = 'INNER JOIN on 4 Entities';
        description = 'Retrieves scheduled appointments by performing INNER JOINs across appointments, patients, doctors, and departments.';
        sqlQuery = `
SELECT 
    a.appointment_id,
    a.appointment_date,
    a.appointment_time,
    a.status,
    CONCAT(p.first_name, ' ', p.last_name) AS patient_name,
    p.phone AS patient_contact,
    CONCAT(d.first_name, ' ', d.last_name) AS doctor_name,
    d.specialization,
    dept.department_name
FROM appointments a
INNER JOIN patients p ON a.patient_id = p.patient_id
INNER JOIN doctors d ON a.doctor_id = d.doctor_id
INNER JOIN departments dept ON d.department_id = dept.department_id
WHERE a.status = 'Scheduled'
ORDER BY a.appointment_date ASC, a.appointment_time ASC
LIMIT 10;`;
        results = await prisma.$queryRawUnsafe(sqlQuery);
        break;

      case 'left-join-doctors':
        dbmsConcept = 'LEFT OUTER JOIN with Aggregate COUNT';
        description = 'Lists all doctors, their department, and total consultations handled including doctors who have zero appointments.';
        sqlQuery = `
SELECT 
    d.doctor_id,
    CONCAT(d.first_name, ' ', d.last_name) AS doctor_name,
    d.specialization,
    d.consultation_fee,
    dept.department_name,
    COUNT(a.appointment_id) AS total_appointments_handled
FROM doctors d
LEFT JOIN departments dept ON d.department_id = dept.department_id
LEFT JOIN appointments a ON d.doctor_id = a.doctor_id
GROUP BY d.doctor_id, d.first_name, d.last_name, d.specialization, d.consultation_fee, dept.department_name
ORDER BY total_appointments_handled DESC;`;
        results = await prisma.$queryRawUnsafe(sqlQuery);
        break;

      case 'group-by-having-departments':
        dbmsConcept = 'GROUP BY with HAVING Clause Filter';
        description = 'Filters hospital clinical departments with high consultation volume (>= 3 scheduled or completed appointments).';
        sqlQuery = `
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
ORDER BY appointment_volume DESC;`;
        results = await prisma.$queryRawUnsafe(sqlQuery);
        break;

      case 'subquery-above-average-fee':
        dbmsConcept = 'Nested Scalar Subquery';
        description = 'Selects medical specialists whose consultation fee exceeds the overall hospital mean consultation fee.';
        sqlQuery = `
SELECT 
    doctor_id,
    CONCAT(first_name, ' ', last_name) AS doctor_name,
    specialization,
    consultation_fee
FROM doctors
WHERE consultation_fee > (
    SELECT AVG(consultation_fee) 
    FROM doctors
)
ORDER BY consultation_fee DESC;`;
        results = await prisma.$queryRawUnsafe(sqlQuery);
        break;

      case 'correlated-subquery-exists':
        dbmsConcept = 'Correlated Subquery with EXISTS Operator';
        description = 'Identifies patients who have pending/unsettled billing records in the hospital accounting ledger.';
        sqlQuery = `
SELECT 
    p.patient_id,
    CONCAT(p.first_name, ' ', p.last_name) AS patient_name,
    p.phone,
    p.email
FROM patients p
WHERE EXISTS (
    SELECT 1 
    FROM billings b 
    WHERE b.patient_id = p.patient_id 
      AND b.payment_status = 'Pending'
)
LIMIT 10;`;
        results = await prisma.$queryRawUnsafe(sqlQuery);
        break;

      case 'aggregate-frequent-medicines':
        dbmsConcept = 'Relational Join Bridge & Aggregate Ranking';
        description = 'Analyzes the prescription items join table to determine the most frequently prescribed pharmaceuticals.';
        sqlQuery = `
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
LIMIT 8;`;
        results = await prisma.$queryRawUnsafe(sqlQuery);
        break;

      case 'view-patient-appointment':
        dbmsConcept = 'Querying SQL View: patient_appointment_view';
        description = 'Queries the abstracted relational reporting view combining 4 core clinical tables.';
        sqlQuery = 'SELECT * FROM patient_appointment_view LIMIT 10;';
        results = await prisma.$queryRawUnsafe(sqlQuery);
        break;

      case 'view-low-stock':
        dbmsConcept = 'Querying SQL View: low_stock_medicines_view';
        description = 'Queries real-time low inventory alerts generated by the database view.';
        sqlQuery = 'SELECT * FROM low_stock_medicines_view LIMIT 10;';
        results = await prisma.$queryRawUnsafe(sqlQuery);
        break;

      case 'view-monthly-revenue':
        dbmsConcept = 'Querying SQL View: monthly_revenue_view';
        description = 'Queries the revenue reporting view aggregating billing totals by month.';
        sqlQuery = 'SELECT * FROM monthly_revenue_view LIMIT 12;';
        results = await prisma.$queryRawUnsafe(sqlQuery);
        break;

      default:
        return res.status(404).json({ success: false, message: 'Unrecognized query identifier ' + queryKey });
    }

    const executionTimeMs = Date.now() - startTime;

    return res.status(200).json({
      success: true,
      queryKey,
      dbmsConcept,
      description,
      sqlQuery: sqlQuery.trim(),
      executionTimeMs,
      rowCount: results.length,
      data: results
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Error executing database query.' });
  }
}
