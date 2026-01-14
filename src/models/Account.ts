// Account model (Chart of Accounts)

import { executeQuery } from '../config/database';
import { Account, AccountType, AccountStatus } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class AccountModel {
  static async findById(id: string): Promise<Account | null> {
    const query = `
      SELECT id, account_code as "accountCode", account_name as "accountName", 
             account_type as "accountType", status, balance, currency,
             created_at as "createdAt", updated_at as "updatedAt"
      FROM chart_of_accounts
      WHERE id = $1 AND deleted_at IS NULL
    `;
    
    const result = await executeQuery(query, [id]);
    return result.rows[0] || null;
  }

  static async findByCode(accountCode: string): Promise<Account | null> {
    const query = `
      SELECT id, account_code as "accountCode", account_name as "accountName", 
             account_type as "accountType", status, balance, currency,
             created_at as "createdAt", updated_at as "updatedAt"
      FROM chart_of_accounts
      WHERE account_code = $1 AND deleted_at IS NULL
    `;
    
    const result = await executeQuery(query, [accountCode]);
    return result.rows[0] || null;
  }

  static async findAll(filters?: {
    accountType?: AccountType;
    status?: AccountStatus;
  }): Promise<Account[]> {
    let whereConditions = ['deleted_at IS NULL'];
    const params: any[] = [];
    let paramIndex = 1;

    if (filters?.accountType) {
      whereConditions.push(`account_type = $${paramIndex}`);
      params.push(filters.accountType);
      paramIndex++;
    }

    if (filters?.status) {
      whereConditions.push(`status = $${paramIndex}`);
      params.push(filters.status);
      paramIndex++;
    }

    const whereClause = whereConditions.join(' AND ');

    const query = `
      SELECT id, account_code as "accountCode", account_name as "accountName", 
             account_type as "accountType", status, balance, currency,
             created_at as "createdAt", updated_at as "updatedAt"
      FROM chart_of_accounts
      WHERE ${whereClause}
      ORDER BY account_code ASC
    `;

    const result = await executeQuery(query, params);
    return result.rows;
  }

  static async create(accountData: {
    accountCode: string;
    accountName: string;
    accountType: AccountType;
    currency?: string;
  }): Promise<Account> {
    const id = uuidv4();

    const query = `
      INSERT INTO chart_of_accounts (
        id, account_code, account_name, account_type, status, balance, currency
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, account_code as "accountCode", account_name as "accountName", 
                account_type as "accountType", status, balance, currency,
                created_at as "createdAt", updated_at as "updatedAt"
    `;

    const result = await executeQuery(query, [
      id,
      accountData.accountCode,
      accountData.accountName,
      accountData.accountType,
      AccountStatus.ACTIVE,
      0,
      accountData.currency || 'IDR',
    ]);

    return result.rows[0];
  }

  static async updateBalance(accountCode: string, amount: number, isDebit: boolean): Promise<void> {
    const account = await this.findByCode(accountCode);
    if (!account) {
      throw new Error(`Account ${accountCode} not found`);
    }

    let newBalance = account.balance;

    // Calculate new balance based on account type
    const accountType = account.accountType;
    
    if (isDebit) {
      // Debit increases: Assets, Expenses
      // Debit decreases: Liabilities, Equity, Revenue
      if (accountType === AccountType.ASSET || accountType === AccountType.EXPENSE) {
        newBalance += amount;
      } else {
        newBalance -= amount;
      }
    } else {
      // Credit increases: Liabilities, Equity, Revenue
      // Credit decreases: Assets, Expenses
      if (accountType === AccountType.LIABILITY || accountType === AccountType.EQUITY || accountType === AccountType.REVENUE) {
        newBalance += amount;
      } else {
        newBalance -= amount;
      }
    }

    const query = `
      UPDATE chart_of_accounts
      SET balance = $1, updated_at = NOW()
      WHERE account_code = $2 AND deleted_at IS NULL
    `;

    await executeQuery(query, [newBalance, accountCode]);
  }

  static async getBalanceByType(accountType: AccountType): Promise<number> {
    const query = `
      SELECT COALESCE(SUM(balance), 0) as total
      FROM chart_of_accounts
      WHERE account_type = $1 AND status = $2 AND deleted_at IS NULL
    `;

    const result = await executeQuery(query, [accountType, AccountStatus.ACTIVE]);
    return parseFloat(result.rows[0].total) || 0;
  }

  static async update(
    id: string,
    updates: Partial<{
      accountName: string;
      status: AccountStatus;
    }>
  ): Promise<Account | null> {
    const fields: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (updates.accountName !== undefined) {
      fields.push(`account_name = $${paramIndex}`);
      params.push(updates.accountName);
      paramIndex++;
    }

    if (updates.status !== undefined) {
      fields.push(`status = $${paramIndex}`);
      params.push(updates.status);
      paramIndex++;
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    fields.push(`updated_at = NOW()`);
    params.push(id);

    const query = `
      UPDATE chart_of_accounts
      SET ${fields.join(', ')}
      WHERE id = $${paramIndex} AND deleted_at IS NULL
      RETURNING id, account_code as "accountCode", account_name as "accountName", 
                account_type as "accountType", status, balance, currency,
                created_at as "createdAt", updated_at as "updatedAt"
    `;

    const result = await executeQuery(query, params);
    return result.rows[0] || null;
  }
}

export default AccountModel;
