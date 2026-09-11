import { Router } from 'express';
import { getPrescriptions, getPrescriptionById, createPrescription } from '../controllers/prescriptionController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken as any);

router.get('/', getPrescriptions);
router.get('/:id', getPrescriptionById);
router.post('/', requireRole(['ADMIN', 'DOCTOR']) as any, createPrescription);

export default router;
