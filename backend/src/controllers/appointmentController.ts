import { Request, Response } from 'express';
import { prisma } from '../db/prisma.js';
import { AuthRequest } from '../middleware/auth.js';

export async function getAppointments(req: AuthRequest, res: Response) {
  try {
    const { doctor_id, patient_id, date, status, search } = req.query;

    const where: any = {};

    if (req.user && req.user.role === 'DOCTOR' && req.user.doctor_id) {
      where.doctor_id = req.user.doctor_id;
    } else if (doctor_id && doctor_id !== 'ALL') {
      where.doctor_id = doctor_id as string;
    }

    if (patient_id) {
      where.patient_id = patient_id as string;
    }

    if (date) {
      const parsedDate = new Date(date as string);
      where.appointment_date = parsedDate;
    }

    if (status && status !== 'ALL') {
      where.status = status as string;
    }

    if (search && typeof search === 'string') {
      const q = search.trim();
      where.OR = [
        { patient: { first_name: { contains: q, mode: 'insensitive' } } },
        { patient: { last_name: { contains: q, mode: 'insensitive' } } },
        { doctor: { first_name: { contains: q, mode: 'insensitive' } } },
        { doctor: { last_name: { contains: q, mode: 'insensitive' } } },
        { reason: { contains: q, mode: 'insensitive' } }
      ];
    }

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        patient: true,
        doctor: {
          include: { department: true }
        },
        prescription: true,
        billing: true
      },
      orderBy: [
        { appointment_date: 'desc' },
        { appointment_time: 'asc' }
      ]
    });

    return res.status(200).json({ success: true, data: appointments });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to fetch appointments.' });
  }
}

export async function createAppointment(req: Request, res: Response) {
  try {
    const { patient_id, doctor_id, appointment_date, appointment_time, reason, notes } = req.body;

    const dateStr = typeof appointment_date === 'string' ? appointment_date.split('T')[0] : appointment_date;
    const parsedDate = new Date(`${dateStr}T00:00:00.000Z`);

    // Conflict detection: Doctor cannot have two active appointments at the exact same slot
    const existingConflict = await prisma.appointment.findFirst({
      where: {
        doctor_id,
        appointment_date: parsedDate,
        appointment_time: appointment_time.trim(),
        status: { not: 'Cancelled' }
      },
      include: {
        doctor: true
      }
    });

    if (existingConflict) {
      const docName = 'Dr. ' + existingConflict.doctor.first_name + ' ' + existingConflict.doctor.last_name;
      return res.status(409).json({
        success: false,
        message: 'Scheduling Conflict: ' + docName + ' already has an active appointment scheduled on ' + dateStr + ' at ' + appointment_time + '. Please select a different time slot.'
      });
    }

    const appointment = await prisma.appointment.create({
      data: {
        patient_id,
        doctor_id,
        appointment_date: parsedDate,
        appointment_time: appointment_time.trim(),
        reason: reason.trim(),
        notes: notes ? notes.trim() : null,
        status: 'Scheduled'
      },
      include: {
        patient: true,
        doctor: {
          include: { department: true }
        }
      }
    });

    return res.status(201).json({ success: true, message: 'Appointment scheduled successfully.', data: appointment });
  } catch (error: any) {
    if (error.code === 'P2002' || error.message?.includes('Unique constraint')) {
      return res.status(409).json({
        success: false,
        message: 'Scheduling Conflict: The selected doctor already has an appointment scheduled at this date and time slot.'
      });
    }
    return res.status(500).json({ success: false, message: error.message || 'Failed to schedule appointment.' });
  }
}

export async function updateAppointment(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { status, appointment_date, appointment_time, reason, notes } = req.body;

    const existing = await prisma.appointment.findUnique({
      where: { appointment_id: id },
      include: { doctor: true }
    });

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }

    if (appointment_date && appointment_time) {
      const newDate = new Date(appointment_date);
      const conflict = await prisma.appointment.findFirst({
        where: {
          doctor_id: existing.doctor_id,
          appointment_date: newDate,
          appointment_time: appointment_time.trim(),
          status: 'Scheduled',
          appointment_id: { not: id }
        }
      });

      if (conflict) {
        return res.status(409).json({
          success: false,
          message: 'Scheduling Conflict: Dr. ' + existing.doctor.first_name + ' ' + existing.doctor.last_name + ' is already booked on ' + appointment_date + ' at ' + appointment_time + '.'
        });
      }
    }

    const updated = await prisma.appointment.update({
      where: { appointment_id: id },
      data: {
        ...(status && { status }),
        ...(appointment_date && { appointment_date: new Date(appointment_date) }),
        ...(appointment_time && { appointment_time: appointment_time.trim() }),
        ...(reason && { reason: reason.trim() }),
        ...(notes !== undefined && { notes: notes ? notes.trim() : null })
      },
      include: {
        patient: true,
        doctor: {
          include: { department: true }
        }
      }
    });

    return res.status(200).json({ success: true, message: 'Appointment updated successfully.', data: updated });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to update appointment.' });
  }
}

export async function deleteAppointment(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const existing = await prisma.appointment.findUnique({ where: { appointment_id: id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }

    await prisma.appointment.delete({ where: { appointment_id: id } });
    return res.status(200).json({ success: true, message: 'Appointment removed successfully.' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to delete appointment.' });
  }
}
