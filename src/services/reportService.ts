// Report Service - Generate financial reports

import { executeQuery } from '../config/database';
import AccountModel from '../models/Account';
import JournalEntryModel from '../models/JournalEntry';
import { AccountType } from '../types';
import { roundAmount } from '../utils/calculations';

export interface IncomeStatementReport {
  period: {
    startDate: Date;
    endDate: Date;
  };
  revenue: {
    salesRevenue: number;
    totalRevenue: number;
  };
  expenses: {
    costOfGoodsSold: number;
    salaryExpense: number;
    utilitiesExpense: number;
    rentExpense: number;
    depreciationExpense: number;
    rawMaterialExpense: number;
    totalExpenses: number;
  };
  grossProfit: number;
  netIncome: number;
  generatedAt: Date;
}

export interface BalanceSheetReport {
  asOf: Date;
  assets: {
    cash: number;
    bank: number;
    accountsReceivable: number;
    inventory: number;
    equipment: number;
    accumulatedDepreciation: number;
    totalAssets: number;
  };
  liabilities: {
    accountsPayable: number;
    wagesPayable: number;
    totalLiabilities: number;
  };
  equity: {
    ownerCapital: number;
    retainedEarnings: number;
    totalEquity: number;
  };
  generatedAt: Date;
}

export interface CashFlowReport {
  period: {
    startDate: Date;
    endDate: Date;
  };
  operating: {
    cashFromSales: number;
    cashPaidForExpenses: number;
    netCashFromOperating: number;
  };
  investing: {
    purchaseOfEquipment: number;
    netCashFromInvesting: number;
  };
  financing: {
    ownerCapitalInjection: number;
    ownerWithdrawals: number;
    netCashFromFinancing: number;
  };
  netCashFlow: number;
  beginningCashBalance: number;
  endingCashBalance: number;
  generatedAt: Date;
}

export interface TrialBalanceReport {
  asOf: Date;
  accounts: Array<{
    accountCode: string;
    accountName: string;
    accountType: string;
    debit: number;
    credit: number;
  }>;
  totalDebit: number;
  totalCredit: number;
  isBalanced: boolean;
  generatedAt: Date;
}

export class ReportService {
  // Generate Income Statement (Profit & Loss)
  static async generateIncomeStatement(
    startDate: Date,
    endDate: Date
  ): Promise<IncomeStatementReport> {
    // Get all revenue accounts
    const revenueAccounts = await AccountModel.findAll({
      accountType: AccountType.REVENUE,
    });

    const salesRevenue = revenueAccounts.find(a => a.accountCode === '4001')?.balance || 0;
    const totalRevenue = revenueAccounts.reduce((sum, acc) => sum + acc.balance, 0);

    // Get all expense accounts
    const expenseAccounts = await AccountModel.findAll({
      accountType: AccountType.EXPENSE,
    });

    const expenses = {
      costOfGoodsSold: expenseAccounts.find(a => a.accountCode === '5001')?.balance || 0,
      rawMaterialExpense: expenseAccounts.find(a => a.accountCode === '5002')?.balance || 0,
      salaryExpense: expenseAccounts.find(a => a.accountCode === '5003')?.balance || 0,
      utilitiesExpense: expenseAccounts.find(a => a.accountCode === '5004')?.balance || 0,
      rentExpense: expenseAccounts.find(a => a.accountCode === '5005')?.balance || 0,
      depreciationExpense: expenseAccounts.find(a => a.accountCode === '5006')?.balance || 0,
      totalExpenses: expenseAccounts.reduce((sum, acc) => sum + acc.balance, 0),
    };

    const grossProfit = roundAmount(totalRevenue - expenses.costOfGoodsSold);
    const netIncome = roundAmount(totalRevenue - expenses.totalExpenses);

    return {
      period: {
        startDate,
        endDate,
      },
      revenue: {
        salesRevenue: roundAmount(salesRevenue),
        totalRevenue: roundAmount(totalRevenue),
      },
      expenses: {
        costOfGoodsSold: roundAmount(expenses.costOfGoodsSold),
        salaryExpense: roundAmount(expenses.salaryExpense),
        utilitiesExpense: roundAmount(expenses.utilitiesExpense),
        rentExpense: roundAmount(expenses.rentExpense),
        depreciationExpense: roundAmount(expenses.depreciationExpense),
        rawMaterialExpense: roundAmount(expenses.rawMaterialExpense),
        totalExpenses: roundAmount(expenses.totalExpenses),
      },
      grossProfit,
      netIncome,
      generatedAt: new Date(),
    };
  }

  // Generate Balance Sheet
  static async generateBalanceSheet(asOf: Date): Promise<BalanceSheetReport> {
    // Get all accounts
    const assetAccounts = await AccountModel.findAll({
      accountType: AccountType.ASSET,
    });

    const liabilityAccounts = await AccountModel.findAll({
      accountType: AccountType.LIABILITY,
    });

    const equityAccounts = await AccountModel.findAll({
      accountType: AccountType.EQUITY,
    });

    const assets = {
      cash: assetAccounts.find(a => a.accountCode === '1001')?.balance || 0,
      bank: assetAccounts.find(a => a.accountCode === '1002')?.balance || 0,
      accountsReceivable: assetAccounts.find(a => a.accountCode === '1003')?.balance || 0,
      inventory: assetAccounts.find(a => a.accountCode === '1004')?.balance || 0,
      equipment: assetAccounts.find(a => a.accountCode === '1005')?.balance || 0,
      accumulatedDepreciation: assetAccounts.find(a => a.accountCode === '1006')?.balance || 0,
      totalAssets: assetAccounts.reduce((sum, acc) => sum + acc.balance, 0),
    };

    const liabilities = {
      accountsPayable: liabilityAccounts.find(a => a.accountCode === '2001')?.balance || 0,
      wagesPayable: liabilityAccounts.find(a => a.accountCode === '2002')?.balance || 0,
      totalLiabilities: liabilityAccounts.reduce((sum, acc) => sum + acc.balance, 0),
    };

    const equity = {
      ownerCapital: equityAccounts.find(a => a.accountCode === '3001')?.balance || 0,
      retainedEarnings: equityAccounts.find(a => a.accountCode === '3002')?.balance || 0,
      totalEquity: equityAccounts.reduce((sum, acc) => sum + acc.balance, 0),
    };

    return {
      asOf,
      assets: {
        cash: roundAmount(assets.cash),
        bank: roundAmount(assets.bank),
        accountsReceivable: roundAmount(assets.accountsReceivable),
        inventory: roundAmount(assets.inventory),
        equipment: roundAmount(assets.equipment),
        accumulatedDepreciation: roundAmount(assets.accumulatedDepreciation),
        totalAssets: roundAmount(assets.totalAssets),
      },
      liabilities: {
        accountsPayable: roundAmount(liabilities.accountsPayable),
        wagesPayable: roundAmount(liabilities.wagesPayable),
        totalLiabilities: roundAmount(liabilities.totalLiabilities),
      },
      equity: {
        ownerCapital: roundAmount(equity.ownerCapital),
        retainedEarnings: roundAmount(equity.retainedEarnings),
        totalEquity: roundAmount(equity.totalEquity),
      },
      generatedAt: new Date(),
    };
  }

  // Generate Trial Balance
  static async generateTrialBalance(asOf?: Date): Promise<TrialBalanceReport> {
    const accounts = await JournalEntryModel.getTrialBalance(asOf);

    const totalDebit = accounts.reduce((sum, acc) => sum + acc.debit, 0);
    const totalCredit = accounts.reduce((sum, acc) => sum + acc.credit, 0);
    const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;

    return {
      asOf: asOf || new Date(),
      accounts: accounts.map(acc => ({
        accountCode: acc.accountCode,
        accountName: acc.accountName,
        accountType: acc.accountType,
        debit: roundAmount(acc.debit),
        credit: roundAmount(acc.credit),
      })),
      totalDebit: roundAmount(totalDebit),
      totalCredit: roundAmount(totalCredit),
      isBalanced,
      generatedAt: new Date(),
    };
  }

  // Generate Cash Flow Statement (Simplified)
  static async generateCashFlowStatement(
    startDate: Date,
    endDate: Date
  ): Promise<CashFlowReport> {
    // This is a simplified cash flow statement
    // In production, you'd track each transaction's cash impact

    const query = `
      SELECT 
        jl.account_code,
        SUM(jl.debit_amount) as total_debit,
        SUM(jl.credit_amount) as total_credit
      FROM journal_entry_lines jl
      INNER JOIN journal_entries je ON jl.journal_entry_id = je.id
      WHERE je.date BETWEEN $1 AND $2
        AND je.status = 'posted'
        AND je.deleted_at IS NULL
      GROUP BY jl.account_code
    `;

    const result = await executeQuery(query, [startDate.toISOString(), endDate.toISOString()]);
    
    let cashFromSales = 0;
    let cashPaidForExpenses = 0;
    let purchaseOfEquipment = 0;
    let ownerCapitalInjection = 0;
    let ownerWithdrawals = 0;

    result.rows.forEach(row => {
      const netChange = row.total_debit - row.total_credit;
      
      if (row.account_code === '4001') {
        // Sales Revenue
        cashFromSales += Math.abs(netChange);
      } else if (row.account_code.startsWith('5')) {
        // Expenses
        cashPaidForExpenses += Math.abs(netChange);
      } else if (row.account_code === '1005') {
        // Equipment
        purchaseOfEquipment += Math.abs(netChange);
      } else if (row.account_code === '3001') {
        // Owner Capital
        if (netChange > 0) {
          ownerWithdrawals += netChange;
        } else {
          ownerCapitalInjection += Math.abs(netChange);
        }
      }
    });

    const netCashFromOperating = roundAmount(cashFromSales - cashPaidForExpenses);
    const netCashFromInvesting = roundAmount(-purchaseOfEquipment);
    const netCashFromFinancing = roundAmount(ownerCapitalInjection - ownerWithdrawals);
    const netCashFlow = roundAmount(netCashFromOperating + netCashFromInvesting + netCashFromFinancing);

    // Get beginning cash balance (would need to be calculated from previous period)
    const cashAccount = await AccountModel.findByCode('1001');
    const endingCashBalance = cashAccount?.balance || 0;
    const beginningCashBalance = roundAmount(endingCashBalance - netCashFlow);

    return {
      period: {
        startDate,
        endDate,
      },
      operating: {
        cashFromSales: roundAmount(cashFromSales),
        cashPaidForExpenses: roundAmount(cashPaidForExpenses),
        netCashFromOperating,
      },
      investing: {
        purchaseOfEquipment: roundAmount(purchaseOfEquipment),
        netCashFromInvesting,
      },
      financing: {
        ownerCapitalInjection: roundAmount(ownerCapitalInjection),
        ownerWithdrawals: roundAmount(ownerWithdrawals),
        netCashFromFinancing,
      },
      netCashFlow,
      beginningCashBalance,
      endingCashBalance: roundAmount(endingCashBalance),
      generatedAt: new Date(),
    };
  }
}

export default ReportService;
