import { Router } from 'express';
import { userController } from '../controllers/userController';
import { authenticate, authorize } from '../middleware/auth';
import { validateUser, validateIdParam } from '../utils/validators';
import { validate } from '../middleware/validation';

const router = Router();

router.use(authenticate);
router.use(authorize('owner', 'admin_accounting'));

router.get('/', userController.getUsers);
router.post('/', validateUser, validate, userController.createUser);
router.put('/:id', validateIdParam, validate, userController.updateUser);
router.delete('/:id', validateIdParam, validate, userController.deleteUser);

export default router;
