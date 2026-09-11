import { Router } from 'express';
import { getLabTests, createLabTest, getPatientLabTests, orderPatientLabTest, updatePatientLabTest } from '../controllers/labTestController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken as any);

router.get('/', getLabTests);
router.post('/', requireRole(['ADMIN']) as any, createLabTest);
router.get('/orders', getPatientLabTests);
router.post('/orders', requireRole(['ADMIN', 'DOCTOR']) as any, orderPatientLabTest);
router.put('/orders/:id', requireRole(['ADMIN', 'DOCTOR']) as any, updatePatientLabTest);

export default router;
