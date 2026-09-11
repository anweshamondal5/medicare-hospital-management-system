import { Request, Response } from 'express';
import { prisma } from '../db/prisma.js';

export async function getDoctors(req: Request, res: Response) {
  try {
    const { department_id, availability, search } = req.query;

    const where: any = {};
    if (department_id && department_id !== 'ALL') {
      where.department_id = department_id as string;
    }
    if (availability && availability !== 'ALL') {
      where.availability_status = availability as string;
    }
    if (search && typeof search === 'string') {
      const q = search.trim();
      where.OR = [
        { first_name: { contains: q, mode: 'insensitive' } },
        { last_name: { contains: q, mode: 'insensitive' } },
        { specialization: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } }
      ];
    }

    const doctors = await prisma.doctor.findMany({
      where,
      include: {
        department: true,
        _count: {
          select: {
            appointments: true,
            prescriptions: true,
            medical_records: true
          }
        }
      },
      orderBy: { first_name: 'asc' }
    });

    return res.status(200).json({ success: true, data: doctors });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to fetch doctors.' });
  }
}

export async function getDoctorById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const doctor = await prisma.doctor.findUnique({
      where: { doctor_id: id },
      include: {
        department: true,
        appointments: {
          where: { appointment_date: { gte: new Date() } },
          include: { patient: true },
          orderBy: { appointment_date: 'asc' },
          take: 10
        },
        _count: {
          select: {
            appointments: true,
            prescriptions: true,
            medical_records: true
          }
        }
      }
    });

    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found.' });
    }

    return res.status(200).json({ success: true, data: doctor });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to fetch doctor.' });
  }
}

export async function createDoctor(req: Request, res: Response) {
  try {
    const { first_name, last_name, specialization, department_id, phone, email, license_number, consultation_fee, availability_status } = req.body;

    const existingEmail = await prisma.doctor.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (existingEmail) {
      return res.status(409).json({ success: false, message: 'A doctor with this email already exists.' });
    }

    const existingLicense = await prisma.doctor.findUnique({ where: { license_number: license_number.trim() } });
    if (existingLicense) {
      return res.status(409).json({ success: false, message: 'A doctor with this license number already exists.' });
    }

    const doctor = await prisma.doctor.create({
      data: {
        first_name: first_name.trim(),
        last_name: last_name.trim(),
        specialization: specialization.trim(),
        department_id,
        phone: phone.trim(),
        email: email.toLowerCase().trim(),
        license_number: license_number.trim(),
        consultation_fee: Number(consultation_fee),
        availability_status: availability_status || 'Available'
      },
      include: { department: true }
    });

    return res.status(201).json({ success: true, message: 'Doctor created successfully.', data: doctor });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to create doctor.' });
  }
}

export async function updateDoctor(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { first_name, last_name, specialization, department_id, phone, consultation_fee, availability_status } = req.body;

    const existing = await prisma.doctor.findUnique({ where: { doctor_id: id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Doctor not found.' });
    }

    const doctor = await prisma.doctor.update({
      where: { doctor_id: id },
      data: {
        ...(first_name && { first_name: first_name.trim() }),
        ...(last_name && { last_name: last_name.trim() }),
        ...(specialization && { specialization: specialization.trim() }),
        ...(department_id && { department_id }),
        ...(phone && { phone: phone.trim() }),
        ...(consultation_fee !== undefined && { consultation_fee: Number(consultation_fee) }),
        ...(availability_status && { availability_status })
      },
      include: { department: true }
    });

    return res.status(200).json({ success: true, message: 'Doctor updated successfully.', data: doctor });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to update doctor.' });
  }
}

export async function deleteDoctor(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const existing = await prisma.doctor.findUnique({ where: { doctor_id: id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Doctor not found.' });
    }

    await prisma.doctor.delete({ where: { doctor_id: id } });
    return res.status(200).json({ success: true, message: 'Doctor deleted successfully.' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to delete doctor.' });
  }
}
