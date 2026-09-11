import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../db/prisma.js';
import { AuthRequest } from '../middleware/auth.js';

const JWT_SECRET = process.env.JWT_SECRET || 'medicare_jwt_secret_change_in_production_key_2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: {
        doctor: {
          include: { department: true }
        }
      }
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. User not found.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. Incorrect password.' });
    }

    const tokenPayload = {
      user_id: user.user_id,
      email: user.email,
      name: user.name,
      role: user.role,
      doctor_id: user.doctor_id
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN as any });

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role,
        doctor: user.doctor
      }
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Login failed.' });
  }
}

export async function getMe(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated.' });
    }

    const user = await prisma.user.findUnique({
      where: { user_id: req.user.user_id },
      include: {
        doctor: {
          include: { department: true }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User profile not found.' });
    }

    const { password_hash, ...userProfile } = user;
    return res.status(200).json({ success: true, user: userProfile });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function getDemoUsers(req: Request, res: Response) {
  return res.status(200).json({
    success: true,
    demoAccounts: [
      { role: 'ADMIN', email: 'admin@medicare.demo', password: 'Admin@123', label: 'Chief Medical Administrator' },
      { role: 'DOCTOR', email: 'doctor@medicare.demo', password: 'Doctor@123', label: 'Dr. Sarah Jenkins (Cardiology)' },
      { role: 'RECEPTIONIST', email: 'reception@medicare.demo', password: 'Reception@123', label: 'Front Desk Coordinator' }
    ]
  });
}
