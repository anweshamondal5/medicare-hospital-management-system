import { Router } from 'express';
import { executeNamedQuery } from '../controllers/queryController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken as any);
router.get('/execute/:queryKey', executeNamedQuery);

export default router;
