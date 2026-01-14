// Transaction model

import { executeQuery, getClient } from '../config/database';
import { Transaction, TransactionStatus } from '../types';
import { v4 as uuidv4 } from 'uuid';

export interface TransactionDetail {
  accountCode: string;
  accountName?: string;
  debit: number;
  credit: number;
}

export interface CreateTransactionData {
  date: Date;
  description: string;
  transactionType: string;
  entries: TransactionDetail[];
  createdBy: string;
}

export class TransactionModel {
  static async findById(id: string): Promise<any | null> {
    const query = `
      SELECT 
        t.id, t.transaction_code as "transactionCode", t.date, t.description, 
        t.amount, t.transaction_type as "transactionType", t.status, 
        t.created_by as "createdBy", t.created_at as "createdAt", 
        t.updated_at as "updatedAt",
        json_agg(
          json_build_object(
            'id', td.id,
            'accountCode', td.account_code,
            'accountName', coa.account_name,
            'debit', td.debit_amount,
            'credit', td.credit_amount
          ) ORDER BY td.id
        ) as entries
      FROM transactions t
      LEFT JOIN transaction_details td ON t.id = td.transaction_id
      LEFT JOIN chart_of_accounts coa ON td.account_code = coa.account_code
      WHERE t.id = $1 AND t.deleted_at IS NULL
      GROUP BY t.id
    `;
    
    const result = await executeQuery(query, [id]);
    return result.rows[0] || null;
  }

  static async findAll(filters?: {
    status?: TransactionStatus;
    startDate?: Date;
    endDate?: Date;
    transactionType?: string;
    page?: number;
    limit?: number;
  }): Promise<{ transactions: any[]; total: number }> {
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const offset = (page - 1) * limit;

    let whereConditions = ['t.deleted_at IS NULL'];
    const params: any[] = [];
    let paramIndex = 1;

    if (filters?.status) {
      whereConditions.push(`t.status = $${paramIndex}`);
      params.push(filters.status);
      paramIndex++;
    }

    if (filters?.startDate) {
      whereConditions.push(`t.date >= $${paramIndex}`);
      params.push(filters.startDate);
      paramIndex++;
    }

    if (filters?.endDate) {
      whereConditions.push(`t.date <= $${paramIndex}`);
      params.push(filters.endDate);
      paramIndex++;
    }

    if (filters?.transactionType) {
      whereConditions.push(`t.transaction_type = $${paramIndex}`);
      params.push(filters.transactionType);
      paramIndex++;
    }

    const whereClause = whereConditions.join(' AND ');

    const query = `
      SELECT 
        t.id, t.transaction_code as "transactionCode", t.date, t.description, 
        t.amount, t.transaction_type as "transactionType", t.status, 
        t.created_by as "createdBy", t.created_at as "createdAt"
      FROM transactions t
      WHERE ${whereClause}
      ORDER BY t.date DESC, t.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const countQuery = `
      SELECT COUNT(*) as total
      FROM transactions t
      WHERE ${whereClause}
    `;

    params.push(limit, offset);

    const [transactionsResult, countResult] = await Promise.all([
      executeQuery(query, params),
      executeQuery(countQuery, params.slice(0, -2)),
    ]);

    return {
      transactions: transactionsResult.rows,
      total: parseInt(countResult.rows[0].total, 10),
    };
  }

  static async create(data: CreateTransactionData): Promise<any> {
    const client = await getClient();
    
    try {
      await client.query('BEGIN');

      // Generate transaction code
      const codeResult = await client.query(
        `SELECT COALESCE(MAX(CAST(SUBSTRING(transaction_code FROM 5) AS INTEGER)), 0) + 1 as next_num
         FROM transactions 
         WHERE transaction_code LIKE 'TRX-%'`
      );
      const nextNum = codeResult.rows[0].next_num;
      const transactionCode = `TRX-${String(nextNum).padStart(6, '0')}`;

      const transactionId = uuidv4();
      
      // Calculate total amount
      const totalDebit = data.entries.reduce((sum, entry) => sum + entry.debit, 0);
      const totalCredit = data.entries.reduce((sum, entry) => sum + entry.credit, 0);
      const amount = Math.max(totalDebit, totalCredit);

      // Validate debit = credit
      if (Math.abs(totalDebit - totalCredit) > 0.01) {
        throw new Error('Debit and credit amounts must be equal');
      }

      // Insert transaction
      const transactionQuery = `
        INSERT INTO transactions (
          id, transaction_code, date, description, amount, 
          transaction_type, status, created_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id, transaction_code as "transactionCode", date, description, 
                  amount, transaction_type as "transactionType", status, 
                  created_by as "createdBy", created_at as "createdAt"
      `;

      const transactionResult = await client.query(transactionQuery, [
        transactionId,
        transactionCode,
        data.date,
        data.description,
        amount,
        data.transactionType,
        TransactionStatus.PENDING,
        data.createdBy,
      ]);

      // Insert transaction details
      for (const entry of data.entries) {
        const detailId = uuidv4();
        const detailQuery = `
          INSERT INTO transaction_details (
            id, transaction_id, account_code, debit_amount, credit_amount
          ) VALUES ($1, $2, $3, $4, $5)
        `;

        await client.query(detailQuery, [
          detailId,
          transactionId,
          entry.accountCode,
          entry.debit,
          entry.credit,
        ]);
      }

      await client.query('COMMIT');
      
      return transactionResult.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async updateStatus(id: string, status: TransactionStatus): Promise<any | null> {
    const query = `
      UPDATE transactions
      SET status = $1, updated_at = NOW()
      WHERE id = $2 AND deleted_at IS NULL
      RETURNING id, transaction_code as "transactionCode", date, description, 
                amount, transaction_type as "transactionType", status, 
                created_by as "createdBy", created_at as "createdAt", updated_at as "updatedAt"
    `;

    const result = await executeQuery(query, [status, id]);
    return result.rows[0] || null;
  }

  static async delete(id: string): Promise<boolean> {
    const query = `
      UPDATE transactions
      SET deleted_at = NOW(), updated_at = NOW()
      WHERE id = $1 AND status != $2 AND deleted_at IS NULL
    `;

    const result = await executeQuery(query, [id, TransactionStatus.POSTED]);
    return result.rowCount ? result.rowCount > 0 : false;
  }
}

export default TransactionModel;
