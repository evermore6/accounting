-- 003_create_transactions.sql
-- Create transactions table for all business transactions

CREATE TYPE transaction_type AS ENUM (
  'sales_cash',
  'sales_credit',
  'purchase_cash',
  'purchase_credit',
  'inventory_usage',
  'operating_expense',
  'salary_payment',
  'owner_capital',
  'owner_withdrawal',
  'depreciation',
  'manual_journal'
);

CREATE TYPE transaction_status AS ENUM ('pending', 'approved', 'rejected', 'posted');

CREATE TABLE transactions (
  id SERIAL PRIMARY KEY,
  transaction_type transaction_type NOT NULL,
  transaction_date DATE NOT NULL,
  reference_number VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  total_amount DECIMAL(15, 2) NOT NULL,
  status transaction_status DEFAULT 'pending',
  requires_approval BOOLEAN DEFAULT false,
  approved_by INTEGER REFERENCES users(id),
  approved_at TIMESTAMP,
  created_by INTEGER REFERENCES users(id) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_transactions_date ON transactions(transaction_date);
CREATE INDEX idx_transactions_type ON transactions(transaction_type);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_reference ON transactions(reference_number);
