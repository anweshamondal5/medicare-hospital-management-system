import { Request, Response } from 'express';
import { prisma } from '../db/prisma.js';

export async function getMedicines(req: Request, res: Response) {
  try {
    const { search, category, low_stock, expiring_soon } = req.query;

    const where: any = {};

    if (search && typeof search === 'string') {
      const q = search.trim();
      where.OR = [
        { medicine_name: { contains: q, mode: 'insensitive' } },
        { manufacturer: { contains: q, mode: 'insensitive' } },
        { category: { contains: q, mode: 'insensitive' } }
      ];
    }

    if (category && category !== 'ALL') {
      where.category = category as string;
    }

    if (low_stock === 'true') {
      where.stock_quantity = { lte: 20 };
    }

    if (expiring_soon === 'true') {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 90);
      where.expiry_date = { lte: futureDate };
    }

    const medicines = await prisma.medicine.findMany({
      where,
      orderBy: { medicine_name: 'asc' }
    });

    return res.status(200).json({ success: true, data: medicines });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to fetch medicines.' });
  }
}

export async function getMedicineById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const medicine = await prisma.medicine.findUnique({
      where: { medicine_id: id },
      include: {
        _count: {
          select: { prescription_items: true }
        }
      }
    });

    if (!medicine) {
      return res.status(404).json({ success: false, message: 'Medicine not found.' });
    }

    return res.status(200).json({ success: true, data: medicine });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to fetch medicine.' });
  }
}

export async function createMedicine(req: Request, res: Response) {
  try {
    const { medicine_name, category, manufacturer, unit_price, stock_quantity, expiry_date, description } = req.body;

    const existing = await prisma.medicine.findUnique({ where: { medicine_name: medicine_name.trim() } });
    if (existing) {
      return res.status(409).json({ success: false, message: 'A medicine with this name already exists in inventory.' });
    }

    const medicine = await prisma.medicine.create({
      data: {
        medicine_name: medicine_name.trim(),
        category: category.trim(),
        manufacturer: manufacturer.trim(),
        unit_price: Number(unit_price),
        stock_quantity: parseInt(stock_quantity, 10),
        expiry_date: new Date(expiry_date),
        description: description ? description.trim() : null
      }
    });

    return res.status(201).json({ success: true, message: 'Medicine added to inventory.', data: medicine });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to create medicine.' });
  }
}

export async function updateMedicine(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { medicine_name, category, manufacturer, unit_price, stock_quantity, expiry_date, description } = req.body;

    const existing = await prisma.medicine.findUnique({ where: { medicine_id: id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Medicine not found.' });
    }

    const medicine = await prisma.medicine.update({
      where: { medicine_id: id },
      data: {
        ...(medicine_name && { medicine_name: medicine_name.trim() }),
        ...(category && { category: category.trim() }),
        ...(manufacturer && { manufacturer: manufacturer.trim() }),
        ...(unit_price !== undefined && { unit_price: Number(unit_price) }),
        ...(stock_quantity !== undefined && { stock_quantity: parseInt(stock_quantity, 10) }),
        ...(expiry_date && { expiry_date: new Date(expiry_date) }),
        ...(description !== undefined && { description: description ? description.trim() : null })
      }
    });

    return res.status(200).json({ success: true, message: 'Medicine inventory updated.', data: medicine });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to update medicine.' });
  }
}

export async function deleteMedicine(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const existing = await prisma.medicine.findUnique({ where: { medicine_id: id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Medicine not found.' });
    }

    await prisma.medicine.delete({ where: { medicine_id: id } });
    return res.status(200).json({ success: true, message: 'Medicine removed from inventory.' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to delete medicine.' });
  }
}
