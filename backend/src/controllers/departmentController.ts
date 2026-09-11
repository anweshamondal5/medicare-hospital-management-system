import { Request, Response } from 'express';
import { prisma } from '../db/prisma.js';

export async function getDepartments(req: Request, res: Response) {
  try {
    const departments = await prisma.department.findMany({
      include: {
        _count: {
          select: { doctors: true }
        }
      },
      orderBy: { department_name: 'asc' }
    });

    return res.status(200).json({ success: true, data: departments });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to fetch departments.' });
  }
}

export async function createDepartment(req: Request, res: Response) {
  try {
    const { department_name, description, location } = req.body;

    const existing = await prisma.department.findUnique({ where: { department_name: department_name.trim() } });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Department with this name already exists.' });
    }

    const dept = await prisma.department.create({
      data: {
        department_name: department_name.trim(),
        description: description?.trim(),
        location: location.trim()
      }
    });

    return res.status(201).json({ success: true, message: 'Department created successfully.', data: dept });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to create department.' });
  }
}
