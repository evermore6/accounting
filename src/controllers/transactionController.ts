// Transaction controller

import { Request, Response } from 'express';
import TransactionModel from '../models/Transaction';
import AccountingEngine from '../services/accountingEngine';
import { asyncHandler } from '../middleware/errorHandler';
import { SUCCESS_MESSAGES } from '../config/constants';
import { TransactionStatus } from '../types';

export class TransactionController {
  static createSalesTransaction = asyncHandler(async (req: Request, res: Response) => {
    const { date, description, amount, paymentMethod, costOfGoodsSold } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
        timestamp: new Date(),
      });
    }

    const journal = await AccountingEngine.processSalesTransaction({
      date: new Date(date),
      description,
      amount: parseFloat(amount),
      paymentMethod,
      costOfGoodsSold: costOfGoodsSold ? parseFloat(costOfGoodsSold) : undefined,
      createdBy: userId,
    });

    res.status(201).json({
      success: true,
      message: SUCCESS_MESSAGES.CREATE_SUCCESS,
      data: journal,
      timestamp: new Date(),
    });
  });

  static createPurchaseTransaction = asyncHandler(async (req: Request, res: Response) => {
    const { date, description, amount, paymentMethod } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
        timestamp: new Date(),
      });
    }

    const journal = await AccountingEngine.processPurchaseTransaction({
      date: new Date(date),
      description,
      amount: parseFloat(amount),
      paymentMethod,
      createdBy: userId,
    });

    res.status(201).json({
      success: true,
      message: SUCCESS_MESSAGES.CREATE_SUCCESS,
      data: journal,
      timestamp: new Date(),
    });
  });

  static createExpenseTransaction = asyncHandler(async (req: Request, res: Response) => {
    const { date, description, amount, expenseType, paymentMethod } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
        timestamp: new Date(),
      });
    }

    const journal = await AccountingEngine.processExpenseTransaction({
      date: new Date(date),
      description,
      amount: parseFloat(amount),
      expenseType,
      paymentMethod,
      createdBy: userId,
    });

    res.status(201).json({
      success: true,
      message: SUCCESS_MESSAGES.CREATE_SUCCESS,
      data: journal,
      timestamp: new Date(),
    });
  });

  static createCapitalTransaction = asyncHandler(async (req: Request, res: Response) => {
    const { date, description, amount, transactionType } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
        timestamp: new Date(),
      });
    }

    let journal;
    
    if (transactionType === 'injection') {
      journal = await AccountingEngine.processCapitalInjection(
        new Date(date),
        parseFloat(amount),
        description,
        userId
      );
    } else {
      journal = await AccountingEngine.processOwnerWithdrawal(
        new Date(date),
        parseFloat(amount),
        description,
        userId
      );
    }

    res.status(201).json({
      success: true,
      message: SUCCESS_MESSAGES.CREATE_SUCCESS,
      data: journal,
      timestamp: new Date(),
    });
  });

  static createCollectionTransaction = asyncHandler(async (req: Request, res: Response) => {
    const { date, description, amount } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
        timestamp: new Date(),
      });
    }

    const journal = await AccountingEngine.processARCollection(
      new Date(date),
      parseFloat(amount),
      description,
      userId
    );

    res.status(201).json({
      success: true,
      message: SUCCESS_MESSAGES.CREATE_SUCCESS,
      data: journal,
      timestamp: new Date(),
    });
  });

  static createPaymentTransaction = asyncHandler(async (req: Request, res: Response) => {
    const { date, description, amount } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
        timestamp: new Date(),
      });
    }

    const journal = await AccountingEngine.processAPPayment(
      new Date(date),
      parseFloat(amount),
      description,
      userId
    );

    res.status(201).json({
      success: true,
      message: SUCCESS_MESSAGES.CREATE_SUCCESS,
      data: journal,
      timestamp: new Date(),
    });
  });

  static getTransaction = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const transaction = await TransactionModel.findById(id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found',
        timestamp: new Date(),
      });
    }

    res.json({
      success: true,
      message: 'Transaction retrieved successfully',
      data: transaction,
      timestamp: new Date(),
    });
  });

  static listTransactions = asyncHandler(async (req: Request, res: Response) => {
    const { status, startDate, endDate, transactionType, page, limit } = req.query;

    const filters: any = {};
    
    if (status) filters.status = status as TransactionStatus;
    if (startDate) filters.startDate = new Date(startDate as string);
    if (endDate) filters.endDate = new Date(endDate as string);
    if (transactionType) filters.transactionType = transactionType as string;
    if (page) filters.page = parseInt(page as string, 10);
    if (limit) filters.limit = parseInt(limit as string, 10);

    const result = await TransactionModel.findAll(filters);

    res.json({
      success: true,
      message: 'Transactions retrieved successfully',
      data: result.transactions,
      pagination: {
        page: filters.page || 1,
        limit: filters.limit || 20,
        total: result.total,
        totalPages: Math.ceil(result.total / (filters.limit || 20)),
      },
      timestamp: new Date(),
    });
  });

  static deleteTransaction = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const deleted = await TransactionModel.delete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found or cannot be deleted',
        timestamp: new Date(),
      });
    }

    res.json({
      success: true,
      message: SUCCESS_MESSAGES.DELETE_SUCCESS,
      timestamp: new Date(),
    });
  });
}

export default TransactionController;
