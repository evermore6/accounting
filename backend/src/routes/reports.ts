import { Router } from 'express';
import { reportController } from '../controllers/reportController';
import { authenticate, authorize } from '../middleware/auth';
import { validateDateRange } from '../utils/validators';
import { validate } from '../middleware/validation';

const router = Router();

router.use(authenticate);
router.use(authorize('owner', 'admin_accounting', 'viewer'));

router.get('/trial-balance', reportController.getTrialBalance);
router.get('/income-statement', validateDateRange, validate, reportController.getIncomeStatement);
router.get('/balance-sheet', reportController.getBalanceSheet);
router.get('/cash-flow', validateDateRange, validate, reportController.getCashFlow);

export default router;
