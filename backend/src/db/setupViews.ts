import { prisma } from './prisma.js';

async function setupViews() {
  console.log('[PostgreSQL] Installing custom SQL views and procedures...');
  try {
    await prisma.$executeRawUnsafe(`
      CREATE OR REPLACE VIEW patient_appointment_view AS
      SELECT 
          a.appointment_id,
          a.appointment_date,
          a.appointment_time,
          a.status AS appointment_status,
          a.reason,
          p.patient_id,
          p.first_name || ' ' || p.last_name AS patient_name,
          p.phone AS patient_phone,
          p.email AS patient_email,
          p.blood_group,
          d.doctor_id,
          d.first_name || ' ' || d.last_name AS doctor_name,
          d.specialization,
          dept.department_name,
          dept.location AS department_location
      FROM appointments a
      JOIN patients p ON a.patient_id = p.patient_id
      JOIN doctors d ON a.doctor_id = d.doctor_id
      JOIN departments dept ON d.department_id = dept.department_id;
    `);
    console.log('? Created patient_appointment_view');

    await prisma.$executeRawUnsafe(`
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
          END AS stock_alert_level
      FROM medicines m
      WHERE m.stock_quantity <= 25;
    `);
    console.log('? Created low_stock_medicines_view');

    await prisma.$executeRawUnsafe(`
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
    `);
    console.log('? Created monthly_revenue_view');
  } catch (err: any) {
    console.error('Error creating views:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

setupViews();
