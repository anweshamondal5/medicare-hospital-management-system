import { Router } from 'express';
import { getAppointments, createAppointment, updateAppointment, deleteAppointment } from '../controllers/appointmentController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken as any);

router.get('/', getAppointments as any);
router.post('/', requireRole(['ADMIN', 'RECEPTIONIST']) as any, createAppointment);
router.put('/:id', requireRole(['ADMIN', 'RECEPTIONIST', 'DOCTOR']) as any, updateAppointment);
router.delete('/:id', requireRole(['ADMIN', 'RECEPTIONIST']) as any, deleteAppointment);

export default router;
