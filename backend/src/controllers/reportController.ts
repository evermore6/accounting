import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { reportService } from '../services/reportService';

export const reportController = {
  async getTrialBalance(req: AuthRequest, res: Response) {
    try {
      const asOfDate = req.query.as_of_date as string;

      const report = await reportService.getTrialBalance(asOfDate);

      res.json(report);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async getIncomeStatement(req: AuthRequest, res: Response) {
    try {
      const startDate = req.query.start_date as string;
      const endDate = req.query.end_date as string;

      if (!startDate || !endDate) {
        res.status(400).json({ error: 'start_date and end_date are required' });
        return;
      }

      const report = await reportService.getIncomeStatement(startDate, endDate);

      res.json(report);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async getBalanceSheet(req: AuthRequest, res: Response) {
    try {
      const asOfDate = req.query.as_of_date as string;

      const report = await reportService.getBalanceSheet(asOfDate);

      res.json(report);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async getCashFlow(req: AuthRequest, res: Response) {
    try {
      const startDate = req.query.start_date as string;
      const endDate = req.query.end_date as string;

      if (!startDate || !endDate) {
        res.status(400).json({ error: 'start_date and end_date are required' });
        return;
      }

      const report = await reportService.getCashFlowStatement(startDate, endDate);

      res.json(report);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
};
