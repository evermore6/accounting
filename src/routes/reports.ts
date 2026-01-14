// Report routes

import { Router } from 'express';
import ReportController from '../controllers/reportController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Financial reports
router.get('/income-statement', ReportController.getIncomeStatement);
router.get('/balance-sheet', ReportController.getBalanceSheet);
router.get('/cash-flow', ReportController.getCashFlow);
router.get('/trial-balance', ReportController.getTrialBalance);

// Dashboard summary
router.get('/dashboard', ReportController.getDashboardSummary);

export default router;
