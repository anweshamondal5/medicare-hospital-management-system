import { Router } from 'express';
import { getDoctors, getDoctorById, createDoctor, updateDoctor, deleteDoctor } from '../controllers/doctorController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken as any);

router.get('/', getDoctors);
router.get('/:id', getDoctorById);
router.post('/', requireRole(['ADMIN']) as any, createDoctor);
router.put('/:id', requireRole(['ADMIN', 'DOCTOR']) as any, updateDoctor);
router.delete('/:id', requireRole(['ADMIN']) as any, deleteDoctor);

export default router;
