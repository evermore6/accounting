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

export const USER_ROLES = {
  OWNER: 'owner',
  ADMIN_ACCOUNTING: 'admin_accounting',
  STAFF: 'staff',
  VIEWER: 'viewer'
} as const;

export const APPROVAL_THRESHOLD = 500000;
