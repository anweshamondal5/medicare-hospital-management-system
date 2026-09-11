import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import app from '../src/server.js';
import { prisma } from '../src/db/prisma.js';

describe('MediCare HMS — Backend Integration Tests', () => {
  let adminToken: string;
  let doctorToken: string;
  let receptionToken: string;
  let testPatientId: string;
  let testDoctorId: string;
  let testMedicineId: string;
  let initialStock: number;
  let testAppointmentId: string;

  beforeAll(async () => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      // Clean up any lingering test appointment from previous runs
      await prisma.appointment.deleteMany({
        where: {
          appointment_date: new Date('2026-12-01T00:00:00.000Z')
        }
      });
    } catch (e) {
      console.warn('Database connection check warning in test');
    }
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('1. Authentication & Role Authorization', () => {
    it('should authenticate Admin user and return JWT token', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@medicare.demo',
          password: 'Admin@123'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.role).toBe('ADMIN');
      adminToken = res.body.token;
    });

    it('should authenticate Doctor user and return JWT token', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'doctor@medicare.demo',
          password: 'Doctor@123'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user.role).toBe('DOCTOR');
      doctorToken = res.body.token;
    });

    it('should authenticate Receptionist user', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'reception@medicare.demo',
          password: 'Reception@123'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user.role).toBe('RECEPTIONIST');
      receptionToken = res.body.token;
    });

    it('should reject invalid credentials with 401 Unauthorized', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@medicare.demo',
          password: 'WrongPassword999!'
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should return 401 when accessing protected route without token', async () => {
      const res = await request(app).get('/api/patients');
      expect(res.status).toBe(401);
    });
  });

  describe('2. Patient Management', () => {
    it('should register a new patient via Receptionist token', async () => {
      const uniqueSuffix = Date.now();
      const res = await request(app)
        .post('/api/patients')
        .set('Authorization', 'Bearer ' + receptionToken)
        .send({
          first_name: 'Test',
          last_name: 'Patient',
          date_of_birth: '1995-04-12',
          gender: 'Female',
          blood_group: 'O+',
          phone: '+1-555-TEST-' + uniqueSuffix,
          email: 'testpatient' + uniqueSuffix + '@example.com',
          address: '456 Test Blvd, Suite 100',
          emergency_contact: 'Spouse: +1-555-0999'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.patient_id).toBeDefined();
      testPatientId = res.body.data.patient_id;
    });

    it('should retrieve list of patients with pagination and search', async () => {
      const res = await request(app)
        .get('/api/patients?search=Test')
        .set('Authorization', 'Bearer ' + adminToken);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should retrieve detailed patient profile by ID', async () => {
      const res = await request(app)
        .get('/api/patients/' + testPatientId)
        .set('Authorization', 'Bearer ' + adminToken);

      expect(res.status).toBe(200);
      expect(res.body.data.patient_id).toBe(testPatientId);
      expect(res.body.data.appointments).toBeDefined();
    });
  });

  describe('3. Doctor Management & Appointment Conflicts', () => {
    it('should list all doctors and select a test doctor', async () => {
      const res = await request(app)
        .get('/api/doctors')
        .set('Authorization', 'Bearer ' + adminToken);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
      testDoctorId = res.body.data[0].doctor_id;
    });

    it('should schedule an appointment successfully', async () => {
      const res = await request(app)
        .post('/api/appointments')
        .set('Authorization', 'Bearer ' + receptionToken)
        .send({
          patient_id: testPatientId,
          doctor_id: testDoctorId,
          appointment_date: '2026-12-01',
          appointment_time: '11:00 AM',
          reason: 'Routine cardiac checkup',
          notes: 'Test appointment notes'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      testAppointmentId = res.body.data.appointment_id;
    });

    it('should PREVENT scheduling conflict (double-booking doctor at same date & time)', async () => {
      const res = await request(app)
        .post('/api/appointments')
        .set('Authorization', 'Bearer ' + receptionToken)
        .send({
          patient_id: testPatientId,
          doctor_id: testDoctorId,
          appointment_date: '2026-12-01',
          appointment_time: '11:00 AM',
          reason: 'Attempting conflicting booking'
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Scheduling Conflict');
    });
  });

  describe('4. Medicine Inventory & Transactional Prescriptions', () => {
    it('should list medicines and find test medicine stock', async () => {
      const res = await request(app)
        .get('/api/medicines')
        .set('Authorization', 'Bearer ' + adminToken);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
      const med = res.body.data[0];
      testMedicineId = med.medicine_id;
      initialStock = med.stock_quantity;
    });

    it('should create prescription and automatically decrement medicine inventory in a transaction', async () => {
      const res = await request(app)
        .post('/api/prescriptions')
        .set('Authorization', 'Bearer ' + doctorToken)
        .send({
          patient_id: testPatientId,
          doctor_id: testDoctorId,
          appointment_id: testAppointmentId,
          diagnosis: 'Mild Hypertension',
          notes: 'Drink plenty of water and reduce sodium intake',
          items: [
            {
              medicine_id: testMedicineId,
              dosage: '1 tablet (500mg)',
              frequency: 'Twice daily',
              duration: '10 days',
              instructions: 'Take after meals'
            }
          ]
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);

      // Verify inventory was decremented
      const checkMed = await request(app)
        .get('/api/medicines/' + testMedicineId)
        .set('Authorization', 'Bearer ' + adminToken);

      expect(checkMed.body.data.stock_quantity).toBe(initialStock - 1);
    });
  });

  describe('5. Billing Calculations', () => {
    it('should calculate itemized bill mathematically: (consultation + medicine + test + other) - discount', async () => {
      const res = await request(app)
        .post('/api/bills')
        .set('Authorization', 'Bearer ' + receptionToken)
        .send({
          patient_id: testPatientId,
          appointment_id: testAppointmentId,
          consultation_charge: 150.00,
          medicine_charge: 50.00,
          test_charge: 100.00,
          other_charge: 20.00,
          discount: 30.00,
          payment_status: 'Paid',
          payment_method: 'Credit Card'
        });

      expect(res.status).toBe(201);
      expect(Number(res.body.data.total_amount)).toBe(290.00);
      expect(res.body.data.payment_status).toBe('Paid');
    });
  });

  describe('6. Role-Based Access Guards (RBAC)', () => {
    it('should prevent Doctor from deleting patients', async () => {
      const res = await request(app)
        .delete('/api/patients/' + testPatientId)
        .set('Authorization', 'Bearer ' + doctorToken);

      expect(res.status).toBe(403);
      expect(res.body.message).toContain('Forbidden');
    });

    it('should prevent Receptionist from prescribing medicines', async () => {
      const res = await request(app)
        .post('/api/prescriptions')
        .set('Authorization', 'Bearer ' + receptionToken)
        .send({
          patient_id: testPatientId,
          doctor_id: testDoctorId,
          diagnosis: 'Unauthorized attempt',
          items: [{ medicine_id: testMedicineId, dosage: '1', frequency: 'daily', duration: '5 days' }]
        });

      expect(res.status).toBe(403);
    });
  });
});
