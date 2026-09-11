import { Router } from 'express';
import { login, getMe, getDemoUsers } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.post('/login', login);
router.get('/me', authenticateToken as any, getMe as any);
router.get('/demo-users', getDemoUsers);

export default router;
