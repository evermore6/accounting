import pool from '../config/database';
import { isBalanced } from '../utils/validators';

export interface JournalEntryData {
  account_id: number;
  entry_type: 'debit' | 'credit';
  amount: number;
}

export interface AutoJournalParams {
  transactionType: string;
  amount: number;
  accountIds?: {
    cash?: number;
    bank?: number;
    inventory?: number;
    accountsReceivable?: number;
    accountsPayable?: number;
    salesRevenue?: number;
    cogs?: number;
    expense?: number;
    ownerCapital?: number;
    ownerDrawings?: number;
  };
}

export const journalService = {
  async createJournalEntries(
    transactionId: number,
    entryDate: string,
    entries: JournalEntryData[],
    description?: string
  ) {
    // Validate balanced entries
    if (!isBalanced(entries)) {
      throw new Error('Journal entries must be balanced');
    }

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      for (const entry of entries) {
        await client.query(
          `INSERT INTO journal_entries (transaction_id, entry_date, account_id, entry_type, amount, description)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [transactionId, entryDate, entry.account_id, entry.entry_type, entry.amount, description]
        );
      }

      await client.query('COMMIT');

      return { success: true, message: 'Journal entries created successfully' };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  async getJournalEntries(filters?: {
    transactionId?: number;
    accountId?: number;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) {
    let query = `
      SELECT 
        je.id,
        je.transaction_id,
        je.entry_date,
        je.account_id,
        coa.account_code,
        coa.account_name,
        je.entry_type,
        je.amount,
        je.description,
        t.reference_number,
        t.transaction_type
      FROM journal_entries je
      JOIN chart_of_accounts coa ON je.account_id = coa.id
      LEFT JOIN transactions t ON je.transaction_id = t.id
      WHERE 1=1
    `;

    const params: any[] = [];
    let paramCount = 1;

    if (filters?.transactionId) {
      query += ` AND je.transaction_id = $${paramCount}`;
      params.push(filters.transactionId);
      paramCount++;
    }

    if (filters?.accountId) {
      query += ` AND je.account_id = $${paramCount}`;
      params.push(filters.accountId);
      paramCount++;
    }

    if (filters?.startDate) {
      query += ` AND je.entry_date >= $${paramCount}`;
      params.push(filters.startDate);
      paramCount++;
    }

    if (filters?.endDate) {
      query += ` AND je.entry_date <= $${paramCount}`;
      params.push(filters.endDate);
      paramCount++;
    }

    query += ' ORDER BY je.entry_date DESC, je.id DESC';

    if (filters?.limit) {
      const offset = ((filters.page || 1) - 1) * filters.limit;
      query += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
      params.push(filters.limit, offset);
    }

    const result = await pool.query(query, params);
    return result.rows;
  },

  async getGeneralLedger(accountId: number, startDate?: string, endDate?: string) {
    let query = `
      SELECT 
        je.entry_date,
        je.entry_type,
        je.amount,
        je.description,
        t.reference_number,
        t.transaction_type
      FROM journal_entries je
      LEFT JOIN transactions t ON je.transaction_id = t.id
      WHERE je.account_id = $1
    `;

    const params: any[] = [accountId];
    let paramCount = 2;

    if (startDate) {
      query += ` AND je.entry_date >= $${paramCount}`;
      params.push(startDate);
      paramCount++;
    }

    if (endDate) {
      query += ` AND je.entry_date <= $${paramCount}`;
      params.push(endDate);
      paramCount++;
    }

    query += ' ORDER BY je.entry_date ASC, je.id ASC';

    const result = await pool.query(query, params);

    // Calculate running balance
    const accountResult = await pool.query(
      'SELECT account_name, normal_balance FROM chart_of_accounts WHERE id = $1',
      [accountId]
    );

    const account = accountResult.rows[0];
    let balance = 0;

    const ledger = result.rows.map(entry => {
      if (account.normal_balance === 'debit') {
        balance += entry.entry_type === 'debit' ? entry.amount : -entry.amount;
      } else {
        balance += entry.entry_type === 'credit' ? entry.amount : -entry.amount;
      }

      return {
        ...entry,
        balance
      };
    });

    return {
      account,
      entries: ledger,
      finalBalance: balance
    };
  },

  async generateAutoJournal(params: AutoJournalParams): Promise<JournalEntryData[]> {
    const { transactionType, amount, accountIds } = params;
    const entries: JournalEntryData[] = [];

    // Get default account IDs if not provided
    const getAccountId = async (code: string): Promise<number> => {
      const result = await pool.query(
        'SELECT id FROM chart_of_accounts WHERE account_code = $1',
        [code]
      );
      return result.rows[0]?.id;
    };

    switch (transactionType) {
      case 'sales_cash':
        entries.push({
          account_id: accountIds?.cash || await getAccountId('1000'),
          entry_type: 'debit',
          amount
        });
        entries.push({
          account_id: accountIds?.salesRevenue || await getAccountId('4000'),
          entry_type: 'credit',
          amount
        });
        break;

      case 'sales_credit':
        entries.push({
          account_id: accountIds?.accountsReceivable || await getAccountId('1300'),
          entry_type: 'debit',
          amount
        });
        entries.push({
          account_id: accountIds?.salesRevenue || await getAccountId('4000'),
          entry_type: 'credit',
          amount
        });
        break;

      case 'purchase_cash':
        entries.push({
          account_id: accountIds?.inventory || await getAccountId('1200'),
          entry_type: 'debit',
          amount
        });
        entries.push({
          account_id: accountIds?.cash || await getAccountId('1000'),
          entry_type: 'credit',
          amount
        });
        break;

      case 'purchase_credit':
        entries.push({
          account_id: accountIds?.inventory || await getAccountId('1200'),
          entry_type: 'debit',
          amount
        });
        entries.push({
          account_id: accountIds?.accountsPayable || await getAccountId('2000'),
          entry_type: 'credit',
          amount
        });
        break;

      case 'inventory_usage':
        entries.push({
          account_id: accountIds?.cogs || await getAccountId('5000'),
          entry_type: 'debit',
          amount
        });
        entries.push({
          account_id: accountIds?.inventory || await getAccountId('1200'),
          entry_type: 'credit',
          amount
        });
        break;

      default:
        throw new Error(`Unknown transaction type: ${transactionType}`);
    }

    return entries;
  }
};
