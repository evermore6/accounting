// User routes

import { Router } from 'express';
import UserController from '../controllers/userController';
import { authenticate, authorize } from '../middleware/auth';
import { validate, schemas } from '../middleware/validation';
import { UserRole } from '../types';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Create user (admin only)
router.post(
  '/',
  authorize(UserRole.ADMIN),
  validate(schemas.createUser),
  UserController.createUser
);

// Get users
router.get('/', UserController.listUsers);
router.get('/:id', UserController.getUser);

// Update user (admin only)
router.put(
  '/:id',
  authorize(UserRole.ADMIN),
  validate(schemas.updateUser),
  UserController.updateUser
);

// Update user password (admin only)
router.patch(
  '/:id/password',
  authorize(UserRole.ADMIN),
  UserController.updateUserPassword
);

// Delete user (admin only)
router.delete(
  '/:id',
  authorize(UserRole.ADMIN),
  UserController.deleteUser
);

export default router;
