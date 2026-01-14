import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { journalService } from '../services/journalService';
import { auditLogMiddleware } from '../middleware/auditLog';

export const journalController = {
  async getJournalEntries(req: AuthRequest, res: Response) {
    try {
      const filters = {
        transactionId: req.query.transaction_id ? parseInt(req.query.transaction_id as string) : undefined,
        accountId: req.query.account_id ? parseInt(req.query.account_id as string) : undefined,
        startDate: req.query.start_date as string,
        endDate: req.query.end_date as string,
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 30
      };

      const entries = await journalService.getJournalEntries(filters);

      res.json({ entries });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async getGeneralLedger(req: AuthRequest, res: Response) {
    try {
      const { accountId } = req.params;
      const startDate = req.query.start_date as string;
      const endDate = req.query.end_date as string;

      const ledger = await journalService.getGeneralLedger(
        parseInt(accountId),
        startDate,
        endDate
      );

      res.json(ledger);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async createManualJournal(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      const { entry_date, description, entries } = req.body;

      // Create a manual journal transaction first
      const pool = (await import('../config/database')).default;
      const txResult = await pool.query(
        `INSERT INTO transactions 
         (transaction_type, transaction_date, reference_number, description, total_amount, 
          status, requires_approval, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [
          'manual_journal',
          entry_date,
          `MJ-${Date.now()}`,
          description,
          entries.reduce((sum: number, e: any) => sum + (e.entry_type === 'debit' ? e.amount : 0), 0),
          'posted',
          false,
          req.user.id
        ]
      );

      const transaction = txResult.rows[0];

      await journalService.createJournalEntries(
        transaction.id,
        entry_date,
        entries,
        description
      );

      await auditLogMiddleware(req, 'create', 'journal', transaction.id);

      res.status(201).json({
        message: 'Manual journal created successfully',
        transaction
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
};
