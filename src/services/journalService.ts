// Journal Service - Journal entry operations

import JournalEntryModel, { CreateJournalData } from '../models/JournalEntry';
import { TransactionStatus } from '../types';
import { AppError } from '../middleware/errorHandler';
import { ERROR_MESSAGES } from '../config/constants';
import AccountingEngine from './accountingEngine';

export class JournalService {
  static async createJournal(data: CreateJournalData): Promise<any> {
    // Validate double-entry
    if (!AccountingEngine.validateDoubleEntry(data.entries)) {
      throw new AppError(ERROR_MESSAGES.DEBIT_CREDIT_MISMATCH, 400);
    }

    return await JournalEntryModel.create(data);
  }

  static async getJournal(id: string): Promise<any> {
    const journal = await JournalEntryModel.findById(id);
    
    if (!journal) {
      throw new AppError(ERROR_MESSAGES.RECORD_NOT_FOUND, 404);
    }

    return journal;
  }

  static async listJournals(filters?: {
    status?: TransactionStatus;
    startDate?: Date;
    endDate?: Date;
    accountCode?: string;
    page?: number;
    limit?: number;
  }): Promise<{ journals: any[]; total: number; page: number; totalPages: number }> {
    const result = await JournalEntryModel.findAll(filters);
    const limit = filters?.limit || 20;
    const page = filters?.page || 1;
    const totalPages = Math.ceil(result.total / limit);

    return {
      journals: result.journals,
      total: result.total,
      page,
      totalPages,
    };
  }

  static async postJournal(id: string): Promise<any> {
    const journal = await JournalEntryModel.findById(id);
    
    if (!journal) {
      throw new AppError(ERROR_MESSAGES.RECORD_NOT_FOUND, 404);
    }

    if (journal.status === TransactionStatus.POSTED) {
      throw new AppError(ERROR_MESSAGES.TRANSACTION_ALREADY_POSTED, 400);
    }

    return await JournalEntryModel.post(id);
  }

  static async approveJournal(id: string): Promise<any> {
    const journal = await JournalEntryModel.findById(id);
    
    if (!journal) {
      throw new AppError(ERROR_MESSAGES.RECORD_NOT_FOUND, 404);
    }

    if (journal.status === TransactionStatus.POSTED) {
      throw new AppError('Cannot approve a posted journal', 400);
    }

    return await JournalEntryModel.updateStatus(id, TransactionStatus.APPROVED);
  }

  static async rejectJournal(id: string): Promise<any> {
    const journal = await JournalEntryModel.findById(id);
    
    if (!journal) {
      throw new AppError(ERROR_MESSAGES.RECORD_NOT_FOUND, 404);
    }

    if (journal.status === TransactionStatus.POSTED) {
      throw new AppError('Cannot reject a posted journal', 400);
    }

    return await JournalEntryModel.updateStatus(id, TransactionStatus.REJECTED);
  }

  static async deleteJournal(id: string): Promise<boolean> {
    const journal = await JournalEntryModel.findById(id);
    
    if (!journal) {
      throw new AppError(ERROR_MESSAGES.RECORD_NOT_FOUND, 404);
    }

    if (journal.status === TransactionStatus.POSTED) {
      throw new AppError('Cannot delete a posted journal', 400);
    }

    return await JournalEntryModel.delete(id);
  }
}

export default JournalService;
