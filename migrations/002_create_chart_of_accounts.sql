-- Migration 002: Create chart of accounts table

-- Create chart_of_accounts table
CREATE TABLE IF NOT EXISTS chart_of_accounts (
    id UUID PRIMARY KEY,
    account_code VARCHAR(10) UNIQUE NOT NULL,
    account_name VARCHAR(255) NOT NULL,
    account_type VARCHAR(50) NOT NULL CHECK (account_type IN ('asset', 'liability', 'equity', 'revenue', 'expense')),
    status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    balance DECIMAL(15, 2) NOT NULL DEFAULT 0,
    currency VARCHAR(3) NOT NULL DEFAULT 'IDR',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_accounts_code ON chart_of_accounts(account_code) WHERE deleted_at IS NULL;
CREATE INDEX idx_accounts_type ON chart_of_accounts(account_type) WHERE deleted_at IS NULL;
CREATE INDEX idx_accounts_status ON chart_of_accounts(status) WHERE deleted_at IS NULL;

-- Add comments
COMMENT ON TABLE chart_of_accounts IS 'Chart of accounts - master list of all accounts';
COMMENT ON COLUMN chart_of_accounts.account_type IS 'Account type: asset, liability, equity, revenue, expense';
COMMENT ON COLUMN chart_of_accounts.balance IS 'Current account balance';
