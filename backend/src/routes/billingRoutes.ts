import { Router } from 'express';
import { getBills, getBillById, createBill, updateBill } from '../controllers/billingController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken as any);

router.get('/', getBills);
router.get('/:id', getBillById);
router.post('/', requireRole(['ADMIN', 'RECEPTIONIST']) as any, createBill);
router.put('/:id', requireRole(['ADMIN', 'RECEPTIONIST']) as any, updateBill);

export default router;
