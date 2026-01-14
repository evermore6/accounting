import pool from '../config/database';
import { calculateBalance } from '../utils/calculations';

export const reportService = {
  async getTrialBalance(asOfDate?: string) {
    const date = asOfDate || new Date().toISOString().split('T')[0];

    const query = `
      SELECT 
        coa.id,
        coa.account_code,
        coa.account_name,
        coa.account_type,
        coa.normal_balance,
        COALESCE(SUM(CASE WHEN je.entry_type = 'debit' THEN je.amount ELSE 0 END), 0) as total_debit,
        COALESCE(SUM(CASE WHEN je.entry_type = 'credit' THEN je.amount ELSE 0 END), 0) as total_credit
      FROM chart_of_accounts coa
      LEFT JOIN journal_entries je ON coa.id = je.account_id AND je.entry_date <= $1
      WHERE coa.is_active = true
      GROUP BY coa.id, coa.account_code, coa.account_name, coa.account_type, coa.normal_balance
      ORDER BY coa.account_code
    `;

    const result = await pool.query(query, [date]);

    const accounts = result.rows.map(row => ({
      ...row,
      balance: calculateBalance(
        parseFloat(row.total_debit),
        parseFloat(row.total_credit),
        row.normal_balance
      )
    }));

    const totalDebits = accounts.reduce((sum, acc) => {
      return sum + (acc.normal_balance === 'debit' && acc.balance > 0 ? acc.balance : 0);
    }, 0);

    const totalCredits = accounts.reduce((sum, acc) => {
      return sum + (acc.normal_balance === 'credit' && acc.balance > 0 ? acc.balance : 0);
    }, 0);

    return {
      asOfDate: date,
      accounts,
      totalDebits,
      totalCredits,
      isBalanced: Math.abs(totalDebits - totalCredits) < 0.01
    };
  },

  async getIncomeStatement(startDate: string, endDate: string) {
    const query = `
      SELECT 
        coa.account_type,
        coa.account_code,
        coa.account_name,
        COALESCE(SUM(CASE WHEN je.entry_type = 'debit' THEN je.amount ELSE 0 END), 0) as total_debit,
        COALESCE(SUM(CASE WHEN je.entry_type = 'credit' THEN je.amount ELSE 0 END), 0) as total_credit
      FROM chart_of_accounts coa
      LEFT JOIN journal_entries je ON coa.id = je.account_id 
        AND je.entry_date >= $1 AND je.entry_date <= $2
      WHERE coa.account_type IN ('revenue', 'expense')
      GROUP BY coa.account_type, coa.account_code, coa.account_name, coa.normal_balance
      ORDER BY coa.account_type, coa.account_code
    `;

    const result = await pool.query(query, [startDate, endDate]);

    const revenues = result.rows
      .filter(row => row.account_type === 'revenue')
      .map(row => ({
        ...row,
        amount: parseFloat(row.total_credit) - parseFloat(row.total_debit)
      }));

    const expenses = result.rows
      .filter(row => row.account_type === 'expense')
      .map(row => ({
        ...row,
        amount: parseFloat(row.total_debit) - parseFloat(row.total_credit)
      }));

    const totalRevenue = revenues.reduce((sum, r) => sum + r.amount, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const netIncome = totalRevenue - totalExpenses;

    return {
      period: { startDate, endDate },
      revenues,
      expenses,
      totalRevenue,
      totalExpenses,
      netIncome
    };
  },

  async getBalanceSheet(asOfDate?: string) {
    const date = asOfDate || new Date().toISOString().split('T')[0];

    const query = `
      SELECT 
        coa.account_type,
        coa.account_code,
        coa.account_name,
        coa.normal_balance,
        COALESCE(SUM(CASE WHEN je.entry_type = 'debit' THEN je.amount ELSE 0 END), 0) as total_debit,
        COALESCE(SUM(CASE WHEN je.entry_type = 'credit' THEN je.amount ELSE 0 END), 0) as total_credit
      FROM chart_of_accounts coa
      LEFT JOIN journal_entries je ON coa.id = je.account_id AND je.entry_date <= $1
      WHERE coa.account_type IN ('asset', 'liability', 'equity')
      GROUP BY coa.account_type, coa.account_code, coa.account_name, coa.normal_balance
      ORDER BY coa.account_type, coa.account_code
    `;

    const result = await pool.query(query, [date]);

    const assets = result.rows
      .filter(row => row.account_type === 'asset')
      .map(row => ({
        ...row,
        amount: calculateBalance(
          parseFloat(row.total_debit),
          parseFloat(row.total_credit),
          row.normal_balance
        )
      }));

    const liabilities = result.rows
      .filter(row => row.account_type === 'liability')
      .map(row => ({
        ...row,
        amount: calculateBalance(
          parseFloat(row.total_debit),
          parseFloat(row.total_credit),
          row.normal_balance
        )
      }));

    const equity = result.rows
      .filter(row => row.account_type === 'equity')
      .map(row => ({
        ...row,
        amount: calculateBalance(
          parseFloat(row.total_debit),
          parseFloat(row.total_credit),
          row.normal_balance
        )
      }));

    const totalAssets = assets.reduce((sum, a) => sum + a.amount, 0);
    const totalLiabilities = liabilities.reduce((sum, l) => sum + l.amount, 0);
    const totalEquity = equity.reduce((sum, e) => sum + e.amount, 0);

    return {
      asOfDate: date,
      assets,
      liabilities,
      equity,
      totalAssets,
      totalLiabilities,
      totalEquity,
      isBalanced: Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 0.01
    };
  },

  async getCashFlowStatement(startDate: string, endDate: string) {
    // Simplified cash flow statement based on cash account movements
    const query = `
      SELECT 
        je.entry_date,
        je.entry_type,
        je.amount,
        je.description,
        t.transaction_type,
        t.reference_number
      FROM journal_entries je
      JOIN chart_of_accounts coa ON je.account_id = coa.id
      LEFT JOIN transactions t ON je.transaction_id = t.id
      WHERE coa.account_code = '1000' -- Cash account
        AND je.entry_date >= $1 AND je.entry_date <= $2
      ORDER BY je.entry_date
    `;

    const result = await pool.query(query, [startDate, endDate]);

    const operating: any[] = [];
    const investing: any[] = [];
    const financing: any[] = [];

    result.rows.forEach(row => {
      const amount = row.entry_type === 'debit' ? parseFloat(row.amount) : -parseFloat(row.amount);
      const item = { ...row, amount };

      if (['sales_cash', 'purchase_cash', 'operating_expense', 'salary_payment', 'inventory_usage'].includes(row.transaction_type)) {
        operating.push(item);
      } else if (['depreciation'].includes(row.transaction_type)) {
        investing.push(item);
      } else if (['owner_capital', 'owner_withdrawal'].includes(row.transaction_type)) {
        financing.push(item);
      } else {
        operating.push(item);
      }
    });

    const operatingCashFlow = operating.reduce((sum, item) => sum + item.amount, 0);
    const investingCashFlow = investing.reduce((sum, item) => sum + item.amount, 0);
    const financingCashFlow = financing.reduce((sum, item) => sum + item.amount, 0);

    return {
      period: { startDate, endDate },
      operating,
      investing,
      financing,
      operatingCashFlow,
      investingCashFlow,
      financingCashFlow,
      netCashFlow: operatingCashFlow + investingCashFlow + financingCashFlow
    };
  }
};
