// Journal controller

import { Request, Response } from 'express';
import JournalService from '../services/journalService';
import { asyncHandler } from '../middleware/errorHandler';
import { SUCCESS_MESSAGES } from '../config/constants';
import { TransactionStatus } from '../types';

export class JournalController {
  static createJournal = asyncHandler(async (req: Request, res: Response) => {
    const { date, description, entries } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
        timestamp: new Date(),
      });
    }

    const journal = await JournalService.createJournal({
      date: new Date(date),
      description,
      entries,
      createdBy: userId,
    });

    res.status(201).json({
      success: true,
      message: SUCCESS_MESSAGES.JOURNAL_CREATED,
      data: journal,
      timestamp: new Date(),
    });
  });

  static getJournal = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const journal = await JournalService.getJournal(id);

    res.json({
      success: true,
      message: 'Journal retrieved successfully',
      data: journal,
      timestamp: new Date(),
    });
  });

  static listJournals = asyncHandler(async (req: Request, res: Response) => {
    const { status, startDate, endDate, accountCode, page, limit } = req.query;

    const filters: any = {};
    
    if (status) filters.status = status as TransactionStatus;
    if (startDate) filters.startDate = new Date(startDate as string);
    if (endDate) filters.endDate = new Date(endDate as string);
    if (accountCode) filters.accountCode = accountCode as string;
    if (page) filters.page = parseInt(page as string, 10);
    if (limit) filters.limit = parseInt(limit as string, 10);

    const result = await JournalService.listJournals(filters);

    res.json({
      success: true,
      message: 'Journals retrieved successfully',
      data: result.journals,
      pagination: {
        page: result.page,
        limit: filters.limit || 20,
        total: result.total,
        totalPages: result.totalPages,
      },
      timestamp: new Date(),
    });
  });

  static postJournal = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const journal = await JournalService.postJournal(id);

    res.json({
      success: true,
      message: SUCCESS_MESSAGES.TRANSACTION_POSTED,
      data: journal,
      timestamp: new Date(),
    });
  });

  static approveJournal = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const journal = await JournalService.approveJournal(id);

    res.json({
      success: true,
      message: 'Journal approved successfully',
      data: journal,
      timestamp: new Date(),
    });
  });

  static rejectJournal = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const journal = await JournalService.rejectJournal(id);

    res.json({
      success: true,
      message: 'Journal rejected successfully',
      data: journal,
      timestamp: new Date(),
    });
  });

  static deleteJournal = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const deleted = await JournalService.deleteJournal(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Journal not found or cannot be deleted',
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

export default JournalController;
