// Business Constants for Burjo Accounting System

export const BUSINESS_CONSTANTS = {
  // Currency
  DEFAULT_CURRENCY: 'IDR',
  CURRENCY_SYMBOL: 'Rp',
  
  // Decimal places
  DECIMAL_PLACES: 2,
  
  // Transaction limits
  MAX_TRANSACTION_AMOUNT: 1000000000, // 1 billion
  MIN_TRANSACTION_AMOUNT: 0,
  
  // Account codes
  ACCOUNT_CODE_LENGTH: 4,
  
  // Inventory
  INVENTORY_METHOD: 'FIFO', // First In First Out
  
  // Reports
  DEFAULT_FISCAL_YEAR_START: '01-01', // January 1st
  
  // Pagination
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
};

export const ACCOUNT_CODES = {
  // Assets (1xxx)
  CASH: '1001',
  BANK: '1002',
  ACCOUNTS_RECEIVABLE: '1003',
  INVENTORY: '1004',
  EQUIPMENT: '1005',
  ACCUMULATED_DEPRECIATION: '1006',
  
  // Liabilities (2xxx)
  ACCOUNTS_PAYABLE: '2001',
  WAGES_PAYABLE: '2002',
  
  // Equity (3xxx)
  OWNER_CAPITAL: '3001',
  RETAINED_EARNINGS: '3002',
  
  // Revenue (4xxx)
  SALES_REVENUE: '4001',
  
  // Expenses (5xxx)
  COST_OF_GOODS_SOLD: '5001',
  RAW_MATERIAL_EXPENSE: '5002',
  SALARY_EXPENSE: '5003',
  UTILITIES_EXPENSE: '5004',
  RENT_EXPENSE: '5005',
  DEPRECIATION_EXPENSE: '5006',
};

export const ERROR_MESSAGES = {
  // Authentication
  INVALID_CREDENTIALS: 'Invalid email or password',
  UNAUTHORIZED: 'Unauthorized access',
  TOKEN_EXPIRED: 'Token has expired',
  TOKEN_INVALID: 'Invalid token',
  
  // Validation
  REQUIRED_FIELD: 'This field is required',
  INVALID_EMAIL: 'Invalid email format',
  INVALID_AMOUNT: 'Invalid amount',
  DEBIT_CREDIT_MISMATCH: 'Debit and credit amounts must be equal',
  
  // Database
  RECORD_NOT_FOUND: 'Record not found',
  DUPLICATE_ENTRY: 'Duplicate entry',
  DATABASE_ERROR: 'Database error occurred',
  
  // Business logic
  INSUFFICIENT_BALANCE: 'Insufficient account balance',
  INVALID_ACCOUNT_TYPE: 'Invalid account type',
  TRANSACTION_ALREADY_POSTED: 'Transaction already posted',
};

export const SUCCESS_MESSAGES = {
  // Authentication
  LOGIN_SUCCESS: 'Login successful',
  LOGOUT_SUCCESS: 'Logout successful',
  
  // CRUD operations
  CREATE_SUCCESS: 'Record created successfully',
  UPDATE_SUCCESS: 'Record updated successfully',
  DELETE_SUCCESS: 'Record deleted successfully',
  
  // Transactions
  TRANSACTION_POSTED: 'Transaction posted successfully',
  JOURNAL_CREATED: 'Journal entry created successfully',
};

export default {
  BUSINESS_CONSTANTS,
  ACCOUNT_CODES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
};
