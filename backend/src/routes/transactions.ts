import { Router } from 'express';
import { transactionController } from '../controllers/transactionController';
import { authenticate, authorize } from '../middleware/auth';
import { validateTransaction, validateIdParam } from '../utils/validators';
import { validate } from '../middleware/validation';

const router = Router();

router.use(authenticate);

router.get('/', transactionController.getTransactions);
router.post('/', validateTransaction, validate, transactionController.createTransaction);
router.get('/:id', validateIdParam, validate, transactionController.getTransactionById);
router.put(
  '/:id/approve',
  validateIdParam,
  validate,
  authorize('owner', 'admin_accounting'),
  transactionController.approveTransaction
);
router.put(
  '/:id/reject',
  validateIdParam,
  validate,
  authorize('owner', 'admin_accounting'),
  transactionController.rejectTransaction
);

export default router;
