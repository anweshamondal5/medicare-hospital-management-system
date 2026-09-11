import { Request, Response } from 'express';
import { prisma } from '../db/prisma.js';

export async function getDashboardStats(req: Request, res: Response) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      totalPatients,
      totalDoctors,
      todayAppointments,
      pendingAppointments,
      availableMedicines,
      lowStockMedicines,
      paidBills,
      appointmentStatusCounts,
      recentAppointments,
      lowStockList
    ] = await Promise.all([
      prisma.patient.count(),
      prisma.doctor.count(),
      prisma.appointment.count({
        where: {
          appointment_date: {
            gte: today,
            lt: tomorrow
          }
        }
      }),
      prisma.appointment.count({
        where: { status: 'Scheduled' }
      }),
      prisma.medicine.count({
        where: { stock_quantity: { gt: 0 } }
      }),
      prisma.medicine.count({
        where: { stock_quantity: { lte: 20 } }
      }),
      prisma.billing.aggregate({
        _sum: { total_amount: true },
        where: { payment_status: 'Paid' }
      }),
      prisma.appointment.groupBy({
        by: ['status'],
        _count: { appointment_id: true }
      }),
      prisma.appointment.findMany({
        take: 6,
        orderBy: { appointment_date: 'desc' },
        include: {
          patient: true,
          doctor: {
            include: { department: true }
          }
        }
      }),
      prisma.medicine.findMany({
        where: { stock_quantity: { lte: 20 } },
        take: 5,
        orderBy: { stock_quantity: 'asc' }
      })
    ]);

    // Format appointment status distribution for Recharts
    const statusMap: Record<string, number> = {
      Scheduled: 0,
      Completed: 0,
      Cancelled: 0,
      'No Show': 0
    };
    appointmentStatusCounts.forEach((s) => {
      statusMap[s.status] = s._count.appointment_id;
    });

    const appointmentDistribution = [
      { status: 'Scheduled', count: statusMap['Scheduled'] || 0, fill: '#3b82f6' },
      { status: 'Completed', count: statusMap['Completed'] || 0, fill: '#10b981' },
      { status: 'Cancelled', count: statusMap['Cancelled'] || 0, fill: '#ef4444' },
      { status: 'No Show', count: statusMap['No Show'] || 0, fill: '#f59e0b' }
    ];

    // Compute monthly registration trend
    const allPatients = await prisma.patient.findMany({
      select: { registration_date: true },
      orderBy: { registration_date: 'asc' }
    });

    const monthlyRegistrations: Record<string, number> = {};
    allPatients.forEach((p) => {
      const monthKey = new Date(p.registration_date).toISOString().slice(0, 7); // YYYY-MM
      monthlyRegistrations[monthKey] = (monthlyRegistrations[monthKey] || 0) + 1;
    });

    const patientTrend = Object.entries(monthlyRegistrations).map(([month, count]) => ({
      month,
      patients: count
    }));

    // Compute monthly revenue trend
    const allBills = await prisma.billing.findMany({
      select: { bill_date: true, total_amount: true, payment_status: true },
      orderBy: { bill_date: 'asc' }
    });

    const monthlyRevenue: Record<string, { month: string; billed: number; collected: number }> = {};
    allBills.forEach((b) => {
      const monthKey = new Date(b.bill_date).toISOString().slice(0, 7);
      if (!monthlyRevenue[monthKey]) {
        monthlyRevenue[monthKey] = { month: monthKey, billed: 0, collected: 0 };
      }
      const amt = Number(b.total_amount);
      monthlyRevenue[monthKey].billed += amt;
      if (b.payment_status === 'Paid') {
        monthlyRevenue[monthKey].collected += amt;
      }
    });

    const revenueTrend = Object.values(monthlyRevenue);

    return res.status(200).json({
      success: true,
      data: {
        totalPatients,
        totalDoctors,
        todayAppointments,
        pendingAppointments,
        totalRevenue: Number(paidBills._sum.total_amount || 0),
        availableMedicines,
        lowStockMedicines,
        appointmentDistribution,
        patientTrend,
        revenueTrend,
        recentAppointments,
        lowStockList
      }
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to fetch dashboard stats.' });
  }
}
