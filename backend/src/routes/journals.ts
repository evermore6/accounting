import { Router } from 'express';
import { journalController } from '../controllers/journalController';
import { authenticate, authorize } from '../middleware/auth';
import { validateJournalEntry, validateIdParam } from '../utils/validators';
import { validate } from '../middleware/validation';

const router = Router();

router.use(authenticate);

router.get('/', journalController.getJournalEntries);
router.get('/ledger/:accountId', validateIdParam, validate, journalController.getGeneralLedger);
router.post(
  '/manual',
  authorize('owner', 'admin_accounting'),
  validateJournalEntry,
  validate,
  journalController.createManualJournal
);

export default router;
