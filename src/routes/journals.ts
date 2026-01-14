// Journal routes

import { Router } from 'express';
import JournalController from '../controllers/journalController';
import { authenticate, authorize } from '../middleware/auth';
import { validate, schemas } from '../middleware/validation';
import { UserRole } from '../types';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Create journal entry
router.post(
  '/',
  authorize(UserRole.ADMIN, UserRole.ACCOUNTANT),
  validate(schemas.createJournal),
  JournalController.createJournal
);

// Get journals
router.get('/', JournalController.listJournals);
router.get('/:id', JournalController.getJournal);

// Post journal (accountant or admin)
router.post(
  '/:id/post',
  authorize(UserRole.ADMIN, UserRole.ACCOUNTANT),
  JournalController.postJournal
);

// Approve journal (admin only)
router.post(
  '/:id/approve',
  authorize(UserRole.ADMIN),
  JournalController.approveJournal
);

// Reject journal (admin only)
router.post(
  '/:id/reject',
  authorize(UserRole.ADMIN),
  JournalController.rejectJournal
);

// Delete journal (admin only)
router.delete(
  '/:id',
  authorize(UserRole.ADMIN),
  JournalController.deleteJournal
);

export default router;
