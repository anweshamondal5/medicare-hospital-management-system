import { Router } from 'express';
import { getMedicines, getMedicineById, createMedicine, updateMedicine, deleteMedicine } from '../controllers/medicineController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken as any);

router.get('/', getMedicines);
router.get('/:id', getMedicineById);
router.post('/', requireRole(['ADMIN']) as any, createMedicine);
router.put('/:id', requireRole(['ADMIN']) as any, updateMedicine);
router.delete('/:id', requireRole(['ADMIN']) as any, deleteMedicine);

export default router;
