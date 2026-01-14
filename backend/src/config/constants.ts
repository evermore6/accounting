export const USER_ROLES = {
  OWNER: 'owner',
  ADMIN_ACCOUNTING: 'admin_accounting',
  STAFF: 'staff',
  VIEWER: 'viewer'
} as const;

export const ACCOUNT_TYPES = {
  ASSET: 'asset',
  LIABILITY: 'liability',
  EQUITY: 'equity',
  REVENUE: 'revenue',
  EXPENSE: 'expense'
} as const;

export const TRANSACTION_TYPES = {
  SALES_CASH: 'sales_cash',
  SALES_CREDIT: 'sales_credit',
  PURCHASE_CASH: 'purchase_cash',
  PURCHASE_CREDIT: 'purchase_credit',
  INVENTORY_USAGE: 'inventory_usage',
  OPERATING_EXPENSE: 'operating_expense',
  SALARY_PAYMENT: 'salary_payment',
  OWNER_CAPITAL: 'owner_capital',
  OWNER_WITHDRAWAL: 'owner_withdrawal',
  DEPRECIATION: 'depreciation',
  MANUAL_JOURNAL: 'manual_journal'
} as const;

export const TRANSACTION_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  POSTED: 'posted'
} as const;

export const ENTRY_TYPES = {
  DEBIT: 'debit',
  CREDIT: 'credit'
} as const;

export const AUDIT_ACTIONS = {
  LOGIN: 'login',
  LOGOUT: 'logout',
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  APPROVE: 'approve',
  REJECT: 'reject',
  EXPORT: 'export'
} as const;

export const PERMISSIONS = {
  [USER_ROLES.OWNER]: [
    'view_all_reports',
    'manage_users',
    'approve_high_value',
    'owner_transactions',
    'view_audit_logs',
    'manage_transactions',
    'manage_journals',
    'view_inventory',
    'close_periods'
  ],
  [USER_ROLES.ADMIN_ACCOUNTING]: [
    'manage_transactions',
    'manage_journals',
    'view_reports',
    'approve_low_value',
    'view_inventory',
    'close_periods'
  ],
  [USER_ROLES.STAFF]: [
    'create_sales',
    'create_purchases',
    'view_own_transactions',
    'view_inventory'
  ],
  [USER_ROLES.VIEWER]: [
    'view_reports'
  ]
};
