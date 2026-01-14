// Auth routes

import { Router } from 'express';
import AuthController from '../controllers/authController';
import { validate, schemas } from '../middleware/validation';
import { authenticate } from '../middleware/auth';

const router = Router();

// Public routes
router.post('/login', validate(schemas.login), AuthController.login);
router.post('/refresh', AuthController.refreshToken);

// Protected routes
router.get('/me', authenticate, AuthController.getCurrentUser);
router.post('/logout', authenticate, AuthController.logout);
router.post('/change-password', authenticate, AuthController.changePassword);

export default router;
