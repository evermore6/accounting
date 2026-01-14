import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'burjo_accounting',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres'
});

const chartOfAccounts = [
  // Assets
  { code: '1000', name: 'Cash', type: 'asset', balance: 'debit' },
  { code: '1100', name: 'Bank', type: 'asset', balance: 'debit' },
  { code: '1200', name: 'Inventory', type: 'asset', balance: 'debit' },
  { code: '1300', name: 'Accounts Receivable', type: 'asset', balance: 'debit' },
  { code: '1400', name: 'Prepaid Expense', type: 'asset', balance: 'debit' },
  { code: '1500', name: 'Equipment', type: 'asset', balance: 'debit' },
  { code: '1510', name: 'Accumulated Depreciation', type: 'asset', balance: 'credit' },
  
  // Liabilities
  { code: '2000', name: 'Accounts Payable', type: 'liability', balance: 'credit' },
  { code: '2100', name: 'Wages Payable', type: 'liability', balance: 'credit' },
  { code: '2200', name: 'Utilities Payable', type: 'liability', balance: 'credit' },
  
  // Equity
  { code: '3000', name: 'Owner Capital', type: 'equity', balance: 'credit' },
  { code: '3100', name: 'Owner Drawings', type: 'equity', balance: 'debit' },
  { code: '3200', name: 'Retained Earnings', type: 'equity', balance: 'credit' },
  
  // Revenue
  { code: '4000', name: 'Sales Revenue', type: 'revenue', balance: 'credit' },
  
  // Expenses
  { code: '5000', name: 'Cost of Goods Sold', type: 'expense', balance: 'debit' },
  { code: '5100', name: 'Raw Material Expense', type: 'expense', balance: 'debit' },
  { code: '5200', name: 'Salary Expense', type: 'expense', balance: 'debit' },
  { code: '5300', name: 'Utilities Expense', type: 'expense', balance: 'debit' },
  { code: '5400', name: 'Rent Expense', type: 'expense', balance: 'debit' },
  { code: '5500', name: 'Depreciation Expense', type: 'expense', balance: 'debit' },
  { code: '5600', name: 'Other Operating Expense', type: 'expense', balance: 'debit' }
];

export async function seedChartOfAccounts() {
  const client = await pool.connect();
  
  try {
    console.log('Seeding chart of accounts...');
    
    for (const account of chartOfAccounts) {
      await client.query(
        `INSERT INTO chart_of_accounts (account_code, account_name, account_type, normal_balance)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (account_code) DO NOTHING`,
        [account.code, account.name, account.type, account.balance]
      );
    }
    
    console.log('✓ Chart of accounts seeded successfully!');
  } catch (error) {
    console.error('Seeding chart of accounts failed:', error);
    throw error;
  } finally {
    client.release();
  }
}
