import { body, param, query, ValidationChain } from 'express-validator';

export const validateLogin = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
];

export const validateTransaction = [
  body('transaction_type').notEmpty().withMessage('Transaction type is required'),
  body('transaction_date').isDate().withMessage('Valid date is required'),
  body('description').optional().isString(),
  body('total_amount').isNumeric().withMessage('Valid amount is required'),
  body('entries').isArray({ min: 2 }).withMessage('At least 2 journal entries required'),
  body('entries.*.account_id').isNumeric(),
  body('entries.*.entry_type').isIn(['debit', 'credit']),
  body('entries.*.amount').isNumeric()
];

export const validateJournalEntry = [
  body('transaction_id').optional().isNumeric(),
  body('entry_date').isDate().withMessage('Valid date is required'),
  body('entries').isArray({ min: 2 }).withMessage('At least 2 journal entries required'),
  body('entries.*.account_id').isNumeric(),
  body('entries.*.entry_type').isIn(['debit', 'credit']),
  body('entries.*.amount').isNumeric()
];

export const validateUser = [
  body('username').notEmpty().isLength({ min: 3 }),
  body('email').isEmail(),
  body('password').optional().isLength({ min: 6 }),
  body('full_name').notEmpty(),
  body('role').isIn(['owner', 'admin_accounting', 'staff', 'viewer'])
];

export const validateIdParam = [
  param('id').isNumeric().withMessage('Valid ID is required')
];

export const validateDateRange = [
  query('start_date').optional().isDate(),
  query('end_date').optional().isDate()
];

export const isBalanced = (entries: Array<{ entry_type: string; amount: number }>): boolean => {
  const debits = entries
    .filter(e => e.entry_type === 'debit')
    .reduce((sum, e) => sum + Number(e.amount), 0);
  
  const credits = entries
    .filter(e => e.entry_type === 'credit')
    .reduce((sum, e) => sum + Number(e.amount), 0);
  
  return Math.abs(debits - credits) < 0.01;
};
