import { Request, Response } from 'express';
import { prisma } from '../db/prisma.js';

export async function getPatients(req: Request, res: Response) {
  try {
    const { search, gender, blood_group, page = '1', limit = '10', sortBy = 'created_at', sortOrder = 'desc' } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const take = Math.min(100, Math.max(1, parseInt(limit as string, 10) || 10));
    const skip = (pageNum - 1) * take;

    const where: any = {};

    if (search && typeof search === 'string') {
      const q = search.trim();
      where.OR = [
        { first_name: { contains: q, mode: 'insensitive' } },
        { last_name: { contains: q, mode: 'insensitive' } },
        { phone: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
        { patient_id: { contains: q, mode: 'insensitive' } }
      ];
    }

    if (gender && gender !== 'ALL') {
      where.gender = gender;
    }

    if (blood_group && blood_group !== 'ALL') {
      where.blood_group = blood_group;
    }

    const [total, patients] = await Promise.all([
      prisma.patient.count({ where }),
      prisma.patient.findMany({
        where,
        skip,
        take,
        orderBy: { [(sortBy as string) || 'created_at']: sortOrder === 'asc' ? 'asc' : 'desc' },
        include: {
          _count: {
            select: {
              appointments: true,
              prescriptions: true,
              medical_records: true,
              billings: true
            }
          }
        }
      })
    ]);

    return res.status(200).json({
      success: true,
      data: patients,
      pagination: {
        total,
        page: pageNum,
        limit: take,
        totalPages: Math.ceil(total / take)
      }
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to fetch patients.' });
  }
}

export async function getPatientById(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const patient = await prisma.patient.findUnique({
      where: { patient_id: id },
      include: {
        appointments: {
          include: {
            doctor: {
              include: { department: true }
            }
          },
          orderBy: { appointment_date: 'desc' }
        },
        medical_records: {
          include: {
            doctor: {
              select: { first_name: true, last_name: true, specialization: true }
            }
          },
          orderBy: { record_date: 'desc' }
        },
        prescriptions: {
          include: {
            doctor: {
              select: { first_name: true, last_name: true, specialization: true }
            },
            items: {
              include: { medicine: true }
            }
          },
          orderBy: { prescription_date: 'desc' }
        },
        patient_lab_tests: {
          include: {
            test: true,
            doctor: {
              select: { first_name: true, last_name: true }
            }
          },
          orderBy: { test_date: 'desc' }
        },
        billings: {
          include: {
            appointment: true
          },
          orderBy: { bill_date: 'desc' }
        }
      }
    });

    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found.' });
    }

    return res.status(200).json({ success: true, data: patient });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to fetch patient details.' });
  }
}

export async function createPatient(req: Request, res: Response) {
  try {
    const { first_name, last_name, date_of_birth, gender, blood_group, phone, email, address, emergency_contact } = req.body;

    // Check unique constraints
    const existingEmail = await prisma.patient.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (existingEmail) {
      return res.status(409).json({ success: false, message: 'A patient with this email already exists.' });
    }

    const existingPhone = await prisma.patient.findUnique({ where: { phone: phone.trim() } });
    if (existingPhone) {
      return res.status(409).json({ success: false, message: 'A patient with this phone number already exists.' });
    }

    const patient = await prisma.patient.create({
      data: {
        first_name: first_name.trim(),
        last_name: last_name.trim(),
        date_of_birth: new Date(date_of_birth),
        gender,
        blood_group,
        phone: phone.trim(),
        email: email.toLowerCase().trim(),
        address: address.trim(),
        emergency_contact: emergency_contact.trim()
      }
    });

    return res.status(201).json({ success: true, message: 'Patient registered successfully.', data: patient });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to create patient.' });
  }
}

export async function updatePatient(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { first_name, last_name, date_of_birth, gender, blood_group, phone, email, address, emergency_contact } = req.body;

    const existing = await prisma.patient.findUnique({ where: { patient_id: id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Patient not found.' });
    }

    // Check unique constraints if changed
    if (email && email.toLowerCase().trim() !== existing.email) {
      const emailConflict = await prisma.patient.findUnique({ where: { email: email.toLowerCase().trim() } });
      if (emailConflict) {
        return res.status(409).json({ success: false, message: 'Another patient is already using this email.' });
      }
    }

    if (phone && phone.trim() !== existing.phone) {
      const phoneConflict = await prisma.patient.findUnique({ where: { phone: phone.trim() } });
      if (phoneConflict) {
        return res.status(409).json({ success: false, message: 'Another patient is already using this phone number.' });
      }
    }

    const updated = await prisma.patient.update({
      where: { patient_id: id },
      data: {
        ...(first_name && { first_name: first_name.trim() }),
        ...(last_name && { last_name: last_name.trim() }),
        ...(date_of_birth && { date_of_birth: new Date(date_of_birth) }),
        ...(gender && { gender }),
        ...(blood_group && { blood_group }),
        ...(phone && { phone: phone.trim() }),
        ...(email && { email: email.toLowerCase().trim() }),
        ...(address && { address: address.trim() }),
        ...(emergency_contact && { emergency_contact: emergency_contact.trim() })
      }
    });

    return res.status(200).json({ success: true, message: 'Patient updated successfully.', data: updated });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to update patient.' });
  }
}

export async function deletePatient(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const existing = await prisma.patient.findUnique({ where: { patient_id: id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Patient not found.' });
    }

    await prisma.patient.delete({ where: { patient_id: id } });
    return res.status(200).json({ success: true, message: 'Patient and related records deleted successfully.' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to delete patient.' });
  }
}
