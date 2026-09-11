import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Seeding MediCare Hospital Management Database ---');

  // Clean existing records in reverse dependency order
  await prisma.patientLabTest.deleteMany();
  await prisma.labTest.deleteMany();
  await prisma.prescriptionItem.deleteMany();
  await prisma.prescription.deleteMany();
  await prisma.medicalRecord.deleteMany();
  await prisma.billing.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.medicine.deleteMany();
  await prisma.user.deleteMany();
  await prisma.doctor.deleteMany();
  await prisma.department.deleteMany();
  await prisma.patient.deleteMany();

  // 1. Seed Departments (6)
  const departmentsData = [
    { department_name: 'Cardiology', description: 'Comprehensive heart care, cardiovascular diagnostics and interventions', location: 'Wing A, Floor 3' },
    { department_name: 'Neurology', description: 'Advanced treatment for brain, spinal cord, and nervous system disorders', location: 'Wing B, Floor 4' },
    { department_name: 'Orthopedics', description: 'Musculoskeletal care, joint replacement, and sports medicine', location: 'Wing A, Floor 2' },
    { department_name: 'Pediatrics', description: 'Specialized healthcare for infants, children, and adolescents', location: 'Wing C, Floor 1' },
    { department_name: 'General Medicine', description: 'Primary internal medicine, preventive care, and adult illness', location: 'Main Block, Floor 1' },
    { department_name: 'Dermatology', description: 'Clinical and cosmetic skin, hair, and nail treatments', location: 'Wing B, Floor 2' },
    { department_name: 'Gynecology', description: 'Women health, obstetric care, and reproductive medicine', location: 'Wing C, Floor 2' },
  ];

  const createdDepartments: any[] = [];
  for (const dept of departmentsData) {
    const d = await prisma.department.create({ data: dept });
    createdDepartments.push(d);
  }
  console.log('Created ' + createdDepartments.length + ' departments.');

  // 2. Seed Doctors (10)
  const doctorsData = [
    { first_name: 'Sarah', last_name: 'Jenkins', specialization: 'Interventional Cardiology', department_name: 'Cardiology', phone: '+1-555-0101', email: 's.jenkins@medicare.demo', license_number: 'MD-CARD-1092', consultation_fee: 150.00, availability_status: 'Available' },
    { first_name: 'Marcus', last_name: 'Vance', specialization: 'Electrophysiology', department_name: 'Cardiology', phone: '+1-555-0102', email: 'm.vance@medicare.demo', license_number: 'MD-CARD-1093', consultation_fee: 175.00, availability_status: 'Available' },
    { first_name: 'Elena', last_name: 'Rostova', specialization: 'Clinical Neurology', department_name: 'Neurology', phone: '+1-555-0103', email: 'e.rostova@medicare.demo', license_number: 'MD-NEUR-2041', consultation_fee: 180.00, availability_status: 'Available' },
    { first_name: 'David', last_name: 'Kim', specialization: 'Neuro-Oncology', department_name: 'Neurology', phone: '+1-555-0104', email: 'd.kim@medicare.demo', license_number: 'MD-NEUR-2042', consultation_fee: 200.00, availability_status: 'In Consultation' },
    { first_name: 'Robert', last_name: 'Chen', specialization: 'Joint Replacement & Spine', department_name: 'Orthopedics', phone: '+1-555-0105', email: 'r.chen@medicare.demo', license_number: 'MD-ORTH-3150', consultation_fee: 160.00, availability_status: 'Available' },
    { first_name: 'Amara', last_name: 'Okonkwo', specialization: 'Pediatric Care & Neonatology', department_name: 'Pediatrics', phone: '+1-555-0106', email: 'a.okonkwo@medicare.demo', license_number: 'MD-PED-4122', consultation_fee: 120.00, availability_status: 'Available' },
    { first_name: 'Emily', last_name: 'Watson', specialization: 'Adolescent Medicine', department_name: 'Pediatrics', phone: '+1-555-0107', email: 'e.watson@medicare.demo', license_number: 'MD-PED-4123', consultation_fee: 130.00, availability_status: 'Available' },
    { first_name: 'James', last_name: 'Wilson', specialization: 'Internal & Preventive Medicine', department_name: 'General Medicine', phone: '+1-555-0108', email: 'j.wilson@medicare.demo', license_number: 'MD-GEN-5011', consultation_fee: 100.00, availability_status: 'Available' },
    { first_name: 'Priya', last_name: 'Nair', specialization: 'Family Medicine', department_name: 'General Medicine', phone: '+1-555-0109', email: 'p.nair@medicare.demo', license_number: 'MD-GEN-5012', consultation_fee: 110.00, availability_status: 'Available' },
    { first_name: 'Alexander', last_name: 'Hansen', specialization: 'Medical & Surgical Dermatology', department_name: 'Dermatology', phone: '+1-555-0110', email: 'a.hansen@medicare.demo', license_number: 'MD-DERM-6034', consultation_fee: 140.00, availability_status: 'Available' }
  ];

  const createdDoctors: any[] = [];
  for (const doc of doctorsData) {
    const dept = createdDepartments.find(d => d.department_name === doc.department_name);
    const { department_name, ...docFields } = doc;
    const d = await prisma.doctor.create({
      data: {
        ...docFields,
        department_id: dept.department_id
      }
    });
    createdDoctors.push(d);
  }
  console.log('Created ' + createdDoctors.length + ' doctors.');

  // 3. Seed Users (Demo Accounts)
  const passwordAdmin = await bcrypt.hash('Admin@123', 10);
  const passwordDoctor = await bcrypt.hash('Doctor@123', 10);
  const passwordReception = await bcrypt.hash('Reception@123', 10);

  await prisma.user.create({
    data: {
      name: 'Dr. Arthur Mitchell (Chief Medical Admin)',
      email: 'admin@medicare.demo',
      password_hash: passwordAdmin,
      role: 'ADMIN'
    }
  });

  await prisma.user.create({
    data: {
      name: 'Dr. Sarah Jenkins',
      email: 'doctor@medicare.demo',
      password_hash: passwordDoctor,
      role: 'DOCTOR',
      doctor_id: createdDoctors[0].doctor_id
    }
  });

  await prisma.user.create({
    data: {
      name: 'Chloe Foster (Lead Desk Coordinator)',
      email: 'reception@medicare.demo',
      password_hash: passwordReception,
      role: 'RECEPTIONIST'
    }
  });
  console.log('Created Demo Users (admin@medicare.demo, doctor@medicare.demo, reception@medicare.demo).');

  // 4. Seed Patients (32)
  const patientFirstNames = ['Liam', 'Olivia', 'Noah', 'Emma', 'Oliver', 'Charlotte', 'Elijah', 'Amelia', 'James', 'Ava', 'William', 'Sophia', 'Benjamin', 'Isabella', 'Lucas', 'Mia', 'Henry', 'Evelyn', 'Alexander', 'Harper', 'Sebastian', 'Camila', 'Jack', 'Gianna', 'Samuel', 'Abigail', 'Matthew', 'Luna', 'Daniel', 'Ella', 'Jackson', 'Avery'];
  const patientLastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young'];
  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const genders = ['Male', 'Female'];

  const createdPatients: any[] = [];
  for (let i = 0; i < 32; i++) {
    const fn = patientFirstNames[i];
    const ln = patientLastNames[i];
    const gender = genders[i % 2];
    const bg = bloodGroups[i % bloodGroups.length];
    const birthYear = 1960 + (i * 2);
    const birthMonth = ((i % 9) + 1).toString().padStart(2, '0');
    const p = await prisma.patient.create({
      data: {
        first_name: fn,
        last_name: ln,
        date_of_birth: new Date(birthYear + '-' + birthMonth + '-15'),
        gender,
        blood_group: bg,
        phone: '+1-555-02' + (10 + i),
        email: fn.toLowerCase() + '.' + ln.toLowerCase() + i + '@patient.medicare.demo',
        address: (100 + i * 14) + ' Health Avenue, Metro City, ST 90210',
        emergency_contact: 'Parent/Spouse: +1-555-09' + (10 + i),
        registration_date: new Date(Date.now() - (32 - i) * 86400000 * 4)
      }
    });
    createdPatients.push(p);
  }
  console.log('Created ' + createdPatients.length + ' patients.');

  // 5. Seed Medicines (20)
  const medicinesData = [
    { medicine_name: 'Amoxicillin 500mg', category: 'Antibiotic', manufacturer: 'Pfizer Inc.', unit_price: 18.50, stock_quantity: 140, expiry_date: new Date('2028-05-30'), description: 'Broad-spectrum beta-lactam antibiotic' },
    { medicine_name: 'Lipitor (Atorvastatin) 20mg', category: 'Cardiovascular', manufacturer: 'Viatris', unit_price: 32.00, stock_quantity: 85, expiry_date: new Date('2027-11-15'), description: 'HMG-CoA reductase inhibitor for cholesterol management' },
    { medicine_name: 'Metformin 850mg', category: 'Antidiabetic', manufacturer: 'Bristol-Myers Squibb', unit_price: 14.00, stock_quantity: 160, expiry_date: new Date('2028-01-20'), description: 'First-line medication for type 2 diabetes' },
    { medicine_name: 'Lisinopril 10mg', category: 'Cardiovascular', manufacturer: 'AstraZeneca', unit_price: 22.00, stock_quantity: 18, expiry_date: new Date('2027-08-10'), description: 'ACE inhibitor for hypertension and heart failure' },
    { medicine_name: 'Azithromycin 250mg', category: 'Antibiotic', manufacturer: 'Teva Pharmaceuticals', unit_price: 28.00, stock_quantity: 75, expiry_date: new Date('2027-10-05'), description: 'Macrolide antibiotic for respiratory tract infections' },
    { medicine_name: 'Omeprazole 20mg', category: 'Gastroenterology', manufacturer: 'Dr. Reddy Laboratories', unit_price: 16.00, stock_quantity: 210, expiry_date: new Date('2028-03-25'), description: 'Proton pump inhibitor for acid reflux and ulcers' },
    { medicine_name: 'Ibuprofen 400mg', category: 'Analgesic & NSAID', manufacturer: 'Bayer AG', unit_price: 8.50, stock_quantity: 320, expiry_date: new Date('2029-02-14'), description: 'Anti-inflammatory pain relief medication' },
    { medicine_name: 'Amlodipine 5mg', category: 'Cardiovascular', manufacturer: 'Novartis', unit_price: 19.00, stock_quantity: 12, expiry_date: new Date('2026-11-15'), description: 'Calcium channel blocker for high blood pressure' },
    { medicine_name: 'Levothyroxine 50mcg', category: 'Endocrinology', manufacturer: 'AbbVie', unit_price: 24.50, stock_quantity: 90, expiry_date: new Date('2027-09-30'), description: 'Thyroid hormone replacement' },
    { medicine_name: 'Albuterol Inhaler 90mcg', category: 'Respiratory', manufacturer: 'GlaxoSmithKline', unit_price: 45.00, stock_quantity: 35, expiry_date: new Date('2027-07-22'), description: 'Short-acting beta2-agonist for bronchospasm and asthma' },
    { medicine_name: 'Paracetamol 500mg', category: 'Analgesic & Antipyretic', manufacturer: 'GSK', unit_price: 5.00, stock_quantity: 450, expiry_date: new Date('2029-06-18'), description: 'Mild pain and fever reducer' },
    { medicine_name: 'Hydrochlorothiazide 25mg', category: 'Cardiovascular', manufacturer: 'Mylan', unit_price: 12.50, stock_quantity: 8, expiry_date: new Date('2026-12-01'), description: 'Thiazide diuretic for fluid retention and blood pressure' },
    { medicine_name: 'Gabapentin 300mg', category: 'Neurology', manufacturer: 'Pfizer Inc.', unit_price: 36.00, stock_quantity: 50, expiry_date: new Date('2027-04-12'), description: 'Anticonvulsant for neuropathic nerve pain' },
    { medicine_name: 'Prednisone 10mg', category: 'Corticosteroid', manufacturer: 'Hikma', unit_price: 15.00, stock_quantity: 110, expiry_date: new Date('2028-02-28'), description: 'Systemic immunosuppressant steroid' },
    { medicine_name: 'Clopidogrel 75mg', category: 'Cardiovascular', manufacturer: 'Sanofi', unit_price: 38.00, stock_quantity: 65, expiry_date: new Date('2027-12-10'), description: 'Antiplatelet medication to prevent blood clots' },
    { medicine_name: 'Ciprofloxacin 500mg', category: 'Antibiotic', manufacturer: 'Bayer', unit_price: 26.00, stock_quantity: 15, expiry_date: new Date('2026-10-20'), description: 'Fluoroquinolone antibiotic for bacterial infections' },
    { medicine_name: 'Sertraline 50mg', category: 'Psychiatry', manufacturer: 'Viatris', unit_price: 30.00, stock_quantity: 80, expiry_date: new Date('2028-04-15'), description: 'SSRI antidepressant and anxiolytic' },
    { medicine_name: 'Montelukast 10mg', category: 'Respiratory', manufacturer: 'Merck & Co.', unit_price: 27.00, stock_quantity: 120, expiry_date: new Date('2028-08-30'), description: 'Leukotriene receptor antagonist for asthma' },
    { medicine_name: 'Cetirizine 10mg', category: 'Antihistamine', manufacturer: 'Johnson & Johnson', unit_price: 9.00, stock_quantity: 240, expiry_date: new Date('2029-01-10'), description: 'Second-generation allergy relief antihistamine' },
    { medicine_name: 'Pantoprazole 40mg', category: 'Gastroenterology', manufacturer: 'Takeda', unit_price: 21.00, stock_quantity: 130, expiry_date: new Date('2028-07-05'), description: 'Delayed-release acid reduction proton pump inhibitor' }
  ];

  const createdMedicines: any[] = [];
  for (const med of medicinesData) {
    const m = await prisma.medicine.create({ data: med });
    createdMedicines.push(m);
  }
  console.log('Created ' + createdMedicines.length + ' medicines.');

  // 6. Seed Lab Tests Catalog (15)
  const labTestsData = [
    { test_name: 'Complete Blood Count (CBC)', description: 'Evaluates overall health and detects wide range of disorders including anemia and leukemia', price: 45.00 },
    { test_name: 'Comprehensive Metabolic Panel (CMP)', description: 'Measures 14 substances including glucose, calcium, electrolytes, kidney and liver enzymes', price: 65.00 },
    { test_name: 'Lipid Panel Profile', description: 'Measures total cholesterol, LDL, HDL, and triglycerides to evaluate heart risk', price: 50.00 },
    { test_name: 'Hemoglobin A1c (HbA1c)', description: 'Monitors average blood sugar level over the past 2 to 3 months', price: 55.00 },
    { test_name: 'Thyroid Stimulating Hormone (TSH)', description: 'Checks for underactive or overactive thyroid conditions', price: 60.00 },
    { test_name: 'Cardiac Troponin I', description: 'Highly sensitive marker for cardiac muscle damage and acute myocardial infarction', price: 85.00 },
    { test_name: '12-Lead Electrocardiogram (ECG)', description: 'Records electrical signals from the heart to detect arrhythmias and ischemia', price: 95.00 },
    { test_name: 'Chest X-Ray (Posteroanterior)', description: 'Radiographic image of chest, lungs, heart, large arteries, and diaphragm', price: 120.00 },
    { test_name: 'Brain Magnetic Resonance Imaging (MRI)', description: 'High-resolution imaging to evaluate neurological structure, stroke, and tumors', price: 650.00 },
    { test_name: 'Echocardiogram (2D Echo with Doppler)', description: 'Ultrasound visualization of heart valves, chambers, and blood flow velocity', price: 280.00 },
    { test_name: 'Urinalysis Complete with Microscopy', description: 'Physical, chemical, and microscopic exam of urine for renal diseases', price: 35.00 },
    { test_name: 'Liver Function Test (LFT)', description: 'Measures ALT, AST, Alkaline Phosphatase, Albumin, and Bilirubin', price: 55.00 },
    { test_name: 'Renal Function Panel (BUN & Creatinine)', description: 'Assesses glomerular filtration and kidney filtration efficiency', price: 45.00 },
    { test_name: 'Serum Vitamin D (25-Hydroxy)', description: 'Evaluates bone health and systemic immune status', price: 70.00 },
    { test_name: 'Skin Allergy Patch Testing', description: 'Identifies contact allergens causing contact dermatitis', price: 110.00 }
  ];

  const createdLabTests: any[] = [];
  for (const test of labTestsData) {
    const t = await prisma.labTest.create({ data: test });
    createdLabTests.push(t);
  }
  console.log('Created ' + createdLabTests.length + ' lab tests.');

  // 7. Seed Appointments (52)
  const appointmentReasons = [
    'Annual wellness routine physical examination',
    'Follow-up on stage 1 hypertension medication adjustment',
    'Persistent chest tightness on physical exertion',
    'Chronic migrainous episodes with photophobia',
    'Right knee pain and joint stiffness while walking',
    'Childhood vaccination schedule and developmental check',
    'Recurrent respiratory allergies and nighttime cough',
    'Routine glycemic control review for type 2 diabetes',
    'Evaluation of suspicious erythematous skin lesion',
    'Post-operative orthopedic rehabilitation check',
    'Unexplained fatigue and dizziness upon standing',
    'Severe lower back pain radiating to left leg'
  ];

  const timeSlots = ['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM'];

  const createdAppointments: any[] = [];
  const occupiedSlots = new Set<string>();

  for (let i = 0; i < 52; i++) {
    const patient = createdPatients[i % createdPatients.length];
    const doctor = createdDoctors[i % createdDoctors.length];
    
    const dayOffset = (i < 36) ? -(36 - i) : (i - 35);
    const apptDate = new Date(Date.now() + dayOffset * 86400000);
    const dateStr = apptDate.toISOString().split('T')[0];

    let slot = timeSlots[i % timeSlots.length];
    let key = doctor.doctor_id + '_' + dateStr + '_' + slot;
    let slotIdx = 0;
    while (occupiedSlots.has(key) && slotIdx < timeSlots.length) {
      slot = timeSlots[slotIdx];
      key = doctor.doctor_id + '_' + dateStr + '_' + slot;
      slotIdx++;
    }
    occupiedSlots.add(key);

    const status = (dayOffset < 0) 
      ? (i % 7 === 0 ? 'Cancelled' : (i % 9 === 0 ? 'No Show' : 'Completed'))
      : 'Scheduled';

    const appt = await prisma.appointment.create({
      data: {
        patient_id: patient.patient_id,
        doctor_id: doctor.doctor_id,
        appointment_date: new Date(dateStr),
        appointment_time: slot,
        reason: appointmentReasons[i % appointmentReasons.length],
        status,
        notes: status === 'Completed' ? 'Patient attended consultation; treatment plan outlined.' : (status === 'Cancelled' ? 'Cancelled by patient due to schedule conflict.' : 'Appointment confirmed with patient.')
      }
    });
    createdAppointments.push(appt);
  }
  console.log('Created ' + createdAppointments.length + ' appointments.');

  // 8. Seed Prescriptions (18) and Prescription Items (36)
  const completedAppointments = createdAppointments.filter(a => a.status === 'Completed');
  const createdPrescriptions: any[] = [];

  for (let i = 0; i < 18 && i < completedAppointments.length; i++) {
    const appt = completedAppointments[i];
    const prescription = await prisma.prescription.create({
      data: {
        patient_id: appt.patient_id,
        doctor_id: appt.doctor_id,
        appointment_id: appt.appointment_id,
        prescription_date: appt.appointment_date,
        diagnosis: 'Diagnosed clinical condition related to ' + appt.reason.toLowerCase(),
        notes: 'Take medications with full glass of water. Report any adverse reactions immediately.'
      }
    });
    createdPrescriptions.push(prescription);

    const med1 = createdMedicines[(i * 2) % createdMedicines.length];
    const med2 = createdMedicines[(i * 2 + 1) % createdMedicines.length];

    await prisma.prescriptionItem.create({
      data: {
        prescription_id: prescription.prescription_id,
        medicine_id: med1.medicine_id,
        dosage: '1 tablet (500mg)',
        frequency: 'Twice daily after meals',
        duration: '7 days',
        instructions: 'Complete the entire course even if feeling better'
      }
    });

    await prisma.prescriptionItem.create({
      data: {
        prescription_id: prescription.prescription_id,
        medicine_id: med2.medicine_id,
        dosage: '1 capsule',
        frequency: 'Once daily in the morning',
        duration: '14 days',
        instructions: 'Take 30 minutes before breakfast'
      }
    });
  }
  console.log('Created ' + createdPrescriptions.length + ' prescriptions with 36 prescription items.');

  // 9. Seed Medical Records (22)
  for (let i = 0; i < 22 && i < completedAppointments.length; i++) {
    const appt = completedAppointments[i];
    await prisma.medicalRecord.create({
      data: {
        patient_id: appt.patient_id,
        doctor_id: appt.doctor_id,
        appointment_id: appt.appointment_id,
        diagnosis: 'Primary clinical assessment: ' + appt.reason,
        symptoms: 'Patient presented with localized discomfort, mild elevation in vital metrics, and recurring fatigue over 2 weeks.',
        treatment: 'Prescribed pharmacological regimen, dietary modification, and recommended follow-up in 30 days.',
        notes: 'Vitals stable. BP: 128/82 mmHg, Pulse: 72 bpm, Temp: 98.6 F.',
        record_date: appt.appointment_date
      }
    });
  }
  console.log('Created 22 Medical Records.');

  // 10. Seed Patient Lab Tests (20)
  const labStatuses = ['Completed', 'Completed', 'In Progress', 'Ordered'];
  for (let i = 0; i < 20 && i < completedAppointments.length; i++) {
    const appt = completedAppointments[i];
    const test = createdLabTests[i % createdLabTests.length];
    const status = labStatuses[i % labStatuses.length];
    await prisma.patientLabTest.create({
      data: {
        patient_id: appt.patient_id,
        doctor_id: appt.doctor_id,
        appointment_id: appt.appointment_id,
        test_id: test.test_id,
        test_date: appt.appointment_date,
        status,
        result: status === 'Completed' ? 'All biochemical and physiological parameters fall within normal reference intervals. No acute anomalies noted.' : (status === 'In Progress' ? 'Specimen received by diagnostic laboratory; analysis currently underway.' : 'Order placed. Awaiting sample collection.')
      }
    });
  }
  console.log('Created 20 Patient Lab Test orders.');

  // 11. Seed Billings (28)
  const paymentMethods = ['Credit Card', 'Cash', 'Insurance', 'UPI', 'Debit Card'];
  for (let i = 0; i < 28 && i < completedAppointments.length; i++) {
    const appt = completedAppointments[i];
    const doctor = createdDoctors.find(d => d.doctor_id === appt.doctor_id);
    
    const consultation = Number(doctor?.consultation_fee || 120.00);
    const medCharge = (i % 2 === 0) ? 45.00 : 0.00;
    const testCharge = (i % 3 === 0) ? 65.00 : 0.00;
    const otherCharge = (i % 4 === 0) ? 15.00 : 0.00;
    const discount = (i % 5 === 0) ? 20.00 : 0.00;
    const total = consultation + medCharge + testCharge + otherCharge - discount;

    const paymentStatus = (i % 4 === 0) ? 'Pending' : (i % 7 === 0 ? 'Partially Paid' : 'Paid');

    await prisma.billing.create({
      data: {
        patient_id: appt.patient_id,
        appointment_id: appt.appointment_id,
        bill_date: appt.appointment_date,
        consultation_charge: consultation,
        medicine_charge: medCharge,
        test_charge: testCharge,
        other_charge: otherCharge,
        discount: discount,
        total_amount: total,
        payment_status: paymentStatus,
        payment_method: paymentMethods[i % paymentMethods.length]
      }
    });
  }
  console.log('Created 28 Billing records.');

  console.log('--- Database Seeding Finished Successfully ---');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
