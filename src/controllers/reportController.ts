// Report controller

import { Request, Response } from 'express';
import ReportService from '../services/reportService';
import { asyncHandler } from '../middleware/errorHandler';

export class ReportController {
  static getIncomeStatement = asyncHandler(async (req: Request, res: Response) => {
    const { startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate as string) : new Date(new Date().getFullYear(), 0, 1);
    const end = endDate ? new Date(endDate as string) : new Date();

    const report = await ReportService.generateIncomeStatement(start, end);

    res.json({
      success: true,
      message: 'Income statement generated successfully',
      data: report,
      timestamp: new Date(),
    });
  });

  static getBalanceSheet = asyncHandler(async (req: Request, res: Response) => {
    const { asOf } = req.query;

    const date = asOf ? new Date(asOf as string) : new Date();

    const report = await ReportService.generateBalanceSheet(date);

    res.json({
      success: true,
      message: 'Balance sheet generated successfully',
      data: report,
      timestamp: new Date(),
    });
  });

  static getCashFlow = asyncHandler(async (req: Request, res: Response) => {
    const { startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate as string) : new Date(new Date().getFullYear(), 0, 1);
    const end = endDate ? new Date(endDate as string) : new Date();

    const report = await ReportService.generateCashFlowStatement(start, end);

    res.json({
      success: true,
      message: 'Cash flow statement generated successfully',
      data: report,
      timestamp: new Date(),
    });
  });

  static getTrialBalance = asyncHandler(async (req: Request, res: Response) => {
    const { asOf } = req.query;

    const date = asOf ? new Date(asOf as string) : undefined;

    const report = await ReportService.generateTrialBalance(date);

    res.json({
      success: true,
      message: 'Trial balance generated successfully',
      data: report,
      timestamp: new Date(),
    });
  });

  static getDashboardSummary = asyncHandler(async (req: Request, res: Response) => {
    // Get current date
    const today = new Date();
    const startOfYear = new Date(today.getFullYear(), 0, 1);

    // Generate all reports
    const [balanceSheet, incomeStatement, cashFlow, trialBalance] = await Promise.all([
      ReportService.generateBalanceSheet(today),
      ReportService.generateIncomeStatement(startOfYear, today),
      ReportService.generateCashFlowStatement(startOfYear, today),
      ReportService.generateTrialBalance(),
    ]);

    const summary = {
      totalAssets: balanceSheet.assets.totalAssets,
      totalLiabilities: balanceSheet.liabilities.totalLiabilities,
      totalEquity: balanceSheet.equity.totalEquity,
      totalRevenue: incomeStatement.revenue.totalRevenue,
      totalExpenses: incomeStatement.expenses.totalExpenses,
      netIncome: incomeStatement.netIncome,
      cashBalance: balanceSheet.assets.cash,
      netCashFlow: cashFlow.netCashFlow,
      isBalanced: trialBalance.isBalanced,
      accountingEquationValid: 
        Math.abs(balanceSheet.assets.totalAssets - 
        (balanceSheet.liabilities.totalLiabilities + balanceSheet.equity.totalEquity)) < 0.01,
    };

    res.json({
      success: true,
      message: 'Dashboard summary generated successfully',
      data: summary,
      timestamp: new Date(),
    });
  });
}

export default ReportController;
