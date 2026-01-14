-- Migration 003: Create transactions tables

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY,
    transaction_code VARCHAR(50) UNIQUE NOT NULL,
    date DATE NOT NULL,
    description TEXT NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    transaction_type VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('draft', 'pending', 'approved', 'rejected', 'posted')),
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP
);

-- Create transaction_details table
CREATE TABLE IF NOT EXISTS transaction_details (
    id UUID PRIMARY KEY,
    transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    account_code VARCHAR(10) NOT NULL REFERENCES chart_of_accounts(account_code),
    debit_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
    credit_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_debit_credit CHECK (debit_amount >= 0 AND credit_amount >= 0),
    CONSTRAINT chk_not_both_zero CHECK (debit_amount > 0 OR credit_amount > 0)
);

-- Create indexes
CREATE INDEX idx_transactions_code ON transactions(transaction_code) WHERE deleted_at IS NULL;
CREATE INDEX idx_transactions_date ON transactions(date) WHERE deleted_at IS NULL;
CREATE INDEX idx_transactions_status ON transactions(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_transactions_type ON transactions(transaction_type) WHERE deleted_at IS NULL;
CREATE INDEX idx_transaction_details_transaction ON transaction_details(transaction_id);
CREATE INDEX idx_transaction_details_account ON transaction_details(account_code);

-- Add comments
COMMENT ON TABLE transactions IS 'Transaction header records';
COMMENT ON TABLE transaction_details IS 'Transaction line items - individual account entries';
COMMENT ON COLUMN transactions.status IS 'Transaction status: draft, pending, approved, rejected, posted';
