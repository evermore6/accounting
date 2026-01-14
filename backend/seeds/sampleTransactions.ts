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

export async function seedTransactions() {
  const client = await pool.connect();
  
  try {
    console.log('Seeding sample transactions...');
    
    // Get account IDs
    const accounts = await client.query('SELECT id, account_code FROM chart_of_accounts');
    const accountMap = new Map(accounts.rows.map(a => [a.account_code, a.id]));
    
    // Get first user (Pak Budi)
    const userResult = await client.query('SELECT id FROM users WHERE username = $1', ['pakbudi']);
    const userId = userResult.rows[0]?.id || 1;
    
    const sampleTransactions = [
      {
        type: 'sales_cash',
        date: '2024-01-15',
        ref: 'SAL-001',
        description: 'Cash sales - Gado-gado and nasi kuning',
        amount: 150000,
        entries: [
          { account: '1000', type: 'debit', amount: 150000 },
          { account: '4000', type: 'credit', amount: 150000 }
        ]
      },
      {
        type: 'purchase_credit',
        date: '2024-01-15',
        ref: 'PUR-001',
        description: 'Credit purchase from Supplier Sumber Rejeki',
        amount: 200000,
        entries: [
          { account: '1200', type: 'debit', amount: 200000 },
          { account: '2000', type: 'credit', amount: 200000 }
        ]
      },
      {
        type: 'operating_expense',
        date: '2024-01-16',
        ref: 'EXP-001',
        description: 'Utilities payment - Electricity',
        amount: 50000,
        entries: [
          { account: '5300', type: 'debit', amount: 50000 },
          { account: '1000', type: 'credit', amount: 50000 }
        ]
      },
      {
        type: 'sales_cash',
        date: '2024-01-17',
        ref: 'SAL-002',
        description: 'Cash sales - Mixed menu',
        amount: 300000,
        entries: [
          { account: '1000', type: 'debit', amount: 300000 },
          { account: '4000', type: 'credit', amount: 300000 }
        ]
      },
      {
        type: 'salary_payment',
        date: '2024-01-20',
        ref: 'SAL-003',
        description: 'Salary payment for cashier',
        amount: 500000,
        requiresApproval: true,
        entries: [
          { account: '5200', type: 'debit', amount: 500000 },
          { account: '1000', type: 'credit', amount: 500000 }
        ]
      },
      {
        type: 'owner_capital',
        date: '2024-01-01',
        ref: 'CAP-001',
        description: 'Owner capital injection',
        amount: 1000000,
        requiresApproval: true,
        entries: [
          { account: '1000', type: 'debit', amount: 1000000 },
          { account: '3000', type: 'credit', amount: 1000000 }
        ]
      },
      {
        type: 'purchase_cash',
        date: '2024-01-18',
        ref: 'PUR-002',
        description: 'Cash purchase of supplies',
        amount: 75000,
        entries: [
          { account: '1200', type: 'debit', amount: 75000 },
          { account: '1000', type: 'credit', amount: 75000 }
        ]
      },
      {
        type: 'sales_credit',
        date: '2024-01-19',
        ref: 'SAL-004',
        description: 'Credit sales - Catering for office',
        amount: 250000,
        entries: [
          { account: '1300', type: 'debit', amount: 250000 },
          { account: '4000', type: 'credit', amount: 250000 }
        ]
      },
      {
        type: 'owner_withdrawal',
        date: '2024-01-22',
        ref: 'WDR-001',
        description: 'Owner withdrawal',
        amount: 200000,
        entries: [
          { account: '3100', type: 'debit', amount: 200000 },
          { account: '1000', type: 'credit', amount: 200000 }
        ]
      },
      {
        type: 'depreciation',
        date: '2024-01-31',
        ref: 'DEP-001',
        description: 'Monthly depreciation on equipment',
        amount: 100000,
        entries: [
          { account: '5500', type: 'debit', amount: 100000 },
          { account: '1510', type: 'credit', amount: 100000 }
        ]
      },
      {
        type: 'operating_expense',
        date: '2024-01-01',
        ref: 'EXP-002',
        description: 'Monthly rent payment',
        amount: 2000000,
        requiresApproval: true,
        entries: [
          { account: '5400', type: 'debit', amount: 2000000 },
          { account: '1000', type: 'credit', amount: 2000000 }
        ]
      },
      {
        type: 'inventory_usage',
        date: '2024-01-21',
        ref: 'USE-001',
        description: 'Raw material usage for COGS',
        amount: 180000,
        entries: [
          { account: '5000', type: 'debit', amount: 180000 },
          { account: '1200', type: 'credit', amount: 180000 }
        ]
      }
    ];
    
    for (const tx of sampleTransactions) {
      const requiresApproval = tx.requiresApproval || tx.amount >= 500000;
      const status = requiresApproval ? 'pending' : 'posted';
      
      // Insert transaction
      const txResult = await client.query(
        `INSERT INTO transactions 
         (transaction_type, transaction_date, reference_number, description, total_amount, 
          status, requires_approval, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING id`,
        [tx.type, tx.date, tx.ref, tx.description, tx.amount, status, requiresApproval, userId]
      );
      
      const transactionId = txResult.rows[0].id;
      
      // Insert journal entries
      for (const entry of tx.entries) {
        await client.query(
          `INSERT INTO journal_entries 
           (transaction_id, entry_date, account_id, entry_type, amount, description)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            transactionId,
            tx.date,
            accountMap.get(entry.account),
            entry.type,
            entry.amount,
            tx.description
          ]
        );
      }
    }
    
    console.log('✓ Sample transactions seeded successfully!');
  } catch (error) {
    console.error('Seeding transactions failed:', error);
    throw error;
  } finally {
    client.release();
  }
}
