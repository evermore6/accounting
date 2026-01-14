import { Router } from 'express';
import { authController } from '../controllers/authController';
import { validateLogin } from '../utils/validators';
import { validate } from '../middleware/validation';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/login', validateLogin, validate, authController.login);
router.post('/register', authController.register);
router.post('/logout', authenticate, authController.logout);
router.post('/change-password', authenticate, authController.changePassword);
router.get('/me', authenticate, authController.me);

export default router;
