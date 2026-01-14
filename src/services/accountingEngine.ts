// Accounting Engine - Core double-entry logic

import { getClient } from '../config/database';
import AccountModel from '../models/Account';
import JournalEntryModel, { CreateJournalData, JournalEntryLine } from '../models/JournalEntry';
import { TransactionStatus, AccountType } from '../types';
import { ACCOUNT_CODES } from '../config/constants';
import { AppError } from '../middleware/errorHandler';

export interface SalesTransactionData {
  date: Date;
  description: string;
  amount: number;
  paymentMethod: 'cash' | 'credit';
  createdBy: string;
  costOfGoodsSold?: number;
}

export interface PurchaseTransactionData {
  date: Date;
  description: string;
  amount: number;
  paymentMethod: 'cash' | 'credit';
  createdBy: string;
}

export interface ExpenseTransactionData {
  date: Date;
  description: string;
  amount: number;
  expenseType: 'salary' | 'utilities' | 'rent' | 'depreciation' | 'raw_material' | 'other';
  paymentMethod: 'cash' | 'credit';
  createdBy: string;
}

export class AccountingEngine {
  // Auto-generate journal entry for sales transaction
  static async processSalesTransaction(data: SalesTransactionData): Promise<any> {
    const entries: JournalEntryLine[] = [];

    // Debit: Cash or Accounts Receivable
    const debitAccount = data.paymentMethod === 'cash' ? ACCOUNT_CODES.CASH : ACCOUNT_CODES.ACCOUNTS_RECEIVABLE;
    entries.push({
      accountCode: debitAccount,
      debit: data.amount,
      credit: 0,
    });

    // Credit: Sales Revenue
    entries.push({
      accountCode: ACCOUNT_CODES.SALES_REVENUE,
      debit: 0,
      credit: data.amount,
    });

    // If COGS provided, record cost
    if (data.costOfGoodsSold && data.costOfGoodsSold > 0) {
      // Debit: Cost of Goods Sold
      entries.push({
        accountCode: ACCOUNT_CODES.COST_OF_GOODS_SOLD,
        debit: data.costOfGoodsSold,
        credit: 0,
      });

      // Credit: Inventory
      entries.push({
        accountCode: ACCOUNT_CODES.INVENTORY,
        debit: 0,
        credit: data.costOfGoodsSold,
      });
    }

    const journalData: CreateJournalData = {
      date: data.date,
      description: `Sales: ${data.description}`,
      entries,
      createdBy: data.createdBy,
      referenceType: 'sales',
    };

    return await JournalEntryModel.create(journalData);
  }

  // Auto-generate journal entry for purchase transaction
  static async processPurchaseTransaction(data: PurchaseTransactionData): Promise<any> {
    const entries: JournalEntryLine[] = [];

    // Debit: Inventory
    entries.push({
      accountCode: ACCOUNT_CODES.INVENTORY,
      debit: data.amount,
      credit: 0,
    });

    // Credit: Cash or Accounts Payable
    const creditAccount = data.paymentMethod === 'cash' ? ACCOUNT_CODES.CASH : ACCOUNT_CODES.ACCOUNTS_PAYABLE;
    entries.push({
      accountCode: creditAccount,
      debit: 0,
      credit: data.amount,
    });

    const journalData: CreateJournalData = {
      date: data.date,
      description: `Purchase: ${data.description}`,
      entries,
      createdBy: data.createdBy,
      referenceType: 'purchase',
    };

    return await JournalEntryModel.create(journalData);
  }

  // Auto-generate journal entry for expense transaction
  static async processExpenseTransaction(data: ExpenseTransactionData): Promise<any> {
    const entries: JournalEntryLine[] = [];

    // Map expense type to account code
    const expenseAccountMap: Record<string, string> = {
      salary: ACCOUNT_CODES.SALARY_EXPENSE,
      utilities: ACCOUNT_CODES.UTILITIES_EXPENSE,
      rent: ACCOUNT_CODES.RENT_EXPENSE,
      depreciation: ACCOUNT_CODES.DEPRECIATION_EXPENSE,
      raw_material: ACCOUNT_CODES.RAW_MATERIAL_EXPENSE,
      other: ACCOUNT_CODES.COST_OF_GOODS_SOLD, // Default to COGS
    };

    const expenseAccount = expenseAccountMap[data.expenseType] || ACCOUNT_CODES.COST_OF_GOODS_SOLD;

    // Debit: Expense Account
    entries.push({
      accountCode: expenseAccount,
      debit: data.amount,
      credit: 0,
    });

    // Credit: Cash or Accounts Payable
    const creditAccount = data.paymentMethod === 'cash' ? ACCOUNT_CODES.CASH : ACCOUNT_CODES.ACCOUNTS_PAYABLE;
    entries.push({
      accountCode: creditAccount,
      debit: 0,
      credit: data.amount,
    });

    const journalData: CreateJournalData = {
      date: data.date,
      description: `Expense: ${data.description}`,
      entries,
      createdBy: data.createdBy,
      referenceType: 'expense',
    };

    return await JournalEntryModel.create(journalData);
  }

  // Owner capital injection
  static async processCapitalInjection(
    date: Date,
    amount: number,
    description: string,
    createdBy: string
  ): Promise<any> {
    const entries: JournalEntryLine[] = [
      {
        accountCode: ACCOUNT_CODES.CASH,
        debit: amount,
        credit: 0,
      },
      {
        accountCode: ACCOUNT_CODES.OWNER_CAPITAL,
        debit: 0,
        credit: amount,
      },
    ];

    const journalData: CreateJournalData = {
      date,
      description: `Owner Capital: ${description}`,
      entries,
      createdBy,
      referenceType: 'capital',
    };

    return await JournalEntryModel.create(journalData);
  }

  // Owner withdrawal
  static async processOwnerWithdrawal(
    date: Date,
    amount: number,
    description: string,
    createdBy: string
  ): Promise<any> {
    const entries: JournalEntryLine[] = [
      {
        accountCode: ACCOUNT_CODES.OWNER_CAPITAL,
        debit: amount,
        credit: 0,
      },
      {
        accountCode: ACCOUNT_CODES.CASH,
        debit: 0,
        credit: amount,
      },
    ];

    const journalData: CreateJournalData = {
      date,
      description: `Owner Withdrawal: ${description}`,
      entries,
      createdBy,
      referenceType: 'withdrawal',
    };

    return await JournalEntryModel.create(journalData);
  }

  // Collect accounts receivable
  static async processARCollection(
    date: Date,
    amount: number,
    description: string,
    createdBy: string
  ): Promise<any> {
    const entries: JournalEntryLine[] = [
      {
        accountCode: ACCOUNT_CODES.CASH,
        debit: amount,
        credit: 0,
      },
      {
        accountCode: ACCOUNT_CODES.ACCOUNTS_RECEIVABLE,
        debit: 0,
        credit: amount,
      },
    ];

    const journalData: CreateJournalData = {
      date,
      description: `AR Collection: ${description}`,
      entries,
      createdBy,
      referenceType: 'ar_collection',
    };

    return await JournalEntryModel.create(journalData);
  }

  // Pay accounts payable
  static async processAPPayment(
    date: Date,
    amount: number,
    description: string,
    createdBy: string
  ): Promise<any> {
    const entries: JournalEntryLine[] = [
      {
        accountCode: ACCOUNT_CODES.ACCOUNTS_PAYABLE,
        debit: amount,
        credit: 0,
      },
      {
        accountCode: ACCOUNT_CODES.CASH,
        debit: 0,
        credit: amount,
      },
    ];

    const journalData: CreateJournalData = {
      date,
      description: `AP Payment: ${description}`,
      entries,
      createdBy,
      referenceType: 'ap_payment',
    };

    return await JournalEntryModel.create(journalData);
  }

  // Validate double-entry
  static validateDoubleEntry(entries: JournalEntryLine[]): boolean {
    const totalDebit = entries.reduce((sum, entry) => sum + entry.debit, 0);
    const totalCredit = entries.reduce((sum, entry) => sum + entry.credit, 0);
    
    return Math.abs(totalDebit - totalCredit) < 0.01;
  }
}

export default AccountingEngine;
