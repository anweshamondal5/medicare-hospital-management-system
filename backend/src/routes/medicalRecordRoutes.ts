import { Router } from 'express';
import { getMedicalRecords, createMedicalRecord } from '../controllers/medicalRecordController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken as any);

router.get('/', getMedicalRecords);
router.post('/', requireRole(['ADMIN', 'DOCTOR']) as any, createMedicalRecord);

export default router;
