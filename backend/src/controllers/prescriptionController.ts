import { Request, Response } from 'express';
import { prisma } from '../db/prisma.js';

export async function getPrescriptions(req: Request, res: Response) {
  try {
    const { patient_id, doctor_id, appointment_id } = req.query;

    const where: any = {};
    if (patient_id) where.patient_id = patient_id as string;
    if (doctor_id) where.doctor_id = doctor_id as string;
    if (appointment_id) where.appointment_id = appointment_id as string;

    const prescriptions = await prisma.prescription.findMany({
      where,
      include: {
        patient: true,
        doctor: {
          include: { department: true }
        },
        appointment: true,
        items: {
          include: { medicine: true }
        }
      },
      orderBy: { prescription_date: 'desc' }
    });

    return res.status(200).json({ success: true, data: prescriptions });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to fetch prescriptions.' });
  }
}

export async function getPrescriptionById(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const prescription = await prisma.prescription.findUnique({
      where: { prescription_id: id },
      include: {
        patient: true,
        doctor: {
          include: { department: true }
        },
        appointment: true,
        items: {
          include: { medicine: true }
        }
      }
    });

    if (!prescription) {
      return res.status(404).json({ success: false, message: 'Prescription not found.' });
    }

    return res.status(200).json({ success: true, data: prescription });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to fetch prescription.' });
  }
}

export async function createPrescription(req: Request, res: Response) {
  try {
    const { patient_id, doctor_id, appointment_id, diagnosis, notes, items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'At least one medicine item is required.' });
    }

    // Execute within a database transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx) => {
      // 1. Verify and decrement stock for all medicines
      for (const item of items) {
        const med = await tx.medicine.findUnique({
          where: { medicine_id: item.medicine_id }
        });

        if (!med) {
          throw new Error('Medicine with ID ' + item.medicine_id + ' not found in inventory.');
        }

        if (med.stock_quantity < 1) {
          throw new Error('Insufficient stock for "' + med.medicine_name + '". Current stock: 0.');
        }

        // Deduct 1 unit pack from inventory
        await tx.medicine.update({
          where: { medicine_id: item.medicine_id },
          data: { stock_quantity: med.stock_quantity - 1 }
        });
      }

      // 2. Create Prescription
      const prescription = await tx.prescription.create({
        data: {
          patient_id,
          doctor_id,
          appointment_id: appointment_id || null,
          diagnosis: diagnosis.trim(),
          notes: notes ? notes.trim() : null,
          items: {
            create: items.map((item: any) => ({
              medicine_id: item.medicine_id,
              dosage: item.dosage.trim(),
              frequency: item.frequency.trim(),
              duration: item.duration.trim(),
              instructions: item.instructions ? item.instructions.trim() : null
            }))
          }
        },
        include: {
          patient: true,
          doctor: {
            include: { department: true }
          },
          items: {
            include: { medicine: true }
          }
        }
      });

      // 3. Mark appointment as Completed if linked
      if (appointment_id) {
        await tx.appointment.update({
          where: { appointment_id },
          data: { status: 'Completed' }
        });
      }

      return prescription;
    });

    return res.status(201).json({
      success: true,
      message: 'Prescription created successfully and medicine inventory updated.',
      data: result
    });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message || 'Failed to create prescription.' });
  }
}
