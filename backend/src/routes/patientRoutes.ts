import { Router } from 'express';
import { getPatients, getPatientById, createPatient, updatePatient, deletePatient } from '../controllers/patientController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken as any);

router.get('/', getPatients);
router.get('/:id', getPatientById);
router.post('/', requireRole(['ADMIN', 'RECEPTIONIST']) as any, createPatient);
router.put('/:id', requireRole(['ADMIN', 'RECEPTIONIST']) as any, updatePatient);
router.delete('/:id', requireRole(['ADMIN']) as any, deletePatient);

export default router;
