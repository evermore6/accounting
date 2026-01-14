import pool from '../config/database';
import config from '../config/environment';
import { journalService } from './journalService';

export interface TransactionData {
  transaction_type: string;
  transaction_date: string;
  description: string;
  total_amount: number;
  entries?: Array<{
    account_id: number;
    entry_type: 'debit' | 'credit';
    amount: number;
  }>;
  created_by: number;
}

export const accountingEngine = {
  async createTransaction(data: TransactionData) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Determine if approval is required
      const requiresApproval = data.total_amount >= config.app.approvalThreshold;
      const status = requiresApproval ? 'pending' : 'posted';

      // Generate reference number
      const refResult = await client.query(
        `SELECT COUNT(*) as count FROM transactions 
         WHERE transaction_type = $1 AND EXTRACT(YEAR FROM transaction_date) = EXTRACT(YEAR FROM $2::date)`,
        [data.transaction_type, data.transaction_date]
      );

      const count = parseInt(refResult.rows[0].count) + 1;
      const year = new Date(data.transaction_date).getFullYear();
      const typePrefix = data.transaction_type.substring(0, 3).toUpperCase();
      const referenceNumber = `${typePrefix}-${year}-${String(count).padStart(4, '0')}`;

      // Create transaction
      const txResult = await client.query(
        `INSERT INTO transactions 
         (transaction_type, transaction_date, reference_number, description, total_amount, 
          status, requires_approval, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [
          data.transaction_type,
          data.transaction_date,
          referenceNumber,
          data.description,
          data.total_amount,
          status,
          requiresApproval,
          data.created_by
        ]
      );

      const transaction = txResult.rows[0];

      // Create journal entries
      if (data.entries && data.entries.length > 0) {
        for (const entry of data.entries) {
          await client.query(
            `INSERT INTO journal_entries (transaction_id, entry_date, account_id, entry_type, amount, description)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [
              transaction.id,
              data.transaction_date,
              entry.account_id,
              entry.entry_type,
              entry.amount,
              data.description
            ]
          );
        }
      } else {
        // Auto-generate journal entries based on transaction type
        const autoEntries = await journalService.generateAutoJournal({
          transactionType: data.transaction_type,
          amount: data.total_amount
        });

        for (const entry of autoEntries) {
          await client.query(
            `INSERT INTO journal_entries (transaction_id, entry_date, account_id, entry_type, amount, description)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [
              transaction.id,
              data.transaction_date,
              entry.account_id,
              entry.entry_type,
              entry.amount,
              data.description
            ]
          );
        }
      }

      await client.query('COMMIT');
      return transaction;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  async approveTransaction(transactionId: number, approvedBy: number) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const result = await client.query(
        `UPDATE transactions 
         SET status = 'approved', approved_by = $1, approved_at = CURRENT_TIMESTAMP
         WHERE id = $2 AND status = 'pending'
         RETURNING *`,
        [approvedBy, transactionId]
      );

      if (result.rows.length === 0) {
        throw new Error('Transaction not found or already processed');
      }

      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  async rejectTransaction(transactionId: number, approvedBy: number) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const result = await client.query(
        `UPDATE transactions 
         SET status = 'rejected', approved_by = $1, approved_at = CURRENT_TIMESTAMP
         WHERE id = $2 AND status = 'pending'
         RETURNING *`,
        [approvedBy, transactionId]
      );

      if (result.rows.length === 0) {
        throw new Error('Transaction not found or already processed');
      }

      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  async getTransactions(filters?: {
    status?: string;
    type?: string;
    startDate?: string;
    endDate?: string;
    createdBy?: number;
    page?: number;
    limit?: number;
  }) {
    let query = `
      SELECT 
        t.*,
        u.full_name as created_by_name,
        a.full_name as approved_by_name
      FROM transactions t
      LEFT JOIN users u ON t.created_by = u.id
      LEFT JOIN users a ON t.approved_by = a.id
      WHERE 1=1
    `;

    const params: any[] = [];
    let paramCount = 1;

    if (filters?.status) {
      query += ` AND t.status = $${paramCount}`;
      params.push(filters.status);
      paramCount++;
    }

    if (filters?.type) {
      query += ` AND t.transaction_type = $${paramCount}`;
      params.push(filters.type);
      paramCount++;
    }

    if (filters?.startDate) {
      query += ` AND t.transaction_date >= $${paramCount}`;
      params.push(filters.startDate);
      paramCount++;
    }

    if (filters?.endDate) {
      query += ` AND t.transaction_date <= $${paramCount}`;
      params.push(filters.endDate);
      paramCount++;
    }

    if (filters?.createdBy) {
      query += ` AND t.created_by = $${paramCount}`;
      params.push(filters.createdBy);
      paramCount++;
    }

    query += ' ORDER BY t.transaction_date DESC, t.id DESC';

    if (filters?.limit) {
      const offset = ((filters.page || 1) - 1) * filters.limit;
      query += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
      params.push(filters.limit, offset);
    }

    const result = await pool.query(query, params);
    return result.rows;
  }
};
