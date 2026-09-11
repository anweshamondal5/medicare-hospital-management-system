import { Request, Response } from 'express';
import { prisma } from '../db/prisma.js';

export async function getMedicalRecords(req: Request, res: Response) {
  try {
    const { patient_id, doctor_id } = req.query;

    const where: any = {};
    if (patient_id) where.patient_id = patient_id as string;
    if (doctor_id) where.doctor_id = doctor_id as string;

    const records = await prisma.medicalRecord.findMany({
      where,
      include: {
        patient: true,
        doctor: {
          include: { department: true }
        },
        appointment: true
      },
      orderBy: { record_date: 'desc' }
    });

    return res.status(200).json({ success: true, data: records });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to fetch medical records.' });
  }
}

export async function createMedicalRecord(req: Request, res: Response) {
  try {
    const { patient_id, doctor_id, appointment_id, diagnosis, symptoms, treatment, notes, record_date } = req.body;

    const record = await prisma.medicalRecord.create({
      data: {
        patient_id,
        doctor_id,
        appointment_id: appointment_id || null,
        diagnosis: diagnosis.trim(),
        symptoms: symptoms.trim(),
        treatment: treatment.trim(),
        notes: notes ? notes.trim() : null,
        record_date: record_date ? new Date(record_date) : new Date()
      },
      include: {
        patient: true,
        doctor: {
          include: { department: true }
        }
      }
    });

    return res.status(201).json({ success: true, message: 'Medical record created successfully.', data: record });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to create medical record.' });
  }
}
