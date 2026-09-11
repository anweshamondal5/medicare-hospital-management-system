import { Router } from 'express';
import { getDepartments, createDepartment } from '../controllers/departmentController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken as any);

router.get('/', getDepartments);
router.post('/', requireRole(['ADMIN']) as any, createDepartment);

export default router;
