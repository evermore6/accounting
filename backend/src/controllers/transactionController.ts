import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { accountingEngine } from '../services/accountingEngine';
import { auditLogMiddleware } from '../middleware/auditLog';

export const transactionController = {
  async createTransaction(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      const transactionData = {
        ...req.body,
        created_by: req.user.id
      };

      const transaction = await accountingEngine.createTransaction(transactionData);

      await auditLogMiddleware(req, 'create', 'transaction', transaction.id, null, transaction);

      res.status(201).json({
        message: 'Transaction created successfully',
        transaction
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  async getTransactions(req: AuthRequest, res: Response) {
    try {
      const filters: any = {
        status: req.query.status as string,
        type: req.query.type as string,
        startDate: req.query.start_date as string,
        endDate: req.query.end_date as string,
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 30
      };

      // If user is staff, only show their own transactions
      if (req.user?.role === 'staff') {
        filters.createdBy = req.user.id;
      }

      const transactions = await accountingEngine.getTransactions(filters);

      res.json({ transactions });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async getTransactionById(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      const result = await accountingEngine.getTransactions({ limit: 1 });
      const transaction = result.find(t => t.id === parseInt(id));

      if (!transaction) {
        res.status(404).json({ error: 'Transaction not found' });
        return;
      }

      // If user is staff, only allow viewing their own transactions
      if (req.user?.role === 'staff' && transaction.created_by !== req.user.id) {
        res.status(403).json({ error: 'Access denied' });
        return;
      }

      res.json({ transaction });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async approveTransaction(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      const { id } = req.params;

      const transaction = await accountingEngine.approveTransaction(
        parseInt(id),
        req.user.id
      );

      await auditLogMiddleware(req, 'approve', 'transaction', transaction.id);

      res.json({
        message: 'Transaction approved successfully',
        transaction
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  async rejectTransaction(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      const { id } = req.params;

      const transaction = await accountingEngine.rejectTransaction(
        parseInt(id),
        req.user.id
      );

      await auditLogMiddleware(req, 'reject', 'transaction', transaction.id);

      res.json({
        message: 'Transaction rejected successfully',
        transaction
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
};
