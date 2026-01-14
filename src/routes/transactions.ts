// Transaction routes

import { Router } from 'express';
import TransactionController from '../controllers/transactionController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../types';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Create transactions
router.post('/sales', TransactionController.createSalesTransaction);
router.post('/purchase', TransactionController.createPurchaseTransaction);
router.post('/expense', TransactionController.createExpenseTransaction);
router.post('/capital', TransactionController.createCapitalTransaction);
router.post('/collection', TransactionController.createCollectionTransaction);
router.post('/payment', TransactionController.createPaymentTransaction);

// Get transactions
router.get('/', TransactionController.listTransactions);
router.get('/:id', TransactionController.getTransaction);

// Delete transaction (admin/accountant only)
router.delete(
  '/:id',
  authorize(UserRole.ADMIN, UserRole.ACCOUNTANT),
  TransactionController.deleteTransaction
);

export default router;
