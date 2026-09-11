import { Request, Response } from 'express';
import { prisma } from '../db/prisma.js';

export async function getLabTests(req: Request, res: Response) {
  try {
    const tests = await prisma.labTest.findMany({
      orderBy: { test_name: 'asc' }
    });
    return res.status(200).json({ success: true, data: tests });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to fetch lab tests.' });
  }
}

export async function createLabTest(req: Request, res: Response) {
  try {
    const { test_name, description, price } = req.body;

    const existing = await prisma.labTest.findUnique({ where: { test_name: test_name.trim() } });
    if (existing) {
      return res.status(409).json({ success: false, message: 'A lab test with this name already exists.' });
    }

    const test = await prisma.labTest.create({
      data: {
        test_name: test_name.trim(),
        description: description ? description.trim() : null,
        price: Number(price)
      }
    });

    return res.status(201).json({ success: true, message: 'Lab test added to catalog.', data: test });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to create lab test.' });
  }
}

export async function getPatientLabTests(req: Request, res: Response) {
  try {
    const { patient_id, status } = req.query;

    const where: any = {};
    if (patient_id) where.patient_id = patient_id as string;
    if (status && status !== 'ALL') where.status = status as string;

    const orders = await prisma.patientLabTest.findMany({
      where,
      include: {
        patient: true,
        doctor: true,
        test: true,
        appointment: true
      },
      orderBy: { test_date: 'desc' }
    });

    return res.status(200).json({ success: true, data: orders });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to fetch test orders.' });
  }
}

export async function orderPatientLabTest(req: Request, res: Response) {
  try {
    const { patient_id, doctor_id, test_id, appointment_id, test_date } = req.body;

    const order = await prisma.patientLabTest.create({
      data: {
        patient_id,
        doctor_id,
        test_id,
        appointment_id: appointment_id || null,
        test_date: test_date ? new Date(test_date) : new Date(),
        status: 'Ordered'
      },
      include: {
        patient: true,
        doctor: true,
        test: true
      }
    });

    return res.status(201).json({ success: true, message: 'Lab test ordered successfully.', data: order });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to order lab test.' });
  }
}

export async function updatePatientLabTest(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { result, status } = req.body;

    const updated = await prisma.patientLabTest.update({
      where: { patient_lab_test_id: id },
      data: {
        ...(status && { status }),
        ...(result !== undefined && { result: result ? result.trim() : null })
      },
      include: {
        patient: true,
        doctor: true,
        test: true
      }
    });

    return res.status(200).json({ success: true, message: 'Lab test order updated.', data: updated });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to update lab test.' });
  }
}
