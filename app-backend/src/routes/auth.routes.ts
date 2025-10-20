import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = Router();
const authController = new AuthController();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', authenticateToken, authController.me);
router.post('/create-user', authenticateToken, requireAdmin, authController.createUser); 

export default router;