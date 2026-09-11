import { Request, Response } from 'express';
import { prisma } from '../db/prisma.js';

export async function getBills(req: Request, res: Response) {
  try {
    const { payment_status, patient_id, search } = req.query;

    const where: any = {};

    if (payment_status && payment_status !== 'ALL') {
      where.payment_status = payment_status as string;
    }

    if (patient_id) {
      where.patient_id = patient_id as string;
    }

    if (search && typeof search === 'string') {
      const q = search.trim();
      where.OR = [
        { patient: { first_name: { contains: q, mode: 'insensitive' } } },
        { patient: { last_name: { contains: q, mode: 'insensitive' } } },
        { bill_id: { contains: q, mode: 'insensitive' } }
      ];
    }

    const bills = await prisma.billing.findMany({
      where,
      include: {
        patient: true,
        appointment: {
          include: {
            doctor: {
              include: { department: true }
            }
          }
        }
      },
      orderBy: { bill_date: 'desc' }
    });

    return res.status(200).json({ success: true, data: bills });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to fetch bills.' });
  }
}

export async function getBillById(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const bill = await prisma.billing.findUnique({
      where: { bill_id: id },
      include: {
        patient: true,
        appointment: {
          include: {
            doctor: {
              include: { department: true }
            },
            prescription: {
              include: {
                items: {
                  include: { medicine: true }
                }
              }
            }
          }
        }
      }
    });

    if (!bill) {
      return res.status(404).json({ success: false, message: 'Bill not found.' });
    }

    return res.status(200).json({ success: true, data: bill });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to fetch bill.' });
  }
}

export async function createBill(req: Request, res: Response) {
  try {
    const {
      patient_id,
      appointment_id,
      bill_date,
      consultation_charge = 0,
      medicine_charge = 0,
      test_charge = 0,
      other_charge = 0,
      discount = 0,
      payment_status = 'Pending',
      payment_method = 'Cash'
    } = req.body;

    const c = Number(consultation_charge) || 0;
    const m = Number(medicine_charge) || 0;
    const t = Number(test_charge) || 0;
    const o = Number(other_charge) || 0;
    const d = Number(discount) || 0;

    // Mathematical formula for total billing amount
    const total_amount = Math.max(0, (c + m + t + o) - d);

    const bill = await prisma.billing.create({
      data: {
        patient_id,
        appointment_id: appointment_id || null,
        bill_date: bill_date ? new Date(bill_date) : new Date(),
        consultation_charge: c,
        medicine_charge: m,
        test_charge: t,
        other_charge: o,
        discount: d,
        total_amount,
        payment_status,
        payment_method
      },
      include: {
        patient: true,
        appointment: {
          include: { doctor: true }
        }
      }
    });

    return res.status(201).json({ success: true, message: 'Invoice generated successfully.', data: bill });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to create bill.' });
  }
}

export async function updateBill(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { payment_status, payment_method, discount } = req.body;

    const existing = await prisma.billing.findUnique({ where: { bill_id: id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Bill not found.' });
    }

    let total_amount = Number(existing.total_amount);
    let newDiscount = Number(existing.discount);

    if (discount !== undefined) {
      newDiscount = Number(discount);
      const subtotal = Number(existing.consultation_charge) + Number(existing.medicine_charge) + Number(existing.test_charge) + Number(existing.other_charge);
      total_amount = Math.max(0, subtotal - newDiscount);
    }

    const updated = await prisma.billing.update({
      where: { bill_id: id },
      data: {
        ...(payment_status && { payment_status }),
        ...(payment_method && { payment_method }),
        ...(discount !== undefined && { discount: newDiscount, total_amount })
      },
      include: {
        patient: true,
        appointment: {
          include: { doctor: true }
        }
      }
    });

    return res.status(200).json({ success: true, message: 'Bill updated successfully.', data: updated });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to update bill.' });
  }
}
