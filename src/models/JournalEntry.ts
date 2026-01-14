// Journal Entry model

import { executeQuery, getClient } from '../config/database';
import { JournalEntry, TransactionStatus } from '../types';
import { v4 as uuidv4 } from 'uuid';

export interface JournalEntryLine {
  accountCode: string;
  accountName?: string;
  debit: number;
  credit: number;
}

export interface CreateJournalData {
  date: Date;
  description: string;
  entries: JournalEntryLine[];
  createdBy: string;
  referenceType?: string;
  referenceId?: string;
}

export class JournalEntryModel {
  static async findById(id: string): Promise<any | null> {
    const query = `
      SELECT 
        j.id, j.entry_number as "entryNumber", j.date, j.description, 
        j.status, j.reference_type as "referenceType", j.reference_id as "referenceId",
        j.created_by as "createdBy", j.created_at as "createdAt", 
        j.updated_at as "updatedAt",
        json_agg(
          json_build_object(
            'id', jl.id,
            'accountCode', jl.account_code,
            'accountName', coa.account_name,
            'debit', jl.debit_amount,
            'credit', jl.credit_amount
          ) ORDER BY jl.id
        ) as lines
      FROM journal_entries j
      LEFT JOIN journal_entry_lines jl ON j.id = jl.journal_entry_id
      LEFT JOIN chart_of_accounts coa ON jl.account_code = coa.account_code
      WHERE j.id = $1 AND j.deleted_at IS NULL
      GROUP BY j.id
    `;
    
    const result = await executeQuery(query, [id]);
    return result.rows[0] || null;
  }

  static async findAll(filters?: {
    status?: TransactionStatus;
    startDate?: Date;
    endDate?: Date;
    accountCode?: string;
    page?: number;
    limit?: number;
  }): Promise<{ journals: any[]; total: number }> {
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const offset = (page - 1) * limit;

    let whereConditions = ['j.deleted_at IS NULL'];
    const params: any[] = [];
    let paramIndex = 1;

    if (filters?.status) {
      whereConditions.push(`j.status = $${paramIndex}`);
      params.push(filters.status);
      paramIndex++;
    }

    if (filters?.startDate) {
      whereConditions.push(`j.date >= $${paramIndex}`);
      params.push(filters.startDate);
      paramIndex++;
    }

    if (filters?.endDate) {
      whereConditions.push(`j.date <= $${paramIndex}`);
      params.push(filters.endDate);
      paramIndex++;
    }

    if (filters?.accountCode) {
      whereConditions.push(`EXISTS (
        SELECT 1 FROM journal_entry_lines jl 
        WHERE jl.journal_entry_id = j.id AND jl.account_code = $${paramIndex}
      )`);
      params.push(filters.accountCode);
      paramIndex++;
    }

    const whereClause = whereConditions.join(' AND ');

    const query = `
      SELECT 
        j.id, j.entry_number as "entryNumber", j.date, j.description, 
        j.status, j.reference_type as "referenceType", 
        j.created_by as "createdBy", j.created_at as "createdAt",
        COALESCE(SUM(jl.debit_amount), 0) as "totalDebit",
        COALESCE(SUM(jl.credit_amount), 0) as "totalCredit"
      FROM journal_entries j
      LEFT JOIN journal_entry_lines jl ON j.id = jl.journal_entry_id
      WHERE ${whereClause}
      GROUP BY j.id
      ORDER BY j.date DESC, j.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const countQuery = `
      SELECT COUNT(*) as total
      FROM journal_entries j
      WHERE ${whereClause}
    `;

    params.push(limit, offset);

    const [journalsResult, countResult] = await Promise.all([
      executeQuery(query, params),
      executeQuery(countQuery, params.slice(0, -2)),
    ]);

    return {
      journals: journalsResult.rows,
      total: parseInt(countResult.rows[0].total, 10),
    };
  }

  static async create(data: CreateJournalData): Promise<any> {
    const client = await getClient();
    
    try {
      await client.query('BEGIN');

      // Generate entry number
      const codeResult = await client.query(
        `SELECT COALESCE(MAX(CAST(SUBSTRING(entry_number FROM 4) AS INTEGER)), 0) + 1 as next_num
         FROM journal_entries 
         WHERE entry_number LIKE 'JE-%'`
      );
      const nextNum = codeResult.rows[0].next_num;
      const entryNumber = `JE-${String(nextNum).padStart(6, '0')}`;

      const journalId = uuidv4();
      
      // Calculate totals
      const totalDebit = data.entries.reduce((sum, entry) => sum + entry.debit, 0);
      const totalCredit = data.entries.reduce((sum, entry) => sum + entry.credit, 0);

      // Validate debit = credit
      if (Math.abs(totalDebit - totalCredit) > 0.01) {
        throw new Error('Debit and credit amounts must be equal');
      }

      // Insert journal entry
      const journalQuery = `
        INSERT INTO journal_entries (
          id, entry_number, date, description, status, created_by,
          reference_type, reference_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id, entry_number as "entryNumber", date, description, 
                  status, created_by as "createdBy", created_at as "createdAt"
      `;

      const journalResult = await client.query(journalQuery, [
        journalId,
        entryNumber,
        data.date,
        data.description,
        TransactionStatus.PENDING,
        data.createdBy,
        data.referenceType || null,
        data.referenceId || null,
      ]);

      // Insert journal entry lines
      for (const entry of data.entries) {
        const lineId = uuidv4();
        const lineQuery = `
          INSERT INTO journal_entry_lines (
            id, journal_entry_id, account_code, debit_amount, credit_amount
          ) VALUES ($1, $2, $3, $4, $5)
        `;

        await client.query(lineQuery, [
          lineId,
          journalId,
          entry.accountCode,
          entry.debit,
          entry.credit,
        ]);
      }

      await client.query('COMMIT');
      
      return journalResult.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async post(id: string): Promise<any | null> {
    const client = await getClient();
    
    try {
      await client.query('BEGIN');

      // Get journal entry with lines
      const journal = await this.findById(id);
      
      if (!journal) {
        throw new Error('Journal entry not found');
      }

      if (journal.status === TransactionStatus.POSTED) {
        throw new Error('Journal entry already posted');
      }

      // Update account balances
      const AccountModel = (await import('./Account')).default;
      
      for (const line of journal.lines) {
        if (line.debit > 0) {
          await AccountModel.updateBalance(line.accountCode, line.debit, true);
        }
        if (line.credit > 0) {
          await AccountModel.updateBalance(line.accountCode, line.credit, false);
        }
      }

      // Update journal status
      const query = `
        UPDATE journal_entries
        SET status = $1, updated_at = NOW()
        WHERE id = $2
        RETURNING id, entry_number as "entryNumber", date, description, 
                  status, created_by as "createdBy", created_at as "createdAt"
      `;

      const result = await client.query(query, [TransactionStatus.POSTED, id]);

      await client.query('COMMIT');
      
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async updateStatus(id: string, status: TransactionStatus): Promise<any | null> {
    const query = `
      UPDATE journal_entries
      SET status = $1, updated_at = NOW()
      WHERE id = $2 AND deleted_at IS NULL
      RETURNING id, entry_number as "entryNumber", date, description, 
                status, created_by as "createdBy", created_at as "createdAt"
    `;

    const result = await executeQuery(query, [status, id]);
    return result.rows[0] || null;
  }

  static async delete(id: string): Promise<boolean> {
    const query = `
      UPDATE journal_entries
      SET deleted_at = NOW(), updated_at = NOW()
      WHERE id = $1 AND status != $2 AND deleted_at IS NULL
    `;

    const result = await executeQuery(query, [id, TransactionStatus.POSTED]);
    return result.rowCount ? result.rowCount > 0 : false;
  }

  static async getTrialBalance(date?: Date): Promise<any[]> {
    const query = `
      SELECT 
        coa.account_code as "accountCode",
        coa.account_name as "accountName",
        coa.account_type as "accountType",
        CASE 
          WHEN coa.balance >= 0 THEN ABS(coa.balance)
          ELSE 0
        END as debit,
        CASE 
          WHEN coa.balance < 0 THEN ABS(coa.balance)
          ELSE 0
        END as credit
      FROM chart_of_accounts coa
      WHERE coa.status = 'active' AND coa.deleted_at IS NULL
      ORDER BY coa.account_code
    `;

    const result = await executeQuery(query);
    return result.rows;
  }
}

export default JournalEntryModel;
